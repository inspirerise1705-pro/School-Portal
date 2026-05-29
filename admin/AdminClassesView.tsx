'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, X, Check, Loader2, GraduationCap, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface ClassData {
  id:          string;
  name:        string;
  section:     string;
  studentCount: number;
  teachers:    string[];
  classTeacher: string;
}

export default function AdminClassesView({ schoolId }: AdminCtx) {
  const [classes,   setClasses]   = useState<ClassData[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [newName,   setNewName]   = useState('');
  const [newSec,    setNewSec]    = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: cls } = await supabase
      .from('classes').select('id, name, section').eq('school_id', schoolId).order('name');
    if (!cls?.length) { setClasses([]); setLoading(false); return; }

    const rows: ClassData[] = await Promise.all((cls as any[]).map(async c => {
      const [stuRes, tcRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('class_id', c.id),
        supabase.from('teacher_classes')
          .select('subject, teachers(name, class_teacher_of)')
          .eq('class_id', c.id),
      ]);
      const tcs = (tcRes.data ?? []) as any[];
      const teachers = [...new Set(tcs.map((t: any) => t.teachers?.name ?? '').filter(Boolean))];
      const classTeacher = tcs.find(t => t.teachers?.class_teacher_of?.includes(`${c.name} ${c.section}`))?.teachers?.name ?? '';
      return {
        id: c.id, name: c.name, section: c.section,
        studentCount: stuRes.count ?? 0,
        teachers,
        classTeacher,
      };
    }));
    setClasses(rows);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    if (!newName.trim() || !newSec.trim()) return;
    setSaving(true);
    await supabase.from('classes').insert({ school_id: schoolId, name: newName.trim(), section: newSec.trim() });
    setSaving(false);
    setShowAdd(false);
    setNewName('');
    setNewSec('');
    fetchAll();
  };

  const handleDelete = async (id: string, name: string, sec: string) => {
    if (!confirm(`Delete ${name} ${sec}? All students in this class will be unassigned.`)) return;
    await supabase.from('classes').delete().eq('id', id);
    fetchAll();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Classes</h1>
          <p className="text-sm opacity-75 mt-1">{classes.length} sections</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition">
          <Plus className="h-4 w-4" /> Add Class
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
          <BookOpen className="h-10 w-10 opacity-40" />
          <p className="text-sm">No classes yet. Add your first class section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <motion.div key={c.id} whileHover={{ y: -2 }}
              className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-5 backdrop-blur-sm relative group">
              <button
                onClick={() => handleDelete(c.id, c.name, c.section)}
                className="absolute top-3 right-3 h-7 w-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-3.5 w-3.5 text-slate-500 hover:text-red-400" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-base font-black">{c.name}</p>
                  <p className="text-xs text-slate-400">Section {c.section}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Students</span>
                  <span className="font-black text-white">{c.studentCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Teachers</span>
                  <span className="font-black text-white">{c.teachers.length}</span>
                </div>
                {c.classTeacher && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Class Teacher</span>
                    <span className="font-semibold text-primary-400 truncate max-w-[120px]">{c.classTeacher}</span>
                  </div>
                )}
              </div>

              {c.teachers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/40">
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1.5">Teachers</p>
                  <div className="flex flex-wrap gap-1">
                    {c.teachers.slice(0, 4).map(t => (
                      <span key={t} className="text-[10px] bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded-full font-semibold">{t}</span>
                    ))}
                    {c.teachers.length > 4 && (
                      <span className="text-[10px] bg-slate-700/70 text-slate-400 px-2 py-0.5 rounded-full">+{c.teachers.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0f1629] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black">Add Class</h2>
                <button onClick={() => setShowAdd(false)} className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Class Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Class 8"
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Section</label>
                  <input value={newSec} onChange={e => setNewSec(e.target.value)} placeholder="e.g. A"
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl bg-slate-700/70 py-2.5 text-sm font-bold hover:bg-slate-700 transition">Cancel</button>
                <button onClick={handleAdd} disabled={saving || !newName.trim() || !newSec.trim()}
                  className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-500 py-2.5 text-sm font-black disabled:opacity-50 flex items-center justify-center gap-2 transition">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Add Class
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
