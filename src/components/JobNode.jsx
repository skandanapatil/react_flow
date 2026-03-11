import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function JobNode({ data, targetPosition, sourcePosition }) {
  const [hover, setHover] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const colors = { IT: '#cce5ff', Product: '#d4edda', HR: '#fff3cd' };

  return (
    <div
      style={{
        padding: '15px',
        border: '1px solid #777',
        borderRadius: '8px',
        background: colors[data.department] || '#fff',
        minWidth: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setShowPopup(!showPopup)}
    >
      {/* These positions are now dynamic based on layout direction */}
     <Handle 
  type="target" 
  position={targetPosition === 'left' ? Position.Left : Position.Top} 
/>
      
      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
  {data.label}
</div>

<div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
  {data.department}
</div>
      
   <Handle 
  type="source" 
  position={sourcePosition === 'right' ? Position.Right : Position.Bottom} 
/>

      {/* Hover Tooltip */}
      {hover && !showPopup && (
        <div style={{
          position: 'absolute', top: -35, left: '50%', transform: 'translateX(-50%)',
          background: '#333', color: '#fff', padding: '4px 8px', borderRadius: '4px',
          fontSize: '11px', whiteSpace: 'nowrap', zIndex: 100
        }}>
         {data.label}
        </div>
      )}

      {/* Click Popup - Absolute so it doesn't break layout math */}
      {showPopup && (
        <div style={{
          position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
          background: '#fff', border: '1px solid #ccc', borderRadius: '6px',
          padding: '12px', minWidth: '200px', zIndex: 1000,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '8px' }}><strong>Details:</strong> {data.label}</div>
          <button 
            style={{ fontSize: '10px', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); setShowPopup(false); }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}