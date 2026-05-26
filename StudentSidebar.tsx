'use client';

import { motion } from 'motion/react';
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Calendar,
  Bot,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface StudentSidebarProps {
  activeTab:   string;
  onNavigate:  (tab: string) => void;
  onLogout:    () => void;
  unreadCount: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'quizzes',      label: 'My Quizzes',     icon: ClipboardList   },
  { id: 'practice',     label: 'Self-Practice',  icon: Sparkles        },
  { id: 'material',     label: 'Study Material', icon: BookOpen        },
  { id: 'performance',  label: 'My Performance', icon: TrendingUp      },
  { id: 'doubts',       label: 'Doubt Box',      icon: MessageCircle   },
  { id: 'calendar',     label: 'Calendar',       icon: Calendar        },
  { id: 'tutor',        label: 'AI Tutor',       icon: Bot             },
];

export default function StudentSidebar({
  activeTab,
  onNavigate,
  onLogout,
  unreadCount,
}: StudentSidebarProps) {
  return (
    <aside className="relative z-10 flex h-full w-64 shrink-0 flex-col glass-card border-r border-white/10 backdrop-blur-2xl py-5 px-3 gap-1">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 pb-5 border-b border-white/10 mb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 leading-none">Student Portal</p>
          <p className="text-sm font-black tracking-tight text-white truncate">InspireRise</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(item => {
          const Icon    = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.25)]'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="student-sidebar-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70'}`} />
              <span className="truncate">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom — notifications + settings + logout */}
      <div className="flex flex-col gap-0.5 pt-3 border-t border-white/10">
        {/* Notifications */}
        <motion.button
          onClick={() => onNavigate('notifications')}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
            activeTab === 'notifications'
              ? 'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.25)]'
              : 'text-white/60 hover:bg-white/8 hover:text-white'
          }`}
        >
          {activeTab === 'notifications' && (
            <motion.div
              layoutId="student-sidebar-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-400"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Bell className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'notifications' ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70'}`} />
          <span className="flex-1 truncate">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-black text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          onClick={() => onNavigate('settings')}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
            activeTab === 'settings'
              ? 'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.25)]'
              : 'text-white/60 hover:bg-white/8 hover:text-white'
          }`}
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="student-sidebar-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-400"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Settings className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'settings' ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70'}`} />
          <span className="truncate">Settings</span>
        </motion.button>

        {/* Logout */}
        <motion.button
          onClick={onLogout}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/40 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors group-hover:text-red-400" />
          <span className="truncate">Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
