import { useCallback, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';

export interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

export interface UseClipboardOptions {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

export const useClipboard = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: UseClipboardOptions) => {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);

  /**
   * Copy selected nodes and their connected edges to clipboard
   */
  const copySelection = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);

    if (selectedNodes.length === 0) {
      console.log('📋 Copy: No nodes selected');
      return false;
    }

    const selectedNodeIds = new Set(selectedNodes.map(node => node.id));

    // Find edges that connect selected nodes
    const connectedEdges = edges.filter(edge =>
      selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    const clipboardContent: ClipboardData = {
      nodes: selectedNodes.map(node => ({
        ...node,
        selected: false, // Clear selection on copied nodes
      })),
      edges: connectedEdges,
      timestamp: Date.now(),
    };

    setClipboardData(clipboardContent);

    console.log(`📋 Copied ${selectedNodes.length} nodes and ${connectedEdges.length} edges to clipboard`);
    return true;
  }, [nodes, edges]);

  /**
   * Calculate smart offset for pasted elements to avoid overlapping
   */
  const calculateSmartOffset = useCallback((pastedNodes: Node[], existingNodes: Node[]) => {
    const pasteOffset = 50;
    let currentOffset = pasteOffset;

    // Get all existing positions
    const existingPositions = new Set(
      existingNodes.map(node => `${node.position.x},${node.position.y}`)
    );

    // Find a position that doesn't overlap with existing nodes
    while (currentOffset < 500) { // Max 10 attempts
      const hasOverlap = pastedNodes.some(node => {
        const newX = node.position.x + currentOffset;
        const newY = node.position.y + currentOffset;
        return existingPositions.has(`${newX},${newY}`);
      });

      if (!hasOverlap) {
        break;
      }

      currentOffset += pasteOffset;
    }

    return currentOffset;
  }, []);

  /**
   * Generate unique IDs for pasted elements while maintaining relationships
   */
  const generatePasteIds = useCallback((clipboardNodes: Node[], clipboardEdges: Edge[]) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);

    // Create mapping from old IDs to new IDs
    const idMapping = new Map<string, string>();

    clipboardNodes.forEach((node, index) => {
      const newId = `${node.id}_copy_${timestamp}_${random}_${index}`;
      idMapping.set(node.id, newId);
    });

    return { idMapping, timestamp, random };
  }, []);

  /**
   * Paste clipboard contents with smart positioning
   */
  const pasteSelection = useCallback(() => {
    if (!clipboardData || clipboardData.nodes.length === 0) {
      console.log('📋 Paste: No data in clipboard');
      return false;
    }

    const { idMapping, timestamp } = generatePasteIds(clipboardData.nodes, clipboardData.edges);
    const offset = calculateSmartOffset(clipboardData.nodes, nodes);

    // Create new nodes with updated IDs and positions
    const pastedNodes: Node[] = clipboardData.nodes.map(node => {
      const newId = idMapping.get(node.id)!;

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
        selected: true, // Select pasted nodes
        data: {
          ...node.data,
          // Ensure unique timestamps for any tracking
          lastUpdate: timestamp,
        },
      };
    });

    // Create new edges with updated source/target IDs
    const pastedEdges: Edge[] = clipboardData.edges.map((edge, index) => {
      const newSourceId = idMapping.get(edge.source);
      const newTargetId = idMapping.get(edge.target);

      // Only create edge if both source and target were copied
      if (!newSourceId || !newTargetId) {
        return null;
      }

      return {
        ...edge,
        id: `${edge.id}_copy_${timestamp}_${index}`,
        source: newSourceId,
        target: newTargetId,
      };
    }).filter((edge): edge is Edge => edge !== null);

    // Clear selection on existing nodes and add pasted nodes
    const updatedNodes = [
      ...nodes.map(node => ({ ...node, selected: false })),
      ...pastedNodes,
    ];

    // Add pasted edges to existing edges
    const updatedEdges = [...edges, ...pastedEdges];

    onNodesChange(updatedNodes);
    onEdgesChange(updatedEdges);

    console.log(`📋 Pasted ${pastedNodes.length} nodes and ${pastedEdges.length} edges with offset ${offset}px`);
    return true;
  }, [clipboardData, nodes, edges, onNodesChange, onEdgesChange, calculateSmartOffset, generatePasteIds]);

  /**
   * Duplicate selected elements (copy + paste in one operation)
   */
  const duplicateSelection = useCallback(() => {
    const copySuccess = copySelection();
    if (copySuccess) {
      // Small delay to ensure clipboard data is set
      setTimeout(() => {
        pasteSelection();
      }, 0);
      return true;
    }
    return false;
  }, [copySelection, pasteSelection]);

  /**
   * Check if clipboard has data
   */
  const hasClipboardData = useCallback(() => {
    return clipboardData !== null && clipboardData.nodes.length > 0;
  }, [clipboardData]);

  /**
   * Clear clipboard data
   */
  const clearClipboard = useCallback(() => {
    setClipboardData(null);
    console.log('📋 Clipboard cleared');
  }, []);

  /**
   * Get clipboard statistics for debugging
   */
  const getClipboardStats = useCallback(() => {
    if (!clipboardData) {
      return { nodes: 0, edges: 0, age: 0 };
    }

    return {
      nodes: clipboardData.nodes.length,
      edges: clipboardData.edges.length,
      age: Date.now() - clipboardData.timestamp,
    };
  }, [clipboardData]);

  return {
    copySelection,
    pasteSelection,
    duplicateSelection,
    hasClipboardData,
    clearClipboard,
    getClipboardStats,
    clipboardData,
  };
};

export default useClipboard;