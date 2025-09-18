import React, { useCallback, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { BaseShapeProps } from './BaseShape';

type PolygonType = 'pentagon' | 'hexagon' | 'star';

const POLYGON_POINTS: Record<PolygonType, string> = {
  pentagon: "50,10 85,35 70,85 30,85 15,35",
  hexagon: "30,10 70,10 90,50 70,90 30,90 10,50", 
  star: "50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40"
};

export const PolygonShape: React.FC<BaseShapeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const polygonType = data.shape as PolygonType;
  const points = POLYGON_POINTS[polygonType] || POLYGON_POINTS.pentagon;

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
      <div style={{ textAlign: 'center', fontSize: '14px', userSelect: 'none', color: '#1f2937' }}>
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
      
      {/* Polygon shape using SVG */}
      <div style={{
        width: data.width || 120,
        height: data.height || 80,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon 
            points={points}
            fill={data.backgroundColor || '#f0f9ff'}
            stroke={selected ? '#0066ff' : '#d1d5db'}
            strokeWidth="2"
          />
        </svg>
        <div style={{ position: 'absolute' }}>
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

export default PolygonShape;