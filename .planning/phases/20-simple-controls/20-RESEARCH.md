# Phase 20: Simple Controls - Research

**Researched:** 2026-01-26
**Domain:** Interactive rotary and linear controls for audio plugin UIs
**Confidence:** MEDIUM

## Summary

Phase 20 extends the existing Knob and Slider elements with specialized variants for audio plugin UIs: Stepped Knob, Center-Detented Knob, Dot Indicator Knob, Bipolar Slider, Crossfade Slider, Notched Slider, Arc Slider, and Multi-Slider. These controls require precise interaction mechanics (detent behavior, snap zones, drag modes) and specialized visual indicators.

The existing codebase already has strong foundations: KnobRenderer uses SVG arc utilities and supports both CSS and styled SVG modes, SliderRenderer handles vertical/horizontal orientations with track and thumb rendering, and the Phase 19 registry pattern provides clean O(1) lookup for element types. New control variants can extend these base patterns while adding specialized behaviors (hard stops, snap-to-center, curved path dragging).

**Primary recommendation:** Extend existing Knob/Slider base implementations with behavior modifiers rather than creating entirely separate components. Use shared SVG arc utilities, position calculation functions, and drag interaction patterns. Implement detent logic as value transformation layers (stepped values, center snapping) applied during drag. Leverage existing property panel patterns for configuration.

## Standard Stack

The established libraries/tools for interactive SVG controls in React:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component framework | Already in project, stable API |
| TypeScript | 5.x | Type safety | Already in project, critical for element configs |
| SVG | HTML5 | Vector rendering | Browser-native, scales perfectly, existing KnobRenderer uses SVG arcs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @use-gesture/react | 10.x+ | Drag interactions | If smooth drag handling with velocity/momentum needed (optional - can use native events) |
| react-spring | 9.x+ | Animation | If smooth transitions between detent positions needed (optional - CSS transitions sufficient) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG | HTML Canvas | Canvas better for high-frequency updates (meters, scopes) but SVG better for static/infrequent updates like knobs/sliders with true WYSIWYG export |
| Native drag events | @use-gesture/react | Native events sufficient for this use case - library adds 15KB and complexity for features we don't need (velocity, pinch, etc.) |
| CSS animations | react-spring | CSS transitions sufficient for simple opacity/rotation - spring physics not needed for discrete detent positions |

**Installation:**
```bash
# No new dependencies required - use existing React + SVG
# Optional enhancements (evaluate if needed):
# npm install @use-gesture/react react-spring
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/elements/renderers/controls/
│   ├── KnobRenderer.tsx           # Existing - base for rotary variants
│   ├── SliderRenderer.tsx         # Existing - base for linear variants
│   ├── SteppedKnobRenderer.tsx    # New - extends knob with discrete positions
│   ├── CenterDetentKnobRenderer.tsx  # New - extends knob with snap zone
│   ├── DotIndicatorKnobRenderer.tsx  # New - minimal indicator style
│   ├── BipolarSliderRenderer.tsx  # New - center-zero slider
│   ├── CrossfadeSliderRenderer.tsx   # New - A/B balance
│   ├── NotchedSliderRenderer.tsx  # New - slider with detent positions
│   ├── ArcSliderRenderer.tsx      # New - curved path slider
│   ├── MultiSliderRenderer.tsx    # New - parallel sliders
│   └── shared/
│       ├── dragUtils.ts           # Drag calculation utilities
│       ├── detentUtils.ts         # Snap-to-position logic
│       └── svgArcUtils.ts         # Existing - reuse from KnobRenderer
├── types/elements/controls.ts     # Add config types for new variants
└── components/Properties/
    ├── SteppedKnobProperties.tsx  # Config UI for stepped knob
    └── [etc...]
```

