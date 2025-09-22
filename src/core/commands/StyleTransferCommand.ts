import type { Command } from './Command';
import type { DiagramSchema, ElementStyle } from '../../types/diagram';

/**
 * Command for style transfer operations - supports undo/redo
 * Handles both single and multiple element style applications
 */
export class StyleTransferCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private targetElementIds: string[],
    private newStyle: ElementStyle,
    private previousStyles: Map<string, ElementStyle>,
    private transferType: 'copy' | 'paste' | 'pipette' | 'format-painter' = 'paste',
    description?: string
  ) {
    const count = targetElementIds.length;
    const action = transferType === 'pipette' ? 'Pick and apply' :
                   transferType === 'format-painter' ? 'Paint' :
                   transferType === 'copy' ? 'Copy' : 'Apply';

    this.description = description || `${action} style to ${count} element${count > 1 ? 's' : ''}`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el => {
        if (this.targetElementIds.includes(el.id)) {
          return {
            ...el,
            style: { ...el.style, ...this.newStyle }
          };
        }
        return el;
      }),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el => {
        if (this.targetElementIds.includes(el.id)) {
          const previousStyle = this.previousStyles.get(el.id);
          if (previousStyle) {
            return {
              ...el,
              style: previousStyle
            };
          }
        }
        return el;
      }),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  /**
   * Merge consecutive style operations on the same elements
   * This prevents undo/redo from being flooded with micro-style changes
   */
  merge(otherCommand: Command): Command | null {
    if (!(otherCommand instanceof StyleTransferCommand)) return null;

    // Only merge if operating on the same elements within a short time window
    if (this.targetElementIds.length !== otherCommand.targetElementIds.length ||
        !this.targetElementIds.every(id => otherCommand.targetElementIds.includes(id)) ||
        otherCommand.timestamp - this.timestamp > 2000) { // 2 second window
      return null;
    }

    // Create merged command that applies the final style but keeps original previous styles
    return new StyleTransferCommand(
      this.targetElementIds,
      otherCommand.newStyle, // Use the latest style
      this.previousStyles, // Keep original previous styles for undo
      otherCommand.transferType,
      `${this.description} (merged)`
    );
  }
}

/**
 * Command for copying styles (just for tracking/undo purposes)
 */
export class StyleCopyCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private sourceElementId: string,
    private copiedStyle: ElementStyle,
    description?: string
  ) {
    this.description = description || `Copy style from element`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    // Style copy doesn't modify the diagram, just tracks the action
    return currentState;
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    // Style copy can't be undone (it doesn't change the diagram)
    return currentState;
  }
}

/**
 * Command for selective style transfer (partial style properties)
 */
export class SelectiveStyleTransferCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private targetElementIds: string[],
    private styleProperties: Partial<ElementStyle>, // Only specific properties
    private previousValues: Map<string, Partial<ElementStyle>>, // Previous values for undo
    private propertyNames: string[], // Names of transferred properties
    description?: string
  ) {
    const count = targetElementIds.length;
    const props = propertyNames.join(', ');
    this.description = description || `Apply ${props} to ${count} element${count > 1 ? 's' : ''}`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el => {
        if (this.targetElementIds.includes(el.id)) {
          return {
            ...el,
            style: { ...el.style, ...this.styleProperties }
          };
        }
        return el;
      }),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    return {
      ...currentState,
      elements: currentState.elements.map(el => {
        if (this.targetElementIds.includes(el.id)) {
          const previousValues = this.previousValues.get(el.id);
          if (previousValues) {
            return {
              ...el,
              style: { ...el.style, ...previousValues }
            };
          }
        }
        return el;
      }),
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  merge(otherCommand: Command): Command | null {
    if (!(otherCommand instanceof SelectiveStyleTransferCommand)) return null;

    // Only merge if operating on the same elements and properties
    if (this.targetElementIds.length !== otherCommand.targetElementIds.length ||
        !this.targetElementIds.every(id => otherCommand.targetElementIds.includes(id)) ||
        this.propertyNames.length !== otherCommand.propertyNames.length ||
        !this.propertyNames.every(prop => otherCommand.propertyNames.includes(prop)) ||
        otherCommand.timestamp - this.timestamp > 2000) {
      return null;
    }

    return new SelectiveStyleTransferCommand(
      this.targetElementIds,
      otherCommand.styleProperties, // Use latest properties
      this.previousValues, // Keep original previous values
      this.propertyNames,
      `${this.description} (merged)`
    );
  }
}

/**
 * Batch command for multiple style operations
 */
export class BatchStyleTransferCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;

  constructor(
    private commands: (StyleTransferCommand | SelectiveStyleTransferCommand)[],
    description?: string
  ) {
    this.description = description || `Batch style transfer (${commands.length} operations)`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    let state = currentState;
    for (const command of this.commands) {
      state = command.execute(state);
    }
    return state;
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    let state = currentState;
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      state = this.commands[i].undo(state);
    }
    return state;
  }
}

/**
 * Utility functions for creating style transfer commands
 */
export class StyleTransferCommandFactory {
  /**
   * Create a style transfer command for applying a complete style
   */
  static createStyleTransfer(
    targetElementIds: string[],
    newStyle: ElementStyle,
    currentElements: { id: string; style: ElementStyle }[],
    transferType: 'copy' | 'paste' | 'pipette' | 'format-painter' = 'paste'
  ): StyleTransferCommand {
    const previousStyles = new Map<string, ElementStyle>();

    targetElementIds.forEach(id => {
      const element = currentElements.find(el => el.id === id);
      if (element) {
        previousStyles.set(id, { ...element.style });
      }
    });

    return new StyleTransferCommand(targetElementIds, newStyle, previousStyles, transferType);
  }

  /**
   * Create a selective style transfer command for specific properties
   */
  static createSelectiveStyleTransfer(
    targetElementIds: string[],
    styleProperties: Partial<ElementStyle>,
    propertyNames: string[],
    currentElements: { id: string; style: ElementStyle }[]
  ): SelectiveStyleTransferCommand {
    const previousValues = new Map<string, Partial<ElementStyle>>();

    targetElementIds.forEach(id => {
      const element = currentElements.find(el => el.id === id);
      if (element) {
        const previous: Partial<ElementStyle> = {};
        propertyNames.forEach(prop => {
          if (prop in element.style) {
            (previous as any)[prop] = (element.style as any)[prop];
          }
        });
        previousValues.set(id, previous);
      }
    });

    return new SelectiveStyleTransferCommand(
      targetElementIds,
      styleProperties,
      previousValues,
      propertyNames
    );
  }

  /**
   * Create a batch command for multiple style operations
   */
  static createBatch(
    commands: (StyleTransferCommand | SelectiveStyleTransferCommand)[],
    description?: string
  ): BatchStyleTransferCommand {
    return new BatchStyleTransferCommand(commands, description);
  }
}

export {
  StyleTransferCommand as default,
  type Command
};