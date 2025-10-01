# ADR-003: Event Storm Mode Integration

## Status

**Status:** Accepted
**Date:** 2025-01-10
**Deciders:** Duncan Bowring, Claude (AI Architecture Advisor)
**Related Documents:**
- [Event Storm Architecture](../EVENT_STORM_ARCHITECTURE.md)
- [ADR-001: React Flow Migration](./ADR-001-react-flow-migration.md) (if exists)

---

## Context

OpenChart is an experimental open-source diagramming tool built with React + TypeScript + React Flow. While the tool supports basic diagramming capabilities, we identified an opportunity to differentiate from generic diagramming tools (Miro, Mural, Lucidchart) by specializing in **Event Storming** - a Domain-Driven Design (DDD) workshop methodology created by Alberto Brandolini.

### Problem Statement

Current Event Storming tools have significant limitations:

1. **No Semantic Understanding** - Treat Event Storming as generic sticky notes, missing the domain concepts (events, commands, aggregates)
2. **Manual Layout Management** - Users must manually arrange events chronologically, which is tedious and error-prone
3. **No Version Control** - No way to track how domain understanding evolves over time
4. **Disconnected from Code** - The visual model doesn't connect to implementation
5. **Expensive & Closed Source** - Miro/Mural require subscriptions; no open-source alternative exists

### Opportunity

OpenChart's **git-native architecture** provides a unique competitive advantage: version-controlled domain knowledge evolution. Combined with React Flow's node-based system, we can build purpose-built Event Storming capabilities that no competitor offers.

### Key Questions

1. Should Event Storming be a **separate application** or a **mode** within OpenChart?
2. How do we maintain code quality while adding significant new functionality?
3. What's the MVP scope that validates the concept without over-investing?
4. How do we serve multiple personas (DDD practitioners, facilitators, remote teams)?

---

## Decision

**We will implement Event Storm as a canvas mode within OpenChart**, not as a separate application.

### Architectural Approach

#### 1. Mode-Based Architecture

Add a `mode` field to `DiagramSettings`:

```typescript
export type CanvasMode = 'diagram' | 'eventStorm';

export interface DiagramSettings {
  // ... existing fields ...
  mode: CanvasMode;
  eventStormSettings?: EventStormSettings;
}
```

Each diagram saves its mode, so Event Storms remain Event Storms when reopened.

#### 2. Shared Foundation, Mode-Specific Configuration

- **Unified Canvas:** Both modes use the same `FlowCanvas` (React Flow)
- **Mode-Aware Components:** Toolbar, PropertyPanel, MenuBar adapt based on mode
- **Separate Node Types:** Event Storm stickies are distinct node types (`es-event`, `es-command`, etc.)
- **Mode-Specific Features:** Timeline layout for Event Storm, style controls for Diagram

#### 3. Progressive Disclosure by Phase

Event Storming has three phases (Big Picture → Process Modeling → Software Design). We'll implement progressively:

**Phase 1 (MVP):** Big Picture EventStorming
- Domain Events (orange stickies)
- Actors (yellow stickies)
- Questions/Concerns (purple stickies)
- Timeline auto-layout
- Basic export (Markdown)

**Phase 2:** Process Modeling
- Commands (blue stickies)
- Policies (lavender stickies)
- Read Models (green stickies)
- Flow validation (Command → Event)

**Phase 3:** Software Design
- Aggregates (yellow boundaries)
- Bounded Contexts
- Code generation (TypeScript events)

#### 4. Component Structure

```
src/
├── types/
│   └── eventStorm.ts (new domain types)
├── components/
│   ├── Canvas/
│   │   └── eventStorm/
│   │       ├── EventStormNode.tsx
│   │       └── timelineLayout.ts
│   ├── Toolbar/
│   │   └── eventStormDefinitions.ts
│   ├── PropertyPanel/
│   │   └── EventStormPropertyPanel.tsx
│   └── MenuBar/
│       └── (add mode switcher)
└── utils/
    └── eventStorm/
        ├── export.ts
        └── validation.ts
```