### Pattern 1: Value Transformation Layer for Detents
**What:** Separate drag position from displayed value - apply detent logic as transformation
**When to use:** Stepped Knob, Center-Detented Knob, Notched Slider
**Example:**
```typescript
// Stepped Knob: map continuous drag to discrete steps
function applySteppedDetent(rawValue: number, stepCount: number): number {
  // Divide 0-1 range into equal steps
  const stepSize = 1 / (stepCount - 1)
  // Round to nearest step
  return Math.round(rawValue / stepSize) * stepSize
}

// Center-Detented Knob: snap to 0.5 when near center
function applyCenterDetent(rawValue: number, snapThreshold: number = 0.05): number {
  const distanceFromCenter = Math.abs(rawValue - 0.5)
  if (distanceFromCenter < snapThreshold) {
    return 0.5 // Snap to center
  }
  return rawValue
}
```

### Pattern 2: Shared SVG Arc Utilities
**What:** Reuse existing polarToCartesian and describeArc from KnobRenderer
**When to use:** All rotary variants, Arc Slider
**Example:**
```typescript
// From existing KnobRenderer.tsx - lines 44-69
// Extract to shared/svgArcUtils.ts for reuse

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0'
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
}
```

### Pattern 3: Drag Mode Abstraction
**What:** Support both vertical and circular drag for knobs via configurable mode
**When to use:** All rotary variants
**Example:**
```typescript
// Vertical drag: map Y movement to value
function handleVerticalDrag(
  startY: number,
  currentY: number,
  sensitivity: number,
  fineAdjustment: boolean
): number {
  const pixelDelta = startY - currentY // Inverted: up = increase
  const multiplier = fineAdjustment ? 0.1 : 1.0
  const valueDelta = (pixelDelta * multiplier * sensitivity) / 100
  return valueDelta
}

// Circular drag: map angle to value
function handleCircularDrag(
  centerX: number,
  centerY: number,
  mouseX: number,
  mouseY: number
): number {
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  // Convert to 0-360 range
  const normalizedAngle = (angle + 360 + 90) % 360
  // Map to value based on start/end angles
  return normalizedAngle
}
```

### Pattern 4: Performance-Optimized Drag with useRef
**What:** Store intermediate drag values in useRef, only trigger re-render when drag ends or at intervals
**When to use:** All interactive controls to avoid lag on drag
**Example:**
```typescript
// Based on React performance best practices for drag interactions
function useOptimizedDrag(onValueChange: (value: number) => void) {
  const dragValueRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [committedValue, setCommittedValue] = useState(0)

  const handleDrag = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current) return

    // Update ref without re-render
    dragValueRef.current = calculateValue(event)

    // Optional: throttled visual update every N ms
    // For final value, use setState on drag end
  }, [])

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false
    setCommittedValue(dragValueRef.current)
    onValueChange(dragValueRef.current)
  }, [onValueChange])

  return { handleDrag, handleDragEnd }
}
```

### Pattern 5: Multi-Slider Band Layout
**What:** Render parallel sliders with shared track area and individual thumbs
**When to use:** Multi-Slider (EQ/multi-band controls)
**Example:**
```typescript
function MultiSliderRenderer({ config }: { config: MultiSliderConfig }) {
  const bandCount = config.bandCount // e.g., 3, 4, 5, 7, 10, 31
  const bandWidth = config.width / bandCount

  return (
    <svg width={config.width} height={config.height}>
      {/* Shared background track */}
      <rect x={0} y={0} width={config.width} height={config.height} fill={config.trackColor} />

      {/* Individual bands */}
      {config.bandValues.map((value, index) => {
        const x = index * bandWidth
        const thumbY = config.height - (value * config.height)

        return (
          <g key={index}>
            {/* Fill from bottom to value */}
            <rect x={x} y={thumbY} width={bandWidth} height={config.height - thumbY} fill={config.fillColor} />
            {/* Thumb */}
            <rect x={x} y={thumbY - 2} width={bandWidth} height={4} fill={config.thumbColor} />
            {/* Optional label */}
            {config.showLabels && (
              <text x={x + bandWidth/2} y={config.height + 12} fontSize="10" textAnchor="middle">
                {config.labels[index]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
```

