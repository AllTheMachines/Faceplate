# Phase 45: Slider Fixes - Research

**Researched:** 2026-02-02
**Domain:** React UI component interaction patterns, SVG rendering, mouse event handling
**Confidence:** HIGH

## Summary

This phase addresses four distinct slider bugs spanning interaction feel, visual positioning, and rendering issues. Research reveals these are primarily **renderer-only components** (display-only, no built-in interaction handlers). The codebase uses a separation-of-concerns architecture where:

1. **Renderers** (`.tsx` components) are pure display functions receiving config props
2. **Interaction** is handled externally (not yet implemented for value-changing interactions)
3. **Type definitions** define the complete config surface for each slider variant

The fixes span three categories:
- **Interaction implementation** (ASCII Slider drag feel - requires NEW interaction layer)
- **Configuration surface expansion** (Arc Slider distance options - type and property panel additions)
- **Rendering bugs** (Notched/Bipolar visual issues - renderer logic fixes)

**Primary recommendation:** Prioritize renderer fixes first (Notched, Bipolar horizontal), then add configuration surface (Arc distance), finally tackle interaction layer (ASCII drag).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.3.1 | UI rendering | Project foundation, functional components with hooks |
| TypeScript | ~5.6.2 | Type safety | Strict typing for element configs and props |
| Zustand | ^5.0.10 | State management | Global state for selected elements, element updates |
| @dnd-kit/core | ^6.3.1 | Drag and drop | Element positioning on canvas (NOT value interaction) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SVG (native) | - | Slider rendering | All slider variants use SVG for precise visual control |
| React CSSProperties | - | Positioning labels/values | Absolute positioning with transforms for label/value distance |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native SVG | Canvas API | SVG preferred - better for UI controls, inspectable DOM |
| Inline mouse handlers | @dnd-kit | @dnd-kit is for element positioning, NOT value interaction. Need custom solution. |
| Custom distance logic | CSS margin/padding | Current approach (absolute + margin) is correct for external labels |

**Installation:**
No new packages needed. All slider fixes use existing stack.

## Architecture Patterns

### Recommended Project Structure
Current architecture (already in place):
```
src/
├── components/
│   ├── elements/
│   │   ├── renderers/
│   │   │   └── controls/
│   │   │       ├── AsciiSliderRenderer.tsx    # Display logic only
│   │   │       ├── ArcSliderRenderer.tsx
│   │   │       ├── NotchedSliderRenderer.tsx
│   │   │       └── BipolarSliderRenderer.tsx
│   │   ├── BaseElement.tsx                    # Positioning, selection, canvas drag
│   │   └── Element.tsx                        # Wrapper with scrollbar logic
│   └── Properties/
│       ├── AsciiSliderProperties.tsx          # Config UI for property panel
│       ├── ArcSliderProperties.tsx
│       └── shared/                            # Reusable property sections
├── types/
│   └── elements/
│       └── controls.ts                        # TypeScript interfaces for all configs
└── store/
    └── index.ts                               # Zustand store with element update actions
```

### Pattern 1: Pure Renderer Components
**What:** Slider renderers are pure functional components that receive `config` and render SVG/HTML.

**When to use:** All visual fixes (Notched labels, Bipolar horizontal orientation).

**Example (from NotchedSliderRenderer.tsx):**
```typescript
export function NotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
  // Calculate derived state
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const notchPositions = config.notchPositions || /* calculate from notchCount */

  // Conditional rendering based on orientation
  if (config.orientation === 'vertical') {
    return <svg>/* vertical layout */</svg>
  } else {
    return <svg>/* horizontal layout */</svg>
  }
}
```

**Key insight:** Renderers don't maintain state. All display state comes from `config` props.

### Pattern 2: Config-Driven Positioning
**What:** Labels and values positioned using absolute positioning with CSS transforms and margin for distance control.

**When to use:** Arc Slider distance options, any label/value positioning.

**Example (from ArcSliderRenderer.tsx):**
```typescript
const getLabelStyle = () => {
  const distance = config.labelDistance ?? 4  // Default 4px
  const base: React.CSSProperties = {
    position: 'absolute',
    fontSize: `${config.labelFontSize}px`,
    fontFamily: config.labelFontFamily,
    color: config.labelColor,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  switch (config.labelPosition) {
    case 'top':
      return { ...base, bottom: '100%', left: '50%',
               transform: 'translateX(-50%)', marginBottom: `${distance}px` }
    case 'bottom':
      return { ...base, top: '100%', left: '50%',
               transform: 'translateX(-50%)', marginTop: `${distance}px` }
    // ... other positions
  }
}
```

