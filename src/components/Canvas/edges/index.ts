// Enhanced Edge Components for OpenChart

import { CustomDashedEdge } from './CustomDashedEdge';
import { CustomCurvedEdge } from './CustomCurvedEdge';
import { CustomArrowEdge } from './CustomArrowEdge';

export { CustomDashedEdge, CustomCurvedEdge, CustomArrowEdge };

// Edge type registry for React Flow
// Re-enabled custom edge types to support edge styling (colors, labels, line styles, markers)
export const edgeTypes = {
  // Default edge type that supports all styling features
  'default': CustomCurvedEdge,

  // Specific edge types for different connection styles
  'straight': CustomCurvedEdge,
  'bezier': CustomCurvedEdge,
  'smoothstep': CustomCurvedEdge,

  // Legacy custom edge types
  'custom-dashed': CustomCurvedEdge,
  'custom-dotted': CustomCurvedEdge,
  'custom-curved': CustomCurvedEdge,
  'custom-arrow': CustomCurvedEdge,
};