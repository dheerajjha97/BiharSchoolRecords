
import { db, firebaseError } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface UserProfile {
    uid: string;
    email?: string | null;
    udise?: string;
    phone?: string;
}

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    if (!db) {
        throw new Error(firebaseError || "Database not available.");
    }
    try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, data, { merge: true });
    } catch (e: any) {
        throw new Error(`Failed to update user profile: ${e.message}`);
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    if (!db) {
        throw new Error(firebaseError || "Database not available.");
    }
    try {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return { uid, ...docSnap.data() } as UserProfile;
        }
        return null;
    } catch (e: any) {
        throw new Error(`Failed to get user profile: ${e.message}`);
    }
};
