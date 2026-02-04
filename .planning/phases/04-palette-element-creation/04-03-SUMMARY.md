---
phase: 04-palette-element-creation
plan: 03
subsystem: ui
tags: [zustand, react-hotkeys-hook, z-order, layer-management, keyboard-shortcuts]

# Dependency graph
requires:
  - phase: 03-selection-history
    provides: selection state foundation and keyboard shortcut infrastructure
provides:
  - Z-order management with keyboard shortcuts and UI controls
  - moveToFront, moveToBack, moveForward, moveBackward actions
  - ZOrderPanel component in right panel
affects: [05-drag-drop, layers-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: [array-position-based-z-order, single-selection-z-order-constraints]

key-files:
  created:
    - src/components/Canvas/ZOrderPanel.tsx
  modified:
    - src/store/elementsSlice.ts
    - src/components/Canvas/hooks/useKeyboardShortcuts.ts
    - src/components/Layout/RightPanel.tsx

key-decisions:
  - "Array position determines z-order (last element renders on top) - no explicit zIndex property"
  - "Z-order operations limited to single selection (multi-select deferred for complexity)"
  - "Industry-standard keyboard shortcuts (Figma, Sketch, Adobe): mod+]/[, mod+shift+]/["

patterns-established:
  - "Z-order via array position: Simple, no conflicts, no gaps - just reorder elements array"
  - "Keyboard shortcut pattern: Get selection, get action, validate, execute in callback"

# Metrics
duration: 3.7min
completed: 2026-01-23
---

# Phase 4 Plan 3: Z-Order Management Summary

**Z-order control via array position with keyboard shortcuts (mod+]/[) and ZOrderPanel UI buttons**

## Performance

- **Duration:** 3m 42s
- **Started:** 2026-01-23T21:40:54Z
- **Completed:** 2026-01-23T21:44:36Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Z-order actions using array position manipulation (no explicit zIndex needed)
- Industry-standard keyboard shortcuts for layer reordering
- ZOrderPanel in right panel with shortcut hints
- All z-order changes reflect immediately on canvas

## Task Commits

Each task was committed atomically:

1. **Task 1: Add z-order actions to elementsSlice** - `34a5bb7` (feat)
2. **Task 2: Add z-order keyboard shortcuts** - `e1ba671` (feat)
3. **Task 3: Create ZOrderPanel component** - `04286bf` (feat)

## Files Created/Modified
- `src/store/elementsSlice.ts` - Added moveToFront, moveToBack, moveForward, moveBackward actions
- `src/components/Canvas/hooks/useKeyboardShortcuts.ts` - Added z-order keyboard shortcuts with mod+]/[ keys
- `src/components/Canvas/ZOrderPanel.tsx` - Created layer order control panel with 4 buttons
- `src/components/Layout/RightPanel.tsx` - Integrated ZOrderPanel at bottom with flex layout

## Decisions Made

**1. Array position determines z-order**
- Elements array order = render order (last element on top)
- Simpler than explicit zIndex (no conflicts, gaps, or coordination)
- moveToFront = move element to end of array
- moveToBack = move element to start of array
- moveForward/Backward = swap with adjacent element

**2. Single selection only**
- Z-order operations limited to single element selection
- Multi-select z-order requires complex relative ordering logic
- Deferred to future enhancement when use case proven

**3. Industry-standard shortcuts**
- Cmd/Ctrl+Shift+] = Bring to Front
- Cmd/Ctrl+Shift+[ = Send to Back
- Cmd/Ctrl+] = Bring Forward
- Cmd/Ctrl+[ = Send Backward
- Matches Figma, Sketch, Adobe tools for muscle memory

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript array indexing type errors**
- **Found during:** Task 1 (elementsSlice z-order actions)
- **Issue:** TypeScript inferred array destructuring as potentially undefined, causing type errors
- **Fix:** Used temp variable swap pattern with non-null assertions after bounds checking
- **Files modified:** src/store/elementsSlice.ts
- **Verification:** npm run build passes without errors
- **Committed in:** 34a5bb7 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed selectedIds array access type safety**
- **Found during:** Task 2 (keyboard shortcuts)
- **Issue:** TypeScript doesn't infer selectedIds[0] is defined even after length === 1 check
- **Fix:** Added explicit null check: `const id = selectedIds[0]; if (length === 1 && id)`
- **Files modified:** src/components/Canvas/hooks/useKeyboardShortcuts.ts
- **Verification:** npm run build passes, linter removed intermediate variable in favor of inline check
- **Committed in:** e1ba671 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both TypeScript type safety fixes essential for compilation. No scope creep.

## Issues Encountered

**TypeScript strict null checks:**
- Array access and destructuring require explicit null handling
- Resolved with non-null assertions after bounds checks and null guards
- Pattern established for future array manipulation code

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 4 continuation:**
- Z-order foundation complete
- Keyboard shortcuts established
- UI controls integrated
- Array-based z-order pattern validated

**Blockers:** None

**Notes:**
- Multi-select z-order deferred (complex relative ordering logic)
- Visual z-order indicators could enhance UX (e.g., layer panel showing stack order)
- Current implementation assumes small element counts (linear array operations acceptable)

---
*Phase: 04-palette-element-creation*
*Completed: 2026-01-23*