---

## Rationale

### Why Mode-Based (Not Separate Application)?

**Advantages:**
1. ✅ **Unified Experience** - Single application, consistent UI/UX
2. ✅ **Shared Infrastructure** - Reuse React Flow, undo/redo, file operations
3. ✅ **Easier Maintenance** - One codebase to maintain
4. ✅ **User Flexibility** - Can have both diagram and event storm files in one tool
5. ✅ **Incremental Development** - Build mode without breaking diagram functionality

**Disadvantages Considered:**
- ❌ Increased complexity in mode-aware components
- ❌ Potential for feature conflict between modes

**Mitigation:** Clean separation of concerns, separate directories for mode-specific code

### Why Start with Big Picture EventStorming?

**Rationale:**
1. **Simplest Phase** - Only 3 sticky types (event, actor, question), easy to validate
2. **Highest Value** - Most workshops start here; validate concept quickly
3. **Clear Success Criteria** - Can we do timeline layout better than Miro?
4. **Manageable Scope** - Achievable in 2-3 weeks

**Alternative Considered:** Start with full notation (all phases)
**Rejected Because:** Too much scope, delays validation, harder to iterate

### Why Git-Native is the Moat

**Unique Value Proposition:**
- Track domain evolution: `git log domain-model.json`
- Branch for alternative models: `git checkout -b alternative-contexts`
- Diff domain understanding: `git diff v1..v2`
- Commit messages as domain decisions: `git commit -m "Split Order into Order + Fulfillment contexts"`

**No competitor has this.** Miro/Mural/Qlerify are cloud-only with limited versioning.

### Why React Flow is Perfect for This

React Flow already provides:
- ✅ Node/edge system (maps to stickies/relationships)
- ✅ Drag-and-drop
- ✅ Custom node types
- ✅ Layout algorithms (can extend)
- ✅ Export capabilities

We don't need to reinvent the wheel.

---

## Consequences

### Positive

1. **Strategic Differentiation** - Positions OpenChart as THE Event Storming tool
2. **Open Source Alternative** - First open-source Event Storming tool with semantic understanding
3. **Git Versioning** - Unprecedented capability in this space
4. **DDD Community** - Natural audience and contributors
5. **Code Quality** - Mode separation keeps codebase clean
6. **Future Modes** - Architecture supports adding more modes (e.g., C4 diagrams, UML)

### Negative

1. **Increased Complexity** - Mode-aware components add conditional logic
2. **Testing Burden** - Need to test both modes independently and together
3. **Documentation Overhead** - Need to document Event Storming methodology
4. **Niche Market Risk** - Event Storming is smaller market than general diagramming

### Neutral

1. **Learning Curve** - Users need to understand Event Storming methodology
2. **Feature Parity** - Event Storm mode won't have all diagram features (by design)
3. **Maintenance Split** - Two modes to maintain going forward

---

## Mitigation Strategies

### For Complexity

- **Clean Separation:** Mode-specific code in separate directories
- **Composition Over Inheritance:** Share components via composition, not complex inheritance
- **Type Safety:** Strict TypeScript types prevent mode-mixing bugs

### For Testing

- **Unit Tests:** Test mode-specific logic in isolation
- **E2E Tests:** Test complete workflows (create storm, arrange, export)
- **Visual Regression:** Screenshot tests for sticky note styling

### For Niche Market

- **Multi-Mode Strategy:** Event Storm is first specialization, not the only one
- **DDD Community Engagement:** Get feedback early, build in public
- **Educational Content:** Blog posts, tutorials explaining Event Storming

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- Add mode switching infrastructure
- Create event storm sticky type definitions
- Basic EventStormNode component

**Success Criteria:** Can switch to Event Storm mode and see sticky types

### Phase 2: Node Types (Week 2)
- Full EventStormNode implementation
- Drag-and-drop creation
- Label editing

