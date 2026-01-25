# Architecture: SVG Import System Integration

**Domain:** SVG Asset Management in React/Zustand Design Tool
**Researched:** 2026-01-25
**Confidence:** HIGH

## Executive Summary

The SVG Import System extends an existing React/Zustand design tool to manage reusable SVG assets and apply them to interactive knob controls. The architecture must balance **normalized asset storage** (assets as first-class entities), **reference-based element styling** (elements reference assets by ID), and **backward compatibility** (existing knobs continue working).

The recommended approach uses **Zustand slice pattern** for asset management, **ID-based references** for element-to-asset relationships, and **progressive enhancement** for rendering (fallback to built-in styles when no asset referenced).

---

## Current Architecture (v1.0)

### Zustand Store Structure

**Slices:**
- `CanvasSlice` - Canvas dimensions, background, grid settings
- `ElementsSlice` - Elements array, selection state, CRUD operations
- `ViewportSlice` - Pan/zoom camera state (excluded from undo)
- `TemplateSlice` - Load/clear operations

**Store composition:**
```typescript
Store = CanvasSlice & ViewportSlice & ElementsSlice & TemplateSlice
```

**Middleware:**
- `temporal` (zundo) - 50-action undo/redo history
- `partialize` - Excludes viewport from history

### Element Pattern

**Type system:**
```typescript
interface BaseElementConfig {
  id: string           // UUID
  name: string        // User-friendly, becomes export ID
  type: string        // Discriminator
  x, y, width, height // Position/size
  // ... base properties
}

type ElementConfig = KnobElementConfig | SliderElementConfig | ...
```

**Storage:** Flat array `elements: ElementConfig[]`

**Rendering:** Switch-based renderer per type
```typescript
{element.type === 'knob' && <KnobRenderer config={element} />}
```

**Properties:** Dedicated panel per type
```typescript
{element.type === 'knob' && <KnobProperties element={element} onUpdate={...} />}
```

### Component Organization

```
src/components/
├── elements/
│   ├── renderers/      # KnobRenderer, SliderRenderer, etc.
│   └── BaseElement.tsx # Wrapper with selection/drag
├── Properties/         # KnobProperties, SliderProperties, etc.
├── Palette/           # Element palette + CustomSVGUpload
├── DesignMode/        # SVGDesignMode, LayerAssignment
└── Canvas/            # Main canvas rendering
```

---

## Integration Points

### 1. New Zustand Slice: AssetsSlice

**Purpose:** Store SVG assets and knob styles as normalized data

```typescript
interface SVGAsset {
  id: string                    // UUID
  name: string                  // User-defined
  type: 'knob' | 'graphic'     // Asset category
  svgContent: string           // Original SVG markup
  width: number
  height: number

  // For knob assets only
  layers?: {
    track?: string             // Static background arc/ring
    indicator?: string         // Rotates with value
    thumb?: string            // Alternative to indicator
    fill?: string             // Fills arc based on value
    glow?: string             // Reactive highlight
    background?: string       // Static backdrop
  }

  // Metadata
  createdAt: number
  tags?: string[]
}

interface KnobStyle {
  id: string                    // UUID
  name: string                  // "Blue Glow", "Vintage", etc.
  assetId: string              // References SVGAsset

  // Customization overrides
  colorOverrides?: {
    track?: string
    indicator?: string
    fill?: string
    glow?: string
  }

  // Behavior configuration
  rotationRange?: { start: number; end: number }  // Default: -135 to 135

  createdAt: number
}

interface AssetsSlice {
  // State
  svgAssets: Record<string, SVGAsset>          // Normalized by ID
  knobStyles: Record<string, KnobStyle>        // Normalized by ID
  assetCategories: string[]                    // User-defined tags

  // Asset CRUD
  addAsset: (asset: SVGAsset) => void
  removeAsset: (id: string) => void
  updateAsset: (id: string, updates: Partial<SVGAsset>) => void
  getAsset: (id: string) => SVGAsset | undefined

  // Knob Style CRUD
  addKnobStyle: (style: KnobStyle) => void
  removeKnobStyle: (id: string) => void
  updateKnobStyle: (id: string, updates: Partial<KnobStyle>) => void
  getKnobStyle: (id: string) => KnobStyle | undefined

  // Queries
  getAssetsByType: (type: 'knob' | 'graphic') => SVGAsset[]
  getKnobStylesForAsset: (assetId: string) => KnobStyle[]
}
```

