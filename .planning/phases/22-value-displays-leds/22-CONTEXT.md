# Phase 22: Value Displays & LEDs - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Display elements that show formatted parameter values (Numeric, Time, Percentage, Ratio, Note, BPM, Editable, Multi-Value) and status indicators (Single LED, Bi-Color LED, Tri-Color LED, LED Array, LED Ring, LED Matrix). These are read-only visual feedback elements except for Editable Display which supports user input.

</domain>

<decisions>
## Implementation Decisions

### Display Styling
- Font style is configurable per display: 7-segment LCD look OR clean modern digits (Roboto Mono)
- Bezel/frame style is configurable per display: inset bezel, flat border, or no border
- Default background scheme: dark background with light digits (classic LCD look)
- 7-segment style shows ghost segments (faint unlit segments visible)

### Value Formatting
- Units display is configurable per display: suffix after value OR separate styled label
- Negative values show both minus sign prefix AND color change (red)
- Value overflow handling: truncate with ellipsis when too wide
- Editable Display validation: reject invalid input, show brief error, revert to previous value

### LED Visual Style
- LED shape is configurable per element: round (classic) OR square/rectangular
- Glow effect is configurable per element: enable/disable soft radial glow
- Colors: preset palettes (classic, modern, neon) plus custom color picker
- Off state: dim version of lit color (faintly visible, shows intended color)

### Layout Patterns
- LED Array supports both horizontal and vertical orientations
- LED Matrix: preset sizes (4x4, 8x8, 16x8) plus custom row x column dimensions
- Multi-Value Display layout is configurable: vertical stack OR horizontal row

### Claude's Discretion
- LED Ring positioning approach (standalone vs auto-attach to knob)
- Exact glow effect intensity and radius
- Preset palette color values (classic, modern, neon)
- 7-segment font implementation details

</decisions>

<specifics>
## Specific Ideas

- Ghost segments in 7-segment displays for authentic LCD appearance
- Dim "off" state for LEDs so users can see what color they will be when lit
- Color change for negative values provides immediate visual feedback beyond just the minus sign

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-value-displays-leds*
*Context gathered: 2026-01-26*
