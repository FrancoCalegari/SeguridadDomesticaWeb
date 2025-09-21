'use server';

import { generateSafetyAdvisories } from '@/ai/flows/generate-safety-advisories';

export async function getSecurityTips(topic: string) {
  if (!topic) {
    return { error: 'Por favor, ingrese un tema.' };
  }
  try {
    const result = await generateSafetyAdvisories({ topic });
    return { advisories: result.advisories };
  } catch (e) {
    console.error(e);
    return { error: 'No se pudieron generar los consejos. Inténtelo de nuevo.' };
  }
}
