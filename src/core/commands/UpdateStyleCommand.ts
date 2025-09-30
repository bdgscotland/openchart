// UpdateStyleCommand - Updates node style properties
// Undo/Redo: restores style changes
// Works with React Flow node data.style

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';
import type { ElementStyle } from '../../types/diagram';

interface StyleUpdate {
  nodeId: string;
  previousStyle: Partial<ElementStyle>;
  newStyle: Partial<ElementStyle>;
}

export class UpdateStyleCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private updates: StyleUpdate[],
    description?: string
  ) {
    this.description = description || `Update style for ${updates.length} node(s)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedNodes = nodes.map(node => {
      const update = this.updates.find(u => u.nodeId === node.id);
      if (update) {
        const currentStyle = node.data?.style || {};
        const newStyle = { ...currentStyle, ...update.newStyle };

        return {
          ...node,
          data: {
            ...node.data,
            style: newStyle,
            // Update legacy properties for backward compatibility
            backgroundColor: newStyle.fill || node.data?.backgroundColor,
            borderColor: newStyle.stroke || node.data?.borderColor,
            lastStyleUpdate: Date.now(),
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
        const currentStyle = node.data?.style || {};
        const restoredStyle = { ...currentStyle, ...update.previousStyle };

        return {
          ...node,
          data: {
            ...node.data,
            style: restoredStyle,
            // Update legacy properties for backward compatibility
            backgroundColor: restoredStyle.fill || node.data?.backgroundColor,
            borderColor: restoredStyle.stroke || node.data?.borderColor,
            lastStyleUpdate: Date.now(),
          },
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }

  merge(otherCommand: ReactFlowCommand): ReactFlowCommand | null {
    if (
      otherCommand instanceof UpdateStyleCommand &&
      otherCommand.timestamp - this.timestamp < 1000 // 1 second merge window
    ) {
      // Check if we're updating the same nodes
      const thisNodeIds = new Set(this.updates.map(u => u.nodeId));
      const otherNodeIds = new Set(otherCommand.updates.map(u => u.nodeId));

      const sameNodes =
        thisNodeIds.size === otherNodeIds.size &&
        [...thisNodeIds].every(id => otherNodeIds.has(id));

      if (sameNodes) {
        // Merge: keep original previous style, use new style
        const mergedUpdates = this.updates.map(update => {
          const otherUpdate = otherCommand.updates.find(
            u => u.nodeId === update.nodeId
          );
          return {
            nodeId: update.nodeId,
            previousStyle: update.previousStyle, // Keep original previous state
            newStyle: otherUpdate?.newStyle || update.newStyle, // Use latest new state
          };
        });

        return new UpdateStyleCommand(mergedUpdates, this.description);
      }
    }

    return null;
  }
}
