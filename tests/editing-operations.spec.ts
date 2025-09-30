/**
 * Comprehensive test suite for OpenChart editing operations
 * Tests: Undo/Redo, Copy/Paste, Duplicate, Delete, Save/Load
 */

import { test, expect, Page } from '@playwright/test';
import { chromium } from '@playwright/test';

// Helper function to add a shape
async function addShape(page: Page, shapeType: string = 'rectangle') {
  // Find and drag a shape from the toolbar
  const shapeButton = page.locator(`[data-shape-type="${shapeType}"], .shape-item:has-text("${shapeType}")`).first();

  // Get the canvas
  const canvas = page.locator('.react-flow__viewport, .react-flow').first();

  // Drag shape to canvas
  await shapeButton.dragTo(canvas, {
    targetPosition: { x: 200, y: 200 }
  });

  // Wait for shape to be rendered
  await page.waitForTimeout(500);
}

// Helper function to get node count
async function getNodeCount(page: Page): Promise<number> {
  const nodes = await page.locator('.react-flow__node').count();
  return nodes;
}

// Helper function to select all nodes
async function selectAllNodes(page: Page) {
  await page.keyboard.press('Control+A');
  await page.waitForTimeout(300);
}

// Helper function to click on canvas to deselect
async function deselectAll(page: Page) {
  const pane = page.locator('.react-flow__pane').first();
  await pane.click({ position: { x: 50, y: 50 } });
  await page.waitForTimeout(300);
}

