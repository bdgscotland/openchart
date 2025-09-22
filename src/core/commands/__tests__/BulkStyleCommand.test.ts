// BulkStyleCommand Tests - Comprehensive testing for bulk operations
// Tests command execution, undo/redo, merging, and edge cases

import {
  BulkStyleCommand,
  AlignElementsCommand,
  DistributeElementsCommand,
  type BulkStyleUpdate,
  type AlignmentOperation,
  type DistributionOperation,
} from '../BulkStyleCommand';
import type { DiagramSchema, DiagramElement } from '../../../types/diagram';

// Test helpers
const createMockDiagram = (elements: DiagramElement[]): DiagramSchema => ({
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

const createMockElement = (id: string, x = 0, y = 0, width = 100, height = 50): DiagramElement => ({
  id,
  type: 'rectangle',
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

describe('BulkStyleCommand', () => {
  describe('Basic Operations', () => {
    test('should update styles for multiple elements', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
        createMockElement('3'),
      ];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000', strokeWidth: 4 },
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements[0].style.fill).toBe('#ff0000');
      expect(result.elements[0].style.strokeWidth).toBe(4);
      expect(result.elements[1].style.fill).toBe('#ff0000');
      expect(result.elements[1].style.strokeWidth).toBe(4);
      expect(result.elements[2].style.fill).toBe('#ffffff'); // Unchanged
    });

    test('should apply selective property updates', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
      ];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000', strokeWidth: 8, opacity: 0.5 },
        selectedProperties: ['fill', 'opacity'],
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements[0].style.fill).toBe('#ff0000');
      expect(result.elements[0].style.opacity).toBe(0.5);
      expect(result.elements[0].style.strokeWidth).toBe(2); // Unchanged
    });

    test('should handle relative style updates', () => {
      const elements = [
        { ...createMockElement('1'), style: { ...createMockElement('1').style, fontSize: 14, opacity: 0.8 } },
        { ...createMockElement('2'), style: { ...createMockElement('2').style, fontSize: 16, opacity: 0.6 } },
      ];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fontSize: 1.5, opacity: 1.2 },
        mode: 'relative',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements[0].style.fontSize).toBe(21); // 14 * 1.5
      expect(result.elements[0].style.opacity).toBe(0.96); // 0.8 * 1.2
      expect(result.elements[1].style.fontSize).toBe(24); // 16 * 1.5
      expect(result.elements[1].style.opacity).toBe(0.72); // 0.6 * 1.2
    });

    test('should handle increment style updates', () => {
      const elements = [
        { ...createMockElement('1'), style: { ...createMockElement('1').style, fontSize: 14, strokeWidth: 2 } },
        { ...createMockElement('2'), style: { ...createMockElement('2').style, fontSize: 16, strokeWidth: 3 } },
      ];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fontSize: 2, strokeWidth: 1 },
        mode: 'increment',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements[0].style.fontSize).toBe(16); // 14 + 2
      expect(result.elements[0].style.strokeWidth).toBe(3); // 2 + 1
      expect(result.elements[1].style.fontSize).toBe(18); // 16 + 2
      expect(result.elements[1].style.strokeWidth).toBe(4); // 3 + 1
    });
  });

  describe('Undo/Redo Operations', () => {
    test('should properly undo style changes', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
      ];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000', opacity: 0.5 },
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const modifiedDiagram = command.execute(diagram);
      const undoDiagram = command.undo(modifiedDiagram);

      expect(undoDiagram.elements[0].style.fill).toBe('#ffffff');
      expect(undoDiagram.elements[0].style.opacity).toBe(1);
      expect(undoDiagram.elements[1].style.fill).toBe('#ffffff');
      expect(undoDiagram.elements[1].style.opacity).toBe(1);
    });

    test('should handle partial undo with selective properties', () => {
      const elements = [
        createMockElement('1'),
        createMockElement('2'),
      ];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000', strokeWidth: 8 },
        selectedProperties: ['fill'],
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const modifiedDiagram = command.execute(diagram);
      const undoDiagram = command.undo(modifiedDiagram);

      expect(undoDiagram.elements[0].style.fill).toBe('#ffffff');
      expect(undoDiagram.elements[0].style.strokeWidth).toBe(8); // Should remain changed
    });
  });

  describe('Command Merging', () => {
    test('should merge similar bulk commands', () => {
      const update1: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      const update2: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { strokeWidth: 4 },
        mode: 'replace',
      };

      const command1 = new BulkStyleCommand(update1);
      const command2 = new BulkStyleCommand(update2);

      // Set timestamp to be within merge window
      (command2 as any).timestamp = command1.timestamp + 500;

      const merged = command1.merge(command2);

      expect(merged).toBeTruthy();
      if (merged) {
        expect((merged as any).bulkUpdate.styleUpdates).toEqual({
          fill: '#ff0000',
          strokeWidth: 4,
        });
      }
    });

    test('should not merge commands with different element sets', () => {
      const update1: BulkStyleUpdate = {
        elementIds: ['1', '2'],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      const update2: BulkStyleUpdate = {
        elementIds: ['2', '3'],
        styleUpdates: { strokeWidth: 4 },
        mode: 'replace',
      };

      const command1 = new BulkStyleCommand(update1);
      const command2 = new BulkStyleCommand(update2);

      const merged = command1.merge(command2);
      expect(merged).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty element list', () => {
      const diagram = createMockDiagram([]);
      const update: BulkStyleUpdate = {
        elementIds: [],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements).toHaveLength(0);
    });

    test('should handle non-existent element IDs', () => {
      const elements = [createMockElement('1')];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1', 'non-existent'],
        styleUpdates: { fill: '#ff0000' },
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements[0].style.fill).toBe('#ff0000');
      expect(result.elements).toHaveLength(1);
    });

    test('should handle empty style updates', () => {
      const elements = [createMockElement('1')];
      const diagram = createMockDiagram(elements);

      const update: BulkStyleUpdate = {
        elementIds: ['1'],
        styleUpdates: {},
        mode: 'replace',
      };

      const command = new BulkStyleCommand(update);
      const result = command.execute(diagram);

      expect(result.elements[0]).toEqual(elements[0]);
    });
  });
});

