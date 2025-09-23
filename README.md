# OpenChart

A professional open-source diagramming tool built with React Flow. Transform your ideas into beautiful diagrams with a feature-rich interface that rivals commercial tools like diagrams.net and Lucidchart.

## 🌟 Key Features

### 📐 Professional Shape Library
- **60+ Categorized Shapes**: Basic, Flowchart, UML, Arrows & Connectors, Entity Relation, General
- **Real-time Search**: Find shapes instantly with fuzzy search across names and categories
- **Expandable Categories**: Clean, organized shape organization with smooth animations
- **Drag & Drop**: Intuitive shape placement from library to canvas

### 🎨 Advanced Property Panel
- **Tabbed Interface**: Diagram and Style tabs for organized controls
- **Diagram Controls**: Grid settings, background options, paper sizes, viewport controls
- **Rich Styling**: Real-time color pickers, typography, appearance controls
- **Accordion Layout**: Clean, collapsed-by-default sections for better UX

### ⚡ Enhanced Canvas Experience
- **Visible Grid System**: Professional dot grid with snap-to-grid functionality
- **Smart Connections**: Color-coded connection handles with hover states
- **Performance Optimized**: Sub-50ms click response times
- **Professional Controls**: Settings panel with grid and connection mode toggles

### 🚀 Modern Architecture
- **React + TypeScript**: Type-safe, maintainable codebase
- **React Flow Engine**: Powerful node-based diagram foundation
- **Responsive Design**: Works seamlessly across desktop and tablet
- **Accessibility First**: Full keyboard navigation and screen reader support

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

## ✨ What's New (v2.0)

### Professional Shape Library
- **6 Shape Categories** with 60+ shapes total
- **Advanced Search** with real-time filtering
- **All Shapes Functional** - every shape in the library works
- **Professional UI** matching industry standards

### Enhanced Property Panel
- **Diagram Tab**: Canvas-level controls (grid, background, paper settings)
- **Style Tab**: Element-level styling with advanced controls
- **Accordion Behavior**: One section open at a time for clean interface
- **Consistent Light Theme** throughout the application

### Performance & UX Improvements
- **Grid Visibility**: Clear, visible grid dots for precise alignment
- **Optimized Performance**: Eliminated 300ms click delays
- **Smooth Animations**: Professional transitions and hover effects
- **Better Accessibility**: Enhanced keyboard navigation and screen reader support

## ✅ What Works

- **60+ Professional Shapes**: Complete shape library with all categories
- **Advanced Property Panel**: Comprehensive styling and diagram controls
- **Real-time Editing**: Instant visual feedback for all changes
- **Professional Grid System**: Visible grid with snap-to-grid functionality
- **Shape Search**: Find shapes quickly across all categories
- **Canvas Interactions**: Drag, select, connect, and style shapes
- **Export Options**: PNG, SVG, PDF export functionality
- **Auto-save/Recovery**: Automatic diagram persistence
- **Performance Optimized**: Smooth, responsive interface

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

## 🎯 Project Vision

OpenChart bridges the gap between proprietary diagramming tools and open-source alternatives by providing:

- **Professional Quality**: Feature parity with commercial tools
- **Open Source**: Transparent, community-driven development
- **Modern Architecture**: Built with cutting-edge web technologies
- **Extensible Design**: Easy to add new shapes, features, and integrations
- **Performance Focus**: Optimized for smooth, responsive user experience

## 🚀 Performance Highlights

- **Sub-50ms Click Response**: Optimized event handlers
- **Smooth Animations**: 60fps transitions and interactions
- **Efficient Rendering**: Smart re-rendering with React.memo
- **Memory Optimized**: Minimal memory footprint for large diagrams
- **Fast Search**: Real-time shape filtering across 60+ shapes

## 🔧 Advanced Features

### Shape Library
- **Fuzzy Search**: Find shapes by name, description, or tags
- **Category Management**: Organized, expandable shape categories
- **Shape Metadata**: Rich descriptions and usage information
- **Accessibility**: Full keyboard navigation and screen reader support

### Property Panel
- **Real-time Updates**: Changes apply instantly without lag
- **Professional Color Pickers**: Multiple input methods (palette, wheel, input)
- **Typography Controls**: Font size, weight, alignment with shortcuts
- **Appearance Options**: Colors, borders, opacity, corner radius
- **Bulk Operations**: Multi-select styling and alignment tools

### Canvas Features
- **Professional Grid**: 20px dot grid with configurable snap-to-grid
- **Smart Connections**: Intelligent connection points with visual feedback
- **Advanced Selection**: Multi-select with professional indicators
- **Zoom & Pan**: Smooth viewport navigation with mouse and keyboard

## 🤝 Contributing

We welcome contributions! Current focus areas:

1. **Advanced Features**: Templates, collaboration, version control integration
2. **Export/Import**: Enhanced format support, Lucidchart compatibility
3. **Performance**: Further optimizations for very large diagrams
4. **Mobile Support**: Touch-friendly interface for tablets and phones
5. **Integrations**: API development, third-party tool connections

Feel free to fork and experiment. Issues and PRs are welcome.

## 📄 License

MIT - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [React Flow](https://reactflow.dev/) - the powerful React library for building node-based UIs
- Icons by [Lucide](https://lucide.dev/) - beautiful & consistent icon toolkit
- Inspired by [diagrams.net](https://diagrams.net/) and [Lucidchart](https://lucidchart.com/) for their excellent UX

---

**OpenChart v2.0**: From prototype to professional-grade diagramming tool. Ready for real-world use with industry-standard features and performance.