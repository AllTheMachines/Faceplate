# Phase 57: Meter Styling - Research

**Researched:** 2026-02-04
**Domain:** SVG meter rendering with value-driven clip-path animation, peak hold indicators, multi-zone fill layers
**Confidence:** HIGH

## Summary

This phase extends SVG styling support from controls (Phase 53-56) to professional audio meters. All professional meter types (RMS, VU, PPM, LUFS, K-System, etc.) currently render as segmented LED-style meters with CSS Grid, and will adopt the elementStyles system using the 'meter' category.

The existing architecture provides complete foundations:
- ElementStyle type with 'meter' category already defined (Phase 53)
- MeterLayers schema: background/body, fill (single or multi-zone), scale, peak, segments
- All meters use SegmentedMeter component showing current implementation patterns
- extractElementLayer() and color override services proven (Phase 53-56)
- clip-path animation pattern established in SliderRenderer (Phase 55)

User decisions from CONTEXT.md lock critical implementation choices:
- **clip-path** for fill reveal (not scaleY or height) - preserves SVG gradients/textures
- **Separate SVG layers** for green/yellow/red zones with stacked reveal
- **Bottom-up** fill direction for vertical (inverted clip-path), **left-to-right** for horizontal
- **CSS transform rotate(90deg)** for horizontal orientation (designers create vertical only)
- **Peak hold duration** configurable per-element, instant drop (no fade), color override available
- Layer naming follows Phase 56 patterns (meter-* prefix conventions)

**Primary recommendation:** Follow StyledSliderRenderer pattern exactly - use clip-path inset() for fill animation (proven performant), stack three fill layers (green/yellow/red) with independent clip-paths, position peak indicator with absolute positioning from SegmentedMeter pattern, apply CSS transform rotate(90deg) for horizontal meters.

## Standard Stack

All libraries already in use from Phase 53-56:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.6.2 | Type system | Discriminated unions, type-safe layer access |
| React | 18.3.1 | Component rendering | Hooks for memoization, conditional layer rendering |
| DOMParser | Browser API | SVG parsing | Layer extraction (proven in Phase 53) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SafeSVG | Codebase component | SVG sanitization | Rendering extracted layers (used in all styled renderers) |
| elementLayers.ts | Codebase service | Layer detection/extraction | Import workflow (detectElementLayers, extractElementLayer) |
| knobLayers.ts | Codebase service | Color override | applyAllColorOverrides, applyColorOverride for peak color |
| meterUtils.ts | Codebase service | dB calculations | dbToNormalized, normalizedToDb, defaultColorZones |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| clip-path inset | scaleY transform | CONTEXT.md locked: clip-path preserves gradients, more performant |
| Stacked fill layers | Single gradient | CONTEXT.md locked: separate SVG layers for zone control |
| CSS rotate | Duplicate horizontal SVGs | CONTEXT.md locked: rotate keeps authoring simple |

**Installation:**
No new dependencies required. All infrastructure from Phase 53-56.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── elementStyle.ts                    # MeterLayers already defined
├── components/elements/renderers/displays/
│   ├── MeterRenderer.tsx                  # UPDATE: Add StyledMeterRenderer
│   └── meters/
│       ├── RMSMeterRenderer.tsx           # UPDATE: Delegate to styled variant
│       ├── VUMeterRenderer.tsx            # UPDATE: Delegate to styled variant
│       ├── KMeterRenderer.tsx             # UPDATE: Delegate to styled variant
│       ├── SegmentedMeter.tsx             # REFERENCE: Existing pattern for peak positioning
│       └── PeakHoldIndicator.tsx          # REFERENCE: Absolute positioning pattern
├── components/Properties/meters/
│   └── SharedMeterProperties.tsx          # UPDATE: Add style dropdown + color overrides
├── services/
│   └── export/
│       └── svgElementExport.ts            # UPDATE: Add LAYER_CONVENTIONS.meter
```

### Pattern 1: Default vs Styled Renderer Pattern
**What:** Split rendering into CSS-based segmented display and SVG-based styled implementations
**When to use:** All professional meter types
**Example:**
```typescript
// Source: Pattern from SliderRenderer + SegmentedMeter existing code
// Apply to: RMS, VU, PPM, LUFS, K-System, True Peak, etc.

