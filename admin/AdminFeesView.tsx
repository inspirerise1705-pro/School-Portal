'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Search, CheckCircle2, Clock, AlertCircle, Loader2, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface StudentFee {
  id:          string;
  name:        string;
  roll_number: string | null;
  class_name:  string;
  class_id:    string | null;
  fees_status: 'paid' | 'pending' | 'overdue';
}

interface ClassOption { id: string; name: string; section: string; }

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25' },
  pending: { label: 'Pending', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/25'   },
  overdue: { label: 'Overdue', icon: AlertCircle,  color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/20'     },
};

export default function AdminFeesView({ schoolId }: AdminCtx) {
  const [students,    setStudents]    = useState<StudentFee[]>([]);
  const [classes,     setClasses]     = useState<ClassOption[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus,setFilterStatus]= useState('');
  const [updating,    setUpdating]    = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [stuRes, clsRes] = await Promise.all([
      supabase.from('students')
        .select('id, name, roll_number, fees_status, class_id, classes(name, section)')
        .eq('school_id', schoolId).order('name'),
      supabase.from('classes').select('id, name, section').eq('school_id', schoolId).order('name'),
    ]);
    setClasses((clsRes.data ?? []) as ClassOption[]);
    setStudents(((stuRes.data ?? []) as any[]).map(s => ({
      ...s,
      class_name: s.classes ? `${s.classes.name} ${s.classes.section}` : 'Unassigned',
    })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStatus = async (id: string, status: 'paid' | 'pending' | 'overdue') => {
    setUpdating(id);
    await supabase.from('students').update({ fees_status: status }).eq('id', id);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, fees_status: status } : s));
    setUpdating(null);
  };

  const bulkUpdate = async (classId: string, status: 'paid' | 'pending' | 'overdue') => {
    const cls = classes.find(c => c.id === classId);
    if (!confirm(`Mark all students in ${cls?.name} ${cls?.section} as "${status}"?`)) return;
    await supabase.from('students').update({ fees_status: status }).eq('class_id', classId).eq('school_id', schoolId);
    fetchAll();
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.roll_number ?? '').toLowerCase().includes(search.toLowerCase());
    const matchClass  = !filterClass  || s.class_id === filterClass;
    const matchStatus = !filterStatus || s.fees_status === filterStatus;
    return matchSearch && matchClass && matchStatus;
  });

  const paid    = students.filter(s => s.fees_status === 'paid').length;
  const pending = students.filter(s => s.fees_status === 'pending').length;
  const overdue = students.filter(s => s.fees_status === 'overdue').length;
  const total   = students.length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Fees Management</h1>
        <p className="text-sm opacity-75 mt-1">Track and update fee payment status for all students</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Paid',    count: paid,    pct: total ? Math.round((paid/total)*100) : 0,    ...STATUS_CONFIG.paid    },
          { label: 'Pending', count: pending, pct: total ? Math.round((pending/total)*100) : 0, ...STATUS_CONFIG.pending },
          { label: 'Overdue', count: overdue, pct: total ? Math.round((overdue/total)*100) : 0, ...STATUS_CONFIG.overdue },
        ].map(({ label, count, pct, color, bg, border, icon: Icon }) => (
          <motion.div key={label} whileHover={{ y: -2 }}
            className={`${bg} border ${border} rounded-2xl p-4 cursor-pointer backdrop-blur-sm`}
            onClick={() => setFilterStatus(filterStatus === label.toLowerCase() ? '' : label.toLowerCase())}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className={`text-xs font-black ${color}`}>{pct}%</span>
            </div>
            <p className={`text-2xl font-black ${color}`}>{count}</p>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1">{label}</p>
            {total > 0 && (
              <div className="mt-2 h-1 bg-slate-700/70 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color.replace('text-','bg-')}`} style={{ width: `${pct}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bulk action */}
      {filterClass && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-300 font-semibold">
            Bulk update for <span className="text-white font-black">{classes.find(c=>c.id===filterClass)?.name} {classes.find(c=>c.id===filterClass)?.section}</span>
          </p>
          <div className="flex gap-2">
            {(['paid','pending','overdue'] as const).map(s => (
              <button key={s} onClick={() => bulkUpdate(filterClass, s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black border transition ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].border} ${STATUS_CONFIG[s].color}`}>
                All {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
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
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
      ) : (
        <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white overflow-hidden backdrop-blur-sm">
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_180px] gap-3 px-5 py-2.5 border-b border-slate-700/40 text-[10px] text-slate-500 font-black uppercase tracking-wider">
            <span>Student</span><span>Class</span><span>Roll No.</span><span>Status -- Update</span>
          </div>
          <div className="divide-y divide-slate-700/30">
            {filtered.map(s => {
              const cfg = STATUS_CONFIG[s.fees_status];
              return (
                <div key={s.id} className="flex sm:grid sm:grid-cols-[1fr_100px_100px_180px] items-center gap-3 px-5 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-7 w-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 text-xs font-black ${cfg.color}`}>
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">{s.class_name}</span>
                  <span className="text-xs text-slate-400 hidden sm:block">{s.roll_number ?? '""'}</span>
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    {updating === s.id
                      ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      : (['paid','pending','overdue'] as const).map(st => (
                          <button key={st} onClick={() => updateStatus(s.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition ${
                              s.fees_status === st
                                ? `${STATUS_CONFIG[st].bg} ${STATUS_CONFIG[st].border} ${STATUS_CONFIG[st].color}`
                                : 'bg-slate-800/80 border-slate-600/30 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                          </button>
                        ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
