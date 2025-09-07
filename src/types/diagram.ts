// OpenChart Diagram Schema Types

export interface DiagramMetadata {
  id: string;
  created: string; // ISO-8601 timestamp
  modified: string; // ISO-8601 timestamp
  title?: string;
  description?: string;
  author?: string;
}

export interface CanvasConfig {
  width: number;
  height: number;
  grid: boolean;
  gridSize?: number;
  backgroundColor?: string;
  zoom?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  cornerRadius?: number;
}

export interface ElementBase {
  id: string;
  position: Point;
  size: Size;
  style: ElementStyle;
  text?: string;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  properties?: Record<string, any>; // Extensible properties
}

export interface RectangleElement extends ElementBase {
  type: 'rectangle';
}

export interface CircleElement extends ElementBase {
  type: 'circle';
}

export interface DiamondElement extends ElementBase {
  type: 'diamond';
}

export interface ArrowElement extends ElementBase {
  type: 'arrow';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface TextElement extends ElementBase {
  type: 'text';
}

export type DiagramElement = 
  | RectangleElement 
  | CircleElement 
  | DiamondElement 
  | ArrowElement 
  | TextElement;

export interface ConnectionPoint {
  elementId: string;
  anchor: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: Point; // Optional offset from anchor
}

export interface Connection {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
  type: 'straight' | 'curved' | 'stepped';
  style: {
    stroke?: string;
    strokeWidth?: number;
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    arrowStart?: boolean;
    arrowEnd?: boolean;
  };
  waypoints?: Point[]; // Custom routing points
  label?: string;
  labelPosition?: 'start' | 'middle' | 'end';
}

export interface DiagramSchema {
  version: string;
  type: 'diagram';
  metadata: DiagramMetadata;
  canvas: CanvasConfig;
  elements: DiagramElement[];
  connections: Connection[];
}

// Default values and factory functions
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 1920,
  height: 1080,
  grid: true,
  gridSize: 20,
  backgroundColor: '#ffffff',
  zoom: 1.0,
};

export const DEFAULT_ELEMENT_STYLE: ElementStyle = {
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
};

export const DEFAULT_CONNECTION_STYLE = {
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid' as const,
  arrowStart: false,
  arrowEnd: true,
};