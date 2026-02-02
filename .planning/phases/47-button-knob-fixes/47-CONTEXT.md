# Phase 47: Button & Knob Fixes - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix behavioral bugs in segment buttons, kick buttons, and stepped knobs:
- BTN-01: Segment Button displays icons in selected segments (not just text)
- BTN-02: Kick Button has documented purpose and provides clear visual/interaction feedback
- KNB-01: Stepped Knob snaps to discrete step positions when dragged

</domain>

<decisions>
## Implementation Decisions

### Segment Button Icons
- Icons appear left of text (horizontally aligned)
- Each segment can have its own icon (per-segment icons)
- Icon colors are configurable per-state (separate colors for selected vs unselected)
- Add `iconSize` property so user controls icon dimensions

### Kick Button
- Remove Kick Button element type entirely (redundant with Button in momentary mode)
- No migration needed - just delete the type (breaking change acceptable)
- Regular Button already has momentary mode - no changes needed there

### Stepped Knob Snapping
- Show continuous position while dragging, snap to nearest step on release
- Add `showStepMarks` property (configurable per knob)
- When step marks enabled, display tick marks outside the knob edge (like a dial)
- Step count is already configurable via existing `steps` property - just fix the snapping behavior

### Claude's Discretion
- Exact tick mark styling (length, color, thickness)
- Animation timing for snap-on-release (suggest ~50ms)
- Icon-to-text spacing in segment buttons

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 47-button-knob-fixes*
*Context gathered: 2026-02-02*
