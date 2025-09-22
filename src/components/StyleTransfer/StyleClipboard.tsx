import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Clipboard, Check, X } from 'lucide-react';
import type { ElementStyle } from '../../types/diagram';

export interface CopiedStyle {
  style: ElementStyle;
  timestamp: number;
  sourceElementId?: string;
  sourceElementType?: string;
}

export interface StyleClipboardState {
  copiedStyle: CopiedStyle | null;
  isValid: boolean;
  age: number; // milliseconds since copied
}

interface StyleClipboardProps {
  onStyleCopy?: (style: CopiedStyle) => void;
  onStylePaste?: (style: ElementStyle) => void;
  className?: string;
}

/**
 * StyleClipboard - Manages copying and pasting of element styles
 * Provides a visual indicator of what style is currently copied
 */
export const StyleClipboard: React.FC<StyleClipboardProps> = ({
  onStyleCopy,
  onStylePaste,
  className = '',
}) => {
  const [clipboardState, setClipboardState] = useState<StyleClipboardState>({
    copiedStyle: null,
    isValid: false,
    age: 0,
  });

  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  // Update age periodically
  useEffect(() => {
    if (!clipboardState.copiedStyle) return;

    const interval = setInterval(() => {
      setClipboardState(prev => {
        if (!prev.copiedStyle) return prev;

        const age = Date.now() - prev.copiedStyle.timestamp;
        const isValid = age < 5 * 60 * 1000; // 5 minutes expiry

        return {
          ...prev,
          age,
          isValid,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [clipboardState.copiedStyle]);

  // Copy style to clipboard
  const copyStyle = useCallback((style: ElementStyle, sourceElementId?: string, sourceElementType?: string) => {
    const copiedStyle: CopiedStyle = {
      style: { ...style }, // Deep copy
      timestamp: Date.now(),
      sourceElementId,
      sourceElementType,
    };

    setClipboardState({
      copiedStyle,
      isValid: true,
      age: 0,
    });

    // Store in localStorage for persistence across sessions
    localStorage.setItem('openchart-style-clipboard', JSON.stringify(copiedStyle));

    // Show confirmation
    setShowCopyConfirmation(true);
    setTimeout(() => setShowCopyConfirmation(false), 1500);

    onStyleCopy?.(copiedStyle);
  }, [onStyleCopy]);

  // Paste style from clipboard
  const pasteStyle = useCallback(() => {
    if (!clipboardState.copiedStyle || !clipboardState.isValid) return;

    onStylePaste?.(clipboardState.copiedStyle.style);
  }, [clipboardState.copiedStyle, clipboardState.isValid, onStylePaste]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('openchart-style-clipboard');
    if (stored) {
      try {
        const copiedStyle = JSON.parse(stored) as CopiedStyle;
        const age = Date.now() - copiedStyle.timestamp;
        const isValid = age < 5 * 60 * 1000; // 5 minutes

        if (isValid) {
          setClipboardState({
            copiedStyle,
            isValid,
            age,
          });
        } else {
          localStorage.removeItem('openchart-style-clipboard');
        }
      } catch (error) {
        console.warn('Failed to load style clipboard from localStorage:', error);
        localStorage.removeItem('openchart-style-clipboard');
      }
    }
  }, []);

  // Clear clipboard
  const clearClipboard = useCallback(() => {
    setClipboardState({
      copiedStyle: null,
      isValid: false,
      age: 0,
    });
    localStorage.removeItem('openchart-style-clipboard');
  }, []);

  // Format age for display
  const formatAge = (age: number): string => {
    const seconds = Math.floor(age / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className={`style-clipboard ${className}`}>
      {/* Copy confirmation popup */}
      {showCopyConfirmation && (
        <div className="style-clipboard-confirmation">
          <Check size={16} />
          <span>Style copied!</span>
        </div>
      )}

      {/* Clipboard status */}
      {clipboardState.copiedStyle && (
        <div className={`style-clipboard-status ${clipboardState.isValid ? 'valid' : 'expired'}`}>
          <div className="style-clipboard-header">
            <Clipboard size={16} />
            <span>Style Clipboard</span>
            <button
              className="style-clipboard-clear"
              onClick={clearClipboard}
              title="Clear clipboard"
            >
              <X size={14} />
            </button>
          </div>

          <div className="style-clipboard-content">
            {/* Style preview */}
            <div className="style-preview">
              <div
                className="style-preview-swatch"
                style={{
                  backgroundColor: clipboardState.copiedStyle.style.fill || '#ffffff',
                  border: `${clipboardState.copiedStyle.style.strokeWidth || 1}px solid ${clipboardState.copiedStyle.style.stroke || '#000000'}`,
                  borderRadius: `${clipboardState.copiedStyle.style.cornerRadius || 0}px`,
                  opacity: clipboardState.copiedStyle.style.opacity || 1,
                }}
              />
              <div className="style-preview-info">
                <div className="style-preview-source">
                  From: {clipboardState.copiedStyle.sourceElementType || 'element'}
                </div>
                <div className="style-preview-age">
                  {formatAge(clipboardState.age)}
                </div>
              </div>
            </div>

            {/* Paste button */}
            <button
              className={`style-paste-button ${clipboardState.isValid ? 'enabled' : 'disabled'}`}
              onClick={pasteStyle}
              disabled={!clipboardState.isValid}
              title={clipboardState.isValid ? 'Paste style' : 'Style expired'}
            >
              Paste Style
            </button>
          </div>

          {/* Expiry warning */}
          {!clipboardState.isValid && (
            <div className="style-clipboard-expired">
              Style has expired. Copy a new style to continue.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for easy access to style clipboard functionality
export const useStyleClipboard = () => {
  const [clipboardState, setClipboardState] = useState<StyleClipboardState>({
    copiedStyle: null,
    isValid: false,
    age: 0,
  });

  const copyStyle = useCallback((style: ElementStyle, sourceElementId?: string, sourceElementType?: string) => {
    const copiedStyle: CopiedStyle = {
      style: { ...style },
      timestamp: Date.now(),
      sourceElementId,
      sourceElementType,
    };

    setClipboardState({
      copiedStyle,
      isValid: true,
      age: 0,
    });

    localStorage.setItem('openchart-style-clipboard', JSON.stringify(copiedStyle));

    return copiedStyle;
  }, []);

  const pasteStyle = useCallback((): ElementStyle | null => {
    if (!clipboardState.copiedStyle || !clipboardState.isValid) return null;
    return clipboardState.copiedStyle.style;
  }, [clipboardState]);

  const hasValidStyle = clipboardState.copiedStyle && clipboardState.isValid;

  return {
    clipboardState,
    copyStyle,
    pasteStyle,
    hasValidStyle,
  };
};

export default StyleClipboard;