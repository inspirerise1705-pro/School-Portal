'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Zap, BookOpen, ClipboardList, TrendingUp, Calendar,
  ChevronRight, Clock, Flame, Trophy, Sparkles, Loader2,
  CheckCircle2, AlertCircle, RefreshCw, GraduationCap, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateTodaysFocus } from '../geminiService';
import { CREDIT_COSTS } from '../types';
import type { StudentProfile, TimetableSlot, QuizData, QuizSubmissionData } from '../types';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
  onNavigate:    (tab: string) => void;
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function feesColor(status: string) {
  if (status === 'paid')    return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  if (status === 'overdue') return 'text-red-400 bg-red-500/15 border-red-500/30';
  return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-white/10"
    >
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

// ── Schedule Row ─────────────────────────────────────────────
function ScheduleRow({ slot }: { slot: TimetableSlot }) {
  const subjectColor = slot.subjects?.color ?? '#3B82F6';
  const fmt = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div
        className="h-8 w-1 rounded-full shrink-0"
        style={{ background: subjectColor }}
      />
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
  const [attendancePct, setAttendancePct]   = useState<number | null>(null);
  const [streak, setStreak]                 = useState(0);
  const [todaysFocus, setTodaysFocus]       = useState<string | null>(null);
  const [focusLoading, setFocusLoading]     = useState(false);
  const [loading, setLoading]               = useState(true);

  const todayDay    = DAYS[new Date().getDay()];
  const tomorrowDay = DAYS[(new Date().getDay() + 1) % 7];

  const fetchDashboard = useCallback(async () => {
    if (!student?.class_id) return;
    setLoading(true);

    const [slots, quizzes, submissions, attendanceData] = await Promise.all([
      // All slots for student's class
      supabase
        .from('timetable_slots')
        .select('*, subjects(name, color), teachers(name)')
        .eq('class_id', student.class_id)
        .order('period_number'),

      // Published quizzes for student's class
      supabase
        .from('quizzes')
        .select('*, subjects(name, color), chapters(name)')
        .eq('class_id', student.class_id)
        .eq('published', true)
        .order('due_date'),

      // Student's own submissions
      supabase
        .from('quiz_submissions')
        .select('*, quizzes(title, subjects(name))')
        .eq('student_id', student.id)
        .eq('grade_published', true)
        .order('submitted_at', { ascending: false })
        .limit(3),

      // This month's attendance
      supabase
        .from('attendance')
        .select('status')
        .eq('student_id', student.id)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    ]);

    const allSlots = (slots.data ?? []) as TimetableSlot[];
    setTodaySlots(allSlots.filter(s => s.day_of_week === todayDay));
    setTomorrowSlots(allSlots.filter(s => s.day_of_week === tomorrowDay));

    // Filter out already-submitted quizzes
    const submittedIds = new Set((submissions.data ?? []).map((s: any) => s.quiz_id));
    setPendingQuizzes(
      ((quizzes.data ?? []) as QuizData[]).filter(q => !submittedIds.has(q.id)).slice(0, 4)
    );
    setRecentGrades((submissions.data ?? []) as QuizSubmissionData[]);

    // Attendance %
    const att = attendanceData.data ?? [];
    if (att.length > 0) {
      const present = att.filter((a: any) => a.status === 'present').length;
      setAttendancePct(Math.round((present / att.length) * 100));
    }

    // Streak (consecutive present days from today backwards)
    const { data: attAll } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('student_id', student.id)
      .order('date', { ascending: false })
      .limit(30);
    let s = 0;
    for (const r of (attAll ?? [])) {
      if ((r as any).status === 'present') s++;
      else break;
    }
    setStreak(s);

    setLoading(false);
  }, [student, todayDay, tomorrowDay]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Load cached today's focus
  useEffect(() => {
    const cacheKey = `focus_${student.id}_${new Date().toDateString()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) setTodaysFocus(cached);
  }, [student.id]);

  const handleGenerateFocus = async () => {
    const cost = CREDIT_COSTS.TODAY_FOCUS;
    const ok = await deductCredits(cost, 'today_focus', "Generated Today's Focus");
    if (!ok) return;
    setFocusLoading(true);
    const quizTitles = pendingQuizzes.map(q => q.title);
    const focus = await generateTodaysFocus(quizTitles, [], []);
    setTodaysFocus(focus);
    localStorage.setItem(`focus_${student.id}_${new Date().toDateString()}`, focus);
    setFocusLoading(false);
  };

  const scoreColor = (score: number, total: number) => {
    const pct = total > 0 ? (score / total) * 100 : 0;
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const className = student.class
    ? `Class ${student.class.name} ${student.class.section}`
    : 'Student';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
      {/* ── Welcome hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center overflow-hidden">
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-7 w-7 text-blue-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/40 font-semibold">
            {getGreeting()}
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight truncate">
            {student.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70">
              <GraduationCap className="h-3 w-3" />
              {className}
            </span>
            {student.roll_number && (
              <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70">
                Roll No. {student.roll_number}
              </span>
            )}
            <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold capitalize ${feesColor(student.fees_status)}`}>
              Fees: {student.fees_status}
            </span>
          </div>
        </div>
        {streak > 2 && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-500/15 border border-amber-500/25 px-4 py-3 shrink-0">
            <Flame className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-lg font-black text-amber-400">{streak}</p>
              <p className="text-[10px] text-amber-400/60 uppercase tracking-wider">day streak</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={TrendingUp} label="Attendance" color="bg-emerald-500/20 text-emerald-400"
          value={attendancePct !== null ? `${attendancePct}%` : '—'}
          sub="This month"
        />
        <StatCard
          icon={ClipboardList} label="Pending Quizzes" color="bg-amber-500/20 text-amber-400"
          value={loading ? '…' : pendingQuizzes.length}
          sub="Due soon"
        />
        <StatCard
          icon={Zap} label="AI Credits" color="bg-blue-500/20 text-blue-400"
          value={creditBalance}
          sub="Available"
        />
        <StatCard
          icon={Trophy} label="Recent Score" color="bg-violet-500/20 text-violet-400"
          value={recentGrades[0] ? `${recentGrades[0].score}/${recentGrades[0].total}` : '—'}
          sub={recentGrades[0] ? 'Latest grade' : 'No grades yet'}
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-black uppercase tracking-wider">Today · {todayDay}</h2>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs text-white/40 hover:text-white transition flex items-center gap-1"
            >
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
            <div className="space-y-0">
              {todaySlots.slice(0, 6).map(slot => (
                <ScheduleRow key={slot.id} slot={slot} />
              ))}
              {todaySlots.length > 6 && (
                <p className="text-xs text-white/30 pt-2 text-center">+{todaySlots.length - 6} more periods</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Tomorrow's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              <h2 className="text-sm font-black uppercase tracking-wider">Tomorrow · {tomorrowDay}</h2>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
          ) : tomorrowSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/30 text-sm gap-2">
              <Calendar className="h-8 w-8 opacity-40" />
              {['Saturday','Sunday'].includes(tomorrowDay) ? 'Weekend tomorrow 🎉' : 'No timetable set'}
            </div>
          ) : (
            <div className="space-y-0">
              {tomorrowSlots.slice(0, 6).map(slot => (
                <ScheduleRow key={slot.id} slot={slot} />
              ))}
              {tomorrowSlots.length > 6 && (
                <p className="text-xs text-white/30 pt-2 text-center">+{tomorrowSlots.length - 6} more periods</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Pending Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-black uppercase tracking-wider">Pending Quizzes</h2>
            </div>
            <button
              onClick={() => onNavigate('quizzes')}
              className="text-xs text-white/40 hover:text-white transition flex items-center gap-1"
            >
              All quizzes <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
          ) : pendingQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/30 text-sm gap-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400/40" />
              All caught up! No pending quizzes.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingQuizzes.map(quiz => (
                <motion.div
                  key={quiz.id}
                  whileHover={{ x: 3 }}
                  onClick={() => onNavigate('quizzes')}
                  className="flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/8 px-3 py-2.5 cursor-pointer transition"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{quiz.title}</p>
                    <p className="text-xs text-white/40 truncate">
                      {quiz.subjects?.name ?? 'General'} · {quiz.questions?.length ?? 0} questions
                    </p>
                  </div>
                  {quiz.due_date && (
                    <span className="text-[10px] text-white/30 shrink-0">
                      Due {new Date(quiz.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Grades + Today's Focus */}
        <div className="space-y-4">
          {/* Recent Grades */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-violet-400" />
                <h2 className="text-sm font-black uppercase tracking-wider">Recent Grades</h2>
              </div>
              <button
                onClick={() => onNavigate('performance')}
                className="text-xs text-white/40 hover:text-white transition flex items-center gap-1"
              >
                All grades <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
            ) : recentGrades.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-4">No grades published yet.</p>
            ) : (
              <div className="space-y-2">
                {recentGrades.map(sub => (
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

          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl border border-white/10 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-black uppercase tracking-wider">Today's Focus</h2>
              </div>
              <span className="text-[10px] text-white/30 border border-white/10 rounded-lg px-2 py-1">
                {CREDIT_COSTS.TODAY_FOCUS} credit
              </span>
            </div>
            {todaysFocus ? (
              <div className="space-y-3">
                <p className="text-sm text-white/80 leading-relaxed">{todaysFocus}</p>
                <button
                  onClick={handleGenerateFocus}
                  disabled={focusLoading || creditBalance < CREDIT_COSTS.TODAY_FOCUS}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition disabled:opacity-40"
                >
                  <RefreshCw className={`h-3 w-3 ${focusLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-white/40">
                  Get a personalized study plan based on your upcoming quizzes and performance.
                </p>
                <motion.button
                  onClick={handleGenerateFocus}
                  disabled={focusLoading || creditBalance < CREDIT_COSTS.TODAY_FOCUS}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500/20 border border-blue-400/25 py-2.5 text-sm font-bold text-blue-300 hover:bg-blue-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {focusLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                    : <><Sparkles className="h-4 w-4" /> Generate Today's Focus ({CREDIT_COSTS.TODAY_FOCUS} credit)</>
                  }
                </motion.button>
                {creditBalance < CREDIT_COSTS.TODAY_FOCUS && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Not enough credits
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick nav tiles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { tab: 'quizzes',  icon: ClipboardList, label: 'My Quizzes',  color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
          { tab: 'practice', icon: Sparkles,      label: 'Self-Practice', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20' },
          { tab: 'tutor',    icon: BookOpen,      label: 'AI Tutor',    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
          { tab: 'performance', icon: TrendingUp, label: 'Performance', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20' },
        ].map(({ tab, icon: Icon, label, color }) => (
          <motion.button
            key={tab}
            onClick={() => onNavigate(tab)}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`glass-card rounded-2xl border bg-gradient-to-br ${color} p-4 flex flex-col items-center gap-2 text-center transition`}
          >
            <Icon className="h-6 w-6 opacity-80" />
            <span className="text-xs font-bold">{label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
