# OpenChart Technology Stack

## Frontend Framework
- **React 19.1.1** - Component framework
- **TypeScript 5.8.3** - Type safety and development experience
- **Vite 7.1.2** - Build tool and development server

## Diagramming Engine
- **React Flow 11.11.4** - Node-based diagramming library (replaced Konva.js)
  - Built-in node/edge management
  - Connection points and automatic routing
  - Zoom, pan, minimap controls
  - Better suited for diagramming than general canvas libraries

## Icons & UI
- **Lucide React 0.544.0** - Professional SVG icon library (replaced emoji icons)

## Export Functionality  
- **html-to-image 1.11.13** - Canvas to PNG/SVG export
- **file-saver 2.0.5** - Client-side file downloads

## State Management
- **React State** - Using React's built-in state management
- **React Flow Internal State** - For diagram nodes and edges
- **Zustand 5.0.8** - Available but not actively used after React Flow migration

## File Operations & Version Control
- **isomorphic-git 1.33.1** - Git operations in the browser (planned feature)
- **uuid 11.1.0** - Unique identifier generation

## Development & Testing
- **ESLint 9.33.0** - Code linting with React-specific rules
- **Playwright 1.55.0** - End-to-end testing framework
- **TypeScript ESLint 8.39.1** - TypeScript-specific linting rules

## Build Configuration
- **ES Modules** - Modern JavaScript module system
- **TypeScript strict mode** - Enhanced type checking
- **Vite HMR** - Hot module replacement for fast development

## Migration History
- **2025-09-17**: Migrated from Konva.js to React Flow for proper node-edge diagramming support
- React Flow provides built-in features that would require extensive custom development with Konva