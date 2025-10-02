// DeleteNodesCommand - Deletes multiple nodes and their connected edges
// Undo: restores the deleted nodes and edges
// Redo: deletes them again

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class DeleteNodesCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;
  private deletedNodes: Node[];
  private deletedEdges: Edge[];

  constructor(
    private nodeIdsToDelete: string[],
    description?: string
  ) {
    this.description = description || `Delete ${nodeIdsToDelete.length} node(s)`;
    this.timestamp = Date.now();
    this.deletedNodes = [];
    this.deletedEdges = [];
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Store nodes being deleted for undo
    this.deletedNodes = nodes.filter(n => this.nodeIdsToDelete.includes(n.id));

    // Remove nodes
    const filteredNodes = nodes.filter(n => !this.nodeIdsToDelete.includes(n.id));

    // Store and remove edges connected to deleted nodes
    this.deletedEdges = edges.filter(
      e => this.nodeIdsToDelete.includes(e.source) || this.nodeIdsToDelete.includes(e.target)
    );

    const filteredEdges = edges.filter(
      e => !this.nodeIdsToDelete.includes(e.source) && !this.nodeIdsToDelete.includes(e.target)
    );

    console.log(`🗑️ Deleted ${this.deletedNodes.length} nodes and ${this.deletedEdges.length} connected edges`);

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Restore deleted nodes
    const restoredNodes = [...nodes, ...this.deletedNodes];

    // Restore deleted edges
    const restoredEdges = [...edges, ...this.deletedEdges];

    console.log(`⏪ Undo delete: restored ${this.deletedNodes.length} nodes and ${this.deletedEdges.length} edges`);

    return {
      nodes: restoredNodes,
      edges: restoredEdges,
    };
  }
}
