import { useCallback } from 'react';
import type { Node, Edge, Connection } from 'reactflow';

interface UseShapeHandlersOptions {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

export const useShapeHandlers = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange 
}: UseShapeHandlersOptions) => {

  const handleTextChange = useCallback((nodeId: string, text: string) => {
    onNodesChange(
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, label: text } }
          : node
      )
    );
  }, [nodes, onNodesChange]);

  const handleNodeResize = useCallback((nodeId: string, width: number, height: number) => {
    onNodesChange(
      nodes.map(node => 
        node.id === nodeId 
          ? { 
              ...node, 
              data: { ...node.data, width, height },
              style: { ...node.style, width, height }
            }
          : node
      )
    );
  }, [nodes, onNodesChange]);

  const handleConnect = useCallback((connection: Connection) => {
    console.log('🔗 handleConnect called with:', connection);
    
    if (!connection.source || !connection.target) {
      console.log('🚫 Missing source or target');
      return;
    }

    const newEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'default',
      markerEnd: { type: 'arrow' }
    };
    console.log('🔗 Creating edge:', newEdge);
    
    // Add the new edge to the existing edges array
    const updatedEdges = [...edges, newEdge];
    console.log('🔗 Updated edges array:', updatedEdges);
    onEdgesChange(updatedEdges);
  }, [edges, onEdgesChange]);

  const handleDeleteNodes = useCallback((nodeIds: string[]) => {
    // Remove nodes
    const filteredNodes = nodes.filter(node => !nodeIds.includes(node.id));
    onNodesChange(filteredNodes);

    // Remove edges connected to deleted nodes
    const filteredEdges = edges.filter(edge => 
      !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
    );
    onEdgesChange(filteredEdges);
  }, [nodes, edges, onNodesChange, onEdgesChange]);

  const handleDuplicateNodes = useCallback((nodeIds: string[]) => {
    const nodesToDuplicate = nodes.filter(node => nodeIds.includes(node.id));
    const duplicatedNodes = nodesToDuplicate.map(node => ({
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      selected: false,
    }));

    onNodesChange([...nodes.map(n => ({ ...n, selected: false })), ...duplicatedNodes]);
  }, [nodes, onNodesChange]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    // Context menu logic can be handled by parent component
    return { x: event.clientX, y: event.clientY, nodeId: node.id };
  }, []);

  return {
    handleTextChange,
    handleNodeResize,
    handleConnect,
    handleDeleteNodes,
    handleDuplicateNodes,
    handleNodeContextMenu,
  };
};

export default useShapeHandlers;