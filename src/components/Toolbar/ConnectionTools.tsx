import React, { useState, useCallback } from 'react';
import {
  ArrowRight,
  GitBranch,
  Minus,
  MoreHorizontal,
  Workflow,
  MoveRight,
  ArrowLeftRight,
  Link,
  ChevronDown,
  Palette,
  Settings
} from 'lucide-react';
import { CONNECTION_TOOLS, EDGE_COLOR_PRESETS, EDGE_STYLE_PRESETS } from './connectionDefinitions';
import type { ConnectionToolConfig, EdgeStyleConfig } from '../../types/edgeTypes';
import './ConnectionTools.css';

interface ConnectionToolsProps {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onStyleChange: (style: EdgeStyleConfig) => void;
  currentStyle: EdgeStyleConfig;
  isCollapsed?: boolean;
}

const ConnectionTools: React.FC<ConnectionToolsProps> = ({
  selectedTool,
  onToolSelect,
  onStyleChange,
  currentStyle,
  isCollapsed = false
}) => {
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'arrow-right': ArrowRight,
      'git-branch': GitBranch,
      'minus': Minus,
      'more-horizontal': MoreHorizontal,
      'workflow': Workflow,
      'move-right': MoveRight,
      'arrow-left-right': ArrowLeftRight,
      'link': Link
    };
    return iconMap[iconName] || ArrowRight;
  };

  const handleToolSelect = useCallback((tool: ConnectionToolConfig) => {
    onToolSelect(tool.id);
    onStyleChange(tool.style);
  }, [onToolSelect, onStyleChange]);

  const handleStyleChange = useCallback((updates: Partial<EdgeStyleConfig>) => {
    const newStyle = { ...currentStyle, ...updates };
    onStyleChange(newStyle);
  }, [currentStyle, onStyleChange]);

  if (isCollapsed) {
    return (
      <div className="connection-tools-collapsed">
        {CONNECTION_TOOLS.slice(0, 4).map((tool) => {
          const IconComponent = getIconComponent(tool.icon);
          return (
            <button
              key={tool.id}
              className={`connection-tool-button ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => handleToolSelect(tool)}
              title={tool.name}
              aria-label={tool.name}
            >
              <IconComponent size={16} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="connection-tools">
      <div className="connection-tools-header">
        <h3>Connection Tools</h3>
        <div className="connection-tools-actions">
          <button
            className={`style-button ${showStylePanel ? 'active' : ''}`}
            onClick={() => setShowStylePanel(!showStylePanel)}
            title="Style Options"
          >
            <Settings size={14} />
          </button>
          <button
            className={`color-button ${showColorPicker ? 'active' : ''}`}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color Options"
          >
            <Palette size={14} />
          </button>
        </div>
      </div>

      {/* Connection Tools Grid */}
      <div className="connection-tools-grid">
        {CONNECTION_TOOLS.map((tool) => {
          const IconComponent = getIconComponent(tool.icon);
          return (
            <button
              key={tool.id}
              className={`connection-tool-card ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => handleToolSelect(tool)}
              title={tool.description}
            >
              <div className="tool-icon">
                <IconComponent size={18} />
              </div>
              <div className="tool-info">
                <span className="tool-name">{tool.name}</span>
                <span className="tool-description">{tool.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Style Panel */}
      {showStylePanel && (
        <div className="style-panel">
          <div className="style-section">
            <label>Thickness</label>
            <input
              type="range"
              min="1"
              max="8"
              value={currentStyle.strokeWidth}
              onChange={(e) => handleStyleChange({ strokeWidth: parseInt(e.target.value) })}
              className="style-slider"
            />
            <span className="style-value">{currentStyle.strokeWidth}px</span>
          </div>

          <div className="style-section">
            <label>Line Style</label>
            <select
              value={currentStyle.lineStyle}
              onChange={(e) => handleStyleChange({ lineStyle: e.target.value as any })}
              className="style-select"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="dashdot">Dash-Dot</option>
              <option value="longdash">Long Dash</option>
            </select>
          </div>

          <div className="style-section">
            <label>Curve Style</label>
            <select
              value={currentStyle.curveStyle}
              onChange={(e) => handleStyleChange({ curveStyle: e.target.value as any })}
              className="style-select"
            >
              <option value="straight">Straight</option>
              <option value="bezier">Curved</option>
              <option value="smoothstep">Step</option>
            </select>
          </div>

          <div className="style-section">
            <label>Arrow Start</label>
            <select
              value={currentStyle.markerStart || 'none'}
              onChange={(e) => handleStyleChange({ markerStart: e.target.value === 'none' ? undefined : e.target.value as any })}
              className="style-select"
            >
              <option value="none">None</option>
              <option value="arrow">Arrow</option>
              <option value="arrowclosed">Closed Arrow</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div className="style-section">
            <label>Arrow End</label>
            <select
              value={currentStyle.markerEnd || 'none'}
              onChange={(e) => handleStyleChange({ markerEnd: e.target.value === 'none' ? undefined : e.target.value as any })}
              className="style-select"
            >
              <option value="none">None</option>
              <option value="arrow">Arrow</option>
              <option value="arrowclosed">Closed Arrow</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div className="style-section">
            <label>Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyle.opacity || 1}
              onChange={(e) => handleStyleChange({ opacity: parseFloat(e.target.value) })}
              className="style-slider"
            />
            <span className="style-value">{Math.round((currentStyle.opacity || 1) * 100)}%</span>
          </div>

          {/* Style Presets */}
          <div className="style-presets">
            <label>Quick Presets</label>
            <div className="preset-buttons">
              {Object.entries(EDGE_STYLE_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  className="preset-button"
                  onClick={() => handleStyleChange(preset)}
                  title={name}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color Picker */}
      {showColorPicker && (
        <div className="color-picker-panel">
          <div className="color-presets">
            <label>Color Presets</label>
            <div className="color-grid">
              {EDGE_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  className={`color-swatch ${currentStyle.strokeColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleStyleChange({ strokeColor: color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="custom-color">
            <label>Custom Color</label>
            <input
              type="color"
              value={currentStyle.strokeColor || '#000000'}
              onChange={(e) => handleStyleChange({ strokeColor: e.target.value })}
              className="color-input"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionTools;