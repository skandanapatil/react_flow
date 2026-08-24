import { Position } from '@xyflow/react';

function getNodeIntersection(intersectionNode, targetNode) {
  const { measured: { width: w, height: h }, internals: { positionAbsolute: pos } } = intersectionNode;
  const { internals: { positionAbsolute: targetPos }, measured: { width: tw, height: th } } = targetNode;
  const x2 = pos.x + w / 2, y2 = pos.y + h / 2;
  const x1 = targetPos.x + tw / 2, y1 = targetPos.y + th / 2;
  const xx1 = (x1 - x2) / (2 * w / 2) - (y1 - y2) / (2 * h / 2);
  const yy1 = (x1 - x2) / (2 * w / 2) + (y1 - y2) / (2 * h / 2);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  return {
    x: (w / 2) * (a * xx1 + a * yy1) + x2,
    y: (h / 2) * (-a * xx1 + a * yy1) + y2,
  };
}

function getEdgePosition(node, pt) {
  const { internals: { positionAbsolute: pos }, measured: { width: w, height: h } } = node;
  const nx = Math.round(pos.x), ny = Math.round(pos.y);
  const px = Math.round(pt.x),  py = Math.round(pt.y);
  if (px <= nx + 1)     return Position.Left;
  if (px >= nx + w - 1) return Position.Right;
  if (py <= ny + 1)     return Position.Top;
  if (py >= ny + h - 1) return Position.Bottom;
  return Position.Top;
}

export function getEdgeParams(source, target) {
  const si = getNodeIntersection(source, target);
  const ti = getNodeIntersection(target, source);
  return {
    sx: si.x, sy: si.y, tx: ti.x, ty: ti.y,
    sourcePos: getEdgePosition(source, si),
    targetPos: getEdgePosition(target, ti),
  };
}