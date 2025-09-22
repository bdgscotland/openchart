import { Node, Edge, Viewport } from 'reactflow';
import { PresetStorage } from '../components/PropertyPanel/StylePresets/utils/presetStorage';
import { getRecentColors } from '../components/PropertyPanel/ColorPicker/colorUtils';
import {
  DiagramData,
  DiagramMetadata,
  PropertyPanelData,
  ExportOptions,
  ImportOptions,
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEYS,
  ValidationResult,
} from '../types/diagramSchema';

class DiagramPersistence {
  private presetStorage = new PresetStorage();

  /**
   * Export diagram data including all property panel configurations
   */
  async exportDiagram(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    metadata?: DiagramMetadata,
    options: ExportOptions = {}
  ): Promise<DiagramData> {
    // Get all property panel data if requested (default: true)
    const includePropertyPanel = options.includePropertyPanelData !== false;
    const propertyPanelData = includePropertyPanel
      ? await this.collectPropertyPanelData()
      : undefined;

    const diagram: DiagramData = {
      nodes,
      edges,
      viewport,
      version: CURRENT_SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      metadata: options.includeMetadata !== false ? metadata : undefined,
      propertyPanelData,
    };

    return diagram;
  }

  /**
   * Import diagram data and restore property panel configurations
   */
  async importDiagram(
    diagramData: DiagramData,
    options: ImportOptions = {}
  ): Promise<{
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
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

    // Re-attach onTextChange callbacks to loaded nodes
    const nodesWithCallbacks = diagramData.nodes.map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        onTextChange: (newText: string) => {
          console.log(`Text changed for node ${node.id}: ${newText}`);
        },
      },
    }));

    return {
      nodes: nodesWithCallbacks,
      edges: diagramData.edges,
      viewport: diagramData.viewport,
      restoredFeatures,
    };
  }

  /**
   * Save diagram to file with comprehensive data
   */
  async saveDiagramToFile(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    metadata?: DiagramMetadata
  ): Promise<void> {
    const diagram = await this.exportDiagram(nodes, edges, viewport, metadata);
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
   * Auto-save diagram to localStorage with property panel data
   */
  async autoSaveDiagram(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ): Promise<void> {
    if (nodes.length === 0 && edges.length === 0) {
      return; // Don't auto-save empty diagrams
    }

    const diagram = await this.exportDiagram(nodes, edges, viewport);
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(diagram));
    console.log('Auto-saved diagram with property panel data');
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
      const stylePresets = await this.presetStorage.getPresets();
      const collections = await this.presetStorage.getCollections();
      const themes = await this.presetStorage.getThemes();
      const favorites = await this.presetStorage.getFavorites();
      const recentlyUsed = await this.presetStorage.getRecentlyUsed();
      const currentTheme = await this.presetStorage.getCurrentTheme();
      const presetSettings = await this.presetStorage.getSettings();

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
        await this.presetStorage.restoreFromBackup(backupData);
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