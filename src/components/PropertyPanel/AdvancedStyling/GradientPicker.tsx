import React, { useState, useCallback, useMemo } from 'react';
import { Plus, X, RotateCcw, Copy, Palette } from 'lucide-react';
import { ColorSwatch } from '../ColorPicker/ColorSwatch';
import ColorPicker from '../ColorPicker/ColorPicker';
import type { Gradient, GradientStop, LinearGradient, RadialGradient } from './types';
import { generateGradientCSS, GRADIENT_PRESETS } from './cssUtils';
import './GradientPicker.css';

interface GradientPickerProps {
  gradient: Gradient | null;
  onChange: (gradient: Gradient | null) => void;
  onClose?: () => void;
  className?: string;
}

interface GradientStopEditorProps {
  stop: GradientStop;
  index: number;
  isSelected: boolean;
  onUpdate: (index: number, stop: GradientStop) => void;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const GradientStopEditor: React.FC<GradientStopEditorProps> = ({
  stop,
  index,
  isSelected,
  onUpdate,
  onSelect,
  onRemove,
  canRemove,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = useCallback((color: string) => {
    onUpdate(index, { ...stop, color });
  }, [index, stop, onUpdate]);

  const handlePositionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const position = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
    onUpdate(index, { ...stop, position });
  }, [index, stop, onUpdate]);

