# OpenChart Development Configuration

## 🎯 Project Overview
OpenChart is an open-source, git-backed diagramming platform built with React + TypeScript + React Flow. This is a Lucidchart alternative focused on transparency, portability, and version control.

## ⚠️ IMPORTANT: Development Guidelines
- **This is an experimental prototype** - Not ready for production use
- **Be realistic about capabilities** - Many core features are still basic or missing
- **Honest assessment** - This is a learning project, not a commercial competitor
- **Focus on what actually works** - Basic shapes, multi-select, copy/paste, simple connections
- **Acknowledge limitations** - No undo/redo, limited export options, basic edge styling only
- **Avoid overpromising** - Don't claim "professional-grade" or "rivals commercial tools"

## 🛠️ Required Development Tools

### Core Tool Requirements
- **Serena MCP**: ALWAYS use for semantic code retrieval and editing operations
- **Context7 MCP**: ALWAYS use for up-to-date third-party library documentation
- **Sequential Thinking MCP**: ALWAYS use for any decision-making processes
- **Playwright MCP**: ALWAYS use for frontend testing and browser automation
- **openchart-data-persistence Agent**: ALWAYS use when:
  - Adding new features that need to be saved/loaded
  - Modifying node or edge properties
  - Debugging save/load issues
  - Changing the canvas state management
  - Testing diagram persistence
  - Updating React Flow integration
- **openchart-pmo Agent**: ALWAYS use when:
  - Creating or managing GitHub issues
  - Tracking project progress
  - Organizing development tasks
  - Managing bug reports and feature requests
  - Coordinating project boards

### Data Persistence Agent Usage

**MUST use openchart-data-persistence agent for:**
- ANY changes to node/edge structure or properties
- Before merging features that add new visual elements
- When React Flow is updated or reconfigured
- If save/load functionality appears broken
- Adding new shape types or connection types
- Implementing features like layers, groups, or templates

**The agent will:**
- Ensure all new properties are serialized
- Test save/load round-trip integrity
- Update JSON schema documentation
- Verify React Flow state synchronization
- Add migration logic if schema changes

### PMO Agent Usage

**MUST use openchart-pmo agent for:**
- Creating GitHub issues with proper labels and templates
- Organizing issues on project boards
- Tracking development progress
- Managing bug triage and feature requests
- Generating project status reports and metrics

**The agent will:**
- Create well-structured GitHub issues with appropriate labels
- Organize work by priority (P1: Canvas, P2: File Ops, P3: Git)
- Track completion rates and identify development blockers
- Ensure quality gates are met (testing, documentation, performance)
- Coordinate with other specialized agents for comprehensive project management
- Generate actionable project insights and recommendations

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Canvas Rendering**: React Flow (NOT Konva.js anymore)
- **State Management**: React state + React Flow internal state
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

### Project Management & Issues
```bash
# Use GitHub CLI for project management operations
gh issue list                        # List open issues
gh issue create                      # Create new issues
gh issue view                        # View issue details
gh pr list                          # List pull requests
gh pr create                        # Create pull requests
gh project list                     # List GitHub projects
gh project item-add                 # Add items to projects
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

### 🔥 ALWAYS Use start.sh
```bash
./start.sh               # REQUIRED - Only way to start development
```

**⚠️ CRITICAL**: We ALWAYS use `start.sh` for development startup. **NEVER** use `npm run dev` directly.

**🚫 DO NOT USE:**
- `npm run dev`
- `vite`
- Any other direct commands

**✅ ALWAYS USE:**
- `./start.sh` for development
- This is the ONLY approved way to start the dev server

### Why start.sh?
The startup script ensures:
1. ✅ Node.js 18+ version verification
2. 📦 Dependencies are installed/updated automatically
3. 🔍 TypeScript type checking runs first
4. 🧹 ESLint validates code quality
5. 🗑️ Previous build artifacts are cleaned
6. 🚀 Vite dev server starts on http://localhost:5173
7. ⚠️ Graceful handling of warnings (continues with info)

### Manual Commands (For CI/Build Only)
```bash
npm run build           # Production build (CI/deployment)
npm run preview         # Preview production build
npm run lint            # Run ESLint manually
npm run type-check      # Run TypeScript checking manually
```

**Note**: Manual `npm run dev` should NOT be used for regular development. Always use `./start.sh`.

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
- **React Flow**: Node-based diagramming engine
- **Lucide React**: Professional icon library
- **html-to-image**: Export functionality
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

### Researching React Flow API
```bash
# Get React Flow documentation
mcp__context7__resolve-library-id --libraryName="reactflow"
mcp__context7__get-library-docs --context7CompatibleLibraryID="/reactflow/reactflow" --topic="nodes edges"
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