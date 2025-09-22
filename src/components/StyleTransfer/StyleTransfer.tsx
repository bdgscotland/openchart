import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Paste, Pipette, PaintBucket, History, Settings, X, Check } from 'lucide-react';
import { StyleClipboard, useStyleClipboard, type CopiedStyle } from './StyleClipboard';
import { StylePipette, useStylePipette } from './StylePipette';
import { FormatPainter, useFormatPainter } from './FormatPainter';
import { StyleHistory, useStyleHistory } from './StyleHistory';
import { SelectiveStyleCopy } from './SelectiveStyleCopy';
import {
  StyleTransferCommand,
  SelectiveStyleTransferCommand,
  StyleTransferCommandFactory
} from '../../core/commands/StyleTransferCommand';
import type { ElementStyle, DiagramElement } from '../../types/diagram';

export interface StyleTransferProps {
  elements: DiagramElement[];
  selectedElementIds: string[];
  onStyleTransfer?: (elementIds: string[], style: ElementStyle, transferType: 'copy' | 'paste' | 'pipette' | 'format-painter') => void;
  onSelectiveStyleTransfer?: (elementIds: string[], styleProperties: Partial<ElementStyle>, propertyNames: string[]) => void;
  onExecuteCommand?: (command: StyleTransferCommand | SelectiveStyleTransferCommand) => void;
  className?: string;
}

export interface StyleTransferState {
  activeMode: 'none' | 'pipette' | 'format-painter' | 'selective-copy';
  showHistory: boolean;
  showSelectiveCopy: boolean;
  selectiveCopySource: ElementStyle | null;
  lastCopiedStyle: CopiedStyle | null;
  isVisible: boolean;
}

/**
 * StyleTransfer - Main component integrating all style transfer functionality
 * Provides copy/paste, pipette, format painter, and style history
 */
