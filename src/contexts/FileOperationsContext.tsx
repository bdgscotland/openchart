import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { diagramPersistence } from '../utils/diagramPersistence';
import type { DiagramSettings } from '../types/diagram';
import type { Layer } from '../types/layers';
import { DEFAULT_LAYER } from '../types/layers';

interface FileOperationsContextType {
  handleNewDiagram: () => void;
  handleSaveDiagram: () => Promise<void>;
  handleLoadDiagram: (file?: File) => Promise<void>;
  handleExportPNG: () => Promise<void>;
  handleExportJPEG: () => Promise<void>;
  handleExportWebP: () => Promise<void>;
  handleExportSVG: () => Promise<void>;
  handleExportPDF: () => Promise<void>;
  handleLoadExample: (exampleName: string) => void;
  flowRef: React.RefObject<any>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

interface FileOperationsProviderProps {
  children: ReactNode;
  nodes: Node[];
  edges: Edge[];
  diagramSettings: DiagramSettings;
  layers: Layer[];
  activeLayerId: string;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setDiagramSettings: React.Dispatch<React.SetStateAction<DiagramSettings>>;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setActiveLayerId: React.Dispatch<React.SetStateAction<string>>;
  flowRef: React.RefObject<any>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const FileOperationsContext = createContext<FileOperationsContextType | undefined>(undefined);

export const FileOperationsProvider: React.FC<FileOperationsProviderProps> = ({
  children,
  nodes,
  edges,
  diagramSettings,
  layers,
  activeLayerId,
  setNodes,
  setEdges,
  setDiagramSettings,
  setLayers,
  setActiveLayerId,
  flowRef,
  fileInputRef,
}) => {
  const handleNewDiagram = useCallback(() => {
    // Reset to empty diagram state
    setNodes([]);
    setEdges([]);

    // Note: We don't reset diagramSettings here - it maintains user's view preferences
    // This is intentional to preserve grid, rulers, panel visibility, etc.

    // Reset layers to default
    setLayers([DEFAULT_LAYER]);
    setActiveLayerId(DEFAULT_LAYER.id);

    // Reset viewport
    if (flowRef.current) {
      flowRef.current.setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [setNodes, setEdges, setLayers, setActiveLayerId, flowRef]);

  const handleSaveDiagram = useCallback(async () => {
    try {
      // Get viewport from flow ref
      const viewport = flowRef.current?.getViewport() || { x: 0, y: 0, zoom: 1 };

      // Use saveDiagramToFile with layers and diagram settings
      await diagramPersistence.saveDiagramToFile(
        nodes,
        edges,
        viewport,
        layers,
        activeLayerId,
        diagramSettings,
        {
          title: 'OpenChart Diagram',
          createdWith: 'OpenChart',
        }
      );
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  }, [nodes, edges, layers, activeLayerId, diagramSettings, flowRef]);

  const handleLoadDiagram = useCallback(async (file?: File) => {
    // If no file provided, trigger file input
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    if (!file) return;

    try {
      // Read the file content
      const fileContent = await file.text();
      const diagramData = JSON.parse(fileContent);

      // Import using the persistence layer
      const imported = await diagramPersistence.importDiagram(diagramData);

      // Update all state
      setNodes(imported.nodes);
      setEdges(imported.edges);
      setLayers(imported.layers);
      setActiveLayerId(imported.activeLayerId);

      // Restore diagram settings if available
      if (imported.diagramSettings) {
        setDiagramSettings(imported.diagramSettings);
      }

      // Set viewport after loading
      if (flowRef.current && imported.viewport) {
        flowRef.current.setViewport(imported.viewport);
      }

      // Log restored features
      if (imported.restoredFeatures.length > 0) {
        console.log('Restored features:', imported.restoredFeatures.join(', '));
      }
    } catch (error) {
      console.error('Error loading diagram:', error);
      alert('Failed to load diagram. Please check the file format.');
    }
  }, [setNodes, setEdges, setLayers, setActiveLayerId, setDiagramSettings, flowRef, fileInputRef]);

  const handleExportPNG = useCallback(async () => {
    try {
      await diagramPersistence.exportToPNG(flowRef.current);
    } catch (error) {
      console.error('Error exporting to PNG:', error);
    }
  }, [flowRef]);

  const handleExportJPEG = useCallback(async () => {
    try {
      await diagramPersistence.exportToJPEG(flowRef.current);
    } catch (error) {
      console.error('Error exporting to JPEG:', error);
    }
  }, [flowRef]);

  const handleExportWebP = useCallback(async () => {
    try {
      await diagramPersistence.exportToWebP(flowRef.current);
    } catch (error) {
      console.error('Error exporting to WebP:', error);
    }
  }, [flowRef]);

  const handleExportSVG = useCallback(async () => {
    try {
      await diagramPersistence.exportToSVG(flowRef.current);
    } catch (error) {
      console.error('Error exporting to SVG:', error);
    }
  }, [flowRef]);

  const handleExportPDF = useCallback(async () => {
    try {
      await diagramPersistence.exportToPDF(flowRef.current);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }, [flowRef]);

  const handleLoadExample = useCallback((exampleName: string) => {
    // TODO: Implement example loading logic
    console.log('Loading example:', exampleName);
  }, []);

  const contextValue: FileOperationsContextType = {
    handleNewDiagram,
    handleSaveDiagram,
    handleLoadDiagram,
    handleExportPNG,
    handleExportJPEG,
    handleExportWebP,
    handleExportSVG,
    handleExportPDF,
    handleLoadExample,
    flowRef,
    fileInputRef,
  };

  return (
    <FileOperationsContext.Provider value={contextValue}>
      {children}
    </FileOperationsContext.Provider>
  );
};

export const useFileOperations = (): FileOperationsContextType => {
  const context = useContext(FileOperationsContext);
  if (context === undefined) {
    throw new Error('useFileOperations must be used within a FileOperationsProvider');
  }
  return context;
};