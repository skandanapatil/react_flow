
import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Background,
  Controls,
  useReactFlow
} from '@xyflow/react';
import Dagre from '@dagrejs/dagre';
import JobNode from '../components/JobNode'; // Ensure path is correct
import '@xyflow/react/dist/style.css';

const nodeTypes = { job: JobNode };

const LayoutFlow = ({ jobToAdd, setJobToAdd }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const handleLayout = useCallback((direction) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === 'LR';
    
    // spacing between nodes (nodesep) and layers (ranksep)
    g.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 });

    nodes.forEach((node) => {
      g.setNode(node.id, { 
        // Use measured size if available, otherwise fallback
        width: node.measured?.width ?? 150, 
        height: node.measured?.height ?? 60 
      });
    });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));

    Dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const dagreNode = g.node(node.id);
      const w = node.measured?.width ?? 150;
      const h = node.measured?.height ?? 60;

      return {
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        // Center alignment correction
        position: { x: dagreNode.x - w / 2, y: dagreNode.y - h / 2 },
      };
    });

    setNodes(layoutedNodes);
    setTimeout(() => fitView({ duration: 400 }), 50);
  }, [nodes, edges, setNodes, fitView]);

    const handleNodeClick = (event, node) => console.log('Node clicked:', node.id);
  const handleEdgeClick = (event, edge) => console.log('Edge clicked:', edge.id);
  // Handle adding new jobs from props
  useEffect(() => {
    if (jobToAdd) {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'job',
        position: { x: 0, y: 0 }, // Will be fixed by next layout
        data: { label: jobToAdd.title, department: jobToAdd.department }
      };
      setNodes((nds) => [...nds, newNode]);
      setJobToAdd(null);
    }
  }, [jobToAdd, setNodes, setJobToAdd]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, markerStart: { type: 'arrowclosed' }, style: { stroke: '#555' } }, eds));
  }, [setEdges]);

    const handleSave = () => {
    const snapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
    localStorage.setItem('graphData', JSON.stringify(snapshot));
    console.log('Graph saved!', snapshot);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('graphData');
    if (saved) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
      setNodes(savedNodes);
      setEdges(savedEdges);
      console.log('Graph restored!');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls 
         style={{
      position: "absolute",
      right: "10px",
      left: "auto"
    }}
        />
<Panel
  position="top-right"
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px",
    maxWidth: "220px"
  }}
>
  <button onClick={() => handleSave()}>Save</button>
  <button onClick={() => handleRestore()}>Restore</button>
  <button onClick={() => handleLayout('TB')}>Vertical</button>
  <button onClick={() => handleLayout('LR')}>Horizontal</button>
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