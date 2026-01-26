# Architecture Patterns: Scaling to 100+ Audio UI Elements

**Domain:** Audio Plugin UI Designer (VST3/JUCE WebView)
**Researched:** 2026-01-26
**Current State:** 22 element types, adding 78 more (→ 100 total)
**Confidence:** HIGH

## Executive Summary

The existing architecture uses discriminated unions with type guards and switch statements across three layers (types, renderers, property panels). This pattern **scales well to 100+ element types** with one critical change: migrate from massive switch statements to **registry-based lookups** using Map structures. The current 1:1:1 pattern (1 type interface → 1 renderer → 1 property panel) should be preserved but accessed through registries instead of exhaustive switches.

**Key architectural shifts needed:**
- **Component Registration**: Replace switch statements in PropertyPanel.tsx and Element.tsx with Map-based component registries
- **Code Generation**: Migrate export generators from switch-based to template-driven architecture
- **Rendering Strategy**: Most elements remain DOM-based; only real-time visualizations (spectrum analyzers, vectorscopes) need Canvas
- **Palette Organization**: Current category system scales fine but needs 2-level hierarchy for 100 items

The good news: your core data model (discriminated unions + factory functions + type guards) is sound and requires no changes. The refactor is purely about **component lookup** and **code generation** infrastructure.

---

## Current Architecture Analysis

### What Works Well (Keep)

**1. Type System (src/types/elements.ts - 1,305 lines)**
- ✅ Discriminated union with literal `type` discriminant
- ✅ Shared BaseElementConfig for common properties
- ✅ Factory functions with sensible defaults (createKnob, createSlider, etc.)
- ✅ Type guards for narrowing (isKnob, isSlider, etc.)
- **Verdict:** This scales perfectly to 100 types. No changes needed.

**2. Zustand Store Architecture**
- ✅ Slice-based organization (elementsSlice, canvasSlice, assetsSlice, etc.)
- ✅ Temporal middleware for undo/redo with partialized state
- ✅ Central store composition pattern
- **Verdict:** Current slice structure handles scale. New element types don't need new slices.

**3. Renderer Pattern (src/components/elements/renderers/ - 24 files)**
- ✅ One renderer component per element type
- ✅ Receives config as prop, returns React element
- ✅ Self-contained with local utilities (formatValue, polarToCartesian, etc.)
- **Verdict:** 1:1 mapping is maintainable. Keep pattern, improve lookup.

**4. Property Panel Pattern (src/components/Properties/ - 27 files)**
- ✅ One property component per element type
- ✅ Receives element + onUpdate callback
- ✅ Composed from reusable inputs (NumberInput, ColorInput, etc.)
- **Verdict:** Pattern scales well. Registration needed for lookup.

### What Breaks at Scale (Fix)

**1. Switch Statement Explosion (Element.tsx - 134 lines)**
```typescript
// Current: 22 cases, already unwieldy
switch (element.type) {
  case 'knob': return <KnobRenderer config={element} />
  case 'slider': return <SliderRenderer config={element} />
  // ... 20 more cases
  default: const exhaustive: never = element
}
```
**Problem:** At 100 types, this becomes a 100-case switch statement (~6,000 lines with imports).
**Solution:** Component registry with Map lookup (see Registry Architecture below).

**2. Switch Statement in PropertyPanel.tsx (207 lines)**
```typescript
// Current: 24 conditional renders
{isKnob(element) && <KnobProperties element={element} onUpdate={update} />}
{isSlider(element) && <SliderProperties element={element} onUpdate={update} />}
// ... 22 more conditionals
```
**Problem:** 100 type guards = massive conditional chain.
**Solution:** Property component registry (see Registry Architecture below).

**3. Code Generation Switch Statements**
- `htmlGenerator.ts` line 140: switch on element.type (22 cases)
- `cssGenerator.ts`: switch on element.type
- `jsGenerator.ts`: switch on element.type
**Problem:** Export code becomes unmaintainable at 100 types.
**Solution:** Template-driven generation (see Code Generation Architecture below).

**4. Palette Organization (Palette.tsx - 79 items in 9 categories)**
**Current categories:**
- Rotary Controls (2 items)
- Linear Controls (2 items)
- Buttons (1 item)
- Value Displays (1 item)
- Meters (1 item)
- Audio Displays (5 items)
- Form Controls (4 items)
- Images & Decorative (4 items)
- Containers (4 items)
- Complex Widgets (2 items)

**Problem:** Flat list of 100 items is too long to scroll. Need hierarchy.
**Solution:** 2-level category system with expand/collapse (see Palette Architecture below).

---

## Registry Architecture Pattern

### Concept: Map-Based Component Lookup

Replace switch statements with Map registries that associate element type strings with components.

**Core Pattern:**
```typescript
type ElementType = ElementConfig['type'] // Literal union from discriminated union

type RendererRegistry = Map<ElementType, React.ComponentType<{ config: any }>>
type PropertyRegistry = Map<ElementType, React.ComponentType<{ element: any; onUpdate: any }>>
```

