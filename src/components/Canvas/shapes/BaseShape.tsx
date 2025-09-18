import React, { useCallback, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export interface BaseShapeProps extends NodeProps {
  data: {
    label?: string;
    shape: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
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
}> = ({ data, selected, children, shapeConfig = {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    data.onTextChange?.(text);
  }, [text, data]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.onTextChange?.(text);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(data.label || '');
    }
  }, [text, data]);

  const defaultConfig: ShapeConfig = {
    width: data.width || 120,
    height: data.height || 80,
    backgroundColor: data.backgroundColor || '#f0f9ff',
    borderColor: selected ? '#0066ff' : '#d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...shapeConfig
  };

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
      <div style={{ textAlign: 'center', fontSize: '14px', userSelect: 'none', color: '#1f2937' }}>
        {data.label || 'Shape'}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Connection handles - single handles that act as both source and target */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        style={{ 
          background: '#555',
          width: '8px',
          height: '8px',
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        style={{ 
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        style={{ 
          background: '#555',
          width: '8px',
          height: '8px',
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={{ 
          background: '#555',
          width: '8px',
          height: '8px',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} 
      />
      
      {/* Target handles for connections */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target-top"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: '8px',
          height: '8px',
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target-left"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: '8px',
          height: '8px',
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%)'
        }} 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="target-right"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: '8px',
          height: '8px',
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)'
        }} 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="target-bottom"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: '8px',
          height: '8px',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} 
      />
      
      {/* Shape content with config applied */}
      <div 
        onDoubleClick={handleDoubleClick}
        style={{
          width: defaultConfig.width,
          height: defaultConfig.height,
          backgroundColor: defaultConfig.backgroundColor,
          border: `2px solid ${defaultConfig.borderColor}`,
          borderRadius: defaultConfig.borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: defaultConfig.cursor,
          transition: defaultConfig.transition,
          ...shapeConfig
        }}
      >
        {children || renderContent()}
      </div>
    </div>
  );
};

export default BaseShape;