// KeyboardShortcutsHandler - Global keyboard shortcut integration
// Connects keyboard shortcuts to undo/redo and other operations

import { useEffect } from 'react';
import { useUndoRedo } from '../../contexts/UndoRedoContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHandlerProps {
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDuplicate?: () => void;
  onSave?: () => void;
}

/**
 * Component that handles global keyboard shortcuts for the application
 * Place this at the top level of your app to enable keyboard shortcuts
 */
export const KeyboardShortcutsHandler: React.FC<KeyboardShortcutsHandlerProps> = ({
  onCopy,
  onPaste,
  onCut,
  onDelete,
  onSelectAll,
  onDuplicate,
  onSave,
}) => {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: canUndo ? undo : undefined,
    onRedo: canRedo ? redo : undefined,
    onCopy,
    onPaste,
    onCut,
    onDelete,
    onSelectAll,
    onDuplicate,
    onSave,
  });

  // Log keyboard shortcut availability
  useEffect(() => {
    console.log('⌨️ Keyboard shortcuts active:', {
      undo: canUndo,
      redo: canRedo,
    });
  }, [canUndo, canRedo]);

  return null; // This component doesn't render anything
};
