---
phase: 59
plan: 02
subsystem: ui-dialogs
tags: [dialog, svg-import, layer-mapping, category-aware, hover-highlighting, asset-integration]
requires: [59-01, 53-02]
provides: [element-layer-mapping-dialog, category-specific-import, hover-highlight-preview, asset-sidebar-integration]
affects: [59-03, 59-04]
tech-stack:
  added: []
  patterns: [category-aware-layer-detection, hover-dom-manipulation, nested-dialog-z-index]
key-files:
  created:
    - src/components/dialogs/ElementLayerMappingDialog.tsx
  modified:
    - src/components/dialogs/ManageElementStylesDialog.tsx
    - src/components/dialogs/index.ts
    - src/components/AssetLibrary/AssetLibraryPanel.tsx
decisions:
  - Use z-60 for nested dialogs (ElementLayerMappingDialog inside ManageElementStylesDialog)
  - Dim other layers approach for hover highlighting (highest visual contrast)
  - Category null pattern for Asset sidebar (user selects category in step 1)
  - Purple button for Element Style import vs blue for SVG asset import
metrics:
  duration: 5 minutes
  completed: 2026-02-05
---

# Phase 59 Plan 02: ElementLayerMappingDialog Summary

**One-liner:** Unified SVG layer mapping dialog for all element categories with auto-detection, hover highlighting, and multiple entry points

## What Was Built

### 1. ElementLayerMappingDialog Component (581 lines)

**Category-Aware Layer Mapping:**
- Accepts `category: ElementCategory | null` prop (null = user selects in step 1)
- `existingStyle?: ElementStyle` prop for re-mapping workflow
- Three-step wizard: upload + category selection, layer mapping, config
- Category-specific layer roles:
  - Rotary: indicator*, track, arc, glow, shadow
  - Linear: thumb*, track, fill
  - Arc: thumb*, track, fill, arc
  - Button: normal*, pressed, icon, label, on, off, indicator, led, position-0/1/2, base, selector, highlight
  - Meter: body*, fill, fill-green, fill-yellow, fill-red, scale, peak
- Required roles validation blocks save until all mapped

**Auto-Detection:**
- Uses `detectElementLayers(svgContent, category)` from elementLayers service
- Initializes mappings from detected layers
- Success toast shows count of auto-detected layers

**Layer Mapping Interface:**
- Side-by-side layout: SVG preview (left) + role table (right)
- Table columns: Role (with red asterisk for required) | Layer dropdown
- Dropdown options: (none) + all available layer identifiers
- Visual hint: "Hover a role to highlight its layer"

**Hover Highlighting:**
- State: `hoveredLayer` tracks currently hovered layer ID
- Table rows: `onMouseEnter`/`onMouseLeave` handlers
- Effect: Dim all other layers approach (opacity 0.3 for non-hovered, 1.0 for hovered)
- DOM manipulation: Queries SVG elements by id/class, applies inline styles
- Cleanup: Resets all opacities on unmount/unhover

**Configuration Step (Rotary/Arc only):**
- Style name input
- Min/Max angle inputs (default -135° to +135°)
- Arc radius input (arc category only)
- Rotation range display

**Z-Index Management:**
- z-60 for nested dialog support (parent ManageElementStylesDialog is z-50)
- Allows stacking without visual conflicts

### 2. ManageElementStylesDialog Integration

**State Management:**
- `showImport`: Controls import dialog visibility
- `remapStyleId`: Tracks which style is being re-mapped

**Import Button:**
- Opens ElementLayerMappingDialog with `category={category}`
- No existingStyle prop (new import)

**Re-map Button:**
- Opens ElementLayerMappingDialog with `category={category}` and `existingStyle={found style}`
- Pre-populates mappings from existing style layers
- Allows updating layer assignments without re-uploading SVG

**Nested Dialog Rendering:**
- Conditional render based on `showImport || remapStyleId !== null`
- Passes category and existingStyle props
- Closes via `setShowImport(false)` and `setRemapStyleId(null)`

### 3. Asset Sidebar Integration

**New Entry Point:**
- "Import Element Style" button in AssetLibraryPanel (purple button below "Import SVG")
- Opens ElementLayerMappingDialog with `category={null}`
- User selects category in step 1 before uploading SVG

**Button Styling:**
- Purple bg (bg-purple-600) to differentiate from SVG asset import (blue)
- Palette icon (brush/paint icon)
- Text: "Import Element Style"

**Dialog Rendering:**
- State: `showStyleImport`
- Conditional render at bottom of AssetLibraryPanel
- Independent from asset import dialog

## Deviations from Plan

None - plan executed exactly as written.

## Commits

1. **3545bfb** - `feat(59-02): create ElementLayerMappingDialog with category support`
   - Created ElementLayerMappingDialog.tsx (581 lines)
   - Category prop with null support
   - Three-step wizard
   - Auto-detection integration
   - Required roles validation

