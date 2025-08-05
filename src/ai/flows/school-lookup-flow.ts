
'use server';
/**
 * @fileOverview A school lookup utility.
 *
 * - schoolLookup - A function that finds school details by UDISE code.
 * - SchoolLookupInput - The input type for the schoolLookup function.
 * - SchoolLookupOutput - The return type for the schoolLookup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getSchoolByUdise } from '@/lib/school';

const SchoolLookupInputSchema = z.object({
  udise: z.string().describe('The 11-digit UDISE code of the school.'),
});
export type SchoolLookupInput = z.infer<typeof SchoolLookupInputSchema>;

const SchoolLookupOutputSchema = z.object({
  name: z.string().describe('The official name of the school.'),
  address: z.string().describe('The full address of the school.'),
  udise: z.string().describe('The 11-digit UDISE code of the school.'),
}).nullable();
export type SchoolLookupOutput = z.infer<typeof SchoolLookupOutputSchema>;


export async function schoolLookup(
  input: SchoolLookupInput
): Promise<SchoolLookupOutput> {
  return schoolLookupFlow(input);
}

const schoolLookupFlow = ai.defineFlow(
  {
    name: 'schoolLookupFlow',
    inputSchema: SchoolLookupInputSchema,
    outputSchema: SchoolLookupOutputSchema,
  },
  async ({ udise }) => {
    // This flow now looks up school data from the live Firestore database.
    const schoolData = await getSchoolByUdise(udise);

    if (schoolData) {
      // Return only the public-facing details.
      return { 
        name: schoolData.name,
        address: schoolData.address,
        udise: schoolData.udise,
      };
    }
    
    // If not found in our database, return null.
    // The UI will then prompt the user for manual entry.
    return null;
  }
);
