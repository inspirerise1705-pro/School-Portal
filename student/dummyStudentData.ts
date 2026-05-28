import type {
  SubjectData, ChapterData, QuizData, QuizSubmissionData,
  StudyMaterialData, TaskData, AttendanceRecord,
  TimetableSlot, SchoolCalendarEvent, DoubtData, NotificationData,
} from '../types';

const S  = '00000000-0000-0000-0000-000000000001';
const CL = '00000000-0000-0000-0000-000000000010';
const ST = 'demo-student-001';

// ── Subjects (Class 8 CBSE) ───────────────────────────────────
export const DUMMY_SUBJECTS: SubjectData[] = [
  { id: 'sub-math', school_id: S, name: 'Mathematics',    color: '#3B82F6' },
  { id: 'sub-sci',  school_id: S, name: 'Science',        color: '#10B981' },
  { id: 'sub-eng',  school_id: S, name: 'English',        color: '#EF4444' },
  { id: 'sub-hin',  school_id: S, name: 'Hindi',          color: '#F59E0B' },
  { id: 'sub-san',  school_id: S, name: 'Sanskrit',       color: '#8B5CF6' },
  { id: 'sub-sst',  school_id: S, name: 'Social Studies', color: '#06B6D4' },
  { id: 'sub-comp', school_id: S, name: 'Computer',       color: '#64748B' },
];

// ── Chapters ─────────────────────────────────────────────────
export const DUMMY_CHAPTERS: ChapterData[] = [
  { id: 'ch-m1',  subject_id: 'sub-math', name: 'Rational Numbers',         number: 1 },
  { id: 'ch-m2',  subject_id: 'sub-math', name: 'Linear Equations',         number: 2 },
  { id: 'ch-m3',  subject_id: 'sub-math', name: 'Squares & Square Roots',   number: 3 },
  { id: 'ch-s1',  subject_id: 'sub-sci',  name: 'Crop Production',          number: 1 },
  { id: 'ch-s2',  subject_id: 'sub-sci',  name: 'Microorganisms',           number: 2 },
  { id: 'ch-s3',  subject_id: 'sub-sci',  name: 'Force & Pressure',         number: 3 },
  { id: 'ch-s4',  subject_id: 'sub-sci',  name: 'Chemical Effects of Current', number: 4 },
  { id: 'ch-e1',  subject_id: 'sub-eng',  name: 'The Best Christmas Present', number: 1 },
  { id: 'ch-e2',  subject_id: 'sub-eng',  name: 'The Tsunami',              number: 2 },
  { id: 'ch-h1',  subject_id: 'sub-hin',  name: 'ध्वनि',                    number: 1 },
  { id: 'ch-h2',  subject_id: 'sub-hin',  name: 'लाख की चूड़ियाँ',            number: 2 },
  { id: 'ch-sa1', subject_id: 'sub-san',  name: 'सुभाषितानि',                number: 1 },
  { id: 'ch-ss1', subject_id: 'sub-sst',  name: 'Resources',                number: 1 },
  { id: 'ch-ss2', subject_id: 'sub-sst',  name: 'How, When and Where',      number: 2 },
  { id: 'ch-c1',  subject_id: 'sub-comp', name: 'Introduction to MS Office', number: 1 },
  { id: 'ch-c2',  subject_id: 'sub-comp', name: 'Internet & Networking',    number: 2 },
];

