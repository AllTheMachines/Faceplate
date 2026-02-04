# Phase 21: Buttons & Switches - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

7 interactive button and switch control variants for plugin UIs: Icon Button, Toggle Switch, Rocker Switch, Rotary Switch, Kick Button, Segment Button, and Power Button. Each requires element type, renderer, property panel, palette entry, and export support.

</domain>

<decisions>
## Implementation Decisions

### Visual states & feedback
- Pressed/active states indicated by color change only (no depth effects or glow)
- LED indicators on Power Button are solid when on, no pulse/breathing animation
- State transitions are instant (0ms) — no animation delays
- Hover states: Claude's discretion per button type

### Toggle vs momentary behavior
- Toggle Switch snaps instantly to new position (no slide animation)
- Power Button uses single click to toggle (no long-press requirement)
- Segment Button defaults to single selection, with property to allow multi-select mode
- Kick Button press duration: Claude's discretion

### Icon sources
- Both built-in icon set AND custom icons from asset library
- Built-in set is comprehensive (~35 icons): transport controls (play, pause, stop, record, loop, skip), common (mute, solo, bypass, power, settings), and audio-specific (waveform, spectrum, MIDI, sync, link)
- Icon Button can use built-in icons or reference asset library SVGs

### Segment Button labels
- Segments can show icon only, text only, or icon + text
- 2-8 segments allowed per Segment Button
- Active segment indication: Claude's discretion

### Rocker Switch behavior
- Property to choose between spring-to-center (momentary up/down) or latch-all-positions mode
- 3 positions: up, center, down

### Rotary Switch positions
- Configurable position count: 2-12 (number input, not fixed presets)
- Position labels: Claude's discretion on positioning (radial vs legend)

### Claude's Discretion
- Hover state styling per button type
- Kick Button momentary feedback timing
- Rotary Switch label positioning
- Active segment visual indicator style

</decisions>

<specifics>
## Specific Ideas

- Icons should cover common audio plugin needs without requiring custom imports for typical use cases
- Segment Button behavior mirrors iOS UISegmentedControl but with optional multi-select
- Rocker Switch should support both pitch-bend style (spring) and mode-switch style (latch)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-buttons-switches*
*Context gathered: 2026-01-26*
