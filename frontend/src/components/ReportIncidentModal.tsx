import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  X,
  MapPin,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';
import { IncidentType, IncidentSeverity, TrafficIncident } from '../types';
import { IncidentIcon, INCIDENT_TYPE_LABELS } from './IncidentIcon';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: Omit<TrafficIncident, 'id' | 'reportedAt' | 'upvotes' | 'verified'>) => void;
  defaultCoords?: { lat: number; lng: number };
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultCoords = { lat: 37.7749, lng: -122.4194 }
}) => {
  const [type, setType] = useState<IncidentType>('accident');
  const [severity, setSeverity] = useState<IncidentSeverity>('critical');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [laneBlocked, setLaneBlocked] = useState('Right lane blocked');
  const [estimatedClearance, setEstimatedClearance] = useState('~30 mins');
  const [reporterName, setReporterName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) return;

    // slight random offset so multiple reports don't completely overlap
    const offsetLat = (Math.random() - 0.5) * 0.008;
    const offsetLng = (Math.random() - 0.5) * 0.008;

    onSubmit({
      type,
      severity,
      title: title.trim(),
      locationName: locationName.trim(),
      description: description.trim() || 'Reported by local driver via Live Traffic Hub.',
      lat: defaultCoords.lat + offsetLat,
      lng: defaultCoords.lng + offsetLng,
      reportedBy: reporterName.trim() || 'Anonymous Driver',
      laneBlocked: laneBlocked.trim() || undefined,
      estimatedClearance: estimatedClearance.trim() || undefined,
      tags: ['Live Community Report', type === 'accident' ? 'Caution Ahead' : 'Slow Down']
    });

    // Reset form
    setTitle('');
    setLocationName('');
    setDescription('');
    onClose();
  };

  const incidentTypes: IncidentType[] = [
    'accident',
    'road_closure',
    'hazard',
    'construction',
    'congestion',
    'police'
  ];

  return (
    <div
      id="report-incident-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Report Traffic Incident</h2>
              <p className="text-xs text-slate-400">Broadcast alert instantly to nearby drivers & map</p>
            </div>
          </div>
          <button
            id="close-report-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Incident Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Incident Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {incidentTypes.map((t) => {
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <IncidentIcon type={t} className="w-4 h-4 shrink-0" size={16} />
                    <span className="truncate">{INCIDENT_TYPE_LABELS[t]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Impact Level / Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['critical', 'moderate', 'minor'] as IncidentSeverity[]).map((sev) => {
                const isSelected = severity === sev;
                const colors = {
                  critical: 'border-rose-500 bg-rose-500/20 text-rose-300',
                  moderate: 'border-amber-500 bg-amber-500/20 text-amber-300',
                  minor: 'border-sky-500 bg-sky-500/20 text-sky-300'
                };
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border text-center transition-all ${
                      isSelected
                        ? colors[sev]
                        : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {sev === 'critical' ? 'Critical Block' : sev === 'moderate' ? 'Moderate Delay' : 'Minor Alert'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Headline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Incident Headline *
            </label>
            <input
              id="report-title-input"
              type="text"
              required
              placeholder="e.g. Multi-Car Crash blocking center lane"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Specific Road / Cross Street *
              </label>
              <input
                id="report-location-input"
                type="text"
                required
                placeholder="e.g. Hwy 101 North near Exit 423"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Est. Clearance / Duration
              </label>
              <input
                id="report-clearance-input"
                type="text"
                placeholder="e.g. ~45 mins or Until 5 PM"
                value={estimatedClearance}
                onChange={(e) => setEstimatedClearance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Lane obstruction details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Lane Blockage / Road Condition
            </label>
            <input
              id="report-lane-input"
              type="text"
              placeholder="e.g. Left 2 lanes fully blocked, shoulder open"
              value={laneBlocked}
              onChange={(e) => setLaneBlocked(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Details / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Details & Driver Advice
            </label>
            <textarea
              id="report-desc-input"
              rows={2}
              placeholder="Describe emergency vehicles, detours, hazards or towing status..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
            />
          </div>

          {/* Reporter alias */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Your Driver Handle / Call Sign
            </label>
            <input
              id="report-author-input"
              type="text"
              placeholder="e.g. HighwayCruiser / SFCommuter (Optional)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-incident-btn"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              Publish Live Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
