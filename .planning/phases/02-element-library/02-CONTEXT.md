# Phase 2: Element Library - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the six core element types (Knob, Slider, Button, Label, Level Meter, Image) with full property interfaces and canvas rendering. Elements display on canvas but are not yet selectable, draggable, or editable — those capabilities come in Phases 3-5.

</domain>

<decisions>
## Implementation Decisions

### Rendering Approach
- **HTML/SVG components directly** — NOT Konva shapes
- Elements are React components (divs/SVGs) that render the same way in designer and export
- True WYSIWYG: designer elements ARE the export components, no translation layer
- Eliminates double-building (once for Konva, once for HTML export)
- Supports custom SVG import natively (v1 requirement)
- Performance not a concern — plugin UIs have 20-50 elements, not thousands

### Canvas Architecture
- **Replace react-konva with HTML container** — remove Konva entirely
- Single container div with `transform: scale(zoom) translate(panX, panY)`
- Elements positioned absolutely inside with canvas coordinates
- Phase 1 infrastructure (Zustand store, coordinate types) remains valid
- Viewport state, pan/zoom logic preserved — just different rendering

### Component Structure
- **BaseElement wrapper + specialized renderers**
- BaseElement handles: position, size, rotation, common props
- Type-specific renderers inside: KnobRenderer, SliderRenderer, etc.
- Sets up for Phase 3+ selection handles and transform controls
- Export can use same specialized renderers without wrapper

### Claude's Discretion
- Property interface completeness vs essential subset for v1
- Element preview values and default appearances
- Specific SVG structure for each element type
- CSS organization (inline vs classes vs CSS-in-JS)

</decisions>

<specifics>
## Specific Ideas

- "If designer elements ARE the same React/SVG components that get exported, what you see is exactly what you get"
- The export format is HTML/CSS/JS for JUCE WebView2 — rendering with the target format eliminates translation errors
- Custom SVG import is a v1 requirement and works natively with HTML approach

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-element-library*
*Context gathered: 2026-01-23*
