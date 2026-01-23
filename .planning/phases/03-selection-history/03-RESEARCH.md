# Phase 3: Selection & History - Research

**Researched:** 2026-01-23
**Domain:** Selection model, undo/redo architecture with command pattern
**Confidence:** HIGH

## Summary

This phase implements a selection system (click, shift-click, marquee) and undo/redo functionality using command pattern architecture. The tech stack leverages existing Zustand store with zundo temporal middleware (already integrated), react-hotkeys-hook for keyboard shortcuts, and HTML/CSS-based selection visuals.

The standard approach for this domain combines:
- **Zustand + zundo** for state management with temporal middleware (limit: 50, partialize to exclude viewport)
- **Command pattern** storing minimal deltas rather than full state snapshots to avoid memory bloat
- **AABB intersection detection** for marquee selection using getBoundingClientRect()
- **react-hotkeys-hook** for declarative keyboard shortcut handling (Ctrl+Z, Ctrl+Y, Delete)

The critical pitfall is naive snapshot-based undo (Memento pattern) which doesn't scale beyond trivial apps. Command pattern with delta storage is proven for 50+ operations without memory issues. Viewport state must remain excluded from undo history to prevent confusing user experience.

**Primary recommendation:** Use zundo temporal middleware (already configured) with command pattern for all undoable actions. Each command stores only the delta needed to reverse itself (e.g., element IDs + position delta for move). Marquee selection uses getBoundingClientRect() with AABB intersection algorithm. Keyboard shortcuts via react-hotkeys-hook with preventDefault.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.x | State management | Lightweight, prevents 40-70% more re-renders than Context API, selective subscriptions |
| zundo | 2.3.0 | Undo/redo middleware | <700B, integrates with Zustand temporal API, configurable history limit |
| react-hotkeys-hook | 5.2.3 | Keyboard shortcuts | Declarative hook-based API, full TypeScript support, 81 releases (stable) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand/shallow | (built-in) | Prevent re-renders on multi-select | When selecting multiple state values (e.g., selectedIds + elements) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hotkeys-hook | Custom keyboard handler | Custom = fewer dependencies but requires manual event cleanup, modifier key detection, scope management |
| zundo | Redux Toolkit with time-travel | RTK = more boilerplate, larger bundle, but better for enterprise apps requiring dev tools |
| AABB intersection | box-intersect npm package | Library = O((n+m)log^d(n+m)) for any dimension, but overkill for 2D axis-aligned boxes |

**Installation:**
```bash
npm install react-hotkeys-hook
# zustand and zundo already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── commands/              # Command pattern implementations
│   ├── CommandManager.ts  # Undo/redo stack management
│   ├── types.ts           # Command interface
│   ├── DeleteCommand.ts   # Delete elements command
│   └── index.ts
├── store/
│   ├── selectionSlice.ts  # Selection state (selectedIds, lastSelected)
│   └── index.ts           # Already has zundo configured
├── components/Canvas/
│   ├── SelectionOverlay.tsx   # Visual selection boxes
│   ├── MarqueeSelection.tsx   # Drag selection rectangle
│   └── hooks/
│       ├── useSelection.ts    # Click/shift-click logic
│       ├── useMarquee.ts      # Drag selection logic
│       └── useKeyboardShortcuts.ts  # Hotkeys
└── utils/
    └── intersection.ts    # AABB collision detection
```

### Pattern 1: Command Pattern for Undo/Redo
**What:** Each undoable action is an object with `execute()` and `undo()` methods. Store minimal delta data, not full state snapshots.

**When to use:** All user actions that modify element state (delete, move, property changes). NOT for viewport changes (pan/zoom).

**Example:**
```typescript
// commands/types.ts
export interface Command {
  execute(): void
  undo(): void
}

// commands/DeleteCommand.ts
export class DeleteCommand implements Command {
  private deletedElements: ElementConfig[]

  constructor(
    private elementIds: string[],
    private store: StoreApi<Store>
  ) {
    // Store only what's needed to undo
    const state = store.getState()
    this.deletedElements = elementIds
      .map(id => state.getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)
  }

  execute(): void {
    this.elementIds.forEach(id => {
      this.store.getState().removeElement(id)
    })
  }

  undo(): void {
    const state = this.store.getState()
    this.deletedElements.forEach(el => {
      state.addElement(el)
    })
  }
}
```

