'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, ClipboardList, Filter, Search, Loader2,
  Clock, ChevronDown, FileText, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, StudyMaterialData, TaskData, SubjectData, ChapterData } from '../types';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

type TabType = 'materials' | 'tasks';

function dueBadge(due?: string) {
  if (!due) return null;
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  if (days < 0)  return { label: 'Overdue',       cls: 'bg-red-500/20 text-red-400 border-red-500/25' };
  if (days === 0) return { label: 'Due Today',     cls: 'bg-amber-500/20 text-amber-400 border-amber-500/25' };
  if (days <= 3)  return { label: `${days}d left`, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/25' };
  return { label: `${days}d left`, cls: 'bg-white/10 text-white/50 border-white/10' };
}

export default function StudyMaterialView({ student }: Props) {
  const [tab, setTab]             = useState<TabType>('materials');
  const [materials, setMaterials] = useState<StudyMaterialData[]>([]);
  const [tasks, setTasks]         = useState<TaskData[]>([]);
  const [subjects, setSubjects]   = useState<SubjectData[]>([]);
  const [chapters, setChapters]   = useState<ChapterData[]>([]);
  const [loading, setLoading]     = useState(true);

  const [filterSubject, setFilterSubject] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [search, setSearch]               = useState('');

  const fetchData = useCallback(async () => {
    if (!student?.class_id) return;
    setLoading(true);

    const [matRes, taskRes, subRes] = await Promise.all([
      supabase
        .from('study_materials')
        .select('*, subjects(id, name, color), chapters(name)')
        .eq('class_id', student.class_id)
        .order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('*, subjects(id, name, color), chapters(name)')
        .eq('class_id', student.class_id)
        .order('due_date'),
      supabase
        .from('subjects')
        .select('*')
        .eq('school_id', student.school_id),
    ]);

    setMaterials((matRes.data ?? []) as StudyMaterialData[]);
    setTasks((taskRes.data ?? []) as TaskData[]);
    setSubjects((subRes.data ?? []) as SubjectData[]);
    setLoading(false);
  }, [student]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load chapters when subject filter changes
  useEffect(() => {
    if (filterSubject === 'all') { setChapters([]); setFilterChapter('all'); return; }
    supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', filterSubject)
      .order('number')
      .then(({ data }) => { setChapters((data ?? []) as ChapterData[]); setFilterChapter('all'); });
  }, [filterSubject]);

  const filterItems = <T extends { title: string; subject_id?: string; chapter_id?: string }>(items: T[]) =>
    items.filter(item => {
      if (filterSubject !== 'all' && item.subject_id !== filterSubject) return false;
      if (filterChapter !== 'all' && item.chapter_id !== filterChapter) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const filteredMaterials = filterItems(materials);
  const filteredTasks     = filterItems(tasks);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Study Material</h1>
        <p className="text-sm text-white/40 mt-1">Notes and tasks shared by your teacher</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 w-full sm:w-80">
        {([
          { key: 'materials', label: 'Materials', icon: BookOpen,     count: materials.length },
          { key: 'tasks',     label: 'Tasks',     icon: ClipboardList, count: tasks.length },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-black transition ${
              tab === key ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${tab === key ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/10 transition"
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none transition sm:w-44"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {chapters.length > 0 && (
          <select
            value={filterChapter}
            onChange={e => setFilterChapter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none transition sm:w-44"
          >
            <option value="all">All Chapters</option>
            {chapters.map(c => <option key={c.id} value={c.id}>Ch.{c.number} · {c.name}</option>)}
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-white/30" /></div>
      ) : (
        <>
          {/* Materials */}
          {tab === 'materials' && (
            filteredMaterials.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-white/30">
                <BookOpen className="h-12 w-12 opacity-40" />
                <p className="text-sm">No study materials yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredMaterials.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -2 }}
                      className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${m.subjects?.color ?? '#3B82F6'}25`, color: m.subjects?.color ?? '#3B82F6' }}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">{m.title}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {m.subjects?.name && (
                              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                                {m.subjects.name}
                              </span>
                            )}
                            {m.chapters?.name && (
                              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                                Ch. {m.chapters.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {m.description && (
                        <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{m.description}</p>
                      )}
                      <p className="text-[11px] text-white/30 flex items-center gap-1 mt-auto">
                        <Clock className="h-3 w-3" />
                        {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          )}

          {/* Tasks */}
          {tab === 'tasks' && (
            filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-white/30">
                <ClipboardList className="h-12 w-12 opacity-40" />
                <p className="text-sm">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredTasks.map((task, i) => {
                    const due = dueBadge(task.due_date);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="glass-card rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${task.subjects?.color ?? '#F59E0B'}25`, color: task.subjects?.color ?? '#F59E0B' }}
                        >
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">{task.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {task.subjects?.name && (
                              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                                {task.subjects.name}
                              </span>
                            )}
                            {task.chapters?.name && (
                              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60">
                                Ch. {task.chapters.name}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-white/50 mt-1.5 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        {due && (
                          <span className={`shrink-0 self-start sm:self-center rounded-xl border px-2.5 py-1 text-[11px] font-black ${due.cls}`}>
                            {due.label}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
