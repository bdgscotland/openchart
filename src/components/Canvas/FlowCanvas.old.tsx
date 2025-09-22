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
  Handle,
  Position,
  Panel,
  MiniMap,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, NodeProps, Connection } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import 'reactflow/dist/style.css';
import './FlowCanvas.css';

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

// Custom node component for shapes
const ShapeNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

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

  const getShapeElement = useCallback(() => {
    const commonProps = {
      ref: nodeRef,
      style: {
        width: data.width || 120,
        height: data.height || 80,
        backgroundColor: data.backgroundColor || '#f0f9ff',
        border: selected ? '2px solid #0066ff' : '1px solid #d1d5db',
        borderRadius: data.borderRadius || '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      onDoubleClick: handleDoubleClick,
    };

    const renderContent = () => {
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none',
              background: 'transparent',
              textAlign: 'center',
              width: '100%',
              outline: 'none',
              fontSize: '14px',
              color: '#1f2937',
            }}
          />
        );
      }

      return (
        <div style={{ textAlign: 'center', fontSize: '14px', userSelect: 'none', color: '#1f2937' }}>
          {data.label || 'Shape'}
        </div>
      );
    };

    switch (data.shape) {
      case 'rectangle':
        return <div {...commonProps}>{renderContent()}</div>;

      case 'circle':
        return (
          <div {...commonProps} style={{ 
            ...commonProps.style, 
            borderRadius: '50%',
            width: Math.max(data.width || 120, data.height || 80),
            height: Math.max(data.width || 120, data.height || 80),
          }}>
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
            width: 0, 
            height: 0, 
            borderLeft: `${(data.width || 120) / 2}px solid transparent`,
            borderRight: `${(data.width || 120) / 2}px solid transparent`,
            borderBottom: `${data.height || 80}px solid ${data.backgroundColor || '#f0f9ff'}`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '60%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              color: '#1f2937',
            }}>
              {renderContent()}
            </div>
          </div>
        );

      case 'ellipse':
        return (
          <div {...commonProps} style={{ 
            ...commonProps.style, 
            borderRadius: '50%',
            transform: 'scaleY(0.6)'
          }}>
            <div style={{ transform: 'scaleY(1.67)' }}>
              {renderContent()}
            </div>
          </div>
        );

      case 'pentagon':
      case 'hexagon':
      case 'star':
        return (
          <div style={{
            width: data.width || 120,
            height: data.height || 80,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon 
                points={
                  data.shape === 'pentagon' ? "50,10 85,35 70,85 30,85 15,35" :
                  data.shape === 'hexagon' ? "30,10 70,10 90,50 70,90 30,90 10,50" :
                  "50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40" // star
                }
                fill={data.backgroundColor || '#f0f9ff'}
                stroke={selected ? '#0066ff' : '#d1d5db'}
                strokeWidth="2"
              />
            </svg>
            <div style={{ position: 'absolute', color: '#1f2937' }}>
              {renderContent()}
            </div>
          </div>
        );

      default:
        return <div {...commonProps}>{renderContent()}</div>;
    }
  }, [data, selected, isEditing, text, handleDoubleClick, handleBlur, handleKeyDown]);

  return (
    <div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Right} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Bottom} style={{ background: '#555' }} />
      
      {getShapeElement()}
      
      <Handle type="source" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  shape: ShapeNode,
};

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
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport, getNodes, getEdges } = useReactFlow();

  // Sync external state with internal state
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle nodes change
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeInternal(changes);
    const updatedNodes = getNodes();
    onNodesChange(updatedNodes);
  }, [onNodesChangeInternal, onNodesChange, getNodes]);

  // Handle edges change
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes);
    const updatedEdges = getEdges();
    onEdgesChange(updatedEdges);
  }, [onEdgesChangeInternal, onEdgesChange, getEdges]);

  // Handle new connections
  const handleConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'default',
    };
    setEdges((eds) => addEdge(newEdge, eds));
    onConnect(connection);
  }, [onConnect, setEdges]);

  // Handle context menu
  const handleContextMenuAction = useCallback((action: string, nodeId?: string) => {
    switch (action) {
      case 'delete':
        if (nodeId) {
          setNodes((nds) => nds.filter((n) => n.id !== nodeId));
          setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        }
        break;
      case 'duplicate':
        if (nodeId) {
          const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
          if (nodeToDuplicate) {
            const newNode = {
              ...nodeToDuplicate,
              id: `node-${Date.now()}`,
              position: {
                x: nodeToDuplicate.position.x + 20,
                y: nodeToDuplicate.position.y + 20,
              },
            };
            setNodes((nds) => [...nds, newNode]);
          }
        }
        break;
    }
    setContextMenu(null);
  }, [nodes, setNodes, setEdges]);

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
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'default',
          markerEnd: { type: MarkerType.Arrow },
        }}
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