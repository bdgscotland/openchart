// Event Storm Type Definitions
// Following Alberto Brandolini's Event Storming methodology

/**
 * Event Storming phases following Alberto Brandolini's methodology
 */
export type EventStormPhase =
  | 'big-picture'        // Initial exploration: events + actors
  | 'process-modeling'   // Add: commands, policies, read models
  | 'software-design';   // Add: aggregates, bounded contexts

/**
 * Sticky note types with standard Event Storming colors
 */
export type StickyType =
  // Big Picture
  | 'event'        // Orange (#FFB84D) - Domain events
  | 'actor'        // Light Yellow (#FFE066) - Actors/users
  | 'question'     // Purple (#CC99FF) - Questions/concerns

  // Process Modeling (Phase 2)
  | 'command'      // Blue (#6DB3F2) - User commands
  | 'policy'       // Lavender (#D4B5E8) - Automation rules
  | 'readmodel'    // Green (#90EE90) - Read models/queries

  // Software Design (Phase 3)
  | 'aggregate'    // Yellow box (#FFEC8B) - Aggregates (boundary)
  | 'external'     // Pink (#FFB6C1) - External systems
  | 'ui'           // White (#FFFFFF) - UI/mockup
  | 'hotspot';     // Red (#FF6B6B) - Problem areas

/**
 * Event Storm node data structure
 * Extends base node data with event storm-specific fields
 */
export interface EventStormNodeData {
  // Core identification
  label: string;
  stickyType: StickyType;
  color: string;

  // Categorization
  phase: EventStormPhase;
  category?: string; // e.g., "Order Management", "User Authentication"

  // Timeline ordering
  timestamp?: number; // Milliseconds, for chronological ordering
  sequenceNumber?: number; // Manual ordering within timeline

  // Domain modeling
  aggregateName?: string; // For events/commands: which aggregate?
  boundedContext?: string; // For design phase

  // Relationships
  relatedEventIds?: string[]; // For commands: which events result?
  triggeredBy?: string[]; // Actor IDs or event IDs
  triggers?: string[]; // Command IDs or policy IDs

  // Documentation
  description?: string;
  concerns?: string; // For questions/hotspots
  notes?: string;

  // Metadata
  confidence?: 'high' | 'medium' | 'low'; // Confidence in this model
  status?: 'proposed' | 'validated' | 'implemented';
  tags?: string[];

  // Layer support (inherited from base)
  layerId?: string;
}

/**
 * Event Storm settings (stored in DiagramSettings)
 */
export interface EventStormSettings {
  phase: EventStormPhase;
  showTimeline: boolean;
  autoArrangeEnabled: boolean;
  timelineOrientation: 'horizontal' | 'vertical';

  // Display preferences
  showTimestamps: boolean;
  showAggregateNames: boolean;
  groupByAggregate: boolean;
  groupByBoundedContext: boolean;

  // Validation
  validationEnabled: boolean;
  strictMode: boolean; // Enforce Event Storm rules

  // Workshop mode
  workshopMode: boolean; // Simplified UI for facilitation
  participantCursors: boolean; // Future: real-time collaboration
}

/**
 * Default Event Storm settings
 */
export const DEFAULT_EVENT_STORM_SETTINGS: EventStormSettings = {
  phase: 'big-picture',
  showTimeline: true,
  autoArrangeEnabled: false,
  timelineOrientation: 'horizontal',
  showTimestamps: false,
  showAggregateNames: true,
  groupByAggregate: false,
  groupByBoundedContext: false,
  validationEnabled: true,
  strictMode: false,
  workshopMode: false,
  participantCursors: false,
};

/**
 * Sticky type definitions for toolbar
 */
export interface EventStormStickyDefinition {
  id: string;
  name: string;
  stickyType: StickyType;
  phase: EventStormPhase;
  color: string;
  description: string;
  icon?: string; // Icon name from lucide-react
  hotkey?: string; // Keyboard shortcut for quick creation
}

/**
 * Validation rules
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (nodes: any[], edges: any[]) => ValidationResult[];
}

export interface ValidationResult {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  suggestion?: string;
}

/**
 * Timeline layout options
 */
export interface TimelineLayoutOptions {
  orientation: 'horizontal' | 'vertical';
  spacing: {
    horizontal: number; // Space between events
    vertical: number;   // Space between swim lanes
  };
  groupBy?: 'aggregate' | 'boundedContext' | null;
  sortBy: 'timestamp' | 'sequenceNumber' | 'manual';
}

/**
 * Default timeline layout options
 */
export const DEFAULT_TIMELINE_LAYOUT: TimelineLayoutOptions = {
  orientation: 'horizontal',
  spacing: {
    horizontal: 200,
    vertical: 150
  },
  groupBy: null,
  sortBy: 'sequenceNumber'
};

/**
 * Aggregate group (for boundary detection)
 */
export interface AggregateGroup {
  name: string;
  nodeIds: string[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number; // 0-1 scale
}

/**
 * Event Storm export formats
 */
export type ExportFormat = 'markdown' | 'typescript' | 'java' | 'json';
