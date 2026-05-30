'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import LoadingScreen from './LoadingScreen';

export default function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        ) : null}
      </AnimatePresence>

      <motion.div
        key="app"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 16 : 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="relative"
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        <div className="mx-auto max-w-6xl px-6 py-10 text-center">
          <h1 className="text-3xl font-semibold">InspireRise dashboard ready</h1>
          <p className="mt-4 text-slate-300">Your learning environment appears after the branded loader completes.</p>
        </div>
      </motion.div>
    </div>
  );
}
