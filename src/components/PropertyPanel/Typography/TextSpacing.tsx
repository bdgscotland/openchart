import React, { useState } from 'react';
import './TextSpacing.css';

interface TextSpacingProps {
  lineHeight?: number | string;
  letterSpacing?: number | string;
  wordSpacing?: number | string;
  onLineHeightChange: (value: number | string) => void;
  onLetterSpacingChange: (value: number | string) => void;
  onWordSpacingChange: (value: number | string) => void;
  className?: string;
}

const LINE_HEIGHT_PRESETS = [
  { value: 1, label: '1.0' },
  { value: 1.15, label: '1.15' },
  { value: 1.2, label: '1.2' },
  { value: 1.4, label: '1.4' },
  { value: 1.5, label: '1.5' },
  { value: 1.6, label: '1.6' },
  { value: 2, label: '2.0' }
];

const LETTER_SPACING_PRESETS = [
  { value: 'normal', label: 'Normal' },
  { value: '-0.5px', label: 'Tight' },
  { value: '0.5px', label: 'Wide' },
  { value: '1px', label: 'Wider' },
  { value: '2px', label: 'Widest' }
];

export const TextSpacing: React.FC<TextSpacingProps> = ({
  lineHeight = 1.4,
  letterSpacing = 'normal',
  wordSpacing = 'normal',
  onLineHeightChange,
  onLetterSpacingChange,
  onWordSpacingChange,
  className = ''
}) => {
  const [lineHeightMode, setLineHeightMode] = useState<'presets' | 'custom'>('presets');
  const [letterSpacingMode, setLetterSpacingMode] = useState<'presets' | 'custom'>('presets');

  const handleLineHeightInput = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onLineHeightChange(numValue);
    }
  };

  const handleLetterSpacingInput = (value: string) => {
    if (value === '' || value === 'normal') {
      onLetterSpacingChange('normal');
    } else {
      // Allow px, em, rem units
      const match = value.match(/^(-?\d*\.?\d+)(px|em|rem)?$/);
      if (match) {
        const unit = match[2] || 'px';
        onLetterSpacingChange(`${match[1]}${unit}`);
      }
    }
  };

  const handleWordSpacingInput = (value: string) => {
    if (value === '' || value === 'normal') {
      onWordSpacingChange('normal');
    } else {
      const match = value.match(/^(-?\d*\.?\d+)(px|em|rem)?$/);
      if (match) {
        const unit = match[2] || 'px';
        onWordSpacingChange(`${match[1]}${unit}`);
      }
    }
  };

  const getCurrentLineHeight = () => {
    return typeof lineHeight === 'number' ? lineHeight.toString() : lineHeight;
  };

  const getCurrentLetterSpacing = () => {
    return typeof letterSpacing === 'string' ? letterSpacing : `${letterSpacing}px`;
  };

  const getCurrentWordSpacing = () => {
    return typeof wordSpacing === 'string' ? wordSpacing : `${wordSpacing}px`;
  };

  return (
    <div className={`text-spacing ${className}`}>
      {/* Line Height */}
      <div className="spacing-group">
        <div className="spacing-header">
          <label className="form-label">Line Height</label>
          <div className="mode-toggle">
            <button
              className={`mode-button ${lineHeightMode === 'presets' ? 'active' : ''}`}
              onClick={() => setLineHeightMode('presets')}
            >
              Presets
            </button>
            <button
              className={`mode-button ${lineHeightMode === 'custom' ? 'active' : ''}`}
              onClick={() => setLineHeightMode('custom')}
            >
              Custom
            </button>
          </div>
        </div>

        {lineHeightMode === 'presets' ? (
          <div className="preset-buttons">
            {LINE_HEIGHT_PRESETS.map(preset => (
              <button
                key={preset.value}
                className={`preset-button ${lineHeight === preset.value ? 'active' : ''}`}
                onClick={() => onLineHeightChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="custom-input-container">
            <input
              type="number"
              value={getCurrentLineHeight()}
              onChange={(e) => handleLineHeightInput(e.target.value)}
              min="0.5"
              max="5"
              step="0.1"
              className="spacing-input"
              placeholder="1.4"
            />
            <span className="input-hint">Unitless multiplier</span>
          </div>
        )}
      </div>

      {/* Letter Spacing */}
      <div className="spacing-group">
        <div className="spacing-header">
          <label className="form-label">Letter Spacing</label>
          <div className="mode-toggle">
            <button
              className={`mode-button ${letterSpacingMode === 'presets' ? 'active' : ''}`}
              onClick={() => setLetterSpacingMode('presets')}
            >
              Presets
            </button>
            <button
              className={`mode-button ${letterSpacingMode === 'custom' ? 'active' : ''}`}
              onClick={() => setLetterSpacingMode('custom')}
            >
              Custom
            </button>
          </div>
        </div>

        {letterSpacingMode === 'presets' ? (
          <div className="preset-buttons">
            {LETTER_SPACING_PRESETS.map(preset => (
              <button
                key={preset.value}
                className={`preset-button ${letterSpacing === preset.value ? 'active' : ''}`}
                onClick={() => onLetterSpacingChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="custom-input-container">
            <input
              type="text"
              value={getCurrentLetterSpacing()}
              onChange={(e) => handleLetterSpacingInput(e.target.value)}
              className="spacing-input"
              placeholder="normal or 1px"
            />
            <span className="input-hint">px, em, rem, or 'normal'</span>
          </div>
        )}
      </div>

      {/* Word Spacing */}
      <div className="spacing-group">
        <label className="form-label">Word Spacing</label>
        <div className="custom-input-container">
          <input
            type="text"
            value={getCurrentWordSpacing()}
            onChange={(e) => handleWordSpacingInput(e.target.value)}
            className="spacing-input"
            placeholder="normal or 2px"
          />
          <span className="input-hint">px, em, rem, or 'normal'</span>
        </div>
      </div>
    </div>
  );
};

export default TextSpacing;