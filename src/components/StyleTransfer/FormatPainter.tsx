import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PaintBucket, Brush, Check, RotateCcw } from 'lucide-react';
import type { ElementStyle, DiagramElement } from '../../types/diagram';

export interface FormatPainterState {
  isActive: boolean;
  sourceStyle: ElementStyle | null;
  sourceElementId: string | null;
  appliedElements: string[]; // Track which elements have been painted
  isPersistent: boolean; // Single-click vs double-click mode
}

export interface FormatPainterProps {
  elements: DiagramElement[];
  selectedElementIds?: string[];
  isActive?: boolean;
  sourceStyle?: ElementStyle | null;
  onStyleApply?: (elementId: string, style: ElementStyle) => void;
  onMultipleStyleApply?: (elementIds: string[], style: ElementStyle) => void;
  onActiveStateChange?: (isActive: boolean) => void;
  onSourceStyleChange?: (style: ElementStyle | null, sourceElementId: string | null) => void;
  className?: string;
}

/**
 * FormatPainter - Apply a copied style to multiple elements
 * Supports both single-application and persistent modes
 */
export const FormatPainter: React.FC<FormatPainterProps> = ({
  elements,
  selectedElementIds = [],
  isActive = false,
  sourceStyle = null,
  onStyleApply,
  onMultipleStyleApply,
  onActiveStateChange,
  onSourceStyleChange,
  className = '',
}) => {
  const [painterState, setPainterState] = useState<FormatPainterState>({
    isActive,
    sourceStyle,
    sourceElementId: null,
    appliedElements: [],
    isPersistent: false,
  });

  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load source style from currently selected element
  const loadSourceStyle = useCallback(() => {
    if (selectedElementIds.length !== 1) return false;

    const sourceElement = elements.find(el => el.id === selectedElementIds[0]);
    if (!sourceElement) return false;

    setPainterState(prev => ({
      ...prev,
      sourceStyle: { ...sourceElement.style },
      sourceElementId: sourceElement.id,
    }));

    onSourceStyleChange?.(sourceElement.style, sourceElement.id);
    return true;
  }, [selectedElementIds, elements, onSourceStyleChange]);

  // Activate format painter
  const activate = useCallback((persistent = false) => {
    // Try to load source style if we don't have one
    if (!painterState.sourceStyle && !loadSourceStyle()) {
      // No source style available
      return false;
    }

    setPainterState(prev => ({
      ...prev,
      isActive: true,
      isPersistent: persistent,
      appliedElements: [],
    }));

    onActiveStateChange?.(true);
    return true;
  }, [painterState.sourceStyle, loadSourceStyle, onActiveStateChange]);

  // Deactivate format painter
  const deactivate = useCallback(() => {
    setPainterState(prev => ({
      ...prev,
      isActive: false,
      isPersistent: false,
      appliedElements: [],
    }));
    onActiveStateChange?.(false);
  }, [onActiveStateChange]);

  // Handle single click (single application)
  const handleSingleClick = useCallback(() => {
    if (painterState.isActive) {
      deactivate();
    } else {
      activate(false);
    }
  }, [painterState.isActive, activate, deactivate]);

  // Handle double click (persistent mode)
  const handleDoubleClick = useCallback(() => {
    activate(true);
  }, [activate]);

  // Apply style to element
  const applyStyleToElement = useCallback((elementId: string) => {
    if (!painterState.sourceStyle || !painterState.isActive) return false;

    const targetElement = elements.find(el => el.id === elementId);
    if (!targetElement || elementId === painterState.sourceElementId) return false;

    // Skip if already applied in this session
    if (painterState.appliedElements.includes(elementId)) return false;

    onStyleApply?.(elementId, painterState.sourceStyle);

    setPainterState(prev => ({
      ...prev,
      appliedElements: [...prev.appliedElements, elementId],
    }));

    // Show success indicator
    setShowSuccessIndicator(true);
    setTimeout(() => setShowSuccessIndicator(false), 1000);

    // Deactivate if not persistent
    if (!painterState.isPersistent) {
      setTimeout(() => deactivate(), 100);
    }

    return true;
  }, [painterState.sourceStyle, painterState.isActive, painterState.sourceElementId,
      painterState.appliedElements, painterState.isPersistent, elements, onStyleApply, deactivate]);

  // Apply style to multiple selected elements
  const applyToSelected = useCallback(() => {
    if (!painterState.sourceStyle || selectedElementIds.length === 0) return;

    const validTargetIds = selectedElementIds.filter(id =>
      id !== painterState.sourceElementId &&
      !painterState.appliedElements.includes(id)
    );

    if (validTargetIds.length === 0) return;

    onMultipleStyleApply?.(validTargetIds, painterState.sourceStyle);

    setPainterState(prev => ({
      ...prev,
      appliedElements: [...prev.appliedElements, ...validTargetIds],
    }));

    setShowSuccessIndicator(true);
    setTimeout(() => setShowSuccessIndicator(false), 1000);

    // Deactivate if not persistent
    if (!painterState.isPersistent) {
      setTimeout(() => deactivate(), 100);
    }
  }, [painterState.sourceStyle, painterState.sourceElementId, painterState.appliedElements,
      painterState.isPersistent, selectedElementIds, onMultipleStyleApply, deactivate]);

  // Reset applied elements list
  const resetAppliedElements = useCallback(() => {
    setPainterState(prev => ({
      ...prev,
      appliedElements: [],
    }));
  }, []);

  // Clear source style
  const clearSourceStyle = useCallback(() => {
    setPainterState(prev => ({
      ...prev,
      sourceStyle: null,
      sourceElementId: null,
      isActive: false,
      appliedElements: [],
      isPersistent: false,
    }));
    onSourceStyleChange?.(null, null);
    onActiveStateChange?.(false);
  }, [onSourceStyleChange, onActiveStateChange]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && painterState.isActive) {
        deactivate();
      }
    };

    if (painterState.isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [painterState.isActive, deactivate]);

  // Sync with external state
  useEffect(() => {
    if (isActive !== painterState.isActive) {
      setPainterState(prev => ({ ...prev, isActive }));
    }
  }, [isActive, painterState.isActive]);

  useEffect(() => {
    if (sourceStyle !== painterState.sourceStyle) {
      setPainterState(prev => ({ ...prev, sourceStyle }));
    }
  }, [sourceStyle, painterState.sourceStyle]);

  const hasSourceStyle = painterState.sourceStyle !== null;
  const canApplyToSelected = hasSourceStyle && selectedElementIds.length > 0 &&
    selectedElementIds.some(id => id !== painterState.sourceElementId);

  return (
    <div className={`format-painter ${className}`}>
      {/* Main format painter button */}
      <div className="format-painter-controls">
        <button
          ref={buttonRef}
          className={`format-painter-toggle ${painterState.isActive ? 'active' : ''} ${hasSourceStyle ? 'has-source' : ''}`}
          onClick={handleSingleClick}
          onDoubleClick={handleDoubleClick}
          disabled={!hasSourceStyle}
          title={hasSourceStyle
            ? "Format Painter: Click to apply once, double-click for persistent mode"
            : "Select an element first to copy its style"
          }
        >
          <PaintBucket size={20} />
          {painterState.isActive && (
            <span className={`painter-mode-indicator ${painterState.isPersistent ? 'persistent' : 'single'}`}>
              {painterState.isPersistent ? '∞' : '1'}
            </span>
          )}
        </button>

        {/* Apply to selected button */}
        {canApplyToSelected && (
          <button
            className="format-painter-apply-selected"
            onClick={applyToSelected}
            title={`Apply style to ${selectedElementIds.length} selected element(s)`}
          >
            <Brush size={16} />
            <span>Apply to Selected ({selectedElementIds.length})</span>
          </button>
        )}

        {/* Reset applied elements */}
        {painterState.appliedElements.length > 0 && (
          <button
            className="format-painter-reset"
            onClick={resetAppliedElements}
            title="Reset applied elements list"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Source style preview */}
      {hasSourceStyle && (
        <div className="format-painter-source-preview">
          <div className="source-preview-header">
            <span>Source Style:</span>
            <button
              className="source-clear-button"
              onClick={clearSourceStyle}
              title="Clear source style"
            >
              ×
            </button>
          </div>
          <div
            className="source-preview-swatch"
            style={{
              backgroundColor: painterState.sourceStyle.fill || '#ffffff',
              border: `${painterState.sourceStyle.strokeWidth || 1}px solid ${painterState.sourceStyle.stroke || '#000000'}`,
              borderRadius: `${painterState.sourceStyle.cornerRadius || 0}px`,
              opacity: painterState.sourceStyle.opacity || 1,
            }}
          />
          <div className="source-preview-info">
            <div>Applied to: {painterState.appliedElements.length} elements</div>
          </div>
        </div>
      )}

      {/* Status indicators */}
      {painterState.isActive && (
        <div className="format-painter-status">
          <div className={`painter-status-indicator ${painterState.isPersistent ? 'persistent' : 'single'}`}>
            {painterState.isPersistent ? 'Persistent Mode - Click elements to paint (ESC to stop)' : 'Single Mode - Click an element to paint'}
          </div>
        </div>
      )}

      {/* Success indicator */}
      {showSuccessIndicator && (
        <div className="format-painter-success">
          <Check size={16} />
          <span>Style applied!</span>
        </div>
      )}
    </div>
  );
};

