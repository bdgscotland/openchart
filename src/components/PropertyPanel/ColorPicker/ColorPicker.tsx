import React, { useState, useCallback, useEffect } from 'react';
import ColorPalette from './ColorPalette';
import ColorWheel, { ColorSlider } from './ColorWheel';
import ColorInput from './ColorInput';
import { ColorSwatchGrid } from './ColorSwatch';
import {
  parseColor,
  formatColor,
  rgbaToHsva,
  hsvaToRgba,
  getRecentColors,
  addRecentColor,
  clearRecentColors,
  type HSVAColor
} from './colorUtils';
import './ColorPicker.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  showAlpha?: boolean;
  showRecent?: boolean;
  showInput?: boolean;
  format?: 'hex' | 'rgb' | 'hsl';
  className?: string;
  title?: string;
}

type TabType = 'palette' | 'wheel' | 'input';

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onClose,
  showAlpha = true,
  showRecent = true,
  showInput = true,
  format = 'hex',
  className = '',
  title = 'Color Picker',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('palette');
  const [currentColor, setCurrentColor] = useState(color);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Load recent colors on mount
  useEffect(() => {
    setRecentColors(getRecentColors());
  }, []);

  // Update current color when prop changes
  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  const handleColorChange = useCallback((newColor: string) => {
    console.log('🎨 ColorPicker handleColorChange called:', { newColor, onChange: !!onChange });
    setCurrentColor(newColor);
    console.log('🎨 ColorPicker calling onChange with:', newColor);
    onChange(newColor);
  }, [onChange]);

  const handleColorCommit = useCallback((newColor: string) => {
    console.log('🎨 ColorPicker handleColorCommit called:', { newColor });
    // Add to recent colors
    addRecentColor(newColor);
    setRecentColors(getRecentColors());

    handleColorChange(newColor);
  }, [handleColorChange]);

  const handleSliderChange = useCallback((type: 'h' | 's' | 'v' | 'a', value: number) => {
    const rgba = parseColor(currentColor);
    const hsva = rgbaToHsva(rgba);

    const newHsva: HSVAColor = {
      ...hsva,
      [type]: type === 'a' ? value / 100 : value,
    };

    const newRgba = hsvaToRgba(newHsva);
    const newColor = formatColor(newRgba);
    handleColorChange(newColor);
  }, [currentColor, handleColorChange]);

  const handleClearRecent = useCallback(() => {
    clearRecentColors();
    setRecentColors([]);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  };

  // Parse current color for sliders
  const rgba = parseColor(currentColor);
  const hsva = rgbaToHsva(rgba);

  const tabs = [
    { id: 'palette' as const, label: 'Palette', show: true },
    { id: 'wheel' as const, label: 'Wheel', show: true },
    { id: 'input' as const, label: 'Input', show: showInput },
  ].filter(tab => tab.show);

  return (
    <div
      className={`color-picker ${className}`}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="color-picker-title"
      tabIndex={-1}
    >
      {/* Header */}
      <div className="color-picker__header">
        <h3 id="color-picker-title" className="color-picker__title">
          {title}
        </h3>
        {onClose && (
          <button
            type="button"
            className="color-picker__close"
            onClick={onClose}
            aria-label="Close color picker"
          >
            ×
          </button>
        )}
      </div>

      {/* Color Preview */}
      <div className="color-picker__preview">
        <div className="color-picker__preview-swatch">
          <div
            className="color-picker__preview-color"
            style={{ backgroundColor: currentColor }}
          />
        </div>
        <div className="color-picker__preview-label">
          {formatColor(rgba, format)}
        </div>
      </div>

      {/* Tabs */}
      <div className="color-picker__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`
              color-picker__tab
              ${activeTab === tab.id ? 'color-picker__tab--active' : ''}
            `}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="color-picker__content">
        {/* Palette Tab */}
        {activeTab === 'palette' && (
          <div
            id="tab-panel-palette"
            role="tabpanel"
            aria-labelledby="tab-palette"
          >
            <ColorPalette
              selectedColor={currentColor}
              onColorSelect={handleColorChange}
              onColorDoubleClick={handleColorCommit}
            />
          </div>
        )}

        {/* Wheel Tab */}
        {activeTab === 'wheel' && (
          <div
            id="tab-panel-wheel"
            role="tabpanel"
            aria-labelledby="tab-wheel"
          >
            <ColorWheel
              color={currentColor}
              onChange={handleColorChange}
              size={200}
            />

            {/* HSV Sliders */}
            <div className="mt-4 space-y-3">
              <ColorSlider
                type="hue"
                value={hsva.h}
                max={360}
                onChange={(value) => handleSliderChange('h', value)}
              />
              <ColorSlider
                type="saturation"
                value={hsva.s}
                max={100}
                onChange={(value) => handleSliderChange('s', value)}
                color={formatColor(hsvaToRgba({ ...hsva, s: 100, v: 100 }))}
              />
              <ColorSlider
                type="lightness"
                value={hsva.v}
                max={100}
                onChange={(value) => handleSliderChange('v', value)}
                color={formatColor(hsvaToRgba({ ...hsva, s: 100, v: 100 }))}
              />
              {showAlpha && (
                <ColorSlider
                  type="alpha"
                  value={hsva.a * 100}
                  max={100}
                  onChange={(value) => handleSliderChange('a', value)}
                  color={formatColor({ ...rgba, a: 1 })}
                />
              )}
            </div>
          </div>
        )}

        {/* Input Tab */}
        {activeTab === 'input' && showInput && (
          <div
            id="tab-panel-input"
            role="tabpanel"
            aria-labelledby="tab-input"
          >
            <ColorInput
              color={currentColor}
              onChange={handleColorChange}
              format={format}
              showAlpha={showAlpha}
            />
          </div>
        )}
      </div>

      {/* Recent Colors */}
      {showRecent && (
        <div className="recent-colors">
          <div className="recent-colors__header">
            <h4 className="recent-colors__title">Recent Colors</h4>
            {recentColors.length > 0 && (
              <button
                type="button"
                className="recent-colors__clear"
                onClick={handleClearRecent}
                aria-label="Clear recent colors"
              >
                Clear
              </button>
            )}
          </div>

          {recentColors.length > 0 ? (
            <div className="recent-colors__grid">
              <ColorSwatchGrid
                colors={recentColors}
                selectedColor={currentColor}
                onColorSelect={handleColorChange}
                onColorDoubleClick={handleColorCommit}
                swatchSize="small"
                columns={recentColors.length}
                aria-label="Recent colors"
              />
            </div>
          ) : (
            <div className="recent-colors__empty">
              No recent colors
            </div>
          )}
        </div>
      )}

      {/* Instructions for screen readers */}
      <div className="sr-only">
        <p>
          Color picker with multiple input methods. Use Tab to navigate between controls.
          In the wheel view, use arrow keys to adjust hue and saturation.
          Press Escape to close the color picker.
        </p>
      </div>
    </div>
  );
};

// Preset configurations for common use cases
export const ColorPickerPresets = {
  basic: {
    showAlpha: false,
    showRecent: false,
    showInput: false,
  },
  advanced: {
    showAlpha: true,
    showRecent: true,
    showInput: true,
  },
  simple: {
    showAlpha: false,
    showRecent: true,
    showInput: false,
  },
};

export default ColorPicker;