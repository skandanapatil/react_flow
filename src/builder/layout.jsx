import Dagre from '@dagrejs/dagre';
import ELK from 'elkjs/lib/elk.bundled.js';

export const elk = new ELK();

// ── Dagre ──────────────────────────────────────────────────────────────────
export const getDagreLayout = (nodes, edges, direction = 'TB') => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  g.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 });

  nodes.forEach((n) =>
    g.setNode(n.id, { width: n.measured?.width ?? 150, height: n.measured?.height ?? 60 })
  );
  edges.forEach((e) => g.setEdge(e.source, e.target));
  Dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      const w = n.measured?.width ?? 150;
      const h = n.measured?.height ?? 60;
      return {
        ...n,
        position: { x: pos.x - w / 2, y: pos.y - h / 2 },
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        targetPosition: isHorizontal ? 'left' : 'top',
      };
    }),
    edges,
  };
};

// ── Shared ELK helper ──────────────────────────────────────────────────────
const runELK = async (nodes, edges, layoutOptions, sourcePosition = 'right', targetPosition = 'left', edgeType = 'smoothstep') => {
  const cleanNodes = nodes.filter((n, i, self) => i === self.findIndex((x) => x.id === n.id));
  const cleanEdges = edges.filter((e) => e.source !== e.target);

  const graph = {
    id: 'root',
    layoutOptions,
    children: cleanNodes.map((n) => ({
      id: n.id,
      width: n.measured?.width ?? 150,
      height: n.measured?.height ?? 60,
    })),
    edges: cleanEdges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  };

  const layout = await elk.layout(graph);

  return {
    nodes: cleanNodes.map((n) => {
      const el = layout.children.find((c) => c.id === n.id);
      return { ...n, position: { x: el.x, y: el.y }, sourcePosition, targetPosition };
    }),
    edges: cleanEdges.map((e) => ({ ...e, type: edgeType })),
  };
};

// ── Orthogonal ─────────────────────────────────────────────────────────────
export const getOrthogonalLayout = (nodes, edges) =>
  runELK(nodes, edges, {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '70',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  }, 'right', 'left', 'step');

// ── Tree ───────────────────────────────────────────────────────────────────
export const getTreeLayout = (nodes, edges) =>
  runELK(nodes, edges, {
    'elk.algorithm': 'mrtree',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '40',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  }, 'bottom', 'top', 'smoothstep');

// ── Radial ─────────────────────────────────────────────────────────────────
export const getRadialLayout = (nodes, edges) =>
  runELK(nodes, edges, {
    'elk.algorithm': 'radial',
    'elk.radial.radius': '200',
    'elk.spacing.nodeNode': '30',
    'elk.radial.compactor': 'NONE',
  }, 'right', 'left', 'straight');

// ── Nets (Force) ───────────────────────────────────────────────────────────
export const getNetsLayout = (nodes, edges) =>
  runELK(nodes, edges, {
    'elk.algorithm': 'force',
    'elk.force.repulsion': '8.0',
    'elk.spacing.nodeNode': '100',
    'elk.force.iterations': '500',
    'elk.force.temperature': '0.001',
  }, 'right', 'left', 'floating');