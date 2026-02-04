# Phase 56: Button & Switch Styling - Research

**Researched:** 2026-02-04
**Domain:** Button and switch state layer rendering, SVG state swapping, multi-position controls
**Confidence:** HIGH

## Summary

This phase extends the ElementStyle system (established in Phase 53-55) to buttons and switches. The research confirms that all 7 element types (Button, Icon Button, Toggle Switch, Power Button, Rocker Switch, Rotary Switch, Segment Button) can be handled with the existing architecture, but requires distinct layer schemas tailored to each control type's state requirements.

The codebase already has working implementations of all 7 elements with CSS-based visuals (ButtonRenderer.tsx, ToggleSwitchRenderer.tsx, RockerSwitchRenderer.tsx, RotarySwitchRenderer.tsx exist and show current state handling). The phase will add SVG layer support using the same delegation pattern as knobs/sliders: DefaultRenderer (existing CSS) vs StyledRenderer (new SVG layers).

**Key architectural decisions from CONTEXT.md:**
1. **Per-element layer schemas** (not unified) - ButtonLayers, ToggleLayers, RockerLayers, etc. with tailored required/optional layers
2. **State layer structure** - Single SVG with named layers, detection extracts each state (normal, pressed, on, off, position-0, position-1, etc.)
3. **Fill replacement method** for icon coloring (proven pattern from knob indicator, works for both icons and backgrounds)
4. **Direct position jumps** for rocker/rotary switches (no intermediate visual states, transition: none)
5. **Toggle switch slide is baked into artwork** (layer swap only, no sliding animation)

**Primary recommendation:** Create 7 distinct layer schemas matching each element's state model. Reuse StyledRenderer pattern from knobs/sliders (default CSS → styled SVG delegation). Follow rotary switch's existing "static base + rotating pointer" pattern. Use extractElementLayer + layer opacity/visibility for state swapping.

## Standard Stack

All libraries already in use from Phase 53-55:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.6.2 | Type system | Discriminated unions, exhaustiveness checking |
| React | 18.3.1 | Component rendering | Conditional layer rendering, SafeSVG wrapper |
| DOMParser | Browser API | SVG parsing | Layer detection, extraction (proven in Phase 53) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SafeSVG | Codebase component | SVG sanitization | Rendering extracted layers (used in all styled renderers) |
| elementLayers.ts | Codebase service | Layer detection/extraction | Import workflow (detectElementLayers, extractElementLayer) |
| knobLayers.ts | Codebase service | Color override | applyAllColorOverrides (works for any layer, not knob-specific) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Per-element schemas | Unified ButtonLayers | Unified schema can't represent different state models (2-state vs 3-position vs N-position) |
| Animated transitions | CSS transitions | CONTEXT.md locked: keep current behavior (instant jumps), transitions only where they already exist |
| Per-segment state layers | Highlight layer overlay | Deferred to Claude's discretion - both are viable |

**Installation:**
No new dependencies required. All tools from Phase 53-55 apply.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── elementStyle.ts        # UPDATE: Add ButtonLayers, ToggleLayers, etc.
├── components/elements/renderers/controls/
│   ├── ButtonRenderer.tsx            # UPDATE: Add StyledButtonRenderer
│   ├── ToggleSwitchRenderer.tsx      # UPDATE: Add StyledToggleSwitchRenderer
│   ├── RockerSwitchRenderer.tsx      # UPDATE: Add StyledRockerSwitchRenderer
│   ├── RotarySwitchRenderer.tsx      # UPDATE: Add StyledRotarySwitchRenderer
│   ├── IconButtonRenderer.tsx        # NEW: Create (no existing implementation found)
│   ├── PowerButtonRenderer.tsx       # NEW: Create (no existing implementation found)
│   └── SegmentButtonRenderer.tsx     # NEW: Create (no existing implementation found)
```

### Pattern 1: Per-Element Layer Schemas
**What:** Each button/switch type has its own layer schema matching its state model
**When to use:** Defining layer structure for state-based controls
**Example:**
```typescript
// Source: Phase 53 research + CONTEXT.md decisions

// Simple 2-state button (normal/pressed)
export interface ButtonLayers {
  normal?: string      // Normal state layer
  pressed?: string     // Pressed state layer
  icon?: string        // Icon layer (colored via fill replacement)
  label?: string       // Optional text label layer
}

// Toggle switch (on/off with independent indicator)
export interface ToggleLayers {
  background?: string  // Background body
  on?: string          // On state layer
  off?: string         // Off state layer
  indicator?: string   // LED/indicator (toggles independently)
  thumb?: string       // Optional thumb layer (if slide is in artwork)
}

