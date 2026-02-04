# Phase 16: Static SVG Graphics - Research

**Researched:** 2026-01-26
**Domain:** React SVG element rendering with transforms (rotation, flip, opacity), aspect ratio locking
**Confidence:** HIGH

## Summary

This phase implements a new "SVG Graphic" element type that references assets from the Phase 15 asset library. The research covers extending the existing element type system, implementing CSS transforms (rotation, flip horizontal/vertical, opacity), aspect ratio-locked resizing, and property panel patterns for asset selection and transform controls.

The standard approach extends the existing architecture: add `SvgGraphicElementConfig` to the discriminated union, create `SvgGraphicRenderer` using `SafeSVG` component (already implemented in Phase 14), implement `SvgGraphicProperties` following the `ImageProperties` pattern (asset selection + transform controls), and integrate with the palette system. Transform implementation uses CSS `transform` property combining rotation, scale (for flips), and opacity.

User decisions from CONTEXT.md constrain the research: dual placement flow (palette placeholder + library drag), aspect ratio locked by default (Shift to unlock), rotation + flip + opacity controls, placeholder visual states for unassigned/missing assets, and "Reset to natural size" button. These decisions eliminate alternatives and focus research on implementation details.

**Primary recommendation:** Extend existing element type system with `SvgGraphicElementConfig` containing `assetId`, `flipH`, `flipV`, `opacity` properties. Use SafeSVG component for rendering (already sanitized). Implement aspect ratio locking in resize handlers (match existing pattern used for Line element). Transform composition: `transform: rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component architecture | Already used for all UI, no new dependencies |
| SafeSVG | Custom component | Sanitized SVG rendering | Already implemented in Phase 14, encapsulates DOMPurify |
| TypeScript discriminated unions | Built-in | Type-safe element configs | Existing pattern for all 22+ element types |
| CSS transforms | Built-in Web API | Rotation, flip, opacity | Standard browser feature, used for element rotation already |
| Zustand | 5.0.10 | Asset lookup via getAsset() | Already integrated in AssetsSlice (Phase 15) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DOMParser | Built-in Web API | Extract SVG viewBox for natural size | Use to parse SVG and read viewBox attribute |
| CSS object-fit | Built-in CSS | SVG scaling behavior | Use `contain` mode (entire SVG visible, may letterbox) |
| transform-origin | Built-in CSS | Rotation pivot point | Use `center center` for SVG graphics (default for rotation) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SafeSVG component | Direct dangerouslySetInnerHTML | SafeSVG provides defense-in-depth sanitization, established pattern |
| CSS transforms | SVG transform attribute | CSS transforms integrate with existing rotation system, simpler |
| assetId reference | Duplicate svgContent in element | assetId prevents data duplication, single source of truth |
| object-fit: contain | Manual SVG scaling calculations | CSS object-fit is simpler, browser-optimized, standard approach |

**Installation:**
```bash
# No new dependencies required - all libraries already installed
# Existing: React, TypeScript, Zustand, SafeSVG component, CSS transforms
```

## Architecture Patterns

### Recommended Element Type Structure
```typescript
// Add to types/elements.ts discriminated union
export interface SvgGraphicElementConfig extends BaseElementConfig {
  type: 'svggraphic'

  // Asset Reference
  assetId?: string  // Optional - undefined for placeholder state

  // Transform Properties
  flipH: boolean    // Horizontal flip (CSS scaleX(-1))
  flipV: boolean    // Vertical flip (CSS scaleY(-1))
  opacity: number   // 0-1 range (CSS opacity)

  // Note: rotation already in BaseElementConfig
  // Note: x, y, width, height, zIndex already in BaseElementConfig
}

// Factory function following existing pattern
export function createSvgGraphic(overrides?: Partial<SvgGraphicElementConfig>): SvgGraphicElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'svggraphic',
    name: 'SVG Graphic',
    x: 0,
    y: 0,
    width: 100,  // Default placeholder size
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    assetId: undefined,  // Starts unassigned
    flipH: false,
    flipV: false,
    opacity: 1,
    ...overrides,
  }
}
```

### Pattern 1: SVG Natural Size Extraction
**What:** Parse SVG viewBox to determine natural dimensions for "Reset to natural size" button
**When to use:** When user clicks reset button or drags asset from library to canvas
**Example:**
```typescript
// Source: MDN Web APIs - DOMParser, SVG viewBox attribute
import { getAsset } from '../store'

