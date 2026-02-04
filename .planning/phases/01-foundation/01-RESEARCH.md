# Phase 1: Foundation - Research

**Researched:** 2026-01-23
**Domain:** Canvas rendering with React, state management, coordinate systems
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational architecture for a browser-based canvas design tool using React 18 with TypeScript, Zustand for state management, react-konva for canvas rendering, and Tailwind CSS for layout. The research focused on verifying the chosen stack, identifying best practices for coordinate system management, and documenting common pitfalls in canvas editor applications.

The standard approach for this type of application involves: (1) Zustand with slice pattern for modular state management, (2) react-konva for declarative canvas rendering with proper layer management, (3) typed coordinate utilities to prevent mixing screen/canvas/element coordinate spaces, (4) zundo middleware for undo/redo functionality, and (5) CSS Grid with Tailwind for three-panel layout.

Critical findings: react-konva version compatibility with React 18 requires using v18.x (not v19), coordinate transformations must account for scale and offset at all zoom levels, and performance optimization through layer management and selective event listening is essential for responsive canvas interactions.

**Primary recommendation:** Use react-konva 18.x with React 18, implement typed coordinate system utilities from day one to prevent coordinate confusion, structure Zustand store with slices pattern for scalability, and apply zundo temporal middleware for undo/redo capability.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.x | UI framework | Project requirement, v19 not yet stable for production |
| TypeScript | 5.x | Type safety | Prevents coordinate confusion, mandatory for complex state |
| Vite | 5.x | Build tool | Project requirement, fast HMR, first-class TypeScript support |
| Zustand | 5.0.10 | State management | Minimal boilerplate, no Context providers, excellent TypeScript support |
| react-konva | 18.2.10 | Canvas rendering | Declarative canvas with React patterns, maintained, TypeScript support |
| konva | 9.x | Canvas engine | Peer dependency of react-konva, battle-tested canvas library |
| zundo | 2.x | Undo/redo | <700 bytes, integrates with Zustand, temporal middleware pattern |
| Tailwind CSS | 3.x | Styling/layout | Project requirement, CSS Grid utilities for panel layout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/core | 6.x | Drag-drop | Required for palette-to-canvas element drag (Phase 2+) |
| @types/react | 18.x | TypeScript types | Development, type checking React components |
| @types/react-dom | 18.x | TypeScript types | Development, type checking React DOM |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-konva | Canvas API directly | More control but lose React declarative model, harder to maintain |
| react-konva | fabric.js | More features but heavier bundle, not React-native |
| Zustand | Redux Toolkit | More structured but heavier boilerplate for this app size |
| Zustand slices | Context API | Would work for simple state but doesn't scale to undo/redo |

**Installation:**
```bash
# Core dependencies
npm install react@18 react-dom@18 zustand@5 react-konva@18 konva@9 zundo@2

# Build tools (typically pre-installed with Vite template)
npm install -D vite@5 @vitejs/plugin-react typescript

# TypeScript types
npm install -D @types/react@18 @types/react-dom@18

# Styling (if not already installed)
npm install -D tailwindcss@3 postcss autoprefixer
```

**Critical version constraint:** react-konva v19 dropped React 18 support - must use react-konva 18.x with React 18.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # React components
│   ├── Canvas/         # Canvas-related components (Stage, Layer wrappers)
│   ├── Layout/         # Three-panel layout components
│   └── PropertyPanel/  # Property editing components
├── store/              # Zustand store slices
│   ├── canvasSlice.ts  # Canvas state (dimensions, background)
│   ├── viewportSlice.ts # Pan/zoom state (scale, offset)
│   └── index.ts        # Combined store with temporal middleware
├── types/              # TypeScript type definitions
│   └── coordinates.ts  # Coordinate system types (Screen, Canvas, Element)
├── utils/              # Utility functions
│   └── coordinates.ts  # Coordinate transformation utilities
└── App.tsx             # Root component with three-panel layout
```

### Pattern 1: Zustand Slice Pattern with TypeScript
**What:** Organize state into logical slices that can reference each other through `get()` and `set()` parameters.

**When to use:** Always, for maintainability and future undo/redo integration.

**Example:**
```typescript
// Source: https://github.com/pmndrs/zustand/blob/main/docs/guides/slices-pattern.md
import { StateCreator } from 'zustand';

