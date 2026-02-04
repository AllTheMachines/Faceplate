---
phase: 23-professional-meters
plan: 06
subsystem: export
tags: [css, html, juce, meters, export, professional-audio]

# Dependency graph
requires:
  - phase: 23-02
    provides: RMS, VU, PPM meter types defined
  - phase: 23-03
    provides: True Peak, LUFS meter types defined
  - phase: 23-04
    provides: K-System and analysis meter types defined
provides:
  - CSS generation for all 24 professional meter types
  - HTML generation for all 24 professional meter types
  - Data attributes for JUCE binding
  - Segmented meter CSS Grid layout
  - Horizontal bar meter CSS layout
affects: [export-validation, juce-integration, meter-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS Grid for segmented meters with 1px gaps
    - CSS variables for color zones
    - Data attributes for JUCE binding
    - Helper functions for meter type categories

key-files:
  created: []
  modified:
    - src/services/export/cssGenerator.ts
    - src/services/export/htmlGenerator.ts

key-decisions:
  - "CSS Grid with gap property for 1px segment gaps"
  - "Data attributes for JUCE binding (data-segment, data-peak-hold, data-channel, data-indicator)"
  - "Helper functions for segmented vs horizontal bar meters"
  - "Stereo wrapper with 8px gap between channels"

patterns-established:
  - "Segmented meters use CSS Grid with repeat() for consistent spacing"
  - "Color zones exported as CSS variables (--meter-zone-N)"
  - "Segment opacity: 0.3 off, 1.0 on (consistent with Phase 22 LED standard)"
  - "Analysis meters use horizontal bar layout with center marker"

# Metrics
duration: 3min
completed: 2026-01-26
---

# Phase 23 Plan 06: Export Support for Professional Meters

**CSS and HTML generation for all 24 professional meter types with segmented layout, color zones, and JUCE data attributes**

## Performance

- **Duration:** 3 min 7 sec
- **Started:** 2026-01-26T18:27:05Z
- **Completed:** 2026-01-26T18:30:12Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- CSS generation for 22 segmented level meters (RMS, VU, PPM, True Peak, LUFS, K-System)
- CSS generation for 2 horizontal bar analysis meters (Correlation, Stereo Width)
- HTML generation for all 24 meter types with JUCE binding data attributes
- Stereo meter support with L/R channel wrappers and labels
- Peak hold indicator HTML and CSS when enabled
- Scale marks included when scalePosition is not 'none'

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CSS generation for level meters** - `3a7998a` (feat)
2. **Task 2: Add CSS generation for analysis meters** - `3d7560d` (feat)
3. **Task 3: Add HTML generation for all meter types** - `dfc7fad` (feat)

## Files Created/Modified
- `src/services/export/cssGenerator.ts` - Added generateSegmentedMeterCSS and generateHorizontalBarMeterCSS helpers, switch cases for all 24 meter types
- `src/services/export/htmlGenerator.ts` - Added generateSegmentedMeterHTML and generateHorizontalBarMeterHTML helpers, switch cases for all 24 meter types

## Decisions Made

**1. CSS Grid for segmented meters**
- Rationale: CSS Grid with gap property provides precise 1px gaps without manual margin calculations
- Implementation: `grid-template-rows/columns: repeat(segmentCount, 1fr); gap: 1px;`
- Outcome: Clean segmented layout matching Phase 23 CONTEXT.md spec

**2. Data attributes for JUCE binding**
- Rationale: JUCE plugin needs to query and update meter segments dynamically
- Attributes: `data-segment`, `data-peak-hold`, `data-channel`, `data-indicator`, `data-readout`
- Outcome: Exported HTML ready for JUCE integration without manual modifications

**3. Helper functions for meter categories**
- Rationale: 22 level meters share identical CSS/HTML structure, 2 analysis meters share different structure
- Functions: `generateSegmentedMeterCSS/HTML` and `generateHorizontalBarMeterCSS/HTML`
- Outcome: DRY code, easy to maintain

**4. Stereo wrapper with 8px gap**
- Rationale: Consistent with Phase 23-02 stereo meter decision (8px channel separation)
- Implementation: Flexbox wrapper with `gap: 8px;`
- Outcome: Visual separation without excessive width

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all meter types exported successfully on first attempt.

## Next Phase Readiness

- All 24 professional meter types have complete export support
- Exported CSS includes meter segment styles with 1px gaps
- Exported CSS includes color zone variables
- Exported HTML renders meter structure with data attributes
- Scale marks export as SVG with tick positions
- Analysis meters (Correlation, Stereo Width) export with horizontal bar CSS
- Ready for Phase 24 (if defined) or JUCE integration testing

**Success criteria validation:**
- ✅ CSS generator handles all 24 meter types
- ✅ Segmented meters export with CSS Grid layout, 1px gaps, and color zone variables
- ✅ Analysis meters export with horizontal bar CSS
- ✅ HTML generator produces structure with data attributes for JUCE binding
- ✅ Stereo meters include L/R channel wrappers
- ✅ Scale marks included when scalePosition is not 'none'
- ✅ Peak hold indicator HTML included when showPeakHold is true

---
*Phase: 23-professional-meters*
*Completed: 2026-01-26*
