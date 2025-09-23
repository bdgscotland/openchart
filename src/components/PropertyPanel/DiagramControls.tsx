import React, { useState, useCallback } from 'react';
import {
  Grid,
  Image,
  FileText,
  Move,
  ZoomIn,
  Ruler,
  Palette,
  Settings,
  RotateCcw,
  Square,
  Monitor
} from 'lucide-react';
import { ColorSwatch } from './ColorPicker/ColorSwatch';
import ColorPicker from './ColorPicker/ColorPicker';
import type {
  DiagramSettings,
  GridSettings,
  BackgroundSettings,
  PaperSettings,
  ViewportSettings,
  RulerSettings
} from '../../types/diagram';
import { PAPER_SIZES } from '../../types/diagram';
import './DiagramControls.css';

// Import paper sizes constant
const PAPER_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'A5', label: 'A5 (148 × 210 mm)' },
  { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
  { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' },
  { value: 'Custom', label: 'Custom Size' },
] as const;

const GRID_STYLE_OPTIONS = [
  { value: 'dots', label: 'Dots', icon: '•••' },
  { value: 'lines', label: 'Lines', icon: '═══' },
  { value: 'crosshatch', label: 'Crosshatch', icon: '⊞⊞⊞' },
] as const;

const BACKGROUND_SIZE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'custom', label: 'Custom' },
] as const;

