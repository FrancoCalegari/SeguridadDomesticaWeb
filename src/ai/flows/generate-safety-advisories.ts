'use server';
/**
 * @fileOverview An AI agent that generates current safety advisories.
 *
 * - generateSafetyAdvisories - A function that generates a list of numbered safety advisories.
 * - GenerateSafetyAdvisoriesInput - The input type for the generateSafetyAdvisories function.
 * - GenerateSafetyAdvisoriesOutput - The return type for the generateSafetyAdvisories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSafetyAdvisoriesInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for which safety advisories should be generated.'),
});
export type GenerateSafetyAdvisoriesInput = z.infer<
  typeof GenerateSafetyAdvisoriesInputSchema
>;

const GenerateSafetyAdvisoriesOutputSchema = z.object({
  advisories: z
    .string()
    .describe('A numbered list of current safety advisories.'),
});
export type GenerateSafetyAdvisoriesOutput = z.infer<
  typeof GenerateSafetyAdvisoriesOutputSchema
>;

export async function generateSafetyAdvisories(
  input: GenerateSafetyAdvisoriesInput
): Promise<GenerateSafetyAdvisoriesOutput> {
  return generateSafetyAdvisoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafetyAdvisoriesPrompt',
  input: {schema: GenerateSafetyAdvisoriesInputSchema},
  output: {schema: GenerateSafetyAdvisoriesOutputSchema},
  prompt: `You are a security expert providing safety advisories.

  Generate a numbered list of current safety advisories on the topic of {{topic}}.`,
});

const generateSafetyAdvisoriesFlow = ai.defineFlow(
  {
    name: 'generateSafetyAdvisoriesFlow',
    inputSchema: GenerateSafetyAdvisoriesInputSchema,
    outputSchema: GenerateSafetyAdvisoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
