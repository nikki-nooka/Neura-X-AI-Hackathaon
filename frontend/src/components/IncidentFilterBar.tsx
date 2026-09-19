import React from 'react';
import {
  CarFront,
  Ban,
  Cone,
  AlertTriangle,
  Search,
  CheckCircle,
  SlidersHorizontal
} from 'lucide-react';
import { IncidentFilter, IncidentType, IncidentSeverity } from '../types';
import { IncidentIcon, INCIDENT_TYPE_LABELS } from './IncidentIcon';

interface IncidentFilterBarProps {
  filter: IncidentFilter;
  onChangeFilter: (newFilter: IncidentFilter) => void;
  counts: {
    total: number;
    accidents: number;
    closures: number;
    hazards: number;
    construction: number;
  };
}

export const IncidentFilterBar: React.FC<IncidentFilterBarProps> = ({
  filter,
  onChangeFilter,
  counts
}) => {
  const tabs: { id: 'all' | IncidentType; label: string; count: number }[] = [
    { id: 'all', label: 'All Live', count: counts.total },
    { id: 'accident', label: 'Accidents', count: counts.accidents },
    { id: 'road_closure', label: 'Closures', count: counts.closures },
    { id: 'hazard', label: 'Hazards', count: counts.hazards },
    { id: 'construction', label: 'Work Zones', count: counts.construction }
  ];

  return (
    <div className="space-y-2.5">
      {/* Search and Verified toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="incident-search-input"
            type="text"
            placeholder="Search roads, highways, or keywords..."
            value={filter.searchQuery}
            onChange={(e) => onChangeFilter({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        {/* Severity filter */}
        <select
          id="severity-filter-select"
          value={filter.severity}
          onChange={(e) =>
            onChangeFilter({ ...filter, severity: e.target.value as 'all' | IncidentSeverity })
          }
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical Severe</option>
          <option value="moderate">Moderate Delay</option>
          <option value="minor">Minor Warning</option>
        </select>
      </div>

      {/* Type pill filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {tabs.map((tab) => {
          const isActive = filter.type === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              onClick={() => onChangeFilter({ ...filter, type: tab.id })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-400'
                  : 'bg-slate-900/70 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10'
              }`}
            >
              {tab.id !== 'all' && (
                <IncidentIcon type={tab.id} size={13} className={isActive ? 'text-slate-950' : 'text-amber-400'} />
              )}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  isActive ? 'bg-slate-950/25 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