### Anti-Patterns to Avoid
- **Creating separate event handlers per element instance:** Use event delegation and calculate target element from event.currentTarget
- **Re-calculating SVG paths on every render:** Memoize with useMemo based on value/geometry changes only
- **Deep component trees for simple controls:** Flat structure with conditional rendering is faster than nested components
- **CSS transforms without transform-box:** SVG elements need `transform-box: fill-box` to rotate around their center, not viewBox origin

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG arc path generation | Custom angle-to-path math | Existing polarToCartesian + describeArc from KnobRenderer | Already tested, handles edge cases (large arc flag, sweep direction) |
| Value clamping | if/else checks | Math.min(Math.max(value, min), max) | Standard pattern, one-liner, no edge cases |
| Angle normalization | Conditional modulo logic | (angle + 360) % 360 | Handles negative angles correctly |
| Drag event handling | Custom mouse tracking | Native onMouseDown/onMouseMove/onMouseUp or existing patterns | Browser handles edge cases (leaving window, multiple buttons) |
| Number formatting | String templates | Existing formatValue() from KnobRenderer/SliderRenderer | Already handles dB, Hz, percentage, decimal places |
| SVG rotation around center | Manual transform matrix | CSS transform-origin: center + transform-box: fill-box | Browser-optimized, works correctly with SVG coordinate systems |

**Key insight:** The existing KnobRenderer and SliderRenderer already have robust implementations of core primitives (SVG rendering, value formatting, label positioning). New controls should extend these patterns rather than reimplementing from scratch.

## Common Pitfalls

### Pitfall 1: SVG Rotation Origin
**What goes wrong:** SVG elements rotate around viewBox origin (0,0) instead of their center
**Why it happens:** Default transform-origin for SVG is different from HTML - relates to viewBox, not element bounding box
**How to avoid:** Always use `transform-box: fill-box` with `transform-origin: center`
**Warning signs:** Knob indicator or dot rotates in a large circular path instead of spinning in place
**Solution:**
```css
/* From research: CSS-Tricks and MDN documentation */
.rotating-svg-element {
  transform-origin: center;
  transform-box: fill-box; /* Critical - makes origin relative to element, not viewBox */
}
```

### Pitfall 2: Stepped Knob Jumping on Initial Drag
**What goes wrong:** Knob jumps to different value when user starts dragging
**Why it happens:** Applying stepped detent to initial position before drag starts causes value to snap
**How to avoid:** Only apply detent logic during active drag, not on mount or when setting initial value
**Warning signs:** Value changes when user clicks but hasn't moved mouse yet
**Solution:**
```typescript
// Apply step quantization only during drag, not initial render
const displayValue = isDragging
  ? applySteppedDetent(dragValue, stepCount)
  : element.value // Use exact stored value
```

### Pitfall 3: Center Detent Fighting with Continuous Drag
**What goes wrong:** User can't move smoothly through center - value sticks or skips
**Why it happens:** Snap zone too large or snap behavior too aggressive
**How to avoid:** Use small snap threshold (5-10% of range) and only snap when drag ends or velocity low
**Warning signs:** Users complain knob "fights them" when trying to adjust near center
**Solution:**
```typescript
// Research: 5% threshold is standard for precision, 10% for general use
const SNAP_THRESHOLD = 0.05 // 5% of value range
const SNAP_VELOCITY_THRESHOLD = 0.01 // Only snap if moving slowly

function applyCenterSnapWithVelocity(value: number, velocity: number): number {
  const distanceFromCenter = Math.abs(value - 0.5)
  const isNearCenter = distanceFromCenter < SNAP_THRESHOLD
  const isMovingSlowly = Math.abs(velocity) < SNAP_VELOCITY_THRESHOLD

  // Only snap if near center AND moving slowly (or drag ended)
  if (isNearCenter && isMovingSlowly) {
    return 0.5
  }
  return value
}
```

