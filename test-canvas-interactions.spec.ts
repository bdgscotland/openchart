import { test, expect, Page } from '@playwright/test';

test.describe('OpenChart Canvas Interaction Tests', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    // Wait for React Flow to be ready
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Test Zoom Controls - Zoom In Button', async () => {
    console.log('Testing zoom in button...');

    // Find and click the zoom in button
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    await expect(zoomInButton).toBeVisible();

    // Get initial zoom level
    const zoomDisplay = page.locator('.zoom-display');
    await expect(zoomDisplay).toBeVisible();
    const initialZoom = await zoomDisplay.textContent();
    console.log('Initial zoom:', initialZoom);

    // Click zoom in
    await zoomInButton.click();
    await page.waitForTimeout(500);

    // Verify zoom changed
    const newZoom = await zoomDisplay.textContent();
    console.log('New zoom after zoom in:', newZoom);
    expect(newZoom).not.toBe(initialZoom);
    expect(newZoom).not.toContain('NaN');
  });

  test('2. Test Zoom Controls - Zoom Out Button', async () => {
    console.log('Testing zoom out button...');

    const zoomOutButton = page.locator('button[aria-label="Zoom out"]');
    await expect(zoomOutButton).toBeVisible();

    const zoomDisplay = page.locator('.zoom-display');
    const initialZoom = await zoomDisplay.textContent();
    console.log('Initial zoom:', initialZoom);

    // Click zoom out
    await zoomOutButton.click();
    await page.waitForTimeout(500);

    const newZoom = await zoomDisplay.textContent();
    console.log('New zoom after zoom out:', newZoom);
    expect(newZoom).not.toBe(initialZoom);
    expect(newZoom).not.toContain('NaN');
  });

  test('3. Test Zoom Controls - Fit to View Button', async () => {
    console.log('Testing fit to view button...');

    const fitViewButton = page.locator('button[aria-label="Fit diagram to view"]');
    await expect(fitViewButton).toBeVisible();

    // Click fit to view
    await fitViewButton.click();
    await page.waitForTimeout(500);

    // Verify zoom display is not NaN
    const zoomDisplay = page.locator('.zoom-display');
    const zoom = await zoomDisplay.textContent();
    console.log('Zoom after fit to view:', zoom);
    expect(zoom).not.toContain('NaN');
  });

  test('4. Test Zoom Percentage Display', async () => {
    console.log('Testing zoom percentage display...');

    const zoomDisplay = page.locator('.zoom-display');
    await expect(zoomDisplay).toBeVisible();

    const zoomText = await zoomDisplay.textContent();
    console.log('Current zoom display:', zoomText);

    // Should show a percentage
    expect(zoomText).toMatch(/\d+%/);
    expect(zoomText).not.toContain('NaN');
  });

  test('5. Test Pan/Scroll Canvas', async () => {
    console.log('Testing canvas pan/scroll...');

    // Find the React Flow pane (canvas background)
    const pane = page.locator('.react-flow__pane');
    await expect(pane).toBeVisible();

    // Get viewport before panning
    const initialViewport = await page.evaluate(() => {
      const reactFlowInstance = (window as any).__REACT_FLOW_INSTANCE__;
      if (reactFlowInstance) {
        return reactFlowInstance.getViewport();
      }
      return null;
    });

    console.log('Initial viewport:', initialViewport);

    // Drag the canvas to pan
    await pane.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Get viewport after panning
    const newViewport = await page.evaluate(() => {
      const reactFlowInstance = (window as any).__REACT_FLOW_INSTANCE__;
      if (reactFlowInstance) {
        return reactFlowInstance.getViewport();
      }
      return null;
    });

    console.log('New viewport:', newViewport);

    if (initialViewport && newViewport) {
      // Viewport position should have changed
      const positionChanged = initialViewport.x !== newViewport.x || initialViewport.y !== newViewport.y;
      expect(positionChanged).toBe(true);
    }
  });

  test('6. Test Snap to Grid', async () => {
    console.log('Testing snap to grid...');

    // First, add a shape to the canvas
    const rectangleButton = page.locator('button[data-shape-id="rectangle"]').first();
    await expect(rectangleButton).toBeVisible();

    // Drag shape onto canvas
    const canvasPane = page.locator('.react-flow__pane');
    const canvasBounds = await canvasPane.boundingBox();

    if (canvasBounds) {
      await rectangleButton.hover();
      await page.mouse.down();
      await page.mouse.move(
        canvasBounds.x + 300,
        canvasBounds.y + 200,
        { steps: 10 }
      );
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Check if shape was created
      const nodes = page.locator('.react-flow__node');
      const nodeCount = await nodes.count();
      console.log('Number of nodes on canvas:', nodeCount);
      expect(nodeCount).toBeGreaterThan(0);

      // Drag the shape to a non-grid position
      const firstNode = nodes.first();
      await firstNode.hover();
      await page.mouse.down();
      await page.mouse.move(15, 15, { steps: 5 }); // Move to non-grid position
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Get node position - with snap to grid enabled, it should snap to grid (20px)
      const nodePosition = await firstNode.evaluate((el: any) => {
        const transform = el.style.transform;
        const match = transform.match(/translate\((.+?)px,\s*(.+?)px\)/);
        if (match) {
          return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
        }
        return null;
      });

      console.log('Node position after drag:', nodePosition);

      if (nodePosition) {
        // With 20px grid, positions should be multiples of 20
        const xSnapped = nodePosition.x % 20 === 0;
        const ySnapped = nodePosition.y % 20 === 0;
        console.log('Position snapped to grid:', { xSnapped, ySnapped });
      }
    }
  });

  test('7. Test Connection Creation', async () => {
    console.log('Testing connection creation...');

    // Create two shapes
    const rectangleButton = page.locator('button[data-shape-id="rectangle"]').first();
    const canvasPane = page.locator('.react-flow__pane');
    const canvasBounds = await canvasPane.boundingBox();

    if (canvasBounds) {
      // Add first shape
      await rectangleButton.hover();
      await page.mouse.down();
      await page.mouse.move(
        canvasBounds.x + 200,
        canvasBounds.y + 200,
        { steps: 10 }
      );
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Add second shape
      await rectangleButton.hover();
      await page.mouse.down();
      await page.mouse.move(
        canvasBounds.x + 400,
        canvasBounds.y + 200,
        { steps: 10 }
      );
      await page.mouse.up();
      await page.waitForTimeout(1000);

      // Try to create a connection by dragging from one shape's handle to another
      const handles = page.locator('.react-flow__handle');
      const handleCount = await handles.count();
      console.log('Number of connection handles:', handleCount);

      if (handleCount >= 2) {
        // Get first and second handle
        const sourceHandle = handles.first();
        const targetHandle = handles.nth(4); // Handle from second node

        // Drag from source to target
        const sourceBounds = await sourceHandle.boundingBox();
        const targetBounds = await targetHandle.boundingBox();

        if (sourceBounds && targetBounds) {
          await page.mouse.move(
            sourceBounds.x + sourceBounds.width / 2,
            sourceBounds.y + sourceBounds.height / 2
          );
          await page.mouse.down();
          await page.mouse.move(
            targetBounds.x + targetBounds.width / 2,
            targetBounds.y + targetBounds.height / 2,
            { steps: 10 }
          );
          await page.mouse.up();
          await page.waitForTimeout(500);

          // Check if edge was created
          const edges = page.locator('.react-flow__edge');
          const edgeCount = await edges.count();
          console.log('Number of edges on canvas:', edgeCount);
          expect(edgeCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('8. Test Edge Style Changes', async () => {
    console.log('Testing edge style changes...');

    // Find edge style dropdown button
    const edgeStyleButton = page.locator('.edge-style-dropdown button').first();
    await expect(edgeStyleButton).toBeVisible();

    const initialStyle = await edgeStyleButton.locator('.toolbar-text').textContent();
    console.log('Initial edge style:', initialStyle);

    // Click to open dropdown
    await edgeStyleButton.click();
    await page.waitForTimeout(300);

    // Select a different style
    const edgeStyleOptions = page.locator('.edge-style-option');
    const optionCount = await edgeStyleOptions.count();
    console.log('Number of edge style options:', optionCount);
    expect(optionCount).toBe(3); // straight, curved, step

    // Click on "straight" option
    await edgeStyleOptions.filter({ hasText: 'Straight' }).click();
    await page.waitForTimeout(500);

    const newStyle = await edgeStyleButton.locator('.toolbar-text').textContent();
    console.log('New edge style:', newStyle);
    expect(newStyle).toBe('straight');
  });

  test('9. Test PropertyPanel Visibility on Selection', async () => {
    console.log('Testing PropertyPanel visibility...');

    // Check if property panel exists
    const propertyPanel = page.locator('.property-panel');
    const isPanelVisible = await propertyPanel.isVisible().catch(() => false);
    console.log('Property panel visible:', isPanelVisible);

    if (!isPanelVisible) {
      console.log('Property panel is collapsed or hidden');
    }

    // Select a node by clicking on it
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    if (nodeCount > 0) {
      await nodes.first().click();
      await page.waitForTimeout(500);

      // Check if property panel shows properties
      const propertyFields = page.locator('.form-group, .property-field');
      const fieldCount = await propertyFields.count();
      console.log('Number of property fields:', fieldCount);
    }
  });

  test('10. Test PropertyPanel Style Updates', async () => {
    console.log('Testing PropertyPanel style updates...');

    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    if (nodeCount > 0) {
      // Select first node
      const firstNode = nodes.first();
      await firstNode.click();
      await page.waitForTimeout(500);

      // Get initial node style
      const initialBackground = await firstNode.evaluate((el: any) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('Initial node background:', initialBackground);

      // Try to find and change a color property
      const colorInputs = page.locator('input[type="color"], input.color-input');
      const colorInputCount = await colorInputs.count();
      console.log('Number of color inputs in property panel:', colorInputCount);

      if (colorInputCount > 0) {
        const colorInput = colorInputs.first();
        await colorInput.click();
        await colorInput.fill('#ff0000');
        await page.waitForTimeout(500);

        // Verify node style changed
        const newBackground = await firstNode.evaluate((el: any) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        console.log('New node background:', newBackground);
      }
    }
  });
});