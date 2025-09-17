import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Diamond, 
  Triangle, 
  Pentagon, 
  Hexagon, 
  Star, 
  Type, 
  ArrowRight 
} from 'lucide-react';
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
  const tools: Array<{ id: DrawingTool; label: string; icon: React.ComponentType<any> }> = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'ellipse', label: 'Ellipse', icon: Circle },
    { id: 'diamond', label: 'Diamond', icon: Diamond },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'pentagon', label: 'Pentagon', icon: Pentagon },
    { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
    { id: 'star', label: 'Star', icon: Star },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
  ];

  const handleDragStart = (e: React.DragEvent, toolId: DrawingTool) => {
    // Don't allow dragging the select tool
    if (toolId === 'select') {
      e.preventDefault();
      return;
    }
    
    // Set the drag data
    e.dataTransfer.setData('shapeTool', toolId);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a ghost image (optional, for better UX)
    const dragIcon = e.currentTarget.cloneNode(true) as HTMLElement;
    dragIcon.style.opacity = '0.7';
    dragIcon.style.transform = 'scale(1.2)';
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 32, 32);
    
    // Clean up the ghost image after a moment
    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="tool-grid">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
                onClick={() => onToolSelect(tool.id)}
                draggable={tool.id !== 'select'}
                onDragStart={(e) => handleDragStart(e, tool.id)}
                style={{ cursor: tool.id === 'select' ? 'pointer' : 'grab' }}
                title={tool.label}
              >
                <IconComponent className="tool-icon" size={20} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};