# Event Storm Workshop Guide

## Quick Start

Event Storm mode in OpenChart enables facilitators to run high-speed Event Storming workshops with keyboard-driven workflows and smart visual aids.

### Switching to Event Storm Mode

1. Open or create a diagram
2. Click the mode selector in the toolbar
3. Select "Event Storm"
4. Canvas switches to timeline layout with swim lanes

## Workshop Workflow

### 1. Creating Stickies

**Single-Key Shortcuts** - Press a letter key to instantly create a sticky:

**Big Picture Phase:**
- `E` - Domain Event (Orange)
- `A` - Actor (Yellow)
- `Q` - Question/Concern (Purple)

**Process Modeling Phase:**
- `C` - Command (Blue)
- `P` - Policy (Lavender)
- `R` - Read Model (Green)

**Software Design Phase:**
- `G` - Aggregate (Yellow box)
- `X` - External System (Pink)
- `U` - UI/Mockup (White)
- `H` - Hotspot (Red)

**What Happens:**
1. Sticky appears at center of viewport
2. Editing mode opens automatically
3. Type your text immediately
4. Press `Enter` to finish

### 2. Creating Sequences (Shift+Enter)

**For rapid event sequences:**

1. Press `E` to create first event
2. Type "Order Placed"
3. Press `Shift+Enter` (not just Enter!)
4. New event appears below, editing active
5. Type "Payment Processed"
6. Press `Shift+Enter` again
7. Continue building your sequence...

**Final sticky:** Press `Enter` (without Shift) to finish

### 3. Connecting Stickies (Press 'L')

**Quick Connection Mode** - Two clicks to connect:

1. Press `L` key
2. Blue banner appears: "Click source sticky to start connection"
3. Click the source sticky (e.g., "Place Order" command)
4. Banner updates: "Click target sticky to connect"
5. Click the target sticky (e.g., "Order Placed" event)
6. Orange animated edge connects them
7. Mode exits automatically

**To cancel:** Press `Escape`

### 4. Timeline Organization

**Automatic Swim Lane Snapping:**
- Stickies snap to horizontal rows (180px apart)
- Drag stickies vertically - they align to lanes automatically
- Horizontal positioning uses fine 20px grid
- Subtle dashed lines show lane boundaries

**Chronological Flow:**
- Arrange stickies **left to right** in time order
- Earlier events on the left
- Later events on the right
- Use swim lanes for parallel processes or different actors

## Complete Workshop Example

**Scenario:** Modeling an e-commerce order process

### Step 1: Map the Happy Path Events

```
Facilitator: "Let's map what happens when an order succeeds..."

Press 'E' → Type "Order Placed" → Enter
Press 'E' → Type "Payment Processed" → Shift+Enter
Type "Items Picked" → Shift+Enter
Type "Package Shipped" → Shift+Enter
Type "Order Delivered" → Enter
```

**Result:** 5 orange event stickies in a vertical sequence

### Step 2: Identify the Actor

```
Facilitator: "Who starts this process?"

Press 'A' → Type "Customer" → Enter
```

**Result:** Yellow actor sticky appears

### Step 3: Add the Command

```
Facilitator: "What action does the customer take?"

Press 'C' → Type "Place Order" → Enter
```

**Result:** Blue command sticky appears

### Step 4: Connect the Flow

```
Facilitator: "Let's connect these..."

Press 'L' → Click "Customer" → Click "Place Order"
Press 'L' → Click "Place Order" → Click "Order Placed"
```

**Result:** Two orange animated connections

### Step 5: Add Questions

```
Facilitator: "Any unclear points?"

Press 'Q' → Type "What if payment fails?" → Enter
Press 'Q' → Type "Inventory out of stock?" → Enter
```

**Result:** Purple question stickies for discussion

**Total Time:** ~2 minutes for complete flow!

## Keyboard Shortcuts Reference

### Sticky Creation
| Key | Sticky Type | Phase | Color |
|-----|-------------|-------|-------|
| `E` | Domain Event | Big Picture | Orange |
| `A` | Actor | Big Picture | Yellow |
| `Q` | Question | All | Purple |
| `C` | Command | Process Modeling | Blue |
| `P` | Policy | Process Modeling | Lavender |
| `R` | Read Model | Process Modeling | Green |
| `G` | Aggregate | Software Design | Yellow box |
| `X` | External System | Software Design | Pink |
| `U` | UI/Mockup | Software Design | White |
| `H` | Hotspot | Software Design | Red |

### Workflow Shortcuts
| Shortcut | Action |
|----------|--------|
| `Enter` | Save current sticky and exit editing |
| `Shift+Enter` | Save current, create another of same type below |
| `Escape` | Cancel editing or exit connection mode |
| `L` | Toggle quick connection mode |
| Double-click | Edit existing sticky |

### General Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all stickies |
| `Ctrl+D` | Duplicate selected stickies |
| `Delete` | Delete selected stickies |
| `Escape` | Clear selection |

## Workshop Facilitation Tips

### Starting a Workshop

1. **Set the Context**
   - Create actor stickies first (`A` key)
   - Place them in the leftmost lane
   - One actor per swim lane

2. **Explore Events**
   - Use `E` key + Shift+Enter for rapid sequences
   - Left to right = chronological order
   - Top to bottom = parallel processes

3. **Add Commands Later**
   - After events are mapped, add commands (`C` key)
   - Place commands to the left of resulting events
   - Connect with `L` key

### Phase Progression

**Phase 1: Big Picture (Start Here)**
- Focus: Events + Actors only
- Goal: Understand the domain story
- Time: 30-60 minutes
- Keys: `E`, `A`, `Q`

