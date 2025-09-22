// BulkStyleControls - Advanced UI for bulk styling operations
// Supports selective property updates, relative adjustments, and smart coordination

import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Copy,
  Search,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { ColorSwatch } from './ColorPicker/ColorSwatch';
import ColorPicker from './ColorPicker/ColorPicker';
import type { DiagramElement, ElementStyle } from '../../types/diagram';
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../core/commands/BulkStyleCommand';
import './BulkStyleControls.css';

export interface BulkStyleControlsProps {
  selectedElements: DiagramElement[];
  onBulkStyleUpdate: (update: BulkStyleUpdate) => void;
  onAlignElements: (operation: AlignmentOperation) => void;
  onDistributeElements: (operation: DistributionOperation) => void;
  onFindAndReplace?: (searchText: string, replaceText: string, matchCase?: boolean) => void;
  className?: string;
}

interface PropertyToggle {
  property: keyof ElementStyle;
  label: string;
  enabled: boolean;
}

interface ColorAdjustment {
  property: 'fill' | 'stroke' | 'color';
  mode: 'replace' | 'adjust-hue' | 'adjust-saturation' | 'adjust-lightness' | 'adjust-opacity';
  value: string | number;
}

const BulkStyleControls: React.FC<BulkStyleControlsProps> = ({
  selectedElements,
  onBulkStyleUpdate,
  onAlignElements,
  onDistributeElements,
  onFindAndReplace,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState({
    selective: true,
    colors: false,
    alignment: false,
    text: false,
    advanced: false,
  });

  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [updateMode, setUpdateMode] = useState<'replace' | 'relative' | 'increment'>('replace');
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  // Compute common values across selected elements
  const commonValues = useMemo(() => {
    if (selectedElements.length === 0) return {};

    const first = selectedElements[0].style;
    const common: Partial<ElementStyle> = {};

    Object.keys(first).forEach(key => {
      const styleKey = key as keyof ElementStyle;
      const firstValue = first[styleKey];

      const allSame = selectedElements.every(el =>
        el.style[styleKey] === firstValue
      );

      if (allSame) {
        common[styleKey] = firstValue;
      }
    });

    return common;
  }, [selectedElements]);

  // Available property toggles
  const propertyToggles: PropertyToggle[] = useMemo(() => [
    { property: 'fill', label: 'Fill Color', enabled: selectedProperties.has('fill') },
    { property: 'stroke', label: 'Border Color', enabled: selectedProperties.has('stroke') },
    { property: 'strokeWidth', label: 'Border Width', enabled: selectedProperties.has('strokeWidth') },
    { property: 'opacity', label: 'Opacity', enabled: selectedProperties.has('opacity') },
    { property: 'fontSize', label: 'Font Size', enabled: selectedProperties.has('fontSize') },
    { property: 'fontWeight', label: 'Font Weight', enabled: selectedProperties.has('fontWeight') },
    { property: 'color', label: 'Text Color', enabled: selectedProperties.has('color') },
    { property: 'cornerRadius', label: 'Corner Radius', enabled: selectedProperties.has('cornerRadius') },
  ], [selectedProperties]);

  const isMultiSelect = selectedElements.length > 1;
  const hasTextElements = selectedElements.some(el => el.text);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const toggleProperty = useCallback((property: keyof ElementStyle) => {
    setSelectedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(property)) {
        newSet.delete(property);
      } else {
        newSet.add(property);
      }
      return newSet;
    });
  }, []);

  const handleBulkUpdate = useCallback((styleUpdates: Partial<ElementStyle>) => {
    onBulkStyleUpdate({
      elementIds: selectedElements.map(el => el.id),
      styleUpdates,
      selectedProperties: selectedProperties.size > 0 ? Array.from(selectedProperties) : undefined,
      mode: updateMode,
    });
  }, [selectedElements, selectedProperties, updateMode, onBulkStyleUpdate]);

  const handleAlignmentClick = useCallback((type: AlignmentOperation['type']) => {
    onAlignElements({
      type,
      elementIds: selectedElements.map(el => el.id),
    });
  }, [selectedElements, onAlignElements]);

  const handleDistributionClick = useCallback((type: DistributionOperation['type']) => {
    onDistributeElements({
      type,
      elementIds: selectedElements.map(el => el.id),
    });
  }, [selectedElements, onDistributeElements]);

  const handleFindAndReplace = useCallback(() => {
    if (onFindAndReplace && findText.trim()) {
      onFindAndReplace(findText, replaceText, matchCase);
      setFindReplaceOpen(false);
      setFindText('');
      setReplaceText('');
    }
  }, [onFindAndReplace, findText, replaceText, matchCase]);

  const applyRelativeColorAdjustment = useCallback((property: 'fill' | 'stroke' | 'color', adjustment: number) => {
    // Create relative color adjustments (simplified for demo)
    const styleUpdate: Partial<ElementStyle> = {};

    if (updateMode === 'increment') {
      // For demo: adjust opacity or other numeric properties
      if (property === 'fill' || property === 'stroke' || property === 'color') {
        // In a real implementation, you'd parse the color and adjust HSL values
        const currentValue = commonValues[property] as string || '#000000';
        styleUpdate[property] = currentValue; // Simplified - actual color math would go here
      }
    }

    handleBulkUpdate(styleUpdate);
  }, [updateMode, commonValues, handleBulkUpdate]);

  if (!isMultiSelect) {
    return (
      <div className={`bulk-style-controls ${className}`}>
        <div className="bulk-controls-message">
          <p>Select multiple elements to use bulk styling</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bulk-style-controls ${className}`}>
      <div className="bulk-controls-header">
        <Settings size={16} />
        <span>Bulk Operations ({selectedElements.length} selected)</span>
      </div>

      {/* Selective Property Updates */}
      <div className="bulk-section">
        <button
          className="bulk-section-header"
          onClick={() => toggleSection('selective')}
          aria-expanded={expandedSections.selective}
        >
          <span className="bulk-section-title">
            <Check size={16} />
            Selective Updates
          </span>
          {expandedSections.selective ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {expandedSections.selective && (
          <div className="bulk-section-content">
            <div className="update-mode-selector">
              <label>Update Mode:</label>
              <select
                value={updateMode}
                onChange={(e) => setUpdateMode(e.target.value as any)}
                className="update-mode-select"
              >
                <option value="replace">Replace Values</option>
                <option value="relative">Relative Scaling</option>
                <option value="increment">Add/Subtract</option>
              </select>
            </div>

            <div className="property-toggles">
              <div className="property-toggles-header">
                <span>Select properties to update:</span>
                <div className="toggle-actions">
                  <button onClick={() => setSelectedProperties(new Set(propertyToggles.map(p => p.property)))}>
                    All
                  </button>
                  <button onClick={() => setSelectedProperties(new Set())}>
                    None
                  </button>
                </div>
              </div>

              <div className="property-toggle-grid">
                {propertyToggles.map(({ property, label, enabled }) => (
                  <label key={property} className={`property-toggle ${enabled ? 'enabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleProperty(property)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Color Operations */}
      <div className="bulk-section">
        <button
          className="bulk-section-header"
          onClick={() => toggleSection('colors')}
          aria-expanded={expandedSections.colors}
        >
          <span className="bulk-section-title">
            <Palette size={16} />
            Batch Colors
          </span>
          {expandedSections.colors ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {expandedSections.colors && (
          <div className="bulk-section-content">
            <div className="color-controls-grid">
              <div className="color-control">
                <label>Fill Color</label>
                <div className="color-input-group">
                  <ColorSwatch
                    color={commonValues.fill || '#ffffff'}
                    size="medium"
                    onClick={() => {}}
                    title="Fill Color"
                  />
                  <input
                    type="color"
                    value={commonValues.fill || '#ffffff'}
                    onChange={(e) => handleBulkUpdate({ fill: e.target.value })}
                  />
                </div>
              </div>

              <div className="color-control">
                <label>Border Color</label>
                <div className="color-input-group">
                  <ColorSwatch
                    color={commonValues.stroke || '#000000'}
                    size="medium"
                    onClick={() => {}}
                    title="Border Color"
                  />
                  <input
                    type="color"
                    value={commonValues.stroke || '#000000'}
                    onChange={(e) => handleBulkUpdate({ stroke: e.target.value })}
                  />
                </div>
              </div>

              {hasTextElements && (
                <div className="color-control">
                  <label>Text Color</label>
                  <div className="color-input-group">
                    <ColorSwatch
                      color={commonValues.color || '#000000'}
                      size="medium"
                      onClick={() => {}}
                      title="Text Color"
                    />
                    <input
                      type="color"
                      value={commonValues.color || '#000000'}
                      onChange={(e) => handleBulkUpdate({ color: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative-adjustments">
              <h4>Relative Adjustments</h4>
              <div className="adjustment-controls">
                <label>
                  Opacity
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={commonValues.opacity || 1}
                    onChange={(e) => handleBulkUpdate({ opacity: parseFloat(e.target.value) })}
                  />
                  <span>{((commonValues.opacity || 1) * 100).toFixed(0)}%</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alignment & Distribution */}
      <div className="bulk-section">
        <button
          className="bulk-section-header"
          onClick={() => toggleSection('alignment')}
          aria-expanded={expandedSections.alignment}
        >
          <span className="bulk-section-title">
            <AlignLeft size={16} />
            Alignment & Distribution
          </span>
          {expandedSections.alignment ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {expandedSections.alignment && (
          <div className="bulk-section-content">
            <div className="alignment-controls">
              <div className="control-group">
                <h4>Horizontal Alignment</h4>
                <div className="button-group">
                  <button
                    onClick={() => handleAlignmentClick('align-left')}
                    title="Align Left"
                    className="alignment-btn"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleAlignmentClick('align-center')}
                    title="Align Center"
                    className="alignment-btn"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() => handleAlignmentClick('align-right')}
                    title="Align Right"
                    className="alignment-btn"
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>

              <div className="control-group">
                <h4>Vertical Alignment</h4>
                <div className="button-group">
                  <button
                    onClick={() => handleAlignmentClick('align-top')}
                    title="Align Top"
                    className="alignment-btn"
                  >
                    <AlignLeft size={16} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                  <button
                    onClick={() => handleAlignmentClick('align-middle')}
                    title="Align Middle"
                    className="alignment-btn"
                  >
                    <AlignCenter size={16} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                  <button
                    onClick={() => handleAlignmentClick('align-bottom')}
                    title="Align Bottom"
                    className="alignment-btn"
                  >
                    <AlignRight size={16} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                </div>
              </div>

              <div className="control-group">
                <h4>Distribution</h4>
                <div className="button-group">
                  <button
                    onClick={() => handleDistributionClick('distribute-horizontal')}
                    title="Distribute Horizontally"
                    className="alignment-btn"
                    disabled={selectedElements.length < 3}
                  >
                    <Layers size={16} />
                    <span>Horizontal</span>
                  </button>
                  <button
                    onClick={() => handleDistributionClick('distribute-vertical')}
                    title="Distribute Vertically"
                    className="alignment-btn"
                    disabled={selectedElements.length < 3}
                  >
                    <Layers size={16} style={{ transform: 'rotate(90deg)' }} />
                    <span>Vertical</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Find & Replace */}
      {hasTextElements && (
        <div className="bulk-section">
          <button
            className="bulk-section-header"
            onClick={() => toggleSection('text')}
            aria-expanded={expandedSections.text}
          >
            <span className="bulk-section-title">
              <Search size={16} />
              Find & Replace Text
            </span>
            {expandedSections.text ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedSections.text && (
            <div className="bulk-section-content">
              <div className="find-replace-controls">
                <div className="input-group">
                  <label>Find:</label>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="Search text..."
                    className="find-input"
                  />
                </div>

                <div className="input-group">
                  <label>Replace with:</label>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replacement text..."
                    className="replace-input"
                  />
                </div>

                <div className="find-replace-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={matchCase}
                      onChange={(e) => setMatchCase(e.target.checked)}
                    />
                    Match case
                  </label>
                </div>

                <div className="find-replace-actions">
                  <button
                    onClick={handleFindAndReplace}
                    disabled={!findText.trim()}
                    className="replace-btn"
                  >
                    Replace All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkStyleControls;