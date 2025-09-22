import React, { useState, useCallback } from 'react';
import { PropertyPanel } from '../components/PropertyPanel/PropertyPanel';
import type { DiagramElement, ElementStyle } from '../types/diagram';
import './PropertyPanelDemo.css';

interface DemoProps {
  className?: string;
  onExitDemo?: () => void;
}

// Sample demo elements showcasing different shapes and styles
const createDemoElements = (): DiagramElement[] => [
  {
    id: 'demo-rect-1',
    type: 'rectangle',
    position: { x: 100, y: 100 },
    size: { width: 150, height: 100 },
    text: 'Primary Button',
    style: {
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 8
    }
  },
  {
    id: 'demo-circle-1',
    type: 'circle',
    position: { x: 300, y: 120 },
    size: { width: 80, height: 80 },
    text: 'Success',
    style: {
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 3,
      fontSize: 12,
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 0.9
    }
  },
  {
    id: 'demo-diamond-1',
    type: 'diamond',
    position: { x: 450, y: 90 },
    size: { width: 120, height: 120 },
    text: 'Decision?',
    style: {
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
      fontSize: 13,
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 1
    }
  },
  {
    id: 'demo-rect-2',
    type: 'rectangle',
    position: { x: 200, y: 250 },
    size: { width: 200, height: 60 },
    text: 'Secondary Action',
    style: {
      fill: '#f3f4f6',
      stroke: '#6b7280',
      strokeWidth: 1,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'center',
      opacity: 1,
      cornerRadius: 4
    }
  },
  {
    id: 'demo-circle-2',
    type: 'circle',
    position: { x: 450, y: 250 },
    size: { width: 100, height: 100 },
    text: 'Warning',
    style: {
      fill: '#fbbf24',
      stroke: '#f59e0b',
      strokeWidth: 2,
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: 0.8
    }
  }
];

