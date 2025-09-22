# Bulk Operations System

The Bulk Operations System in OpenChart provides powerful tools for manipulating multiple selected elements simultaneously. This system is designed to improve efficiency when working with complex diagrams and enables advanced styling workflows.

## Overview

The bulk operations system consists of several key components:

- **BulkStyleCommand**: Command pattern implementation for undoable bulk operations
- **BulkStyleControls**: React component for bulk styling UI
- **StyleSynchronizer**: Component for style coordination and grouping
- **Enhanced useCanvasState**: Hook integration with bulk operations
- **Alignment & Distribution**: Tools for positioning multiple elements

## Core Features

### 1. Selective Property Updates

Apply style changes to only specific properties of selected elements:

```typescript
import { BulkStyleUpdate } from '../core/commands/BulkStyleCommand';

const bulkUpdate: BulkStyleUpdate = {
  elementIds: ['element1', 'element2', 'element3'],
  styleUpdates: {
    fill: '#ff0000',
    strokeWidth: 4,
    opacity: 0.8
  },
  selectedProperties: ['fill', 'opacity'], // Only apply these properties
  mode: 'replace'
};
```

### 2. Update Modes

Three different modes for applying style changes:

- **Replace**: Directly replace property values
- **Relative**: Apply relative scaling (multiply numeric values)
- **Increment**: Add/subtract values (for numeric properties)

```typescript
// Relative scaling - multiply font sizes by 1.5
const relativeUpdate: BulkStyleUpdate = {
  elementIds: ['text1', 'text2'],
  styleUpdates: { fontSize: 1.5 },
  mode: 'relative'
};

// Increment - add 2px to stroke width
const incrementUpdate: BulkStyleUpdate = {
  elementIds: ['shape1', 'shape2'],
  styleUpdates: { strokeWidth: 2 },
  mode: 'increment'
};
```

### 3. Alignment Operations

Align multiple elements to a common edge or center:

```typescript
import { AlignmentOperation } from '../core/commands/BulkStyleCommand';

const alignLeft: AlignmentOperation = {
  type: 'align-left',
  elementIds: ['element1', 'element2', 'element3']
};

// Available alignment types:
// 'align-left', 'align-center', 'align-right'
// 'align-top', 'align-middle', 'align-bottom'
```

### 4. Distribution Operations

Distribute elements evenly along an axis:

```typescript
import { DistributionOperation } from '../core/commands/BulkStyleCommand';

const distributeHorizontal: DistributionOperation = {
  type: 'distribute-horizontal',
  elementIds: ['element1', 'element2', 'element3'] // Minimum 3 elements
};

// Available distribution types:
// 'distribute-horizontal', 'distribute-vertical'
```

### 5. Find and Replace Text

Bulk text replacement across multiple elements:

```typescript
// In your component
const handleFindReplace = (searchText: string, replaceText: string, matchCase: boolean) => {
  canvasState.findAndReplaceText(searchText, replaceText, matchCase);
};
```

### 6. Style Synchronization

Keep element styles synchronized with smart grouping:

```typescript
import { StyleGroup } from '../components/PropertyPanel/StyleSynchronizer';

const styleGroup: StyleGroup = {
  id: 'button-group',
  name: 'Primary Buttons',
  elementIds: ['btn1', 'btn2', 'btn3'],
  masterElementId: 'btn1', // Style source
  synchronizedProperties: ['fill', 'stroke', 'cornerRadius'],
  autoSync: true
};
```

## Implementation Guide

### 1. Basic Usage with useCanvasState