function getSVGNaturalSize(assetId: string): { width: number; height: number } | null {
  const asset = getAsset(assetId)
  if (!asset) return null

  // Parse SVG to extract viewBox
  const parser = new DOMParser()
  const doc = parser.parseFromString(asset.svgContent, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')

  if (!svgEl) return null

  // Try viewBox first (most reliable)
  const viewBox = svgEl.getAttribute('viewBox')
  if (viewBox) {
    const [, , width, height] = viewBox.split(/\s+/).map(Number)
    return { width, height }
  }

  // Fallback to width/height attributes
  const width = parseFloat(svgEl.getAttribute('width') || '100')
  const height = parseFloat(svgEl.getAttribute('height') || '100')

  return { width, height }
}
```

### Pattern 2: CSS Transform Composition
**What:** Combine rotation, flip horizontal, flip vertical into single transform property
**When to use:** Rendering SVG Graphic element on canvas and in export
**Why:** Single transform property is more performant than separate properties
**Example:**
```typescript
// Source: MDN CSS transforms - transform property composition
// Transforms are applied right-to-left: rotate first, then flip

function buildTransformStyle(config: SvgGraphicElementConfig): string {
  const parts: string[] = []

  // Rotation (from BaseElementConfig)
  if (config.rotation !== 0) {
    parts.push(`rotate(${config.rotation}deg)`)
  }

  // Flip horizontal
  if (config.flipH) {
    parts.push('scaleX(-1)')
  }

  // Flip vertical
  if (config.flipV) {
    parts.push('scaleY(-1)')
  }

  return parts.length > 0 ? parts.join(' ') : 'none'
}

// Usage in renderer
<div style={{
  transform: buildTransformStyle(config),
  transformOrigin: 'center center',  // Default for rotation
  opacity: config.opacity,
}}>
  {config.assetId && <SafeSVG content={asset.svgContent} />}
</div>
```

### Pattern 3: Placeholder Visual States
**What:** Three distinct visual states - unassigned placeholder, assigned with asset, missing asset (deleted)
**When to use:** Rendering SVG Graphic element based on assetId state
**Example:**
```typescript
// Source: Existing ImageRenderer pattern
import { useStore } from '../../../store'
import { SafeSVG } from '../../SafeSVG'

export function SvgGraphicRenderer({ config }: { config: SvgGraphicElementConfig }) {
  const getAsset = useStore((state) => state.getAsset)

  // State 1: Unassigned placeholder
  if (!config.assetId) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #4b5563',
        backgroundColor: '#374151',
        color: '#9ca3af',
        fontSize: '12px',
      }}>
        {/* Icon placeholder - could use SVG icon */}
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
        <span>Select Asset</span>
      </div>
    )
  }

  // State 2: Asset assigned - check if exists
  const asset = getAsset(config.assetId)

  // State 3: Missing asset (deleted from library)
  if (!asset) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #ef4444',
        backgroundColor: '#7f1d1d',
        color: '#fca5a5',
        fontSize: '12px',
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
        <span>Asset not found</span>
      </div>
    )
  }

  // State 2: Valid asset - render with transforms
  return (
    <div style={{
      width: '100%',
      height: '100%',
      transform: buildTransformStyle(config),
      transformOrigin: 'center center',
      opacity: config.opacity,
    }}>
      <SafeSVG
        content={asset.svgContent}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',  // Entire SVG visible, may letterbox
        }}
      />
    </div>
  )
}
```

### Pattern 4: Asset Selection Dropdown
**What:** Property panel dropdown showing all available assets with "Browse..." option
**When to use:** Asset assignment in property panel
**Example:**
```typescript
// Source: Existing ImageProperties pattern, adapted for asset library
import { useStore } from '../../store'
import { PropertySection } from './'

