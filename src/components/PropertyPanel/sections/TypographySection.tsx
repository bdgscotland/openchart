import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import PropertySection from '../PropertySection';
import PropertyField, { PropertyFieldGroup } from '../PropertyField';
import { ColorField, NumberField, SelectField } from '../fields';
import { useProperty, usePropertyValue } from '../PropertyContext';
import './TypographySection.css';

export interface TypographySectionProps {
  title?: string;
  defaultExpanded?: boolean;
  priority?: number;
}

/**
 * TypographySection - Manages text and font properties
 *
 * Consolidates typography properties that were previously split between
 * "Text" and "Typography" sections in the old system.
 *
 * Key improvements over old system:
 * - Single consolidated location for all text properties
 * - Text content editing integrated with formatting
 * - Quick format toolbar for common operations
 * - Font management with preview
 * - Advanced spacing and decoration controls
 * - Context-aware visibility (only for text-enabled elements)
 */
export const TypographySection: React.FC<TypographySectionProps> = ({
  title = "Typography",
  defaultExpanded = false,
  priority = 80,
}) => {
  const context = useProperty();
  const { selectedElements, elementTypes, selectionType, primaryElement } = context;

  // Property values using the PropertyContext system
  const text = usePropertyValue('text');
  const fontFamily = usePropertyValue('fontFamily');
  const fontSize = usePropertyValue('fontSize');
  const fontWeight = usePropertyValue('fontWeight');
  const fontStyle = usePropertyValue('fontStyle');
  const textAlign = usePropertyValue('textAlign');
  const textColor = usePropertyValue('color');
  const lineHeight = usePropertyValue('lineHeight');
  const letterSpacing = usePropertyValue('letterSpacing');
  const textDecoration = usePropertyValue('textDecoration');
  const textTransform = usePropertyValue('textTransform');

  // Derived state for UI logic
  const hasTextElements = elementTypes.some(type => type !== 'edge'); // Most elements can have text
  const isSingleSelection = selectionType === 'single';
  const isMultiSelection = selectionType === 'multiple';
  const isMixed = selectionType === 'mixed';

  // Font family options (commonly used fonts)
  const fontFamilyOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'system-ui, sans-serif', label: 'System UI' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Monaco, monospace', label: 'Monaco' },
  ];

  // Font size options
  const fontSizeOptions = [
    { value: 10, label: '10px' },
    { value: 11, label: '11px' },
    { value: 12, label: '12px' },
    { value: 14, label: '14px' },
    { value: 16, label: '16px' },
    { value: 18, label: '18px' },
    { value: 20, label: '20px' },
    { value: 24, label: '24px' },
    { value: 28, label: '28px' },
    { value: 32, label: '32px' },
    { value: 36, label: '36px' },
    { value: 48, label: '48px' },
  ];

  // Font weight options
  const fontWeightOptions = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
  ];

  // Text alignment options
  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
    { value: 'justify', label: 'Justify' },
  ];

  // Text decoration options
  const textDecorationOptions = [
    { value: 'none', label: 'None' },
    { value: 'underline', label: 'Underline' },
    { value: 'line-through', label: 'Strike Through' },
    { value: 'overline', label: 'Overline' },
  ];

  // Text transform options
  const textTransformOptions = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
  ];

  // Quick format handlers
  const toggleBold = () => {
    const currentWeight = fontWeight.value || '400';
    const newWeight = ['600', '700', '800'].includes(currentWeight) ? '400' : '700';
    fontWeight.setValue(newWeight);
  };

  const toggleItalic = () => {
    const currentStyle = fontStyle.value || 'normal';
    fontStyle.setValue(currentStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    const currentDecoration = textDecoration.value || 'none';
    textDecoration.setValue(currentDecoration === 'underline' ? 'none' : 'underline');
  };

  // Context-aware property visibility
  if (selectionType === 'none' || !hasTextElements) {
    return null;
  }

  return (
    <PropertySection
      title={title}
      icon={<Type size={16} />}
      defaultExpanded={defaultExpanded}
      priority={priority}
      badge={isMixed ? 'Mixed' : undefined}
    >
      <PropertyFieldGroup>
        {/* Text Content */}
        {isSingleSelection && (
          <PropertyField label="Text Content" orientation="vertical">
            <textarea
              value={text.value || ''}
              onChange={(e) => text.setValue(e.target.value)}
              className="typography-text-input"
              placeholder="Enter text..."
              rows={3}
            />
          </PropertyField>
        )}

        {/* Quick Format Toolbar */}
        <div className="typography-section-group">
          <div className="typography-section-group-header">
            <Type size={14} />
            <span>Quick Format</span>
          </div>

          <div className="typography-quick-format">
            <button
              className={`format-button ${['600', '700', '800'].includes(fontWeight.value || '400') ? 'active' : ''}`}
              onClick={toggleBold}
              title="Bold"
              aria-label="Toggle bold"
            >
              <Bold size={14} />
            </button>

            <button
              className={`format-button ${fontStyle.value === 'italic' ? 'active' : ''}`}
              onClick={toggleItalic}
              title="Italic"
              aria-label="Toggle italic"
            >
              <Italic size={14} />
            </button>

            <button
              className={`format-button ${textDecoration.value === 'underline' ? 'active' : ''}`}
              onClick={toggleUnderline}
              title="Underline"
              aria-label="Toggle underline"
            >
              <Underline size={14} />
            </button>

            <div className="format-divider" />

            <button
              className={`format-button ${textAlign.value === 'left' ? 'active' : ''}`}
              onClick={() => textAlign.setValue('left')}
              title="Align Left"
              aria-label="Align text left"
            >
              <AlignLeft size={14} />
            </button>

            <button
              className={`format-button ${textAlign.value === 'center' ? 'active' : ''}`}
              onClick={() => textAlign.setValue('center')}
              title="Align Center"
              aria-label="Align text center"
            >
              <AlignCenter size={14} />
            </button>

            <button
              className={`format-button ${textAlign.value === 'right' ? 'active' : ''}`}
              onClick={() => textAlign.setValue('right')}
              title="Align Right"
              aria-label="Align text right"
            >
              <AlignRight size={14} />
            </button>
          </div>
        </div>

        {/* Font Properties */}
        <div className="typography-section-group">
          <div className="typography-section-group-header">
            <Type size={14} />
            <span>Font</span>
          </div>

          <PropertyField label="Font Family" orientation="horizontal">
            <SelectField
              value={fontFamily.value}
              onChange={fontFamily.setValue}
              options={fontFamilyOptions}
              placeholder="Select font..."
              searchable
            />
          </PropertyField>

          <div className="typography-section-row">
            <PropertyField label="Size" orientation="horizontal" unit="px">
              <SelectField
                value={fontSize.value}
                onChange={fontSize.setValue}
                options={fontSizeOptions}
                placeholder="Size..."
                searchable={false}
              />
            </PropertyField>

            <PropertyField label="Weight" orientation="horizontal">
              <SelectField
                value={fontWeight.value}
                onChange={fontWeight.setValue}
                options={fontWeightOptions}
                placeholder="Weight..."
                searchable={false}
              />
            </PropertyField>
          </div>

          <PropertyField label="Text Color" orientation="horizontal">
            <ColorField
              value={textColor.value}
              onChange={textColor.setValue}
              placeholder="#000000"
              allowTransparent
              showRecent
            />
          </PropertyField>
        </div>

        {/* Text Styling */}
        <div className="typography-section-group">
          <div className="typography-section-group-header">
            <Type size={14} />
            <span>Styling</span>
          </div>

          <div className="typography-section-row">
            <PropertyField label="Decoration" orientation="horizontal">
              <SelectField
                value={textDecoration.value}
                onChange={textDecoration.setValue}
                options={textDecorationOptions}
                placeholder="None"
                searchable={false}
              />
            </PropertyField>

            <PropertyField label="Transform" orientation="horizontal">
              <SelectField
                value={textTransform.value}
                onChange={textTransform.setValue}
                options={textTransformOptions}
                placeholder="None"
                searchable={false}
              />
            </PropertyField>
          </div>
        </div>

        {/* Advanced Spacing */}
        <div className="typography-section-group">
          <div className="typography-section-group-header">
            <Type size={14} />
            <span>Spacing</span>
          </div>

          <PropertyField label="Line Height" orientation="horizontal">
            <NumberField
              value={lineHeight.value}
              onChange={lineHeight.setValue}
              min={0.5}
              max={3}
              step={0.1}
              precision={1}
            />
          </PropertyField>

          <PropertyField label="Letter Spacing" orientation="horizontal" unit="px">
            <NumberField
              value={letterSpacing.value}
              onChange={letterSpacing.setValue}
              min={-2}
              max={10}
              step={0.1}
              precision={1}
            />
          </PropertyField>
        </div>

        {/* Multi-selection info */}
        {isMultiSelection && (
          <div className="typography-section-info">
            <small>Typography properties will apply to all selected text elements</small>
          </div>
        )}

        {/* Mixed selection info */}
        {isMixed && (
          <div className="typography-section-info">
            <small>Typography properties will apply where supported</small>
          </div>
        )}
      </PropertyFieldGroup>
    </PropertySection>
  );
};

export default TypographySection;