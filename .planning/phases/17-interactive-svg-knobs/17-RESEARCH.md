# Phase 17: Interactive SVG Knobs - Research

**Researched:** 2026-01-26
**Domain:** SVG layer parsing, reusable style system, rotation animation, color attribute replacement
**Confidence:** HIGH

## Summary

This phase implements interactive SVG knobs where users import custom knob designs (SVG files with multiple layers), map layers to functional roles (indicator, track, arc, glow, shadow), save as reusable "Knob Styles" in project state, and apply styles to existing knob elements with per-instance color overrides. The knob indicator rotates based on parameter value (0-1), with configurable rotation range (default 270°). Multiple knobs can share the same style.

The standard approach combines existing patterns from Phase 14 (SVG sanitization), Phase 15 (asset storage), and Phase 16 (SVG rendering) with new concepts: (1) layer extraction via DOMParser + querySelectorAll with id/class selectors, (2) style storage as distinct from assets (assets are raw SVG, styles are mapped interpretations), (3) rotation animation via CSS transform with calculated angle from parameter value, (4) color overrides via setAttribute() to replace fill/stroke attributes in cloned SVG DOM.

User decisions from CONTEXT.md constrain the research: hybrid auto-detect + confirmation dialog for layer mapping, 5 layer roles (indicator/track/arc/glow/shadow), configurable rotation range per style (default 270° = -135° to +135°), property panel dropdown for style selection (text-only, no thumbnails), SVG attribute replacement for color overrides (not CSS vars), and "Manage styles..." link in property panel.

