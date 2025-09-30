import React from 'react';
import { Palette } from 'lucide-react';
import PropertySection from '../PropertySection';
import PropertyField, { PropertyFieldGroup } from '../PropertyField';
import { ColorField, NumberField, SelectField } from '../fields';
import { useProperty, usePropertyValue } from '../PropertyContext';
import './VisualSection.css';

export interface VisualSectionProps {
  title?: string;
  defaultExpanded?: boolean;
  priority?: number;
}

/**
 * VisualSection - Manages visual appearance properties
 *
 * Consolidates fill, stroke, opacity, and effects properties that were
 * previously scattered across "Appearance" and other sections.
 *
 * Key improvements over old system:
 * - Logical grouping of related visual properties
 * - Context-aware property visibility (shape vs text vs connections)
 * - Clean compound component API
 * - Proper multi-selection handling with mixed value indicators
 */
export const VisualSection: React.FC<VisualSectionProps> = ({
  title = "Visual",
  defaultExpanded = false,
  priority = 100,
}) => {
  const context = useProperty();
  const { selectedElements, elementTypes, selectionType } = context;

  // Property values using the PropertyContext system
  const fill = usePropertyValue('fill');
  const stroke = usePropertyValue('stroke');
  const strokeWidth = usePropertyValue('strokeWidth');
  const opacity = usePropertyValue('opacity');
  const cornerRadius = usePropertyValue('cornerRadius');

  // Derived state for UI logic
  const hasNodes = elementTypes.includes('rectangle') || elementTypes.includes('circle') || elementTypes.includes('diamond');
  const hasEdges = elementTypes.includes('edge');
  const showCornerRadius = elementTypes.includes('rectangle') || elementTypes.includes('diamond');
  const isMixed = selectionType === 'mixed';

  // Context-aware property visibility
  if (selectionType === 'none') {
    return null;
  }

  // Edge-only selections have limited visual properties
  if (hasEdges && !hasNodes) {
    return (
      <PropertySection
        title={title}
        icon={<Palette size={16} />}
        defaultExpanded={defaultExpanded}
        priority={priority}
        badge={isMixed ? 'Mixed' : undefined}
      >
        <PropertyFieldGroup>
          <PropertyField label="Line Color" orientation="horizontal">
            <ColorField
              value={stroke.value}
              onChange={stroke.setValue}
              placeholder="#000000"
              allowTransparent
              showRecent
            />
          </PropertyField>

          <PropertyField label="Line Width" orientation="horizontal" unit="px">
            <NumberField
              value={strokeWidth.value}
              onChange={strokeWidth.setValue}
              min={0}
              max={20}
              step={1}
              precision={0}
            />
          </PropertyField>

          <PropertyField label="Opacity" orientation="horizontal">
            <NumberField
              value={opacity.value}
              onChange={opacity.setValue}
              min={0}
              max={1}
              step={0.1}
              precision={1}
            />
          </PropertyField>
        </PropertyFieldGroup>
      </PropertySection>
    );
  }

  // Standard visual properties for shapes
  return (
    <PropertySection
      title={title}
      icon={<Palette size={16} />}
      defaultExpanded={defaultExpanded}
      priority={priority}
      badge={isMixed ? 'Mixed' : undefined}
    >
      <PropertyFieldGroup>
        {/* Primary Colors Row */}
        <div className="visual-section-row">
          <PropertyField label="Fill" orientation="horizontal">
            <ColorField
              value={fill.value}
              onChange={fill.setValue}
              placeholder="#ffffff"
              allowTransparent
              showRecent
            />
          </PropertyField>

          <PropertyField label="Stroke" orientation="horizontal">
            <ColorField
              value={stroke.value}
              onChange={stroke.setValue}
              placeholder="#000000"
              allowTransparent
              showRecent
            />
          </PropertyField>
        </div>

        {/* Stroke and Opacity Row */}
        <div className="visual-section-row">
          <PropertyField label="Stroke Width" orientation="horizontal" unit="px">
            <NumberField
              value={strokeWidth.value}
              onChange={strokeWidth.setValue}
              min={0}
              max={20}
              step={1}
              precision={0}
            />
          </PropertyField>

          <PropertyField label="Opacity" orientation="horizontal">
            <NumberField
              value={opacity.value}
              onChange={opacity.setValue}
              min={0}
              max={1}
              step={0.1}
              precision={1}
            />
          </PropertyField>
        </div>

        {/* Shape-specific properties */}
        {showCornerRadius && (
          <PropertyField label="Corner Radius" orientation="horizontal" unit="px">
            <NumberField
              value={cornerRadius.value}
              onChange={cornerRadius.setValue}
              min={0}
              max={50}
              step={1}
              precision={0}
            />
          </PropertyField>
        )}

        {/* Mixed selection info */}
        {isMixed && (
          <div className="visual-section-info">
            <small>Visual properties will apply where supported</small>
          </div>
        )}
      </PropertyFieldGroup>
    </PropertySection>
  );
};

export default VisualSection;