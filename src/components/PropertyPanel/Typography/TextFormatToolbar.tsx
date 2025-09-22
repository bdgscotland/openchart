import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Type, MoreHorizontal } from 'lucide-react';
import type { ElementStyle } from '../../../types/diagram';
import './TextFormatToolbar.css';

interface TextFormatToolbarProps {
  style: Partial<ElementStyle>;
  onStyleChange: (updates: Partial<ElementStyle>) => void;
  compact?: boolean;
  className?: string;
}

export const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({
  style,
  onStyleChange,
  compact = false,
  className = ''
}) => {
  const isBold = style.fontWeight === 'bold' || style.fontWeight === '700';
  const isItalic = style.fontStyle === 'italic';
  const isUnderline = style.textDecoration?.includes('underline');
  const isStrikethrough = style.textDecoration?.includes('line-through');

  const toggleBold = () => {
    const newWeight = isBold ? 'normal' : 'bold';
    onStyleChange({ fontWeight: newWeight });
  };

  const toggleItalic = () => {
    const newStyle = isItalic ? 'normal' : 'italic';
    onStyleChange({ fontStyle: newStyle });
  };

  const toggleUnderline = () => {
    let newDecoration = style.textDecoration || 'none';

    if (isUnderline) {
      // Remove underline
      newDecoration = newDecoration
        .replace('underline', '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!newDecoration || newDecoration === '') {
        newDecoration = 'none';
      }
    } else {
      // Add underline
      if (newDecoration === 'none') {
        newDecoration = 'underline';
      } else {
        newDecoration = `${newDecoration} underline`.trim();
      }
    }

    onStyleChange({ textDecoration: newDecoration as any });
  };

  const toggleStrikethrough = () => {
    let newDecoration = style.textDecoration || 'none';

    if (isStrikethrough) {
      // Remove line-through
      newDecoration = newDecoration
        .replace('line-through', '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!newDecoration || newDecoration === '') {
        newDecoration = 'none';
      }
    } else {
      // Add line-through
      if (newDecoration === 'none') {
        newDecoration = 'line-through';
      } else {
        newDecoration = `${newDecoration} line-through`.trim();
      }
    }

    onStyleChange({ textDecoration: newDecoration as any });
  };

  const formatButtons = [
    {
      key: 'bold',
      icon: Bold,
      label: 'Bold',
      active: isBold,
      onClick: toggleBold,
      shortcut: 'Ctrl+B'
    },
    {
      key: 'italic',
      icon: Italic,
      label: 'Italic',
      active: isItalic,
      onClick: toggleItalic,
      shortcut: 'Ctrl+I'
    },
    {
      key: 'underline',
      icon: Underline,
      label: 'Underline',
      active: isUnderline,
      onClick: toggleUnderline,
      shortcut: 'Ctrl+U'
    },
    {
      key: 'strikethrough',
      icon: Strikethrough,
      label: 'Strikethrough',
      active: isStrikethrough,
      onClick: toggleStrikethrough,
      shortcut: 'Ctrl+Shift+X'
    }
  ];

  return (
    <div className={`text-format-toolbar ${compact ? 'compact' : ''} ${className}`}>
      {!compact && (
        <div className="toolbar-header">
          <Type size={14} />
          <span className="toolbar-title">Format</span>
        </div>
      )}

      <div className="format-buttons">
        {formatButtons.map(({ key, icon: Icon, label, active, onClick, shortcut }) => (
          <button
            key={key}
            className={`format-button ${active ? 'active' : ''}`}
            onClick={onClick}
            title={`${label} (${shortcut})`}
            aria-label={label}
            aria-pressed={active}
          >
            <Icon size={compact ? 14 : 16} />
            {!compact && <span className="button-label">{label}</span>}
          </button>
        ))}

        {compact && (
          <button
            className="format-button more-button"
            title="More formatting options"
            aria-label="More formatting options"
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>

      {!compact && (
        <div className="format-info">
          <div className="active-formats">
            {isBold && <span className="format-tag">Bold</span>}
            {isItalic && <span className="format-tag">Italic</span>}
            {isUnderline && <span className="format-tag">Underlined</span>}
            {isStrikethrough && <span className="format-tag">Strikethrough</span>}
            {!isBold && !isItalic && !isUnderline && !isStrikethrough && (
              <span className="format-tag default">Normal</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextFormatToolbar;