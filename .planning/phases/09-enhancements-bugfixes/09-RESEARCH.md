# Phase 9: Enhancements & Bug Fixes - Research

**Researched:** 2026-01-24
**Domain:** UI interaction refinement, font embedding, SVG manipulation, template import
**Confidence:** HIGH

## Summary

Phase 9 addresses critical bugs in the drag/selection system, adds element locking for non-destructive testing, implements font selection for labels, creates an SVG design mode for custom elements, and enables template import from existing JUCE WebView2 projects. This phase polishes the v1 milestone into a production-ready tool.

The research covers five distinct technical domains: (1) preventing event conflicts during drag operations with @dnd-kit, (2) real-time property updates using React refs for performance, (3) element locking patterns from established canvas editors, (4) web font embedding for offline VST3 use, and (5) SVG/HTML parsing for import features.

**Primary recommendation:** Use @dnd-kit's `isDragging` state to conditionally disable marquee selection, implement real-time updates with `useRef` during drag/resize then sync to Zustand on completion, follow Fabric.js locking patterns with granular `locked` property, embed fonts as base64 WOFF2 in CSS, and leverage DOMParser for HTML template import.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop with state tracking | Already in use, provides `isDragging` detection |
| React useRef | 18.3.1 | High-frequency updates without re-renders | Official React pattern for performance |
| Zustand | ^5.0.10 | State management | Already in use, excellent subscribe API |
| zundo | ^2.3.0 | Temporal middleware for undo/redo | Already in use, supports undo boundaries |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DOMParser | Native | Parse HTML strings to DOM | Template import (HTML parsing) |
| svg-parser | ^5.0.0 | Parse SVG to AST | SVG design mode layer extraction |
| google-webfonts-helper | N/A (tool) | Download WOFF2 + CSS snippets | Font embedding workflow |
| browser-fs-access | ^0.38.0 | File system access | Already in use for file import |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| svg-parser | canvg | canvg is heavier (renders to canvas), svg-parser gives AST for manipulation |
| google-webfonts-helper | Manual base64 encoding | Helper provides optimized CSS snippets and format selection |
| DOMParser | Third-party HTML parser | DOMParser is native, zero dependencies, widely supported |

**Installation:**
```bash
npm install svg-parser
# google-webfonts-helper is a web tool, not an npm package
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Canvas/
│   │   ├── hooks/
│   │   │   ├── useMarquee.ts          # Add isDragging check
│   │   │   ├── useResize.ts           # Add real-time updates
│   │   │   └── useDragTracking.ts     # NEW: Track drag state globally
│   ├── Properties/
│   │   ├── FontSelector.tsx           # NEW: Font dropdown
│   │   └── LockControls.tsx           # NEW: Lock toggles
│   ├── DesignMode/
│   │   ├── SVGLayerEditor.tsx         # NEW: SVG dissection UI
│   │   └── LayerAssignment.tsx        # NEW: Map layers to element parts
│   └── Import/
│       ├── TemplateImporter.tsx       # NEW: Import dialog
│       └── HTMLParser.ts              # NEW: Parse JUCE templates
├── services/
│   ├── export/
│   │   ├── documentationGenerator.ts  # NEW: Generate README/comments
│   │   └── knownIssues.ts             # NEW: JUCE WebView2 workarounds
│   └── fonts/
│       ├── fontEmbedder.ts            # NEW: Base64 font embedding
│       └── fontRegistry.ts            # NEW: Available fonts list
└── assets/
    └── fonts/                         # NEW: Embedded WOFF2 files
```

### Pattern 1: Prevent Marquee During Element Drag
**What:** Disable marquee selection when any element is being dragged via @dnd-kit
**When to use:** Fix BUG-01 (selection rectangle appears during element drag)
**Example:**
```typescript
// Source: @dnd-kit official docs + existing useMarquee hook
import { useDndContext } from '@dnd-kit/core'

export function useMarquee(canvasRef: RefObject<HTMLDivElement>) {
  const { active } = useDndContext() // Global drag state
  const isDraggingElement = active?.data.current?.sourceType === 'element'

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start marquee if an element is being dragged
      if (e.button !== 0 || isPanning || isDraggingElement) return

      // ... existing marquee logic
    },
    [isPanning, isDraggingElement]
  )

  // ... rest of hook
}
```

