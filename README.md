# OpenChart

**⚠️ Early Development - Not Ready for Production Use**

An experimental open-source diagramming tool built with React Flow. This is a prototype in active development - expect bugs, incomplete features, and breaking changes.

## 🎯 Project Goals

OpenChart aims to become a modern, open-source alternative to commercial diagramming tools. Our vision includes:

- **Professional Quality**: Eventually rival commercial diagramming tools
- **Open Source**: Transparent, community-driven development
- **Modern Tech Stack**: Built with React, TypeScript, and React Flow
- **File Format Freedom**: No vendor lock-in with open JSON format

## 🚧 Current Development Status

**This is an early prototype.** Many core features are incomplete or buggy:

### ⚠️ Known Issues
- **Shape resizing**: Shape resize handles may not work reliably in all scenarios
- **Export quality**: Export functions are basic and may fail
- **Undo/redo scope**: Currently limited to shape creation (editing, deletion not yet supported)
- **Performance**: May slow down with very complex diagrams (100+ shapes)

### ✅ What Currently Works Well
- **Shape Placement**: All 61 shapes render correctly from categorized sidebar
- **Shape Interactions**: Drag, drop, select, multi-select operations work reliably
- **Connection Tools**: Edge creation with multiple styles (straight, curved, step)
- **Property Panel**: Diagram and Style tabs with real-time updates
- **Grid Customization**: Choose between dots, lines, or crosshatch with custom colors
- **Background Colors**: Persistent canvas background color settings
- **Undo/Redo**: Command pattern implementation for shape operations
- **Layer Management**: Z-ordering controls and layer panel
- **Color Picker**: Multi-tab color picker with palette, transparency, and theme options
- **Zoom & Pan**: Smooth canvas navigation with minimap and controls
- **Edge Positioning**: Accurate connection points on all shape types
- **UI Polish**: Consistent icons, proper hover states, and visual feedback
- **File Persistence**: Save/load diagrams with all settings preserved

### 🔬 Stable Features
- **Shape Library**: 61 shapes across 6 categories
- **Action Toolbar**: Context-aware tools for selection, duplication, and layering
- **Collapsible Sidebars**: Space-efficient interface with smooth animations
- **Multiple Export Formats**: PNG, SVG export capabilities

## 🚀 Quick Start

```bash
# Clone the repository
git clone [repository-url]
cd openchart

# Start development server (recommended)
./start.sh
```

Or manually:

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🔨 Recent Development Work

### Latest Iteration (v0.3.0-alpha)
**Focus: Diagram settings persistence and grid customization**

- ✅ **Diagram Settings Persistence** - Grid, background, and canvas settings now save/load with diagrams
- ✅ **Dynamic Grid Styling** - Grid style (dots/lines/crosshatch) and color fully customizable
- ✅ **Background Color Control** - Canvas background color persists across sessions
- ✅ **Undo/Redo System** - Comprehensive command pattern for shape creation and editing
- ✅ **Layer System** - Z-ordering with layer management for complex diagrams
- ✅ **Context Menus** - Right-click menus for shapes and canvas operations
- ✅ **Property Panel Enhancements** - Diagram tab with grid/background controls working

### Previous Iteration (v0.2.2-alpha)
**UI polish and core functionality stabilization**

- ✅ **Fixed edge positioning** - Resolved React Flow zoom scaling issues affecting all shapes
- ✅ **Enhanced connection tools** - Working dropdown for edge styles (straight, curved, step)
- ✅ **Improved color picker** - Multi-tab interface with multiple color palettes
- ✅ **UI consistency fixes** - Proper icon states, hover effects, and visual feedback
- ✅ **PropertyPanel improvements** - Fixed collapsed state positioning and expand/contract icons
- ✅ **Minimap contrast** - Enhanced viewport visibility with blue highlighting

### Recent Quality Improvements
- Diagram settings now persist in JSON file format
- Grid customization with multiple styles and colors
- Improved visual feedback and user experience
- Enhanced stability of core diagramming operations
- Better React Flow integration and zoom handling

## ⚠️ Reality Check

**This is an improving prototype** with increasingly stable core functionality, but still has limitations.

### What You Can Expect
- Generally stable basic diagramming operations
- Some advanced features may not work as expected
- Occasional bugs in edge cases
- Automatic diagram saving (but limited recovery options)
- Good performance with moderate diagrams (50-100 shapes)
- Breaking changes possible between versions

### Development Status
This project is now suitable for:
- **Learning React Flow** - Good example of complex React Flow implementation
- **Contributing to open source** - Well-structured codebase with clear patterns
- **Experimenting with diagramming** - Most core features work reliably
- **Prototype diagrams** - Basic diagramming needs can be met
- **Educational use** - Understanding modern web-based diagram editors

