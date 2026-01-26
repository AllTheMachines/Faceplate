# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.
**Current focus:** v1.2 Complete Element Taxonomy - Phases 19-30

## Current Position

Phase: 25 - Real-Time Visualizations
Plan: 2 of 4 complete
Status: In progress
Last activity: 2026-01-26 - Completed 25-02-PLAN.md (Visualization Renderers)

Progress: [██████████] 120/122 plans complete (98.4%)

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 62
- Average duration: ~25 min
- Total execution time: ~25 hours
- Milestone duration: 3 days (2026-01-23 -> 2026-01-25)

**Velocity (v1.1):**
- Total plans completed: 26
- Average duration: ~6 min
- Total execution time: ~3 hours
- Milestone duration: 2 days (2026-01-25 -> 2026-01-26)

**Combined (v1.0 + v1.1):**
- Total phases: 18
- Total plans: 88
- Total requirements validated: 38+ (v1.0) + 38 (v1.1)

**v1.2 scope:**
- Total phases: 12 (Phases 19-30)
- Total requirements: 78 (5 arch + 2 UX + 3 rot + 5 lin + 7 btn + 8 disp + 6 led + 13 mtr + 8 nav + 10 viz + 3 cont + 12 spec)
- Completed: 32 plans (Phase 19: 6, Phase 20: 4, Phase 21: 4, Phase 22: 4, Phase 23: 6, Phase 24: 6, Phase 25: 2)

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
All v1.1 decisions documented and outcomes verified.

**Phase 21 decisions:**

| Decision | Phase | Rationale | Outcome |
|----------|-------|-----------|---------|
| Icons as inline SVG strings | 21-01 | Compact storage, no external dependencies, currentColor support | 35 icons in enum map |
| transition: none on all buttons | 21-01 | Audio plugin UIs need instant visual feedback | Immediate state changes |
| Rocker position mapping 0=down, 1=center, 2=up | 21-02 | Intuitive mapping matching physical rocker switch behavior | Clear position semantics |
| Rotary label layout threshold at 6 positions | 21-02 | Radial labels become crowded with many positions | radial for 2-6, legend for 7-12 |
| Unicode symbols as icon fallback | 21-02 | Enables rendering before builtInIconSVG utility available | Graceful degradation |
| Icons grouped by category in dropdowns | 21-03 | Easier navigation with 35 icons | Transport, Common, Audio, Additional groups |
| Dynamic segment configuration | 21-03 | Flexible per-segment icon/text settings | useCallback for immutable updates |
| Inline SVG in exports | 21-04 | Eliminates external dependencies, works offline | HTML has embedded SVG content |

**Phase 22 decisions:**

| Decision | Phase | Rationale | Outcome |
|----------|-------|-----------|---------|
| Simple MIDI-to-note conversion | 22-01 | Avoids external dependencies, straightforward calculation | C4 = MIDI 60 standard, full 0-127 range |
| Negative values display in red | 22-01 | Visual feedback following CONTEXT.md guidance | Improves usability for dB, offsets, bidirectional values |
| Multi-Value Display limited to 4 values | 22-01 | Prevents overcrowding, maintains readability | slice(0, 4) in renderer |
| EditableDisplay uses local state | 22-01 | Keeps editing ephemeral until validated | Double-click to edit, validation on commit |
| LED off states at 30% brightness | 22-02 | User can see what color LED will be when lit | Improved design preview UX |
| Bi-color LED always lit | 22-02 | No off state - switches between green/red only | Matches physical bi-color LED behavior |
| SVG dashed stroke for LED Ring | 22-02 | Discrete segments vs continuous arc | Authentic LED ring appearance |
| CSS Grid for LED Matrix | 22-02 | Precise positioning with gap property | Clean 2D layout |
| Instant transitions on LEDs | 22-02 | Audio plugin UIs need immediate visual feedback | Consistent with Phase 21 standard |
| LED Ring fixed 2px gap | 22-04 | No spacing property in config | Consistent discrete segment appearance |
| EditableDisplay db format handling | 22-04 | Format outside formatDisplayValue type | Separate formatting for type safety |
| DSEG7 font conditional loading | 22-04 | Only load when 7-segment used | Avoids unnecessary font loading |
| Ghost segments only for 7-segment | 22-03 | Notes don't typically use 7-segment displays | Cleaner UI, contextual property display |
| MultiValueDisplay max 4 values | 22-03 | Prevents overcrowding, maintains readability | User-facing limit enforced in UI |
| LEDMatrix preset system | 22-03 | Common sizes readily accessible | 4×4, 8×8, 16×8, 16×16 presets + custom |

