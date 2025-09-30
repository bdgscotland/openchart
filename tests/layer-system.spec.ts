import { test, expect, Page } from '@playwright/test';

test.describe('Layer System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Wait for canvas to be ready
    await page.waitForSelector('.react-flow', { timeout: 5000 });
  });

  // Helper function to open LayersPanel
  async function openLayersPanel(page: Page) {
    // Check if panel is already open
    const panel = page.locator('.layers-panel:not(.collapsed)');
    const isOpen = await panel.isVisible().catch(() => false);

    if (!isOpen) {
      // Try View menu
      await page.locator('button:has-text("View")').click();
      await page.locator('text=Layers').click();
      await page.waitForTimeout(500);
    }
  }

  // Helper function to add a shape to the canvas
  async function addShape(page: Page, shapeType: 'rectangle' | 'circle' | 'diamond', x = 300, y = 300) {
    // Click on toolbar button for the shape
    await page.locator(`button[title*="${shapeType}"]`).first().click();

    // Click on canvas to place shape
    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x, y } });

    await page.waitForTimeout(300);
  }

  test('Test 1: Layer Panel Visibility and Initial State', async ({ page }) => {
    await openLayersPanel(page);

    // Verify panel is visible
    const panel = page.locator('.layers-panel:not(.collapsed)');
    await expect(panel).toBeVisible();

    // Verify header
    await expect(panel.locator('.layers-panel-title')).toContainText('Layers');

    // Verify empty state
    const emptyMessage = panel.locator('.layers-panel-empty');
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toContainText('No layers yet');
    }

    console.log('✅ Test 1 PASSED: Layer Panel is visible with correct initial state');
  });

  test('Test 2: Shapes Appear as Layers', async ({ page }) => {
    await openLayersPanel(page);

    // Add first shape
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(500);

    // Verify layer appears
    const layersList = page.locator('.layers-panel-list');
    const layerItems = layersList.locator('.layer-item');
    await expect(layerItems).toHaveCount(1, { timeout: 3000 });

    // Add second shape
    await addShape(page, 'circle', 400, 300);
    await page.waitForTimeout(500);

    // Verify second layer appears
    await expect(layerItems).toHaveCount(2, { timeout: 3000 });

    // Verify layer count in header
    await expect(page.locator('.layers-panel-count')).toContainText('2');

    console.log('✅ Test 2 PASSED: Shapes appear as layers in the panel');
  });

  test('Test 3: Layer Visibility Toggle', async ({ page }) => {
    await openLayersPanel(page);

    // Add two shapes
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(500);
    await addShape(page, 'circle', 400, 300);
    await page.waitForTimeout(500);

    // Get first layer
    const firstLayer = page.locator('.layer-item').first();

    // Click visibility toggle (Eye icon)
    const visibilityBtn = firstLayer.locator('button').filter({ has: page.locator('svg') }).nth(1);
    await visibilityBtn.click();
    await page.waitForTimeout(300);

    // Verify layer shows as hidden
    await expect(firstLayer).toHaveClass(/hidden/);

    // Click again to show
    await visibilityBtn.click();
    await page.waitForTimeout(300);

    // Verify layer is visible again
    await expect(firstLayer).not.toHaveClass(/hidden/);

    console.log('✅ Test 3 PASSED: Layer visibility toggle works');
  });

  test('Test 4: Layer Locking', async ({ page }) => {
    await openLayersPanel(page);

    // Add a shape
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(500);

    // Get the layer
    const layer = page.locator('.layer-item').first();

    // Click lock toggle (Lock icon)
    const lockBtn = layer.locator('button').filter({ has: page.locator('svg') }).nth(2);
    await lockBtn.click();
    await page.waitForTimeout(300);

    // Verify layer is not draggable anymore
    const layerElement = await layer.elementHandle();
    const isDraggable = await layerElement?.getAttribute('draggable');
    expect(isDraggable).toBe('false');

    // Try to drag the shape on canvas - it should not move
    const canvas = page.locator('.react-flow__pane');
    const node = page.locator('.react-flow__node').first();

    const initialBox = await node.boundingBox();
    if (initialBox) {
      await node.hover();
      await page.mouse.down();
      await page.mouse.move(initialBox.x + 50, initialBox.y + 50);
      await page.mouse.up();
      await page.waitForTimeout(300);

      const newBox = await node.boundingBox();
      // Position should not have changed (or changed minimally due to grid snap)
      expect(Math.abs((newBox?.x || 0) - initialBox.x)).toBeLessThan(10);
      expect(Math.abs((newBox?.y || 0) - initialBox.y)).toBeLessThan(10);
    }

    // Unlock
    await lockBtn.click();
    await page.waitForTimeout(300);

    console.log('✅ Test 4 PASSED: Layer locking prevents interaction');
  });

  test('Test 5: Layer Opacity Control', async ({ page }) => {
    await openLayersPanel(page);

    // Add a shape
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(500);

    // Get the layer
    const layer = page.locator('.layer-item').first();

    // Hover over opacity control to reveal slider
    const opacityControl = layer.locator('.opacity-control');
    await opacityControl.hover();
    await page.waitForTimeout(300);

    // Verify slider appears
    const slider = layer.locator('.opacity-slider');
    await expect(slider).toBeVisible();

    // Get initial opacity display
    const opacityDisplay = layer.locator('.opacity-display');
    const initialOpacity = await opacityDisplay.textContent();

    // Change opacity to 50%
    await slider.fill('50');
    await page.waitForTimeout(300);

    // Verify opacity display updated
    await expect(opacityDisplay).toContainText('50%');

    console.log('✅ Test 5 PASSED: Layer opacity control works');
  });

  test('Test 6: Layer Renaming', async ({ page }) => {
    await openLayersPanel(page);

    // Add a shape
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(500);

    // Get the layer
    const layer = page.locator('.layer-item').first();

    // Double-click to edit name
    const nameElement = layer.locator('.layer-item-name');
    await nameElement.dblclick();
    await page.waitForTimeout(200);

    // Verify input appears
    const input = layer.locator('.layer-item-name-input');
    await expect(input).toBeVisible();

    // Type new name
    await input.fill('My Layer');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Verify name changed
    await expect(nameElement).toContainText('My Layer');

    console.log('✅ Test 6 PASSED: Layer renaming works');
  });

  test('Test 7: Layer Deletion', async ({ page }) => {
    await openLayersPanel(page);

    // Add two shapes
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(500);
    await addShape(page, 'circle', 400, 300);
    await page.waitForTimeout(500);

    // Verify we have 2 layers
    const layerItems = page.locator('.layer-item');
    await expect(layerItems).toHaveCount(2);

    // Select first layer
    const firstLayer = layerItems.first();
    await firstLayer.click();
    await page.waitForTimeout(300);

    // Click delete button in toolbar
    const deleteBtn = page.locator('.layers-panel-toolbar button.danger');

    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept());

    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Verify only 1 layer remains
    await expect(layerItems).toHaveCount(1, { timeout: 3000 });

    console.log('✅ Test 7 PASSED: Layer deletion works');
  });

  test('Test 8: Batch Operations - Hide All / Show All', async ({ page }) => {
    await openLayersPanel(page);

    // Add three shapes
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(300);
    await addShape(page, 'circle', 400, 300);
    await page.waitForTimeout(300);
    await addShape(page, 'diamond', 500, 300);
    await page.waitForTimeout(300);

    // Click "Hide All" button
    const hideAllBtn = page.locator('.layers-panel-toolbar button[title*="Hide all"]');
    await hideAllBtn.click();
    await page.waitForTimeout(500);

    // Verify all layers are hidden
    const hiddenLayers = page.locator('.layer-item.hidden');
    await expect(hiddenLayers).toHaveCount(3, { timeout: 3000 });

    // Verify stats show 0 visible
    await expect(page.locator('.layers-panel-stats')).toContainText('0 visible');

    // Click "Show All" button
    const showAllBtn = page.locator('.layers-panel-toolbar button[title*="Show all"]');
    await showAllBtn.click();
    await page.waitForTimeout(500);

    // Verify no layers are hidden
    await expect(hiddenLayers).toHaveCount(0, { timeout: 3000 });

    // Verify stats show 3 visible
    await expect(page.locator('.layers-panel-stats')).toContainText('3 visible');

    console.log('✅ Test 8 PASSED: Batch hide/show operations work');
  });

  test('Test 9: Batch Operations - Lock All / Unlock All', async ({ page }) => {
    await openLayersPanel(page);

    // Add two shapes
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(300);
    await addShape(page, 'circle', 400, 300);
    await page.waitForTimeout(300);

    // Click "Lock All" button
    const lockAllBtn = page.locator('.layers-panel-toolbar button[title*="Lock all"]');
    await lockAllBtn.click();
    await page.waitForTimeout(500);

    // Verify stats show 2 locked
    await expect(page.locator('.layers-panel-stats')).toContainText('2 locked');

    // Click "Unlock All" button
    const unlockAllBtn = page.locator('.layers-panel-toolbar button[title*="Unlock all"]');
    await unlockAllBtn.click();
    await page.waitForTimeout(500);

    // Verify stats show 0 locked
    await expect(page.locator('.layers-panel-stats')).toContainText('0 locked');

    console.log('✅ Test 9 PASSED: Batch lock/unlock operations work');
  });

  test('Test 10: Layer Search/Filter', async ({ page }) => {
    await openLayersPanel(page);

    // Add shapes with different types
    await addShape(page, 'rectangle', 300, 300);
    await page.waitForTimeout(300);
    await addShape(page, 'circle', 400, 300);
    await page.waitForTimeout(300);

    // Rename first layer
    const firstLayer = page.locator('.layer-item').first();
    await firstLayer.locator('.layer-item-name').dblclick();
    await firstLayer.locator('.layer-item-name-input').fill('Test Layer');
    await firstLayer.locator('.layer-item-name-input').press('Enter');
    await page.waitForTimeout(300);

    // Type in search
    const searchInput = page.locator('.layers-panel-search input');
    await searchInput.fill('Test');
    await page.waitForTimeout(500);

    // Verify only matching layers shown
    const visibleLayers = page.locator('.layer-item');
    await expect(visibleLayers).toHaveCount(1, { timeout: 3000 });

    // Clear search
    const clearBtn = page.locator('.search-clear');
    await clearBtn.click();
    await page.waitForTimeout(300);

    // Verify all layers shown again
    await expect(visibleLayers).toHaveCount(2, { timeout: 3000 });

    console.log('✅ Test 10 PASSED: Layer search/filter works');
  });
});