import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const RectangleShape: React.FC<BaseShapeProps> = (props) => {
  return (
    <BaseShape 
      {...props}
      shapeConfig={{
        borderRadius: '8px'
      }}
    />
  );
};

export default RectangleShape;