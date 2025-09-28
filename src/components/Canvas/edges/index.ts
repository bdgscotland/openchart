// Enhanced Edge Components for OpenChart

export { CustomDashedEdge } from './CustomDashedEdge';
export { CustomCurvedEdge } from './CustomCurvedEdge';
export { CustomArrowEdge } from './CustomArrowEdge';

// Edge type registry for React Flow
// Temporarily disabled custom edges to fix positioning issues
// import { CustomDashedEdge } from './CustomDashedEdge';
// import { CustomCurvedEdge } from './CustomCurvedEdge';
// import { CustomArrowEdge } from './CustomArrowEdge';

export const edgeTypes = {
  // Using React Flow's default edges for now
  // 'custom-dashed': CustomDashedEdge,
  // 'custom-dotted': CustomDashedEdge,
  // 'custom-curved': CustomCurvedEdge,
  // 'custom-arrow': CustomArrowEdge,
};