describe('AlignElementsCommand', () => {
  test('should align elements to the left', () => {
    const elements = [
      createMockElement('1', 10, 20),
      createMockElement('2', 50, 30),
      createMockElement('3', 100, 40),
    ];
    const diagram = createMockDiagram(elements);

    const operation: AlignmentOperation = {
      type: 'align-left',
      elementIds: ['1', '2', '3'],
    };

    const command = new AlignElementsCommand(operation);
    const result = command.execute(diagram);

    expect(result.elements[0].position.x).toBe(10); // Leftmost position
    expect(result.elements[1].position.x).toBe(10);
    expect(result.elements[2].position.x).toBe(10);

    // Y positions should remain unchanged
    expect(result.elements[0].position.y).toBe(20);
    expect(result.elements[1].position.y).toBe(30);
    expect(result.elements[2].position.y).toBe(40);
  });

  test('should align elements to center horizontally', () => {
    const elements = [
      createMockElement('1', 0, 20, 20, 20), // x: 0-20
      createMockElement('2', 80, 30, 20, 20), // x: 80-100
    ];
    const diagram = createMockDiagram(elements);

    const operation: AlignmentOperation = {
      type: 'align-center',
      elementIds: ['1', '2'],
    };

    const command = new AlignElementsCommand(operation);
    const result = command.execute(diagram);

    // Center should be at x = 50, so elements should be positioned at x = 40 (50 - 10)
    expect(result.elements[0].position.x).toBe(40);
    expect(result.elements[1].position.x).toBe(40);
  });

  test('should align elements vertically to top', () => {
    const elements = [
      createMockElement('1', 20, 10),
      createMockElement('2', 30, 50),
      createMockElement('3', 40, 100),
    ];
    const diagram = createMockDiagram(elements);

    const operation: AlignmentOperation = {
      type: 'align-top',
      elementIds: ['1', '2', '3'],
    };

    const command = new AlignElementsCommand(operation);
    const result = command.execute(diagram);

    expect(result.elements[0].position.y).toBe(10); // Topmost position
    expect(result.elements[1].position.y).toBe(10);
    expect(result.elements[2].position.y).toBe(10);
  });

  test('should properly undo alignment', () => {
    const elements = [
      createMockElement('1', 10, 20),
      createMockElement('2', 50, 30),
    ];
    const diagram = createMockDiagram(elements);

    const operation: AlignmentOperation = {
      type: 'align-left',
      elementIds: ['1', '2'],
    };

    const command = new AlignElementsCommand(operation);
    const alignedDiagram = command.execute(diagram);
    const undoDiagram = command.undo(alignedDiagram);

    expect(undoDiagram.elements[0].position.x).toBe(10);
    expect(undoDiagram.elements[1].position.x).toBe(50);
  });

  test('should handle single element alignment', () => {
    const elements = [createMockElement('1', 10, 20)];
    const diagram = createMockDiagram(elements);

    const operation: AlignmentOperation = {
      type: 'align-left',
      elementIds: ['1'],
    };

    const command = new AlignElementsCommand(operation);
    const result = command.execute(diagram);

    // Single element should remain unchanged
    expect(result.elements[0].position.x).toBe(10);
    expect(result.elements[0].position.y).toBe(20);
  });
});

