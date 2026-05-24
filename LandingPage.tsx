'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Play, Zap, Palette, BarChart3, Shield } from 'lucide-react';
import BlurText from '@/BlurText';

const heroVideoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';
const startVideoUrl = 'https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8';
const statsVideoUrl = 'https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8';
const ctaVideoUrl = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';

const partnerNames = ['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'];

const features = [
  {
    title: 'Designed to convert. Built to perform.',
    text: 'Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.',
    gif: 'https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif',
    reverse: false,
  },
  {
    title: 'It gets smarter. Automatically.',
    text: 'Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.',
    gif: 'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
    reverse: true,
  },
];

const whyCards = [
  {
    icon: Zap,
    title: 'Days, Not Months',
    text: 'Concept to launch at a pace that redefines fast. Because waiting isn’t a strategy.',
  },
  {
    icon: Palette,
    title: 'Obsessively Crafted',
    text: 'Every detail considered. Every element refined. Design so precise, it feels inevitable.',
  },
  {
    icon: BarChart3,
    title: 'Built to Convert',
    text: 'Layouts informed by data. Decisions backed by performance. Results you can measure.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    text: 'Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included.',
  },
];

const testimonials = [
  {
    quote: 'A complete rebuild in five days. The result outperformed everything we’d spent months building before.',
    name: 'Sarah Chen',
    role: 'CEO, Luminary',
  },
  {
    quote: 'Conversions up 4x. That’s not a typo. The design just works differently when it’s built on real data.',
    name: 'Marcus Webb',
    role: 'Head of Growth, Arcline',
  },
  {
    quote: 'They didn’t just design our site. They defined our brand. World-class doesn’t begin to cover it.',
    name: 'Elena Voss',
    role: 'Brand Director, Helix',
  },
];

function useHlsVideo(videoRef: React.RefObject<HTMLVideoElement>, source: string) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: any;

    const attachSource = async () => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        try {
          const hlsModule = await import('hls.js');
          const HlsLib = hlsModule.default;
          if (HlsLib.isSupported()) {
            hls = new HlsLib();
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        } catch {
          video.src = source;
        }
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play().catch(() => undefined);
    };

    attachSource();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [source, videoRef]);
}

