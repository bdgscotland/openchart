// CommandManager - The brain behind buttery-smooth undo/redo
// This is what makes OpenChart feel professional and never lose work

import type { Command } from './Command';
import type { DiagramSchema } from '../../types/diagram';

export interface CommandManagerState {
  canUndo: boolean;
  canRedo: boolean;
  undoDescription?: string;
  redoDescription?: string;
  commandCount: number;
}

/**
 * Manages command execution, undo/redo stack, and command merging
 * Designed for maximum performance and smooth UX
 */
export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxStackSize: number = 100; // Prevent memory bloat
  private onStateChange?: (state: CommandManagerState) => void;
  
  constructor(maxStackSize = 100) {
    this.maxStackSize = maxStackSize;
  }
  
  /**
   * Subscribe to state changes for UI updates
   */
  setOnStateChange(callback: (state: CommandManagerState) => void): void {
    this.onStateChange = callback;
    this.notifyStateChange();
  }
  
  /**
   * Execute a command and add it to the undo stack
   * Returns the new diagram state
   */
  executeCommand(command: Command, currentState: DiagramSchema): DiagramSchema {
    // Try to merge with the last command for smoother UX
    if (this.undoStack.length > 0) {
      const lastCommand = this.undoStack[this.undoStack.length - 1];
      const merged = lastCommand.merge?.(command);
      
      if (merged) {
        // Replace last command with merged version
        this.undoStack[this.undoStack.length - 1] = merged;
        const newState = merged.execute(currentState);
        this.notifyStateChange();
        return newState;
      }
    }
    
    // Execute the command
    const newState = command.execute(currentState);
    
    // Add to undo stack
    this.undoStack.push(command);
    
    // Clear redo stack (new command invalidates redo history)
    this.redoStack = [];
    
    // Maintain stack size limit
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift(); // Remove oldest command
    }
    
    this.notifyStateChange();
    return newState;
  }
  
  /**
   * Undo the last command
   * Returns the previous diagram state, or null if nothing to undo
   */
  undo(currentState: DiagramSchema): DiagramSchema | null {
    if (this.undoStack.length === 0) return null;
    
    const command = this.undoStack.pop()!;
    const previousState = command.undo(currentState);
    
    // Add to redo stack
    this.redoStack.push(command);
    
    // Maintain redo stack size
    if (this.redoStack.length > this.maxStackSize) {
      this.redoStack.shift();
    }
    
    this.notifyStateChange();
    return previousState;
  }
  
  /**
   * Redo the last undone command
   * Returns the next diagram state, or null if nothing to redo
   */
  redo(currentState: DiagramSchema): DiagramSchema | null {
    if (this.redoStack.length === 0) return null;
    
    const command = this.redoStack.pop()!;
    const nextState = command.execute(currentState);
    
    // Add back to undo stack
    this.undoStack.push(command);
    
    this.notifyStateChange();
    return nextState;
  }
  
  /**
   * Clear all command history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyStateChange();
  }
  
  /**
   * Get current state for UI updates
   */
  getState(): CommandManagerState {
    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoDescription: this.undoStack.length > 0 
        ? this.undoStack[this.undoStack.length - 1].description 
        : undefined,
      redoDescription: this.redoStack.length > 0 
        ? this.redoStack[this.redoStack.length - 1].description 
        : undefined,
      commandCount: this.undoStack.length,
    };
  }
  
  /**
   * Get command history for debugging or advanced UI
   */
  getHistory(): { undo: Command[], redo: Command[] } {
    return {
      undo: [...this.undoStack],
      redo: [...this.redoStack],
    };
  }
  
  /**
   * Notify subscribers of state changes
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}

/**
 * Keyboard shortcut helpers
 */
export const KeyboardShortcuts = {
  isUndo: (event: KeyboardEvent): boolean => {
    return (event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey;
  },
  
  isRedo: (event: KeyboardEvent): boolean => {
    return ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
           ((event.ctrlKey || event.metaKey) && event.key === 'y');
  },
};

// Global command manager instance - singleton pattern for convenience
export const globalCommandManager = new CommandManager();