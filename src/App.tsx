import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { FileOperationsProvider } from './contexts/FileOperationsContext';
import { ViewOperationsProvider } from './contexts/ViewOperationsContext';
import { LayerProvider } from './contexts/LayerContext';
import { CanvasOperationsProvider } from './contexts/CanvasOperationsContext';
import { LayerOperationsProvider } from './contexts/LayerOperationsContext';
import { UndoRedoProvider } from './contexts/UndoRedoContext';
import AppContent from './components/App/AppContent';
import type { DiagramSettings } from './types/diagram';
import { DEFAULT_DIAGRAM_SETTINGS } from './types/diagram';
import type { DrawingTool } from './types/shapes';
import type { Layer } from './types/layers';
import { DEFAULT_LAYER } from './types/layers';
import { createEmptyDiagram } from './utils/diagramFactory';
import { useCanvasState } from './hooks/useCanvasState';
import { migrateAllNodeDimensions, hasNodesThatNeedMigration, debugNodeMigration } from './utils/nodeMigration';
import './App.css';

function App() {
  // Core state management
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [selectedIconName, setSelectedIconName] = useState<string>('Star');
  const [nodes, setNodesInternal] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [diagramSettings, setDiagramSettings] = useState<DiagramSettings>(DEFAULT_DIAGRAM_SETTINGS);

  // Layer state management for persistence
  const [layers, setLayers] = useState<Layer[]>([DEFAULT_LAYER]);
  const [activeLayerId, setActiveLayerId] = useState<string>(DEFAULT_LAYER.id);

  // Sidebar collapse states with localStorage persistence
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('openchart-left-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('openchart-right-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

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

  // Migrate existing nodes to default layer (runs once on mount)
  useEffect(() => {
    const nodesNeedMigration = nodes.some(node => !node.data?.layerId);
    if (nodesNeedMigration) {
      const migratedNodes = nodes.map(node => ({
        ...node,
        data: { ...node.data, layerId: node.data?.layerId || 'layer-default' }
      }));
      setNodes(migratedNodes);
    }
  }, []); // Empty deps - only run once on mount

  // Migrate existing edges to default layer (runs once on mount)
  useEffect(() => {
    const edgesNeedMigration = edges.some(edge => !edge.data?.layerId);
    if (edgesNeedMigration) {
      const migratedEdges = edges.map(edge => ({
        ...edge,
        data: { ...edge.data, layerId: edge.data?.layerId || 'layer-default' }
      }));
      setEdges(migratedEdges);
    }
  }, []); // Empty deps - only run once on mount

  // Flow canvas ref
  const flowRef = useRef<any>(null);

  // Initialize diagram state for canvas operations
  const initialDiagram = createEmptyDiagram('OpenChart Diagram');
  const canvasState = useCanvasState(initialDiagram);

  // File input ref for file operations
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <UndoRedoProvider
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      maxHistorySize={50}
    >
      <FileOperationsProvider
        nodes={nodes}
        edges={edges}
        diagramSettings={diagramSettings}
        layers={layers}
        activeLayerId={activeLayerId}
        setNodes={setNodes}
        setEdges={setEdges}
        setDiagramSettings={setDiagramSettings}
        setLayers={setLayers}
        setActiveLayerId={setActiveLayerId}
        flowRef={flowRef}
        fileInputRef={fileInputRef}
      >
        <ViewOperationsProvider
          diagramSettings={diagramSettings}
          setDiagramSettings={setDiagramSettings}
          setIsLeftSidebarCollapsed={setIsLeftSidebarCollapsed}
          setIsRightSidebarCollapsed={setIsRightSidebarCollapsed}
          flowRef={flowRef}
        >
          <LayerProvider
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            layers={layers}
            setLayers={setLayers}
            activeLayerId={activeLayerId}
            setActiveLayerId={setActiveLayerId}
          >
            <LayerOperationsProvider
              nodes={nodes}
              setNodes={setNodes}
            >
              <CanvasOperationsProvider
                nodes={nodes}
                edges={edges}
                setNodes={setNodes}
                setEdges={setEdges}
                selectedTool={selectedTool}
                selectedIconName={selectedIconName}
                canvasState={canvasState}
                flowRef={flowRef}
              >
                <AppContent
                  nodes={nodes}
                  edges={edges}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  diagramSettings={diagramSettings}
                  setDiagramSettings={setDiagramSettings}
                  selectedTool={selectedTool}
                  setSelectedTool={setSelectedTool}
                  selectedIconName={selectedIconName}
                  setSelectedIconName={setSelectedIconName}
                />
              </CanvasOperationsProvider>
            </LayerOperationsProvider>
          </LayerProvider>
        </ViewOperationsProvider>
      </FileOperationsProvider>
    </UndoRedoProvider>
  );
}

export default App;