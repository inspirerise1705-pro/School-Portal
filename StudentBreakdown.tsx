import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  DollarSign, 
  Award,
  Book,
  ArrowLeft,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Target,
  Zap,
  Search,
  Users
} from 'lucide-react';
import { Student } from './types';
import { mockQuizSubmissions } from './mockData';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface StudentBreakdownProps {
  students: Student[];
  initialSelectedId: string | null;
  onClearSelection: () => void;
}

export default function StudentBreakdown({ students, initialSelectedId, onClearSelection }: StudentBreakdownProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialSelectedId);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedStudentId(initialSelectedId);
  }, [initialSelectedId]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  const handleBack = () => {
    setSelectedStudentId(null);
    onClearSelection();
  };

  if (selectedStudent) {
    return <StudentAnalytics student={selectedStudent} onBack={handleBack} />;
  }

  return (
    <div className="glass-card p-4 md:p-10 h-full bg-white/50 dark:bg-neutral-900/40 animate-in fade-in zoom-in-95 duration-700 overflow-y-auto custom-scrollbar relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-14 gap-6 px-2 relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">Scholars Roster</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-lg font-semibold opacity-80 mt-2">Institutional academic directory and progress telemetry.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search scholars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-13 pr-6 py-4 glass-panel bg-white/70 dark:bg-neutral-900/70 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all border-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-sm"
              />
           </div>
           <div className="p-1 bg-white/50 dark:bg-neutral-800/50 rounded-2xl flex items-center md:hidden">
              <button className="p-3 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl active:scale-95 transition-all">
                <Search className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-2 relative z-10 pb-20">
        {filteredStudents.map((student) => {
          const feesColor = student.feesStatus === 'Paid' 
            ? 'bg-success-500' 
            : student.feesStatus === 'Pending' 
            ? 'bg-warning-500' 
            : 'bg-error-500';

          return (
            <button 
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className="group flex flex-col p-6 glass-panel bg-white/40 dark:bg-white/5 border-none hover:bg-white dark:hover:bg-neutral-800 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] text-left relative overflow-hidden h-fit"
            >
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 bg-primary-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all" />
                  <img 
                    src={student.avatar} 
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover shadow-2xl border-4 border-white dark:border-neutral-800 relative z-10"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${feesColor} border-4 border-white dark:border-neutral-800 rounded-full flex items-center justify-center z-20 shadow-lg`}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="min-w-0 pr-4">
                  <p className="font-black text-neutral-900 dark:text-white text-lg tracking-tighter leading-none transition-colors uppercase">{student.name}</p>
                  <p className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 mt-1 tracking-widest opacity-90 leading-none">ID-{student.id.padStart(4, '0')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="p-4 bg-neutral-50/50 dark:bg-white/5 rounded-2xl flex flex-col gap-1 border border-white dark:border-white/5 shadow-inner">
                    <span className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-widest leading-none">Flux</span>
                    <span className="text-sm font-black text-neutral-900 dark:text-white tracking-tighter">{student.attendance}%</span>
                 </div>
                 <div className="p-4 bg-neutral-50/50 dark:bg-white/5 rounded-2xl flex flex-col gap-1 border border-white dark:border-white/5 shadow-inner">
                    <span className="text-[8px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-widest leading-none text-right">Dues</span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter text-right ${
                      student.feesStatus === 'Paid' ? 'text-success-600 dark:text-success-400' : 
                      student.feesStatus === 'Pending' ? 'text-warning-600 dark:text-warning-400' : 
                      'text-error-600 dark:text-error-400'
                    }`}>
                      {student.feesStatus}
                    </span>
                 </div>
              </div>

              <div className="mt-8 flex justify-between items-center relative z-10">
                 <div className="flex gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                 </div>
                 <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-primary-500 flex items-center justify-center text-white scale-90 group-hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary-500/10">
                    <Zap className="w-4 h-4" />
                 </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StudentAnalytics({ student, onBack }: { student: Student; onBack: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'quizzes'>('overview');
  const chartData = student.performance.map((val, idx) => ({
    round: `T${idx + 1}`,
    score: val,
    avg: 72
  }));

  const studentSubmissions = mockQuizSubmissions.filter(s => s.studentId === student.id);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-700 h-full overflow-y-auto px-4 md:px-0 pr-1 md:pr-4 custom-scrollbar pb-24">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sticky top-0 md:top-2 z-20 bg-white/20 dark:bg-white/5 backdrop-blur-3xl p-6 mb-12 border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-2xl mx-1">
         <button 
           onClick={onBack}
           className="flex items-center gap-4 px-8 py-4 bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-black dark:hover:bg-neutral-700 transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl w-full sm:w-auto group active:scale-95"
         >
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Scholar Ledger
         </button>
         <div className="flex gap-2 bg-white/60 dark:bg-neutral-800/60 p-2 rounded-[1.75rem] border border-neutral-200 dark:border-white/10 w-full sm:w-auto shadow-inner">
            <button 
               onClick={() => setActiveSubTab('overview')}
               className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeSubTab === 'overview' ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-2xl scale-[1.05]' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'}`}
            >
               Academic Flux
            </button>
            <button 
               onClick={() => setActiveSubTab('quizzes')}
               className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeSubTab === 'quizzes' ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-2xl scale-[1.05]' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'}`}
            >
               Task Audit
            </button>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12"
          >
            {/* Profile Header Block */}
            <div className="lg:col-span-12 glass-card p-10 md:p-14 bg-white/70 dark:bg-neutral-900/60 overflow-hidden relative border-none shadow-2xl group/analytics">
              <div className="absolute top-0 right-0 w-96 h-96 primary-gradient blur-[120px] opacity-20 -mr-48 -mt-48 rounded-full animate-pulse" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-primary-500 blur-2xl opacity-0 group-hover:opacity-40 transition-all rounded-[3.5rem]" />
                  <img 
                    src={student.avatar} 
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] md:rounded-[4rem] object-cover shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-8 border-white dark:border-neutral-800 relative z-10 transition-transform group-hover:rotate-3 group-hover:scale-105 duration-700"
                  />
                </div>
                <div className="text-center md:text-left flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                    <h1 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-normal uppercase leading-tight">{student.name}</h1>
                    <div className="flex gap-3 justify-center">
                      <span className="px-5 py-2 bg-success-500 text-white text-[10px] font-black rounded-[1.25rem] uppercase tracking-[0.2em] shadow-lg shadow-success-500/20">Merit Ledger</span>
                      <span className="px-5 py-2 bg-primary-500 text-white text-[10px] font-black rounded-[1.25rem] uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">Unit Lead</span>
                    </div>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-neutral-500 dark:text-neutral-400 max-w-3xl leading-relaxed opacity-80 decoration-primary-500/30 underline decoration-2 underline-offset-8">
                    "Institutional progress telemetry suggests strong cognitive resonance in Unit 4 modules. Current score delta maintains a steady {student.performance[5] - student.performance[0]}% sessional increment."
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12 md:mt-16">
                    <Stat icon={Activity} label="Session Presence" value={`${student.attendance}%`} />
                    <Stat icon={Award} label="Academic Grade" value={student.grade} />
                    <Stat icon={Users} label="Cohort Position" value={`#04`} />
                    <Stat icon={Zap} label="Pedagogy Credits" value="1.2k" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Deep Dive */}
            <div className="lg:col-span-8 space-y-10">
              <div className="glass-card p-10 md:p-14 bg-white/60 dark:bg-neutral-900/60 min-h-[400px] md:min-h-[500px] shadow-2xl border-none">
                <div className="flex items-center justify-between mb-12 md:mb-16">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter flex items-center gap-4">
                       <Target className="w-8 h-8 text-primary-500" /> Subject Resonance Flux
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 ml-12">Cognitive delta tracking over sessional phases.</p>
                  </div>
                </div>
                
                <div className="h-[300px] md:h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E2E8F0" opacity={0.05} />
                      <XAxis 
                        dataKey="round" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} 
                      />
                      <ReTooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)', 
                          fontSize: '11px', 
                          fontWeight: 900,
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          color: '#fff',
                          padding: '16px 24px'
                        }} 
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#6366F1" 
                        strokeWidth={6} 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        animationDuration={2500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avg" 
                        stroke="#94A3B8" 
                        strokeDasharray="8 8" 
                        strokeWidth={3} 
                        dot={false}
                        opacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-12">
                <CapabilityBlock title="Cognitive Strengths" data={[
                   { label: "Logic Matrix", val: 92 },
                   { label: "Linguistic Flux", val: 95 }
                ]} color="bg-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" bgColor="bg-primary-100/30 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20" />
                
                <CapabilityBlock title="Refinement Vectors" data={[
                   { label: "Temporal Precision", val: 65 },
                   { label: "Module Sync", val: 72 }
                ]} color="bg-warning-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" bgColor="bg-warning-100/30 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20" />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8 md:y-12">
               <div className="glass-card p-10 md:p-12 bg-white/70 dark:bg-neutral-900/60 transition-all border-none shadow-2xl relative overflow-hidden group/dues">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-warning-500/5 blur-[80px] -mr-24 -mt-24 rounded-full pointer-events-none transition-all group-hover/dues:bg-primary-500/10" />
                  
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">Sessional Dues</h3>
                    <div className="w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center shadow-xl group-hover/dues:rotate-12 transition-transform duration-500">
                       <DollarSign className="w-7 h-7 text-neutral-400 group-hover/dues:text-primary-500" />
                    </div>
                  </div>
                  
                  <div className={`p-10 rounded-[2.5rem] flex flex-col items-center gap-2 mb-10 border-2 transition-all group-hover/dues:scale-105 ${
                    student.feesStatus === 'Paid' ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20 text-success-700 dark:text-success-400 shadow-xl shadow-success-500/5' : 'bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-500/20 text-error-700 dark:text-error-400 shadow-xl shadow-error-500/5'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Vault Sync</span>
                    <span className="text-6xl font-black tracking-tighter uppercase">{student.feesStatus}</span>
                  </div>
                  
                  <button className="w-full py-6 bg-neutral-900 dark:bg-primary-500 text-white rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transform transition-all active:scale-95">
                    Stream Reminder Ledger
                   </button>
               </div>

               <div className="glass-card p-10 md:p-14 bg-neutral-900 dark:bg-primary-600 text-white relative overflow-hidden border-none shadow-[0_64px_128px_-16px_rgba(0,0,0,0.4)] md:-rotate-1 hover:rotate-0 transition-transform duration-1000">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white blur-[100px] opacity-10 -mr-32 -mt-32 rounded-full pointer-events-none" />
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10 tracking-tighter">
                    <GraduationCap className="w-8 h-8 text-primary-400 dark:text-white/60" /> Pedagogical Log
                  </h3>
                  <div className="relative z-10 space-y-10">
                     <p className="text-xl font-bold leading-relaxed opacity-90 decoration-white/20 underline decoration-2 underline-offset-12">
                       "Scholar reflects exceptional cognitive participation in sessional history modules. Analytical resonance is optimal; recommend transitioning to Advanced Logic Streams."
                     </p>
                     <div className="flex items-center gap-6 pt-10 border-t border-white/10">
                        <img src="https://picsum.photos/seed/anjali/200/200" className="w-16 h-16 rounded-[1.5rem] border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform" alt="Teacher" />
                        <div>
                           <p className="text-base font-black uppercase tracking-tighter leading-none mb-1">Anjali Sharma</p>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none text-neutral-400 dark:text-neutral-300">Sessional Lead Faculty</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="quizzes"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 md:p-10 bg-white/70 dark:bg-neutral-900/70">
               <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter mb-8 flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-primary-500" /> Assessment History
               </h3>

               {studentSubmissions.length > 0 ? (
                 <div className="space-y-4">
                    {studentSubmissions.map(submission => (
                       <div key={submission.id} className="p-5 md:p-6 glass-panel bg-white dark:bg-neutral-800 border-neutral-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary-200 transition-all gap-6">
                          <div className="flex items-center gap-4 md:gap-6">
                             <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors shrink-0">
                                <Book className="w-6 h-6 md:w-7 md:h-7 text-neutral-400 dark:text-neutral-400 group-hover:text-blue-500 transition-colors" />
                             </div>
                             <div className="min-w-0 text-left">
                                <h4 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight truncate">{submission.quizTitle}</h4>
                                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-1">Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 border-t md:border-t-0 pt-4 md:pt-0 dark:border-white/5">
                             <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Score</p>
                                <div className="flex items-baseline gap-1">
                                   <span className="text-2xl font-black text-neutral-900 dark:text-white">{submission.score}</span>
                                   <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">/ {submission.totalQuestions}</span>
                                </div>
                             </div>
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                                submission.score / submission.totalQuestions >= 0.8 ? 'border-success-500 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400' : 'border-warning-500 bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400'
                             } font-black text-xs`}>
                                {Math.round((submission.score / submission.totalQuestions) * 100)}%
                             </div>
                             <button className="px-6 py-3 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                View
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-20 flex flex-col items-center justify-center gap-6 text-center bg-neutral-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-white/10">
                    <HelpCircle className="w-12 h-12 text-neutral-200" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-300">No active assessments in the record.</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col gap-1.5 p-4 glass-panel bg-white/40 dark:bg-white/5 border-neutral-100 dark:border-white/5 group hover:bg-white dark:hover:bg-neutral-800 transition-all">
      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
        <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none truncate">{label}</span>
      </div>
      <span className="text-lg md:text-xl font-black text-neutral-900 dark:text-white leading-none tracking-tighter truncate">{value}</span>
    </div>
  );
}

function CapabilityBlock({ title, data, color, bgColor }: any) {
  return (
    <div className={`glass-card p-6 md:p-8 ${bgColor} border-white dark:border-white/5 shadow-sm hover:shadow-lg transition-all`}>
       <h4 className="text-[9px] md:text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-6">{title}</h4>
       <div className="space-y-4">
          {data.map((item: any, i: number) => (
             <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-tighter">
                   <span>{item.label}</span>
                   <span className="text-neutral-900 dark:text-white">{item.val}%</span>
                </div>
                <div className="h-2 w-full bg-white/60 dark:bg-white/5 rounded-full overflow-hidden border border-white dark:border-white/5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${item.val}%` }}
                     transition={{ duration: 1, ease: 'easeOut' }}
                     className={`h-full ${color} rounded-full`}
                   />
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
