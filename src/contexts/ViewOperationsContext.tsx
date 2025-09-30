import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { DiagramSettings } from '../types/diagram';

interface ViewOperationsContextType {
  // UI Panel Toggle Handlers
  handleToggleFormatPanel: () => void;
  handleToggleOutlinePanel: () => void;
  handleToggleLayersPanel: () => void;
  handleToggleShapesPanel: () => void;
  handleToggleSearchShapes: () => void;
  handleToggleScratchpad: () => void;
  handleToggleTags: () => void;

  // Display Toggle Handlers
  handleToggleTooltips: () => void;
  handleToggleAnimations: () => void;
  handleToggleGuides: () => void;
  handleTogglePageTabs: () => void;
  handleTogglePageView: () => void;

  // Connection Visualization Toggle Handlers
  handleToggleConnectionArrows: () => void;
  handleToggleConnectionPoints: () => void;

  // View Control Handlers
  handleResetView: () => void;
  handleToggleFullscreen: () => void;

  // Units and Scale Handlers
  handleChangeUnits: (units: 'px' | 'cm' | 'in' | 'pt' | 'mm') => void;
  handleChangePageScale: (scale: number) => void;

  // Grid and Rulers
  handleToggleGrid: () => void;
  handleToggleRulers: () => void;
}

interface ViewOperationsProviderProps {
  children: ReactNode;
  diagramSettings: DiagramSettings;
  setDiagramSettings: React.Dispatch<React.SetStateAction<DiagramSettings>>;
  setIsLeftSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRightSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  flowRef: React.RefObject<any>;
}

const ViewOperationsContext = createContext<ViewOperationsContextType | undefined>(undefined);

export const ViewOperationsProvider: React.FC<ViewOperationsProviderProps> = ({
  children,
  diagramSettings,
  setDiagramSettings,
  setIsLeftSidebarCollapsed,
  setIsRightSidebarCollapsed,
  flowRef,
}) => {
  // UI Panel Toggle Handlers
  const handleToggleFormatPanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, formatPanel: !prev.uiPanels.formatPanel }
    }));
    // Also toggle the actual right sidebar
    setIsRightSidebarCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('openchart-right-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, [setDiagramSettings, setIsRightSidebarCollapsed]);

  const handleToggleOutlinePanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, outlinePanel: !prev.uiPanels.outlinePanel }
    }));
    // TODO: Implement outline panel when built
  }, [setDiagramSettings]);

  const handleToggleLayersPanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, layersPanel: !prev.uiPanels.layersPanel }
    }));
    // TODO: Implement layers panel when built
  }, [setDiagramSettings]);

  const handleToggleShapesPanel = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, shapesPanel: !prev.uiPanels.shapesPanel }
    }));
    // Also toggle the actual left sidebar
    setIsLeftSidebarCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('openchart-left-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, [setDiagramSettings, setIsLeftSidebarCollapsed]);

  const handleToggleSearchShapes = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, searchShapes: !prev.uiPanels.searchShapes }
    }));
    // TODO: Implement search shapes panel when built
  }, [setDiagramSettings]);

  const handleToggleScratchpad = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, scratchpad: !prev.uiPanels.scratchpad }
    }));
    // TODO: Implement scratchpad panel when built
  }, [setDiagramSettings]);

  const handleToggleTags = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      uiPanels: { ...prev.uiPanels, tags: !prev.uiPanels.tags }
    }));
    // TODO: Implement tags panel when built
  }, [setDiagramSettings]);

  // Display Toggle Handlers
  const handleToggleTooltips = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, tooltips: !prev.display.tooltips }
    }));
  }, [setDiagramSettings]);

  const handleToggleAnimations = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, animations: !prev.display.animations }
    }));
  }, [setDiagramSettings]);

  const handleToggleGuides = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, guides: !prev.display.guides }
    }));
  }, [setDiagramSettings]);

  const handleTogglePageTabs = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, pageTabs: !prev.display.pageTabs }
    }));
    // TODO: Implement page tabs when built
  }, [setDiagramSettings]);

  const handleTogglePageView = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      display: { ...prev.display, pageView: !prev.display.pageView }
    }));
    // TODO: Implement page view mode when built
  }, [setDiagramSettings]);

  // Connection Visualization Toggle Handlers
  const handleToggleConnectionArrows = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      connectionVisualization: {
        ...prev.connectionVisualization,
        connectionArrows: !prev.connectionVisualization.connectionArrows
      }
    }));
    // TODO: Apply to existing edges and canvas rendering
  }, [setDiagramSettings]);

  const handleToggleConnectionPoints = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      connectionVisualization: {
        ...prev.connectionVisualization,
        connectionPoints: !prev.connectionVisualization.connectionPoints
      }
    }));
    // TODO: Apply to canvas rendering to show/hide connection points
  }, [setDiagramSettings]);

  // View Control Handlers
  const handleResetView = useCallback(() => {
    if (flowRef.current) {
      flowRef.current.setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [flowRef]);

  const handleToggleFullscreen = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      view: { ...prev.view, fullscreen: !prev.view.fullscreen }
    }));

    // Actually toggle fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [setDiagramSettings]);

  // Units and Scale Handlers
  const handleChangeUnits = useCallback((units: 'px' | 'cm' | 'in' | 'pt' | 'mm') => {
    setDiagramSettings(prev => ({
      ...prev,
      view: { ...prev.view, units }
    }));
  }, [setDiagramSettings]);

  const handleChangePageScale = useCallback((scale: number) => {
    setDiagramSettings(prev => ({
      ...prev,
      view: { ...prev.view, scale }
    }));
    // TODO: Apply scale to canvas/viewport when implemented
  }, [setDiagramSettings]);

  // Grid and Rulers
  const handleToggleGrid = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      grid: { ...prev.grid, enabled: !prev.grid.enabled }
    }));
  }, [setDiagramSettings]);

  const handleToggleRulers = useCallback(() => {
    setDiagramSettings(prev => ({
      ...prev,
      rulers: { ...prev.rulers, enabled: !prev.rulers.enabled }
    }));
  }, [setDiagramSettings]);

  const contextValue: ViewOperationsContextType = {
    handleToggleFormatPanel,
    handleToggleOutlinePanel,
    handleToggleLayersPanel,
    handleToggleShapesPanel,
    handleToggleSearchShapes,
    handleToggleScratchpad,
    handleToggleTags,
    handleToggleTooltips,
    handleToggleAnimations,
    handleToggleGuides,
    handleTogglePageTabs,
    handleTogglePageView,
    handleToggleConnectionArrows,
    handleToggleConnectionPoints,
    handleResetView,
    handleToggleFullscreen,
    handleChangeUnits,
    handleChangePageScale,
    handleToggleGrid,
    handleToggleRulers,
  };

  return (
    <ViewOperationsContext.Provider value={contextValue}>
      {children}
    </ViewOperationsContext.Provider>
  );
};

export const useViewOperations = (): ViewOperationsContextType => {
  const context = useContext(ViewOperationsContext);
  if (context === undefined) {
    throw new Error('useViewOperations must be used within a ViewOperationsProvider');
  }
  return context;
};