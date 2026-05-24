import { motion } from 'motion/react';
import { 
  PlusCircle, 
  ArrowUpRight, 
  Users, 
  Search, 
  Calendar, 
  BookOpen, 
  Clock, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { ClassInfo } from './types';
import ClassOverview from './ClassOverview';
import NotificationsTile from './NotificationsTile';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  classes: ClassInfo[];
  onSelectStudent?: (id: string) => void;
}

export default function DashboardView({ onNavigate, classes, onSelectStudent }: DashboardViewProps) {
  const classTeacherClass = classes.find(c => c.isClassTeacher) || null;

  const quickLinks = [
    { label: 'Manage students', icon: Users, tab: 'students', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' },
    { label: 'Assignments', icon: Sparkles, tab: 'academic', color: 'bg-success-50 dark:bg-success-500/10 text-success-500' },
    { label: 'Class Schedule', icon: Calendar, tab: 'calendar', color: 'bg-primary-50 dark:bg-primary-500/10 text-primary-500' },
    { label: 'Student Awards', icon: Award, tab: 'dashboard', color: 'bg-warning-50 dark:bg-warning-500/10 text-warning-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 scrollbar-hide">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* Left Column: Analytics */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-10">
          <div className="min-h-[300px] md:min-h-[450px] transform hover:scale-[1.01] transition-transform duration-700">
            <ClassOverview classData={classTeacherClass} onSelectStudent={onSelectStudent} />
          </div>
          
          {/* Quick Links Bento Block */}
          <div className="glass-card p-8 md:p-12 bg-white/40 dark:bg-neutral-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
            
            <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
               <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">Task Shortcut</h2>
                  <p className="text-neutral-700 dark:text-neutral-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Manage your daily work.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {quickLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(link.tab)}
                  className="flex flex-col items-center justify-center p-6 md:p-8 glass-panel border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-neutral-800 transition-all transform hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] group"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] ${link.color} mb-4 md:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <link.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tighter text-center">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Priority Info */}
        <div className="lg:col-span-4 flex flex-col gap-6 md:gap-10">
          <div className="transform hover:scale-[1.02] transition-transform duration-500">
            <NotificationsTile onExpand={() => onNavigate('notifications')} />
          </div>
          
          {/* Active Classes Card */}
          <div className="glass-card p-8 md:p-10 bg-primary-100/20 dark:bg-primary-500/10 border-primary-200/50 dark:border-primary-500/20 flex-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 blur-[80px] -mr-24 -mt-24 rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">Class Attendance</h2>
              <div className="p-2 bg-primary-500/10 rounded-xl">
                 <BookOpen className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-4 relative z-10">
              {classes.map(c => (
                <div key={c.id} className="p-4 md:p-5 glass-panel bg-white/70 dark:bg-white/5 border-none flex items-center justify-between group/item hover:bg-white dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center font-black text-xs md:text-sm text-primary-500 shadow-inner group-item-hover:scale-110 transition-transform">
                      {c.name.split(' ')[1]}
                    </div>
                    <div>
                      <p className="font-black text-sm md:text-base text-neutral-900 dark:text-white tracking-tight">Section {c.section}</p>
                      <p className="text-[9px] font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest leading-none mt-1">{c.studentsCount} Students</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm md:text-lg font-black text-neutral-900 dark:text-white leading-none">{c.performance}%</p>
                    <div className="flex items-center gap-1.5 mt-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                       <p className="text-[8px] font-black uppercase text-success-600 dark:text-success-400 tracking-widest">Sync</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('academic')}
              className="w-full mt-10 py-6 bg-neutral-900 dark:bg-primary-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transform transition-all active:scale-95 flex items-center justify-center gap-3 group rounded-[1.75rem] relative z-10"
            >
              Academic Hub <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

