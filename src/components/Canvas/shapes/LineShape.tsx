import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

export const LineShape: React.FC<ShapeComponentProps> = (props) => {
  const { width = 100, height = 2 } = props;

  return (
    <BaseShape {...props}>
      <line
        x1="0"
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="currentColor"
        strokeWidth={Math.max(height, 2)}
        strokeLinecap="round"
      />
    </BaseShape>
  );
};