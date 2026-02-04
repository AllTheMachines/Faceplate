# Phase 54: Knob Variants - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Add SVG styling support to three knob variants (Stepped Knob, Center Detent Knob, Dot Indicator Knob) using the elementStyles system from Phase 53. Each variant accepts a styleId and renders with SVG layers. Regular Knob continues using the existing knobStyles system.

</domain>

<decisions>
## Implementation Decisions

### Stepped rotation behavior
- Keep current snap behavior (indicator snaps to discrete positions during drag)
- Tick marks are part of the SVG style, not a separate property
- SVG provides ONE tick mark template that gets duplicated/rotated based on step count from options panel
- Step count configured in options panel controls how many ticks render

### Center detent visualization
- Position-only feedback when snapping to center (no highlight/glow effect)
- No special center mark layer in SVG style
- Uses standard rotary layers (body + indicator) — same as regular knob

### Dot indicator design
- Dot color override supported — property panel shows dot color as separate override option
- Dot is shaped differently but uses same rotation behavior

### Layer structure sharing
- Styles are element-type-specific (Stepped Knob styles only for Stepped Knob, etc.)
- SVG import is contextual — import while element selected creates style for that element type
- No central management dialog — manage styles only through individual element selection
- Regular Knob keeps existing knobStyles system, variants use new elementStyles

### Claude's Discretion
- Whether dot is separate layer or part of indicator layer (based on rotary schema)
- Dot rotation behavior (path vs center rotation based on current DotIndicatorKnob)
- Center detent dead zone visual behavior (visual + snap vs snap only)

</decisions>

<specifics>
## Specific Ideas

- Tick mark duplication: "you only need one that gets duplicated as many times as needed"
- Import context: "the svg import only visible when you click a certain element"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 54-knob-variants*
*Context gathered: 2026-02-04*
