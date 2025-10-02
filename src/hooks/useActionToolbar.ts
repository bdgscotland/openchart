import { useCallback, useState, useMemo, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { globalCommandManager } from '../core/commands/CommandManager';
import { DeleteNodesCommand } from '../core/commands/DeleteNodesCommand';
import type { ReactFlowCommand } from '../core/commands/ReactFlowCommand';

export interface UseActionToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  flowCanvasRef?: React.RefObject<any>;
  executeCommand?: (command: ReactFlowCommand) => void; // Optional for undo/redo integration
}

export interface UseActionToolbarReturn {
  // Selection state
  hasSelection: boolean;
  selectedNodes: Node[];
  selectedEdges: Edge[];

  // Actions
  handleDelete: () => void;
  handleBringToFront: () => void;
  handleSendToBack: () => void;

  // Edge style management
  edgeStyle: 'straight' | 'curved' | 'step';
  handleEdgeStyleChange: (style: 'straight' | 'curved' | 'step') => void;

  // Zoom controls
  zoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleFitToView: () => void;
}

export const useActionToolbar = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  flowCanvasRef,
  executeCommand,
}: UseActionToolbarProps): UseActionToolbarReturn => {
  const [edgeStyle, setEdgeStyle] = useState<'straight' | 'curved' | 'step'>('curved');
  const [zoom, setZoom] = useState(1);

  // Calculate selection state
  const selectedNodes = useMemo(() => nodes.filter(node => node.selected), [nodes]);
  const selectedEdges = useMemo(() => edges.filter(edge => edge.selected), [edges]);
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  // Update zoom when FlowCanvas ref changes
  const updateZoom = useCallback(() => {
    if (flowCanvasRef?.current?.getZoom) {
      const currentZoom = flowCanvasRef.current.getZoom();
      // Ensure we always have a valid zoom value
      setZoom((currentZoom !== undefined && !isNaN(currentZoom)) ? currentZoom : 1);
    }
  }, [flowCanvasRef]);

  // Poll for zoom changes periodically
  useEffect(() => {
    const interval = setInterval(updateZoom, 500);
    return () => clearInterval(interval);
  }, [updateZoom]);

  // Delete selected elements
  const handleDelete = useCallback(() => {
    if (!hasSelection) return;

    const selectedNodeIds = selectedNodes.map(node => node.id);
    const selectedEdgeIds = selectedEdges.map(edge => edge.id);

    // Use command pattern if executeCommand is available (enables undo/redo)
    if (executeCommand && selectedNodeIds.length > 0) {
      const command = new DeleteNodesCommand(selectedNodeIds, `Delete ${selectedNodeIds.length} node(s)`);
      executeCommand(command);
    } else {
      // Fallback: direct state mutation (no undo/redo)
      // Remove selected nodes
      if (selectedNodeIds.length > 0) {
        const newNodes = nodes.filter(node => !selectedNodeIds.includes(node.id));
        onNodesChange(newNodes);

        // Also remove edges connected to deleted nodes
        const newEdges = edges.filter(edge =>
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target) &&
          !selectedEdgeIds.includes(edge.id)
        );
        onEdgesChange(newEdges);
      } else if (selectedEdgeIds.length > 0) {
        // Remove only selected edges
        const newEdges = edges.filter(edge => !selectedEdgeIds.includes(edge.id));
        onEdgesChange(newEdges);
      }
    }
  }, [hasSelection, selectedNodes, selectedEdges, nodes, edges, onNodesChange, onEdgesChange, executeCommand]);

  // Bring selected elements to front
  const handleBringToFront = useCallback(() => {
    if (selectedNodes.length === 0) return;

    // Find the highest z-index
    const maxZIndex = Math.max(...nodes.map(node => node.zIndex || 0), 0);

    const updatedNodes = nodes.map(node => {
      if (selectedNodes.some(selected => selected.id === node.id)) {
        return {
          ...node,
          zIndex: maxZIndex + 1,
        };
      }
      return node;
    });

    onNodesChange(updatedNodes);
  }, [selectedNodes, nodes, onNodesChange]);

  // Send selected elements to back
  const handleSendToBack = useCallback(() => {
    if (selectedNodes.length === 0) return;

    // Find the lowest z-index
    const minZIndex = Math.min(...nodes.map(node => node.zIndex || 0), 0);

    const updatedNodes = nodes.map(node => {
      if (selectedNodes.some(selected => selected.id === node.id)) {
        return {
          ...node,
          zIndex: minZIndex - 1,
        };
      }
      return node;
    });

    onNodesChange(updatedNodes);
  }, [selectedNodes, nodes, onNodesChange]);

  // Handle edge style changes
  const handleEdgeStyleChange = useCallback((style: 'straight' | 'curved' | 'step') => {
    if (selectedEdges.length === 0) return;

    setEdgeStyle(style);

    // Convert style to React Flow edge type
    let edgeType: string;
    switch (style) {
      case 'straight':
        edgeType = 'default';
        break;
      case 'curved':
        edgeType = 'smoothstep';
        break;
      case 'step':
        edgeType = 'step';
        break;
      default:
        edgeType = 'smoothstep';
    }

    // Update only selected edges with new style
    const updatedEdges = edges.map(edge => {
      if (edge.selected) {
        return {
          ...edge,
          type: edgeType,
        };
      }
      return edge;
    });

    onEdgesChange(updatedEdges);
  }, [selectedEdges, edges, onEdgesChange]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (flowCanvasRef?.current?.zoomIn) {
      flowCanvasRef.current.zoomIn();
      updateZoom();
    }
  }, [flowCanvasRef, updateZoom]);

  const handleZoomOut = useCallback(() => {
    if (flowCanvasRef?.current?.zoomOut) {
      flowCanvasRef.current.zoomOut();
      updateZoom();
    }
  }, [flowCanvasRef, updateZoom]);

  const handleFitToView = useCallback(() => {
    if (flowCanvasRef?.current?.fitView) {
      flowCanvasRef.current.fitView({ padding: 0.1 });
      updateZoom();
    }
  }, [flowCanvasRef, updateZoom]);

  return {
    // Selection state
    hasSelection,
    selectedNodes,
    selectedEdges,

    // Actions
    handleDelete,
    handleBringToFront,
    handleSendToBack,

    // Edge style management
    edgeStyle,
    handleEdgeStyleChange,

    // Zoom controls
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleFitToView,
  };
};