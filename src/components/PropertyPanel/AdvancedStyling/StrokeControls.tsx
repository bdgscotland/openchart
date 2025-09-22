import React, { useState, useCallback } from 'react';
import { Copy, RefreshCw, PenTool } from 'lucide-react';
import { ColorSwatch } from '../ColorPicker/ColorSwatch';
import ColorPicker from '../ColorPicker/ColorPicker';
import type { StrokeStyle } from './types';
import { generateStrokeCSS, STROKE_PATTERNS } from './cssUtils';
import './StrokeControls.css';

interface StrokeControlsProps {
  stroke: StrokeStyle;
  onChange: (stroke: StrokeStyle) => void;
  className?: string;
}

interface StrokePreviewProps {
  stroke: StrokeStyle;
}

const StrokePreview: React.FC<StrokePreviewProps> = ({ stroke }) => {
  const strokeCSS = generateStrokeCSS(stroke);

  return (
    <div className="stroke-preview">
      <div className="stroke-preview__background">
        <svg
          className="stroke-preview__svg"
          viewBox="0 0 120 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Demo path with curves */}
          <path
            d="M 10 40 Q 40 10 70 40 Q 100 70 110 40"
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeDasharray={stroke.dashArray?.join(' ') || 'none'}
            strokeDashoffset={stroke.dashOffset || 0}
            strokeLinecap={stroke.lineCap}
            strokeLinejoin={stroke.lineJoin}
            strokeMiterlimit={stroke.miterLimit || 4}
          />

          {/* Demo line for cap styles */}
          <line
            x1="20"
            y1="60"
            x2="100"
            y2="60"
            stroke={stroke.color}
            strokeWidth={Math.max(4, stroke.width)}
            strokeLinecap={stroke.lineCap}
            opacity="0.7"
          />

          {/* Demo join styles */}
          <path
            d="M 10 20 L 30 30 L 10 40"
            fill="none"
            stroke={stroke.color}
            strokeWidth={Math.max(3, stroke.width)}
            strokeLinejoin={stroke.lineJoin}
            strokeMiterlimit={stroke.miterLimit || 4}
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
};

interface DashPatternEditorProps {
  dashArray: number[];
  onDashArrayChange: (dashArray: number[]) => void;
}

const DashPatternEditor: React.FC<DashPatternEditorProps> = ({
  dashArray,
  onDashArrayChange,
}) => {
  const [customPattern, setCustomPattern] = useState('');

  const handlePresetSelect = useCallback((pattern: number[]) => {
    onDashArrayChange(pattern);
  }, [onDashArrayChange]);

  const handleCustomPatternChange = useCallback((value: string) => {
    setCustomPattern(value);

    // Parse comma or space separated numbers
    const numbers = value
      .split(/[,\s]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n) && n >= 0);

    if (numbers.length > 0) {
      onDashArrayChange(numbers);
    }
  }, [onDashArrayChange]);

  const currentPatternString = dashArray.join(', ');

  return (
    <div className="dash-pattern-editor">
      <div className="dash-pattern-editor__presets">
        <label className="dash-pattern-editor__label">Pattern Presets</label>
        <div className="dash-pattern-editor__preset-grid">
          {STROKE_PATTERNS.map((preset, index) => (
            <button
              key={index}
              type="button"
              className={`dash-pattern-editor__preset ${
                preset.dashArray.join(',') === dashArray.join(',') ? 'active' : ''
              }`}
              onClick={() => handlePresetSelect(preset.dashArray)}
              title={preset.name}
            >
              <svg
                className="dash-pattern-editor__preset-svg"
                viewBox="0 0 40 8"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="2"
                  y1="4"
                  x2="38"
                  y2="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={preset.dashArray.join(' ') || 'none'}
                />
              </svg>
              <span className="dash-pattern-editor__preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dash-pattern-editor__custom">
        <label className="dash-pattern-editor__label">Custom Pattern</label>
        <input
          type="text"
          value={customPattern || currentPatternString}
          onChange={(e) => handleCustomPatternChange(e.target.value)}
          placeholder="e.g., 5, 3, 2, 3"
          className="dash-pattern-editor__input"
        />
        <small className="dash-pattern-editor__hint">
          Enter dash and gap lengths separated by commas
        </small>
      </div>
    </div>
  );
};

export const StrokeControls: React.FC<StrokeControlsProps> = ({
  stroke,
  onChange,
  className = '',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPatternEditor, setShowPatternEditor] = useState(false);

  const handlePropertyChange = useCallback((property: keyof StrokeStyle, value: any) => {
    onChange({
      ...stroke,
      [property]: value,
    });
  }, [stroke, onChange]);

  const handleColorChange = useCallback((color: string) => {
    handlePropertyChange('color', color);
  }, [handlePropertyChange]);

  const handleDashArrayChange = useCallback((dashArray: number[]) => {
    handlePropertyChange('dashArray', dashArray.length > 0 ? dashArray : undefined);
  }, [handlePropertyChange]);

  const handleCopyCSS = useCallback(async () => {
    const cssProperties = generateStrokeCSS(stroke);
    const css = Object.entries(cssProperties)
      .map(([prop, value]) => `${prop}: ${value};`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(css);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  }, [stroke]);

  const handleReset = useCallback(() => {
    onChange({
      width: 2,
      color: '#000000',
      lineCap: 'butt',
      lineJoin: 'miter',
    });
  }, [onChange]);

  return (
    <div className={`stroke-controls ${className}`}>
      {/* Header */}
      <div className="stroke-controls__header">
        <h3 className="stroke-controls__title">Stroke Style</h3>
        <div className="stroke-controls__actions">
          <button
            type="button"
            className="stroke-controls__action"
            onClick={handleCopyCSS}
            title="Copy CSS"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="stroke-controls__action"
            onClick={handleReset}
            title="Reset to defaults"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <StrokePreview stroke={stroke} />

      {/* Controls */}
      <div className="stroke-controls__controls">
        {/* Width */}
        <div className="stroke-controls__group">
          <label className="stroke-controls__label">Width</label>
          <div className="stroke-controls__width">
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={stroke.width}
              onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
              className="stroke-controls__width-slider"
            />
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={stroke.width}
              onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value) || 0)}
              className="stroke-controls__width-input"
            />
            <span className="stroke-controls__unit">px</span>
          </div>
        </div>

        {/* Color */}
        <div className="stroke-controls__group">
          <label className="stroke-controls__label">Color</label>
          <div className="stroke-controls__color">
            <ColorSwatch
              color={stroke.color}
              size="medium"
              onClick={() => setShowColorPicker(true)}
              title={`Stroke color: ${stroke.color}`}
              className="stroke-controls__color-swatch"
            />
            <input
              type="text"
              value={stroke.color}
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="stroke-controls__color-input"
              placeholder="#000000"
            />
          </div>

          {showColorPicker && (
            <div className="stroke-controls__color-picker">
              <ColorPicker
                color={stroke.color}
                onChange={handleColorChange}
                onClose={() => setShowColorPicker(false)}
                showAlpha={true}
                showRecent={true}
                title="Stroke Color"
              />
            </div>
          )}
        </div>

        {/* Line Cap */}
        <div className="stroke-controls__group">
          <label className="stroke-controls__label">Line Cap</label>
          <div className="stroke-controls__cap-buttons">
            {(['butt', 'round', 'square'] as const).map((cap) => (
              <button
                key={cap}
                type="button"
                className={`stroke-controls__cap-button ${stroke.lineCap === cap ? 'active' : ''}`}
                onClick={() => handlePropertyChange('lineCap', cap)}
                title={cap.charAt(0).toUpperCase() + cap.slice(1)}
              >
                <svg
                  className="stroke-controls__cap-preview"
                  viewBox="0 0 40 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="8"
                    y1="6"
                    x2="32"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap={cap}
                  />
                </svg>
                <span className="stroke-controls__cap-name">{cap}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Line Join */}
        <div className="stroke-controls__group">
          <label className="stroke-controls__label">Line Join</label>
          <div className="stroke-controls__join-buttons">
            {(['miter', 'round', 'bevel'] as const).map((join) => (
              <button
                key={join}
                type="button"
                className={`stroke-controls__join-button ${stroke.lineJoin === join ? 'active' : ''}`}
                onClick={() => handlePropertyChange('lineJoin', join)}
                title={join.charAt(0).toUpperCase() + join.slice(1)}
              >
                <svg
                  className="stroke-controls__join-preview"
                  viewBox="0 0 24 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 4 16 L 12 4 L 20 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin={join}
                    strokeMiterlimit={stroke.miterLimit || 4}
                  />
                </svg>
                <span className="stroke-controls__join-name">{join}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Miter Limit (only for miter join) */}
        {stroke.lineJoin === 'miter' && (
          <div className="stroke-controls__group">
            <label className="stroke-controls__label">Miter Limit</label>
            <div className="stroke-controls__miter">
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={stroke.miterLimit || 4}
                onChange={(e) => handlePropertyChange('miterLimit', parseFloat(e.target.value))}
                className="stroke-controls__miter-slider"
              />
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={stroke.miterLimit || 4}
                onChange={(e) => handlePropertyChange('miterLimit', parseFloat(e.target.value) || 4)}
                className="stroke-controls__miter-input"
              />
            </div>
          </div>
        )}

        {/* Dash Pattern */}
        <div className="stroke-controls__group">
          <div className="stroke-controls__pattern-header">
            <label className="stroke-controls__label">Dash Pattern</label>
            <button
              type="button"
              className={`stroke-controls__pattern-toggle ${showPatternEditor ? 'active' : ''}`}
              onClick={() => setShowPatternEditor(!showPatternEditor)}
              title="Toggle pattern editor"
            >
              <PenTool size={14} />
            </button>
          </div>

          {showPatternEditor && (
            <DashPatternEditor
              dashArray={stroke.dashArray || []}
              onDashArrayChange={handleDashArrayChange}
            />
          )}
        </div>

        {/* Dash Offset (only when dash pattern is set) */}
        {stroke.dashArray && stroke.dashArray.length > 0 && (
          <div className="stroke-controls__group">
            <label className="stroke-controls__label">Dash Offset</label>
            <div className="stroke-controls__offset">
              <input
                type="range"
                min="-20"
                max="20"
                step="0.5"
                value={stroke.dashOffset || 0}
                onChange={(e) => handlePropertyChange('dashOffset', parseFloat(e.target.value))}
                className="stroke-controls__offset-slider"
              />
              <input
                type="number"
                min="-20"
                max="20"
                step="0.5"
                value={stroke.dashOffset || 0}
                onChange={(e) => handlePropertyChange('dashOffset', parseFloat(e.target.value) || 0)}
                className="stroke-controls__offset-input"
              />
              <span className="stroke-controls__unit">px</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS Output */}
      <div className="stroke-controls__css">
        <label className="stroke-controls__css-label">SVG Stroke CSS</label>
        <code className="stroke-controls__css-output">
          {Object.entries(generateStrokeCSS(stroke))
            .map(([prop, value]) => `${prop}: ${value};`)
            .join('\n')}
        </code>
      </div>
    </div>
  );
};

export default StrokeControls;