describe('DistributeElementsCommand', () => {
  test('should distribute elements horizontally', () => {
    const elements = [
      createMockElement('1', 0, 20, 20, 20),   // x: 0-20
      createMockElement('2', 40, 20, 20, 20),  // x: 40-60 (will be moved)
      createMockElement('3', 100, 20, 20, 20), // x: 100-120
    ];
    const diagram = createMockDiagram(elements);

    const operation: DistributionOperation = {
      type: 'distribute-horizontal',
      elementIds: ['1', '2', '3'],
    };

    const command = new DistributeElementsCommand(operation);
    const result = command.execute(diagram);

    // First and last elements should stay in place
    expect(result.elements[0].position.x).toBe(0);
    expect(result.elements[2].position.x).toBe(100);

    // Middle element should be distributed evenly
    // Total distance: 120 - 0 = 120, spacing: 120 / 2 = 60
    expect(result.elements[1].position.x).toBe(60);
  });

  test('should distribute elements vertically', () => {
    const elements = [
      createMockElement('1', 20, 0, 20, 20),   // y: 0-20
      createMockElement('2', 20, 40, 20, 20),  // y: 40-60 (will be moved)
      createMockElement('3', 20, 100, 20, 20), // y: 100-120
    ];
    const diagram = createMockDiagram(elements);

    const operation: DistributionOperation = {
      type: 'distribute-vertical',
      elementIds: ['1', '2', '3'],
    };

    const command = new DistributeElementsCommand(operation);
    const result = command.execute(diagram);

    // First and last elements should stay in place
    expect(result.elements[0].position.y).toBe(0);
    expect(result.elements[2].position.y).toBe(100);

    // Middle element should be distributed evenly
    expect(result.elements[1].position.y).toBe(60);
  });

  test('should handle insufficient elements for distribution', () => {
    const elements = [
      createMockElement('1', 0, 20),
      createMockElement('2', 100, 20),
    ];
    const diagram = createMockDiagram(elements);

    const operation: DistributionOperation = {
      type: 'distribute-horizontal',
      elementIds: ['1', '2'],
    };

    const command = new DistributeElementsCommand(operation);
    const result = command.execute(diagram);

    // Elements should remain unchanged (need at least 3 for distribution)
    expect(result.elements[0].position.x).toBe(0);
    expect(result.elements[1].position.x).toBe(100);
  });

  test('should properly undo distribution', () => {
    const elements = [
      createMockElement('1', 0, 20),
      createMockElement('2', 40, 20),
      createMockElement('3', 100, 20),
    ];
    const diagram = createMockDiagram(elements);

    const operation: DistributionOperation = {
      type: 'distribute-horizontal',
      elementIds: ['1', '2', '3'],
    };

    const command = new DistributeElementsCommand(operation);
    const distributedDiagram = command.execute(diagram);
    const undoDiagram = command.undo(distributedDiagram);

    expect(undoDiagram.elements[0].position.x).toBe(0);
    expect(undoDiagram.elements[1].position.x).toBe(40);
    expect(undoDiagram.elements[2].position.x).toBe(100);
  });
});

describe('Integration Tests', () => {
  test('should handle complex bulk operations sequence', () => {
    const elements = [
      createMockElement('1', 10, 10),
      createMockElement('2', 50, 20),
      createMockElement('3', 90, 30),
    ];
    let diagram = createMockDiagram(elements);

    // 1. Bulk style update
    const styleUpdate: BulkStyleUpdate = {
      elementIds: ['1', '2', '3'],
      styleUpdates: { fill: '#ff0000', strokeWidth: 4 },
      mode: 'replace',
    };
    const styleCommand = new BulkStyleCommand(styleUpdate);
    diagram = styleCommand.execute(diagram);

    // 2. Align elements
    const alignOperation: AlignmentOperation = {
      type: 'align-left',
      elementIds: ['1', '2', '3'],
    };
    const alignCommand = new AlignElementsCommand(alignOperation);
    diagram = alignCommand.execute(diagram);

    // 3. Distribute elements
    const distributeOperation: DistributionOperation = {
      type: 'distribute-vertical',
      elementIds: ['1', '2', '3'],
    };
    const distributeCommand = new DistributeElementsCommand(distributeOperation);
    diagram = distributeCommand.execute(diagram);

    // Verify final state
    expect(diagram.elements[0].style.fill).toBe('#ff0000');
    expect(diagram.elements[0].style.strokeWidth).toBe(4);
    expect(diagram.elements[0].position.x).toBe(10); // Aligned to left
    expect(diagram.elements[1].position.x).toBe(10); // Aligned to left
    expect(diagram.elements[2].position.x).toBe(10); // Aligned to left

    // Should be distributed vertically
    expect(diagram.elements[0].position.y).toBe(10);
    expect(diagram.elements[2].position.y).toBe(30);
  });

  test('should handle metadata updates consistently', () => {
    const elements = [createMockElement('1')];
    const diagram = createMockDiagram(elements);
    const originalModified = diagram.metadata.modified;

    const update: BulkStyleUpdate = {
      elementIds: ['1'],
      styleUpdates: { fill: '#ff0000' },
      mode: 'replace',
    };

    const command = new BulkStyleCommand(update);
    const result = command.execute(diagram);

    expect(result.metadata.modified).not.toBe(originalModified);
    expect(new Date(result.metadata.modified).getTime()).toBeGreaterThan(
      new Date(originalModified).getTime()
    );
  });
});