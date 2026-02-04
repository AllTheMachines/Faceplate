# Phase 54: Knob Variants - Research

**Researched:** 2026-02-04
**Domain:** React component extension, SVG layer rendering, rotary control behavior
**Confidence:** HIGH

## Summary

This phase extends SVG styling support from the regular Knob element (implemented in Phase 53) to three knob variants: Stepped Knob, Center Detent Knob, and Dot Indicator Knob. All three variants are already implemented with CSS-based rendering and will adopt the elementStyles system using the 'rotary' category.

The existing architecture provides strong foundations:
- ElementStyle type with rotary category already defined (RotaryLayers: indicator, track, arc, glow, shadow)
- Regular Knob demonstrates the exact pattern: DefaultKnobRenderer (CSS) + StyledKnobRenderer (SVG) with conditional delegation
- Layer extraction and color override services are generalized and working (Phase 53)
- All three variants share the same rotary layer structure as regular knob

Key implementation decision (from CONTEXT.md): Regular Knob keeps existing knobStyles system, variants use new elementStyles. This maintains backward compatibility while providing unified styling for variants.

**Primary recommendation:** Follow KnobRenderer pattern exactly - add StyledXKnobRenderer alongside existing DefaultXKnobRenderer, delegate based on styleId presence, use elementStyles.getStylesByCategory('rotary') for style selection.

## Standard Stack

The established libraries/tools are already in use:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component framework | Already in use, functional components with hooks |
| Zustand | 5.0.10 | State management | elementStylesSlice provides styles, getStylesByCategory('rotary') selector |
| TypeScript | ~5.6.2 | Type system | Discriminated unions for ElementStyle, type-safe layer access |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DOMParser | Browser API | SVG parsing | extractElementLayer service (already implemented) |
| XMLSerializer | Browser API | SVG serialization | Layer extraction to new SVG (already working) |
| SafeSVG | Internal | Sanitized SVG rendering | Used by KnobRenderer for layer rendering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| elementStyles | knobStyles | Decision: Regular Knob keeps knobStyles, variants use elementStyles |
| Separate renderers | Single renderer with switch | Separate functions cleaner for CSS vs SVG logic |
| Category-specific selectors | Generic getElementStyle | getStylesByCategory('rotary') filters correctly |

**Installation:**
No new dependencies required. All infrastructure from Phase 53.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── elements/
│       └── renderers/
│           └── controls/
│               ├── SteppedKnobRenderer.tsx        # UPDATE: Add StyledSteppedKnobRenderer
│               ├── CenterDetentKnobRenderer.tsx   # UPDATE: Add StyledCenterDetentKnobRenderer
│               └── DotIndicatorKnobRenderer.tsx   # UPDATE: Add StyledDotIndicatorKnobRenderer
├── components/
│   └── Properties/
│       ├── SteppedKnobProperties.tsx             # UPDATE: Add style dropdown + color overrides
│       ├── CenterDetentKnobProperties.tsx        # UPDATE: Add style dropdown + color overrides
│       └── DotIndicatorKnobProperties.tsx        # UPDATE: Add style dropdown + color overrides
├── types/
│   └── elements/
│       └── controls.ts                           # UPDATE: Add styleId and colorOverrides to variant configs
```

### Pattern 1: Default vs Styled Renderer Pattern
**What:** Split rendering into CSS-based default and SVG-based styled implementations
**When to use:** Any element that supports both CSS and SVG styling
**Example:**
```typescript
// Source: src/components/elements/renderers/controls/KnobRenderer.tsx (lines 127-226, 232-371, 377-385)
// Pattern used by regular Knob - apply same to variants

// CSS-based default implementation (existing)
function DefaultSteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  // Existing implementation stays unchanged
  // Renders tick marks, step indicators, stepped rotation
}

