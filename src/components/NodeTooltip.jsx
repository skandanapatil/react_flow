// src/components/NodeTooltip.jsx
import React, { useState } from 'react';

export default function NodeTooltip({ data }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: 5,
        background: '#eee',
        borderRadius: 5,
        cursor: 'pointer',
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      <span>{data.label}</span>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {data.label} ({data.department})
        </div>
      )}
    </div>
  );
}