import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import ReactFlow, {
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
} from 'reactflow';
import type { Node, Edge, NodeProps, Connection } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import 'reactflow/dist/style.css';
import './FlowCanvas.css';

import ShapeNode from './ShapeNode';
import useShapeHandlers from './hooks/useShapeHandlers';

// Node types registry - defined outside component to avoid re-creation
const nodeTypes = {
  shape: ShapeNode,
};

// Default edge options - defined outside component to avoid re-creation
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
  } = props;

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

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
    // Only update if the node count changed (new nodes added/removed)
    // Don't update during drag operations to prevent interference
    if (!isDragging && nodes.length !== initialNodes.length) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes, isDragging, nodes.length]);

  useEffect(() => {
    // Update edges when external state changes
    if (edges.length !== initialEdges.length) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges, edges.length]);

  // Handle nodes change with external callback
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeInternal(changes);
    
    // Only sync to external state if not dragging and if the changes are significant
    // This prevents excessive re-renders during drag operations
    if (!isDragging) {
      // Debounce external state updates to improve performance
      const hasSignificantChanges = changes.some((change: any) => 
        change.type === 'add' || change.type === 'remove' || 
        (change.type === 'position' && !change.dragging)
      );
      
      if (hasSignificantChanges) {
        const updatedNodes = applyNodeChanges(changes, nodes);
        onNodesChange(updatedNodes);
      }
    }
  }, [onNodesChangeInternal, onNodesChange, nodes, isDragging]);

  // Handle edges change with external callback
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes);
    
    // Use getEdges() to get the most current edge state instead of stale closure
    setTimeout(() => {
      const currentEdges = getEdges();
      onEdgesChange(currentEdges);
    }, 0);
  }, [onEdgesChangeInternal, onEdgesChange, getEdges]);

  // Handle new connections
  const handleConnect = useCallback((connection: Connection) => {
    console.log('🔗 FlowCanvas handleConnect called with:', connection);
    
    // Create the edge using React Flow's addEdge utility
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'default',
      markerEnd: { type: MarkerType.Arrow }
    };
    
    console.log('🔗 Creating new edge:', newEdge);
    
    // Update edges using React Flow's state management
    setEdges((eds) => {
      const updatedEdges = [...eds, newEdge];
      console.log('🔗 Updated edges in FlowCanvas:', updatedEdges);
      
      // Also sync to external state
      setTimeout(() => {
        onEdgesChange(updatedEdges);
      }, 0);
      
      return updatedEdges;
    });
    
    // Call external onConnect callback
    onConnect(connection);
  }, [setEdges, onEdgesChange, onConnect]);

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
        nodeDragThreshold={0}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        {showControls && <Controls className="flow-controls" />}
        {showMiniMap && <MiniMap className="flow-minimap" nodeColor="#ffffff" maskColor="rgba(0, 0, 0, 0.7)" />}
        {showGrid && <Background variant={BackgroundVariant.Dots} gap={20} size={1} />}
        
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