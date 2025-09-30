/**
 * Context-Aware Style Controls
 *
 * A modern replacement for StyleControls that uses the new section-based
 * architecture with intelligent context awareness for different selection types.
 */

import React, { useMemo } from 'react';
import { Layout, Palette, Type, Info } from 'lucide-react';
import { PropertyProvider } from './PropertyContext';
import { VisualSection, LayoutSection, TypographySection, LayerSection } from './sections';
import { memoizedAnalyzeSelection } from './utils/selectionContext';
import type {
  DiagramElement,
  ElementStyle,
} from '../../types/diagram';
import type { BulkStyleUpdate, AlignmentOperation, DistributionOperation } from '../../core/commands/BulkStyleCommand';
import './ContextAwareStyleControls.css';

export interface ContextAwareStyleControlsProps {
  selectedElements: DiagramElement[];
  allElements?: DiagramElement[];
  onUpdateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyle>) => void;
  onUpdateElementText: (elementId: string, text: string) => void;
  onUpdateElementPosition: (elementId: string, x: number, y: number) => void;
  onUpdateElementSize: (elementId: string, width: number, height: number) => void;

  // Bulk operations (optional - preserved for compatibility)
  onBulkStyleUpdate?: (update: BulkStyleUpdate) => void;
  onAlignElements?: (operation: AlignmentOperation) => void;
  onDistributeElements?: (operation: DistributionOperation) => void;
  onFindAndReplaceText?: (searchText: string, replaceText: string, matchCase?: boolean) => void;
  onCopyStyleToElements?: (sourceElementId: string, targetElementIds: string[]) => void;
}

/**
 * No Selection Placeholder Component
 */
const NoSelectionPlaceholder: React.FC = React.memo(() => (
  <div className="no-selection-placeholder">
    <div className="placeholder-content">
      <Layout size={48} />
      <h3>No Selection</h3>
      <p>Select shapes, text, or connections to edit their properties.</p>
      <div className="placeholder-tips">
        <div className="tip">
          <Palette size={16} />
          <span>Visual properties: colors, borders, effects</span>
        </div>
        <div className="tip">
          <Layout size={16} />
          <span>Layout properties: size, position, alignment</span>
        </div>
        <div className="tip">
          <Type size={16} />
          <span>Typography: fonts, text formatting</span>
        </div>
      </div>
    </div>
  </div>
));

/**
 * Selection Info Component - shows what's selected
 */
interface SelectionInfoProps {
  context: ReturnType<typeof memoizedAnalyzeSelection>;
}

const SelectionInfo: React.FC<SelectionInfoProps> = React.memo(({ context }) => {
  const { selectedElements, selectionType, hasShapes, hasEdges, hasText, isMixed } = context;

  const selectionDescription = useMemo((): string => {
    if (selectionType === 'single') {
      const element = selectedElements[0];
      if (hasEdges) return 'Connection selected';
      if (hasText) return 'Text element selected';
      return `${element.type || 'Shape'} selected`;
    }

    if (isMixed) {
      const types = [];
      if (hasShapes) types.push('shapes');
      if (hasEdges) types.push('connections');
      if (hasText) types.push('text');
      return `${selectedElements.length} items selected (${types.join(', ')})`;
    }

    if (hasEdges) return `${selectedElements.length} connections selected`;
    if (hasText) return `${selectedElements.length} text elements selected`;
    return `${selectedElements.length} shapes selected`;
  }, [selectedElements, selectionType, hasShapes, hasEdges, hasText, isMixed]);

  if (selectionType === 'none') return null;

  return (
    <div className="selection-info">
      <Info size={14} />
      <span>{selectionDescription}</span>
    </div>
  );
});

/**
 * Context-Aware Style Controls Component
 */
export const ContextAwareStyleControls: React.FC<ContextAwareStyleControlsProps> = React.memo(({
  selectedElements,
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
}) => {
  // Analyze selection context to determine what to show
  const selectionContext = useMemo(
    () => memoizedAnalyzeSelection(selectedElements),
    [selectedElements]
  );

  const {
    selectionType,
    showVisualSection,
    showLayoutSection,
    showTypographySection,
    hasEdges,
    hasShapes,
    hasText,
    isMixed
  } = selectionContext;

  // Create stable callback references to prevent unnecessary re-renders
  const stableCallbacks = useMemo(() => ({
    onUpdateElementStyle,
    onUpdateElementText,
    onUpdateElementPosition,
    onUpdateElementSize,
    onBulkStyleUpdate: onBulkStyleUpdate || (() => {}),
    onAlignElements: onAlignElements || (() => {}),
    onDistributeElements: onDistributeElements || (() => {}),
    onFindAndReplaceText: onFindAndReplaceText || (() => {}),
    onCopyStyleToElements: onCopyStyleToElements || (() => {}),
  }), [
    onUpdateElementStyle,
    onUpdateElementText,
    onUpdateElementPosition,
    onUpdateElementSize,
    onBulkStyleUpdate,
    onAlignElements,
    onDistributeElements,
    onFindAndReplaceText,
    onCopyStyleToElements,
  ]);

  // If no selection, show placeholder
  if (selectionType === 'none') {
    return <NoSelectionPlaceholder />;
  }

  return (
    <div className="context-aware-style-controls">
      <SelectionInfo context={selectionContext} />

      <PropertyProvider
        selectedElements={selectedElements}
        onUpdateElementStyle={stableCallbacks.onUpdateElementStyle}
        onUpdateElementText={stableCallbacks.onUpdateElementText}
        onUpdateElementPosition={stableCallbacks.onUpdateElementPosition}
        onUpdateElementSize={stableCallbacks.onUpdateElementSize}
      >
        <div className="property-sections">
          {/* Layer Section - show for all selections */}
          <div className="property-section-container">
            <LayerSection />
          </div>

          {/* Visual Section - show for all selections, but adapt content */}
          {showVisualSection && (
            <div className="property-section-container">
              <VisualSection />
            </div>
          )}

          {/* Layout Section - show for shapes and single text elements */}
          {showLayoutSection && (
            <div className="property-section-container">
              <LayoutSection />
            </div>
          )}

          {/* Typography Section - show when text is relevant */}
          {showTypographySection && (
            <div className="property-section-container">
              <TypographySection />
            </div>
          )}

          {/* Edge-only selection gets helpful info */}
          {hasEdges && !hasShapes && !hasText && (
            <div className="edge-info-section">
              <div className="edge-info-content">
                <h4>Connection Properties</h4>
                <p>
                  Connections are automatically positioned between shapes.
                  You can adjust visual properties like color and line width above.
                </p>
                {selectedElements.length === 1 && (
                  <div className="edge-details">
                    <small>
                      From: {selectedElements[0].properties?.source} →
                      To: {selectedElements[0].properties?.target}
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mixed selection gets additional context */}
          {isMixed && (
            <div className="mixed-selection-info">
              <div className="mixed-info-content">
                <h4>Mixed Selection</h4>
                <p>
                  Properties shown apply to compatible elements in your selection.
                  Some properties may not affect all selected items.
                </p>
                <div className="selection-breakdown">
                  {hasShapes && <span className="selection-type">Shapes</span>}
                  {hasEdges && <span className="selection-type">Connections</span>}
                  {hasText && <span className="selection-type">Text</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </PropertyProvider>
    </div>
  );
});

// Add display name for debugging
ContextAwareStyleControls.displayName = 'ContextAwareStyleControls';

export default ContextAwareStyleControls;