### Pattern 2: Real-Time Property Updates During Drag/Resize
**What:** Use `useRef` for high-frequency updates during drag, sync to Zustand on completion
**When to use:** Fix IMP-01 (position/size values update in real-time)
**Example:**
```typescript
// Source: React official docs + performance best practices
export function useResize(): UseResizeReturn {
  const [isResizing, setIsResizing] = useState(false)
  const liveUpdatesRef = useRef<Map<string, Partial<ElementConfig>>>(new Map())

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      // Store updates in ref (no re-render)
      const updates = calculateUpdates(e)
      liveUpdatesRef.current.set(elementId, updates)

      // Trigger property panel update via subscription
      notifyPropertyPanel(elementId, updates)
    }

    const handleMouseUp = () => {
      // Sync ref values to Zustand (triggers re-render once)
      const finalUpdates = liveUpdatesRef.current.get(elementId)
      if (finalUpdates) {
        updateElement(elementId, finalUpdates)
      }
      liveUpdatesRef.current.clear()
      setIsResizing(false)
    }

    // ... event listeners
  }, [isResizing])
}
```

### Pattern 3: Element Locking
**What:** Granular locking per element (prevent selection/movement) plus global "lock all" mode
**When to use:** Implement IMP-02 and IMP-03 (individual and global locking)
**Example:**
```typescript
// Source: Fabric.js locking patterns + existing element.locked property
// elements.ts - already has `locked: boolean`

// BaseElement.tsx - already disables drag when locked
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: `element-${element.id}`,
  disabled: !isSelected || element.locked, // ✅ Already implemented
})

// NEW: Global lock mode in canvasSlice.ts
export interface CanvasSlice {
  lockAllMode: boolean // NEW
  toggleLockAllMode: () => void
}

// NEW: Modify Element.tsx click handler
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation()

  // Prevent selection in lock-all mode
  if (lockAllMode) return

  // ... existing selection logic
}
```

### Pattern 4: Font Embedding for Offline Use
**What:** Embed WOFF2 fonts as base64 data URLs in CSS for VST3 export
**When to use:** Implement FEAT-01 (multiple font options for labels)
**Example:**
```typescript
// Source: Web font embedding best practices + google-webfonts-helper
// fontEmbedder.ts
export async function embedFont(fontName: string): Promise<string> {
  // Load WOFF2 file from assets/fonts/
  const fontBuffer = await fetch(`/fonts/${fontName}.woff2`).then(r => r.arrayBuffer())
  const base64 = bufferToBase64(fontBuffer)

  // Generate @font-face CSS
  return `@font-face {
  font-family: '${fontName}';
  src: url(data:font/woff2;base64,${base64}) format('woff2');
  font-weight: normal;
  font-style: normal;
}`
}

// In cssGenerator.ts, prepend embedded fonts
export function generateCSS(elements, fonts): string {
  const embeddedFonts = fonts.map(embedFont).join('\n\n')
  return `${embeddedFonts}\n\n/* Element styles */\n${generateElementStyles(elements)}`
}
```

### Pattern 5: SVG Layer Extraction for Design Mode
**What:** Parse SVG using svg-parser, extract groups/layers, let user assign to element parts
**When to use:** Implement FEAT-02 (SVG design mode)
**Example:**
```typescript
// Source: svg-parser npm package + existing svgImport.ts patterns
import { parse } from 'svg-parser'

export function extractSVGLayers(svgContent: string): SVGLayer[] {
  const ast = parse(svgContent)
  const layers: SVGLayer[] = []

  // Traverse AST to find groups with IDs
  function traverse(node: any, depth = 0) {
    if (node.tagName === 'g' && node.properties?.id) {
      layers.push({
        id: node.properties.id,
        name: node.properties.id,
        content: nodeToString(node), // Serialize back to SVG
        type: inferLayerType(node.properties.id) // 'indicator' | 'track' | 'thumb' | etc
      })
    }

    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1))
    }
  }

  traverse(ast)
  return layers
}
```

