import React from 'react';
import { formatColor, parseColor, getContrastRatio } from './colorUtils';

interface ColorSwatchProps {
  color: string;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  disabled?: boolean;
  onClick?: (color: string) => void;
  onDoubleClick?: (color: string) => void;
  title?: string;
  className?: string;
  'aria-label'?: string;
  tabIndex?: number;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 'medium',
  selected = false,
  disabled = false,
  onClick,
  onDoubleClick,
  title,
  className = '',
  'aria-label': ariaLabel,
  tabIndex = 0,
}) => {
  const rgba = parseColor(color);
  const formattedColor = formatColor(rgba);

  // Calculate appropriate border color based on contrast
  const whiteContrast = getContrastRatio(rgba, { r: 255, g: 255, b: 255, a: 1 });
  const blackContrast = getContrastRatio(rgba, { r: 0, g: 0, b: 0, a: 1 });
  const borderColor = whiteContrast > blackContrast ? '#ffffff' : '#000000';

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-7 h-7',
    large: 'w-10 h-10'
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(formattedColor);
    }
  };

  const handleDoubleClick = () => {
    if (!disabled && onDoubleClick) {
      onDoubleClick(formattedColor);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const swatchStyle = {
    '--swatch-color': formattedColor,
    '--border-color': borderColor,
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={`
        color-swatch
        ${sizeClasses[size]}
        ${selected ? 'color-swatch--selected' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={swatchStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      title={title || `Color: ${formattedColor}`}
      aria-label={ariaLabel || `Select color ${formattedColor}`}
      tabIndex={disabled ? -1 : tabIndex}
      role="option"
      aria-selected={selected}
    >
      <div
        className="color-swatch__color"
        style={{ backgroundColor: formattedColor }}
      />

      {/* Screen reader only text */}
      <span className="sr-only">
        {selected ? 'Selected: ' : ''}
        Color {formattedColor}
        {rgba.a < 1 && ` with ${Math.round(rgba.a * 100)}% opacity`}
      </span>
    </button>
  );
};

interface ColorSwatchGridProps {
  colors: string[];
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  onColorDoubleClick?: (color: string) => void;
  className?: string;
  swatchSize?: 'small' | 'medium' | 'large';
  columns?: number;
  'aria-label'?: string;
}

export const ColorSwatchGrid: React.FC<ColorSwatchGridProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  onColorDoubleClick,
  className = '',
  swatchSize = 'medium',
  columns = 9,
  'aria-label': ariaLabel = 'Color palette',
}) => {
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  };

  return (
    <div
      className={`color-palette ${className}`}
      style={gridStyle}
      role="listbox"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
    >
      {colors.map((color, index) => {
        const isSelected = selectedColor === color;

        return (
          <ColorSwatch
            key={`${color}-${index}`}
            color={color}
            size={swatchSize}
            selected={isSelected}
            onClick={onColorSelect}
            onDoubleClick={onColorDoubleClick}
            aria-label={`Color ${color}, ${index + 1} of ${colors.length}`}
          />
        );
      })}
    </div>
  );
};

export default ColorSwatch;