import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

export const ProcessShape: React.FC<ShapeComponentProps> = (props) => {
  const { width = 120, height = 60 } = props;

  return (
    <BaseShape {...props}>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        rx="4"
        ry="4"
      />
    </BaseShape>
  );
};