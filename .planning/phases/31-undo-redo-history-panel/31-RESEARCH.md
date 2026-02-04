# Phase 31: Undo/Redo History Panel - Research

**Researched:** 2026-01-27
**Domain:** React state visualization, time-travel debugging UI, undo/redo history
**Confidence:** HIGH

## Summary

This phase builds a visual debug panel for the existing Zustand + Zundo undo/redo system. The project already uses `zundo@2.3.0` temporal middleware (Phase 2) with a 50-state history limit and field partialization. The task is **pure visualization** - no new undo/redo logic needed.

**Standard approach:** Use `react-resizable-panels` for collapsible bottom panel, create custom hook with `useStoreWithEqualityFn` to reactively access `pastStates` and `futureStates`, display timeline list with timestamps, action inference from state diffs, and time-travel clicking. Virtualize with `react-window` if performance suffers with 50-entry lists.

**Primary recommendation:** Build a bottom panel (collapsible, resizable) showing chronological history entries with timestamps, affected element names, and property summaries. Enable time-travel by calling `temporal.undo(n)` or `temporal.redo(n)`. Use existing `react-hotkeys-hook@5.2.3` for toggle shortcut (Ctrl+Shift+H).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zundo | 2.3.0 | Temporal middleware for Zustand | Already installed, provides `pastStates`/`futureStates` arrays and time-travel methods |
| react-resizable-panels | Latest | Collapsible/resizable panel layout | Industry standard by bvaughn, used in VS Code-like UIs, supports keyboard resize |
| react-hotkeys-hook | 5.2.3 | Keyboard shortcuts | Already installed, supports `enableOnFormTags` for global shortcuts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-window | Latest | List virtualization | If 50-entry list causes scroll jank (unlikely at this scale) |
| javascript-time-ago | Latest | Relative time formatting ("2 min ago") | For human-friendly timestamps instead of absolute times |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-resizable-panels | react-split-pane | Older library, less maintained, no imperative API |
| react-window | react-virtuoso | Overkill for fixed-size list items, heavier bundle |
| Custom diff library | react-diff-viewer | Overkill - simple property comparison sufficient |

**Installation:**
```bash
npm install react-resizable-panels
# Optional for relative timestamps
npm install javascript-time-ago react-time-ago
# Optional if virtualization needed
npm install react-window @types/react-window
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Layout/
│   │   ├── BottomPanel.tsx          # Collapsible history panel container
│   │   └── ThreePanelLayout.tsx     # UPDATE: Add bottom panel to layout
│   └── History/
│       ├── HistoryPanel.tsx         # Main history component
│       ├── HistoryEntry.tsx         # Single history item
│       ├── HistoryTimeline.tsx      # Scrollable list of entries
│       └── useHistoryStore.tsx      # Reactive temporal hook
├── hooks/
│   └── useTemporalStore.ts          # Generic reactive temporal hook
```

### Pattern 1: Reactive Temporal Hook
**What:** Access `pastStates`/`futureStates` reactively in components
**When to use:** Any component that displays or responds to history changes
**Example:**
```typescript
// Source: https://github.com/charkour/zundo (official docs)
import { useStoreWithEqualityFn } from 'zustand/traditional'
import type { TemporalState } from 'zundo'
import { useStore } from '../store'

// The project uses partialize, so only tracked fields are in history
type TrackedState = Pick<Store, 'elements' | 'canvasWidth' | 'canvasHeight' | 'backgroundColor'>

export function useTemporalStore<T>(
  selector: (state: TemporalState<TrackedState>) => T,
  equality?: (a: T, b: T) => boolean,
) {
  return useStoreWithEqualityFn(useStore.temporal, selector, equality)
}

// Usage in component:
const pastStates = useTemporalStore((state) => state.pastStates)
const futureStates = useTemporalStore((state) => state.futureStates)
const { undo, redo } = useTemporalStore((state) => state)
```

### Pattern 2: Time-Travel Navigation
**What:** Jump to arbitrary history position by calculating step distance
**When to use:** Click-to-navigate in history panel
**Example:**
```typescript
// Source: https://github.com/charkour/zundo - undo(n) API
function jumpToHistoryIndex(targetIndex: number) {
  const { pastStates, futureStates, undo, redo } = useStore.temporal.getState()
  const currentIndex = pastStates.length // Current is at end of pastStates

  if (targetIndex < currentIndex) {
    // Going back: undo (currentIndex - targetIndex) steps
    undo(currentIndex - targetIndex)
  } else if (targetIndex > currentIndex) {
    // Going forward: redo (targetIndex - currentIndex) steps
    redo(targetIndex - currentIndex)
  }
  // targetIndex === currentIndex: already there
}
```

