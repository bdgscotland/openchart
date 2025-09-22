import React, { useState, useCallback } from 'react';
import { Plus, X, Copy, Eye, EyeOff, Layers } from 'lucide-react';
import { ColorSwatch } from '../ColorPicker/ColorSwatch';
import ColorPicker from '../ColorPicker/ColorPicker';
import type { BoxShadow } from './types';
import { generateShadowCSS, SHADOW_PRESETS } from './cssUtils';
import './ShadowControls.css';

interface ShadowControlsProps {
  shadows: BoxShadow[];
  onChange: (shadows: BoxShadow[]) => void;
  className?: string;
}

interface ShadowEditorProps {
  shadow: BoxShadow;
  index: number;
  isSelected: boolean;
  onUpdate: (index: number, shadow: BoxShadow) => void;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  canRemove: boolean;
}

const ShadowEditor: React.FC<ShadowEditorProps> = ({
  shadow,
  index,
  isSelected,
  onUpdate,
  onSelect,
  onRemove,
  onToggleVisibility,
  canRemove,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handlePropertyChange = useCallback((property: keyof BoxShadow, value: any) => {
    onUpdate(index, { ...shadow, [property]: value });
  }, [index, shadow, onUpdate]);

  const handleColorChange = useCallback((color: string) => {
    handlePropertyChange('color', color);
  }, [handlePropertyChange]);

  const handleToggleVisibility = useCallback(() => {
    setIsVisible(!isVisible);
    onToggleVisibility(index);
  }, [isVisible, index, onToggleVisibility]);

  return (
    <div
      className={`shadow-editor ${isSelected ? 'shadow-editor--selected' : ''} ${!isVisible ? 'shadow-editor--hidden' : ''}`}
      onClick={() => onSelect(index)}
    >
      {/* Header */}
      <div className="shadow-editor__header">
        <div className="shadow-editor__title">
          <Layers size={14} />
          <span>Shadow {index + 1}</span>
          {shadow.inset && <span className="shadow-editor__badge">Inset</span>}
        </div>
        <div className="shadow-editor__actions">
          <button
            type="button"
            className="shadow-editor__action"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVisibility();
            }}
            title={isVisible ? 'Hide shadow' : 'Show shadow'}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {canRemove && (
            <button
              type="button"
              className="shadow-editor__action shadow-editor__remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              title="Remove shadow"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="shadow-editor__controls">
        {/* Offset Controls */}
        <div className="shadow-editor__group">
          <label className="shadow-editor__label">Offset</label>
          <div className="shadow-editor__offset">
            <div className="shadow-editor__input-group">
              <label className="shadow-editor__input-label">X</label>
              <input
                type="number"
                value={shadow.offsetX}
                onChange={(e) => handlePropertyChange('offsetX', parseFloat(e.target.value) || 0)}
                className="shadow-editor__input"
                step="1"
              />
            </div>
            <div className="shadow-editor__input-group">
              <label className="shadow-editor__input-label">Y</label>
              <input
                type="number"
                value={shadow.offsetY}
                onChange={(e) => handlePropertyChange('offsetY', parseFloat(e.target.value) || 0)}
                className="shadow-editor__input"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Blur and Spread */}
        <div className="shadow-editor__group">
          <label className="shadow-editor__label">Blur & Spread</label>
          <div className="shadow-editor__blur-spread">
            <div className="shadow-editor__input-group">
              <label className="shadow-editor__input-label">Blur</label>
              <input
                type="number"
                value={shadow.blurRadius}
                onChange={(e) => handlePropertyChange('blurRadius', Math.max(0, parseFloat(e.target.value) || 0))}
                className="shadow-editor__input"
                min="0"
                step="1"
              />
            </div>
            <div className="shadow-editor__input-group">
              <label className="shadow-editor__input-label">Spread</label>
              <input
                type="number"
                value={shadow.spreadRadius}
                onChange={(e) => handlePropertyChange('spreadRadius', parseFloat(e.target.value) || 0)}
                className="shadow-editor__input"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Color */}
        <div className="shadow-editor__group">
          <label className="shadow-editor__label">Color</label>
          <div className="shadow-editor__color">
            <ColorSwatch
              color={shadow.color}
              size="medium"
              onClick={() => setShowColorPicker(true)}
              title={`Shadow color: ${shadow.color}`}
              className="shadow-editor__color-swatch"
            />
            <input
              type="text"
              value={shadow.color}
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="shadow-editor__color-input"
              placeholder="rgba(0,0,0,0.1)"
            />
          </div>
        </div>

        {/* Inset Toggle */}
        <div className="shadow-editor__group">
          <label className="shadow-editor__checkbox">
            <input
              type="checkbox"
              checked={shadow.inset}
              onChange={(e) => handlePropertyChange('inset', e.target.checked)}
              className="shadow-editor__checkbox-input"
            />
            <span className="shadow-editor__checkbox-label">Inset shadow</span>
          </label>
        </div>
      </div>

      {/* Color Picker Popup */}
      {showColorPicker && (
        <div className="shadow-editor__color-picker">
          <ColorPicker
            color={shadow.color}
            onChange={handleColorChange}
            onClose={() => setShowColorPicker(false)}
            showAlpha={true}
            showRecent={true}
            title={`Shadow ${index + 1} Color`}
          />
        </div>
      )}
    </div>
  );
};

