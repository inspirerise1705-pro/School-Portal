'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, CheckCircle2, Loader2, Send, Star, Sparkles, Shield, Infinity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CreditPackage } from '../types';

interface Props {
  open:           boolean;
  onClose:        () => void;
  creditBalance:  number;
  userId:         string;
  schoolId:       string;
  onCreditsAdded: (newBalance: number) => void;
  reason?:        string;
  insufficientFor?: number;
}

const PKG_CONFIG = [
  {
    gradient:   'from-slate-700/80 to-slate-800/80',
    ring:       'ring-white/10',
    badge:      null,
    badgeCls:   '',
    perks:      ['AI Tutor — 50 chats', 'Self-Practice — 10 sets', 'Today\'s Focus — 50x'],
  },
  {
    gradient:   'from-blue-600/80 to-blue-800/80',
    ring:       'ring-blue-400/40',
    badge:      'Most Popular',
    badgeCls:   'bg-blue-400 text-white',
    perks:      ['AI Tutor — 200 chats', 'Self-Practice — 40 sets', 'Today\'s Focus — 200x'],
  },
  {
    gradient:   'from-violet-600/80 to-violet-800/80',
    ring:       'ring-violet-400/40',
    badge:      'Best Value',
    badgeCls:   'bg-violet-400 text-white',
    perks:      ['AI Tutor — 500 chats', 'Self-Practice — 100 sets', 'Today\'s Focus — 500x'],
  },
  {
    gradient:   'from-amber-600/80 to-orange-700/80',
    ring:       'ring-amber-400/40',
    badge:      'Unlimited',
    badgeCls:   'bg-amber-400 text-slate-900',
    perks:      ['Unlimited AI Tutor', 'Unlimited Self-Practice', 'Unlimited Focus'],
  },
];