**Still not ready for:**
- Mission-critical business diagrams
- Production workflows requiring 100% reliability
- Users needing advanced diagramming features

## 🛠️ Tech Stack

- **React + TypeScript**: Type-safe component architecture
- **React Flow**: Advanced node-based diagram engine
- **Vite**: Lightning-fast development and build tooling
- **Lucide React**: Professional icon library (1000+ icons)
- **html-to-image**: High-quality export functionality

## 📁 Enhanced Project Structure

```
src/
├── components/
│   ├── Canvas/              # Enhanced React Flow canvas
│   │   ├── FlowCanvas.tsx   # Main canvas with grid & performance optimizations
│   │   └── shapes/          # Complete shape component library (60+ shapes)
│   ├── Toolbar/             # Professional shape library
│   │   ├── ShapeLibrary.tsx # Categorized shape library with search
│   │   └── shapeDefinitions.ts # Complete shape metadata
│   ├── PropertyPanel/       # Advanced property controls
│   │   ├── PropertyPanel.tsx    # Tabbed interface (Diagram/Style)
│   │   ├── TabContainer.tsx     # Modern tab system
│   │   ├── DiagramControls.tsx  # Canvas-level settings
│   │   └── StyleControls.tsx    # Element-level styling
│   └── MenuBar/             # File operations and settings
├── types/
│   └── shapes.ts            # Comprehensive type definitions
├── hooks/                   # Canvas state management
└── utils/                   # Helper functions and utilities
```

## 🧪 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Enhanced Startup Script

The `./start.sh` script provides a complete development environment:

- ✅ Node.js version verification (18+ required)
- 📦 Automatic dependency installation/updates
- 🔍 TypeScript type checking
- 🧹 ESLint code quality checks with auto-fix
- 🗑️ Build artifact cleanup
- 🚀 Vite development server with HMR
- ⚠️ Graceful handling of warnings (continues with info)

### Available Commands

```bash
npm run dev              # Development server with HMR
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint with auto-fix
npm run type-check       # TypeScript type checking
npm run test             # Run test suite
npm run test:e2e         # End-to-end tests with Playwright
```

## 🎯 Future Vision (Aspirational)

If development continues successfully, OpenChart could eventually become:

- A reliable open-source diagramming tool
- Feature-competitive with commercial alternatives
- Built on modern web technologies
- Extensible and customizable
- Fast and responsive

**But we're not there yet.** This is early-stage development with a long road ahead.

## 🐛 Current Performance Issues

- **Slow Shape Rendering**: Many shapes render poorly or incorrectly
- **Memory Leaks**: Performance degrades with complex diagrams
- **Buggy Interactions**: Click handlers may not work reliably
- **Inconsistent Animations**: UI transitions are hit-or-miss
- **Search Problems**: Shape filtering may be unreliable

## 🛠️ Development Focus Areas

### Critical Issues to Fix
- **Shape Rendering**: Make all shapes display correctly
- **Resize Handles**: Implement reliable shape resizing
- **Connection Tools**: Fix edge creation and editing
- **Data Persistence**: Add reliable save/load functionality
- **Performance**: Optimize rendering for larger diagrams

### Nice-to-Have Features (Later)
- Fuzzy search for shapes
- Advanced property controls
- Professional color pickers
- Grid customization
- Multi-select operations
- Keyboard navigation
- Accessibility support

## 🤝 Contributing

**This project needs help!** If you're interested in contributing:

### High Priority Fixes Needed
1. **Fix shape rendering** - Many shapes don't display correctly
2. **Implement reliable resizing** - Shape resize handles are broken
3. **Improve connection tools** - Edge creation/editing needs work
4. **Add data persistence** - Currently no way to save diagrams
5. **Performance optimization** - App gets slow with many shapes

### For Contributors
- Expect to encounter many bugs
- Focus on one small issue at a time
- Test thoroughly - many features are fragile
- Document any workarounds you discover

**Note**: This is prototype-quality code. Don't expect commercial-grade architecture.

## 📄 License

MIT - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [React Flow](https://reactflow.dev/) - the powerful React library for building node-based UIs
- Icons by [Lucide](https://lucide.dev/) - beautiful & consistent icon toolkit
- Inspired by [diagrams.net](https://diagrams.net/) and [Lucidchart](https://lucidchart.com/) for their excellent UX

---

**OpenChart v0.3.0-alpha**: Early development prototype with improved persistence and customization. Not ready for production use. Expect bugs, incomplete features, and breaking changes.