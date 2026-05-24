'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const headingLines = [
  'Build the future',
  'of learning',
  'with Scrolls School',
];

const splitTextVariants = {
  hidden: { opacity: 0, y: 24, skewY: 6 },
  visible: { opacity: 1, y: 0, skewY: 0 },
};

export default function LoginHero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040506] text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        playsInline
        autoPlay
        muted
        loop
        src="https://stream.mux.com/9gacyOXU51CrfBWuWJ6MGv6XK7k6Rj3S18L1NUNx2d7sBW5E.m3u8"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05080d] via-[#05080d]/90 to-[#0e1724]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_32%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] items-center px-6 py-10 lg:px-14">
        <div className="w-full max-w-2xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.35em] text-white/80 shadow-[0_15px_45px_rgba(0,0,0,0.18)] backdrop-blur"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            Scrolls School
          </motion.div>

          <div className="space-y-4">
            {headingLines.map((line, index) => (
              <motion.h1
                key={line}
                className="text-4xl leading-[1.05] tracking-[-0.03em] md:text-6xl lg:text-[5.1rem]"
                initial="hidden"
                animate="visible"
                variants={splitTextVariants}
                transition={{ duration: 0.7, delay: 0.18 + index * 0.08, ease: [0.4, 0, 0.2, 1] }}
                style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic' }}
              >
                {line}
              </motion.h1>
            ))}
          </div>

          <motion.p
            className="max-w-xl text-base leading-8 text-white/75 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            Launch your campus experience with beautiful workflow tools, milestone tracking, and student-facing dashboards that feel premium from the first touch.
          </motion.p>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <a
              href="#login"
              className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_20px_60px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Get started
            </a>
            <a
              href="#demo"
              className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90 transition hover:border-white/40 hover:bg-white/10"
            >
              Watch demo
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
