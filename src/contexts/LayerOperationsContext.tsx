import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Node } from '@xyflow/react';
import { useUndoRedo } from './UndoRedoContext';
import { ZOrderCommand } from '../core/commands/ZOrderCommand';

interface LayerOperationsContextType {
  // Layer ordering operations
  bringToFront: (nodeIds: string[]) => void;
  bringForward: (nodeIds: string[]) => void;
  sendBackward: (nodeIds: string[]) => void;
  sendToBack: (nodeIds: string[]) => void;

  // Utility functions
  getNodeZIndex: (nodeId: string) => number;
  getAllZIndices: () => number[];
}

interface LayerOperationsProviderProps {
  children: ReactNode;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

const LayerOperationsContext = createContext<LayerOperationsContextType | undefined>(undefined);

export const LayerOperationsProvider: React.FC<LayerOperationsProviderProps> = ({
  children,
  nodes,
  setNodes,
}) => {
  // Get undo/redo context
  const undoRedo = useUndoRedo();

  // Get the current z-index of a node (default to 0 if not set)
  const getNodeZIndex = useCallback((nodeId: string): number => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.zIndex ?? 0;
  }, [nodes]);

  // Get all z-indices currently in use
  const getAllZIndices = useCallback((): number[] => {
    return nodes.map(node => node.zIndex ?? 0).sort((a, b) => a - b);
  }, [nodes]);

  // Bring selected nodes to the very front (highest z-index + 1)
  const bringToFront = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;

    // Find the current maximum z-index
    const maxZIndex = Math.max(...nodes.map(node => node.zIndex ?? 0), 0);
    const newZIndex = maxZIndex + 1;

    // Create z-order changes for command
    const changes = nodeIds.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      return {
        nodeId,
        previousZIndex: node?.zIndex,
        newZIndex,
      };
    });

    // Execute command
    const command = new ZOrderCommand(changes, 'Bring to front');
    undoRedo.executeCommand(command);
  }, [nodes, undoRedo]);

  // Move selected nodes forward one layer
  const bringForward = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;

    setNodes(currentNodes => {
      // Get all unique z-indices sorted ascending
      const allZIndices = [...new Set(currentNodes.map(node => node.zIndex ?? 0))].sort((a, b) => a - b);

      return currentNodes.map(node => {
        if (nodeIds.includes(node.id)) {
          const currentZIndex = node.zIndex ?? 0;

          // Find the next higher z-index level
          const currentIndexInArray = allZIndices.indexOf(currentZIndex);

          // If already at the top, don't change
          if (currentIndexInArray === allZIndices.length - 1) {
            return node;
          }

          // Move to the next z-index level
          const nextZIndex = allZIndices[currentIndexInArray + 1];

          return {
            ...node,
            zIndex: nextZIndex + 0.5, // Use .5 to insert between levels
          };
        }
        return node;
      });
    });

    // Normalize z-indices after the operation to avoid floating points accumulating
    setTimeout(() => normalizeZIndices(), 0);
  }, [setNodes]);

  // Move selected nodes backward one layer
  const sendBackward = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;

    setNodes(currentNodes => {
      // Get all unique z-indices sorted ascending
      const allZIndices = [...new Set(currentNodes.map(node => node.zIndex ?? 0))].sort((a, b) => a - b);

      return currentNodes.map(node => {
        if (nodeIds.includes(node.id)) {
          const currentZIndex = node.zIndex ?? 0;

          // Find the next lower z-index level
          const currentIndexInArray = allZIndices.indexOf(currentZIndex);

          // If already at the bottom, don't change
          if (currentIndexInArray === 0 || currentIndexInArray === -1) {
            return node;
          }

          // Move to the previous z-index level
          const prevZIndex = allZIndices[currentIndexInArray - 1];

          return {
            ...node,
            zIndex: prevZIndex - 0.5, // Use .5 to insert between levels
          };
        }
        return node;
      });
    });

    // Normalize z-indices after the operation
    setTimeout(() => normalizeZIndices(), 0);
  }, [setNodes]);

  // Send selected nodes to the very back (lowest z-index - 1)
  const sendToBack = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;

    // Find the current minimum z-index
    const minZIndex = Math.min(...nodes.map(node => node.zIndex ?? 0), 0);
    const newZIndex = minZIndex - 1;

    // Create z-order changes for command
    const changes = nodeIds.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      return {
        nodeId,
        previousZIndex: node?.zIndex,
        newZIndex,
      };
    });

    // Execute command
    const command = new ZOrderCommand(changes, 'Send to back');
    undoRedo.executeCommand(command);
  }, [nodes, undoRedo]);

  // Normalize z-indices to be sequential integers (0, 1, 2, 3, ...)
  // This prevents floating point accumulation from bringForward/sendBackward
  const normalizeZIndices = useCallback(() => {
    setNodes(currentNodes => {
      // Sort nodes by current z-index
      const sortedNodes = [...currentNodes].sort((a, b) => {
        const aZ = a.zIndex ?? 0;
        const bZ = b.zIndex ?? 0;
        return aZ - bZ;
      });

      // Create a map of old z-index to new sequential z-index
      const zIndexMap = new Map<number, number>();
      sortedNodes.forEach((node, index) => {
        const oldZ = node.zIndex ?? 0;
        if (!zIndexMap.has(oldZ)) {
          zIndexMap.set(oldZ, index);
        }
      });

      // Apply normalized z-indices
      return currentNodes.map(node => {
        const oldZ = node.zIndex ?? 0;
        const newZ = zIndexMap.get(oldZ) ?? 0;
        return {
          ...node,
          zIndex: newZ,
        };
      });
    });
  }, [setNodes]);

  const contextValue: LayerOperationsContextType = {
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    getNodeZIndex,
    getAllZIndices,
  };

  return (
    <LayerOperationsContext.Provider value={contextValue}>
      {children}
    </LayerOperationsContext.Provider>
  );
};

export const useLayerOperations = (): LayerOperationsContextType => {
  const context = useContext(LayerOperationsContext);
  if (context === undefined) {
    throw new Error('useLayerOperations must be used within a LayerOperationsProvider');
  }
  return context;
};