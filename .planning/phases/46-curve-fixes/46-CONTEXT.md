# Phase 46: Curve Fixes - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix 5 curve/visualization elements so they render visibly and respond to interaction:
- EQ Curve — frequency response line with draggable handles
- Compressor Curve — transfer function with threshold/ratio adjustments
- Envelope Display — ADSR curve with draggable control points
- LFO Display — waveform shape that updates when parameters change
- Filter Response — cutoff/resonance curve

This is a bug fix phase. The elements exist but have visibility/interaction issues.

</domain>

<decisions>
## Implementation Decisions

### Visual Rendering
- Line thickness: Thin (1-2px) — precise, technical look
- Background grids: No grid by default — clean look, user can enable via property if added
- Curve colors: User-configurable only — no preset defaults, user picks via property panel
- Fill style: User-defined — whether/how area under curves is filled is a property

### Handle Interaction
- Handle size: Small (8-10px) — subtle, doesn't obscure the curve
- Hover feedback: Handle grows/highlights on hover — scale up or add glow effect
- Fine control: No Shift modifier needed — drag sensitivity is fixed (not like sliders)
- Snap behavior: Optional snap property — user can enable snap in property panel if desired

### Mock Data Display
- Designer values: Configurable via properties — designer can set demo values in property panel
- Handle visibility: Always visible — handles shown at all times for clarity in designer
- EQ bands: Both curve and band dots — composite summed curve plus separate band indicator dots
- ADSR curves: Per-segment curve property — each segment (A, D, R) can be linear or curved

### Update Responsiveness
- Animation: Instant update — curve jumps to new position immediately, no transitions
- Drag update: Real-time redraw — curve updates continuously while dragging handles
- LFO animation: Animation speed property — designer controls whether/how fast waveform animates
- External sync: Update silently — no visual feedback when parameters update from JUCE backend

### Claude's Discretion
- Exact handle hover animation style (glow vs scale vs color change)
- Default demo curve shapes when properties not explicitly set
- Performance optimization for real-time redraw

</decisions>

<specifics>
## Specific Ideas

- Handle style should be consistent across all 5 curve types
- EQ Curve shows both the composite response AND individual band control points
- ADSR envelope segments individually configurable for linear vs exponential curves
- LFO display can animate its waveform if user wants motion preview

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 46-curve-fixes*
*Context gathered: 2026-02-02*
