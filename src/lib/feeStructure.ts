
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
 * Migrates a fetched fee structure to match the latest default structure.
 * It adds missing heads and removes obsolete ones.
 * @param fetchedHeads The array of fee heads fetched from Firestore.
 * @returns The migrated array of fee heads.
 */
const migrateFeeStructure = (fetchedHeads: FeeHead[]): FeeHead[] => {
    const defaultHeadMap = new Map(DEFAULT_FEE_STRUCTURE.map(h => [h.id, h]));
    const fetchedHeadMap = new Map(fetchedHeads.map(h => [h.id, h]));
    const finalHeads: FeeHead[] = [];

    // Iterate through the default structure to maintain order and add/update heads
    defaultHeadMap.forEach((defaultHead, id) => {
        const fetchedHead = fetchedHeadMap.get(id);
        if (fetchedHead) {
            // If the head exists in fetched data, use it (it might have custom values)
            // But ensure the names are updated to the latest default, as only values should be custom.
            finalHeads.push({
                ...fetchedHead,
                name_en: defaultHead.name_en,
                name_hi: defaultHead.name_hi,
            });
        } else {
            // If the head is missing in fetched data, add it from the default structure
            finalHeads.push(defaultHead);
        }
    });

    return finalHeads;
};


/**
 * Fetches the fee structure for a specific school and session.
 * If no custom structure is found, it returns null.
 * It also handles migration of old structures.
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
      const data = docSnap.data() as FeeStructure;
      // Migrate the fetched structure to ensure it's up-to-date
      data.heads = migrateFeeStructure(data.heads);
      return data;
    }
    
    // Fallback to default session if specific session not found
    const genericDocId = `${udise}_default`;
    const genericFeeDocRef = doc(db, 'feeStructures', genericDocId);
    const genericDocSnap = await getDoc(genericFeeDocRef);
    if (genericDocSnap.exists()) {
      const data = genericDocSnap.data() as FeeStructure;
      data.heads = migrateFeeStructure(data.heads);
      return data;
    }

    return null; // Return null to indicate that default should be used by the caller
  } catch (e) {
    console.error(`Error fetching fee structure for ${udise} session ${session}:`, e);
    return null;
  }
};
