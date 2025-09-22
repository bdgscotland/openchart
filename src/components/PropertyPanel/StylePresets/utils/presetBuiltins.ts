// Built-in presets and themes for the Style Presets system

import type {
  StylePreset,
  StyleTheme,
  PresetCategory,
} from '../../../../types/stylePresets';

// Built-in style presets organized by category
const BUILTIN_PRESETS: StylePreset[] = [
  // Business Presets
  {
    id: 'business-professional',
    name: 'Professional',
    description: 'Clean, professional style for business documents',
    style: {
      fill: '#ffffff',
      stroke: '#1f2937',
      strokeWidth: 2,
      color: '#1f2937',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 4,
    },
    category: 'business',
    tags: ['professional', 'clean', 'minimal'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'business-executive',
    name: 'Executive',
    description: 'Premium style for executive presentations',
    style: {
      fill: '#1e40af',
      stroke: '#1e3a8a',
      strokeWidth: 3,
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 8,
    },
    category: 'business',
    tags: ['executive', 'premium', 'blue'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'business-corporate',
    name: 'Corporate',
    description: 'Standard corporate style with subtle emphasis',
    style: {
      fill: '#f8fafc',
      stroke: '#64748b',
      strokeWidth: 2,
      color: '#334155',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 6,
    },
    category: 'business',
    tags: ['corporate', 'subtle', 'gray'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },

  // Creative Presets
  {
    id: 'creative-vibrant',
    name: 'Vibrant',
    description: 'Bright, energetic colors for creative projects',
    style: {
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 3,
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 12,
    },
    category: 'creative',
    tags: ['vibrant', 'orange', 'energetic'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'creative-artistic',
    name: 'Artistic',
    description: 'Artistic gradient style with soft edges',
    style: {
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2,
      color: '#ffffff',
      fontSize: 15,
      fontFamily: 'Georgia, serif',
      fontWeight: 'normal',
      fontStyle: 'italic',
      textAlign: 'center',
      opacity: 0.9,
      cornerRadius: 16,
    },
    category: 'creative',
    tags: ['artistic', 'purple', 'gradient'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'creative-playful',
    name: 'Playful',
    description: 'Fun, playful style with rounded corners',
    style: {
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 4,
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 20,
    },
    category: 'creative',
    tags: ['playful', 'green', 'rounded'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },

  // Technical Presets
  {
    id: 'technical-documentation',
    name: 'Documentation',
    description: 'Clear, precise style for technical documentation',
    style: {
      fill: '#ffffff',
      stroke: '#374151',
      strokeWidth: 1,
      color: '#111827',
      fontSize: 12,
      fontFamily: 'Monaco, monospace',
      fontWeight: 'normal',
      textAlign: 'left',
      opacity: 1,
      cornerRadius: 2,
    },
    category: 'technical',
    tags: ['documentation', 'precise', 'monospace'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'technical-system',
    name: 'System',
    description: 'Technical system diagram style',
    style: {
      fill: '#1f2937',
      stroke: '#4b5563',
      strokeWidth: 2,
      color: '#f9fafb',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 0,
    },
    category: 'technical',
    tags: ['system', 'dark', 'technical'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },

  // Flowchart Presets
  {
    id: 'flowchart-standard',
    name: 'Standard Flow',
    description: 'Standard flowchart element styling',
    style: {
      fill: '#dbeafe',
      stroke: '#2563eb',
      strokeWidth: 2,
      color: '#1e40af',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 4,
    },
    category: 'flowchart',
    tags: ['flowchart', 'standard', 'blue'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'flowchart-decision',
    name: 'Decision',
    description: 'Decision point styling for flowcharts',
    style: {
      fill: '#fef3c7',
      stroke: '#d97706',
      strokeWidth: 2,
      color: '#92400e',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 0,
    },
    category: 'flowchart',
    tags: ['flowchart', 'decision', 'yellow'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'flowchart-process',
    name: 'Process',
    description: 'Process step styling for flowcharts',
    style: {
      fill: '#dcfce7',
      stroke: '#16a34a',
      strokeWidth: 2,
      color: '#15803d',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 6,
    },
    category: 'flowchart',
    tags: ['flowchart', 'process', 'green'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },

  // Presentation Presets
  {
    id: 'presentation-title',
    name: 'Title Slide',
    description: 'Eye-catching style for presentation titles',
    style: {
      fill: '#1e293b',
      stroke: '#334155',
      strokeWidth: 0,
      color: '#ffffff',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 8,
    },
    category: 'presentation',
    tags: ['presentation', 'title', 'large'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'presentation-highlight',
    name: 'Highlight',
    description: 'Highlighting important points in presentations',
    style: {
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 3,
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 8,
    },
    category: 'presentation',
    tags: ['presentation', 'highlight', 'red'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },

  // Wireframe Presets
  {
    id: 'wireframe-box',
    name: 'Wireframe Box',
    description: 'Basic wireframe element styling',
    style: {
      fill: 'transparent',
      stroke: '#9ca3af',
      strokeWidth: 1,
      color: '#6b7280',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 2,
    },
    category: 'wireframe',
    tags: ['wireframe', 'minimal', 'gray'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'wireframe-button',
    name: 'Wireframe Button',
    description: 'Button element for wireframes',
    style: {
      fill: '#f3f4f6',
      stroke: '#9ca3af',
      strokeWidth: 2,
      color: '#374151',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 4,
    },
    category: 'wireframe',
    tags: ['wireframe', 'button', 'interactive'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },

  // Mind Map Presets
  {
    id: 'mindmap-central',
    name: 'Central Topic',
    description: 'Central topic styling for mind maps',
    style: {
      fill: '#3b82f6',
      stroke: '#2563eb',
      strokeWidth: 3,
      color: '#ffffff',
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 25,
    },
    category: 'mindmap',
    tags: ['mindmap', 'central', 'blue'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
  {
    id: 'mindmap-branch',
    name: 'Branch Topic',
    description: 'Branch topic styling for mind maps',
    style: {
      fill: '#a7f3d0',
      stroke: '#10b981',
      strokeWidth: 2,
      color: '#065f46',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 15,
    },
    category: 'mindmap',
    tags: ['mindmap', 'branch', 'green'],
    thumbnail: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    isCustom: false,
    isShared: false,
  },
];

// Built-in themes
const BUILTIN_THEMES: StyleTheme[] = [
  {
    id: 'theme-default',
    name: 'Default',
    description: 'Default OpenChart theme',
    presets: [],
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    typography: {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Monaco, monospace',
    },
    created: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'theme-business',
    name: 'Business',
    description: 'Professional business theme',
    presets: [],
    colors: {
      primary: '#1e40af',
      secondary: '#475569',
      accent: '#0891b2',
      background: '#f8fafc',
      text: '#1e293b',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    typography: {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Courier New, monospace',
    },
    created: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'theme-creative',
    name: 'Creative',
    description: 'Vibrant creative theme',
    presets: [],
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#fefbff',
      text: '#581c87',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    typography: {
      headingFont: 'Georgia, serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Monaco, monospace',
    },
    created: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'theme-minimal',
    name: 'Minimal',
    description: 'Clean minimal theme',
    presets: [],
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#9ca3af',
      background: '#ffffff',
      text: '#111827',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    typography: {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Monaco, monospace',
    },
    created: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'theme-dark',
    name: 'Dark',
    description: 'Dark mode theme',
    presets: [],
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#fbbf24',
      background: '#111827',
      text: '#f9fafb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    typography: {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Monaco, monospace',
    },
    created: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'theme-high-contrast',
    name: 'High Contrast',
    description: 'High contrast accessibility theme',
    presets: [],
    colors: {
      primary: '#000000',
      secondary: '#4b5563',
      accent: '#1f2937',
      background: '#ffffff',
      text: '#000000',
      success: '#047857',
      warning: '#92400e',
      error: '#991b1b',
    },
    typography: {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Monaco, monospace',
    },
    created: new Date().toISOString(),
    isBuiltIn: true,
  },
];

// Preset categories with sample presets
const CATEGORY_SAMPLES: Record<PresetCategory, StylePreset[]> = {
  business: BUILTIN_PRESETS.filter(p => p.category === 'business'),
  creative: BUILTIN_PRESETS.filter(p => p.category === 'creative'),
  technical: BUILTIN_PRESETS.filter(p => p.category === 'technical'),
  flowchart: BUILTIN_PRESETS.filter(p => p.category === 'flowchart'),
  presentation: BUILTIN_PRESETS.filter(p => p.category === 'presentation'),
  wireframe: BUILTIN_PRESETS.filter(p => p.category === 'wireframe'),
  mindmap: BUILTIN_PRESETS.filter(p => p.category === 'mindmap'),
  infographic: [],
  architecture: [],
  custom: [],
};

// Export functions
export function getBuiltinPresets(): StylePreset[] {
  return [...BUILTIN_PRESETS];
}

export function getBuiltinThemes(): StyleTheme[] {
  return [...BUILTIN_THEMES];
}

export function getPresetsByCategory(category: PresetCategory): StylePreset[] {
  return CATEGORY_SAMPLES[category] || [];
}

export function getBuiltinPresetById(id: string): StylePreset | null {
  return BUILTIN_PRESETS.find(preset => preset.id === id) || null;
}

export function getBuiltinThemeById(id: string): StyleTheme | null {
  return BUILTIN_THEMES.find(theme => theme.id === id) || null;
}

export function isBuiltinPreset(presetId: string): boolean {
  return BUILTIN_PRESETS.some(preset => preset.id === presetId);
}

export function isBuiltinTheme(themeId: string): boolean {
  return BUILTIN_THEMES.some(theme => theme.id === themeId);
}

// Generate additional presets programmatically
export function generateColorVariations(basePreset: StylePreset, colors: string[]): StylePreset[] {
  return colors.map((color, index) => ({
    ...basePreset,
    id: `${basePreset.id}_variation_${index}`,
    name: `${basePreset.name} (${color})`,
    style: {
      ...basePreset.style,
      fill: color,
      stroke: darkenColor(color, 0.2),
    },
    tags: [...basePreset.tags, 'variation'],
  }));
}

// Helper function to darken a color
function darkenColor(color: string, amount: number): string {
  // Simple darkening - in a real implementation, you'd use a color library
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const darkenedR = Math.max(0, Math.round(r * (1 - amount)));
    const darkenedG = Math.max(0, Math.round(g * (1 - amount)));
    const darkenedB = Math.max(0, Math.round(b * (1 - amount)));

    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  }

  return color; // Return original if not hex
}