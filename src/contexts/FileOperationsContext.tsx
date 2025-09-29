import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { diagramPersistence } from '../utils/diagramPersistence';
import { createEmptyDiagram } from '../utils/diagramFactory';
import type { DiagramSettings } from '../types/diagram';

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
}

interface FileOperationsProviderProps {
  children: ReactNode;
  nodes: Node[];
  edges: Edge[];
  diagramSettings: DiagramSettings;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setDiagramSettings: React.Dispatch<React.SetStateAction<DiagramSettings>>;
  flowRef: React.RefObject<any>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const FileOperationsContext = createContext<FileOperationsContextType | undefined>(undefined);

export const FileOperationsProvider: React.FC<FileOperationsProviderProps> = ({
  children,
  nodes,
  edges,
  diagramSettings,
  setNodes,
  setEdges,
  setDiagramSettings,
  flowRef,
  fileInputRef,
}) => {
  const handleNewDiagram = useCallback(() => {
    const emptyDiagram = createEmptyDiagram();
    setNodes(emptyDiagram.nodes);
    setEdges(emptyDiagram.edges);
    setDiagramSettings(emptyDiagram.settings);

    // Reset viewport
    if (flowRef.current) {
      flowRef.current.setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [setNodes, setEdges, setDiagramSettings, flowRef]);

  const handleSaveDiagram = useCallback(async () => {
    try {
      const diagram = {
        nodes,
        edges,
        settings: diagramSettings,
      };
      await diagramPersistence.saveDiagram(diagram);
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  }, [nodes, edges, diagramSettings]);

  const handleLoadDiagram = useCallback(async (file?: File) => {
    // If no file provided, trigger file input
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    if (!file) return;

    try {
      const diagram = await diagramPersistence.loadDiagram(file);
      setNodes(diagram.nodes);
      setEdges(diagram.edges);
      setDiagramSettings(diagram.settings);

      // Reset viewport after loading
      if (flowRef.current) {
        flowRef.current.setViewport({ x: 0, y: 0, zoom: 1 });
      }
    } catch (error) {
      console.error('Error loading diagram:', error);
    }
  }, [setNodes, setEdges, setDiagramSettings, flowRef, fileInputRef]);

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