### Pattern 2: Selection State Management
**What:** Track `selectedIds` array and `lastSelectedId` for shift-click range selection. Use shallow equality to prevent re-renders.

**When to use:** Any component that needs to know selection state or modify selection.

**Example:**
```typescript
// store/selectionSlice.ts
export interface SelectionSlice {
  selectedIds: string[]
  lastSelectedId: string | null

  selectElement: (id: string) => void
  toggleSelection: (id: string) => void
  selectRange: (startId: string, endId: string) => void
  clearSelection: () => void
}

// Component usage with shallow equality
import { shallow } from 'zustand/shallow'

const { selectedIds, elements } = useStore(
  (state) => ({
    selectedIds: state.selectedIds,
    elements: state.elements
  }),
  shallow  // Prevents re-render if arrays have same contents
)
```

### Pattern 3: AABB Intersection Detection
**What:** Axis-Aligned Bounding Box collision detection for marquee selection. Test if rectangles overlap by checking both axes.

**When to use:** Marquee drag selection to determine which elements intersect with selection rectangle.

**Example:**
```typescript
// utils/intersection.ts
// Source: https://www.joshuawootonn.com/react-drag-to-select
export function intersect(rect1: DOMRect, rect2: DOMRect): boolean {
  // Check if separated horizontally
  if (rect1.right < rect2.left || rect2.right < rect1.left) return false

  // Check if separated vertically
  if (rect1.bottom < rect2.top || rect2.bottom < rect1.top) return false

  // No separation means intersection
  return true
}

// Usage in marquee selection
const checkIntersections = () => {
  const marqueeRect = marqueeRef.current?.getBoundingClientRect()
  if (!marqueeRect) return

  const intersecting = elements.filter(el => {
    const elRect = document
      .querySelector(`[data-element-id="${el.id}"]`)
      ?.getBoundingClientRect()

    return elRect && intersect(marqueeRect, elRect)
  })

  setSelectedIds(intersecting.map(el => el.id))
}
```

### Pattern 4: Keyboard Shortcuts with react-hotkeys-hook
**What:** Declarative hotkey management using useHotkeys hook with preventDefault to override browser defaults.

**When to use:** Delete key, Ctrl+Z/Y shortcuts, Escape to clear selection.

**Example:**
```typescript
// components/Canvas/hooks/useKeyboardShortcuts.ts
import { useHotkeys } from 'react-hotkeys-hook'

export function useKeyboardShortcuts() {
  const { undo, redo } = useStore.temporal.getState()
  const { selectedIds, removeElement, clearSelection } = useStore()

  useHotkeys('ctrl+z', () => {
    undo()
  }, { preventDefault: true })

  useHotkeys('ctrl+y, ctrl+shift+z', () => {
    redo()
  }, { preventDefault: true })

  useHotkeys('delete, backspace', () => {
    if (selectedIds.length > 0) {
      // Use command pattern here for undo support
      selectedIds.forEach(removeElement)
      clearSelection()
    }
  }, { preventDefault: true })

  useHotkeys('escape', () => {
    clearSelection()
  })
}
```

### Pattern 5: Shift-Click Range Selection
**What:** Track last selected item. On shift+click, find all elements between last and current, add to selection.

**When to use:** Multi-select with shift+click on elements.

**Example:**
```typescript
// components/Canvas/hooks/useSelection.ts
export function useSelection() {
  const { elements, selectedIds, lastSelectedId, selectRange } = useStore()

  const handleClick = (elementId: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      // Find indices
      const lastIndex = elements.findIndex(el => el.id === lastSelectedId)
      const currentIndex = elements.findIndex(el => el.id === elementId)

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex)
        const end = Math.max(lastIndex, currentIndex)
        const rangeIds = elements.slice(start, end + 1).map(el => el.id)

        selectRange(rangeIds)
      }
    } else if (event.ctrlKey || event.metaKey) {
      toggleSelection(elementId)
    } else {
      selectElement(elementId)
    }
  }

  return { handleClick }
}
```

