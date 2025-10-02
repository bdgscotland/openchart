import React, { useState, useCallback, useEffect } from 'react';
import type { Node, Edge, Connection } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import { MenuBar } from '../MenuBar/MenuBar';
import { ActionToolbar } from '../ActionToolbar';
import { ShapeLibrary } from '../Toolbar';
import { FlowCanvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import { LayersPanel } from '../LayersPanel';
import { useFileOperations } from '../../contexts/FileOperationsContext';
import { useViewOperations } from '../../contexts/ViewOperationsContext';
import { useCanvasOperations } from '../../contexts/CanvasOperationsContext';
import { useLayerOperations } from '../../contexts/LayerOperationsContext';
import { useLayers } from '../../contexts/LayerContext';
import type { DrawingTool } from '../../types/shapes';
import type { DiagramSettings } from '../../types/diagram';

interface AppContentProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  diagramSettings: DiagramSettings;
  setDiagramSettings: React.Dispatch<React.SetStateAction<DiagramSettings>>;
  selectedTool: DrawingTool;
  setSelectedTool: React.Dispatch<React.SetStateAction<DrawingTool>>;
  selectedIconName: string;
  setSelectedIconName: React.Dispatch<React.SetStateAction<string>>;
}

const AppContent: React.FC<AppContentProps> = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  diagramSettings,
  setDiagramSettings,
  selectedTool,
  setSelectedTool,
  selectedIconName,
  setSelectedIconName
}) => {

  // Get all operations from contexts
  const fileOps = useFileOperations();
  const viewOps = useViewOperations();
  const canvasOps = useCanvasOperations();
  const layerOps = useLayerOperations();
  const { getActiveLayer } = useLayers();

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

  // Helper function to convert React Flow Nodes to DiagramElements
  const nodesToDiagramElements = useCallback((nodes: Node[]) => {
    return nodes.map(node => ({
      id: node.id,
      type: node.type || 'rectangle',
      position: node.position,
      size: {
        width: node.data?.width || node.width || 120,
        height: node.data?.height || node.height || 80,
      },
      style: node.data?.style || {},
      text: node.data?.label || '',
      locked: node.data?.locked,
      visible: node.data?.visible,
      zIndex: node.data?.zIndex,
      properties: node.data?.properties,
    }));
  }, []);

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

  // Mode change handler
  const handleModeChange = useCallback((mode: 'diagram' | 'eventStorm') => {
    setDiagramSettings(prev => ({
      ...prev,
      mode,
      // Initialize event storm settings when switching to event storm mode
      eventStormSettings: mode === 'eventStorm' && !prev.eventStormSettings
        ? {
            phase: 'big-picture',
            showTimeline: true,
            autoArrangeEnabled: false,
            timelineOrientation: 'horizontal',
            showTimestamps: false,
            showAggregateNames: true,
            groupByAggregate: false,
            groupByBoundedContext: false,
            validationEnabled: true,
            strictMode: false,
            workshopMode: false,
            participantCursors: false,
          }
        : prev.eventStormSettings,
    }));
  }, [setDiagramSettings]);

  // Event Storm phase change handler
  const handlePhaseChange = useCallback((phase: 'big-picture' | 'process-modeling' | 'software-design') => {
    setDiagramSettings(prev => ({
      ...prev,
      eventStormSettings: prev.eventStormSettings
        ? { ...prev.eventStormSettings, phase }
        : {
            phase,
            showTimeline: true,
            autoArrangeEnabled: false,
            timelineOrientation: 'horizontal',
            showTimestamps: false,
            showAggregateNames: true,
            groupByAggregate: false,
            groupByBoundedContext: false,
            validationEnabled: true,
            strictMode: false,
            workshopMode: false,
            participantCursors: false,
          },
    }));
  }, [setDiagramSettings]);

  // Diagram settings handlers
  const handleGridSettingsChange = useCallback((updates: Partial<typeof diagramSettings.grid>) => {
    setDiagramSettings(prev => ({
      ...prev,
      grid: { ...prev.grid, ...updates }
    }));
  }, [setDiagramSettings]);

  const handleBackgroundSettingsChange = useCallback((updates: Partial<typeof diagramSettings.background>) => {
    setDiagramSettings(prev => ({
      ...prev,
      background: { ...prev.background, ...updates }
    }));
  }, [setDiagramSettings]);

  const handlePaperSettingsChange = useCallback((updates: Partial<typeof diagramSettings.paper>) => {
    setDiagramSettings(prev => ({
      ...prev,
      paper: { ...prev.paper, ...updates }
    }));
  }, [setDiagramSettings]);

  const handleViewportSettingsChange = useCallback((updates: Partial<typeof diagramSettings.viewport>) => {
    setDiagramSettings(prev => ({
      ...prev,
      viewport: { ...prev.viewport, ...updates }
    }));
  }, [setDiagramSettings]);

  const handleRulerSettingsChange = useCallback((updates: Partial<typeof diagramSettings.rulers>) => {
    setDiagramSettings(prev => ({
      ...prev,
      rulers: { ...prev.rulers, ...updates }
    }));
  }, [setDiagramSettings]);

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

      // Toggle Layers Panel (F7 or Ctrl+Shift+L / Cmd+Shift+L)
      if (e.key === 'F7' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l')) {
        e.preventDefault();
        viewOps.handleToggleLayersPanel();
      }

      // Layer operations shortcuts
      const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
      if (selectedNodeIds.length > 0) {
        // Bring to Front (Ctrl+Shift+] / Cmd+Shift+])
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ']') {
          e.preventDefault();
          layerOps.bringToFront(selectedNodeIds);
        }

        // Bring Forward (Ctrl+] / Cmd+])
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === ']') {
          e.preventDefault();
          layerOps.bringForward(selectedNodeIds);
        }

        // Send Backward (Ctrl+[ / Cmd+[)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === '[') {
          e.preventDefault();
          layerOps.sendBackward(selectedNodeIds);
        }

        // Send to Back (Ctrl+Shift+[ / Cmd+Shift+[)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '[') {
          e.preventDefault();
          layerOps.sendToBack(selectedNodeIds);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasOps.clipboard, fileOps, layerOps, nodes, viewOps]);

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
        onExportMarkdown={fileOps.handleExportMarkdown}
        onLoadExample={fileOps.handleLoadExample}

        // Canvas operations
        onUndo={canvasOps.handleUndo}
        onRedo={canvasOps.handleRedo}
        canUndo={canvasOps.actionToolbar.canUndo}
        canRedo={canvasOps.actionToolbar.canRedo}

        // Mode switching
        onModeChange={handleModeChange}

        // View operations
        onToggleGrid={viewOps.handleToggleGrid}
        onToggleRulers={viewOps.handleToggleRulers}
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
        diagramSettings={diagramSettings}
      />

      <ActionToolbar
        // Undo/Redo
        canUndo={canvasOps.actionToolbar.canUndo}
        canRedo={canvasOps.actionToolbar.canRedo}
        onUndo={canvasOps.handleUndo}
        onRedo={canvasOps.handleRedo}

        // Selection and deletion
        hasSelection={canvasOps.actionToolbar.hasSelection}
        onDelete={canvasOps.actionToolbar.handleDelete}

        // Layer management
        onBringToFront={() => {
          const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
          layerOps.bringToFront(selectedNodeIds);
        }}
        onBringForward={() => {
          const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
          layerOps.bringForward(selectedNodeIds);
        }}
        onSendBackward={() => {
          const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
          layerOps.sendBackward(selectedNodeIds);
        }}
        onSendToBack={() => {
          const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
          layerOps.sendToBack(selectedNodeIds);
        }}

        // Edge styles
        edgeStyle={canvasOps.actionToolbar.edgeStyle}
        onEdgeStyleChange={canvasOps.actionToolbar.handleEdgeStyleChange}

        // Zoom controls
        zoom={canvasOps.actionToolbar.zoom}
        onZoomIn={canvasOps.handleZoomIn}
        onZoomOut={canvasOps.handleZoomOut}
        onFitToView={canvasOps.handleFitToView}

        // Canvas settings
        snapToGrid={diagramSettings.grid.snapToGrid}
        onToggleSnapToGrid={viewOps.handleToggleGrid}
        connectionMode="loose" // This will be managed by the context
        onToggleConnectionMode={() => {}} // TODO: Implement connection mode toggle

        // Event Storm settings
        mode={diagramSettings.mode}
        eventStormPhase={diagramSettings.eventStormSettings?.phase}
        onEventStormPhaseChange={handlePhaseChange}
      />

      <main className="app-main">
        <div className="app-content">
        <ShapeLibrary
          isCollapsed={isLeftSidebarCollapsed}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          selectedIconName={selectedIconName}
          onIconNameChange={setSelectedIconName}
          mode={diagramSettings.mode}
          eventStormPhase={diagramSettings.eventStormSettings?.phase}
        />

        <div className="canvas-area">
          <div className="canvas-container">
            <FlowCanvas
              ref={fileOps.flowRef}
              nodes={nodes || []}
              edges={edges || []}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onConnect={(connection) => {
                // Handle new edge creation
                const activeLayer = getActiveLayer();
                const newEdge: Edge = {
                  id: `edge-${Date.now()}`,
                  source: connection.source!,
                  target: connection.target!,
                  sourceHandle: connection.sourceHandle,
                  targetHandle: connection.targetHandle,
                  type: 'smoothstep', // Default edge type with curved lines
                  markerEnd: { type: MarkerType.Arrow }, // Add arrow marker
                  data: { layerId: activeLayer.id }, // Assign to active layer
                };
                console.log('🔗 Creating new edge:', newEdge);
                setEdges(edges => [...edges, newEdge]);
              }}
              onPaneClick={canvasOps.handlePaneClick}
              showGrid={diagramSettings.grid.enabled}
              gridSize={diagramSettings.grid.size}
              gridColor={diagramSettings.grid.color}
              gridStyle={diagramSettings.grid.style}
              backgroundColor={diagramSettings.background.color}
              showRulers={diagramSettings.rulers.enabled}
              snapToGrid={diagramSettings.grid.snapToGrid}
              mode={diagramSettings.mode}
              eventStormPhase={diagramSettings.eventStormSettings?.phase}
              onEventStormPhaseChange={handlePhaseChange}
            />
          </div>
        </div>

        <PropertyPanel
          isCollapsed={isRightSidebarCollapsed}
          selectedElements={nodesToDiagramElements(nodes?.filter(node => node.selected) || [])}
          allElements={nodesToDiagramElements(nodes || [])}
          selectedEdges={edges?.filter(edge => edge.selected) || []}
          diagramSettings={diagramSettings}
          onUpdateElementStyle={canvasOps.handleUpdateElementStyle}
          onUpdateElementText={canvasOps.handleUpdateElementText}
          onUpdateElementPosition={canvasOps.handleUpdateElementPosition}
          onUpdateElementSize={canvasOps.handleUpdateElementSize}
          onUpdateEdgeStyle={canvasOps.handleUpdateEdgeStyle}
          onGridSettingsChange={handleGridSettingsChange}
          onBackgroundSettingsChange={handleBackgroundSettingsChange}
          onPaperSettingsChange={handlePaperSettingsChange}
          onViewportSettingsChange={handleViewportSettingsChange}
          onRulerSettingsChange={handleRulerSettingsChange}
        />

        <LayersPanel
          nodes={nodes}
          onNodesChange={setNodes}
          isCollapsed={!diagramSettings.uiPanels.layersPanel}
          onToggleCollapse={() => viewOps.handleToggleLayersPanel()}
        />
        </div>
      </main>
    </div>
  );
};

export default AppContent;