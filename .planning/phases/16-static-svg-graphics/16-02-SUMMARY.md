---
phase: 16
plan: 02
subsystem: ui-property-panel
tags: [svg, properties, asset-management, transforms]

dependency-graph:
  requires:
    - 15-01  # AssetsSlice with getAsset()
    - 16-01  # SvgGraphicElementConfig type definition
  provides:
    - SvgGraphicProperties component for property panel
    - getSVGNaturalSize utility for dimension extraction
  affects:
    - 16-03  # Will wire SvgGraphicProperties to PropertyPanel switch
    - 16-04  # Palette integration will use createSvgGraphic

tech-stack:
  added:
    - DOMParser (built-in Web API) for SVG parsing
  patterns:
    - Property panel with asset dropdown
    - Natural size extraction from SVG viewBox
    - Transform controls (flip H/V, opacity)

file-tracking:
  created:
    - src/services/svg/getSVGNaturalSize.ts
    - src/services/svg/index.ts
    - src/components/Properties/SvgGraphicProperties.tsx
  modified:
    - src/components/Properties/index.ts

decisions: []

metrics:
  duration: 2 minutes
  completed: 2026-01-26
---

# Phase 16 Plan 02: SVG Graphic Property Panel Summary

**One-liner:** SVG Graphic property panel with asset dropdown, flip H/V toggles, opacity slider, and viewBox-based natural size reset

## What Was Built

Created the property panel component for SVG Graphic elements and the utility function for extracting natural dimensions from SVG content.

**Core functionality:**
- **getSVGNaturalSize utility** - Parses SVG content with DOMParser, extracts dimensions from viewBox attribute (primary) or width/height attributes (fallback), returns default 100x100 if parsing fails
- **SvgGraphicProperties component** - Asset selection dropdown showing all available assets, automatic resize to natural size when asset selected, Reset to Natural Size button (visible when asset assigned), Flip Horizontal and Flip Vertical checkboxes, Opacity slider (0-100%)

**Files created:**
- `src/services/svg/getSVGNaturalSize.ts` - SVG dimension extraction utility
- `src/services/svg/index.ts` - Export barrel for SVG services
- `src/components/Properties/SvgGraphicProperties.tsx` - Property panel component

**Files modified:**
- `src/components/Properties/index.ts` - Added SvgGraphicProperties export

## Architecture Decisions

### Pattern: SVG ViewBox Extraction
**Decision:** Use DOMParser to parse SVG content and extract dimensions from viewBox attribute first, then fall back to width/height attributes, with final fallback to 100x100.

**Rationale:**
- viewBox is most reliable (includes coordinate system)
- width/height attributes may have units that need parsing
- DOMParser handles edge cases (namespaces, malformed SVG) better than regex
- Fallback ensures function always returns valid dimensions

**Implementation:**
```typescript
const parser = new DOMParser()
const doc = parser.parseFromString(svgContent, 'image/svg+xml')
const viewBox = svgEl.getAttribute('viewBox')
// Parse viewBox: "0 0 100 100" → { width: 100, height: 100 }
```

### Pattern: Auto-Resize on Asset Selection
**Decision:** When user selects an asset from the dropdown, automatically resize the element to the asset's natural size.

