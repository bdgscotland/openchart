# Examples Factory Pattern (January 2025)

## Implementation Status: ✅ COMPLETE

A centralized examples management system with mode-aware UI and factory pattern for easy maintenance and extensibility.

## Architecture Overview

### Factory Pattern
**Location:** `src/core/schema/examples/index.ts`

**Purpose:** Centralized example management with dynamic imports for lazy loading.

**Key Features:**
- Single source of truth for all examples
- Dynamic import pattern for on-demand loading
- Type-safe example retrieval
- Graceful error handling for missing examples
- Easy to add new examples (just add file + switch case)

### Individual Example Files

Each example is in its own file for maintainability:

**Event Storm Examples:**
- `eventStormEcommerce.ts` - E-Commerce Order Flow (9 nodes, 5 edges)
- `eventStormRegistration.ts` - User Registration (7 nodes, 4 edges)

**Diagram Mode Examples (Placeholders):**
- `flowchart.ts` - Basic flowchart (needs implementation)
- `orgchart.ts` - Organization chart (needs implementation)
- `network.ts` - Network diagram (needs implementation)

## Factory Implementation

### Core Function: getExampleByName()

```typescript
// src/core/schema/examples/index.ts
export function getExampleByName(exampleName: string) {
  switch (exampleName) {
    // Event Storm examples
    case 'event-storm-ecommerce':
      return createEventStormEcommerceExample();
    case 'event-storm-registration':
      return createEventStormRegistrationExample();
    case 'event-storm-payment':
    case 'event-storm-shipping':
    case 'event-storm-inventory':
      // Fallback to ecommerce for now
      return createEventStormEcommerceExample();
    
    // Diagram mode examples
    case 'flowchart':
    case 'orgchart':
    case 'process':
    case 'mindmap':
    case 'network':
      console.warn(`Example "${exampleName}" not yet implemented`);
      return null;
    
    default:
      console.warn(`Unknown example: "${exampleName}"`);
      return null;
  }
}
```

**Benefits:**
- Single place to add new examples
- Clear mapping of example names to implementations
- Graceful fallback for missing examples
- Console warnings for debugging

## Example Data Structure

Each example function returns a complete diagram object:

```typescript
export function createEventStormEcommerceExample() {
  return {
    nodes: [...],              // Node array with complete data
    edges: [...],              // Edge array with connections
    viewport: {                // Initial zoom and position
      x: 0,
      y: 0,
      zoom: 0.8
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    layers: [{                 // Layer definitions
      id: 'default',
      name: 'Default Layer',
      visible: true,
      locked: false,
      opacity: 1
    }],
    activeLayerId: 'default',
    diagramSettings: {         // Complete diagram configuration
      mode: 'eventStorm',
      grid: { ... },
      background: { ... },
      viewport: { ... },
      rulers: { ... },
      uiPanels: { ... },
      display: { ... },
      connectionVisualization: { ... },
      paper: { ... },
      view: { ... },
      eventStormSettings: {    // Event Storm specific config
        phase: 'big-picture',
        showTimeline: true,
        autoArrangeEnabled: false,
        timelineOrientation: 'horizontal',
        // ... more settings
      }
    }
  };
}
```

## Mode-Aware Examples Menu

### MenuBar Integration

**Location:** `src/components/MenuBar/MenuBar.tsx` (lines 173-185)

**Implementation:**
```typescript
examples: diagramSettings?.mode === 'eventStorm' ? [
  { label: 'E-Commerce Order Flow', onClick: () => onLoadExample('event-storm-ecommerce') },
  { label: 'User Registration', onClick: () => onLoadExample('event-storm-registration') },
  { label: 'Payment Processing', onClick: () => onLoadExample('event-storm-payment') },
  { label: 'Shipping & Delivery', onClick: () => onLoadExample('event-storm-shipping') },
  { label: 'Inventory Management', onClick: () => onLoadExample('event-storm-inventory') },
] : [
  { label: 'Basic Flowchart', onClick: () => onLoadExample('flowchart') },
  { label: 'Org Chart', onClick: () => onLoadExample('orgchart') },
  { label: 'Process Flow', onClick: () => onLoadExample('process') },
  { label: 'Mind Map', onClick: () => onLoadExample('mindmap') },
  { label: 'Network Diagram', onClick: () => onLoadExample('network') },
]
```

**Behavior:**
- Examples menu changes based on `diagramSettings.mode`
- Event Storm mode: Shows Event Storm-specific examples
- Diagram mode: Shows general diagramming examples
- Dynamic update when switching modes
- Clear, descriptive labels

