import React from 'react';
import type { BaseShapeProps } from './BaseShape';
import RectangleShape from './RectangleShape';
import CircleShape from './CircleShape';
import DiamondShape from './DiamondShape';
import TriangleShape from './TriangleShape';
import EllipseShape from './EllipseShape';
import PolygonShape from './PolygonShape';

export type ShapeType = 
  | 'rectangle' 
  | 'circle' 
  | 'diamond' 
  | 'triangle' 
  | 'ellipse' 
  | 'pentagon' 
  | 'hexagon' 
  | 'star';

export interface ShapeRegistryEntry {
  component: React.ComponentType<BaseShapeProps>;
  defaultProps?: Partial<BaseShapeProps['data']>;
}

// Shape Registry - maps shape types to their components
const SHAPE_REGISTRY: Record<ShapeType, ShapeRegistryEntry> = {
  rectangle: {
    component: RectangleShape,
    defaultProps: {
      width: 120,
      height: 80,
    },
  },
  circle: {
    component: CircleShape,
    defaultProps: {
      width: 100,
      height: 100,
    },
  },
  diamond: {
    component: DiamondShape,
    defaultProps: {
      width: 120,
      height: 120,
    },
  },
  triangle: {
    component: TriangleShape,
    defaultProps: {
      width: 120,
      height: 80,
    },
  },
  ellipse: {
    component: EllipseShape,
    defaultProps: {
      width: 120,
      height: 80,
    },
  },
  pentagon: {
    component: PolygonShape,
    defaultProps: {
      width: 120,
      height: 120,
    },
  },
  hexagon: {
    component: PolygonShape,
    defaultProps: {
      width: 120,
      height: 120,
    },
  },
  star: {
    component: PolygonShape,
    defaultProps: {
      width: 120,
      height: 120,
    },
  },
};

/**
 * Get the React component for a given shape type
 */
export const getShapeComponent = (shapeType: ShapeType): React.ComponentType<BaseShapeProps> => {
  const entry = SHAPE_REGISTRY[shapeType];
  if (!entry) {
    console.warn(`Unknown shape type: ${shapeType}, falling back to rectangle`);
    return SHAPE_REGISTRY.rectangle.component;
  }
  return entry.component;
};

/**
 * Get default props for a given shape type
 */
export const getShapeDefaults = (shapeType: ShapeType): Partial<BaseShapeProps['data']> => {
  const entry = SHAPE_REGISTRY[shapeType];
  return entry?.defaultProps || {};
};

/**
 * Check if a shape type is valid
 */
export const isValidShapeType = (shapeType: string): shapeType is ShapeType => {
  return shapeType in SHAPE_REGISTRY;
};

/**
 * Get all available shape types
 */
export const getAvailableShapeTypes = (): ShapeType[] => {
  return Object.keys(SHAPE_REGISTRY) as ShapeType[];
};

/**
 * Create a React Flow node configuration for a shape
 */
export interface CreateShapeNodeOptions {
  id: string;
  position: { x: number; y: number };
  shapeType: ShapeType;
  label?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  onTextChange?: (text: string) => void;
}

export const createShapeNode = (options: CreateShapeNodeOptions) => {
  const defaults = getShapeDefaults(options.shapeType);
  
  return {
    id: options.id,
    type: 'shape',
    position: options.position,
    draggable: true,
    selectable: true,
    data: {
      shape: options.shapeType,
      label: options.label || options.shapeType.charAt(0).toUpperCase() + options.shapeType.slice(1),
      width: options.width || defaults.width || 120,
      height: options.height || defaults.height || 80,
      backgroundColor: options.backgroundColor || '#f0f9ff',
      onTextChange: options.onTextChange,
      ...defaults,
    },
  };
};

// Export individual components for direct use if needed
export {
  RectangleShape,
  CircleShape,
  DiamondShape,
  TriangleShape,
  EllipseShape,
  PolygonShape,
};

export { default as BaseShape } from './BaseShape';
export type { BaseShapeProps } from './BaseShape';