/**
 * Selection Context Utilities
 *
 * Provides context-aware analysis of selected elements to determine
 * what property sections should be displayed and how they should behave.
 */

import type { DiagramElement } from '../../../types/diagram';

export type ElementType = 'shape' | 'edge' | 'text';
export type SelectionType = 'none' | 'single' | 'multiple' | 'mixed';

export interface SelectionContext {
  // Selection state
  selectionType: SelectionType;
  selectedElements: DiagramElement[];

  // Element type analysis
  elementTypes: ElementType[];
  hasShapes: boolean;
  hasEdges: boolean;
  hasText: boolean;
  isMixed: boolean;

  // Property availability
  showVisualSection: boolean;
  showLayoutSection: boolean;
  showTypographySection: boolean;

  // Section priorities (for responsive layouts)
  primarySections: string[];
  secondarySections: string[];
}

/**
 * Determines the element type based on the diagram element
 */
export function getElementType(element: DiagramElement): ElementType {
  // Edges are explicitly marked with type 'edge' or have source/target properties
  if (element.type === 'edge' ||
      (element.properties?.source && element.properties?.target)) {
    return 'edge';
  }

  // Text elements have minimal visual properties and focus on typography
  if (element.type === 'text') {
    return 'text';
  }

  // Everything else is considered a shape (rectangle, circle, diamond, etc.)
  return 'shape';
}

/**
 * Analyzes selected elements to determine what sections should be shown
 */
export function analyzeSelection(selectedElements: DiagramElement[]): SelectionContext {
  // Basic selection analysis
  const selectionType: SelectionType =
    selectedElements.length === 0 ? 'none' :
    selectedElements.length === 1 ? 'single' : 'multiple';

  // Analyze element types
  const elementTypes = selectedElements.map(getElementType);
  const uniqueTypes = [...new Set(elementTypes)];

  const hasShapes = elementTypes.includes('shape');
  const hasEdges = elementTypes.includes('edge');
  const hasText = elementTypes.includes('text');
  const isMixed = uniqueTypes.length > 1;

  // Determine section visibility
  const showVisualSection = selectedElements.length > 0;
  const showLayoutSection = hasShapes || (selectedElements.length === 1 && hasText);
  const showTypographySection = hasText ||
    (hasShapes && selectedElements.some(el => el.text && el.text.trim() !== ''));

  // Determine section priorities based on selection context
  let primarySections: string[] = [];
  let secondarySections: string[] = [];

  if (selectionType === 'none') {
    // No selection - show helpful content or diagram-level properties
    primarySections = [];
    secondarySections = [];
  } else if (hasText && !hasShapes && !hasEdges) {
    // Text-only selection - prioritize typography
    primarySections = ['typography'];
    secondarySections = ['visual', 'layout'];
  } else if (hasEdges && !hasShapes && !hasText) {
    // Edge-only selection - limited properties
    primarySections = ['visual'];
    secondarySections = [];
  } else if (hasShapes) {
    // Shape selection (with possible text) - standard priority
    primarySections = ['visual', 'layout'];
    secondarySections = showTypographySection ? ['typography'] : [];
  } else {
    // Mixed or other - show all relevant sections
    primarySections = [];
    if (showVisualSection) primarySections.push('visual');
    if (showLayoutSection) primarySections.push('layout');
    if (showTypographySection) secondarySections.push('typography');
  }

  return {
    selectionType,
    selectedElements,
    elementTypes,
    hasShapes,
    hasEdges,
    hasText,
    isMixed,
    showVisualSection,
    showLayoutSection,
    showTypographySection,
    primarySections,
    secondarySections
  };
}

/**
 * Checks if an element supports text editing
 */
export function supportsTextEditing(element: DiagramElement): boolean {
  // Edges with labels support text editing
  if (getElementType(element) === 'edge') {
    return true; // Edges can have labels
  }

  // Text elements obviously support text editing
  if (getElementType(element) === 'text') {
    return true;
  }

  // Shapes support text editing if they have text content
  return getElementType(element) === 'shape';
}

/**
 * Gets the appropriate properties for an element type
 */
export function getRelevantProperties(elementType: ElementType): {
  visual: string[];
  layout: string[];
  typography: string[];
} {
  switch (elementType) {
    case 'edge':
      return {
        visual: ['stroke', 'strokeWidth', 'opacity'],
        layout: [], // Edges have automatic layout
        typography: ['fontSize', 'fontFamily', 'color'] // For edge labels
      };

    case 'text':
      return {
        visual: ['color', 'opacity'],
        layout: ['size.width', 'size.height', 'position.x', 'position.y'],
        typography: [
          'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
          'textAlign', 'textDecoration', 'textTransform',
          'lineHeight', 'letterSpacing'
        ]
      };

    case 'shape':
    default:
      return {
        visual: [
          'fill', 'stroke', 'strokeWidth', 'opacity', 'cornerRadius'
        ],
        layout: [
          'size.width', 'size.height', 'position.x', 'position.y'
        ],
        typography: [
          'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
          'textAlign', 'color', 'textDecoration', 'textTransform',
          'lineHeight', 'letterSpacing'
        ]
      };
  }
}

/**
 * Memoized selection analysis to prevent unnecessary recalculations
 */
let lastElementIds: string = '';
let lastAnalysis: SelectionContext | null = null;

export function memoizedAnalyzeSelection(selectedElements: DiagramElement[]): SelectionContext {
  const currentElementIds = selectedElements.map(el => el.id).sort().join(',');

  if (currentElementIds === lastElementIds && lastAnalysis) {
    return lastAnalysis;
  }

  lastElementIds = currentElementIds;
  lastAnalysis = analyzeSelection(selectedElements);

  return lastAnalysis;
}