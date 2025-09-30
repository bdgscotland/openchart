// DeleteEdgeCommand - Deletes edges (connections) from canvas
// Undo: restores the deleted edges
// Redo: deletes the edges again

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class DeleteEdgeCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;
  private deletedEdges: Edge[];

  constructor(
    private edgeIds: string[],
    edges: Edge[],
    description?: string
  ) {
    this.description = description || `Delete ${edgeIds.length} connection(s)`;
    this.timestamp = Date.now();

    // Store the edges that will be deleted (needed for undo)
    this.deletedEdges = edges.filter(e => edgeIds.includes(e.id));
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Remove the specified edges
    return {
      nodes,
      edges: edges.filter(e => !this.edgeIds.includes(e.id)),
    };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Restore the deleted edges
    return {
      nodes,
      edges: [...edges, ...this.deletedEdges],
    };
  }
}
