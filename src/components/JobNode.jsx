  import React, { useState, useEffect } from 'react';
  import { Handle, Position } from '@xyflow/react';

//  export const DEPT_COLORS = {
//   'Administration':  { bg: '#7C3AED', border: '#7C3AED', text: '#4C1D95' }, // violet
//   'IT':              { bg: '#2563EB', border: '#2563EB', text: '#1E3A8A' }, // blue
//   'Gäste Service':   { bg: '#059669', border: '#059669', text: '#064E3B' }, // emerald
//   'Printshop':       { bg: '#EA580C', border: '#EA580C', text: '#7C2D12' }, // orange
//   'HR':              { bg: '#DC2626', border: '#DC2626', text: '#7F1D1D' }, // red
//   'Reiseleitung':    { bg: '#0891B2', border: '#0891B2', text: '#164E63' }, // cyan
//   'Galley':          { bg: '#CA8A04', border: '#CA8A04', text: '#713F12' }, // yellow
//   'Hotel Support':   { bg: '#16A34A', border: '#16A34A', text: '#14532D' }, // green (only one strong green)
//   'Service FB':      { bg: '#9333EA', border: '#9333EA', text: '#581C87' }, // purple
//   'Provision':       { bg: '#0D9488', border: '#0D9488', text: '#134E4A' }, // teal
//   'House Keeping':   { bg: '#4F46E5', border: '#4F46E5', text: '#312E81' }, // indigo
//   'Family & Arts':   { bg: '#DB2777', border: '#DB2777', text: '#831843' }, // pink (only one pink)
//   'ShoreEx':         { bg: '#0284C7', border: '#0284C7', text: '#0C4A6E' }, // sky blue
//   'SPA & Sport':     { bg: '#65A30D', border: '#65A30D', text: '#365314' }, // lime
//   'Entertainment':   { bg: '#D97706', border: '#D97706', text: '#78350F' }, // amber
//   'Concessionaires': { bg: '#B91C1C', border: '#B91C1C', text: '#450A0A' }, // dark red
//   'Default':         { bg: '#64748B', border: '#64748B', text: '#334155' }, // slate
// };

export const DEPT_COLORS = {
  'Administration':  { bg: '#F3E8FF', border: '#7C3AED', text: '#5B21B6' },
  'IT':              { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8' },
  'Gäste Service':   { bg: '#D1FAE5', border: '#059669', text: '#047857' },
  'Printshop':       { bg: '#FFEDD5', border: '#EA580C', text: '#C2410C' },
  'HR':              { bg: '#FEE2E2', border: '#DC2626', text: '#B91C1C' },
  'Reiseleitung':    { bg: '#CFFAFE', border: '#0891B2', text: '#0E7490' },
  'Galley':          { bg: '#FEF9C3', border: '#CA8A04', text: '#A16207' },
  'Hotel Support':   { bg: '#DCFCE7', border: '#16A34A', text: '#15803D' },
  'Service FB':      { bg: '#F3E8FF', border: '#9333EA', text: '#7E22CE' },
  'Provision':       { bg: '#CCFBF1', border: '#0D9488', text: '#0F766E' },
  'House Keeping':   { bg: '#E0E7FF', border: '#4F46E5', text: '#4338CA' },
  'Family & Arts':   { bg: '#FCE7F3', border: '#DB2777', text: '#BE185D' },
  'ShoreEx':         { bg: '#E0F2FE', border: '#0284C7', text: '#0369A1' },
  'SPA & Sport':     { bg: '#ECFCCB', border: '#65A30D', text: '#4D7C0F' },
  'Entertainment':   { bg: '#FEF3C7', border: '#D97706', text: '#B45309' },
  'Concessionaires': { bg: '#FEE2E2', border: '#B91C1C', text: '#991B1B' },
  'Default':         { bg: '#F1F5F9', border: '#64748B', text: '#475569' },
};
let colorIndexMap = {};
let currentIndex = 0;

export const getJobColor = (label = '') => {
  if (!colorIndexMap[label]) {
    colorIndexMap[label] = currentIndex++;
  }

  const index = colorIndexMap[label];

  const hue = (index * 137.508) % 360;

  return {
    text: `hsl(${hue}, 65%, 28%)`, 
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
      ? `0 0 0 3px ${dept.border}40`
      : hover
      ? `0 4px 12px ${dept.border}30`
      : '0 1px 4px rgba(0,0,0,0.06)';

    return (
      <div
        style={{
          padding: '10px 15px 10px 20px',
          border: `${data.selected ? '2px' : '1.5px'} solid ${dept.border}`,
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
        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          style={{
            left: 0,
            background: dept.border,
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
            background: dept.border,
            width: '10px',
            height: '10px',
            border: '2px solid white',
            borderRadius: '50%',
            zIndex: 12,
            opacity: 0,
          }}
        />

        {/* Department */}
        <div style={{
          fontSize: '8px',
          fontWeight: 700,
          color: dept.text,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '2px',
          pointerEvents: 'none',
        }}>
          {data.department}
        </div>

        {/* Role */}
        <div style={{
          fontWeight: 700,
          fontSize: '12px',
          color: roleColor.text,
          pointerEvents: 'none',
        }}>
          {data.label}
        </div>

        {/* Tooltip */}
        {hover && !showPopup && (
          <div style={{
            position: 'absolute',
            top: -35,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1E293B',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            zIndex: 100,
          }}>
            {data.label}
          </div>
        )}

        {/* Popup */}
        {showPopup && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              border: `1.5px solid ${dept.border}`,
              borderRadius: '8px',
              padding: '12px',
              minWidth: '200px',
              zIndex: 1000,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontSize: '9px',
              fontWeight: 700,
              color: dept.text,
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              {data.department}
            </div>

            <div style={{
              marginBottom: '4px',
              fontSize: '13px',
              fontWeight: 700,
              color: roleColor.text
            }}>
              {data.label}
            </div>

            <button
              style={{
                marginTop: '8px',
                fontSize: '10px',
                cursor: 'pointer',
                border: `1px solid ${dept.border}`,
                borderRadius: '4px',
                padding: '3px 8px',
                color: roleColor.text,
                background: 'transparent',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(false);
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  }