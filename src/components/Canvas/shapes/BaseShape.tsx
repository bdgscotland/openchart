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
      {/* Simplified connection handles - each acts as both source and target */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        isConnectable={true}
        style={{ 
          background: '#555',
          width: '10px',
          height: '10px',
          top: '-5px',
          left: '50%',
          transform: 'translateX(-50%)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        isConnectable={true}
        style={{ 
          background: '#555',
          width: '10px',
          height: '10px',
          left: '-5px',
          top: '50%',
          transform: 'translateY(-50%)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        isConnectable={true}
        style={{ 
          background: '#555',
          width: '10px',
          height: '10px',
          right: '-5px',
          top: '50%',
          transform: 'translateY(-50%)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        isConnectable={true}
        style={{ 
          background: '#555',
          width: '10px',
          height: '10px',
          bottom: '-5px',
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