// NEW: SVG-based styled implementation
function StyledSteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Must be rotary category
  if (style && style.category !== 'rotary') return null

  // Calculate stepped value (snap to discrete positions)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const stepSize = 1 / (config.stepCount - 1)
  const steppedValue = Math.round(normalizedValue / stepSize) * stepSize

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Calculate rotation angle with stepped behavior
  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + steppedValue * rotationRange
  }, [style, steppedValue])

  // Extract layers (same as regular knob)
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      shadow: style.layers.shadow ? extractElementLayer(svgContent, style.layers.shadow) : null,
      arc: style.layers.arc ? extractElementLayer(svgContent, style.layers.arc) : null,
      indicator: style.layers.indicator ? extractElementLayer(svgContent, style.layers.indicator) : null,
      glow: style.layers.glow ? extractElementLayer(svgContent, style.layers.glow) : null,
    }
  }, [style, svgContent])

  // Tick marks: Duplicate ONE tick mark template from SVG based on stepCount
  // (SVG provides template, stepCount from options panel controls how many render)
  const tickMarks = useMemo(() => {
    if (!style || !config.showStepMarks) return []
    // Generate tick mark positions based on stepCount
    const marks = []
    for (let i = 0; i < config.stepCount; i++) {
      const stepNormalized = i / (config.stepCount - 1)
      const stepAngle = style.minAngle + stepNormalized * (style.maxAngle - style.minAngle)
      marks.push(stepAngle)
    }
    return marks
  }, [style, config.stepCount, config.showStepMarks])

  // Render layers with rotary pattern
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static layers: track, shadow */}
      {/* Animated indicator with stepped rotation */}
      {/* Tick marks duplicated at calculated positions */}
      {/* Label and value displays */}
    </div>
  )
}

// Main renderer delegates based on styleId
export function SteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  if (!config.styleId) {
    return <DefaultSteppedKnobRenderer config={config} />
  }
  return <StyledSteppedKnobRenderer config={config} />
}
```

### Pattern 2: Element Config Extension with Optional SVG Style
**What:** Add styleId and colorOverrides to variant config interfaces
**When to use:** Extending existing elements to support SVG styling
**Example:**
```typescript
// Source: src/types/elements/controls.ts (lines 15-64) + Phase 54 extension
export interface SteppedKnobElementConfig extends BaseElementConfig {
  type: 'steppedknob'

  // Existing properties...
  diameter: number
  value: number
  min: number
  max: number
  stepCount: number
  // ... all existing properties stay unchanged

  // NEW: SVG Knob Style (optional - if undefined, render default CSS knob)
  styleId?: string

  // NEW: Per-instance color overrides (only used when styleId is set)
  colorOverrides?: ColorOverrides
}

// Same pattern for CenterDetentKnobElementConfig and DotIndicatorKnobElementConfig
```

### Pattern 3: Property Panel with Style Dropdown and Color Overrides
**What:** Add SVG style selection and per-layer color customization
**When to use:** Property panels for elements supporting SVG styling
**Example:**
```typescript
// Source: src/components/Properties/KnobProperties.tsx (lines 23-91) - apply same to variants
export function SteppedKnobProperties({ element, onUpdate }: SteppedKnobPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)

  // Get rotary styles (not knobStyles)
  const rotaryStyles = getStylesByCategory('rotary')

  return (
    <>
      {/* Style Selection - Pro feature */}
      {isPro && (
        <PropertySection title="Knob Style">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Style</label>
            <select
              value={element.styleId || ''}
              onChange={(e) => {
                const value = e.target.value
                onUpdate({
                  styleId: value === '' ? undefined : value,
                  colorOverrides: undefined // Reset on style change
                })
              }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="">Default (CSS)</option>
              {rotaryStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
        </PropertySection>
      )}

      {/* Color Overrides (only when SVG style selected) */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'rotary') return null

        const layerNames: Array<keyof typeof style.layers> = ['indicator', 'track', 'arc', 'glow', 'shadow']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                value={element.colorOverrides?.[layerName] || ''}
                onChange={(color) => {
                  const newOverrides = { ...element.colorOverrides }
                  if (color) {
                    newOverrides[layerName] = color
                  } else {
                    delete newOverrides[layerName]
                  }
                  onUpdate({ colorOverrides: newOverrides })
                }}
              />
            ))}
          </PropertySection>
        )
      })()}

      {/* Existing properties continue unchanged */}
      {/* Step Configuration section stays as-is */}
      {/* Value section stays as-is */}
    </>
  )
}
```

### Pattern 4: Dot Indicator Color Override Support
**What:** Special handling for dot color as separate override option
**When to use:** Dot Indicator Knob property panel
**Example:**
```typescript
// Source: User decision from CONTEXT.md + KnobProperties pattern
// Dot Indicator Knob shows dot color as separate override in property panel

