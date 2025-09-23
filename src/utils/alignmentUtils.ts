import type { Node } from '@xyflow/react';

export interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  nodes: string[];
  color: string;
}

export interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'node' | 'edge';
  nodeId?: string;
  snapDistance: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  right: number;
  bottom: number;
}

// Default snap distance in pixels
export const DEFAULT_SNAP_DISTANCE = 10;
export const ALIGNMENT_GUIDE_THRESHOLD = 5;

/**
 * Calculate bounding box for a node including its dimensions
 */
export function getNodeBoundingBox(node: Node): BoundingBox {
  const width = (typeof node.data?.width === 'number' ? node.data.width : null) ||
                (typeof node.width === 'number' ? node.width : null) || 100;
  const height = (typeof node.data?.height === 'number' ? node.data.height : null) ||
                 (typeof node.height === 'number' ? node.height : null) || 50;

  return {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
    centerX: node.position.x + width / 2,
    centerY: node.position.y + height / 2,
    right: node.position.x + width,
    bottom: node.position.y + height,
  };
}

/**
 * Calculate bounding box for multiple selected nodes
 */
export function getSelectionBoundingBox(nodes: Node[]): BoundingBox | null {
  if (nodes.length === 0) return null;

  const boxes = nodes.map(getNodeBoundingBox);
  const minX = Math.min(...boxes.map(box => box.x));
  const minY = Math.min(...boxes.map(box => box.y));
  const maxX = Math.max(...boxes.map(box => box.right));
  const maxY = Math.max(...boxes.map(box => box.bottom));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    right: maxX,
    bottom: maxY,
  };
}

/**
 * Detect alignment guides for a dragging node
 */
export function detectAlignmentGuides(
  draggingNode: Node,
  otherNodes: Node[],
  threshold: number = ALIGNMENT_GUIDE_THRESHOLD
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const draggingBox = getNodeBoundingBox(draggingNode);

  otherNodes.forEach(node => {
    const box = getNodeBoundingBox(node);

    // Horizontal alignment guides
    // Left edges
    if (Math.abs(draggingBox.x - box.x) <= threshold) {
      guides.push({
        id: `h-left-${node.id}`,
        type: 'horizontal',
        position: box.x,
        nodes: [draggingNode.id, node.id],
        color: '#ff6b6b',
      });
    }

    // Right edges
    if (Math.abs(draggingBox.right - box.right) <= threshold) {
      guides.push({
        id: `h-right-${node.id}`,
        type: 'horizontal',
        position: box.right,
        nodes: [draggingNode.id, node.id],
        color: '#ff6b6b',
      });
    }

    // Center horizontal
    if (Math.abs(draggingBox.centerX - box.centerX) <= threshold) {
      guides.push({
        id: `h-center-${node.id}`,
        type: 'horizontal',
        position: box.centerX,
        nodes: [draggingNode.id, node.id],
        color: '#4ecdc4',
      });
    }

    // Vertical alignment guides
    // Top edges
    if (Math.abs(draggingBox.y - box.y) <= threshold) {
      guides.push({
        id: `v-top-${node.id}`,
        type: 'vertical',
        position: box.y,
        nodes: [draggingNode.id, node.id],
        color: '#ff6b6b',
      });
    }

    // Bottom edges
    if (Math.abs(draggingBox.bottom - box.bottom) <= threshold) {
      guides.push({
        id: `v-bottom-${node.id}`,
        type: 'vertical',
        position: box.bottom,
        nodes: [draggingNode.id, node.id],
        color: '#ff6b6b',
      });
    }

    // Center vertical
    if (Math.abs(draggingBox.centerY - box.centerY) <= threshold) {
      guides.push({
        id: `v-center-${node.id}`,
        type: 'vertical',
        position: box.centerY,
        nodes: [draggingNode.id, node.id],
        color: '#4ecdc4',
      });
    }
  });

  return guides;
}

/**
 * Calculate snap position for a node being dragged
 */
export function calculateSnapPosition(
  currentPosition: { x: number; y: number },
  nodeSize: { width: number; height: number },
  allNodes: Node[],
  gridSize: number = 20,
  snapDistance: number = DEFAULT_SNAP_DISTANCE
): { x: number; y: number; snapped: boolean } {
  let snappedX = currentPosition.x;
  let snappedY = currentPosition.y;
  let hasSnapped = false;

  // Grid snapping
  const gridSnapX = Math.round(currentPosition.x / gridSize) * gridSize;
  const gridSnapY = Math.round(currentPosition.y / gridSize) * gridSize;

  if (Math.abs(currentPosition.x - gridSnapX) <= snapDistance) {
    snappedX = gridSnapX;
    hasSnapped = true;
  }

  if (Math.abs(currentPosition.y - gridSnapY) <= snapDistance) {
    snappedY = gridSnapY;
    hasSnapped = true;
  }

  // Node snapping
  const currentBox = {
    x: currentPosition.x,
    y: currentPosition.y,
    width: nodeSize.width,
    height: nodeSize.height,
    centerX: currentPosition.x + nodeSize.width / 2,
    centerY: currentPosition.y + nodeSize.height / 2,
    right: currentPosition.x + nodeSize.width,
    bottom: currentPosition.y + nodeSize.height,
  };

  allNodes.forEach(node => {
    const box = getNodeBoundingBox(node);

    // Horizontal snapping
    const horizontalDistances = [
      { pos: box.x, dist: Math.abs(currentBox.x - box.x) },
      { pos: box.centerX - nodeSize.width / 2, dist: Math.abs(currentBox.centerX - box.centerX) },
      { pos: box.right - nodeSize.width, dist: Math.abs(currentBox.right - box.right) },
    ];

    const closestHorizontal = horizontalDistances.reduce((min, curr) =>
      curr.dist < min.dist ? curr : min
    );

    if (closestHorizontal.dist <= snapDistance) {
      snappedX = closestHorizontal.pos;
      hasSnapped = true;
    }

    // Vertical snapping
    const verticalDistances = [
      { pos: box.y, dist: Math.abs(currentBox.y - box.y) },
      { pos: box.centerY - nodeSize.height / 2, dist: Math.abs(currentBox.centerY - box.centerY) },
      { pos: box.bottom - nodeSize.height, dist: Math.abs(currentBox.bottom - box.bottom) },
    ];

    const closestVertical = verticalDistances.reduce((min, curr) =>
      curr.dist < min.dist ? curr : min
    );

    if (closestVertical.dist <= snapDistance) {
      snappedY = closestVertical.pos;
      hasSnapped = true;
    }
  });

  return { x: snappedX, y: snappedY, snapped: hasSnapped };
}

