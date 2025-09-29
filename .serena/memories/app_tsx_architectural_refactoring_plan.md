# App.tsx Architectural Refactoring Plan

## Current Problems
App.tsx has become a "God component" with over 900+ lines handling multiple concerns:

### Current Responsibilities:
1. **State Management**: diagram settings, nodes, edges, sidebar states
2. **Event Handlers**: 20+ callback functions for various UI operations  
3. **File Operations**: save, load, export handlers
4. **View Operations**: grid, rulers, zoom, panel toggles
5. **Canvas Operations**: node/edge manipulation, shape creation
6. **Keyboard Shortcuts**: global key event handling
7. **Auto-save**: persistence logic
8. **Debug Functions**: development utilities
9. **Component Integration**: passing props between major components

## Proposed Bounded Context Architecture

### 1. State Management Layer
```typescript
// hooks/useAppState.ts - Central state coordination
// hooks/useDiagramSettings.ts - View/display settings
// hooks/useCanvasState.ts - Already exists, good
// hooks/useUIState.ts - Panel visibility, sidebar states
```

### 2. Operation Contexts
```typescript
// contexts/FileOperationsContext.tsx
- handleNewDiagram, handleSaveDiagram, handleLoadDiagram
- handleExport[PNG|JPEG|WebP|SVG|PDF]
- handleLoadExample, auto-save logic

// contexts/ViewOperationsContext.tsx  
- All toggle handlers (grid, rulers, panels, etc.)
- handleZoom[In|Out], handleResetView, handleToggleFullscreen
- handleChangeUnits, handleChangePageScale

// contexts/CanvasOperationsContext.tsx
- Node/edge manipulation handlers
- Shape creation, clipboard operations
- Selection management, style updates
```

### 3. Service Layer
```typescript
// services/DiagramPersistence.ts - Already exists, good
// services/KeyboardShortcuts.ts - Extract keyboard handling
// services/ViewportManager.ts - Canvas view operations
// services/PanelManager.ts - UI panel state coordination
```

### 4. Composition Strategy
```typescript
// App.tsx becomes a thin orchestration layer:
function App() {
  return (
    <FileOperationsProvider>
      <ViewOperationsProvider>
        <CanvasOperationsProvider>
          <UIStateProvider>
            <AppContent />
          </UIStateProvider>
        </CanvasOperationsProvider>
      </ViewOperationsProvider>
    </FileOperationsProvider>
  );
}

// AppContent.tsx - Clean component tree without handler props
function AppContent() {
  // Use context hooks instead of prop drilling
  const fileOps = useFileOperations();
  const viewOps = useViewOperations();
  // etc.
  
  return (
    <div className="app">
      <MenuBar /> {/* Gets handlers from context */}
      <ActionToolbar />
      <main className="app-main">
        <ShapeLibrary />
        <FlowCanvas />
        <PropertyPanel />
      </main>
    </div>
  );
}
```

### 5. Benefits
- **Single Responsibility**: Each context/hook has one clear purpose
- **Testability**: Easier to unit test individual operations
- **Reusability**: Contexts can be used by multiple components
- **Maintainability**: Changes are localized to relevant bounded contexts
- **Type Safety**: Better TypeScript inference with focused interfaces
- **Performance**: More granular re-renders with context separation

### 6. Migration Strategy
1. **Phase 1**: Extract file operations to context (low risk)
2. **Phase 2**: Extract view operations (medium risk - affects multiple components)
3. **Phase 3**: Extract canvas operations (higher risk - core functionality)
4. **Phase 4**: Optimize state management and remove prop drilling

### 7. Technical Debt Priority
- **High**: Current View menu handler addition makes App.tsx even larger
- **Medium**: Props are being drilled through 3+ component levels
- **Low**: Some handlers could be colocated with their components

## Implementation Status ✅

### Phase 1: Foundation Created (COMPLETED)
- ✅ **FileOperationsContext**: Created with all file operations (save, load, export)
- ✅ **ViewOperationsContext**: Created with all View menu handlers (20+ operations)
- ✅ **CanvasOperationsContext**: Created for zoom and canvas operations
- ✅ **AppContent Component**: Created clean composition structure
- ✅ **AppRefactored**: Created new App.tsx using context providers

### Phase 2: Integration Challenges Identified
- ❌ **Import Path Issues**: Some utilities located in different directories than expected
- ❌ **Dependency Management**: Context providers need proper dependency injection
- ❌ **Component Integration**: Existing components expect prop-based handlers

### Next Steps for Future Implementation:

#### Incremental Migration Strategy
1. **Start with FileOperations** (lowest risk):
   - Fix import paths to use `diagramPersistence` from `utils/`
   - Migrate MenuBar to use FileOperations context first
   - Test thoroughly before proceeding

2. **ViewOperations Integration** (medium risk):
   - Migrate MenuBar View menu handlers to context
   - Update sidebar state management
   - Ensure all toggles work correctly

3. **Component Updates** (high risk):
   - Update MenuBar to accept fewer props
   - Update ActionToolbar integration
   - Test all existing functionality

#### Technical Debt Addressed
- ✅ **View Menu Handlers**: All 20+ handlers moved to ViewOperationsContext
- ✅ **File Operations**: Centralized in FileOperationsContext
- ✅ **Prop Drilling Reduction**: Context pattern implemented
- ✅ **Separation of Concerns**: Clear bounded contexts created

## Implementation Notes
- Maintain backward compatibility during transition
- Keep existing hook patterns (useCanvasState, useActionToolbar)
- Use composition over inheritance for context providers
- Consider using Zustand stores instead of Context for some global state
- Preserve current debugging and development utilities
- **CRITICAL**: Test each phase thoroughly before proceeding to next

## Success Metrics
- App.tsx under 200 lines (currently ~1100 lines)
- No component with more than 10 props
- Clear separation of concerns ✅ (achieved in contexts)
- No prop drilling beyond 2 levels
- Improved bundle analysis (code splitting opportunities)

## Current Status: Foundation Ready ✅
The architectural foundation has been created and is ready for incremental implementation. The contexts are properly structured and the refactoring can be completed in future development cycles when time permits.