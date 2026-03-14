import { getBezierPath } from '@xyflow/react';
import { getEdgeParams } from './utils';

export default function FloatingConnectionLine({
  toX, toY, fromPosition, toPosition, fromNode,
}) {
  if (!fromNode) return null;

  const targetNode = {
    id: 'connection-target',
    measured: { width: 1, height: 1 },
    internals: { positionAbsolute: { x: toX, y: toY } },
  };

  const { sx, sy } = getEdgeParams(fromNode, targetNode);
  const [path] = getBezierPath({
    sourceX: sx, sourceY: sy, sourcePosition: fromPosition,
    targetPosition: toPosition, targetX: toX, targetY: toY,
  });

  return (
    <g>
      <path fill="none" stroke="#222" strokeWidth={1.5} d={path} />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
}