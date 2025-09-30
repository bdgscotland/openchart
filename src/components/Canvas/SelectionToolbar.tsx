import React, { useCallback } from 'react';
import { Copy, Trash2, AlignCenter, AlignLeft, AlignRight, Group, Ungroup, BringToFront, SendToBack, ChevronUp, ChevronDown } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';

interface SelectionToolbarProps {
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onBulkDelete: () => void;
  onBulkDuplicate: () => void;
  onBulkAlign?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onBulkGroup?: () => void;
  onBulkUngroup?: () => void;
  onBringToFront?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onSendToBack?: () => void;
  position?: { x: number; y: number };
  className?: string;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedNodes,
  selectedEdges,
  onBulkDelete,
  onBulkDuplicate,
  onBulkAlign,
  onBulkGroup,
  onBulkUngroup,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  position,
  className = '',
}) => {
  const totalSelected = selectedNodes.length + selectedEdges.length;

  const handleAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    onBulkAlign?.(alignment);
  }, [onBulkAlign]);

  if (totalSelected === 0) {
    return null;
  }

  const toolbarStyle = position ? {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -100%)',
    marginTop: '-10px',
  } : {};

  return (
    <div
      className={`
        bg-white/95 backdrop-blur-lg border border-gray-200 rounded-lg shadow-lg
        flex items-center gap-1 p-2 z-[1000] select-none
        ${className}
      `}
      style={toolbarStyle}
    >
      {/* Selection count */}
      <div className="px-3 py-1 text-sm font-medium text-gray-700 border-r border-gray-200">
        {totalSelected} selected
      </div>

      {/* Duplicate button */}
      <button
        onClick={onBulkDuplicate}
        className="p-2 hover:bg-blue-50 rounded-md transition-colors group"
        title="Duplicate selected items"
      >
        <Copy className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
      </button>

      {/* Alignment tools (only for nodes) */}
      {selectedNodes.length > 1 && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAlign('left')}
              className="p-2 hover:bg-green-50 rounded-md transition-colors group"
              title="Align left"
            >
              <AlignLeft className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
            </button>
            <button
              onClick={() => handleAlign('center')}
              className="p-2 hover:bg-green-50 rounded-md transition-colors group"
              title="Align center"
            >
              <AlignCenter className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
            </button>
            <button
              onClick={() => handleAlign('right')}
              className="p-2 hover:bg-green-50 rounded-md transition-colors group"
              title="Align right"
            >
              <AlignRight className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
            </button>
          </div>
        </>
      )}

      {/* Grouping tools (only for nodes) */}
      {selectedNodes.length > 1 && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex items-center gap-1">
            {onBulkGroup && (
              <button
                onClick={onBulkGroup}
                className="p-2 hover:bg-purple-50 rounded-md transition-colors group"
                title="Group selected nodes"
              >
                <Group className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
              </button>
            )}
            {onBulkUngroup && (
              <button
                onClick={onBulkUngroup}
                className="p-2 hover:bg-purple-50 rounded-md transition-colors group"
                title="Ungroup selected nodes"
              >
                <Ungroup className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Layer management tools (only for nodes) */}
      {selectedNodes.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex items-center gap-1">
            {onBringToFront && (
              <button
                onClick={onBringToFront}
                className="p-2 hover:bg-orange-50 rounded-md transition-colors group"
                title="Bring to Front (Ctrl+Shift+])"
              >
                <BringToFront className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
              </button>
            )}
            {onBringForward && (
              <button
                onClick={onBringForward}
                className="p-2 hover:bg-orange-50 rounded-md transition-colors group"
                title="Bring Forward (Ctrl+])"
              >
                <ChevronUp className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
              </button>
            )}
            {onSendBackward && (
              <button
                onClick={onSendBackward}
                className="p-2 hover:bg-orange-50 rounded-md transition-colors group"
                title="Send Backward (Ctrl+[)"
              >
                <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
              </button>
            )}
            {onSendToBack && (
              <button
                onClick={onSendToBack}
                className="p-2 hover:bg-orange-50 rounded-md transition-colors group"
                title="Send to Back (Ctrl+Shift+[)"
              >
                <SendToBack className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Delete button */}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={onBulkDelete}
        className="p-2 hover:bg-red-50 rounded-md transition-colors group"
        title="Delete selected items"
      >
        <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
      </button>
    </div>
  );
};

export default SelectionToolbar;