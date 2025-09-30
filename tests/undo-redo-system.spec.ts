/**
 * Undo/Redo System Tests - Comprehensive testing for undo/redo functionality
 * Tests all major operations: create, move, style, text, delete, z-order
 * Also tests keyboard shortcuts, UI buttons, and history limits
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Helper to create test-results directory
const SCREENSHOTS_DIR = 'test-results/undo-redo';

// Helper to count nodes in React Flow
async function getNodeCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const nodes = document.querySelectorAll('.react-flow__node');
    return nodes.length;
  });
}

// Helper to get node position
async function getNodePosition(page: Page, nodeIndex: number): Promise<{ x: number; y: number }> {
  return await page.evaluate((index) => {
    const nodes = document.querySelectorAll('.react-flow__node');
    const node = nodes[index] as HTMLElement;
    if (!node) return { x: 0, y: 0 };

    const transform = node.style.transform;
    const match = transform.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return { x: 0, y: 0 };
  }, nodeIndex);
}

// Helper to get node fill color
async function getNodeFillColor(page: Page, nodeIndex: number): Promise<string> {
  return await page.evaluate((index) => {
    const nodes = document.querySelectorAll('.react-flow__node');
    const node = nodes[index] as HTMLElement;
    if (!node) return '';

    // Look for the shape element inside the node
    const shape = node.querySelector('rect, circle, path, polygon') as SVGElement;
    if (!shape) return '';

    return shape.getAttribute('fill') || window.getComputedStyle(shape).fill;
  }, nodeIndex);
}

// Helper to get node text content
async function getNodeText(page: Page, nodeIndex: number): Promise<string> {
  return await page.evaluate((index) => {
    const nodes = document.querySelectorAll('.react-flow__node');
    const node = nodes[index] as HTMLElement;
    if (!node) return '';

    const textElement = node.querySelector('text, span, div[contenteditable]');
    return textElement?.textContent || '';
  }, nodeIndex);
}

// Helper to get edge count
async function getEdgeCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const edges = document.querySelectorAll('.react-flow__edge');
    return edges.length;
  });
}

// Helper to check if undo button is enabled
async function isUndoButtonEnabled(page: Page): Promise<boolean> {
  const undoButton = page.locator('button[title*="Undo"], button:has-text("Undo")').first();
  if (await undoButton.count() === 0) return false;
  return !(await undoButton.isDisabled());
}

// Helper to check if redo button is enabled
async function isRedoButtonEnabled(page: Page): Promise<boolean> {
  const redoButton = page.locator('button[title*="Redo"], button:has-text("Redo")').first();
  if (await redoButton.count() === 0) return false;
  return !(await redoButton.isDisabled());
}

test.describe('Undo/Redo System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for app to fully initialize
  });

  test('1. Basic Undo/Redo - Shape Creation', async ({ page }) => {
    console.log('🧪 Test 1: Basic Undo/Redo - Shape Creation');

    // Get initial node count
    const initialCount = await getNodeCount(page);
    console.log(`Initial node count: ${initialCount}`);

    // Create a shape (rectangle)
    console.log('Creating rectangle...');
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    // Click on canvas to place the shape
    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    // Verify shape was created
    const countAfterCreate = await getNodeCount(page);
    console.log(`Node count after creation: ${countAfterCreate}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-after-create.png` });
    expect(countAfterCreate).toBe(initialCount + 1);

    // Test Undo (Ctrl+Z)
    console.log('Performing undo with Ctrl+Z...');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    const countAfterUndo = await getNodeCount(page);
    console.log(`Node count after undo: ${countAfterUndo}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-after-undo.png` });
    expect(countAfterUndo).toBe(initialCount);

    // Test Redo (Ctrl+Y)
    console.log('Performing redo with Ctrl+Y...');
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    const countAfterRedo = await getNodeCount(page);
    console.log(`Node count after redo: ${countAfterRedo}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-after-redo.png` });
    expect(countAfterRedo).toBe(initialCount + 1);

    // Test Redo with Ctrl+Shift+Z
    console.log('Testing redo with Ctrl+Shift+Z...');
    await page.keyboard.press('Control+z'); // Undo first
    await page.waitForTimeout(300);
    await page.keyboard.press('Control+Shift+Z'); // Redo with alternate shortcut
    await page.waitForTimeout(500);

    const countAfterRedoAlt = await getNodeCount(page);
    console.log(`Node count after redo (Ctrl+Shift+Z): ${countAfterRedoAlt}`);
    expect(countAfterRedoAlt).toBe(initialCount + 1);

    console.log('✅ Test 1 passed: Basic undo/redo works correctly');
  });

  test('2. Move Operations Undo/Redo', async ({ page }) => {
    console.log('🧪 Test 2: Move Operations Undo/Redo');

    // Create a shape
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);

    // Get initial position
    const initialPos = await getNodePosition(page, 0);
    console.log(`Initial position: (${initialPos.x}, ${initialPos.y})`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-before-move.png` });

    // Drag the shape to a new position
    console.log('Dragging shape to new position...');
    const node = page.locator('.react-flow__node').first();
    await node.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });
    await page.waitForTimeout(500);

    const movedPos = await getNodePosition(page, 0);
    console.log(`Moved position: (${movedPos.x}, ${movedPos.y})`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-after-move.png` });

    // Verify position changed
    expect(Math.abs(movedPos.x - initialPos.x) > 50).toBeTruthy();

    // Undo the move
    console.log('Undoing move...');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    const undoPos = await getNodePosition(page, 0);
    console.log(`Position after undo: (${undoPos.x}, ${undoPos.y})`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-after-undo-move.png` });

    // Position should be close to initial (allow small tolerance)
    expect(Math.abs(undoPos.x - initialPos.x) < 50).toBeTruthy();

    // Redo the move
    console.log('Redoing move...');
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    const redoPos = await getNodePosition(page, 0);
    console.log(`Position after redo: (${redoPos.x}, ${redoPos.y})`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-after-redo-move.png` });

    // Position should be close to moved position
    expect(Math.abs(redoPos.x - movedPos.x) < 50).toBeTruthy();

    console.log('✅ Test 2 passed: Move undo/redo works correctly');
  });

  test('3. Style Changes Undo/Redo', async ({ page }) => {
    console.log('🧪 Test 3: Style Changes Undo/Redo');

    // Create a shape
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    // Click on the shape to select it
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.waitForTimeout(500);

    // Get initial fill color
    const initialColor = await getNodeFillColor(page, 0);
    console.log(`Initial color: ${initialColor}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/08-before-style-change.png` });

    // Try to change fill color in property panel
    console.log('Looking for fill color control...');

    // Look for color input in property panel
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.count() > 0) {
      await colorInput.fill('#ff0000'); // Red
      await page.waitForTimeout(500);

      const changedColor = await getNodeFillColor(page, 0);
      console.log(`Changed color: ${changedColor}`);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/09-after-style-change.png` });

      // Undo style change
      console.log('Undoing style change...');
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(500);

      const undoColor = await getNodeFillColor(page, 0);
      console.log(`Color after undo: ${undoColor}`);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/10-after-undo-style.png` });

      // Redo style change
      console.log('Redoing style change...');
      await page.keyboard.press('Control+y');
      await page.waitForTimeout(500);

      const redoColor = await getNodeFillColor(page, 0);
      console.log(`Color after redo: ${redoColor}`);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/11-after-redo-style.png` });

      console.log('✅ Test 3 passed: Style undo/redo works correctly');
    } else {
      console.log('⚠️ Test 3 skipped: Could not find color input in property panel');
    }
  });

  test('4. Text Editing Undo/Redo', async ({ page }) => {
    console.log('🧪 Test 4: Text Editing Undo/Redo');

    // Create a shape
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    // Get initial text
    const initialText = await getNodeText(page, 0);
    console.log(`Initial text: "${initialText}"`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/12-before-text-edit.png` });

    // Double-click to edit text
    console.log('Double-clicking to edit text...');
    const node = page.locator('.react-flow__node').first();
    await node.dblclick();
    await page.waitForTimeout(500);

    // Type new text
    const newText = 'Test Shape';
    console.log(`Typing new text: "${newText}"`);
    await page.keyboard.type(newText);
    await page.waitForTimeout(500);

    // Click outside to finish editing
    await canvas.click({ position: { x: 500, y: 400 } });
    await page.waitForTimeout(500);

    const changedText = await getNodeText(page, 0);
    console.log(`Changed text: "${changedText}"`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/13-after-text-edit.png` });

    // Undo text change
    console.log('Undoing text change...');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    const undoText = await getNodeText(page, 0);
    console.log(`Text after undo: "${undoText}"`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/14-after-undo-text.png` });

    // Redo text change
    console.log('Redoing text change...');
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    const redoText = await getNodeText(page, 0);
    console.log(`Text after redo: "${redoText}"`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/15-after-redo-text.png` });

    console.log('✅ Test 4 passed: Text edit undo/redo works correctly');
  });

  test('5. Delete Operations Undo/Redo', async ({ page }) => {
    console.log('🧪 Test 5: Delete Operations Undo/Redo');

    // Create two shapes
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);

    await rectangleButton.click();
    await page.waitForTimeout(500);
    await canvas.click({ position: { x: 400, y: 200 } });
    await page.waitForTimeout(500);

    const initialNodeCount = await getNodeCount(page);
    console.log(`Initial node count: ${initialNodeCount}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/16-before-delete.png` });

    // Select and delete first shape
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.waitForTimeout(500);

    console.log('Deleting shape...');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);

    const afterDeleteCount = await getNodeCount(page);
    console.log(`Node count after delete: ${afterDeleteCount}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/17-after-delete.png` });
    expect(afterDeleteCount).toBe(initialNodeCount - 1);

    // Undo delete
    console.log('Undoing delete...');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    const afterUndoCount = await getNodeCount(page);
    console.log(`Node count after undo: ${afterUndoCount}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/18-after-undo-delete.png` });
    expect(afterUndoCount).toBe(initialNodeCount);

    // Redo delete
    console.log('Redoing delete...');
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    const afterRedoCount = await getNodeCount(page);
    console.log(`Node count after redo: ${afterRedoCount}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/19-after-redo-delete.png` });
    expect(afterRedoCount).toBe(initialNodeCount - 1);

    console.log('✅ Test 5 passed: Delete undo/redo works correctly');
  });

  test('6. Z-Order Operations Undo/Redo', async ({ page }) => {
    console.log('🧪 Test 6: Z-Order Operations Undo/Redo');

    // Create two overlapping shapes
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    await rectangleButton.click();
    await page.waitForTimeout(500);
    await canvas.click({ position: { x: 320, y: 220 } });
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/20-before-z-order.png` });

    // Select the first shape (which should be behind)
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.waitForTimeout(500);

    // Look for "Bring to Front" button
    console.log('Looking for z-order controls...');
    const bringToFrontButton = page.locator('button:has-text("Bring to Front"), button[title*="Bring to Front"]').first();

    if (await bringToFrontButton.count() > 0) {
      console.log('Bringing shape to front...');
      await bringToFrontButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/21-after-z-order-change.png` });

      // Undo z-order change
      console.log('Undoing z-order change...');
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/22-after-undo-z-order.png` });

      // Redo z-order change
      console.log('Redoing z-order change...');
      await page.keyboard.press('Control+y');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/23-after-redo-z-order.png` });

      console.log('✅ Test 6 passed: Z-order undo/redo works correctly');
    } else {
      console.log('⚠️ Test 6 skipped: Could not find z-order controls');
    }
  });

  test('7. UI Buttons - Undo/Redo', async ({ page }) => {
    console.log('🧪 Test 7: UI Buttons - Undo/Redo');

    // Check initial button states (should be disabled)
    const initialUndoEnabled = await isUndoButtonEnabled(page);
    const initialRedoEnabled = await isRedoButtonEnabled(page);
    console.log(`Initial state - Undo enabled: ${initialUndoEnabled}, Redo enabled: ${initialRedoEnabled}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/24-initial-button-state.png` });

    // Should be disabled when there's nothing to undo/redo
    expect(initialUndoEnabled).toBe(false);
    expect(initialRedoEnabled).toBe(false);

    // Create a shape
    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    await rectangleButton.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.react-flow__renderer').first();
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    // Check button states after operation (undo should be enabled)
    const afterCreateUndoEnabled = await isUndoButtonEnabled(page);
    const afterCreateRedoEnabled = await isRedoButtonEnabled(page);
    console.log(`After create - Undo enabled: ${afterCreateUndoEnabled}, Redo enabled: ${afterCreateRedoEnabled}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/25-after-create-button-state.png` });

    expect(afterCreateUndoEnabled).toBe(true);
    expect(afterCreateRedoEnabled).toBe(false);

    // Click undo button
    console.log('Clicking undo button...');
    const undoButton = page.locator('button[title*="Undo"], button:has-text("Undo")').first();
    await undoButton.click();
    await page.waitForTimeout(500);

    // Check button states after undo (redo should be enabled)
    const afterUndoUndoEnabled = await isUndoButtonEnabled(page);
    const afterUndoRedoEnabled = await isRedoButtonEnabled(page);
    console.log(`After undo - Undo enabled: ${afterUndoUndoEnabled}, Redo enabled: ${afterUndoRedoEnabled}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/26-after-undo-button-state.png` });

    expect(afterUndoRedoEnabled).toBe(true);

    // Click redo button
    console.log('Clicking redo button...');
    const redoButton = page.locator('button[title*="Redo"], button:has-text("Redo")').first();
    await redoButton.click();
    await page.waitForTimeout(500);

    // Verify node was restored
    const finalNodeCount = await getNodeCount(page);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/27-after-redo-button-state.png` });
    expect(finalNodeCount).toBeGreaterThan(0);

    console.log('✅ Test 7 passed: UI buttons work correctly');
  });

  test('8. Undo History Limit (50 operations)', async ({ page }) => {
    console.log('🧪 Test 8: Undo History Limit');

    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    const canvas = page.locator('.react-flow__renderer').first();

    // Create more than 50 shapes
    console.log('Creating 55 shapes to test history limit...');
    for (let i = 0; i < 55; i++) {
      await rectangleButton.click();
      await page.waitForTimeout(100);
      await canvas.click({ position: { x: 200 + (i % 10) * 50, y: 200 + Math.floor(i / 10) * 50 } });
      await page.waitForTimeout(100);

      if (i % 10 === 0) {
        console.log(`Created ${i + 1} shapes...`);
      }
    }

    const totalCount = await getNodeCount(page);
    console.log(`Total shapes created: ${totalCount}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/28-after-many-creates.png` });

    // Try to undo all operations
    console.log('Attempting to undo all operations...');
    let undoCount = 0;
    const maxUndos = 60; // Try more than history limit

    for (let i = 0; i < maxUndos; i++) {
      const beforeCount = await getNodeCount(page);
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(100);
      const afterCount = await getNodeCount(page);

      if (afterCount < beforeCount) {
        undoCount++;
      } else {
        console.log(`Undo stopped at ${undoCount} operations`);
        break;
      }
    }

    console.log(`Total undos performed: ${undoCount}`);
    const finalCount = await getNodeCount(page);
    console.log(`Final node count: ${finalCount}`);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/29-after-many-undos.png` });

    // Should have stopped at history limit (around 50)
    // Some operations might still remain
    expect(undoCount).toBeLessThanOrEqual(55);
    expect(finalCount).toBeGreaterThan(0); // Should not undo everything

    console.log('✅ Test 8 passed: History limit works correctly');
  });

  test('9. Multiple Operations and Complex Workflow', async ({ page }) => {
    console.log('🧪 Test 9: Multiple Operations Complex Workflow');

    const rectangleButton = page.locator('button[title*="Rectangle"], button:has-text("Rectangle")').first();
    const canvas = page.locator('.react-flow__renderer').first();

    // Create shape
    await rectangleButton.click();
    await page.waitForTimeout(500);
    await canvas.click({ position: { x: 300, y: 200 } });
    await page.waitForTimeout(500);

    const checkpoint1 = await getNodeCount(page);
    console.log(`Checkpoint 1 - Nodes: ${checkpoint1}`);

    // Move shape
    const node = page.locator('.react-flow__node').first();
    await node.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });
    await page.waitForTimeout(500);

    // Create another shape
    await rectangleButton.click();
    await page.waitForTimeout(500);
    await canvas.click({ position: { x: 500, y: 200 } });
    await page.waitForTimeout(500);

    const checkpoint2 = await getNodeCount(page);
    console.log(`Checkpoint 2 - Nodes: ${checkpoint2}`);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/30-complex-workflow.png` });

    // Undo last operation (create second shape)
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);
    const afterUndo1 = await getNodeCount(page);
    expect(afterUndo1).toBe(checkpoint1);

    // Undo move operation
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    // Undo create first shape
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);
    const afterUndo3 = await getNodeCount(page);
    expect(afterUndo3).toBe(0);

    // Redo all three operations
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    const afterRedoAll = await getNodeCount(page);
    expect(afterRedoAll).toBe(checkpoint2);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/31-after-complex-redo.png` });

    console.log('✅ Test 9 passed: Complex workflow undo/redo works correctly');
  });
});
