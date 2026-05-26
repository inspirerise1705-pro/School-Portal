'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Moon, Sun, Palette, Zap, LogOut, Loader2,
  TrendingDown, TrendingUp, Clock, CreditCard, ChevronRight,
  GraduationCap, Hash, School
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { StudentProfile, CreditTransaction } from '../types';
import { WALLPAPERS, WallpaperType } from '../constants';
import CreditPurchaseModal from './CreditPurchaseModal';

interface Props {
  student:          StudentProfile;
  creditBalance:    number;
  deductCredits:    (amount: number, type: string, desc: string) => Promise<boolean>;
  addCredits:       (amount: number, name: string) => Promise<void>;
  session:          Session;
  isDark:           boolean;
  setIsDark:        (v: boolean) => void;
  currentWallpaper: WallpaperType;
  setWallpaper:     (w: WallpaperType) => void;
  onLogout:         () => void;
}

type SectionType = 'profile' | 'appearance' | 'credits' | 'account';

export default function StudentSettingsView({
  student, creditBalance, addCredits,
  session, isDark, setIsDark,
  currentWallpaper, setWallpaper,
  onLogout,
}: Props) {
  const [section, setSection]           = useState<SectionType>('profile');
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [txLoading, setTxLoading]       = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [loggingOut, setLoggingOut]     = useState(false);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setTransactions((data ?? []) as CreditTransaction[]);
    setTxLoading(false);
  }, [session.user.id]);

  useEffect(() => {
    if (section === 'credits') fetchTransactions();
  }, [section, fetchTransactions]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    onLogout();
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const sections: { key: SectionType; label: string; icon: React.ElementType }[] = [
    { key: 'profile',    label: 'Profile',    icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'credits',    label: 'Credits',    icon: Zap },
    { key: 'account',    label: 'Account',    icon: LogOut },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* Section nav */}
        <div className="lg:sticky lg:top-0 space-y-1 glass-card rounded-2xl border border-white/10 p-2 h-fit">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                section === key ? 'bg-blue-500 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {section !== key && <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/30" />}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* ── PROFILE ── */}
            {section === 'profile' && (
              <>
                <div className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6 flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl font-black text-blue-400 shrink-0">
                    {student.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-black truncate">{student.name}</p>
                    <p className="text-sm text-white/50 truncate">{session.user.email}</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-white/10 divide-y divide-white/5">
                  {[
                    { icon: School,       label: 'Class',       value: student.class ? `${student.class.name}${student.class.section ? ` – ${student.class.section}` : ''}` : '—' },
                    { icon: Hash,         label: 'Roll Number', value: student.roll_number ?? '—' },
                    { icon: GraduationCap, label: 'Student ID',  value: student.id?.slice(0, 8).toUpperCase() ?? '—' },
                    { icon: CreditCard,   label: 'Fees Status', value: student.fees_status === 'paid' ? 'Paid' : student.fees_status === 'overdue' ? 'Overdue' : 'Pending' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-4 px-5 py-4">
                      <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold">{label}</p>
                        <p className={`text-sm font-bold truncate mt-0.5 ${
                          label === 'Fees Status'
                            ? student.fees_status === 'paid' ? 'text-emerald-400' : student.fees_status === 'overdue' ? 'text-red-400' : 'text-amber-400'
                            : 'text-white/80'
                        }`}>{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── APPEARANCE ── */}
            {section === 'appearance' && (
              <>
                {/* Dark mode toggle */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon className="h-5 w-5 text-blue-400" /> : <Sun className="h-5 w-5 text-amber-400" />}
                    <div>
                      <p className="text-sm font-black">Dark Overlay</p>
                      <p className="text-xs text-white/40 mt-0.5">Dim the background for easier reading</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${isDark ? 'bg-blue-500' : 'bg-white/20'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Wallpaper picker */}
                <div className="glass-card rounded-2xl border border-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-black mb-4">Wallpaper Theme</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {WALLPAPERS.map(w => (
                      <button
                        key={w.id}
                        onClick={() => setWallpaper(w)}
                        className={`relative rounded-2xl overflow-hidden aspect-video border-2 transition ${
                          currentWallpaper.id === w.id ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-white/10 hover:border-white/25'
                        }`}
                        style={{
                          backgroundImage: `url(${w.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                          <p className="text-[10px] font-black text-white drop-shadow">{w.name}</p>
                        </div>
                        {currentWallpaper.id === w.id && (
                          <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-blue-400 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── CREDITS ── */}
            {section === 'credits' && (
              <>
                {/* Balance card */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      creditBalance > 50 ? 'bg-emerald-500/20' : creditBalance > 10 ? 'bg-amber-500/20' : 'bg-red-500/20'
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        creditBalance > 50 ? 'text-emerald-400' : creditBalance > 10 ? 'text-amber-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/40 font-black">Credit Balance</p>
                      <p className="text-2xl font-black mt-0.5">{creditBalance}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreditModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-black text-white hover:bg-blue-400 transition"
                  >
                    <Zap className="h-3.5 w-3.5" /> Get Credits
                  </button>
                </div>

                {/* Transaction history */}
                <div className="glass-card rounded-2xl border border-white/10">
                  <div className="px-5 py-4 border-b border-white/10">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Transaction History</p>
                  </div>
                  {txLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-white/30">
                      <Clock className="h-8 w-8 opacity-40" />
                      <p className="text-sm">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {transactions.map(tx => {
                        const isPositive = tx.credits_delta > 0;
                        return (
                          <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isPositive ? 'bg-emerald-500/15' : 'bg-red-500/15'
                            }`}>
                              {isPositive
                                ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                                : <TrendingDown className="h-4 w-4 text-red-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">
                                {tx.description ?? tx.action_type}
                              </p>
                              <p className="text-[11px] text-white/35 mt-0.5">{fmtDate(tx.created_at)}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{tx.credits_delta}
                              </p>
                              <p className="text-[10px] text-white/30">{tx.balance_after} left</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── ACCOUNT ── */}
            {section === 'account' && (
              <>
                <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-black mb-2">Account Info</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                        <span className="text-xs text-white/50">Email</span>
                        <span className="text-sm font-bold text-white/70 truncate max-w-[200px]">{session.user.email}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                        <span className="text-xs text-white/50">Role</span>
                        <span className="text-sm font-bold text-blue-400">Student</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                        <span className="text-xs text-white/50">Member since</span>
                        <span className="text-sm font-bold text-white/70">
                          {fmtDate(session.user.created_at ?? new Date().toISOString())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-red-500/20 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-black mb-3">Sign Out</p>
                  <p className="text-sm text-white/40 mb-4">
                    You'll need to sign in again to access your workspace.
                  </p>
                  <motion.button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-2xl bg-red-500/15 border border-red-500/25 px-5 py-3 text-sm font-black text-red-400 hover:bg-red-500/25 transition disabled:opacity-50 w-full sm:w-auto justify-center"
                  >
                    {loggingOut
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <LogOut className="h-4 w-4" />
                    }
                    Sign Out
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CreditPurchaseModal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        creditBalance={creditBalance}
        userId={session.user.id}
        schoolId={student.school_id}
        onCreditsAdded={(bal) => { addCredits(bal - creditBalance, 'package'); setShowCreditModal(false); }}
        reason="Top up your credits to use AI features"
      />
    </div>
  );
}