interface ShadowPreviewProps {
  shadows: BoxShadow[];
}

const ShadowPreview: React.FC<ShadowPreviewProps> = ({ shadows }) => {
  const visibleShadows = shadows.filter((_, index) => shadows[index]);
  const shadowCSS = visibleShadows.length > 0 ? generateShadowCSS(visibleShadows) : 'none';

  return (
    <div className="shadow-preview">
      <div className="shadow-preview__background">
        <div
          className="shadow-preview__element"
          style={{ boxShadow: shadowCSS }}
        />
      </div>
    </div>
  );
};

export const ShadowControls: React.FC<ShadowControlsProps> = ({
  shadows,
  onChange,
  className = '',
}) => {
  const [selectedShadowIndex, setSelectedShadowIndex] = useState(0);
  const [showPresets, setShowPresets] = useState(false);

  const createShadowId = useCallback(() => {
    return `shadow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleAddShadow = useCallback(() => {
    const newShadow: BoxShadow = {
      id: createShadowId(),
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      spreadRadius: 0,
      color: 'rgba(0, 0, 0, 0.1)',
      inset: false
    };

    const newShadows = [...shadows, newShadow];
    onChange(newShadows);
    setSelectedShadowIndex(newShadows.length - 1);
  }, [shadows, onChange, createShadowId]);

  const handleUpdateShadow = useCallback((index: number, shadow: BoxShadow) => {
    const newShadows = [...shadows];
    newShadows[index] = shadow;
    onChange(newShadows);
  }, [shadows, onChange]);

  const handleRemoveShadow = useCallback((index: number) => {
    const newShadows = shadows.filter((_, i) => i !== index);
    onChange(newShadows);

    // Adjust selected index
    if (selectedShadowIndex >= newShadows.length) {
      setSelectedShadowIndex(Math.max(0, newShadows.length - 1));
    }
  }, [shadows, onChange, selectedShadowIndex]);

  const handleToggleVisibility = useCallback((index: number) => {
    // This would typically be handled by adding a visibility property to BoxShadow
    // For now, we'll just trigger a re-render
  }, []);

  const handlePresetSelect = useCallback((preset: BoxShadow) => {
    const newShadow = { ...preset, id: createShadowId() };
    const newShadows = [...shadows, newShadow];
    onChange(newShadows);
    setSelectedShadowIndex(newShadows.length - 1);
    setShowPresets(false);
  }, [shadows, onChange, createShadowId]);

  const handleCopyCSS = useCallback(async () => {
    const css = generateShadowCSS(shadows);
    try {
      await navigator.clipboard.writeText(`box-shadow: ${css};`);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  }, [shadows]);

  const handleClearAll = useCallback(() => {
    onChange([]);
    setSelectedShadowIndex(0);
  }, [onChange]);

  return (
    <div className={`shadow-controls ${className}`}>
      {/* Header */}
      <div className="shadow-controls__header">
        <h3 className="shadow-controls__title">Box Shadow</h3>
        <div className="shadow-controls__actions">
          <button
            type="button"
            className="shadow-controls__action"
            onClick={() => setShowPresets(!showPresets)}
            title="Show presets"
          >
            <Layers size={16} />
          </button>
          <button
            type="button"
            className="shadow-controls__action"
            onClick={handleCopyCSS}
            title="Copy CSS"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="shadow-controls__action"
            onClick={handleAddShadow}
            title="Add shadow"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <ShadowPreview shadows={shadows} />

      {/* Shadow List */}
      {shadows.length > 0 ? (
        <div className="shadow-controls__list">
          {shadows.map((shadow, index) => (
            <ShadowEditor
              key={shadow.id}
              shadow={shadow}
              index={index}
              isSelected={selectedShadowIndex === index}
              onUpdate={handleUpdateShadow}
              onSelect={setSelectedShadowIndex}
              onRemove={handleRemoveShadow}
              onToggleVisibility={handleToggleVisibility}
              canRemove={shadows.length > 1}
            />
          ))}

          <div className="shadow-controls__list-actions">
            <button
              type="button"
              className="shadow-controls__clear"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>
      ) : (
        <div className="shadow-controls__empty">
          <p>No shadows applied</p>
          <button
            type="button"
            className="shadow-controls__add-first"
            onClick={handleAddShadow}
          >
            Add Shadow
          </button>
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="shadow-controls__presets">
          <h4 className="shadow-controls__presets-title">Preset Shadows</h4>
          <div className="shadow-controls__presets-grid">
            {SHADOW_PRESETS.map((preset, index) => (
              <div
                key={index}
                className="shadow-controls__preset"
                onClick={() => handlePresetSelect(preset)}
              >
                <div
                  className="shadow-controls__preset-preview"
                  style={{ boxShadow: generateShadowCSS([preset]) }}
                />
                <span className="shadow-controls__preset-name">{preset.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Output */}
      {shadows.length > 0 && (
        <div className="shadow-controls__css">
          <label className="shadow-controls__css-label">CSS Output</label>
          <code className="shadow-controls__css-output">
            box-shadow: {generateShadowCSS(shadows)};
          </code>
        </div>
      )}
    </div>
  );
};

export default ShadowControls;