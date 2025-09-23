import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Type, Palette, Layout, Layers, Link } from 'lucide-react';
import ColorPicker from './ColorPicker/ColorPicker';
import { ColorSwatch } from './ColorPicker/ColorSwatch';
import { SizeControls, PositionControls } from './SizeControls';
import BulkStyleControls from './BulkStyleControls';
import StyleSynchronizer from './StyleSynchronizer';
import { FontPicker, TextAlignment, TextSpacing, TextDecoration, FontPreview, TextFormatToolbar } from './Typography';
import type { DiagramElement, ElementStyle } from '../../types/diagram';
import type { Dimensions, Position } from './SizeControls/types';
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../core/commands/BulkStyleCommand';
import './StyleControls.css';

export interface StyleControlsProps {
  selectedElements: DiagramElement[];
  allElements?: DiagramElement[];
  onUpdateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyle>) => void;
  onUpdateElementText: (elementId: string, text: string) => void;
  onUpdateElementPosition: (elementId: string, x: number, y: number) => void;
  onUpdateElementSize: (elementId: string, width: number, height: number) => void;

  // Bulk operations
  onBulkStyleUpdate?: (update: BulkStyleUpdate) => void;
  onAlignElements?: (operation: AlignmentOperation) => void;
  onDistributeElements?: (operation: DistributionOperation) => void;
  onFindAndReplaceText?: (searchText: string, replaceText: string, matchCase?: boolean) => void;
  onCopyStyleToElements?: (sourceElementId: string, targetElementIds: string[]) => void;

  className?: string;
}

interface PropertySectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className={`property-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="property-section-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.toLowerCase()}`}
      >
        <div className="property-section-title">
          <span className="property-section-icon">{icon}</span>
          <span className="property-section-label">{title}</span>
        </div>
        <span className="property-section-chevron">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      <div
        className="property-section-content"
        id={`section-${title.toLowerCase()}`}
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

interface AdvancedColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  label,
  value,
  onChange,
  isLoading = false
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSwatchClick = () => {
    setIsPickerOpen(true);
  };

  const handleColorChange = useCallback((color: string) => {
    setTempValue(color);
    onChange(color);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTempValue(color);

    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    if (isValidHex || color === '') {
      handleColorChange(color);
    }
  }, [handleColorChange]);

  const handlePickerClose = () => {
    setIsPickerOpen(false);
  };

  const displayValue = isChanging ? tempValue : value;

  return (
    <div className={`form-group advanced-color-picker-group ${
      isChanging ? 'preview-active' : ''
    }`}>
      <label className="form-label">
        {label}
        {isLoading && (
          <span className="loading-indicator">
            <div className="spinner" />
          </span>
        )}
      </label>
      <div className="color-picker-container">
        <div className="color-swatch-wrapper">
          <ColorSwatch
            color={displayValue || '#ffffff'}
            size="medium"
            onClick={handleSwatchClick}
            title={`${label}: ${displayValue}`}
            className={`property-color-swatch ${
              isChanging ? 'changing' : ''
            }`}
          />
          {isChanging && (
            <div className="color-change-indicator">
              <div className="pulse-ring" />
            </div>
          )}
        </div>
        <div className="color-input-wrapper">
          <input
            type="text"
            value={displayValue || '#ffffff'}
            onChange={handleInputChange}
            className={`color-input ${
              isChanging ? 'changing' : ''
            }`}
            placeholder="#ffffff"
            aria-label={`${label} color value`}
          />
          <div className="input-accent" />
        </div>
        {isPickerOpen && (
          <div className="color-picker-popup">
            <div className="color-picker-backdrop" onClick={handlePickerClose} />
            <ColorPicker
              color={displayValue || '#ffffff'}
              onChange={handleColorChange}
              onClose={handlePickerClose}
              title={label}
              showAlpha={true}
              showRecent={true}
              showInput={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  isLoading?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  isLoading = false,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTempValue(inputValue);

    const numValue = parseFloat(inputValue) || 0;
    const clampedValue = Math.max(min || -Infinity, Math.min(max || Infinity, numValue));

    onChange(clampedValue);
  }, [onChange, min, max]);

  const handleBlur = useCallback(() => {
    const numValue = parseFloat(tempValue) || 0;
    const clampedValue = Math.max(min || -Infinity, Math.min(max || Infinity, numValue));
    setTempValue(clampedValue.toString());
    onChange(clampedValue);
    setIsChanging(false);
  }, [tempValue, onChange, min, max]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseFloat(tempValue) || 0;
      const increment = e.key === 'ArrowUp' ? step : -step;
      const newValue = currentValue + increment;
      const clampedValue = Math.max(min || -Infinity, Math.min(max || Infinity, newValue));

      setTempValue(clampedValue.toString());
      onChange(clampedValue);
    }
  }, [tempValue, step, min, max, onChange]);

  useEffect(() => {
    if (!isChanging) {
      setTempValue(value.toString());
    }
  }, [value, isChanging]);

  return (
    <div className={`form-group ${
      isChanging ? 'preview-active' : ''
    }`}>
      <label className="form-label">
        {label}
        {isLoading && (
          <span className="loading-indicator">
            <div className="spinner" />
          </span>
        )}
      </label>
      <div className="number-input-container">
        <input
          type="number"
          value={tempValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          className={`number-input ${
            isChanging ? 'changing' : ''
          }`}
          aria-label={`${label} value`}
        />
        {unit && <span className="input-unit">{unit}</span>}
        <div className="input-accent" />
        {isChanging && (
          <div className="change-indicator">
            <div className="pulse-dot" />
          </div>
        )}
      </div>
    </div>
  );
};

