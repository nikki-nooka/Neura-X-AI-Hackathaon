import React, { useEffect, useRef } from 'react';

interface NavbarGlobe3DProps {
  className?: string;
  size?: number;
}

export const NavbarGlobe3D: React.FC<NavbarGlobe3DProps> = ({ className = '', size = 22 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let rotation = 0;
    const radius = size * 0.44;
    const cx = size / 2;
    const cy = size / 2;

    // Generate some stable points for the mini globe
    const points: { lat: number; lng: number }[] = [];
    for (let lat = -60; lat <= 60; lat += 25) {
      const count = Math.max(4, Math.round(12 * Math.cos((lat * Math.PI) / 180)));
      for (let i = 0; i < count; i++) {
        points.push({ lat, lng: (360 / count) * i });
      }
    }

    const render = () => {
      rotation += 0.035;
      ctx.clearRect(0, 0, size, size);

      // Base atmospheric glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.15);
      glowGrad.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
      glowGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Sphere base
      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      sphereGrad.addColorStop(0, '#0284c7');
      sphereGrad.addColorStop(0.7, '#0369a1');
      sphereGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere outline
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Latitude lines
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Draw latitude curves
      for (let lat = -40; lat <= 40; lat += 40) {
        const latRad = (lat * Math.PI) / 180;
        const rLat = radius * Math.cos(latRad);
        const yLat = cy - radius * Math.sin(latRad) * 0.85;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.ellipse(cx, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw spinning dots (continents / stations)
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const latRad = (pt.lat * Math.PI) / 180;
        const lngRad = ((pt.lng + rotation * 35) * Math.PI) / 180;

        const z = radius * Math.cos(latRad) * Math.cos(lngRad);
        if (z > 0) {
          const x = cx + radius * Math.cos(latRad) * Math.sin(lngRad);
          const y = cy - radius * Math.sin(latRad);
          const alpha = 0.3 + (z / radius) * 0.7;

          ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [size]);

  return <canvas ref={canvasRef} className={`inline-block shrink-0 ${className}`} />;
};
