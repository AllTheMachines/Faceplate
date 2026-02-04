# Phase 45: Slider Fixes - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix four slider element bugs: ASCII Slider drag interaction, Arc Slider label positioning, Notched Slider visibility, and Bipolar Slider horizontal orientation. These are existing elements that need fixes to work correctly.

</domain>

<decisions>
## Implementation Decisions

### ASCII Slider Drag Feel
- Fine control mode: Hold Shift for slower/finer adjustments while dragging
- Shift+drag sensitivity: 10x slower (mouse movement 10x less sensitive)
- Live value preview: Show current value inline in the slider display as user drags
- Drag direction: Claude's discretion based on existing slider patterns in codebase

### Arc Slider Label Positioning
- Label position: Configurable (user chooses inside or outside arc via property panel)
- Distance control: Numeric input in pixels for exact positioning
- Separate controls: Independent distance settings for label and value
- Default distance: 8-10px gap from the arc

### Notched Slider Visuals
- Tick style: Simple lines extending from the track at each notch position
- Tick position: Lines extend on both sides of the track
- Label visibility: Configurable — user can toggle labels on/off and set which notches show labels
- Tick color: Independent color property (separate from track color)

### Bipolar Slider Horizontal
- Center snap: Configurable via property panel (enable/disable snap to center)
- Zone colors: Two configurable colors — one for negative zone, one for positive zone
- Center marker: Visible thin vertical line at the zero position
- Labels: Same options as vertical orientation (min/max labels can appear at ends)

### Claude's Discretion
- ASCII Slider: Exact drag direction mapping based on existing patterns
- Arc Slider: Exact pixel value for default distance (within 8-10px range)
- Notched Slider: Label interval logic implementation details
- Bipolar Slider: Center snap threshold value

</decisions>

<specifics>
## Specific Ideas

- Fine control (Shift+drag) is standard in audio software — 10x reduction is a good starting point
- Arc Slider should feel flexible — pixel-level control lets users position labels exactly where they want
- Notched Slider tick lines on both sides gives a balanced, professional look
- Bipolar Slider's two-color zones make positive/negative immediately visible

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 45-slider-fixes*
*Context gathered: 2026-02-02*