**Integration:** Add to store composition
```typescript
export type Store = CanvasSlice & ViewportSlice & ElementsSlice & TemplateSlice & AssetsSlice
```

**Rationale:**
- **Normalized storage** - Assets are reusable entities, not duplicated per element
- **Record<string, T>** - Fast O(1) lookups by ID (better than array search)
- **Separation of concerns** - Assets (raw SVG) separate from styles (configurations)

---

### 2. Modified Element Types

**Option A: Extend KnobElementConfig (Recommended)**

```typescript
interface KnobElementConfig extends BaseElementConfig {
  type: 'knob'

  // Existing built-in rendering properties
  diameter: number
  value: number
  min: number
  max: number
  startAngle: number
  endAngle: number
  style: 'arc' | 'filled' | 'dot' | 'line'
  trackColor: string
  fillColor: string
  indicatorColor: string
  trackWidth: number
  // ... label/value display properties

  // NEW: SVG knob style reference
  svgKnobStyleId?: string       // Optional reference to KnobStyle

  // NEW: Rendering mode
  renderMode?: 'builtin' | 'svg'  // Default: 'builtin'
}
```

**Option B: New SVGKnobElementConfig (Alternative)**

```typescript
interface SVGKnobElementConfig extends BaseElementConfig {
  type: 'svgknob'  // New element type

  svgKnobStyleId: string  // Required
  value: number
  min: number
  max: number

  // Inherited size from BaseElementConfig
  // Visual overrides can be separate properties
}
```

**Recommendation:** **Option A** for backward compatibility and unified UX
- Existing knobs continue working (no svgKnobStyleId = built-in rendering)
- Users can toggle between built-in and SVG modes
- Property panel shows relevant sections based on renderMode

---

### 3. New Element Type: SVGGraphicElement

For static SVG graphics (logos, icons, dividers):

```typescript
interface SVGGraphicElementConfig extends BaseElementConfig {
  type: 'svggraphic'

  svgAssetId: string    // References SVGAsset (type: 'graphic')

  // Appearance overrides
  colorOverride?: string    // Tint/recolor if SVG supports it
  opacity?: number          // 0-1

  // Already has x, y, width, height from BaseElementConfig
}
```

**Alternative:** Extend existing `ImageElementConfig` instead of new type
```typescript
interface ImageElementConfig extends BaseElementConfig {
  type: 'image'
  src: string               // Existing: base64 data URL or external URL
  svgAssetId?: string      // NEW: Alternative to src for managed assets
  fit: 'contain' | 'cover' | 'fill' | 'none'
}
```

**Recommendation:** Extend `ImageElementConfig` - simpler, reuses existing renderer infrastructure

---

## Component Architecture

### New Components

#### 1. AssetLibraryPanel

**Location:** `src/components/Assets/AssetLibraryPanel.tsx`

**Purpose:** Unified UI for managing SVG assets and knob styles

```typescript
interface AssetLibraryPanelProps {
  isOpen: boolean
  onClose: () => void
}

// Features:
// - Tabbed interface: "Knob Styles" | "Graphics" | "Import"
// - Grid view with thumbnails
// - Search/filter by name or tag
// - Right-click context menu: Rename, Duplicate, Delete
// - Drag-to-canvas for graphics
// - Click-to-apply for knob styles (to selected knob element)
```