// Main renderer (delegates)
export function RMSMeterMonoRenderer({ config }: Props) {
  if (!config.styleId) {
    return <DefaultRMSMeterRenderer config={config} />
  }
  return <StyledRMSMeterRenderer config={config} />
}

// Default renderer (existing CSS segmented implementation - NO CHANGES)
function DefaultRMSMeterRenderer({ config }: Props) {
  // Existing SegmentedMeter + MeterScale implementation
  return (
    <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column' }}>
      {scalePosition === 'outside' && <MeterScale {...} />}
      <SegmentedMeter
        value={config.value}
        segmentCount={config.segmentCount}
        colorZones={config.colorZones}
        showPeakHold={config.showPeakHold}
        {...}
      />
    </div>
  )
}

// NEW: SVG-based styled implementation
function StyledRMSMeterRenderer({ config }: Props) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation
  if (style && style.category !== 'meter') {
    console.warn('Meter requires meter category style')
    return null
  }

  // ... layer extraction and rendering (Pattern 2)
}
```

### Pattern 2: Multi-Zone Fill with clip-path
**What:** Stack three fill layers (green/yellow/red) with independent clip-path values
**When to use:** Professional meters with color zones
**Example:**
```typescript
// Source: CONTEXT.md + SliderRenderer clip-path pattern + meterUtils.ts
// Vertical meter fills bottom-up, horizontal fills left-to-right

function StyledRMSMeterRenderer({ config }: Props) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Normalize value (0-1)
  const normalizedValue = config.value // Already 0-1 in professional meters

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      background: style.layers.body ? extractElementLayer(svgContent, style.layers.body) : null,
      fillGreen: style.layers['fill-green'] ? extractElementLayer(svgContent, style.layers['fill-green']) : null,
      fillYellow: style.layers['fill-yellow'] ? extractElementLayer(svgContent, style.layers['fill-yellow']) : null,
      fillRed: style.layers['fill-red'] ? extractElementLayer(svgContent, style.layers['fill-red']) : null,
      peak: style.layers.peak ? extractElementLayer(svgContent, style.layers.peak) : null,
      scale: style.layers.scale ? extractElementLayer(svgContent, style.layers.scale) : null,
    }
  }, [style, svgContent])

  // Calculate zone thresholds (dB to normalized)
  const greenThreshold = 1.0 // Green always shows to value position
  const yellowThreshold = dbToNormalized(-18, config.minDb, config.maxDb) // Yellow starts at -18dB
  const redThreshold = dbToNormalized(-6, config.minDb, config.maxDb) // Red starts at -6dB

  // Calculate clip-paths for each zone
  const isVertical = config.orientation === 'vertical'

  // Green: shows from 0 to value position
  const greenClipPath = isVertical
    ? `inset(${(1 - normalizedValue) * 100}% 0 0 0)` // Bottom-up: clip from top
    : `inset(0 ${(1 - normalizedValue) * 100}% 0 0)` // Left-to-right: clip from right

  // Yellow: shows from yellowThreshold to value position (if value exceeds threshold)
  const yellowVisible = normalizedValue > yellowThreshold
  const yellowClipPath = isVertical
    ? `inset(${(1 - normalizedValue) * 100}% 0 ${yellowThreshold * 100}% 0)` // Show between threshold and value
    : `inset(0 ${(1 - normalizedValue) * 100}% 0 ${yellowThreshold * 100}%)`

  // Red: shows from redThreshold to value position (if value exceeds threshold)
  const redVisible = normalizedValue > redThreshold
  const redClipPath = isVertical
    ? `inset(${(1 - normalizedValue) * 100}% 0 ${redThreshold * 100}% 0)` // Show between threshold and value
    : `inset(0 ${(1 - normalizedValue) * 100}% 0 ${redThreshold * 100}%)`

  if (!style) {
    return <div style={{ color: 'red' }}>Style not found</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background layer - static */}
      {layers?.background && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.background} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Green fill layer - base zone, always shows to value position */}
      {layers?.fillGreen && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: greenClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fillGreen} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Yellow fill layer - reveals on top of green above -18dB */}
      {layers?.fillYellow && yellowVisible && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: yellowClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fillYellow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Red fill layer - reveals on top of yellow above -6dB */}
      {layers?.fillRed && redVisible && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: redClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fillRed} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Scale layer - static ticks/markings (optional) */}
      {layers?.scale && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.scale} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Peak hold indicator - positioned at peak value */}
      {config.showPeakHold && layers?.peak && (
        <PeakIndicatorSVG
          position={normalizedValue}
          orientation={config.orientation}
          peakLayer={layers.peak}
          colorOverride={config.colorOverrides?.peak}
        />
      )}
    </div>
  )
}
```

### Pattern 3: Peak Indicator Positioning
**What:** Absolute position peak layer based on normalized value
**When to use:** All meters with peak hold enabled
**Example:**
```typescript
// Source: PeakHoldIndicator.tsx pattern + layer extraction
// Peak indicator is SVG layer positioned at peak value, not programmatic line

