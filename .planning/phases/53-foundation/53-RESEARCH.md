# Phase 53: Foundation - Research

**Researched:** 2026-02-04
**Domain:** TypeScript type system, Zustand state management, Zod schema versioning, SVG layer detection
**Confidence:** HIGH

## Summary

This phase extends the proven KnobStyle system to support all visual control categories (rotary, linear, arc, button, meter). The research confirms that the existing architecture patterns are well-suited for this expansion: TypeScript discriminated unions with category discriminant, Zustand slice pattern with CRUD operations, and Zod schema versioning with backward-compatible migration.

The codebase already has strong foundations in place:
- KnobStylesSlice demonstrates the exact pattern needed for elementStylesSlice
- Layer detection service (svgLayerDetection.ts) provides generalized detection infrastructure
- Project serialization (v2.0.0) has established migration patterns
- LAYER_CONVENTIONS in svgElementExport.ts already defines layer schemas for all categories

The primary architectural decision (category-based with 5 categories vs. per-element with 19 types) is correct: it reduces code duplication, simplifies maintenance, and matches how users think about styling controls. The additive migration strategy (keep knobStyles, add elementStyles) ensures zero breaking changes.

**Primary recommendation:** Follow the KnobStylesSlice pattern exactly, generalize detectKnobLayers to detectElementLayers with category parameter, and use Zod discriminated unions for schema v3.0.0 with automatic migration from v2.0.0.

## Standard Stack

The established libraries/tools are already in use:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0.10 | State management | Minimal, TypeScript-first, slice pattern |
| Zod | 4.3.6 | Schema validation | Runtime type safety, migration support |
| TypeScript | ~5.6.2 | Type system | Discriminated unions, exhaustiveness checking |
| zundo | 2.3.0 | Undo/redo middleware | Temporal store wrapper for Zustand |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod-error | 2.0.0 | Error messages | User-friendly validation errors |
| DOMParser | Browser API | SVG parsing | Layer detection from SVG content |
| XMLSerializer | Browser API | SVG serialization | Layer extraction to new SVG |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand slices | Redux Toolkit | RTK requires more boilerplate, slices already working |
| Zod v4 | Zod v3 | v4 is stable, already in use, better DX |
| Discriminated unions | Optional properties | Unions eliminate nullability, better type narrowing |

**Installation:**
No new dependencies required. All libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   ├── elementStyle.ts        # NEW: ElementStyle type with category discriminant
│   └── layerSchemas.ts        # NEW: Layer schemas per category
├── store/
│   └── elementStylesSlice.ts  # NEW: CRUD operations, selectors
├── services/
│   └── elementLayers.ts       # NEW: Generalized layer detection
├── schemas/
│   └── project.ts             # UPDATE: Add v3.0.0 schema with migration
```

### Pattern 1: Category-Based Discriminated Union
**What:** ElementStyle type uses category as discriminant property
**When to use:** Any type that varies behavior by category
**Example:**
```typescript
// Source: Codebase analysis + TypeScript Handbook
export type ElementCategory = 'rotary' | 'linear' | 'arc' | 'button' | 'meter'

export type ElementStyle =
  | { category: 'rotary'; id: string; name: string; svgContent: string; layers: RotaryLayers; minAngle: number; maxAngle: number; createdAt: number }
  | { category: 'linear'; id: string; name: string; svgContent: string; layers: LinearLayers; createdAt: number }
  | { category: 'arc'; id: string; name: string; svgContent: string; layers: ArcLayers; minAngle: number; maxAngle: number; arcRadius: number; createdAt: number }
  | { category: 'button'; id: string; name: string; svgContent: string; layers: ButtonLayers; createdAt: number }
  | { category: 'meter'; id: string; name: string; svgContent: string; layers: MeterLayers; createdAt: number }