**State:**
```typescript
const svgAssets = useStore(state => state.svgAssets)
const knobStyles = useStore(state => state.knobStyles)
const addAsset = useStore(state => state.addAsset)
const addKnobStyle = useStore(state => state.addKnobStyle)
```

#### 2. SVGKnobRenderer

**Location:** `src/components/elements/renderers/SVGKnobRenderer.tsx`

**Purpose:** Render knob using SVG layers instead of programmatic drawing

```typescript
interface SVGKnobRendererProps {
  config: KnobElementConfig  // Has svgKnobStyleId
}

// Rendering logic:
// 1. Resolve knobStyle = getKnobStyle(config.svgKnobStyleId)
// 2. Resolve asset = getAsset(knobStyle.assetId)
// 3. Extract layers from asset.layers
// 4. Compose SVG:
//    - Render track (static)
//    - Render fill (clip/mask based on config.value)
//    - Render indicator (rotated by valueAngle)
//    - Apply color overrides from knobStyle
```

**Key challenge:** Animating SVG layers
- **Track:** Static, render as-is
- **Indicator:** Apply CSS transform: `rotate(${valueAngle}deg)`
- **Fill:** Use SVG `<clipPath>` or `<mask>` to show partial arc
- **Transform origin:** Must be center of knob (requires layer bounds calculation)

#### 3. SVGAssetThumbnail

**Location:** `src/components/Assets/SVGAssetThumbnail.tsx`

**Purpose:** Render asset preview in library grid

```typescript
interface SVGAssetThumbnailProps {
  asset: SVGAsset
  selected?: boolean
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

// Renders:
// - SVG preview (constrained to 80x80px)
// - Asset name
// - Type badge ("Knob" | "Graphic")
```

#### 4. AssetImportWizard

**Location:** `src/components/Assets/AssetImportWizard.tsx`

**Purpose:** Multi-step import flow

**Steps:**
1. **Upload** - Drag-drop or file picker for .svg
2. **Type Selection** - "Knob" or "Graphic"
3. **Layer Assignment** (if Knob) - Reuse existing `SVGDesignMode` component
4. **Metadata** - Name, tags
5. **Confirmation** - Preview + save

**Integration with existing code:**
- Reuses `parseSVGFile()` from `src/utils/svgImport.ts`
- Reuses `SVGDesignMode` component (already exists in v1.0)
- Saves to `AssetsSlice` instead of directly creating element

---

### Modified Components

#### 1. KnobProperties (Enhanced)

**Changes:**
```typescript
// Add section for SVG mode
<PropertySection title="Rendering">
  <RadioGroup
    value={element.renderMode || 'builtin'}
    onChange={(mode) => onUpdate({ renderMode: mode })}
    options={[
      { label: 'Built-in', value: 'builtin' },
      { label: 'SVG Style', value: 'svg' }
    ]}
  />

  {element.renderMode === 'svg' && (
    <KnobStyleSelector
      selectedId={element.svgKnobStyleId}
      onChange={(id) => onUpdate({ svgKnobStyleId: id })}
    />
  )}
</PropertySection>

// Conditionally show built-in style properties only when renderMode === 'builtin'
{element.renderMode !== 'svg' && (
  <>
    <PropertySection title="Arc Geometry">...</PropertySection>
    <PropertySection title="Style">...</PropertySection>
  </>
)}
```

#### 2. KnobRenderer (Modified)

**Changes:**
```typescript
export function KnobRenderer({ config }: KnobRendererProps) {
  // NEW: Check for SVG mode
  if (config.renderMode === 'svg' && config.svgKnobStyleId) {
    return <SVGKnobRenderer config={config} />
  }

  // EXISTING: Built-in rendering (unchanged)
  // ... existing arc/filled/dot/line rendering
}
```

#### 3. Palette (Enhanced)

**Changes:**
```typescript
// Add button to open Asset Library
<button onClick={() => setAssetLibraryOpen(true)}>
  📚 Asset Library
</button>

// Existing CustomSVGUpload changes behavior:
// - Instead of directly creating element, opens AssetImportWizard
// - Wizard saves to AssetsSlice
// - User then applies asset from library
```

