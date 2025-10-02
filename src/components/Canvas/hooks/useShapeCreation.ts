import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import type { DrawingTool } from '../../../types/shapes';
import { createShapeNode, isValidShapeType } from '../shapes';
import { useLayers } from '../../../contexts/LayerContext';
import { useUndoRedo } from '../../../contexts/UndoRedoContext';
import { CreateNodeCommand } from '../../../core/commands/CreateNodeCommand';

interface UseShapeCreationOptions {
  selectedTool: DrawingTool;
  selectedIconName?: string;
  onNodesChange: (callback: (nodes: Node[]) => Node[]) => void;
}

export const useShapeCreation = ({ selectedTool, selectedIconName, onNodesChange }: UseShapeCreationOptions) => {
  const { getActiveLayer } = useLayers();
  const { executeCommand } = useUndoRedo();

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

    // Get the active layer ID
    const activeLayer = getActiveLayer();

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

    // Add layerId and iconName (if icon shape) to the node's data
    newNode.data = {
      ...newNode.data,
      layerId: activeLayer.id,
      ...(selectedTool === 'icon' && selectedIconName ? { iconName: selectedIconName } : {}),
    };

    // Add the new node to the canvas using CreateNodeCommand for undo/redo support
    const command = new CreateNodeCommand(newNode);
    executeCommand(command);
  }, [selectedTool, selectedIconName, onNodesChange, getActiveLayer, executeCommand]);

  return {
    handleCanvasClick,
    canCreateShape: selectedTool && selectedTool !== 'select' && isValidShapeType(selectedTool),
  };
};

export default useShapeCreation;