### Pattern 3: Layout with Bottom Panel
**What:** Add collapsible bottom panel without disrupting existing layout
**When to use:** Adding debug/utility panels to multi-panel layouts
**Example:**
```typescript
// Source: https://github.com/bvaughn/react-resizable-panels (examples)
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PanelGroup direction="vertical">
      {/* Top section: existing three-panel layout */}
      <Panel defaultSize={80} minSize={30}>
        <ThreePanelLayout>
          {children}
        </ThreePanelLayout>
      </Panel>

      <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-500" />

      {/* Bottom section: history panel */}
      <Panel
        defaultSize={20}
        minSize={10}
        maxSize={50}
        collapsible={true}
        collapsedSize={0}
      >
        <HistoryPanel />
      </Panel>
    </PanelGroup>
  )
}
```

### Pattern 4: Inferring Actions from State Changes
**What:** Derive action type by comparing consecutive states
**When to use:** When action names aren't tracked (zundo doesn't store them by default)
**Example:**
```typescript
type HistoryAction = 'add' | 'update' | 'delete' | 'move' | 'resize' | 'other'

function inferAction(before: TrackedState, after: TrackedState): HistoryAction {
  const beforeIds = new Set(before.elements.map(el => el.id))
  const afterIds = new Set(after.elements.map(el => el.id))

  // Detect adds
  const added = after.elements.filter(el => !beforeIds.has(el.id))
  if (added.length > 0) return 'add'

  // Detect deletes
  const deleted = before.elements.filter(el => !afterIds.has(el.id))
  if (deleted.length > 0) return 'delete'

  // Detect moves/resizes (same elements, different positions/sizes)
  for (const afterEl of after.elements) {
    const beforeEl = before.elements.find(el => el.id === afterEl.id)
    if (!beforeEl) continue

    if (beforeEl.x !== afterEl.x || beforeEl.y !== afterEl.y) return 'move'
    if (beforeEl.width !== afterEl.width || beforeEl.height !== afterEl.height) return 'resize'
  }

  return 'update'
}
```

### Anti-Patterns to Avoid
- **Directly accessing `temporal.getState()` in components:** Not reactive, won't trigger re-renders when history changes
- **Deep-copying pastStates/futureStates:** History arrays can be 50 entries × 10KB state = 500KB+. Avoid unnecessary clones.
- **Rendering full state diffs:** Too verbose, show only affected fields
- **Storing action names in separate tracking:** Zustand actions are just functions - infer from state diffs instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resizable panels | Custom drag handlers + state | react-resizable-panels | Handle edge cases (min/max sizes, keyboard resize, persistence), battle-tested in VS Code-like UIs |
| Reactive temporal state | Manual subscriptions to store | useStoreWithEqualityFn | Zundo's pastStates/futureStates aren't reactive by default, requires proper selector pattern |
| Long list scrolling | Naive .map() rendering | react-window (if needed) | DOM thrashing with 50+ items, especially if re-renders happen frequently |
| Time formatting | Manual Date() calculations | javascript-time-ago | Localization, relative time logic ("just now" vs "2 hours ago"), automatic updates |

**Key insight:** The temporal middleware is already working - don't try to "improve" it with custom tracking. Zundo's limit + partialize configuration is optimal for this use case (50 states, ~10KB tracked state = ~500KB max memory).

## Common Pitfalls

### Pitfall 1: Non-Reactive History Access
**What goes wrong:** History panel doesn't update when undo/redo happens
**Why it happens:** Direct `temporal.getState()` calls don't subscribe to changes
**How to avoid:** Always use `useTemporalStore` hook with selector
**Warning signs:** Console shows history changing but UI doesn't update

### Pitfall 2: Memory Leaks with Deep Cloning
**What goes wrong:** Copying entire pastStates array causes memory bloat
**Why it happens:** Each history entry is ~10KB (elements + canvas), 50 entries = 500KB. Copying multiplies this.
**How to avoid:** Reference history arrays directly, only copy when mutating
**Warning signs:** Browser DevTools shows increasing heap size over time