export function SvgGraphicProperties({ element, onUpdate }) {
  const assets = useStore((state) => state.assets)
  const getAsset = useStore((state) => state.getAsset)

  return (
    <PropertySection title="Asset">
      <div>
        <label className="block text-xs text-gray-400 mb-1">SVG Asset</label>
        <select
          value={element.assetId || ''}
          onChange={(e) => {
            const assetId = e.target.value || undefined
            onUpdate({ assetId })

            // If asset selected, reset to natural size
            if (assetId) {
              const naturalSize = getSVGNaturalSize(assetId)
              if (naturalSize) {
                onUpdate({
                  assetId,
                  width: naturalSize.width,
                  height: naturalSize.height,
                })
              }
            }
          }}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
        >
          <option value="">None (placeholder)</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Browse button - opens asset library in modal/tab */}
      <button
        onClick={() => {
          // Implementation: Switch to asset library tab or open modal
          // User can import new asset or select existing
        }}
        className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-2 text-sm transition-colors"
      >
        Browse Asset Library...
      </button>

      {/* Reset to natural size button */}
      {element.assetId && (
        <button
          onClick={() => {
            const naturalSize = getSVGNaturalSize(element.assetId!)
            if (naturalSize) {
              onUpdate({
                width: naturalSize.width,
                height: naturalSize.height,
              })
            }
          }}
          className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-2 text-sm transition-colors"
        >
          Reset to Natural Size
        </button>
      )}
    </PropertySection>
  )
}
```

### Pattern 5: Transform Controls in Property Panel
**What:** Rotation slider (0-360°), flip horizontal/vertical toggles, opacity slider (0-100%)
**When to use:** Property panel for SVG Graphic elements
**Example:**
```typescript
// Source: Existing property panel patterns (NumberInput, PropertySection)
import { NumberInput, PropertySection } from './'

