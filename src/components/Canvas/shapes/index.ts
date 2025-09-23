import React from 'react';
import type { BaseShapeProps } from './BaseShape';
import RectangleShape from './RectangleShape';
import CircleShape from './CircleShape';
import DiamondShape from './DiamondShape';
import TriangleShape from './TriangleShape';
import EllipseShape from './EllipseShape';
import PolygonShape from './PolygonShape';
import { LineShape } from './LineShape';
import { CrossShape } from './CrossShape';
import { ProcessShape } from './ProcessShape';
import { StartEndShape } from './StartEndShape';
import { DocumentShape } from './DocumentShape';
import { DataShape } from './DataShape';
import { GenericShape } from './GenericShape';

export type ShapeType =
  // Basic shapes
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'ellipse'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'line'
  | 'cross'
  | 'parallelogram'
  | 'trapezoid'
  | 'octagon'
  | 'heart'
  // Flowchart shapes
  | 'process'
  | 'decision'
  | 'start-end'
  | 'data'
  | 'document'
  | 'manual-operation'
  | 'preparation'
  | 'internal-storage'
  | 'display'
  | 'delay'
  | 'or-gate'
  | 'storage-cylinder'
  // UML shapes
  | 'class'
  | 'interface'
  | 'actor'
  | 'use-case'
  | 'component'
  | 'package'
  | 'note'
  | 'lifeline'
  // Arrow shapes
  | 'arrow'
  | 'double-arrow'
  | 'curved-arrow'
  | 'block-arrow'
  | 'circular-arrow'
  | 'connector'
  | 'dashed-line'
  | 'callout-arrow'
  | 'u-turn-arrow'
  | 'stepped-arrow'
  // Entity-Relation shapes
  | 'er-entity'
  | 'weak-entity'
  | 'relationship'
  | 'weak-relationship'
  | 'attribute'
  | 'key-attribute'
  | 'multi-valued-attribute'
  | 'identifying-relationship'
  | 'crows-foot'
  // General shapes
  | 'text'
  | 'cloud'
  | 'cylinder'
  | 'shield'
  | 'callout'
  | 'banner'
  | 'warning-triangle'
  | 'speech-bubble';

export interface ShapeRegistryEntry {
  component: React.ComponentType<BaseShapeProps>;
  defaultProps?: Partial<BaseShapeProps['data']>;
}

// Create a wrapper component for GenericShape to pass shapeType
const createGenericShapeComponent = (shapeType: string) => {
  return (props: BaseShapeProps) => React.createElement(GenericShape, { ...props, shapeType });
};

