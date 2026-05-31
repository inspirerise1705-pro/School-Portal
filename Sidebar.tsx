import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'students',  icon: Users,           label: 'Students'   },
  { id: 'academic',  icon: BookOpen,         label: 'Academics'  },
  { id: 'reports',   icon: ClipboardCheck,   label: 'Quiz Reports' },
  { id: 'doubts',    icon: MessageSquare,    label: 'Doubts'     },
  { id: 'calendar',  icon: Calendar,         label: 'Calendar'   },
  { id: 'settings',  icon: Settings,         label: 'Settings'   },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  return (
     <aside className="w-72 h-full bg-white/70 dark:bg-neutral-950/80 backdrop-blur-2xl border-r border-neutral-200 dark:border-white/5 flex flex-col p-8 z-10 transition-colors shadow-2xl lg:shadow-none">
      <div className="flex items-center gap-4 mb-12 px-2 shrink-0 group cursor-pointer">
        <div className="relative">
          <div className="absolute -inset-1 bg-primary-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition-all" />
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl transition-transform bg-white dark:bg-neutral-900 flex items-center justify-center">
            <img src="/logos/blue-favicon.png" alt="InspireRise" className="w-11 h-11 object-contain dark:hidden" />
            <img src="/logos/white-favicon.png" alt="InspireRise" className="w-11 h-11 object-contain hidden dark:block" />
          </div>
        </div>
        <div>
           <span className="block font-black text-2xl tracking-tighter text-neutral-900 dark:text-white leading-none">InspireRise</span>
           <span className="block text-[10px] font-black tracking-[0.3em] text-primary-500 uppercase mt-1">Institutional</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-visible scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative overflow-visible ${
              activeTab === item.id 
                ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-neutral-900 dark:bg-primary-500 rounded-[1.25rem] translate-z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <item.icon className={`w-5 h-5 transition-all duration-500 group-hover:scale-110 relative z-10 ${
              activeTab === item.id ? 'text-white' : 'text-neutral-400'
            }`} />
            <span className="font-black text-xs md:text-sm tracking-tight relative z-10 uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-neutral-100 dark:border-white/5 shrink-0">
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

