import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import './NumberField.css';

/**
 * Props for NumberField component
 */
export interface NumberFieldProps {
  /** Current value */
  value?: number;

  /** Callback when value changes */
  onChange: (value: number) => void;

  /** Minimum allowed value */
  min?: number;

  /** Maximum allowed value */
  max?: number;

  /** Step size for increment/decrement */
  step?: number;

  /** Number of decimal places to display */
  precision?: number;

  /** Whether field is disabled */
  disabled?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Whether to show increment/decrement buttons */
  showButtons?: boolean;

  /** Size of the input */
  size?: 'small' | 'medium' | 'large';

  /** Additional CSS classes */
  className?: string;

  /** Unique identifier */
  id?: string;

  /** Whether to select all text on focus */
  selectOnFocus?: boolean;

  /** Custom validation function */
  validate?: (value: number) => string | null;

  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

/**
 * NumberField component with increment/decrement buttons and validation
 */
const NumberField: React.FC<NumberFieldProps> = ({
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  disabled = false,
  placeholder,
  showButtons = true,
  size = 'medium',
  className = '',
  id,
  selectOnFocus = true,
  validate,
  debounceMs = 300,
}) => {
  const [inputValue, setInputValue] = useState(value.toFixed(precision));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Update input value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toFixed(precision));
    }
  }, [value, precision, isFocused]);

  // Clamp value to min/max bounds
  const clampValue = (val: number): number => {
    let clamped = val;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  // Parse and validate input value
  const parseValue = (val: string): number => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? value : clampValue(parsed);
  };

  // Debounced onChange call
  const debouncedOnChange = (newValue: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const validationError = validate?.(newValue);
      if (!validationError) {
        onChange(newValue);
      }
    }, debounceMs);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);

    // Only trigger onChange for valid numbers
    if (newInputValue.trim() !== '') {
      const newValue = parseValue(newInputValue);
      debouncedOnChange(newValue);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    const newValue = parseValue(inputValue);
    setInputValue(newValue.toFixed(precision));

    // Clear debounce and update immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onChange(newValue);
  };

  // Handle input focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (selectOnFocus) {
      e.target.select();
    }
  };

  // Handle key down for arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    } else if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  // Increment value
  const increment = () => {
    const newValue = clampValue(value + step);
    onChange(newValue);
  };

  // Decrement value
  const decrement = () => {
    const newValue = clampValue(value - step);
    onChange(newValue);
  };

  const fieldClasses = [
    'number-field',
    `number-field--${size}`,
    disabled && 'number-field--disabled',
    showButtons && 'number-field--with-buttons',
    className,
  ].filter(Boolean).join(' ');

  const canDecrement = min === undefined || value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div className={fieldClasses}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="number-field__input"
        aria-label="Number input"
        autoComplete="off"
      />

      {showButtons && (
        <div className="number-field__buttons">
          <button
            type="button"
            className="number-field__button number-field__button--decrement"
            onClick={decrement}
            disabled={disabled || !canDecrement}
            aria-label="Decrease value"
            tabIndex={-1}
          >
            <Minus size={12} />
          </button>

          <button
            type="button"
            className="number-field__button number-field__button--increment"
            onClick={increment}
            disabled={disabled || !canIncrement}
            aria-label="Increase value"
            tabIndex={-1}
          >
            <Plus size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NumberField;