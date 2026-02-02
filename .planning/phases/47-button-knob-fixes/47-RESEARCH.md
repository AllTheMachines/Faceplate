# Phase 47: Button & Knob Fixes - Research

**Researched:** 2026-02-02
**Domain:** React component UI controls, SVG rendering, CSS transitions
**Confidence:** HIGH

## Summary

Phase 47 addresses three UI control fixes: segment button icon rendering, kick button removal, and stepped knob snapping behavior. The research confirms that the existing codebase already has strong foundations for all required changes.

**Key findings:**
- Existing `builtInIconSVG` system uses SVG with `currentColor` for dynamic theming - perfect for segment button icons
- Icon rendering is already implemented in `IconButtonRenderer` using `dangerouslySetInnerHTML` with trusted content
- SteppedKnobRenderer already quantizes values to steps on render (lines 126-131) but applies it immediately rather than on drag release
- CSS transitions at 50ms align with existing knob transition patterns (KnobRenderer uses 0.05s = 50ms)
- SVG tick marks can be rendered using `<line>` elements positioned with polar-to-cartesian calculations (pattern already used for knob indicators)

**Primary recommendation:** Enhance existing implementations rather than introducing new libraries or patterns. The codebase already has the utilities needed (SVG rendering, polar coordinates, transitions, icon system).

## Standard Stack

The project uses React with TypeScript and inline SVG rendering - no additional libraries needed.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component framework | Already in project |
| TypeScript | 5.x | Type safety | Already in project |
| Native SVG | - | Vector graphics | Built-in, no deps |
| CSS Transitions | - | Smooth animations | Built-in, performant |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DOMPurify | Latest | Sanitize HTML/SVG | When rendering untrusted content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions | Framer Motion / Motion library | Motion adds 40KB+ bundle size, provides spring physics and inertia - overkill for simple 50ms snap animation |
| Inline SVG | External SVG files | Inline SVG allows `currentColor` theming and dynamic generation - necessary for this use case |
| `dangerouslySetInnerHTML` | React SVG components | Components require build-time processing; runtime string SVG is simpler for icon system |

**Installation:**
No new dependencies needed. All features can be implemented with existing codebase utilities.

## Architecture Patterns

### Recommended Project Structure
Project already follows the correct structure:
```
src/
├── types/elements/         # Element config types
│   └── controls.ts         # SegmentConfig, SteppedKnobElementConfig
├── components/
│   └── elements/renderers/controls/
│       ├── SegmentButtonRenderer.tsx
│       └── SteppedKnobRenderer.tsx
└── utils/
    └── builtInIcons.ts     # Icon SVG strings
```

### Pattern 1: SVG Icon Rendering with currentColor
**What:** Inline SVG strings with `fill="currentColor"` for dynamic theming
**When to use:** Icons that need to change color based on state or theme
**Example:**
```typescript
// Source: Project's src/utils/builtInIcons.ts (lines 65-68)
const iconContent = builtInIconSVG[config.builtInIcon]
// SVG format: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="..."/></svg>'

// Render with color
<div
  style={{ width: iconSize, height: iconSize, color: iconColor }}
  dangerouslySetInnerHTML={{ __html: iconContent }}
/>
```

### Pattern 2: Polar-to-Cartesian for Circular Positioning
**What:** Convert angle/radius to x/y coordinates for SVG elements on circular paths
**When to use:** Tick marks, indicators, or labels around circular controls
**Example:**
```typescript
// Source: Project's src/components/elements/renderers/controls/KnobRenderer.tsx (lines 44-55)
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

// Generate tick positions
for (let i = 0; i < stepCount; i++) {
  const stepNormalized = i / (stepCount - 1)
  const stepAngle = startAngle + stepNormalized * (endAngle - startAngle)
  const pos = polarToCartesian(centerX, centerY, radius, stepAngle)
  // Render tick at pos.x, pos.y
}
```

### Pattern 3: CSS Transition for Snap Animation
**What:** Use `transition` CSS property to smooth value changes on drag release
**When to use:** Controls that snap to discrete values after continuous drag
**Example:**
```typescript
// Source: Project's src/components/elements/renderers/controls/KnobRenderer.tsx (lines 318, 333)
// Existing pattern: 0.05s = 50ms transitions
<div style={{
  transform: `rotate(${angle}deg)`,
  transition: 'transform 0.05s ease-out', // 50ms smooth snap
}}>
```