**Success Criteria:** Can create and edit event, actor, question stickies

### Phase 3: Property Panel (Week 3)
- EventStormPropertyPanel component
- Domain-specific properties (aggregate, sequence, etc.)

**Success Criteria:** Can edit event storm metadata

### Phase 4: Timeline Layout (Week 4)
- Timeline auto-layout algorithm
- Menu integration
- Sequence number UI

**Success Criteria:** Can auto-arrange events chronologically

### Phase 5: Export (Week 5)
- Markdown export
- TypeScript code generation
- Basic validation

**Success Criteria:** Can export storm to markdown and code

---

## Success Metrics

### Technical Metrics

- ✅ Timeline layout arranges 50+ events in <100ms
- ✅ Export generates valid TypeScript code
- ✅ Git diffs show meaningful domain changes
- ✅ Zero regressions in diagram mode

### User Metrics

- ✅ Positive feedback from 3+ DDD practitioners
- ✅ Complete Event Storm workshop conducted in OpenChart
- ✅ At least 1 community contribution related to Event Storm

### Product Metrics

- ✅ Event Storm mode used in 20% of sessions (once available)
- ✅ Event Storm diagrams saved and reopened successfully
- ✅ Code generation produces compilable TypeScript

---

## Alternatives Considered

### Alternative 1: Separate Application

**Pros:**
- Complete focus on Event Storming
- No mode complexity

**Cons:**
- Duplicate infrastructure (React Flow, file ops, etc.)
- Two applications to maintain
- Harder to share innovations between tools

**Decision:** Rejected - Mode-based approach shares infrastructure

### Alternative 2: Plugin Architecture

**Pros:**
- Clean extension point
- Community can add modes

**Cons:**
- Significant upfront architecture work
- Delays core functionality
- Unclear if we need plugins yet

**Decision:** Deferred - Build mode directly first, extract plugin system later if needed

### Alternative 3: Generic Sticky Note Mode

**Pros:**
- Flexible for any methodology
- Broader market

**Cons:**
- Loses semantic understanding (key differentiator)
- Competes directly with Miro (we'll lose)
- No code generation capability

**Decision:** Rejected - Semantic understanding is the moat

---

## Related Decisions

### ADR-001: React Flow Migration (Historical)

The decision to use React Flow over Konva.js directly enables Event Storm mode. React Flow's node-based system maps perfectly to Event Storming's sticky notes.

### ADR-002: Git-Backed Persistence (If exists)

The git-native architecture provides Event Storm's biggest differentiator: version-controlled domain evolution.

---

## References

### Event Storming Methodology

- Alberto Brandolini's "Introducing EventStorming" book
- EventStorming.com official methodology
- DDD Europe talks on EventStorming
- Remote EventStorming workshops guide (DDD Academy)

### Technical References

- React Flow documentation: https://reactflow.dev
- Domain-Driven Design by Eric Evans
- Event Storming color notation (standard)

### Competitive Analysis

- Miro Event Storming template
- Qlerify (AI-powered DDD modeling)
- EventStorming Journal blog

---

## Decision Review

**Review Date:** After Phase 1 completion (estimated Week 1 end)

**Review Criteria:**
1. Is mode switching working cleanly?
2. Does the architecture feel maintainable?
3. Are we seeing positive signals from early testers?
4. Are there unexpected technical challenges?

**Possible Outcomes:**
- ✅ Continue to Phase 2 as planned
- ⚠️ Adjust architecture based on learnings
- ❌ Pause Event Storm development (if fundamentally flawed)

---

## Changelog

- **2025-01-10:** Initial ADR created
- **TBD:** Review after Phase 1 completion

---

## Approvals

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | Duncan Bowring | 2025-01-10 | ✅ Approved |
| AI Advisor | Claude (Sonnet 4.5) | 2025-01-10 | ✅ Approved |

---

**ADR Status:** Accepted
**Implementation Status:** Not Started
**Target Completion:** Phase 1 - End of Week 1
