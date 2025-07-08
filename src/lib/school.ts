
import { db, firebaseError } from './firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { getUserProfile } from './user';

export interface School {
    name: string;
    address: string;
    udise: string;
    ownerUid?: string;
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
        return null;
    } catch (e) {
        console.error(`Error fetching school with UDISE ${udise}:`, e);
        return null;
    }
};

/**
 * Fetches the school data associated with a given user ID.
 * @param uid The user's unique ID from Firebase Auth.
 * @returns A promise that resolves to the school data, or null if not found.
 */
export const getSchoolForUser = async (uid: string): Promise<School | null> => {
  if (!db) {
    return null;
  }
  
  // First, get the user's profile to find their UDISE code
  const userProfile = await getUserProfile(uid);
  if (userProfile?.udise) {
    // If UDISE exists on user profile, fetch school directly
    return getSchoolByUdise(userProfile.udise);
  }

  // Fallback: If no UDISE on user profile, check schools collection by ownerUid
  // This is useful for migrating older data structures or as a backup.
  const q = query(collection(db, 'schools'), where('ownerUid', '==', uid));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const schoolDoc = querySnapshot.docs[0];
    return schoolDoc.data() as School;
  }
  
  return null; // No school associated with this user
};
