
import { db, firebaseError } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  getCountFromServer,
  where,
  onSnapshot,
  type Unsubscribe,
  doc,
  getDoc,
  Timestamp,
  QueryConstraint,
  writeBatch,
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
 * Retrieves a list of admissions for a specific school, ordered by date.
 * @param udise The UDISE code of the school.
 * @param count Optional limit for the number of records to fetch.
 * @returns A promise that resolves to an array of admission documents.
 */
export const getAdmissions = async (udise: string, count?: number): Promise<(FormValues & { id: string })[]> => {
  if (!db || !udise) {
    console.warn(firebaseError || "Database not available or UDISE not provided. Cannot fetch admissions.");
    return [];
  }
  
  const queryConstraints: QueryConstraint[] = [
    where('admissionDetails.udise', '==', udise),
    orderBy('admissionDetails.admissionDate', 'desc')
  ];

  if (count) {
    queryConstraints.push(limit(count));
  }
  
  const q = query(collection(db, 'admissions'), ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const admissions: (FormValues & { id: string })[] = [];
  querySnapshot.forEach((doc) => {
    admissions.push({ id: doc.id, ...convertTimestamps(doc.data()) } as FormValues & { id: string });
  });
  return admissions;
};

/**
 * Listens for real-time updates to the admissions collection for a specific school.
 * @param udise The UDISE code of the school.
 * @param callback The function to call with the updated admissions list.
 * @param count Optional limit for the number of records to listen to.
 * @returns An Unsubscribe function to stop listening for updates.
 */
export const listenToAdmissions = (udise: string | undefined, callback: (admissions: (FormValues & { id: string })[]) => void, count?: number): Unsubscribe => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot listen to admissions.");
        callback([]);
        return () => {}; // Return a no-op unsubscribe function
    }

    const queryConstraints: QueryConstraint[] = [
        where('admissionDetails.udise', '==', udise),
        orderBy('admissionDetails.admissionDate', 'desc')
    ];

    if (count) {
        queryConstraints.push(limit(count));
    }

    const q = query(collection(db, 'admissions'), ...queryConstraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const admissions: (FormValues & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            admissions.push({ id: doc.id, ...convertTimestamps(doc.data()) } as FormValues & { id: string });
        });
        callback(admissions);
    }, (error) => {
        console.error("Error listening to admissions:", error);
        callback([]); // Pass empty array on error
    });

    return unsubscribe;
};

/**
 * Gets the total count of all admission documents for a specific school.
 * @param udise The UDISE code of the school.
 * @returns A promise that resolves to the total number of admissions.
 */
export const getAdmissionCount = async (udise: string): Promise<number> => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot get admission count.");
        return 0;
    }
    try {
        const q = query(collection(db, 'admissions'), where('admissionDetails.udise', '==', udise));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (e) {
        console.error("Error getting admission count:", e);
        return 0;
    }
}

/**
 * Gets the count of admissions for a specific class in a specific school.
 * @param udise The UDISE code of the school.
 * @param classSelection The class to filter by (e.g., '9', '11-arts').
 * @returns A promise that resolves to the number of admissions in that class.
 */
export const getClassAdmissionCount = async (udise: string, classSelection: string): Promise<number> => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot get class admission count.");
        return 0;
    }
    try {
        const q = query(collection(db, 'admissions'), 
            where('admissionDetails.udise', '==', udise),
            where('admissionDetails.classSelection', '==', classSelection));
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

/**
 * Migrates old admission records that do not have a UDISE code by assigning them one.
 * This is a one-time utility function. It reads the entire collection, which can be inefficient.
 * @param udiseToAssign The UDISE code to assign to the old records.
 * @returns The number of records that were updated.
 */
export const migrateOldAdmissions = async (udiseToAssign: string): Promise<number> => {
  if (!db) {
    throw new Error(firebaseError || "Database not available. Migration failed.");
  }
  try {
    const admissionsCollection = collection(db, 'admissions');
    const querySnapshot = await getDocs(admissionsCollection);
    
    const batch = writeBatch(db);
    let recordsToUpdateCount = 0;

    querySnapshot.forEach((document) => {
      const data = document.data();
      // Check if the udise field is missing inside admissionDetails
      if (!data.admissionDetails?.udise) {
        const docRef = doc(db, 'admissions', document.id);
        batch.update(docRef, { 'admissionDetails.udise': udiseToAssign });
        recordsToUpdateCount++;
      }
    });

    if (recordsToUpdateCount > 0) {
      await batch.commit();
    }

    return recordsToUpdateCount;
  } catch (e) {
    console.error("Error migrating old admissions:", e);
    let errorMessage = "Failed to migrate old data.";
    if (e instanceof Error) {
        errorMessage += ` Reason: ${e.message}`;
    }
    throw new Error(errorMessage);
  }
};
