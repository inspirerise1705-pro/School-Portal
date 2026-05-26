import { QuizQuestion } from "./types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

function getFallbackQuiz(topic: string, count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    question: `Sample question ${i + 1}: ${topic} — explain the key concept.`,
    type: 'MCQ' as const,
    marks: 4,
    options: [`Option A for ${topic}`, `Option B for ${topic}`, `Option C for ${topic}`, `Option D for ${topic}`],
    correctAnswer: `Option A for ${topic}`,
    explanation: `Fallback explanation for question ${i + 1} on ${topic}.`,
  }));
}

async function callGemini(body: object): Promise<string | null> {
  if (!API_KEY) {
    console.warn('[Gemini] VITE_GEMINI_API_KEY missing — add it to .env and restart dev server');
    return null;
  }
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error('[Gemini] HTTP error:', res.status, await res.json().catch(() => ({})));
      return null;
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (err) {
    console.error('[Gemini] Request failed:', err);
    return null;
  }
}

// ── TEACHER: generate quiz for a topic ───────────────────────
export async function generateQuiz(topic: string, count: number = 5): Promise<QuizQuestion[]> {
  const text = await callGemini({
    contents: [{
      parts: [{
        text: `Generate exactly ${count} multiple choice quiz questions for school students about: "${topic}".
Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.
Each object must have exactly these fields:
- "question": string
- "options": array of exactly 4 strings
- "correctAnswer": string (must exactly match one option)
- "explanation": string`,
      }],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  if (!text) return getFallbackQuiz(topic, count);

  try {
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
  } catch {
    return getFallbackQuiz(topic, count);
  }
}

// ── STUDENT: self-practice quiz with subject + chapter context ─
export async function generatePracticeQuiz(
  subject: string,
  chapter: string,
  count: number = 5,
): Promise<QuizQuestion[]> {
  const topic = `${chapter} (${subject})`;
  const text = await callGemini({
    contents: [{
      parts: [{
        text: `Generate exactly ${count} multiple choice quiz questions for a school student studying:
Subject: "${subject}"
Chapter: "${chapter}"

Make questions appropriate for school level. Cover key concepts from this chapter.
Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.
Each object must have exactly these fields:
- "question": string
- "options": array of exactly 4 strings
- "correctAnswer": string (must exactly match one option)
- "explanation": string (brief, educational explanation of the correct answer)`,
      }],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  if (!text) return getFallbackQuiz(topic, count);

  try {
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
  } catch {
    return getFallbackQuiz(topic, count);
  }
}

// ── STUDENT: AI Tutor — multi-turn chat ───────────────────────
export type TutorMessage = { role: 'user' | 'model'; text: string };

export async function askAITutor(
  history: TutorMessage[],
  subject: string,
  chapter: string,
): Promise<string> {
  const systemContext = `You are a friendly, encouraging school tutor helping a student study.
Subject: "${subject}" | Chapter: "${chapter}"
Keep answers clear, concise, and appropriate for school level.
Use simple language. If relevant, give examples. Do NOT solve homework directly — guide the student to understand.`;

  const contents = [
    { role: 'user', parts: [{ text: systemContext }] },
    { role: 'model', parts: [{ text: `Got it! I'm ready to help you study ${chapter} in ${subject}. What's your question?` }] },
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
  ];

  const text = await callGemini({ contents });

  if (!text) {
    return `I'm having trouble connecting right now. Please try again in a moment. In the meantime, try reviewing your textbook notes on ${chapter}!`;
  }
  return text.trim();
}

// ── STUDENT: Today's Focus — AI study suggestion ──────────────
export async function generateTodaysFocus(
  upcomingQuizTitles: string[],
  recentWeakSubjects: string[],
  pendingTasks: string[],
): Promise<string> {
  const quizList  = upcomingQuizTitles.length  ? upcomingQuizTitles.join(', ')  : 'none';
  const weakList  = recentWeakSubjects.length  ? recentWeakSubjects.join(', ')  : 'none';
  const taskList  = pendingTasks.length         ? pendingTasks.join(', ')        : 'none';

  const text = await callGemini({
    contents: [{
      parts: [{
        text: `You are a school study advisor. Based on this student's data, give a short, motivating "Today's Focus" recommendation (2-3 sentences max):
- Upcoming quizzes: ${quizList}
- Recent weak subjects: ${weakList}
- Pending tasks: ${taskList}

Be encouraging and specific. Tell them exactly what to prioritize today. Keep it under 60 words.`,
      }],
    }],
  });

  return text?.trim() ?? `Focus on reviewing your pending tasks and prepare for upcoming quizzes. Start with the subject you find most challenging — consistent revision is the key to success!`;
}