### Anti-Patterns to Avoid

- **Naive snapshots (Memento pattern):** Storing full state copies for each undo action leads to memory bloat. Memory usage = object size × history depth. For 50 actions with 1MB state, that's 50MB. Use command pattern with deltas instead.

- **Including viewport in undo:** Pan/zoom should NOT be undoable. Users expect undo to reverse content changes, not camera movements. Already configured via `partialize` in store.

- **Text selection during shift-click:** Browser default text selection interferes with multi-select. Use `user-select: none` CSS and prevent default on shift+click events.

- **Storing indices instead of IDs:** Element list can be reordered. Storing element index breaks when order changes. Always store and operate on element IDs.

- **Multiple keyboard event listeners:** Attaching useHotkeys in many components creates overhead. Centralize keyboard shortcuts in a single top-level component or custom hook.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Undo/redo stack management | Custom undo array with push/pop | zundo temporal middleware | Handles limit overflow (FIFO), partialize to exclude fields, equality checking to prevent duplicate snapshots, already integrated |
| Keyboard shortcut detection | document.addEventListener('keydown') with if/else | react-hotkeys-hook | Handles modifier keys, key combos, sequences, preventDefault, scope management, cleanup |
| Rectangle intersection | Custom coordinate math | AABB intersection algorithm | Handles edge cases (negative dimensions, containment vs overlap), proven O(1) performance |
| State snapshot comparison | JSON.stringify for equality | zustand/shallow or fast-deep-equal | Shallow prevents re-renders when array contents unchanged, stringify fails on circular refs and is slower |

**Key insight:** Undo/redo systems have surprising complexity: command batching (multiple updates = one undo), memory management (history limits), side effects (UI updates during undo), and concurrent actions (undo while action pending). Libraries handle these edge cases that custom implementations miss.

## Common Pitfalls

### Pitfall 1: Unbounded History Growth
**What goes wrong:** Without `limit` configuration, zundo accumulates snapshots indefinitely. With 50+ operations and large state objects, memory usage becomes problematic.

**Why it happens:** zundo default behavior stores every state change unless configured otherwise.

**How to avoid:**
- Set `limit: 50` in temporal middleware options (already configured in store)
- Use `partialize` to exclude non-undoable state (viewport, UI state)
- Configure `equality` function to prevent storing duplicate snapshots

**Warning signs:**
- Browser memory usage grows continuously during session
- Performance degradation after many operations
- DevTools show large temporal state arrays

### Pitfall 2: Undo Clears Redo Stack Unexpectedly
**What goes wrong:** Users undo multiple actions, then make a new change. All redo history disappears. Users complain they "lost" work.

**Why it happens:** Standard undo/redo behavior prevents branching histories. New action after undo = new timeline, old redo stack cleared.

**How to avoid:** This is correct behavior per UX conventions (Figma, Photoshop, etc.). Document in user education, not code.

**Warning signs:** User reports "redo stopped working after I made a change"

### Pitfall 3: Drag Granularity Creates Thousands of Undo Steps
**What goes wrong:** Treating every mousemove during drag as separate undo action. 100px drag = 100 undo steps. Users must Ctrl+Z 100 times to undo one drag.

**Why it happens:** Naively creating command for every position update instead of batching.

**How to avoid:**
- One command per drag operation (mousedown → mouseup)
- Store delta (startPos → endPos), not intermediate states
- Command stores cumulative change, executes once

**Warning signs:**
- Undo only moves element tiny amounts
- History limit reached quickly during drag operations
- Users need many Ctrl+Z to reverse one visual action

### Pitfall 4: Text Selection During Shift-Click
**What goes wrong:** User shift+clicks to multi-select elements. Browser interprets as text selection, highlights text instead of selecting elements.

**Why it happens:** Browser default shift+click behavior for text selection has higher precedence.

**How to avoid:**
- CSS: `user-select: none` on selectable elements
- JS: `event.preventDefault()` on shift+click events
- Listen for `selectstart` event and conditionally block

**Warning signs:**
- Blue text highlight appears during multi-select attempts
- Selection state updates but visual feedback shows text selection

