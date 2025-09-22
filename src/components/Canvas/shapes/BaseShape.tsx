import React, { useCallback, useRef, useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
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
}> = memo(({ data, selected, children, shapeConfig = {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, [text, debouncedTextChange]);

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

  console.log('🗚️ BaseShape render:', {
    id: data.label || 'Shape',
    hasStyleObject: !!data.style,
    stylesKeys: Object.keys(styles),
    selectedStyle: selected,
    backgroundColor: defaultConfig.backgroundColor,
    borderColor: defaultConfig.borderColor,
    opacity: styles.opacity
  });

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
    <div style={{ position: 'relative' }}>
      {/* Connection handles - unique IDs for source and target */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={true}
        style={{ backgroundColor: '#555' }}
      />
      
      {/* Shape content with config applied */}
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
    console.log('🔄 BaseShape FORCING re-render due to style change:', {
      id: prevProps.id || nextProps.id,
      styleChanged,
      keysChanged,
      prevStyleKeys,
      nextStyleKeys,
      changedProps: criticalStyleProps.filter(prop => prevStyle[prop] !== nextStyle[prop])
    });
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

  if (shouldRerender) {
    console.log('🔄 BaseShape re-rendering due to prop change:', {
      id: prevProps.id || nextProps.id,
      labelChanged: prevProps.data.label !== nextProps.data.label,
      sizeChanged: prevProps.data.width !== nextProps.data.width || prevProps.data.height !== nextProps.data.height,
      selectionChanged: prevProps.selected !== nextProps.selected
    });
  }

  return !shouldRerender; // Return false to re-render, true to skip
});

BaseShape.displayName = 'BaseShape';

export default BaseShape;