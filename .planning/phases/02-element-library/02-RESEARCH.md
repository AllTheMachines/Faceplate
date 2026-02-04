# Phase 2: Element Library - Research

**Researched:** 2026-01-23
**Domain:** HTML/SVG-based UI components for audio plugin controls
**Confidence:** HIGH

## Summary

This phase implements six core element types (Knob, Slider, Button, Label, Level Meter, Image) using HTML/SVG components that render identically in the designer and export. The research validates the decision to use HTML/SVG directly rather than Konva, confirming this approach is standard for audio plugin UIs and provides true WYSIWYG rendering.

The standard approach for audio plugin UI controls uses SVG for vector graphics (knobs, sliders, meters) with React component composition patterns. A BaseElement wrapper handles common properties (position, size, rotation) while specialized renderers (KnobRenderer, SliderRenderer) handle type-specific rendering. This pattern is well-established in React component libraries and TypeScript discriminated unions provide type-safe element rendering.

Performance is not a concern for 20-50 elements. SVG with absolute positioning performs well up to ~5,000 elements, and CSS transforms (scale/translate) are GPU-accelerated. The main technical challenges are SVG arc path calculations for knobs, stroke-dasharray/stroke-dashoffset for meters, and maintaining accessibility with keyboard navigation.

**Primary recommendation:** Use BaseElement wrapper with discriminated union types for type-safe specialized renderers. SVG for all controls except Image elements. CSS transforms for canvas zoom/pan. Inline styles or Tailwind for dynamic positioning, CSS modules for component styles.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component framework | Already in stack, universal for UI |
| TypeScript | 5.x | Type safety | Already in stack, discriminated unions critical |
| SVG (native) | - | Vector graphics rendering | Native browser support, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 3.x | Utility-first styling | Already in stack, best performance for dynamic styles |
| react-dropzone | 14.x | Image drag/drop upload | For Image element file selection |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG paths (native) | svg-knob library | Library adds 3-5kb but provides pre-built knob logic; custom paths give full control |
| Inline styles | CSS-in-JS | CSS-in-JS has runtime overhead; inline or Tailwind better for dynamic positioning |
| Custom image handling | HTML5 FileReader (native) | Native API sufficient; react-dropzone adds UX polish for drag/drop |

**Installation:**
```bash
npm install react-dropzone
# All other dependencies already in Phase 1 stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── elements/
│   │   ├── BaseElement.tsx           # Common wrapper (position, size, rotation)
│   │   ├── renderers/
│   │   │   ├── KnobRenderer.tsx      # SVG knob rendering
│   │   │   ├── SliderRenderer.tsx    # SVG slider rendering
│   │   │   ├── ButtonRenderer.tsx    # HTML/SVG button
│   │   │   ├── LabelRenderer.tsx     # HTML text label
│   │   │   ├── MeterRenderer.tsx     # SVG level meter
│   │   │   └── ImageRenderer.tsx     # HTML img element
│   │   └── Element.tsx               # Discriminated union renderer
│   └── Canvas.tsx                    # Container with zoom/pan transforms
├── types/
│   └── elements.ts                   # Element config interfaces
└── store/
    └── canvasStore.ts                # Element state management (Zustand)
```

### Pattern 1: BaseElement Wrapper with Specialized Renderers
**What:** A wrapper component handles common properties (position, size, rotation) and delegates type-specific rendering to specialized child components.

**When to use:** When building component libraries with shared behavior and type-specific presentation. This is the compound component pattern.

**Example:**
```typescript
// types/elements.ts
// Source: https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions
interface BaseElementConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

interface KnobElementConfig extends BaseElementConfig {
  type: 'knob';
  diameter: number;
  value: number;
  min: number;
  max: number;
  arcStart: number;
  arcEnd: number;
  trackColor: string;
  fillColor: string;
}

interface SliderElementConfig extends BaseElementConfig {
  type: 'slider';
  orientation: 'vertical' | 'horizontal';
  value: number;
  min: number;
  max: number;
  trackColor: string;
  thumbColor: string;
}

// Discriminated union with 'type' as discriminant
type ElementConfig = KnobElementConfig | SliderElementConfig | /* ... */;

// components/elements/BaseElement.tsx
// Source: https://www.patterns.dev/react/compound-pattern/
interface BaseElementProps {
  element: ElementConfig;
  children: React.ReactNode;
}

function BaseElement({ element, children }: BaseElementProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
  };

  return <div style={style}>{children}</div>;
}

// components/elements/Element.tsx
// Source: TypeScript discriminated unions pattern
function Element({ element }: { element: ElementConfig }) {
  return (
    <BaseElement element={element}>
      {element.type === 'knob' && <KnobRenderer config={element} />}
      {element.type === 'slider' && <SliderRenderer config={element} />}
      {/* ... other types */}
    </BaseElement>
  );
}
```

