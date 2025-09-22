import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { getShapeComponent, isValidShapeType } from './shapes';
import type { BaseShapeProps } from './shapes/BaseShape';

/**
 * Universal ShapeNode component that routes to the appropriate shape component
 * based on the data.shape property
 */
export const ShapeNode: React.FC<NodeProps> = memo((props) => {
  const { data } = props;
  const shapeType = data?.shape;

  // Fallback to rectangle if no shape type or invalid shape type
  const validShapeType = isValidShapeType(shapeType) ? shapeType : 'rectangle';
  
  // Get the appropriate component for this shape type
  const ShapeComponent = getShapeComponent(validShapeType);

  // Pass through all props to the specific shape component
  return <ShapeComponent {...(props as BaseShapeProps)} />;
}, (prevProps, nextProps) => {
  // Optimize ShapeNode re-renders but ensure style changes propagate
  const prevStyle = prevProps.data.style || {};
  const nextStyle = nextProps.data.style || {};

  const styleChanged = JSON.stringify(prevStyle) !== JSON.stringify(nextStyle);

  if (styleChanged) {
    console.log('🔄 ShapeNode re-rendering due to style change');
    return false; // Force re-render
  }

  return (
    prevProps.data.shape === nextProps.data.shape &&
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.backgroundColor === nextProps.data.backgroundColor &&
    prevProps.data.borderColor === nextProps.data.borderColor &&
    prevProps.data.width === nextProps.data.width &&
    prevProps.data.height === nextProps.data.height &&
    prevProps.selected === nextProps.selected &&
    prevProps.id === nextProps.id
  );
});

ShapeNode.displayName = 'ShapeNode';

export default ShapeNode;