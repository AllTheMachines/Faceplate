# Phase 32: Unsaved Changes Protection - Research

**Researched:** 2026-01-27
**Domain:** Browser-based dirty state tracking, warning dialogs, localStorage backup/recovery
**Confidence:** HIGH

## Summary

This phase implements a comprehensive unsaved changes protection system using React patterns with Zustand state management. The research reveals well-established patterns for each component:

1. **Dirty State Tracking**: Leverage Zustand's existing temporal middleware (zundo) which already tracks all state changes. Compare current state snapshot against last saved snapshot to determine dirty state.

2. **Visual Indicators**: Document title manipulation via `document.title` and conditional component styling are straightforward browser APIs with no special libraries needed.

3. **Browser Warnings**: The `beforeunload` event is the standard approach, though with significant limitations - modern browsers only show generic messages and require user interaction to trigger.

4. **localStorage Backup**: Zustand's `persist` middleware is purpose-built for this, with comprehensive error handling and partialize options. Debouncing via useEffect dependency arrays is sufficient for this app's scale.

5. **Relative Time Display**: `date-fns` library's `formatDistanceToNow` provides production-ready relative time formatting with localization support.

**Primary recommendation:** Use Zustand's built-in patterns (temporal snapshots for dirty detection, persist middleware for backup) rather than custom implementations. This leverages already-installed dependencies and integrates seamlessly with the existing store architecture.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.10+ | Dirty state tracking via temporal snapshots | Already in project, proven pattern for state comparison |
| zundo | 2.3.0+ | Temporal middleware for undo/redo (reuse for dirty state) | Already in project (Phase 31), tracks all state changes |
| date-fns | 4.x | Relative time formatting ("2 minutes ago") | Industry standard, tree-shakeable, zero-dependency functions |
| react (useEffect) | 18.3.1 | beforeunload listener lifecycle | Native React pattern, no library needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand/middleware (persist) | Built-in | localStorage backup with error handling | For crash recovery backup (optional but recommended) |
| zustand/middleware (subscribeWithSelector) | Built-in | Selective state subscriptions | If need to optimize which state changes trigger dirty flag |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | day.js | Smaller but less mature, date-fns already common in ecosystem |
| date-fns | Intl.RelativeTimeFormat | Native API but requires manual threshold logic and less friendly output |
| persist middleware | Custom localStorage | More control but loses error handling, migration support, quota detection |
| beforeunload | Custom router blocking | Only works for in-app navigation, doesn't prevent browser close |

**Installation:**
```bash
npm install date-fns
# All other dependencies already present (zustand, zundo)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   ├── dirtyStateSlice.ts      # Dirty state tracking, lastSaved timestamp
│   └── index.ts                # Add persist middleware config
├── hooks/
│   └── useBeforeUnload.ts      # beforeunload event lifecycle
│   └── useDirtyState.ts        # Dirty state detection hook
├── components/
│   ├── dialogs/
│   │   └── UnsavedChangesDialog.tsx  # 3-option warning dialog
│   └── Layout/
│       └── LeftPanel.tsx       # Update with dirty indicator, relative time
```

### Pattern 1: Dirty State Detection via Temporal Snapshots
**What:** Compare current store state against a "saved state snapshot" to determine if changes exist
**When to use:** When you have undo/redo middleware that already tracks state changes
**Example:**
```typescript
// In dirtyStateSlice.ts
import { StateCreator } from 'zustand'
import type { Store } from './index'

export interface DirtyStateSlice {
  savedStateSnapshot: string | null  // JSON snapshot of last saved state
  lastSavedTimestamp: number | null
  setSavedState: (snapshot: string, timestamp: number) => void
  isDirty: () => boolean
}

export const createDirtyStateSlice: StateCreator<Store, [], [], DirtyStateSlice> = (
  set,
  get
) => ({
  savedStateSnapshot: null,
  lastSavedTimestamp: null,

  setSavedState: (snapshot, timestamp) => {
    set({ savedStateSnapshot: snapshot, lastSavedTimestamp: timestamp })
  },

  isDirty: () => {
    const { savedStateSnapshot, elements, canvasWidth, canvasHeight, backgroundColor } = get()
    if (!savedStateSnapshot) return elements.length > 0  // Never saved, dirty if has content

    // Serialize current persistable state
    const currentSnapshot = JSON.stringify({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      // Include other persistable state slices
    })

    return currentSnapshot !== savedStateSnapshot
  },
})
```