export function DotIndicatorKnobProperties({ element, onUpdate }: DotIndicatorKnobPropertiesProps) {
  // ... style selection same as other variants

  {/* Color Overrides with dot-specific handling */}
  {isPro && element.styleId && (() => {
    const style = getElementStyle(element.styleId)
    if (!style || style.category !== 'rotary') return null

    // For Dot Indicator Knob, show 'dot' override option separate from 'indicator'
    // Implementation decision: Whether dot is separate layer or part of indicator
    // depends on rotary schema structure (Claude's discretion)

    // Option A: Dot is separate layer
    const layerNames = ['dot', 'track', 'arc', 'glow', 'shadow']

    // Option B: Dot is part of indicator layer
    const layerNames = ['indicator', 'track', 'arc', 'glow', 'shadow']
    // Show as "Dot Color" instead of "Indicator Color" in UI

    return (
      <PropertySection title="Color Overrides">
        {layerNames.map((layerName) => (
          <ColorInput
            key={layerName}
            label={layerName === 'indicator' ? 'Dot Color' : /* capitalize layerName */}
            // ... rest same as other variants
          />
        ))}
      </PropertySection>
    )
  })()}
}
```

### Anti-Patterns to Avoid
- **Mixing knobStyles and elementStyles:** Regular Knob uses knobStyles, variants use elementStyles. Never mix.
- **Modifying existing default renderers:** Keep DefaultXKnobRenderer unchanged, add StyledXKnobRenderer alongside.
- **Accessing wrong category styles:** Always filter by category: `getStylesByCategory('rotary')` not `elementStyles` directly.
- **Skipping stepped value calculation:** Stepped Knob must quantize value before calculating rotation angle.
- **Removing CSS-based behavior:** When no styleId, variants must render with existing CSS implementation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG layer extraction | Custom DOM parser | `extractElementLayer()` service | Already handles viewBox preservation, element cloning, namespace issues |
| Color override application | String replacement | `applyAllColorOverrides()` service | Handles fill, stroke, preserves 'none', escapes selectors |
| Layer detection | Manual SVG scanning | `detectElementLayers()` service | Convention-based detection already generalized for rotary category |
| Style filtering by category | Array.filter in component | `getStylesByCategory('rotary')` selector | Zustand selector with proper memoization |
| Stepped value quantization | Manual rounding | `Math.round(value / stepSize) * stepSize` | Prevents floating point errors, snap to exact positions |
| Rotation angle calculation | Custom math | `minAngle + normalizedValue * (maxAngle - minAngle)` | Proven pattern from KnobRenderer |

**Key insight:** Phase 53 created generalized infrastructure. Don't duplicate knob-specific services (knobLayers.ts). Use elementLayers.ts and ElementStyle type system.

## Common Pitfalls

### Pitfall 1: Using knobStyles Instead of elementStyles
**What goes wrong:** Variants accessing state.knobStyles instead of state.elementStyles
**Why it happens:** Regular Knob uses knobStyles, easy to copy wrong pattern
**How to avoid:** Use `getStylesByCategory('rotary')` selector, never access knobStyles for variants
**Warning signs:** Style dropdown shows wrong styles, or empty list

### Pitfall 2: Breaking Existing CSS Rendering
**What goes wrong:** Modifying DefaultXKnobRenderer breaks existing projects using variants
**Why it happens:** Tempting to refactor renderer when adding SVG support
**How to avoid:**
- Keep DefaultXKnobRenderer completely unchanged
- Add StyledXKnobRenderer as separate function
- Main renderer delegates based on `if (!config.styleId) return <DefaultX/>`
**Warning signs:** Existing projects load with broken knob rendering, tick marks disappear, indicators misaligned

### Pitfall 3: Category Type Mismatch
**What goes wrong:** Variant tries to render style from wrong category (linear, arc, button)
**Why it happens:** getElementStyle returns any ElementStyle, must check category
**How to avoid:** Always validate category in StyledRenderer: `if (style && style.category !== 'rotary') return null`
**Warning signs:** TypeScript errors accessing style.layers.indicator when style might be LinearElementStyle

### Pitfall 4: Forgetting Stepped Value Quantization
**What goes wrong:** Stepped Knob indicator rotates smoothly instead of snapping to positions
**Why it happens:** Copying regular knob code without stepped calculation
**How to avoid:**
```typescript
// Calculate stepped value BEFORE rotation angle
const stepSize = 1 / (config.stepCount - 1)
const steppedValue = Math.round(normalizedValue / stepSize) * stepSize
const indicatorAngle = style.minAngle + steppedValue * rotationRange
```
**Warning signs:** Indicator doesn't snap to step positions, feels like regular knob

### Pitfall 5: Tick Mark Implementation Confusion
**What goes wrong:** Trying to extract tick mark from SVG as layer
**Why it happens:** Misunderstanding "SVG provides ONE tick mark template"
**How to avoid:**
- SVG tick mark is NOT a layer in style.layers
- Tick marks are generated by renderer based on config.stepCount
- SVG provides visual style, renderer handles duplication and positioning
- Tick marks are CSS-rendered overlays on top of SVG layers
**Warning signs:** Trying to add 'tickMark' to RotaryLayers interface, searching for tick mark layer in detection

### Pitfall 6: Center Detent Visual Feedback Over-Engineering
**What goes wrong:** Adding glow effects, color changes, or special center mark layer
**Why it happens:** Misreading "Position-only feedback when snapping to center"
**How to avoid:**
- Decision: "No highlight/glow effect" - keep indicator rotation only
- Decision: "No special center mark layer" - use standard rotary layers
- Snap is behavioral (value snaps to 0.5), not visual (no effect)
**Warning signs:** Adding centerMark layer, changing indicator color at center, adding glow animation

### Pitfall 7: Dot Indicator Rotation Behavior Mismatch
**What goes wrong:** Dot rotates around indicator path instead of arc path
**Why it happens:** Not checking current DotIndicatorKnobRenderer implementation
**How to avoid:**
- Current implementation: dot follows arc path (polarToCartesian on arc radius)
- SVG version: indicator layer should contain dot that rotates on arc path
- Dot rotation is path-based, not center-rotation
**Warning signs:** Dot spinning in center instead of traveling around arc edge

## Code Examples

Verified patterns from codebase:

### Stepped Knob Styled Renderer Structure
```typescript
// Source: Pattern derived from KnobRenderer.tsx (lines 232-371)
function StyledSteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation
  if (style && style.category !== 'rotary') {
    console.warn('SteppedKnob requires rotary category style')
    return null
  }

  // Stepped value calculation (quantize before rotation)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const stepSize = 1 / (config.stepCount - 1)
  const steppedValue = Math.round(normalizedValue / stepSize) * stepSize

  // Memoize expensive operations
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + steppedValue * rotationRange
  }, [style, steppedValue])

  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      shadow: style.layers.shadow ? extractElementLayer(svgContent, style.layers.shadow) : null,
      arc: style.layers.arc ? extractElementLayer(svgContent, style.layers.arc) : null,
      indicator: style.layers.indicator ? extractElementLayer(svgContent, style.layers.indicator) : null,
      glow: style.layers.glow ? extractElementLayer(svgContent, style.layers.glow) : null,
    }
  }, [style, svgContent])

  // Format value
  const formattedValue = formatValue(
    steppedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

  // Style not found fallback
  if (!style) {
    return (
      <div style={{ /* error placeholder */ }}>
        Style not found
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static layers: track, shadow */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {layers?.shadow && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.shadow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Arc - animated by value */}
      {layers?.arc && (
        <div style={{ position: 'absolute', inset: 0, opacity: steppedValue, transition: 'opacity 0.05s ease-out' }}>
          <SafeSVG content={layers.arc} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator - rotates with snap transition */}
      {layers?.indicator && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${indicatorAngle}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out', // Smooth snap
          }}
        >
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Glow - intensity by value */}
      {layers?.glow && (
        <div style={{ position: 'absolute', inset: 0, opacity: steppedValue * 0.7 + 0.3, transition: 'opacity 0.05s ease-out' }}>
          <SafeSVG content={layers.glow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Label and Value displays */}
      {config.showLabel && <span style={getLabelStyle(config)}>{config.labelText}</span>}
      {config.showValue && <span style={getValueStyle(config)}>{formattedValue}</span>}
    </div>
  )
}
```

### Center Detent Knob Bipolar Fill Pattern
```typescript
// Source: CenterDetentKnobRenderer.tsx (lines 129-207) + SVG adaptation
function StyledCenterDetentKnobRenderer({ config }: CenterDetentKnobRendererProps) {
  // ... standard setup same as SteppedKnob

  // Center detent snap detection
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const isAtCenter = Math.abs(normalizedValue - 0.5) < config.snapThreshold

  // Rotation angle (no quantization, smooth rotation with snap at center)
  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + normalizedValue * rotationRange
  }, [style, normalizedValue])

  // Arc layer renders bipolar fill (from center to value)
  // When value < 0.5: fill from value to center
  // When value > 0.5: fill from center to value
  // This is handled by arc layer's opacity or separate left/right arc layers

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static layers */}
      {layers?.track && <div style={{ position: 'absolute', inset: 0 }}>
        <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
      </div>}

      {/* Arc - bipolar fill (opacity based on distance from center) */}
      {layers?.arc && !isAtCenter && (
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: Math.abs(normalizedValue - 0.5) * 2, // 0 at center, 1 at extremes
          transition: 'opacity 0.05s ease-out'
        }}>
          <SafeSVG content={layers.arc} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator - rotates smoothly, snaps to center when threshold met */}
      {layers?.indicator && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${indicatorAngle}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out',
          }}
        >
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Label and Value */}
    </div>
  )
}
```

### Dot Indicator Knob with Path Rotation
```typescript
// Source: DotIndicatorKnobRenderer.tsx (lines 123-192) + SVG adaptation
function StyledDotIndicatorKnobRenderer({ config }: DotIndicatorKnobRendererProps) {
  // ... standard setup

  // Dot rotation follows arc path (not center rotation)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Calculate indicator angle (dot position on arc)
  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + normalizedValue * rotationRange
  }, [style, normalizedValue])

  // Dot indicator behavior decision (Claude's discretion):
  // Current CSS implementation: dot travels on arc path (polarToCartesian)
  // SVG implementation: indicator layer contains dot, rotates around center
  // Result: Dot appears to travel along arc edge (same visual behavior)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - background arc */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator (dot) - rotates around center, positioned at arc radius */}
      {layers?.indicator && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${indicatorAngle}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out',
          }}
        >
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Glow (optional) */}
      {layers?.glow && (
        <div style={{ position: 'absolute', inset: 0, opacity: normalizedValue * 0.7 + 0.3 }}>
          <SafeSVG content={layers.glow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Label and Value */}
    </div>
  )
}
```

### Property Panel Style Selection
```typescript
// Source: KnobProperties.tsx (lines 14-52) adapted for variants
export function SteppedKnobProperties({ element, onUpdate }: SteppedKnobPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)

  // Get rotary styles (shared with all knob variants)
  const rotaryStyles = getStylesByCategory('rotary')

  return (
    <>
      {/* Style Selection - Pro feature */}
      {isPro && (
        <PropertySection title="Knob Style">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Style</label>
            <select
              value={element.styleId || ''}
              onChange={(e) => {
                const value = e.target.value
                onUpdate({
                  styleId: value === '' ? undefined : value,
                  colorOverrides: undefined
                })
              }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="">Default (CSS)</option>
              {rotaryStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
        </PropertySection>
      )}

      {/* Color Overrides */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'rotary') return null

        const layerNames: Array<keyof typeof style.layers> = ['indicator', 'track', 'arc', 'glow', 'shadow']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                value={element.colorOverrides?.[layerName] || ''}
                onChange={(color) => {
                  const newOverrides = { ...element.colorOverrides }
                  if (color) {
                    newOverrides[layerName] = color
                  } else {
                    delete newOverrides[layerName]
                  }
                  onUpdate({ colorOverrides: newOverrides })
                }}
              />
            ))}
            <button
              onClick={() => onUpdate({ colorOverrides: undefined })}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 mt-1"
            >
              Reset to Original Colors
            </button>
          </PropertySection>
        )
      })()}

      {/* Existing Step Configuration section unchanged */}
      <PropertySection title="Step Configuration">
        {/* ... existing implementation ... */}
      </PropertySection>

      {/* Existing Value section unchanged */}
      <PropertySection title="Value">
        {/* ... existing implementation ... */}
      </PropertySection>
    </>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Knob-only SVG styling | Category-based element styling | Phase 53 (2026-02-04) | All rotary controls share styles |
