import { majorCities } from '../data/cities';

export interface TrafficIncidentItem {
  id: string;
  lat: number;
  lon: number;
  type: string;
  severity: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  locationName: string;
  description: string;
  clearanceTime?: string;
  laneBlocked?: string;
}

export interface LocationTrafficAnalysis {
  locationName: string;
  condition: 'gridlock' | 'heavy' | 'moderate' | 'flowing';
  speedKmh: number;
  congestionPercentage: number;
  delayMinutes: number;
  summary: string;
  incidents: TrafficIncidentItem[];
  bypassRoute?: string;
  cctvCount: number;
  recommendations: string[];
}

export interface CityTrafficSnapshot {
  cityName: string;
  country: string;
  congestionIndex: number;
  trafficStatus: string;
  avgSpeedKmh: number;
  activeAlertsCount: number;
  summary: string;
  recentIncidents: TrafficIncidentItem[];
  keyCorridors: { name: string; status: string; delay: string }[];
}

export async function geocodeLocation(
  query: string
): Promise<{ lat: number; lng: number; foundLocationName: string }> {
  const clean = query.trim().toLowerCase();

  // 1. Direct match with major cities
  const matched = majorCities.find(
    (c) => c.name.toLowerCase().includes(clean) || c.country.toLowerCase().includes(clean)
  );
  if (matched) {
    return {
      lat: matched.lat,
      lng: matched.lng,
      foundLocationName: `${matched.name}, ${matched.country}`
    };
  }

  // 2. Coordinate parsing e.g. "17.38, 78.48" or "25.20, 55.27"
  const coordsMatch = query.match(/([-+]?\d+\.?\d*)[,\s]+([-+]?\d+\.?\d*)/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lng = parseFloat(coordsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        lat,
        lng,
        foundLocationName: `Coordinates (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`
      };
    }
  }

  // 3. Fallback geocode using OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'User-Agent': 'MargaNetra-TrafficTwin/2.0' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        foundLocationName: data[0].display_name.split(',').slice(0, 3).join(', ')
      };
    }
  } catch (err) {
    console.warn('Geocoding service unavailable, falling back:', err);
  }

  // Default coordinate if not found
  return {
    lat: 17.385,
    lng: 78.4867,
    foundLocationName: `${query} (Estimated Metro Sector)`
  };
}

