import React from 'react';
import {
  ThumbsUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  Share2,
  Crosshair
} from 'lucide-react';
import { TrafficIncident } from '../types';
import { IncidentIcon, INCIDENT_TYPE_LABELS } from './IncidentIcon';
import { getIncidentColor, formatRelativeTime } from '../utils/formatters';

interface IncidentCardProps {
  incident: TrafficIncident;
  isSelected: boolean;
  onSelect: () => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected,
  onSelect,
  onUpvote
}) => {
  const colors = getIncidentColor(incident.type, incident.severity);

  return (
    <div
      id={`incident-card-${incident.id}`}
      onClick={onSelect}
      className={`relative p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-slate-900/95 border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/10 translate-x-1'
          : 'bg-slate-950/70 backdrop-blur-md hover:bg-slate-900/80 border-white/10 hover:border-slate-700/80 shadow-md'
      }`}
    >
      {/* Top row: badge & time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badgeBg}`}
          >
            <IncidentIcon type={incident.type} size={13} />
            {INCIDENT_TYPE_LABELS[incident.type]}
          </span>

          {incident.severity === 'critical' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <AlertOctagon className="w-3 h-3" />
              Severe
            </span>
          )}

          {incident.verified && (
            <span
              title="Verified by emergency dispatch or multiple drivers"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            >
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono shrink-0">
          <Clock className="w-3 h-3 text-slate-500" />
          {formatRelativeTime(incident.reportedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 leading-snug mb-1">
        {incident.title}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
        <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span className="truncate">{incident.locationName}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
        {incident.description}
      </p>

      {/* Lane impact & ETA pill */}
      {incident.laneBlocked && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="font-semibold text-slate-400">Lane Block:</span>
          <span className="font-bold text-rose-400 truncate ml-2">{incident.laneBlocked}</span>
        </div>
      )}

      {/* Footer controls: upvote & reporter & focus */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
          By: {incident.reportedBy}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            ⏳ {incident.estimatedClearance || 'Active'}
          </span>

          <button
            id={`upvote-btn-${incident.id}`}
            type="button"
            onClick={(e) => onUpvote(incident.id, e)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition-all active:scale-95"
            title="Confirm this incident is active"
          >
            <ThumbsUp className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-xs font-bold">{incident.upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
