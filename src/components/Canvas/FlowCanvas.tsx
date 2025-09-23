import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  MiniMap,
  ConnectionMode,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type { Node, Edge, NodeProps, Connection } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import '@xyflow/react/dist/style.css';
import './FlowCanvas.css';

import ShapeNode from './ShapeNode';
import useShapeHandlers from './hooks/useShapeHandlers';
import { useConnectionPool } from '../../hooks/useConnectionPool';

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
  showGrid?: boolean;
  showMiniMap?: boolean;
  showControls?: boolean;
  showRulers?: boolean;
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
    showGrid = true,
    showMiniMap = true,
    showControls = true,
    showRulers = false,
  } = props;

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  // Use connection pool for optimized edge creation
  const {
    addConnection: addPooledConnection,
    removeConnection,
    hasConnection,
    getPoolStats,
    cleanup: cleanupConnectionPool
  } = useConnectionPool(edges, setEdges, 100);

  // Use our custom shape handlers hook
  const {
    handleConnect: handleConnectInternal,
    handleDeleteNodes,
    handleDuplicateNodes,
  } = useShapeHandlers({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
  });

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
    console.log('🎯 onDrop called - React Flow handler');

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const shapeType = event.dataTransfer.getData('shapeTool');

    console.log('🎯 Shape type:', shapeType);
    console.log('🎯 React Flow bounds:', reactFlowBounds);

    if (!shapeType || !reactFlowBounds) {
      console.log('🚫 Missing shapeType or reactFlowBounds');
      return;
    }

    // Use the new screenToFlowPosition instead of deprecated project
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    console.log('🎯 Position calculated:', position);

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
  }, [screenToFlowPosition, setNodes, onNodesChange]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle context menu actions
  const handleContextMenuAction = useCallback((action: string, nodeId?: string) => {
    switch (action) {
      case 'delete':
        if (nodeId) {
          handleDeleteNodes([nodeId]);
        }
        break;
      case 'duplicate':
        if (nodeId) {
          handleDuplicateNodes([nodeId]);
        }
        break;
    }
    setContextMenu(null);
  }, [handleDeleteNodes, handleDuplicateNodes]);

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

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    fitView,
    getViewport,
    setViewport,
    getNodes,
    getEdges,
    exportToPng,
    exportToSvg,
  }), [fitView, getViewport, setViewport, getNodes, getEdges, exportToPng, exportToSvg]);

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
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        selectionOnDrag={true}
        multiSelectionKeyCode={null}
        selectionKeyCode={null}
        deleteKeyCode="Delete"
        nodeDragThreshold={0}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        {showControls && <Controls className="flow-controls" />}
        {showMiniMap && <MiniMap className="flow-minimap" nodeColor="#ffffff" maskColor="rgba(0, 0, 0, 0.7)" />}
        {showGrid && <Background variant={BackgroundVariant.Dots} gap={20} size={1} />}

        {/* Rulers */}
        {showRulers && (
          <>
            {/* Horizontal Ruler */}
            <div className="ruler horizontal-ruler">
              {Array.from({ length: 100 }, (_, i) => (
                <div
                  key={i}
                  className="ruler-mark"
                  style={{
                    left: `${i * 100}px`,
                    height: i % 10 === 0 ? '15px' : i % 5 === 0 ? '10px' : '5px',
                  }}
                />
              ))}
            </div>

            {/* Vertical Ruler */}
            <div className="ruler vertical-ruler">
              {Array.from({ length: 100 }, (_, i) => (
                <div
                  key={i}
                  className="ruler-mark"
                  style={{
                    top: `${i * 100}px`,
                    width: i % 10 === 0 ? '15px' : i % 5 === 0 ? '10px' : '5px',
                  }}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Export Panel */}
        <Panel position="top-right">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={exportToPng} title="Export to PNG">
              PNG
            </button>
            <button onClick={exportToSvg} title="Export to SVG">
              SVG
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          {contextMenu.nodeId ? (
            <>
              <div
                onClick={() => handleContextMenuAction('duplicate', contextMenu.nodeId)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Duplicate
              </div>
              <div
                onClick={() => handleContextMenuAction('delete', contextMenu.nodeId)}
                style={{ padding: '8px 16px', cursor: 'pointer', color: 'red' }}
              >
                Delete
              </div>
            </>
          ) : (
            <div style={{ padding: '8px 16px', color: '#666' }}>
              Canvas Options
            </div>
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