**Primary recommendation:** Store knob styles as separate array in project state (not in assets array), extending existing Zustand + zundo pattern. Parse imported SVG with DOMParser, auto-detect layers by id/class naming conventions (indicator, track, arc, glow, shadow), show confirmation dialog for adjustments. Render via SafeSVG with CSS transform rotation calculated from `(value - min) / (max - min) * rotationRange + minAngle`. Override colors by cloning SVG DOM, using setAttribute('fill'/stroke'), and serializing back to string before passing to SafeSVG.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| DOMParser | Built-in Web API | Extract SVG layers by id/class | Standard for SVG parsing, synchronous, handles namespaces |
| Zustand | 5.0.10 | Store knob styles in state | Already used for assets, elements, canvas config |
| zundo (temporal) | Already integrated | Undo/redo for style operations | Already wraps store, styles should be undoable |
| SafeSVG | Custom component | Render sanitized knob SVGs | Already implemented (Phase 14), defense-in-depth |
| CSS transform | Built-in CSS | Rotate indicator layer | Hardware-accelerated, 60fps smooth on 50+ knobs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| querySelectorAll | Built-in DOM API | Select layers by id or class | Use with DOMParser to find indicator/track/arc layers |
| setAttribute | Built-in DOM API | Replace fill/stroke colors | Use to override colors per knob instance |
| XMLSerializer | Built-in Web API | Convert modified DOM back to string | Use after color overrides to get SVG string for SafeSVG |
| react-hot-toast | Already installed | Validation messages | Use for layer mapping errors (e.g., "No indicator layer found") |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate styles array | Store styles in assets array with 'knobStyle' category | Styles are interpretations (layer mappings), not raw assets. Separate array is clearer. |
| CSS variables for colors | Direct fill/stroke attribute replacement | CSS vars require stylesheet injection, attribute replacement is simpler for inline SVG |
| Regex for layer detection | DOMParser + querySelectorAll | DOMParser handles namespaces, malformed SVG, CDATA - regex is fragile |
| Canvas rendering | CSS transform + SafeSVG | CSS transforms are hardware-accelerated, simpler, WYSIWYG matches export |
| Store rotation in style | Calculate rotation from value dynamically | Rotation is derived state (value → angle), not stored state |

**Installation:**
```bash
# No new dependencies required - all libraries already available
# Existing: DOMParser (browser built-in), Zustand, zundo, SafeSVG, CSS transforms
```

## Architecture Patterns

### Recommended Knob Style Storage Structure
```typescript
// Add to project state (Zustand store)
export interface KnobStyle {
  id: string                    // crypto.randomUUID()
  name: string                  // User-editable name
  svgContent: string            // Sanitized original SVG

  // Layer Mappings (element id or class names from SVG)
  layers: {
    indicator?: string          // Required - rotates with value
    track?: string             // Optional - background arc (static)
    arc?: string               // Optional - value fill arc (clips/fills)
    glow?: string              // Optional - intensity by value
    shadow?: string            // Optional - intensity by value
  }

  // Rotation Configuration
  minAngle: number              // Default -135 (degrees from top)
  maxAngle: number              // Default 135 (270° total range)

  // Optional: Position offset for indicator
  // Some knobs have indicators that move radially as they rotate
  indicatorOffset?: {
    enabled: boolean
    startRadius: number         // Pixels from center at min value
    endRadius: number           // Pixels from center at max value
  }

  createdAt: number             // Timestamp (Date.now())
}

// Add to store
export interface KnobStylesSlice {
  knobStyles: KnobStyle[]
  addKnobStyle: (style: Omit<KnobStyle, 'id' | 'createdAt'>) => void
  removeKnobStyle: (id: string) => void
  updateKnobStyle: (id: string, updates: Partial<KnobStyle>) => void
  getKnobStyle: (id: string) => KnobStyle | undefined
}
```

### Pattern 1: SVG Layer Extraction with Auto-Detection
**What:** Parse imported SVG, detect layers by naming convention, show confirmation dialog
**When to use:** When user imports SVG for knob style creation
**Example:**
```typescript
// Source: MDN DOMParser, research on Figma SVG export conventions
// Naming conventions: id="indicator", class="track", etc.

interface DetectedLayers {
  indicator: string[]  // List of potential indicator elements
  track: string[]
  arc: string[]
  glow: string[]
  shadow: string[]
  unmapped: string[]   // Elements that don't match conventions
}

function detectKnobLayers(svgContent: string): DetectedLayers {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid SVG file')
  }

  const detected: DetectedLayers = {
    indicator: [],
    track: [],
    arc: [],
    glow: [],
    shadow: [],
    unmapped: [],
  }

  // Query all elements with id or class
  const allElements = doc.querySelectorAll('[id], [class]')

  allElements.forEach((el) => {
    const id = el.getAttribute('id') || ''
    const classList = el.getAttribute('class')?.split(/\s+/) || []
    const searchText = [id, ...classList].join(' ').toLowerCase()

    // Match naming conventions (case-insensitive)
    if (searchText.includes('indicator') || searchText.includes('pointer') || searchText.includes('needle')) {
      detected.indicator.push(id || classList[0])
    } else if (searchText.includes('track') || searchText.includes('background')) {
      detected.track.push(id || classList[0])
    } else if (searchText.includes('arc') || searchText.includes('progress') || searchText.includes('fill')) {
      detected.arc.push(id || classList[0])
    } else if (searchText.includes('glow')) {
      detected.glow.push(id || classList[0])
    } else if (searchText.includes('shadow')) {
      detected.shadow.push(id || classList[0])
    } else {
      detected.unmapped.push(id || classList[0] || 'unnamed')
    }
  })

  return detected
}

// Show confirmation dialog with detected mappings
function showLayerMappingDialog(detected: DetectedLayers) {
  // User can:
  // 1. Accept auto-detected mappings
  // 2. Manually assign unmapped layers to roles
  // 3. Mark layers as "exclude" (not rendered)
  // 4. Cancel import
}
```

### Pattern 2: Knob Style Application to Element
**What:** Extend KnobElementConfig with optional styleId, preserve value/min/max/parameterId
**When to use:** User selects style from property panel dropdown
**Example:**
```typescript
// Add to types/elements.ts
export interface KnobElementConfig extends BaseElementConfig {
  type: 'knob'

  // ... existing properties (value, min, max, diameter, etc.) ...

  // NEW: Optional style reference
  styleId?: string  // If undefined, render default CSS knob

  // NEW: Per-instance color overrides (only used when styleId is set)
  colorOverrides?: {
    indicator?: string
    track?: string
    arc?: string
    glow?: string
    shadow?: string
  }
}

// Backwards compatible - existing knobs without styleId render CSS gradient knob
```

### Pattern 3: Rotation Calculation
**What:** Convert normalized value (0-1) to rotation angle based on style's rotation range
**When to use:** Rendering knob indicator with style applied
**Example:**
```typescript
// Source: Existing KnobRenderer polarToCartesian pattern, extended for custom range

function calculateKnobRotation(
  value: number,
  min: number,
  max: number,
  style: KnobStyle
): number {
  // Normalize value to 0-1 range
  const normalizedValue = (value - min) / (max - min)

  // Map to rotation range
  const rotationRange = style.maxAngle - style.minAngle
  const angle = style.minAngle + normalizedValue * rotationRange

  return angle
}

// Usage in renderer
const indicatorAngle = calculateKnobRotation(
  config.value,
  config.min,
  config.max,
  knobStyle
)

// Apply as CSS transform
<div style={{ transform: `rotate(${indicatorAngle}deg)` }}>
  {/* Indicator layer SVG */}
</div>
```

### Pattern 4: Color Override via Attribute Replacement
**What:** Clone SVG DOM, replace fill/stroke attributes, serialize back to string
**When to use:** Applying per-instance color overrides to knob style layers
**Why:** SVG inline styles and presentation attributes require direct manipulation
**Example:**
```typescript
// Source: MDN DOM APIs - setAttribute, XMLSerializer
// User decision: "SVG attribute replacement (not CSS vars)"

function applyColorOverrides(
  svgContent: string,
  layerSelector: string,
  color: string
): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Find layer by id or class
  const layer = doc.querySelector(`#${layerSelector}, .${layerSelector}`)

  if (!layer) {
    console.warn(`Layer not found: ${layerSelector}`)
    return svgContent
  }

  // Replace fill and stroke attributes
  // Check what attributes exist to preserve original intent
  if (layer.hasAttribute('fill')) {
    layer.setAttribute('fill', color)
  }
  if (layer.hasAttribute('stroke')) {
    layer.setAttribute('stroke', color)
  }

  // Also update child elements (for groups)
  const children = layer.querySelectorAll('[fill], [stroke]')
  children.forEach((child) => {
    if (child.hasAttribute('fill')) {
      child.setAttribute('fill', color)
    }
    if (child.hasAttribute('stroke')) {
      child.setAttribute('stroke', color)
    }
  })

  // Serialize back to string
  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc)
}