### Pattern 2: beforeunload Event Hook
**What:** React hook that manages beforeunload lifecycle
**When to use:** For browser close/refresh warnings (most reliable native approach)
**Example:**
```typescript
// Source: Verified pattern from MDN Web APIs + React integration
// hooks/useBeforeUnload.ts
import { useEffect } from 'react'

export function useBeforeUnload(enabled: boolean, message?: string) {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Modern browsers require preventDefault() + returnValue
      event.preventDefault()
      event.returnValue = '' // Modern browsers ignore custom messages
      return '' // For older browsers
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, message])
}

// Usage in App.tsx or root component:
const isDirty = useStore((state) => state.isDirty())
useBeforeUnload(isDirty)
```

### Pattern 3: Document Title Asterisk Indicator
**What:** Prefix document title with asterisk when dirty
**When to use:** Universal pattern from desktop apps (VS Code, Notepad++, etc.)
**Example:**
```typescript
// In App.tsx or root component
import { useEffect } from 'react'
import { useStore } from './store'

function App() {
  const isDirty = useStore((state) => state.isDirty())

  useEffect(() => {
    const baseTitle = 'VST3 UI Designer'
    document.title = isDirty ? `* ${baseTitle}` : baseTitle

    return () => {
      document.title = baseTitle // Cleanup on unmount
    }
  }, [isDirty])

  // ... rest of app
}
```

### Pattern 4: Relative Time Display with Auto-Refresh
**What:** Display "Last saved: X ago" that updates periodically
**When to use:** For non-critical time displays where slight staleness is acceptable
**Example:**
```typescript
// Source: date-fns official docs
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

function LastSavedIndicator() {
  const lastSaved = useStore((state) => state.lastSavedTimestamp)
  const [, forceUpdate] = useState(0)

  // Refresh every 30 seconds to update "X ago" text
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!lastSaved) {
    return <span className="text-xs text-gray-500">Never saved</span>
  }

  return (
    <span className="text-xs text-gray-500">
      Last saved: {formatDistanceToNow(lastSaved, { addSuffix: true })}
    </span>
  )
}
```

### Pattern 5: localStorage Backup with Persist Middleware
**What:** Auto-backup to localStorage on every state change, with error handling
**When to use:** For crash recovery without implementing auto-save files
**Example:**
```typescript
// Source: Zustand persist middleware official docs
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { temporal } from 'zundo'

// Wrap temporal middleware with persist
export const useStore = create<Store>()(
  persist(
    temporal(
      (...a) => ({
        ...createCanvasSlice(...a),
        ...createElementsSlice(...a),
        // ... other slices
      }),
      {
        limit: 50,
        partialize: (state) => {
          // Exclude viewport/selection from undo history (existing)
          const { scale, offsetX, offsetY, isPanning, dragStart, lockAllMode,
            selectedIds, lastSelectedId, liveDragValues, ...rest } = state
          return rest
        },
      }
    ),
    {
      name: 'vst3-designer-backup',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential state for recovery
        elements: state.elements,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        backgroundColor: state.backgroundColor,
        assets: state.assets,
        knobStyles: state.knobStyles,
      }),
      // Optional: Handle quota exceeded errors
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate backup:', error)
        }
      },
    }
  )
)
```

