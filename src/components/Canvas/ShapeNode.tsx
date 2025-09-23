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
  // Fast shallow comparison - avoid expensive JSON.stringify
  const prevData = prevProps.data || {};
  const nextData = nextProps.data || {};

  // Check for updates that require re-render
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevData.shape === nextData.shape &&
    prevData.label === nextData.label &&
    prevData.backgroundColor === nextData.backgroundColor &&
    prevData.borderColor === nextData.borderColor &&
    prevData.width === nextData.width &&
    prevData.height === nextData.height &&
    prevData.lastStyleUpdate === nextData.lastStyleUpdate &&
    prevData.lastTextUpdate === nextData.lastTextUpdate
  );
});

ShapeNode.displayName = 'ShapeNode';

export default ShapeNode;