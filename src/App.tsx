import React, { useCallback, useState, useRef } from 'react';
import { ToolbarComponent, type DrawingTool } from './components/Toolbar/ToolbarComponent';
import { FlowCanvas } from './components/Canvas/FlowCanvas';
import { MenuBar } from './components/MenuBar/MenuBar';
// React Flow types are imported but typed as any for flexibility
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  // Menu handlers
  const handleNewDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  const handleSaveDiagram = useCallback(() => {
    const diagram = { nodes, edges };
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoadDiagram = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const diagram = JSON.parse(e.target?.result as string);
            setNodes(diagram.nodes || []);
            setEdges(diagram.edges || []);
          } catch (error) {
            alert('Error loading diagram: Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
          { id: 'e1-2', source: '1', sourceHandle: 'bottom-source', target: '2', targetHandle: 'top', type: 'smoothstep' },
          { id: 'e2-3', source: '2', sourceHandle: 'bottom-source', target: '3', targetHandle: 'top', type: 'smoothstep' },
          { id: 'e3-4', source: '3', sourceHandle: 'left-source', target: '4', targetHandle: 'top', type: 'smoothstep', label: 'Yes' },
          { id: 'e3-5', source: '3', sourceHandle: 'right-source', target: '5', targetHandle: 'top', type: 'smoothstep', label: 'No' },
          { id: 'e4-6', source: '4', sourceHandle: 'bottom-source', target: '6', targetHandle: 'left', type: 'smoothstep' },
          { id: 'e5-6', source: '5', sourceHandle: 'bottom-source', target: '6', targetHandle: 'right', type: 'smoothstep' },
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

  return (
    <div className="app">
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
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;