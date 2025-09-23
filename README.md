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
- **Shape rendering**: Some shapes display incorrectly or appear black
- **Resizing**: Shape resize handles may not work reliably
- **Connections**: Edge creation and editing needs improvement
- **Grid visibility**: Grid dots may be hard to see
- **Export quality**: Export functions are basic and may fail
- **No persistence**: Diagrams are not automatically saved
- **Limited undo/redo**: History management is incomplete

### ✅ What Currently Works (Sort Of)
- Basic shape placement from sidebar
- Simple drag and drop operations
- Basic zoom and pan controls
- Property panel for styling (when it works)
- Some export functionality (PNG, SVG)

### 🔬 Experimental Features
- 61 shapes across 6 categories (many with rendering issues)
- Action toolbar with common operations
- Collapsible sidebars
- Multiple export formats (reliability varies)

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

### Latest Iteration (v0.2.1-alpha)
**Focus: Basic UI improvements and bug fixes**

- Attempted to fix shape rendering issues (ongoing)
- Added action toolbar prototype (functionality limited)
- Implemented collapsible sidebars (may be buggy)
- Expanded shape library to 61 shapes (many still broken)
- Added multiple export formats (reliability varies)
- Grid visibility improvements (still needs work)
- Basic undo/redo framework (incomplete)

### Known Regressions
- Some changes may have introduced new bugs
- Export functions may not work consistently
- Shape resizing still unreliable
- Connection editing remains problematic

## ⚠️ Reality Check

**This is NOT a usable diagramming tool yet.** It's a development prototype with many broken features.

### What You Can Expect
- Frequent bugs and crashes
- Features that don't work as expected
- Incomplete functionality
- Data loss (no reliable save/load)
- Poor performance with complex diagrams
- Breaking changes between versions

### For Developers Only
This project is currently suitable for:
- Learning React Flow
- Contributing to open source
- Experimenting with diagramming concepts
- Understanding the challenges of building diagram editors

**Not suitable for:**
- Real work or production use
- Important diagrams you can't afford to lose
- Users expecting polished software

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

**OpenChart v0.2.1-alpha**: Early development prototype. Not ready for real-world use. Expect bugs, incomplete features, and breaking changes.