# OpenChart: Open-Source Lucidchart Alternative

## 🎯 Vision

**OpenChart** - A fully open, git-backed diagramming platform that democratizes visual communication through transparency, portability, and version control.

### Core Differentiators
- **Open Schema**: JSON-based, human-readable diagram format
- **Git-First**: Every diagram is a versioned text file
- **Export Everything**: No vendor lock-in, full data portability
- **Collaborative by Design**: Built for teams using existing Git workflows

## 🏗️ Technical Architecture

### 1. Open Schema Design (JSON-based)
```json
{
  "version": "1.0.0",
  "type": "diagram",
  "metadata": {
    "id": "uuid",
    "created": "ISO-8601",
    "modified": "ISO-8601"
  },
  "canvas": {
    "width": 1920,
    "height": 1080,
    "grid": true
  },
  "elements": [
    {
      "id": "shape-1",
      "type": "rectangle",
      "position": {"x": 100, "y": 100},
      "size": {"width": 200, "height": 100},
      "style": {},
      "text": "Process"
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": "shape-1",
      "to": "shape-2",
      "type": "arrow"
    }
  ]
}
```

### 2. Technology Stack
- **Frontend**: React + TypeScript + Canvas API
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **Rendering**: Konva.js or Fabric.js for canvas manipulation
- **File Format**: JSON with optional YAML support
- **Version Control**: Native Git integration via isomorphic-git
- **Build Tool**: Vite for fast development

## 📋 MVP Features (Phase 1 - 2 weeks)

### Core Canvas Operations
1. **Basic Shapes**: Rectangle, circle, diamond, arrow
2. **Text Editing**: In-shape text with basic formatting
3. **Connections**: Smart connectors between shapes
4. **Selection**: Multi-select, move, resize, delete
5. **Undo/Redo**: Command pattern implementation

### File Operations
1. **Save/Load**: Local JSON files
2. **Export**: PNG, SVG, PDF
3. **Import**: Basic Lucidchart JSON import

## 🚀 Iterative Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup with Vite + React + TypeScript
- [ ] Canvas component with basic shapes
- [ ] JSON schema v1.0
- [ ] Local save/load functionality
- [ ] Basic shape library (5-10 shapes)

### Phase 2: Git Integration (Week 3)
- [ ] Git diff visualization for diagrams
- [ ] Commit/push from UI
- [ ] Branch switching
- [ ] Merge conflict resolution UI

### Phase 3: Enhanced Drawing (Week 4)
- [ ] Shape library expansion (20+ shapes)
- [ ] Smart connectors with routing
- [ ] Layers and grouping
- [ ] Copy/paste with formatting

### Phase 4: Collaboration (Weeks 5-6)
- [ ] Real-time collaboration via CRDTs
- [ ] Comments and annotations
- [ ] Share via URL
- [ ] Team workspaces

### Phase 5: Advanced Features (Weeks 7-8)
- [ ] Templates library
- [ ] Custom shape creation
- [ ] Plugins/extensions API
- [ ] Advanced import (Visio, Draw.io)

## 🔧 Implementation Plan

### Immediate Next Steps
1. **Initialize React + TypeScript project** with Vite
2. **Create canvas component** using Konva.js
3. **Implement shape drawing** with mouse interactions
4. **Design JSON schema** for diagram storage
5. **Build toolbar** with shape palette
6. **Add file operations** (save/load JSON)
7. **Implement undo/redo** system
8. **Create export functionality** (PNG first)
9. **Add Git operations** via isomorphic-git
10. **Build diff viewer** for diagram changes

### Testing Strategy
- **Unit tests**: Core diagram operations
- **Integration tests**: File I/O and Git operations
- **User testing**: Weekly feedback sessions
- **Performance testing**: Canvas with 100+ elements

### Success Metrics
- Load/save diagram < 100ms
- Render 500 shapes at 60fps
- Git operations < 2 seconds
- Zero data loss on crashes
- 100% exportable to standard formats

## 📁 Project Structure
```
openchart/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   ├── Toolbar/
│   │   ├── PropertyPanel/
│   │   └── GitPanel/
│   ├── core/
│   │   ├── schema/
│   │   ├── shapes/
│   │   ├── commands/
│   │   └── git/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── tests/
├── public/
└── docs/
```

Ready to start building this open diagramming platform!