### Pitfall 3: Rendering Too Much Detail
**What goes wrong:** Showing full state snapshots makes panel unusable
**Why it happens:** State objects have many fields (x, y, width, height, rotation, colors, etc.)
**How to avoid:** Show summary only: "Updated Button #1: x: 100 → 150"
**Warning signs:** History entries span multiple lines, panel is cluttered

### Pitfall 4: Action Name Confusion
**What goes wrong:** Trying to track "action names" like Redux DevTools
**Why it happens:** Redux has explicit action.type, Zustand doesn't
**How to avoid:** Infer action from state diff (add/update/delete/move)
**Warning signs:** Adding custom tracking, wrapping store methods

### Pitfall 5: Keyboard Shortcut Conflicts
**What goes wrong:** Ctrl+Shift+H conflicts with browser/OS shortcuts
**Why it happens:** Not all shortcuts are safe across platforms
**How to avoid:** Test on Windows/Mac/Linux, use less common combinations if needed
**Warning signs:** Shortcut works in dev but not production/different OS

### Pitfall 6: Layout Thrashing
**What goes wrong:** Bottom panel causes content jumps when toggled
**Why it happens:** Improper panel sizing, no smooth transitions
**How to avoid:** Use react-resizable-panels' collapsible with collapsedSize={0}
**Warning signs:** Canvas/panels visibly resize/reposition when history panel opens

## Code Examples

Verified patterns from official sources:

### Time-Travel Undo/Redo with Steps
```typescript
// Source: https://github.com/charkour/zundo - API documentation
import { useStore } from './store'

function HistoryControls() {
  const { undo, redo } = useStore.temporal.getState()

  // Undo single step (Ctrl+Z)
  const handleUndo = () => undo()

  // Redo single step (Ctrl+Y)
  const handleRedo = () => redo()

  // Time-travel: jump back 5 steps
  const jumpBack5 = () => undo(5)

  // Time-travel: jump forward 3 steps
  const jumpForward3 = () => redo(3)

  return (
    <div>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={jumpBack5}>Jump Back 5</button>
      <button onClick={jumpForward3}>Jump Forward 3</button>
    </div>
  )
}
```

### Keyboard Shortcut for Panel Toggle
```typescript
// Source: Project's existing useKeyboardShortcuts.ts
import { useHotkeys } from 'react-hotkeys-hook'
import { useState } from 'react'

function useHistoryPanelToggle() {
  const [isPanelVisible, setIsPanelVisible] = useState(false)

  // Ctrl+Shift+H (Cmd+Shift+H on Mac)
  useHotkeys(
    'ctrl+shift+h, meta+shift+h',
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsPanelVisible(prev => !prev)
    },
    {
      preventDefault: true,
      enableOnFormTags: true,  // Works even in text inputs
      enableOnContentEditable: true
    }
  )

  return { isPanelVisible, setIsPanelVisible }
}
```

### Collapsible Panel with react-resizable-panels
```typescript
// Source: https://react-resizable-panels.vercel.app/examples/collapsible
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

function LayoutWithHistory() {
  return (
    <PanelGroup direction="vertical">
      <Panel defaultSize={75} minSize={30}>
        {/* Main content */}
      </Panel>

      <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-500 cursor-ns-resize" />

      <Panel
        defaultSize={25}
        minSize={15}
        maxSize={60}
        collapsible={true}
        collapsedSize={0}
      >
        <HistoryPanel />
      </Panel>
    </PanelGroup>
  )
}
```

### History Entry Display
```typescript
// Pattern derived from Redux DevTools and common state management UIs
interface HistoryEntryProps {
  index: number
  state: TrackedState
  previousState: TrackedState | null
  isCurrent: boolean
  onJump: (index: number) => void
}

function HistoryEntry({ index, state, previousState, isCurrent, onJump }: HistoryEntryProps) {
  const action = previousState ? inferAction(previousState, state) : 'initial'
  const timestamp = Date.now() - (index * 1000) // Approximate

  // Find affected elements
  const affected = previousState
    ? state.elements.filter(el => {
        const prev = previousState.elements.find(p => p.id === el.id)
        return !prev || JSON.stringify(prev) !== JSON.stringify(el)
      })
    : state.elements

  return (
    <div
      onClick={() => onJump(index)}
      className={`
        p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800
        ${isCurrent ? 'bg-blue-900' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{formatTime(timestamp)}</span>
        <span className={`text-xs font-medium ${ACTION_COLORS[action]}`}>
          {action.toUpperCase()}
        </span>
      </div>
      <div className="text-sm text-gray-300 mt-1">
        {affected.length > 0 ? (
          <span>{affected.length} element(s): {affected.map(el => el.name).join(', ')}</span>
        ) : (
          <span>Canvas properties</span>
        )}
      </div>
    </div>
  )
}

