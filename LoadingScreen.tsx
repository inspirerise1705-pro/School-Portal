'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const words = ['Schedule', 'Track', 'Teach'];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((current) => {
        if (current >= words.length - 1) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let rafId: number;

    const animate = (time: number) => {
      const elapsed = Math.min(time - start, 2700);
      const next = (elapsed / 2700) * 100;
      setProgress(next);

      if (elapsed < 2700) {
        rafId = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        window.setTimeout(() => {
          onCompleteRef.current?.();
        }, 400);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[var(--bg)] text-[var(--text)]"
      style={{
        '--bg': '#0a0a0a',
        '--text': '#f5f5f5',
        '--muted': '#888888',
        '--stroke': '#1f1f1f',
        fontFamily: '"Instrument Serif", serif',
      } as React.CSSProperties}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="absolute top-8 left-8 md:top-12 md:left-12 text-[var(--muted)] uppercase tracking-[0.3em]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="text-xs md:text-sm">EduCrystal</span>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIndex}
            className="text-4xl md:text-6xl lg:text-7xl italic text-[rgba(245,245,245,0.8)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {words[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-[var(--text)] tabular-nums"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="text-6xl md:text-8xl lg:text-9xl font-display tabular-nums">
          {Math.round(progress).toString().padStart(3, '0')}
        </span>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[rgba(31,31,31,0.5)]">
        <motion.div
          className="h-full origin-left"
          style={{
            background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
