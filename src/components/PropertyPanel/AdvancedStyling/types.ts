// Advanced Styling Types for PropertyPanel

export interface GradientStop {
  color: string;
  position: number; // 0-100 percentage
}

export interface LinearGradient {
  type: 'linear';
  direction: number; // degrees (0-360)
  stops: GradientStop[];
}

export interface RadialGradient {
  type: 'radial';
  shape: 'circle' | 'ellipse';
  size: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner';
  position: { x: number; y: number }; // percentages
  stops: GradientStop[];
}

export type Gradient = LinearGradient | RadialGradient;

export interface BoxShadow {
  id: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius: number;
  color: string;
  inset: boolean;
}

export interface BorderStyle {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  color: string;
  radius?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}

export interface StrokeStyle {
  width: number;
  color: string;
  dashArray?: number[];
  dashOffset?: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
  miterLimit?: number;
}

export interface FilterEffect {
  type: 'blur' | 'brightness' | 'contrast' | 'drop-shadow' | 'grayscale' | 'hue-rotate' | 'invert' | 'opacity' | 'saturate' | 'sepia';
  value: number;
  unit?: string;
}

export interface Transform {
  type: 'translate' | 'rotate' | 'scale' | 'skew';
  x?: number;
  y?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface TexturePattern {
  type: 'image' | 'pattern';
  url?: string;
  pattern?: 'dots' | 'stripes' | 'checkerboard' | 'diagonal' | 'grid';
  size: number;
  opacity: number;
  rotation?: number;
}

export interface AdvancedStyle {
  fill?: string | Gradient | TexturePattern;
  stroke?: StrokeStyle;
  border?: BorderStyle;
  shadows?: BoxShadow[];
  filters?: FilterEffect[];
  transforms?: Transform[];
  clipPath?: string;
}

// CSS Generation helpers
export interface CSSOutput {
  properties: Record<string, string>;
  variables?: Record<string, string>;
  keyframes?: Record<string, string>;
}

// Common presets
export const GRADIENT_PRESETS: Gradient[] = [
  {
    type: 'linear',
    direction: 45,
    stops: [
      { color: '#ff6b6b', position: 0 },
      { color: '#4ecdc4', position: 100 }
    ]
  },
  {
    type: 'linear',
    direction: 90,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ]
  },
  {
    type: 'radial',
    shape: 'circle',
    size: 'farthest-corner',
    position: { x: 50, y: 50 },
    stops: [
      { color: '#ff9a9e', position: 0 },
      { color: '#fecfef', position: 50 },
      { color: '#fecfef', position: 100 }
    ]
  }
];

export const SHADOW_PRESETS: BoxShadow[] = [
  {
    id: 'soft',
    offsetX: 0,
    offsetY: 2,
    blurRadius: 8,
    spreadRadius: 0,
    color: 'rgba(0, 0, 0, 0.1)',
    inset: false
  },
  {
    id: 'medium',
    offsetX: 0,
    offsetY: 4,
    blurRadius: 16,
    spreadRadius: 0,
    color: 'rgba(0, 0, 0, 0.15)',
    inset: false
  },
  {
    id: 'strong',
    offsetX: 0,
    offsetY: 8,
    blurRadius: 32,
    spreadRadius: 0,
    color: 'rgba(0, 0, 0, 0.2)',
    inset: false
  }
];

export const STROKE_PATTERNS: { name: string; dashArray: number[] }[] = [
  { name: 'Solid', dashArray: [] },
  { name: 'Dashed', dashArray: [5, 5] },
  { name: 'Dotted', dashArray: [2, 3] },
  { name: 'Dash-Dot', dashArray: [10, 5, 2, 5] },
  { name: 'Long Dash', dashArray: [15, 5] },
  { name: 'Double Dash', dashArray: [10, 5, 5, 5] }
];