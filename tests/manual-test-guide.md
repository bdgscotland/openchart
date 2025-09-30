# OpenChart Editing Operations - Manual Test Guide

## Test Environment
- URL: http://localhost:5173
- Browser: Any modern browser (Chrome, Firefox, Safari)

## Test 1: Undo/Redo Functionality

### Steps:
1. **Open OpenChart** at http://localhost:5173
2. **Add a shape:**
   - Find the Shape Library panel on the left
   - Click on "Basic Shapes" to expand
   - Drag a Rectangle onto the canvas OR click the Rectangle button and then click on the canvas
3. **Verify shape appears** on the canvas
4. **Test Undo:**
   - Press `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (Mac)
   - OR click the Undo button in the toolbar
5. **Expected Result:** The shape should disappear
6. **Test Redo:**
   - Press `Ctrl+Y` or `Ctrl+Shift+Z` (Windows/Linux) or `Cmd+Shift+Z` (Mac)
   - OR click the Redo button in the toolbar
7. **Expected Result:** The shape should reappear

### Status: [ ] PASS / [ ] FAIL
### Notes:

---

## Test 2: Copy/Paste Operations

### Steps:
1. **Add a shape** to the canvas (any shape)
2. **Select the shape** by clicking on it
3. **Copy the shape:**
   - Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac)
4. **Paste the shape:**
   - Press `Ctrl+V` (Windows/Linux) or `Cmd+V` (Mac)
5. **Expected Result:** A duplicate of the shape should appear, slightly offset from the original

### Status: [ ] PASS / [ ] FAIL
### Notes:

---

## Test 3: Duplicate Functionality

### Steps:
1. **Add a shape** to the canvas
2. **Select the shape** by clicking on it
3. **Duplicate the shape:**
   - Press `Ctrl+D` (Windows/Linux) or `Cmd+D` (Mac)
4. **Expected Result:** A duplicate should appear immediately, offset from the original

### Status: [ ] PASS / [ ] FAIL
### Notes:

---

## Test 4: Delete Operations

### Steps:
1. **Add a shape** to the canvas
2. **Select the shape** by clicking on it
3. **Delete the shape:**
   - Press `Delete` or `Backspace` key
   - OR click the Trash icon in the toolbar
4. **Expected Result:** The shape should be removed from the canvas

### Status: [ ] PASS / [ ] FAIL
### Notes:

---

## Test 5: Save/Load Functionality

### Steps:
1. **Add multiple shapes** to the canvas (at least 2-3 different shapes)
2. **Save the diagram:**
   - Click "File" menu in the menu bar
   - Click "Save" or press `Ctrl+S` / `Cmd+S`
   - A JSON file should download (e.g., `diagram-YYYY-MM-DD.json`)
3. **Clear the canvas:**
   - Select all shapes (`Ctrl+A` / `Cmd+A`)
   - Delete them (`Delete` key)
4. **Load the saved file:**
   - Click "File" menu
   - Click "Open" or "Load"
   - Select the JSON file you downloaded
5. **Expected Result:** All shapes should be restored to their original positions

### Status: [ ] PASS / [ ] FAIL
### Notes:

---

## Test 6: Multiple Operations (Integration Test)

### Steps:
1. **Add 3 different shapes** to the canvas
2. **Select and duplicate one shape** (`Ctrl+D`)
3. **Verify:** 4 shapes total on canvas
4. **Undo the duplicate** (`Ctrl+Z`)
5. **Verify:** 3 shapes remain
6. **Redo the duplicate** (`Ctrl+Y`)
7. **Verify:** 4 shapes again
8. **Select and copy a shape** (`Ctrl+C`)
9. **Paste it** (`Ctrl+V`)
10. **Verify:** 5 shapes total
11. **Delete one shape** (select + `Delete`)
12. **Verify:** 4 shapes remain

### Status: [ ] PASS / [ ] FAIL
### Notes:

---

## Common Issues to Check

- [ ] Keyboard shortcuts work when focus is on canvas
- [ ] Keyboard shortcuts DON'T work when typing in input fields
- [ ] Undo/Redo buttons are enabled/disabled appropriately
- [ ] Pasted/duplicated shapes appear offset (not overlapping)
- [ ] Save file contains valid JSON
- [ ] Load preserves shape properties (size, color, position)
- [ ] Multiple undo/redo operations work correctly
- [ ] Edge connections are preserved during save/load

---

## Test Environment Details
- **Date:** _____________
- **Browser:** _____________
- **OS:** _____________
- **OpenChart Version:** _____________

## Overall Results
- **Tests Passed:** ___ / 6
- **Tests Failed:** ___ / 6
- **Critical Issues:** ___________
- **Minor Issues:** ___________