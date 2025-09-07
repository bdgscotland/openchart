# OpenChart Code Style & Conventions

## TypeScript Guidelines
- **Strict mode enabled** - Use TypeScript strict compilation
- **Explicit typing** - Prefer explicit types over `any`
- **Interface over type** - Use interfaces for object shapes
- **Functional components** - Use React functional components with hooks
- **ES Modules** - Use import/export syntax

## Naming Conventions
- **Components**: PascalCase (e.g., `CanvasComponent.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/Functions**: camelCase (e.g., `handleMouseDown`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_CANVAS_SIZE`)
- **Types/Interfaces**: PascalCase with descriptive names

## File Organization
- **One component per file** - Each React component in its own file
- **Index files** - Use index.ts for clean imports
- **Co-location** - Keep related files close (component + styles + tests)
- **Absolute imports** - Use path aliases for clean imports

## React Patterns
- **Functional components** with hooks (no class components)
- **Custom hooks** for reusable logic
- **Props interfaces** - Define clear prop types
- **Event handlers** - Use descriptive handler names (e.g., `handleShapeClick`)

## State Management (Zustand)
- **Store slices** - Organize state by domain
- **Immutable updates** - Use immer-style updates
- **Typed stores** - Define clear store interfaces

## Code Formatting
- **ESLint configuration** - Follow project ESLint rules
- **Consistent indentation** - 2 spaces (configured in ESLint)
- **Semicolons** - Required at statement ends
- **Single quotes** - Prefer single quotes for strings

## Git Conventions
- **Conventional commits** - Use conventional commit format
- **Feature branches** - Use feature/fix branches
- **Clean history** - Squash commits when merging

## Architecture Patterns
- **Command pattern** - For undo/redo operations
- **Observer pattern** - For state changes
- **Factory pattern** - For shape creation
- **JSON serialization** - For diagram persistence