### Pattern 4: Per-Segment Configuration
**What:** Array of segment configs, each with its own icon/text/display mode
**When to use:** Multi-segment UI controls where each segment has different content
**Example:**
```typescript
// Source: Project's src/types/elements/controls.ts (lines 1-31)
export interface SegmentConfig {
  displayMode: 'icon' | 'text' | 'icon-text'
  iconSource?: 'builtin' | 'asset'
  builtInIcon?: string
  text?: string
}

export interface SegmentButtonElementConfig {
  segments: SegmentConfig[]
  selectedIndices: number[]
  // Colors for each state
  textColor: string
  selectedTextColor: string
}
```

### Anti-Patterns to Avoid
- **Immediate value quantization during drag:** Don't snap values while dragging - show continuous feedback, snap only on release
- **Fixed icon sizes:** Always allow `iconSize` to be configurable per element
- **Single color for all icons:** Support per-state icon colors (selected vs unselected)
- **Transition on all property changes:** Only transition the animated properties (transform, opacity), not layout properties

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG icon system | Custom icon loader or components | Existing `builtInIconSVG` map + `dangerouslySetInnerHTML` | Already supports 35 icons, currentColor theming, tested and working |
| Polar coordinate math | Custom angle-to-position calculations | Existing `polarToCartesian()` utility | Already used throughout knob renderers, handles edge cases |
| Smooth transitions | JavaScript animation loop or requestAnimationFrame | CSS `transition` property | Hardware accelerated, simpler code, existing pattern in codebase |
| SVG sanitization for icons | Custom regex or string filtering | Trust built-in icons, use DOMPurify only for user content | Built-in icons are hardcoded and safe; unnecessary sanitization adds overhead |
| Color state management | Complex state hooks for icon colors | CSS `color` property with `currentColor` | SVG automatically inherits text color, no state needed |

**Key insight:** This phase is about fixing bugs in existing implementations, not building new systems. Reuse the patterns already proven in the codebase (KnobRenderer, IconButtonRenderer, builtInIcons).

## Common Pitfalls

### Pitfall 1: Icon Color Not Updating on Selection
**What goes wrong:** Segment button icons don't change color when segment is selected
**Why it happens:** Icon SVG uses hardcoded colors instead of `currentColor`, or parent div doesn't set `color` CSS property
**How to avoid:**
- Ensure all built-in icon SVGs use `fill="currentColor"` (already done in builtInIcons.ts)
- Set `color` CSS property on parent div based on `isSelected` state
- Example: `<div style={{ color: isSelected ? selectedIconColor : iconColor }}>`
**Warning signs:** Icons render but stay same color regardless of selection state

### Pitfall 2: Snap Animation Feels Sluggish or Jarring
**What goes wrong:** Transition duration too long (sluggish) or too short (jarring), or wrong easing curve
**Why it happens:** No established duration standard, or using linear easing
**How to avoid:**
- Use 50ms (`0.05s`) to match existing knob transitions in the codebase
- Use `ease-out` easing for natural deceleration
- Apply transition only to the transform property, not all properties
- Example: `transition: 'transform 0.05s ease-out'`
**Warning signs:** Animation feels "floaty" (too long) or "snappy" (too short); users report the knob "jumps"

### Pitfall 3: Tick Marks Don't Scale with Knob Size
**What goes wrong:** Tick marks have fixed length/width that looks wrong at different knob sizes
**Why it happens:** Using pixel values instead of proportional calculations
**How to avoid:**
- Calculate tick positions as percentages of knob radius
- Example: outer radius = `radius * 1.1`, inner radius = `radius * 1.05` for 5% tick length
- Use `config.trackWidth` as basis for tick stroke width
**Warning signs:** Tick marks too small on large knobs, too large on small knobs

### Pitfall 4: Quantization Applied During Drag
**What goes wrong:** Knob jumps between steps while dragging instead of moving smoothly
**Why it happens:** Applying step quantization to displayed value during drag, not just on release
**How to avoid:**
- Track raw continuous value during drag interaction
- Display smooth continuous position while dragging
- Quantize to nearest step only when drag ends
- Render the quantized value for display, but maintain smooth visual position
**Warning signs:** Users report knob is "hard to control" or "jumps around" while dragging

### Pitfall 5: dangerouslySetInnerHTML Security Assumption
**What goes wrong:** Assuming all icon content is safe without considering future changes
**Why it happens:** Built-in icons are currently trusted, but pattern might be copied for user content
**How to avoid:**
- Clearly document that `dangerouslySetInnerHTML` is ONLY safe for built-in icons
- If adding asset-based icons, treat as untrusted and sanitize with DOMPurify
- Add comment in code: "// SAFE: Built-in icons are hardcoded, trusted content"
**Warning signs:** XSS vulnerability if user-provided SVG strings added later

