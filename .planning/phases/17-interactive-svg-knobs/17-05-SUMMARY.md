---
phase: 17-interactive-svg-knobs
plan: "05"
subsystem: ui-properties
status: complete
completed: 2026-01-26
duration: 2min

requires:
  - 17-01  # KnobStyle type system and state management
  - 17-03  # SVG knob renderer
  - 17-04  # ManageKnobStylesDialog component

provides:
  - Knob style selection UI in property panel
  - Color override controls for SVG knobs
  - Context-aware property display (CSS vs SVG modes)

affects:
  - 17-06  # May need property panel integration if not already wired

tech-stack:
  added: []
  patterns:
    - Conditional UI rendering based on element.styleId
    - Per-layer color override editing
    - Context-sensitive property panels

key-files:
  created: []
  modified:
    - src/components/Properties/KnobProperties.tsx

decisions:
  - id: D17-05-01
    title: Style selector at top of property panel
    rationale: Most impactful setting that affects all other properties
    date: 2026-01-26
  - id: D17-05-02
    title: Reset color overrides when changing style
    rationale: Prevents confusion from stale overrides after style switch
    date: 2026-01-26
  - id: D17-05-03
    title: Hide CSS properties when SVG style applied
    rationale: Clean UX - only show relevant controls for current mode
    date: 2026-01-26
  - id: D17-05-04
    title: Show color inputs only for existing layers
    rationale: Don't clutter UI with inputs for layers the style doesn't have
    date: 2026-01-26

tags:
  - ui
  - properties
  - knobs
  - svg-knobs
  - color-overrides
  - conditional-rendering
---

# Phase 17 Plan 05: Knob Style Selection UI Summary

**One-liner:** Property panel now shows style dropdown, per-layer color overrides, and context-aware CSS/SVG controls

## What Was Built

Extended KnobProperties component with comprehensive knob style selection and customization:

1. **Style Selection Dropdown**
   - "Default (CSS Gradient)" option for standard knobs
   - All imported knob styles from library
   - "Manage styles..." link to open dialog
   - Resets color overrides when style changes

2. **Color Override Controls**
   - Dynamic color inputs for each layer in selected style
   - Only shows inputs for layers that exist (indicator, track, arc, glow, shadow)
   - "Reset to Original Colors" button
   - Updates element.colorOverrides object

3. **Context-Aware Property Display**
   - CSS properties hidden when SVG style applied:
     - Arc Geometry section
     - Style (arc/filled/dot/line) section
     - Colors (CSS knob) section
   - Always visible sections:
     - Knob Style (at top)
     - Color Overrides (when style applied)
     - Value section
     - Label section
     - Value Display section

## Technical Implementation

### Property Panel Structure

```
┌─ Knob Style ───────────────┐
│ Dropdown: Default / Style1 │  ← Always visible
│ "Manage styles..." link    │
└────────────────────────────┘

┌─ Color Overrides ──────────┐
│ Indicator: [color picker]  │  ← Only when styleId set
│ Track: [color picker]      │     Only for existing layers
│ Arc: [color picker]        │
│ "Reset to Original Colors" │
└────────────────────────────┘

┌─ Value ────────────────────┐
│ Value, Min, Max            │  ← Always visible
└────────────────────────────┘

┌─ Arc Geometry ─────────────┐
│ Start/End Angle            │  ← Only when !styleId
│ Track Width                │
└────────────────────────────┘

┌─ Style ────────────────────┐
│ Arc/Filled/Dot/Line        │  ← Only when !styleId
└────────────────────────────┘

┌─ Colors ───────────────────┐
│ Track/Fill/Indicator       │  ← Only when !styleId
└────────────────────────────┘

┌─ Label ────────────────────┐
│ Show Label checkbox        │  ← Always visible
└────────────────────────────┘

┌─ Value Display ────────────┐
│ Show Value checkbox        │  ← Always visible
└────────────────────────────┘
```

