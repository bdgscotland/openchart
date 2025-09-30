import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import type { DiagramElement, ElementStyle } from '../../types/diagram';

/**
 * Property context value interface for managing property panel state
 */
export interface PropertyContextValue {
  // Selected elements and their properties
  selectedElements: DiagramElement[];

  // Combined properties from all selected elements
  // undefined = mixed values, null = no value set
  properties: Record<string, any>;

  // Update a property for all selected elements
  updateProperty: (key: string, value: any) => void;

  // Update multiple properties at once
  updateProperties: (updates: Record<string, any>) => void;

  // Check if property has mixed values across selection
  hasMultipleValues: (key: string) => boolean;

  // Get the primary element (first selected or most recently selected)
  primaryElement: DiagramElement | null;

  // Selection type information
  selectionType: 'single' | 'multiple' | 'mixed' | 'none';
  elementTypes: string[]; // Types of selected elements

  // Context-aware property availability
  availableProperties: PropertyDefinition[];
}

/**
 * Property definition for dynamic rendering
 */
export interface PropertyDefinition {
  key: string;
  label: string;
  type: 'color' | 'number' | 'select' | 'text' | 'boolean' | 'range';
  section: 'visual' | 'layout' | 'typography' | 'effects' | 'advanced';
  priority: number; // Higher priority shows first
  options?: { value: any; label: string }[]; // For select type
  min?: number; // For number/range type
  max?: number; // For number/range type
  step?: number; // For number/range type
  unit?: string; // Display unit (px, %, etc.)
  dependencies?: string[]; // Other properties this depends on
  visible?: (context: PropertyContextValue) => boolean;
}

/**
 * Props for PropertyProvider component
 */
export interface PropertyProviderProps {
  children: ReactNode;
  selectedElements: DiagramElement[];
  onUpdateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyle>) => void;
  onUpdateElementText?: (elementId: string, text: string) => void;
  onUpdateElementPosition?: (elementId: string, x: number, y: number) => void;
  onUpdateElementSize?: (elementId: string, width: number, height: number) => void;
}

/**
 * Property definitions for different element types
 */
const PROPERTY_DEFINITIONS: PropertyDefinition[] = [
  // Visual properties (always visible for shape elements)
  {
    key: 'fill',
    label: 'Fill',
    type: 'color',
    section: 'visual',
    priority: 100,
  },
  {
    key: 'stroke',
    label: 'Border',
    type: 'color',
    section: 'visual',
    priority: 90,
  },
  {
    key: 'strokeWidth',
    label: 'Border Width',
    type: 'number',
    section: 'visual',
    priority: 85,
    min: 0,
    max: 20,
    step: 0.5,
    unit: 'px',
  },
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'range',
    section: 'visual',
    priority: 80,
    min: 0,
    max: 1,
    step: 0.1,
    unit: '%',
  },
  {
    key: 'cornerRadius',
    label: 'Corner Radius',
    type: 'number',
    section: 'visual',
    priority: 70,
    min: 0,
    max: 50,
    step: 1,
    unit: 'px',
    visible: (context) =>
      context.elementTypes.some(type => ['rectangle', 'arrow'].includes(type)),
  },

  // Layout properties
  {
    key: 'position.x',
    label: 'X Position',
    type: 'number',
    section: 'layout',
    priority: 60,
    unit: 'px',
  },
  {
    key: 'position.y',
    label: 'Y Position',
    type: 'number',
    section: 'layout',
    priority: 55,
    unit: 'px',
  },
  {
    key: 'size.width',
    label: 'Width',
    type: 'number',
    section: 'layout',
    priority: 50,
    min: 1,
    unit: 'px',
  },
  {
    key: 'size.height',
    label: 'Height',
    type: 'number',
    section: 'layout',
    priority: 45,
    min: 1,
    unit: 'px',
  },

  // Typography properties (only for text elements or elements with text)
  {
    key: 'fontSize',
    label: 'Font Size',
    type: 'number',
    section: 'typography',
    priority: 40,
    min: 8,
    max: 72,
    step: 1,
    unit: 'px',
    visible: (context) =>
      context.elementTypes.includes('text') ||
      context.selectedElements.some(el => el.text),
  },
  {
    key: 'fontFamily',
    label: 'Font Family',
    type: 'select',
    section: 'typography',
    priority: 35,
    options: [
      { value: 'Arial, sans-serif', label: 'Arial' },
      { value: 'Helvetica, sans-serif', label: 'Helvetica' },
      { value: 'Georgia, serif', label: 'Georgia' },
      { value: 'Times New Roman, serif', label: 'Times New Roman' },
      { value: 'Courier New, monospace', label: 'Courier New' },
    ],
    visible: (context) =>
      context.elementTypes.includes('text') ||
      context.selectedElements.some(el => el.text),
  },
  {
    key: 'fontWeight',
    label: 'Font Weight',
    type: 'select',
    section: 'typography',
    priority: 30,
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'bold', label: 'Bold' },
      { value: '300', label: 'Light' },
      { value: '600', label: 'Semi Bold' },
    ],
    visible: (context) =>
      context.elementTypes.includes('text') ||
      context.selectedElements.some(el => el.text),
  },
  {
    key: 'textAlign',
    label: 'Text Align',
    type: 'select',
    section: 'typography',
    priority: 25,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
      { value: 'justify', label: 'Justify' },
    ],
    visible: (context) =>
      context.elementTypes.includes('text') ||
      context.selectedElements.some(el => el.text),
  },
  {
    key: 'color',
    label: 'Text Color',
    type: 'color',
    section: 'typography',
    priority: 20,
    visible: (context) =>
      context.elementTypes.includes('text') ||
      context.selectedElements.some(el => el.text),
  },
];

