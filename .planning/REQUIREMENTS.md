# Requirements: Faceplate v0.11.0

**Defined:** 2026-02-05
**Core Value:** Complete user-facing manual covering all Faceplate features with screenshot placeholders

## v0.11.0 Requirements

Requirements for Complete Feature Documentation Manual milestone.

### Manual Structure

- [ ] **MAN-01**: Manual index file (`docs/manual/README.md`) with table of contents linking all topic files
- [ ] **MAN-02**: Each topic file follows consistent format: title, overview paragraph, step-by-step sections, screenshot placeholders in `![description](../images/filename.png)` format
- [ ] **MAN-03**: Screenshot placeholders use descriptive filenames indicating what to capture (e.g., `canvas-drag-element.png`, `layers-panel-overview.png`)

### Getting Started

- [ ] **START-01**: Getting started guide covers installation, launching, and creating first project
- [ ] **START-02**: Interface overview explains three-panel layout (palette, canvas, properties) with labeled screenshot
- [ ] **START-03**: Quick start tutorial walks through placing a knob, configuring it, and previewing

### Canvas & Manipulation

- [x] **CANV-01**: Canvas guide covers drag-drop from palette to canvas with screenshot
- [x] **CANV-02**: Selection documentation: click select, multi-select (Ctrl/Shift+click, drag rectangle)
- [x] **CANV-03**: Element manipulation: move (drag), resize (handles), shift-constrained drag, arrow key nudge
- [x] **CANV-04**: Copy/paste and duplicate with 20px offset behavior documented
- [x] **CANV-05**: Undo/redo system: keyboard shortcuts, toolbar buttons, history panel
- [x] **CANV-06**: Snap grid: toggle (Ctrl+G), adjustable size, visual grid display
- [x] **CANV-07**: Element locking: individual lock, lock-all mode
- [x] **CANV-08**: Canvas background configuration: color, gradient, image
- [x] **CANV-09**: Pan and zoom: scroll to zoom, middle-click/space drag to pan, zoom controls

### Element Palette

- [x] **PAL-01**: Palette overview with all categories listed and screenshot
- [x] **PAL-02**: Each element category described with available element types
- [x] **PAL-03**: Search/filter functionality documented
- [x] **PAL-04**: Pro element badges and gating behavior explained

### Properties Panel

- [x] **PROP-01**: Properties panel overview: common properties section, element-specific sections
- [x] **PROP-02**: Common properties documented: position (x, y), size (width, height), name, rotation, parameterId
- [x] **PROP-03**: Element-specific property sections with representative examples (knob, slider, button, meter)
- [x] **PROP-04**: Parameter binding: parameterId field, how it maps to JUCE parameters
- [x] **PROP-05**: Help buttons: (?) buttons on sections, F1 contextual help

### Layers System

- [x] **LAY-01**: Layers panel overview with screenshot showing layer list
- [x] **LAY-02**: Creating, renaming, and deleting layers
- [x] **LAY-03**: Layer visibility toggle (eye icon) with effect on canvas
- [x] **LAY-04**: Layer lock toggle with effect on element interaction
- [x] **LAY-05**: Z-order control: drag-to-reorder layers changes rendering order
- [x] **LAY-06**: Moving elements between layers via context menu

### Multi-Window System

- [x] **WIN-01**: Multi-window overview: purpose, use cases (main, settings, developer windows)
- [x] **WIN-02**: Creating, duplicating, and deleting windows
- [x] **WIN-03**: Window types: release vs developer, export implications
- [x] **WIN-04**: Window properties: name, dimensions, background
- [x] **WIN-05**: Copy/paste elements between windows
- [x] **WIN-06**: Button navigation action for switching between windows

### Asset Library & SVG Import

- [x] **ASSET-01**: Asset library overview with sidebar screenshot
- [x] **ASSET-02**: Importing SVG files: upload dialog, validation, categories
- [x] **ASSET-03**: Organizing assets: categories, renaming, deleting
- [x] **ASSET-04**: Drag-to-canvas workflow for placing SVG graphics
- [x] **ASSET-05**: SVG security: what gets sanitized and why

### Font Management

- [x] **FONT-01**: Font system overview: built-in vs custom fonts
- [x] **FONT-02**: Selecting a fonts folder via File System Access API
- [x] **FONT-03**: Custom font dropdown with preview (fonts shown in their typeface)
- [x] **FONT-04**: How fonts are bundled in export (base64 for custom, file refs for built-in)

### Element Styles (SVG Styling)

- [x] **STYLE-01**: Element styles overview: what they are, supported element categories
- [x] **STYLE-02**: Creating a style: import SVG, layer detection, layer mapping dialog
- [x] **STYLE-03**: Applying styles to elements via properties panel dropdown
- [x] **STYLE-04**: Color overrides: per-instance layer color customization
- [x] **STYLE-05**: Managing styles: ManageElementStylesDialog with category filtering
- [x] **STYLE-06**: Reference to STYLE_CREATION_MANUAL.md for detailed design workflow

