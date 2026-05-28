'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { supabase } from './lib/supabase';

interface Doubt {
  id: string;
  question: string;
  teacher_reply: string | null;
  status: 'pending' | 'answered';
  created_at: string;
  subjects: { name: string } | null;
  chapters: { name: string } | null;
  students: { name: string } | null;
}

export default function TeacherDoubtView() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'pending' | 'answered' | 'all'>('pending');
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('doubt_box')
      .select('*, subjects(name), chapters(name), students(name)')
      .order('created_at', { ascending: false });
    setDoubts((data ?? []) as Doubt[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const handleReply = async (doubtId: string) => {
    const reply = replyMap[doubtId]?.trim();
    if (!reply) return;
    setSubmitting(doubtId);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await (supabase as any)
      .from('doubt_box')
      .update({
        teacher_reply: reply,
        replied_at: new Date().toISOString(),
        replied_by: user?.id ?? null,
        status: 'answered',
      })
      .eq('id', doubtId);

    if (!error) {
      setReplyMap(prev => ({ ...prev, [doubtId]: '' }));
      fetchDoubts();
    }
    setSubmitting(null);
  };

  const filtered = doubts.filter(d =>
    activeFilter === 'all' || d.status === activeFilter
  );
  const pendingCount  = doubts.filter(d => d.status === 'pending').length;
  const answeredCount = doubts.filter(d => d.status === 'answered').length;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary-500" />
        <div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">
            Student Doubts
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {pendingCount} pending {pendingCount === 1 ? 'reply' : 'replies'}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'pending',  label: 'Pending',  count: pendingCount  },
          { key: 'answered', label: 'Answered', count: answeredCount },
          { key: 'all',      label: 'All',      count: doubts.length },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
              activeFilter === key
                ? 'bg-neutral-900 dark:bg-primary-500 text-white'
                : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-white/10'
            }`}
          >
            {label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${
              activeFilter === key ? 'bg-white/20' : 'bg-neutral-100 dark:bg-white/10'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-400">
          <MessageSquare className="w-12 h-12 opacity-30" />
          <p className="text-sm font-semibold">
            No {activeFilter !== 'all' ? activeFilter : ''} doubts yet
          </p>
          <p className="text-xs opacity-70">Students can ask doubts from their portal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((doubt, i) => (
            <motion.div
              key={doubt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-neutral-900/80 border border-neutral-100 dark:border-white/10 rounded-3xl p-5 md:p-6 space-y-4"
            >
              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-black text-neutral-400 uppercase tracking-widest">
                  <User className="w-3 h-3" />
                  {doubt.students?.name ?? 'Student'}
                </div>
                {doubt.subjects?.name && (
                  <span className="rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {doubt.subjects.name}
                  </span>
                )}
                {doubt.chapters?.name && (
                  <span className="rounded-lg bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {doubt.chapters.name}
                  </span>
                )}
                <span className={`ml-auto rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                  doubt.status === 'answered'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {doubt.status === 'answered' ? '✓ Answered' : '⏳ Pending'}
                </span>
              </div>

              {/* Question */}
              <p className="text-sm md:text-base font-semibold text-neutral-800 dark:text-white leading-relaxed">
                "{doubt.question}"
              </p>

              {/* Existing reply */}
              {doubt.teacher_reply && (
                <div className="rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1">
                    Your Reply
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    {doubt.teacher_reply}
                  </p>
                </div>
              )}

              {/* Reply form — pending only */}
              {doubt.status === 'pending' && (
                <div className="flex gap-2 items-end">
                  <textarea
                    value={replyMap[doubt.id] ?? ''}
                    onChange={e => setReplyMap(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(doubt.id);
                    }}
                    placeholder="Type your reply… (Ctrl+Enter to send)"
                    rows={2}
                    className="flex-1 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-4 py-3 resize-none focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition"
                  />
                  <button
                    onClick={() => handleReply(doubt.id)}
                    disabled={!replyMap[doubt.id]?.trim() || submitting === doubt.id}
                    className="flex items-center gap-2 rounded-2xl bg-primary-500 text-white px-4 py-3 text-sm font-black disabled:opacity-40 hover:bg-primary-400 transition active:scale-95"
                  >
                    {submitting === doubt.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
