---
phase: 27-containers-polish
plan: 01
subsystem: ui-elements
tags: [containers, tooltip, overlay, hover, dom-portal]

requires:
  - phase-26-interactive-curves

provides:
  - tooltip-element-type
  - tooltip-renderer
  - tooltip-properties
  - hover-detection-pattern

affects:
  - future-overlay-elements
  - phase-27-02-windowchrome

tech-stack:
  added:
    - react-dom/createPortal
  patterns:
    - dom-overlay-rendering
    - hover-timer-pattern
    - portal-positioning

key-files:
  created:
    - src/types/elements/containers.ts (TooltipElementConfig)
    - src/components/elements/renderers/containers/TooltipRenderer.tsx
    - src/components/Properties/TooltipProperties.tsx
  modified:
    - src/components/elements/renderers/containers/index.ts
    - src/components/elements/renderers/index.ts
    - src/components/Properties/index.ts
    - src/App.tsx

decisions:
  - id: tooltip-dom-portal
    choice: Use React Portal for tooltip overlay
    rationale: Avoids z-index stacking issues, renders outside parent hierarchy
    alternatives: [CSS absolute positioning within container]

  - id: hover-delay-timer
    choice: Configurable hover delay with setTimeout
    rationale: Professional UX pattern, prevents accidental tooltip triggers
    alternatives: [Immediate display, CSS :hover transitions]

  - id: dashed-trigger-area
    choice: Show dashed blue border on trigger area in designer
    rationale: Visual indicator of tooltip interaction zone
    alternatives: [Invisible trigger, solid border]

  - id: arrow-css-triangles
    choice: CSS border triangles for tooltip arrows
    rationale: Simple, performant, no SVG assets needed
    alternatives: [SVG arrows, pseudo-element shapes]

metrics:
  duration: ~3 min
  completed: 2026-01-26
  tasks: 3
  commits: 3
  files-modified: 7
  lines-added: ~394
---

# Phase 27 Plan 01: Tooltip Element Summary

**One-liner:** DOM portal tooltip with configurable hover delay, positioning (top/bottom/left/right), and HTML content support

## What Was Built

### TypeScript Types
- **TooltipElementConfig** interface extending BaseElementConfig
  - Hover timing: `hoverDelay` (300-500ms recommended, default 400ms)
  - Content: `content` string supporting HTML
  - Positioning: `position` (top/bottom/left/right), `offset`, `showArrow`
  - Styling: `backgroundColor`, `textColor`, `fontSize`, `padding`, `borderRadius`, `maxWidth`
- **isTooltip** type guard
- **createTooltip** factory function with sensible defaults

### Renderer Component
- **TooltipRenderer** with DOM portal overlay
  - Hover detection with configurable delay using `setTimeout`
  - Portal rendering to `document.body` for z-index isolation
  - Dynamic positioning based on trigger element bounds
  - CSS triangle arrows (6px) positioned per tooltip side
  - Dashed blue trigger area in designer mode (2px dashed border)
  - Smooth 0.15s fade-in transition

### Property Panel
- **TooltipProperties** with 4 sections:
  - **Content**: HTML textarea with helper text
  - **Trigger & Timing**: Hover delay slider (100-2000ms)
  - **Position**: Dropdown (top/bottom/left/right), offset, arrow toggle
  - **Styling**: Background/text color, font size, padding, border radius, max width

### Integration
- Registered in `rendererRegistry` for O(1) lookup
- Registered in `propertyRegistry` for property panel
- Added `createTooltip` to App.tsx palette handler
- Included in `ContainerElement` union type

## Technical Approach

### DOM Portal Pattern
```typescript
const tooltipOverlay = showTooltip && createPortal(
  <div style={tooltipStyle}>
    {config.showArrow && <div style={getArrowStyle()} />}
    <div dangerouslySetInnerHTML={{ __html: config.content }} />
  </div>,
  document.body
)
```

Portal renders outside React hierarchy, avoiding z-index conflicts.

### Hover Detection
```typescript
const handleMouseEnter = () => {
  hoverTimerRef.current = setTimeout(() => {
    setShowTooltip(true)
    calculateTooltipPosition()
  }, config.hoverDelay)
}
```

Timer pattern prevents accidental triggers on quick mouse movements.

### Position Calculation
Tooltip position calculated from trigger element's `getBoundingClientRect()`:
- **Top**: Center X, above trigger minus offset
- **Bottom**: Center X, below trigger plus offset
- **Left**: Left of trigger minus offset, center Y
- **Right**: Right of trigger plus offset, center Y

Transform applied via `getTooltipTransform()` to anchor correctly per position.

### CSS Arrow Triangles
Border-based CSS triangles (6px) created dynamically:
```typescript
borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
borderColor: `${config.backgroundColor} transparent transparent transparent`
```

Positioned absolutely within tooltip, rotated per side.