// Power button (2-state with LED)
export interface PowerButtonLayers {
  normal?: string      // Normal state background
  pressed?: string     // Pressed state background
  icon?: string        // Power icon (colored via fill replacement)
  led?: string         // LED indicator (toggles independently)
}

// Rocker switch (3-position: up/center/down)
export interface RockerLayers {
  base?: string        // Static background
  'position-0'?: string  // Down state
  'position-1'?: string  // Center state
  'position-2'?: string  // Up state
}

// Rotary switch (N-position with rotating selector)
export interface RotaryLayers {
  base?: string        // Static background
  selector?: string    // Rotating pointer/selector
  // Optional position labels (extracted from SVG or programmatic)
}

// Segment button (N-segment with selection highlight)
export interface SegmentLayers {
  base?: string          // Background segments
  highlight?: string     // Selection highlight (moves/replicates per segment)
  // OR per-segment approach:
  // 'segment-0'?: string, 'segment-1'?: string, etc.
}

// Icon button (simple button with icon only)
export interface IconButtonLayers {
  normal?: string      // Normal state layer
  pressed?: string     // Pressed state layer
  icon?: string        // Icon layer (colored via fill replacement)
}
```

### Pattern 2: State Layer Swapping
**What:** Show/hide layers based on state using visibility/opacity
**When to use:** Rendering state-based controls with SVG layers
**Example:**
```typescript
// Source: DotIndicatorKnobRenderer.tsx pattern + CONTEXT.md decisions

