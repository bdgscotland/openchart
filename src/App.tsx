import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ToolbarComponent, type DrawingTool } from './components/Toolbar/ToolbarComponent';
import { FlowCanvas } from './components/Canvas/FlowCanvas';
import useShapeCreation from './components/Canvas/hooks/useShapeCreation';
import { MenuBar } from './components/MenuBar/MenuBar';
// React Flow types are imported but typed as any for flexibility
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [canUndo] = useState(false);
  const [canRedo] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [copiedNodes, setCopiedNodes] = useState<any[]>([]);
  const flowRef = useRef<any>(null);

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

  const handleSaveDiagram = useCallback(() => {
    // Get viewport from React Flow instance
    const viewport = flowRef.current?.getViewport() || { x: 0, y: 0, zoom: 1 };
    const diagram = { 
      nodes, 
      edges,
      viewport,
      version: '1.0.0'
    };
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
    // TODO: Implement undo with React Flow
    console.log('Undo not yet implemented');
  }, []);

  const handleRedo = useCallback(() => {
    // TODO: Implement redo with React Flow
    console.log('Redo not yet implemented');
  }, []);

  const handleToggleGrid = useCallback(() => {
    if (flowRef.current?.toggleGrid) {
      flowRef.current.toggleGrid();
    }
  }, []);

  const handleToggleRulers = useCallback(() => {
    // TODO: Implement rulers
    console.log('Rulers not yet implemented');
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
    const autoSaveInterval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        const viewport = flowRef.current?.getViewport() || { x: 0, y: 0, zoom: 1 };
        const diagram = { 
          nodes, 
          edges,
          viewport,
          version: '1.0.0',
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('openchart-autosave', JSON.stringify(diagram));
        console.log('Auto-saved diagram');
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [nodes, edges]);

  // Load auto-saved diagram on mount
  useEffect(() => {
    // Prevent duplicate dialogs in React StrictMode
    if (sessionStorage.getItem('openchart-recovery-shown')) return;
    sessionStorage.setItem('openchart-recovery-shown', 'true');
    
    const autosaved = localStorage.getItem('openchart-autosave');
    if (autosaved && nodes.length === 0 && edges.length === 0) {
      try {
        const diagram = JSON.parse(autosaved);
        const lastSaved = new Date(diagram.timestamp);
        const minutesAgo = Math.floor((Date.now() - lastSaved.getTime()) / 60000);
        
        if (confirm(`Found auto-saved diagram from ${minutesAgo} minutes ago. Would you like to restore it?`)) {
          setNodes(diagram.nodes || []);
          setEdges(diagram.edges || []);
          if (diagram.viewport && flowRef.current) {
            setTimeout(() => {
              flowRef.current.setViewport(diagram.viewport);
            }, 100);
          }
        }
      } catch (error) {
        console.error('Failed to load auto-saved diagram:', error);
      }
    }
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
            
            reader.onload = (event: ProgressEvent<FileReader>) => {
              try {
                const content = event.target?.result as string;
                const diagram = JSON.parse(content);
                
                setNodes(diagram.nodes || []);
                setEdges(diagram.edges || []);
                
                if (diagram.viewport && flowRef.current) {
                  setTimeout(() => {
                    flowRef.current.setViewport(diagram.viewport);
                  }, 100);
                }
              } catch (error) {
                alert('Error loading diagram: Invalid JSON format');
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
        canUndo={canUndo}
        canRedo={canRedo}
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
                const newEdge = {
                  ...connection,
                  id: `edge-${Date.now()}`,
                  type: 'default',
                };
                setEdges(edges => [...edges, newEdge]);
              }}
              onPaneClick={handleCanvasClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;