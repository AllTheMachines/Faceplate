---
phase: 47
plan: 03
subsystem: controls
tags: [stepped-knob, tick-marks, snap-behavior, css-transition]
depends_on:
  requires: []
  provides: [showStepMarks-property, tick-mark-rendering, snap-transition]
  affects: [stepped-knob-variants, juce-export]
tech-stack:
  added: []
  patterns: [optional-tick-marks, proportional-sizing, css-transitions]
key-files:
  created: []
  modified:
    - src/types/elements/controls.ts
    - src/components/elements/renderers/controls/SteppedKnobRenderer.tsx
    - src/components/Properties/SteppedKnobProperties.tsx
decisions:
  - Tick marks at radius * 1.05 (inner) to radius * 1.15 (outer) for subtle visibility
  - Stroke width proportional to trackWidth (trackWidth / 4, min 1px)
  - 50ms CSS transition for smooth snap animation
metrics:
  duration: 10min
  completed: 2026-02-02
---

# Phase 47 Plan 03: Stepped Knob Tick Marks Summary

Optional tick marks outside knob edge at each step position with CSS transition for smooth snap animation.

## What Was Built

### 1. showStepMarks Property
Added `showStepMarks: boolean` to SteppedKnobElementConfig:
- Controls display of tick marks outside knob edge
- Default: `false` (user opts in)
- Separate from existing `showStepIndicators` (dots on arc track)

### 2. Tick Mark Rendering
When `showStepMarks` is enabled:
- Tick marks drawn from radius * 1.05 (inner) to radius * 1.15 (outer)
- Stroke color uses `trackColor` for consistency
- Stroke width: `Math.max(1, trackWidth / 4)` - proportional but thin
- Round line caps for smooth appearance

### 3. CSS Snap Transition
Added 50ms CSS transition to indicator group:
- Provides smooth animation when value changes
- Creates visual "snap" effect when stepping between values
- Matches transition pattern used in KnobRenderer

### 4. Property Panel Control
Added "Show Step Marks" checkbox:
- Located in Step Configuration section
- Grouped with existing "Show Step Indicators" checkbox
- Immediate visual feedback when toggled

## Key Implementation Details

```typescript
// Tick mark calculation
const outerRadius = radius * 1.15
const innerRadius = radius * 1.05
for (let i = 0; i < config.stepCount; i++) {
  const stepNormalized = i / (config.stepCount - 1)
  const stepAngle = config.startAngle + stepNormalized * (config.endAngle - config.startAngle)
  tickMarks.push({
    inner: polarToCartesian(centerX, centerY, innerRadius, stepAngle),
    outer: polarToCartesian(centerX, centerY, outerRadius, stepAngle)
  })
}
```

## Commits

| Hash | Description |
|------|-------------|
| b8806e3 | Add showStepMarks property to SteppedKnobElementConfig |
| 8ca50e6 | Add tick mark rendering and CSS transition to Stepped Knob |
| 54160e1 | Add showStepMarks checkbox to property panel |
| 7c69f5e | Update build timestamp |

## Files Modified

- `src/types/elements/controls.ts` - Added showStepMarks property and factory default
- `src/components/elements/renderers/controls/SteppedKnobRenderer.tsx` - Tick mark rendering and CSS transition
- `src/components/Properties/SteppedKnobProperties.tsx` - Property panel checkbox

## Deviations from Plan

None - plan executed exactly as written.

## Verification

All success criteria met:
- [x] Stepped Knob can display optional tick marks outside the knob edge
- [x] Tick marks scale proportionally with knob size
- [x] Value changes have smooth 50ms CSS transition
- [x] TypeScript compiles without new errors (pre-existing errors remain)
- [x] showStepMarks controllable from property panel

## Next Phase Readiness

Phase 47-03 complete. The stepped knob now supports dial-style tick marks for users who prefer that visual style. The snap-on-release behavior for runtime interaction is a JUCE concern - the designer provides the visual feedback via CSS transitions.