// TypeScript narrows type based on category check
function renderStyle(style: ElementStyle) {
  switch (style.category) {
    case 'rotary':
      // style.layers is RotaryLayers here (type narrowed)
      return renderRotary(style.layers.indicator, style.minAngle, style.maxAngle)
    case 'linear':
      // style.layers is LinearLayers here
      return renderLinear(style.layers.thumb, style.layers.track)
    // ... exhaustiveness checking ensures all cases handled
  }
}
```

### Pattern 2: Zustand Slice with CRUD Operations
**What:** StateCreator pattern for modular store slices
**When to use:** Adding new domain to Zustand store
**Example:**
```typescript
// Source: src/store/knobStylesSlice.ts (existing pattern)
export interface ElementStylesSlice {
  // State
  elementStyles: ElementStyle[]

  // CRUD Actions
  addElementStyle: (style: Omit<ElementStyle, 'id' | 'createdAt'>) => void
  removeElementStyle: (id: string) => void
  updateElementStyle: (id: string, updates: Partial<ElementStyle>) => void
  setElementStyles: (styles: ElementStyle[]) => void  // For project load

  // Selectors (computed in slice for memoization)
  getElementStyle: (id: string) => ElementStyle | undefined
  getStylesByCategory: (category: ElementCategory) => ElementStyle[]
}

export const createElementStylesSlice: StateCreator<ElementStylesSlice, [], [], ElementStylesSlice> = (set, get) => ({
  elementStyles: [],

  addElementStyle: (styleData) => set((state) => ({
    elementStyles: [...state.elementStyles, {
      ...styleData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }],
  })),

  removeElementStyle: (id) => set((state) => ({
    elementStyles: state.elementStyles.filter(s => s.id !== id),
  })),

  updateElementStyle: (id, updates) => set((state) => ({
    elementStyles: state.elementStyles.map(s => s.id === id ? { ...s, ...updates } : s),
  })),

  setElementStyles: (styles) => set(() => ({ elementStyles: styles })),

  getElementStyle: (id) => get().elementStyles.find(s => s.id === id),

  getStylesByCategory: (category) => get().elementStyles.filter(s => s.category === category),
})
```

### Pattern 3: Generalized Layer Detection
**What:** detectElementLayers() service with category parameter
**When to use:** Importing SVG for any category
**Example:**
```typescript
// Source: src/services/knobLayers.ts (generalize this pattern)
export interface DetectedLayers {
  [layerRole: string]: string[]  // e.g., { indicator: ['knob-indicator', 'needle'], thumb: ['slider-thumb'] }
}

export function detectElementLayers(svgContent: string, category: ElementCategory): DetectedLayers {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  const conventions = LAYER_CONVENTIONS_BY_CATEGORY[category]
  const detected: DetectedLayers = {}

  // Initialize empty arrays for each expected layer role
  Object.keys(conventions).forEach(role => {
    detected[role] = []
  })

  // Scan SVG for matching layers
  const allElements = doc.querySelectorAll('*')
  allElements.forEach(el => {
    const id = el.getAttribute('id') || ''
    const classList = el.getAttribute('class')?.split(/\s+/) || []
    const searchText = [id, ...classList].join(' ').toLowerCase()

    // Match against conventions for this category
    Object.entries(conventions).forEach(([role, patterns]) => {
      const regex = new RegExp(patterns.join('|'), 'i')
      if (regex.test(searchText)) {
        detected[role].push(id || classList[0])
      }
    })
  })

  return detected
}
```

### Pattern 4: Zod Schema Versioning with Migration
**What:** Version discriminant with automatic migration function
**When to use:** Adding fields to project schema
**Example:**
```typescript
// Source: src/schemas/project.ts + Zod v4 versioning patterns

// v3.0.0 schema
export const ProjectSchemaV3 = z.object({
  version: z.literal('3.0.0'),
  windows: z.array(WindowSchema),
  elements: z.array(ElementSchema),
  knobStyles: z.array(KnobStyleSchema),  // Keep for backward compat
  elementStyles: z.array(ElementStyleSchema),  // NEW
  // ... other fields
})

