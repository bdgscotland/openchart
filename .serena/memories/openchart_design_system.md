# OpenChart Professional Design System

## Core Design Philosophy
OpenChart is a professional, modern diagramming tool that rivals Lucidchart with a cleaner, more focused interface. The design emphasizes workspace maximization, professional aesthetics, and technical precision.

## Color Palette

### Base Colors
- **Background Primary**: `#0a0a0b` - Deep black for main canvas
- **Background Secondary**: `#111114` - Slightly lighter for panels
- **Background Tertiary**: `#1a1a1f` - For elevated surfaces
- **Surface**: `#1f1f23` - For cards and modals

### Accent Colors
- **Primary Blue**: `#0066ff` - Main action color
- **Primary Hover**: `#0052cc` - Darker blue for hover states
- **Selection**: `#0066ff` with 20% opacity
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`

### Text Colors
- **Text Primary**: `#ffffff` - High contrast white
- **Text Secondary**: `#a1a1aa` - Muted gray for secondary text
- **Text Tertiary**: `#71717a` - For hints and placeholders
- **Text Disabled**: `#52525b`

### Border Colors
- **Border Default**: `rgba(255, 255, 255, 0.1)`
- **Border Hover**: `rgba(255, 255, 255, 0.2)`
- **Border Focus**: `#0066ff`

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
```

### Size Scale
- **xs**: 11px - Tooltips, badges
- **sm**: 12px - Secondary labels, hints
- **base**: 14px - Default UI text
- **lg**: 16px - Section headers
- **xl**: 20px - Page titles
- **2xl**: 24px - Main headings

### Weight Scale
- **normal**: 400 - Body text
- **medium**: 500 - UI elements, buttons
- **semibold**: 600 - Headers, emphasis

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────┐
│  Top Bar (48px) - Minimal file operations   │
├──────┬──────────────────────────────┬───────┤
│      │                              │       │
│ Tool │      Canvas Area             │ Props │
│ Bar  │   (Maximized workspace)      │ Panel │
│(64px)│                              │(280px)│
│      │                              │       │
└──────┴──────────────────────────────┴───────┘
```

### Spacing System
- **Base unit**: 4px
- **Spacing scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Component padding**: 12px (small), 16px (medium), 20px (large)
- **Section spacing**: 24px between major sections

## Component Design

### Tool Palette
- **Style**: Vertical sidebar, 64px wide
- **Icons**: 24px monochrome SVG icons (no emojis)
- **Structure**:
  ```
  - Selection tool (cursor icon)
  - Divider (1px line)
  - Basic shapes (rectangle, circle, diamond, triangle)
  - Divider
  - Connectors (straight line, elbow, curved)
  - Divider
  - Text and annotations
  ```
- **Active state**: Blue background with white icon
- **Hover**: Slight brightness increase + tooltip
- **Grouped sections** with 8px spacing between groups

### Buttons
- **Primary**: Blue background, white text, 4px radius
- **Secondary**: Transparent with border, 4px radius
- **Ghost**: Transparent, no border, hover effect only
- **Height**: 32px (default), 28px (small), 36px (large)
- **Padding**: 12px horizontal, 6px vertical
- **Transitions**: All 150ms ease-out

### Panels
- **Background**: `#111114` with `backdrop-filter: blur(10px)`
- **Border**: 1px solid `rgba(255, 255, 255, 0.1)`
- **Border radius**: 8px
- **Shadow**: `0 4px 6px rgba(0, 0, 0, 0.3)`
- **Glassmorphism effect** for floating panels

### Canvas
- **Grid**: Dots at 20px intervals, `rgba(255, 255, 255, 0.05)`
- **Zoom range**: 10% to 500%
- **Pan**: Smooth with momentum
- **Background**: Solid `#0a0a0b`

## Shape Defaults

### Default Style
- **Stroke**: `#ffffff` (white) 2px width
- **Fill**: `transparent` or `rgba(255, 255, 255, 0.02)`
- **Corner radius**: 4px for rectangles
- **Text**: 14px, centered, white

### Selection State
- **Stroke**: `#0066ff` 2px width
- **Handles**: 8x8px squares at corners, white with blue border
- **Bounding box**: Dashed blue line
- **Multi-select**: Blue tinted overlay

### Hover State
- **Subtle glow**: `box-shadow: 0 0 8px rgba(0, 102, 255, 0.3)`
- **Cursor**: Pointer for selectable, move for draggable

## Interactive Behaviors

### Transitions
- **Duration**: 150ms for hover, 200ms for state changes
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Properties**: opacity, transform, background-color, border-color

### Tooltips
- **Delay**: 500ms before showing
- **Position**: Above element with 8px offset
- **Style**: Dark background, white text, 4px radius

### Drag & Drop
- **Ghost opacity**: 0.5
- **Drop zone highlight**: Blue border
- **Invalid drop**: Red tinted overlay

## Icons & Graphics

### Icon Style
- **Size**: 16px (small), 20px (medium), 24px (large)
- **Style**: Outlined, 2px stroke weight
- **Color**: Monochrome - white by default
- **Source**: Use Lucide Icons or similar professional set

### Remove All Emojis
- Replace emoji icons with professional SVG icons
- Use icon fonts or inline SVGs
- Maintain consistent stroke width

## Responsive Breakpoints
- **Desktop**: 1280px and up (default)
- **Tablet**: 768px to 1279px (hide property panel)
- **Mobile**: Not supported (desktop-only application)

## Accessibility
- **Focus rings**: 2px blue outline with 2px offset
- **Contrast ratios**: AAA compliant for text
- **Keyboard navigation**: Full support for all operations
- **Screen reader**: Proper ARIA labels

## Implementation Priority
1. Remove all emojis from UI
2. Implement new color scheme
3. Redesign toolbar with professional icons
4. Apply typography system
5. Add glassmorphism to panels
6. Polish canvas interactions
7. Refine shape styling

This design system creates a premium, professional feel that positions OpenChart as a serious alternative to Lucidchart, with a cleaner and more modern aesthetic.