export function SvgGraphicProperties({ element, onUpdate }) {
  return (
    <>
      {/* Asset section - from Pattern 4 above */}

      {/* Transform section */}
      <PropertySection title="Transform">
        <NumberInput
          label="Rotation"
          value={element.rotation}
          onChange={(rotation) => onUpdate({ rotation })}
          min={0}
          max={360}
          step={1}
          suffix="°"
        />

        <div className="flex gap-2 mt-2">
          <label className="flex items-center gap-2 text-sm flex-1">
            <input
              type="checkbox"
              checked={element.flipH}
              onChange={(e) => onUpdate({ flipH: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            <span className="text-gray-300">Flip Horizontal</span>
          </label>

          <label className="flex items-center gap-2 text-sm flex-1">
            <input
              type="checkbox"
              checked={element.flipV}
              onChange={(e) => onUpdate({ flipV: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            <span className="text-gray-300">Flip Vertical</span>
          </label>
        </div>

        <NumberInput
          label="Opacity"
          value={element.opacity * 100}  // Show as percentage
          onChange={(val) => onUpdate({ opacity: val / 100 })}
          min={0}
          max={100}
          step={5}
          suffix="%"
        />
      </PropertySection>
    </>
  )
}
```

### Pattern 6: Aspect Ratio Locking During Resize
**What:** Lock aspect ratio by default (Shift to unlock) when resizing SVG Graphic elements
**When to use:** Resize handler for SVG Graphic elements
**Note:** User decision specifies "aspect ratio locked by default (Shift to unlock)"
**Example:**
```typescript
// Source: Existing resize patterns from Canvas/hooks/useResize.ts
// SVG Graphics should preserve aspect ratio unless Shift is held

// In resize handler (useResize hook or similar)
function handleResize(elementId: string, newWidth: number, newHeight: number, shiftKey: boolean) {
  const element = getElement(elementId)

  if (element.type === 'svggraphic') {
    // For SVG Graphics: lock aspect ratio by default, Shift to unlock
    const shouldLockAspect = !shiftKey  // Inverted from typical behavior

    if (shouldLockAspect) {
      const aspectRatio = element.width / element.height

      // Determine which dimension changed more
      const widthChange = Math.abs(newWidth - element.width)
      const heightChange = Math.abs(newHeight - element.height)

      if (widthChange > heightChange) {
        // Width changed more - adjust height to match aspect ratio
        newHeight = newWidth / aspectRatio
      } else {
        // Height changed more - adjust width to match aspect ratio
        newWidth = newHeight * aspectRatio
      }
    }

    // Apply minimum size constraint (8x8 per CONTEXT.md)
    newWidth = Math.max(8, newWidth)
    newHeight = Math.max(8, newHeight)
  }

  updateElement(elementId, { width: newWidth, height: newHeight })
}
```

### Pattern 7: Palette Integration
**What:** Add "SVG Graphic" item to palette under "Images & Decorative" category
**When to use:** Palette configuration (Palette.tsx)
**Example:**
```typescript
// Source: Existing Palette.tsx structure
const paletteCategories = [
  // ... existing categories ...
  {
    name: 'Images & Decorative',
    items: [
      { id: 'image', type: 'image', name: 'Image' },
      { id: 'svggraphic', type: 'svggraphic', name: 'SVG Graphic' },  // NEW
      { id: 'rectangle', type: 'rectangle', name: 'Rectangle' },
      { id: 'line', type: 'line', name: 'Line' },
    ],
  },
  // ... other categories ...
]
```

### Pattern 8: Library Drag-to-Canvas
**What:** Dragging asset from library creates SVG Graphic element with assetId already assigned
**When to use:** DndContext handler for library-to-canvas drops (existing from Phase 15)
**Example:**
```typescript
// Source: Phase 15 RESEARCH.md - Pattern 3: Drag from Library to Canvas
// This pattern is already implemented, just need to handle SVG Graphic creation

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event

  if (active.data.current?.type === 'library-asset' && over?.id === 'canvas') {
    const assetId = active.data.current.assetId
    const asset = getAsset(assetId)

    if (!asset) return

    // Get natural size from SVG viewBox
    const naturalSize = getSVGNaturalSize(assetId) || { width: 100, height: 100 }

    // Create SVG Graphic element at drop position
    addElement(createSvgGraphic({
      assetId: assetId,
      width: naturalSize.width,
      height: naturalSize.height,
      x: dropX,  // Calculated from drop coordinates
      y: dropY,
    }))
  }
}
```

### Anti-Patterns to Avoid
- **Duplicating SVG content in element:** Always use assetId reference, not svgContent duplication
- **Forgetting transform-origin:** Without `transformOrigin: 'center center'`, rotation pivots from top-left (unexpected behavior)
- **Separate opacity in transform:** Use CSS `opacity` property, not `opacity()` in transform (better browser support)
- **Hardcoded aspect ratio:** Calculate from current width/height, not from original SVG (element may have been manually resized)
- **Direct dangerouslySetInnerHTML:** Always use SafeSVG component for defense-in-depth sanitization
- **Skipping minimum size check:** Elements smaller than 8x8 are invisible and confusing to users

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG sanitization | Custom regex/parsing | SafeSVG component (Phase 14) | Defense-in-depth, encapsulates DOMPurify, already tested |
| SVG dimension extraction | Manual string parsing | DOMParser with querySelector | Handles edge cases (namespaces, malformed SVG), browser-native |
| Aspect ratio calculation | Store original dimensions | Calculate from current width/height | Element may have been manually resized, current dimensions are source of truth |
| Transform composition | Separate CSS properties | Single transform property | Better performance, atomic updates, correct composition order |
| Asset selection UI | Custom file picker | Dropdown + "Browse" button to library | Consistent with existing patterns, leverages asset library |
| Placeholder icons | Custom SVG markup | Unicode emoji or existing icon system | Simpler, no new assets to manage |

**Key insight:** All core functionality (SVG sanitization, asset storage, drag-drop, transform rendering) is already implemented in previous phases. This phase is primarily about composing existing patterns into a new element type. The temptation is to write custom solutions for "simple" tasks like SVG parsing or transform composition, but the established patterns handle edge cases (malformed SVG, transform order, browser quirks) that custom code often misses.

## Common Pitfalls

### Pitfall 1: Transform Order Confusion
**What goes wrong:** Applying transforms in wrong order (flip before rotate) causes unexpected visual results when both are active.
**Why it happens:** CSS transforms are applied right-to-left, which is counterintuitive. `transform: rotate(45deg) scaleX(-1)` flips first, then rotates.
**How to avoid:** Always test with both rotation AND flip active. Correct order: `rotate() scaleX() scaleY()` (rotate first, then flip).
**Warning signs:** Flipped + rotated graphics appear in wrong position or orientation.

### Pitfall 2: Missing transform-origin
**What goes wrong:** Rotation pivots from top-left corner instead of center, making rotated graphics appear to move position.
**Why it happens:** Default `transform-origin` is `50% 50%` relative to element, but forgetting to set it explicitly causes browser inconsistencies.
**How to avoid:** Always set `transformOrigin: 'center center'` on elements with rotation. Matches existing element rotation behavior.
**Warning signs:** Rotated elements shift position unexpectedly.

### Pitfall 3: Aspect Ratio Lock Logic Inverted
**What goes wrong:** Implementing standard "Shift to lock" instead of user-specified "locked by default, Shift to unlock" behavior.
**Why it happens:** Standard drag-drop convention is Shift = constrain. User wants opposite for SVG Graphics (prevent accidental distortion).
**How to avoid:** Check `!shiftKey` for aspect lock condition, not `shiftKey`. Add comment explaining inverted behavior.
**Warning signs:** User reports "aspect ratio doesn't stay locked" or "Shift key doesn't unlock."

### Pitfall 4: Object-fit Misunderstanding
**What goes wrong:** Using `object-fit: cover` (crops SVG) or `fill` (stretches SVG) instead of `contain` (shows entire SVG).
**Why it happens:** Confusion about CSS object-fit modes. User specified "contain" (entire SVG visible, may letterbox).
**How to avoid:** Always use `object-fit: contain` for SVG Graphics. Add comment explaining CONTEXT.md decision.
**Warning signs:** Parts of SVG are cropped, or SVG is stretched/distorted.

### Pitfall 5: Forgetting Minimum Size Enforcement
**What goes wrong:** User resizes SVG Graphic to 1x1 or negative dimensions, element becomes invisible and unselectable.
**Why it happens:** Resize handlers don't enforce minimum size constraint. User specified 8×8 minimum.
**How to avoid:** Apply `Math.max(8, width)` and `Math.max(8, height)` in resize handler before updating element.
**Warning signs:** Elements disappear after aggressive resizing, selection indicators show at 0x0.

### Pitfall 6: ViewBox Extraction Fragility
**What goes wrong:** Assuming all SVGs have viewBox attribute, crashes when parsing SVG without viewBox.
**Why it happens:** Not all exported SVGs include viewBox (Illustrator sometimes exports without it). DOMParser doesn't throw errors.
**How to avoid:** Check for null/undefined at each step: `querySelector('svg')`, `getAttribute('viewBox')`, fallback to width/height attributes, final fallback to default 100x100.
**Warning signs:** "Reset to natural size" crashes, library drag creates 0x0 elements.

### Pitfall 7: Asset Deletion Without Element Update
**What goes wrong:** User deletes asset from library, SVG Graphic elements still reference deleted assetId, show "Asset not found" state permanently.
**Why it happens:** No cleanup mechanism when asset is deleted. Elements become orphaned.
**How to avoid:** Asset deletion is Phase 15 responsibility (usage check warning). This phase only handles rendering of "Asset not found" state (red border warning).
**Warning signs:** Many elements stuck in "Asset not found" state, no way to recover.

## Code Examples

Verified patterns from official sources:

### CSS Transform Composition
```typescript
// Source: MDN CSS - transform property
// https://developer.mozilla.org/en-US/docs/Web/CSS/transform

// Transforms are applied right-to-left: last transform happens first
// Order: rotate → scaleX → scaleY

function buildTransformStyle(config: SvgGraphicElementConfig): string {
  const parts: string[] = []

  // Order matters: rotate first, then flip
  if (config.rotation !== 0) {
    parts.push(`rotate(${config.rotation}deg)`)
  }

  if (config.flipH) {
    parts.push('scaleX(-1)')
  }

  if (config.flipV) {
    parts.push('scaleY(-1)')
  }

  return parts.length > 0 ? parts.join(' ') : 'none'
}

// Example transform: rotate(45deg) scaleX(-1) scaleY(-1)
// Execution order: scaleY → scaleX → rotate (right-to-left)
```

### SVG ViewBox Extraction
```typescript
// Source: MDN Web APIs - DOMParser, SVG viewBox
// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox

function getSVGNaturalSize(assetId: string): { width: number; height: number } | null {
  const getAsset = useStore.getState().getAsset
  const asset = getAsset(assetId)

  if (!asset) return null

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(asset.svgContent, 'image/svg+xml')

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      console.warn('SVG parsing failed:', assetId)
      return { width: 100, height: 100 }  // Fallback
    }

    const svgEl = doc.querySelector('svg')
    if (!svgEl) {
      return { width: 100, height: 100 }  // Fallback
    }

    // Try viewBox first (most reliable)
    const viewBox = svgEl.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.trim().split(/\s+/)
      if (parts.length === 4) {
        const [, , width, height] = parts.map(Number)
        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
          return { width, height }
        }
      }
    }

    // Fallback to width/height attributes
    const widthAttr = svgEl.getAttribute('width')
    const heightAttr = svgEl.getAttribute('height')

    if (widthAttr && heightAttr) {
      const width = parseFloat(widthAttr)
      const height = parseFloat(heightAttr)

      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        return { width, height }
      }
    }

    // Final fallback
    return { width: 100, height: 100 }
  } catch (err) {
    console.error('SVG dimension extraction failed:', err)
    return { width: 100, height: 100 }
  }
}
```

### Element Config Integration
```typescript
// Source: Existing types/elements.ts pattern
// Add to discriminated union