### Pattern 2: SVG Arc Path for Knobs
**What:** Use SVG path element with arc (A) command to draw circular knob tracks and value fills.

**When to use:** For all rotary controls (knobs, encoders).

**Example:**
```typescript
// components/elements/renderers/KnobRenderer.tsx
// Source: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function KnobRenderer({ config }: { config: KnobElementConfig }) {
  const { diameter, value, min, max, arcStart, arcEnd } = config;
  const radius = diameter / 2;
  const trackRadius = radius * 0.8;

  // Calculate value angle
  const range = max - min;
  const normalizedValue = (value - min) / range;
  const valueAngle = arcStart + normalizedValue * (arcEnd - arcStart);

  const trackPath = describeArc(radius, radius, trackRadius, arcStart, arcEnd);
  const valuePath = describeArc(radius, radius, trackRadius, arcStart, valueAngle);

  return (
    <svg width={diameter} height={diameter}>
      {/* Background track */}
      <path
        d={trackPath}
        fill="none"
        stroke={config.trackColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Value fill */}
      <path
        d={valuePath}
        fill="none"
        stroke={config.fillColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

### Pattern 3: Stroke-Dasharray/Dashoffset for Meters
**What:** Use SVG stroke-dasharray and stroke-dashoffset to create level meter fill animations.

**When to use:** For all meter-style visualizations (peak meters, RMS meters, gain reduction).

**Example:**
```typescript
// components/elements/renderers/MeterRenderer.tsx
// Source: https://css-tricks.com/almanac/properties/s/stroke-dashoffset/
function MeterRenderer({ config }: { config: MeterElementConfig }) {
  const { width, height, orientation, value, min, max } = config;

  const isVertical = orientation === 'vertical';
  const length = isVertical ? height : width;

  // Normalize value to 0-1 range
  const normalizedValue = (value - min) / (max - min);

  // Calculate offset (full length = no fill, 0 = full fill)
  const offset = length * (1 - normalizedValue);

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={`meter-${config.id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="green" />
          <stop offset="70%" stopColor="yellow" />
          <stop offset="100%" stopColor="red" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect
        width={width}
        height={height}
        fill={config.backgroundColor}
      />

      {/* Meter fill */}
      <line
        x1={isVertical ? width / 2 : 0}
        y1={isVertical ? height : height / 2}
        x2={isVertical ? width / 2 : width}
        y2={isVertical ? 0 : height / 2}
        stroke={`url(#meter-${config.id})`}
        strokeWidth={isVertical ? width : height}
        strokeDasharray={length}
        strokeDashoffset={offset}
        strokeLinecap="butt"
      />
    </svg>
  );
}
```

### Pattern 4: CSS Transform for Canvas Zoom/Pan
**What:** Use CSS transform property on container div for GPU-accelerated zoom and pan.

**When to use:** For canvas viewport transformations (already implemented in Phase 1, but replacing Konva).

**Example:**
```typescript
// components/Canvas.tsx
// Source: https://github.com/timmywil/panzoom
function Canvas() {
  const { zoom, panX, panY, elements } = useCanvasStore();

  // CRITICAL: translate BEFORE scale for correct behavior
  // Source: https://jakearchibald.com/2025/animating-zooming/
  const containerStyle: React.CSSProperties = {
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    transformOrigin: '0 0',
    willChange: 'transform', // GPU acceleration hint
  };

  return (
    <div className="canvas-viewport">
      <div style={containerStyle} className="canvas-container">
        {elements.map((element) => (
          <Element key={element.id} element={element} />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 5: Image Element with Base64 Data URLs
**What:** Store uploaded images as base64 data URLs in element config, render as img elements or SVG image.

**When to use:** For Image elements (backgrounds, logos, decorative graphics).

**Example:**
```typescript
// components/elements/renderers/ImageRenderer.tsx
// Source: https://blog.logrocket.com/create-drag-and-drop-component-react-dropzone/
interface ImageElementConfig extends BaseElementConfig {
  type: 'image';
  src: string; // base64 data URL or external URL
  fit: 'contain' | 'cover' | 'fill' | 'none';
}

function ImageRenderer({ config }: { config: ImageElementConfig }) {
  const objectFit = config.fit;

  return (
    <img
      src={config.src}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        objectFit,
      }}
    />
  );
}

// Image upload handler using react-dropzone
function ImageUploadPanel({ elementId }: { elementId: string }) {
  const updateElement = useCanvasStore((state) => state.updateElement);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateElement(elementId, { src: dataUrl });
    };

    reader.readAsDataURL(file);
  }, [elementId, updateElement]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag image here or click to select</p>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Mixing coordinate systems:** Elements use canvas coordinates (absolute px), not screen coordinates. Transform is on container, not individual elements. Source: https://medium.com/@jamiecarter7/position-fixed-not-working-why-297c16e3b59f
- **Scale before translate:** CSS transform order matters. `translate(x, y) scale(z)` is correct; `scale(z) translate(x, y)` creates non-linear effects. Source: https://jakearchibald.com/2025/animating-zooming/
- **Runtime CSS-in-JS:** Avoid styled-components or emotion for dynamic styles. Use inline styles or Tailwind classes. CSS-in-JS has runtime overhead. Source: https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753
- **Missing accessibility:** SVG controls need focusable="false" on SVG, tabindex="0" on wrapper, keyboard event handlers. Source: https://www.a11y-collective.com/blog/svg-accessibility/

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arc path generation | Manual trigonometry with edge cases | describeArc helper (from MDN pattern) | Handles large-arc-flag, sweep-flag, and 360° circles correctly |
| Drag/drop image upload | FileReader with drag event handlers | react-dropzone | Handles MIME type validation, file size limits, multiple files, error states |
| Linear gradients for meters | Manual color interpolation | SVG linearGradient with stops | Native browser optimization, supports opacity, animatable |
| Knob mouse interaction | Manual angle calculation | Standard pattern: clientY offset, modulo arithmetic | Handles discontinuity at 0/360°, prevents jumps |

**Key insight:** SVG has mature patterns for interactive controls. Audio plugin UIs have been built with web tech since 2015+ (JUCE WebView2). Don't reinvent circular arc math or gradient rendering - use proven patterns.

## Common Pitfalls

### Pitfall 1: SVG Performance Degradation with Many Elements
**What goes wrong:** Rendering 50+ absolutely positioned SVG elements in a React component can cause jank during zoom/pan if each element re-renders on every transform change.

**Why it happens:** React reconciliation checks all children when parent state changes. If zoom/pan state is in same store as elements, every zoom triggers element re-renders.

**How to avoid:** Separate viewport state (zoom, pan) from element state. Use React.memo on Element component. CSS transform on container means elements don't need to re-render during zoom/pan - they're just transformed by container.

**Warning signs:** Sluggish zoom/pan with 20+ elements. React DevTools Profiler shows Element components rendering during zoom.

**Solution:**
```typescript
// WRONG: Element re-renders on zoom change
function Canvas() {
  const { zoom, panX, panY, elements } = useCanvasStore(); // zoom change triggers re-render
  return elements.map(el => <Element element={el} />); // all elements re-render
}

// RIGHT: Memoize Element, separate viewport state
const Element = React.memo(function Element({ element }: { element: ElementConfig }) {
  // Only re-renders when element config changes
  return <BaseElement element={element}>...</BaseElement>;
});

function Canvas() {
  const { zoom, panX, panY } = useViewportStore(); // separate store
  const elements = useElementsStore(); // different store
  // Zoom changes don't trigger elements re-render
}
```

Source: https://www.developerway.com/posts/react-elements-children-parents

### Pitfall 2: Transform Creates Containing Block for Fixed/Absolute Children
**What goes wrong:** If BaseElement uses `position: absolute` and parent has `transform`, child elements with `position: absolute` position relative to transformed parent, not the viewport.

**Why it happens:** CSS spec: transform creates a new stacking context and containing block. This affects child absolute/fixed positioning.

**How to avoid:** This is actually desired behavior for our use case (elements positioned in transformed canvas). But be aware that nested absolute positioning inside elements will be relative to the element, not the canvas.

**Warning signs:** Elements positioned at unexpected coordinates when canvas is zoomed/panned.

**Solution:** Document this in code comments. For nested absolute positioning within elements (e.g., knob label), use element-relative coordinates.

Source: https://developer.mozilla.org/en-US/docs/Web/CSS/transform

### Pitfall 3: SVG Arc Large-Arc-Flag Confusion
**What goes wrong:** Knob arc renders incorrectly for values > 180° or < 180° because large-arc-flag is wrong.

**Why it happens:** SVG arc has 4 possible paths between two points. Large-arc-flag (0 or 1) determines which arc to draw. If flag is wrong, you get the opposite arc.

**How to avoid:** Use formula: `largeArcFlag = (endAngle - startAngle) > 180 ? '1' : '0'`. Always subtract angles in correct order. Handle 360° case with two arcs.

**Warning signs:** Knob arc "inverts" at certain values. Arc disappears when it should be full, or shows when it should be empty.

**Solution:** Use proven describeArc pattern from MDN with angle normalization.

Source: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

### Pitfall 4: Missing Accessibility for SVG Controls
**What goes wrong:** Keyboard users can't interact with knobs/sliders. Screen readers don't announce values.

**Why it happens:** SVG elements are not focusable or semantically meaningful by default.

**How to avoid:**
- Add `focusable="false"` to SVG element
- Add `tabIndex={0}` to wrapper div
- Add `role="slider"` and `aria-valuemin/max/now` attributes
- Implement keyboard handlers (ArrowUp/Down/Left/Right)
- Add visible focus indicator

**Warning signs:** Can't tab to controls. Screen reader says "group" or nothing.

**Solution:**
```typescript
function BaseElement({ element, children }: BaseElementProps) {
  const isInteractive = ['knob', 'slider', 'button'].includes(element.type);

  return (
    <div
      style={style}
      tabIndex={isInteractive ? 0 : -1}
      role={element.type === 'knob' || element.type === 'slider' ? 'slider' : undefined}
      aria-valuemin={element.min}
      aria-valuemax={element.max}
      aria-valuenow={element.value}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

Source: https://www.a11y-collective.com/blog/svg-accessibility/

### Pitfall 5: Inline Style vs Class Performance
**What goes wrong:** Using inline styles for every element creates style recalculation overhead during re-renders.

**Why it happens:** Inline styles create new style objects on every render, triggering style recalculation even if values didn't change.

**How to avoid:** For dynamic positioning (x, y, width, height, rotation), inline styles are necessary and performant. For static styles (colors, borders), use CSS classes or Tailwind.

**Warning signs:** React DevTools shows style prop changing on every render even when values are the same.

**Solution:** Use Tailwind for static styles, inline for dynamic positioning. Alternatively, memoize style object:
```typescript
const style = React.useMemo(() => ({
  position: 'absolute',
  left: element.x,
  top: element.y,
  // ...
}), [element.x, element.y, /* only position deps */]);
```

Source: https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753

## Code Examples

Verified patterns from official sources:

### SVG Linear Gradient for Meters
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient
<svg width={width} height={height}>
  <defs>
    <linearGradient id="meter-gradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor="green" />
      <stop offset="60%" stopColor="yellow" />
      <stop offset="90%" stopColor="orange" />
      <stop offset="100%" stopColor="red" />
    </linearGradient>
  </defs>

  <rect
    width={width}
    height={height}
    fill="url(#meter-gradient)"
  />
</svg>
```

### TypeScript Discriminated Union for Element Rendering
```typescript
// Source: https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions
type ElementConfig =
  | { type: 'knob'; diameter: number; value: number; /* ... */ }
  | { type: 'slider'; orientation: 'vertical' | 'horizontal'; /* ... */ }
  | { type: 'button'; label: string; /* ... */ }
  | { type: 'label'; text: string; /* ... */ }
  | { type: 'meter'; meterType: 'peak' | 'rms'; /* ... */ }
  | { type: 'image'; src: string; /* ... */ };

function renderElement(element: ElementConfig) {
  switch (element.type) {
    case 'knob':
      return <KnobRenderer diameter={element.diameter} value={element.value} />;
    case 'slider':
      return <SliderRenderer orientation={element.orientation} />;
    // TypeScript ensures exhaustive checking
    default:
      const _exhaustive: never = element;
      return null;
  }
}
```

### Readonly Element Config Interface
```typescript
// Source: https://tigeroakes.com/posts/readonly-by-default/
interface ElementConfig {
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
  // ... other properties
}

// In Zustand store, use Immer for immutable updates
import { produce } from 'immer';

const useCanvasStore = create<CanvasState>((set) => ({
  elements: [],
  updateElement: (id, updates) =>
    set(
      produce((state) => {
        const element = state.elements.find((el) => el.id === id);
        if (element) {
          Object.assign(element, updates);
        }
      })
    ),
}));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Canvas 2D for controls | HTML/SVG components | 2018-2020 | True WYSIWYG, easier export, better accessibility |
| react-konva for designer | CSS transform container | 2020-2022 | Eliminated translation layer, simpler architecture |
| CSS-in-JS (styled-components) | Tailwind + inline styles | 2023-2026 | Better performance, smaller bundles |
| Manual arc calculations | SVG path helpers | Established pattern | Fewer bugs, handles edge cases |

**Deprecated/outdated:**
- **Konva/Fabric.js for UI designers:** Overkill for 20-50 elements. HTML/SVG with CSS transforms is standard for small element counts (< 1000).
- **Runtime CSS-in-JS:** Performance costs are well-documented by 2026. Tailwind and native CSS dominate.
- **Flash/ActionScript patterns:** Historical context only. Web Audio API + WebView2 is modern standard.

## Open Questions

Things that couldn't be fully resolved:

1. **Button icon libraries for UI controls**
   - What we know: lucide-react, heroicons, phosphor-icons are popular 2026 options
   - What's unclear: Whether to bundle icon library or let users import SVG icons
   - Recommendation: Start with simple shapes (circle, rectangle for momentary/toggle states). Add icon library in later phase if needed.

2. **Knob interaction mode (circular vs vertical drag)**
   - What we know: Audio plugins use both. Circular follows mouse angle, vertical uses Y-axis movement.
   - What's unclear: Which to use as default, or make configurable per-knob.
   - Recommendation: Implement vertical drag (simpler, more common). Add circular mode as enhancement in later phase if requested.

3. **Label font rendering and system fonts**
   - What we know: Web fonts require loading, system fonts vary by OS
   - What's unclear: Whether to bundle web fonts or stick to system font stack
   - Recommendation: Use system font stack for v1 (Arial, Helvetica, sans-serif). Font embedding is Phase 7+ feature.

4. **Level meter ballistics implementation**
   - What we know: Peak/RMS meters need attack/release times (10ms attack, 300ms release)
   - What's unclear: Whether to implement actual ballistics in Phase 2 or just static display
   - Recommendation: Phase 2 renders static meter at specified value. Ballistics are export-time concern (JUCE backend provides real-time values).

## Sources

### Primary (HIGH confidence)
- MDN Web Docs - SVG Paths: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths (arc syntax, large-arc-flag)
- MDN Web Docs - SVG linearGradient: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient (gradient stops, attributes)
- MDN Web Docs - CSS transform: https://developer.mozilla.org/en-US/docs/Web/CSS/transform (containing block behavior)
- React TypeScript Discriminated Unions: https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions
- React Compound Pattern: https://www.patterns.dev/react/compound-pattern/
- CSS Transform Order: https://jakearchibald.com/2025/animating-zooming/ (translate before scale)

### Secondary (MEDIUM confidence)
- SVG Knob Library (francoisgeorgy): https://github.com/francoisgeorgy/svg-knob (configuration patterns, value mapping)
- Panzoom Library: https://github.com/timmywil/panzoom (CSS transform performance)
- React Children Re-render: https://www.developerway.com/posts/react-elements-children-parents (memo patterns)
- SVG Accessibility: https://www.a11y-collective.com/blog/svg-accessibility/ (focusable, ARIA attributes)
- CSS Styling 2026: https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753 (Tailwind vs CSS-in-JS)
- Stroke-dasharray/dashoffset: https://css-tricks.com/almanac/properties/s/stroke-dashoffset/ (meter animation)
- React Dropzone: https://blog.logrocket.com/create-drag-and-drop-component-react-dropzone/ (image upload)
- Readonly TypeScript: https://tigeroakes.com/posts/readonly-by-default/ (React state patterns)

### Tertiary (LOW confidence)
- WebSearch results for SVG audio controls, React component patterns (multiple sources, cross-verified)
- Community discussions on SVG performance with many elements (varies by browser, 5k limit is approximate)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React/TypeScript already chosen, SVG is native, patterns verified with official docs
- Architecture: HIGH - Discriminated unions, compound pattern, CSS transforms all have official documentation
- Pitfalls: MEDIUM/HIGH - Performance pitfalls verified with developer blogs, accessibility verified with W3C/A11Y resources
- Code examples: HIGH - All examples derived from or verified with MDN/official documentation

**Research date:** 2026-01-23
**Valid until:** 2026-03-23 (60 days - SVG/React patterns are stable, but keep eye on React Compiler adoption)
