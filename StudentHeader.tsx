'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, Sun, Moon, Palette, GraduationCap, Zap } from 'lucide-react';
import { WALLPAPERS, WallpaperType } from './constants';
import type { StudentProfile } from './types';

interface StudentHeaderProps {
  student:             StudentProfile | null;
  creditBalance:       number;
  unreadCount:         number;
  onToggleSidebar:     () => void;
  onOpenNotifications: () => void;
  onOpenSettings:      () => void;
  currentWallpaper:    WallpaperType;
  isDark:              boolean;
  setIsDark:           (v: boolean) => void;
  setWallpaper:        (w: WallpaperType) => void;
}

export default function StudentHeader({
  student,
  creditBalance,
  unreadCount,
  onToggleSidebar,
  onOpenNotifications,
  onOpenSettings,
  currentWallpaper,
  isDark,
  setIsDark,
  setWallpaper,
}: StudentHeaderProps) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const firstName = student?.name?.split(' ')[0] ?? 'Student';

  const initials = student?.name
    ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  const creditCls =
    creditBalance <= 0  ? 'text-red-400' :
    creditBalance <= 10 ? 'text-amber-400' :
    'text-emerald-400';

  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 py-6 z-10 transition-colors">
      {/* Left — hamburger + greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-3 lg:hidden glass-panel bg-white/60 dark:bg-neutral-800/60 border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-md group active:scale-95"
        >
          <Menu className="w-6 h-6 text-neutral-900 dark:text-white group-hover:rotate-180 transition-transform" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">
            Greetings, {firstName}
          </h1>
          <p className="text-neutral-700 dark:text-neutral-200 text-[10px] md:text-sm font-bold mt-2 decoration-primary-500/30 underline underline-offset-4 decoration-2 opacity-95">
            Ready to learn something great today.
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-6">

        {/* Theme controls */}
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
                    onClick={() => setWallpaper(wp)}
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
            onClick={() => setIsDark(!isDark)}
            className="group relative flex items-center gap-3 glass-panel bg-white/40 dark:bg-neutral-800/40 border-neutral-200 dark:border-white/10 p-1.5 px-3 rounded-2xl hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-sm active:scale-95"
          >
            <div className={`w-12 h-6 rounded-full transition-all duration-500 relative flex items-center px-1 ${isDark ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-900'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-500 transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            {isDark ? <Moon className="w-4 h-4 text-neutral-900 dark:text-white" /> : <Sun className="w-4 h-4 text-neutral-900 dark:text-white" />}
          </button>
        </div>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => { setIsNoticeOpen(false); onOpenNotifications(); }}
            className="p-3 md:p-4 glass-panel bg-white/40 dark:bg-neutral-800/40 border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-all relative shadow-sm active:scale-95"
          >
            <Bell className="w-5 h-5 text-neutral-900 dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary-500 border-2 border-white dark:border-neutral-800 rounded-full animate-pulse shadow-lg" />
            )}
          </button>
        </div>

        {/* Student name + avatar */}
        <div className="flex items-center gap-3 md:gap-6 pl-4 md:pl-8 border-l border-neutral-300 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="font-black text-sm md:text-base text-neutral-900 dark:text-white leading-tight">
              {student?.name ?? 'Student'}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center justify-end gap-1">
              <Zap className={`w-3 h-3 ${creditCls}`} />
              <span className={creditCls}>{creditBalance} credits</span>
            </p>
          </div>
          <div className="relative group cursor-pointer" onClick={onOpenSettings}>
            <div className="absolute -inset-1 bg-primary-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all" />
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-4 border-white dark:border-neutral-800 bg-blue-500/20 flex items-center justify-center relative z-10 shadow-2xl">
              {student?.avatar ? (
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-base font-black text-blue-400">{initials}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
