# Domain Pitfalls: Adding Layers Panel and Contextual Help

**Domain:** Design tool feature additions to existing VST3 WebView UI Designer
**Context:** Adding layers panel (reordering, visibility, locking) and help buttons (HTML documentation) to existing system with 100+ element types, multi-window projects, and container nesting
**Researched:** 2026-01-29
**Overall Confidence:** HIGH (Cross-referenced with codebase analysis and design tool UX research)

---

## Executive Summary

Adding a layers panel and contextual help system to an existing design tool creates **integration complexity** that is easy to underestimate. The layers panel must synchronize with:
- Existing selection state (selectedIds, lastSelectedId)
- Z-order operations (moveToFront, moveToBack, moveForward, moveBackward)
- Container hierarchy (parentId, children arrays)
- Multi-window architecture (each window has its own element list)
- Undo/redo history (zundo temporal middleware)
- Locked/visible element properties

The help system must integrate with:
- Existing HelpPanel.tsx (keyboard shortcuts)
- Property panels for all 100+ element types
- Tooltip element type (already exists in containers.ts)
- HTML content rendering (security concerns)

**Critical risks:**
1. **Selection desync**: Layers panel and canvas show different selections
2. **Z-order vs tree confusion**: Flat array z-order conflicts with container hierarchy
3. **Undo history pollution**: Layer visibility/lock changes fill undo stack
4. **Performance on large projects**: Rendering 100+ layer rows without virtualization
5. **Help content maintenance**: 100+ element types need help documentation

---

## Critical Pitfalls

Mistakes that cause rewrites or major architectural issues.

### Pitfall 1: Selection State Desynchronization Between Layers Panel and Canvas

**What goes wrong:**
The layers panel shows a list of elements. Users can click to select in the panel OR on the canvas. Without bidirectional synchronization:
- Select element on canvas, layers panel doesn't highlight it
- Select element in layers panel, canvas selection box doesn't appear
- Multi-select on canvas, layers panel shows only last selected
- Shift-click range select in layers panel, canvas shows wrong selection

Current codebase state:
```typescript
// elementsSlice.ts - Selection state
selectedIds: string[]
lastSelectedId: string | null

// Selection actions
selectElement: (id: string) => void
toggleSelection: (id: string) => void
addToSelection: (id: string) => void
clearSelection: () => void
selectMultiple: (ids: string[]) => void
```

**Why it happens:**
1. Layers panel implements its own "selected" state instead of using store
2. Click handlers don't dispatch to same selection actions as canvas
3. Selection rendering logic differs between panel and canvas
4. Race conditions when both panel and canvas update selection

**Consequences:**
- **User confusion**: "I clicked on the layer but the element didn't highlight"
- **Broken workflows**: Can't edit properties of element selected in layers panel
- **Multi-select failures**: Ctrl+click behaves differently in panel vs canvas
- **Testing complexity**: Must verify selection in two places

**Prevention:**

**Strategy 1: Single Source of Truth (Required)**
```typescript
// LayersPanel.tsx - CORRECT: Read from store, dispatch to store
function LayersPanel() {
  const selectedIds = useStore(state => state.selectedIds)
  const selectElement = useStore(state => state.selectElement)
  const toggleSelection = useStore(state => state.toggleSelection)

  const handleLayerClick = (id: string, event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      toggleSelection(id)
    } else if (event.shiftKey) {
      // Range select - use same logic as canvas
      selectRange(id)
    } else {
      selectElement(id)
    }
  }

  return (
    <div>
      {elements.map(el => (
        <LayerRow
          key={el.id}
          element={el}
          isSelected={selectedIds.includes(el.id)}
          onClick={(e) => handleLayerClick(el.id, e)}
        />
      ))}
    </div>
  )
}
```

**Strategy 2: Highlight Selected in Panel**
```typescript
// LayerRow.tsx - Visual feedback must match canvas
function LayerRow({ element, isSelected, onClick }) {
  return (
    <div
      className={cn(
        'layer-row',
        isSelected && 'bg-blue-500/20 border-l-2 border-blue-500'
      )}
      onClick={onClick}
    >
      {element.name}
    </div>
  )
}
```

**Strategy 3: Selection Scrolling**
```typescript
// When canvas selection changes, scroll layers panel to show selected
useEffect(() => {
  if (selectedIds.length === 1) {
    const layerRow = document.getElementById(`layer-${selectedIds[0]}`)
    layerRow?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}, [selectedIds])
```

**Detection:**
- Select element on canvas, check if layers panel highlights it
- Select in layers panel, check if canvas shows selection handles
- Multi-select in both directions
- Test Ctrl+click and Shift+click in both panel and canvas

