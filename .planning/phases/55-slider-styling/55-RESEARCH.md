# Phase 55: Slider Styling - Research

**Researched:** 2026-02-04
**Domain:** React SVG slider rendering, linear/arc control styling, path-following algorithms
**Confidence:** HIGH

## Summary

This phase extends SVG styling support from rotary controls (Phase 53-54) to seven slider variants: Basic Slider, Range Slider, Multi-Slider, Bipolar Slider, Crossfade Slider, Notched Slider, and Arc Slider. All variants currently render with CSS-based implementations and will adopt the elementStyles system using the 'linear' category (Arc Slider uses 'arc' category per Phase 53-02 decision).

The existing architecture provides complete foundations:
- ElementStyle type with linear and arc categories already defined in Phase 53
- LinearLayers schema: thumb, track, fill (shared by all linear sliders)
- ArcLayers schema: thumb, track, fill, arc (for arc slider path-following)
- detectElementLayers() service generalized for category-based detection
- extractElementLayer() and color override services working (Phase 53)
- KnobRenderer demonstrates exact Default/Styled split pattern (Phase 54)

User decisions from CONTEXT.md lock critical implementation choices:
- One shared LinearLayers schema for all slider types (types ignore unused layers)
- Range Slider uses two explicit SVG layers: thumb-low and thumb-high
- Tick marks generated programmatically from notchCount (not SVG layers)
- Arc slider thumb follows SVG path element (user-drawn curve)
- Fill technique (clip-path vs scale): Claude's discretion (research recommends clip-path for performance)

**Primary recommendation:** Follow SteppedKnobRenderer pattern exactly - add StyledXSliderRenderer alongside DefaultXSliderRenderer, delegate based on styleId presence, use elementStyles.getStylesByCategory('linear') for style selection. For Arc Slider, use SVGGeometryElement.getPointAtLength() for path-following (native browser API, no dependencies needed).

## Standard Stack

The established libraries/tools are already in use:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component framework | Functional components with hooks, already in use |
| Zustand | 5.0.10 | State management | elementStylesSlice provides styles, getStylesByCategory('linear'/'arc') selectors |
| TypeScript | ~5.6.2 | Type system | Discriminated unions for ElementStyle, type-safe layer access |
| DOMParser | Browser API | SVG parsing | extractElementLayer service (Phase 53) |
| XMLSerializer | Browser API | SVG serialization | Layer extraction with viewBox preservation |
| SVGGeometryElement | Browser API | Path operations | getPointAtLength() for arc slider thumb positioning |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SafeSVG | Internal | Sanitized SVG rendering | Used by all styled renderers for layer rendering |
| CSS.escape | Browser API | CSS selector escaping | Polyfilled in elementLayers.ts for safe querying |
| crypto.randomUUID | Browser API | ID generation | Style IDs (already in use) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native getPointAtLength | svg-path-properties library | Library adds 10KB, native API sufficient for our use case |
| clip-path for fill | transform scaleX | scaleX requires transform-origin management, clip-path more performant |
| elementStyles | knobStyles | Decision locked: sliders use elementStyles (linear/arc categories) |

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
│               ├── SliderRenderer.tsx              # UPDATE: Add StyledSliderRenderer
│               ├── RangeSliderRenderer.tsx         # UPDATE: Add StyledRangeSliderRenderer
│               ├── MultiSliderRenderer.tsx         # UPDATE: Add StyledMultiSliderRenderer
│               ├── BipolarSliderRenderer.tsx       # UPDATE: Add StyledBipolarSliderRenderer
│               ├── CrossfadeSliderRenderer.tsx     # UPDATE: Add StyledCrossfadeSliderRenderer
│               ├── NotchedSliderRenderer.tsx       # UPDATE: Add StyledNotchedSliderRenderer
│               └── ArcSliderRenderer.tsx           # UPDATE: Add StyledArcSliderRenderer
├── components/
│   └── Properties/
│       ├── SliderProperties.tsx                    # UPDATE: Add style dropdown + color overrides
│       ├── RangeSliderProperties.tsx              # UPDATE: Add style dropdown + color overrides
│       ├── MultiSliderProperties.tsx              # UPDATE: Add style dropdown + color overrides
│       ├── BipolarSliderProperties.tsx            # UPDATE: Add style dropdown + color overrides
│       ├── CrossfadeSliderProperties.tsx          # UPDATE: Add style dropdown + color overrides
│       ├── NotchedSliderProperties.tsx            # UPDATE: Add style dropdown + color overrides
│       └── ArcSliderProperties.tsx                # UPDATE: Add style dropdown + color overrides
├── types/
│   └── elements/
│       └── controls.ts                            # UPDATE: Add styleId and colorOverrides to slider configs
```

### Pattern 1: Default vs Styled Renderer Pattern (Linear Sliders)
**What:** Split rendering into CSS-based default and SVG-based styled implementations
**When to use:** Any element that supports both CSS and SVG styling
**Example:**
```typescript
// Source: Pattern from SteppedKnobRenderer + SliderRenderer existing code
// Apply to: Basic Slider, Range Slider, Multi-Slider, Bipolar Slider, Crossfade Slider, Notched Slider

