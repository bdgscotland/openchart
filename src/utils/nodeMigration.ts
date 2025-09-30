import type { Node } from '@xyflow/react';

/**
 * Migration utility to ensure nodes have proper React Flow dimensions for edge connections
 * This fixes issues where existing shapes don't have proper edge connection points
 */

export interface NodeDimensionInfo {
  width: number;
  height: number;
  source: 'data' | 'style' | 'defaults';
}

/**
 * Extract dimensions from a node, checking multiple sources
 */
export function extractNodeDimensions(node: Node): NodeDimensionInfo {
  // Priority order: data.width/height -> style.width/height -> defaults

  if (node.data?.width && node.data?.height) {
    return {
      width: Number(node.data.width),
      height: Number(node.data.height),
      source: 'data'
    };
  }

  if (node.style?.width && node.style?.height) {
    return {
      width: typeof node.style.width === 'number' ? node.style.width : parseInt(String(node.style.width), 10),
      height: typeof node.style.height === 'number' ? node.style.height : parseInt(String(node.style.height), 10),
      source: 'style'
    };
  }

  // Fallback defaults based on shape type
  const shapeType = node.data?.shape || 'rectangle';
  let defaultWidth = 120;
  let defaultHeight = 80;

  // Shape-specific defaults (matching the SHAPE_REGISTRY in shapes/index.ts)
  switch (shapeType) {
    case 'circle':
      defaultWidth = defaultHeight = 100;
      break;
    case 'diamond':
    case 'triangle':
      defaultWidth = defaultHeight = 120;
      break;
    case 'line':
      defaultWidth = 100;
      defaultHeight = 2;
      break;
    case 'cross':
      defaultWidth = defaultHeight = 60;
      break;
    default:
      defaultWidth = 120;
      defaultHeight = 80;
  }

  return {
    width: defaultWidth,
    height: defaultHeight,
    source: 'defaults'
  };
}

/**
 * Check if a node has proper React Flow dimensions for edge connections
 */
export function needsDimensionMigration(node: Node): boolean {
  // A node needs migration if it's missing any of these React Flow properties
  return !node.width || !node.height || !node.measured;
}

/**
 * Migrate a single node to have proper React Flow dimensions
 */
export function migrateNodeDimensions(node: Node): Node {
  if (!needsDimensionMigration(node)) {
    return node; // No migration needed
  }

  const dimensions = extractNodeDimensions(node);

  console.log(`🔧 Migrating node ${node.id} dimensions:`, {
    id: node.id,
    shape: node.data?.shape,
    dimensions,
    hadReactFlowDimensions: !!node.width && !!node.height,
    hadMeasured: !!node.measured
  });

  // Create migrated node with proper React Flow dimensions
  const migratedNode: Node = {
    ...node,
    // CRITICAL: Set React Flow node-level dimensions for proper edge connections
    width: dimensions.width,
    height: dimensions.height,
    // CRITICAL: Set measured to force React Flow to use our dimensions for edge calculations
    measured: {
      width: dimensions.width,
      height: dimensions.height
    },
    data: {
      ...node.data,
      // Ensure data dimensions are also set for component consistency
      width: dimensions.width,
      height: dimensions.height,
      // Add migration timestamp for debugging
      migrationTimestamp: Date.now(),
    }
  };

  return migratedNode;
}

/**
 * Migrate multiple nodes to have proper React Flow dimensions
 */
export function migrateAllNodeDimensions(nodes: Node[]): Node[] {
  // Safety check: handle undefined/null/empty arrays
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }

  const migratedNodes = nodes.map(migrateNodeDimensions);

  const migrationCount = migratedNodes.filter((_, index) =>
    needsDimensionMigration(nodes[index])
  ).length;

  if (migrationCount > 0) {
    console.log(`🔧 Migrated ${migrationCount} out of ${nodes.length} nodes for proper edge connections`);
  }

  return migratedNodes;
}

/**
 * Utility to check if any nodes in an array need migration
 */
export function hasNodesThatNeedMigration(nodes: Node[]): boolean {
  // Safety check: handle undefined/null/empty arrays
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return false;
  }
  return nodes.some(needsDimensionMigration);
}

/**
 * Get migration statistics for debugging
 */
export function getMigrationStats(nodes: Node[]): {
  total: number;
  needsMigration: number;
  hasDimensions: number;
  hasMeasured: number;
  missingBoth: number;
} {
  const stats = {
    total: nodes.length,
    needsMigration: 0,
    hasDimensions: 0,
    hasMeasured: 0,
    missingBoth: 0
  };

  nodes.forEach(node => {
    if (needsDimensionMigration(node)) {
      stats.needsMigration++;
    }

    if (node.width && node.height) {
      stats.hasDimensions++;
    }

    if (node.measured) {
      stats.hasMeasured++;
    }

    if (!node.width && !node.height && !node.measured) {
      stats.missingBoth++;
    }
  });

  return stats;
}

/**
 * Debug function to log migration information for a set of nodes
 */
export function debugNodeMigration(nodes: Node[], label = 'Nodes'): void {
  const stats = getMigrationStats(nodes);

  console.group(`🔧 Node Migration Debug: ${label}`);
  console.log('Migration Statistics:', stats);

  if (stats.needsMigration > 0) {
    console.log('Nodes that need migration:');
    nodes.filter(needsDimensionMigration).forEach(node => {
      const dimensions = extractNodeDimensions(node);
      console.log(`  - ${node.id} (${node.data?.shape}):`, {
        hasWidth: !!node.width,
        hasHeight: !!node.height,
        hasMeasured: !!node.measured,
        dimensions,
      });
    });
  }

  console.groupEnd();
}