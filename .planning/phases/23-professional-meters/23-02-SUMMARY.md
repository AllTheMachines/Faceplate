---
phase: 23
plan: 02
subsystem: displays
tags: [meters, rms, vu, ppm, professional-audio, ansi, iec, ballistics]
requires: [23-01]
provides: [rms-meters, vu-meters, ppm-meters, stereo-meters]
affects: [23-03, 23-04]
tech-stack:
  added: []
  patterns: [stereo-meter-layout, channel-labels, ballistics-types]
key-files:
  created:
    - src/components/elements/renderers/displays/meters/RMSMeterRenderer.tsx
    - src/components/elements/renderers/displays/meters/VUMeterRenderer.tsx
    - src/components/elements/renderers/displays/meters/PPMType1Renderer.tsx
    - src/components/elements/renderers/displays/meters/PPMType2Renderer.tsx
  modified:
    - src/types/elements/displays.ts
    - src/components/elements/renderers/displays/meters/index.ts
    - src/components/elements/renderers/displays/index.ts
    - src/components/elements/renderers/index.ts
decisions:
  - key: rms-db-range
    choice: -60 to 0 dB with 60 segments
    rationale: 1 dB per segment for precise RMS measurement
  - key: vu-db-range
    choice: -20 to +3 dB with 23 segments
    rationale: ANSI C16.5-1942 standard VU range
  - key: ppm-db-range
    choice: -50 to +5 dB with 55 segments
    rationale: IEC 60268-10 standard for both Type I (DIN) and Type II (BBC)
  - key: stereo-channel-gap
    choice: 8px gap between L/R meters
    rationale: Visual separation without excessive spacing
  - key: channel-labels
    choice: Optional L/R labels at bottom
    rationale: Clear identification without cluttering meter display
duration: 4
completed: 2026-01-26
---

# Phase 23 Plan 02: RMS, VU, and PPM Meters Summary

**One-liner:** RMS, VU (ANSI C16.5-1942), PPM Type I (IEC 60268-10 DIN), and PPM Type II (IEC 60268-10 BBC) meters with mono/stereo variants using standards-compliant dB ranges and ballistics

## Overview

Implemented 8 professional meter element types (4 meter standards x 2 channel configurations) following industry metering standards. RMS meters use 300ms averaging, VU meters follow ANSI ballistics, PPM Type I follows DIN standard (10ms attack, 1.5s release), PPM Type II follows BBC standard (10ms attack, 2.8s release).

All meters use the shared SegmentedMeter and MeterScale components from Plan 23-01, with proper dB range mapping, color zones, and peak hold indicators.

## What Was Delivered

### Element Types (8 total)

**RMS Meters (300ms averaging):**
- RMSMeterMonoElementConfig: -60 to 0 dB, 60 segments
- RMSMeterStereoElementConfig: Independent L/R values, channel labels

**VU Meters (ANSI C16.5-1942):**
- VUMeterMonoElementConfig: -20 to +3 dB, 23 segments
- VUMeterStereoElementConfig: Independent L/R values, channel labels
- Color zones: Green to 0 VU, red above

**PPM Type I Meters (IEC 60268-10 DIN):**
- PPMType1MonoElementConfig: -50 to +5 dB, 55 segments
- PPMType1StereoElementConfig: 10ms attack @ 90%, 20dB/1.5s release

**PPM Type II Meters (BBC/EBU):**
- PPMType2MonoElementConfig: -50 to +5 dB, 55 segments
- PPMType2StereoElementConfig: 10ms attack @ 80%, 24dB/2.8s release

### Renderer Components

**4 Renderer Files:**
- RMSMeterRenderer.tsx: Mono and stereo RMS meter renderers
- VUMeterRenderer.tsx: Mono and stereo VU meter renderers
- PPMType1Renderer.tsx: Mono and stereo PPM Type I renderers
- PPMType2Renderer.tsx: Mono and stereo PPM Type II renderers

