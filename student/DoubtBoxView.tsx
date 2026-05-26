'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, Plus, Send, CheckCircle2, Clock,
  Loader2, BookOpen, ChevronDown, X, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, DoubtData, SubjectData, ChapterData } from '../types';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

export default function DoubtBoxView({ student }: Props) {
  const [doubts, setDoubts]       = useState<DoubtData[]>([]);
  const [subjects, setSubjects]   = useState<SubjectData[]>([]);
  const [chapters, setChapters]   = useState<ChapterData[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formChapter, setFormChapter] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formChapters, setFormChapters] = useState<ChapterData[]>([]);

  const fetchDoubts = useCallback(async () => {
    if (!student?.id) return;
    setLoading(true);
    const [dRes, sRes] = await Promise.all([
      supabase
        .from('doubt_box')
        .select('*, subjects(id, name, color), chapters(name, number)')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('subjects')
        .select('*')
        .eq('school_id', student.school_id)
        .order('name'),
    ]);
    setDoubts((dRes.data ?? []) as DoubtData[]);
    setSubjects((sRes.data ?? []) as SubjectData[]);
    setLoading(false);
  }, [student]);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  useEffect(() => {
    if (!formSubject) { setFormChapters([]); setFormChapter(''); return; }
    supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', formSubject)
      .order('number')
      .then(({ data }) => { setFormChapters((data ?? []) as ChapterData[]); setFormChapter(''); });
  }, [formSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;
    setSubmitting(true);
    await supabase.from('doubt_box').insert({
      school_id:  student.school_id,
      class_id:   student.class_id,
      student_id: student.id,
      subject_id: formSubject || null,
      chapter_id: formChapter || null,
      question:   formQuestion.trim(),
    });
    setFormQuestion('');
    setFormSubject('');
    setFormChapter('');
    setShowForm(false);
    setSubmitting(false);
    fetchDoubts();
  };

  const filtered = doubts.filter(d => {
    if (filterStatus === 'all')      return true;
    if (filterStatus === 'pending')  return d.status === 'pending';
    if (filterStatus === 'answered') return d.status === 'answered';
    return true;
  });

  const counts = {
    pending:  doubts.filter(d => d.status === 'pending').length,
    answered: doubts.filter(d => d.status === 'answered').length,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Doubt Box</h1>
          <p className="text-sm text-white/40 mt-1">Ask your teacher a question about any topic</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-400 transition w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" /> Ask a Doubt
        </motion.button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {([
          { key: 'all',      label: 'All',      count: doubts.length },
          { key: 'pending',  label: 'Pending',  count: counts.pending },
          { key: 'answered', label: 'Answered', count: counts.answered },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              filterStatus === key ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/15'
            }`}
          >
            {label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${filterStatus === key ? 'bg-white/20' : 'bg-white/10'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-white/30" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-white/30">
          <MessageCircle className="h-12 w-12 opacity-40" />
          <p className="text-sm font-semibold">
            {filterStatus === 'all' ? "No doubts yet — ask your first question!" : `No ${filterStatus} doubts`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-2xl border p-4 sm:p-5 space-y-3 ${
                  d.status === 'answered' ? 'border-emerald-500/20' : 'border-white/10'
                }`}
              >
                {/* Meta */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.subjects?.name && (
                      <span
                        className="rounded-lg px-2 py-0.5 text-[11px] font-black"
                        style={{ background: `${d.subjects.color}25`, color: d.subjects.color }}
                      >
                        {d.subjects.name}
                      </span>
                    )}
                    {d.chapters?.name && (
                      <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
                        Ch. {d.chapters.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-black ${
                      d.status === 'answered'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                    }`}>
                      {d.status === 'answered'
                        ? <><CheckCircle2 className="h-3 w-3" /> Answered</>
                        : <><Clock className="h-3 w-3" /> Pending</>
                      }
                    </span>
                    <span className="text-[11px] text-white/30">
                      {new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="rounded-xl bg-white/5 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1 font-bold">Your Question</p>
                  <p className="text-sm text-white/80 leading-relaxed">{d.question}</p>
                </div>

                {/* Teacher reply */}
                {d.teacher_reply && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-400/70 mb-1 font-bold">Teacher's Reply</p>
                    <p className="text-sm text-white/80 leading-relaxed">{d.teacher_reply}</p>
                    {d.replied_at && (
                      <p className="text-[11px] text-white/30 mt-2">
                        Replied {new Date(d.replied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Ask Doubt Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 w-full sm:max-w-lg glass-card rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black">Ask a Doubt</h2>
                <button onClick={() => setShowForm(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">Subject</label>
                    <select
                      value={formSubject}
                      onChange={e => setFormSubject(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none transition"
                    >
                      <option value="">Select subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">Chapter</label>
                    <select
                      value={formChapter}
                      onChange={e => setFormChapter(e.target.value)}
                      disabled={!formSubject || formChapters.length === 0}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none transition disabled:opacity-40"
                    >
                      <option value="">Select chapter</option>
                      {formChapters.map(c => <option key={c.id} value={c.id}>Ch.{c.number} · {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">Your Question *</label>
                  <textarea
                    required
                    rows={4}
                    value={formQuestion}
                    onChange={e => setFormQuestion(e.target.value)}
                    placeholder="Describe what you don't understand clearly…"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/10 transition"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting || !formQuestion.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-2xl bg-blue-500 py-3.5 text-sm font-black text-white hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Doubt
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