// Migration function (called in deserializeProject)
function migrateProjectV2toV3(data: ProjectDataV2): ProjectDataV3 {
  return {
    ...data,
    version: '3.0.0',
    elementStyles: [
      // Auto-migrate knobStyles to elementStyles
      ...data.knobStyles.map(ks => ({
        category: 'rotary' as const,
        id: ks.id,
        name: ks.name,
        svgContent: ks.svgContent,
        layers: {
          indicator: ks.layers.indicator,
          track: ks.layers.track,
          arc: ks.layers.arc,
          glow: ks.layers.glow,
          shadow: ks.layers.shadow,
        },
        minAngle: ks.minAngle,
        maxAngle: ks.maxAngle,
        createdAt: ks.createdAt,
      }))
    ],
    // Keep knobStyles for backward compat (don't delete)
    knobStyles: data.knobStyles,
  }
}
```

### Anti-Patterns to Avoid
- **Per-element type schemas:** 19 element types would require 19 sets of layer definitions. Category-based (5 categories) is DRY and maintainable.
- **Breaking migration:** Deleting knobStyles would break old projects. Additive migration keeps backward compatibility.
- **Optional properties instead of discriminated unions:** Makes type narrowing weak. Category discriminant gives strong typing.
- **Global layer detection:** Layer detection must be category-aware. Generic "find all layers" won't work for validation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG parsing | String regex | DOMParser API | Handles malformed SVG, namespace-aware |
| CSS selector escaping | Manual replace | CSS.escape() with polyfill | Handles all edge cases (brackets, quotes, special chars) |
| Layer extraction | Clone + filter | XMLSerializer + new SVG wrapper | Preserves viewBox, coordinate system |
| Schema migration | Manual object spread | Zod transform + discriminated union | Type-safe, validates output |
| Selector memoization | useMemo in components | Computed getters in slice | Single source of truth, no stale closures |
| UUID generation | Date.now() + random | crypto.randomUUID() | Collision-resistant, standards-based |

**Key insight:** The codebase already solved these problems for KnobStyle. Reuse the patterns, don't reinvent. The existing services (knobLayers.ts, svgLayerDetection.ts) are production-tested and handle edge cases.

## Common Pitfalls

### Pitfall 1: TypeScript Discriminated Union Type Narrowing
**What goes wrong:** TypeScript doesn't narrow type when using if/else with loose equality
**Why it happens:** Type guard requires strict literal check or switch statement
**How to avoid:** Always use switch statement with category discriminant, or use strict === with literals
**Warning signs:** TypeScript errors "Property 'X' does not exist on type 'Y'" inside conditional blocks

Example:
```typescript
// BAD: TypeScript doesn't narrow
if (style.category == 'rotary') {  // loose equality
  style.layers.indicator  // ERROR: Property 'indicator' does not exist
}

// GOOD: TypeScript narrows
switch (style.category) {
  case 'rotary':
    style.layers.indicator  // OK: Type narrowed to RotaryLayers
    break
}
```

### Pitfall 2: Zustand Slice Type Inference
**What goes wrong:** Slice actions can't access other slices without explicit typing
**Why it happens:** StateCreator generic parameters must include combined store type
**How to avoid:** Use `StateCreator<SliceName, [], [], SliceName>` pattern, NOT `StateCreator<Store, [], [], SliceName>`
**Warning signs:** TypeScript errors when trying to get() values from other slices

Example:
```typescript
// BAD: Can't access other slices
const createSlice: StateCreator<Store, [], [], MySlice> = (set, get) => ({
  myAction: () => {
    const otherData = get().otherSlice  // Type errors
  }
})

