// PasteNodesCommand - Pastes copied nodes and edges
// Undo: removes the pasted nodes
// Redo: pastes them again

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class PasteNodesCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;
  private pastedNodeIds: string[];
  private pastedEdgeIds: string[];

  constructor(
    private nodesToPaste: Node[],
    private edgesToPaste: Edge[],
    description?: string
  ) {
    this.description = description || `Paste ${nodesToPaste.length} node(s)`;
    this.timestamp = Date.now();
    this.pastedNodeIds = nodesToPaste.map(n => n.id);
    this.pastedEdgeIds = edgesToPaste.map(e => e.id);
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Deselect existing nodes
    const deselectedNodes = nodes.map(node => ({ ...node, selected: false }));

    // Add pasted nodes (they come pre-selected from useClipboard)
    const newNodes = [...deselectedNodes, ...this.nodesToPaste];

    // Add pasted edges
    const newEdges = [...edges, ...this.edgesToPaste];

    console.log(`📋 Pasted ${this.nodesToPaste.length} nodes and ${this.edgesToPaste.length} edges`);

    return {
      nodes: newNodes,
      edges: newEdges,
    };
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    // Remove all pasted nodes
    const filteredNodes = nodes.filter(n => !this.pastedNodeIds.includes(n.id));

    // Remove all pasted edges
    const filteredEdges = edges.filter(e => !this.pastedEdgeIds.includes(e.id));

    console.log(`⏪ Undo paste: removed ${this.pastedNodeIds.length} nodes and ${this.pastedEdgeIds.length} edges`);

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }
}
