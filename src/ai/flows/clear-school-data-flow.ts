
'use server';
/**
 * @fileOverview A flow to clear all admission data for a specific school.
 * This is a destructive operation and should be used with caution.
 *
 * - clearSchoolData - A function that handles the data deletion process.
 * - ClearSchoolDataInput - The input type for the function.
 * - ClearSchoolDataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, firebaseError } from '@/lib/firebase';
import { getAllAdmissionIdsForSchool } from '@/lib/admissions';
import { writeBatch, doc } from 'firebase/firestore';

const ClearSchoolDataInputSchema = z.object({
  udise: z.string().length(11, 'A valid 11-digit UDISE code is required.'),
});
export type ClearSchoolDataInput = z.infer<typeof ClearSchoolDataInputSchema>;

const ClearSchoolDataOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number(),
  message: z.string(),
});
export type ClearSchoolDataOutput = z.infer<typeof ClearSchoolDataOutputSchema>;

/**
 * Deletes all admission records associated with a given UDISE code.
 * This function performs the deletion in batches to handle large datasets safely.
 * @param input The UDISE code of the school to clear.
 * @returns A promise that resolves with the result of the operation.
 */
export async function clearSchoolData(input: ClearSchoolDataInput): Promise<ClearSchoolDataOutput> {
  return clearSchoolDataFlow(input);
}

const clearSchoolDataFlow = ai.defineFlow(
  {
    name: 'clearSchoolDataFlow',
    inputSchema: ClearSchoolDataInputSchema,
    outputSchema: ClearSchoolDataOutputSchema,
  },
  async ({ udise }) => {
    if (!db) {
      throw new Error(firebaseError || "Could not connect to the database. Please check your internet connection.");
    }

    try {
      const docIds = await getAllAdmissionIdsForSchool(udise);

      if (docIds.length === 0) {
        return {
          success: true,
          deletedCount: 0,
          message: 'No admission records found for this school to delete.',
        };
      }

      // Firestore allows up to 500 operations in a single batch.
      const batchSize = 500;
      for (let i = 0; i < docIds.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = docIds.slice(i, i + batchSize);
        for (const docId of chunk) {
          const docRef = doc(db, 'admissions', docId);
          batch.delete(docRef);
        }
        await batch.commit();
        console.log(`Deleted batch of ${chunk.length} documents.`);
      }

      return {
        success: true,
        deletedCount: docIds.length,
        message: `Successfully deleted ${docIds.length} admission records for UDISE ${udise}.`,
      };
    } catch (e) {
      console.error("Error in clearSchoolDataFlow: ", e);
      let errorMessage = 'An unexpected error occurred during data deletion.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      // Throwing an error here will propagate it to the client call,
      // which is useful for displaying error messages.
      throw new Error(errorMessage);
    }
  }
);
