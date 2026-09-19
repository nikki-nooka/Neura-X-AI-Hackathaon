import React from 'react';
import { Leaf } from 'lucide-react';

export default function EcoBanner() {
  return (
    <div style={{
      background: '#ecfdf5',
      border: '1px solid #a7f3d0',
      borderRadius: '12px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#065f46',
      fontSize: '12px',
    }}>
      {/* Left Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#d1fae5',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Leaf size={16} />
        </div>
        <div>
          <span style={{ fontWeight: 700, color: '#047857' }}>Towards a Cleaner, Greener Hyderabad</span>
          <div style={{ fontSize: '11px', color: '#065f46', marginTop: '1px' }}>
            AI-driven traffic management reduces congestion, fuel consumption and emissions.
          </div>
        </div>
      </div>

      {/* Right Metric */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 600,
        fontSize: '12px',
        color: '#047857',
        background: '#d1fae5',
        padding: '6px 12px',
        borderRadius: '20px',
      }}>
        <Leaf size={14} />
        <span>Estimated <b>12.4 tons</b> lower emissions today</span>
      </div>
    </div>
  );
}
