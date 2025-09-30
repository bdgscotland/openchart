// UpdateTextCommand - Updates node text/label content
// Undo/Redo: restores text changes
// Works with React Flow node data.label

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

interface TextUpdate {
  nodeId: string;
  previousText: string;
  newText: string;
}

export class UpdateTextCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private updates: TextUpdate[],
    description?: string
  ) {
    this.description = description || `Update text for ${updates.length} node(s)`;
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
            label: update.newText,
            lastTextUpdate: Date.now(),
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
            label: update.previousText,
            lastTextUpdate: Date.now(),
          },
        };
      }
      return node;
    });

    return { nodes: updatedNodes, edges };
  }

  merge(otherCommand: ReactFlowCommand): ReactFlowCommand | null {
    if (
      otherCommand instanceof UpdateTextCommand &&
      otherCommand.timestamp - this.timestamp < 2000 // 2 second merge window for typing
    ) {
      // Check if we're updating the same nodes
      const thisNodeIds = new Set(this.updates.map(u => u.nodeId));
      const otherNodeIds = new Set(otherCommand.updates.map(u => u.nodeId));

      const sameNodes =
        thisNodeIds.size === otherNodeIds.size &&
        [...thisNodeIds].every(id => otherNodeIds.has(id));

      if (sameNodes) {
        // Merge: keep original previous text, use new text
        const mergedUpdates = this.updates.map(update => {
          const otherUpdate = otherCommand.updates.find(
            u => u.nodeId === update.nodeId
          );
          return {
            nodeId: update.nodeId,
            previousText: update.previousText, // Keep original previous state
            newText: otherUpdate?.newText || update.newText, // Use latest new state
          };
        });

        return new UpdateTextCommand(mergedUpdates, this.description);
      }
    }

    return null;
  }
}
