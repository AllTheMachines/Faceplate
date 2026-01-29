# Phase 42: Layers Panel - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

User-created layers for element organization. Users manually create named layers and assign elements to them. Layers control visibility (hide/show), lock (prevent move/resize), and z-order (layer order = render order). This is NOT auto-generated per-element layers like Figma — it's user-created grouping layers like Photoshop layer groups.

</domain>

<decisions>
## Implementation Decisions

### Layer model
- User-created layers (not auto-generated per element)
- User manually creates named layers and assigns elements
- Elements belong to exactly one layer
- Auto-created "Default" layer exists for unassigned elements
- Default layer is fixed at bottom, cannot be reordered
- Layers can have color tags — elements show layer color on selection handles

### Visual hierarchy
- Layers panel shows layer names only (not expandable to show contents)
- Each layer shows its name and color tag
- Element's layer assignment checked via right-click context menu or properties
- Type icons not applicable (layers are user-created groups, not element types)

### Z-order behavior
- Layer order determines z-order (top layer renders on top of others)
- Within a single layer, elements render in creation order (first added = back)
- No per-element z-order reordering within layer
- Drag layers to reorder with drop indicator line feedback

### Toggle UX
- Visibility (eye) and lock icons on right side of layer row
- Lock prevents move + resize only (properties can still be edited)
- Hidden layer elements are fully hidden — invisible and unselectable
- Keyboard shortcut: H to toggle visibility of selected layer

### Panel layout
- Appears as tab in LeftPanel (next to Elements palette)
- "+" button at panel bottom to create new layer
- Double-click layer name for inline rename
- Delete key or trash icon to delete selected layer
- Deleting a layer deletes all elements in that layer (destructive)
- Assign elements via right-click on canvas element → "Move to Layer" submenu

### Claude's Discretion
- Layer color palette (which colors available)
- Visual styling of layer rows (hover states, selected state)
- Confirmation dialog for destructive layer deletion
- Panel header/toolbar design
- react-arborist configuration (if used) or simpler list implementation

</decisions>

<specifics>
## Specific Ideas

- Layer model should match Photoshop layer groups (user-created organization) rather than Figma's auto-per-element approach
- Color tags on layers help visually distinguish which elements belong to which layer when selecting on canvas

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 42-layers-panel*
*Context gathered: 2026-01-29*
