import React, { useState } from 'react';
import Flow from './builder/Flow';
import NodeModal from './components/NodeModal';

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [jobToAdd, setJobToAdd] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <button
        onClick={() => setShowModal(true)}
        style={{
          color: '#333333', // Ensure button text is visible
          background: '#f9f9f9', // A blue background for better visibility
          border: 'none',
          position: 'absolute', top: 10, left: 10, zIndex: 10 
        }}
      >
        + Add Job
      </button>

      {showModal && (
        <NodeModal
          onClose={() => setShowModal(false)}
          onJobSelect={(job) => setJobToAdd(job)}
        />
      )}

      <Flow jobToAdd={jobToAdd} setJobToAdd={setJobToAdd} />
    </div>
  );
}