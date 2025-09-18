# FlowCanvas Refactoring Plan for Better Maintainability

## Current Issues
1. **Monolithic FlowCanvas Component**: 416 lines with complex shape rendering logic inline
2. **Mixed Concerns in App.tsx**: Shape creation logic embedded in main component
3. **Unwieldy Switch Statement**: All shape rendering in single getShapeElement function
4. **Code Duplication**: Repeated styling and positioning patterns
5. **Hard to Extend**: Adding new shapes requires modifying multiple places

## Proposed Modular Architecture

### 1. Shape Component System
- **Individual Shape Components**: `RectangleShape.tsx`, `CircleShape.tsx`, etc.
- **Base Shape Component**: Common functionality (text editing, styling, handles)
- **Shape Registry**: Central registry mapping shape types to components

### 2. Shape Factory Pattern
```typescript
// shapes/ShapeFactory.ts
interface ShapeConfig {
  type: string;
  position: XYPosition;
  label?: string;
  dimensions?: { width: number; height: number };
}

class ShapeFactory {
  static createNode(config: ShapeConfig): Node;
  static getShapeComponent(type: string): React.ComponentType;
}
```

### 3. Custom Hooks for Canvas Logic
```typescript
// hooks/useShapeCreation.ts
function useShapeCreation(selectedTool: DrawingTool) {
  const handleCanvasClick = (event: MouseEvent) => { /* ... */ };
  return { handleCanvasClick };
}

// hooks/useShapeHandlers.ts  
function useShapeHandlers() {
  const handleTextChange = (nodeId: string, text: string) => { /* ... */ };
  const handleShapeResize = (nodeId: string, dimensions: Dimensions) => { /* ... */ };
  return { handleTextChange, handleShapeResize };
}
```

### 4. Directory Structure
```
src/
├── components/
│   ├── Canvas/
│   │   ├── FlowCanvas.tsx (simplified, orchestrates components)
│   │   ├── shapes/
│   │   │   ├── BaseShape.tsx
│   │   │   ├── RectangleShape.tsx
│   │   │   ├── CircleShape.tsx
│   │   │   ├── DiamondShape.tsx
│   │   │   ├── PolygonShape.tsx (pentagon, hexagon, star)
│   │   │   └── index.ts (exports shape registry)
│   │   └── hooks/
│   │       ├── useShapeCreation.ts
│   │       ├── useShapeHandlers.ts
│   │       └── useCanvasActions.ts
├── utils/
│   ├── shapeUtils.ts (common styling, calculations)
│   └── canvasUtils.ts (coordinate conversions, etc.)
```

### 5. Benefits of This Architecture
- **Single Responsibility**: Each component has one clear purpose
- **Easy Extension**: New shapes = new component + registry entry
- **Reusable Logic**: Hooks can be used across components
- **Better Testing**: Smaller, focused components are easier to test
- **Maintainability**: Changes to shape behavior isolated to specific files

### 6. Migration Strategy
1. Create base shape infrastructure (BaseShape, registry)
2. Extract individual shape components
3. Create custom hooks for canvas logic
4. Simplify main FlowCanvas component
5. Move shape creation logic to dedicated hook
6. Add utility functions for common operations

## Expected Outcomes
- FlowCanvas.tsx reduced from 416 lines to ~100 lines
- Each shape component ~30-50 lines
- Easier to add new shapes (just create component + register)
- Better code reuse and testing
- Cleaner separation of concerns