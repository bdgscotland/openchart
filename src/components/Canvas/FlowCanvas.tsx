import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
  ConnectionMode,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import { toPng, toSvg, toJpeg, toCanvas } from 'html-to-image';
import '@xyflow/react/dist/style.css';
import './FlowCanvas.css';
import './ConnectionFeedback.css';

import ShapeNode from './ShapeNode';
import EventStormNode from './eventStorm/EventStormNode';
import BoundedContextContainer from './eventStorm/BoundedContextContainer';
import TimelineGuide from './eventStorm/TimelineGuide';
import EventStormLegend from './eventStorm/EventStormLegend';
import useShapeHandlers from './hooks/useShapeHandlers';
import { useConnectionPool } from '../../hooks/useConnectionPool';
import { useConnectionTools } from '../../hooks/useConnectionTools';
import { useLayerOperations } from '../../contexts/LayerOperationsContext';
import { useLayers } from '../../contexts/LayerContext';
import SelectionToolbar from './SelectionToolbar';
import { edgeTypes } from './edges';
import CanvasContextMenu from './ContextMenu/CanvasContextMenu';

// Memoized node types registry - defined outside component to avoid re-creation
const nodeTypes = {
  shape: ShapeNode,
  // Event Storm sticky note types - all use the same EventStormNode component
  'es-event': EventStormNode,
  'es-actor': EventStormNode,
  'es-question': EventStormNode,
  'es-command': EventStormNode,
  'es-policy': EventStormNode,
  'es-readmodel': EventStormNode,
  'es-aggregate': EventStormNode,
  'es-external': EventStormNode,
  'es-ui': EventStormNode,
  'es-hotspot': EventStormNode,
  // Event Storm container for bounded contexts
  'es-context': BoundedContextContainer,
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
  gridStyle?: 'dots' | 'lines' | 'cross';
  backgroundColor?: string;
  showMiniMap?: boolean;
  showControls?: boolean;
  showRulers?: boolean;
  snapToGrid?: boolean;
  connectionMode?: 'loose' | 'strict';
  mode?: 'diagram' | 'eventStorm';
  eventStormPhase?: 'big-picture' | 'process-modeling' | 'software-design';
  onEventStormPhaseChange?: (phase: 'big-picture' | 'process-modeling' | 'software-design') => void;
  // Enhanced connection features
  selectedConnectionTool?: string;
  onConnectionToolChange?: (toolId: string) => void;
  enableConnectionPreview?: boolean;
}

