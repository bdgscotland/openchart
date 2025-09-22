import type { DiagramSchema, DiagramElement } from '../types/diagram';
import { DEFAULT_CANVAS_CONFIG } from '../types/diagram';

/**
 * Factory functions for creating diagram objects
 */

/**
 * Create an empty diagram with default settings
 */
export function createEmptyDiagram(title: string = 'Untitled Diagram'): DiagramSchema {
  const now = new Date().toISOString();

  return {
    version: '1.0.0',
    type: 'diagram',
    metadata: {
      id: generateId(),
      created: now,
      modified: now,
      title,
      description: '',
      author: ''
    },
    canvas: { ...DEFAULT_CANVAS_CONFIG },
    elements: [],
    connections: []
  };
}

/**
 * Generate a unique ID for diagram elements
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new diagram element with default properties
 */
export function createElement(
  type: DiagramElement['type'],
  position: { x: number; y: number },
  size: { width: number; height: number }
): DiagramElement {
  const baseElement = {
    id: generateId(),
    position,
    size,
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      textAlign: 'center' as const,
    },
    text: '',
    locked: false,
    visible: true,
    zIndex: 0
  };

  return {
    ...baseElement,
    type
  } as DiagramElement;
}