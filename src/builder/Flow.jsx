
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Background,
  Controls,
  useReactFlow,
  MarkerType,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import JobNode from '../components/JobNode';
import '@xyflow/react/dist/style.css';
import {
  getDagreLayout,
  getOrthogonalLayout,
  getTreeLayout,
  getRadialLayout,
  getNetsLayout,
} from './layout';
import FloatingEdge from '../components/FloatingEdge';
import FloatingConnectionLine from '../components/FloatingConnectionLine';
import {DEPT_COLORS, getJobColor } from '../components/JobNode';
import { superDepartments } from '../data/jobs';

const nodeTypes = { job: JobNode };
const edgeTypes = { floating: FloatingEdge };

const LAYOUTS = [
  { id: 'vertical',   label: 'Vertical',   color: '#475569' },
  { id: 'horizontal', label: 'Horizontal', color: '#475569' },
  { id: 'orthogonal', label: 'Orthogonal', color: '#475569' },
  { id: 'tree',       label: 'Tree',       color: '#475569' },
  { id: 'nets',       label: 'Nets',       color: '#475569' },
];

const btnBase = {
  padding: '6px 10px',
  fontSize: '12px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  color: '#fff',
  transition: 'opacity .15s',
};

function getShortestPathStatic(startId, endId, edgesList) {
  if (!startId || !endId || startId === endId) return { nodeIds: [], edgeIds: [] };
console.log(edgesList,"list of edges")
  const adjacency = new Map();
  edgesList.forEach((e) => {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    adjacency.get(e.source).push({ target: e.target, edgeId: e.id });
  });
console.log(adjacency,"adjacency added here")
  const queue   = [{ nodeId: startId, path: [], edgePath: [] }];
  const visited = new Set([startId]);
console.log( queue,"queue added here")
console.log( visited,"visited added here")
  while (queue.length) {
    const { nodeId, path, edgePath } = queue.shift();
    for (const { target, edgeId } of (adjacency.get(nodeId) || [])) {
      if (visited.has(target)) continue;
      const nextPath     = [...path, target];
      const nextEdgePath = [...edgePath, edgeId];
      if (target === endId) {
        return { nodeIds: [startId, ...nextPath], edgeIds: nextEdgePath };
      }
      visited.add(target);
      queue.push({ nodeId: target, path: nextPath, edgePath: nextEdgePath });
    }
  }
  console.log(nodeIds,edgeIds,"node and edge id here")
  return { nodeIds: [], edgeIds: [] };
}

