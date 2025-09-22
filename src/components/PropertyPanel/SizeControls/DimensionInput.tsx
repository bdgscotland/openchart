import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { DimensionInputProps, SizeUnit } from './types';
import './DimensionInput.css';

const UNITS: SizeUnit[] = ['px', '%', 'em', 'rem', 'vw', 'vh'];

export const DimensionInput: React.FC<DimensionInputProps> = ({
  label,
  value,
  unit,
  min = 0,
  max = 9999,
  step = 1,
  disabled = false,
  onChange,
  onKeyDown
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUnitDropdown(false);
      }
    };

    if (showUnitDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUnitDropdown]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse and validate the number
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue, unit);
    }
  }, [onChange, unit, min, max]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      // Reset to current valid value
      setInputValue(value.toString());
    } else {
      onChange(numValue, unit);
    }
  }, [inputValue, value, onChange, unit, min, max]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsEditing(true);

    // Handle arrow keys for fine adjustments
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseFloat(inputValue) || value;
      const increment = e.shiftKey ? step * 10 : step;
      const newValue = e.key === 'ArrowUp'
        ? Math.min(max, currentValue + increment)
        : Math.max(min, currentValue - increment);

      setInputValue(newValue.toString());
      onChange(newValue, unit);
    }

    // Handle Enter and Escape
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      inputRef.current?.blur();
    }

    // Pass through to parent for additional shortcuts
    onKeyDown?.(e);
  }, [inputValue, value, onChange, unit, step, min, max, onKeyDown]);

  const handleUnitChange = useCallback((newUnit: SizeUnit) => {
    onChange(value, newUnit);
    setShowUnitDropdown(false);
  }, [value, onChange]);

  const handleStepperClick = useCallback((direction: 'up' | 'down') => {
    const currentValue = parseFloat(inputValue) || value;
    const increment = step;
    const newValue = direction === 'up'
      ? Math.min(max, currentValue + increment)
      : Math.max(min, currentValue - increment);

    setInputValue(newValue.toString());
    onChange(newValue, unit);
  }, [inputValue, value, onChange, unit, step, min, max]);

  return (
    <div className="dimension-input">
      <label className="dimension-input__label">
        {label}
      </label>

      <div className="dimension-input__container">
        <div className="dimension-input__field">
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={`dimension-input__input ${disabled ? 'dimension-input__input--disabled' : ''}`}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsEditing(true)}
          />

          <div className="dimension-input__steppers">
            <button
              type="button"
              className="dimension-input__stepper dimension-input__stepper--up"
              onClick={() => handleStepperClick('up')}
              disabled={disabled || value >= max}
              tabIndex={-1}
            >
              ▲
            </button>
            <button
              type="button"
              className="dimension-input__stepper dimension-input__stepper--down"
              onClick={() => handleStepperClick('down')}
              disabled={disabled || value <= min}
              tabIndex={-1}
            >
              ▼
            </button>
          </div>
        </div>

        <div className="dimension-input__unit-selector" ref={dropdownRef}>
          <button
            type="button"
            className="dimension-input__unit-button"
            onClick={() => setShowUnitDropdown(!showUnitDropdown)}
            disabled={disabled}
          >
            {unit}
            <span className="dimension-input__unit-arrow">▼</span>
          </button>

          {showUnitDropdown && (
            <div className="dimension-input__unit-dropdown">
              {UNITS.map((unitOption) => (
                <button
                  key={unitOption}
                  type="button"
                  className={`dimension-input__unit-option ${
                    unitOption === unit ? 'dimension-input__unit-option--selected' : ''
                  }`}
                  onClick={() => handleUnitChange(unitOption)}
                >
                  {unitOption}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};