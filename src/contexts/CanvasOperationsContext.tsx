import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { DiagramSettings, ElementStyle } from '../types/diagram';
import type { EdgeStyleConfig } from '../types/edgeTypes';
import useShapeCreation from '../components/Canvas/hooks/useShapeCreation';
import { useClipboard } from '../hooks/useClipboard';
import { useActionToolbar } from '../hooks/useActionToolbar';
import { useUndoRedo } from './UndoRedoContext';
import { UpdateStyleCommand } from '../core/commands/UpdateStyleCommand';
import { UpdateTextCommand } from '../core/commands/UpdateTextCommand';
import { UpdateEdgeStyleCommand } from '../core/commands/UpdateEdgeStyleCommand';

interface CanvasOperationsContextType {
  // Canvas interaction handlers
  handlePaneClick: (event: React.MouseEvent) => void;
  handleCanvasClick: (event: React.MouseEvent) => void;

  // Element update handlers
  handleUpdateElementStyle: (elementId: string, styleUpdates: any) => void;
  handleUpdateElementText: (elementId: string, text: string) => void;
  handleUpdateElementPosition: (elementId: string, x: number, y: number) => void;
  handleUpdateElementSize: (elementId: string, width: number, height: number) => void;

  // Edge update handlers
  handleUpdateEdgeStyle: (edgeId: string, styleUpdates: Partial<EdgeStyleConfig>) => void;

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
  // Get undo/redo context
  const undoRedo = useUndoRedo();

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
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    onUndo: undoRedo.undo,
    onRedo: undoRedo.redo,
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

    // Find the node to get its current style
    const node = nodes.find(n => n.id === elementId);
    if (!node) return;

    const currentStyle = node.data?.style || {};

    // Create and execute style update command
    const command = new UpdateStyleCommand(
      [{
        nodeId: elementId,
        previousStyle: currentStyle,
        newStyle: styleUpdates,
      }],
      'Update style'
    );

    undoRedo.executeCommand(command);
  }, [nodes, undoRedo]);

  const handleUpdateElementText = useCallback((elementId: string, text: string) => {
    console.log('🎨 handleUpdateElementText called:', { elementId, text });

    // Find the node to get its current text
    const node = nodes.find(n => n.id === elementId);
    if (!node) return;

    const previousText = node.data?.label || '';

    // Create and execute text update command
    const command = new UpdateTextCommand(
      [{
        nodeId: elementId,
        previousText,
        newText: text,
      }],
      'Update text'
    );

    undoRedo.executeCommand(command);
  }, [nodes, undoRedo]);

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
  // Edge update handler
  const handleUpdateEdgeStyle = useCallback((edgeId: string, styleUpdates: Partial<EdgeStyleConfig>) => {
    console.log('🎨 handleUpdateEdgeStyle called:', { edgeId, styleUpdates });

    // Find the edge to get its current style
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    const currentStyle = edge.data?.style || {};

    // Create and execute edge style update command
    const command = new UpdateEdgeStyleCommand(
      [{
        edgeId,
        previousStyle: currentStyle,
        newStyle: styleUpdates,
      }],
      'Update edge style'
    );

    undoRedo.executeCommand(command);
  }, [edges, undoRedo]);

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

  // Undo/redo handlers - now using UndoRedoContext
  const handleUndo = useCallback(() => {
    undoRedo.undo();
  }, [undoRedo]);

  const handleRedo = useCallback(() => {
    undoRedo.redo();
  }, [undoRedo]);

  const contextValue: CanvasOperationsContextType = {
    handlePaneClick,
    handleCanvasClick,
    handleUpdateElementStyle,
    handleUpdateElementText,
    handleUpdateElementPosition,
    handleUpdateElementSize,
    handleUpdateEdgeStyle,
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