**Warning signs:**
- LayersPanel component has its own useState for selection
- Different click handlers for panel vs canvas selection
- Properties panel doesn't respond to layers panel selection

**Phase Impact:**
**Phase 1 (Foundation)**: Selection sync is foundational. Must be correct before adding any other layers features.

---

### Pitfall 2: Z-Order vs Container Hierarchy Confusion

**What goes wrong:**
The project has two overlapping ordering systems:

1. **Z-order (flat array)**: Elements array order determines rendering order
   ```typescript
   elements: ElementConfig[]  // Index = visual stacking order
   moveToFront: (id: string) => void  // Moves to end of array
   moveToBack: (id: string) => void   // Moves to start of array
   ```

2. **Container hierarchy (tree)**: Containers have children arrays
   ```typescript
   // Container element
   {
     id: 'panel-1',
     type: 'panel',
     children: ['knob-1', 'slider-1']  // Child elements
   }

   // Child element
   {
     id: 'knob-1',
     parentId: 'panel-1'  // Back-reference to parent
   }
   ```

Users expect layers panel to show **tree structure** (Figma/Sketch style), but z-order operations work on **flat array**.

**Scenarios that break:**
- User drags "Knob" layer above "Panel" layer (should this move knob out of panel?)
- User tries to reorder elements within a container (z-order or children array?)
- Element is at end of flat array (visually on top) but inside a container (should render inside container bounds)
- Container is collapsed in layers panel, user moves element to front (where does it appear?)

**Why it happens:**
- Layers panel displays tree view based on parentId relationships
- Z-order operations modify flat array indices
- No clear mental model for how these interact
- Design tools solve this differently (Figma vs Photoshop vs Illustrator)

**Consequences:**
- **Unpredictable behavior**: Moving layers doesn't do what user expects
- **Visual glitches**: Element renders outside container bounds but appears inside in layers panel
- **Data corruption**: Children array and parentId get out of sync
- **Undo complexity**: Single drag operation might need multiple undo steps

**Prevention:**

**Strategy 1: Hierarchical Z-Order (Recommended for this project)**
```typescript
// Elements are grouped by container, z-order is relative within each group
// Root-level elements: z-order determines stacking
// Child elements: z-order determines stacking WITHIN parent

function getEffectiveZIndex(element: ElementConfig, elements: ElementConfig[]): number {
  if (!element.parentId) {
    // Root element: use flat array index
    return elements.indexOf(element)
  }

  // Child element: z-index is parent's z-index + child's local index
  const parent = elements.find(e => e.id === element.parentId)
  const container = parent as EditableContainer
  const localIndex = container.children?.indexOf(element.id) ?? 0

  return getEffectiveZIndex(parent!, elements) + (localIndex + 1) * 0.001
}

// Layers panel shows tree structure
// Drag-reorder within same parent: modify children array order
// Drag-reorder to different parent: update parentId AND children arrays
// Drag-reorder of root elements: modify elements array order
```

**Strategy 2: Clear UI for Hierarchy vs Z-Order**
```typescript
// Layers panel shows tree (hierarchy)
// Separate "Arrange" menu for z-order: Bring Forward, Send Backward
// Drag in layers panel ONLY changes tree structure, not z-order

<ContextMenu>
  <MenuItem onClick={() => moveForward(id)}>Bring Forward</MenuItem>
  <MenuItem onClick={() => moveBackward(id)}>Send Backward</MenuItem>
  <MenuItem onClick={() => moveToFront(id)}>Bring to Front</MenuItem>
  <MenuItem onClick={() => moveToBack(id)}>Send to Back</MenuItem>
</ContextMenu>

// Tree drag-drop only changes parent/children, not flat array order
```

