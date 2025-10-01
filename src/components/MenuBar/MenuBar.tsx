import React, { useState, useEffect } from 'react';
import './MenuBar.css';

export interface MenuBarProps {
  onNewDiagram: () => void;
  onSaveDiagram: () => void;
  onLoadDiagram: () => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onExportWebP: () => void;
  onExportSVG: () => void;
  onExportPDF: () => void;
  onLoadExample: (exampleName: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Mode switching
  onModeChange?: (mode: 'diagram' | 'eventStorm') => void;

  // Legacy view toggles (keeping for backward compatibility)
  onToggleGrid?: () => void;
  onToggleRulers?: () => void;

  // Enhanced View menu handlers
  // UI Panel Toggles
  onToggleFormatPanel?: () => void;
  onToggleOutlinePanel?: () => void;
  onToggleLayersPanel?: () => void;
  onToggleShapesPanel?: () => void;
  onToggleSearchShapes?: () => void;
  onToggleScratchpad?: () => void;
  onToggleTags?: () => void;

  // Display Toggles
  onToggleTooltips?: () => void;
  onToggleAnimations?: () => void;
  onToggleGuides?: () => void;
  onTogglePageTabs?: () => void;
  onTogglePageView?: () => void;

  // Connection Visualization
  onToggleConnectionArrows?: () => void;
  onToggleConnectionPoints?: () => void;

  // View Controls
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToView?: () => void;
  onToggleFullscreen?: () => void;

  // Units and Scale
  onChangeUnits?: (units: 'px' | 'cm' | 'in' | 'pt' | 'mm') => void;
  onChangePageScale?: (scale: number) => void;

  // Current state for checkmarks
  diagramSettings?: import('../../types/diagram').DiagramSettings;
}

interface MenuItem {
  label: string;
  onClick?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
  disabled?: boolean;
  shortcut?: string;
  checked?: boolean; // For toggle/checkbox menu items
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNewDiagram,
  onSaveDiagram,
  onLoadDiagram,
  onExportPNG,
  onExportJPEG,
  onExportWebP,
  onExportSVG,
  onExportPDF,
  onLoadExample,
  onUndo,
  onRedo,
  canUndo,
  canRedo,

  // Mode switching
  onModeChange,

  // Legacy view toggles
  onToggleGrid,
  onToggleRulers,

