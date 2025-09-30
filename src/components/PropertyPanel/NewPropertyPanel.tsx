import React, { useMemo } from 'react';
import { ChevronRight, Palette, Layout, Type, Layers } from 'lucide-react';
import { PropertyProvider, useProperty, PropertyDefinition } from './PropertyContext';
import PropertySection from './PropertySection';
import PropertyField from './PropertyField';
import { NumberField, ColorField, SelectField } from './fields';
import type { DiagramElement, ElementStyle } from '../../types/diagram';
import './NewPropertyPanel.css';

/**
 * Props for the new PropertyPanel component
 */
export interface NewPropertyPanelProps {
  /** Selected elements to show properties for */
  selectedElements: DiagramElement[];

  /** Callback when element style is updated */
  onUpdateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyle>) => void;

  /** Callback when element text is updated */
  onUpdateElementText?: (elementId: string, text: string) => void;

  /** Callback when element position is updated */
  onUpdateElementPosition?: (elementId: string, x: number, y: number) => void;

  /** Callback when element size is updated */
  onUpdateElementSize?: (elementId: string, width: number, height: number) => void;

  /** Whether the panel is visible */
  isVisible?: boolean;

  /** Callback to toggle panel visibility */
  onToggleVisibility?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Property field renderer component
 */
const PropertyFieldRenderer: React.FC<{ definition: PropertyDefinition }> = ({ definition }) => {
  const { value, hasMultipleValues, setValue } = usePropertyValue(definition.key);

  const renderField = () => {
    switch (definition.type) {
      case 'color':
        return (
          <ColorField
            value={value || '#000000'}
            onChange={setValue}
            size="medium"
            allowEmpty={definition.key === 'fill'}
          />
        );

      case 'number':
      case 'range':
        return (
          <NumberField
            value={value || 0}
            onChange={setValue}
            min={definition.min}
            max={definition.max}
            step={definition.step}
            precision={definition.step && definition.step < 1 ? 1 : 0}
            size="medium"
          />
        );

      case 'select':
        return (
          <SelectField
            value={value}
            onChange={setValue}
            options={definition.options || []}
            size="medium"
            placeholder={`Select ${definition.label.toLowerCase()}...`}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            className="property-input"
            placeholder={`Enter ${definition.label.toLowerCase()}...`}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => setValue(e.target.checked)}
            className="property-checkbox"
          />
        );

      default:
        return null;
    }
  };

  return (
    <PropertyField
      label={definition.label}
      hasMultipleValues={hasMultipleValues}
      unit={definition.unit}
      width="full"
    >
      {renderField()}
    </PropertyField>
  );
};

/**
 * Hook to use property value with context
 */
const usePropertyValue = (key: string) => {
  const context = useProperty();
  const value = getNestedValue(context.properties, key);
  const hasMultiple = context.hasMultipleValues(key);

  return {
    value: hasMultiple ? undefined : value,
    hasMultipleValues: hasMultiple,
    setValue: (newValue: any) => context.updateProperty(key, newValue),
  };
};

/**
 * Utility to get nested object values
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * PropertySection groups
 */
const PropertySectionGroup: React.FC<{
  title: string;
  icon: React.ReactNode;
  properties: PropertyDefinition[];
  priority: number;
}> = ({ title, icon, properties, priority }) => {
  const context = useProperty();

  // Filter properties that are visible for current context
  const visibleProperties = useMemo(() => {
    return properties.filter(prop =>
      !prop.visible || prop.visible(context)
    ).sort((a, b) => b.priority - a.priority);
  }, [properties, context]);

  if (visibleProperties.length === 0) {
    return null;
  }

  const badge = context.selectionType === 'mixed' ? 'Mixed' : undefined;

  return (
    <PropertySection
      title={title}
      icon={icon}
      badge={badge}
      priority={priority}
      defaultExpanded={priority > 50} // Auto-expand high priority sections
    >
      {visibleProperties.map(property => (
        <PropertyFieldRenderer
          key={property.key}
          definition={property}
        />
      ))}
    </PropertySection>
  );
};

/**
 * Selection info component
 */
