import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

type PolygonType = 'pentagon' | 'hexagon' | 'star';

const POLYGON_POINTS: Record<PolygonType, string> = {
  pentagon: "50,10 85,35 70,85 30,85 15,35",
  hexagon: "30,10 70,10 90,50 70,90 30,90 10,50",
  star: "50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40"
};

export const PolygonShape: React.FC<BaseShapeProps> = (props) => {
  const { data } = props;

  const polygonType = data.shape as PolygonType;
  const points = POLYGON_POINTS[polygonType] || POLYGON_POINTS.pentagon;

  // Get colors from style object or fallback to defaults
  const fillColor = data.style?.fill || data.backgroundColor || '#f0f9ff';
  const strokeColor = data.style?.stroke || data.borderColor || '#d1d5db';
  const strokeWidth = data.style?.strokeWidth || 2;

  return (
    <BaseShape {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    </BaseShape>
  );
};

export default PolygonShape;