**Strategy 3: Validate Hierarchy Consistency**
```typescript
// On every hierarchy change, validate consistency
function validateHierarchy(elements: ElementConfig[]): string[] {
  const errors: string[] = []

  for (const el of elements) {
    // Check parentId points to valid container
    if (el.parentId) {
      const parent = elements.find(e => e.id === el.parentId)
      if (!parent) {
        errors.push(`${el.name} has invalid parentId: ${el.parentId}`)
      } else if (!isEditableContainer(parent)) {
        errors.push(`${el.name} parent is not a container: ${parent.type}`)
      } else {
        const container = parent as EditableContainer
        if (!container.children?.includes(el.id)) {
          errors.push(`${el.name} not in parent's children array`)
        }
      }
    }
  }

  // Check children arrays point to valid elements
  for (const el of elements) {
    if (isEditableContainer(el)) {
      const container = el as EditableContainer
      for (const childId of container.children || []) {
        const child = elements.find(e => e.id === childId)
        if (!child) {
          errors.push(`${el.name} has invalid child: ${childId}`)
        } else if (child.parentId !== el.id) {
          errors.push(`${child.name} parentId doesn't match container`)
        }
      }
    }
  }

  return errors
}
```

**Detection:**
- Element appears inside container on canvas but outside in layers panel
- Moving layer causes element to "jump" visually on canvas
- Undo after layer move doesn't restore previous state
- Container editor shows different children than layers panel

**Warning signs:**
- Z-order operations modify flat array but don't update children arrays
- Layers panel drag-drop creates new elements instead of moving
- Children array in container has duplicates or missing entries

**Phase Impact:**
**Phase 1 (Foundation)**: Must define the mental model and implement hierarchical ordering before building drag-drop.

---

### Pitfall 3: Undo History Pollution from View State Changes

**What goes wrong:**
The existing undo system (zundo) tracks element changes. Layer visibility and lock toggles are element property changes:

```typescript
// BaseElementConfig includes:
locked: boolean
visible: boolean
```

Toggling visibility/lock creates undo history entries:
```typescript
// User clicks eye icon to hide element
updateElement(id, { visible: false })  // Creates undo entry

// User toggles 10 elements hidden → 10 undo entries
// User presses Ctrl+Z expecting to undo last edit → element becomes visible instead
```

This matches Rhino CAD user complaint: "When trying to undo the most recent change to a model using ctrl-z, users have to cycle back through any more recent layer state changes."

**Why it happens:**
Current partialize excludes some state from undo:
```typescript
// store/index.ts partialize function
partialize: (state) => {
  const {
    scale, offsetX, offsetY, isPanning, dragStart, lockAllMode,
    selectedIds, lastSelectedId, liveDragValues,
    // ... visibility and locked ARE tracked (not excluded)
  } = state
  return rest
}
```

Visibility and locked are considered "element state" not "view state" - but users often use them as view state (temporarily hide elements to work on background).

**Consequences:**
- **Undo stack polluted**: 50 visibility toggles fill up undo stack (limit: 50 entries)
- **Lost ability to undo edits**: Real edits pushed out by visibility changes
- **User frustration**: "I just want to undo my last move, not unhide 10 layers"
- **Inconsistent mental model**: Some view state (viewport, selection) excluded, some included

**Prevention:**

**Strategy 1: Separate View State from Document State**
```typescript
// New slice for layer view state (NOT tracked in undo)
interface LayerViewSlice {
  // Overrides that don't persist to save file
  hiddenInEditor: Set<string>  // Temporarily hidden (not in export)
  lockedInEditor: Set<string>  // Temporarily locked (not in export)
}

// Element's visible/locked = document state (exports correctly)
// hiddenInEditor/lockedInEditor = view state (local to session)

// Rendering respects both:
const isVisible = element.visible && !hiddenInEditor.has(element.id)
const isLocked = element.locked || lockedInEditor.has(element.id)
```

**Strategy 2: Batch Visibility Changes**
```typescript
// Group multiple visibility changes into single undo entry
const batchVisibilityChange = (ids: string[], visible: boolean) => {
  // Use temporal.pauseTracking to batch as single undo entry
  useStore.temporal.getState().pause()

  ids.forEach(id => {
    updateElement(id, { visible })
  })

  useStore.temporal.getState().resume()
  // Now Ctrl+Z undoes all visibility changes at once
}
```

**Strategy 3: Configurable Undo Behavior**
```typescript
// Let user choose whether visibility/lock changes are undoable
interface EditorPreferences {
  trackVisibilityInUndo: boolean  // Default: false
  trackLockingInUndo: boolean     // Default: false
}

