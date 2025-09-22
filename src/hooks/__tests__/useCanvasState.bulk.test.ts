// useCanvasState Bulk Operations Integration Tests
// Tests the integration of bulk operations with the canvas state management

import { renderHook, act } from '@testing-library/react';
import { useCanvasState } from '../useCanvasState';
import type { DiagramSchema, DiagramElement } from '../../types/diagram';
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../core/commands/BulkStyleCommand';

const createMockDiagram = (elements: DiagramElement[] = []): DiagramSchema => ({
  version: '1.0.0',
  type: 'diagram',
  metadata: {
    id: 'test-diagram',
    created: '2024-01-01T00:00:00.000Z',
    modified: '2024-01-01T00:00:00.000Z',
    title: 'Test Diagram',
  },
  canvas: {
    width: 1920,
    height: 1080,
    grid: true,
    gridSize: 20,
    backgroundColor: '#ffffff',
    zoom: 1.0,
  },
  elements,
  connections: [],
});

const createMockElement = (
  id: string,
  x = 0,
  y = 0,
  width = 100,
  height = 50,
  type: 'rectangle' | 'circle' = 'rectangle'
): DiagramElement => ({
  id,
  type,
  position: { x, y },
  size: { width, height },
  style: {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'center',
  },
  text: `Element ${id}`,
});

