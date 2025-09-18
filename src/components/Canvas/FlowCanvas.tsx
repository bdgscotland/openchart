import React, { useCallback, useRef, useMemo, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  Panel,
  MiniMap,
  getViewportForBounds,
  getNodesBounds,
} from 'reactflow';
import type { Node, Edge, NodeProps } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import 'reactflow/dist/style.css';
import './FlowCanvas.css';

// Custom node component for shapes
const ShapeNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    data.onTextChange?.(text);
  }, [text, data]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.onTextChange?.(text);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(data.label || '');
    }
  }, [text, data]);

  const getShapeElement = () => {
    const commonProps = {
      style: {
        width: '100%',
        height: '100%',
        background: selected ? '#f0f9ff' : '#ffffff',
        border: selected ? '2px solid #0066ff' : '2px solid #d1d5db',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
      },
    };

    switch (data.shape) {
      case 'circle':
        return (
          <div {...commonProps} style={{ ...commonProps.style, borderRadius: '50%' }}>
            {renderContent()}
          </div>
        );
      case 'diamond':
        return (
          <div {...commonProps} style={{ 
            ...commonProps.style, 
            transform: 'rotate(45deg)',
            borderRadius: '8px'
          }}>
            <div style={{ transform: 'rotate(-45deg)' }}>
              {renderContent()}
            </div>
          </div>
        );
      case 'triangle':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon 
                points="50,10 90,90 10,90" 
                fill={selected ? '#f0f9ff' : '#ffffff'}
                stroke={selected ? '#0066ff' : '#d1d5db'}
                strokeWidth="2"
              />
            </svg>
            <div style={{ position: 'absolute' }}>
              {renderContent()}
            </div>
          </div>
        );
      case 'hexagon':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon 
                points="30,10 70,10 90,50 70,90 30,90 10,50" 
                fill={selected ? '#f0f9ff' : '#ffffff'}
                stroke={selected ? '#0066ff' : '#d1d5db'}
                strokeWidth="2"
              />
            </svg>
            <div style={{ position: 'absolute' }}>
              {renderContent()}
            </div>
          </div>
        );
      case 'star':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon 
                points="50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40" 
                fill={selected ? '#f0f9ff' : '#ffffff'}
                stroke={selected ? '#0066ff' : '#d1d5db'}
                strokeWidth="2"
              />
            </svg>
            <div style={{ position: 'absolute' }}>
              {renderContent()}
            </div>
          </div>
        );
      case 'ellipse':
        return (
          <div {...commonProps} style={{ 
            ...commonProps.style, 
            borderRadius: '50%',
            transform: 'scaleY(0.7)'
          }}>
            <div style={{ transform: 'scaleY(1.43)' }}>
              {renderContent()}
            </div>
          </div>
        );
      case 'pentagon':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon 
                points="50,10 85,35 70,85 30,85 15,35" 
                fill={selected ? '#f0f9ff' : '#ffffff'}
                stroke={selected ? '#0066ff' : '#d1d5db'}
                strokeWidth="2"
              />
            </svg>
            <div style={{ position: 'absolute' }}>
              {renderContent()}
            </div>
          </div>
        );
      default: // rectangle
        return (
          <div {...commonProps} style={{ ...commonProps.style, borderRadius: '8px' }}>
            {renderContent()}
          </div>
        );
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            textAlign: 'center',
            width: '80%',
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
          }}
          autoFocus
        />
      );
    }
    return (
      <span style={{
        fontSize: '14px',
        fontWeight: 500,
        color: '#111827',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}>
        {data.label}
      </span>
    );
  };

  return (
    <div 
      className="shape-node-container" 
      onDoubleClick={handleDoubleClick}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: data.zIndex || 0 
      }}>
      {/* Single handle per position that acts as both source AND target */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={true}
        isConnectableStart={true}
        isConnectableEnd={true}
      />
      
      {getShapeElement()}
      
      {/* Resize handles for selected nodes */}
      {selected && (
        <>
          <div className="resize-handle resize-handle-nw" />
          <div className="resize-handle resize-handle-ne" />
          <div className="resize-handle resize-handle-sw" />
          <div className="resize-handle resize-handle-se" />
        </>
      )}
    </div>
  );
};

const nodeTypes = {
  shape: ShapeNode,
};

interface FlowCanvasProps {
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  initialNodes?: any[];
  initialEdges?: any[];
}

