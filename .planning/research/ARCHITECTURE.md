# Architecture Patterns: Canvas-Based Visual Design Tools

**Domain:** Visual Design Tool (Figma-like Canvas Editor)
**Researched:** 2026-01-23
**Confidence:** MEDIUM (based on web search findings, community patterns, and technical documentation)

## Executive Summary

Canvas-based design tools like Figma follow a **layered architecture** with clear separation between document model (business logic), rendering layer (canvas), and UI controls (React components). The core pattern is a **scene graph/document model** that represents the design as a hierarchical tree, with unidirectional data flow from state updates to canvas rendering.

For your VST3 WebView UI Designer, the recommended architecture uses:
- **Zustand** for centralized state management (document, selection, history)
- **React-Konva** for declarative canvas rendering with React integration
- **@dnd-kit** for drag-and-drop with custom collision detection
- **Command Pattern** for undo/redo via zundo middleware
- **Scene Graph** for element hierarchy and transformations

## Recommended Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────┬─────────────────────┬─────────────────────┤
│  Element        │   Canvas            │   Property          │
│  Palette        │   Editor            │   Panel             │
│  (UI Layer)     │   (Rendering)       │   (UI Layer)        │
└────────┬────────┴──────────┬──────────┴──────────┬──────────┘
         │                   │                      │
         └───────────────────┼──────────────────────┘
                             ▼
                  ┌──────────────────────┐
                  │   Zustand Store      │
                  │  (Single Source of   │
                  │   Truth)             │
                  ├──────────────────────┤
                  │ • Document Model     │
                  │ • Selection State    │
                  │ • Canvas State       │
                  │ • History (undo)     │
                  └──────────────────────┘
                             ▼
                  ┌──────────────────────┐
                  │   Scene Graph        │
                  │  (Element Tree)      │
                  ├──────────────────────┤
                  │ Root                 │
                  │  └─ Group            │
                  │      ├─ Slider       │
                  │      └─ Knob         │
                  └──────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | State Access |
|-----------|---------------|-------------------|--------------|
| **ElementPalette** | Display draggable component templates | @dnd-kit DragOverlay, Zustand (read) | None (presentational) |
| **CanvasEditor** | Render design surface, handle interactions | React-Konva Stage/Layer, Zustand (read/write) | Document, Selection, Canvas |
| **PropertyPanel** | Display/edit selected element properties | Zustand (read/write) | Selection, Document (via commands) |
| **DocumentStore** | Manage element tree, properties | Command handlers | Document state slice |
| **SelectionStore** | Track selected elements, multi-select | Event handlers | Selection state slice |
| **CanvasStore** | Track zoom, pan, grid settings | Canvas event handlers | Canvas state slice |
| **HistoryStore** | Undo/redo via temporal middleware | Command pattern | Past/future states |
| **CommandProcessor** | Execute undoable operations | All stores | Dispatches state updates |
| **ExportEngine** | Generate HTML/CSS/JS + C++ code | Document model (read-only) | Snapshot of document |

### Data Flow

#### Property Change → Canvas Update Flow

```
User edits property in PropertyPanel
        ↓
Dispatch command (e.g., UpdatePropertyCommand)
        ↓
CommandProcessor executes command
        ↓
Zustand store updates document model
        ↓
React-Konva components re-render (reactive)
        ↓
Canvas displays updated element
```

#### Drag from Palette Flow

```
User drags element from ElementPalette
        ↓
@dnd-kit DragOverlay shows preview
        ↓
Drop on canvas (collision detection)
        ↓
Dispatch AddElementCommand with canvas coordinates
        ↓
CommandProcessor adds element to document tree
        ↓
Zustand updates document state
        ↓
Canvas renders new element
        ↓
Auto-select new element
```

#### Selection State Flow

```
User clicks element on canvas
        ↓
Canvas onClick handler captures event
        ↓
Check modifier keys (Shift/Cmd for multi-select)
        ↓
Dispatch SelectionCommand
        ↓
SelectionStore updates selected IDs
        ↓
Canvas re-renders with selection indicators
        ↓
PropertyPanel updates to show selected properties
```

## Patterns to Follow

