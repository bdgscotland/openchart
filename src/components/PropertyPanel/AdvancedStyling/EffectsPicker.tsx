import React, { useState, useCallback } from 'react';
import { Plus, X, Copy, Eye, EyeOff, Zap, RotateCcw } from 'lucide-react';
import type { FilterEffect, Transform } from './types';
import { generateFilterCSS, generateTransformCSS } from './cssUtils';
import './EffectsPicker.css';

interface EffectsPickerProps {
  filters: FilterEffect[];
  transforms: Transform[];
  onFiltersChange: (filters: FilterEffect[]) => void;
  onTransformsChange: (transforms: Transform[]) => void;
  className?: string;
}

interface FilterEditorProps {
  filter: FilterEffect;
  index: number;
  onUpdate: (index: number, filter: FilterEffect) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const FilterEditor: React.FC<FilterEditorProps> = ({
  filter,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const handleTypeChange = useCallback((type: FilterEffect['type']) => {
    let defaultValue = 0;
    let unit = '';

    switch (type) {
      case 'blur':
        defaultValue = 5;
        unit = 'px';
        break;
      case 'brightness':
      case 'contrast':
      case 'grayscale':
      case 'invert':
      case 'opacity':
      case 'saturate':
      case 'sepia':
        defaultValue = 100;
        unit = '%';
        break;
      case 'hue-rotate':
        defaultValue = 0;
        unit = 'deg';
        break;
      case 'drop-shadow':
        defaultValue = 5;
        unit = 'px';
        break;
    }

    onUpdate(index, { type, value: defaultValue, unit });
  }, [index, onUpdate]);

  const handleValueChange = useCallback((value: number) => {
    onUpdate(index, { ...filter, value });
  }, [index, filter, onUpdate]);

  const getFilterConfig = (type: FilterEffect['type']) => {
    switch (type) {
      case 'blur':
        return { min: 0, max: 50, step: 1, unit: 'px', defaultValue: 5 };
      case 'brightness':
        return { min: 0, max: 300, step: 5, unit: '%', defaultValue: 100 };
      case 'contrast':
        return { min: 0, max: 300, step: 5, unit: '%', defaultValue: 100 };
      case 'grayscale':
        return { min: 0, max: 100, step: 5, unit: '%', defaultValue: 0 };
      case 'hue-rotate':
        return { min: 0, max: 360, step: 5, unit: 'deg', defaultValue: 0 };
      case 'invert':
        return { min: 0, max: 100, step: 5, unit: '%', defaultValue: 0 };
      case 'opacity':
        return { min: 0, max: 100, step: 5, unit: '%', defaultValue: 100 };
      case 'saturate':
        return { min: 0, max: 300, step: 5, unit: '%', defaultValue: 100 };
      case 'sepia':
        return { min: 0, max: 100, step: 5, unit: '%', defaultValue: 0 };
      case 'drop-shadow':
        return { min: 0, max: 50, step: 1, unit: 'px', defaultValue: 5 };
      default:
        return { min: 0, max: 100, step: 1, unit: '', defaultValue: 0 };
    }
  };

  const config = getFilterConfig(filter.type);

  return (
    <div className="filter-editor">
      <div className="filter-editor__header">
        <select
          value={filter.type}
          onChange={(e) => handleTypeChange(e.target.value as FilterEffect['type'])}
          className="filter-editor__type-select"
        >
          <option value="blur">Blur</option>
          <option value="brightness">Brightness</option>
          <option value="contrast">Contrast</option>
          <option value="drop-shadow">Drop Shadow</option>
          <option value="grayscale">Grayscale</option>
          <option value="hue-rotate">Hue Rotate</option>
          <option value="invert">Invert</option>
          <option value="opacity">Opacity</option>
          <option value="saturate">Saturate</option>
          <option value="sepia">Sepia</option>
        </select>

        {canRemove && (
          <button
            type="button"
            className="filter-editor__remove"
            onClick={() => onRemove(index)}
            title="Remove filter"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="filter-editor__controls">
        <div className="filter-editor__slider-container">
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={filter.value}
            onChange={(e) => handleValueChange(parseFloat(e.target.value))}
            className="filter-editor__slider"
          />
          <div className="filter-editor__value">
            <input
              type="number"
              min={config.min}
              max={config.max}
              step={config.step}
              value={filter.value}
              onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
              className="filter-editor__value-input"
            />
            <span className="filter-editor__unit">{config.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransformEditorProps {
  transform: Transform;
  index: number;
  onUpdate: (index: number, transform: Transform) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const TransformEditor: React.FC<TransformEditorProps> = ({
  transform,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const handleTypeChange = useCallback((type: Transform['type']) => {
    let defaultTransform: Transform;

    switch (type) {
      case 'translate':
        defaultTransform = { type, x: 0, y: 0 };
        break;
      case 'rotate':
        defaultTransform = { type, angle: 0 };
        break;
      case 'scale':
        defaultTransform = { type, scaleX: 1, scaleY: 1 };
        break;
      case 'skew':
        defaultTransform = { type, x: 0, y: 0 };
        break;
      default:
        defaultTransform = { type: 'translate', x: 0, y: 0 };
    }

    onUpdate(index, defaultTransform);
  }, [index, onUpdate]);

  const handlePropertyChange = useCallback((property: string, value: number) => {
    onUpdate(index, { ...transform, [property]: value });
  }, [index, transform, onUpdate]);

  const renderControls = () => {
    switch (transform.type) {
      case 'translate':
        return (
          <div className="transform-editor__translate">
            <div className="transform-editor__input-group">
              <label className="transform-editor__input-label">X</label>
              <input
                type="number"
                value={transform.x || 0}
                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value) || 0)}
                className="transform-editor__input"
                step="1"
              />
              <span className="transform-editor__unit">px</span>
            </div>
            <div className="transform-editor__input-group">
              <label className="transform-editor__input-label">Y</label>
              <input
                type="number"
                value={transform.y || 0}
                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value) || 0)}
                className="transform-editor__input"
                step="1"
              />
              <span className="transform-editor__unit">px</span>
            </div>
          </div>
        );

      case 'rotate':
        return (
          <div className="transform-editor__rotate">
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={transform.angle || 0}
              onChange={(e) => handlePropertyChange('angle', parseFloat(e.target.value))}
              className="transform-editor__slider"
            />
            <div className="transform-editor__value">
              <input
                type="number"
                min="-180"
                max="180"
                step="1"
                value={transform.angle || 0}
                onChange={(e) => handlePropertyChange('angle', parseFloat(e.target.value) || 0)}
                className="transform-editor__value-input"
              />
              <span className="transform-editor__unit">°</span>
            </div>
          </div>
        );

      case 'scale':
        return (
          <div className="transform-editor__scale">
            <div className="transform-editor__input-group">
              <label className="transform-editor__input-label">X</label>
              <input
                type="number"
                value={transform.scaleX || 1}
                onChange={(e) => handlePropertyChange('scaleX', parseFloat(e.target.value) || 1)}
                className="transform-editor__input"
                step="0.1"
                min="0"
              />
            </div>
            <div className="transform-editor__input-group">
              <label className="transform-editor__input-label">Y</label>
              <input
                type="number"
                value={transform.scaleY || 1}
                onChange={(e) => handlePropertyChange('scaleY', parseFloat(e.target.value) || 1)}
                className="transform-editor__input"
                step="0.1"
                min="0"
              />
            </div>
          </div>
        );

      case 'skew':
        return (
          <div className="transform-editor__skew">
            <div className="transform-editor__input-group">
              <label className="transform-editor__input-label">X</label>
              <input
                type="number"
                value={transform.x || 0}
                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value) || 0)}
                className="transform-editor__input"
                step="1"
              />
              <span className="transform-editor__unit">°</span>
            </div>
            <div className="transform-editor__input-group">
              <label className="transform-editor__input-label">Y</label>
              <input
                type="number"
                value={transform.y || 0}
                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value) || 0)}
                className="transform-editor__input"
                step="1"
              />
              <span className="transform-editor__unit">°</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="transform-editor">
      <div className="transform-editor__header">
        <select
          value={transform.type}
          onChange={(e) => handleTypeChange(e.target.value as Transform['type'])}
          className="transform-editor__type-select"
        >
          <option value="translate">Translate</option>
          <option value="rotate">Rotate</option>
          <option value="scale">Scale</option>
          <option value="skew">Skew</option>
        </select>