**Key insight:**
- `position: 'absolute'` with `bottom: '100%'` places label above element
- `transform: 'translateX(-50%)'` centers horizontally
- `margin` controlled by distance config property

### Pattern 3: Type-First Config Surface
**What:** TypeScript interfaces define complete config surface. Property panels and renderers derive from types.

**When to use:** Adding new config options (Arc distance properties).

**Example flow:**
```typescript
// 1. Define in types/elements/controls.ts
export interface ArcSliderElementConfig extends BaseElementConfig {
  labelDistance: number  // Already exists!
  valueDistance: number  // Already exists!
  // ...
}

// 2. Property panel uses typed props (ArcSliderProperties.tsx)
<LabelDisplaySection
  labelDistance={element.labelDistance}
  onLabelDistanceChange={(labelDistance) => onUpdate({ labelDistance })}
/>

// 3. Renderer consumes config (ArcSliderRenderer.tsx)
const distance = config.labelDistance ?? 4
```

**Key insight:** Arc Slider ALREADY has `labelDistance` and `valueDistance` in its type definition (lines 571, 580 of controls.ts). Issue #36 is a **documentation/discovery problem**, not a missing feature.

### Pattern 4: Interaction Layer (NOT YET IMPLEMENTED)
**What:** Value-changing interactions (dragging to change slider value) are NOT currently implemented.

**Current state:**
- BaseElement.tsx handles canvas-level dragging (moving element position)
- @dnd-kit/core used for element positioning
- NO interaction handlers for value changes (sliders are display-only)

**ASCII Slider drag interaction will require:**
```typescript
// Pseudocode - NOT current implementation
function AsciiSliderRenderer({ config, onValueChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragSensitivity, setDragSensitivity] = useState(1)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()  // Prevent BaseElement drag
    setIsDragging(true)
    // Capture pointer for consistent drag tracking
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return

    // Check for Shift modifier
    const sensitivity = e.shiftKey ? 0.1 : 1.0  // 10x slower when Shift held

    // Calculate delta and update value
    const delta = e.movementY * sensitivity  // Or movementX depending on pattern
    const newValue = calculateValueFromDelta(config.value, delta, config.min, config.max)
    onValueChange?.(newValue)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* renderer content */}
    </div>
  )
}
```

### Anti-Patterns to Avoid

**Anti-Pattern 1: Mixing rendering and interaction concerns**
- **What:** Adding value-change interaction logic directly in renderer without clear separation
- **Why bad:** Renderers should be pure display functions. Interaction creates side effects.
- **Instead:** Add interaction as a wrapper HOC or separate hook, keep renderer pure

**Anti-Pattern 2: Hardcoded positioning values**
- **What:** Using fixed pixel offsets for label/value positioning
- **Why bad:** Not configurable, breaks when element resizes
- **Instead:** Use config-driven distance properties with percentage/ratio calculations where appropriate

**Anti-Pattern 3: Conditional config properties**
- **What:** Making `labelDistance` optional only when `labelPosition` is set
- **Why bad:** Complicates type safety, runtime checks
- **Instead:** All config properties should have sensible defaults (e.g., `labelDistance ?? 4`)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG arc path calculations | Manual trigonometry | Existing `describeArc()` utility | Already implemented correctly in ArcSliderRenderer.tsx, handles wrap-around angles |
| Pointer capture for drag | Manual event listeners | `element.setPointerCapture(e.pointerId)` | Native browser API prevents lost events, handles multi-touch |
| Value clamping | Manual min/max checks | `Math.max(min, Math.min(max, value))` | Standard pattern, handles edge cases |
| Modifier key detection | Custom key tracking | `e.shiftKey`, `e.ctrlKey` in event handler | Native event properties, no state management needed |

**Key insight:** The codebase already has correct patterns for SVG rendering and positioning. ASCII drag will need pointer interaction, but don't reinvent wheel - use browser PointerEvent API with capture.

## Common Pitfalls

### Pitfall 1: Event Propagation Conflicts
**What goes wrong:** Click/drag on slider element triggers BaseElement canvas drag instead of value change.

**Why it happens:** BaseElement.tsx uses @dnd-kit listeners for canvas positioning. Event bubbles up from renderer.