## FileOperationsContext Integration

### handleLoadExample Function

**Location:** `src/contexts/FileOperationsContext.tsx` (lines 199-235)

**Implementation:**
```typescript
const handleLoadExample = useCallback(async (exampleName: string) => {
  try {
    // Dynamic import of factory
    const { getExampleByName } = await import('../core/schema/examples/index');
    const exampleData = getExampleByName(exampleName);
    
    if (!exampleData) {
      console.warn(`Example "${exampleName}" not found`);
      alert(`Example "${exampleName}" is not available yet.`);
      return;
    }
    
    // Import and apply diagram data
    const imported = await diagramPersistence.importDiagram(exampleData);
    setNodes(imported.nodes);
    setEdges(imported.edges);
    setLayers(imported.layers);
    setActiveLayerId(imported.activeLayerId);
    
    if (imported.diagramSettings) {
      setDiagramSettings(imported.diagramSettings);
    }
    
    if (flowRef.current && imported.viewport) {
      flowRef.current.setViewport(imported.viewport);
    }
  } catch (error) {
    console.error('Error loading example:', error);
    alert('Failed to load example diagram.');
  }
}, [setNodes, setEdges, setLayers, setActiveLayerId, setDiagramSettings, flowRef]);
```

**Features:**
- Dynamic import for lazy loading
- Error handling with user feedback
- Applies all diagram data (nodes, edges, layers, settings, viewport)
- Uses existing importDiagram method for consistency
- Graceful fallback for missing examples

## Event Storm Examples Detail

### E-Commerce Order Flow
**File:** `src/core/schema/examples/eventStormEcommerce.ts`

**Content:**
- **4 Events:** Order Placed, Payment Processed, Order Shipped, Order Delivered
- **3 Actors:** Customer, Payment Gateway, Warehouse Staff
- **2 Commands:** Process Payment, Ship Order
- **5 Edges:** Complete flow from order to delivery
- **Phase:** Big Picture
- **Zoom:** 0.8 (80%)

