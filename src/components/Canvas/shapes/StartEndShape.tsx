import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

export const StartEndShape: React.FC<ShapeComponentProps> = (props) => {
  const { width = 100, height = 50 } = props;
  const rx = height / 2; // Make it pill-shaped

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
        rx={rx}
        ry={rx}
      />
    </BaseShape>
  );
};