import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const ProcessShape: React.FC<BaseShapeProps> = (props) => {
  const { data } = props;
  const width = data.width || 120;
  const height = data.height || 60;

  // Get colors from style object or fallback to defaults
  const fillColor = data.style?.fill || data.backgroundColor || '#f0f9ff';
  const strokeColor = data.style?.stroke || data.borderColor || '#d1d5db';
  const strokeWidth = data.style?.strokeWidth || 2;

  return (
    <BaseShape {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          rx="4"
          ry="4"
        />
      </svg>
    </BaseShape>
  );
};