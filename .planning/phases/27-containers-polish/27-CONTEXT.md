# Phase 27: Containers & Polish - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Three container/utility elements that enhance UI structure and polish:
- **Tooltip** — Hover information with configurable position
- **Spacer** — Invisible layout element with fixed/flexible sizing
- **Window Chrome** — Title bar with close/minimize buttons, resize handles

</domain>

<decisions>
## Implementation Decisions

### Tooltip Behavior
- Trigger: Hover only (300-500ms delay), hide on mouse leave
- Content: Rich content (text + icons, formatted text)
- Position: User-specified (top/bottom/left/right), no auto-flip
- Arrow: Configurable property to show/hide pointer per tooltip

### Spacer Design
- Sizing: Fixed (pixels) AND flexible (flex-grow for responsive layouts)
- Types: Separate Horizontal Spacer and Vertical Spacer as distinct elements
- Constraints: Claude's discretion on min/max size constraints
- Visual: Claude's discretion on designer appearance (dashed outline vs shaded)

### Window Chrome Appearance
- Button style: Configurable property (macOS traffic lights / Windows icons / custom neutral)
- Title bar: Static in designer (not draggable), exports with drag support for JUCE
- Title text: Claude's discretion
- Resize handles: Claude's discretion on behavior

### Designer Representation
- Tooltip: Overlay on hover — hover over target element to see tooltip preview
- Spacer visibility: Claude's discretion (always visible or global toggle)
- Window Chrome position: Claude's discretion (canvas element vs wrapper)
- Interaction: Limited — selectable but with restrictions (e.g., Tooltip stays attached to target)

### Claude's Discretion
- Spacer min/max size constraints
- Spacer designer appearance (dashed outline vs shaded area)
- Window Chrome title text property
- Window Chrome resize handle behavior
- Invisible element visibility toggle
- Window Chrome positioning model (element vs wrapper)

</decisions>

<specifics>
## Specific Ideas

- Tooltip should support rich content for parameter help text with icons
- Separate H/V spacer types for clearer layout intent
- Window Chrome with configurable style allows matching macOS or Windows aesthetics

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-containers-polish*
*Context gathered: 2026-01-26*
