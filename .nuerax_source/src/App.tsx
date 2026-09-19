import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Upload,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  Car,
  Globe,
  Play,
  Radio,
  Navigation2
} from 'lucide-react';
import { EarthGlobeView } from './components/EarthGlobeView';
import { GlobePage } from './components/GlobePage';
import { IntroAnimation } from './components/IntroAnimation';
import { LiveRadarPage } from './components/LiveRadarPage';
import { INITIAL_INCIDENTS } from './mockData';
import { TrafficIncident } from './types';

interface UserProfile {
  name: string;
  role: string;
  email: string;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isGlobeViewOpen, setIsGlobeViewOpen] = useState(false);
  const [isLiveRadarOpen, setIsLiveRadarOpen] = useState(false);
  const [radarCoords, setRadarCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radarCityName, setRadarCityName] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<TrafficIncident[]>(INITIAL_INCIDENTS);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const [videoSrc, setVideoSrc] = useState<string>('/pexels-traffic.mp4');
  const [videoPoster, setVideoPoster] = useState<string>('/pexels-poster.jpg');
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);

  // Google Maps Quota Handling (Tier 1 & Tier 2 defense)
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Modal state for incident reporting
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<'accident' | 'road_closure' | 'hazard'>('accident');
  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Autoplay video on mount or when source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log('Video autoplay:', err);
      });
    }
  }, [videoSrc]);

  const showToast = React.useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Handle local video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoSrc(objectUrl);
      setVideoPoster('');
      setCustomVideoName(file.name);
      showToast(`Loaded video: ${file.name}`);
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 100);
    }
  };

  // Drag and drop video file onto the screen
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const objectUrl = URL.createObjectURL(file);
      setVideoSrc(objectUrl);
      setVideoPoster('');
      setCustomVideoName(file.name);
      showToast(`Loaded video: ${file.name}`);
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 100);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const namePart = loginEmail.split('@')[0] || 'Traffic Officer';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    setCurrentUser({
      name: formattedName,
      role: 'Highway Patrol',
      email: loginEmail || 'officer@marganetra.gov'
    });
    setIsLoginOpen(false);
    setLoginEmail('');
    setLoginPassword('');
    showToast(`Welcome back, ${formattedName}! Authenticated successfully.`);
  };

  // Quick Demo Login
  const handleDemoLogin = (role: string, name: string) => {
    setCurrentUser({
      name,
      role,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@marganetra.gov`
    });
    setIsLoginOpen(false);
    showToast(`Signed in as ${name} (${role})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  // Handle incident report submit
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportLocation.trim()) return;

    setIsSubmitted(true);
    const newIncident: TrafficIncident = {
      id: `inc-user-${Date.now()}`,
      type: reportType,
      title: reportTitle.trim(),
      description: reportDetails.trim() || 'Reported by field officer via surveillance terminal.',
      locationName: reportLocation.trim(),
      lat: radarCoords ? radarCoords.lat : 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: radarCoords ? radarCoords.lng : -122.4194 + (Math.random() - 0.5) * 0.05,
      severity: reportType === 'accident' ? 'critical' : reportType === 'road_closure' ? 'moderate' : 'minor',
      reportedAt: new Date().toISOString(),
      reportedBy: currentUser ? currentUser.name : 'Surveillance_Unit',
      upvotes: 1,
      verified: true,
      laneBlocked: 'Advisory lane impact',
      estimatedClearance: '~30 mins',
      tags: ['Live User Report', 'Active Verification']
    };

    setTimeout(() => {
      setIncidents((prev) => [newIncident, ...prev]);
      setIsSubmitted(false);
      setIsReportOpen(false);
      setReportTitle('');
      setReportLocation('');
      setReportDetails('');
      showToast('Incident pinned to Google Maps Live Radar!');
    }, 900);
  };

  return (
    <div
      id="marganetra-home"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none font-sans"
    >
      {/* Required In-App Quota Defense Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Hidden File Input for video selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
        id="video-file-input"
      />

      {/* ADVANCED GRAPHICAL INTRO ANIMATION */}
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation
            onComplete={() => {
              setShowIntro(false);
              showToast('Surveillance Grid Online • Stream Active');
            }}
          />
        )}
      </AnimatePresence>

      {/* VIEWPORT ROUTER: 3D Globe vs Google Maps Live Radar vs Video Optical Stream */}
      {isGlobeViewOpen ? (
        <GlobePage
          onBack={() => {
            setIsGlobeViewOpen(false);
            showToast('Returned to MargaNetra Highway Surveillance Feed');
          }}
          onOpenGoogleMaps={(coords, name) => {
            setIsGlobeViewOpen(false);
            setRadarCoords(coords);
            setRadarCityName(name || null);
            setIsLiveRadarOpen(true);
            showToast(`Launched Google Live Radar at ${name || 'Coordinates'}`);
          }}
        />
      ) : isLiveRadarOpen ? (
        <LiveRadarPage
          incidents={incidents}
          initialCoords={radarCoords}
          initialCityName={radarCityName}
          onBack={() => {
            setIsLiveRadarOpen(false);
            showToast('Returned to Optical Video Surveillance');
          }}
          onOpenGlobe={() => {
            setIsLiveRadarOpen(false);
            setIsGlobeViewOpen(true);
          }}
          onOpenReportModal={(prefillCoords) => {
            if (prefillCoords) {
              setRadarCoords(prefillCoords);
              setReportLocation(`GPS (${prefillCoords.lat.toFixed(4)}, ${prefillCoords.lng.toFixed(4)})`);
            }
            setIsReportOpen(true);
          }}
          onUpvoteIncident={(id, e) => {
            e.stopPropagation();
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc))
            );
            showToast('Incident confirmation recorded on Google Maps');
          }}
          onReplayIntro={() => setShowIntro(true)}
        />
      ) : (
        <>
          {/* FULLSCREEN BACKGROUND VIDEO (PREVIOUS APPLICATION CORE) */}
          <video
            ref={videoRef}
            id="hero-background-video"
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            poster={videoPoster}
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={videoSrc} type="video/mp4" />
            <source src="/pexels-traffic.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/3078522/3078522-hd_1920_1080_30fps.mp4" type="video/mp4" />
            <source src="/traffic-bg.mp4" type="video/mp4" />
            <source src="/traffic-bg.webm" type="video/webm" />
          </video>

          {/* Soft top ambient tint to preserve contrast without obscuring the background */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 via-black/15 to-transparent pointer-events-none z-10" />

          {/* FLOATING TRANSPARENT PILL NAVBAR */}
          <header className="absolute top-4 sm:top-6 inset-x-3 sm:inset-x-6 z-30 flex justify-center">
            <nav className="w-full max-w-4xl bg-black/25 hover:bg-black/35 backdrop-blur-md rounded-full p-1.5 sm:p-2 pl-2 sm:pl-2.5 pr-2 sm:pr-2.5 flex items-center justify-between shadow-2xl shadow-black/40 border border-white/30 transition-all">
              {/* Left: Advanced Unified MargaNetra Brand Capsule */}
              <div className="flex items-center shrink-0">
                <button
                  id="nav-home-btn"
                  onClick={() => {
                    setShowIntro(true);
                    setVideoSrc('/pexels-traffic.mp4');
                    setCustomVideoName(null);
                  }}
                  className="group flex items-center gap-2.5 pl-1.5 pr-3.5 sm:pr-4 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-xl shadow-lg shadow-black/20 transition-all active:scale-95 cursor-pointer"
                  title="MargaNetra Intelligent Optical Core (Click to Replay Intro)"
                >
                  {/* Circular White Disc with Traffic Icon */}
                  <div
                    id="nav-logo-btn"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-md group-hover:scale-105 transition-transform shrink-0"
                  >
                    <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 stroke-[2.4] drop-shadow-xs" />
                  </div>

                  {/* Advanced App Name & Live Telemetry Badge */}
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm sm:text-base font-black text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      MargaNetra
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 drop-shadow">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                      </span>
                      LIVE
                    </span>
                  </div>
                </button>
              </div>

              {/* Center: Live Radar (Google Maps) and 3D Globe Buttons */}
              <div className="flex items-center gap-2 px-1">
                <button
                  id="nav-radar-btn"
                  onClick={() => {
                    setIsLiveRadarOpen(true);
                    setIsGlobeViewOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] cursor-pointer"
                  title="Open Street-Level Google Maps Live Radar"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Live Radar</span>
                </button>

                <button
                  id="nav-globe-btn"
                  onClick={() => {
                    setIsGlobeViewOpen(true);
                    setIsLiveRadarOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] cursor-pointer"
                  title="Open 3D Earth Globe Analysis"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-300" />
                  <span>3D Globe</span>
                </button>
              </div>

              {/* Right: White pill button with email label */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="open-login-btn"
                  onClick={() => {
                    if (currentUser) {
                      handleLogout();
                    } else {
                      setIsLoginOpen(true);
                      showToast('Officer Login / Dispatch Portal');
                    }
                  }}
                  className="rounded-full bg-white/95 hover:bg-white active:scale-95 text-black font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 shadow-md transition-all whitespace-nowrap tracking-tight cursor-pointer"
                  title={currentUser ? `Logged in as ${currentUser.name} (Click to logout)` : 'Click to Login'}
                >
                  {currentUser ? currentUser.name || currentUser.email : 'Login'}
                </button>
              </div>
            </nav>
          </header>
        </>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-20 sm:top-22 right-4 sm:right-8 z-40 flex items-center gap-2 px-4 py-2.5 bg-black/75 backdrop-blur-xl border border-white/25 rounded-2xl shadow-2xl text-xs font-bold text-white animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LOGIN MODAL - Clean Light Theme */}
      {isLoginOpen && (
        <div
          id="login-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900">
            {/* Close button */}
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">MargaNetra Access</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in to manage road surveillance and verify incidents
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address / Officer ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="officer@marganetra.gov"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                Sign In to MargaNetra
              </button>
            </form>

            {/* Quick Demo Sign In */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                Quick Patrol Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Highway Patrol', 'Officer Vikram')}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors text-center"
                >
                  Patrol Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Traffic Control', 'Supervisor Ananya')}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors text-center"
                >
                  Control Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT INCIDENT MODAL - Clean Light Theme */}
      {isReportOpen && (
        <div
          id="report-incident-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900">
            {/* Close button */}
            <button
              onClick={() => setIsReportOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900">Incident Broadcasted</h3>
                <p className="text-xs text-slate-500 mt-1">Logged into MargaNetra live traffic radar.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    Report Traffic Incident
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Broadcast accidents and road closures to nearby drivers in real time.
                  </p>
                </div>

                {/* Incident Type */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportType('accident')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      reportType === 'accident'
                        ? 'bg-rose-50 text-rose-700 border-rose-400 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Accident
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('road_closure')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      reportType === 'road_closure'
                        ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Closure
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('hazard')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      reportType === 'hazard'
                        ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Hazard
                  </button>
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Location / Highway Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., National Highway 44 near Toll Plaza"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Short Summary
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2-Vehicle Collision blocking right lane"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Traffic slow, emergency assistance dispatched."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Submit Incident Alert
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
