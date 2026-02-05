# Phase 58: Export - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Export support for SVG-styled elements (sliders, buttons, switches, meters) added in Phases 53-57. Exported JUCE bundles must render these elements correctly with proper DOM structure, animations, and color handling.

This phase does NOT add new element styling capabilities — it ensures existing in-app SVG styling works in exported bundles.

</domain>

<decisions>
## Implementation Decisions

### DOM Structure Patterns
- Inline SVG in each element div — self-contained, no external references
- Fixed layer ordering by role: background first, then fills, then foreground, then indicators
- Flat structure with all layers as siblings — absolute positioning, transforms on each layer
- Multi-state elements (buttons, switches): all states present in DOM, opacity toggle 0/1 for instant transitions

### Animation Strategy by Category
- Slider thumbs: CSS transform translate (translateX/Y based on value) — GPU-accelerated
- Meter fills: CSS clip-path inset (reveals fill from bottom) — matches Phase 57 canvas renderer
- Shared helper functions: updateSlider(id, value), updateMeter(id, value), etc. — smaller JS, consistent behavior
- Peak hold indicators: JS timer-based decay — peak position held, setTimeout decays after holdDuration

### Color Override Handling
- Per-instance overrides via inline style attributes (style="fill: #xxx") — direct, overrides any CSS
- Preserve original SVG colors where no override specified — respects SVG designer's choices
- Meter zone colors from MeterLayers style definition (fill-green, fill-yellow, fill-red)
- LED/indicator colors from element properties (Power button LED, peak indicator color)

### Export Architecture
- Extend existing knob export pattern — add slider/button/meter generators following same structure
- Graceful fallback: if no styleId, export standard non-SVG element — backwards compatible
- Shared animation helpers in main.js alongside bindings — one file, matches current structure
- Per-complex-type export logic: segment button, rotary switch, etc. get specialized export for their unique needs

### Claude's Discretion
- Exact CSS property values for positioning layers
- How to organize generator functions internally
- Error handling for missing style references
- Whether to add debug comments in exported code

</decisions>

<specifics>
## Specific Ideas

- Animation patterns should mirror exactly what the canvas renderers do in Phases 55-57
- Clip-path approach for meters matches the decision in Phase 57-02 (inset from top reveals bottom-up fill)
- Opacity toggle for buttons matches Phase 56-04 (instant transitions, no CSS animation)
- Zone thresholds (-18dB yellow, -6dB red) are baked into styles, not hardcoded in export

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 58-export*
*Context gathered: 2026-02-05*
