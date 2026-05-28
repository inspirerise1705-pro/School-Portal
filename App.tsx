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

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('teacher_tab') || 'dashboard');
  const [showStartupLoader, setShowStartupLoader] = useState(true);
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
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setUserRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Role detection — runs whenever session changes
  useEffect(() => {
    if (!session) { setUserRole(null); return; }
    setRoleLoading(true);
    (async () => {
      // Check teacher table first (id = auth.uid for teachers)
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (teacher) { setUserRole('teacher'); setRoleLoading(false); return; }

      // Check students table (user_id = auth.uid for students)
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (student) { setUserRole('student'); setRoleLoading(false); return; }

      // Neither role found — sign out gracefully
      await supabase.auth.signOut();
      setUserRole(null);
      setRoleLoading(false);
    })();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
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

  if (showStartupLoader || authLoading || roleLoading) {
    return <LoadingScreen onComplete={() => setShowStartupLoader(false)} />;
  }

  if (!session || !userRole) {
    return <Login onLogin={() => {}} />;
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
