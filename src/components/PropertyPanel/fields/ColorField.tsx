import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Pipette, X } from 'lucide-react';
import './ColorField.css';

/**
 * Props for ColorField component
 */
export interface ColorFieldProps {
  /** Current color value (hex, rgb, rgba, etc.) */
  value?: string;

  /** Callback when color changes */
  onChange: (color: string) => void;

  /** Whether field is disabled */
  disabled?: boolean;

  /** Whether to show alpha/transparency control */
  showAlpha?: boolean;

  /** Whether to show the color picker dropdown */
  showPicker?: boolean;

  /** Pre-defined color swatches to show */
  swatches?: string[];

  /** Size of the color field */
  size?: 'small' | 'medium' | 'large';

  /** Additional CSS classes */
  className?: string;

  /** Unique identifier */
  id?: string;

  /** Label for accessibility */
  'aria-label'?: string;

  /** Whether to show the "no color" option */
  allowEmpty?: boolean;

  /** Placeholder text for color input */
  placeholder?: string;
}

/**
 * Recent colors storage key
 */
const RECENT_COLORS_KEY = 'openchart-recent-colors';
const MAX_RECENT_COLORS = 12;

/**
 * Default color swatches
 */
const DEFAULT_SWATCHES = [
  '#000000', '#ffffff', '#f3f4f6', '#d1d5db', '#6b7280', '#374151',
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a',
  '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5',
  '#7c3aed', '#a21caf', '#be185d', '#e11d48',
];

/**
 * Utility to parse color value and get RGB components
 */
const parseColor = (color: string): { r: number; g: number; b: number; a: number } | null => {
  if (!color || color === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 1 };
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(p => parseFloat(p.trim()));
    return {
      r: parts[0] || 0,
      g: parts[1] || 0,
      b: parts[2] || 0,
      a: parts[3] !== undefined ? parts[3] : 1,
    };
  }

  return null;
};

/**
 * Convert RGB to hex
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Get recent colors from localStorage
 */
const getRecentColors = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_COLORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save recent colors to localStorage
 */
const saveRecentColors = (colors: string[]) => {
  try {
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(colors));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Add color to recent colors
 */
const addToRecentColors = (color: string) => {
  if (!color || color === 'transparent') return;

  const recent = getRecentColors();
  const filtered = recent.filter(c => c !== color);
  const updated = [color, ...filtered].slice(0, MAX_RECENT_COLORS);
  saveRecentColors(updated);
};

/**
 * ColorField component with color picker and swatches
 */
const ColorField: React.FC<ColorFieldProps> = ({
  value = '#000000',
  onChange,
  disabled = false,
  showAlpha = false,
  showPicker = true,
  swatches = DEFAULT_SWATCHES,
  size = 'medium',
  className = '',
  id,
  'aria-label': ariaLabel = 'Color picker',
  allowEmpty = false,
  placeholder = '#000000',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent colors on mount
  useEffect(() => {
    setRecentColors(getRecentColors());
  }, []);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle color change
  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    addToRecentColors(newColor);
    setRecentColors(getRecentColors());
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate and apply color
    if (newValue.startsWith('#') && (newValue.length === 4 || newValue.length === 7)) {
      handleColorChange(newValue);
    } else if (newValue === '' && allowEmpty) {
      handleColorChange('transparent');
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Reset to current value if invalid
    setInputValue(value);
  };

  // Handle swatch click
  const handleSwatchClick = (color: string) => {
    handleColorChange(color);
    if (!showPicker) {
      setIsOpen(false);
    }
  };

  // Handle clear color
  const handleClear = () => {
    handleColorChange('transparent');
    setIsOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const fieldClasses = [
    'color-field',
    `color-field--${size}`,
    disabled && 'color-field--disabled',
    isOpen && 'color-field--open',
    className,
  ].filter(Boolean).join(' ');

  const colorPreview = value === 'transparent' ? 'transparent' : value;
  const parsedColor = parseColor(value);
  const isTransparent = !parsedColor || parsedColor.a === 0;

  return (
    <div className={fieldClasses} ref={containerRef}>
      {/* Color preview and input */}
      <div className="color-field__main" onClick={toggleDropdown}>
        <div
          className="color-field__preview"
          style={{ backgroundColor: colorPreview }}
          aria-label={`Current color: ${value}`}
        >
          {isTransparent && (
            <div className="color-field__preview-transparent" />
          )}
        </div>

        <input
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="color-field__input"
          aria-label={ariaLabel}
          onClick={(e) => e.stopPropagation()}
        />

        {(showPicker || swatches.length > 0) && (
          <button
            type="button"
            className="color-field__toggle"
            onClick={toggleDropdown}
            disabled={disabled}
            aria-label="Open color picker"
            tabIndex={-1}
          >
            <ChevronDown size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (showPicker || swatches.length > 0 || recentColors.length > 0) && (
        <div className="color-field__dropdown" ref={dropdownRef}>
          {/* Clear option */}
          {allowEmpty && (
            <div className="color-field__section">
              <button
                type="button"
                className="color-field__clear"
                onClick={handleClear}
                title="No color"
              >
                <X size={12} />
                <span>No Color</span>
              </button>
            </div>
          )}

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="color-field__section">
              <h4 className="color-field__section-title">Recent</h4>
              <div className="color-field__swatches">
                {recentColors.map((color, index) => (
                  <button
                    key={`recent-${index}`}
                    type="button"
                    className="color-field__swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => handleSwatchClick(color)}
                    title={color}
                    aria-label={`Recent color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default swatches */}
          {swatches.length > 0 && (
            <div className="color-field__section">
              <h4 className="color-field__section-title">Colors</h4>
              <div className="color-field__swatches">
                {swatches.map((color, index) => (
                  <button
                    key={`swatch-${index}`}
                    type="button"
                    className="color-field__swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => handleSwatchClick(color)}
                    title={color}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Advanced picker placeholder */}
          {showPicker && (
            <div className="color-field__section">
              <button
                type="button"
                className="color-field__picker-button"
                onClick={() => {
                  // TODO: Integrate with advanced color picker
                  console.log('Open advanced color picker');
                }}
              >
                <Pipette size={16} />
                <span>Advanced Picker</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorField;