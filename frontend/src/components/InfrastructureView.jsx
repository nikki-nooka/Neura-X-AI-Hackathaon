import React, { useEffect, useState } from 'react';
import { ArrowUpRight, BarChart3, Building2, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { fetchCandidateDetail, fetchCandidates, fetchScenarios } from '../services/api';

export default function InfrastructureView() {
  const [candidates, setCandidates] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('PLAN0194');
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [tab, setTab] = useState('candidates'); // 'candidates' or 'scenarios'

  useEffect(() => {
    fetchCandidates().then((res) => {
      setCandidates(res);
      if (res.length > 0) setSelectedCandidateId(res[0].candidate_id);
    });
    fetchScenarios().then(setScenarios);
  }, []);

  useEffect(() => {
    if (selectedCandidateId) {
      fetchCandidateDetail(selectedCandidateId).then(setCandidateDetail);
    }
  }, [selectedCandidateId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={tab === 'candidates' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('candidates')}
          >
            <Building2 size={14} />
            <span>90 Infrastructure Upgrade Candidates</span>
          </button>
          <button
            className={tab === 'scenarios' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('scenarios')}
          >
            <BarChart3 size={14} />
            <span>30 Competition Evaluation Scenarios</span>
          </button>
        </div>

        <span className="badge badge-purple" style={{ fontSize: '11px' }}>
          Counterfactual ROI Modeling
        </span>
      </div>

      {tab === 'candidates' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Candidates Leaderboard */}
          <div className="hud-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Infrastructure Investment Priority Leaderboard
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Ranked by Capital Efficiency: ROI = (Δ Vehicle-Hours Saved) / (Cost Index)
            </p>

            <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
              <table className="hud-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Corridor</th>
                    <th>Type</th>
                    <th>Cost</th>
                    <th>Relief</th>
                    <th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr
                      key={c.candidate_id}
                      style={{
                        cursor: 'pointer',
                        background: selectedCandidateId === c.candidate_id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      }}
                      onClick={() => setSelectedCandidateId(c.candidate_id)}
                    >
                      <td style={{ fontWeight: 700, color: c.rank <= 3 ? 'var(--neon-amber)' : 'var(--text-muted)' }}>
                        #{c.rank}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--neon-cyan)' }}>
                        {c.candidate_id}
                      </td>
                      <td>{c.target_segment}</td>
                      <td>
                        <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                          {c.intervention_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>₹{c.cost_index}</td>
                      <td style={{ color: 'var(--neon-green)', fontWeight: 600 }}>-{c.delay_reduction_pct}%</td>
                      <td style={{ fontWeight: 800, color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>
                        {c.roi_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Before vs After Inspector */}
          <div className="hud-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Counterfactual Inspector ({selectedCandidateId})
            </h3>

            {candidateDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ color: '#f87171', fontSize: '13px', marginBottom: '8px' }}>📊 Baseline Conditions (Before)</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>Segment: <b style={{ color: 'var(--text-primary)' }}>{candidateDetail.target_segment}</b></div>
                    <div>Capacity: <b style={{ color: 'var(--text-primary)' }}>{candidateDetail.base_capacity_vph} vph</b></div>
                    <div>Delay: <b style={{ color: 'var(--neon-red)' }}>{candidateDetail.baseline_delay_min} min/veh</b></div>
                    <div>Status: <b style={{ color: 'var(--neon-amber)' }}>Bottleneck</b></div>
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ color: '#34d399', fontSize: '13px', marginBottom: '8px' }}>🚀 Upgraded Conditions (After)</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>Intervention: <b style={{ color: 'var(--neon-cyan)' }}>{candidateDetail.intervention_type.replace('_', ' ')}</b></div>
                    <div>New Cap: <b style={{ color: 'var(--neon-green)' }}>{candidateDetail.upgraded_capacity_vph} vph (+{candidateDetail.capacity_delta_vph})</b></div>
                    <div>Delay: <b style={{ color: 'var(--neon-green)' }}>{candidateDetail.upgraded_delay_min} min/veh</b></div>
                    <div>Relief: <b style={{ color: 'var(--neon-green)' }}>-{candidateDetail.delay_reduction_pct}%</b></div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(16, 185, 129, 0.15)', fontSize: '12px', color: 'var(--text-primary)' }}>
                    Daily Vehicle-Hours Saved: <b style={{ color: 'var(--neon-green)' }}>{candidateDetail.daily_veh_hours_saved} hrs/day</b> (ROI: <b>{candidateDetail.roi_score}</b>)
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>Select a candidate to view before/after impact.</div>
            )}
          </div>
        </div>
      ) : (
        /* 30 Scenarios Table */
        <div className="hud-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Competition Scenario Evaluation Matrix (30 Scenarios)
          </h3>
          <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
            <table className="hud-table">
              <thead>
                <tr>
                  <th>Scenario ID</th>
                  <th>Target Segment</th>
                  <th>Incident Type</th>
                  <th>Severity</th>
                  <th>Best Intervention</th>
                  <th>Action Type</th>
                  <th>Delay Relief</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--neon-cyan)' }}>{s.scenario_id}</td>
                    <td>{s.target_segment}</td>
                    <td><span className="badge badge-amber" style={{ fontSize: '9px' }}>{s.incident_type}</span></td>
                    <td>Level {s.severity}/3</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{s.best_intervention_id}</td>
                    <td>{s.intervention_type}</td>
                    <td style={{ color: 'var(--neon-green)', fontWeight: 700 }}>-{s.simulated_delay_relief_pct}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.roi_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
