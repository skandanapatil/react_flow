// import React, { useState } from 'react';
// import { departments } from '../data/jobs';

// export default function NodeModal({ onClose, onJobSelect }) {
//   const [search, setSearch] = useState('');

//   return (
//   <div
//       style={{
//         position: 'fixed',       // fixed to viewport
//         top: 0,
//         left: 0,                // left corner
//         height: '100%',         // full height
//         width: '300px',         // width of sidebar
//         background: '#fff',
//         borderRight: '1px solid #ccc',
//         padding: '20px',
//         zIndex: 1000,           // above other elements
//         overflowY: 'auto',      // scroll if content is long
//         boxShadow: '2px 0 6px rgba(0,0,0,0.1)',
//       }}
//     >
//       <button 
//   onClick={onClose} 
//   style={{ 
//     position: 'absolute', 
//     top: '10px', 
//     right: '10px', 
//     cursor: 'pointer',
//     background: 'none',
//     border: 'none',
//     fontSize: '20px'
//   }}
// >
//   ✕
// </button>
//       <h3>Select Job</h3>
//       <input
//         placeholder="Search..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         style={{ width: '100%', marginBottom: 10 }}
//       />
//       <ul style={{ listStyle: 'none', padding: 0, overflowY: 'auto' }}>
//         {departments.map((dept) => (
//           <li key={dept.id} style={{ marginBottom: 10 }}>
//             <strong>{dept.name}</strong>
//             <ul style={{ listStyle: 'none', paddingLeft: 15 }}>
//               {dept.jobs
//                 .filter((job) => job.title.toLowerCase().includes(search.toLowerCase()))
//                 .map((job) => (
//                   <li
//                     key={job.id}
//                     style={{ padding: 5, cursor: 'pointer', borderBottom: '1px solid #eee' }}
//                     onClick={() => {
//                       onJobSelect({ ...job, department: dept.name });
//                       // onClose();
//                     }}
//                   >
//                     {job.title}
//                   </li>
//                 ))}
//             </ul>
//           </li>
//         ))}
//       </ul>
//       {/* <button onClick={onClose}>Close</button> */}
//     </div>
//   );
// }

import React, { useState } from 'react';
import { departments } from '../data/jobs';

export default function NodeModal({ onClose, onJobSelect }) {
  const [search, setSearch] = useState('');
  const [openDepts, setOpenDepts] = useState({});

  const toggleDept = (id) => {
    setOpenDepts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
    style={{
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '300px',
    background: '#ffffff', // Force white background
    color: '#333333',      // Explicitly set text color to dark grey/black
    borderRight: '1px solid #ccc',
    padding: '20px',
    zIndex: 1000,
    overflowY: 'auto',
    boxShadow: '2px 0 6px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif' // Ensures text rendering is consistent
  }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          color: '#333333' // Ensure close button is visible
        }}
      >
        ✕
      </button>

      <h3>Select Job</h3>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ 
          width: '100%', 
          marginBottom: 10,
          padding: '8px',
          boxSizing: 'border-box',
          // --- FIX STARTS HERE ---
          color: '#000000',           // Text color while typing
          backgroundColor: '#f9f9f9', // Light grey background
          border: '1px solid #999',    // Visible border
          borderRadius: '4px'
          // --- FIX ENDS HERE ---
        }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>

        {departments.map((dept) => (
          <li key={dept.id} style={{ marginBottom: 10 }}>

            {/* Department Header */}
            <div
              onClick={() => toggleDept(dept.id)}
              style={{
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0'
              }}
            >
              {dept.name}
              <span>{openDepts[dept.id] ? '▲' : '▼'}</span>
            </div>

            {/* Jobs (only if expanded) */}
            {openDepts[dept.id] && (
              <ul style={{ listStyle: 'none', paddingLeft: 15 }}>
                {dept.jobs
                  .filter((job) =>
                    job.title.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((job) => (
                    <li
                      key={job.id}
                      style={{
                        padding: 5,
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                      }}
                      onClick={() => {
                        onJobSelect({ ...job, department: dept.name });
                      }}
                    >
                      {job.title}
                    </li>
                  ))}
              </ul>
            )}

          </li>
        ))}

      </ul>
    </div>
  );
}