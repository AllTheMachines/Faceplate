---
status: diagnosed
trigger: "Container Editor Snap-to-Grid Not Working - elements do not snap to grid when dragged"
created: 2026-01-29T12:00:00Z
updated: 2026-01-29T12:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Visual feedback during drag does not show snapping
test: Compared container editor drag code with main canvas dnd-kit drag code
expecting: Find where snapping should be applied to visual during drag
next_action: Document root cause

## Symptoms

expected: When snapToGrid is enabled and grid is visible, dragging elements should snap to grid positions
actual: Elements do not snap when dragged, even though grid is visible
errors: None reported
reproduction: Enable snap-to-grid, show grid, drag element in container editor
started: After Phase 40-05 implementation (grid renders but snap doesn't work)

## Eliminated

## Evidence

- timestamp: 2026-01-29T12:05:00Z
  checked: ContainerEditorCanvas.tsx lines 117-125 (handleMouseUp)
  found: snapPosition IS called when mouse is released - final position is snapped correctly
  implication: Final position snapping works, but user may not perceive it

- timestamp: 2026-01-29T12:06:00Z
  checked: ContainerEditorCanvas.tsx lines 275-281 (getDragOffset) and 357-359 (displayX/displayY)
  found: Visual position during drag is calculated as child.x + raw dragOffset - NO snapping applied
  implication: Elements follow cursor smoothly during drag, only jump to grid on release

- timestamp: 2026-01-29T12:07:00Z
  checked: useContainerGrid.ts snapPosition function
  found: Function correctly checks snapToGrid flag and applies grid snapping
  implication: The snapPosition function itself works correctly

- timestamp: 2026-01-29T12:08:00Z
  checked: Main canvas drag handling in App.tsx and BaseElement.tsx
  found: Main canvas also does NOT snap during live drag - only snaps on handleDragEnd (lines 329-331)
  implication: This is CONSISTENT behavior - main canvas visual also doesn't snap during drag

- timestamp: 2026-01-29T12:09:00Z
  checked: ContainerEditorCanvas.tsx handleMouseUp (lines 112-138)
  found: snapPosition IS called before updateElement - final position IS snapped
  implication: Container editor final position snapping WORKS - same as main canvas

## Resolution

root_cause: The snap-to-grid IS working correctly - it snaps on mouse release, not during drag. This is the SAME behavior as the main canvas (App.tsx lines 329-331). The visual display during drag shows smooth, unsnapped positions for both container editor AND main canvas. The perception of "not working" may come from expecting visual snapping during drag.

fix: No fix needed if behavior matches main canvas (snap-on-release). If visual snap-during-drag is desired, would need to apply snapPosition() in getDragOffset() for container editor (lines 275-281 of ContainerEditorCanvas.tsx) and in handleDragMove() for main canvas (lines 288-298 of App.tsx).

verification: The final position IS snapped - test by dragging element to non-grid position and releasing; observe element jumps to grid line.

files_changed: []