        {canRemove && (
          <button
            type="button"
            className="transform-editor__remove"
            onClick={() => onRemove(index)}
            title="Remove transform"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="transform-editor__controls">
        {renderControls()}
      </div>
    </div>
  );
};

interface EffectsPreviewProps {
  filters: FilterEffect[];
  transforms: Transform[];
}

const EffectsPreview: React.FC<EffectsPreviewProps> = ({ filters, transforms }) => {
  const filterCSS = filters.length > 0 ? generateFilterCSS(filters) : 'none';
  const transformCSS = transforms.length > 0 ? generateTransformCSS(transforms) : 'none';

  return (
    <div className="effects-preview">
      <div className="effects-preview__background">
        <div
          className="effects-preview__element"
          style={{
            filter: filterCSS,
            transform: transformCSS,
          }}
        >
          <div className="effects-preview__content">
            <Zap size={24} />
            <span>Effects</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EffectsPicker: React.FC<EffectsPickerProps> = ({
  filters,
  transforms,
  onFiltersChange,
  onTransformsChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'transforms'>('filters');

  const handleAddFilter = useCallback(() => {
    const newFilter: FilterEffect = {
      type: 'blur',
      value: 5,
      unit: 'px',
    };
    onFiltersChange([...filters, newFilter]);
  }, [filters, onFiltersChange]);

  const handleUpdateFilter = useCallback((index: number, filter: FilterEffect) => {
    const newFilters = [...filters];
    newFilters[index] = filter;
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleRemoveFilter = useCallback((index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleAddTransform = useCallback(() => {
    const newTransform: Transform = {
      type: 'translate',
      x: 0,
      y: 0,
    };
    onTransformsChange([...transforms, newTransform]);
  }, [transforms, onTransformsChange]);

  const handleUpdateTransform = useCallback((index: number, transform: Transform) => {
    const newTransforms = [...transforms];
    newTransforms[index] = transform;
    onTransformsChange(newTransforms);
  }, [transforms, onTransformsChange]);

  const handleRemoveTransform = useCallback((index: number) => {
    const newTransforms = transforms.filter((_, i) => i !== index);
    onTransformsChange(newTransforms);
  }, [transforms, onTransformsChange]);

  const handleCopyCSS = useCallback(async () => {
    const css = [];

    if (filters.length > 0) {
      css.push(`filter: ${generateFilterCSS(filters)};`);
    }

    if (transforms.length > 0) {
      css.push(`transform: ${generateTransformCSS(transforms)};`);
    }

    try {
      await navigator.clipboard.writeText(css.join('\n'));
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  }, [filters, transforms]);

  const handleReset = useCallback(() => {
    onFiltersChange([]);
    onTransformsChange([]);
  }, [onFiltersChange, onTransformsChange]);

  return (
    <div className={`effects-picker ${className}`}>
      {/* Header */}
      <div className="effects-picker__header">
        <h3 className="effects-picker__title">Visual Effects</h3>
        <div className="effects-picker__actions">
          <button
            type="button"
            className="effects-picker__action"
            onClick={handleCopyCSS}
            title="Copy CSS"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="effects-picker__action"
            onClick={handleReset}
            title="Reset all effects"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <EffectsPreview filters={filters} transforms={transforms} />

      {/* Tabs */}
      <div className="effects-picker__tabs">
        <button
          type="button"
          className={`effects-picker__tab ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          Filters ({filters.length})
        </button>
        <button
          type="button"
          className={`effects-picker__tab ${activeTab === 'transforms' ? 'active' : ''}`}
          onClick={() => setActiveTab('transforms')}
        >
          Transforms ({transforms.length})
        </button>
      </div>

      {/* Content */}
      <div className="effects-picker__content">
        {activeTab === 'filters' && (
          <div className="effects-picker__filters">
            <div className="effects-picker__section-header">
              <span className="effects-picker__section-title">Filters</span>
              <button
                type="button"
                className="effects-picker__add"
                onClick={handleAddFilter}
                title="Add filter"
              >
                <Plus size={16} />
              </button>
            </div>

            {filters.length > 0 ? (
              <div className="effects-picker__list">
                {filters.map((filter, index) => (
                  <FilterEditor
                    key={index}
                    filter={filter}
                    index={index}
                    onUpdate={handleUpdateFilter}
                    onRemove={handleRemoveFilter}
                    canRemove={filters.length > 1}
                  />
                ))}
              </div>
            ) : (
              <div className="effects-picker__empty">
                <p>No filters applied</p>
                <button
                  type="button"
                  className="effects-picker__add-first"
                  onClick={handleAddFilter}
                >
                  Add Filter
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transforms' && (
          <div className="effects-picker__transforms">
            <div className="effects-picker__section-header">
              <span className="effects-picker__section-title">Transforms</span>
              <button
                type="button"
                className="effects-picker__add"
                onClick={handleAddTransform}
                title="Add transform"
              >
                <Plus size={16} />
              </button>
            </div>

            {transforms.length > 0 ? (
              <div className="effects-picker__list">
                {transforms.map((transform, index) => (
                  <TransformEditor
                    key={index}
                    transform={transform}
                    index={index}
                    onUpdate={handleUpdateTransform}
                    onRemove={handleRemoveTransform}
                    canRemove={transforms.length > 1}
                  />
                ))}
              </div>
            ) : (
              <div className="effects-picker__empty">
                <p>No transforms applied</p>
                <button
                  type="button"
                  className="effects-picker__add-first"
                  onClick={handleAddTransform}
                >
                  Add Transform
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS Output */}
      {(filters.length > 0 || transforms.length > 0) && (
        <div className="effects-picker__css">
          <label className="effects-picker__css-label">CSS Output</label>
          <code className="effects-picker__css-output">
            {filters.length > 0 && `filter: ${generateFilterCSS(filters)};`}
            {filters.length > 0 && transforms.length > 0 && '\n'}
            {transforms.length > 0 && `transform: ${generateTransformCSS(transforms)};`}
          </code>
        </div>
      )}
    </div>
  );
};

export default EffectsPicker;