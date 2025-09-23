# OpenChart Professional Design System - LIGHT MODE

## Core Design Philosophy
OpenChart is a professional, modern diagramming tool that rivals draw.io/Lucidchart with a clean, light interface. The design emphasizes workspace maximization, professional aesthetics, and technical precision.

## Color Palette

### Base Colors (LIGHT MODE)
- **Background Primary**: `#ffffff` - Clean white for main canvas
- **Background Secondary**: `#f8fafc` - Light gray for panels
- **Background Tertiary**: `#f1f5f9` - For elevated surfaces
- **Surface**: `#ffffff` - For cards and modals

### Accent Colors
- **Primary Blue**: `#0066ff` - Main action color
- **Primary Hover**: `#0052cc` - Darker blue for hover states
- **Selection**: `#0066ff` with 20% opacity
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`

### Text Colors (LIGHT MODE)
- **Text Primary**: `#1f2937` - High contrast dark gray
- **Text Secondary**: `#6b7280` - Muted gray for secondary text
- **Text Tertiary**: `#9ca3af` - For hints and placeholders
- **Text Disabled**: `#d1d5db`

### Border Colors (LIGHT MODE)
- **Border Default**: `#e5e7eb`
- **Border Hover**: `#d1d5db`
- **Border Focus**: `#0066ff`

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
```

### Size Scale (COMPACT)
- **xs**: 10px - Tooltips, badges
- **sm**: 11px - Secondary labels, hints
- **base**: 13px - Default UI text (reduced from 14px)
- **lg**: 14px - Section headers (reduced from 16px)
- **xl**: 16px - Page titles (reduced from 20px)

### Weight Scale
- **normal**: 400 - Body text
- **medium**: 500 - UI elements, buttons
- **semibold**: 600 - Headers, emphasis

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────┐
│  Top Bar (40px) - Minimal file operations   │ <- Reduced from 48px
├──────┬──────────────────────────────┬───────┤
│      │                              │       │
│ Tool │      Canvas Area             │ Props │
│ Bar  │   (Maximized workspace)      │ Panel │
│(56px)│                              │(280px)│ <- Reduced from 64px
│      │                              │       │
└──────┴──────────────────────────────┴───────┘
```

### Spacing System (COMPACT)
- **Base unit**: 4px
- **Spacing scale**: 2, 4, 6, 8, 12, 16, 20, 24 (more compact)
- **Component padding**: 6px (small), 8px (medium), 12px (large) (reduced)
- **Section spacing**: 16px between major sections (reduced from 24px)

## Component Design

### Action Toolbar (NEW - SLEEK)
- **Height**: 32px (compact height)
- **Button size**: 24px x 24px (small, sleek buttons)
- **Icon size**: 14px (compact icons)
- **Padding**: 4px horizontal, 4px vertical
- **Gap**: 2px between buttons, 8px between groups
- **Background**: `#ffffff` with subtle border
- **Hover**: Light gray background `#f3f4f6`

### Tool Palette
- **Style**: Vertical sidebar, 56px wide (reduced from 64px)
- **Icons**: 18px monochrome SVG icons (reduced from 24px)
- **Button size**: 32px x 32px (reduced from larger)
- **Active state**: Blue background with white icon
- **Hover**: Slight brightness increase + tooltip

### Buttons (COMPACT)
- **Primary**: Blue background, white text, 4px radius
- **Secondary**: Light border, dark text, 4px radius
- **Ghost**: Transparent, no border, hover effect only
- **Height**: 28px (default), 24px (small), 32px (large) (all reduced)
- **Padding**: 8px horizontal, 4px vertical (reduced)
- **Font size**: 13px (reduced from 14px)

### Canvas (LIGHT MODE)
- **Grid**: Light gray dots `#e5e7eb` at 20px intervals
- **Zoom range**: 10% to 500%
- **Background**: Clean white `#ffffff`

## Shape Defaults (LIGHT MODE)

### Default Style
- **Stroke**: `#374151` (dark gray) 2px width
- **Fill**: `#ffffff` or `#f9fafb` (light fill)
- **Text**: 13px, centered, dark gray `#374151`

### Selection State
- **Stroke**: `#0066ff` 2px width
- **Handles**: 6x6px squares (reduced from 8x8px)

## NO DARK MODE DEFAULTS
- Always default to light mode colors
- Use white/light backgrounds
- Use dark text on light backgrounds
- Professional, clean appearance like draw.io