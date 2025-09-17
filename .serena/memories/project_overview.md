# OpenChart Project Overview

## Purpose
OpenChart is an open-source, git-backed diagramming platform designed as an alternative to Lucidchart. The goal is to democratize visual communication through transparency, portability, and version control.

## Core Features
- **Open Schema**: JSON-based, human-readable diagram format
- **Git-First**: Every diagram is a versioned text file (planned)
- **Export Everything**: No vendor lock-in, full data portability
- **Node-Based Architecture**: Using React Flow for proper diagramming

## Current Implementation Status (2025-09-17)

### ✅ Completed Features
1. **Basic Shapes**: Rectangle, Circle, Diamond, Triangle, Pentagon, Hexagon, Star, Ellipse
2. **Node-Edge System**: Proper connections between shapes with React Flow
3. **Connection Points**: 4-way handles on each node (top, right, bottom, left)
4. **Save/Load**: JSON export and import functionality
5. **Export**: PNG, SVG, PDF export (basic implementation)
6. **Professional UI**: Dark theme with glassmorphism effects
7. **Drag & Drop**: From toolbar to canvas
8. **Text Editing**: Double-click nodes to edit inline
9. **Example Templates**: Basic flowchart example

### ⚠️ Known Limitations
- No undo/redo yet (React Flow supports it, needs wiring)
- Resize handles are visual only (not functional)
- Limited edge customization
- No keyboard shortcuts
- No collaborative features
- Save might not always capture current state (needs debugging)

### 🚧 Next Priorities
1. Fix save/load to properly capture live canvas state
2. Implement functional resize handles
3. Add undo/redo functionality
4. Improve edge routing and labels
5. Add more node types and connection styles

## Technology Decisions
- **Migrated from Konva.js to React Flow** (2025-09-17) for proper node-edge support
- React Flow provides built-in diagramming features vs building from scratch
- Professional icon library (Lucide React) instead of emojis
- Focus on core functionality over advanced features

## Development Status
- **Early Prototype**: Functional for basic flowcharts
- **Not Production Ready**: Many features incomplete
- **Active Development**: Regular improvements and bug fixes