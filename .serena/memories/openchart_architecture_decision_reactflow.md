# OpenChart Architecture Decision: React Flow

## Decision Date
2025-09-17

## Decision
**Switched from Konva.js to React Flow** for the core diagramming engine.

## Reasons for Change

### Konva.js Limitations
- General-purpose canvas library, not designed for diagramming
- No built-in node/edge relationship model
- No connection points or edge routing
- Would require building entire diagramming infrastructure from scratch
- Missing critical features like automatic edge routing, connection snapping

### React Flow Advantages
- **Purpose-built for node-based diagrams** - exactly what we need
- Built-in node and edge management
- Connection points and automatic edge routing
- Drag-and-drop support out of the box
- Professional controls (zoom, pan, minimap)
- Active development and large community
- React-native (better integration with our stack)
- Built-in undo/redo support
- Export capabilities (SVG, PNG)

## Implementation Details

### Core Components
1. **FlowCanvas.tsx** - Main React Flow canvas wrapper
2. **ShapeNode** - Custom node component for different shapes
3. **Node Types**: rectangle, circle, diamond, etc.
4. **Edge Types**: smoothstep, straight, bezier

### Data Model
```typescript
// React Flow native structure
interface Node {
  id: string;
  position: { x: number; y: number };
  data: { label: string; shape: string; };
  type: 'shape';
  style?: { width: number; height: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: 'smoothstep' | 'straight' | 'bezier';
  label?: string;
}
```

### Features Implemented
- Drag shapes from toolbar to canvas
- Connect nodes with edges
- Inline text editing (double-click)
- Professional styling with dark theme
- MiniMap for navigation
- Controls for zoom/pan
- Save/Load diagram as JSON

### Features Planned
- Undo/Redo with React Flow's built-in support
- Export to PNG/SVG/PDF
- More node types (ellipse, hexagon, etc.)
- Custom edge types with labels
- Alignment guides and snapping
- Grouping and layers

## Migration Impact
- Removed all Konva dependencies
- Deleted CanvasComponent.tsx and related files
- Simplified state management (no custom canvas state)
- Better performance and smoother interactions
- Professional look out of the box

## Conclusion
React Flow is the correct choice for a diagramming application. It provides all the features we need for a Lucidchart-like experience without reinventing the wheel. The migration was necessary and positions OpenChart for success as a professional diagramming tool.