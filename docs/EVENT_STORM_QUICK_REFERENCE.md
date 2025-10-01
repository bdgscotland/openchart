# Event Storm Quick Reference Card

## Keyboard Shortcuts

### Create Stickies (Single Key)

```
┌─────────────────────────────────────────────────────┐
│  BIG PICTURE PHASE                                  │
├─────────────────────────────────────────────────────┤
│  E  →  Domain Event (Orange)                        │
│  A  →  Actor (Yellow)                               │
│  Q  →  Question (Purple)                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  PROCESS MODELING PHASE                             │
├─────────────────────────────────────────────────────┤
│  C  →  Command (Blue)                               │
│  P  →  Policy (Lavender)                            │
│  R  →  Read Model (Green)                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  SOFTWARE DESIGN PHASE                              │
├─────────────────────────────────────────────────────┤
│  G  →  Aggregate (Yellow Box)                       │
│  X  →  External System (Pink)                       │
│  U  →  UI/Mockup (White)                            │
│  H  →  Hotspot (Red)                                │
└─────────────────────────────────────────────────────┘
```

### Workflow Actions

```
┌─────────────────────────────────────────────────────┐
│  ACTION                    │  SHORTCUT              │
├────────────────────────────┼────────────────────────┤
│  Save & finish editing    │  Enter                 │
│  Create another (same)     │  Shift + Enter         │
│  Cancel editing            │  Escape                │
│  Edit existing sticky      │  Double-click          │
│  Connect stickies          │  L (then click twice)  │
│  Exit connection mode      │  Escape                │
└────────────────────────────┴────────────────────────┘
```

### Selection & Management

```
┌─────────────────────────────────────────────────────┐
│  ACTION                    │  SHORTCUT              │
├────────────────────────────┼────────────────────────┤
│  Select all                │  Ctrl + A              │
│  Duplicate selection       │  Ctrl + D              │
│  Delete selection          │  Delete                │
│  Clear selection           │  Escape                │
└────────────────────────────┴────────────────────────┘
```

## Quick Workflows

### Create Event Sequence
```
1. Press 'E'
2. Type "First Event"
3. Press Shift+Enter
4. Type "Second Event"
5. Press Shift+Enter
6. Type "Third Event"
7. Press Enter (finish)
```

### Connect Two Stickies
```
1. Press 'L'
2. Click source sticky
3. Click target sticky
4. (Done - auto-exits)
```

### Map Actor → Command → Event
```
1. Press 'A' → Type "Customer" → Enter
2. Press 'C' → Type "Place Order" → Enter
3. Press 'E' → Type "Order Placed" → Enter
4. Press 'L' → Click Customer → Click Place Order
5. Press 'L' → Click Place Order → Click Order Placed
```

## Visual Guides

### Swim Lanes
- Horizontal dashed lines
- Snap to 180px rows
- Drag vertically to align

### Timeline Flow
- Arrange left to right (time)
- Orange arrow reminder at top
- Earlier events on left

### Connection Banner
- Blue indicator when 'L' is pressed
- Shows "Click source" → "Click target"
- Press Escape to cancel

### Legend Panel
- Bottom right corner
- Shows available stickies
- Keyboard shortcuts visible
- Phase-specific

## Color Guide

```
┌─────────────────────────────────────────────────┐
│  COLOR        │  TYPE            │  MEANING     │
├───────────────┼──────────────────┼──────────────┤
│  🟠 Orange    │  Domain Event    │  Happened    │
│  🟡 Yellow    │  Actor           │  Who         │
│  🔵 Blue      │  Command         │  Action      │
│  🟣 Purple    │  Question        │  Unclear     │
│  🟢 Green     │  Read Model      │  Data view   │
│  💜 Lavender  │  Policy          │  Rule        │
│  🟨 Yellow□   │  Aggregate       │  Boundary    │
│  🩷 Pink      │  External        │  Outside     │
│  ⚪ White     │  UI/Mockup       │  Interface   │
│  🔴 Red       │  Hotspot         │  Problem     │
└───────────────┴──────────────────┴──────────────┘
```

## Naming Patterns

### Events (Orange)
- **Past tense:** "Order Placed" ✅
- **Not:** "Place Order" ❌
- **Domain language:** Use business terms

### Commands (Blue)
- **Imperative:** "Place Order" ✅
- **Not:** "Order Placed" ❌
- **User intent:** What they want

### Actors (Yellow)
- **Nouns:** "Customer", "Admin" ✅
- **Not:** "Ordering" ❌
- **Specific roles:** Be precise

## Workshop Phases

```
Phase 1: BIG PICTURE (30-60 min)
├─ Focus: Events + Actors
├─ Keys: E, A, Q
└─ Goal: Understand domain story

Phase 2: PROCESS MODELING (60-90 min)
├─ Focus: Commands, Policies, Read Models
├─ Keys: C, P, R
└─ Goal: Decision points & automation

Phase 3: SOFTWARE DESIGN (60-90 min)
├─ Focus: Aggregates, Boundaries
├─ Keys: G, X, U
└─ Goal: System structure
```

## Troubleshooting

### Shortcuts Don't Work
- ✅ In Event Storm mode?
- ✅ Not typing in text field?
- ✅ Sticky type available in phase?

### Can't Connect
- ✅ Pressed 'L' first?
- ✅ Blue banner visible?
- ✅ Different source/target?

### Won't Snap
- ✅ Snap-to-grid enabled?
- ✅ Released mouse button?
- ✅ Dragging, not clicking?

## Tips

### Speed
- Use keyboard for creation
- Use mouse for positioning
- Shift+Enter for sequences
- 'L' for connections

### Organization
- Left → Right = Time
- Top → Bottom = Parallel
- Group with white space
- Align to swim lanes

### Collaboration
- Facilitator drives keyboard
- Participants call out content
- Git commits capture iterations
- Share via repository

---

**Print this card and keep it visible during workshops!**

For full documentation: `docs/EVENT_STORM_WORKSHOP_GUIDE.md`