// Modify updateElement to check preferences
const updateElement = (id: string, updates: Partial<ElementConfig>) => {
  const isViewStateOnly =
    Object.keys(updates).every(k => ['visible', 'locked'].includes(k))

  if (isViewStateOnly && !preferences.trackVisibilityInUndo) {
    // Update without creating undo entry
    set(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    }), false)  // false = don't create undo entry
  } else {
    // Normal update with undo tracking
    set(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    }))
  }
}
```

**Detection:**
- Undo history shows "update" entries for visibility changes
- Ctrl+Z after editing element unhides layers instead
- History panel (if exists) shows visibility toggles as separate entries
- Users complain about undo behavior

**Warning signs:**
- Layers panel toggles call updateElement directly
- No separation between document state and view state
- partialize function doesn't mention visibility/locked

**Phase Impact:**
**Phase 1 (Foundation)**: Decide view state strategy before implementing visibility/lock toggles. Changing later requires migrating save files.

---

### Pitfall 4: Layers Panel Performance with 100+ Elements

**What goes wrong:**
Design projects can have 100-500 elements. Naive layers panel implementation:
```typescript
// SLOW: Re-renders entire list on any element change
function LayersPanel() {
  const elements = useStore(state => state.elements)  // All elements

  return (
    <div>
      {elements.map(el => (
        <LayerRow key={el.id} element={el} />
      ))}
    </div>
  )
}
```

Performance issues:
- **React reconciliation**: 500 elements = 500 DOM diff operations on every change
- **Tree expansion**: Expanding/collapsing container traverses entire tree
- **Drag preview**: Dragging element re-renders entire list 60 times/second
- **Name editing**: Typing in layer name input lags

**Why it happens:**
- No virtualization (render all rows even if off-screen)
- No memoization (LayerRow re-renders even if element unchanged)
- Subscribed to entire elements array (any element change triggers re-render)

**Consequences:**
- **UI lag**: 100ms+ delay when clicking layer
- **Scroll jank**: Scrolling through 500 layers stutters
- **Unusable at scale**: Projects with 200+ elements become slow
- **Battery drain**: Constant re-rendering on laptops

**Prevention:**

**Strategy 1: Virtualized List (Required for 100+ elements)**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function LayersPanel() {
  const parentRef = useRef<HTMLDivElement>(null)
  const flattenedElements = useFlattenedTree(elements)  // Tree to flat list

  const virtualizer = useVirtualizer({
    count: flattenedElements.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,  // Row height
    overscan: 5,  // Render 5 extra rows above/below viewport
  })

  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <LayerRow
            key={flattenedElements[virtualRow.index].id}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
            element={flattenedElements[virtualRow.index]}
          />
        ))}
      </div>
    </div>
  )
}
```

**Strategy 2: Memoized Row Components**
```typescript
// Memoize LayerRow to prevent re-renders
const LayerRow = React.memo(function LayerRow({
  element,
  isSelected,
  depth,
  isExpanded,
  onToggleExpand
}) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      {element.children && (
        <button onClick={() => onToggleExpand(element.id)}>
          {isExpanded ? '-' : '+'}
        </button>
      )}
      <span>{element.name}</span>
    </div>
  )
}, (prev, next) => {
  // Custom comparison: only re-render if these changed
  return (
    prev.element.id === next.element.id &&
    prev.element.name === next.element.name &&
    prev.element.visible === next.element.visible &&
    prev.element.locked === next.element.locked &&
    prev.isSelected === next.isSelected &&
    prev.depth === next.depth &&
    prev.isExpanded === next.isExpanded
  )
})
```

**Strategy 3: Selective Subscriptions**
```typescript
// Subscribe to only what's needed
function useLayerRowData(elementId: string) {
  // Only re-renders when this specific element's relevant props change
  return useStore(
    state => {
      const el = state.elements.find(e => e.id === elementId)
      return el ? {
        name: el.name,
        visible: el.visible,
        locked: el.locked,
        type: el.type,
      } : null
    },
    shallow  // Shallow comparison
  )
}
```

**Strategy 4: Expansion State Outside Store**
```typescript
// Tree expansion is view state, keep in local component state
function LayersPanel() {
  // Don't put this in Zustand store - causes global re-renders
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])
}
```

**Detection:**
- Scroll layers panel with 100+ elements, check for stutter
- Profile with React DevTools: LayerRow components re-render excessively
- Measure time to expand/collapse container with many children
- Check CPU usage while layers panel is visible

**Warning signs:**
- LayersPanel subscribes to `state.elements` directly
- No React.memo on LayerRow component
- Tree expansion state stored in Zustand store
- No virtualization library in dependencies

**Phase Impact:**
**Phase 2 (Features)**: Implement virtualization from the start. Retrofitting virtualization to tree structure is complex.

---

### Pitfall 5: Multi-Window Element Filtering Bugs

**What goes wrong:**
The project has multi-window support:
```typescript
// windowsSlice.ts
windows: UIWindow[]  // Each window has elementIds: string[]
activeWindowId: string | null
```

Layers panel must show only elements in active window, but bugs occur:
- Showing elements from all windows (cluttered)
- Element in window A appears in window B's layers panel after switching
- Moving element via layers panel doesn't update window.elementIds
- Deleting element doesn't remove from window.elementIds

