'use client';

import { motion } from 'motion/react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarDays, DollarSign, Zap, BarChart3,
  Settings, LogOut,
} from 'lucide-react';

interface Props {
  activeTab:  string;
  onNavigate: (tab: string) => void;
  adminName:  string;
  schoolName: string;
  onLogout:   () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'teachers',   label: 'Teachers',   icon: Users           },
  { id: 'students',   label: 'Students',   icon: GraduationCap   },
  { id: 'classes',    label: 'Classes',    icon: BookOpen        },
  { id: 'attendance', label: 'Attendance', icon: BarChart3       },
  { id: 'fees',       label: 'Fees',       icon: DollarSign      },
  { id: 'credits',    label: 'Credits',    icon: Zap             },
  { id: 'calendar',   label: 'Calendar',   icon: CalendarDays    },
  { id: 'settings',   label: 'Settings',   icon: Settings        },
];

export default function AdminSidebar({ activeTab, onNavigate, adminName, schoolName, onLogout }: Props) {
  const isActive = (id: string) => activeTab === id;

  return (
    <aside className="w-72 h-full bg-white/70 dark:bg-neutral-950/80 backdrop-blur-2xl border-r border-neutral-200 dark:border-white/5 flex flex-col p-8 z-10 transition-colors shadow-2xl lg:shadow-none">
      {/* Brand */}
      <div className="flex items-center gap-4 mb-12 px-2 shrink-0 group cursor-pointer">
        <div className="relative">
          <div className="absolute -inset-1 bg-primary-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition-all" />
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-2xl transition-transform bg-white dark:bg-neutral-900 flex items-center justify-center">
            <img src="/logos/blue-favicon.png" alt="InspireRise" className="w-9 h-9 object-contain dark:hidden" />
            <img src="/logos/white-favicon.png" alt="InspireRise" className="w-9 h-9 object-contain hidden dark:block" />
          </div>
        </div>
        <div>
          <span className="block font-black text-2xl tracking-tighter text-neutral-900 dark:text-white leading-none">InspireRise</span>
          <span className="block text-[10px] font-black tracking-[0.3em] text-primary-500 uppercase mt-1">Principal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-visible scrollbar-hide">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative overflow-visible ${
              isActive(id)
                ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {isActive(id) && (
              <motion.div
                layoutId="admin-active-pill"
                className="absolute inset-0 bg-neutral-900 dark:bg-primary-500 rounded-[1.25rem] translate-z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className={`w-5 h-5 transition-all duration-500 group-hover:scale-110 relative z-10 ${
              isActive(id) ? 'text-white' : 'text-neutral-400'
            }`} />
            <span className="font-black text-xs md:text-sm tracking-tight relative z-10 uppercase tracking-widest">{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer — user info + sign out */}
      <div className="mt-auto pt-8 border-t border-neutral-100 dark:border-white/5 shrink-0">
        <div className="px-5 py-3 mb-1">
          <p className="font-black text-sm text-neutral-900 dark:text-white truncate">{adminName}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mt-0.5">Principal · {schoolName}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all duration-500 group"
        >
          <div className="w-10 h-10 rounded-xl bg-error-50 dark:bg-error-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-black text-xs md:text-sm tracking-tight uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
