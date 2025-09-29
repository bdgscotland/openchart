import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { DiagramSettings, ElementStyle } from '../types/diagram';
import useShapeCreation from '../components/Canvas/hooks/useShapeCreation';
import { useClipboard } from '../hooks/useClipboard';
import { useActionToolbar } from '../hooks/useActionToolbar';

interface CanvasOperationsContextType {
  // Canvas interaction handlers
  handlePaneClick: (event: React.MouseEvent) => void;
  handleCanvasClick: (event: React.MouseEvent) => void;

  // Element update handlers
  handleUpdateElementStyle: (elementId: string, styleUpdates: any) => void;
  handleUpdateElementText: (elementId: string, text: string) => void;
  handleUpdateElementPosition: (elementId: string, x: number, y: number) => void;
  handleUpdateElementSize: (elementId: string, width: number, height: number) => void;

  // Zoom and view control handlers
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleFitToView: () => void;

  // Undo/redo handlers
  handleUndo: () => void;
  handleRedo: () => void;

  // Clipboard operations
  clipboard: {
    copySelection: () => void;
    pasteSelection: () => void;
    duplicateSelection: () => void;
  };

  // Action toolbar reference
  actionToolbar: any;
}

interface CanvasOperationsProviderProps {
  children: ReactNode;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  selectedTool: string;
  canvasState: any;
  flowRef: React.RefObject<any>;
}

const CanvasOperationsContext = createContext<CanvasOperationsContextType | undefined>(undefined);

export const CanvasOperationsProvider: React.FC<CanvasOperationsProviderProps> = ({
  children,
  nodes,
  edges,
  setNodes,
  setEdges,
  selectedTool,
  canvasState,
  flowRef,
}) => {
  // Shape creation hook
  const { handleCanvasClick } = useShapeCreation({
    selectedTool,
    onNodesChange: setNodes,
  });

  // Clipboard functionality
  const clipboard = useClipboard({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
  });

  // Action toolbar functionality
  const actionToolbar = useActionToolbar({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
    canUndo: canvasState.canUndo,
    canRedo: canvasState.canRedo,
    onUndo: () => canvasState.undo(),
    onRedo: () => canvasState.redo(),
    flowCanvasRef: flowRef,
  });

  // Enhanced pane click handler that handles both shape creation and deselection
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // First handle shape creation if a tool is selected
    handleCanvasClick(event);

    // Then handle deselection - clear all selected nodes
    setNodes(currentNodes => {
      const hasSelectedNodes = currentNodes.some(node => node.selected);
      if (hasSelectedNodes) {
        console.log('🎯 Pane clicked - deselecting all nodes');
        return currentNodes.map(node => ({ ...node, selected: false }));
      }
      return currentNodes;
    });

    // Also clear selected edges
    setEdges(currentEdges => {
      const hasSelectedEdges = currentEdges.some(edge => edge.selected);
      if (hasSelectedEdges) {
        console.log('🎯 Pane clicked - deselecting all edges');
        return currentEdges.map(edge => ({ ...edge, selected: false }));
      }
      return currentEdges;
    });
  }, [handleCanvasClick, setNodes, setEdges]);

  // PropertyPanel callback handlers that update React Flow nodes
  const handleUpdateElementStyle = useCallback((elementId: string, styleUpdates: any) => {
    console.log('🎨 handleUpdateElementStyle called:', { elementId, styleUpdates });

    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.id === elementId) {
          // Get current style and merge with updates
          const currentStyle = node.data?.style || {};
          const newStyle = { ...currentStyle, ...styleUpdates };

          // Create a completely new node object to force React Flow re-render
          const updatedNode = {
            ...node,
            // Force React Flow to detect change with a new data object
            data: {
              ...node.data,
              style: newStyle,
              // Also update legacy properties for backward compatibility
              backgroundColor: newStyle.fill || node.data?.backgroundColor,
              borderColor: newStyle.stroke || node.data?.borderColor,
              // Add a timestamp to force re-render
              lastStyleUpdate: Date.now(),
            },
          };

          console.log('🎨 Node updated with new style:', {
            id: updatedNode.id,
            oldStyle: currentStyle,
            newStyle,
            timestamp: updatedNode.data.lastStyleUpdate
          });

          return updatedNode;
        }
        return node;
      });
    });
  }, [setNodes]);

  const handleUpdateElementText = useCallback((elementId: string, text: string) => {
    console.log('🎨 handleUpdateElementText called:', { elementId, text });

    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.id === elementId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: text,
              // Add timestamp to force re-render
              lastTextUpdate: Date.now(),
            }
          };
        }
        return node;
      });
    });
  }, [setNodes]);

  const handleUpdateElementPosition = useCallback((elementId: string, x: number, y: number) => {
    setNodes(nodes => nodes.map(node =>
      node.id === elementId
        ? { ...node, position: { x, y } }
        : node
    ));
  }, [setNodes]);

  const handleUpdateElementSize = useCallback((elementId: string, width: number, height: number) => {
    setNodes(nodes => nodes.map(node =>
      node.id === elementId
        ? {
            ...node,
            data: { ...node.data, width, height },
            style: { ...node.style, width, height }
          }
        : node
    ));
  }, [setNodes]);

  // Zoom handlers - using actionToolbar functions
  const handleZoomIn = useCallback(() => {
    actionToolbar.handleZoomIn();
  }, [actionToolbar.handleZoomIn]);

  const handleZoomOut = useCallback(() => {
    actionToolbar.handleZoomOut();
  }, [actionToolbar.handleZoomOut]);

  const handleFitToView = useCallback(() => {
    actionToolbar.handleFitToView();
  }, [actionToolbar.handleFitToView]);

  // Undo/redo handlers
  const handleUndo = useCallback(() => {
    canvasState.undo();
  }, [canvasState]);

  const handleRedo = useCallback(() => {
    canvasState.redo();
  }, [canvasState]);

  const contextValue: CanvasOperationsContextType = {
    handlePaneClick,
    handleCanvasClick,
    handleUpdateElementStyle,
    handleUpdateElementText,
    handleUpdateElementPosition,
    handleUpdateElementSize,
    handleZoomIn,
    handleZoomOut,
    handleFitToView,
    handleUndo,
    handleRedo,
    clipboard,
    actionToolbar,
  };

  return (
    <CanvasOperationsContext.Provider value={contextValue}>
      {children}
    </CanvasOperationsContext.Provider>
  );
};

export const useCanvasOperations = (): CanvasOperationsContextType => {
  const context = useContext(CanvasOperationsContext);
  if (context === undefined) {
    throw new Error('useCanvasOperations must be used within a CanvasOperationsProvider');
  }
  return context;
};