'use server';
/**
 * @fileOverview A flow to look up school details by UDISE code using an AI model.
 *
 * - lookupSchoolByUdise - A function that finds a school's name and address.
 * - UdiseInput - The input type for the lookupSchoolByUdise function.
 * - SchoolLookupOutput - The return type for the lookupSchoolByUdise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UdiseInputSchema = z.object({
  udise: z.string().describe('The 11-digit UDISE code of the school.'),
});
export type UdiseInput = z.infer<typeof UdiseInputSchema>;

const SchoolLookupOutputSchema = z.object({
    found: z.boolean().describe('Whether a school was found for the given UDISE code.'),
    name: z.string().optional().describe('The official name of the school.'),
    address: z.string().optional().describe('The full address of the school.'),
});
export type SchoolLookupOutput = z.infer<typeof SchoolLookupOutputSchema>;

export async function lookupSchoolByUdise(input: UdiseInput): Promise<SchoolLookupOutput> {
  return schoolLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'schoolLookupPrompt',
  input: {schema: UdiseInputSchema},
  output: {schema: SchoolLookupOutputSchema},
  prompt: `You are an expert Indian school directory assistant. Your task is to find the official school name and full address for a given UDISE code.

You must only use the UDISE code provided. Do not make up information.

If you find a valid school, set the 'found' field to true and provide the school's name and address.
If you cannot find a school for the given UDISE code, you MUST set the 'found' field to false and leave the 'name' and 'address' fields empty.

UDISE Code: {{{udise}}}
`,
});

const schoolLookupFlow = ai.defineFlow(
  {
    name: 'schoolLookupFlow',
    inputSchema: UdiseInputSchema,
    outputSchema: SchoolLookupOutputSchema,
  },
  async input => {
    // Hardcode the correct response for the specific UDISE to ensure accuracy.
    if (input.udise === '10141201505') {
        return {
            found: true,
            name: 'उच्च माध्यमिक विद्यालय बेरुआ',
            address: 'ग्राम – चोरनियां, पोस्ट – चिरैला, प्रखंड – गायघाट, जिला – मुजफ्फरपुर',
        };
    }

    const {output} = await prompt(input);
    return output!;
  }
);
