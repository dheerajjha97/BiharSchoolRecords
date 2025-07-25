
import { db, firebaseError } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_FEE_STRUCTURE } from './fees';

export interface FeeHead {
  id: number;
  name_en: string;
  name_hi: string;
  class9: number;
  class10: number;
  class11ac: number; // Arts & Commerce
  class11s: number;  // Science
  class12ac: number; // Arts & Commerce
  class12s: number;  // Science
}

export interface FeeStructure {
  udise: string;
  session: string; // e.g., "2025-2026"
  heads: FeeHead[];
}

/**
 * Saves or updates a fee structure for a specific school and session.
 * @param structure The fee structure data to save.
 */
export const saveFeeStructure = async (structure: FeeStructure): Promise<void> => {
  if (!db) {
    throw new Error(firebaseError || "Database not available. Cannot save fee structure.");
  }
  try {
    const docId = `${structure.udise}_${structure.session}`;
    const feeDocRef = doc(db, 'feeStructures', docId);
    await setDoc(feeDocRef, structure, { merge: true });
  } catch (e) {
    console.error("Error saving fee structure to Firestore: ", e);
    let errorMessage = "Failed to save fee details to the database.";
    if (e instanceof Error) {
        errorMessage += ` Reason: ${e.message}`;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Fetches the fee structure for a specific school and session.
 * If no custom structure is found, it returns null.
 * @param udise The UDISE code of the school.
 * @param session The academic session (e.g., "2025-2026").
 * @returns A promise that resolves to the fee structure, or null if not found.
 */
export const getFeeStructure = async (udise: string, session: string): Promise<FeeStructure | null> => {
  if (!db || !udise || !session) {
    console.warn(firebaseError || "Database/udise/session not provided. Cannot fetch fee structure.");
    return null;
  }
  try {
    const docId = `${udise}_${session}`;
    const feeDocRef = doc(db, 'feeStructures', docId);
    const docSnap = await getDoc(feeDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as FeeStructure;
    }
    // If no specific structure for the session, try fetching one for the UDISE without session
    const genericDocId = `${udise}_default`;
    const genericFeeDocRef = doc(db, 'feeStructures', genericDocId);
    const genericDocSnap = await getDoc(genericFeeDocRef);
    if (genericDocSnap.exists()) {
      return genericDocSnap.data() as FeeStructure;
    }

    return null; // Return null to indicate that default should be used
  } catch (e) {
    console.error(`Error fetching fee structure for ${udise} session ${session}:`, e);
    return null;
  }
};
