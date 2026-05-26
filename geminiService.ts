import { QuizQuestion } from "./types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

function getFallbackQuiz(topic: string, count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    question: `Sample question ${i + 1}: ${topic} - explain the key concept.`,
    type: 'MCQ' as const,
    marks: 4,
    options: [`Option 1 for ${topic}`, `Option 2 for ${topic}`, `Option 3 for ${topic}`, `Option 4 for ${topic}`],
    correctAnswer: `Option 1 for ${topic}`,
    explanation: `Fallback explanation for question ${i + 1} on ${topic}.`,
  }));
}

export async function generateQuiz(topic: string, count: number = 5): Promise<QuizQuestion[]> {
  if (!API_KEY) {
    console.warn('[Gemini] VITE_GEMINI_API_KEY missing — restart dev server after adding it to .env');
    return getFallbackQuiz(topic, count);
  }

  const prompt = `Generate exactly ${count} multiple choice quiz questions for school students about: "${topic}".
Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.
Each object must have exactly these fields:
- "question": string
- "options": array of exactly 4 strings
- "correctAnswer": string (must exactly match one option)
- "explanation": string`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Gemini] HTTP error:', res.status, err);
      return getFallbackQuiz(topic, count);
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed) || parsed.length === 0) return getFallbackQuiz(topic, count);

    return parsed.map((q: any) => ({
      question: q.question ?? '',
      type: 'MCQ' as const,
      marks: 4,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer ?? '',
      explanation: q.explanation ?? '',
    }));
  } catch (err) {
    console.error('[Gemini] Request failed:', err);
    return getFallbackQuiz(topic, count);
  }
}
