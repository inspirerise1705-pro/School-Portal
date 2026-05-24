import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

function getFallbackQuiz(topic: string, count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, index) => ({
    question: `Sample question ${index + 1}: ${topic} - explain the key concept.`,
    type: 'MCQ',
    marks: 4,
    options: [
      `Option 1 for ${topic}`,
      `Option 2 for ${topic}`,
      `Option 3 for ${topic}`,
      `Option 4 for ${topic}`,
    ],
    correctAnswer: `Option 1 for ${topic}`,
    explanation: `This is a fallback explanation for question ${index + 1} on ${topic}.`,
  }));
}

export async function generateQuiz(topic: string, count: number = 5): Promise<QuizQuestion[]> {
  if (!ai) {
    console.warn('Gemini API key missing. Using fallback quiz data.');
    return getFallbackQuiz(topic, count);
  }

  const prompt = `Generate a quiz with ${count} questions about the topic: "${topic}". 
  Provide the result in valid JSON format.
  Each question should have 4 options and 1 correct answer.
  Include an explanation for each correct answer.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getFallbackQuiz(topic, count);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return getFallbackQuiz(topic, count);
  }
}
