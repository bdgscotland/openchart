import { useState, useCallback, useMemo } from 'react';
import type {
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
import { generateAdvancedCSS } from './cssUtils';

interface UseAdvancedStylingOptions {
  initialStyle?: Partial<AdvancedStyle>;
  onChange?: (style: AdvancedStyle) => void;
}

interface UseAdvancedStylingReturn {
  // Current style state
  style: AdvancedStyle;

  // Individual property updaters
  setFill: (fill: string | Gradient | TexturePattern | undefined) => void;
  setStroke: (stroke: StrokeStyle | undefined) => void;
  setBorder: (border: BorderStyle | undefined) => void;
  setShadows: (shadows: BoxShadow[]) => void;
  setFilters: (filters: FilterEffect[]) => void;
  setTransforms: (transforms: Transform[]) => void;
  setClipPath: (clipPath: string | undefined) => void;

  // Utility functions
  addShadow: (shadow: BoxShadow) => void;
  removeShadow: (index: number) => void;
  addFilter: (filter: FilterEffect) => void;
  removeFilter: (index: number) => void;
  addTransform: (transform: Transform) => void;
  removeTransform: (index: number) => void;

  // CSS generation
  generateCSS: () => CSSOutput;
  getStyleString: () => string;

  // Presets and utilities
  applyPreset: (preset: Partial<AdvancedStyle>) => void;
  reset: () => void;
  hasAdvancedStyles: boolean;
}

const DEFAULT_ADVANCED_STYLE: AdvancedStyle = {
  shadows: [],
  filters: [],
  transforms: [],
};

/**
 * Custom hook for managing advanced styling state and operations
 */
export const useAdvancedStyling = (options: UseAdvancedStylingOptions = {}): UseAdvancedStylingReturn => {
  const { initialStyle = {}, onChange } = options;

  const [style, setStyleInternal] = useState<AdvancedStyle>(() => ({
    ...DEFAULT_ADVANCED_STYLE,
    ...initialStyle,
  }));

  // Notify parent component of changes
  const updateStyle = useCallback((newStyle: AdvancedStyle) => {
    setStyleInternal(newStyle);
    onChange?.(newStyle);
  }, [onChange]);

  // Individual property updaters
  const setFill = useCallback((fill: string | Gradient | TexturePattern | undefined) => {
    updateStyle({ ...style, fill });
  }, [style, updateStyle]);

  const setStroke = useCallback((stroke: StrokeStyle | undefined) => {
    updateStyle({ ...style, stroke });
  }, [style, updateStyle]);

  const setBorder = useCallback((border: BorderStyle | undefined) => {
    updateStyle({ ...style, border });
  }, [style, updateStyle]);

  const setShadows = useCallback((shadows: BoxShadow[]) => {
    updateStyle({ ...style, shadows });
  }, [style, updateStyle]);

  const setFilters = useCallback((filters: FilterEffect[]) => {
    updateStyle({ ...style, filters });
  }, [style, updateStyle]);

  const setTransforms = useCallback((transforms: Transform[]) => {
    updateStyle({ ...style, transforms });
  }, [style, updateStyle]);

  const setClipPath = useCallback((clipPath: string | undefined) => {
    updateStyle({ ...style, clipPath });
  }, [style, updateStyle]);

  // Array manipulation utilities
  const addShadow = useCallback((shadow: BoxShadow) => {
    const newShadows = [...(style.shadows || []), shadow];
    setShadows(newShadows);
  }, [style.shadows, setShadows]);

  const removeShadow = useCallback((index: number) => {
    const newShadows = (style.shadows || []).filter((_, i) => i !== index);
    setShadows(newShadows);
  }, [style.shadows, setShadows]);

  const addFilter = useCallback((filter: FilterEffect) => {
    const newFilters = [...(style.filters || []), filter];
    setFilters(newFilters);
  }, [style.filters, setFilters]);

  const removeFilter = useCallback((index: number) => {
    const newFilters = (style.filters || []).filter((_, i) => i !== index);
    setFilters(newFilters);
  }, [style.filters, setFilters]);

  const addTransform = useCallback((transform: Transform) => {
    const newTransforms = [...(style.transforms || []), transform];
    setTransforms(newTransforms);
  }, [style.transforms, setTransforms]);

  const removeTransform = useCallback((index: number) => {
    const newTransforms = (style.transforms || []).filter((_, i) => i !== index);
    setTransforms(newTransforms);
  }, [style.transforms, setTransforms]);

  // CSS generation
  const generateCSS = useCallback((): CSSOutput => {
    return generateAdvancedCSS(style);
  }, [style]);

  const getStyleString = useCallback((): string => {
    const css = generateCSS();
    return Object.entries(css.properties)
      .map(([prop, value]) => `${prop}: ${value};`)
      .join('\n');
  }, [generateCSS]);

  // Presets and utilities
  const applyPreset = useCallback((preset: Partial<AdvancedStyle>) => {
    updateStyle({ ...style, ...preset });
  }, [style, updateStyle]);

  const reset = useCallback(() => {
    updateStyle(DEFAULT_ADVANCED_STYLE);
  }, [updateStyle]);

  // Check if any advanced styles are applied
  const hasAdvancedStyles = useMemo(() => {
    return !!(
      style.fill ||
      style.stroke ||
      style.border ||
      (style.shadows && style.shadows.length > 0) ||
      (style.filters && style.filters.length > 0) ||
      (style.transforms && style.transforms.length > 0) ||
      style.clipPath
    );
  }, [style]);

  return {
    style,
    setFill,
    setStroke,
    setBorder,
    setShadows,
    setFilters,
    setTransforms,
    setClipPath,
    addShadow,
    removeShadow,
    addFilter,
    removeFilter,
    addTransform,
    removeTransform,
    generateCSS,
    getStyleString,
    applyPreset,
    reset,
    hasAdvancedStyles,
  };
};