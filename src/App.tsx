import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { ShapeLibrary } from './components/Toolbar';
import type { DrawingTool } from './types/shapes';
import { FlowCanvas } from './components/Canvas/FlowCanvas';
import useShapeCreation from './components/Canvas/hooks/useShapeCreation';
import { MenuBar } from './components/MenuBar/MenuBar';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { ActionToolbar } from './components/ActionToolbar';
import { useCanvasState } from './hooks/useCanvasState';
import { useActionToolbar } from './hooks/useActionToolbar';
import { useClipboard } from './hooks/useClipboard';
import { createEmptyDiagram } from './utils/diagramFactory';
// React Flow types are imported but typed as any for flexibility
import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type {
  ElementStyle,
  DiagramSettings,
  GridSettings,
  BackgroundSettings,
  PaperSettings,
  ViewportSettings,
  RulerSettings
} from './types/diagram';
import { DEFAULT_DIAGRAM_SETTINGS } from './types/diagram';
import { migrateAllNodeDimensions, debugNodeMigration, hasNodesThatNeedMigration } from './utils/nodeMigration';
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [nodes, setNodesInternal] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Enhanced setNodes function with automatic migration
  const setNodes = useCallback((nodesOrUpdater: Node[] | ((nodes: Node[]) => Node[])) => {
    setNodesInternal(currentNodes => {
      const newNodes = typeof nodesOrUpdater === 'function'
        ? nodesOrUpdater(currentNodes)
        : nodesOrUpdater;

      // Check if any nodes need migration
      if (hasNodesThatNeedMigration(newNodes)) {
        console.log('🔧 Automatically migrating nodes for proper edge connections');
        debugNodeMigration(newNodes, 'Before Migration');
        const migratedNodes = migrateAllNodeDimensions(newNodes);
        debugNodeMigration(migratedNodes, 'After Migration');
        return migratedNodes;
      }

      return newNodes;
    });
  }, []);
  // Diagram settings state
  const [diagramSettings, setDiagramSettings] = useState<DiagramSettings>(DEFAULT_DIAGRAM_SETTINGS);

  // Backward compatibility - extract individual values from diagram settings
  const showGrid = diagramSettings.grid.enabled;
  const showRulers = diagramSettings.rulers.enabled;
  const snapToGrid = diagramSettings.grid.snapToGrid;
  const [connectionMode, setConnectionMode] = useState<'loose' | 'strict'>('loose');

  // Sidebar collapse states with localStorage persistence
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('openchart-left-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('openchart-right-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const flowRef = useRef<React.ElementRef<typeof FlowCanvas>>(null);

  // Initialize diagram state for PropertyPanel
  const initialDiagram = createEmptyDiagram('OpenChart Diagram');
  const canvasState = useCanvasState(initialDiagram);


  // Convert React Flow nodes and edges to diagram elements for PropertyPanel
  // Optimized useMemo that includes both nodes and edges in selection
  const selectedElements = useMemo(() => {
    const currentlySelectedNodes = nodes.filter(node => node.selected);
    const currentlySelectedEdges = edges.filter(edge => edge.selected);

    // Early return if no selection to avoid expensive computation
    if (currentlySelectedNodes.length === 0 && currentlySelectedEdges.length === 0) {
      return [];
    }

    // Convert selected nodes to diagram elements
    const nodeElements = currentlySelectedNodes.map(node => {
      // Get complete style from node.data.style with efficient defaults
      const nodeStyle = node.data?.style as ElementStyle | undefined;

      // Simplified style computation with fewer conditional checks
      const completeStyle = {
        fill: nodeStyle?.fill || node.data?.backgroundColor || '#f0f9ff',
        stroke: nodeStyle?.stroke || node.data?.borderColor || '#d1d5db',
        strokeWidth: nodeStyle?.strokeWidth || 2,
        opacity: nodeStyle?.opacity ?? 1,
        fontSize: nodeStyle?.fontSize || 14,
        fontFamily: nodeStyle?.fontFamily || 'Arial, sans-serif',
        fontWeight: nodeStyle?.fontWeight || 'normal' as const,
        fontStyle: nodeStyle?.fontStyle || 'normal' as const,
        textAlign: nodeStyle?.textAlign || 'center' as const,
        cornerRadius: nodeStyle?.cornerRadius || 8,
        color: nodeStyle?.color || '#000000',
        textDecoration: nodeStyle?.textDecoration || 'none',
        textTransform: nodeStyle?.textTransform || 'none',
        lineHeight: nodeStyle?.lineHeight || 1.4,
        letterSpacing: nodeStyle?.letterSpacing || 'normal',
        wordSpacing: nodeStyle?.wordSpacing || 'normal',
        ...(nodeStyle || {}) // Preserve any additional style properties
      };

      return {
        id: node.id,
        type: (node.data?.shape || 'rectangle') as any,
        position: node.position,
        size: {
          width: node.data?.width || node.style?.width || 120,
          height: node.data?.height || node.style?.height || 80
        },
        style: completeStyle,
        text: node.data?.label || '',
        visible: true,
        locked: false,
        zIndex: node.zIndex || 0,
        properties: {} // Extensible properties
      };
    });

    // Convert selected edges to diagram elements (simplified representation)
    const edgeElements = currentlySelectedEdges.map(edge => {
      return {
        id: edge.id,
        type: 'edge' as any,
        position: { x: 0, y: 0 }, // Edges don't have fixed positions
        size: { width: 0, height: 0 },
        style: {
          fill: 'transparent',
          stroke: edge.style?.stroke || '#94a3b8',
          strokeWidth: edge.style?.strokeWidth || 2,
          opacity: 1,
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal' as const,
          fontStyle: 'normal' as const,
          textAlign: 'center' as const,
          cornerRadius: 0,
          color: '#000000',
          textDecoration: 'none',
          textTransform: 'none',
          lineHeight: 1.4,
          letterSpacing: 'normal',
          wordSpacing: 'normal',
        },
        text: edge.label || '',
        visible: true,
        locked: false,
        zIndex: 0,
        properties: {
          source: edge.source,
          target: edge.target,
          edgeType: edge.type
        }
      };
    });

    const allElements = [...nodeElements, ...edgeElements];
    console.log('🔄 selectedElements recomputed:', {
      nodes: nodeElements.length,
      edges: edgeElements.length,
      total: allElements.length
    });
    return allElements;
  }, [
    nodes.filter(n => n.selected).map(n => n.id).join(','),
    edges.filter(e => e.selected).map(e => e.id).join(','),
    nodes.length,
    edges.length
  ]); // Recompute when node or edge selection changes

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
  }, []);

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
  }, []);

  const handleUpdateElementPosition = useCallback((elementId: string, x: number, y: number) => {
    setNodes(nodes => nodes.map(node =>
      node.id === elementId
        ? { ...node, position: { x, y } }
        : node
    ));
  }, []);

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
  }, []);

  // Shape creation hook
  const { handleCanvasClick } = useShapeCreation({
    selectedTool,
    onNodesChange: setNodes,
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
  }, [handleCanvasClick]);

  // Update all nodes when selectedTool changes to show connection mode
  useEffect(() => {
    setNodes(currentNodes =>
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          selectedTool: selectedTool,
          isConnectionMode: selectedTool === 'connector'
        }
      }))
    );
  }, [selectedTool]);

  // Menu handlers
  const handleNewDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  const handleSaveDiagram = useCallback(async () => {
    // Get viewport from React Flow instance
    const viewport = flowRef.current?.getViewport() || { x: 0, y: 0, zoom: 1 };

    // Use the new persistence module
    const { diagramPersistence } = await import('./utils/diagramPersistence');
    await diagramPersistence.saveDiagramToFile(nodes, edges, viewport, {
      title: 'OpenChart Diagram',
      createdWith: 'OpenChart',
    });
  }, [nodes, edges]);

  // Keep a ref to the file input to reuse it
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const handleLoadDiagram = useCallback(() => {
    // Trigger the file input - works in regular browsers
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (flowRef.current?.exportToPng) {
      try {
        await flowRef.current.exportToPng();
      } catch (error) {
        console.error('Error exporting PNG:', error);
        alert('Failed to export PNG');
      }
    }
  }, []);

  const handleExportJPEG = useCallback(async () => {
    if (flowRef.current?.exportToJpeg) {
      try {
        await flowRef.current.exportToJpeg();
      } catch (error) {
        console.error('Error exporting JPEG:', error);
        alert('Failed to export JPEG');
      }
    }
  }, []);

  const handleExportWebP = useCallback(async () => {
    if (flowRef.current?.exportToWebp) {
      try {
        await flowRef.current.exportToWebp();
      } catch (error) {
        console.error('Error exporting WebP:', error);
        alert('Failed to export WebP');
      }
    }
  }, []);

  const handleExportSVG = useCallback(async () => {
    if (flowRef.current?.exportToSvg) {
      try {
        await flowRef.current.exportToSvg();
      } catch (error) {
        console.error('Error exporting SVG:', error);
        alert('Failed to export SVG');
      }
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (flowRef.current?.exportToPdf) {
      try {
        await flowRef.current.exportToPdf();
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF');
      }
    }
  }, []);

  const handleLoadExample = useCallback(async (exampleName: string) => {
    // Create example diagrams with proper React Flow nodes using createShapeNode
    const { createShapeNode } = await import('./components/Canvas/shapes');

    switch (exampleName) {
      case 'flowchart':
        const exampleNodes = [
          createShapeNode({
            id: '1',
            position: { x: 250, y: 50 },
            shapeType: 'rectangle',
            label: 'Start',
            width: 120,
            height: 60
          }),
          createShapeNode({
            id: '2',
            position: { x: 250, y: 150 },
            shapeType: 'rectangle',
            label: 'Process',
            width: 120,
            height: 60
          }),
          createShapeNode({
            id: '3',
            position: { x: 250, y: 250 },
            shapeType: 'diamond',
            label: 'Decision',
            width: 120,
            height: 120
          }),
          createShapeNode({
            id: '4',
            position: { x: 100, y: 400 },
            shapeType: 'rectangle',
            label: 'Option A',
            width: 120,
            height: 60
          }),
          createShapeNode({
            id: '5',
            position: { x: 400, y: 400 },
            shapeType: 'rectangle',
            label: 'Option B',
            width: 120,
            height: 60
          }),
          createShapeNode({
            id: '6',
            position: { x: 250, y: 500 },
            shapeType: 'circle',
            label: 'End',
            width: 80,
            height: 80
          }),
        ];

        console.log('🔧 Loading example flowchart with properly configured nodes');
        setNodes(exampleNodes);
        setEdges([
          { id: 'e1-2', source: '1', sourceHandle: 'bottom', target: '2', targetHandle: 'top', type: 'smoothstep' },
          { id: 'e2-3', source: '2', sourceHandle: 'bottom', target: '3', targetHandle: 'top', type: 'smoothstep' },
          { id: 'e3-4', source: '3', sourceHandle: 'left', target: '4', targetHandle: 'top', type: 'smoothstep', label: 'Yes' },
          { id: 'e3-5', source: '3', sourceHandle: 'right', target: '5', targetHandle: 'top', type: 'smoothstep', label: 'No' },
          { id: 'e4-6', source: '4', sourceHandle: 'bottom', target: '6', targetHandle: 'left', type: 'smoothstep' },
          { id: 'e5-6', source: '5', sourceHandle: 'bottom', target: '6', targetHandle: 'right', type: 'smoothstep' },
        ]);
        break;
      default:
        setNodes([]);
        setEdges([]);
    }
  }, []);

  const handleUndo = useCallback(() => {
    canvasState.undo();
  }, [canvasState]);

  const handleRedo = useCallback(() => {
    canvasState.redo();
  }, [canvasState]);

  const handleToggleGrid = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      grid: { ...prev.grid, enabled: !prev.grid.enabled }
    }));
  }, []);

  const handleToggleRulers = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      rulers: { ...prev.rulers, enabled: !prev.rulers.enabled }
    }));
  }, []);

  // Diagram settings handlers for PropertyPanel
  const handleGridSettingsChange = useCallback((gridSettings: Partial<GridSettings>) => {
    setDiagramSettings(prev => ({
      ...prev,
      grid: { ...prev.grid, ...gridSettings }
    }));
  }, []);

  const handleBackgroundSettingsChange = useCallback((backgroundSettings: Partial<BackgroundSettings>) => {
    setDiagramSettings(prev => ({
      ...prev,
      background: { ...prev.background, ...backgroundSettings }
    }));
  }, []);

  const handlePaperSettingsChange = useCallback((paperSettings: Partial<PaperSettings>) => {
    setDiagramSettings(prev => ({
      ...prev,
      paper: { ...prev.paper, ...paperSettings }
    }));
  }, []);

  const handleViewportSettingsChange = useCallback((viewportSettings: Partial<ViewportSettings>) => {
    setDiagramSettings(prev => ({
      ...prev,
      viewport: { ...prev.viewport, ...viewportSettings }
    }));
  }, []);

  const handleRulerSettingsChange = useCallback((rulerSettings: Partial<RulerSettings>) => {
    setDiagramSettings(prev => ({
      ...prev,
      rulers: { ...prev.rulers, ...rulerSettings }
    }));
  }, []);

  // Enhanced View Menu Handlers

  // UI Panel Toggle Handlers
  const handleToggleFormatPanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, formatPanel: !prev.uiPanels.formatPanel }
    }));
    // Also toggle the actual right sidebar
    setIsRightSidebarCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('openchart-right-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const handleToggleOutlinePanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, outlinePanel: !prev.uiPanels.outlinePanel }
    }));
    // TODO: Implement outline panel when built
  }, []);

  const handleToggleLayersPanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, layersPanel: !prev.uiPanels.layersPanel }
    }));
    // TODO: Implement layers panel when built
  }, []);

  const handleToggleShapesPanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, shapesPanel: !prev.uiPanels.shapesPanel }
    }));
    // Also toggle the actual left sidebar
    setIsLeftSidebarCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('openchart-left-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const handleToggleSearchShapes = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, searchShapes: !prev.uiPanels.searchShapes }
    }));
    // TODO: Implement search shapes panel when built
  }, []);

  const handleToggleScratchpad = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, scratchpad: !prev.uiPanels.scratchpad }
    }));
    // TODO: Implement scratchpad panel when built
  }, []);

  const handleToggleTags = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, tags: !prev.uiPanels.tags }
    }));
    // TODO: Implement tags panel when built
  }, []);

  // Display Toggle Handlers
  const handleToggleTooltips = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, tooltips: !prev.display.tooltips }
    }));
  }, []);

  const handleToggleAnimations = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, animations: !prev.display.animations }
    }));
  }, []);

  const handleToggleGuides = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, guides: !prev.display.guides }
    }));
  }, []);

  const handleTogglePageTabs = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, pageTabs: !prev.display.pageTabs }
    }));
    // TODO: Implement page tabs when built
  }, []);

  const handleTogglePageView = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, pageView: !prev.display.pageView }
    }));
    // TODO: Implement page view mode when built
  }, []);

  // Connection Visualization Toggle Handlers
  const handleToggleConnectionArrows = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      connectionVisualization: {
        ...prev.connectionVisualization,
        connectionArrows: !prev.connectionVisualization.connectionArrows
      }
    }));
    // TODO: Apply to existing edges and canvas rendering
  }, []);

  const handleToggleConnectionPoints = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      connectionVisualization: {
        ...prev.connectionVisualization,
        connectionPoints: !prev.connectionVisualization.connectionPoints
      }
    }));
    // TODO: Apply to canvas rendering to show/hide connection points
  }, []);

  // View Control Handlers
  const handleResetView = useCallback(() => {
    if (flowRef.current) {
      flowRef.current.setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, []);


  const handleToggleFullscreen = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      view: { ...prev.view, fullscreen: !prev.view.fullscreen }
    }));

    // Actually toggle fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Units and Scale Handlers
  const handleChangeUnits = useCallback((units: 'px' | 'cm' | 'in' | 'pt' | 'mm') => {
    setDiagramSettings(prev => ({
      ...prev,
      view: { ...prev.view, units }
    }));
  }, []);

  const handleChangePageScale = useCallback((scale: number) => {
    setDiagramSettings(prev => ({
      ...prev,
      view: { ...prev.view, scale }
    }));
    // TODO: Apply scale to canvas/viewport when implemented
  }, []);

  // Clipboard functionality
  const clipboard = useClipboard({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
  });

  // Action toolbar functionality - after handlers are defined
  const actionToolbar = useActionToolbar({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
    canUndo: canvasState.canUndo,
    canRedo: canvasState.canRedo,
    onUndo: handleUndo,
    onRedo: handleRedo,
    flowCanvasRef: flowRef,
  });

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

  // Sidebar collapse handlers
  const handleToggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('openchart-left-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('openchart-right-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected nodes - handled by ActionToolbar
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Let ActionToolbar handle deletion to avoid conflicts
        return;
      }

      // Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        clipboard.copySelection();
      }

      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        clipboard.pasteSelection();
      }

      // Duplicate (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        clipboard.duplicateSelection();
      }

      // Select All (Ctrl+A / Cmd+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setNodes(nodes => nodes.map(n => ({ ...n, selected: true })));
        setEdges(edges => edges.map(e => ({ ...e, selected: true })));
      }

      // Save (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDiagram();
      }

      // New (Ctrl+N / Cmd+N)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (confirm('Create a new diagram? Any unsaved changes will be lost.')) {
          handleNewDiagram();
        }
      }

      // Open (Ctrl+O / Cmd+O)
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleLoadDiagram();
      }

      // Undo/Redo - handled by ActionToolbar
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Let ActionToolbar handle undo/redo to avoid conflicts
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        // Let ActionToolbar handle undo/redo to avoid conflicts
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, clipboard, handleSaveDiagram, handleNewDiagram, handleLoadDiagram, handleUndo, handleRedo]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (nodes.length > 0 || edges.length > 0) {
        const viewport = flowRef.current?.getViewport() || { x: 0, y: 0, zoom: 1 };

        // Use the new persistence module for auto-save
        const { diagramPersistence } = await import('./utils/diagramPersistence');
        await diagramPersistence.autoSaveDiagram(nodes, edges, viewport);
      }
    };

    const autoSaveInterval = setInterval(autoSave, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [nodes, edges]);

  // Debug function for testing PropertyPanel integration and manual node migration
  useEffect(() => {
    (window as any).testPropertyPanel = () => {
      console.log('🧪 Testing PropertyPanel Integration...');
      console.log('📊 Current nodes:', nodes);
      console.log('🎯 Selected elements:', selectedElements);

      if (nodes.length > 0) {
        const firstNode = nodes[0];
        console.log('🎨 Testing style update on first node:', firstNode.id);

        handleUpdateElementStyle(firstNode.id, {
          fill: '#ff0000',
          stroke: '#0000ff',
          strokeWidth: 4,
          fontSize: 18,
          opacity: 0.8
        });

        console.log('✅ Style update called - check if shapes update visually!');
      } else {
        console.log('❌ No nodes found - add a shape first!');
      }
    };

    // Manual refresh function for fixing edge connections on existing canvases
    (window as any).refreshNodeDimensions = () => {
      console.log('🔧 Manual node dimension refresh triggered...');
      debugNodeMigration(nodes, 'Current Nodes');

      if (hasNodesThatNeedMigration(nodes)) {
        console.log('📊 Migrating nodes for proper edge connections...');
        const migratedNodes = migrateAllNodeDimensions(nodes);
        setNodes(migratedNodes);
        console.log('✅ Node migration complete! Edge connections should now work properly.');
      } else {
        console.log('✅ All nodes already have proper dimensions for edge connections.');
      }
    };

    // Check nodes function for debugging
    (window as any).checkNodeDimensions = () => {
      console.log('🔍 Checking current node dimensions...');
      debugNodeMigration(nodes, 'Dimension Check');

      const needsMigration = hasNodesThatNeedMigration(nodes);
      console.log(`📊 Migration needed: ${needsMigration ? 'YES' : 'NO'}`);

      if (needsMigration) {
        console.log('💡 Run window.refreshNodeDimensions() to fix edge connections');
      }
    };

    console.log('🔧 Debug functions added:');
    console.log('  - window.testPropertyPanel() - Test style updates');
    console.log('  - window.refreshNodeDimensions() - Fix edge connections for existing shapes');
    console.log('  - window.checkNodeDimensions() - Check if nodes need migration');
  }, [nodes, selectedElements, handleUpdateElementStyle]);

  // Load auto-saved diagram on mount
  useEffect(() => {
    // Auto-restore on every page load - no session storage protection needed

    const loadAutoSaved = async () => {
      if (nodes.length === 0 && edges.length === 0) {
        try {
          const { diagramPersistence } = await import('./utils/diagramPersistence');
          const diagram = await diagramPersistence.loadAutoSavedDiagram();

          if (diagram) {
            const lastSaved = new Date(diagram.timestamp);
            const minutesAgo = Math.floor((Date.now() - lastSaved.getTime()) / 60000);

            // Automatically restore the diagram without asking
            console.log(`🔄 Auto-restoring diagram from ${minutesAgo} minutes ago...`);

            const result = await diagramPersistence.importDiagram(diagram);

            setNodes(result.nodes);
            setEdges(result.edges);

            // Show restoration feedback if property panel data was restored
            if (result.restoredFeatures.length > 0) {
              console.log('✅ Restored property panel features:', result.restoredFeatures);
            }

            // Restore viewport if React Flow is ready
            if (result.viewport && flowRef.current) {
              setTimeout(() => {
                flowRef.current.setViewport(result.viewport);
              }, 100);
            }

            console.log(`✅ Diagram automatically restored (${result.nodes.length} nodes, ${result.edges.length} edges)`);
          }
        } catch (error) {
          console.error('Failed to load auto-saved diagram:', error);
        }
      }
    };

    loadAutoSaved();
  }, []); // Only run on mount


  return (
    <div className="app">
      {/* File input for loading diagrams - using label trick for better compatibility */}
      <label htmlFor="file-upload-input" style={{ display: 'none' }}>
        <input
          id="file-upload-input"
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();

            reader.onload = async (event: ProgressEvent<FileReader>) => {
              try {
                const content = event.target?.result as string;
                const diagram = JSON.parse(content);

                // Use the new persistence module for importing
                const { diagramPersistence } = await import('./utils/diagramPersistence');
                const result = await diagramPersistence.importDiagram(diagram);

                setNodes(result.nodes);
                setEdges(result.edges);

                // Show restoration feedback if property panel data was restored
                if (result.restoredFeatures.length > 0) {
                  console.log('Restored property panel features:', result.restoredFeatures);
                  // You could show a toast notification here instead
                }

                if (result.viewport && flowRef.current) {
                  setTimeout(() => {
                    flowRef.current.setViewport(result.viewport);
                  }, 100);
                }
              } catch (error) {
                console.error('Error loading diagram:', error);
                alert('Error loading diagram: Invalid file format or corrupted data');
              }

              // Clear the input value so the same file can be selected again
              e.target.value = '';
            };

            reader.readAsText(file);
          }
        }}
        />
      </label>

      <MenuBar
        onNewDiagram={handleNewDiagram}
        onSaveDiagram={handleSaveDiagram}
        onLoadDiagram={handleLoadDiagram}
        onExportPNG={handleExportPNG}
        onExportJPEG={handleExportJPEG}
        onExportWebP={handleExportWebP}
        onExportSVG={handleExportSVG}
        onExportPDF={handleExportPDF}
        onLoadExample={handleLoadExample}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canvasState.canUndo}
        canRedo={canvasState.canRedo}

        // Legacy view toggles
        onToggleGrid={handleToggleGrid}
        onToggleRulers={handleToggleRulers}

        // Enhanced View menu handlers
        onToggleFormatPanel={handleToggleFormatPanel}
        onToggleOutlinePanel={handleToggleOutlinePanel}
        onToggleLayersPanel={handleToggleLayersPanel}
        onToggleShapesPanel={handleToggleShapesPanel}
        onToggleSearchShapes={handleToggleSearchShapes}
        onToggleScratchpad={handleToggleScratchpad}
        onToggleTags={handleToggleTags}
        onToggleTooltips={handleToggleTooltips}
        onToggleAnimations={handleToggleAnimations}
        onToggleGuides={handleToggleGuides}
        onTogglePageTabs={handleTogglePageTabs}
        onTogglePageView={handleTogglePageView}
        onToggleConnectionArrows={handleToggleConnectionArrows}
        onToggleConnectionPoints={handleToggleConnectionPoints}
        onResetView={handleResetView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToView={handleFitToView}
        onToggleFullscreen={handleToggleFullscreen}
        onChangeUnits={handleChangeUnits}
        onChangePageScale={handleChangePageScale}
        diagramSettings={diagramSettings}
      />

      <header className="app-header">
        <h1>OpenChart</h1>
        <div className="header-info">
          <span>Nodes: {nodes.length}</span>
          <span>Edges: {edges.length}</span>
        </div>
      </header>

      <ActionToolbar
        canUndo={canvasState.canUndo}
        canRedo={canvasState.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        hasSelection={actionToolbar.hasSelection}
        onDelete={actionToolbar.handleDelete}
        onBringToFront={actionToolbar.handleBringToFront}
        onSendToBack={actionToolbar.handleSendToBack}
        edgeStyle={actionToolbar.edgeStyle}
        onEdgeStyleChange={actionToolbar.handleEdgeStyleChange}
        zoom={actionToolbar.zoom}
        onZoomIn={actionToolbar.handleZoomIn}
        onZoomOut={actionToolbar.handleZoomOut}
        onFitToView={actionToolbar.handleFitToView}
        snapToGrid={snapToGrid}
        onToggleSnapToGrid={() => setDiagramSettings(prev => ({
          ...prev,
          grid: { ...prev.grid, snapToGrid: !prev.grid.snapToGrid }
        }))}
        connectionMode={connectionMode}
        onToggleConnectionMode={() => setConnectionMode(connectionMode === 'loose' ? 'strict' : 'loose')}
      />

      <main className="app-main">
        <div className={`app-content ${isLeftSidebarCollapsed ? 'left-sidebar-collapsed' : ''} ${isRightSidebarCollapsed ? 'right-sidebar-collapsed' : ''}`}>
          <ShapeLibrary
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            isCollapsed={isLeftSidebarCollapsed}
            onToggleCollapse={handleToggleLeftSidebar}
          />
          <div className="canvas-area">
            <FlowCanvas
              ref={flowRef}
              nodes={nodes}
              edges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onConnect={(connection) => {
                console.log('🔗 Connection created:', connection);
                // Create the edge when nodes are connected
                const newEdge = {
                  id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
                  source: connection.source,
                  target: connection.target,
                  sourceHandle: connection.sourceHandle,
                  targetHandle: connection.targetHandle,
                  type: actionToolbar.edgeStyle === 'straight' ? 'straight' :
                        actionToolbar.edgeStyle === 'curved' ? 'bezier' : 'smoothstep',
                  animated: false,
                  style: { stroke: '#94a3b8', strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#94a3b8',
                  },
                };
                setEdges(currentEdges => [...currentEdges, newEdge]);
              }}
              onPaneClick={handlePaneClick}
              showGrid={showGrid}
              gridSize={diagramSettings.grid.size}
              gridColor={diagramSettings.grid.color}
              showRulers={showRulers}
              snapToGrid={snapToGrid}
              connectionMode={connectionMode}
            />
          </div>
          <PropertyPanel
            selectedElements={selectedElements}
            onUpdateElementStyle={handleUpdateElementStyle}
            onUpdateElementText={handleUpdateElementText}
            onUpdateElementPosition={handleUpdateElementPosition}
            onUpdateElementSize={handleUpdateElementSize}
            diagramSettings={diagramSettings}
            onGridSettingsChange={handleGridSettingsChange}
            onBackgroundSettingsChange={handleBackgroundSettingsChange}
            onPaperSettingsChange={handlePaperSettingsChange}
            onViewportSettingsChange={handleViewportSettingsChange}
            onRulerSettingsChange={handleRulerSettingsChange}
            isVisible={!isRightSidebarCollapsed}
            onToggleVisibility={handleToggleRightSidebar}
          />
        </div>
      </main>
    </div>
  );
}

export default App;