function StyledButtonRenderer({ config }: ButtonRendererProps) {
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Extract layers once
  const layers = useMemo(() => {
    if (!style || !style.svgContent) return null
    return {
      normal: style.layers.normal ? extractElementLayer(style.svgContent, style.layers.normal) : null,
      pressed: style.layers.pressed ? extractElementLayer(style.svgContent, style.layers.pressed) : null,
      icon: style.layers.icon ? extractElementLayer(style.svgContent, style.layers.icon) : null,
    }
  }, [style])

  // Apply color overrides to icon layer
  const iconContent = useMemo(() => {
    if (!layers?.icon || !config.colorOverrides?.icon) return layers?.icon
    return applyColorOverride(layers.icon, style.layers.icon, config.colorOverrides.icon)
  }, [layers, config.colorOverrides])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Normal state - visible when NOT pressed */}
      {layers?.normal && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.pressed ? 0 : 1,
          transition: 'none',  // Instant swap
        }}>
          <SafeSVG content={layers.normal} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Pressed state - visible when pressed */}
      {layers?.pressed && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.pressed ? 1 : 0,
          transition: 'none',  // Instant swap
        }}>
          <SafeSVG content={layers.pressed} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Icon layer - always visible, colored */}
      {iconContent && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={iconContent} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Pattern 3: Multi-Position Controls (Rocker/Rotary)
**What:** Numbered position layers with direct jumps
**When to use:** Controls with discrete positions (rocker: 3, rotary: 2-12)
**Example:**
```typescript
// Source: RockerSwitchRenderer.tsx + RotarySwitchRenderer.tsx existing behavior

// Rocker Switch (3-position: discrete state layers)
function StyledRockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
  const layers = useMemo(() => {
    if (!style) return null
    return {
      base: extractElementLayer(style.svgContent, style.layers.base),
      position0: extractElementLayer(style.svgContent, style.layers['position-0']),
      position1: extractElementLayer(style.svgContent, style.layers['position-1']),
      position2: extractElementLayer(style.svgContent, style.layers['position-2']),
    }
  }, [style])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static base */}
      {layers?.base && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position layers - show only active position */}
      {layers?.position0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: config.position === 0 ? 1 : 0, transition: 'none' }}>
          <SafeSVG content={layers.position0} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
      {layers?.position1 && (
        <div style={{ position: 'absolute', inset: 0, opacity: config.position === 1 ? 1 : 0, transition: 'none' }}>
          <SafeSVG content={layers.position1} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
      {layers?.position2 && (
        <div style={{ position: 'absolute', inset: 0, opacity: config.position === 2 ? 1 : 0, transition: 'none' }}>
          <SafeSVG content={layers.position2} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}

// Rotary Switch (N-position: rotating selector on static base)
function StyledRotarySwitchRenderer({ config }: RotarySwitchRendererProps) {
  const layers = useMemo(() => {
    if (!style) return null
    return {
      base: extractElementLayer(style.svgContent, style.layers.base),
      selector: extractElementLayer(style.svgContent, style.layers.selector),
    }
  }, [style])

  // Calculate selector rotation (same logic as existing RotarySwitchRenderer)
  const anglePerPosition = config.positionCount > 1 ? config.rotationAngle / (config.positionCount - 1) : 0
  const startAngle = -config.rotationAngle / 2
  const currentAngle = startAngle + config.currentPosition * anglePerPosition

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static base */}
      {layers?.base && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Rotating selector */}
      {layers?.selector && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: `rotate(${currentAngle}deg)`,
          transformOrigin: 'center center',
          transition: 'none',  // Instant position change
        }}>
          <SafeSVG content={layers.selector} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Pattern 4: Independent Indicator Toggle (Toggle/Power)
**What:** LED/indicator layer toggles independently of background state
**When to use:** Toggle switch, power button (indicator separate from main state)
**Example:**
```typescript
// Source: ToggleSwitchRenderer.tsx + CONTEXT.md decisions

function StyledToggleSwitchRenderer({ config }: ToggleSwitchRendererProps) {
  const layers = useMemo(() => {
    if (!style) return null
    return {
      background: extractElementLayer(style.svgContent, style.layers.background),
      on: extractElementLayer(style.svgContent, style.layers.on),
      off: extractElementLayer(style.svgContent, style.layers.off),
      indicator: extractElementLayer(style.svgContent, style.layers.indicator),
    }
  }, [style])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background (always visible) */}
      {layers?.background && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.background} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Off state layer (visible when off) */}
      {layers?.off && (
        <div style={{ position: 'absolute', inset: 0, opacity: config.isOn ? 0 : 1, transition: 'none' }}>
          <SafeSVG content={layers.off} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* On state layer (visible when on) */}
      {layers?.on && (
        <div style={{ position: 'absolute', inset: 0, opacity: config.isOn ? 1 : 0, transition: 'none' }}>
          <SafeSVG content={layers.on} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator (toggles independently) */}
      {layers?.indicator && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 1 : 0,  // Could be separate state in future
          transition: 'none',
        }}>
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Pattern 5: Renderer Delegation (Default vs Styled)
**What:** Main renderer delegates to DefaultRenderer (CSS) or StyledRenderer (SVG) based on styleId
**When to use:** All button/switch renderers
**Example:**
```typescript
// Source: DotIndicatorKnobRenderer.tsx, SliderRenderer.tsx (proven pattern)

// Main renderer (delegates)
export function ButtonRenderer({ config }: ButtonRendererProps) {
  if (!config.styleId) {
    return <DefaultButtonRenderer config={config} />
  }
  return <StyledButtonRenderer config={config} />
}

// Default renderer (existing CSS implementation - NO CHANGES)
function DefaultButtonRenderer({ config }: ButtonRendererProps) {
  return (
    <div
      style={{
        width: '100%', height: '100%',
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
        // ... existing CSS styles
      }}
    >
      {config.label}
    </div>
  )
}

// Styled renderer (NEW - SVG layer support)
function StyledButtonRenderer({ config }: ButtonRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation
  if (style && style.category !== 'button') {
    console.warn('Button requires button category style')
    return null
  }

  // ... layer extraction and rendering (Pattern 2)
}
```

### Anti-Patterns to Avoid
- **Unified ButtonLayers schema:** Different state models (2-state vs 3-position vs N-position) can't be represented in one schema. Per-element schemas are correct.
- **CSS transitions for state swaps:** CONTEXT.md locked: keep current behavior (instant jumps). Use `transition: 'none'` for all state layer changes.
- **Animating rocker position:** CONTEXT.md locked: direct jump between positions, no intermediate visual states. Opacity swaps with transition: none.
- **Sliding toggle thumb:** CONTEXT.md locked: slide is baked into artwork, layer swap only. No CSS transform on thumb.
- **Separate icon SVG injection:** Use fill replacement on icon layer (proven pattern from knob indicator). Don't try to swap icon content.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon coloring | Runtime SVG manipulation | applyColorOverride (knobLayers.ts) | Handles fill/stroke, style attributes, nested elements |
| Layer extraction | String manipulation | extractElementLayer (elementLayers.ts) | Preserves viewBox, coordinate system, handles edge cases |
| State visibility | Conditional rendering | Opacity + transition: none | Maintains DOM structure, avoids layout shift |
| Multi-position rendering | Switch statement per position | Array.map with opacity check | DRY, scales to N positions |
| Category validation | Runtime checks | TypeScript discriminated union | Type-safe at compile time |

**Key insight:** Phase 53-55 solved all the hard problems (layer detection, extraction, color override, state management). This phase is just applying those solutions to 7 new element types with different state models.

## Common Pitfalls

### Pitfall 1: State Layer Naming Conventions
**What goes wrong:** Numbered layers detected as "position0" instead of "position-0"
**Why it happens:** Layer detection regex must match hyphenated naming (position-0, position-1)
**How to avoid:** Define LAYER_CONVENTIONS with hyphenated names, detection will match lowercase variants
**Warning signs:** Layer mapping dialog doesn't auto-detect position-0 layer

Example:
```typescript
// BAD: Camel case doesn't match SVG naming
export interface RockerLayers {
  position0?: string
  position1?: string
}

// GOOD: Hyphenated matches SVG convention
export interface RockerLayers {
  'position-0'?: string
  'position-1'?: string
}
```

### Pitfall 2: Transition Behavior Inconsistency
**What goes wrong:** Some buttons animate, others don't, feels inconsistent
**Why it happens:** Mixing transition: 'none' and transition: '0.1s'
**How to avoid:** CONTEXT.md decision: "Keep current transition behavior from existing implementations". Check existing renderer, preserve its transition value exactly.
**Warning signs:** User reports "buttons feel different after SVG styling"

Example:
```typescript
// Check existing implementation first
// ButtonRenderer.tsx line 26: transition: 'background-color 0.1s, box-shadow 0.1s, transform 0.1s'

// BAD: Removing transitions that exist
<div style={{ transition: 'none' }}>  // Breaks existing behavior

// GOOD: Preserve existing transitions (if they exist)
<div style={{ transition: 'background-color 0.1s' }}>  // Matches existing
```

### Pitfall 3: Rotary Switch Position Count Assumptions
**What goes wrong:** Hard-coded 12 position layers, fails for 3-position rotary
**Why it happens:** Assuming max position count without checking config
**How to avoid:** CONTEXT.md: "Keep current position count behavior (check existing implementation)". Use config.positionCount, not hard-coded max.
**Warning signs:** 3-position rotary switch fails to render

Example:
```typescript
// BAD: Hard-coded position layers
const layers = {
  position0: extract(...), position1: extract(...), ..., position11: extract(...)
}

// GOOD: Dynamic based on positionCount
const positionLayers = useMemo(() => {
  const layers: Record<string, string> = {}
  for (let i = 0; i < config.positionCount; i++) {
    const layerKey = `position-${i}`
    if (style.layers[layerKey]) {
      layers[layerKey] = extractElementLayer(style.svgContent, style.layers[layerKey])
    }
  }
  return layers
}, [style, config.positionCount])
```

### Pitfall 4: Power Button LED Color Override Scope
**What goes wrong:** LED color override changes entire button, not just LED
**Why it happens:** applyColorOverride applies to entire layer, must target LED layer specifically
**How to avoid:** CONTEXT.md: "Power button LED color is user-configurable via property panel". Override config.ledColor, apply only to LED layer.
**Warning signs:** Changing LED color changes button background

Example:
```typescript
// BAD: Overriding wrong layer
const buttonContent = applyColorOverride(layers.normal, 'normal', config.ledColor)

// GOOD: Override LED layer only
const ledContent = useMemo(() => {
  if (!layers.led) return null
  return applyColorOverride(layers.led, style.layers.led, config.ledColor)
}, [layers.led, config.ledColor])
```

### Pitfall 5: Segment Button Selection Approach Undecided
**What goes wrong:** Implementing per-segment state layers without verifying approach
**Why it happens:** CONTEXT.md marked as "Claude's discretion"
**How to avoid:** Research both approaches (highlight layer vs per-segment states), recommend in planning, document decision
**Warning signs:** Segment button layer schema changes mid-implementation

Options to research during planning:
```typescript
// Option A: Highlight layer (moves/replicates per selected segment)
export interface SegmentLayers {
  base?: string          // All segments (unselected state)
  highlight?: string     // Selection overlay (positioned per segment)
}

// Option B: Per-segment state layers
export interface SegmentLayers {
  'segment-0'?: string, 'segment-0-selected'?: string,
  'segment-1'?: string, 'segment-1-selected'?: string,
  // ... up to 8 segments (config.segmentCount)
}

// Recommendation: Option A (highlight layer) is simpler, DRY, scales to N segments.
// Option B requires 2N layers (N unselected + N selected), harder to author in SVG editor.
```

## Code Examples

Verified patterns from existing codebase:

### Button State Layer Swapping
```typescript
// Source: DotIndicatorKnobRenderer.tsx (arc layer opacity pattern) + CONTEXT.md

function StyledButtonRenderer({ config }: ButtonRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'button') {
    console.warn('Button requires button category style')
    return null
  }

  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      normal: style.layers.normal ? extractElementLayer(svgContent, style.layers.normal) : null,
      pressed: style.layers.pressed ? extractElementLayer(svgContent, style.layers.pressed) : null,
      icon: style.layers.icon ? extractElementLayer(svgContent, style.layers.icon) : null,
    }
  }, [style, svgContent])

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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Normal state */}
      {layers?.normal && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.pressed ? 0 : 1,
          transition: 'none',
        }}>
          <SafeSVG content={layers.normal} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Pressed state */}
      {layers?.pressed && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.pressed ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.pressed} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Icon layer */}
      {layers?.icon && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.icon} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Rocker Switch Multi-Position Rendering
```typescript
// Source: RockerSwitchRenderer.tsx (existing implementation) + layer pattern

function StyledRockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'button') {
    console.warn('RockerSwitch requires button category style')
    return null
  }

  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      base: style.layers.base ? extractElementLayer(svgContent, style.layers.base) : null,
      position0: style.layers['position-0'] ? extractElementLayer(svgContent, style.layers['position-0']) : null,
      position1: style.layers['position-1'] ? extractElementLayer(svgContent, style.layers['position-1']) : null,
      position2: style.layers['position-2'] ? extractElementLayer(svgContent, style.layers['position-2']) : null,
    }
  }, [style, svgContent])

  if (!style) {
    return <DefaultRockerSwitchRenderer config={config} />
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static base */}
      {layers?.base && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position 0 (down) */}
      {layers?.position0 && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.position === 0 ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.position0} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position 1 (center) */}
      {layers?.position1 && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.position === 1 ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.position1} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position 2 (up) */}
      {layers?.position2 && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.position === 2 ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.position2} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

