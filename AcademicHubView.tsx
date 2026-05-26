import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  BrainCircuit, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  Loader2,
  FileUp,
  Image as ImageIcon,
  ArrowRight,
  BookOpen,
  Layout,
  Search,
  FileBadge,
  Eye,
  CheckCircle,
  FileType,
  X,
  Printer,
  Key as KeyIcon,
  Download,
  Trash2,
  Edit3,
  Mail,
  Send,
  User,
  AlertCircle,
  ChevronDown,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { Teacher, ClassInfo, QuizQuestion, QuestionPaper, StudentQuizSubmission } from './types';
import { generateQuiz } from './geminiService';
import { mockQuizSubmissions, mockStudents } from './mockData';

interface AcademicHubViewProps {
  teacher: Teacher;
  classes: ClassInfo[];
}

export default function AcademicHubView({ teacher, classes }: AcademicHubViewProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'task' | 'quiz' | 'paper'>('upload');
  const [selectedClassId, setSelectedClassId] = useState(classes[0].id);
  const [selectedSubjectId, setSelectedSubjectId] = useState(teacher.subjects[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuiz, setAiQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizTopic, setQuizTopic] = useState('');
  
  const [successState, setSuccessState] = useState<{ title: string; subtitle: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPaper, setEditingPaper] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questionPaper, setQuestionPaper] = useState<QuizQuestion[]>([]);
  const [paperTitle, setPaperTitle] = useState('');
  const [selectedMarkers, setSelectedMarkers] = useState<number | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion | null>(null);
  const [newQuestionType, setNewQuestionType] = useState<'MCQ' | 'Fill in the Blank' | 'Diagram' | 'Short Answer' | 'Long Answer'>('MCQ');
  const [newQuestionMarks, setNewQuestionMarks] = useState<4 | 6 | 8>(4);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        triggerSuccess('Repository Synced', `"${fileName}" has been authorized for Grade ${classes.find(c=>c.id===selectedClassId)?.name} access.`);
      }, 2000);
    }
  };

  const triggerSuccess = (title: string, subtitle: string) => {
    setSuccessState({ title, subtitle });
    setTimeout(() => setSuccessState(null), 3000);
  };

  async function handleGenerateQuiz() {
    if (!quizTopic) return;
    setIsGenerating(true);
    try {
      const result = await generateQuiz(quizTopic);
      setAiQuiz(result);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleGeneratePaper = () => {
    if (!quizTopic || !selectedMarkers) return;
    setIsGenerating(true);
    setTimeout(() => {
      setQuestionPaper([
        { question: "Analyze the strategic impact of the Deccan Plateau on ancient Indian trade routes.", type: 'MCQ', marks: 8, options: ["Navigational Superiority", "Mineral Wealth Resonance", "Safe Transit Corridors", "Comprehensive Influence"], correctAnswer: "Comprehensive Influence", explanation: "Sessional NCERT Matrix." },
        { question: "Detail the administrative flux between the Cholas and Rashtrakuta dynasties.", type: 'MCQ', marks: 6, options: ["Centralized Ledger", "Decentralized Matrix", "Feudal Hierarchy", "Kinship Networks"], correctAnswer: "Decentralized Matrix", explanation: "Comparative Politics artifact." },
        { question: "What role did the monsoon cycle play in sessional agrarian settlements?", type: 'Short Answer', marks: 4, answer: "Cycle Calibration", explanation: "Geographical History module." }
      ]);
      setPaperTitle(`${quizTopic} Ledger - Sessional #2026`);
      setIsGenerating(false);
      setEditingPaper(true);
    }, 2500);
  };

  const handleDistribute = (type: string) => {
    triggerSuccess(`${type} Authorized`, `The sessional matrix was successfully streamed to Class ${classes.find(c=>c.id===selectedClassId)?.name}.`);
    setAiQuiz(null);
    setEditingPaper(false);
    setQuestionPaper([]);
    setQuizTopic('');
    setSelectedMarkers(null);
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: 'New question prompt',
      type: newQuestionType,
      marks: newQuestionMarks,
      options: newQuestionType === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: newQuestionType === 'MCQ' ? 'Option A' : undefined,
      answer: newQuestionType !== 'MCQ' ? 'Provide the answer or diagram guidance here.' : undefined,
      explanation: 'Provide explanation here.'
    };

    setQuestionPaper(prev => {
      const next = [...prev, newQuestion];
      setEditingQuestionIndex(next.length - 1);
      setEditedQuestion(newQuestion);
      return next;
    });

    triggerSuccess('Question added', 'A new question has been added to the paper.');
  };

  const handleAddAIQuestion = async () => {
    if (!quizTopic) {
      triggerSuccess('Topic needed', 'Set a paper topic before AI suggests a question.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateQuiz(quizTopic, 1);
      const aiQuestion = result[0];

      if (!aiQuestion) {
        triggerSuccess('No question created', 'AI could not generate a question right now.');
        return;
      }

      const nextQuestion: QuizQuestion = {
        question: aiQuestion.question,
        type: 'MCQ',
        marks: 4,
        options: aiQuestion.options?.length ? aiQuestion.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: aiQuestion.correctAnswer || aiQuestion.answer || 'Option A',
        explanation: aiQuestion.explanation || '',
      };

      setQuestionPaper(prev => {
        const next = [...prev, nextQuestion];
        setEditingQuestionIndex(next.length - 1);
        setEditedQuestion(nextQuestion);
        return next;
      });
      triggerSuccess('AI question added', 'Auto-generated question added to the paper.');
    } catch (error) {
      triggerSuccess('AI error', 'Unable to generate a question at the moment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuestionEdit = (index: number) => {
    setEditingQuestionIndex(index);
    setEditedQuestion(questionPaper[index]);
  };

  const handleSaveEditedQuestion = () => {
    if (editingQuestionIndex === null || !editedQuestion) return;

    setQuestionPaper(prev => prev.map((item, idx) => idx === editingQuestionIndex ? editedQuestion : item));
    setEditingQuestionIndex(null);
    setEditedQuestion(null);
    triggerSuccess('Question updated', 'Your changes were saved successfully.');
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionIndex(null);
    setEditedQuestion(null);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestionPaper(prev => prev.filter((_, idx) => idx !== index));

    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setEditedQuestion(null);
    }

    triggerSuccess('Question removed', 'The question was deleted from the paper.');
  };

  const handlePrintExam = () => {
    triggerSuccess('Print ready', 'Exam paper preview is ready for printing.');
  };

  return (
    <div className="p-2 md:p-4 h-full flex flex-col gap-4 animate-in fade-in duration-500 relative scrollbar-hide">
      {/* Success/Upload Overlay - Refined to Toast */}
      <AnimatePresence>
        {(successState || isUploading) && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
          >
            <div className={`p-4 md:p-6 rounded-2xl glass-card backdrop-blur-2xl border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex items-center gap-4 overflow-hidden relative ${isUploading ? 'bg-neutral-900' : 'bg-success-600'}`}>
               <div className="absolute inset-0 bg-white/5 opacity-40" />
               <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl relative z-10 shrink-0 ${isUploading ? 'bg-primary-500' : 'bg-white'}`}>
                  {isUploading ? <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" /> : <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-success-600" />}
               </div>
               <div className="relative z-10 text-white">
                  <h3 className="text-sm md:text-lg font-black tracking-tight leading-none uppercase">{isUploading ? 'Establishing Connection' : successState?.title}</h3>
                  <p className="text-[9px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1 leading-tight">{isUploading ? 'Syncing scholarly assets...' : successState?.subtitle}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* Header Area - Compact */}
       <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6 pb-2">
        <div className="space-y-1 flex-1">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter flex items-center gap-2 md:gap-4">
             <Layout className="w-6 h-6 md:w-8 md:h-8 text-primary-500" /> Academics
          </h2>
          <p className="text-neutral-700 dark:text-neutral-200 text-[11px] md:text-sm font-bold max-w-lg leading-relaxed opacity-95">
            Create assignments, exams, and share resources.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900/80 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm self-start md:mt-0">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 ml-1 md:ml-2">Context</span>
            <div className="h-3 w-px bg-neutral-200 dark:bg-white/10 mx-1 md:mx-2" />
            <div className="flex gap-1 md:gap-2">
              <div className="relative group">
                <select 
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg md:rounded-xl pl-3 md:pl-4 pr-8 md:pr-10 py-1.5 md:py-2 text-[9px] md:text-xs font-black text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none min-w-[100px] md:min-w-[120px]"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 text-neutral-600 dark:text-neutral-400 pointer-events-none transition-colors" />
              </div>

              <div className="relative group">
                <select 
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg md:rounded-xl pl-3 md:pl-4 pr-8 md:pr-10 py-1.5 md:py-2 text-[9px] md:text-xs font-black text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none min-w-[100px] md:min-w-[120px]"
                >
                  {teacher.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 text-neutral-600 dark:text-neutral-400 pointer-events-none transition-colors" />
              </div>
            </div>
        </div>
      </div>

      {/* Mobile Tab Strip — 4 equal columns, always all visible */}
      <div className="lg:hidden grid grid-cols-4 gap-1.5 shrink-0">
        {(['upload', 'task', 'quiz', 'paper'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setEditingPaper(false); setAiQuiz(null); setQuizTopic(''); }}
            className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-lg'
                : 'bg-white/90 dark:bg-neutral-950/90 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === tab ? 'bg-white/10' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
              {tab === 'upload' && <Upload className="w-3.5 h-3.5" />}
              {tab === 'task' && <Plus className="w-3.5 h-3.5" />}
              {tab === 'quiz' && <BrainCircuit className="w-3.5 h-3.5" />}
              {tab === 'paper' && <FileBadge className="w-3.5 h-3.5" />}
            </div>
            <p className="text-[8px] font-black uppercase tracking-wide leading-none text-center">
              {tab === 'upload' ? 'Upload' : tab === 'task' ? 'Assign' : tab === 'quiz' ? 'AI Quiz' : 'Paper'}
            </p>
          </button>
        ))}
      </div>

      {/* Main Workflow Area */}
      <div className="flex-1 flex gap-3 md:gap-6 min-h-0 overflow-hidden">

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col gap-2 min-h-0 pb-2 pr-2 scrollbar-hide w-48 shrink-0 overflow-y-auto">
          {(['upload', 'task', 'quiz', 'paper'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setEditingPaper(false); setAiQuiz(null); setQuizTopic(''); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 text-left relative overflow-hidden ${
                activeTab === tab
                  ? 'bg-neutral-900 dark:bg-primary-500 text-white shadow-lg'
                  : 'bg-white/90 dark:bg-neutral-950/90 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-white/10'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === tab ? 'bg-white/10' : 'bg-neutral-100 dark:bg-neutral-900/80'} transition-colors shrink-0`}>
                {tab === 'upload' && <Upload className="w-4 h-4" />}
                {tab === 'task' && <Plus className="w-4 h-4" />}
                {tab === 'quiz' && <BrainCircuit className="w-4 h-4" />}
                {tab === 'paper' && <FileBadge className="w-4 h-4" />}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-xs font-black uppercase tracking-widest leading-none truncate">
                  {tab === 'upload' ? 'Upload' : tab === 'task' ? 'Assignment' : tab === 'quiz' ? 'AI Quiz' : 'Exam Paper'}
                </p>
                <p className="text-[9px] font-bold mt-1 opacity-90 truncate">
                  {tab === 'upload' ? 'Library' : tab === 'task' ? 'Assign' : tab === 'quiz' ? 'Builder' : 'Exam'}
                </p>
              </div>
              {activeTab === tab && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                </div>
              )}
            </button>
          ))}

          <div className="mt-auto flex flex-col gap-2 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
            <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-widest">Gen AI Assistant</p>
            <p className="text-[10px] font-bold leading-relaxed text-neutral-700 dark:text-neutral-300">Optimized for CBSE/ICSE curriculum Grade {classes.find(c=>c.id===selectedClassId)?.name}.</p>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-3 md:p-5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 flex flex-col min-h-0 shadow-inner overflow-y-auto scrollbar-hide rounded-2xl md:rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (editingPaper ? '-editing' : '')}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col min-h-0"
            >
              {activeTab === 'upload' && (
                <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 md:border-4 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center gap-4 md:gap-6 group cursor-pointer hover:border-primary-500 hover:bg-white dark:hover:bg-neutral-800 transition-all shadow-inner bg-neutral-50/50 dark:bg-white/5 min-h-[250px] md:min-h-[350px]"
                  >
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-white dark:bg-neutral-900 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-all border border-neutral-100 dark:border-white/5">
                      <FileUp className="text-primary-500 w-7 h-7 md:w-10 md:h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">Share Resources</h3>
                      <p className="text-[11px] md:text-sm font-bold text-neutral-600 dark:text-neutral-300 mt-1 md:mt-2 max-w-xs mx-auto opacity-100 px-2">Upload PDFs, Slides, or Images for instant access.</p>
                    </div>
                    <button className="px-6 md:px-8 py-2.5 md:py-3 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg md:shadow-2xl transition-all active:scale-95">
                       Upload
                    </button>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-300 tracking-[0.3em] px-2 opacity-100">Repository</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                       <UploadedItem name="Unit_III_Civilizations_Ledger.pdf" time="5m ago" type="pdf" />
                       <UploadedItem name="Maps_Atlas_Sessional_Matrix.png" time="1h ago" type="img" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'task' && (
                <div className="flex-1">
                   <div className="max-w-2xl mx-auto py-4 space-y-4 md:space-y-6">
                      <div className="space-y-4 md:space-y-6">
                        <Field label="Assignment Topic" placeholder="e.g. Analysis of the Salt Satyagraha" />
                        <div className="space-y-2">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 ml-1 opacity-100">Guidelines</label>
                          <textarea 
                            placeholder="Detail requirements..." 
                            rows={4}
                            className="w-full p-3 md:p-4 glass-panel bg-white dark:bg-neutral-800/50 text-sm md:text-base font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 leading-relaxed border-none rounded-2xl md:rounded-3xl"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 ml-1 opacity-100">Due Date</label>
                              <input type="date" className="w-full p-2.5 md:p-3 glass-panel bg-white dark:bg-neutral-800 text-xs font-black text-neutral-900 dark:text-white focus:ring-0 rounded-lg md:rounded-xl" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 ml-1 opacity-100">Mode</label>
                              <select className="w-full p-2.5 md:p-3 glass-panel bg-white dark:bg-neutral-800 text-xs font-black text-neutral-900 dark:text-white focus:ring-0 rounded-lg md:rounded-xl">
                                 <option>Digital</option>
                                 <option>Physical</option>
                              </select>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleDistribute('Assignment')}
                          className="w-full py-3 md:py-4 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg md:shadow-2xl hover:bg-black transition-all active:scale-95 mt-2 md:mt-4"
                        >
                           Publish to Stream
                        </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                  <div className="flex gap-2 md:gap-3 mb-4 md:mb-6">
                     <div className="flex-1 relative group">
                        <Sparkles className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-primary-500 w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                        <input 
                          type="text" 
                          placeholder="AI Helper: Quiz on Mughal Architecture..." 
                          value={quizTopic}
                          onChange={(e) => setQuizTopic(e.target.value)}
                          className="w-full pl-12 md:pl-16 pr-4 md:pr-8 py-3 md:py-4 glass-card bg-white dark:bg-neutral-800/50 border-none text-sm md:text-base font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 shadow-lg rounded-xl md:rounded-2xl"
                        />
                     </div>
                     <button 
                        onClick={handleGenerateQuiz}
                        disabled={isGenerating || !quizTopic}
                        className="px-4 md:px-6 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-30 active:scale-95 group/gen"
                     >
                        {isGenerating ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <div className="flex items-center gap-2 md:gap-3"><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden md:block">Create</span> <Sparkles className="w-4 h-4 md:w-5 md:h-5" /></div>}
                     </button>
                  </div>

                  <div className="flex-1 space-y-4 md:space-y-6">
                    {isGenerating ? (
                      <LoadingAI topic={quizTopic} />
                    ) : aiQuiz ? (
                      <div className="space-y-4 md:space-y-6">
                        {aiQuiz.map((q, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="p-4 md:p-6 glass-panel bg-white dark:bg-neutral-800/50 border-none shadow-lg space-y-4 md:space-y-6 rounded-2xl md:rounded-3xl"
                          >
                             <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1">
                                   <span className="text-[8px] md:text-[9px] font-black uppercase text-neutral-500 dark:text-neutral-400 tracking-[0.2em] opacity-100">Question {idx + 1}</span>
                                   <p className="text-base md:text-lg font-black text-neutral-900 dark:text-white leading-tight">"{q.question}"</p>
                                </div>
                                <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-primary-500/10 text-primary-500 text-[7px] md:text-[8px] font-black rounded-lg shrink-0">
                                  <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> Gen AI
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                               {q.options?.map((opt, i) => (
                                 <div key={i} className={`p-3 md:p-4 rounded-lg md:rounded-xl text-xs md:text-sm font-bold tracking-tight transition-all cursor-default ${opt === q.correctAnswer ? 'bg-success-500/10 text-success-600 ring-1 ring-success-500/30' : 'bg-neutral-50 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 ring-1 ring-neutral-100 dark:ring-white/5'}`}>
                                   <span className="opacity-60 mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                                 </div>
                               ))}
                             </div>
                          </motion.div>
                        ))}
                        <button 
                          onClick={() => handleDistribute('Quiz')}
                          className="w-full py-3 md:py-4 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px] shadow-lg md:shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3"
                        >
                          <Send className="w-4 h-4 md:w-5 md:h-5" /> Publish
                        </button>
                      </div>
                    ) : <EmptyState icon={BrainCircuit} title="Gen AI Prompt Engine" text="Define a topic for automated quiz building." />}
                  </div>
                </div>
              )}

              {activeTab === 'paper' && (
                <div className="flex-1 flex flex-col pb-4 md:pb-6">
                   <div className="max-w-2xl mx-auto py-4 space-y-6 md:space-y-8 w-full">
                      <div className="text-center space-y-2">
                         <h3 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">Exam Matrix</h3>
                         <p className="text-[10px] md:text-xs font-bold text-neutral-600 dark:text-neutral-300 opacity-100">Configure your exam paper.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {[20, 50, 100].map(m => (
                          <button 
                            key={m}
                            onClick={() => setSelectedMarkers(m)}
                            className={`p-4 md:p-6 glass-panel border-none flex flex-col items-center gap-2 md:gap-3 transition-all rounded-xl md:rounded-2xl shadow-lg ${selectedMarkers === m ? 'bg-primary-500 text-white scale-105 shadow-primary-500/20' : 'bg-white dark:bg-neutral-800/50 dark:text-neutral-300'}`}
                          >
                             <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none">{m}</span>
                             <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ${selectedMarkers === m ? 'text-white/80' : 'text-neutral-500 dark:text-neutral-400'}`}>Marks</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4 md:space-y-6">
                         <Field label="Topic" placeholder="e.g. Medieval Trade Dynamics" value={quizTopic} onChange={setQuizTopic} />
                         <div className="pt-2 md:pt-4">
                            <button 
                              onClick={handleGeneratePaper}
                              disabled={isGenerating || !quizTopic || !selectedMarkers}
                              className="w-full py-3 md:py-4 bg-neutral-900 dark:bg-primary-500 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-2 md:gap-3 shadow-lg md:shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-30"
                            >
                               {isGenerating ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <><Printer className="w-4 h-4 md:w-5 md:h-5" /> Generate</>}
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

       {/* Half-Width Exam Paper Slider */}
       <AnimatePresence>
         {editingPaper && (
           <div className="fixed inset-0 z-[200] flex justify-end pointer-events-none">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setEditingPaper(false)}
               className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm pointer-events-auto"
             />
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full md:w-1/2 bg-white dark:bg-neutral-950 h-full relative shadow-[-40px_0_80px_rgba(0,0,0,0.6)] border-l border-neutral-200 dark:border-white/10 p-4 md:p-8 lg:p-10 flex flex-col overflow-visible pointer-events-auto"
             >
                <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
                   <div className="space-y-1 md:space-y-2">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Ledger Builder</p>
                      <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter leading-tight border-l-[8px] md:border-l-[10px] border-primary-500 pl-4 md:pl-6 uppercase">{paperTitle}</h3>
                   </div>
                   <button onClick={() => setEditingPaper(false)} className="p-2 md:p-3 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl md:rounded-2xl transition-all group shrink-0">
                      <X className="w-5 h-5 md:w-6 md:h-6 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 md:pr-3 custom-scrollbar space-y-4 md:space-y-6 min-h-0 mb-6 md:mb-8">
                   {editingQuestionIndex !== null && editedQuestion && (
                     <div className="space-y-4 p-4 md:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-3xl shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                           <div>
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Editing Section {editingQuestionIndex + 1}</span>
                              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">Update the prompt, options, correct answer, or explanation and save changes.</p>
                           </div>
                           <button type="button" onClick={handleCancelQuestionEdit} className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-300">Cancel</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Question type</label>
                            <select
                              value={editedQuestion.type || 'MCQ'}
                              onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, type: e.target.value as QuizQuestion['type'], options: e.target.value === 'MCQ' ? prev.options ?? ['Option A', 'Option B', 'Option C', 'Option D'] : prev.options } : prev)}
                              className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20"
                            >
                              <option value="MCQ">MCQ</option>
                              <option value="Fill in the Blank">Fill in the Blank</option>
                              <option value="Diagram">Diagram</option>
                              <option value="Short Answer">Short Answer</option>
                              <option value="Long Answer">Long Answer</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Marks</label>
                            <select
                              value={editedQuestion.marks || 4}
                              onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, marks: Number(e.target.value) as 4 | 6 | 8 } : prev)}
                              className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-sm font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20"
                            >
                              <option value={4}>4 Marker</option>
                              <option value={6}>6 Marker</option>
                              <option value={8}>8 Marker</option>
                            </select>
                          </div>
                        </div>
                        <Field label="Question" placeholder="Enter question" value={editedQuestion.question} onChange={(value: string) => setEditedQuestion(prev => prev ? { ...prev, question: value } : prev)} />
                        {editedQuestion.type === 'MCQ' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {editedQuestion.options?.map((option, optionIndex) => (
                              <Field
                                key={optionIndex}
                                label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                value={option}
                                onChange={(value: string) => setEditedQuestion(prev => prev ? { ...prev, options: prev.options?.map((opt, oi) => oi === optionIndex ? value : opt) ?? [] } : prev)}
                              />
                            ))}
                          </div>
                        ) : (
                          <Field label="Answer Guidance" placeholder="Enter answer or diagram direction" value={editedQuestion.answer || ''} onChange={(value: string) => setEditedQuestion(prev => prev ? { ...prev, answer: value } : prev)} />
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {editedQuestion.type === 'MCQ' ? (
                            <Field label="Correct answer" placeholder="Correct answer" value={editedQuestion.correctAnswer || ''} onChange={(value: string) => setEditedQuestion(prev => prev ? { ...prev, correctAnswer: value } : prev)} />
                          ) : null}
                          <Field label="Explanation" placeholder="Write explanation" value={editedQuestion.explanation || ''} onChange={(value: string) => setEditedQuestion(prev => prev ? { ...prev, explanation: value } : prev)} />
                        </div>
                        <button type="button" onClick={handleSaveEditedQuestion} className="w-full py-3 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition">Save changes</button>
                     </div>
                   )}
                   {questionPaper.map((q, idx) => (
                     <div key={idx} className="p-4 md:p-6 lg:p-8 glass-panel bg-neutral-50 dark:bg-white/5 border-neutral-100 dark:border-white/5 relative group rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-75 md:scale-90 group-hover:scale-100 origin-right">
                           <button type="button" onClick={() => handleStartQuestionEdit(idx)} className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center bg-white dark:bg-neutral-800 rounded-lg md:rounded-2xl shadow-xl hover:text-primary-500 transition-all text-sm md:text-base"><Edit3 className="w-4 h-4 md:w-5 md:h-5" /></button>
                           <button type="button" onClick={() => handleDeleteQuestion(idx)} className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center bg-white dark:bg-neutral-800 rounded-lg md:rounded-2xl shadow-xl hover:text-error-500 transition-all text-sm md:text-base"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                        </div>
                        <div className="mb-4 md:mb-6 pr-16 space-y-3">
                           <div className="flex flex-wrap gap-2 items-center">
                             <span className="inline-flex items-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-300 text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1">{q.type || 'MCQ'}</span>
                             <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 text-[10px] uppercase tracking-[0.25em] font-black px-3 py-1">{q.marks || 4}-marker</span>
                           </div>
                           <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-500 dark:text-neutral-400">Section {idx + 1}</span>
                           <p className="text-base md:text-xl lg:text-2xl font-black text-neutral-900 dark:text-white leading-tight mt-2 md:mt-3">"{q.question}"</p>
                        </div>
                        {q.type === 'MCQ' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                             {q.options?.map((o, i) => (
                               <div key={i} className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold border transition-all ${o === q.correctAnswer ? 'bg-success-500/10 border-success-500/20 text-success-700 dark:text-success-300' : 'bg-white dark:bg-white/5 border-neutral-100 dark:border-white/5 text-neutral-700 dark:text-neutral-200'}`}>
                                 <div className="flex items-center gap-3">
                                   <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-[9px] md:text-xs font-black shrink-0">{String.fromCharCode(65 + i)}</span>
                                   <span className="flex-1 text-[11px] md:text-sm">{o}</span>
                                 </div>
                               </div>
                             ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-3xl bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/10 text-sm md:text-base text-neutral-700 dark:text-neutral-200">
                            <span className="block text-[10px] uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 mb-2">Answer</span>
                            <p className="font-black leading-snug">{q.answer || q.correctAnswer || 'Answer not set yet'}</p>
                          </div>
                        )}
                     </div>
                   ))}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Question type</label>
                        <select
                          value={newQuestionType}
                          onChange={(e) => setNewQuestionType(e.target.value as any)}
                          className="w-full p-3 rounded-3xl bg-white dark:bg-neutral-900 text-sm font-black border border-neutral-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20"
                        >
                          <option value="MCQ">MCQ</option>
                          <option value="Fill in the Blank">Fill in the Blank</option>
                          <option value="Diagram">Diagram</option>
                          <option value="Short Answer">Short Answer</option>
                          <option value="Long Answer">Long Answer</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Marks</label>
                        <select
                          value={newQuestionMarks}
                          onChange={(e) => setNewQuestionMarks(Number(e.target.value) as 4 | 6 | 8)}
                          className="w-full p-3 rounded-3xl bg-white dark:bg-neutral-900 text-sm font-black border border-neutral-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-500/20"
                        >
                          <option value={4}>4 Marker</option>
                          <option value={6}>6 Marker</option>
                          <option value={8}>8 Marker</option>
                        </select>
                      </div>
                      <div className="space-y-2 flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={handleAddAIQuestion}
                          disabled={isGenerating}
                          className="w-full py-3 rounded-3xl bg-primary-500 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-40"
                        >
                          {isGenerating ? 'Generating...' : 'AI Suggest Question'}
                        </button>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">AI generated or manual questions are both supported.</p>
                      </div>
                   </div>
                   <button type="button" onClick={handleAddQuestion} className="w-full py-8 md:py-10 border-2 md:border-4 border-dashed border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 text-[10px] md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.5em] hover:bg-primary-500 hover:text-white transition-all rounded-2xl md:rounded-3xl flex items-center justify-center gap-3 md:gap-4 group">
                      <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-125 transition-transform" /> Add Question
                   </button>
                </div>

                <div className="pt-4 md:pt-6 border-t border-neutral-200 dark:border-white/10 flex flex-col md:flex-row gap-3 md:gap-4 shrink-0 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl -mx-4 md:-mx-8 lg:-mx-10 -mb-4 md:-mb-8 lg:-mb-10 p-4 md:p-6 lg:p-8 md:pb-6">
                   <button onClick={() => handleDistribute('Exam')} className="flex-1 py-3 md:py-4 lg:py-5 bg-primary-500 text-white rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-[0.25em] md:tracking-[0.3em] shadow-lg md:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3">
                      <Send className="w-4 h-4 md:w-5 md:h-5" /> Distribute
                   </button>
                   <button type="button" onClick={handlePrintExam} className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 bg-neutral-900 text-white rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-[0.25em] md:tracking-[0.3em] flex items-center justify-center gap-2 md:gap-3 hover:bg-black transition-all active:scale-95">
                      <Printer className="w-4 h-4 md:w-5 md:h-5" /> Print
                   </button>
                </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 ml-1 opacity-90">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full p-4 md:p-6 glass-panel bg-white dark:bg-neutral-800 text-base font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all placeholder:text-neutral-200 dark:placeholder:text-neutral-700 border-none rounded-2xl"
      />
    </div>
  );
}