// Define slice state and actions
interface CanvasSlice {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  setCanvasDimensions: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
}

// Create slice
const createCanvasSlice: StateCreator<
  CanvasSlice & ViewportSlice,
  [],
  [],
  CanvasSlice
> = (set) => ({
  canvasWidth: 800,
  canvasHeight: 600,
  backgroundColor: '#1a1a1a',
  setCanvasDimensions: (width, height) =>
    set({ canvasWidth: width, canvasHeight: height }),
  setBackgroundColor: (color) =>
    set({ backgroundColor: color }),
});

interface ViewportSlice {
  scale: number;
  offsetX: number;
  offsetY: number;
  setViewport: (scale: number, x: number, y: number) => void;
}

const createViewportSlice: StateCreator<
  CanvasSlice & ViewportSlice,
  [],
  [],
  ViewportSlice
> = (set) => ({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  setViewport: (scale, x, y) =>
    set({ scale, offsetX: x, offsetY: y }),
});

// Combine slices with temporal middleware
import { create } from 'zustand';
import { temporal } from 'zundo';

export const useStore = create<CanvasSlice & ViewportSlice>()(
  temporal(
    (...a) => ({
      ...createCanvasSlice(...a),
      ...createViewportSlice(...a),
    }),
    {
      limit: 50, // Store last 50 states
      partialize: (state) => ({
        // Only track specific fields for undo/redo
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        backgroundColor: state.backgroundColor,
        // Don't track viewport (pan/zoom) in undo history
      }),
    }
  )
);

// Access undo/redo
// useStore.temporal.getState().undo()
// useStore.temporal.getState().redo()
```

### Pattern 2: Typed Coordinate Systems
**What:** Define distinct TypeScript types for different coordinate spaces to prevent mixing coordinates.

**When to use:** Always - prevents the most common bug category in canvas applications.

**Example:**
```typescript
// Source: Research synthesis from MDN coordinate systems and react-konva patterns
// types/coordinates.ts

// Branded types prevent accidental mixing
export type ScreenX = number & { readonly __brand: 'ScreenX' };
export type ScreenY = number & { readonly __brand: 'ScreenY' };
export type CanvasX = number & { readonly __brand: 'CanvasX' };
export type CanvasY = number & { readonly __brand: 'CanvasY' };

export interface ScreenCoord {
  x: ScreenX;
  y: ScreenY;
}

export interface CanvasCoord {
  x: CanvasX;
  y: CanvasY;
}

// utils/coordinates.ts
export function screenToCanvas(
  screen: ScreenCoord,
  viewport: { scale: number; offsetX: number; offsetY: number }
): CanvasCoord {
  // Formula from: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
  return {
    x: ((screen.x - viewport.offsetX) / viewport.scale) as CanvasX,
    y: ((screen.y - viewport.offsetY) / viewport.scale) as CanvasY,
  };
}

export function canvasToScreen(
  canvas: CanvasCoord,
  viewport: { scale: number; offsetX: number; offsetY: number }
): ScreenCoord {
  return {
    x: (canvas.x * viewport.scale + viewport.offsetX) as ScreenX,
    y: (canvas.y * viewport.scale + viewport.offsetY) as ScreenY,
  };
}
```

### Pattern 3: React-Konva Stage with Viewport Transform
**What:** Use Konva Stage scale and position properties to implement pan/zoom, get pointer position for coordinate conversion.

**When to use:** All canvas interactions (zoom, pan, click detection).

**Example:**
```typescript
// Source: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
import { Stage, Layer, Rect } from 'react-konva';
import { useRef } from 'react';
import { useStore } from './store';

