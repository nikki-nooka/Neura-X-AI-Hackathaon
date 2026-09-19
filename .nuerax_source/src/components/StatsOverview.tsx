import React from 'react';
import {
  CarFront,
  Ban,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { TrafficIncident } from '../types';

interface StatsOverviewProps {
  incidents: TrafficIncident[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ incidents }) => {
  const total = incidents.length;
  const critical = incidents.filter((i) => i.severity === 'critical').length;
  const accidents = incidents.filter((i) => i.type === 'accident').length;
  const closures = incidents.filter((i) => i.type === 'road_closure').length;
  const hazards = incidents.filter((i) => i.type === 'hazard' || i.type === 'construction').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Accidents */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-rose-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-lg hover:shadow-rose-950/20 group">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-105 transition-transform">
            <CarFront className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white leading-tight font-mono">{accidents}</div>
            <div className="text-xs text-slate-400 font-medium">Active Accidents</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 hidden sm:inline">
          Live
        </span>
      </div>

      {/* Closures */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-lg hover:shadow-amber-950/20 group">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white leading-tight font-mono">{closures}</div>
            <div className="text-xs text-slate-400 font-medium">Road Closures</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
          Detours
        </span>
      </div>

      {/* Critical bottlenecks */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-red-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-lg hover:shadow-red-950/20 group">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white leading-tight font-mono">{critical}</div>
            <div className="text-xs text-slate-400 font-medium">Critical Blocks</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hidden sm:inline">
          High Impact
        </span>
      </div>

      {/* Verified Network Coverage */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-lg hover:shadow-emerald-950/20 group">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-400 leading-tight font-mono">99.2%</div>
            <div className="text-xs text-slate-400 font-medium">Verified Grid</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
          Realtime
        </span>
      </div>
    </div>
  );
};