**Phase 23 decisions:**

| Decision | Phase | Rationale | Outcome |
|----------|-------|-----------|---------|
| Default color zones (green/yellow/red) | 23-01 | Industry standard for audio meters | Green < -18dB, yellow -18 to -6dB, red >= -6dB |
| 30% off-segment opacity | 23-01 | Consistent with Phase 22 LED standard | Shows segment color when off |
| CSS Grid for segments | 23-01 | Clean 1px gaps using gap property | Precise layout control |
| SVG for scale marks | 23-01 | Vector rendering for crisp ticks | Major 8px/2px, minor 4px/1px |
| RMS dB range (-60 to 0 dB) | 23-02 | Industry standard RMS range with 1 dB/segment | 60 segments for precise measurement |
| VU dB range (-20 to +3 dB) | 23-02 | ANSI C16.5-1942 compliance | Green to 0 VU, red above |
| PPM dB range (-50 to +5 dB) | 23-02 | IEC 60268-10 standard for Type I (DIN) and Type II (BBC) | 55 segments, distinct ballistics |
| Stereo channel gap (8px) | 23-02 | Visual separation without excessive width | Consistent with LED arrays |
| Channel labels at bottom | 23-02 | Clear L/R identification outside meter body | Optional, 10px font, #999 color |
| LUFS meters use -60 to 0 LUFS range | 23-03 | Same range as True Peak for consistency | All LUFS variants use 60 segments |
| LUFS unit property | 23-03 | Distinguishes LUFS meters from dB meters | Display logic can show "LUFS" suffix |
| LUFS ballistics naming | 23-03 | Clear distinction between window types | LUFS_M (400ms), LUFS_S (3s), LUFS_I (full) |
| K-System ranges | 23-04 | Bob Katz calibrated monitoring standards | K-12: -32 to +12 dB, K-14: -34 to +14 dB, K-20: -40 to +20 dB |
| K-System color zones | 23-04 | Simplified from full K-System spec | Green below 0 dB, red above K headroom |
| Correlation Meter horizontal bar | 23-04 | CONTEXT.md spec for analysis meters | Center marker at 0, red/yellow/green zones |
| Stereo Width Meter horizontal bar | 23-04 | CONTEXT.md spec for analysis meters | Center marker at 100%, fill bar from left |
| SharedMeterProperties pattern | 23-05 | Reusable component for common meter controls | Handles 22 of 24 meter types consistently |
| Custom panels for analysis meters | 23-05 | Different control requirements | Correlation and Stereo Width use simplified panels |
| Palette organized by subcategories | 23-05 | Improved UX with 24+ meter types | Level/LUFS/K-System/Analysis grouping |
| CSS Grid for meter export | 23-06 | 1px gaps using gap property | Clean segmented layout in exported CSS |
| Data attributes for JUCE binding | 23-06 | JUCE plugin needs to query/update segments | data-segment, data-peak-hold, data-channel, data-indicator attributes |
| Helper functions for meter categories | 23-06 | DRY code for 24 meter types | generateSegmentedMeterCSS/HTML and generateHorizontalBarMeterCSS/HTML |
| Stereo wrapper 8px gap | 23-06 | Consistent with Phase 23-02 decision | Flexbox wrapper with gap: 8px |

**Phase 24 decisions:**

