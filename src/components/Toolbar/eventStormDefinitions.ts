// Event Storm Sticky Note Definitions
// Following Alberto Brandolini's Event Storming color notation

import type { EventStormStickyDefinition, StickyType, EventStormPhase } from '../../types/eventStorm';

/**
 * Big Picture EventStorming stickies
 * Used for initial domain exploration
 */
export const bigPictureStickies: EventStormStickyDefinition[] = [
  {
    id: 'es-event',
    name: 'Domain Event',
    stickyType: 'event',
    phase: 'big-picture',
    color: '#FFB84D', // Orange
    description: 'Something that happened in the domain (past tense)',
    icon: 'Calendar',
    hotkey: 'E',
  },
  {
    id: 'es-actor',
    name: 'Actor',
    stickyType: 'actor',
    phase: 'big-picture',
    color: '#FFE066', // Light Yellow
    description: 'Person or system that triggers events',
    icon: 'User',
    hotkey: 'A',
  },
  {
    id: 'es-question',
    name: 'Question',
    stickyType: 'question',
    phase: 'big-picture',
    color: '#CC99FF', // Purple
    description: 'Open questions, concerns, or uncertainties',
    icon: 'HelpCircle',
    hotkey: 'Q',
  },
];

/**
 * Process Modeling stickies
 * Added during process modeling phase
 */
export const processModelingStickies: EventStormStickyDefinition[] = [
  {
    id: 'es-command',
    name: 'Command',
    stickyType: 'command',
    phase: 'process-modeling',
    color: '#6DB3F2', // Blue
    description: 'User intent or action that triggers events',
    icon: 'Zap',
    hotkey: 'C',
  },
  {
    id: 'es-policy',
    name: 'Policy',
    stickyType: 'policy',
    phase: 'process-modeling',
    color: '#D4B5E8', // Lavender
    description: 'Automation rule or business logic (whenever X, then Y)',
    icon: 'GitBranch',
    hotkey: 'P',
  },
  {
    id: 'es-readmodel',
    name: 'Read Model',
    stickyType: 'readmodel',
    phase: 'process-modeling',
    color: '#90EE90', // Light Green
    description: 'Data needed to make decisions',
    icon: 'Database',
    hotkey: 'R',
  },
];

/**
 * Software Design stickies
 * Added during software design phase
 */
export const softwareDesignStickies: EventStormStickyDefinition[] = [
  {
    id: 'es-aggregate',
    name: 'Aggregate',
    stickyType: 'aggregate',
    phase: 'software-design',
    color: '#FFEC8B', // Yellow (used as boundary box)
    description: 'Consistency boundary / transactional boundary',
    icon: 'Box',
    hotkey: 'G',
  },
  {
    id: 'es-external',
    name: 'External System',
    stickyType: 'external',
    phase: 'software-design',
    color: '#FFB6C1', // Pink
    description: 'Third-party system or external service',
    icon: 'Server',
    hotkey: 'X',
  },
  {
    id: 'es-ui',
    name: 'UI/Mockup',
    stickyType: 'ui',
    phase: 'software-design',
    color: '#FFFFFF', // White
    description: 'User interface element or screen mockup',
    icon: 'Monitor',
    hotkey: 'U',
  },
  {
    id: 'es-hotspot',
    name: 'Hotspot',
    stickyType: 'hotspot',
    phase: 'software-design',
    color: '#FF6B6B', // Red
    description: 'Problem area requiring attention or resolution',
    icon: 'AlertCircle',
    hotkey: 'H',
  },
];

/**
 * All sticky definitions
 */
export const allEventStormStickies: EventStormStickyDefinition[] = [
  ...bigPictureStickies,
  ...processModelingStickies,
  ...softwareDesignStickies,
];

/**
 * Get sticky definitions for a specific phase
 */
export function getStickiesForPhase(phase: EventStormPhase): EventStormStickyDefinition[] {
  switch (phase) {
    case 'big-picture':
      return bigPictureStickies;
    case 'process-modeling':
      return [...bigPictureStickies, ...processModelingStickies];
    case 'software-design':
      return allEventStormStickies;
    default:
      return bigPictureStickies;
  }
}

/**
 * Get sticky definition by type
 */
export function getStickyDefinition(stickyType: StickyType): EventStormStickyDefinition | undefined {
  return allEventStormStickies.find(s => s.stickyType === stickyType);
}

/**
 * Get sticky definition by ID
 */
export function getStickyDefinitionById(id: string): EventStormStickyDefinition | undefined {
  return allEventStormStickies.find(s => s.id === id);
}

/**
 * Event Storm categories for toolbar organization
 */
export const eventStormCategories = {
  'Big Picture': {
    description: 'Initial domain exploration phase',
    stickies: bigPictureStickies,
  },
  'Process Modeling': {
    description: 'Detailed process flows and commands',
    stickies: processModelingStickies,
  },
  'Software Design': {
    description: 'Aggregates and bounded contexts',
    stickies: softwareDesignStickies,
  },
};

/**
 * Get color for sticky type
 */
export function getStickyColor(stickyType: StickyType): string {
  const definition = getStickyDefinition(stickyType);
  return definition?.color || '#FFFFFF';
}

/**
 * Get icon name for sticky type
 */
export function getStickyIcon(stickyType: StickyType): string | undefined {
  const definition = getStickyDefinition(stickyType);
  return definition?.icon;
}
