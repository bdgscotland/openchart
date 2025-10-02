// Command System - Professional undo/redo for OpenChart

// Legacy diagram-based commands (for backward compatibility)
export * from './Command';
export * from './CommandManager';
export * from './BulkStyleCommand';

// New React Flow-based commands
export * from './ReactFlowCommand';
export * from './CreateNodeCommand';
export * from './DeleteNodeCommand';
export * from './DeleteNodesCommand';
export * from './PasteNodesCommand';
export * from './MoveNodeCommand';
export * from './ResizeNodeCommand';
export * from './UpdateStyleCommand';
export * from './UpdateTextCommand';
export * from './CreateEdgeCommand';
export * from './DeleteEdgeCommand';
export * from './UpdateEdgeStyleCommand';
export * from './ChangeLayerCommand';
export * from './ZOrderCommand';
export * from './BulkOperationCommand';

// Re-export commonly used classes
export {
  AddElementCommand,
  RemoveElementsCommand,
  MoveElementCommand,
  ResizeElementCommand,
  UpdateElementCommand,
} from './Command';

export {
  CommandManager,
  globalCommandManager,
  KeyboardShortcuts,
} from './CommandManager';

export {
  BulkStyleCommand,
  AlignElementsCommand,
  DistributeElementsCommand,
  type BulkStyleUpdate,
  type AlignmentOperation,
  type DistributionOperation,
} from './BulkStyleCommand';