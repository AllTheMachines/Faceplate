# Domain Pitfalls: Canvas-Based Visual Design Tools

**Domain:** Browser-based visual design tools / canvas editors
**Researched:** 2026-01-23
**Confidence:** MEDIUM (WebSearch findings cross-referenced across multiple sources)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Naive Undo/Redo with Full Canvas Snapshots
**What goes wrong:** Storing the entire canvas state as an image (base64 via toDataURL) for every undo/redo operation creates massive memory consumption and performance degradation. With 50+ undo states, memory usage spirals out of control, causing browser crashes.

**Why it happens:** It's the simplest implementation to write. Developers reach for `canvas.toDataURL()` because it "just works" initially with minimal code.

**Consequences:**
- Memory exceptions and browser freezes
- Undo/redo becomes slower as history grows
- Mobile devices crash with moderate usage
- Forces aggressive history limits (10-15 steps max)

**Prevention:**
- Store minimal command/action objects instead: `{type: 'move', elementId: 'knob-1', from: {x: 10, y: 20}, to: {x: 50, y: 60}}`
- For SVG-based editors (like this project), serialize only the changed element properties
- Use immutable data structures with structural sharing (Immer.js with Zustand)
- Store deltas, not full snapshots

**Detection:**
- Undo/redo feels sluggish after 5-10 operations
- Browser DevTools shows memory climbing with each undo
- Mobile testing reveals crashes
- Heap snapshots show massive base64 strings in memory

**Phase Impact:** Phase 2 (Core Canvas Operations). Undo/redo architecture must be correct from the start. Refactoring later requires touching every state mutation.

