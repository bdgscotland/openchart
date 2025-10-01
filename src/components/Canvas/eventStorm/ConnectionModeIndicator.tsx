import React from 'react';
import { Link2 } from 'lucide-react';
import './ConnectionModeIndicator.css';

interface ConnectionModeIndicatorProps {
  active: boolean;
  hasSource: boolean;
}

/**
 * Connection Mode Indicator
 * Shows when quick connection mode is active in Event Storm
 */
export const ConnectionModeIndicator: React.FC<ConnectionModeIndicatorProps> = ({
  active,
  hasSource
}) => {
  if (!active) return null;

  return (
    <div className="connection-mode-indicator">
      <div className="connection-mode-content">
        <Link2 size={20} className="connection-icon" />
        <span className="connection-text">
          {hasSource
            ? 'Click target sticky to connect'
            : 'Click source sticky to start connection'}
        </span>
        <span className="connection-hint">Press ESC to cancel</span>
      </div>
    </div>
  );
};

export default ConnectionModeIndicator;
