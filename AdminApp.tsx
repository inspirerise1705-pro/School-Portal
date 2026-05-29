'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { WALLPAPERS, WallpaperType } from './constants';
import { Menu, Palette, Sun, Moon } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

import AdminDashboardView  from './admin/AdminDashboardView';
import AdminTeachersView   from './admin/AdminTeachersView';
import AdminStudentsView   from './admin/AdminStudentsView';
import AdminClassesView    from './admin/AdminClassesView';
import AdminAttendanceView from './admin/AdminAttendanceView';
import AdminFeesView       from './admin/AdminFeesView';
import AdminCreditsView    from './admin/AdminCreditsView';
import AdminCalendarView   from './admin/AdminCalendarView';
import AdminSettingsView   from './admin/AdminSettingsView';

interface Props {
  session:  Session;
  onLogout: () => void;
}

export interface AdminCtx {
  schoolId: string;
  adminId:  string;
  session:  Session;
}

export default function AdminApp({ session, onLogout }: Props) {
  const [activeTab,   setActiveTab]   = useState(() => localStorage.getItem('admin_tab') || 'dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [schoolId,    setSchoolId]    = useState<string | null>(null);
  const [schoolName,  setSchoolName]  = useState('School');
  const [adminName,   setAdminName]   = useState('Admin');
  const [loading,     setLoading]     = useState(true);

  const [isDark,           setIsDark]           = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperType>(WALLPAPERS[0]);

  const wallpaperOverlay = isDark || currentWallpaper.textColor === 'light'
    ? 'linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.28) 32%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.75) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08) 32%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.18) 100%)';

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('teachers')
        .select('name, school_id, schools(name)')
        .eq('id', session.user.id)
        .maybeSingle();
      if (data) {
        setSchoolId((data as any).school_id);
        setAdminName((data as any).name ?? 'Admin');
        setSchoolName((data as any).schools?.name ?? 'School');
      }
      setLoading(false);
    })();
  }, [session.user.id]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('admin_tab', tab);
    setShowSidebar(false);
  };

  if (loading || !schoolId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <p className="text-white/60 text-sm font-semibold tracking-widest uppercase">Loading portal…</p>
        </div>
      </div>
    );
  }

  const ctx: AdminCtx = { schoolId, adminId: session.user.id, session };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':  return <AdminDashboardView  {...ctx} />;
      case 'teachers':   return <AdminTeachersView   {...ctx} />;
      case 'students':   return <AdminStudentsView   {...ctx} />;
      case 'classes':    return <AdminClassesView    {...ctx} />;
      case 'attendance': return <AdminAttendanceView {...ctx} />;
      case 'fees':       return <AdminFeesView       {...ctx} />;
      case 'credits':    return <AdminCreditsView    {...ctx} />;
      case 'calendar':   return <AdminCalendarView   {...ctx} />;
      case 'settings':   return <AdminSettingsView   {...ctx} adminName={adminName} schoolName={schoolName} onLogout={onLogout} />;
      default:           return <AdminDashboardView  {...ctx} />;
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
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: wallpaperOverlay }} />
      <div className="noise-bg" />

      {/* Sidebar — overlay on mobile, fixed on desktop */}
      <div className={`fixed inset-0 z-50 lg:relative lg:flex ${showSidebar ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm lg:hidden" onClick={() => setShowSidebar(false)} />
        <AdminSidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          adminName={adminName}
          schoolName={schoolName}
          onLogout={onLogout}
        />
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 min-w-0">

        {/* Header — identical design to teacher/student portals */}
        <header className="w-full flex items-center justify-between px-4 md:px-8 py-6 z-10 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(s => !s)}
              className="p-3 lg:hidden glass-panel bg-white/60 dark:bg-neutral-800/60 border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-md group active:scale-95"
            >
              <Menu className="w-6 h-6 text-neutral-900 dark:text-white group-hover:rotate-180 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">
                Welcome, {adminName.replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s+/i, '').split(' ')[0]}
              </h1>
              <p className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-sm font-bold mt-2 decoration-primary-500/30 underline underline-offset-4 decoration-2 opacity-95">
                {schoolName} · Principal Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="items-center gap-3 hidden sm:flex mr-4 pr-6 border-r border-neutral-300 dark:border-white/10">
              {/* Wallpaper picker */}
              <div className="relative group/wp">
                <button className="p-3 glass-panel bg-white/40 dark:bg-neutral-800/40 border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-sm active:scale-95 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-neutral-900 dark:text-white" />
                </button>
                <div className="absolute right-0 top-full mt-4 w-72 p-4 glass-card bg-white/90 dark:bg-neutral-900/90 shadow-2xl opacity-0 translate-y-4 invisible group-hover/wp:opacity-100 group-hover/wp:translate-y-0 group-hover/wp:visible transition-all duration-300 z-50 border border-white/20">
                  <p className="text-[10px] font-black uppercase text-neutral-400 mb-3 tracking-widest px-2">Select Atmosphere</p>
                  <div className="grid grid-cols-2 gap-3">
                    {WALLPAPERS.map(wp => (
                      <button
                        key={wp.id}
                        onClick={() => setCurrentWallpaper(wp)}
                        className={`relative h-20 rounded-2xl overflow-hidden transition-all ${
                          currentWallpaper.id === wp.id
                            ? 'ring-2 ring-primary-500 scale-95 shadow-xl'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-md">
                          <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{wp.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(d => !d)}
                className="group relative flex items-center gap-3 glass-panel bg-white/40 dark:bg-neutral-800/40 border-neutral-200 dark:border-white/10 p-1.5 px-3 rounded-2xl hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-sm active:scale-95"
              >
                <div className={`w-12 h-6 rounded-full transition-all duration-500 relative flex items-center px-1 ${isDark ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-900'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-500 transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                {isDark ? <Moon className="w-4 h-4 text-neutral-900 dark:text-white" /> : <Sun className="w-4 h-4 text-neutral-900 dark:text-white" />}
              </button>
            </div>

            {/* Admin avatar */}
            <div className="flex items-center gap-3 md:gap-6 pl-4 md:pl-8 border-l border-neutral-300 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="font-black text-sm md:text-base text-neutral-900 dark:text-white leading-tight">{adminName}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mt-1">Principal</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-4 border-white dark:border-neutral-800 bg-blue-500/20 flex items-center justify-center shadow-2xl">
                <span className="text-base font-black text-blue-400">{adminName?.[0]?.toUpperCase() ?? 'P'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
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