function CanvasStage() {
  const stageRef = useRef<Konva.Stage>(null);
  const { scale, offsetX, offsetY, setViewport } = useStore();
  const { canvasWidth, canvasHeight, backgroundColor } = useStore();

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Zoom direction (handle trackpad pinch)
    const direction = e.evt.ctrlKey ? -e.evt.deltaY : e.evt.deltaY;
    const scaleBy = direction > 0 ? 1.01 : 0.99;
    const newScale = scale * scaleBy;

    // Calculate point under cursor before zoom
    const mousePointTo = {
      x: (pointer.x - offsetX) / scale,
      y: (pointer.y - offsetY) / scale,
    };

    // Calculate new position to keep cursor point stationary
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setViewport(newScale, newPos.x, newPos.y);
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth * 0.6} // Center panel width
      height={window.innerHeight}
      scaleX={scale}
      scaleY={scale}
      x={offsetX}
      y={offsetY}
      onWheel={handleWheel}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill={backgroundColor}
          listening={false} // Background doesn't need events
        />
        {/* Canvas content here */}
      </Layer>
    </Stage>
  );
}
```

### Pattern 4: Spacebar + Drag Pan
**What:** Implement panning by detecting spacebar key, temporarily changing cursor, and dragging stage.

**When to use:** Standard UX for canvas tools (Figma, Photoshop pattern).

**Example:**
```typescript
// Source: Common canvas editor pattern
function CanvasStage() {
  const stageRef = useRef<Konva.Stage>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const { scale, offsetX, offsetY, setViewport } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        e.preventDefault();
        setIsPanning(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(false);
        setDragStart(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      const pointer = e.target.getStage()?.getPointerPosition();
      if (pointer) {
        setDragStart({ x: pointer.x - offsetX, y: pointer.y - offsetY });
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning && dragStart) {
      const pointer = e.target.getStage()?.getPointerPosition();
      if (pointer) {
        setViewport(
          scale,
          pointer.x - dragStart.x,
          pointer.y - dragStart.y
        );
      }
    }
  };

  return (
    <div style={{ cursor: isPanning ? 'grab' : 'default' }}>
      <Stage
        ref={stageRef}
        draggable={false} // Manual pan control
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // ... other props
      />
    </div>
  );
}
```

### Pattern 5: Three-Panel Layout with Tailwind Grid
**What:** Use CSS Grid with fixed sidebars and flexible center panel.

**When to use:** Application shell layout.

**Example:**
```typescript
// Source: https://tailwindcss.com/docs/grid-template-columns
function App() {
  return (
    <div className="h-screen w-screen grid grid-cols-[250px_1fr_300px] bg-gray-900 text-white">
      {/* Left panel - Palette */}
      <div className="bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <h2 className="p-4 text-lg font-semibold">Elements</h2>
        {/* Palette content */}
      </div>

      {/* Center panel - Canvas */}
      <div className="bg-gray-900 relative overflow-hidden">
        <CanvasStage />
      </div>

      {/* Right panel - Properties */}
      <div className="bg-gray-800 border-l border-gray-700 overflow-y-auto">
        <h2 className="p-4 text-lg font-semibold">Properties</h2>
        {/* Property panel content */}
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Storing canvas coordinates in screen space:** Always convert to canvas space immediately, store and work with canvas coordinates.
- **Mixing Konva and direct canvas API:** Stick to Konva's API, don't access underlying canvas directly - breaks React reconciliation.
- **Caching everything:** Only cache complex shapes or groups, simple shapes render faster without caching.
- **Listening on all shapes:** Disable listening on static/background elements with `listening={false}`.
- **Single monolithic store:** Use slice pattern from start - refactoring later is painful.
- **Applying middleware to slices:** Apply middleware (temporal, persist) at store level, not slice level.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Undo/redo system | History stack with snapshots | zundo temporal middleware | Handles partial state tracking, prevents memory bloat, integrates with Zustand |
| Zoom-to-pointer | Manual coordinate math | Konva Stage transform + pointer position pattern | Edge cases: trackpad pinch, touch gestures, precision at high zoom |
| Canvas event handling | addEventListener on canvas | Konva event system through react-konva | Handles transform coordinates, bubbling, shape targeting automatically |
| Drag-drop from palette | Manual mouse tracking | @dnd-kit/core (Phase 2) | Handles accessibility, touch, constraints, collision detection |
| Coordinate conversions | Ad-hoc calculations | Typed coordinate utilities with branded types | Prevents coordinate space confusion - most common bug source |

**Key insight:** Canvas coordinate transformations have subtle bugs at scale boundaries (very large zoom, negative coordinates, floating point precision). Konva's battle-tested transform system handles these edge cases. Undo/redo naive snapshot approach causes memory issues with large canvases - zundo's diff-based approach is essential.

## Common Pitfalls

### Pitfall 1: React-Konva Version Mismatch
**What goes wrong:** Installing react-konva 19 with React 18 causes runtime errors or peer dependency warnings.

**Why it happens:** react-konva v19 dropped React 18 support - only works with React 19. npm may install latest version by default.

**How to avoid:** Explicitly install `react-konva@18` in package.json. Pin version: `"react-konva": "^18.2.10"`.

**Warning signs:** Peer dependency warnings during install, errors about `useSyncExternalStore` in console.

### Pitfall 2: Coordinate Space Confusion
**What goes wrong:** Mixing screen coordinates (from mouse events) with canvas coordinates (for element positions) causes elements to appear in wrong positions after zoom/pan.

**Why it happens:** Mouse events give screen coordinates, but elements must be positioned in canvas coordinate space. Forgetting to transform between spaces is easy.

**How to avoid:**
- Use typed coordinates (`ScreenCoord` vs `CanvasCoord`) to make mixing impossible at compile time.
- Always convert screen→canvas immediately when receiving mouse events.
- Test at multiple zoom levels (0.25x, 1x, 4x) - bugs appear at extremes.

**Warning signs:** Elements jump to wrong positions after zoom, pan causes drift, coordinates work at 1x zoom but fail at other scales.

### Pitfall 3: Performance Degradation with Many Shapes
**What goes wrong:** Canvas becomes sluggish with 100+ shapes, especially during drag operations or zoom.

**Why it happens:**
- Every shape listens to all mouse events by default (expensive).
- Single layer forces full redraw for any change.
- No shape caching for complex elements.

**How to avoid:**
- Set `listening={false}` on background/static elements.
- Use multiple layers: static background layer, interactive elements layer, dragging layer.
- Move dragged shapes to temporary layer during drag.
- Limit layers to 3-5 maximum (each layer = separate canvas element).
- Cache complex shape groups: `ref.current?.cache()`.

**Warning signs:** Frame drops during interactions, zoom feels laggy, high CPU usage with idle canvas.

### Pitfall 4: Zoom Formula Without Pointer Context
**What goes wrong:** Zoom centers on canvas origin (0,0) instead of cursor position, disorienting UX.

**Why it happens:** Simply multiplying scale without recalculating stage position causes zoom to "jump".

**How to avoid:** Use the two-step transform:
1. Calculate point under cursor in canvas space: `(pointer - offset) / oldScale`
2. Recalculate offset to keep that point stationary: `pointer - point * newScale`

**Warning signs:** Zooming causes canvas to shift unexpectedly, zoom feels unnatural, cursor position doesn't stay over same canvas point.

### Pitfall 5: Applying Middleware to Slices
**What goes wrong:** Wrapping individual slices with `temporal()` or `persist()` causes state duplication, undo/redo only affects one slice.

**Why it happens:** Middleware should wrap entire store, not individual slices. Documentation examples can be misleading.

**How to avoid:**
```typescript
// WRONG
const createSlice = temporal((set) => ({ ... }));

// CORRECT
const useStore = create()(
  temporal((...a) => ({
    ...createSlice1(...a),
    ...createSlice2(...a),
  }))
);
```

**Warning signs:** Undo/redo doesn't work across all state, multiple temporal stores, TypeScript errors about conflicting types.

### Pitfall 6: Canvas Background Implementation
**What goes wrong:** Setting canvas background via CSS or Konva Stage fill doesn't transform with stage, causes visual issues during zoom.

**Why it happens:** Stage background is outside the transform coordinate system.

**How to avoid:** Use a Rect shape on bottom layer with `listening={false}`. This rectangle transforms with the stage.

**Warning signs:** Background doesn't zoom/pan with content, background appears to "slide" during transforms.

## Code Examples

Verified patterns from official sources:

### Getting Pointer Position with Transform Awareness
```typescript
// Source: https://konvajs.org/docs/sandbox/Relative_Pointer_Position.html
function handleCanvasClick(e: KonvaEventObject<MouseEvent>) {
  const stage = e.target.getStage();
  if (!stage) return;

  // Get pointer in screen space
  const screenPointer = stage.getPointerPosition();
  if (!screenPointer) return;

  // Get pointer in canvas space (accounts for zoom/pan)
  const layer = stage.findOne('Layer'); // or specific layer
  const canvasPointer = layer?.getRelativePointerPosition();

  console.log('Screen:', screenPointer);
  console.log('Canvas:', canvasPointer);
}
```

### Configurable Canvas Background (Color, Gradient, Image)
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
import { Rect } from 'react-konva';
import { useStore } from './store';

interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    colorStops: Array<{ offset: number; color: string }>;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  imageUrl?: string;
}

function CanvasBackground() {
  const { canvasWidth, canvasHeight, background } = useStore();

  if (background.type === 'color') {
    return (
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        fill={background.color || '#1a1a1a'}
        listening={false}
      />
    );
  }

  if (background.type === 'gradient' && background.gradient) {
    // Konva supports fillLinearGradientColorStops
    return (
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        fillLinearGradientStartPoint={{ x: background.gradient.startX, y: background.gradient.startY }}
        fillLinearGradientEndPoint={{ x: background.gradient.endX, y: background.gradient.endY }}
        fillLinearGradientColorStops={background.gradient.colorStops.flatMap(stop => [stop.offset, stop.color])}
        listening={false}
      />
    );
  }

  // Image background would use Konva.Image with fillPatternImage
  return null;
}
```

### Zustand Store with Zundo Configuration
```typescript
// Source: https://github.com/charkour/zundo
import { create } from 'zustand';
import { temporal, TemporalState } from 'zundo';

interface StoreState {
  // Canvas state
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;

  // Viewport state (not tracked by undo)
  scale: number;
  offsetX: number;
  offsetY: number;

  // Actions
  setCanvasDimensions: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  setViewport: (scale: number, x: number, y: number) => void;
}

export const useStore = create<StoreState>()(
  temporal(
    (set) => ({
      // Initial state
      canvasWidth: 800,
      canvasHeight: 600,
      backgroundColor: '#1a1a1a',
      scale: 1,
      offsetX: 0,
      offsetY: 0,

      // Actions
      setCanvasDimensions: (width, height) =>
        set({ canvasWidth: width, canvasHeight: height }),
      setBackgroundColor: (color) =>
        set({ backgroundColor: color }),
      setViewport: (scale, x, y) =>
        set({ scale, offsetX: x, offsetY: y }),
    }),
    {
      // Zundo configuration
      limit: 50,
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      partialize: (state) => {
        // Only track canvas state in undo history
        const { scale, offsetX, offsetY, setViewport, ...trackedState } = state;
        return trackedState;
      },
    }
  )
);

// Access undo/redo
// const undo = useStore.temporal.getState().undo;
// const redo = useStore.temporal.getState().redo;
// const { pastStates, futureStates } = useStore.temporal.getState();
```

### Testing Coordinate Transformations at Multiple Zoom Levels
```typescript
// Test pattern for coordinate system correctness
import { describe, it, expect } from 'vitest';
import { screenToCanvas, canvasToScreen } from './utils/coordinates';

describe('Coordinate transformations', () => {
  const testCases = [
    { scale: 0.25, name: 'zoomed out 4x' },
    { scale: 1, name: 'no zoom' },
    { scale: 4, name: 'zoomed in 4x' },
  ];

  testCases.forEach(({ scale, name }) => {
    it(`should round-trip screen→canvas→screen at ${name}`, () => {
      const viewport = { scale, offsetX: 100, offsetY: 50 };
      const screen = { x: 500 as ScreenX, y: 300 as ScreenY };

      const canvas = screenToCanvas(screen, viewport);
      const backToScreen = canvasToScreen(canvas, viewport);

      expect(backToScreen.x).toBeCloseTo(screen.x);
      expect(backToScreen.y).toBeCloseTo(screen.y);
    });
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for all state | Zustand for client state + React Query for server state | 2023-2024 | Smaller bundles, less boilerplate, better DX |
| Canvas API directly | react-konva declarative components | 2020+ | React patterns, easier maintenance, declarative |
| Manual undo with full snapshots | Temporal middleware with partial state | 2022+ (zundo 2.0) | Memory efficient, configurable, smaller bundle |
| Context API for global state | Zustand without providers | 2023+ | No re-render issues, better performance |
| Class components for canvas | Functional components with hooks | 2019+ React Hooks | Cleaner code, better composition |

**Deprecated/outdated:**
- **react-konva v17 and below:** Context compatibility issues, fixed in v18.2.2+
- **Zustand v3:** Used different middleware API, v4+ required for zundo compatibility
- **Manual useSyncExternalStore:** Zustand v5 uses React 18's native version, no external package needed

## Open Questions

Things that couldn't be fully resolved:

1. **react-konva exact performance characteristics with 500+ shapes**
   - What we know: Performance degrades with 100+ shapes, optimization needed at 500+
   - What's unclear: Exact thresholds for different optimization strategies (layer splitting, caching)
   - Recommendation: Implement with conservative limits (3-5 layers, cache complex shapes), profile with real content in Phase 3+

2. **Best practices for canvas background image patterns with zoom**
   - What we know: Can use `fillPatternImage` with Konva.Image, needs proper scaling
   - What's unclear: How to prevent pattern distortion at extreme zoom levels, memory implications
   - Recommendation: Implement simple color/gradient first (Phase 1 success criteria), defer image patterns to Phase 6 if needed

3. **zundo interaction with React DevTools**
   - What we know: zundo integrates with Zustand DevTools extension
   - What's unclear: Performance impact of DevTools with 50-state history, production recommendations
   - Recommendation: Enable DevTools in development only, test with limit=50 in production build

4. **TypeScript strict mode compatibility with react-konva refs**
   - What we know: Konva.Stage type available, refs work with TypeScript
   - What's unclear: Strictest TypeScript settings may require additional type assertions
   - Recommendation: Start with standard `tsconfig.json` strict: true, tighten if no issues

## Sources

### Primary (HIGH confidence)
- [GitHub: pmndrs/zustand](https://github.com/pmndrs/zustand) - Official Zustand repository
- [Zustand Slices Pattern](https://github.com/pmndrs/zustand/blob/main/docs/guides/slices-pattern.md) - Official slice pattern guide
- [GitHub: charkour/zundo](https://github.com/charkour/zundo) - Official zundo temporal middleware
- [Konva Getting Started](https://konvajs.org/docs/react/index.html) - Official react-konva documentation
- [Konva Zooming Relative to Pointer](https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html) - Official zoom implementation pattern
- [Konva Relative Pointer Position](https://konvajs.org/docs/sandbox/Relative_Pointer_Position.html) - Official coordinate conversion
- [Konva Performance Tips](https://konvajs.org/docs/performance/All_Performance_Tips.html) - Official performance guide
- [Konva Shape Caching](https://konvajs.org/docs/performance/Shape_Caching.html) - Official caching guide
- [MDN: Coordinate Systems](https://developer.mozilla.org/en-US/docs/Web/API/CSSOM_view_API/Coordinate_systems) - Web coordinate system reference
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns) - Official CSS Grid utilities

### Secondary (MEDIUM confidence)
- [React-Konva Releases](https://github.com/konvajs/react-konva/releases) - Version history, verified v18 vs v19 React compatibility
- [Zustand Releases](https://github.com/pmndrs/zustand/releases) - Version history, v5.0.10 current
- [LogRocket: Canvas Manipulation with React Konva](https://blog.logrocket.com/canvas-manipulation-react-konva/) - React-konva patterns
- [Medium: React Konva Performance Tuning](https://j5.medium.com/react-konva-performance-tuning-52e70ab15819) - Community performance patterns
- [Harrison Milbradt: Canvas Panning and Zooming](https://harrisonmilbradt.com/blog/canvas-panning-and-zooming) - Zoom UI pattern explanation
- [dnd-kit Documentation](https://docs.dndkit.com) - Official drag-drop library docs for Phase 2+

### Tertiary (LOW confidence)
- Various blog posts and tutorials about Zustand best practices - used for pattern validation only
- Community discussions about react-konva performance - used to identify pitfall categories
- WebSearch results about TypeScript coordinate systems - used for concept validation, not specific implementations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified from official sources, versions confirmed from releases
- Architecture: HIGH - Patterns sourced from official documentation and established practices
- Pitfalls: HIGH - Cross-verified from official GitHub issues, multiple community sources, and official docs

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable ecosystem, but check for security updates)

**Notes:**
- react-konva version constraint is critical - must revalidate if upgrading to React 19
- Coordinate system patterns are universal but formulas specific to Konva's transform model
- Performance characteristics may vary with actual UI element complexity - profile in Phase 3+
