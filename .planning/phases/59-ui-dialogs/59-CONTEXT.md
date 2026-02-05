# Phase 59: UI Dialogs - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage, assign, and override element styles through unified UI. This includes ManageElementStylesDialog for style library management, LayerMappingDialog for assigning SVG layers to roles, PropertyPanel integration for style selection, and visual feedback during the workflow.

</domain>

<decisions>
## Implementation Decisions

### Entry Points for Style Import
- Three paths to import/assign styles:
  1. Asset sidebar import button — imports SVG, asks element type, auto-detects layers
  2. PropertyPanel style dropdown — pick existing style or import new
  3. Element-specific import button in left sidebar properties

### ManageElementStylesDialog
- Opens via "Manage..." option in style dropdown
- Actions available: rename, delete, re-map layers (no duplicate)
- Shows styles filtered by current element category
- Delete requires confirmation dialog every time

### LayerMappingDialog
- Auto-detect layers by naming convention, show proposed mapping for confirmation
- Layout: List view table (Role → Detected Layer) with SVG visual preview alongside
- All roles shown (required and optional) — required roles marked as required
- Cannot save until all required roles have layers assigned
- Hovering a row in the table highlights that layer in the SVG preview

### PropertyPanel Integration
- Style dropdown appears at top of panel (first property after element name)
- Dropdown shows small thumbnail preview + name for each style
- Color override controls follow existing knob style pattern
- No canvas indicator needed — styled appearance is self-evident

### Style Previews
- Import dialog: Static preview at default state (0% for sliders, center for knobs)
- Manage dialog: Compact list view (small thumbnail, name, actions in a row)

### Claude's Discretion
- Exact dimensions and spacing of dialogs
- Thumbnail generation approach
- Layer highlight visual effect implementation

</decisions>

<specifics>
## Specific Ideas

- Follow existing patterns from knob style implementation for color overrides
- Layer mapping table should feel similar to existing property tables

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 59-ui-dialogs*
*Context gathered: 2026-02-05*
