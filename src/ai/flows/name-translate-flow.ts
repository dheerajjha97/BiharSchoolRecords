'use server';
/**
 * @fileOverview A utility to translate names from English to Hindi.
 *
 * - translateName - A function that handles the name translation.
 * - TranslateNameInput - The input type for the translateName function.
 * - TranslateNameOutput - The return type for the translateName function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

const TranslateNameInputSchema = z.object({
  name: z.string().describe('The name in English to be translated.'),
});
export type TranslateNameInput = z.infer<typeof TranslateNameInputSchema>;

const TranslateNameOutputSchema = z.object({
  translatedName: z.string().describe('The translated name in Hindi.'),
});
export type TranslateNameOutput = z.infer<typeof TranslateNameOutputSchema>;

export async function translateName(input: TranslateNameInput): Promise<TranslateNameOutput> {
  return translateNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateNamePrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: TranslateNameInputSchema},
  output: {schema: TranslateNameOutputSchema},
  prompt: `Translate the following English name to Hindi. Only return the translated name.

English Name: {{{name}}}`,
});

const translateNameFlow = ai.defineFlow(
  {
    name: 'translateNameFlow',
    inputSchema: TranslateNameInputSchema,
    outputSchema: TranslateNameOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
