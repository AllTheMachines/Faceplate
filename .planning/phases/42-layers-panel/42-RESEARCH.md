# Phase 42: Layers Panel - Research

**Researched:** 2026-01-29
**Domain:** User-created layer organization system with drag-drop reordering, visibility/lock toggles, and bidirectional selection sync
**Confidence:** HIGH

## Summary

This phase implements a user-created layer organization system similar to Photoshop layer groups (not Figma's auto-per-element approach). Users manually create named layers, assign elements to them, and control visibility/lock/z-order at the layer level.

The standard approach uses **react-arborist** (already installed v3.4.3) configured as a flat list with drag-drop reordering. State management follows the existing Zustand slice pattern. Inline editing uses double-click-to-edit pattern with Enter/Escape handling. Layer colors use a fixed palette of 7-8 standard options. Selection synchronization requires bidirectional state updates between canvas and layers panel.

**Primary recommendation:** Use react-arborist in flat list mode (no nesting) with controlled state, implement layers as a new Zustand slice following the windowsSlice pattern, and sync selection bidirectionally through the existing selectedIds state.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-arborist | 3.4.3 | List rendering with drag-drop | Industry standard for layer panels, virtualized for performance, built-in drag-drop and inline editing |
| Zustand | 5.0.10 | State management for layers | Already used throughout codebase, slice pattern fits layer state perfectly |
| react-konva | 18.2.14 | Canvas rendering | Already in use, provides Transformer styling for layer color indicators on selection handles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hot-toast | 2.6.0 | User feedback | Already in use - show toast on destructive layer deletion |
| react-hotkeys-hook | 5.2.3 | Keyboard shortcuts | Already in use - implement H key visibility toggle |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-arborist | Custom drag-drop list | Arborist provides virtualization, keyboard nav, accessibility - custom solution would require rebuilding these |
| react-arborist | @dnd-kit/sortable | @dnd-kit is already installed but lacks inline editing, virtualization, and tree view foundations |
| Fixed color palette | Color picker | Fixed palette matches Photoshop convention, prevents color confusion, simpler UX |

**Installation:**
No new dependencies required - all libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── Layers/
│       ├── LayersPanel.tsx         # Main panel component (tab in LeftPanel)
│       ├── LayerRow.tsx            # Individual layer row render
│       └── DeleteLayerDialog.tsx   # Confirmation dialog for destructive delete
├── store/
│   └── layersSlice.ts              # Layer state management
└── types/
    └── layer.ts                     # Layer type definitions
```

### Pattern 1: Zustand Slice for Layer State
**What:** Create a layersSlice following the same pattern as windowsSlice and elementsSlice
**When to use:** For all layer state management (CRUD, selection, reordering)

**Example:**
```typescript
// Source: Existing codebase pattern (windowsSlice.ts)
import { StateCreator } from 'zustand'

export interface Layer {
  id: string
  name: string
  color: LayerColor
  visible: boolean
  locked: boolean
  order: number // Explicit order field for z-index calculation
  createdAt: number
}

export interface LayersSlice {
  // State
  layers: Layer[]
  selectedLayerId: string | null

  // Actions
  addLayer: (name: string, color: LayerColor) => string
  removeLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  reorderLayers: (startIndex: number, endIndex: number) => void
  toggleVisibility: (id: string) => void
  toggleLock: (id: string) => void

  // Selectors
  getLayerById: (id: string) => Layer | undefined
  getLayersInOrder: () => Layer[]
  getDefaultLayer: () => Layer
}

export const createLayersSlice: StateCreator<LayersSlice, [], [], LayersSlice> = (
  set,
  get
) => ({
  layers: [
    {
      id: 'default',
      name: 'Default',
      color: 'gray',
      visible: true,
      locked: false,
      order: 0,
      createdAt: Date.now()
    }
  ],
  selectedLayerId: null,

  addLayer: (name, color) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name,
      color,
      visible: true,
      locked: false,
      order: get().layers.length, // Add at top
      createdAt: Date.now()
    }
    set(state => ({ layers: [...state.layers, newLayer] }))
    return newLayer.id
  },

  reorderLayers: (startIndex, endIndex) => {
    const layers = [...get().layers]
    // Prevent moving default layer
    if (layers[startIndex]?.id === 'default') return

    const [removed] = layers.splice(startIndex, 1)
    layers.splice(endIndex, 0, removed!)

    // Recalculate order fields
    const reordered = layers.map((layer, idx) => ({
      ...layer,
      order: idx
    }))
    set({ layers: reordered })
  },

  // ... other actions
})
```

### Pattern 2: Flat List with react-arborist
**What:** Configure react-arborist for flat list (no nesting) with drag-drop
**When to use:** For the LayersPanel list rendering

**Example:**
```typescript
// Source: react-arborist documentation + flat list pattern
import { Tree } from 'react-arborist'

