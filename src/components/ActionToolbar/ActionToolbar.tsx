import React, { useCallback, useState, useEffect } from 'react';
import {
  Undo,
  Redo,
  Trash2,
  ChevronUp,
  ChevronDown,
  Minus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Workflow,
  GitBranch,
} from 'lucide-react';
import './ActionToolbar.css';

export interface ActionToolbarProps {
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;

  // Selection and deletion
  hasSelection: boolean;
  onDelete: () => void;

  // Layer management
  onBringToFront: () => void;
  onSendToBack: () => void;

  // Edge styles
  edgeStyle: 'straight' | 'curved' | 'step';
  onEdgeStyleChange: (style: 'straight' | 'curved' | 'step') => void;

  // Zoom controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;

  // Optional props for responsive design
  isCompact?: boolean;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasSelection,
  onDelete,
  onBringToFront,
  onSendToBack,
  edgeStyle,
  onEdgeStyleChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToView,
  isCompact = false,
}) => {
  const [showEdgeStyleMenu, setShowEdgeStyleMenu] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo (Ctrl+Z / Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          onUndo();
        }
      }

      // Redo (Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y)
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }

      // Delete selected elements (Delete key)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (hasSelection) {
          onDelete();
        }
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '=' || e.key === '+') {
        e.preventDefault();
        onZoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        onZoomOut();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        onFitToView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, hasSelection, onUndo, onRedo, onDelete, onZoomIn, onZoomOut, onFitToView]);

  const formatZoom = useCallback((zoom: number) => {
    return `${Math.round(zoom * 100)}%`;
  }, []);

  const handleEdgeStyleSelect = useCallback((style: 'straight' | 'curved' | 'step') => {
    onEdgeStyleChange(style);
    setShowEdgeStyleMenu(false);
  }, [onEdgeStyleChange]);

  // Close edge style menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || !(e.target as Element).closest('.edge-style-dropdown')) {
        setShowEdgeStyleMenu(false);
      }
    };

    if (showEdgeStyleMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showEdgeStyleMenu]);

  const edgeStyleIcon = () => {
    switch (edgeStyle) {
      case 'straight':
        return <Minus className="w-3 h-3" />;
      case 'curved':
        return <GitBranch className="w-3 h-3" />;
      case 'step':
        return <Workflow className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <div className={`action-toolbar ${isCompact ? 'compact' : ''}`}>
      {/* History Group */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo className="w-3 h-3" />
        </button>
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo className="w-3 h-3" />
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Edit Group */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onDelete}
          disabled={!hasSelection}
          title="Delete selected (Delete)"
          aria-label="Delete selected elements"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Layer Group */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onBringToFront}
          disabled={!hasSelection}
          title="Bring to front"
          aria-label="Bring selected elements to front"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          className="toolbar-button"
          onClick={onSendToBack}
          disabled={!hasSelection}
          title="Send to back"
          aria-label="Send selected elements to back"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Connection Group */}
      <div className="toolbar-group">
        <div className="edge-style-dropdown">
          <button
            className="toolbar-button"
            onClick={() => setShowEdgeStyleMenu(!showEdgeStyleMenu)}
            title={`Connection style: ${edgeStyle}`}
            aria-label={`Change connection style (currently ${edgeStyle})`}
          >
            {edgeStyleIcon()}
            <span className="toolbar-text">{edgeStyle}</span>
          </button>

          {showEdgeStyleMenu && (
            <div className="edge-style-menu">
              <button
                className={`edge-style-option ${edgeStyle === 'straight' ? 'active' : ''}`}
                onClick={() => handleEdgeStyleSelect('straight')}
              >
                <Minus className="w-3 h-3" />
                <span>Straight</span>
              </button>
              <button
                className={`edge-style-option ${edgeStyle === 'curved' ? 'active' : ''}`}
                onClick={() => handleEdgeStyleSelect('curved')}
              >
                <GitBranch className="w-3 h-3" />
                <span>Curved</span>
              </button>
              <button
                className={`edge-style-option ${edgeStyle === 'step' ? 'active' : ''}`}
                onClick={() => handleEdgeStyleSelect('step')}
              >
                <Workflow className="w-3 h-3" />
                <span>Step</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-separator" />

      {/* Zoom Group */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onZoomOut}
          title="Zoom out (Ctrl+-)"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <div className="zoom-display" title="Current zoom level">
          {formatZoom(zoom)}
        </div>

        <button
          className="toolbar-button"
          onClick={onZoomIn}
          title="Zoom in (Ctrl++)"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-3 h-3" />
        </button>

        <button
          className="toolbar-button"
          onClick={onFitToView}
          title="Fit to view (Ctrl+0)"
          aria-label="Fit diagram to view"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ActionToolbar;