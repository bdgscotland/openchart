// BulkOperationCommand - Executes multiple commands as a single unit
// Useful for multi-select operations like delete multiple, move multiple, etc.
// Undo/Redo: operates on all commands as a batch

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from './ReactFlowCommand';

export class BulkOperationCommand implements ReactFlowCommand {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private commands: ReactFlowCommand[],
    description?: string
  ) {
    this.description = description || `Bulk operation (${commands.length} commands)`;
    this.timestamp = Date.now();
  }

  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    let currentState = { nodes, edges };

    // Execute all commands in sequence
    for (const command of this.commands) {
      currentState = command.execute(currentState.nodes, currentState.edges);
    }

    return currentState;
  }

  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    let currentState = { nodes, edges };

    // Undo all commands in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      currentState = this.commands[i].undo(currentState.nodes, currentState.edges);
    }

    return currentState;
  }
}
