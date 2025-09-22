# Style Transfer System

A comprehensive style copying and transfer system for OpenChart that provides powerful tools for managing element styles across diagrams.

## 🌟 Features

### 📋 Style Clipboard
- **Copy/Paste styles** between elements with visual confirmation
- **Persistent storage** across browser sessions (5-minute expiry)
- **Visual preview** of copied styles
- **Auto-expiry** with clear status indicators

### 🎨 Style Pipette (Eyedropper)
- **Pick styles** from any element with precision cursor
- **Real-time preview** with element information
- **Visual feedback** with crosshair and tooltips
- **Instant application** to selected elements

### 🖌️ Format Painter
- **Single or persistent mode** (click vs double-click)
- **Multiple element support** with batch application
- **Visual source preview** with applied elements tracking
- **Smart deactivation** and mode indicators

### 📚 Style History
- **Recent styles tracking** with usage statistics
- **Favorites system** for frequently used styles
- **Search and filtering** by name, usage, or date
- **Custom labeling** and organization

### ⚙️ Selective Style Copying
- **Choose specific properties** to copy (appearance, typography, etc.)
- **Property grouping** with expand/collapse
- **Visual preview** of selected properties
- **Batch selection** with group toggles

### ⌨️ Keyboard Shortcuts
- `Ctrl+Shift+C` - Copy style from selected element
- `Ctrl+Shift+V` - Paste style to selected elements
- `P` - Toggle style pipette mode
- `F` - Toggle format painter mode
- `Escape` - Cancel active mode

### 🔄 Undo/Redo Support
- **Full command system integration** with StyleTransferCommand
- **Batch operations** for multiple elements
- **Command merging** for smooth user experience
- **Selective transfers** with property-level undo

## 📦 Components

### Main Component
```tsx
import { StyleTransfer } from './components/StyleTransfer';

<StyleTransfer
  elements={diagramElements}
  selectedElementIds={selectedIds}
  onStyleTransfer={handleStyleTransfer}
  onSelectiveStyleTransfer={handleSelectiveTransfer}
  onExecuteCommand={handleCommand}
/>
```

### Individual Components
```tsx
import {
  StyleClipboard,
  StylePipette,
  FormatPainter,
  StyleHistory,
  SelectiveStyleCopy
} from './components/StyleTransfer';
```

### Hooks
```tsx
import {
  useStyleClipboard,
  useStylePipette,
  useFormatPainter,
  useStyleHistory
} from './components/StyleTransfer';

const { copyStyle, pasteStyle, hasValidStyle } = useStyleClipboard();
const { activate, deactivate, isActive } = useStylePipette();
```

## 🎯 Usage Examples

### Basic Style Copy/Paste
```tsx
// Copy style from selected element
const handleCopyStyle = () => {
  const sourceElement = selectedElements[0];
  styleClipboard.copyStyle(sourceElement.style, sourceElement.id, sourceElement.type);
};

// Paste style to multiple elements
const handlePasteStyle = () => {
  const style = styleClipboard.pasteStyle();
  if (style) {
    selectedElementIds.forEach(id => {
      onStyleTransfer([id], style, 'paste');
    });
  }
};
```

### Style Pipette Implementation
```tsx
const MyComponent = () => {
  const stylePipette = useStylePipette();

  const handleStylePicked = (style, sourceElement) => {
    // Apply to other selected elements
    const targetIds = selectedElementIds.filter(id => id !== sourceElement.id);
    onStyleTransfer(targetIds, style, 'pipette');
  };

  return (
    <StylePipette
      elements={elements}
      isActive={stylePipette.isActive}
      onStylePicked={handleStylePicked}
      onActiveStateChange={stylePipette.activate}
    />
  );
};
```

### Format Painter with Undo Support
```tsx
const handleFormatPainterApply = (elementId, style) => {
  // Create command for undo/redo
  const command = StyleTransferCommandFactory.createStyleTransfer(
    [elementId],
    style,
    elements.filter(el => el.id === elementId),
    'format-painter'
  );

  commandManager.executeCommand(command);
};
```

### Selective Style Transfer
```tsx
const handleSelectiveTransfer = (properties, propertyNames) => {
  const command = StyleTransferCommandFactory.createSelectiveStyleTransfer(
    targetElementIds,
    properties,
    propertyNames,
    elements.filter(el => targetElementIds.includes(el.id))
  );

  commandManager.executeCommand(command);
};
```

