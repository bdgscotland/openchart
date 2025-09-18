import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const CircleShape: React.FC<BaseShapeProps> = (props) => {
  const size = Math.max(props.data.width || 120, props.data.height || 80);
  
  return (
    <BaseShape 
      {...props}
      shapeConfig={{
        borderRadius: '50%',
        width: size,
        height: size,
      }}
    />
  );
};

export default CircleShape;