**Phase 2: Process Modeling**
- Focus: Add Commands, Policies, Read Models
- Goal: Understand decision points and automation
- Time: 60-90 minutes
- Keys: `C`, `P`, `R`

**Phase 3: Software Design**
- Focus: Add Aggregates, Boundaries
- Goal: Define system structure
- Time: 60-90 minutes
- Keys: `G`, `X`, `U`

### Remote Workshops

**Recommended Setup:**
1. Facilitator shares screen with OpenChart
2. Participants call out sticky content
3. Facilitator uses keyboard shortcuts to build model live
4. Git commits capture iterations
5. Share diagram file via repository

**Async Collaboration:**
1. Initial facilitator creates base model
2. Commits to git repository
3. Team members clone and iterate
4. Pull requests for model changes
5. Commit messages explain domain decisions

## Visual Guides

### Legend Panel (Bottom Right)

Shows all available sticky types for current phase with:
- Color preview
- Type name and description
- Keyboard shortcut badge
- Phase indicator

**Footer hints:**
- "📌 Arrange stickies left → right chronologically"
- "💡 Press letter keys (E, A, Q, etc.) to create stickies · Press L to connect stickies"

### Timeline Guide (Top Center)

Orange banner showing:
- "Time flows →" with animated arrow
- Reminds participants of chronological flow

### Swim Lanes (Background)

Subtle horizontal dashed lines:
- Show alignment boundaries
- Guide vertical positioning
- One lane per actor or process
- Auto-snap when dragging

### Connection Mode Banner (Bottom Center)

Blue banner when `L` is pressed:
- Pulsing link icon
- Status: "Click source" → "Click target"
- Escape hint
- Disappears after connection

## Troubleshooting

### Shortcuts Not Working

**Problem:** Pressing letter keys doesn't create stickies

**Solutions:**
1. Check you're in Event Storm mode (mode selector shows "Event Storm")
2. Make sure you're not typing in a text input
3. Close any editing stickies first (press Enter or Escape)
4. Check sticky type is available in current phase

### Can't Connect Stickies

**Problem:** Connection mode doesn't work

**Solutions:**
1. Press `L` key first (blue banner should appear)
2. Click on the sticky itself, not empty space
3. Can't connect sticky to itself (try different target)
4. Press Escape and try again if stuck

### Stickies Won't Snap to Lanes

**Problem:** Manual dragging doesn't align to lanes

**Solutions:**
1. Verify snap-to-grid is enabled in settings
2. Release mouse button to trigger snap
3. Stickies snap on drag end, not during drag
4. Try small movements to see snap behavior

## Best Practices

### Naming Conventions

**Events (Orange):**
- Past tense: "Order Placed", "Payment Processed"
- Domain language: Use business terms, not technical jargon
- Specific: "Customer Registered" not just "Registration"

**Commands (Blue):**
- Imperative: "Place Order", "Process Payment"
- User intent: What the actor wants to accomplish
- Active voice: "Submit Form" not "Form Submitted"

**Actors (Yellow):**
- Nouns: "Customer", "Administrator", "Payment System"
- Specific roles: "Warehouse Manager" not just "User"
- Systems as actors: "Email Service", "Inventory System"

### Layout Strategy

**Horizontal (Time):**
- Left to right = chronological
- Align related events vertically
- Group bounded contexts with white space

**Vertical (Swim Lanes):**
- One actor per lane (optional)
- Parallel processes in separate lanes
- Related aggregates stay together

### Color Usage

**Core Flow:** Orange events + Blue commands
**Supporting:** Yellow actors + Green read models
**Boundaries:** Yellow aggregate boxes
**Issues:** Purple questions + Red hotspots

### Workshop Pacing

**Fast:** Keyboard shortcuts for rapid exploration
**Slow:** Mouse/drag for careful positioning
**Mixed:** Keyboard for content, mouse for refinement

## Advanced Techniques

### Aggregate Discovery

1. Create events first (all orange stickies)
2. Look for clusters of related events
3. Press `G` to create aggregate box
4. Drag and resize to encompass cluster
5. Name aggregate based on consistency boundary

### Policy Identification

1. Look for "When X happens, then Y happens" patterns
2. Press `P` to create policy sticky
3. Place between trigger event and resulting command
4. Label: "When [event], then [command]"
5. Connect: event → policy → command

### Hotspot Marking

1. During discussion, mark contentious areas
2. Press `H` for hotspot sticky
3. Describe the problem or uncertainty
4. Revisit in later phases
5. Convert to questions or decisions later

## Exporting Your Work

### Current Export Options

**Save Diagram:**
- File → Save (Ctrl+S)
- Saves as JSON in git repository
- Includes all stickies and connections
- Preserves layout and metadata

**Export Image:**
- File → Export → PNG/SVG
- High-quality raster or vector
- Good for presentations
- No semantic information preserved

### Coming Soon

**Markdown Export:**
- Structured text format
- Event list with metadata
- Command-event mappings
- Good for documentation

**Code Generation:**
- TypeScript event classes
- Aggregate scaffolding
- Command/Event interfaces
- Domain model starter code

## Further Learning

### Event Storming Resources

- **Book:** "Introducing Event Storming" by Alberto Brandolini
- **Website:** eventstorming.com
- **Community:** DDD Europe, Domain-Driven Design Discord
- **Videos:** YouTube search "Alberto Brandolini Event Storming"

### OpenChart Resources

- **Documentation:** /docs in repository
- **Issues:** GitHub issues for bugs/features
- **Discussions:** GitHub Discussions for questions
- **Examples:** /examples directory with sample diagrams

## Support

For questions or issues:
1. Check this guide first
2. Search GitHub Issues
3. Ask in GitHub Discussions
4. File a bug report if needed

Happy Event Storming! 🎉