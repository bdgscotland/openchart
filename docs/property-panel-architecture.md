# Property Panel System Architecture

## Overview

This document outlines the architectural design for the property panel system in OpenChart, enabling users to view and edit properties of selected elements in the diagram canvas.

## Current System Analysis

### Existing Architecture
- **Canvas System**: React Flow-based canvas with custom shape nodes
- **State Management**: `useCanvasState` hook managing diagram state with command pattern
- **Element Types**: Rectangle, Circle, Diamond, Ellipse, Triangle, Polygon shapes
- **Command System**: Undo/redo functionality via CommandManager
- **Component Structure**: Modular design with separated concerns

### Current State Management Flow
```
useCanvasState Hook
├── diagram: DiagramSchema
├── selectedElementIds: string[]
├── Command System (undo/redo)
└── Element Operations (CRUD)
```

## Property Panel Architecture

### 1. Component Hierarchy

```
PropertyPanel (Container)
├── PropertyPanelHeader
│   ├── ElementCounter (shows "X elements selected")
│   └── PanelActions (collapse/expand, reset)
├── PropertyPanelContent
│   ├── SingleElementPanel (when 1 element selected)
│   │   ├── BasicProperties
│   │   │   ├── PositionControls (x, y)
│   │   │   ├── SizeControls (width, height)
│   │   │   └── TextEditor (label/text content)
│   │   ├── StyleProperties
│   │   │   ├── ColorPicker (fill, stroke)
│   │   │   ├── StrokeControls (width, style)
│   │   │   ├── OpacitySlider
│   │   │   └── CornerRadiusSlider (for rectangles)
│   │   ├── TextProperties
│   │   │   ├── FontControls (family, size, weight, style)
│   │   │   ├── TextAlignment
│   │   │   └── TextColor
│   │   └── AdvancedProperties
│   │       ├── ZIndexControl
│   │       ├── LockToggle
│   │       └── VisibilityToggle
│   ├── MultiElementPanel (when 2+ elements selected)
│   │   ├── SharedProperties (properties common to all selected)
│   │   ├── BulkActions (align, distribute, group)
│   │   └── BatchStyleEditor
│   └── NoSelectionPanel (when no elements selected)
│       ├── CanvasProperties (background, grid settings)
│       └── GlobalActions (select all, clear canvas)
└── PropertyPanelFooter
    ├── ApplyButton (for batch changes)
    └── ResetButton (revert to original values)
```

### 2. TypeScript Interfaces

```typescript
// Core property panel types
export interface PropertyPanelState {
  isVisible: boolean;
  isPinned: boolean;
  width: number;
  selectedTab: PropertyTab;
}

export type PropertyTab = 'basic' | 'style' | 'text' | 'advanced';

export interface PropertyValue<T = any> {
  value: T;
  isDirty: boolean;
  originalValue: T;
  isValid: boolean;
  validationError?: string;
}

// Property editing interfaces
export interface BasicProperties {
  position: PropertyValue<Point>;
  size: PropertyValue<Size>;
  text: PropertyValue<string>;
}

export interface StyleProperties {
  fill: PropertyValue<string>;
  stroke: PropertyValue<string>;
  strokeWidth: PropertyValue<number>;
  opacity: PropertyValue<number>;
  cornerRadius?: PropertyValue<number>;
}

export interface TextProperties {
  fontSize: PropertyValue<number>;
  fontFamily: PropertyValue<string>;
  fontWeight: PropertyValue<'normal' | 'bold'>;
  fontStyle: PropertyValue<'normal' | 'italic'>;
  textAlign: PropertyValue<'left' | 'center' | 'right'>;
  textColor: PropertyValue<string>;
}

export interface AdvancedProperties {
  zIndex: PropertyValue<number>;
  locked: PropertyValue<boolean>;
  visible: PropertyValue<boolean>;
}

// Multi-selection support
export interface MultiSelectionProperties {
  sharedProperties: Partial<ElementProperties>;
  conflictingProperties: Set<keyof ElementProperties>;
  selectionCount: number;
}

// Property change events
export interface PropertyChangeEvent<T = any> {
  elementIds: string[];
  property: string;
  newValue: T;
  oldValue: T;
  source: 'user' | 'programmatic';
}
```

### 3. State Management Integration