**How to avoid:**
```typescript
const handlePointerDown = (e: React.PointerEvent) => {
  e.stopPropagation()  // CRITICAL: Prevent BaseElement from handling
  e.preventDefault()   // Prevent text selection, default behaviors
  // ... interaction logic
}
```

**Warning signs:**
- Slider element moves on canvas instead of value changing
- Both interactions fire simultaneously
- Dragging slider deselects element

### Pitfall 2: Missing Horizontal Orientation Branch
**What goes wrong:** Bipolar horizontal doesn't work because renderer only implements vertical branch.

**Why it happens:** Copy-paste from vertical implementation, horizontal branch incomplete.

**How to avoid:**
- Always implement BOTH orientation branches for orientation-aware sliders
- Test both vertical and horizontal in property panel during development
- Check for conditional rendering: `if (config.orientation === 'vertical') { ... } else { ... }`

**Detection:** Check BipolarSliderRenderer.tsx lines 188-272 - horizontal branch exists but may have bugs in:
- centerX calculation (line 191)
- fillX/fillWidth calculation (lines 194-204)
- SVG rect positioning (lines 241-248)

### Pitfall 3: Notch Visibility Assumptions
**What goes wrong:** Notch labels and lines don't show even when `showNotchLabels: true`.

**Why it happens:**
- SVG elements render outside viewBox
- Color matches background (invisible)
- Font size too small or position off-screen
- Conditional rendering logic wrong

**How to avoid:**
```typescript
// Check BEFORE rendering:
1. Verify notchPositions array has values
2. Verify notchColor !== backgroundColor
3. Verify calculated positions within viewBox
4. Add `style={{ overflow: 'visible' }}` to SVG if marks extend outside

// Debug rendering:
<g key={i} data-notch-position={pos}>  {/* Add debug attrs */}
  {/* Notch lines with high-contrast test color */}
  <line stroke="red" strokeWidth={3} />  {/* Temporarily obvious */}
</g>
```

**Detection:**
- Inspect element in browser dev tools - are SVG `<line>` and `<text>` elements present?
- Check computed positions - are they within viewBox bounds?
- Check `notchColor` value - is it visible against background?