export const PropertyPanelDemo: React.FC<DemoProps> = ({ className = '', onExitDemo }) => {
  const [elements, setElements] = useState<DiagramElement[]>(createDemoElements());
  const [selectedIds, setSelectedIds] = useState<string[]>(['demo-rect-1']);
  const [propertyPanelVisible, setPropertyPanelVisible] = useState(true);

  // Get selected elements
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  // Demo scenarios
  const scenarios = [
    {
      name: 'Single Selection',
      description: 'Select one element to edit all properties',
      action: () => setSelectedIds(['demo-rect-1'])
    },
    {
      name: 'Multi-Selection',
      description: 'Select multiple elements to bulk edit styles',
      action: () => setSelectedIds(['demo-rect-1', 'demo-circle-1', 'demo-diamond-1'])
    },
    {
      name: 'Different Shapes',
      description: 'Show how different shapes have unique properties',
      action: () => setSelectedIds(['demo-diamond-1'])
    },
    {
      name: 'Complex Styling',
      description: 'Demonstrate advanced styling options',
      action: () => setSelectedIds(['demo-circle-2'])
    },
    {
      name: 'No Selection',
      description: 'Show empty state when nothing is selected',
      action: () => setSelectedIds([])
    }
  ];

  // Property panel callbacks
  const handleUpdateElementStyle = useCallback((elementId: string, styleUpdates: Partial<ElementStyle>) => {
    console.log('🎨 PropertyPanelDemo handleUpdateElementStyle called:', { elementId, styleUpdates });
    setElements(prev => {
      const updated = prev.map(el =>
        el.id === elementId
          ? { ...el, style: { ...el.style, ...styleUpdates } }
          : el
      );
      console.log('🎨 PropertyPanelDemo updated elements:', updated);
      return updated;
    });
  }, []);

  const handleUpdateElementText = useCallback((elementId: string, text: string) => {
    console.log('🎨 PropertyPanelDemo handleUpdateElementText called:', { elementId, text });
    setElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, text }
          : el
      )
    );
  }, []);

  const handleUpdateElementPosition = useCallback((elementId: string, x: number, y: number) => {
    setElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, position: { x, y } }
          : el
      )
    );
  }, []);

  const handleUpdateElementSize = useCallback((elementId: string, width: number, height: number) => {
    setElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, size: { width, height } }
          : el
      )
    );
  }, []);

  const handleElementClick = useCallback((elementId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      setSelectedIds(prev =>
        prev.includes(elementId)
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      );
    } else {
      setSelectedIds([elementId]);
    }
  }, []);

  return (
    <div className={`property-panel-demo ${className}`}>
      <div className="demo-header">
        <div className="demo-header-content">
          <h2>🎨 Property Panel Integration Demo</h2>
          <p>Explore all the features of our advanced property panel with live examples</p>
        </div>
        {onExitDemo && (
          <button
            className="exit-demo-button"
            onClick={onExitDemo}
            title="Exit Demo and Return to Main App"
          >
            ← Back to App
          </button>
        )}
      </div>

      <div className="demo-controls">
        <div className="demo-scenarios">
          <h3>Demo Scenarios</h3>
          <div className="scenario-buttons">
            {scenarios.map((scenario, index) => (
              <button
                key={index}
                className="scenario-button"
                onClick={scenario.action}
                title={scenario.description}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-info">
          <div className="selection-info">
            <strong>Selected:</strong> {selectedIds.length} element{selectedIds.length !== 1 ? 's' : ''}
            {selectedIds.length > 0 && (
              <span className="selected-list">
                ({selectedIds.join(', ')})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="demo-content">
        {/* Canvas Area with Visual Elements */}
        <div className="demo-canvas">
          <div className="canvas-grid">
            {elements.map((element) => (
              <div
                key={element.id}
                className={`demo-element demo-element--${element.type} ${
                  selectedIds.includes(element.id) ? 'demo-element--selected' : ''
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height,
                  backgroundColor: element.style.fill,
                  borderColor: element.style.stroke,
                  borderWidth: element.style.strokeWidth,
                  borderStyle: 'solid',
                  borderRadius: element.type === 'circle'
                    ? '50%'
                    : element.type === 'diamond'
                      ? '0'
                      : `${element.style.cornerRadius || 0}px`,
                  opacity: element.style.opacity,
                  fontSize: element.style.fontSize,
                  fontWeight: element.style.fontWeight,
                  textAlign: element.style.textAlign,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transform: element.type === 'diamond' ? 'rotate(45deg)' : 'none',
                  color: getContrastColor(element.style.fill || '#ffffff'),
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => handleElementClick(element.id, e.metaKey || e.ctrlKey)}
              >
                <span style={{
                  transform: element.type === 'diamond' ? 'rotate(-45deg)' : 'none',
                  textAlign: 'center',
                  width: '100%',
                  padding: '4px'
                }}>
                  {element.text}
                </span>
              </div>
            ))}
          </div>

          <div className="canvas-instructions">
            <h4>Canvas Instructions:</h4>
            <ul>
              <li>Click elements to select them</li>
              <li>Cmd/Ctrl + Click for multi-selection</li>
              <li>Watch elements update in real-time as you edit properties</li>
              <li>Try different combinations of selections</li>
            </ul>
          </div>
        </div>

        {/* Property Panel */}
        <div className="demo-property-panel">
          <PropertyPanel
            selectedElements={selectedElements}
            onUpdateElementStyle={handleUpdateElementStyle}
            onUpdateElementText={handleUpdateElementText}
            onUpdateElementPosition={handleUpdateElementPosition}
            onUpdateElementSize={handleUpdateElementSize}
            isVisible={propertyPanelVisible}
            onToggleVisibility={() => setPropertyPanelVisible(!propertyPanelVisible)}
            className="demo-property-panel-instance"
          />
        </div>
      </div>

      <div className="demo-features">
        <h3>🚀 Featured Capabilities</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>🎨 Advanced Color Picker</h4>
            <p>Full-featured color picker with wheel, palette, and input modes. Supports alpha transparency and recent colors.</p>
          </div>
          <div className="feature-card">
            <h4>📐 Precise Size Controls</h4>
            <p>Advanced size and position controls with aspect ratio locking, keyboard shortcuts, and dimension swapping.</p>
          </div>
          <div className="feature-card">
            <h4>🔄 Multi-Selection</h4>
            <p>Apply style changes to multiple elements simultaneously. Perfect for consistent design systems.</p>
          </div>
          <div className="feature-card">
            <h4>♿ Accessibility First</h4>
            <p>Full keyboard navigation, ARIA labels, screen reader support, and semantic HTML structure.</p>
          </div>
          <div className="feature-card">
            <h4>⚡ Real-time Updates</h4>
            <p>Instant visual feedback as you edit properties. Changes are applied immediately to the canvas.</p>
          </div>
          <div className="feature-card">
            <h4>🎯 Shape-Specific Properties</h4>
            <p>Contextual properties based on element type. Rectangles show corner radius, circles optimize for circular shapes.</p>
          </div>
        </div>
      </div>

      <div className="demo-footer">
        <p>
          <strong>Integration Status:</strong> ✅ All components working seamlessly together
        </p>
        <p>
          <strong>Performance:</strong> Optimized for smooth interactions with large element counts
        </p>
        <p>
          <strong>Browser Support:</strong> Modern browsers with full ES2020+ support
        </p>
      </div>
    </div>
  );
};

// Utility function to determine text color based on background
function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation - convert hex to RGB and calculate luminance
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default PropertyPanelDemo;