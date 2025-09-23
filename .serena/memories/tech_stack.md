# OpenChart Tech Stack - Current Reality

## Core Technologies

### Frontend Framework
- **React 19.1.1**: Component framework (latest version)
- **TypeScript**: Type safety (though many `any` types still used)
- **Vite**: Development server and build tool (works reliably)

### Canvas/Rendering
- **React Flow**: Node-based diagramming engine (migration incomplete)
- **HTML Canvas**: Via React Flow (performance issues)
- **SVG**: For shape definitions (many rendering problems)

### Styling & UI
- **CSS Modules**: Component-scoped styling
- **Lucide React**: Icon library (works well)
- **Custom CSS**: Layout and theme system

### State Management
- **React State**: Basic component state
- **React Flow State**: Canvas state management
- **Mixed Patterns**: Inconsistent state handling across components

## Dependencies

### Production Dependencies
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1", 
  "react-flow-renderer": "^10.x",
  "lucide-react": "^0.544.0",
  "html-to-image": "^1.11.13",
  "jspdf": "^3.0.3",
  "file-saver": "^2.0.5"
}
```

### Development Dependencies
- **Vite**: Fast dev server and bundling
- **TypeScript**: Type checking (many errors ignored)
- **ESLint**: Code quality (many warnings)
- **@types packages**: TypeScript definitions

## Architecture Decisions & Issues

### React Flow vs Konva.js
- **Decision**: Migrated from Konva.js to React Flow
- **Status**: Migration incomplete
- **Issues**: Mixed patterns, performance problems
- **Reality**: Neither fully working

### State Management Choices
- **Avoided**: Redux, Zustand, Context API
- **Current**: Basic React state + React Flow internals
- **Problems**: State synchronization issues, data loss

### Component Structure
- **Goal**: Modular, reusable components
- **Reality**: Mix of good and problematic patterns
- **Issues**: Some components too large, unclear responsibilities

## Build & Development

### Working Tools
- **Vite Dev Server**: Fast HMR, reliable
- **TypeScript Compilation**: Works (with many errors ignored)
- **ESLint**: Runs (many warnings)
- **Build Process**: Generates working builds

### Development Scripts
```bash
./start.sh          # Recommended dev startup
npm run dev          # Direct Vite dev server  
npm run build        # Production build
npm run type-check   # TypeScript checking
npm run lint         # ESLint checking
```

## Known Technical Issues

### Performance Problems
- **Slow rendering**: Canvas performance degrades with multiple shapes
- **Memory leaks**: Possible memory issues with React Flow
- **Re-render cycles**: Inefficient state updates

### Type Safety Issues
- **Many `any` types**: TypeScript benefits not fully realized
- **Missing interfaces**: Incomplete type definitions
- **Runtime errors**: Type system not preventing bugs

### Architecture Debt
- **Mixed patterns**: Old Konva.js code mixed with React Flow
- **Incomplete migration**: Half-finished refactoring
- **Component coupling**: Tight coupling between components
- **State synchronization**: Canvas state not properly managed

## Comparison to Typical React Apps

### What's Standard
- React + TypeScript setup
- Vite build tooling
- Component-based architecture
- Modern development practices

### What's Problematic
- **Canvas integration**: Much more complex than typical React apps
- **State management**: More complex due to canvas requirements
- **Performance requirements**: Real-time interactions need optimization
- **File I/O**: Export/import functionality adds complexity

## Recommendations for Future Development

### Immediate Fixes
1. **Complete React Flow migration**: Remove all Konva.js remnants
2. **Fix TypeScript issues**: Eliminate `any` types
3. **Standardize state management**: Choose one pattern and stick to it
4. **Add proper error boundaries**: Handle canvas errors gracefully

### Long-term Architecture
1. **Consider simpler canvas library**: React Flow might be overkill
2. **Implement proper testing**: Unit and integration tests
3. **Add performance monitoring**: Identify bottlenecks
4. **Refactor component structure**: Clearer separation of concerns

## Reality Check
While the tech stack choices are reasonable for a diagramming tool, the implementation has significant issues. The codebase reflects the challenges of building canvas-based applications in React, with many half-finished solutions and performance problems.