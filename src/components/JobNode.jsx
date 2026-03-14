// import React, { useState } from 'react';
// import { Handle, Position } from '@xyflow/react';

// export default function JobNode({ data, targetPosition, sourcePosition }) {
//   const [hover, setHover] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);

//   const colors = { IT: '#cce5ff', Product: '#d4edda', HR: '#fff3cd' };

//   const toPosition = (pos) => {
//     switch (pos) {
//       case 'left':   return Position.Left;
//       case 'right':  return Position.Right;
//       case 'top':    return Position.Top;
//       case 'bottom': return Position.Bottom;
//       default:       return Position.Left;
//     }
//   };

//   return (
//     <div
//       style={{
//         padding: '15px',
//         border: `1px solid ${hover ? '#3B82F6' : '#777'}`,
//         borderRadius: '8px',
//         background: colors[data.department] || '#fff',
//         minWidth: '100px',
//         textAlign: 'center',
//         cursor: 'pointer',
//         position: 'relative',
//         boxShadow: hover ? '0 4px 12px rgba(59,130,246,0.2)' : '0 4px 6px rgba(0,0,0,0.05)',
//         transition: 'all .2s',
//       }}
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       onClick={() => setShowPopup(!showPopup)}
//     >
//       <Handle type="target" position={toPosition(targetPosition)} />

//       <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{data.label}</div>
//       <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>{data.department}</div>

//       <Handle type="source" position={toPosition(sourcePosition)} />

//       {/* Hover tooltip */}
//       {hover && !showPopup && (
//         <div style={{
//           position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)',
//           background: '#333', color: '#fff', padding: '4px 8px', borderRadius: '4px',
//           fontSize: '11px', whiteSpace: 'nowrap', zIndex: 100,
//         }}>
//           {data.label}
//         </div>
//       )}

//       {/* Click popup */}
//       {showPopup && (
//         <div style={{
//           position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
//           background: '#fff', border: '1px solid #ccc', borderRadius: '6px',
//           padding: '12px', minWidth: '200px', zIndex: 1000,
//           boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
//         }}>
//           <div style={{ marginBottom: '6px' }}><strong>Role:</strong> {data.label}</div>
//           <div style={{ marginBottom: '8px' }}><strong>Dept:</strong> {data.department}</div>
//           <button
//             style={{ fontSize: '10px', cursor: 'pointer' }}
//             onClick={(e) => { e.stopPropagation(); setShowPopup(false); }}
//           >
//             Close
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

export const DEPT_COLORS = {
  'Gästeservice':  { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' },
  'Hotel Support': { bg: '#F0FDF4', border: '#10B981', text: '#065F46' },
  'Administration':{ bg: '#FDF4FF', border: '#A855F7', text: '#6B21A8' },
  'Default':       { bg: '#F8FAFC', border: '#94A3B8', text: '#475569' },
};

// Each job role gets a unique color derived from its title
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

const toPosition = (pos) => {
  switch (pos) {
    case 'left':   return Position.Left;
    case 'right':  return Position.Right;
    case 'top':    return Position.Top;
    case 'bottom': return Position.Bottom;
    default:       return Position.Left;
  }
};

export default function JobNode({ data, targetPosition, sourcePosition }) {
  const [hover, setHover] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const dept      = DEPT_COLORS[data.department] || DEPT_COLORS.Default;
  const roleColor = getJobColor(data.label);

  // Keep node background as department color
  const background = dept.bg;

  // Use role-specific border color so outgoing edges match the node border
  const borderColor = roleColor.border;

  const shadow = data.selected
    ? `0 0 0 3px ${roleColor.border}40`
    : hover
    ? `0 4px 12px ${roleColor.border}30`
    : '0 1px 4px rgba(0,0,0,0.06)';

  return (
    <div
      style={{
        padding: '12px 15px',
        border: `${data.selected ? '2px' : '1.5px'} solid ${borderColor}`,
        borderRadius: '8px',
        background,
        minWidth: '130px',
        textAlign: 'center',
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
      onClick={() => setShowPopup(!showPopup)}
    >
      <Handle type="target" position={toPosition(targetPosition)} />

      {/* Department label in dept color */}
      <div style={{
        fontSize: '9px', fontWeight: 700,
        color: dept.text,
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px',
      }}>
        {data.department}
      </div>

      {/* Job title in role color */}
      <div style={{ fontWeight: 700, fontSize: '12px', color: roleColor.text }}>
        {data.label}
      </div>

      <Handle type="source" position={toPosition(sourcePosition)} />

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
        <div style={{
          position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
          background: '#fff', border: `1.5px solid ${roleColor.border}`,
          borderRadius: '8px', padding: '12px', minWidth: '200px',
          zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        }}>
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