import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  MapMouseEvent
} from '@vis.gl/react-google-maps';
import { TrafficIncident } from '../types';
import { GOOGLE_MAPS_API_KEY } from '../utils/googleMapsLoader';
import { INCIDENT_TYPE_LABELS } from './IncidentIcon';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  CarFront,
  Ban,
  Cone,
  AlertTriangle,
  Info,
  Clock,
  ThumbsUp,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface LiveTrafficMapProps {
  incidents: TrafficIncident[];
  selectedIncident: TrafficIncident | null;
  onSelectIncident: (incident: TrafficIncident | null) => void;
  center: { lat: number; lng: number };
  zoom: number;
  showTrafficLayer: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onToggleTrafficLayer?: () => void;
}

// Dark Cyber styling for highway radar mode
const DARK_RADAR_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#132035' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0a0f1d' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#020617' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#172235' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060913' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

// Subcomponent to manage Google Maps Traffic Layer
function TrafficLayerComponent({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const layerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!layerRef.current) {
      layerRef.current = new google.maps.TrafficLayer();
    }
    if (enabled) {
      layerRef.current.setMap(map);
    } else {
      layerRef.current.setMap(null);
    }
    return () => {
      layerRef.current?.setMap(null);
    };
  }, [map, enabled]);

  return null;
}

// Subcomponent to smoothly pan and adjust camera
function CameraController({
  center,
  zoom,
  selectedIncident
}: {
  center: { lat: number; lng: number };
  zoom: number;
  selectedIncident: TrafficIncident | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedIncident) {
      map.panTo({ lat: selectedIncident.lat, lng: selectedIncident.lng });
      map.setZoom(15);
    } else {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom, selectedIncident]);

  return null;
}

