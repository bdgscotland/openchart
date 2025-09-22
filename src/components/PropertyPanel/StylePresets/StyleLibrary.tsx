import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Star,
  Clock,
  Tag,
  User,
  Download,
  Upload,
  Share2,
  BookOpen,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useStylePresets } from './hooks/useStylePresets';
import { PresetCard } from './PresetCard';
import { PresetSearch } from './PresetSearch';
import { PresetImportExport } from './PresetImportExport';
import type {
  StylePreset,
  PresetCollection,
  PresetCategory,
  PresetSearchFilters,
  StyleTheme,
} from '../../../types/stylePresets';
import './StyleLibrary.css';

export interface StyleLibraryProps {
  onApplyPreset: (preset: StylePreset) => void;
  onCreateCollection?: (collection: Omit<PresetCollection, 'id' | 'created'>) => void;
  onUpdateCollection?: (collectionId: string, updates: Partial<PresetCollection>) => void;
  onDeleteCollection?: (collectionId: string) => void;
  className?: string;
}

export const StyleLibrary: React.FC<StyleLibraryProps> = ({
  onApplyPreset,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  className = '',
}) => {
  const {
    presets,
    collections,
    themes,
    favorites,
    recentlyUsed,
    isLoading,
    error,
    searchPresets,
    toggleFavorite,
    exportPresets,
    importPresets,
  } = useStylePresets();

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified' | 'usage' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchFilters, setSearchFilters] = useState<PresetSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'collections' | 'themes'>('presets');
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Modal state
  const [showImportExport, setShowImportExport] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<PresetCollection | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort presets
  const filteredAndSortedPresets = useMemo(() => {
    let filtered = searchPresets(searchFilters);

    // Apply collection filter if selected
    if (selectedCollection) {
      const collection = collections.find(c => c.id === selectedCollection);
      if (collection) {
        const collectionPresetIds = collection.presets.map(p => p.id);
        filtered = filtered.filter(preset => collectionPresetIds.includes(preset.id));
      }
    }

    // Sort presets
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
          break;
        case 'modified':
          comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        case 'usage':
          comparison = (a.usageCount || 0) - (b.usageCount || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchPresets, searchFilters, selectedCollection, collections, sortBy, sortOrder]);

  // Group presets by category for grid view
  const presetsByCategory = useMemo(() => {
    const groups: Record<PresetCategory, StylePreset[]> = {
      business: [],
      creative: [],
      technical: [],
      flowchart: [],
      presentation: [],
      wireframe: [],
      mindmap: [],
      infographic: [],
      architecture: [],
      custom: [],
    };

    filteredAndSortedPresets.forEach(preset => {
      groups[preset.category].push(preset);
    });

    return groups;
  }, [filteredAndSortedPresets]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalPresets: presets.length,
      customPresets: presets.filter(p => p.isCustom).length,
      sharedPresets: presets.filter(p => p.isShared).length,
      totalCollections: collections.length,
      totalThemes: themes.length,
      favoriteCount: favorites.length,
    };
  }, [presets, collections, themes, favorites]);

  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string, isSelected: boolean) => {
    setSelectedPresets(prev => {
      if (isSelected) {
        return [...prev, presetId];
      } else {
        return prev.filter(id => id !== presetId);
      }
    });
  }, []);

  // Handle bulk operations
  const handleBulkFavorite = useCallback(() => {
    selectedPresets.forEach(presetId => {
      if (!favorites.includes(presetId)) {
        toggleFavorite(presetId);
      }
    });
    setSelectedPresets([]);
  }, [selectedPresets, favorites, toggleFavorite]);

  const handleBulkExport = useCallback(async () => {
    const presetsToExport = presets.filter(p => selectedPresets.includes(p.id));
    const exported = await exportPresets(presetsToExport);

    // Download as JSON file
    const blob = new Blob([JSON.stringify(exported, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `style-library-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSelectedPresets([]);
  }, [presets, selectedPresets, exportPresets]);

  const handleBulkAddToCollection = useCallback((collectionId: string) => {
    // Implementation would add selected presets to collection
    console.log('Adding presets to collection:', selectedPresets, collectionId);
    setSelectedPresets([]);
  }, [selectedPresets]);

  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        await importPresets(importedData);
      } catch (error) {
        console.error('Failed to import presets:', error);
      }
    };
    reader.readAsText(file);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importPresets]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  }, [sortBy]);

  if (isLoading) {
    return (
      <div className={`style-library loading ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading style library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`style-library error ${className}`}>
        <div className="error-state">
          <p>Error loading style library: {error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`style-library ${className}`}>
      {/* Header */}
      <div className="style-library-header">
        <div className="header-title">
          <BookOpen size={20} />
          <span>Style Library</span>
        </div>
        <div className="header-actions">
          <button
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import Presets"
          >
            <Upload size={14} />
            Import
          </button>
          <button
            className="action-btn"
            onClick={() => setShowImportExport(true)}
            title="Import/Export Options"
          >
            <Share2 size={14} />
            Share
          </button>
          {onCreateCollection && (
            <button
              className="action-btn primary"
              onClick={() => setShowCreateCollection(true)}
              title="Create Collection"
            >
              <Plus size={14} />
              Collection
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="library-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.totalPresets}</span>
          <span className="stat-label">Presets</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalCollections}</span>
          <span className="stat-label">Collections</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.favoriteCount}</span>
          <span className="stat-label">Favorites</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.customPresets}</span>
          <span className="stat-label">Custom</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="library-tabs">
        <button
          className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          <Grid size={14} />
          Presets ({filteredAndSortedPresets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          <Folder size={14} />
          Collections ({collections.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <Star size={14} />
          Themes ({themes.length})
        </button>
      </div>

      {/* Search and Controls */}
      <div className="library-controls">
        <div className="search-container">
          <PresetSearch
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            presetCount={filteredAndSortedPresets.length}
            compact={true}
          />
        </div>

        <div className="view-controls">
          <button
            className={`control-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Filters"
          >
            <Filter size={14} />
          </button>
          <button
            className={`control-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <Grid size={14} />
          </button>
          <button
            className={`control-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={14} />
          </button>
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="created">Created</option>
            <option value="modified">Modified</option>
            <option value="usage">Usage</option>
            <option value="rating">Rating</option>
          </select>
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
          </button>
        </div>
      </div>

      {/* Collection Selector */}
      {activeTab === 'presets' && collections.length > 0 && (
        <div className="collection-selector">
          <select
            value={selectedCollection || ''}
            onChange={(e) => setSelectedCollection(e.target.value || null)}
            className="collection-select"
          >
            <option value="">All Presets</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name} ({collection.presets.length})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedPresets.length > 0 && (
        <div className="bulk-actions">
          <span className="selection-count">
            {selectedPresets.length} selected
          </span>
          <div className="bulk-buttons">
            <button onClick={handleBulkFavorite} className="bulk-btn">
              <Heart size={14} />
              Favorite
            </button>
            <button onClick={handleBulkExport} className="bulk-btn">
              <Download size={14} />
              Export
            </button>
            {collections.length > 0 && (
              <select
                onChange={(e) => e.target.value && handleBulkAddToCollection(e.target.value)}
                className="bulk-collection-select"
                defaultValue=""
              >
                <option value="">Add to Collection...</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setSelectedPresets([])}
              className="bulk-btn"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="library-content">
        {activeTab === 'presets' && (
          <div className="presets-content">
            {filteredAndSortedPresets.length === 0 ? (
              <div className="empty-state">
                <Grid size={48} />
                <h3>No Presets Found</h3>
                <p>
                  {Object.keys(searchFilters).length > 0
                    ? 'Try adjusting your search filters'
                    : 'Import presets or create your first preset'
                  }
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="presets-grid">
                {Object.entries(presetsByCategory).map(([category, categoryPresets]) => {
                  if (categoryPresets.length === 0) return null;

                  return (
                    <div key={category} className="preset-category-section">
                      <h4 className="category-header">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        <span className="category-count">({categoryPresets.length})</span>
                      </h4>
                      <div className="category-presets-grid">
                        {categoryPresets.map(preset => (
                          <PresetCard
                            key={preset.id}
                            preset={preset}
                            viewMode="grid"
                            isFavorite={favorites.includes(preset.id)}
                            isRecent={recentlyUsed.includes(preset.id)}
                            isSelected={selectedPresets.includes(preset.id)}
                            onApply={() => onApplyPreset(preset)}
                            onToggleFavorite={() => toggleFavorite(preset.id)}
                            onSelect={(selected) => handlePresetSelect(preset.id, selected)}
                            showSelection={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="presets-list">
                {filteredAndSortedPresets.map(preset => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    viewMode="list"
                    isFavorite={favorites.includes(preset.id)}
                    isRecent={recentlyUsed.includes(preset.id)}
                    isSelected={selectedPresets.includes(preset.id)}
                    onApply={() => onApplyPreset(preset)}
                    onToggleFavorite={() => toggleFavorite(preset.id)}
                    onSelect={(selected) => handlePresetSelect(preset.id, selected)}
                    showSelection={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="collections-content">
            {collections.length === 0 ? (
              <div className="empty-state">
                <Folder size={48} />
                <h3>No Collections</h3>
                <p>Create collections to organize your presets</p>
                {onCreateCollection && (
                  <button
                    className="create-collection-btn"
                    onClick={() => setShowCreateCollection(true)}
                  >
                    Create First Collection
                  </button>
                )}
              </div>
            ) : (
              <div className="collections-grid">
                {collections.map(collection => (
                  <div key={collection.id} className="collection-card">
                    <div className="collection-header">
                      <div className="collection-icon">
                        <Folder size={20} />
                      </div>
                      <div className="collection-info">
                        <h4 className="collection-name">{collection.name}</h4>
                        {collection.description && (
                          <p className="collection-description">{collection.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="collection-stats">
                      <span>{collection.presets.length} presets</span>
                      {collection.downloadCount && (
                        <span>{collection.downloadCount} downloads</span>
                      )}
                    </div>
                    <div className="collection-actions">
                      <button
                        className="collection-btn"
                        onClick={() => setSelectedCollection(collection.id)}
                        title="View Collection"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        className="collection-btn"
                        onClick={() => setEditingCollection(collection)}
                        title="Edit Collection"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="themes-content">
            <div className="coming-soon">
              <Star size={48} />
              <h3>Themes</h3>
              <p>Theme management coming soon!</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />

      {/* Modals */}
      {showImportExport && (
        <PresetImportExport
          onClose={() => setShowImportExport(false)}
          onImportComplete={() => {
            setShowImportExport(false);
            // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default StyleLibrary;