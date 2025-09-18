import React, { useState, useRef, useEffect } from 'react';
import './MenuBar.css';

export interface MenuBarProps {
  onNewDiagram: () => void;
  onSaveDiagram: () => void;
  onLoadDiagram: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportPDF: () => void;
  onLoadExample: (exampleName: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleGrid?: () => void;
  onToggleRulers?: () => void;
}

interface MenuItem {
  label: string;
  onClick?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNewDiagram,
  onSaveDiagram,
  onLoadDiagram,
  onExportPNG,
  onExportSVG,
  onExportPDF,
  onLoadExample,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleGrid,
  onToggleRulers,
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
          { label: 'Export as SVG', onClick: onExportSVG },
          { label: 'Export as PDF', onClick: onExportPDF },
        ]
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
      { label: 'Zoom In', onClick: () => {}, shortcut: 'Ctrl++' },
      { label: 'Zoom Out', onClick: () => {}, shortcut: 'Ctrl+-' },
      { label: 'Zoom to Fit', onClick: () => {}, shortcut: 'Ctrl+0' },
      { label: 'Actual Size', onClick: () => {}, shortcut: 'Ctrl+1' },
      { separator: true, label: '' },
      { label: 'Show Grid', onClick: onToggleGrid || (() => {}) },
      { label: 'Show Rulers', onClick: onToggleRulers || (() => {}) },
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
        className={`menu-item ${item.disabled ? 'disabled' : ''} ${item.submenu ? 'has-submenu' : ''}`}
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