### Pattern 6: HTML Template Import
**What:** Parse existing JUCE WebView2 HTML/CSS/JS using DOMParser and extract element configs
**When to use:** Implement FEAT-03 (import from existing projects)
**Example:**
```typescript
// Source: DOMParser MDN docs
export function parseJUCETemplate(html: string, css: string, js: string): ElementConfig[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract elements from #plugin-container
  const container = doc.getElementById('plugin-container')
  if (!container) throw new Error('No #plugin-container found')

  const elements: ElementConfig[] = []

  // Find all elements with data-element-type attribute
  container.querySelectorAll('[data-element-type]').forEach(el => {
    const type = el.getAttribute('data-element-type')
    const id = el.getAttribute('data-element-id') || crypto.randomUUID()

    // Parse CSS for position/size
    const computedStyle = extractStyleFromCSS(css, `#${el.id}`)

    // Create element config
    elements.push({
      id,
      type: type as ElementConfig['type'],
      // ... parse other properties from HTML/CSS
    })
  })

  return elements
}
```

### Anti-Patterns to Avoid
- **Updating Zustand state on every mousemove during drag:** Causes severe performance issues, use `useRef` instead
- **Using `useState` for drag tracking:** Triggers re-renders on every pixel movement, laggy UX
- **Embedding fonts as TTF/OTF:** WOFF2 is 30% smaller and standard for web, use it exclusively
- **Parsing SVG with regex:** SVG is XML, use proper parser (svg-parser) to handle edge cases
- **Allowing marquee when `isDragging` is true:** Conflicts with element drag, check `useDndContext().active`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detect global drag state | Custom event system | `useDndContext()` from @dnd-kit | Already provides `active` with drag metadata |
| Parse SVG layer structure | String manipulation + regex | svg-parser npm package | Handles nested groups, attributes, edge cases |
| Download Google Fonts | Scrape Google APIs | google-webfonts-helper tool | Pre-optimized WOFF2 + CSS snippets |
| Parse HTML from string | innerHTML + manual traversal | DOMParser native API | Secure, standards-compliant, works like real DOM |
| Base64 encode fonts | Custom Buffer logic | Built-in `btoa()` or Node Buffer | Browser/Node have optimized encoders |
| Track element lock state | New state slice | Existing `element.locked` property | Already in BaseElementConfig, just wire UI |

**Key insight:** This phase mostly wires existing primitives together rather than building new systems. The codebase already has locking support (`element.locked`), drag detection (`@dnd-kit`), and undo middleware (`zundo`). Focus on integration, not reinvention.

## Common Pitfalls

### Pitfall 1: Marquee Activates During Element Drag
**What goes wrong:** User drags element, marquee rectangle appears and steals selection
**Why it happens:** `useMarquee` only checks `isPanning` flag, not `isDragging` from @dnd-kit
**How to avoid:** Import `useDndContext()` and check `active?.data.current?.sourceType === 'element'`
**Warning signs:** Selection flickers during drag, multiple selection boxes visible

### Pitfall 2: Property Panel Lags During Drag/Resize
**What goes wrong:** Position/size inputs freeze or stutter while dragging element
**Why it happens:** Updating Zustand on every mousemove triggers re-renders across the app
**How to avoid:** Use `useRef` to track live values, use Zustand's `subscribe()` to push updates to property panel, only commit to store on mouseup
**Warning signs:** FPS drops during drag, React DevTools shows constant re-renders

### Pitfall 3: Font Files Too Large for Export
**What goes wrong:** Exported CSS file is 500KB+ due to embedded fonts
**Why it happens:** Embedding TTF/OTF instead of WOFF2, or embedding multiple weights/variants
**How to avoid:** Only embed WOFF2 format (30% smaller), only include used font weights
**Warning signs:** Export takes >1s, CSS file larger than HTML+JS combined

### Pitfall 4: SVG Layers Not Detected
**What goes wrong:** SVG import shows "No layers found" despite visible groups in Figma/Illustrator
**Why it happens:** Export uses `<path>` elements directly without wrapping in `<g id="...">` groups
**How to avoid:** Document requirement: "SVG must use named groups (`<g id='indicator'>`) for layer detection"
**Warning signs:** Valid SVG imports but shows 0 layers, flat path structure in parser output

### Pitfall 5: Template Import Creates Duplicate IDs
**What goes wrong:** Imported template elements have same IDs as existing canvas elements
**Why it happens:** Using HTML element IDs directly instead of generating new UUIDs
**How to avoid:** Always call `crypto.randomUUID()` for imported elements, never trust source IDs
**Warning signs:** Elements disappear after import, selection breaks, console errors about duplicate keys

### Pitfall 6: Lock Mode Breaks Undo/Redo
**What goes wrong:** Toggling lock mode adds entries to undo history, clutters timeline
**Why it happens:** `lockAllMode` is included in `zundo` temporal state
**How to avoid:** Add `lockAllMode` to `partialize` exclusion list (like `isPanning`, `scale`)
**Warning signs:** Undo/redo steps through lock toggles instead of element changes

### Pitfall 7: Real-Time Updates Lost on Rapid Drag
**What goes wrong:** Property panel shows stale values after fast drag operations
**Why it happens:** Race condition between `useRef` updates and Zustand subscription timing
**How to avoid:** Use `subscribeWithSelector` middleware, ensure final mouseup always commits ref to store
**Warning signs:** Values "snap back" after drag ends, inconsistent state between canvas and panel

## Code Examples

Verified patterns from official sources:

### Prevent Marquee During Element Drag
```typescript
// Source: @dnd-kit official docs - useDndContext hook
import { useDndContext } from '@dnd-kit/core'