## 🎨 Styling

### CSS Classes
The system includes comprehensive CSS styling with:
- **Responsive design** for mobile and desktop
- **Dark mode support** with prefers-color-scheme
- **Smooth animations** and transitions
- **Consistent design language** with OpenChart

### Key CSS Classes
```css
.style-transfer                 /* Main container */
.style-transfer-toolbar         /* Button toolbar */
.style-transfer-button          /* Individual buttons */
.style-clipboard-status         /* Clipboard status display */
.style-pipette-preview          /* Pipette tooltip */
.format-painter-source-preview  /* Format painter preview */
.style-history-list            /* History items list */
.selective-style-copy          /* Selective copy dialog */
```

## 🔧 Architecture

### Command Pattern
The system uses the Command Pattern for undo/redo support:

```tsx
// Base command interface
interface Command {
  execute(state: DiagramSchema): DiagramSchema;
  undo(state: DiagramSchema): DiagramSchema;
  merge?(other: Command): Command | null;
}

// Style transfer commands
class StyleTransferCommand implements Command { ... }
class SelectiveStyleTransferCommand implements Command { ... }
class BatchStyleTransferCommand implements Command { ... }
```

### State Management
Each component manages its own state while coordinating through the main StyleTransfer component:

```tsx
interface StyleTransferState {
  activeMode: 'none' | 'pipette' | 'format-painter' | 'selective-copy';
  showHistory: boolean;
  showSelectiveCopy: boolean;
  selectiveCopySource: ElementStyle | null;
  lastCopiedStyle: CopiedStyle | null;
  isVisible: boolean;
}
```

### Data Persistence
- **Style clipboard** - localStorage with 5-minute expiry
- **Style history** - localStorage with configurable max entries
- **User preferences** - Component-level state persistence

## 🧪 Testing

### Unit Testing
```tsx
describe('StyleClipboard', () => {
  it('should copy and paste styles correctly', () => {
    const clipboard = useStyleClipboard();
    const style = { fill: '#ff0000', stroke: '#000000' };

    clipboard.copyStyle(style);
    expect(clipboard.hasValidStyle).toBe(true);

    const pastedStyle = clipboard.pasteStyle();
    expect(pastedStyle).toEqual(style);
  });
});
```

### Integration Testing
```tsx
describe('StyleTransfer Integration', () => {
  it('should transfer styles between elements', async () => {
    const { result } = renderHook(() => useStyleTransfer());

    // Copy style from source
    result.current.styleClipboard.copyStyle(sourceStyle);

    // Apply to targets
    await act(async () => {
      onStyleTransfer(targetIds, sourceStyle, 'paste');
    });

    expect(onStyleTransfer).toHaveBeenCalledWith(targetIds, sourceStyle, 'paste');
  });
});
```

## 🚀 Performance

### Optimizations
- **Memoized components** with React.memo
- **Debounced operations** for real-time feedback
- **Efficient re-renders** with selective state updates
- **Command merging** to prevent undo stack flooding

### Memory Management
- **Automatic cleanup** of expired clipboard data
- **Limited history size** (configurable, default 50 entries)
- **Event listener cleanup** on component unmount
- **Optimized DOM operations** for pipette mode

## 🔮 Future Enhancements

### Planned Features
1. **Cross-diagram transfer** - Copy styles between different diagrams
2. **Style templates** - Save and reuse common style combinations
3. **Advanced filtering** - Search history by color, property type, etc.
4. **Batch operations** - Apply different styles to multiple selections
5. **Style interpolation** - Animate between different styles
6. **Cloud sync** - Synchronize style history across devices

### API Extensions
```tsx
// Future APIs
interface StyleTransferExtended {
  exportStyles(): StyleTemplate[];
  importStyles(templates: StyleTemplate[]): void;
  syncToCloud(): Promise<void>;
  createStyleAnimation(from: ElementStyle, to: ElementStyle): Animation;
}
```

## 📄 License

This Style Transfer system is part of OpenChart and follows the project's licensing terms.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and include tests for new features.

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start development server: `npm start`

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Include JSDoc comments for public APIs
- Add comprehensive tests for new features

---

Built with ❤️ by the Style Transfer Specialist for the OpenChart project.