### Rotary Switch Rotating Selector
```typescript
// Source: RotarySwitchRenderer.tsx (existing rotation logic) + DotIndicatorKnobRenderer.tsx (rotation pattern)

function StyledRotarySwitchRenderer({ config }: RotarySwitchRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'button') {
    console.warn('RotarySwitch requires button category style')
    return null
  }

  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      base: style.layers.base ? extractElementLayer(svgContent, style.layers.base) : null,
      selector: style.layers.selector ? extractElementLayer(svgContent, style.layers.selector) : null,
    }
  }, [style, svgContent])

  // Calculate rotation angle (same logic as existing RotarySwitchRenderer)
  const anglePerPosition = config.positionCount > 1 ? config.rotationAngle / (config.positionCount - 1) : 0
  const startAngle = -config.rotationAngle / 2
  const currentAngle = startAngle + config.currentPosition * anglePerPosition

  if (!style) {
    return <DefaultRotarySwitchRenderer config={config} />
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static base */}
      {layers?.base && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Rotating selector */}
      {layers?.selector && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: `rotate(${currentAngle}deg)`,
          transformOrigin: 'center center',
          transition: 'none',
        }}>
          <SafeSVG content={layers.selector} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-only buttons | SVG layer support | v0.10.0 (Phase 56) | User-customizable button artwork |
| Single button layer | State-specific layers | v0.10.0 (Phase 56) | Normal/pressed visual states |
| Hard-coded toggle slide | Baked-in artwork | v0.10.0 (Phase 56) | Designer controls slide animation |
| Programmatic rocker positions | Position state layers | v0.10.0 (Phase 56) | Fully customizable position visuals |
| CSS-rendered rotary | SVG base + rotating selector | v0.10.0 (Phase 56) | Custom selector artwork |

**Deprecated/outdated:**
- None. This phase is additive. DefaultRenderers (existing CSS implementations) remain unchanged and are still used when styleId is undefined.

## Open Questions

Things that couldn't be fully resolved:

1. **Segment Button Selection Approach**
   - What we know: CONTEXT.md marked as "Claude's discretion"
   - What's unclear: Highlight layer vs per-segment state layers
   - Recommendation: **Highlight layer approach** (simpler, DRY, scales to N segments)
     - SegmentLayers: `{ base?: string, highlight?: string }`
     - Rendering: Position highlight layer per selected segment (CSS transform or clip-path)
     - Rationale: 2 layers (base + highlight) vs 16 layers (8 segments × 2 states). Easier to author in SVG editor.

2. **Rotary Switch Position Labels**
   - What we know: CONTEXT.md marked as "Claude's discretion" (extracted from SVG vs programmatic overlay)
   - What's unclear: Should position labels be SVG layers or DOM text overlays?
   - Recommendation: **Programmatic overlay** (preserve existing behavior)
     - Check existing RotarySwitchRenderer.tsx: Uses DOM text elements with radial positioning (lines 125-141)
     - Rationale: Already working, supports user-provided labels (config.positionLabels), easier to style/animate
     - SVG approach would require: N label layers (label-0, label-1, ..., label-N), harder to edit per instance

3. **Icon Color Zones**
   - What we know: CONTEXT.md: "Claude's discretion (single color vs primary/secondary — lean toward simplicity unless clearly useful)"
   - What's unclear: Do icon buttons need multi-zone coloring?
   - Recommendation: **Single color (simplicity)**
     - IconButtonLayers: `{ icon?: string }` with single colorOverrides.icon
     - applyColorOverride replaces all fill/stroke in icon layer
     - Rationale: Most icons are single-color. Multi-zone adds complexity (icon-primary, icon-secondary layers, 2 color overrides). Can add later if users request.

4. **Power Button LED Behavior**
   - What we know: CONTEXT.md: "Power button LED color is user-configurable via property panel"
   - What's unclear: Does LED toggle with isOn, or is it independently controllable?
   - Recommendation: **Toggle with isOn** (standard behavior)
     - LED layer visibility: `opacity: config.isOn ? 1 : 0`
     - LED color override: applyColorOverride(layers.led, style.layers.led, config.ledColor)
     - Rationale: Standard power button semantics (LED on when powered on). Independent control not in requirements.

5. **Toggle Switch Indicator Independence**
   - What we know: CONTEXT.md: "Toggle switch and power button have separate 'indicator' or 'led' layer that toggles visibility independently of background"
   - What's unclear: "Independently" means independent opacity control, or separate state variable?
   - Recommendation: **Independent opacity control, same state variable**
     - Background: on/off layers (swap based on isOn)
     - Indicator: separate led layer (also controlled by isOn, but could fade at different rate in future)
     - Rationale: "Independent" likely means "separate layer" not "separate state". Single isOn variable is simpler.

## Sources

### Primary (HIGH confidence)
- Existing codebase: src/components/elements/renderers/controls/ButtonRenderer.tsx - Current CSS implementation
- Existing codebase: src/components/elements/renderers/controls/ToggleSwitchRenderer.tsx - Toggle switch behavior
- Existing codebase: src/components/elements/renderers/controls/RockerSwitchRenderer.tsx - 3-position state handling
- Existing codebase: src/components/elements/renderers/controls/RotarySwitchRenderer.tsx - Rotation logic, position count
- Existing codebase: src/components/elements/renderers/controls/DotIndicatorKnobRenderer.tsx - Styled renderer pattern
- Existing codebase: src/components/elements/renderers/controls/SliderRenderer.tsx - State layer swapping (fill clip-path)
- Existing codebase: src/services/elementLayers.ts - Layer detection and extraction
- Existing codebase: src/services/knobLayers.ts - Color override (applyColorOverride, applyAllColorOverrides)
- Existing codebase: src/types/elementStyle.ts - ElementStyle type system, ButtonLayers definition
- Existing codebase: src/services/export/svgElementExport.ts - LAYER_CONVENTIONS.button, LAYER_CONVENTIONS.switch
- Phase 53 research: .planning/phases/53-foundation/53-RESEARCH.md - ElementStyle architecture patterns
- CONTEXT.md: .planning/phases/56-button-switch-styling/CONTEXT.md - User decisions (state layers, transitions, icon coloring)

### Secondary (MEDIUM confidence)
- None required. All patterns proven in existing codebase.

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use from Phase 53-55
- Architecture: HIGH - All patterns demonstrated in existing knob/slider/button renderers
- Layer schemas: HIGH - Based on CONTEXT.md user decisions + existing state models
- State rendering: HIGH - Proven patterns from DotIndicatorKnobRenderer (opacity), SliderRenderer (clip-path)
- Transitions: HIGH - CONTEXT.md locked: "Keep current transition behavior", checked existing implementations

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, patterns proven in Phase 53-55)
