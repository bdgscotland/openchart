// Style Presets System Type Definitions

import type { ElementStyle } from './diagram';

export interface StylePreset {
  id: string;
  name: string;
  description?: string;
  style: ElementStyle;
  category: PresetCategory;
  tags: string[];
  thumbnail?: string; // Base64 or URL
  created: string; // ISO-8601 timestamp
  modified: string; // ISO-8601 timestamp
  author?: string;
  isCustom: boolean;
  isShared: boolean;
  usageCount?: number;
  rating?: number; // 1-5 stars
}

export type PresetCategory =
  | 'business'
  | 'creative'
  | 'technical'
  | 'flowchart'
  | 'presentation'
  | 'wireframe'
  | 'mindmap'
  | 'infographic'
  | 'architecture'
  | 'custom';

export interface StyleTheme {
  id: string;
  name: string;
  description?: string;
  presets: StylePreset[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
  };
  created: string;
  isBuiltIn: boolean;
}

export interface PresetCollection {
  id: string;
  name: string;
  description?: string;
  presets: StylePreset[];
  theme?: StyleTheme;
  tags: string[];
  created: string;
  modified: string;
  author?: string;
  isPublic: boolean;
  downloadCount?: number;
}

export interface QuickStyle {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  styleUpdates: Partial<ElementStyle>;
  category: 'fill' | 'border' | 'text' | 'effects' | 'layout';
  hotkey?: string;
}

export interface PresetSearchFilters {
  category?: PresetCategory;
  tags?: string[];
  author?: string;
  isCustom?: boolean;
  isShared?: boolean;
  minRating?: number;
  searchTerm?: string;
}

export interface PresetLibraryState {
  presets: StylePreset[];
  themes: StyleTheme[];
  collections: PresetCollection[];
  quickStyles: QuickStyle[];
  favorites: string[]; // preset IDs
  recentlyUsed: string[]; // preset IDs
  searchFilters: PresetSearchFilters;
  currentTheme?: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'created' | 'modified' | 'usage' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface PresetExportFormat {
  version: string;
  type: 'preset' | 'collection' | 'theme';
  data: StylePreset | PresetCollection | StyleTheme;
  metadata: {
    exportedAt: string;
    exportedBy?: string;
    application: string;
    version: string;
  };
}

// Preset application modes
export type PresetApplicationMode =
  | 'replace' // Replace all styles
  | 'merge'   // Merge with existing styles
  | 'overlay' // Apply only non-default values
  | 'smart';  // Intelligent merge based on element type

// Built-in preset categories and their characteristics
export const PRESET_CATEGORIES: Record<PresetCategory, {
  label: string;
  description: string;
  icon: string;
  defaultTags: string[];
}> = {
  business: {
    label: 'Business',
    description: 'Professional styles for business documents and presentations',
    icon: 'briefcase',
    defaultTags: ['professional', 'corporate', 'clean'],
  },
  creative: {
    label: 'Creative',
    description: 'Artistic and expressive styles for creative projects',
    icon: 'palette',
    defaultTags: ['artistic', 'colorful', 'expressive'],
  },
  technical: {
    label: 'Technical',
    description: 'Precise styles for technical documentation and diagrams',
    icon: 'settings',
    defaultTags: ['precise', 'technical', 'documentation'],
  },
  flowchart: {
    label: 'Flowchart',
    description: 'Standard styles for flowcharts and process diagrams',
    icon: 'flow-chart',
    defaultTags: ['process', 'workflow', 'standard'],
  },
  presentation: {
    label: 'Presentation',
    description: 'Eye-catching styles for presentations and slides',
    icon: 'presentation',
    defaultTags: ['presentation', 'slides', 'visual'],
  },
  wireframe: {
    label: 'Wireframe',
    description: 'Minimal styles for wireframes and mockups',
    icon: 'layout',
    defaultTags: ['wireframe', 'minimal', 'prototype'],
  },
  mindmap: {
    label: 'Mind Map',
    description: 'Organic styles for mind maps and brainstorming',
    icon: 'brain',
    defaultTags: ['mindmap', 'brainstorm', 'organic'],
  },
  infographic: {
    label: 'Infographic',
    description: 'Data visualization styles for infographics',
    icon: 'bar-chart',
    defaultTags: ['data', 'visualization', 'infographic'],
  },
  architecture: {
    label: 'Architecture',
    description: 'Technical styles for system architecture diagrams',
    icon: 'network',
    defaultTags: ['architecture', 'system', 'infrastructure'],
  },
  custom: {
    label: 'Custom',
    description: 'User-created custom styles',
    icon: 'user',
    defaultTags: ['custom', 'user-created'],
  },
};

// Default quick styles
export const DEFAULT_QUICK_STYLES: QuickStyle[] = [
  {
    id: 'remove-fill',
    name: 'No Fill',
    icon: 'square-dashed',
    description: 'Remove fill color',
    styleUpdates: { fill: 'transparent' },
    category: 'fill',
    hotkey: 'alt+f',
  },
  {
    id: 'remove-border',
    name: 'No Border',
    icon: 'square',
    description: 'Remove border',
    styleUpdates: { stroke: 'transparent', strokeWidth: 0 },
    category: 'border',
    hotkey: 'alt+b',
  },
  {
    id: 'bold-text',
    name: 'Bold Text',
    icon: 'bold',
    description: 'Make text bold',
    styleUpdates: { fontWeight: 'bold' },
    category: 'text',
    hotkey: 'cmd+b',
  },
  {
    id: 'large-text',
    name: 'Large Text',
    icon: 'type',
    description: 'Increase font size',
    styleUpdates: { fontSize: 18 },
    category: 'text',
    hotkey: 'cmd+shift+=',
  },
  {
    id: 'rounded-corners',
    name: 'Rounded',
    icon: 'square-rounded',
    description: 'Add rounded corners',
    styleUpdates: { cornerRadius: 8 },
    category: 'effects',
    hotkey: 'alt+r',
  },
];

// Validation functions
export const validateStylePreset = (preset: Partial<StylePreset>): string[] => {
  const errors: string[] = [];

  if (!preset.name?.trim()) {
    errors.push('Name is required');
  }

  if (!preset.style) {
    errors.push('Style is required');
  }

  if (!preset.category || !PRESET_CATEGORIES[preset.category]) {
    errors.push('Valid category is required');
  }

  return errors;
};

export const validateStyleTheme = (theme: Partial<StyleTheme>): string[] => {
  const errors: string[] = [];

  if (!theme.name?.trim()) {
    errors.push('Name is required');
  }

  if (!theme.colors) {
    errors.push('Colors configuration is required');
  }

  if (!theme.typography) {
    errors.push('Typography configuration is required');
  }

  return errors;
};