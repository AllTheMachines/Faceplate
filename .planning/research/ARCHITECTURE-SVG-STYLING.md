# Architecture Research: SVG Styling Extension

**Domain:** Multi-element SVG styling system for Faceplate
**Researched:** 2026-02-04
**Confidence:** HIGH (based on existing implementation analysis)

## Current Architecture

### Existing KnobStyle System

| Component | Location | Role |
|-----------|----------|------|
| `KnobStyle` type | `src/types/knobStyle.ts` | Style definition with SVG content, layers, angle config |
| `KnobStyleLayers` type | `src/types/knobStyle.ts` | Layer mapping (indicator, track, arc, glow, shadow) |
| `ColorOverrides` type | `src/types/knobStyle.ts` | Per-instance color customization |
| `knobStylesSlice` | `src/store/knobStylesSlice.ts` | Zustand slice for style CRUD operations |
| `knobLayers.ts` service | `src/services/knobLayers.ts` | Layer detection, extraction, color override application |
| `KnobRenderer` | `src/components/elements/renderers/controls/KnobRenderer.tsx` | Conditional rendering (native vs SVG-styled) |
| `KnobElementConfig.styleId` | `src/types/elements/controls.ts` | Element-to-style reference |
| `KnobElementConfig.colorOverrides` | `src/types/elements/controls.ts` | Per-instance overrides |

### Current Data Flow

```
1. User imports SVG -> knobLayers.detectKnobLayers() identifies layers
2. User confirms layer mappings -> KnobStyle created in knobStylesSlice
3. User assigns style to knob -> KnobElementConfig.styleId = style.id
4. Render time:
   a. KnobRenderer checks config.styleId
   b. If set: StyledKnobRenderer (SVG layers)
   c. If not: DefaultKnobRenderer (CSS/SVG native)
5. StyledKnobRenderer:
   a. Fetches KnobStyle via getKnobStyle(config.styleId)
   b. Applies colorOverrides via applyAllColorOverrides()
   c. Extracts layers via extractLayer()
   d. Renders each layer with appropriate animation (rotation, opacity)
```

### Serialization

- `knobStyles` array in project file (v2.0.0 schema)
- Elements reference styles by `styleId` (not embedded)
- SVG content sanitized on save and re-sanitized on load

---

## Proposed Changes

### Type System

**From knobStyle-specific to element-category-aware:**

```typescript
// NEW: src/types/elementStyle.ts

// Style category determines which layer roles are available
type StyleCategory = 'knob' | 'slider' | 'button' | 'meter' | 'switch'

// Layer roles vary by category
interface KnobLayers {
  indicator?: string   // Rotates with value
  track?: string       // Static background arc
  arc?: string         // Value fill (opacity animates)
  glow?: string        // Glow effect (intensity by value)
  shadow?: string      // Shadow effect
}

interface SliderLayers {
  track?: string       // Background track
  fill?: string        // Value fill area
  thumb?: string       // Movable thumb element
  glow?: string        // Glow effect
  shadow?: string      // Shadow effect
}

interface ButtonLayers {
  normal?: string      // Unpressed state
  pressed?: string     // Pressed state
  hover?: string       // Hover state (optional)
  glow?: string        // LED/glow indicator
  shadow?: string      // Shadow effect
}

interface MeterLayers {
  background?: string  // Background track
  fill?: string        // Value fill
  peak?: string        // Peak hold indicator
  scale?: string       // Scale markings
  glow?: string        // Glow effect
}

interface SwitchLayers {
  track?: string       // Background track
  thumb?: string       // Switch thumb/handle
  onIndicator?: string // ON state indicator
  offIndicator?: string // OFF state indicator
  shadow?: string      // Shadow effect
}

// Union of all layer types
type StyleLayers = KnobLayers | SliderLayers | ButtonLayers | MeterLayers | SwitchLayers

// Unified ElementStyle interface
interface ElementStyle {
  id: string
  name: string
  category: StyleCategory  // Determines layer type and animation behavior
  svgContent: string       // Sanitized original SVG
  layers: StyleLayers      // Category-specific layer mappings

  // Category-specific configuration
  config: KnobStyleConfig | SliderStyleConfig | ButtonStyleConfig | MeterStyleConfig | SwitchStyleConfig

  createdAt: number
}

// Category-specific configs
interface KnobStyleConfig {
  minAngle: number      // Default -135
  maxAngle: number      // Default 135
}

interface SliderStyleConfig {
  orientation: 'horizontal' | 'vertical' | 'auto'  // auto = detect from SVG
  fillDirection: 'normal' | 'reverse'              // Which end fills first
}

interface ButtonStyleConfig {
  transitionDuration: number  // ms for state transitions
}

interface MeterStyleConfig {
  orientation: 'horizontal' | 'vertical' | 'auto'
  fillDirection: 'bottom-up' | 'top-down' | 'left-right' | 'right-left'
}

interface SwitchStyleConfig {
  thumbTravel: number  // Percentage of track the thumb travels
}
```