### Pattern 1: Scene Graph / Document Model
**What:** Hierarchical tree structure representing all design elements, similar to DOM but optimized for canvas rendering.

**Why:** Provides natural parent-child relationships for grouping, transformations cascade down the tree (move group → children move), and supports efficient tree traversal for rendering and hit detection.

**Structure:**
```typescript
interface Element {
  id: string;
  type: 'slider' | 'knob' | 'label' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, unknown>;
  children?: Element[];
}

interface DocumentModel {
  root: Element; // Root container
  version: string;
  metadata: {
    name: string;
    createdAt: string;
    modifiedAt: string;
  };
}
```

**When:** Use for all element storage. Every element lives in the tree.

**Sources:**
- [Scene graph architecture in Konva](https://medium.com/@www.blog4j.com/konva-js-vs-fabric-js-in-depth-technical-comparison-and-use-case-analysis-9c247968dd0f)
- [Paper.js Document Object Model](https://sourceforge.net/projects/paper-js.mirror/)

### Pattern 2: Command Pattern for Undo/Redo
**What:** Encapsulate each operation (add element, delete, move, property change) as a command object with `execute()` and `undo()` methods.

**Why:** Enables reliable undo/redo without complex state snapshots, groups related operations into transactions, and provides clear audit trail of user actions.

**Implementation:**
```typescript
interface Command {
  execute: () => void;
  undo: () => void;
}

class UpdatePropertyCommand implements Command {
  constructor(
    private elementId: string,
    private propertyPath: string,
    private newValue: unknown,
    private oldValue: unknown
  ) {}

  execute() {
    // Update element property in store
    documentStore.updateProperty(
      this.elementId,
      this.propertyPath,
      this.newValue
    );
  }

  undo() {
    // Revert to old value
    documentStore.updateProperty(
      this.elementId,
      this.propertyPath,
      this.oldValue
    );
  }
}
```

**With Zustand + Zundo:**
```typescript
import { temporal } from 'zundo';

const useDocumentStore = create(
  temporal(
    (set) => ({
      elements: [],
      updateProperty: (id, path, value) =>
        set((state) => {
          // Use immer middleware for immutable updates
          state.elements.find(e => e.id === id)[path] = value;
        })
    }),
    {
      limit: 50, // Keep 50 history states
      equality: (a, b) => a === b,
    }
  )
);

// Usage
const { undo, redo } = useDocumentStore.temporal.getState();
```

**When:** For all user-initiated state changes. Read-only operations (zoom, pan) don't need commands.

**Sources:**
- [Command Pattern for Undo/Redo](https://www.esveo.com/en/blog/undo-redo-and-the-command-pattern/)
- [Zundo: Zustand temporal middleware](https://github.com/charkour/zundo)

### Pattern 3: Separation of Concerns (Presentation-Domain-Data)
**What:** Split application into distinct layers: View (React components), Domain (business logic), Data (state management).

**Why:** Enables testing business logic without UI, allows reuse of domain logic across different views, and makes it easier to replace rendering layer (e.g., switch from Konva to Fabric).

**Example Structure:**
```typescript
// Domain Layer - Pure business logic
class ElementTransformer {
  static resize(element: Element, width: number, height: number): Element {
    return { ...element, width, height };
  }

  static move(element: Element, dx: number, dy: number): Element {
    return { ...element, x: element.x + dx, y: element.y + dy };
  }
}

// View Layer - Pure presentation
const KnobElement: React.FC<{ element: Element }> = ({ element }) => {
  const updateProperty = useDocumentStore(state => state.updateProperty);

  return (
    <Circle
      x={element.x}
      y={element.y}
      radius={element.properties.size / 2}
      fill={element.properties.color}
      onClick={() => /* Selection logic */}
    />
  );
};

// Data Layer - State management
const useDocumentStore = create((set) => ({
  elements: [],
  resizeElement: (id, width, height) =>
    set((state) => ({
      elements: state.elements.map(el =>
        el.id === id ? ElementTransformer.resize(el, width, height) : el
      )
    }))
}));
```

**When:** Always. Every feature should think: "Where does this logic belong?"

**Sources:**
- [Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html)
- [React separation of concerns patterns](https://www.carmatec.com/blog/the-best-react-design-patterns-to-know-about/)

### Pattern 4: Atomic State Management with Zustand
**What:** Use fine-grained state slices instead of monolithic store. Separate document, selection, canvas, and history concerns.

**Why:** Components only re-render when their specific state slice changes, prevents unnecessary canvas re-renders on unrelated state changes, and easier to reason about state dependencies.

**Implementation:**
```typescript
// Separate stores for different concerns
const useDocumentStore = create<DocumentState>()(
  immer(
    temporal(
      (set) => ({
        elements: [],
        addElement: (element) => set((state) => {
          state.elements.push(element);
        }),
        updateElement: (id, updates) => set((state) => {
          const el = state.elements.find(e => e.id === id);
          Object.assign(el, updates);
        })
      })
    )
  )
);

const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  select: (id, multi = false) => set((state) => ({
    selectedIds: multi
      ? [...state.selectedIds, id]
      : [id]
  })),
  clearSelection: () => set({ selectedIds: [] })
}));

const useCanvasStore = create<CanvasState>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 10,
  showGrid: true,
  setZoom: (zoom) => set({ zoom }),
  pan: (dx, dy) => set((state) => ({
    panX: state.panX + dx,
    panY: state.panY + dy
  }))
}));
```

**When:** From the start. Define stores by concern, not by component.

**Sources:**
- [Zustand atomic state patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [Jotai vs Zustand comparison](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

### Pattern 5: Declarative Canvas with React-Konva
**What:** Treat canvas elements as React components. Props drive rendering, no imperative canvas API calls.

**Why:** Leverages React's reconciliation for efficient updates, easier to reason about (props in → pixels out), and integrates naturally with React DevTools.

**Implementation:**
```typescript
const CanvasEditor: React.FC = () => {
  const elements = useDocumentStore(state => state.elements);
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const { zoom, panX, panY } = useCanvasStore();

  return (
    <Stage width={800} height={600}>
      <Layer
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
      >
        {elements.map(element => (
          <ElementRenderer
            key={element.id}
            element={element}
            selected={selectedIds.includes(element.id)}
          />
        ))}
        {selectedIds.length > 0 && (
          <SelectionOverlay elementIds={selectedIds} />
        )}
      </Layer>
    </Stage>
  );
};
```

**Key Principle:** Konva is to react-konva what DOM is to React. Don't mix imperative Konva API with React-Konva components.

**When:** Always for rendering. Use refs only for reading canvas pixels or advanced features.

**Sources:**
- [React-Konva getting started](https://konvajs.org/docs/react/index.html)
- [Declarative canvas patterns](https://www.turing.com/kb/canvas-components-in-react)

### Pattern 6: Custom Collision Detection for Canvas Drop
**What:** Extend @dnd-kit's collision detection to convert screen coordinates to canvas coordinates, accounting for zoom/pan.

**Why:** Default collision detection doesn't understand canvas transformations. Need to project mouse position into canvas space.

**Implementation:**
```typescript
import { pointerWithin } from '@dnd-kit/core';

const canvasCollisionDetection = (args) => {
  const canvasStore = useCanvasStore.getState();
  const { zoom, panX, panY } = canvasStore;

  // Transform pointer coordinates to canvas space
  const canvasX = (args.pointerCoordinates.x - panX) / zoom;
  const canvasY = (args.pointerCoordinates.y - panY) / zoom;

  // Check if within canvas bounds
  return pointerWithin({
    ...args,
    pointerCoordinates: { x: canvasX, y: canvasY }
  });
};

<DndContext
  collisionDetection={canvasCollisionDetection}
  onDragEnd={handleDragEnd}
>
  {/* ... */}
</DndContext>
```

**When:** Required for drag-from-palette feature. Canvas transformations break default collision detection.

**Sources:**
- [@dnd-kit collision detection algorithms](https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms)
- [@dnd-kit custom strategies](https://docs.dndkit.com/api-documentation/context-provider)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Prop Drilling Through Component Tree
**What:** Passing callbacks and state through 5+ layers of components to reach canvas elements.

**Why bad:** Creates tight coupling, makes refactoring difficult, causes unnecessary re-renders of intermediate components, and obscures data flow.

**Instead:** Use Zustand stores directly in leaf components. Zustand provides direct store access without context drilling.

```typescript
// BAD - Prop drilling
<Canvas
  onElementClick={handleElementClick}
  onElementDrag={handleElementDrag}
  selectedIds={selectedIds}
/>

// GOOD - Direct store access
const KnobElement = ({ element }) => {
  const select = useSelectionStore(state => state.select);
  const updatePosition = useDocumentStore(state => state.updatePosition);

  return <Circle onClick={() => select(element.id)} />;
};
```

### Anti-Pattern 2: Storing Canvas-Specific State in Document Model
**What:** Adding zoom, pan, grid visibility to the document JSON that gets saved.

**Why bad:** Pollutes document format with UI concerns, makes export harder (need to strip UI state), and different users may want different zoom levels for same document.

**Instead:** Separate document state (what gets saved) from canvas state (ephemeral UI).

```typescript
// BAD - Mixed concerns
interface Document {
  elements: Element[];
  zoom: number; // UI state!
  gridVisible: boolean; // UI state!
}

// GOOD - Clear separation
interface Document {
  elements: Element[];
  version: string;
  metadata: { name: string };
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  gridVisible: boolean;
}
```

### Anti-Pattern 3: Imperative Canvas Updates
**What:** Calling Konva imperative API (`node.setAttr()`, `layer.draw()`) instead of using React state.

**Why bad:** Bypasses React's reconciliation, creates out-of-sync state between React and canvas, makes debugging impossible (React DevTools don't see changes), and undo/redo won't work.

**Instead:** Always update via state. React-Konva handles rendering.

```typescript
// BAD - Imperative
const circleRef = useRef();
circleRef.current.setAttr('x', 100);
circleRef.current.getLayer().draw();

// GOOD - Declarative
const updatePosition = useDocumentStore(state => state.updatePosition);
updatePosition(elementId, 100, 50);
```

### Anti-Pattern 4: Over-Rendering Canvas on Every State Change
**What:** Re-rendering entire canvas when only one element's property changes.

**Why bad:** Canvas rendering is expensive, causes jank and dropped frames, and makes tool feel sluggish.

**Instead:** Use Zustand selectors to subscribe only to specific state slices, memoize element renderers, and leverage Konva's layer caching.

```typescript
// BAD - Re-renders everything
const CanvasEditor = () => {
  const store = useDocumentStore(); // Subscribes to all changes!

  return (
    <Stage>
      <Layer>
        {store.elements.map(el => <Element {...el} />)}
      </Layer>
    </Stage>
  );
};

// GOOD - Selective subscriptions
const CanvasEditor = () => {
  const elements = useDocumentStore(state => state.elements); // Only elements

  return (
    <Stage>
      <Layer>
        {elements.map(el => <MemoizedElement key={el.id} element={el} />)}
      </Layer>
    </Stage>
  );
};

const MemoizedElement = React.memo(({ element }) => {
  const isSelected = useSelectionStore(
    state => state.selectedIds.includes(element.id)
  );

  return <ElementRenderer element={element} selected={isSelected} />;
});
```

### Anti-Pattern 5: Monolithic Command Objects
**What:** Creating one massive `UpdateElementCommand` that handles all property changes with complex conditional logic.

**Why bad:** Hard to test specific operations, undo/redo becomes brittle, and violates single responsibility principle.

**Instead:** Create specific command classes for each operation type.

```typescript
// BAD - God object
class UpdateElementCommand {
  execute() {
    if (this.type === 'move') { /* ... */ }
    else if (this.type === 'resize') { /* ... */ }
    else if (this.type === 'color') { /* ... */ }
    // 50 more conditions...
  }
}

// GOOD - Focused commands
class MoveElementCommand { /* ... */ }
class ResizeElementCommand { /* ... */ }
class UpdateColorCommand { /* ... */ }
```

## State Management Deep Dive

### Store Architecture

```typescript
// Document Store - Source of truth for design
interface DocumentState {
  elements: Element[];
  metadata: DocumentMetadata;
  // Actions
  addElement: (element: Element) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  moveElement: (id: string, x: number, y: number) => void;
}

// Selection Store - Tracks what's selected
interface SelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  // Actions
  select: (id: string, multi?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
}

// Canvas Store - Viewport settings
interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  // Actions
  setZoom: (zoom: number) => void;
  pan: (dx: number, dy: number) => void;
  toggleGrid: () => void;
}

// History managed by temporal middleware
const useDocumentStore = create(
  temporal(
    immer((set) => ({ /* ... */ })),
    { limit: 50 }
  )
);
```

### State Update Patterns

**Optimistic Updates (for smooth UX):**
```typescript
const handleDrag = (elementId: string, x: number, y: number) => {
  // Update immediately without waiting
  useDocumentStore.getState().moveElement(elementId, x, y);
};
```

**Batched Updates (for multi-select operations):**
```typescript
const deleteSelected = () => {
  const selectedIds = useSelectionStore.getState().selectedIds;

  // Batch into single history entry
  useDocumentStore.setState((state) => {
    selectedIds.forEach(id => {
      state.elements = state.elements.filter(el => el.id !== id);
    });
  });
};
```

**Derived State (computed values):**
```typescript
// Don't store selection bounds, compute from elements
const useSelectionBounds = () => {
  return useDocumentStore(state => {
    const selectedIds = useSelectionStore.getState().selectedIds;
    const selected = state.elements.filter(el =>
      selectedIds.includes(el.id)
    );

    return calculateBounds(selected);
  });
};
```

## Rendering Strategy

### Layer Organization

```typescript
<Stage width={width} height={height}>
  {/* Background layer - rarely changes */}
  <Layer>
    <Grid />
    <Guides />
  </Layer>

  {/* Content layer - elements */}
  <Layer>
    {elements.map(el => <ElementRenderer key={el.id} {...el} />)}
  </Layer>

  {/* Interaction layer - selection, handles */}
  <Layer>
    <SelectionBox />
    <ResizeHandles />
    <AlignmentGuides />
  </Layer>
</Stage>
```

**Why layered:** Konva caches layers. Background rarely re-renders, interaction layer updates frequently without redrawing elements.

### Performance Optimizations

**1. Virtualization (for large documents):**
Only render elements in viewport.

```typescript
const visibleElements = elements.filter(el => {
  return isInViewport(el, canvasState);
});
```

**2. Memoization:**
```typescript
const ElementRenderer = React.memo(({ element, selected }) => {
  // Only re-renders when element or selected changes
}, (prev, next) => {
  return prev.element === next.element && prev.selected === next.selected;
});
```

**3. Debounce expensive operations:**
```typescript
const debouncedAutoSave = useMemo(
  () => debounce((doc) => saveToLocalStorage(doc), 1000),
  []
);

useEffect(() => {
  debouncedAutoSave(document);
}, [document]);
```

## Export Architecture

### Code Generation Strategy

**Template-Based Generation:**
```typescript
interface ExportEngine {
  toHTML: (document: Document) => string;
  toCSS: (document: Document) => string;
  toJavaScript: (document: Document) => string;
  toCPP: (document: Document) => string; // VST3-specific
}

class HTMLExporter implements ExportEngine {
  toHTML(document: Document): string {
    const template = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ${this.renderElements(document.elements)}
</body>
</html>
    `;
    return template;
  }

  private renderElements(elements: Element[]): string {
    return elements.map(el => {
      const Component = elementTemplates[el.type];
      return Component.toHTML(el);
    }).join('\n');
  }
}
```

**VST3 C++ Generation:**
```typescript
class VST3Exporter {
  toCPP(document: Document): string {
    return `
// Auto-generated VST3 UI code
namespace Steinberg {
namespace Vst {

class PluginUI : public VSTGUIEditor {
  bool open(void* parent) override {
    ${this.generateUICode(document.elements)}
    return true;
  }
};

}} // namespaces
    `;
  }
}
```

### Serialization Format

**JSON Document Format:**
```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "My Plugin UI",
    "createdAt": "2026-01-23T10:00:00Z",
    "modifiedAt": "2026-01-23T10:30:00Z"
  },
  "elements": [
    {
      "id": "knob-1",
      "type": "knob",
      "x": 100,
      "y": 100,
      "width": 60,
      "height": 60,
      "properties": {
        "min": 0,
        "max": 100,
        "value": 50,
        "color": "#3498db",
        "label": "Gain"
      },
      "children": []
    }
  ]
}
```

**Migration Strategy:**
```typescript
const migrations = {
  '1.0.0': (doc) => doc,
  '1.1.0': (doc) => {
    // Add new properties with defaults
    return {
      ...doc,
      elements: doc.elements.map(el => ({
        ...el,
        properties: {
          ...el.properties,
          snapToGrid: el.properties.snapToGrid ?? true
        }
      }))
    };
  }
};
```

## Build Order Recommendations

Based on dependencies, build in this order:

### Phase 1: Foundation (Week 1-2)
**Goal:** Establish core architecture and state management.

1. **Setup Zustand stores** (document, selection, canvas)
2. **Define document model types** (Element interface, scene graph structure)
3. **Create basic React-Konva canvas** (Stage, Layer, simple shapes)
4. **Implement serialization** (save/load JSON)

**Why first:** Everything depends on state management and document model. Get this right before building features.

### Phase 2: Canvas Basics (Week 2-3)
**Goal:** Functional canvas with selection.

1. **Element rendering** (map document elements to Konva shapes)
2. **Click to select** (single selection)
3. **Visual selection indicators** (highlight selected element)
4. **Property panel scaffolding** (show selected element properties)

**Why next:** Establishes render loop and interaction foundation. Need working canvas before advanced features.

### Phase 3: Palette & Drag-Drop (Week 3-4)
**Goal:** Add elements to canvas.

1. **Element palette UI** (categorized component list)
2. **@dnd-kit integration** (draggable palette items)
3. **Custom collision detection** (canvas coordinate transformation)
4. **Drop to create element** (AddElementCommand)

**Why third:** Depends on canvas rendering. Need selection working to auto-select newly added elements.

### Phase 4: Property Editing (Week 4-5)
**Goal:** Edit element properties.

1. **Dynamic property forms** (type-aware inputs: color picker, number slider)
2. **Property update commands** (UpdatePropertyCommand)
3. **Real-time canvas updates** (property change → immediate render)

**Why fourth:** Requires working document model and canvas. Complex because property panel must adapt to selected element type.

### Phase 5: Transform Controls (Week 5-6)
**Goal:** Move and resize elements.

1. **Drag to move** (on-canvas dragging)
2. **Resize handles** (corner/edge handles)
3. **Multi-select** (Shift/Cmd click)
4. **Group transforms** (move/resize multiple elements)

**Why fifth:** Builds on selection. Multi-select adds significant complexity.

### Phase 6: Undo/Redo (Week 6-7)
**Goal:** History management.

1. **Integrate zundo middleware** (temporal wrapper on document store)
2. **Command pattern refinement** (ensure all operations are undoable)
3. **History UI** (undo/redo buttons, keyboard shortcuts)

**Why sixth:** Requires all commands to be defined. Easier to add after core features work.

### Phase 7: Canvas Controls (Week 7-8)
**Goal:** Navigation and snapping.

1. **Zoom (wheel, pinch)** and pan (space+drag)
2. **Grid rendering and snap-to-grid**
3. **Alignment guides** (snap to element edges)

**Why seventh:** Nice-to-have features. Core tool works without these.

### Phase 8: Export (Week 8-9)
**Goal:** Code generation.

1. **HTML/CSS export** (template-based generation)
2. **VST3 C++ export** (framework-specific templates)
3. **Export UI and preview**

**Why last:** Depends on stable document format. Export is read-only operation, doesn't affect core architecture.

## Scalability Considerations

| Concern | Small Projects (< 50 elements) | Medium Projects (50-500 elements) | Large Projects (500+ elements) |
|---------|-------------------------------|----------------------------------|-------------------------------|
| **Rendering** | Render all elements | Render all, memoize components | Viewport virtualization required |
| **Undo History** | 50 states in memory | 100 states, consider serializing old states | Use command pattern with minimal snapshots |
| **Selection** | Array of IDs | Set for O(1) lookup | Spatial index (quadtree) for click detection |
| **Serialization** | JSON.stringify | Incremental saves (only changed elements) | Stream-based serialization |
| **Search** | Linear scan | Linear scan with caching | Build search index on document load |

## Performance Targets

**Critical metrics for responsive feel:**
- Click to select: < 16ms (60fps)
- Property update to canvas render: < 16ms
- Undo/redo: < 50ms
- Drag feedback: < 16ms (60fps)
- Canvas pan/zoom: < 8ms (120fps on capable displays)
- Save document: < 200ms
- Load document: < 500ms

**Profiling points:**
- Zustand re-render subscriptions (use React DevTools Profiler)
- Canvas layer draw calls (Konva performance mode)
- Command execution time (console.time for complex operations)

## Technology Verification

**Stack Verification:**
- React 18: HIGH confidence (industry standard, documented)
- Zustand: HIGH confidence (30%+ YoY growth, 40%+ adoption in 2026 per web search)
- React-Konva: MEDIUM confidence (active development, scene graph architecture verified)
- @dnd-kit: HIGH confidence (official docs confirm modular architecture)
- Zundo: MEDIUM confidence (active project, <700B, temporal middleware for Zustand)

**Architecture Pattern Verification:**
- Scene graph: HIGH confidence (Konva's documented approach, game engine pattern)
- Command pattern for undo: HIGH confidence (classic pattern, verified in multiple sources)
- Separation of concerns: HIGH confidence (Martin Fowler article, industry best practice)
- Atomic state: MEDIUM confidence (Zustand/Jotai patterns from 2026 web search)

## Open Questions & Research Flags

**Low confidence areas needing phase-specific research:**

1. **VST3 C++ code generation specifics** - Need to research VST3 UI framework APIs during export phase
2. **Optimal grid snapping algorithm** - May need experimentation during canvas controls phase
3. **Keyboard shortcut handling** - Research best library (react-hotkeys-hook?) during UX polish phase
4. **Collaboration features** - If multi-user editing is future requirement, research CRDT libraries (Yjs, Automerge)

## Sources

### High Confidence (Official Documentation & Established Patterns)
- [React-Konva Official Docs](https://konvajs.org/docs/react/index.html) - Declarative canvas patterns
- [@dnd-kit Official Docs](https://docs.dndkit.com) - Modular drag-and-drop architecture
- [Zustand Official Docs](https://zustand.docs.pmnd.rs/integrations/third-party-libraries) - Third-party integrations
- [Martin Fowler: Modularizing React Apps](https://martinfowler.com/articles/modularizing-react-apps.html) - Separation of concerns

### Medium Confidence (Community Patterns & Technical Comparisons)
- [Konva.js vs Fabric.js Technical Comparison](https://medium.com/@www.blog4j.com/konva-js-vs-fabric-js-in-depth-technical-comparison-and-use-case-analysis-9c247968dd0f) - Scene graph architecture
- [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Zustand adoption trends
- [Command Pattern for Undo/Redo](https://www.esveo.com/en/blog/undo-redo-and-the-command-pattern/) - Pattern explanation
- [Zundo GitHub](https://github.com/charkour/zundo) - Temporal middleware implementation
- [Design Tool Canvas Architecture Guide](https://eleopardsolutions.com/develop-canvas-ui-like-figma/) - Figma-like patterns

### Low Confidence (Industry Trends, Require Verification)
- [React Design Patterns 2026](https://www.carmatec.com/blog/the-best-react-design-patterns-to-know-about/) - Modern React patterns
- [Design-to-Code Tools 2026](https://research.aimultiple.com/design-to-code/) - Code generation approaches
- [Sketch Canvas Tech Blog](https://www.sketch.com/blog/canvas-tech/) - Scene graph implementation (LIMITED - page content not fully extracted)

---

**Confidence Assessment:** MEDIUM overall. Core architectural patterns (scene graph, command pattern, separation of concerns) are HIGH confidence based on established best practices and official documentation. State management and rendering strategies are MEDIUM confidence based on community patterns and web search findings. VST3-specific export details are LOW confidence and flagged for phase-specific research.
