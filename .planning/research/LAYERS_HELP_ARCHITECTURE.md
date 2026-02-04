# Architecture: Layers Panel and Help System Integration

**Research Focus:** Integration of layers panel and help features into existing Zustand/React architecture
**Project:** VST3 WebView UI Designer
**Researched:** 2026-01-29
**Confidence:** HIGH (based on codebase analysis)

---

## Executive Summary

The existing architecture is well-suited for adding a layers panel and enhanced help system. Key integration points:

1. **Layers Panel**: Builds on existing `ElementsSlice` z-order actions, requires UI state slice for visibility/filtering, integrates with LeftPanel tab system
2. **Help System**: Extends existing `HelpPanel` component, uses existing keyboard shortcut patterns
3. **No store schema changes needed**: Existing `elements` array order already determines z-order; existing selection system works unchanged

**Recommended approach:** Minimal new state (UI preferences only), maximum reuse of existing patterns.

---

## Current Architecture Overview

### Relevant Store Slices

```
src/store/
  index.ts          - Combined store with 10 slices
  elementsSlice.ts  - Elements CRUD + z-order + selection (KEY)
  windowsSlice.ts   - Multi-window support, element-window binding
  canvasSlice.ts    - Viewport, grid settings
  viewportSlice.ts  - Scale, offset, panning state
```

### Current Z-Order System (ElementsSlice)

The store already has complete z-order actions:

```typescript
// src/store/elementsSlice.ts lines 29-32
moveToFront: (id: string) => void
moveToBack: (id: string) => void
moveForward: (id: string) => void
moveBackward: (id: string) => void
```

**How z-order works today:**
- `elements` array order = render order (last = top)
- Move operations manipulate array index positions
- Canvas renders elements in array order (bottom to top)

**Key insight:** No schema change needed. The layers panel is a UI view of existing state.

### Current Selection System

```typescript
// src/store/elementsSlice.ts
selectedIds: string[]              // Multi-select support
lastSelectedId: string | null      // For range select
selectElement: (id: string) => void
toggleSelection: (id: string) => void
addToSelection: (id: string) => void
clearSelection: () => void
selectMultiple: (ids: string[]) => void
```

**Selection works bidirectionally:** Canvas click selects, layers panel click should also select (same action).

### Current Panel Layout

```
+------------------+------------------------+------------------+
|    LeftPanel     |        Canvas          |   RightPanel     |
|    (250px)       |       (flexible)       |    (300px)       |
+------------------+------------------------+------------------+
| Logo/title       |                        | SaveLoadPanel    |
| Undo/Redo        |  Window Viewport       | ExportPanel      |
| Tab: Elements    |  Elements render here  | Lock All toggle  |
| Tab: Assets      |                        | Properties       |
| (content area)   |  Zoom indicator        | Canvas/Grid      |
| Import Template  |                        | HelpPanel        |
+------------------+------------------------+------------------+
                   | WindowTabs             |
                   +------------------------+
```

**Where Layers Panel fits:** As a third tab in LeftPanel alongside "Elements" and "Assets".

---

## Layers Panel Architecture

### Option A: Tab in LeftPanel (RECOMMENDED)

**Integration point:** `src/components/Layout/LeftPanel.tsx`

```
LeftPanel
  [Elements] [Assets] [Layers]   <-- Add third tab
     ^          ^        ^
  Palette   AssetLib  LayersPanel (NEW)
```

**Rationale:**
- Consistent with existing tab pattern
- LeftPanel already has tab state management
- Layers are related to element palette (similar mental model)
- No layout changes needed

**Implementation approach:**

```typescript
// LeftPanel.tsx modification
const [activeTab, setActiveTab] = useState<'elements' | 'assets' | 'layers'>('elements')

// In render:
{activeTab === 'elements' && <Palette />}
{activeTab === 'assets' && <AssetLibraryPanel />}
{activeTab === 'layers' && <LayersPanel />}
```

### Option B: Collapsible panel at bottom of LeftPanel

**Integration:** Similar to how HelpPanel sits at bottom of RightPanel.

**Rationale:** Always visible, doesn't replace palette access.

