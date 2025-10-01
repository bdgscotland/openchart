import { test, expect } from '@playwright/test';

test('Grid styling with buttons works', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Open Diagram tab in property panel
  await page.click('button:has-text("Diagram")');
  await page.waitForTimeout(500);

  // Take initial screenshot
  await page.screenshot({ path: 'test-results/grid-final-1-initial-dots.png' });

  // Change grid color to red
  const gridColorInput = await page.locator('input[placeholder="#e0e0e0"]').first();
  await gridColorInput.clear();
  await gridColorInput.fill('#ff0000');
  await gridColorInput.press('Enter');
  await page.waitForTimeout(500);

  // Take screenshot after red color with dots
  await page.screenshot({ path: 'test-results/grid-final-2-red-dots.png' });

  // Click "Lines" button
  await page.click('button:has-text("Lines")');
  await page.waitForTimeout(500);

  // Take screenshot after lines style
  await page.screenshot({ path: 'test-results/grid-final-3-red-lines.png' });

  // Click "Crosshatch" button
  await page.click('button:has-text("Crosshatch")');
  await page.waitForTimeout(500);

  // Take screenshot after crosshatch style
  await page.screenshot({ path: 'test-results/grid-final-4-red-cross.png' });

  // Change grid color to blue
  await gridColorInput.clear();
  await gridColorInput.fill('#0000ff');
  await gridColorInput.press('Enter');
  await page.waitForTimeout(500);

  // Take screenshot after blue color with crosshatch
  await page.screenshot({ path: 'test-results/grid-final-5-blue-cross.png' });

  // Change to green
  await gridColorInput.clear();
  await gridColorInput.fill('#00ff00');
  await gridColorInput.press('Enter');
  await page.waitForTimeout(500);

  // Take screenshot with green crosshatch
  await page.screenshot({ path: 'test-results/grid-final-6-green-cross.png' });

  // Back to Lines style
  await page.click('button:has-text("Lines")');
  await page.waitForTimeout(500);

  // Take screenshot with green lines
  await page.screenshot({ path: 'test-results/grid-final-7-green-lines.png' });

  console.log('\n✅ Grid styling test complete!');
  console.log('Check test-results/ for screenshots showing:');
  console.log('  1. Initial state (dots, gray)');
  console.log('  2. Red dots');
  console.log('  3. Red lines');
  console.log('  4. Red crosshatch');
  console.log('  5. Blue crosshatch');
  console.log('  6. Green crosshatch');
  console.log('  7. Green lines');
});