const ACTION_COLORS: Record<string, string> = {
  add: 'text-green-400',
  delete: 'text-red-400',
  update: 'text-blue-400',
  move: 'text-yellow-400',
  resize: 'text-purple-400',
  initial: 'text-gray-400',
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux + custom undo | Zustand + zundo middleware | 2023-2024 | Simpler API, <1KB bundle, temporal.undo(n) for multi-step |
| react-virtualized | react-window | 2019 | Smaller bundle, faster, tree-shakeable |
| Manual subscriptions | useStoreWithEqualityFn | Zustand v4+ | Proper reactivity without manual cleanup |
| Absolute timestamps | Relative time formatting | 2020+ | Better UX ("2 min ago" vs "14:32:15") |

**Deprecated/outdated:**
- redux-undo: Superseded by framework-agnostic solutions like zundo
- react-resizable (different from react-resizable-panels): Lower-level, requires more boilerplate
- Custom time-travel implementations: Zundo's `undo(n)` and `redo(n)` handle this natively

## Open Questions

Things that couldn't be fully resolved:

1. **Timestamp Storage**
   - What we know: Zundo stores state snapshots, not timestamps
   - What's unclear: Should we store timestamps separately or infer from history index?
   - Recommendation: Store creation time in component state when panel mounts, calculate relative times from index position. Less accurate but avoids modifying temporal logic.

2. **Action Name Persistence**
   - What we know: Zustand doesn't track action names by default (unlike Redux)
   - What's unclear: Is it worth adding devtools middleware for action tracking?
   - Recommendation: Infer actions from state diffs (add/update/delete/move). Good enough for debugging, doesn't require middleware changes.

3. **Panel Position (Bottom vs Side)**
   - What we know: Success criteria says "bottom panel"
   - What's unclear: Horizontal space is limited in three-panel layout
   - Recommendation: Bottom panel is correct. Use collapsible + resizable to avoid taking permanent space. Consider allowing drag-to-detach in future phase.

4. **Performance at 50-Entry Limit**
   - What we know: 50 entries × ~10KB state = 500KB memory, likely fine
   - What's unclear: Will re-rendering 50 entries on every state change cause jank?
   - Recommendation: Start without virtualization. Add react-window only if scroll performance is poor. Likely unnecessary at this scale.

## Sources

### Primary (HIGH confidence)
- [GitHub - charkour/zundo](https://github.com/charkour/zundo) - Temporal API, pastStates/futureStates, reactive hook pattern
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - Panel components, collapsible behavior, keyboard resize
- [React Hotkeys Hook API](https://react-hotkeys-hook.vercel.app/docs/api/use-hotkeys) - useHotkeys options, enableOnFormTags
- Project codebase - Existing Zustand store with zundo@2.3.0, partialize config, keyboard shortcuts

### Secondary (MEDIUM confidence)
- [LogRocket: Redux DevTools Tips](https://blog.logrocket.com/redux-devtools-tips-tricks-for-faster-debugging/) - Time-travel UI patterns, history visualization
- [react-window Web.dev Article](https://web.dev/articles/virtualize-long-lists-react-window) - List virtualization best practices
- [DEV.to: Rethinking Undo/Redo](https://dev.to/unadlib/rethinking-undoredo-why-we-need-travels-2lcc) - Memory considerations for snapshot-based undo

### Tertiary (LOW confidence)
- WebSearch: "zundo temporal state memory leak performance" - General performance considerations, not specific documented issues with zundo itself
- WebSearch: "react diff viewer libraries" - Explored but deemed unnecessary for this use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are installed (zundo, react-hotkeys-hook) or industry standard (react-resizable-panels)
- Architecture: HIGH - Temporal hook pattern verified in zundo docs, layout pattern standard for panel UIs
- Pitfalls: MEDIUM - Common patterns from Redux DevTools/state management UIs, but zundo-specific pitfalls are inferred

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stack is mature and stable)