export default function LandingPage() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const startVideoRef = useRef<HTMLVideoElement>(null);
  const statsVideoRef = useRef<HTMLVideoElement>(null);
  const ctaVideoRef = useRef<HTMLVideoElement>(null);
  const [heroOpacity, setHeroOpacity] = useState(0);

  useHlsVideo(startVideoRef, startVideoUrl);
  useHlsVideo(statsVideoRef, statsVideoUrl);
  useHlsVideo(ctaVideoRef, ctaVideoUrl);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    let rafId: number;

    const updateOpacity = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        rafId = requestAnimationFrame(updateOpacity);
        return;
      }

      const fadeInEnd = 0.5;
      const fadeOutStart = Math.max(video.duration - 0.5, 0);
      const current = video.currentTime;
      let nextOpacity = 1;

      if (current < fadeInEnd) {
        nextOpacity = current / fadeInEnd;
      } else if (current > fadeOutStart) {
        nextOpacity = Math.max(0, (video.duration - current) / 0.5);
      }

      setHeroOpacity(nextOpacity);
      rafId = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      setHeroOpacity(0);
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => undefined);
    rafId = requestAnimationFrame(updateOpacity);

    return () => {
      video.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const navLinks = useMemo(
    () => ['Home', 'Services', 'Work', 'Process', 'Pricing'],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_40%)] opacity-80 pointer-events-none" />
      <motion.div
        className="absolute inset-0"
        animate={{ x: [0, 24, -24, 0], y: [0, -18, 18, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <nav className="fixed left-0 right-0 top-4 z-50 px-8 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-full bg-white/5 px-4 py-3 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <a className="text-3xl font-heading tracking-tight text-white">
            Aethera<span className="align-super text-base">®</span>
          </a>
          <div className="hidden items-center gap-1 rounded-full bg-white/5 px-1.5 py-1 md:flex">
            {navLinks.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-2 text-sm font-body font-medium text-white/90 transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
          <button className="hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-105 md:inline-flex">
            Begin Journey
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <section className="relative h-[1000px] overflow-hidden">
        <video
          ref={heroVideoRef}
          className="absolute left-0 top-[20%] h-auto min-h-full w-full object-cover"
          src={heroVideoUrl}
          poster="/images/hero_bg.jpeg"
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-b from-transparent to-black" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 pt-[150px] text-center">
          <div className="inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 liquid-glass">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">New</span>
            <span className="text-xs uppercase tracking-[0.35em] text-white/80">Introducing AI-powered web design.</span>
          </div>

          <div className="mt-10 max-w-5xl">
            <BlurText text="The Website Your Brand Deserves" />
          </div>

          <motion.p
            className="mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          >
            Stunning design. Blazing performance. Built by AI, refined by experts. This is web design, wildly reimagined.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
          >
            <button className="inline-flex items-center justify-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105 liquid-glass-strong">
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
              <Play className="h-4 w-4" />
              Watch the Film
            </button>
          </motion.div>

          <div className="mt-auto pb-8 pt-16">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 liquid-glass">
              <span className="text-xs uppercase tracking-[0.35em] text-white/80">Trusted by the teams behind</span>
              <div className="grid auto-cols-max grid-flow-col gap-12 text-2xl font-heading italic text-white md:text-3xl">
                {partnerNames.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-28" id="services">
        <div className="absolute inset-0 opacity-80">
          <video ref={startVideoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.35em] text-white liquid-glass">
            How It Works
          </span>
          <h2 className="mt-6 text-4xl font-heading italic tracking-tight text-white md:text-5xl lg:text-6xl">
            You dream it. We ship it.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 font-body font-light md:text-lg">
            Share your vision. Our AI handles the rest—wireframes, design, code, launch. All in days, not quarters.
          </p>
          <button className="mt-10 rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105 liquid-glass-strong">
            Get Started
          </button>
        </div>
      </section>

      <section className="relative py-28 bg-black" id="work">
        <div className="mx-auto max-w-6xl px-6 space-y-20">
          <div className="space-y-4 text-center">
            <span className="inline-flex rounded-full bg-white/5 px-3.5 py-1 text-xs uppercase tracking-[0.35em] text-white liquid-glass">
              Capabilities
            </span>
            <h2 className="text-4xl font-heading italic tracking-tight text-white md:text-5xl lg:text-6xl">
              Pro features. Zero complexity.
            </h2>
          </div>

          {features.map((feature) => (
            <div
              key={feature.title}
              className={`grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center ${feature.reverse ? 'lg:grid-flow-col-dense lg:grid-cols-[0.9fr_1.1fr]' : ''}`}
            >
              <div className="space-y-6">
                <h3 className="text-3xl font-heading italic tracking-tight text-white md:text-4xl">
                  {feature.title}
                </h3>
                <p className="max-w-xl text-base leading-relaxed text-white/70 font-body font-light md:text-lg">
                  {feature.text}
                </p>
                <button className="rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105 liquid-glass-strong">
                  {feature.reverse ? 'See how it works' : 'Learn more'}
                </button>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 liquid-glass overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                <img src={feature.gif} alt={feature.title} className="h-full w-full rounded-[1.75rem] object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-28" id="pricing">
        <div className="absolute inset-0 opacity-80">
          <video ref={statsVideoRef} className="absolute inset-0 h-full w-full object-cover saturate-0" muted playsInline />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/10 p-12 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-3xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: '200+', label: 'Sites launched' },
                { value: '98%', label: 'Client satisfaction' },
                { value: '3.2x', label: 'More conversions' },
                { value: '5 days', label: 'Average delivery' },
              ].map((item) => (
                <div key={item.label} className="space-y-2 text-center">
                  <p className="text-4xl font-heading italic text-white md:text-5xl lg:text-6xl">{item.value}</p>
                  <p className="text-sm font-body font-light uppercase tracking-[0.25em] text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-28 bg-black" id="process">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-4 text-center">
            <span className="inline-flex rounded-full bg-white/5 px-3.5 py-1 text-xs uppercase tracking-[0.35em] text-white liquid-glass">
              What They Say
            </span>
            <h2 className="text-4xl font-heading italic tracking-tight text-white md:text-5xl lg:text-6xl">
              Don’t take our word for it.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-3xl border border-white/10 bg-white/5 p-8 liquid-glass">
                <p className="text-white/80 font-body font-light leading-relaxed italic">“{item.quote}”</p>
                <div className="mt-8 space-y-1">
                  <p className="text-white font-body font-medium">{item.name}</p>
                  <p className="text-xs font-body font-light uppercase tracking-[0.3em] text-white/50">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-28" id="contact">
        <div className="absolute inset-0 opacity-80">
          <video ref={ctaVideoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-5xl font-heading italic leading-[0.85] tracking-tight text-white md:text-6xl lg:text-7xl">
            Your next website starts here.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Book a free strategy call. See what AI-powered design can do. No commitment, no pressure. Just possibilities.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105 liquid-glass-strong">
              Book a Call
            </button>
            <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-105">
              View Pricing
            </button>
          </div>

          <div className="mt-32 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/40 sm:flex-row">
            <p>(c) 2026 Studio. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {['Privacy', 'Terms', 'Contact'].map((label) => (
                <a key={label} href={`#${label.toLowerCase()}`} className="transition-colors hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
