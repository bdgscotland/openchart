import React, { useState, useCallback, useMemo } from 'react';
import { Check, Copy, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import type { ElementStyle } from '../../types/diagram';

export interface StylePropertyGroup {
  name: string;
  label: string;
  properties: StylePropertyDefinition[];
  isExpanded?: boolean;
}

export interface StylePropertyDefinition {
  key: keyof ElementStyle;
  label: string;
  type: 'color' | 'number' | 'select' | 'boolean';
  options?: string[]; // For select type
  unit?: string; // For number type
  description?: string;
}

export interface SelectiveStyleCopyProps {
  sourceStyle: ElementStyle;
  onStyleCopy?: (selectedProperties: Partial<ElementStyle>, propertyNames: string[]) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * SelectiveStyleCopy - Choose which style properties to copy
 * Organized into logical groups with detailed controls
 */
export const SelectiveStyleCopy: React.FC<SelectiveStyleCopyProps> = ({
  sourceStyle,
  onStyleCopy,
  onCancel,
  className = '',
}) => {
  const [selectedProperties, setSelectedProperties] = useState<Set<keyof ElementStyle>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['appearance']));

  // Define property groups
  const propertyGroups: StylePropertyGroup[] = useMemo(() => [
    {
      name: 'appearance',
      label: 'Appearance',
      properties: [
        { key: 'fill', label: 'Fill Color', type: 'color', description: 'Background/fill color' },
        { key: 'stroke', label: 'Border Color', type: 'color', description: 'Border/outline color' },
        { key: 'strokeWidth', label: 'Border Width', type: 'number', unit: 'px', description: 'Border thickness' },
        { key: 'opacity', label: 'Opacity', type: 'number', description: 'Transparency (0-1)' },
        { key: 'cornerRadius', label: 'Corner Radius', type: 'number', unit: 'px', description: 'Rounded corners' },
      ],
    },
    {
      name: 'typography',
      label: 'Typography',
      properties: [
        { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', description: 'Text size' },
        { key: 'fontFamily', label: 'Font Family', type: 'select', description: 'Font face' },
        { key: 'fontWeight', label: 'Font Weight', type: 'select',
          options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'],
          description: 'Font thickness' },
        { key: 'fontStyle', label: 'Font Style', type: 'select',
          options: ['normal', 'italic', 'oblique'], description: 'Font style' },
        { key: 'color', label: 'Text Color', type: 'color', description: 'Text color' },
      ],
    },
    {
      name: 'text-formatting',
      label: 'Text Formatting',
      properties: [
        { key: 'textAlign', label: 'Text Align', type: 'select',
          options: ['left', 'center', 'right', 'justify'], description: 'Text alignment' },
        { key: 'textDecoration', label: 'Text Decoration', type: 'select',
          options: ['none', 'underline', 'overline', 'line-through', 'underline overline'],
          description: 'Text decoration' },
        { key: 'textTransform', label: 'Text Transform', type: 'select',
          options: ['none', 'uppercase', 'lowercase', 'capitalize'],
          description: 'Text case transformation' },
        { key: 'lineHeight', label: 'Line Height', type: 'number', description: 'Line spacing' },
        { key: 'letterSpacing', label: 'Letter Spacing', type: 'number', unit: 'px', description: 'Character spacing' },
        { key: 'wordSpacing', label: 'Word Spacing', type: 'number', unit: 'px', description: 'Word spacing' },
        { key: 'textShadow', label: 'Text Shadow', type: 'select', description: 'Text shadow effect' },
      ],
    },
  ], []);

  // Filter groups to only show properties that exist in the source style
  const availableGroups = useMemo(() => {
    return propertyGroups.map(group => ({
      ...group,
      properties: group.properties.filter(prop =>
        sourceStyle[prop.key] !== undefined && sourceStyle[prop.key] !== null
      ),
    })).filter(group => group.properties.length > 0);
  }, [propertyGroups, sourceStyle]);

  // Toggle property selection
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

  // Toggle group selection
  const toggleGroup = useCallback((groupName: string) => {
    const group = availableGroups.find(g => g.name === groupName);
    if (!group) return;

    const groupProperties = group.properties.map(p => p.key);
    const allSelected = groupProperties.every(prop => selectedProperties.has(prop));

    setSelectedProperties(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in group
        groupProperties.forEach(prop => newSet.delete(prop));
      } else {
        // Select all in group
        groupProperties.forEach(prop => newSet.add(prop));
      }
      return newSet;
    });
  }, [availableGroups, selectedProperties]);

  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  // Select all properties
  const selectAll = useCallback(() => {
    const allProperties = availableGroups.flatMap(group => group.properties.map(p => p.key));
    setSelectedProperties(new Set(allProperties));
  }, [availableGroups]);

  // Deselect all properties
  const selectNone = useCallback(() => {
    setSelectedProperties(new Set());
  }, []);

  // Handle copy
  const handleCopy = useCallback(() => {
    const selectedStyle: Partial<ElementStyle> = {};
    const propertyNames: string[] = [];

    selectedProperties.forEach(property => {
      if (sourceStyle[property] !== undefined) {
        (selectedStyle as any)[property] = sourceStyle[property];
        propertyNames.push(property);
      }
    });

    onStyleCopy?.(selectedStyle, propertyNames);
  }, [selectedProperties, sourceStyle, onStyleCopy]);

  // Format property value for display
  const formatPropertyValue = useCallback((property: StylePropertyDefinition, value: any): string => {
    if (value === undefined || value === null) return 'none';

    switch (property.type) {
      case 'color':
        return value;
      case 'number':
        return `${value}${property.unit || ''}`;
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }, []);

  const hasSelection = selectedProperties.size > 0;

  return (
    <div className={`selective-style-copy ${className}`}>
      {/* Header */}
      <div className="selective-copy-header">
        <div className="selective-copy-title">
          <Settings size={16} />
          <span>Choose Style Properties</span>
        </div>
        <div className="selective-copy-stats">
          {selectedProperties.size} of {availableGroups.flatMap(g => g.properties).length} selected
        </div>
      </div>

      {/* Global actions */}
      <div className="selective-copy-actions">
        <button
          className="select-all-button"
          onClick={selectAll}
          disabled={selectedProperties.size === availableGroups.flatMap(g => g.properties).length}
        >
          Select All
        </button>
        <button
          className="select-none-button"
          onClick={selectNone}
          disabled={selectedProperties.size === 0}
        >
          Select None
        </button>
      </div>

      {/* Property groups */}
      <div className="selective-copy-groups">
        {availableGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.name);
          const groupProperties = group.properties.map(p => p.key);
          const selectedInGroup = groupProperties.filter(prop => selectedProperties.has(prop)).length;
          const allInGroupSelected = selectedInGroup === groupProperties.length;
          const someInGroupSelected = selectedInGroup > 0 && selectedInGroup < groupProperties.length;

          return (
            <div key={group.name} className={`property-group ${isExpanded ? 'expanded' : 'collapsed'}`}>
              {/* Group header */}
              <div className="property-group-header">
                <button
                  className="group-expand-button"
                  onClick={() => toggleGroupExpansion(group.name)}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <label className="group-checkbox-label">
                  <input
                    type="checkbox"
                    checked={allInGroupSelected}
                    ref={input => {
                      if (input) input.indeterminate = someInGroupSelected;
                    }}
                    onChange={() => toggleGroup(group.name)}
                  />
                  <span className="group-label">{group.label}</span>
                  <span className="group-count">({selectedInGroup}/{groupProperties.length})</span>
                </label>
              </div>

              {/* Group properties */}
              {isExpanded && (
                <div className="property-group-content">
                  {group.properties.map((property) => {
                    const isSelected = selectedProperties.has(property.key);
                    const value = sourceStyle[property.key];

                    return (
                      <div
                        key={property.key}
                        className={`property-item ${isSelected ? 'selected' : ''}`}
                      >
                        <label className="property-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProperty(property.key)}
                          />
                          <div className="property-info">
                            <span className="property-label">{property.label}</span>
                            <span className="property-value">
                              {formatPropertyValue(property, value)}
                            </span>
                          </div>
                        </label>

                        {/* Property preview */}
                        {property.type === 'color' && value && (
                          <div
                            className="property-color-preview"
                            style={{ backgroundColor: value }}
                            title={value}
                          />
                        )}

                        {property.description && (
                          <div className="property-description">
                            {property.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="selective-copy-footer">
        <button
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className={`copy-button ${hasSelection ? 'enabled' : 'disabled'}`}
          onClick={handleCopy}
          disabled={!hasSelection}
        >
          <Copy size={16} />
          Copy Selected Properties ({selectedProperties.size})
        </button>
      </div>

      {/* Preview */}
      {hasSelection && (
        <div className="selective-copy-preview">
          <div className="preview-header">Preview:</div>
          <div className="preview-content">
            {Array.from(selectedProperties).map(property => {
              const propertyDef = availableGroups
                .flatMap(g => g.properties)
                .find(p => p.key === property);
              const value = sourceStyle[property];

              return (
                <div key={property} className="preview-property">
                  <span className="preview-property-name">
                    {propertyDef?.label || property}:
                  </span>
                  <span className="preview-property-value">
                    {formatPropertyValue(propertyDef!, value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectiveStyleCopy;