---
phase: 27
plan: 04
subsystem: export
tags: [export, containers, html, css, tooltip, spacers, windowchrome, juce]
requires: [27-01, 27-02, 27-03]
provides: [tooltip-export, spacer-export, windowchrome-export]
affects: [28, 29, 30]
tech-stack:
  added: []
  patterns: [data-attributes, webkit-app-region, css-triangles]
key-files:
  created: []
  modified:
    - src/services/export/htmlGenerator.ts
    - src/services/export/cssGenerator.ts
decisions:
  - id: tooltip-data-attributes
    title: Tooltip exports with comprehensive data attributes
    rationale: JUCE needs position, delay, content for runtime tooltip rendering
    outcome: data-position, data-hover-delay, data-content attributes exported
  - id: spacer-sizing-modes
    title: Spacer sizing mode determines CSS properties
    rationale: Fixed uses width/height, flexible uses flex-grow with min/max
    outcome: data-sizing-mode attribute switches between fixed and flex properties
  - id: windowchrome-drag-regions
    title: Window Chrome uses -webkit-app-region for JUCE dragging
    rationale: JUCE WebView2 supports webkit drag regions for native window movement
    outcome: data-drag-region="drag" on title bar, "no-drag" on buttons
  - id: os-specific-button-styles
    title: Window Chrome button styles match OS conventions
    rationale: Users expect familiar window controls (macOS traffic lights, Windows icons)
    outcome: data-button-style attribute with macos/windows/neutral variants
metrics:
  duration: 18min
  completed: 2026-01-26
---

# Phase 27 Plan 04: Export Support Summary

**One-liner:** HTML/CSS export for tooltip, spacers, window chrome with JUCE data attributes and OS-specific styling

## What Was Built

Added HTML and CSS export generation for 4 new container element types in the export service:

1. **Tooltip**: Invisible trigger area with hover-activated positioned content
2. **Horizontal Spacer**: Fixed or flexible width spacing element
3. **Vertical Spacer**: Fixed or flexible height spacing element
4. **Window Chrome**: Title bar with OS-specific button styles (macOS/Windows/neutral)

## Implementation Details

### HTML Generation

**File:** `src/services/export/htmlGenerator.ts`

**Type imports added:**
- `TooltipElementConfig`
- `HorizontalSpacerElementConfig`
- `VerticalSpacerElementConfig`
- `WindowChromeElementConfig`

**Switch cases added:**
```typescript
case 'tooltip': generateTooltipHTML()
case 'horizontalspacer': generateHorizontalSpacerHTML()
case 'verticalspacer': generateVerticalSpacerHTML()
case 'windowchrome': generateWindowChromeHTML()
```

**Tooltip HTML:**
- Exports as trigger div with `data-position`, `data-hover-delay`, `data-content` attributes
- Content HTML-escaped for safe JUCE rendering
- Position (top/bottom/left/right) controls tooltip placement

**Spacer HTML:**
- Exports with `data-sizing-mode` attribute (fixed/flexible)
- Fixed mode: `data-fixed-width` or `data-fixed-height`
- Flexible mode: `data-flex-grow`, `data-min-*`, `data-max-*` attributes
- Invisible structural elements for layout

**Window Chrome HTML:**
- Exports with `data-button-style` attribute (macos/windows/neutral)
- Buttons have `data-action` attributes (close/minimize/maximize)
- `data-drag-region` attributes for JUCE window dragging
  - `"drag"` on title bar area
  - `"no-drag"` on button areas
- macOS: Traffic light colored circles (red/yellow/green)
- Windows: Text symbols (−/□/×)
- Neutral: Gray circles

### CSS Generation

**File:** `src/services/export/cssGenerator.ts`

**Type imports added:** Same 4 container types

**Switch cases added:** Same 4 types

**Tooltip CSS:**
- Invisible trigger area with `cursor: help`
- Absolutely positioned `.tooltip-content` with opacity transition
- Position-specific offset calculation (top/bottom/left/right)
- CSS triangle arrows (6px border-based triangles) when `showArrow: true`
- `z-index: 10000` for overlay rendering
- `opacity: 0` default, `opacity: 1` on `:hover`

**Horizontal Spacer CSS:**
- Fixed mode: `width: {fixedWidth}px`
- Flexible mode: `flex-grow: {flexGrow}; min-width: {minWidth}px; max-width: {maxWidth}px`
- `background: transparent` (invisible)

**Vertical Spacer CSS:**
- Fixed mode: `height: {fixedHeight}px`
- Flexible mode: `flex-grow: {flexGrow}; min-height: {minHeight}px; max-height: {maxHeight}px`
- `background: transparent` (invisible)

**Window Chrome CSS:**
- Flexbox layout: `display: flex; align-items: center`
- `-webkit-app-region: drag` for JUCE window dragging
- `[data-drag-region="no-drag"]` selector for button click areas
- macOS style:
  - 12px circular buttons with `border-radius: 50%`
  - `filter: brightness(0.9)` on hover
  - Inline background colors (red/yellow/green)
- Windows style:
  - 46px wide buttons with text icons
  - `rgba(255, 255, 255, 0.1)` hover background
  - Red close button hover: `#e81123`
- Neutral style:
  - 14px gray circular buttons
  - Colored hover states (red/yellow/green)

## Architecture Integration

**Export Pipeline:**
```
ElementConfig → generateElementHTML() → <div> with data attributes
ElementConfig → generateElementCSS() → Scoped styles with selectors
```

**JUCE Integration:**
- Tooltip: JUCE reads `data-content`, shows native tooltip or DOM overlay
- Spacers: JUCE layout engine uses sizing mode data for responsive layouts
- Window Chrome: JUCE interprets `-webkit-app-region` for window dragging, `data-action` for button handlers

**Data Attribute Patterns:**
- `data-type`: Element type identifier
- `data-position`: Tooltip placement
- `data-sizing-mode`: Spacer behavior (fixed/flexible)
- `data-button-style`: Window Chrome OS theme
- `data-drag-region`: JUCE drag/no-drag zones
- `data-action`: Button action identifier

## Verification

✅ TypeScript compilation passes (`npx tsc --noEmit`)
✅ All 4 element types present in both htmlGenerator and cssGenerator
✅ Switch statements handle tooltip, horizontalspacer, verticalspacer, windowchrome
✅ HTML exports with proper data attributes for JUCE binding
✅ CSS exports with OS-specific button styles and drag region handling

## Next Phase Readiness

**Phase 28 (Specialized Elements) ready:**
- Export pattern established for container elements
- Data attribute convention documented
- OS-specific styling pattern available for reuse
- -webkit-app-region pattern for future drag interactions

**No blockers**

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

**src/services/export/htmlGenerator.ts** (97 insertions, 1 deletion)
- Added 4 type imports
- Added 4 switch cases
- Added 4 generator functions (generateTooltipHTML, generateHorizontalSpacerHTML, generateVerticalSpacerHTML, generateWindowChromeHTML)

**src/services/export/cssGenerator.ts** (204 insertions, 1 deletion)
- Added 4 type imports
- Added 4 switch cases
- Added 4 generator functions (generateTooltipCSS, generateHorizontalSpacerCSS, generateVerticalSpacerCSS, generateWindowChromeCSS)

## Commits

1. `e1592ba` - feat(27-04): add HTML generation for tooltip, spacers, window chrome
2. `1b862b6` - feat(27-04): add CSS generation for tooltip, spacers, window chrome

---
*Summary created: 2026-01-26*
*Phase 27 Plan 04: Export Support - COMPLETE*
