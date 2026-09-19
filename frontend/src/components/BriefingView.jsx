import React, { useState } from 'react';
import { Bot, Copy, Globe2, MessageSquare, Radio, Sparkles, Volume2 } from 'lucide-react';
import { generateBriefing } from '../services/api';

export default function BriefingView({ activeSegment = 'R0435' }) {
  const [segmentId, setSegmentId] = useState(activeSegment);
  const [incidentType, setIncidentType] = useState('stalled_vehicle');
  const [severity, setSeverity] = useState(2);
  const [language, setLanguage] = useState('en');
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateBriefing({
        incident_id: 'INC_LIVE_501',
        segment_id: segmentId,
        incident_type: incidentType,
        severity: severity,
        lanes_blocked: 1,
        current_speed: 14.5,
        current_flow: 720.0,
        capacity: 1800.0,
        spillback_segments: ['R0434', 'R0420', 'R0418'],
        diversion_route: ['R0430', 'R0422', 'R0410'],
        signal_advisory: 'Extend green ratio at N023 by 15% for 3 cycles',
        language: language,
      });
      setBriefing(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!briefing || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(briefing.briefing);
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!briefing) return;
    navigator.clipboard.writeText(briefing.briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
      {/* Parameter Controls */}
      <div className="hud-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Radio size={18} color="var(--neon-purple)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Dispatch Voice/Text Synthesizer</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Transforms telemetry, shockwaves, and diversions into concise police walkie-talkie action briefings.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Target Corridor Segment
            </label>
            <input
              type="text"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Incident Type
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                <option value="stalled_vehicle">Stalled Vehicle</option>
                <option value="accident_like">Accident / Collision</option>
                <option value="lane_blockage">Lane Blockage</option>
                <option value="road_closure">Road Closure</option>
                <option value="demand_surge">Demand Surge</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                <option value={1}>Severity 1 (Minor)</option>
                <option value={2}>Severity 2 (Moderate)</option>
                <option value={3}>Severity 3 (Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Broadcast Language
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className={language === 'en' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setLanguage('en')}
                style={{ justifyContent: 'center' }}
              >
                English
              </button>
              <button
                type="button"
                className={language === 'hi' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setLanguage('hi')}
                style={{ justifyContent: 'center' }}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                className={language === 'te' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setLanguage('te')}
                style={{ justifyContent: 'center' }}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
          <Sparkles size={16} />
          <span>{loading ? 'SYNTHESIZING BRIEFING...' : 'GENERATE ACTION BRIEFING'}</span>
        </button>
      </div>

      {/* Generated Report Card */}
      <div className="hud-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} color="var(--neon-green)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Operational Dispatch Report</h3>
          </div>

          {briefing && (
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
              {briefing.provider}
            </span>
          )}
        </div>

        {briefing ? (
          <div>
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '20px',
                fontSize: '14px',
                lineHeight: 1.8,
                color: 'var(--text-primary)',
                marginBottom: '18px',
              }}
            >
              {briefing.briefing}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleSpeak}>
                <Volume2 size={14} color="var(--neon-cyan)" />
                <span>Read Out Loud (TTS)</span>
              </button>
              <button className="btn-secondary" onClick={handleCopy}>
                <Copy size={14} />
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Configure the parameters and click <b>Generate Action Briefing</b> to preview the real-time report.
          </div>
        )}
      </div>
    </div>
  );
}