### Export System

- [x] **EXP-01**: Export overview: two modes (JUCE WebView2 bundle, browser preview)
- [x] **EXP-02**: JUCE WebView2 export: what gets generated (HTML, CSS, JS, C++ snippets)
- [x] **EXP-03**: Browser preview: how to use, what it shows, limitations
- [x] **EXP-04**: Folder export vs ZIP download
- [x] **EXP-05**: Multi-window export: separate folders per window
- [x] **EXP-06**: Pro element export blocking: what happens, how to resolve

### Project Management

- [x] **PROJ-01**: Save/load projects as JSON files
- [x] **PROJ-02**: Unsaved changes protection: browser warning, asterisk indicator, "last saved" display
- [x] **PROJ-03**: Container editing: "Edit Contents" button, breadcrumb navigation, nested containers
- [x] **PROJ-04**: Template import from existing JUCE projects

### Existing Docs Update

- [x] **UPD-01**: FACEPLATE_DOCUMENTATION.md updated to current version (v0.11.0+) with all features since v0.9.4
- [x] **UPD-02**: ELEMENT_REFERENCE.md updated with current element count (107), styleId properties, and any new elements
- [x] **UPD-03**: STYLE_CREATION_MANUAL.md verified and updated for unified ElementStyle system (was knob-only)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Actual screenshots | Manual contains placeholder notes only — user captures screenshots separately |
| Video tutorials | Text + screenshot format only for this milestone |
| API/developer documentation | This is end-user documentation, not internal dev docs |
| Internationalization | English only |
| Pro licensing documentation | User excluded from scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAN-01 | Phase 60 | Complete |
| MAN-02 | Phase 60 | Complete |
| MAN-03 | Phase 60 | Complete |
| START-01 | Phase 60 | Complete |
| START-02 | Phase 60 | Complete |
| START-03 | Phase 60 | Complete |
| CANV-01 | Phase 61 | Complete |
| CANV-02 | Phase 61 | Complete |
| CANV-03 | Phase 61 | Complete |
| CANV-04 | Phase 61 | Complete |
| CANV-05 | Phase 61 | Complete |
| CANV-06 | Phase 61 | Complete |
| CANV-07 | Phase 61 | Complete |
| CANV-08 | Phase 61 | Complete |
| CANV-09 | Phase 61 | Complete |
| PAL-01 | Phase 61 | Complete |
| PAL-02 | Phase 61 | Complete |
| PAL-03 | Phase 61 | Complete |
| PAL-04 | Phase 61 | Complete |
| PROP-01 | Phase 62 | Complete |
| PROP-02 | Phase 62 | Complete |
| PROP-03 | Phase 62 | Complete |
| PROP-04 | Phase 62 | Complete |
| PROP-05 | Phase 62 | Complete |
| LAY-01 | Phase 62 | Complete |
| LAY-02 | Phase 62 | Complete |
| LAY-03 | Phase 62 | Complete |
| LAY-04 | Phase 62 | Complete |
| LAY-05 | Phase 62 | Complete |
| LAY-06 | Phase 62 | Complete |
| WIN-01 | Phase 63 | Complete |
| WIN-02 | Phase 63 | Complete |
| WIN-03 | Phase 63 | Complete |
| WIN-04 | Phase 63 | Complete |
| WIN-05 | Phase 63 | Complete |
| WIN-06 | Phase 63 | Complete |
| ASSET-01 | Phase 63 | Complete |
| ASSET-02 | Phase 63 | Complete |
| ASSET-03 | Phase 63 | Complete |
| ASSET-04 | Phase 63 | Complete |
| ASSET-05 | Phase 63 | Complete |
| FONT-01 | Phase 63 | Complete |
| FONT-02 | Phase 63 | Complete |
| FONT-03 | Phase 63 | Complete |
| FONT-04 | Phase 63 | Complete |
| STYLE-01 | Phase 64 | Complete |
| STYLE-02 | Phase 64 | Complete |
| STYLE-03 | Phase 64 | Complete |
| STYLE-04 | Phase 64 | Complete |
| STYLE-05 | Phase 64 | Complete |
| STYLE-06 | Phase 64 | Complete |
| EXP-01 | Phase 64 | Complete |
| EXP-02 | Phase 64 | Complete |
| EXP-03 | Phase 64 | Complete |
| EXP-04 | Phase 64 | Complete |
| EXP-05 | Phase 64 | Complete |
| EXP-06 | Phase 64 | Complete |
| PROJ-01 | Phase 65 | Complete |
| PROJ-02 | Phase 65 | Complete |
| PROJ-03 | Phase 65 | Complete |
| PROJ-04 | Phase 65 | Complete |
| UPD-01 | Phase 65 | Complete |
| UPD-02 | Phase 65 | Complete |
| UPD-03 | Phase 65 | Complete |

**Coverage:**
- v0.11.0 requirements: 64 total
- Mapped to phases: 64
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-06 - Phase 61 complete (13 requirements marked Complete)*
