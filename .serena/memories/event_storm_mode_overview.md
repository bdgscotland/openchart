# Event Storm Mode Overview

## Strategic Context

Event Storm mode is a **strategic differentiator** for OpenChart, positioning it as the first git-native, semantically-aware Event Storming tool purpose-built for Domain-Driven Design (DDD) practitioners.

## What is Event Storming?

Event Storming is a workshop-based methodology developed by Alberto Brandolini for rapidly exploring complex business domains. It uses colored sticky notes to represent different domain concepts:

- **Domain Events** (Orange) - Something that happened
- **Commands** (Blue) - User intent/action
- **Actors** (Yellow) - Person or system triggering events
- **Aggregates** (Yellow box) - Consistency boundaries
- **Policies** (Lavender) - Automation/business rules
- **Read Models** (Green) - Data needed for decisions
- **External Systems** (Pink) - Third-party integrations
- **Questions/Concerns** (Purple) - Open questions

## Three Phases of Event Storming

1. **Big Picture EventStorming** - High-level exploration (events + actors)
2. **Process Modeling** - Add commands, policies, read models
3. **Software Design** - Add aggregates, bounded contexts

## Target Personas

### Primary: DDD Practitioners
- Architects and senior developers doing Domain-Driven Design
- Need: Semantic understanding, consistency validation, code generation
- Killer Feature: Generate TypeScript/Java event classes from storm

### Secondary: EventStorming Facilitators
- Consultants running workshops
- Need: Fast sticky creation, timeline auto-layout, presentation mode
- Killer Feature: Timeline view that auto-arranges events chronologically

### Tertiary: Remote Teams
- Distributed teams doing collaborative modeling
- Need: Async collaboration, commenting, voting
- Killer Feature: Git-based async collaboration (comment via commits)

## Unique Competitive Advantages

### 1. Git-Native Versioning ⭐⭐⭐
- Track domain evolution over time
- Branch to explore alternative models
- Diff views showing how understanding changed
- Historical record of domain decisions
- **No competitor has this**

### 2. Semantic Awareness ⭐⭐⭐
- Tool understands events, commands, aggregates (not just sticky notes)
- Validates consistency (every command produces events, etc.)
- Smart suggestions (aggregate boundaries, etc.)

### 3. Timeline Auto-Layout ⭐⭐⭐
- Automatically arranges events chronologically left-to-right
- Maintains actor swim lanes
- Groups parallel processes vertically
- **Miro/Mural require painful manual positioning**

### 4. Code Generation ⭐⭐⭐
- Generate TypeScript/Java event classes from storm
- Export aggregate structures
- Bridge modeling to implementation
- **Huge value for development teams**

## Architecture Approach

**Mode-Based Architecture** - Event Storm is a **mode** within OpenChart, not a separate tool.

### Key Design Decisions

1. **Unified Canvas** - Same FlowCanvas (React Flow) for both diagram and event storm modes
2. **Mode Persistence** - `mode` field in DiagramSettings so diagrams remember their mode
3. **Mode-Aware Components** - Toolbar, PropertyPanel, MenuBar adapt based on current mode
4. **Separate Node Types** - Event storm sticky notes are distinct from diagram shapes
5. **Clean Separation** - Mode-specific code in separate directories

### Component Structure

```
Diagram Mode                Event Storm Mode
├── Rectangle Shape    →    ├── Domain Event Sticky
├── Circle Shape       →    ├── Command Sticky
├── Diamond Shape      →    ├── Actor Sticky
├── Style Properties   →    ├── Domain Properties (aggregate, timestamp)
├── Free-form Layout   →    ├── Timeline Layout
└── PNG/SVG Export     →    └── Markdown/Code Export
```

## Implementation Status

**Current Status:** Architecture designed, not yet implemented

**Next Steps:**
1. Phase 1: Foundation (mode switching, sticky types)
2. Phase 2: Node types (EventStormNode component)
3. Phase 3: Property panel (event-specific properties)
4. Phase 4: Timeline layout (auto-arrange algorithm)
5. Phase 5: Export & polish (markdown, code generation)

## Key Files

- `src/types/diagram.ts` - Add `mode: CanvasMode` field
- `src/types/eventStorm.ts` - Event storm type definitions
- `src/components/Canvas/eventStorm/` - Event storm components
- `src/components/Toolbar/eventStormDefinitions.ts` - Sticky type definitions
- `src/components/PropertyPanel/EventStormPropertyPanel.tsx` - Domain properties
- `src/utils/eventStorm/` - Export, validation, layout utilities

## MVP Scope (Big Picture EventStorming)

**Includes:**
- Domain Events (orange sticky notes)
- Actors (yellow sticky notes)
- Questions/Concerns (purple sticky notes)
- Timeline view with left-to-right auto-layout
- Simple actor→event connections
- Export to structured JSON/Markdown
- Git commit integration

**Excludes (Phase 2+):**
- Commands, policies, read models (Process Modeling phase)
- Aggregates, bounded contexts (Software Design phase)
- Real-time collaboration
- Advanced consistency validation

## Success Metrics

**Technical:**
- Timeline auto-layout arranges 50+ events in <100ms
- Export generates valid TypeScript code
- Git diffs show meaningful domain evolution

**User:**
- DDD practitioners can run entire event storm in OpenChart
- 90% of Event Storming notation supported
- Positive feedback from EventStorming community

## Go-to-Market Position

> **"OpenChart: The Git-Native Event Storming Tool for DDD Teams"**
> 
> Version your domain knowledge, generate code scaffolding, and track the evolution of your understanding over time. Open source, local-first, git-backed.

## Competitive Landscape

| Tool | Semantic | Timeline | Git | Code Gen | OSS | Price |
|------|----------|----------|-----|----------|-----|-------|
| Miro | ❌ | ❌ | ❌ | ❌ | ❌ | $$ |
| Mural | ❌ | ❌ | ❌ | ❌ | ❌ | $$ |
| Qlerify | ✅ | ❌ | ❌ | ✅ | ❌ | $$$ |
| **OpenChart ES** | ✅ | ✅ | ✅ | ✅ | ✅ | Free |

## References

- EventStorming.com (Alberto Brandolini's official site)
- "Introducing EventStorming" book by Alberto Brandolini
- DDD Europe talks on EventStorming
- Remote EventStorming workshops (DDD Academy)

## Risk Mitigation

1. **Complexity Risk** → Start with Big Picture ES only (simplest phase)
2. **Persona Conflict** → Progressive disclosure (simple mode + advanced features)
3. **Market Size** → DDD growing rapidly with microservices adoption
4. **Technical Debt** → Clean architecture with mode separation