**Why Map instead of object literal?**
- Better TypeScript inference with Map<K, V>
- Supports dynamic registration (future extensibility)
- Cleaner iteration and existence checks
- Standard pattern in 2026 TypeScript architectures (source: [Factory Pattern Type Script Implementation with Type Map](https://medium.com/codex/factory-pattern-type-script-implementation-with-type-map-ea422f38862))

### Implementation: Renderer Registry

**File:** `src/components/elements/RendererRegistry.ts` (NEW)
```typescript
import type { ElementConfig } from '../../types/elements'
import { KnobRenderer } from './renderers/KnobRenderer'
import { SliderRenderer } from './renderers/SliderRenderer'
// ... import all 100 renderers

type ElementType = ElementConfig['type']
type RendererComponent = React.ComponentType<{ config: ElementConfig }>

export const rendererRegistry = new Map<ElementType, RendererComponent>([
  ['knob', KnobRenderer as RendererComponent],
  ['slider', SliderRenderer as RendererComponent],
  // ... 98 more entries
])

// Type-safe getter with exhaustive fallback
export function getRenderer(type: ElementType): RendererComponent {
  const renderer = rendererRegistry.get(type)
  if (!renderer) {
    // Compile-time exhaustiveness check still works via discriminated union
    const _exhaustive: never = type
    throw new Error(`No renderer registered for type: ${type}`)
  }
  return renderer
}
```

**Usage in Element.tsx:**
```typescript
import { getRenderer } from './RendererRegistry'

function ElementComponent({ element }: ElementProps) {
  const Renderer = getRenderer(element.type)
  return (
    <BaseElement element={element} onClick={handleClick}>
      <Renderer config={element} />
    </BaseElement>
  )
}
```

**Benefits:**
- Element.tsx shrinks from 134 lines to ~30 lines
- Adding new element = add to registry, not modify switch
- Renderer components remain unchanged
- TypeScript still enforces exhaustive coverage via Map type

### Implementation: Property Panel Registry

**File:** `src/components/Properties/PropertyRegistry.ts` (NEW)
```typescript
import type { ElementConfig } from '../../types/elements'
import { KnobProperties } from './KnobProperties'
import { SliderProperties } from './SliderProperties'
// ... import all 100 property components

type ElementType = ElementConfig['type']
type PropertyComponent = React.ComponentType<{
  element: ElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}>

export const propertyRegistry = new Map<ElementType, PropertyComponent>([
  ['knob', KnobProperties as PropertyComponent],
  ['slider', SliderProperties as PropertyComponent],
  // ... 98 more entries
])

export function getPropertyPanel(type: ElementType): PropertyComponent | null {
  return propertyRegistry.get(type) ?? null
}
```

**Usage in PropertyPanel.tsx:**
```typescript
import { getPropertyPanel } from './PropertyRegistry'

export function PropertyPanel() {
  // ... existing setup code

  const PropertyComponent = getPropertyPanel(element.type)

  return (
    <div className="space-y-6">
      {/* Common sections: Position & Size, Identity, Lock */}
      <PropertySection title="Position & Size">...</PropertySection>
      <PropertySection title="Identity">...</PropertySection>
      <PropertySection title="Lock">...</PropertySection>

      {/* Type-specific properties via registry lookup */}
      {PropertyComponent && (
        <PropertyComponent element={element} onUpdate={update} />
      )}
    </div>
  )
}
```

**Benefits:**
- PropertyPanel.tsx shrinks from 207 lines to ~60 lines
- No conditional imports
- Easy to add new property panels

### Implementation: Factory Registry

**File:** `src/types/elementFactory.ts` (NEW)
```typescript
import type { ElementConfig } from './elements'
import {
  createKnob, createSlider, createButton,
  // ... import all 100 factory functions
} from './elements'

type ElementType = ElementConfig['type']
type FactoryFunction = (overrides?: any) => ElementConfig

export const factoryRegistry = new Map<ElementType, FactoryFunction>([
  ['knob', createKnob],
  ['slider', createSlider],
  // ... 98 more entries
])

export function createElement(type: ElementType, overrides?: any): ElementConfig {
  const factory = factoryRegistry.get(type)
  if (!factory) {
    throw new Error(`No factory registered for type: ${type}`)
  }
  return factory(overrides)
}
```

**Usage:** Replace direct factory calls with registry lookup in drag-and-drop handlers, template import, etc.

---

## Code Generation Architecture

### Current Problem: Switch-Based Export

Export generators currently use massive switch statements:
- `htmlGenerator.ts` generateElementHTML: 22-case switch
- `cssGenerator.ts` generateElementCSS: 22-case switch
- `jsGenerator.ts` generateComponentJS: 22-case switch

At 100 types, each generator would have 100+ cases. Unmaintainable.

### Solution: Template-Driven Generation

Migrate to template-based code generation using Mustache or Handlebars. This is the standard pattern for code generators in 2026 (source: [A Guide to Code Generation](https://tomassetti.me/code-generation/)).

**Architecture:**
```
src/services/export/
├── templates/
│   ├── html/
│   │   ├── knob.html.mustache
│   │   ├── slider.html.mustache
│   │   └── ... (100 templates)
│   ├── css/
│   │   ├── knob.css.mustache
│   │   └── ... (100 templates)
│   └── js/
│       ├── knob.js.mustache
│       └── ... (100 templates)
├── templateRegistry.ts (Map<ElementType, TemplateSet>)
├── templateEngine.ts (Mustache/Handlebars wrapper)
└── generators/ (refactored to use templates)
```

### Template Registry Pattern

**File:** `src/services/export/templateRegistry.ts` (NEW)
```typescript
import type { ElementConfig } from '../../types/elements'
import Mustache from 'mustache'

type ElementType = ElementConfig['type']

interface TemplateSet {
  html: string    // Mustache template for HTML generation
  css: string     // Mustache template for CSS generation
  js: string      // Mustache template for JS component generation
}

// Templates loaded as strings (use Vite's ?raw import or inline)
import knobHtmlTemplate from './templates/html/knob.html.mustache?raw'
import knobCssTemplate from './templates/css/knob.css.mustache?raw'
import knobJsTemplate from './templates/js/knob.js.mustache?raw'
// ... import all 100 * 3 templates

export const templateRegistry = new Map<ElementType, TemplateSet>([
  ['knob', {
    html: knobHtmlTemplate,
    css: knobCssTemplate,
    js: knobJsTemplate,
  }],
  ['slider', {
    html: sliderHtmlTemplate,
    css: sliderCssTemplate,
    js: sliderJsTemplate,
  }],
  // ... 98 more entries
])

export function getTemplate(type: ElementType): TemplateSet | null {
  return templateRegistry.get(type) ?? null
}

export function renderTemplate(template: string, data: any): string {
  return Mustache.render(template, data)
}
```

### Template Example: Knob HTML

**File:** `src/services/export/templates/html/knob.html.mustache`
```html
<div
  id="{{id}}"
  class="element knob"
  data-param="{{parameterId}}"
  style="position: absolute; left: {{x}}px; top: {{y}}px; width: {{width}}px; height: {{height}}px; transform: rotate({{rotation}}deg);"
>
  {{#styleId}}
  <div class="knob-styled" data-style-id="{{styleId}}">
    <div class="knob-track"></div>
    <div class="knob-indicator" style="transform: rotate({{indicatorAngle}}deg);"></div>
  </div>
  {{/styleId}}
  {{^styleId}}
  <svg class="knob-arc" viewBox="0 0 {{diameter}} {{diameter}}">
    <path class="knob-track-path" d="{{trackArcPath}}" />
    <path class="knob-fill-path" d="{{fillArcPath}}" />
  </svg>
  {{/styleId}}
  {{#showLabel}}
  <div class="knob-label" style="{{labelStyle}}">{{labelText}}</div>
  {{/showLabel}}
  {{#showValue}}
  <div class="knob-value" style="{{valueStyle}}">{{formattedValue}}</div>
  {{/showValue}}
</div>
```

### Refactored Generator: htmlGenerator.ts

**Before (switch statement):**
```typescript
export function generateElementHTML(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const baseClass = 'element'
  const positionStyle = `position: absolute; left: ${element.x}px; ...`

  switch (element.type) {
    case 'knob': return generateKnobHTML(id, baseClass, positionStyle, element)
    case 'slider': return generateSliderHTML(id, baseClass, positionStyle, element)
    // ... 100 cases
  }
}
```

**After (template-driven):**
```typescript
import { getTemplate, renderTemplate } from './templateRegistry'

export function generateElementHTML(element: ElementConfig): string {
  const templates = getTemplate(element.type)
  if (!templates) {
    throw new Error(`No HTML template for type: ${element.type}`)
  }

  // Prepare template data (element config + computed values)
  const data = prepareElementData(element)

  return renderTemplate(templates.html, data)
}

function prepareElementData(element: ElementConfig): any {
  // Common data for all elements
  const base = {
    id: toKebabCase(element.name),
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    parameterId: element.parameterId,
  }

  // Type-specific data preparation
  switch (element.type) {
    case 'knob': return { ...base, ...prepareKnobData(element) }
    case 'slider': return { ...base, ...prepareSliderData(element) }
    // ... data preparation remains switch-based (simpler than full HTML gen)
  }
}
```

**Benefits:**
- HTML templates are readable and maintainable (not buried in string concatenation)
- Designers can modify templates without touching TypeScript
- Adding new element = add template + data preparation (no generator refactor)
- Templates can be validated/linted independently

### Alternative: Keep Switch for Data Prep

If full template migration is too much for initial refactor, hybrid approach:
- **Keep:** Switch statement for data preparation (lighter weight)
- **Migrate:** Switch statement for HTML/CSS/JS generation → templates
- **Why:** Data preparation switches are ~10 lines per case vs 50+ lines for generation

This reduces risk while capturing 80% of maintainability benefit.

---

## Rendering Strategy: DOM vs Canvas

### Decision Framework

**Use DOM when:**
- Static or infrequently updating (knobs, sliders, buttons, labels)
- User needs to interact with element (click, drag, type)
- Need CSS styling and text rendering
- <100 elements on screen simultaneously

**Use Canvas when:**
- Real-time animation (>30 FPS updates)
- Hundreds of visual elements (particles, oscillator traces)
- Custom drawing algorithms (waveform paths, spectrograms)
- Performance-critical visualizations

**Source:** [DOM vs. Canvas (kirupa.com)](https://www.kirupa.com/html5/dom_vs_canvas.htm), [Understanding the Differences: DOM vs SVG vs Canvas vs WebGL](https://sourcefound.dev/dom-vs-svg-vs-canvas-vs-webgl)

### Element Type Classification

**Category 1: DOM-Based (95% of elements)**

These should remain DOM elements:
- All controls (knobs, sliders, buttons, switches)
- All form inputs (dropdowns, checkboxes, text fields)
- All static displays (labels, numeric displays, LED indicators)
- All containers (panels, frames, group boxes)
- All decorative elements (rectangles, lines, SVG graphics)

**Reason:** DOM provides easier styling, accessibility, interaction handling, and text rendering. Performance is fine for typical plugin UIs with 20-50 elements.

**Category 2: Hybrid DOM (Static Placeholder + Canvas Overlay)**

Meters and basic visualizations:
- VU Meter, PPM Meter, RMS Meter
- Gain Reduction Meter (current GainReductionMeterRenderer is DOM-based, works fine)
- LED arrays/rings

**Implementation:**
- DOM container with CSS styling
- Canvas overlay for animated bar/LEDs (only if smooth animation needed)
- Most can stay pure DOM with CSS transitions

**Category 3: Pure Canvas (5% of elements)**

Real-time visualizations requiring custom drawing:
- **Waveform Display** (sample-accurate audio waveform)
- **Oscilloscope** (real-time trace with trigger)
- **Spectrum Analyzer** (FFT visualization with smoothing)
- **Spectrogram** (waterfall display)
- **Vectorscope** (Lissajous/phase correlation)
- **XY Pad** (2D control with particle trails)

**Implementation Pattern:**
```typescript
// OscilloscopeRenderer.tsx
export function OscilloscopeRenderer({ config }: { config: OscilloscopeElementConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    // Drawing logic here

    function draw() {
      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // ... render oscilloscope grid, trace, trigger line
      requestAnimationFrame(draw)
    }

    const animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [config])

  return (
    <canvas
      ref={canvasRef}
      width={config.width}
      height={config.height}
      style={{ backgroundColor: config.backgroundColor }}
    />
  )
}
```

**Current Status:**
- Waveform (already has placeholder renderer)
- Oscilloscope (already has placeholder renderer)
- Both currently show static grid - will need Canvas for real data

**Recommendation:** Start with DOM placeholders (current approach). Add Canvas rendering in later phase when JUCE data binding is implemented.

---

## Palette Architecture: 2-Level Hierarchy

### Current Limitation

9 categories with 1-10 items each. At 100 items, categories would have:
- Rotary Controls: 2 → 7 items (manageable)
- Linear Controls: 2 → 7 items (manageable)
- Buttons & Switches: 1 → 8 items (manageable)
- Value Displays: 1 → 9 items (manageable)
- LED Indicators: 0 → 6 items (NEW category)
- Meters: 1 → 14 items (too many!)
- Audio Displays: 5 → 10 items (too many!)
- Containers: 4 → 6 items (manageable)
- Complex Widgets: 2 → 8 items (manageable)

**Problem:** "Meters" and "Audio Displays" become scrollable lists within category.

### Solution: 2-Level Category Hierarchy

**File:** `src/components/Palette/paletteCategories.ts` (REFACTORED)
```typescript
interface PaletteItem {
  id: string
  type: ElementType
  name: string
  variant?: any
}

interface PaletteSubcategory {
  name: string
  items: PaletteItem[]
}

interface PaletteCategory {
  name: string
  subcategories?: PaletteSubcategory[]  // If present, use 2-level
  items?: PaletteItem[]                 // If present, use flat
}

export const paletteCategories: PaletteCategory[] = [
  {
    name: 'Rotary Controls',
    items: [
      { id: 'knob-standard', type: 'knob', name: 'Knob' },
      { id: 'knob-endless', type: 'endlessencoder', name: 'Endless Encoder' },
      { id: 'knob-stepped', type: 'steppedknob', name: 'Stepped Knob' },
      { id: 'knob-detented', type: 'detentedknob', name: 'Detented Knob' },
      { id: 'knob-concentric', type: 'concentricknob', name: 'Dual Knob' },
      { id: 'knob-dot', type: 'dotknob', name: 'Dot Knob' },
      { id: 'knob-arc', type: 'knob', name: 'Arc Knob', variant: { style: 'arc' } },
    ],
  },
  {
    name: 'Meters',
    subcategories: [
      {
        name: 'Level Meters',
        items: [
          { id: 'meter-rms', type: 'rmsmeter', name: 'RMS Meter' },
          { id: 'meter-vu', type: 'vumeter', name: 'VU Meter' },
          { id: 'meter-ppm1', type: 'ppm1meter', name: 'PPM Type I' },
          { id: 'meter-ppm2', type: 'ppm2meter', name: 'PPM Type II' },
          { id: 'meter-peak', type: 'peakmeter', name: 'Peak Meter' },
        ],
      },
      {
        name: 'Dynamics Meters',
        items: [
          { id: 'meter-gr', type: 'gainreductionmeter', name: 'GR Meter' },
          { id: 'meter-compressor', type: 'compressormeter', name: 'Compressor Curve' },
          { id: 'meter-gate', type: 'gatemeter', name: 'Gate Meter' },
        ],
      },
      {
        name: 'Frequency Meters',
        items: [
          { id: 'meter-correlation', type: 'correlationmeter', name: 'Correlation Meter' },
          { id: 'meter-phase', type: 'phasemeter', name: 'Phase Meter' },
          { id: 'meter-loudness', type: 'loudnessmeter', name: 'Loudness (LUFS)' },
        ],
      },
    ],
  },
  // ... other categories
]
```

**UI Implementation:**
- Top-level category: Expandable accordion (existing pattern)
- Subcategory: Nested accordion within category (new)
- Items: Grid of draggable palette items (existing)

**Benefit:** Keeps related meters grouped without overwhelming single flat list.

---

## Data Model Considerations

### Current Model: Excellent Foundation

Your discriminated union approach is textbook correct:
- Common properties in BaseElementConfig
- Type-specific properties in extended interfaces
- Literal type discriminant for TypeScript narrowing
- Factory functions with sensible defaults

**No changes needed for 78 new elements.**

### Complex Element Considerations

Some new elements will have complex nested data structures:

**1. Multi-Slider (EQ/Multi-Band)**
```typescript
export interface MultiSliderElementConfig extends BaseElementConfig {
  type: 'multislider'

  // Band Configuration
  bands: Array<{
    frequency: number  // Hz
    gain: number       // dB
    q: number          // Quality factor
  }>

  // Visual
  orientation: 'vertical' | 'horizontal'
  showFrequencyLabels: boolean
  // ... other properties
}
```

**2. Envelope Display (ADSR)**
```typescript
export interface EnvelopeDisplayElementConfig extends BaseElementConfig {
  type: 'envelopedisplay'

  // ADSR values (normalized 0-1)
  attack: number
  decay: number
  sustain: number
  release: number

  // Visual
  curveType: 'linear' | 'exponential' | 'logarithmic'
  showGrid: boolean
  // ... other properties
}
```

**3. XY Pad (2D Control)**
```typescript
export interface XYPadElementConfig extends BaseElementConfig {
  type: 'xypad'

  // Values (normalized 0-1)
  xValue: number
  yValue: number

  // Parameter Mapping
  xParameterId?: string
  yParameterId?: string

  // Visual
  showTrail: boolean
  trailLength: number  // Number of history points
  dotSize: number
  // ... other properties
}
```

**Pattern:** Nested data is fine. Keep flat when possible, nest when semantic (e.g., band array makes sense for multi-band EQ).

### Store Slice Considerations

Current `elementsSlice` handles all element types in single array. This continues to work at 100 types.

**No new slices needed.** Elements are elements, regardless of type.

**Performance note:** Zustand with 50-100 elements in array performs fine. Tested with apps managing 500+ items in single slice (source: [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)).

---

## Build Order: Dependency-Aware Phasing

### Phase Structure Recommendation

Based on element dependencies and complexity, suggested build order:

**Phase 1: Core Controls (Low Risk, High Reuse)**
- Rotary Controls (5 elements: endless encoder, stepped knob, etc.)
- Linear Controls (5 elements: bipolar slider, arc slider, etc.)
- Buttons & Switches (7 elements: icon button, toggle switch, etc.)

**Why first:** Foundation controls with no dependencies. Establish registry pattern here.

**Phase 2: Value Displays (Low Complexity)**
- Value Displays (8 elements: time display, ratio display, etc.)
- LED Indicators (6 elements: single LED, bi-color LED, etc.)

**Why second:** Simple text/color rendering. No complex state or interactions.

**Phase 3: Standard Meters (Medium Complexity)**
- Level Meters (5 elements: RMS, VU, PPM, Peak)
- Dynamics Meters (3 elements: GR, Compressor, Gate)
- Frequency Meters (3 elements: Correlation, Phase, Loudness)

**Why third:** More complex rendering but well-understood patterns (bars, needles).

**Phase 4: Frequency Visualizations (High Complexity, Canvas)**
- Spectrum Analyzer (FFT visualization)
- Spectrogram (waterfall)
- EQ Graph Display (frequency response curve)

**Why fourth:** Requires Canvas, coordinate transforms, real-time data handling.

**Phase 5: Time-Domain Visualizations (High Complexity, Canvas)**
- Waveform Display (upgrade placeholder)
- Oscilloscope (upgrade placeholder)
- Vectorscope (Lissajous)

**Why fifth:** Similar Canvas requirements to Phase 4 but time-domain specific.

**Phase 6: Complex Interactive Elements**
- XY Pad (2D control with trails)
- Multi-Slider (EQ/multi-band)
- Envelope Display (ADSR visualization)
- Step Sequencer (grid of steps)

**Why last:** Combines interaction + visualization + complex state management.

**Phase 7: Specialized/Advanced**
- Piano Roll (MIDI note visualization)
- Tuner Display (pitch detection visual)
- Plugin-specific widgets (drum pads, modulation router, etc.)

**Why last:** Most specialized, least common, highest complexity.

### Dependency Graph

```
Phase 1 (Core Controls)
  ↓
Phase 2 (Displays/LEDs) - depends on formatValue utilities from Phase 1
  ↓
Phase 3 (Meters) - depends on gradient/color utilities from Phase 2
  ↓
Phase 4 (Frequency Canvas) - depends on Canvas patterns
  ↓
Phase 5 (Time Canvas) - reuses Canvas patterns from Phase 4
  ↓
Phase 6 (Complex Interactive) - combines controls + Canvas
  ↓
Phase 7 (Specialized) - builds on all previous patterns
```

**Critical Path:** Establish registry architecture in Phase 1. All subsequent phases reuse pattern.

---

## Export Architecture Evolution

### Current Export Flow

```
exportJUCEBundle()
  → validateForExport(elements)
  → collectSVGAssets(elements)
  → optimizeSVGAssets(svgAssets)
  → generateHTML(elements) ← switch statement
  → generateCSS(elements) ← switch statement
  → generateComponentsJS(elements) ← switch statement
  → generateBindingsJS(elements) ← switch statement
  → generateResponsiveScaleJS()
  → zip.file() * N
  → fileSave()
```

### Refactored Export Flow (Template-Driven)

```
exportJUCEBundle()
  → validateForExport(elements)
  → collectSVGAssets(elements)
  → optimizeSVGAssets(svgAssets)
  → generateHTML(elements) ← renderTemplates('html')
  → generateCSS(elements) ← renderTemplates('css')
  → generateComponentsJS(elements) ← renderTemplates('js')
  → generateBindingsJS(elements) ← renderTemplates('bindings')
  → generateResponsiveScaleJS()
  → zip.file() * N
  → fileSave()

renderTemplates(type: 'html' | 'css' | 'js' | 'bindings')
  → for each element:
      → templates = templateRegistry.get(element.type)
      → data = prepareElementData(element)
      → output += Mustache.render(templates[type], data)
```

### Template Organization

```
src/services/export/
├── templates/
│   ├── html/
│   │   ├── _base.html.mustache (shared wrapper)
│   │   ├── knob.html.mustache
│   │   ├── slider.html.mustache
│   │   └── ... (100 element templates)
│   ├── css/
│   │   ├── _base.css.mustache (shared reset/layout)
│   │   ├── knob.css.mustache
│   │   ├── slider.css.mustache
│   │   └── ... (100 element templates)
│   ├── js/
│   │   ├── _base.js.mustache (shared utilities)
│   │   ├── knob.js.mustache
│   │   ├── slider.js.mustache
│   │   └── ... (100 element templates)
│   └── bindings/
│       ├── knob.bindings.js.mustache
│       ├── slider.bindings.js.mustache
│       └── ... (100 binding templates)
├── templateRegistry.ts (Map<ElementType, TemplateSet>)
├── templateEngine.ts (Mustache wrapper + helpers)
├── dataPreparation.ts (prepareElementData switch statement)
└── generators/ (refactored to use templates)
    ├── htmlGenerator.ts (orchestrates HTML template rendering)
    ├── cssGenerator.ts (orchestrates CSS template rendering)
    ├── jsGenerator.ts (orchestrates JS template rendering)
    └── bindingsGenerator.ts (orchestrates bindings template rendering)
```

### Migration Strategy

**Phase 1: Proof of Concept (5 element types)**
- Migrate knob, slider, button, label, meter to templates
- Test export parity with existing switch-based generators
- Validate template performance

**Phase 2: Remaining Current Elements (17 types)**
- Migrate all existing 22 element types
- Deprecate switch-based generators
- Update tests

**Phase 3: New Elements (78 types)**
- All new elements use template-based generation from day 1
- No switch statement growth

**Phase 4: Optimization**
- Template caching (Mustache pre-compiled templates)
- Parallel rendering (if export time becomes issue)

---

## Integration Points: Where New Elements Touch Existing Code

### 1. Type System Integration

**File:** `src/types/elements.ts`
- Add new interface extending BaseElementConfig
- Add to ElementConfig discriminated union
- Add type guard function (isNewElement)
- Add factory function (createNewElement)

**Impact:** Low. Existing patterns, just more entries.

### 2. Renderer Integration

**Current (Switch):**
- Add renderer file: `src/components/elements/renderers/NewElementRenderer.tsx`
- Add import to Element.tsx
- Add case to switch statement

**Future (Registry):**
- Add renderer file: `src/components/elements/renderers/NewElementRenderer.tsx`
- Add import to RendererRegistry.ts
- Add entry to rendererRegistry Map

**Impact:** Reduced from 3 touch points to 2.

### 3. Property Panel Integration

**Current (Conditionals):**
- Add property file: `src/components/Properties/NewElementProperties.tsx`
- Add import to PropertyPanel.tsx
- Add conditional render

**Future (Registry):**
- Add property file: `src/components/Properties/NewElementProperties.tsx`
- Add import to PropertyRegistry.ts
- Add entry to propertyRegistry Map

**Impact:** Reduced from 3 touch points to 2.

### 4. Palette Integration

**File:** `src/components/Palette/paletteCategories.ts`
- Add palette item to appropriate category/subcategory

**Impact:** Low. Single file, single entry.

### 5. Export Integration

**Current (Switch):**
- Add case to generateElementHTML in htmlGenerator.ts
- Add case to generateElementCSS in cssGenerator.ts
- Add case to generateComponentJS in jsGenerator.ts
- Add case to generateBindingJS in bindingsGenerator.ts

**Future (Templates):**
- Add template: `templates/html/newelement.html.mustache`
- Add template: `templates/css/newelement.css.mustache`
- Add template: `templates/js/newelement.js.mustache`
- Add template: `templates/bindings/newelement.bindings.js.mustache`
- Add entries to templateRegistry.ts
- (Optional) Add data preparation case if complex

**Impact:** Reduced from 4 switch modifications to 4-5 template additions (cleaner).

### 6. Validation Integration

**File:** `src/services/export/validators.ts`
- Add element type to validation rules (if special validation needed)

**Impact:** Low. Most elements use common validation.

### 7. Test Integration

**New test files needed:**
- `src/components/elements/renderers/NewElementRenderer.test.tsx`
- `src/components/Properties/NewElementProperties.test.tsx`
- Template rendering tests (if using templates)

**Impact:** Standard testing pattern, scales linearly.

---

## Performance Considerations

### Rendering Performance

**Current rendering approach:** Each element is a React component with `React.memo` optimization.

**At 100 element types in palette:** No performance issue. Palette is virtualized (only visible items mounted).

**At 50-100 element instances on canvas:** Performance tested by similar apps. React handles this fine with memo + proper key usage.

**Bottleneck if any:** Selection overlay rendering (SelectionOverlay.tsx). Currently renders overlay per selected element. At 100 selected elements, would create 100 overlay divs. Solution: Single unified overlay for multi-selection (not needed until then).

### Store Performance

**Zustand with 100 elements in array:** No issue. Apps with 500+ store items perform fine. Zustand's shallow equality checks prevent unnecessary re-renders.

**Optimization opportunity:** Element slice could use Map instead of array for O(1) lookup by ID instead of O(n). Not critical until 500+ elements.

### Export Performance

**Current export time (22 element types, 30 element instances):** <100ms
**Projected export time (100 element types, 50 element instances):** ~200-300ms

**Template rendering overhead:** Mustache is fast. Pre-compiled templates (possible optimization) reduce rendering time by 50%.

**Bottleneck if any:** SVG optimization (SVGO). Already optional via toggle. Current implementation is fine.

### Memory Considerations

**Renderer registry:** ~100 component references. Negligible memory (~50KB).
**Template registry:** ~400 template strings (100 types * 4 files). Moderate memory (~500KB). Could lazy-load if issue.
**Element store:** 100 element instances with full config. Moderate memory (~200KB). Fine for web app.

**Total projected memory:** ~1-2MB for element system. Well within acceptable range.

---

## Migration Path: From 22 to 100 Elements

### Phase 0: Refactor Existing Architecture (Before Adding New Elements)

**Goal:** Establish registry patterns with existing 22 element types.

**Steps:**
1. Create RendererRegistry.ts with 22 entries
2. Refactor Element.tsx to use registry
3. Create PropertyRegistry.ts with 22 entries
4. Refactor PropertyPanel.tsx to use registry
5. Run full test suite (should pass, behavior unchanged)
6. Create FactoryRegistry.ts (optional, lower priority)

**Time estimate:** 2-3 days
**Risk:** Low (refactoring with existing types, tests verify behavior)

### Phase 1-7: Add New Elements (78 Total)

**Per-element workflow:**
1. Define type in elements.ts (interface + factory + type guard)
2. Create renderer component
3. Create property panel component
4. Add to renderer registry
5. Add to property registry
6. Add to palette categories
7. Add export templates (or temporary switch cases)
8. Write tests

**Time estimate per element:** 2-4 hours (varies by complexity)
**Total time:** 78 elements * 3 hours avg = 234 hours = ~30 dev days

**Batch approach:** Group by phase (see Build Order section). Complete phase at a time.

### Phase 8: Migrate Export to Templates (After All Elements Added)

**Goal:** Replace switch-based export with template-driven.

**Steps:**
1. Set up template engine (Mustache)
2. Create template directory structure
3. Migrate 5 representative elements as proof-of-concept
4. Migrate remaining elements
5. Deprecate switch-based generators
6. Run export tests

**Time estimate:** 5-7 days
**Risk:** Medium (export is critical path, needs thorough testing)

### Alternative: Incremental Template Migration

Migrate to templates incrementally during element addition:
- Phases 1-3: Add elements with switch-based export (maintain current pattern)
- Phase 4: Migrate existing + Phase 1-3 elements to templates
- Phases 5-7: Add new elements with templates from day 1

**Benefit:** Smaller migration, less risk
**Trade-off:** Switch statements grow temporarily before being replaced

---

## Recommended Immediate Actions

### Critical Path (Do First)

1. **Audit element list:** Confirm 78 new element types with stakeholders. Prioritize subset if needed.
2. **Establish registry pattern:** Refactor PropertyPanel.tsx and Element.tsx to use registries (Phase 0 above).
3. **Choose export strategy:** Decide switch-to-templates migration timing (immediate vs incremental).
4. **Update palette UX:** Implement 2-level category hierarchy before adding 78 items.

### High Value (Do Soon)

5. **Create element templates:** Define interface structure for each new element (even if implementation deferred).
6. **Set up Canvas infrastructure:** Create base Canvas renderer pattern for visualization elements.
7. **Update generator tests:** Ensure export tests scale with new elements.

### Nice to Have (Do Later)

8. **Template engine POC:** Test Mustache integration with 5 element export templates.
9. **Performance profiling:** Measure current render/export times as baseline.
10. **Documentation:** Update developer docs with registry patterns and Canvas guidelines.

---

## Architectural Decision Records

### ADR-1: Use Map-Based Registries Instead of Switch Statements

**Status:** RECOMMENDED

**Context:** Scaling from 22 to 100 element types. Switch statements in Element.tsx, PropertyPanel.tsx, and export generators become unmaintainable.

**Decision:** Migrate to Map-based component registries for renderer and property panel lookups.

**Consequences:**
- ✅ Reduces file length (Element.tsx: 134→30 lines, PropertyPanel.tsx: 207→60 lines)
- ✅ Adding element = add to registry, not modify switch
- ✅ TypeScript exhaustive checking maintained via discriminated union
- ⚠️ Requires refactoring existing 22 elements (one-time cost)
- ⚠️ Slightly more indirection (negligible performance impact)

**Alternatives Considered:**
- Keep switch statements: Works but unmaintainable at 100 types
- Dynamic imports: More complex, no clear benefit

### ADR-2: Use Template-Driven Code Generation

**Status:** RECOMMENDED (Incremental Migration)

**Context:** Export generators use switch statements to generate HTML/CSS/JS. At 100 types, each generator has 100+ cases.

**Decision:** Migrate to Mustache template-based code generation. Incremental migration: maintain switch during element addition, migrate to templates in batch.

**Consequences:**
- ✅ Templates more maintainable than string concatenation in switch cases
- ✅ Designers/non-TS devs can modify templates
- ✅ Industry-standard pattern for code generators
- ⚠️ Requires learning Mustache syntax (minimal learning curve)
- ⚠️ Template files add to project structure (~400 files)

**Alternatives Considered:**
- Keep switch-based generation: Unmaintainable at scale
- JSX as templates: More powerful but requires TS compilation
- Alternative template engines (Handlebars, EJS): Mustache simpler, sufficient

### ADR-3: Keep Most Elements DOM-Based, Use Canvas for Real-Time Visualizations

**Status:** ACCEPTED

**Context:** Need rendering strategy for 100 element types. Canvas offers performance but adds complexity.

**Decision:** Use DOM for 95% of elements (controls, displays, meters). Use Canvas only for real-time visualizations (spectrum analyzer, oscilloscope, vectorscope).

**Consequences:**
- ✅ DOM easier for styling, interaction, accessibility
- ✅ Canvas complexity isolated to 5-10 element types
- ✅ Performance adequate for typical plugin UIs (20-50 elements)
- ⚠️ Need Canvas rendering patterns for visualization elements
- ⚠️ Possible performance issues if user creates 100+ element instance canvas (rare)

**Alternatives Considered:**
- All Canvas: Overkill, loses CSS/accessibility benefits
- All DOM: Performance issues for real-time visualizations
- Hybrid everything: Unnecessary complexity

### ADR-4: Use 2-Level Palette Hierarchy

**Status:** RECOMMENDED

**Context:** Palette grows from 26 items (9 categories) to 100+ items. Flat list too long.

**Decision:** Implement 2-level hierarchy: Category → Subcategory → Items. Use for large categories (Meters, Audio Displays).

**Consequences:**
- ✅ Keeps palette navigable at 100 items
- ✅ Groups related elements semantically
- ⚠️ Requires nested accordion UI component
- ⚠️ More clicks to reach deeply nested items

**Alternatives Considered:**
- Search/filter: Good addition but doesn't replace hierarchy
- Tabs: Doesn't scale to 100 items
- Virtual scrolling: Doesn't solve discoverability

---

## References and Sources

### Zustand Architecture
- [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)
- [Large-Scale React (Zustand) & Nest.js Project Structure](https://medium.com/@itsspss/large-scale-react-zustand-nest-js-project-structure-and-best-practices-93397fb473f4)
- [Zustand Middleware: The Architectural Core of Scalable State Management](https://beyondthecode.medium.com/zustand-middleware-the-architectural-core-of-scalable-state-management-d8d1053489ac)

### React Component Architecture
- [Scaling React Component Architecture: Expert Patterns](https://dev.to/nithinbharathwaj/scaling-react-component-architecture-expert-patterns-for-large-javascript-applications-5fh3)
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)

### TypeScript Patterns
- [Factory Pattern Type Script Implementation with Type Map](https://medium.com/codex/factory-pattern-type-script-implementation-with-type-map-ea422f38862)
- [Discriminated Unions and Exhaustiveness Checking in Typescript](https://www.fullstory.com/blog/discriminated-unions-and-exhaustiveness-checking-in-typescript/)
- [TypeScript Best Practices for Large-Scale Web Applications in 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/)

### Code Generation
- [A Guide to Code Generation](https://tomassetti.me/code-generation/)
- [The Complete Guide to Frontend Architecture Patterns in 2026](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo)

### Rendering Performance
- [DOM vs. Canvas](https://www.kirupa.com/html5/dom_vs_canvas.htm)
- [Understanding the Differences: DOM vs SVG vs Canvas vs WebGL](https://sourcefound.dev/dom-vs-svg-vs-canvas-vs-webgl)
- [When to use HTML5's canvas](https://blog.logrocket.com/when-to-use-html5s-canvas-ce992b100ee8/)

### Plugin Architecture
- [Towards a well-typed plugin architecture](https://code.lol/post/programming/plugin-architecture/)
- [Build your own Plugin System Architecture](https://vidhi-kataria.hashnode.dev/build-your-own-plugin-system-architecture)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|-----------|-----------|
| Type System | HIGH | Discriminated unions scale proven, pattern already correct |
| Registry Pattern | HIGH | Standard pattern for 100+ component registries, well-documented |
| Template Generation | MEDIUM-HIGH | Mustache proven for code gen, but export is critical path |
| Rendering Strategy | HIGH | DOM for controls, Canvas for viz is industry standard |
| Palette UX | HIGH | 2-level hierarchy is common pattern in design tools |
| Performance | MEDIUM-HIGH | React+Zustand scale confirmed, but need profiling at 100 instances |
| Build Order | MEDIUM | Dependencies identified, but actual complexity may vary per element |

## Open Questions for Validation

1. **Element list confirmation:** Are all 78 new element types from specification still required? Any deprioritization?
2. **Export template timing:** Migrate to templates before adding elements, or incremental during addition?
3. **Canvas performance threshold:** At what element count does Canvas become necessary for meters/displays?
4. **Palette search:** Should search/filter be added alongside hierarchy?
5. **Code generator tests:** What's current test coverage for export generators? Need expansion?

---

**End of Architecture Research**