const SelectionInfo: React.FC = () => {
  const { selectedElements, selectionType, elementTypes } = useProperty();

  if (selectedElements.length === 0) {
    return (
      <div className="property-panel__empty">
        <p>No elements selected</p>
        <span>Select one or more elements to edit their properties</span>
      </div>
    );
  }

  const getSelectionSummary = () => {
    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      return `${element.type} selected`;
    }

    if (selectionType === 'multiple') {
      return `${selectedElements.length} ${elementTypes[0]}s selected`;
    }

    return `${selectedElements.length} elements selected`;
  };

  return (
    <div className="property-panel__selection-info">
      <h3>{getSelectionSummary()}</h3>
      {selectionType === 'mixed' && (
        <p>Multiple element types selected. Some properties may not apply to all elements.</p>
      )}
    </div>
  );
};

/**
 * Main PropertyPanel content component (used within PropertyProvider)
 */
const PropertyPanelContent: React.FC = () => {
  const { availableProperties, selectedElements } = useProperty();

  // Group properties by section
  const propertiesBySection = useMemo(() => {
    const groups = {
      visual: availableProperties.filter(p => p.section === 'visual'),
      layout: availableProperties.filter(p => p.section === 'layout'),
      typography: availableProperties.filter(p => p.section === 'typography'),
      effects: availableProperties.filter(p => p.section === 'effects'),
      advanced: availableProperties.filter(p => p.section === 'advanced'),
    };

    return groups;
  }, [availableProperties]);

  if (selectedElements.length === 0) {
    return <SelectionInfo />;
  }

  return (
    <div className="property-panel__content">
      <SelectionInfo />

      {/* Visual Properties */}
      <PropertySectionGroup
        title="Appearance"
        icon={<Palette size={16} />}
        properties={propertiesBySection.visual}
        priority={100}
      />

      {/* Layout Properties */}
      <PropertySectionGroup
        title="Layout"
        icon={<Layout size={16} />}
        properties={propertiesBySection.layout}
        priority={80}
      />

      {/* Typography Properties */}
      <PropertySectionGroup
        title="Typography"
        icon={<Type size={16} />}
        properties={propertiesBySection.typography}
        priority={70}
      />

      {/* Effects Properties */}
      <PropertySectionGroup
        title="Effects"
        icon={<Layers size={16} />}
        properties={propertiesBySection.effects}
        priority={60}
      />

      {/* Advanced Properties */}
      <PropertySectionGroup
        title="Advanced"
        icon={<Layers size={16} />}
        properties={propertiesBySection.advanced}
        priority={40}
      />
    </div>
  );
};

/**
 * New PropertyPanel component with compound component architecture
 */
const NewPropertyPanel: React.FC<NewPropertyPanelProps> = ({
  selectedElements,
  onUpdateElementStyle,
  onUpdateElementText,
  onUpdateElementPosition,
  onUpdateElementSize,
  isVisible = true,
  onToggleVisibility,
  className = '',
}) => {
  if (!isVisible) {
    return (
      <div className={`property-panel property-panel--collapsed ${className}`}>
        <button
          className="property-panel__toggle property-panel__toggle--collapsed"
          onClick={onToggleVisibility}
          aria-label="Show Properties Panel"
          title="Show Properties Panel"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <PropertyProvider
      selectedElements={selectedElements}
      onUpdateElementStyle={onUpdateElementStyle}
      onUpdateElementText={onUpdateElementText}
      onUpdateElementPosition={onUpdateElementPosition}
      onUpdateElementSize={onUpdateElementSize}
    >
      <div className={`property-panel property-panel--visible ${className}`}>
        {/* Header */}
        <div className="property-panel__header">
          <h2 className="property-panel__title">Properties</h2>
          {onToggleVisibility && (
            <button
              className="property-panel__toggle"
              onClick={onToggleVisibility}
              aria-label="Hide Properties Panel"
              title="Hide Properties Panel"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <PropertyPanelContent />
      </div>
    </PropertyProvider>
  );
};

// Compound component exports
NewPropertyPanel.Section = PropertySection;
NewPropertyPanel.Field = PropertyField;
NewPropertyPanel.Provider = PropertyProvider;

export default NewPropertyPanel;