export function useMarquee(canvasRef: RefObject<HTMLDivElement>) {
  const { active } = useDndContext() // Get global drag state
  const [marquee, setMarquee] = useState<MarqueeState | null>(null)

  // Check if an element (not palette item) is being dragged
  const isDraggingElement = active?.data.current?.sourceType === 'element'

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start marquee selection during element drag
      if (e.button !== 0 || isPanning || isDraggingElement) return

      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setMarquee({
        isActive: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      })
    },
    [screenToCanvas, isPanning, isDraggingElement] // Add to deps
  )

  // ... rest of hook unchanged
}
```

### Real-Time Property Updates with useRef
```typescript
// Source: React official docs - useRef for high-frequency updates
export function PropertyPanel() {
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const [liveValues, setLiveValues] = useState<Partial<ElementConfig>>({})

  // Subscribe to live updates from drag/resize operations
  useEffect(() => {
    const unsubscribe = subscribeToDragUpdates((elementId, updates) => {
      if (selectedIds.includes(elementId)) {
        setLiveValues(updates) // Update inputs in real-time
      }
    })
    return unsubscribe
  }, [selectedIds])

  const element = getElement(selectedIds[0]!)
  const displayValues = { ...element, ...liveValues } // Merge live + store

  return (
    <PropertySection title="Position & Size">
      <NumberInput label="X" value={displayValues.x} readOnly />
      <NumberInput label="Y" value={displayValues.y} readOnly />
    </PropertySection>
  )
}
```

### Element Locking UI
```typescript
// Source: Fabric.js locking patterns + Canva lock feature
export function PropertyPanel() {
  const element = getElement(selectedIds[0]!)
  const updateElement = useStore((state) => state.updateElement)
  const lockAllMode = useStore((state) => state.lockAllMode)
  const toggleLockAllMode = useStore((state) => state.toggleLockAllMode)

  return (
    <>
      {/* Individual lock toggle */}
      <PropertySection title="Lock">
        <label>
          <input
            type="checkbox"
            checked={element.locked}
            onChange={(e) => updateElement(element.id, { locked: e.target.checked })}
          />
          Lock element (prevent selection/movement)
        </label>
      </PropertySection>

      {/* Global lock mode (in toolbar, not properties) */}
      <button onClick={toggleLockAllMode} className={lockAllMode ? 'active' : ''}>
        {lockAllMode ? '🔒 Locked' : '🔓 Unlocked'}
      </button>
    </>
  )
}
```

### Embed Fonts as Base64 WOFF2
```typescript
// Source: google-webfonts-helper workflow + base64 embedding best practices
export async function embedFontAsBase64(fontPath: string): Promise<string> {
  // Load WOFF2 file (pre-downloaded from google-webfonts-helper)
  const response = await fetch(fontPath)
  const buffer = await response.arrayBuffer()

  // Convert to base64
  const bytes = new Uint8Array(buffer)
  const binary = String.fromCharCode(...bytes)
  const base64 = btoa(binary)

  return base64
}