**Alternative:** Keep `CustomSVGUpload` for quick "add to canvas" workflow, add separate library access

---

## Data Flow Patterns

### Asset Import Flow

```
User uploads SVG
    ↓
parseSVGFile() extracts dimensions + layers
    ↓
AssetImportWizard shows layer assignment (if knob)
    ↓
User assigns layers (track, indicator, fill, etc.)
    ↓
AssetsSlice.addAsset() stores SVGAsset
    ↓
(Optional) AssetsSlice.addKnobStyle() creates default style
    ↓
Asset appears in AssetLibraryPanel
```

### Apply Knob Style Flow

```
User selects knob element on canvas
    ↓
User opens Asset Library
    ↓
User clicks knob style thumbnail
    ↓
ElementsSlice.updateElement(id, {
  svgKnobStyleId: styleId,
  renderMode: 'svg'
})
    ↓
KnobRenderer re-renders with SVGKnobRenderer
    ↓
SVGKnobRenderer resolves style → asset → layers
    ↓
Renders composed SVG with value rotation
```

### Add Graphic Flow

```
User clicks "Add Graphic" in Asset Library
    ↓
Selects SVG asset (type: 'graphic')
    ↓
ElementsSlice.addElement(createImage({
  svgAssetId: asset.id,
  width: asset.width,
  height: asset.height,
  x: canvasCenterX,
  y: canvasCenterY
}))
    ↓
ImageRenderer checks for svgAssetId
    ↓
If svgAssetId exists, resolves asset and renders SVG
    ↓
Otherwise, renders src as usual
```

---

## State Management Patterns

### Normalized vs Denormalized

**Normalized (Recommended):**
```typescript
// Assets stored once by ID
svgAssets: {
  'asset-123': { id: 'asset-123', name: 'Blue Knob', ... }
}

// Elements reference by ID
elements: [
  { type: 'knob', svgKnobStyleId: 'style-456', ... }
]

// Styles reference assets by ID
knobStyles: {
  'style-456': { id: 'style-456', assetId: 'asset-123', ... }
}
```

**Benefits:**
- Single source of truth for asset data
- Updates to asset propagate to all elements automatically
- Efficient memory usage (no duplication)
- Supports shared styles across multiple elements

**Tradeoffs:**
- Requires ID resolution during rendering (3 lookups: element → style → asset)
- More complex selectors

### Selector Strategy

**Pattern 1: Component-level resolution (Recommended for v1.1)**
```typescript
// In SVGKnobRenderer
const getKnobStyle = useStore(state => state.getKnobStyle)
const getAsset = useStore(state => state.getAsset)

const knobStyle = getKnobStyle(config.svgKnobStyleId)
const asset = knobStyle ? getAsset(knobStyle.assetId) : undefined
```

**Pattern 2: Computed selectors (Future optimization)**
```typescript
// In AssetsSlice
getResolvedKnobStyle: (styleId: string) => {
  const style = get().knobStyles[styleId]
  const asset = style ? get().svgAssets[style.assetId] : undefined
  return { style, asset }
}
```

**Pattern 3: Zustand subscriptions (Advanced)**
```typescript
// Memoize resolved data to avoid re-renders
const resolvedStyle = useStore(
  useCallback(
    state => {
      const style = state.knobStyles[styleId]
      const asset = style ? state.svgAssets[style.assetId] : undefined
      return { style, asset }
    },
    [styleId]
  ),
  shallow  // Compare by reference
)
```

**Recommendation for v1.1:** Pattern 1 (simple, readable, sufficient performance)

### Undo/Redo Considerations

**What should be undoable:**
- ✅ Adding/removing assets (user created them)
- ✅ Adding/removing knob styles
- ✅ Applying knob style to element
- ✅ Creating SVG graphic element

