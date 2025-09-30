// ZOrderCommand - Changes z-order of nodes (bring to front, send to back)
// Undo/Redo: restores z-index values

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

interface ZOrderChange {
  nodeId: string;
  previousZIndex: number | undefined;
  newZIndex: number;
}

export class ZOrderCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private changes: ZOrderChange[],
    description?: string
  ) {
    this.description = description || `Change z-order for ${changes.length} node(s)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedNodes = nodes.map(node => {
      const change = this.changes.find(c => c.nodeId === node.id);
      if (change) {
        return {
          ...node,
          zIndex: change.newZIndex,
          data: {
            ...node.data,
            zIndex: change.newZIndex,
          },
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedNodes = nodes.map(node => {
      const change = this.changes.find(c => c.nodeId === node.id);
      if (change) {
        const zIndex = change.previousZIndex;
        return {
          ...node,
          zIndex,
          data: {
            ...node.data,
            zIndex,
          },
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }
}