| knobStyles system | elementStyles with category discriminant | Phase 53 | Variants use elementStyles, Regular Knob keeps knobStyles |
| Per-element layer detection | Generalized category-based detection | Phase 53 | detectElementLayers(category) works for all rotary controls |
| CSS-only variants | CSS + SVG dual rendering | Phase 54 (current) | Variants gain SVG styling without breaking CSS |

**Deprecated/outdated:**
- knobLayers.ts service: Still used by regular Knob, but variants use elementLayers.ts
- Knob-specific detectKnobLayers(): Replaced by detectElementLayers(category) for new elements

## Open Questions

Things that couldn't be fully resolved:

1. **Dot Indicator Layer Structure**
   - What we know: RotaryLayers has 'indicator' layer, current CSS impl uses dot on arc path
   - What's unclear: Should dot be separate layer (add to RotaryLayers) or part of indicator layer?
   - Recommendation: Part of indicator layer. SVG indicator contains dot positioned at arc radius. Rotation behavior matches CSS version (dot travels arc edge). Avoids extending RotaryLayers interface.

2. **Center Detent Dead Zone Visual Behavior**
   - What we know: Decision says "Position-only feedback when snapping to center (no highlight/glow effect)"
   - What's unclear: Should arc layer visibility change when at center? Should there be subtle visual distinction?
   - Recommendation: Arc layer hides when isAtCenter (opacity 0 or conditional render). This provides minimal visual feedback that center was reached while avoiding glow/highlight effects. Matches decision: "no special center mark layer, uses standard rotary layers."