| Decision | Phase | Rationale | Outcome |
|----------|-------|-----------|---------|
| Stepper orientation support | 24-01 | Vertical steppers needed for compact UIs | orientation property (horizontal/vertical) with flex-direction |
| Breadcrumb truncation with ellipsis | 24-01 | Long paths need graceful overflow handling | maxVisibleItems shows first + last items with ellipsis |
| Instant transitions on navigation | 24-01 | Navigation needs immediate visual feedback | transition:none on all state changes |
| Multi-select checkbox UI | 24-02 | Multi-select dropdown needs visual indication | Checkboxes in dropdown items, comma-separated text when closed with ellipsis |
| ComboBox empty state | 24-02 | Combo box can filter to zero results | "No matching options" in italic gray when filteredOptions.length === 0 |
| Dropdown fade timing | 24-02 | CONTEXT.md specified 100-150ms range | 100ms ease-out for open, 150ms ease-in for close |
| TabBar indicator styles | 24-03 | Three visual patterns for different design needs | background, underline, accent-bar indicator styles |
| Per-tab configuration | 24-03 | Each tab independently controls icon/text display | TabConfig with showIcon and showLabel booleans |
| data-active-tab attribute | 24-03 | JUCE integration without JavaScript callbacks | C++ polls getAttribute('data-active-tab') |
| TagSelector chip UI | 24-03 | Standard pattern for tag selection | Chips with X button removal, familiar to users |
| Tree interaction pattern | 24-04 | Arrow click expands/collapses, row click selects | Per CONTEXT.md - matches standard file browser UX, prevents accidental expand/collapse |
| TreeNode recursive structure | 24-04 | Natural representation of hierarchical data | Compatible with react-arborist, supports unlimited nesting |
| Designer interaction restrictions | 24-04 | disableEdit and disableDrag always true in designer mode | Tree structure is designer-defined but JUCE can modify at runtime |
| Array item min requirements | 24-05 | Breadcrumb and Menu need minimum items | Breadcrumb min 1 item, Menu min 1 item, others allow 0 |
| Tag availability management | 24-05 | TagSelector needs available vs selected distinction | Available tags list with selection toggle in property panel |
| Tree recursive editor | 24-05 | Visual tree editing with nested structure | TreeView property panel with expandable nested editor, add child at any level |
| Tab icon picker | 24-05 | Per-tab icon configuration needed | Per-tab icon dropdown from built-in icon set, consistent with SegmentButton |
| Instant transitions on navigation exports | 24-06 | Navigation requires immediate visual feedback | All navigation elements use transition: none in exported CSS |
| Dropdown fade timing in exports | 24-06 | CONTEXT.md specified 100-150ms range | 100ms ease-out for open, 150ms ease-in for close in exported CSS |
| JUCE data attributes for navigation | 24-06 | C++ needs to query and update navigation state without JavaScript | Stepper: data-value/min/max/step, Tab Bar: data-active-tab, Tree View: data-selected-id/node-id |
| ARIA attributes in exports | 24-06 | Exported HTML should be accessible | All navigation elements include role, aria-selected, aria-haspopup as appropriate |

**Phase 25 decisions:**

| Decision | Phase | Rationale | Outcome |
|----------|-------|-----------|---------|
| Static mock data | 25-01 | Designer shows frozen snapshots per CONTEXT.md | No animation loops, static rendering only |
| Pink noise spectrum | 25-01 | Realistic audio-like frequency distribution | -3dB/octave slope with ±10% variation |
| HiDPI Canvas scaling | 25-01 | Prevent blur on retina displays | canvas.width/height *= dpr, ctx.scale(dpr, dpr) |
| useLayoutEffect for Canvas | 25-01 | Prevent rAF timing issues per RESEARCH.md | Memory leak prevention, synchronous setup |
| Mono signal for stereo displays | 25-01 | Show perfect L/R correlation per CONTEXT.md | Centered vertical line in goniometer/vectorscope |

### Pending Todos

None - Phase 25 Plan 01 complete

### Blockers/Concerns

**Pre-existing build errors:** TypeScript errors in SVG utilities and dialog components from v1.1 code. Not blocking Phase 21 functionality.

**Phase 21 Complete:**
- Plan 21-01: Button types (Icon Button, Kick Button, Toggle Switch, Power Button) - COMPLETE
- Plan 21-02: Switch types (Rocker Switch, Rotary Switch, Segment Button) - COMPLETE
- Plan 21-03: Property panels and palette entries - COMPLETE
- Plan 21-04: Export support (HTML and CSS generation) - COMPLETE
- 7 button/switch element types fully integrated end-to-end
- Built-in icon system with 35 audio plugin icons
- Export support with inline SVG and state-based CSS

