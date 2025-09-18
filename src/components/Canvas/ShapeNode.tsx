import React from 'react';
import type { NodeProps } from 'reactflow';
import { getShapeComponent, isValidShapeType } from './shapes';
import type { BaseShapeProps } from './shapes/BaseShape';

/**
 * Universal ShapeNode component that routes to the appropriate shape component
 * based on the data.shape property
 */
export const ShapeNode: React.FC<NodeProps> = (props) => {
  const { data } = props;
  const shapeType = data?.shape;

  // Fallback to rectangle if no shape type or invalid shape type
  const validShapeType = isValidShapeType(shapeType) ? shapeType : 'rectangle';
  
  // Get the appropriate component for this shape type
  const ShapeComponent = getShapeComponent(validShapeType);

  // Pass through all props to the specific shape component
  return <ShapeComponent {...(props as BaseShapeProps)} />;
};

export default ShapeNode;