import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
  ConnectionMode,
  MarkerType,
  applyNodeChanges,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import { toPng, toSvg, toJpeg, toCanvas } from 'html-to-image';
import '@xyflow/react/dist/style.css';
import './FlowCanvas.css';
import './ConnectionFeedback.css';

import ShapeNode from './ShapeNode';
import useShapeHandlers from './hooks/useShapeHandlers';
import { useConnectionPool } from '../../hooks/useConnectionPool';
import { useConnectionTools } from '../../hooks/useConnectionTools';
import SelectionToolbar from './SelectionToolbar';
import { edgeTypes } from './edges';

// Memoized node types registry - defined outside component to avoid re-creation
const nodeTypes = {
  shape: ShapeNode,
};

// Memoized default edge options - defined outside component to avoid re-creation
const defaultEdgeOptions = {
  type: 'default',
  markerEnd: { type: MarkerType.Arrow },
};

export interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  onPaneContextMenu?: (event: React.MouseEvent) => void;
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  showGrid?: boolean;
  gridSize?: number;
  gridColor?: string;
  showMiniMap?: boolean;
  showControls?: boolean;
  showRulers?: boolean;
  snapToGrid?: boolean;
  connectionMode?: 'loose' | 'strict';
  // Enhanced connection features
  selectedConnectionTool?: string;
  onConnectionToolChange?: (toolId: string) => void;
  enableConnectionPreview?: boolean;
}

