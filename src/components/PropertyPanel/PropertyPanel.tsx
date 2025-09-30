import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Palette, Layout, PanelRightClose, Link2 } from 'lucide-react';
import type { Edge } from '@xyflow/react';
import TabContainer from './TabContainer';
import DiagramControls from './DiagramControls';
import ContextAwareStyleControls from './ContextAwareStyleControls';
import EdgePropertiesPanel from './EdgePropertiesPanel';
import type {
  DiagramElement,
  ElementStyle,
  DiagramSettings,
  GridSettings,
  BackgroundSettings,
  PaperSettings,
  ViewportSettings,
  RulerSettings
} from '../../types/diagram';
import type { EdgeStyleConfig } from '../../types/edgeTypes';
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../core/commands/BulkStyleCommand';
import './PropertyPanel.css';

export interface PropertyPanelProps {
  selectedElements: DiagramElement[];
  allElements?: DiagramElement[]; // For style synchronizer
  selectedEdges?: Edge[]; // For edge properties
  onUpdateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyle>) => void;
  onUpdateElementText: (elementId: string, text: string) => void;
  onUpdateElementPosition: (elementId: string, x: number, y: number) => void;
  onUpdateElementSize: (elementId: string, width: number, height: number) => void;

  // Edge operations
  onUpdateEdgeStyle?: (edgeId: string, styleUpdates: Partial<EdgeStyleConfig>) => void;

  // Bulk operations
  onBulkStyleUpdate?: (update: BulkStyleUpdate) => void;
  onAlignElements?: (operation: AlignmentOperation) => void;
  onDistributeElements?: (operation: DistributionOperation) => void;
  onFindAndReplaceText?: (searchText: string, replaceText: string, matchCase?: boolean) => void;
  onCopyStyleToElements?: (sourceElementId: string, targetElementIds: string[]) => void;

  // Diagram-level settings (NEW)
  diagramSettings?: DiagramSettings;
  onGridSettingsChange?: (settings: Partial<GridSettings>) => void;
  onBackgroundSettingsChange?: (settings: Partial<BackgroundSettings>) => void;
  onPaperSettingsChange?: (settings: Partial<PaperSettings>) => void;
  onViewportSettingsChange?: (settings: Partial<ViewportSettings>) => void;
  onRulerSettingsChange?: (settings: Partial<RulerSettings>) => void;

  isVisible?: boolean;
  onToggleVisibility?: () => void;
  className?: string;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedElements = [],
  allElements = [],
  selectedEdges = [],
  onUpdateElementStyle,
  onUpdateElementText,
  onUpdateElementPosition,
  onUpdateElementSize,
  onUpdateEdgeStyle,
  onBulkStyleUpdate,
  onAlignElements,
  onDistributeElements,
  onFindAndReplaceText,
  onCopyStyleToElements,
  diagramSettings,
  onGridSettingsChange,
  onBackgroundSettingsChange,
  onPaperSettingsChange,
  onViewportSettingsChange,
  onRulerSettingsChange,
  isVisible = true,
  onToggleVisibility,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('style'); // Default to Style tab

  // Determine what type of properties to show
  const hasSelectedEdges = selectedEdges.length > 0;
  const hasSelectedElements = selectedElements.length > 0;

  if (!isVisible) {
    return (
      <div className={`property-panel property-panel-collapsed ${className}`}>
        <button
          className="property-panel-toggle collapsed-toggle"
          onClick={onToggleVisibility}
          aria-label="Show Properties Panel"
          title="Show Properties Panel"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  const tabs = [
    {
      id: 'diagram',
      label: 'Diagram',
      icon: <Layout size={16} />,
      content: diagramSettings ? (
        <DiagramControls
          settings={diagramSettings}
          onGridSettingsChange={onGridSettingsChange || (() => {})}
          onBackgroundSettingsChange={onBackgroundSettingsChange || (() => {})}
          onPaperSettingsChange={onPaperSettingsChange || (() => {})}
          onViewportSettingsChange={onViewportSettingsChange || (() => {})}
          onRulerSettingsChange={onRulerSettingsChange || (() => {})}
        />
      ) : (
        <div className="diagram-placeholder">
          <div className="placeholder-content">
            <Layout size={48} />
            <p>Diagram Settings</p>
            <small>Canvas-level controls will appear here when diagram settings are connected</small>
          </div>
        </div>
      ),
    },
    {
      id: 'style',
      label: hasSelectedEdges ? 'Edge' : 'Style',
      icon: hasSelectedEdges ? <Link2 size={16} /> : <Palette size={16} />,
      badge: hasSelectedEdges ? selectedEdges.length : (selectedElements.length > 1 ? selectedElements.length : undefined),
      content: hasSelectedEdges && selectedEdges.length === 1 && onUpdateEdgeStyle ? (
        <EdgePropertiesPanel
          selectedEdge={selectedEdges[0]}
          onUpdateEdgeStyle={onUpdateEdgeStyle}
        />
      ) : hasSelectedEdges ? (
        <div className="edge-multi-select-placeholder">
          <div className="placeholder-content">
            <Link2 size={48} />
            <p>Multiple Edges Selected</p>
            <small>Select a single edge to edit its properties and label</small>
          </div>
        </div>
      ) : (
        <ContextAwareStyleControls
          selectedElements={selectedElements}
          allElements={allElements}
          onUpdateElementStyle={onUpdateElementStyle}
          onUpdateElementText={onUpdateElementText}
          onUpdateElementPosition={onUpdateElementPosition}
          onUpdateElementSize={onUpdateElementSize}
          onBulkStyleUpdate={onBulkStyleUpdate}
          onAlignElements={onAlignElements}
          onDistributeElements={onDistributeElements}
          onFindAndReplaceText={onFindAndReplaceText}
          onCopyStyleToElements={onCopyStyleToElements}
        />
      ),
    },
  ];

  return (
    <div className={`property-panel property-panel-expanded ${className}`}>
      <div className="property-panel-header">
        <div className="property-panel-title">
          <Settings size={20} />
          <span>Properties</span>
          {hasSelectedEdges && selectedEdges.length > 0 && (
            <span className="selection-count">
              {selectedEdges.length} edge{selectedEdges.length > 1 ? 's' : ''} selected
            </span>
          )}
          {!hasSelectedEdges && selectedElements.length > 1 && (
            <span className="selection-count">
              {selectedElements.length} selected
            </span>
          )}
        </div>
        {onToggleVisibility && (
          <button
            className="property-panel-toggle"
            onClick={onToggleVisibility}
            aria-label="Hide Properties Panel"
            title="Hide Properties Panel"
          >
            <PanelRightClose size={20} />
          </button>
        )}
      </div>

      <div className="property-panel-content">
        <TabContainer
          tabs={tabs}
          defaultActiveTab={activeTab}
          onTabChange={setActiveTab}
          className="two-tab-layout"
        />
      </div>
    </div>
  );
};

export default PropertyPanel;