// Generate @font-face rule
export function generateFontFace(fontFamily: string, base64: string): string {
  return `@font-face {
  font-family: '${fontFamily}';
  src: url(data:font/woff2;base64,${base64}) format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`
}

// Usage in CSS generator
const fonts = ['Inter', 'Roboto Mono']
const fontFaces = await Promise.all(
  fonts.map(async (font) => {
    const base64 = await embedFontAsBase64(`/fonts/${font}.woff2`)
    return generateFontFace(font, base64)
  })
)
const css = `${fontFaces.join('\n\n')}\n\n/* Element styles */\n...`
```

### Parse SVG Layers
```typescript
// Source: svg-parser npm package documentation
import { parse } from 'svg-parser'

interface SVGLayer {
  id: string
  name: string
  svgContent: string
  suggestedType: 'indicator' | 'track' | 'thumb' | 'fill' | 'glow' | 'unknown'
}

export function extractSVGLayers(svgContent: string): SVGLayer[] {
  const ast = parse(svgContent)
  const layers: SVGLayer[] = []

  function traverse(node: any) {
    // Look for <g> elements with IDs (layer groups)
    if (node.tagName === 'g' && node.properties?.id) {
      const layerId = node.properties.id
      const layerName = node.properties['inkscape:label'] || layerId

      // Suggest type based on ID naming conventions
      const suggestedType = inferTypeFromName(layerId)

      layers.push({
        id: layerId,
        name: layerName,
        svgContent: serializeNode(node),
        suggestedType
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(ast)
  return layers
}

function inferTypeFromName(name: string): SVGLayer['suggestedType'] {
  const lower = name.toLowerCase()
  if (lower.includes('indicator') || lower.includes('pointer')) return 'indicator'
  if (lower.includes('track') || lower.includes('background')) return 'track'
  if (lower.includes('thumb') || lower.includes('handle')) return 'thumb'
  if (lower.includes('fill') || lower.includes('progress')) return 'fill'
  if (lower.includes('glow') || lower.includes('highlight')) return 'glow'
  return 'unknown'
}
```

### Import JUCE Template
```typescript
// Source: DOMParser MDN documentation
export async function importJUCETemplate(
  htmlFile: File,
  cssFile: File,
  jsFile: File
): Promise<ElementConfig[]> {
  const html = await htmlFile.text()
  const css = await cssFile.text()

  // Parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const container = doc.getElementById('plugin-container')
  if (!container) {
    throw new Error('Invalid JUCE template: missing #plugin-container')
  }

  const elements: ElementConfig[] = []

  // Extract knobs
  container.querySelectorAll('.knob').forEach((el) => {
    const id = crypto.randomUUID() // Always generate new ID
    const style = extractStyleFromCSS(css, `#${el.id}`)

    elements.push(createKnob({
      name: el.id,
      x: parseFloat(style.left) || 0,
      y: parseFloat(style.top) || 0,
      diameter: parseFloat(style.width) || 60,
      // ... parse other properties
    }))
  })

  // Extract sliders, buttons, labels...

  return elements
}

function extractStyleFromCSS(css: string, selector: string): CSSStyleDeclaration {
  // Create temporary style element
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  // Create dummy element to get computed styles
  const dummy = document.createElement('div')
  dummy.className = selector.replace(/[#.]/g, '')
  document.body.appendChild(dummy)

  const computed = window.getComputedStyle(dummy)

  // Cleanup
  document.head.removeChild(style)
  document.body.removeChild(dummy)

  return computed
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Updating state on mousemove | useRef during drag, sync on mouseup | React 16.8+ (hooks) | 10-60x performance improvement |
| TTF/OTF font files | WOFF2 format | ~2018 (browser support) | 30% smaller file size |
| Custom SVG parsers | AST-based parsers (svg-parser) | 2020+ | Handles nested groups, attributes |
| innerHTML for HTML parsing | DOMParser API | Always available | Security (no XSS), proper DOM |
| Google Fonts CDN | Self-hosted WOFF2 | GDPR concerns 2022+ | Privacy compliance, offline use |

**Deprecated/outdated:**
- **Font Squirrel @font-face generator:** Still works but google-webfonts-helper is faster and includes only WOFF2
- **react-dnd:** Replaced by @dnd-kit in this project, different API patterns
- **Synchronous drag updates:** Modern pattern uses async refs to avoid blocking main thread

## Open Questions

Things that couldn't be fully resolved:

1. **How much should SVG Design Mode allow editing vs just assignment?**
   - What we know: svg-parser can extract layers, we can store SVG per layer
   - What's unclear: Should users be able to edit SVG paths in-app, or just assign layers?
   - Recommendation: V1 should only assign layers (low complexity), defer path editing to Phase 10+

2. **Should template import support non-JUCE HTML, or only JUCE-exported templates?**
   - What we know: DOMParser can parse any HTML
   - What's unclear: Generic HTML won't have predictable structure for element detection
   - Recommendation: V1 only supports "round-trip" import (templates exported from this tool), document assumption

3. **How many fonts to include by default?**
   - What we know: Each WOFF2 font adds ~20-50KB to export
   - What's unclear: Balance between choice and bundle size
   - Recommendation: Include 3-5 common fonts (Inter, Roboto, Roboto Mono, plus 2 display fonts), document how users can add more

4. **Should lock-all mode persist in project file?**
   - What we know: It's UI state, not project data
   - What's unclear: Users might expect it to save
   - Recommendation: Don't persist (like zoom level, pan position), add to `partialize` exclusions

5. **Real-time updates: Should property panel inputs be editable during drag?**
   - What we know: Inputs are read-only during drag in most design tools
   - What's unclear: Would editing mid-drag be useful or confusing?
   - Recommendation: Make inputs read-only during drag (show values only), allow editing when drag ends

## Sources

### Primary (HIGH confidence)
- [@dnd-kit official docs - useDndContext](https://docs.dndkit.com/api-documentation/draggable/usedraggable) - Drag state detection
- [React official docs - useRef](https://react.dev/reference/react/useRef) - High-frequency update patterns
- [MDN - DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) - HTML parsing API
- [Zustand docs - subscribeWithSelector](https://zustand.docs.pmnd.rs/middlewares/subscribe-with-selector) - State subscription patterns
- Existing codebase: `src/store/index.ts`, `src/types/elements.ts` (locked property already defined)

### Secondary (MEDIUM confidence)
- [google-webfonts-helper tool](https://gwfh.mranftl.com/) - WOFF2 download + CSS generation
- [svg-parser npm package](https://www.npmjs.com/package/svg-parser) - SVG AST parsing
- [JUCE 8 WebView2 feature overview](https://juce.com/blog/juce-8-feature-overview-webview-uis/) - Integration best practices
- [Fabric.js locking patterns](https://github.com/fabricjs/fabric.js/issues/6185) - Canvas editor locking implementation
- [Canva lock feature](https://www.canva.com/help/lock-and-unlock-elements/) - UX patterns for element locking

### Tertiary (LOW confidence)
- WebSearch results on React drag performance (general patterns, not library-specific)
- Community discussions on base64 font embedding (practices vary by use case)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use except svg-parser (widely adopted)
- Architecture: HIGH - Patterns verified with official docs and existing codebase
- Pitfalls: HIGH - Based on known @dnd-kit issues, React performance patterns, real bugs to fix

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain, no fast-moving dependencies)

**Notes:**
- Phase 9 is integration-heavy, not exploratory. Most primitives exist (locking property, @dnd-kit, zundo).
- SVG parser and font embedder are new additions but well-established patterns.
- Template import is most uncertain feature (depends on user workflow assumptions).
