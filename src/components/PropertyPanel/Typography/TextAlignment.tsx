import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import './TextAlignment.css';

interface TextAlignmentProps {
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  onTextAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
  className?: string;
}

const ALIGNMENT_OPTIONS = [
  { value: 'left', icon: AlignLeft, label: 'Align Left' },
  { value: 'center', icon: AlignCenter, label: 'Align Center' },
  { value: 'right', icon: AlignRight, label: 'Align Right' },
  { value: 'justify', icon: AlignJustify, label: 'Justify' }
] as const;

export const TextAlignment: React.FC<TextAlignmentProps> = ({
  textAlign = 'center',
  onTextAlignChange,
  className = ''
}) => {
  return (
    <div className={`text-alignment ${className}`}>
      <label className="form-label">Text Alignment</label>
      <div className="alignment-buttons">
        {ALIGNMENT_OPTIONS.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            className={`alignment-button ${textAlign === value ? 'active' : ''}`}
            onClick={() => onTextAlignChange(value)}
            title={label}
            aria-label={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TextAlignment;