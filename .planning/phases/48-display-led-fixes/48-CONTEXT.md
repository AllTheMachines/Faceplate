# Phase 48: Display & LED Fixes - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix Note Display font sizing issues and remove all LED element types (no longer needed).

</domain>

<decisions>
## Implementation Decisions

### LED Element Removal
- Remove ALL 6 LED element types: Single LED, Bicolor LED, Tri-Color LED, LED Array, LED Ring, LED Matrix
- Breaking change: LED elements no longer supported
- Silent removal during project load (no warnings, no toasts)
- Remove from: palette, renderers, properties, types, export generators, help content

### Note Display Font Sizing
- Default font size: 14px (matches Numeric Display and other value displays)
- Add fontSize property to property panel
- Allowed range: 8-24px
- Add showOctave property (boolean) - configurable whether to display octave number
  - When true: "C4" (MIDI 60)
  - When false: "C" (note letter only)
  - Default: true (show octave)

### Claude's Discretion
- Implementation approach for property panel additions
- Help content updates for Note Display
- Cleanup order for LED removal

</decisions>

<specifics>
## Specific Ideas

- Note Display should behave consistently with Numeric Display and other value displays
- LED removal follows same pattern as KickButton removal in Phase 47-02

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 48-display-led-fixes*
*Context gathered: 2026-02-02*
