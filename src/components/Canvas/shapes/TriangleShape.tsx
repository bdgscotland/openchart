import React, { useCallback, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { BaseShapeProps } from './BaseShape';

export const TriangleShape: React.FC<BaseShapeProps> = ({ data, selected }) => {
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
      <div style={{ textAlign: 'center', fontSize: '12px', userSelect: 'none', color: '#1f2937' }}>
        {data.label || 'Shape'}
      </div>
    );
  };

  return (
    <div onDoubleClick={handleDoubleClick}>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Right} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Bottom} style={{ background: '#555' }} />
      
      {/* Triangle shape using CSS borders */}
      <div style={{ 
        width: 0, 
        height: 0, 
        borderLeft: `${(data.width || 120) / 2}px solid transparent`,
        borderRight: `${(data.width || 120) / 2}px solid transparent`,
        borderBottom: `${data.height || 80}px solid ${data.backgroundColor || '#f0f9ff'}`,
        position: 'relative',
        filter: selected ? 'drop-shadow(0 0 0 2px #0066ff)' : 'drop-shadow(0 0 0 1px #d1d5db)',
      }}>
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          whiteSpace: 'nowrap',
        }}>
          {renderContent()}
        </div>
      </div>
      
      <Handle type="source" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default TriangleShape;