2. **9acd083** - `feat(59-02): add layer hover highlighting`
   - Hover state and handlers
   - DOM manipulation effect
   - Dim others approach
   - Visual feedback hint

3. **0dbd64c** - `feat(59-02): wire ElementLayerMappingDialog to manage dialog and asset sidebar`
   - ManageElementStylesDialog: Import and Re-map integration
   - dialogs/index.ts: Export ElementLayerMappingDialog
   - AssetLibraryPanel: Import Element Style button

## Technical Decisions Made

### 1. Z-Index Strategy for Nested Dialogs

**Decision:** Use z-60 for ElementLayerMappingDialog, z-50 for ManageElementStylesDialog

**Rationale:**
- ManageElementStylesDialog can open ElementLayerMappingDialog (nested)
- Without z-index differentiation, backdrop of nested dialog appears behind parent
- z-60 ensures nested dialog and its backdrop render above parent

**Alternative considered:** React Portal to render nested dialog at root level
- Portal adds complexity without clear benefit
- Z-index approach is simpler and works reliably

### 2. Hover Highlighting Implementation

**Decision:** Dim all other layers approach (opacity manipulation)

**Rationale:**
- Highest visual contrast per research
- Clearly shows which layer maps to hovered role
- Gracefully handles layers not found (no-op)
- Simple DOM manipulation, no complex CSS

**Alternatives considered:**
- CSS filter on entire SVG: Affects all layers, not specific
- Highlight only hovered layer: Lower contrast, harder to see
- Approach 3 (dim others) provided best UX

### 3. Category Null Pattern for Asset Sidebar

**Decision:** Pass `category={null}` when opening from Asset sidebar, show category dropdown in step 1

**Rationale:**
- Asset sidebar context doesn't imply a specific element category
- User needs to specify what type of element style they're importing
- Consistent with "general import" workflow

**Alternative considered:** Separate dialog for each category
- Would require 5 different buttons in Asset sidebar
- Category selection dropdown is simpler and more flexible

### 4. Button Color Differentiation

**Decision:** Purple button for "Import Element Style", blue for "Import SVG"

**Rationale:**
- Visual distinction between asset import (SVG graphic) and style import (element behavior)
- Purple suggests "styling/theming" more than blue
- Maintains visual hierarchy (both use same pattern, different color)

**Alternative considered:** Same blue color
- Would blur distinction between two import types
- Users might confuse which import workflow they're in

## Next Phase Readiness

**Phase 59-03 ready:** PropertyPanel integration can now use ElementLayerMappingDialog via ManageElementStylesDialog

**Phase 59-04 ready:** Element rendering can consume styles created through this workflow

**Blockers:** None

**Concerns:** None

## Files Modified

### Created
- `src/components/dialogs/ElementLayerMappingDialog.tsx` (581 lines)
  - Category-aware layer mapping dialog
  - Three-step wizard with auto-detection
  - Hover highlighting with DOM manipulation
  - Required roles validation
  - Support for existing style re-mapping

### Modified
- `src/components/dialogs/ManageElementStylesDialog.tsx`
  - Import button integration
  - Re-map button integration
  - Nested dialog rendering

- `src/components/dialogs/index.ts`
  - Export ElementLayerMappingDialog

- `src/components/AssetLibrary/AssetLibraryPanel.tsx`
  - Import Element Style button
  - Dialog integration

## Testing Notes

**Manual verification:**
1. Open ManageElementStylesDialog for any category → Click "Import New [Category] Style" → Dialog opens with correct category
2. Upload SVG → Auto-detection runs → Mappings populate → Toast shows count
3. Hover table row → Corresponding layer highlights in preview (others dim)
4. Try to save without required role → Disabled + warning message
5. Complete mapping + config → Style created → Appears in manage list
6. Click "Re-map" on existing style → Dialog opens with pre-filled mappings → Update works
7. Asset sidebar → Click "Import Element Style" → Category dropdown appears → Select category → Upload flow works

**Edge cases handled:**
- No layers detected → Manual mapping required
- Required role unmapped → Save disabled with clear message
- Layer identifier not found in SVG → Hover no-op (graceful)
- Re-mapping existing style → Pre-populates all fields correctly

## Dependencies

**Requires:**
- Phase 59-01: ManageElementStylesDialog component
- Phase 53-02: elementLayers service with detectElementLayers

**Provides:**
- Element style import workflow
- Layer mapping UI with visual feedback
- Multiple entry points for style creation

**Affects:**
- Phase 59-03: PropertyPanel can leverage this dialog
- Phase 59-04: Element rendering uses styles created here

## Metrics

- **Duration:** 5 minutes (309 seconds)
- **Files created:** 1
- **Files modified:** 3
- **Lines added:** ~630
- **Commits:** 3
- **TypeScript errors:** 0 (compilation clean)

---

*Summary created: 2026-02-05*
*Phase: 59-ui-dialogs*
*Plan: 02*