**Drawback:** Reduces vertical space; clutters LeftPanel.

**Not recommended** for primary layers panel. Could work as a "mini layers" overlay.

### Option C: Floating/draggable panel

**Integration:** Rendered at App level, outside layout grid.

**Rationale:** Most flexible positioning.

**Drawback:** Adds complexity; inconsistent with app's clean 3-panel design.

**Not recommended** unless user requests floating windows feature.

---

## Layers Panel Component Structure

### New Components Needed

```
src/components/Layers/
  LayersPanel.tsx       - Main container, renders list
  LayerItem.tsx         - Single element row
  LayerGroup.tsx        - Container/hierarchy display (optional)
  index.ts              - Exports
```

### LayersPanel.tsx Design

```typescript
// Key responsibilities:
// 1. Display elements in reverse z-order (top layer first in UI)
// 2. Show visibility/lock icons
// 3. Handle selection via click
// 4. Handle drag-reorder for z-order changes
// 5. Filter to current window's elements

interface LayersPanelProps {
  // None needed - reads from store directly
}

function LayersPanel() {
  const elements = useStore(state => state.elements)
  const selectedIds = useStore(state => state.selectedIds)
  const activeWindow = useStore(state => state.getActiveWindow())
  const selectElement = useStore(state => state.selectElement)
  const updateElement = useStore(state => state.updateElement)
  const moveToFront = useStore(state => state.moveToFront)
  // ...

  // Filter elements to current window
  const windowElements = elements.filter(el =>
    activeWindow?.elementIds.includes(el.id)
  )

  // Reverse for display (top layer = first in list)
  const displayElements = [...windowElements].reverse()

  // ...
}
```

### LayerItem.tsx Design

```typescript
interface LayerItemProps {
  element: ElementConfig
  isSelected: boolean
  depth: number  // For container children indentation
  onSelect: (id: string, event: React.MouseEvent) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onRename: (id: string, newName: string) => void
  // Drag handle for reordering
}

// Visual elements per row:
// [drag handle] [visibility eye] [lock icon] [type icon] [name] [...]
```

### Data Flow

```
                 Store (elementsSlice)
                         |
          +--------------+---------------+
          |                              |
    Canvas (reads)               LayersPanel (reads)
          |                              |
    Renders elements             Shows layer list
          |                              |
    Click selects  <------------------>  Click selects
          |                              |
    Same selectElement() action
```

**Critical:** Both Canvas and LayersPanel must use the same store actions. No separate "layers state".

---

## UI State Slice (Optional)

For layers panel preferences that shouldn't trigger undo:

```typescript
// src/store/uiSlice.ts (NEW - only if needed)
interface UISlice {
  // Layers panel preferences
  layersPanelCollapsed: Record<string, boolean>  // Which containers are collapsed
  layersShowHidden: boolean                       // Show elements with visible=false
  layersSearchQuery: string                       // Filter by name

  // Help panel state (if persistent)
  helpPanelExpanded: boolean
}
```

**Note:** This is optional. Can start without and add when preferences are needed.

**Undo exclusion:** Add UI state to `partialize` in store/index.ts:

```typescript
partialize: (state) => {
  const {
    // ... existing exclusions
    layersPanelCollapsed, layersShowHidden, layersSearchQuery,
    ...rest
  } = state
  return rest
}
```

---

## Help System Architecture

### Current State: HelpPanel.tsx

Already exists at `src/components/Layout/HelpPanel.tsx`:
- Collapsible panel at bottom of RightPanel
- Shows keyboard shortcuts organized by category
- Uses local state for expand/collapse

**Location in layout:** Bottom of RightPanel, always available.

### Enhancement Options

#### Option A: Expand existing HelpPanel (RECOMMENDED)

Add contextual help to existing panel:

```typescript
// Enhanced HelpPanel structure
<HelpPanel>
  {/* Existing: Keyboard Shortcuts section */}
  <ShortcutsSection expanded={shortcutsExpanded} />

  {/* NEW: Contextual help based on selection */}
  <ContextualHelpSection element={selectedElement} />

  {/* NEW: Quick tips / workflow guides */}
  <TipsSection />
</HelpPanel>
```