### Pitfall 4: Arc Slider Path Not Following Mouse
**What goes wrong:** Thumb position doesn't match mouse cursor during drag along curved path
**Why it happens:** Using linear interpolation instead of angle-based positioning
**How to avoid:** Convert mouse position to angle relative to arc center, then project onto arc path
**Warning signs:** Thumb lags behind or jumps ahead of mouse cursor on curved sections
**Solution:**
```typescript
// Calculate angle from mouse position
function getAngleFromMouse(
  arcCenterX: number,
  arcCenterY: number,
  mouseX: number,
  mouseY: number
): number {
  const dx = mouseX - arcCenterX
  const dy = mouseY - arcCenterY
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  return (angle + 360) % 360 // Normalize to 0-360
}

// Map angle to 0-1 value based on arc range (e.g., 90-270 degrees)
function angleToValue(angle: number, startAngle: number, endAngle: number): number {
  // Clamp angle to arc range
  let normalizedAngle = angle
  if (angle < startAngle) normalizedAngle = startAngle
  if (angle > endAngle) normalizedAngle = endAngle

  // Map to 0-1
  return (normalizedAngle - startAngle) / (endAngle - startAngle)
}
```

### Pitfall 5: Fine Adjustment Not Working with Shift
**What goes wrong:** Shift key doesn't enable fine control during drag
**Why it happens:** Not checking event.shiftKey during drag or applying multiplier incorrectly
**How to avoid:** Check shiftKey on every drag event, apply multiplier to delta not absolute value
**Warning signs:** Shift has no effect or makes control too slow
**Solution:**
```typescript
// Research: 0.1 (10x slower) is industry standard for fine adjustment
const FINE_ADJUSTMENT_RATIO = 0.1

function handleDragMove(event: MouseEvent, startValue: number) {
  const rawDelta = calculateDelta(event) // Movement in pixels or angle
  const multiplier = event.shiftKey ? FINE_ADJUSTMENT_RATIO : 1.0
  const adjustedDelta = rawDelta * multiplier

  // Apply to start value, not current value (avoids compounding)
  return clamp(startValue + adjustedDelta, 0, 1)
}
```

### Pitfall 6: Multi-Slider Link Mode Confusion
**What goes wrong:** Users expect linked sliders but they move independently (or vice versa)
**Why it happens:** Link mode state not clearly indicated or modifier key behavior not documented
**How to avoid:** Visual indicator for link state, consistent modifier key (Alt/Option), clear property label
**Warning signs:** Users report "broken" multi-slider or unexpected behavior
**Solution:**
```typescript
// Three clear link modes
type LinkMode = 'always-linked' | 'modifier-linked' | 'independent'

function handleMultiSliderDrag(
  bandIndex: number,
  delta: number,
  event: MouseEvent,
  linkMode: LinkMode
): number[] {
  const newValues = [...currentValues]

  if (linkMode === 'independent') {
    // Only move dragged band
    newValues[bandIndex] += delta
  } else if (linkMode === 'always-linked') {
    // Move all bands together
    newValues.forEach((_, i) => newValues[i] += delta)
  } else if (linkMode === 'modifier-linked') {
    // Link when Alt/Option held
    if (event.altKey) {
      newValues.forEach((_, i) => newValues[i] += delta)
    } else {
      newValues[bandIndex] += delta
    }
  }

  return newValues.map(v => clamp(v, 0, 1))
}

// Visual indicator in UI
{linkMode === 'always-linked' && (
  <div className="text-xs text-blue-400">🔗 Linked</div>
)}
```

## Code Examples

Verified patterns from official sources and existing implementation:

