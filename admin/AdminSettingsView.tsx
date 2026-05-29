'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, School, Zap, Shield, LogOut, Loader2,
  Check, X, Eye, EyeOff, Lock, CheckCircle2, ChevronRight,
  Globe,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdminCtx } from '../AdminApp';

interface SchoolInfo {
  id:   string;
  name: string;
  code: string;
}

interface Features {
  // General
  doubt_box:                 boolean;
  // Teacher
  teacher_ai_quiz:           boolean;
  teacher_ai_paper:          boolean;
  study_materials:           boolean;
  // Student
  student_ai_tutor:          boolean;
  student_self_practice:     boolean;
  student_credits_default:   number;
}

const DEFAULT_FEATURES: Features = {
  doubt_box:               true,
  teacher_ai_quiz:         true,
  teacher_ai_paper:        true,
  study_materials:         true,
  student_ai_tutor:        true,
  student_self_practice:   true,
  student_credits_default: 100,
};

type SectionType = 'profile' | 'permissions' | 'security';

interface Props extends AdminCtx {
  adminName:  string;
  schoolName: string;
  onLogout:   () => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative flex items-center h-6 w-11 rounded-full px-0.5 shrink-0 transition-colors duration-300 ${on ? 'bg-primary-600' : 'bg-slate-600'}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${on ? 'translate-x-[1.25rem]' : 'translate-x-0'}`} />
    </button>
  );
}

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-800/70 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 mt-1">{children}</p>;
}

export default function AdminSettingsView({ schoolId, adminId, session, adminName, schoolName, onLogout }: Props) {
  const [section,      setSection]      = useState<SectionType>('profile');
  const [school,       setSchool]       = useState<SchoolInfo | null>(null);
  const [features,     setFeatures]     = useState<Features>(DEFAULT_FEATURES);
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [loading,      setLoading]      = useState(true);
  const [savingFeats,  setSavingFeats]  = useState(false);
  const [featsSaved,   setFeatsSaved]   = useState(false);

  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState<string | null>(null);
  const [pwOk,      setPwOk]      = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [schRes, settRes] = await Promise.all([
      supabase.from('schools').select('id, name, code').eq('id', schoolId).maybeSingle(),
      supabase.from('school_settings').select('features, academic_year').eq('school_id', schoolId).maybeSingle(),
    ]);
    if (schRes.data) setSchool(schRes.data as SchoolInfo);
    if (settRes.data) {
      setFeatures({ ...DEFAULT_FEATURES, ...(settRes.data as any).features });
      setAcademicYear((settRes.data as any).academic_year ?? '2025-26');
    }
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggle = (key: keyof Features) =>
    setFeatures(f => ({ ...f, [key]: !f[key as keyof typeof f] }));

  const saveFeatures = async () => {
    setSavingFeats(true);
    await supabase.from('school_settings').upsert({
      school_id:     schoolId,
      features,
      academic_year: academicYear,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'school_id' });
    setSavingFeats(false);
    setFeatsSaved(true);
    setTimeout(() => setFeatsSaved(false), 3000);
  };

  const changePassword = async () => {
    setPwError(null);
    setPwOk(false);
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwError(error.message); return; }
    setPwOk(true);
    setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwOk(false), 4000);
  };

  const sections: { key: SectionType; label: string; icon: React.ElementType }[] = [
    { key: 'profile',     label: 'School & Profile', icon: School  },
    { key: 'permissions', label: 'Permissions',       icon: Shield  },
    { key: 'security',    label: 'Security',          icon: Lock    },
  ];

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-sm opacity-75 mt-1">School configuration and account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">
        {/* Sidebar Nav */}
        <div className="flex lg:flex-col gap-1 bg-slate-900/85 border border-slate-700/60 rounded-2xl p-2 h-fit overflow-x-auto lg:overflow-visible text-white">
          {sections.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap w-full ${
                section === key ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-700/70 hover:text-white'
              }`}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {section !== key && <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-600 hidden lg:block" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={section}
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* ── PROFILE ── */}
            {section === 'profile' && (
              <>
                <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-5 text-white">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">School Information</p>
                  <div className="space-y-2">
                    {[
                      { label: 'School Name',   value: school?.name ?? '—' },
                      { label: 'School Code',   value: school?.code ?? '—' },
                      { label: 'Academic Year', value: academicYear         },
                      { label: 'Grades',        value: 'Class 6 – Class 9' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-sm font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-5 text-white">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Admin Profile</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Name',  value: adminName                      },
                      { label: 'Email', value: session.user.email ?? '—'       },
                      { label: 'Role',  value: 'Principal / Admin'             },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-sm font-bold text-white truncate max-w-[200px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-red-500/20 rounded-2xl p-5 text-white">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Sign Out</p>
                  <p className="text-sm text-slate-400 mb-4">You will need to sign in again to access the portal.</p>
                  <motion.button
                    onClick={() => { setLoggingOut(true); supabase.auth.signOut().then(() => setLoggingOut(false)); }}
                    disabled={loggingOut} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/25 px-5 py-3 text-sm font-black text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                  >
                    {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    Sign Out
                  </motion.button>
                </div>
              </>
            )}

            {/* ── PERMISSIONS ── */}
            {section === 'permissions' && (
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-5 space-y-6 text-white">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Feature Permissions</p>
                  <p className="text-xs text-slate-500">Control which features are active across your school.</p>
                </div>

                {/* General */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <SectionLabel>General</SectionLabel>
                  </div>
                  <ToggleRow
                    label="Doubt Box"
                    desc="Students can submit doubts; teachers can respond"
                    on={features.doubt_box}
                    onToggle={() => toggle('doubt_box')}
                  />
                </div>

                {/* Teacher */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-3.5 w-3.5 text-blue-400" />
                    <SectionLabel>Teacher Features</SectionLabel>
                  </div>
                  <div className="space-y-2">
                    <ToggleRow
                      label="AI Quiz Generation"
                      desc="Teachers can generate quizzes using AI"
                      on={features.teacher_ai_quiz}
                      onToggle={() => toggle('teacher_ai_quiz')}
                    />
                    <ToggleRow
                      label="AI Paper Generation"
                      desc="Teachers can generate full question papers"
                      on={features.teacher_ai_paper}
                      onToggle={() => toggle('teacher_ai_paper')}
                    />
                    <ToggleRow
                      label="Study Material Upload"
                      desc="Teachers can upload PDFs and notes for students"
                      on={features.study_materials}
                      onToggle={() => toggle('study_materials')}
                    />
                  </div>
                </div>

                {/* Student */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-3.5 w-3.5 text-primary-400" />
                    <SectionLabel>Student Features</SectionLabel>
                  </div>
                  <div className="space-y-2">
                    <ToggleRow
                      label="AI Tutor"
                      desc="Students can ask the AI tutor (uses credits)"
                      on={features.student_ai_tutor}
                      onToggle={() => toggle('student_ai_tutor')}
                    />
                    <ToggleRow
                      label="Self Practice"
                      desc="Students can generate practice questions (uses credits)"
                      on={features.student_self_practice}
                      onToggle={() => toggle('student_self_practice')}
                    />
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-800/70 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">Default Credits — New Students</p>
                        <p className="text-xs text-slate-400 mt-0.5">Starting balance for newly enrolled students</p>
                      </div>
                      <input
                        type="number" min="0" max="9999"
                        value={features.student_credits_default}
                        onChange={e => setFeatures(f => ({ ...f, student_credits_default: parseInt(e.target.value) || 0 }))}
                        className="w-20 text-center rounded-xl bg-slate-800/95 border border-slate-600/80 px-2 py-1.5 text-sm font-black text-white focus:outline-none focus:border-primary-500/50 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-700/40">
                  <button onClick={saveFeatures} disabled={savingFeats}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-5 py-2.5 text-sm font-black text-white transition disabled:opacity-50">
                    {savingFeats ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Permissions
                  </button>
                  {featsSaved && (
                    <motion.div initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {section === 'security' && (
              <div className="bg-slate-900/85 border border-slate-700/60 rounded-2xl p-5 space-y-4 text-white">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Change Password</p>
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type={showPw ? 'text' : 'password'} value={newPw}
                      onChange={e => setNewPw(e.target.value)} placeholder="New password"
                      className="w-full rounded-xl bg-slate-800/95 border border-slate-600/80 pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type={showPw ? 'text' : 'password'} value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password"
                      className="w-full rounded-xl bg-slate-800/95 border border-slate-600/80 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition" />
                  </div>
                  {pwError && <p className="text-xs text-red-400 flex items-center gap-1.5"><X className="h-3.5 w-3.5" />{pwError}</p>}
                  {pwOk    && <p className="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Password updated successfully.</p>}
                  <motion.button onClick={changePassword} disabled={pwLoading || !newPw || !confirmPw}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-5 py-2.5 text-sm font-black text-white transition disabled:opacity-40">
                    {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Update Password
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
