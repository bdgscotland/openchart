# OpenChart Save/Load Functionality Test Suite

This directory contains comprehensive testing tools for verifying the save/load functionality of OpenChart, with special focus on PropertyPanel integration, shape styles, connections, and data persistence.

## Test Files

### 1. Interactive Test Suite (`save-load-functionality-test.html`)

A comprehensive web-based test interface that guides you through testing all aspects of the save/load functionality.

**Features:**
- 📝 Shape creation and styling tests
- 🔗 Connection creation and persistence tests
- 💾 Save operation validation
- 📂 Load operation verification
- 🔍 Schema and compatibility validation
- 📊 Real-time test results and progress tracking

**Usage:**
1. Open the file in your web browser
2. Ensure OpenChart is running at `http://localhost:5173`
3. Follow the test steps in sequence
4. Monitor results and validation outputs

### 2. Comprehensive Test Data (`test-diagram-comprehensive.json`)

A pre-built test diagram containing:
- **5 shapes** with various types (rectangle, circle, diamond, ellipse, hexagon)
- **Complex styling** including fonts, colors, opacity, decorations
- **5 connections** with different handle types and styles
- **Timestamp data** for tracking updates
- **Metadata** for versioning and compatibility

**Shape Properties Tested:**
- Fill colors and gradients
- Stroke colors and widths
- Opacity levels
- Font families, sizes, weights, styles
- Text alignment and decorations
- Corner radius values
- Text transformations
- Line spacing and letter spacing

**Connection Properties Tested:**
- All handle types (top, right, bottom, left)
- Source and target handle naming
- Different connection styles (smoothstep, straight, step, bezier)
- Animated and static connections
- Various arrow markers
- Connection labels

### 3. Automated Test Runner (`save-load-test-runner.js`)

A JavaScript test suite that can be run in the browser console for automated validation.

**Features:**
- ✅ **Node Structure Validation**: Checks all required fields and data types
- 🔗 **Edge Structure Validation**: Verifies connection handle naming and structure
- 💾 **Save Operation Testing**: Simulates and validates JSON serialization
- 📂 **Load Operation Testing**: Tests data integrity after load/parse cycles
- 🎨 **PropertyPanel Integration**: Validates style property mapping
- 🔌 **Connection Handle Compatibility**: Tests handle naming conventions
- 📋 **Schema Version Compatibility**: Ensures backward/forward compatibility

**Usage:**
1. Open OpenChart in your browser
2. Open browser console (F12)
3. Copy and paste the test script
4. Run: `await runSaveLoadTests()`
5. Review detailed test results

## Test Scenarios Covered

### 1. Shape Style Persistence
- [x] Fill colors (hex, rgb, rgba)
- [x] Stroke colors and widths
- [x] Opacity levels (0.0 to 1.0)
- [x] Font properties (family, size, weight, style)
- [x] Text alignment (left, center, right)
- [x] Text decorations (none, underline, overline, line-through)
- [x] Text transformations (none, uppercase, lowercase, capitalize)
- [x] Corner radius values
- [x] Line height and letter spacing
- [x] Word spacing

### 2. Shape Data Persistence
- [x] Shape IDs and types
- [x] Position coordinates (x, y)
- [x] Size dimensions (width, height)
- [x] Text content (labels)
- [x] Shape types (rectangle, circle, diamond, ellipse, hexagon)
- [x] Timestamp tracking (lastStyleUpdate, lastTextUpdate)

### 3. Connection Persistence
- [x] Connection IDs and relationships
- [x] Source and target node references
- [x] Handle naming convention (side-source, side-target)
- [x] Connection types (smoothstep, straight, step, bezier)
- [x] Animation settings
- [x] Marker styles and colors
- [x] Connection labels

### 4. Schema Validation
- [x] Required field presence
- [x] Data type validation
- [x] Nested object structure
- [x] Array integrity
- [x] Version compatibility
- [x] Timestamp format validation