### Pitfall 4: Distance Property Type Mismatch
**What goes wrong:** Arc Slider distance options "don't exist" (GitHub #36).

**Why it happens:** Properties ARE defined in type (ArcSliderElementConfig), but:
- Property panel doesn't expose the input
- Documentation doesn't mention it
- Default factory creates element without these props

**How to avoid:**
1. Verify type definition exists: `labelDistance: number`
2. Verify property panel exposes it: `<NumberInput label="Label Distance" .../>`
3. Verify default factory includes it: `labelDistance: 4`
4. Document in UI help text

**Detection for Arc Slider:**
- Type defines `labelDistance` (line 571) and `valueDistance` (line 580) ✅
- Renderer uses `config.labelDistance ?? 4` (line 113) ✅
- Property panel uses `LabelDisplaySection` which accepts `labelDistance` ✅
- **Hypothesis:** Issue #36 may be user discovering existing feature works differently than expected, OR default value too small to notice

### Pitfall 5: Shift Key Fine Control Implementation
**What goes wrong:** Shift+drag doesn't provide finer control, or sensitivity feels wrong.

**Why it happens:**
- Sensitivity multiplier too extreme (0.01x = 100x slower, feels frozen)
- Applied to wrong axis (horizontal drag when vertical expected)
- Modifier key not checked on EVERY move event (only initial)

**How to avoid:**
```typescript
// GOOD: Check modifier on every move
const handlePointerMove = (e: React.PointerEvent) => {
  const sensitivity = e.shiftKey ? 0.1 : 1.0  // 10x slower = good UX
  const pixelsPerValue = 2  // Tune this for feel
  const delta = (e.movementY / pixelsPerValue) * sensitivity
  // Apply delta...
}

// BAD: Only check on pointer down
const [useFineControl, setUseFineControl] = useState(false)
const handlePointerDown = (e) => {
  setUseFineControl(e.shiftKey)  // WRONG - user can't toggle mid-drag
}
```

**Detection:**
- Test: Start drag, THEN press Shift - does sensitivity change?
- Test: Hold Shift, drag slowly - can you hit specific values?
- Sensitivity sweet spot: 10x (0.1) for fine, 1x for normal

## Code Examples

### Example 1: Adding Distance Property to Config (Arc Slider)
**Already implemented! For reference:**

```typescript
// types/elements/controls.ts (lines 567-588)
export interface ArcSliderElementConfig extends BaseElementConfig {
  // ... other properties ...

  // Label Display
  showLabel: boolean
  labelText: string
  labelPosition: 'top' | 'bottom' | 'left' | 'right'
  labelDistance: number  // ✅ ALREADY EXISTS
  labelFontSize: number
  // ...

  // Value Display
  showValue: boolean
  valuePosition: 'top' | 'bottom' | 'left' | 'right'
  valueDistance: number  // ✅ ALREADY EXISTS
  valueFormat: 'numeric' | 'percentage' | 'db' | 'hz' | 'custom'
  // ...
}
```

**Renderer already consumes it:**
```typescript
// ArcSliderRenderer.tsx (lines 112-133)
const getLabelStyle = () => {
  const distance = config.labelDistance ?? 4  // ✅ USES CONFIG
  // ... positioning logic with margin: `${distance}px`
}

const getValueStyle = () => {
  const distance = config.valueDistance ?? 4  // ✅ USES CONFIG
  // ... positioning logic with margin: `${distance}px`
}
```

**Property panel exposes it:**
```typescript
// ArcSliderProperties.tsx (lines 108-123)
<LabelDisplaySection
  labelDistance={element.labelDistance}  // ✅ BOUND
  onLabelDistanceChange={(labelDistance) => onUpdate({ labelDistance })}
/>

<ValueDisplaySection
  valueDistance={element.valueDistance}  // ✅ BOUND
  onValueDistanceChange={(valueDistance) => onUpdate({ valueDistance })}
/>
```

**Conclusion:** Issue #36 likely not "missing feature" but UX/documentation issue.

### Example 2: Fixing Notched Slider Visibility
**Current implementation has rendering logic, but may have bugs:**

```typescript
// NotchedSliderRenderer.tsx (lines 159-196 for vertical, 260-297 for horizontal)
{notchPositions.map((pos, i) => {
  const notchY = config.height - pos * config.height  // Vertical position
  return (
    <g key={i}>
      {/* Notch lines on both sides */}
      <line
        x1={centerX - trackWidth / 2 - 2}
        y1={notchY}
        x2={centerX - trackWidth / 2 - 2 - notchLength}
        y2={notchY}
        stroke={config.notchColor}  // ✅ Uses config color
        strokeWidth={1.5}
      />
      {/* Notch label (if enabled) */}
      {config.showNotchLabels && (  // ✅ Conditional rendering
        <text
          x={centerX + trackWidth / 2 + notchLength + 6}
          y={notchY}
          fill={config.notchColor}
          fontSize={9}  // ⚠️ Hardcoded - may be too small
          dominantBaseline="middle"
        >
          {(config.min + pos * range).toFixed(1)}
        </text>
      )}
    </g>
  )
})}
```

**Potential bugs to check:**
1. `notchLength = 8` (line 107) - are lines long enough to be visible?
2. `fontSize={9}` (line 189) - is font size large enough?
3. `notchColor` - does it contrast with background?
4. `notchPositions` calculation - are positions correct?

**Fix approach:**
```typescript
// Make font size configurable or larger
fontSize={config.notchLabelFontSize ?? 10}  // Add to config

// Ensure lines extend far enough
const notchLength = config.notchLength ?? 12  // Make configurable

// Add visual debugging during development
console.log('Notch render:', { pos, notchY, notchPositions })
```

### Example 3: Implementing ASCII Slider Drag Interaction
**New feature - NOT currently implemented. Example implementation:**

```typescript
// AsciiSliderRenderer.tsx - ADD interaction layer
import { useState, useRef, useCallback } from 'react'

export function AsciiSliderRenderer({ config }: AsciiSliderRendererProps) {
  // Existing rendering logic...

  // ADD: Interaction state (only for design tool preview)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseY: 0, startValue: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  // ADD: Update value in store
  const updateElement = useStore((state) => state.updateElement)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()  // Prevent BaseElement canvas drag
    e.preventDefault()

    setIsDragging(true)
    dragStartRef.current = {
      mouseY: e.clientY,
      startValue: config.value,
    }

    // Capture pointer for reliable tracking
    elementRef.current?.setPointerCapture(e.pointerId)
  }, [config.value])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return

    // Sensitivity: 10x slower when Shift held
    const sensitivity = e.shiftKey ? 0.1 : 1.0

    // Drag direction: vertical up = increase (inverted Y axis)
    const pixelsPerFullRange = 100  // Drag 100px = full range
    const deltaY = dragStartRef.current.mouseY - e.clientY
    const normalizedDelta = (deltaY / pixelsPerFullRange) * sensitivity

    // Calculate new value
    const range = config.max - config.min
    const newValue = Math.max(
      config.min,
      Math.min(
        config.max,
        dragStartRef.current.startValue + normalizedDelta * range
      )
    )

    // Update element config
    updateElement(config.id, { value: newValue })
  }, [isDragging, config.id, config.min, config.max, updateElement])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return

    setIsDragging(false)
    elementRef.current?.releasePointerCapture(e.pointerId)
  }, [isDragging])

  return (
    <div
      ref={elementRef}
      className="w-full h-full flex items-center"
      style={{
        /* existing styles */
        cursor: isDragging ? 'ns-resize' : 'pointer',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}  // Handle cancel like up
    >
      {displayText}
    </div>
  )
}
```

**Key decisions:**
- **Drag direction:** Vertical (up = increase) for consistency with vertical sliders
- **Sensitivity:** 10x slower with Shift (0.1 multiplier) = good UX balance
- **Pixels per range:** 100px to traverse full range = tunable feel
- **Pointer capture:** Prevents lost events if mouse leaves element
- **Store integration:** Uses Zustand `updateElement` action

### Example 4: Fixing Bipolar Horizontal Rendering
**Current implementation exists (lines 188-272), check for bugs:**

```typescript
// BipolarSliderRenderer.tsx - Horizontal orientation
const thumbX = normalizedValue * (config.width - config.thumbWidth)
const centerX = centerValue * config.width  // ✅ Correct calculation

// Calculate fill from center to value
let fillX: number
let fillWidth: number
if (normalizedValue >= centerValue) {
  // Value right of center
  fillX = centerX
  fillWidth = normalizedValue * config.width - centerX  // ⚠️ Check this
} else {
  // Value left of center
  fillX = normalizedValue * config.width
  fillWidth = centerX - fillX
}

// SVG rendering
<rect
  x={fillX}
  y={(config.height - trackWidth) / 2}
  width={fillWidth}
  height={trackWidth}
  fill={config.trackFillColor}
  rx={0}
/>
```

**Potential bug:** `normalizedValue * config.width` should be `thumbX + config.thumbWidth/2` to center fill on thumb position.

**Test cases to verify:**
1. centerValue = 0.5, value = 0.5 → fill should be zero width
2. centerValue = 0.5, value = 1.0 → fill should extend from center to right
3. centerValue = 0.5, value = 0.0 → fill should extend from left to center
4. centerValue = 0.25 (off-center) → fill should adjust correctly

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class components with lifecycle methods | Functional components with hooks | React 16.8 (2019) | All renderers use functional style |
| Inline styles with objects | Tailwind + CSS-in-JS | Project inception | Mix of both, Tailwind for layout, inline for dynamic |
| Mouse events (mousedown/mousemove) | Pointer events (pointerdown/pointermove) | Current best practice (2020+) | Better multi-touch, pressure sensitivity |
| Manual event cleanup | PointerEvent capture API | Modern browsers (2018+) | Automatic cleanup, better tracking |

**Deprecated/outdated:**
- `onMouseDown`/`onMouseMove` - Use `onPointerDown`/`onPointerMove` instead (handles touch + mouse + pen)
- `addEventListener` with manual cleanup - React synthetic events + pointer capture preferred
- `e.clientX`/`clientY` for deltas - Use `e.movementX`/`movementY` for relative motion (no need to track previous position)

## Open Questions

1. **ASCII Slider drag direction**
   - What we know: User expects "natural" feel (GitHub #37)
   - What's unclear: Vertical vs horizontal drag? Up vs down for increase?
   - Recommendation: **Vertical drag, up = increase** (matches vertical slider conventions, most DAW plugins)
   - Rationale: Consistent with existing SliderRenderer vertical orientation

2. **ASCII Slider value preview during drag**
   - What we know: Context specifies "live value preview: show current value inline"
   - What's unclear: Replace existing value display or add temporary overlay?
   - Recommendation: **Update existing value display in real-time** during drag
   - Rationale: Simpler implementation, no z-index/overlay complexity, matches current architecture

3. **Arc Slider distance issue scope**
   - What we know: GitHub #36 says "arc labels and value texts have no distance option"
   - What's unclear: Feature exists in code (labelDistance, valueDistance). Is this a UX issue?
   - Recommendation: **Verify property panel exposes inputs clearly** - may need better labeling or default values
   - Action: Test Arc Slider in designer, check if distance inputs are discoverable

4. **Notched Slider label interval**
   - What we know: Context specifies "label visibility: configurable - which notches show labels"
   - What's unclear: Show all vs every Nth notch? User-configurable which specific notches?
   - Recommendation: **Start with all-or-none** (showNotchLabels boolean), enhance later with interval (every Nth) if needed
   - Rationale: Simpler implementation, covers 80% use case, type already has boolean flag

5. **Bipolar Slider center snap threshold**
   - What we know: Context specifies "center snap: configurable via property panel"
   - What's unclear: What threshold value feels right? 2px? 5px? Percentage of range?
   - Recommendation: **5px or 2% of range, whichever is larger** - standard DAW plugin behavior
   - Rationale: Balances precision with ease of snapping, percentage scales with slider size

6. **Bipolar Slider zone colors**
   - What we know: Context specifies "zone colors: two configurable colors - negative/positive"
   - What's unclear: Current config only has `trackFillColor`. Need two separate properties?
   - Recommendation: **Add `negativeFillColor` and `positiveFillColor` to BipolarSliderElementConfig**
   - Action: Update type definition, property panel, and renderer conditional rendering

## Sources

### Primary (HIGH confidence)
- **Codebase analysis:**
  - `src/components/elements/renderers/controls/AsciiSliderRenderer.tsx` - Current display-only implementation
  - `src/components/elements/renderers/controls/ArcSliderRenderer.tsx` - Distance properties already implemented
  - `src/components/elements/renderers/controls/NotchedSliderRenderer.tsx` - Notch rendering logic exists
  - `src/components/elements/renderers/controls/BipolarSliderRenderer.tsx` - Horizontal orientation branch exists
  - `src/types/elements/controls.ts` - Type definitions for all slider configs
  - `src/components/Properties/*.tsx` - Property panel implementations
  - `src/components/elements/BaseElement.tsx` - Canvas interaction layer (positioning)
  - `package.json` - React 18.3.1, TypeScript 5.6.2, Zustand 5.0.10

- **GitHub issues:**
  - Issue #37 (ASCII Slider drag feel) - "dragging the slider still doesn't feel right"
  - Issue #36 (Arc Slider distance) - "arc labels and value texts have no distance option"
  - Issue #35 (Notched Slider) - "notch labels and lines are not showing"
  - Issue #33 (Bipolar horizontal) - "horizontal is not working"

- **Phase context:** `.planning/phases/45-slider-fixes/45-CONTEXT.md` - User decisions on implementation details

### Secondary (MEDIUM confidence)
- **React documentation patterns:**
  - Pointer Events API - Modern best practice for drag interactions (replaces mouse events)
  - `element.setPointerCapture()` - Standard for tracking pointer outside element bounds
  - `e.movementX`/`e.movementY` - Relative motion without manual position tracking

- **UI/UX conventions:**
  - Shift key for fine control - 10x slower sensitivity is industry standard (DAW plugins, Ableton, Logic)
  - Vertical drag up = increase - Matches fader/slider conventions
  - Center snap threshold - 2-5px common in professional audio software

### Tertiary (LOW confidence)
- **Assumptions from training:**
  - SVG rendering patterns - Based on general web development knowledge
  - React hooks patterns - Standard React 18 practices
  - TypeScript patterns - General TS best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified from package.json and codebase structure
- Architecture: HIGH - Analyzed existing renderer and type patterns
- Pitfalls: HIGH - Identified from code review (event propagation, orientation branches, visibility)
- Interaction patterns: MEDIUM - ASCII drag is NEW feature, pattern not yet established in codebase

**Research date:** 2026-02-02
**Valid until:** 30 days (stable architecture, unlikely to change rapidly)

**Key findings:**
1. Arc Slider distance options ALREADY EXIST in code - Issue #36 may be documentation/UX problem
2. Notched Slider rendering logic exists but may have font size or color bugs
3. Bipolar horizontal branch exists but likely has calculation bug in fill positioning
4. ASCII drag interaction is NEW feature requiring pointer event handlers + store integration
5. All fixes are renderer-level (no new libraries needed, use existing React + TypeScript patterns)
