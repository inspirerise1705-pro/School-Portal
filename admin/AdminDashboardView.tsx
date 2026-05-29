'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Users, GraduationCap, BookOpen, TrendingUp,
  DollarSign, Zap, MessageCircle, AlertCircle,
  CheckCircle2, Clock, BarChart3, Calendar,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface Stats {
  teachers: number;
  students: number;
  classes:  number;
  todayPresent: number;
  todayTotal:   number;
  feesPaid:     number;
  feesPending:  number;
  feesOverdue:  number;
  creditsAllocated: number;
  creditsUsed:      number;
  pendingDoubts:    number;
  pendingCreditReqs: number;
}

interface ClassRow {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  feesPct: number;
}

interface RecentActivity {
  title: string;
  subtitle: string;
  time: string;
  type: 'quiz' | 'material' | 'attendance' | 'doubt';
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; bg: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }}
      className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-4 backdrop-blur-sm sm:p-5 flex flex-col gap-3">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboardView({ schoolId }: AdminCtx) {
  const [stats, setStats]         = useState<Stats | null>(null);
  const [classes, setClasses]     = useState<ClassRow[]>([]);
  const [loading, setLoading]     = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [teacherRes, studentRes, classRes, attRes, doubtRes, creditReqRes, creditBalRes] = await Promise.all([
      supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).neq('role', 'admin'),
      supabase.from('students').select('id, fees_status').eq('school_id', schoolId),
      supabase.from('classes').select('id, name, section').eq('school_id', schoolId),
      supabase.from('attendance').select('status').eq('school_id', schoolId).eq('date', today),
      supabase.from('doubt_box').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'pending'),
      supabase.from('credit_requests').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'pending'),
      supabase.from('user_credit_balances').select('total_allocated, total_used').eq('school_id', schoolId),
    ]);

    const students = (studentRes.data ?? []) as any[];
    const att      = (attRes.data ?? []) as any[];
    const balances = (creditBalRes.data ?? []) as any[];
    const cls      = (classRes.data ?? []) as any[];

    const feesPaid    = students.filter(s => s.fees_status === 'paid').length;
    const feesPending = students.filter(s => s.fees_status === 'pending').length;
    const feesOverdue = students.filter(s => s.fees_status === 'overdue').length;

    setStats({
      teachers:          teacherRes.count ?? 0,
      students:          students.length,
      classes:           cls.length,
      todayPresent:      att.filter(a => a.status === 'present' || a.status === 'late').length,
      todayTotal:        att.length,
      feesPaid, feesPending, feesOverdue,
      creditsAllocated:  balances.reduce((s: number, b: any) => s + (b.total_allocated ?? 0), 0),
      creditsUsed:       balances.reduce((s: number, b: any) => s + (b.total_used ?? 0), 0),
      pendingDoubts:     doubtRes.count ?? 0,
      pendingCreditReqs: creditReqRes.count ?? 0,
    });

    // Build class summary rows
    const classRows: ClassRow[] = await Promise.all(cls.map(async (c: any) => {
      const { data: sData } = await supabase
        .from('students').select('fees_status').eq('class_id', c.id).eq('school_id', schoolId);
      const ss = (sData ?? []) as any[];
      const paid = ss.filter(s => s.fees_status === 'paid').length;
      return {
        id: c.id, name: c.name, section: c.section,
        studentCount: ss.length,
        feesPct: ss.length > 0 ? Math.round((paid / ss.length) * 100) : 0,
      };
    }));
    setClasses(classRows);
    setLoading(false);
  }, [schoolId, today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const attPct = stats && stats.todayTotal > 0
    ? Math.round((stats.todayPresent / stats.todayTotal) * 100)
    : null;

  const feesChartData = stats ? [
    { label: 'Paid',    count: stats.feesPaid,    color: '#10B981' },
    { label: 'Pending', count: stats.feesPending, color: '#F59E0B' },
    { label: 'Overdue', count: stats.feesOverdue, color: '#EF4444' },
  ] : [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">School Overview</h1>
        <p className="text-sm opacity-75 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* â"€â"€ Key stats â"€â"€ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={Users}         label="Teachers"  value={stats.teachers}  sub="Active staff"        color="text-blue-400"   bg="bg-blue-500/15"   />
            <StatCard icon={GraduationCap} label="Students"  value={stats.students}  sub="Enrolled"            color="text-primary-400" bg="bg-primary-500/15" />
            <StatCard icon={BookOpen}      label="Classes"   value={stats.classes}   sub="Active sections"     color="text-emerald-400" bg="bg-emerald-500/15" />
            <StatCard icon={BarChart3}     label="Today Att."value={attPct !== null ? `${attPct}%` : '""'}  sub={`${stats.todayPresent}/${stats.todayTotal} marked`} color="text-amber-400" bg="bg-amber-500/15" />
          </div>

          {/* â"€â"€ Fees + Credits â"€â"€ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

            {/* Fees breakdown */}
            <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Fees Collection</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Paid',    count: stats.feesPaid,    color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
                  { label: 'Pending', count: stats.feesPending, color: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/20'   },
                  { label: 'Overdue', count: stats.feesOverdue, color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/20'     },
                ].map(({ label, count, color, bg, border }) => (
                  <div key={label} className={`${bg} border ${border} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-black ${color}`}>{count}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={feesChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={40}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                    itemStyle={{ color: '#fff', fontWeight: 700 }} cursor={false}
                    formatter={(v: number) => [v, 'Students']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {feesChartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Credits & Alerts */}
            <div className="space-y-4">
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary-400" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">AI Credits</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Allocated', value: stats.creditsAllocated, color: 'text-primary-400' },
                    { label: 'Used',      value: stats.creditsUsed,      color: 'text-slate-300'  },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{label}</p>
                    </div>
                  ))}
                </div>
                {stats.creditsAllocated > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((stats.creditsUsed / stats.creditsAllocated) * 100))}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {Math.round((stats.creditsUsed / stats.creditsAllocated) * 100)}% used
                    </p>
                  </div>
                )}
              </div>

              {/* Alerts */}
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Pending Actions</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: MessageCircle, label: 'Unanswered doubts',    count: stats.pendingDoubts,     color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
                    { icon: Zap,          label: 'Credit requests',       count: stats.pendingCreditReqs, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                    { icon: DollarSign,   label: 'Overdue fees',          count: stats.feesOverdue,       color: 'text-red-400',    bg: 'bg-red-500/10'    },
                  ].map(({ icon: Icon, label, count, color, bg }) => (
                    <div key={label} className={`flex items-center justify-between rounded-xl ${bg} px-3 py-2`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                        <span className="text-xs text-slate-300 font-semibold">{label}</span>
                      </div>
                      <span className={`text-sm font-black ${color}`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* â"€â"€ Class summary table â"€â"€ */}
          {classes.length > 0 && (
            <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl text-white overflow-hidden backdrop-blur-sm">
              <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Class Summary</h2>
              </div>
              <div className="divide-y divide-slate-700/30">
                {classes.map(cls => (
                  <div key={cls.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-700/70 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{cls.name} "" {cls.section}</p>
                      <p className="text-xs text-slate-500">{cls.studentCount} students</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${cls.feesPct >= 80 ? 'text-emerald-400' : cls.feesPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {cls.feesPct}%
                      </p>
                      <p className="text-[10px] text-slate-500">fees paid</p>
                    </div>
                    <div className="w-20 hidden sm:block">
                      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cls.feesPct >= 80 ? 'bg-emerald-500' : cls.feesPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${cls.feesPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
