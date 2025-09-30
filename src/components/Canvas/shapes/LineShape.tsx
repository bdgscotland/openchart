import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const LineShape: React.FC<BaseShapeProps> = (props) => {
  const { data } = props;
  const width = data.width || 100;
  const height = data.height || 2;

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
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth={Math.max(height, 2)}
          strokeLinecap="round"
        />
      </svg>
    </BaseShape>
  );
};