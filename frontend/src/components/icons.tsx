import React from 'react';
import { Search, X, MapPin, Building, Activity, AlertTriangle, ArrowLeft } from 'lucide-react';

export const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Search className={className || 'w-5 h-5'} />
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <X className={className || 'w-5 h-5'} />
);

export const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MapPin className={className || 'w-5 h-5'} />
);

export const HospitalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Building className={className || 'w-5 h-5'} />
);

export const ActivityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Activity className={className || 'w-5 h-5'} />
);

export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <AlertTriangle className={className || 'w-5 h-5'} />
);
