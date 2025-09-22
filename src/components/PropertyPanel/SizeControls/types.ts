/**
 * TypeScript interfaces for size control components
 */

export type SizeUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh';

export interface Dimensions {
  width: number;
  height: number;
  unit: SizeUnit;
}

export interface Position {
  x: number;
  y: number;
}

export interface SizeControlsProps {
  dimensions: Dimensions;
  position: Position;
  aspectRatioLocked: boolean;
  isMultiSelection: boolean;
  selectedNodeIds: string[];
  onDimensionsChange: (dimensions: Dimensions) => void;
  onPositionChange: (position: Position) => void;
  onAspectRatioToggle: (locked: boolean) => void;
}

export interface DimensionInputProps {
  label: string;
  value: number;
  unit: SizeUnit;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number, unit: SizeUnit) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export interface PositionControlsProps {
  position: Position;
  isMultiSelection: boolean;
  onPositionChange: (position: Position) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export interface ResizeHandle {
  direction: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
  cursor: string;
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export interface DragHandleProps {
  nodeId: string;
  isSelected: boolean;
  onResize: (nodeId: string, newDimensions: Dimensions) => void;
  children: React.ReactNode;
}