/**
 * Create the PropertyPanel context
 */
const PropertyContext = createContext<PropertyContextValue | null>(null);

/**
 * Hook to use the PropertyPanel context
 */
export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

/**
 * Hook to get a specific property value with multi-value handling
 */
export const usePropertyValue = (key: string) => {
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
 * Utility function to get nested object values using dot notation
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Utility function to set nested object values using dot notation
 */
const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
};

/**
 * PropertyProvider component that manages property panel state
 */
export const PropertyProvider: React.FC<PropertyProviderProps> = ({
  children,
  selectedElements,
  onUpdateElementStyle,
  onUpdateElementText,
  onUpdateElementPosition,
  onUpdateElementSize,
}) => {
  // Calculate combined properties from all selected elements
  const properties = useMemo(() => {
    if (selectedElements.length === 0) return {};

    const combined: Record<string, any> = {};

    // Start with the first element's properties
    const firstElement = selectedElements[0];

    // Add style properties
    Object.entries(firstElement.style || {}).forEach(([key, value]) => {
      combined[key] = value;
    });

    // Add other element properties
    combined['position.x'] = firstElement.position.x;
    combined['position.y'] = firstElement.position.y;
    combined['size.width'] = firstElement.size?.width || firstElement.data?.width || firstElement.style?.width || 150;
    combined['size.height'] = firstElement.size?.height || firstElement.data?.height || firstElement.style?.height || 100;
    combined['text'] = firstElement.text || firstElement.data?.label;

    return combined;
  }, [selectedElements]);

  // Check if a property has multiple values across selection
  const hasMultipleValues = useCallback((key: string): boolean => {
    if (selectedElements.length <= 1) return false;

    const firstValue = getNestedValue(selectedElements[0], key) ??
                      getNestedValue(selectedElements[0].style, key);

    return selectedElements.slice(1).some(element => {
      const value = getNestedValue(element, key) ??
                   getNestedValue(element.style, key);
      return value !== firstValue;
    });
  }, [selectedElements]);

  // Update a single property for all selected elements
  const updateProperty = useCallback((key: string, value: any) => {
    selectedElements.forEach(element => {
      // Handle different types of properties
      if (key.startsWith('position.')) {
        const coord = key.split('.')[1] as 'x' | 'y';
        if (coord === 'x') {
          onUpdateElementPosition?.(element.id, value, element.position.y);
        } else {
          onUpdateElementPosition?.(element.id, element.position.x, value);
        }
      } else if (key.startsWith('size.')) {
        const dimension = key.split('.')[1] as 'width' | 'height';
        if (dimension === 'width') {
          onUpdateElementSize?.(element.id, value, element.size.height);
        } else {
          onUpdateElementSize?.(element.id, element.size.width, value);
        }
      } else if (key === 'text') {
        onUpdateElementText?.(element.id, value);
      } else {
        // Style property
        onUpdateElementStyle(element.id, { [key]: value });
      }
    });
  }, [selectedElements, onUpdateElementStyle, onUpdateElementText, onUpdateElementPosition, onUpdateElementSize]);

  // Update multiple properties at once
  const updateProperties = useCallback((updates: Record<string, any>) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateProperty(key, value);
    });
  }, [updateProperty]);

  // Calculate selection type and element types
  const selectionInfo = useMemo(() => {
    const count = selectedElements.length;
    const types = [...new Set(selectedElements.map(el => el.type))];

    return {
      selectionType: count === 0 ? 'none' :
                    count === 1 ? 'single' :
                    types.length === 1 ? 'multiple' : 'mixed',
      elementTypes: types,
    };
  }, [selectedElements]);

  // Get available properties based on selection
  const availableProperties = useMemo(() => {
    const context = {
      selectedElements,
      properties,
      updateProperty,
      updateProperties,
      hasMultipleValues,
      primaryElement: selectedElements[0] || null,
      selectionType: selectionInfo.selectionType as any,
      elementTypes: selectionInfo.elementTypes,
      availableProperties: [], // Will be populated
    };

    return PROPERTY_DEFINITIONS
      .filter(prop => !prop.visible || prop.visible(context))
      .sort((a, b) => b.priority - a.priority);
  }, [selectedElements, properties, updateProperty, updateProperties, hasMultipleValues, selectionInfo]);

  // Create context value
  const contextValue: PropertyContextValue = useMemo(() => ({
    selectedElements,
    properties,
    updateProperty,
    updateProperties,
    hasMultipleValues,
    primaryElement: selectedElements[0] || null,
    selectionType: selectionInfo.selectionType as any,
    elementTypes: selectionInfo.elementTypes,
    availableProperties,
  }), [
    selectedElements,
    properties,
    updateProperty,
    updateProperties,
    hasMultipleValues,
    selectionInfo,
    availableProperties,
  ]);

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
};

export default PropertyProvider;