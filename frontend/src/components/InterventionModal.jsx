import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Navigation,
  Radio,
  Sliders,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { dispatchGreenWave, generateBriefing } from '../services/api';

export default function InterventionModal({
  isOpen,
  onClose,
  segmentId = 'R0435',
  onApplyDetour,
  onApplyEmergency,
}) {
  const [activeTab, setActiveTab] = useState('detour'); // 'detour', 'ambulance', 'radio'
  const [language, setLanguage] = useState('en');
  const [briefingText, setBriefingText] = useState(
    '🚨 OPERATIONAL ADVISORY [R0435]: Stalled vehicle on Outer Ring Road (East). Speed dropped to 18 km/h. Queue spillback approaching R0420 in 5 mins. Recommendation: Divert traffic via R0416 and extend green ratio at N023 by 20% for 3 cycles.'
  );
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);

  if (!isOpen) return null;

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    setLoadingBriefing(true);
    try {
      const res = await generateBriefing({
        incident_id: 'INC_LIVE_501',
        segment_id: segmentId,
        incident_type: 'stalled_vehicle',
        severity: 2,
        lanes_blocked: 1,
        current_speed: 18.0,
        current_flow: 1760.0,
        capacity: 2070.0,
        spillback_segments: ['R0418', 'R0420'],
        diversion_route: ['R0416', 'R0372', 'R0369'],
        signal_advisory: 'Extend green split at N023 by 20% for 3 cycles',
        language: lang,
      });
      setBriefingText(res.briefing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(briefingText);
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleDeployDetour = () => {
    setDeployed(true);
    if (onApplyDetour) onApplyDetour(['R0416', 'R0372', 'R0369']);
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
        zIndex: 100,
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
              <span style={{
                background: '#fef2f2',
                color: 'var(--status-red)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}>
                Stalled Vehicle · 1 Lane Blocked
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Outer Ring Road (East) · Chain-reaction queue spilling back upstream
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
                <b>Upstream Queue Spillback Detected:</b> Delay wave is propagating backwards. Segment <b>R0418</b> will be choked in <b>5 mins</b> and junction <b>N110</b> in <b>9 mins</b> unless diverted.
              </div>
            </div>

            {/* Detour Recommendation */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Recommended Rerouting: Via R0416 → R0372 → R0369
                </span>
                <span style={{ color: 'var(--status-green)', fontWeight: 700, fontSize: '12px' }}>
                  Saves 31% Delay
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>Detour Distance: <b style={{ color: 'var(--text-main)' }}>3.7 km</b></div>
                <div>Travel Time: <b style={{ color: 'var(--text-main)' }}>6.4 min</b></div>
                <div>Spare Capacity: <b style={{ color: 'var(--primary-blue)' }}>900 vph</b></div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--status-green)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} />
                <span>61 municipal turn restrictions verified — 100% legal turns</span>
              </div>
            </div>

            {/* Signal Retiming */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Adaptive Traffic Signal Split (Junction N023)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Extend green split from <b>0.58</b> to <b>0.78</b> (+20s green light) to flush the bottleneck corridor into the bypass.
              </p>
            </div>

            {/* Deploy Button */}
            <button
              className="btn-blue"
              onClick={handleDeployDetour}
              disabled={deployed}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: '13px' }}
            >
              <Zap size={16} />
              <span>{deployed ? '✓ INTERVENTION DEPLOYED ACROSS CORRIDOR' : 'DEPLOY DETOUR & SIGNAL RETIMING'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Ambulance Green Wave */}
        {activeTab === 'ambulance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <HeartPulse size={18} color="var(--status-red)" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--status-red)' }}>
                  Emergency Hospital Priority Dispatch
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#991b1b', lineHeight: 1.5 }}>
                Clears all opposing traffic and locks all 4 intermediate traffic signals along the route from <b>R0435</b> to <b>Apollo Hospital (N085)</b> to 100% green.
              </p>
            </div>

            {/* Before vs After ETA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Standard Traffic ETA</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--status-red)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  14.2 <span style={{ fontSize: '12px' }}>min</span>
                </div>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase' }}>Green Wave Priority ETA</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  4.8 <span style={{ fontSize: '12px' }}>min (-66%)</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              className="btn-blue"
              onClick={handleDispatchAmbulance}
              disabled={ambulanceDispatched}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 0',
                fontSize: '13px',
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              }}
            >
              <HeartPulse size={16} />
              <span>{ambulanceDispatched ? '🚨 CODE-3 DISPATCHED · SIGNALS PREEMPTED' : 'DISPATCH AMBULANCE GREEN WAVE (SAVE 9.4 MIN)'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Police Radio Briefing */}
        {activeTab === 'radio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={language === 'en' ? 'btn-blue' : 'btn-white-outline'}
                onClick={() => handleLanguageChange('en')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                English
              </button>
              <button
                className={language === 'hi' ? 'btn-blue' : 'btn-white-outline'}
                onClick={() => handleLanguageChange('hi')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                हिन्दी (Hindi)
              </button>
              <button
                className={language === 'te' ? 'btn-blue' : 'btn-white-outline'}
                onClick={() => handleLanguageChange('te')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                తెలుగు (Telugu)
              </button>
            </div>

            {/* Briefing Text Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '13px',
              lineHeight: 1.7,
              color: 'var(--text-main)',
              minHeight: '90px',
            }}>
              {loadingBriefing ? 'Generating briefing...' : briefingText}
            </div>

            {/* Audio Button */}
            <button
              className="btn-white-outline"
              onClick={handleSpeak}
              style={{ justifyContent: 'center', padding: '10px 0', fontSize: '13px' }}
            >
              <Volume2 size={16} color="var(--primary-blue)" />
              <span>Broadcast Over Police Radio (Audio TTS)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
