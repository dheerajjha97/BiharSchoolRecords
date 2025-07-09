
import { db, firebaseError } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  getCountFromServer,
  where,
  onSnapshot,
  type Unsubscribe,
  doc,
  getDoc,
  Timestamp,
  QueryConstraint,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import type { FormValues } from './form-schema';

/**
 * Recursively sanitizes an object to be compatible with Firestore.
 * - Removes properties with `undefined` values from objects.
 * - Converts `undefined` values inside arrays to `null`.
 * This is crucial because Firestore does not support `undefined` values.
 *
 * @param data The object or value to sanitize.
 * @returns The sanitized object or value, ready for Firestore.
 */
const sanitizeForFirestore = (data: any): any => {
  if (data instanceof Date || data instanceof Timestamp) {
    return data;
  }

  if (Array.isArray(data)) {
    // For arrays, recursively sanitize each item.
    // If an item is undefined, it must be mapped to null.
    return data.map(item => (item === undefined ? null : sanitizeForFirestore(item)));
  }
  
  if (data !== null && typeof data === 'object') {
    // It's a plain object. Create a new object, copying only non-undefined values.
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // If the value is not undefined, process it recursively.
        if (value !== undefined) {
          sanitizedObject[key] = sanitizeForFirestore(value);
        }
        // If value is undefined, it is simply skipped, effectively removing it.
      }
    }
    return sanitizedObject;
  }

  // For primitives and null, return them directly.
  return data;
};

// Helper to convert Firestore Timestamps to JS Dates in nested objects when reading data
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }

  if (data instanceof Timestamp) {
    return data.toDate();
  }

  if (typeof data === 'object' && data !== null) {
    const res: { [key: string]: any } = {};
    for (const key in data) {
        res[key] = convertTimestamps(data[key]);
    }
    return res;
  }
  
  return data;
};

/**
 * Adds a new admission record to the Firestore database.
 * @param data The form data for the new admission. The UDISE code MUST be present in data.admissionDetails.udise
 * @returns The ID of the newly created document.
 */
export const addAdmission = async (data: FormValues): Promise<string> => {
  if (!db) {
    throw new Error(firebaseError || "Database not available. Submission failed.");
  }
  try {
    if (!data.admissionDetails?.udise) {
        throw new Error("UDISE code is missing from the admission data.");
    }
    const sanitizedData = sanitizeForFirestore(data);
    const docRef = await addDoc(collection(db, 'admissions'), sanitizedData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document to Firestore: ", e);
    // Provide a more detailed error message for easier debugging.
    let errorMessage = "Failed to save admission data.";
    if (e instanceof Error) {
        errorMessage += ` Reason: ${e.message}`;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Approves a pending admission, generating admission/roll numbers and updating the status.
 * @param id The document ID of the admission record.
 * @param udise The UDISE code of the school.
 * @param classSelection The class of the student.
 * @param admissionDate The date of admission set by the admin.
 */
export const approveAdmission = async (id: string, udise: string, classSelection: string, admissionDate: Date): Promise<void> => {
    if (!db) { throw new Error(firebaseError || "Database not available."); }
    
    try {
        const docRef = doc(db, "admissions", id);

        // Get counts to generate new numbers, now counting all approved (non-pending) students
        const approvedInClassCount = await getClassAdmissionCount(udise, classSelection);
        const totalApprovedCount = await getAdmissionCount(udise);
        
        // Generate numbers
        const rollNumber = String(approvedInClassCount + 1);
        const year = new Date().getFullYear().toString().slice(-2);
        const nextId = (totalApprovedCount + 1).toString().padStart(4, '0');
        // Use the full UDISE to guarantee uniqueness across schools
        const admissionNumber = `ADM/${udise}/${year}/${nextId}`;

        // Update document
        await updateDoc(docRef, {
            'admissionDetails.status': 'approved',
            'admissionDetails.admissionDate': admissionDate,
            'admissionDetails.rollNumber': rollNumber,
            'admissionDetails.admissionNumber': admissionNumber,
        });

    } catch (e) {
        console.error("Error approving admission:", e);
        let errorMessage = "Failed to approve admission.";
        if (e instanceof Error) {
            errorMessage += ` Reason: ${e.message}`;
        }
        throw new Error(errorMessage);
    }
};


/**
 * Listens for real-time updates to the admissions collection for a specific school.
 * This function sorts data client-side to avoid needing composite indexes in Firestore.
 * @param udise The UDISE code of the school.
 * @param callback The function to call with the updated admissions list.
 * @param options Optional parameters to filter the results, e.g., by count or status.
 * @returns An Unsubscribe function to stop listening for updates.
 */
export const listenToAdmissions = (
    udise: string | undefined, 
    callback: (admissions: (FormValues & { id: string })[]) => void, 
    options?: { count?: number; status?: 'approved' | 'pending' }
): Unsubscribe => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot listen to admissions.");
        callback([]);
        return () => {}; // Return a no-op unsubscribe function
    }
    
    const status = options?.status;
    
    const constraints: QueryConstraint[] = [
        where('admissionDetails.udise', '==', udise),
    ];
    
    if (status === 'pending') {
        constraints.push(where('admissionDetails.status', '==', 'pending'));
    }

    const q = query(collection(db, 'admissions'), ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let admissions: (FormValues & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            admissions.push({ id: doc.id, ...convertTimestamps(doc.data()) } as FormValues & { id: string });
        });
        
        if (status === 'approved') {
            // A student is considered approved if their status is NOT 'pending'.
            // This includes old records without a status field and new records with status 'approved'.
            admissions = admissions.filter(s => s.admissionDetails.status !== 'pending');
        }

        // Sort the data on the client-side
        const sortField: 'submittedAt' | 'admissionDate' = status === 'pending' ? 'submittedAt' : 'admissionDate';
        admissions.sort((a, b) => {
            const dateA = a.admissionDetails?.[sortField] as Date | undefined;
            const dateB = b.admissionDetails?.[sortField] as Date | undefined;
            
            const aHasDate = dateA && dateA instanceof Date && !isNaN(dateA.getTime());
            const bHasDate = dateB && dateB instanceof Date && !isNaN(dateB.getTime());

            if (aHasDate && !bHasDate) return -1;
            if (!aHasDate && bHasDate) return 1;
            
            if (aHasDate && bHasDate) {
                 return (dateB as Date).getTime() - (dateA as Date).getTime();
            }
            
            // Fallback sort if dates are not present
            return (a.studentDetails?.nameEn || '').localeCompare(b.studentDetails?.nameEn || '');
        });
        
        // Apply limit on the client-side
        const finalAdmissions = options?.count ? admissions.slice(0, options.count) : admissions;

        callback(finalAdmissions);
    }, (error) => {
        console.error(`Error listening to admissions:`, error);
        callback([]); // Pass empty array on error
    });

    return unsubscribe;
};