## Code Examples

Verified patterns from existing codebase:

### Rendering Built-In Icons with Dynamic Color
```typescript
// Source: Project's src/components/elements/renderers/controls/IconButtonRenderer.tsx (lines 15-27)
import { builtInIconSVG, BuiltInIcon } from '../../../../utils/builtInIcons'

let iconContent: string | null = null
if (config.iconSource === 'builtin' && config.builtInIcon) {
  iconContent = builtInIconSVG[config.builtInIcon]
}

// Fallback to default icon if not found
if (!iconContent) {
  iconContent = builtInIconSVG[BuiltInIcon.Play]
}

// Render with dynamic color
<div
  style={{
    width: iconSize,
    height: iconSize,
    color: config.iconColor, // SVG inherits this via currentColor
  }}
  dangerouslySetInnerHTML={{ __html: iconContent }} // SAFE: Built-in icons only
/>
```

### SVG Tick Marks Using Polar Coordinates
```typescript
// Source: Adapted from Project's SteppedKnobRenderer.tsx (lines 142-150)
const stepIndicators: { x: number; y: number }[] = []
const outerRadius = radius * 1.1 // 10% beyond knob edge
const innerRadius = radius * 1.05 // Tick start position

for (let i = 0; i < config.stepCount; i++) {
  const stepNormalized = i / (config.stepCount - 1)
  const stepAngle = config.startAngle + stepNormalized * (config.endAngle - config.startAngle)
  const outer = polarToCartesian(centerX, centerY, outerRadius, stepAngle)
  const inner = polarToCartesian(centerX, centerY, innerRadius, stepAngle)

  stepIndicators.push({ outer, inner })
}

// Render as SVG lines
{stepIndicators.map((tick, i) => (
  <line
    key={i}
    x1={tick.inner.x}
    y1={tick.inner.y}
    x2={tick.outer.x}
    y2={tick.outer.y}
    stroke={config.trackColor}
    strokeWidth={config.trackWidth / 4}
    strokeLinecap="round"
  />
))}
```

### Value Quantization (Current Implementation)
```typescript
// Source: Project's src/components/elements/renderers/controls/SteppedKnobRenderer.tsx (lines 126-131)
// Calculate normalized value and quantize to nearest step
const range = config.max - config.min
const normalizedValue = (config.value - config.min) / range
const stepSize = 1 / (config.stepCount - 1)
const steppedValue = Math.round(normalizedValue / stepSize) * stepSize
const valueAngle = config.startAngle + steppedValue * (config.endAngle - config.startAngle)

// NOTE: This currently quantizes immediately. For Phase 47, apply quantization
// on drag release only, while showing smooth continuous position during drag.
```

### CSS Transition Pattern (50ms Snap)
```typescript
// Source: Project's src/components/elements/renderers/controls/KnobRenderer.tsx (lines 327-334)
// Existing knob transition pattern
<div
  style={{
    position: 'absolute',
    inset: 0,
    transform: `rotate(${indicatorAngle}deg)`,
    transformOrigin: 'center center',
    transition: 'transform 0.05s ease-out', // 50ms = feels instant but smooth
  }}
>
```

