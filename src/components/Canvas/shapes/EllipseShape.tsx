import React from 'react';
import BaseShape, { type BaseShapeProps } from './BaseShape';

export const EllipseShape: React.FC<BaseShapeProps> = (props) => {
  return (
    <BaseShape 
      {...props}
      shapeConfig={{
        borderRadius: '50%',
        transform: 'scaleY(0.6)',
      }}
    >
      <div style={{ transform: 'scaleY(1.67)' }}>
        <div style={{ textAlign: 'center', fontSize: '14px', userSelect: 'none', color: '#1f2937' }}>
          {props.data.label || 'Shape'}
        </div>
      </div>
    </BaseShape>
  );
};

export default EllipseShape;