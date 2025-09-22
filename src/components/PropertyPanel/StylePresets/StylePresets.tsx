import React, { useState, useMemo, useCallback } from 'react';
import { Palette, Grid, List, Search, Filter, Plus, Download, Upload } from 'lucide-react';
import { useStylePresets } from './hooks/useStylePresets';
import { PresetCard } from './PresetCard';
import { PresetSearch } from './PresetSearch';
import { ThemeSelector } from './ThemeSelector';
import { QuickStyles } from './QuickStyles';
import type {
  StylePreset,
  PresetCategory,
  PresetSearchFilters,
  PresetApplicationMode
} from '../../../types/stylePresets';
import type { ElementStyle } from '../../../types/diagram';
import './StylePresets.css';

export interface StylePresetsProps {
  selectedElements: string[];
  onApplyPreset: (preset: StylePreset, mode: PresetApplicationMode) => void;
  onCreatePreset: (style: ElementStyle, name: string, category: PresetCategory) => void;
  onTogglePresetPanel: () => void;
  currentStyle?: ElementStyle;
  className?: string;
}

export const StylePresets: React.FC<StylePresetsProps> = ({
  selectedElements,
  onApplyPreset,
  onCreatePreset,
  onTogglePresetPanel,
  currentStyle,
  className = '',
}) => {
  const {
    presets,
    themes,
    favorites,
    recentlyUsed,
    currentTheme,
    isLoading,
    error,
    applyPreset,
    toggleFavorite,
    setCurrentTheme,
    searchPresets,
  } = useStylePresets();

  const [searchFilters, setSearchFilters] = useState<PresetSearchFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickStyles, setShowQuickStyles] = useState(true);
  const [applicationMode, setApplicationMode] = useState<PresetApplicationMode>('smart');

  // Filter and search presets
  const filteredPresets = useMemo(() => {
    return searchPresets(searchFilters);
  }, [searchPresets, searchFilters]);

  // Group presets by category
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

    filteredPresets.forEach(preset => {
      groups[preset.category].push(preset);
    });

    return groups;
  }, [filteredPresets]);

  // Handle preset application
  const handleApplyPreset = useCallback((preset: StylePreset) => {
    if (selectedElements.length === 0) {
      console.warn('No elements selected for preset application');
      return;
    }

    applyPreset(preset, selectedElements, applicationMode);
    onApplyPreset(preset, applicationMode);
  }, [selectedElements, applicationMode, applyPreset, onApplyPreset]);

  // Handle preset creation from current style
  const handleCreateFromCurrent = useCallback(() => {
    if (!currentStyle) {
      console.warn('No current style available for preset creation');
      return;
    }

    const name = prompt('Enter preset name:');
    if (!name?.trim()) return;

    const category = prompt('Enter category (business, creative, technical, etc.):') as PresetCategory;
    if (!category) return;

    onCreatePreset(currentStyle, name.trim(), category);
  }, [currentStyle, onCreatePreset]);

  // Handle search filter changes
  const handleSearchFiltersChange = useCallback((filters: PresetSearchFilters) => {
    setSearchFilters(filters);
  }, []);

  // Handle theme change
  const handleThemeChange = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
  }, [setCurrentTheme]);

  if (isLoading) {
    return (
      <div className={`style-presets loading ${className}`}>
        <div className="style-presets-header">
          <div className="header-title">
            <Palette size={16} />
            <span>Style Presets</span>
          </div>
        </div>
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading presets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`style-presets error ${className}`}>
        <div className="style-presets-header">
          <div className="header-title">
            <Palette size={16} />
            <span>Style Presets</span>
          </div>
        </div>
        <div className="error-state">
          <p>Error loading presets: {error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`style-presets ${className}`}>
      {/* Header */}
      <div className="style-presets-header">
        <div className="header-title">
          <Palette size={16} />
          <span>Style Presets</span>
          <span className="preset-count">({filteredPresets.length})</span>
        </div>
        <div className="header-actions">
          <button
            className={`action-btn ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search and Filter"
          >
            <Search size={14} />
          </button>
          <button
            className={`action-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <Grid size={14} />
          </button>
          <button
            className={`action-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={14} />
          </button>
          <button
            className="action-btn"
            onClick={handleCreateFromCurrent}
            disabled={!currentStyle}
            title="Create Preset from Current Style"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <ThemeSelector
        themes={themes}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        className="theme-selector-compact"
      />

      {/* Application Mode Selector */}
      <div className="application-mode-selector">
        <label className="mode-label">Apply Mode:</label>
        <select
          value={applicationMode}
          onChange={(e) => setApplicationMode(e.target.value as PresetApplicationMode)}
          className="mode-select"
        >
          <option value="smart">Smart Merge</option>
          <option value="replace">Replace All</option>
          <option value="merge">Merge Styles</option>
          <option value="overlay">Overlay Only</option>
        </select>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <PresetSearch
          filters={searchFilters}
          onFiltersChange={handleSearchFiltersChange}
          presetCount={filteredPresets.length}
          className="preset-search-compact"
        />
      )}

      {/* Quick Styles */}
      {showQuickStyles && (
        <QuickStyles
          selectedElements={selectedElements}
          onApplyQuickStyle={onApplyPreset}
          className="quick-styles-compact"
        />
      )}

      {/* Selection Info */}
      {selectedElements.length > 0 && (
        <div className="selection-info">
          <span className="selection-count">
            {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Presets Content */}
      <div className="style-presets-content">
        {filteredPresets.length === 0 ? (
          <div className="empty-state">
            <Palette size={48} />
            <h3>No Presets Found</h3>
            <p>
              {Object.keys(searchFilters).length > 0
                ? 'Try adjusting your search filters'
                : 'Create your first preset from the current style'
              }
            </p>
            {currentStyle && (
              <button
                className="create-preset-btn"
                onClick={handleCreateFromCurrent}
              >
                <Plus size={16} />
                Create Preset
              </button>
            )}
          </div>
        ) : (
          <div className={`presets-grid ${viewMode}`}>
            {Object.entries(presetsByCategory).map(([category, categoryPresets]) => {
              if (categoryPresets.length === 0) return null;

              return (
                <div key={category} className="preset-category-group">
                  <h4 className="category-header">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span className="category-count">({categoryPresets.length})</span>
                  </h4>
                  <div className={`category-presets ${viewMode}`}>
                    {categoryPresets.map(preset => (
                      <PresetCard
                        key={preset.id}
                        preset={preset}
                        viewMode={viewMode}
                        isFavorite={favorites.includes(preset.id)}
                        isRecent={recentlyUsed.includes(preset.id)}
                        onApply={() => handleApplyPreset(preset)}
                        onToggleFavorite={() => toggleFavorite(preset.id)}
                        className="preset-card-compact"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="style-presets-footer">
        <div className="footer-stats">
          <span>{filteredPresets.length} presets</span>
          {favorites.length > 0 && (
            <span>{favorites.length} favorites</span>
          )}
        </div>
        <div className="footer-actions">
          <button
            className="footer-btn"
            onClick={onTogglePresetPanel}
            title="Close Presets Panel"
          >
            Collapse
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylePresets;