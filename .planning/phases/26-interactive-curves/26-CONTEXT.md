# Phase 26: Interactive Curves - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive curve editors for EQ, dynamics, and modulation. Five element types:
- EQ Curve (draggable frequency/gain/Q handles)
- Compressor Curve (threshold, ratio, knee parameters)
- Envelope Display (ADSR visualization with curve types)
- LFO Display (waveform shapes)
- Filter Response (cutoff/resonance curve)

All are Canvas-based elements. Designer shows static preview with mock data (consistent with Phase 25 visualizations). JUCE updates curve data at runtime.

</domain>

<decisions>
## Implementation Decisions

### Handle Interaction Design
- Square handles (not circles or diamonds)
- 8px base size (compact, precise)
- Hover state: color change + size increase (8px → 10px)
- Static preview in designer — handles shown at fixed positions, not draggable
- Handle positions configured via property panel values, not direct canvas manipulation

### Grid & Scale Display
- Frequency scale: Logarithmic (industry standard, equal visual space per octave)
- dB range: Configurable — user sets min/max dB in property panel
- Grid labels: Configurable visibility — user can toggle frequency labels and dB labels independently
- Grid line color: Configurable — user sets grid color in property panel

### Curve Rendering Style
- Line width: Configurable (1-4px range via property panel)
- Curve fill: Configurable — user can enable/disable fill, set fill color and opacity
- Curve smoothing: Configurable per element type — Bezier for EQ/Filter, option for linear on Envelope
- Multi-band EQ: Configurable view — composite-only or individual bands + composite

### Parameter Visualization
- EQ Curve: Configurable 1-16 bands — user sets band count in property panel
- Compressor Curve: Both visualization modes available — transfer curve (input/output graph) or gain reduction meter style, user chooses in property panel
- Envelope Display (ADSR): Configurable stage indication — single color with markers or color-coded segments per stage
- LFO Display: Full 8+ shapes — Sine, Triangle, Saw, Square, Sample & Hold, Smooth Random, Pulse Width variants, Exponential curves
- Filter Response: Follows EQ grid conventions (log frequency, configurable dB range)

### Claude's Discretion
- Exact handle colors for normal/hover/active states
- Grid line spacing intervals (major/minor tick density)
- Canvas rendering optimization (requestAnimationFrame usage)
- Mock data generation for each curve type
- Filter types to support (lowpass, highpass, bandpass, notch, shelf, peak)

</decisions>

<specifics>
## Specific Ideas

- Handles should feel precise and technical (8px squares match the professional audio tool aesthetic)
- Heavy emphasis on configurability — users have different aesthetic preferences for their plugin UIs
- EQ and Filter Response share the same grid conventions (logarithmic frequency scale)
- Compressor curve should work both as classic transfer function display AND as simpler gain reduction indicator

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 26-interactive-curves*
*Context gathered: 2026-01-26*
