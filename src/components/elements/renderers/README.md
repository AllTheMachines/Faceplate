# Element Renderers

This directory contains all visual renderers for the 25 element types organized by semantic category.

## Directory Structure

```
renderers/
├── index.ts                    # Central registry exports getRenderer()
├── types.ts                    # Common renderer types and props
├── controls/                   # Interactive input elements
│   ├── index.ts                # Barrel export for controls category
│   ├── ButtonRenderer.tsx
│   ├── CheckboxRenderer.tsx
│   ├── DropdownRenderer.tsx
│   ├── KnobRenderer.tsx
│   ├── RadioGroupRenderer.tsx
│   ├── RangeSliderRenderer.tsx
│   ├── SliderRenderer.tsx
│   └── TextFieldRenderer.tsx
├── displays/                   # Read-only visualization elements
│   ├── index.ts                # Barrel export for displays category
│   ├── DbDisplayRenderer.tsx
│   ├── FrequencyDisplayRenderer.tsx
│   ├── GainReductionMeterRenderer.tsx
│   ├── LabelRenderer.tsx
│   ├── MeterRenderer.tsx
│   ├── ModulationMatrixRenderer.tsx
│   ├── OscilloscopeRenderer.tsx
│   ├── PresetBrowserRenderer.tsx
│   └── WaveformRenderer.tsx
├── containers/                 # Layout and grouping elements
│   ├── index.ts                # Barrel export for containers category
│   ├── CollapsibleRenderer.tsx
│   ├── FrameRenderer.tsx
│   ├── GroupBoxRenderer.tsx
│   └── PanelRenderer.tsx
└── decorative/                 # Visual styling elements
    ├── index.ts                # Barrel export for decorative category
    ├── ImageRenderer.tsx
    ├── LineRenderer.tsx
    ├── RectangleRenderer.tsx
    └── SvgGraphicRenderer.tsx
```

## Adding a New Element

### 1. Create the Renderer Component

Create a new file in the appropriate category directory:

```typescript
// Example: src/components/elements/renderers/controls/MyNewRenderer.tsx
import React from 'react'
import { RendererProps } from '../types'

interface MyNewConfig {
  type: 'my-new-element'
  // ... other config properties
}

export function MyNewRenderer({ config }: RendererProps<MyNewConfig>) {
  return (
    <div>
      {/* Renderer implementation */}
    </div>
  )
}
```

### 2. Export from Category Barrel

Add the renderer to the category's `index.ts`:

```typescript
// Example: src/components/elements/renderers/controls/index.ts
export { ButtonRenderer } from './ButtonRenderer'
export { CheckboxRenderer } from './CheckboxRenderer'
export { MyNewRenderer } from './MyNewRenderer'  // Add this line
// ... other exports
```

### 3. Register in Central Registry

Add to the renderer registry in `renderers/index.ts`:

```typescript
import { MyNewRenderer } from './controls'

const rendererRegistry = new Map<string, React.ComponentType<any>>([
  // ... existing renderers
  ['my-new-element', MyNewRenderer],
])
```

### 4. Add Type Definition

Update the element type in `src/types/elements.ts`:

```typescript
export type ElementType =
  | 'button'
  | 'checkbox'
  | 'my-new-element'  // Add this line
  // ... other types
```

## Architecture: Code Splitting Infrastructure

### Current State (Synchronous Loading)

All renderers are currently loaded synchronously via the registry pattern:

```typescript
// Element.tsx uses getRenderer() for O(1) lookup
const Renderer = getRenderer(element.type)

// All renderers are imported upfront in index.ts
import { ButtonRenderer } from './controls'
import { SliderRenderer } from './controls'
// ... etc
```

### Future State (Lazy Loading)

The infrastructure is **prepared for incremental React.lazy adoption**:

1. **Suspense boundaries** are already in place in `Element.tsx`
2. **Vite manual chunks** split renderers by category in `vite.config.ts`
3. **Category barrel exports** provide clear lazy-load boundaries

When element types grow from 25 to 100+, convert to lazy loading:

```typescript
// Future: renderers/index.ts with React.lazy per category
const controlsPromise = () => import('./controls')
const displaysPromise = () => import('./displays')
const containersPromise = () => import('./containers')
const decorativePromise = () => import('./decorative')

// Map element types to lazy-loaded category loaders
const categoryLoaders = new Map([
  ['button', lazy(() => controlsPromise().then(m => ({ default: m.ButtonRenderer })))],
  ['slider', lazy(() => controlsPromise().then(m => ({ default: m.SliderRenderer })))],
  // ... etc
])
```

### Build Output (Current)

Vite produces separate chunks even though loading is synchronous:

```
dist/assets/
  elements-controls-[hash].js      (48 kB)  - All control renderers
  elements-displays-[hash].js      (8.6 kB) - All display renderers
  elements-containers-[hash].js    (2.4 kB) - All container renderers
  elements-decorative-[hash].js    (2.9 kB) - All decorative renderers
  vendor-dnd-[hash].js             (186 kB) - DnD-kit library
  vendor-zustand-[hash].js         (0.7 kB) - Zustand store
```

These chunks are loaded upfront now, but the infrastructure is ready to load them on-demand when needed.

## Registry Pattern Benefits

1. **O(1) lookup** - Map provides constant-time renderer lookup
2. **Type safety** - TypeScript checks renderer props
3. **Defensive fallback** - Console warning for unknown types
4. **Backward compatible** - Individual renderers can still be imported directly
5. **Lazy-load ready** - Category boundaries enable incremental adoption

## Testing Renderer Components

Renderers can be tested in isolation:

```typescript
import { render } from '@testing-library/react'
import { MyNewRenderer } from './MyNewRenderer'

test('MyNewRenderer renders correctly', () => {
  const config = { type: 'my-new-element', id: '1', x: 0, y: 0, width: 100, height: 50 }
  const { getByText } = render(<MyNewRenderer config={config} />)
  // ... assertions
})
```

## Performance Considerations

- **Current (25 elements):** Synchronous loading is fine (~60 kB renderer code)
- **Future (100+ elements):** Lazy loading becomes beneficial
  - Use React.lazy per category
  - Suspense boundaries already in place
  - Vite chunks already configured
  - Initial bundle size reduced by 80%+

---

**Last updated:** 2026-01-26 (Phase 19, Plan 06)