test.describe('OpenChart Editing Operations', () => {
  let browser;
  let page: Page;

  test.beforeAll(async () => {
    browser = await chromium.launch();
  });

  test.afterAll(async () => {
    await browser?.close();
  });

  test.beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give the app time to initialize
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('1. Undo/Redo - should undo and redo shape creation', async () => {
    console.log('🧪 Test 1: Undo/Redo functionality');

    // Get initial node count
    const initialCount = await getNodeCount(page);
    console.log(`Initial node count: ${initialCount}`);

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-initial-state.png' });

    // Add a shape
    console.log('Adding a shape...');
    await addShape(page, 'rectangle');

    // Verify shape was added
    const countAfterAdd = await getNodeCount(page);
    console.log(`Node count after adding: ${countAfterAdd}`);
    await page.screenshot({ path: 'test-results/02-shape-added.png' });
    expect(countAfterAdd).toBe(initialCount + 1);

    // Click Undo button or press Ctrl+Z
    console.log('Performing undo...');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    // Verify shape was removed
    const countAfterUndo = await getNodeCount(page);
    console.log(`Node count after undo: ${countAfterUndo}`);
    await page.screenshot({ path: 'test-results/03-after-undo.png' });
    expect(countAfterUndo).toBe(initialCount);

    // Click Redo button or press Ctrl+Y
    console.log('Performing redo...');
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    // Verify shape reappeared
    const countAfterRedo = await getNodeCount(page);
    console.log(`Node count after redo: ${countAfterRedo}`);
    await page.screenshot({ path: 'test-results/04-after-redo.png' });
    expect(countAfterRedo).toBe(initialCount + 1);

    console.log('✅ Test 1 passed: Undo/Redo works correctly');
  });

  test('2. Copy/Paste - should copy and paste shapes with Ctrl+C/Ctrl+V', async () => {
    console.log('🧪 Test 2: Copy/Paste functionality');

    // Add a shape
    console.log('Adding a shape...');
    await addShape(page, 'rectangle');
    const initialCount = await getNodeCount(page);
    await page.screenshot({ path: 'test-results/05-before-copy.png' });

    // Select the shape (it should be selected after adding)
    // If not, click on it
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.waitForTimeout(300);

    // Copy with Ctrl+C
    console.log('Copying shape...');
    await page.keyboard.press('Control+c');
    await page.waitForTimeout(300);

    // Paste with Ctrl+V
    console.log('Pasting shape...');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(500);

    // Verify shape was pasted
    const countAfterPaste = await getNodeCount(page);
    console.log(`Node count: ${initialCount} → ${countAfterPaste}`);
    await page.screenshot({ path: 'test-results/06-after-paste.png' });
    expect(countAfterPaste).toBe(initialCount + 1);

    console.log('✅ Test 2 passed: Copy/Paste works correctly');
  });

  test('3. Duplicate - should duplicate shapes with Ctrl+D', async () => {
    console.log('🧪 Test 3: Duplicate functionality');

    // Add a shape
    console.log('Adding a shape...');
    await addShape(page, 'circle');
    const initialCount = await getNodeCount(page);
    await page.screenshot({ path: 'test-results/07-before-duplicate.png' });

    // Select the shape
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.waitForTimeout(300);

    // Duplicate with Ctrl+D
    console.log('Duplicating shape...');
    await page.keyboard.press('Control+d');
    await page.waitForTimeout(500);

    // Verify shape was duplicated
    const countAfterDuplicate = await getNodeCount(page);
    console.log(`Node count: ${initialCount} → ${countAfterDuplicate}`);
    await page.screenshot({ path: 'test-results/08-after-duplicate.png' });
    expect(countAfterDuplicate).toBe(initialCount + 1);

    console.log('✅ Test 3 passed: Duplicate works correctly');
  });

  test('4. Delete - should delete shapes with Delete key', async () => {
    console.log('🧪 Test 4: Delete functionality');

    // Add a shape
    console.log('Adding a shape...');
    await addShape(page, 'diamond');
    const initialCount = await getNodeCount(page);
    await page.screenshot({ path: 'test-results/09-before-delete.png' });

    // Select the shape
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.waitForTimeout(300);

    // Delete with Delete key
    console.log('Deleting shape...');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);

    // Verify shape was deleted
    const countAfterDelete = await getNodeCount(page);
    console.log(`Node count: ${initialCount} → ${countAfterDelete}`);
    await page.screenshot({ path: 'test-results/10-after-delete.png' });
    expect(countAfterDelete).toBe(initialCount - 1);

    console.log('✅ Test 4 passed: Delete works correctly');
  });

  test('5. Save/Load - should save and load diagrams', async () => {
    console.log('🧪 Test 5: Save/Load functionality');

    // Add multiple shapes
    console.log('Adding shapes...');
    await addShape(page, 'rectangle');
    await page.waitForTimeout(300);
    await addShape(page, 'circle');
    await page.waitForTimeout(300);

    const countBeforeSave = await getNodeCount(page);
    console.log(`Node count before save: ${countBeforeSave}`);
    await page.screenshot({ path: 'test-results/11-before-save.png' });

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click File > Save (or use save button)
    console.log('Saving diagram...');
    const fileMenu = page.locator('button:has-text("File"), [aria-label="File menu"]').first();
    if (await fileMenu.count() > 0) {
      await fileMenu.click();
      await page.waitForTimeout(300);
      const saveButton = page.locator('button:has-text("Save"), [aria-label="Save"]').first();
      await saveButton.click();
    } else {
      // Try keyboard shortcut
      await page.keyboard.press('Control+s');
    }

    // Wait for download
    const download = await downloadPromise;
    const downloadPath = `/tmp/openchart-test-${Date.now()}.json`;
    await download.saveAs(downloadPath);
    console.log(`Diagram saved to: ${downloadPath}`);

    // Clear the canvas
    console.log('Clearing canvas...');
    await selectAllNodes(page);
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);

    const countAfterClear = await getNodeCount(page);
    console.log(`Node count after clear: ${countAfterClear}`);
    await page.screenshot({ path: 'test-results/12-after-clear.png' });

    // Load the saved file
    console.log('Loading diagram...');
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(downloadPath);
      await page.waitForTimeout(1000);
    } else {
      // Try File > Open
      const fileMenu2 = page.locator('button:has-text("File")').first();
      await fileMenu2.click();
      await page.waitForTimeout(300);
      const openButton = page.locator('button:has-text("Open")').first();
      await openButton.click();
      await page.waitForTimeout(300);
      const fileInput2 = page.locator('input[type="file"]');
      await fileInput2.setInputFiles(downloadPath);
      await page.waitForTimeout(1000);
    }

    // Verify shapes were restored
    const countAfterLoad = await getNodeCount(page);
    console.log(`Node count after load: ${countAfterLoad}`);
    await page.screenshot({ path: 'test-results/13-after-load.png' });
    expect(countAfterLoad).toBe(countBeforeSave);

    console.log('✅ Test 5 passed: Save/Load works correctly');
  });

  test('6. Multiple Operations - should handle complex editing sequence', async () => {
    console.log('🧪 Test 6: Multiple operations test');

    // Add shapes
    await addShape(page, 'rectangle');
    await page.waitForTimeout(300);
    await addShape(page, 'circle');
    await page.waitForTimeout(300);

    const initialCount = await getNodeCount(page);
    console.log(`Initial count: ${initialCount}`);

    // Select first shape and duplicate it
    const nodes = page.locator('.react-flow__node');
    await nodes.first().click();
    await page.keyboard.press('Control+d');
    await page.waitForTimeout(500);

    let currentCount = await getNodeCount(page);
    expect(currentCount).toBe(initialCount + 1);
    console.log(`After duplicate: ${currentCount}`);

    // Undo the duplicate
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    currentCount = await getNodeCount(page);
    expect(currentCount).toBe(initialCount);
    console.log(`After undo: ${currentCount}`);

    // Redo the duplicate
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    currentCount = await getNodeCount(page);
    expect(currentCount).toBe(initialCount + 1);
    console.log(`After redo: ${currentCount}`);

    await page.screenshot({ path: 'test-results/14-complex-operations.png' });

    console.log('✅ Test 6 passed: Multiple operations work correctly');
  });
});