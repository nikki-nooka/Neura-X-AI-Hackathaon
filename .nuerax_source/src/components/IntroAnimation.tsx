import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  AlertTriangle,
  Clock,
  Fuel,
  Wind,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  // Total 20 seconds duration (0.0s to 20.0s)
  // Act 1 (0.0s - 5.0s): Urban city grid, moving vehicles, main road congests in red -> "Heavy Traffic" & "Longer Travel Time"
  // Act 2 (5.0s - 10.0s): Traffic spreads to nearby feeder roads -> "Congestion → Fuel Waste → Air Pollution"
  // Act 3 (10.0s - 15.0s): Introduce MargaMetra smart routing, identify User Location & detect congested road
  // Act 4 (15.0s - 20.0s): Auto-highlight alternative route in green -> "MargaMetra: Smart Route Guidance" & vehicle cruising
  const TOTAL_DURATION = 20.0;
  const [seconds, setSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

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

  // Active Phase calculation
  const phase =
    seconds < 5.0 ? 1 : seconds < 10.0 ? 2 : seconds < 15.0 ? 3 : 4;

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
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Jump to specific act
  const jumpToAct = (targetSeconds: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, targetSeconds));
    secondsRef.current = clamped;
    setSeconds(clamped);
    setIsPlaying(true);
  };

  // Alternative route stroke offset calculation (Phase 4: 15s to 20s)
  const routeDrawRatio =
    phase === 4
      ? Math.min(1, Math.max(0, (seconds - 15.0) / 2.5))
      : 0;

  return (
    <motion.div
      id="margametra-20s-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden bg-[#060b18] text-slate-100 font-sans flex flex-col justify-between"
    >
      {/* Dynamic Background Grid & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d1e3a] via-[#070f20] to-[#040711]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* ========================================================================= */}
      {/* TOP BAR: Header, Timeline Scrubber & Skip Button                           */}
      {/* ========================================================================= */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800/80 bg-[#060b18]/80 backdrop-blur-md">
        {/* Brand Capsule */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Navigation className="w-4 h-4 fill-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white">
                MargaMetra
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Technology Showcase
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Intelligent Urban Traffic & Congestion Management System
            </p>
          </div>
        </div>

        {/* 4 Interactive Phase Navigation Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-full border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => jumpToAct(0.5)}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              phase === 1
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Heavy Traffic
          </button>
          <button
            type="button"
            onClick={() => jumpToAct(5.5)}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              phase === 2
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Spillover & Impact
          </button>
          <button
            type="button"
            onClick={() => jumpToAct(10.5)}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              phase === 3
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. MargaMetra AI
          </button>
          <button
            type="button"
            onClick={() => jumpToAct(15.5)}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              phase === 4
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Smart Route
          </button>
        </div>

        {/* Playback Controls & Skip */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => jumpToAct(0)}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
            title="Restart Presentation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <span>Skip to App</span>
            <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-200 font-mono">
              ESC
            </span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: VECTOR CITY MAP & INTERACTIVE TRAFFIC TELEMETRY             */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* The Realistic Dark Blue City Map Canvas */}
        <div className="relative w-full max-w-6xl h-full max-h-[660px] rounded-2xl border border-slate-800/80 bg-[#091224]/90 shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Subtle city grid blocks (Buildings & infrastructure) */}
          <svg
            viewBox="0 0 1000 600"
            className="w-full h-full object-contain overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Congested Red Arterial Glow */}
              <filter id="crimsonHeatGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Spillover Amber Heat Glow */}
              <filter id="amberSpillGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* MargaMetra Green Intelligent Route Glow */}
              <filter id="smartEmeraldGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradients */}
              <linearGradient id="emeraldRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              <linearGradient id="heavyCongestionGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>

            {/* --- WATERWAY / RIVER BISECTING THE CITY --- */}
            <path
              d="M 60,0 C 140,160 220,380 200,600 L 260,600 C 280,380 200,160 120,0 Z"
              fill="#0d2447"
              opacity="0.6"
            />

            {/* --- CITY ZONE BLOCKS --- */}
            <g opacity="0.35" fill="#13213a">
              {/* Financial District Blocks */}
              <rect x="320" y="70" width="100" height="70" rx="6" />
              <rect x="440" y="70" width="120" height="70" rx="6" />
              <rect x="580" y="70" width="110" height="70" rx="6" />
              <rect x="710" y="70" width="90" height="70" rx="6" />

              {/* Central Commercial Blocks */}
              <rect x="320" y="180" width="100" height="90" rx="6" />
              <rect x="440" y="180" width="120" height="90" rx="6" />
              <rect x="580" y="180" width="110" height="90" rx="6" />
              <rect x="710" y="180" width="90" height="90" rx="6" />

              {/* Southern Sector Blocks */}
              <rect x="320" y="320" width="100" height="85" rx="6" />
              <rect x="440" y="320" width="120" height="85" rx="6" />
              <rect x="580" y="320" width="110" height="85" rx="6" />
              <rect x="710" y="320" width="90" height="85" rx="6" />

              <rect x="320" y="445" width="100" height="75" rx="6" />
              <rect x="440" y="445" width="120" height="75" rx="6" />
              <rect x="580" y="445" width="110" height="75" rx="6" />
              <rect x="710" y="445" width="90" height="75" rx="6" />
            </g>

            {/* --- SECONDARY ROADS & CROSS STREETS --- */}
            <g opacity="0.65">
              {/* Horizontal Secondary Streets */}
              <line x1="80" y1="160" x2="940" y2="160" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="80" y1="290" x2="940" y2="290" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="80" y1="425" x2="940" y2="425" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="80" y1="540" x2="940" y2="540" stroke="#1e3a5f" strokeWidth="6" />

              {/* Vertical Secondary Avenues */}
              <line x1="300" y1="40" x2="300" y2="560" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="430" y1="40" x2="430" y2="560" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="570" y1="40" x2="570" y2="560" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="700" y1="40" x2="700" y2="560" stroke="#1e3a5f" strokeWidth="6" />
              <line x1="820" y1="40" x2="820" y2="560" stroke="#1e3a5f" strokeWidth="6" />
            </g>

            {/* --- MAIN ARTERIAL HIGHWAY (THE CONGESTION CORRIDOR) --- */}
            {/* Base Highway Track */}
            <path
              d="M 120,530 C 260,460 410,380 540,290 C 670,200 780,140 880,80"
              stroke="#243b5e"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M 120,530 C 260,460 410,380 540,290 C 670,200 780,140 880,80"
              stroke="#0b172a"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Center dashed line */}
            <path
              d="M 120,530 C 260,460 410,380 540,290 C 670,200 780,140 880,80"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="8 8"
            />

            {/* --- PHASE 1 & 2: HEAVY CONGESTION RED OVERLAY --- */}
            <motion.path
              d="M 230,475 C 340,420 460,345 540,290 C 620,235 690,195 760,150"
              stroke="url(#heavyCongestionGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#crimsonHeatGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: phase >= 1 ? 1 : 0,
                opacity: phase >= 1 ? 0.95 : 0
              }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />

            {/* Red Congestion Hotspot Nodes */}
            <g transform="translate(420, 365)">
              <circle cx="0" cy="0" r="24" fill="#ef4444" opacity="0.25" filter="url(#crimsonHeatGlow)">
                <animate attributeName="r" values="16;32;16" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.1;0.35" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="8" fill="#ef4444" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
            </g>

            <g transform="translate(560, 275)">
              <circle cx="0" cy="0" r="32" fill="#dc2626" opacity="0.3" filter="url(#crimsonHeatGlow)">
                <animate attributeName="r" values="22;42;22" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.12;0.4" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="10" fill="#ef4444" />
              <circle cx="0" cy="0" r="4" fill="#fee2e2" />
            </g>

            {/* --- PHASE 2: SPILLOVER CONGESTION ON NEARBY ROADS (AMBER) --- */}
            <motion.path
              d="M 430,290 L 430,425"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#amberSpillGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 0.85 : 0 }}
              transition={{ duration: 1 }}
            />
            <motion.path
              d="M 570,290 L 570,160"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#amberSpillGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 0.85 : 0 }}
              transition={{ duration: 1 }}
            />
            <motion.path
              d="M 430,290 L 570,290"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#amberSpillGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 0.85 : 0 }}
              transition={{ duration: 1 }}
            />

            {/* --- MOVING VEHICLES ON THE NETWORK --- */}
            {/* Free flowing vehicles on side avenues */}
            <circle r="4.5" fill="#38bdf8">
              <animateMotion
                path="M 80,160 L 940,160"
                dur="9s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4.5" fill="#38bdf8">
              <animateMotion
                path="M 940,425 L 80,425"
                dur="10s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4.5" fill="#60a5fa">
              <animateMotion
                path="M 300,560 L 300,40"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4.5" fill="#60a5fa">
              <animateMotion
                path="M 820,40 L 820,560"
                dur="8.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Jammed vehicles backed up on the red expressway */}
            <g opacity={phase >= 1 ? 0.95 : 0.4} className="transition-opacity duration-700">
              <rect x="330" y="420" width="12" height="6" rx="2" fill="#fca5a5" transform="rotate(-36 330 420)" />
              <rect x="350" y="405" width="12" height="6" rx="2" fill="#ef4444" transform="rotate(-36 350 405)" />
              <rect x="370" y="390" width="12" height="6" rx="2" fill="#f87171" transform="rotate(-36 370 390)" />
              <rect x="390" y="375" width="12" height="6" rx="2" fill="#dc2626" transform="rotate(-36 390 375)" />
              <rect x="470" y="325" width="12" height="6" rx="2" fill="#ef4444" transform="rotate(-36 470 325)" />
              <rect x="490" y="310" width="12" height="6" rx="2" fill="#f87171" transform="rotate(-36 490 310)" />
              <rect x="510" y="295" width="12" height="6" rx="2" fill="#dc2626" transform="rotate(-36 510 295)" />
              <rect x="615" y="235" width="12" height="6" rx="2" fill="#fca5a5" transform="rotate(-34 615 235)" />
              <rect x="635" y="220" width="12" height="6" rx="2" fill="#ef4444" transform="rotate(-34 635 220)" />
            </g>

            {/* --- PHASE 3 & 4: USER LOCATION & MARGAMETRA DETECTION --- */}
            {phase >= 3 && (
              <g transform="translate(180, 500)">
                {/* Sonar pulse ring */}
                <circle cx="0" cy="0" r="28" fill="#3b82f6" opacity="0.3">
                  <animate attributeName="r" values="10;36;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="14" fill="#1e40af" stroke="#60a5fa" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="5" fill="#ffffff" />
              </g>
            )}

            {/* Destination Target Marker */}
            {phase >= 3 && (
              <g transform="translate(860, 95)">
                <circle cx="0" cy="0" r="22" fill="#10b981" opacity="0.35">
                  <animate attributeName="r" values="8;30;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="12" fill="#047857" stroke="#34d399" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4" fill="#ffffff" />
              </g>
            )}

            {/* --- PHASE 4: MARGAMETRA SMART ALTERNATIVE ROUTE IN GREEN --- */}
            {/* Alternative path contour through clear secondary avenues */}
            {phase >= 4 && (
              <>
                {/* Background path casing */}
                <path
                  d="M 180,500 L 300,500 L 300,425 L 570,425 L 570,360 L 700,360 L 700,160 L 820,160 L 860,95"
                  stroke="#064e3b"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Glowing Green Intelligent Route Polyline */}
                <path
                  id="margaMetraGreenRoute"
                  d="M 180,500 L 300,500 L 300,425 L 570,425 L 570,360 L 700,360 L 700,160 L 820,160 L 860,95"
                  stroke="url(#emeraldRouteGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1400"
                  strokeDashoffset={1400 * (1 - routeDrawRatio)}
                  filter="url(#smartEmeraldGlow)"
                  className="transition-all duration-300"
                />

                {/* Vehicle gracefully cruising along the alternative route */}
                {routeDrawRatio > 0.3 && (
                  <circle r="7" fill="#ffffff" filter="url(#smartEmeraldGlow)">
                    <animateMotion
                      path="M 180,500 L 300,500 L 300,425 L 570,425 L 570,360 L 700,360 L 700,160 L 820,160 L 860,95"
                      dur="4.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {routeDrawRatio > 0.5 && (
                  <circle r="5.5" fill="#a7f3d0" filter="url(#smartEmeraldGlow)">
                    <animateMotion
                      path="M 180,500 L 300,500 L 300,425 L 570,425 L 570,360 L 700,360 L 700,160 L 820,160 L 860,95"
                      dur="4.5s"
                      begin="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </>
            )}
          </svg>

          {/* ========================================================================= */}
          {/* FLOATING HUD CALLOUT PANELS (PHASE BY PHASE)                              */}
          {/* ========================================================================= */}

          {/* ACT 1: HEAVY TRAFFIC & LONGER TRAVEL TIME */}
          <AnimatePresence>
            {phase === 1 && (
              <div className="absolute inset-x-4 top-5 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
                {/* Heavy Traffic Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-rose-500/50 shadow-xl shadow-rose-950/40 backdrop-blur-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-rose-400 uppercase tracking-wide">
                      Heavy Traffic
                    </div>
                    <div className="text-[11px] font-medium text-slate-300">
                      Central Expressway • Avg Speed: 8 km/h
                    </div>
                  </div>
                </motion.div>

                {/* Longer Travel Time Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-amber-500/50 shadow-xl shadow-amber-950/40 backdrop-blur-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-400 uppercase tracking-wide">
                      Longer Travel Time
                    </div>
                    <div className="text-[11px] font-medium text-slate-300">
                      ETA: 52 min (<span className="text-rose-400 font-bold">+38 min delay</span>)
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ACT 2: CONGESTION -> FUEL WASTE -> AIR POLLUTION */}
          <AnimatePresence>
            {phase === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-x-4 top-5 flex justify-center pointer-events-none"
              >
                <div className="w-full max-w-2xl px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  {/* Step 1: Congestion */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-rose-400 uppercase">
                        Congestion
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Spillover: 4 Avenues
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />

                  {/* Step 2: Fuel Waste */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-400 uppercase">
                        Fuel Waste
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        +2.6L/hr Idling Burn
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />

                  {/* Step 3: Air Pollution */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-red-400 uppercase">
                        Air Pollution
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        +42% CO₂ Emissions
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACT 3: INTRODUCE MARGAMETRA & USER LOCATION DETECTION */}
          <AnimatePresence>
            {phase === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-x-4 top-5 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none"
              >
                {/* MargaMetra System Intro Card */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-blue-500/50 shadow-xl shadow-blue-950/40 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Zap className="w-4 h-4 fill-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white tracking-wide">
                      MargaMetra AI Routing
                    </div>
                    <div className="text-[11px] font-medium text-blue-400">
                      Smart Traffic-Aware Neural Engine
                    </div>
                  </div>
                </div>

                {/* User Location Detected & Bottleneck Warning */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Compass className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                      User Location Locked
                    </div>
                    <div className="text-[11px] font-medium text-slate-300">
                      Detected Congestion on Central Expressway
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACT 4: MARGAMETRA SMART ROUTE GUIDANCE (GREEN ALTERNATIVE) */}
          <AnimatePresence>
            {phase === 4 && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-x-4 top-5 flex justify-center pointer-events-none"
              >
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-emerald-950/90 border border-emerald-500/60 shadow-[0_10px_35px_rgba(16,185,129,0.25)] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-sm font-black text-white tracking-tight">
                        MargaMetra: Smart Route Guidance
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        OPTIMAL
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                      <span className="text-emerald-400 font-bold">
                        Bypassed Red Bottleneck
                      </span>
                      <span>•</span>
                      <span>ETA: 18 min</span>
                      <span>•</span>
                      <span className="text-emerald-300 font-bold">Saves 34 mins</span>
                      <span>•</span>
                      <span>-68% Emissions</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Origin & Destination labels on the canvas */}
          {phase >= 3 && (
            <>
              <div className="absolute bottom-12 left-10 sm:left-24 px-2.5 py-1 rounded-md bg-blue-950/90 border border-blue-600/50 text-[10px] font-black text-blue-300 shadow-md pointer-events-none">
                User Location (Origin)
              </div>
              <div className="absolute top-12 right-10 sm:right-24 px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-600/50 text-[10px] font-black text-emerald-300 shadow-md pointer-events-none">
                Destination (Clear)
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM CONTROL & PROGRESS BAR: 20-SECOND METRIC TIMELINE                   */}
      {/* ========================================================================= */}
      <footer className="relative z-30 px-4 sm:px-8 py-3 bg-[#060b18]/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Current phase narrative caption */}
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>
            {phase === 1 && 'Act 1: Urban Grid Traffic Congestion Detected on Main Arterial'}
            {phase === 2 && 'Act 2: Congestion → Fuel Waste → Air Pollution Spillover Chain'}
            {phase === 3 && 'Act 3: MargaMetra Identifies User Location & Arterial Bottleneck'}
            {phase === 4 && 'Act 4: MargaMetra Smart Route Guidance Highlights Clear Green Path'}
          </span>
        </div>

        {/* 20-Second Scrubber Line */}
        <div className="flex items-center gap-3 w-full sm:w-80">
          <span className="text-[11px] font-mono text-slate-400">
            {seconds.toFixed(1)}s
          </span>
          <div
            className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden relative cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newSeconds = (clickX / rect.width) * TOTAL_DURATION;
              jumpToAct(Math.max(0, Math.min(TOTAL_DURATION, newSeconds)));
            }}
            title="Click to seek timeline"
          >
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-100"
              style={{ width: `${(seconds / TOTAL_DURATION) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            20.0s
          </span>
        </div>
      </footer>
    </motion.div>
  );
};