// ── Quiz Questions ────────────────────────────────────────────
const MATH_Qs = [
  { question: 'What is the additive inverse of −7/9?', options: ['7/9', '−7/9', '9/7', '−9/7'], correctAnswer: '7/9', explanation: 'Additive inverse of a number is what you add to get 0. −7/9 + 7/9 = 0.' },
  { question: 'Solve: 2x − 3 = 11', options: ['x = 4', 'x = 7', 'x = 5', 'x = 6'], correctAnswer: 'x = 7', explanation: '2x = 14, so x = 7.' },
  { question: '√144 = ?', options: ['11', '12', '13', '14'], correctAnswer: '12', explanation: '12 × 12 = 144.' },
  { question: 'Which is a perfect square?', options: ['50', '75', '81', '90'], correctAnswer: '81', explanation: '9 × 9 = 81.' },
  { question: '3/4 + 1/6 = ?', options: ['4/10', '11/12', '5/6', '7/12'], correctAnswer: '11/12', explanation: 'LCM of 4 and 6 is 12. 9/12 + 2/12 = 11/12.' },
];
const SCI_Qs = [
  { question: 'Which gas is fixed by Rhizobium bacteria?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Nitrogen', explanation: 'Rhizobium in root nodules fixes atmospheric nitrogen into usable form.' },
  { question: 'Which of these is NOT a microorganism?', options: ['Bacteria', 'Fungi', 'Earthworm', 'Virus'], correctAnswer: 'Earthworm', explanation: 'Earthworms are macroscopic organisms, not microorganisms.' },
  { question: 'Force is measured in which unit?', options: ['Joule', 'Newton', 'Pascal', 'Watt'], correctAnswer: 'Newton', explanation: 'Force is measured in Newtons (N).' },
  { question: 'Which disease is caused by bacteria?', options: ['Malaria', 'Tuberculosis', 'Dengue', 'COVID-19'], correctAnswer: 'Tuberculosis', explanation: 'Tuberculosis (TB) is caused by Mycobacterium tuberculosis bacteria.' },
  { question: 'Pressure = Force / ___', options: ['Mass', 'Volume', 'Area', 'Density'], correctAnswer: 'Area', explanation: 'Pressure = Force ÷ Area (P = F/A).' },
];
const ENG_Qs = [
  { question: 'Who was Traudl in "The Best Christmas Present"?', options: ['A British soldier', 'A German soldier\'s wife', 'A French nurse', 'A school teacher'], correctAnswer: "A German soldier's wife", explanation: 'Traudl was the wife of Hans, a German soldier in WW1.' },
  { question: 'What does "tsunami" mean in Japanese?', options: ['Tidal wave', 'Harbour wave', 'Storm wave', 'Deep wave'], correctAnswer: 'Harbour wave', explanation: '"Tsu" means harbour and "nami" means waves in Japanese.' },
  { question: 'The plural of "child" is?', options: ['Childs', 'Children', 'Childes', 'Childrens'], correctAnswer: 'Children', explanation: '"Children" is the irregular plural of "child".' },
  { question: 'Which tense: "She has been reading for two hours"?', options: ['Simple Present', 'Past Perfect', 'Present Perfect Continuous', 'Future Perfect'], correctAnswer: 'Present Perfect Continuous', explanation: 'Has/have + been + V-ing = Present Perfect Continuous.' },
  { question: 'Antonym of "benevolent" is?', options: ['Kind', 'Generous', 'Malevolent', 'Charitable'], correctAnswer: 'Malevolent', explanation: '"Malevolent" means having or showing a wish to do evil.' },
];
const SST_Qs = [
  { question: 'Which of these is a natural resource?', options: ['Paper', 'Plastic', 'Coal', 'Glass'], correctAnswer: 'Coal', explanation: 'Coal is a natural resource found in the earth.' },
  { question: '"How, When and Where" refers to which aspect of History?', options: ['Geography', 'Politics', 'Dates and sources', 'Economics'], correctAnswer: 'Dates and sources', explanation: 'History is about understanding change over time using dates and historical sources.' },
  { question: 'The Indian Constitution was adopted on?', options: ['15 Aug 1947', '26 Jan 1950', '26 Nov 1949', '2 Oct 1950'], correctAnswer: '26 Nov 1949', explanation: 'The Constitution was adopted on 26 November 1949 (celebrated as Constitution Day).' },
  { question: 'Which is a biotic resource?', options: ['Soil', 'Water', 'Trees', 'Minerals'], correctAnswer: 'Trees', explanation: 'Biotic resources come from the biosphere — living things like plants and animals.' },
  { question: 'James Rennel is known for making maps of?', options: ['Australia', 'India', 'Africa', 'China'], correctAnswer: 'India', explanation: 'James Rennel made the first modern maps of India in the 18th century.' },
];

// ── Quizzes ───────────────────────────────────────────────────
const MATH_S = DUMMY_SUBJECTS[0];
const SCI_S  = DUMMY_SUBJECTS[1];
const ENG_S  = DUMMY_SUBJECTS[2];
const SST_S  = DUMMY_SUBJECTS[5];