export interface SvgGraphicElementConfig extends BaseElementConfig {
  type: 'svggraphic'
  assetId?: string
  flipH: boolean
  flipV: boolean
  opacity: number  // 0-1 range
}

// Add to ElementConfig union type
export type ElementConfig =
  | KnobElementConfig
  | SliderElementConfig
  // ... other types ...
  | SvgGraphicElementConfig  // NEW

// Add type guard
export function isSvgGraphic(element: ElementConfig): element is SvgGraphicElementConfig {
  return element.type === 'svggraphic'
}

// Add factory function
export function createSvgGraphic(overrides?: Partial<SvgGraphicElementConfig>): SvgGraphicElementConfig {
  return {
    id: crypto.randomUUID(),
    type: 'svggraphic',
    name: 'SVG Graphic',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    assetId: undefined,
    flipH: false,
    flipV: false,
    opacity: 1,
    ...overrides,
  }
}
```

### HTML Export Pattern
```typescript
// Source: Existing services/export/htmlGenerator.ts pattern
// Add to generateElementHTML() switch statement

export function generateElementHTML(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const baseClass = 'element'
  const positionStyle = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation}deg);`

  switch (element.type) {
    // ... existing cases ...

    case 'svggraphic':
      return generateSvgGraphicHTML(id, baseClass, positionStyle, element)

    // ... other cases ...
  }
}

function generateSvgGraphicHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  element: SvgGraphicElementConfig
): string {
  const getAsset = useStore.getState().getAsset
  const asset = element.assetId ? getAsset(element.assetId) : null

  // Build transform with flip
  const transformParts: string[] = []
  if (element.rotation !== 0) transformParts.push(`rotate(${element.rotation}deg)`)
  if (element.flipH) transformParts.push('scaleX(-1)')
  if (element.flipV) transformParts.push('scaleY(-1)')
  const transform = transformParts.length > 0 ? transformParts.join(' ') : 'none'

  // Build inline style with transform and opacity
  const inlineStyle = `${positionStyle} transform: ${transform}; transform-origin: center center; opacity: ${element.opacity};`

  if (!asset) {
    // Placeholder or missing asset - export as empty div with comment
    return `<div id="${id}" class="${baseClass} svggraphic-element" data-type="svggraphic" style="${inlineStyle}">
  <!-- SVG Graphic: Asset not assigned or missing -->