const FlowCanvasContent = forwardRef<any, FlowCanvasProps>((props, ref) => {
  const {
    nodes,
    edges,
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
    gridColor = '#e0e0e0',
    gridStyle = 'dots',
    backgroundColor = '#ffffff',
    showMiniMap = true,
    showControls = true,
    showRulers = false,
    snapToGrid: propSnapToGrid = true,
    connectionMode: propConnectionMode = 'loose',
    mode = 'diagram',
    eventStormPhase = 'big-picture',
    onEventStormPhaseChange,
  } = props;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string; edgeId?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Enhanced drag & drop states
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; shapeType: string } | null>(null);
  // Selection state management
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const snapToGrid = propSnapToGrid;
  const connectionMode = propConnectionMode;

  // Map grid style to BackgroundVariant
  const gridVariant = gridStyle === 'lines' ? BackgroundVariant.Lines
    : gridStyle === 'cross' ? BackgroundVariant.Cross
    : BackgroundVariant.Dots;

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport, screenToFlowPosition } = useReactFlow();

  // Get layer operations and data from contexts
  const layerOps = useLayerOperations();
  const { getLayers, getLayer, getActiveLayer } = useLayers();

  // Create derived nodes array that applies layer properties (visibility, locked, opacity)
  const nodesWithLayerProps = useMemo(() => {
    return nodes.map(node => {
      const layer = getLayer(node.data?.layerId);
      if (!layer) return node;

      // Get existing style safely
      const existingStyle = node.data?.style && typeof node.data.style === 'object' ? node.data.style : {};
      const existingOpacity = typeof existingStyle === 'object' && 'opacity' in existingStyle
        ? (existingStyle.opacity as number)
        : 1;

      return {
        ...node,
        hidden: node.hidden || !layer.visible,  // Hide if layer is hidden
        draggable: node.draggable !== false && !layer.locked,  // Lock if layer is locked
        selectable: node.selectable !== false && !layer.locked,
        data: {
          ...node.data,
          style: {
            ...existingStyle,
            opacity: existingOpacity * layer.opacity  // Apply layer opacity
          }
        }
      };
    });
  }, [nodes, getLayers, getLayer]);

  // Create derived edges array that applies layer properties (visibility, locked, opacity)
  const edgesWithLayerProps = useMemo(() => {
    return edges.map(edge => {
      const layer = getLayer(edge.data?.layerId);
      if (!layer) return edge;

      // Get existing style safely
      const existingStyle = edge.data?.style && typeof edge.data.style === 'object' ? edge.data.style : {};
      const existingOpacity = typeof existingStyle === 'object' && 'opacity' in existingStyle
        ? (existingStyle.opacity as number)
        : 1;

      return {
        ...edge,
        hidden: edge.hidden || !layer.visible,
        selectable: edge.selectable !== false && !layer.locked,
        data: {
          ...edge.data,
          style: {
            ...existingStyle,
            opacity: existingOpacity * layer.opacity
          }
        }
      };
    });
  }, [edges, getLayers, getLayer]);

  // Use connection pool for optimized edge creation
  const {
    addConnection: addPooledConnection,
    hasConnection,
    cleanup: cleanupConnectionPool
  } = useConnectionPool(edges, onEdgesChange, 100);

  // Use our custom shape handlers hook
  const {
    handleDeleteNodes,
    handleDuplicateNodes,
  } = useShapeHandlers({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
  });

  // Helper function to snap position to grid
  const snapToGridPosition = useCallback((position: { x: number; y: number }) => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }, [snapToGrid, gridSize]);

  // Wrapper to convert React Flow's NodeChange[] events to Node[] for parent callback
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes to current nodes to get updated nodes array
    const updatedNodes = applyNodeChanges(changes, nodes);
    // Call parent's onNodesChange with the updated nodes array
    onNodesChange(updatedNodes);
  }, [nodes, onNodesChange]);

  // Wrapper to convert React Flow's EdgeChange[] events to Edge[] for parent callback
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes to current edges to get updated edges array
    const updatedEdges = applyEdgeChanges(changes, edges);
    // Call parent's onEdgesChange with the updated edges array
    onEdgesChange(updatedEdges);
  }, [edges, onEdgesChange]);

  // Cleanup connection pool on unmount
  useEffect(() => {
    return () => {
      cleanupConnectionPool();
    };
  }, [cleanupConnectionPool]);

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

    // Get the active layer
    const activeLayer = getActiveLayer();

    // Check if this is an Event Storm sticky type
    const isEventStormSticky = shapeType.startsWith('es-');

    if (isEventStormSticky) {
      // Handle Event Storm elements (stickies and containers)
      console.log('🎯 Creating Event Storm element:', shapeType);

      // Special handling for bounded context container
      if (shapeType === 'es-context') {
        const newNode = {
          id: `node-${Date.now()}`,
          type: 'es-context',
          position,
          draggable: true,
          selectable: true,
          width: 500,
          height: 400,
          measured: { width: 500, height: 400 },
          data: {
            label: 'Bounded Context',
            description: '',
            color: '#E8F4FD',
            layerId: activeLayer.id,
          },
        };

        console.log('🎯 New bounded context container created:', newNode);
        const updatedNodes = nodes.concat(newNode);
        onNodesChange(updatedNodes);
        return;
      }

      // Import sticky definitions to get color and metadata for regular stickies
      import('../Toolbar/eventStormDefinitions').then(({ getStickyDefinition }) => {
        const stickyDef = getStickyDefinition(shapeType.replace('es-', ''));

        if (!stickyDef) {
          console.warn(`❌ Invalid Event Storm sticky type: ${shapeType}`);
          return;
        }

        console.log('✅ Sticky definition found:', stickyDef);

        const newNode = {
          id: `node-${Date.now()}`,
          type: shapeType,  // 'es-event', 'es-actor', etc.
          position,
          draggable: true,
          selectable: true,
          width: 180,
          height: 120,
          measured: { width: 180, height: 120 },
          data: {
            label: '',  // Empty label initially - user will double-click to edit
            stickyType: stickyDef.stickyType,
            color: stickyDef.color,
            phase: stickyDef.phase,
            layerId: activeLayer.id,
          },
        };

        console.log('🎯 New Event Storm node created:', newNode);

        // Add new node to the parent's state
        const updatedNodes = nodes.concat(newNode);
        console.log('🎯 Calling external onNodesChange with:', updatedNodes);
        onNodesChange(updatedNodes);
      }).catch((error) => {
        console.error('❌ Error importing Event Storm definitions:', error);
      });

      return;  // Early return for Event Storm elements
    }

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
          // Update through parent's onNodesChange
          const updatedNodes = nodes.map((node) =>
            node.id === newNode.id
              ? { ...node, data: { ...node.data, label: text } }
              : node
          );
          onNodesChange(updatedNodes);
        },
      });

      // Add layerId to the node's data
      newNode.data = {
        ...newNode.data,
        layerId: activeLayer.id,
      };

      console.log('🎯 New node created:', newNode);

      // Add new node to the parent's state
      const updatedNodes = nodes.concat(newNode);
      console.log('🎯 Updated nodes array:', updatedNodes);
      console.log('🎯 Calling external onNodesChange with:', updatedNodes);
      onNodesChange(updatedNodes);
    }).catch((error) => {
      console.error('❌ Error importing shapes module:', error);
    });
  }, [screenToFlowPosition, nodes, onNodesChange, snapToGridPosition, getActiveLayer]);

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

  const onSelectionDragStop = useCallback((event: React.MouseEvent, draggedNodes: Node[]) => {
    console.log('🎯 Selection drag stop:', draggedNodes.length, 'nodes');
    setIsDragging(false);

    // Apply snap-to-grid for all selected nodes after drag
    if (snapToGrid && draggedNodes.length > 0) {
      const updatedNodes = nodes.map((node) => {
        const isSelected = draggedNodes.some(selectedNode => selectedNode.id === node.id);
        if (isSelected) {
          const snappedPosition = snapToGridPosition(node.position);
          return { ...node, position: snappedPosition };
        }
        return node;
      });
      onNodesChange(updatedNodes);
    }
  }, [snapToGrid, snapToGridPosition, nodes, onNodesChange]);

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
    let updatedNodes: Node[];

    switch (alignment) {
      case 'left':
        targetValue = Math.min(...nodePositions.map(pos => pos.x));
        updatedNodes = nodes.map((node) =>
          selectedNodes.some(selected => selected.id === node.id)
            ? { ...node, position: { ...node.position, x: targetValue } }
            : node
        );
        break;
      case 'right':
        targetValue = Math.max(...nodePositions.map(pos => pos.x));
        updatedNodes = nodes.map((node) =>
          selectedNodes.some(selected => selected.id === node.id)
            ? { ...node, position: { ...node.position, x: targetValue } }
            : node
        );
        break;
      case 'center': {
        const minX = Math.min(...nodePositions.map(pos => pos.x));
        const maxX = Math.max(...nodePositions.map(pos => pos.x));
        targetValue = (minX + maxX) / 2;
        updatedNodes = nodes.map((node) =>
          selectedNodes.some(selected => selected.id === node.id)
            ? { ...node, position: { ...node.position, x: targetValue } }
            : node
        );
        break;
      }
      case 'top':
        targetValue = Math.min(...nodePositions.map(pos => pos.y));
        updatedNodes = nodes.map((node) =>
          selectedNodes.some(selected => selected.id === node.id)
            ? { ...node, position: { ...node.position, y: targetValue } }
            : node
        );
        break;
      case 'bottom':
        targetValue = Math.max(...nodePositions.map(pos => pos.y));
        updatedNodes = nodes.map((node) =>
          selectedNodes.some(selected => selected.id === node.id)
            ? { ...node, position: { ...node.position, y: targetValue } }
            : node
        );
        break;
      case 'middle': {
        const minY = Math.min(...nodePositions.map(pos => pos.y));
        const maxY = Math.max(...nodePositions.map(pos => pos.y));
        targetValue = (minY + maxY) / 2;
        updatedNodes = nodes.map((node) =>
          selectedNodes.some(selected => selected.id === node.id)
            ? { ...node, position: { ...node.position, y: targetValue } }
            : node
        );
        break;
      }
      default:
        return;
    }

    onNodesChange(updatedNodes);
  }, [selectedNodes, nodes, onNodesChange]);

  // Layer management: Bring selected nodes to front
  // Layer operation handlers using the new context
  const handleBringToFront = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map(node => node.id);
    console.log('🔼 Bring to Front:', selectedIds.length, 'nodes');
    layerOps.bringToFront(selectedIds);
  }, [selectedNodes, layerOps]);

  const handleBringForward = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map(node => node.id);
    console.log('🔼 Bring Forward:', selectedIds.length, 'nodes');
    layerOps.bringForward(selectedIds);
  }, [selectedNodes, layerOps]);

  const handleSendBackward = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map(node => node.id);
    console.log('🔽 Send Backward:', selectedIds.length, 'nodes');
    layerOps.sendBackward(selectedIds);
  }, [selectedNodes, layerOps]);

  const handleSendToBack = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map(node => node.id);
    console.log('🔽 Send to Back:', selectedIds.length, 'nodes');
    layerOps.sendToBack(selectedIds);
  }, [selectedNodes, layerOps]);

  // Keyboard shortcuts for selection operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A - Select all nodes
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        const updatedNodes = nodes.map((node) => ({ ...node, selected: true }));
        onNodesChange(updatedNodes);
        console.log('🎯 Select All: Selected', updatedNodes.length, 'nodes');
        return;
      }

      // Escape - Clear selection
      if (event.key === 'Escape') {
        event.preventDefault();
        const updatedNodes = nodes.map((node) => ({ ...node, selected: false }));
        const updatedEdges = edges.map((edge) => ({ ...edge, selected: false }));
        onNodesChange(updatedNodes);
        onEdgesChange(updatedEdges);
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

      // Event Storm Mode: Keyboard shortcuts for quick sticky creation
      // Only active when in Event Storm mode and not typing in an input
      if (mode === 'eventStorm' &&
          !(event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            (event.target as HTMLElement).contentEditable === 'true')) {

        // Prevent shortcuts when modifier keys are pressed (except for the key itself)
        if (event.ctrlKey || event.metaKey || event.altKey) {
          return;
        }

        let stickyType: string | null = null;

        // Map keys to sticky types
        switch (event.key.toLowerCase()) {
          // Big Picture Phase
          case 'e': stickyType = 'event'; break;
          case 'a': stickyType = 'actor'; break;
          case 'q': stickyType = 'question'; break;
          // Process Modeling Phase
          case 'c': stickyType = 'command'; break;
          case 'p': stickyType = 'policy'; break;
          case 'r': stickyType = 'readmodel'; break;
          // Software Design Phase
          case 'g': stickyType = 'aggregate'; break;
          case 'x': stickyType = 'external'; break;
          case 'u': stickyType = 'ui'; break;
          case 'h': stickyType = 'hotspot'; break;
        }

        if (stickyType) {
          event.preventDefault();

          // Check if this sticky type is available in the current phase
          import('../Toolbar/eventStormDefinitions').then(({ getStickyDefinition, getStickiesForPhase }) => {
            const availableStickies = getStickiesForPhase(eventStormPhase);
            const stickyDef = getStickyDefinition(stickyType!);

            if (!stickyDef || !availableStickies.find(s => s.id === stickyType)) {
              console.log(`⚠️ Sticky type "${stickyType}" not available in ${eventStormPhase} phase`);
              return;
            }

            // Get viewport center for placement
            const viewport = getViewport();
            const centerX = (-viewport.x + (reactFlowWrapper.current?.clientWidth || 800) / 2) / viewport.zoom;
            const centerY = (-viewport.y + (reactFlowWrapper.current?.clientHeight || 600) / 2) / viewport.zoom;

            const position = snapToGridPosition({ x: centerX, y: centerY });
            const activeLayer = getActiveLayer();

            const newNode = {
              id: `node-${Date.now()}`,
              type: `es-${stickyType}`,
              position,
              draggable: true,
              selectable: true,
              selected: true,  // Auto-select the new sticky
              width: 180,
              height: 120,
              measured: { width: 180, height: 120 },
              data: {
                label: '',  // Empty - user will fill in
                stickyType: stickyDef.stickyType,
                color: stickyDef.color,
                phase: stickyDef.phase,
                layerId: activeLayer.id,
                autoEdit: true,  // Auto-open editing mode
              },
            };

            console.log(`✨ Created ${stickyType} sticky via keyboard shortcut (${event.key.toUpperCase()})`);

            // Deselect all other nodes and add the new one
            const updatedNodes = nodes.map(n => ({ ...n, selected: false })).concat(newNode);
            onNodesChange(updatedNodes);
          }).catch((error) => {
            console.error('❌ Error creating sticky via keyboard:', error);
          });

          return;
        }
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, selectedEdges, nodes, edges, onNodesChange, onEdgesChange, handleDeleteNodes, handleDuplicateNodes, mode, eventStormPhase, snapToGridPosition, getViewport, getActiveLayer]);

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
      // Note: toggle-snap and toggle-connection-mode would need to be handled
      // by the parent component since snapToGrid and connectionMode are now props
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
    getNodes: () => nodes,
    getEdges: () => edges,
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
    getZoom: () => {
      const viewport = getViewport();
      const zoom = viewport?.zoom;
      return (zoom !== undefined && !isNaN(zoom)) ? zoom : 1;
    },
  }), [fitView, getViewport, setViewport, nodes, edges, exportToPng, exportToSvg, exportToJpeg, exportToWebp, exportToPdf, snapToGrid, connectionMode, gridSize]);

  return (
    <div className="flow-canvas" ref={reactFlowWrapper} style={{ width: '100%', height: '100%', backgroundColor }}>
      <ReactFlow
        style={{ backgroundColor }}
        nodes={nodesWithLayerProps}
        edges={edgesWithLayerProps}
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
              const updatedNodes = nodes.map((n) =>
                n.id === node.id ? { ...n, position: snappedPosition } : n
              );
              onNodesChange(updatedNodes);
            }
          }
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
        onEdgeContextMenu={(event, edge) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
          onEdgeContextMenu?.(event, edge);
        }}
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
        selectNodesOnDrag={false}
        selectionOnDrag={true}
        multiSelectionKeyCode="Shift"
        selectionKeyCode={null}
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
        {showGrid && <Background variant={gridVariant} gap={gridSize} color={gridColor} />}


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
          onBringToFront={handleBringToFront}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onSendToBack={handleSendToBack}
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

      {/* Canvas Context Menu */}
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          contextNode={contextMenu.nodeId ? nodes.find(n => n.id === contextMenu.nodeId) : undefined}
          contextEdge={contextMenu.edgeId ? edges.find(e => e.id === contextMenu.edgeId) : undefined}
          onDelete={() => {
            if (contextMenu.nodeId) {
              handleDeleteNodes([contextMenu.nodeId]);
            } else if (contextMenu.edgeId) {
              const updatedEdges = edges.filter(e => e.id !== contextMenu.edgeId);
              onEdgesChange(updatedEdges);
            } else if (selectedNodes.length > 0) {
              handleDeleteNodes(selectedNodes.map(n => n.id));
            } else if (selectedEdges.length > 0) {
              const selectedEdgeIds = selectedEdges.map(e => e.id);
              const updatedEdges = edges.filter(e => !selectedEdgeIds.includes(e.id));
              onEdgesChange(updatedEdges);
            }
          }}
          onUpdateEdgeStyle={(edgeId, styleUpdates) => {
            const updatedEdges = edges.map(edge =>
              edge.id === edgeId
                ? { ...edge, type: styleUpdates.type || edge.type }
                : edge
            );
            onEdgesChange(updatedEdges);
          }}
          onUpdateEdgeLabel={(edgeId, label) => {
            const updatedEdges = edges.map(edge =>
              edge.id === edgeId
                ? { ...edge, label }
                : edge
            );
            onEdgesChange(updatedEdges);
          }}
        />
      )}

      {/* Event Storm Workshop Components - only visible in Event Storm mode */}
      {mode === 'eventStorm' && (
        <>
          <TimelineGuide />
          <EventStormLegend phase={eventStormPhase} />
        </>
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