// Usage: Apply all color overrides sequentially
let modifiedSVG = style.svgContent
if (config.colorOverrides?.indicator) {
  modifiedSVG = applyColorOverrides(
    modifiedSVG,
    style.layers.indicator!,
    config.colorOverrides.indicator
  )
}
// ... repeat for track, arc, glow, shadow
```

### Pattern 5: Layer-Based Rendering
**What:** Render each layer separately with appropriate transforms/animations
**When to use:** KnobRenderer when styleId is present
**Example:**
```typescript
// Conceptual structure - actual implementation may vary

export function KnobRenderer({ config }: KnobRendererProps) {
  const getKnobStyle = useStore((state) => state.getKnobStyle)

  // If no style, render default CSS knob (existing behavior)
  if (!config.styleId) {
    return <CSSKnobRenderer config={config} />
  }

  const style = getKnobStyle(config.styleId)
  if (!style) {
    // Style deleted - show placeholder
    return <div>Style not found</div>
  }

  // Apply color overrides
  let svgContent = style.svgContent
  if (config.colorOverrides) {
    // Apply overrides (Pattern 4)
    svgContent = applyAllColorOverrides(svgContent, style.layers, config.colorOverrides)
  }

  // Calculate rotation
  const indicatorAngle = calculateKnobRotation(config.value, config.min, config.max, style)

  // Render strategy: Extract layers and render separately
  // This allows independent transforms (indicator rotates, others static)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track layer - static */}
      {style.layers.track && (
        <SafeSVG content={extractLayer(svgContent, style.layers.track)} />
      )}

      {/* Arc layer - animated by value (clip-path or opacity) */}
      {style.layers.arc && (
        <div style={{ opacity: config.value }}>
          <SafeSVG content={extractLayer(svgContent, style.layers.arc)} />
        </div>
      )}

      {/* Indicator layer - rotates */}
      {style.layers.indicator && (
        <div
          style={{
            transform: `rotate(${indicatorAngle}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <SafeSVG content={extractLayer(svgContent, style.layers.indicator)} />
        </div>
      )}

      {/* Glow layer - intensity by value */}
      {style.layers.glow && (
        <div style={{ opacity: config.value * 0.5 + 0.5 }}>
          <SafeSVG content={extractLayer(svgContent, style.layers.glow)} />
        </div>
      )}

      {/* Shadow layer - static or intensity by value */}
      {style.layers.shadow && (
        <SafeSVG content={extractLayer(svgContent, style.layers.shadow)} />
      )}
    </div>
  )
}

// Helper: Extract single layer from SVG
function extractLayer(svgContent: string, layerSelector: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  const layer = doc.querySelector(`#${layerSelector}, .${layerSelector}`)
  if (!layer) return ''

  // Clone layer and wrap in new SVG element with same viewBox
  const svgEl = doc.querySelector('svg')
  const viewBox = svgEl?.getAttribute('viewBox') || '0 0 100 100'

  const newSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
  newSvg.setAttribute('viewBox', viewBox)
  newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  newSvg.appendChild(layer.cloneNode(true))

  const serializer = new XMLSerializer()
  return serializer.serializeToString(newSvg)
}
```

### Pattern 6: Property Panel Style Selection
**What:** Dropdown showing style names, "Manage styles..." link, color override swatches
**When to use:** KnobProperties component when knob element is selected
**Example:**
```typescript
// Source: Existing SvgGraphicProperties dropdown pattern

export function KnobProperties({ element, onUpdate }: KnobPropertiesProps) {
  const knobStyles = useStore((state) => state.knobStyles)
  const getKnobStyle = useStore((state) => state.getKnobStyle)

  return (
    <>
      {/* Knob Style Selection */}
      <PropertySection title="Knob Style">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Style</label>
          <select
            value={element.styleId || ''}
            onChange={(e) => onUpdate({ styleId: e.target.value || undefined })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="">Default (CSS Gradient)</option>
            {knobStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>

        {/* Manage Styles Link */}
        <button
          onClick={() => {
            // Open style management dialog (import, rename, delete)
          }}
          className="w-full mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors text-left"
        >
          Manage styles...
        </button>
      </PropertySection>

      {/* Color Overrides - only show when style is selected */}
      {element.styleId && (
        <PropertySection title="Color Overrides">
          {getKnobStyle(element.styleId)?.layers.indicator && (
            <ColorInput
              label="Indicator"
              value={element.colorOverrides?.indicator || '#ffffff'}
              onChange={(color) =>
                onUpdate({
                  colorOverrides: {
                    ...element.colorOverrides,
                    indicator: color,
                  },
                })
              }
            />
          )}

          {getKnobStyle(element.styleId)?.layers.track && (
            <ColorInput
              label="Track"
              value={element.colorOverrides?.track || '#666666'}
              onChange={(color) =>
                onUpdate({
                  colorOverrides: {
                    ...element.colorOverrides,
                    track: color,
                  },
                })
              }
            />
          )}

          {/* ... similar for arc, glow, shadow ... */}
        </PropertySection>
      )}

      {/* Existing knob properties - value, min, max, etc. */}
      {/* ... */}
    </>
  )
}
```

### Pattern 7: Style Management Dialog
**What:** Modal dialog for importing new styles, renaming, deleting with usage check
**When to use:** User clicks "Manage styles..." link in property panel
**Example:**
```typescript
// Similar to Asset Library pattern from Phase 15

export function ManageKnobStylesDialog({ onClose }: { onClose: () => void }) {
  const knobStyles = useStore((state) => state.knobStyles)
  const removeKnobStyle = useStore((state) => state.removeKnobStyle)
  const elements = useStore((state) => state.elements)

  // Check usage before deletion
  const getStyleUsage = (styleId: string) => {
    return elements.filter(
      (el) => el.type === 'knob' && el.styleId === styleId
    ).length
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Manage Knob Styles</h2>

        {/* Import New Style Button */}
        <button
          onClick={() => {
            // Show layer mapping dialog for new import
          }}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
        >
          + Import New Knob Style
        </button>

        {/* Styles List */}
        <div className="space-y-2">
          {knobStyles.map((style) => {
            const usage = getStyleUsage(style.id)
            return (
              <div key={style.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div>
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs text-gray-400">
                    Rotation: {style.minAngle}° to {style.maxAngle}°
                    {usage > 0 && ` • Used by ${usage} knob${usage > 1 ? 's' : ''}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Show rename dialog
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      if (usage > 0) {
                        // Show warning: "This style is used by X knobs"
                      } else {
                        removeKnobStyle(style.id)
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={onClose} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2">
          Close
        </button>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Storing styles in assets array:** Styles are interpretations (layer mappings), not raw assets. Separate array is clearer.
- **Animation via JavaScript setInterval:** Use CSS transforms, not JS loops. CSS is hardware-accelerated, smoother.
- **Forgetting to sanitize after color overrides:** Always pass modified SVG through SafeSVG before render.
- **Mutating original style.svgContent:** Clone DOM before modifications, never mutate stored state directly.
- **Using CSS variables for color overrides:** Inline SVG requires direct attribute manipulation, CSS vars won't cascade.
- **Assuming all layers exist:** Check for undefined before rendering/extracting layers. Not all styles have all 5 roles.
- **Hardcoding 270° rotation:** Use style's minAngle/maxAngle, configurable per style (supports 360° continuous, custom ranges).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG parsing | Regex-based layer extraction | DOMParser + querySelectorAll | Handles namespaces, CDATA, malformed SVG, browser-native |
| Layer name matching | Exact string comparison | Case-insensitive includes() with synonyms | Users may use "pointer" vs "indicator", "bg" vs "track" |
| SVG modification | String concatenation/replacement | Clone DOM + setAttribute + XMLSerializer | Preserves structure, handles edge cases, maintains validity |
| Rotation animation | JavaScript animation loop | CSS transform with dynamic value | Hardware-accelerated, 60fps, no JS overhead |
| Color picker UI | Custom color input | Existing ColorInput component | Already styled, consistent with property panel, reusable |
| Style storage | LocalStorage or custom persistence | Zustand + zundo + project JSON | Already integrated, undoable, version-controlled |
| Layer visibility | CSS display:none | Not rendering layer at all | Simpler, no DOM manipulation, better performance |

**Key insight:** All infrastructure exists (SVG sanitization, state management, undo/redo, property panels, color inputs). This phase is about composition: parse layers from imported SVG, store mappings as styles, render layers separately with transforms, override colors via DOM manipulation. The temptation is to build custom solutions (regex parsing, manual animation, custom persistence), but existing patterns handle edge cases that custom code will miss.

## Common Pitfalls

### Pitfall 1: Layer Extraction Loses SVG Context
**What goes wrong:** Extracting layer element without preserving viewBox causes misaligned rendering.
**Why it happens:** Layer element's coordinates are relative to original SVG's viewBox. Wrapping in new `<svg>` without viewBox breaks positioning.
**How to avoid:** Always copy original SVG's viewBox attribute to new wrapper SVG when extracting layers.
**Warning signs:** Indicator appears in wrong position, layers don't align, scaling is incorrect.

### Pitfall 2: Transform Origin Wrong for Rotation
**What goes wrong:** Indicator rotates around top-left corner instead of knob center.
**Why it happens:** Forgetting `transformOrigin: 'center center'` or not calculating correct center point for extracted layer.
**How to avoid:** Always set `transformOrigin: 'center center'` on indicator wrapper div.
**Warning signs:** Indicator appears to orbit around knob instead of rotating in place.

### Pitfall 3: Color Overrides Don't Cascade to Children
**What goes wrong:** Only parent element changes color, children (paths, circles) retain original colors.
**Why it happens:** Not recursively applying color overrides to child elements in groups.
**How to avoid:** After setting parent fill/stroke, query all children with `[fill], [stroke]` and update them too.
**Warning signs:** Some parts of layer change color, others don't. Partial color override.

### Pitfall 4: Performance with 50+ Animated Knobs
**What goes wrong:** UI becomes sluggish when many knobs animate simultaneously (parameter automation in DAW).
**Why it happens:** Too many DOM manipulations, excessive re-renders, not leveraging CSS transforms.
**How to avoid:** Use CSS transforms exclusively (hardware-accelerated). Memoize SVG content. Avoid re-sanitizing on every render (memoize with useMemo).
**Warning signs:** Dropped frames when moving multiple knobs, sluggish UI during playback.

### Pitfall 5: Missing Layer Handling Crashes Renderer
**What goes wrong:** Trying to render/extract layer that doesn't exist in style (e.g., style has no glow layer).
**Why it happens:** Not checking for undefined before accessing `style.layers.glow`.
**How to avoid:** Always use optional chaining or conditional checks: `{style.layers.glow && <Layer />}`.
**Warning signs:** "Cannot read property of undefined" errors, renderer crashes.

### Pitfall 6: Flat SVG (No Layers) Rejected
**What goes wrong:** User imports single-path SVG (logo, simple icon), import fails because no layers detected.
**Why it happens:** Auto-detection assumes layered SVG. Flat SVG has no id/class attributes to detect.
**How to avoid:** User decision: "Claude's discretion on flat SVG handling." Option 1: Treat entire SVG as indicator. Option 2: Reject with message "Knob styles require layered SVG." **Recommendation:** Treat as indicator (more forgiving), show warning in confirmation dialog.
**Warning signs:** Users complain "can't import my knob design" when SVG is valid but flat.

### Pitfall 7: Rotation Range Configuration Confusion
**What goes wrong:** User sets minAngle=0, maxAngle=270, expects 0° to 270° range, but renders -135° to 135°.
**Why it happens:** Confusing absolute angles vs. range. SVG coordinate system has 0° at 3 o'clock, but knobs typically start at 6 o'clock (-90°).
**How to avoid:** Document angle convention clearly: "0° is top of knob, positive clockwise." Default 270° range is -135° to +135° (typical for audio plugins).
**Warning signs:** Knobs start/end at unexpected positions, user reports "rotation is backwards."

### Pitfall 8: Color Override State Explosion
**What goes wrong:** Storing full colorOverrides object for every knob instance (5 colors × 50 knobs = 250 stored values).
**Why it happens:** Not using undefined for "no override" - storing default colors explicitly.
**How to avoid:** Only store overrides when user explicitly changes color. If undefined, use original SVG color. Sparse storage.
**Warning signs:** Project JSON file bloated, undo history overwhelmed with trivial color changes.

## Code Examples

Verified patterns from official sources:

### SVG Layer Detection with Naming Conventions
```typescript
// Source: MDN DOMParser, research on Figma/Illustrator SVG export conventions
// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser

function detectKnobLayers(svgContent: string): DetectedLayers {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid SVG file')
  }

  const detected: DetectedLayers = {
    indicator: [],
    track: [],
    arc: [],
    glow: [],
    shadow: [],
    unmapped: [],
  }

  // Query all elements with id or class
  const allElements = doc.querySelectorAll('*')

  allElements.forEach((el) => {
    const id = el.getAttribute('id') || ''
    const classList = el.getAttribute('class')?.split(/\s+/) || []
    const searchText = [id, ...classList].join(' ').toLowerCase()

    // Skip SVG root and defs
    if (el.tagName === 'svg' || el.tagName === 'defs') return

    // Match naming conventions with synonyms
    if (/indicator|pointer|needle|hand/.test(searchText)) {
      detected.indicator.push(id || classList[0] || `unnamed-${Math.random().toString(36).slice(2, 7)}`)
    } else if (/track|background|bg|base/.test(searchText)) {
      detected.track.push(id || classList[0] || `unnamed-${Math.random().toString(36).slice(2, 7)}`)
    } else if (/arc|progress|fill|value/.test(searchText)) {
      detected.arc.push(id || classList[0] || `unnamed-${Math.random().toString(36).slice(2, 7)}`)
    } else if (/glow|shine|highlight/.test(searchText)) {
      detected.glow.push(id || classList[0] || `unnamed-${Math.random().toString(36).slice(2, 7)}`)
    } else if (/shadow|depth/.test(searchText)) {
      detected.shadow.push(id || classList[0] || `unnamed-${Math.random().toString(36).slice(2, 7)}`)
    } else if (id || classList.length > 0) {
      // Element has identifier but doesn't match conventions
      detected.unmapped.push(id || classList[0])
    }
  })

  return detected
}
```

### Color Override via DOM Manipulation
```typescript
// Source: MDN DOM APIs - setAttribute, XMLSerializer
// https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
// https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer

function applyColorOverride(
  svgContent: string,
  layerIdentifier: string,
  color: string
): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Try to find by id first, then by class
  let layer = doc.querySelector(`#${layerIdentifier}`)
  if (!layer) {
    layer = doc.querySelector(`.${layerIdentifier}`)
  }

  if (!layer) {
    console.warn(`Layer not found: ${layerIdentifier}`)
    return svgContent
  }

  // Apply color to layer and all descendants with fill or stroke
  const applyToElement = (el: Element) => {
    // Replace existing fill/stroke attributes
    if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
      el.setAttribute('fill', color)
    }
    if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
      el.setAttribute('stroke', color)
    }

    // Also check style attribute for inline styles
    const style = el.getAttribute('style')
    if (style) {
      const newStyle = style
        .replace(/fill:\s*[^;]+/g, `fill: ${color}`)
        .replace(/stroke:\s*[^;]+/g, `stroke: ${color}`)
      el.setAttribute('style', newStyle)
    }
  }

  // Apply to layer itself
  applyToElement(layer)

  // Apply to all children
  const children = layer.querySelectorAll('*')
  children.forEach((child) => applyToElement(child))

  // Serialize back to string
  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc)
}

// Apply all color overrides sequentially
function applyAllColorOverrides(
  svgContent: string,
  layers: KnobStyle['layers'],
  overrides: KnobElementConfig['colorOverrides']
): string {
  let result = svgContent

  if (overrides?.indicator && layers.indicator) {
    result = applyColorOverride(result, layers.indicator, overrides.indicator)
  }
  if (overrides?.track && layers.track) {
    result = applyColorOverride(result, layers.track, overrides.track)
  }
  if (overrides?.arc && layers.arc) {
    result = applyColorOverride(result, layers.arc, overrides.arc)
  }
  if (overrides?.glow && layers.glow) {
    result = applyColorOverride(result, layers.glow, overrides.glow)
  }
  if (overrides?.shadow && layers.shadow) {
    result = applyColorOverride(result, layers.shadow, overrides.shadow)
  }

  return result
}
```

### Layer Extraction for Independent Rendering
```typescript
// Source: MDN DOM APIs - querySelector, createElementNS, XMLSerializer
// Extract single layer from SVG while preserving viewBox context

function extractLayer(svgContent: string, layerIdentifier: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Find layer by id or class
  let layer = doc.querySelector(`#${layerIdentifier}`)
  if (!layer) {
    layer = doc.querySelector(`.${layerIdentifier}`)
  }

  if (!layer) {
    console.warn(`Layer not found: ${layerIdentifier}`)
    return ''
  }

  // Get original SVG's viewBox for correct coordinate system
  const originalSvg = doc.querySelector('svg')
  const viewBox = originalSvg?.getAttribute('viewBox') || '0 0 100 100'
  const width = originalSvg?.getAttribute('width')
  const height = originalSvg?.getAttribute('height')

  // Create new SVG wrapper with same viewBox
  const newSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
  newSvg.setAttribute('viewBox', viewBox)
  newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  // Copy width/height if present (preserves aspect ratio)
  if (width) newSvg.setAttribute('width', width)
  if (height) newSvg.setAttribute('height', height)

  // Clone layer (not move - preserve original structure)
  const clonedLayer = layer.cloneNode(true) as Element
  newSvg.appendChild(clonedLayer)

  // Serialize to string
  const serializer = new XMLSerializer()
  return serializer.serializeToString(newSvg)
}
```

### KnobStyle Zustand Slice
```typescript
// Source: Existing patterns from assetsSlice.ts and elementsSlice.ts

export interface KnobStylesSlice {
  // State
  knobStyles: KnobStyle[]

  // Actions
  addKnobStyle: (style: Omit<KnobStyle, 'id' | 'createdAt'>) => void
  removeKnobStyle: (id: string) => void
  updateKnobStyle: (id: string, updates: Partial<KnobStyle>) => void
  getKnobStyle: (id: string) => KnobStyle | undefined
}

export const createKnobStylesSlice: StateCreator<KnobStylesSlice, [], [], KnobStylesSlice> = (
  set,
  get
) => ({
  knobStyles: [],

  addKnobStyle: (styleData) =>
    set((state) => ({
      knobStyles: [
        ...state.knobStyles,
        {
          ...styleData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
      ],
    })),

  removeKnobStyle: (id) =>
    set((state) => ({
      knobStyles: state.knobStyles.filter((style) => style.id !== id),
    })),

  updateKnobStyle: (id, updates) =>
    set((state) => ({
      knobStyles: state.knobStyles.map((style) =>
        style.id === id ? { ...style, ...updates } : style
      ),
    })),

  getKnobStyle: (id) => {
    return get().knobStyles.find((style) => style.id === id)
  },
})

// Add to combined store
export type Store = CanvasSlice & ViewportSlice & ElementsSlice & TemplateSlice & AssetsSlice & KnobStylesSlice

// Update temporal partialize to include knobStyles in undo history
// (Styles should be undoable like assets)
```

### Rotation Animation with CSS Transform
```typescript
// Source: Existing KnobRenderer rotation logic, extended for custom range
// CSS transform is hardware-accelerated, 60fps smooth

export function StyledKnobRenderer({ config }: { config: KnobElementConfig }) {
  const getKnobStyle = useStore((state) => state.getKnobStyle)

  if (!config.styleId) {
    // Render default CSS knob (existing behavior)
    return <DefaultKnobRenderer config={config} />
  }

  const style = getKnobStyle(config.styleId)
  if (!style) {
    return <div>Style not found</div>
  }

  // Calculate rotation angle
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const rotationRange = style.maxAngle - style.minAngle
  const indicatorAngle = style.minAngle + normalizedValue * rotationRange

  // Apply color overrides
  let svgContent = style.svgContent
  if (config.colorOverrides) {
    svgContent = applyAllColorOverrides(svgContent, style.layers, config.colorOverrides)
  }

  // Extract layers for independent rendering
  const trackSVG = style.layers.track ? extractLayer(svgContent, style.layers.track) : null
  const arcSVG = style.layers.arc ? extractLayer(svgContent, style.layers.arc) : null
  const indicatorSVG = style.layers.indicator ? extractLayer(svgContent, style.layers.indicator) : null
  const glowSVG = style.layers.glow ? extractLayer(svgContent, style.layers.glow) : null
  const shadowSVG = style.layers.shadow ? extractLayer(svgContent, style.layers.shadow) : null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static background */}
      {trackSVG && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={trackSVG} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Shadow - static */}
      {shadowSVG && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={shadowSVG} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Arc - animated by value (opacity or clip-path) */}
      {arcSVG && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: normalizedValue, // Simple approach: fade in as value increases
            transition: 'opacity 0.05s ease-out', // Smooth animation
          }}
        >
          <SafeSVG content={arcSVG} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator - rotates */}
      {indicatorSVG && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${indicatorAngle}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out', // Smooth rotation
          }}
        >
          <SafeSVG content={indicatorSVG} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Glow - intensity by value */}
      {glowSVG && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: normalizedValue * 0.7 + 0.3, // Range 30% to 100%
            transition: 'opacity 0.05s ease-out',
          }}
        >
          <SafeSVG content={glowSVG} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Bitmap knob skins (filmstrip) | SVG with separate layers | 2015+ (SVG maturity) | Scalable, theme-able, smaller file size |
| JavaScript animation loops | CSS transforms | 2014+ (hardware acceleration) | 60fps smooth, lower CPU, works with 50+ knobs |
| Hardcoded knob appearance | Reusable style system | Design system trend (2018+) | Single asset, many instances, consistent UI |
| Manual color theming | Per-instance color overrides | Modern plugin UIs (2020+) | Flexibility without duplicating assets |
| 270° rotation only | Configurable rotation range | User requirement (Phase 17) | Supports 360° continuous, custom ranges |
| String manipulation for SVG | DOMParser + DOM APIs | Always recommended | Robust, handles edge cases, browser-native |

**Deprecated/outdated:**
- **Filmstrip knob skins:** Bitmap approach, inflexible, large file sizes. SVG is standard now.
- **Canvas-based knob rendering:** Complex, not WYSIWYG for export. HTML/CSS rendering is simpler.
- **Inline animation JavaScript:** Replaced by CSS transforms. Hardware-accelerated, declarative.
- **Single monolithic SVG:** Modern approach extracts layers for independent animation/styling.

## Open Questions

Things that couldn't be fully resolved:

1. **Flat SVG handling (no layers detected)**
   - What we know: User decision marked as "Claude's discretion"
   - What's unclear: Reject import or treat entire SVG as indicator layer?
   - Recommendation: Treat as indicator (more forgiving). Show warning in confirmation dialog: "Single-layer SVG detected. Treating as indicator. For best results, import layered SVG."

2. **Arc animation strategy**
   - What we know: User decision marked as "Claude's discretion based on common knob patterns"
   - What's unclear: Opacity fade, clip-path animation, or visibility toggle?
   - Recommendation: Opacity fade (simplest). `opacity: normalizedValue` creates progressive fill effect. More complex approaches (clip-path, arc drawing) are over-engineering for v1.

3. **Indicator position offset (radial movement)**
   - What we know: User mentioned "some knobs have indicators that also move radially"
   - What's unclear: How common is this? Worth implementing in v1?
   - Recommendation: Defer to future enhancement. Most knobs only rotate. Add `indicatorOffset` field to KnobStyle for future use (already in schema above), but don't implement rendering logic in Phase 17.

4. **Style thumbnail previews**
   - What we know: User decision: "Text-only dropdown (no thumbnails)"
   - What's unclear: Should "Manage styles..." dialog show thumbnails?
   - Recommendation: No thumbnails anywhere in v1. Text-only is simpler, faster. Thumbnails can be added in future polish phase if users request.

5. **Performance optimization threshold**
   - What we know: STATE.md mentions "Performance with 50+ animated knobs may need optimization"
   - What's unclear: What optimization strategy? Virtual scrolling, layer caching, requestAnimationFrame throttling?
   - Recommendation: Start with CSS transforms (already performant). If 50+ knobs are sluggish, add useMemo to cache layer extraction. Don't optimize prematurely.

6. **Color override UI for missing layers**
   - What we know: Not all styles have all 5 layer roles (e.g., no glow/shadow)
   - What's unclear: Should color override inputs appear for non-existent layers?
   - Recommendation: Only show color inputs for layers that exist in selected style. Check `style.layers.indicator !== undefined` before rendering ColorInput.

## Sources

### Primary (HIGH confidence)
- MDN Web APIs - DOMParser: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
- MDN Web APIs - querySelectorAll: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
- MDN Web APIs - setAttribute: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
- MDN Web APIs - XMLSerializer: https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer
- MDN CSS - transform property: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
- MDN CSS - transform-origin: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin
- MDN SVG - fill attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill
- MDN SVG - stroke attribute: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke
- Project codebase - SafeSVG component: src/components/SafeSVG.tsx
- Project codebase - AssetsSlice pattern: src/store/assetsSlice.ts
- Project codebase - KnobRenderer: src/components/elements/renderers/KnobRenderer.tsx
- Project codebase - SvgGraphicProperties dropdown: src/components/Properties/SvgGraphicProperties.tsx
- Project codebase - Zustand + zundo integration: src/store/index.ts
- Phase 16 RESEARCH.md - SVG rendering patterns

### Secondary (MEDIUM confidence)
- [Figma Guide: Layer naming conventions](https://www.figma.com/community/file/1064955840810792842/guide-layer-naming-conventions) - SVG export with layer names
- [GitHub: AudioKnobs](https://github.com/Megaemce/AudioKnobs) - SVG audio knobs with layers
- [GitHub: Knob control](https://github.com/bradhowes/Knob) - CoreAnimation layers with track/progress/indicator
- [CSS-Tricks: Theming with React and styled-components](https://css-tricks.com/theming-and-theme-switching-with-react-and-styled-components/) - Theme system patterns
- [Nucleoapp: Change SVG color with CSS](https://nucleoapp.com/blog/post/change-svg-color-css) - SVG color manipulation techniques
- [Motion.dev: Animation performance guide](https://motion.dev/docs/performance) - CSS transform performance with many elements

### Tertiary (LOW confidence)
- Layer naming conventions (indicator, track, arc) - Common in audio plugin community but not standardized
- 270° rotation as default - Standard for audio plugins, verified anecdotally
- Opacity fade for arc animation - Simple approach, unverified if "standard"

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - DOMParser, Zustand, CSS transforms all proven and integrated
- Architecture: HIGH - Patterns verified from existing codebase (Phase 15 assets, Phase 16 SVG rendering)
- Layer detection: MEDIUM - Naming conventions are common but not standardized across design tools
- Color overrides: HIGH - setAttribute() is well-documented, XMLSerializer is standard
- Performance: MEDIUM - CSS transforms are performant, but 50+ animated knobs not tested yet
- User decisions: HIGH - All constraints from CONTEXT.md incorporated (hybrid detection, rotation range, attribute replacement)

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable domain, established browser APIs)
