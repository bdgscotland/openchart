// useKeyboardShortcuts - Centralized keyboard shortcut handling
// Includes undo/redo shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)

import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDuplicate?: () => void;
  onSave?: () => void;
}

/**
 * Detect if Ctrl key is pressed (Cmd on Mac)
 */
const isCtrlOrCmd = (event: KeyboardEvent): boolean => {
  return event.ctrlKey || event.metaKey;
};

/**
 * Check if undo shortcut is pressed
 * Windows/Linux: Ctrl+Z
 * Mac: Cmd+Z
 */
export const isUndoShortcut = (event: KeyboardEvent): boolean => {
  return isCtrlOrCmd(event) && event.key === 'z' && !event.shiftKey;
};

/**
 * Check if redo shortcut is pressed
 * Windows/Linux: Ctrl+Y or Ctrl+Shift+Z
 * Mac: Cmd+Y or Cmd+Shift+Z
 */
export const isRedoShortcut = (event: KeyboardEvent): boolean => {
  return (
    (isCtrlOrCmd(event) && event.key === 'y') ||
    (isCtrlOrCmd(event) && event.key === 'z' && event.shiftKey)
  );
};

/**
 * Hook for handling keyboard shortcuts
 */
export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Undo: Ctrl+Z (Cmd+Z on Mac)
      if (isUndoShortcut(event) && handlers.onUndo) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Undo');
        handlers.onUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z (Cmd+Y or Cmd+Shift+Z on Mac)
      if (isRedoShortcut(event) && handlers.onRedo) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Redo');
        handlers.onRedo();
        return;
      }

      // Only handle remaining shortcuts if not in input field
      if (isInputField) {
        return;
      }

      // Copy: Ctrl+C (Cmd+C on Mac)
      if (isCtrlOrCmd(event) && event.key === 'c' && handlers.onCopy) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Copy');
        handlers.onCopy();
        return;
      }

      // Paste: Ctrl+V (Cmd+V on Mac)
      if (isCtrlOrCmd(event) && event.key === 'v' && handlers.onPaste) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Paste');
        handlers.onPaste();
        return;
      }

      // Cut: Ctrl+X (Cmd+X on Mac)
      if (isCtrlOrCmd(event) && event.key === 'x' && handlers.onCut) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Cut');
        handlers.onCut();
        return;
      }

      // Delete: Delete or Backspace
      if ((event.key === 'Delete' || event.key === 'Backspace') && handlers.onDelete) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Delete');
        handlers.onDelete();
        return;
      }

      // Select All: Ctrl+A (Cmd+A on Mac)
      if (isCtrlOrCmd(event) && event.key === 'a' && handlers.onSelectAll) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Select All');
        handlers.onSelectAll();
        return;
      }

      // Duplicate: Ctrl+D (Cmd+D on Mac)
      if (isCtrlOrCmd(event) && event.key === 'd' && handlers.onDuplicate) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Duplicate');
        handlers.onDuplicate();
        return;
      }

      // Save: Ctrl+S (Cmd+S on Mac)
      if (isCtrlOrCmd(event) && event.key === 's' && handlers.onSave) {
        event.preventDefault();
        console.log('⌨️ Keyboard shortcut: Save');
        handlers.onSave();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

/**
 * Get platform-specific shortcut display text
 */
export const getShortcutText = (shortcut: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  return shortcut
    .replace('Ctrl', cmdKey)
    .replace('Cmd', cmdKey)
    .replace('Shift', '⇧')
    .replace('Alt', isMac ? '⌥' : 'Alt')
    .replace('+', ' + ');
};
