import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { icons } from 'lucide-react';
import { Search, X } from 'lucide-react';
import './IconPicker.css';

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  onClose: () => void;
  selectedIcon?: string;
}

// Get all Lucide icon names from the icons object
const getAllIconNames = (): string[] => {
  return Object.keys(icons).sort();
};

export const IconPicker: React.FC<IconPickerProps> = ({ onSelect, onClose, selectedIcon }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const allIcons = useMemo(() => getAllIconNames(), []);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return allIcons;

    const query = searchQuery.toLowerCase();
    return allIcons.filter(iconName =>
      iconName.toLowerCase().includes(query)
    );
  }, [searchQuery, allIcons]);

  const handleIconClick = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, iconName: string) => {
    e.dataTransfer.setData('shapeTool', 'icon');
    e.dataTransfer.setData('iconName', iconName);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Grid configuration - 12 columns for compact display
  const COLUMN_COUNT = 12;
  const ITEM_SIZE = 70;
  const CONTAINER_HEIGHT = 500;
  const ROW_COUNT = Math.ceil(filteredIcons.length / COLUMN_COUNT);
  const TOTAL_HEIGHT = ROW_COUNT * ITEM_SIZE;

  // Virtual scrolling: calculate visible range
  const overscan = 3; // rows to render outside viewport
  const visibleRowStart = Math.max(0, Math.floor(scrollTop / ITEM_SIZE) - overscan);
  const visibleRowEnd = Math.min(ROW_COUNT, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_SIZE) + overscan);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Render only visible icons
  const visibleIcons = useMemo(() => {
    const result: Array<{ iconName: string; row: number; col: number }> = [];
    for (let row = visibleRowStart; row < visibleRowEnd; row++) {
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const index = row * COLUMN_COUNT + col;
        if (index < filteredIcons.length) {
          result.push({
            iconName: filteredIcons[index],
            row,
            col
          });
        }
      }
    }
    return result;
  }, [filteredIcons, visibleRowStart, visibleRowEnd, COLUMN_COUNT]);

  const renderIcon = useCallback((item: { iconName: string; row: number; col: number }) => {
    const { iconName, row, col } = item;
    const IconComponent = icons[iconName as keyof typeof icons];
    if (!IconComponent) return null;

    const top = row * ITEM_SIZE;
    const left = col * ITEM_SIZE;

    return (
      <button
        key={iconName}
        className={`icon-picker-item ${selectedIcon === iconName ? 'selected' : ''}`}
        onClick={() => handleIconClick(iconName)}
        onDragStart={(e) => handleDragStart(e, iconName)}
        draggable={true}
        title={iconName}
        aria-label={`Select ${iconName} icon`}
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: `${ITEM_SIZE}px`,
          height: `${ITEM_SIZE}px`,
        }}
      >
        <IconComponent size={20} strokeWidth={2} />
        <span className="icon-name">{iconName}</span>
      </button>
    );
  }, [selectedIcon, handleIconClick, handleDragStart, ITEM_SIZE]);

  return (
    <div className="icon-picker-overlay" onClick={handleOverlayClick}>
      <div className="icon-picker-modal">
        <div className="icon-picker-header">
          <h2>Select Icon</h2>
          <button
            className="icon-picker-close"
            onClick={onClose}
            aria-label="Close icon picker"
          >
            <X size={20} />
          </button>
        </div>

        <div className="icon-picker-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="icon-picker-info">
          {filteredIcons.length} icons {searchQuery && `matching "${searchQuery}"`}
        </div>

        <div
          className="icon-picker-grid-container"
          ref={gridRef}
          onScroll={handleScroll}
        >
          <div
            className="icon-picker-grid"
            style={{
              position: 'relative',
              width: `${COLUMN_COUNT * ITEM_SIZE}px`,
              height: `${TOTAL_HEIGHT}px`,
            }}
          >
            {visibleIcons.map(renderIcon)}
          </div>
        </div>
      </div>
    </div>
  );
};
