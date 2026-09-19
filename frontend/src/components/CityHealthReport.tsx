import React from 'react';
import type { CityHealthSnapshot } from '../types';
import { Activity, ShieldCheck, Wind, Car, CheckCircle2 } from 'lucide-react';

interface CityHealthReportProps {
  snapshot: CityHealthSnapshot;
}

export const CityHealthReport: React.FC<CityHealthReportProps> = ({ snapshot }) => {
  return (
    <div className="p-6 space-y-6 text-slate-800">
      {/* City Header & Overall Score */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100/80">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
            City Surveillance Snapshot
          </span>
          <h3 className="text-xl font-black text-slate-900">
            {snapshot.cityName}
          </h3>
          {snapshot.country && (
            <p className="text-xs font-semibold text-slate-500">{snapshot.country}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Overall Health Index
          </span>
          <span className="text-2xl font-black text-blue-600">
            {snapshot.overallScore}%
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Wind className="w-4 h-4 text-cyan-600" />
            <span>Air & Environment</span>
          </div>
          <p className="text-xs font-black text-slate-800">{snapshot.airQuality}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Car className="w-4 h-4 text-amber-600" />
            <span>Traffic Congestion</span>
          </div>
          <p className="text-xs font-black text-slate-800">{snapshot.trafficCongestion}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Emergency Readiness</span>
          </div>
          <p className="text-xs font-black text-slate-800">{snapshot.emergencyReadiness}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          Infrastructure Summary
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {snapshot.summary}
        </p>
      </div>

      {/* Key Insights */}
      {snapshot.keyInsights && snapshot.keyInsights.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Key Environmental Observations
          </h4>
          <div className="space-y-2">
            {snapshot.keyInsights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 bg-white border border-slate-200/70 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