**Pros:** Single location for all help, consistent with current design.

#### Option B: Tooltip-based help system

Add help tooltips throughout UI:

```typescript
// Wrap interactive elements with tooltip
<Tooltip content="Drag to resize">
  <ResizeHandle />
</Tooltip>
```

**Pros:** In-context, discoverable.
**Cons:** Can clutter UI; need careful placement.

#### Option C: Dedicated Help modal/overlay

Full-screen or modal help:

```typescript
// Triggered by F1 or Help menu
<HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)}>
  <SearchableDocumentation />
</HelpModal>
```

**Pros:** Complete documentation without cluttering workspace.
**Cons:** Interrupts workflow; heavy implementation.

### Recommended Help Strategy

**Phase 1:** Enhance existing HelpPanel with:
1. More keyboard shortcut categories
2. Workflow tips section
3. Link to external documentation

**Phase 2 (optional):** Add hover tooltips on:
1. Palette items (explain what element does)
2. Property inputs (explain what property controls)
3. Toolbar buttons (explain functionality)

---

## Integration Points Summary

### Files to Modify

| File | Change | Purpose |
|------|--------|---------|
| `src/components/Layout/LeftPanel.tsx` | Add "Layers" tab | Tab navigation |
| `src/components/Layout/HelpPanel.tsx` | Expand sections | Enhanced help |
| `src/store/index.ts` | (Optional) Add UISlice | Preferences |
| `src/components/Layout/index.ts` | Export LayersPanel | Module exports |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/Layers/LayersPanel.tsx` | Main layers panel container |
| `src/components/Layers/LayerItem.tsx` | Single layer row component |
| `src/components/Layers/index.ts` | Barrel exports |

### No Changes Needed

| File | Why |
|------|-----|
| `src/store/elementsSlice.ts` | Z-order actions already exist |
| `src/types/elements/base.ts` | visible/locked already on BaseElementConfig |
| `src/components/Canvas/Canvas.tsx` | Already filters by visible, already respects z-order |
| `src/App.tsx` | No layout changes needed |

---

## Build Order Recommendation

### Phase 1: Basic Layers Panel

1. **Create LayersPanel component** - List view of elements
2. **Create LayerItem component** - Row with name, type icon
3. **Integrate into LeftPanel** - Add as third tab
4. **Wire up selection** - Click layer = select element

**Deliverable:** Viewable layers list, clickable selection.

### Phase 2: Layer Interactions

1. **Add visibility toggle** - Eye icon to toggle element.visible
2. **Add lock toggle** - Lock icon to toggle element.locked
3. **Add inline rename** - Double-click to edit name

**Deliverable:** Full layer management without z-order changes.

### Phase 3: Z-Order Drag & Drop

1. **Add drag-reorder support** - Use @dnd-kit (already in project)
2. **Wire to z-order actions** - Drag maps to moveToFront/moveBackward/etc
3. **Add context menu** - Right-click for z-order options

**Deliverable:** Full layers panel with drag reordering.

### Phase 4: Help System Enhancements

1. **Expand HelpPanel sections** - More shortcuts, tips
2. **Add contextual help** - Help based on selection
3. **(Optional) Add tooltips** - Hover help throughout UI

---

## Component Diagrams

### Layers Panel Data Flow

```
                    +-----------------+
                    |     Store       |
                    | elementsSlice   |
                    +-----------------+
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
    +----------+     +----------+     +-------------+
    |  Canvas  |     | Layers   |     | Properties  |
    |          |     |  Panel   |     |    Panel    |
    +----------+     +----------+     +-------------+
          |                 |                 |
          +--------+--------+--------+--------+
                   |        |        |
                   v        v        v
               selectElement()
               updateElement()
               moveToFront()
               etc.
