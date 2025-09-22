// Style Transfer Components Export Index

// Main component
export { default as StyleTransfer, useStyleTransfer } from './StyleTransfer';
export type { StyleTransferProps, StyleTransferState } from './StyleTransfer';

// Individual components
export { StyleClipboard, useStyleClipboard } from './StyleClipboard';
export type { CopiedStyle, StyleClipboardState } from './StyleClipboard';

export { StylePipette, useStylePipette } from './StylePipette';
export type { StylePickerState, StylePipetteProps } from './StylePipette';

export { FormatPainter, useFormatPainter } from './FormatPainter';
export type { FormatPainterState, FormatPainterProps } from './FormatPainter';

export { StyleHistory, useStyleHistory } from './StyleHistory';
export type { StyleHistoryEntry, StyleHistoryProps } from './StyleHistory';

export { default as SelectiveStyleCopy } from './SelectiveStyleCopy';
export type { StylePropertyGroup, StylePropertyDefinition, SelectiveStyleCopyProps } from './SelectiveStyleCopy';

// Commands for undo/redo system
export {
  default as StyleTransferCommand,
  StyleCopyCommand,
  SelectiveStyleTransferCommand,
  BatchStyleTransferCommand,
  StyleTransferCommandFactory
} from '../core/commands/StyleTransferCommand';

// CSS import
import './StyleTransfer.css';

// Utility types
export type { ElementStyle } from '../../types/diagram';

/**
 * Style Transfer System for OpenChart
 *
 * This module provides comprehensive style copying and transfer functionality:
 *
 * Features:
 * - 📋 Style Clipboard: Copy/paste styles with persistence
 * - 🎨 Style Pipette: Pick styles from any element with visual feedback
 * - 🖌️ Format Painter: Apply styles to multiple elements (single or persistent mode)
 * - 📚 Style History: Track and reuse recently used styles with favorites
 * - ⚙️ Selective Copying: Choose specific style properties to copy
 * - ⌨️ Keyboard Shortcuts: Ctrl+Shift+C/V for copy/paste, P for pipette, F for painter
 * - 🔄 Undo/Redo Support: Full command system integration
 * - 📱 Visual Feedback: Hover previews, success messages, and status indicators
 *
 * Quick Start:
 * ```tsx
 * import { StyleTransfer } from './components/StyleTransfer';
 *
 * <StyleTransfer
 *   elements={diagramElements}
 *   selectedElementIds={selectedIds}
 *   onStyleTransfer={handleStyleTransfer}
 *   onExecuteCommand={handleCommand}
 * />
 * ```
 *
 * Individual components can also be used separately:
 * ```tsx
 * import { StyleClipboard, StylePipette, FormatPainter } from './components/StyleTransfer';
 * ```
 *
 * Keyboard Shortcuts:
 * - Ctrl+Shift+C: Copy style from selected element
 * - Ctrl+Shift+V: Paste style to selected elements
 * - P: Toggle style pipette
 * - F: Toggle format painter
 * - Escape: Cancel active mode
 */