import { db, firebaseError } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, getCountFromServer, where, onSnapshot, type Unsubscribe, doc, getDoc } from 'firebase/firestore';
import type { FormValues } from './form-schema';
import { Timestamp } from 'firebase/firestore';

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

// Helper to recursively remove undefined values from an object, as Firestore doesn't support them.
// This preserves Date objects.
const removeUndefinedValues = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects explicitly to prevent them from being converted to {}
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(v => v !== undefined);
  }

  const newObj: {[key: string]: any} = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        newObj[key] = removeUndefinedValues(value);
      }
    }
  }
  return newObj;
}


export const addAdmission = async (data: FormValues) => {
  if (!db) {
    throw new Error(firebaseError || "Failed to save admission: Database not available.");
  }
  try {
    // Firestore does not support 'undefined' values.
    const cleanData = removeUndefinedValues(data);
    const docRef = await addDoc(collection(db, 'admissions'), cleanData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to save admission to the database.");
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
