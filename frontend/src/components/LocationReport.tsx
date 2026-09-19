import React, { useEffect, useRef } from 'react';
import type { LocationAnalysisResult, Facility } from '../types';
import { Shield, Building, AlertTriangle, CheckCircle, Navigation, Activity } from 'lucide-react';

interface LocationReportProps {
  result: LocationAnalysisResult;
  imageUrl: string | null;
  coords: { lat: number; lng: number };
  onFacilitiesFound?: (facilities: Omit<Facility, 'distance'>[]) => void;
}

export const LocationReport: React.FC<LocationReportProps> = ({
  result,
  imageUrl,
  coords,
  onFacilitiesFound
}) => {
  const onFacilitiesFoundRef = useRef(onFacilitiesFound);
  onFacilitiesFoundRef.current = onFacilitiesFound;
  const lastNotifiedFacilitiesRef = useRef<Facility[] | null>(null);

  useEffect(() => {
    if (result.facilities && result.facilities.length > 0) {
      if (lastNotifiedFacilitiesRef.current !== result.facilities) {
        lastNotifiedFacilitiesRef.current = result.facilities;
        onFacilitiesFoundRef.current?.(result.facilities);
      }
    }
  }, [result.facilities]);

  return (
    <div className="p-6 space-y-6 text-slate-800">
      {/* Coordinates & Safety Badge */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Target Coordinates
          </span>
          <span className="text-sm font-black text-slate-800 font-mono">
            {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
          </span>
        </div>
        {result.safetyScore !== undefined && (
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Safety Score
            </span>
            <span className="text-base font-black text-emerald-600">
              {result.safetyScore} / 100
            </span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          Executive Overview
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {result.summary}
        </p>
      </div>

      {/* Environmental & Highway Conditions */}
      {result.environmentalFactors && result.environmentalFactors.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            Corridor & Atmosphere Factors
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {result.environmentalFactors.map((factor, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100/60 text-xs font-semibold text-slate-700"
              >
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Facilities */}
      {result.facilities && result.facilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-rose-600" />
            Emergency & Medical Hubs ({result.facilities.length})
          </h4>
          <div className="space-y-2">
            {result.facilities.map((facility, i) => (
              <div
                key={i}
                className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-black text-slate-900">{facility.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{facility.address}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      facility.type === 'Hospital'
                        ? 'bg-rose-100 text-rose-700'
                        : facility.type === 'Clinic'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {facility.type}
                  </span>
                </div>
                {facility.distance && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600">
                    <Navigation className="w-3 h-3" />
                    <span>{facility.distance} from locus</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Recommended Protocol
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
