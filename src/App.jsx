import React, { useState } from 'react';
import Flow from './builder/Flow';
import NodeModal from './components/NodeModal';

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [jobToAdd, setJobToAdd] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <button
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}
        onClick={() => setShowModal(true)}
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