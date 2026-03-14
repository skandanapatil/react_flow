import React, { useCallback, useEffect, useState } from 'react';
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
import { getJobColor, DEPT_COLORS } from '../components/JobNode';
const nodeTypes = { job: JobNode };
const edgeTypes = { floating: FloatingEdge };

const LAYOUTS = [
  { id: 'vertical',     label: 'Vertical',     color: '#475569' },
  { id: 'horizontal',   label: 'Horizontal',   color: '#475569' },
  { id: 'orthogonal',   label: 'Orthogonal',   color: '#475569' },
  { id: 'tree',         label: 'Tree',         color: '#475569' },
  // { id: 'radial',       label: 'Radial',       color: '#eee4dd' },
  { id: 'nets',         label: 'Nets',         color: '#475569' },
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

const LayoutFlow = ({ jobToAdd, setJobToAdd }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeLayout, setActiveLayout] = useState('vertical');
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const { fitView } = useReactFlow();

  // When a node is selected, dim everything except the node and its directly connected neighbors
  const highlightedNodeIds = React.useMemo(() => {
    if (!selectedNodeId) return new Set();

    const outgoing = edges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => e.target);

    const incoming = edges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => e.source);

    return new Set([selectedNodeId, ...outgoing, ...incoming]);
  }, [selectedNodeId, edges]);

  const nodesForRender = React.useMemo(() => {
    if (!selectedNodeId) return nodes;

    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        selected: n.id === selectedNodeId,
        dimmed: !highlightedNodeIds.has(n.id),
      },
    }));
  }, [nodes, selectedNodeId, highlightedNodeIds]);

  const edgesForRender = React.useMemo(() => {
    if (!selectedNodeId) return edges;

    return edges.map((e) => {
      const isOutgoing = e.source === selectedNodeId;
      const isIncoming = e.target === selectedNodeId;
      const isHighlighted = isOutgoing || isIncoming;

      const strokeColor = isHighlighted
        ? isOutgoing
          ? 'green'
          : 'red'
        : e.style?.stroke;

      return {
        ...e,
        style: {
          ...e.style,
          stroke: strokeColor,
          opacity: isHighlighted ? 1 : 0,
          filter: isHighlighted ? 'none' : 'blur(2px)',
        },
      };
    });
  }, [edges, selectedNodeId]);

  // This function now only runs when a user clicks a layout button
  const applyLayout = useCallback(
    async (layoutId, currentNodes, currentEdges) => {
      if (!currentNodes.length) return;
      let result;

      switch (layoutId) {
        case 'vertical':
          result = getDagreLayout(currentNodes, currentEdges, 'TB');
          break;
        case 'horizontal':
          result = getDagreLayout(currentNodes, currentEdges, 'LR');
          break;
        case 'orthogonal':
          result = await getOrthogonalLayout(currentNodes, currentEdges);
          break;
        case 'tree':
          result = await getTreeLayout(currentNodes, currentEdges);
          break;
        case 'radial':
          result = await getRadialLayout(currentNodes, currentEdges);
          break;
        case 'nets':
          result = await getNetsLayout(currentNodes, currentEdges);
          break;
        default:
          return;
      }

      setNodes(result.nodes);
      setEdges(result.edges);
      // Optional: Delay fitView slightly to ensure DOM has rendered new positions
      setTimeout(() => fitView({ duration: 400 }), 50);
    },
    [setNodes, setEdges, fitView]
  );

  const handleLayoutClick = useCallback(
    (layoutId) => {
      setActiveLayout(layoutId);
      applyLayout(layoutId, nodes, edges);
    },
    [nodes, edges, applyLayout]
  );

  // Add new job node - Layout logic removed to keep it manual
  useEffect(() => {
    if (jobToAdd) {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'job',
        // Start nodes at a slight offset so they aren't all on top of each other
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        data: { label: jobToAdd.title, department: jobToAdd.department },
      };
      
      setNodes((nds) => [...nds, newNode]);
      setJobToAdd(null);
    }
  }, [jobToAdd, setNodes, setJobToAdd]);

  // Handle connections - Layout logic removed to keep it manual
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const edgeColor = getJobColor(sourceNode?.data?.label).border;

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'floating',
            style: { stroke: edgeColor, strokeWidth: 1.5 },
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  const handleSave = () => {
    localStorage.setItem('graphData', JSON.stringify({ nodes, edges }));
    console.log('Saved!');
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('graphData');
    if (saved) {
      const { nodes: n, edges: e } = JSON.parse(saved);
      setNodes(n);
      setEdges(e);
      setTimeout(() => fitView({ duration: 400 }), 50);
    }
  };

  const handleNodeClick = (_, node) => {
    console.log('Node clicked:', node.id);
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  };

  const handleEdgeClick = (_, edge) => {
    console.log('Edge clicked:', edge.id);
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  };

  const handleDeleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId, setEdges]);

  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Delete') return;
      if (selectedEdgeId) {
        handleDeleteSelectedEdge();
      } else if (selectedNodeId) {
        handleDeleteSelectedNode();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDeleteSelectedEdge, handleDeleteSelectedNode, selectedEdgeId, selectedNodeId]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodesForRender}
        edges={edgesForRender}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'floating',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#555' },
        }}
        connectionLineComponent={FloatingConnectionLine}
        fitView
      >
        <Background />
        <Controls style={{ position: 'absolute', right: '10px', left: 'auto' }} />

        <Panel
          position="top-right"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#fff',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            minWidth: '130px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <button onClick={handleSave} style={{ ...btnBase, background: '#64748B' }}>Save</button>
            <button onClick={handleRestore} style={{ ...btnBase, background: '#64748B' }}>Restore</button>
          </div>

          {(selectedEdgeId || selectedNodeId) && (
            <button
              onClick={selectedEdgeId ? handleDeleteSelectedEdge : handleDeleteSelectedNode}
              style={{ ...btnBase, background: '#DC2626', marginTop: '6px' }}
            >
              {selectedEdgeId ? 'Delete Edge' : 'Delete Node'}
            </button>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', margin: '2px 0' }} />

          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLayoutClick(l.id)}
              style={{
                ...btnBase,
                background: activeLayout === l.id ? l.color : '#E2E8F0',
                color: activeLayout === l.id ? '#fff' : '#475569',
                outline: activeLayout === l.id ? `2px solid ${l.color}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {l.label}
            </button>
          ))}
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