export default function CreditPurchaseModal({
  open, onClose, creditBalance, userId, schoolId,
  onCreditsAdded, reason, insufficientFor,
}: Props) {
  const [packages, setPackages]       = useState<CreditPackage[]>([]);
  const [loading, setLoading]         = useState(true);
  const [buying, setBuying]           = useState<string | null>(null);
  const [successPkg, setSuccessPkg]   = useState<CreditPackage | null>(null);
  const [newBalance, setNewBalance]   = useState<number | null>(null);
  const [requesting, setRequesting]   = useState(false);
  const [requested, setRequested]     = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [activeView, setActiveView]   = useState<'buy' | 'request'>('buy');

  const DEMO_PACKAGES: CreditPackage[] = [
    { id: 'demo-1', name: 'Starter',   credits: 50,   price_inr: 49,  is_active: true },
    { id: 'demo-2', name: 'Standard',  credits: 200,  price_inr: 149, is_active: true },
    { id: 'demo-3', name: 'Pro',       credits: 500,  price_inr: 299, is_active: true },
    { id: 'demo-4', name: 'Unlimited', credits: 9999, price_inr: 499, is_active: true },
  ];

  useEffect(() => {
    if (!open) return;
    setSuccessPkg(null);
    setNewBalance(null);
    setRequested(false);
    setRequestNote('');
    setActiveView('buy');
    setLoading(true);
    supabase.from('credit_packages').select('*').eq('is_active', true).order('credits')
      .then(({ data }) => {
        setPackages(data?.length ? (data as CreditPackage[]) : DEMO_PACKAGES);
        setLoading(false);
      });
  }, [open]);

  const handleBuy = async (pkg: CreditPackage) => {
    setBuying(pkg.id);

    // Ensure user_credit_balances row exists for first-time users
    const { data: existing } = await (supabase as any)
      .from('user_credit_balances').select('id').eq('user_id', userId).maybeSingle();
    if (!existing) {
      await (supabase as any).from('user_credit_balances').insert({
        user_id: userId, school_id: schoolId, balance: 0,
        total_allocated: 0, total_used: 0,
      });
    }

    // Optimistic balance — parent's addCredits() will call the RPC to persist
    const optimisticBal = creditBalance + (pkg.credits >= 9999 ? 9999 : pkg.credits);
    onCreditsAdded(optimisticBal);
    setNewBalance(optimisticBal);
    setSuccessPkg(pkg);
    setBuying(null);
  };

  const handleRequest = async () => {
    if (!requestNote.trim()) return;
    setRequesting(true);
    await (supabase as any).from('credit_requests').insert({
      user_id: userId, school_id: schoolId,
      credits_requested: insufficientFor ?? 50,
      note: requestNote.trim(), status: 'pending',
    });
    setRequesting(false);
    setRequested(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative z-10 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden max-h-[92vh] flex flex-col"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(30,27,75,0.97) 100%)' }}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-white/10 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 pointer-events-none" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white">AI Credits</h2>
                    {reason && <p className="text-xs text-amber-400/90 mt-0.5">{reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Live balance */}
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Balance</p>
                    <p className={`text-2xl font-black leading-none ${
                      (newBalance ?? creditBalance) <= 10 ? 'text-amber-400' : 'text-white'
                    }`}>
                      {newBalance ?? creditBalance}
                      <span className="text-xs text-white/40 ml-1">cr</span>
                    </p>
                  </div>
                  <button onClick={onClose}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white hover:bg-white/15 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white/5 rounded-xl p-1 mt-4">
                {(['buy', 'request'] as const).map(v => (
                  <button key={v} onClick={() => setActiveView(v)}
                    className={`flex-1 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition ${
                      activeView === v ? 'bg-blue-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
                    }`}>
                    {v === 'buy' ? '⚡ Buy Credits' : '📩 Request from Admin'}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">

              {/* ── BUY VIEW ── */}
              {activeView === 'buy' && (
                <>
                  {successPkg ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-5 py-10 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                      >
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                      </motion.div>
                      <div>
                        <p className="text-2xl font-black text-white">
                          +{successPkg.credits >= 9000 ? '∞' : successPkg.credits} credits added!
                        </p>
                        <p className="text-sm text-white/50 mt-1">
                          New balance: <span className="font-black text-white">{newBalance} credits</span>
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        <button onClick={onClose}
                          className="rounded-2xl bg-blue-500 hover:bg-blue-400 px-8 py-3 text-sm font-black text-white transition">
                          Start Using AI ✨
                        </button>
                        <button onClick={() => setSuccessPkg(null)}
                          className="rounded-2xl bg-white/10 hover:bg-white/15 px-6 py-3 text-sm font-black text-white/70 transition">
                          Buy More
                        </button>
                      </div>
                    </motion.div>
                  ) : loading ? (
                    <div className="flex justify-center py-14">
                      <Loader2 className="h-7 w-7 animate-spin text-white/30" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {packages.map((pkg, i) => {
                          const cfg   = PKG_CONFIG[i % PKG_CONFIG.length];
                          const perCr = pkg.credits >= 9000 ? null : (pkg.price_inr / pkg.credits).toFixed(2);
                          const isBuying = buying === pkg.id;
                          return (
                            <motion.div key={pkg.id} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                              className={`relative rounded-2xl bg-gradient-to-br ${cfg.gradient} ring-1 ${cfg.ring} p-4 flex flex-col gap-3 overflow-hidden cursor-pointer`}
                              onClick={() => !buying && handleBuy(pkg)}
                            >
                              {/* Glow */}
                              <div className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15), transparent 60%)' }} />

                              {/* Badge */}
                              {cfg.badge && (
                                <span className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ${cfg.badgeCls}`}>
                                  <Star className="h-2.5 w-2.5" /> {cfg.badge}
                                </span>
                              )}

                              {/* Credits */}
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/60">{pkg.name}</p>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                  {pkg.credits >= 9000
                                    ? <Infinity className="h-8 w-8 text-white font-black" />
                                    : <span className="text-3xl font-black text-white">{pkg.credits}</span>
                                  }
                                  <span className="text-sm text-white/60 font-semibold">credits</span>
                                </div>
                                {perCr && (
                                  <p className="text-[10px] text-white/40 mt-0.5">₹{perCr} per credit</p>
                                )}
                                {pkg.credits >= 9000 && (
                                  <p className="text-xs text-white/50 mt-0.5">Unlimited for 30 days</p>
                                )}
                              </div>

                              {/* Perks */}
                              <div className="space-y-1">
                                {cfg.perks.map((p, j) => (
                                  <p key={j} className="text-[11px] text-white/60 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                                    {p}
                                  </p>
                                ))}
                              </div>

                              {/* Price + CTA */}
                              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                                <p className="text-xl font-black text-white">₹{pkg.price_inr}</p>
                                <motion.button
                                  onClick={e => { e.stopPropagation(); if (!buying) handleBuy(pkg); }}
                                  disabled={!!buying}
                                  whileTap={{ scale: 0.94 }}
                                  className="rounded-xl bg-white text-slate-900 px-4 py-2 text-xs font-black hover:bg-white/90 transition disabled:opacity-60 flex items-center gap-1.5 shadow-lg"
                                >
                                  {isBuying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                  {isBuying ? 'Adding…' : 'Purchase'}
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-white/30">
                        <Shield className="h-3.5 w-3.5" />
                        Demo mode — credits are added instantly. No real payment.
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── REQUEST VIEW ── */}
              {activeView === 'request' && (
                <>
                  {requested ? (
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-5 py-10 text-center">
                      <div className="h-20 w-20 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Send className="h-10 w-10 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-black">Request Sent!</p>
                        <p className="text-sm text-white/50 mt-1">Your admin will review and approve it. You'll be notified once done.</p>
                      </div>
                      <button onClick={onClose}
                        className="rounded-2xl bg-blue-500 hover:bg-blue-400 px-8 py-3 text-sm font-black text-white transition">
                        Got it
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex gap-3">
                        <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-white/60 leading-relaxed">
                          Send a request to your school admin to allocate more AI credits. They'll review and approve it — you'll be notified.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-black">Your message</label>
                        <textarea
                          value={requestNote}
                          onChange={e => setRequestNote(e.target.value)}
                          rows={4}
                          placeholder="e.g. I need credits to use the AI Tutor for my upcoming exams."
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition"
                        />
                      </div>
                      <motion.button
                        onClick={handleRequest}
                        disabled={!requestNote.trim() || requesting}
                        whileTap={{ scale: 0.97 }}
                        className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 py-3.5 text-sm font-black text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send Request to Admin
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
