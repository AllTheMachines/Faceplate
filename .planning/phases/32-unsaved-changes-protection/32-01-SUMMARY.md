---
phase: 32-unsaved-changes-protection
plan: 01
subsystem: ui
tags: [zustand, state-management, date-fns, beforeunload, dirty-state-tracking]

# Dependency graph
requires:
  - phase: 31-undo-redo-history
    provides: temporal middleware and undo/redo infrastructure
provides:
  - Dirty state tracking infrastructure via DirtyStateSlice
  - Visual unsaved changes indicators (document title asterisk, last saved timestamp)
  - beforeunload browser warning when project has unsaved changes
  - Reactive dirty state detection via snapshot comparison
affects: [32-02-save-workflows, 32-03-unsaved-dialogs, 32-04-crash-recovery]

# Tech tracking
tech-stack:
  added: [date-fns]
  patterns: [Zustand slice composition, state snapshot comparison for dirty detection]

key-files:
  created:
    - src/store/dirtyStateSlice.ts
    - src/hooks/useBeforeUnload.ts
    - src/hooks/useDirtyState.ts
  modified:
    - src/store/index.ts
    - src/components/Layout/LeftPanel.tsx
    - src/App.tsx

key-decisions:
  - "Exclude dirty state fields (savedStateSnapshot, lastSavedTimestamp) from undo history to prevent snapshot corruption"
  - "Use 60-second interval for relative time refresh (balance between accuracy and performance)"
  - "Compare serializable state only (elements, canvas, assets, knobStyles) for dirty detection"

patterns-established:
  - "isDirty() selector function compares current state JSON against savedStateSnapshot"
  - "Never saved projects are dirty only if elements.length > 0"
  - "formatDistanceToNow from date-fns for user-friendly relative time display"

# Metrics
duration: 4min
completed: 2026-01-27
---

# Phase 32 Plan 01: Unsaved Changes Protection Summary

**Dirty state tracking with document title asterisk, relative last-saved time display, and beforeunload browser warning**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-01-27T16:38:18Z
- **Completed:** 2026-01-27T16:41:51Z
- **Tasks:** 3
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments
- DirtyStateSlice integrated into Zustand store with snapshot comparison
- Document title shows asterisk prefix when project has unsaved changes
- LeftPanel displays "Never saved" or "Last saved: X ago" with auto-refresh
- beforeunload warning prevents accidental data loss on browser close

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dirty state slice and integrate with store** - `d76c032` (feat)
2. **Task 2: Create hooks and install date-fns** - `0852186` (feat)
3. **Task 3: Update LeftPanel with relative time and document title** - `1de6f68` (feat)

## Files Created/Modified
- `src/store/dirtyStateSlice.ts` - DirtyStateSlice with savedStateSnapshot, lastSavedTimestamp, isDirty() selector
- `src/store/index.ts` - Integrated DirtyStateSlice, excluded from temporal partialize
- `src/hooks/useBeforeUnload.ts` - beforeunload event hook for browser close warning
- `src/hooks/useDirtyState.ts` - Reactive hook for subscribing to dirty state and lastSavedTimestamp
- `src/components/Layout/LeftPanel.tsx` - Replaced build timestamp with relative last-saved time, 60s auto-refresh
- `src/App.tsx` - Document title management with asterisk, useBeforeUnload hook integration

## Decisions Made
- **Dirty state comparison fields:** Only compare serializable state (elements, canvas dimensions, backgroundColor, backgroundType, gradientConfig, snapToGrid, gridSize, assets, knobStyles) - excludes viewport and selection which are not persisted
- **Never saved logic:** Project is dirty if savedStateSnapshot is null AND elements.length > 0 (empty project is not dirty)
- **Auto-refresh interval:** 60 seconds for relative time updates (matches VS Code pattern, low performance overhead)
- **Excluded from undo:** savedStateSnapshot and lastSavedTimestamp must not be in undo history to prevent snapshot corruption when undoing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation using existing Zustand patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 02 (Save Workflows):
- isDirty() selector available for conditional save button styling
- setSavedState() action ready to be called after successful save
- lastSavedTimestamp ready for display updates after save
- clearSavedState() action ready for new project / clear canvas operations

No blockers or concerns.

---
*Phase: 32-unsaved-changes-protection*
*Completed: 2026-01-27*
