// ============================================================
// TEACHER-SIDE TYPES (original — untouched)
// ============================================================

export type Student = {
  id: string;
  name: string;
  attendance: number;
  grade: string;
  performance: number[];
  feesStatus: 'Paid' | 'Pending' | 'Overdue';
  avatar: string;
};

export type ClassInfo = {
  id: string;
  name: string;
  section: string;
  studentsCount: number;
  performance: number;
  isClassTeacher: boolean;
};

export type Subject = {
  id: string;
  name: string;
  assignedClasses: { classId: string; section: string }[];
};

export type Teacher = {
  name: string;
  role: string;
  avatar: string;
  classTeacherOf?: string;
  subjects: Subject[];
};

export type QuizQuestion = {
  question: string;
  type?: 'MCQ' | 'Fill in the Blank' | 'Diagram' | 'Short Answer' | 'Long Answer';
  marks?: 4 | 6 | 8;
  options?: string[];
  correctAnswer?: string;
  answer?: string;
  explanation?: string;
};

export type StudentQuizSubmission = {
  id: string;
  studentId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  answers: { questionIndex: number; selectedAnswer: string; isCorrect: boolean }[];
};

export type QuestionPaper = {
  id: string;
  title: string;
  subject: string;
  marks: 20 | 50 | 100;
  sections: {
    title: string;
    questions: {
      type: 'MCQ' | 'Short' | 'Long';
      text: string;
      marks: number;
      answerKey?: string;
    }[];
  }[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: 'Lecture' | 'Holiday' | 'Activity' | 'Meeting' | 'Announcement';
  description?: string;
  isGlobal?: boolean;
};

// ============================================================
// STUDENT-SIDE TYPES (Supabase-backed)
// ============================================================

export type StudentProfile = {
  id: string;
  user_id: string;
  school_id: string;
  class_id: string;
  name: string;
  email?: string;
  roll_number?: string;
  avatar?: string;
  fees_status: 'paid' | 'pending' | 'overdue';
  class?: { name: string; section: string } | null;
};

export type SubjectData = {
  id: string;
  school_id: string;
  name: string;
  color: string;
};

export type ChapterData = {
  id: string;
  subject_id: string;
  name: string;
  number: number;
};

export type QuizData = {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  questions: QuizQuestion[];
  due_date?: string;
  time_limit_minutes: number;
  published: boolean;
  created_at: string;
  subjects?: SubjectData | null;
  chapters?: ChapterData | null;
};

export type QuizSubmissionData = {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: { questionIndex: number; selectedAnswer: string; isCorrect: boolean }[];
  score: number;
  total: number;
  submitted_at: string;
  feedback?: string;
  grade_published: boolean;
  quizzes?: QuizData | null;
};

export type TaskData = {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
  subjects?: SubjectData | null;
  chapters?: ChapterData | null;
};

export type StudyMaterialData = {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  description?: string;
  file_url?: string;
  created_at: string;
  subjects?: SubjectData | null;
  chapters?: ChapterData | null;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
};

export type TimetableSlot = {
  id: string;
  class_id: string;
  day_of_week: string;
  period_number: number;
  subject_id?: string;
  teacher_id?: string;
  start_time: string;
  end_time: string;
  subjects?: { name: string; color: string } | null;
  teachers?: { name: string } | null;
};

export type TimetableOverride = {
  id: string;
  class_id: string;
  date: string;
  period_number: number;
  subject_id?: string;
  teacher_id?: string;
  reason?: string;
  is_free_period: boolean;
  subjects?: { name: string; color: string } | null;
  teachers?: { name: string } | null;
};

export type SchoolCalendarEvent = {
  id: string;
  school_id: string;
  class_id?: string;
  title: string;
  date: string;
  type: 'Lecture' | 'Holiday' | 'Activity' | 'Meeting' | 'Announcement' | 'Exam';
  description?: string;
  is_global: boolean;
  created_at: string;
};

export type DoubtData = {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  subject_id?: string;
  chapter_id?: string;
  question: string;
  teacher_reply?: string;
  replied_at?: string;
  replied_by?: string;
  status: 'pending' | 'answered';
  created_at: string;
  subjects?: SubjectData | null;
  chapters?: ChapterData | null;
};

export type NotificationData = {
  id: string;
  school_id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type CreditBalance = {
  balance: number;
  total_allocated: number;
  total_used: number;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  action_type: string;
  credits_delta: number;
  balance_after: number;
  description?: string;
  created_at: string;
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price_inr: number;
  is_active: boolean;
};

export type CreditRequest = {
  id: string;
  user_id: string;
  school_id: string;
  package_id?: string;
  credits_requested: number;
  status: 'pending' | 'approved' | 'denied';
  note?: string;
  created_at: string;
};

// ============================================================
// CREDIT COST CONSTANTS
// ============================================================

export const CREDIT_COSTS = {
  AI_TUTOR_MESSAGE:       1,
  SELF_PRACTICE_5Q:       3,
  SELF_PRACTICE_10Q:      5,
  SELF_PRACTICE_15Q:      7,
  TODAY_FOCUS:            1,
  TEACHER_QUIZ_GEN:       5,
  TEACHER_PAPER_GEN:      10,
} as const;

export type CreditActionType = keyof typeof CREDIT_COSTS;
