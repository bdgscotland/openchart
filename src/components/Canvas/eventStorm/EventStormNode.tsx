// Event Storm Sticky Note Component
import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Calendar, User, HelpCircle, Zap, GitBranch, Database, Box, Server, Monitor, AlertCircle } from 'lucide-react';
import type { EventStormNodeData } from '../../../types/eventStorm';
import './EventStormNode.css';

/**
 * Get icon component for sticky type
 */
function getStickyIcon(stickyType: string): React.ReactNode {
  const iconProps = { size: 16, strokeWidth: 2 };

  switch (stickyType) {
    case 'event':
      return <Calendar {...iconProps} />;
    case 'actor':
      return <User {...iconProps} />;
    case 'question':
      return <HelpCircle {...iconProps} />;
    case 'command':
      return <Zap {...iconProps} />;
    case 'policy':
      return <GitBranch {...iconProps} />;
    case 'readmodel':
      return <Database {...iconProps} />;
    case 'aggregate':
      return <Box {...iconProps} />;
    case 'external':
      return <Server {...iconProps} />;
    case 'ui':
      return <Monitor {...iconProps} />;
    case 'hotspot':
      return <AlertCircle {...iconProps} />;
    default:
      return <Calendar {...iconProps} />;
  }
}

/**
 * Event Storm Sticky Note Node Component
 */
export function EventStormNode({ data, selected, id }: NodeProps<EventStormNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const { setNodes } = useReactFlow();

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

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
      setLabel(data.label); // Reset to original
      setIsEditing(false);
    }
  }, [data.label, label, updateNodeLabel]);

  // Calculate rotation (slight random tilt for sticky note effect)
  const rotation = data.sequenceNumber
    ? (data.sequenceNumber % 3 - 1) * 2 // -2, 0, or 2 degrees based on sequence
    : 0;

  return (
    <>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <div
        className={`event-storm-sticky sticky-${data.stickyType} ${selected ? 'selected' : ''} ${
          data.confidence ? `confidence-${data.confidence}` : ''
        }`}
        style={{
          backgroundColor: data.color,
          transform: `rotate(${rotation}deg)`,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Sticky Type Icon */}
        <div className="sticky-icon">
          {getStickyIcon(data.stickyType)}
        </div>

        {/* Label (editable) */}
        {isEditing ? (
          <textarea
            className="sticky-label-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={3}
          />
        ) : (
          <div className="sticky-label">{data.label || 'Double-click to edit'}</div>
        )}

        {/* Metadata Footer */}
        <div className="sticky-footer">
          {/* Aggregate Name */}
          {data.aggregateName && (
            <div className="sticky-aggregate">
              <Box size={12} />
              <span>{data.aggregateName}</span>
            </div>
          )}

          {/* Sequence Number */}
          {data.sequenceNumber !== undefined && (
            <div className="sticky-sequence">#{data.sequenceNumber}</div>
          )}
        </div>

        {/* Status Indicator */}
        {data.status && (
          <div className={`sticky-status status-${data.status}`} title={data.status} />
        )}

        {/* Concern Badge (for questions) */}
        {data.stickyType === 'question' && data.concerns && (
          <div className="sticky-concerns-badge" title={data.concerns}>
            <AlertCircle size={16} />
          </div>
        )}
      </div>
    </>
  );
}

export default EventStormNode;
