import { QuizQuestion } from "./types";

const API_KEY  = import.meta.env.VITE_GEMINI_API_KEY as string;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Strip markdown code fences Gemini sometimes wraps JSON in, even with responseMimeType
function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : raw.trim();
}

function getFallbackQuiz(topic: string, count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    question: `Question ${i + 1}: Explain a key concept from "${topic}".`,
    type: 'MCQ' as const,
    marks: 4,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    explanation: `This is a placeholder question about ${topic}. Real questions will appear when the AI responds.`,
  }));
}

async function callGemini(body: object): Promise<string | null> {
  if (!API_KEY) {
    throw new Error('Gemini API key missing. Add VITE_GEMINI_API_KEY to your .env file and restart.');
  }
  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as any)?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Gemini: ${msg}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

function parseQuizJSON(text: string | null, topic: string, count: number): QuizQuestion[] {
  if (!text) return getFallbackQuiz(topic, count);
  try {
    const parsed = JSON.parse(extractJSON(text));
    if (!Array.isArray(parsed) || parsed.length === 0) return getFallbackQuiz(topic, count);
    return parsed.map((q: any) => ({
      question:      q.question      ?? '',
      type:          q.type          ?? 'MCQ',
      marks:         q.marks         ?? 4,
      options:       Array.isArray(q.options) ? q.options : undefined,
      correctAnswer: q.correctAnswer ?? q.answer ?? undefined,
      answer:        q.answer        ?? undefined,
      explanation:   q.explanation   ?? '',
    }));
  } catch {
    return getFallbackQuiz(topic, count);
  }
}

// ── TEACHER: generate MCQ quiz for a topic ────────────────────
export async function generateQuiz(topic: string, count: number = 5): Promise<QuizQuestion[]> {
  const text = await callGemini({
    contents: [{ parts: [{
      text: `Generate exactly ${count} multiple choice quiz questions for school students about: "${topic}".
Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.
Each item must have:
- "question": string
- "options": array of exactly 4 strings
- "correctAnswer": string (must exactly match one option)
- "explanation": string`,
    }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  return parseQuizJSON(text, topic, count);
}

// ── TEACHER: generate full question paper (mixed types) ───────
export async function generateQuestionPaper(
  topic: string,
  totalMarks: number,
): Promise<QuizQuestion[]> {
  // Decide question breakdown based on total marks
  const mcqCount   = Math.max(2, Math.floor(totalMarks / 16));
  const shortCount = Math.max(2, Math.floor(totalMarks / 20));
  const longCount  = Math.max(1, Math.floor(totalMarks / 40));

  const text = await callGemini({
    contents: [{ parts: [{
      text: `Generate a school-level question paper on the topic: "${topic}".
Total marks: approximately ${totalMarks}.
Include:
- ${mcqCount} MCQ questions (4 marks each) — provide 4 options and a correct answer
- ${shortCount} Short Answer questions (4 marks each) — provide expected answer
- ${longCount} Long Answer questions (8 marks each) — provide a model answer

Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.
Each item must have these fields:
- "question": string
- "type": one of "MCQ", "Short Answer", "Long Answer"
- "marks": number (4 or 8)
- "options": array of 4 strings (MCQ only, omit for others)
- "correctAnswer": string (MCQ only — must match one option exactly)
- "answer": string (Short/Long Answer — the model answer)
- "explanation": string (brief explanation of the answer)`,
    }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  return parseQuizJSON(text, topic, mcqCount + shortCount + longCount);
}

// ── STUDENT: self-practice quiz ───────────────────────────────
export async function generatePracticeQuiz(
  subject: string,
  chapter: string,
  count: number = 5,
): Promise<QuizQuestion[]> {
  try {
    const text = await callGemini({
      contents: [{ parts: [{
        text: `Generate exactly ${count} multiple choice quiz questions for a school student.
Subject: "${subject}"
Chapter: "${chapter}"

Make questions appropriate for school level covering key concepts from this chapter.
Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.
Each item must have:
- "question": string
- "options": array of exactly 4 strings
- "correctAnswer": string (must exactly match one option)
- "explanation": string (brief, educational explanation of the correct answer)`,
      }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    return parseQuizJSON(text, `${chapter} (${subject})`, count);
  } catch {
    return getFallbackQuiz(`${chapter} (${subject})`, count);
  }
}

// ── STUDENT: AI Tutor multi-turn chat ─────────────────────────
export type TutorMessage = { role: 'user' | 'model'; text: string };

export async function askAITutor(
  history: TutorMessage[],
  subject: string,
  chapter: string,
): Promise<string> {
  const systemPrompt = `You are a friendly, encouraging school tutor helping a student understand their syllabus.
Subject: "${subject}" | Chapter: "${chapter}"
Rules:
- Keep answers concise and appropriate for school level.
- Use simple language with examples where helpful.
- Guide the student to understand — do NOT just give final answers to homework.
- If the question is off-topic, gently redirect to the chapter.`;

  const contents = [
    { role: 'user',  parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: `Ready! Ask me anything about "${chapter}" in ${subject}.` }] },
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
  ];

  try {
    const text = await callGemini({ contents });
    return text?.trim()
      ?? `I'm having trouble connecting right now. Please try again in a moment. In the meantime, review your textbook notes on "${chapter}"!`;
  } catch {
    return `I'm having trouble connecting right now. Please try again in a moment. In the meantime, review your textbook notes on "${chapter}"!`;
  }
}

// ── STUDENT: Today's Focus study suggestion ───────────────────
export async function generateTodaysFocus(
  upcomingQuizTitles: string[],
  recentWeakSubjects: string[],
  pendingTasks: string[],
): Promise<string> {
  const quizList = upcomingQuizTitles.length ? upcomingQuizTitles.join(', ') : 'none';
  const weakList = recentWeakSubjects.length ? recentWeakSubjects.join(', ')  : 'none';
  const taskList = pendingTasks.length        ? pendingTasks.join(', ')        : 'none';

  try {
    const text = await callGemini({
      contents: [{ parts: [{
        text: `You are a school study advisor. Give a short, motivating "Today's Focus" recommendation (2–3 sentences, under 60 words):
- Upcoming quizzes: ${quizList}
- Subjects needing improvement: ${weakList}
- Pending tasks: ${taskList}
Be encouraging and specific. Tell the student exactly what to prioritise today.`,
      }] }],
    });

    return text?.trim()
      ?? 'Focus on your most challenging subject today and review any pending tasks. Consistent daily revision is the key to success — even 30 minutes of focused study makes a big difference!';
  } catch {
    return 'Focus on your most challenging subject today and review any pending tasks. Consistent daily revision is the key to success — even 30 minutes of focused study makes a big difference!';
  }
}
