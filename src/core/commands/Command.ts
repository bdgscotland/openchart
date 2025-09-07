// Command Pattern for Undo/Redo System
// This is the foundation for making OpenChart feel professional AF

import type { DiagramSchema, DiagramElement, Point, Size } from '../../types/diagram';

/**
 * Base command interface - every action that can be undone implements this
 */
export interface Command {
  /**
   * Execute the command and return the new state
   */
  execute(currentState: DiagramSchema): DiagramSchema;
  
  /**
   * Undo the command and return the previous state
   */
  undo(currentState: DiagramSchema): DiagramSchema;
  
  /**
   * Optional: Merge with another command for efficiency
   * Used for batching similar operations (e.g., multiple moves while dragging)
   */
  merge?(otherCommand: Command): Command | null;
  
  /**
   * Description for debugging/UI
   */
  description: string;
  
  /**
   * Timestamp for when command was created
   */
  timestamp: number;
}

/**
 * Command to add an element to the diagram
 */
export class AddElementCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  
  constructor(
    private element: DiagramElement,
    description?: string
  ) {
    this.description = description || `Add ${element.type}`;
    this.timestamp = Date.now();
  }
  
  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: [...currentState.elements, this.element],
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.filter(el => el.id !== this.element.id),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
}

/**
 * Command to remove elements from the diagram
 */
export class RemoveElementsCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  
  constructor(
    private elementIds: string[],
    private removedElements: DiagramElement[], // Store for undo
    description?: string
  ) {
    this.description = description || `Remove ${elementIds.length} element(s)`;
    this.timestamp = Date.now();
  }
  
  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.filter(el => !this.elementIds.includes(el.id)),
      connections: currentState.connections.filter(
        conn => !this.elementIds.includes(conn.from.elementId) && 
                !this.elementIds.includes(conn.to.elementId)
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: [...currentState.elements, ...this.removedElements],
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
}

/**
 * Command to move an element - with intelligent merging for smooth dragging
 */
export class MoveElementCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  
  constructor(
    private elementId: string,
    private fromPosition: Point,
    private toPosition: Point,
    description?: string
  ) {
    this.description = description || `Move element`;
    this.timestamp = Date.now();
  }
  
  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el =>
        el.id === this.elementId
          ? { ...el, position: this.toPosition }
          : el
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el =>
        el.id === this.elementId
          ? { ...el, position: this.fromPosition }
          : el
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  /**
   * Merge consecutive moves of the same element for better UX
   * This prevents undo/redo from being flooded with micro-movements
   */
  merge(otherCommand: Command): Command | null {
    if (otherCommand instanceof MoveElementCommand &&
        otherCommand.elementId === this.elementId &&
        otherCommand.timestamp - this.timestamp < 500) { // 500ms window
      
      // Create new command from original position to final position
      return new MoveElementCommand(
        this.elementId,
        this.fromPosition, // Keep original start position
        otherCommand.toPosition, // Use latest end position
        this.description
      );
    }
    return null;
  }
}

/**
 * Command to resize an element
 */
export class ResizeElementCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  
  constructor(
    private elementId: string,
    private fromSize: Size,
    private toSize: Size,
    description?: string
  ) {
    this.description = description || `Resize element`;
    this.timestamp = Date.now();
  }
  
  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el =>
        el.id === this.elementId
          ? { ...el, size: this.toSize }
          : el
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el =>
        el.id === this.elementId
          ? { ...el, size: this.fromSize }
          : el
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  merge(otherCommand: Command): Command | null {
    if (otherCommand instanceof ResizeElementCommand &&
        otherCommand.elementId === this.elementId &&
        otherCommand.timestamp - this.timestamp < 500) {
      
      return new ResizeElementCommand(
        this.elementId,
        this.fromSize,
        otherCommand.toSize,
        this.description
      );
    }
    return null;
  }
}

/**
 * Command to update element properties (text, style, etc.)
 */
export class UpdateElementCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  
  constructor(
    private elementId: string,
    private updates: Partial<DiagramElement>,
    private previousValues: Partial<DiagramElement>,
    description?: string
  ) {
    this.description = description || `Update element`;
    this.timestamp = Date.now();
  }
  
  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el =>
        el.id === this.elementId
          ? { ...el, ...this.updates }
          : el
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
  
  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el =>
        el.id === this.elementId
          ? { ...el, ...this.previousValues }
          : el
      ),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
}