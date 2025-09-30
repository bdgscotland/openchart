import React, { useState, useCallback } from 'react';
import { Type, AlignCenter, Bold, Italic, Palette } from 'lucide-react';
import type { Edge } from '@xyflow/react';
import type { EdgeStyleConfig, EdgeLabelStyle, LineStyle, ArrowType } from '../../types/edgeTypes';
import { EDGE_COLOR_PRESETS, DEFAULT_EDGE_LABEL_STYLE } from '../../types/edgeTypes';
import './EdgePropertiesPanel.css';

export interface EdgePropertiesPanelProps {
  selectedEdge: Edge;
  onUpdateEdgeStyle: (edgeId: string, styleUpdates: Partial<EdgeStyleConfig>) => void;
}

export const EdgePropertiesPanel: React.FC<EdgePropertiesPanelProps> = ({
  selectedEdge,
  onUpdateEdgeStyle,
}) => {
  const edgeStyle = (selectedEdge.data?.style || {}) as EdgeStyleConfig;
  const labelStyle = edgeStyle.labelStyle || DEFAULT_EDGE_LABEL_STYLE;

  const [showLabelStyler, setShowLabelStyler] = useState(false);

  const handleLabelChange = useCallback((label: string) => {
    onUpdateEdgeStyle(selectedEdge.id, { label });
  }, [selectedEdge.id, onUpdateEdgeStyle]);

  const handleLabelPositionChange = useCallback((position: 'start' | 'middle' | 'end') => {
    onUpdateEdgeStyle(selectedEdge.id, { labelPosition: position });
  }, [selectedEdge.id, onUpdateEdgeStyle]);

  const handleLabelStyleChange = useCallback((styleUpdates: Partial<EdgeLabelStyle>) => {
    const updatedLabelStyle = { ...labelStyle, ...styleUpdates };
    onUpdateEdgeStyle(selectedEdge.id, { labelStyle: updatedLabelStyle });
  }, [selectedEdge.id, onUpdateEdgeStyle, labelStyle]);

  const handleStrokeColorChange = useCallback((color: string) => {
    onUpdateEdgeStyle(selectedEdge.id, { strokeColor: color });
  }, [selectedEdge.id, onUpdateEdgeStyle]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    onUpdateEdgeStyle(selectedEdge.id, { strokeWidth: width });
  }, [selectedEdge.id, onUpdateEdgeStyle]);

  const handleLineStyleChange = useCallback((lineStyle: LineStyle) => {
    onUpdateEdgeStyle(selectedEdge.id, { lineStyle });
  }, [selectedEdge.id, onUpdateEdgeStyle]);

  const handleMarkerChange = useCallback((position: 'start' | 'end', marker: ArrowType) => {
    if (position === 'start') {
      onUpdateEdgeStyle(selectedEdge.id, { markerStart: marker });
    } else {
      onUpdateEdgeStyle(selectedEdge.id, { markerEnd: marker });
    }
  }, [selectedEdge.id, onUpdateEdgeStyle]);

  return (
    <div className="edge-properties-panel">
      <div className="properties-section">
        <h3 className="section-title">
          <Type size={16} />
          Edge Label
        </h3>

        <div className="control-group">
          <label htmlFor="edge-label">Label Text</label>
          <textarea
            id="edge-label"
            value={edgeStyle.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter edge label..."
            rows={3}
            className="edge-label-input"
          />
        </div>

        {edgeStyle.label && (
          <>
            <div className="control-group">
              <label>Label Position</label>
              <div className="button-group">
                <button
                  className={`btn-sm ${edgeStyle.labelPosition === 'start' ? 'active' : ''}`}
                  onClick={() => handleLabelPositionChange('start')}
                  title="Start"
                >
                  Start
                </button>
                <button
                  className={`btn-sm ${(!edgeStyle.labelPosition || edgeStyle.labelPosition === 'middle') ? 'active' : ''}`}
                  onClick={() => handleLabelPositionChange('middle')}
                  title="Middle"
                >
                  Middle
                </button>
                <button
                  className={`btn-sm ${edgeStyle.labelPosition === 'end' ? 'active' : ''}`}
                  onClick={() => handleLabelPositionChange('end')}
                  title="End"
                >
                  End
                </button>
              </div>
            </div>

            <div className="control-group">
              <button
                className="expand-button"
                onClick={() => setShowLabelStyler(!showLabelStyler)}
              >
                <Palette size={14} />
                <span>Label Styling</span>
                <span className="expand-icon">{showLabelStyler ? '▼' : '▶'}</span>
              </button>
            </div>

            {showLabelStyler && (
              <div className="label-style-controls">
                <div className="control-group">
                  <label htmlFor="label-font-size">Font Size</label>
                  <input
                    id="label-font-size"
                    type="number"
                    value={labelStyle.fontSize || 12}
                    onChange={(e) => handleLabelStyleChange({ fontSize: parseInt(e.target.value) })}
                    min="8"
                    max="48"
                  />
                </div>

                <div className="control-group">
                  <label>Text Style</label>
                  <div className="button-group">
                    <button
                      className={`btn-icon ${labelStyle.fontWeight === 'bold' ? 'active' : ''}`}
                      onClick={() => handleLabelStyleChange({
                        fontWeight: labelStyle.fontWeight === 'bold' ? 'normal' : 'bold'
                      })}
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      className={`btn-icon ${labelStyle.fontStyle === 'italic' ? 'active' : ''}`}
                      onClick={() => handleLabelStyleChange({
                        fontStyle: labelStyle.fontStyle === 'italic' ? 'normal' : 'italic'
                      })}
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <label htmlFor="label-text-color">Text Color</label>
                  <input
                    id="label-text-color"
                    type="color"
                    value={labelStyle.color || '#000000'}
                    onChange={(e) => handleLabelStyleChange({ color: e.target.value })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="label-bg-color">Background Color</label>
                  <input
                    id="label-bg-color"
                    type="color"
                    value={labelStyle.backgroundColor || '#ffffff'}
                    onChange={(e) => handleLabelStyleChange({ backgroundColor: e.target.value })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="label-padding">Padding</label>
                  <input
                    id="label-padding"
                    type="number"
                    value={labelStyle.padding || 4}
                    onChange={(e) => handleLabelStyleChange({ padding: parseInt(e.target.value) })}
                    min="0"
                    max="20"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="properties-section">
        <h3 className="section-title">Edge Style</h3>

        <div className="control-group">
          <label htmlFor="stroke-color">Line Color</label>
          <div className="color-picker-group">
            <input
              id="stroke-color"
              type="color"
              value={edgeStyle.strokeColor || '#000000'}
              onChange={(e) => handleStrokeColorChange(e.target.value)}
            />
            <div className="color-presets">
              {EDGE_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => handleStrokeColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="stroke-width">Line Width</label>
          <input
            id="stroke-width"
            type="range"
            value={edgeStyle.strokeWidth || 2}
            onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
            min="1"
            max="10"
          />
          <span className="value-display">{edgeStyle.strokeWidth || 2}px</span>
        </div>

        <div className="control-group">
          <label>Line Style</label>
          <select
            value={edgeStyle.lineStyle || 'solid'}
            onChange={(e) => handleLineStyleChange(e.target.value as LineStyle)}
            className="line-style-select"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="dashdot">Dash-Dot</option>
            <option value="longdash">Long Dash</option>
          </select>
        </div>

        <div className="control-group">
          <label>Start Marker</label>
          <select
            value={edgeStyle.markerStart || 'none'}
            onChange={(e) => handleMarkerChange('start', e.target.value as ArrowType)}
            className="marker-select"
          >
            <option value="none">None</option>
            <option value="arrow">Arrow</option>
            <option value="arrowclosed">Arrow (Filled)</option>
            <option value="circle">Circle</option>
            <option value="diamond">Diamond</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>

        <div className="control-group">
          <label>End Marker</label>
          <select
            value={edgeStyle.markerEnd || 'arrow'}
            onChange={(e) => handleMarkerChange('end', e.target.value as ArrowType)}
            className="marker-select"
          >
            <option value="none">None</option>
            <option value="arrow">Arrow</option>
            <option value="arrowclosed">Arrow (Filled)</option>
            <option value="circle">Circle</option>
            <option value="diamond">Diamond</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EdgePropertiesPanel;