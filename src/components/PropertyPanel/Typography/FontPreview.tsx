import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import type { ElementStyle } from '../../../types/diagram';
import './FontPreview.css';

interface FontPreviewProps {
  style: Partial<ElementStyle>;
  text?: string;
  showControls?: boolean;
  className?: string;
}

const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '1234567890 !@#$%^&*()',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Typography is the art and technique of arranging type.',
  'Pack my box with five dozen liquor jugs',
  'How vexingly quick daft zebras jump!'
];

export const FontPreview: React.FC<FontPreviewProps> = ({
  style,
  text = '',
  showControls = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [customText, setCustomText] = useState(text);
  const [useCustomText, setUseCustomText] = useState(!!text);

  const displayText = useCustomText ? customText : SAMPLE_TEXTS[currentSampleIndex];

  const previewStyle: React.CSSProperties = {
    fontFamily: style.fontFamily || 'Arial, sans-serif',
    fontSize: `${style.fontSize || 14}px`,
    fontWeight: style.fontWeight || 'normal',
    fontStyle: style.fontStyle || 'normal',
    textAlign: style.textAlign || 'left',
    textDecoration: style.textDecoration || 'none',
    textTransform: style.textTransform || 'none',
    lineHeight: style.lineHeight || 1.4,
    letterSpacing: style.letterSpacing || 'normal',
    wordSpacing: style.wordSpacing || 'normal',
    color: style.color || style.fill || '#000000',
    textShadow: style.textShadow || 'none'
  };

  const cycleSampleText = () => {
    setCurrentSampleIndex((prev) => (prev + 1) % SAMPLE_TEXTS.length);
  };

  const toggleCustomText = () => {
    setUseCustomText(!useCustomText);
    if (!useCustomText && !customText) {
      setCustomText(SAMPLE_TEXTS[currentSampleIndex]);
    }
  };

  return (
    <div className={`font-preview ${className}`}>
      {showControls && (
        <div className="preview-header">
          <label className="form-label">Font Preview</label>
          <div className="preview-controls">
            <button
              className="control-button"
              onClick={() => setIsVisible(!isVisible)}
              title={isVisible ? 'Hide Preview' : 'Show Preview'}
            >
              {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {!useCustomText && (
              <button
                className="control-button"
                onClick={cycleSampleText}
                title="Change Sample Text"
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button
              className={`control-button ${useCustomText ? 'active' : ''}`}
              onClick={toggleCustomText}
              title={useCustomText ? 'Use Sample Text' : 'Use Custom Text'}
            >
              Aa
            </button>
          </div>
        </div>
      )}

      {isVisible && (
        <div className="preview-container">
          {useCustomText && showControls && (
            <div className="custom-text-input">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom preview text..."
                className="custom-text-textarea"
                rows={2}
              />
            </div>
          )}

          <div className="preview-content">
            <div
              className="preview-text"
              style={previewStyle}
            >
              {displayText || 'Sample Text'}
            </div>
          </div>

          {showControls && (
            <div className="preview-info">
              <div className="font-info">
                <span className="info-item">
                  <strong>Family:</strong> {style.fontFamily?.split(',')[0] || 'Arial'}
                </span>
                <span className="info-item">
                  <strong>Size:</strong> {style.fontSize || 14}px
                </span>
                <span className="info-item">
                  <strong>Weight:</strong> {style.fontWeight || 'normal'}
                </span>
                {style.fontStyle !== 'normal' && (
                  <span className="info-item">
                    <strong>Style:</strong> {style.fontStyle}
                  </span>
                )}
              </div>
              {!useCustomText && (
                <div className="sample-counter">
                  Sample {currentSampleIndex + 1} of {SAMPLE_TEXTS.length}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FontPreview;