import React, { useCallback, useState, useRef } from 'react';
import type { DragHandleProps, ResizeHandle, Dimensions } from './types';
import './DragHandles.css';

const RESIZE_HANDLES: ResizeHandle[] = [
  {
    direction: 'nw',
    cursor: 'nw-resize',
    position: { top: '-4px', left: '-4px' }
  },
  {
    direction: 'n',
    cursor: 'n-resize',
    position: { top: '-4px', left: '50%' }
  },
  {
    direction: 'ne',
    cursor: 'ne-resize',
    position: { top: '-4px', right: '-4px' }
  },
  {
    direction: 'e',
    cursor: 'e-resize',
    position: { top: '50%', right: '-4px' }
  },
  {
    direction: 'se',
    cursor: 'se-resize',
    position: { bottom: '-4px', right: '-4px' }
  },
  {
    direction: 's',
    cursor: 's-resize',
    position: { bottom: '-4px', left: '50%' }
  },
  {
    direction: 'sw',
    cursor: 'sw-resize',
    position: { bottom: '-4px', left: '-4px' }
  },
  {
    direction: 'w',
    cursor: 'w-resize',
    position: { top: '50%', left: '-4px' }
  }
];

export const DragHandles: React.FC<DragHandleProps> = ({
  nodeId,
  isSelected,
  onResize,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragDataRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      direction
    };

    setIsDragging(true);
    setActiveHandle(direction);

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = RESIZE_HANDLES.find(h => h.direction === direction)?.cursor || 'default';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragDataRef.current) return;

    const { startX, startY, startWidth, startHeight, direction } = dragDataRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;

    // Calculate new dimensions based on drag direction
    switch (direction) {
      case 'n':
        newHeight = Math.max(10, startHeight - deltaY);
        break;
      case 'ne':
        newWidth = Math.max(10, startWidth + deltaX);
        newHeight = Math.max(10, startHeight - deltaY);
        break;
      case 'e':
        newWidth = Math.max(10, startWidth + deltaX);
        break;
      case 'se':
        newWidth = Math.max(10, startWidth + deltaX);
        newHeight = Math.max(10, startHeight + deltaY);
        break;
      case 's':
        newHeight = Math.max(10, startHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(10, startWidth - deltaX);
        newHeight = Math.max(10, startHeight + deltaY);
        break;
      case 'w':
        newWidth = Math.max(10, startWidth - deltaX);
        break;
      case 'nw':
        newWidth = Math.max(10, startWidth - deltaX);
        newHeight = Math.max(10, startHeight - deltaY);
        break;
    }

    // Apply the resize
    const newDimensions: Dimensions = {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
      unit: 'px' as const
    };

    onResize(nodeId, newDimensions);
  }, [isDragging, nodeId, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
    dragDataRef.current = null;

    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Restore normal cursor and text selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  // Handle keyboard resizing
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSelected) return;

    // Ctrl+Shift+Arrow keys for resizing
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !isDragging) {
      e.preventDefault();

      const increment = e.altKey ? 1 : 10;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let newWidth = rect.width;
      let newHeight = rect.height;

      switch (e.key) {
        case 'ArrowRight':
          newWidth = Math.max(10, rect.width + increment);
          break;
        case 'ArrowLeft':
          newWidth = Math.max(10, rect.width - increment);
          break;
        case 'ArrowDown':
          newHeight = Math.max(10, rect.height + increment);
          break;
        case 'ArrowUp':
          newHeight = Math.max(10, rect.height - increment);
          break;
        default:
          return;
      }

      const newDimensions: Dimensions = {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        unit: 'px' as const
      };

      onResize(nodeId, newDimensions);
    }
  }, [isSelected, isDragging, nodeId, onResize]);

  return (
    <div
      ref={containerRef}
      className={`drag-handles ${isSelected ? 'drag-handles--selected' : ''} ${
        isDragging ? 'drag-handles--dragging' : ''
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected ? 0 : -1}
    >
      {children}

      {isSelected && (
        <>
          {RESIZE_HANDLES.map((handle) => (
            <div
              key={handle.direction}
              className={`drag-handles__handle drag-handles__handle--${handle.direction} ${
                activeHandle === handle.direction ? 'drag-handles__handle--active' : ''
              }`}
              style={{
                ...handle.position,
                cursor: handle.cursor,
                transform: handle.position.left === '50%' ? 'translateX(-50%)' :
                          handle.position.top === '50%' ? 'translateY(-50%)' : 'none'
              }}
              onMouseDown={(e) => handleMouseDown(e, handle.direction)}
            />
          ))}

          {/* Corner indicator when selected */}
          <div className="drag-handles__selection-indicator" />

          {/* Size display during drag */}
          {isDragging && (
            <div className="drag-handles__size-display">
              {Math.round(containerRef.current?.getBoundingClientRect().width || 0)} × {Math.round(containerRef.current?.getBoundingClientRect().height || 0)}
            </div>
          )}
        </>
      )}
    </div>
  );
};