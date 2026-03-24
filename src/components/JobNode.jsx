import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

export const DEPT_COLORS = {
 'Administration':  { bg: '#FDF4FF', border: '#A855F7', text: '#6B21A8' },
  'IT':              { bg: '#BFDBFE', border: '#3B82F6', text: '#1D4ED8' },
  'Gäste Service':   { bg: '#EFF6FF', border: '#10B981', text: '#065F46' },
  'Printshop':       { bg: '#FED7AA', border: '#F97316', text: '#9A3412' },
  'HR':              { bg: '#FECDD3', border: '#F43F5E', text: '#9F1239' },
  'Reiseleitung':    { bg: '#99F6E4', border: '#14B8A6', text: '#0F766E' },
  'Galley':          { bg: '#FDE68A', border: '#F59E0B', text: '#92400E' },
  'Hotel Support':   { bg: '#F0FDF4', border: '#22C55E', text: '#166534' },
  'Service FB':      { bg: '#FCD34D', border: '#D97706', text: '#78350F' },
  'Provision':       { bg: '#6EE7B7', border: '#059669', text: '#064E3B' },
  'House Keeping':   { bg: '#C7D2FE', border: '#6366F1', text: '#3730A3' },
  'Family & Arts':   { bg: '#FBCFE8', border: '#EC4899', text: '#9D174D' },
  'ShoreEx':         { bg: '#7DD3FC', border: '#0EA5E9', text: '#0C4A6E' },
  'SPA & Sport':     { bg: '#DDD6FE', border: '#8B5CF6', text: '#4C1D95' },
  'Entertainment':   { bg: '#FEF08A', border: '#EAB308', text: '#713F12' },
  'Concessionaires': { bg: '#FECACA', border: '#F87171', text: '#991B1B' },
  'Default':         { bg: '#E2E8F0', border: '#94A3B8', text: '#475569' },
};

export const getJobColor = (label = '') => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    border: `hsl(${hue}, 55%, 45%)`,
    edge:   `hsl(${hue}, 55%, 45%)`,
    text:   `hsl(${hue}, 55%, 30%)`,
    glow:   `hsl(${hue}, 55%, 45%, 0.25)`,
  };
};

export default function JobNode({ data }) {
  const [hover, setHover] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (data.mode === 'single' || data.mode === 'path') setShowPopup(false);
  }, [data.mode]);

  const dept = DEPT_COLORS[data.department] || DEPT_COLORS.Default;
  const roleColor = getJobColor(data.label);

  const shadow = data.selected
    ? `0 0 0 3px ${roleColor.border}40`
    : hover
    ? `0 4px 12px ${roleColor.border}30`
    : '0 1px 4px rgba(0,0,0,0.06)';

  return (
    <div
      style={{
        padding: '10px 15px 10px 20px',
        border: `${data.selected ? '2px' : '1.5px'} solid ${roleColor.border}`,
        borderRadius: '8px',
        background: dept.bg,
        minWidth: '130px',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: shadow,
        transition: 'all .2s',
        opacity: data.dimmed ? 0.25 : 1,
        filter: data.dimmed ? 'grayscale(0.75) blur(2px)' : 'none',
        pointerEvents: data.dimmed ? 'none' : 'auto',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (data.mode === 'single' || data.mode === 'path') return;
        setShowPopup(!showPopup);
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          left: 0,
          background: roleColor.border,
          width: '10px',
          height: '10px',
          border: '2px solid white',
          borderRadius: '50%',
          zIndex: 11,
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="source"
        style={{
          left: 0,
          background: roleColor.border,
          width: '10px',
          height: '10px',
          border: '2px solid white',
          borderRadius: '50%',
          zIndex: 12,
          opacity: 0,
        }}
      />

      <div style={{
        fontSize: '8px', fontWeight: 700,
        color: dept.text,
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px',
        pointerEvents: 'none',
      }}>
        {data.department}
      </div>

      <div style={{
        fontWeight: 700,
        fontSize: '12px',
        color: roleColor.text,
        pointerEvents: 'none',
      }}>
        {data.label}
      </div>

      {hover && !showPopup && (
        <div style={{
          position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)',
          background: '#1E293B', color: '#fff', padding: '4px 8px',
          borderRadius: '4px', fontSize: '11px', whiteSpace: 'nowrap', zIndex: 100,
        }}>
          {data.label}
        </div>
      )}

      {showPopup && (
        <div
          style={{
            position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
            background: '#fff', border: `1.5px solid ${roleColor.border}`,
            borderRadius: '8px', padding: '12px', minWidth: '200px',
            zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '9px', fontWeight: 700, color: dept.text, textTransform: 'uppercase', marginBottom: '6px' }}>
            {data.department}
          </div>
          <div style={{ marginBottom: '4px', fontSize: '13px', fontWeight: 700, color: roleColor.text }}>
            {data.label}
          </div>
          <button
            style={{
              marginTop: '8px', fontSize: '10px', cursor: 'pointer',
              border: `1px solid ${roleColor.border}`, borderRadius: '4px',
              padding: '3px 8px', color: roleColor.text, background: 'transparent',
            }}
            onClick={(e) => { e.stopPropagation(); setShowPopup(false); }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}