# OpenChart Project Structure

## Root Directory
```
openchart/
├── src/                    # Source code
├── tests/                  # Test files
├── docs/                   # Documentation
├── public/                 # Static assets
├── node_modules/           # Dependencies
├── package.json            # Project configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # ESLint configuration
├── PLAN.md                 # Project roadmap
├── CLAUDE.md               # Development tool configuration
└── README.md               # Project documentation
```

## Source Code Structure
```
src/
├── components/             # React components
│   ├── Canvas/            # Core canvas rendering component
│   ├── Toolbar/           # Shape palette and tools
│   ├── PropertyPanel/     # Shape properties editor
│   └── GitPanel/          # Git operations UI
├── core/                  # Core business logic
│   ├── schema/            # JSON diagram schema definitions
│   ├── shapes/            # Shape definitions and logic
│   ├── commands/          # Undo/redo command pattern
│   └── git/               # Git integration utilities
├── hooks/                 # Custom React hooks
├── utils/                 # Helper functions and utilities
├── types/                 # TypeScript type definitions
├── assets/                # Static assets (images, icons)
├── App.tsx                # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## Key Architecture Patterns
- **Component-based architecture** with React functional components
- **Command pattern** for undo/redo operations
- **JSON schema** for diagram serialization
- **Git-first** approach for version control
- **Canvas-based rendering** with Konva.js