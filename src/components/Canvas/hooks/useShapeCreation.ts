import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import type { DrawingTool } from '../../../types/shapes';
import { createShapeNode, isValidShapeType } from '../shapes';

interface UseShapeCreationOptions {
  selectedTool: DrawingTool;
  onNodesChange: (callback: (nodes: Node[]) => Node[]) => void;
}

export const useShapeCreation = ({ selectedTool, onNodesChange }: UseShapeCreationOptions) => {
  
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only create shapes when a drawing tool is selected (not select)
    if (!selectedTool || selectedTool === 'select') {
      return;
    }

    // Skip if it's not a valid shape type
    if (!isValidShapeType(selectedTool)) {
      console.warn(`Cannot create shape: ${selectedTool} is not a valid shape type`);
      return;
    }

    // Get the canvas position by getting the wrapper element bounds
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = {
      x: event.clientX - reactFlowBounds.left - 60, // Center the shape
      y: event.clientY - reactFlowBounds.top - 40
    };

    // Create a new shape node using the factory
    const newNode = createShapeNode({
      id: `node-${Date.now()}`,
      position,
      shapeType: selectedTool,
      onTextChange: (text: string) => {
        // Update the node's text when changed  
        onNodesChange((nodes) => 
          nodes.map(n => 
            n.id === newNode.id 
              ? { ...n, data: { ...n.data, label: text } }
              : n
          )
        );
      }
    });

    // Add the new node to the canvas
    onNodesChange((nodes) => [...nodes, newNode]);
  }, [selectedTool, onNodesChange]);

  return {
    handleCanvasClick,
    canCreateShape: selectedTool && selectedTool !== 'select' && isValidShapeType(selectedTool),
  };
};

export default useShapeCreation;