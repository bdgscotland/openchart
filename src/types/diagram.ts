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
  
  // Enhanced grid settings
  gridStyle?: 'dots' | 'lines' | 'crosshatch';
  gridColor?: string;
  gridOpacity?: number;
  snapToGrid?: boolean;
  snapDistance?: number;
  
  // Paper/Page settings
  pageSize?: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Background settings
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  backgroundSize?: 'auto' | 'cover' | 'contain' | 'custom';
  
  // Canvas behavior
  infiniteCanvas?: boolean;
  panEnabled?: boolean;
  zoomEnabled?: boolean;
  minZoom?: number;
  maxZoom?: number;
  
  // Rulers and guides
  showRulers?: boolean;
  rulerUnits?: 'px' | 'cm' | 'in' | 'pt';
  showGuides?: boolean;
  guidesColor?: string;
}

// Additional diagram-level interfaces
export interface GridSettings {
  enabled: boolean;
  size: number;
  style: 'dots' | 'lines' | 'crosshatch';
  color: string;
  opacity: number;
  snapToGrid: boolean;
  snapDistance: number;
}

export interface BackgroundSettings {
  color: string;
  image?: string;
  opacity: number;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  size: 'auto' | 'cover' | 'contain' | 'custom';
}

export interface PaperSettings {
  size: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom';
  orientation: 'portrait' | 'landscape';
  width: number; // in pixels
  height: number; // in pixels
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ViewportSettings {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  panEnabled: boolean;
  zoomEnabled: boolean;
  infiniteCanvas: boolean;
}

export interface RulerSettings {
  enabled: boolean;
  units: 'px' | 'cm' | 'in' | 'pt';
  showGuides: boolean;
  guidesColor: string;
}

// Combined diagram settings interface
export interface DiagramSettings {
  grid: GridSettings;
  background: BackgroundSettings;
  paper: PaperSettings;
  viewport: ViewportSettings;
  rulers: RulerSettings;
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
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through' | 'underline overline';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: number | string;
  letterSpacing?: number | string;
  wordSpacing?: number | string;
  textShadow?: string;
  color?: string; // Text color separate from fill
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
// Enhanced default settings for diagram-level controls
export const DEFAULT_GRID_SETTINGS: GridSettings = {
  enabled: true,
  size: 20,
  style: 'dots',
  color: '#e0e0e0',
  opacity: 0.5,
  snapToGrid: true,
  snapDistance: 10,
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  color: '#ffffff',
  opacity: 1.0,
  repeat: 'no-repeat',
  size: 'auto',
};

export const DEFAULT_PAPER_SETTINGS: PaperSettings = {
  size: 'Custom',
  orientation: 'landscape',
  width: 1920,
  height: 1080,
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
};

export const DEFAULT_VIEWPORT_SETTINGS: ViewportSettings = {
  zoom: 1.0,
  minZoom: 0.1,
  maxZoom: 5.0,
  panEnabled: true,
  zoomEnabled: true,
  infiniteCanvas: true,
};

export const DEFAULT_RULER_SETTINGS: RulerSettings = {
  enabled: false,
  units: 'px',
  showGuides: true,
  guidesColor: '#4a90e2',
};

export const DEFAULT_DIAGRAM_SETTINGS: DiagramSettings = {
  grid: DEFAULT_GRID_SETTINGS,
  background: DEFAULT_BACKGROUND_SETTINGS,
  paper: DEFAULT_PAPER_SETTINGS,
  viewport: DEFAULT_VIEWPORT_SETTINGS,
  rulers: DEFAULT_RULER_SETTINGS,
};

// Paper size presets in pixels (at 96 DPI)
export const PAPER_SIZES = {
  'A4': { width: 794, height: 1123 },
  'A3': { width: 1123, height: 1587 },
  'A5': { width: 559, height: 794 },
  'Letter': { width: 816, height: 1056 },
  'Legal': { width: 816, height: 1344 },
  'Tabloid': { width: 1056, height: 1632 },
} as const;

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
  textDecoration: 'none',
  textTransform: 'none',
  lineHeight: 1.4,
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  color: '#000000',
};

export const DEFAULT_CONNECTION_STYLE = {
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid' as const,
  arrowStart: false,
  arrowEnd: true,
};