import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

export const DataShape: React.FC<ShapeComponentProps> = (props) => {
  const { width = 120, height = 60 } = props;
  const skew = width * 0.15;

  return (
    <BaseShape {...props}>
      <path
        d={`M ${skew} 0
           L ${width} 0
           L ${width - skew} ${height}
           L 0 ${height}
           Z`}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
    </BaseShape>
  );
};