**Sources:**
- [Development of undo and redo functionality with canvas](https://www.abidibo.net/blog/2011/10/12/development-undo-and-redo-functionality-canvas/)
- [Undo and Redo with HTML5 Canvas](https://codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx)

---

### Pitfall 2: DOM Mutation in Drag-Drop Instead of React's Declarative Model
**What goes wrong:** Directly manipulating the DOM during drag operations (position: absolute with manual x/y updates) breaks React's rendering model. Results in ghost elements, lost state, and impossible-to-debug race conditions between React renders and manual DOM updates.

**Why it happens:** Many drag-drop tutorials and legacy jQuery examples use imperative DOM manipulation. Developers copy these patterns without understanding they conflict with React.

**Consequences:**
- Elements appear in wrong positions after drag
- State becomes desynchronized from UI
- Redo/undo breaks because DOM and state diverge
- Component lifecycle issues (useEffect runs against stale DOM)
- Testing becomes impossible (can't assert on state vs DOM)

**Prevention:**
- Use @dnd-kit (already in project stack) which is React-native and manages state declaratively
- All drag operations must update Zustand store, never DOM directly
- Let React re-render based on state changes
- Use CSS transforms for visual feedback during drag, but commit to state on drop

**Detection:**
- console.warn() calls from React about external DOM mutations
- Elements snap to wrong positions after drag completes
- Undo reverts state but UI doesn't update
- Cannot reproduce drag bugs in tests

**Phase Impact:** Phase 3 (Drag & Drop). Architectural decision. Using @dnd-kit prevents this, but if custom drag logic is added later, this trap reappears.

**Sources:**
- [The Future of Drag and Drop APIs by Dan Abramov](https://medium.com/@dan_abramov/the-future-of-drag-and-drop-apis-249dfea7a15f)
- [Drag and Drop Component Builder using React](https://whoisryosuke.com/blog/2020/drag-and-drop-builder-using-react)

---

### Pitfall 3: SVG DOM Overhead with Many Elements
**What goes wrong:** SVG elements in the DOM are expensive. With 100+ elements (a moderate-sized design), browsers struggle with style recalculation, reflow, and event handler overhead. Dragging feels janky. Selection boxes lag. The entire editor becomes unresponsive.

**Why it happens:** SVG seems perfect for design tools (vector, zoomable, styleable), but each SVG element is a full DOM node with associated overhead. React managing thousands of SVG nodes with event handlers amplifies the problem.

**Consequences:**
- Frame drops during drag (< 30 FPS)
- Multi-select with 50+ elements freezes UI
- Property panel updates cause entire canvas to re-render
- Memory usage scales poorly (50 MB for 200 elements is common)

**Prevention:**
- **Hybrid rendering:** Keep selected/hovered elements as SVG DOM (for easy manipulation), render unselected elements to a cached `<canvas>` or `<img>` layer underneath
- Virtualization: Only render elements in viewport (like Figma does)
- Use React.memo() aggressively on SVG components
- Consolidate event handlers (single handler on container, not per-element)
- Debounce property panel updates (see Pitfall 6)

**Detection:**
- Chrome DevTools Performance tab shows > 50ms for "Recalculate Style"
- FPS drops below 30 during drag with > 50 elements
- React DevTools Profiler shows entire component tree re-rendering on property change

**Phase Impact:** Phase 1 (Basic Canvas & Element Rendering). Affects architecture choice. Decide early: pure SVG, pure Canvas, or hybrid. Refactoring later is a rewrite.

**Recommendation:** For this project (audio plugin UI designer), element counts will likely be modest (< 100 elements per design). Start with pure SVG (simpler, already using React). Add canvas layer optimization later if profiling shows it's needed. Don't pre-optimize.

**Sources:**
- [From SVG to Canvas – part 1: making Felt faster](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster)
- [High Performance SVGs](https://css-tricks.com/high-performance-svgs/)
- [Canvas vs SVG: Choosing the Right Tool](https://www.sitepoint.com/canvas-vs-svg/)

---

### Pitfall 4: Coordinate System Confusion (Screen vs Canvas vs Element Space)
**What goes wrong:** Mix up coordinate systems when implementing zoom/pan/drag. Mouse click at screen position (200, 100) isn't the same as canvas position with 2x zoom and pan offset. Elements get placed in wrong locations. Selection boxes don't align. Resize handles appear offset from elements.

**Why it happens:** Forgetting to transform coordinates between spaces. Three different coordinate systems exist simultaneously:
1. Screen space (mouse event clientX/clientY)
2. Canvas space (after zoom/pan transforms)
3. Element space (relative to element's own origin for nested transforms)

**Consequences:**
- Elements placed at wrong positions when zoomed
- Selection box doesn't surround element correctly
- Drag handles appear offset from corners
- Multi-select bounding box calculations are wrong
- Copy/paste places elements at incorrect coordinates

**Prevention:**
- Create utility functions for each transform: `screenToCanvas()`, `canvasToElement()`, `elementToCanvas()`
- Test coordinate transforms at 0.25x, 1x, and 4x zoom levels
- Test with pan offset (not just 0,0 origin)
- Document which coordinate system each function expects/returns
- Use TypeScript nominal types to prevent mixing coordinate systems

```typescript
type ScreenCoord = { x: number; y: number } & { __brand: 'screen' };
type CanvasCoord = { x: number; y: number } & { __brand: 'canvas' };

function screenToCanvas(screen: ScreenCoord, zoom: number, pan: CanvasCoord): CanvasCoord {
  return {
    x: (screen.x - pan.x) / zoom,
    y: (screen.y - pan.y) / zoom,
  } as CanvasCoord;
}
```

**Detection:**
- Elements jump to wrong position when zoomed
- Selection boxes don't align with elements at non-1x zoom
- Drag operations work at 1x zoom but fail at 2x zoom
- Copy-paste position changes based on zoom level

**Phase Impact:** Phase 2 (Core Canvas Operations - Zoom/Pan). Must be correct from the start. All future features (drag, select, resize) depend on this foundation.

**Sources:**
- [Panning and Zooming in HTML Canvas](https://harrisonmilbradt.com/blog/canvas-panning-and-zooming)
- [Transform Coordinate Systems with Map 3D Tools](https://www.seiler-ds.com/transform-coordinate-systems-map-3d-tools-inside-civil-3d/)

---

### Pitfall 5: Missing Transform Reset Before Canvas Clear
**What goes wrong:** When using `<canvas>` for rendering, forgetting to reset transforms before clearing leads to visual artifacts. Clearing with an active zoom/pan transform only clears a zoomed portion, leaving ghost images from previous frames.

**Why it happens:** Canvas context retains transform state across frames. `ctx.clearRect()` is affected by current transform, which is non-obvious.

**Consequences:**
- Trails/ghosts during animations
- Canvas never fully clears
- Zooming leaves artifacts
- Only visible during zoom/pan operations (works fine at 1x, breaks at other scales)

**Prevention:**
```javascript
// WRONG
ctx.clearRect(0, 0, canvas.width, canvas.height);

// CORRECT
ctx.save();
ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to identity
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.restore();
```

**Detection:**
- Visual artifacts during zoom/pan
- Canvas never fully clears
- Previous frame elements leave trails
- Only happens when zoom !== 1 or pan !== (0,0)

**Phase Impact:** Phase 2 (Core Canvas Operations). Only applies if using `<canvas>` for rendering. This project uses SVG, so this specific issue doesn't apply, but similar transform issues exist with SVG viewBox.

**Sources:**
- [Simple Pan and Zoom Canvas](https://codepen.io/chengarda/pen/wRxoyB)
- [HTML5 Canvas Zoom and Pan Image](https://gist.github.com/dzhang123/2a3a611b3d75a45a3f41)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 6: No Debouncing on Real-Time Preview Updates
**What goes wrong:** Property panel with color picker, number inputs, sliders triggers preview update on every onChange event. Dragging a slider fires 60 events/second. Each event causes full React re-render of canvas, property panel, and preview. Frame rate drops to < 10 FPS. App feels broken.

**Why it happens:** Controlled inputs in React naturally trigger onChange on every keystroke/drag. Without explicit debouncing, state updates propagate immediately.

**Consequences:**
- Typing in number input lags (500ms+ delay between keypress and visual feedback)
- Dragging slider is choppy
- Color picker updates lag
- Battery drain on laptops
- Users perceive app as buggy/broken

**Prevention:**
- Debounce property panel updates with 16ms delay (one frame at 60 FPS) for preview
- Use optimistic UI: update local input state immediately, debounce store update
- For expensive operations (re-rendering full canvas), debounce with 100-200ms
- Consider throttle instead of debounce for continuous interactions (slider drag)

```typescript
// Store shows optimistic value immediately for input
const [localValue, setLocalValue] = useState(store.angle);
const debouncedUpdate = useMemo(
  () => debounce((val) => store.updateAngle(val), 100),
  []
);

const handleChange = (val) => {
  setLocalValue(val); // immediate UI update
  debouncedUpdate(val); // debounced store/canvas update
};
```

**Detection:**
- Input lag when typing in property panel
- Choppy slider interactions
- React DevTools Profiler shows > 60 renders/second
- Performance timeline shows frame drops during property changes

**Phase Impact:** Phase 4 (Property Panel). Easy to add debouncing after the fact, but if omitted, creates bad first impression during MVP demo. Add during Phase 4 implementation.

**Sources:**
- [JavaScript Performance Optimization: Debounce vs Throttle](https://dev.to/nilebits/javascript-performance-optimization-debounce-vs-throttle-explained-5768)
- [Optimizing Performance: Using Debouncing and Throttling](https://dev.to/austinwdigital/optimizing-performance-using-debouncing-and-throttling-1b64)

---

### Pitfall 7: Uncontrolled Form Performance with 20+ Inputs
**What goes wrong:** Property panel with 20+ inputs (colors, numbers, toggles) causes entire form to re-render on every keystroke. With default React controlled components, typing in one input re-renders all 20+ inputs, their labels, and validation logic. Noticeable lag.

**Why it happens:** React's default controlled component pattern re-renders entire form on every state change. Fine for 5 inputs, breaks at 20+.

**Consequences:**
- 100ms+ lag when typing in inputs
- CPU spikes during form interactions
- Dropdown selections feel sluggish
- Mobile devices struggle

**Prevention:**
- Use React Hook Form (already fast, minimal re-renders)
- Alternative: Uncontrolled inputs with refs, update store on blur
- Use `React.memo()` on individual form fields
- Isolate subscriptions: only re-render fields that depend on changed value

```typescript
// WRONG: entire form re-renders on every change
function PropertyPanel({ element }) {
  const [props, setProps] = useState(element);
  // 20+ inputs all re-render when any one changes
}

// BETTER: React Hook Form isolates re-renders
function PropertyPanel({ element }) {
  const { register, watch } = useForm({ defaultValues: element });
  // Only changed input re-renders
}
```

**Detection:**
- React DevTools Profiler shows all form fields re-rendering on single input change
- Input lag with 15+ form fields
- Performance timeline shows long "Render" phases during typing

**Phase Impact:** Phase 4 (Property Panel). Preventable with correct library choice. If using plain controlled components, refactoring to React Hook Form later touches every input. Choose correct approach in Phase 4.

**Sources:**
- [Solving React Form Performance](https://dev.to/opensite/solving-react-form-performance-why-your-forms-are-slow-and-how-to-fix-them-1g9i)
- [Best Practices for Handling Forms in React (2025 Edition)](https://medium.com/@farzanekazemi8517/best-practices-for-handling-forms-in-react-2025-edition-62572b14452f)

---

### Pitfall 8: Deep Cloning State with JSON.parse(JSON.stringify())
**What goes wrong:** Using `JSON.parse(JSON.stringify(state))` to deep clone state for undo/redo or immutability loses:
- Date objects become strings
- Functions are dropped
- Circular references throw errors
- Map/Set become empty objects {}
- undefined becomes null

**Why it happens:** It's the simplest one-liner for deep cloning. Works for simple objects but breaks with complex state.

**Consequences:**
- Undo/redo breaks when state contains Dates or special objects
- Performance overhead (serialize + deserialize entire tree)
- Subtle bugs where typeof changes after clone

**Prevention:**
- Use Immer.js (already with Zustand) for immutable updates (no manual cloning needed)
- If manual cloning needed, use `structuredClone()` (modern alternative, handles more types)
- Avoid storing non-serializable data in state (functions, DOM nodes)

```typescript
// WRONG
const cloned = JSON.parse(JSON.stringify(state));

// BETTER (modern browsers)
const cloned = structuredClone(state);

// BEST (with Zustand + Immer)
set(produce((draft) => {
  draft.elements[0].x = 100; // Immer handles immutability
}));
```

**Detection:**
- Date properties become strings after undo
- Type errors: "X is not a function" after state clone
- Performance slow with large state trees

**Phase Impact:** Phase 2 (Core Canvas Operations - Undo/Redo). Already using Zustand which supports Immer middleware. Enable Immer, avoid manual cloning.

**Sources:**
- [Deep Cloning in JavaScript: The Modern Way](https://matiashernandez.dev/blog/post/deep-cloning-in-javascript-the-modern-way.-use-%60structuredclone%60)
- [Implementing Deep Cloning via Serializing objects](https://www.codeproject.com/Articles/23832/Implementing-Deep-Cloning-via-Serializing-objects)

---

### Pitfall 9: Code Export Template Brittleness
**What goes wrong:** Code generation templates break when edge cases aren't handled:
- Element names with spaces/special chars generate invalid variable names
- Hex colors without `#` prefix
- Negative positions or decimal pixel values
- Missing properties cause template crashes

**Why it happens:** Templates are written for the happy path. Real user data has edge cases that weren't considered during template development.

**Consequences:**
- Export generates syntax errors
- Users lose trust in tool
- Support burden increases
- C++ boilerplate has compilation errors

**Prevention:**
- Sanitize all inputs before template insertion:
  - Element names: convert to valid identifiers (spaces → underscores, remove special chars)
  - Colors: ensure # prefix, validate hex format
  - Numbers: round to integer pixels or format to 2 decimals
  - Strings: escape quotes
- Validate data before export, show errors instead of generating bad code
- Include example test cases with edge cases in template tests
- Use a proper templating library (Handlebars, Liquid) with built-in escaping, not string concatenation

```typescript
// WRONG
const code = `const knobX = ${element.x};`; // breaks if x is undefined

// BETTER
const code = `const knobX = ${element.x ?? 0};`;

// BEST
function sanitizeIdentifier(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
}
const code = `const ${sanitizeIdentifier(element.name)}X = ${element.x ?? 0};`;
```

**Detection:**
- User reports "exported code doesn't compile"
- Template crashes with TypeError on certain projects
- Generated code has `NaN`, `undefined` in output

**Phase Impact:** Phase 5 (Export). Write export templates with validation from the start. Test with invalid data, not just happy path examples.

**Sources:**
- [Generate code with text templates](https://learn.microsoft.com/en-us/visualstudio/modeling/walkthrough-generating-code-by-using-text-templates?view=vs-2022)
- [Code Generation and T4 Text Templates](https://learn.microsoft.com/en-us/visualstudio/modeling/code-generation-and-t4-text-templates?view=vs-2022)

---

### Pitfall 10: Missing Keyboard Accessibility
**What goes wrong:** Entire tool is mouse-only. No Tab navigation, no Enter to select, no Escape to deselect, no keyboard shortcuts. Inaccessible to keyboard users, slows down power users, and violates WCAG guidelines.

**Why it happens:** Visual design tools are naturally mouse-centric. Easy to forget keyboard users exist. Keyboard support isn't visually obvious, so it gets deprioritized.

**Consequences:**
- Screen reader users cannot use tool
- Power users frustrated (mouse slower than keyboard for many operations)
- Fails accessibility audits
- Cannot demo tool in accessibility-focused contexts

**Prevention:**
- Use semantic HTML (`<button>`, not `<div onClick>`)
- Tab order should match visual flow
- Focus indicators must be visible (Tailwind's `focus:ring-2` classes)
- Common shortcuts:
  - Tab/Shift+Tab: navigate UI
  - Space/Enter: activate buttons
  - Escape: cancel/deselect
  - Arrow keys: nudge selected element
  - Cmd/Ctrl+Z/Y: undo/redo
  - Delete/Backspace: delete selected
  - Cmd/Ctrl+C/V: copy/paste
- Use `aria-label` for icon-only buttons
- Announce state changes to screen readers (aria-live regions)

**Detection:**
- Cannot Tab through UI to access all features
- Focus indicator not visible
- Actions require mouse (no keyboard alternative)
- Screen reader doesn't announce changes

**Phase Impact:** Phase 3-6 (All interactive features). Add keyboard support as features are built. Retrofitting later is expensive. Test with keyboard-only usage during development.

**Sources:**
- [Keyboard accessibility - TetraLogical](https://tetralogical.com/blog/2025/05/09/foundations-keyboard-accessibility/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [Best Practices for Prototyping Keyboard Accessibility](https://medium.com/thinking-design/best-practices-for-prototyping-keyboard-accessibility-cc2b06a96627)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 11: Zoom/Pan Precision Loss at Extreme Values
**What goes wrong:** Zooming in beyond 10x or out below 0.1x causes:
- Canvas elements disappear
- Blurry rendering
- Coordinate calculations overflow
- Interaction breaks (clicks miss elements)

**Why it happens:** Floating-point precision limits. SVG rendering engines have internal limits. Coordinate transforms compound errors at extreme scales.

**Consequences:**
- Users zoom in too far, canvas goes blank, confused
- Coordinates outside safe integer range produce incorrect positions
- SVG rendering breaks at extreme transforms

**Prevention:**
- Clamp zoom to reasonable range: 0.1x to 10x
- Round coordinates to avoid sub-pixel jitter
- At high zoom, switch from sub-pixel rendering to integer pixels
- Test zoom limits during development

```typescript
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

function handleZoom(delta: number) {
  setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
}
```

**Detection:**
- Elements disappear when zooming in
- Canvas goes blank at extreme zoom levels
- Coordinates become NaN or Infinity

**Phase Impact:** Phase 2 (Zoom/Pan). Easy fix. Add zoom limits during initial implementation.

**Sources:**
- [Simple Pan and Zoom Canvas](https://codepen.io/chengarda/pen/wRxoyB)
- [Infinite HTML canvas with zoom and pan](https://www.sandromaglione.com/articles/infinite-canvas-html-with-zoom-and-pan)

---

### Pitfall 12: Save/Load Breaking on Version Changes
**What goes wrong:** JSON format changes between versions. Old saved projects fail to load with cryptic errors. Users lose work.

**Why it happens:** No versioning in JSON schema. Refactored property names. Added required fields without defaults.

**Consequences:**
- Projects saved in v1.0 won't open in v1.1
- Users lose work or spend time manually fixing JSON
- Support burden increases

**Prevention:**
- Include version field in saved JSON: `{ version: "1.0.0", elements: [...] }`
- Write migrations for each version: v1.0 → v1.1 migration function
- Never remove fields, only add (or deprecate + migrate)
- Validate loaded JSON against schema, show actionable error if invalid

```typescript
interface ProjectV1 {
  version: "1.0.0";
  elements: ElementV1[];
}

interface ProjectV2 {
  version: "1.1.0";
  elements: ElementV2[];
  artboardSize: { width: number; height: number }; // new field
}

function loadProject(json: string): Project {
  const data = JSON.parse(json);
  if (data.version === "1.0.0") {
    return migrateV1toV2(data);
  }
  if (data.version === "1.1.0") {
    return data;
  }
  throw new Error(`Unsupported version: ${data.version}`);
}
```

**Detection:**
- Old projects fail to load after updates
- JSON.parse errors on load
- Runtime errors about missing properties

**Phase Impact:** Phase 6 (Save/Load). Add versioning from the start. First save format is version 1.0.0. Changing format later requires migration code.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Basic Canvas | Choosing pure Canvas vs SVG vs Hybrid | Start with SVG (simpler with React). Profile with 100+ elements. Only switch to hybrid if profiling shows bottleneck. |
| Phase 2: Zoom/Pan | Coordinate system confusion | Write coordinate transform utilities first. Test at 0.25x, 1x, 4x zoom before building features. |
| Phase 2: Undo/Redo | Snapshot-based undo architecture | Use command pattern or Immer patches. Never store full canvas snapshots. This is architectural - hard to change later. |
| Phase 3: Drag/Drop | Imperative DOM manipulation | Use @dnd-kit correctly. All state changes via Zustand. Test that undo/redo works after drag. |
| Phase 3: Selection | Re-rendering all elements on selection change | Use React.memo on element components. Only selected element re-renders. |
| Phase 4: Property Panel | Form performance with 20+ inputs | Use React Hook Form or uncontrolled inputs. Test typing lag with full property panel. |
| Phase 4: Real-time Preview | No debouncing on input changes | Add debounce (16-100ms) during Phase 4 implementation. Test slider drag performance. |
| Phase 5: Export | Template brittleness | Sanitize all inputs. Test export with invalid data (spaces in names, missing properties). |
| Phase 6: Save/Load | No JSON versioning | Add version field in first save format. Write migration path for any schema changes. |

---

## SVG-Specific Warnings (Applicable to This Project)

Since this project uses SVG (not Canvas), these pitfalls are especially relevant:

### Inline SVG Bloat
**Issue:** Every SVG element adds to page DOM, slowing style recalculation.
**Mitigation:** Consider rendering off-screen elements to separate SVG, or use `<image>` with data URLs for static elements.

### Filter Performance
**Issue:** SVG filters (blur, drop-shadow) are slow, especially on many elements.
**Mitigation:** Avoid filters during drag operations. Apply filters only to selected element, not all elements.

### Path Complexity
**Issue:** Complex paths with many points slow rendering.
**Mitigation:** For v1 with basic shapes (knobs, sliders), this won't be an issue. If custom paths are added later, simplify paths before rendering.

---

## Recommendations by Phase

### Phase 1-2 (Foundation)
**Priority 1 (Must Fix):**
- Coordinate system utilities with TypeScript types
- Command-based undo/redo (not snapshots)

**Priority 2 (Should Fix):**
- Zoom limits (0.1x - 10x)
- JSON versioning from first save

### Phase 3-4 (Interactions)
**Priority 1 (Must Fix):**
- Declarative drag/drop (using @dnd-kit)
- React.memo on element components

**Priority 2 (Should Fix):**
- Debouncing on property panel inputs
- React Hook Form for form performance

### Phase 5-6 (Output)
**Priority 1 (Must Fix):**
- Input sanitization in export templates
- JSON schema validation on load

**Priority 2 (Should Fix):**
- Keyboard shortcuts for common actions
- Focus indicators for accessibility

---

## Confidence Assessment

| Pitfall Category | Confidence | Basis |
|------------------|------------|-------|
| Undo/Redo Patterns | HIGH | Multiple technical sources, consistent recommendations |
| React Drag/Drop | HIGH | Authoritative article by Dan Abramov, @dnd-kit docs |
| SVG vs Canvas Performance | MEDIUM | Real-world case study (Felt), but specific thresholds vary by use case |
| Coordinate Transforms | HIGH | Common pattern, well-documented, verified across sources |
| Form Performance | HIGH | React Hook Form docs, multiple 2025 articles with benchmarks |
| Debouncing | HIGH | Standard technique, well-understood, verified across sources |
| JSON Cloning | HIGH | MDN docs on structuredClone, consistent recommendations |
| Export Templates | MEDIUM | General software engineering practice, less design-tool-specific data |
| Accessibility | HIGH | WCAG guidelines, 2025 standards, authoritative sources |
| Zoom Precision | MEDIUM | Common issue, but specific limits depend on implementation |

---

## What Wasn't Found (Research Gaps)

**LOW confidence areas needing validation:**
- Specific element count thresholds where SVG becomes problematic (sources say "100s" but no exact numbers)
- React 18 concurrent rendering impact on canvas editors (sources pre-date React 18 concurrent features)
- Zustand-specific performance patterns with large canvas state (Zustand docs don't cover canvas use cases specifically)

**Recommendations:**
- Profile performance with representative designs (50-100 elements) during Phase 1
- Test undo/redo with 100+ history entries during Phase 2
- Load test export with projects containing edge cases during Phase 5

---

## Sources

### High Confidence (Official Docs, Authoritative Technical Sources)
- [Development of undo and redo functionality with canvas - abidibo.net](https://www.abidibo.net/blog/2011/10/12/development-undo-and-redo-functionality-canvas/)
- [The Future of Drag and Drop APIs by Dan Abramov - Medium](https://medium.com/@dan_abramov/the-future-of-drag-and-drop-apis-249dfea7a15f)
- [From SVG to Canvas – part 1: making Felt faster](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster)
- [High Performance SVGs - CSS-Tricks](https://css-tricks.com/high-performance-svgs/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [Deep Cloning in JavaScript: The Modern Way - structuredClone](https://matiashernandez.dev/blog/post/deep-cloning-in-javascript-the-modern-way.-use-%60structuredclone%60)
- [Microsoft Learn: Code Generation and T4 Text Templates](https://learn.microsoft.com/en-us/visualstudio/modeling/code-generation-and-t4-text-templates?view=vs-2022)

### Medium Confidence (Multiple Community Sources, 2025-2026 Articles)
- [Solving React Form Performance - DEV Community](https://dev.to/opensite/solving-react-form-performance-why-your-forms-are-slow-and-how-to-fix-them-1g9i)
- [Best Practices for Handling Forms in React (2025 Edition) - Medium](https://medium.com/@farzanekazemi8517/best-practices-for-handling-forms-in-react-2025-edition-62572b14452f)
- [JavaScript Performance Optimization: Debounce vs Throttle - DEV](https://dev.to/nilebits/javascript-performance-optimization-debounce-vs-throttle-explained-5768)
- [Canvas vs SVG: Choosing the Right Tool - SitePoint](https://www.sitepoint.com/canvas-vs-svg/)
- [Panning and Zooming in HTML Canvas - Harrison Milbradt](https://harrisonmilbradt.com/blog/canvas-panning-and-zooming)

### Supporting Context
- [MDN: Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [Konva.js: Undo/Redo with React](https://konvajs.org/docs/react/Undo-Redo.html)
- [TetraLogical: Keyboard accessibility (2025)](https://tetralogical.com/blog/2025/05/09/foundations-keyboard-accessibility/)
