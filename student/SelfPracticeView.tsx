'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, BookOpen, ChevronRight, ChevronLeft, CheckCircle2,
  XCircle, Loader2, AlertCircle, Clock, Zap, RotateCcw, Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dedupSubjects } from '../lib/dedupSubjects';
import { generatePracticeQuiz } from '../geminiService';
import { CREDIT_COSTS } from '../types';
import type { StudentProfile, SubjectData, ChapterData, QuizQuestion } from '../types';
import { DUMMY_SUBJECTS, DUMMY_CHAPTERS } from './dummyStudentData';
import CreditPurchaseModal from './CreditPurchaseModal';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

type Step = 'subject' | 'chapter' | 'configure' | 'generating' | 'taking' | 'result';

const QUESTION_COUNTS = [5, 10, 15] as const;
type QCount = (typeof QUESTION_COUNTS)[number];

const CREDIT_MAP: Record<QCount, number> = {
  5:  CREDIT_COSTS.SELF_PRACTICE_5Q,
  10: CREDIT_COSTS.SELF_PRACTICE_10Q,
  15: CREDIT_COSTS.SELF_PRACTICE_15Q,
};

function scorePercent(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export default function SelfPracticeView({ student, creditBalance, deductCredits, addCredits }: Props) {
  const [step, setStep]               = useState<Step>('subject');
  const [subjects, setSubjects]       = useState<SubjectData[]>([]);
  const [chapters, setChapters]       = useState<ChapterData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterData | null>(null);
  const [qCount, setQCount]           = useState<QCount>(5);
  const [questions, setQuestions]     = useState<QuizQuestion[]>([]);
  const [answers, setAnswers]         = useState<(string | null)[]>([]);
  const [currentQ, setCurrentQ]       = useState(0);
  const [score, setScore]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [insufficientFor, setInsufficientFor] = useState(0);

  useEffect(() => {
    supabase
      .from('subjects')
      .select('*')
      .eq('school_id', student.school_id)
      .order('name')
      .then(({ data }) => {
        setSubjects(dedupSubjects(data?.length ? (data as SubjectData[]) : DUMMY_SUBJECTS));
        setLoading(false);
      });
  }, [student.school_id]);

  const loadChapters = async (subjectId: string, subjectName: string) => {
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .order('number');
    if (data?.length) { setChapters(data as ChapterData[]); return; }
    // Name-based fallback: match DB subject name → dummy subject ID → dummy chapters
    const dummySub = DUMMY_SUBJECTS.find(s => s.name === subjectName);
    setChapters(dummySub ? DUMMY_CHAPTERS.filter(c => c.subject_id === dummySub.id) : []);
  };

  const handleSelectSubject = async (s: SubjectData) => {
    setSelectedSubject(s);
    setSelectedChapter(null);
    await loadChapters(s.id, s.name);
    setStep('chapter');
  };

  const handleSelectChapter = (c: ChapterData) => {
    setSelectedChapter(c);
    setStep('configure');
  };

  const handleGenerate = async () => {
    const cost = CREDIT_MAP[qCount];
    if (creditBalance < cost) {
      setInsufficientFor(cost - creditBalance);
      setShowCreditModal(true);
      return;
    }
    const ok = await deductCredits(cost, 'self_practice', `Self-Practice: ${selectedSubject!.name} – ${selectedChapter!.name}`);
    if (!ok) return;

    setStep('generating');
    const qs = await generatePracticeQuiz(selectedSubject!.name, selectedChapter!.name, qCount);
    setQuestions(qs);
    setAnswers(Array(qs.length).fill(null));
    setCurrentQ(0);
    setStep('taking');
  };

  const handleSubmit = () => {
    const s = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    setScore(s);
    setStep('result');
  };

  const handleReset = () => {
    setStep('subject');
    setSelectedSubject(null);
    setSelectedChapter(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setScore(0);
  };

  const pick = (opt: string) => {
    setAnswers(prev => { const a = [...prev]; a[currentQ] = opt; return a; });
  };

  // ── Subject selection ────────────────────────────────────────
  if (step === 'subject') {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Self-Practice</h1>
          <p className="text-sm text-white/40 mt-1">Pick a subject to generate an AI-powered practice quiz</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-white/30" /></div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-white/30">
            <BookOpen className="h-12 w-12 opacity-40" />
            <p className="text-sm">No subjects set up yet. Ask your teacher.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {subjects.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => handleSelectSubject(s)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col items-center gap-3 text-center hover:border-white/20 transition"
              >
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-black"
                  style={{ background: `${s.color}25`, color: s.color }}
                >
                  {s.name[0]}
                </div>
                <p className="text-sm font-black">{s.name}</p>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Chapter selection ────────────────────────────────────────
  if (step === 'chapter') {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('subject')}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Select Chapter</h1>
            <p className="text-sm text-white/40">{selectedSubject?.name}</p>
          </div>
        </div>
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-white/30">
            <BookOpen className="h-12 w-12 opacity-40" />
            <p className="text-sm">No chapters set up for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chapters.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => handleSelectChapter(c)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-2xl border border-white/10 p-4 flex items-center gap-4 text-left hover:border-white/20 transition"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: `${selectedSubject?.color}25`, color: selectedSubject?.color }}
                >
                  {c.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{c.name}</p>
                  <p className="text-xs text-white/40">Chapter {c.number}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Configure ────────────────────────────────────────────────
  if (step === 'configure') {
    const cost = CREDIT_MAP[qCount];
    const canAfford = creditBalance >= cost;
    return (
      <>
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('chapter')}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">Configure Quiz</h1>
              <p className="text-sm text-white/40">{selectedSubject?.name} · {selectedChapter?.name}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
            <p className="text-sm font-black uppercase tracking-wider text-white/60">Number of Questions</p>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_COUNTS.map(n => (
                <motion.button
                  key={n}
                  onClick={() => setQCount(n)}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-2xl border py-4 flex flex-col items-center gap-1 transition ${
                    qCount === n
                      ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8'
                  }`}
                >
                  <span className="text-2xl font-black">{n}</span>
                  <span className="text-[11px] text-white/40">questions</span>
                  <span className={`text-[10px] font-bold mt-0.5 flex items-center gap-0.5 ${qCount === n ? 'text-blue-400' : 'text-white/30'}`}>
                    <Zap className="h-2.5 w-2.5" />{CREDIT_MAP[n]} cr
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-white/10 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black">Credit Cost</p>
              <p className="text-xs text-white/40">Your balance: {creditBalance} credits</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xl font-black text-amber-400">{cost}</span>
            </div>
          </div>

          {!canAfford && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              Not enough credits. You need {cost - creditBalance} more.
            </motion.div>
          )}

          <motion.button
            onClick={canAfford ? handleGenerate : () => { setInsufficientFor(cost - creditBalance); setShowCreditModal(true); }}
            whileTap={{ scale: 0.97 }}
            className={`w-full rounded-2xl py-4 text-sm font-black flex items-center justify-center gap-2 transition ${
              canAfford
                ? 'bg-blue-500 text-white hover:bg-blue-400'
                : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            {canAfford
              ? <><Sparkles className="h-4 w-4" /> Generate Quiz</>
              : <><Zap className="h-4 w-4" /> Get More Credits</>
            }
          </motion.button>
        </div>
        <CreditPurchaseModal
          open={showCreditModal}
          onClose={() => setShowCreditModal(false)}
          creditBalance={creditBalance}
          userId={student.user_id}
          schoolId={student.school_id}
          onCreditsAdded={(balance) => { addCredits(balance - creditBalance, 'package'); setShowCreditModal(false); }}
          reason={`This practice quiz costs ${CREDIT_MAP[qCount]} credits`}
          insufficientFor={CREDIT_MAP[qCount]}
        />
      </>
    );
  }

  // ── Generating ───────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-2 border-blue-400 border-t-transparent"
        />
        <div className="space-y-2">
          <p className="text-lg font-black">Generating your quiz…</p>
          <p className="text-sm text-white/40">{selectedSubject?.name} · {selectedChapter?.name}</p>
          <p className="text-xs text-white/30">AI is crafting {qCount} questions just for you</p>
        </div>
      </div>
    );
  }

  // ── Taking ───────────────────────────────────────────────────
  if (step === 'taking') {
    const q = questions[currentQ];
    const answered = answers.filter(a => a !== null).length;
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between glass-card rounded-2xl border border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-black text-white/40 truncate">
              {selectedSubject?.name} · {selectedChapter?.name}
            </p>
          </div>
          <span className="text-xs font-bold text-white/50 shrink-0 ml-3">{currentQ + 1}/{questions.length}</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 flex-wrap px-1">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === currentQ ? 'w-6 bg-blue-400' : answers[i] !== null ? 'w-2.5 bg-emerald-400/60' : 'w-2.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
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
                  key={i} onClick={() => pick(opt)}
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                  className={`w-full text-left rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all ${
                    selected ? 'bg-blue-500/25 border-blue-400/50 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
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
        <div className="flex gap-3">
          <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/60 hover:bg-white/10 disabled:opacity-30 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <div className="flex-1" />
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)}
              className="flex items-center gap-1.5 rounded-2xl bg-blue-500/20 border border-blue-400/25 px-5 py-3 text-sm font-black text-blue-300 hover:bg-blue-500/30 transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <motion.button
              onClick={handleSubmit} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-400 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              {answered < questions.length ? `Submit (${answered}/${questions.length} answered)` : 'Submit Quiz'}
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────
  if (step === 'result') {
    const pct   = scorePercent(score, questions.length);
    const badge = pct >= 80 ? { label: 'Excellent! 🎉', color: 'text-emerald-400' }
                : pct >= 60 ? { label: 'Good Job! 👍',  color: 'text-amber-400'   }
                :              { label: 'Keep Practising 💪', color: 'text-red-400' };

    return (
      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-2xl mx-auto">
        <div className="glass-card rounded-3xl border border-white/10 p-6 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Practice Complete</p>
          <p className="text-base font-black">{selectedSubject?.name} · {selectedChapter?.name}</p>
          <div className="flex items-end justify-center gap-1">
            <span className={`text-5xl sm:text-6xl font-black ${badge.color}`}>{score}</span>
            <span className="text-2xl text-white/30 mb-2">/{questions.length}</span>
          </div>
          <p className={`text-lg font-black ${badge.color}`}>{badge.label}</p>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
            />
          </div>
          <p className="text-sm text-white/40">{pct}% correct</p>
        </div>

        {/* Q breakdown */}
        <div className="space-y-3">
          {questions.map((q, i) => {
            const correct = answers[i] === q.correctAnswer;
            return (
              <div key={i} className={`glass-card rounded-2xl border p-4 ${correct ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${correct ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {correct ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{q.question}</p>
                    {!correct && answers[i] && (
                      <p className="text-xs text-red-400/80">Your answer: <span className="font-semibold">{answers[i]}</span></p>
                    )}
                    <p className="text-xs text-emerald-400/80">Correct: <span className="font-semibold">{q.correctAnswer}</span></p>
                    {q.explanation && (
                      <p className="text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2 leading-relaxed">💡 {q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => { setStep('configure'); setAnswers([]); setQuestions([]); }}
            className="rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-black text-white/70 hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Try Again (Same Chapter)
          </button>
          <button
            onClick={handleReset}
            className="rounded-2xl bg-blue-500 py-3.5 text-sm font-black text-white hover:bg-blue-400 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> New Practice
          </button>
        </div>
      </div>
    );
  }

  return null;
}
