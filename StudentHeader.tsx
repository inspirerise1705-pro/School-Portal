'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Menu, Bell, Zap, Sun, Moon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { StudentProfile, WallpaperType } from './types';
import { WALLPAPERS } from './constants';

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

// Credit badge colour based on balance
function creditColor(balance: number) {
  if (balance <= 0)  return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (balance <= 10) return 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse';
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
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
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);

  const initials = student?.name
    ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <header className="relative z-20 flex h-14 sm:h-16 items-center gap-3 px-3 sm:px-5 border-b border-white/10 backdrop-blur-xl bg-black/10 shrink-0">
      {/* Hamburger — visible on mobile/tablet */}
      <button
        onClick={onToggleSidebar}
        className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition shrink-0"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page breadcrumb / logo (mobile) */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-white/50">InspireRise</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Credit balance badge */}
        <motion.button
          onClick={onOpenSettings}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-black transition ${creditColor(creditBalance)}`}
          title="AI Credits"
        >
          <Zap className="h-3 w-3" />
          <span className="hidden xs:inline">{creditBalance}</span>
          <span className="hidden sm:inline text-[10px] opacity-60">credits</span>
        </motion.button>

        {/* Dark mode toggle */}
        <motion.button
          onClick={() => setIsDark(!isDark)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>

        {/* Wallpaper picker */}
        <div className="relative">
          <motion.button
            onClick={() => setShowWallpaperPicker(v => !v)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition"
            title="Change wallpaper"
            style={{ background: currentWallpaper.gradient }}
          />
          <AnimatePresence>
            {showWallpaperPicker && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 glass-card rounded-2xl border border-white/10 p-3 shadow-2xl backdrop-blur-2xl w-56"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2 px-1">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {WALLPAPERS.map(wp => (
                    <button
                      key={wp.id}
                      onClick={() => { setWallpaper(wp); setShowWallpaperPicker(false); }}
                      title={wp.name}
                      className={`h-10 w-full rounded-xl border-2 transition ${
                        currentWallpaper.id === wp.id ? 'border-blue-400 scale-105' : 'border-transparent hover:border-white/30'
                      }`}
                      style={{ background: wp.gradient }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <motion.button
          onClick={onOpenNotifications}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-black text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Avatar */}
        <motion.button
          onClick={onOpenSettings}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/30 border border-blue-400/30 text-blue-200 font-black text-xs hover:bg-blue-500/40 transition overflow-hidden"
          title="Profile & Settings"
        >
          {student?.avatar ? (
            <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </motion.button>
      </div>

      {/* Click-outside to close wallpaper picker */}
      {showWallpaperPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowWallpaperPicker(false)}
        />
      )}
    </header>
  );
}