**Why it happens:**
```typescript
// BUG: Doesn't filter by window
const elements = useStore(state => state.elements)

// CORRECT: Filter by active window
const elements = useStore(state => {
  const activeWindow = state.getActiveWindow()
  if (!activeWindow) return []
  return state.elements.filter(el =>
    activeWindow.elementIds.includes(el.id)
  )
})
```

**Consequences:**
- **Wrong elements shown**: User sees elements from other windows
- **Failed operations**: Drag element to container in different window
- **Data corruption**: Element exists in elements[] but not in any window.elementIds
- **Export errors**: Window exports wrong elements

**Prevention:**

**Strategy 1: Always Filter by Active Window**
```typescript
// Create reusable selector
const selectActiveWindowElements = (state: Store) => {
  const activeWindow = state.windows.find(w => w.id === state.activeWindowId)
  if (!activeWindow) return []

  const elementSet = new Set(activeWindow.elementIds)
  return state.elements.filter(el => elementSet.includes(el.id))
}

// LayersPanel.tsx
function LayersPanel() {
  const elements = useStore(selectActiveWindowElements)
  // ...
}
```

**Strategy 2: Window Validation**
```typescript
// Validate element-window relationships
function validateWindowElements(state: Store): string[] {
  const errors: string[] = []
  const allWindowElementIds = new Set(
    state.windows.flatMap(w => w.elementIds)
  )

  // Check for orphaned elements (not in any window)
  for (const el of state.elements) {
    if (!allWindowElementIds.has(el.id)) {
      errors.push(`Element ${el.name} (${el.id}) not in any window`)
    }
  }

  // Check for dangling references (in window but element deleted)
  for (const window of state.windows) {
    for (const elementId of window.elementIds) {
      if (!state.elements.find(e => e.id === elementId)) {
        errors.push(`Window ${window.name} references deleted element: ${elementId}`)
      }
    }
  }

  return errors
}
```

**Strategy 3: Clear Window Context in UI**
```typescript
// Show which window is active
function LayersPanel() {
  const activeWindow = useStore(state => state.getActiveWindow())

  return (
    <div>
      <div className="panel-header">
        <span className="panel-title">Layers</span>
        <span className="window-badge">{activeWindow?.name}</span>
      </div>
      {/* Layer list */}
    </div>
  )
}
```

**Detection:**
- Switch windows, check if layers panel updates
- Create element in window A, switch to B, check it's not in B's layers
- Delete element, check window.elementIds is updated
- Move element between windows, verify both window elementIds arrays update

**Warning signs:**
- LayersPanel doesn't read activeWindowId from store
- Layer operations don't call addElementToWindow/removeElementFromWindow
- No window indicator in layers panel header

**Phase Impact:**
**Phase 1 (Foundation)**: Window filtering must be correct from start. Bugs here cause data corruption.

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 6: Context Menu Item Explosion for Layers

**What goes wrong:**
Layers panel needs context menu with many actions:
- Selection: Select, Add to Selection, Select All in Container
- Visibility: Hide, Show, Toggle, Hide Others, Show All
- Locking: Lock, Unlock, Toggle, Lock Others, Unlock All
- Z-Order: Bring Forward, Send Backward, Bring to Front, Send to Back
- Hierarchy: Move Into Container, Move Out of Container, Move to Window
- Editing: Rename, Duplicate, Delete, Copy, Paste
- Container: Expand All, Collapse All

**Total: 20+ context menu items**

User overwhelm and inconsistent keyboard shortcuts.

**Prevention:**

**Strategy 1: Grouped Submenus**
```typescript
<ContextMenu>
  <ContextMenuGroup label="Selection">
    <ContextMenuItem>Select</ContextMenuItem>
    <ContextMenuItem>Add to Selection</ContextMenuItem>
  </ContextMenuGroup>
  <ContextMenuSeparator />
  <ContextMenuSub label="Visibility">
    <ContextMenuItem>Hide</ContextMenuItem>
    <ContextMenuItem>Show</ContextMenuItem>
    <ContextMenuItem>Toggle</ContextMenuItem>
  </ContextMenuSub>
  <ContextMenuSub label="Lock">
    <ContextMenuItem>Lock</ContextMenuItem>
    <ContextMenuItem>Unlock</ContextMenuItem>
  </ContextMenuSub>
  {/* ... */}
</ContextMenu>
```

