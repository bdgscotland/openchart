import React, { useState, useCallback, useEffect } from 'react';
import type { Node, Edge, Connection } from '@xyflow/react';
import { MenuBar } from '../MenuBar/MenuBar';
import { ActionToolbar } from '../ActionToolbar';
import { ShapeLibrary } from '../Toolbar';
import { FlowCanvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import { useFileOperations } from '../../contexts/FileOperationsContext';
import { useViewOperations } from '../../contexts/ViewOperationsContext';
import { useCanvasOperations } from '../../contexts/CanvasOperationsContext';
import type { DrawingTool } from '../../types/shapes';
import type { DiagramSettings } from '../../types/diagram';

interface AppContentProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  diagramSettings: DiagramSettings;
}

const AppContent: React.FC<AppContentProps> = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  diagramSettings
}) => {
  // Local state for tool selection
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');

  // Get all operations from contexts
  const fileOps = useFileOperations();
  const viewOps = useViewOperations();
  const canvasOps = useCanvasOperations();

  // We need to get the actual nodes and edges state from App component
  // For now, we'll access them through the context providers
  // TODO: This should be passed as props or through a dedicated state context

  // Sidebar collapse states with localStorage persistence
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('openchart-left-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('openchart-right-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Sidebar toggle handlers
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

      // Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        canvasOps.clipboard.copySelection();
      }

      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        canvasOps.clipboard.pasteSelection();
      }

      // Duplicate (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        canvasOps.clipboard.duplicateSelection();
      }

      // Save (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        fileOps.handleSaveDiagram();
      }

      // New (Ctrl+N / Cmd+N)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (confirm('Create a new diagram? Any unsaved changes will be lost.')) {
          fileOps.handleNewDiagram();
        }
      }

      // Open (Ctrl+O / Cmd+O)
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileOps.handleLoadDiagram();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasOps.clipboard, fileOps]);

  return (
    <div className="app">
      {/* File input for loading diagrams - using label trick for better compatibility */}
      <label htmlFor="file-upload-input" style={{ display: 'none' }}>
        <input
          id="file-upload-input"
          ref={fileOps.fileInputRef}
          type="file"
          accept=".json,.openchart"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              fileOps.handleLoadDiagram(file);
              // Clear the input so the same file can be selected again
              e.target.value = '';
            }
          }}
        />
      </label>

      {/* App Header with OpenChart title */}
      <header className="app-header">
        <h1>OpenChart</h1>
        <div className="header-version">v1.0.0</div>
      </header>

      <MenuBar
        // File operations
        onNewDiagram={fileOps.handleNewDiagram}
        onSaveDiagram={fileOps.handleSaveDiagram}
        onLoadDiagram={fileOps.handleLoadDiagram}
        onExportPNG={fileOps.handleExportPNG}
        onExportJPEG={fileOps.handleExportJPEG}
        onExportWebP={fileOps.handleExportWebP}
        onExportSVG={fileOps.handleExportSVG}
        onExportPDF={fileOps.handleExportPDF}
        onLoadExample={fileOps.handleLoadExample}

        // Canvas operations
        onUndo={canvasOps.handleUndo}
        onRedo={canvasOps.handleRedo}
        canUndo={canvasOps.actionToolbar.canUndo}
        canRedo={canvasOps.actionToolbar.canRedo}

        // View operations
        onToggleGrid={viewOps.handleToggleGrid}
        onToggleRulers={viewOps.handleToggleRulers}
        showGrid={true} // This will be managed by the context
        showRulers={false} // Temporarily disabled to test canvas functionality
        onToggleLeftSidebar={handleToggleLeftSidebar}
        onToggleRightSidebar={handleToggleRightSidebar}
        isLeftSidebarCollapsed={isLeftSidebarCollapsed}
        isRightSidebarCollapsed={isRightSidebarCollapsed}

        // All View menu handlers
        onToggleFormatPanel={viewOps.handleToggleFormatPanel}
        onToggleOutlinePanel={viewOps.handleToggleOutlinePanel}
        onToggleLayersPanel={viewOps.handleToggleLayersPanel}
        onToggleShapesPanel={viewOps.handleToggleShapesPanel}
        onToggleSearchShapes={viewOps.handleToggleSearchShapes}
        onToggleScratchpad={viewOps.handleToggleScratchpad}
        onToggleTags={viewOps.handleToggleTags}
        onToggleTooltips={viewOps.handleToggleTooltips}
        onToggleAnimations={viewOps.handleToggleAnimations}
        onToggleGuides={viewOps.handleToggleGuides}
        onTogglePageTabs={viewOps.handleTogglePageTabs}
        onTogglePageView={viewOps.handleTogglePageView}
        onToggleConnectionArrows={viewOps.handleToggleConnectionArrows}
        onToggleConnectionPoints={viewOps.handleToggleConnectionPoints}
        onResetView={viewOps.handleResetView}
        onToggleFullscreen={viewOps.handleToggleFullscreen}
        onChangeUnits={viewOps.handleChangeUnits}
        onChangePageScale={viewOps.handleChangePageScale}
        diagramSettings={undefined} // This will be provided by context
      />

      <ActionToolbar
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        onZoomIn={canvasOps.handleZoomIn}
        onZoomOut={canvasOps.handleZoomOut}
        onFitToView={canvasOps.handleFitToView}
        onUndo={canvasOps.handleUndo}
        onRedo={canvasOps.handleRedo}
        onToggleGrid={viewOps.handleToggleGrid}
        onToggleRulers={viewOps.handleToggleRulers}
        showGrid={true} // This will be managed by the context
        showRulers={false} // Temporarily disabled to test canvas functionality
        canUndo={canvasOps.actionToolbar.canUndo}
        canRedo={canvasOps.actionToolbar.canRedo}
      />

      <main className="app-main">
        <div className="app-content">
        <ShapeLibrary
          isCollapsed={isLeftSidebarCollapsed}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
        />

        <div className="canvas-area">
          <div className="canvas-container">
            <FlowCanvas
              nodes={nodes || []}
              edges={edges || []}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onConnect={(connection) => {
                // Handle new edge creation
                const newEdge = {
                  id: `edge-${Date.now()}`,
                  source: connection.source!,
                  target: connection.target!,
                  sourceHandle: connection.sourceHandle,
                  targetHandle: connection.targetHandle,
                };
                setEdges(edges => [...edges, newEdge]);
              }}
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              onPaneClick={canvasOps.handlePaneClick}
              showGrid={true} // This will be managed by the context
              showRulers={false} // Temporarily disabled to test canvas functionality
              snapToGrid={true} // This will be managed by the context
              diagramSettings={diagramSettings}
            />
          </div>
        </div>

        <PropertyPanel
          isCollapsed={isRightSidebarCollapsed}
          selectedElements={nodes?.filter(node => node.selected) || []} // Get selected nodes with safety check
          diagramSettings={diagramSettings}
          onUpdateElementStyle={canvasOps.handleUpdateElementStyle}
          onUpdateElementText={canvasOps.handleUpdateElementText}
          onUpdateElementPosition={canvasOps.handleUpdateElementPosition}
          onUpdateElementSize={canvasOps.handleUpdateElementSize}
          onGridSettingsChange={() => {}} // This will be managed by context
          onBackgroundSettingsChange={() => {}} // This will be managed by context
          onPaperSettingsChange={() => {}} // This will be managed by context
          onViewportSettingsChange={() => {}} // This will be managed by context
          onRulerSettingsChange={() => {}} // This will be managed by context
        />
        </div>
      </main>
    </div>
  );
};

export default AppContent;