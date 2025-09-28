// Enhanced Edge Components for OpenChart

export { CustomDashedEdge } from './CustomDashedEdge';
export { CustomCurvedEdge } from './CustomCurvedEdge';
export { CustomArrowEdge } from './CustomArrowEdge';

// Edge type registry for React Flow

export const edgeTypes = {
  // Using React Flow's built-in edge types for now
  // Custom edge components will be re-enabled once positioning issues are resolved
  // 'straight': CustomArrowEdge,      // For straight connections
  // 'bezier': CustomCurvedEdge,       // For curved connections
  // 'smoothstep': CustomDashedEdge,   // For step connections (handles all curve styles)

  // Legacy custom edge types (disabled)
  // 'custom-dashed': CustomDashedEdge,
  // 'custom-dotted': CustomDashedEdge,
  // 'custom-curved': CustomCurvedEdge,
  // 'custom-arrow': CustomArrowEdge,
};