export async function analyzeLocationTraffic(
  lat: number,
  lng: number,
  locationName?: string
): Promise<LocationTrafficAnalysis> {
  // Find nearest major city
  let nearest = majorCities[0];
  let minDistance = Infinity;
  for (const city of majorCities) {
    const d = Math.hypot(city.lat - lat, city.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = city;
    }
  }

  const name = locationName || `${nearest.name} Expressway Sector (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
  
  // Deterministic mock condition based on coordinates
  const hash = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;
  const condition: 'gridlock' | 'heavy' | 'moderate' | 'flowing' = 
    hash > 0.75 ? 'gridlock' : hash > 0.45 ? 'heavy' : hash > 0.2 ? 'moderate' : 'flowing';

  const speedKmh = condition === 'gridlock' ? 14 : condition === 'heavy' ? 28 : condition === 'moderate' ? 52 : 78;
  const congestionPercentage = condition === 'gridlock' ? 88 : condition === 'heavy' ? 68 : condition === 'moderate' ? 42 : 18;
  const delayMinutes = condition === 'gridlock' ? 28 : condition === 'heavy' ? 14 : condition === 'moderate' ? 6 : 0;

  const incidents: TrafficIncidentItem[] = [
    {
      id: 'inc-1',
      lat: lat + 0.008,
      lon: lng + 0.006,
      type: condition === 'gridlock' ? 'Multi-Vehicle Collision' : 'Disabled Freight Vehicle',
      severity: condition === 'gridlock' ? 'Critical' : 'Major',
      locationName: `${name} - Km Marker 42.4`,
      description: 'Right lane blocked; optical CCTV sensors tracking tow dispatch and emergency clearance.',
      clearanceTime: 'ETA 25 mins',
      laneBlocked: 'Right Lane & Shoulder'
    },
    {
      id: 'inc-2',
      lat: lat - 0.006,
      lon: lng - 0.009,
      type: 'Corridor Maintenance & Resurfacing',
      severity: 'Moderate',
      locationName: `${name} - West Interchange`,
      description: 'Speed restricted to 40 km/h due to highway resurfacing and cone barrier placement.',
      clearanceTime: 'Active until 18:00',
      laneBlocked: 'Center Left'
    }
  ];

  return {
    locationName: name,
    condition,
    speedKmh,
    congestionPercentage,
    delayMinutes,
    summary: `Live optical and telemetry analysis indicates ${condition.toUpperCase()} vehicular density on this corridor with average speeds cruising at ${speedKmh} km/h and an estimated delay of ${delayMinutes} mins.`,
    incidents,
    bypassRoute: `Alternate Outer Loop Bypass (saves ~${Math.max(8, delayMinutes)} min)`,
    cctvCount: 14,
    recommendations: [
      'Maintain real-time variable message signage (VMS) alerting drivers to lane blockage.',
      'Divert freight carriers toward southern auxiliary expressway bypass.',
      'Deploy rapid corridor patrol motorcycle unit to interchange choke point.'
    ]
  };
}

export async function getCityTrafficSnapshot(
  cityName: string,
  country = ''
): Promise<CityTrafficSnapshot> {
  const city = majorCities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  const congestionIndex = city?.congestionIndex ?? 64;
  const trafficStatus = city?.trafficStatus ?? 'Heavy';
  const lat = city?.lat ?? 17.385;
  const lng = city?.lng ?? 78.4867;

  const recentIncidents: TrafficIncidentItem[] = [
    {
      id: `${cityName}-inc-1`,
      lat: lat + 0.012,
      lon: lng + 0.008,
      type: 'Overturned Container Truck',
      severity: 'Critical',
      locationName: `Ring Road Arterial Junction`,
      description: 'All inbound expressway lanes halted. Crane and emergency responders deployed.',
      clearanceTime: 'ETA 35 mins',
      laneBlocked: 'All Inbound Lanes'
    },
    {
      id: `${cityName}-inc-2`,
      lat: lat - 0.015,
      lon: lng - 0.012,
      type: 'Traffic Signal Network Desync',
      severity: 'Major',
      locationName: `Central Business District Flyover`,
      description: 'Manual traffic police deployment actively overriding automated light cycle.',
      clearanceTime: 'ETA 15 mins'
    },
    {
      id: `${cityName}-inc-3`,
      lat: lat + 0.004,
      lon: lng - 0.018,
      type: 'Rapid Incident Patrol Clearance',
      severity: 'Moderate',
      locationName: `Airport Expressway Km 12`,
      description: 'Stalled sedan moved to shoulder, normal flow recovering.'
    }
  ];

  return {
    cityName,
    country,
    congestionIndex,
    trafficStatus,
    avgSpeedKmh: trafficStatus === 'Gridlock' ? 16 : trafficStatus === 'Heavy' ? 24 : trafficStatus === 'Moderate' ? 44 : 62,
    activeAlertsCount: recentIncidents.length,
    summary: `${cityName} metro corridor is operating under ${trafficStatus.toUpperCase()} traffic volume with an aggregate city-wide congestion index of ${congestionIndex}%. Core expressways are monitored by integrated CCTV and sensor networks.`,
    recentIncidents,
    keyCorridors: [
      { name: 'Outer Ring Expressway', status: 'Moderate Flow', delay: '+4 min' },
      { name: 'Central Arterial Flyover', status: 'Heavy Congestion', delay: '+18 min' },
      { name: 'Airport Transit Corridor', status: 'Clear & Flowing', delay: '0 min' },
      { name: 'Industrial Freight Bypass', status: 'Slow Moving', delay: '+9 min' }
    ]
  };
}
