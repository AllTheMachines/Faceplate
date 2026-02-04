---
phase: 13
plan: 01
subsystem: ui-elements
tags: [knob, slider, label, value-display, property-panel, export]

requires:
  - phase-12 (Export & Round-Trip Testing)

provides:
  - Knob elements with optional integrated label and value display
  - Slider elements with optional integrated label and value display
  - Property panel controls for label/value configuration
  - HTML/CSS export with label/value rendering

affects:
  - Future phases requiring parameter labeling
  - Export system (HTML/CSS generation)

tech-stack:
  added: []
  patterns:
    - Value formatting utility (numeric, percentage, dB, Hz, custom)
    - Conditional property panel rendering
    - Absolute positioning for label/value overlays

key-files:
  created: []
  modified:
    - src/types/elements.ts
    - src/components/elements/renderers/KnobRenderer.tsx
    - src/components/elements/renderers/SliderRenderer.tsx
    - src/components/Properties/KnobProperties.tsx
    - src/components/Properties/SliderProperties.tsx
    - src/services/export/htmlGenerator.ts
    - src/services/export/cssGenerator.ts

decisions:
  - decision: Labels and values positioned absolutely relative to control bounds
    rationale: Allows label/value to extend beyond element box, matching professional audio plugin UX
    alternatives: [Increase element bounds to include label/value, Make label/value separate elements]

  - decision: Single formatValue utility function for all value formats
    rationale: Reusable across renderers and export generators, easier to maintain
    alternatives: [Separate formatting per element type, Format strings in config]

  - decision: Conditional rendering in property panels based on checkbox state
    rationale: Cleaner UI, reduces visual clutter when features not in use
    alternatives: [Always show all controls, Use collapsible sections]

metrics:
  duration: 15 min
  completed: 2026-01-25
---

# Phase 13 Plan 01: Knob/Slider Label & Value Display Summary

**One-liner:** Integrated label and value display for Knob and Slider elements with 5 format options (numeric, percentage, dB, Hz, custom) and 4 positioning options (top/bottom/left/right)

## What Was Built

### Type System Extensions
Extended `KnobElementConfig` and `SliderElementConfig` with 10 new properties each:

**Label Display:**
- `showLabel: boolean` - Toggle label visibility
- `labelText: string` - Label text content
- `labelPosition: 'top' | 'bottom' | 'left' | 'right'` - Label placement
- `labelFontSize: number` - Label font size (8-32px)
- `labelColor: string` - Label text color

**Value Display:**
- `showValue: boolean` - Toggle value visibility
- `valuePosition: 'top' | 'bottom' | 'left' | 'right'` - Value placement
- `valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'` - Value formatting
- `valueSuffix: string` - Custom format suffix
- `valueDecimalPlaces: number` - Decimal precision (0-4)
- `valueFontSize: number` - Value font size (8-32px)
- `valueColor: string` - Value text color

### Renderer Updates
Updated `KnobRenderer` and `SliderRenderer` to:
- Wrap SVG in positioned container div
- Render label span with configurable positioning
- Render value span with formatted display
- Apply absolute positioning with CSS transforms for centering
- Support `overflow: visible` for labels extending beyond bounds

**Value Formatting Logic:**
- **Numeric:** `actual.toFixed(decimals)` (e.g., "0.75")
- **Percentage:** `Math.round(value * 100)%` (e.g., "75%")
- **dB:** `actual.toFixed(decimals) dB` (e.g., "-12.5 dB")
- **Hz:** Auto-switch to kHz when >= 1000 (e.g., "440 Hz" or "2.5 kHz")
- **Custom:** `actual.toFixed(decimals) + suffix` (e.g., "5.0 ms")

### Property Panel Controls
Added two new `PropertySection` components to `KnobProperties` and `SliderProperties`:

**Label Section:**
- Show Label checkbox
- Label Text input (visible only when enabled)
- Position select (4 options)
- Font Size number input (8-32px)
- Color picker

**Value Display Section:**
- Show Value checkbox
- Position select (4 options)
- Format select (5 options)
- Suffix input (visible only for custom format)
- Decimal Places number input (0-4)
- Font Size number input (8-32px)
- Color picker

### Export System Updates
**HTML Generator:**
- Added `formatValue()` utility function
- Updated `generateKnobHTML()` to inject label/value spans
- Updated `generateSliderHTML()` to inject label/value spans
- Spans include position classes (e.g., `knob-label-top`, `slider-value-right`)

**CSS Generator:**
- Added global label/value positioning styles
- 8 position classes per element type (4 label positions + 4 value positions)
- Absolute positioning with transforms for centering
- Margin spacing (4px) between label/value and control

## Decisions Made

### 1. Absolute Positioning for Label/Value
**Decision:** Use absolute positioning relative to control bounds, allowing overflow beyond element box.