### Extending Existing Knob for Stepped Variant
```typescript
// Reuse base KnobRenderer structure and add step quantization
import { KnobElementConfig } from '../../../../types/elements'
import { polarToCartesian, describeArc } from './shared/svgArcUtils'

interface SteppedKnobConfig extends KnobElementConfig {
  type: 'steppedknob'
  stepCount: number // 12, 24, 36, 48, 64
  showStepIndicators: boolean
}

export function SteppedKnobRenderer({ config }: { config: SteppedKnobConfig }) {
  // Quantize value to nearest step
  const stepSize = 1 / (config.stepCount - 1)
  const steppedValue = Math.round(config.value / stepSize) * stepSize

  // Calculate angle for stepped value (not raw value)
  const valueAngle = config.startAngle + steppedValue * (config.endAngle - config.startAngle)

  // Reuse existing arc generation from base KnobRenderer
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  return (
    <svg width={config.diameter} height={config.diameter} viewBox={`0 0 ${config.diameter} ${config.diameter}`}>
      {/* Track */}
      <path d={trackPath} fill="none" stroke={config.trackColor} strokeWidth={config.trackWidth} strokeLinecap="round" />

      {/* Value fill */}
      {steppedValue > 0 && (
        <path d={valuePath} fill="none" stroke={config.fillColor} strokeWidth={config.trackWidth} strokeLinecap="round" />
      )}

      {/* Step indicators (optional) */}
      {config.showStepIndicators && Array.from({ length: config.stepCount }).map((_, i) => {
        const stepAngle = config.startAngle + (i / (config.stepCount - 1)) * (config.endAngle - config.startAngle)
        const pos = polarToCartesian(centerX, centerY, radius, stepAngle)
        return (
          <circle key={i} cx={pos.x} cy={pos.y} r={2} fill={config.trackColor} opacity={0.5} />
        )
      })}

      {/* Indicator line (reuse from base) */}
      <line
        x1={centerX}
        y1={centerY}
        x2={polarToCartesian(centerX, centerY, radius * 0.9, valueAngle).x}
        y2={polarToCartesian(centerX, centerY, radius * 0.9, valueAngle).y}
        stroke={config.indicatorColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}
```

### Bipolar Slider with Center Line
```typescript
// Extends SliderRenderer pattern with center-zero behavior
interface BipolarSliderConfig extends SliderElementConfig {
  type: 'bipolarslider'
  centerValue: number // Default 0.5 for center-zero
}

export function BipolarSliderRenderer({ config }: { config: BipolarSliderConfig }) {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const centerPosition = config.height * (1 - config.centerValue) // Vertical slider

  return (
    <svg width={config.width} height={config.height}>
      {/* Track background */}
      <rect x={(config.width - 6) / 2} y={0} width={6} height={config.height} fill={config.trackColor} />

      {/* Center line indicator */}
      <line
        x1={0}
        y1={centerPosition}
        x2={config.width}
        y2={centerPosition}
        stroke="#ffffff"
        strokeWidth={2}
        opacity={0.5}
      />

      {/* Fill from center to value */}
      {normalizedValue !== config.centerValue && (() => {
        const thumbY = config.height - (normalizedValue * config.height)
        const fillStart = Math.min(centerPosition, thumbY)
        const fillHeight = Math.abs(centerPosition - thumbY)

        return (
          <rect
            x={(config.width - 6) / 2}
            y={fillStart}
            width={6}
            height={fillHeight}
            fill={config.trackFillColor}
          />
        )
      })()}

      {/* Thumb */}
      <rect
        x={(config.width - config.thumbWidth) / 2}
        y={config.height - (normalizedValue * config.height)}
        width={config.thumbWidth}
        height={config.thumbHeight}
        fill={config.thumbColor}
      />
    </svg>
  )
}
```