**Node Types:**
- `type: 'es-event'` - Orange (#FFB84D)
- `type: 'es-actor'` - Light Yellow (#FFE066)
- `type: 'es-command'` - Blue (#6DB3F2)

**Layout:**
- Events arranged chronologically left-to-right (x: 100, 500, 900, 1300)
- Actors in second row (y: 280)
- Commands interspersed in event flow (y: 100)

### User Registration
**File:** `src/core/schema/examples/eventStormRegistration.ts`

**Content:**
- **3 Events:** Registration Started, Email Verified, Account Created
- **1 Actor:** New User
- **2 Commands:** Verify Email, Create Account
- **1 Question:** "What if email verification fails?"
- **4 Edges:** Registration flow with concern
- **Phase:** Big Picture
- **Zoom:** 0.9 (90%)

**Node Types:**
- `type: 'es-event'` - Orange (#FFB84D)
- `type: 'es-actor'` - Light Yellow (#FFE066)
- `type: 'es-command'` - Blue (#6DB3F2)
- `type: 'es-question'` - Purple (#CC99FF)

**Layout:**
- Events chronologically arranged (x: 100, 500, 900)
- Actor at start (y: 280)
- Commands interspersed (y: 100)
- Question below verification step (x: 500, y: 280)

## Complete DiagramSettings Schema

Both examples include full `diagramSettings` matching the DEFAULT_DIAGRAM_SETTINGS structure:

```typescript
diagramSettings: {
  mode: 'eventStorm',
  grid: {
    enabled: true,
    size: 20,
    style: 'dots',
    color: '#e0e0e0',
    opacity: 0.5,
    snapToGrid: true,
    snapDistance: 10
  },
  background: {
    color: '#ffffff',
    opacity: 1.0,
    repeat: 'no-repeat',
    size: 'auto'
  },
  viewport: {
    zoom: 0.8,  // or 0.9 for registration
    minZoom: 0.1,
    maxZoom: 5.0,
    panEnabled: true,
    zoomEnabled: true,
    infiniteCanvas: true
  },
  rulers: {
    enabled: false,
    units: 'px',
    showGuides: true,
    guidesColor: '#4a90e2'
  },
  uiPanels: {
    formatPanel: true,
    outlinePanel: false,
    layersPanel: false,
    shapesPanel: true,
    searchShapes: false,
    scratchpad: false,
    tags: false
  },
  display: {
    tooltips: true,
    animations: true,
    guides: true,
    pageTabs: false,
    pageView: true
  },
  connectionVisualization: {
    connectionArrows: true,
    connectionPoints: false
  },
  paper: {
    size: 'Custom',
    orientation: 'landscape',
    width: 1920,
    height: 1080,
    margins: { top: 50, right: 50, bottom: 50, left: 50 }
  },
  view: {
    fullscreen: false,
    units: 'px',
    scale: 100
  },
  eventStormSettings: {
    phase: 'big-picture',
    showTimeline: true,
    autoArrangeEnabled: false,
    timelineOrientation: 'horizontal',
    showTimestamps: false,
    showAggregateNames: true,
    groupByAggregate: false,
    groupByBoundedContext: false,
    validationEnabled: true,
    strictMode: false,
    workshopMode: false,
    participantCursors: false
  }
}
```

## Benefits of Factory Pattern

### Maintainability
- Each example in separate file (easy to find and edit)
- Centralized management (single place to add/remove examples)
- Clear structure (consistent pattern across all examples)

### Performance
- Lazy loading via dynamic imports
- Examples only loaded when requested
- Reduced initial bundle size

### Extensibility
- Easy to add new examples (create file + add case)
- Easy to add new example types (just follow pattern)
- Fallback mechanism for incomplete examples

### Type Safety
- TypeScript types ensure complete data
- Compiler catches missing properties
- IDE autocomplete for example structure

### Developer Experience
- Clear naming convention (mode-action format)
- Descriptive labels in UI
- Console warnings for debugging
- Graceful error handling

## Testing Results

### Playwright Verification
✅ Event Storm mode switch activates
✅ Examples menu shows Event Storm examples
✅ E-Commerce Order Flow loads with 9 nodes, 5 edges
✅ User Registration loads with 7 nodes, 4 edges
✅ All sticky types render with correct colors
✅ Timeline guide and legend appear correctly
✅ Zoom levels apply as configured (80%, 90%)
✅ Mode persistence works (diagrams remember mode)

### Manual Testing
✅ Switch to Event Storm → Examples menu updates
✅ Switch to Diagram mode → Examples menu updates
✅ Load example → All nodes appear correctly
✅ Load example → Connections render properly
✅ Load example → Viewport positions correctly
✅ Missing example → User-friendly alert shown

## Future Enhancements

### More Event Storm Examples
- **Payment Processing:** Credit card flow with gateway interaction
- **Shipping & Delivery:** Warehouse to customer journey
- **Inventory Management:** Stock tracking and reordering
- **Customer Support:** Ticket lifecycle
- **Marketing Campaign:** Lead generation and conversion

### Diagram Mode Examples
- **Basic Flowchart:** Decision tree with swim lanes
- **Org Chart:** Company hierarchy structure
- **Process Flow:** BPMN-style business process
- **Mind Map:** Radial concept organization
- **Network Diagram:** Infrastructure topology

### Enhanced Features
- **Example previews:** Thumbnail images in menu
- **Example categories:** Group by domain/industry
- **Custom examples:** User can save as template
- **Example search:** Filter by keywords
- **Example metadata:** Description, difficulty, tags

## Implementation Checklist

✅ **Factory pattern:** Centralized example management
✅ **Individual files:** Each example in separate file
✅ **Mode-aware menu:** Examples change based on mode
✅ **Complete data:** Full diagramSettings in examples
✅ **Dynamic imports:** Lazy loading for performance
✅ **Error handling:** Graceful fallback for missing examples
✅ **Testing:** Verified with Playwright
✅ **Documentation:** This memory + commit messages

⚠️ **Pending:** Implement diagram mode example data
⚠️ **Pending:** Add more Event Storm examples
⚠️ **Pending:** Add example preview images

## Files Reference

- `src/core/schema/examples/index.ts` - Factory implementation
- `src/core/schema/examples/eventStormEcommerce.ts` - E-Commerce example
- `src/core/schema/examples/eventStormRegistration.ts` - Registration example
- `src/core/schema/examples/flowchart.ts` - Flowchart placeholder
- `src/core/schema/examples/orgchart.ts` - Org chart placeholder
- `src/core/schema/examples/network.ts` - Network placeholder
- `src/components/MenuBar/MenuBar.tsx` (lines 173-185) - Mode-aware menu
- `src/contexts/FileOperationsContext.tsx` (lines 199-235) - Load handler

## Version History

**v1.0 (Commit: 6d0a392):**
- Initial factory pattern implementation
- Mode-aware examples menu
- E-Commerce and Registration examples
- Complete diagramSettings in examples
- Playwright testing verification

**Status:** Production-ready for Event Storm examples, diagram mode examples need implementation