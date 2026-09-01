import { getBezierPath, useInternalNode } from '@xyflow/react';
import { getEdgeParams } from './utils';

export default function FloatingEdge({ id, source, target, markerEnd, style }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const [edgePath] = getBezierPath({
    sourceX: sx, sourceY: sy, sourcePosition: sourcePos,
    targetX: tx, targetY: ty, targetPosition: targetPos,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
        style={{ ...style,cursor: 'pointer', pointerEvents: 'stroke',strokeWidth: 2  }
      }
       fill="none"
    />
  );
}