
import { db, firebaseError } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, getCountFromServer, where, onSnapshot, type Unsubscribe, doc, getDoc, Timestamp } from 'firebase/firestore';
import type { FormValues } from './form-schema';

/**
 * Recursively converts keys with `undefined` values to `null` in an object.
 * Firestore does not support `undefined` but supports `null`.
 * This function ensures all data sent to Firestore is valid.
 * @param obj The object to sanitize.
 * @returns A new object with `undefined` values converted to `null`.
 */
const convertUndefinedToNull = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Preserve Date and Timestamp objects, which are object types.
    if (obj instanceof Date || obj instanceof Timestamp) {
        return obj;
    }

    // Handle arrays recursively.
    if (Array.isArray(obj)) {
        return obj.map(item => convertUndefinedToNull(item));
    }

    // Handle plain objects.
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value === undefined) {
                newObj[key] = null;
            } else {
                newObj[key] = convertUndefinedToNull(value);
            }
        }
    }
    return newObj;
}

// Helper to convert Firestore Timestamps to JS Dates in nested objects
export const convertTimestamps = (data: any): any => {
  if (!data) return data;
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate();
    } else if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
      data[key] = convertTimestamps(data[key]);
    }
  }
  return data;
};

export const addAdmission = async (data: FormValues) => {
  if (!db) {
    throw new Error(firebaseError || "Failed to save admission: Database not available.");
  }
  try {
    // Sanitize the data before sending it to Firestore to ensure no 'undefined' values are present.
    const sanitizedData = convertUndefinedToNull(data);
    const docRef = await addDoc(collection(db, 'admissions'), sanitizedData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    let errorMessage = "Failed to save admission to the database.";
    if (e instanceof Error) {
        errorMessage += ` Reason: ${e.message}`;
    }
    throw new Error(errorMessage);
  }
};

export const getAdmissions = async (count?: number) => {
  if (!db) {
    return [];
  }
  const admissionsCollection = collection(db, 'admissions');
  const q = count
    ? query(admissionsCollection, orderBy('admissionDetails.admissionDate', 'desc'), limit(count))
    : query(admissionsCollection, orderBy('admissionDetails.admissionDate', 'desc'));

  const querySnapshot = await getDocs(q);
  const admissions: (FormValues & { id: string })[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Directly convert timestamps without stringifying
    const convertedData = convertTimestamps(data);
    admissions.push({ id: doc.id, ...convertedData } as FormValues & { id: string });
  });
  return admissions;
};

export const listenToAdmissions = (callback: (admissions: (FormValues & { id: string })[]) => void, count?: number): Unsubscribe => {
    if (!db) {
        callback([]);
        return () => {}; // Return a no-op unsubscribe function
    }
    const admissionsCollection = collection(db, 'admissions');
    const q = count
        ? query(admissionsCollection, orderBy('admissionDetails.admissionDate', 'desc'), limit(count))
        : query(admissionsCollection, orderBy('admissionDetails.admissionDate', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const admissions: (FormValues & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const convertedData = convertTimestamps(data);
            admissions.push({ id: doc.id, ...convertedData } as FormValues & { id: string });
        });
        callback(admissions);
    }, (error) => {
        console.error("Error listening to admissions:", error);
        callback([]); // Pass empty array on error
    });

    return unsubscribe;
};

export const getAdmissionCount = async (): Promise<number> => {
    if (!db) {
        return 0;
    }
    try {
        const admissionsCollection = collection(db, 'admissions');
        const snapshot = await getCountFromServer(admissionsCollection);
        const count = snapshot.data().count;
        return count >= 0 ? count : 0;
    } catch (e) {
        return 0;
    }
}

export const getClassAdmissionCount = async (classSelection: string): Promise<number> => {
    if (!db) {
        return 0;
    }
    try {
        const admissionsCollection = collection(db, 'admissions');
        const q = query(admissionsCollection, where('admissionDetails.classSelection', '==', classSelection));
        const snapshot = await getCountFromServer(q);
        const count = snapshot.data().count;
        return count >= 0 ? count : 0;
    } catch(e) {
        return 0;
    }
}


export const getAdmissionById = async (id: string): Promise<FormValues | null> => {
  if (!db) {
    return null;
  }
  try {
    const docRef = doc(db, "admissions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const convertedData = convertTimestamps(data);
      return convertedData as FormValues;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error fetching document:", e);
    return null;
  }
};
