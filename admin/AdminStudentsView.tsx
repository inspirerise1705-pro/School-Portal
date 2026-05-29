'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap, Search, Plus, Edit2, X, Check,
  Loader2, Filter, ChevronDown, Shield,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface Student {
  id:          string;
  name:        string;
  email:       string | null;
  roll_number: string | null;
  fees_status: 'paid' | 'pending' | 'overdue';
  class_id:    string | null;
  user_id:     string | null;
  class_name:  string;
  permissions: Record<string, boolean> | null;
}

interface ClassOption { id: string; name: string; section: string; }

interface EditState {
  id:          string;
  name:        string;
  email:       string;
  roll_number: string;
  fees_status: string;
  class_id:    string;
  permissions: Record<string, boolean>;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative flex items-center h-5 w-9 rounded-full px-0.5 shrink-0 transition-colors duration-200 ${on ? 'bg-primary-600' : 'bg-slate-600'}`}>
      <span className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

const STUDENT_PERMS = [
  { key: 'ai_tutor',       label: 'AI Tutor'      },
  { key: 'self_practice',  label: 'Self Practice' },
];

interface AddState {
  name:        string;
  email:       string;
  roll_number: string;
  class_id:    string;
  fees_status: string;
}

const FEES_STYLES = {
  paid:    { label: 'Paid',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25'      },
  overdue: { label: 'Overdue', cls: 'bg-red-500/15 text-red-400 border-red-500/25'            },
};

export default function AdminStudentsView({ schoolId }: AdminCtx) {
  const [students, setStudents]   = useState<Student[]>([]);
  const [classes,  setClasses]    = useState<ClassOption[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterFees,  setFilterFees]  = useState('');
  const [editing,  setEditing]    = useState<EditState | null>(null);
  const [adding,   setAdding]     = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [addForm,  setAddForm]    = useState<AddState>({ name: '', email: '', roll_number: '', class_id: '', fees_status: 'pending' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [stuRes, clsRes] = await Promise.all([
      supabase.from('students')
        .select('id, name, email, roll_number, fees_status, class_id, user_id, permissions, classes(name, section)')
        .eq('school_id', schoolId).order('name'),
      supabase.from('classes').select('id, name, section').eq('school_id', schoolId).order('name'),
    ]);
    setClasses((clsRes.data ?? []) as ClassOption[]);
    setStudents(((stuRes.data ?? []) as any[]).map(s => ({
      ...s,
      class_name: s.classes ? `${s.classes.name} ${s.classes.section}` : '—',
    })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from('students').update({
      name:        editing.name,
      email:       editing.email || null,
      roll_number: editing.roll_number || null,
      fees_status: editing.fees_status,
      class_id:    editing.class_id || null,
      permissions: editing.permissions,
    }).eq('id', editing.id);
    setSaving(false);
    setEditing(null);
    fetchAll();
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    await supabase.from('students').insert({
      school_id:   schoolId,
      name:        addForm.name,
      email:       addForm.email || null,
      roll_number: addForm.roll_number || null,
      class_id:    addForm.class_id || null,
      fees_status: addForm.fees_status,
    });
    setSaving(false);
    setAdding(false);
    setAddForm({ name: '', email: '', roll_number: '', class_id: '', fees_status: 'pending' });
    fetchAll();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the school? This cannot be undone.`)) return;
    await supabase.from('students').delete().eq('id', id);
    fetchAll();
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.roll_number ?? '').toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || s.class_id === filterClass;
    const matchFees  = !filterFees  || s.fees_status === filterFees;
    return matchSearch && matchClass && matchFees;
  });

  const FeesTag = ({ status }: { status: string }) => {
    const s = FEES_STYLES[status as keyof typeof FEES_STYLES] ?? FEES_STYLES.pending;
    return (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
    );
  };

  const ModalForm = ({ state, setState, title, onSubmit, onClose }: {
    state: any; setState: (fn: (s: any) => any) => void;
    title: string; onSubmit: () => void; onClose: () => void;
  }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#0f1629] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'name',        label: 'Full Name *',   type: 'text',  placeholder: 'Aaryan Kapoor'       },
            { key: 'email',       label: 'Email',         type: 'email', placeholder: 'student@school.edu'  },
            { key: 'roll_number', label: 'Roll Number',   type: 'text',  placeholder: '8A-01'               },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</label>
              <input
                type={type} value={state[key] ?? ''} placeholder={placeholder}
                onChange={e => setState((s: any) => ({ ...s, [key]: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition"
              />
            </div>
          ))}
          <div>
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Class</label>
            <select
              value={state.class_id ?? ''} onChange={e => setState((s: any) => ({ ...s, class_id: e.target.value }))}
              className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition"
            >
              <option value=””>Unassigned</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fees Status</label>
            <div className="mt-1 flex gap-2">
              {(['paid','pending','overdue'] as const).map(s => (
                <button key={s} onClick={() => setState((st: any) => ({ ...st, fees_status: s }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition capitalize ${
                    state.fees_status === s
                      ? FEES_STYLES[s].cls + ' !bg-opacity-30'
                      : 'bg-slate-800 border-slate-600/40 text-slate-400'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Per-student permissions — only shown in edit mode (not add) */}
        {title.includes('Edit') && (
          <div className="mt-4 pt-4 border-t border-slate-700/40 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="h-3.5 w-3.5 text-primary-400" />
              <label className="text-[11px] text-slate-300 font-black uppercase tracking-wider">Feature Permissions</label>
              <span className="text-[10px] text-slate-500 ml-1">(overrides school defaults)</span>
            </div>
            {STUDENT_PERMS.map(({ key, label }) => {
              const on = (state.permissions?.[key] ?? true) as boolean;
              return (
                <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/70 px-3 py-2">
                  <span className="text-xs text-slate-300 font-semibold">{label}</span>
                  <Toggle on={on} onToggle={() => setState((s: any) => ({
                    ...s, permissions: { ...s.permissions, [key]: !on }
                  }))} />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 rounded-xl bg-slate-700/70 px-4 py-2.5 text-sm font-bold hover:bg-slate-700 transition">Cancel</button>
          <button onClick={onSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {title.includes('Add') ? 'Add Student' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Students</h1>
          <p className="text-sm opacity-75 mt-1">{students.length} enrolled · {filtered.length} shown</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            className="w-full rounded-xl bg-slate-800/95 border border-slate-600/80 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
        <select value={filterFees} onChange={e => setFilterFees(e.target.value)}
          className="rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition">
          <option value="">All Fees</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
          <GraduationCap className="h-10 w-10 opacity-40" />
          <p className="text-sm">No students found</p>
        </div>
      ) : (
        <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_120px_80px_72px] gap-3 px-5 py-2.5 border-b border-slate-700/40 text-[10px] text-slate-500 font-black uppercase tracking-wider">
            <span>Student</span><span>Class</span><span>Roll No.</span><span>Fees</span><span></span>
          </div>
          <div className="divide-y divide-slate-700/30">
            {filtered.map(s => (
              <div key={s.id} className="flex sm:grid sm:grid-cols-[1fr_100px_120px_80px_72px] items-center gap-3 px-5 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0 text-xs font-black text-primary-400">
                    {s.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{s.name}</p>
                    <p className=”text-[11px] text-slate-500 truncate”>{s.email ?? '—'}</p>
                  </div>
                </div>
                <span className=”text-xs text-slate-300 hidden sm:block”>{s.class_name}</span>
                <span className=”text-xs text-slate-400 hidden sm:block”>{s.roll_number ?? '—'}</span>
                <div className="hidden sm:flex"><FeesTag status={s.fees_status} /></div>
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                  {!s.user_id && (
                    <span title="Not yet linked to auth account" className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8px] font-black flex items-center justify-center">!</span>
                  )}
                  <button onClick={() => setEditing({ id: s.id, name: s.name, email: s.email ?? '', roll_number: s.roll_number ?? '', fees_status: s.fees_status, class_id: s.class_id ?? '', permissions: s.permissions ?? {} })}
                    className="h-7 w-7 rounded-lg hover:bg-slate-700 flex items-center justify-center transition">
                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.name)}
                    className="h-7 w-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition">
                    <X className="h-3.5 w-3.5 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <ModalForm
            state={editing} setState={setEditing as any}
            title="Edit Student" onSubmit={handleSave} onClose={() => setEditing(null)}
          />
        )}
        {adding && (
          <ModalForm
            state={addForm} setState={setAddForm as any}
            title="Add Student" onSubmit={handleAdd} onClose={() => setAdding(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