const RULER_UNIT_OPTIONS = [
  { value: 'px', label: 'Pixels (px)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'in', label: 'Inches (in)' },
  { value: 'pt', label: 'Points (pt)' },
] as const;

export interface DiagramControlsProps {
  settings: DiagramSettings;
  onGridSettingsChange: (settings: Partial<GridSettings>) => void;
  onBackgroundSettingsChange: (settings: Partial<BackgroundSettings>) => void;
  onPaperSettingsChange: (settings: Partial<PaperSettings>) => void;
  onViewportSettingsChange: (settings: Partial<ViewportSettings>) => void;
  onRulerSettingsChange: (settings: Partial<RulerSettings>) => void;
  className?: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`diagram-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="diagram-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="diagram-section-title">
          <span className="diagram-section-icon">{icon}</span>
          <span className="diagram-section-label">{title}</span>
        </div>
        <span className="diagram-section-chevron">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div className="diagram-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export const DiagramControls: React.FC<DiagramControlsProps> = ({
  settings,
  onGridSettingsChange,
  onBackgroundSettingsChange,
  onPaperSettingsChange,
  onViewportSettingsChange,
  onRulerSettingsChange,
  className = '',
}) => {
  const [isBackgroundColorPickerOpen, setIsBackgroundColorPickerOpen] = useState(false);

  // Grid Controls
  const handleGridToggle = useCallback((enabled: boolean) => {
    onGridSettingsChange({ enabled });
  }, [onGridSettingsChange]);

  const handleGridSizeChange = useCallback((size: number) => {
    onGridSettingsChange({ size: Math.max(5, Math.min(100, size)) });
  }, [onGridSettingsChange]);

  const handleGridStyleChange = useCallback((style: GridSettings['style']) => {
    onGridSettingsChange({ style });
  }, [onGridSettingsChange]);

  const handleGridColorChange = useCallback((color: string) => {
    onGridSettingsChange({ color });
  }, [onGridSettingsChange]);

  const handleGridOpacityChange = useCallback((opacity: number) => {
    onGridSettingsChange({ opacity: Math.max(0, Math.min(1, opacity)) });
  }, [onGridSettingsChange]);

  const handleSnapToggle = useCallback((snapToGrid: boolean) => {
    onGridSettingsChange({ snapToGrid });
  }, [onGridSettingsChange]);

  // Background Controls
  const handleBackgroundColorChange = useCallback((color: string) => {
    onBackgroundSettingsChange({ color });
  }, [onBackgroundSettingsChange]);

  const handleBackgroundOpacityChange = useCallback((opacity: number) => {
    onBackgroundSettingsChange({ opacity: Math.max(0, Math.min(1, opacity)) });
  }, [onBackgroundSettingsChange]);

  // Paper Controls
  const handlePaperSizeChange = useCallback((size: PaperSettings['size']) => {
    if (size !== 'Custom') {
      const paperSize = (PAPER_SIZES as any)[size];
      const isPortrait = settings.paper.orientation === 'portrait';
      onPaperSettingsChange({
        size,
        width: isPortrait ? paperSize.height : paperSize.width,
        height: isPortrait ? paperSize.width : paperSize.height,
      });
    } else {
      onPaperSettingsChange({ size });
    }
  }, [settings.paper.orientation, onPaperSettingsChange]);

  const handleOrientationChange = useCallback((orientation: PaperSettings['orientation']) => {
    const currentSize = settings.paper.size;
    if (currentSize !== 'Custom') {
      // Swap width and height for non-custom sizes
      onPaperSettingsChange({
        orientation,
        width: settings.paper.height,
        height: settings.paper.width,
      });
    } else {
      onPaperSettingsChange({ orientation });
    }
  }, [settings.paper, onPaperSettingsChange]);

  // Viewport Controls
  const handleZoomChange = useCallback((zoom: number) => {
    onViewportSettingsChange({
      zoom: Math.max(settings.viewport.minZoom, Math.min(settings.viewport.maxZoom, zoom))
    });
  }, [settings.viewport, onViewportSettingsChange]);

  const resetZoom = useCallback(() => {
    onViewportSettingsChange({ zoom: 1.0 });
  }, [onViewportSettingsChange]);

  return (
    <div className={`diagram-controls ${className}`}>
      {/* Grid Controls */}
      <Section title="Grid & Snap" icon={<Grid size={16} />}>
        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.grid.enabled}
                onChange={(e) => handleGridToggle(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Show Grid
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.grid.snapToGrid}
                onChange={(e) => handleSnapToggle(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Snap to Grid
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Grid Size</label>
            <input
              type="number"
              value={settings.grid.size}
              onChange={(e) => handleGridSizeChange(parseInt(e.target.value) || 20)}
              min={5}
              max={100}
              className="number-input"
            />
            <span className="input-unit">px</span>
          </div>
          <div className="form-group">
            <label className="form-label">Opacity</label>
            <input
              type="range"
              value={settings.grid.opacity}
              onChange={(e) => handleGridOpacityChange(parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.1}
              className="range-input"
            />
            <span className="range-value">{Math.round(settings.grid.opacity * 100)}%</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Grid Style</label>
          <div className="grid-style-options">
            {GRID_STYLE_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                className={`grid-style-option ${settings.grid.style === value ? 'active' : ''}`}
                onClick={() => handleGridStyleChange(value)}
                title={label}
              >
                <span className="grid-style-icon">{icon}</span>
                <span className="grid-style-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Grid Color</label>
          <div className="color-picker-container">
            <ColorSwatch
              color={settings.grid.color}
              size="medium"
              onClick={() => {/* Grid color picker implementation */}}
              title="Grid Color"
            />
            <input
              type="text"
              value={settings.grid.color}
              onChange={(e) => handleGridColorChange(e.target.value)}
              className="color-input"
              placeholder="#e0e0e0"
            />
          </div>
        </div>
      </Section>

      {/* Background Controls */}
      <Section title="Background" icon={<Palette size={16} />}>
        <div className="form-group">
          <label className="form-label">Background Color</label>
          <div className="color-picker-container">
            <ColorSwatch
              color={settings.background.color}
              size="medium"
              onClick={() => setIsBackgroundColorPickerOpen(true)}
              title="Background Color"
            />
            <input
              type="text"
              value={settings.background.color}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="color-input"
              placeholder="#ffffff"
            />
            {isBackgroundColorPickerOpen && (
              <div className="color-picker-popup">
                <div
                  className="color-picker-backdrop"
                  onClick={() => setIsBackgroundColorPickerOpen(false)}
                />
                <ColorPicker
                  color={settings.background.color}
                  onChange={handleBackgroundColorChange}
                  onClose={() => setIsBackgroundColorPickerOpen(false)}
                  title="Background Color"
                  showAlpha={true}
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Background Opacity</label>
          <input
            type="range"
            value={settings.background.opacity}
            onChange={(e) => handleBackgroundOpacityChange(parseFloat(e.target.value))}
            min={0}
            max={1}
            step={0.1}
            className="range-input"
          />
          <span className="range-value">{Math.round(settings.background.opacity * 100)}%</span>
        </div>

        <div className="form-group">
          <label className="form-label">Background Image</label>
          <div className="file-input-group">
            <button className="file-input-button">
              <Image size={16} />
              Choose Image
            </button>
            <input type="file" accept="image/*" className="file-input-hidden" />
            {settings.background.image && (
              <button
                className="file-remove-button"
                onClick={() => onBackgroundSettingsChange({ image: undefined })}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Paper & Canvas Settings */}
      <Section title="Page Setup" icon={<FileText size={16} />}>
        <div className="form-group">
          <label className="form-label">Paper Size</label>
          <select
            value={settings.paper.size}
            onChange={(e) => handlePaperSizeChange(e.target.value as PaperSettings['size'])}
            className="select-input"
          >
            {PAPER_SIZE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Orientation</label>
          <div className="orientation-options">
            <button
              className={`orientation-option ${settings.paper.orientation === 'portrait' ? 'active' : ''}`}
              onClick={() => handleOrientationChange('portrait')}
            >
              <Square size={16} />
              Portrait
            </button>
            <button
              className={`orientation-option ${settings.paper.orientation === 'landscape' ? 'active' : ''}`}
              onClick={() => handleOrientationChange('landscape')}
            >
              <Monitor size={16} />
              Landscape
            </button>
          </div>
        </div>

        {settings.paper.size === 'Custom' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Width</label>
              <input
                type="number"
                value={settings.paper.width}
                onChange={(e) => onPaperSettingsChange({ width: parseInt(e.target.value) || 1920 })}
                min={100}
                className="number-input"
              />
              <span className="input-unit">px</span>
            </div>
            <div className="form-group">
              <label className="form-label">Height</label>
              <input
                type="number"
                value={settings.paper.height}
                onChange={(e) => onPaperSettingsChange({ height: parseInt(e.target.value) || 1080 })}
                min={100}
                className="number-input"
              />
              <span className="input-unit">px</span>
            </div>
          </div>
        )}
      </Section>

      {/* Viewport Controls */}
      <Section title="View & Navigation" icon={<Move size={16} />}>
        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.viewport.panEnabled}
                onChange={(e) => onViewportSettingsChange({ panEnabled: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              Enable Pan
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.viewport.zoomEnabled}
                onChange={(e) => onViewportSettingsChange({ zoomEnabled: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              Enable Zoom
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.viewport.infiniteCanvas}
              onChange={(e) => onViewportSettingsChange({ infiniteCanvas: e.target.checked })}
            />
            <span className="checkbox-custom"></span>
            Infinite Canvas
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Zoom Level</label>
          <div className="zoom-controls">
            <input
              type="range"
              value={settings.viewport.zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              min={settings.viewport.minZoom}
              max={settings.viewport.maxZoom}
              step={0.1}
              className="range-input"
            />
            <span className="range-value">{Math.round(settings.viewport.zoom * 100)}%</span>
            <button
              className="reset-zoom-button"
              onClick={resetZoom}
              title="Reset Zoom to 100%"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Min Zoom</label>
            <input
              type="number"
              value={settings.viewport.minZoom}
              onChange={(e) => onViewportSettingsChange({ minZoom: parseFloat(e.target.value) || 0.1 })}
              min={0.1}
              max={1}
              step={0.1}
              className="number-input"
            />
            <span className="input-unit">×</span>
          </div>
          <div className="form-group">
            <label className="form-label">Max Zoom</label>
            <input
              type="number"
              value={settings.viewport.maxZoom}
              onChange={(e) => onViewportSettingsChange({ maxZoom: parseFloat(e.target.value) || 5 })}
              min={1}
              max={10}
              step={0.5}
              className="number-input"
            />
            <span className="input-unit">×</span>
          </div>
        </div>
      </Section>

      {/* Rulers & Guides */}
      <Section title="Rulers & Guides" icon={<Ruler size={16} />} defaultExpanded={false}>
        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.rulers.enabled}
                onChange={(e) => onRulerSettingsChange({ enabled: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              Show Rulers
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.rulers.showGuides}
                onChange={(e) => onRulerSettingsChange({ showGuides: e.target.checked })}
              />
              <span className="checkbox-custom"></span>
              Show Guides
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ruler Units</label>
          <select
            value={settings.rulers.units}
            onChange={(e) => onRulerSettingsChange({ units: e.target.value as RulerSettings['units'] })}
            className="select-input"
          >
            {RULER_UNIT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Guide Color</label>
          <div className="color-picker-container">
            <ColorSwatch
              color={settings.rulers.guidesColor}
              size="medium"
              onClick={() => {/* Guide color picker implementation */}}
              title="Guide Color"
            />
            <input
              type="text"
              value={settings.rulers.guidesColor}
              onChange={(e) => onRulerSettingsChange({ guidesColor: e.target.value })}
              className="color-input"
              placeholder="#4a90e2"
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default DiagramControls;