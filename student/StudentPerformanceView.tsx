'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, Calendar, CheckCircle2, XCircle, Clock,
  Loader2, Trophy, CreditCard, AlertCircle, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { supabase } from '../lib/supabase';
import type { StudentProfile, QuizSubmissionData, AttendanceRecord } from '../types';
import { DUMMY_SUBMISSIONS, DUMMY_ATTENDANCE, DUMMY_SUBJECT_AVGS } from './dummyStudentData';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

function scoreColor(pct: number) {
  if (pct >= 80) return '#10B981';
  if (pct >= 60) return '#F59E0B';
  return '#EF4444';
}

function feesStyle(status: string) {
  if (status === 'paid')    return { label: 'Paid',    cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
  if (status === 'overdue') return { label: 'Overdue', cls: 'text-red-400 bg-red-500/15 border-red-500/30' };
  return { label: 'Pending', cls: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function StudentPerformanceView({ student }: Props) {
  const [submissions, setSubmissions] = useState<QuizSubmissionData[]>([]);
  const [attendance,  setAttendance]  = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());

  const fetchData = useCallback(async () => {
    if (!student?.id) return;
    setLoading(true);

    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const [subRes, attRes] = await Promise.all([
      supabase
        .from('quiz_submissions')
        .select('*, quizzes(title, subject_id, subjects(name, color))')
        .eq('student_id', student.id)
        .eq('grade_published', true)
        .order('submitted_at'),
      supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .gte('date', yearStart)
        .order('date'),
    ]);

    setSubmissions(subRes.data?.length ? (subRes.data as QuizSubmissionData[]) : DUMMY_SUBMISSIONS);
    setAttendance(attRes.data?.length ? (attRes.data as AttendanceRecord[]) : DUMMY_ATTENDANCE);
    setLoading(false);
  }, [student]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Grade trend data (for area chart)
  const gradeChartData = submissions.map((s, i) => ({
    name:  `Q${i + 1}`,
    title: (s as any).quizzes?.title ?? 'Quiz',
    score: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
  }));

  // Subject-wise averages — all 7 subjects, quiz scores override dummy avgs where available
  const subjectScores = new Map<string, number[]>();
  submissions.forEach(s => {
    const sub = (s as any).quizzes?.subjects;
    if (!sub || !s.total) return;
    if (!subjectScores.has(sub.name)) subjectScores.set(sub.name, []);
    subjectScores.get(sub.name)!.push(Math.round((s.score / s.total) * 100));
  });
  const SHORT: Record<string, string> = {
    Mathematics: 'Math', 'Social Studies': 'SST', Computer: 'Comp',
    Sanskrit: 'Sanskrit', English: 'English', Science: 'Science', Hindi: 'Hindi',
  };
  const subjectData = DUMMY_SUBJECT_AVGS.map(d => {
    const scores = subjectScores.get(d.name) ?? [];
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : d.avg;
    return { subject: SHORT[d.name] ?? d.name, avg, color: d.color };
  });

  // Attendance for selected month
  const monthAtt = attendance.filter(a => new Date(a.date).getMonth() === activeMonth);
  const present  = monthAtt.filter(a => a.status === 'present').length;
  const absent   = monthAtt.filter(a => a.status === 'absent').length;
  const late     = monthAtt.filter(a => a.status === 'late').length;
  const total    = monthAtt.length;
  const attPct   = total > 0 ? Math.round(((present + late) / total) * 100) : null;

  // Build calendar grid for selected month
  const year    = new Date().getFullYear();
  const firstDay = new Date(year, activeMonth, 1).getDay();
  const daysInMonth = new Date(year, activeMonth + 1, 0).getDate();
  const attMap  = new Map(attendance.filter(a => new Date(a.date).getMonth() === activeMonth)
    .map(a => [new Date(a.date).getDate(), a.status]));

  const fees = feesStyle(student.fees_status);
  const overall = subjectData.length
    ? Math.round(subjectData.reduce((acc, d) => acc + d.avg, 0) / subjectData.length)
    : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">My Performance</h1>
        <p className="text-sm text-white/40 mt-1">Grades, attendance and fees overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-white/30" /></div>
      ) : (
        <>
          {/* ── Quick stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: Trophy, label: 'Overall Avg', color: 'bg-violet-500/20 text-violet-400',
                value: overall !== null ? `${overall}%` : '—',
                sub: 'All subjects avg',
              },
              {
                icon: CheckCircle2, label: 'Attendance', color: 'bg-emerald-500/20 text-emerald-400',
                value: attPct !== null ? `${attPct}%` : '—',
                sub: `${MONTH_NAMES[activeMonth]}`,
              },
              {
                icon: XCircle, label: 'Absences', color: 'bg-red-500/20 text-red-400',
                value: absent,
                sub: `${MONTH_NAMES[activeMonth]}`,
              },
              {
                icon: CreditCard, label: 'Fees Status', color: `border ${fees.cls} bg-transparent`,
                value: fees.label,
                sub: 'Current term',
              },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <motion.div key={label} whileHover={{ y: -2 }}
                className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black tracking-tight">{value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                  <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mt-1">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Grade Trend Chart ── */}
          {gradeChartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-white/10 p-4 sm:p-6"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">Grade Trend</h2>
              <div className="h-48 sm:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gradeChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                      itemStyle={{ color: '#60A5FA' }}
                      formatter={(val: number, _name: string, props: any) => [`${val}%`, props.payload.title]}
                    />
                    <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="url(#gradeGrad)" dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* ── Subject Avg ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">Subject-wise Average</h2>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(val: number) => [`${val}%`, 'Average']}
                      />
                      <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                        {subjectData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ── Attendance Calendar ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-white/60">Attendance</h2>
                <div className="flex gap-1">
                  {MONTH_NAMES.slice(0, new Date().getMonth() + 1).map((m, idx) => (
                    <button
                      key={m}
                      onClick={() => setActiveMonth(idx)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                        activeMonth === idx ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/15'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary row */}
              <div className="flex gap-3 mb-3 flex-wrap">
                {[
                  { label: 'Present', count: present, color: 'text-emerald-400' },
                  { label: 'Absent',  count: absent,  color: 'text-red-400' },
                  { label: 'Late',    count: late,     color: 'text-amber-400' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${color}`}>{count}</span>
                    <span className="text-xs text-white/40">{label}</span>
                  </div>
                ))}
                {attPct !== null && (
                  <span className="ml-auto text-sm font-black text-white/60">{attPct}%</span>
                )}
              </div>

              {/* Mini calendar */}
              {total > 0 ? (
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <div key={i} className="text-center text-[9px] text-white/25 font-bold py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const s = attMap.get(day);
                      const bg = s === 'present' ? 'bg-emerald-500/50'
                               : s === 'absent'  ? 'bg-red-500/50'
                               : s === 'late'    ? 'bg-amber-500/50'
                               : 'bg-white/5';
                      return (
                        <div key={day} className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold ${bg} ${s ? 'text-white' : 'text-white/20'}`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {[
                      { color: 'bg-emerald-500/50', label: 'Present' },
                      { color: 'bg-red-500/50',     label: 'Absent' },
                      { color: 'bg-amber-500/50',   label: 'Late' },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1">
                        <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                        <span className="text-[10px] text-white/40">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-white/30">
                  <Calendar className="h-8 w-8 opacity-40" />
                  <p className="text-xs">No attendance data for {MONTH_NAMES[activeMonth]}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Quiz History ── */}
          {submissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">Quiz History</h2>
              <div className="space-y-2">
                {submissions.slice().reverse().map((s, i) => {
                  const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                  return (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{(s as any).quizzes?.title ?? 'Quiz'}</p>
                        <p className="text-xs text-white/40">{(s as any).quizzes?.subjects?.name ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-16 bg-white/10 rounded-full h-1.5 hidden sm:block">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: scoreColor(pct) }}
                          />
                        </div>
                        <span className="text-sm font-black" style={{ color: scoreColor(pct) }}>
                          {s.score}/{s.total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
