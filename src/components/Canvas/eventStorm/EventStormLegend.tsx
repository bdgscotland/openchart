import React, { useState } from 'react';
import { Calendar, User, HelpCircle, X, Info, Zap, GitBranch, Database, Box, Server, Monitor, AlertCircle } from 'lucide-react';
import type { EventStormPhase } from '../../../types/eventStorm';
import { getStickiesForPhase } from '../../Toolbar/eventStormDefinitions';
import './EventStormLegend.css';

interface EventStormLegendProps {
  defaultVisible?: boolean;
  phase?: EventStormPhase;
}

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  'Calendar': Calendar,
  'User': User,
  'HelpCircle': HelpCircle,
  'Zap': Zap,
  'GitBranch': GitBranch,
  'Database': Database,
  'Box': Box,
  'Server': Server,
  'Monitor': Monitor,
  'AlertCircle': AlertCircle,
};

// Keyboard shortcuts for each sticky type
const keyboardShortcuts: Record<string, string> = {
  'event': 'E',
  'actor': 'A',
  'question': 'Q',
  'command': 'C',
  'policy': 'P',
  'readmodel': 'R',
  'aggregate': 'G',
  'external': 'X',
  'ui': 'U',
  'hotspot': 'H',
};

/**
 * Event Storm Color Legend
 * Shows what each sticky color means for the current phase
 */
export const EventStormLegend: React.FC<EventStormLegendProps> = ({
  defaultVisible = true,
  phase = 'big-picture'
}) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) {
    return (
      <button
        className="legend-toggle-button"
        onClick={() => setIsVisible(true)}
        title="Show Event Storm Legend"
      >
        <Info size={18} />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="legend-minimized" onClick={() => setIsMinimized(false)}>
        <Info size={16} />
        <span>Legend</span>
      </div>
    );
  }

  const phaseTitle = phase === 'big-picture' ? 'Big Picture Phase'
    : phase === 'process-modeling' ? 'Process Modeling Phase'
    : 'Software Design Phase';

  const stickies = getStickiesForPhase(phase);

  return (
    <div className="event-storm-legend">
      <div className="legend-header">
        <div className="legend-title">
          <Info size={16} />
          <span>{phaseTitle}</span>
        </div>
        <div className="legend-controls">
          <button
            className="legend-button"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            _
          </button>
          <button
            className="legend-button"
            onClick={() => setIsVisible(false)}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="legend-content">
        {stickies.map((sticky) => {
          const IconComponent = iconMap[sticky.icon || ''] || Calendar;
          const shortcut = keyboardShortcuts[sticky.id];
          return (
            <div key={sticky.id} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: sticky.color }}>
                <IconComponent size={16} />
              </div>
              <div className="legend-text">
                <strong>{sticky.name}</strong>
                <span>{sticky.description}</span>
              </div>
              {shortcut && (
                <kbd className="legend-shortcut" title={`Press ${shortcut} to create`}>
                  {shortcut}
                </kbd>
              )}
            </div>
          );
        })}
      </div>

      <div className="legend-footer">
        <span>📌 Arrange stickies left → right chronologically</span>
        <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
          💡 Press letter keys (E, A, Q, etc.) to create stickies · Press L to connect stickies
        </span>
      </div>
    </div>
  );
};

export default EventStormLegend;