### Pattern 6: Three-Option Warning Dialog
**What:** Standard desktop app pattern: Save / Don't Save / Cancel
**When to use:** For in-app navigation warnings (load template, new project)
**Example:**
```typescript
// Reuse existing dialog pattern from project
function UnsavedChangesDialog({ isOpen, onClose, onSave, onDiscard }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-white">Unsaved Changes</h2>
        <p className="text-gray-300 text-sm mb-6">
          You have unsaved changes. Save before continuing?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Don't Save
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Polling for state changes**: Don't setInterval to check isDirty. Use Zustand's reactive subscriptions.
- **Custom localStorage wrapper**: Don't build custom localStorage logic. Use persist middleware for error handling, quota detection, and migration support.
- **Storing entire temporal history in localStorage**: Only store current state snapshot, not undo/redo stacks (causes quota issues).
- **Blocking all navigation**: Don't prevent navigation when state is clean. Only show warnings when actually dirty.
- **Custom beforeunload messages**: Modern browsers ignore custom messages. Don't waste effort on custom wording - browser shows generic message.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative time formatting | Manual "X seconds/minutes/hours ago" logic | `date-fns` `formatDistanceToNow` | Handles edge cases (singular/plural, thresholds, localization) |
| localStorage quota handling | try/catch around setItem | Zustand persist middleware | Handles QuotaExceededError variants across browsers (code 22, 1014, NS_ERROR_DOM_QUOTA_REACHED) |
| Dirty state comparison | Deep equality check on every render | Zustand temporal snapshots | Already tracks state changes, JSON.stringify is sufficient for this use case |
| beforeunload cleanup | Manual event listener management | React useEffect with cleanup | Handles unmount, deps changes, avoids memory leaks |
| State change debouncing for localStorage | Custom debounce implementation | Zustand persist middleware (built-in batching) | Middleware already batches writes efficiently |

**Key insight:** This phase leverages existing infrastructure (zundo temporal tracking, browser APIs, Zustand patterns) rather than introducing new abstractions. Most complexity is already solved by dependencies in the project.

## Common Pitfalls

### Pitfall 1: False Positive Dirty State on Initial Load
**What goes wrong:** App shows "unsaved changes" immediately after loading a project, before user makes any edits
**Why it happens:** Saved snapshot is set during load but state initialization happens before snapshot is captured, or state includes non-persisted fields that differ
**How to avoid:**
- Call `setSavedState()` AFTER state is fully loaded and stabilized
- Ensure snapshot includes exactly the same fields as current state comparison
- Exclude derived/computed values from comparison
**Warning signs:** isDirty() returns true immediately after loadProjectFile() succeeds

### Pitfall 2: beforeunload Fires on Every Navigation
**What goes wrong:** Warning shows even when navigating within the app (if using React Router in future)
**Why it happens:** beforeunload fires for all window unload events, including SPA navigation in some cases
**How to avoid:**
- Only enable beforeunload when state is dirty: `useBeforeUnload(isDirty)`
- For SPA navigation warnings, use React Router's blocking feature separately (not applicable to current project)
**Warning signs:** Users report seeing warnings when clicking in-app buttons/links

### Pitfall 3: localStorage Quota Exceeded Crashes App
**What goes wrong:** Large projects cause QuotaExceededError, localStorage.setItem throws, app crashes
**Why it happens:** localStorage limit is ~5-10MB per origin; error handling is missing
**How to avoid:**
- Use Zustand persist middleware which handles QuotaExceededError gracefully
- Only persist essential state (use partialize to exclude non-essential data)
- Consider clearing old backups if user explicitly saves (reduce storage usage)
- Wrap any manual localStorage calls in try/catch with specific error detection
**Warning signs:** Reports of crashes on large projects, "QuotaExceededError" in error logs

### Pitfall 4: Stale "Last Saved" Timestamp
**What goes wrong:** Shows "Last saved: 5 minutes ago" but actually saved 6 minutes ago (display doesn't update)
**Why it happens:** Relative time component renders once and doesn't re-render as time passes
**How to avoid:**
- Use setInterval (30-60 seconds) to force re-render of time display component
- Clean up interval on unmount
- Alternatively, use a library like `react-time-ago` which handles this automatically
**Warning signs:** Timestamp never changes even as minutes pass

### Pitfall 5: Race Condition Between Save and Snapshot Update
**What goes wrong:** isDirty still returns true immediately after successful save
**Why it happens:** setSavedState() called before save completes, or state changes during save operation
**How to avoid:**
- Only call setSavedState() AFTER saveProjectFile() promise resolves successfully
- Capture snapshot from state at moment of save initiation (not after)
- Use saved snapshot, not current state, to avoid capturing changes made during save
**Warning signs:** Orange "dirty" indicator flickers or doesn't clear after save button clicked

### Pitfall 6: Document Title Asterisk Persists Across Sessions
**What goes wrong:** Browser tab shows "* VST3 UI Designer" even on first load of new session
**Why it happens:** useEffect cleanup doesn't run if browser is force-closed, or effect re-runs unexpectedly
**How to avoid:**
- Always set base title on component mount (not just in cleanup)
- Check isDirty state on every render, not just when it changes
- Consider removing asterisk on window focus (user returns to tab after browser restart)
**Warning signs:** Reports of asterisk showing on fresh loads, or title never updating

### Pitfall 7: Backup Recovery Prompt on Every Load
**What goes wrong:** "Restore unsaved work?" prompt shows even when user explicitly saved last session
**Why it happens:** persist middleware always rehydrates from localStorage, can't distinguish between crash backup vs. normal saved state
**How to avoid:**
- Clear localStorage backup after successful explicit save: `localStorage.removeItem('vst3-designer-backup')`
- Add a "recoveryNeeded" flag that's only set true when backup differs from last saved state
- Timestamp comparison: only prompt if backup is newer than lastSavedTimestamp
**Warning signs:** Users always see recovery prompt, even after clean saves and exits

## Code Examples

Verified patterns from official sources:

### beforeunload Event Listener
```typescript
// Source: MDN Web APIs - Window: beforeunload event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event

