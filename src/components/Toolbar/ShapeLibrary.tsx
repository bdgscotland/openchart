import React, { useState, useCallback, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, X, ChevronLeft, PanelLeftClose, Calendar, User, HelpCircle, Box, Zap, GitBranch, Database, Server, Monitor, AlertCircle } from 'lucide-react';
import type { DrawingTool, ShapeDefinition, ShapeCategory, SearchResult, ShapeLibraryState } from '../../types/shapes';
import type { CanvasMode } from '../../types/diagram';
import type { EventStormPhase, DiagramSettings } from '../../types';
import { shapeCategories, allShapes, searchShapes } from './shapeDefinitions';
import { getStickiesForPhase } from './eventStormDefinitions';
import './ShapeLibrary.css';

interface ShapeLibraryProps {
  selectedTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mode?: CanvasMode;
  eventStormPhase?: EventStormPhase; // Add phase prop
}

interface ShapeButtonProps {
  shape: ShapeDefinition;
  isSelected: boolean;
  onSelect: (tool: DrawingTool) => void;
  searchTerm?: string;
  isCompact?: boolean;
}

// Individual Shape Button Component
const ShapeButton: React.FC<ShapeButtonProps> = ({ shape, isSelected, onSelect, searchTerm, isCompact = false }) => {
  const IconComponent = shape.icon;

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (shape.id === 'select') {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('shapeTool', shape.id);
    e.dataTransfer.effectAllowed = 'copy';

    // Create drag ghost image
    const dragIcon = e.currentTarget.cloneNode(true) as HTMLElement;
    dragIcon.style.opacity = '0.7';
    dragIcon.style.transform = 'scale(1.2)';
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 20, 20);

    setTimeout(() => {
      if (document.body.contains(dragIcon)) {
        document.body.removeChild(dragIcon);
      }
    }, 0);
  }, [shape.id]);

  const handleClick = useCallback(() => {
    onSelect(shape.id);
  }, [shape.id, onSelect]);

  return (
    <button
      className={`shape-button ${isSelected ? 'active' : ''} ${isCompact ? 'compact' : ''}`}
      onClick={handleClick}
      draggable={shape.id !== 'select'}
      onDragStart={handleDragStart}
      title={shape.description || shape.name}
      aria-label={shape.name}
      data-shape-id={shape.id}
    >
      <IconComponent className="shape-icon" size={isCompact ? 16 : 18} />
      {!isCompact && (
        <>
          <span className="shape-name">{shape.name}</span>
          {shape.isNew && <span className="new-badge">New</span>}
        </>
      )}
    </button>
  );
};

