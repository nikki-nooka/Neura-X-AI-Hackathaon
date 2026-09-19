import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Building2,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  ExternalLink,
  Eye,
  Globe,
  HeartPulse,
  Layers,
  LineChart,
  Lock,
  Mail,
  Navigation,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

export default function HomePage({
  onNavigate,
  onOpenDemo,
  onOpenReport,
  onReplayIntro,
  currentUser,
  onLogin,
  onLogout,
  kpis,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoBrightness, setVideoBrightness] = useState('balanced'); // 'vivid' | 'balanced' | 'cinematic'
  const [activeFeed, setActiveFeed] = useState('/highway-traffic.mp4');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState('Traffic Operations Officer');

  // Available highway streams
  const videoFeeds = [
    { id: 'f1', label: 'NH-44 Expressway (Optical Cam 04)', src: '/highway-traffic.mp4' },
    { id: 'f2', label: 'Pexels High-Speed Highway', src: '/pexels-traffic.mp4' },
    { id: 'f3', label: 'Arterial Corridor (Cam 09)', src: '/traffic-bg.mp4' },
    { id: 'f4', label: 'West Junction Overpass (Cam 12)', src: '/original-traffic.webm' },
  ];

  // Auto-play on mount and when feed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [activeFeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleBrightness = () => {
    if (videoBrightness === 'balanced') setVideoBrightness('vivid');
    else if (videoBrightness === 'vivid') setVideoBrightness('cinematic');
    else setVideoBrightness('balanced');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const namePart = loginEmail.split('@')[0] || 'Traffic Officer';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    if (onLogin) {
      onLogin({
        name: formattedName,
        role: loginRole,
        email: loginEmail || 'officer@marganetra.gov',
      });
    }
    setIsLoginModalOpen(false);
  };

  const handleDemoLogin = (name, role) => {
    if (onLogin) {
      onLogin({
        name,
        role,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@marganetra.gov`,
      });
    }
    setIsLoginModalOpen(false);
  };

  // Restrained, cinematic overlay gradient for realistic contrast
  const overlayClass =
    videoBrightness === 'vivid'
      ? 'bg-gradient-to-b from-black/50 via-black/30 to-black/70'
      : videoBrightness === 'cinematic'
      ? 'bg-gradient-to-b from-black/75 via-black/45 to-black/85'
      : 'bg-gradient-to-b from-black/60 via-black/35 to-black/75';

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden text-white select-none font-sans flex flex-col justify-between">
      {/* 1. FULLSCREEN VIDEO BACKGROUND */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          id="hero-background-video"
          key={activeFeed}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster="/pexels-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src={activeFeed} type="video/mp4" />
          <source src="/highway-traffic.mp4" type="video/mp4" />
          <source src="/pexels-traffic.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3078522/3078522-hd_1920_1080_30fps.mp4" type="video/mp4" />
          <source src="/traffic-bg.mp4" type="video/mp4" />
        </video>

        {/* Ambient Gradient Overlay with Unified Contrast */}
        <div className={`absolute inset-0 w-full h-full pointer-events-none transition-colors duration-500 ${overlayClass}`} />

        {/* Subtle Precision Grid Accent */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* 2. REFINED FLOATING NAVBAR */}
      <header className="w-full pt-4 sm:pt-6 px-4 sm:px-8 z-40 flex justify-center sticky top-0">
        <nav className="w-full max-w-5xl bg-black/45 hover:bg-black/60 backdrop-blur-2xl rounded-full px-3 py-2 flex items-center justify-between shadow-2xl shadow-black/80 border border-white/15 transition-all">
          {/* Left: Brand Capsule */}
          <div className="flex items-center shrink-0">
            <button
              id="nav-brand-btn"
              onClick={() => onReplayIntro?.()}
              className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer text-left"
              title="Click to replay Cinematic Introduction"
            >
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-sm group-hover:bg-white/20 transition-all">
                <Navigation className="w-3.5 h-3.5 text-white fill-white rotate-45" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider text-white uppercase">
                  MargaNetra
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono font-medium text-slate-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  LIVE
                </span>
              </div>
            </button>
          </div>

          {/* Center: Navigation Actions */}
          <div className="hidden md:flex items-center gap-1.5 px-2">
            <button
              id="nav-radar-btn"
              onClick={() => onNavigate('live_radar')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium tracking-tight transition-all active:scale-95 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Radar</span>
            </button>

            <button
              id="nav-globe-btn"
              onClick={() => onNavigate('globe_3d')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium tracking-tight transition-all active:scale-95 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>3D Twin</span>
            </button>

            <button
              id="nav-command-btn"
              onClick={() => onNavigate('command_center')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium tracking-tight transition-all active:scale-95 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-slate-300" />
              <span>Command Center</span>
            </button>
          </div>

          {/* Right: Officer Authentication */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('command_center')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200 hover:bg-white/20 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                  <span>{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs px-3 py-1.5 transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="open-login-btn"
                onClick={() => setIsLoginModalOpen(true)}
                className="rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-semibold text-xs px-4 py-2 shadow-lg transition-all tracking-tight cursor-pointer"
              >
                Officer Login
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* 3. HERO CONTENT SECTION */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center z-10 my-auto">
        {/* Precision Sub-Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-xl shadow-lg mb-6">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-xs font-mono font-medium tracking-wider uppercase text-slate-300">
            NeuraX AI · Hyderabad Urban Digital Twin
          </span>
        </div>

        {/* Clean, Realistic Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl text-white leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Autonomous Traffic Intelligence &amp; Neural Grid Dispatch
        </h1>

        {/* Informative, Realistic Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Real-time Graph Neural Network &amp; Scikit-Learn predictive forecasting across 436 road segments, autonomous spillback detection, and dynamic green wave signal preemption.
        </p>

        {/* Unified Call To Action Cluster */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            id="hero-launch-command-btn"
            onClick={() => onNavigate('command_center')}
            className="group flex items-center gap-2.5 px-7 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-2xl transition-all active:scale-95 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-slate-900 group-hover:rotate-12 transition-transform" />
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-700" />
          </button>

          <button
            id="hero-live-radar-btn"
            onClick={() => onNavigate('live_radar')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/15 text-white font-medium text-sm shadow-lg hover:border-white/30 transition-all active:scale-95 cursor-pointer"
          >
            <Radio className="w-4 h-4 text-slate-300" />
            <span>Live Radar</span>
          </button>

          <button
            id="hero-3d-globe-btn"
            onClick={() => onNavigate('globe_3d')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/15 text-white font-medium text-sm shadow-lg hover:border-white/30 transition-all active:scale-95 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-300" />
            <span>3D Digital Twin</span>
          </button>

          <button
            id="hero-run-demo-btn"
            onClick={() => onOpenDemo?.()}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-slate-200 font-medium text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-slate-300" />
            <span>Run Pipeline Demo</span>
          </button>
        </div>

        {/* 4. UNIFIED TELEMETRY HUD STRIP */}
        <div className="mt-12 w-full max-w-4xl p-1 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-left">
            {/* Metric 1 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Avg Network Speed</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">+4.2%</span>
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {kpis?.avg_speed_kmh ? `${kpis.avg_speed_kmh.toFixed(1)} km/h` : '42.4 km/h'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">436 arterial segments</div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Network Throughput</span>
                <span className="text-[10px] font-mono text-slate-300 font-semibold">Active</span>
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {kpis?.total_flow_vph ? `${kpis.total_flow_vph.toLocaleString()} vph` : '184,200 vph'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">74% Capacity saturation</div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Congestion Index</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Optimal</span>
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                0.22
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Free-flow network status</div>
            </div>

            {/* Metric 4 */}
            <div className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Smart Signals</span>
                <span className="text-[10px] font-mono text-slate-300 font-semibold">Synced</span>
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                89 Nodes
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Green wave corridors</div>
            </div>
          </div>
        </div>

        {/* 5. DISCIPLINED OPERATIONAL FEATURE MODULES */}
        <div className="mt-6 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {/* Card 1: 15-60m Forecasting */}
          <button
            onClick={() => onNavigate('forecast')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-white/25 transition-all group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 mb-3 group-hover:scale-105 transition-transform">
              <LineChart className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Predictive Forecaster</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              12 HistGradientBoosting models forecasting 15 to 60-min congestion progression.
            </p>
          </button>

          {/* Card 2: Emergency Corridor */}
          <button
            onClick={() => onNavigate('emergency')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-white/25 transition-all group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 mb-3 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Green Wave Corridor</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Automated signal preemption clearing paths for ambulances and first responders.
            </p>
          </button>

          {/* Card 3: Spillback & Incidents */}
          <button
            onClick={() => onNavigate('spillback')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-white/25 transition-all group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Spillback Analysis</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Random Forest incident detection simulating shockwave backpropagation.
            </p>
          </button>

          {/* Card 4: Infrastructure Planner */}
          <button
            onClick={() => onNavigate('infrastructure')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-white/25 transition-all group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Infrastructure ROI</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              BPR delay simulation ranking 90 infrastructure upgrade projects by impact.
            </p>
          </button>
        </div>
      </main>

      {/* 6. MINIMAL HUD FOOTER */}
      <footer className="w-full px-4 sm:px-8 py-4 z-30 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Background Optical Feed Controls */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-2xl border border-white/15 text-xs text-slate-300 shadow-lg">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </span>
          <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">FEED:</span>

          <select
            value={activeFeed}
            onChange={(e) => setActiveFeed(e.target.value)}
            className="bg-transparent text-[11px] text-slate-200 font-medium border-none focus:outline-none cursor-pointer"
          >
            {videoFeeds.map((feed) => (
              <option key={feed.id} value={feed.src} className="bg-slate-900 text-white">
                {feed.label}
              </option>
            ))}
          </select>

          <div className="h-3 w-px bg-white/15 mx-0.5" />

          <button
            onClick={togglePlay}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Video className="w-3.5 h-3.5 text-slate-300" /> : <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            onClick={toggleMute}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-200" />}
          </button>

          <button
            onClick={cycleBrightness}
            className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
            title="Adjust Backdrop Brightness"
          >
            {videoBrightness.toUpperCase()}
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReport?.()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 hover:bg-black/65 border border-white/15 text-slate-200 hover:text-white text-xs font-medium backdrop-blur-2xl transition-all cursor-pointer shadow-lg"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            <span>Report Incident</span>
          </button>

          <button
            onClick={() => onNavigate('surveillance')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium backdrop-blur-2xl transition-all cursor-pointer shadow-lg"
          >
            <Camera className="w-3.5 h-3.5 text-slate-300" />
            <span>Surveillance Grid</span>
          </button>
        </div>
      </footer>

      {/* 7. OFFICER AUTHENTICATION MODAL */}
      {isLoginModalOpen && (
        <div
          id="login-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm bg-slate-900/95 border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-11 h-11 mx-auto mb-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Officer Clearance</h3>
              <p className="text-xs text-slate-400 mt-1">
                Authenticate to dispatch interventions and override signals
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 font-mono">
                  OFFICER IDENTIFIER / EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="officer@marganetra.gov"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 font-mono">
                  SECURITY CLEARANCE
                </label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                >
                  <option value="Traffic Operations Officer" className="bg-slate-900">Traffic Operations Officer</option>
                  <option value="Highway Patrol Commander" className="bg-slate-900">Highway Patrol Commander</option>
                  <option value="Chief Urban Dispatcher" className="bg-slate-900">Chief Urban Dispatcher</option>
                  <option value="Emergency Fleet Lead" className="bg-slate-900">Emergency Fleet Lead</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 font-semibold text-xs text-slate-950 transition-all shadow-xl cursor-pointer mt-2"
              >
                Authenticate Session
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-2">
                Quick Hackathon Access
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Officer Vikram', 'Chief Dispatcher')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 transition-all text-center cursor-pointer"
                >
                  Officer Vikram
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Commander Priya', 'Highway Patrol')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 transition-all text-center cursor-pointer"
                >
                  Cmdr. Priya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
