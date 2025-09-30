// UndoRedoContext - React Context for undo/redo functionality
// Integrates HistoryManager with React state and React Flow

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { HistoryManager } from '../core/undo/HistoryManager';
import type { HistoryState } from '../core/undo/HistoryManager';
import type { ReactFlowCommand } from '../core/commands/ReactFlowCommand';

interface UndoRedoContextType {
  // Execute a command
  executeCommand: (command: ReactFlowCommand) => void;

  // Undo/Redo operations
  undo: () => void;
  redo: () => void;

  // History state
  canUndo: boolean;
  canRedo: boolean;
  undoStackSize: number;
  redoStackSize: number;

  // Command descriptions
  undoDescription: string | null;
  redoDescription: string | null;

  // Clear history
  clear: () => void;

  // History manager instance (for advanced use)
  historyManager: HistoryManager;
}

interface UndoRedoProviderProps {
  children: ReactNode;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  maxHistorySize?: number;
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({
  children,
  nodes,
  edges,
  setNodes,
  setEdges,
  maxHistorySize = 50,
}) => {
  // Create history manager instance (persists across renders)
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager(maxHistorySize));
  const historyManager = historyManagerRef.current;

  // Track history state
  const [historyState, setHistoryState] = useState<HistoryState>(() => historyManager.getState());

  // Set up history state listener
  useEffect(() => {
    const unsubscribe = historyManager.addListener(setHistoryState);
    return unsubscribe;
  }, [historyManager]);

  // Execute a command
  const executeCommand = useCallback(
    (command: ReactFlowCommand) => {
      console.log('🔄 Executing command:', command.description);

      const result = historyManager.executeCommand(command, nodes, edges);

      // Update React Flow state
      setNodes(result.nodes);
      setEdges(result.edges);

      console.log('✅ Command executed. Can undo:', historyManager.canUndo());
    },
    [historyManager, nodes, edges, setNodes, setEdges]
  );

  // Undo operation
  const undo = useCallback(() => {
    console.log('⏪ Undo');

    const result = historyManager.undo(nodes, edges);
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
      console.log('✅ Undo successful');
    } else {
      console.log('⚠️ Nothing to undo');
    }
  }, [historyManager, nodes, edges, setNodes, setEdges]);

  // Redo operation
  const redo = useCallback(() => {
    console.log('⏩ Redo');

    const result = historyManager.redo(nodes, edges);
    if (result) {
      setNodes(result.nodes);
      setEdges(result.edges);
      console.log('✅ Redo successful');
    } else {
      console.log('⚠️ Nothing to redo');
    }
  }, [historyManager, nodes, edges, setNodes, setEdges]);

  // Clear history
  const clear = useCallback(() => {
    console.log('🗑️ Clearing undo/redo history');
    historyManager.clear();
  }, [historyManager]);

  // Get command descriptions
  const undoDescription = historyManager.getUndoDescription();
  const redoDescription = historyManager.getRedoDescription();

  const contextValue: UndoRedoContextType = {
    executeCommand,
    undo,
    redo,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    undoStackSize: historyState.undoStackSize,
    redoStackSize: historyState.redoStackSize,
    undoDescription,
    redoDescription,
    clear,
    historyManager,
  };

  return (
    <UndoRedoContext.Provider value={contextValue}>
      {children}
    </UndoRedoContext.Provider>
  );
};

/**
 * Hook to access undo/redo functionality
 */
export const useUndoRedo = (): UndoRedoContextType => {
  const context = useContext(UndoRedoContext);
  if (context === undefined) {
    throw new Error('useUndoRedo must be used within a UndoRedoProvider');
  }
  return context;
};
