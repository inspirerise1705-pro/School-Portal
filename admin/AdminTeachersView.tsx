'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, Plus, Edit2, X, Check, Loader2,
  BookOpen, ChevronDown, ChevronUp, Mail, Shield,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface Teacher {
  id:               string;
  name:             string;
  email:            string;
  role:             string;
  subjects:         string[];
  class_teacher_of: string | null;
  created_at:       string;
  permissions:      Record<string, boolean> | null;
  classes:          { id: string; name: string; section: string; subject: string }[];
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative flex items-center h-5 w-9 rounded-full px-0.5 shrink-0 transition-colors duration-200 ${on ? 'bg-primary-600' : 'bg-slate-600'}`}>
      <span className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

const TEACHER_PERMS = [
  { key: 'ai_quiz',        label: 'AI Quiz Generation'  },
  { key: 'ai_paper',       label: 'AI Paper Generation' },
  { key: 'study_materials',label: 'Study Materials'     },
];

interface ClassOption { id: string; name: string; section: string; }
interface SubjectOption { id: string; name: string; }

interface EditState {
  id:               string;
  name:             string;
  subjects:         string[];
  class_teacher_of: string;
}

export default function AdminTeachersView({ schoolId }: AdminCtx) {
  const [teachers,    setTeachers]    = useState<Teacher[]>([]);
  const [classes,     setClasses]     = useState<ClassOption[]>([]);
  const [subjects,    setSubjects]    = useState<SubjectOption[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [editing,     setEditing]     = useState<EditState | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [permSaving,  setPermSaving]  = useState<string | null>(null);
  const [localPerms,  setLocalPerms]  = useState<Record<string, Record<string, boolean>>>({});

  const getPerms = (t: Teacher) => localPerms[t.id] ?? t.permissions ?? {};
  const togglePerm = async (teacher: Teacher, key: string) => {
    const current = getPerms(teacher);
    const updated  = { ...current, [key]: !(current[key] ?? true) };
    setLocalPerms(p => ({ ...p, [teacher.id]: updated }));
    setPermSaving(teacher.id + key);
    await supabase.from('teachers').update({ permissions: updated }).eq('id', teacher.id);
    setPermSaving(null);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [teachRes, classRes, subjRes] = await Promise.all([
      supabase.from('teachers')
        .select('id, name, email, role, subjects, class_teacher_of, created_at, permissions')
        .eq('school_id', schoolId)
        .neq('role', 'admin')
        .order('name'),
      supabase.from('classes').select('id, name, section').eq('school_id', schoolId).order('name'),
      supabase.from('subjects').select('id, name').eq('school_id', schoolId).order('name'),
    ]);

    const rawTeachers = (teachRes.data ?? []) as any[];
    setClasses((classRes.data ?? []) as ClassOption[]);
    setSubjects((subjRes.data ?? []) as SubjectOption[]);

    const { data: tcData } = await supabase
      .from('teacher_classes')
      .select('teacher_id, class_id, subject, classes(name, section)')
      .in('teacher_id', rawTeachers.map(t => t.id));

    const tcMap = new Map<string, { id: string; name: string; section: string; subject: string }[]>();
    (tcData ?? []).forEach((tc: any) => {
      if (!tcMap.has(tc.teacher_id)) tcMap.set(tc.teacher_id, []);
      tcMap.get(tc.teacher_id)!.push({
        id: tc.class_id,
        name: tc.classes?.name ?? '',
        section: tc.classes?.section ?? '',
        subject: tc.subject,
      });
    });

    setTeachers(rawTeachers.map(t => ({ ...t, classes: tcMap.get(t.id) ?? [] })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from('teachers')
      .update({
        name:             editing.name,
        subjects:         editing.subjects,
        class_teacher_of: editing.class_teacher_of || null,
      })
      .eq('id', editing.id);
    setSaving(false);
    setEditing(null);
    fetchAll();
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Remove this teacher from the school? They will lose access.')) return;
    await supabase.from('teachers').update({ role: 'inactive' }).eq('id', id);
    fetchAll();
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Teachers</h1>
          <p className="text-sm opacity-75 mt-1">{teachers.length} staff members</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition"
        >
          <Plus className="h-4 w-4" /> Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-xl bg-slate-800/95 border border-slate-600/80 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
          <Users className="h-10 w-10 opacity-40" />
          <p className="text-sm">No teachers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(teacher => (
            <motion.div key={teacher.id} layout
              className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white overflow-hidden backdrop-blur-sm">
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 text-sm font-black text-blue-400">
                  {teacher.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{teacher.name}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {teacher.email}
                  </p>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                  {teacher.subjects.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded-full font-semibold">{s}</span>
                  ))}
                  {teacher.subjects.length > 3 && (
                    <span className="text-[10px] bg-slate-700/70 text-slate-400 px-2 py-0.5 rounded-full">+{teacher.subjects.length - 3}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditing({ id: teacher.id, name: teacher.name, subjects: teacher.subjects, class_teacher_of: teacher.class_teacher_of ?? '' })}
                    className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center transition"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === teacher.id ? null : teacher.id)}
                    className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center transition"
                  >
                    {expanded === teacher.id
                      ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expanded === teacher.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="border-t border-slate-700/40 px-4 py-3 bg-slate-800/30"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-300 font-bold uppercase tracking-wider mb-1.5">Class Assignments</p>
                        {teacher.classes.length === 0
                          ? <p className="text-slate-400">No classes assigned</p>
                          : teacher.classes.map((c, i) => (
                              <div key={i} className="flex items-center gap-1.5 mb-1">
                                <BookOpen className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-300">{c.name} {c.section} · {c.subject}</span>
                              </div>
                            ))
                        }
                      </div>
                      <div>
                        <p className="text-slate-300 font-bold uppercase tracking-wider mb-1.5">Details</p>
                        <p className="text-slate-400">Class Teacher of: <span className="text-white">{teacher.class_teacher_of || '—'}</span></p>
                        <p className="text-slate-400 mt-1">Joined: <span className="text-white">{fmtDate(teacher.created_at)}</span></p>
                      </div>
                    </div>

                    {/* Per-teacher feature permissions */}
                    <div className="mt-4 pt-3 border-t border-slate-700/40">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Shield className="h-3.5 w-3.5 text-primary-400" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-wider">Feature Permissions</p>
                        <span className="text-[10px] text-slate-500 font-semibold ml-1">(overrides school defaults)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {TEACHER_PERMS.map(({ key, label }) => {
                          const perms = getPerms(teacher);
                          const on = perms[key] ?? true;
                          const isSaving = permSaving === teacher.id + key;
                          return (
                            <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/70 px-3 py-2">
                              <span className="text-[11px] text-slate-300 font-semibold">{label}</span>
                              {isSaving
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500 shrink-0" />
                                : <Toggle on={on} onToggle={() => togglePerm(teacher, key)} />
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeactivate(teacher.id)}
                      className="mt-3 text-xs text-red-400 hover:text-red-300 transition font-semibold"
                    >
                      Remove teacher from school
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setEditing(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0f1629] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black">Edit Teacher</h2>
                <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Name</label>
                  <input
                    value={editing.name}
                    onChange={e => setEditing(s => s && ({ ...s, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Class Teacher Of</label>
                  <input
                    value={editing.class_teacher_of}
                    onChange={e => setEditing(s => s && ({ ...s, class_teacher_of: e.target.value }))}
                    placeholder="e.g. Class 8A"
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(sub => {
                      const selected = editing.subjects.includes(sub.name);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setEditing(s => s && ({
                            ...s,
                            subjects: selected
                              ? s.subjects.filter(x => x !== sub.name)
                              : [...s.subjects, sub.name],
                          }))}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                            selected
                              ? 'bg-primary-600 border-primary-500 text-white'
                              : 'bg-slate-800 border-slate-600/40 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setEditing(null)}
                  className="flex-1 rounded-xl bg-slate-700/70 px-4 py-2.5 text-sm font-bold hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Teacher instructions modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0f1629] border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black">Add a Teacher</h2>
                <button onClick={() => setShowAdd(false)} className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <p className="text-slate-400">Follow these two steps to add a new teacher:</p>
                <div className="bg-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-bold">Create auth account in Supabase</p>
                      <p className="text-slate-400 text-xs mt-0.5">Go to Supabase â†' Authentication â†' Users â†' Invite User. Enter their email.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-bold">Run this SQL with their new auth user ID</p>
                      <pre className="mt-1.5 text-[10px] bg-slate-900 rounded-lg p-3 text-emerald-300 overflow-x-auto whitespace-pre-wrap">{`INSERT INTO teachers (id, school_id, name, email, role, subjects)
VALUES (
  '<auth-user-id>',
  '${schoolId}',
  'Teacher Name',
  'teacher@school.edu',
  'teacher',
  ARRAY['Mathematics']
);`}</pre>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Once done, the teacher will appear here after their next login.</p>
              </div>
              <button onClick={() => setShowAdd(false)}
                className="mt-5 w-full rounded-xl bg-primary-600 hover:bg-primary-500 py-2.5 text-sm font-black transition">
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
