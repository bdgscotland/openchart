# Freehand Drawing - Future Feature Analysis

## Library: perfect-freehand
- **Author**: Steve Ruizok (creator of tldraw)
- **Repository**: https://github.com/steveruizok/perfect-freehand
- **Status**: Production-ready, battle-tested in tldraw

## Technical Assessment

### Compatibility with React Flow: ✅ COMPATIBLE

**Integration Approach:**
1. Add "Freehand Tool" mode to toolbar
2. Capture pointer events on React Flow pane during drawing
3. Use `getStroke(points, options)` to generate stroke geometry
4. Create custom React Flow node type to render SVG path
5. Store points array in node data for JSON serialization

**Data Model:**
```typescript
{
  type: "freehand",
  position: {x, y},
  points: Array<[x, y, pressure?]>,  // Relative to position
  strokeOptions: {
    size: number,
    thinning: number,
    smoothing: number,
    streamline: number
  },
  style: {...}
}
```

### Advantages
- ✅ Pure function library - framework-agnostic, no side effects
- ✅ Lightweight - zero dependencies
- ✅ Performant - O(n) algorithm, optimized for real-time
- ✅ Deterministic - same input always produces same output
- ✅ Production-tested - used by tldraw
- ✅ JSON-serializable data - git-friendly
- ✅ Pressure sensitivity support (real or simulated)

### Use Cases
- Annotations and highlighting on diagrams
- Circling/marking areas of interest
- Quick sketches during brainstorming
- Presentation markup
- Free-form notes alongside structured shapes

### Implementation Challenges
- ⚠️ Mode switching - need UI for draw/select/pan modes
- ⚠️ Event handling - manage React Flow drag/pan conflicts
- ⚠️ Editing limitations - freehand strokes harder to edit than geometric shapes
- ⚠️ Scope considerations - drawing app vs. diagramming tool

### Recommended Approach (When Implemented)

**Phase 1 - MVP:**
- Basic freehand tool in toolbar
- Draw-only mode (disable React Flow interactions during draw)
- Create node with stroke after drawing completes
- Render as static SVG path
- Support delete, but not edit
- Save/load points in JSON

**Phase 2 - Enhancements:**
- Eraser tool
- Stroke editing (reshape points)
- Multiple stroke styles/presets
- Pressure sensitivity for stylus input

**Installation:**
```bash
npm install perfect-freehand
```

**Basic Usage Example:**
```tsx
import { getStroke } from 'perfect-freehand'

// During drawing - collect points
const points = [[x, y, pressure], ...]

// Generate stroke
const stroke = getStroke(points, {
  size: 16,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5
})

// Convert to SVG path
const pathData = getSvgPathFromStroke(stroke)

// Render
<path d={pathData} fill="black" />
```

## Priority Assessment
- **Current Priority**: Deferred (P4 or later)
- **Rationale**: Not essential for structured diagramming tool core features
- **Current Focus**: P1 (Canvas), P2 (File Ops), P3 (Git Integration)

## Decision
**Status**: Saved for future consideration
**Verdict**: Technically feasible and architecturally sound, but not aligned with current roadmap priorities. Revisit after core diagramming features are solid.

## References
- Library documentation via Context7: `/steveruizok/perfect-freehand`
- Production example: tldraw (https://tldraw.com)
- Similar tools with freehand: Excalidraw, Miro, FigJam

---
*Analysis Date: 2025-10-02*
*Decision: Defer to future enhancement*