// CSS-based default implementation (existing)
function DefaultSliderRenderer({ config }: SliderRendererProps) {
  // Existing implementation stays unchanged
  // Renders thumb/track/fill with CSS rectangles
}

// NEW: SVG-based styled implementation
function StyledSliderRenderer({ config }: SliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation
  if (style && style.category !== 'linear') {
    console.warn('Slider requires linear category style')
    return null
  }

  // Calculate normalized value (0 to 1)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      thumb: style.layers.thumb ? extractElementLayer(svgContent, style.layers.thumb) : null,
    }
  }, [style, svgContent])

  // Calculate thumb position
  const thumbPosition = useMemo(() => {
    if (config.orientation === 'vertical') {
      // Vertical: 0 = bottom, 1 = top
      return {
        x: 0,
        y: (1 - normalizedValue) * 100, // Invert for vertical
      }
    } else {
      // Horizontal: 0 = left, 1 = right
      return {
        x: normalizedValue * 100,
        y: 0,
      }
    }
  }, [config.orientation, normalizedValue])

  // Fill clip-path (grows from start to value position)
  const fillClipPath = useMemo(() => {
    if (config.orientation === 'vertical') {
      // Clip from bottom to value position
      return `inset(${(1 - normalizedValue) * 100}% 0 0 0)`
    } else {
      // Clip from left to value position
      return `inset(0 ${(1 - normalizedValue) * 100}% 0 0)`
    }
  }, [config.orientation, normalizedValue])

  if (!style) {
    return <div style={{ color: 'red' }}>Style not found</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track layer - static background */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill layer - clipped to value position */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: fillClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Thumb layer - translates based on value */}
      {layers?.thumb && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${thumbPosition.x}%, ${thumbPosition.y}%)`,
          transition: 'transform 0.05s ease-out',
        }}>
          <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Label and Value displays */}
      {config.showLabel && <span style={getLabelStyle(config)}>{config.labelText}</span>}
      {config.showValue && <span style={getValueStyle(config)}>{formattedValue}</span>}
    </div>
  )
}

// Main renderer delegates based on styleId
export function SliderRenderer({ config }: SliderRendererProps) {
  if (!config.styleId) {
    return <DefaultSliderRenderer config={config} />
  }
  return <StyledSliderRenderer config={config} />
}
```