### Crossfade Slider with A/B Visual
```typescript
// Source: Research on DJ crossfader curves and balance controls
interface CrossfadeSliderConfig extends SliderElementConfig {
  type: 'crossfadeslider'
  labelA: string // e.g., "A", "Track 1"
  labelB: string // e.g., "B", "Track 2"
}

export function CrossfadeSliderRenderer({ config }: { config: CrossfadeSliderConfig }) {
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const thumbX = normalizedValue * config.width

  // Constant-power crossfade curve: cos(π/2·x)
  const volumeA = Math.cos((Math.PI / 2) * normalizedValue)
  const volumeB = Math.sin((Math.PI / 2) * normalizedValue)

  return (
    <div style={{ position: 'relative', width: config.width, height: config.height }}>
      {/* A/B labels */}
      <div style={{ position: 'absolute', top: -20, left: 0, fontSize: 12, color: '#888' }}>
        {config.labelA}
      </div>
      <div style={{ position: 'absolute', top: -20, right: 0, fontSize: 12, color: '#888' }}>
        {config.labelB}
      </div>

      <svg width={config.width} height={config.height}>
        {/* Track */}
        <rect x={0} y={(config.height - 6) / 2} width={config.width} height={6} fill={config.trackColor} rx={3} />

        {/* A side fill (left of center) */}
        <rect
          x={0}
          y={(config.height - 6) / 2}
          width={thumbX}
          height={6}
          fill={config.trackFillColor}
          opacity={volumeA}
          rx={3}
        />

        {/* B side fill (right of center) */}
        <rect
          x={thumbX}
          y={(config.height - 6) / 2}
          width={config.width - thumbX}
          height={6}
          fill={config.trackFillColor}
          opacity={volumeB}
          rx={3}
        />

        {/* Center detent mark */}
        <line
          x1={config.width / 2}
          y1={0}
          x2={config.width / 2}
          y2={config.height}
          stroke="#ffffff"
          strokeWidth={1}
          opacity={0.3}
        />

        {/* Thumb */}
        <rect
          x={thumbX - config.thumbWidth / 2}
          y={(config.height - config.thumbHeight) / 2}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={2}
        />
      </svg>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas-based controls | SVG-based controls | ~2020-2022 | Better WYSIWYG export, easier styling, perfect scaling |
| Separate event per element | Event delegation + registry | Phase 19 (2026-01) | O(1) lookup, easier to add elements |
| useState for drag | useRef + throttled setState | React 18+ best practices | Smoother drag, less lag on low-end devices |
| Manual arc calculations | polarToCartesian + describeArc | Existing in KnobRenderer | Handles edge cases (large arc flag, negative angles) |
| Inline event handlers | useCallback with deps | React 18 best practices | Prevents unnecessary re-renders |
| Global crossfader curve | Constant-power crossfade | Audio industry standard | Maintains perceived loudness, no dip at center |

**Deprecated/outdated:**
- `react-use-gesture` (old package): Replaced by `@use-gesture/react` v10+ with platform-agnostic API
- CSS transform without transform-box: SVG rotation requires `transform-box: fill-box` (not default behavior)
- Math.random() for IDs: Project uses sequential integers (safer, more predictable)

## Open Questions

Things that couldn't be fully resolved:

1. **Dot Indicator Knob vs Existing "dot" Style**
   - What we know: Existing KnobRenderer has `style: 'dot'` that shows dot at indicator end
   - What's unclear: Is Dot Indicator Knob the same as existing style='dot', or a separate variant?
   - Recommendation: Review with user - likely the same, avoid duplicate elements

2. **Multi-Slider Frequency Labels**
   - What we know: Standard EQ bands are 31 (1/3 octave), 10 (full octave), 5-7 (parametric)
   - What's unclear: Exact frequency mapping for labels (start frequency, spacing)
   - Recommendation: Provide common presets (31-band ISO frequencies, parametric defaults) + custom label array

3. **Arc Slider Angle Range**
   - What we know: Context specifies 90-270 degree range
   - What's unclear: Is this user-configurable or fixed?
   - Recommendation: Make configurable (startAngle, endAngle properties like Knob) with 90-270 as default

4. **Double-Click Reset Default Value**
   - What we know: Context says it's configurable - property to enable/disable
   - What's unclear: What's the "default value" - min, max, center, or user-defined?
   - Recommendation: Add `defaultValue` property (separate from initial value), default to center (0.5) for bipolar, min for unipolar

5. **Stepped Knob Visual Style**
   - What we know: User decisions say "Claude's discretion (tick marks, dots, or numbered positions)"
   - What's unclear: Which specific style to implement
   - Recommendation: Implement tick marks as default (most common in audio UIs), make optional via `showStepIndicators` boolean

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/components/elements/renderers/controls/KnobRenderer.tsx` - Verified SVG arc utilities, value formatting, styled knob patterns
- Existing codebase: `src/components/elements/renderers/controls/SliderRenderer.tsx` - Verified track/thumb rendering, orientation handling
- Existing codebase: Phase 19 registry pattern - Verified O(1) lookup, category structure
- [MDN: SVG transform-origin](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/transform-origin) - SVG rotation behavior
- [MDN: SVG transform](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform) - Transform attribute documentation
- [MDN: Canvas arcTo()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arcTo) - Arc path calculations

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Transforms on SVG Elements](https://css-tricks.com/transforms-on-svg-elements/) - Transform-box property usage
- [@use-gesture documentation](https://use-gesture.netlify.app/docs/) - Drag gesture handling patterns
- [React Performance: useState vs useRef](https://medium.com/@rrardian/usestate-vs-useref-optimizing-react-performance-by-preventing-unnecessary-re-renders-c8c9e4211cb2) - Drag performance optimization
- [Crossfader Curves: DJ Mixing Formulas](https://jupiterscience.com/crossfader-curves-formulas-and-dj-techniques/) - Constant-power crossfade mathematics
- [Smashing Magazine: Mastering SVG Arcs](https://www.smashingmagazine.com/2024/12/mastering-svg-arcs/) - SVG arc path generation
- [ResearchGate: Node Snapping Algorithm](https://www.researchgate.net/figure/Node-Snapping-Algorithm-with-a-snapping-tolerance-d-snap-5-applied-to-an-inclined-edge_fig2_339749584) - 5% snap threshold in algorithms
- [JUCE Forum: Slider fine adjustment](https://forum.juce.com/t/slider-fine-adjustment-via-shift/25811) - Shift key for fine control (audio plugin context)

### Tertiary (LOW confidence)
- [Audio-Ui.com](https://www.audio-ui.com/) - Professional audio GUI reference (marketing site, not technical docs)
- [GitHub: svg-knob](https://github.com/francoisgeorgy/svg-knob) - SVG knob library (abandoned, last update 2019)
- [GitHub: react-dial-knob](https://github.com/pavelkukov/react-dial-knob) - React knob component (2kb, TypeScript) - archived, no recent updates
- [GitHub: control-knob (Vue 3)](https://github.com/slipmatio/control-knob) - Vue knob component (different framework, but shows modern patterns)
- [SmartKnob project](https://github.com/scottbez1/smartknob) - Haptic hardware knob (physical hardware, not UI - but shows detent design thinking)
- Web search results on "arc slider" and "multi-band EQ" - Multiple CodePen examples but no authoritative documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing project already uses React 18 + TypeScript + SVG, no new dependencies needed
- Architecture: HIGH - Existing KnobRenderer and SliderRenderer provide proven patterns to extend
- Pitfalls: MEDIUM - SVG transform-box is verified (MDN), drag performance patterns verified (multiple sources), but snap thresholds (5-10%) only verified in research paper (not UI-specific)
- Code examples: MEDIUM - Based on existing codebase patterns (HIGH confidence) plus web research on crossfade curves and SVG arcs (MEDIUM confidence)
- Interaction standards: LOW - Fine adjustment ratio (0.1), snap thresholds (5%), and specific drag modes are based on web search and forum discussions, not official specifications

**Research date:** 2026-01-26
**Valid until:** 60 days (stable domain - SVG/React patterns don't change rapidly)