export const DUMMY_QUIZZES: QuizData[] = [
  {
    id: 'quiz-001', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-math', chapter_id: 'ch-m2',
    title: 'Linear Equations – Unit Test',
    questions: MATH_Qs, due_date: '2026-06-05', time_limit_minutes: 20,
    published: true, created_at: '2026-05-20T09:00:00Z',
    subjects: MATH_S, chapters: DUMMY_CHAPTERS[1],
  },
  {
    id: 'quiz-002', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-sci', chapter_id: 'ch-s3',
    title: 'Force & Pressure – Quiz',
    questions: SCI_Qs, due_date: '2026-06-10', time_limit_minutes: 15,
    published: true, created_at: '2026-05-22T10:00:00Z',
    subjects: SCI_S, chapters: DUMMY_CHAPTERS[5],
  },
  {
    id: 'quiz-003', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-eng', chapter_id: 'ch-e2',
    title: 'The Tsunami – Comprehension Test',
    questions: ENG_Qs, due_date: '2026-05-15', time_limit_minutes: 15,
    published: true, created_at: '2026-05-01T09:00:00Z',
    subjects: ENG_S, chapters: DUMMY_CHAPTERS[8],
  },
  {
    id: 'quiz-004', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-math', chapter_id: 'ch-m1',
    title: 'Rational Numbers – Chapter Test',
    questions: MATH_Qs, due_date: '2026-04-20', time_limit_minutes: 20,
    published: true, created_at: '2026-04-10T09:00:00Z',
    subjects: MATH_S, chapters: DUMMY_CHAPTERS[0],
  },
  {
    id: 'quiz-005', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-sst', chapter_id: 'ch-ss1',
    title: 'Resources – Social Studies Quiz',
    questions: SST_Qs, due_date: '2026-05-05', time_limit_minutes: 15,
    published: true, created_at: '2026-04-28T09:00:00Z',
    subjects: SST_S, chapters: DUMMY_CHAPTERS[12],
  },
];

// ── Submissions ───────────────────────────────────────────────
export const DUMMY_SUBMISSIONS: QuizSubmissionData[] = [
  {
    id: 'sub-001', quiz_id: 'quiz-003', student_id: ST,
    answers: [
      { questionIndex: 0, selectedAnswer: "A German soldier's wife", isCorrect: true  },
      { questionIndex: 1, selectedAnswer: 'Harbour wave',            isCorrect: true  },
      { questionIndex: 2, selectedAnswer: 'Children',                isCorrect: true  },
      { questionIndex: 3, selectedAnswer: 'Present Perfect Continuous', isCorrect: true },
      { questionIndex: 4, selectedAnswer: 'Malevolent',              isCorrect: true  },
    ],
    score: 5, total: 5,
    submitted_at: '2026-05-10T11:30:00Z',
    grade_published: false,
    quizzes: DUMMY_QUIZZES[2],
  },
  {
    id: 'sub-002', quiz_id: 'quiz-004', student_id: ST,
    answers: [
      { questionIndex: 0, selectedAnswer: '7/9',    isCorrect: true  },
      { questionIndex: 1, selectedAnswer: 'x = 7',  isCorrect: true  },
      { questionIndex: 2, selectedAnswer: '12',     isCorrect: true  },
      { questionIndex: 3, selectedAnswer: '81',     isCorrect: true  },
      { questionIndex: 4, selectedAnswer: '4/10',   isCorrect: false },
    ],
    score: 4, total: 5,
    submitted_at: '2026-04-19T10:15:00Z',
    feedback: 'Good work! Review fraction addition for better scores.',
    grade_published: true,
    quizzes: DUMMY_QUIZZES[3],
  },
  {
    id: 'sub-003', quiz_id: 'quiz-005', student_id: ST,
    answers: [
      { questionIndex: 0, selectedAnswer: 'Coal',               isCorrect: true  },
      { questionIndex: 1, selectedAnswer: 'Dates and sources',  isCorrect: true  },
      { questionIndex: 2, selectedAnswer: '26 Nov 1949',        isCorrect: true  },
      { questionIndex: 3, selectedAnswer: 'Trees',              isCorrect: true  },
      { questionIndex: 4, selectedAnswer: 'Africa',             isCorrect: false },
    ],
    score: 4, total: 5,
    submitted_at: '2026-05-04T09:45:00Z',
    feedback: 'Great understanding of resources! Revise historical facts about India.',
    grade_published: true,
    quizzes: DUMMY_QUIZZES[4],
  },
];

