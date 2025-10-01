import { test, expect } from '@playwright/test';

test('Grid styling changes work', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Open Diagram tab in property panel
  await page.click('button:has-text("Diagram")');
  await page.waitForTimeout(500);

  // Take initial screenshot
  await page.screenshot({ path: 'test-results/grid-1-initial-dots.png' });

  // Get initial grid color
  const initialColor = await page.evaluate(() => {
    const pattern = document.querySelector('.react-flow__background-pattern');
    return pattern ? window.getComputedStyle(pattern).stroke : null;
  });
  console.log('Initial grid color:', initialColor);

  // Change grid color to red
  const gridColorInput = await page.locator('input[placeholder="#e0e0e0"]').first();
  await gridColorInput.clear();
  await gridColorInput.fill('#ff0000');
  await gridColorInput.press('Enter');
  await page.waitForTimeout(500);

  // Take screenshot after red color
  await page.screenshot({ path: 'test-results/grid-2-red-color.png' });

  // Check if grid color changed to red
  const redColor = await page.evaluate(() => {
    const pattern = document.querySelector('.react-flow__background-pattern');
    return pattern ? window.getComputedStyle(pattern).stroke : null;
  });
  console.log('Red grid color:', redColor);

  // Change grid style to lines
  const gridStyleSelect = page.locator('select').filter({ hasText: /Dots|Lines|Cross/ }).first();
  await gridStyleSelect.selectOption('lines');
  await page.waitForTimeout(500);

  // Take screenshot after lines style
  await page.screenshot({ path: 'test-results/grid-3-lines-style.png' });

  // Check if grid style changed to lines
  const linesStyle = await page.evaluate(() => {
    const pattern = document.querySelector('.react-flow__background-pattern');
    return pattern ? pattern.getAttribute('id') : null;
  });
  console.log('Grid style (should contain lines):', linesStyle);

  // Change grid style to cross
  await gridStyleSelect.selectOption('cross');
  await page.waitForTimeout(500);

  // Take screenshot after cross style
  await page.screenshot({ path: 'test-results/grid-4-cross-style.png' });

  // Check if grid style changed to cross
  const crossStyle = await page.evaluate(() => {
    const pattern = document.querySelector('.react-flow__background-pattern');
    return pattern ? pattern.getAttribute('id') : null;
  });
  console.log('Grid style (should contain cross):', crossStyle);

  // Change grid color to blue
  await gridColorInput.clear();
  await gridColorInput.fill('#0000ff');
  await gridColorInput.press('Enter');
  await page.waitForTimeout(500);

  // Take screenshot after blue color with cross
  await page.screenshot({ path: 'test-results/grid-5-blue-cross.png' });

  // Check if grid color changed to blue
  const blueColor = await page.evaluate(() => {
    const pattern = document.querySelector('.react-flow__background-pattern');
    return pattern ? window.getComputedStyle(pattern).stroke : null;
  });
  console.log('Blue grid color:', blueColor);

  console.log('\n✅ Grid styling test complete!');
  console.log('Check test-results/ for screenshots showing:');
  console.log('  1. Initial state (dots, gray)');
  console.log('  2. Red color (dots, red)');
  console.log('  3. Lines style (lines, red)');
  console.log('  4. Cross style (cross, red)');
  console.log('  5. Blue color (cross, blue)');
});
