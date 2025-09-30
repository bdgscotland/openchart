import React, { useState, useCallback, useMemo } from 'react';
import { Layers, Search, Eye, EyeOff, Lock, Unlock, Trash2, X, Plus } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { useLayers } from '../../contexts/LayerContext';
import './LayersPanel.css';

interface LayersPanelProps {
  nodes: Node[];
  onNodesChange: React.Dispatch<React.SetStateAction<Node[]>>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  nodes,
  onNodesChange,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    getLayers,
    getActiveLayer,
    setActiveLayer,
    createLayer,
    deleteLayer,
    renameLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
  } = useLayers();

  const layers = getLayers();
  const activeLayer = getActiveLayer();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [opacitySliderLayerId, setOpacitySliderLayerId] = useState<string | null>(null);

  // Filter layers based on search term
  const filteredLayers = useMemo(() => {
    if (!searchTerm) return layers;

    const term = searchTerm.toLowerCase();
    return layers.filter(layer => {
      const nameMatch = layer.name.toLowerCase().includes(term);
      const itemCount = nodes.filter(n => n.data?.layerId === layer.id).length;
      return nameMatch || `${itemCount}`.includes(term);
    });
  }, [layers, searchTerm, nodes]);

  // Get node count for a specific layer
  const getLayerNodeCount = useCallback((layerId: string) => {
    return nodes.filter(n => n.data?.layerId === layerId).length;
  }, [nodes]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Handle layer click to make it active
  const handleLayerClick = useCallback((layerId: string) => {
    setActiveLayer(layerId);
  }, [setActiveLayer]);

  // Handle double-click to start renaming
  const handleLayerDoubleClick = useCallback((layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditingName(currentName);
  }, []);

  // Handle rename submission
  const handleRenameSubmit = useCallback(() => {
    if (editingLayerId && editingName.trim()) {
      renameLayer(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  }, [editingLayerId, editingName, renameLayer]);

  // Handle rename cancel
  const handleRenameCancel = useCallback(() => {
    setEditingLayerId(null);
    setEditingName('');
  }, []);

  // Handle opacity slider toggle
  const handleOpacityClick = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpacitySliderLayerId(prev => prev === layerId ? null : layerId);
  }, []);

  // Handle opacity change
  const handleOpacityChange = useCallback((layerId: string, value: number) => {
    setLayerOpacity(layerId, value);
  }, [setLayerOpacity]);

  // Handle delete layer
  const handleDeleteLayer = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (layerId === 'layer-default') {
      return; // Can't delete default layer
    }
    if (confirm(`Delete layer? All items will be moved to the default layer.`)) {
      deleteLayer(layerId);
    }
  }, [deleteLayer]);

  // Handle visibility toggle
  const handleVisibilityToggle = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayerVisibility(layerId);
  }, [toggleLayerVisibility]);

  // Handle lock toggle
  const handleLockToggle = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayerLock(layerId);
  }, [toggleLayerLock]);

  // Handle new layer creation
  const handleCreateLayer = useCallback(() => {
    createLayer();
  }, [createLayer]);

  // Batch operations
  const hideAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (layer.visible) {
        toggleLayerVisibility(layer.id);
      }
    });
  }, [layers, toggleLayerVisibility]);

  const showAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (!layer.visible) {
        toggleLayerVisibility(layer.id);
      }
    });
  }, [layers, toggleLayerVisibility]);

  const lockAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (!layer.locked) {
        toggleLayerLock(layer.id);
      }
    });
  }, [layers, toggleLayerLock]);

  const unlockAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (layer.locked) {
        toggleLayerLock(layer.id);
      }
    });
  }, [layers, toggleLayerLock]);

  // Summary stats
  const visibleCount = layers.filter(l => l.visible).length;
  const lockedCount = layers.filter(l => l.locked).length;

  if (isCollapsed) {
    return (
      <div className="layers-panel collapsed">
        <button
          className="layers-panel-toggle"
          onClick={onToggleCollapse}
          title="Show Layers Panel"
        >
          <Layers size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="layers-panel">
      {/* Header */}
      <div className="layers-panel-header">
        <div className="layers-panel-title">
          <Layers size={16} />
          <span>Layers</span>
          <span className="layers-panel-count">({layers.length})</span>
        </div>
        {onToggleCollapse && (
          <button
            className="layers-panel-collapse-btn"
            onClick={onToggleCollapse}
            title="Collapse panel"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="layers-panel-search">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search layers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="search-clear"
            onClick={clearSearch}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="layers-panel-toolbar">
        <div className="toolbar-group">
          <button onClick={showAllLayers} title="Show all layers" className="toolbar-btn">
            <Eye size={14} />
          </button>
          <button onClick={hideAllLayers} title="Hide all layers" className="toolbar-btn">
            <EyeOff size={14} />
          </button>
        </div>
        <div className="toolbar-group">
          <button onClick={unlockAllLayers} title="Unlock all layers" className="toolbar-btn">
            <Unlock size={14} />
          </button>
          <button onClick={lockAllLayers} title="Lock all layers" className="toolbar-btn">
            <Lock size={14} />
          </button>
        </div>
        <div className="toolbar-group">
          <button
            onClick={handleCreateLayer}
            title="Create new layer"
            className="toolbar-btn"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Layer stats */}
      <div className="layers-panel-stats">
        <span>{visibleCount} visible</span>
        <span>•</span>
        <span>{lockedCount} locked</span>
      </div>

      {/* Layers list */}
      <div className="layers-panel-list">
        {filteredLayers.length === 0 ? (
          <div className="layers-panel-empty">
            {searchTerm ? (
              <>
                <Search size={32} />
                <p>No layers match "{searchTerm}"</p>
                <button onClick={clearSearch} className="clear-search-btn">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Layers size={32} />
                <p>No layers yet</p>
                <p className="empty-hint">Click + to create a layer</p>
              </>
            )}
          </div>
        ) : (
          filteredLayers.map((layer) => {
            const isActive = activeLayer.id === layer.id;
            const nodeCount = getLayerNodeCount(layer.id);
            const isEditing = editingLayerId === layer.id;
            const showOpacitySlider = opacitySliderLayerId === layer.id;
            const isDefaultLayer = layer.id === 'layer-default';

            return (
              <div
                key={layer.id}
                className={`layer-item ${isActive ? 'selected' : ''} ${!layer.visible ? 'hidden' : ''}`}
                onClick={() => handleLayerClick(layer.id)}
                onDoubleClick={() => handleLayerDoubleClick(layer.id, layer.name)}
              >
                {/* Layer icon */}
                <div className="layer-item-thumbnail">
                  <Layers size={14} />
                </div>

                {/* Layer content */}
                <div className="layer-item-content">
                  {isEditing ? (
                    <input
                      type="text"
                      className="layer-item-name-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit();
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="layer-item-name">{layer.name}</div>
                  )}
                  <div className="layer-item-type">{nodeCount} items</div>
                </div>

                {/* Layer controls */}
                <div className="layer-item-controls">
                  {/* Opacity control */}
                  <div className="opacity-control">
                    <button
                      className="layer-item-control"
                      onClick={(e) => handleOpacityClick(layer.id, e)}
                      title={`Opacity: ${Math.round(layer.opacity * 100)}%`}
                    >
                      <div className="opacity-display">{Math.round(layer.opacity * 100)}%</div>
                    </button>
                    {showOpacitySlider && (
                      <div className="opacity-slider-container">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={layer.opacity}
                          onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                          className="opacity-slider"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>

                  {/* Visibility toggle */}
                  <button
                    className="layer-item-control"
                    onClick={(e) => handleVisibilityToggle(layer.id, e)}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  {/* Lock toggle */}
                  <button
                    className="layer-item-control"
                    onClick={(e) => handleLockToggle(layer.id, e)}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>

                  {/* Delete button (disabled for default layer) */}
                  <button
                    className="layer-item-control"
                    onClick={(e) => handleDeleteLayer(layer.id, e)}
                    title={isDefaultLayer ? 'Cannot delete default layer' : 'Delete layer'}
                    disabled={isDefaultLayer}
                    style={{ opacity: isDefaultLayer ? 0.3 : 1 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};