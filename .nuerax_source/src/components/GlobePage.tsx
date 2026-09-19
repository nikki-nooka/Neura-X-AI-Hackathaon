import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import Globe from 'react-globe.gl';
import {
  analyzeLocationTraffic,
  geocodeLocation,
  getCityTrafficSnapshot,
  LocationTrafficAnalysis,
  CityTrafficSnapshot,
} from '../services/trafficService';
import { TrafficLocationReport } from './TrafficLocationReport';
import { CityTrafficReport } from './CityTrafficReport';
import { majorCities, City } from '../data/cities';
import { Search, X, ArrowLeft, RefreshCw, Car, AlertTriangle, MapPin, Navigation } from 'lucide-react';

interface GlobePageProps {
  onBack?: () => void;
  onOpenGoogleMaps?: (coords: { lat: number; lng: number }, name?: string) => void;
}

export const GlobePage: React.FC<GlobePageProps> = ({ onBack, onOpenGoogleMaps }) => {
  const [locationAnalysis, setLocationAnalysis] = useState<LocationTrafficAnalysis | null>(null);
  const [citySnapshot, setCitySnapshot] = useState<CityTrafficSnapshot | null>(null);
  const [analysisType, setAnalysisType] = useState<'location' | 'city' | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const globeEl = useRef<any>(null);

  const [globeDimensions, setGlobeDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [panelTitle, setPanelTitle] = useState('Traffic & Incident Intelligence');
  const [trafficPoints, setTrafficPoints] = useState<any[]>([]);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setGlobeDimensions({
          width: containerRef.current.clientWidth || window.innerWidth,
          height: containerRef.current.clientHeight || window.innerHeight,
        });
      }
    };

    updateDimensions();
    const timer = setTimeout(updateDimensions, 50);
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Initial camera orientation
  useEffect(() => {
    if (isGlobeReady && globeEl.current) {
      globeEl.current.pointOfView({ lat: 15, lng: 40, altitude: 2.5 }, 500);
    }
  }, [isGlobeReady]);

  const openPanel = (title: string) => {
    setPanelTitle(title);
    setIsPanelOpen(true);
    setIsLoading(true);
    setError(null);
    setLocationAnalysis(null);
    setCitySnapshot(null);
    setTrafficPoints([]);
  };

  const startLocationAnalysis = useCallback(
    async (lat: number, lng: number, locationName?: string) => {
      if (isLoading) return;
      if (globeEl.current) {
        globeEl.current.pointOfView({ lat, lng, altitude: 0.6 }, 1000);
      }
      setClickedCoords({ lat, lng });
      setAnalysisType('location');
      openPanel(locationName || `Location Traffic (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`);

      try {
        const analysis = await analyzeLocationTraffic(lat, lng, locationName);
        setLocationAnalysis(analysis);
        setPanelTitle(analysis.locationName);

        // Populate traffic/incident points around coordinates on the 3D globe
        const points = [
          {
            lat,
            lng,
            name: `${analysis.locationName} - Traffic Condition: ${analysis.condition.toUpperCase()}`,
            color:
              analysis.condition === 'gridlock'
                ? '#ef4444'
                : analysis.condition === 'heavy'
                ? '#f97316'
                : '#10b981',
            radius: 0.8,
          },
          ...analysis.incidents.map((inc) => ({
            lat: inc.lat,
            lng: inc.lon,
            name: `Incident: ${inc.type} (${inc.severity}) - ${inc.locationName}`,
            color: inc.severity === 'Critical' ? '#ef4444' : '#f59e0b',
            radius: 0.6,
          })),
        ];
        setTrafficPoints(points);
      } catch (err) {
        setError('Traffic analysis failed. The intelligence engine encountered a delay.');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const startCityAnalysis = useCallback(
    async (city: City) => {
      if (isLoading) return;
      if (globeEl.current) {
        globeEl.current.pointOfView({ lat: city.lat, lng: city.lng, altitude: 0.5 }, 1000);
      }
      setClickedCoords({ lat: city.lat, lng: city.lng });
      setAnalysisType('city');
      openPanel(`Metro Traffic: ${city.name}, ${city.country}`);

      try {
        const snapshot = await getCityTrafficSnapshot(city.name, city.country);
        setCitySnapshot(snapshot);

        // Drop city incident points
        const points = [
          {
            lat: city.lat,
            lng: city.lng,
            name: `${city.name} - Congestion: ${city.congestionIndex}% (${city.trafficStatus})`,
            color: city.trafficStatus === 'Gridlock' ? '#ef4444' : '#f97316',
            radius: 0.9,
          },
          ...snapshot.recentIncidents.map((inc) => ({
            lat: inc.lat,
            lng: inc.lon,
            name: `Incident: ${inc.type} (${inc.severity})`,
            color: inc.severity === 'Critical' ? '#ef4444' : '#f59e0b',
            radius: 0.6,
          })),
        ];
        setTrafficPoints(points);
      } catch (err) {
        setError('Failed to generate city traffic snapshot.');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  // When user clicks ANY place on the 3D Earth Globe
  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      startLocationAnalysis(lat, lng);
    },
    [startLocationAnalysis]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const { lat, lng, foundLocationName } = await geocodeLocation(searchQuery);
      startLocationAnalysis(lat, lng, foundLocationName);
    } catch (err: any) {
      setSearchError(err?.message || 'Location not found. Try a city name or coordinates.');
    } finally {
      setIsSearching(false);
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSearchQuery('');
    setSearchError(null);
    setAnalysisType(null);
    setClickedCoords(null);
    setTrafficPoints([]);
    if (globeEl.current) {
      const currentPos = globeEl.current.pointOfView();
      globeEl.current.pointOfView({ ...currentPos, altitude: 2.5 }, 800);
    }
  };

  const handleResetOrbit = () => {
    if (onBack) {
      onBack();
    } else if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 15, lng: 40, altitude: 2.5 }, 800);
      closePanel();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#05080f] select-none">
      {/* 3D Earth Globe with react-globe.gl */}
      {globeDimensions.width > 0 && (
        <Globe
          ref={globeEl}
          width={globeDimensions.width}
          height={globeDimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          onGlobeClick={handleGlobeClick}
          atmosphereColor="#93c5fd"
          atmosphereAltitude={0.15}
          onGlobeReady={() => setIsGlobeReady(true)}
          pointsData={trafficPoints}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.03}
          pointRadius="radius"
          pointLabel="name"
          labelsData={majorCities}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={(d: any) => (d === hoveredLabel ? 1.1 : 0.7)}
          labelDotRadius={0.35}
          labelColor={(d: any) =>
            d === hoveredLabel
              ? '#fbbf24'
              : d.trafficStatus === 'Gridlock'
              ? '#f87171'
              : d.trafficStatus === 'Heavy'
              ? '#fb923c'
              : '#ffffff'
          }
          labelAltitude={0.015}
          onLabelClick={(label: any) => startCityAnalysis(label as City)}
          onLabelHover={(label: any) => {
            setHoveredLabel(label);
            if (containerRef.current) containerRef.current.style.cursor = label ? 'pointer' : 'default';
          }}
        />
      )}

      {/* Loading Screen during 3D Globe Shader setup */}
      {!isGlobeReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#05080f] z-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-blue-400 font-bold tracking-widest text-xs uppercase">
              Initializing 3D Earth Traffic Twin...
            </p>
          </div>
        </div>
      )}

      {/* Top Search Bar & Back Button */}
      <div
        className={`absolute top-4 left-4 right-4 flex items-center gap-2 sm:gap-4 transition-all duration-500 z-20 ${
          isPanelOpen ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <button
          onClick={handleResetOrbit}
          className="p-3 bg-white/90 backdrop-blur-xl hover:bg-white text-slate-700 hover:text-blue-600 rounded-2xl shadow-2xl border border-white/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
          title="Reset Globe View"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-grow min-w-0">
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <input
              id="globe-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, area, road or coordinates (e.g. Hyderabad, Dubai, London, 25.20, 55.27)..."
              className="w-full pl-6 pr-14 py-3.5 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold placeholder-slate-400 text-sm"
              disabled={isSearching}
            />
            <button
              id="globe-search-submit"
              type="submit"
              className="absolute top-1/2 right-2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all cursor-pointer"
            >
              {isSearching ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>
          {searchError && (
            <p className="absolute top-full left-6 text-xs text-red-400 mt-2 bg-black/80 px-3 py-1 rounded-full border border-red-900/30 backdrop-blur-md">
              {searchError}
            </p>
          )}

          {/* Quick Metro Hub Selector */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 max-w-full">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/60 shrink-0 mr-1">
              Popular Hubs:
            </span>
            {['Hyderabad', 'Dubai', 'Bengaluru', 'London', 'Tokyo', 'Singapore', 'New York', 'Bertoua', 'Lagos'].map((cName) => (
              <button
                key={cName}
                type="button"
                onClick={() => {
                  const city = majorCities.find((c) => c.name === cName);
                  if (city) {
                    startCityAnalysis(city);
                  } else {
                    geocodeLocation(cName).then(({ lat, lng, foundLocationName }) => {
                      startLocationAnalysis(lat, lng, foundLocationName);
                    });
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:border-white/40"
              >
                {cName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sliding Right-Side Panel for Traffic Conditions & Incidents */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white/95 backdrop-blur-2xl shadow-[-20px_0_40px_rgba(0,0,0,0.2)] transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) z-30 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                Traffic Digital Twin
              </span>
              <h2 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">
                {panelTitle}
              </h2>
            </div>
            <button
              onClick={closePanel}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="Close panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-900">
                    {analysisType === 'city' ? 'SYNTHESIZING METRO TRAFFIC' : 'ANALYZING TRAFFIC CORRIDORS'}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Querying Flow Sensors & Incident Databases...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-6 m-6 rounded-3xl border border-red-100 shadow-sm font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            {locationAnalysis && analysisType === 'location' && clickedCoords && (
              <div className="space-y-4">
                {onOpenGoogleMaps && (
                  <div className="px-6 pt-4">
                    <button
                      type="button"
                      onClick={() => onOpenGoogleMaps(clickedCoords, locationAnalysis.locationName)}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Launch Street-Level Google Live Radar</span>
                    </button>
                  </div>
                )}
                <TrafficLocationReport
                  result={locationAnalysis}
                  coords={clickedCoords}
                  onHighlightBypass={() => {
                    if (globeEl.current && clickedCoords) {
                      globeEl.current.pointOfView(
                        { lat: clickedCoords.lat + 0.05, lng: clickedCoords.lng, altitude: 0.35 },
                        1000
                      );
                    }
                  }}
                />
              </div>
            )}

            {citySnapshot && analysisType === 'city' && (
              <div className="space-y-4">
                {onOpenGoogleMaps && (
                  <div className="px-6 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const targetCity = majorCities.find((c) => c.name === citySnapshot.cityName);
                        if (targetCity) {
                          onOpenGoogleMaps({ lat: targetCity.lat, lng: targetCity.lng }, targetCity.name);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Launch Street-Level Google Live Radar</span>
                    </button>
                  </div>
                )}
                <CityTrafficReport snapshot={citySnapshot} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Helper Pill */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 z-10 pointer-events-none ${
          isPanelOpen ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="bg-white/10 backdrop-blur-md py-3 px-8 rounded-full border border-white/10 shadow-2xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <p className="text-xs font-black text-white/85 uppercase tracking-[0.25em] text-center">
            Click any place on the 3D globe or a city label to inspect traffic & incidents
          </p>
        </div>
      </div>
    </div>
  );
};
