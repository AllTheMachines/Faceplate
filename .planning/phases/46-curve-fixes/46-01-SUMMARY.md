# Phase 46 Plan 01: EQ Curve & Filter Response Fixes Summary

**Completed:** 2026-02-02
**Duration:** ~5 minutes

## One-Liner

Fixed EQ Curve and Filter Response canvas rendering by removing CSS size overrides that broke useCanvasSetup hook dimensions.

## Changes Made

### Files Modified

| File | Change |
|------|--------|
| `src/components/elements/renderers/displays/curves/EQCurveRenderer.tsx` | Removed `width: '100%'` and `height: '100%'` from canvas style |
| `src/components/elements/renderers/displays/curves/FilterResponseRenderer.tsx` | Removed `width: '100%'` and `height: '100%'` from canvas style |

## Root Cause Analysis

The canvas elements had CSS style properties `width: '100%'` and `height: '100%'` in their JSX style prop. This overrode the pixel dimensions set by the `useCanvasSetup` hook (`canvas.style.width = '${width}px'`).

The hook:
1. Sets canvas internal size (`canvas.width = width * dpr`)
2. Sets canvas display size (`canvas.style.width = '${width}px'`)
3. Scales context for HiDPI (`context.scale(dpr, dpr)`)

The JSX style immediately overwrote step 2 with percentage values, causing:
- Canvas stretched to fill container (not the intended pixel size)
- Drawing coordinates didn't match actual canvas display
- Curves and handles appeared at wrong positions or were invisible

## Solution

Removed the CSS percentage overrides, allowing the hook's pixel-based sizing to work correctly. Other canvas renderers (Goniometer, Vectorscope) don't have this issue because they either:
- Don't specify width/height in JSX style (letting hook control it)
- Use pixel values matching the hook's settings

## Verification

- Dev server running at http://localhost:5173/
- EQ Curve elements render visible curve with hoverable handles
- Filter Response elements render visible curve with hoverable cutoff handle
- Both respond to property changes in the panel

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 5ba9377 | fix | Remove CSS size overrides from EQ Curve and Filter Response |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Remove CSS width/height rather than change to pixels | Simpler fix; hook already handles sizing correctly |

## Next Steps

- Phase 46-02: Fix Compressor Curve and Envelope Display (same pattern)
- Phase 46-03: Fix LFO Display

---
*Plan: 46-01 | Phase: 46-curve-fixes | Completed: 2026-02-02*
