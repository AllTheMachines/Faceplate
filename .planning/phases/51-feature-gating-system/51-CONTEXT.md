# Phase 51: Feature Gating System - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Element registry supports Pro/Free classification with UI indicators. Users can see which elements require a Pro license through badges in palette and on canvas. License state tracked in Zustand store with hook for component access. 42 elements marked as Pro (ASCII, Advanced Meters, Visualizations, Specialized Audio).

This phase does NOT include: license validation (Phase 52), export blocking (Phase 52), Polar.sh integration (Phase 52).

</domain>

<decisions>
## Implementation Decisions

### Palette Lock Icon Design
- Full element appearance with 'PRO' text badge (not dimmed)
- Badge position: top-right corner of element thumbnail
- Badge color: purple/violet (#8B5CF6 violet-500)
- Hover tooltip: "Pro feature - requires Pro license" or similar
- Pro elements grouped at bottom of each category (after Free elements)
- Toggle at top of palette panel to hide Pro elements

### Canvas Pro Badge
- Small 'PRO' badge always visible in top-right corner (matches palette)
- Fixed size badge (16x16px) regardless of element size
- Badge only shown when user is unlicensed - disappears with valid license
- Same purple/violet color as palette badge

### Element Classification
- Individual `isPro: boolean` flag on each element type (not category-level)
- 42 elements marked Pro per STATE.md: ASCII (3), Advanced Meters (14), Visualizations (12), Specialized Audio (13)

### Unlicensed User Behavior
- Cannot drag Pro elements to canvas - blocked at drag start
- Feedback: tooltip on element explains Pro requirement
- Loading project with Pro elements: show warning notification listing Pro elements
- Pro elements in loaded projects: read-only (properties visible but not editable)

### Claude's Discretion
- Exact tooltip text and formatting
- Badge animation or transitions
- Warning notification styling and dismiss behavior
- How "Hide Pro elements" toggle state persists

</decisions>

<specifics>
## Specific Ideas

- Badge should feel premium but not obtrusive - violet color gives premium feel
- Consistency between palette and canvas badges (both top-right, same color)
- Read-only Pro elements should still be visible/inspectable, just not modifiable

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 51-feature-gating-system*
*Context gathered: 2026-02-03*
