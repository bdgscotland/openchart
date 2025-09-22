import React, { useState, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Tag,
  User,
  Calendar,
  Star,
  Heart,
  Clock,
  Grid,
  ChevronDown,
} from 'lucide-react';
import type {
  PresetSearchFilters,
  PresetCategory,
} from '../../../types/stylePresets';
import { PRESET_CATEGORIES } from '../../../types/stylePresets';
import './PresetSearch.css';

export interface PresetSearchProps {
  filters: PresetSearchFilters;
  onFiltersChange: (filters: PresetSearchFilters) => void;
  presetCount?: number;
  showAdvanced?: boolean;
  compact?: boolean;
  className?: string;
}

export const PresetSearch: React.FC<PresetSearchProps> = ({
  filters,
  onFiltersChange,
  presetCount,
  showAdvanced = true,
  compact = false,
  className = '',
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Handle search term change
  const handleSearchTermChange = useCallback((searchTerm: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: searchTerm || undefined,
    });
  }, [filters, onFiltersChange]);

  // Handle category change
  const handleCategoryChange = useCallback((category: PresetCategory | undefined) => {
    onFiltersChange({
      ...filters,
      category,
    });
  }, [filters, onFiltersChange]);

  // Handle tag addition
  const handleAddTag = useCallback((tag: string) => {
    if (!tag.trim()) return;

    const currentTags = filters.tags || [];
    if (currentTags.includes(tag.trim())) return;

    onFiltersChange({
      ...filters,
      tags: [...currentTags, tag.trim()],
    });
    setTagInput('');
  }, [filters, onFiltersChange]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const currentTags = filters.tags || [];
    onFiltersChange({
      ...filters,
      tags: currentTags.filter(tag => tag !== tagToRemove),
    });
  }, [filters, onFiltersChange]);

  // Handle filter toggles
  const handleToggleFilter = useCallback((filterKey: keyof PresetSearchFilters, value?: any) => {
    onFiltersChange({
      ...filters,
      [filterKey]: filters[filterKey] === value ? undefined : value,
    });
  }, [filters, onFiltersChange]);

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
    setTagInput('');
  }, [onFiltersChange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category) count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    if (filters.author) count++;
    if (filters.isCustom !== undefined) count++;
    if (filters.isShared !== undefined) count++;
    if (filters.minRating !== undefined) count++;
    return count;
  }, [filters]);

  // Handle tag input key press
  const handleTagInputKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === ',' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  }, [tagInput, handleAddTag]);

  if (compact) {
    return (
      <div className={`preset-search compact ${className}`}>
        <div className="search-input-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search presets..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            className="search-input"
          />
          {filters.searchTerm && (
            <button
              className="clear-search"
              onClick={() => handleSearchTermChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="active-filters-compact">
            <span className="filter-count">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}</span>
            <button
              className="clear-filters"
              onClick={handleClearFilters}
              title="Clear all filters"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {presetCount !== undefined && (
          <div className="result-count">
            {presetCount} preset{presetCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`preset-search ${className}`}>
      {/* Main Search */}
      <div className="search-header">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search presets by name, description, or tags..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            className="search-input"
          />
          {filters.searchTerm && (
            <button
              className="clear-search"
              onClick={() => handleSearchTermChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {showAdvanced && (
          <button
            className={`advanced-toggle ${isAdvancedOpen ? 'active' : ''}`}
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            title="Advanced Filters"
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
            <ChevronDown
              size={14}
              className={`chevron ${isAdvancedOpen ? 'rotated' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Result Count */}
      {presetCount !== undefined && (
        <div className="search-results-info">
          <span className="result-count">
            {presetCount} preset{presetCount !== 1 ? 's' : ''} found
          </span>
          {activeFilterCount > 0 && (
            <button
              className="clear-all-filters"
              onClick={handleClearFilters}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {activeFilterCount > 0 && (
        <div className="active-filters">
          {filters.searchTerm && (
            <div className="filter-tag">
              <Search size={12} />
              <span>"{filters.searchTerm}"</span>
              <button onClick={() => handleSearchTermChange('')}>
                <X size={12} />
              </button>
            </div>
          )}

          {filters.category && (
            <div className="filter-tag">
              <Grid size={12} />
              <span>{PRESET_CATEGORIES[filters.category].label}</span>
              <button onClick={() => handleCategoryChange(undefined)}>
                <X size={12} />
              </button>
            </div>
          )}

          {filters.tags?.map(tag => (
            <div key={tag} className="filter-tag">
              <Tag size={12} />
              <span>{tag}</span>
              <button onClick={() => handleRemoveTag(tag)}>
                <X size={12} />
              </button>
            </div>
          ))}

          {filters.author && (
            <div className="filter-tag">
              <User size={12} />
              <span>{filters.author}</span>
              <button onClick={() => handleToggleFilter('author')}>
                <X size={12} />
              </button>
            </div>
          )}

          {filters.isCustom !== undefined && (
            <div className="filter-tag">
              <span>{filters.isCustom ? 'Custom' : 'Built-in'}</span>
              <button onClick={() => handleToggleFilter('isCustom')}>
                <X size={12} />
              </button>
            </div>
          )}

          {filters.isShared !== undefined && (
            <div className="filter-tag">
              <span>{filters.isShared ? 'Shared' : 'Private'}</span>
              <button onClick={() => handleToggleFilter('isShared')}>
                <X size={12} />
              </button>
            </div>
          )}

          {filters.minRating !== undefined && (
            <div className="filter-tag">
              <Star size={12} />
              <span>{filters.minRating}+ stars</span>
              <button onClick={() => handleToggleFilter('minRating')}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && isAdvancedOpen && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h4 className="filter-section-title">
              <Grid size={14} />
              Category
            </h4>
            <div className="filter-options">
              <select
                value={filters.category || ''}
                onChange={(e) => handleCategoryChange(e.target.value as PresetCategory || undefined)}
                className="category-select"
              >
                <option value="">All Categories</option>
                {Object.entries(PRESET_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">
              <Tag size={14} />
              Tags
            </h4>
            <div className="filter-options">
              <div className="tag-input-container">
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  className="tag-input"
                />
                <button
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim()}
                  className="add-tag-btn"
                >
                  Add
                </button>
              </div>
              {filters.tags && filters.tags.length > 0 && (
                <div className="selected-tags">
                  {filters.tags.map(tag => (
                    <span key={tag} className="selected-tag">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">
              <User size={14} />
              Author
            </h4>
            <div className="filter-options">
              <input
                type="text"
                placeholder="Filter by author"
                value={filters.author || ''}
                onChange={(e) => handleToggleFilter('author', e.target.value || undefined)}
                className="author-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">
              <Star size={14} />
              Rating
            </h4>
            <div className="filter-options">
              <div className="rating-options">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    className={`rating-option ${filters.minRating === rating ? 'active' : ''}`}
                    onClick={() => handleToggleFilter('minRating', rating)}
                  >
                    <Star size={12} />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Type</h4>
            <div className="filter-options">
              <div className="toggle-options">
                <button
                  className={`toggle-option ${filters.isCustom === true ? 'active' : ''}`}
                  onClick={() => handleToggleFilter('isCustom', true)}
                >
                  Custom Only
                </button>
                <button
                  className={`toggle-option ${filters.isCustom === false ? 'active' : ''}`}
                  onClick={() => handleToggleFilter('isCustom', false)}
                >
                  Built-in Only
                </button>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Sharing</h4>
            <div className="filter-options">
              <div className="toggle-options">
                <button
                  className={`toggle-option ${filters.isShared === true ? 'active' : ''}`}
                  onClick={() => handleToggleFilter('isShared', true)}
                >
                  <Heart size={12} />
                  Shared
                </button>
                <button
                  className={`toggle-option ${filters.isShared === false ? 'active' : ''}`}
                  onClick={() => handleToggleFilter('isShared', false)}
                >
                  Private
                </button>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="clear-filters-btn"
              onClick={handleClearFilters}
              disabled={activeFilterCount === 0}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetSearch;