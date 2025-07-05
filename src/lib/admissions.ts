
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, getCountFromServer, where } from 'firebase/firestore';
import type { FormValues } from './form-schema';
import { Timestamp } from 'firebase/firestore';

// Helper to convert Firestore Timestamps to JS Dates in nested objects
const convertTimestamps = (data: any): any => {
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
  try {
    const docRef = await addDoc(collection(db, 'admissions'), data);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to save admission to the database.");
  }
};

export const getAdmissions = async (count?: number) => {
  const admissionsCollection = collection(db, 'admissions');
  const q = count
    ? query(admissionsCollection, orderBy('admissionDetails.admissionDate', 'desc'), limit(count))
    : query(admissionsCollection, orderBy('admissionDetails.admissionDate', 'desc'));

  const querySnapshot = await getDocs(q);
  const admissions: (FormValues & { id: string })[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Firestore returns Timestamps, we need to convert them back to JS Dates
    const convertedData = convertTimestamps(JSON.parse(JSON.stringify(data)));
    admissions.push({ id: doc.id, ...convertedData } as FormValues & { id: string });
  });
  return admissions;
};

export const getAdmissionCount = async (): Promise<number> => {
    try {
        const admissionsCollection = collection(db, 'admissions');
        const snapshot = await getCountFromServer(admissionsCollection);
        return snapshot.data().count;
    } catch (e) {
        console.error("Error getting admission count: ", e);
        return 0;
    }
}

export const getClassAdmissionCount = async (classSelection: string): Promise<number> => {
    try {
        const admissionsCollection = collection(db, 'admissions');
        const q = query(admissionsCollection, where('admissionDetails.classSelection', '==', classSelection));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch(e) {
        console.error(`Error getting admission count for class ${classSelection}: `, e);
        return 0;
    }
}
