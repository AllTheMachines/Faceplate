# Phase 15: Asset Library Storage & UI - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can import, organize, and browse SVG assets in a central library. Assets are stored in normalized Zustand state, displayed in a dedicated panel, and can be dragged to canvas. Security (validation/sanitization) was handled in Phase 14.

</domain>

<decisions>
## Implementation Decisions

### Library Panel Layout
- New tab in left panel alongside Element Palette (tab switching)
- Grid of thumbnails display style (not list)
- ~96px large thumbnails for better SVG detail visibility
- Collapsible sections per category
- Uncategorized section at bottom for assets without category
- No hover preview effect (click to see details instead)
- No asset counts shown in category headers
- Prominent "Import SVG" button at top of panel

### Import Workflow
- Modal dialog with SVG preview before confirming import
- Single file import only (one at a time, not batch)
- Name field is empty by default — user must fill in
- Dialog shows file size and SVG element count (validation info visible)

### Asset Organization
- Both fixed + custom categories (defaults: logo, icon, decoration, background — user can add more)
- Assets can have multiple category tags (appears in each category)
- Inline rename by clicking asset name (like file renaming)
- Search box at top filters assets by name as you type

### Usage & Deletion
- Usage count shown on hover/click (not badge on thumbnail)
- Delete via right-click context menu OR Delete key when selected
- All deletions require confirmation dialog
- Deleting in-use asset shows warning listing elements that use it, requires explicit confirmation

### Claude's Discretion
- Exact tab/panel switching mechanism
- Empty state messaging when no assets
- Search debounce timing
- Confirmation dialog styling
- Asset thumbnail rendering (preserving aspect ratio vs fill)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-asset-library-storage-ui*
*Context gathered: 2026-01-25*
