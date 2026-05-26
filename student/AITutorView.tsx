'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Send, Zap, ChevronRight, Loader2, AlertCircle,
  BookOpen, Sparkles, ChevronDown, RefreshCw, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { askAITutor, TutorMessage } from '../geminiService';
import { CREDIT_COSTS } from '../types';
import type { StudentProfile, SubjectData, ChapterData } from '../types';
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('subjects').select('*').eq('school_id', student.school_id).order('name')
      .then(({ data }) => { if (data) setSubjects(data as SubjectData[]); });
  }, [student.school_id]);

  const loadChapters = async (subjectId: string) => {
    const { data } = await supabase
      .from('chapters').select('*').eq('subject_id', subjectId).order('number');
    setChapters((data ?? []) as ChapterData[]);
  };

  const selectSubject = async (s: SubjectData) => {
    setSelectedSubject(s);
    setSelectedChapter(null);
    setChapters([]);
    await loadChapters(s.id);
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
      const lastIdx = updated.findLastIndex(m => m.loading);
      if (lastIdx !== -1) updated[lastIdx] = { role: 'model', text: reply };
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI Tutor</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {canChat
                ? `${selectedSubject!.name} · ${selectedChapter!.name}`
                : 'Select a subject and chapter to start'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40">
              <Zap className="h-3 w-3 text-amber-400" /> {creditBalance} credits · {CREDIT_COSTS.AI_TUTOR_MESSAGE}/msg
            </span>
            <button
              onClick={() => setShowSubjectPanel(v => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/15 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {canChat ? 'Change' : 'Select Topic'}
            </button>
          </div>
        </div>
      </div>

      {/* Subject/Chapter panel (collapsible) */}
      <AnimatePresence>
        {showSubjectPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden shrink-0 border-y border-white/10 bg-black/10 px-4 sm:px-6 lg:px-8 py-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {/* Subject list */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2 font-bold">Subject</p>
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {subjects.map(s => (
                    <button
                      key={s.id}
                      onClick={() => selectSubject(s)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition ${
                        selectedSubject?.id === s.id ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-white/70 hover:bg-white/8'
                      }`}
                    >
                      <div className="h-5 w-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0"
                        style={{ background: `${s.color}30`, color: s.color }}>
                        {s.name[0]}
                      </div>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter list */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2 font-bold">Chapter</p>
                {!selectedSubject ? (
                  <p className="text-xs text-white/30 py-4 text-center">Select a subject first</p>
                ) : chapters.length === 0 ? (
                  <p className="text-xs text-white/30 py-4 text-center">No chapters set up</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {chapters.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectChapter(c)}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition ${
                          selectedChapter?.id === c.id ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-white/70 hover:bg-white/8'
                        }`}
                      >
                        <span className="h-5 w-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0 text-white/50">
                          {c.number}
                        </span>
                        {c.name}
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
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
            <div className="h-16 w-16 rounded-3xl bg-blue-500/20 flex items-center justify-center">
              <Bot className="h-8 w-8 text-blue-400" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black">Your AI Study Tutor</p>
              <p className="text-sm text-white/40 max-w-xs">
                Select a subject and chapter above to start asking questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-white/30">
              {['Explain this concept', 'Give me an example', 'Why does this happen?', 'Summarize this chapter'].map(s => (
                <span key={s} className="rounded-xl border border-white/10 px-3 py-1.5">{s}</span>
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black">Ready to help!</p>
              <p className="text-sm text-white/40">{selectedSubject!.name} · {selectedChapter!.name}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs max-w-sm">
              {[
                `What is ${selectedChapter!.name}?`,
                'Explain this with an example',
                'What are the key points?',
                'Give me a simple summary',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-white/50 hover:bg-white/8 hover:text-white transition"
                >
                  {s}
                </button>
              ))}
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
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10 bg-black/10 shrink-0">
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
            placeholder={canChat ? 'Ask anything about this chapter… (Enter to send)' : 'Select a topic first'}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/10 transition disabled:opacity-40 max-h-32 overflow-y-auto"
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
