import React, { useState, useCallback, useMemo } from 'react';
import {
  Save,
  Download,
  Upload,
  Trash2,
  Edit3,
  Copy,
  Share,
  Heart,
  Clock,
  Tag,
  User,
  Settings
} from 'lucide-react';
import { usePresetManager } from './hooks/usePresetManager';
import { PresetImportExport } from './PresetImportExport';
import type {
  StylePreset,
  PresetCollection,
  PresetCategory,
  PresetSearchFilters
} from '../../../types/stylePresets';
import type { ElementStyle } from '../../../types/diagram';
import './PresetManager.css';

export interface PresetManagerProps {
  currentStyle?: ElementStyle;
  onPresetCreated?: (preset: StylePreset) => void;
  onPresetUpdated?: (preset: StylePreset) => void;
  onPresetDeleted?: (presetId: string) => void;
  className?: string;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentStyle,
  onPresetCreated,
  onPresetUpdated,
  onPresetDeleted,
  className = '',
}) => {
  const {
    presets,
    collections,
    favorites,
    recentlyUsed,
    isLoading,
    error,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    toggleFavorite,
    createCollection,
    updateCollection,
    deleteCollection,
    exportPresets,
    importPresets,
    exportCollection,
    importCollection,
  } = usePresetManager();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingPreset, setEditingPreset] = useState<StylePreset | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<PresetCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'presets' | 'collections'>('presets');

  // Filter presets based on search and category
  const filteredPresets = useMemo(() => {
    let filtered = presets;

    if (searchTerm) {
      filtered = filtered.filter(preset =>
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(preset => preset.category === filterCategory);
    }

    return filtered;
  }, [presets, searchTerm, filterCategory]);

  // Handle preset creation
  const handleCreatePreset = useCallback(async (
    name: string,
    description: string,
    category: PresetCategory,
    tags: string[]
  ) => {
    if (!currentStyle) {
      console.error('No current style available for preset creation');
      return;
    }

    try {
      const preset = await createPreset({
        name,
        description,
        style: currentStyle,
        category,
        tags,
        isCustom: true,
        isShared: false,
      });

      onPresetCreated?.(preset);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create preset:', error);
    }
  }, [currentStyle, createPreset, onPresetCreated]);

  // Handle preset update
  const handleUpdatePreset = useCallback(async (
    presetId: string,
    updates: Partial<StylePreset>
  ) => {
    try {
      const preset = await updatePreset(presetId, updates);
      onPresetUpdated?.(preset);
      setEditingPreset(null);
    } catch (error) {
      console.error('Failed to update preset:', error);
    }
  }, [updatePreset, onPresetUpdated]);

  // Handle preset deletion
  const handleDeletePreset = useCallback(async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) {
      return;
    }

    try {
      await deletePreset(presetId);
      onPresetDeleted?.(presetId);
      setSelectedPresets(prev => prev.filter(id => id !== presetId));
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  }, [deletePreset, onPresetDeleted]);

  // Handle preset duplication
  const handleDuplicatePreset = useCallback(async (preset: StylePreset) => {
    try {
      const duplicated = await duplicatePreset(preset.id, `${preset.name} (Copy)`);
      onPresetCreated?.(duplicated);
    } catch (error) {
      console.error('Failed to duplicate preset:', error);
    }
  }, [duplicatePreset, onPresetCreated]);

  // Handle bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (selectedPresets.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedPresets.length} preset(s)?`)) {
      return;
    }

    try {
      await Promise.all(selectedPresets.map(id => deletePreset(id)));
      selectedPresets.forEach(id => onPresetDeleted?.(id));
      setSelectedPresets([]);
    } catch (error) {
      console.error('Failed to delete presets:', error);
    }
  }, [selectedPresets, deletePreset, onPresetDeleted]);

  const handleBulkExport = useCallback(async () => {
    if (selectedPresets.length === 0) return;

    try {
      const presetsToExport = presets.filter(p => selectedPresets.includes(p.id));
      const exported = await exportPresets(presetsToExport);

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `style-presets-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export presets:', error);
    }
  }, [selectedPresets, presets, exportPresets]);

  // Toggle preset selection
  const togglePresetSelection = useCallback((presetId: string) => {
    setSelectedPresets(prev =>
      prev.includes(presetId)
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId]
    );
  }, []);

  return (
    <div className={`preset-manager ${className}`}>
      {/* Header */}
      <div className="preset-manager-header">
        <div className="header-title">
          <Settings size={18} />
          <span>Preset Manager</span>
        </div>
        <div className="header-actions">
          <button
            className="action-btn primary"
            onClick={() => setShowCreateForm(true)}
            disabled={!currentStyle}
            title="Create New Preset"
          >
            <Save size={14} />
            Create
          </button>
          <button
            className="action-btn"
            onClick={() => setShowImportExport(true)}
            title="Import/Export Presets"
          >
            <Upload size={14} />
            Import/Export
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`mode-btn ${viewMode === 'presets' ? 'active' : ''}`}
          onClick={() => setViewMode('presets')}
        >
          Individual Presets
        </button>
        <button
          className={`mode-btn ${viewMode === 'collections' ? 'active' : ''}`}
          onClick={() => setViewMode('collections')}
        >
          Collections
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as PresetCategory | 'all')}
          className="category-filter"
        >
          <option value="all">All Categories</option>
          <option value="business">Business</option>
          <option value="creative">Creative</option>
          <option value="technical">Technical</option>
          <option value="flowchart">Flowchart</option>
          <option value="presentation">Presentation</option>
          <option value="wireframe">Wireframe</option>
          <option value="mindmap">Mind Map</option>
          <option value="infographic">Infographic</option>
          <option value="architecture">Architecture</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedPresets.length > 0 && (
        <div className="bulk-actions">
          <span className="selection-count">
            {selectedPresets.length} selected
          </span>
          <div className="bulk-buttons">
            <button
              className="bulk-btn"
              onClick={handleBulkExport}
              title="Export Selected"
            >
              <Download size={14} />
              Export
            </button>
            <button
              className="bulk-btn danger"
              onClick={handleBulkDelete}
              title="Delete Selected"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              className="bulk-btn"
              onClick={() => setSelectedPresets([])}
              title="Clear Selection"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="preset-manager-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading presets...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : viewMode === 'presets' ? (
          <div className="presets-list">
            {filteredPresets.length === 0 ? (
              <div className="empty-state">
                <p>No presets found</p>
                {currentStyle && (
                  <button
                    className="create-first-btn"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Your First Preset
                  </button>
                )}
              </div>
            ) : (
              filteredPresets.map(preset => (
                <div
                  key={preset.id}
                  className={`preset-item ${selectedPresets.includes(preset.id) ? 'selected' : ''}`}
                >
                  <div className="preset-info">
                    <input
                      type="checkbox"
                      checked={selectedPresets.includes(preset.id)}
                      onChange={() => togglePresetSelection(preset.id)}
                      className="preset-checkbox"
                    />
                    <div className="preset-details">
                      <h4 className="preset-name">{preset.name}</h4>
                      {preset.description && (
                        <p className="preset-description">{preset.description}</p>
                      )}
                      <div className="preset-meta">
                        <span className="preset-category">{preset.category}</span>
                        {preset.tags.length > 0 && (
                          <div className="preset-tags">
                            {preset.tags.map(tag => (
                              <span key={tag} className="preset-tag">
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {preset.usageCount && (
                          <span className="usage-count">
                            Used {preset.usageCount} times
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="preset-actions">
                    <button
                      className={`action-btn ${favorites.includes(preset.id) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(preset.id)}
                      title="Toggle Favorite"
                    >
                      <Heart size={14} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDuplicatePreset(preset)}
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => setEditingPreset(preset)}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => handleDeletePreset(preset.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="collections-list">
            {/* Collections view - simplified for now */}
            <div className="coming-soon">
              <h3>Collections</h3>
              <p>Preset collections feature coming soon!</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Preset Modal */}
      {showCreateForm && (
        <CreatePresetModal
          currentStyle={currentStyle}
          onCreatePreset={handleCreatePreset}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Preset Modal */}
      {editingPreset && (
        <EditPresetModal
          preset={editingPreset}
          onUpdatePreset={handleUpdatePreset}
          onClose={() => setEditingPreset(null)}
        />
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <PresetImportExport
          onClose={() => setShowImportExport(false)}
          onImportComplete={() => {
            setShowImportExport(false);
            // Refresh presets
          }}
        />
      )}
    </div>
  );
};

