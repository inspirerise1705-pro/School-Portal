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
  classTeacherOf?: string; // Class ID
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
  date: string; // ISO format
  type: 'Lecture' | 'Holiday' | 'Activity' | 'Meeting' | 'Announcement';
  description?: string;
  isGlobal?: boolean;
};