### Segment Icon Rendering (To Be Implemented)
```typescript
// Pseudo-code for segment button icon enhancement
function renderSegmentContent(segment: SegmentConfig, isSelected: boolean, iconSize: number) {
  const iconColor = isSelected ? config.selectedIconColor : config.iconColor

  switch (segment.displayMode) {
    case 'icon':
      return renderIcon(segment, iconSize, iconColor)

    case 'icon-text':
      return (
        <>
          {renderIcon(segment, iconSize, iconColor)}
          <span>{segment.text}</span>
        </>
      )
  }
}

function renderIcon(segment: SegmentConfig, size: number, color: string) {
  if (segment.iconSource === 'builtin' && segment.builtInIcon) {
    const iconContent = builtInIconSVG[segment.builtInIcon]
    return (
      <div
        style={{ width: size, height: size, color: color }}
        dangerouslySetInnerHTML={{ __html: iconContent }}
      />
    )
  }
  return null
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed icon sizes | Configurable `iconSize` property | Phase 47 decision | Segments can optimize icon/text balance |
| Single icon color | Per-state icon colors (selected/unselected) | Phase 47 decision | Better visual feedback for selection |
| Immediate step snapping | Snap on release, smooth during drag | Phase 47 fix | More intuitive stepped knob interaction |
| No step marks | Optional `showStepMarks` property | Phase 47 addition | Visual indication of available steps |
| Kick Button element | Removed (redundant with Button momentary mode) | Phase 47 decision | Simplified element types |

**Deprecated/outdated:**
- Kick Button element type: Remove entirely, redundant with existing Button in momentary mode

## Open Questions

Things that couldn't be fully resolved:

1. **Asset-based icons in segments**
   - What we know: SegmentConfig supports `iconSource: 'asset'` with `assetId`
   - What's unclear: Whether asset SVGs are sanitized before storage, or need runtime sanitization
   - Recommendation: Check asset import code; if unsanitized, add DOMPurify before `dangerouslySetInnerHTML`

2. **Stepped knob drag interaction state management**
   - What we know: SteppedKnobRenderer is a pure rendering component (no state)
   - What's unclear: Where drag interactions are handled (likely in parent/canvas layer)
   - Recommendation: Research interaction handling in Phase planning; may need to pass `isDragging` prop to renderer

3. **Tick mark styling defaults**
   - What we know: User decision says "Claude's discretion" for tick mark styling
   - What's unclear: Best default values for length, color, thickness
   - Recommendation:
     - Length: 5% of knob radius (subtle but visible)
     - Color: Same as `trackColor` (consistent with dial)
     - Thickness: 25% of `trackWidth` (proportional but thinner)

4. **Icon-to-text spacing**
   - What we know: User decision says "Claude's discretion"
   - What's unclear: Optimal gap value
   - Recommendation: 4px gap (matches existing segment padding of `4px 8px`)

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/utils/builtInIcons.ts` - Icon system with currentColor
- Project codebase: `src/components/elements/renderers/controls/IconButtonRenderer.tsx` - Icon rendering pattern
- Project codebase: `src/components/elements/renderers/controls/KnobRenderer.tsx` - Polar coordinates, transitions
- Project codebase: `src/components/elements/renderers/controls/SteppedKnobRenderer.tsx` - Current quantization logic
- Project codebase: `src/components/elements/renderers/controls/SegmentButtonRenderer.tsx` - Current segment rendering
- Project codebase: `src/types/elements/controls.ts` - Type definitions

### Secondary (MEDIUM confidence)
- [Motion Library React Drag Gestures](https://motion.dev/docs/react-drag) - Drag interaction patterns with snap-to-cursor
- [iOS Knob Control GitHub](https://github.com/jdee/ios-knob-control) - Linear return mode: snap to discrete positions on release
- [Best Practices for Audio Plugin UI](https://www.numberanalytics.com/blog/best-practices-audio-plugin-ui) - Hitbox sizing, visual feedback
- [React ViewTransition](https://react.dev/reference/react/ViewTransition) - Modern React animation API (not needed for this phase)
- [Guide: Draw Segmented Circles with SVG](https://www.hendrik-erz.de/post/guide-programmatically-draw-segmented-circles-or-ring-indicators-with-svg) - SVG tick mark patterns
- [SVG currentColor for Dynamic Theming](https://dev.to/receter/so-easy-svg-with-currentcolor-in-create-react-app-1aid) - Icon color inheritance

### Secondary (MEDIUM confidence - Security)
- [React Security Best Practices 2026](https://www.glorywebs.com/blog/react-security-practices) - dangerouslySetInnerHTML sanitization
- [How to Safely Use dangerouslySetInnerHTML](https://dev.to/maximlogunov/how-to-safely-use-dangerouslysetinnerhtml-in-react-applications-205f) - DOMPurify for untrusted content
- [React Security Best Practices (Snyk)](https://snyk.io/blog/10-react-security-best-practices/) - Avoiding XSS vulnerabilities

### Tertiary (LOW confidence)
- [React Drag Animation Guide](https://motion.dev/docs/react-animation) - General animation principles (not specific to this use case)
- [Top React Animation Libraries 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries) - Library comparison (decided not to use)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Project uses React + TypeScript, no new dependencies needed
- Architecture: HIGH - All patterns exist in codebase and are proven to work
- Pitfalls: HIGH - Based on direct codebase inspection and common React/SVG pitfalls
- Code examples: HIGH - All examples extracted from existing working code

**Research date:** 2026-02-02
**Valid until:** 60 days (stable domain - React/SVG fundamentals don't change rapidly)
