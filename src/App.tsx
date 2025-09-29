import React, { useState, useRef, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { FileOperationsProvider } from './contexts/FileOperationsContext';
import { ViewOperationsProvider } from './contexts/ViewOperationsContext';
import { CanvasOperationsProvider } from './contexts/CanvasOperationsContext';
import AppContent from './components/App/AppContent';
import type { DiagramSettings } from './types/diagram';
import { DEFAULT_DIAGRAM_SETTINGS } from './types/diagram';
import type { DrawingTool } from './types/shapes';
import { createEmptyDiagram } from './utils/diagramFactory';
import { useCanvasState } from './hooks/useCanvasState';
import { migrateAllNodeDimensions, hasNodesThatNeedMigration, debugNodeMigration } from './utils/nodeMigration';
import './App.css';

function App() {
  // Core state management
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [nodes, setNodesInternal] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [diagramSettings, setDiagramSettings] = useState<DiagramSettings>(DEFAULT_DIAGRAM_SETTINGS);

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

  // Flow canvas ref
  const flowRef = useRef<any>(null);

  // Initialize diagram state for canvas operations
  const initialDiagram = createEmptyDiagram('OpenChart Diagram');
  const canvasState = useCanvasState(initialDiagram);

  // File input ref for file operations
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <FileOperationsProvider
      nodes={nodes}
      edges={edges}
      diagramSettings={diagramSettings}
      setNodes={setNodes}
      setEdges={setEdges}
      setDiagramSettings={setDiagramSettings}
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
        <CanvasOperationsProvider
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          selectedTool={selectedTool}
          canvasState={canvasState}
          flowRef={flowRef}
        >
          <AppContent
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            diagramSettings={diagramSettings}
          />
        </CanvasOperationsProvider>
      </ViewOperationsProvider>
    </FileOperationsProvider>
  );
}

export default App;