**What should NOT be undoable:**
- ❌ Opening/closing Asset Library panel
- ❌ Filtering/searching assets
- ❌ Changing active tab in library

**Implementation:**
```typescript
// AssetsSlice is included in temporal store (default behavior)
// UI state for library panel should be local component state

function AssetLibraryPanel() {
  const [searchQuery, setSearchQuery] = useState('')  // Local, not in store
  const [activeTab, setActiveTab] = useState('knob')  // Local, not in store

  const svgAssets = useStore(state => state.svgAssets)  // Global, undoable
  const addAsset = useStore(state => state.addAsset)    // Global, undoable
}
```

---

## Rendering Architecture

### SVG Layer Composition

**Challenge:** Combine separate SVG layer strings into single interactive knob

**Approach: Inline SVG with transformations**

```typescript
function SVGKnobRenderer({ config }: SVGKnobRendererProps) {
  const getKnobStyle = useStore(state => state.getKnobStyle)
  const getAsset = useStore(state => state.getAsset)

  const style = getKnobStyle(config.svgKnobStyleId!)
  const asset = style ? getAsset(style.assetId) : null

  if (!asset || !asset.layers) return null

  // Calculate rotation angle based on value
  const valueAngle = calculateValueAngle(
    config.value,
    config.min,
    config.max,
    style.rotationRange || { start: -135, end: 135 }
  )

  return (
    <svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${asset.width} ${asset.height}`}
      style={{ overflow: 'visible' }}
    >
      {/* Static background layer */}
      {asset.layers.background && (
        <g dangerouslySetInnerHTML={{ __html: asset.layers.background }} />
      )}

      {/* Static track layer */}
      {asset.layers.track && (
        <g dangerouslySetInnerHTML={{ __html: asset.layers.track }} />
      )}

      {/* Value-based fill layer (uses mask) */}
      {asset.layers.fill && (
        <g
          dangerouslySetInnerHTML={{ __html: asset.layers.fill }}
          style={{
            clipPath: `url(#fillMask-${config.id})`
          }}
        />
      )}
      <defs>
        <clipPath id={`fillMask-${config.id}`}>
          {/* Generate arc path based on config.value */}
          <path d={generateArcPath(valueAngle)} />
        </clipPath>
      </defs>

      {/* Rotating indicator layer */}
      {asset.layers.indicator && (
        <g
          dangerouslySetInnerHTML={{ __html: asset.layers.indicator }}
          style={{
            transform: `rotate(${valueAngle}deg)`,
            transformOrigin: 'center'
          }}
        />
      )}

      {/* Optional glow layer (could animate with value) */}
      {asset.layers.glow && (
        <g
          dangerouslySetInnerHTML={{ __html: asset.layers.glow }}
          style={{
            opacity: config.value  // Fade in as value increases
          }}
        />
      )}
    </svg>
  )
}
```

**Security consideration:** `dangerouslySetInnerHTML` with user-uploaded SVGs
- **Mitigation:** Sanitize SVG on upload using library like DOMPurify
- **When:** In `parseSVGFile()` utility before storing in AssetsSlice
- **What to strip:** `<script>` tags, event handlers (onclick, onload), external references

### Color Override System

**Challenge:** Allow users to customize colors without modifying base asset

**Approach: CSS custom properties + SVG fill/stroke**

```typescript
// In asset layer SVG, use placeholders:
// <path fill="var(--knob-track-color, #333333)" />

// In SVGKnobRenderer, inject CSS variables:
<svg style={{
  '--knob-track-color': style.colorOverrides?.track || asset.defaultTrackColor,
  '--knob-indicator-color': style.colorOverrides?.indicator || asset.defaultIndicatorColor,
  // ...
}}>
  {/* Layers inherit CSS variables */}