  return (
    <div className={`gradient-stop ${isSelected ? 'gradient-stop--selected' : ''}`}>
      <div className="gradient-stop__controls">
        <ColorSwatch
          color={stop.color}
          size="small"
          onClick={() => setShowColorPicker(true)}
          title={`Color stop ${index + 1}: ${stop.color}`}
          className="gradient-stop__color"
        />

        <div className="gradient-stop__position">
          <input
            type="number"
            value={stop.position}
            onChange={handlePositionChange}
            min="0"
            max="100"
            step="1"
            className="gradient-stop__position-input"
            onClick={() => onSelect(index)}
          />
          <span className="gradient-stop__position-unit">%</span>
        </div>

        {canRemove && (
          <button
            type="button"
            className="gradient-stop__remove"
            onClick={() => onRemove(index)}
            aria-label={`Remove color stop ${index + 1}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showColorPicker && (
        <div className="gradient-stop__color-picker">
          <ColorPicker
            color={stop.color}
            onChange={handleColorChange}
            onClose={() => setShowColorPicker(false)}
            showAlpha={true}
            showRecent={true}
            title={`Stop ${index + 1} Color`}
          />
        </div>
      )}
    </div>
  );
};

interface GradientPreviewProps {
  gradient: Gradient;
  onClick?: () => void;
}

const GradientPreview: React.FC<GradientPreviewProps> = ({ gradient, onClick }) => {
  const cssGradient = generateGradientCSS(gradient);

  return (
    <div
      className="gradient-preview"
      style={{ background: cssGradient }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    />
  );
};

export const GradientPicker: React.FC<GradientPickerProps> = ({
  gradient,
  onChange,
  onClose,
  className = '',
}) => {
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [showPresets, setShowPresets] = useState(false);

  const currentGradient = useMemo(() => {
    return gradient || {
      type: 'linear' as const,
      direction: 45,
      stops: [
        { color: '#ff6b6b', position: 0 },
        { color: '#4ecdc4', position: 100 }
      ]
    };
  }, [gradient]);

  const handleTypeChange = useCallback((type: 'linear' | 'radial') => {
    if (type === 'linear') {
      const newGradient: LinearGradient = {
        type: 'linear',
        direction: 45,
        stops: currentGradient.stops
      };
      onChange(newGradient);
    } else {
      const newGradient: RadialGradient = {
        type: 'radial',
        shape: 'circle',
        size: 'farthest-corner',
        position: { x: 50, y: 50 },
        stops: currentGradient.stops
      };
      onChange(newGradient);
    }
  }, [currentGradient.stops, onChange]);

  const handleDirectionChange = useCallback((direction: number) => {
    if (currentGradient.type === 'linear') {
      onChange({
        ...currentGradient,
        direction
      });
    }
  }, [currentGradient, onChange]);

  const handleRadialPropertyChange = useCallback((property: keyof RadialGradient, value: any) => {
    if (currentGradient.type === 'radial') {
      onChange({
        ...currentGradient,
        [property]: value
      });
    }
  }, [currentGradient, onChange]);

  const handleStopUpdate = useCallback((index: number, stop: GradientStop) => {
    const newStops = [...currentGradient.stops];
    newStops[index] = stop;
    // Sort stops by position
    newStops.sort((a, b) => a.position - b.position);

    onChange({
      ...currentGradient,
      stops: newStops
    });
  }, [currentGradient, onChange]);

  const handleAddStop = useCallback(() => {
    const newPosition = 50; // Add in the middle by default
    const newStop: GradientStop = {
      color: '#ffffff',
      position: newPosition
    };

    const newStops = [...currentGradient.stops, newStop];
    newStops.sort((a, b) => a.position - b.position);

    onChange({
      ...currentGradient,
      stops: newStops
    });

    setSelectedStopIndex(newStops.findIndex(stop => stop === newStop));
  }, [currentGradient, onChange]);

  const handleRemoveStop = useCallback((index: number) => {
    if (currentGradient.stops.length <= 2) return;

    const newStops = currentGradient.stops.filter((_, i) => i !== index);
    onChange({
      ...currentGradient,
      stops: newStops
    });

    // Adjust selected index
    if (selectedStopIndex >= newStops.length) {
      setSelectedStopIndex(newStops.length - 1);
    }
  }, [currentGradient, onChange, selectedStopIndex]);

  const handlePresetSelect = useCallback((preset: Gradient) => {
    onChange(preset);
    setShowPresets(false);
  }, [onChange]);

  const handleReset = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleCopyCSS = useCallback(async () => {
    const css = generateGradientCSS(currentGradient);
    try {
      await navigator.clipboard.writeText(css);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  }, [currentGradient]);

  return (
    <div className={`gradient-picker ${className}`}>
      {/* Header */}
      <div className="gradient-picker__header">
        <h3 className="gradient-picker__title">Gradient Editor</h3>
        <div className="gradient-picker__actions">
          <button
            type="button"
            className="gradient-picker__action"
            onClick={() => setShowPresets(!showPresets)}
            title="Show presets"
          >
            <Palette size={16} />
          </button>
          <button
            type="button"
            className="gradient-picker__action"
            onClick={handleCopyCSS}
            title="Copy CSS"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="gradient-picker__action"
            onClick={handleReset}
            title="Reset to solid color"
          >
            <RotateCcw size={16} />
          </button>
          {onClose && (
            <button
              type="button"
              className="gradient-picker__close"
              onClick={onClose}
              aria-label="Close gradient picker"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="gradient-picker__preview">
        <GradientPreview gradient={currentGradient} />
      </div>

      {/* Type Selection */}
      <div className="gradient-picker__type">
        <label className="gradient-picker__label">Type</label>
        <div className="gradient-picker__type-buttons">
          <button
            type="button"
            className={`gradient-picker__type-button ${currentGradient.type === 'linear' ? 'active' : ''}`}
            onClick={() => handleTypeChange('linear')}
          >
            Linear
          </button>
          <button
            type="button"
            className={`gradient-picker__type-button ${currentGradient.type === 'radial' ? 'active' : ''}`}
            onClick={() => handleTypeChange('radial')}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Gradient Properties */}
      <div className="gradient-picker__properties">
        {currentGradient.type === 'linear' && (
          <div className="gradient-picker__property">
            <label className="gradient-picker__label">Direction</label>
            <div className="gradient-picker__direction">
              <input
                type="range"
                min="0"
                max="360"
                value={currentGradient.direction}
                onChange={(e) => handleDirectionChange(parseInt(e.target.value))}
                className="gradient-picker__direction-slider"
              />
              <input
                type="number"
                min="0"
                max="360"
                value={currentGradient.direction}
                onChange={(e) => handleDirectionChange(parseInt(e.target.value) || 0)}
                className="gradient-picker__direction-input"
              />
              <span className="gradient-picker__unit">°</span>
            </div>
          </div>
        )}

        {currentGradient.type === 'radial' && (
          <>
            <div className="gradient-picker__property">
              <label className="gradient-picker__label">Shape</label>
              <select
                value={currentGradient.shape}
                onChange={(e) => handleRadialPropertyChange('shape', e.target.value)}
                className="gradient-picker__select"
              >
                <option value="circle">Circle</option>
                <option value="ellipse">Ellipse</option>
              </select>
            </div>

            <div className="gradient-picker__property">
              <label className="gradient-picker__label">Size</label>
              <select
                value={currentGradient.size}
                onChange={(e) => handleRadialPropertyChange('size', e.target.value)}
                className="gradient-picker__select"
              >
                <option value="closest-side">Closest Side</option>
                <option value="closest-corner">Closest Corner</option>
                <option value="farthest-side">Farthest Side</option>
                <option value="farthest-corner">Farthest Corner</option>
              </select>
            </div>

            <div className="gradient-picker__property">
              <label className="gradient-picker__label">Position</label>
              <div className="gradient-picker__position">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentGradient.position.x}
                  onChange={(e) => handleRadialPropertyChange('position', {
                    ...currentGradient.position,
                    x: parseInt(e.target.value) || 0
                  })}
                  className="gradient-picker__position-input"
                />
                <span className="gradient-picker__unit">%</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentGradient.position.y}
                  onChange={(e) => handleRadialPropertyChange('position', {
                    ...currentGradient.position,
                    y: parseInt(e.target.value) || 0
                  })}
                  className="gradient-picker__position-input"
                />
                <span className="gradient-picker__unit">%</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Color Stops */}
      <div className="gradient-picker__stops">
        <div className="gradient-picker__stops-header">
          <label className="gradient-picker__label">Color Stops</label>
          <button
            type="button"
            className="gradient-picker__add-stop"
            onClick={handleAddStop}
            title="Add color stop"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="gradient-picker__stops-list">
          {currentGradient.stops.map((stop, index) => (
            <GradientStopEditor
              key={index}
              stop={stop}
              index={index}
              isSelected={selectedStopIndex === index}
              onUpdate={handleStopUpdate}
              onSelect={setSelectedStopIndex}
              onRemove={handleRemoveStop}
              canRemove={currentGradient.stops.length > 2}
            />
          ))}
        </div>
      </div>

      {/* Presets */}
      {showPresets && (
        <div className="gradient-picker__presets">
          <h4 className="gradient-picker__presets-title">Preset Gradients</h4>
          <div className="gradient-picker__presets-grid">
            {GRADIENT_PRESETS.map((preset, index) => (
              <GradientPreview
                key={index}
                gradient={preset}
                onClick={() => handlePresetSelect(preset)}
              />
            ))}
          </div>
        </div>
      )}

      {/* CSS Output */}
      <div className="gradient-picker__css">
        <label className="gradient-picker__label">CSS Output</label>
        <code className="gradient-picker__css-output">
          {generateGradientCSS(currentGradient)}
        </code>
      </div>
    </div>
  );
};

export default GradientPicker;