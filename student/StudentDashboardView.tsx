'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Zap, BookOpen, ClipboardList, TrendingUp, Calendar,
  ChevronRight, Clock, Flame, Trophy, Sparkles, Loader2,
  CheckCircle2, AlertCircle, RefreshCw, GraduationCap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { supabase } from '../lib/supabase';
import { generateTodaysFocus } from '../geminiService';
import { CREDIT_COSTS } from '../types';
import type { StudentProfile, TimetableSlot, QuizData, QuizSubmissionData } from '../types';
import { DUMMY_TIMETABLE, DUMMY_ENRICHED_QUIZZES, DUMMY_SUBMISSIONS, DUMMY_ATTENDANCE } from './dummyStudentData';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
  onNavigate:    (tab: string) => void;
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Fallback chart data shown when student has no real submissions yet
const DUMMY_GRADES = [
  { week: 'W1', score: 72 }, { week: 'W2', score: 78 },
  { week: 'W3', score: 74 }, { week: 'W4', score: 85 },
  { week: 'W5', score: 80 }, { week: 'W6', score: 88 },
];
const DUMMY_SUBJECTS = [
  { name: 'Math',    score: 82, color: '#3B82F6' },
  { name: 'Science', score: 76, color: '#10B981' },
  { name: 'History', score: 68, color: '#F59E0B' },
  { name: 'English', score: 91, color: '#EC4899' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }}
      className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-white/10">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black tracking-tight">{value}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

function ScheduleRow({ slot }: { slot: TimetableSlot }) {
  const color = slot.subjects?.color ?? '#3B82F6';
  const fmt = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="h-8 w-1 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{slot.subjects?.name ?? 'Free Period'}</p>
        <p className="text-xs text-white/40 truncate">{slot.teachers?.name ?? '—'}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-white/60">{fmt(slot.start_time)}</p>
        <p className="text-[10px] text-white/30">P{slot.period_number}</p>
      </div>
    </div>
  );
}