// GOOD: Self-contained slice
const createSlice: StateCreator<MySlice, [], [], MySlice> = (set, get) => ({
  myAction: () => {
    const myData = get().myData  // OK: Only accesses own slice
  }
})
```

### Pitfall 3: Zod Schema .passthrough() in Production
**What goes wrong:** Unknown properties silently pass validation, causing confusion
**Why it happens:** .passthrough() allows extra fields (used during migration periods)
**How to avoid:** Use .strict() for new schemas, only .passthrough() during active migration window
**Warning signs:** Project files have unexpected properties that aren't documented

Example:
```typescript
// BAD: Unknown fields silently accepted
const Schema = z.object({ name: z.string() }).passthrough()
// Input: { name: 'test', unknownField: 123 }
// Output: { name: 'test', unknownField: 123 }  // No error!

// GOOD: Strict validation
const Schema = z.object({ name: z.string() }).strict()
// Input: { name: 'test', unknownField: 123 }
// Error: "Unrecognized key(s) in object: 'unknownField'"
```

### Pitfall 4: Layer Detection Naming Convention Conflicts
**What goes wrong:** Multiple layers match same convention (e.g., "button-body" and "body")
**Why it happens:** Detection uses pattern matching, not exact match
**How to avoid:** Prioritize prefixed matches (button-body) over generic (body), detect conflicts and warn user
**Warning signs:** Layer mapping dialog shows wrong layer selected by default

Example:
```typescript
// BAD: Greedy matching
if (layerName.includes('body')) {
  detected.body.push(layerName)  // Matches "button-body", "body", "main-body"
}

// GOOD: Prioritize specificity
if (layerName === `${category}-body`) {
  detected.body.push(layerName)  // Exact match first
} else if (layerName === 'body') {
  detected.body.push(layerName)  // Generic fallback
}
```

### Pitfall 5: SVG Layer Extraction Loses ViewBox
**What goes wrong:** Extracted layer renders at wrong scale/position
**Why it happens:** New SVG wrapper doesn't copy viewBox from original
**How to avoid:** Always copy viewBox, width, height attributes to new SVG wrapper
**Warning signs:** Extracted layers appear tiny or offset in preview

Example:
```typescript
// BAD: Missing viewBox
const newSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
newSvg.appendChild(clonedLayer)

