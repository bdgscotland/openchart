import React from 'react';
import { BaseEdge, getStraightPath, getSimpleBezierPath, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { EdgeStyleConfig } from '../../../types/edgeTypes';

interface CustomDashedEdgeProps extends EdgeProps {
  style?: EdgeStyleConfig;
}

export const CustomDashedEdge: React.FC<CustomDashedEdgeProps> = ({
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

  // Determine path based on curve style
  const getEdgePath = () => {
    switch (style.curveStyle) {
      case 'bezier':
        return getSimpleBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition
        });
      case 'smoothstep':
        return getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition
        });
      case 'straight':
      default:
        return getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY
        });
    }
  };

  const [edgePath, labelX, labelY] = getEdgePath();

  // Create stroke-dasharray based on line style
  const getDashArray = () => {
    switch (style.lineStyle) {
      case 'dashed':
        return '10,5';
      case 'dotted':
        return '2,3';
      case 'dashdot':
        return '10,5,2,5';
      case 'longdash':
        return '20,5';
      default:
        return 'none';
    }
  };

  const edgeStyle = {
    stroke: style.strokeColor || '#000000',
    strokeWidth: style.strokeWidth || 2,
    strokeDasharray: getDashArray(),
    opacity: style.opacity || 1,
    filter: style.shadowBlur ? `drop-shadow(${style.shadowOffsetX || 0}px ${style.shadowOffsetY || 0}px ${style.shadowBlur}px ${style.shadowColor || 'rgba(0,0,0,0.3)'})` : undefined
  };

  // Calculate label position based on labelPosition prop
  let finalLabelX = labelX;
  let finalLabelY = labelY;

  if (style.labelPosition === 'start') {
    finalLabelX = sourceX + (labelX - sourceX) * 0.25;
    finalLabelY = sourceY + (labelY - sourceY) * 0.25;
  } else if (style.labelPosition === 'end') {
    finalLabelX = targetX + (labelX - targetX) * 0.25;
    finalLabelY = targetY + (labelY - targetY) * 0.25;
  }

  // Apply label offset if provided
  if (style.labelOffset) {
    finalLabelX += style.labelOffset.x;
    finalLabelY += style.labelOffset.y;
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={edgeStyle}
      labelX={finalLabelX}
      labelY={finalLabelY}
      label={style.label}
      labelStyle={style.labelStyle}
      labelShowBg={true}
      labelBgPadding={[4, 4]}
      labelBgBorderRadius={3}
      labelBgStyle={{
        fill: style.labelStyle?.backgroundColor || '#ffffff',
        fillOpacity: 1,
      }}
      {...props}
    />
  );
};

export default CustomDashedEdge;