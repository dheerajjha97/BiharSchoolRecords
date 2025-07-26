

import { db, firebaseError } from './firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

export interface School {
    name: string;
    address: string;
    udise: string;
    ownerUid?: string;
    password?: string;
    mobile?: string;
    email?: string;
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
        await setDoc(schoolDocRef, schoolData, { merge: true });
    } catch (e) {
        console.error("Error saving school to Firestore: ", e);
        let errorMessage = "Failed to save school details to the database.";
        if (e instanceof Error) {
            if (/unavailable/i.test(e.message)) {
              errorMessage = 'Could not connect to the database. Please check your internet connection.';
            } else {
              errorMessage = e.message;
            }
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
        return null;
    } catch (e) {
        console.error(`Error fetching school with UDISE ${udise}:`, e);
        return null;
    }
};

/**
 * Fetches school information from Firestore by email address.
 * @param email The email address of the school.
 * @returns A promise that resolves to the school data, or null if not found.
 */
export const getSchoolByEmail = async (email: string): Promise<School | null> => {
    if (!db || !email) {
        console.warn(firebaseError || "Database not available or email not provided. Cannot fetch school data.");
        return null;
    }
    try {
        const q = query(collection(db, "schools"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Return the first school found with that email
            return querySnapshot.docs[0].data() as School;
        }
        return null;
    } catch (e) {
        console.error(`Error fetching school with email ${email}:`, e);
        return null;
    }
};
