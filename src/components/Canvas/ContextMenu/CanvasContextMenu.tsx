import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Scissors,
  Copy,
  Clipboard,
  Trash2,
  CopyPlus,
  Layers,
  ChevronRight,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Type,
  Palette,
} from 'lucide-react';
import { useCanvasOperations } from '../../../contexts/CanvasOperationsContext';
import { useLayerOperations } from '../../../contexts/LayerOperationsContext';
import { useLayers } from '../../../contexts/LayerContext';
import type { Node, Edge } from '@xyflow/react';
import './CanvasContextMenu.css';

export interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  selectedNodes?: Node[];
  selectedEdges?: Edge[];
  contextNode?: Node;
  contextEdge?: Edge;
  onDelete?: () => void;
  onUpdateEdgeStyle?: (edgeId: string, style: any) => void;
  onUpdateEdgeLabel?: (edgeId: string, label: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuItem[];
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  onClose,
  selectedNodes = [],
  selectedEdges = [],
  contextNode,
  contextEdge,
  onDelete,
  onUpdateEdgeStyle,
  onUpdateEdgeLabel,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null);

  const { clipboard } = useCanvasOperations();
  const { bringToFront, sendToBack, bringForward, sendBackward } = useLayerOperations();
  const { layers, moveElementsToLayer } = useLayers();

  // Get the selection to work with
  const isNodeContext = !!contextNode || selectedNodes.length > 0;
  const isEdgeContext = !!contextEdge || selectedEdges.length > 0;
  const targetNode = contextNode || selectedNodes[0];
  const targetEdge = contextEdge || selectedEdges[0];

  // Get IDs of selected elements
  const selectedNodeIds = selectedNodes.map(n => n.id);
  const selectedEdgeIds = selectedEdges.map(e => e.id);

  // Check if any selected nodes are on locked layers
  const hasLockedElements = useCallback(() => {
    return selectedNodes.some(node => {
      const layer = layers.find(l => l.id === node.data?.layerId);
      return layer?.locked;
    }) || selectedEdges.some(edge => {
      const layer = layers.find(l => l.id === edge.data?.layerId);
      return layer?.locked;
    });
  }, [selectedNodes, selectedEdges, layers]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Handle menu item action
  const handleAction = useCallback((action: () => void) => {
    action();
    onClose();
  }, [onClose]);

  // Context menu actions for nodes
  const nodeMenuItems: MenuItem[] = [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors size={16} />,
      action: () => handleAction(clipboard.copySelection),
      disabled: hasLockedElements(),
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy size={16} />,
      action: () => handleAction(clipboard.copySelection),
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard size={16} />,
      action: () => handleAction(clipboard.pasteSelection),
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <CopyPlus size={16} />,
      action: () => handleAction(clipboard.duplicateSelection),
      disabled: hasLockedElements(),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      action: () => handleAction(() => onDelete?.()),
      disabled: hasLockedElements(),
    },
    {
      id: 'separator2',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'move-to-layer',
      label: 'Move to Layer',
      icon: <Layers size={16} />,
      action: () => {},
      disabled: hasLockedElements(),
      submenu: layers.map(layer => ({
        id: `layer-${layer.id}`,
        label: layer.name,
        icon: null,
        action: () => handleAction(() => {
          const elementIds = [...selectedNodeIds];
          moveElementsToLayer(elementIds, layer.id);
        }),
      })),
    },
    {
      id: 'separator3',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'bring-to-front',
      label: 'Bring to Front',
      icon: <ArrowUpToLine size={16} />,
      action: () => handleAction(() => bringToFront(selectedNodeIds)),
      disabled: hasLockedElements(),
    },
    {
      id: 'bring-forward',
      label: 'Bring Forward',
      icon: <ArrowUp size={16} />,
      action: () => handleAction(() => bringForward(selectedNodeIds)),
      disabled: hasLockedElements(),
    },
    {
      id: 'send-backward',
      label: 'Send Backward',
      icon: <ArrowDown size={16} />,
      action: () => handleAction(() => sendBackward(selectedNodeIds)),
      disabled: hasLockedElements(),
    },
    {
      id: 'send-to-back',
      label: 'Send to Back',
      icon: <ArrowDownToLine size={16} />,
      action: () => handleAction(() => sendToBack(selectedNodeIds)),
      disabled: hasLockedElements(),
    },
  ];

  // Edge style options submenu
  const edgeStyleSubmenu: MenuItem[] = [
    {
      id: 'arrow',
      label: 'Arrow',
      icon: null,
      action: () => handleAction(() => {
        if (targetEdge && onUpdateEdgeStyle) {
          onUpdateEdgeStyle(targetEdge.id, { type: 'custom-arrow' });
        }
      }),
    },
    {
      id: 'curved',
      label: 'Curved',
      icon: null,
      action: () => handleAction(() => {
        if (targetEdge && onUpdateEdgeStyle) {
          onUpdateEdgeStyle(targetEdge.id, { type: 'custom-curved' });
        }
      }),
    },
    {
      id: 'dashed',
      label: 'Dashed',
      icon: null,
      action: () => handleAction(() => {
        if (targetEdge && onUpdateEdgeStyle) {
          onUpdateEdgeStyle(targetEdge.id, { type: 'custom-dashed' });
        }
      }),
    },
    {
      id: 'straight',
      label: 'Straight',
      icon: null,
      action: () => handleAction(() => {
        if (targetEdge && onUpdateEdgeStyle) {
          onUpdateEdgeStyle(targetEdge.id, { type: 'default' });
        }
      }),
    },
  ];

  // Context menu actions for edges
  const edgeMenuItems: MenuItem[] = [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors size={16} />,
      action: () => handleAction(clipboard.copySelection),
      disabled: hasLockedElements(),
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy size={16} />,
      action: () => handleAction(clipboard.copySelection),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      action: () => handleAction(() => onDelete?.()),
      disabled: hasLockedElements(),
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'edit-label',
      label: 'Edit Label',
      icon: <Type size={16} />,
      action: () => handleAction(() => {
        if (targetEdge && onUpdateEdgeLabel) {
          const newLabel = prompt('Enter edge label:', targetEdge.label as string || '');
          if (newLabel !== null) {
            onUpdateEdgeLabel(targetEdge.id, newLabel);
          }
        }
      }),
    },
    {
      id: 'change-style',
      label: 'Change Style',
      icon: <Palette size={16} />,
      action: () => {},
      submenu: edgeStyleSubmenu,
    },
  ];

  // Determine which menu to show
  const menuItems = isNodeContext ? nodeMenuItems : isEdgeContext ? edgeMenuItems : [];

  // Position the menu to fit within viewport
  const adjustedPosition = useCallback((menuX: number, menuY: number) => {
    if (!menuRef.current) return { x: menuX, y: menuY };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = menuX;
    let adjustedY = menuY;

    // Adjust horizontal position if menu would overflow
    if (menuX + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position if menu would overflow
    if (menuY + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    return { x: Math.max(10, adjustedX), y: Math.max(10, adjustedY) };
  }, []);

  const position = adjustedPosition(x, y);

  // Handle submenu open
  const handleSubmenuOpen = useCallback((itemId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSubmenuPosition({
      x: rect.right,
      y: rect.top,
    });
    setSubmenuOpen(itemId);
  }, []);

  // Render menu item
  const renderMenuItem = useCallback((item: MenuItem, isSubmenuItem = false) => {
    if (item.separator) {
      return <div key={item.id} className="context-menu-separator" />;
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isOpen = submenuOpen === item.id;

    return (
      <div
        key={item.id}
        className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${hasSubmenu ? 'has-submenu' : ''}`}
        onClick={(e) => {
          if (item.disabled) return;
          if (hasSubmenu) {
            e.stopPropagation();
            handleSubmenuOpen(item.id, e);
          } else {
            item.action();
          }
        }}
        onMouseEnter={(e) => {
          if (hasSubmenu && !item.disabled) {
            handleSubmenuOpen(item.id, e);
          }
        }}
      >
        {item.icon && <span className="context-menu-item-icon">{item.icon}</span>}
        <span className="context-menu-item-label">{item.label}</span>
        {hasSubmenu && <ChevronRight size={14} className="context-menu-item-chevron" />}

        {/* Render submenu */}
        {hasSubmenu && isOpen && submenuPosition && (
          <div
            className="context-menu context-menu-submenu"
            style={{
              position: 'fixed',
              left: `${submenuPosition.x}px`,
              top: `${submenuPosition.y}px`,
            }}
          >
            {item.submenu!.map(subItem => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  }, [submenuOpen, submenuPosition, handleSubmenuOpen]);

  if (!isNodeContext && !isEdgeContext) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseLeave={() => setSubmenuOpen(null)}
    >
      {menuItems.map(item => renderMenuItem(item))}
    </div>
  );
};

export default CanvasContextMenu;