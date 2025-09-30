// CreateNodeCommand - Creates new nodes on canvas
// Undo: removes the created node
// Redo: recreates the node

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class CreateNodeCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private node: Node,
    description?: string
  ) {
    this.description = description || `Create ${node.type || 'node'}`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Add the new node if it doesn't already exist
    const nodeExists = nodes.some(n => n.id === this.node.id);
    if (nodeExists) {
      return { nodes, edges };
    }

    return {
      nodes: [...nodes, this.node],
      edges,
    };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Remove the created node
    const filteredNodes = nodes.filter(n => n.id !== this.node.id);

    // Also remove any edges connected to this node
    const filteredEdges = edges.filter(
      e => e.source !== this.node.id && e.target !== this.node.id
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }
}
