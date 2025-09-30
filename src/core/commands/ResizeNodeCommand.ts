// ResizeNodeCommand - Resizes nodes
// Undo/Redo: restores size changes
// Supports merging consecutive resizes for smooth interaction

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

interface NodeSize {
  width: number;
  height: number;
}

interface NodeSizeUpdate {
  nodeId: string;
  from: NodeSize;
  to: NodeSize;
}

export class ResizeNodeCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private updates: NodeSizeUpdate[],
    description?: string
  ) {
    this.description = description || `Resize ${updates.length} node(s)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedNodes = nodes.map(node => {
      const update = this.updates.find(u => u.nodeId === node.id);
      if (update) {
        return {
          ...node,
          data: {
            ...node.data,
            width: update.to.width,
            height: update.to.height,
          },
          style: {
            ...node.style,
            width: update.to.width,
            height: update.to.height,
          },
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
          data: {
            ...node.data,
            width: update.from.width,
            height: update.from.height,
          },
          style: {
            ...node.style,
            width: update.from.width,
            height: update.from.height,
          },
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }

  merge(otherCommand: ReactFlowCommand): ReactFlowCommand | null {
    if (
      otherCommand instanceof ResizeNodeCommand &&
      otherCommand.timestamp - this.timestamp < 500 // 500ms merge window
    ) {
      // Check if we're resizing the same nodes
      const thisNodeIds = new Set(this.updates.map(u => u.nodeId));
      const otherNodeIds = new Set(otherCommand.updates.map(u => u.nodeId));

      const sameNodes =
        thisNodeIds.size === otherNodeIds.size &&
        [...thisNodeIds].every(id => otherNodeIds.has(id));

      if (sameNodes) {
        // Merge: keep original 'from' sizes, use new 'to' sizes
        const mergedUpdates = this.updates.map(update => {
          const otherUpdate = otherCommand.updates.find(
            u => u.nodeId === update.nodeId
          );
          return {
            nodeId: update.nodeId,
            from: update.from, // Keep original start size
            to: otherUpdate?.to || update.to, // Use latest end size
          };
        });

        return new ResizeNodeCommand(mergedUpdates, this.description);
      }
    }

    return null;
  }
}
