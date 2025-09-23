import React, { useCallback, useRef, useState, memo, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useDebounce } from '../../../hooks/useDebounce';

export interface BaseShapeProps extends NodeProps {
  data: {
    label?: string;
    shape: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
    style?: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string;
      fontStyle?: string;
      textAlign?: string;
      cornerRadius?: number;
      color?: string;
      [key: string]: any;
    };
    onTextChange?: (text: string) => void;
  };
}

export interface ShapeConfig {
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderRadius?: string;
  cursor: string;
  transition: string;
}

export const BaseShape: React.FC<BaseShapeProps & {
  children: React.ReactNode;
  shapeConfig?: Partial<ShapeConfig>;
}> = memo(({ data, selected, children, shapeConfig = {}, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const [isHovering, setIsHovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  // Debounce text changes to reduce excessive state updates
  const debouncedTextChange = useDebounce((newText: string) => {
    data.onTextChange?.(newText);
  }, 300);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    debouncedTextChange(text);
  }, [text, debouncedTextChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      debouncedTextChange(text);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(data.label || '');
    }
  }, [text, debouncedTextChange, data.label]);

  // Resize functionality
  const handleResizeStart = useCallback((handle: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = data.width || 120;
    const startHeight = data.height || 80;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Calculate new dimensions based on handle
      switch (handle) {
        case 'nw':
          newWidth = Math.max(60, startWidth - deltaX);
          newHeight = Math.max(40, startHeight - deltaY);
          break;
        case 'ne':
          newWidth = Math.max(60, startWidth + deltaX);
          newHeight = Math.max(40, startHeight - deltaY);
          break;
        case 'sw':
          newWidth = Math.max(60, startWidth - deltaX);
          newHeight = Math.max(40, startHeight + deltaY);
          break;
        case 'se':
          newWidth = Math.max(60, startWidth + deltaX);
          newHeight = Math.max(40, startHeight + deltaY);
          break;
      }

      // Update node dimensions
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  width: newWidth,
                  height: newHeight,
                },
              }
            : node
        )
      );
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [data.width, data.height, id, setNodes]);

  // Prevent drag when resizing
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nw-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // Get styles from data.style as the primary source of truth
  const styles = data.style || {};

  const defaultConfig: ShapeConfig = {
    width: data.width || 120,
    height: data.height || 80,
    // Primary style source: data.style, fallback to legacy data properties
    backgroundColor: styles.fill || data.backgroundColor || '#f0f9ff',
    // Selection always overrides stroke color
    borderColor: selected ? '#0066ff' : (styles.stroke || data.borderColor || '#d1d5db'),
    borderRadius: styles.cornerRadius ? `${styles.cornerRadius}px` : '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...shapeConfig
  };

  // Removed expensive console.log for better performance

  const renderContent = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            width: '100%',
            outline: 'none',
            fontSize: '14px',
            color: '#1f2937',
          }}
        />
      );
    }

    return (
      <div
        style={{
          textAlign: (styles.textAlign as any) || 'center',
          fontSize: styles.fontSize || 14,
          fontFamily: styles.fontFamily || 'Arial, sans-serif',
          fontWeight: styles.fontWeight || 'normal',
          fontStyle: styles.fontStyle || 'normal',
          userSelect: 'none',
          color: styles.color || '#1f2937',
          lineHeight: styles.lineHeight || 'normal',
          letterSpacing: styles.letterSpacing || 'normal',
          wordSpacing: styles.wordSpacing || 'normal',
          textDecoration: styles.textDecoration || 'none',
          textTransform: styles.textTransform || 'none',
        }}
      >
        {data.label || 'Shape'}
      </div>
    );
  };

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Enhanced Connection handles with smart indicators */}
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={true}
        style={{ 
          top: -8, 
          left: '50%', 
          transform: 'translateX(-50%)',
          opacity: isHovering || selected || isConnecting ? 1 : 0,
          transition: 'all 0.2s ease',
          background: isConnecting ? '#22c55e' : '#3b82f6',
          border: `2px solid ${isConnecting ? '#16a34a' : '#1e40af'}`,
          boxShadow: isConnecting ? '0 0 0 3px rgba(34, 197, 94, 0.3)' : '0 0 0 2px rgba(59, 130, 246, 0.2)',
        }}
        onMouseEnter={() => setIsConnecting(true)}
        onMouseLeave={() => setIsConnecting(false)}
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={true}
        style={{ 
          left: -8, 
          top: '50%', 
          transform: 'translateY(-50%)',
          opacity: isHovering || selected || isConnecting ? 1 : 0,
          transition: 'all 0.2s ease',
          background: isConnecting ? '#22c55e' : '#3b82f6',
          border: `2px solid ${isConnecting ? '#16a34a' : '#1e40af'}`,
          boxShadow: isConnecting ? '0 0 0 3px rgba(34, 197, 94, 0.3)' : '0 0 0 2px rgba(59, 130, 246, 0.2)',
        }}
        onMouseEnter={() => setIsConnecting(true)}
        onMouseLeave={() => setIsConnecting(false)}
      />

      {/* Right handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={true}
        style={{ 
          right: -8, 
          top: '50%', 
          transform: 'translateY(-50%)',
          opacity: isHovering || selected || isConnecting ? 1 : 0,
          transition: 'all 0.2s ease',
          background: isConnecting ? '#22c55e' : '#3b82f6',
          border: `2px solid ${isConnecting ? '#16a34a' : '#1e40af'}`,
          boxShadow: isConnecting ? '0 0 0 3px rgba(34, 197, 94, 0.3)' : '0 0 0 2px rgba(59, 130, 246, 0.2)',
        }}
        onMouseEnter={() => setIsConnecting(true)}
        onMouseLeave={() => setIsConnecting(false)}
      />

      {/* Bottom handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        style={{ 
          bottom: -8, 
          left: '50%', 
          transform: 'translateX(-50%)',
          opacity: isHovering || selected || isConnecting ? 1 : 0,
          transition: 'all 0.2s ease',
          background: isConnecting ? '#22c55e' : '#3b82f6',
          border: `2px solid ${isConnecting ? '#16a34a' : '#1e40af'}`,
          boxShadow: isConnecting ? '0 0 0 3px rgba(34, 197, 94, 0.3)' : '0 0 0 2px rgba(59, 130, 246, 0.2)',
        }}
        onMouseEnter={() => setIsConnecting(true)}
        onMouseLeave={() => setIsConnecting(false)}
      />

      {/* Enhanced Selection Indicators */}
      {selected && (
        <>
          {/* Selection outline */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              border: '2px solid #3b82f6',
              borderRadius: defaultConfig.borderRadius,
              pointerEvents: 'none',
              animation: 'pulse 2s infinite',
            }}
          />
          
          {/* Resize handles */}
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={handleResizeStart('nw')}
            style={{ cursor: 'nw-resize' }}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={handleResizeStart('ne')}
            style={{ cursor: 'ne-resize' }}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={handleResizeStart('sw')}
            style={{ cursor: 'sw-resize' }}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={handleResizeStart('se')}
            style={{ cursor: 'se-resize' }}
          />
        </>
      )}
      
      {/* Shape content with enhanced styling */}
      <div
        onDoubleClick={handleDoubleClick}
        style={{
          width: defaultConfig.width,
          height: defaultConfig.height,
          backgroundColor: defaultConfig.backgroundColor,
          border: `${styles.strokeWidth || 2}px solid ${defaultConfig.borderColor}`,
          borderRadius: defaultConfig.borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: defaultConfig.cursor,
          transition: defaultConfig.transition,
          opacity: styles.opacity !== undefined ? styles.opacity : 1,
          boxShadow: selected 
            ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
            : isHovering 
              ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
              : 'none',
          transform: isHovering && !selected ? 'translateY(-1px)' : 'translateY(0)',
          ...shapeConfig
        }}
      >
        {children || renderContent()}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  // CRITICAL: Detect style object changes to ensure re-renders
  const prevStyle = prevProps.data.style || {};
  const nextStyle = nextProps.data.style || {};

  // Deep comparison of style properties that affect rendering
  const criticalStyleProps = ['fill', 'stroke', 'strokeWidth', 'opacity', 'cornerRadius', 'fontSize', 'fontFamily', 'fontWeight', 'color'];
  const styleChanged = criticalStyleProps.some(prop => prevStyle[prop] !== nextStyle[prop]);

  // Also check if any new style properties were added
  const prevStyleKeys = Object.keys(prevStyle);
  const nextStyleKeys = Object.keys(nextStyle);
  const keysChanged = prevStyleKeys.length !== nextStyleKeys.length ||
    !prevStyleKeys.every(key => nextStyleKeys.includes(key));

  if (styleChanged || keysChanged) {
    // Removed expensive console.log for better performance
    return false; // Force re-render
  }

  // Check other critical props
  const shouldRerender = (
    prevProps.data.label !== nextProps.data.label ||
    prevProps.data.width !== nextProps.data.width ||
    prevProps.data.height !== nextProps.data.height ||
    prevProps.selected !== nextProps.selected ||
    prevProps.id !== nextProps.id
  );

  // Removed expensive console.log for better click performance

  return !shouldRerender; // Return false to re-render, true to skip
});

BaseShape.displayName = 'BaseShape';

export default BaseShape;