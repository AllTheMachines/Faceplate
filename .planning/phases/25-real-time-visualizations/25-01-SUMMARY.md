---
phase: 25-real-time-visualizations
plan: 01
subsystem: visualization-infrastructure
tags: [typescript, types, canvas, audio, mock-data, hooks]
requires: [phase-19-architectural-foundations, phase-22-value-displays-leds]
provides: [visualization-types, mock-audio-data, canvas-setup-hook]
affects: [phase-25-02, phase-25-03, phase-25-04]
tech-stack.added: []
tech-stack.patterns: [canvas-hidpi-scaling, pink-noise-spectrum, static-mock-data]
key-files.created:
  - src/types/elements/visualizations.ts
  - src/utils/mockAudioData.ts
  - src/hooks/useCanvasSetup.ts
key-files.modified:
  - src/types/elements/index.ts
decisions: [static-mock-data, pink-noise-spectrum, hidpi-canvas-scaling]
metrics:
  duration: 3 minutes
  completed: 2026-01-26
---

# Phase 25 Plan 01: Visualization Foundation Summary

**One-liner:** TypeScript types for 5 Canvas visualizations with pink noise mock data and HiDPI-scaled Canvas setup hook

## What Was Built

Created foundational infrastructure for Canvas-based audio visualizations:

### Visualization Element Types (src/types/elements/visualizations.ts)
- **ScrollingWaveformElementConfig** - line/fill display modes, configurable grid overlay
- **SpectrumAnalyzerElementConfig** - FFT size (512-8192), frequency scale (linear/log/mel), color gradients
- **SpectrogramElementConfig** - waterfall display with frozen frame mock data
- **GoniometerElementConfig** - stereo correlation display with L/R and M/S axis lines
- **VectorscopeElementConfig** - stereo phase display with circular grid

All types include:
- HiDPI `canvasScale` property for device pixel ratio handling
- Toggleable overlays (grid, labels, scales) per CONTEXT.md decisions
- Sensible defaults (dark #1a1a1a background, #00ff88 trace color)
- Factory functions with crypto.randomUUID()
- Type guards (isScrollingWaveform, isSpectrumAnalyzer, etc.)

### Mock Audio Data Utilities (src/utils/mockAudioData.ts)
- **generatePinkNoiseSpectrum** - realistic -3dB/octave slope for spectrum analyzers
- **generateWaveformData** - static waveform with harmonics and natural noise variation
- **generateSpectrogramFrame** - single frozen frame with pink noise distribution
- **generateMonoSignal** - centered vertical line for goniometer/vectorscope (mono correlation)
- **magnitudeToColor** - heatmap color mapping (default/fire/cool/grayscale)

All functions generate static mock data per CONTEXT.md decision (frozen snapshots, not animated).

### Canvas Setup Hook (src/hooks/useCanvasSetup.ts)
- **useCanvasSetup(width, height, scale?)** - reusable HiDPI Canvas initialization
- Uses `useLayoutEffect` (NOT `useEffect`) per RESEARCH.md to prevent timing issues
- Handles device pixel ratio scaling automatically (canvas.width/height * dpr)
- Sets canvas display dimensions via CSS (style.width/height)
- Scales 2D context to match device pixel ratio (ctx.scale(dpr, dpr))
- Returns { canvasRef, ctx } for renderer components

No animation loop included - static rendering per CONTEXT.md decision.

### Type System Integration
Updated `src/types/elements/index.ts`:
- Export `VisualizationElement` union type
- Add to `ElementConfig` union for registry compatibility
- Re-export all visualization type guards and factory functions

## Technical Decisions

### Static Mock Data Pattern
**Decision:** Designer shows frozen snapshots, not animated visualizations
**Rationale:** Matches CONTEXT.md decision, avoids battery drain, simplifies renderer implementation
**Impact:** Visualization renderers draw once with static mock data (no requestAnimationFrame loop)

### Pink Noise Spectrum for Mock Data
**Decision:** Use -3dB/octave pink noise slope for spectrum analyzer mock data
**Rationale:** Realistic audio-like frequency distribution, natural appearance in designer
**Formula:** `Math.pow(frequency + 0.1, -0.5)` approximation with ±10% random variation
**Impact:** Mock spectrum analyzers look professional and realistic

### HiDPI Canvas Scaling with useLayoutEffect
**Decision:** Scale canvas internal dimensions by devicePixelRatio, use useLayoutEffect
**Rationale:** Prevents blur on retina displays, useLayoutEffect prevents rAF timing issues
**Pattern:** canvas.width = width * dpr, canvas.height = height * dpr, ctx.scale(dpr, dpr)
**Impact:** Sharp rendering on all display types, no memory leaks from animation cleanup

### Mono Signal for Stereo Displays
**Decision:** Goniometer/vectorscope mock shows centered vertical line (mono correlation)
**Rationale:** Per CONTEXT.md, shows what perfectly correlated audio looks like
**Impact:** Clear visual representation of stereo phase relationship in designer

### Toggleable Overlays
**Decision:** All grids, labels, and scales are configurable boolean properties
**Rationale:** Per CONTEXT.md, user controls information density per their needs
**Impact:** Flexible visualization configuration without hardcoded overlay behavior

## Verification Results

✅ All verification checks passed:
1. `npx tsc --noEmit` - TypeScript compiles without errors
2. All 5 visualization types exported from src/types/elements/index.ts
3. Mock data utilities export 5 functions (generatePinkNoiseSpectrum, generateWaveformData, generateSpectrogramFrame, generateMonoSignal, magnitudeToColor)
4. Canvas hook uses useLayoutEffect (not useEffect)

## Integration Points

### For Phase 25-02 (Visualization Renderers)
- Import visualization types: `import { ScrollingWaveformElementConfig } from '@/types/elements'`
- Use mock data: `import { generatePinkNoiseSpectrum } from '@/utils/mockAudioData'`
- Use Canvas hook: `const { canvasRef, ctx } = useCanvasSetup(config.width, config.height, config.canvasScale)`

### For Phase 25-03 (Property Panels & Palette)
- Import factory functions: `import { createSpectrumAnalyzer } from '@/types/elements'`
- Factory functions handle all defaults (no need to specify every property)

### For Phase 25-04 (Export Support)
- Canvas draw functions will use mock data patterns for JUCE integration
- Export JavaScript functions that JUCE can execute in WebView2

## Files Changed

### Created (3 files)
- `src/types/elements/visualizations.ts` (260 lines) - 5 visualization type interfaces
- `src/utils/mockAudioData.ts` (188 lines) - Mock data generation utilities
- `src/hooks/useCanvasSetup.ts` (50 lines) - Canvas HiDPI setup hook

### Modified (1 file)
- `src/types/elements/index.ts` - Added VisualizationElement to ElementConfig union

## Deviations from Plan

None - plan executed exactly as written.

## Authentication Gates

None - no external services required.

## Next Phase Readiness

**Ready for Phase 25-02 (Visualization Renderers):**
- Visualization types established with all properties defined
- Mock data generators ready for renderer use
- Canvas setup hook ready for HiDPI rendering
- Type guards and factory functions available

**No blockers identified.**

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 8c18957 | feat(25-01): create visualization element types | visualizations.ts, index.ts |
| ffeed40 | feat(25-01): create mock audio data utilities | mockAudioData.ts |
| 304a59b | feat(25-01): create Canvas setup hook | useCanvasSetup.ts |

---

**Phase:** 25-real-time-visualizations
**Plan:** 01
**Status:** Complete
**Duration:** 3 minutes
**Completed:** 2026-01-26
