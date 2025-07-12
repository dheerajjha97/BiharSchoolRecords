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

    // Ensure submittedAt is set before sanitizing
    const dataWithTimestamp = {
      ...data,
      admissionDetails: {
        ...data.admissionDetails,
        submittedAt: data.admissionDetails.submittedAt || new Date(),
      }
    };

    const sanitizedData = sanitizeForFirestore(dataWithTimestamp);
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
 * Updates an existing admission record in Firestore.
 * @param id The document ID of the admission to update.
 * @param data The updated form data.
 */
export const updateAdmission = async (id: string, data: FormValues): Promise<void> => {
  if (!db) {
    throw new Error(firebaseError || "Database not available. Update failed.");
  }
  try {
    const docRef = doc(db, 'admissions', id);
    const sanitizedData = sanitizeForFirestore(data);
    await updateDoc(docRef, sanitizedData);
  } catch (e) {
    console.error(`Error updating document ${id} in Firestore:`, e);
    let errorMessage = "Failed to update admission data.";
    if (e instanceof Error) {
        errorMessage += ` Reason: ${e.message}`;
    }
    throw new Error(errorMessage);
  }
};


/**
 * Gets the count of approved admissions for a specific school.
 * If a year is provided, the count is filtered for that year.
 * This function queries all school documents and filters client-side to avoid composite indexes.
 * @param udise The UDISE code of the school.
 * @param year Optional. The calendar year to count admissions for.
 * @returns A promise that resolves to the number of approved admissions.
 */
const getSchoolAdmissionCount = async (udise: string, year?: number): Promise<number> => {
    if (!db) {
        console.warn(firebaseError || "Database not available. Cannot get admission count.");
        return 0;
    }
    try {
        const q = query(collection(db, "admissions"), 
            where('admissionDetails.udise', '==', udise),
            where('admissionDetails.status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        
        const approvedDocs = snapshot.docs.map(doc => convertTimestamps(doc.data()) as FormValues);

        if (year) {
            // If a year is provided, filter the approved documents by that year.
            const yearlyCount = approvedDocs.filter(data => {
                const admissionDate = data.admissionDetails?.admissionDate;
                // Check if admissionDate is a valid date
                if (admissionDate && admissionDate instanceof Date && !isNaN(admissionDate.getTime())) {
                    return admissionDate.getFullYear() === year;
                }
                return false;
            }).length;
            return yearlyCount;
        }

        return approvedDocs.length;
    } catch (e) {
        console.error("Error getting school admission count:", e);
        return 0;
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

        const admissionYear = admissionDate.getFullYear();
        const year = admissionYear.toString().slice(-2);

        // Get counts to generate new numbers
        const totalApprovedInSchoolCountForYear = await getSchoolAdmissionCount(udise, admissionYear); // For school-specific admission number, count only for the current year.
        const approvedInClassCount = await getClassAdmissionCount(udise, classSelection); // For school/class-specific roll number
        
        // Generate numbers
        const rollNumber = String(approvedInClassCount + 1);
        
        // The serial number restarts every year for each school.
        const nextId = (totalApprovedInSchoolCountForYear + 1).toString().padStart(4, '0');
        const admissionNumber = `ADM/${year}/${nextId}`;

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
 * Rejects a pending admission by updating its status.
 * @param id The document ID of the admission record.
 */
export const rejectAdmission = async (id: string): Promise<void> => {
    if (!db) { throw new Error(firebaseError || "Database not available."); }

    try {
        const docRef = doc(db, "admissions", id);
        await updateDoc(docRef, {
            'admissionDetails.status': 'rejected'
        });
    } catch (e) {
        console.error("Error rejecting admission:", e);
        let errorMessage = "Failed to reject admission.";
        if (e instanceof Error) {
            errorMessage += ` Reason: ${e.message}`;
        }
        throw new Error(errorMessage);
    }
}


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
    options?: { count?: number; status?: 'approved' | 'pending' | 'rejected' }
): Unsubscribe => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot listen to admissions.");
        callback([]);
        return () => {}; // Return a no-op unsubscribe function
    }
    
    const status = options?.status;
    
    // Base query for the school
    const constraints: QueryConstraint[] = [
        where('admissionDetails.udise', '==', udise),
    ];
    
    // We can filter by status directly in the query as it's efficient.
    if (status) {
        constraints.push(where('admissionDetails.status', '==', status));
    }
    
    const q = query(collection(db, 'admissions'), ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let students = querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as FormValues & { id: string }));
        
        // Sort the data on the client-side
        const sortField = (status === 'pending' || status === 'rejected') ? 'submittedAt' : 'admissionDate';
        students.sort((a, b) => {
            const dateA = a.admissionDetails?.[sortField] as Date | undefined;
            const dateB = b.admissionDetails?.[sortField] as Date | undefined;
            
            const aHasDate = dateA && dateA instanceof Date && !isNaN(dateA.getTime());
            const bHasDate = dateB && dateB instanceof Date && !isNaN(dateB.getTime());

            if (aHasDate && !bHasDate) return -1;
            if (!aHasDate && bHasDate) return 1;
            
            if (aHasDate && bHasDate) {
                 return (dateB as Date).getTime() - (dateA as Date).getTime();
            }
            
            // Fallback sort for records without a date, sorting by name
            return (a.studentDetails?.nameEn || '').localeCompare(b.studentDetails?.nameEn || '');
        });
        
        // Apply limit on the client-side
        const finalAdmissions = options?.count ? students.slice(0, options.count) : students;

        callback(finalAdmissions);
    }, (error) => {
        console.error(`Error listening to admissions:`, error);
        callback([]); // Pass empty array on error
    });

    return unsubscribe;
};

/**
 * Gets the count of approved admissions for a specific class in a school.
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
            where('admissionDetails.classSelection', '==', classSelection),
            where('admissionDetails.status', '==', 'approved')
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
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
