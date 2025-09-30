#!/usr/bin/env node

/**
 * OpenChart Editing Operations Test Script
 * Tests: Undo/Redo, Copy/Paste, Duplicate, Delete, Save/Load
 *
 * This script performs manual verification of editing features
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(70) + '\n');
}

function testResult(testName, status, notes = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  const statusSymbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`${statusSymbol} ${testName}: ${status}`, statusColor);
  if (notes) {
    log(`  ${notes}`, 'cyan');
  }
}

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(name, status, notes = '') {
  testResults.tests.push({ name, status, notes });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.warnings++;
}

section('OpenChart Editing Operations Test Suite');

log('This test suite verifies the following features:', 'cyan');
log('1. Undo/Redo functionality', 'cyan');
log('2. Copy/Paste operations (Ctrl+C/Ctrl+V)', 'cyan');
log('3. Duplicate functionality (Ctrl+D)', 'cyan');
log('4. Delete operations (Delete key)', 'cyan');
log('5. Save/Load JSON file operations', 'cyan');

section('Pre-Test Checks');

// Check if dev server is running
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  const serverRunning = await checkServer();

  if (serverRunning) {
    testResult('Dev Server', 'PASS', 'Server is running at http://localhost:5173');
    recordTest('Dev Server Check', 'PASS');
  } else {
    testResult('Dev Server', 'FAIL', 'Server is not running. Please start with ./start.sh');
    recordTest('Dev Server Check', 'FAIL', 'Server not running');
    process.exit(1);
  }

  // Check test results directory
  const testResultsDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
    testResult('Test Results Directory', 'PASS', 'Created directory: test-results/');
  } else {
    testResult('Test Results Directory', 'PASS', 'Directory exists');
  }
  recordTest('Test Results Directory', 'PASS');

  section('Test Instructions');

  log('Please follow these manual test steps:', 'yellow');
  log('\nOpen http://localhost:5173 in your browser and perform each test:', 'cyan');

  section('TEST 1: Undo/Redo Functionality');
  log('Steps:', 'bright');
  log('1. Add a shape to the canvas (drag from left panel or click shape then click canvas)');
  log('2. Press Ctrl+Z (or Cmd+Z on Mac) to undo');
  log('3. Verify the shape disappears');
  log('4. Press Ctrl+Y (or Cmd+Shift+Z) to redo');
  log('5. Verify the shape reappears');
  log('\nExpected: Shape disappears on undo, reappears on redo', 'green');

  recordTest('Undo/Redo - Manual Test', 'PENDING', 'Requires manual verification');

  section('TEST 2: Copy/Paste Operations');
  log('Steps:', 'bright');
  log('1. Add a shape to the canvas');
  log('2. Click on the shape to select it');
  log('3. Press Ctrl+C (or Cmd+C) to copy');
  log('4. Press Ctrl+V (or Cmd+V) to paste');
  log('5. Verify a duplicate appears offset from the original');
  log('\nExpected: Duplicate shape appears, slightly offset', 'green');

  recordTest('Copy/Paste - Manual Test', 'PENDING', 'Requires manual verification');

  section('TEST 3: Duplicate Functionality');
  log('Steps:', 'bright');
  log('1. Add a shape to the canvas');
  log('2. Click on the shape to select it');
  log('3. Press Ctrl+D (or Cmd+D) to duplicate');
  log('4. Verify a duplicate appears immediately');
  log('\nExpected: Duplicate appears instantly, offset from original', 'green');

  recordTest('Duplicate - Manual Test', 'PENDING', 'Requires manual verification');

  section('TEST 4: Delete Operations');
  log('Steps:', 'bright');
  log('1. Add a shape to the canvas');
  log('2. Click on the shape to select it');
  log('3. Press Delete or Backspace key');
  log('4. Verify the shape is removed');
  log('\nExpected: Shape is deleted from canvas', 'green');

  recordTest('Delete - Manual Test', 'PENDING', 'Requires manual verification');

  section('TEST 5: Save/Load Functionality');
  log('Steps:', 'bright');
  log('1. Add 2-3 different shapes to the canvas');
  log('2. Click File menu → Save (or press Ctrl+S)');
  log('3. A JSON file should download');
  log('4. Select all shapes (Ctrl+A) and delete them');
  log('5. Click File menu → Open/Load');
  log('6. Select the saved JSON file');
  log('7. Verify all shapes are restored');
  log('\nExpected: All shapes restored with correct positions and properties', 'green');

  recordTest('Save/Load - Manual Test', 'PENDING', 'Requires manual verification');

  section('Code Analysis Results');

  // Check if the required code is present
  const checkFiles = [
    {
      path: '/Users/duncan.bowring/Developer/openchart/src/components/ActionToolbar/ActionToolbar.tsx',
      features: ['Undo/Redo keyboard shortcuts', 'Delete keyboard shortcut']
    },
    {
      path: '/Users/duncan.bowring/Developer/openchart/src/components/App/AppContent.tsx',
      features: ['Copy/Paste keyboard shortcuts', 'Duplicate keyboard shortcut']
    },
    {
      path: '/Users/duncan.bowring/Developer/openchart/src/hooks/useClipboard.ts',
      features: ['Copy/Paste implementation', 'Duplicate implementation']
    },
    {
      path: '/Users/duncan.bowring/Developer/openchart/src/core/commands/CommandManager.ts',
      features: ['Undo/Redo command management']
    }
  ];

  log('\nVerifying implementation files:', 'cyan');
  checkFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      testResult(path.basename(file.path), 'PASS', file.features.join(', '));
      recordTest(`Code Check: ${path.basename(file.path)}`, 'PASS');
    } else {
      testResult(path.basename(file.path), 'FAIL', 'File not found');
      recordTest(`Code Check: ${path.basename(file.path)}`, 'FAIL', 'File missing');
    }
  });

  section('Keyboard Shortcut Summary');

  log('Windows/Linux:', 'bright');
  log('  Undo:      Ctrl+Z');
  log('  Redo:      Ctrl+Y or Ctrl+Shift+Z');
  log('  Copy:      Ctrl+C');
  log('  Paste:     Ctrl+V');
  log('  Duplicate: Ctrl+D');
  log('  Delete:    Delete or Backspace');
  log('  Save:      Ctrl+S');
  log('  Select All: Ctrl+A');

  log('\nMac:', 'bright');
  log('  Undo:      Cmd+Z');
  log('  Redo:      Cmd+Shift+Z');
  log('  Copy:      Cmd+C');
  log('  Paste:     Cmd+V');
  log('  Duplicate: Cmd+D');
  log('  Delete:    Delete or Backspace');
  log('  Save:      Cmd+S');
  log('  Select All: Cmd+A');

  section('Test Summary');

  log(`Total Tests: ${testResults.tests.length}`, 'bright');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'reset');
  log(`Pending: ${testResults.warnings}`, 'yellow');

  // Generate HTML report
  generateHtmlReport();

  section('Next Steps');

  log('1. Open http://localhost:5173 in your browser', 'cyan');
  log('2. Perform each manual test listed above', 'cyan');
  log('3. Document any issues found', 'cyan');
  log('4. Review the generated HTML report in test-results/report.html', 'cyan');

  log('\n✨ Test guide complete. Please perform manual verification.', 'green');
}

function generateHtmlReport() {
  const reportPath = path.join(__dirname, '../test-results/test-guide.html');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenChart Editing Operations Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .test-section {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-pass { color: #4CAF50; font-weight: bold; }
    .status-fail { color: #f44336; font-weight: bold; }
    .status-pending { color: #FF9800; font-weight: bold; }
    .steps { background: #f9f9f9; padding: 15px; border-left: 4px solid #2196F3; margin: 10px 0; }
    .expected { background: #e8f5e9; padding: 10px; border-left: 4px solid #4CAF50; margin: 10px 0; }
    .shortcut-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .shortcut-table th, .shortcut-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    .shortcut-table th { background: #4CAF50; color: white; }
    .shortcut-table tr:nth-child(even) { background: #f2f2f2; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    .summary { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>🧪 OpenChart Editing Operations Test Guide</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Test URL:</strong> <a href="http://localhost:5173">http://localhost:5173</a></p>

  <div class="summary">
    <h2>Summary</h2>
    <p>This test guide covers all editing operations in OpenChart:</p>
    <ul>
      <li>✓ Undo/Redo functionality</li>
      <li>✓ Copy/Paste operations</li>
      <li>✓ Duplicate functionality</li>
      <li>✓ Delete operations</li>
      <li>✓ Save/Load JSON file operations</li>
    </ul>
  </div>

  <div class="test-section">
    <h2>TEST 1: Undo/Redo Functionality</h2>
    <div class="steps">
      <h3>Steps:</h3>
      <ol>
        <li>Add a shape to the canvas (drag from left panel or click shape then click canvas)</li>
        <li>Press <code>Ctrl+Z</code> (or <code>Cmd+Z</code> on Mac) to undo</li>
        <li>Verify the shape disappears</li>
        <li>Press <code>Ctrl+Y</code> or <code>Ctrl+Shift+Z</code> (or <code>Cmd+Shift+Z</code> on Mac) to redo</li>
        <li>Verify the shape reappears</li>
      </ol>
    </div>
    <div class="expected">
      <strong>Expected Result:</strong> Shape disappears on undo, reappears on redo
    </div>
    <p><strong>Status:</strong> <span class="status-pending">⬜ PENDING - Requires Manual Verification</span></p>
  </div>

  <div class="test-section">
    <h2>TEST 2: Copy/Paste Operations</h2>
    <div class="steps">
      <h3>Steps:</h3>
      <ol>
        <li>Add a shape to the canvas</li>
        <li>Click on the shape to select it</li>
        <li>Press <code>Ctrl+C</code> (or <code>Cmd+C</code>) to copy</li>
        <li>Press <code>Ctrl+V</code> (or <code>Cmd+V</code>) to paste</li>
        <li>Verify a duplicate appears offset from the original</li>
      </ol>
    </div>
    <div class="expected">
      <strong>Expected Result:</strong> Duplicate shape appears, slightly offset from the original
    </div>
    <p><strong>Status:</strong> <span class="status-pending">⬜ PENDING - Requires Manual Verification</span></p>
  </div>

  <div class="test-section">
    <h2>TEST 3: Duplicate Functionality</h2>
    <div class="steps">
      <h3>Steps:</h3>
      <ol>
        <li>Add a shape to the canvas</li>
        <li>Click on the shape to select it</li>
        <li>Press <code>Ctrl+D</code> (or <code>Cmd+D</code>) to duplicate</li>
        <li>Verify a duplicate appears immediately</li>
      </ol>
    </div>
    <div class="expected">
      <strong>Expected Result:</strong> Duplicate appears instantly, offset from original
    </div>
    <p><strong>Status:</strong> <span class="status-pending">⬜ PENDING - Requires Manual Verification</span></p>
  </div>

  <div class="test-section">
    <h2>TEST 4: Delete Operations</h2>
    <div class="steps">
      <h3>Steps:</h3>
      <ol>
        <li>Add a shape to the canvas</li>
        <li>Click on the shape to select it</li>
        <li>Press <code>Delete</code> or <code>Backspace</code> key</li>
        <li>Verify the shape is removed</li>
      </ol>
    </div>
    <div class="expected">
      <strong>Expected Result:</strong> Shape is deleted from canvas
    </div>
    <p><strong>Status:</strong> <span class="status-pending">⬜ PENDING - Requires Manual Verification</span></p>
  </div>

  <div class="test-section">
    <h2>TEST 5: Save/Load Functionality</h2>
    <div class="steps">
      <h3>Steps:</h3>
      <ol>
        <li>Add 2-3 different shapes to the canvas</li>
        <li>Click File menu → Save (or press <code>Ctrl+S</code>/<code>Cmd+S</code>)</li>
        <li>A JSON file should download</li>
        <li>Select all shapes (<code>Ctrl+A</code>/<code>Cmd+A</code>) and delete them</li>
        <li>Click File menu → Open/Load</li>
        <li>Select the saved JSON file</li>
        <li>Verify all shapes are restored</li>
      </ol>
    </div>
    <div class="expected">
      <strong>Expected Result:</strong> All shapes restored with correct positions and properties
    </div>
    <p><strong>Status:</strong> <span class="status-pending">⬜ PENDING - Requires Manual Verification</span></p>
  </div>

  <div class="test-section">
    <h2>Keyboard Shortcuts Reference</h2>
    <table class="shortcut-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>Windows/Linux</th>
          <th>Mac</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Undo</td>
          <td><code>Ctrl+Z</code></td>
          <td><code>Cmd+Z</code></td>
        </tr>
        <tr>
          <td>Redo</td>
          <td><code>Ctrl+Y</code> or <code>Ctrl+Shift+Z</code></td>
          <td><code>Cmd+Shift+Z</code></td>
        </tr>
        <tr>
          <td>Copy</td>
          <td><code>Ctrl+C</code></td>
          <td><code>Cmd+C</code></td>
        </tr>
        <tr>
          <td>Paste</td>
          <td><code>Ctrl+V</code></td>
          <td><code>Cmd+V</code></td>
        </tr>
        <tr>
          <td>Duplicate</td>
          <td><code>Ctrl+D</code></td>
          <td><code>Cmd+D</code></td>
        </tr>
        <tr>
          <td>Delete</td>
          <td><code>Delete</code> or <code>Backspace</code></td>
          <td><code>Delete</code> or <code>Backspace</code></td>
        </tr>
        <tr>
          <td>Save</td>
          <td><code>Ctrl+S</code></td>
          <td><code>Cmd+S</code></td>
        </tr>
        <tr>
          <td>Select All</td>
          <td><code>Ctrl+A</code></td>
          <td><code>Cmd+A</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="summary">
    <h2>Test Checklist</h2>
    <p>Mark each test as you complete it:</p>
    <ul>
      <li>⬜ TEST 1: Undo/Redo</li>
      <li>⬜ TEST 2: Copy/Paste</li>
      <li>⬜ TEST 3: Duplicate</li>
      <li>⬜ TEST 4: Delete</li>
      <li>⬜ TEST 5: Save/Load</li>
    </ul>
  </div>

  <p style="text-align: center; color: #666; margin-top: 40px;">
    Generated by OpenChart Test Suite • ${new Date().toLocaleDateString()}
  </p>
</body>
</html>
`;

  fs.writeFileSync(reportPath, html);
  log(`\n📄 HTML test guide generated: ${reportPath}`, 'green');
  recordTest('HTML Report Generation', 'PASS');
}

// Run the tests
runTests().catch(err => {
  log(`\nError running tests: ${err.message}`, 'red');
  process.exit(1);
});