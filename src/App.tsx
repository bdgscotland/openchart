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
import { createEmptyDiagram } from './utils/diagramFactory';
// React Flow types are imported but typed as any for flexibility
import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { ElementStyle } from './types/diagram';
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);

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


  // Convert React Flow nodes to diagram elements for PropertyPanel
  // Optimized useMemo with dependency array that only includes selected nodes and their updates
  const selectedElements = useMemo(() => {
    const currentlySelectedNodes = nodes.filter(node => node.selected);

    // Early return if no selection to avoid expensive computation
    if (currentlySelectedNodes.length === 0) {
      return [];
    }

    const elements = currentlySelectedNodes.map(node => {
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

    console.log('🔄 selectedElements recomputed:', elements.length, 'selected');
    return elements;
  }, [nodes.filter(n => n.selected).map(n => n.id).join(','), nodes.length]); // Only recompute when selection changes

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

  const handleLoadExample = useCallback((exampleName: string) => {
    // Create example diagrams with React Flow nodes/edges
    switch (exampleName) {
      case 'flowchart':
        setNodes([
          { 
            id: '1', 
            position: { x: 250, y: 50 }, 
            data: { label: 'Start', shape: 'rectangle' }, 
            type: 'shape',
            style: { width: 120, height: 60 }
          },
          { 
            id: '2', 
            position: { x: 250, y: 150 }, 
            data: { label: 'Process', shape: 'rectangle' }, 
            type: 'shape',
            style: { width: 120, height: 60 }
          },
          { 
            id: '3', 
            position: { x: 250, y: 250 }, 
            data: { label: 'Decision', shape: 'diamond' }, 
            type: 'shape',
            style: { width: 120, height: 120 }
          },
          { 
            id: '4', 
            position: { x: 100, y: 400 }, 
            data: { label: 'Option A', shape: 'rectangle' }, 
            type: 'shape',
            style: { width: 120, height: 60 }
          },
          { 
            id: '5', 
            position: { x: 400, y: 400 }, 
            data: { label: 'Option B', shape: 'rectangle' }, 
            type: 'shape',
            style: { width: 120, height: 60 }
          },
          { 
            id: '6', 
            position: { x: 250, y: 500 }, 
            data: { label: 'End', shape: 'circle' }, 
            type: 'shape',
            style: { width: 80, height: 80 }
          },
        ]);
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
    setShowGrid(prev => !prev);
  }, []);

  const handleToggleRulers = useCallback(() => {
    setShowRulers(prev => !prev);
  }, []);

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

  // Sidebar collapse handlers
  const handleToggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('openchart-left-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed(prev => {
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
        const selectedNodesToCopy = nodes.filter(n => n.selected);
        if (selectedNodesToCopy.length > 0) {
          setCopiedNodes(selectedNodesToCopy);
        }
      }

      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (copiedNodes.length > 0) {
          const pasteOffset = 50;
          const newNodes = copiedNodes.map((node, index) => ({
            ...node,
            id: `${node.id}_copy_${Date.now()}_${index}`,
            position: {
              x: node.position.x + pasteOffset,
              y: node.position.y + pasteOffset,
            },
            selected: false,
          }));
          setNodes(nodes => [...nodes.map(n => ({ ...n, selected: false })), ...newNodes]);
        }
      }

      // Select All (Ctrl+A / Cmd+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setNodes(nodes => nodes.map(n => ({ ...n, selected: true })));
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
  }, [nodes, edges, copiedNodes, handleSaveDiagram, handleNewDiagram, handleLoadDiagram, handleUndo, handleRedo]);

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

  // Debug function for testing PropertyPanel integration
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

    console.log('🔧 Debug function added: window.testPropertyPanel()');
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
        onToggleGrid={handleToggleGrid}
        onToggleRulers={handleToggleRulers}
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
                  type: 'smoothstep',
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
              onPaneClick={handleCanvasClick}
              showGrid={showGrid}
              showRulers={showRulers}
            />
          </div>
          <PropertyPanel
            selectedElements={selectedElements}
            onUpdateElementStyle={handleUpdateElementStyle}
            onUpdateElementText={handleUpdateElementText}
            onUpdateElementPosition={handleUpdateElementPosition}
            onUpdateElementSize={handleUpdateElementSize}
            isVisible={!isRightSidebarCollapsed}
            onToggleVisibility={handleToggleRightSidebar}
          />
        </div>
      </main>
    </div>
  );
}

export default App;