import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const CrossShape: React.FC<BaseShapeProps> = (props) => {
  const { data } = props;
  const width = data.width || 60;
  const height = data.height || 60;
  const strokeWidth = Math.min(width, height) * 0.1;

  // Get colors from style object or fallback to defaults
  const strokeColor = data.style?.stroke || data.borderColor || '#d1d5db';

  return (
    <BaseShape {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Horizontal line */}
        <line
          x1={strokeWidth}
          y1={height / 2}
          x2={width - strokeWidth}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Vertical line */}
        <line
          x1={width / 2}
          y1={strokeWidth}
          x2={width / 2}
          y2={height - strokeWidth}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </BaseShape>
  );
};