**Phase 22 Complete:**
- Plan 22-01: Value Display types (Numeric, Time, Percentage, Ratio, Note, BPM, Editable, Multi-Value) - COMPLETE
- Plan 22-02: LED Indicator types (Single, Bi-Color, Tri-Color, Array, Ring, Matrix) - COMPLETE
- Plan 22-03: Property panels and palette entries - COMPLETE
- Plan 22-04: Export support (HTML and CSS generation) - COMPLETE
- 8 value display types with formatDisplayValue utility (6 format types)
- EditableDisplay with double-click editing and validation
- Multi-Value Display with up to 4 stacked values
- 6 LED indicator types with instant transitions and glow effects
- LED color palette system (classic, modern, neon)
- SVG dashed stroke for LED Ring, CSS Grid for LED Matrix
- Export support with DSEG7 font, bezel styles, ghost segments

**Phase 23 Complete:**
- Plan 23-01: Meter infrastructure (utilities, SegmentedMeter, PeakHoldIndicator, MeterScale) - COMPLETE
- Plan 23-02: RMS, VU, and PPM meters (8 types) - COMPLETE
- Plan 23-03: True Peak and LUFS meters (8 types) - COMPLETE
- Plan 23-04: K-System and analysis meters (8 types) - COMPLETE
- Plan 23-05: Property panels and palette entries - COMPLETE
- Plan 23-06: Export support (CSS and HTML generation) - COMPLETE
- **Total:** 24 professional meter types across 6 plans, fully integrated end-to-end
- Meter infrastructure: dB mapping, segmented rendering, peak hold, SVG scales
- Standards compliance: Bob Katz K-System, ITU-R BS.1770-5 LUFS, IEC 60268-10 PPM, ANSI C16.5-1942 VU
- Analysis meters: Correlation (-1 to +1), Stereo Width (0-200%) with horizontal bars
- All types registered in rendererRegistry with proper TypeScript types
- Export support: CSS Grid layout, color zones, data attributes for JUCE binding

**Phase 24 Complete:**
- Plan 24-01: Stepper & Breadcrumb (basic navigation elements) - COMPLETE
- Plan 24-02: Multi-Select Dropdown, Combo Box, Menu Button (dropdown navigation) - COMPLETE
- Plan 24-03: Tab Bar & Tag Selector (selection and navigation UI patterns) - COMPLETE
- Plan 24-04: Tree View (hierarchical navigation) - COMPLETE
- Plan 24-05: Property Panels & Palette (navigation element configuration UIs) - COMPLETE
- Plan 24-06: Export Support (CSS and HTML generation for navigation elements) - COMPLETE
- **Total:** 8 navigation element types across 6 plans, fully integrated end-to-end
- Dropdown patterns: click-outside handling, 100-150ms CSS fade, keyboard navigation (ArrowUp/Down/Enter/Escape)
- Multi-Select: checkboxes, maxSelections limit, comma-separated closed state
- ComboBox: text filtering, "No matching options" empty state
- MenuButton: dividers, disabled items, context menu
- Tab Bar: data-active-tab JUCE integration, arrow key navigation, three indicator styles
- Tag Selector: chip removal, dropdown filtering, click-outside handling
- Tree View: arrow-only expand/collapse, row selection, nested structure
- Per-component configuration patterns (showIcon/showLabel, disabled/divider)
- Data attributes for JUCE parameter binding
- Export support: CSS Grid for dropdowns, fade animations, ARIA attributes for accessibility

**Phase 25 In Progress:**
- Plan 25-01: Visualization Foundation (types, mock data, Canvas hook) - COMPLETE
- Plan 25-02: Visualization Renderers (ScrollingWaveform, SpectrumAnalyzer) - COMPLETE
- TypeScript types for 5 Canvas visualizations (ScrollingWaveform, SpectrumAnalyzer, Spectrogram, Goniometer, Vectorscope)
- Mock audio data utilities: pink noise spectrum, static waveform, spectrogram frame, mono signal
- Canvas setup hook with HiDPI scaling using useLayoutEffect
- ScrollingWaveformRenderer with line/fill modes, grid overlay
- SpectrumAnalyzerRenderer with pink noise spectrum, color gradients, frequency/dB labels
- Both renderers registered in rendererRegistry for O(1) lookup
- Static mock data per CONTEXT.md (no animation loops)

## Session Continuity

Last session: 2026-01-26
Stopped at: Completed 25-02-PLAN.md (Visualization Renderers)
Resume file: None

**Next step:** Plan 25-03 (Remaining Visualizations: Spectrogram, Goniometer, Vectorscope)

---
*State initialized: 2026-01-25*
*Last updated: 2026-01-26 after 25-02-PLAN.md complete*
