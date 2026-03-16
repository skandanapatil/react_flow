// 

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
} from '@xyflow/react';
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
import { getJobColor } from '../components/JobNode';
import { departments } from '../data/jobs';

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

// ── shortest path (BFS) ────────────────────────────────────────────────────
function getShortestPathStatic(startId, endId, edgesList) {
  if (!startId || !endId || startId === endId) return { nodeIds: [], edgeIds: [] };

  const adjacency = new Map();
  edgesList.forEach((e) => {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    adjacency.get(e.source).push({ target: e.target, edgeId: e.id });
  });

  const queue   = [{ nodeId: startId, path: [], edgePath: [] }];
  const visited = new Set([startId]);

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
  return { nodeIds: [], edgeIds: [] };
}

// ── main component ─────────────────────────────────────────────────────────
const LayoutFlow = ({ jobToAdd, setJobToAdd }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeLayout, setActiveLayout]  = useState('vertical');
  const [mode, setMode]                  = useState('normal'); // normal | single | path

  // single-highlight mode
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // path-finder mode
  const [pathStartNodeId, setPathStartNodeId] = useState(null);
  const [pathEndNodeId,   setPathEndNodeId]   = useState(null);
  const [pathStartInput,  setPathStartInput]  = useState('');
  const [pathEndInput,    setPathEndInput]    = useState('');
  const [pathSubmitted,   setPathSubmitted]   = useState(false);

  const { fitView } = useReactFlow();

  // ── jobs flat list ─────────────────────────────────────────────────────
  const allJobs = useMemo(() => {
    const result = [];
    departments.forEach((dept) =>
      dept.jobs.forEach((job) => result.push({ ...job, department: dept.name }))
    );
    return result;
  }, []);

  // only jobs whose title matches a node currently in the graph
  const jobsInGraph = useMemo(
    () => allJobs.filter((job) => nodes.some((n) => n.data?.label === job.title)),
    [allJobs, nodes]
  );

  // ── shortest path ──────────────────────────────────────────────────────
  const { nodeIds: pathNodeIds, edgeIds: pathEdgeIds } = useMemo(
    () => getShortestPathStatic(pathStartNodeId, pathEndNodeId, edges),
    [pathStartNodeId, pathEndNodeId, edges]
  );

  // ── highlighted node set ───────────────────────────────────────────────
  const highlightedNodeIds = useMemo(() => {
    if (mode === 'path' && pathSubmitted && pathNodeIds.length) {
      return new Set(pathNodeIds);
    }
    if (mode === 'single' && selectedNodeId) {
      const out = edges.filter((e) => e.source === selectedNodeId).map((e) => e.target);
      const inc = edges.filter((e) => e.target === selectedNodeId).map((e) => e.source);
      return new Set([selectedNodeId, ...out, ...inc]);
    }
    return new Set();
  }, [mode, pathSubmitted, pathNodeIds, selectedNodeId, edges]);

  // ── derived nodes ──────────────────────────────────────────────────────
  const nodesForRender = useMemo(() => {
    if (mode === 'normal') return nodes;
    if (mode === 'single' && !selectedNodeId) return nodes;
    if (mode === 'path' && (!pathSubmitted || !pathStartNodeId || !pathEndNodeId)) return nodes;

    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        selected: n.id === (mode === 'path' ? pathEndNodeId : selectedNodeId),
        dimmed:   !highlightedNodeIds.has(n.id),
      },
    }));
  }, [
    nodes, mode, selectedNodeId,
    pathSubmitted, pathStartNodeId, pathEndNodeId,
    highlightedNodeIds,
  ]);

  // ── derived edges ──────────────────────────────────────────────────────
  const edgesForRender = useMemo(() => {
    if (mode === 'normal') return edges;
    if (mode === 'single' && !selectedNodeId) return edges;
    if (mode === 'path' && (!pathSubmitted || !pathStartNodeId || !pathEndNodeId)) return edges;

    const pathEdgeSet = new Set(pathEdgeIds);

    return edges.map((e) => {
      const isHighlighted =
        mode === 'path'
          ? pathEdgeSet.has(e.id)
          : e.source === selectedNodeId || e.target === selectedNodeId;

      const strokeColor = isHighlighted
        ? mode === 'path'
          ? '#22c55e'
          : e.source === selectedNodeId
          ? '#1D9E75'   // outgoing — green
          : '#f59e0b'   // incoming — amber
        : '#cbd5e1';    // dimmed   — light gray

      return {
        ...e,
        style: {
          ...e.style,
          stroke:      strokeColor,
          strokeWidth: isHighlighted ? 2.5 : 1,
          opacity:     isHighlighted ? 1 : 0.08,
        },
        // ✅ animated for BOTH single mode and path mode
        animated: isHighlighted,
      };
    });
  }, [
    edges, mode, selectedNodeId,
    pathSubmitted, pathStartNodeId, pathEndNodeId,
    pathEdgeIds,
  ]);

  // ── layout ─────────────────────────────────────────────────────────────
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

  // ── add job node ───────────────────────────────────────────────────────
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

  // ── connect ────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const edgeColor  = getJobColor(sourceNode?.data?.label).border;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type:  'floating',
            style: { stroke: edgeColor, strokeWidth: 1.5 },
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  // ── save / restore ─────────────────────────────────────────────────────
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

  // ── click handlers ─────────────────────────────────────────────────────
  const handleNodeClick = useCallback((_, node) => {
    if (mode === 'path') return;
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, [mode]);

  const handleEdgeClick = useCallback((_, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  // ── clear mode ─────────────────────────────────────────────────────────
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

  // ── delete ─────────────────────────────────────────────────────────────
  const handleDeleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId, setEdges]);

  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  // ── keyboard shortcuts ─────────────────────────────────────────────────
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

  // ── path input handlers ────────────────────────────────────────────────
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

  // ── path submit ────────────────────────────────────────────────────────
  const handlePathSubmit = useCallback(() => {
    if (!pathStartNodeId || !pathEndNodeId || pathStartNodeId === pathEndNodeId) {
      setPathSubmitted(false);
      return;
    }
    setPathSubmitted(true);
  }, [pathStartNodeId, pathEndNodeId]);

  // ── path error message ─────────────────────────────────────────────────
  const pathError = useMemo(() => {
    if (!pathSubmitted) return null;
    if (!pathStartNodeId || !pathEndNodeId) return 'One or both roles are not in the graph.';
    if (pathNodeIds.length === 0) return 'No path found between the selected roles.';
    return null;
  }, [pathSubmitted, pathStartNodeId, pathEndNodeId, pathNodeIds]);

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
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
          type:      'floating',
          markerEnd: { type: MarkerType.ArrowClosed },
          style:     { stroke: '#555' },
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
          {/* save / restore */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <button onClick={handleSave}    style={{ ...btnBase, background: '#64748B' }}>Save</button>
            <button onClick={handleRestore} style={{ ...btnBase, background: '#64748B' }}>Restore</button>
          </div>

          {/* delete selected node or edge */}
          {(selectedEdgeId || selectedNodeId) && (
            <button
              onClick={selectedEdgeId ? handleDeleteSelectedEdge : handleDeleteSelectedNode}
              style={{ ...btnBase, background: '#DC2626', marginTop: '4px' }}
            >
              {selectedEdgeId ? 'Delete Edge' : 'Delete Node'}
            </button>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '2px 0' }} />

          {/* layout buttons */}
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

          {/* single highlight mode */}
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

          {/* path finder mode */}
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

              {/* start role */}
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

              {/* end role */}
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

              {/* find path button */}
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

              {/* success */}
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

              {/* error */}
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

          {/* clear */}
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