```typescript
import { useCanvasState } from '../hooks/useCanvasState';

function DiagramEditor() {
  const canvasState = useCanvasState(initialDiagram);

  // Select multiple elements
  const handleMultiSelect = (elementIds: string[]) => {
    elementIds.forEach((id, index) => {
      canvasState.selectElement(id, index > 0); // Multi-select after first
    });
  };

  // Apply bulk style update
  const handleBulkStyle = () => {
    if (canvasState.isMultiSelect) {
      canvasState.bulkUpdateStyles({
        elementIds: canvasState.selectedElementIds,
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace'
      });
    }
  };

  // Align selected elements
  const handleAlign = () => {
    canvasState.alignElements({
      type: 'align-left',
      elementIds: canvasState.selectedElementIds
    });
  };

  return (
    <div>
      {/* Your diagram canvas */}
      {canvasState.isMultiSelect && (
        <button onClick={handleBulkStyle}>
          Apply Red Fill to Selected
        </button>
      )}
    </div>
  );
}
```

### 2. Integration with PropertyPanel

```typescript
import { PropertyPanel } from '../components/PropertyPanel/PropertyPanel';

function App() {
  const canvasState = useCanvasState(diagram);

  return (
    <PropertyPanel
      selectedElements={canvasState.selectedElements}
      allElements={canvasState.diagram.elements}
      onUpdateElementStyle={canvasState.updateElementStyle}
      onUpdateElementText={canvasState.updateElementText}
      onUpdateElementPosition={canvasState.moveElement}
      onUpdateElementSize={canvasState.resizeElement}

      // Bulk operations
      onBulkStyleUpdate={canvasState.bulkUpdateStyles}
      onAlignElements={canvasState.alignElements}
      onDistributeElements={canvasState.distributeElements}
      onFindAndReplaceText={canvasState.findAndReplaceText}
      onCopyStyleToElements={canvasState.copyStyleToElements}
    />
  );
}
```

### 3. Using BulkStyleControls Component

```typescript
import BulkStyleControls from '../components/PropertyPanel/BulkStyleControls';

function CustomBulkPanel({ selectedElements }: { selectedElements: DiagramElement[] }) {
  const handleBulkUpdate = (update: BulkStyleUpdate) => {
    // Process bulk update
    console.log('Bulk update:', update);
  };

  const handleAlign = (operation: AlignmentOperation) => {
    // Process alignment
    console.log('Align:', operation);
  };

  const handleDistribute = (operation: DistributionOperation) => {
    // Process distribution
    console.log('Distribute:', operation);
  };

  const handleFindReplace = (searchText: string, replaceText: string, matchCase?: boolean) => {
    // Process find and replace
    console.log('Find/Replace:', { searchText, replaceText, matchCase });
  };

  return (
    <BulkStyleControls
      selectedElements={selectedElements}
      onBulkStyleUpdate={handleBulkUpdate}
      onAlignElements={handleAlign}
      onDistributeElements={handleDistribute}
      onFindAndReplace={handleFindReplace}
    />
  );
}
```

### 4. Style Synchronization with StyleSynchronizer

```typescript
import StyleSynchronizer from '../components/PropertyPanel/StyleSynchronizer';

function StylePanel({ selectedElements, allElements }: Props) {
  const handleBulkUpdate = (update: BulkStyleUpdate) => {
    // Apply bulk update
  };

  const handleCreateGroup = (group: Omit<StyleGroup, 'id'>) => {
    const newGroup = {
      ...group,
      id: `group-${Date.now()}`
    };
    // Save group to state or storage
  };

  return (
    <StyleSynchronizer
      selectedElements={selectedElements}
      allElements={allElements}
      onBulkStyleUpdate={handleBulkUpdate}
      onCreateGroup={handleCreateGroup}
      existingGroups={existingGroups}
    />
  );
}
```

## Command System Integration

The bulk operations system integrates seamlessly with OpenChart's command system for undo/redo support:

### Command Merging

```typescript
// Commands can be merged for better UX
const command1 = new BulkStyleCommand({
  elementIds: ['1', '2'],
  styleUpdates: { fill: '#ff0000' },
  mode: 'replace'
});

const command2 = new BulkStyleCommand({
  elementIds: ['1', '2'],
  styleUpdates: { strokeWidth: 4 },
  mode: 'replace'
});

// If executed within the merge window (1 second), they will be combined
const merged = command1.merge(command2);
```