function UploadedItem({ name, time, type }: { name: string; time: string; type: 'pdf' | 'img' }) {
  return (
    <div className="p-3 md:p-5 glass-panel bg-white/60 dark:bg-neutral-800/40 border-neutral-100 dark:border-white/5 flex items-center justify-between group hover:bg-white dark:hover:bg-neutral-800 transition-all rounded-[1.5rem] shadow-sm">
       <div className="flex items-center gap-4 min-w-0">
          <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${type === 'pdf' ? 'bg-error-50 dark:bg-error-500/10' : 'bg-primary-50 dark:bg-primary-500/10'}`}>
             {type === 'pdf' ? <FileText className="w-5 h-5 text-error-600" /> : <ImageIcon className="w-5 h-5 text-primary-600" />}
          </div>
          <div className="min-w-0">
             <p className="text-[11px] font-black text-neutral-900 dark:text-neutral-100 leading-tight truncate px-1">{name}</p>
             <p className="text-[9px] font-black text-neutral-500 dark:text-neutral-500 uppercase tracking-widest mt-1 px-1 opacity-70">{time}</p>
          </div>
       </div>
       <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0 ml-4" />
    </div>
  );
}

function LoadingAI({ topic }: { topic: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <div className="relative">
        <div className="w-24 h-24 bg-primary-500 rounded-full animate-ping opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center">
           <BrainCircuit className="w-12 h-12 text-primary-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
         <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter">AI Prism is distilling "{topic}"</h3>
         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mt-2 opacity-90">Connecting cognitive parameters...</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: any) {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-6 text-center max-w-xs mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-neutral-200 dark:border-white/10">
        <Icon className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-black text-neutral-900 dark:text-white tracking-tight">{title}</p>
        <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 leading-relaxed uppercase tracking-widest">{text}</p>
      </div>
    </div>
  );
}