const LayoutFlow = ({ jobToAdd, setJobToAdd }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeLayout, setActiveLayout]  = useState('vertical');
  const [mode, setMode]                  = useState('normal'); 
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [pathStartNodeId, setPathStartNodeId] = useState(null);
  const [pathEndNodeId,   setPathEndNodeId]   = useState(null);
  const [pathStartInput,  setPathStartInput]  = useState('');
  const [pathEndInput,    setPathEndInput]    = useState('');
  const [pathSubmitted,   setPathSubmitted]   = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => {});

 const requestDeleteEdge = useCallback((edgeId) => {
    const edge = edges.find((ed) => ed.id === edgeId);
    if (!edge) return;
      const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  const sourceName = sourceNode?.data?.label ?? edge.source;
  const targetName = targetNode?.data?.label ?? edge.target;
    setConfirmMessage(`Are you sure you want to delete the connection between "${sourceName}" and "${targetName}"?`);
    setConfirmAction(() => () => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setSelectedEdgeId(null);
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  }, [edges]);

  const requestDeleteNode = useCallback((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setConfirmMessage(`Are you sure you want to delete the node "${node.data.label}" and all its connections?`);
    setConfirmAction(() => () => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  }, [nodes, edges]);

  const { fitView } = useReactFlow();
const allJobs = useMemo(() => {
  const result = [];

  superDepartments.forEach((superDept) => {
    superDept.departments.forEach((dept) => {
      dept.jobs.forEach((job) => {
        result.push({
          ...job,                     // keep job properties like id, title
          department: dept.name,       // the immediate department
          superDepartment: superDept.name, // optional: add super department
        });
      });
    });
  });

  return result;
}, [superDepartments]);
  const jobsInGraph = useMemo(
    () => allJobs.filter((job) => nodes.some((n) => n.data?.label === job.title)),
    [allJobs, nodes]
  );
  const { nodeIds: pathNodeIds, edgeIds: pathEdgeIds } = useMemo(
    () => getShortestPathStatic(pathStartNodeId, pathEndNodeId, edges),
    [pathStartNodeId, pathEndNodeId, edges]
  );
  // const highlightedNodeIds = useMemo(() => {
  //   if (mode === 'path' && pathSubmitted && pathNodeIds.length) {
  //     return new Set(pathNodeIds);
  //   }
  //   if (mode === 'single' && selectedNodeId) {
  //     const out = edges.filter((e) => e.source === selectedNodeId).map((e) => e.target);
  //     const inc = edges.filter((e) => e.target === selectedNodeId).map((e) => e.source);
  //     return new Set([selectedNodeId, ...out, ...inc]);
  //   }
  //   return new Set();
  // }, [mode, pathSubmitted, pathNodeIds, selectedNodeId, edges]);
 
 const { highlightedNodeIds, outgoingNodeIds, incomingNodeIds, outgoingEdgeIds, incomingEdgeIds } = useMemo(() => {
  if (mode === 'path' && pathSubmitted && pathNodeIds.length) {
    return {
      highlightedNodeIds: new Set(pathNodeIds),
      outgoingNodeIds: new Set(), incomingNodeIds: new Set(),
      outgoingEdgeIds: new Set(), incomingEdgeIds: new Set(),
    };
  }
  if (mode === 'single' && selectedNodeId) {

    const outNodes = new Set();
    const outEdges = new Set();
    const queue = [selectedNodeId];
    const visited = new Set([selectedNodeId]);
    while (queue.length) {
      const curr = queue.shift();
      for (const e of edges) {
        if (e.source === curr && !visited.has(e.target)) {
          outNodes.add(e.target);
          outEdges.add(e.id);
          visited.add(e.target);
          queue.push(e.target);
        }
      }
    }
    const incNodes = new Set();
    const incEdges = new Set();
    for (const e of edges) {
      if (e.target === selectedNodeId) {
        incNodes.add(e.source);
        incEdges.add(e.id);
      }
    }
    return {
      highlightedNodeIds: new Set([selectedNodeId, ...outNodes, ...incNodes]),
      outgoingNodeIds: outNodes, incomingNodeIds: incNodes,
      outgoingEdgeIds: outEdges, incomingEdgeIds: incEdges,
    };
  }
  return {
    highlightedNodeIds: new Set(),
    outgoingNodeIds: new Set(), incomingNodeIds: new Set(),
    outgoingEdgeIds: new Set(), incomingEdgeIds: new Set(),
  };
}, [mode, pathSubmitted, pathNodeIds, selectedNodeId, edges]);
  const nodesForRender = useMemo(() => {
  if (mode === 'normal') 
    return nodes.map((n) => ({ ...n, data: { ...n.data, mode } })); // ← was just `return nodes`
  if (mode === 'single' && !selectedNodeId) 
    return nodes.map((n) => ({ ...n, data: { ...n.data, mode } })); // ← was just `return nodes`
  if (mode === 'path' && (!pathSubmitted || !pathStartNodeId || !pathEndNodeId)) 
    return nodes.map((n) => ({ ...n, data: { ...n.data, mode } })); // ← was just `return nodes`

  return nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      selected: n.id === (mode === 'path' ? pathEndNodeId : selectedNodeId),
      dimmed:   !highlightedNodeIds.has(n.id),
      mode,  
    },
  }));
}, [nodes, mode, selectedNodeId, pathSubmitted, pathStartNodeId, pathEndNodeId, highlightedNodeIds]);
  const edgesForRender = useMemo(() => {
    if (mode === 'normal') return edges;
    if (mode === 'single' && !selectedNodeId) return edges;
    if (mode === 'path' && (!pathSubmitted || !pathStartNodeId || !pathEndNodeId)) return edges;

    const pathEdgeSet = new Set(pathEdgeIds);

    return edges.map((e) => {
      const isHighlighted =
  mode === 'path'
    ? pathEdgeSet.has(e.id)
    : outgoingEdgeIds.has(e.id) || incomingEdgeIds.has(e.id);

   const strokeColor = isHighlighted
  ? mode === 'path'
    ? '#22c55e'
    : incomingEdgeIds.has(e.id)
    ? '#f59e0b'   // orange for incoming
    : '#1D9E75'   // teal for outgoing trajectory
  : '#cbd5e1';

      return {
        ...e,
        style: {
          ...e.style,
          stroke:      strokeColor,
          strokeWidth: isHighlighted ? 2.5 : 1,
          opacity:     isHighlighted ? 1 : 0.08,
        },
        animated: isHighlighted,
      };
    });
  }, [
    edges, mode, selectedNodeId,
    pathSubmitted, pathStartNodeId, pathEndNodeId,
    pathEdgeIds,
  ]);
  const handleDownloadImage = useCallback(() => {
  if (!nodes.length) return;

  const imageWidth  = 1920;
  const imageHeight = 1080;

  const nodesBounds = getNodesBounds(nodes);
  const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0.1);

  const viewportEl = document.querySelector('.react-flow__viewport');
  if (!viewportEl) return;

  toPng(viewportEl, {
    backgroundColor: '#ffffff',
    width:  imageWidth,
    height: imageHeight,
    filter: (node) =>
      !node?.classList?.contains('react-flow__panel') &&
      !node?.classList?.contains('react-flow__controls'),
    style: {
      width:     imageWidth,
      height:    imageHeight,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  }).then((dataUrl) => {
    const a = document.createElement('a');
    a.setAttribute('download', 'org-chart.png');
    a.setAttribute('href', dataUrl);
    a.click();
  });
}, [nodes]);
  const applyLayout = useCallback(
    async (layoutId, currentNodes, currentEdges) => {
      if (!currentNodes.length) return;
      let result;
      switch (layoutId) {
        case 'vertical':   result = await getDagreLayout(currentNodes, currentEdges, 'TB'); break;
        case 'horizontal': result = await getDagreLayout(currentNodes, currentEdges, 'LR'); break;
        case 'orthogonal': result = await getOrthogonalLayout(currentNodes, currentEdges);  break;
        case 'tree':       result = await getTreeLayout(currentNodes, currentEdges);         break;
        case 'radial':     result = await getRadialLayout(currentNodes, currentEdges);       break;
        case 'nets':       result = await getNetsLayout(currentNodes, currentEdges);         break;
        default: return;
      }
      setNodes(result.nodes);
      setEdges(result.edges);
      setTimeout(() => fitView({ duration: 400 }), 50);
    },
    [setNodes, setEdges, fitView]
  );
  useEffect(() => {
    if (!jobToAdd) return;
    const newNode = {
      id:       `node-${Date.now()}`,
      type:     'job',
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      data:     { label: jobToAdd.title, department: jobToAdd.department },
    };
    setNodes((nds) => [...nds, newNode]);
    setJobToAdd(null);
  }, [jobToAdd, setNodes, setJobToAdd]);