**Strategy 2: Keyboard Shortcuts**
```typescript
// Match Figma/Photoshop conventions
const LAYER_SHORTCUTS = {
  'Ctrl+H': 'toggleVisibility',      // Hide/Show
  'Ctrl+L': 'toggleLock',            // Lock/Unlock
  'Ctrl+]': 'bringForward',          // Bring Forward
  'Ctrl+[': 'sendBackward',          // Send Backward
  'Ctrl+Shift+]': 'bringToFront',    // Bring to Front
  'Ctrl+Shift+[': 'sendToBack',      // Send to Back
  'F2': 'rename',                    // Rename Layer
}
```

**Strategy 3: Inline Actions for Common Operations**
```typescript
// Most common actions as icons in layer row
<LayerRow>
  <VisibilityIcon onClick={toggleVisibility} />  {/* Eye icon */}
  <LockIcon onClick={toggleLock} />              {/* Lock icon */}
  <span>{element.name}</span>
</LayerRow>
// Context menu for less common actions
```

**Detection:**
- Context menu has more than 15 items without grouping
- No keyboard shortcuts for common layer operations
- Users report "too many options"

**Phase Impact:**
**Phase 2 (Features)**: Design context menu structure early. Adding items ad-hoc creates inconsistency.

---

### Pitfall 7: Help Content Maintenance for 100+ Element Types

**What goes wrong:**
Each element type needs help documentation:
- What the element does
- All configurable properties
- Common use cases
- Example configurations

With 100+ element types, this is 100+ help documents to:
- Write initially
- Keep synchronized with property changes
- Translate (if i18n needed)
- Display in consistent format

**Why it happens:**
- Documentation written once, then forgotten
- Properties added without updating help
- Different authors write in different styles
- No automation to detect staleness

**Consequences:**
- **Incomplete help**: Some elements have no documentation
- **Outdated help**: Help mentions properties that no longer exist
- **Inconsistent quality**: Some elements well-documented, others not
- **Maintenance burden**: Every property change needs help update

**Prevention:**

**Strategy 1: Generate Help from Type Definitions**
```typescript
// Extract property documentation from TSDoc comments
interface KnobElementConfig extends BaseElementConfig {
  type: 'knob'

  /** Diameter of the knob in pixels (20-400) */
  diameter: number

  /** Starting angle in degrees (-180 to 180) */
  startAngle: number

  /** Track color for unfilled portion */
  trackColor: string
}

// Build script extracts TSDoc comments → generates help content
// npm run generate-help
```

**Strategy 2: Help Template System**
```typescript
// Standardized help structure
interface ElementHelp {
  summary: string           // One-line description
  description: string       // Detailed explanation
  properties: PropertyHelp[] // Auto-generated from type
  examples: Example[]       // Manual: common configurations
  relatedElements: string[] // Links to similar elements
}

// PropertyHelp auto-generated from Zod schema
interface PropertyHelp {
  name: string
  type: string
  description: string      // From TSDoc
  constraints?: string     // From Zod schema (min, max, etc.)
  default?: string         // From factory function
}
```

**Strategy 3: Help Completeness Validation**
```typescript
// Build-time check that all elements have help
// scripts/validate-help.ts
import { ELEMENT_TYPES } from './types/elements'
import { ELEMENT_HELP } from './help/elementHelp'

const missingHelp = ELEMENT_TYPES.filter(
  type => !ELEMENT_HELP[type]
)

if (missingHelp.length > 0) {
  console.warn('Elements missing help:', missingHelp)
  // process.exit(1)  // Fail build if strict
}
```

**Strategy 4: Phased Help Development**
```typescript
// Priority levels for help content
// P0: Most-used elements (knob, slider, label) - must have complete help
// P1: Common elements (button, meter) - should have basic help
// P2: Specialized elements (modulation matrix) - can have minimal help

const HELP_PRIORITIES = {
  P0: ['knob', 'slider', 'button', 'label', 'meter', 'panel'],
  P1: ['checkbox', 'dropdown', 'frame', 'groupbox'],
  P2: ['modulationmatrix', 'presetbrowser', 'oscilloscope']
}
```

**Detection:**
- Click help button on element, see "No documentation available"
- Help mentions property that doesn't exist
- Help missing for new element type added recently
- Help styles/formatting inconsistent between elements

**Warning signs:**
- Help content stored as separate markdown files with no automation
- No TSDoc comments on element type properties
- Build doesn't validate help completeness
- Help written by multiple people with no style guide

**Phase Impact:**
**Phase 3 (Help System)**: Implement generation/validation infrastructure before writing help content.

---

### Pitfall 8: Help Popup HTML Security Vulnerabilities

**What goes wrong:**
Help content contains HTML for formatting:
```html
<p>The <strong>Knob</strong> element creates a rotary control.</p>
<img src="help/knob-example.png" alt="Knob example" />
<a href="https://docs.example.com/knobs">Learn more</a>
```