describe('useCanvasState - Bulk Operations', () => {
  describe('Bulk Style Updates', () => {
    test('should update styles for multiple elements', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
        createMockElement('3'),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      act(() => {
        result.current.selectElement('1');
      });

      act(() => {
        result.current.selectElement('2', true); // Multi-select
      });

      const bulkUpdate: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: {
          fill: '#ff0000',
          strokeWidth: 4,
          opacity: 0.8,
        },
        mode: 'replace',
      };

      act(() => {
        result.current.bulkUpdateStyles(bulkUpdate);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].style.fill).toBe('#ff0000');
      expect(updatedElements[0].style.strokeWidth).toBe(4);
      expect(updatedElements[0].style.opacity).toBe(0.8);
      expect(updatedElements[1].style.fill).toBe('#ff0000');
      expect(updatedElements[2].style.fill).toBe('#ffffff'); // Unchanged
    });

    test('should handle selective property updates', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const bulkUpdate: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: {
          fill: '#ff0000',
          strokeWidth: 8,
          opacity: 0.5,
        },
        selectedProperties: ['fill', 'opacity'],
        mode: 'replace',
      };

      act(() => {
        result.current.bulkUpdateStyles(bulkUpdate);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].style.fill).toBe('#ff0000');
      expect(updatedElements[0].style.opacity).toBe(0.5);
      expect(updatedElements[0].style.strokeWidth).toBe(2); // Should remain unchanged
    });

    test('should support undo/redo for bulk style updates', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const bulkUpdate: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      // Apply bulk update
      act(() => {
        result.current.bulkUpdateStyles(bulkUpdate);
      });

      expect(result.current.diagram.elements[0].style.fill).toBe('#ff0000');
      expect(result.current.canUndo).toBe(true);

      // Undo
      act(() => {
        result.current.undo();
      });

      expect(result.current.diagram.elements[0].style.fill).toBe('#ffffff');
      expect(result.current.canRedo).toBe(true);

      // Redo
      act(() => {
        result.current.redo();
      });

      expect(result.current.diagram.elements[0].style.fill).toBe('#ff0000');
    });
  });

  describe('Element Alignment', () => {
    test('should align elements to the left', () => {
      const elements = [
        createMockElement('1', 10, 20),
        createMockElement('2', 50, 30),
        createMockElement('3', 100, 40),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const alignOperation: AlignmentOperation = {
        type: 'align-left',
        elementIds: ['1', '2', '3'],
      };

      act(() => {
        result.current.alignElements(alignOperation);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].position.x).toBe(10); // Leftmost position
      expect(updatedElements[1].position.x).toBe(10);
      expect(updatedElements[2].position.x).toBe(10);

      // Y positions should remain unchanged
      expect(updatedElements[0].position.y).toBe(20);
      expect(updatedElements[1].position.y).toBe(30);
      expect(updatedElements[2].position.y).toBe(40);
    });

    test('should align elements to center horizontally', () => {
      const elements = [
        createMockElement('1', 0, 20, 20, 20),  // x: 0-20
        createMockElement('2', 80, 30, 20, 20), // x: 80-100
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const alignOperation: AlignmentOperation = {
        type: 'align-center',
        elementIds: ['1', '2'],
      };

      act(() => {
        result.current.alignElements(alignOperation);
      });

      const updatedElements = result.current.diagram.elements;
      // Center should be at x = 50, elements should be positioned at x = 40 (50 - 10)
      expect(updatedElements[0].position.x).toBe(40);
      expect(updatedElements[1].position.x).toBe(40);
    });

    test('should support undo for alignment operations', () => {
      const elements = [
        createMockElement('1', 10, 20),
        createMockElement('2', 50, 30),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const alignOperation: AlignmentOperation = {
        type: 'align-left',
        elementIds: ['1', '2'],
      };

      // Align elements
      act(() => {
        result.current.alignElements(alignOperation);
      });

      expect(result.current.diagram.elements[1].position.x).toBe(10);

      // Undo
      act(() => {
        result.current.undo();
      });

      expect(result.current.diagram.elements[1].position.x).toBe(50);
    });
  });

  describe('Element Distribution', () => {
    test('should distribute elements horizontally', () => {
      const elements = [
        createMockElement('1', 0, 20, 20, 20),   // x: 0-20
        createMockElement('2', 40, 20, 20, 20),  // x: 40-60 (will be moved)
        createMockElement('3', 100, 20, 20, 20), // x: 100-120
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const distributeOperation: DistributionOperation = {
        type: 'distribute-horizontal',
        elementIds: ['1', '2', '3'],
      };

      act(() => {
        result.current.distributeElements(distributeOperation);
      });

      const updatedElements = result.current.diagram.elements;
      // First and last elements should stay in place
      expect(updatedElements[0].position.x).toBe(0);
      expect(updatedElements[2].position.x).toBe(100);

      // Middle element should be distributed evenly
      expect(updatedElements[1].position.x).toBe(60);
    });

    test('should distribute elements vertically', () => {
      const elements = [
        createMockElement('1', 20, 0, 20, 20),   // y: 0-20
        createMockElement('2', 20, 40, 20, 20),  // y: 40-60 (will be moved)
        createMockElement('3', 20, 100, 20, 20), // y: 100-120
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const distributeOperation: DistributionOperation = {
        type: 'distribute-vertical',
        elementIds: ['1', '2', '3'],
      };

      act(() => {
        result.current.distributeElements(distributeOperation);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].position.y).toBe(0);
      expect(updatedElements[2].position.y).toBe(100);
      expect(updatedElements[1].position.y).toBe(60);
    });
  });

  describe('Find and Replace Text', () => {
    test('should find and replace text in multiple elements', () => {
      const elements = [
        { ...createMockElement('1'), text: 'Hello World' },
        { ...createMockElement('2'), text: 'Hello Universe' },
        { ...createMockElement('3'), text: 'Goodbye Earth' },
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      act(() => {
        result.current.findAndReplaceText('Hello', 'Hi', false);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].text).toBe('Hi World');
      expect(updatedElements[1].text).toBe('Hi Universe');
      expect(updatedElements[2].text).toBe('Goodbye Earth'); // Unchanged
    });

    test('should handle case-sensitive find and replace', () => {
      const elements = [
        { ...createMockElement('1'), text: 'Hello World' },
        { ...createMockElement('2'), text: 'hello universe' },
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      act(() => {
        result.current.findAndReplaceText('Hello', 'Hi', true);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].text).toBe('Hi World');
      expect(updatedElements[1].text).toBe('hello universe'); // Unchanged
    });

    test('should handle global replace with special characters', () => {
      const elements = [
        { ...createMockElement('1'), text: 'Test (1) and Test (2)' },
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      act(() => {
        result.current.findAndReplaceText('Test', 'Example', false);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].text).toBe('Example (1) and Example (2)');
    });
  });

  describe('Style Copying', () => {
    test('should copy style from one element to others', () => {
      const elements = [
        {
          ...createMockElement('1'),
          style: {
            ...createMockElement('1').style,
            fill: '#ff0000',
            strokeWidth: 4,
            opacity: 0.8,
          },
        },
        createMockElement('2'),
        createMockElement('3'),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      act(() => {
        result.current.copyStyleToElements('1', ['2', '3']);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[1].style.fill).toBe('#ff0000');
      expect(updatedElements[1].style.strokeWidth).toBe(4);
      expect(updatedElements[1].style.opacity).toBe(0.8);
      expect(updatedElements[2].style.fill).toBe('#ff0000');
    });

    test('should handle copying from non-existent element', () => {
      const elements = [createMockElement('1'), createMockElement('2')];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const originalElements = result.current.diagram.elements;

      act(() => {
        result.current.copyStyleToElements('non-existent', ['1', '2']);
      });

      // Elements should remain unchanged
      expect(result.current.diagram.elements).toEqual(originalElements);
    });
  });

  describe('Batch Position Updates', () => {
    test('should update positions for multiple elements', () => {
      const elements = [
        createMockElement('1', 10, 20),
        createMockElement('2', 30, 40),
        createMockElement('3', 50, 60),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const positionUpdates = [
        { elementId: '1', position: { x: 100, y: 200 } },
        { elementId: '3', position: { x: 300, y: 400 } },
      ];

      act(() => {
        result.current.batchUpdatePositions(positionUpdates);
      });

      const updatedElements = result.current.diagram.elements;
      expect(updatedElements[0].position).toEqual({ x: 100, y: 200 });
      expect(updatedElements[1].position).toEqual({ x: 30, y: 40 }); // Unchanged
      expect(updatedElements[2].position).toEqual({ x: 300, y: 400 });
    });
  });

  describe('Multi-Selection State Management', () => {
    test('should track multi-selection state', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
        createMockElement('3'),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      // Single selection
      act(() => {
        result.current.selectElement('1');
      });

      expect(result.current.hasSelection).toBe(true);
      expect(result.current.isMultiSelect).toBe(false);
      expect(result.current.selectedElements).toHaveLength(1);

      // Multi-selection
      act(() => {
        result.current.selectElement('2', true);
      });

      expect(result.current.isMultiSelect).toBe(true);
      expect(result.current.selectedElements).toHaveLength(2);

      // Add another element
      act(() => {
        result.current.selectElement('3', true);
      });

      expect(result.current.selectedElements).toHaveLength(3);
    });

    test('should clear selection after bulk operations', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
      ];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      act(() => {
        result.current.selectElement('1');
        result.current.selectElement('2', true);
      });

      expect(result.current.selectedElements).toHaveLength(2);

      // Undo should clear selection
      const bulkUpdate: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      act(() => {
        result.current.bulkUpdateStyles(bulkUpdate);
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.selectedElements).toHaveLength(0);
    });
  });

  describe('Command History Integration', () => {
    test('should properly manage command history with bulk operations', () => {
      const elements = [createMockElement('1'), createMockElement('2')];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      expect(result.current.commandState.commandCount).toBe(0);

      // Bulk style update
      const bulkUpdate: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      act(() => {
        result.current.bulkUpdateStyles(bulkUpdate);
      });

      expect(result.current.commandState.commandCount).toBe(1);
      expect(result.current.canUndo).toBe(true);

      // Alignment
      const alignOperation: AlignmentOperation = {
        type: 'align-left',
        elementIds: ['1', '2'],
      };

      act(() => {
        result.current.alignElements(alignOperation);
      });

      expect(result.current.commandState.commandCount).toBe(2);

      // Undo both operations
      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.commandState.commandCount).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large numbers of elements efficiently', () => {
      const elements = Array.from({ length: 1000 }, (_, i) =>
        createMockElement(`element-${i}`, i * 10, i * 5)
      );
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      const elementIds = elements.slice(0, 500).map(el => el.id);
      const bulkUpdate: BulkStyleUpdate = {
        elementIds,
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      const startTime = performance.now();

      act(() => {
        result.current.bulkUpdateStyles(bulkUpdate);
      });

      const endTime = performance.now();

      // Should complete in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify first and last updated elements
      expect(result.current.diagram.elements[0].style.fill).toBe('#ff0000');
      expect(result.current.diagram.elements[499].style.fill).toBe('#ff0000');
      expect(result.current.diagram.elements[500].style.fill).toBe('#ffffff'); // Unchanged
    });

    test('should handle empty operations gracefully', () => {
      const elements = [createMockElement('1')];
      const initialDiagram = createMockDiagram(elements);
      const { result } = renderHook(() => useCanvasState(initialDiagram));

      // Empty bulk update
      const emptyBulkUpdate: BulkStyleUpdate = {
        elementIds: [],
        styleUpdates: {},
        mode: 'replace',
      };

      act(() => {
        result.current.bulkUpdateStyles(emptyBulkUpdate);
      });

      // Should not affect the diagram
      expect(result.current.diagram.elements[0]).toEqual(elements[0]);

      // Empty alignment
      const emptyAlign: AlignmentOperation = {
        type: 'align-left',
        elementIds: [],
      };

      act(() => {
        result.current.alignElements(emptyAlign);
      });

      expect(result.current.diagram.elements[0]).toEqual(elements[0]);
    });
  });
});