3. **Tick Mark SVG Template Extraction**
   - What we know: "SVG provides ONE tick mark template that gets duplicated based on step count"
   - What's unclear: Is tick mark part of SVG style, or CSS-rendered overlay?
   - Recommendation: CSS-rendered overlay. SVG style provides only core rotary layers. Tick marks rendered by StyledSteppedKnobRenderer using same math as DefaultSteppedKnobRenderer (polarToCartesian for positions). This keeps tick mark count controlled by options panel, not SVG structure.

## Sources

### Primary (HIGH confidence)
- src/components/elements/renderers/controls/KnobRenderer.tsx - Exact pattern for Default/Styled split
- src/components/Properties/KnobProperties.tsx - Style dropdown and color override UI
- src/types/elementStyle.ts - RotaryLayers interface, ElementStyle discriminated union
- src/store/elementStylesSlice.ts - getStylesByCategory('rotary') selector
- src/services/elementLayers.ts - detectElementLayers, extractElementLayer, applyAllColorOverrides
- .planning/phases/54-knob-variants/54-CONTEXT.md - User decisions and implementation boundaries
- .planning/phases/53-foundation/53-VERIFICATION.md - Phase 53 verification confirms infrastructure working

### Secondary (MEDIUM confidence)
- src/components/elements/renderers/controls/SteppedKnobRenderer.tsx - Existing CSS implementation, stepped value calculation
- src/components/elements/renderers/controls/CenterDetentKnobRenderer.tsx - Bipolar fill and center snap behavior
- src/components/elements/renderers/controls/DotIndicatorKnobRenderer.tsx - Dot path rotation implementation
- src/types/elements/controls.ts - Variant config interfaces (basis for adding styleId)

### Tertiary (LOW confidence)
None - all information verified from codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, verified from Phase 53
- Architecture: HIGH - KnobRenderer provides exact pattern to follow
- Pitfalls: HIGH - Common mistakes identified from knob/variant structure differences

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable infrastructure, unlikely to change)
