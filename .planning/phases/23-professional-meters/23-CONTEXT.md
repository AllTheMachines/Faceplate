# Phase 23: Professional Meters - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Standards-compliant audio meters with correct ballistics for professional metering. Includes RMS, VU, PPM (Type I/II), True Peak, LUFS (Momentary, Short-term, Integrated), K-System (K-12, K-14, K-20), Correlation Meter, and Stereo Width Meter. All meters support configurable color zones and peak hold indicators.

</domain>

<decisions>
## Implementation Decisions

### Visual Style
- Segmented (LED-style) fill, not continuous gradient
- Minimal bezel/frame style — thin border or none
- Orientation is user-configurable (vertical or horizontal) via property panel
- Tight segment gaps (1px) — dense appearance like Waves plugins

### Scale & Labeling
- Scale position is user-configurable (outside or inside meter)
- Major + minor tick marks by default
- Numeric readout is an optional property (user can enable/disable)
- dB range varies per meter type (VU: -20 to +3, PPM: -50 to +5, LUFS: -60 to 0, etc.)

### Ballistics Preview
- Static mock level in designer (no animation)
- Default preview level at -12 dB
- Peak hold indicator shown in preview only when peak hold property is enabled

### Multi-channel Layout
- Stereo meters arranged side by side (L|R) — traditional mixer layout
- Channel labels (L/R) as optional property
- Mono and stereo meters as separate element types (not a toggle)
- Correlation and stereo width meters use horizontal bar shape

### Claude's Discretion
- Stereo preview levels (slight L/R difference vs symmetric)
- Exact tick mark positions per meter type
- Color zone transition points within standard guidelines
- Peak hold indicator visual style (line vs bar)

</decisions>

<specifics>
## Specific Ideas

- Segmented meters should look like classic hardware LED meters
- Tight 1px gaps create a dense, professional appearance similar to Waves plugins
- Side-by-side stereo arrangement follows traditional mixer channel strip conventions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-professional-meters*
*Context gathered: 2026-01-26*
