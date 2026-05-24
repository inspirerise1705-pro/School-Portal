import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, Sun, Moon, Palette, School as SchoolIcon } from 'lucide-react';
import { Teacher } from './types';
import { WALLPAPERS, WallpaperType } from './constants';

interface HeaderProps {
  teacher: Teacher;
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  currentWallpaper: WallpaperType;
  setWallpaper: (wp: WallpaperType) => void;
}

export default function Header({ 
  teacher, 
  onToggleSidebar, 
  onOpenNotifications,
  isDark, 
  setIsDark, 
  currentWallpaper, 
  setWallpaper 
}: HeaderProps) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const notifications = [
    { id: 1, title: 'Term Assessment Rules Updated', subtitle: 'New grading policy has been applied to Class 8A.', time: '2h ago', color: 'text-error-500' },
    { id: 2, title: 'Social Science Quiz Results', subtitle: '6A has 92% submission rate today.', time: '5h ago', color: 'text-primary-500' },
    { id: 3, title: 'Meeting Invitation', subtitle: 'Board delegate review scheduled for 11:00 AM.', time: '1d ago', color: 'text-neutral-500' }
  ];

  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 py-6 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-3 lg:hidden glass-panel bg-white/60 dark:bg-neutral-800/60 border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-md group active:scale-95"
        >
          <Menu className="w-6 h-6 text-neutral-900 dark:text-white group-hover:rotate-180 transition-transform" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">Greetings, {teacher.name.split(' ')[1]}</h1>
          <p className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-sm font-bold mt-2 decoration-primary-500/30 underline underline-offset-4 decoration-2 opacity-95">Monitoring institutional data.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* Theme Controls Layer */}
        <div className="items-center gap-3 hidden sm:flex mr-4 pr-6 border-r border-neutral-300 dark:border-white/10">
          {/* Wallpaper Selection Toggle */}
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
                      onClick={() => setWallpaper(wp)}
                      className={`relative h-20 rounded-2xl overflow-hidden group/item transition-all ${currentWallpaper.id === wp.id ? 'ring-2 ring-primary-500 scale-95 shadow-xl' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
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

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="group relative flex items-center gap-3 glass-panel bg-white/40 dark:bg-neutral-800/40 border-neutral-200 dark:border-white/10 p-1.5 px-3 rounded-2xl hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-sm active:scale-95"
          >
            <div className={`w-12 h-6 rounded-full transition-all duration-500 relative flex items-center px-1 ${isDark ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-900'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-500 transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            {isDark ? <Moon className="w-4 h-4 text-neutral-900 dark:text-white" /> : <Sun className="w-4 h-4 text-neutral-900 dark:text-white" />}
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (onOpenNotifications) {
                setIsNoticeOpen(false);
                onOpenNotifications();
                return;
              }
              setIsNoticeOpen((open) => !open);
            }}
            className="p-3 md:p-4 glass-panel bg-white/40 dark:bg-neutral-800/40 border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-all relative shadow-sm active:scale-95"
          >
            <Bell className="w-5 h-5 text-neutral-900 dark:text-white transition-transform" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary-500 border-2 border-white dark:border-neutral-800 rounded-full animate-pulse shadow-lg" />
          </button>
          <AnimatePresence>
            {isNoticeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-neutral-200 dark:border-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Notifications</p>
                      <p className="text-sm font-black text-neutral-900 dark:text-white">Recent updates</p>
                    </div>
                    <button type="button" onClick={() => setIsNoticeOpen(false)} className="text-sm font-black text-neutral-500 hover:text-neutral-900 dark:text-neutral-300">Close</button>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="rounded-3xl p-3 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                      <p className={`text-xs font-black uppercase tracking-[0.3em] ${notif.color}`}>{notif.time}</p>
                      <p className="mt-2 text-sm font-black text-neutral-900 dark:text-white">{notif.title}</p>
                      <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">{notif.subtitle}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 md:gap-6 pl-4 md:pl-8 border-l border-neutral-300 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="font-black text-sm md:text-base text-neutral-900 dark:text-white leading-tight">{teacher.name}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mt-1">{teacher.role}</p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all" />
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-4 border-white dark:border-neutral-800 bg-white/10 dark:bg-neutral-900/70 flex items-center justify-center relative z-10 text-primary-500 shadow-2xl">
              <SchoolIcon className="h-7 w-7 text-primary-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