  // Enhanced View menu handlers
  onToggleFormatPanel,
  onToggleOutlinePanel,
  onToggleLayersPanel,
  onToggleShapesPanel,
  onToggleSearchShapes,
  onToggleScratchpad,
  onToggleTags,
  onToggleTooltips,
  onToggleAnimations,
  onToggleGuides,
  onTogglePageTabs,
  onTogglePageView,
  onToggleConnectionArrows,
  onToggleConnectionPoints,
  onResetView,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onToggleFullscreen,
  onChangeUnits,
  onChangePageScale,
  diagramSettings,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-bar')) {
        setActiveMenu(null);
        setHoveredMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  const menuItems: { [key: string]: MenuItem[] } = {
    file: [
      { label: 'New Diagram', onClick: onNewDiagram, shortcut: 'Ctrl+N' },
      { separator: true, label: '' },
      { label: 'Save Diagram (.json)', onClick: onSaveDiagram, shortcut: 'Ctrl+S' },
      { label: 'Load Diagram', onClick: onLoadDiagram, shortcut: 'Ctrl+O' },
      { separator: true, label: '' },
      {
        label: 'Export',
        submenu: [
          { label: 'Export as PNG', onClick: onExportPNG },
          { label: 'Export as JPEG', onClick: onExportJPEG },
          { label: 'Export as WebP', onClick: onExportWebP },
          { label: 'Export as SVG', onClick: onExportSVG },
          { label: 'Export as PDF', onClick: onExportPDF },
        ]
      },
    ],
    mode: [
      {
        label: 'Diagram Mode',
        onClick: () => onModeChange?.('diagram'),
        shortcut: 'Ctrl+M',
        checked: diagramSettings?.mode === 'diagram',
      },
      {
        label: 'Event Storm Mode',
        onClick: () => onModeChange?.('eventStorm'),
        shortcut: 'Ctrl+Shift+M',
        checked: diagramSettings?.mode === 'eventStorm',
      },
    ],
    examples: [
      { label: 'Basic Flowchart', onClick: () => onLoadExample('flowchart') },
      { label: 'Org Chart', onClick: () => onLoadExample('orgchart') },
      { label: 'Process Flow', onClick: () => onLoadExample('process') },
      { label: 'Mind Map', onClick: () => onLoadExample('mindmap') },
      { label: 'Network Diagram', onClick: () => onLoadExample('network') },
    ],
    edit: [
      { label: 'Undo', onClick: onUndo, shortcut: 'Ctrl+Z', disabled: !canUndo },
      { label: 'Redo', onClick: onRedo, shortcut: 'Ctrl+Y', disabled: !canRedo },
      { separator: true, label: '' },
      { label: 'Select All', onClick: () => {}, shortcut: 'Ctrl+A' },
      { label: 'Delete Selected', onClick: () => {}, shortcut: 'Delete' },
    ],
    view: [
      // Panel Toggles
      { 
        label: 'Format', 
        onClick: onToggleFormatPanel || (() => {}), 
        shortcut: 'Cmd+Shift+P',
        checked: diagramSettings?.uiPanels.formatPanel
      },
      { 
        label: 'Outline', 
        onClick: onToggleOutlinePanel || (() => {}), 
        shortcut: 'Cmd+Shift+O',
        checked: diagramSettings?.uiPanels.outlinePanel
      },
      { 
        label: 'Layers', 
        onClick: onToggleLayersPanel || (() => {}), 
        shortcut: 'Cmd+Shift+L',
        checked: diagramSettings?.uiPanels.layersPanel
      },
      { 
        label: 'Tags', 
        onClick: onToggleTags || (() => {}), 
        shortcut: 'Cmd+K',
        checked: diagramSettings?.uiPanels.tags
      },
      { separator: true, label: '' },
      
      // Search and Tools
      { 
        label: 'Search Shapes', 
        onClick: onToggleSearchShapes || (() => {}), 
        checked: diagramSettings?.uiPanels.searchShapes
      },
      { 
        label: 'Scratchpad', 
        onClick: onToggleScratchpad || (() => {}), 
        checked: diagramSettings?.uiPanels.scratchpad
      },
      { 
        label: 'Shapes', 
        onClick: onToggleShapesPanel || (() => {}), 
        shortcut: 'Cmd+Shift+K',
        checked: diagramSettings?.uiPanels.shapesPanel
      },
      { separator: true, label: '' },

      // Page and View Settings
      { 
        label: 'Page View', 
        onClick: onTogglePageView || (() => {}), 
        checked: diagramSettings?.display.pageView
      },
      {
        label: 'Page Scale...',
        submenu: [
          { label: '50%', onClick: () => onChangePageScale?.(50) },
          { label: '75%', onClick: () => onChangePageScale?.(75) },
          { label: '100%', onClick: () => onChangePageScale?.(100) },
          { label: '125%', onClick: () => onChangePageScale?.(125) },
          { label: '150%', onClick: () => onChangePageScale?.(150) },
          { label: '200%', onClick: () => onChangePageScale?.(200) },
        ]
      },
      {
        label: 'Units',
        submenu: [
          { label: 'Pixels (px)', onClick: () => onChangeUnits?.('px') },
          { label: 'Centimeters (cm)', onClick: () => onChangeUnits?.('cm') },
          { label: 'Inches (in)', onClick: () => onChangeUnits?.('in') },
          { label: 'Points (pt)', onClick: () => onChangeUnits?.('pt') },
          { label: 'Millimeters (mm)', onClick: () => onChangeUnits?.('mm') },
        ]
      },
      { separator: true, label: '' },

      // Display Elements
      { 
        label: 'Page Tabs', 
        onClick: onTogglePageTabs || (() => {}), 
        checked: diagramSettings?.display.pageTabs
      },
      { 
        label: 'Ruler', 
        onClick: onToggleRulers || (() => {}), 
        checked: diagramSettings?.rulers.enabled
      },
      { 
        label: 'Tooltips', 
        onClick: onToggleTooltips || (() => {}), 
        checked: diagramSettings?.display.tooltips
      },
      { 
        label: 'Animations', 
        onClick: onToggleAnimations || (() => {}), 
        checked: diagramSettings?.display.animations
      },
      { separator: true, label: '' },

      // Grid and Guides
      { 
        label: 'Grid', 
        onClick: onToggleGrid || (() => {}), 
        shortcut: 'Cmd+Shift+G',
        checked: diagramSettings?.grid.enabled
      },
      { 
        label: 'Guides', 
        onClick: onToggleGuides || (() => {}), 
        checked: diagramSettings?.display.guides
      },
      { separator: true, label: '' },

      // Connection Visualization
      { 
        label: 'Connection Arrows', 
        onClick: onToggleConnectionArrows || (() => {}), 
        shortcut: 'Ctrl+Shift+A',
        checked: diagramSettings?.connectionVisualization.connectionArrows
      },
      { 
        label: 'Connection Points', 
        onClick: onToggleConnectionPoints || (() => {}), 
        shortcut: 'Ctrl+Shift+O',
        checked: diagramSettings?.connectionVisualization.connectionPoints
      },
      { separator: true, label: '' },

      // View Controls
      { label: 'Reset View', onClick: onResetView || (() => {}), shortcut: 'Enter/Home' },
      { label: 'Zoom In', onClick: onZoomIn || (() => {}), shortcut: 'Cmd + / Alt+Mousewheel' },
      { label: 'Zoom Out', onClick: onZoomOut || (() => {}), shortcut: 'Cmd - / Alt+Mousewheel' },
      { label: 'Fit to View', onClick: onFitToView || (() => {}), shortcut: 'Ctrl+0' },
      { separator: true, label: '' },
      { label: 'Fullscreen', onClick: onToggleFullscreen || (() => {}) },
    ],
  };