interface PeakIndicatorSVGProps {
  position: number // 0-1 normalized
  orientation: 'vertical' | 'horizontal'
  peakLayer: string // Extracted SVG content
  colorOverride?: string // Optional color override
}

function PeakIndicatorSVG({ position, orientation, peakLayer, colorOverride }: PeakIndicatorSVGProps) {
  // Apply color override if provided
  const peakContent = useMemo(() => {
    if (!colorOverride) return peakLayer
    return applyColorOverride(peakLayer, 'peak', colorOverride)
  }, [peakLayer, colorOverride])

  // Calculate position (same logic as PeakHoldIndicator)
  const isVertical = orientation === 'vertical'
  const positionStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: `${position * 100}%`, // Vertical: 0 = bottom, 1 = top
        transform: 'translateY(50%)', // Center on position
      }
    : {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${position * 100}%`, // Horizontal: 0 = left, 1 = right
        transform: 'translateX(-50%)', // Center on position
      }

  return (
    <div style={positionStyle}>
      <SafeSVG content={peakContent} style={{ width: '100%', height: 'auto' }} />
    </div>
  )
}
```

### Pattern 4: Horizontal Orientation via CSS Rotate
**What:** Apply transform rotate(90deg) to entire meter container for horizontal orientation
**When to use:** Any meter with orientation === 'horizontal'
**Example:**
```typescript
// Source: CONTEXT.md decision + MDN CSS rotate documentation
// Designers create vertical meter SVGs, rotate 90° for horizontal

function StyledRMSMeterRenderer({ config }: Props) {
  // ... layer extraction

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...(config.orientation === 'horizontal' && {
      transform: 'rotate(90deg)',
      transformOrigin: 'center center',
    }),
  }

  return (
    <div style={containerStyle}>
      {/* All layers render as vertical, CSS rotates entire container */}
      {layers?.background && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.background} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
      {/* ... fill layers, peak indicator */}
    </div>
  )
}
```

### Pattern 5: Fallback to Single Fill Layer
**What:** Support legacy/simple SVGs with single 'fill' layer instead of zone layers
**When to use:** SVGs that don't have separate fill-green/yellow/red layers
**Example:**
```typescript
// Source: CONTEXT.md - "fallback to single 'fill' layer"
// Phase 56 pattern - optional layers with fallbacks

const layers = useMemo(() => {
  if (!style || !svgContent) return null

  // Try zone-specific layers first
  const fillGreen = style.layers['fill-green'] ? extractElementLayer(svgContent, style.layers['fill-green']) : null
  const fillYellow = style.layers['fill-yellow'] ? extractElementLayer(svgContent, style.layers['fill-yellow']) : null
  const fillRed = style.layers['fill-red'] ? extractElementLayer(svgContent, style.layers['fill-red']) : null

  // Fallback to single fill layer if no zone layers
  const singleFill = (!fillGreen && !fillYellow && !fillRed && style.layers.fill)
    ? extractElementLayer(svgContent, style.layers.fill)
    : null

  return {
    background: style.layers.body ? extractElementLayer(svgContent, style.layers.body) : null,
    fillGreen: fillGreen || singleFill, // Use single fill as green zone if no zones
    fillYellow,
    fillRed,
    peak: style.layers.peak ? extractElementLayer(svgContent, style.layers.peak) : null,
    scale: style.layers.scale ? extractElementLayer(svgContent, style.layers.scale) : null,
  }
}, [style, svgContent])
```

### Anti-Patterns to Avoid
- **Using scaleY for fill:** CONTEXT.md locked: clip-path preserves gradients, scaleY distorts artwork
- **Animating height/width:** CONTEXT.md locked: clip-path is more performant, hardware-accelerated
- **Creating separate horizontal SVGs:** CONTEXT.md locked: rotate 90° keeps authoring simple
- **Programmatic peak line:** Use SVG layer, not DOM element (consistency with layer model)
- **Fading peak drop:** CONTEXT.md locked: instant drop (no fade or fall animation)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| dB to normalized conversion | Custom math | dbToNormalized (meterUtils.ts) | Already handles edge cases, tested |
| Color zone thresholds | Hard-coded values | defaultColorZones (meterUtils.ts) | Standard -18dB yellow, -6dB red |
| Peak positioning | Calculate segment offsets | PeakHoldIndicator pattern | Handles segment gaps, orientation |
| Zone visibility logic | Manual threshold checks | Conditional rendering with dbToNormalized | Consistent across all meters |
| Color override | String replacement | applyColorOverride (knobLayers.ts) | Handles fill/stroke, nested elements |

**Key insight:** Phase 55 (slider clip-path), Phase 23 (segmented meters), and Phase 53 (layer extraction) solved all the hard problems. This phase combines proven patterns from each.

## Common Pitfalls

### Pitfall 1: Inverted clip-path for Vertical Meters
**What goes wrong:** Vertical meter fills from top down instead of bottom up
**Why it happens:** Forgetting to invert clip-path percentage for vertical orientation
**How to avoid:** Bottom = 0, Top = 100%, so clip from top: `inset(${(1 - value) * 100}% 0 0 0)`
**Warning signs:** Meter appears to "drain" instead of "fill"

Example:
```typescript
// BAD: Fills from top (like slider)
const clipPath = `inset(${value * 100}% 0 0 0)` // Clips bottom, reveals top

// GOOD: Fills from bottom (like audio meter)
const clipPath = `inset(${(1 - value) * 100}% 0 0 0)` // Clips top, reveals bottom
```

### Pitfall 2: Zone Layer Stacking Order
**What goes wrong:** Red zone appears below green, zones don't overlap correctly
**Why it happens:** DOM order matters for stacking context
**How to avoid:** Render green first (base), yellow second (middle), red last (top)
**Warning signs:** Yellow doesn't cover green, red doesn't cover yellow

Example:
```typescript
// BAD: Red renders first, gets covered by green
<div>{layers.fillRed}</div>
<div>{layers.fillYellow}</div>
<div>{layers.fillGreen}</div>

// GOOD: Green base, yellow middle, red top
<div>{layers.fillGreen}</div>
<div>{layers.fillYellow}</div>
<div>{layers.fillRed}</div>
```

### Pitfall 3: Peak Indicator Transform Origin
**What goes wrong:** Peak indicator positioned off-center or at wrong edge
**Why it happens:** translateY/translateX without considering indicator height/width
**How to avoid:** Use translateY(50%) for vertical, translateX(-50%) for horizontal to center on position
**Warning signs:** Peak indicator appears above/below actual peak value

Example:
```typescript
// BAD: Peak indicator edge at position
bottom: `${position * 100}%` // Top edge of indicator at peak

// GOOD: Peak indicator centered at position
bottom: `${position * 100}%`,
transform: 'translateY(50%)' // Centers indicator on peak
```

### Pitfall 4: Horizontal Rotation Coordinate System
**What goes wrong:** Fill direction wrong after rotation, clip-path values incorrect
**Why it happens:** Trying to recalculate clip-path for rotated coordinate system
**How to avoid:** Apply rotation to container AFTER all layers render as vertical. Clip-path values stay vertical, CSS handles rotation.
**Warning signs:** Horizontal meter doesn't work, or requires separate clip-path logic

Example:
```typescript
// BAD: Different clip-path logic for horizontal
const clipPath = orientation === 'horizontal'
  ? `inset(0 ${(1 - value) * 100}% 0 0)` // Trying to account for rotation
  : `inset(${(1 - value) * 100}% 0 0 0)`

// GOOD: Same clip-path for all, rotate container
const clipPath = `inset(${(1 - value) * 100}% 0 0 0)` // Always vertical
const containerStyle = {
  ...(orientation === 'horizontal' && { transform: 'rotate(90deg)' })
}
```

### Pitfall 5: Peak Hold Duration Not Per-Instance
**What goes wrong:** All meters share same peak hold duration setting
**Why it happens:** Using global config instead of per-element property
**How to avoid:** CONTEXT.md: "Peak hold duration: configurable per-element". Use config.peakHoldDuration from element properties.
**Warning signs:** Changing one meter's peak hold affects all meters

Example:
```typescript
// BAD: Global constant
const PEAK_HOLD_DURATION = 2000

// GOOD: Per-element config
const peakHoldDuration = config.peakHoldDuration // From element properties
```

## Code Examples

Verified patterns from existing codebase:

### Complete Styled Meter Renderer
```typescript
// Source: SliderRenderer pattern + SegmentedMeter + meterUtils + CONTEXT.md

function StyledRMSMeterRenderer({ config }: RMSMeterRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'meter') {
    console.warn('Meter requires meter category style')
    return null
  }

  const normalizedValue = config.value // Already 0-1

  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  const layers = useMemo(() => {
    if (!style || !svgContent) return null

    const fillGreen = style.layers['fill-green'] ? extractElementLayer(svgContent, style.layers['fill-green']) : null
    const fillYellow = style.layers['fill-yellow'] ? extractElementLayer(svgContent, style.layers['fill-yellow']) : null
    const fillRed = style.layers['fill-red'] ? extractElementLayer(svgContent, style.layers['fill-red']) : null
    const singleFill = (!fillGreen && !fillYellow && !fillRed && style.layers.fill)
      ? extractElementLayer(svgContent, style.layers.fill)
      : null

    return {
      background: style.layers.body ? extractElementLayer(svgContent, style.layers.body) : null,
      fillGreen: fillGreen || singleFill,
      fillYellow,
      fillRed,
      peak: style.layers.peak ? extractElementLayer(svgContent, style.layers.peak) : null,
      scale: style.layers.scale ? extractElementLayer(svgContent, style.layers.scale) : null,
    }
  }, [style, svgContent])

  // Zone thresholds
  const yellowThreshold = dbToNormalized(-18, config.minDb, config.maxDb)
  const redThreshold = dbToNormalized(-6, config.minDb, config.maxDb)

  // Clip-paths (always vertical, rotation handled by container)
  const greenClipPath = `inset(${(1 - normalizedValue) * 100}% 0 0 0)`
  const yellowVisible = normalizedValue > yellowThreshold
  const yellowClipPath = `inset(${(1 - normalizedValue) * 100}% 0 ${yellowThreshold * 100}% 0)`
  const redVisible = normalizedValue > redThreshold
  const redClipPath = `inset(${(1 - normalizedValue) * 100}% 0 ${redThreshold * 100}% 0)`

  if (!style) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#374151', borderRadius: '4px',
        color: '#9CA3AF', fontSize: '12px', textAlign: 'center', padding: '8px',
      }}>
        Style not found
      </div>
    )
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...(config.orientation === 'horizontal' && {
      transform: 'rotate(90deg)',
      transformOrigin: 'center center',
    }),
  }

  return (
    <div style={containerStyle}>
      {/* Background */}
      {layers?.background && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.background} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Green zone fill */}
      {layers?.fillGreen && (
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: greenClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fillGreen} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Yellow zone fill */}
      {layers?.fillYellow && yellowVisible && (
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: yellowClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fillYellow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Red zone fill */}
      {layers?.fillRed && redVisible && (
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: redClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fillRed} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Scale/ticks */}
      {layers?.scale && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.scale} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Peak hold indicator */}
      {config.showPeakHold && layers?.peak && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: `${normalizedValue * 100}%`,
          transform: 'translateY(50%)',
        }}>
          <SafeSVG content={layers.peak} style={{ width: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  )
}
```

### Zone Clip-Path Calculation
```typescript
// Source: SliderRenderer clip-path + meterUtils threshold logic

// Calculate zone visibility and clip-paths
function calculateZoneClipping(
  normalizedValue: number,
  yellowThreshold: number,
  redThreshold: number
) {
  // Green: always shows from bottom to value position
  const greenClipPath = `inset(${(1 - normalizedValue) * 100}% 0 0 0)`

  // Yellow: shows between yellowThreshold and value (if value exceeds threshold)
  const yellowVisible = normalizedValue > yellowThreshold
  const yellowClipPath = `inset(${(1 - normalizedValue) * 100}% 0 ${yellowThreshold * 100}% 0)`

  // Red: shows between redThreshold and value (if value exceeds threshold)
  const redVisible = normalizedValue > redThreshold
  const redClipPath = `inset(${(1 - normalizedValue) * 100}% 0 ${redThreshold * 100}% 0)`

  return {
    green: { visible: true, clipPath: greenClipPath },
    yellow: { visible: yellowVisible, clipPath: yellowClipPath },
    red: { visible: redVisible, clipPath: redClipPath },
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS Grid segmented meters | SVG layer support | v0.11.0 (Phase 57) | User-customizable meter artwork |
| Single meter color | Multi-zone color layers | v0.11.0 (Phase 57) | Designer controls zone colors/gradients |
| Programmatic peak line | SVG peak layer | v0.11.0 (Phase 57) | Custom peak indicator artwork |
| Orientation-specific rendering | CSS rotate(90deg) | v0.11.0 (Phase 57) | Single vertical SVG works for both |

**Deprecated/outdated:**
- None. This phase is additive. DefaultRenderers (existing CSS segmented implementations) remain unchanged and are still used when styleId is undefined.

## Open Questions

Things that couldn't be fully resolved:

1. **Peak Indicator Shape**
   - What we know: CONTEXT.md marked as "Claude's discretion" - thin line vs SVG-defined
   - What's unclear: Should peak always be SVG layer, or support programmatic line as fallback?
   - Recommendation: **SVG layer only** (consistency with layer model)
     - MeterLayers includes `peak?: string` for SVG layer
     - No fallback to programmatic line (user can create thin rectangle layer in SVG)
     - Rationale: Consistent with Phase 56 pattern - all visuals from SVG layers
     - Color override via applyColorOverride (same as LED on power button)

2. **Fill Zone Layer Requirements**
   - What we know: CONTEXT.md marked as "Claude's discretion" - all optional with fallbacks vs required
   - What's unclear: Should zone layers be required, or fallback to single fill?
   - Recommendation: **All optional with single fill fallback** (flexibility)
     - Try fill-green/yellow/red first, if none exist, use 'fill' layer
     - MeterLayers: `fill?: string` (single), `'fill-green'?: string`, `'fill-yellow'?: string`, `'fill-red'?: string` (zones)
     - Rationale: Supports both simple meters (single fill) and professional meters (zone layers)
     - Detection: detectElementLayers finds all variants

3. **Scale/Ticks Layer Rendering**
   - What we know: CONTEXT.md: "Optional layer: scale/ticks (rendered statically if present)"
   - What's unclear: Static only, or should ticks adapt to meter range?
   - Recommendation: **Static rendering** (simplicity)
     - Scale layer renders as-is, no programmatic tick generation for SVG meters
     - Designer creates scale matching their meter range (-60 to 0, -20 to +3, etc.)
     - Rationale: User has full control over scale appearance in SVG
     - Programmatic MeterScale component still available for CSS meters

4. **Stereo Meter Styling**
   - What we know: Existing stereo meters use side-by-side SegmentedMeter instances
   - What's unclear: Single wide SVG for both channels, or two SVG instances?
   - Recommendation: **Two SVG instances** (reuse mono renderer)
     - StereoMeterRenderer renders two StyledMeterRenderer instances side by side
     - Each channel gets same styleId, different value
     - Rationale: Matches existing CSS pattern, simpler than dual-channel SVG authoring
     - User creates single vertical meter SVG, used twice

## Sources

### Primary (HIGH confidence)
- Existing codebase: src/components/elements/renderers/displays/meters/SegmentedMeter.tsx - Segmented meter rendering
- Existing codebase: src/components/elements/renderers/displays/meters/PeakHoldIndicator.tsx - Peak positioning pattern
- Existing codebase: src/components/elements/renderers/controls/SliderRenderer.tsx - clip-path animation pattern (lines 306-326)
- Existing codebase: src/utils/meterUtils.ts - dB conversion, color zones, threshold calculations
- Existing codebase: src/types/elementStyle.ts - MeterLayers definition (lines 84-90)
- Existing codebase: src/services/elementLayers.ts - Layer detection and extraction
- Existing codebase: src/services/knobLayers.ts - Color override (applyColorOverride, applyAllColorOverrides)
- Phase 55 research: .planning/phases/55-slider-styling/55-RESEARCH.md - clip-path patterns for value animation
- Phase 56 research: .planning/phases/56-button-switch-styling/56-RESEARCH.md - Layer schema patterns, styled renderer delegation
- Phase 23 research: .planning/phases/23-professional-meters/23-RESEARCH.md - Professional meter standards, segmented rendering
- CONTEXT.md: .planning/phases/57-meter-styling/57-CONTEXT.md - User decisions (clip-path, zone layers, rotation, peak behavior)

### Secondary (MEDIUM confidence)
- [CSS clip-path Performance - The Magic of Clip Path](https://emilkowal.ski/ui/the-magic-of-clip-path) - Hardware acceleration, performance considerations
- [CSS clip-path - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path) - Inset syntax, animation support
- [Animating with Clip-Path - CSS-Tricks](https://css-tricks.com/animating-with-clip-path/) - Animation patterns, browser support
- [CSS rotate - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/rotate) - Transform rotate syntax, degrees/turns
- [Audio Meter Color Zones - dpoindexter.com](https://www.dpoindexter.com/garden/audio-meter-zones/) - Professional -18dB yellow, -6dB red standards
- [Peak Hold and Clipping Indicators - Source Elements](https://support.source-elements.com/peak-hold-and-clipping-indicators) - Peak hold duration behavior, instant drop

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use from Phase 53-56
- Architecture: HIGH - All patterns demonstrated in existing slider/meter renderers
- Layer schemas: HIGH - Based on CONTEXT.md user decisions + Phase 56 patterns
- clip-path animation: HIGH - Proven pattern from SliderRenderer (Phase 55)
- Zone stacking: HIGH - CONTEXT.md locked decision + CSS stacking context (standard)
- Rotation: HIGH - MDN documentation + CONTEXT.md decision

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, patterns proven in Phase 53-56)
