
import { db, firebaseError } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface School {
    name: string;
    address: string;
    udise: string;
}


/**
 * Saves or updates school information in Firestore.
 * The UDISE code is used as the document ID for easy lookup.
 * @param schoolData The school data to save.
 */
export const saveSchool = async (schoolData: School): Promise<void> => {
    if (!db) {
        throw new Error(firebaseError || "Database not available. Cannot save school data.");
    }
    try {
        const schoolDocRef = doc(db, 'schools', schoolData.udise);
        // Use setDoc with merge to create a new document or update an existing one.
        await setDoc(schoolDocRef, schoolData, { merge: true });
    } catch (e) {
        console.error("Error saving school to Firestore: ", e);
        let errorMessage = "Failed to save school details to the database.";
        if (e instanceof Error) {
            errorMessage += ` Reason: ${e.message}`;
        }
        throw new Error(errorMessage);
    }
};

/**
 * Fetches school information from Firestore by UDISE code.
 * @param udise The UDISE code of the school.
 * @returns A promise that resolves to the school data, or null if not found.
 */
export const getSchoolByUdise = async (udise: string): Promise<School | null> => {
    if (!db || !udise) {
        console.warn(firebaseError || "Database not available or UDISE not provided. Cannot fetch school data.");
        return null;
    }
    try {
        const schoolDocRef = doc(db, 'schools', udise);
        const docSnap = await getDoc(schoolDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as School;
        }
        return null; // School not found in the database
    } catch (e) {
        console.error(`Error fetching school with UDISE ${udise}:`, e);
        return null;
    }
};
