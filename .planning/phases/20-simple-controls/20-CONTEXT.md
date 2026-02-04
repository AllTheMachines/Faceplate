# Phase 20: Simple Controls - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Rotary and linear control variants for audio plugin UIs. Includes Stepped Knob, Center-Detented Knob, Dot Indicator Knob, Bipolar Slider, Crossfade Slider, Notched Slider, Arc Slider, and Multi-Slider. These extend the existing Knob and Slider elements with specialized behaviors and visual styles.

</domain>

<decisions>
## Implementation Decisions

### Detent behavior
- Stepped Knob uses hard stops — knob jumps directly between positions, no in-between values
- Center-Detented Knob snap zone: Claude's discretion (pick reasonable default)
- Notched Slider supports both fixed intervals (default) and custom position array override
- Step/notch label visibility is an optional property (user toggles in properties panel)

### Visual indication
- Stepped Knob visual style: Claude's discretion (tick marks, dots, or numbered positions)
- Bipolar Slider uses center line only — visible center mark with single fill color, no color zones
- Arc Slider shows both track (always visible) and filled arc segment showing current value
- Dot Indicator Knob uses single dot on edge that rotates to show value position

### Interaction modes
- Knob drag mode is configurable per knob — property to choose vertical or circular drag
- Fine adjustment supported with configurable ratio (default 0.1, Shift+drag multiplier)
- Double-click reset is configurable — property to enable/disable reset to default value
- Arc Slider uses drag-along-arc interaction — follow the curved path with mouse/touch

### Multi-element layout
- Multi-Slider band count: presets dropdown (3, 4, 5, 7, 10, 31) plus custom number input (1-32 range)
- Multi-Slider band labels are configurable — property to choose frequency labels, index numbers, or hidden
- Multi-Slider link mode is a property — options for always-linked, modifier-linked, or independent
- Crossfade Slider visual: Claude's discretion (pick DJ-style A/B visual)

### Claude's Discretion
- Center-Detented Knob snap zone percentage
- Stepped Knob position indicator visual style
- Crossfade Slider visual design (A/B indication)
- Default values for configurable properties
- Exact fine adjustment ratio default

</decisions>

<specifics>
## Specific Ideas

- Hard stops for stepped controls are important — users expect discrete positions to feel locked
- Arc Slider should feel like dragging along the actual curved path, not just vertical mapping
- Multi-Slider should work well for EQ use cases (frequency labels) but also general multiband (index labels)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-simple-controls*
*Context gathered: 2026-01-26*
