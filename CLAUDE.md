# OpenChart Development Configuration

## 🎯 Project Overview
OpenChart is an open-source, git-backed diagramming platform built with React + TypeScript + Canvas API. This is a Lucidchart alternative focused on transparency, portability, and version control.

## 🛠️ Required Development Tools

### Core Tool Requirements
- **Serena MCP**: ALWAYS use for semantic code retrieval and editing operations
- **Context7 MCP**: ALWAYS use for up-to-date third-party library documentation  
- **Sequential Thinking MCP**: ALWAYS use for any decision-making processes
- **Playwright MCP**: ALWAYS use for frontend testing and browser automation

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Canvas Rendering**: Konva.js or Fabric.js
- **State Management**: Zustand
- **Version Control**: isomorphic-git
- **File Format**: JSON schema for diagrams
- **Testing**: Playwright for E2E, Jest for unit tests

## 📋 Development Workflow

### Code Analysis & Retrieval
```bash
# Use Serena for all code operations
mcp__serena__get_symbols_overview     # Understand file structure
mcp__serena__find_symbol             # Find specific functions/classes  
mcp__serena__find_referencing_symbols # Track dependencies
mcp__serena__search_for_pattern      # Search code patterns
```

### Documentation & Research
```bash  
# Use Context7 for third-party docs
mcp__context7__resolve-library-id    # Find library documentation
mcp__context7__get-library-docs      # Get up-to-date API docs
```

### Decision Making
```bash
# Use Sequential Thinking for complex decisions
mcp__sequential-thinking__sequentialthinking  # Break down complex problems
```

### Frontend Testing
```bash
# Use Playwright for all browser testing
mcp__playwright__browser_navigate    # Navigate to app
mcp__playwright__browser_snapshot    # Capture UI state
mcp__playwright__browser_click       # Interact with elements
mcp__playwright__browser_type        # Input text/data
```

## 🏗️ Project Structure & Conventions

### Directory Structure
```
src/
├── components/
│   ├── Canvas/           # Core canvas rendering
│   ├── Toolbar/          # Shape palette & tools
│   ├── PropertyPanel/    # Shape properties editor
│   └── GitPanel/         # Git operations UI
├── core/
│   ├── schema/           # JSON diagram schema
│   ├── shapes/           # Shape definitions
│   ├── commands/         # Undo/redo system
│   └── git/             # Git integration
├── hooks/               # React hooks
├── utils/               # Helper functions
└── types/               # TypeScript definitions
```

### Code Style Guidelines
- Use TypeScript strict mode
- Functional components with hooks
- Zustand for state management
- JSON schema validation for diagrams
- Command pattern for undo/redo
- Git-first file operations

## 🚀 Development Commands

### Setup & Development
```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Production build
npm run preview         # Preview production build
```

### Testing Commands
```bash
npm run test            # Run unit tests
npm run test:e2e        # Run Playwright E2E tests
npm run test:watch      # Watch mode for tests
```

### Code Quality
```bash
npm run lint            # ESLint
npm run type-check      # TypeScript checking
npm run format          # Prettier formatting
```

## 📐 Core Features Implementation

### Canvas Operations (Priority 1)
- Basic shapes: rectangle, circle, diamond, arrow
- Mouse interactions: drag, resize, select
- Multi-select operations
- Undo/redo command pattern

### File Operations (Priority 2) 
- Save/load JSON diagrams
- Export to PNG, SVG, PDF
- Import from Lucidchart JSON

### Git Integration (Priority 3)
- Diagram versioning with Git
- Visual diff for diagrams  
- Commit/push from UI
- Branch switching support

### Testing Strategy
- **Unit Tests**: Core diagram operations, shape logic
- **Integration Tests**: File I/O, Git operations
- **E2E Tests**: User workflows with Playwright
- **Performance Tests**: Canvas rendering with 500+ shapes

## 🎯 Success Metrics
- Load/save operations < 100ms
- Render 500 shapes at 60fps  
- Git operations < 2 seconds
- Zero data loss on crashes
- 100% export compatibility

## 📚 Key Libraries & Documentation

### Primary Dependencies
- **React**: Component framework
- **TypeScript**: Type safety
- **Konva.js/Fabric.js**: Canvas manipulation
- **Zustand**: Lightweight state management
- **isomorphic-git**: Git operations in browser
- **Vite**: Build tool and dev server

### Testing Dependencies  
- **Playwright**: E2E browser testing
- **Jest**: Unit testing framework
- **@testing-library/react**: React component testing

## ⚙️ Configuration Notes

### Development Environment
- Node.js 18+ required
- Git installed and configured
- Modern browser (Chrome/Firefox/Safari)

### Build Configuration
- Vite for fast HMR and bundling
- TypeScript strict mode enabled
- ESLint + Prettier for code quality
- Path aliases configured for clean imports

## 🔧 Tool Usage Examples

### Analyzing Canvas Component
```bash
# First understand the structure
mcp__serena__get_symbols_overview --relative_path="src/components/Canvas"

# Find specific canvas methods
mcp__serena__find_symbol --name_path="Canvas/handleMouseDown" --include_body=true

# Check for references
mcp__serena__find_referencing_symbols --name_path="Canvas" --relative_path="src/components/Canvas/Canvas.tsx"
```

### Researching Konva.js API
```bash
# Get Konva documentation
mcp__context7__resolve-library-id --libraryName="konva"
mcp__context7__get-library-docs --context7CompatibleLibraryID="/konvajs/konva" --topic="canvas shapes"
```

### Testing Canvas Interactions
```bash
# Navigate to app and test canvas
mcp__playwright__browser_navigate --url="http://localhost:5173"
mcp__playwright__browser_snapshot
mcp__playwright__browser_click --element="canvas" --ref="canvas-element"
mcp__playwright__browser_drag --startElement="shape1" --endElement="position2"
```

---

**Remember**: Always use the specified MCP tools (serena, context7, sequential-thinking, playwright) for their respective domains. This ensures consistent, high-quality development practices for the OpenChart project.