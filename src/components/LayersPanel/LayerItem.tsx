import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface LayerItemProps {
  node: Node;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onRename: (newName: string) => void;
  onOpacityChange: (opacity: number) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
}

export const LayerItem: React.FC<LayerItemProps> = ({
  node,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onOpacityChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.data?.label || node.id);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get layer properties
  const isVisible = node.data?.visible !== false;
  const isLocked = node.data?.locked === true;
  const opacity = node.data?.opacity !== undefined ? node.data.opacity : 1;
  const layerName = node.data?.label || node.id;
  const shapeType = node.type || 'shape';

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isLocked) {
      setIsEditing(true);
      setEditValue(layerName);
    }
  };

  const handleRename = () => {
    if (editValue.trim() && editValue !== layerName) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(layerName);
    }
  };

  // Generate thumbnail preview
  const getThumbnail = () => {
    const fill = node.data?.style?.fill || node.data?.backgroundColor || '#ffffff';
    const stroke = node.data?.style?.stroke || node.data?.borderColor || '#374151';

    // Simple shape preview based on type
    switch (shapeType) {
      case 'circle':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </svg>
        );
      case 'diamond':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </svg>
        );
      case 'rectangle':
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`layer-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${!isVisible ? 'hidden' : ''}`}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      draggable={!isLocked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-layer-id={node.id}
    >
      <div className="layer-item-drag-handle" title="Drag to reorder">
        <GripVertical size={14} />
      </div>

      <div className="layer-item-thumbnail">
        {getThumbnail()}
      </div>

      <div className="layer-item-content">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="layer-item-name-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="layer-item-name" title={layerName}>
            {layerName}
          </div>
        )}
        <div className="layer-item-type">{shapeType}</div>
      </div>

      <div className="layer-item-controls">
        {/* Opacity control */}
        <div
          className="layer-item-control opacity-control"
          onMouseEnter={() => setShowOpacitySlider(true)}
          onMouseLeave={() => setShowOpacitySlider(false)}
        >
          <div className="opacity-display" title={`Opacity: ${Math.round(opacity * 100)}%`}>
            {Math.round(opacity * 100)}%
          </div>
          {showOpacitySlider && (
            <div className="opacity-slider-container">
              <input
                type="range"
                className="opacity-slider"
                min="0"
                max="100"
                value={opacity * 100}
                onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        {/* Visibility toggle */}
        <button
          className="layer-item-control"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          title={isVisible ? 'Hide layer' : 'Show layer'}
        >
          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        {/* Lock toggle */}
        <button
          className="layer-item-control"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={isLocked ? 'Unlock layer' : 'Lock layer'}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>
    </div>
  );
};