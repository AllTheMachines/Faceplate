---
phase: 06-alignment-polish
plan: 01
subsystem: ui
tags: [copy-paste, clipboard, keyboard-shortcuts, react-hotkeys-hook]

# Dependency graph
requires:
  - phase: 03-selection-history
    provides: Selection state, selectedIds, selectMultiple, clearSelection
  - phase: 04-palette-element-creation
    provides: Element creation via addElement store action
provides:
  - Copy/paste functionality with Ctrl+C/Ctrl+V shortcuts
  - In-memory clipboard for element duplication
  - Deep cloning with structuredClone for nested objects
  - UUID regeneration for pasted elements
affects: [06-alignment-polish, code-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - In-memory clipboard using useRef for non-reactive storage
    - structuredClone for deep cloning element configs
    - crypto.randomUUID for unique ID generation

key-files:
  created:
    - src/components/Canvas/hooks/useCopyPaste.ts
  modified:
    - src/components/Canvas/hooks/useKeyboardShortcuts.ts

key-decisions:
  - "In-memory clipboard using useRef (not system clipboard) for reliable cross-element copying"
  - "structuredClone for deep cloning handles nested objects like colorStops in meters"
  - "20px offset for pasted elements to visually distinguish from originals"
  - "enableOnFormTags: false prevents shortcuts from firing in property panel inputs"

patterns-established:
  - "Clipboard hook pattern: separate hook for clipboard logic, consumed by keyboard shortcuts"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 6 Plan 1: Copy/Paste Summary

**Copy/paste with Ctrl+C/Ctrl+V using in-memory clipboard, structuredClone deep copying, and UUID regeneration for pasted elements**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T00:00:00Z
- **Completed:** 2026-01-23T00:02:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Copy selected elements to in-memory clipboard with Ctrl+C
- Paste elements with unique UUIDs and 20px position offset with Ctrl+V
- Deep clone using structuredClone handles nested objects (meter colorStops)
- Pasted elements automatically selected after paste
- Paste operation is undoable via zundo temporal middleware

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useCopyPaste hook with in-memory clipboard** - `e8c6f93` (feat)
2. **Task 2: Add Ctrl+C and Ctrl+V shortcuts to useKeyboardShortcuts** - `74cb48d` (feat)

## Files Created/Modified
- `src/components/Canvas/hooks/useCopyPaste.ts` - New hook managing copy/paste with in-memory clipboard, structuredClone, UUID generation
- `src/components/Canvas/hooks/useKeyboardShortcuts.ts` - Added mod+c and mod+v shortcuts

## Decisions Made
- **In-memory clipboard over system clipboard:** Using useRef for reliable storage since system clipboard is async and can fail. System clipboard write is optional (for debugging).
- **structuredClone for deep copy:** Native browser API handles nested objects properly without custom clone logic
- **20px offset:** Standard offset to visually separate pasted elements from originals
- **enableOnFormTags: false:** Prevents shortcuts from interfering when user types in property panel inputs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Copy/paste complete and functional
- Ready for Plan 02 (Duplicate shortcut Ctrl+D)
- Multi-element paste works correctly with marquee selection

---
*Phase: 06-alignment-polish*
*Completed: 2026-01-23*
