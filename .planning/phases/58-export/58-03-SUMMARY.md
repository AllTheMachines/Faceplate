---
phase: 58-export
plan: 03
subsystem: export
tags: [javascript, animation, styled-elements, slider, button, meter]

dependency-graph:
  requires: ["58-01"]
  provides: ["styled-element-animation-helpers"]
  affects: ["58-04"]

tech-stack:
  patterns: ["string-concatenation-for-browser-compat", "var-for-es5-compat", "clip-path-animation", "transform-translate-animation", "timer-based-decay"]

key-files:
  modified:
    - src/services/export/jsGenerator.ts

decisions:
  - id: styled-function-naming
    choice: "Prefix functions with updateStyled* to distinguish from existing visual update functions"
    why: "Existing updateSliderVisual, updateKnobVisual exist for non-styled elements"
  - id: zone-thresholds-hardcoded
    choice: "Zone thresholds 0.6 (yellow) and 0.85 (red) hardcoded in updateStyledMeter"
    why: "Matches Phase 57-02 decisions, consistent with canvas renderer"
  - id: peak-state-per-meter
    choice: "Peak values and timers tracked in global objects keyed by elementId"
    why: "Allows multiple meters with independent peak hold states"

metrics:
  duration: ~2 minutes
  completed: 2026-02-05
---

# Phase 58 Plan 03: Styled Animation Helpers Summary

**One-liner:** updateStyledSlider/Meter/Button animation helpers with transform translate, clip-path fills, instant opacity toggle, and timer-based peak decay.

## What Was Built

### Styled Element Animation Helpers (6 functions)

Added to jsGenerator.ts for export to JUCE WebView bundles:

1. **updateStyledSlider(elementId, normalizedValue)**
   - Handles both vertical and horizontal orientations
   - Thumb: GPU-accelerated `transform: translate()` for smooth positioning
   - Fill: `clip-path: inset()` for reveal animation
   - Reads orientation from `data-orientation` attribute

2. **updateStyledMeter(elementId, normalizedValue)**
   - Zone fills with thresholds: green (always), yellow (>0.6), red (>0.85)
   - Uses `clip-path: inset()` for bottom-up reveal
   - Delegates to updateStyledMeterPeak when `data-peak-hold="true"`
   - Fallback for single-fill meters without zone layers

3. **updateStyledMeterPeak(elementId, normalizedValue)**
   - Tracks peak values per meter ID in global `peakValues` object
   - Timer-based decay via `peakTimers` object
   - Reads hold duration from `data-peak-duration` (default 2000ms)
   - Sets `bottom` CSS property for peak indicator positioning

4. **updateStyledButton(elementId, pressed)**
   - Instant opacity toggle (no CSS transition per CONTEXT.md)
   - Handles normal/pressed layers for standard buttons
   - Handles on/off layers for toggle switches
   - Handles LED/indicator layers for power buttons

5. **updateStyledRotarySwitch(elementId, position, positionCount)**
   - Rotates `.button-selector` layer to calculated angle
   - 270-degree range (-135 to +135) like knobs
   - Evenly distributes positions across angle range

6. **updateStyledSegmentButton(elementId, selectedIndex, segmentCount)**
   - Uses `clip-path: inset()` on `.button-highlight` layer
   - Calculates segment boundaries as percentages
   - Reveals only the selected segment's highlight

### Browser Compatibility

All functions use:
- `var` instead of `let/const` for ES5 compatibility
- String concatenation instead of template literals
- Standard DOM methods (querySelector, getElementById)

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Function naming | `updateStyled*` prefix | Distinguishes from existing `updateSliderVisual`, `updateKnobVisual` |
| Zone thresholds | Hardcoded 0.6/0.85 | Matches Phase 57-02 meter decisions |
| Peak state | Global objects | Independent peak hold per meter element |
| Animation method | CSS properties | GPU-accelerated, matches canvas renderer behavior |

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

| File | Change |
|------|--------|
| src/services/export/jsGenerator.ts | +230 lines: Added Styled Element Animation Helpers section |

## Verification Results

- `npm run build`: TypeScript compiles (pre-existing errors unrelated to this change)
- All 6 animation helper functions defined
- Class checks: `styled-slider`, `styled-meter`, `styled-button`
- Zone thresholds: 0.6 (yellow), 0.85 (red)
- Peak hold: timer-based decay with configurable duration

## Next Phase Readiness

58-04 can now:
- Call `updateStyledSlider()` from slider interaction handlers
- Call `updateStyledMeter()` from meter value update bindings
- Call `updateStyledButton()` from button click handlers
- Use rotary switch and segment button helpers for specialized components

All animation helpers are available in the exported JS bundle for styled elements.

---

*Plan completed: 2026-02-05*
*Commit: c912036*