// Hook for programmatic format painter usage
export const useFormatPainter = () => {
  const [painterState, setPainterState] = useState<FormatPainterState>({
    isActive: false,
    sourceStyle: null,
    sourceElementId: null,
    appliedElements: [],
    isPersistent: false,
  });

  const setSourceStyle = useCallback((style: ElementStyle | null, sourceElementId: string | null = null) => {
    setPainterState(prev => ({
      ...prev,
      sourceStyle: style,
      sourceElementId,
      appliedElements: [],
    }));
  }, []);

  const activate = useCallback((persistent = false) => {
    if (!painterState.sourceStyle) return false;

    setPainterState(prev => ({
      ...prev,
      isActive: true,
      isPersistent: persistent,
      appliedElements: [],
    }));
    return true;
  }, [painterState.sourceStyle]);

  const deactivate = useCallback(() => {
    setPainterState(prev => ({
      ...prev,
      isActive: false,
      isPersistent: false,
    }));
  }, []);

  const applyStyle = useCallback((elementId: string): boolean => {
    if (!painterState.sourceStyle || !painterState.isActive) return false;

    setPainterState(prev => ({
      ...prev,
      appliedElements: [...prev.appliedElements, elementId],
    }));

    // Auto-deactivate if not persistent
    if (!painterState.isPersistent) {
      setTimeout(() => deactivate(), 100);
    }

    return true;
  }, [painterState.sourceStyle, painterState.isActive, painterState.isPersistent, deactivate]);

  return {
    painterState,
    setSourceStyle,
    activate,
    deactivate,
    applyStyle,
    hasSourceStyle: painterState.sourceStyle !== null,
  };
};

export default FormatPainter;