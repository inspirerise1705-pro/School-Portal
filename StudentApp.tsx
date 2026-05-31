'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { WALLPAPERS, WallpaperType } from './constants';
import type { StudentProfile, CreditBalance } from './types';

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

import StudentDashboardView  from './student/StudentDashboardView';
import StudentQuizzesView    from './student/StudentQuizzesView';
import SelfPracticeView      from './student/SelfPracticeView';
import StudyMaterialView     from './student/StudyMaterialView';
import StudentPerformanceView from './student/StudentPerformanceView';
import DoubtBoxView          from './student/DoubtBoxView';
import StudentCalendarView   from './student/StudentCalendarView';
import AITutorView           from './student/AITutorView';
import StudentNotificationsView from './student/StudentNotificationsView';
import StudentSettingsView   from './student/StudentSettingsView';

interface StudentAppProps {
  session: Session;
  onLogout: () => void;
}

export default function StudentApp({ session, onLogout }: StudentAppProps) {
  const [activeTab, setActiveTab]   = useState(() => localStorage.getItem('student_tab') || 'dashboard');
  const [showSidebar, setShowSidebar] = useState(false);

  // Student profile
  const [student, setStudent]       = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Credit state
  const [creditBalance, setCreditBalance] = useState(0);

  // Unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);

  // Theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ir_dark');
    return saved !== null ? saved === 'true' : true;
  });
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperType>(WALLPAPERS[0]);

  const wallpaperOverlay = isDark || currentWallpaper.textColor === 'light'
    ? 'linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.28) 32%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.75) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08) 32%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.18) 100%)';

  // ── Fetch student profile + credits ──────────────────────────
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*, class:classes(name, section)')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) setStudent(data as StudentProfile);
      setProfileLoading(false);
    })();
  }, [session.user.id]);

  const refreshCredits = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('user_credit_balances')
      .select('balance')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (data) setCreditBalance((data as any).balance ?? 0);
  }, [session.user.id]);

  useEffect(() => { refreshCredits(); }, [refreshCredits]);

  // ── Fetch unread notifications count ─────────────────────────
  const refreshUnread = useCallback(async () => {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', session.user.id)
      .eq('read', false);
    setUnreadCount(count ?? 0);
  }, [session.user.id]);

  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  // ── Credit deduction ──────────────────────────────────────────
  const deductCredits = useCallback(async (
    amount: number,
    actionType: string,
    description: string,
  ): Promise<boolean> => {
    if (creditBalance < amount) return false;
    const { data, error } = await (supabase as any).rpc('deduct_credits', {
      p_user_id:     session.user.id,
      p_amount:      amount,
      p_action_type: actionType,
      p_description: description,
    });
    if (error || data === -1) return false;
    setCreditBalance(data as number);
    return true;
  }, [creditBalance, session.user.id]);

  // ── Credit purchase ───────────────────────────────────────────
  // Always update balance optimistically; RPC syncs to DB when available.
  const addCredits = useCallback(async (amount: number, packageName: string) => {
    setCreditBalance(prev => prev + amount);          // instant UI update
    const { data } = await (supabase as any).rpc('add_credits', {
      p_user_id:     session.user.id,
      p_amount:      amount,
      p_description: `Purchased: ${packageName}`,
    });
    if (data && data !== -1) setCreditBalance(data as number); // sync with DB value
  }, [session.user.id]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ir_dark', String(isDark));
  }, [isDark]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('student_tab', tab);
    setShowSidebar(false);
  };

  if (profileLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <p className="text-white/60 text-sm font-semibold tracking-widest uppercase">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    const commonProps = {
      student:       student!,
      creditBalance,
      deductCredits,
      addCredits,
    };

    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboardView    {...commonProps} onNavigate={handleNavigate} />;
      case 'quizzes':
        return <StudentQuizzesView      {...commonProps} />;
      case 'practice':
        return <SelfPracticeView        {...commonProps} />;
      case 'material':
        return <StudyMaterialView       {...commonProps} />;
      case 'performance':
        return <StudentPerformanceView  {...commonProps} />;
      case 'doubts':
        return <DoubtBoxView            {...commonProps} />;
      case 'calendar':
        return <StudentCalendarView     {...commonProps} />;
      case 'tutor':
        return <AITutorView             {...commonProps} />;
      case 'notifications':
        return (
          <StudentNotificationsView
            {...commonProps}
            session={session}
            onRead={refreshUnread}
          />
        );
      case 'settings':
        return (
          <StudentSettingsView
            {...commonProps}
            session={session}
            isDark={isDark}
            setIsDark={setIsDark}
            currentWallpaper={currentWallpaper}
            setWallpaper={setCurrentWallpaper}
            onLogout={onLogout}
          />
        );
      default:
        return <StudentDashboardView {...commonProps} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div
      className={`flex h-screen w-full overflow-hidden font-sans relative transition-all duration-700 bg-cover bg-center animate-bg-pan ${
        currentWallpaper.textColor === 'dark' ? 'text-neutral-900' : 'text-white'
      }`}
      style={{ backgroundImage: `url(${currentWallpaper.url})`, backgroundSize: '120% 120%' }}
    >
      {/* Atmospheric overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: wallpaperOverlay }}
      />
      <div className="noise-bg" />

      {/* Sidebar — overlay on mobile/tablet, fixed on desktop */}
      <div className={`fixed inset-0 z-50 lg:relative lg:flex ${showSidebar ? 'flex' : 'hidden'}`}>
        <div
          className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
        <StudentSidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onLogout={onLogout}
          unreadCount={unreadCount}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 min-w-0">
        <StudentHeader
          student={student}
          creditBalance={creditBalance}
          unreadCount={unreadCount}
          onToggleSidebar={() => setShowSidebar(s => !s)}
          onOpenNotifications={() => handleNavigate('notifications')}
          onOpenSettings={() => handleNavigate('settings')}
          currentWallpaper={currentWallpaper}
          isDark={isDark}
          setIsDark={setIsDark}
          setWallpaper={setCurrentWallpaper}
        />

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
          {activeTab !== 'tutor' && <div className="h-6 md:h-12" />}
        </div>
      </main>
    </div>
  );
}