function LayersPanel() {
  const layers = useStore(state => state.getLayersInOrder())

  // Transform layers to arborist data format (flat)
  const data = layers.map(layer => ({
    id: layer.id,
    name: layer.name,
    layer: layer // Attach full layer object
  }))

  return (
    <Tree
      data={data}
      openByDefault={false}
      disableDrop={(args) => {
        // Prevent dropping on default layer or reordering it
        const dragNode = args.dragNodes[0]
        return dragNode?.data.layer.id === 'default'
      }}
      onMove={(args) => {
        const startIndex = args.dragIds[0] // Original index
        const endIndex = args.parentId ? args.index : args.index
        useStore.getState().reorderLayers(startIndex, endIndex)
      }}
      onRename={(args) => {
        useStore.getState().updateLayer(args.id, { name: args.name })
      }}
      width={300}
      height="100%"
    >
      {(props) => <LayerRow {...props} />}
    </Tree>
  )
}
```

### Pattern 3: Inline Editing with Double-Click
**What:** Toggle between view and edit modes on double-click, save on Enter/blur, cancel on Escape
**When to use:** For layer name editing

**Example:**
```typescript
// Source: Existing codebase (InlineEditName.tsx)
function LayerRow({ node, style, dragHandle }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(node.data.name)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus and select all on edit
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed === '') {
      setEditValue(node.data.name) // Revert if empty
    } else if (trimmed !== node.data.name) {
      node.submit(trimmed) // Arborist rename handler
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(node.data.name)
      setIsEditing(false)
    }
  }

  return (
    <div style={style} ref={dragHandle}>
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>
          {node.data.name}
        </span>
      )}
    </div>
  )
}
```

### Pattern 4: Bidirectional Selection Sync
**What:** Sync selection state between canvas and layers panel in both directions
**When to use:** For LAYER-06 (click layer selects canvas) and LAYER-07 (canvas selection highlights layer)

**Example:**
```typescript
// Source: React state management patterns + codebase elementsSlice
// In LayersPanel:
function LayersPanel() {
  const selectedIds = useStore(state => state.selectedIds)
  const selectElement = useStore(state => state.selectElement)

  // Get layer for selected element (canvas → layers)
  const selectedElementLayer = useStore(state => {
    const firstSelectedId = state.selectedIds[0]
    if (!firstSelectedId) return null
    const element = state.getElement(firstSelectedId)
    return element?.layerId || 'default'
  })

  // Update layers panel selected state
  useEffect(() => {
    if (selectedElementLayer) {
      useStore.getState().updateLayer(selectedElementLayer, { /* highlight */ })
    }
  }, [selectedElementLayer])

  return (
    <Tree
      data={data}
      onActivate={(node) => {
        // layers → canvas: Select first element in clicked layer
        const elementsInLayer = useStore.getState().elements
          .filter(el => el.layerId === node.id)
        if (elementsInLayer[0]) {
          selectElement(elementsInLayer[0].id)
        }
      }}
    />
  )
}
```

### Pattern 5: Layer Color Indicators on Selection Handles
**What:** Use Konva Transformer styling to show layer color on selected elements
**When to use:** For showing which layer an element belongs to when selected on canvas

**Example:**
```typescript
// Source: Konva Transformer documentation
function TransformerComponent({ selectedElement }) {
  const element = useStore(state => state.getElement(selectedElement))
  const layer = useStore(state => state.getLayerById(element?.layerId))

  // Map layer color to hex
  const layerColorHex = LAYER_COLOR_MAP[layer?.color || 'gray']

  return (
    <Transformer
      nodes={[shapeRef.current]}
      borderStroke={layerColorHex} // Layer color on border
      borderStrokeWidth={2}
      anchorFill="#fff"
      anchorStroke={layerColorHex} // Layer color on anchors
      anchorStrokeWidth={2}
      anchorSize={8}
      anchorCornerRadius={4}
    />
  )
}
```

### Anti-Patterns to Avoid
- **Storing z-index on elements directly:** Layer order determines z-index. Don't let elements override it.
- **Allowing default layer to be reordered:** Default layer must stay at bottom (order: 0).
- **Deleting layer without confirmation:** Destructive action (deletes all elements in layer) - always confirm.
- **Using hover for editable indication:** Mobile users can't hover - use double-click for edit.
- **Nesting layers:** This phase is flat layer list only - no parent/child layer relationships.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-drop list | Custom drag handlers | react-arborist | Handles virtualization, keyboard nav, accessibility, drop indicators |
| Inline editing | contentEditable div | Controlled input pattern | contentEditable has browser inconsistencies, security issues, caret position bugs |
| Keyboard shortcuts | Manual keydown listeners | react-hotkeys-hook | Already in codebase, handles key combos, conflicts, scope |
| Confirmation dialogs | Custom modal state | Existing dialog pattern | Codebase likely has dialog pattern, reuse for consistency |
| Z-index calculation | Manual sorting | Array index as order | Array order = render order in React, explicit order field prevents bugs |

**Key insight:** Layer systems have many edge cases (default layer immutability, drag-drop constraints, z-order synchronization). Libraries like react-arborist have solved these through years of community testing.

## Common Pitfalls

### Pitfall 1: Z-Index Array Position Confusion
**What goes wrong:** Using array index directly as z-index causes rendering bugs when layers reorder
**Why it happens:** Array indices change during splice operations, causing elements to jump z-levels unexpectedly
**How to avoid:** Use an explicit `order` field on each layer, recalculate after reorder operations
**Warning signs:** Elements render in wrong order after dragging layers, default layer appears on top

### Pitfall 2: Deleting Layer Without User Awareness
**What goes wrong:** User deletes layer thinking it only removes the organizational container, loses all elements in that layer
**Why it happens:** Layer deletion is destructive (deletes all child elements), but UI doesn't communicate this clearly
**How to avoid:** Show confirmation dialog stating "Delete layer 'X' and all N elements inside it?" with explicit count
**Warning signs:** User reports unexpected element deletion, undo requests after layer deletion

### Pitfall 3: Bidirectional Selection Infinite Loop
**What goes wrong:** Selection sync between canvas and layers creates infinite update loop
**Why it happens:** Canvas selection triggers layer highlight, layer highlight triggers canvas selection, repeat
**How to avoid:** Use conditional updates - only update if new value differs from current value, or use a selection source flag
**Warning signs:** Browser hangs on selection, React warns about infinite setState loops

### Pitfall 4: Mobile Inline Editing Accessibility
**What goes wrong:** Users on touch devices can't rename layers because double-click doesn't exist
**Why it happens:** Inline edit relies on double-click event, which doesn't translate to touch
**How to avoid:** Provide context menu "Rename" option as alternative, or detect touch and use single-tap-hold
**Warning signs:** Mobile users report inability to rename, no alternative input method visible

### Pitfall 5: Locked Layer Confusion
**What goes wrong:** Users try to delete or modify locked layer elements and receive no feedback
**Why it happens:** Lock state prevents move/resize but UI doesn't indicate why action failed
**How to avoid:** Show visual lock indicator on canvas elements, toast notification "Element locked - unlock layer to edit"
**Warning signs:** Users report "elements won't move," confusion about lock vs visibility

### Pitfall 6: Default Layer Deletion
**What goes wrong:** User deletes default layer, orphans all unassigned elements
**Why it happens:** No UI protection preventing default layer deletion
**How to avoid:** Disable delete button when default layer selected, show tooltip "Default layer cannot be deleted"
**Warning signs:** Elements disappear from canvas, "undefined layer" errors in console

### Pitfall 7: react-arborist Flat List Nesting Attempts
**What goes wrong:** User drags layer onto another layer, creates nested structure when phase requirement is flat list
**Why it happens:** react-arborist defaults to allowing nesting, `disableDrop` callback not configured
**How to avoid:** Configure `disableDrop` to return true when drop would create parent-child relationship
**Warning signs:** Layers indent unexpectedly, layer hierarchy appears when it shouldn't

## Code Examples

Verified patterns from official sources:

### Layer Color Palette (7 Standard Colors)
```typescript
// Source: Photoshop layer colors convention (7 colors)
// https://bjango.com/articles/layertags/
export type LayerColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'gray'

