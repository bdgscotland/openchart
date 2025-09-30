// DeleteNodeCommand - Deletes nodes from canvas
// Undo: restores the deleted nodes and their connections
// Redo: deletes the nodes again

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class DeleteNodeCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;
  private deletedNodes: Node[];
  private deletedEdges: Edge[];

  constructor(
    private nodeIds: string[],
    nodes: Node[],
    edges: Edge[],
    description?: string
  ) {
    this.description = description || `Delete ${nodeIds.length} node(s)`;
    this.timestamp = Date.now();

    // Store the nodes and edges that will be deleted (needed for undo)
    this.deletedNodes = nodes.filter(n => nodeIds.includes(n.id));
    this.deletedEdges = edges.filter(
      e => nodeIds.includes(e.source) || nodeIds.includes(e.target)
    );
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Remove the specified nodes
    const filteredNodes = nodes.filter(n => !this.nodeIds.includes(n.id));

    // Remove edges connected to deleted nodes
    const filteredEdges = edges.filter(
      e => !this.nodeIds.includes(e.source) && !this.nodeIds.includes(e.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Restore the deleted nodes and edges
    return {
      nodes: [...nodes, ...this.deletedNodes],
      edges: [...edges, ...this.deletedEdges],
    };
  }
}
