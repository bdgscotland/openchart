import React, { useState } from 'react';
import { ChevronRight, Settings, Palette, Layout } from 'lucide-react';
import TabContainer from './TabContainer';
import DiagramControls from './DiagramControls';
import StyleControls from './StyleControls';
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
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../core/commands/BulkStyleCommand';
import './PropertyPanel.css';

export interface PropertyPanelProps {
  selectedElements: DiagramElement[];
  allElements?: DiagramElement[]; // For style synchronizer
  onUpdateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyle>) => void;
  onUpdateElementText: (elementId: string, text: string) => void;
  onUpdateElementPosition: (elementId: string, x: number, y: number) => void;
  onUpdateElementSize: (elementId: string, width: number, height: number) => void;

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
  onUpdateElementStyle,
  onUpdateElementText,
  onUpdateElementPosition,
  onUpdateElementSize,
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

  if (!isVisible) {
    return (
      <div className={`property-panel property-panel-collapsed ${className}`}>
        <button
          className="property-panel-toggle"
          onClick={onToggleVisibility}
          aria-label="Show Properties Panel"
          title="Show Properties Panel"
        >
          <Settings size={20} />
          <span className="toggle-hint">Properties</span>
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
      label: 'Style',
      icon: <Palette size={16} />,
      badge: selectedElements.length > 1 ? selectedElements.length : undefined,
      content: (
        <StyleControls
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
          {selectedElements.length > 1 && (
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
            <ChevronRight size={20} />
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