### 5. PropertyPanel Integration
- [x] Style property mapping
- [x] Real-time updates
- [x] Multi-select handling
- [x] Style inheritance
- [x] Default value handling

## Expected Schema Structure

```json
{
  "nodes": [
    {
      "id": "string",
      "type": "shape",
      "position": { "x": number, "y": number },
      "data": {
        "label": "string",
        "shape": "rectangle|circle|diamond|ellipse|hexagon",
        "width": number,
        "height": number,
        "style": {
          "fill": "string",
          "stroke": "string",
          "strokeWidth": number,
          "opacity": number,
          "fontSize": number,
          "fontFamily": "string",
          "fontWeight": "string",
          "fontStyle": "string",
          "textAlign": "string",
          "cornerRadius": number,
          "color": "string",
          "textDecoration": "string",
          "textTransform": "string",
          "lineHeight": number,
          "letterSpacing": "string",
          "wordSpacing": "string"
        },
        "lastStyleUpdate": number,
        "lastTextUpdate": number
      }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "sourceHandle": "top-source|right-source|bottom-source|left-source",
      "targetHandle": "top-target|right-target|bottom-target|left-target",
      "type": "smoothstep|straight|step|bezier",
      "animated": boolean,
      "style": { "stroke": "string", "strokeWidth": number },
      "markerEnd": { "type": "string", "width": number, "height": number, "color": "string" }
    }
  ],
  "viewport": { "x": number, "y": number, "zoom": number },
  "version": "string",
  "timestamp": "string"
}
```

## Testing Workflow

### Manual Testing
1. **Setup**: Open both the test suite and OpenChart application
2. **Create**: Add various shapes with different styles
3. **Connect**: Create connections between shapes
4. **Style**: Use PropertyPanel to modify properties
5. **Save**: Export diagram to JSON file
6. **Validate**: Check JSON structure in test suite
7. **Load**: Import the saved file
8. **Verify**: Confirm all properties are preserved

### Automated Testing
1. **Run Script**: Execute the test runner in browser console
2. **Review Results**: Check pass/fail status for each test
3. **Debug Issues**: Use detailed error messages to identify problems
4. **Export Data**: Generate test files for manual verification

## Common Issues to Watch For

### Save Operation Issues
- ❌ Missing required fields in node data
- ❌ Incorrect data types (string vs number)
- ❌ Missing style properties
- ❌ Invalid timestamp values
- ❌ Circular references in data structure

### Load Operation Issues
- ❌ Callback functions not restored (onTextChange)
- ❌ React Flow internal state not updated
- ❌ Style changes not reflected visually
- ❌ Connection handles not properly connected
- ❌ Viewport position not restored

### PropertyPanel Integration Issues
- ❌ Style updates not triggering re-renders
- ❌ Multi-select not working correctly
- ❌ Default values not properly handled
- ❌ Style inheritance problems
- ❌ Timestamp updates not working

## Browser Console Testing

To run quick tests in the browser console:

```javascript
// Load the test runner
// (Copy and paste save-load-test-runner.js)

// Run all tests
await runSaveLoadTests()

// Export test data
window.saveLoadTestRunner.exportTestData()

// Check specific data
console.log(window.saveLoadTestRunner.testData)
```

## Debugging Tips

1. **Enable Verbose Logging**: Check browser console for detailed logs
2. **Inspect Network**: Monitor file operations in Network tab
3. **Check React DevTools**: Verify component state updates
4. **Validate JSON**: Use online JSON validators for saved files
5. **Compare Schemas**: Diff saved vs expected structure

## Success Criteria

✅ **All shapes preserve visual appearance after save/load**
✅ **All connections maintain proper relationships**
✅ **PropertyPanel shows correct values for loaded shapes**
✅ **No console errors during save/load operations**
✅ **Timestamps are preserved and valid**
✅ **Connection handles use correct naming convention**
✅ **Schema validation passes all checks**
✅ **Multi-select and editing work on loaded diagrams**

This comprehensive test suite ensures that the OpenChart save/load functionality works reliably across all supported features and maintains data integrity throughout the entire workflow.