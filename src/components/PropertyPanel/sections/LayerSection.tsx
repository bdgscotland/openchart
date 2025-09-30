import React, { useCallback, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { useNodes } from '@xyflow/react';
import PropertySection from '../PropertySection';
import PropertyField, { PropertyFieldGroup } from '../PropertyField';
import { SelectField } from '../fields';
import { useProperty } from '../PropertyContext';
import { useLayers } from '../../../contexts/LayerContext';
import './LayerSection.css';

export interface LayerSectionProps {
  title?: string;
  defaultExpanded?: boolean;
  priority?: number;
}

/**
 * LayerSection - Manages layer assignment for selected elements
 *
 * Allows users to move selected shapes/edges to different layers.
 * Shows current layer for single selection, or "Mixed" for multi-selection with different layers.
 */
export const LayerSection: React.FC<LayerSectionProps> = ({
  title = "Layer",
  defaultExpanded = false,
  priority = 85,
}) => {
  const context = useProperty();
  const { selectedElements, selectionType } = context;
  const { layers, moveElementsToLayer } = useLayers();

  // Get live node data from React Flow to ensure fresh layer assignments
  const nodes = useNodes();

  // Get current layer(s) of selected elements using live node data
  const currentLayerInfo = useMemo(() => {
    if (selectedElements.length === 0) {
      return { layerId: undefined, isMixed: false };
    }

    // Get layer IDs from live node data (not stale selectedElements)
    const selectedIds = new Set(selectedElements.map(el => el.id));
    const selectedNodes = nodes.filter(node => selectedIds.has(node.id));

    const layerIds = selectedNodes.map(node => node.data?.layerId || 'layer-default');
    const uniqueLayerIds = [...new Set(layerIds)];

    if (uniqueLayerIds.length === 1) {
      return { layerId: uniqueLayerIds[0], isMixed: false };
    } else {
      return { layerId: undefined, isMixed: true };
    }
  }, [selectedElements, nodes]);

  // Convert layers to options for SelectField
  const layerOptions = useMemo(() => {
    return layers.map(layer => ({
      value: layer.id,
      label: layer.name,
    }));
  }, [layers]);

  // Handle layer change
  const handleLayerChange = useCallback((newLayerId: string) => {
    if (!newLayerId) return;

    const elementIds = selectedElements.map(el => el.id);
    moveElementsToLayer(elementIds, newLayerId);
  }, [selectedElements, moveElementsToLayer]);

  // Get current layer name for display
  const currentLayerName = useMemo(() => {
    if (currentLayerInfo.isMixed) {
      return 'Mixed';
    }
    if (currentLayerInfo.layerId) {
      const layer = layers.find(l => l.id === currentLayerInfo.layerId);
      return layer?.name || 'Unknown';
    }
    return 'None';
  }, [currentLayerInfo, layers]);

  // Don't show if no selection
  if (selectionType === 'none' || selectedElements.length === 0) {
    return null;
  }

  return (
    <PropertySection
      title={title}
      icon={<Layers size={16} />}
      defaultExpanded={defaultExpanded}
      priority={priority}
      badge={currentLayerInfo.isMixed ? 'Mixed' : undefined}
    >
      <PropertyFieldGroup>
        <PropertyField label="Assign to Layer" orientation="vertical">
          <SelectField
            value={currentLayerInfo.isMixed ? '' : (currentLayerInfo.layerId || '')}
            onChange={handleLayerChange}
            options={layerOptions}
            placeholder={currentLayerInfo.isMixed ? 'Mixed layers' : 'Select layer...'}
            searchable={false}
          />
        </PropertyField>

        {/* Info about current layer */}
        {!currentLayerInfo.isMixed && currentLayerInfo.layerId && (
          <div className="layer-section-info">
            <small>
              {selectedElements.length === 1
                ? `This element is on ${currentLayerName}`
                : `${selectedElements.length} elements on ${currentLayerName}`}
            </small>
          </div>
        )}

        {/* Info for mixed selection */}
        {currentLayerInfo.isMixed && (
          <div className="layer-section-info">
            <small>
              Selected elements are on different layers. Choose a layer to move all selected elements.
            </small>
          </div>
        )}
      </PropertyFieldGroup>
    </PropertySection>
  );
};

export default LayerSection;