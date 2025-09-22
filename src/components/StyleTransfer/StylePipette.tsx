import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Pipette, Target, Eye, Square } from 'lucide-react';
import type { ElementStyle, DiagramElement } from '../../types/diagram';

export interface StylePickerState {
  isActive: boolean;
  targetElement: DiagramElement | null;
  previewStyle: ElementStyle | null;
  cursor: { x: number; y: number } | null;
}

export interface StylePipetteProps {
  elements: DiagramElement[];
  isActive?: boolean;
  onStylePicked?: (style: ElementStyle, sourceElement: DiagramElement) => void;
  onActiveStateChange?: (isActive: boolean) => void;
  onHoverElement?: (element: DiagramElement | null) => void;
  className?: string;
}

/**
 * StylePipette - Eyedropper tool for picking styles from any element
 * Provides visual feedback and precise style selection
 */
export const StylePipette: React.FC<StylePipetteProps> = ({
  elements,
  isActive = false,
  onStylePicked,
  onActiveStateChange,
  onHoverElement,
  className = '',
}) => {
  const [pickerState, setPickerState] = useState<StylePickerState>({
    isActive,
    targetElement: null,
    previewStyle: null,
    cursor: null,
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Activate/deactivate picker
  const togglePicker = useCallback(() => {
    const newState = !pickerState.isActive;
    setPickerState(prev => ({
      ...prev,
      isActive: newState,
      targetElement: null,
      previewStyle: null,
      cursor: null,
    }));
    onActiveStateChange?.(newState);
  }, [pickerState.isActive, onActiveStateChange]);

  // Find element at position
  const findElementAtPosition = useCallback((x: number, y: number): DiagramElement | null => {
    // Find the topmost element at the given coordinates
    // This would need to be integrated with the actual canvas/DOM structure
    // For now, we'll simulate by checking element bounds
    const canvasRect = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!canvasRect) return null;

    const relativeX = x - canvasRect.left;
    const relativeY = y - canvasRect.top;

    // Find element that contains this point (in reverse order for top-most)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const bounds = {
        left: element.position.x,
        top: element.position.y,
        right: element.position.x + element.size.width,
        bottom: element.position.y + element.size.height,
      };

      if (relativeX >= bounds.left && relativeX <= bounds.right &&
          relativeY >= bounds.top && relativeY <= bounds.bottom) {
        return element;
      }
    }

    return null;
  }, [elements]);

  // Handle mouse move over canvas
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!pickerState.isActive) return;

    const x = event.clientX;
    const y = event.clientY;

    const targetElement = findElementAtPosition(x, y);

    setPickerState(prev => ({
      ...prev,
      targetElement,
      previewStyle: targetElement?.style || null,
      cursor: { x, y },
    }));

    onHoverElement?.(targetElement);
  }, [pickerState.isActive, findElementAtPosition, onHoverElement]);

  // Handle click to pick style
  const handleClick = useCallback((event: MouseEvent) => {
    if (!pickerState.isActive || !pickerState.targetElement) return;

    event.preventDefault();
    event.stopPropagation();

    onStylePicked?.(pickerState.targetElement.style, pickerState.targetElement);

    // Deactivate picker after successful pick
    setPickerState(prev => ({
      ...prev,
      isActive: false,
      targetElement: null,
      previewStyle: null,
      cursor: null,
    }));
    onActiveStateChange?.(false);
  }, [pickerState.isActive, pickerState.targetElement, onStylePicked, onActiveStateChange]);

  // Handle escape key to cancel
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && pickerState.isActive) {
      setPickerState(prev => ({
        ...prev,
        isActive: false,
        targetElement: null,
        previewStyle: null,
        cursor: null,
      }));
      onActiveStateChange?.(false);
    }
  }, [pickerState.isActive, onActiveStateChange]);

  // Set up event listeners when active
  useEffect(() => {
    if (!pickerState.isActive) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    // Change cursor style
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
    };
  }, [pickerState.isActive, handleMouseMove, handleClick, handleKeyDown]);

  // Sync with external active state
  useEffect(() => {
    if (isActive !== pickerState.isActive) {
      setPickerState(prev => ({
        ...prev,
        isActive,
        targetElement: isActive ? prev.targetElement : null,
        previewStyle: isActive ? prev.previewStyle : null,
        cursor: isActive ? prev.cursor : null,
      }));
    }
  }, [isActive, pickerState.isActive]);

  return (
    <div className={`style-pipette ${className}`}>
      {/* Pipette toggle button */}
      <button
        className={`style-pipette-toggle ${pickerState.isActive ? 'active' : ''}`}
        onClick={togglePicker}
        title="Style Pipette (Pick style from element)"
      >
        <Pipette size={20} />
        {pickerState.isActive && <span className="pipette-active-indicator" />}
      </button>

      {/* Overlay when active */}
      {pickerState.isActive && (
        <div
          ref={overlayRef}
          className="style-pipette-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        >
          {/* Crosshair cursor preview */}
          {pickerState.cursor && (
            <div
              className="style-pipette-crosshair"
              style={{
                position: 'absolute',
                left: pickerState.cursor.x - 10,
                top: pickerState.cursor.y - 10,
                width: 20,
                height: 20,
                border: '2px solid #ff6b6b',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 10001,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 2,
                  height: 2,
                  backgroundColor: '#ff6b6b',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          )}

          {/* Style preview tooltip */}
          {pickerState.cursor && pickerState.targetElement && pickerState.previewStyle && (
            <div
              ref={previewRef}
              className="style-pipette-preview"
              style={{
                position: 'absolute',
                left: pickerState.cursor.x + 20,
                top: pickerState.cursor.y - 80,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                pointerEvents: 'none',
                zIndex: 10002,
                minWidth: 200,
              }}
            >
              <div className="style-preview-header">
                <Target size={16} />
                <span>Style Preview</span>
              </div>

              <div className="style-preview-content">
                {/* Element info */}
                <div className="style-preview-element-info">
                  <strong>{pickerState.targetElement.type}</strong>
                  {pickerState.targetElement.text && (
                    <span>: "{pickerState.targetElement.text}"</span>
                  )}
                </div>

                {/* Style swatch */}
                <div className="style-preview-swatch-container">
                  <div
                    className="style-preview-swatch"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: pickerState.previewStyle.fill || '#ffffff',
                      border: `${pickerState.previewStyle.strokeWidth || 1}px solid ${pickerState.previewStyle.stroke || '#000000'}`,
                      borderRadius: `${pickerState.previewStyle.cornerRadius || 0}px`,
                      opacity: pickerState.previewStyle.opacity || 1,
                    }}
                  />
                  <div className="style-preview-properties">
                    <div>Fill: {pickerState.previewStyle.fill || 'none'}</div>
                    <div>Stroke: {pickerState.previewStyle.stroke || 'none'}</div>
                    {pickerState.previewStyle.strokeWidth && (
                      <div>Width: {pickerState.previewStyle.strokeWidth}px</div>
                    )}
                  </div>
                </div>

                <div className="style-preview-action">
                  <Eye size={14} />
                  <span>Click to pick this style</span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div
            className="style-pipette-instructions"
            style={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 10003,
            }}
          >
            Hover over an element and click to pick its style • Press ESC to cancel
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for programmatic style picking
export const useStylePipette = () => {
  const [isActive, setIsActive] = useState(false);
  const [lastPickedStyle, setLastPickedStyle] = useState<{
    style: ElementStyle;
    sourceElement: DiagramElement;
  } | null>(null);

  const activate = useCallback(() => setIsActive(true), []);
  const deactivate = useCallback(() => setIsActive(false), []);
  const toggle = useCallback(() => setIsActive(prev => !prev), []);

  const handleStylePicked = useCallback((style: ElementStyle, sourceElement: DiagramElement) => {
    setLastPickedStyle({ style, sourceElement });
    setIsActive(false);
  }, []);

  return {
    isActive,
    activate,
    deactivate,
    toggle,
    lastPickedStyle,
    handleStylePicked,
  };
};

export default StylePipette;