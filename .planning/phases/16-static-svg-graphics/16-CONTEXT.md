# Phase 16: Static SVG Graphics - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Place scalable SVG graphics on canvas as decorative elements. Users can position, resize, and transform imported SVG assets. Interactive behavior (knob rotation, parameter binding) is Phase 17.

</domain>

<decisions>
## Implementation Decisions

### Placement flow
- Both palette AND asset library support placement
- Palette has "SVG Graphic" element type; library drag also creates elements
- Palette drag creates placeholder element with "Select asset" prompt
- User assigns asset via property panel after placement
- Library drag uses asset's natural size (from SVG viewBox)
- Placeholder elements default to 100×100

### Sizing behavior
- Aspect ratio locked by default (Shift to unlock)
- SVG scales using "contain" (entire SVG visible, may have letterbox)
- Reset to natural size button in property panel
- Minimum size: 8×8 (prevents invisible elements)

### Visual states
- Unassigned placeholder: dashed border with image/plus icon + "Select Asset" text
- Missing asset (deleted from library): red/warning border with "Asset not found" message
- No hover state on canvas (only shows selection when clicked)

### Property panel
- Full rotation control (0-360 degrees)
- Flip horizontal and vertical toggles
- Opacity slider (0-100%)
- Asset assignment via dropdown of existing assets + "Browse..." button
- Reset to natural size button

### Claude's Discretion
- Selection appearance (follow existing element patterns)
- Exact placeholder styling (colors, icon choice)
- Dropdown vs modal for asset browsing implementation
- Transform origin for rotation

</decisions>

<specifics>
## Specific Ideas

- Placeholder should clearly communicate "click to assign asset" — not just an empty box
- Natural size from viewBox makes imported assets feel predictable
- Aspect ratio lock prevents accidental distortion of carefully designed graphics

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-static-svg-graphics*
*Context gathered: 2026-01-26*
