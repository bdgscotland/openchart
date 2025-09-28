import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { History, Clock, Star, Trash2, MoreVertical } from 'lucide-react';
import type { ElementStyle } from '../../types/diagram';

export interface StyleHistoryEntry {
  id: string;
  style: ElementStyle;
  timestamp: number;
  usageCount: number;
  sourceElementId?: string;
  sourceElementType?: string;
  isFavorite?: boolean;
  label?: string; // Custom user label
}

export interface StyleHistoryProps {
  maxEntries?: number;
  onStyleSelect?: (style: ElementStyle, entry: StyleHistoryEntry) => void;
  onStyleApply?: (style: ElementStyle, entry: StyleHistoryEntry) => void;
  className?: string;
}

/**
 * StyleHistory - Manages and displays recently used styles
 * Includes favorites, usage tracking, and smart organization
 */
export const StyleHistory: React.FC<StyleHistoryProps> = ({
  maxEntries = 20,
  onStyleSelect,
  onStyleApply,
  className = '',
}) => {
  const [history, setHistory] = useState<StyleHistoryEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'usage' | 'alphabetical'>('recent');

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('openchart-style-history');
    if (stored) {
      try {
        const parsedHistory = JSON.parse(stored) as StyleHistoryEntry[];
        setHistory(parsedHistory);
      } catch (error) {
        console.warn('Failed to load style history from localStorage:', error);
        localStorage.removeItem('openchart-style-history');
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('openchart-style-history', JSON.stringify(history));
    }
  }, [history]);

  // Add style to history
  const addToHistory = useCallback((
    style: ElementStyle,
    sourceElementId?: string,
    sourceElementType?: string,
    label?: string
  ) => {
    const styleKey = JSON.stringify(style);
    const existingEntryIndex = history.findIndex(entry =>
      JSON.stringify(entry.style) === styleKey
    );

    if (existingEntryIndex >= 0) {
      // Update existing entry
      setHistory(prev => {
        const updated = [...prev];
        updated[existingEntryIndex] = {
          ...updated[existingEntryIndex],
          timestamp: Date.now(),
          usageCount: updated[existingEntryIndex].usageCount + 1,
          sourceElementId: sourceElementId || updated[existingEntryIndex].sourceElementId,
          sourceElementType: sourceElementType || updated[existingEntryIndex].sourceElementType,
        };
        return updated;
      });
    } else {
      // Add new entry
      const newEntry: StyleHistoryEntry = {
        id: `style-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        style: { ...style },
        timestamp: Date.now(),
        usageCount: 1,
        sourceElementId,
        sourceElementType,
        isFavorite: false,
        label,
      };

      setHistory(prev => {
        const updated = [newEntry, ...prev];
        // Limit history size
        return updated.slice(0, maxEntries);
      });
    }
  }, [history, maxEntries]);

  // Remove style from history
  const removeFromHistory = useCallback((entryId: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== entryId));
    if (selectedEntryId === entryId) {
      setSelectedEntryId(null);
    }
  }, [selectedEntryId]);

  // Toggle favorite status
  const toggleFavorite = useCallback((entryId: string) => {
    setHistory(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, isFavorite: !entry.isFavorite }
        : entry
    ));
  }, []);

  // Update entry label
  const updateLabel = useCallback((entryId: string, label: string) => {
    setHistory(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, label: label.trim() || undefined }
        : entry
    ));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedEntryId(null);
    localStorage.removeItem('openchart-style-history');
  }, []);

  // Handle style selection
  const handleStyleSelect = useCallback((entry: StyleHistoryEntry) => {
    setSelectedEntryId(entry.id);
    onStyleSelect?.(entry.style, entry);

    // Increment usage count
    setHistory(prev => prev.map(e =>
      e.id === entry.id
        ? { ...e, usageCount: e.usageCount + 1, timestamp: Date.now() }
        : e
    ));
  }, [onStyleSelect]);

  // Handle style application
  const handleStyleApply = useCallback((entry: StyleHistoryEntry) => {
    onStyleApply?.(entry.style, entry);

    // Increment usage count
    setHistory(prev => prev.map(e =>
      e.id === entry.id
        ? { ...e, usageCount: e.usageCount + 1, timestamp: Date.now() }
        : e
    ));
  }, [onStyleApply]);

  // Sort and filter history
  const sortedHistory = useMemo(() => {
    const filtered = showFavoritesOnly
      ? history.filter(entry => entry.isFavorite)
      : history;

    switch (sortBy) {
      case 'usage':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      case 'alphabetical':
        return filtered.sort((a, b) => {
          const labelA = a.label || a.sourceElementType || 'Untitled';
          const labelB = b.label || b.sourceElementType || 'Untitled';
          return labelA.localeCompare(labelB);
        });
      case 'recent':
      default:
        return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [history, showFavoritesOnly, sortBy]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`style-history ${className}`}>
      {/* Header */}
      <div className="style-history-header">
        <div className="style-history-title">
          <History size={16} />
          <span>Style History</span>
          <span className="history-count">({sortedHistory.length})</span>
        </div>

        <div className="style-history-controls">
          {/* Sort options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="history-sort-select"
            title="Sort by"
          >
            <option value="recent">Recent</option>
            <option value="usage">Most Used</option>
            <option value="alphabetical">A-Z</option>
          </select>

          {/* Filter favorites */}
          <button
            className={`history-favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="Show favorites only"
          >
            <Star size={14} />
          </button>

          {/* Clear all */}
          <button
            className="history-clear-all"
            onClick={clearHistory}
            title="Clear all history"
            disabled={history.length === 0}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* History list */}
      <div className="style-history-list">
        {sortedHistory.length === 0 ? (
          <div className="style-history-empty">
            <Clock size={24} />
            <p>{showFavoritesOnly ? 'No favorite styles yet' : 'No style history yet'}</p>
            <small>Styles will appear here as you use them</small>
          </div>
        ) : (
          sortedHistory.map((entry) => (
            <StyleHistoryItem
              key={entry.id}
              entry={entry}
              isSelected={selectedEntryId === entry.id}
              onSelect={() => handleStyleSelect(entry)}
              onApply={() => handleStyleApply(entry)}
              onToggleFavorite={() => toggleFavorite(entry.id)}
              onUpdateLabel={(label) => updateLabel(entry.id, label)}
              onRemove={() => removeFromHistory(entry.id)}
              formatTimestamp={formatTimestamp}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual history item component
interface StyleHistoryItemProps {
  entry: StyleHistoryEntry;
  isSelected: boolean;
  onSelect: () => void;
  onApply: () => void;
  onToggleFavorite: () => void;
  onUpdateLabel: (label: string) => void;
  onRemove: () => void;
  formatTimestamp: (timestamp: number) => string;
}

const StyleHistoryItem: React.FC<StyleHistoryItemProps> = ({
  entry,
  isSelected,
  onSelect,
  onApply,
  onToggleFavorite,
  onUpdateLabel,
  onRemove,
  formatTimestamp,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(entry.label || '');
  const [showMenu, setShowMenu] = useState(false);

  const handleLabelSave = () => {
    onUpdateLabel(editLabel);
    setIsEditing(false);
  };

  const handleLabelCancel = () => {
    setEditLabel(entry.label || '');
    setIsEditing(false);
  };

  const displayLabel = entry.label || entry.sourceElementType || 'Untitled Style';

  return (
    <div className={`style-history-item ${isSelected ? 'selected' : ''}`}>
      <div className="style-history-item-main" onClick={onSelect}>
        {/* Style swatch */}
        <div
          className="style-history-swatch"
          style={{
            backgroundColor: entry.style.fill || '#ffffff',
            border: `${entry.style.strokeWidth || 1}px solid ${entry.style.stroke || '#000000'}`,
            borderRadius: `${entry.style.cornerRadius || 0}px`,
            opacity: entry.style.opacity || 1,
          }}
        />

        {/* Style info */}
        <div className="style-history-info">
          {isEditing ? (
            <div className="style-label-edit">
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleLabelSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLabelSave();
                  if (e.key === 'Escape') handleLabelCancel();
                }}
                autoFocus
                placeholder="Style name..."
              />
            </div>
          ) : (
            <div className="style-label" onDoubleClick={() => setIsEditing(true)}>
              {displayLabel}
            </div>
          )}

          <div className="style-meta">
            <span className="style-timestamp">{formatTimestamp(entry.timestamp)}</span>
            <span className="style-usage">Used {entry.usageCount}x</span>
            {entry.isFavorite && <Star size={12} className="favorite-icon" />}
          </div>
        </div>

        {/* Actions */}
        <div className="style-history-actions">
          <button
            className="style-apply-button"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            title="Apply this style"
          >
            Apply
          </button>

          <div className="style-item-menu">
            <button
              className="style-menu-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <div className="style-menu-dropdown">
                <button onClick={() => { onToggleFavorite(); setShowMenu(false); }}>
                  <Star size={12} />
                  {entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </button>
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                  Edit label
                </button>
                <button onClick={() => { onRemove(); setShowMenu(false); }} className="destructive">
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for programmatic style history management
export const useStyleHistory = (maxEntries = 20) => {
  const [history, setHistory] = useState<StyleHistoryEntry[]>([]);

  const addToHistory = useCallback((
    style: ElementStyle,
    sourceElementId?: string,
    sourceElementType?: string,
    label?: string
  ) => {
    const styleKey = JSON.stringify(style);
    const existingEntryIndex = history.findIndex(entry =>
      JSON.stringify(entry.style) === styleKey
    );

    if (existingEntryIndex >= 0) {
      setHistory(prev => {
        const updated = [...prev];
        updated[existingEntryIndex] = {
          ...updated[existingEntryIndex],
          timestamp: Date.now(),
          usageCount: updated[existingEntryIndex].usageCount + 1,
        };
        return updated;
      });
    } else {
      const newEntry: StyleHistoryEntry = {
        id: `style-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        style: { ...style },
        timestamp: Date.now(),
        usageCount: 1,
        sourceElementId,
        sourceElementType,
        isFavorite: false,
        label,
      };

      setHistory(prev => [newEntry, ...prev].slice(0, maxEntries));
    }
  }, [history, maxEntries]);

  const getRecentStyles = useCallback((count = 5) => {
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }, [history]);

  const getFavoriteStyles = useCallback(() => {
    return history.filter(entry => entry.isFavorite);
  }, [history]);

  const getMostUsedStyles = useCallback((count = 5) => {
    return history
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, count);
  }, [history]);

  return {
    history,
    addToHistory,
    getRecentStyles,
    getFavoriteStyles,
    getMostUsedStyles,
  };
};

export default StyleHistory;