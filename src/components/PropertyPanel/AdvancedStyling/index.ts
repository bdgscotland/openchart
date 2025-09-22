// Advanced Styling Components for PropertyPanel
// These components provide sophisticated styling controls for gradients, shadows, borders, effects, and textures

// Core Types
export type {
  GradientStop,
  LinearGradient,
  RadialGradient,
  Gradient,
  BoxShadow,
  BorderStyle,
  StrokeStyle,
  FilterEffect,
  Transform,
  TexturePattern,
  AdvancedStyle,
  CSSOutput
} from './types';

// CSS Generation Utilities
export {
  generateGradientCSS,
  generateShadowCSS,
  generateBorderCSS,
  generateStrokeCSS,
  generateFilterCSS,
  generateTransformCSS,
  generateTextureCSS,
  generateAdvancedCSS,
  createCSSVariables,
  parseGradientCSS,
  validateCSS,
  GRADIENT_PRESETS,
  SHADOW_PRESETS,
  STROKE_PATTERNS
} from './cssUtils';

// Main Components
export { GradientPicker } from './GradientPicker';
export { ShadowControls } from './ShadowControls';
export { BorderControls } from './BorderControls';
export { EffectsPicker } from './EffectsPicker';
export { StrokeControls } from './StrokeControls';
export { TexturePicker } from './TexturePicker';

// Re-export as default components
export { GradientPicker as default } from './GradientPicker';

// Consolidated advanced styling hook
export { useAdvancedStyling } from './useAdvancedStyling';