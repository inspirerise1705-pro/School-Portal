'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import {
  mockTeacher,
  mockClasses,
  mockStudents
} from './mockData';
import { WALLPAPERS, WallpaperType } from './constants';

// Components & Views
import Sidebar from './Sidebar';
import Header from './Header';
import Login from './Login';
import LoadingScreen from './LoadingScreen';
import DashboardView from './DashboardView';
import StudentBreakdown from './StudentBreakdown';
import AcademicHubView from './AcademicHubView';
import QuizReportsView from './QuizReportsView';
import SettingsView from './SettingsView';
import TimelineView from './TimelineView';
import NotificationsPage from './NotificationsPage';
import TeacherDoubtView from './TeacherDoubtView';
import StudentApp from './StudentApp';
import AdminApp    from './AdminApp';

export default function App() {
  // Read cached session + role from localStorage so the app renders instantly on repeat loads
  const [session, setSession] = useState<Session | null>(() => {
    try { const s = localStorage.getItem('ir_session'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | 'admin' | null>(
    () => localStorage.getItem('ir_role') as 'teacher' | 'student' | 'admin' | null
  );
  const [roleLoading, setRoleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('teacher_tab') || 'dashboard');
  const [showStartupLoader, setShowStartupLoader] = useState(() => {
    // Skip the 3-second animation if we already loaded within the last 10 minutes
    const last = localStorage.getItem('app_loaded_at');
    return !last || Date.now() - parseInt(last) > 10 * 60 * 1000;
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Theme & Appearance
  const [isDark, setIsDark] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperType>(WALLPAPERS[0]);

  const wallpaperOverlay = isDark || currentWallpaper.textColor === 'light'
    ? 'linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.28) 32%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.75) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08) 32%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.18) 100%)';

  // Real Supabase auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) localStorage.setItem('ir_session', JSON.stringify(session));
      else { localStorage.removeItem('ir_session'); localStorage.removeItem('ir_role'); }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) localStorage.setItem('ir_session', JSON.stringify(session));
      else { localStorage.removeItem('ir_session'); localStorage.removeItem('ir_role'); setUserRole(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Role detection — runs whenever session changes
  useEffect(() => {
    if (!session) { setUserRole(null); return; }
    setRoleLoading(true);
    (async () => {
      // Check teachers table (admin or teacher — id = auth.uid)
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (teacher) {
        const role = (teacher as any).role === 'admin' ? 'admin' : 'teacher';
        setUserRole(role);
        localStorage.setItem('ir_role', role);
        setRoleLoading(false);
        return;
      }

      // Check students table (user_id = auth.uid for students)
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (student) { setUserRole('student'); localStorage.setItem('ir_role', 'student'); setRoleLoading(false); return; }

      // Auto-link: student signed up with an email that matches a pre-created student record
      const { data: pendingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', session.user.email ?? '')
        .is('user_id', null)
        .maybeSingle();
      if (pendingStudent) {
        await supabase.from('students').update({ user_id: session.user.id }).eq('id', (pendingStudent as any).id);
        setUserRole('student'); localStorage.setItem('ir_role', 'student'); setRoleLoading(false); return;
      }

      // No role found — sign out gracefully
      await supabase.auth.signOut();
      setUserRole(null);
      setRoleLoading(false);
    })();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    localStorage.removeItem('ir_session');
    localStorage.removeItem('ir_role');
  };

  // Persistence for theme
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const handleSelectStudent = (studentId: string | null) => {
    setSelectedStudentId(studentId);
    setActiveTab('students');
    setShowSidebar(false);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('teacher_tab', tab);
    setShowSidebar(false);
  };

  if (showStartupLoader) {
    return (
      <LoadingScreen onComplete={() => {
        localStorage.setItem('app_loaded_at', Date.now().toString());
        setShowStartupLoader(false);
      }} />
    );
  }

  // Only block rendering if we have no cached session/role to work with yet
  if ((authLoading || roleLoading) && !session && !userRole) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030718]">
        <div className="h-8 w-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session || !userRole) {
    return <Login onLogin={() => {}} />;
  }

  // Admin/Principal — their own portal
  if (userRole === 'admin') {
    return <AdminApp session={session} onLogout={handleLogout} />;
  }

  // Students get their own completely separate app
  if (userRole === 'student') {
    return <StudentApp session={session} onLogout={handleLogout} />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onNavigate={handleNavigate} 
            classes={mockClasses} 
            onSelectStudent={handleSelectStudent}
          />
        );
      case 'students':
        return (
          <div className="px-4 md:px-8 py-4 md:py-6 h-full">
            <StudentBreakdown 
              students={mockStudents} 
              initialSelectedId={selectedStudentId}
              onClearSelection={() => setSelectedStudentId(null)}
            />
          </div>
        );
      case 'academic':
        return <AcademicHubView teacher={mockTeacher} classes={mockClasses} />;
      case 'reports':
        return <QuizReportsView students={mockStudents} />;
      case 'calendar':
        return <TimelineView classes={mockClasses} />;
      case 'settings':
        return (
          <SettingsView 
            teacher={mockTeacher} 
            onLogout={handleLogout}
            isDark={isDark}
            setIsDark={setIsDark}
            currentWallpaper={currentWallpaper}
            setWallpaper={setCurrentWallpaper}
          />
        );
      case 'doubts':
        return <TeacherDoubtView />;
      case 'notifications':
        return <NotificationsPage onBack={() => handleNavigate('dashboard')} />;
      default:
        return <DashboardView onNavigate={handleNavigate} classes={mockClasses} onSelectStudent={handleSelectStudent} />;
    }
  };

  return (
    <div 
      className={`flex h-screen w-full overflow-hidden font-sans relative transition-all duration-700 bg-cover bg-center animate-bg-pan ${currentWallpaper.textColor === 'dark' ? 'text-neutral-900' : 'text-white'}`}
      style={{ backgroundImage: `url(${currentWallpaper.url})`, backgroundSize: '120% 120%' }}
    >
      {/* Dynamic Atmospheric Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: wallpaperOverlay,
        }}
      />
      
      <div className="noise-bg" />
      
      <div className={`fixed inset-0 z-50 lg:relative lg:flex ${showSidebar ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm lg:hidden" onClick={() => setShowSidebar(false)} />
        <Sidebar activeTab={activeTab} setActiveTab={handleNavigate} onLogout={handleLogout} />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <Header 
          teacher={mockTeacher} 
          onToggleSidebar={() => setShowSidebar(!showSidebar)} 
          onOpenNotifications={() => handleNavigate('notifications')}
          isDark={isDark}
          setIsDark={setIsDark}
          currentWallpaper={currentWallpaper}
          setWallpaper={setCurrentWallpaper}
        />

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
          <div className="h-4 md:h-12" />
        </div>
      </main>
    </div>
  );
}
