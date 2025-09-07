import React, { useCallback } from 'react';
import { CanvasComponent } from './components/Canvas';
import { ToolbarComponent, type DrawingTool } from './components/Toolbar/ToolbarComponent';
import { MenuBar } from './components/MenuBar';
import { useCanvasState } from './hooks/useCanvasState';
import { createSimpleFlowchartExample, createRectangle, createCircle, createDiamond, createTextElement, createNewDiagram } from './core/schema';
import type { DiagramSchema } from './types/diagram';
import './App.css'

function App() {
  // Initialize with empty diagram instead of example
  const initialDiagram = createNewDiagram();
  const canvasState = useCanvasState(initialDiagram);

  // Handle canvas clicks for adding new shapes
  const handleCanvasClick = useCallback((position: { x: number; y: number }) => {
    // If we have a drawing tool selected and click on empty canvas, add new element
    if (canvasState.drawingTool && canvasState.drawingTool !== 'select') {
      const defaultSize = { width: 120, height: 80 };
      
      switch (canvasState.drawingTool) {
        case 'rectangle':
          const rect = createRectangle(position, defaultSize, 'New Rectangle');
          canvasState.addElement(rect);
          break;
        case 'circle':
          const circle = createCircle(position, { width: 100, height: 100 }, 'New Circle');
          canvasState.addElement(circle);
          break;
        case 'diamond':
          const diamond = createDiamond(position, defaultSize, 'New Diamond');
          canvasState.addElement(diamond);
          break;
        case 'text':
          const textElement = createTextElement(position, { width: 150, height: 40 }, 'New Text');
          canvasState.addElement(textElement);
          break;
      }
      
      // After adding, switch back to select tool
      canvasState.setDrawingTool('select');
    } else {
      // Clear selection when clicking empty canvas in select mode
      canvasState.clearSelection();
    }
  }, [canvasState]);

  // Menu handlers
  const handleNewDiagram = useCallback(() => {
    const newDiagram = createNewDiagram();
    canvasState.updateDiagram(newDiagram);
  }, [canvasState]);

  const handleSaveDiagram = useCallback(() => {
    const dataStr = JSON.stringify(canvasState.diagram, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [canvasState.diagram]);

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
            const diagram = JSON.parse(e.target?.result as string) as DiagramSchema;
            canvasState.updateDiagram(diagram);
          } catch (error) {
            alert('Error loading diagram: Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [canvasState]);

  const handleExportPNG = useCallback(() => {
    // TODO: Implement PNG export
    alert('PNG export will be implemented soon!');
  }, []);

  const handleExportSVG = useCallback(() => {
    // TODO: Implement SVG export
    alert('SVG export will be implemented soon!');
  }, []);

  const handleExportPDF = useCallback(() => {
    // TODO: Implement PDF export
    alert('PDF export will be implemented soon!');
  }, []);

  const handleLoadExample = useCallback((exampleName: string) => {
    let exampleDiagram: DiagramSchema;
    
    switch (exampleName) {
      case 'flowchart':
        exampleDiagram = createSimpleFlowchartExample();
        break;
      case 'orgchart':
      case 'process':
      case 'mindmap':
      case 'network':
        // TODO: Create these example functions
        exampleDiagram = createSimpleFlowchartExample(); // Temporary
        break;
      default:
        exampleDiagram = createNewDiagram();
    }
    
    canvasState.updateDiagram(exampleDiagram);
  }, [canvasState]);

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
        onUndo={canvasState.undo}
        onRedo={canvasState.redo}
        canUndo={canvasState.canUndo}
        canRedo={canvasState.canRedo}
      />
      
      <header className="app-header">
        <h1>OpenChart</h1>
        <div className="header-info">
          <span>Elements: {canvasState.diagram.elements.length}</span>
          <span>Selected: {canvasState.selectedElementIds.length}</span>
          {canvasState.hasSelection && (
            <button 
              onClick={canvasState.deleteSelected}
              className="delete-button"
            >
              Delete Selected
            </button>
          )}
        </div>
      </header>
      
      <main className="app-main">
        <div className="app-content">
          <ToolbarComponent
            selectedTool={canvasState.drawingTool || 'select'}
            onToolSelect={canvasState.setDrawingTool}
          />
          <div className="canvas-area">
            <CanvasComponent
              diagram={canvasState.diagram}
              selectedElementIds={canvasState.selectedElementIds}
              onElementSelect={canvasState.selectElement}
              onElementMove={canvasState.moveElement}
              onElementResize={canvasState.resizeElement}
              onCanvasClick={handleCanvasClick}
              width={window.innerWidth - 250}
              height={window.innerHeight - 80}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App
