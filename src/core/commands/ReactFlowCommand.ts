// React Flow Command Interface for Undo/Redo System
// This interface works with React Flow's Node and Edge types

import type { Node, Edge } from '@xyflow/react';

/**
 * Base command interface for React Flow operations
 * All commands work with React Flow state (nodes and edges)
 */
export interface ReactFlowCommand {
  /**
   * Execute the command and return the new state
   */
  execute(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] };

  /**
   * Undo the command and return the previous state
   */
  undo(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] };

  /**
   * Optional: Merge with another command for efficiency
   * Used for batching similar operations (e.g., multiple moves while dragging)
   */
  merge?(otherCommand: ReactFlowCommand): ReactFlowCommand | null;

  /**
   * Description for debugging/UI
   */
  description: string;

  /**
   * Timestamp for when command was created
   */
  timestamp: number;
}
