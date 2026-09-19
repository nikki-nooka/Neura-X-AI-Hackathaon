export type IncidentType = 'accident' | 'road_closure' | 'construction' | 'hazard' | 'police' | 'congestion';

export type IncidentSeverity = 'critical' | 'moderate' | 'minor';

export interface TrafficIncident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  severity: IncidentSeverity;
  reportedAt: string; // ISO string
  reportedBy: string;
  upvotes: number;
  verified: boolean;
  laneBlocked?: string;
  estimatedClearance?: string;
  tags?: string[];
}

export interface IncidentFilter {
  type: 'all' | IncidentType;
  severity: 'all' | IncidentSeverity;
  searchQuery: string;
  onlyVerified: boolean;
}

export interface CityPreset {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface Facility {
  name: string;
  type: 'Hospital' | 'Clinic' | 'Emergency' | 'Pharmacy' | string;
  lat: number;
  lng: number;
  distance?: string;
  address?: string;
}

export interface LocationAnalysisResult {
  locationName?: string;
  summary: string;
  safetyScore?: number;
  trafficStatus?: string;
  facilities?: Facility[];
  environmentalFactors?: string[];
  keyRisks?: string[];
  recommendations?: string[];
}

export interface CityHealthSnapshot {
  cityName: string;
  country: string;
  overallScore: number;
  airQuality: string;
  trafficCongestion: string;
  emergencyReadiness: string;
  summary: string;
  keyInsights: string[];
}
