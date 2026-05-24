import { TrendingUp, Users, Wallet, Target, Sparkles } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ClassInfo } from './types';

interface ClassOverviewProps {
  classData: ClassInfo | null;
  onSelectStudent?: (id: string) => void;
}

const trendData = [
  { month: 'Jan', performance: 72 },
  { month: 'Feb', performance: 75 },
  { month: 'Mar', performance: 81 },
  { month: 'Apr', performance: 78 },
  { month: 'May', performance: 84 },
  { month: 'Jun', performance: 81 },
];

export default function ClassOverview({ classData, onSelectStudent }: ClassOverviewProps) {
  if (!classData) return null;

  return (
    <div className="glass-card p-6 md:p-10 h-full bg-white/50 dark:bg-neutral-900/40 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-3 tracking-tighter">
            Performance Overview
            <span className="px-4 py-1.5 bg-primary-100 dark:bg-primary-500 text-primary-900 dark:text-white text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border-none shadow-sm">
              Grade {classData.name.split(' ')[1]} {classData.section}
            </span>
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-xs md:text-sm font-bold opacity-100">Real-time pedagogical engagement.</p>
        </div>
        <div className="flex -space-x-3 md:-space-x-4">
          {[1, 2, 3, 4].map(i => (
            <button 
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onSelectStudent?.(i.toString());
              }}
              className="relative group transition-all hover:scale-125 hover:z-30 cursor-pointer"
            >
              <img 
                src={`https://picsum.photos/seed/student${i}/200/200`} 
                alt="Student"
                referrerPolicy="no-referrer"
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl border-4 border-white dark:border-neutral-800 shadow-2xl object-cover"
              />
              <div className="absolute inset-0 bg-primary-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelectStudent?.(null); // Passing null means navigate to the list
            }} 
            className="w-10 h-10 md:w-14 md:h-14 rounded-2xl border-4 border-white dark:border-neutral-800 shadow-2xl bg-neutral-900 dark:bg-primary-600 flex items-center justify-center text-xs md:text-sm font-black text-white hover:bg-black dark:hover:bg-primary-400 transition-all cursor-pointer z-10 hover:scale-110"
          >
            +{classData.studentsCount - 4}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {/* Performance Chart */}
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-white/5 border border-white dark:border-white/5 shadow-inner col-span-1 min-h-[220px] md:min-h-[280px] flex flex-col justify-between group/chart transition-all relative">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg group-hover/chart:rotate-12 transition-transform">
                 <Target className="text-white w-5 h-5" />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase text-neutral-700 dark:text-neutral-300 tracking-[0.2em] opacity-100">Knowledge Curve</span>
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Monthly Performance Delta</p>
               </div>
             </div>
             <div className="text-right">
                <p className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white leading-none">{classData.performance}%</p>
                <p className="text-[10px] md:text-xs font-black text-success-600 dark:text-success-400 mt-1 uppercase tracking-widest opacity-80">Avg. +4.2%</p>
             </div>
          </div>
          <div className="h-32 md:h-40 w-full overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px -8px rgba(0,0,0,0.2)',
                    fontSize: '11px',
                    fontWeight: '900',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    padding: '12px 16px'
                  }} 
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#6366F1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPerf)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 col-span-1">
          <MetricCard 
            icon={Wallet} 
            label="Fees Status" 
            value="82%" 
            subValue="18% Pending"
            color="bg-warning-50/50 dark:bg-warning-500/10"
            iconColor="text-warning-600"
          />
          <MetricCard 
            icon={Users} 
            label="Daily Presence" 
            value="94%" 
            subValue="Institutional Norm"
            color="bg-success-50/50 dark:bg-success-500/10"
            iconColor="text-success-600"
          />
        </div>
      </div>

      <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-[2.5rem] glass-panel font-bold text-sm bg-primary-100/30 dark:bg-primary-500/10 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-dashed border-primary-200 dark:border-primary-500/20 group/insight overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-3xl opacity-0 group-hover/insight:opacity-40 transition-opacity" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover/insight:scale-110 transition-transform">
            <TrendingUp className="text-primary-500 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm md:text-base font-black text-neutral-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
               Gen AI Summary <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            </p>
            <p className="text-[10px] md:text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1 opacity-80">Scholars showed +15% incremental logic in Unit 4 Algebra modules.</p>
          </div>
        </div>
        <button className="w-full md:w-auto px-10 py-4 bg-primary-500 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-primary-400 transition-all active:scale-95 relative z-10">
          Audit Full Report
        </button>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, color, iconColor }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] ${color} border border-white dark:border-white/5 shadow-2xl relative overflow-hidden group hover:shadow-primary-500/10 transition-all cursor-default`}>
      <div className="relative z-10">
        <div className={`w-12 h-12 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
          <Icon className={`${iconColor} w-6 h-6`} />
        </div>
        <p className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] leading-none mb-1 opacity-60">{label}</p>
        <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-neutral-600 dark:text-neutral-500 mt-1 opacity-80">{subValue}</p>
      </div>
    </div>
  );
}