/**
 * Alignment operations for selected nodes
 */
export type AlignmentType =
  | 'align-left'
  | 'align-center-horizontal'
  | 'align-right'
  | 'align-top'
  | 'align-center-vertical'
  | 'align-bottom'
  | 'distribute-horizontal'
  | 'distribute-vertical';

export function alignNodes(nodes: Node[], alignmentType: AlignmentType): Node[] {
  if (nodes.length < 2) return nodes;

  const boxes = nodes.map(node => ({ node, box: getNodeBoundingBox(node) }));

  switch (alignmentType) {
    case 'align-left': {
      const minX = Math.min(...boxes.map(({ box }) => box.x));
      return boxes.map(({ node }) => ({
        ...node,
        position: { ...node.position, x: minX },
      }));
    }

    case 'align-center-horizontal': {
      const centerX = boxes.reduce((sum, { box }) => sum + box.centerX, 0) / boxes.length;
      return boxes.map(({ node, box }) => ({
        ...node,
        position: { ...node.position, x: centerX - box.width / 2 },
      }));
    }

    case 'align-right': {
      const maxRight = Math.max(...boxes.map(({ box }) => box.right));
      return boxes.map(({ node, box }) => ({
        ...node,
        position: { ...node.position, x: maxRight - box.width },
      }));
    }

    case 'align-top': {
      const minY = Math.min(...boxes.map(({ box }) => box.y));
      return boxes.map(({ node }) => ({
        ...node,
        position: { ...node.position, y: minY },
      }));
    }

    case 'align-center-vertical': {
      const centerY = boxes.reduce((sum, { box }) => sum + box.centerY, 0) / boxes.length;
      return boxes.map(({ node, box }) => ({
        ...node,
        position: { ...node.position, y: centerY - box.height / 2 },
      }));
    }

    case 'align-bottom': {
      const maxBottom = Math.max(...boxes.map(({ box }) => box.bottom));
      return boxes.map(({ node, box }) => ({
        ...node,
        position: { ...node.position, y: maxBottom - box.height },
      }));
    }

    case 'distribute-horizontal': {
      if (nodes.length < 3) return nodes;
      const sorted = boxes.sort((a, b) => a.box.centerX - b.box.centerX);
      const leftmost = sorted[0].box.centerX;
      const rightmost = sorted[sorted.length - 1].box.centerX;
      const spacing = (rightmost - leftmost) / (sorted.length - 1);

      return sorted.map(({ node, box }, index) => ({
        ...node,
        position: {
          ...node.position,
          x: leftmost + index * spacing - box.width / 2,
        },
      }));
    }

    case 'distribute-vertical': {
      if (nodes.length < 3) return nodes;
      const sorted = boxes.sort((a, b) => a.box.centerY - b.box.centerY);
      const topmost = sorted[0].box.centerY;
      const bottommost = sorted[sorted.length - 1].box.centerY;
      const spacing = (bottommost - topmost) / (sorted.length - 1);

      return sorted.map(({ node, box }, index) => ({
        ...node,
        position: {
          ...node.position,
          y: topmost + index * spacing - box.height / 2,
        },
      }));
    }

    default:
      return nodes;
  }
}

/**
 * Find connection points for smart connectors
 */
export interface ConnectionPoint {
  x: number;
  y: number;
  side: 'top' | 'right' | 'bottom' | 'left';
  nodeId: string;
  isOptimal: boolean;
}

export function getConnectionPoints(node: Node): ConnectionPoint[] {
  const box = getNodeBoundingBox(node);

  return [
    { x: box.centerX, y: box.y, side: 'top', nodeId: node.id, isOptimal: false },
    { x: box.right, y: box.centerY, side: 'right', nodeId: node.id, isOptimal: false },
    { x: box.centerX, y: box.bottom, side: 'bottom', nodeId: node.id, isOptimal: false },
    { x: box.x, y: box.centerY, side: 'left', nodeId: node.id, isOptimal: false },
  ];
}

export function findOptimalConnectionPoints(
  sourceNode: Node,
  targetNode: Node
): { source: ConnectionPoint; target: ConnectionPoint } {
  const sourcePoints = getConnectionPoints(sourceNode);
  const targetPoints = getConnectionPoints(targetNode);

  let minDistance = Infinity;
  let optimalSource = sourcePoints[0];
  let optimalTarget = targetPoints[0];

  sourcePoints.forEach(sourcePoint => {
    targetPoints.forEach(targetPoint => {
      const distance = Math.sqrt(
        Math.pow(targetPoint.x - sourcePoint.x, 2) +
        Math.pow(targetPoint.y - sourcePoint.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        optimalSource = { ...sourcePoint, isOptimal: true };
        optimalTarget = { ...targetPoint, isOptimal: true };
      }
    });
  });

  return { source: optimalSource, target: optimalTarget };
}