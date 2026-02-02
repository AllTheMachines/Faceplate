# Phase 46: Curve Fixes - Research

**Researched:** 2026-02-02
**Domain:** HTML5 Canvas curve rendering with interactive handles
**Confidence:** HIGH

## Summary

This phase fixes visibility and interaction issues in 5 existing curve/visualization components. The codebase already has solid infrastructure: Canvas renderers exist for all 5 elements, a `useCanvasSetup` hook handles HiDPI scaling, and utility functions provide curve math (`audioMath.ts`) and drawing primitives (`curveRendering.ts`).

The bugs are likely configuration or timing issues rather than architectural problems. The renderers use React patterns correctly (useLayoutEffect for synchronous canvas setup, proper dependency arrays), implement proper coordinate transformations (logarithmic frequency scales, dB conversions), and follow audio industry standards (biquad filters from Audio EQ Cookbook).

**Primary recommendation:** Systematically verify each curve element for common canvas pitfalls (HiDPI scaling, coordinate calculations, color visibility, dependencies triggering redraws) using the existing infrastructure. No new libraries needed.

## Standard Stack

The project already uses the correct stack for canvas curve rendering.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Industry standard, already in use |
| TypeScript | 5.6.2 | Type safety | Essential for canvas coordinate math |
| Canvas API | Native | Rendering | Correct choice for real-time curves |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Konva/react-konva | 9.3.22/18.2.14 | Canvas abstraction | Already used for main canvas, but NOT for curve components (they use raw Canvas API - correct choice) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw Canvas API | Konva everywhere | Konva adds overhead for simple curves; raw API is faster and more direct for static visualizations |
| Canvas | SVG | SVG better for small element counts with DOM manipulation; Canvas correct for real-time performance |

**Installation:**
No new packages needed. All dependencies already present.

## Architecture Patterns

### Current Architecture (Correct)

The existing architecture follows best practices:

```
src/
├── components/elements/renderers/displays/curves/  # Renderer components
│   ├── EQCurveRenderer.tsx
│   ├── CompressorCurveRenderer.tsx
│   ├── EnvelopeDisplayRenderer.tsx
│   ├── LFODisplayRenderer.tsx
│   └── FilterResponseRenderer.tsx
├── hooks/
│   └── useCanvasSetup.ts                          # HiDPI scaling hook
├── utils/
│   ├── audioMath.ts                               # Coordinate conversions
│   └── curveRendering.ts                          # Drawing primitives
└── types/elements/curves/                          # TypeScript configs
```

**Strengths:**
- Separation of concerns (rendering, math, setup)
- Reusable utilities shared across all curve types
- Type-safe configuration via TypeScript interfaces

### Pattern 1: Canvas Setup with HiDPI Scaling

**What:** useLayoutEffect-based hook that sets canvas internal size and scales context for device pixel ratio

**When to use:** Always for canvas components to avoid blurry rendering on Retina displays

**Example:**
```typescript
// Source: D:\___ATM\vst3-webview-ui-designer\src\hooks\useCanvasSetup.ts
export function useCanvasSetup(width: number, height: number, scale?: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = scale || window.devicePixelRatio || 1

    // Set internal size (memory)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Set display size (CSS)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Scale all drawing operations
    const context = canvas.getContext('2d')
    if (context) {
      context.scale(dpr, dpr)
      setCtx(context)
    }
  }, [width, height, scale])

  return { canvasRef, ctx }
}
```

**Why this works:**
- `useLayoutEffect` fires synchronously before browser paint (prevents flicker)
- Internal canvas size multiplied by DPR for crisp rendering
- CSS size kept at original dimensions for correct layout
- Context scaled so drawing coordinates remain logical (no math changes needed)

