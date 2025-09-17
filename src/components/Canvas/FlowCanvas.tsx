import React, { useCallback, useRef, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
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
    <div className="shape-node-container" onDoubleClick={handleDoubleClick}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="connection-handle"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="connection-handle"
        style={{ top: -2 }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="connection-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="connection-handle"
        style={{ right: -2 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="connection-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="connection-handle"
        style={{ bottom: -2 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="connection-handle"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="connection-handle"
        style={{ left: -2 }}
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

const FlowCanvasContent: React.FC<FlowCanvasProps> = ({
  onNodesChange,
  onEdgesChange,
  initialNodes = [],
  initialEdges = [],
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  
  // Update nodes and edges when initial props change (for loading)
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);
  
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const [nodeId, setNodeId] = useState(1);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
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

      const newNode = {
        id: `node_${nodeId}`,
        type: 'shape',
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeId}`,
          shape: type,
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

  // Update parent when nodes or edges change
  React.useEffect(() => {
    onNodesChange?.(nodes);
  }, [nodes, onNodesChange]);

  React.useEffect(() => {
    onEdgesChange?.(edges);
  }, [edges, onEdgesChange]);

  return (
    <div className="flow-canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: '#6b7280', strokeWidth: 2 },
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="rgba(255, 255, 255, 0.05)"
        />
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
};

export const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent {...props} />
    </ReactFlowProvider>
  );
};