import { useState, useCallback, useMemo } from 'react';
import { useStylePresets } from './useStylePresets';
import type {
  StyleTheme,
  StylePreset,
  PresetCategory,
} from '../../../../types/stylePresets';
import type { ElementStyle } from '../../../../types/diagram';

interface UseThemeManagerReturn {
  // Theme data
  themes: StyleTheme[];
  currentTheme?: StyleTheme;

  // Theme operations
  createTheme: (theme: Omit<StyleTheme, 'id' | 'created'>) => Promise<StyleTheme>;
  updateTheme: (themeId: string, updates: Partial<StyleTheme>) => Promise<StyleTheme>;
  deleteTheme: (themeId: string) => Promise<void>;
  duplicateTheme: (themeId: string, newName?: string) => Promise<StyleTheme>;

  // Theme application
  applyTheme: (theme: StyleTheme, elementIds?: string[]) => void;
  getThemeColors: (themeId: string) => StyleTheme['colors'] | null;
  generatePresetFromTheme: (theme: StyleTheme, presetName: string) => StylePreset;

  // Theme creation helpers
  createThemeFromCurrent: (name: string, description?: string, baseTheme?: StyleTheme) => Promise<Omit<StyleTheme, 'id' | 'created'>>;
  extractColorsFromPresets: (presets: StylePreset[]) => StyleTheme['colors'];

  // Theme analysis
  analyzeThemeUsage: (themeId: string) => {
    usageCount: number;
    lastUsed?: string;
    popularColors: Array<{ color: string; usage: number }>;
  };

  // Color utilities
  generateColorPalette: (primaryColor: string) => StyleTheme['colors'];
  validateThemeColors: (colors: StyleTheme['colors']) => string[];
}

