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
  prompt: `You are an expert linguist specializing in phonetics and transliteration.
Your task is to transliterate the given English name into Hindi script based on its pronunciation.
Do not translate the meaning of the name. Only provide the transliterated name in Hindi.

The input name will be in all capital letters.

Examples:
- English Name: RAKESH
  Hindi: राकेश
- English Name: SUSHMITA
  Hindi: सुष्मिता
- English Name: JOHN
  Hindi: जॉन

English Name: {{{text}}}
`,
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
