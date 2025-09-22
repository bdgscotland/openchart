import React from 'react';
import { Underline, Strikethrough, Type } from 'lucide-react';
import './TextDecoration.css';

interface TextDecorationProps {
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through' | 'underline overline';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  onTextDecorationChange: (decoration: 'none' | 'underline' | 'overline' | 'line-through' | 'underline overline') => void;
  onTextTransformChange: (transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => void;
  className?: string;
}

const DECORATION_OPTIONS = [
  { value: 'none', label: 'None', icon: null },
  { value: 'underline', label: 'Underline', icon: Underline },
  { value: 'overline', label: 'Overline', icon: Type },
  { value: 'line-through', label: 'Strikethrough', icon: Strikethrough },
  { value: 'underline overline', label: 'Both', icon: null }
] as const;

const TRANSFORM_OPTIONS = [
  { value: 'none', label: 'None', example: 'Sample Text' },
  { value: 'uppercase', label: 'UPPERCASE', example: 'SAMPLE TEXT' },
  { value: 'lowercase', label: 'lowercase', example: 'sample text' },
  { value: 'capitalize', label: 'Capitalize', example: 'Sample Text' }
] as const;

export const TextDecoration: React.FC<TextDecorationProps> = ({
  textDecoration = 'none',
  textTransform = 'none',
  onTextDecorationChange,
  onTextTransformChange,
  className = ''
}) => {
  return (
    <div className={`text-decoration ${className}`}>
      {/* Text Decoration */}
      <div className="decoration-group">
        <label className="form-label">Text Decoration</label>
        <div className="decoration-buttons">
          {DECORATION_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`decoration-button ${textDecoration === value ? 'active' : ''}`}
              onClick={() => onTextDecorationChange(value)}
              title={label}
            >
              {Icon ? (
                <Icon size={14} />
              ) : (
                <span className="decoration-text">
                  {value === 'none' ? 'T' :
                   value === 'underline overline' ? 'T̲̅' : 'T'}
                </span>
              )}
              <span className="decoration-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Transform */}
      <div className="decoration-group">
        <label className="form-label">Text Case</label>
        <div className="transform-buttons">
          {TRANSFORM_OPTIONS.map(({ value, label, example }) => (
            <button
              key={value}
              className={`transform-button ${textTransform === value ? 'active' : ''}`}
              onClick={() => onTextTransformChange(value)}
              title={`${label}: ${example}`}
            >
              <span className="transform-label">{label}</span>
              <span className="transform-example">{example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="decoration-preview">
        <label className="form-label">Preview</label>
        <div
          className="preview-text"
          style={{
            textDecoration,
            textTransform
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
    </div>
  );
};

export default TextDecoration;