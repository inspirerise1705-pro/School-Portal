import { Student, ClassInfo, Teacher, StudentQuizSubmission, CalendarEvent } from './types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Aaryan Kapoor',
    attendance: 98,
    grade: 'A+',
    performance: [92, 95, 98, 94, 97, 99],
    feesStatus: 'Paid',
    avatar: 'https://picsum.photos/seed/aaryan/200/200',
  },
  {
    id: '2',
    name: 'Ishaan Verma',
    attendance: 85,
    grade: 'B',
    performance: [72, 78, 80, 85, 75, 82],
    feesStatus: 'Pending',
    avatar: 'https://picsum.photos/seed/ishaan/200/200',
  },
  {
    id: '3',
    name: 'Diya Malhotra',
    attendance: 92,
    grade: 'A',
    performance: [88, 90, 85, 92, 89, 91],
    feesStatus: 'Paid',
    avatar: 'https://picsum.photos/seed/diya/200/200',
  },
  {
    id: '4',
    name: 'Ananya Reddy',
    attendance: 78,
    grade: 'C',
    performance: [62, 65, 70, 68, 64, 66],
    feesStatus: 'Overdue',
    avatar: 'https://picsum.photos/seed/ananya/200/200',
  },
  {
    id: '5',
    name: 'Rohan Gupta',
    attendance: 88,
    grade: 'B+',
    performance: [80, 82, 85, 83, 84, 86],
    feesStatus: 'Paid',
    avatar: 'https://picsum.photos/seed/rohan/200/200',
  },
  {
    id: '6',
    name: 'Sanya Mirza',
    attendance: 95,
    grade: 'A+',
    performance: [95, 96, 97, 95, 98, 99],
    feesStatus: 'Paid',
    avatar: 'https://picsum.photos/seed/sanya/200/200',
  }
];

export const mockClasses: ClassInfo[] = [
  { id: '6A', name: 'Class 6', section: 'A', studentsCount: 42, performance: 81, isClassTeacher: true },
  { id: '7B', name: 'Class 7', section: 'B', studentsCount: 38, performance: 76, isClassTeacher: false },
  { id: '8A', name: 'Class 8', section: 'A', studentsCount: 45, performance: 88, isClassTeacher: false },
  { id: '9C', name: 'Class 9', section: 'C', studentsCount: 40, performance: 91, isClassTeacher: false },
];

export const mockTeacher: Teacher = {
  name: 'Mrs. Anjali Sharma',
  role: 'Senior Academic Lead',
  avatar: 'https://picsum.photos/seed/anjali/200/200',
  classTeacherOf: '6A',
  subjects: [
    {
      id: 'sub1',
      name: 'History',
      assignedClasses: [
        { classId: '6A', section: 'A' },
        { classId: '8A', section: 'A' },
      ],
    },
    {
      id: 'sub2',
      name: 'Geography',
      assignedClasses: [
        { classId: '7B', section: 'B' },
        { classId: '9C', section: 'C' },
      ],
    },
    {
      id: 'sub3',
      name: 'Civics',
      assignedClasses: [
        { classId: '6A', section: 'A' },
      ],
    },
    {
      id: 'sub4',
      name: 'Physics',
      assignedClasses: [
        { classId: '9C', section: 'C' },
      ],
    },
  ],
};

export const mockQuizSubmissions: StudentQuizSubmission[] = [
  {
    id: 'sub-1',
    studentId: '1',
    quizTitle: 'Atmosphere Dynamics',
    score: 9,
    totalQuestions: 10,
    submittedAt: new Date().toISOString(),
    answers: [{ questionIndex: 0, selectedAnswer: 'Troposphere', isCorrect: true }]
  },
  {
    id: 'sub-2',
    studentId: '2',
    quizTitle: 'Atmosphere Dynamics',
    score: 6,
    totalQuestions: 10,
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    answers: [{ questionIndex: 0, selectedAnswer: 'Exosphere', isCorrect: false }]
  },
  {
    id: 'sub-3',
    studentId: '3',
    quizTitle: 'Atmosphere Dynamics',
    score: 10,
    totalQuestions: 10,
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    answers: [{ questionIndex: 0, selectedAnswer: 'Ionosphere', isCorrect: true }]
  },
  {
    id: 'sub-4',
    studentId: '5',
    quizTitle: 'Atmosphere Dynamics',
    score: 8,
    totalQuestions: 10,
    submittedAt: new Date(Date.now() - 14400000).toISOString(),
    answers: []
  },
  {
    id: 'sub-5',
    studentId: '6',
    quizTitle: 'Atmosphere Dynamics',
    score: 10,
    totalQuestions: 10,
    submittedAt: new Date(Date.now() - 500000).toISOString(),
    answers: []
  },
  {
    id: 'sub-6',
    studentId: '1',
    quizTitle: 'Trade Routes of India',
    score: 15,
    totalQuestions: 20,
    submittedAt: new Date().toISOString(),
    answers: []
  },
  {
    id: 'sub-7',
    studentId: '4',
    quizTitle: 'Trade Routes of India',
    score: 12,
    totalQuestions: 20,
    submittedAt: new Date().toISOString(),
    answers: []
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'ev-1', title: 'History Unit Test', date: new Date().toISOString(), type: 'Lecture', description: 'Review of Class 6 Syllabus' },
  { id: 'ev-2', title: 'Eid-ul-Fitr (Tentative)', date: '2026-04-10T00:00:00Z', type: 'Holiday', isGlobal: true },
  { id: 'ev-3', title: 'Inter-House Debate', date: new Date(Date.now() + 86400000 * 5).toISOString(), type: 'Activity', description: 'Mandatory for all 8th graders' },
  { id: 'ev-4', title: 'Annual Day Practice', date: new Date().toISOString(), type: 'Activity', isGlobal: true },
  { id: 'ev-5', title: 'Summer Vacations Prep', date: new Date(Date.now() + 86400000 * 2).toISOString(), type: 'Announcement', isGlobal: true }
];
