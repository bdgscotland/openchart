// ChangeLayerCommand - Moves nodes/edges between layers
// Undo/Redo: restores layer assignments

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

interface LayerChange {
  nodeId?: string;
  edgeId?: string;
  previousLayerId: string;
  newLayerId: string;
}

export class ChangeLayerCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private changes: LayerChange[],
    description?: string
  ) {
    this.description = description || `Change layer for ${changes.length} item(s)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Update nodes
    const updatedNodes = nodes.map(node => {
      const change = this.changes.find(c => c.nodeId === node.id);
      if (change) {
        return {
          ...node,
          data: {
            ...node.data,
            layerId: change.newLayerId,
          },
        };
      }
      return node;
    });

    // Update edges
    const updatedEdges = edges.map(edge => {
      const change = this.changes.find(c => c.edgeId === edge.id);
      if (change) {
        return {
          ...edge,
          data: {
            ...edge.data,
            layerId: change.newLayerId,
          },
        };
      }
      return edge;
    });

    return { nodes: updatedNodes, edges: updatedEdges };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Restore nodes to previous layers
    const updatedNodes = nodes.map(node => {
      const change = this.changes.find(c => c.nodeId === node.id);
      if (change) {
        return {
          ...node,
          data: {
            ...node.data,
            layerId: change.previousLayerId,
          },
        };
      }
      return node;
    });

    // Restore edges to previous layers
    const updatedEdges = edges.map(edge => {
      const change = this.changes.find(c => c.edgeId === edge.id);
      if (change) {
        return {
          ...edge,
          data: {
            ...edge.data,
            layerId: change.previousLayerId,
          },
        };
      }
      return edge;
    });

    return { nodes: updatedNodes, edges: updatedEdges };
  }
}
