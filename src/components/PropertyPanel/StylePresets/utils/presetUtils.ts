// Utility functions for style preset operations

import type {
  StylePreset,
  PresetSearchFilters,
  PresetApplicationMode,
  PresetCategory,
} from '../../../../types/stylePresets';
import type { ElementStyle } from '../../../../types/diagram';
import { PRESET_CATEGORIES } from '../../../../types/stylePresets';

// Search and filter presets
export function searchPresets(
  presets: StylePreset[],
  filters: PresetSearchFilters
): StylePreset[] {
  let filtered = [...presets];

  // Text search
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(preset =>
      preset.name.toLowerCase().includes(searchTerm) ||
      preset.description?.toLowerCase().includes(searchTerm) ||
      preset.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      preset.category.toLowerCase().includes(searchTerm)
    );
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(preset => preset.category === filters.category);
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(preset =>
      filters.tags!.every(tag =>
        preset.tags.some(presetTag =>
          presetTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  // Author filter
  if (filters.author) {
    filtered = filtered.filter(preset =>
      preset.author?.toLowerCase().includes(filters.author!.toLowerCase())
    );
  }

  // Custom filter
  if (filters.isCustom !== undefined) {
    filtered = filtered.filter(preset => preset.isCustom === filters.isCustom);
  }

  // Shared filter
  if (filters.isShared !== undefined) {
    filtered = filtered.filter(preset => preset.isShared === filters.isShared);
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    filtered = filtered.filter(preset =>
      (preset.rating || 0) >= filters.minRating!
    );
  }

  return filtered;
}

// Apply preset to elements
export function applyPresetToElements(
  preset: StylePreset,
  elementIds: string[],
  mode: PresetApplicationMode = 'smart'
): void {
  // This function would integrate with the main diagram state management
  // For now, we'll just log the operation
  console.log('Applying preset:', {
    presetName: preset.name,
    elementIds,
    mode,
    style: preset.style,
  });

  // In a real implementation, this would:
  // 1. Get current element styles
  // 2. Apply the preset style based on the mode
  // 3. Update the diagram state
  // 4. Trigger re-render
}

// Merge styles based on application mode
export function mergeStyles(
  currentStyle: ElementStyle,
  presetStyle: ElementStyle,
  mode: PresetApplicationMode
): ElementStyle {
  switch (mode) {
    case 'replace':
      // Replace all styles with preset
      return { ...presetStyle };

    case 'merge':
      // Merge preset over current, keeping current for undefined preset values
      return { ...currentStyle, ...presetStyle };

    case 'overlay':
      // Only apply preset values that are actually defined (not default)
      const result = { ...currentStyle };
      Object.entries(presetStyle).forEach(([key, value]) => {
        if (value !== undefined && !isDefaultValue(key as keyof ElementStyle, value)) {
          (result as any)[key] = value;
        }
      });
      return result;

    case 'smart':
    default:
      // Intelligent merge based on element type and context
      return smartMergeStyles(currentStyle, presetStyle);
  }
}

// Smart merge logic
function smartMergeStyles(
  currentStyle: ElementStyle,
  presetStyle: ElementStyle
): ElementStyle {
  const result = { ...currentStyle };

  // Always apply colors and basic styling
  if (presetStyle.fill) result.fill = presetStyle.fill;
  if (presetStyle.stroke) result.stroke = presetStyle.stroke;
  if (presetStyle.strokeWidth !== undefined) result.strokeWidth = presetStyle.strokeWidth;
  if (presetStyle.opacity !== undefined) result.opacity = presetStyle.opacity;

  // Apply typography if current element has text
  if (currentStyle.fontSize || presetStyle.fontSize) {
    if (presetStyle.fontSize) result.fontSize = presetStyle.fontSize;
    if (presetStyle.fontFamily) result.fontFamily = presetStyle.fontFamily;
    if (presetStyle.fontWeight) result.fontWeight = presetStyle.fontWeight;
    if (presetStyle.fontStyle) result.fontStyle = presetStyle.fontStyle;
    if (presetStyle.textAlign) result.textAlign = presetStyle.textAlign;
    if (presetStyle.color) result.color = presetStyle.color;
  }

  // Apply shape-specific properties
  if (presetStyle.cornerRadius !== undefined) result.cornerRadius = presetStyle.cornerRadius;

  return result;
}

// Check if a value is a default value
function isDefaultValue(key: keyof ElementStyle, value: any): boolean {
  const defaults: Partial<ElementStyle> = {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'center',
    cornerRadius: 0,
  };

  return defaults[key] === value;
}

// Generate preset suggestions based on current selection
export function generatePresetSuggestions(
  currentStyles: ElementStyle[],
  availablePresets: StylePreset[],
  maxSuggestions: number = 5
): StylePreset[] {
  if (currentStyles.length === 0) {
    // Return popular presets when no selection
    return availablePresets
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, maxSuggestions);
  }

  // Analyze current styles to suggest similar presets
  const suggestions: Array<{ preset: StylePreset; score: number }> = [];

  availablePresets.forEach(preset => {
    let score = 0;

    currentStyles.forEach(currentStyle => {
      // Color similarity
      if (preset.style.fill && currentStyle.fill) {
        score += colorSimilarity(preset.style.fill, currentStyle.fill) * 0.3;
      }

      // Typography similarity
      if (preset.style.fontSize && currentStyle.fontSize) {
        score += Math.max(0, 1 - Math.abs(preset.style.fontSize - currentStyle.fontSize) / 20) * 0.2;
      }

      // Border similarity
      if (preset.style.strokeWidth !== undefined && currentStyle.strokeWidth !== undefined) {
        score += Math.max(0, 1 - Math.abs(preset.style.strokeWidth - currentStyle.strokeWidth) / 5) * 0.1;
      }

      // Corner radius similarity
      if (preset.style.cornerRadius !== undefined && currentStyle.cornerRadius !== undefined) {
        score += Math.max(0, 1 - Math.abs(preset.style.cornerRadius - currentStyle.cornerRadius) / 20) * 0.1;
      }
    });

    // Boost score for popular presets
    score += (preset.usageCount || 0) * 0.01;

    suggestions.push({ preset, score });
  });

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(s => s.preset);
}

// Calculate color similarity (simplified)
function colorSimilarity(color1: string, color2: string): number {
  // Convert hex to RGB for comparison
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  // Normalize to 0-1 range (max distance is ~441 for RGB)
  return Math.max(0, 1 - distance / 441);
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Validate preset data
export function validatePreset(preset: Partial<StylePreset>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!preset.name?.trim()) {
    errors.push('Name is required');
  } else if (preset.name.length > 50) {
    warnings.push('Name is quite long');
  }

  if (!preset.style || Object.keys(preset.style).length === 0) {
    errors.push('Style is required');
  }

  if (!preset.category) {
    errors.push('Category is required');
  } else if (!PRESET_CATEGORIES[preset.category as PresetCategory]) {
    errors.push('Invalid category');
  }

  // Style validation
  if (preset.style) {
    // Color validation
    if (preset.style.fill && !isValidColor(preset.style.fill)) {
      errors.push('Invalid fill color');
    }

    if (preset.style.stroke && !isValidColor(preset.style.stroke)) {
      errors.push('Invalid stroke color');
    }

    if (preset.style.color && !isValidColor(preset.style.color)) {
      errors.push('Invalid text color');
    }

    // Numeric validation
    if (preset.style.strokeWidth !== undefined && (preset.style.strokeWidth < 0 || preset.style.strokeWidth > 50)) {
      warnings.push('Stroke width should be between 0 and 50');
    }

    if (preset.style.opacity !== undefined && (preset.style.opacity < 0 || preset.style.opacity > 1)) {
      errors.push('Opacity must be between 0 and 1');
    }

    if (preset.style.fontSize !== undefined && (preset.style.fontSize < 6 || preset.style.fontSize > 72)) {
      warnings.push('Font size should be between 6 and 72');
    }

    if (preset.style.cornerRadius !== undefined && (preset.style.cornerRadius < 0 || preset.style.cornerRadius > 50)) {
      warnings.push('Corner radius should be between 0 and 50');
    }
  }

  // Tags validation
  if (preset.tags && preset.tags.length > 10) {
    warnings.push('Too many tags (max 10 recommended)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate color format
function isValidColor(color: string): boolean {
  // Hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }

  // RGB colors
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) {
    return true;
  }

  // RGBA colors
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) {
    return true;
  }

  // Named colors (basic check)
  const namedColors = ['transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'];
  if (namedColors.includes(color.toLowerCase())) {
    return true;
  }

  return false;
}

// Generate preset thumbnail
export function generatePresetThumbnail(preset: StylePreset): string {
  // Generate SVG thumbnail
  const { style } = preset;
  const svg = `
    <svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="2"
        y="2"
        width="44"
        height="28"
        fill="${style.fill || '#ffffff'}"
        stroke="${style.stroke || '#000000'}"
        stroke-width="${style.strokeWidth || 2}"
        rx="${style.cornerRadius || 0}"
        opacity="${style.opacity || 1}"
      />
      ${style.fontSize && style.fontSize > 0 ? `
        <text
          x="24"
          y="20"
          text-anchor="middle"
          font-family="${style.fontFamily || 'Arial, sans-serif'}"
          font-size="${Math.min(style.fontSize || 14, 12)}"
          font-weight="${style.fontWeight || 'normal'}"
          fill="${style.color || style.stroke || '#000000'}"
        >Aa</text>
      ` : ''}
    </svg>
  `;

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Export preset to different formats
export function exportPresetToCSS(preset: StylePreset): string {
  const className = `.preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`;
  const { style } = preset;

  let css = `${className} {\n`;
  if (style.fill) css += `  background-color: ${style.fill};\n`;
  if (style.stroke) css += `  border-color: ${style.stroke};\n`;
  if (style.strokeWidth) css += `  border-width: ${style.strokeWidth}px;\n`;
  if (style.opacity !== undefined) css += `  opacity: ${style.opacity};\n`;
  if (style.fontSize) css += `  font-size: ${style.fontSize}px;\n`;
  if (style.fontFamily) css += `  font-family: ${style.fontFamily};\n`;
  if (style.fontWeight) css += `  font-weight: ${style.fontWeight};\n`;
  if (style.color) css += `  color: ${style.color};\n`;
  if (style.cornerRadius) css += `  border-radius: ${style.cornerRadius}px;\n`;
  css += `}\n`;

  return css;
}

// Import preset from CSS
export function importPresetFromCSS(
  css: string,
  name: string,
  category: PresetCategory = 'custom'
): StylePreset {
  const style: ElementStyle = {};

  // Parse CSS properties (simplified)
  const rules = css.match(/([^{]+)\{([^}]+)\}/);
  if (rules && rules[2]) {
    const declarations = rules[2].split(';');

    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (!property || !value) return;

      switch (property) {
        case 'background-color':
          style.fill = value;
          break;
        case 'border-color':
          style.stroke = value;
          break;
        case 'border-width':
          style.strokeWidth = parseFloat(value);
          break;
        case 'opacity':
          style.opacity = parseFloat(value);
          break;
        case 'font-size':
          style.fontSize = parseFloat(value);
          break;
        case 'font-family':
          style.fontFamily = value.replace(/['"]/g, '');
          break;
        case 'font-weight':
          style.fontWeight = value as any;
          break;
        case 'color':
          style.color = value;
          break;
        case 'border-radius':
          style.cornerRadius = parseFloat(value);
          break;
      }
    });
  }

  const now = new Date().toISOString();

  return {
    id: `imported_${Date.now()}`,
    name,
    description: 'Imported from CSS',
    style,
    category,
    tags: ['imported', 'css'],
    created: now,
    modified: now,
    isCustom: true,
    isShared: false,
  };
}

// Analyze preset usage patterns
export function analyzePresetUsage(presets: StylePreset[]): {
  mostUsed: StylePreset[];
  popularCategories: Array<{ category: PresetCategory; count: number }>;
  popularColors: Array<{ color: string; count: number }>;
  averageComplexity: number;
} {
  // Most used presets
  const mostUsed = presets
    .filter(p => p.usageCount && p.usageCount > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 10);

  // Popular categories
  const categoryCount: Record<string, number> = {};
  presets.forEach(preset => {
    categoryCount[preset.category] = (categoryCount[preset.category] || 0) + 1;
  });

  const popularCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category: category as PresetCategory, count }))
    .sort((a, b) => b.count - a.count);

  // Popular colors
  const colorCount: Record<string, number> = {};
  presets.forEach(preset => {
    if (preset.style.fill) {
      colorCount[preset.style.fill] = (colorCount[preset.style.fill] || 0) + 1;
    }
    if (preset.style.stroke) {
      colorCount[preset.style.stroke] = (colorCount[preset.style.stroke] || 0) + 1;
    }
  });

  const popularColors = Object.entries(colorCount)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Average complexity (number of defined style properties)
  const totalComplexity = presets.reduce((sum, preset) => {
    return sum + Object.keys(preset.style).length;
  }, 0);
  const averageComplexity = presets.length > 0 ? totalComplexity / presets.length : 0;

  return {
    mostUsed,
    popularCategories,
    popularColors,
    averageComplexity,
  };
}

// Clean up preset data
export function cleanupPresetData(preset: StylePreset): StylePreset {
  const cleaned: StylePreset = {
    ...preset,
    name: preset.name.trim(),
    description: preset.description?.trim(),
    tags: preset.tags
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, index, array) => tag && array.indexOf(tag) === index),
  };

  // Remove undefined style properties
  const cleanedStyle: ElementStyle = {};
  Object.entries(preset.style).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      (cleanedStyle as any)[key] = value;
    }
  });
  cleaned.style = cleanedStyle;

  return cleaned;
}