export const useThemeManager = (): UseThemeManagerReturn => {
  const {
    themes,
    currentTheme: currentThemeId,
    setCurrentTheme,
    presets,
  } = useStylePresets();

  // Get current theme object
  const currentTheme = useMemo(() => {
    return themes.find(theme => theme.id === currentThemeId);
  }, [themes, currentThemeId]);

  // Create new theme
  const createTheme = useCallback(async (
    themeData: Omit<StyleTheme, 'id' | 'created'>
  ): Promise<StyleTheme> => {
    const theme: StyleTheme = {
      ...themeData,
      id: `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString(),
    };

    // In a real implementation, this would be saved to storage
    // For now, we'll just return the theme object
    return theme;
  }, []);

  // Update theme
  const updateTheme = useCallback(async (
    themeId: string,
    updates: Partial<StyleTheme>
  ): Promise<StyleTheme> => {
    const existingTheme = themes.find(t => t.id === themeId);

    if (!existingTheme) {
      throw new Error('Theme not found');
    }

    if (existingTheme.isBuiltIn) {
      throw new Error('Cannot modify built-in themes');
    }

    const updatedTheme: StyleTheme = {
      ...existingTheme,
      ...updates,
    };

    // In a real implementation, this would update storage
    return updatedTheme;
  }, [themes]);

  // Delete theme
  const deleteTheme = useCallback(async (themeId: string): Promise<void> => {
    const existingTheme = themes.find(t => t.id === themeId);

    if (!existingTheme) {
      throw new Error('Theme not found');
    }

    if (existingTheme.isBuiltIn) {
      throw new Error('Cannot delete built-in themes');
    }

    // In a real implementation, this would remove from storage
  }, [themes]);

  // Duplicate theme
  const duplicateTheme = useCallback(async (
    themeId: string,
    newName?: string
  ): Promise<StyleTheme> => {
    const originalTheme = themes.find(t => t.id === themeId);

    if (!originalTheme) {
      throw new Error('Theme not found');
    }

    // Generate unique name if not provided
    if (!newName) {
      let baseName = `${originalTheme.name} (Copy)`;
      let counter = 1;

      while (themes.some(t => t.name === baseName)) {
        baseName = `${originalTheme.name} (Copy ${counter})`;
        counter++;
      }

      newName = baseName;
    }

    return createTheme({
      ...originalTheme,
      name: newName,
      isBuiltIn: false,
    });
  }, [themes, createTheme]);

  // Apply theme to elements
  const applyTheme = useCallback((
    theme: StyleTheme,
    elementIds?: string[]
  ) => {
    // This would integrate with the diagram state management
    // to apply theme colors to selected or all elements
    console.log('Applying theme:', theme.name, 'to elements:', elementIds);

    // Set as current theme
    setCurrentTheme(theme.id);
  }, [setCurrentTheme]);

  // Get theme colors
  const getThemeColors = useCallback((themeId: string): StyleTheme['colors'] | null => {
    const theme = themes.find(t => t.id === themeId);
    return theme?.colors || null;
  }, [themes]);

  // Generate preset from theme
  const generatePresetFromTheme = useCallback((
    theme: StyleTheme,
    presetName: string
  ): StylePreset => {
    const now = new Date().toISOString();

    return {
      id: `preset_from_theme_${Date.now()}`,
      name: presetName,
      description: `Generated from ${theme.name} theme`,
      style: {
        fill: theme.colors.primary,
        stroke: theme.colors.secondary,
        strokeWidth: 2,
        color: theme.colors.text,
        fontFamily: theme.typography.bodyFont,
        fontSize: 14,
        opacity: 1,
      },
      category: 'custom',
      tags: ['theme-generated', theme.name.toLowerCase()],
      created: now,
      modified: now,
      isCustom: true,
      isShared: false,
    };
  }, []);

  // Create theme from current context
  const createThemeFromCurrent = useCallback(async (
    name: string,
    description?: string,
    baseTheme?: StyleTheme
  ): Promise<Omit<StyleTheme, 'id' | 'created'>> => {
    // Extract colors from current selection or base theme
    let colors: StyleTheme['colors'];

    if (baseTheme) {
      colors = { ...baseTheme.colors };
    } else {
      // Extract from current presets or generate default palette
      colors = extractColorsFromPresets(presets.slice(0, 10));
    }

    const typography = baseTheme?.typography || {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      monoFont: 'Monaco, monospace',
    };

    return {
      name,
      description,
      presets: [],
      colors,
      typography,
      isBuiltIn: false,
    };
  }, [presets]);

  // Extract colors from presets
  const extractColorsFromPresets = useCallback((presets: StylePreset[]): StyleTheme['colors'] => {
    // Analyze preset colors to create a cohesive palette
    const fills = presets.map(p => p.style.fill).filter(Boolean) as string[];
    const strokes = presets.map(p => p.style.stroke).filter(Boolean) as string[];
    const textColors = presets.map(p => p.style.color).filter(Boolean) as string[];

    // Get most common colors
    const primaryColor = getMostCommonColor(fills) || '#3b82f6';
    const secondaryColor = getMostCommonColor(strokes) || '#64748b';
    const textColor = getMostCommonColor(textColors) || '#1f2937';

    return {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: generateAccentColor(primaryColor),
      background: '#ffffff',
      text: textColor,
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    };
  }, []);

  // Generate color palette from primary color
  const generateColorPalette = useCallback((primaryColor: string): StyleTheme['colors'] => {
    // Use color theory to generate complementary colors
    const hsl = hexToHsl(primaryColor);

    return {
      primary: primaryColor,
      secondary: hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, hsl.l * 0.8),
      accent: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l * 0.9),
      background: '#ffffff',
      text: hsl.l > 0.5 ? '#1f2937' : '#f9fafb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    };
  }, []);

  // Validate theme colors
  const validateThemeColors = useCallback((colors: StyleTheme['colors']): string[] => {
    const errors: string[] = [];

    Object.entries(colors).forEach(([colorName, colorValue]) => {
      if (!isValidColor(colorValue)) {
        errors.push(`Invalid ${colorName} color: ${colorValue}`);
      }
    });

    // Check contrast ratios
    const textContrast = calculateContrastRatio(colors.text, colors.background);
    if (textContrast < 4.5) {
      errors.push('Text color does not meet accessibility contrast requirements');
    }

    return errors;
  }, []);

  // Analyze theme usage
  const analyzeThemeUsage = useCallback((themeId: string) => {
    // In a real implementation, this would analyze usage patterns
    const theme = themes.find(t => t.id === themeId);
    const relatedPresets = presets.filter(p =>
      p.tags.includes(theme?.name.toLowerCase() || '')
    );

    return {
      usageCount: relatedPresets.length,
      lastUsed: undefined, // Would track from usage logs
      popularColors: Object.entries(theme?.colors || {}).map(([name, color]) => ({
        color,
        usage: Math.floor(Math.random() * 100), // Placeholder
      })),
    };
  }, [themes, presets]);

  return {
    // Theme data
    themes,
    currentTheme,

    // Theme operations
    createTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,

    // Theme application
    applyTheme,
    getThemeColors,
    generatePresetFromTheme,

    // Theme creation helpers
    createThemeFromCurrent,
    extractColorsFromPresets,

    // Theme analysis
    analyzeThemeUsage,

    // Color utilities
    generateColorPalette,
    validateThemeColors,
  };
};

// Helper functions
function getMostCommonColor(colors: string[]): string | null {
  if (colors.length === 0) return null;

  const colorCounts = colors.reduce((acc, color) => {
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
}

function generateAccentColor(primaryColor: string): string {
  const hsl = hexToHsl(primaryColor);
  return hslToHex((hsl.h + 60) % 360, hsl.s, Math.min(hsl.l * 1.2, 1));
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Convert hex to RGB first
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1/3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1/3);

  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isValidColor(color: string): boolean {
  // Simple validation for hex colors
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
         /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color) ||
         /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color);
}

function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color library
  return 7; // Placeholder - assume good contrast
}