const FlowCanvasContent = forwardRef<any, FlowCanvasProps>((props, ref) => {
  const {
    nodes: initialNodes,
    edges: initialEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onPaneContextMenu,
    onNodeContextMenu,
    onEdgeClick,
    onEdgeDoubleClick,
    onEdgeContextMenu,
    showGrid = true,
    gridSize = 20,
    gridColor = '#888888',
    showMiniMap = true,
    showControls = true,
    showRulers = false,
    snapToGrid: propSnapToGrid = true,
    connectionMode: propConnectionMode = 'loose',
  } = props;

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Enhanced drag & drop states
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; shapeType: string } | null>(null);
  // Selection state management
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const snapToGrid = propSnapToGrid;
  const connectionMode = propConnectionMode;

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  // Use connection pool for optimized edge creation
  const {
    addConnection: addPooledConnection,
    hasConnection,
    cleanup: cleanupConnectionPool
  } = useConnectionPool(edges, setEdges, 100);

  // Use our custom shape handlers hook
  const {
    handleDeleteNodes,
    handleDuplicateNodes,
  } = useShapeHandlers({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
  });

  // Helper function to snap position to grid
  const snapToGridPosition = useCallback((position: { x: number; y: number }) => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }, [snapToGrid, gridSize]);

  // Initialize internal state on mount and when external state changes
  useEffect(() => {
    // Update if nodes changed (count, style, or data changes)
    // Don't update during drag operations to prevent interference
    if (!isDragging) {
      // Check if we should sync by comparing timestamps or forcing sync
      const shouldSync = nodes.length !== initialNodes.length ||
        initialNodes.some(initialNode => {
          const currentNode = nodes.find(n => n.id === initialNode.id);
          return !currentNode ||
            currentNode.data?.lastStyleUpdate !== initialNode.data?.lastStyleUpdate ||
            currentNode.data?.lastTextUpdate !== initialNode.data?.lastTextUpdate ||
            currentNode.data?.label !== initialNode.data?.label ||
            JSON.stringify(currentNode.data?.style) !== JSON.stringify(initialNode.data?.style);
        });

      if (shouldSync) {
        console.log('🔄 FlowCanvas syncing nodes from parent:', initialNodes);
        setNodes(initialNodes);
      }
    }
  }, [initialNodes, setNodes, isDragging, nodes]);

  useEffect(() => {
    // Update edges when external state changes
    if (edges.length !== initialEdges.length) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges, edges.length]);

  // Performance-optimized node changes with requestAnimationFrame
  const animationFrameRef = useRef<number | null>(null);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeInternal(changes);

    // Only sync to external state if not dragging and if the changes are significant
    // This prevents excessive re-renders during drag operations
    if (!isDragging) {
      // Cancel previous animation frame to debounce updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame for smooth performance
      animationFrameRef.current = requestAnimationFrame(() => {
        const hasSignificantChanges = changes.some((change: any) =>
          change.type === 'add' || change.type === 'remove' ||
          (change.type === 'position' && !change.dragging)
        );

        if (hasSignificantChanges) {
          const updatedNodes = applyNodeChanges(changes, nodes);
          onNodesChange(updatedNodes);
        }
      });
    }
  }, [onNodesChangeInternal, onNodesChange, nodes, isDragging]);

  // Cleanup animation frame and connection pool on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupConnectionPool();
    };
  }, [cleanupConnectionPool]);

  // Handle edges change with external callback
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes);

    // Use getEdges() to get the most current edge state instead of stale closure
    setTimeout(() => {
      const currentEdges = getEdges();
      onEdgesChange(currentEdges);
    }, 0);
  }, [onEdgesChangeInternal, onEdgesChange, getEdges]);

  // Handle new connections with connection pooling
  const handleConnect = useCallback((connection: Connection) => {
    console.log('🔗 FlowCanvas handleConnect called with:', connection);

    // Check if connection already exists to prevent duplicates
    if (hasConnection(connection.source!, connection.target!)) {
      console.log('🚫 Connection already exists, skipping');
      return;
    }

    // Use connection pool for optimized batch processing
    addPooledConnection(connection);

    // Call external onConnect callback
    onConnect(connection);
  }, [addPooledConnection, hasConnection, onConnect]);

  // Handle drag and drop from toolbar
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    console.log('🎯 onDrop called - Enhanced React Flow handler');

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const shapeType = event.dataTransfer.getData('shapeTool');

    console.log('🎯 Shape type:', shapeType);
    console.log('🎯 React Flow bounds:', reactFlowBounds);

    // Reset drag state
    setIsDragOver(false);
    setDragPreview(null);

    if (!shapeType || !reactFlowBounds) {
      console.log('🚫 Missing shapeType or reactFlowBounds');
      return;
    }

    // Calculate position and apply snap-to-grid
    const rawPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const position = snapToGridPosition(rawPosition);

    console.log('🎯 Position calculated:', position, 'snapped from:', rawPosition);

    // Import the shape factory at runtime to avoid circular imports
    import('./shapes').then(({ createShapeNode, isValidShapeType }) => {
      console.log('🎯 Shape module imported successfully');

      if (!isValidShapeType(shapeType)) {
        console.warn(`❌ Invalid shape type: ${shapeType}`);
        return;
      }

      console.log('✅ Shape type is valid:', shapeType);

      const newNode = createShapeNode({
        id: `node-${Date.now()}`,
        position,
        shapeType,
        onTextChange: (text: string) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === newNode.id
                ? { ...node, data: { ...node.data, label: text } }
                : node
            )
          );
        },
      });

      console.log('🎯 New node created:', newNode);

      // Update local state and immediately sync to external state
      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        console.log('🎯 Updated nodes array:', updatedNodes);

        // Immediately call the external onNodesChange callback
        setTimeout(() => {
          console.log('🎯 Calling external onNodesChange with:', updatedNodes);
          onNodesChange(updatedNodes);
        }, 0);

        return updatedNodes;
      });
    }).catch((error) => {
      console.error('❌ Error importing shapes module:', error);
    });
  }, [screenToFlowPosition, setNodes, onNodesChange, snapToGridPosition]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    const shapeType = event.dataTransfer.getData('shapeTool');
    if (shapeType && reactFlowWrapper.current) {
      setIsDragOver(true);
      
      // Calculate position for preview
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      
      setDragPreview({
        ...position,
        shapeType,
      });
    }
  }, []);
  // Enhanced drag leave handler
  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Only hide preview if leaving the canvas area
    if (!reactFlowWrapper.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragPreview(null);
    }
  }, []);

  // Selection event handlers
  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[], edges: Edge[] }) => {
    console.log('🎯 Selection changed:', { nodes: selectedNodes.length, edges: selectedEdges.length });
    setSelectedNodes(selectedNodes);
    setSelectedEdges(selectedEdges);
  }, []);

  const onSelectionDragStart = useCallback((event: React.MouseEvent, nodes: Node[]) => {
    console.log('🎯 Selection drag start:', nodes.length, 'nodes');
    setIsDragging(true);
  }, []);

  const onSelectionDrag = useCallback((_event: React.MouseEvent, _nodes: Node[]) => {
    // Don't log during drag for performance
  }, []);

  const onSelectionDragStop = useCallback((event: React.MouseEvent, nodes: Node[]) => {
    console.log('🎯 Selection drag stop:', nodes.length, 'nodes');
    setIsDragging(false);

    // Apply snap-to-grid for all selected nodes after drag
    if (snapToGrid && nodes.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          const isSelected = nodes.some(selectedNode => selectedNode.id === node.id);
          if (isSelected) {
            const snappedPosition = snapToGridPosition(node.position);
            return { ...node, position: snappedPosition };
          }
          return node;
        })
      );
    }

    // Sync to external state after drag is complete
    setTimeout(() => {
      const updatedNodes = getNodes();
      onNodesChange(updatedNodes);
    }, 0);
  }, [snapToGrid, snapToGridPosition, setNodes, getNodes, onNodesChange]);

  const onSelectionContextMenu = useCallback((event: React.MouseEvent, nodes: Node[]) => {
    event.preventDefault();
    console.log('🎯 Selection context menu:', nodes.length, 'nodes');
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: nodes.length === 1 ? nodes[0].id : undefined
    });
  }, []);

  // Bulk operations for selection toolbar
  const handleBulkDelete = useCallback(() => {
    if (selectedNodes.length > 0) {
      handleDeleteNodes(selectedNodes.map(node => node.id));
    }
  }, [selectedNodes, handleDeleteNodes]);

  const handleBulkDuplicate = useCallback(() => {
    if (selectedNodes.length > 0) {
      handleDuplicateNodes(selectedNodes.map(node => node.id));
    }
  }, [selectedNodes, handleDuplicateNodes]);

  const handleBulkAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedNodes.length < 2) return;

    const nodePositions = selectedNodes.map(node => node.position);
    let targetValue: number;

    switch (alignment) {
      case 'left':
        targetValue = Math.min(...nodePositions.map(pos => pos.x));
        setNodes((nds) =>
          nds.map((node) =>
            selectedNodes.some(selected => selected.id === node.id)
              ? { ...node, position: { ...node.position, x: targetValue } }
              : node
          )
        );
        break;
      case 'right':
        targetValue = Math.max(...nodePositions.map(pos => pos.x));
        setNodes((nds) =>
          nds.map((node) =>
            selectedNodes.some(selected => selected.id === node.id)
              ? { ...node, position: { ...node.position, x: targetValue } }
              : node
          )
        );
        break;
      case 'center': {
        const minX = Math.min(...nodePositions.map(pos => pos.x));
        const maxX = Math.max(...nodePositions.map(pos => pos.x));
        targetValue = (minX + maxX) / 2;
        setNodes((nds) =>
          nds.map((node) =>
            selectedNodes.some(selected => selected.id === node.id)
              ? { ...node, position: { ...node.position, x: targetValue } }
              : node
          )
        );
        break;
      }
      case 'top':
        targetValue = Math.min(...nodePositions.map(pos => pos.y));
        setNodes((nds) =>
          nds.map((node) =>
            selectedNodes.some(selected => selected.id === node.id)
              ? { ...node, position: { ...node.position, y: targetValue } }
              : node
          )
        );
        break;
      case 'bottom':
        targetValue = Math.max(...nodePositions.map(pos => pos.y));
        setNodes((nds) =>
          nds.map((node) =>
            selectedNodes.some(selected => selected.id === node.id)
              ? { ...node, position: { ...node.position, y: targetValue } }
              : node
          )
        );
        break;
      case 'middle': {
        const minY = Math.min(...nodePositions.map(pos => pos.y));
        const maxY = Math.max(...nodePositions.map(pos => pos.y));
        targetValue = (minY + maxY) / 2;
        setNodes((nds) =>
          nds.map((node) =>
            selectedNodes.some(selected => selected.id === node.id)
              ? { ...node, position: { ...node.position, y: targetValue } }
              : node
          )
        );
        break;
      }
    }

    // Sync to external state
    setTimeout(() => {
      const updatedNodes = getNodes();
      onNodesChange(updatedNodes);
    }, 0);
  }, [selectedNodes, setNodes, getNodes, onNodesChange]);

  // Keyboard shortcuts for selection operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A - Select all nodes
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        const allNodes = getNodes();
        setNodes((nds) =>
          nds.map((node) => ({ ...node, selected: true }))
        );
        console.log('🎯 Select All: Selected', allNodes.length, 'nodes');
        return;
      }

      // Escape - Clear selection
      if (event.key === 'Escape') {
        event.preventDefault();
        setNodes((nds) =>
          nds.map((node) => ({ ...node, selected: false }))
        );
        setEdges((eds) =>
          eds.map((edge) => ({ ...edge, selected: false }))
        );
        console.log('🎯 Escape: Cleared all selections');
        return;
      }

      // Delete - Delete selected items
      if (event.key === 'Delete' && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        event.preventDefault();
        if (selectedNodes.length > 0) {
          handleDeleteNodes(selectedNodes.map(node => node.id));
          console.log('🎯 Delete: Removed', selectedNodes.length, 'selected nodes');
        }
        return;
      }

      // Ctrl+D - Duplicate selected items
      if (event.ctrlKey && event.key === 'd' && selectedNodes.length > 0) {
        event.preventDefault();
        handleDuplicateNodes(selectedNodes.map(node => node.id));
        console.log('🎯 Ctrl+D: Duplicated', selectedNodes.length, 'selected nodes');
        return;
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, selectedEdges, setNodes, setEdges, getNodes, handleDeleteNodes, handleDuplicateNodes]);

  // Handle context menu actions
  const handleContextMenuAction = useCallback((action: string, nodeId?: string) => {
    switch (action) {
      case 'delete':
        if (nodeId) {
          handleDeleteNodes([nodeId]);
        } else if (selectedNodes.length > 0) {
          handleDeleteNodes(selectedNodes.map(node => node.id));
        }
        break;
      case 'duplicate':
        if (nodeId) {
          handleDuplicateNodes([nodeId]);
        } else if (selectedNodes.length > 0) {
          handleDuplicateNodes(selectedNodes.map(node => node.id));
        }
        break;
      case 'bulk-delete':
        if (selectedNodes.length > 0) {
          handleDeleteNodes(selectedNodes.map(node => node.id));
        }
        break;
      case 'bulk-duplicate':
        if (selectedNodes.length > 0) {
          handleDuplicateNodes(selectedNodes.map(node => node.id));
        }
        break;
      case 'toggle-snap':
        setSnapToGrid(!snapToGrid);
        break;
      case 'toggle-connection-mode':
        setConnectionMode(connectionMode === 'loose' ? 'strict' : 'loose');
        break;
    }
    setContextMenu(null);
  }, [handleDeleteNodes, handleDuplicateNodes, snapToGrid, connectionMode, selectedNodes]);

  // Export functions
  const exportToPng = useCallback(async () => {
    if (reactFlowWrapper.current) {
      const dataUrl = await toPng(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
      });

      const link = document.createElement('a');
      link.download = 'diagram.png';
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const exportToSvg = useCallback(async () => {
    if (reactFlowWrapper.current) {
      const dataUrl = await toSvg(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
      });

      const link = document.createElement('a');
      link.download = 'diagram.svg';
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const exportToJpeg = useCallback(async () => {
    if (reactFlowWrapper.current) {
      const dataUrl = await toJpeg(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
        quality: 0.9,
      });

      const link = document.createElement('a');
      link.download = 'diagram.jpg';
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const exportToWebp = useCallback(async () => {
    if (reactFlowWrapper.current) {
      const canvas = await toCanvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
      });

      // Convert canvas to WebP
      const dataUrl = canvas.toDataURL('image/webp', 0.9);

      const link = document.createElement('a');
      link.download = 'diagram.webp';
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const exportToPdf = useCallback(async () => {
    if (reactFlowWrapper.current) {
      // Import jsPDF dynamically to avoid bundle issues
      const { jsPDF } = await import('jspdf');

      // First, get the canvas
      const canvas = await toCanvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800,
      });

      // Create PDF with appropriate size
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('diagram.pdf');
    }
  }, []);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    fitView,
    getViewport,
    setViewport,
    getNodes,
    getEdges,
    exportToPng,
    exportToSvg,
    exportToJpeg,
    exportToWebp,
    exportToPdf,
    getCanvasSettings: () => ({ snapToGrid, gridSize, connectionMode }),
    // Expose React Flow instance methods for zoom controls
    zoomIn: () => {
      const currentZoom = getViewport().zoom;
      setViewport({ ...getViewport(), zoom: Math.min(currentZoom * 1.2, 4) });
    },
    zoomOut: () => {
      const currentZoom = getViewport().zoom;
      setViewport({ ...getViewport(), zoom: Math.max(currentZoom / 1.2, 0.1) });
    },
    getZoom: () => getViewport().zoom,
  }), [fitView, getViewport, setViewport, getNodes, getEdges, exportToPng, exportToSvg, exportToJpeg, exportToWebp, exportToPdf, snapToGrid, connectionMode, gridSize]);

  return (
    <div className="flow-canvas" ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDragStart={(event, node) => {
          setIsDragging(true);
        }}
        onNodeDragStop={(event, node) => {
          setIsDragging(false);

          // Apply snap-to-grid after drag
          if (snapToGrid) {
            const snappedPosition = snapToGridPosition(node.position);
            if (snappedPosition.x !== node.position.x || snappedPosition.y !== node.position.y) {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === node.id ? { ...n, position: snappedPosition } : n
                )
              );
            }
          }

          // Sync to external state after drag is complete
          setTimeout(() => {
            const updatedNodes = getNodes();
            onNodesChange(updatedNodes);
          }, 0);
        }}
        onPaneClick={(event) => {
          setContextMenu(null);
          onPaneClick?.(event);
        }}
        onPaneContextMenu={(event) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY });
          onPaneContextMenu?.(event);
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
          onNodeContextMenu?.(event, node);
        }}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onEdgeContextMenu={onEdgeContextMenu}
        onSelectionChange={onSelectionChange}
        onSelectionDragStart={onSelectionDragStart}
        onSelectionDrag={onSelectionDrag}
        onSelectionDragStop={onSelectionDragStop}
        onSelectionContextMenu={onSelectionContextMenu}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        edgesSelectable={true}
        selectNodesOnDrag={false}
        selectionOnDrag={true}
        multiSelectionKeyCode="Ctrl"
        selectionKeyCode="Shift"
        panOnDrag={[1, 2]}
        selectionMode="partial"
        deleteKeyCode="Delete"
        nodeDragThreshold={0}
        connectionMode={connectionMode === 'loose' ? ConnectionMode.Loose : ConnectionMode.Strict}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
      >
        {showControls && <Controls className="flow-controls" />}
        {showMiniMap && (
          <MiniMap
            className="flow-minimap"
            nodeColor="#e5e7eb"
            maskColor="rgba(0, 0, 0, 0.7)"
            pannable={true}
            zoomable={true}
          />
        )}
        {showGrid && <Background variant={BackgroundVariant.Dots} gap={gridSize} size={3} color={gridColor} />}


        {/* Enhanced Rulers with mm/cm markings */}
        {showRulers && (
          <>
            {/* Horizontal Ruler */}
            <div className="ruler horizontal-ruler">
              {Array.from({ length: 1000 }, (_, i) => {
                const position = i * 2; // Every 2px for better performance
                const isCentimeter = (i * 2) % 10 === 0; // Every 10mm = 1cm
                const isHalfCentimeter = (i * 2) % 5 === 0; // Every 5mm

                return (
                  <div key={i} className="ruler-tick-container" style={{ left: `${position}px` }}>
                    <div
                      className={`ruler-mark ${isCentimeter ? 'centimeter' : isHalfCentimeter ? 'half-centimeter' : 'millimeter'}`}
                      style={{
                        height: isCentimeter ? '18px' : isHalfCentimeter ? '12px' : '6px',
                      }}
                    />
                    {isCentimeter && (
                      <div className="ruler-label" style={{ left: `${position}px` }}>
                        {Math.floor(position / 10)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vertical Ruler */}
            <div className="ruler vertical-ruler">
              {Array.from({ length: 600 }, (_, i) => {
                const position = i * 2; // Every 2px for better performance
                const isCentimeter = (i * 2) % 10 === 0; // Every 10mm = 1cm
                const isHalfCentimeter = (i * 2) % 5 === 0; // Every 5mm

                return (
                  <div key={i} className="ruler-tick-container" style={{ top: `${position}px` }}>
                    <div
                      className={`ruler-mark ${isCentimeter ? 'centimeter' : isHalfCentimeter ? 'half-centimeter' : 'millimeter'}`}
                      style={{
                        width: isCentimeter ? '18px' : isHalfCentimeter ? '12px' : '6px',
                      }}
                    />
                    {isCentimeter && (
                      <div className="ruler-label vertical" style={{ top: `${position - 6}px` }}>
                        {Math.floor(position / 10)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

      </ReactFlow>

      {/* Selection Toolbar - appears when items are selected */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <SelectionToolbar
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          onBulkDelete={handleBulkDelete}
          onBulkDuplicate={handleBulkDuplicate}
          onBulkAlign={handleBulkAlign}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        />
      )}

      {/* Enhanced drag preview */}
      {isDragOver && dragPreview && (
        <div
          className="absolute pointer-events-none z-50 border-2 border-blue-400 border-dashed bg-blue-50 opacity-70 rounded"
          style={{
            left: dragPreview.x - 60,
            top: dragPreview.y - 40,
            width: 120,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#1e40af',
          }}
        >
          {dragPreview.shapeType}
        </div>
      )}

      {/* Enhanced Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          {contextMenu.nodeId ? (
            <>
              <div
                onClick={() => handleContextMenuAction('duplicate', contextMenu.nodeId)}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span>Duplicate</span>
              </div>
              <div
                onClick={() => handleContextMenuAction('delete', contextMenu.nodeId)}
                className="px-3 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
              >
                <span>Delete</span>
              </div>
            </>
          ) : selectedNodes.length > 1 ? (
            <>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 border-b border-gray-200">
                {selectedNodes.length} items selected
              </div>
              <div
                onClick={() => handleContextMenuAction('bulk-duplicate')}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span>Duplicate All</span>
              </div>
              <div
                onClick={() => handleContextMenuAction('bulk-delete')}
                className="px-3 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
              >
                <span>Delete All</span>
              </div>
              <div className="border-t border-gray-200 my-1"></div>
              <div
                onClick={() => handleContextMenuAction('toggle-snap')}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span>{snapToGrid ? '✓' : ''} Snap to Grid</span>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => handleContextMenuAction('toggle-snap')}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span>{snapToGrid ? '✓' : ''} Snap to Grid</span>
              </div>
              <div
                onClick={() => handleContextMenuAction('toggle-connection-mode')}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span>Connection: {connectionMode}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export const FlowCanvas = forwardRef<any, FlowCanvasProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent ref={ref} {...props} />
    </ReactFlowProvider>
  );
});