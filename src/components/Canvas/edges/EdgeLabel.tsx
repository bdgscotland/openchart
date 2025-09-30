import React from 'react';
import { EdgeLabelRenderer, useStore } from '@xyflow/react';
import type { EdgeLabelStyle } from '../../../types/edgeTypes';
import { DEFAULT_EDGE_LABEL_STYLE } from '../../../types/edgeTypes';

export interface EdgeLabelProps {
  id: string;
  label: string;
  labelX: number;
  labelY: number;
  labelStyle?: EdgeLabelStyle;
  labelVisible?: boolean;
  onLabelDoubleClick?: (edgeId: string) => void;
}

/**
 * EdgeLabel component for rendering labels on edges
 * Uses React Flow's EdgeLabelRenderer for proper positioning
 */
export const EdgeLabel: React.FC<EdgeLabelProps> = ({
  id,
  label,
  labelX,
  labelY,
  labelStyle,
  labelVisible = true,
  onLabelDoubleClick,
}) => {
  // Don't render if label is empty or hidden
  if (!label || !labelVisible) {
    return null;
  }

  // Merge with default styles
  const style = { ...DEFAULT_EDGE_LABEL_STYLE, ...labelStyle };

  // Get viewport transform to properly position the label
  const transform = useStore((state) => state.transform);
  const zoom = transform[2];

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLabelDoubleClick) {
      onLabelDoubleClick(id);
    }
  };

  // Calculate actual screen position
  const x = labelX * zoom + transform[0];
  const y = labelY * zoom + transform[1];

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    color: style.color,
    backgroundColor: style.backgroundColor,
    padding: `${style.padding}px`,
    borderRadius: `${style.borderRadius}px`,
    border: style.border,
    maxWidth: `${style.maxWidth}px`,
    textAlign: style.textAlign,
    pointerEvents: 'all',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    userSelect: 'none',
    zIndex: 1000,
    // Add a subtle shadow for readability
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  };

  return (
    <EdgeLabelRenderer>
      <div
        style={labelStyles}
        onDoubleClick={handleDoubleClick}
        className="react-flow__edge-label"
        data-edge-id={id}
      >
        {label}
      </div>
    </EdgeLabelRenderer>
  );
};

export default EdgeLabel;