**ColorOverrides evolution:**

```typescript
// Per-category color override types
interface KnobColorOverrides {
  indicator?: string
  track?: string
  arc?: string
  glow?: string
  shadow?: string
}

interface SliderColorOverrides {
  track?: string
  fill?: string
  thumb?: string
  glow?: string
  shadow?: string
}

// ... similar for button, meter, switch

// Union type for element configs
type ColorOverrides = KnobColorOverrides | SliderColorOverrides | ButtonColorOverrides | MeterColorOverrides | SwitchColorOverrides
```

### Store Changes

**Option A: Rename Slice (Recommended)**

Rename `knobStylesSlice` to `elementStylesSlice` with backward-compatible migration:

```typescript
// src/store/elementStylesSlice.ts

export interface ElementStylesSlice {
  // State
  elementStyles: ElementStyle[]

  // Actions
  addElementStyle: (style: Omit<ElementStyle, 'id' | 'createdAt'>) => void
  removeElementStyle: (id: string) => void
  updateElementStyle: (id: string, updates: Partial<ElementStyle>) => void
  setElementStyles: (styles: ElementStyle[]) => void  // For project load
  getElementStyle: (id: string) => ElementStyle | undefined

  // Category-filtered getters
  getStylesByCategory: (category: StyleCategory) => ElementStyle[]
}
```

**Migration path:**

```typescript
// During project load, migrate knobStyles to elementStyles
function migrateKnobStylesToElementStyles(knobStyles: KnobStyle[]): ElementStyle[] {
  return knobStyles.map(ks => ({
    id: ks.id,
    name: ks.name,
    category: 'knob' as StyleCategory,
    svgContent: ks.svgContent,
    layers: ks.layers,  // Already matches KnobLayers
    config: {
      minAngle: ks.minAngle,
      maxAngle: ks.maxAngle,
    },
    createdAt: ks.createdAt,
  }))
}
```

**Option B: Keep Separate Slices**

Keep `knobStylesSlice`, add `sliderStylesSlice`, `buttonStylesSlice`, etc.

**Why NOT recommended:**
- Duplicates CRUD logic across 5+ slices
- Complicates serialization (5 arrays vs 1)
- Harder to add new categories later

### Service Changes

**Generalize `knobLayers.ts` to `elementLayers.ts`:**

```typescript
// src/services/elementLayers.ts

// Detection returns potential layers for ANY element type
interface DetectedLayers {
  // Common to all
  glow: string[]
  shadow: string[]

  // Rotary-specific
  indicator: string[]
  track: string[]
  arc: string[]

  // Linear-specific
  fill: string[]
  thumb: string[]

  // Button-specific
  normal: string[]
  pressed: string[]
  hover: string[]

  // Meter-specific
  peak: string[]
  scale: string[]
  background: string[]

  // Catch-all
  unmapped: string[]
}

// Detect all potential layers (UI filters by category)
export function detectElementLayers(svgContent: string): DetectedLayers

// Category-specific extractors return only relevant layers
export function getSuggestedKnobLayers(detected: DetectedLayers): KnobLayers
export function getSuggestedSliderLayers(detected: DetectedLayers): SliderLayers
export function getSuggestedButtonLayers(detected: DetectedLayers): ButtonLayers
export function getSuggestedMeterLayers(detected: DetectedLayers): MeterLayers
export function getSuggestedSwitchLayers(detected: DetectedLayers): SwitchLayers

// Apply overrides (works for any layer type)
export function applyColorOverrides<T extends StyleLayers>(
  svgContent: string,
  layers: T,
  overrides: Partial<Record<keyof T, string>>
): string
```