```

### LeftPanel Tab Structure

```
+----------------------------------+
|  [Elements] [Assets] [Layers]    |  <-- Tab bar
+----------------------------------+
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |   Tab Content Area         |  |
|  |                            |  |
|  |   - Palette (Elements)     |  |
|  |   - AssetLibrary (Assets)  |  |
|  |   - LayersPanel (Layers)   |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
|  [Import Template]               |  <-- Always visible
+----------------------------------+
```

### LayerItem Structure

```
+------------------------------------------------------------------+
| [drag] [eye] [lock]  [icon]  Layer Name                   [...]  |
|   ^      ^      ^       ^         ^                          ^   |
|   |      |      |       |         |                          |   |
| drag   visible locked  type    editable                  context |
| handle toggle  toggle  icon    text                       menu   |
+------------------------------------------------------------------+
  ^
  |
  indentation for container children
```

---

## Pattern Recommendations

### Use Existing Patterns

1. **Store access pattern** - Same as PropertyPanel and Canvas

```typescript
// Prefer selector functions for derived state
const windowElements = useStore(useCallback(
  (state) => {
    const activeWindow = state.getActiveWindow()
    return state.elements.filter(el =>
      activeWindow?.elementIds.includes(el.id)
    )
  },
  []
))
```

2. **Selection handling** - Same as Element.tsx

```typescript
const handleClick = (e: React.MouseEvent) => {
  if (e.shiftKey) {
    addToSelection(elementId)
  } else if (e.ctrlKey || e.metaKey) {
    toggleSelection(elementId)
  } else {
    selectElement(elementId)
  }
}
```

3. **Inline editing** - Same as WindowTabs.tsx

```typescript
const [editingId, setEditingId] = useState<string | null>(null)
const [editingName, setEditingName] = useState('')

// Double-click to edit
const handleDoubleClick = () => {
  setEditingId(element.id)
  setEditingName(element.name)
}

// Blur/Enter to save
const handleRenameSubmit = () => {
  if (editingId && editingName.trim()) {
    updateElement(editingId, { name: editingName.trim() })
  }
  setEditingId(null)
}
```

### Drag & Drop with @dnd-kit

Project already uses @dnd-kit for palette drag. Reuse for layer reordering:

```typescript
import { DndContext, closestCenter, KeyboardSensor, PointerSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'

function LayersPanel() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      // Calculate new position and use z-order actions
      // Note: Need to translate drag position to z-order action
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={elementIds} strategy={verticalListSortingStrategy}>
        {elements.map(el => <SortableLayerItem key={el.id} element={el} />)}
      </SortableContext>
    </DndContext>
  )
}
```

---

## Risk Assessment

### Low Risk

- **Tab integration** - LeftPanel already supports tabs
- **Selection sync** - Uses existing store actions
- **Basic layer list** - Standard list rendering
- **Help panel expansion** - Existing component, just add content

### Medium Risk

- **Drag-reorder** - Need to map drag position to z-order action (multiple approaches exist)
- **Container hierarchy** - Displaying nested elements (children inside panels) requires depth tracking
- **Performance** - List virtualization may be needed for 100+ elements

### Mitigation

1. **Drag-reorder:** Start with context menu z-order ("Send to Back", etc.), add drag later
2. **Container hierarchy:** Use `parentId` on elements to build tree, indent children
3. **Performance:** Add react-window virtualization if list exceeds ~50 items

---

## Confidence Assessment

| Component | Confidence | Notes |
|-----------|------------|-------|
| Tab integration | HIGH | Proven pattern in codebase |
| Layer selection | HIGH | Reuses existing actions |
| Visibility/lock toggle | HIGH | Properties already exist |
| Z-order context menu | HIGH | Store actions exist |
| Drag reorder | MEDIUM | Needs translation layer |
| Container hierarchy | MEDIUM | parentId exists but not commonly used |
| Help expansion | HIGH | Straightforward component changes |

---

## Success Criteria

Layers panel complete when:
- [ ] Layers appear as tab in LeftPanel
- [ ] Clicking layer selects element on canvas
- [ ] Selecting element on canvas highlights in layers panel
- [ ] Visibility toggle hides/shows element
- [ ] Lock toggle prevents element selection/movement
- [ ] Can rename layers inline
- [ ] Can reorder layers (context menu minimum, drag preferred)
- [ ] Container children shown indented (if applicable)

Help system complete when:
- [ ] HelpPanel shows all keyboard shortcuts
- [ ] HelpPanel shows workflow tips
- [ ] (Optional) Property inputs have hover tooltips
