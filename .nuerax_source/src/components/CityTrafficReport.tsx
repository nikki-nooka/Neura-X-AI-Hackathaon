import React from 'react';
import type { CityTrafficSnapshot } from '../services/trafficService';
import {
  Car,
  Gauge,
  AlertTriangle,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface CityTrafficReportProps {
  snapshot: CityTrafficSnapshot;
}

export const CityTrafficReport: React.FC<CityTrafficReportProps> = ({ snapshot }) => {
  return (
    <div className="p-6 space-y-6 text-slate-800">
      {/* City Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
            Metro Traffic Twin
          </span>
          <h3 className="text-xl font-black text-slate-900">{snapshot.cityName}</h3>
          {snapshot.country && (
            <p className="text-xs font-bold text-slate-500">{snapshot.country}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Congestion Index
          </span>
          <span className="text-2xl font-black text-red-600">
            {snapshot.congestionIndex}%
          </span>
        </div>
      </div>

      {/* Speed & Chokepoint Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>Metro Average Speed</span>
          </div>
          <p className="text-sm font-black text-slate-900">{snapshot.avgSpeedKmh} km/h</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Active Alerts</span>
          </div>
          <p className="text-sm font-black text-slate-900">{snapshot.activeAlertsCount} Chokepoints</p>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          Flow Telemetry Overview
        </h4>
        <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {snapshot.summary}
        </p>
      </div>

      {/* Key Corridors Status */}
      {snapshot.keyCorridors && snapshot.keyCorridors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Primary Expressways & Corridors
          </h4>
          <div className="space-y-2">
            {snapshot.keyCorridors.map((corridor, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl text-xs font-bold shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-slate-900">{corridor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      corridor.status.includes('Heavy') || corridor.status.includes('Gridlock')
                        ? 'bg-red-100 text-red-700'
                        : corridor.status.includes('Slow')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {corridor.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{corridor.delay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Incidents */}
      {snapshot.recentIncidents && snapshot.recentIncidents.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            Active Priority Incidents
          </h4>
          <div className="space-y-2">
            {snapshot.recentIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{inc.type}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inc.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">{inc.locationName}</p>
                <p className="text-xs text-slate-600">{inc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
