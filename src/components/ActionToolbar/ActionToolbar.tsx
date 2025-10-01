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
  Grid3X3,
  Link,
  Layers,
  BringToFront,
  SendToBack,
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
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;

  // Edge styles
  edgeStyle: 'straight' | 'curved' | 'step';
  onEdgeStyleChange: (style: 'straight' | 'curved' | 'step') => void;

  // Zoom controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;

  // Canvas settings
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  connectionMode: 'loose' | 'strict';
  onToggleConnectionMode: () => void;

  // Event Storm settings
  mode?: 'diagram' | 'eventStorm';
  eventStormPhase?: 'big-picture' | 'process-modeling' | 'software-design';
  onEventStormPhaseChange?: (phase: 'big-picture' | 'process-modeling' | 'software-design') => void;

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
  onBringForward,
  onSendBackward,
  onSendToBack,
  edgeStyle,
  onEdgeStyleChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToView,
  snapToGrid,
  onToggleSnapToGrid,
  connectionMode,
  onToggleConnectionMode,
  mode,
  eventStormPhase = 'big-picture',
  onEventStormPhaseChange,
  isCompact = false,
}) => {
  const [showEdgeStyleMenu, setShowEdgeStyleMenu] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

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

  // Close layer menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || !(e.target as Element).closest('.layer-dropdown')) {
        setShowLayerMenu(false);
      }
    };

    if (showLayerMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showLayerMenu]);

  const edgeStyleIcon = () => {
    switch (edgeStyle) {
      case 'straight':
        return <Minus className="w-1.5 h-1.5" />;
      case 'curved':
        return <GitBranch className="w-1.5 h-1.5" />;
      case 'step':
        return <Workflow className="w-1.5 h-1.5" />;
      default:
        return <Minus className="w-1.5 h-1.5" />;
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
          <Undo className="w-1.5 h-1.5" />
        </button>
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo className="w-1.5 h-1.5" />
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
          <Trash2 className="w-1.5 h-1.5" />
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Layer Group */}
      <div className="toolbar-group">
        <div className="layer-dropdown">
          <button
            className="toolbar-button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            disabled={!hasSelection}
            title="Layer order"
            aria-label="Change layer order"
          >
            <Layers className="w-1.5 h-1.5" />
            <span className="toolbar-text">Layers</span>
          </button>

          {showLayerMenu && hasSelection && (
            <div className="edge-style-menu">
              <button
                className="edge-style-option"
                onClick={() => {
                  onBringToFront();
                  setShowLayerMenu(false);
                }}
              >
                <BringToFront className="w-1.5 h-1.5" />
                <span>Bring to Front</span>
                <span className="shortcut">Ctrl+Shift+]</span>
              </button>
              <button
                className="edge-style-option"
                onClick={() => {
                  onBringForward();
                  setShowLayerMenu(false);
                }}
              >
                <ChevronUp className="w-1.5 h-1.5" />
                <span>Bring Forward</span>
                <span className="shortcut">Ctrl+]</span>
              </button>
              <button
                className="edge-style-option"
                onClick={() => {
                  onSendBackward();
                  setShowLayerMenu(false);
                }}
              >
                <ChevronDown className="w-1.5 h-1.5" />
                <span>Send Backward</span>
                <span className="shortcut">Ctrl+[</span>
              </button>
              <button
                className="edge-style-option"
                onClick={() => {
                  onSendToBack();
                  setShowLayerMenu(false);
                }}
              >
                <SendToBack className="w-1.5 h-1.5" />
                <span>Send to Back</span>
                <span className="shortcut">Ctrl+Shift+[</span>
              </button>
            </div>
          )}
        </div>
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
                <Minus className="w-1.5 h-1.5" />
                <span>Straight</span>
              </button>
              <button
                className={`edge-style-option ${edgeStyle === 'curved' ? 'active' : ''}`}
                onClick={() => handleEdgeStyleSelect('curved')}
              >
                <GitBranch className="w-1.5 h-1.5" />
                <span>Curved</span>
              </button>
              <button
                className={`edge-style-option ${edgeStyle === 'step' ? 'active' : ''}`}
                onClick={() => handleEdgeStyleSelect('step')}
              >
                <Workflow className="w-1.5 h-1.5" />
                <span>Step</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-separator" />

      {/* Canvas Settings Group */}
      <div className="toolbar-group">
        <button
          className={`toolbar-button ${snapToGrid ? 'active' : ''}`}
          onClick={onToggleSnapToGrid}
          title="Snap to Grid (20px)"
          aria-label="Toggle snap to grid"
        >
          <Grid3X3 className="w-1.5 h-1.5" />
          <span className="toolbar-text">Snap</span>
        </button>

        <button
          className="toolbar-button"
          onClick={onToggleConnectionMode}
          title={`Connection mode: ${connectionMode}`}
          aria-label={`Change connection mode (currently ${connectionMode})`}
        >
          <Link className="w-1.5 h-1.5" />
          <span className="toolbar-text">{connectionMode}</span>
        </button>
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
          <ZoomOut className="w-1.5 h-1.5" />
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
          <ZoomIn className="w-1.5 h-1.5" />
        </button>

        <button
          className="toolbar-button"
          onClick={onFitToView}
          title="Fit to view (Ctrl+0)"
          aria-label="Fit diagram to view"
        >
          <Maximize2 className="w-1.5 h-1.5" />
        </button>
      </div>

      {/* Event Storm Phase Switcher - only visible in Event Storm mode */}
      {mode === 'eventStorm' && onEventStormPhaseChange && (
        <>
          <div className="toolbar-separator" />

          <div className="toolbar-group phase-switcher-group">
            <span className="toolbar-text" style={{ marginRight: '8px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>
              Phase:
            </span>
            <button
              className={`toolbar-button ${eventStormPhase === 'big-picture' ? 'active' : ''}`}
              onClick={() => onEventStormPhaseChange('big-picture')}
              title="Big Picture: Explore the domain with events and actors"
              aria-label="Switch to Big Picture phase"
            >
              <span className="toolbar-text">1. Big Picture</span>
            </button>
            <button
              className={`toolbar-button ${eventStormPhase === 'process-modeling' ? 'active' : ''}`}
              onClick={() => onEventStormPhaseChange('process-modeling')}
              title="Process Modeling: Add commands, policies, and read models"
              aria-label="Switch to Process Modeling phase"
            >
              <span className="toolbar-text">2. Process Modeling</span>
            </button>
            <button
              className={`toolbar-button ${eventStormPhase === 'software-design' ? 'active' : ''}`}
              onClick={() => onEventStormPhaseChange('software-design')}
              title="Software Design: Define aggregates and bounded contexts"
              aria-label="Switch to Software Design phase"
            >
              <span className="toolbar-text">3. Software Design</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ActionToolbar;