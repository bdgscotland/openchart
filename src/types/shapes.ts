// Shape Library Type Definitions for OpenChart
import type { ComponentType } from 'react';

// Extended drawing tool types including all shape categories
export type DrawingTool =
  // Core tools
  | 'select'
  // Basic Shapes
  | 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'line'
  // Flowchart
  | 'process' | 'decision' | 'start-end' | 'data' | 'document' | 'manual-operation' | 'preparation' | 'internal-storage' | 'display'
  // UML
  | 'class' | 'interface' | 'actor' | 'use-case' | 'component' | 'package' | 'note' | 'lifeline' | 'boundary' | 'control' | 'entity'
  // Arrows & Connectors
  | 'arrow' | 'double-arrow' | 'curved-arrow' | 'block-arrow' | 'circular-arrow' | 'connector' | 'dashed-line'
  // Entity Relation
  | 'er-entity' | 'weak-entity' | 'relationship' | 'weak-relationship' | 'attribute' | 'key-attribute' | 'multi-valued-attribute'
  // General
  | 'cloud' | 'cylinder' | 'cube' | 'cross' | 'plus' | 'minus' | 'callout' | 'banner' | 'shield' | 'text';

// Shape definition interface
export interface ShapeDefinition {
  id: DrawingTool;
  name: string;
  description?: string;
  icon: ComponentType<any>; // Lucide React icon component
  category: string;
  tags: string[]; // For search functionality
  defaultSize?: { width: number; height: number };
  properties?: Record<string, any>;
  isNew?: boolean; // Flag for newly added shapes
}

// Shape category interface
export interface ShapeCategory {
  id: string;
  name: string;
  description?: string;
  icon?: ComponentType<any>;
  shapes: ShapeDefinition[];
  defaultExpanded?: boolean;
  order: number; // For sorting categories
}

// Search result interface
export interface SearchResult {
  shape: ShapeDefinition;
  category: ShapeCategory;
  matchType: 'name' | 'tag' | 'category' | 'description';
}

// Filter options for the shape library
export interface ShapeFilterOptions {
  searchTerm: string;
  categories: string[]; // Filter by specific categories
  tags: string[]; // Filter by specific tags
  showNewOnly?: boolean; // Show only newly added shapes
}

// Shape library state interface
export interface ShapeLibraryState {
  searchTerm: string;
  expandedCategories: Set<string>;
  selectedTool: DrawingTool;
  filteredResults: SearchResult[];
  filter: ShapeFilterOptions;
}

// Preset for commonly used shape combinations
export interface ShapePreset {
  id: string;
  name: string;
  description?: string;
  shapes: DrawingTool[];
  icon?: ComponentType<any>;
}

// Shape library configuration
export interface ShapeLibraryConfig {
  searchPlaceholder?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showPresets?: boolean;
  maxSearchResults?: number;
  defaultExpandedCategories?: string[];
  enableKeyboardNavigation?: boolean;
}