### Dynamic Layer Detection

```typescript
const style = getKnobStyle(element.styleId)
const layerNames = ['indicator', 'track', 'arc', 'glow', 'shadow']
const existingLayers = layerNames.filter((name) => style.layers[name])
```

Only creates color inputs for layers that exist in the style.

### Color Override Updates

```typescript
onChange={(color) => {
  const newOverrides = { ...element.colorOverrides }
  if (color) {
    newOverrides[layerName] = color
  } else {
    delete newOverrides[layerName]
  }
  onUpdate({ colorOverrides: newOverrides })
}}
```

Sparse object - only stores explicit overrides.

## File Changes

### Modified: `src/components/Properties/KnobProperties.tsx` (318 lines)

**Additions:**
- useState for showManageDialog
- useStore hooks for knobStyles and getKnobStyle
- Knob Style section at top (dropdown + manage link)
- Color Overrides section (conditional on styleId)
- Conditional rendering wrapper around CSS-specific sections
- ManageKnobStylesDialog component

**Changes:**
- Moved Knob Style section to top
- Wrapped Arc Geometry, Style, Colors in !element.styleId conditional
- Added color override logic for per-layer customization

## Deviations from Plan

None - plan executed exactly as written.

## Testing Performed

- TypeScript compilation successful
- Build completed without errors related to KnobProperties
- Component structure verified (318 lines, exceeds 250 line requirement)

## Integration Points

### Consumes
- `useStore((state) => state.knobStyles)` - List of available styles
- `useStore((state) => state.getKnobStyle)` - Retrieve style by ID
- `ManageKnobStylesDialog` - Style management UI

### Provides
- Complete property panel for knob elements
- Style selection and color customization UI
- Context-aware property display

## Next Steps

1. **17-06: Export Integration** (if needed)
   - Ensure HTML/CSS export handles styleId
   - Export should render SVG knobs when styleId is set
   - Export should fall back to CSS knobs when no styleId

2. **Future Enhancement: Preview in Property Panel**
   - Could show small knob preview in Color Overrides section
   - Would help visualize changes without selecting element

3. **Future Enhancement: Copy/Paste Style**
   - Could add "Copy Style" button to copy styleId + colorOverrides
   - "Paste Style" to apply to other knobs

## Success Criteria

- [x] Style dropdown shows "Default" + all knob styles
- [x] Selecting style updates element.styleId
- [x] "Manage styles..." link opens ManageKnobStylesDialog
- [x] Color override inputs appear only for existing layers
- [x] Color changes update element.colorOverrides
- [x] "Reset" button clears all color overrides
- [x] CSS properties hidden when style applied
- [x] CSS properties visible when no style (default)
- [x] TypeScript compiles without errors

All success criteria met.

## Decisions Made

**D17-05-01: Style selector at top of property panel**

Most impactful setting that affects which other properties are visible.

**D17-05-02: Reset color overrides when changing style**

Prevents confusion from stale overrides applying to wrong layers after style switch.

**D17-05-03: Hide CSS properties when SVG style applied**

Creates clean UX where only relevant controls are visible. User sees either:
- CSS knob mode: Arc Geometry, Style, Colors
- SVG knob mode: Color Overrides

**D17-05-04: Show color inputs only for existing layers**

Don't clutter UI with inputs for layers the style doesn't have. A minimal style with only indicator + track shouldn't show glow/shadow inputs.

## Performance Notes

- Dynamic layer detection runs on every render when styleId is set
- Could optimize with useMemo if performance issue observed
- Current implementation is simple and readable

## Next Phase Readiness

**Phase 17 Progress: 5/6 plans complete**

Remaining plan:
- 17-06: Interactive behavior (drag-to-rotate, value updates)

Phase 17 completion: ~83%

All property panel integration is now complete. Users can:
- Select knob styles from library
- Customize colors per-instance
- Manage style library
- See clean context-aware property panel