Risks:
- **XSS attacks**: Malicious HTML in help content (if user-editable)
- **Script injection**: `<script>` tags in help content
- **External resources**: Images/links load from untrusted sources
- **Styling attacks**: CSS that breaks parent layout

The project already has an HTML tooltip element (TooltipElementConfig) with similar concerns.

**Prevention:**

**Strategy 1: HTML Sanitization**
```typescript
import DOMPurify from 'dompurify'

const sanitizedHtml = DOMPurify.sanitize(helpContent, {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload']
})
```

**Strategy 2: Markdown Instead of HTML**
```typescript
import { marked } from 'marked'

// Help content as markdown (safer, easier to write)
const helpContent = `
# Knob Element

The **Knob** element creates a rotary control.

## Properties
- \`diameter\`: Size of the knob (20-400px)
- \`startAngle\`: Starting angle (-180 to 180)
`

const html = marked.parse(helpContent)
```

**Strategy 3: Content Security Policy**
```typescript
// Restrict what the help popup can do
<HelpPopup
  sandbox="allow-same-origin"  // If in iframe
  style={{
    // Prevent positioning attacks
    position: 'relative',
    maxHeight: '400px',
    overflow: 'auto'
  }}
>
  <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
</HelpPopup>
```

**Detection:**
- Try inserting `<script>alert(1)</script>` in help content
- Check if external images load
- Verify onclick handlers are stripped

**Warning signs:**
- Using `dangerouslySetInnerHTML` without sanitization
- Help content loaded from user-editable source without validation
- No Content Security Policy for help popup

**Phase Impact:**
**Phase 3 (Help System)**: Implement sanitization before displaying any HTML help content.

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 9: Drag and Drop State Leaks

**What goes wrong:**
Drag-drop for layer reordering can leave state in bad condition:
- Drag starts but mouse released outside panel → drag preview stuck
- Drag over invalid drop target → drop indicator shows incorrectly
- Multiple rapid drags → race conditions in state updates

**Prevention:**
```typescript
// Clean up drag state on unmount and edge cases
useEffect(() => {
  return () => {
    // Clean up any dangling drag state
    setDragState(null)
  }
}, [])

// Handle drag cancel (Escape key)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && dragState) {
      setDragState(null)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [dragState])
