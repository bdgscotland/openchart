import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { ToolbarComponent, type DrawingTool } from './components/Toolbar/ToolbarComponent';
import { FlowCanvas } from './components/Canvas/FlowCanvas';
import useShapeCreation from './components/Canvas/hooks/useShapeCreation';
import { MenuBar } from './components/MenuBar/MenuBar';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { useCanvasState } from './hooks/useCanvasState';
import { createEmptyDiagram } from './utils/diagramFactory';
// React Flow types are imported but typed as any for flexibility
import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [copiedNodes, setCopiedNodes] = useState<any[]>([]);
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const flowRef = useRef<any>(null);

  // Initialize diagram state for PropertyPanel
  const initialDiagram = createEmptyDiagram('OpenChart Diagram');
  const canvasState = useCanvasState(initialDiagram);

  // Convert React Flow nodes to diagram elements for PropertyPanel
  // Use useMemo to ensure selectedElements updates when nodes change
  const selectedElements = useMemo(() => {
    const currentlySelectedNodes = nodes.filter(node => node.selected);
    const elements = currentlySelectedNodes.map(node => {
      // Get complete style from node.data.style with proper defaults
      const nodeStyle = node.data?.style || {};
      const completeStyle = {
        fill: nodeStyle.fill || node.data?.backgroundColor || '#f0f9ff',
        stroke: node.selected ? '#0066ff' : (nodeStyle.stroke || node.data?.borderColor || '#d1d5db'),
        strokeWidth: nodeStyle.strokeWidth || 2,
        opacity: nodeStyle.opacity !== undefined ? nodeStyle.opacity : 1,
        fontSize: nodeStyle.fontSize || 14,
        fontFamily: nodeStyle.fontFamily || 'Arial, sans-serif',
        fontWeight: nodeStyle.fontWeight || 'normal' as const,
        fontStyle: nodeStyle.fontStyle || 'normal' as const,
        textAlign: nodeStyle.textAlign || 'center' as const,
        cornerRadius: nodeStyle.cornerRadius || 8,
        color: nodeStyle.color || '#000000',
        textDecoration: nodeStyle.textDecoration || 'none',
        textTransform: nodeStyle.textTransform || 'none',
        lineHeight: nodeStyle.lineHeight || 1.4,
        letterSpacing: nodeStyle.letterSpacing || 'normal',
        wordSpacing: nodeStyle.wordSpacing || 'normal',
        ...nodeStyle // Preserve any additional style properties
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
    console.log('🔄 selectedElements recomputed:', elements);
    return elements;
  }, [nodes]); // Recompute when nodes change

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
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;
    
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#0a0a0b',
        width: flowElement.offsetWidth,
        height: flowElement.offsetHeight,
      });
      
      const link = document.createElement('a');
      link.download = `diagram-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export PNG');
    }
  }, []);

  const handleExportSVG = useCallback(async () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;
    
    try {
      const { toSvg } = await import('html-to-image');
      const dataUrl = await toSvg(flowElement, {
        backgroundColor: '#0a0a0b',
      });
      
      const link = document.createElement('a');
      link.download = `diagram-${new Date().toISOString().slice(0, 10)}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting SVG:', error);
      alert('Failed to export SVG');
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    // For PDF, we'll first convert to PNG then suggest printing to PDF
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;
    
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#0a0a0b',
        width: flowElement.offsetWidth,
        height: flowElement.offsetHeight,
      });
      
      // Open in new window for printing to PDF
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>OpenChart Diagram</title>
              <style>
                body { margin: 0; padding: 20px; background: white; }
                img { max-width: 100%; height: auto; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="Diagram" />
              <script>
                window.onload = () => { window.print(); };
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
        if (selectedNodeIds.length > 0) {
          setNodes(nodes => nodes.filter(n => !selectedNodeIds.includes(n.id)));
          setEdges(edges => edges.filter(e => 
            !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)
          ));
        }
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

      // Undo (Ctrl+Z / Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo (Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y)
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
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
    // Prevent duplicate dialogs in React StrictMode
    if (sessionStorage.getItem('openchart-recovery-shown')) return;
    sessionStorage.setItem('openchart-recovery-shown', 'true');

    const loadAutoSaved = async () => {
      if (nodes.length === 0 && edges.length === 0) {
        try {
          const { diagramPersistence } = await import('./utils/diagramPersistence');
          const diagram = await diagramPersistence.loadAutoSavedDiagram();

          if (diagram) {
            const lastSaved = new Date(diagram.timestamp);
            const minutesAgo = Math.floor((Date.now() - lastSaved.getTime()) / 60000);

            if (confirm(`Found auto-saved diagram from ${minutesAgo} minutes ago. Would you like to restore it?`)) {
              const result = await diagramPersistence.importDiagram(diagram);

              setNodes(result.nodes);
              setEdges(result.edges);

              // Show restoration feedback if property panel data was restored
              if (result.restoredFeatures.length > 0) {
                console.log('Restored property panel features:', result.restoredFeatures);
              }

              // Restore viewport if React Flow is ready
              if (result.viewport && flowRef.current) {
                setTimeout(() => {
                  flowRef.current.setViewport(result.viewport);
                }, 100);
              }
            }
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
      
      <main className="app-main">
        <div className="app-content">
          <ToolbarComponent
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
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
            isVisible={showPropertyPanel}
            onToggleVisibility={() => setShowPropertyPanel(!showPropertyPanel)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;