// UpdateEdgeStyleCommand - Updates edge style properties
// Undo/Redo: restores edge style changes
// Works with React Flow edge data.style

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';
import type { EdgeStyleConfig } from '../../types/edgeTypes';

interface EdgeStyleUpdate {
  edgeId: string;
  previousStyle: Partial<EdgeStyleConfig>;
  newStyle: Partial<EdgeStyleConfig>;
}

export class UpdateEdgeStyleCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private updates: EdgeStyleUpdate[],
    description?: string
  ) {
    this.description = description || `Update edge style for ${updates.length} connection(s)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedEdges = edges.map(edge => {
      const update = this.updates.find(u => u.edgeId === edge.id);
      if (update) {
        const currentStyle = edge.data?.style || {};
        const newStyle = { ...currentStyle, ...update.newStyle };

        return {
          ...edge,
          data: {
            ...edge.data,
            style: newStyle,
            lastStyleUpdate: Date.now(),
          },
        };
      }
      return edge;
    });

    return { nodes, edges: updatedEdges };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const updatedEdges = edges.map(edge => {
      const update = this.updates.find(u => u.edgeId === edge.id);
      if (update) {
        const currentStyle = edge.data?.style || {};
        const restoredStyle = { ...currentStyle, ...update.previousStyle };

        return {
          ...edge,
          data: {
            ...edge.data,
            style: restoredStyle,
            lastStyleUpdate: Date.now(),
          },
        };
      }
      return edge;
    });

    return { nodes, edges: updatedEdges };
  }

  merge(otherCommand: ReactFlowCommand): ReactFlowCommand | null {
    if (
      otherCommand instanceof UpdateEdgeStyleCommand &&
      otherCommand.timestamp - this.timestamp < 1000 // 1 second merge window
    ) {
      // Check if we're updating the same edges
      const thisEdgeIds = new Set(this.updates.map(u => u.edgeId));
      const otherEdgeIds = new Set(otherCommand.updates.map(u => u.edgeId));

      const sameEdges =
        thisEdgeIds.size === otherEdgeIds.size &&
        [...thisEdgeIds].every(id => otherEdgeIds.has(id));

      if (sameEdges) {
        // Merge: keep original previous style, use new style
        const mergedUpdates = this.updates.map(update => {
          const otherUpdate = otherCommand.updates.find(
            u => u.edgeId === update.edgeId
          );
          return {
            edgeId: update.edgeId,
            previousStyle: update.previousStyle, // Keep original previous state
            newStyle: otherUpdate?.newStyle || update.newStyle, // Use latest new state
          };
        });

        return new UpdateEdgeStyleCommand(mergedUpdates, this.description);
      }
    }

    return null;
  }
}
