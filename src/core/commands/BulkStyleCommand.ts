// BulkStyleCommand - Efficient bulk styling operations for multiple elements
// Supports selective property updates and smart merging

import type { Command } from './Command';
import type { DiagramSchema, DiagramElement, ElementStyle } from '../../types/diagram';

export interface BulkStyleUpdate {
  elementIds: string[];
  styleUpdates: Partial<ElementStyle>;
  selectedProperties?: string[]; // Only apply these properties if specified
  mode?: 'replace' | 'relative' | 'increment'; // How to apply the changes
}

export interface RelativeStyleAdjustment {
  property: keyof ElementStyle;
  operation: 'add' | 'multiply' | 'set';
  value: number | string;
}

/**
 * Command for applying style changes to multiple elements at once
 * Supports selective property updates and relative adjustments
 */
export class BulkStyleCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  private previousValues: Map<string, Partial<ElementStyle>> = new Map();

  constructor(
    private bulkUpdate: BulkStyleUpdate,
    description?: string
  ) {
    this.description = description || `Update ${bulkUpdate.elementIds.length} element(s)`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    // Store previous values for undo
    this.previousValues.clear();

    const updatedElements = currentState.elements.map(element => {
      if (!this.bulkUpdate.elementIds.includes(element.id)) {
        return element;
      }

      // Store original values for undo
      const originalValues: Partial<ElementStyle> = {};
      const styleKeys = this.bulkUpdate.selectedProperties || Object.keys(this.bulkUpdate.styleUpdates);

      styleKeys.forEach(key => {
        if (key in element.style) {
          originalValues[key as keyof ElementStyle] = element.style[key as keyof ElementStyle];
        }
      });
      this.previousValues.set(element.id, originalValues);

      // Apply style updates based on mode
      let newStyle = { ...element.style };

      if (this.bulkUpdate.mode === 'relative' || this.bulkUpdate.mode === 'increment') {
        // Apply relative changes
        newStyle = this.applyRelativeChanges(newStyle, this.bulkUpdate.styleUpdates);
      } else {
        // Default replace mode - apply selected properties only
        const filteredUpdates: Partial<ElementStyle> = {};
        const propertiesToUpdate = this.bulkUpdate.selectedProperties || Object.keys(this.bulkUpdate.styleUpdates);

        propertiesToUpdate.forEach(prop => {
          if (prop in this.bulkUpdate.styleUpdates) {
            filteredUpdates[prop as keyof ElementStyle] = this.bulkUpdate.styleUpdates[prop as keyof ElementStyle];
          }
        });

        newStyle = { ...newStyle, ...filteredUpdates };
      }

      return {
        ...element,
        style: newStyle,
      };
    });

    return {
      ...currentState,
      elements: updatedElements,
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    const revertedElements = currentState.elements.map(element => {
      const previousStyle = this.previousValues.get(element.id);
      if (!previousStyle) {
        return element;
      }

      return {
        ...element,
        style: { ...element.style, ...previousStyle },
      };
    });

    return {
      ...currentState,
      elements: revertedElements,
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  private applyRelativeChanges(currentStyle: ElementStyle, updates: Partial<ElementStyle>): ElementStyle {
    const newStyle = { ...currentStyle };

    Object.entries(updates).forEach(([key, value]) => {
      const styleKey = key as keyof ElementStyle;
      const currentValue = currentStyle[styleKey];

      if (typeof value === 'number' && typeof currentValue === 'number') {
        // Numeric relative adjustments
        if (this.bulkUpdate.mode === 'increment') {
          newStyle[styleKey] = (currentValue + value) as any;
        } else {
          // Multiply for relative scaling
          newStyle[styleKey] = (currentValue * value) as any;
        }
      } else {
        // Non-numeric values are replaced
        newStyle[styleKey] = value as any;
      }
    });

    return newStyle;
  }

  /**
   * Merge with other BulkStyleCommands on the same elements
   */
  merge(otherCommand: Command): Command | null {
    if (otherCommand instanceof BulkStyleCommand &&
        this.timestamp - otherCommand.timestamp < 1000 && // 1 second window
        this.areElementSetsEqual(this.bulkUpdate.elementIds, otherCommand.bulkUpdate.elementIds)) {

      // Merge style updates
      const mergedStyleUpdates = {
        ...this.bulkUpdate.styleUpdates,
        ...otherCommand.bulkUpdate.styleUpdates,
      };

      // Merge selected properties
      const mergedSelectedProperties = this.bulkUpdate.selectedProperties && otherCommand.bulkUpdate.selectedProperties
        ? [...new Set([...this.bulkUpdate.selectedProperties, ...otherCommand.bulkUpdate.selectedProperties])]
        : undefined;

      return new BulkStyleCommand({
        elementIds: this.bulkUpdate.elementIds,
        styleUpdates: mergedStyleUpdates,
        selectedProperties: mergedSelectedProperties,
        mode: otherCommand.bulkUpdate.mode || this.bulkUpdate.mode,
      }, this.description);
    }

    return null;
  }

  private areElementSetsEqual(set1: string[], set2: string[]): boolean {
    if (set1.length !== set2.length) return false;
    const sorted1 = [...set1].sort();
    const sorted2 = [...set2].sort();
    return sorted1.every((id, index) => id === sorted2[index]);
  }
}

/**
 * Alignment operations for multiple elements
 */
export interface AlignmentOperation {
  type: 'align-left' | 'align-center' | 'align-right' | 'align-top' | 'align-middle' | 'align-bottom';
  elementIds: string[];
}

export class AlignElementsCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  private previousPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(
    private operation: AlignmentOperation,
    description?: string
  ) {
    this.description = description || `Align ${operation.elementIds.length} element(s)`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    const elementsToAlign = currentState.elements.filter(el =>
      this.operation.elementIds.includes(el.id)
    );

    if (elementsToAlign.length < 2) return currentState;

    // Store original positions for undo
    this.previousPositions.clear();
    elementsToAlign.forEach(el => {
      this.previousPositions.set(el.id, { x: el.position.x, y: el.position.y });
    });

    // Calculate alignment reference
    const bounds = this.calculateBounds(elementsToAlign);

    const updatedElements = currentState.elements.map(element => {
      if (!this.operation.elementIds.includes(element.id)) {
        return element;
      }

      const newPosition = this.calculateAlignedPosition(element, bounds);
      return {
        ...element,
        position: newPosition,
      };
    });

    return {
      ...currentState,
      elements: updatedElements,
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    const revertedElements = currentState.elements.map(element => {
      const previousPosition = this.previousPositions.get(element.id);
      if (!previousPosition) {
        return element;
      }

      return {
        ...element,
        position: previousPosition,
      };
    });

    return {
      ...currentState,
      elements: revertedElements,
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  private calculateBounds(elements: DiagramElement[]) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach(el => {
      minX = Math.min(minX, el.position.x);
      minY = Math.min(minY, el.position.y);
      maxX = Math.max(maxX, el.position.x + el.size.width);
      maxY = Math.max(maxY, el.position.y + el.size.height);
    });

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }

  private calculateAlignedPosition(element: DiagramElement, bounds: any): { x: number; y: number } {
    let x = element.position.x;
    let y = element.position.y;

    switch (this.operation.type) {
      case 'align-left':
        x = bounds.left;
        break;
      case 'align-center':
        x = bounds.centerX - element.size.width / 2;
        break;
      case 'align-right':
        x = bounds.right - element.size.width;
        break;
      case 'align-top':
        y = bounds.top;
        break;
      case 'align-middle':
        y = bounds.centerY - element.size.height / 2;
        break;
      case 'align-bottom':
        y = bounds.bottom - element.size.height;
        break;
    }

    return { x, y };
  }
}

/**
 * Distribution operations for spacing elements evenly
 */
export interface DistributionOperation {
  type: 'distribute-horizontal' | 'distribute-vertical';
  elementIds: string[];
  spacing?: number; // Optional fixed spacing, otherwise distribute evenly
}

export class DistributeElementsCommand implements Command {
  public readonly description: string;
  public readonly timestamp: number;
  private previousPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(
    private operation: DistributionOperation,
    description?: string
  ) {
    this.description = description || `Distribute ${operation.elementIds.length} element(s)`;
    this.timestamp = Date.now();
  }

  execute(currentState: DiagramSchema): DiagramSchema {
    const elementsToDistribute = currentState.elements.filter(el =>
      this.operation.elementIds.includes(el.id)
    );

    if (elementsToDistribute.length < 3) return currentState;

    // Store original positions
    this.previousPositions.clear();
    elementsToDistribute.forEach(el => {
      this.previousPositions.set(el.id, { x: el.position.x, y: el.position.y });
    });

    // Sort elements by position
    const sortedElements = [...elementsToDistribute].sort((a, b) => {
      return this.operation.type === 'distribute-horizontal'
        ? a.position.x - b.position.x
        : a.position.y - b.position.y;
    });

    const first = sortedElements[0];
    const last = sortedElements[sortedElements.length - 1];

    const totalDistance = this.operation.type === 'distribute-horizontal'
      ? (last.position.x + last.size.width) - first.position.x
      : (last.position.y + last.size.height) - first.position.y;

    const spacing = totalDistance / (sortedElements.length - 1);

    const updatedElements = currentState.elements.map(element => {
      const sortedIndex = sortedElements.findIndex(el => el.id === element.id);
      if (sortedIndex === -1) {
        return element;
      }

      const newPosition = { ...element.position };

      if (sortedIndex > 0 && sortedIndex < sortedElements.length - 1) {
        if (this.operation.type === 'distribute-horizontal') {
          newPosition.x = first.position.x + (spacing * sortedIndex);
        } else {
          newPosition.y = first.position.y + (spacing * sortedIndex);
        }
      }

      return {
        ...element,
        position: newPosition,
      };
    });

    return {
      ...currentState,
      elements: updatedElements,
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }

  undo(currentState: DiagramSchema): DiagramSchema {
    const revertedElements = currentState.elements.map(element => {
      const previousPosition = this.previousPositions.get(element.id);
      if (!previousPosition) {
        return element;
      }

      return {
        ...element,
        position: previousPosition,
      };
    });

    return {
      ...currentState,
      elements: revertedElements,
      metadata: {
        ...currentState.metadata,
        modified: new Date().toISOString(),
      },
    };
  }
}