export const StyleControls: React.FC<StyleControlsProps> = ({
  selectedElements = [],
  allElements = [],
  onUpdateElementStyle,
  onUpdateElementText,
  onUpdateElementPosition,
  onUpdateElementSize,
  onBulkStyleUpdate,
  onAlignElements,
  onDistributeElements,
  onFindAndReplaceText,
  onCopyStyleToElements,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [updatingSection, setUpdatingSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    text: false,
    typography: false,
    appearance: false,
    position: false,
    size: false,
    bulk: false,
    sync: false,
  });

  // Auto-expand relevant sections based on selection
  useEffect(() => {
    const isMultiSelection = selectedElements.length > 1;
    const hasSingleElement = selectedElements.length === 1;

    setExpandedSections(prev => ({
      ...prev,
      bulk: isMultiSelection,
      sync: isMultiSelection && allElements.length > selectedElements.length,
    }));
  }, [selectedElements.length, allElements.length]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      // Accordion behavior: close all sections first, then open the clicked one
      const allClosed = Object.keys(prev).reduce((acc, key) => {
        acc[key as keyof typeof prev] = false;
        return acc;
      }, {} as typeof prev);

      // If the clicked section was already open, leave all closed (toggle effect)
      // If it was closed, open only the clicked section
      return {
        ...allClosed,
        [section]: !prev[section],
      };
    });
  }, []);

  // Get the first selected element for single-element editing
  const primaryElement = selectedElements[0];

  // Check if multiple elements are selected
  const isMultiSelect = selectedElements.length > 1;

  // Immediate style updates without loading states to prevent flashing
  const handleStyleUpdate = useCallback((styleUpdate: Partial<ElementStyle>) => {
    selectedElements.forEach(element => {
      onUpdateElementStyle(element.id, styleUpdate);
    });
  }, [selectedElements, onUpdateElementStyle]);

  // Immediate text updates without loading states
  const handleTextUpdate = useCallback((text: string) => {
    if (!primaryElement) return;
    onUpdateElementText(primaryElement.id, text);
  }, [primaryElement, onUpdateElementText]);

  // Handle position updates (only for single element)
  const handlePositionUpdate = useCallback((field: 'x' | 'y', value: number) => {
    if (primaryElement) {
      if (field === 'x') {
        onUpdateElementPosition(primaryElement.id, value, primaryElement.position.y);
      } else {
        onUpdateElementPosition(primaryElement.id, primaryElement.position.x, value);
      }
    }
  }, [primaryElement, onUpdateElementPosition]);

  // Handle size updates (only for single element)
  const handleSizeUpdate = useCallback((field: 'width' | 'height', value: number) => {
    if (primaryElement) {
      if (field === 'width') {
        onUpdateElementSize(primaryElement.id, value, primaryElement.size.height);
      } else {
        onUpdateElementSize(primaryElement.id, primaryElement.size.width, value);
      }
    }
  }, [primaryElement, onUpdateElementSize]);

  // Advanced size controls data
  const sizeControlsData = useMemo(() => {
    if (selectedElements.length === 0) return null;

    const isMultiSelection = selectedElements.length > 1;

    if (!isMultiSelection && primaryElement) {
      return {
        dimensions: {
          width: primaryElement.size.width,
          height: primaryElement.size.height,
          unit: 'px' as const
        },
        position: primaryElement.position,
        aspectRatioLocked: false,
        isMultiSelection: false,
        selectedNodeIds: [primaryElement.id]
      };
    }

    // Multi-selection: calculate averages
    const avgWidth = selectedElements.reduce((sum, el) => sum + el.size.width, 0) / selectedElements.length;
    const avgHeight = selectedElements.reduce((sum, el) => sum + el.size.height, 0) / selectedElements.length;
    const avgX = selectedElements.reduce((sum, el) => sum + el.position.x, 0) / selectedElements.length;
    const avgY = selectedElements.reduce((sum, el) => sum + el.position.y, 0) / selectedElements.length;

    return {
      dimensions: {
        width: Math.round(avgWidth),
        height: Math.round(avgHeight),
        unit: 'px' as const
      },
      position: {
        x: Math.round(avgX),
        y: Math.round(avgY)
      },
      aspectRatioLocked: false,
      isMultiSelection: true,
      selectedNodeIds: selectedElements.map(el => el.id)
    };
  }, [selectedElements, primaryElement]);

  // Advanced dimension change handler
  const handleAdvancedDimensionsChange = useCallback((dimensions: Dimensions) => {
    if (selectedElements.length === 0) return;

    const isMultiSelection = selectedElements.length > 1;

    if (!isMultiSelection) {
      // Single selection - apply exact size
      const element = selectedElements[0];
      onUpdateElementSize(element.id, dimensions.width, dimensions.height);
    } else {
      // Multi-selection - apply relative scaling
      const currentAvgWidth = selectedElements.reduce((sum, el) => sum + el.size.width, 0) / selectedElements.length;
      const currentAvgHeight = selectedElements.reduce((sum, el) => sum + el.size.height, 0) / selectedElements.length;

      const scaleX = dimensions.width / currentAvgWidth;
      const scaleY = dimensions.height / currentAvgHeight;

      selectedElements.forEach(element => {
        const newWidth = Math.max(10, Math.round(element.size.width * scaleX));
        const newHeight = Math.max(10, Math.round(element.size.height * scaleY));
        onUpdateElementSize(element.id, newWidth, newHeight);
      });
    }
  }, [selectedElements, onUpdateElementSize]);

  // Advanced position change handler
  const handleAdvancedPositionChange = useCallback((position: Position) => {
    if (selectedElements.length === 0) return;

    const isMultiSelection = selectedElements.length > 1;

    if (!isMultiSelection) {
      // Single selection - apply exact position
      const element = selectedElements[0];
      onUpdateElementPosition(element.id, position.x, position.y);
    } else {
      // Multi-selection - apply relative movement
      const currentAvgX = selectedElements.reduce((sum, el) => sum + el.position.x, 0) / selectedElements.length;
      const currentAvgY = selectedElements.reduce((sum, el) => sum + el.position.y, 0) / selectedElements.length;

      const deltaX = position.x - currentAvgX;
      const deltaY = position.y - currentAvgY;

      selectedElements.forEach(element => {
        const newX = element.position.x + deltaX;
        const newY = element.position.y + deltaY;
        onUpdateElementPosition(element.id, newX, newY);
      });
    }
  }, [selectedElements, onUpdateElementPosition]);

  // Aspect ratio toggle handler
  const handleAspectRatioToggle = useCallback((locked: boolean) => {
    console.log('Aspect ratio locked:', locked);
  }, []);

  if (selectedElements.length === 0) {
    return (
      <div className={`style-controls ${className}`}>
        <div className="no-selection">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`style-controls ${
      isLoading ? 'loading' : ''
    } ${className}`}>
      {/* Text Properties */}
      {!isMultiSelect && (
        <PropertySection
          title="Text"
          icon={<Type size={16} />}
          isExpanded={expandedSections.text}
          onToggle={() => toggleSection('text')}
        >
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              value={primaryElement?.text || ''}
              onChange={(e) => handleTextUpdate(e.target.value)}
              className="text-input"
              placeholder="Enter text..."
              rows={3}
            />
          </div>
          <div className="form-row">
            <NumberInput
              label="Font Size"
              value={primaryElement?.style?.fontSize || 14}
              onChange={(value) => handleStyleUpdate({ fontSize: value })}
              min={8}
              max={72}
              unit="px"
            />
            <div className="form-group">
              <label className="form-label">Font Weight</label>
              <select
                value={primaryElement?.style?.fontWeight || 'normal'}
                onChange={(e) => handleStyleUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}
                className="select-input"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Text Align</label>
            <select
              value={primaryElement?.style?.textAlign || 'center'}
              onChange={(e) => handleStyleUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
              className="select-input"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </PropertySection>
      )}

      {/* Advanced Typography Properties */}
      {!isMultiSelect && (
        <PropertySection
          title="Typography"
          icon={<Type size={16} />}
          isExpanded={expandedSections.typography}
          onToggle={() => toggleSection('typography')}
        >
          {/* Text Format Toolbar */}
          <div className="form-group">
            <TextFormatToolbar
              style={primaryElement?.style || {}}
              onStyleChange={handleStyleUpdate}
            />
          </div>

          {/* Font Picker */}
          <FontPicker
            fontFamily={primaryElement?.style?.fontFamily}
            fontSize={primaryElement?.style?.fontSize}
            fontWeight={primaryElement?.style?.fontWeight}
            fontStyle={primaryElement?.style?.fontStyle}
            onFontFamilyChange={(family) => handleStyleUpdate({ fontFamily: family })}
            onFontSizeChange={(size) => handleStyleUpdate({ fontSize: size })}
            onFontWeightChange={(weight) => handleStyleUpdate({ fontWeight: weight as any })}
            onFontStyleChange={(style) => handleStyleUpdate({ fontStyle: style as any })}
          />

          {/* Text Alignment */}
          <div className="form-group">
            <TextAlignment
              textAlign={primaryElement?.style?.textAlign}
              onTextAlignChange={(align) => handleStyleUpdate({ textAlign: align })}
            />
          </div>

          {/* Text Spacing */}
          <TextSpacing
            lineHeight={primaryElement?.style?.lineHeight}
            letterSpacing={primaryElement?.style?.letterSpacing}
            wordSpacing={primaryElement?.style?.wordSpacing}
            onLineHeightChange={(value) => handleStyleUpdate({ lineHeight: value })}
            onLetterSpacingChange={(value) => handleStyleUpdate({ letterSpacing: value })}
            onWordSpacingChange={(value) => handleStyleUpdate({ wordSpacing: value })}
          />

          {/* Text Decoration and Transform */}
          <TextDecoration
            textDecoration={primaryElement?.style?.textDecoration}
            textTransform={primaryElement?.style?.textTransform}
            onTextDecorationChange={(decoration) => handleStyleUpdate({ textDecoration: decoration })}
            onTextTransformChange={(transform) => handleStyleUpdate({ textTransform: transform })}
          />

          {/* Text Color (separate from fill) */}
          <div className="form-group">
            <AdvancedColorPicker
              label="Text Color"
              value={primaryElement?.style?.color || primaryElement?.style?.fill || '#000000'}
              onChange={(value) => handleStyleUpdate({ color: value })}
            />
          </div>

          {/* Font Preview */}
          <FontPreview
            style={primaryElement?.style || {}}
            text={primaryElement?.text}
          />
        </PropertySection>
      )}

      {/* Style Properties */}
      <PropertySection
        title="Appearance"
        icon={<Palette size={16} />}
        isExpanded={expandedSections.appearance}
        onToggle={() => toggleSection('appearance')}
      >
        <div className={`property-section-wrapper ${
          updatingSection === 'style' ? 'updating' : ''
        }`}>
          <div className="form-row">
            <AdvancedColorPicker
              label="Fill Color"
              value={primaryElement?.style?.fill || '#ffffff'}
              onChange={(value) => handleStyleUpdate({ fill: value })}
            />
            <AdvancedColorPicker
              label="Border Color"
              value={primaryElement?.style?.stroke || '#000000'}
              onChange={(value) => handleStyleUpdate({ stroke: value })}
            />
          </div>
          <div className="form-row">
            <NumberInput
              label="Border Width"
              value={primaryElement?.style?.strokeWidth || 2}
              onChange={(value) => handleStyleUpdate({ strokeWidth: value })}
              min={0}
              max={20}
              unit="px"
            />
            <NumberInput
              label="Opacity"
              value={primaryElement?.style?.opacity || 1}
              onChange={(value) => handleStyleUpdate({ opacity: value })}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          {(primaryElement?.type === 'rectangle' || primaryElement?.type === 'diamond') && (
            <NumberInput
              label="Corner Radius"
              value={primaryElement?.style?.cornerRadius || 0}
              onChange={(value) => handleStyleUpdate({ cornerRadius: value })}
              min={0}
              max={50}
              unit="px"
              isLoading={updatingSection === 'style'}
            />
          )}
          <div className="style-preview-hint">
            <span>Changes apply in real-time</span>
          </div>
        </div>
      </PropertySection>

      {/* Advanced Size & Position Controls */}
      {sizeControlsData && (
        <PropertySection
          title="Size & Position"
          icon={<Layout size={16} />}
          isExpanded={expandedSections.size}
          onToggle={() => toggleSection('size')}
        >
          <SizeControls
            dimensions={sizeControlsData.dimensions}
            position={sizeControlsData.position}
            aspectRatioLocked={sizeControlsData.aspectRatioLocked}
            isMultiSelection={sizeControlsData.isMultiSelection}
            selectedNodeIds={sizeControlsData.selectedNodeIds}
            onDimensionsChange={handleAdvancedDimensionsChange}
            onPositionChange={handleAdvancedPositionChange}
            onAspectRatioToggle={handleAspectRatioToggle}
          />

          <PositionControls
            position={sizeControlsData.position}
            isMultiSelection={sizeControlsData.isMultiSelection}
            onPositionChange={handleAdvancedPositionChange}
          />
        </PropertySection>
      )}

      {/* Bulk Operations for Multi-Selection */}
      {isMultiSelect && onBulkStyleUpdate && (
        <PropertySection
          title="Bulk Operations"
          icon={<Layers size={16} />}
          isExpanded={expandedSections.bulk}
          onToggle={() => toggleSection('bulk')}
        >
          <BulkStyleControls
            selectedElements={selectedElements}
            onBulkStyleUpdate={onBulkStyleUpdate}
            onAlignElements={onAlignElements || (() => {})}
            onDistributeElements={onDistributeElements || (() => {})}
            onFindAndReplace={onFindAndReplaceText}
          />
        </PropertySection>
      )}

      {/* Style Synchronizer for Multi-Selection */}
      {isMultiSelect && allElements.length > 0 && (
        <PropertySection
          title="Style Sync"
          icon={<Link size={16} />}
          isExpanded={expandedSections.sync}
          onToggle={() => toggleSection('sync')}
        >
          <StyleSynchronizer
            selectedElements={selectedElements}
            allElements={allElements}
            onBulkStyleUpdate={onBulkStyleUpdate || (() => {})}
          />
        </PropertySection>
      )}

      {/* Multi-selection info */}
      {isMultiSelect && (
        <div className="multi-select-info">
          <p>Multiple elements selected</p>
          <small>Style changes will apply to all selected elements</small>
        </div>
      )}
    </div>
  );
};

export default StyleControls;