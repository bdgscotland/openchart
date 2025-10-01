import React from 'react';
import type { EventStormPhase } from '../../../types/eventStorm';
import './PhaseSwitcher.css';

interface PhaseSwitcherProps {
  currentPhase: EventStormPhase;
  onPhaseChange: (phase: EventStormPhase) => void;
}

const phases: Array<{ id: EventStormPhase; label: string; description: string }> = [
  {
    id: 'big-picture',
    label: 'Big Picture',
    description: 'Explore the domain with events and actors',
  },
  {
    id: 'process-modeling',
    label: 'Process Modeling',
    description: 'Add commands, policies, and read models',
  },
  {
    id: 'software-design',
    label: 'Software Design',
    description: 'Define aggregates and bounded contexts',
  },
];

/**
 * Phase Switcher Component
 * Allows switching between Event Storming phases
 */
export const PhaseSwitcher: React.FC<PhaseSwitcherProps> = ({ currentPhase, onPhaseChange }) => {
  return (
    <div className="phase-switcher">
      <div className="phase-switcher-label">
        Phase:
      </div>
      <div className="phase-buttons">
        {phases.map((phase) => (
          <button
            key={phase.id}
            className={`phase-button ${currentPhase === phase.id ? 'active' : ''}`}
            onClick={() => onPhaseChange(phase.id)}
            title={phase.description}
          >
            <span className="phase-number">{phases.indexOf(phase) + 1}</span>
            <span className="phase-label">{phase.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PhaseSwitcher;