</div>`
  }

  // Export with sanitized SVG content inline
  const sanitizedSVG = sanitizeSVG(asset.svgContent)  // Re-sanitize for export (SEC-04)

  return `<div id="${id}" class="${baseClass} svggraphic-element" data-type="svggraphic" style="${inlineStyle}">
  ${sanitizedSVG}
</div>`
}
```

### CSS Export Pattern
```typescript
// Source: Existing services/export/cssGenerator.ts pattern
// Add to generateElementCSS() switch statement

export function generateElementCSS(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const selector = `#${id}`

  switch (element.type) {
    // ... existing cases ...

    case 'svggraphic':
      return `${selector} {
  /* SVG Graphic styles */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

${selector} svg {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}`

    // ... other cases ...
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline SVG with string manipulation | SafeSVG component with DOMPurify | 2024 (Phase 14) | Defense-in-depth security, XSS prevention |
| Multiple CSS properties | Single transform property | Always recommended | Better performance, atomic updates, correct composition |
| Duplicating SVG content | Asset ID reference | 2024 (Phase 15) | Single source of truth, smaller project files |
| Manual viewBox parsing | DOMParser API | 2015+ (widespread support) | Robust parsing, handles edge cases, browser-native |
| Standard "Shift to lock" | "Locked by default, Shift to unlock" | User decision (Phase 16) | Prevents accidental distortion of graphics |

**Deprecated/outdated:**
- **String-based SVG manipulation:** Unsafe, XSS-vulnerable. Always use DOMPurify via SafeSVG component.
- **Separate transform properties:** Modern browsers support single transform property with better performance.
- **FileReader for inline SVG:** Use DOMParser for SVG dimension extraction (faster, synchronous).

## Open Questions

Things that couldn't be fully resolved:

1. **Placeholder icon choice**
   - What we know: User specified placeholder should clearly communicate "click to assign asset" with icon
   - What's unclear: Exact icon choice (folder, image, plus, etc.)
   - Recommendation: Use folder emoji 📁 or simple Unicode character. Matches "Browse..." pattern. No custom SVG needed.

2. **Browse button behavior**
   - What we know: User wants "Browse..." button in property panel
   - What's unclear: Should it open modal, switch to asset library tab, or inline expand?
   - Recommendation: Switch to asset library tab (simpler implementation, consistent with palette/library UX). User can import or select existing asset.

3. **Export optimization**
   - What we know: SVGO optimization is planned for Phase 18 (EXP-04), marked as optional toggle
   - What's unclear: Should Phase 16 export include SVGO, or defer entirely to Phase 18?
   - Recommendation: Defer to Phase 18. Export sanitized SVG inline (SEC-04 requirement), optimization is separate concern.

4. **Rotation control granularity**
   - What we know: User wants 0-360° rotation control
   - What's unclear: Should there be fine-tune controls (arrow keys, input field) or only slider?
   - Recommendation: NumberInput (existing component) provides both slider and input field. Standard pattern for rotation.

5. **Aspect ratio calculation source**
   - What we know: Aspect ratio should be locked by default
   - What's unclear: Calculate from original SVG viewBox or current element dimensions?
   - Recommendation: Current element dimensions (width/height). Element may have been manually resized (Shift-unlock), current dimensions reflect user intent.

## Sources

### Primary (HIGH confidence)
- MDN Web APIs - DOMParser: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
- MDN CSS - transform property: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
- MDN CSS - transform-origin: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin
- MDN CSS - opacity: https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
- MDN CSS - object-fit: https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
- MDN SVG - viewBox attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
- Project codebase - SafeSVG component (Phase 14): src/components/SafeSVG.tsx
- Project codebase - ImageRenderer pattern: src/components/elements/renderers/ImageRenderer.tsx
- Project codebase - Element type system: src/types/elements.ts
- Project codebase - Asset slice: src/store/assetsSlice.ts
- Phase 15 RESEARCH.md - Asset library patterns, drag-to-canvas

### Secondary (MEDIUM confidence)
- CSS transform composition order: Verified across multiple MDN sources
- Aspect ratio locking patterns: Standard resize handler patterns in Canvas apps
- ViewBox extraction: Common pattern, verified across SVG manipulation tutorials

### Tertiary (LOW confidence - marked for validation)
- Placeholder icon choice: Subjective UX decision, 📁 is common but not verified
- Browse button behavior: Implementation detail left to discretion

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already exist (SafeSVG, asset storage, TypeScript types, CSS transforms)
- Architecture: HIGH - Patterns verified from existing codebase (ImageRenderer, element type system, property panels)
- Pitfalls: HIGH - Transform order verified from MDN, aspect ratio logic from CONTEXT.md user decision
- Export: HIGH - Pattern matches existing htmlGenerator/cssGenerator structure

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable domain, established patterns)