const FlowCanvasContent = forwardRef<any, FlowCanvasProps>(({
  onNodesChange,
  onEdgesChange,
  initialNodes = [],
  initialEdges = [],
}, ref) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  
  // Update nodes and edges when initial props change (for loading)
  // Only update if they're actually different to avoid infinite loops
  React.useEffect(() => {
    if (JSON.stringify(nodes) !== JSON.stringify(initialNodes)) {
      setNodes(initialNodes);
    }
  }, [initialNodes]);
  
  React.useEffect(() => {
    if (JSON.stringify(edges) !== JSON.stringify(initialEdges)) {
      setEdges(initialEdges);
    }
  }, [initialEdges]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, getViewport, setViewport } = useReactFlow();
  const [nodeId, setNodeId] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  
  // Expose viewport methods to parent
  useImperativeHandle(ref, () => ({
    getViewport,
    setViewport,
    toggleGrid: () => setShowGrid(prev => !prev),
  }), [getViewport, setViewport]);

  const onConnect = useCallback(
    (params: any) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        label: 'Label',
        labelStyle: { fill: '#ffffff', fontWeight: 500 },
        labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        data: { label: 'Label' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('shapeTool');

      if (!type || !reactFlowBounds) {
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Get the highest z-index for new nodes
      const maxZIndex = nodes.length > 0 
        ? Math.max(0, ...nodes.map(n => n.data?.zIndex || 0))
        : 0;
      
      const newNode = {
        id: `node_${nodeId}`,
        type: 'shape',
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeId}`,
          shape: type,
          zIndex: maxZIndex + 1, // New nodes go on top
          onTextChange: (newText: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === `node_${nodeId}`
                  ? { ...node, data: { ...node.data, label: newText } }
                  : node
              )
            );
          },
        },
        style: {
          width: type === 'circle' ? 100 : 120,
          height: type === 'circle' ? 100 : 80,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId(nodeId + 1);
    },
    [project, nodeId, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle right-click context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Use the native event's clientX and clientY for accurate cursor position
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (reactFlowBounds) {
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
        });
      }
    },
    [project]
  );

  // Close context menu on click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle context menu actions
  const handleContextMenuAction = useCallback(
    (action: string) => {
      if (contextMenu?.nodeId) {
        switch (action) {
          case 'delete':
            setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId));
            setEdges((eds) => eds.filter((e) => 
              e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId
            ));
            break;
            
          case 'duplicate':
            const nodeToDuplicate = nodes.find(n => n.id === contextMenu.nodeId);
            if (nodeToDuplicate) {
              // Get the highest z-index
              const maxZIndex = Math.max(0, ...nodes.map(n => n.data?.zIndex || 0));
              const newNode = {
                ...nodeToDuplicate,
                id: `node_${nodeId}`,
                position: {
                  x: nodeToDuplicate.position.x + 50,
                  y: nodeToDuplicate.position.y + 50,
                },
                data: {
                  ...nodeToDuplicate.data,
                  zIndex: maxZIndex + 1,
                },
                selected: false,
              };
              setNodes((nds) => [...nds, newNode]);
              setNodeId(nodeId + 1);
            }
            break;
            
          case 'bring-front':
            setNodes((nds) => {
              const maxZIndex = Math.max(0, ...nds.map(n => n.data?.zIndex || 0));
              return nds.map(node => 
                node.id === contextMenu.nodeId
                  ? { ...node, data: { ...node.data, zIndex: maxZIndex + 1 } }
                  : node
              );
            });
            break;
            
          case 'send-back':
            setNodes((nds) => {
              const minZIndex = Math.min(0, ...nds.map(n => n.data?.zIndex || 0));
              return nds.map(node => 
                node.id === contextMenu.nodeId
                  ? { ...node, data: { ...node.data, zIndex: minZIndex - 1 } }
                  : node
              );
            });
            break;
            
          case 'bring-forward':
            setNodes((nds) => {
              const currentNode = nds.find(n => n.id === contextMenu.nodeId);
              if (!currentNode) return nds;
              
              const currentZ = currentNode.data?.zIndex || 0;
              // Find the next higher z-index
              const higherZIndexes = nds
                .map(n => n.data?.zIndex || 0)
                .filter(z => z > currentZ)
                .sort((a, b) => a - b);
              
              if (higherZIndexes.length > 0) {
                const nextZ = higherZIndexes[0];
                return nds.map(node => {
                  if (node.id === contextMenu.nodeId) {
                    return { ...node, data: { ...node.data, zIndex: nextZ + 0.5 } };
                  } else if ((node.data?.zIndex || 0) === nextZ) {
                    return { ...node, data: { ...node.data, zIndex: currentZ } };
                  }
                  return node;
                });
              }
              return nds;
            });
            break;
            
          case 'send-backward':
            setNodes((nds) => {
              const currentNode = nds.find(n => n.id === contextMenu.nodeId);
              if (!currentNode) return nds;
              
              const currentZ = currentNode.data?.zIndex || 0;
              // Find the next lower z-index
              const lowerZIndexes = nds
                .map(n => n.data?.zIndex || 0)
                .filter(z => z < currentZ)
                .sort((a, b) => b - a);
              
              if (lowerZIndexes.length > 0) {
                const nextZ = lowerZIndexes[0];
                return nds.map(node => {
                  if (node.id === contextMenu.nodeId) {
                    return { ...node, data: { ...node.data, zIndex: nextZ - 0.5 } };
                  } else if ((node.data?.zIndex || 0) === nextZ) {
                    return { ...node, data: { ...node.data, zIndex: currentZ } };
                  }
                  return node;
                });
              }
              return nds;
            });
            break;
        }
      }
      setContextMenu(null);
    },
    [contextMenu, nodes, nodeId, setNodes, setEdges]
  );

  // Notify parent of changes through callbacks
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeInternal(changes);
    // Only notify parent with the actual nodes array when needed
    if (onNodesChange) {
      setNodes((currentNodes) => {
        onNodesChange(currentNodes);
        return currentNodes;
      });
    }
  }, [onNodesChangeInternal, onNodesChange, setNodes]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes);
    // Only notify parent with the actual edges array when needed
    if (onEdgesChange) {
      setEdges((currentEdges) => {
        onEdgesChange(currentEdges);
        return currentEdges;
      });
    }
  }, [onEdgesChangeInternal, onEdgesChange, setEdges]);

  return (
    <div className="flow-canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeContextMenu={onNodeContextMenu}
        onContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        connectionMode="loose"
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: '#6b7280', strokeWidth: 2 },
          type: 'smoothstep',
          animated: false,
          labelStyle: { fill: '#ffffff', fontWeight: 500 },
          labelBgStyle: { fill: '#1a1a1a', fillOpacity: 0.9 },
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
        }}
        onEdgeDoubleClick={(event, edge) => {
          // Allow edge label editing
          const newLabel = prompt('Enter edge label:', edge.label || '');
          if (newLabel !== null) {
            setEdges((eds) =>
              eds.map((e) =>
                e.id === edge.id ? { ...e, label: newLabel } : e
              )
            );
          }
        }}
      >
        {showGrid && (
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="rgba(255, 255, 255, 0.05)"
          />
        )}
        <Controls 
          className="flow-controls"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <Panel position="bottom-center" className="flow-panel">
          <div className="flow-stats">
            Nodes: {nodes.length} | Edges: {edges.length}
          </div>
        </Panel>
        {/* Context Menu */}
        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: Math.min(contextMenu.y, window.innerHeight - 200),
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              background: 'rgba(17, 17, 20, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '4px',
              zIndex: 10000,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.nodeId ? (
              <>
                <div
                  className="context-menu-item"
                  onClick={() => handleContextMenuAction('duplicate')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Duplicate
                </div>
                <div
                  className="context-menu-item"
                  onClick={() => handleContextMenuAction('delete')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Delete
                </div>
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
                <div
                  className="context-menu-item"
                  onClick={() => handleContextMenuAction('bring-front')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Bring to Front
                </div>
                <div
                  className="context-menu-item"
                  onClick={() => handleContextMenuAction('bring-forward')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Bring Forward
                </div>
                <div
                  className="context-menu-item"
                  onClick={() => handleContextMenuAction('send-backward')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Send Backward
                </div>
                <div
                  className="context-menu-item"
                  onClick={() => handleContextMenuAction('send-back')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Send to Back
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '8px 16px',
                  color: '#6b7280',
                  fontSize: '14px',
                }}
              >
                Right-click on a shape for options
              </div>
            )}
          </div>
        )}
        <MiniMap 
          className="flow-minimap"
          nodeColor={(node) => node.selected ? '#0066ff' : '#ffffff'}
          maskColor="rgba(0, 0, 0, 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
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