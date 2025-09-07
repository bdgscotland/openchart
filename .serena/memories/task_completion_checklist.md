# Task Completion Checklist

## Before Completing Any Task

### 1. Code Quality
- [ ] Run `npm run lint` to check for ESLint errors
- [ ] Fix any linting issues
- [ ] Ensure TypeScript compilation succeeds (`npm run build`)
- [ ] Check for console errors in development mode

### 2. Testing
- [ ] Test functionality manually in browser (`npm run dev`)
- [ ] Run any existing tests (when implemented)
- [ ] Test edge cases and error scenarios
- [ ] Verify responsive behavior

### 3. Code Review
- [ ] Review code for adherence to style conventions
- [ ] Check for proper TypeScript typing
- [ ] Ensure no hardcoded values where constants should be used
- [ ] Verify proper error handling

### 4. Documentation
- [ ] Update relevant comments if complex logic was added
- [ ] Update type definitions if interfaces changed
- [ ] Consider if README updates are needed

### 5. Git Operations
- [ ] Stage appropriate files (`git add`)
- [ ] Write clear commit message
- [ ] Ensure no sensitive data is committed
- [ ] Push to appropriate branch

## Specific to OpenChart Features

### Canvas/Shape Implementation
- [ ] Verify shapes render correctly
- [ ] Test mouse interactions (click, drag, select)
- [ ] Check shape serialization to JSON
- [ ] Test undo/redo functionality

### File Operations
- [ ] Test save/load functionality
- [ ] Verify JSON schema validation
- [ ] Check export functionality
- [ ] Test with various file sizes

### Git Integration
- [ ] Test git operations in browser
- [ ] Verify diff visualization
- [ ] Check commit/push functionality
- [ ] Test with various repository states

## Performance Considerations
- [ ] Check canvas performance with multiple shapes
- [ ] Monitor bundle size impact
- [ ] Test memory usage during operations
- [ ] Verify smooth 60fps rendering