### Undo/Redo Support

```typescript
// All bulk operations support undo/redo
canvasState.bulkUpdateStyles(bulkUpdate);
canvasState.alignElements(alignOperation);
canvasState.distributeElements(distributeOperation);

// Undo the last operations
canvasState.undo(); // Undoes distribution
canvasState.undo(); // Undoes alignment
canvasState.undo(); // Undoes bulk style update

// Redo operations
canvasState.redo(); // Redoes bulk style update
```

## Advanced Features

### 1. Smart Grouping Suggestions

The StyleSynchronizer automatically suggests groupings based on:

- Element type similarity
- Color scheme similarity
- Size similarity

```typescript
// The component automatically analyzes selected elements
// and provides grouping suggestions with confidence scores
const suggestions = [
  {
    reason: 'Similar element type: rectangle',
    elements: rectangleElements,
    confidence: 0.8
  },
  {
    reason: 'Similar colors',
    elements: sameColorElements,
    confidence: 0.6
  }
];
```

### 2. Style Templates

Save and reuse style combinations:

```typescript
const styleTemplate: StyleTemplate = {
  id: 'primary-button',
  name: 'Primary Button',
  style: {
    fill: '#007bff',
    stroke: '#0056b3',
    strokeWidth: 2,
    cornerRadius: 8
  },
  description: 'Standard primary button style'
};

// Apply template to selected elements
applyTemplate(styleTemplate);
```

### 3. Relative Color Adjustments

```typescript
// Adjust colors relatively (hue, saturation, lightness)
const colorAdjustment: BulkStyleUpdate = {
  elementIds: selectedIds,
  styleUpdates: {
    // Implementation would parse colors and adjust HSL values
    fill: 'hsl-adjust:hue+30,saturation*1.2',
  },
  mode: 'relative'
};
```

## Performance Considerations

### 1. Large Element Sets

The system is optimized for large numbers of elements:

```typescript
// Efficiently handles 1000+ elements
const manyElements = Array.from({ length: 1000 }, (_, i) => `element-${i}`);

const bulkUpdate: BulkStyleUpdate = {
  elementIds: manyElements,
  styleUpdates: { opacity: 0.8 },
  mode: 'replace'
};

// Executes in O(n) time with minimal overhead
canvasState.bulkUpdateStyles(bulkUpdate);
```

### 2. Memory Management

- Commands store only changed values for undo
- Selective property updates minimize memory usage
- Command merging reduces history stack size

### 3. Rendering Optimization

- Batch DOM updates for better performance
- Only re-render affected elements
- Use React.memo for expensive components

## Testing

### Unit Tests

```typescript
import { BulkStyleCommand } from '../BulkStyleCommand';

test('should update multiple element styles', () => {
  const command = new BulkStyleCommand({
    elementIds: ['1', '2'],
    styleUpdates: { fill: '#ff0000' },
    mode: 'replace'
  });

  const result = command.execute(initialDiagram);

  expect(result.elements[0].style.fill).toBe('#ff0000');
  expect(result.elements[1].style.fill).toBe('#ff0000');
});
```

### Integration Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCanvasState } from '../useCanvasState';

test('should handle bulk operations with undo/redo', () => {
  const { result } = renderHook(() => useCanvasState(diagram));

  act(() => {
    result.current.bulkUpdateStyles(bulkUpdate);
  });

  expect(result.current.canUndo).toBe(true);

  act(() => {
    result.current.undo();
  });

  expect(result.current.canRedo).toBe(true);
});
```

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import BulkStyleControls from '../BulkStyleControls';

test('should trigger bulk style update', async () => {
  const mockOnBulkUpdate = jest.fn();

  render(
    <BulkStyleControls
      selectedElements={mockElements}
      onBulkStyleUpdate={mockOnBulkUpdate}
    />
  );

  const fillInput = screen.getByDisplayValue('#ffffff');
  fireEvent.change(fillInput, { target: { value: '#ff0000' } });

  expect(mockOnBulkUpdate).toHaveBeenCalledWith({
    elementIds: ['1', '2'],
    styleUpdates: { fill: '#ff0000' },
    mode: 'replace'
  });
});
```