export const DUMMY_ENRICHED_QUIZZES = DUMMY_QUIZZES.map(q => {
  const sub = DUMMY_SUBMISSIONS.find(s => s.quiz_id === q.id);
  const status = !sub ? 'pending' : sub.grade_published ? 'graded' : 'submitted';
  return { ...q, submission: sub, status } as QuizData & {
    submission?: QuizSubmissionData;
    status: 'pending' | 'submitted' | 'graded';
  };
});

// ── Attendance ────────────────────────────────────────────────
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
export const DUMMY_ATTENDANCE: AttendanceRecord[] = (() => {
  const records: AttendanceRecord[] = [];
  let n = 0;
  // Holidays: Jan 26, Apr 14 (Ambedkar Jayanti), May 1 (Labour Day)
  const holidays = new Set(['2026-01-26', '2026-04-14', '2026-05-01']);
  for (let month = 0; month <= 4; month++) {
    const daysInMonth = new Date(2026, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      if (month === 4 && day > 27) continue;
      const dow = new Date(2026, month, day).getDay();
      if (dow === 0) continue; // Sunday = closed
      const dateStr = `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (holidays.has(dateStr)) continue;
      const v = seededRand(month * 100 + day);
      const status: AttendanceRecord['status'] =
        v < 0.82 ? 'present' : v < 0.94 ? 'late' : 'absent';
      records.push({ id: `att-${++n}`, student_id: ST, class_id: CL, date: dateStr, status });
    }
  }
  return records;
})();

// ── Study Materials ───────────────────────────────────────────
export const DUMMY_MATERIALS: StudyMaterialData[] = [
  {
    id: 'mat-001', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-math', chapter_id: 'ch-m2',
    title: 'Linear Equations – Notes & Solved Examples',
    description: 'Step-by-step notes on forming and solving linear equations in one variable. Includes 20 solved examples.',
    file_url: '#', created_at: '2026-05-18T09:00:00Z',
    subjects: MATH_S, chapters: DUMMY_CHAPTERS[1],
  },
  {
    id: 'mat-002', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-sci', chapter_id: 'ch-s3',
    title: 'Force & Pressure – Concept Summary',
    description: 'Complete concept notes with diagrams: types of forces, pressure formula, atmospheric pressure.',
    file_url: '#', created_at: '2026-05-20T10:00:00Z',
    subjects: SCI_S, chapters: DUMMY_CHAPTERS[5],
  },
  {
    id: 'mat-003', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-sst', chapter_id: 'ch-ss1',
    title: 'Resources – Types & Conservation',
    description: 'Notes on natural, human-made and human resources. Includes conservation methods.',
    file_url: '#', created_at: '2026-05-15T09:30:00Z',
    subjects: SST_S, chapters: DUMMY_CHAPTERS[12],
  },
  {
    id: 'mat-004', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-eng', chapter_id: 'ch-e1',
    title: 'The Best Christmas Present – Text & Analysis',
    description: 'Character analysis, theme, important questions and answers for the chapter.',
    file_url: '#', created_at: '2026-05-10T11:00:00Z',
    subjects: ENG_S, chapters: DUMMY_CHAPTERS[7],
  },
  {
    id: 'mat-005', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-hin', chapter_id: 'ch-h1',
    title: 'ध्वनि – कविता व्याख्या और प्रश्नोत्तर',
    description: 'कविता की पूर्ण व्याख्या, कठिन शब्दार्थ और परीक्षा उपयोगी प्रश्न-उत्तर।',
    file_url: '#', created_at: '2026-05-08T09:00:00Z',
    subjects: DUMMY_SUBJECTS[3], chapters: DUMMY_CHAPTERS[9],
  },
  {
    id: 'mat-006', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-math', chapter_id: 'ch-m3',
    title: 'Squares & Square Roots – Formula & Methods',
    description: 'All methods to find squares and square roots: prime factorisation, long division method.',
    file_url: '#', created_at: '2026-04-25T10:00:00Z',
    subjects: MATH_S, chapters: DUMMY_CHAPTERS[2],
  },
  {
    id: 'mat-007', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-comp', chapter_id: 'ch-c2',
    title: 'Internet & Networking – Basic Concepts',
    description: 'Introduction to Internet, IP addresses, types of networks (LAN, WAN, MAN), browsers and search engines.',
    file_url: '#', created_at: '2026-05-12T10:00:00Z',
    subjects: DUMMY_SUBJECTS[6], chapters: DUMMY_CHAPTERS[15],
  },
];

// ── Tasks ─────────────────────────────────────────────────────
export const DUMMY_TASKS: TaskData[] = [
  {
    id: 'task-001', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-math', chapter_id: 'ch-m2',
    title: 'Solve 10 linear equations (Exercise 2.3)',
    description: 'Complete Exercise 2.3 Q1–Q10 from NCERT. Show all working steps. Submit in rough notebook.',
    due_date: '2026-05-30', created_at: '2026-05-22T09:00:00Z',
    subjects: MATH_S, chapters: DUMMY_CHAPTERS[1],
  },
  {
    id: 'task-002', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-sci',
    title: 'Science Project – Effects of Pressure',
    description: 'Demonstrate pressure using a balloon experiment. Write a report with observations and conclusion.',
    due_date: '2026-06-02', created_at: '2026-05-25T10:00:00Z',
    subjects: SCI_S,
  },
  {
    id: 'task-003', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-eng',
    title: 'Write a letter to a friend about a trip',
    description: 'Write an informal letter (150–180 words) to a friend describing a recent school trip.',
    due_date: '2026-05-28', created_at: '2026-05-20T09:00:00Z',
    subjects: ENG_S,
  },
  {
    id: 'task-004', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-sst', chapter_id: 'ch-ss1',
    title: 'Make a chart on types of resources',
    description: 'Create a colourful A3 chart showing natural, human-made and human resources with examples.',
    due_date: '2026-05-27', created_at: '2026-05-19T11:00:00Z',
    subjects: SST_S, chapters: DUMMY_CHAPTERS[12],
  },
  {
    id: 'task-005', school_id: S, class_id: CL, teacher_id: 'teacher-001',
    subject_id: 'sub-hin', chapter_id: 'ch-h2',
    title: 'लाख की चूड़ियाँ – चरित्र-चित्रण',
    description: 'बदलू के चरित्र का वर्णन करें (150 शब्दों में)। कहानी के मुख्य संदेश को भी स्पष्ट करें।',
    due_date: '2026-05-22', created_at: '2026-05-15T09:00:00Z',
    subjects: DUMMY_SUBJECTS[3], chapters: DUMMY_CHAPTERS[10],
  },
];

// ── Doubts ────────────────────────────────────────────────────
export const DUMMY_DOUBTS: DoubtData[] = [
  {
    id: 'doubt-001', school_id: S, class_id: CL, student_id: ST,
    subject_id: 'sub-math', chapter_id: 'ch-m2',
    question: 'While solving 3(x − 4) = 2x + 1, should I expand the bracket first or bring x terms to one side first? Which way is correct?',
    teacher_reply: 'Both approaches work! Expanding first is generally cleaner: 3x − 12 = 2x + 1 → x = 13. Always expand brackets before moving terms to avoid sign errors.',
    replied_at: '2026-05-21T14:00:00Z', replied_by: 'Ms. Priya Sharma',
    status: 'answered', created_at: '2026-05-20T10:00:00Z',
    subjects: MATH_S, chapters: DUMMY_CHAPTERS[1],
  },
  {
    id: 'doubt-002', school_id: S, class_id: CL, student_id: ST,
    subject_id: 'sub-sci', chapter_id: 'ch-s2',
    question: 'Are all bacteria harmful to us? My textbook says Rhizobium is helpful — are there other helpful bacteria?',
    teacher_reply: 'Great observation! Most bacteria are actually beneficial. Lactobacillus in curd, bacteria that decompose waste, nitrogen-fixing bacteria like Rhizobium — all are helpful. Only a small fraction causes disease.',
    replied_at: '2026-05-23T15:30:00Z', replied_by: 'Mr. Ramesh Kumar',
    status: 'answered', created_at: '2026-05-22T11:00:00Z',
    subjects: SCI_S, chapters: DUMMY_CHAPTERS[4],
  },
  {
    id: 'doubt-003', school_id: S, class_id: CL, student_id: ST,
    subject_id: 'sub-sst', chapter_id: 'ch-ss2',
    question: 'How do historians decide which source is reliable? What if two sources say different things about the same event?',
    status: 'pending', created_at: '2026-05-25T09:00:00Z',
    subjects: SST_S, chapters: DUMMY_CHAPTERS[13],
  },
  {
    id: 'doubt-004', school_id: S, class_id: CL, student_id: ST,
    subject_id: 'sub-eng', chapter_id: 'ch-e2',
    question: 'In the Tsunami chapter, how did animals sense the tsunami before humans? Does this happen because of a special sense organ?',
    status: 'pending', created_at: '2026-05-26T14:00:00Z',
    subjects: ENG_S, chapters: DUMMY_CHAPTERS[8],
  },
];

// ── Timetable (Class 8 — Mon to Sat, 6 periods) ───────────────
// Periods per week: Math 6, Science 6, English 5, Hindi 5, SST 5, Sanskrit 4, Computer 5
const PERIODS = [
  { n: 1, start: '08:00', end: '08:45' },
  { n: 2, start: '08:45', end: '09:30' },
  { n: 3, start: '09:45', end: '10:30' },
  { n: 4, start: '10:30', end: '11:15' },
  { n: 5, start: '11:30', end: '12:15' },
  { n: 6, start: '12:15', end: '13:00' },
];

const T: Record<string, string> = {
  'sub-math': 'Ms. Priya Sharma',
  'sub-sci':  'Mr. Ramesh Kumar',
  'sub-eng':  'Ms. Anita Roy',
  'sub-hin':  'Ms. Sunita Verma',
  'sub-san':  'Mr. Dinesh Pandey',
  'sub-sst':  'Ms. Kavitha Nair',
  'sub-comp': 'Mr. Vivek Mishra',
};

const C: Record<string, [string, string]> = {
  'sub-math': ['Mathematics',    '#3B82F6'],
  'sub-sci':  ['Science',        '#10B981'],
  'sub-eng':  ['English',        '#EF4444'],
  'sub-hin':  ['Hindi',          '#F59E0B'],
  'sub-san':  ['Sanskrit',       '#8B5CF6'],
  'sub-sst':  ['Social Studies', '#06B6D4'],
  'sub-comp': ['Computer',       '#64748B'],
};

const TT_PLAN: Array<[string, string[]]> = [
  ['Monday',    ['sub-math','sub-sci', 'sub-eng', 'sub-hin','sub-sst', 'sub-comp']],
  ['Tuesday',   ['sub-sci', 'sub-math','sub-hin', 'sub-san','sub-eng', 'sub-sst' ]],
  ['Wednesday', ['sub-eng', 'sub-sst', 'sub-math','sub-sci','sub-hin', 'sub-math']],
  ['Thursday',  ['sub-sst', 'sub-comp','sub-sci', 'sub-eng','sub-math','sub-hin' ]],
  ['Friday',    ['sub-hin', 'sub-san', 'sub-sst', 'sub-math','sub-comp','sub-sci']],
  ['Saturday',  ['sub-math','sub-eng', 'sub-sci', 'sub-sst','sub-hin', 'sub-san' ]],
];

export const DUMMY_TIMETABLE: TimetableSlot[] = (() => {
  const slots: TimetableSlot[] = [];
  let id = 0;
  for (const [day, subs] of TT_PLAN) {
    PERIODS.forEach((p, i) => {
      const subId = subs[i];
      const [name, color] = C[subId];
      slots.push({
        id: `slot-${++id}`, class_id: CL, day_of_week: day,
        period_number: p.n, subject_id: subId,
        start_time: p.start, end_time: p.end,
        subjects: { name, color },
        teachers: { name: T[subId] },
      });
    });
  }
  return slots;
})();

// ── Calendar Events (2026 — school notices, holidays, exams) ──
export const DUMMY_EVENTS: SchoolCalendarEvent[] = [
  // Upcoming exams
  { id: 'evt-001', school_id: S, class_id: CL, title: 'Unit Test – Mathematics',       date: '2026-06-05', type: 'Exam',         description: 'Syllabus: Ch 1–3 (Rational Numbers, Linear Equations, Squares). Duration: 1 hour.',        is_global: false, created_at: '2026-05-15T09:00:00Z' },
  { id: 'evt-002', school_id: S, class_id: CL, title: 'Unit Test – Science',           date: '2026-06-08', type: 'Exam',         description: 'Syllabus: Force & Pressure, Chemical Effects of Current. Duration: 1 hour.',               is_global: false, created_at: '2026-05-15T09:00:00Z' },
  { id: 'evt-016', school_id: S, class_id: CL, title: 'Half-Yearly Exams – Timetable Released', date: '2026-08-01', type: 'Announcement', description: 'Half-yearly exam schedule for Class 8 released. Exams begin 15 September.', is_global: false, created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-017', school_id: S,               title: 'Half-Yearly Exams Begin',       date: '2026-09-15', type: 'Exam',         description: 'Half-yearly examinations for all classes. Report by 8:00 AM.',                             is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  // Meetings
  { id: 'evt-003', school_id: S,               title: 'Parent-Teacher Meeting',        date: '2026-06-10', type: 'Meeting',      description: 'Annual PTM for all classes. Parents must bring Report Card. 9 AM – 1 PM.',                  is_global: true,  created_at: '2026-05-10T09:00:00Z' },
  // Activities / school events
  { id: 'evt-004', school_id: S,               title: 'Annual Day Celebrations',       date: '2026-07-15', type: 'Activity',     description: 'Annual Day cultural programme. Practice sessions start June 25. All students participate.', is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-005', school_id: S,               title: 'Science Exhibition',            date: '2026-06-18', type: 'Activity',     description: 'Inter-class science exhibition. Project submission deadline: June 14.',                    is_global: true,  created_at: '2026-05-12T09:00:00Z' },
  { id: 'evt-006', school_id: S,               title: 'Annual Sports Day',             date: '2026-07-22', type: 'Activity',     description: 'Annual sports meet. Events: 100m, relay, long jump, tug-of-war. All students must participate.', is_global: true, created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-015', school_id: S, class_id: CL, title: 'Debate Competition – Class 8', date: '2026-06-20', type: 'Activity',     description: 'Inter-section debate competition. Topic announced separately. Participants register by June 12.', is_global: false, created_at: '2026-05-24T09:00:00Z' },
  // Holidays
  { id: 'evt-007', school_id: S,               title: 'Republic Day – Holiday',        date: '2026-01-26', type: 'Holiday',      description: 'Republic Day national holiday. Flag hoisting at 8 AM for those attending.',                 is_global: true,  created_at: '2026-01-01T09:00:00Z' },
  { id: 'evt-008', school_id: S,               title: 'Eid al-Adha – Holiday',         date: '2026-06-07', type: 'Holiday',      description: 'School remains closed for Eid al-Adha.',                                                   is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-009', school_id: S,               title: 'Independence Day – Holiday',    date: '2026-08-15', type: 'Holiday',      description: 'Independence Day. Flag hoisting at school at 8 AM.',                                       is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-010', school_id: S,               title: 'Gandhi Jayanti – Holiday',      date: '2026-10-02', type: 'Holiday',      description: 'Gandhi Jayanti national holiday.',                                                         is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-011', school_id: S,               title: 'Diwali Vacation Begins',        date: '2026-10-20', type: 'Holiday',      description: 'School closes for Diwali vacation. Reopens November 3.',                                   is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-018', school_id: S,               title: 'Christmas Break Begins',        date: '2026-12-24', type: 'Holiday',      description: 'Winter vacation begins. School reopens January 4, 2027.',                                  is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  // Notices / Announcements
  { id: 'evt-012', school_id: S,               title: 'School Reopens After Summer',   date: '2026-06-15', type: 'Announcement', description: 'School reopens after summer break. New timetable will be distributed on first day.',        is_global: true,  created_at: '2026-05-01T09:00:00Z' },
  { id: 'evt-013', school_id: S, class_id: CL, title: 'Physics Lab – Extended Class', date: '2026-05-28', type: 'Lecture',      description: 'Extended class for Force & Pressure experiments. Bring lab coat and copy.',                 is_global: false, created_at: '2026-05-24T09:00:00Z' },
  { id: 'evt-014', school_id: S,               title: 'Book Fair at School',           date: '2026-06-25', type: 'Activity',     description: 'Annual school book fair in the main hall. Open to all students 10 AM – 4 PM.',             is_global: true,  created_at: '2026-05-20T09:00:00Z' },
  { id: 'evt-019', school_id: S,               title: 'Fee Payment Reminder',          date: '2026-06-30', type: 'Announcement', description: 'Last date for June term fee payment. Late fee applicable after July 5.',                  is_global: true,  created_at: '2026-05-01T09:00:00Z' },
];

// ── Subject averages (all exams — unit tests + term exams) ────
export const DUMMY_SUBJECT_AVGS: { name: string; color: string; avg: number }[] = [
  { name: 'Mathematics',    color: '#3B82F6', avg: 76 },
  { name: 'Science',        color: '#10B981', avg: 82 },
  { name: 'English',        color: '#EF4444', avg: 88 },
  { name: 'Hindi',          color: '#F59E0B', avg: 72 },
  { name: 'Sanskrit',       color: '#8B5CF6', avg: 68 },
  { name: 'Social Studies', color: '#06B6D4', avg: 80 },
  { name: 'Computer',       color: '#64748B', avg: 91 },
];

// ── Notifications ─────────────────────────────────────────────
export const DUMMY_NOTIFICATIONS: NotificationData[] = [
  { id: 'notif-001', school_id: S, recipient_id: ST, type: 'quiz_assigned',  title: 'New Quiz Assigned',   message: '"Force & Pressure – Quiz" assigned to your class. Due: June 10.',                    read: false, created_at: '2026-05-22T10:00:00Z' },
  { id: 'notif-002', school_id: S, recipient_id: ST, type: 'grade_published', title: 'Result Published',    message: 'Grade for "Resources – Social Studies Quiz" published. You scored 4/5.',             read: false, created_at: '2026-05-21T15:00:00Z' },
  { id: 'notif-003', school_id: S, recipient_id: ST, type: 'doubt_answered', title: 'Doubt Answered',      message: 'Your doubt about bacteria has been answered by Mr. Ramesh Kumar.',                    read: false, created_at: '2026-05-23T15:30:00Z' },
  { id: 'notif-004', school_id: S, recipient_id: ST, type: 'announcement',   title: 'PTM on June 10',      message: 'Parent-Teacher Meeting scheduled for June 10. Inform your parents to attend.',         read: true,  created_at: '2026-05-20T09:00:00Z' },
  { id: 'notif-005', school_id: S, recipient_id: ST, type: 'quiz_assigned',  title: 'New Quiz Assigned',   message: '"Linear Equations – Unit Test" assigned. Due: June 5.',                               read: true,  created_at: '2026-05-20T09:30:00Z' },
  { id: 'notif-006', school_id: S, recipient_id: ST, type: 'task_assigned',  title: 'New Assignment',      message: '"Science Project – Effects of Pressure" assigned. Submit by June 2.',                  read: true,  created_at: '2026-05-25T10:00:00Z' },
  { id: 'notif-007', school_id: S, recipient_id: ST, type: 'grade_published', title: 'Result Published',   message: 'Grade for "Rational Numbers – Chapter Test" published. You scored 4/5.',              read: true,  created_at: '2026-04-20T12:00:00Z' },
  { id: 'notif-008', school_id: S, recipient_id: ST, type: 'announcement',   title: 'Annual Day Notice',   message: 'Annual Day celebrations on July 15. Practice sessions begin June 25. Stay back!',      read: true,  created_at: '2026-05-12T09:00:00Z' },
];
