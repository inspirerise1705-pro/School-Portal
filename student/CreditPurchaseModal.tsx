'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, CheckCircle2, Loader2, Send, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CreditPackage } from '../types';

interface CreditPurchaseModalProps {
  open:          boolean;
  onClose:       () => void;
  creditBalance: number;
  userId:        string;
  schoolId:      string;
  onCreditsAdded: (newBalance: number) => void;
  reason?:       string;        // e.g. "This action costs 5 credits"
  insufficientFor?: number;     // cost that triggered this modal
}

const PACKAGE_STYLES = [
  { gradient: 'from-slate-500/30 to-slate-600/20', badge: null },
  { gradient: 'from-blue-500/30 to-blue-600/20',   badge: 'Popular' },
  { gradient: 'from-violet-500/30 to-violet-600/20', badge: 'Best Value' },
  { gradient: 'from-amber-500/30 to-amber-600/20',  badge: 'Unlimited' },
];

export default function CreditPurchaseModal({
  open,
  onClose,
  creditBalance,
  userId,
  schoolId,
  onCreditsAdded,
  reason,
  insufficientFor,
}: CreditPurchaseModalProps) {
  const [packages, setPackages]     = useState<CreditPackage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [buying, setBuying]         = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested]   = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [activeView, setActiveView] = useState<'buy' | 'request'>('buy');

  useEffect(() => {
    if (!open) return;
    setSuccess(null);
    setRequested(false);
    setRequestNote('');
    setActiveView('buy');
    supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('credits')
      .then(({ data }) => {
        if (data) setPackages(data as CreditPackage[]);
        setLoading(false);
      });
  }, [open]);

  const handleBuy = async (pkg: CreditPackage) => {
    setBuying(pkg.id);
    const { data } = await supabase.rpc('add_credits', {
      p_user_id:     userId,
      p_amount:      pkg.credits,
      p_description: `Purchased: ${pkg.name} (${pkg.credits} credits)`,
    });
    if (data && data !== -1) {
      onCreditsAdded(data as number);
      setSuccess(`${pkg.credits} credits added to your account!`);
    }
    setBuying(null);
  };

  const handleRequest = async () => {
    if (!requestNote.trim()) return;
    setRequesting(true);
    await supabase.from('credit_requests').insert({
      user_id:           userId,
      school_id:         schoolId,
      credits_requested: insufficientFor ?? 50,
      note:              requestNote.trim(),
      status:            'pending',
    });
    // Notify admin (best effort)
    await supabase.from('notifications').insert({
      school_id:    schoolId,
      recipient_id: userId,
      type:         'credit_low',
      title:        'Credit Request Sent',
      message:      'Your request has been sent to the admin. You will be notified once approved.',
    }).catch(() => null);
    setRequesting(false);
    setRequested(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full sm:max-w-lg glass-card rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">AI Credits</h2>
                </div>
                <p className="text-sm text-white/50">
                  Current balance: <span className="font-bold text-white">{creditBalance} credits</span>
                  {insufficientFor ? ` · Need ${insufficientFor} more` : ''}
                </p>
                {reason && (
                  <p className="text-xs text-amber-400/80 mt-1">{reason}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
              {(['buy', 'request'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition ${
                    activeView === v
                      ? 'bg-blue-500 text-white shadow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {v === 'buy' ? 'Buy Credits' : 'Request from Admin'}
                </button>
              ))}
            </div>

            {/* Buy view */}
            {activeView === 'buy' && (
              <>
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-lg font-black">{success}</p>
                      <p className="text-sm text-white/50 mt-1">Your credits are ready to use.</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-2xl bg-blue-500 px-8 py-3 text-sm font-black text-white hover:bg-blue-400 transition"
                    >
                      Start Using AI
                    </button>
                  </motion.div>
                ) : loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packages.map((pkg, i) => {
                      const style = PACKAGE_STYLES[i % PACKAGE_STYLES.length];
                      return (
                        <motion.div
                          key={pkg.id}
                          whileHover={{ scale: 1.02 }}
                          className={`relative rounded-2xl border border-white/10 bg-gradient-to-br ${style.gradient} p-4 flex flex-col gap-3`}
                        >
                          {style.badge && (
                            <span className="absolute -top-2 left-4 flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                              <Star className="h-2.5 w-2.5" /> {style.badge}
                            </span>
                          )}
                          <div>
                            <p className="text-base font-black">{pkg.name}</p>
                            <p className="text-2xl font-black text-white mt-1">
                              {pkg.credits >= 9000 ? '∞' : pkg.credits}
                              <span className="text-sm font-semibold text-white/50 ml-1">credits</span>
                            </p>
                            {pkg.credits >= 9000 && (
                              <p className="text-xs text-white/40">Unlimited for 30 days</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-lg font-black text-emerald-400">₹{pkg.price_inr}</p>
                            <motion.button
                              onClick={() => handleBuy(pkg)}
                              disabled={!!buying}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-xl bg-white text-slate-900 px-4 py-2 text-xs font-black hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {buying === pkg.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : null}
                              Purchase
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                <p className="text-center text-[11px] text-white/30 mt-4">
                  Payments are processed securely. Credits are added instantly.
                </p>
              </>
            )}

            {/* Request view */}
            {activeView === 'request' && (
              <>
                {requested ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Send className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-black">Request Sent!</p>
                      <p className="text-sm text-white/50 mt-1">Your admin will be notified. You'll get credits once approved.</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-2xl bg-blue-500 px-8 py-3 text-sm font-black text-white hover:bg-blue-400 transition"
                    >
                      Got it
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60 leading-relaxed">
                      Send a request to your school admin to allocate more AI credits to your account.
                      They will review and approve it.
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold">
                        Your message to admin
                      </label>
                      <textarea
                        value={requestNote}
                        onChange={e => setRequestNote(e.target.value)}
                        rows={3}
                        placeholder="e.g. I need credits for AI Tutor to prepare for upcoming exams."
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition"
                      />
                    </div>
                    <motion.button
                      onClick={handleRequest}
                      disabled={!requestNote.trim() || requesting}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-2xl bg-blue-500 py-3.5 text-sm font-black text-white hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Request
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
