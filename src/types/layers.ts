/**
 * Layer system types for OpenChart
 *
 * Layers work like Photoshop/Figma/Illustrator:
 * - A Layer is a container that holds multiple shapes and edges
 * - Layers have properties: name, visible, locked, opacity
 * - All elements in a layer inherit the layer's properties
 * - Users can create, delete, rename, and reorder layers
 */

export interface Layer {
  /** Unique identifier for the layer */
  id: string;

  /** Display name of the layer */
  name: string;

  /** Whether the layer and all its contents are visible */
  visible: boolean;

  /** Whether the layer and all its contents are locked (non-interactive) */
  locked: boolean;

  /** Opacity applied to all elements in the layer (0-1) */
  opacity: number;

  /** Order of the layer (higher = on top, like z-index) */
  order: number;

  /** Color indicator for the layer (optional) */
  color?: string;
}

/**
 * Operations available on layers
 */
export interface LayerOperations {
  /** Create a new layer */
  createLayer: (name?: string) => Layer;

  /** Delete a layer (moves elements to default layer) */
  deleteLayer: (layerId: string) => void;

  /** Rename a layer */
  renameLayer: (layerId: string, newName: string) => void;

  /** Toggle layer visibility */
  toggleLayerVisibility: (layerId: string) => void;

  /** Toggle layer locked state */
  toggleLayerLock: (layerId: string) => void;

  /** Set layer opacity */
  setLayerOpacity: (layerId: string, opacity: number) => void;

  /** Reorder layers */
  reorderLayers: (layerIds: string[]) => void;

  /** Move elements to a different layer */
  moveElementsToLayer: (elementIds: string[], targetLayerId: string) => void;

  /** Get layer by ID */
  getLayer: (layerId: string) => Layer | undefined;

  /** Get all layers sorted by order */
  getLayers: () => Layer[];

  /** Get the currently active layer (where new elements are added) */
  getActiveLayer: () => Layer;

  /** Set the active layer */
  setActiveLayer: (layerId: string) => void;
}

/**
 * Default layer created for new diagrams
 */
export const DEFAULT_LAYER: Layer = {
  id: 'layer-default',
  name: 'Layer 1',
  visible: true,
  locked: false,
  opacity: 1,
  order: 0,
};

/**
 * Create a new layer with default values
 */
export function createNewLayer(order: number, name?: string): Layer {
  return {
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name || `Layer ${order + 1}`,
    visible: true,
    locked: false,
    opacity: 1,
    order,
  };
}