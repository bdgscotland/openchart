import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Box } from 'lucide-react';
import './BoundedContextContainer.css';

export interface BoundedContextData {
  label: string;
  description?: string;
  color?: string;
  layerId?: string;
}

/**
 * Bounded Context Container
 * A visual frame/box for grouping Event Storm stickies into bounded contexts
 * Typically used in Software Design phase (Phase 3)
 */
export function BoundedContextContainer({ data, selected, id }: NodeProps<BoundedContextData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Bounded Context');
  const { setNodes } = useReactFlow();

  const updateNodeLabel = useCallback((newLabel: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    updateNodeLabel(label);
  }, [label, updateNodeLabel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      updateNodeLabel(label);
    }
    if (e.key === 'Escape') {
      setLabel(data.label || 'Bounded Context');
      setIsEditing(false);
    }
  }, [data.label, label, updateNodeLabel]);

  const containerColor = data.color || '#E8F4FD';
  const borderColor = data.color ? `${data.color}CC` : '#3B82F6';

  return (
    <>
      {/* Connection handles - hidden but functional */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <div
        className={`bounded-context-container ${selected ? 'selected' : ''}`}
        style={{
          backgroundColor: containerColor,
          borderColor: borderColor,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Header with icon and title */}
        <div className="context-header">
          <Box size={16} className="context-icon" />
          {isEditing ? (
            <input
              type="text"
              className="context-title-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <h3 className="context-title">{label}</h3>
          )}
        </div>

        {/* Description if provided */}
        {data.description && !isEditing && (
          <div className="context-description">{data.description}</div>
        )}

        {/* Hint text when empty */}
        {!isEditing && !data.description && (
          <div className="context-hint">
            Double-click to edit • Drag Event Storm stickies inside this boundary
          </div>
        )}
      </div>
    </>
  );
}

export default BoundedContextContainer;
