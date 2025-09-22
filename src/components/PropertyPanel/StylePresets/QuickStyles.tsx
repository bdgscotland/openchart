import React, { useMemo, useCallback, useState } from 'react';
import {
  Square,
  SquareDashed,
  Circle,
  Triangle,
  Bold,
  Italic,
  Type,
  Palette,
  Minus,
  Plus,
  RotateCcw,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Move,
} from 'lucide-react';
import type {
  QuickStyle,
  StylePreset,
  PresetApplicationMode
} from '../../../types/stylePresets';
import type { ElementStyle } from '../../../types/diagram';
import { DEFAULT_QUICK_STYLES } from '../../../types/stylePresets';
import './QuickStyles.css';

export interface QuickStylesProps {
  selectedElements: string[];
  currentStyle?: ElementStyle;
  onApplyQuickStyle: (preset: StylePreset, mode: PresetApplicationMode) => void;
  onStyleUpdate?: (styleUpdates: Partial<ElementStyle>) => void;
  showCustomActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const QuickStyles: React.FC<QuickStylesProps> = ({
  selectedElements,
  currentStyle,
  onApplyQuickStyle,
  onStyleUpdate,
  showCustomActions = true,
  compact = false,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Enhanced quick styles with more options
  const quickStyles = useMemo(() => [
    ...DEFAULT_QUICK_STYLES,
    // Fill styles
    {
      id: 'white-fill',
      name: 'White Fill',
      icon: 'square',
      description: 'White background',
      styleUpdates: { fill: '#ffffff' },
      category: 'fill' as const,
    },
    {
      id: 'black-fill',
      name: 'Black Fill',
      icon: 'square',
      description: 'Black background',
      styleUpdates: { fill: '#000000', color: '#ffffff' },
      category: 'fill' as const,
    },
    {
      id: 'primary-fill',
      name: 'Primary Fill',
      icon: 'square',
      description: 'Primary color background',
      styleUpdates: { fill: '#3b82f6', color: '#ffffff' },
      category: 'fill' as const,
    },
    {
      id: 'success-fill',
      name: 'Success Fill',
      icon: 'square',
      description: 'Success color background',
      styleUpdates: { fill: '#10b981', color: '#ffffff' },
      category: 'fill' as const,
    },
    {
      id: 'warning-fill',
      name: 'Warning Fill',
      icon: 'square',
      description: 'Warning color background',
      styleUpdates: { fill: '#f59e0b', color: '#000000' },
      category: 'fill' as const,
    },
    {
      id: 'error-fill',
      name: 'Error Fill',
      icon: 'square',
      description: 'Error color background',
      styleUpdates: { fill: '#ef4444', color: '#ffffff' },
      category: 'fill' as const,
    },
    // Border styles
    {
      id: 'thin-border',
      name: 'Thin Border',
      icon: 'square',
      description: 'Thin border (1px)',
      styleUpdates: { strokeWidth: 1 },
      category: 'border' as const,
    },
    {
      id: 'thick-border',
      name: 'Thick Border',
      icon: 'square',
      description: 'Thick border (4px)',
      styleUpdates: { strokeWidth: 4 },
      category: 'border' as const,
    },
    {
      id: 'dashed-border',
      name: 'Dashed Border',
      icon: 'square-dashed',
      description: 'Dashed border style',
      styleUpdates: { strokeWidth: 2, stroke: '#64748b' },
      category: 'border' as const,
    },
    // Text styles
    {
      id: 'italic-text',
      name: 'Italic Text',
      icon: 'italic',
      description: 'Make text italic',
      styleUpdates: { fontStyle: 'italic' },
      category: 'text' as const,
    },
    {
      id: 'small-text',
      name: 'Small Text',
      icon: 'type',
      description: 'Decrease font size',
      styleUpdates: { fontSize: 12 },
      category: 'text' as const,
    },
    {
      id: 'heading-text',
      name: 'Heading Text',
      icon: 'type',
      description: 'Large heading text',
      styleUpdates: { fontSize: 24, fontWeight: 'bold' },
      category: 'text' as const,
    },
    {
      id: 'center-text',
      name: 'Center Text',
      icon: 'type',
      description: 'Center align text',
      styleUpdates: { textAlign: 'center' },
      category: 'text' as const,
    },
    {
      id: 'left-text',
      name: 'Left Text',
      icon: 'type',
      description: 'Left align text',
      styleUpdates: { textAlign: 'left' },
      category: 'text' as const,
    },
    {
      id: 'right-text',
      name: 'Right Text',
      icon: 'type',
      description: 'Right align text',
      styleUpdates: { textAlign: 'right' },
      category: 'text' as const,
    },
    // Effects styles
    {
      id: 'shadow',
      name: 'Drop Shadow',
      icon: 'square',
      description: 'Add drop shadow',
      styleUpdates: { textShadow: '2px 2px 4px rgba(0,0,0,0.3)' },
      category: 'effects' as const,
    },
    {
      id: 'semi-transparent',
      name: 'Semi-transparent',
      icon: 'eye-off',
      description: 'Make semi-transparent',
      styleUpdates: { opacity: 0.7 },
      category: 'effects' as const,
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      icon: 'eye',
      description: 'High contrast style',
      styleUpdates: {
        fill: '#000000',
        stroke: '#ffffff',
        strokeWidth: 3,
        color: '#ffffff'
      },
      category: 'effects' as const,
    },
  ], []);

  // Filter styles by category
  const filteredStyles = useMemo(() => {
    if (activeCategory === 'all') return quickStyles;
    return quickStyles.filter(style => style.category === activeCategory);
  }, [quickStyles, activeCategory]);

  // Display styles (limit if not showing all)
  const displayStyles = useMemo(() => {
    if (showAllStyles || compact) return filteredStyles;
    return filteredStyles.slice(0, 8);
  }, [filteredStyles, showAllStyles, compact]);

  // Available categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(quickStyles.map(style => style.category))];
    return cats.map(cat => ({
      id: cat,
      label: cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1),
      count: cat === 'all' ? quickStyles.length : quickStyles.filter(s => s.category === cat).length,
    }));
  }, [quickStyles]);

  // Handle quick style application
  const handleApplyQuickStyle = useCallback((quickStyle: QuickStyle) => {
    if (selectedElements.length === 0) {
      console.warn('No elements selected for quick style application');
      return;
    }

    // Convert QuickStyle to StylePreset format for consistency
    const fakePreset: StylePreset = {
      id: `quick-${quickStyle.id}`,
      name: quickStyle.name,
      description: quickStyle.description,
      style: quickStyle.styleUpdates as ElementStyle,
      category: 'custom',
      tags: ['quick-style'],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isCustom: true,
      isShared: false,
    };

    // Use overlay mode for quick styles to preserve existing styles
    onApplyQuickStyle(fakePreset, 'overlay');

    // Also call direct style update if available
    if (onStyleUpdate) {
      onStyleUpdate(quickStyle.styleUpdates);
    }
  }, [selectedElements, onApplyQuickStyle, onStyleUpdate]);

  // Icon mapping for quick styles
  const getQuickStyleIcon = useCallback((iconName: string, size = 14) => {
    const icons: Record<string, React.ReactElement> = {
      'square': <Square size={size} />,
      'square-dashed': <SquareDashed size={size} />,
      'square-rounded': <Square size={size} className="rounded" />,
      'circle': <Circle size={size} />,
      'triangle': <Triangle size={size} />,
      'bold': <Bold size={size} />,
      'italic': <Italic size={size} />,
      'type': <Type size={size} />,
      'palette': <Palette size={size} />,
      'minus': <Minus size={size} />,
      'plus': <Plus size={size} />,
      'eye': <Eye size={size} />,
      'eye-off': <EyeOff size={size} />,
      'zap': <Zap size={size} />,
    };

    return icons[iconName] || <Square size={size} />;
  }, []);

  if (compact) {
    return (
      <div className={`quick-styles compact ${className}`}>
        <div className="quick-styles-grid compact">
          {displayStyles.slice(0, 6).map(style => (
            <button
              key={style.id}
              className="quick-style-btn compact"
              onClick={() => handleApplyQuickStyle(style)}
              disabled={selectedElements.length === 0}
              title={style.description || style.name}
            >
              {style.icon ? getQuickStyleIcon(style.icon, 12) : <Square size={12} />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`quick-styles ${className}`}>
      {/* Header */}
      <div className="quick-styles-header">
        <div className="header-title">
          <Zap size={16} />
          <span>Quick Styles</span>
          {selectedElements.length > 0 && (
            <span className="selected-count">({selectedElements.length} selected)</span>
          )}
        </div>
        {filteredStyles.length > 8 && (
          <button
            className="show-all-btn"
            onClick={() => setShowAllStyles(!showAllStyles)}
          >
            {showAllStyles ? 'Show Less' : `Show All (${filteredStyles.length})`}
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
            <span className="category-count">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Quick Styles Grid */}
      <div className="quick-styles-content">
        {selectedElements.length === 0 ? (
          <div className="no-selection">
            <p>Select elements to apply quick styles</p>
          </div>
        ) : (
          <div className="quick-styles-grid">
            {displayStyles.map(style => (
              <button
                key={style.id}
                className="quick-style-btn"
                onClick={() => handleApplyQuickStyle(style)}
                title={style.description || style.name}
              >
                <div className="quick-style-icon">
                  {style.icon ? getQuickStyleIcon(style.icon) : <Square size={14} />}
                </div>
                <div className="quick-style-info">
                  <span className="quick-style-name">{style.name}</span>
                  {style.hotkey && (
                    <span className="quick-style-hotkey">{style.hotkey}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Actions */}
      {showCustomActions && selectedElements.length > 0 && (
        <div className="custom-actions">
          <div className="actions-header">
            <span>Custom Actions</span>
          </div>
          <div className="actions-grid">
            <button
              className="action-btn"
              onClick={() => onStyleUpdate?.({ opacity: (currentStyle?.opacity || 1) - 0.1 })}
              disabled={(currentStyle?.opacity || 1) <= 0.1}
              title="Decrease Opacity"
            >
              <EyeOff size={14} />
              Less Visible
            </button>
            <button
              className="action-btn"
              onClick={() => onStyleUpdate?.({ opacity: Math.min((currentStyle?.opacity || 1) + 0.1, 1) })}
              disabled={(currentStyle?.opacity || 1) >= 1}
              title="Increase Opacity"
            >
              <Eye size={14} />
              More Visible
            </button>
            <button
              className="action-btn"
              onClick={() => onStyleUpdate?.({ strokeWidth: Math.max((currentStyle?.strokeWidth || 2) - 1, 0) })}
              disabled={(currentStyle?.strokeWidth || 2) <= 0}
              title="Thinner Border"
            >
              <Minus size={14} />
              Thinner
            </button>
            <button
              className="action-btn"
              onClick={() => onStyleUpdate?.({ strokeWidth: (currentStyle?.strokeWidth || 2) + 1 })}
              title="Thicker Border"
            >
              <Plus size={14} />
              Thicker
            </button>
            <button
              className="action-btn"
              onClick={() => onStyleUpdate?.({
                fontSize: Math.max((currentStyle?.fontSize || 14) - 2, 8)
              })}
              disabled={(currentStyle?.fontSize || 14) <= 8}
              title="Smaller Text"
            >
              <Type size={12} />
              Smaller
            </button>
            <button
              className="action-btn"
              onClick={() => onStyleUpdate?.({
                fontSize: Math.min((currentStyle?.fontSize || 14) + 2, 48)
              })}
              disabled={(currentStyle?.fontSize || 14) >= 48}
              title="Larger Text"
            >
              <Type size={16} />
              Larger
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="keyboard-shortcuts">
        <details>
          <summary>Keyboard Shortcuts</summary>
          <div className="shortcuts-list">
            {quickStyles
              .filter(style => style.hotkey)
              .map(style => (
                <div key={style.id} className="shortcut-item">
                  <span className="shortcut-name">{style.name}</span>
                  <kbd className="shortcut-key">{style.hotkey}</kbd>
                </div>
              ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default QuickStyles;