export const StyleTransfer: React.FC<StyleTransferProps> = ({
  elements,
  selectedElementIds,
  onStyleTransfer,
  onSelectiveStyleTransfer,
  onExecuteCommand,
  className = '',
}) => {
  const [state, setState] = useState<StyleTransferState>({
    activeMode: 'none',
    showHistory: false,
    showSelectiveCopy: false,
    selectiveCopySource: null,
    lastCopiedStyle: null,
    isVisible: true,
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Hooks for individual components
  const styleClipboard = useStyleClipboard();
  const stylePipette = useStylePipette();
  const formatPainter = useFormatPainter();
  const styleHistory = useStyleHistory(50);

  // Get currently selected elements
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  const hasSelection = selectedElements.length > 0;
  const singleSelection = selectedElements.length === 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Style copy (Ctrl+Shift+C / Cmd+Shift+C)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'c') {
        event.preventDefault();
        handleCopyStyle();
      }

      // Style paste (Ctrl+Shift+V / Cmd+Shift+V)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'v') {
        event.preventDefault();
        handlePasteStyle();
      }

      // Toggle style pipette (P key)
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        toggleStylePipette();
      }

      // Toggle format painter (F key)
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        toggleFormatPainter();
      }

      // Escape to cancel active modes
      if (event.key === 'Escape') {
        cancelActiveModes();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Copy style from selected element
  const handleCopyStyle = useCallback(() => {
    if (!singleSelection) return;

    const sourceElement = selectedElements[0];
    const copiedStyle = styleClipboard.copyStyle(
      sourceElement.style,
      sourceElement.id,
      sourceElement.type
    );

    // Add to history
    styleHistory.addToHistory(
      sourceElement.style,
      sourceElement.id,
      sourceElement.type
    );

    setState(prev => ({ ...prev, lastCopiedStyle: copiedStyle }));
    showSuccess('Style copied to clipboard!');
  }, [singleSelection, selectedElements, styleClipboard, styleHistory]);

  // Paste style to selected elements
  const handlePasteStyle = useCallback(() => {
    if (!hasSelection) return;

    const style = styleClipboard.pasteStyle();
    if (!style) return;

    const targetIds = selectedElementIds;
    onStyleTransfer?.(targetIds, style, 'paste');

    // Create command for undo/redo
    if (onExecuteCommand) {
      const command = StyleTransferCommandFactory.createStyleTransfer(
        targetIds,
        style,
        elements.filter(el => targetIds.includes(el.id)),
        'paste'
      );
      onExecuteCommand(command);
    }

    // Add to history
    styleHistory.addToHistory(style, undefined, 'pasted-style');
    showSuccess(`Style applied to ${targetIds.length} element(s)!`);
  }, [hasSelection, selectedElementIds, styleClipboard, onStyleTransfer, onExecuteCommand, elements, styleHistory]);

  // Toggle style pipette
  const toggleStylePipette = useCallback(() => {
    if (state.activeMode === 'pipette') {
      setState(prev => ({ ...prev, activeMode: 'none' }));
      stylePipette.deactivate();
    } else {
      setState(prev => ({ ...prev, activeMode: 'pipette' }));
      stylePipette.activate();
    }
  }, [state.activeMode, stylePipette]);

  // Handle style picked with pipette
  const handleStylePicked = useCallback((style: ElementStyle, sourceElement: DiagramElement) => {
    // Apply to currently selected elements (excluding the source)
    const targetIds = selectedElementIds.filter(id => id !== sourceElement.id);

    if (targetIds.length > 0) {
      onStyleTransfer?.(targetIds, style, 'pipette');

      // Create command for undo/redo
      if (onExecuteCommand) {
        const command = StyleTransferCommandFactory.createStyleTransfer(
          targetIds,
          style,
          elements.filter(el => targetIds.includes(el.id)),
          'pipette'
        );
        onExecuteCommand(command);
      }

      showSuccess(`Style picked and applied to ${targetIds.length} element(s)!`);
    } else {
      // Just copy the style if no valid targets
      styleClipboard.copyStyle(style, sourceElement.id, sourceElement.type);
      showSuccess('Style picked and copied to clipboard!');
    }

    // Add to history
    styleHistory.addToHistory(style, sourceElement.id, sourceElement.type);

    // Deactivate pipette
    setState(prev => ({ ...prev, activeMode: 'none' }));
  }, [selectedElementIds, onStyleTransfer, onExecuteCommand, elements, styleClipboard, styleHistory]);

  // Toggle format painter
  const toggleFormatPainter = useCallback(() => {
    if (state.activeMode === 'format-painter') {
      setState(prev => ({ ...prev, activeMode: 'none' }));
      formatPainter.deactivate();
    } else if (singleSelection) {
      const sourceElement = selectedElements[0];
      formatPainter.setSourceStyle(sourceElement.style, sourceElement.id);
      formatPainter.activate();
      setState(prev => ({ ...prev, activeMode: 'format-painter' }));
    }
  }, [state.activeMode, formatPainter, singleSelection, selectedElements]);

  // Handle format painter application
  const handleFormatPainterApply = useCallback((elementId: string, style: ElementStyle) => {
    onStyleTransfer?.([elementId], style, 'format-painter');

    // Create command for undo/redo
    if (onExecuteCommand) {
      const command = StyleTransferCommandFactory.createStyleTransfer(
        [elementId],
        style,
        elements.filter(el => el.id === elementId),
        'format-painter'
      );
      onExecuteCommand(command);
    }

    // Add to history
    styleHistory.addToHistory(style);
    showSuccess('Style painted!');
  }, [onStyleTransfer, onExecuteCommand, elements, styleHistory]);

  // Show selective copy dialog
  const showSelectiveCopy = useCallback(() => {
    if (!singleSelection) return;

    setState(prev => ({
      ...prev,
      showSelectiveCopy: true,
      selectiveCopySource: selectedElements[0].style,
    }));
  }, [singleSelection, selectedElements]);

  // Handle selective style copy
  const handleSelectiveStyleCopy = useCallback((selectedProperties: Partial<ElementStyle>, propertyNames: string[]) => {
    // Copy to clipboard
    styleClipboard.copyStyle(selectedProperties as ElementStyle);

    // Apply to other selected elements if any
    const targetIds = selectedElementIds.slice(1); // Exclude the source element
    if (targetIds.length > 0) {
      onSelectiveStyleTransfer?.(targetIds, selectedProperties, propertyNames);

      // Create command for undo/redo
      if (onExecuteCommand) {
        const command = StyleTransferCommandFactory.createSelectiveStyleTransfer(
          targetIds,
          selectedProperties,
          propertyNames,
          elements.filter(el => targetIds.includes(el.id))
        );
        onExecuteCommand(command);
      }

      showSuccess(`${propertyNames.length} style properties applied to ${targetIds.length} element(s)!`);
    } else {
      showSuccess(`${propertyNames.length} style properties copied to clipboard!`);
    }

    // Add to history
    styleHistory.addToHistory(selectedProperties as ElementStyle);

    // Close dialog
    setState(prev => ({
      ...prev,
      showSelectiveCopy: false,
      selectiveCopySource: null,
    }));
  }, [selectedElementIds, onSelectiveStyleTransfer, onExecuteCommand, elements, styleClipboard, styleHistory]);

  // Cancel active modes
  const cancelActiveModes = useCallback(() => {
    setState(prev => ({ ...prev, activeMode: 'none', showSelectiveCopy: false }));
    stylePipette.deactivate();
    formatPainter.deactivate();
  }, [stylePipette, formatPainter]);

  // Show success message
  const showSuccess = useCallback((message: string) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  if (!state.isVisible) {
    return (
      <div className={`style-transfer-minimized ${className}`}>
        <button
          className="style-transfer-show-button"
          onClick={toggleVisibility}
          title="Show Style Transfer Tools"
        >
          <PaintBucket size={20} />
        </button>
      </div>
    );
  }

  return (
    <div ref={mainRef} className={`style-transfer ${className}`}>
      {/* Header */}
      <div className="style-transfer-header">
        <div className="style-transfer-title">
          <PaintBucket size={18} />
          <span>Style Transfer</span>
        </div>
        <button
          className="style-transfer-hide-button"
          onClick={toggleVisibility}
          title="Hide Style Transfer Tools"
        >
          <X size={16} />
        </button>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <div className="style-transfer-success">
          <Check size={16} />
          <span>{showSuccessMessage}</span>
        </div>
      )}

      {/* Main toolbar */}
      <div className="style-transfer-toolbar">
        {/* Copy style */}
        <button
          className={`style-transfer-button copy-style ${singleSelection ? 'enabled' : 'disabled'}`}
          onClick={handleCopyStyle}
          disabled={!singleSelection}
          title={singleSelection ? 'Copy style (Ctrl+Shift+C)' : 'Select one element to copy its style'}
        >
          <Copy size={16} />
          <span>Copy</span>
        </button>

        {/* Paste style */}
        <button
          className={`style-transfer-button paste-style ${hasSelection && styleClipboard.hasValidStyle ? 'enabled' : 'disabled'}`}
          onClick={handlePasteStyle}
          disabled={!hasSelection || !styleClipboard.hasValidStyle}
          title={hasSelection && styleClipboard.hasValidStyle ? 'Paste style (Ctrl+Shift+V)' : 'Select elements and copy a style first'}
        >
          <Paste size={16} />
          <span>Paste</span>
        </button>

        {/* Style pipette */}
        <button
          className={`style-transfer-button pipette ${state.activeMode === 'pipette' ? 'active' : ''}`}
          onClick={toggleStylePipette}
          title="Style Pipette - Pick style from any element (P)"
        >
          <Pipette size={16} />
          <span>Pick</span>
        </button>

        {/* Format painter */}
        <button
          className={`style-transfer-button format-painter ${state.activeMode === 'format-painter' ? 'active' : ''} ${singleSelection ? 'enabled' : 'disabled'}`}
          onClick={toggleFormatPainter}
          disabled={!singleSelection}
          title={singleSelection ? 'Format Painter (F)' : 'Select one element as source'}
        >
          <PaintBucket size={16} />
          <span>Paint</span>
        </button>

        {/* Selective copy */}
        <button
          className={`style-transfer-button selective-copy ${singleSelection ? 'enabled' : 'disabled'}`}
          onClick={showSelectiveCopy}
          disabled={!singleSelection}
          title={singleSelection ? 'Choose which style properties to copy' : 'Select one element first'}
        >
          <Settings size={16} />
          <span>Select</span>
        </button>

        {/* Style history */}
        <button
          className={`style-transfer-button history-toggle ${state.showHistory ? 'active' : ''}`}
          onClick={() => setState(prev => ({ ...prev, showHistory: !prev.showHistory }))}
          title="Show style history"
        >
          <History size={16} />
          <span>History</span>
        </button>
      </div>

      {/* Active components */}
      <div className="style-transfer-content">
        {/* Style clipboard (always visible for status) */}
        <StyleClipboard />

        {/* Style pipette */}
        {state.activeMode === 'pipette' && (
          <StylePipette
            elements={elements}
            isActive={true}
            onStylePicked={handleStylePicked}
            onActiveStateChange={(isActive) => {
              if (!isActive) setState(prev => ({ ...prev, activeMode: 'none' }));
            }}
          />
        )}

        {/* Format painter */}
        {state.activeMode === 'format-painter' && formatPainter.hasSourceStyle && (
          <FormatPainter
            elements={elements}
            selectedElementIds={selectedElementIds}
            isActive={true}
            sourceStyle={formatPainter.painterState.sourceStyle}
            onStyleApply={handleFormatPainterApply}
            onActiveStateChange={(isActive) => {
              if (!isActive) setState(prev => ({ ...prev, activeMode: 'none' }));
            }}
          />
        )}

        {/* Style history */}
        {state.showHistory && (
          <StyleHistory
            onStyleSelect={(style, entry) => {
              styleClipboard.copyStyle(style, entry.sourceElementId, entry.sourceElementType);
            }}
            onStyleApply={(style) => {
              if (hasSelection) {
                onStyleTransfer?.(selectedElementIds, style, 'paste');
                showSuccess(`Style applied to ${selectedElementIds.length} element(s)!`);
              }
            }}
          />
        )}

        {/* Selective style copy dialog */}
        {state.showSelectiveCopy && state.selectiveCopySource && (
          <div className="style-transfer-modal-overlay">
            <div className="style-transfer-modal">
              <SelectiveStyleCopy
                sourceStyle={state.selectiveCopySource}
                onStyleCopy={handleSelectiveStyleCopy}
                onCancel={() => setState(prev => ({
                  ...prev,
                  showSelectiveCopy: false,
                  selectiveCopySource: null,
                }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="style-transfer-shortcuts">
        <small>
          Shortcuts: Ctrl+Shift+C (copy) • Ctrl+Shift+V (paste) • P (pick) • F (paint) • Esc (cancel)
        </small>
      </div>
    </div>
  );
};

// Hook for external usage
export const useStyleTransfer = () => {
  const styleClipboard = useStyleClipboard();
  const stylePipette = useStylePipette();
  const formatPainter = useFormatPainter();
  const styleHistory = useStyleHistory();

  return {
    styleClipboard,
    stylePipette,
    formatPainter,
    styleHistory,
  };
};

export default StyleTransfer;