// OpenChart Schema Module
// This module provides everything needed to work with OpenChart diagram schemas

// Type definitions
export * from '../../types/diagram';

// Factory functions for creating diagrams and elements
export * from './diagram-factory';

// Validation utilities
export * from './diagram-validator';

// Example diagrams
export * from './examples';

// Re-export commonly used functions
export {
  createNewDiagram,
  createRectangle,
  createCircle,
  createDiamond,
  createArrow,
  createTextElement,
  createConnection,
  addElementToDiagram,
  removeElementFromDiagram,
  addConnectionToDiagram,
  removeConnectionFromDiagram,
  updateDiagramTimestamp,
} from './diagram-factory';

export {
  validateDiagramSchema,
  checkForDuplicateIds,
  findOrphanedConnections,
} from './diagram-validator';