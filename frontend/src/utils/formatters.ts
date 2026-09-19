import { IncidentType, IncidentSeverity } from '../types';

export function getIncidentColor(type: IncidentType, severity: IncidentSeverity): {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  pinBg: string;
} {
  if (severity === 'critical') {
    return {
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      badgeText: 'text-rose-300',
      pinBg: '#ef4444' // red
    };
  }

  if (severity === 'moderate') {
    return {
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      badgeText: 'text-amber-300',
      pinBg: '#f59e0b' // amber
    };
  }

  return {
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/50',
    text: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    badgeText: 'text-sky-300',
    pinBg: '#38bdf8' // sky blue
  };
}

export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