#### Enhanced useCanvasState Hook
```typescript
// Add to existing useCanvasState interface
interface CanvasState {
  // ... existing properties
  propertyPanel: PropertyPanelState;
  pendingPropertyChanges: Map<string, Partial<ElementProperties>>;
}

// New property-related actions
const updateElementProperties = useCallback((elementId: string, properties: Partial<ElementProperties>) => {
  // Implementation with command pattern for undo/redo
}, []);

const batchUpdateElementProperties = useCallback((updates: Array<{elementId: string, properties: Partial<ElementProperties>}>) => {
  // Batch update for multiple elements
}, []);

const commitPropertyChanges = useCallback(() => {
  // Apply all pending changes as a single command
}, []);
```

#### Property State Manager
```typescript
export class PropertyStateManager {
  private pendingChanges = new Map<string, Partial<ElementProperties>>();
  private validationErrors = new Map<string, ValidationError[]>();

  updateProperty(elementId: string, property: string, value: any): void;
  validateProperty(elementId: string, property: string, value: any): ValidationResult;
  commitChanges(): PropertyChangeCommand[];
  revertChanges(): void;
  hasUnsavedChanges(): boolean;
}
```

### 4. Component Communication Pattern

#### Event-Driven Architecture
```typescript
// Property panel events
export interface PropertyPanelEvents {
  'property:change': PropertyChangeEvent;
  'property:commit': PropertyChangeEvent[];
  'property:revert': { elementIds: string[] };
  'panel:toggle': { isVisible: boolean };
  'panel:resize': { width: number };
}

// Event bus for loose coupling
export class PropertyEventBus extends EventTarget {
  emit<T>(event: string, data: T): void;
  on<T>(event: string, handler: (data: T) => void): void;
  off(event: string, handler: Function): void;
}
```

#### Data Flow Pattern
```
User Input → Property Component → PropertyStateManager → Validation → useCanvasState → Command System → Diagram Update
```

### 5. Responsive Layout System

#### Breakpoints and Sizing
```typescript
export interface PropertyPanelLayout {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  collapsedWidth: number;

  // Responsive breakpoints
  breakpoints: {
    mobile: number;    // < 768px
    tablet: number;    // 768px - 1024px
    desktop: number;   // > 1024px
  };
}

// Responsive behavior
// Mobile: Overlay panel (full-width bottom sheet)
// Tablet: Collapsible side panel (300px default)
// Desktop: Resizable side panel (350px default, 250-500px range)
```

#### Panel Positioning
```typescript
export type PanelPosition = 'right' | 'left' | 'bottom' | 'floating';

export interface PanelPositioning {
  position: PanelPosition;
  isResizable: boolean;
  isDockable: boolean;
  zIndex: number;
}
```

### 6. Property Editing Capabilities

#### Input Components
```typescript
// Specialized input components for different property types
export interface PropertyInputComponents {
  ColorPicker: React.ComponentType<ColorPickerProps>;
  NumberInput: React.ComponentType<NumberInputProps>;
  SliderInput: React.ComponentType<SliderInputProps>;
  SelectInput: React.ComponentType<SelectInputProps>;
  TextInput: React.ComponentType<TextInputProps>;
  PositionInput: React.ComponentType<PositionInputProps>;
  SizeInput: React.ComponentType<SizeInputProps>;
  FontPicker: React.ComponentType<FontPickerProps>;
}
```

#### Validation System
```typescript
export interface PropertyValidator<T = any> {
  validate(value: T, context: ValidationContext): ValidationResult;
  async validateAsync?(value: T, context: ValidationContext): Promise<ValidationResult>;
}

export interface ValidationContext {
  elementType: string;
  otherProperties: Record<string, any>;
  selectedElements: DiagramElement[];
}

// Built-in validators
export const PropertyValidators = {
  position: new PositionValidator(),
  size: new SizeValidator(),
  color: new ColorValidator(),
  number: new NumberRangeValidator(),
  text: new TextLengthValidator(),
};
```

### 7. Multi-Selection Handling

#### Shared Property Detection
```typescript
export class MultiSelectionAnalyzer {
  analyzeSelection(elements: DiagramElement[]): MultiSelectionProperties {
    const sharedProperties = this.findSharedProperties(elements);
    const conflictingProperties = this.findConflictingProperties(elements);

    return {
      sharedProperties,
      conflictingProperties,
      selectionCount: elements.length
    };
  }

  private findSharedProperties(elements: DiagramElement[]): Partial<ElementProperties>;
  private findConflictingProperties(elements: DiagramElement[]): Set<keyof ElementProperties>;
}
```

#### Batch Operations
```typescript
export interface BatchOperation {
  type: 'align' | 'distribute' | 'style' | 'transform';
  elementIds: string[];
  parameters: Record<string, any>;
}

export class BatchOperationExecutor {
  execute(operation: BatchOperation): CommandManager.Command;
  preview(operation: BatchOperation): PreviewResult;
}
```

