---
phase: 01-foundation
plan: 03
subsystem: ui
tags: [react-konva, canvas, viewport, pan, zoom, interaction]

# Dependency graph
requires:
  - phase: 01-02
    provides: Canvas Stage with viewport transform infrastructure
provides:
  - Spacebar + drag panning with grab cursor UX
  - Scroll wheel and trackpad pinch zoom centered on cursor
  - Custom React hooks (usePan, useZoom) for canvas interaction
  - Viewport state management (scale, offset, dragStart)
affects: [02-element-library, 03-canvas-basics, 04-property-panel, 05-element-selection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Custom hooks for canvas interactions with cleanup"
    - "Zoom-to-pointer transform (two-step coordinate calculation)"
    - "Viewport state excluded from undo history"

key-files:
  created:
    - src/components/Canvas/hooks/usePan.ts
    - src/components/Canvas/hooks/useZoom.ts
    - src/components/Canvas/hooks/index.ts
  modified:
    - src/store/viewportSlice.ts
    - src/components/Canvas/CanvasStage.tsx

key-decisions:
  - "Zoom range: 0.1 (10%) to 10 (1000%) for maximum flexibility"
  - "Pan via spacebar+drag (Figma pattern) rather than middle-click or click-drag"
  - "Zoom-to-pointer using two-step transform preserves point under cursor"
  - "Event listeners on window (not document) for consistent keyboard handling"

patterns-established:
  - "Canvas interaction hooks return both state and handlers for clean integration"
  - "Cursor changes based on interaction mode (grab/grabbing during pan)"
  - "Separate handling for scroll wheel vs trackpad pinch (ctrlKey detection)"

# Metrics
duration: 1min
completed: 2026-01-23
---

# Phase 01 Plan 03: Pan and Zoom Summary

**Spacebar+drag panning and scroll/pinch zoom with cursor-centered transforms using custom React hooks**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-23T18:58:49Z
- **Completed:** 2026-01-23T18:59:34Z
- **Tasks:** 2 (+ 1 human-verify checkpoint)
- **Files modified:** 5

## Accomplishments
- Industry-standard canvas navigation (spacebar+drag pan, scroll/pinch zoom)
- Zoom centers on cursor position using two-step coordinate transform
- Clean cursor UX (grab hand on spacebar, grabbing while dragging)
- Completed Phase 1 foundation: three-panel layout with fully interactive canvas

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement Spacebar + Drag Panning** - `2fe2d1c` (feat)
2. **Task 2: Implement Scroll Wheel and Pinch Zoom** - `75aedf3` (feat)
3. **Task 3: Human verification checkpoint** - User approved all functionality

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified
- `src/components/Canvas/hooks/usePan.ts` - Spacebar+drag pan with keyboard listeners and mouse handlers
- `src/components/Canvas/hooks/useZoom.ts` - Scroll/pinch zoom with zoom-to-pointer transform
- `src/components/Canvas/hooks/index.ts` - Hook exports
- `src/store/viewportSlice.ts` - Added dragStart state for tracking drag position
- `src/components/Canvas/CanvasStage.tsx` - Integrated pan/zoom hooks with cursor styling

## Decisions Made

**Zoom range (0.1 to 10):**
Allows extreme zoom out (10%) for overview and extreme zoom in (1000%) for pixel-perfect work. Wider range than typical design tools (Figma: 0.01-1000, Photoshop: 0.01-3200) but appropriate for UI design workspace.

**Spacebar+drag for panning:**
Follows Figma/Photoshop UX pattern. Alternatives considered:
- Middle-click drag: Not discoverable, may not work on trackpads
- Click-drag: Conflicts with element selection/manipulation
Spacebar+drag is standard and doesn't conflict with future interactions.

**Zoom-to-pointer transform:**
Implements two-step calculation (pointer → world coordinates → new offset) to keep point under cursor stationary during zoom. Without this, zoom would center on canvas origin (poor UX).

**Event listeners on window:**
Keyboard event listeners attached to window rather than document for consistent behavior across React lifecycle. Cleanup in useEffect return prevents memory leaks.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded smoothly with no blocking issues.

## User Feedback

During verification checkpoint, user noted: "it would be great if i can type in the zoom here too (later)"

**Tracked for future enhancement:** Add direct input to zoom indicator for typing specific zoom percentages (e.g., type "150" to set 150% zoom). Not critical for Phase 1 but good UX improvement for later phase.

## Next Phase Readiness

**Phase 1 (Foundation) COMPLETE:**
- ✅ Three-panel layout (left sidebar, center canvas, right properties panel)
- ✅ Canvas Stage with configurable dimensions and background
- ✅ Pan with spacebar+drag
- ✅ Zoom with scroll wheel and trackpad pinch
- ✅ Coordinate transforms working correctly at all zoom levels (verified 25%-400%)
- ✅ Viewport state management with undo exclusion

**Ready for Phase 2 (Element Library):**
- Canvas infrastructure complete and tested
- Coordinate transform utilities available from 01-01
- Viewport management excludes camera position from undo (correct behavior)
- All Phase 1 success criteria met

**No blockers.** Phase 2 can begin immediately.

---
*Phase: 01-foundation*
*Completed: 2026-01-23*
