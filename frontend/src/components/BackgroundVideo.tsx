import React, { useRef, useState, useEffect } from 'react';
import { Video, VideoOff, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface BackgroundVideoProps {
  opacity?: number;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [brightnessLevel, setBrightnessLevel] = useState<'normal' | 'bright' | 'dim'>('normal');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log('Autoplay deferred until user interaction', err);
          setIsPlaying(false);
        });
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleBrightness = () => {
    if (brightnessLevel === 'normal') setBrightnessLevel('bright');
    else if (brightnessLevel === 'bright') setBrightnessLevel('dim');
    else setBrightnessLevel('normal');
  };

  const videoOpacityClass =
    brightnessLevel === 'bright'
      ? 'opacity-65'
      : brightnessLevel === 'dim'
      ? 'opacity-25'
      : 'opacity-45';

  return (
    <div
      id="bg-video-container"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-slate-950"
      aria-hidden="true"
    >
      {/* Pexels Highway Video (3078522) with Pine Tree Foreground */}
      <video
        ref={videoRef}
        id="background-traffic-video"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster="/pexels-poster.jpg"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoOpacityClass}`}
      >
        <source src="/pexels-traffic.mp4" type="video/mp4" />
        <source src="https://videos.pexels.com/video-files/3078522/3078522-hd_1920_1080_30fps.mp4" type="video/mp4" />
        <source src="/traffic-bg.mp4" type="video/mp4" />
      </video>

      {/* Clear, refined gradient overlay for crisp legibility and high contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/65 to-slate-950/90 pointer-events-none" />

      {/* Discreet bottom-left control pill for video interaction */}
      <div className="absolute bottom-4 left-4 pointer-events-auto z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-xl text-xs text-slate-200">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-[11px] text-slate-300 mr-1">Highway Video</span>

        <button
          id="toggle-bg-video-play-btn"
          type="button"
          onClick={togglePlay}
          className="p-1 hover:text-white rounded text-slate-400 hover:bg-slate-800 transition-colors"
          title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
        >
          {isPlaying ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-amber-400" />}
        </button>

        <button
          id="toggle-bg-video-mute-btn"
          type="button"
          onClick={toggleMute}
          className="p-1 hover:text-white rounded text-slate-400 hover:bg-slate-800 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          id="toggle-bg-video-dim-btn"
          type="button"
          onClick={cycleBrightness}
          className="p-1 hover:text-white rounded text-slate-400 hover:bg-slate-800 transition-colors text-[10px] font-mono font-bold"
          title="Adjust Video Clarity"
        >
          {brightnessLevel === 'bright' ? 'VIVID' : brightnessLevel === 'dim' ? 'DARK' : 'BALANCED'}
        </button>
      </div>
    </div>
  );
};