```

**Phase Impact:**
Minor annoyance, fix during testing.

---

### Pitfall 10: Help Button Placement Inconsistency

**What goes wrong:**
Help buttons appear in different locations:
- Some property sections have help button on right
- Some have it on left
- Some have it in header
- Some have tooltip-only help (no button)

Users can't develop muscle memory for where to find help.

**Prevention:**
```typescript
// Consistent PropertySection component with standard help button placement
function PropertySection({
  title,
  children,
  helpKey  // If provided, shows help button
}) {
  return (
    <div className="property-section">
      <div className="property-section-header">
        <span>{title}</span>
        {helpKey && (
          <HelpButton
            helpKey={helpKey}
            className="ml-auto"  // Always on right
          />
        )}
      </div>
      {children}
    </div>
  )
}
```

**Phase Impact:**
Design decision before implementing help buttons. Retrofit is cosmetic.

---

## Phase-Specific Warnings

| Phase | Pitfall Risk | Must Address Before Phase |
|-------|-------------|---------------------------|
| **Phase 1: Foundation** | Selection desync (Pitfall 1) | Use store for all selection state |
| **Phase 1: Foundation** | Z-order vs hierarchy (Pitfall 2) | Define mental model, document behavior |
| **Phase 1: Foundation** | Undo pollution (Pitfall 3) | Decide on view state separation |
| **Phase 1: Foundation** | Multi-window filtering (Pitfall 5) | Always filter by activeWindowId |
| **Phase 2: Features** | Performance (Pitfall 4) | Implement virtualization from start |
| **Phase 2: Features** | Context menu explosion (Pitfall 6) | Design menu structure, keyboard shortcuts |
| **Phase 3: Help System** | Help maintenance (Pitfall 7) | Set up generation/validation infrastructure |
| **Phase 3: Help System** | HTML security (Pitfall 8) | Implement sanitization before displaying |

---

## Recommendations by Phase

### Phase 1: Foundation (Before Building Layers Panel)
**Critical decisions:**

1. **Selection synchronization**
   - All selection goes through store actions
   - Layers panel reads selectedIds from store
   - Same click modifiers (Ctrl, Shift) as canvas

2. **Hierarchy model**
   - Tree display based on parentId/children
   - Z-order operations separate from tree drag-drop
   - Validate hierarchy consistency on every change

3. **Undo behavior**
   - Visibility/lock as view state (not undoable) OR
   - Batch visibility changes as single undo entry
   - Document decision for users

4. **Window filtering**
   - Always filter by activeWindowId
   - Validate element-window relationships

### Phase 2: Features (Building Layers Panel)
**Implementation priorities:**

1. **Virtualized list** - @tanstack/react-virtual for 100+ elements
2. **Memoized rows** - React.memo with custom comparison
3. **Keyboard shortcuts** - Match industry conventions
4. **Context menu** - Grouped submenus, inline icons for common actions

### Phase 3: Help System (Adding Contextual Help)
**Implementation priorities:**

1. **Help generation** - From TSDoc comments on types
2. **Validation** - Build-time check for completeness
3. **Sanitization** - DOMPurify for HTML content
4. **Consistent placement** - Help button always in same location

---

## Success Criteria

**Layers panel is complete when:**
- [ ] Selection syncs bidirectionally between panel and canvas
- [ ] Tree structure displays container hierarchy correctly
- [ ] Z-order operations work as expected
- [ ] Visibility/lock toggles don't pollute undo history
- [ ] Performance smooth with 200+ elements
- [ ] Multi-window filtering works correctly
- [ ] Drag-drop reordering works within containers
- [ ] Keyboard shortcuts documented and working

**Help system is complete when:**
- [ ] All 100+ element types have basic help content
- [ ] Help content auto-generated from type definitions
- [ ] Build validates help completeness
- [ ] HTML content sanitized
- [ ] Help buttons placed consistently
- [ ] Help popup styled consistently

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Selection synchronization | **HIGH** | Existing codebase has clear selection state pattern |
| Z-order vs hierarchy | **HIGH** | Analyzed existing container hierarchy code |
| Undo behavior | **HIGH** | Existing zundo partialize function understood |
| Performance | **MEDIUM** | Standard virtualization patterns, but tree + virtualization is complex |
| Multi-window | **HIGH** | windowsSlice.ts logic is clear |
| Help maintenance | **MEDIUM** | Standard documentation patterns, but 100+ elements is significant scale |
| HTML security | **HIGH** | Project already uses DOMPurify for tooltips |

---

## Sources

### Selection and State Management
- [VectorStyler Layers Panel Documentation](https://www.vectorstyler.com/documentation/objects/layers/) - Selection synchronization patterns
- [Figma Help - Select layers and objects](https://help.figma.com/hc/en-us/articles/360040449873-Select-layers-and-objects) - Industry standard behavior
- [Blender Development Forum - Selection sync issues](https://devtalk.blender.org/t/responding-to-selection-changes/15813) - Known challenges

### Performance and Virtualization
- [TanStack Virtual](https://tanstack.com/virtual/latest) - React virtualization library
- [react-virtualized-dnd](https://github.com/Forecast-it/react-virtualized-dnd) - Virtualized drag and drop

### Undo/Redo Patterns
- [Rhino Forum - Layer state in undo history](https://discourse.mcneel.com/t/undo-redo-history-exclude-layer-state-changes/44552) - User complaints about undo pollution
- [Redux - Implementing Undo History](https://redux.js.org/usage/implementing-undo-history) - State management patterns
- [Liveblocks - Undo/Redo in multiplayer](https://liveblocks.io/blog/how-to-build-undo-redo-in-a-multiplayer-environment) - Advanced patterns

### Help and Documentation
- [NN/G - Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/) - UX best practices
- [Svitla - Building contextual help](https://svitla.com/blog/tips-for-building-contextual-help-in-web-applications/) - Implementation patterns
- [ClickHelp - Context sensitive help](https://clickhelp.com/use-cases/context-help/) - Help system patterns

### Security
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization library

---

## Existing Codebase References

**Selection state:**
- `src/store/elementsSlice.ts` - selectedIds, selection actions

**Container hierarchy:**
- `src/types/elements/containers.ts` - ContainerWithChildren, children array
- `src/types/elements/base.ts` - parentId reference
- `src/store/containerEditorSlice.ts` - Container editing logic

**Undo/redo:**
- `src/store/index.ts` - zundo temporal middleware, partialize function

**Multi-window:**
- `src/store/windowsSlice.ts` - UIWindow, elementIds array

**Existing help panel:**
- `src/components/Layout/HelpPanel.tsx` - Keyboard shortcuts panel

**Existing tooltip element:**
- `src/types/elements/containers.ts` - TooltipElementConfig with HTML content
