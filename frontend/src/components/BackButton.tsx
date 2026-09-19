import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      id="globe-back-btn"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/95 hover:bg-white active:scale-95 text-slate-800 font-bold text-sm shadow-2xl transition-all cursor-pointer border border-white/20 ${className}`}
      title="Return to Surveillance Feed"
    >
      <ArrowLeft className="w-4 h-4 text-slate-800 stroke-[2.5]" />
      <span>Back</span>
    </button>
  );
};
