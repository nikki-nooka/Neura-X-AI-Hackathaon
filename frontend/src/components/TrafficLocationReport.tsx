import React from 'react';
import type { LocationTrafficAnalysis } from '../services/trafficService';
import {
  Car,
  Gauge,
  Clock,
  Video,
  AlertTriangle,
  Route,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TrafficLocationReportProps {
  result: LocationTrafficAnalysis;
  coords: { lat: number; lng: number };
  onHighlightBypass?: () => void;
}

export const TrafficLocationReport: React.FC<TrafficLocationReportProps> = ({
  result,
  coords,
  onHighlightBypass
}) => {
  const getBadgeStyle = (condition: string) => {
    switch (condition) {
      case 'gridlock':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'heavy':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'moderate':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-800">
      {/* Top Status & Coordinates Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
            Corridor Coordinates
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getBadgeStyle(
              result.condition
            )}`}
          >
            {result.condition}
          </span>
        </div>
        <p className="text-sm font-mono font-bold text-slate-800">
          {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
        </p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <Gauge className="w-4 h-4 text-blue-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Speed
          </span>
          <span className="text-lg font-black text-slate-900">{result.speedKmh} km/h</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <Car className="w-4 h-4 text-amber-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Congestion
          </span>
          <span className="text-lg font-black text-slate-900">
            {result.congestionPercentage}%
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <Clock className="w-4 h-4 text-rose-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Est. Delay
          </span>
          <span className="text-lg font-black text-slate-900">+{result.delayMinutes}m</span>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-blue-600" />
          Optical Stream & Telemetry Summary ({result.cctvCount} CCTVs)
        </h4>
        <p className="text-sm text-slate-600 font-medium leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60">
          {result.summary}
        </p>
      </div>

      {/* Active Incidents on Corridor */}
      {result.incidents && result.incidents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Detected Incidents ({result.incidents.length})
          </h4>
          <div className="space-y-2.5">
            {result.incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-black text-slate-900">{inc.type}</h5>
                    <p className="text-[11px] text-slate-500 font-semibold">{inc.locationName}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inc.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : inc.severity === 'Major'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">{inc.description}</p>
                {inc.laneBlocked && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Impact: {inc.laneBlocked}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Bypass Route */}
      {result.bypassRoute && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
              <Route className="w-4 h-4 text-emerald-600" />
              <span>Smart Bypass Recommendation</span>
            </div>
            {onHighlightBypass && (
              <button
                type="button"
                onClick={onHighlightBypass}
                className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                Inspect <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs font-medium text-emerald-900">{result.bypassRoute}</p>
        </div>
      )}

      {/* Corridor Protocols */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Dispatch Protocols
          </h4>
          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs font-semibold text-slate-700 p-2.5 bg-slate-50 rounded-xl"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
