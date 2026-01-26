---
phase: 16-static-svg-graphics
plan: 01
title: "SVG Graphic Element Foundation"
completed: 2026-01-26
duration: 105s
status: complete

subsystem: element-system
tags: [svg-graphics, elements, types, renderer, asset-library]

# Dependencies
requires:
  - 15-01 # AssetsSlice (getAsset for asset lookup)
  - 14-03 # SafeSVG component (secure SVG rendering)

provides:
  - SvgGraphicElementConfig type
  - createSvgGraphic factory function
  - isSvgGraphic type guard
  - SvgGraphicRenderer component

affects:
  - 16-02 # Property panel integration will use these types
  - 16-03 # Element factory will use createSvgGraphic
  - 16-04 # Canvas integration will use SvgGraphicRenderer

# Technical Stack
tech-stack:
  added: []
  patterns:
    - "Asset-referenced element (assetId pattern)"
    - "Transform-based rendering (flipH, flipV, opacity)"
    - "Three-state placeholder UI pattern"

# Artifacts
key-files:
  created:
    - src/components/elements/renderers/SvgGraphicRenderer.tsx
  modified:
    - src/types/elements.ts

decisions:
  - id: SVG_GRAPHIC_PLACEHOLDER_SIZE
    choice: "100x100 default size"
    rationale: "Consistent with ImageElement, suitable placeholder for icon-sized graphics"

  - id: SVG_GRAPHIC_TRANSFORM_HANDLING
    choice: "Rotation handled by BaseElement wrapper, only flipH/flipV in renderer"
    rationale: "Avoid duplicate rotation transforms; compose flip transforms separately"

  - id: SVG_GRAPHIC_THREE_STATE_UI
    choice: "Unassigned, Valid, Missing asset states"
    rationale: "Clear visual feedback for each state; follows ImageRenderer pattern"

# Tasks
tasks:
  - name: "Add SvgGraphicElementConfig to type system"
    commit: 0b488ac
    files: [src/types/elements.ts]

  - name: "Create SvgGraphicRenderer component"
    commit: 5a1cc8a
    files: [src/components/elements/renderers/SvgGraphicRenderer.tsx]
---

# Phase 16 Plan 01: SVG Graphic Element Foundation Summary

**One-liner:** SvgGraphicElementConfig type and SvgGraphicRenderer with three-state placeholder UI (unassigned, valid, missing)

## What Was Built

Established the core SVG Graphic element infrastructure:

1. **Type System Extension**
   - Added `SvgGraphicElementConfig` interface extending `BaseElementConfig`
   - Type discriminant: `type: 'svggraphic'`
   - Properties: `assetId` (optional), `flipH`, `flipV`, `opacity`
   - Added to `ElementConfig` discriminated union

2. **Factory & Type Guard**
   - `createSvgGraphic()` factory function with sensible defaults
   - Default size: 100x100 (suitable for icon-sized graphics)
   - Default state: unassigned (assetId undefined), no flips, opacity 1
   - `isSvgGraphic()` type guard for discriminated union matching

3. **Renderer Component**
   - `SvgGraphicRenderer` with three visual states:
     - **Unassigned**: Folder icon + "Select Asset" text (dashed border)
     - **Valid**: Renders asset via `SafeSVG` with transforms applied
     - **Missing**: Warning icon + "Asset not found" (red border)
   - Transform handling: flipH (scaleX), flipV (scaleY), opacity
   - Rotation handled by BaseElement wrapper (not duplicated)

## Architecture Decisions

### Transform Composition Strategy

**Decision:** Rotation handled by BaseElement wrapper, only flipH/flipV in renderer

**Rationale:**
- BaseElement already applies `transform: rotate()` based on config.rotation
- Duplicating rotation in renderer would cause double-rotation
- Flip transforms compose cleanly at renderer level
- Transform origin: center center for proper flip behavior

### Three-State Placeholder Pattern

**Decision:** Unassigned, Valid, Missing asset states with distinct visuals

**Rationale:**
- **Unassigned** (assetId undefined): User hasn't selected asset yet → friendly prompt
- **Valid** (asset exists): Render SVG content normally
- **Missing** (assetId exists but asset deleted): Error state → user needs to fix

This pattern follows ImageRenderer and provides clear visual feedback for each state.

### Asset-Referenced Element Pattern

**Decision:** Use `assetId` reference instead of embedding SVG content

**Rationale:**
- Consistent with ImageElement pattern (Phase 15-04)
- Single source of truth for asset content (AssetsSlice)
- Enables asset reuse across multiple elements
- Asset updates automatically propagate to all instances

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

**Type Safety Verification:**
- `npx tsc --noEmit` passes with no errors
- SvgGraphicElementConfig correctly extends BaseElementConfig
- Type guard and factory function compile correctly

**Manual Testing Required (Next Phase):**
- Verify placeholder states render correctly on canvas
- Test flipH/flipV transforms with actual SVG assets
- Verify opacity applies correctly
- Test missing asset error state (delete asset after assignment)

## Known Limitations

1. **No Property Panel Integration Yet**
   - Can create elements programmatically but no UI for assignment
   - Next plan: 16-02 (Property Panel Integration)

2. **No Element Factory Integration**
   - Cannot drag from palette to canvas yet
   - Next plan: 16-03 (Element Factory & Palette)

3. **No Canvas Rendering Yet**
   - Renderer exists but not wired to BaseElement
   - Next plan: 16-04 (Canvas Integration)

## Next Phase Readiness

**Phase 16-02 Dependencies Met:**
- ✅ SvgGraphicElementConfig type exists
- ✅ isSvgGraphic type guard exists
- ✅ Properties defined (assetId, flipH, flipV, opacity)

**Phase 16-03 Dependencies Met:**
- ✅ createSvgGraphic factory function exists
- ✅ Default values suitable for palette instantiation

**Phase 16-04 Dependencies Met:**
- ✅ SvgGraphicRenderer component exists
- ✅ Renderer handles all three states
- ✅ SafeSVG integration complete

**Outstanding Dependencies:** None - all downstream phases have what they need.

## Performance Considerations

- **Transform Composition:** CSS transforms are GPU-accelerated (scaleX/scaleY)
- **SafeSVG Memoization:** SafeSVG uses useMemo to avoid re-sanitization overhead
- **Asset Lookup:** O(1) getAsset lookup via Zustand store

## Security Notes

- All SVG content rendered via `SafeSVG` component (defense-in-depth)
- Re-sanitization occurs before every render (SEC-03)
- No direct dangerouslySetInnerHTML usage in renderer
- Asset content already sanitized at import time (Phase 15-02)

## Commits

| Hash    | Message                                              | Files                                               |
|---------|------------------------------------------------------|-----------------------------------------------------|
| 0b488ac | feat(16-01): add SvgGraphicElementConfig to type system | src/types/elements.ts                               |
| 5a1cc8a | feat(16-01): create SvgGraphicRenderer component     | src/components/elements/renderers/SvgGraphicRenderer.tsx |

**Total commits:** 2 (both task commits, no deviation fixes needed)
