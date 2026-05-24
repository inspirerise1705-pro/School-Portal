import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  ChevronRight,
  Send,
  Mail,
  Target,
  FileText
} from 'lucide-react';
import { Student } from './types';
import { mockQuizSubmissions } from './mockData';

interface QuizReportsViewProps {
  students: Student[];
}

export default function QuizReportsView({ students }: QuizReportsViewProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const quizzes = [
    { id: 'q1', title: 'Atmosphere Dynamics', dueDate: new Date().toISOString(), category: 'Quiz' },
    { id: 'q2', title: 'Trade Routes of India', dueDate: '2026-04-20', category: 'Assignment' },
    { id: 'q3', title: 'Ancient Civilizations', dueDate: '2026-04-22', category: 'Exam' }
  ];

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setSelectedSubmissionId(null);
  };

  const handleBackToSubmissions = () => {
    setSelectedSubmissionId(null);
  };

  const handleFinalize = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleBackToSubmissions();
    }, 2000);
  };

  if (selectedSubmissionId) {
    const submission = mockQuizSubmissions.find(s => s.id === selectedSubmissionId);
    const student = students.find(s => s.id === submission?.studentId);
    return (
      <>
        <SubmissionDetail 
          submission={submission} 
          student={student} 
          onBack={handleBackToSubmissions} 
          onFinalize={handleFinalize}
        />
        <AnimatePresence>
           {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
            >
              <div className="glass-card p-6 bg-neutral-900 border-none flex items-center gap-6 shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" />
                 <div className="w-14 h-14 rounded-2xl bg-success-500 text-white flex items-center justify-center shadow-xl relative z-10 shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-lg font-black text-white tracking-tight">Grades Published</h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Results sent to students</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (selectedQuiz) {
    const quiz = quizzes.find(q => q.id === selectedQuiz);
    return (
      <QuizSubmissionList 
        quiz={quiz} 
        students={students} 
        onSelectSubmission={setSelectedSubmissionId}
        onBack={handleBackToQuizzes}
      />
    );
  }

  return (
    <div className="p-4 md:p-12 space-y-12 h-full overflow-y-auto custom-scrollbar pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 group">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter flex items-center gap-6">
             <ClipboardCheck className="w-10 h-10 md:w-16 md:h-16 text-neutral-900 dark:text-primary-500 group-hover:rotate-6 transition-transform" /> Assessment Reports
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-lg font-semibold opacity-80 mt-2 ml-1 decoration-primary-500/20 underline decoration-2 underline-offset-8">Review student grades and provide feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quizzes.map(quiz => (
           <button 
             key={quiz.id}
             onClick={() => setSelectedQuiz(quiz.id)}
             className="glass-card p-10 group text-left hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden bg-white/60 dark:bg-neutral-900/40 border-none shadow-2xl"
           >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[80px] -mr-16 -mt-16 rounded-full group-hover:bg-primary-500/15" />
             <div className="w-16 h-16 rounded-[1.75rem] bg-neutral-900 dark:bg-primary-500 flex items-center justify-center mb-8 shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform">
                <ClipboardCheck className="w-8 h-8 text-white" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-2 block opacity-70">{quiz.category} Module</span>
             <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-4 transition-colors">{quiz.title}</h3>
             <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <Clock className="w-4 h-4" /> Due {new Date(quiz.dueDate).toLocaleDateString()}
             </div>
             <div className="mt-10 flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-white/5">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-xl border-4 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shadow-xl">
                        <img src={`https://picsum.photos/seed/${i + 20}/100/100`} className="w-full h-full object-cover" alt="Student" />
                     </div>
                   ))}
                   <div className="w-10 h-10 rounded-xl border-4 border-white dark:border-neutral-900 bg-primary-500 text-white flex items-center justify-center text-[10px] font-black shadow-xl">+32</div>
                </div>
                <div className="flex items-center gap-3 text-neutral-900 dark:text-primary-400 font-black text-[11px] uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">
                   Audit <ChevronRight className="w-5 h-5" />
                </div>
             </div>
           </button>
        ))}
      </div>
    </div>
  );
}

