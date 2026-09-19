import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Sparkles, Radio, Shield, ArrowRight } from 'lucide-react';

interface Globe3DProps {
  onNavigateToMain: () => void;
}

interface HubPoint {
  name: string;
  code: string;
  lat: number;
  lng: number;
  highlight?: boolean;
}

// Major Indian & Global highway surveillance hubs
const HUBS: HubPoint[] = [
  { name: 'NH-44 Central Hub (Delhi)', code: 'DEL-01', lat: 28.6139, lng: 77.209, highlight: true },
  { name: 'Mumbai-Pune Expressway Hub', code: 'BOM-04', lat: 19.076, lng: 72.8777, highlight: true },
  { name: 'Bengaluru Tech Corridor Hub', code: 'BLR-07', lat: 12.9716, lng: 77.5946, highlight: true },
  { name: 'Hyderabad Outer Ring Corridor', code: 'HYD-09', lat: 17.385, lng: 78.4867, highlight: true },
  { name: 'Chennai Coastal Highway Corridor', code: 'MAA-03', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata East-West Corridor', code: 'CCU-05', lat: 22.5726, lng: 88.3639 },
  { name: 'Singapore Asia-Pacific Relay', code: 'SIN-08', lat: 1.3521, lng: 103.8198 },
  { name: 'London Euro-Transit Grid', code: 'LON-12', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo Express Ring', code: 'TYO-15', lat: 35.6762, lng: 139.6503 },
  { name: 'San Francisco West Coast Grid', code: 'SFO-22', lat: 37.7749, lng: -122.4194 }
];

export const Globe3D: React.FC<Globe3DProps> = ({ onNavigateToMain }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredHub, setHoveredHub] = useState<HubPoint | null>(null);
  const [isHoveringGlobe, setIsHoveringGlobe] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Rotation angles (radians)
  const rotationRef = useRef({ phi: 1.2, theta: 0.35 }); // Oriented towards India initially
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ phi: 0.0035, theta: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Precompute a dense distribution of land points (Earth approximation)
    const globePoints: { lat: number; lng: number }[] = [];
    const step = 6;
    for (let lat = -80; lat <= 80; lat += step) {
      const latRad = (lat * Math.PI) / 180;
      const numLon = Math.max(8, Math.round(360 / step * Math.cos(latRad)));
      for (let i = 0; i < numLon; i++) {
        const lng = -180 + (360 / numLon) * i;
        // Stylized continent mask approximation (adds denser points around major landmasses)
        const isLikelyLand =
          (lat >= 5 && lat <= 35 && lng >= 65 && lng <= 95) || // India / South Asia
          (lat >= 10 && lat <= 70 && lng >= -10 && lng <= 145) || // Eurasia
          (lat >= -35 && lat <= 38 && lng >= -18 && lng <= 52) || // Africa
          (lat >= 15 && lat <= 70 && lng >= -165 && lng <= -55) || // North America
          (lat >= -55 && lat <= 12 && lng >= -82 && lng <= -34) || // South America
          (lat >= -42 && lat <= -10 && lng >= 112 && lng <= 155); // Australia

        if (isLikelyLand || (i % 2 === 0 && Math.abs(lat) < 70)) {
          globePoints.push({ lat, lng });
        }
      }
    }

    let pulse = 0;

    const render = () => {
      pulse += 0.04;
      if (!isDraggingRef.current) {
        rotationRef.current.phi += velocityRef.current.phi;
        rotationRef.current.theta += velocityRef.current.theta;
        // Dampen manual throw velocity
        velocityRef.current.phi = velocityRef.current.phi * 0.98 + 0.0015 * 0.02;
        velocityRef.current.theta *= 0.95;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      const phi = rotationRef.current.phi;
      const theta = rotationRef.current.theta;

      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      // 1. Atmosphere Radial Glow Behind Globe
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.35);
      glowGrad.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      glowGrad.addColorStop(0.8, 'rgba(99, 102, 241, 0.05)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sphere Base / Night Side
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, '#0a1526');
      sphereGrad.addColorStop(0.6, '#050b14');
      sphereGrad.addColorStop(1, '#02060d');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Globe Latitude / Longitude Rings
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Draw latitude circles
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const rLat = radius * Math.cos(latRad);
        const yLat = radius * Math.sin(latRad);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const x0 = rLat * Math.sin(a);
          const y0 = yLat;
          const z0 = rLat * Math.cos(a);

          // Rotate around Y then X
          const x1 = x0 * cosPhi + z0 * sinPhi;
          const z1 = -x0 * sinPhi + z0 * cosPhi;
          const y2 = y0 * cosTheta - z1 * sinTheta;
          const z2 = y0 * sinTheta + z1 * cosTheta;

          if (z2 > -radius * 0.2) {
            const px = cx + x1;
            const py = cy - y2;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // 4. Draw Land Particle Grid
      for (let i = 0; i < globePoints.length; i++) {
        const pt = globePoints[i];
        const latRad = (pt.lat * Math.PI) / 180;
        const lngRad = (pt.lng * Math.PI) / 180;

        const x0 = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y0 = radius * Math.sin(latRad);
        const z0 = radius * Math.cos(latRad) * Math.cos(lngRad);

        // 3D rotation
        const x1 = x0 * cosPhi + z0 * sinPhi;
        const z1 = -x0 * sinPhi + z0 * cosPhi;
        const y2 = y0 * cosTheta - z1 * sinTheta;
        const z2 = y0 * sinTheta + z1 * cosTheta;

        // Draw only front visible hemisphere
        if (z2 > 0) {
          const normZ = z2 / radius; // 0 to 1
          const alpha = 0.2 + normZ * 0.65;
          const size = 1.0 + normZ * 1.4;

          const px = cx + x1;
          const py = cy - y2;

          ctx.fillStyle = `rgba(125, 211, 252, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw Highway Hubs & Beacons
      let nearestHub: HubPoint | null = null;
      let minDistance = 24;

      HUBS.forEach((hub) => {
        const latRad = (hub.lat * Math.PI) / 180;
        const lngRad = (hub.lng * Math.PI) / 180;

        const x0 = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y0 = radius * Math.sin(latRad);
        const z0 = radius * Math.cos(latRad) * Math.cos(lngRad);

        const x1 = x0 * cosPhi + z0 * sinPhi;
        const z1 = -x0 * sinPhi + z0 * cosPhi;
        const y2 = y0 * cosTheta - z1 * sinTheta;
        const z2 = y0 * sinTheta + z1 * cosTheta;

        if (z2 > 0) {
          const px = cx + x1;
          const py = cy - y2;
          const normZ = z2 / radius;

          // Check distance to mouse
          const dx = px - lastMouseRef.current.x;
          const dy = py - lastMouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            nearestHub = hub;
          }

          // Animated pulse ring
          const ringRadius = 4 + (Math.sin(pulse + hub.lat) * 0.5 + 0.5) * 8;
          ctx.strokeStyle = hub.highlight ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Hub core
          ctx.fillStyle = hub.highlight ? '#10b981' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Hub label for highlighted Indian Corridors
          if (hub.highlight && normZ > 0.4) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(hub.name, px + 8, py - 4);

            ctx.fillStyle = '#34d399';
            ctx.font = '9px monospace';
            ctx.fillText(`• ${hub.code} ONLINE`, px + 8, py + 7);
          }
        }
      });

      setHoveredHub(nearestHub);

      // 6. Rim Atmospheric Light
      ctx.restore(); // Restore clip

      const rimGrad = ctx.createRadialGradient(
        cx - radius * 0.5,
        cy - radius * 0.5,
        radius * 0.6,
        cx,
        cy,
        radius
      );
      rimGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0)');
      rimGrad.addColorStop(0.98, 'rgba(56, 189, 248, 0.4)');
      rimGrad.addColorStop(1, 'rgba(14, 165, 233, 0.9)');
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Orbital Tracking Ring around Earth
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.22, radius * 0.45, -0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Mouse & touch interaction for dragging / rotating the globe
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      lastMouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    if (!isDraggingRef.current) {
      // Check if hovering globe radius
      const cx = (rect?.width || window.innerWidth) / 2;
      const cy = (rect?.height || window.innerHeight) / 2;
      const r = Math.min(rect?.width || 1, rect?.height || 1) * 0.35;
      const dx = (e.clientX - (rect?.left || 0)) - cx;
      const dy = (e.clientY - (rect?.top || 0)) - cy;
      setIsHoveringGlobe(Math.sqrt(dx * dx + dy * dy) <= r);
      return;
    }

    const deltaX = e.clientX - lastMouseRef.current.x;
    const deltaY = e.clientY - lastMouseRef.current.y;

    rotationRef.current.phi += deltaX * 0.008;
    rotationRef.current.theta = Math.max(
      -1.2,
      Math.min(1.2, rotationRef.current.theta - deltaY * 0.008)
    );

    velocityRef.current = {
      phi: deltaX * 0.004,
      theta: -deltaY * 0.004
    };

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // When clicking on the 3D globe, trigger transition to main surveillance feature
  const handleGlobeClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigateToMain();
    }, 450);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-radial from-slate-900 via-slate-950 to-black text-white flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background Starfield & Space Grid */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Top Header Badge */}
      <div className="absolute top-6 inset-x-0 z-20 flex items-center justify-between px-6 max-w-6xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-blue-500/10">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              MargaNetra 3D Highway Globe
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                SATELLITE v4.8
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              National Optical Highway Telemetry & Intelligent Surveillance Grid
            </p>
          </div>
        </div>

        {/* Enter Highway Corridor Action Button */}
        <button
          onClick={handleGlobeClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-600/30 transition-all border border-blue-400/40 cursor-pointer"
          title="Click to Launch Main Highway Surveillance Feed"
        >
          <span>Enter Highway Corridor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive 3D Canvas */}
      <div
        className={`relative w-full h-full flex-1 flex items-center justify-center transition-transform duration-500 ${
          isTransitioning ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleGlobeClick}
          className={`w-full h-full block ${isHoveringGlobe ? 'cursor-pointer' : 'cursor-grab'}`}
          title="Click the 3D Globe to Navigate to Main Highway Surveillance Feed"
        />

        {/* Hover Hub Info Tooltip */}
        {hoveredHub && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-400/50 text-white text-xs font-mono shadow-2xl flex items-center gap-2.5 pointer-events-none animate-in fade-in duration-150">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="font-bold text-cyan-300">{hoveredHub.name}</div>
              <div className="text-[10px] text-slate-400">
                Code: {hoveredHub.code} • Status: Optical Telemetry Active
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Interactive Navigation Prompt */}
      <div className="absolute bottom-8 inset-x-4 max-w-lg mx-auto z-20 pointer-events-auto flex flex-col items-center text-center">
        <button
          id="launch-main-feature-btn"
          onClick={handleGlobeClick}
          className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-xl text-white shadow-2xl transition-all active:scale-95 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-400/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Click Globe to Open Main Feature</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-[10px] text-cyan-300 font-mono">
              NH-44 Optical Corridor • 1080p Live Traffic Stream
            </div>
          </div>
        </button>

        <p className="text-[11px] text-slate-400 mt-2 font-mono">
          Drag to rotate 3D Earth • Click anywhere on the globe to enter highway surveillance
        </p>
      </div>
    </div>
  );
};