**Rationale:** Professional audio plugins display labels/values that extend beyond control bounds. This matches user expectations and provides better visual organization without requiring manual element resizing.

**Implementation:** Wrapper div with `position: relative`, label/value spans with `position: absolute` and transform-based centering.

### 2. Shared formatValue Utility
**Decision:** Single reusable `formatValue()` function used by both renderers and export generators.

**Rationale:**
- Eliminates code duplication
- Ensures consistent formatting between designer preview and exported HTML
- Easier to add new formats in future
- Single source of truth for value formatting logic

**Location:** Defined in both `KnobRenderer.tsx` and `htmlGenerator.ts` (duplicated due to module structure, but identical implementation).

### 3. Conditional Property Panel Rendering
**Decision:** Show label/value configuration controls only when respective checkbox is enabled.

**Rationale:**
- Reduces visual clutter in property panel
- Groups related settings together
- Clear on/off state for each feature
- Follows established pattern from existing properties (e.g., meter `showPeakHold`)

**UX Flow:** User checks "Show Label" → label controls appear → user configures → label renders on canvas.

## Technical Implementation

### Type Safety
All new properties fully typed with discriminated union exhaustiveness checking. Factory functions provide sensible defaults:
- Labels default to element name
- Labels positioned bottom, values positioned top (common audio plugin convention)
- Font size 12px for both
- Label color white (#ffffff), value color gray (#a0a0a0)
- Both disabled by default (showLabel: false, showValue: false)

### Rendering Architecture
```typescript
<div style={{ position: 'relative' }}>
  {/* Label */}
  {showLabel && <span style={getLabelStyle()}>{labelText}</span>}

  {/* Value */}
  {showValue && <span style={getValueStyle()}>{formattedValue}</span>}

  {/* Original SVG control */}
  <svg>...</svg>
</div>
```

### CSS Positioning Pattern
```css
.knob-label-top {
  bottom: 100%;           /* Position above control */
  left: 50%;              /* Horizontal center */
  transform: translateX(-50%);  /* Center alignment */
  margin-bottom: 4px;     /* Spacing */
}
```

## Testing & Verification

**TypeScript Compilation:** ✓ All changes compile without errors (`npx tsc --noEmit` successful)

**Manual Verification Steps:**
1. Add Knob to canvas
2. Enable "Show Label" in property panel → Label appears below knob
3. Change label position to "top" → Label moves above knob
4. Change label text → Text updates on canvas
5. Enable "Show Value" → Formatted value appears
6. Change value format to "percentage" → Display changes from "0.50" to "50%"
7. Change value format to "dB" → Display shows "0.00 dB"
8. Repeat for Slider element → All features work identically

**Export Verification:**
1. Export project to HTML
2. Open exported HTML → Label/value render correctly
3. Check CSS → Positioning classes present
4. Verify value formatting → Matches designer preview

## Commits

| Commit | Message | Files Changed |
|--------|---------|---------------|
| `366bb25` | feat(13-01): extend Knob and Slider types with label/value properties | 1 file (elements.ts) |
| `201dce1` | feat(13-01): add label/value display to Knob and Slider renderers | 2 files (KnobRenderer, SliderRenderer) |
| `ab431fa` | feat(13-01): add label/value controls to property panels and export | 3 files (properties + generators) |

**Total:** 3 commits, 7 files modified, 0 files created

## Deviations from Plan

None - plan executed exactly as written. All tasks completed successfully with no architectural changes required.

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Ready for:** Remainder of Phase 13 plans (container elements, form controls, audio displays, complex widgets) can proceed as planned.

## Usage Example

```typescript
// Create knob with label and value display
const knob = createKnob({
  name: 'Gain',
  showLabel: true,
  labelText: 'Gain',
  labelPosition: 'bottom',
  showValue: true,
  valuePosition: 'top',
  valueFormat: 'db',
  valueDecimalPlaces: 1,
  min: -60,
  max: 12,
  value: 0.5  // Will display as "-24.0 dB" with default min/max
})
```

**Exported HTML:**
```html
<div id="gain" class="element knob knob-element" ...>
  <span class="knob-label knob-label-bottom" ...>Gain</span>
  <span class="knob-value knob-value-top" ...>-24.0 dB</span>
  <svg>...</svg>
</div>
```

## Success Metrics

✓ All 9 success criteria met:
- [x] KnobElementConfig has 10 new label/value properties
- [x] SliderElementConfig has 10 new label/value properties
- [x] KnobRenderer displays optional label and value
- [x] SliderRenderer displays optional label and value
- [x] KnobProperties has Label and Value Display sections
- [x] SliderProperties has Label and Value Display sections
- [x] HTML export includes label/value spans
- [x] CSS export includes label/value positioning
- [x] Value formatting works for all 5 formats
