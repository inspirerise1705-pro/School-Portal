'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface BlurTextProps {
  text: string;
  direction?: 'bottom' | 'top';
  delayStep?: number;
}

export default function BlurText({ text, direction = 'bottom', delayStep = 0.14 }: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const words = useMemo(() => text.split(' ').filter(Boolean), [text]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-wrap justify-center overflow-hidden">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block whitespace-nowrap pr-2 text-left"
          initial={{ opacity: 0, y: direction === 'bottom' ? 50 : -50, filter: 'blur(10px)' }}
          animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
          transition={{ duration: 0.75, delay: index * delayStep, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
