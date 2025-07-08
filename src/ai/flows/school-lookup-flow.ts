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

// This is a mock database to simulate fetching from the udise_schools repository.
// In a real application, this would be a call to an external API or database.
const schoolDatabase: Record<string, { name: string; address: string }> = {
  '10141201505': {
    name: 'उच्च माध्यमिक विद्यालय बेरुआ',
    address: 'ग्राम – चोरनियां, पोस्ट – चिरैला, प्रखंड – गायघाट, जिला – मुजफ्फरपुर',
  },
  '10130100101': {
    name: 'राजकीयकृत मध्य विद्यालय, मिठनपुरा',
    address: 'मिठनपुरा, मुजफ्फरपुर, बिहार',
  },
  '10130100202': {
      name: 'जिला स्कूल, मुजफ्फरपुर',
      address: 'कलेक्ट्रेट के पास, मुजफ्फरपुर, बिहार',
  }
};


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
    // This flow simulates looking up school data from a large public dataset.
    // For this demo, we use a small, hardcoded map.
    const schoolData = schoolDatabase[udise];

    if (schoolData) {
      return { ...schoolData, udise };
    }
    
    // If not found in our mock database, return null.
    // The UI will then prompt the user for manual entry.
    return null;
  }
);
