import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

export const DocumentShape: React.FC<ShapeComponentProps> = (props) => {
  const { width = 100, height = 80 } = props;
  const waveHeight = height * 0.1;

  return (
    <BaseShape {...props}>
      <path
        d={`M 0 0
           L ${width} 0
           L ${width} ${height - waveHeight}
           Q ${width * 0.75} ${height - waveHeight * 2} ${width * 0.5} ${height - waveHeight}
           Q ${width * 0.25} ${height} 0 ${height - waveHeight}
           Z`}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
    </BaseShape>
  );
};