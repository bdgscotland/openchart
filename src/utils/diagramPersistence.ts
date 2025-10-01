import type { Node, Edge, Viewport } from '@xyflow/react';
import { presetStorage } from '../components/PropertyPanel/StylePresets/utils/presetStorage';
import { getRecentColors } from '../components/PropertyPanel/ColorPicker/colorUtils';
import type {
  DiagramData,
  DiagramMetadata,
  PropertyPanelData,
  ExportOptions,
  ImportOptions,
  ValidationResult,
} from '../types/diagramSchema';
import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEYS,
} from '../types/diagramSchema';
import type { Layer } from '../types/layers';
import { DEFAULT_LAYER } from '../types/layers';

class DiagramPersistence {

  /**
   * Export diagram data including all property panel configurations and layers
   */
  async exportDiagram(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    layers?: Layer[],
    activeLayerId?: string,
    metadata?: DiagramMetadata,
    diagramSettings?: any,
    options: ExportOptions = {}
  ): Promise<DiagramData> {
    // Get all property panel data if requested (default: true)
    const includePropertyPanel = options.includePropertyPanelData !== false;
    const propertyPanelData = includePropertyPanel
      ? await this.collectPropertyPanelData()
      : undefined;

    // Ensure nodes preserve their zIndex during export
    const nodesWithZIndex = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        zIndex: node.data?.zIndex ?? node.zIndex ?? 0,
      },
    }));

    const diagram: DiagramData = {
      nodes: nodesWithZIndex,
      edges,
      viewport,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      metadata: options.includeMetadata !== false ? metadata : undefined,
      propertyPanelData,
      layers: layers || [DEFAULT_LAYER],
      activeLayerId: activeLayerId || DEFAULT_LAYER.id,
      diagramSettings,
    };

    return diagram;
  }

  /**
   * Import diagram data and restore property panel configurations and layers
   */
  async importDiagram(
    diagramData: DiagramData,
    options: ImportOptions = {}
  ): Promise<{
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
    layers: Layer[];
    activeLayerId: string;
    diagramSettings?: any;
    restoredFeatures: string[];
  }> {
    // Validate data first
    const validation = this.validateDiagramData(diagramData);
    if (!validation.valid) {
      throw new Error(`Invalid diagram data: ${validation.errors.join(', ')}`);
    }

    const restoredFeatures: string[] = [];

    // Restore property panel data if available and requested
    if (diagramData.propertyPanelData && options.mergePropertyPanelData !== false) {
      await this.restorePropertyPanelData(diagramData.propertyPanelData, restoredFeatures);
    }

    // Handle layer migration for legacy diagrams
    let layers: Layer[] = diagramData.layers || [DEFAULT_LAYER];
    let activeLayerId: string = diagramData.activeLayerId || DEFAULT_LAYER.id;

    // Ensure at least the default layer exists
    if (layers.length === 0) {
      layers = [DEFAULT_LAYER];
      activeLayerId = DEFAULT_LAYER.id;
      restoredFeatures.push('Migrated to layer system');
    }

    // Migrate nodes without layerId to DEFAULT_LAYER
    const nodesWithCallbacks = diagramData.nodes.map((node: any) => {
      const layerId = node.data?.layerId || DEFAULT_LAYER.id;
      const zIndex = node.data?.zIndex ?? node.zIndex ?? 0;

      return {
        ...node,
        data: {
          ...node.data,
          layerId,
          zIndex,
          onTextChange: (newText: string) => {
            console.log(`Text changed for node ${node.id}: ${newText}`);
          },
        },
      };
    });

    // Migrate edges without layerId to DEFAULT_LAYER
    const edgesWithLayerId = diagramData.edges.map((edge: any) => ({
      ...edge,
      data: {
        ...edge.data,
        layerId: edge.data?.layerId || DEFAULT_LAYER.id,
      },
    }));

    return {
      nodes: nodesWithCallbacks,
      edges: edgesWithLayerId,
      viewport: diagramData.viewport,
      layers,
      activeLayerId,
      diagramSettings: diagramData.diagramSettings,
      restoredFeatures,
    };
  }

  /**
   * Save diagram to file with comprehensive data including layers
   */
  async saveDiagramToFile(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    layers?: Layer[],
    activeLayerId?: string,
    diagramSettings?: any,
    metadata?: DiagramMetadata
  ): Promise<void> {
    const diagram = await this.exportDiagram(nodes, edges, viewport, layers, activeLayerId, metadata, diagramSettings);
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Auto-save diagram to localStorage with property panel data and layers
   */
  async autoSaveDiagram(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    layers?: Layer[],
    activeLayerId?: string
  ): Promise<void> {
    if (nodes.length === 0 && edges.length === 0) {
      return; // Don't auto-save empty diagrams
    }

    const diagram = await this.exportDiagram(nodes, edges, viewport, layers, activeLayerId);
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(diagram));
    console.log('Auto-saved diagram with property panel data and layers');
  }

  /**
   * Load auto-saved diagram from localStorage
   */
  async loadAutoSavedDiagram(): Promise<DiagramData | null> {
    const autosaved = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
    if (!autosaved) {
      return null;
    }

    try {
      const diagram = JSON.parse(autosaved) as DiagramData;
      return diagram;
    } catch (error) {
      console.error('Failed to parse auto-saved diagram:', error);
      return null;
    }
  }

  /**
   * Collect all property panel data for export
   */
  private async collectPropertyPanelData(): Promise<PropertyPanelData> {
    try {
      // Get style presets data
      const stylePresets = await presetStorage.getPresets();
      const collections = await presetStorage.getCollections();
      const themes = await presetStorage.getThemes();
      const favorites = await presetStorage.getFavorites();
      const recentlyUsed = await presetStorage.getRecentlyUsed();
      const currentTheme = await presetStorage.getCurrentTheme();
      const presetSettings = await presetStorage.getSettings();

      // Get color picker data
      const recentColors = getRecentColors();

      // Get style history
      const styleHistoryStr = localStorage.getItem(STORAGE_KEYS.STYLE_HISTORY);
      const styleHistory = styleHistoryStr ? JSON.parse(styleHistoryStr) : [];

      // Get style clipboard
      const styleClipboardStr = localStorage.getItem(STORAGE_KEYS.STYLE_CLIPBOARD);
      const styleClipboard = styleClipboardStr ? JSON.parse(styleClipboardStr) : null;

      // Get panel settings
      const panelSettingsStr = localStorage.getItem(STORAGE_KEYS.PANEL_SETTINGS);
      const panelSettings = panelSettingsStr ? JSON.parse(panelSettingsStr) : undefined;

      return {
        stylePresets,
        collections,
        themes,
        favorites,
        recentlyUsed,
        currentTheme,
        presetSettings,
        recentColors,
        styleHistory,
        styleClipboard,
        panelSettings,
      };
    } catch (error) {
      console.warn('Failed to collect property panel data:', error);
      return {};
    }
  }

  /**
   * Restore property panel data from import
   */
  private async restorePropertyPanelData(
    data: PropertyPanelData,
    restoredFeatures: string[]
  ): Promise<void> {
    if (!data) return;

    try {
      // Restore style presets data
      if (data.stylePresets?.length || data.collections?.length || data.themes?.length) {
        const backupData = {
          presets: data.stylePresets || [],
          collections: data.collections || [],
          themes: data.themes || [],
          favorites: data.favorites || [],
          recentlyUsed: data.recentlyUsed || [],
          currentTheme: data.currentTheme,
          settings: data.presetSettings,
          version: '1.0.0',
        };
        await presetStorage.restoreFromBackup(backupData);
        restoredFeatures.push('Style Presets & Themes');
      }

      // Restore recent colors
      if (data.recentColors?.length) {
        localStorage.setItem(STORAGE_KEYS.RECENT_COLORS, JSON.stringify(data.recentColors));
        restoredFeatures.push('Recent Colors');
      }

      // Restore style history
      if (data.styleHistory?.length) {
        localStorage.setItem(STORAGE_KEYS.STYLE_HISTORY, JSON.stringify(data.styleHistory));
        restoredFeatures.push('Style History');
      }

      // Restore style clipboard
      if (data.styleClipboard) {
        localStorage.setItem(STORAGE_KEYS.STYLE_CLIPBOARD, JSON.stringify(data.styleClipboard));
        restoredFeatures.push('Style Clipboard');
      }

      // Restore panel settings
      if (data.panelSettings) {
        localStorage.setItem(STORAGE_KEYS.PANEL_SETTINGS, JSON.stringify(data.panelSettings));
        restoredFeatures.push('Panel Settings');
      }

    } catch (error) {
      console.warn('Failed to restore property panel data:', error);
    }
  }

  /**
   * Get diagram metadata for display
   */
  getDiagramInfo(diagram: DiagramData): {
    version: string;
    timestamp: string;
    nodeCount: number;
    edgeCount: number;
    hasPropertyPanelData: boolean;
    hasMetadata: boolean;
    features: string[];
  } {
    const features: string[] = [];

    if (diagram.propertyPanelData?.stylePresets?.length) {
      features.push(`${diagram.propertyPanelData.stylePresets.length} Style Presets`);
    }

    if (diagram.propertyPanelData?.themes?.length) {
      features.push(`${diagram.propertyPanelData.themes.length} Themes`);
    }

    if (diagram.propertyPanelData?.recentColors?.length) {
      features.push(`${diagram.propertyPanelData.recentColors.length} Recent Colors`);
    }

    if (diagram.propertyPanelData?.styleHistory?.length) {
      features.push(`${diagram.propertyPanelData.styleHistory.length} Style History Entries`);
    }

    return {
      version: diagram.version,
      timestamp: diagram.timestamp,
      nodeCount: diagram.nodes.length,
      edgeCount: diagram.edges.length,
      hasPropertyPanelData: !!diagram.propertyPanelData && Object.keys(diagram.propertyPanelData).length > 0,
      hasMetadata: !!diagram.metadata && Object.keys(diagram.metadata).length > 0,
      features,
    };
  }

  /**
   * Validate diagram data before import
   */
  validateDiagramData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data exists
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        errors: ['Invalid data format'],
        warnings: [],
      };
    }

    // Check required fields
    if (!data.nodes || !Array.isArray(data.nodes)) {
      errors.push('Missing or invalid nodes array');
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      errors.push('Missing or invalid edges array');
    }

    if (!data.viewport || typeof data.viewport !== 'object') {
      errors.push('Missing or invalid viewport object');
    }

    if (!data.version) {
      warnings.push('Missing version information');
    } else if (data.version !== CURRENT_SCHEMA_VERSION) {
      warnings.push(`Version mismatch: expected ${CURRENT_SCHEMA_VERSION}, got ${data.version}`);
    }

    // Check for potential data corruption
    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach((node: any, index: number) => {
        if (!node.id) errors.push(`Node ${index} missing id`);
        if (!node.type) errors.push(`Node ${index} missing type`);
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          errors.push(`Node ${index} missing or invalid position`);
        }
      });
    }

    if (data.edges && Array.isArray(data.edges)) {
      data.edges.forEach((edge: any, index: number) => {
        if (!edge.id) errors.push(`Edge ${index} missing id`);
        if (!edge.source) errors.push(`Edge ${index} missing source`);
        if (!edge.target) errors.push(`Edge ${index} missing target`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const diagramPersistence = new DiagramPersistence();
export default diagramPersistence;