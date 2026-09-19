/**
 * Centralized API client for NeuraX Smart Cities Backend.
 */

const API_BASE = '/api';

export async function fetchTopology() {
  const res = await fetch(`${API_BASE}/network/topology`);
  if (!res.ok) throw new Error('Failed to fetch network topology');
  return res.json();
}

export async function fetchKPIs() {
  const res = await fetch(`${API_BASE}/network/kpis`);
  if (!res.ok) throw new Error('Failed to fetch city KPIs');
  return res.json();
}

export async function fetchPlaybackSteps() {
  const res = await fetch(`${API_BASE}/network/playback-steps`);
  if (!res.ok) throw new Error('Failed to fetch playback steps');
  return res.json();
}

export async function fetchForecast(segmentId) {
  const res = await fetch(`${API_BASE}/forecast/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment_id: segmentId }),
  });
  if (!res.ok) throw new Error('Failed to generate forecast');
  return res.json();
}

export async function fetchScorecard() {
  const res = await fetch(`${API_BASE}/forecast/metrics-scorecard`);
  if (!res.ok) throw new Error('Failed to fetch validation scorecard');
  return res.json();
}

export async function fetchSpillback(segmentId, maxHops = 3) {
  const res = await fetch(`${API_BASE}/advisory/spillback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment_id: segmentId, max_hops: maxHops }),
  });
  if (!res.ok) throw new Error('Failed to trace spillback');
  return res.json();
}

export async function fetchDiversions(segmentId) {
  const res = await fetch(`${API_BASE}/advisory/diversions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment_id: segmentId, k_paths: 3 }),
  });
  if (!res.ok) throw new Error('Failed to compute diversions');
  return res.json();
}

export async function fetchSignalTune(nodeId, congestionLevel = 'HEAVY', queue = 35) {
  const res = await fetch(`${API_BASE}/advisory/signal-tune`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      node_id: nodeId,
      congestion_level: congestionLevel,
      queue_length_veh: queue,
      is_spillback_upstream: false,
    }),
  });
  if (!res.ok) throw new Error('Failed to optimize signal');
  return res.json();
}

export async function dispatchGreenWave(originNode, destNode) {
  const res = await fetch(`${API_BASE}/emergency/green-wave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_node: originNode, destination_node: destNode }),
  });
  if (!res.ok) throw new Error('Failed to dispatch green wave');
  return res.json();
}

export async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/infrastructure/candidates`);
  if (!res.ok) throw new Error('Failed to fetch planning candidates');
  return res.json();
}

export async function fetchCandidateDetail(candidateId) {
  const res = await fetch(`${API_BASE}/infrastructure/candidate/${candidateId}`);
  if (!res.ok) throw new Error('Failed to fetch candidate details');
  return res.json();
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE}/infrastructure/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function generateBriefing(payload) {
  const res = await fetch(`${API_BASE}/briefing/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate briefing');
  return res.json();
}

export async function fetchValidationMetrics() {
  const res = await fetch(`${API_BASE}/forecast/validation-metrics`);
  if (!res.ok) throw new Error('Failed to fetch validation metrics');
  return res.json();
}

export async function simulateResilienceClosure(segmentId, durationMin = 30) {
  const res = await fetch(`${API_BASE}/resilience/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment_id: segmentId, duration_min: durationMin }),
  });
  if (!res.ok) throw new Error('Failed to simulate network resilience closure');
  return res.json();
}

export async function fetchTopCriticalSegments() {
  const res = await fetch(`${API_BASE}/resilience/top-critical`);
  if (!res.ok) throw new Error('Failed to fetch critical segments');
  return res.json();
}

export async function fetchWeeklySummary() {
  const res = await fetch(`${API_BASE}/intelligence/weekly-summary`);
  if (!res.ok) throw new Error('Failed to fetch weekly intelligence summary');
  return res.json();
}

export async function fetchAllRoadsIntelligence() {
  const res = await fetch(`${API_BASE}/network/all-roads-intelligence`);
  if (!res.ok) throw new Error('Failed to fetch all roads intelligence');
  return res.json();
}


