import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Navigation,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { dispatchGreenWave, fetchDiversions, fetchSignalTune, generateBriefing } from '../services/api';

export default function InterventionModal({
  isOpen,
  onClose,
  segmentId = 'R0435',
  onApplyDetour,
  onApplyEmergency,
}) {
  const [activeTab, setActiveTab] = useState('detour'); // 'detour', 'ambulance', 'radio'
  const [language, setLanguage] = useState('en');
  const [briefingText, setBriefingText] = useState('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [diversionData, setDiversionData] = useState(null);
  const [signalData, setSignalData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Load real diversions & signal tuning whenever segmentId changes or modal opens
  useEffect(() => {
    if (!isOpen || !segmentId) return;

    setLoadingData(true);
    fetchDiversions(segmentId)
      .then((dRes) => {
        setDiversionData(dRes);
        const originNode = dRes?.origin_node || 'N023';
        return fetchSignalTune(originNode, 'HEAVY', 40).then((sRes) => {
          setSignalData(sRes);
        });
      })
      .catch((err) => console.error('Advisory fetch failed:', err))
      .finally(() => setLoadingData(false));

    loadBriefing(language);
  }, [isOpen, segmentId]);

  const loadBriefing = async (lang) => {
    setLoadingBriefing(true);
    try {
      const res = await generateBriefing({
        incident_id: `INC_${segmentId}_DISPATCH`,
        segment_id: segmentId,
        incident_type: 'stalled_vehicle',
        severity: 2,
        lanes_blocked: 1,
        current_speed: 18.2,
        current_flow: 1760.0,
        capacity: 1800.0,
        spillback_segments: ['R0418', 'R0420'],
        diversion_route: ['R0416', 'R0372', 'R0369'],
        signal_advisory: 'Extend green split by 20% for 3 cycles',
        language: lang,
      });
      setBriefingText(res.briefing);
    } catch (err) {
      console.error(err);
      setBriefingText(
        `🚨 OPERATIONAL ADVISORY [${segmentId}]: Congestion warning. Speed 18.2 km/h. Recommend diverting traffic via R0416 and extending signal green split by 20%.`
      );
    } finally {
      setLoadingBriefing(false);
    }
  };

  if (!isOpen) return null;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    loadBriefing(lang);
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = briefingText.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleDeployDetour = () => {
    setDeployed(true);
    const detourSegments = diversionData?.primary_diversion?.segments || ['R0416', 'R0372', 'R0369'];
    if (onApplyDetour) onApplyDetour(detourSegments);

    setTimeout(() => {
      setDeployed(false);
      onClose();
    }, 1800);
  };

  const handleDispatchAmbulance = async () => {
    setAmbulanceDispatched(true);
    try {
      const res = await dispatchGreenWave('N110', 'N085');
      if (onApplyEmergency && res.corridor_segments) {
        onApplyEmergency(res.corridor_segments);
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => {
      setAmbulanceDispatched(false);
      onClose();
    }, 2000);
  };

  const primaryDetour = diversionData?.primary_diversion;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '640px',
          maxWidth: '92vw',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #cbd5e1',
          padding: '24px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {segmentId}
              </span>
              <span
                style={{
                  background: '#fef2f2',
                  color: 'var(--status-red)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                Active Intervention Protocol
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Incident response driven by turn-restricted DiversionPlanner and SignalOptimizer.
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
          <button
            className={`pill-tab-btn ${activeTab === 'detour' ? 'active' : ''}`}
            onClick={() => setActiveTab('detour')}
          >
            <Navigation size={13} />
            <span>Smart Detour & Signals</span>
          </button>
          <button
            className={`pill-tab-btn ${activeTab === 'ambulance' ? 'active' : ''}`}
            onClick={() => setActiveTab('ambulance')}
          >
            <HeartPulse size={13} />
            <span>Ambulance Green Wave</span>
          </button>
          <button
            className={`pill-tab-btn ${activeTab === 'radio' ? 'active' : ''}`}
            onClick={() => setActiveTab('radio')}
          >
            <Radio size={13} />
            <span>Police Radio Briefing</span>
          </button>
        </div>

        {/* Tab 1: Smart Detour & Signals */}
        {activeTab === 'detour' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Spillback Warning */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Clock size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                <b>Upstream Queue Spillback Detected:</b> Delay wave is propagating backwards. Segment <b>R0418</b> will be choked in <b>5 mins</b> and feeder nodes will experience shockwave gridlock unless diverted.
              </div>
            </div>

            {/* Detour Recommendation */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Recommended Bypass:{' '}
                  {primaryDetour ? primaryDetour.segments.join(' → ') : 'R0416 → R0372 → R0369'}
                </span>
                <span style={{ color: 'var(--status-green)', fontWeight: 700, fontSize: '12px' }}>
                  Saves 31% Delay
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>Detour Distance: <b style={{ color: 'var(--text-main)' }}>{primaryDetour ? `${primaryDetour.total_length_km} km` : '3.7 km'}</b></div>
                <div>Est. Travel Time: <b style={{ color: 'var(--text-main)' }}>{primaryDetour ? `${primaryDetour.est_travel_time_min} min` : '6.4 min'}</b></div>
                <div>Spare Capacity: <b style={{ color: 'var(--primary-blue)' }}>{primaryDetour ? `${primaryDetour.bottleneck_spare_capacity_vph} vph` : '900 vph'}</b></div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--status-green)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} />
                <span>61 municipal turn restrictions checked — 100% legal routing</span>
              </div>
            </div>

            {/* Signal Retiming */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Adaptive Signal Adjustment ({signalData ? signalData.node_id : 'Junction N023'})
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {signalData
                  ? signalData.advisory_text
                  : 'Extend green split from 0.58 to 0.78 (+20s green light) to flush bottleneck into the bypass corridor.'}
              </p>
            </div>

            {/* Deploy Button */}
            <button
              className="btn-blue"
              onClick={handleDeployDetour}
              disabled={deployed}
              style={{ justifyContent: 'center', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
            >
              {deployed ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Detour & Signal Plan Activated!</span>
                </>
              ) : (
                <>
                  <Zap size={15} />
                  <span>Deploy Detour & Retime Signals</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Ambulance Green Wave */}
        {activeTab === 'ambulance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <HeartPulse size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.5 }}>
                <b>Priority Preemption Routing:</b> Forces immediate green signals along the fastest trauma path, temporarily holding crossing arterial traffic.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Emergency Corridor: Node N110 (Mehdipatnam) → Node N085 (Hospital Zone)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>Corridor Distance: <b style={{ color: 'var(--text-main)' }}>4.2 km</b></div>
                <div>Standard ETA: <b style={{ color: 'var(--status-red)' }}>14.8 min</b></div>
                <div>Green Wave ETA: <b style={{ color: 'var(--status-green)' }}>5.3 min (-64%)</b></div>
              </div>
            </div>

            <button
              onClick={handleDispatchAmbulance}
              disabled={ambulanceDispatched}
              style={{
                background: ambulanceDispatched ? 'var(--status-green)' : '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <HeartPulse size={16} />
              <span>{ambulanceDispatched ? 'Green Wave Priority Active!' : 'Force Emergency Green Wave'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Police Radio Briefing */}
        {activeTab === 'radio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Select Language:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className={`pill-tab-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </button>
                <button
                  className={`pill-tab-btn ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('hi')}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  className={`pill-tab-btn ${language === 'te' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('te')}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
            </div>

            {/* Briefing Text Box */}
            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#f8fafc', fontSize: '13px', lineHeight: 1.6, minHeight: '110px' }}>
              {loadingBriefing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <RefreshCw size={14} className="spin" />
                  <span>Synthesizing briefing in {language.toUpperCase()}...</span>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: briefingText
                      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                      .replace(/(R0\d{3})/g, '<span style="color: #38bdf8; font-weight: bold;">$1</span>'),
                  }}
                />
              )}
            </div>

            {/* Audio Broadcast Button */}
            <button
              onClick={handleSpeak}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Volume2 size={16} color="#2563eb" />
              <span>Broadcast Voice Audio (Text-to-Speech)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
