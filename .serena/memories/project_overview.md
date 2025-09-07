# OpenChart Project Overview

## Purpose
OpenChart is an open-source, git-backed diagramming platform designed as an alternative to Lucidchart. The goal is to democratize visual communication through transparency, portability, and version control.

## Core Features
- **Open Schema**: JSON-based, human-readable diagram format
- **Git-First**: Every diagram is a versioned text file
- **Export Everything**: No vendor lock-in, full data portability
- **Collaborative by Design**: Built for teams using existing Git workflows

## Target MVP Features (Phase 1)
1. Basic shapes (rectangle, circle, diamond, arrow)
2. Text editing with basic formatting
3. Smart connectors between shapes
4. Multi-select, move, resize, delete operations
5. Undo/redo system with command pattern
6. Save/load local JSON files
7. Export to PNG, SVG, PDF
8. Basic Lucidchart JSON import

## Development Status
- ✅ Project initialized with Vite + React + TypeScript
- ✅ Dependencies installed (Konva.js, Zustand, isomorphic-git)
- ✅ Project structure created
- 🔄 Currently implementing JSON schema and core components