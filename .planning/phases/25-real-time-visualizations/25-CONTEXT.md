# Phase 25: Real-Time Visualizations - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Canvas-based audio visualizations with continuous rendering: Scrolling Waveform, Spectrum Analyzer, Spectrogram, Goniometer, and Vectorscope. Elements render at 30 FPS with mock data in designer and export to JUCE WebView2 with JavaScript draw functions.

</domain>

<decisions>
## Implementation Decisions

### Visual rendering
- Color style configurable per visualization type (each has its own sensible default)
- Waveform display mode is user choice (property to toggle between line and fill)
- Background color configurable (default dark #1a1a1a, can be changed or made transparent)
- Spectrum analyzer bar gap configurable (property for user to adjust spacing)

### Mock data behavior
- Designer shows static representative data (frozen snapshot, not animated)
- Spectrum analyzer mock: pink noise slope (natural-looking frequency distribution)
- Goniometer/vectorscope mock: centered mono signal (vertical line)
- Spectrogram mock: single frozen frame showing typical frequency content

### Scale & grid overlays
- All overlays are toggleable via properties (not always-on or always-off)
- Frequency labels: toggleable property (show/hide Hz labels on spectrum)
- dB scale markers: toggleable property (show/hide vertical axis scale)
- Background grid lines: toggleable property (show/hide grid)
- Goniometer axis lines: toggleable property (show/hide L/R and M/S reference lines)

### Canvas sizing
- Aspect ratios: recommended but flexible (default per type, user can override)
- Global minimum size: 40x40 pixels (applies to all visualization types)
- Canvas resolution: configurable property for scale factor (handles HiDPI displays)

### Claude's Discretion
- Specific default colors per visualization type
- Default aspect ratios per type
- Grid line colors and opacity
- Mock data exact values/patterns within the described characteristics
- Canvas scale factor default value

</decisions>

<specifics>
## Specific Ideas

- Pink noise slope for spectrum mock gives realistic audio-like appearance
- Mono signal for stereo displays shows what correlated audio looks like
- Toggleable everything means user controls information density per their needs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-real-time-visualizations*
*Context gathered: 2026-01-26*
