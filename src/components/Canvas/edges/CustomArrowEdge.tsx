import React from 'react';
import { BaseEdge, getStraightPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { EdgeStyleConfig, ArrowType } from '../../../types/edgeTypes';

interface CustomArrowEdgeProps extends EdgeProps {
  style?: EdgeStyleConfig;
}

// Custom marker definitions
const getMarkerDefinition = (type: ArrowType, color: string, size: number = 1) => {
  const baseSize = 10 * size;

  switch (type) {
    case 'arrow':
      return {
        id: `arrow-${color.replace('#', '')}`,
        element: (
          <marker
            id={`arrow-${color.replace('#', '')}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="3"
            markerWidth={baseSize}
            markerHeight={baseSize}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill={color}
              stroke={color}
            />
          </marker>
        )
      };
    case 'arrowclosed':
      return {
        id: `arrowclosed-${color.replace('#', '')}`,
        element: (
          <marker
            id={`arrowclosed-${color.replace('#', '')}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="3"
            markerWidth={baseSize}
            markerHeight={baseSize}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill={color}
              stroke={color}
              strokeWidth="1"
            />
          </marker>
        )
      };
    case 'circle':
      return {
        id: `circle-${color.replace('#', '')}`,
        element: (
          <marker
            id={`circle-${color.replace('#', '')}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth={baseSize}
            markerHeight={baseSize}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <circle
              cx="5"
              cy="5"
              r="3"
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
          </marker>
        )
      };
    case 'diamond':
      return {
        id: `diamond-${color.replace('#', '')}`,
        element: (
          <marker
            id={`diamond-${color.replace('#', '')}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth={baseSize}
            markerHeight={baseSize}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M2,5 L5,2 L8,5 L5,8 z"
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
          </marker>
        )
      };
    case 'triangle':
      return {
        id: `triangle-${color.replace('#', '')}`,
        element: (
          <marker
            id={`triangle-${color.replace('#', '')}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth={baseSize}
            markerHeight={baseSize}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M2,2 L8,5 L2,8 z"
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
          </marker>
        )
      };
    default:
      return null;
  }
};

export const CustomArrowEdge: React.FC<CustomArrowEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style: customStyle,
  markerEnd,
  markerStart,
  data,
  ...props
}) => {
  const style = customStyle || data?.style || ({} as EdgeStyleConfig);
  const color = style.strokeColor || '#000000';

  // Create path
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY
  });

  // Generate custom markers if needed
  const startMarker = style.markerStart ? getMarkerDefinition(style.markerStart, color) : null;
  const endMarker = style.markerEnd ? getMarkerDefinition(style.markerEnd, color) : null;

  const edgeStyle = {
    stroke: color,
    strokeWidth: style.strokeWidth || 2,
    opacity: style.opacity || 1,
    filter: style.shadowBlur ? `drop-shadow(${style.shadowOffsetX || 0}px ${style.shadowOffsetY || 0}px ${style.shadowBlur}px ${style.shadowColor || 'rgba(0,0,0,0.3)'})` : undefined
  };

  return (
    <>
      {/* Define custom markers */}
      <defs>
        {startMarker?.element}
        {endMarker?.element}
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={startMarker ? `url(#${startMarker.id})` : markerStart}
        markerEnd={endMarker ? `url(#${endMarker.id})` : markerEnd}
        style={edgeStyle}
        {...props}
      />
    </>
  );
};

export default CustomArrowEdge;