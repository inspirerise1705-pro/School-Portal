'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, School, ArrowRight, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setIsAuthenticating(false);
      return;
    }

    onLogin();
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setRecoverySent(true);
    }

    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen w-screen overflow-hidden font-sans relative bg-[#030718] text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        playsInline
        autoPlay
        muted
        loop
        src="https://stream.mux.com/9gacyOXU51CrfBWuWJ6MGv6XK7k6Rj3S18L1NUNx2d7sBW5E.m3u8"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,21,0.88),rgba(5,8,18,0.96))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_25%)] pointer-events-none" />

      <motion.div
        key={view}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-4 sm:px-6 py-10"
      >
        <div className="w-full space-y-10 px-4 py-6 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.35em] text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <School className="h-5 w-5" />
              </div>
              InspireRise
            </div>
            <p className="max-w-xl text-sm text-white/70">
              Teacher access to campus workflows that feel polished, secure, and ready for every lesson.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.9fr] items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-primary-200">school portal</p>
                <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-[-0.04em] leading-[0.95]">
                  Bring your classroom workflows
                  <span className="block text-primary-300">into one premium hub.</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                  Sign in to access schedules, reports, curriculum planning, and student insights through a modern teacher dashboard.
                </p>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
              <div className="space-y-4 mb-6 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-primary-200">Welcome back</p>
                <h2 className="text-3xl font-black tracking-tight">Sign in to your portal</h2>
                <p className="text-sm text-white/70">Use your school email to continue to the teacher workspace.</p>
              </div>

              <AnimatePresence mode="wait">
                {view === 'login' ? (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/60 tracking-[0.35em] ml-1">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          required
                          placeholder="teacher@school.edu"
                          className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-12 py-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/10 transition"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-white/60 tracking-[0.35em] ml-1">Password</label>
                        <button
                          type="button"
                          onClick={() => { setView('forgot'); setError(''); }}
                          className="text-[10px] font-black uppercase text-primary-200 hover:text-primary-100 transition"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-12 py-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/10 transition"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full rounded-3xl bg-primary-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>Login <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="forgot-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {!recoverySent ? (
                      <form onSubmit={handleRecover} className="space-y-6">
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                          >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                          </motion.div>
                        )}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/60 tracking-[0.35em] ml-1">Recovery Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                              type="email"
                              required
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setError(''); }}
                              className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-12 py-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/10 transition"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isAuthenticating}
                          className="w-full rounded-3xl bg-primary-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-3"
                        >
                          {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Recovery Link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setView('login'); setError(''); }}
                          className="w-full rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                        >
                          Back to Login
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-6 text-center py-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                          <Mail className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-black">Check your email</h3>
                          <p className="text-sm text-white/70">Recovery instructions have been sent to your school email.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setView('login'); setRecoverySent(false); setError(''); }}
                          className="w-full rounded-3xl bg-white/10 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
                        >
                          Return to Login
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs uppercase tracking-[0.35em] text-white/50">
                InspireRise Secure Access
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