**Detection patterns expansion:**

```typescript
// Current knob patterns
const KNOB_PATTERNS = {
  indicator: /indicator|pointer|needle|hand|knob-indicator/i,
  track: /track|background|bg|base|knob-track/i,
  arc: /arc|progress|fill|value|knob-arc/i,
}

// New slider patterns
const SLIDER_PATTERNS = {
  track: /track|rail|groove|slider-track/i,
  fill: /fill|progress|value|slider-fill/i,
  thumb: /thumb|handle|knob|slider-thumb|grip/i,
}

// New button patterns
const BUTTON_PATTERNS = {
  normal: /normal|default|up|released|button-normal/i,
  pressed: /pressed|down|active|button-pressed/i,
  hover: /hover|over|button-hover/i,
}

// New meter patterns
const METER_PATTERNS = {
  background: /background|bg|base|meter-bg/i,
  fill: /fill|level|value|meter-fill/i,
  peak: /peak|hold|meter-peak/i,
  scale: /scale|ticks|marks|meter-scale/i,
}

// New switch patterns
const SWITCH_PATTERNS = {
  track: /track|rail|switch-track/i,
  thumb: /thumb|handle|toggle|switch-thumb/i,
  onIndicator: /on|active|led-on/i,
  offIndicator: /off|inactive|led-off/i,
}
```

### Renderer Changes

**Pattern: Category-aware styled renderer factory**

```typescript
// src/components/elements/renderers/StyledElementRenderer.tsx

interface StyledRendererProps<TConfig extends BaseElementConfig, TLayers extends StyleLayers> {
  config: TConfig
  style: ElementStyle
  renderLayers: (layers: ExtractedLayers<TLayers>, value: number) => React.ReactNode
}

// Each element type has its own StyledRenderer
// Example: StyledSliderRenderer.tsx

function StyledSliderRenderer({ config }: { config: SliderElementConfig }) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (!style || style.category !== 'slider') {
    return <DefaultSliderRenderer config={config} />
  }

  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const layers = style.layers as SliderLayers

  // Extract layers
  const extractedLayers = useMemo(() => ({
    track: layers.track ? extractLayer(style.svgContent, layers.track) : null,
    fill: layers.fill ? extractLayer(style.svgContent, layers.fill) : null,
    thumb: layers.thumb ? extractLayer(style.svgContent, layers.thumb) : null,
    glow: layers.glow ? extractLayer(style.svgContent, layers.glow) : null,
    shadow: layers.shadow ? extractLayer(style.svgContent, layers.shadow) : null,
  }), [style.svgContent, layers])

  // Calculate thumb position based on orientation
  const sliderConfig = style.config as SliderStyleConfig
  const thumbTransform = calculateThumbPosition(
    normalizedValue,
    sliderConfig.orientation,
    config.width,
    config.height
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static */}
      {extractedLayers.track && <SafeSVG content={extractedLayers.track} />}

      {/* Shadow - static */}
      {extractedLayers.shadow && <SafeSVG content={extractedLayers.shadow} />}

      {/* Fill - scales with value */}
      {extractedLayers.fill && (
        <div style={{ clipPath: calculateFillClip(normalizedValue, sliderConfig) }}>
          <SafeSVG content={extractedLayers.fill} />
        </div>
      )}

      {/* Thumb - translates with value */}
      {extractedLayers.thumb && (
        <div style={{ transform: thumbTransform }}>
          <SafeSVG content={extractedLayers.thumb} />
        </div>
      )}

      {/* Glow - opacity by value */}
      {extractedLayers.glow && (
        <div style={{ opacity: normalizedValue * 0.7 + 0.3 }}>
          <SafeSVG content={extractedLayers.glow} />
        </div>
      )}
    </div>
  )
}
```

