import type { Node, Edge, Viewport } from '@xyflow/react';
import type { Layer } from './layers';

/**
 * Current schema version
 */
export const CURRENT_SCHEMA_VERSION = '2.0.0' as const;

/**
 * Base diagram structure
 */
export interface DiagramData {
  version: typeof CURRENT_SCHEMA_VERSION;
  timestamp: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  metadata?: DiagramMetadata;
  propertyPanelData?: PropertyPanelData;
  layers?: Layer[];
  activeLayerId?: string;
  diagramSettings?: any; // DiagramSettings from diagram.ts
}

/**
 * Metadata for diagrams (optional)
 */
export interface DiagramMetadata {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  thumbnail?: string; // base64 or URL
  lastModified?: string;
  createdWith?: string; // app version
}

/**
 * Property panel data structure
 */
export interface PropertyPanelData {
  // Style Presets
  stylePresets?: StylePreset[];
  collections?: PresetCollection[];
  themes?: StyleTheme[];
  favorites?: string[];
  recentlyUsed?: string[];
  currentTheme?: string;
  presetSettings?: PresetSettings;

  // Color System
  recentColors?: string[];
  customPalettes?: ColorPalette[];

  // Style History & Clipboard
  styleHistory?: StyleHistoryEntry[];
  styleClipboard?: CopiedStyle | null;

  // Advanced Styling
  customTextures?: CustomTexture[];
  customGradients?: CustomGradient[];
  customEffects?: CustomEffect[];

  // Typography
  customFonts?: CustomFont[];
  textPresets?: TextPreset[];

  // User Preferences
  panelSettings?: PanelSettings;
}

/**
 * Style Preset interfaces
 */
export interface StylePreset {
  id: string;
  name: string;
  description?: string;
  category: string;
  style: Record<string, any>;
  preview?: string; // base64 image or CSS
  tags?: string[];
  created: string;
  modified: string;
  isBuiltIn?: boolean;
  author?: string;
}

export interface PresetCollection {
  id: string;
  name: string;
  description?: string;
  presetIds: string[];
  color?: string;
  icon?: string;
  created: string;
  modified?: string;
}

export interface StyleTheme {
  id: string;
  name: string;
  description?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    [key: string]: string;
  };
  variables?: Record<string, string | number>;
  created: string;
  author?: string;
}

export interface PresetSettings {
  autoBackup: boolean;
  maxRecentlyUsed: number;
  defaultCategory: string;
  enablePreview: boolean;
  compactMode: boolean;
}

/**
 * Color system interfaces
 */
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  type: 'custom' | 'material' | 'web' | 'brand';
  created: string;
}

/**
 * Style history and clipboard interfaces
 */
export interface StyleHistoryEntry {
  id: string;
  style: Record<string, any>;
  timestamp: number;
  sourceElementId?: string;
  sourceElementType?: string;
  label?: string;
  preview?: string;
}

export interface CopiedStyle {
  style: Record<string, any>;
  timestamp: number;
  sourceElementId?: string;
  sourceElementType?: string;
  metadata?: {
    nodeType?: string;
    category?: string;
    [key: string]: any;
  };
}

/**
 * Advanced styling interfaces
 */
export interface CustomTexture {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pattern' | 'noise';
  settings?: Record<string, any>;
  created: string;
}

export interface CustomGradient {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  stops: Array<{ offset: number; color: string; opacity?: number }>;
  angle?: number;
  position?: { x: number; y: number };
  created: string;
}

export interface CustomEffect {
  id: string;
  name: string;
  type: 'shadow' | 'glow' | 'blur' | 'filter';
  properties: Record<string, any>;
  cssValue: string;
  created: string;
}

/**
 * Typography interfaces
 */
export interface CustomFont {
  id: string;
  family: string;
  url?: string;
  weights: number[];
  styles: string[];
  source: 'google' | 'local' | 'upload';
  loaded: boolean;
}

export interface TextPreset {
  id: string;
  name: string;
  styles: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: string;
    textDecoration?: string;
    color?: string;
  };
  category: string;
  created: string;
}

/**
 * Panel settings
 */
export interface PanelSettings {
  layout: 'compact' | 'comfortable' | 'spacious';
  activeTab: string;
  collapsedSections: string[];
  pinned: boolean;
  position: 'left' | 'right';
  width: number;
  autoHide: boolean;
}


/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Export/Import options
 */
export interface ExportOptions {
  includePropertyPanelData?: boolean;
  includeMetadata?: boolean;
  minify?: boolean;
  includePreview?: boolean;
}

export interface ImportOptions {
  mergePropertyPanelData?: boolean;
  preserveIds?: boolean;
  skipValidation?: boolean;
  autoMigrate?: boolean;
}

/**
 * Storage keys - centralized to avoid conflicts
 */
export const STORAGE_KEYS = {
  AUTO_SAVE: 'openchart-autosave',
  RECENT_COLORS: 'openchart-recent-colors',
  STYLE_HISTORY: 'openchart-style-history',
  STYLE_CLIPBOARD: 'openchart-style-clipboard',
  PRESET_STORAGE: {
    PRESETS: 'openchart-style-presets',
    COLLECTIONS: 'openchart-preset-collections',
    THEMES: 'openchart-style-themes',
    FAVORITES: 'openchart-preset-favorites',
    RECENTLY_USED: 'openchart-preset-recent',
    CURRENT_THEME: 'openchart-current-theme',
    SETTINGS: 'openchart-preset-settings',
  },
  PANEL_SETTINGS: 'openchart-panel-settings',
  CUSTOM_FONTS: 'openchart-custom-fonts',
  CUSTOM_TEXTURES: 'openchart-custom-textures',
  CUSTOM_GRADIENTS: 'openchart-custom-gradients',
  CUSTOM_EFFECTS: 'openchart-custom-effects',
} as const;

/**
 * Default values for new diagrams
 */
export const DEFAULT_DIAGRAM_DATA: DiagramData = {
  version: CURRENT_SCHEMA_VERSION,
  timestamp: new Date().toISOString(),
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  metadata: {
    createdWith: 'OpenChart',
  },
  propertyPanelData: {},
};