// Create Preset Modal Component
interface CreatePresetModalProps {
  currentStyle?: ElementStyle;
  onCreatePreset: (name: string, description: string, category: PresetCategory, tags: string[]) => void;
  onClose: () => void;
}

const CreatePresetModal: React.FC<CreatePresetModalProps> = ({
  currentStyle,
  onCreatePreset,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PresetCategory>('custom');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onCreatePreset(name.trim(), description.trim(), category, tagArray);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Preset</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="create-preset-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter preset name"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PresetCategory)}
              required
            >
              <option value="custom">Custom</option>
              <option value="business">Business</option>
              <option value="creative">Creative</option>
              <option value="technical">Technical</option>
              <option value="flowchart">Flowchart</option>
              <option value="presentation">Presentation</option>
              <option value="wireframe">Wireframe</option>
              <option value="mindmap">Mind Map</option>
              <option value="infographic">Infographic</option>
              <option value="architecture">Architecture</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={!name.trim()}>
              Create Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Preset Modal Component
interface EditPresetModalProps {
  preset: StylePreset;
  onUpdatePreset: (presetId: string, updates: Partial<StylePreset>) => void;
  onClose: () => void;
}

const EditPresetModal: React.FC<EditPresetModalProps> = ({
  preset,
  onUpdatePreset,
  onClose,
}) => {
  const [name, setName] = useState(preset.name);
  const [description, setDescription] = useState(preset.description || '');
  const [category, setCategory] = useState(preset.category);
  const [tags, setTags] = useState(preset.tags.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onUpdatePreset(preset.id, {
      name: name.trim(),
      description: description.trim(),
      category,
      tags: tagArray,
      modified: new Date().toISOString(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Preset</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="edit-preset-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PresetCategory)}
              required
            >
              <option value="custom">Custom</option>
              <option value="business">Business</option>
              <option value="creative">Creative</option>
              <option value="technical">Technical</option>
              <option value="flowchart">Flowchart</option>
              <option value="presentation">Presentation</option>
              <option value="wireframe">Wireframe</option>
              <option value="mindmap">Mind Map</option>
              <option value="infographic">Infographic</option>
              <option value="architecture">Architecture</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={!name.trim()}>
              Update Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PresetManager;