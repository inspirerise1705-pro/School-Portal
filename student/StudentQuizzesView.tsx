'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Trophy,
  ChevronRight, ChevronLeft, Loader2, AlertCircle, BookOpen,
  Filter, Search, Play, Eye, Star, Timer
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, QuizData, QuizSubmissionData, SubjectData, ChapterData } from '../types';
import { DUMMY_ENRICHED_QUIZZES, DUMMY_SUBJECTS } from './dummyStudentData';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

type QuizState = 'list' | 'confirm' | 'taking' | 'result';

type EnrichedQuiz = QuizData & {
  submission?: QuizSubmissionData;
  status: 'pending' | 'submitted' | 'graded';
};

function statusBadge(status: string) {
  if (status === 'graded')    return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25';
  if (status === 'submitted') return 'bg-blue-500/20 text-blue-400 border border-blue-500/25';
  return 'bg-amber-500/20 text-amber-400 border border-amber-500/25';
}

function statusLabel(status: string) {
  if (status === 'graded')    return 'Graded';
  if (status === 'submitted') return 'Submitted';
  return 'Pending';
}

function scorePercent(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = scorePercent(score, total);
  const color = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
  return <span className={`text-lg font-black ${color}`}>{score}/{total}</span>;
}

// ── Quiz Card ────────────────────────────────────────────────
function QuizCard({ quiz, onAction }: { quiz: EnrichedQuiz; onAction: (q: EnrichedQuiz) => void }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm sm:text-base truncate">{quiz.title}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {quiz.subjects?.name && (
              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                {quiz.subjects.name}
              </span>
            )}
            {quiz.chapters?.name && (
              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                Ch. {quiz.chapters.name}
              </span>
            )}
          </div>
        </div>
        <span className={`shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${statusBadge(quiz.status)}`}>
          {statusLabel(quiz.status)}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {quiz.questions?.length ?? 0} questions
        </span>
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          {quiz.time_limit_minutes} min
        </span>
        {quiz.due_date && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Due {new Date(quiz.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {quiz.status === 'graded' && quiz.submission && (
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <span className="text-xs text-white/50">Your score</span>
          <ScoreBadge score={quiz.submission.score} total={quiz.submission.total} />
        </div>
      )}

      {quiz.submission?.feedback && quiz.status === 'graded' && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2">
          <p className="text-[11px] text-blue-300/70 font-semibold uppercase tracking-wider mb-0.5">Teacher Feedback</p>
          <p className="text-xs text-white/70">{quiz.submission.feedback}</p>
        </div>
      )}

      <motion.button
        onClick={() => onAction(quiz)}
        whileTap={{ scale: 0.97 }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition ${
          quiz.status === 'pending'
            ? 'bg-blue-500 text-white hover:bg-blue-400'
            : 'bg-white/10 text-white/70 hover:bg-white/15'
        }`}
      >
        {quiz.status === 'pending'
          ? <><Play className="h-4 w-4" /> Start Quiz</>
          : <><Eye className="h-4 w-4" /> View Result</>
        }
      </motion.button>
    </motion.div>
  );
}

// ── Confirm screen ───────────────────────────────────────────
function ConfirmScreen({ quiz, onStart, onBack }: {
  quiz: EnrichedQuiz; onStart: () => void; onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6 max-w-md mx-auto"
    >
      <div className="h-20 w-20 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
        <ClipboardList className="h-10 w-10 text-blue-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{quiz.title}</h2>
        <p className="text-white/50 text-sm">{quiz.subjects?.name}{quiz.chapters?.name ? ` · ${quiz.chapters.name}` : ''}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {[
          { icon: BookOpen, label: 'Questions', value: quiz.questions?.length ?? 0 },
          { icon: Timer,    label: 'Time Limit', value: `${quiz.time_limit_minutes} min` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-1">
            <Icon className="h-5 w-5 text-white/40" />
            <p className="text-xl font-black">{value}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300/80 w-full text-left">
        ⚠️ Once you start, the timer begins. Make sure you're in a quiet place. You cannot retake this quiz.
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-black text-white/60 hover:bg-white/10 transition"
        >
          Back
        </button>
        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
          className="flex-1 rounded-2xl bg-blue-500 py-3 text-sm font-black text-white hover:bg-blue-400 transition"
        >
          Start Quiz →
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Taking screen ────────────────────────────────────────────
function TakingScreen({ quiz, onSubmit }: {
  quiz: EnrichedQuiz;
  onSubmit: (answers: (string | null)[]) => Promise<void>;
}) {
  const questions   = quiz.questions ?? [];
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft]   = useState(quiz.time_limit_minutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    await onSubmit(answers);
  };

  const pick = (opt: string) => {
    setAnswers(prev => { const a = [...prev]; a[currentQ] = opt; return a; });
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const isLow = timeLeft < 60;

  const q = questions[currentQ];

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 lg:px-8 py-5 gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between glass-card rounded-2xl border border-white/10 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-black text-white/60 truncate">{quiz.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-black border ${
            isLow ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-white/10 text-white border-white/10'
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {fmt(timeLeft)}
          </span>
          <span className="text-xs text-white/40 font-semibold hidden sm:block">
            {currentQ + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 flex-wrap shrink-0 px-1">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === currentQ      ? 'w-6 bg-blue-400'
              : answers[i] !== null ? 'w-2.5 bg-emerald-400/60'
              : 'w-2.5 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col gap-4 max-w-2xl w-full mx-auto"
      >
        <div className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-2">Question {currentQ + 1}</p>
          <p className="text-base sm:text-lg font-semibold leading-relaxed">{q?.question}</p>
        </div>

        <div className="space-y-2.5">
          {(q?.options ?? []).map((opt, i) => {
            const selected = answers[currentQ] === opt;
            return (
              <motion.button
                key={i}
                onClick={() => pick(opt)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all ${
                  selected
                    ? 'bg-blue-500/25 border-blue-400/50 text-white shadow-[0_0_0_2px_rgba(96,165,250,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full mr-3 text-xs font-black border ${
                  selected ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/20 text-white/40'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-3 shrink-0 max-w-2xl w-full mx-auto">
        <button
          onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/60 hover:bg-white/10 disabled:opacity-30 transition"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="flex-1" />
        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
            className="flex items-center gap-1.5 rounded-2xl bg-blue-500/20 border border-blue-400/25 px-5 py-3 text-sm font-black text-blue-300 hover:bg-blue-500/30 transition"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <motion.button
            onClick={handleSubmit}
            disabled={submitting}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-400 transition disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Submit Quiz
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ── Result screen ────────────────────────────────────────────
function ResultScreen({ quiz, submission, onBack }: {
  quiz: EnrichedQuiz; submission: QuizSubmissionData; onBack: () => void;
}) {
  const pct    = scorePercent(submission.score, submission.total);
  const badge  = pct >= 80 ? { label: 'Excellent! 🎉', color: 'text-emerald-400' }
               : pct >= 60 ? { label: 'Good Job! 👍',  color: 'text-amber-400'   }
               :              { label: 'Keep Trying 💪', color: 'text-red-400'    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-2xl mx-auto"
    >
      {/* Score hero */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Quiz Complete</p>
        <h2 className="text-xl sm:text-2xl font-black">{quiz.title}</h2>
        <div className="flex items-end justify-center gap-1">
          <span className={`text-5xl sm:text-6xl font-black ${badge.color}`}>{submission.score}</span>
          <span className="text-2xl text-white/30 mb-2">/{submission.total}</span>
        </div>
        <p className={`text-lg font-black ${badge.color}`}>{badge.label}</p>
        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
          />
        </div>
        <p className="text-sm text-white/40">{pct}% correct</p>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Question Breakdown</h3>
        {quiz.questions?.map((q, i) => {
          const ans = submission.answers?.find(a => a.questionIndex === i);
          const correct = ans?.isCorrect ?? false;
          return (
            <div key={i} className={`glass-card rounded-2xl border p-4 ${correct ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${correct ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {correct
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <XCircle       className="h-4 w-4 text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-semibold leading-snug">{q.question}</p>
                  {!correct && ans?.selectedAnswer && (
                    <p className="text-xs text-red-400/80">
                      Your answer: <span className="font-semibold">{ans.selectedAnswer}</span>
                    </p>
                  )}
                  <p className="text-xs text-emerald-400/80">
                    Correct: <span className="font-semibold">{q.correctAnswer}</span>
                  </p>
                  {q.explanation && (
                    <p className="text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2 leading-relaxed">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="w-full rounded-2xl bg-white/10 py-3.5 text-sm font-black text-white hover:bg-white/15 transition"
      >
        Back to Quizzes
      </button>
    </motion.div>
  );
}

// ── Main view ────────────────────────────────────────────────
export default function StudentQuizzesView({ student, creditBalance, deductCredits, addCredits }: Props) {
  const [quizzes, setQuizzes]       = useState<EnrichedQuiz[]>([]);
  const [loading, setLoading]       = useState(true);
  const [quizState, setQuizState]   = useState<QuizState>('list');
  const [activeQuiz, setActiveQuiz] = useState<EnrichedQuiz | null>(null);
  const [resultSub, setResultSub]   = useState<QuizSubmissionData | null>(null);

  // Filters
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [subjects, setSubjects]   = useState<SubjectData[]>([]);

  const fetchQuizzes = useCallback(async () => {
    if (!student?.class_id) return;
    setLoading(true);

    const [quizRes, subRes] = await Promise.all([
      supabase
        .from('quizzes')
        .select('*, subjects(id, name, color), chapters(name)')
        .eq('class_id', student.class_id)
        .eq('published', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('subjects')
        .select('*')
        .eq('school_id', student.school_id),
    ]);

    const { data: subs } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('student_id', student.id);

    const subMap = new Map((subs ?? []).map((s: any) => [s.quiz_id, s]));

    const enriched: EnrichedQuiz[] = ((quizRes.data ?? []) as QuizData[]).map(q => {
      const sub = subMap.get(q.id) as QuizSubmissionData | undefined;
      const status = !sub ? 'pending' : sub.grade_published ? 'graded' : 'submitted';
      return { ...q, submission: sub, status } as EnrichedQuiz;
    });

    setQuizzes(enriched.length > 0 ? enriched : DUMMY_ENRICHED_QUIZZES as EnrichedQuiz[]);
    setSubjects(subRes.data?.length ? (subRes.data as SubjectData[]) : DUMMY_SUBJECTS);
    setLoading(false);
  }, [student]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleAction = (quiz: EnrichedQuiz) => {
    setActiveQuiz(quiz);
    if (quiz.status === 'pending') {
      setQuizState('confirm');
    } else {
      setResultSub(quiz.submission ?? null);
      setQuizState('result');
    }
  };

  const handleSubmitQuiz = async (answers: (string | null)[]) => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions ?? [];
    const gradedAnswers = answers.map((a, i) => ({
      questionIndex: i,
      selectedAnswer: a ?? '',
      isCorrect: a === questions[i]?.correctAnswer,
    }));
    const score = gradedAnswers.filter(a => a.isCorrect).length;

    const { data: sub, error } = await supabase
      .from('quiz_submissions')
      .insert({
        quiz_id:    activeQuiz.id,
        student_id: student.id,
        answers:    gradedAnswers,
        score,
        total: questions.length,
      } as any)
      .select()
      .single();

    if (!error && sub) {
      const submission = sub as QuizSubmissionData;
      setResultSub(submission);
      setActiveQuiz(prev => prev ? { ...prev, submission, status: 'submitted' } : prev);
      setQuizState('result');
      fetchQuizzes();
    }
  };

  // Filtered list
  const filtered = quizzes.filter(q => {
    if (filterStatus !== 'all' && q.status !== filterStatus) return false;
    if (filterSubject !== 'all' && q.subject_id !== filterSubject) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    pending:   quizzes.filter(q => q.status === 'pending').length,
    submitted: quizzes.filter(q => q.status === 'submitted').length,
    graded:    quizzes.filter(q => q.status === 'graded').length,
  };

  if (quizState === 'confirm' && activeQuiz) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        <ConfirmScreen
          quiz={activeQuiz}
          onStart={() => setQuizState('taking')}
          onBack={() => { setQuizState('list'); setActiveQuiz(null); }}
        />
      </div>
    );
  }

  if (quizState === 'taking' && activeQuiz) {
    return (
      <div className="h-full flex flex-col">
        <TakingScreen quiz={activeQuiz} onSubmit={handleSubmitQuiz} />
      </div>
    );
  }

  if (quizState === 'result' && activeQuiz && resultSub) {
    return (
      <ResultScreen
        quiz={activeQuiz}
        submission={resultSub}
        onBack={() => { setQuizState('list'); setActiveQuiz(null); setResultSub(null); }}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">My Quizzes</h1>
        <p className="text-sm text-white/40 mt-1">All quizzes assigned to your class</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all',       label: 'All',       count: quizzes.length },
          { key: 'pending',   label: 'Pending',   count: counts.pending },
          { key: 'submitted', label: 'Submitted', count: counts.submitted },
          { key: 'graded',    label: 'Graded',    count: counts.graded },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              filterStatus === key
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/50 hover:bg-white/15 hover:text-white'
            }`}
          >
            {label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${filterStatus === key ? 'bg-white/20' : 'bg-white/10'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + subject filter */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes…"
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/10 transition"
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none transition sm:w-44"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-white/30" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
          <ClipboardList className="h-12 w-12 opacity-40" />
          <p className="text-sm font-semibold">No quizzes found</p>
          <p className="text-xs">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <QuizCard quiz={quiz} onAction={handleAction} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