**Sources:**
- [MDN: Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [High DPI Canvas rendering](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm)

### Pattern 2: Mouse Coordinate Transformation

**What:** Convert screen coordinates to canvas coordinates accounting for element position and scale

**When to use:** All mouse event handlers (hover detection, drag interaction)

**Example:**
```typescript
// From EQCurveRenderer.tsx
const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // Now mouseX/mouseY are in canvas coordinate space
  // Check if over handle...
}
```

**CRITICAL:** Must use `getBoundingClientRect()` not `offsetX/offsetY`:
- `offsetX/offsetY` don't account for CSS transforms or canvas scaling
- `getBoundingClientRect()` returns actual rendered position/size
- Subtract `rect.left/top` from `clientX/clientY` for accurate coordinates

**Sources:**
- [HTML5 Canvas Mouse Coordinates Tutorial](https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/)
- [Three.js Issue #18352](https://github.com/mrdoob/three.js/issues/18352)

### Pattern 3: Logarithmic Frequency Scales

**What:** Map frequencies to X coordinates using log scale (equal visual space per octave)

**When to use:** EQ Curve, Filter Response (audio frequency displays)

**Example:**
```typescript
// Source: D:\___ATM\vst3-webview-ui-designer\src\utils\audioMath.ts
export function frequencyToX(
  frequency: number,
  width: number,
  minFreq: number = 20,
  maxFreq: number = 20000
): number {
  const minLog = Math.log10(minFreq)
  const maxLog = Math.log10(maxFreq)
  const freqLog = Math.log10(frequency)

  const normalized = (freqLog - minLog) / (maxLog - minLog)
  return normalized * width
}
```

**Why logarithmic:** Human hearing perceives frequency logarithmically (octaves). 100Hz→200Hz sounds like same interval as 1000Hz→2000Hz. Audio industry standard.

### Pattern 4: Biquad Filter Math

**What:** Calculate frequency response for parametric EQ and filter curves using Audio EQ Cookbook formulas

**When to use:** EQ Curve (composite response), Filter Response (single filter)

**Example:**
```typescript
// Source: D:\___ATM\vst3-webview-ui-designer\src\utils\audioMath.ts
// Based on: https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html
export function calculateBiquadResponse(
  frequency: number,
  centerFreq: number,
  gain: number,
  Q: number,
  sampleRate: number = 44100
): number {
  // ... biquad coefficient calculation ...
  // Returns magnitude in dB
}
```

**Why this matters:** Audio DSP is complex. Don't hand-roll filter math - use industry-standard formulas.

### Pattern 5: Integer Coordinate Rounding

**What:** Round all canvas coordinates to integers before drawing

**When to use:** All drawing operations (lines, handles, fills)

**Why:** Sub-pixel rendering forces expensive anti-aliasing. `Math.floor()` prevents this.

**Example:**
```typescript
// Good: Round before drawing
const handleX = Math.floor(frequencyToX(band.frequency, width, minFreq, maxFreq))
const handleY = Math.floor(dbToY(band.gain, height, minDb, maxDb))
drawHandle(ctx, handleX, handleY, ...)
```

**Current status in codebase:** Coordinates NOT currently rounded. Likely performance opportunity, but not a visibility bug.

**Source:** [MDN: Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

### Anti-Patterns to Avoid

- **Using `useEffect` instead of `useLayoutEffect` for canvas setup:** Causes flicker and timing issues. Canvas must be ready before paint.
- **Forgetting to scale context after setting canvas size:** Results in blurry rendering on high-DPI displays.
- **Using `offsetX/offsetY` for mouse coordinates:** Breaks with CSS transforms. Always use `getBoundingClientRect()`.
- **Drawing with fractional coordinates without rounding:** Forces anti-aliasing, hurts performance.
- **Modifying canvas size without recreating context scale:** Resets transform matrix, breaks HiDPI scaling.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HiDPI canvas scaling | Manual DPR detection | `useCanvasSetup` hook (already exists) | Already handles edge cases (missing DPR, fractional ratios) |
| Biquad filter response | Custom DSP math | `calculateBiquadResponse()` (already exists) | Audio EQ Cookbook formulas, industry-vetted |
| Frequency ↔ position | Linear mapping | `frequencyToX()`, `xToFrequency()` (already exists) | Logarithmic scale is audio industry standard |
| Mouse coordinate conversion | Event properties | `getBoundingClientRect()` pattern | Accounts for transforms and actual rendered position |
| Smooth curve interpolation | Line segments only | `drawSmoothCurve()` with Bezier (already exists) | Quadratic Bezier provides smooth curves with control |

**Key insight:** The codebase already has correct solutions. This is a bug fix phase, not a feature-building phase. Use what exists.

## Common Pitfalls

### Pitfall 1: HiDPI Scaling Issues (Blurry Curves)

**What goes wrong:** Curves appear blurry/pixelated on Retina displays despite HiDPI scaling code

**Why it happens:**
- `window.devicePixelRatio` can be fractional (2.223277 on zoom) causing sub-pixel issues
- Canvas size changes reset the context transform (must re-scale)
- CSS size doesn't match canvas internal size
- Context not scaled after setting dimensions

**How to avoid:**
1. Always use `useCanvasSetup` hook (never set canvas size manually)
2. Verify `canvasScale` prop is passed correctly to each renderer
3. Check that width/height dependencies trigger re-setup
4. Test on actual Retina display or with browser zoom

**Warning signs:**
- Curves look sharp at 100% zoom but blurry at 110% or 150%
- Text is sharp but curves are fuzzy
- Handles render crisp but curve lines are blurred

**Sources:**
- [Ensuring Canvas Visuals Look Good on Retina](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm)
- [High DPI Canvas - Problems and Solutions](https://cmdcolin.github.io/posts/2014-05-22/)

### Pitfall 2: useEffect vs useLayoutEffect Timing

**What goes wrong:** Canvas flickers on render or handles don't appear until mouse movement

**Why it happens:** `useEffect` runs asynchronously after browser paint. Canvas drawing happens too late, causing:
- One frame with blank/incorrect canvas
- Flicker when dependencies change
- Mouse hover detection before canvas is drawn

**How to avoid:**
1. Always use `useLayoutEffect` for canvas drawing (all renderers already do this correctly)
2. Never use `useEffect` for drawing operations
3. `useEffect` only for non-visual side effects

**Warning signs:**
- Visible flicker when changing curve properties
- Canvas briefly blank then appears
- Handles don't show until mouse enters canvas

**Current status:** All 5 renderers correctly use `useLayoutEffect`. ✅

**Sources:**
- [Kent C. Dodds: useEffect vs useLayoutEffect](https://kentcdodds.com/blog/useeffect-vs-uselayouteffect)
- [When to Use useLayoutEffect Over useEffect](https://emrebener.medium.com/when-to-use-uselayouteffect-over-useeffect-in-react-e68bd2653282)

### Pitfall 3: Mouse Coordinate Transformation Bugs

**What goes wrong:** Hover detection offset from actual handle position, drag handles jump

**Why it happens:**
- Using `event.offsetX/offsetY` instead of `getBoundingClientRect()`
- Not accounting for canvas position relative to viewport
- Canvas CSS size differs from internal size (though context scale should handle this)
- Scrolling or parent transforms not accounted for

**How to avoid:**
1. Always use `getBoundingClientRect()` pattern (renderers already do this)
2. Calculate relative coordinates: `clientX - rect.left`, `clientY - rect.top`
3. These coordinates are in canvas logical coordinate space (after DPR scaling)
4. Test with page scroll and browser zoom

**Warning signs:**
- Hover highlights wrong handle
- Click/hover works in top-left but not bottom-right
- Offset increases with distance from canvas origin

**Current status:** All renderers use correct pattern. ✅

**Sources:**
- [HTML5 Canvas Mouse Coordinates Tutorial](https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/)
- [DEV Community: Canvas scrolling and mouse position issue](https://dev.to/sosunnyproject/html-canvas-scrolling-and-mouse-position-issue-50n4)

### Pitfall 4: Invisible Curves (Color/Opacity Issues)

**What goes wrong:** Curve renders but isn't visible (appears blank)

**Why it happens:**
- Curve color matches background color
- Opacity set to 0 or very low
- Drawing outside visible canvas bounds
- Line width set to 0
- Fill but no stroke (or vice versa when intended)

**How to avoid:**
1. Check color props have valid CSS color strings
2. Verify `lineWidth` > 0 (check for `lineWidth` property in config)
3. Ensure curve points are within canvas bounds
4. Check `ctx.globalAlpha` not set to 0
5. For debugging: Force a known-good color temporarily

**Warning signs:**
- Handles visible but curve invisible
- Grid visible but curve invisible
- Canvas dimensions correct but nothing renders

**Debugging pattern:**
```typescript
// Temporarily force visible color for debugging
ctx.strokeStyle = '#ff00ff' // Hot pink - can't miss it
ctx.lineWidth = 3 // Thick enough to see
```

### Pitfall 5: Missing Redraw on Property Changes

**What goes wrong:** Changing curve properties in UI doesn't update the canvas

**Why it happens:**
- Property not in `useLayoutEffect` dependency array
- Property destructured but not used in drawing code
- Component not re-rendering when config changes

**How to avoid:**
1. Verify all drawing-related props in dependency array
2. Check that parent passes new config object when properties change
3. Use React DevTools to verify props actually changing

**Warning signs:**
- Initial render works, but updates don't show
- Need to change other property to trigger redraw
- Refresh page shows correct state but interaction doesn't update

**Current status:** All renderers have comprehensive dependency arrays. Need to verify they include ALL used properties.

## Code Examples

Verified patterns from existing codebase:

### Canvas Setup Pattern (Already Correct)
```typescript
// Source: All 5 curve renderers
const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)
```

This pattern handles all HiDPI complexity. Use as-is.

### Mouse Hover Detection Pattern (Already Correct)
```typescript
// Source: EQCurveRenderer.tsx (representative example)
const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // Check each handle
  let foundHover: number | null = null
  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i]
    const handleX = frequencyToX(handle.frequency, width, minFreq, maxFreq)
    const handleY = dbToY(handle.gain, height, minDb, maxDb)

    if (isPointInHandle(mouseX, mouseY, handleX, handleY, hoveredHandle === i)) {
      foundHover = i
      break
    }
  }

  if (foundHover !== hoveredHandle) {
    setHoveredHandle(foundHover)
  }
}
```

Pattern is correct. Verify each renderer implements this consistently.

### Drawing Loop Pattern (Already Correct)
```typescript
// Source: All curve renderers
useLayoutEffect(() => {
  if (!ctx) return

  // 1. Clear canvas
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // 2. Draw grid (if enabled)
  if (showGrid) {
    drawFrequencyGrid(ctx, width, height, gridColor, ...)
  }

  // 3. Calculate curve points
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < sampleCount; i++) {
    // ... calculate point ...
    points.push({ x, y })
  }

  // 4. Draw curve
  drawSmoothCurve(ctx, points, curveColor, lineWidth, showFill, fillColor, height)

  // 5. Draw handles
  for (const handle of handles) {
    drawHandle(ctx, handleX, handleY, isHovered, handleColor, handleHoverColor)
  }
}, [
  ctx, width, height, // Canvas dependencies
  ...allDrawingProperties // All properties used in drawing
])
```

Structure is correct. Verify dependency arrays are complete.

### Handle Hit Detection (Already Correct)
```typescript
// Source: D:\___ATM\vst3-webview-ui-designer\src\utils\curveRendering.ts
export function isPointInHandle(
  mouseX: number,
  mouseY: number,
  handleX: number,
  handleY: number,
  isHovered: boolean = false
): boolean {
  const size = isHovered ? 10 : 8 // Matches CONTEXT.md: 8-10px handles
  const halfSize = size / 2

  return (
    mouseX >= handleX - halfSize &&
    mouseX <= handleX + halfSize &&
    mouseY >= handleY - halfSize &&
    mouseY <= handleY + halfSize
  )
}
```

Implements rectangle hit test. Handles grow on hover per CONTEXT.md decisions.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useEffect` for canvas | `useLayoutEffect` | React 16.8+ (2019) | Prevents flicker, synchronous drawing |
| Manual DPR scaling | `window.devicePixelRatio` | Widely supported (2014+) | Standard for HiDPI |
| Offscreen canvas | OffscreenCanvas API | Chrome 69+ (2018), Firefox 105+ (2022) | Not yet needed for static curves |
| setInterval animation | requestAnimationFrame | Widely supported (2011+) | Used for LFO animation property |

**Deprecated/outdated:**
- **Setting canvas size via CSS only:** Results in scaling/blurring. Must set canvas.width/height in memory.
- **Using offsetX/offsetY for coordinates:** Doesn't account for transforms. Use getBoundingClientRect().
- **Assuming devicePixelRatio is always 2:** Can be 1, 2, 3, or fractional values. Always query dynamically.

**Current in 2026:**
- Raw Canvas API remains fastest for real-time curves
- OffscreenCanvas gaining support but not critical for static visualizations
- WebGL/WebGPU overkill for simple 2D curves

## Verification Checklist

Systematic checks for each of the 5 curve elements:

### For Each Renderer:

**1. Canvas Setup**
- [ ] Uses `useCanvasSetup(width, height, canvasScale)`
- [ ] `canvasScale` prop passed from parent
- [ ] Canvas ref applied to `<canvas ref={canvasRef}>`
- [ ] Drawing only when `ctx` is truthy

**2. Drawing Dependencies**
- [ ] useLayoutEffect (not useEffect)
- [ ] All color props in dependency array
- [ ] `lineWidth` in dependency array
- [ ] All visibility flags (showGrid, showFill, etc.) in dependencies
- [ ] All data props (threshold, frequency, attack, etc.) in dependencies
- [ ] Check: Are ALL props used in drawing code listed?

**3. Color Visibility**
- [ ] `curveColor` is valid CSS color
- [ ] `curveColor` contrasts with `backgroundColor`
- [ ] `lineWidth` > 0
- [ ] For debugging: Can temporarily set `curveColor = '#ff00ff'` to force visibility

**4. Mouse Coordinates**
- [ ] Uses `getBoundingClientRect()` pattern
- [ ] Calculates `mouseX = clientX - rect.left`
- [ ] Calculates `mouseY = clientY - rect.top`
- [ ] Handle hit detection receives correct coordinates

**5. Curve Point Calculation**
- [ ] Points array populated
- [ ] Points within canvas bounds (0 to width, 0 to height)
- [ ] Coordinate transformations applied (frequencyToX, dbToY, etc.)
- [ ] Check with `console.log(points)` if curve not visible

**6. Handle Rendering**
- [ ] Handles drawn at correct positions
- [ ] Handle size matches CONTEXT.md (8px base, 10px hover)
- [ ] Hover state updates trigger redraw
- [ ] Cursor changes on hover

## Bug Fix Strategy

**Systematic approach for this phase:**

1. **Verify each element renders in isolation**
   - Create minimal test case for each renderer
   - Use known-good props (bright colors, thick lines)
   - Confirm canvas dimensions correct

2. **Check property flow**
   - Verify parent components pass all required props
   - Check default values in property components
   - Ensure config object structure matches TypeScript types

3. **Test interaction states**
   - Hover detection working?
   - Cursor changes?
   - Hover triggers redraw?

4. **Validate coordinate math**
   - Log curve points to console
   - Verify points within bounds
   - Check for NaN or Infinity values

5. **Color visibility testing**
   - Test with high-contrast colors
   - Check alpha channel values
   - Verify lineWidth > 0

## Open Questions

Things that couldn't be fully resolved without running the application:

1. **What are the actual visibility bugs?**
   - What we know: Phase description says "visibility/interaction issues"
   - What's unclear: Which specific elements are broken, what symptoms
   - Recommendation: Test each element systematically, document actual bugs

2. **Are property defaults correctly set?**
   - What we know: Renderers fall back to mock data when props undefined
   - What's unclear: Do property panels provide all required values?
   - Recommendation: Check property components for complete default values

3. **Is HiDPI scaling working correctly?**
   - What we know: `useCanvasSetup` hook exists and looks correct
   - What's unclear: Is `canvasScale` prop passed correctly from parents?
   - Recommendation: Verify prop flow, test on Retina display

## Sources

### Primary (HIGH confidence)
- [MDN: Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) - Canvas performance best practices
- [Konva: Optimize Animation Performance](https://konvajs.org/docs/performance/Optimize_Animation.html) - Animation optimization techniques
- Existing codebase files (all renderers, hooks, utilities) - Current implementation patterns

### Secondary (MEDIUM confidence)
- [Kirupa: HiDPI Canvas](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm) - Retina display scaling
- [Kent C. Dodds: useEffect vs useLayoutEffect](https://kentcdodds.com/blog/useeffect-vs-uselayouteffect) - React hooks timing
- [HTML5 Canvas Mouse Coordinates](https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/) - Mouse coordinate transformation
- [Audio EQ Cookbook](https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html) - Biquad filter formulas (referenced in code comments)

### Tertiary (LOW confidence)
- WebSearch results on canvas bugs - General patterns, need verification against actual bugs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing implementation uses correct tools
- Architecture: HIGH - Patterns are industry-standard and well-implemented
- Pitfalls: HIGH - Known canvas issues well-documented in community
- Bug specifics: LOW - Don't know actual bugs without testing application

**Research date:** 2026-02-02
**Valid until:** 2026-04-02 (60 days - Canvas API and patterns are stable)

**Next steps for planner:**
- Create systematic verification tasks for each curve element
- Plan testing sequence (simplest to most complex)
- Include logging/debugging tasks before fixes
- Structure tasks around verification checklist
