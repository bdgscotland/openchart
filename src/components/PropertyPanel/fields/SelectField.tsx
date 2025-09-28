import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './SelectField.css';

/**
 * Option interface for SelectField
 */
export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

/**
 * Props for SelectField component
 */
export interface SelectFieldProps {
  /** Current selected value */
  value?: any;

  /** Callback when value changes */
  onChange: (value: any) => void;

  /** Available options */
  options: SelectOption[];

  /** Whether field is disabled */
  disabled?: boolean;

  /** Placeholder text when no value selected */
  placeholder?: string;

  /** Size of the select */
  size?: 'small' | 'medium' | 'large';

  /** Additional CSS classes */
  className?: string;

  /** Unique identifier */
  id?: string;

  /** Label for accessibility */
  'aria-label'?: string;

  /** Whether to show icons in options */
  showIcons?: boolean;

  /** Whether to show descriptions */
  showDescriptions?: boolean;

  /** Maximum height of dropdown */
  maxHeight?: number;

  /** Whether multiple selection is allowed */
  multiple?: boolean;

  /** Custom render function for options */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;

  /** Custom render function for selected value */
  renderValue?: (option: SelectOption | null) => React.ReactNode;

  /** Whether to allow clearing the selection */
  clearable?: boolean;

  /** Search/filter functionality */
  searchable?: boolean;

  /** Custom search filter function */
  filterOption?: (option: SelectOption, search: string) => boolean;
}

/**
 * Default filter function for searchable select
 */
const defaultFilterOption = (option: SelectOption, search: string): boolean => {
  const searchLower = search.toLowerCase();
  return (
    option.label.toLowerCase().includes(searchLower) ||
    (option.description && option.description.toLowerCase().includes(searchLower))
  );
};

/**
 * SelectField component with dropdown and search functionality
 */
const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select an option...',
  size = 'medium',
  className = '',
  id,
  'aria-label': ariaLabel = 'Select field',
  showIcons = true,
  showDescriptions = false,
  maxHeight = 200,
  multiple = false,
  renderOption,
  renderValue,
  clearable = false,
  searchable = false,
  filterOption = defaultFilterOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected option(s)
  const selectedOption = options.find(opt => opt.value === value) || null;
  const selectedOptions = multiple && Array.isArray(value)
    ? options.filter(opt => value.includes(opt.value))
    : selectedOption ? [selectedOption] : [];

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => filterOption(opt, searchTerm))
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleOptionClick(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Handle option selection
  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  // Handle clear selection
  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(multiple ? [] : null);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    }
  };

  const fieldClasses = [
    'select-field',
    `select-field--${size}`,
    disabled && 'select-field--disabled',
    isOpen && 'select-field--open',
    multiple && 'select-field--multiple',
    className,
  ].filter(Boolean).join(' ');

  // Render selected value display
  const renderSelectedValue = () => {
    if (renderValue && selectedOption) {
      return renderValue(selectedOption);
    }

    if (multiple && selectedOptions.length > 0) {
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      return `${selectedOptions.length} selected`;
    }

    if (selectedOption) {
      return (
        <div className="select-field__selected-option">
          {showIcons && selectedOption.icon && (
            <span className="select-field__selected-icon">
              {selectedOption.icon}
            </span>
          )}
          <span className="select-field__selected-label">
            {selectedOption.label}
          </span>
        </div>
      );
    }

    return (
      <span className="select-field__placeholder">
        {placeholder}
      </span>
    );
  };

  return (
    <div className={fieldClasses} ref={containerRef}>
      {/* Field trigger */}
      <div
        className="select-field__trigger"
        onClick={toggleDropdown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="select-field__value">
          {renderSelectedValue()}
        </div>

        <div className="select-field__actions">
          {clearable && (selectedOption || (multiple && selectedOptions.length > 0)) && (
            <button
              type="button"
              className="select-field__clear"
              onClick={handleClear}
              aria-label="Clear selection"
              tabIndex={-1}
            >
              ×
            </button>
          )}

          <div className="select-field__arrow">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="select-field__dropdown" ref={dropdownRef}>
          {/* Search input */}
          {searchable && (
            <div className="select-field__search">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="select-field__search-input"
              />
            </div>
          )}

          {/* Options list */}
          <div
            className="select-field__options"
            style={{ maxHeight: `${maxHeight}px` }}
            role="listbox"
            aria-multiselectable={multiple}
          >
            {filteredOptions.length === 0 ? (
              <div className="select-field__no-options">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(option.value)
                  : option.value === value;
                const isHighlighted = index === highlightedIndex;

                const optionClasses = [
                  'select-field__option',
                  isSelected && 'select-field__option--selected',
                  isHighlighted && 'select-field__option--highlighted',
                  option.disabled && 'select-field__option--disabled',
                ].filter(Boolean).join(' ');

                return (
                  <div
                    key={`${option.value}-${index}`}
                    className={optionClasses}
                    onClick={() => handleOptionClick(option)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <>
                        {multiple && (
                          <div className="select-field__checkbox">
                            {isSelected && <Check size={12} />}
                          </div>
                        )}

                        {showIcons && option.icon && (
                          <span className="select-field__option-icon">
                            {option.icon}
                          </span>
                        )}

                        <div className="select-field__option-content">
                          <span className="select-field__option-label">
                            {option.label}
                          </span>
                          {showDescriptions && option.description && (
                            <span className="select-field__option-description">
                              {option.description}
                            </span>
                          )}
                        </div>

                        {!multiple && isSelected && (
                          <Check size={14} className="select-field__check" />
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectField;