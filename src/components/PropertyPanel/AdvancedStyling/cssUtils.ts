// CSS Generation Utilities for Advanced Styling

import type {
  Gradient,
  BoxShadow,
  BorderStyle,
  StrokeStyle,
  FilterEffect,
  Transform,
  TexturePattern,
  CSSOutput
} from './types';

/**
 * Generate CSS gradient string from gradient object
 */
export function generateGradientCSS(gradient: Gradient): string {
  if (gradient.type === 'linear') {
    const direction = `${gradient.direction}deg`;
    const stops = gradient.stops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    return `linear-gradient(${direction}, ${stops})`;
  } else if (gradient.type === 'radial') {
    const shape = gradient.shape;
    const size = gradient.size;
    const position = `${gradient.position.x}% ${gradient.position.y}%`;
    const stops = gradient.stops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    return `radial-gradient(${shape} ${size} at ${position}, ${stops})`;
  }
  return '';
}

/**
 * Generate CSS box-shadow string from shadow array
 */
export function generateShadowCSS(shadows: BoxShadow[]): string {
  return shadows
    .map(shadow => {
      const inset = shadow.inset ? 'inset ' : '';
      return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.spreadRadius}px ${shadow.color}`;
    })
    .join(', ');
}

/**
 * Generate CSS border properties from border style
 */
export function generateBorderCSS(border: BorderStyle): Record<string, string> {
  const properties: Record<string, string> = {
    'border-width': `${border.width}px`,
    'border-style': border.style,
    'border-color': border.color
  };

  if (border.radius) {
    const { topLeft, topRight, bottomLeft, bottomRight } = border.radius;
    if (topLeft === topRight && topRight === bottomLeft && bottomLeft === bottomRight) {
      properties['border-radius'] = `${topLeft}px`;
    } else {
      properties['border-radius'] = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
    }
  }

  return properties;
}

/**
 * Generate SVG stroke properties from stroke style
 */
export function generateStrokeCSS(stroke: StrokeStyle): Record<string, string> {
  const properties: Record<string, string> = {
    'stroke-width': `${stroke.width}`,
    'stroke': stroke.color,
    'stroke-linecap': stroke.lineCap,
    'stroke-linejoin': stroke.lineJoin
  };

  if (stroke.dashArray && stroke.dashArray.length > 0) {
    properties['stroke-dasharray'] = stroke.dashArray.join(' ');
  }

  if (stroke.dashOffset !== undefined) {
    properties['stroke-dashoffset'] = `${stroke.dashOffset}`;
  }

  if (stroke.miterLimit !== undefined) {
    properties['stroke-miterlimit'] = `${stroke.miterLimit}`;
  }

  return properties;
}

/**
 * Generate CSS filter string from filter effects
 */
export function generateFilterCSS(filters: FilterEffect[]): string {
  return filters
    .map(filter => {
      const unit = filter.unit || '';
      switch (filter.type) {
        case 'blur':
          return `blur(${filter.value}px)`;
        case 'brightness':
          return `brightness(${filter.value}%)`;
        case 'contrast':
          return `contrast(${filter.value}%)`;
        case 'drop-shadow':
          // Note: drop-shadow syntax is different, would need additional parameters
          return `drop-shadow(0 0 ${filter.value}px rgba(0,0,0,0.5))`;
        case 'grayscale':
          return `grayscale(${filter.value}%)`;
        case 'hue-rotate':
          return `hue-rotate(${filter.value}deg)`;
        case 'invert':
          return `invert(${filter.value}%)`;
        case 'opacity':
          return `opacity(${filter.value}%)`;
        case 'saturate':
          return `saturate(${filter.value}%)`;
        case 'sepia':
          return `sepia(${filter.value}%)`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Generate CSS transform string from transform array
 */
export function generateTransformCSS(transforms: Transform[]): string {
  return transforms
    .map(transform => {
      switch (transform.type) {
        case 'translate':
          return `translate(${transform.x || 0}px, ${transform.y || 0}px)`;
        case 'rotate':
          return `rotate(${transform.angle || 0}deg)`;
        case 'scale':
          const scaleX = transform.scaleX || 1;
          const scaleY = transform.scaleY || scaleX;
          return `scale(${scaleX}, ${scaleY})`;
        case 'skew':
          return `skew(${transform.x || 0}deg, ${transform.y || 0}deg)`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Generate texture/pattern CSS
 */
export function generateTextureCSS(texture: TexturePattern): string {
  if (texture.type === 'image' && texture.url) {
    return `url(${texture.url})`;
  }

  if (texture.type === 'pattern') {
    switch (texture.pattern) {
      case 'dots':
        return generateDotsPattern(texture.size, texture.opacity);
      case 'stripes':
        return generateStripesPattern(texture.size, texture.rotation || 0);
      case 'checkerboard':
        return generateCheckerboardPattern(texture.size);
      case 'diagonal':
        return generateDiagonalPattern(texture.size);
      case 'grid':
        return generateGridPattern(texture.size);
      default:
        return '';
    }
  }

  return '';
}

/**
 * Generate dots pattern using CSS gradients
 */
function generateDotsPattern(size: number, opacity: number): string {
  const color = `rgba(0, 0, 0, ${opacity})`;
  return `radial-gradient(circle at center, ${color} 1px, transparent 1px)`;
}

/**
 * Generate stripes pattern using CSS gradients
 */
function generateStripesPattern(size: number, rotation: number): string {
  return `repeating-linear-gradient(${rotation}deg, transparent, transparent ${size}px, rgba(0,0,0,0.1) ${size}px, rgba(0,0,0,0.1) ${size * 2}px)`;
}

/**
 * Generate checkerboard pattern using CSS gradients
 */
function generateCheckerboardPattern(size: number): string {
  const color1 = 'transparent';
  const color2 = 'rgba(0,0,0,0.1)';
  return `
    linear-gradient(45deg, ${color1} 25%, ${color2} 25%, ${color2} 75%, ${color1} 75%, ${color1}),
    linear-gradient(45deg, ${color1} 25%, ${color2} 25%, ${color2} 75%, ${color1} 75%, ${color1})
  `;
}

/**
 * Generate diagonal pattern using CSS gradients
 */
function generateDiagonalPattern(size: number): string {
  return `repeating-linear-gradient(45deg, transparent, transparent ${size}px, rgba(0,0,0,0.1) ${size}px, rgba(0,0,0,0.1) ${size * 2}px)`;
}

/**
 * Generate grid pattern using CSS gradients
 */
function generateGridPattern(size: number): string {
  const color = 'rgba(0,0,0,0.1)';
  return `
    linear-gradient(to right, ${color} 1px, transparent 1px),
    linear-gradient(to bottom, ${color} 1px, transparent 1px)
  `;
}

/**
 * Convert advanced styles to complete CSS output
 */
export function generateAdvancedCSS(style: any): CSSOutput {
  const properties: Record<string, string> = {};
  const variables: Record<string, string> = {};

  // Handle gradient fills
  if (style.fill && typeof style.fill === 'object' && 'type' in style.fill) {
    properties['background'] = generateGradientCSS(style.fill as Gradient);
  } else if (style.fill && typeof style.fill === 'object' && 'type' in style.fill && style.fill.type === 'pattern') {
    properties['background'] = generateTextureCSS(style.fill as TexturePattern);
  } else if (typeof style.fill === 'string') {
    properties['background'] = style.fill;
  }

  // Handle shadows
  if (style.shadows && Array.isArray(style.shadows)) {
    properties['box-shadow'] = generateShadowCSS(style.shadows);
  }

  // Handle borders
  if (style.border) {
    Object.assign(properties, generateBorderCSS(style.border));
  }

  // Handle filters
  if (style.filters && Array.isArray(style.filters)) {
    const filterCSS = generateFilterCSS(style.filters);
    if (filterCSS) {
      properties['filter'] = filterCSS;
    }
  }

  // Handle transforms
  if (style.transforms && Array.isArray(style.transforms)) {
    const transformCSS = generateTransformCSS(style.transforms);
    if (transformCSS) {
      properties['transform'] = transformCSS;
    }
  }

  // Handle clip paths
  if (style.clipPath) {
    properties['clip-path'] = style.clipPath;
  }

  return { properties, variables };
}

/**
 * Utility to create CSS custom properties (variables) for complex styles
 */
export function createCSSVariables(prefix: string, values: Record<string, any>): Record<string, string> {
  const variables: Record<string, string> = {};

  Object.entries(values).forEach(([key, value]) => {
    variables[`--${prefix}-${key}`] = String(value);
  });

  return variables;
}

/**
 * Parse CSS gradient string back to gradient object
 */
export function parseGradientCSS(cssGradient: string): Gradient | null {
  // This would be a complex parser - for now return null
  // Would parse strings like "linear-gradient(45deg, #ff0000 0%, #0000ff 100%)"
  return null;
}

/**
 * Validate CSS property values
 */
export function validateCSS(property: string, value: string): boolean {
  try {
    // Create a temporary element to test CSS validity
    const div = document.createElement('div');
    div.style.setProperty(property, value);
    return div.style.getPropertyValue(property) !== '';
  } catch {
    return false;
  }
}