useEffect(() => {
  if (!isDirty) return

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // Modern browsers require both preventDefault and returnValue
    event.preventDefault()
    event.returnValue = '' // Required for Chrome
    return '' // For legacy browsers
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [isDirty])
```

### Relative Time Formatting
```typescript
// Source: date-fns official documentation
// https://date-fns.org/
import { formatDistanceToNow } from 'date-fns'

// Basic usage
const timeAgo = formatDistanceToNow(lastSavedTimestamp, {
  addSuffix: true  // Adds "ago" suffix
})
// Returns: "2 minutes ago", "about 1 hour ago", etc.

// With custom options
const timeAgo = formatDistanceToNow(lastSavedTimestamp, {
  addSuffix: true,
  includeSeconds: true  // More granular for recent times
})
```

### localStorage Error Handling
```typescript
// Source: Zustand persist middleware documentation
// https://zustand.docs.pmnd.rs/middlewares/persist

import { persist, createJSONStorage } from 'zustand/middleware'

const persistConfig = {
  name: 'vst3-designer-backup',
  storage: createJSONStorage(() => localStorage),

  // Called after state is rehydrated from storage
  onRehydrateStorage: () => (state, error) => {
    if (error) {
      console.error('Failed to rehydrate from localStorage:', error)
      // Could show toast notification to user
      // Could attempt fallback to clean state
    } else if (state) {
      console.log('State rehydrated successfully')
    }
  },

  // Partialize to reduce storage usage
  partialize: (state) => ({
    elements: state.elements,
    canvasWidth: state.canvasWidth,
    canvasHeight: state.canvasHeight,
    // Only essential fields
  }),
}
```

### Dirty State Subscription Outside Components
```typescript
// Source: Zustand subscribeWithSelector middleware
// https://github.com/pmndrs/zustand

import { subscribeWithSelector } from 'zustand/middleware'

// Wrap store with subscribeWithSelector middleware
export const useStore = create<Store>()(
  subscribeWithSelector(
    temporal(
      // ... slices
    )
  )
)

// Subscribe to dirty state changes (e.g., for analytics)
const unsub = useStore.subscribe(
  (state) => state.isDirty(),  // Selector
  (isDirty, previousIsDirty) => {
    if (isDirty && !previousIsDirty) {
      console.log('State became dirty')
      // Track analytics event, etc.
    }
  },
  { fireImmediately: false }  // Don't fire on subscribe
)

// Clean up when no longer needed
unsub()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beforeunload library | Native useEffect + addEventListener | 2023-2024 | Library was 1KB wrapper around same API, useEffect pattern is now standard |
| Moment.js for relative time | date-fns or native Intl | 2020+ | Moment.js in maintenance mode, date-fns is tree-shakeable and modern |
| Custom dirty state tracking | Zustand temporal/persist middleware | 2021+ (Zustand 3.x) | Middleware approach is more composable, handles edge cases |
| Custom messages in beforeunload | Accept generic browser message | 2018+ | Chrome removed custom message support for security (phishing prevention) |
| localStorage without error handling | Persist middleware with quota handling | 2022+ | Mobile browsers, private mode, quota limits make error handling essential |

**Deprecated/outdated:**
- **react-beforeunload package**: Unnecessary wrapper, native useEffect pattern is simpler and one less dependency
- **Custom beforeunload messages**: Modern browsers (Chrome 51+, Firefox 44+) ignore custom messages, only show generic "Leave site?" dialog
- **Moment.js**: In maintenance mode since 2020, date-fns is the modern standard
- **Deep equality checks for dirty state**: JSON.stringify comparison is sufficient for this use case and much simpler

## Open Questions

Things that couldn't be fully resolved:

1. **Recovery prompt UX after crash vs. clean close**
   - What we know: persist middleware always rehydrates from localStorage, can't distinguish between crash and clean exit
   - What's unclear: Best UX for distinguishing recovery-needed vs. normal load. Possible approaches: (a) timestamp comparison, (b) "clean exit" flag in localStorage, (c) always clear backup after explicit save
   - Recommendation: Clear localStorage backup after successful explicit save, only prompt if backup exists. This ensures prompt only appears after crashes/force-close without explicit save.

2. **Optimal auto-refresh interval for "Last saved" display**
   - What we know: Too frequent (1s) causes unnecessary re-renders, too infrequent (5min) shows stale data
   - What's unclear: User perception of staleness for "2 minutes ago" vs "3 minutes ago" - is 30s, 60s, or 90s optimal?
   - Recommendation: Start with 60 seconds (matches common pattern in VS Code, Notion), adjust based on user feedback. For times under 1 minute, could update more frequently (15s).

3. **Should localStorage backup debounce for performance?**
   - What we know: Persist middleware writes on every state change. For rapid changes (dragging element), this could be many writes per second. localStorage is synchronous and can block main thread.
   - What's unclear: Whether persist middleware already batches writes efficiently, or if we need manual debouncing
   - Recommendation: Test performance with persist middleware first. If laggy during rapid changes, add debounce by wrapping in custom middleware that batches writes (300-500ms delay). Zustand's set() is already batched within React render cycle, so may not be an issue.

## Sources

### Primary (HIGH confidence)
- [MDN Web APIs - beforeunload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) - Official browser API documentation
- [date-fns official documentation](https://date-fns.org/) - formatDistanceToNow API
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/middlewares/persist) - localStorage integration patterns
- [Zustand GitHub repository](https://github.com/pmndrs/zustand) - subscribeWithSelector middleware usage
- [zundo GitHub repository](https://github.com/charkour/zundo) - Temporal middleware for Zustand
- Codebase analysis: `/workspaces/vst3-webview-ui-designer/src/store/index.ts` - Existing temporal middleware setup
- Codebase analysis: `/workspaces/vst3-webview-ui-designer/src/components/dialogs/` - Existing dialog patterns

### Secondary (MEDIUM confidence)
- [React Time Ago library](https://catamphetamine.github.io/react-time-ago/) - Alternative to date-fns for auto-updating relative time
- [Josh Comeau - Persisting React State in localStorage](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - React patterns for localStorage
- [Cloudscape Design System - Unsaved Changes Pattern](https://cloudscape.design/patterns/general/unsaved-changes/) - UX patterns for unsaved changes warnings
- [MDN Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) - localStorage limits and quota handling

### Tertiary (LOW confidence)
- WebSearch results on dirty state tracking patterns - Community discussions, not official sources
- WebSearch results on relative time libraries comparison - Requires verification against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are well-established with official docs verified; zundo and zustand already in project
- Architecture: HIGH - Patterns verified against official Zustand docs, MDN, and existing codebase structure
- Pitfalls: MEDIUM - Based on documented common issues but not all verified in this specific codebase
- beforeunload API: HIGH - Official MDN documentation with clear browser behavior
- localStorage quota handling: HIGH - Official MDN docs on quotas, Zustand persist middleware handles edge cases
- Relative time formatting: HIGH - date-fns is industry standard with comprehensive docs

**Research date:** 2026-01-27
**Valid until:** ~30 days (stable technologies, but check for date-fns v5 or Zustand v6 releases)
