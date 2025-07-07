
'use server';
/**
 * @fileOverview A name translation AI agent.
 *
 * - translateName - A function that handles the name translation process.
 * - TranslateNameInput - The input type for the translateName function.
 * - TranslateNameOutput - The return type for the translateName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranslateNameInputSchema = z.object({
  name: z.string().describe('The name to translate.'),
});
export type TranslateNameInput = z.infer<typeof TranslateNameInputSchema>;

const TranslateNameOutputSchema = z.object({
  translatedName: z.string().describe('The translated name.'),
});
export type TranslateNameOutput = z.infer<typeof TranslateNameOutputSchema>;

export async function translateName(
  input: TranslateNameInput
): Promise<TranslateNameOutput> {
  return translateNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nameTranslatePrompt',
  input: {schema: TranslateNameInputSchema},
  output: {schema: TranslateNameOutputSchema},
  prompt: `Transliterate the name '{{name}}' to Hindi. Only return the transliterated name. For example, if the input is 'RAKESH', the output should be 'राकेश'.`,
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
