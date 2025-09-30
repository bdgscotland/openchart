// CreateEdgeCommand - Creates new edges (connections) on canvas
// Undo: removes the created edge
// Redo: recreates the edge

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class CreateEdgeCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private edge: Edge,
    description?: string
  ) {
    this.description = description || `Create connection`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Add the new edge if it doesn't already exist
    const edgeExists = edges.some(e => e.id === this.edge.id);
    if (edgeExists) {
      return { nodes, edges };
    }

    return {
      nodes,
      edges: [...edges, this.edge],
    };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Remove the created edge
    return {
      nodes,
      edges: edges.filter(e => e.id !== this.edge.id),
    };
  }
}