### Pattern 2: Range Slider with Dual Thumbs
**What:** Two separate thumb layers (thumb-low and thumb-high) with optional range fill
**When to use:** Range Slider styled renderer
**Example:**
```typescript
// Source: User decision from CONTEXT.md + RangeSliderRenderer existing pattern
function StyledRangeSliderRenderer({ config }: RangeSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'linear') return null

  // Normalized values
  const normalizedMin = (config.minValue - config.min) / (config.max - config.min)
  const normalizedMax = (config.maxValue - config.min) / (config.max - config.min)

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers - Range Slider extension to LinearLayers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      // Range Slider-specific: two thumb layers
      thumbLow: style.layers['thumb-low'] ? extractElementLayer(svgContent, style.layers['thumb-low']) : null,
      thumbHigh: style.layers['thumb-high'] ? extractElementLayer(svgContent, style.layers['thumb-high']) : null,
    }
  }, [style, svgContent])

  // Thumb positions
  const thumbLowPos = config.orientation === 'vertical'
    ? { x: 0, y: (1 - normalizedMin) * 100 }
    : { x: normalizedMin * 100, y: 0 }

  const thumbHighPos = config.orientation === 'vertical'
    ? { x: 0, y: (1 - normalizedMax) * 100 }
    : { x: normalizedMax * 100, y: 0 }

  // Range fill clip-path (from minValue to maxValue)
  const rangeFillClipPath = useMemo(() => {
    const start = Math.min(normalizedMin, normalizedMax)
    const end = Math.max(normalizedMin, normalizedMax)
    const size = end - start

    if (config.orientation === 'vertical') {
      return `inset(${(1 - end) * 100}% 0 ${start * 100}% 0)`
    } else {
      return `inset(0 ${(1 - end) * 100}% 0 ${start * 100}%)`
    }
  }, [config.orientation, normalizedMin, normalizedMax])

  if (!style) return <div>Style not found</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Range fill (optional - only if fill layer provided) */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: rangeFillClipPath,
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Low thumb */}
      {layers?.thumbLow && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${thumbLowPos.x}%, ${thumbLowPos.y}%)`,
          zIndex: config.activeThumbs?.includes('low') ? 2 : 1, // Active thumb on top
        }}>
          <SafeSVG content={layers.thumbLow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* High thumb */}
      {layers?.thumbHigh && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${thumbHighPos.x}%, ${thumbHighPos.y}%)`,
          zIndex: config.activeThumbs?.includes('high') ? 2 : 1, // Active thumb on top
        }}>
          <SafeSVG content={layers.thumbHigh} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Pattern 3: Bipolar Slider with Center-Origin Fill
**What:** Fill layer clips from configurable center position, dual fill colors for positive/negative
**When to use:** Bipolar Slider styled renderer
**Example:**
```typescript
// Source: User decision from CONTEXT.md + BipolarSliderRenderer existing pattern
function StyledBipolarSliderRenderer({ config }: BipolarSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'linear') return null

  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const centerValue = config.centerValue // User-configurable (default 0.5)

  // Determine fill direction and clip region
  const fillStart = Math.min(centerValue, normalizedValue)
  const fillEnd = Math.max(centerValue, normalizedValue)

  // Color override based on positive/negative side
  const fillColor = normalizedValue >= centerValue
    ? config.positiveFillColor
    : config.negativeFillColor

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    // Apply fill color override based on value position
    const overrides = {
      ...config.colorOverrides,
      fill: fillColor,
    }
    return applyAllColorOverrides(style.svgContent, style.layers, overrides)
  }, [style, config.colorOverrides, fillColor])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      thumb: style.layers.thumb ? extractElementLayer(svgContent, style.layers.thumb) : null,
    }
  }, [style, svgContent])

  // Fill clip-path (from center to value position)
  const fillClipPath = useMemo(() => {
    if (config.orientation === 'vertical') {
      return `inset(${(1 - fillEnd) * 100}% 0 ${fillStart * 100}% 0)`
    } else {
      return `inset(0 ${(1 - fillEnd) * 100}% 0 ${fillStart * 100}%)`
    }
  }, [config.orientation, fillStart, fillEnd])

  // Thumb position
  const thumbPosition = config.orientation === 'vertical'
    ? { x: 0, y: (1 - normalizedValue) * 100 }
    : { x: normalizedValue * 100, y: 0 }

  if (!style) return <div>Style not found</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill (from center to value, color changes based on direction) */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: fillClipPath,
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Thumb */}
      {layers?.thumb && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${thumbPosition.x}%, ${thumbPosition.y}%)`,
        }}>
          <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Pattern 4: Arc Slider with Path-Following Thumb
**What:** Thumb follows user-drawn SVG path using getPointAtLength, arc fill follows curve
**When to use:** Arc Slider styled renderer (uses 'arc' category, not 'linear')
**Example:**
```typescript
// Source: User decision from CONTEXT.md + ArcSliderRenderer existing pattern + MDN getPointAtLength
function StyledArcSliderRenderer({ config }: ArcSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Arc Slider uses 'arc' category (Phase 53-02 decision)
  if (style && style.category !== 'arc') {
    console.warn('ArcSlider requires arc category style')
    return null
  }

  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers (ArcLayers: thumb, track, fill, arc)
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      thumb: style.layers.thumb ? extractElementLayer(svgContent, style.layers.thumb) : null,
      arc: style.layers.arc ? extractElementLayer(svgContent, style.layers.arc) : null,
    }
  }, [style, svgContent])

  // Get arc path element for getPointAtLength
  const arcPath = useMemo(() => {
    if (!layers?.arc) return null
    const parser = new DOMParser()
    const doc = parser.parseFromString(layers.arc, 'image/svg+xml')
    const pathElement = doc.querySelector('path') as SVGPathElement
    return pathElement
  }, [layers?.arc])

  // Calculate thumb position on arc path
  const thumbPosition = useMemo(() => {
    if (!arcPath) return { x: 50, y: 50, angle: 0 }

    // Get total path length
    const totalLength = arcPath.getTotalLength()

    // Calculate point at normalized value position
    const lengthAtValue = normalizedValue * totalLength
    const point = arcPath.getPointAtLength(lengthAtValue)

    // Calculate tangent angle for optional thumb rotation
    const epsilon = 0.1
    const prevPoint = arcPath.getPointAtLength(Math.max(0, lengthAtValue - epsilon))
    const nextPoint = arcPath.getPointAtLength(Math.min(totalLength, lengthAtValue + epsilon))
    const angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x) * 180 / Math.PI

    return { x: point.x, y: point.y, angle }
  }, [arcPath, normalizedValue])

  // Arc fill clip-path (from start to value position)
  const arcFillClipPath = useMemo(() => {
    if (!arcPath) return 'none'

    // Create clip path using arc segment
    const totalLength = arcPath.getTotalLength()
    const lengthAtValue = normalizedValue * totalLength

    // Build path segment from start to value position
    const segmentPath = arcPath.cloneNode() as SVGPathElement
    const pathData = segmentPath.getAttribute('d') || ''

    // Simplified: Use clip-path polygon based on arc points
    // For production: Generate path segment or use clipPath element
    return 'polygon(...)' // Implementation: sample points along arc, create polygon
  }, [arcPath, normalizedValue])

  if (!style) return <div>Style not found</div>

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track (background arc) */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Arc fill (follows curve from start to value) */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: arcFillClipPath,
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Thumb (follows arc path) */}
      {layers?.thumb && (
        <div style={{
          position: 'absolute',
          left: `${thumbPosition.x}px`,
          top: `${thumbPosition.y}px`,
          transform: config.rotateThumbToTangent
            ? `translate(-50%, -50%) rotate(${thumbPosition.angle}deg)`
            : `translate(-50%, -50%)`,
        }}>
          <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Pattern 5: Notched Slider with Programmatic Tick Marks
**What:** Tick marks generated by renderer based on notchCount property, not from SVG
**When to use:** Notched Slider styled renderer
**Example:**
```typescript
// Source: User decision from CONTEXT.md + existing NotchedSliderRenderer
function StyledNotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
  // ... standard linear slider setup (same as Pattern 1)

  // Generate tick mark positions based on notchCount
  const tickMarks = useMemo(() => {
    if (!config.showNotches) return []
    const marks: number[] = []
    for (let i = 0; i < config.notchCount; i++) {
      const normalizedPosition = i / (config.notchCount - 1)
      marks.push(normalizedPosition)
    }
    return marks
  }, [config.notchCount, config.showNotches])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track, fill, thumb layers (same as basic slider) */}

      {/* Tick marks - CSS-rendered overlays, NOT from SVG layers */}
      {tickMarks.map((position, index) => {
        const tickStyle: React.CSSProperties = config.orientation === 'vertical'
          ? {
              position: 'absolute',
              bottom: `${position * 100}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 2,
              backgroundColor: config.tickColor,
            }
          : {
              position: 'absolute',
              left: `${position * 100}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 2,
              height: 8,
              backgroundColor: config.tickColor,
            }

        return <div key={index} style={tickStyle} />
      })}
    </div>
  )
}
```

### Pattern 6: Multi-Slider with Shared Style
**What:** All parallel sliders share one SVG style, consistent appearance across bands
**When to use:** Multi-Slider styled renderer
**Example:**
```typescript
// Source: User decision from CONTEXT.md + existing MultiSliderRenderer
function StyledMultiSliderRenderer({ config }: MultiSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'linear') return null

  // All bands use same style (single styleId for all)
  const bandHeight = 100 / config.bandCount

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {config.bandValues.map((value, index) => {
        const normalizedValue = (value - config.min) / (config.max - config.min)

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${index * bandHeight}%`,
              height: `${bandHeight}%`,
              width: '100%',
            }}
          >
            {/* Render individual slider using shared style */}
            <StyledSliderRenderer
              config={{
                ...config,
                value,
                height: config.height / config.bandCount,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Using knobStyles for sliders:** Sliders use elementStyles with 'linear' or 'arc' category, never knobStyles
- **Extracting tick marks as SVG layers:** Tick marks are programmatically generated, not SVG layers
- **Fixed center position for bipolar:** Center position is user-configurable (config.centerValue), not hardcoded to 0.5
- **Single thumb layer for range slider:** Range Slider must have two explicit layers (thumb-low, thumb-high)
- **Using scaleX for fill animation:** clip-path is more performant (hardware-accelerated), use for all fill layers
- **Modifying existing default renderers:** Keep DefaultXSliderRenderer unchanged, add StyledXSliderRenderer alongside

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG layer extraction | Custom DOM parser | `extractElementLayer()` service | Already handles viewBox preservation, element cloning, namespace issues |
| Color override application | String replacement | `applyAllColorOverrides()` service | Handles fill, stroke, preserves 'none', escapes selectors |
| Layer detection | Manual SVG scanning | `detectElementLayers(category)` service | Convention-based detection already generalized for linear/arc categories |
| Style filtering by category | Array.filter in component | `getStylesByCategory('linear')` selector | Zustand selector with proper memoization |
| Thumb position calculation | Manual percentage math | Formula: `calc(${fraction * 100}% + ${(0.5 - fraction) * thumbWidth}px)` | Prevents thumb overflow at 100%, accounts for thumb width |
| Arc path following | Custom curve interpolation | `SVGGeometryElement.getPointAtLength()` | Native browser API, no dependencies, production-tested |
| Fill animation | width/height changes | CSS `clip-path` | Hardware-accelerated, prevents layout shifts, more performant |
| Arc tangent calculation | Manual derivative | Sample points around position: `atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x)` | Handles all curve types, no calculus needed |

**Key insight:** Phase 53 created generalized infrastructure (elementLayers.ts) for all categories. Don't duplicate knob-specific services. The slider conventions are already defined in LAYER_CONVENTIONS['slider']: thumb, track, fill.

## Common Pitfalls

### Pitfall 1: Using Wrong Category for Styles
**What goes wrong:** Slider tries to render style from rotary/button category
**Why it happens:** getElementStyle returns any ElementStyle, must check category
**How to avoid:** Always validate category in StyledRenderer: `if (style && style.category !== 'linear') return null`
**Warning signs:** TypeScript errors accessing style.layers.thumb when style might be RotaryElementStyle

### Pitfall 2: Breaking Existing CSS Rendering
**What goes wrong:** Modifying DefaultSliderRenderer breaks existing projects using sliders
**Why it happens:** Tempting to refactor renderer when adding SVG support
**How to avoid:**
- Keep DefaultSliderRenderer completely unchanged
- Add StyledSliderRenderer as separate function
- Main renderer delegates: `if (!config.styleId) return <DefaultSliderRenderer/>`
**Warning signs:** Existing projects load with broken slider rendering, thumbs misaligned, fills disappearing

### Pitfall 3: Thumb Overflow at 100% Value
**What goes wrong:** Thumb translates outside track bounds at maximum value
**Why it happens:** Using simple percentage translation without accounting for thumb width
**How to avoid:**
- Horizontal: `thumbX = normalizedValue * (trackWidth - thumbWidth)`
- Vertical: `thumbY = (1 - normalizedValue) * (trackHeight - thumbHeight)`
- Or CSS: `calc(${fraction * 100}% + ${(0.5 - fraction) * thumbWidth}px)`
**Warning signs:** Thumb half-visible at max value, extends beyond track edge

### Pitfall 4: Fill Layer scaleX Transform Origin Issues
**What goes wrong:** Fill layer scales from center instead of start edge
**Why it happens:** Default transform-origin is center, requires edge-based origin
**How to avoid:** Use clip-path instead of scaleX for fill animation. clip-path doesn't require transform-origin management and is hardware-accelerated.
**Warning signs:** Fill appears to grow from middle, shifts position during animation

### Pitfall 5: Arc Fill Not Following Curve
**What goes wrong:** Arc fill clips as rectangle instead of following arc path
**Why it happens:** Using linear clip-path for curved path
**How to avoid:**
- Extract arc path element from SVG
- Use SVG clipPath element with path segment (0 to lengthAtValue)
- Or render fill layer masked by arc shape
**Warning signs:** Fill appears as straight line across arc, doesn't follow curve

### Pitfall 6: Range Slider Thumb Z-Index Conflicts
**What goes wrong:** Wrong thumb renders on top when dragging near each other
**Why it happens:** Static z-index, doesn't track which thumb is active
**How to avoid:**
- Track active thumb in config.activeThumbs array
- Set z-index dynamically: `zIndex: config.activeThumbs?.includes('low') ? 2 : 1`
- Active (dragged) thumb always on top
**Warning signs:** Can't grab low thumb when near high thumb, thumbs visually swap incorrectly

### Pitfall 7: Bipolar Fill Using Fixed Center Position
**What goes wrong:** Bipolar fill always clips from 50%, ignores user-configured center
**Why it happens:** Copying knob arc pattern which uses fixed 0 position
**How to avoid:** Use config.centerValue (user-configurable) for fill calculation, not hardcoded 0.5
**Warning signs:** Fill doesn't match center mark, incorrect behavior when centerValue !== 0.5

### Pitfall 8: Tick Marks from SVG Layers
**What goes wrong:** Trying to extract tick mark layer from SVG, expect multiple instances
**Why it happens:** Misunderstanding "tick marks generated programmatically"
**How to avoid:**
- Tick marks are NOT SVG layers in LinearLayers schema
- Tick marks are CSS-rendered overlays based on config.notchCount
- SVG style provides only thumb/track/fill layers
**Warning signs:** Adding 'tickMark' to LinearLayers interface, searching for tick layer in detection

### Pitfall 9: Arc Slider Using Linear Category
**What goes wrong:** Arc Slider tries to use 'linear' category styles
**Why it happens:** Arc Slider is slider variant, assumes linear category
**How to avoid:** Arc Slider uses 'arc' category (Phase 53-02 decision). ArcLayers has 'arc' field for path element.
**Warning signs:** Arc Slider property panel shows no styles, or shows wrong category styles

### Pitfall 10: getPointAtLength Performance Issues
**What goes wrong:** Calling getPointAtLength every render causes performance degradation
**Why it happens:** Arc path extraction and calculations are expensive
**How to avoid:**
- Memoize arcPath element extraction
- Memoize thumbPosition calculation (depends on arcPath and normalizedValue only)
- Don't call getTotalLength or getPointAtLength outside useMemo
**Warning signs:** Slider feels sluggish when dragging, frame rate drops during arc slider interaction

## Code Examples

Verified patterns from codebase and browser APIs:

### Linear Slider Thumb Translation
```typescript
// Source: SliderRenderer.tsx (lines 103-226) + web search best practices
function StyledSliderRenderer({ config }: SliderRendererProps) {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Thumb position accounting for thumb dimensions
  const thumbPosition = useMemo(() => {
    if (config.orientation === 'vertical') {
      // Vertical: 0 at bottom, 1 at top (inverted)
      // Account for thumb height to prevent overflow
      const availableHeight = config.height - config.thumbHeight
      const thumbY = (1 - normalizedValue) * availableHeight
      return { x: '0%', y: `${thumbY}px` }
    } else {
      // Horizontal: 0 at left, 1 at right
      // Account for thumb width to prevent overflow
      const availableWidth = config.width - config.thumbWidth
      const thumbX = normalizedValue * availableWidth
      return { x: `${thumbX}px`, y: '0%' }
    }
  }, [config.orientation, normalizedValue, config.width, config.height, config.thumbWidth, config.thumbHeight])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      transform: `translate(${thumbPosition.x}, ${thumbPosition.y})`,
      transition: 'transform 0.05s ease-out',
    }}>
      <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
```

### Fill Layer with clip-path (Recommended)
```typescript
// Source: Web search findings + CSS clip-path best practices
// clip-path is hardware-accelerated and prevents layout shifts
function StyledSliderRenderer({ config }: SliderRendererProps) {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Fill clip-path (grows from start to value position)
  const fillClipPath = useMemo(() => {
    if (config.orientation === 'vertical') {
      // Vertical: clip from bottom (0%) to value position
      // inset(top right bottom left)
      return `inset(${(1 - normalizedValue) * 100}% 0 0 0)`
    } else {
      // Horizontal: clip from left (0%) to value position
      return `inset(0 ${(1 - normalizedValue) * 100}% 0 0)`
    }
  }, [config.orientation, normalizedValue])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      clipPath: fillClipPath,
      transition: 'clip-path 0.05s ease-out',
    }}>
      <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
```

### Arc Slider Path Following with getPointAtLength
```typescript
// Source: MDN SVGGeometryElement.getPointAtLength + ArcSliderRenderer existing pattern
function StyledArcSliderRenderer({ config }: ArcSliderRendererProps) {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Extract arc path element from SVG
  const arcPath = useMemo(() => {
    if (!layers?.arc) return null
    const parser = new DOMParser()
    const doc = parser.parseFromString(layers.arc, 'image/svg+xml')
    const pathElement = doc.querySelector('path') as SVGPathElement
    return pathElement
  }, [layers?.arc])

  // Calculate thumb position on arc path
  const thumbPosition = useMemo(() => {
    if (!arcPath) return { x: 0, y: 0, angle: 0 }

    // Get total path length (native browser API)
    const totalLength = arcPath.getTotalLength()

    // Calculate point at normalized value position
    const lengthAtValue = normalizedValue * totalLength
    const point = arcPath.getPointAtLength(lengthAtValue)

    // Calculate tangent angle for optional thumb rotation
    // Sample points slightly before and after to get direction
    const epsilon = 0.1
    const prevPoint = arcPath.getPointAtLength(Math.max(0, lengthAtValue - epsilon))
    const nextPoint = arcPath.getPointAtLength(Math.min(totalLength, lengthAtValue + epsilon))
    const angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x) * 180 / Math.PI

    return { x: point.x, y: point.y, angle }
  }, [arcPath, normalizedValue])

  return (
    <div style={{
      position: 'absolute',
      left: `${thumbPosition.x}px`,
      top: `${thumbPosition.y}px`,
      transform: config.rotateThumbToTangent
        ? `translate(-50%, -50%) rotate(${thumbPosition.angle}deg)`
        : `translate(-50%, -50%)`,
      transition: 'transform 0.05s ease-out',
    }}>
      <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
```

### Range Slider with Dual Thumbs and Active Z-Index
```typescript
// Source: RangeSliderRenderer.tsx + user decision from CONTEXT.md
function StyledRangeSliderRenderer({ config }: RangeSliderRendererProps) {
  const normalizedMin = (config.minValue - config.min) / (config.max - config.min)
  const normalizedMax = (config.maxValue - config.min) / (config.max - config.min)

  // Extract layers - Range Slider extension to LinearLayers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      thumbLow: style.layers['thumb-low'] ? extractElementLayer(svgContent, style.layers['thumb-low']) : null,
      thumbHigh: style.layers['thumb-high'] ? extractElementLayer(svgContent, style.layers['thumb-high']) : null,
    }
  }, [style, svgContent])

  // Range fill between thumbs
  const rangeFillClipPath = useMemo(() => {
    const start = Math.min(normalizedMin, normalizedMax)
    const end = Math.max(normalizedMin, normalizedMax)

    if (config.orientation === 'vertical') {
      return `inset(${(1 - end) * 100}% 0 ${start * 100}% 0)`
    } else {
      return `inset(0 ${(1 - end) * 100}% 0 ${start * 100}%)`
    }
  }, [config.orientation, normalizedMin, normalizedMax])

  return (
    <>
      {/* Fill between thumbs */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: rangeFillClipPath,
        }}>
          <SafeSVG content={layers.fill} />
        </div>
      )}

      {/* Low thumb - z-index based on active state */}
      {layers?.thumbLow && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${normalizedMin * 100}%, 0)`,
          zIndex: config.activeThumbs?.includes('low') ? 2 : 1,
        }}>
          <SafeSVG content={layers.thumbLow} />
        </div>
      )}

      {/* High thumb - z-index based on active state */}
      {layers?.thumbHigh && (
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${normalizedMax * 100}%, 0)`,
          zIndex: config.activeThumbs?.includes('high') ? 2 : 1,
        }}>
          <SafeSVG content={layers.thumbHigh} />
        </div>
      )}
    </>
  )
}
```

### Bipolar Slider with Configurable Center and Dual Colors
```typescript
// Source: BipolarSliderRenderer.tsx + user decision from CONTEXT.md
function StyledBipolarSliderRenderer({ config }: BipolarSliderRendererProps) {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const centerValue = config.centerValue // User-configurable (not fixed at 0.5)

  // Determine fill direction and color
  const fillStart = Math.min(centerValue, normalizedValue)
  const fillEnd = Math.max(centerValue, normalizedValue)
  const fillColor = normalizedValue >= centerValue
    ? config.positiveFillColor  // User-configurable positive color
    : config.negativeFillColor  // User-configurable negative color

  // Apply fill color override dynamically
  const svgContent = useMemo(() => {
    if (!style) return ''
    const overrides = {
      ...config.colorOverrides,
      fill: fillColor, // Dynamic color based on value position
    }
    return applyAllColorOverrides(style.svgContent, style.layers, overrides)
  }, [style, config.colorOverrides, fillColor])

  // Fill clip-path from center to value
  const fillClipPath = useMemo(() => {
    if (config.orientation === 'vertical') {
      return `inset(${(1 - fillEnd) * 100}% 0 ${fillStart * 100}% 0)`
    } else {
      return `inset(0 ${(1 - fillEnd) * 100}% 0 ${fillStart * 100}%)`
    }
  }, [config.orientation, fillStart, fillEnd])

  return (
    <>
      {/* Fill from center to value, color changes based on direction */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: fillClipPath,
        }}>
          <SafeSVG content={layers.fill} />
        </div>
      )}
    </>
  )
}
```

### Notched Slider with Programmatic Tick Marks
```typescript
// Source: User decision from CONTEXT.md + NotchedSliderRenderer pattern
function StyledNotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
  // ... standard linear slider layers (thumb, track, fill)

  // Generate tick marks based on notchCount property
  const tickMarks = useMemo(() => {
    if (!config.showNotches) return []
    const marks: number[] = []
    for (let i = 0; i < config.notchCount; i++) {
      const normalizedPosition = i / (config.notchCount - 1)
      marks.push(normalizedPosition)
    }
    return marks
  }, [config.notchCount, config.showNotches])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* SVG layers: track, fill, thumb */}

      {/* Tick marks - CSS-rendered overlays (NOT from SVG layers) */}
      {tickMarks.map((position, index) => {
        const tickStyle: React.CSSProperties = config.orientation === 'vertical'
          ? {
              position: 'absolute',
              bottom: `${position * 100}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 2,
              backgroundColor: config.tickColor || '#666',
            }
          : {
              position: 'absolute',
              left: `${position * 100}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 2,
              height: 8,
              backgroundColor: config.tickColor || '#666',
            }

        return <div key={index} style={tickStyle} />
      })}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-only sliders | CSS + SVG dual rendering | Phase 55 (current) | Sliders gain SVG styling without breaking CSS |
| Knob-only SVG styling | Category-based element styling | Phase 53 (2026-02-04) | All linear/arc controls share styles |
| Per-element layer detection | Generalized category-based detection | Phase 53 | detectElementLayers(category) works for all slider types |
| Fixed bipolar center (50%) | Configurable center position | Phase 55 (current) | User controls center position and dual fill colors |
| Manual arc thumb positioning | SVG path getPointAtLength | Phase 55 (current) | Native browser API, no custom interpolation |
| scaleX for fill animation | clip-path for fill | Phase 55 (current) | Hardware-accelerated, no transform-origin issues |

**Deprecated/outdated:**
- knobLayers.ts service: Sliders don't use this (knob-specific), use elementLayers.ts instead
- transform scaleX for fill: Replace with clip-path for better performance and simpler code

## Open Questions

Things that couldn't be fully resolved:

1. **Range Slider Layer Detection Keywords**
   - What we know: LinearLayers has thumb, track, fill. Range Slider needs thumb-low and thumb-high.
   - What's unclear: Should detectElementLayers return thumb-low/thumb-high automatically, or require manual layer mapping?
   - Recommendation: Extend layer detection to support suffixed variants (thumb-low, thumb-high). Detection pattern: `slider-thumb-low`, `slider-thumb-high`. If not found, fall back to generic thumb layer (user can manually map).

2. **Arc Fill Path Segment Rendering**
   - What we know: Arc fill should follow curved path from start to value position.
   - What's unclear: Best implementation approach - SVG clipPath element, masked rendering, or path segment duplication?
   - Recommendation: Use SVG clipPath element with path segment (0 to lengthAtValue). Create clipPath element dynamically, reference in fill layer style. More performant than masking, cleaner than duplication.

3. **Crossfade Slider Visual Behavior**
   - What we know: Crossfade Slider balances between A and B (0 = full A, 1 = full B, 0.5 = equal mix).
   - What's unclear: How do SVG layers represent A/B balance? Two fill layers with opposite opacity? Special A/B thumb indicators?
   - Recommendation: Use two fill layers (fill-a and fill-b) with inverted clip-paths. Fill-a clips from 0 to value, fill-b clips from value to 1. Optional: separate thumb indicators for A and B positions.

4. **Multi-Slider Vertical Stacking**
   - What we know: All bands share one SVG style.
   - What's unclear: How are bands visually separated? Borders? Gaps? Part of SVG style or CSS overlay?
   - Recommendation: Bands have no visual separation (continuous appearance). If separation needed, use CSS borders between band containers (not part of SVG style).

5. **Color Override Generalization**
   - What we know: applyAllColorOverrides exists in knobLayers.ts for RotaryLayers.
   - What's unclear: Does elementLayers.ts have generalized color override function for LinearLayers/ArcLayers?
   - Recommendation: If not present, create `applyColorOverridesToLayers(svgContent, layers, overrides)` in elementLayers.ts that works with any layer schema (generic Record<string, string> approach).

## Sources

### Primary (HIGH confidence)
- src/components/elements/renderers/controls/KnobRenderer.tsx - Exact pattern for Default/Styled split
- src/components/elements/renderers/controls/SliderRenderer.tsx - Existing CSS implementation, thumb/track/fill structure
- src/components/elements/renderers/controls/RangeSliderRenderer.tsx - Dual thumb positioning, range fill calculation
- src/components/elements/renderers/controls/BipolarSliderRenderer.tsx - Center-origin fill, configurable center position
- src/components/elements/renderers/controls/ArcSliderRenderer.tsx - Arc path rendering, polarToCartesian utility
- src/types/elementStyle.ts - LinearLayers and ArcLayers interfaces, ElementStyle discriminated union
- src/services/elementLayers.ts - detectElementLayers, extractElementLayer, category-based detection
- src/services/export/svgElementExport.ts - LAYER_CONVENTIONS['slider'] definition
- .planning/phases/55-slider-styling/55-CONTEXT.md - User decisions and implementation boundaries
- .planning/phases/53-foundation/53-RESEARCH.md - ElementStyle architecture, category-based patterns
- .planning/phases/54-knob-variants/54-RESEARCH.md - Variant styling pattern, Default/Styled split

### Secondary (MEDIUM confidence)
- [SVGGeometryElement: getPointAtLength() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength) - Native browser API for path-following
- [Clipping in CSS and SVG - Sara Soueidan](https://www.sarasoueidan.com/blog/css-svg-clipping/) - clip-path vs masking, performance characteristics
- [Make a complex slider in React using SVG - Seth Corker](https://blog.sethcorker.com/make-a-complex-slider-in-react-using-svg/) - React SVG slider patterns, thumb positioning
- [Designing The Perfect Slider UX - Smashing Magazine](https://www.smashingmagazine.com/2017/07/designing-perfect-slider/) - Slider UX best practices, accessibility considerations

### Tertiary (LOW confidence)
- [svg-path-properties library](https://www.npmjs.com/package/svg-path-properties) - Alternative to getPointAtLength (not needed, native API sufficient)
- [Transforms on SVG Elements - CSS-Tricks](https://css-tricks.com/transforms-on-svg-elements/) - SVG transform patterns (verified scaleX has transform-origin issues)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, verified from Phase 53-54
- Architecture: HIGH - KnobRenderer and existing slider renderers provide exact patterns to follow
- Pitfalls: HIGH - Common mistakes identified from slider/category structure differences and web search findings
- Fill technique: MEDIUM - clip-path recommended based on web search performance findings, needs production validation
- Arc path-following: HIGH - Native browser API (getPointAtLength) is well-documented and standard approach

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable infrastructure, unlikely to change)