// Category Section Component
interface CategorySectionProps {
  category: ShapeCategory;
  isExpanded: boolean;
  onToggle: () => void;
  selectedTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  searchTerm?: string;
  isCompact?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  isExpanded,
  onToggle,
  selectedTool,
  onToolSelect,
  searchTerm,
  isCompact = false
}) => {
  const IconComponent = category.icon || ChevronRight;
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  if (isCompact) {
    // In compact mode, show shapes directly without category headers
    return (
      <div className="compact-shapes-grid">
        {category.shapes.slice(0, 6).map((shape) => ( // Show only first 6 shapes in compact mode
          <ShapeButton
            key={shape.id}
            shape={shape}
            isSelected={selectedTool === shape.id}
            onSelect={onToolSelect}
            searchTerm={searchTerm}
            isCompact={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="category-section">
      <button
        className="category-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`category-${category.id}`}
      >
        <ChevronIcon className="category-chevron" size={16} />
        <IconComponent className="category-icon" size={16} />
        <span className="category-name">{category.name}</span>
        <span className="shape-count">({category.shapes.length})</span>
      </button>

      {isExpanded && (
        <div
          className="category-content"
          id={`category-${category.id}`}
          role="group"
          aria-labelledby={`category-header-${category.id}`}
        >
          <div className="shapes-grid">
            {category.shapes.map((shape) => (
              <ShapeButton
                key={shape.id}
                shape={shape}
                isSelected={selectedTool === shape.id}
                onSelect={onToolSelect}
                searchTerm={searchTerm}
                isCompact={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Search Bar Component
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
  placeholder = "Search shapes..."
}) => {
  return (
    <div className="search-bar">
      <Search className="search-icon" size={16} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search shapes"
      />
      {searchTerm && (
        <button
          className="search-clear"
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// Main Shape Library Component
export const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  selectedTool,
  onToolSelect,
  isCollapsed = false,
  onToggleCollapse,
  mode = 'diagram', // Default to diagram mode
  eventStormPhase = 'big-picture' // Default to big-picture phase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(shapeCategories.filter(cat => cat.defaultExpanded).map(cat => cat.id))
  );

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchShapes(searchTerm);
  }, [searchTerm]);

  // Filtered categories (when not searching)
  const filteredCategories = useMemo(() => {
    if (searchTerm.trim()) return [];
    return shapeCategories.sort((a, b) => a.order - b.order);
  }, [searchTerm]);

  // Auto-expand categories when searching
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      // Expand all categories that have matching shapes
      const categoriesWithResults = new Set<string>();
      searchShapes(term).forEach(shape => {
        categoriesWithResults.add(shape.category);
      });
      setExpandedCategories(categoriesWithResults);
    }
  }, []);

  // Group search results by category
  const groupedSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const grouped: { [categoryId: string]: ShapeDefinition[] } = {};
    searchResults.forEach(shape => {
      if (!grouped[shape.category]) {
        grouped[shape.category] = [];
      }
      grouped[shape.category].push(shape);
    });

    return Object.entries(grouped).map(([categoryId, shapes]) => {
      const category = shapeCategories.find(cat => cat.id === categoryId);
      return {
        category: category || { id: categoryId, name: categoryId, shapes: [], order: 999 },
        shapes
      };
    }).sort((a, b) => a.category.order - b.category.order);
  }, [searchResults, searchTerm]);

  // Get most common shapes for collapsed view
  const mostCommonShapes = useMemo(() => {
    if (!isCollapsed) return [];
    // Return the first few shapes from Basic category + Select tool
    const basicCategory = shapeCategories.find(cat => cat.id === 'basic');
    const basicShapes = basicCategory ? basicCategory.shapes.slice(0, 8) : [];
    const selectTool = allShapes.find(shape => shape.id === 'select');
    return selectTool ? [selectTool, ...basicShapes] : basicShapes;
  }, [isCollapsed]);

  if (isCollapsed) {
    return (
      <div className="shape-library shape-library-collapsed" role="toolbar" aria-label="Shape Library">
        {/* Collapse toggle button */}
        <div className="library-header-collapsed">
          <button
            className="collapse-toggle"
            onClick={onToggleCollapse}
            aria-label="Expand Shape Library"
            title="Expand Shape Library"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Compact shapes grid */}
        <div className="library-content-collapsed">
          <div className="compact-shapes-grid">
            {mostCommonShapes.map((shape) => (
              <ShapeButton
                key={shape.id}
                shape={shape}
                isSelected={selectedTool === shape.id}
                onSelect={onToolSelect}
                isCompact={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show Event Storm sticky library when in event storm mode
  if (mode === 'eventStorm') {
    const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
      // Big Picture
      'Calendar': Calendar,
      'User': User,
      'HelpCircle': HelpCircle,
      // Process Modeling
      'Zap': Zap,
      'GitBranch': GitBranch,
      'Database': Database,
      // Software Design
      'Box': Box,
      'Server': Server,
      'Monitor': Monitor,
      'AlertCircle': AlertCircle,
    };

    return (
      <div className="shape-library shape-library-expanded" role="toolbar" aria-label="Event Storm Sticky Library">
        {/* Header */}
        <div className="library-header">
          <div className="library-header-content">
            <div className="mode-indicator" style={{ padding: '8px 12px', background: '#FFB84D20', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '13px' }}>🎯 Event Storm Mode</strong>
              {onToggleCollapse && (
                <button
                  className="collapse-toggle"
                  onClick={onToggleCollapse}
                  aria-label="Collapse Sticky Library"
                  title="Collapse Sticky Library"
                  style={{ marginLeft: '8px' }}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky buttons */}
        <div className="library-content">
          <div style={{ padding: '12px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {eventStormPhase === 'big-picture' && 'Big Picture Phase'}
              {eventStormPhase === 'process-modeling' && 'Process Modeling Phase'}
              {eventStormPhase === 'software-design' && 'Software Design Phase'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getStickiesForPhase(eventStormPhase).map((sticky) => {
                const IconComponent = iconMap[sticky.icon || ''] || Calendar;
                return (
                  <button
                    key={sticky.id}
                    className="shape-button"
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('shapeTool', sticky.id);
                      e.dataTransfer.effectAllowed = 'copy';

                      // Create drag ghost image
                      const dragIcon = e.currentTarget.cloneNode(true) as HTMLElement;
                      dragIcon.style.opacity = '0.7';
                      dragIcon.style.transform = 'scale(1.1)';
                      document.body.appendChild(dragIcon);
                      e.dataTransfer.setDragImage(dragIcon, 90, 60);

                      setTimeout(() => {
                        if (document.body.contains(dragIcon)) {
                          document.body.removeChild(dragIcon);
                        }
                      }, 0);
                    }}
                    onClick={() => onToolSelect(sticky.id as DrawingTool)}
                    title={sticky.description}
                    style={{
                      backgroundColor: sticky.color,
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'grab',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <IconComponent size={20} style={{ flexShrink: 0 }} />
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                        {sticky.name}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8, lineHeight: '1.3' }}>
                        {sticky.description}
                      </div>
                    </div>
                    <kbd style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '3px',
                      fontWeight: 600,
                    }}>
                      {sticky.hotkey}
                    </kbd>
                  </button>
                );
              })}
            </div>

            {/* Bounded Context Container */}
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginTop: '20px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Containers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                key="es-context"
                className="shape-button"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('shapeTool', 'es-context');
                  e.dataTransfer.effectAllowed = 'copy';

                  const dragIcon = e.currentTarget.cloneNode(true) as HTMLElement;
                  dragIcon.style.opacity = '0.7';
                  dragIcon.style.transform = 'scale(1.1)';
                  document.body.appendChild(dragIcon);
                  e.dataTransfer.setDragImage(dragIcon, 90, 60);

                  setTimeout(() => {
                    if (document.body.contains(dragIcon)) {
                      document.body.removeChild(dragIcon);
                    }
                  }, 0);
                }}
                onClick={() => onToolSelect('es-context' as DrawingTool)}
                title="Create a bounded context container to group related stickies"
                style={{
                  backgroundColor: '#E8F4FD',
                  border: '3px dashed rgba(59, 130, 246, 0.6)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'grab',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <Box size={20} style={{ flexShrink: 0, color: '#3B82F6' }} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', color: '#1E40AF' }}>
                    Bounded Context
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.8, lineHeight: '1.3', color: '#475569' }}>
                    Container for grouping related stickies
                  </div>
                </div>
                <kbd style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '3px',
                  fontWeight: 600,
                  color: '#1E40AF',
                }}>
                  C
                </kbd>
              </button>
            </div>

            <p style={{ fontSize: '11px', marginTop: '16px', color: '#999', textAlign: 'center' }}>
              Drag stickies onto the canvas or click to select
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shape-library shape-library-expanded" role="toolbar" aria-label="Shape Library">
      {/* Header with Search and Collapse Button */}
      <div className="library-header">
        <div className="library-header-content">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClear={clearSearch}
            placeholder="Search shapes..."
          />
          {onToggleCollapse && (
            <button
              className="collapse-toggle"
              onClick={onToggleCollapse}
              aria-label="Collapse Shape Library"
              title="Collapse Shape Library"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Shape Categories */}
      <div className="library-content">
        {searchTerm.trim() ? (
          // Search Results
          <div className="search-results">
            {searchResults.length === 0 ? (
              <div className="no-results">
                <p>No shapes found for "{searchTerm}"</p>
                <p>Try different keywords or browse categories below.</p>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <span className="results-count">
                    {searchResults.length} shape{searchResults.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                {groupedSearchResults.map(({ category, shapes }) => (
                  <CategorySection
                    key={category.id}
                    category={{ ...category, shapes }}
                    isExpanded={true}
                    onToggle={() => {}}
                    selectedTool={selectedTool}
                    onToolSelect={onToolSelect}
                    searchTerm={searchTerm}
                    isCompact={false}
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          // Category View
          <div className="categories-container">
            {filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                selectedTool={selectedTool}
                onToolSelect={onToolSelect}
                isCompact={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="library-footer">
        <span className="shape-stats">
          {allShapes.length - 1} shapes in {shapeCategories.length} categories
        </span>
      </div>
    </div>
  );
};

export default ShapeLibrary;