// GOOD: Preserve coordinate system
const originalSvg = doc.querySelector('svg')
const viewBox = originalSvg?.getAttribute('viewBox') || '0 0 100 100'
const newSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
newSvg.setAttribute('viewBox', viewBox)
newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
newSvg.appendChild(clonedLayer)
```

## Code Examples

Verified patterns from existing codebase:

### CRUD Operations in Zustand Slice
```typescript
// Source: src/store/knobStylesSlice.ts (production code)
export const createElementStylesSlice: StateCreator<ElementStylesSlice, [], [], ElementStylesSlice> = (
  set,
  get
) => ({
  elementStyles: [],

  addElementStyle: (styleData) =>
    set((state) => ({
      elementStyles: [
        ...state.elementStyles,
        {
          ...styleData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
      ],
    })),

  removeElementStyle: (id) =>
    set((state) => ({
      elementStyles: state.elementStyles.filter((style) => style.id !== id),
    })),

  updateElementStyle: (id, updates) =>
    set((state) => ({
      elementStyles: state.elementStyles.map((style) =>
        style.id === id ? { ...style, ...updates } : style
      ),
    })),

  setElementStyles: (styles) =>
    set(() => ({
      elementStyles: styles,
    })),

  getElementStyle: (id) => {
    return get().elementStyles.find((style) => style.id === id)
  },

  getStylesByCategory: (category) => {
    return get().elementStyles.filter((style) => style.category === category)
  },
})
```

### Layer Detection with Category
```typescript
// Source: src/services/knobLayers.ts (generalize this pattern)
export interface DetectedLayers {
  [layerRole: string]: string[]
}

export function detectElementLayers(svgContent: string, category: ElementCategory): DetectedLayers {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid SVG file')
  }

  const conventions = getLayerConventionsForCategory(category)
  const detected: DetectedLayers = {}

  // Initialize empty arrays
  Object.keys(conventions).forEach(role => {
    detected[role] = []
  })

  const allElements = doc.querySelectorAll('*')
  allElements.forEach((el) => {
    const tagName = el.tagName.toLowerCase()
    if (['svg', 'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'pattern', 'filter'].includes(tagName)) {
      return
    }

    const id = el.getAttribute('id') || ''
    const classList = el.getAttribute('class')?.split(/\s+/) || []
    const identifier = id || classList[0]
    if (!identifier) return

    const searchText = [id, ...classList].join(' ').toLowerCase()

    // Match against category-specific conventions
    Object.entries(conventions).forEach(([role, patterns]) => {
      const regex = new RegExp(patterns.join('|'), 'i')
      if (regex.test(searchText)) {
        detected[role].push(identifier)
      }
    })
  })

  return detected
}
```

### Layer Extraction with ViewBox Preservation
```typescript
// Source: src/services/knobLayers.ts (production code)
export function extractLayer(svgContent: string, layerIdentifier: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  let layer = doc.querySelector(`#${escapeCSSSelector(layerIdentifier)}`)
  if (!layer) {
    layer = doc.querySelector(`.${escapeCSSSelector(layerIdentifier)}`)
  }

  if (!layer) {
    console.warn(`Layer not found: ${layerIdentifier}`)
    return ''
  }

  // Preserve original viewBox
  const originalSvg = doc.querySelector('svg')
  const viewBox = originalSvg?.getAttribute('viewBox') || '0 0 100 100'
  const width = originalSvg?.getAttribute('width')
  const height = originalSvg?.getAttribute('height')

  // Create new SVG wrapper
  const newSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
  newSvg.setAttribute('viewBox', viewBox)
  newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  newSvg.setAttribute('width', '100%')
  newSvg.setAttribute('height', '100%')

  if (width) newSvg.setAttribute('data-original-width', width)
  if (height) newSvg.setAttribute('data-original-height', height)

  const clonedLayer = layer.cloneNode(true) as Element
  newSvg.appendChild(clonedLayer)

  const serializer = new XMLSerializer()
  return serializer.serializeToString(newSvg)
}
```

### Zod Discriminated Union Schema
```typescript
// Source: Zod v4 documentation + codebase patterns
const RotaryLayersSchema = z.object({
  indicator: z.string().optional(),
  track: z.string().optional(),
  arc: z.string().optional(),
  glow: z.string().optional(),
  shadow: z.string().optional(),
})

const LinearLayersSchema = z.object({
  thumb: z.string().optional(),
  track: z.string().optional(),
  fill: z.string().optional(),
})

const ElementStyleSchema = z.discriminatedUnion('category', [
  z.object({
    category: z.literal('rotary'),
    id: z.string(),
    name: z.string(),
    svgContent: z.string(),
    layers: RotaryLayersSchema,
    minAngle: z.number(),
    maxAngle: z.number(),
    createdAt: z.number(),
  }),
  z.object({
    category: z.literal('linear'),
    id: z.string(),
    name: z.string(),
    svgContent: z.string(),
    layers: LinearLayersSchema,
    createdAt: z.number(),
  }),
  // ... other categories
])
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| knobStyles only | elementStyles for all categories | v0.10.0 (Phase 53) | Unified styling system |
| Per-element layer types | Category-based layer schemas | v0.10.0 (Phase 53) | 5 schemas instead of 19 |
| Project schema v2.0.0 | Project schema v3.0.0 | v0.10.0 (Phase 53) | Backward-compatible migration |
| Knob-specific detection | Category-aware detection | v0.10.0 (Phase 53) | Generalized service |

**Deprecated/outdated:**
- **knobStyles array:** Not deprecated, but superseded by elementStyles. Keep for backward compatibility, auto-migrate on load.
- **detectKnobLayers():** Will be superseded by detectElementLayers(). Keep for existing code, mark as legacy.

## Open Questions

Things that couldn't be fully resolved:

1. **Element type to category mapping**
   - What we know: 19 element types map to 5 categories (rotary, linear, arc, button, meter)
   - What's unclear: Exact mapping not defined in requirements. Need to decide:
     - knob, steppedknob, centerdetentknob, dotindicatorknob → rotary
     - slider, rangeslider, multislider, bipolarslider, crossfadeslider, notchedslider → linear
     - arcslider → arc
     - button, iconbutton, toggleswitch, powerbutton, rockerswitch, rotaryswitch, segmentbutton → button
     - meter → meter
   - Recommendation: Define ELEMENT_TYPE_TO_CATEGORY map in elementStyle.ts, verify with user in planning phase

2. **Layer schema completeness**
   - What we know: LAYER_CONVENTIONS defines layers for knob, slider, button, meter, display, led, switch
   - What's unclear: Are these layer schemas sufficient for all 5 categories? Buttons might need pressed/normal state layers.
   - Recommendation: Review LAYER_CONVENTIONS and extend if needed (e.g., button-pressed, button-normal for state-based layers)

3. **Color override expansion**
   - What we know: KnobStyle has ColorOverrides for 5 layers (indicator, track, arc, glow, shadow)
   - What's unclear: Do other categories need different override structures? Buttons might need labelColor, iconColor.
   - Recommendation: Keep ColorOverrides generic (map of layer role to color), let category-specific layers define what's overridable

4. **Migration timing**
   - What we know: Auto-migrate on project load
   - What's unclear: When to migrate? On deserializeProject() or on first use? Does migration happen once or every load?
   - Recommendation: Migrate once in deserializeProject(), write migrated v3.0.0 back to disk on save. Don't re-migrate every load.

## Sources

### Primary (HIGH confidence)
- Existing codebase: src/store/knobStylesSlice.ts - CRUD pattern
- Existing codebase: src/services/knobLayers.ts - Layer detection and extraction
- Existing codebase: src/services/svgLayerDetection.ts - Generalized detection service
- Existing codebase: src/schemas/project.ts - Zod schema versioning
- Existing codebase: src/services/serialization.ts - Migration patterns
- Existing codebase: src/services/export/svgElementExport.ts - LAYER_CONVENTIONS
- Existing codebase: src/store/index.ts - Slice combination pattern
- package.json - Zustand 5.0.10, Zod 4.3.6, zundo 2.3.0

### Secondary (MEDIUM confidence)
- [Zustand Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern) - Official documentation
- [Zustand Slice Pattern Discussion #1796](https://github.com/pmndrs/zustand/discussions/1796) - TypeScript + Immer + Slice pattern
- [Zod v4 Versioning](https://zod.dev/v4/versioning) - Official versioning strategy
- [Zod Migration Guide](https://zod.dev/v4/changelog) - v3 to v4 migration patterns
- [TypeScript Discriminated Unions](https://basarat.gitbook.io/typescript/type-system/discriminated-unions) - TypeScript Deep Dive
- [Discriminated Unions for Robust React Components](https://medium.com/@uramanovich/typescript-discriminated-unions-for-robust-react-components-58bc06f37299) - React patterns

### Tertiary (LOW confidence)
- [Verzod: Schema Versioning Library](https://github.com/AndrewBastin/verzod) - Third-party migration tool (not needed, Zod v4 has built-in support)
- [Zustand EntityAdapter](https://dev.to/michaeljota/zustand-entityadapter-an-entityadapter-example-for-zustand-cd2) - CRUD pattern inspiration (not using, custom CRUD is simpler)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, versions verified in package.json
- Architecture: HIGH - Existing codebase demonstrates all patterns successfully
- Pitfalls: HIGH - Based on production code analysis and TypeScript/Zod documentation
- Layer conventions: HIGH - LAYER_CONVENTIONS already defined in codebase
- Migration patterns: HIGH - serialization.ts shows v1→v2 migration, v2→v3 follows same pattern

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, no breaking changes expected)
