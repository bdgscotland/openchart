import React from 'react';
import './Toolbar.css';

export type DrawingTool = 'select' | 'rectangle' | 'circle' | 'diamond' | 'text' | 'arrow' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'ellipse';

interface ToolbarComponentProps {
  selectedTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
}

export const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  selectedTool,
  onToolSelect,
}) => {
  const tools: Array<{ id: DrawingTool; label: string; icon: string }> = [
    { id: 'select', label: 'Select', icon: '↖️' },
    { id: 'rectangle', label: 'Rectangle', icon: '⬜' },
    { id: 'circle', label: 'Circle', icon: '⭕' },
    { id: 'ellipse', label: 'Ellipse', icon: '🥚' },
    { id: 'diamond', label: 'Diamond', icon: '💎' },
    { id: 'triangle', label: 'Triangle', icon: '🔺' },
    { id: 'pentagon', label: 'Pentagon', icon: '⬟' },
    { id: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { id: 'star', label: 'Star', icon: '⭐' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'arrow', label: 'Arrow', icon: '➡️' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-grid">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolSelect(tool.id)}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};