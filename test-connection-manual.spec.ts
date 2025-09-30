import { test, expect } from '@playwright/test';

test('Manual Connection Creation Test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.react-flow', { timeout: 10000 });

  console.log('✅ Page loaded successfully');

  // Create two shapes manually by clicking on the rectangle button and then clicking on canvas
  const rectangleButton = page.locator('button[data-shape-id="rectangle"]').first();
  await rectangleButton.waitFor({ state: 'visible' });

  console.log('✅ Rectangle button found');

  // Get the canvas pane
  const canvasPane = page.locator('.react-flow__pane');
  await canvasPane.waitFor({ state: 'visible' });

  console.log('✅ Canvas pane found');

  // Drag first shape onto canvas
  await rectangleButton.dragTo(canvasPane, {
    targetPosition: { x: 200, y: 200 }
  });

  await page.waitForTimeout(1000);

  console.log('✅ First shape dragged');

  // Drag second shape onto canvas
  await rectangleButton.dragTo(canvasPane, {
    targetPosition: { x: 400, y: 200 }
  });

  await page.waitForTimeout(1000);

  console.log('✅ Second shape dragged');

  // Count nodes
  const nodes = page.locator('.react-flow__node');
  const nodeCount = await nodes.count();
  console.log(`📊 Number of nodes: ${nodeCount}`);

  if (nodeCount >= 2) {
    // Get the handles
    const handles = page.locator('.react-flow__handle');
    const handleCount = await handles.count();
    console.log(`📊 Number of handles: ${handleCount}`);

    // Try to connect using React Flow's connection mechanism
    // Get source handle (right handle of first node)
    const sourceHandle = handles.filter({ has: page.locator('.react-flow__node').first() }).last();

    // Get target handle (left handle of second node)
    const targetHandle = handles.filter({ has: page.locator('.react-flow__node').nth(1) }).first();

    console.log('🔍 Attempting to connect handles...');

    // Hover over source handle to make it visible
    await sourceHandle.hover();
    await page.waitForTimeout(500);

    // Drag from source to target
    await sourceHandle.dragTo(targetHandle, {
      force: true,
      steps: 20
    });

    await page.waitForTimeout(1000);

    // Check if edge was created
    const edges = page.locator('.react-flow__edge');
    const edgeCount = await edges.count();
    console.log(`📊 Number of edges: ${edgeCount}`);

    // Check browser console for any errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Take a screenshot for debugging
    await page.screenshot({ path: 'connection-test.png' });
    console.log('📸 Screenshot saved as connection-test.png');

    // Log browser console messages
    console.log('🖥️  Browser console messages:', consoleLogs.join('\n'));

    expect(edgeCount).toBeGreaterThan(0);
  } else {
    throw new Error(`Expected at least 2 nodes, but got ${nodeCount}`);
  }
});