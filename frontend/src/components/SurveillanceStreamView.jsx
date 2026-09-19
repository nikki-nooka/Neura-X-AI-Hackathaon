import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Play,
  Pause,
  Upload,
  RefreshCw,
  Sliders,
  Sparkles,
  Shield,
  Activity,
  Maximize2,
  Camera,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function SurveillanceStreamView({ onOpenReportModal, onNavigate }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeFeed, setActiveFeed] = useState('/pexels-traffic.mp4');
  const [feedTitle, setFeedTitle] = useState('NH-44 Outer Ring Expressway (Optical Cam 04)');
  const [hudOverlay, setHudOverlay] = useState(true);
  const [aiDetection, setAiDetection] = useState(true);

  const feeds = [
    {
      id: 'f1',
      title: 'NH-44 Expressway (Optical Cam 04)',
      src: '/pexels-traffic.mp4',
      poster: '/pexels-poster.jpg',
      fps: '30 FPS',
      resolution: '1080p HD',
      flow: 'Heavy · 24 km/h',
    },
    {
      id: 'f2',
      title: 'City Arterial Corridor (Cam 09)',
      src: '/traffic-bg.webm',
      poster: '/traffic-poster.jpg',
      fps: '60 FPS',
      resolution: '4K Ultra',
      flow: 'Moderate · 42 km/h',
    },
    {
      id: 'f3',
      title: 'West Junction Overpass (Cam 12)',
      src: '/original-traffic.webm',
      poster: '/highway-landscape-poster.jpg',
      fps: '30 FPS',
      resolution: '1080p HD',
      flow: 'Flowing · 58 km/h',
    },
    {
      id: 'f4',
      title: 'Bay Bridge Expressway Feed',
      src: '/sf-traffic.webm',
      poster: '/pexels-poster.jpg',
      fps: '30 FPS',
      resolution: '1080p HD',
      flow: 'Dense · 31 km/h',
    },
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [activeFeed]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setActiveFeed(url);
      setFeedTitle(`Custom Stream: ${file.name}`);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              fontSize: '11px',
              fontWeight: 800,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
              OPTICAL CCTV SURVEILLANCE
            </span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Surveillance Grid · 12 Active High-Speed Feeds</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {feedTitle}
          </h2>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setHudOverlay(!hudOverlay)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: hudOverlay ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: hudOverlay ? '#38bdf8' : '#94a3b8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Layers size={14} />
            <span>HUD Telemetry {hudOverlay ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setAiDetection(!aiDetection)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: aiDetection ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: aiDetection ? '#34d399' : '#94a3b8',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>AI Bounding Boxes {aiDetection ? 'ON' : 'OFF'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Upload size={14} />
            <span>Upload Feed</span>
          </button>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              }}
            >
              <AlertCircle size={14} />
              <span>Report Incident</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video Surveillance Theater Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1.1fr',
        gap: '18px',
      }}>
        {/* Main Surveillance Viewport */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#040914',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
          minHeight: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <video
            ref={videoRef}
            key={activeFeed}
            src={activeFeed}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '520px',
              objectFit: 'cover',
            }}
          />

          {/* AI Bounding Boxes Mock Layer */}
          {aiDetection && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* Box 1 */}
              <div style={{
                position: 'absolute',
                top: '42%',
                left: '28%',
                width: '75px',
                height: '50px',
                border: '2px solid #00d4ff',
                borderRadius: '4px',
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.6)',
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-18px',
                  left: 0,
                  background: '#00d4ff',
                  color: '#000',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                }}>
                  SEDAN · 54 km/h
                </span>
              </div>

              {/* Box 2 */}
              <div style={{
                position: 'absolute',
                top: '55%',
                left: '52%',
                width: '110px',
                height: '75px',
                border: '2px solid #ef4444',
                borderRadius: '4px',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.7)',
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-18px',
                  left: 0,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                }}>
                  SLOW VEHICLE · 18 km/h
                </span>
              </div>

              {/* Box 3 */}
              <div style={{
                position: 'absolute',
                top: '38%',
                left: '70%',
                width: '65px',
                height: '45px',
                border: '2px solid #10b981',
                borderRadius: '4px',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-18px',
                  left: 0,
                  background: '#10b981',
                  color: '#000',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 4px',
                  borderRadius: '2px',
                }}>
                  SUV · 62 km/h
                </span>
              </div>
            </div>
          )}

          {/* HUD Telemetry Overlay */}
          {hudOverlay && (
            <>
              {/* Top HUD bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                insetX: 0,
                padding: '12px 18px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace',
                pointerEvents: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>LIVE FEED // CAM-04-NORTH</span>
                  <span style={{ color: '#94a3b8' }}>LAT 17.3850° N · LNG 78.4867° E</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ color: '#10b981' }}>CODEC: H.265 / LOW LATENCY (18ms)</span>
                  <span style={{ color: '#f59e0b' }}>BITRATE: 8.4 Mbps</span>
                </div>
              </div>

              {/* Bottom HUD bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                insetX: 0,
                padding: '12px 18px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>

                  <div style={{ color: '#cbd5e1', fontSize: '11px', fontFamily: 'monospace' }}>
                    FRAME ACCURACY: <span style={{ color: '#38bdf8' }}>99.4%</span> · LANE OCCUPANCY: <span style={{ color: '#ef4444' }}>84.2%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.requestFullscreen?.();
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Maximize2 size={12} />
                    <span>Fullscreen</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Camera Selector Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Camera size={14} color="#38bdf8" />
            <span>Select Optical Camera</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {feeds.map((feed) => {
              const isSelected = activeFeed === feed.src;
              return (
                <div
                  key={feed.id}
                  onClick={() => {
                    setActiveFeed(feed.src);
                    setFeedTitle(feed.title);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#ffffff' }}>
                      {feed.title}
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                    }}>
                      {feed.fps}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                    <span>{feed.resolution}</span>
                    <span style={{ color: feed.flow.includes('Heavy') ? '#ef4444' : feed.flow.includes('Dense') ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {feed.flow}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Incident Telemetry Card */}
          <div style={{
            marginTop: 'auto',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(11, 21, 40, 0.8)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Shield size={16} color="#ef4444" />
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>AI Incident Detection</div>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
              RandomForest detector running at 30 fps over surveillance frame stream. 1 stalled vehicle detected on Eastbound outer lane.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