export default function StudentDashboardView({ student, creditBalance, deductCredits, onNavigate }: Props) {
  const [todaySlots, setTodaySlots]         = useState<TimetableSlot[]>([]);
  const [tomorrowSlots, setTomorrowSlots]   = useState<TimetableSlot[]>([]);
  const [pendingQuizzes, setPendingQuizzes] = useState<QuizData[]>([]);
  const [recentGrades, setRecentGrades]     = useState<QuizSubmissionData[]>([]);
  const [attendancePct, setAttendancePct]   = useState<number>(87); // fallback
  const [streak, setStreak]                 = useState(0);
  const [todaysFocus, setTodaysFocus]       = useState<string | null>(null);
  const [focusLoading, setFocusLoading]     = useState(false);
  const [loading, setLoading]               = useState(true);

  const todayDay    = DAYS[new Date().getDay()];
  const tomorrowDay = DAYS[(new Date().getDay() + 1) % 7];

  const fetchDashboard = useCallback(async () => {
    if (!student?.class_id) { setLoading(false); return; }
    setLoading(true);

    const [slots, quizzes, submissions, attendanceData] = await Promise.all([
      supabase.from('timetable_slots')
        .select('*, subjects(name, color), teachers(name)')
        .eq('class_id', student.class_id).order('period_number'),
      supabase.from('quizzes')
        .select('*, subjects(name, color), chapters(name)')
        .eq('class_id', student.class_id).eq('published', true).order('due_date'),
      supabase.from('quiz_submissions')
        .select('*, quizzes(title, subjects(name))')
        .eq('student_id', student.id).eq('grade_published', true)
        .order('submitted_at', { ascending: false }).limit(5),
      supabase.from('attendance').select('status')
        .eq('student_id', student.id)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    ]);

    const allSlots = slots.data?.length
      ? (slots.data as TimetableSlot[])
      : DUMMY_TIMETABLE;
    setTodaySlots(allSlots.filter(s => s.day_of_week === todayDay));
    setTomorrowSlots(allSlots.filter(s => s.day_of_week === tomorrowDay));

    const submittedIds = new Set((submissions.data ?? []).map((s: any) => s.quiz_id));
    const allQuizzes = quizzes.data?.length
      ? (quizzes.data as QuizData[])
      : DUMMY_ENRICHED_QUIZZES.filter(q => q.status === 'pending');
    setPendingQuizzes(allQuizzes.filter(q => !submittedIds.has(q.id)).slice(0, 4));

    const allSubs = submissions.data?.length
      ? (submissions.data as QuizSubmissionData[])
      : DUMMY_SUBMISSIONS.filter(s => s.grade_published);
    setRecentGrades(allSubs);

    const att = attendanceData.data?.length ? attendanceData.data : DUMMY_ATTENDANCE.slice(-30);
    const present = att.filter((a: any) => a.status === 'present').length;
    setAttendancePct(Math.round((present / att.length) * 100));

    const { data: attAll } = await supabase.from('attendance')
      .select('date, status').eq('student_id', student.id)
      .order('date', { ascending: false }).limit(30);
    const streakSrc = attAll?.length ? attAll : [...DUMMY_ATTENDANCE].reverse().slice(0, 30);
    let s = 0;
    for (const r of streakSrc) {
      if ((r as any).status === 'present') s++; else break;
    }
    setStreak(s);
    setLoading(false);
  }, [student, todayDay, tomorrowDay]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    const cached = localStorage.getItem(`focus_${student.id}_${new Date().toDateString()}`);
    if (cached) setTodaysFocus(cached);
  }, [student.id]);

  const handleGenerateFocus = async () => {
    const ok = await deductCredits(CREDIT_COSTS.TODAY_FOCUS, 'today_focus', "Generated Today's Focus");
    if (!ok) return;
    setFocusLoading(true);
    const focus = await generateTodaysFocus(pendingQuizzes.map(q => q.title), [], []);
    setTodaysFocus(focus);
    localStorage.setItem(`focus_${student.id}_${new Date().toDateString()}`, focus);
    setFocusLoading(false);
  };

  // Build grade trend from real data or fallback to dummy
  const gradeChartData = recentGrades.length >= 2
    ? recentGrades.slice().reverse().map((s, i) => ({
        week: `Q${i + 1}`,
        score: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
      }))
    : DUMMY_GRADES;

  const latestScore = recentGrades[0]
    ? `${Math.round((recentGrades[0].score / recentGrades[0].total) * 100)}%`
    : '82%';

  const scoreColor = (score: number, total: number) => {
    const p = total > 0 ? (score / total) * 100 : 0;
    return p >= 80 ? 'text-emerald-400' : p >= 60 ? 'text-amber-400' : 'text-red-400';
  };

  const className = student.class
    ? `${student.class.name} ${student.class.section}`
    : 'Class';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={TrendingUp}   label="Attendance"      color="bg-emerald-500/20 text-emerald-400"
          value={`${attendancePct}%`} sub="This month" />
        <StatCard icon={ClipboardList} label="Pending Quizzes" color="bg-amber-500/20 text-amber-400"
          value={loading ? '…' : pendingQuizzes.length} sub="Due soon" />
        <StatCard icon={Zap}          label="AI Credits"      color="bg-blue-500/20 text-blue-400"
          value={creditBalance} sub="Available" />
        <StatCard icon={Trophy}       label="Latest Score"    color="bg-violet-500/20 text-violet-400"
          value={latestScore} sub="Recent quiz" />
      </div>

      {/* ── Performance charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Grade trend */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Grade Trend</p>
              <p className="text-lg font-black mt-0.5">{latestScore} <span className="text-xs text-emerald-400 font-semibold">+6% this month</span></p>
            </div>
            <button onClick={() => onNavigate('performance')}
              className="text-xs text-white/40 hover:text-white transition flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={gradeChartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                itemStyle={{ color: '#60A5FA' }}
                formatter={(v: number) => [`${v}%`, 'Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="url(#gradeGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject performance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Subject Performance</p>
              <p className="text-lg font-black mt-0.5">Overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={DUMMY_SUBJECTS} margin={{ top: 4, right: 4, left: -30, bottom: 0 }} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                formatter={(v: number) => [`${v}%`, 'Score']}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {DUMMY_SUBJECTS.map((s, i) => <Cell key={i} fill={s.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Schedule + Quizzes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Today's Schedule</p>
                <p className="text-sm font-black">{todayDay}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('calendar')}
              className="text-xs text-white/40 hover:text-white transition flex items-center gap-1">
              Full timetable <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
          ) : todaySlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/30 text-sm gap-2">
              <Calendar className="h-8 w-8 opacity-40" />
              {['Saturday','Sunday'].includes(todayDay) ? 'No school today 🎉' : 'No timetable set yet'}
            </div>
          ) : (
            <div>
              {todaySlots.slice(0, 5).map(slot => <ScheduleRow key={slot.id} slot={slot} />)}
              {todaySlots.length > 5 && (
                <p className="text-xs text-white/30 pt-2 text-center">+{todaySlots.length - 5} more</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Pending Quizzes + Recent Grades stacked */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-black uppercase tracking-wider">Pending Quizzes</p>
              </div>
              <button onClick={() => onNavigate('quizzes')}
                className="text-xs text-white/40 hover:text-white transition flex items-center gap-1">
                All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
            ) : pendingQuizzes.length === 0 ? (
              <div className="flex items-center gap-2 py-3 text-white/30 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400/40 shrink-0" />
                All caught up! No pending quizzes.
              </div>
            ) : (
              <div className="space-y-1.5">
                {pendingQuizzes.map(quiz => (
                  <motion.div key={quiz.id} whileHover={{ x: 3 }}
                    onClick={() => onNavigate('quizzes')}
                    className="flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/8 px-3 py-2.5 cursor-pointer transition">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{quiz.title}</p>
                      <p className="text-xs text-white/40">{quiz.subjects?.name ?? 'General'} · {quiz.questions?.length ?? 0}Q</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Grades */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-violet-400" />
                <p className="text-sm font-black uppercase tracking-wider">Recent Grades</p>
              </div>
              <button onClick={() => onNavigate('performance')}
                className="text-xs text-white/40 hover:text-white transition flex items-center gap-1">
                All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {recentGrades.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-3">No grades published yet.</p>
            ) : (
              <div className="space-y-1.5">
                {recentGrades.slice(0, 3).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{(sub as any).quizzes?.title ?? 'Quiz'}</p>
                      <p className="text-xs text-white/40">{(sub as any).quizzes?.subjects?.name ?? '—'}</p>
                    </div>
                    <span className={`text-base font-black shrink-0 ml-3 ${scoreColor(sub.score, sub.total)}`}>
                      {sub.score}/{sub.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Today's Focus + Quick nav ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-1 glass-card rounded-2xl border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-black uppercase tracking-wider">Today's Focus</p>
            </div>
            <span className="text-[10px] text-white/30 border border-white/10 rounded-lg px-2 py-1">
              {CREDIT_COSTS.TODAY_FOCUS} credit
            </span>
          </div>
          {todaysFocus ? (
            <div className="space-y-3">
              <p className="text-sm text-white/80 leading-relaxed">{todaysFocus}</p>
              <button onClick={handleGenerateFocus}
                disabled={focusLoading || creditBalance < CREDIT_COSTS.TODAY_FOCUS}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition disabled:opacity-40">
                <RefreshCw className={`h-3 w-3 ${focusLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/40">Get a personalized study plan based on your upcoming quizzes and performance.</p>
              <motion.button onClick={handleGenerateFocus}
                disabled={focusLoading || creditBalance < CREDIT_COSTS.TODAY_FOCUS}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500/20 border border-blue-400/25 py-2.5 text-sm font-bold text-blue-300 hover:bg-blue-500/30 transition disabled:opacity-40">
                {focusLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                  : <><Sparkles className="h-4 w-4" /> Generate ({CREDIT_COSTS.TODAY_FOCUS} cr)</>}
              </motion.button>
              {creditBalance < CREDIT_COSTS.TODAY_FOCUS && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Not enough credits
                </p>
              )}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { tab: 'quizzes',     icon: ClipboardList, label: 'My Quizzes',    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20'   },
            { tab: 'practice',    icon: Sparkles,      label: 'Self-Practice', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20' },
            { tab: 'tutor',       icon: BookOpen,      label: 'AI Tutor',      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20'       },
            { tab: 'performance', icon: TrendingUp,    label: 'Performance',   color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20' },
          ].map(({ tab, icon: Icon, label, color }) => (
            <motion.button key={tab} onClick={() => onNavigate(tab)}
              whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className={`glass-card rounded-2xl border bg-gradient-to-br ${color} p-4 flex flex-col items-center gap-2 text-center transition h-full`}>
              <Icon className="h-6 w-6 opacity-80" />
              <span className="text-xs font-bold">{label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
