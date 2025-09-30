// HistoryManager - Manages undo/redo stacks for React Flow operations
// Maintains history of commands with configurable max size
// Supports command merging for better UX

import type { Node, Edge } from '@xyflow/react';
import type { ReactFlowCommand } from '../commands/ReactFlowCommand';

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  undoStackSize: number;
  redoStackSize: number;
}

export type HistoryChangeListener = (state: HistoryState) => void;

export class HistoryManager {
  private undoStack: ReactFlowCommand[] = [];
  private redoStack: ReactFlowCommand[] = [];
  private maxHistorySize: number;
  private listeners: Set<HistoryChangeListener> = new Set();

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Execute a command and add it to the undo stack
   */
  executeCommand(
    command: ReactFlowCommand,
    currentNodes: Node[],
    currentEdges: Edge[]
  ): { nodes: Node[]; edges: Edge[] } {
    // Try to merge with the last command if possible
    if (this.undoStack.length > 0) {
      const lastCommand = this.undoStack[this.undoStack.length - 1];

      if (lastCommand.merge) {
        const mergedCommand = lastCommand.merge(command);
        if (mergedCommand) {
          // Replace last command with merged version
          this.undoStack[this.undoStack.length - 1] = mergedCommand;
          this.notifyListeners();
          return mergedCommand.execute(currentNodes, currentEdges);
        }
      }
    }

    // Execute the command
    const result = command.execute(currentNodes, currentEdges);

    // Add to undo stack
    this.undoStack.push(command);

    // Limit stack size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    // Clear redo stack when new command is executed
    this.redoStack = [];

    this.notifyListeners();
    return result;
  }

  /**
   * Undo the last command
   */
  undo(currentNodes: Node[], currentEdges: Edge[]): { nodes: Node[]; edges: Edge[] } | null {
    if (this.undoStack.length === 0) {
      return null;
    }

    const command = this.undoStack.pop()!;
    const result = command.undo(currentNodes, currentEdges);

    // Move command to redo stack
    this.redoStack.push(command);

    this.notifyListeners();
    return result;
  }

  /**
   * Redo the last undone command
   */
  redo(currentNodes: Node[], currentEdges: Edge[]): { nodes: Node[]; edges: Edge[] } | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    const command = this.redoStack.pop()!;
    const result = command.execute(currentNodes, currentEdges);

    // Move command back to undo stack
    this.undoStack.push(command);

    this.notifyListeners();
    return result;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get current history state
   */
  getState(): HistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length,
    };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners();
  }

  /**
   * Get description of command that will be undone
   */
  getUndoDescription(): string | null {
    if (this.undoStack.length === 0) {
      return null;
    }
    return this.undoStack[this.undoStack.length - 1].description;
  }

  /**
   * Get description of command that will be redone
   */
  getRedoDescription(): string | null {
    if (this.redoStack.length === 0) {
      return null;
    }
    return this.redoStack[this.redoStack.length - 1].description;
  }

  /**
   * Add a listener for history state changes
   */
  addListener(listener: HistoryChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Get debug information about history
   */
  getDebugInfo(): {
    undoStack: Array<{ description: string; timestamp: number }>;
    redoStack: Array<{ description: string; timestamp: number }>;
  } {
    return {
      undoStack: this.undoStack.map(cmd => ({
        description: cmd.description,
        timestamp: cmd.timestamp,
      })),
      redoStack: this.redoStack.map(cmd => ({
        description: cmd.description,
        timestamp: cmd.timestamp,
      })),
    };
  }
}
