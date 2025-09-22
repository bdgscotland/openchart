import React, { useState, useCallback } from 'react';
import { Link, Unlink, Copy, Square, Circle } from 'lucide-react';
import { ColorSwatch } from '../ColorPicker/ColorSwatch';
import ColorPicker from '../ColorPicker/ColorPicker';
import type { BorderStyle } from './types';
import { generateBorderCSS } from './cssUtils';
import './BorderControls.css';

interface BorderControlsProps {
  border: BorderStyle;
  onChange: (border: BorderStyle) => void;
  className?: string;
}

interface CornerRadiusControlProps {
  radius: BorderStyle['radius'];
  linked: boolean;
  onRadiusChange: (radius: BorderStyle['radius']) => void;
  onLinkedChange: (linked: boolean) => void;
}

const CornerRadiusControl: React.FC<CornerRadiusControlProps> = ({
  radius,
  linked,
  onRadiusChange,
  onLinkedChange,
}) => {
  const handleUniformChange = useCallback((value: number) => {
    if (linked) {
      onRadiusChange({
        topLeft: value,
        topRight: value,
        bottomLeft: value,
        bottomRight: value,
      });
    }
  }, [linked, onRadiusChange]);

  const handleIndividualChange = useCallback((corner: keyof NonNullable<BorderStyle['radius']>, value: number) => {
    if (!radius) return;

    onRadiusChange({
      ...radius,
      [corner]: value,
    });
  }, [radius, onRadiusChange]);

  const currentRadius = radius || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
  const uniformValue = linked ? currentRadius.topLeft : 0;

  return (
    <div className="corner-radius-control">
      <div className="corner-radius-control__header">
        <label className="corner-radius-control__label">Corner Radius</label>
        <button
          type="button"
          className={`corner-radius-control__link ${linked ? 'linked' : 'unlinked'}`}
          onClick={() => onLinkedChange(!linked)}
          title={linked ? 'Unlink corners' : 'Link corners'}
        >
          {linked ? <Link size={14} /> : <Unlink size={14} />}
        </button>
      </div>

      {linked ? (
        <div className="corner-radius-control__uniform">
          <input
            type="number"
            value={uniformValue}
            onChange={(e) => handleUniformChange(parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            className="corner-radius-control__input"
          />
          <span className="corner-radius-control__unit">px</span>
        </div>
      ) : (
        <div className="corner-radius-control__individual">
          <div className="corner-radius-control__grid">
            <div className="corner-radius-control__corner corner-tl">
              <label className="corner-radius-control__corner-label">TL</label>
              <input
                type="number"
                value={currentRadius.topLeft}
                onChange={(e) => handleIndividualChange('topLeft', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                className="corner-radius-control__corner-input"
              />
            </div>
            <div className="corner-radius-control__corner corner-tr">
              <label className="corner-radius-control__corner-label">TR</label>
              <input
                type="number"
                value={currentRadius.topRight}
                onChange={(e) => handleIndividualChange('topRight', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                className="corner-radius-control__corner-input"
              />
            </div>
            <div className="corner-radius-control__corner corner-bl">
              <label className="corner-radius-control__corner-label">BL</label>
              <input
                type="number"
                value={currentRadius.bottomLeft}
                onChange={(e) => handleIndividualChange('bottomLeft', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                className="corner-radius-control__corner-input"
              />
            </div>
            <div className="corner-radius-control__corner corner-br">
              <label className="corner-radius-control__corner-label">BR</label>
              <input
                type="number"
                value={currentRadius.bottomRight}
                onChange={(e) => handleIndividualChange('bottomRight', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                className="corner-radius-control__corner-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface BorderPreviewProps {
  border: BorderStyle;
}

const BorderPreview: React.FC<BorderPreviewProps> = ({ border }) => {
  const borderCSS = generateBorderCSS(border);
  const style = {
    ...borderCSS,
    width: '120px',
    height: '80px',
    background: '#ffffff',
  };

  // Convert kebab-case to camelCase for React style object
  const reactStyle = Object.entries(style).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {} as any);

  return (
    <div className="border-preview">
      <div className="border-preview__background">
        <div className="border-preview__element" style={reactStyle} />
      </div>
    </div>
  );
};

const BORDER_STYLES = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
] as const;

const PRESET_BORDERS: BorderStyle[] = [
  { width: 1, style: 'solid', color: '#000000' },
  { width: 2, style: 'solid', color: '#3b82f6' },
  { width: 3, style: 'dashed', color: '#ef4444' },
  { width: 2, style: 'dotted', color: '#10b981' },
  { width: 4, style: 'double', color: '#8b5cf6' },
  {
    width: 2,
    style: 'solid',
    color: '#f59e0b',
    radius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }
  },
];

export const BorderControls: React.FC<BorderControlsProps> = ({
  border,
  onChange,
  className = '',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [cornersLinked, setCornersLinked] = useState(true);

  const handlePropertyChange = useCallback((property: keyof BorderStyle, value: any) => {
    onChange({
      ...border,
      [property]: value,
    });
  }, [border, onChange]);

  const handleColorChange = useCallback((color: string) => {
    handlePropertyChange('color', color);
  }, [handlePropertyChange]);

  const handleRadiusChange = useCallback((radius: BorderStyle['radius']) => {
    handlePropertyChange('radius', radius);
  }, [handlePropertyChange]);

  const handlePresetSelect = useCallback((preset: BorderStyle) => {
    onChange(preset);
    setShowPresets(false);

    // Check if all corners are the same for linked state
    if (preset.radius) {
      const { topLeft, topRight, bottomLeft, bottomRight } = preset.radius;
      setCornersLinked(topLeft === topRight && topRight === bottomLeft && bottomLeft === bottomRight);
    }
  }, [onChange]);

  const handleCopyCSS = useCallback(async () => {
    const cssProperties = generateBorderCSS(border);
    const css = Object.entries(cssProperties)
      .map(([prop, value]) => `${prop}: ${value};`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(css);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  }, [border]);

  const handleReset = useCallback(() => {
    onChange({
      width: 1,
      style: 'solid',
      color: '#000000',
    });
    setCornersLinked(true);
  }, [onChange]);

  return (
    <div className={`border-controls ${className}`}>
      {/* Header */}
      <div className="border-controls__header">
        <h3 className="border-controls__title">Border Style</h3>
        <div className="border-controls__actions">
          <button
            type="button"
            className="border-controls__action"
            onClick={() => setShowPresets(!showPresets)}
            title="Show presets"
          >
            <Square size={16} />
          </button>
          <button
            type="button"
            className="border-controls__action"
            onClick={handleCopyCSS}
            title="Copy CSS"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <BorderPreview border={border} />

      {/* Controls */}
      <div className="border-controls__controls">
        {/* Width */}
        <div className="border-controls__group">
          <label className="border-controls__label">Width</label>
          <div className="border-controls__width">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={border.width}
              onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
              className="border-controls__width-slider"
            />
            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={border.width}
              onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value) || 0)}
              className="border-controls__width-input"
            />
            <span className="border-controls__unit">px</span>
          </div>
        </div>

        {/* Style */}
        <div className="border-controls__group">
          <label className="border-controls__label">Style</label>
          <div className="border-controls__style-grid">
            {BORDER_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                className={`border-controls__style-button ${border.style === style ? 'active' : ''}`}
                onClick={() => handlePropertyChange('style', style)}
                title={style.charAt(0).toUpperCase() + style.slice(1)}
              >
                <div
                  className="border-controls__style-preview"
                  style={{
                    borderTop: `3px ${style} currentColor`,
                  }}
                />
                <span className="border-controls__style-name">{style}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="border-controls__group">
          <label className="border-controls__label">Color</label>
          <div className="border-controls__color">
            <ColorSwatch
              color={border.color}
              size="medium"
              onClick={() => setShowColorPicker(true)}
              title={`Border color: ${border.color}`}
              className="border-controls__color-swatch"
            />
            <input
              type="text"
              value={border.color}
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="border-controls__color-input"
              placeholder="#000000"
            />
          </div>

          {showColorPicker && (
            <div className="border-controls__color-picker">
              <ColorPicker
                color={border.color}
                onChange={handleColorChange}
                onClose={() => setShowColorPicker(false)}
                showAlpha={true}
                showRecent={true}
                title="Border Color"
              />
            </div>
          )}
        </div>

        {/* Corner Radius */}
        <CornerRadiusControl
          radius={border.radius}
          linked={cornersLinked}
          onRadiusChange={handleRadiusChange}
          onLinkedChange={setCornersLinked}
        />
      </div>

      {/* Presets */}
      {showPresets && (
        <div className="border-controls__presets">
          <h4 className="border-controls__presets-title">Preset Borders</h4>
          <div className="border-controls__presets-grid">
            {PRESET_BORDERS.map((preset, index) => {
              const previewStyle = generateBorderCSS(preset);
              const reactStyle = Object.entries(previewStyle).reduce((acc, [key, value]) => {
                const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
                acc[camelKey] = value;
                return acc;
              }, {} as any);

              return (
                <div
                  key={index}
                  className="border-controls__preset"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div
                    className="border-controls__preset-preview"
                    style={reactStyle}
                  />
                  <span className="border-controls__preset-name">
                    {preset.width}px {preset.style}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS Output */}
      <div className="border-controls__css">
        <label className="border-controls__css-label">CSS Output</label>
        <code className="border-controls__css-output">
          {Object.entries(generateBorderCSS(border))
            .map(([prop, value]) => `${prop}: ${value};`)
            .join('\n')}
        </code>
      </div>
    </div>
  );
};

export default BorderControls;