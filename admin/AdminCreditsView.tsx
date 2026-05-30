'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Search, Plus, Check, X, Loader2,
  TrendingUp, TrendingDown, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface StudentCredit {
  student_id:  string;
  name:        string;
  class_name:  string;
  user_id:     string | null;
  balance:     number;
  allocated:   number;
  used:        number;
}

interface CreditRequest {
  id:                string;
  user_id:           string;
  credits_requested: number;
  status:            string;
  note:              string | null;
  created_at:        string;
  student_name:      string;
}

interface ClassOption { id: string; name: string; section: string; }

export default function AdminCreditsView({ schoolId, adminId }: AdminCtx) {
  const [students,    setStudents]    = useState<StudentCredit[]>([]);
  const [requests,    setRequests]    = useState<CreditRequest[]>([]);
  const [classes,     setClasses]     = useState<ClassOption[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [allocModal,  setAllocModal]  = useState<{ userId: string; name: string } | null>(null);
  const [bulkClass,   setBulkClass]   = useState('');
  const [allocAmt,    setAllocAmt]    = useState('50');
  const [allocNote,   setAllocNote]   = useState('Principal allocation');
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState<'balances' | 'requests'>('balances');
  const [selected,    setSelected]    = useState<Set<string>>(new Set());

  const toggleSelect = (userId: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(userId) ? n.delete(userId) : n.add(userId); return n; });
  const selectAll = () => setSelected(new Set(filtered.filter(s => s.user_id).map(s => s.user_id!)));
  const clearSel  = () => setSelected(new Set());

  const handleBulkAllocate = async () => {
    if (!selected.size) return;
    const amount = parseInt(allocAmt, 10);
    if (!amount || amount <= 0) return;
    setSaving(true);
    await Promise.all([...selected].map(uid =>
      (supabase as any).rpc('admin_allocate_credits', {
        p_student_user_id: uid, p_amount: amount,
        p_description: allocNote || 'Principal allocation',
      })
    ));
    setSaving(false); clearSel(); setAllocAmt('50'); fetchAll();
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [stuRes, clsRes] = await Promise.all([
      supabase.from('students')
        .select('id, name, user_id, class_id, classes(name, section)')
        .eq('school_id', schoolId).order('name'),
      supabase.from('classes').select('id, name, section').eq('school_id', schoolId).order('name'),
    ]);
    const rawStudents = (stuRes.data ?? []) as any[];
    setClasses((clsRes.data ?? []) as ClassOption[]);

    const userIds = rawStudents.filter(s => s.user_id).map(s => s.user_id);
    const { data: balData } = userIds.length
      ? await supabase.from('user_credit_balances').select('user_id, balance, total_allocated, total_used').in('user_id', userIds)
      : { data: [] };
    const balMap = new Map((balData ?? []).map((b: any) => [b.user_id, b]));

    setStudents(rawStudents.map(s => {
      const bal = balMap.get(s.user_id) as any;
      return {
        student_id: s.id, name: s.name,
        class_name: s.classes ? `${s.classes.name} ${s.classes.section}` : 'Unassigned',
        user_id: s.user_id,
        balance:   bal?.balance           ?? 0,
        allocated: bal?.total_allocated   ?? 0,
        used:      bal?.total_used        ?? 0,
      };
    }));

    // Fetch pending credit requests
    const { data: reqData } = await supabase
      .from('credit_requests')
      .select('id, user_id, credits_requested, status, note, created_at')
      .eq('school_id', schoolId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const reqStudentIds = (reqData ?? []).map((r: any) => r.user_id);
    const nameMap = new Map(rawStudents.filter(s => s.user_id).map(s => [s.user_id, s.name]));
    setRequests(((reqData ?? []) as any[]).map(r => ({
      ...r,
      student_name: nameMap.get(r.user_id) ?? 'Unknown',
    })));

    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAllocate = async () => {
    const amount = parseInt(allocAmt, 10);
    if (!amount || amount <= 0) return;
    setSaving(true);

    if (bulkClass) {
      // Bulk allocation for a class
      const classStudents = students.filter(s => {
        const cls = classes.find(c => c.id === bulkClass);
        return cls && s.class_name === `${cls.name} ${cls.section}` && s.user_id;
      });
      await Promise.all(classStudents.map(s =>
        (supabase as any).rpc('admin_allocate_credits', {
          p_student_user_id: s.user_id,
          p_amount: amount,
          p_description: allocNote || 'Principal allocation',
        })
      ));
    } else if (allocModal?.userId) {
      await (supabase as any).rpc('admin_allocate_credits', {
        p_student_user_id: allocModal.userId,
        p_amount: amount,
        p_description: allocNote || 'Principal allocation',
      });
    }

    setSaving(false);
    setAllocModal(null);
    setBulkClass('');
    setAllocAmt('50');
    fetchAll();
  };

  const handleRequest = async (id: string, status: 'approved' | 'denied', userId: string, amount: number) => {
    await supabase.from('credit_requests').update({ status, resolved_at: new Date().toISOString() }).eq('id', id);
    if (status === 'approved') {
      await (supabase as any).rpc('admin_allocate_credits', {
        p_student_user_id: userId,
        p_amount: amount,
        p_description: 'Credit request approved by Principal',
      });
    }
    fetchAll();
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass  = !filterClass || s.class_name === (() => {
      const c = classes.find(cl => cl.id === filterClass);
      return c ? `${c.name} ${c.section}` : '';
    })();
    return matchSearch && matchClass;
  });

  const totalAllocated = students.reduce((sum, s) => sum + s.allocated, 0);
  const totalUsed      = students.reduce((sum, s) => sum + s.used, 0);
  const totalBalance   = students.reduce((sum, s) => sum + s.balance, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI Credits</h1>
          <p className="text-sm opacity-75 mt-1">Manage student credit allocations</p>
        </div>
        <button
          onClick={() => { setAllocModal(null); setBulkClass(filterClass || classes[0]?.id || ''); setAllocAmt('50'); }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-black transition"
        >
          <Plus className="h-4 w-4" /> Allocate Credits
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Allocated', value: totalAllocated, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
          { label: 'Total Used',      value: totalUsed,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
          { label: 'Total Balance',   value: totalBalance,   color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4 backdrop-blur-sm`}>
            <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/80 rounded-xl p-1 w-fit">
        {(['balances', 'requests'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition capitalize ${activeTab === t ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t} {t === 'requests' && requests.length > 0 && <span className="ml-1 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
      ) : activeTab === 'balances' ? (
        <>
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

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 bg-primary-600/15 border border-primary-500/30 rounded-2xl px-4 py-3 flex-wrap">
              <span className="text-sm font-black text-primary-300">{selected.size} student{selected.size > 1 ? 's' : ''} selected</span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <input type="number" min="1" max="500" value={allocAmt}
                  onChange={e => setAllocAmt(e.target.value)}
                  className="w-20 text-center rounded-xl bg-slate-800/95 border border-slate-600/80 px-2 py-1.5 text-sm font-black text-white focus:outline-none transition" />
                <span className="text-xs text-slate-400">credits each</span>
                <button onClick={handleBulkAllocate} disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2 text-sm font-black text-white transition disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Allocate
                </button>
                <button onClick={clearSel} className="text-xs text-slate-400 hover:text-white transition font-semibold">Clear</button>
              </div>
            </div>
          )}

          <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white overflow-hidden backdrop-blur-sm">
            <div className="hidden sm:grid grid-cols-[32px_1fr_100px_100px_100px_80px] gap-3 px-5 py-2.5 border-b border-slate-700/40 text-[10px] text-slate-500 font-black uppercase tracking-wider">
              <input type="checkbox"
                checked={selected.size === filtered.filter(s => s.user_id).length && filtered.filter(s => s.user_id).length > 0}
                onChange={e => e.target.checked ? selectAll() : clearSel()}
                className="rounded border-slate-600 bg-slate-800 text-primary-600 cursor-pointer" />
              <span>Student</span><span>Class</span><span>Balance</span><span>Used</span><span></span>
            </div>
            <div className="divide-y divide-slate-700/30">
              {filtered.map(s => (
                <div key={s.student_id} className="flex sm:grid sm:grid-cols-[32px_1fr_100px_100px_100px_80px] items-center gap-3 px-5 py-3">
                  <div className="hidden sm:flex items-center">
                    {s.user_id ? (
                      <input type="checkbox" checked={selected.has(s.user_id)}
                        onChange={() => toggleSelect(s.user_id!)}
                        className="rounded border-slate-600 bg-slate-800 text-primary-600 cursor-pointer" />
                    ) : <span className="h-4 w-4" />}
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-primary-500/15 flex items-center justify-center shrink-0 text-xs font-black text-primary-400">
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{s.name}</p>
                      {!s.user_id && <p className="text-[10px] text-amber-400">Not linked</p>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">{s.class_name}</span>
                  <span className={`text-sm font-black hidden sm:block ${s.balance > 20 ? 'text-emerald-400' : s.balance > 5 ? 'text-amber-400' : 'text-red-400'}`}>{s.balance}</span>
                  <span className="text-sm text-slate-400 hidden sm:block">{s.used}</span>
                  {s.user_id && (
                    <button
                      onClick={() => { setAllocModal({ userId: s.user_id!, name: s.name }); setBulkClass(''); setAllocAmt('50'); }}
                      className="hidden sm:flex items-center gap-1 rounded-lg bg-primary-600/20 border border-primary-500/25 px-2 py-1.5 text-[10px] font-black text-primary-400 hover:bg-primary-600/30 transition"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
              <Clock className="h-10 w-10 opacity-40" />
              <p className="text-sm">No pending credit requests</p>
            </div>
          ) : requests.map(r => (
            <div key={r.id} className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-4 backdrop-blur-sm flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{r.student_name}</p>
                  <span className="text-[10px] bg-primary-500/20 text-primary-400 border border-primary-500/25 px-2 py-0.5 rounded-full font-black">{r.credits_requested} credits</span>
                </div>
                {r.note && <p className="text-xs text-slate-400 mt-1">"{r.note}"</p>}
                <p className="text-[10px] text-slate-500 mt-1">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleRequest(r.id, 'denied', r.user_id, r.credits_requested)}
                  className="flex items-center gap-1 rounded-lg bg-red-500/15 border border-red-500/25 px-3 py-2 text-xs font-black text-red-400 hover:bg-red-500/25 transition">
                  <X className="h-3.5 w-3.5" /> Deny
                </button>
                <button onClick={() => handleRequest(r.id, 'approved', r.user_id, r.credits_requested)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-3 py-2 text-xs font-black text-emerald-400 hover:bg-emerald-500/25 transition">
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Allocate modal */}
      <AnimatePresence>
        {(allocModal || bulkClass) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => { setAllocModal(null); setBulkClass(''); }} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0f1629] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black">
                  {allocModal ? `Allocate to ${allocModal.name}` : 'Bulk Allocate by Class'}
                </h2>
                <button onClick={() => { setAllocModal(null); setBulkClass(''); }}
                  className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                {!allocModal && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Target Class</label>
                    <select value={bulkClass} onChange={e => setBulkClass(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition">
                      <option value="">-- Select class --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Credits to Add</label>
                  <input type="number" value={allocAmt} onChange={e => setAllocAmt(e.target.value)} min="1"
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Note</label>
                  <input value={allocNote} onChange={e => setAllocNote(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setAllocModal(null); setBulkClass(''); }}
                    className="flex-1 rounded-xl bg-slate-700/70 py-2.5 text-sm font-bold hover:bg-slate-700 transition">Cancel</button>
                  <button onClick={handleAllocate} disabled={saving || (!allocModal?.userId && !bulkClass)}
                    className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-500 py-2.5 text-sm font-black disabled:opacity-50 flex items-center justify-center gap-2 transition">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Allocate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
