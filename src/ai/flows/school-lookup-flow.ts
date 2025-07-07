
'use server';
/**
 * @fileOverview An AI agent to look up school details by UDISE code.
 *
 * - getSchoolInfo - A function that handles the school lookup process.
 * - SchoolLookupInput - The input type for the getSchoolInfo function.
 * - SchoolLookupOutput - The return type for the getSchoolInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SchoolLookupInputSchema = z.object({
  udise: z.string().describe('The 11-digit UDISE code of the school.'),
});
export type SchoolLookupInput = z.infer<typeof SchoolLookupInputSchema>;

const SchoolLookupOutputSchema = z.object({
  name: z.string().describe("The official name of the school. If not found, return an empty string."),
  address: z.string().describe("The full address of the school. If not found, return an empty string."),
});
export type SchoolLookupOutput = z.infer<typeof SchoolLookupOutputSchema>;

export async function getSchoolInfo(
  input: SchoolLookupInput
): Promise<SchoolLookupOutput> {
  return schoolLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'schoolLookupPrompt',
  input: {schema: SchoolLookupInputSchema},
  output: {schema: SchoolLookupOutputSchema},
  prompt: `You are an expert in Indian school administration. Find the official name and full address for the school with UDISE code {{udise}}. Use publicly available data from government education portals if necessary. If you cannot find the exact details, return empty strings for both name and address.`,
});

const schoolLookupFlow = ai.defineFlow(
  {
    name: 'schoolLookupFlow',
    inputSchema: SchoolLookupInputSchema,
    outputSchema: SchoolLookupOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
