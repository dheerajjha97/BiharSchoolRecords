'use server';
/**
 * @fileOverview A flow to transliterate text to Hindi.
 *
 * - transliterate - A function that handles the transliteration.
 * - TransliterateInput - The input type for the transliterate function.
 * - TransliterateOutput - The return type for the transliterate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransliterateInputSchema = z.object({
  text: z.string().describe('The text to transliterate.'),
});
export type TransliterateInput = z.infer<typeof TransliterateInputSchema>;

const TransliterateOutputSchema = z.object({
  transliteratedText: z.string().describe('The transliterated Hindi text.'),
});
export type TransliterateOutput = z.infer<typeof TransliterateOutputSchema>;

export async function transliterate(input: TransliterateInput): Promise<TransliterateOutput> {
  return transliterateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transliteratePrompt',
  input: {schema: TransliterateInputSchema},
  output: {schema: TransliterateOutputSchema},
  prompt: `You are an expert linguist specializing in names. Your task is to transliterate an English name into Hindi. The transliteration should be based on the pronunciation of the name. Do not translate the meaning of the name.

The input text might be in all capital letters, please handle it gracefully.

Input: {{{text}}}
Output:`,
});

const transliterateFlow = ai.defineFlow(
  {
    name: 'transliterateFlow',
    inputSchema: TransliterateInputSchema,
    outputSchema: TransliterateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