const onConnect = useCallback(
  (params) => {
    const sourceNode = nodes.find((n) => n.id === params.source);

    const deptColor =
      DEPT_COLORS[sourceNode?.data?.department]?.border || '#999';

    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: 'floating',

          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: deptColor,
          },

          style: {
            stroke: deptColor,
            strokeWidth: 1.5,
          },
        },
        eds
      )
    );
  },
  [setEdges, nodes]
);
  const handleSave = useCallback(() => {
    localStorage.setItem('graphData', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const handleRestore = useCallback(() => {
    const saved = localStorage.getItem('graphData');
    if (!saved) return;
    const { nodes: n, edges: e } = JSON.parse(saved);
    setNodes(n);
    setEdges(e);
    setTimeout(() => fitView({ duration: 400 }), 50);
  }, [setNodes, setEdges, fitView]);

  const handleNodeClick = useCallback((_, node) => {
    if (mode === 'path') return;
     if (mode === 'single') {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    return;  
  }
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    console.log(node.id)
  }, [mode]);

  const handleEdgeClick = useCallback((_, edge) => {
    setSelectedEdgeId(edge.id);
    console.log(edge.id)
    setSelectedNodeId(null);
  }, []);

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

  const clearMode = useCallback(() => {
    setMode('normal');
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setPathStartNodeId(null);
    setPathEndNodeId(null);
    setPathStartInput('');
    setPathEndInput('');
    setPathSubmitted(false);
  }, []);

  const handlePaneClick = useCallback(() => {
    if (mode !== 'normal') clearMode();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [mode, clearMode]);

  const handleDeleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    // setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    // setSelectedEdgeId(null);
     requestDeleteEdge(selectedEdgeId);
  }, [selectedEdgeId, setEdges]);

  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    // setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    // setEdges((eds) =>
    //   eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    // );
 requestDeleteNode(selectedNodeId);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { clearMode(); return; }
      if (e.key === 'Delete') {
        if (selectedEdgeId)      handleDeleteSelectedEdge();
        else if (selectedNodeId) handleDeleteSelectedNode();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearMode, handleDeleteSelectedEdge, handleDeleteSelectedNode,
      selectedEdgeId, selectedNodeId]);

  const handleStartInput = useCallback((e) => {
    const title = e.target.value;
    setPathStartInput(title);
    setPathSubmitted(false);
    const node = nodes.find((n) => n.data?.label === title);
    setPathStartNodeId(node?.id ?? null);
  }, [nodes]);

  const handleEndInput = useCallback((e) => {
    const title = e.target.value;
    setPathEndInput(title);
    setPathSubmitted(false);
    const node = nodes.find((n) => n.data?.label === title);
    setPathEndNodeId(node?.id ?? null);
  }, [nodes]);

  const handlePathSubmit = useCallback(() => {
    if (!pathStartNodeId || !pathEndNodeId || pathStartNodeId === pathEndNodeId) {
      setPathSubmitted(false);
      return;
    }
    setPathSubmitted(true);
  }, [pathStartNodeId, pathEndNodeId]);

  const pathError = useMemo(() => {
    if (!pathSubmitted) return null;
    if (!pathStartNodeId || !pathEndNodeId) return 'One or both roles are not in the graph.';
    if (pathNodeIds.length === 0) return 'No path found between the selected roles.';
    return null;
  }, [pathSubmitted, pathStartNodeId, pathEndNodeId, pathNodeIds]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
         <ConfirmModal
      visible={confirmVisible}
      message={confirmMessage}
      onConfirm={confirmAction}
      onCancel={() => setConfirmVisible(false)}
    />
      <ReactFlow
      style={{ backgroundColor: '#ffffff' }}
        nodes={nodesForRender}
        edges={edgesForRender}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
       defaultEdgeOptions={{
  type:        'floating',
  markerEnd:   { type: MarkerType.ArrowClosed, width: 20, height: 20 }, 
  markerStart: undefined, 
  style:       { stroke: '#555', strokeWidth: 1.5 },
}}
        connectionLineComponent={FloatingConnectionLine}
        fitView
      >
        <Background />
        <Controls style={{ position: 'absolute', right: '10px', left: 'auto' }} />

        <Panel
          position="top-right"
          style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           '6px',
            background:    '#fff',
            padding:       '10px',
            borderRadius:  '10px',
            boxShadow:     '0 2px 12px rgba(0,0,0,0.1)',
            minWidth:      '160px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <button onClick={handleSave}    style={{ ...btnBase, background: '#64748B' }}>Save</button>
            <button onClick={handleRestore} style={{ ...btnBase, background: '#64748B' }}>Restore</button>
          </div>
<button onClick={handleDownloadImage} style={{ ...btnBase, background: '#0EA5E9' }}>
  Download Image
</button>
          {(selectedEdgeId || selectedNodeId) && (
            <button
              onClick={selectedEdgeId ? handleDeleteSelectedEdge : handleDeleteSelectedNode}
              style={{ ...btnBase, background: '#DC2626', marginTop: '4px' }}
            >
              {selectedEdgeId ? 'Delete Edge' : 'Delete Node'}
            </button>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '2px 0' }} />

          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setActiveLayout(l.id);
                setMode('normal');
                applyLayout(l.id, nodes, edges);
              }}
              style={{
                ...btnBase,
                background:    activeLayout === l.id ? l.color : '#E2E8F0',
                color:         activeLayout === l.id ? '#fff'   : '#475569',
                outline:       activeLayout === l.id ? `2px solid ${l.color}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {l.label}
            </button>
          ))}

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '2px 0' }} />

          <button
            onClick={() => {
              setMode('single');
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
              setPathStartNodeId(null);
              setPathEndNodeId(null);
              setPathSubmitted(false);
            }}
            style={{
              ...btnBase,
              background: mode === 'single' ? '#2563EB' : '#E2E8F0',
              color:      mode === 'single' ? '#fff'    : '#475569',
            }}
          >
            Single highlight
          </button>

          {mode === 'single' && (
            <div style={{ fontSize: 11, color: '#94a3b8', padding: '2px 4px' }}>
              Click a node to highlight its connections.
            </div>
          )}
          <button
            onClick={() => {
              setMode('path');
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
              setPathStartNodeId(null);
              setPathEndNodeId(null);
              setPathStartInput('');
              setPathEndInput('');
              setPathSubmitted(false);
            }}
            style={{
              ...btnBase,
              background: mode === 'path' ? '#2563EB' : '#E2E8F0',
              color:      mode === 'path' ? '#fff'    : '#475569',
            }}
          >
            Path finder
          </button>

          {mode === 'path' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>

              <input
                list="startJobs"
                value={pathStartInput}
                onChange={handleStartInput}
                placeholder="Start role"
                style={{
                  padding:      '5px 8px',
                  borderRadius: '6px',
                  border:       `1px solid ${pathStartNodeId ? '#22c55e' : '#CBD5E1'}`,
                  fontSize:     12,
                  outline:      'none',
                }}
              />
              <datalist id="startJobs">
                {jobsInGraph.map((job) => (
                  <option key={job.id} value={job.title} />
                ))}
              </datalist>
              <input
                list="endJobs"
                value={pathEndInput}
                onChange={handleEndInput}
                placeholder="End role"
                style={{
                  padding:      '5px 8px',
                  borderRadius: '6px',
                  border:       `1px solid ${pathEndNodeId ? '#22c55e' : '#CBD5E1'}`,
                  fontSize:     12,
                  outline:      'none',
                }}
              />
              <datalist id="endJobs">
                {jobsInGraph.map((job) => (
                  <option key={job.id} value={job.title} />
                ))}
              </datalist>
              <button
                onClick={handlePathSubmit}
                disabled={
                  !pathStartNodeId ||
                  !pathEndNodeId   ||
                  pathStartNodeId === pathEndNodeId
                }
                style={{
                  ...btnBase,
                  background: pathError ? '#DC2626' : '#2563EB',
                  opacity:
                    !pathStartNodeId ||
                    !pathEndNodeId   ||
                    pathStartNodeId === pathEndNodeId
                      ? 0.45
                      : 1,
                }}
              >
                Find path
              </button>
              {pathSubmitted && !pathError && pathNodeIds.length > 0 && (
                <div style={{
                  fontSize:     11,
                  color:        '#16a34a',
                  padding:      '4px 6px',
                  borderRadius: '6px',
                  background:   '#dcfce7',
                }}>
                  Path found — {pathNodeIds.length} roles, {pathEdgeIds.length} steps
                </div>
              )}
              {pathError && (
                <div style={{
                  fontSize:     11,
                  color:        '#dc2626',
                  padding:      '4px 6px',
                  borderRadius: '6px',
                  background:   '#fee2e2',
                }}>
                  {pathError}
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '2px 0' }} />
          <button
            onClick={clearMode}
            style={{
              ...btnBase,
              background: mode === 'normal' ? '#2563EB' : '#E2E8F0',
              color:      mode === 'normal' ? '#fff'    : '#475569',
            }}
          >
            Clear
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default function FlowWrapper(props) {
  return (
    <ReactFlowProvider>
      <LayoutFlow {...props} />
    </ReactFlowProvider>
  );
}