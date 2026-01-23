# Phase 3: Selection & History - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement selection model (click, shift-click, marquee) and undo/redo architecture using command pattern. Users can select elements and reverse actions. Element manipulation (move, resize) is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Undo Granularity
- Drag = one action (mousedown → mouseup, regardless of distance)
- Property change = one action (on blur or Enter, not per-keystroke)
- Delete = one action (even if multiple elements selected)
- Paste = one action
- Pan/zoom excluded from undo history (viewport state not undoable)

### History Architecture
- Command pattern, not snapshots (per PROJECT.md)
- Each command stores just enough to reverse itself (e.g., MoveCommand stores element IDs + delta)
- History depth: 50 actions maximum
- Overflow behavior: FIFO — oldest action silently dropped when new action added
- Redo behavior: Standard — new action after undo clears redo stack

### Claude's Discretion
- Selection visuals (default: blue border + resize handles)
- Marquee behavior (default: intersection-based selection)
- Handle shapes and sizes
- Selection highlight colors

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for selection visuals (Figma/Sketch pattern).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-selection-history*
*Context gathered: 2026-01-23*
