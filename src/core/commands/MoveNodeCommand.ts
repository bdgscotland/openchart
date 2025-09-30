// MoveNodeCommand - Moves nodes to new positions
// Undo/Redo: restores position changes
// Supports merging consecutive moves for smooth dragging

import type { Node, Edge, XYPosition } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

interface NodePositionUpdate {
  nodeId: string;
  from: XYPosition;
  to: XYPosition;
}

export class MoveNodeCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private updates: NodePositionUpdate[],
    description?: string
  ) {
    this.description = description || `Move ${updates.length} node(s)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedNodes = nodes.map(node => {
      const update = this.updates.find(u => u.nodeId === node.id);
      if (update) {
        return {
          ...node,
          position: update.to,
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedNodes = nodes.map(node => {
      const update = this.updates.find(u => u.nodeId === node.id);
      if (update) {
        return {
          ...node,
          position: update.from,
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }

  merge(otherCommand: ReactFlowCommand): ReactFlowCommand | null {
    if (
      otherCommand instanceof MoveNodeCommand &&
      otherCommand.timestamp - this.timestamp < 500 // 500ms merge window
    ) {
      // Check if we're moving the same nodes
      const thisNodeIds = new Set(this.updates.map(u => u.nodeId));
      const otherNodeIds = new Set(otherCommand.updates.map(u => u.nodeId));

      const sameNodes =
        thisNodeIds.size === otherNodeIds.size &&
        [...thisNodeIds].every(id => otherNodeIds.has(id));

      if (sameNodes) {
        // Merge: keep original 'from' positions, use new 'to' positions
        const mergedUpdates = this.updates.map(update => {
          const otherUpdate = otherCommand.updates.find(
            u => u.nodeId === update.nodeId
          );
          return {
            nodeId: update.nodeId,
            from: update.from, // Keep original start position
            to: otherUpdate?.to || update.to, // Use latest end position
          };
        });

        return new MoveNodeCommand(mergedUpdates, this.description);
      }
    }

    return null;
  }
}