### 8. Integration Points

#### With Existing Canvas System
```typescript
// Extend FlowCanvas component
export interface FlowCanvasProps {
  // ... existing props
  onElementSelect?: (elementIds: string[]) => void;
  onElementPropertiesChange?: (changes: PropertyChangeEvent[]) => void;
  propertyPanelVisible?: boolean;
}
```

#### With Command System
```typescript
// New command types for property changes
export class UpdateElementPropertiesCommand implements Command {
  constructor(
    private elementId: string,
    private oldProperties: Partial<ElementProperties>,
    private newProperties: Partial<ElementProperties>
  ) {}

  execute(diagram: DiagramSchema): DiagramSchema;
  undo(diagram: DiagramSchema): DiagramSchema;
  getDescription(): string;
}

export class BatchUpdatePropertiesCommand implements Command {
  constructor(private updates: Array<{elementId: string, oldProperties: any, newProperties: any}>) {}

  execute(diagram: DiagramSchema): DiagramSchema;
  undo(diagram: DiagramSchema): DiagramSchema;
  getDescription(): string;
}
```

### 9. Performance Considerations

#### Optimization Strategies
1. **Virtualization**: For large property lists (100+ properties)
2. **Debouncing**: Property changes debounced to 300ms
3. **Memoization**: Property components memoized to prevent unnecessary re-renders
4. **Lazy Loading**: Advanced properties loaded on-demand
5. **Batch Updates**: Multiple property changes batched into single command

#### Memory Management
```typescript
export class PropertyPanelMemoryManager {
  private propertyCache = new Map<string, CachedProperties>();
  private validationCache = new Map<string, ValidationResult>();

  cacheProperties(elementId: string, properties: ElementProperties): void;
  invalidateCache(elementId: string): void;
  clearCache(): void;
}
```

### 10. Accessibility Features

#### ARIA Support
- Proper ARIA labels for all input controls
- Keyboard navigation support
- Screen reader announcements for property changes
- High contrast mode support

#### Keyboard Shortcuts
- `P`: Toggle property panel
- `Escape`: Cancel pending changes
- `Enter`: Commit changes
- `Tab`: Navigate between property fields
- `Shift+Tab`: Navigate backwards

### 11. Future Extensions

#### Plugin System
```typescript
export interface PropertyPanelPlugin {
  name: string;
  version: string;
  elementTypes: string[];

  getProperties(element: DiagramElement): CustomProperty[];
  renderPropertyEditor(property: CustomProperty): React.ReactNode;
  validateProperty(property: CustomProperty, value: any): ValidationResult;
}
```

#### Custom Property Types
```typescript
export interface CustomProperty {
  key: string;
  label: string;
  type: 'custom';
  renderer: React.ComponentType<PropertyRendererProps>;
  validator?: PropertyValidator;
  defaultValue: any;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create TypeScript interfaces and types
2. Implement PropertyStateManager
3. Create basic PropertyPanel container component
4. Integrate with useCanvasState hook

### Phase 2: Basic Property Editing
1. Implement BasicProperties section
2. Add position and size controls
3. Create text editing capabilities
4. Add validation system

### Phase 3: Style Properties
1. Implement StyleProperties section
2. Add color picker components
3. Create stroke and opacity controls
4. Add corner radius for rectangles

### Phase 4: Multi-Selection Support
1. Implement MultiSelectionAnalyzer
2. Create MultiElementPanel component
3. Add batch operations
4. Implement shared property detection

### Phase 5: Advanced Features
1. Add undo/redo integration
2. Implement responsive layout system
3. Add accessibility features
4. Performance optimizations

### Phase 6: Polish and Testing
1. Comprehensive testing suite
2. Performance profiling and optimization
3. Accessibility testing
4. Documentation and examples

## Success Criteria

1. **Functionality**: Users can edit all element properties through the panel
2. **Performance**: No noticeable lag when editing properties on 100+ elements
3. **Usability**: Intuitive interface with proper validation and feedback
4. **Accessibility**: Full keyboard navigation and screen reader support
5. **Extensibility**: Plugin system allows adding custom property types
6. **Integration**: Seamless integration with existing undo/redo system
7. **Responsive**: Works well on mobile, tablet, and desktop devices

## Conclusion

This architecture provides a solid foundation for a comprehensive property panel system that integrates seamlessly with OpenChart's existing infrastructure while providing room for future enhancements and customization.