/**
 * Gets the total count of all approved (non-pending) admission documents for a school.
 * @param udise The UDISE code of the school.
 * @returns A promise that resolves to the total number of approved admissions.
 */
export const getAdmissionCount = async (udise: string): Promise<number> => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot get admission count.");
        return 0;
    }
    try {
        const q = query(collection(db, 'admissions'), where('admissionDetails.udise', '==', udise));
        const snapshot = await getDocs(q);
        
        const approvedCount = snapshot.docs.filter(doc => {
            const data = doc.data() as FormValues;
            return data.admissionDetails?.status !== 'pending';
        }).length;

        return approvedCount;

    } catch (e) {
        console.error("Error getting admission count:", e);
        return 0;
    }
}

/**
 * Gets the count of approved (non-pending) admissions for a specific class in a school.
 * @param udise The UDISE code of the school.
 * @param classSelection The class to filter by (e.g., '9', '11-arts').
 * @returns A promise that resolves to the number of approved admissions in that class.
 */
export const getClassAdmissionCount = async (udise: string, classSelection: string): Promise<number> => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot get class admission count.");
        return 0;
    }
    try {
        const q = query(collection(db, 'admissions'), 
            where('admissionDetails.udise', '==', udise),
            where('admissionDetails.classSelection', '==', classSelection)
        );
        const snapshot = await getDocs(q);

        const approvedInClassCount = snapshot.docs.filter(doc => {
            const data = doc.data() as FormValues;
            return data.admissionDetails?.status !== 'pending';
        }).length;
        
        return approvedInClassCount;
    } catch(e) {
        console.error("Error getting class admission count:", e);
        return 0;
    }
}

/**
 * Fetches a single admission document by its ID.
 * @param id The document ID of the admission record.
 * @returns A promise that resolves to the admission data, or null if not found.
 */
export const getAdmissionById = async (id: string): Promise<FormValues | null> => {
  if (!db) {
    console.warn(firebaseError || "Database not available. Cannot get admission by ID.");
    return null;
  }
  try {
    const docRef = doc(db, "admissions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertTimestamps(docSnap.data()) as FormValues;
    } else {
      console.warn(`No admission record found for ID: ${id}`);
      return null;
    }
  } catch (e) {
    console.error(`Error fetching document with ID ${id}:`, e);
    return null;
  }
};