## Deviations from Plan

None - plan executed exactly as written.

## Quality Assurance

### Verification Results
- ✅ TypeScript compilation passes (`npx tsc --noEmit`)
- ✅ `TooltipElementConfig` interface exists in containers.ts
- ✅ `TooltipRenderer` registered in rendererRegistry
- ✅ `TooltipProperties` registered in propertyRegistry
- ✅ `case 'tooltip'` handler in App.tsx
- ✅ Renderer minimum 80 lines (actual: ~212 lines)
- ✅ Properties minimum 60 lines (actual: ~111 lines)

### Must-Haves Validation
- ✅ **Tooltip element appears in palette under Containers category** (via App.tsx case handler)
- ✅ **Tooltip shows configurable hover delay (300-500ms)** (hoverDelay property, 100-2000ms range)
- ✅ **Tooltip content supports rich HTML text** (dangerouslySetInnerHTML with HTML textarea)
- ✅ **Tooltip position can be set to top/bottom/left/right** (position dropdown in properties)
- ✅ **Tooltip arrow can be toggled on/off** (showArrow checkbox in properties)

### Artifacts Validation
- ✅ `src/types/elements/containers.ts` provides TooltipElementConfig interface
- ✅ `src/components/elements/renderers/containers/TooltipRenderer.tsx` provides DOM overlay tooltip (212 lines)
- ✅ `src/components/Properties/TooltipProperties.tsx` provides property panel (111 lines)
- ✅ `tooltip.*TooltipRenderer` link in rendererRegistry
- ✅ `tooltip.*TooltipProperties` link in propertyRegistry

## Decisions Made

### 1. DOM Portal for Overlay
**Decision:** Use `createPortal` to render tooltip in `document.body`

**Rationale:** Tooltips need to appear above all other content regardless of parent z-index. React Portal ensures tooltip renders outside element hierarchy, avoiding stacking context issues.

**Impact:** Clean overlay rendering, no z-index conflicts with containers/groups

### 2. Configurable Hover Delay
**Decision:** Use `setTimeout` with configurable delay (default 400ms)

**Rationale:** Professional UX pattern prevents accidental tooltip triggers during quick mouse movements. 300-500ms is industry standard for hover-activated elements.

**Impact:** Better UX, no tooltip spam on mouse movement

### 3. Dashed Trigger Area in Designer
**Decision:** Show 2px dashed blue border on trigger area

**Rationale:** Designers need to see where hover interaction zone is located. Dashed border distinguishes from regular container borders.

**Impact:** Clear visual feedback of tooltip trigger location

### 4. CSS Triangle Arrows
**Decision:** Use border-based CSS triangles for arrows

**Rationale:** Simple, performant, no external assets needed. 6px size provides clear visual anchor.

**Impact:** Zero asset dependencies, easy styling changes

## Integration Impact

### Registry Updates
- `rendererRegistry`: Added `['tooltip', TooltipRenderer]`
- `propertyRegistry`: Added `['tooltip', TooltipProperties]`
- `ContainerElement` union: Added `TooltipElementConfig`

### New Patterns Established
- **DOM Portal Pattern**: Reusable for future overlay elements (context menus, popovers)
- **Hover Timer Pattern**: Reusable for hover-activated elements
- **Dynamic Portal Positioning**: Reusable for positioned overlays

## Known Issues

None identified.

## Next Phase Readiness

**Phase 27-02 (Window Chrome)** can proceed - all container infrastructure in place.

### Blockers
None.

### Concerns
- **HTML Sanitization**: Currently uses `dangerouslySetInnerHTML` without sanitization. Consider adding DOMPurify in future for user-provided content (low priority - designer-only tool).
- **Tooltip Persistence**: Tooltip disappears on mouse leave. Future enhancement could add click-to-pin behavior.

### Recommendations
1. Add DOMPurify sanitization if tooltip content becomes user-editable
2. Consider adding tooltip width/height auto-sizing based on content
3. Add tooltip fade-out animation on mouse leave (currently instant hide)

## Performance Notes

- **Render Optimization**: Portal only rendered when `showTooltip === true`
- **Timer Cleanup**: `useEffect` cleanup prevents memory leaks
- **Position Calculation**: Only runs after hover delay, not on every mouse move

## Testing Suggestions

1. Verify hover delay works correctly (100-2000ms range)
2. Test all 4 positions (top/bottom/left/right) with arrow on/off
3. Verify tooltip appears above all other elements (z-index isolation)
4. Test HTML content rendering (bold, italic, paragraphs)
5. Verify tooltip hides on mouse leave
6. Test trigger area resize (width/height changes)
7. Verify dashed border appears in designer mode

---
**Phase:** 27-containers-polish
**Plan:** 01
**Status:** ✅ Complete
**Date:** 2026-01-26
**Duration:** ~3 min
