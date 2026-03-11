// src/components/EdgeTooltip.jsx
import React, { useState } from 'react';

export default function EdgeTooltip({ source, target }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {source} → {target}
        </div>
      )}
    </div>
  );
}