## Best Practices

### 1. User Experience

- Always provide visual feedback for bulk operations
- Use progressive disclosure for advanced features
- Implement keyboard shortcuts for common operations
- Show operation progress for large element sets

### 2. Performance

- Use selective property updates when possible
- Batch related operations
- Implement command merging for smooth UX
- Profile performance with large datasets

### 3. Accessibility

- Provide proper ARIA labels for all controls
- Support keyboard navigation
- Use semantic HTML elements
- Include screen reader announcements for operations

### 4. Error Handling

- Gracefully handle invalid element IDs
- Provide meaningful error messages
- Validate input parameters
- Implement fallback behaviors

## Migration Guide

### From Single-Element Operations

```typescript
// Before: Single element updates
elements.forEach(element => {
  updateElementStyle(element.id, { fill: '#ff0000' });
});

// After: Bulk operations
bulkUpdateStyles({
  elementIds: elements.map(el => el.id),
  styleUpdates: { fill: '#ff0000' },
  mode: 'replace'
});
```

### Adding Bulk Support to Existing Components

```typescript
// 1. Add bulk operation props to your component interface
interface MyComponentProps {
  // Existing props
  selectedElements: DiagramElement[];
  onUpdateElement: (id: string, updates: Partial<ElementStyle>) => void;

  // Add bulk operation props
  onBulkStyleUpdate?: (update: BulkStyleUpdate) => void;
  onAlignElements?: (operation: AlignmentOperation) => void;
}

// 2. Conditionally render bulk controls
{selectedElements.length > 1 && onBulkStyleUpdate && (
  <BulkStyleControls
    selectedElements={selectedElements}
    onBulkStyleUpdate={onBulkStyleUpdate}
    onAlignElements={onAlignElements}
  />
)}
```

## API Reference

### BulkStyleUpdate Interface

```typescript
interface BulkStyleUpdate {
  elementIds: string[];                    // Elements to update
  styleUpdates: Partial<ElementStyle>;    // Style changes to apply
  selectedProperties?: string[];          // Optional: only apply these properties
  mode?: 'replace' | 'relative' | 'increment'; // How to apply changes
}
```

### AlignmentOperation Interface

```typescript
interface AlignmentOperation {
  type: 'align-left' | 'align-center' | 'align-right' |
        'align-top' | 'align-middle' | 'align-bottom';
  elementIds: string[];
}
```

### DistributionOperation Interface

```typescript
interface DistributionOperation {
  type: 'distribute-horizontal' | 'distribute-vertical';
  elementIds: string[];  // Minimum 3 elements required
  spacing?: number;      // Optional fixed spacing
}
```

### StyleGroup Interface

```typescript
interface StyleGroup {
  id: string;
  name: string;
  elementIds: string[];
  masterElementId?: string;                    // Element that controls group style
  synchronizedProperties: (keyof ElementStyle)[];
  autoSync: boolean;
}
```

## Conclusion

The Bulk Operations System significantly enhances OpenChart's usability for complex diagrams. By providing efficient, undoable operations for multiple elements, it enables users to work faster and more effectively with their diagrams.

Key benefits:
- **Efficiency**: Perform operations on hundreds of elements instantly
- **Consistency**: Maintain visual consistency across element groups
- **Flexibility**: Choose exactly which properties to update
- **Reliability**: Full undo/redo support with command merging
- **Accessibility**: Keyboard support and screen reader compatibility

For additional examples and advanced usage patterns, see the test files and component documentation.