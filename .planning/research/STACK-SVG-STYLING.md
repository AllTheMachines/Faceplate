# Stack Research: SVG Styling Extension

**Project:** Faceplate - SVG Styling for Visual Controls
**Researched:** 2026-02-04
**Confidence:** HIGH (verified via npm registry + codebase inspection)

## Current Stack (Already Have)

All required libraries for SVG styling are already present in package.json:

| Library | Installed Version | Latest Version | Purpose |
|---------|-------------------|----------------|---------|
| isomorphic-dompurify | ^2.35.0 | 2.35.0 | SVG sanitization before render |
| svgo | ^4.0.0 | 4.0.0 | SVG optimization on import |
| svgson | ^5.3.1 | 5.3.1 | SVG-to-JSON parsing (if needed) |
| zustand | ^5.0.10 | - | State management (styles slice) |
| zod | ^4.3.6 | - | Schema validation for style types |

**Verification:** Ran `npm view [package] version` on 2026-02-04 to confirm installed versions are current.

### Existing SVG Infrastructure (No Changes Needed)

- **SafeSVG component** (`src/components/SafeSVG.tsx`) - Single point for all SVG rendering with automatic re-sanitization
- **svg-sanitizer** (`src/lib/svg-sanitizer.ts`) - DOMPurify configuration with strict allowlist
- **knobLayers service** (`src/services/knobLayers.ts`) - Layer detection, extraction, and color override logic

The knobLayers service is control-agnostic; functions like `extractLayer()` and `applyColorOverride()` work on any SVG content, not just knobs. This is reusable as-is.

## Stack Additions Needed

**None required.**

The existing stack fully supports extending SVG styling to sliders, buttons, and meters. The work is purely:
1. Type definitions (TypeScript)
2. New Zustand slice (or extending knobStylesSlice)
3. Renderer updates (React components)
4. Schema updates (Zod)

No new npm dependencies are needed.

## Stack Additions NOT Needed

| Library | Why Not Needed |
|---------|----------------|
| Additional SVG manipulation library | svgson + DOM APIs already handle all needed operations |
| Animation library (GSAP, Framer Motion) | SVG animations handled via CSS transform/opacity in renderers |
| SVG path manipulation library | Not manipulating paths; only layering/rotating/coloring existing SVG content |
| State machine library (XState) | Overkill for button pressed/toggle states; simple boolean/enum in element config |

### Why svgson is Already Sufficient

svgson (already installed) provides:
- `parse(svgString)` - Convert SVG to JSON AST
- `stringify(ast)` - Convert back to SVG string

This covers any advanced manipulation needs. However, the existing knobLayers.ts uses native DOMParser, which is equally capable and already proven in the codebase.

## Integration Notes

### 1. Layer Detection Service Extension

The existing `detectKnobLayers()` function uses naming conventions (indicator, track, arc, glow, shadow). For other control types:

| Control Type | Likely Layer Roles | Notes |
|--------------|-------------------|-------|
| Slider | thumb, track, fill | Similar to knob layers |
| Button | background, icon, label, pressed-state | May need multi-state SVG support |
| Toggle | track, thumb, on-state, off-state | Position-based, not rotation |
| Meter | background, fill, peak-hold | Value-based fill, not rotation |

**Recommendation:** Create a unified `detectLayers()` function that takes a `category` parameter to select appropriate naming conventions.

### 2. Store Slice Strategy

Two options:

**Option A: Single unified slice (RECOMMENDED)**
```typescript
// src/store/elementStylesSlice.ts
interface ElementStylesSlice {
  elementStyles: ElementStyle[]  // Replaces knobStyles
  // ... same actions
}
```
- Pros: Single source of truth, simpler migration
- Cons: Slightly larger state object

**Option B: Category-specific slices**
```typescript
// Multiple slices: knobStylesSlice, sliderStylesSlice, etc.
```
- Pros: Smaller per-slice
- Cons: More boilerplate, harder to manage shared logic

Choose Option A because:
- The existing knobStylesSlice pattern is clean
- Category is stored in each style object anyway
- Migration is simpler (rename knobStyles -> elementStyles)

### 3. Renderer Dual-Mode Pattern

The existing KnobRenderer.tsx shows the correct pattern:

```typescript
export function SliderRenderer({ config }: SliderRendererProps) {
  // If no style assigned, use default CSS slider
  if (!config.styleId) {
    return <DefaultSliderRenderer config={config} />
  }
  // Use styled SVG slider
  return <StyledSliderRenderer config={config} />
}
```

Apply this pattern to all 18 remaining control renderers.

### 4. Schema Version Migration

Current project schema includes `knobStyles: KnobStyleSchema[]`. Migration path:

1. Add `elementStyles: ElementStyleSchema[]` to schema
2. Add migration function that copies `knobStyles` to `elementStyles` with `category: 'knob'`
3. Deprecate but keep `knobStyles` for one version cycle
4. Remove `knobStyles` in subsequent version

### 5. Export Generator Updates

Two files need updates:
- `src/services/export/htmlGenerator.ts` - Include SVG style assets
- `src/services/export/codeGenerator.ts` - Generate style application code

Both already handle knob styles; extend to include all element categories.

## Version Compatibility

| Component | Minimum Version | Current | Status |
|-----------|-----------------|---------|--------|
| React | 18.0 | 18.3.1 | OK |
| TypeScript | 5.0 | 5.6.2 | OK |
| DOMPurify | 3.0 | 2.35.0 (isomorphic) | OK |
| SVGO | 3.0 | 4.0.0 | OK |

All dependencies are current and compatible.

## Summary

**No stack changes required.** The existing infrastructure is sufficient:

- **SVG sanitization:** isomorphic-dompurify via SafeSVG component
- **SVG optimization:** svgo (already used in asset import flow)
- **Layer manipulation:** knobLayers.ts (DOM-based, reusable)
- **State management:** Zustand slice pattern (extend or rename)
- **Schema validation:** Zod (extend existing schemas)

The work is 100% TypeScript/React component work, no new dependencies needed.