export const LAYER_COLOR_MAP: Record<LayerColor, string> = {
  red: '#ef4444',      // Tailwind red-500
  orange: '#f97316',   // Tailwind orange-500
  yellow: '#eab308',   // Tailwind yellow-500
  green: '#22c55e',    // Tailwind green-500
  blue: '#3b82f6',     // Tailwind blue-500
  purple: '#a855f7',   // Tailwind purple-500
  gray: '#6b7280',     // Tailwind gray-500 (default)
}
```

### Visibility Toggle with Keyboard Shortcut
```typescript
// Source: react-hotkeys-hook pattern + codebase
import { useHotkeys } from 'react-hotkeys-hook'

function LayersPanel() {
  const selectedLayerId = useStore(state => state.selectedLayerId)
  const toggleVisibility = useStore(state => state.toggleVisibility)

  // H key toggles visibility of selected layer
  useHotkeys('h', () => {
    if (selectedLayerId) {
      toggleVisibility(selectedLayerId)
    }
  }, { enabled: !!selectedLayerId })

  return (
    <div>
      {/* Layer list */}
    </div>
  )
}
```

### Destructive Delete Confirmation
```typescript
// Source: UX best practices for destructive actions
// https://www.nngroup.com/articles/confirmation-dialog/
function DeleteLayerDialog({ layerId, onClose }) {
  const layer = useStore(state => state.getLayerById(layerId))
  const elements = useStore(state =>
    state.elements.filter(el => el.layerId === layerId)
  )

  const handleDelete = () => {
    // Delete all elements in layer first
    elements.forEach(el => useStore.getState().removeElement(el.id))
    // Then delete layer
    useStore.getState().removeLayer(layerId)
    onClose()
  }

  return (
    <dialog role="alertdialog" aria-modal="true">
      <h2>Delete Layer?</h2>
      <p>
        Delete layer "{layer?.name}" and all {elements.length} element(s) inside it?
        This action cannot be undone.
      </p>
      <div>
        <button onClick={onClose} autoFocus>Cancel</button>
        <button onClick={handleDelete} className="destructive">Delete</button>
      </div>
    </dialog>
  )
}
```

### Z-Order Calculation from Layer Order
```typescript
// Source: PixiJS render order pattern + existing elementsSlice z-order actions
function calculateZIndex(element: ElementConfig): number {
  const layers = useStore.getState().getLayersInOrder()
  const layer = layers.find(l => l.id === element.layerId)

  if (!layer) return 0 // Default layer

  // Layer order determines base z-index (higher order = higher z)
  const layerBaseZ = layer.order * 1000

  // Within layer, elements render in creation order
  const elementsInLayer = useStore.getState().elements
    .filter(el => el.layerId === layer.id)
    .sort((a, b) => a.createdAt - b.createdAt)

  const elementIndexInLayer = elementsInLayer.findIndex(el => el.id === element.id)

  return layerBaseZ + elementIndexInLayer
}
```

### Element Assignment via Context Menu
```typescript
// Source: Codebase pattern for context menus
function CanvasContextMenu({ elementId, x, y, onClose }) {
  const layers = useStore(state => state.getLayersInOrder())
  const element = useStore(state => state.getElement(elementId))

  const handleMoveToLayer = (layerId: string) => {
    useStore.getState().updateElement(elementId, { layerId })
    onClose()
  }

  return (
    <div className="context-menu" style={{ left: x, top: y }}>
      <div className="submenu">
        <span>Move to Layer</span>
        <div className="submenu-items">
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => handleMoveToLayer(layer.id)}
              className={element?.layerId === layer.id ? 'active' : ''}
            >
              <span className="color-dot" style={{ backgroundColor: LAYER_COLOR_MAP[layer.color] }} />
              {layer.name}
              {element?.layerId === layer.id && ' ✓'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auto-per-element layers (Figma) | User-created grouping layers (Photoshop) | Context decision | Manual layer creation gives user control over organization |
| contentEditable inline editing | Controlled input with state | 2020+ | Avoids browser inconsistencies, security issues |
| Hover for edit affordance | Double-click to edit | Mobile era | Touch devices can't hover, double-click works cross-platform |
| Global z-index property | Layer-based z-order | 2015+ (design tools) | Simplifies z-management, prevents z-index conflicts |
| react-dnd for drag-drop | react-arborist | 2022+ | Arborist provides virtualization, keyboard nav, tree foundations |

**Deprecated/outdated:**
- contentEditable for inline editing: Security risks, caret position bugs, browser inconsistencies
- react-dnd: Still maintained but react-arborist provides higher-level abstractions for layer panels
- Storing z-index per element: Modern layer systems use layer order to determine render order

## Open Questions

Things that couldn't be fully resolved:

1. **Layer Color on Locked Elements**
   - What we know: Context decision says "elements show layer color on selection handles"
   - What's unclear: Should locked elements show layer color even when not selectable?
   - Recommendation: Show layer color on locked elements only when layer is selected in panel (visual feedback without allowing selection)

2. **Default Layer Rename Permission**
   - What we know: Default layer is fixed at bottom, cannot be reordered
   - What's unclear: Can default layer be renamed or is name also fixed?
   - Recommendation: Allow rename (users may want "Background" instead of "Default") but keep order constraint

3. **Layer Deletion of Default Layer**
   - What we know: Default layer is auto-created for unassigned elements
   - What's unclear: If user deletes default layer, recreate it automatically or prevent deletion?
   - Recommendation: Prevent deletion (disable delete button) - always need a layer for unassigned elements

4. **Multiple Element Selection Across Layers**
   - What we know: Users can select multiple elements on canvas (already implemented)
   - What's unclear: When multiple elements from different layers selected, which layer highlights in panel?
   - Recommendation: Highlight all layers that contain selected elements (multi-selection in layers panel)

## Sources

### Primary (HIGH confidence)
- react-arborist GitHub - https://github.com/brimdata/react-arborist
- react-arborist npm - https://www.npmjs.com/package/react-arborist (v3.4.3 verified)
- Konva Transformer Styling - https://konvajs.org/docs/select_and_transform/Transformer_Styling.html
- Zustand Slices Pattern - https://zustand.docs.pmnd.rs/guides/slices-pattern
- Existing codebase patterns (windowsSlice.ts, elementsSlice.ts, InlineEditName.tsx)

### Secondary (MEDIUM confidence)
- LogRocket inline editing best practices - https://blog.logrocket.com/build-inline-editable-ui-react/
- NN/G confirmation dialogs - https://www.nngroup.com/articles/confirmation-dialog/
- Photoshop layer colors - https://bjango.com/articles/layertags/
- MDN z-index stacking - https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Understanding_z-index

### Tertiary (LOW confidence)
- WebSearch results for layer color palettes (verified concept exists but specific colors chosen from Tailwind for consistency)
- Figma keyboard shortcuts (H for visibility toggle - verified in Figma but not universal convention)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified in package.json, versions confirmed
- Architecture: HIGH - Patterns verified in existing codebase (windowsSlice, InlineEditName), react-arborist docs reviewed
- Pitfalls: MEDIUM - Based on WebSearch findings + general React/state management knowledge, not phase-specific testing
- Code examples: HIGH - Derived from official documentation and existing codebase patterns

**Research date:** 2026-01-29
**Valid until:** ~30 days (2026-02-28) - Libraries are stable, no major version changes expected
