// Enhanced Edge Types for OpenChart Connection Tools

export type EdgeType =
  | 'default'
  | 'straight'
  | 'smoothstep'
  | 'bezier'
  | 'custom-dashed'
  | 'custom-dotted'
  | 'custom-curved'
  | 'custom-arrow';

export type ArrowType =
  | 'none'
  | 'arrow'
  | 'arrowclosed'
  | 'circle'
  | 'diamond'
  | 'triangle';

export type LineStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'dashdot'
  | 'longdash';

export type CurveStyle =
  | 'bezier'
  | 'straight'
  | 'smoothstep'
  | 'step';

export interface EdgeStyleConfig {
  strokeWidth: number;
  strokeColor: string;
  lineStyle: LineStyle;
  curveStyle: CurveStyle;
  markerStart?: ArrowType;
  markerEnd?: ArrowType;
  animated?: boolean;
  opacity?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // Label properties
  label?: string;
  labelStyle?: EdgeLabelStyle;
  labelPosition?: 'start' | 'middle' | 'end';
  labelOffset?: { x: number; y: number };
  labelVisible?: boolean;
}

// Edge label styling
export interface EdgeLabelStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  border?: string;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
}

// Default edge label style
export const DEFAULT_EDGE_LABEL_STYLE: EdgeLabelStyle = {
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  color: '#000000',
  backgroundColor: '#ffffff',
  padding: 4,
  borderRadius: 3,
  border: '1px solid #e0e0e0',
  maxWidth: 200,
  textAlign: 'center',
};

export interface ConnectionToolConfig {
  id: string;
  name: string;
  description: string;
  edgeType: EdgeType;
  style: EdgeStyleConfig;
  icon: string; // Icon identifier or SVG path
}

// Predefined connection tool configurations
export const CONNECTION_TOOLS: ConnectionToolConfig[] = [
  {
    id: 'straight-solid',
    name: 'Straight Line',
    description: 'Simple straight connection',
    edgeType: 'straight',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'solid',
      curveStyle: 'straight',
      markerEnd: 'arrow',
      opacity: 1
    },
    icon: 'arrow-right'
  },
  {
    id: 'curved-smooth',
    name: 'Curved Connection',
    description: 'Smooth curved connection',
    edgeType: 'bezier',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'solid',
      curveStyle: 'bezier',
      markerEnd: 'arrow',
      opacity: 1
    },
    icon: 'git-branch'
  },
  {
    id: 'dashed-line',
    name: 'Dashed Line',
    description: 'Dashed connection line',
    edgeType: 'custom-dashed',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'dashed',
      curveStyle: 'straight',
      markerEnd: 'arrow',
      opacity: 1
    },
    icon: 'minus'
  },
  {
    id: 'dotted-line',
    name: 'Dotted Line',
    description: 'Dotted connection line',
    edgeType: 'custom-dotted',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'dotted',
      curveStyle: 'straight',
      markerEnd: 'arrow',
      opacity: 1
    },
    icon: 'more-horizontal'
  },
  {
    id: 'step-connection',
    name: 'Step Connection',
    description: 'Right-angle step connection',
    edgeType: 'smoothstep',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'solid',
      curveStyle: 'smoothstep',
      markerEnd: 'arrow',
      opacity: 1
    },
    icon: 'workflow'
  },
  {
    id: 'thick-arrow',
    name: 'Thick Arrow',
    description: 'Bold connection with thick arrow',
    edgeType: 'straight',
    style: {
      strokeWidth: 4,
      strokeColor: '#000000',
      lineStyle: 'solid',
      curveStyle: 'straight',
      markerEnd: 'arrowclosed',
      opacity: 1
    },
    icon: 'move-right'
  },
  {
    id: 'double-arrow',
    name: 'Double Arrow',
    description: 'Bidirectional connection',
    edgeType: 'straight',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'solid',
      curveStyle: 'straight',
      markerStart: 'arrow',
      markerEnd: 'arrow',
      opacity: 1
    },
    icon: 'arrow-left-right'
  },
  {
    id: 'association',
    name: 'Association',
    description: 'Simple association line without arrows',
    edgeType: 'straight',
    style: {
      strokeWidth: 2,
      strokeColor: '#000000',
      lineStyle: 'solid',
      curveStyle: 'straight',
      markerEnd: 'none',
      opacity: 1
    },
    icon: 'link'
  }
];

// Default edge styles
export const DEFAULT_EDGE_STYLE: EdgeStyleConfig = {
  strokeWidth: 2,
  strokeColor: '#000000',
  lineStyle: 'solid',
  curveStyle: 'straight',
  markerEnd: 'arrow',
  opacity: 1
};

// Edge style presets for quick selection
export const EDGE_STYLE_PRESETS = {
  default: DEFAULT_EDGE_STYLE,
  thin: { ...DEFAULT_EDGE_STYLE, strokeWidth: 1 },
  thick: { ...DEFAULT_EDGE_STYLE, strokeWidth: 4 },
  dashed: { ...DEFAULT_EDGE_STYLE, lineStyle: 'dashed' as LineStyle },
  dotted: { ...DEFAULT_EDGE_STYLE, lineStyle: 'dotted' as LineStyle },
  curved: { ...DEFAULT_EDGE_STYLE, curveStyle: 'bezier' as CurveStyle },
  step: { ...DEFAULT_EDGE_STYLE, curveStyle: 'smoothstep' as CurveStyle },
  noArrow: { ...DEFAULT_EDGE_STYLE, markerEnd: 'none' as ArrowType },
  doubleArrow: { ...DEFAULT_EDGE_STYLE, markerStart: 'arrow' as ArrowType, markerEnd: 'arrow' as ArrowType }
};

// Color presets for edges
export const EDGE_COLOR_PRESETS = [
  '#000000', // Black
  '#dc2626', // Red
  '#16a34a', // Green
  '#2563eb', // Blue
  '#ca8a04', // Yellow
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#374151'  // Gray
];