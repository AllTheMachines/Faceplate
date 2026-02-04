# Phase 56: Button & Switch Styling - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the ElementStyle system to buttons and switches. 7 element types (Button, Icon Button, Toggle Switch, Power Button, Rocker Switch, Rotary Switch, Segment Button) render with user-provided SVG artwork, swapping state layers based on interaction. This phase does NOT include export (Phase 58) or UI dialogs (Phase 59).

</domain>

<decisions>
## Implementation Decisions

### State layer structure
- Single SVG file with named layers — detection extracts each state (normal, pressed, on, off, etc.)
- Multi-position elements (rocker, rotary) use numbered layers: position-0, position-1, position-2...
- Per-element layer schemas (not unified) — ButtonLayers, ToggleLayers, RockerLayers, etc. with tailored required/optional layers
- Toggle switch and power button have separate 'indicator' or 'led' layer that toggles visibility independently of background

### Visual transitions
- Keep current transition behavior from existing implementations (preserve what works)
- Rocker switch: direct jump between positions (no intermediate visual states)
- Toggle switch: layer swap only (no sliding animation — slide is baked into artwork)

### Icon coloring approach
- Fill replacement method (like knob indicator) — replace fill/stroke colors in SVG paths
- Background layers also support color override (not just icons/indicators)
- Power button LED color is user-configurable via property panel
- Segment button selection approach: Claude's discretion (highlight layer vs per-segment states)

### Rotary switch specifics
- Position labels: Claude's discretion (extracted from SVG vs programmatic overlay)
- Keep current selector motion behavior (check existing implementation)
- Separate static 'base' layer with rotating selector/pointer layer on top
- Keep current position count behavior (check existing implementation)

### Claude's Discretion
- Segment button selection visual approach (highlight layer vs per-segment states)
- Rotary switch position labels (extracted vs programmatic)
- Icon color zones (single color vs primary/secondary — lean toward simplicity unless clearly useful)

</decisions>

<specifics>
## Specific Ideas

- "Like it is now" for transitions, rotary motion, and position counts — preserve existing behavior, just add SVG layer support
- Follow patterns established in Phase 53-55 for layer detection and rendering

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 56-button-switch-styling*
*Context gathered: 2026-02-04*
