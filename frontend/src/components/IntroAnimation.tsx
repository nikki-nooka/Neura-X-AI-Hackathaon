import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, ArrowRight, CircleDot } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

interface IntroStep {
  category: string;
  stepNumber: string;
  headline: string;
  subtext: string;
  startSec: number;
  endSec: number;
}

const STEPS: IntroStep[] = [
  {
    category: 'COMMUTER CHALLENGE',
    stepNumber: '01 OF 04',
    headline: 'Stuck in unexpected highway congestion?',
    subtext: 'Unforeseen bottlenecks and peak-hour slowdowns delay thousands of daily commuters.',
    startSec: 0.0,
    endSec: 2.5,
  },
  {
    category: 'EMERGENCY BOTTLENECK',
    stepNumber: '02 OF 04',
    headline: 'Critical emergency vehicles trapped in gridlock?',
    subtext: 'Ambulances and first responders face precious lost minutes when arterial networks jam.',
    startSec: 2.5,
    endSec: 5.0,
  },
  {
    category: 'AI NEURAL PREDICTION',
    stepNumber: '03 OF 04',
    headline: 'MargaNetra predicts jams 15–60 minutes ahead.',
    subtext: 'Graph-aware intelligence and Scikit-Learn models anticipate congestion waves before they form.',
    startSec: 5.0,
    endSec: 7.5,
  },
  {
    category: 'AUTONOMOUS RESOLUTION',
    stepNumber: '04 OF 04',
    headline: 'Dynamic green wave corridors & smart rerouting.',
    subtext: 'Instant signal preemption and traffic diversion restore network equilibrium.',
    startSec: 7.5,
    endSec: 10.0,
  },
];

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const TOTAL_DURATION = 10.0;
  const [seconds, setSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const secondsRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  isPlayingRef.current = isPlaying;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef<boolean>(false);

  const handleFinish = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  // Determine current active step index (0, 1, 2, 3)
  const currentStepIndex = Math.min(
    3,
    Math.max(0, Math.floor((seconds / TOTAL_DURATION) * 4))
  );
  const currentStep = STEPS[currentStepIndex];

  // Run smooth animation frame timer
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateTimer = (now: number) => {
      if (isPlayingRef.current && !hasCompletedRef.current) {
        const delta = (now - lastTime) / 1000;
        const nextSec = secondsRef.current + delta;
        if (nextSec >= TOTAL_DURATION) {
          secondsRef.current = TOTAL_DURATION;
          setSeconds(TOTAL_DURATION);
          handleFinish();
          return;
        }
        secondsRef.current = nextSec;
        setSeconds(nextSec);
      }
      lastTime = now;
      if (!hasCompletedRef.current) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => {
          if (videoRef.current) {
            if (p) videoRef.current.pause();
            else videoRef.current.play().catch(() => {});
          }
          return !p;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Jump to specific step
  const jumpToStep = (index: number) => {
    const targetSec = index * 2.5;
    secondsRef.current = targetSec;
    setSeconds(targetSec);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <motion.div
      id="marganetra-intro-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-[100] w-screen h-screen overflow-hidden bg-black text-white select-none font-sans flex flex-col justify-between"
    >
      {/* 1. FULLSCREEN VED2 BACKGROUND VIDEO */}
      <video
        ref={videoRef}
        id="intro-video-element"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/ved2.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Vignette Overlay matching reference photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/75 z-10 pointer-events-none" />

      {/* 2. TOP BAR: BRAND (LEFT) & SKIP BUTTON (RIGHT) */}
      <header className="relative z-20 w-full px-6 sm:px-10 pt-6 flex items-center justify-between">
        {/* Top Left: MargaNetra Logo & Subtext */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-lg">
            <Navigation className="w-4 h-4 text-white fill-white rotate-45 transform" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-white uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                MARGANETRA
              </span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
            </div>
            <span className="text-[10px] tracking-[0.22em] font-medium text-slate-300 uppercase drop-shadow">
              NEURAL TRAFFIC INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Top Right: Skip Intro Pill Button */}
        <button
          id="skip-intro-btn"
          onClick={handleFinish}
          className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/50 hover:bg-black/80 backdrop-blur-xl text-xs sm:text-sm text-white font-medium shadow-xl transition-all active:scale-95 cursor-pointer hover:border-white/50"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-slate-300" />
        </button>
      </header>

      {/* 3. CENTER / MIDDLE PHASE CONTENT */}
      <main className="relative z-20 w-full max-w-3xl mx-auto px-6 flex flex-col items-center text-center my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full"
          >
            {/* Cinematic Frosted Text Container */}
            <div className="w-full p-8 sm:p-10 rounded-3xl bg-black/45 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 flex flex-col items-center text-center">
              {/* Step Tag Pill / Category */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-[11px] font-mono font-semibold tracking-[0.2em] uppercase mb-5 shadow-sm">
                <CircleDot className="w-3 h-3 text-cyan-400" />
                <span>{currentStep.category} · {currentStep.stepNumber}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-[40px] font-extrabold text-white tracking-tight leading-[1.2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] max-w-2xl">
                {currentStep.headline}
              </h1>

              {/* Subtitle Description */}
              <p className="mt-4 text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {currentStep.subtext}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. BOTTOM BAR: REFINED PROGRESS SEGMENTS & CONTROLS */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-6 pb-6 sm:pb-8 flex flex-col gap-3">
        {/* Sleek Segmented Progress Bars */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {STEPS.map((step, idx) => {
            const stepDuration = 2.5;
            const stepStart = idx * stepDuration;
            const stepEnd = (idx + 1) * stepDuration;
            const stepProgress = Math.min(
              1,
              Math.max(0, (seconds - stepStart) / stepDuration)
            );
            const isPassed = seconds >= stepEnd;
            const isActive = idx === currentStepIndex;

            return (
              <button
                key={step.category}
                onClick={() => jumpToStep(idx)}
                className="group flex flex-col gap-1.5 text-left cursor-pointer focus:outline-none"
                title={`Jump to: ${step.category}`}
              >
                <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <div
                    className={`h-full transition-all duration-100 ${
                      isPassed ? 'bg-white w-full' : isActive ? 'bg-white' : 'w-0'
                    }`}
                    style={{
                      width: isPassed ? '100%' : isActive ? `${stepProgress * 100}%` : '0%',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`tracking-wider uppercase transition-colors ${
                    isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    0{idx + 1}
                  </span>
                  <span className={`hidden sm:inline tracking-wider uppercase transition-colors truncate max-w-[120px] ${
                    isActive ? 'text-slate-200 font-semibold' : 'text-slate-500'
                  }`}>
                    {step.category.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono pt-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">
              {seconds.toFixed(1)}s / {TOTAL_DURATION.toFixed(1)}s
            </span>
          </div>
          <div className="text-[11px] text-slate-400 tracking-wider">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/20">Space</kbd> to pause · <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/20">Esc</kbd> to skip
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default IntroAnimation;
