import React from 'react';
import {
  CarFront,
  Ban,
  Cone,
  AlertTriangle,
  ShieldAlert,
  Gauge
} from 'lucide-react';
import { IncidentType } from '../types';

interface IncidentIconProps {
  type: IncidentType;
  className?: string;
  size?: number;
}

export const IncidentIcon: React.FC<IncidentIconProps> = ({ type, className = "w-5 h-5", size = 20 }) => {
  switch (type) {
    case 'accident':
      return <CarFront size={size} className={className} />;
    case 'road_closure':
      return <Ban size={size} className={className} />;
    case 'construction':
      return <Cone size={size} className={className} />;
    case 'hazard':
      return <AlertTriangle size={size} className={className} />;
    case 'police':
      return <ShieldAlert size={size} className={className} />;
    case 'congestion':
    default:
      return <Gauge size={size} className={className} />;
  }
};

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  accident: 'Accident',
  road_closure: 'Road Closure',
  construction: 'Road Work',
  hazard: 'Road Hazard',
  police: 'Enforcement',
  congestion: 'Gridlock'
};
