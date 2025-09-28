import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { EdgeStyleConfig } from '../../../types/edgeTypes';

interface CustomCurvedEdgeProps extends EdgeProps {
  style?: EdgeStyleConfig;
}

export const CustomCurvedEdge: React.FC<CustomCurvedEdgeProps> = ({
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

  // Create a more sophisticated bezier curve
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: (data as any)?.curvature || 0.25 // Allow customizable curvature
  });

  const edgeStyle = {
    stroke: style.strokeColor || '#000000',
    strokeWidth: style.strokeWidth || 2,
    opacity: style.opacity || 1,
    filter: style.shadowBlur ? `drop-shadow(${style.shadowOffsetX || 0}px ${style.shadowOffsetY || 0}px ${style.shadowBlur}px ${style.shadowColor || 'rgba(0,0,0,0.3)'})` : undefined
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={edgeStyle}
        {...props}
      />
      {style.animated && (
        <path
          d={edgePath}
          stroke={style.strokeColor || '#000000'}
          strokeWidth={style.strokeWidth || 2}
          fill="none"
          opacity={0.5}
        >
          <animate
            attributeName="stroke-dasharray"
            values="0,10;10,0"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      )}
    </>
  );
};

export default CustomCurvedEdge;