  const handleMenuClick = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.onClick && !item.disabled && !item.submenu) {
      item.onClick();
      setActiveMenu(null);
    }
  };

  const handleMouseLeave = () => {
    // Delay closing to allow moving to submenu
    setTimeout(() => {
      if (!hoveredMenu) {
        setActiveMenu(null);
      }
    }, 150);
  };

  const renderMenuItem = (item: MenuItem, key: number) => {
    if (item.separator) {
      return <div key={key} className="menu-separator" />;
    }

    return (
      <div
        key={key}
        className={`menu-item ${item.disabled ? 'disabled' : ''} ${item.submenu ? 'has-submenu' : ''} ${item.checked ? 'checked' : ''}`}
        onClick={() => handleMenuItemClick(item)}
        onMouseEnter={() => item.submenu && setHoveredMenu(item.label)}
        onMouseLeave={(e) => {
          // Don't close if moving to submenu
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (!relatedTarget?.closest('.submenu')) {
            setTimeout(() => setHoveredMenu(null), 100);
          }
        }}
      >
        <span className="menu-item-check">
          {item.checked ? '✓' : ''}
        </span>
        <span className="menu-item-label">{item.label}</span>
        {item.shortcut && <span className="menu-item-shortcut">{item.shortcut}</span>}
        {item.submenu && <span className="menu-item-arrow">▶</span>}
        
        {item.submenu && hoveredMenu === item.label && (
          <div 
            className="submenu"
            onMouseEnter={() => setHoveredMenu(item.label)}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            {item.submenu.map((subItem, subKey) => renderMenuItem(subItem, subKey))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="menu-bar">
      <div className="menu-items">
        {Object.entries(menuItems).map(([menuName, items]) => (
          <div key={menuName} className="menu-container">
            <button
              className={`menu-trigger ${activeMenu === menuName ? 'active' : ''}`}
              onClick={() => handleMenuClick(menuName)}
              onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
            >
              {menuName.charAt(0).toUpperCase() + menuName.slice(1)}
            </button>
            
            {activeMenu === menuName && (
              <div 
                className="menu-dropdown"
                onMouseLeave={handleMouseLeave}
              >
                {items.map((item, index) => renderMenuItem(item, index))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="menu-right">
        <span className="app-version">v1.0.0</span>
      </div>
    </div>
  );
};