function QuizSubmissionList({ quiz, students, onSelectSubmission, onBack }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const submissionsForQuiz = mockQuizSubmissions.filter(s => s.quizTitle === quiz?.title);
  const submittedStudentIds = submissionsForQuiz.map(s => s.studentId);
  
  const filteredStudents = students.filter((s: Student) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 glass-panel hover:bg-white dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-900 dark:text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">{quiz?.title}</h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm font-bold">Reviewing all class submissions.</p>
          </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-12 pr-6 py-3 glass-panel bg-white/70 dark:bg-neutral-900/70 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all border-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student: Student) => {
           const submission = submissionsForQuiz.find(s => s.studentId === student.id);
           return (
             <button 
               key={student.id}
               disabled={!submission}
               onClick={() => submission && onSelectSubmission(submission.id)}
               className={`glass-card p-6 flex items-center justify-between group transition-all relative overflow-hidden ${!submission ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
             >
               <div className="flex items-center gap-4">
                 <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-neutral-800" />
                 <div className="min-w-0 pr-4">
                    <p className="font-black text-neutral-900 dark:text-white leading-none mb-1 text-lg transition-colors">{student.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      {submission ? 'Evaluation Pending' : 'Waiting for student'}
                    </p>
                 </div>
               </div>
               {submission ? (
                 <div className="text-right">
                    <p className="text-lg font-black text-primary-500 leading-none">{submission.score}/{submission.totalQuestions}</p>
                    <CheckCircle2 className="w-4 h-4 text-success-500 ml-auto mt-1" />
                 </div>
               ) : (
                 <XCircle className="w-5 h-5 text-neutral-300" />
               )}
             </button>
           );
        })}
      </div>
    </div>
  );
}

function SubmissionDetail({ submission, student, onBack, onFinalize }: any) {
  const [grading, setGrading] = useState(submission.score);
  const [reviewText, setReviewText] = useState('');
  const [emailParents, setEmailParents] = useState(false);

  return (
     <div className="p-4 md:p-12 space-y-12 h-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-y-auto custom-scrollbar pb-32">
       <div className="flex items-center justify-between py-8">
         <div className="flex items-center gap-6">
           <button 
             onClick={onBack} 
             className="w-14 h-14 glass-panel bg-white dark:bg-neutral-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl group"
           >
              <ArrowLeft className="w-6 h-6 text-neutral-900 dark:text-white group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-1 leading-none">Scholar Audit</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase">{student?.name}</h3>
           </div>
         </div>
         <div className="hidden md:flex items-center gap-4 p-2 bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-white/5">
            <div className="px-6 py-2 rounded-xl bg-neutral-900 dark:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest">Master Review Flow</div>
         </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Assessment */}
          <div className="xl:col-span-8 space-y-10">
             <div className="glass-card p-10 md:p-14 bg-white/70 dark:bg-neutral-900/60 border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 primary-gradient blur-[100px] opacity-10 -mr-32 -mt-32 rounded-full pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-14 relative z-10">
                   <div className="relative group">
                     <div className="absolute -inset-1 bg-primary-500 blur opacity-20 group-hover:opacity-100 transition-all rounded-[2.5rem]" />
                     <img src={student?.avatar} alt={student?.name} className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] border-8 border-white dark:border-neutral-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative z-10 transform scale-[1.1]" />
                   </div>
                 <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase shrink-0 transition-colors">{student?.name}</h2>
                    <p className="text-primary-500 font-black uppercase text-[10px] tracking-widest mt-2 opacity-80">{submission.quizTitle} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-xl font-black flex items-center gap-3 dark:text-white border-l-4 border-primary-500 pl-4">
                    Assigned Questions
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="p-6 glass-panel bg-neutral-50/50 dark:bg-white/5 border-none space-y-4 hover:bg-white dark:hover:bg-neutral-800 transition-all shadow-md group/q rounded-2xl">
                        <div className="flex justify-between items-start gap-4">
                           <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Question {i}</span>
                              <p className="font-black text-lg text-neutral-900 dark:text-white tracking-tight leading-snug">What layer of the atmosphere is closest to Earth?</p>
                           </div>
                           <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md ${i === 4 ? 'bg-error-500 text-white shadow-error-500/20' : 'bg-success-500 text-white shadow-success-500/20'}`}>
                              {i === 4 ? 'Incorrect' : 'Correct'}
                           </span>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Student's Answer</span>
                           <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400 bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-neutral-100 dark:border-white/5 leading-relaxed">
                              {i === 4 ? "The Stratosphere layer because it has less pressure." : "The Troposphere is the lowest layer where we live and breathe."}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
             <div className="glass-card p-10 bg-neutral-900 dark:bg-primary-600 text-white border-none shadow-2xl relative overflow-hidden group/panel rounded-3xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white blur-[100px] opacity-10 -mr-32 -mt-32 rounded-full pointer-events-none" />
                <Target className="w-12 h-12 mb-8 opacity-20 transform -rotate-12 group-hover/panel:rotate-0 transition-transform duration-700" />
                <h3 className="text-2xl font-black tracking-tighter mb-10 uppercase leading-none">Grading & Review</h3>
                
                <div className="space-y-8 relative z-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block ml-1">Final Score</label>
                      <div className="flex items-center gap-4">
                         <input 
                           type="number" 
                           value={grading}
                           onChange={(e) => setGrading(parseInt(e.target.value))}
                           className="w-24 p-4 bg-white/10 rounded-xl text-3xl font-black text-center focus:outline-none border-2 border-white/20 focus:border-white/50 transition-all"
                         />
                         <span className="text-2xl font-black opacity-30">/ {submission.totalQuestions}</span>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block ml-1">Review Comments</label>
                      <textarea 
                        placeholder="Write your feedback here..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full p-5 bg-white/10 rounded-2xl text-sm font-bold focus:outline-none border-2 border-white/20 min-h-[140px] shadow-sm placeholder:text-white/30 leading-relaxed"
                      />
                   </div>

                   <div className="flex items-center justify-between p-4 glass-panel bg-white/10 border-white/10 cursor-pointer hover:bg-white/20 transition-all rounded-xl" onClick={() => setEmailParents(!emailParents)}>
                      <div className="flex items-center gap-3">
                         <Mail className={`w-5 h-5 transition-all ${emailParents ? 'text-white' : 'opacity-40'}`} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Email Parents</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-all relative ${emailParents ? 'bg-white' : 'bg-white/20'}`}>
                         <div className={`w-4 h-4 rounded-full transition-all duration-300 ${emailParents ? 'translate-x-6 bg-neutral-900' : 'translate-x-0 bg-white'}`} />
                      </div>
                   </div>

                   <button 
                    onClick={onFinalize}
                    className="w-full py-5 bg-white text-neutral-900 dark:text-primary-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all transform flex items-center justify-center gap-3 active:scale-95 group/btn"
                   >
                      <Send className="w-5 h-5 text-primary-500 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /> Publish Grade
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
