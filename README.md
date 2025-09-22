# OpenChart

An open-source diagramming tool built with React Flow. Early prototype exploring what a transparent, git-friendly alternative to Lucidchart could look like.

## 🚀 Quick Start

The fastest way to get started:

```bash
# Clone and start (recommended)
./start.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## ✅ What Works

- **Basic Shapes**: Rectangle, Circle, Diamond, Triangle, Hexagon, Star
- **Node Connections**: Draw edges between shapes with connection handles
- **Canvas Interactions**: Drag, select, and position shapes
- **Save/Load**: Export and import diagrams as JSON files
- **Export Options**: PNG, SVG, PDF (basic implementation)
- **Dark Mode**: Professional dark theme with proper contrast
- **Shape Styling**: Basic color and styling options
- **Zoom & Pan**: Navigate large diagrams

## ⚠️ Current Limitations

**This is an early prototype, not production software:**

- **No Undo/Redo**: Actions cannot be reversed yet
- **Limited Resize**: Resize handles are visual only, not functional
- **Basic Edges**: Limited connection styling and arrow options
- **No Keyboard Shortcuts**: Mouse-only interaction currently
- **No Collaborative Features**: Single-user only
- **Performance**: Not optimized for very large diagrams
- **Mobile**: Desktop-focused, mobile support incomplete

## 🛠️ Tech Stack

- **React + TypeScript**: Type-safe component architecture
- **React Flow**: Powerful node-based diagram engine
- **Vite**: Fast development and build tooling
- **Lucide React**: Professional icon library
- **html-to-image**: Export functionality

## 📁 Project Structure

```
src/
├── components/
│   ├── Canvas/           # React Flow canvas implementation
│   ├── Toolbar/          # Shape palette and tools
│   └── MenuBar/          # File operations and settings
├── core/
│   └── schema/           # JSON diagram validation
├── hooks/                # Canvas state management
└── types/                # TypeScript definitions
```

## 🧪 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Startup Script Features

The `./start.sh` script provides:

- ✅ Node.js version verification (18+ required)
- 📦 Automatic dependency installation/updates
- 🔍 TypeScript type checking
- 🧹 ESLint code quality checks
- 🚀 Vite development server startup
- ⚠️ Graceful handling of linting warnings

### Manual Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript checking
```

## 🎯 Project Goals

This project explores:

- **Transparency**: Open-source alternative to proprietary tools
- **Portability**: JSON-based diagrams that work anywhere
- **Version Control**: Git-friendly file formats
- **Modern Architecture**: React-based, extensible design
- **Performance**: Efficient rendering for complex diagrams

## 🤝 Contributing

This is experimental software. Current focus areas:

1. **Core Functionality**: Undo/redo, proper resize, keyboard shortcuts
2. **File Formats**: Better import/export, Lucidchart compatibility
3. **Performance**: Optimization for large diagrams
4. **User Experience**: Better interactions and workflows

Feel free to fork and experiment. Issues and PRs welcome.

## 📄 License

MIT - See LICENSE file for details

---

**Note**: This is a prototype demonstrating concepts, not production-ready software. Use in production environments is not recommended.