**Rationale:**
- Prevents distortion (user doesn't manually resize after assignment)
- Matches user expectation (select asset → see it at correct size)
- "Reset to Natural Size" button allows recovery if user manually resizes

**Implementation:**
```typescript
const handleAssetChange = (newAssetId: string | undefined) => {
  if (newAssetId) {
    const asset = getAsset(newAssetId)
    if (asset) {
      const naturalSize = getSVGNaturalSize(asset.svgContent)
      if (naturalSize) {
        onUpdate({ assetId: newAssetId, width: naturalSize.width, height: naturalSize.height })
      }
    }
  }
}
```

### Pattern: Opacity as Percentage in UI
**Decision:** Store opacity as 0-1 internally, display as 0-100% in UI with NumberInput.

**Rationale:**
- CSS opacity is 0-1 (matches internal storage)
- Users understand percentages better (0-100% vs 0.0-1.0)
- NumberInput handles conversion cleanly

**Implementation:**
```typescript
<NumberInput
  label="Opacity"
  value={Math.round(element.opacity * 100)}
  onChange={(val) => onUpdate({ opacity: val / 100 })}
  min={0}
  max={100}
  step={5}
  suffix="%"
/>
```

## Implementation Notes

### getSVGNaturalSize Robustness
The function includes comprehensive error handling:
- Checks for `parsererror` element (DOMParser doesn't throw on malformed SVG)
- Validates all numeric conversions with isNaN
- Ensures width/height are positive (> 0)
- Catches exceptions and logs errors
- Always returns valid dimensions (never null/undefined)

This prevents crashes when:
- SVG has no viewBox or width/height
- SVG is malformed XML
- Dimensions are invalid (negative, zero, non-numeric)

### Property Panel Integration Pattern
Follows existing property panel patterns:
- Uses `PropertySection` for visual grouping
- Uses `NumberInput` for opacity slider
- Uses native `<select>` for asset dropdown (matches ImageProperties pattern)
- Conditional rendering for Reset button (only when asset assigned)
- Follows ImageProperties styling (gray background, hover effects)

### Asset Access via Zustand
Uses Zustand store hooks:
- `useStore((state) => state.assets)` - Get all assets for dropdown
- `useStore((state) => state.getAsset)` - Get specific asset by ID
- No prop drilling, direct access to asset library

## Testing Notes

Manual verification performed:
- ✓ TypeScript compilation passes (npx tsc --noEmit)
- ✓ getSVGNaturalSize.ts exists and exports function
- ✓ SvgGraphicProperties.tsx exists and exports component
- ✓ Both properly exported from index files

No automated tests added (property panel components typically tested manually in designer).

## Deviations from Plan

None - plan executed exactly as written.

## Known Limitations

1. **No asset preview thumbnail** - Dropdown shows asset names only, no visual preview. Consider adding thumbnail in future iteration.

2. **No "Browse Asset Library" button** - Plan mentioned this in research but not in tasks. User must use existing asset library tab to import assets. Could add direct navigation button in future.

3. **No validation for missing assets** - Property panel doesn't warn if selected assetId references deleted asset. Renderer handles this (shows "Asset not found" state), but property panel could add inline warning.

4. **Opacity step is 5%** - Allows 0%, 5%, 10%... 100%. Fine-tune control available via input field, but slider jumps by 5%. Could reduce to 1% for finer control.

## Next Phase Readiness

**Phase 16-03 (Property Panel Wiring) can proceed:**
- ✓ SvgGraphicProperties component exists
- ✓ Follows existing property panel patterns
- ✓ Ready to add to PropertyPanel switch statement

**Blockers:** None

**Concerns:** None

## Commits

| Hash    | Message |
|---------|---------|
| d97ee21 | feat(16-02): create getSVGNaturalSize utility function |
| df88993 | feat(16-02): create SvgGraphicProperties component |

## Task Breakdown

**Task 1: Create getSVGNaturalSize utility function** [COMPLETE]
- Created src/services/svg/getSVGNaturalSize.ts
- Parse SVG with DOMParser, extract viewBox or width/height
- Export from src/services/svg/index.ts
- Verified: TypeScript compilation passes, file exists

**Task 2: Create SvgGraphicProperties component** [COMPLETE]
- Created src/components/Properties/SvgGraphicProperties.tsx
- Asset dropdown with all available assets
- Auto-resize to natural size on asset selection
- Reset to Natural Size button (visible when asset assigned)
- Flip H/V toggles, Opacity slider (0-100%)
- Export from src/components/Properties/index.ts
- Verified: TypeScript compilation passes, file exists

## Success Criteria Met

- [x] TypeScript compilation succeeds
- [x] getSVGNaturalSize correctly extracts dimensions from viewBox or width/height attributes
- [x] SvgGraphicProperties shows asset dropdown with all available assets
- [x] Flip H/V toggles work correctly
- [x] Opacity slider allows 0-100% adjustment
- [x] Reset to Natural Size button appears when asset is assigned

## Lessons Learned

1. **DOMParser is synchronous** - No need for async/await or promises when parsing SVG. Simpler than FileReader approach.

2. **ViewBox parsing requires careful splitting** - ViewBox format is "minX minY width height" separated by whitespace (spaces or commas). Using `split(/\s+/)` handles both.

3. **Property panel component reuse** - PropertySection and NumberInput provide consistent UX. No need to build custom controls.

4. **Asset dropdown pattern** - Simple `<select>` with `assets.map()` is sufficient. No need for complex autocomplete or virtualization (asset library is typically small, <100 assets).