</svg>
```

**Alternative:** Parse SVG, find fill/stroke attributes, replace values
- More complex, but works with any SVG
- Use DOMParser to parse SVG string, modify attributes, serialize back

---

## Build Order Recommendations

### Phase Structure

**Phase 1: Foundation (Week 1)**
- AssetsSlice implementation
- Asset CRUD actions
- Store composition update
- Unit tests for asset operations

**Phase 2: Import Pipeline (Week 1-2)**
- AssetImportWizard component
- Reuse/refactor SVGDesignMode for layer assignment
- SVG sanitization with DOMPurify
- Asset thumbnail generation

**Phase 3: Asset Library UI (Week 2)**
- AssetLibraryPanel layout
- Grid view with thumbnails
- Search/filter
- Context menu actions

**Phase 4: Graphic Elements (Week 2-3)**
- Extend ImageElementConfig
- Modify ImageRenderer with asset resolution
- Add "Add to Canvas" for graphics
- Test with various SVG files

**Phase 5: Knob Styles Storage (Week 3)**
- KnobStyle type and CRUD
- Default style generation from asset
- Style management in Asset Library

**Phase 6: SVG Knob Rendering (Week 3-4)**
- SVGKnobRenderer implementation
- Layer composition and rotation
- Color override system
- Performance testing

**Phase 7: Property Panel Integration (Week 4)**
- Rendering mode toggle in KnobProperties
- KnobStyleSelector component
- Conditional property visibility

**Phase 8: Export & Polish (Week 4-5)**
- JUCE export for SVG knobs
- Asset embedding in export bundle
- Documentation and examples

**Total estimate:** 4-5 weeks for complete SVG Import System

---

## Architecture Patterns to Follow

### Pattern 1: Slice Separation

**Principle:** Each Zustand slice owns a distinct domain

```typescript
// ✅ Good: Clear boundaries
CanvasSlice → Canvas properties only
ElementsSlice → Element CRUD only
AssetsSlice → Asset management only

// ❌ Bad: Mixed concerns
ElementsSlice → addElement() AND addAsset()  // Wrong slice
```

### Pattern 2: Normalized References

**Principle:** Store complex entities once, reference by ID

```typescript
// ✅ Good: Normalized
svgAssets: Record<string, SVGAsset>
elements: [{ svgKnobStyleId: 'style-123' }]

// ❌ Bad: Denormalized (duplicates asset data in each element)
elements: [{ svgKnobStyle: { /* full style object */ } }]
```

### Pattern 3: Progressive Enhancement

**Principle:** New features don't break existing functionality

```typescript
// ✅ Good: Optional SVG mode
interface KnobElementConfig {
  style: 'arc' | 'filled'  // Existing built-in styles
  svgKnobStyleId?: string  // Optional SVG style (NEW)
  renderMode?: 'builtin' | 'svg'  // Optional mode selector (NEW)
}

// ❌ Bad: Breaking change
interface KnobElementConfig {
  svgKnobStyleId: string  // Required, breaks existing knobs
}
```

### Pattern 4: Selector Encapsulation

**Principle:** Complex queries belong in slice, not components

```typescript
// ✅ Good: Query logic in slice
interface AssetsSlice {
  getAssetsByType: (type: 'knob' | 'graphic') => SVGAsset[]
  getKnobStylesForAsset: (assetId: string) => KnobStyle[]
}

// In component:
const knobAssets = useStore(state => state.getAssetsByType('knob'))

// ❌ Bad: Query logic in component
const knobAssets = useStore(state =>
  Object.values(state.svgAssets).filter(a => a.type === 'knob')
)
```

### Pattern 5: Renderer Composition

**Principle:** Delegate to specialized renderers, don't bloat existing ones

```typescript
// ✅ Good: Composition
function KnobRenderer({ config }) {
  if (config.renderMode === 'svg') return <SVGKnobRenderer config={config} />
  return <BuiltinKnobRenderer config={config} />  // Extract built-in logic
}

