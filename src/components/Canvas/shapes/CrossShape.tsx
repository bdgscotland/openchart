import React from 'react';
import { BaseShape } from './BaseShape';
import type { ShapeComponentProps } from './BaseShape';

export const CrossShape: React.FC<ShapeComponentProps> = (props) => {
  const { width = 60, height = 60 } = props;
  const strokeWidth = Math.min(width, height) * 0.1;

  return (
    <BaseShape {...props}>
      {/* Horizontal line */}
      <line
        x1={strokeWidth}
        y1={height / 2}
        x2={width - strokeWidth}
        y2={height / 2}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Vertical line */}
      <line
        x1={width / 2}
        y1={strokeWidth}
        x2={width / 2}
        y2={height - strokeWidth}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </BaseShape>
  );
};