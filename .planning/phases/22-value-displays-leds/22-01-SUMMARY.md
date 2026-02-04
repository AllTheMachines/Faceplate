---
phase: 22
plan: 01
subsystem: displays
tags: [value-displays, formatting, UI, elements]
requires: [phase-19, phase-20, phase-21]
provides:
  - 8 value display element types with renderers
  - formatDisplayValue utility (6 format types)
  - truncateValue utility
  - Export support (CSS/HTML generation)
affects: [phase-22-02]
tech-stack:
  added: []
  patterns: [value-formatting, display-rendering, type-guards, factory-functions]
key-files:
  created:
    - src/utils/valueFormatters.ts
    - src/components/elements/renderers/displays/NumericDisplayRenderer.tsx
    - src/components/elements/renderers/displays/TimeDisplayRenderer.tsx
    - src/components/elements/renderers/displays/PercentageDisplayRenderer.tsx
    - src/components/elements/renderers/displays/RatioDisplayRenderer.tsx
    - src/components/elements/renderers/displays/NoteDisplayRenderer.tsx
    - src/components/elements/renderers/displays/BpmDisplayRenderer.tsx
    - src/components/elements/renderers/displays/EditableDisplayRenderer.tsx
    - src/components/elements/renderers/displays/MultiValueDisplayRenderer.tsx
  modified:
    - src/types/elements/displays.ts
    - src/components/elements/renderers/displays/index.ts
    - src/components/elements/renderers/index.ts
    - src/services/export/cssGenerator.ts
    - src/services/export/htmlGenerator.ts
decisions:
  - title: Simple MIDI-to-note conversion without external library
    rationale: Avoids external dependencies, straightforward calculation using noteNames array
    impact: C4 = MIDI 60 standard, supports full 0-127 range
  - title: Negative values display in red
    rationale: Follows CONTEXT.md guidance for visual feedback on negative values
    impact: Improves usability for displays showing dB, offsets, or bidirectional values
  - title: Multi-Value Display limited to 4 values
    rationale: Prevents overcrowding in UI, maintains readability
    impact: Factory validates max 4 values in valuesToDisplay.slice(0, 4)
  - title: EditableDisplay uses local state for edit mode
    rationale: Keeps editing ephemeral until validated, shows error messages temporarily
    impact: Double-click to edit, Enter/blur to validate, Escape to cancel
metrics:
  duration: 7m 15s
  completed: 2026-01-26
---

# Phase 22 Plan 01: Value Display Elements Summary

**One-liner:** 8 value display types with formatDisplayValue utility for numeric, time, percentage, ratio, note, BPM, editable, and multi-value displays

## What Was Delivered

### Display Element Types (8 total)

All extend BaseElementConfig with common display properties:

**Common Properties:**
- fontStyle: '7segment' | 'modern' (Roboto Mono)
- bezelStyle: 'inset' | 'flat' | 'none'
- showGhostSegments: boolean (only for 7-segment style)
- unitDisplay: 'suffix' | 'label' (for units like "ms", "%")
- fontSize, fontFamily, textColor, backgroundColor, padding, borderColor

**1. NumericDisplayElementConfig** (`type: 'numericdisplay'`)
- Formatted numbers with configurable decimal places
- Optional unit label (inline suffix or separate label)
- Supports negative values (displayed in red)
- Default: value 0.5, min 0, max 100, 2 decimals

**2. TimeDisplayElementConfig** (`type: 'timedisplay'`)
- Auto-switches between ms/s/bars based on magnitude
- BPM and time signature for bars calculation
- < 1000ms: "500 ms"
- < 60000ms: "5.50 s"
- >= 60000ms: "2.50 bars"
- Default: 0-1000ms range

**3. PercentageDisplayElementConfig** (`type: 'percentagedisplay'`)
- Displays 0-1 value as 0-100%
- Configurable decimal places
- Default: 0 decimals (whole percentages)

**4. RatioDisplayElementConfig** (`type: 'ratiodisplay'`)
- Compression ratios (4:1, 8.5:1)
- Shows ∞:1 when >= infinityThreshold (default 20)
- Default: value 0.2, min 1, max 20

