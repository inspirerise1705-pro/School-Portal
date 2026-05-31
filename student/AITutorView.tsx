'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Send, Zap, ChevronRight, Loader2, AlertCircle,
  BookOpen, Sparkles, ChevronDown, RefreshCw, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dedupSubjects } from '../lib/dedupSubjects';
import { askAITutor, TutorMessage } from '../geminiService';
import { CREDIT_COSTS } from '../types';
import type { StudentProfile, SubjectData, ChapterData } from '../types';
import { DUMMY_SUBJECTS, DUMMY_CHAPTERS } from './dummyStudentData';
import CreditPurchaseModal from './CreditPurchaseModal';

interface Props {
  student:       StudentProfile;
  creditBalance: number;
  deductCredits: (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:    (amount: number, name: string) => Promise<void>;
}

interface ChatMessage {
  role:    'user' | 'model';
  text:    string;
  loading?: boolean;
}

export default function AITutorView({ student, creditBalance, deductCredits, addCredits }: Props) {
  const [subjects, setSubjects]         = useState<SubjectData[]>([]);
  const [chapters, setChapters]         = useState<ChapterData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterData | null>(null);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [input, setInput]               = useState('');
  const [sending, setSending]           = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSubjectPanel, setShowSubjectPanel] = useState(true);
  const [mobileTab, setMobileTab]       = useState<'subject' | 'chapter'>('subject');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('subjects').select('*').eq('school_id', student.school_id).order('name')
      .then(({ data }) => { setSubjects(dedupSubjects(data?.length ? (data as SubjectData[]) : DUMMY_SUBJECTS)); });
  }, [student.school_id]);

  const loadChapters = async (subjectId: string, subjectName: string) => {
    const { data } = await supabase
      .from('chapters').select('*').eq('subject_id', subjectId).order('number');
    if (data?.length) { setChapters(data as ChapterData[]); return; }
    const dummySub = DUMMY_SUBJECTS.find(s => s.name === subjectName);
    setChapters(dummySub ? DUMMY_CHAPTERS.filter(c => c.subject_id === dummySub.id) : []);
  };

  const selectSubject = async (s: SubjectData) => {
    setSelectedSubject(s);
    setSelectedChapter(null);
    setChapters([]);
    await loadChapters(s.id, s.name);
  };

  const selectChapter = (c: ChapterData) => {
    setSelectedChapter(c);
    setMessages([]);
    setShowSubjectPanel(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    if (!selectedSubject || !selectedChapter) return;

    const cost = CREDIT_COSTS.AI_TUTOR_MESSAGE;
    if (creditBalance < cost) {
      setShowCreditModal(true);
      return;
    }

    const ok = await deductCredits(cost, 'ai_tutor', `AI Tutor: ${selectedSubject.name} - ${selectedChapter.name}`);
    if (!ok) { setShowCreditModal(true); return; }

    const userText = input.trim();
    setInput('');
    setSending(true);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: userText },
      { role: 'model', text: '', loading: true },
    ];
    setMessages(newMessages);

    // Build history for API (exclude loading placeholder)
    const history: TutorMessage[] = messages.map(m => ({ role: m.role as 'user' | 'model', text: m.text }));
    history.push({ role: 'user', text: userText });

    const reply = await askAITutor(history, selectedSubject.name, selectedChapter.name);

    setMessages(prev => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].loading) { updated[i] = { role: 'model', text: reply }; break; }
      }
      return updated;
    });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canChat = selectedSubject && selectedChapter;

  const handleSelectSubject = async (s: SubjectData) => {
    await selectSubject(s);
    setMobileTab('chapter');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI Tutor</h1>
            <p className="text-sm text-white/60 mt-0.5">
              {canChat
                ? `${selectedSubject!.name} · ${selectedChapter!.name}`
                : 'Select a subject and chapter to start'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white/70 font-semibold">
              <Zap className="h-3 w-3 text-amber-400" /> {creditBalance} credits · {CREDIT_COSTS.AI_TUTOR_MESSAGE}/msg
            </span>
            <button
              onClick={() => setShowSubjectPanel(v => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-black/50 border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/70 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {canChat ? 'Change Topic' : 'Select Topic'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile: Bottom Sheet ── */}
      <AnimatePresence>
        {showSubjectPanel && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSubjectPanel(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute bottom-0 left-0 right-0 bg-neutral-950 border-t border-white/10 rounded-t-3xl flex flex-col"
              style={{ maxHeight: '72vh' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              {/* Title + tabs */}
              <div className="px-5 pt-2 pb-3 shrink-0">
                <p className="text-base font-black text-white mb-3">Select Topic</p>
                <div className="flex rounded-xl bg-white/8 p-1 gap-1">
                  <button
                    onClick={() => setMobileTab('subject')}
                    className={`flex-1 rounded-lg py-2 text-xs font-black transition ${mobileTab === 'subject' ? 'bg-blue-500 text-white shadow' : 'text-white/50'}`}
                  >
                    Subject{selectedSubject ? ` · ${selectedSubject.name}` : ''}
                  </button>
                  <button
                    onClick={() => selectedSubject && setMobileTab('chapter')}
                    className={`flex-1 rounded-lg py-2 text-xs font-black transition ${mobileTab === 'chapter' ? 'bg-blue-500 text-white shadow' : 'text-white/50'} ${!selectedSubject ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    Chapter{selectedChapter ? ` · Ch.${selectedChapter.number}` : ''}
                  </button>
                </div>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2">
                {mobileTab === 'subject' ? subjects.map(s => (
                  <button key={s.id} onClick={() => handleSelectSubject(s)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-left transition active:scale-[0.98] ${
                      selectedSubject?.id === s.id ? 'bg-blue-500/25 border border-blue-400/40 text-white' : 'bg-white/6 border border-white/8 text-white/85 hover:bg-white/10'
                    }`}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center font-black shrink-0"
                      style={{ background: `${s.color}35`, color: s.color }}>{s.name[0]}</div>
                    <span className="font-semibold">{s.name}</span>
                    {selectedSubject?.id === s.id && <ChevronRight className="h-4 w-4 ml-auto text-blue-400" />}
                  </button>
                )) : !selectedSubject ? (
                  <p className="text-sm text-white/40 py-8 text-center">Select a subject first</p>
                ) : chapters.length === 0 ? (
                  <p className="text-sm text-white/40 py-8 text-center">No chapters set up</p>
                ) : chapters.map(c => (
                  <button key={c.id} onClick={() => selectChapter(c)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-left transition active:scale-[0.98] ${
                      selectedChapter?.id === c.id ? 'bg-blue-500/25 border border-blue-400/40 text-white' : 'bg-white/6 border border-white/8 text-white/85 hover:bg-white/10'
                    }`}>
                    <span className="h-8 w-8 rounded-xl bg-white/12 flex items-center justify-center text-xs font-black shrink-0 text-white">{c.number}</span>
                    <span className="font-semibold">{c.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Desktop: Inline collapsible panel ── */}
      <AnimatePresence>
        {showSubjectPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="hidden sm:block overflow-hidden shrink-0 border-y border-white/15 bg-black/75 backdrop-blur-xl px-6 lg:px-8 py-4"
          >
            <div className="grid grid-cols-2 gap-6 max-w-2xl">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-2.5 font-black">Subject</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => selectSubject(s)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-left transition ${
                        selectedSubject?.id === s.id ? 'bg-blue-500/30 text-white border border-blue-400/30' : 'bg-white/8 text-white/90 border border-white/10 hover:bg-white/15'
                      }`}>
                      <div className="h-6 w-6 rounded-md flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: `${s.color}40`, color: s.color }}>{s.name[0]}</div>
                      <span className="font-semibold">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-2.5 font-black">Chapter</p>
                {!selectedSubject ? (
                  <p className="text-sm text-white/50 py-4 text-center">Select a subject first</p>
                ) : chapters.length === 0 ? (
                  <p className="text-sm text-white/50 py-4 text-center">No chapters set up</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {chapters.map(c => (
                      <button key={c.id} onClick={() => selectChapter(c)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-left transition ${
                          selectedChapter?.id === c.id ? 'bg-blue-500/30 text-white border border-blue-400/30' : 'bg-white/8 text-white/90 border border-white/10 hover:bg-white/15'
                        }`}>
                        <span className="h-6 w-6 rounded-md bg-white/15 flex items-center justify-center text-[10px] font-black shrink-0 text-white">{c.number}</span>
                        <span className="font-semibold">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-4 space-y-4 min-h-0">
        {!canChat ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-black/65 backdrop-blur-xl border border-white/15 rounded-3xl px-8 py-10 flex flex-col items-center gap-5 text-center max-w-sm w-full mx-4">
              <div className="h-16 w-16 rounded-3xl bg-blue-500/25 border border-blue-400/20 flex items-center justify-center">
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-white">Your AI Study Tutor</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Pick a subject &amp; chapter above to begin.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Explain this concept', 'Give me an example', 'Why does this happen?', 'Summarize this chapter'].map(s => (
                  <span key={s} className="rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white/80">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-black/65 backdrop-blur-xl border border-white/15 rounded-3xl px-8 py-10 flex flex-col items-center gap-5 text-center max-w-sm w-full mx-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/25 border border-blue-400/20 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-white">Ready to help!</p>
                <p className="text-sm text-white/70">{selectedSubject!.name} · {selectedChapter!.name}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  `What is ${selectedChapter!.name}?`,
                  'Explain this with an example',
                  'What are the key points?',
                  'Give me a simple summary',
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20 hover:text-white transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="h-8 w-8 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'glass-card border border-white/10 text-white/85 rounded-bl-sm'
                  }`}>
                    {msg.loading ? (
                      <div className="flex gap-1 py-1">
                        {[0, 0.15, 0.3].map((delay, j) => (
                          <motion.div
                            key={j}
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay }}
                            className="h-2 w-2 rounded-full bg-blue-400"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                      {student.name[0]}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/15 bg-black/70 backdrop-blur-xl shrink-0">
        {creditBalance < CREDIT_COSTS.AI_TUTOR_MESSAGE && (
          <div className="flex items-center justify-between rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2 mb-3 text-xs text-red-400">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Not enough credits
            </span>
            <button onClick={() => setShowCreditModal(true)} className="font-black underline">Get Credits</button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canChat || sending}
            rows={1}
            placeholder={canChat ? 'Ask a question… (Enter to send)' : 'Select a topic first'}
            className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 resize-none focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/10 transition disabled:opacity-40 max-h-32 overflow-y-auto"
            style={{ height: '44px' }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = '44px';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || !canChat || sending || creditBalance < CREDIT_COSTS.AI_TUTOR_MESSAGE}
            whileTap={{ scale: 0.93 }}
            className="h-11 w-11 flex items-center justify-center rounded-2xl bg-blue-500 text-white hover:bg-blue-400 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </motion.button>
        </div>
        <p className="text-[10px] text-white/25 mt-1.5 text-center">
          1 credit per message · {creditBalance} remaining
        </p>
      </div>

      <CreditPurchaseModal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        creditBalance={creditBalance}
        userId={student.user_id}
        schoolId={student.school_id}
        onCreditsAdded={(bal) => { addCredits(bal - creditBalance, 'package'); setShowCreditModal(false); }}
        reason="You need credits to chat with the AI Tutor"
        insufficientFor={CREDIT_COSTS.AI_TUTOR_MESSAGE}
      />
    </div>
  );
}
