import React, { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import './PropertyField.css';

/**
 * Props for PropertyField component
 */
export interface PropertyFieldProps {
  /** Field label */
  label: string;

  /** Field content/input component */
  children: ReactNode;

  /** Optional description or help text */
  description?: string;

  /** Whether field has mixed values in multi-selection */
  hasMultipleValues?: boolean;

  /** Field layout orientation */
  orientation?: 'horizontal' | 'vertical';

  /** Whether field is disabled */
  disabled?: boolean;

  /** Error message to display */
  error?: string;

  /** Warning message to display */
  warning?: string;

  /** Whether field is required */
  required?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Unique identifier for the field */
  id?: string;

  /** Field width - controls how much space it takes in grid layouts */
  width?: 'full' | 'half' | 'third' | 'quarter' | 'auto';

  /** Whether to show the label */
  showLabel?: boolean;

  /** Label alignment when in horizontal orientation */
  labelAlign?: 'left' | 'right' | 'center';

  /** Optional tooltip content */
  tooltip?: string;

  /** Unit display (e.g., "px", "%", "deg") */
  unit?: string;

  /** Optional actions to show next to label */
  actions?: ReactNode;
}

/**
 * PropertyField component that provides consistent layout and styling for property inputs
 */
const PropertyField: React.FC<PropertyFieldProps> = ({
  label,
  children,
  description,
  hasMultipleValues = false,
  orientation = 'horizontal',
  disabled = false,
  error,
  warning,
  required = false,
  className = '',
  id,
  width = 'full',
  showLabel = true,
  labelAlign = 'left',
  tooltip,
  unit,
  actions,
}) => {
  const fieldId = id || `property-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const fieldClasses = [
    'property-field',
    `property-field--${orientation}`,
    `property-field--width-${width}`,
    disabled && 'property-field--disabled',
    hasMultipleValues && 'property-field--mixed',
    error && 'property-field--error',
    warning && 'property-field--warning',
    className,
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'property-field__label',
    `property-field__label--${labelAlign}`,
    required && 'property-field__label--required',
  ].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses}>
      {/* Label Section */}
      {showLabel && (
        <div className="property-field__label-section">
          <label
            htmlFor={fieldId}
            className={labelClasses}
            title={tooltip}
          >
            {label}
            {required && <span className="property-field__required">*</span>}
            {hasMultipleValues && (
              <span className="property-field__mixed-indicator" title="Mixed values">
                Mixed
              </span>
            )}
          </label>

          {actions && (
            <div className="property-field__label-actions">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Input Section */}
      <div className="property-field__input-section">
        <div className="property-field__input-wrapper">
          {children}
          {unit && (
            <span className="property-field__unit">{unit}</span>
          )}
        </div>

        {/* Messages */}
        {(error || warning || description) && (
          <div className="property-field__messages">
            {error && (
              <div className="property-field__message property-field__message--error">
                <AlertTriangle size={12} />
                <span>{error}</span>
              </div>
            )}

            {warning && !error && (
              <div className="property-field__message property-field__message--warning">
                <AlertTriangle size={12} />
                <span>{warning}</span>
              </div>
            )}

            {description && !error && !warning && (
              <div className="property-field__message property-field__message--description">
                <Info size={12} />
                <span>{description}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * PropertyFieldGroup component for grouping related fields
 */
export interface PropertyFieldGroupProps {
  /** Group title */
  title?: string;

  /** Group children */
  children: ReactNode;

  /** Group layout */
  layout?: 'row' | 'column' | 'grid';

  /** Number of columns in grid layout */
  columns?: number;

  /** Gap between fields */
  gap?: 'small' | 'medium' | 'large';

  /** Additional CSS classes */
  className?: string;
}

export const PropertyFieldGroup: React.FC<PropertyFieldGroupProps> = ({
  title,
  children,
  layout = 'column',
  columns = 2,
  gap = 'medium',
  className = '',
}) => {
  const groupClasses = [
    'property-field-group',
    `property-field-group--${layout}`,
    `property-field-group--gap-${gap}`,
    layout === 'grid' && `property-field-group--columns-${columns}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses}>
      {title && (
        <h4 className="property-field-group__title">{title}</h4>
      )}
      <div className="property-field-group__content">
        {children}
      </div>
    </div>
  );
};

export default PropertyField;