# OpenChart Development Commands

## Development Server
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run preview      # Preview production build
```

## Build Commands
```bash
npm run build        # Build for production (TypeScript compile + Vite build)
npm install          # Install dependencies
```

## Code Quality & Testing
```bash
npm run lint         # Run ESLint for code quality
npm run test:e2e     # Run Playwright E2E tests (when implemented)
```

## Git Operations (macOS/Darwin)
```bash
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to remote
git status           # Check working tree status
git log --oneline    # View commit history
```

## System Utilities (Darwin/macOS)
```bash
ls -la               # List files with details
find . -name "*.ts"  # Find TypeScript files
grep -r "pattern"    # Search for pattern in files
pwd                  # Print working directory
mkdir -p path/to/dir # Create directories recursively
```

## File Operations
```bash
cat filename         # Display file contents
head -20 file        # Show first 20 lines
tail -20 file        # Show last 20 lines
```

## Development Workflow
1. `npm run dev` - Start development server
2. Make code changes
3. `npm run lint` - Check code quality
4. `npm run build` - Test production build
5. Git operations for version control

## Testing Commands (Future)
```bash
npm test             # Run unit tests (Jest - when implemented)
npm run test:watch   # Watch mode for tests
npm run test:coverage # Test coverage report
```