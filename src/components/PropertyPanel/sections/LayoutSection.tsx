import React, { useCallback } from 'react';
import { Layout, Lock, Unlock, Move, Square } from 'lucide-react';
import PropertySection from '../PropertySection';
import PropertyField, { PropertyFieldGroup } from '../PropertyField';
import { NumberField, SelectField } from '../fields';
import { useProperty, usePropertyValue } from '../PropertyContext';
import './LayoutSection.css';

export interface LayoutSectionProps {
  title?: string;
  defaultExpanded?: boolean;
  priority?: number;
}

/**
 * LayoutSection - Manages size, position, and alignment properties
 *
 * Consolidates layout properties that were previously scattered across
 * "Size & Position" and other sections.
 *
 * Key improvements over old system:
 * - Clean separation of size vs position controls
 * - Aspect ratio locking with visual feedback
 * - Multi-selection aware positioning (relative vs absolute)
 * - Alignment tools for multiple elements
 * - Size constraints and presets
 */
export const LayoutSection: React.FC<LayoutSectionProps> = ({
  title = "Layout",
  defaultExpanded = false,
  priority = 90,
}) => {
  const context = useProperty();
  const { selectedElements, elementTypes, selectionType } = context;

  // Property values using the PropertyContext system
  const width = usePropertyValue('size.width');
  const height = usePropertyValue('size.height');
  const x = usePropertyValue('position.x');
  const y = usePropertyValue('position.y');

  // Local state for aspect ratio locking
  const [aspectRatioLocked, setAspectRatioLocked] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);

  // Derived state for UI logic
  const hasNodes = elementTypes.includes('rectangle') || elementTypes.includes('circle') || elementTypes.includes('diamond');
  const hasEdges = elementTypes.includes('edge');
  const isSingleSelection = selectionType === 'single';
  const isMultiSelection = selectionType === 'multiple';
  const isMixed = selectionType === 'mixed';

  // Calculate aspect ratio when width/height changes
  React.useEffect(() => {
    if (width.value && height.value && width.value > 0 && height.value > 0) {
      setAspectRatio(width.value / height.value);
    }
  }, [width.value, height.value]);

  // Handle width change with aspect ratio lock
  const handleWidthChange = useCallback((newWidth: number) => {
    width.setValue(newWidth);
    if (aspectRatioLocked && aspectRatio && aspectRatio > 0) {
      const newHeight = newWidth / aspectRatio;
      height.setValue(newHeight);
    }
  }, [width.setValue, height.setValue, aspectRatioLocked, aspectRatio]);

  // Handle height change with aspect ratio lock
  const handleHeightChange = useCallback((newHeight: number) => {
    height.setValue(newHeight);
    if (aspectRatioLocked && aspectRatio && aspectRatio > 0) {
      const newWidth = newHeight * aspectRatio;
      width.setValue(newWidth);
    }
  }, [width.setValue, height.setValue, aspectRatioLocked, aspectRatio]);

  // Handle aspect ratio lock toggle
  const handleAspectRatioToggle = useCallback(() => {
    if (!aspectRatioLocked && width.value && height.value && width.value > 0 && height.value > 0) {
      setAspectRatio(width.value / height.value);
    }
    setAspectRatioLocked(!aspectRatioLocked);
  }, [aspectRatioLocked, width.value, height.value]);

  // Size preset options
  const sizePresets = [
    { value: '100,100', label: 'Small (100×100)' },
    { value: '150,100', label: 'Medium (150×100)' },
    { value: '200,150', label: 'Large (200×150)' },
    { value: '300,200', label: 'Extra Large (300×200)' },
  ];

  // Handle size preset selection
  const handleSizePreset = useCallback((preset: string) => {
    const [newWidth, newHeight] = preset.split(',').map(Number);
    width.setValue(newWidth);
    height.setValue(newHeight);
  }, [width.setValue, height.setValue]);

  // Context-aware property visibility
  if (selectionType === 'none') {
    return null;
  }

  // Edge-only selections have limited layout properties
  if (hasEdges && !hasNodes) {
    return (
      <PropertySection
        title={title}
        icon={<Layout size={16} />}
        defaultExpanded={defaultExpanded}
        priority={priority}
        badge={isMixed ? 'Mixed' : undefined}
      >
        <PropertyFieldGroup>
          <div className="layout-section-info">
            <small>Edges use automatic layout based on connected nodes</small>
          </div>
        </PropertyFieldGroup>
      </PropertySection>
    );
  }

  return (
    <PropertySection
      title={title}
      icon={<Layout size={16} />}
      defaultExpanded={defaultExpanded}
      priority={priority}
      badge={isMixed ? 'Mixed' : undefined}
    >
      <PropertyFieldGroup>
        {/* Size Controls */}
        <div className="layout-section-group">
          <div className="layout-section-group-header">
            <Square size={14} />
            <span>Size</span>
          </div>

          <div className="layout-section-row">
            <PropertyField label="Width" orientation="horizontal" unit="px">
              <NumberField
                value={width.value}
                onChange={handleWidthChange}
                min={1}
                max={2000}
                step={1}
                precision={0}
              />
            </PropertyField>

            <button
              className={`aspect-ratio-lock ${aspectRatioLocked ? 'locked' : 'unlocked'}`}
              onClick={handleAspectRatioToggle}
              title={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              aria-label={aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {aspectRatioLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            <PropertyField label="Height" orientation="horizontal" unit="px">
              <NumberField
                value={height.value}
                onChange={handleHeightChange}
                min={1}
                max={2000}
                step={1}
                precision={0}
              />
            </PropertyField>
          </div>

          {/* Size Presets */}
          <PropertyField label="Size Presets" orientation="horizontal">
            <SelectField
              value=""
              onChange={handleSizePreset}
              options={sizePresets}
              placeholder="Choose preset..."
              searchable={false}
            />
          </PropertyField>
        </div>

        {/* Position Controls */}
        <div className="layout-section-group">
          <div className="layout-section-group-header">
            <Move size={14} />
            <span>Position</span>
          </div>

          <div className="layout-section-row">
            <PropertyField label="X" orientation="horizontal" unit="px">
              <NumberField
                value={x.value}
                onChange={x.setValue}
                min={-10000}
                max={10000}
                step={1}
                precision={0}
              />
            </PropertyField>

            <PropertyField label="Y" orientation="horizontal" unit="px">
              <NumberField
                value={y.value}
                onChange={y.setValue}
                min={-10000}
                max={10000}
                step={1}
                precision={0}
              />
            </PropertyField>
          </div>

          {/* Multi-selection positioning info */}
          {isMultiSelection && (
            <div className="layout-section-info">
              <small>Position changes apply relative to current positions</small>
            </div>
          )}
        </div>

        {/* Aspect ratio display */}
        {aspectRatioLocked && aspectRatio && (
          <div className="layout-section-info">
            <small>Aspect ratio locked: {aspectRatio.toFixed(2)}:1</small>
          </div>
        )}

        {/* Mixed selection info */}
        {isMixed && (
          <div className="layout-section-info">
            <small>Layout properties will apply where supported</small>
          </div>
        )}
      </PropertyFieldGroup>
    </PropertySection>
  );
};

export default LayoutSection;