// Subcomponent for custom zoom and recenter HUD buttons
function MapHudControls({
  center,
  zoom
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    if (map) map.setZoom((map.getZoom() ?? zoom) + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom((map.getZoom() ?? zoom) - 1);
  };

  const handleRecenter = () => {
    if (map) {
      map.setHeading(0);
      map.panTo(center);
      map.setZoom(zoom);
    }
  };

  return (
    <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-1.5">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl flex flex-col overflow-hidden shadow-xl">
        <button
          id="map-zoom-in-btn"
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="map-zoom-out-btn"
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <button
        id="map-recenter-btn"
        onClick={handleRecenter}
        className="p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-slate-300 hover:text-amber-400 shadow-xl transition-all cursor-pointer"
        title="Reset to City Center"
      >
        <Compass className="w-4 h-4" />
      </button>
    </div>
  );
}

export const LiveTrafficMap: React.FC<LiveTrafficMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  center,
  zoom,
  showTrafficLayer,
  onMapClick,
  onToggleTrafficLayer
}) => {
  const [mapStyleType, setMapStyleType] = useState<'dark' | 'roadmap' | 'hybrid'>('dark');

  const activeStyles = useMemo(() => {
    if (mapStyleType === 'dark') return DARK_RADAR_STYLE;
    return undefined;
  }, [mapStyleType]);

  const activeMapTypeId = useMemo(() => {
    if (mapStyleType === 'hybrid') return 'hybrid';
    return 'roadmap';
  }, [mapStyleType]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!onMapClick || !e.detail.latLng) return;
    onMapClick({
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng
    });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950/80 backdrop-blur-xl">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          id="marganetra-live-map"
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={true}
          mapTypeId={activeMapTypeId}
          styles={activeStyles}
          onClick={handleMapClick}
          className="w-full h-full min-h-[460px]"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Traffic Layer */}
          <TrafficLayerComponent enabled={showTrafficLayer} />

          {/* Camera adjustments */}
          <CameraController center={center} zoom={zoom} selectedIncident={selectedIncident} />

          {/* Map HUD buttons */}
          <MapHudControls center={center} zoom={zoom} />

          {/* Advanced Markers for All Active Incidents */}
          {incidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const pinColor =
              incident.severity === 'critical'
                ? '#ef4444'
                : incident.severity === 'moderate'
                ? '#f59e0b'
                : '#38bdf8';

            return (
              <AdvancedMarker
                key={incident.id}
                position={{ lat: incident.lat, lng: incident.lng }}
                title={incident.title}
                zIndex={isSelected ? 999 : incident.severity === 'critical' ? 100 : 50}
                onClick={() => onSelectIncident(incident)}
              >
                <div
                  className={`group relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                >
                  {/* Pin Body */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-2xl border-2 transition-transform ${
                      isSelected
                        ? 'border-white ring-4 ring-white/40 animate-pulse'
                        : 'border-slate-950 ring-1 ring-white/30'
                    }`}
                    style={{ backgroundColor: pinColor }}
                  >
                    {incident.type === 'accident' && (
                      <CarFront className="w-5 h-5 text-white stroke-[2.2]" />
                    )}
                    {incident.type === 'road_closure' && (
                      <Ban className="w-5 h-5 text-white stroke-[2.2]" />
                    )}
                    {incident.type === 'construction' && (
                      <Cone className="w-5 h-5 text-white stroke-[2.2]" />
                    )}
                    {incident.type === 'hazard' && (
                      <AlertTriangle className="w-5 h-5 text-white stroke-[2.2]" />
                    )}
                  </div>

                  {/* Pulsing beacon underneath when selected */}
                  {isSelected && (
                    <span className="absolute -bottom-1 w-3 h-1.5 rounded-full bg-white/90 shadow-md animate-ping" />
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow for Selected Incident */}
          {selectedIncident && (
            <InfoWindow
              position={{ lat: selectedIncident.lat, lng: selectedIncident.lng }}
              onCloseClick={() => onSelectIncident(null)}
              headerDisabled={true}
              pixelOffset={[0, -20]}
            >
              <div className="p-3 max-w-[280px] font-sans text-slate-900 leading-tight">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                      selectedIncident.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : selectedIncident.severity === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {INCIDENT_TYPE_LABELS[selectedIncident.type]}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600">
                    {selectedIncident.laneBlocked || 'Alert'}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-950 mb-1 leading-snug">
                  {selectedIncident.title}
                </h4>

                <div className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{selectedIncident.locationName}</span>
                </div>

                <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">
                  {selectedIncident.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {selectedIncident.estimatedClearance || 'Assessing'}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ThumbsUp className="w-3 h-3 text-blue-500" />
                    {selectedIncident.upvotes}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Top Left Floating Map HUD Controls */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
        <div className="flex items-center bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-1 shadow-xl">
          <button
            onClick={() => setMapStyleType('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mapStyleType === 'dark'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Night Radar
          </button>
          <button
            onClick={() => setMapStyleType('roadmap')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mapStyleType === 'roadmap'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Roads
          </button>
          <button
            onClick={() => setMapStyleType('hybrid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mapStyleType === 'hybrid'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {onToggleTrafficLayer && (
          <button
            onClick={onToggleTrafficLayer}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl shadow-xl transition-all cursor-pointer ${
              showTrafficLayer
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Traffic Flow</span>
          </button>
        )}
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl px-3 py-2 shadow-2xl flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Live Radar:
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-500/40 inline-block" />
          <span className="text-[11px] font-medium">Crash / Hazard</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500/40 inline-block" />
          <span className="text-[11px] font-medium">Closure / Detour</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-sky-400 ring-2 ring-sky-400/40 inline-block" />
          <span className="text-[11px] font-medium">Cone / Work</span>
        </div>

        {showTrafficLayer && (
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
            <span>Speed:</span>
            <span className="text-emerald-400 font-bold">Fast</span>
            <span className="text-amber-400 font-bold">Slow</span>
            <span className="text-rose-500 font-bold">Stop</span>
          </div>
        )}
      </div>
    </div>
  );
};
