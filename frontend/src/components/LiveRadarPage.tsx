import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Navigation2,
  Layers,
  PlusCircle,
  Radio,
  MapPin,
  RefreshCw,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { LiveTrafficMap } from './LiveTrafficMap';
import { IncidentFilterBar } from './IncidentFilterBar';
import { IncidentCard } from './IncidentCard';
import { TrafficIncident, CityPreset, IncidentFilter } from '../types';
import { CITY_PRESETS } from '../mockData';

interface LiveRadarPageProps {
  incidents: TrafficIncident[];
  onBack: () => void;
  onOpenGlobe: () => void;
  onOpenReportModal: (prefillCoords?: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number } | null;
  initialCityName?: string | null;
  onUpvoteIncident: (id: string, e: React.MouseEvent) => void;
  onReplayIntro?: () => void;
}

const EXTENDED_CITIES: CityPreset[] = [
  ...CITY_PRESETS,
  { name: 'Hyderabad, IN', lat: 17.385, lng: 78.4867, zoom: 13 },
  { name: 'Bengaluru, IN', lat: 12.9716, lng: 77.5946, zoom: 13 },
  { name: 'Tokyo, JP', lat: 35.6762, lng: 139.6503, zoom: 13 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, zoom: 13 }
];

export const LiveRadarPage: React.FC<LiveRadarPageProps> = ({
  incidents,
  onBack,
  onOpenGlobe,
  onOpenReportModal,
  initialCoords,
  initialCityName,
  onUpvoteIncident,
  onReplayIntro
}) => {
  const [currentCity, setCurrentCity] = useState<CityPreset>(() => {
    if (initialCoords) {
      return {
        name: initialCityName || 'Target Surveillance Point',
        lat: initialCoords.lat,
        lng: initialCoords.lng,
        zoom: 14
      };
    }
    return EXTENDED_CITIES[0];
  });

  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [filter, setFilter] = useState<IncidentFilter>({
    type: 'all',
    severity: 'all',
    searchQuery: '',
    onlyVerified: false
  });

  // Filter incidents based on active criteria
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (filter.type !== 'all' && item.type !== filter.type) return false;
      if (filter.severity !== 'all' && item.severity !== filter.severity) return false;
      if (filter.onlyVerified && !item.verified) return false;
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchLoc = item.locationName.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchDesc) return false;
      }
      return true;
    });
  }, [incidents, filter]);

  // Metric counts for filter bar tabs
  const counts = useMemo(() => {
    return {
      total: incidents.length,
      accidents: incidents.filter((i) => i.type === 'accident').length,
      closures: incidents.filter((i) => i.type === 'road_closure').length,
      hazards: incidents.filter((i) => i.type === 'hazard').length,
      construction: incidents.filter((i) => i.type === 'construction').length
    };
  }, [incidents]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col select-none font-sans text-white">
      {/* Top Header Navigation */}
      <header className="flex-shrink-0 z-30 bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Back button & brand */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 shadow-sm transition-all cursor-pointer"
                title="Return to Optical Surveillance Feed"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div
                onClick={onReplayIntro}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Click to view MargaNetra 3-Mode Intro Animations"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-transform">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white tracking-tight group-hover:text-blue-300 transition-colors">
                      MargaNetra Live Radar
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      GOOGLE MAPS
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Live Street Flow & Traffic Incident Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center: City Hub Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden lg:inline-block">
              Metro Corridor:
            </span>
            {EXTENDED_CITIES.map((city) => {
              const isSelected = currentCity.name === city.name;
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    setCurrentCity(city);
                    setSelectedIncident(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                  }`}
                >
                  {city.name.split(',')[0]}
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 3D Globe Quick Switch */}
            <button
              type="button"
              onClick={onOpenGlobe}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Open Global 3D Planetary View"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">3D Globe</span>
            </button>

            {/* Report Road Incident */}
            <button
              type="button"
              onClick={() => onOpenReportModal({ lat: currentCity.lat, lng: currentCity.lng })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.4]" />
              <span>Report Alert</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Radar Workspace */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Left / Center Map Viewport */}
        <div className="relative flex-1 h-full overflow-hidden">
          <LiveTrafficMap
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            center={{ lat: currentCity.lat, lng: currentCity.lng }}
            zoom={currentCity.zoom}
            showTrafficLayer={showTrafficLayer}
            onToggleTrafficLayer={() => setShowTrafficLayer(!showTrafficLayer)}
            onMapClick={(coords) => {
              onOpenReportModal(coords);
            }}
          />

          {/* Floating Sidebar Toggle Button on Desktop */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex absolute top-3.5 right-16 z-20 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-xl shadow-xl text-xs font-bold transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSidebarOpen ? 'Hide Alerts' : `Show Alerts (${filteredIncidents.length})`}</span>
          </button>
        </div>

        {/* Right Sidebar: Filter & Live Incidents Feed */}
        {isSidebarOpen && (
          <aside className="w-full md:w-96 lg:w-[420px] h-full bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 flex flex-col z-20 shadow-2xl overflow-hidden transition-all">
            {/* Sidebar Top Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white tracking-tight uppercase">
                  Verified Alert Log
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {filteredIncidents.length} Active
              </span>
            </div>

            {/* Filter Section */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40">
              <IncidentFilterBar
                filter={filter}
                onChangeFilter={setFilter}
                counts={counts}
              />
            </div>

            {/* Incidents Card Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredIncidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 space-y-2 text-slate-400">
                  <AlertTriangle className="w-8 h-8 text-slate-500" />
                  <p className="text-sm font-bold text-slate-300">No Incidents Found</p>
                  <p className="text-xs text-slate-500">
                    Try adjusting your keyword filter or check another metro area.
                  </p>
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    isSelected={selectedIncident?.id === incident.id}
                    onSelect={() => setSelectedIncident(incident)}
                    onUpvote={onUpvoteIncident}
                  />
                ))
              )}
            </div>

            {/* Footer Guidance */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Click on any card to pan Google Map</span>
              <span className="text-amber-400 font-bold">● Live Sync</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
