'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { BarChart3, CheckCircle2, XCircle, Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface ClassAttendance {
  class_id:    string;
  class_name:  string;
  present:     number;
  absent:      number;
  late:        number;
  total:       number;
  pct:         number;
}

interface MonthlyRow {
  class_name: string;
  pct:        number;
  color:      string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AdminAttendanceView({ schoolId }: AdminCtx) {
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [daily,      setDaily]      = useState<ClassAttendance[]>([]);
  const [monthly,    setMonthly]    = useState<MonthlyRow[]>([]);
  const [classes,    setClasses]    = useState<{ id: string; name: string; section: string }[]>([]);
  const [loadingD,   setLoadingD]   = useState(false);
  const [loadingM,   setLoadingM]   = useState(false);
  const [activeMonth,setActiveMonth]= useState(new Date().getMonth());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  const CLASS_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#6366F1'];

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from('classes').select('id, name, section').eq('school_id', schoolId).order('name');
    setClasses((data ?? []) as any[]);
  }, [schoolId]);

  const fetchDaily = useCallback(async () => {
    setLoadingD(true);
    const { data: att } = await supabase
      .from('attendance').select('class_id, status')
      .eq('school_id', schoolId).eq('date', date);

    const map = new Map<string, { present: number; absent: number; late: number }>();
    (att ?? []).forEach((a: any) => {
      if (!map.has(a.class_id)) map.set(a.class_id, { present: 0, absent: 0, late: 0 });
      const b = map.get(a.class_id)!;
      if (a.status === 'present') b.present++;
      else if (a.status === 'absent') b.absent++;
      else if (a.status === 'late') b.late++;
    });

    const rows: ClassAttendance[] = classes.map(c => {
      const b = map.get(c.id) ?? { present: 0, absent: 0, late: 0 };
      const total = b.present + b.absent + b.late;
      return {
        class_id:   c.id,
        class_name: `${c.name} ${c.section}`,
        ...b, total,
        pct: total > 0 ? Math.round(((b.present + b.late) / total) * 100) : 0,
      };
    }).filter(r => r.total > 0);
    setDaily(rows);
    setLoadingD(false);
  }, [schoolId, date, classes]);

  const fetchMonthly = useCallback(async () => {
    setLoadingM(true);
    const start = `${activeYear}-${String(activeMonth+1).padStart(2,'0')}-01`;
    const end   = new Date(activeYear, activeMonth + 1, 0).toISOString().split('T')[0];
    const { data: att } = await supabase
      .from('attendance').select('class_id, status')
      .eq('school_id', schoolId).gte('date', start).lte('date', end);

    const map = new Map<string, { pAndL: number; total: number }>();
    (att ?? []).forEach((a: any) => {
      if (!map.has(a.class_id)) map.set(a.class_id, { pAndL: 0, total: 0 });
      const b = map.get(a.class_id)!;
      b.total++;
      if (a.status === 'present' || a.status === 'late') b.pAndL++;
    });

    const rows: MonthlyRow[] = classes.map((c, i) => {
      const b = map.get(c.id) ?? { pAndL: 0, total: 0 };
      return {
        class_name: `${c.name} ${c.section}`,
        pct: b.total > 0 ? Math.round((b.pAndL / b.total) * 100) : 0,
        color: CLASS_COLORS[i % CLASS_COLORS.length],
      };
    }).filter(r => r.pct > 0 || classes.length <= 6);
    setMonthly(rows);
    setLoadingM(false);
  }, [schoolId, activeMonth, activeYear, classes]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { if (classes.length) { fetchDaily(); fetchMonthly(); } }, [classes, fetchDaily, fetchMonthly]);

  const prevMonth = () => { setActiveMonth(m => { if (m === 0) { setActiveYear(y => y-1); return 11; } return m-1; }); };
  const nextMonth = () => { setActiveMonth(m => { if (m === 11) { setActiveYear(y => y+1); return 0; } return m+1; }); };

  const totalPresent = daily.reduce((s, r) => s + r.present + r.late, 0);
  const totalAbsent  = daily.reduce((s, r) => s + r.absent, 0);
  const totalMarked  = daily.reduce((s, r) => s + r.total, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Attendance Reports</h1>
        <p className="text-sm opacity-75 mt-1">School-wide attendance tracking and analysis</p>
      </div>

      {/* â"€â"€ Daily view â"€â"€ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Daily Attendance</h2>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="rounded-xl bg-slate-800/95 border border-slate-600/80 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50 transition"
          />
        </div>

        {totalMarked > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Present', count: totalPresent, pct: Math.round((totalPresent/totalMarked)*100), color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Absent',  count: totalAbsent,  pct: Math.round((totalAbsent/totalMarked)*100),  color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
              { label: 'Marked',  count: totalMarked,  pct: 100,                                        color: 'text-slate-300',   bg: 'bg-slate-700/50',   border: 'border-slate-600/30'   },
            ].map(({ label, count, pct, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl p-4`}>
                <p className={`text-2xl font-black ${color}`}>{count}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{label}</p>
                <p className={`text-xs ${color} font-semibold mt-0.5`}>{pct}%</p>
              </div>
            ))}
          </div>
        )}

        {loadingD ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : daily.length === 0 ? (
          <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white backdrop-blur-sm p-8 text-center text-slate-500 text-sm">
            No attendance recorded for {new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}.
          </div>
        ) : (
          <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white overflow-hidden backdrop-blur-sm">
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_100px] gap-3 px-5 py-2.5 border-b border-slate-700/40 text-[10px] text-slate-500 font-black uppercase tracking-wider">
              <span>Class</span><span>Present</span><span>Absent</span><span>Late</span><span>Total</span><span>Rate</span>
            </div>
            <div className="divide-y divide-slate-700/30">
              {daily.map(r => (
                <div key={r.class_id} className="flex sm:grid sm:grid-cols-[1fr_80px_80px_80px_80px_100px] items-center gap-3 px-5 py-3">
                  <p className="text-sm font-bold">{r.class_name}</p>
                  <span className="text-sm font-black text-emerald-400 hidden sm:block">{r.present}</span>
                  <span className="text-sm font-black text-red-400 hidden sm:block">{r.absent}</span>
                  <span className="text-sm font-black text-amber-400 hidden sm:block">{r.late}</span>
                  <span className="text-sm text-slate-400 hidden sm:block">{r.total}</span>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700/70 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.pct >= 80 ? 'bg-emerald-500' : r.pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className={`text-xs font-black w-8 text-right ${r.pct >= 80 ? 'text-emerald-400' : r.pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{r.pct}%</span>
                  </div>
                  {/* Mobile compact */}
                  <div className="sm:hidden ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400">{r.present}/{r.total}</span>
                    <span className={`text-xs font-black ${r.pct >= 80 ? 'text-emerald-400' : r.pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{r.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* â"€â"€ Monthly view â"€â"€ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Monthly Overview</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-700/70 hover:bg-slate-700 transition">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-300 w-24 text-center">{MONTHS[activeMonth]} {activeYear}</span>
            <button onClick={nextMonth} className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-700/70 hover:bg-slate-700 transition">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {loadingM ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : monthly.length === 0 ? (
          <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white backdrop-blur-sm p-8 text-center text-slate-500 text-sm">
            No attendance data for {MONTHS[activeMonth]} {activeYear}.
          </div>
        ) : (
          <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-5 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={36}>
                <XAxis dataKey="class_name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                  itemStyle={{ color: '#fff', fontWeight: 700 }} cursor={false}
                  formatter={(v: number) => [`${v}%`, 'Attendance']}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {monthly.map((m, i) => <Cell key={i} fill={m.color} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
