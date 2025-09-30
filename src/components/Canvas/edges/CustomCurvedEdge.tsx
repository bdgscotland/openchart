import React from 'react';
import { BaseEdge, getBezierPath, getStraightPath, getSmoothStepPath, MarkerType } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { EdgeStyleConfig, LineStyle, ArrowType, CurveStyle } from '../../../types/edgeTypes';

interface CustomCurvedEdgeProps extends EdgeProps {
  style?: EdgeStyleConfig;
}

// Convert our ArrowType to React Flow's MarkerType
const getMarkerType = (arrowType?: ArrowType) => {
  if (!arrowType || arrowType === 'none') return undefined;

  switch (arrowType) {
    case 'arrow':
      return { type: MarkerType.Arrow };
    case 'arrowclosed':
      return { type: MarkerType.ArrowClosed };
    default:
      return { type: MarkerType.Arrow };
  }
};

// Convert LineStyle to strokeDasharray
const getStrokeDasharray = (lineStyle?: LineStyle): string | undefined => {
  switch (lineStyle) {
    case 'dashed':
      return '8 4';
    case 'dotted':
      return '2 4';
    case 'dashdot':
      return '8 4 2 4';
    case 'longdash':
      return '16 8';
    case 'solid':
    default:
      return undefined;
  }
};

export const CustomCurvedEdge: React.FC<CustomCurvedEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style: customStyle,
  markerEnd: propsMarkerEnd,
  markerStart: propsMarkerStart,
  data,
  ...props
}) => {
  const style = customStyle || data?.style || ({} as EdgeStyleConfig);

  // Determine which path generator to use based on curveStyle
  const curveStyle = style.curveStyle || 'bezier';
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  switch (curveStyle) {
    case 'straight':
      [edgePath, labelX, labelY] = getStraightPath(pathParams);
      break;
    case 'smoothstep':
    case 'step':
      [edgePath, labelX, labelY] = getSmoothStepPath(pathParams);
      break;
    case 'bezier':
    default:
      [edgePath, labelX, labelY] = getBezierPath({
        ...pathParams,
        curvature: (data as any)?.curvature || 0.25
      });
      break;
  }

  // Use markers from style if available, otherwise use props
  const markerEnd = getMarkerType(style.markerEnd) || propsMarkerEnd;
  const markerStart = getMarkerType(style.markerStart) || propsMarkerStart;

  const edgeStyle = {
    stroke: style.strokeColor || '#000000',
    strokeWidth: style.strokeWidth || 2,
    strokeDasharray: getStrokeDasharray(style.lineStyle),
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

  // Build label style object from EdgeLabelStyle
  const labelStyleObj = style.labelStyle ? {
    fontSize: style.labelStyle.fontSize || 12,
    fontFamily: style.labelStyle.fontFamily || 'Arial, sans-serif',
    fontWeight: style.labelStyle.fontWeight || 'normal',
    fontStyle: style.labelStyle.fontStyle || 'normal',
    fill: style.labelStyle.color || '#000000',
  } : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={edgeStyle}
        labelX={finalLabelX}
        labelY={finalLabelY}
        label={style.label}
        labelStyle={labelStyleObj}
        labelShowBg={!!style.label}
        labelBgPadding={[style.labelStyle?.padding || 4, style.labelStyle?.padding || 4]}
        labelBgBorderRadius={style.labelStyle?.borderRadius || 3}
        labelBgStyle={{
          fill: style.labelStyle?.backgroundColor || '#ffffff',
          fillOpacity: 0.9,
        }}
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