**Layout Features:**
- Scale position support: outside, inside, none
- Vertical meters: scale | L meter | 8px gap | R meter
- Horizontal meters: top meter | 8px gap | bottom meter | scale
- Optional L/R channel labels (10px font, #999 color)
- Dynamic width/height calculations based on scale position

### Configuration

**Shared Properties (BaseProfessionalMeterConfig):**
- Value: 0-1 normalized, maps to dB range
- dB range: minDb/maxDb (varies per meter type)
- Orientation: vertical or horizontal
- Segment configuration: count, gap
- Scale: position, major/minor ticks, numeric readout
- Color zones: array of {startDb, endDb, color}
- Peak hold: enabled, style (line/bar), duration

**Stereo-specific Properties:**
- valueL, valueR: Independent L/R channel values
- showChannelLabels: Display "L" and "R" labels

### Factory Functions

**Default Values:**
- Preview at -12 dB (0.8 for RMS, 0.35 for VU, 0.69 for PPM)
- Stereo asymmetry: slight difference between L/R values
- Default color zones: Green < -18dB, yellow -18 to -6dB, red >= -6dB (except VU)
- Peak hold: Enabled, line style, 2000ms duration
- Scale: Outside position, major/minor ticks enabled

## Decisions Made

### 1. RMS dB Range (-60 to 0 dB)

**Context:** RMS meters measure averaged levels over 300ms window.

**Options:**
- A: -60 to 0 dB (60 segments)
- B: -48 to 0 dB (48 segments, less low-end detail)

**Choice:** A (-60 to 0 dB with 60 segments)

**Rationale:**
- Industry standard for RMS meters
- 1 dB per segment provides precise measurement
- Full dynamic range visibility
- Matches typical DAW meter ranges

### 2. VU dB Range (-20 to +3 dB)

**Context:** VU meters follow ANSI C16.5-1942 standard with 300ms ballistics.

**Options:**
- A: -20 to +3 dB (ANSI standard)
- B: -20 to 0 dB (truncated)

**Choice:** A (-20 to +3 dB with 23 segments)

**Rationale:**
- ANSI C16.5-1942 compliance
- +3 dB headroom above 0 VU reference
- Historical accuracy for vintage-style metering
- Green to 0 VU, red above matches physical VU meters

### 3. PPM dB Range (-50 to +5 dB)

**Context:** PPM meters follow IEC 60268-10 standard, with Type I (DIN) and Type II (BBC) ballistics.

**Options:**
- A: -50 to +5 dB (IEC 60268-10 standard)
- B: -40 to +6 dB (EBU R68 variant)

**Choice:** A (-50 to +5 dB with 55 segments)

**Rationale:**
- IEC 60268-10 compliance for both Type I and Type II
- Matches professional broadcast standards
- Type I: 10ms attack @ 90%, 20dB/1.5s release (DIN)
- Type II: 10ms attack @ 80%, 24dB/2.8s release (BBC)

### 4. Stereo Channel Gap (8px)

**Context:** Stereo meters display L/R channels side-by-side (vertical) or top/bottom (horizontal).

**Options:**
- A: 4px (tight spacing)
- B: 8px (moderate spacing)
- C: 12px (wide spacing)

**Choice:** B (8px gap)

**Rationale:**
- Clear visual separation without excessive width
- Matches 8px gap used in LED arrays (Phase 22)
- Maintains compact meter footprint
- Works well with scale positioning

### 5. Channel Labels Position

**Context:** Stereo meters need L/R identification.

**Options:**
- A: Labels at bottom (outside meter body)
- B: Labels inside meter area
- C: No labels (rely on visual order)

**Choice:** A (Optional labels at bottom)

**Rationale:**
- Clear without cluttering meter display
- User-configurable (showChannelLabels flag)
- 10px font size readable at typical plugin scales
- Positioned outside meter grid area
- #999 color contrasts with meter background

## Implementation Notes

### Standards Compliance

**RMS Meters:**
- 300ms averaging window (ballisticsType: 'RMS')
- -60 to 0 dB range (1 dB per segment)
- Default color zones: green/yellow/red

**VU Meters:**
- ANSI C16.5-1942 standard (ballisticsType: 'VU')
- -20 to +3 dB range (23 segments)
- 300ms rise/fall @ 99% (ballistics annotation)
- Green to 0 VU, red above

**PPM Type I (DIN):**
- IEC 60268-10 (ballisticsType: 'PPM_TYPE_I')
- -50 to +5 dB range (55 segments)
- 10ms attack @ 90%, 20dB/1.5s release

**PPM Type II (BBC/EBU):**
- IEC 60268-10 (ballisticsType: 'PPM_TYPE_II')
- -50 to +5 dB range (55 segments)
- 10ms attack @ 80%, 24dB/2.8s release

### Renderer Architecture

**Mono Renderers:**
```
[Scale?] [SegmentedMeter] [Scale?]
```

**Stereo Renderers:**
```
[Scale?] [L Meter] [8px gap] [R Meter]
[L/R Labels]
```

**Layout Calculation:**
- Scale width: 30px (if outside position)
- Meter width: Remaining space after scale and gap
- Label height: 16px (if showChannelLabels enabled)
- Dynamic sizing based on orientation and scale position

### Shared Components

All meters use Plan 23-01 components:
- SegmentedMeter: CSS Grid, 1px gaps, color zones, peak hold
- MeterScale: SVG tick marks, dB labels
- PeakHoldIndicator: Line or bar overlay

## Deviations from Plan

None - plan executed exactly as written.

## Testing Performed

### Manual Verification

1. Type definitions exist:
   - `grep "type: 'rmsmetermo'" displays.ts` ✓
   - RMS, VU, PPM Type I, PPM Type II interfaces present

2. Factory functions exist:
   - `grep "createVUMeterStereo" displays.ts` ✓
   - All 8 factory functions with proper defaults

3. Renderer files created:
   - 4 renderer files in meters/ directory ✓
   - Each with mono and stereo variants

4. Registry entries:
   - `grep "rmsmetermo\|ppmtype2stereo" index.ts` ✓
   - All 8 types registered in rendererRegistry

### Code Structure

- BaseProfessionalMeterConfig: Shared properties for all meter types
- Type guards: isRMSMeterMono, isVUMeterStereo, etc.
- DisplayElement union: Updated with 8 new types
- Renderers: Consistent layout and props across all meter types

## Files Modified

**Type Definitions:**
- src/types/elements/displays.ts (+422 lines)
  - BaseProfessionalMeterConfig interface
  - 8 meter element configs
  - 8 type guards
  - 8 factory functions with standards-compliant defaults
  - Updated DisplayElement union

**Renderer Components:**
- src/components/elements/renderers/displays/meters/RMSMeterRenderer.tsx (new, 145 lines)
- src/components/elements/renderers/displays/meters/VUMeterRenderer.tsx (new, 145 lines)
- src/components/elements/renderers/displays/meters/PPMType1Renderer.tsx (new, 145 lines)
- src/components/elements/renderers/displays/meters/PPMType2Renderer.tsx (new, 145 lines)

**Export Configuration:**
- src/components/elements/renderers/displays/meters/index.ts (+4 lines)
- src/components/elements/renderers/displays/index.ts (+11 lines)
- src/components/elements/renderers/index.ts (+24 lines)

## Integration Points

**Depends on (from Plan 23-01):**
- SegmentedMeter component (CSS Grid, color zones, peak hold)
- MeterScale component (SVG tick marks, dB labels)
- PeakHoldIndicator component (line/bar overlay)
- meterUtils.ts (dbToNormalized, calculateLitSegments, getSegmentColor)

**Enables (for Plans 23-03, 23-04):**
- Peak Program Meters (Plan 23-03)
- K-System and LUFS meters (Plan 23-04)
- Shared stereo layout pattern
- Standards-compliant dB range handling

## Next Phase Readiness

**Ready for Plan 23-03 (Peak Meters):**
- Stereo meter layout pattern established
- BaseProfessionalMeterConfig reusable for True Peak and Sample Peak
- SegmentedMeter handles any dB range

**Ready for Plan 23-04 (K-System and LUFS):**
- K-12, K-14, K-20 can extend BaseProfessionalMeterConfig
- LUFS meters can use different ballistics types
- Factory function pattern consistent

**Considerations:**
- Plan 23-03 may need clip indicators (above 0 dBFS)
- Plan 23-04 may need different color zone presets for K-System
- All meters share peak hold and scale rendering

## Performance Considerations

- Renderer components use SegmentedMeter (CSS Grid, efficient)
- No runtime dB calculations (normalized values pre-calculated)
- Stereo renderers create 2 SegmentedMeter instances (acceptable)
- SVG scale rendered once (no per-segment overhead)

## Commits

1. `485f235`: feat(23-02): add RMS and VU meter element type definitions
2. `5d80cc6`: feat(23-02): add PPM Type I and II meter element type definitions
3. `f489729`: feat(23-02): create renderers and register in registry

**Total:** 3 atomic commits, 1020+ lines added

---

**Plan Status:** Complete ✓
**Duration:** 4 minutes
**Outcome:** 8 professional meter types with standards-compliant dB ranges and ballistics, ready for palette and export integration