// ❌ Bad: Monolithic
function KnobRenderer({ config }) {
  if (config.renderMode === 'svg') {
    // ... 200 lines of SVG rendering
  } else {
    // ... 300 lines of built-in rendering
  }
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Inline Asset Data

**Problem:** Storing full SVG content in element config

```typescript
// ❌ Bad
interface KnobElementConfig {
  svgLayers: {
    track: string  // Full SVG markup (1000+ chars)
    indicator: string
  }
}
```

**Why bad:**
- Duplicates data across multiple elements using same asset
- Bloats project JSON file size
- Changes to asset don't propagate to elements
- Undo/redo stores massive SVG strings in history

**Solution:** Use ID references (Pattern 2)

### Anti-Pattern 2: Eager Rendering

**Problem:** Rendering all SVG layers upfront

```typescript
// ❌ Bad
useEffect(() => {
  Object.values(svgAssets).forEach(asset => {
    preRenderAsset(asset)  // Blocks UI
  })
}, [svgAssets])
```

**Why bad:**
- Blocks main thread during asset import
- Unnecessary work for assets not currently visible
- Memory overhead for cached renders

**Solution:** Lazy render on-demand when element is visible on canvas

### Anti-Pattern 3: Direct DOM Manipulation

**Problem:** Bypassing React for SVG updates

```typescript
// ❌ Bad
useEffect(() => {
  const indicatorEl = document.getElementById(`indicator-${config.id}`)
  indicatorEl.style.transform = `rotate(${valueAngle}deg)`
}, [valueAngle])
```

**Why bad:**
- Breaks React reconciliation
- Harder to debug
- Doesn't work with server-side rendering (future consideration)

**Solution:** Use React state/props for all DOM updates

### Anti-Pattern 4: Circular Dependencies

**Problem:** Asset references element that references asset

```typescript
// ❌ Bad
interface SVGAsset {
  usedByElements: string[]  // Array of element IDs
}

interface KnobElementConfig {
  svgAssetId: string  // Asset ID
}
```

**Why bad:**
- Creates circular update loop
- Complicates undo/redo logic
- Hard to maintain consistency

**Solution:** One-way references only (elements → assets, never assets → elements)

### Anti-Pattern 5: Magic Strings

**Problem:** Hard-coded layer type strings

```typescript
// ❌ Bad
if (asset.layers['indicator']) { ... }
if (layer.assignedType === 'track') { ... }
```

**Why bad:**
- Typos cause silent failures
- No autocomplete
- Hard to refactor

**Solution:** Use TypeScript enums or union types

```typescript
// ✅ Good
type SVGLayerType = 'indicator' | 'track' | 'thumb' | 'fill' | 'glow' | 'background'

if (asset.layers.indicator) { ... }
if (layer.assignedType === 'track') { ... }  // Type-safe
```

---

## Performance Considerations

### Asset Thumbnail Generation

**Challenge:** Rendering hundreds of SVG thumbnails in library

**Solutions:**
1. **Virtual scrolling** - Only render visible thumbnails (react-window)
2. **Memoization** - Cache rendered thumbnails with React.memo()
3. **Lazy loading** - Load thumbnails on-demand as user scrolls
4. **Web Workers** - Generate thumbnails off main thread (future)

### SVG Sanitization

**Challenge:** DOMPurify is CPU-intensive for large SVGs

**Solutions:**
1. **Async sanitization** - Use setTimeout to avoid blocking UI
2. **Progress indicator** - Show loading state during import
3. **Size limits** - Reject SVGs >500KB before parsing

### Canvas Re-renders

**Challenge:** Updating one knob value triggers re-render of all elements

**Current mitigation:** Zustand's selector pattern already prevents this
```typescript
// In BaseElement wrapper
const element = useStore(
  useCallback(state => state.elements.find(e => e.id === id), [id])
)
// Only re-renders when this specific element changes
```

**Additional optimization:** React.memo() on renderers
```typescript
export const SVGKnobRenderer = React.memo(({ config }: Props) => {
  // ...
})
```

---

## Open Questions & Future Research

### Question 1: SVG Animation Performance

**Context:** Rotating SVG layers via CSS transforms for interactive knobs

**Unknown:** Performance with 50+ animated knobs on canvas simultaneously

**Research needed:**
- Benchmark CSS transform vs Canvas2D vs WebGL rendering
- Test on lower-end hardware (integrated graphics)
- Profile Chrome DevTools during interaction

**Mitigation if slow:**
- Render static snapshot when not interacting
- Use Canvas2D for knobs, SVG for static graphics
- Implement "quality" setting (high/low detail)

### Question 2: Layer Transform Origin

**Context:** SVG indicator must rotate around knob center

**Unknown:** Reliable way to calculate transform-origin for arbitrary SVG layers

**Research needed:**
- Parse SVG viewBox to determine center
- Handle layers with transforms already applied
- Support off-center rotation (e.g., pivot at bottom of indicator)

**Current approach:** Assume center = (width/2, height/2)
**Fallback:** Manual adjustment in layer assignment step

### Question 3: Export Bundle Size

**Context:** Embedding multiple SVG assets in JUCE export

**Unknown:** Impact on plugin binary size with 20+ embedded SVGs

**Research needed:**
- Test export size with realistic asset library (10-30 items)
- Compare base64 embedding vs external SVG files
- Investigate JUCE resource compression

**Mitigation if too large:**
- SVG minification/optimization (SVGO)
- Option to exclude unused assets from export
- External asset loading from plugin resources

### Question 4: Color Override Limitations

**Context:** CSS custom properties approach requires SVG to use `var(--color)`

**Unknown:** How to handle SVGs exported from Figma/Illustrator (use hex colors)

**Research needed:**
- Survey real-world SVG exports from design tools
- Automated color replacement strategies (regex? AST parsing?)
- User education vs technical solution

**Current approach:** Document requirement in import wizard
**Fallback:** Parse and replace colors (complex but doable)

---

## References & Sources

### Zustand Patterns
- [Zustand Documentation - Slice Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern)
- [Zustand Architecture Patterns at Scale (Brainhub)](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)
- [State Management in 2026: Redux, Context API, and Modern Patterns (Nucamp)](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

### SVG Asset Management
- [A Guide to Using SVGs in React (LogRocket)](https://blog.logrocket.com/how-to-use-svgs-react/)
- [Transform SVGs into React Components with SVGR (IV Studio)](https://www.ivstudio.com/blog/svg-icon-library-in-react)
- [react-svg-assets (GitHub)](https://github.com/zauberware/react-svg-assets)

### React SVG Knob Components
- [rc-knob (GitHub)](https://github.com/eskimoblood/rc-knob)
- [react-dial-knob (GitHub)](https://github.com/pavelkukov/react-dial-knob)
- [React: Create a turnable knob component (DEV Community)](https://dev.to/syeo66/react-create-a-turnable-knob-component-5c85)

### Design System Asset Management
- [Components, styles, and shared library best practices (Figma)](https://www.figma.com/best-practices/components-styles-and-shared-libraries/)
- [The Complete Guide to Design Systems in Figma (2026 Edition)](https://medium.com/@EmiliaBiblioKit/the-world-of-design-systems-is-no-longer-just-about-components-and-libraries-its-about-5beecc0d21cb)
- [Guide to libraries in Figma (Figma Help Center)](https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma)

### Normalized State Patterns
- [Normalizing State Shape (Redux Docs)](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
- [Large-Scale React (Zustand) & Nest.js Project Structure (Medium)](https://medium.com/@itsspss/large-scale-react-zustand-nest-js-project-structure-and-best-practices-93397fb473f4)

---

**Document confidence:** HIGH
**Primary research methods:** WebSearch (verified patterns), existing codebase analysis, Zustand documentation
**Validation status:** Patterns are battle-tested in production apps (per Brainhub article), compatible with existing v1.0 architecture