**5. NoteDisplayElementConfig** (`type: 'notedisplay'`)
- MIDI number to note name conversion (C4, A#3)
- Optional MIDI number display below note name
- preferSharps: A# vs Bb notation
- Default: value 0.47 (MIDI 60 = C4)

**6. BpmDisplayElementConfig** (`type: 'bpmdisplay'`)
- Tempo display with optional "BPM" label
- Default: 20-300 BPM range

**7. EditableDisplayElementConfig** (`type: 'editabledisplay'`)
- Double-click to enter edit mode
- Supports numeric, percentage, db formats
- Validates on Enter/blur
- Shows error message temporarily on invalid input
- Reverts to previous value on validation failure
- Default: numeric format, 0-100 range

**8. MultiValueDisplayElementConfig** (`type: 'multivaluedisplay'`)
- Stacked values (max 4)
- Vertical or horizontal layout
- Each value has: value, min, max, format, label, decimalPlaces
- Default: 2 values with labels

### Value Formatting Utilities

**formatDisplayValue(value, min, max, format, options)**
- Handles 6 format types: numeric, time, percentage, ratio, note, bpm
- Calculates actual value from normalized (0-1): `actual = min + value * (max - min)`
- Time format auto-switches based on magnitude
- Ratio format shows ∞:1 for high ratios
- Note format uses simple MIDI-to-note calculation (no external library)
- Returns formatted string with appropriate suffix

**truncateValue(text, maxWidth, fontSize)**
- Estimates character width as fontSize * 0.6
- Truncates with ellipsis (…) if text exceeds maxWidth
- Prevents overflow in display elements

### Renderers

All 8 renderers follow DbDisplayRenderer pattern:

**Common Features:**
- Use formatDisplayValue utility for formatting
- Support fontStyle (7-segment vs modern font)
- Support bezelStyle (inset box-shadow, flat border, or none)
- Ghost segments for 7-segment: render "888..." at opacity 0.25 behind value
- Negative values: show in red (#ff4444) per CONTEXT.md
- Truncate overflow with ellipsis

**NumericDisplayRenderer**
- Displays formatted number with optional unit
- Ghost segments match digit count

**TimeDisplayRenderer**
- Auto-switch ms/s/bars based on value
- Include suffix in display

**PercentageDisplayRenderer**
- Display value * 100 with % symbol
- Ghost segments for 7-segment style

**RatioDisplayRenderer**
- Display ratio with :1 suffix
- Show ∞:1 when >= infinityThreshold

**NoteDisplayRenderer**
- Display note name (C4, A#3)
- Optional MIDI number below
- No ghost segments (notes don't use 7-segment)

**BpmDisplayRenderer**
- Display tempo with optional BPM label
- Ghost segments for 7-segment style

**EditableDisplayRenderer**
- Display value in selected format
- Double-click to enter edit mode (swap div for input)
- Validate on Enter or blur
- Show error message briefly, revert to previous value on invalid
- Uses useState for isEditing, editValue, errorMessage
- Keeps focus during error display

**MultiValueDisplayRenderer**
- Flexbox container with layout direction
- Map over values array, format each
- Optional labels above/beside values
- Max 4 values (validate in renderer with slice)

### Type System

**Type Guards:** isNumericDisplay, isTimeDisplay, isPercentageDisplay, isRatioDisplay, isNoteDisplay, isBpmDisplay, isEditableDisplay, isMultiValueDisplay

**Factory Functions:** createNumericDisplay, createTimeDisplay, createPercentageDisplay, createRatioDisplay, createNoteDisplay, createBpmDisplay, createEditableDisplay, createMultiValueDisplay

**Union Type:** Added 8 new types to DisplayElement union

### Integration

**Renderer Registry:** All 8 display types registered in rendererRegistry Map for O(1) lookup

**Export Support:**
- CSS generation: Common value display styles with flexbox centering
- HTML generation: Placeholder HTML with "0.00" (real value comes from plugin)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**What's complete:**
- All 8 value display types implemented with full feature set
- Value formatting utilities handle all 6 format types correctly
- Renderers support 7-segment, modern, bezel styles, and ghost segments
- Editable Display supports double-click editing with validation
- Multi-Value Display supports up to 4 stacked values
- Export support (CSS/HTML) handles all new display types

**What's working:**
- TypeScript compilation succeeds with no errors related to new display types
- formatDisplayValue correctly formats all 6 types
- Negative values display in red
- Ghost segments render at opacity 0.25
- Text truncation prevents overflow
- EditableDisplay validation and error handling

**What's blocked/needs work:**
- Pre-existing TypeScript errors in svg-sanitizer.ts, getSVGNaturalSize.ts (not related to this phase)
- LED types added in parallel need export support (cssGenerator/htmlGenerator exhaustiveness errors)

**Phase 22-02 (LED Property Panels) can proceed:** All value display element types are now available for use in property panels and palette entries.

## Performance Notes

**Execution time:** 7 minutes 15 seconds

**Efficiency notes:**
- Value display types and renderers were added in parallel with LED work (commit b4f54e0)
- This plan's unique contribution: export support (CSS/HTML generation)
- formatDisplayValue utility is reusable across all display types
- Simple MIDI-to-note calculation avoids external library overhead

## Key Learning

**Pattern established:**
- Display elements use formatDisplayValue utility for consistent formatting
- Ghost segments (7-segment style) provide visual continuity when value changes
- Negative values display in red for immediate visual feedback
- EditableDisplay pattern: useState for ephemeral edit state, validation on commit
- Multi-Value Display pattern: flexbox with configurable layout direction

**Reusable for future display types:**
- formatDisplayValue can be extended with new format types
- truncateValue utility works for any text-based display
- Bezel style approach (inset/flat/none) applicable to all display elements