**Renderer delegation pattern:**

```typescript
// SliderRenderer.tsx (updated)

export function SliderRenderer({ config }: SliderRendererProps) {
  if (!config.styleId) {
    return <DefaultSliderRenderer config={config} />
  }
  return <StyledSliderRenderer config={config} />
}
```

### Schema/Serialization Changes

**Project schema extension:**

```typescript
// src/schemas/project.ts

// Evolve KnobStyleSchema to ElementStyleSchema
const ElementStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['knob', 'slider', 'button', 'meter', 'switch']),
  svgContent: z.string(),
  layers: z.record(z.string().optional()),  // Flexible layer mapping
  config: z.record(z.any()),  // Category-specific config
  createdAt: z.number(),
})

// Project schema v2.1.0 (minor version bump)
const ProjectSchemaV2_1 = ProjectSchemaV2.extend({
  version: z.literal('2.1.0'),
  // Rename knobStyles to elementStyles
  elementStyles: z.array(ElementStyleSchema).optional().default([]),
  // Keep knobStyles for backward compat (deprecated)
  knobStyles: z.array(KnobStyleSchema).optional(),
})

// Migration: v2.0.0 -> v2.1.0
function migrateV2_0ToV2_1(data: ProjectDataV2): ProjectDataV2_1 {
  return {
    ...data,
    version: '2.1.0',
    elementStyles: migrateKnobStylesToElementStyles(data.knobStyles || []),
    knobStyles: undefined,  // Clear deprecated field
  }
}
```

---

## Migration Strategy

### Phase 1: Foundation (No Breaking Changes)

1. **Create new types** (`src/types/elementStyle.ts`)
   - Define `ElementStyle`, `StyleCategory`, category-specific layers
   - Keep `KnobStyle` as re-export for backward compat

2. **Create `elementStylesSlice`**
   - Copy `knobStylesSlice` logic
   - Add `category` field handling
   - Add `getStylesByCategory` getter

3. **Generalize `knobLayers.ts`**
   - Expand detection patterns for all categories
   - Add category-specific suggestion functions
   - Keep existing functions as aliases

### Phase 2: Parallel Support

4. **Add `styleId` to SliderElementConfig**
   - Same pattern as KnobElementConfig
   - `styleId?: string`
   - `colorOverrides?: SliderColorOverrides`

5. **Create `StyledSliderRenderer`**
   - Follow KnobRenderer pattern exactly
   - Conditional delegation in main SliderRenderer

6. **Update Style Library UI**
   - Add category tabs/filter
   - Show category badge on styles
   - Category-aware import dialog

### Phase 3: Rollout to Other Types

7. **Repeat for Button, Meter, Switch**
   - Add `styleId` + `colorOverrides` to element configs
   - Create `StyledXxxRenderer` components
   - Expand detection patterns as needed

### Phase 4: Cleanup

8. **Deprecate `knobStyles` in project schema**
   - Bump version to 2.1.0
   - Auto-migrate on load
   - Keep reading old format indefinitely

9. **Remove duplicate code**
   - Replace `knobStylesSlice` with alias to `elementStylesSlice`
   - Consolidate layer detection into single service

---

## Build Order

Based on dependencies and risk minimization:

### Milestone 1: Type Foundation
1. Create `src/types/elementStyle.ts` with new types
2. Create `src/store/elementStylesSlice.ts`
3. Update store index to compose new slice
4. Migration function for knobStyles -> elementStyles

**Why first:** Types are the foundation. All other work depends on these.

### Milestone 2: Service Generalization
5. Rename `knobLayers.ts` -> `elementLayers.ts`
6. Add detection patterns for slider, button, meter, switch
7. Add category-specific suggestion functions
8. Keep backward-compatible function exports

**Why second:** Services are used by both store and renderers.