### Pitfall 5: getBoundingClientRect() During Scroll/Transform
**What goes wrong:** Marquee selection uses cached element positions. User scrolls or zooms canvas. Intersection detection uses stale coordinates, selects wrong elements.

**Why it happens:** getBoundingClientRect() returns viewport-relative coordinates. Scroll/zoom changes viewport without updating cached rects.

**How to avoid:**
- Query getBoundingClientRect() fresh on every marquee update
- Account for canvas transform (scale, offset) in intersection calculation
- Use canvas-relative coordinates, not viewport-relative

**Warning signs:**
- Marquee selects different elements after zoom/pan
- Selection rectangle visually overlaps element but doesn't select it
- Off-by-offset selection errors

### Pitfall 6: Command Pattern with Side Effects
**What goes wrong:** Command's execute() makes API calls, shows notifications, or triggers animations. Undo reverses state but side effects already occurred.

**Why it happens:** Confusing state management with side effects in command logic.

**How to avoid:**
- Commands modify only Zustand state
- Side effects happen via useEffect watching state changes
- Undo reverses state, useEffect handles cleanup side effects

**Warning signs:**
- Undo shows notification twice (once for do, once for undo)
- API calls sent but state reverted
- Animations don't reverse with undo

## Code Examples

Verified patterns from official sources:

### Accessing Zundo Temporal API
```typescript
// Store already configured with zundo in src/store/index.ts
import { useStore } from '@/store'

// In component
const { undo, redo, clear } = useStore.temporal.getState()

// Reactive temporal state (for undo/redo button enabled state)
function useTemporalStore<T>(
  selector: (state: TemporalState<Store>) => T
) {
  return useStore.temporal(selector)
}

// Check if undo/redo available
const canUndo = useTemporalStore(state => state.pastStates.length > 0)
const canRedo = useTemporalStore(state => state.futureStates.length > 0)
```

### Selection Visual Feedback (CSS Transform Performance)
```tsx
// components/Canvas/SelectionOverlay.tsx
export function SelectionOverlay({ elementId }: { elementId: string }) {
  const element = useStore(state => state.getElement(elementId))

  if (!element) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        // Use transform for GPU-accelerated rendering
        transform: `translate(${element.x}px, ${element.y}px)`,
        border: '2px solid #3b82f6',
        pointerEvents: 'none',
        // Smooth transition for selection appearance
        transition: 'opacity 0.2s ease',
      }}
    />
  )
}
```

