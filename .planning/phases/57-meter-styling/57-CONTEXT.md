# Phase 57: Meter Styling - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Meter element supports SVG styling with value-driven animation. Fill layer animates based on value using clip-path. Peak indicator shows and holds at maximum value. This phase covers the meter category only — all professional meter types (RMS, VU, PPM, LUFS, etc.) share this styling system.

</domain>

<decisions>
## Implementation Decisions

### Fill Animation Method
- Use **clip-path** to reveal fill layers (not scaleY or height adjustment)
- Clip-path preserves gradients and textures in SVG artwork
- Default fill direction: **bottom-up** for vertical meters
- Default fill direction: **left-to-right** for horizontal meters

### Color Zone Layers
- **Separate SVG layers** for green/yellow/red zones (not CSS gradients)
- Zone transitions use **stacked reveal**: green always visible, yellow reveals on top at threshold, red on top of that
- Layer names: fill-green, fill-yellow, fill-red (following existing conventions)

### Peak Indicator Behavior
- Peak hold duration: **configurable per-element** via PropertyPanel property
- Peak drop behavior: **instant drop** (no fade or fall animation)
- Peak color: **per-element override available** (like LED color on Power Button)

### Layer Structure
- Required layers: background, peak
- Zone layers: fill-green, fill-yellow, fill-red (with fallback to single 'fill' layer)
- Optional layer: scale/ticks (rendered statically if present)
- Layer naming: follow existing conventions from Phase 56 (meter-* prefix pattern)

### Orientation Support
- Same style works for **both vertical and horizontal** meters
- Adaptation method: **rotate entire SVG 90°** via CSS transform for horizontal
- Orientation: **explicit property** in PropertyPanel (vertical/horizontal dropdown)
- Horizontal fill direction: left-to-right

### Claude's Discretion
- Peak indicator shape (thin line vs SVG-defined) — defer to layer model consistency
- Fill zone layer requirements (all optional with fallbacks vs required)
- Exact layer naming conventions — follow Phase 56 patterns

</decisions>

<specifics>
## Specific Ideas

- Zone stacking matches how real audio meters work — green is the "base", yellow shows you're getting hot, red shows clipping
- The 90° rotation for horizontal keeps SVG authoring simple — designers only need to create vertical meter styles
- Peak hold time configurable because different use cases need different behaviors (mastering wants longer holds, live mixing wants shorter)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 57-meter-styling*
*Context gathered: 2026-02-04*