### Milestone 3: First Control Extension (Slider)
9. Add `styleId` + `colorOverrides` to `SliderElementConfig`
10. Create `StyledSliderRenderer` component
11. Update `SliderRenderer` with conditional delegation
12. Update property panel for slider style assignment

**Why slider first:** Most similar to knob (has track, fill, thumb), validates the pattern.

### Milestone 4: Button + Switch Extensions
13. Add style support to `ButtonElementConfig`
14. Create `StyledButtonRenderer` (state-based, not value-based)
15. Add style support to `ToggleSwitchElementConfig`
16. Create `StyledToggleSwitchRenderer`

**Why together:** Both are binary state elements (pressed/not, on/off).

### Milestone 5: Meter Extension
17. Add style support to `MeterElementConfig`
18. Create `StyledMeterRenderer`
19. Verify gradient/color stop behavior with styled meters

**Why last among controls:** Meter has unique requirements (gradient fills, peak hold).

### Milestone 6: UI Polish + Migration
20. Add category filter to Style Library panel
21. Update import dialog for category selection
22. Schema migration v2.0.0 -> v2.1.0
23. Deprecate `knobStyles` field
24. Update documentation

---

## Integration Points

### Existing Components to Modify

| Component | Change | Risk |
|-----------|--------|------|
| `src/store/index.ts` | Add elementStylesSlice composition | LOW - additive |
| `src/types/elements/controls.ts` | Add styleId/colorOverrides to Slider, Button, etc. | LOW - additive |
| `src/components/elements/renderers/controls/SliderRenderer.tsx` | Add conditional styled path | LOW - parallel implementation |
| `src/components/elements/renderers/controls/ButtonRenderer.tsx` | Add conditional styled path | LOW - parallel implementation |
| `src/components/Properties/SliderProperties.tsx` | Add style assignment UI | LOW - UI addition |
| `src/services/serialization.ts` | Handle elementStyles array | MED - data migration |
| `src/schemas/project.ts` | Add ElementStyleSchema | MED - schema evolution |

### New Components to Create

| Component | Purpose |
|-----------|---------|
| `src/types/elementStyle.ts` | Unified style type system |
| `src/store/elementStylesSlice.ts` | Zustand slice for element styles |
| `src/services/elementLayers.ts` | Generalized layer detection |
| `src/components/elements/renderers/controls/StyledSliderRenderer.tsx` | SVG-styled slider |
| `src/components/elements/renderers/controls/StyledButtonRenderer.tsx` | SVG-styled button |
| `src/components/elements/renderers/controls/StyledToggleSwitchRenderer.tsx` | SVG-styled toggle |
| `src/components/elements/renderers/displays/StyledMeterRenderer.tsx` | SVG-styled meter |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Type system design | HIGH | Follows existing KnobStyle pattern exactly |
| Store architecture | HIGH | Slice pattern proven, just generalizing |
| Layer detection | MEDIUM | New patterns need real SVG testing |
| Renderer pattern | HIGH | KnobRenderer is working model |
| Migration path | HIGH | Additive changes, backward compat |
| Performance | MEDIUM | More layers = more DOM nodes, needs profiling |

---

## Open Questions

1. **Should category be immutable after creation?**
   - Recommendation: YES. Changing category would invalidate layer mappings.

2. **Support category-agnostic styles?**
   - E.g., a "generic" SVG that could work for any control
   - Recommendation: NO for v1. Keep it simple, one style per category.

3. **Shared layer extraction caching?**
   - Multiple instances of same style re-extract layers
   - Consider: Memoization by styleId + svgContent hash
   - Defer to performance phase if needed

4. **Nested SVG support?**
   - Some complex SVGs have nested <svg> elements
   - Current `extractLayer` handles this, verify with new patterns

---

## Sources

- Existing codebase analysis (HIGH confidence - direct code review)
- `src/types/knobStyle.ts` - current implementation
- `src/services/knobLayers.ts` - layer detection patterns
- `src/components/elements/renderers/controls/KnobRenderer.tsx` - styled rendering pattern
- `src/store/knobStylesSlice.ts` - store pattern
- `src/services/serialization.ts` - project persistence pattern
