import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './PropertySection.css';

/**
 * Props for PropertySection component
 */
export interface PropertySectionProps {
  /** Section title displayed in header */
  title: string;

  /** Optional icon to display next to title */
  icon?: ReactNode;

  /** Section content */
  children: ReactNode;

  /** Whether section is collapsible (default: true) */
  collapsible?: boolean;

  /** Initial expanded state (default: true) */
  defaultExpanded?: boolean;

  /** Controlled expanded state */
  expanded?: boolean;

  /** Callback when expand/collapse state changes */
  onExpandedChange?: (expanded: boolean) => void;

  /** Additional CSS classes */
  className?: string;

  /** Whether the section should be prominent/always visible */
  prominent?: boolean;

  /** Section priority for ordering (higher = shown first) */
  priority?: number;

  /** Whether section is disabled */
  disabled?: boolean;

  /** Optional description shown below title */
  description?: string;

  /** Badge text to show in header (e.g., "Mixed" for multi-selection) */
  badge?: string;

  /** Action buttons to show in header */
  actions?: ReactNode;
}

/**
 * PropertySection component that provides collapsible sections for organizing properties
 */
const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  icon,
  children,
  collapsible = true,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  className = '',
  prominent = false,
  priority = 0,
  disabled = false,
  description,
  badge,
  actions,
}) => {
  // Handle both controlled and uncontrolled state
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (disabled || !collapsible) return;

    const newExpanded = !isExpanded;

    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }

    onExpandedChange?.(newExpanded);
  };

  const sectionClasses = [
    'property-section',
    prominent && 'property-section--prominent',
    disabled && 'property-section--disabled',
    !isExpanded && 'property-section--collapsed',
    className,
  ].filter(Boolean).join(' ');

  const headerClasses = [
    'property-section__header',
    collapsible && 'property-section__header--clickable',
    disabled && 'property-section__header--disabled',
  ].filter(Boolean).join(' ');

  return (
    <div className={sectionClasses} data-priority={priority}>
      <div
        className={headerClasses}
        onClick={handleToggle}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible && !disabled ? 0 : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (collapsible && !disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="property-section__header-content">
          {/* Expand/collapse icon */}
          {collapsible && (
            <div className="property-section__expand-icon">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
          )}

          {/* Section icon */}
          {icon && (
            <div className="property-section__icon">
              {icon}
            </div>
          )}

          {/* Title and description */}
          <div className="property-section__title-area">
            <h3 className="property-section__title">{title}</h3>
            {description && (
              <p className="property-section__description">{description}</p>
            )}
          </div>

          {/* Badge */}
          {badge && (
            <span className="property-section__badge">{badge}</span>
          )}

          {/* Action buttons */}
          {actions && (
            <div
              className="property-section__actions"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Section content */}
      {isExpanded && (
        <div className="property-section__content">
          {children}
        </div>
      )}
    </div>
  );
};

export default PropertySection;