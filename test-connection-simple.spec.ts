import { test, expect } from '@playwright/test';

test('Simple Connection Test', async ({ page }) => {
  // Listen to console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log(`🖥️  ${text}`);
  });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.react-flow', { timeout: 10000 });

  console.log('✅ Page loaded');

  // Create two shapes by dragging from toolbar
  const rectangleButton = page.locator('button[data-shape-id="rectangle"]').first();
  await rectangleButton.waitFor({ state: 'visible' });

  const canvasPane = page.locator('.react-flow__pane');
  const canvasBounds = await canvasPane.boundingBox();

  if (!canvasBounds) {
    throw new Error('Canvas bounds not found');
  }

  // Drag first shape
  await rectangleButton.hover();
  await page.mouse.down();
  await page.mouse.move(canvasBounds.x + 200, canvasBounds.y + 200, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1000);

  console.log('✅ First shape created');

  // Drag second shape
  await rectangleButton.hover();
  await page.mouse.down();
  await page.mouse.move(canvasBounds.x + 400, canvasBounds.y + 200, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1000);

  console.log('✅ Second shape created');

  // Check nodes
  const nodes = page.locator('.react-flow__node');
  const nodeCount = await nodes.count();
  console.log(`📊 Nodes: ${nodeCount}`);

  // Get all handles
  const allHandles = page.locator('.react-flow__handle');
  const handleCount = await allHandles.count();
  console.log(`📊 Handles: ${handleCount}`);

  if (handleCount >= 8) {
    // Try connecting by getting specific handles by index
    // Handles 0-3 belong to first node, 4-7 to second node
    // We want to connect from right handle of first node (index 1 - right position)
    // to left handle of second node (index 4 - top/left position)

    // First, hover over the first node to make handles visible
    await nodes.first().hover();
    await page.waitForTimeout(500);

    // Get right handle of first node (Position.Right)
    const sourceHandle = allHandles.nth(1);
    const sourceBounds = await sourceHandle.boundingBox();

    // Hover over second node to make its handles visible
    await nodes.nth(1).hover();
    await page.waitForTimeout(500);

    // Get left handle of second node
    const targetHandle = allHandles.nth(6); // Adjust index based on handle layout
    const targetBounds = await targetHandle.boundingBox();

    if (sourceBounds && targetBounds) {
      console.log('🔗 Starting connection drag...');

      // Drag from source to target handle
      await page.mouse.move(
        sourceBounds.x + sourceBounds.width / 2,
        sourceBounds.y + sourceBounds.height / 2
      );
      await page.waitForTimeout(200);
      await page.mouse.down();
      await page.waitForTimeout(200);

      await page.mouse.move(
        targetBounds.x + targetBounds.width / 2,
        targetBounds.y + targetBounds.height / 2,
        { steps: 15 }
      );
      await page.waitForTimeout(200);
      await page.mouse.up();
      await page.waitForTimeout(1000);

      console.log('✅ Connection drag completed');

      // Check for edges
      const edges = page.locator('.react-flow__edge');
      const edgeCount = await edges.count();
      console.log(`📊 Edges: ${edgeCount}`);

      // Take screenshot
      await page.screenshot({ path: 'connection-result.png', fullPage: true });
      console.log('📸 Screenshot saved');

      // Print relevant console messages
      const connectionMessages = consoleMessages.filter(msg =>
        msg.includes('connect') || msg.includes('edge') || msg.includes('🔗')
      );
      console.log('📝 Connection-related messages:', connectionMessages);

      // The test passes even if no edge is created - we want to see what's happening
      console.log(`\n${'='.repeat(50)}`);
      console.log(`RESULT: ${edgeCount} edges created`);
      console.log(`${'='.repeat(50)}\n`);
    }
  }
});