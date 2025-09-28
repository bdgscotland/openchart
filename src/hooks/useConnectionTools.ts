import { useState, useCallback, useMemo } from 'react';
import type { Connection } from '@xyflow/react';
import type { EdgeStyleConfig, ConnectionToolConfig } from '../types/edgeTypes';
import { CONNECTION_TOOLS, DEFAULT_EDGE_STYLE } from '../types/edgeTypes';

interface UseConnectionToolsProps {
  onConnect?: (connection: Connection & { edgeStyle?: EdgeStyleConfig }) => void;
}

export function useConnectionTools({ onConnect }: UseConnectionToolsProps = {}) {
  const [selectedToolId, setSelectedToolId] = useState<string>('straight-solid');
  const [currentStyle, setCurrentStyle] = useState<EdgeStyleConfig>(DEFAULT_EDGE_STYLE);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionPreview, setConnectionPreview] = useState<{
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  } | null>(null);

  // Get the currently selected tool
  const selectedTool = useMemo(() => {
    return CONNECTION_TOOLS.find(tool => tool.id === selectedToolId) || CONNECTION_TOOLS[0];
  }, [selectedToolId]);

  // Handle tool selection
  const handleToolSelect = useCallback((toolId: string) => {
    const tool = CONNECTION_TOOLS.find(t => t.id === toolId);
    if (tool) {
      setSelectedToolId(toolId);
      setCurrentStyle(tool.style);
    }
  }, []);

  // Handle style changes
  const handleStyleChange = useCallback((newStyle: EdgeStyleConfig) => {
    setCurrentStyle(newStyle);
  }, []);

  // Enhanced connection handler that includes style
  const handleConnect = useCallback((connection: Connection) => {
    const enhancedConnection = {
      ...connection,
      edgeStyle: currentStyle
    };

    onConnect?.(enhancedConnection);
  }, [currentStyle, onConnect]);

  // Connection state management
  const startConnection = useCallback((sourceX: number, sourceY: number) => {
    setIsConnecting(true);
    setConnectionPreview({ sourceX, sourceY, targetX: sourceX, targetY: sourceY });
  }, []);

  const updateConnectionPreview = useCallback((targetX: number, targetY: number) => {
    if (isConnecting && connectionPreview) {
      setConnectionPreview(prev => prev ? { ...prev, targetX, targetY } : null);
    }
  }, [isConnecting, connectionPreview]);

  const endConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionPreview(null);
  }, []);

  // Get connection cursor style based on selected tool
  const getConnectionCursor = useCallback(() => {
    switch (selectedTool.edgeType) {
      case 'bezier':
      case 'custom-curved':
        return 'alias';
      case 'smoothstep':
        return 'cell';
      case 'custom-dashed':
      case 'custom-dotted':
        return 'crosshair';
      default:
        return 'copy';
    }
  }, [selectedTool]);

  // Get visual feedback for connection points
  const getConnectionFeedback = useCallback((isValidTarget: boolean, isHovering: boolean) => {
    if (!isConnecting) return null;

    return {
      cursor: getConnectionCursor(),
      className: `connection-feedback ${isValidTarget ? 'valid' : 'invalid'} ${isHovering ? 'hovering' : ''}`,
      style: {
        borderColor: isValidTarget ? '#10b981' : '#ef4444',
        backgroundColor: isValidTarget
          ? 'rgba(16, 185, 129, 0.1)'
          : 'rgba(239, 68, 68, 0.1)'
      }
    };
  }, [isConnecting, getConnectionCursor]);

  return {
    selectedToolId,
    selectedTool,
    currentStyle,
    isConnecting,
    connectionPreview,
    handleToolSelect,
    handleStyleChange,
    handleConnect,
    startConnection,
    updateConnectionPreview,
    endConnection,
    getConnectionCursor,
    getConnectionFeedback,
    availableTools: CONNECTION_TOOLS
  };
}