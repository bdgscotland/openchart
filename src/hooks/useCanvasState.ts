import { useState, useCallback, useEffect } from 'react';
import type { DiagramSchema, DiagramElement, Point, Size, ElementStyle } from '../types/diagram';
import {
  updateDiagramTimestamp,
  addElementToDiagram,
  removeElementFromDiagram
} from '../core/schema';
import {
  CommandManager,
  AddElementCommand,
  RemoveElementsCommand,
  MoveElementCommand,
  ResizeElementCommand,
  UpdateElementCommand,
  BulkStyleCommand,
  AlignElementsCommand,
  DistributeElementsCommand,
  KeyboardShortcuts,
  type CommandManagerState,
  type BulkStyleUpdate,
  type AlignmentOperation,
  type DistributionOperation,
} from '../core/commands';

interface CanvasState {
  diagram: DiagramSchema;
  selectedElementIds: string[];
  isDrawing: boolean;
  drawingTool: 'select' | 'rectangle' | 'circle' | 'diamond' | 'text' | null;
  commandState: CommandManagerState;
}

export function useCanvasState(initialDiagram: DiagramSchema) {
  const [commandManager] = useState(() => new CommandManager());
  const [state, setState] = useState<CanvasState>({
    diagram: initialDiagram,
    selectedElementIds: [],
    isDrawing: false,
    drawingTool: null,
    commandState: {
      canUndo: false,
      canRedo: false,
      commandCount: 0,
    },
  });
  
  // Set up command manager state tracking
  useEffect(() => {
    commandManager.setOnStateChange((commandState) => {
      setState(prev => ({ ...prev, commandState }));
    });
  }, [commandManager]);
  
  // Undo/Redo functions
  const undo = useCallback(() => {
    const previousState = commandManager.undo(state.diagram);
    if (previousState) {
      setState(prev => ({
        ...prev,
        diagram: previousState,
        selectedElementIds: [], // Clear selection after undo
      }));
    }
  }, [commandManager, state.diagram]);

  const redo = useCallback(() => {
    const nextState = commandManager.redo(state.diagram);
    if (nextState) {
      setState(prev => ({
        ...prev,
        diagram: nextState,
        selectedElementIds: [], // Clear selection after redo
      }));
    }
  }, [commandManager, state.diagram]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (KeyboardShortcuts.isUndo(event)) {
        event.preventDefault();
        undo();
      } else if (KeyboardShortcuts.isRedo(event)) {
        event.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Update diagram and trigger re-render
  const updateDiagram = useCallback((newDiagram: DiagramSchema) => {
    setState(prev => ({
      ...prev,
      diagram: updateDiagramTimestamp(newDiagram),
    }));
  }, []);

  // Select elements
  const selectElement = useCallback((elementId: string, isMultiSelect: boolean = false) => {
    setState(prev => {
      let newSelectedIds: string[];
      
      if (isMultiSelect) {
        // Toggle selection in multi-select mode
        if (prev.selectedElementIds.includes(elementId)) {
          newSelectedIds = prev.selectedElementIds.filter(id => id !== elementId);
        } else {
          newSelectedIds = [...prev.selectedElementIds, elementId];
        }
      } else {
        // Single selection
        newSelectedIds = [elementId];
      }

      return {
        ...prev,
        selectedElementIds: newSelectedIds,
      };
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedElementIds: [],
    }));
  }, []);

  // Move element with command system
  const moveElement = useCallback((elementId: string, newPosition: Point) => {
    const currentElement = state.diagram.elements.find(el => el.id === elementId);
    if (!currentElement) return;

    const moveCommand = new MoveElementCommand(
      elementId,
      currentElement.position,
      newPosition,
      `Move ${currentElement.type}`
    );

    const newDiagram = commandManager.executeCommand(moveCommand, state.diagram);
    setState(prev => ({ ...prev, diagram: newDiagram }));
  }, [commandManager, state.diagram]);

  // Resize element with command system
  const resizeElement = useCallback((elementId: string, newSize: Size) => {
    const currentElement = state.diagram.elements.find(el => el.id === elementId);
    if (!currentElement) return;

    const resizeCommand = new ResizeElementCommand(
      elementId,
      currentElement.size,
      newSize,
      `Resize ${currentElement.type}`
    );

    const newDiagram = commandManager.executeCommand(resizeCommand, state.diagram);
    setState(prev => ({ ...prev, diagram: newDiagram }));
  }, [commandManager, state.diagram]);

  // Add element with command system
  const addElement = useCallback((element: DiagramElement) => {
    const addCommand = new AddElementCommand(element, `Add ${element.type}`);
    const newDiagram = commandManager.executeCommand(addCommand, state.diagram);
    
    setState(prev => ({
      ...prev,
      diagram: newDiagram,
      selectedElementIds: [element.id], // Select newly added element
    }));
  }, [commandManager, state.diagram]);

  // Remove elements with command system
  const removeElements = useCallback((elementIds: string[]) => {
    // Get elements to be removed (needed for undo)
    const elementsToRemove = state.diagram.elements.filter(el => 
      elementIds.includes(el.id)
    );

    const removeCommand = new RemoveElementsCommand(
      elementIds,
      elementsToRemove,
      `Remove ${elementIds.length} element(s)`
    );

    const newDiagram = commandManager.executeCommand(removeCommand, state.diagram);
    setState(prev => ({
      ...prev,
      diagram: newDiagram,
      selectedElementIds: prev.selectedElementIds.filter(
        id => !elementIds.includes(id)
      ),
    }));
  }, [commandManager, state.diagram]);

  // Set drawing tool
  const setDrawingTool = useCallback((tool: CanvasState['drawingTool']) => {
    setState(prev => ({
      ...prev,
      drawingTool: tool,
    }));
  }, []);

  // Handle canvas click (for adding new elements or clearing selection)
  const handleCanvasClick = useCallback((position: Point) => {
    setState(prev => {
      // If we have a drawing tool selected, we might add a new element here
      // For now, just clear selection when clicking on empty canvas
      if (prev.drawingTool === 'select' || prev.drawingTool === null) {
        return {
          ...prev,
          selectedElementIds: [],
        };
      }

      return prev;
    });
  }, []);

  // Update element text
  const updateElementText = useCallback((elementId: string, text: string) => {
    setState(prev => {
      const updatedElements = prev.diagram.elements.map(element =>
        element.id === elementId
          ? { ...element, text }
          : element
      );

      return {
        ...prev,
        diagram: updateDiagramTimestamp({
          ...prev.diagram,
          elements: updatedElements,
        }),
      };
    });
  }, []);

  // Update element style
  const updateElementStyle = useCallback((elementId: string, styleUpdates: Partial<DiagramElement['style']>) => {
    setState(prev => {
      const updatedElements = prev.diagram.elements.map(element =>
        element.id === elementId
          ? {
              ...element,
              style: { ...element.style, ...styleUpdates }
            }
          : element
      );

      return {
        ...prev,
        diagram: updateDiagramTimestamp({
          ...prev.diagram,
          elements: updatedElements,
        }),
      };
    });
  }, []);

  // Bulk style update with command system
  const bulkUpdateStyles = useCallback((update: BulkStyleUpdate) => {
    const bulkCommand = new BulkStyleCommand(update, `Update ${update.elementIds.length} element(s)`);
    const newDiagram = commandManager.executeCommand(bulkCommand, state.diagram);
    setState(prev => ({ ...prev, diagram: newDiagram }));
  }, [commandManager, state.diagram]);

  // Align elements with command system
  const alignElements = useCallback((operation: AlignmentOperation) => {
    const alignCommand = new AlignElementsCommand(operation, `Align ${operation.elementIds.length} element(s)`);
    const newDiagram = commandManager.executeCommand(alignCommand, state.diagram);
    setState(prev => ({ ...prev, diagram: newDiagram }));
  }, [commandManager, state.diagram]);

  // Distribute elements with command system
  const distributeElements = useCallback((operation: DistributionOperation) => {
    const distributeCommand = new DistributeElementsCommand(operation, `Distribute ${operation.elementIds.length} element(s)`);
    const newDiagram = commandManager.executeCommand(distributeCommand, state.diagram);
    setState(prev => ({ ...prev, diagram: newDiagram }));
  }, [commandManager, state.diagram]);

  // Find and replace text across elements
  const findAndReplaceText = useCallback((searchText: string, replaceText: string, matchCase = false) => {
    const elementsToUpdate = state.diagram.elements.filter(el => {
      if (!el.text) return false;
      const text = matchCase ? el.text : el.text.toLowerCase();
      const search = matchCase ? searchText : searchText.toLowerCase();
      return text.includes(search);
    });

    if (elementsToUpdate.length === 0) return;

    const updatedElements = state.diagram.elements.map(element => {
      if (!elementsToUpdate.some(el => el.id === element.id) || !element.text) {
        return element;
      }

      const text = matchCase ? element.text : element.text.toLowerCase();
      const search = matchCase ? searchText : searchText.toLowerCase();

      let newText = element.text;
      if (matchCase) {
        newText = newText.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceText);
      } else {
        newText = newText.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceText);
      }

      return { ...element, text: newText };
    });

    setState(prev => ({
      ...prev,
      diagram: updateDiagramTimestamp({
        ...prev.diagram,
        elements: updatedElements,
      }),
    }));
  }, [state.diagram]);

  // Batch update multiple element positions (for alignment/distribution)
  const batchUpdatePositions = useCallback((updates: Array<{ elementId: string; position: Point }>) => {
    setState(prev => {
      const updatedElements = prev.diagram.elements.map(element => {
        const update = updates.find(u => u.elementId === element.id);
        return update ? { ...element, position: update.position } : element;
      });

      return {
        ...prev,
        diagram: updateDiagramTimestamp({
          ...prev.diagram,
          elements: updatedElements,
        }),
      };
    });
  }, []);

  // Copy style from one element to others
  const copyStyleToElements = useCallback((sourceElementId: string, targetElementIds: string[]) => {
    const sourceElement = state.diagram.elements.find(el => el.id === sourceElementId);
    if (!sourceElement) return;

    const styleUpdate: BulkStyleUpdate = {
      elementIds: targetElementIds,
      styleUpdates: sourceElement.style,
      mode: 'replace',
    };

    bulkUpdateStyles(styleUpdate);
  }, [state.diagram.elements, bulkUpdateStyles]);

  return {
    // State
    diagram: state.diagram,
    selectedElementIds: state.selectedElementIds,
    selectedElements: state.diagram.elements.filter(el =>
      state.selectedElementIds.includes(el.id)
    ),
    isDrawing: state.isDrawing,
    drawingTool: state.drawingTool,
    commandState: state.commandState,

    // Actions
    updateDiagram,
    selectElement,
    clearSelection,
    moveElement,
    resizeElement,
    addElement,
    removeElements,
    setDrawingTool,
    handleCanvasClick,
    updateElementText,
    updateElementStyle,

    // Bulk Operations
    bulkUpdateStyles,
    alignElements,
    distributeElements,
    findAndReplaceText,
    batchUpdatePositions,
    copyStyleToElements,

    // Command System
    undo,
    redo,
    canUndo: state.commandState.canUndo,
    canRedo: state.commandState.canRedo,

    // Convenience methods
    deleteSelected: () => removeElements(state.selectedElementIds),
    hasSelection: state.selectedElementIds.length > 0,
    isMultiSelect: state.selectedElementIds.length > 1,
  };
}