// Shape Registry - maps shape types to their components
const SHAPE_REGISTRY: Record<ShapeType, ShapeRegistryEntry> = {
  // Basic shapes
  rectangle: {
    component: RectangleShape,
    defaultProps: { width: 120, height: 80 },
  },
  circle: {
    component: CircleShape,
    defaultProps: { width: 100, height: 100 },
  },
  diamond: {
    component: DiamondShape,
    defaultProps: { width: 120, height: 120 },
  },
  triangle: {
    component: TriangleShape,
    defaultProps: { width: 120, height: 80 },
  },
  ellipse: {
    component: EllipseShape,
    defaultProps: { width: 120, height: 80 },
  },
  pentagon: {
    component: PolygonShape,
    defaultProps: { width: 120, height: 120 },
  },
  hexagon: {
    component: PolygonShape,
    defaultProps: { width: 120, height: 120 },
  },
  star: {
    component: PolygonShape,
    defaultProps: { width: 120, height: 120 },
  },
  line: {
    component: LineShape,
    defaultProps: { width: 100, height: 2 },
  },
  cross: {
    component: CrossShape,
    defaultProps: { width: 60, height: 60 },
  },
  parallelogram: {
    component: createGenericShapeComponent('parallelogram'),
    defaultProps: { width: 120, height: 60 },
  },
  trapezoid: {
    component: createGenericShapeComponent('trapezoid'),
    defaultProps: { width: 120, height: 60 },
  },
  octagon: {
    component: createGenericShapeComponent('octagon'),
    defaultProps: { width: 80, height: 80 },
  },
  heart: {
    component: createGenericShapeComponent('heart'),
    defaultProps: { width: 80, height: 80 },
  },

  // Flowchart shapes
  process: {
    component: ProcessShape,
    defaultProps: { width: 120, height: 60 },
  },
  decision: {
    component: DiamondShape,
    defaultProps: { width: 100, height: 60 },
  },
  'start-end': {
    component: StartEndShape,
    defaultProps: { width: 100, height: 50 },
  },
  data: {
    component: DataShape,
    defaultProps: { width: 120, height: 60 },
  },
  document: {
    component: DocumentShape,
    defaultProps: { width: 100, height: 80 },
  },
  'manual-operation': {
    component: createGenericShapeComponent('manual-operation'),
    defaultProps: { width: 120, height: 60 },
  },
  preparation: {
    component: createGenericShapeComponent('preparation'),
    defaultProps: { width: 120, height: 60 },
  },
  'internal-storage': {
    component: createGenericShapeComponent('internal-storage'),
    defaultProps: { width: 100, height: 60 },
  },
  display: {
    component: createGenericShapeComponent('display'),
    defaultProps: { width: 100, height: 80 },
  },
  delay: {
    component: createGenericShapeComponent('delay'),
    defaultProps: { width: 100, height: 60 },
  },
  'or-gate': {
    component: createGenericShapeComponent('or-gate'),
    defaultProps: { width: 80, height: 60 },
  },
  'storage-cylinder': {
    component: createGenericShapeComponent('storage-cylinder'),
    defaultProps: { width: 60, height: 100 },
  },

  // UML shapes
  class: {
    component: RectangleShape,
    defaultProps: { width: 120, height: 100 },
  },
  interface: {
    component: RectangleShape,
    defaultProps: { width: 120, height: 80 },
  },
  actor: {
    component: createGenericShapeComponent('actor'),
    defaultProps: { width: 60, height: 80 },
  },
  'use-case': {
    component: EllipseShape,
    defaultProps: { width: 120, height: 60 },
  },
  component: {
    component: RectangleShape,
    defaultProps: { width: 120, height: 80 },
  },
  package: {
    component: RectangleShape,
    defaultProps: { width: 140, height: 100 },
  },
  note: {
    component: createGenericShapeComponent('note'),
    defaultProps: { width: 100, height: 60 },
  },
  lifeline: {
    component: LineShape,
    defaultProps: { width: 20, height: 200 },
  },

  // Arrow shapes
  arrow: {
    component: createGenericShapeComponent('arrow'),
    defaultProps: { width: 80, height: 20 },
  },
  'double-arrow': {
    component: createGenericShapeComponent('double-arrow'),
    defaultProps: { width: 80, height: 20 },
  },
  'curved-arrow': {
    component: createGenericShapeComponent('curved-arrow'),
    defaultProps: { width: 80, height: 60 },
  },
  'block-arrow': {
    component: createGenericShapeComponent('block-arrow'),
    defaultProps: { width: 100, height: 40 },
  },
  'circular-arrow': {
    component: createGenericShapeComponent('circular-arrow'),
    defaultProps: { width: 60, height: 60 },
  },
  connector: {
    component: LineShape,
    defaultProps: { width: 100, height: 2 },
  },
  'dashed-line': {
    component: LineShape,
    defaultProps: { width: 100, height: 2 },
  },
  'callout-arrow': {
    component: createGenericShapeComponent('callout-arrow'),
    defaultProps: { width: 120, height: 80 },
  },
  'u-turn-arrow': {
    component: createGenericShapeComponent('u-turn-arrow'),
    defaultProps: { width: 80, height: 60 },
  },
  'stepped-arrow': {
    component: createGenericShapeComponent('stepped-arrow'),
    defaultProps: { width: 100, height: 60 },
  },

  // Entity-Relation shapes
  'er-entity': {
    component: RectangleShape,
    defaultProps: { width: 120, height: 80 },
  },
  'weak-entity': {
    component: RectangleShape,
    defaultProps: { width: 120, height: 80 },
  },
  relationship: {
    component: DiamondShape,
    defaultProps: { width: 100, height: 60 },
  },
  'weak-relationship': {
    component: DiamondShape,
    defaultProps: { width: 100, height: 60 },
  },
  attribute: {
    component: EllipseShape,
    defaultProps: { width: 80, height: 40 },
  },
  'key-attribute': {
    component: EllipseShape,
    defaultProps: { width: 80, height: 40 },
  },
  'multi-valued-attribute': {
    component: EllipseShape,
    defaultProps: { width: 80, height: 40 },
  },
  'identifying-relationship': {
    component: createGenericShapeComponent('identifying-relationship'),
    defaultProps: { width: 100, height: 60 },
  },
  'crows-foot': {
    component: createGenericShapeComponent('crows-foot'),
    defaultProps: { width: 40, height: 20 },
  },

  // General shapes
  text: {
    component: createGenericShapeComponent('text'),
    defaultProps: { width: 100, height: 30 },
  },
  cloud: {
    component: createGenericShapeComponent('cloud'),
    defaultProps: { width: 120, height: 80 },
  },
  cylinder: {
    component: createGenericShapeComponent('cylinder'),
    defaultProps: { width: 60, height: 100 },
  },
  shield: {
    component: createGenericShapeComponent('shield'),
    defaultProps: { width: 60, height: 80 },
  },
  callout: {
    component: createGenericShapeComponent('callout'),
    defaultProps: { width: 120, height: 80 },
  },
  banner: {
    component: createGenericShapeComponent('banner'),
    defaultProps: { width: 140, height: 40 },
  },
  'warning-triangle': {
    component: createGenericShapeComponent('warning-triangle'),
    defaultProps: { width: 80, height: 80 },
  },
  'speech-bubble': {
    component: createGenericShapeComponent('speech-bubble'),
    defaultProps: { width: 120, height: 80 },
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
  LineShape,
  CrossShape,
  ProcessShape,
  StartEndShape,
  DocumentShape,
  DataShape,
  GenericShape,
};

export { default as BaseShape } from './BaseShape';
export type { BaseShapeProps } from './BaseShape';