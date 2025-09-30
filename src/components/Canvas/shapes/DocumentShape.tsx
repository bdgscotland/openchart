import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const DocumentShape: React.FC<BaseShapeProps> = (props) => {
  const { data } = props;
  const width = data.width || 100;
  const height = data.height || 80;
  const waveHeight = height * 0.1;

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
        <path
          d={`M 0 0
             L ${width} 0
             L ${width} ${height - waveHeight}
             Q ${width * 0.75} ${height - waveHeight * 2} ${width * 0.5} ${height - waveHeight}
             Q ${width * 0.25} ${height} 0 ${height - waveHeight}
             Z`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    </BaseShape>
  );
};