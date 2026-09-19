import React from 'react';
import { AlertOctagon, Siren, Radio, ChevronRight } from 'lucide-react';
import { TrafficIncident } from '../types';
import { IncidentIcon } from './IncidentIcon';

interface LiveAlertTickerProps {
  incidents: TrafficIncident[];
  onSelectIncident: (incident: TrafficIncident) => void;
}

export const LiveAlertTicker: React.FC<LiveAlertTickerProps> = ({
  incidents,
  onSelectIncident
}) => {
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical' || i.type === 'road_closure');
  const displayItems = criticalIncidents.length > 0 ? criticalIncidents : incidents.slice(0, 3);

  return (
    <div
      id="live-alert-ticker"
      className="w-full bg-slate-900/70 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg shadow-rose-950/20"
    >
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
        <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
          <Siren className="w-3.5 h-3.5" />
          Urgent Alerts
        </span>
        <span className="hidden md:inline-block w-px h-3.5 bg-slate-700" />
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 w-full">
        {displayItems.map((inc) => (
          <button
            key={inc.id}
            onClick={() => onSelectIncident(inc)}
            className="group inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 hover:border-amber-500/50 text-left transition-all shrink-0 max-w-xs sm:max-w-md"
          >
            <IncidentIcon type={inc.type} size={14} className="text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
              {inc.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">
              ({inc.locationName.split('near')[0].split('between')[0].trim()})
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
