# Event Storm Mode: Technical Architecture

## Document Information

- **Created:** 2025-01-10
- **Status:** Design Phase
- **Branch:** event-storming
- **Related ADR:** [ADR-003: Event Storm Mode Integration](./adr/ADR-003-event-storm-mode.md)

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Model](#data-model)
4. [Component Design](#component-design)
5. [Layout Algorithms](#layout-algorithms)
6. [Export System](#export-system)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)

---

## Overview

### Purpose

Event Storm mode transforms OpenChart into a specialized tool for Event Storming workshops, a Domain-Driven Design (DDD) methodology for rapidly exploring complex business domains through collaborative visual modeling.

### Design Philosophy

**Mode, Not Tool:** Event Storm is implemented as a canvas mode within OpenChart, sharing the underlying React Flow infrastructure while providing mode-specific UI, behaviors, and data schemas.

### Key Differentiators

1. **Git-Native Versioning** - Track domain model evolution over time
2. **Semantic Awareness** - Understands domain concepts, not just visual elements
3. **Timeline Auto-Layout** - Chronological event arrangement
4. **Code Generation** - Export to TypeScript/Java event classes

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DiagramSettings { mode: 'diagram' | 'eventStorm' } │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│         ┌─────────────────┴─────────────────┐               │
│         ▼                                    ▼               │
│  ┌─────────────┐                    ┌──────────────┐        │
│  │ Diagram Mode│                    │Event Storm   │        │
│  │             │                    │Mode          │        │
│  │ - Shapes    │                    │ - Stickies   │        │
│  │ - Styles    │                    │ - Timeline   │        │
│  │ - Free Form │                    │ - Semantics  │        │
│  └─────────────┘                    └──────────────┘        │
│         │                                    │               │
│         └─────────────────┬─────────────────┘               │
│                           ▼                                  │
│                  ┌─────────────────┐                        │
│                  │   FlowCanvas    │                        │
│                  │  (React Flow)   │                        │
│                  │                 │                        │
│                  │ - Unified       │                        │
│                  │ - Mode-Aware    │                        │
│                  │ - Node Types    │                        │
│                  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Mode Switching Flow

```
User clicks "Mode → Event Storm"
         │
         ▼
Update diagramSettings.mode = 'eventStorm'
         │
         ├──→ Toolbar switches to eventStormDefinitions
         │
         ├──→ PropertyPanel renders EventStormPropertyPanel
         │
         ├──→ MenuBar shows event storm-specific actions
         │
         └──→ FlowCanvas uses eventStormNodeTypes
```

### Component Interaction Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   MenuBar    │       │   Toolbar    │       │PropertyPanel │
│              │       │              │       │              │
│ - Mode Switch│       │ - Sticky Lib │       │ - ES Props   │
│ - Timeline   │       │ - Categories │       │ - Aggregate  │
│   Arrange    │       │              │       │ - Timestamp  │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                       │
       │                      │                       │
       └──────────────────────┼───────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   FlowCanvas     │
                    │                  │
                    │ ┌──────────────┐ │
                    │ │EventStormNode│ │
                    │ │  (Sticky)    │ │
                    │ └──────────────┘ │
                    │                  │
                    │ ┌──────────────┐ │
                    │ │ ShapeNode    │ │
                    │ │ (Diagram)    │ │
                    │ └──────────────┘ │
                    └──────────────────┘
```

---

## Data Model

### Type Definitions

```typescript
// src/types/eventStorm.ts

/**
 * Canvas mode type
 */
export type CanvasMode = 'diagram' | 'eventStorm';

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

  // Process Modeling
  | 'command'      // Blue (#6DB3F2) - User commands
  | 'policy'       // Lavender (#D4B5E8) - Automation rules
  | 'readmodel'    // Green (#90EE90) - Read models/queries

  // Software Design
  | 'aggregate'    // Yellow box (#FFEC8B) - Aggregates (boundary)
  | 'external'     // Pink (#FFB6C1) - External systems
  | 'ui'           // White (#FFFFFF) - UI/mockup
  | 'hotspot';     // Red (#FF6B6B) - Problem areas

/**
 * Event Storm node data structure
 */
export interface EventStormNodeData extends NodeData {
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
 * Extended DiagramSettings with mode support
 */
export interface DiagramSettings {
  // ... existing fields ...

  mode: CanvasMode;
  eventStormSettings?: EventStormSettings;
}

/**
 * Default settings
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
  icon: React.ReactNode;
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
  validate: (nodes: Node[], edges: Edge[]) => ValidationResult[];
}

export interface ValidationResult {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  suggestion?: string;
}
```

### Sticky Type Color Standards

Following Alberto Brandolini's Event Storming notation:

| Sticky Type | Color | Hex | Phase |
|-------------|-------|-----|-------|
| Domain Event | Orange | `#FFB84D` | Big Picture |
| Actor | Light Yellow | `#FFE066` | Big Picture |
| Question/Concern | Purple | `#CC99FF` | Big Picture |
| Command | Blue | `#6DB3F2` | Process Modeling |
| Policy | Lavender | `#D4B5E8` | Process Modeling |
| Read Model | Green | `#90EE90` | Process Modeling |
| Aggregate | Yellow (box) | `#FFEC8B` | Software Design |
| External System | Pink | `#FFB6C1` | Software Design |
| UI/Mockup | White | `#FFFFFF` | Software Design |
| Hotspot | Red | `#FF6B6B` | All Phases |

---

## Component Design

### 1. Mode Switcher

**Location:** `src/components/MenuBar/MenuBar.tsx`

```typescript
interface ModeSwitcherProps {
  currentMode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
}

function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  return (
    <Menu label="Mode">
      <MenuItem
        icon={<Layout />}
        label="Diagram Mode"
        active={currentMode === 'diagram'}
        onClick={() => onModeChange('diagram')}
      />
      <MenuItem
        icon={<Layers />}
        label="Event Storm Mode"
        active={currentMode === 'eventStorm'}
        onClick={() => onModeChange('eventStorm')}
        badge="NEW"
      />
    </Menu>
  );
}
```

**Visual Design:**
- Active mode highlighted
- "NEW" badge on Event Storm mode
- Keyboard shortcut: `Ctrl/Cmd + M` to toggle

### 2. Event Storm Toolbar

**Location:** `src/components/Toolbar/EventStormToolbar.tsx`

```typescript
interface EventStormToolbarProps {
  phase: EventStormPhase;
  selectedStickyType: StickyType | null;
  onStickyTypeSelect: (type: StickyType) => void;
  onPhaseChange: (phase: EventStormPhase) => void;
}

export function EventStormToolbar({
  phase,
  selectedStickyType,
  onStickyTypeSelect,
  onPhaseChange
}: EventStormToolbarProps) {
  // Get sticky types for current phase
  const availableStickies = getStickyTypesForPhase(phase);

  return (
    <div className="event-storm-toolbar">
      {/* Phase Selector */}
      <div className="phase-selector">
        <label>Phase:</label>
        <Select value={phase} onChange={onPhaseChange}>
          <option value="big-picture">Big Picture</option>
          <option value="process-modeling">Process Modeling</option>
          <option value="software-design">Software Design</option>
        </Select>
      </div>

      {/* Sticky Library */}
      <div className="sticky-library">
        {availableStickies.map(sticky => (
          <StickyButton
            key={sticky.id}
            sticky={sticky}
            active={selectedStickyType === sticky.stickyType}
            onClick={() => onStickyTypeSelect(sticky.stickyType)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Button
          icon={<ArrowRight />}
          onClick={handleTimelineArrange}
          tooltip="Auto-arrange timeline (Ctrl+L)"
        >
          Timeline
        </Button>
        <Button
          icon={<CheckCircle />}
          onClick={handleValidate}
          tooltip="Validate consistency"
        >
          Validate
        </Button>
      </div>
    </div>
  );
}
```

**Features:**
- Phase selector (progressive disclosure)
- Sticky library with visual preview
- Hotkeys for common stickies (E=event, C=command, A=actor)
- Quick actions for timeline and validation

### 3. Event Storm Node Component

**Location:** `src/components/Canvas/eventStorm/EventStormNode.tsx`

```typescript
interface EventStormNodeProps {
  id: string;
  data: EventStormNodeData;
  selected: boolean;
}

export function EventStormNode({ id, data, selected }: EventStormNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateNodeData(id, { label });
  };

  return (
    <div
      className={cn(
        'event-storm-sticky',
        `sticky-${data.stickyType}`,
        selected && 'selected',
        data.confidence && `confidence-${data.confidence}`
      )}
      style={{
        backgroundColor: data.color,
        transform: `rotate(${Math.random() * 4 - 2}deg)`, // Slight rotation
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Sticky Type Icon */}
      <div className="sticky-icon">
        {getStickyIcon(data.stickyType)}
      </div>

      {/* Label */}
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className="sticky-label-input"
        />
      ) : (
        <div className="sticky-label">{data.label}</div>
      )}

      {/* Metadata */}
      {data.aggregateName && (
        <div className="sticky-aggregate">
          <Box size={12} />
          {data.aggregateName}
        </div>
      )}

      {data.timestamp && data.showTimestamps && (
        <div className="sticky-timestamp">
          #{data.sequenceNumber || Math.floor(data.timestamp / 1000)}
        </div>
      )}

      {/* Status Indicator */}
      {data.status && (
        <div className={`sticky-status status-${data.status}`} />
      )}

      {/* Concerns Badge */}
      {data.stickyType === 'question' && data.concerns && (
        <div className="sticky-concerns-badge">
          <AlertCircle size={16} />
        </div>
      )}
    </div>
  );
}
```

**Styling:** `src/components/Canvas/eventStorm/EventStormNode.css`

```css
.event-storm-sticky {
  min-width: 120px;
  min-height: 100px;
  padding: 12px;
  border-radius: 2px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Comic Sans MS', 'Marker Felt', cursive;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-storm-sticky.selected {
  box-shadow: 0 0 0 2px #4A90E2, 2px 2px 8px rgba(0, 0, 0, 0.3);
  transform: rotate(0deg) !important;
}

.event-storm-sticky:hover {
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.sticky-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.5;
}

.sticky-label {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  color: #333;
  text-align: center;
  margin-top: 8px;
}

.sticky-aggregate {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  opacity: 0.7;
  margin-top: 8px;
}

.sticky-timestamp {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 10px;
  opacity: 0.5;
}

/* Confidence indicators */
.confidence-low {
  opacity: 0.6;
  border: 2px dashed rgba(0, 0, 0, 0.3);
}

.confidence-medium {
  opacity: 0.8;
}

.confidence-high {
  opacity: 1;
}

/* Status indicators */
.sticky-status {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-proposed { background: #FFC107; }
.status-validated { background: #4CAF50; }
.status-implemented { background: #2196F3; }
```

### 4. Event Storm Property Panel

**Location:** `src/components/PropertyPanel/EventStormPropertyPanel.tsx`

```typescript
export function EventStormPropertyPanel({ nodes }: { nodes: Node[] }) {
  const node = nodes[0];
  const data = node.data as EventStormNodeData;

  return (
    <div className="event-storm-properties">
      {/* Basic Info */}
      <PropertySection title="Sticky Information" icon={<Info />}>
        <TextField
          label="Label"
          value={data.label}
          onChange={(value) => updateNode({ label: value })}
          placeholder="e.g., Order Placed"
        />

        <SelectField
          label="Type"
          value={data.stickyType}
          options={STICKY_TYPE_OPTIONS}
          onChange={(value) => updateNode({ stickyType: value as StickyType })}
        />

        <SelectField
          label="Confidence"
          value={data.confidence || 'high'}
          options={[
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low / Uncertain' }
          ]}
          onChange={(value) => updateNode({ confidence: value })}
        />
      </PropertySection>

      {/* Event-Specific Properties */}
      {(data.stickyType === 'event' || data.stickyType === 'command') && (
        <PropertySection title="Domain Context" icon={<Box />}>
          <TextField
            label="Aggregate"
            value={data.aggregateName || ''}
            onChange={(value) => updateNode({ aggregateName: value })}
            placeholder="e.g., Order, User, Payment"
          />

          <TextField
            label="Bounded Context"
            value={data.boundedContext || ''}
            onChange={(value) => updateNode({ boundedContext: value })}
            placeholder="e.g., Sales, Fulfillment"
          />
        </PropertySection>
      )}

      {/* Timeline Properties */}
      <PropertySection title="Timeline" icon={<Clock />}>
        <NumberField
          label="Sequence"
          value={data.sequenceNumber || 0}
          onChange={(value) => updateNode({ sequenceNumber: value })}
          helpText="Order in the timeline (lower = earlier)"
        />

        <CheckboxField
          label="Show in timeline"
          checked={data.timestamp !== undefined}
          onChange={(checked) => {
            updateNode({
              timestamp: checked ? Date.now() : undefined
            });
          }}
        />
      </PropertySection>

      {/* Questions/Concerns */}
      {data.stickyType === 'question' && (
        <PropertySection title="Concern Details" icon={<AlertCircle />}>
          <TextArea
            label="Description"
            value={data.concerns || ''}
            onChange={(value) => updateNode({ concerns: value })}
            rows={4}
            placeholder="What questions or concerns do we have?"
          />
        </PropertySection>
      )}

      {/* Documentation */}
      <PropertySection title="Documentation" icon={<FileText />} collapsible>
        <TextArea
          label="Notes"
          value={data.notes || ''}
          onChange={(value) => updateNode({ notes: value })}
          rows={3}
          placeholder="Additional context or notes"
        />

        <TagInput
          label="Tags"
          value={data.tags || []}
          onChange={(value) => updateNode({ tags: value })}
          placeholder="Add tags..."
        />
      </PropertySection>
    </div>
  );
}
```

---

## Layout Algorithms

### Timeline Auto-Layout

**Location:** `src/components/Canvas/eventStorm/timelineLayout.ts`

```typescript
interface TimelineLayoutOptions {
  orientation: 'horizontal' | 'vertical';
  spacing: {
    horizontal: number; // Space between events
    vertical: number;   // Space between swim lanes
  };
  groupBy?: 'aggregate' | 'boundedContext' | null;
  sortBy: 'timestamp' | 'sequenceNumber' | 'manual';
}

/**
 * Auto-arrange event storm nodes in chronological timeline
 */
export function autoArrangeTimeline(
  nodes: Node[],
  options: TimelineLayoutOptions
): Node[] {
  // Filter only event storm nodes
  const eventNodes = nodes.filter(n =>
    n.type?.startsWith('es-') &&
    n.data.timestamp !== undefined
  );

  // Sort by timeline order
  const sorted = sortNodes(eventNodes, options.sortBy);

  // Group if requested
  if (options.groupBy) {
    return arrangeGroupedTimeline(sorted, options);
  }

  // Simple linear timeline
  return arrangeLinearTimeline(sorted, options);
}

/**
 * Sort nodes by timeline criteria
 */
function sortNodes(nodes: Node[], sortBy: string): Node[] {
  switch (sortBy) {
    case 'timestamp':
      return nodes.sort((a, b) =>
        (a.data.timestamp || 0) - (b.data.timestamp || 0)
      );
    case 'sequenceNumber':
      return nodes.sort((a, b) =>
        (a.data.sequenceNumber || 0) - (b.data.sequenceNumber || 0)
      );
    default:
      return nodes;
  }
}

/**
 * Arrange nodes in linear timeline (left-to-right)
 */
function arrangeLinearTimeline(
  nodes: Node[],
  options: TimelineLayoutOptions
): Node[] {
  const { spacing, orientation } = options;

  return nodes.map((node, index) => {
    if (orientation === 'horizontal') {
      // Arrange left-to-right
      const x = index * spacing.horizontal;
      const y = Math.floor(index / 10) * spacing.vertical; // Wrap every 10

      return {
        ...node,
        position: { x, y }
      };
    } else {
      // Arrange top-to-bottom
      const x = Math.floor(index / 10) * spacing.horizontal;
      const y = index * spacing.vertical;

      return {
        ...node,
        position: { x, y }
      };
    }
  });
}

/**
 * Arrange nodes grouped by aggregate or bounded context
 */
function arrangeGroupedTimeline(
  nodes: Node[],
  options: TimelineLayoutOptions
): Node[] {
  const { spacing, groupBy } = options;

  // Group nodes
  const groups = new Map<string, Node[]>();
  nodes.forEach(node => {
    const groupKey = groupBy === 'aggregate'
      ? node.data.aggregateName || 'Ungrouped'
      : node.data.boundedContext || 'Ungrouped';

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(node);
  });

  // Arrange each group in a swim lane
  let currentY = 0;
  const arranged: Node[] = [];

  groups.forEach((groupNodes, groupName) => {
    groupNodes.forEach((node, index) => {
      arranged.push({
        ...node,
        position: {
          x: index * spacing.horizontal,
          y: currentY
        }
      });
    });

    // Move to next swim lane
    currentY += spacing.vertical;
  });

  return arranged;
}

/**
 * Default layout options
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
```

### Aggregate Boundary Detection

**Location:** `src/components/Canvas/eventStorm/aggregateDetection.ts`

```typescript
/**
 * Suggest aggregate boundaries based on event clustering
 */
export function detectAggregateBoundaries(
  nodes: Node[],
  edges: Edge[]
): AggregateGroup[] {
  const events = nodes.filter(n => n.data.stickyType === 'event');
  const commands = nodes.filter(n => n.data.stickyType === 'command');

  // Group events by declared aggregate
  const aggregateGroups = new Map<string, Node[]>();

  events.forEach(event => {
    const aggregate = event.data.aggregateName || 'Unknown';
    if (!aggregateGroups.has(aggregate)) {
      aggregateGroups.set(aggregate, []);
    }
    aggregateGroups.get(aggregate)!.push(event);
  });

  // Calculate bounding boxes
  return Array.from(aggregateGroups.entries()).map(([name, nodes]) => ({
    name,
    nodes: nodes.map(n => n.id),
    boundingBox: calculateBoundingBox(nodes),
    confidence: calculateConfidence(nodes, edges)
  }));
}

function calculateBoundingBox(nodes: Node[]): BoundingBox {
  const positions = nodes.map(n => n.position);

  return {
    x: Math.min(...positions.map(p => p.x)) - 50,
    y: Math.min(...positions.map(p => p.y)) - 50,
    width: Math.max(...positions.map(p => p.x)) - Math.min(...positions.map(p => p.x)) + 200,
    height: Math.max(...positions.map(p => p.y)) - Math.min(...positions.map(p => p.y)) + 200
  };
}
```

---

## Export System

### Markdown Export

**Location:** `src/utils/eventStorm/exportMarkdown.ts`

```typescript
export function exportEventStormToMarkdown(
  nodes: Node[],
  edges: Edge[],
  settings: EventStormSettings
): string {
  const metadata = generateMetadata();
  const events = filterByType(nodes, 'event');
  const commands = filterByType(nodes, 'command');
  const actors = filterByType(nodes, 'actor');
  const aggregates = groupByAggregate(events);

  return `
# Event Storm: ${metadata.title}

> Generated: ${new Date().toISOString()}
> Phase: ${settings.phase}

## Summary

- **Domain Events:** ${events.length}
- **Commands:** ${commands.length}
- **Actors:** ${actors.length}
- **Aggregates:** ${Object.keys(aggregates).length}

---

## Domain Events

${events.map(e => formatEvent(e)).join('\n')}

---

## Commands

${commands.map(c => formatCommand(c)).join('\n')}

---

## Actors

${actors.map(a => formatActor(a)).join('\n')}

---

## Aggregates

${Object.entries(aggregates).map(([name, events]) => `
### ${name}

Events:
${events.map(e => `- ${e.data.label}`).join('\n')}
`).join('\n')}

---

## Questions & Concerns

${filterByType(nodes, 'question').map(q => `
### ${q.data.label}
${q.data.concerns || 'No details provided'}
`).join('\n')}
  `.trim();
}

function formatEvent(node: Node): string {
  const data = node.data as EventStormNodeData;
  return `
### ${data.label}

- **Aggregate:** ${data.aggregateName || 'Unknown'}
- **Context:** ${data.boundedContext || 'Unknown'}
- **Sequence:** ${data.sequenceNumber || 'N/A'}
${data.notes ? `- **Notes:** ${data.notes}` : ''}
  `.trim();
}
```

### Code Generation

**Location:** `src/utils/eventStorm/exportCode.ts`

```typescript
export function exportToTypeScript(nodes: Node[]): string {
  const events = nodes.filter(n => n.data.stickyType === 'event');
  const commands = nodes.filter(n => n.data.stickyType === 'command');

  return `
// Generated from Event Storm
// Date: ${new Date().toISOString()}

${generateEventInterfaces(events)}

${generateCommandInterfaces(commands)}

${generateAggregateTypes(events)}
  `.trim();
}

function generateEventInterfaces(events: Node[]): string {
  return events.map(event => {
    const name = toPascalCase(event.data.label);
    const aggregate = event.data.aggregateName || 'Unknown';

    return `
/**
 * ${event.data.description || event.data.label}
 * Aggregate: ${aggregate}
 */
export interface ${name}Event {
  type: '${name}';
  aggregateId: string;
  timestamp: Date;

  // TODO: Add event-specific fields

  metadata?: {
    userId?: string;
    correlationId?: string;
    causationId?: string;
  };
}
    `.trim();
  }).join('\n\n');
}

function generateAggregateTypes(events: Node[]): string {
  const aggregates = groupByAggregate(events);

  return Object.entries(aggregates).map(([name, events]) => {
    const eventTypes = events.map(e => `${toPascalCase(e.data.label)}Event`);

    return `
/**
 * All events for ${name} aggregate
 */
export type ${name}Event =
${eventTypes.map(t => `  | ${t}`).join('\n')};
    `.trim();
  }).join('\n\n');
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Basic mode switching and sticky types

- [ ] Add `mode` field to DiagramSettings type
- [ ] Create mode switcher in MenuBar
- [ ] Create `eventStormDefinitions.ts` with sticky types (Big Picture only)
- [ ] Make Toolbar mode-aware
- [ ] Update App.tsx to pass mode to children
- [ ] Basic EventStormNode component (visual only)

**Deliverable:** Can switch to Event Storm mode and see sticky types in toolbar

### Phase 2: Node Types (Week 2)
**Goal:** Functional sticky notes

- [ ] Full EventStormNode implementation with editing
- [ ] Register event storm node types in FlowCanvas
- [ ] Drag-and-drop sticky creation
- [ ] Double-click to edit labels
- [ ] Basic styling (colors, shadows, rotation)

**Deliverable:** Can create and edit event, actor, question stickies

### Phase 3: Property Panel (Week 3)
**Goal:** Domain-specific properties

- [ ] EventStormPropertyPanel component
- [ ] Aggregate name field
- [ ] Sequence number field
- [ ] Confidence selector
- [ ] Notes and tags
- [ ] Make PropertyPanel mode-aware router

**Deliverable:** Can edit event storm-specific properties

### Phase 4: Timeline Layout (Week 4)
**Goal:** Auto-arrange chronologically

- [ ] Implement `timelineLayout.ts` algorithm
- [ ] Add "Auto-Arrange Timeline" menu item
- [ ] Add timeline controls (orientation, spacing)
- [ ] Sequence number UI in property panel
- [ ] Visual timeline indicators

**Deliverable:** Can auto-arrange events in chronological order

### Phase 5: Export & Validation (Week 5)
**Goal:** Generate artifacts from storm

- [ ] Markdown export implementation
- [ ] TypeScript code generation
- [ ] Basic validation rules
- [ ] Validation UI in property panel
- [ ] Export menu items

**Deliverable:** Can export storm to markdown and TypeScript

### Phase 6: Process Modeling (Week 6-7)
**Goal:** Add Phase 2 stickies

- [ ] Command sticky type
- [ ] Policy sticky type
- [ ] Read Model sticky type
- [ ] Command→Event edges
- [ ] Event→Policy→Command flow
- [ ] Extended validation rules

**Deliverable:** Can model process flows with commands and policies

---

## Testing Strategy

### Unit Tests

```typescript
// src/components/Canvas/eventStorm/__tests__/timelineLayout.test.ts
describe('timelineLayout', () => {
  it('arranges events left-to-right by sequence', () => {
    const nodes = [
      createEventNode('Event C', { sequenceNumber: 3 }),
      createEventNode('Event A', { sequenceNumber: 1 }),
      createEventNode('Event B', { sequenceNumber: 2 }),
    ];

    const arranged = autoArrangeTimeline(nodes, DEFAULT_TIMELINE_LAYOUT);

    expect(arranged[0].data.label).toBe('Event A');
    expect(arranged[1].data.label).toBe('Event B');
    expect(arranged[2].data.label).toBe('Event C');

    expect(arranged[0].position.x).toBeLessThan(arranged[1].position.x);
    expect(arranged[1].position.x).toBeLessThan(arranged[2].position.x);
  });

  it('groups events by aggregate in swim lanes', () => {
    const nodes = [
      createEventNode('Order Placed', { aggregateName: 'Order', sequenceNumber: 1 }),
      createEventNode('Payment Processed', { aggregateName: 'Payment', sequenceNumber: 2 }),
      createEventNode('Order Shipped', { aggregateName: 'Order', sequenceNumber: 3 }),
    ];

    const arranged = autoArrangeTimeline(nodes, {
      ...DEFAULT_TIMELINE_LAYOUT,
      groupBy: 'aggregate'
    });

    // Order events should be in same swim lane (same Y)
    expect(arranged[0].position.y).toBe(arranged[2].position.y);
    // Payment event should be in different swim lane
    expect(arranged[1].position.y).not.toBe(arranged[0].position.y);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/playwright/event-storm/basic-workflow.spec.ts
test('create event storm with timeline', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Switch to Event Storm mode
  await page.click('[data-testid="menu-mode"]');
  await page.click('[data-testid="mode-event-storm"]');

  // Verify toolbar changed
  await expect(page.locator('.event-storm-toolbar')).toBeVisible();

  // Create an event sticky
  await page.click('[data-testid="sticky-event"]');
  await page.click('.react-flow__pane', { position: { x: 200, y: 200 } });

  // Verify event created
  await expect(page.locator('.event-storm-sticky')).toBeVisible();

  // Edit label
  await page.dblclick('.event-storm-sticky');
  await page.fill('.sticky-label-input', 'Order Placed');
  await page.keyboard.press('Enter');

  // Set aggregate name
  await page.click('.event-storm-sticky');
  await page.fill('[data-testid="aggregate-name-input"]', 'Order');

  // Auto-arrange timeline
  await page.click('[data-testid="menu-view"]');
  await page.click('[data-testid="auto-arrange-timeline"]');

  // Verify position changed
  // ... assertions
});
```

---

## Performance Considerations

### Target Performance

- **Timeline layout:** 50+ events arranged in <100ms
- **Export to markdown:** 100+ stickies processed in <200ms
- **Code generation:** 50+ events to TypeScript in <150ms
- **Validation:** 100+ nodes validated in <50ms

### Optimization Strategies

1. **Memoization:** Memoize expensive layout calculations
2. **Web Workers:** Run export/code generation in background
3. **Lazy Loading:** Load phase-specific components on demand
4. **Debouncing:** Debounce property updates
5. **Virtual Rendering:** For very large event storms (future)

---

## Future Enhancements

### Phase 7+: Advanced Features
- Real-time collaboration (WebRTC or WebSocket)
- AI-powered suggestions (aggregate boundaries, event naming)
- Import from other tools (Miro, Mural)
- Video recording for workshop playback
- Template library for common domains
- Integration with code repositories (generate PRs with events)

---

## References

- Alberto Brandolini's "Introducing EventStorming" book
- EventStorming.com official methodology
- React Flow documentation
- DDD Europe talks on EventStorming
- Remote EventStorming workshops guide

---

## Appendix

### A. Complete Sticky Type Reference

See [eventStormDefinitions.ts](../src/components/Toolbar/eventStormDefinitions.ts)

### B. Validation Rules

See [validation.ts](../src/utils/eventStorm/validation.ts)

### C. Export Templates

See [export/](../src/utils/eventStorm/export/)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-10
**Next Review:** After Phase 1 completion
