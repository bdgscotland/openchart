import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { Layer, LayerOperations } from '../types/layers';
import { DEFAULT_LAYER, createNewLayer } from '../types/layers';

/**
 * LayerContext provides layer management for OpenChart
 * Implements the full LayerOperations interface for managing diagram layers
 */

interface LayerContextValue extends LayerOperations {
  layers: Layer[];
  activeLayerId: string;
}

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

interface LayerProviderProps {
  children: ReactNode;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  // Optional external state for persistence
  layers?: Layer[];
  setLayers?: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayerId?: string;
  setActiveLayerId?: React.Dispatch<React.SetStateAction<string>>;
}

export const LayerProvider: React.FC<LayerProviderProps> = ({
  children,
  nodes,
  setNodes,
  edges,
  setEdges,
  layers: externalLayers,
  setLayers: externalSetLayers,
  activeLayerId: externalActiveLayerId,
  setActiveLayerId: externalSetActiveLayerId,
}) => {
  // Use external state if provided, otherwise use internal state
  const [internalLayers, internalSetLayers] = useState<Layer[]>([DEFAULT_LAYER]);
  const [internalActiveLayerId, internalSetActiveLayerId] = useState<string>(DEFAULT_LAYER.id);

  const layers = externalLayers !== undefined ? externalLayers : internalLayers;
  const setLayers = externalSetLayers || internalSetLayers;
  const activeLayerId = externalActiveLayerId !== undefined ? externalActiveLayerId : internalActiveLayerId;
  const setActiveLayerId = externalSetActiveLayerId || internalSetActiveLayerId;

  /**
   * Create a new layer with an optional custom name
   */
  const createLayer = useCallback((name?: string): Layer => {
    const maxOrder = Math.max(...layers.map(l => l.order), -1);
    const newLayer = createNewLayer(maxOrder + 1, name);

    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);

    return newLayer;
  }, [layers]);

  /**
   * Delete a layer and move its elements to the default layer
   * Cannot delete the default layer
   */
  const deleteLayer = useCallback((layerId: string): void => {
    // Prevent deleting the default layer
    if (layerId === DEFAULT_LAYER.id) {
      console.warn('Cannot delete the default layer');
      return;
    }

    // Move all elements from this layer to the default layer
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.data?.layerId === layerId
          ? { ...node, data: { ...node.data, layerId: DEFAULT_LAYER.id } }
          : node
      )
    );

    setEdges(prevEdges =>
      prevEdges.map(edge =>
        edge.data?.layerId === layerId
          ? { ...edge, data: { ...edge.data, layerId: DEFAULT_LAYER.id } }
          : edge
      )
    );

    // Remove the layer
    setLayers(prev => prev.filter(l => l.id !== layerId));

    // If this was the active layer, switch to default
    if (activeLayerId === layerId) {
      setActiveLayerId(DEFAULT_LAYER.id);
    }
  }, [activeLayerId, setNodes, setEdges]);

  /**
   * Rename a layer
   */
  const renameLayer = useCallback((layerId: string, newName: string): void => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, name: newName } : layer
      )
    );
  }, []);

  /**
   * Toggle layer visibility
   */
  const toggleLayerVisibility = useCallback((layerId: string): void => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  /**
   * Toggle layer locked state
   */
  const toggleLayerLock = useCallback((layerId: string): void => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  }, []);

  /**
   * Set layer opacity (0-1)
   */
  const setLayerOpacity = useCallback((layerId: string, opacity: number): void => {
    // Clamp opacity between 0 and 1
    const clampedOpacity = Math.max(0, Math.min(1, opacity));

    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, opacity: clampedOpacity } : layer
      )
    );
  }, []);

  /**
   * Reorder layers based on array position
   * First element has order 0, second has order 1, etc.
   */
  const reorderLayers = useCallback((layerIds: string[]): void => {
    setLayers(prev => {
      // Create a map of layerId to new order
      const orderMap = new Map(layerIds.map((id, index) => [id, index]));

      // Update layers with new order
      return prev.map(layer => ({
        ...layer,
        order: orderMap.get(layer.id) ?? layer.order,
      }));
    });
  }, []);

  /**
   * Move elements (nodes and edges) to a different layer
   */
  const moveElementsToLayer = useCallback((elementIds: string[], targetLayerId: string): void => {
    // Verify target layer exists
    const targetExists = layers.some(l => l.id === targetLayerId);
    if (!targetExists) {
      console.warn(`Target layer ${targetLayerId} does not exist`);
      return;
    }

    const elementIdSet = new Set(elementIds);

    // Update nodes
    setNodes(prevNodes =>
      prevNodes.map(node =>
        elementIdSet.has(node.id)
          ? { ...node, data: { ...node.data, layerId: targetLayerId } }
          : node
      )
    );

    // Update edges
    setEdges(prevEdges =>
      prevEdges.map(edge =>
        elementIdSet.has(edge.id)
          ? { ...edge, data: { ...edge.data, layerId: targetLayerId } }
          : edge
      )
    );
  }, [layers, setNodes, setEdges]);

  /**
   * Get layer by ID
   */
  const getLayer = useCallback((layerId: string): Layer | undefined => {
    return layers.find(l => l.id === layerId);
  }, [layers]);

  /**
   * Get all layers sorted by order
   */
  const getLayers = useCallback((): Layer[] => {
    return [...layers].sort((a, b) => a.order - b.order);
  }, [layers]);

  /**
   * Get the currently active layer
   */
  const getActiveLayer = useCallback((): Layer => {
    const activeLayer = layers.find(l => l.id === activeLayerId);
    return activeLayer || DEFAULT_LAYER;
  }, [layers, activeLayerId]);

  /**
   * Set the active layer
   */
  const setActiveLayer = useCallback((layerId: string): void => {
    const layerExists = layers.some(l => l.id === layerId);
    if (layerExists) {
      setActiveLayerId(layerId);
    } else {
      console.warn(`Layer ${layerId} does not exist`);
    }
  }, [layers]);

  const value: LayerContextValue = {
    layers,
    activeLayerId,
    createLayer,
    deleteLayer,
    renameLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
    reorderLayers,
    moveElementsToLayer,
    getLayer,
    getLayers,
    getActiveLayer,
    setActiveLayer,
  };

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

/**
 * Hook to access layer management
 */
export const useLayers = (): LayerContextValue => {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayers must be used within a LayerProvider');
  }
  return context;
};