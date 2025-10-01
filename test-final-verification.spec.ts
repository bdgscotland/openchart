import { test } from '@playwright/test';

test('verify background and grid after CSS fix', async ({ page }) => {
  console.log('Opening http://localhost:5174...');
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: 'test-results/final-1-initial.png', fullPage: true });
  
  const initialBg = await page.locator('.react-flow').first().evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      bg: style.backgroundColor,
      inlineStyle: el.getAttribute('style')
    };
  });
  console.log('Initial background:', initialBg);

  // Check grid
  const gridElements = await page.locator('.react-flow__background').count();
  console.log('Grid elements:', gridElements);

  // Open property panel
  const collapsed = await page.locator('.property-panel-collapsed').count();
  if (collapsed > 0) {
    await page.locator('.property-panel-toggle').click();
    await page.waitForTimeout(300);
  }

  // Open Diagram tab
  await page.locator('button:has-text("Diagram")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/final-2-diagram-open.png', fullPage: true });

  // Change background to blue
  const bgInput = page.locator('input.color-input[placeholder="#ffffff"]');
  await bgInput.fill('#0000ff');
  await bgInput.blur();
  await page.waitForTimeout(1000);

  const blueBg = await page.locator('.react-flow').first().evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('After blue change:', blueBg);
  await page.screenshot({ path: 'test-results/final-3-blue-bg.png', fullPage: true });

  // Change to green
  await bgInput.fill('#00ff00');
  await bgInput.blur();
  await page.waitForTimeout(1000);

  const greenBg = await page.locator('.react-flow').first().evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('After green change:', greenBg);
  await page.screenshot({ path: 'test-results/final-4-green-bg.png', fullPage: true });

  // Change to yellow
  await bgInput.fill('#ffff00');
  await bgInput.blur();
  await page.waitForTimeout(1000);

  const yellowBg = await page.locator('.react-flow').first().evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('After yellow change:', yellowBg);
  await page.screenshot({ path: 'test-results/final-5-yellow-bg.png', fullPage: true });

  console.log('\n=== RESULTS ===');
  console.log('Initial:', initialBg.bg, '(expected: rgb(255, 255, 255))');
  console.log('Blue:   ', blueBg, '(expected: rgb(0, 0, 255))');
  console.log('Green:  ', greenBg, '(expected: rgb(0, 255, 0))');
  console.log('Yellow: ', yellowBg, '(expected: rgb(255, 255, 0))');
  console.log('\nGrid visible:', gridElements > 0 ? 'YES' : 'NO');
});
