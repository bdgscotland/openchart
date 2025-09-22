/**
 * Color utility functions for conversions between different color formats
 * Supports hex, rgb, hsl, hsv formats with alpha channel
 */

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSLAColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface HSVAColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface ColorFormats {
  hex: string;
  rgb: string;
  rgba: RGBAColor;
  hsl: string;
  hsla: HSLAColor;
  hsv: string;
  hsva: HSVAColor;
}

/**
 * Convert hex color to RGBA
 */
export function hexToRgba(hex: string): RGBAColor {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Handle 6-digit hex
  if (hex.length === 6) {
    hex += 'ff'; // Add full alpha
  }

  // Handle 8-digit hex (with alpha)
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255;

    return { r, g, b, a };
  }

  throw new Error(`Invalid hex color: ${hex}`);
}

/**
 * Convert RGBA to hex
 */
export function rgbaToHex(rgba: RGBAColor): string {
  const r = Math.round(rgba.r).toString(16).padStart(2, '0');
  const g = Math.round(rgba.g).toString(16).padStart(2, '0');
  const b = Math.round(rgba.b).toString(16).padStart(2, '0');
  const a = Math.round(rgba.a * 255).toString(16).padStart(2, '0');

  // Return without alpha if fully opaque
  if (rgba.a === 1) {
    return `#${r}${g}${b}`;
  }

  return `#${r}${g}${b}${a}`;
}

/**
 * Convert RGBA to HSLA
 */
export function rgbaToHsla(rgba: RGBAColor): HSLAColor {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgba.a
  };
}

/**
 * Convert HSLA to RGBA
 */
export function hslaToRgba(hsla: HSLAColor): RGBAColor {
  const h = hsla.h / 360;
  const s = hsla.s / 100;
  const l = hsla.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray, a: hsla.a };
  }

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

  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return { r, g, b, a: hsla.a };
}

/**
 * Convert RGBA to HSVA
 */
export function rgbaToHsva(rgba: RGBAColor): HSVAColor {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: rgba.a
  };
}

/**
 * Convert HSVA to RGBA
 */
export function hsvaToRgba(hsva: HSVAColor): RGBAColor {
  const h = hsva.h / 360;
  const s = hsva.s / 100;
  const v = hsva.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;

  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsva.a
  };
}

/**
 * Parse color string to RGBA
 */
export function parseColor(color: string): RGBAColor {
  // Hex format
  if (color.startsWith('#')) {
    return hexToRgba(color);
  }

  // RGB/RGBA format
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbaMatch) {
    const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
    return {
      r: values[0] || 0,
      g: values[1] || 0,
      b: values[2] || 0,
      a: values[3] !== undefined ? values[3] : 1
    };
  }

  // HSL/HSLA format
  const hslaMatch = color.match(/hsla?\(([^)]+)\)/);
  if (hslaMatch) {
    const values = hslaMatch[1].split(',').map(v => parseFloat(v.trim()));
    const hsla: HSLAColor = {
      h: values[0] || 0,
      s: values[1] || 0,
      l: values[2] || 0,
      a: values[3] !== undefined ? values[3] : 1
    };
    return hslaToRgba(hsla);
  }

  // Named colors or default
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Format RGBA to string
 */
export function formatColor(rgba: RGBAColor, format: 'hex' | 'rgb' | 'hsl' = 'hex'): string {
  switch (format) {
    case 'hex':
      return rgbaToHex(rgba);
    case 'rgb':
      if (rgba.a < 1) {
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
      }
      return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
    case 'hsl':
      const hsla = rgbaToHsla(rgba);
      if (rgba.a < 1) {
        return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
      }
      return `hsl(${hsla.h}, ${hsla.s}%, ${hsla.l}%)`;
    default:
      return rgbaToHex(rgba);
  }
}

/**
 * Get all color formats for a given RGBA color
 */
export function getAllFormats(rgba: RGBAColor): ColorFormats {
  const hsla = rgbaToHsla(rgba);
  const hsva = rgbaToHsva(rgba);

  return {
    hex: rgbaToHex(rgba),
    rgb: formatColor(rgba, 'rgb'),
    rgba,
    hsl: formatColor(rgba, 'hsl'),
    hsla,
    hsv: `hsv(${hsva.h}, ${hsva.s}%, ${hsva.v}%)`,
    hsva
  };
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1: RGBAColor, color2: RGBAColor): number {
  const getLuminance = (rgba: RGBAColor) => {
    const rgb = [rgba.r, rgba.g, rgba.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color meets WCAG contrast requirements
 */
export function meetsContrastRequirements(
  foreground: RGBAColor,
  background: RGBAColor,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

/**
 * Predefined color palettes
 */
export const COLOR_PALETTES = {
  basic: [
    '#ffffff', '#f0f0f0', '#d0d0d0', '#b0b0b0', '#909090', '#707070', '#505050', '#303030', '#000000',
    '#ff0000', '#ff4500', '#ffa500', '#ffff00', '#9acd32', '#00ff00', '#00fa9a', '#00ffff', '#0000ff',
    '#4169e1', '#8a2be2', '#ff1493', '#ff69b4', '#ffc0cb', '#ffffff'
  ],
  material: [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
    '#795548', '#9e9e9e', '#607d8b', '#000000', '#ffffff'
  ],
  tailwind: [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#64748b', '#374151', '#111827', '#ffffff'
  ]
};

/**
 * Recent colors storage
 */
const RECENT_COLORS_KEY = 'openchart-recent-colors';
const MAX_RECENT_COLORS = 10;

export function getRecentColors(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_COLORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentColor(color: string): void {
  try {
    const recent = getRecentColors();
    const filtered = recent.filter(c => c !== color);
    const updated = [color, ...filtered].slice(0, MAX_RECENT_COLORS);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function clearRecentColors(): void {
  try {
    localStorage.removeItem(RECENT_COLORS_KEY);
  } catch {
    // Silently fail if localStorage is not available
  }
}