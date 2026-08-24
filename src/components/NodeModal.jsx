
import React, { useState } from 'react';
import { superDepartments } from '../data/jobs'; 

export default function NodeModal({ onClose, onJobSelect }) {
  const [search, setSearch] = useState('');
  const [openSuperDepts, setOpenSuperDepts] = useState({});
  const [openDepts, setOpenDepts] = useState({});

  const toggleSuperDept = (id) => {
    setOpenSuperDepts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const ConfirmModal = ({ visible, message, onConfirm, onCancel }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '280px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        textAlign: 'center',
        animation: 'fadeIn 0.2s',
      }}>
        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#111' }}>
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onClick={onConfirm}
            style={{ ...btnBase, backgroundColor: '#DC2626', width: '100px' }}
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            style={{ ...btnBase, backgroundColor: '#64748B', width: '100px' }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
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
        background: '#ffffff',
        color: '#333333',
        borderRight: '1px solid #ccc',
        padding: '20px',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '2px 0 6px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif'
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
          color: '#333333'
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
          color: '#000000',
          backgroundColor: '#f9f9f9',
          border: '1px solid #999',
          borderRadius: '4px'
        }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {superDepartments.map((superDept) => (
          <li key={superDept.id} style={{ marginBottom: 10 }}>
            
            {/* Super Department Header */}
            <div
              onClick={() => toggleSuperDept(superDept.id)}
              style={{
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
                fontSize: 16
              }}
            >
              {superDept.name}
              <span>{openSuperDepts[superDept.id] ? '▲' : '▼'}</span>
            </div>

            {/* Departments */}
            {openSuperDepts[superDept.id] && (
              <ul style={{ listStyle: 'none', paddingLeft: 15 }}>
                {superDept.departments.map((dept) => (
                  <li key={dept.id} style={{ marginBottom: 5 }}>
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

                    {/* Jobs */}
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
                              onClick={() =>
                                onJobSelect({ ...job, department: dept.name })
                              }
                            >
                              {job.title}
                            </li>
                          ))}
                      </ul>
                    )}
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