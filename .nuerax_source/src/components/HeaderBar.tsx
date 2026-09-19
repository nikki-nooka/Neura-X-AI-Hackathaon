import React from 'react';
import {
  Navigation2,
  Radio,
  PlusCircle,
  Layers,
  MapPin,
  RefreshCw,
  LocateFixed,
  AlertCircle
} from 'lucide-react';
import { CityPreset } from '../types';

interface HeaderBarProps {
  cityPresets: CityPreset[];
  currentCity: CityPreset;
  onSelectCity: (city: CityPreset) => void;
  showTrafficLayer: boolean;
  onToggleTrafficLayer: () => void;
  onOpenReportModal: () => void;
  onRefresh: () => void;
  onLocateMe: () => void;
  activeIncidentsCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  cityPresets,
  currentCity,
  onSelectCity,
  showTrafficLayer,
  onToggleTrafficLayer,
  onOpenReportModal,
  onRefresh,
  onLocateMe,
  activeIncidentsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/25 border border-white/20">
                <Navigation2 className="w-5 h-5 fill-slate-950 stroke-slate-950 rotate-45" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
                  TraffiPulse
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Live Traffic Incidents, Road Closures & Accident Dispatch
              </p>
            </div>
          </div>

          {/* Quick mobile report button */}
          <button
            id="mobile-report-btn"
            onClick={onOpenReportModal}
            className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Report
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex flex-wrap items-center justify-end w-full md:w-auto gap-2 sm:gap-2.5">
          {/* City Selector */}
          <div className="flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/80 hover:border-slate-600 rounded-xl px-2.5 py-1.5 text-xs shadow-inner transition-colors">
            <MapPin className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
            <select
              id="city-selector"
              value={currentCity.name}
              onChange={(e) => {
                const target = cityPresets.find((c) => c.name === e.target.value);
                if (target) onSelectCity(target);
              }}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {cityPresets.map((c) => (
                <option key={c.name} value={c.name} className="bg-slate-900 text-slate-100 font-medium">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Traffic Flow Heatmap Layer Toggle */}
          <button
            id="toggle-traffic-layer-btn"
            onClick={onToggleTrafficLayer}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showTrafficLayer
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Live Google Traffic Congestion Overlay"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Traffic Flow: {showTrafficLayer ? 'ON' : 'OFF'}</span>
          </button>

          {/* Current GPS locate */}
          <button
            id="locate-me-btn"
            onClick={onLocateMe}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800 transition-all shadow-sm"
            title="Jump to My Location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          {/* Refresh button */}
          <button
            id="refresh-feed-btn"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800 transition-all shadow-sm"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Main Desktop Report CTA */}
          <button
            id="desktop-report-btn"
            onClick={onOpenReportModal}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-95 border border-amber-300/40"
          >
            <PlusCircle className="w-4 h-4" />
            Report Traffic Incident
          </button>
        </div>
      </div>
    </header>
  );
};