### Marquee Drag Selection with Auto-Scroll
```typescript
// components/Canvas/hooks/useMarquee.ts
// Source: https://www.joshuawootonn.com/react-drag-to-select
export function useMarquee() {
  const [dragVector, setDragVector] = useState<DOMVector | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    const container = containerRef.current?.getBoundingClientRect()
    if (!container) return

    const startX = e.clientX - container.left
    const startY = e.clientY - container.top

    setDragVector(new DOMVector(startX, startY, 0, 0))
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragVector) return

    const container = containerRef.current?.getBoundingClientRect()
    if (!container) return

    const currentX = e.clientX - container.left
    const currentY = e.clientY - container.top

    const magnitudeX = currentX - dragVector.x
    const magnitudeY = currentY - dragVector.y

    // Only activate marquee after 10px threshold
    if (Math.abs(magnitudeX) > 10 || Math.abs(magnitudeY) > 10) {
      setDragVector(new DOMVector(
        dragVector.x,
        dragVector.y,
        magnitudeX,
        magnitudeY
      ))

      checkIntersections()
    }
  }

  const handlePointerUp = () => {
    setDragVector(null)
  }

  return {
    containerRef,
    dragVector,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux + custom undo middleware | Zustand + zundo | 2023-2024 | 40-70% fewer re-renders, <1KB vs 10KB bundle, simpler API |
| Memento pattern (state snapshots) | Command pattern (deltas) | Established pattern | Memory usage: O(n × state_size) → O(n × delta_size), enables 50+ history depth |
| Class-based commands | TypeScript interface commands | 2020+ | `type Command<Data> = { do: () => void, undo: () => void }` simpler than class hierarchy |
| Multiple keydown listeners | Centralized keyboard hook | 2024-2025 | react-hotkeys-hook v5 with scopes reduces overhead, better cleanup |
| Polling getBoundingClientRect | Lazy evaluation per frame | Current | Query coordinates when needed vs caching (invalidation complexity) |

**Deprecated/outdated:**
- **Snapshot-based undo**: Memento pattern only viable for very small state. Modern apps use command pattern with operation deltas.
- **Redux for small apps**: Zustand gained 30%+ YoY growth, now in ~40% of projects. Redux still correct for enterprise apps with time-travel debugging requirements.
- **Class-based commands**: TypeScript discriminated unions (`type DeleteCommand = { type: 'delete', ids: string[] }`) cleaner than OOP hierarchy.

## Open Questions

Things that couldn't be fully resolved:

1. **Viewport transform accounting in intersection detection**
   - What we know: getBoundingClientRect() returns viewport-relative coords. Canvas has transform (scale, offsetX, offsetY).
   - What's unclear: Exact math to convert marquee rect to canvas-relative coordinates for accurate intersection with transformed elements.
   - Recommendation: Test with canvas transform active. Likely need to divide marquee coords by scale and subtract offset before intersection check. Verify in Phase 3 implementation with zoom/pan active.

2. **Command batching strategy**
   - What we know: Drag = one undo action, not per-pixel. Property change = one action on blur/Enter.
   - What's unclear: How to batch multiple property changes in single edit session (e.g., user changes color, then size, then position in rapid succession without leaving property panel).
   - Recommendation: Start with per-blur granularity. If users request "undo all my changes to this element," add command batching (track "edit session" ID, batch commands with same ID).

3. **Selection persistence across undo/redo**
   - What we know: Element deletion removes IDs from selectedIds. Undo restores elements.
   - What's unclear: Should undo restore selection state, or should deleted element IDs remain cleared from selection?
   - Recommendation: Clear selection on delete, don't restore on undo. Prevents confusion (undo → element appears but still selected → user accidentally deletes again). Can revisit if users request.

## Sources

### Primary (HIGH confidence)
- **zundo GitHub**: https://github.com/charkour/zundo - Installation, API, configuration options (limit, partialize, equality)
- **react-hotkeys-hook GitHub**: https://github.com/JohannesKlauss/react-hotkeys-hook - v5.2.3 API, TypeScript support, preventDefault
- **Zustand official docs** (via search results): Slices pattern, shallow comparison, selective subscriptions
- **Joshua Wootonn's drag-to-select article**: https://www.joshuawootonn.com/react-drag-to-select - AABB intersection algorithm, getBoundingClientRect usage, marquee implementation

### Secondary (MEDIUM confidence)
- **esveo Command Pattern article**: https://www.esveo.com/en/blog/undo-redo-and-the-command-pattern/ - Command pattern structure, undo/redo stack management, best practices
- **JitBlox undo history article**: https://www.jitblox.com/blog/designing-a-lightweight-undo-history-with-typescript - TypeScript implementation patterns, memory considerations
- **MDN 3D Collision Detection**: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection - AABB algorithm fundamentals
- **GitHub Gist**: https://gist.github.com/Daniel-Hug/d7984d82b58d6d2679a087d896ca3d2b - Rectangle intersection functions
- **Multiple Medium articles** on React state management in 2026 - Zustand adoption rates, performance comparisons

### Tertiary (LOW confidence)
- **WebSearch**: "command pattern undo redo common mistakes" - General pitfalls (mixing memento/command, memory issues, side effects)
- **WebSearch**: "CSS transform performance 2026" - Transform/opacity GPU acceleration, 0.2-0.4s transition timing
- **WebSearch**: "React shift-click multi-select pitfalls" - Text selection interference, bidirectional selection, state tracking

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zustand + zundo already in use, react-hotkeys-hook latest stable version verified via official sources
- Architecture: HIGH - Command pattern for undo/redo is industry standard, AABB intersection algorithm proven for 2D collision detection, verified code examples from authoritative sources
- Pitfalls: MEDIUM-HIGH - Command pattern pitfalls verified from multiple sources, zundo-specific issues from GitHub discussions, selection pitfalls from real-world implementations. Viewport transform intersection needs verification during implementation.

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable domain, established patterns)
