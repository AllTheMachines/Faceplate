# Requirements: VST3 WebView UI Designer v1.1

**Defined:** 2026-01-25
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v1.1 Requirements

Requirements for SVG Import System milestone. Each maps to roadmap phases.

### Security & Upload

- [x] **SEC-01**: SVG files are sanitized with DOMPurify at upload time
- [x] **SEC-02**: SVG files are re-sanitized when loading project JSON (tampering protection)
- [x] **SEC-03**: SVG files are re-sanitized before canvas rendering (SafeSVG prepared, integration in Phase 16)
- [x] **SEC-04**: SVG files are re-sanitized before export generation
- [x] **SEC-05**: DOCTYPE declarations in SVG files are rejected (XML bomb prevention)
- [x] **SEC-06**: SVG file size is limited to 1MB maximum
- [x] **SEC-07**: SVG element count is limited to 5000 maximum (performance protection)
- [x] **SEC-08**: SafeSVG React component encapsulates all SVG rendering with sanitization

### Asset Library

- [x] **ASSET-01**: SVG assets are stored in project state (Zustand)
- [x] **ASSET-02**: Asset library UI panel displays all imported SVGs
- [x] **ASSET-03**: User can import SVG via dialog with file upload
- [x] **ASSET-04**: Import dialog shows SVG preview before adding
- [x] **ASSET-05**: User can delete assets (with usage check warning)
- [x] **ASSET-06**: Assets have category property (logo, icon, decoration, background)
- [x] **ASSET-07**: Asset library shows thumbnail previews for each asset
- [x] **ASSET-08**: User can drag asset from library directly to canvas

### Static SVG Graphics

- [x] **GFX-01**: New "SVG Graphic" element type exists
- [x] **GFX-02**: SVG Graphic element references asset by ID
- [x] **GFX-03**: User can place SVG Graphic on canvas via palette or library drag
- [x] **GFX-04**: SVG Graphic can be resized on canvas
- [x] **GFX-05**: SVG Graphic has "lock aspect ratio" option
- [x] **GFX-06**: SVG Graphic position can be set via property panel (X, Y)
- [x] **GFX-07**: SVG Graphic scales perfectly without pixelation (vector rendering)
- [x] **GFX-08**: SVG Graphic has z-index property for layering control

### Interactive SVG Knobs

- [x] **KNOB-01**: User can import SVG knob design with layer mapping dialog
- [x] **KNOB-02**: Layer mapping supports track, value arc, and indicator elements
- [x] **KNOB-03**: Imported knob design creates a reusable "Knob Style"
- [x] **KNOB-04**: Knob styles are stored in project state
- [x] **KNOB-05**: User can apply knob style to any knob element on canvas
- [x] **KNOB-06**: Knob with SVG style renders with rotation animation based on value
- [x] **KNOB-07**: Multiple knobs can share the same style (single asset, many instances)
- [x] **KNOB-08**: User can override colors per knob instance (track, arc, indicator colors)
- [x] **KNOB-09**: Property panel shows style selector dropdown for knob elements

### Export

- [x] **EXP-01**: SVG Graphics export as inline SVG in HTML
- [x] **EXP-02**: SVG Knobs export with working rotation interactivity
- [x] **EXP-03**: Exported HTML includes CSP headers for security
- [x] **EXP-04**: SVG content is optimized with SVGO before export (optional toggle)
- [x] **EXP-05**: Exported CSS includes responsive scaling rules for SVG elements

## Future Requirements (v1.2+)

### Extended SVG Controls

- **CTRL-01**: Interactive SVG Sliders with track and thumb mapping
- **CTRL-02**: Interactive SVG Buttons with pressed state mapping
- **CTRL-03**: SVG Meters with fill animation

### Asset Management

- **MGT-01**: Export/import asset library as standalone file
- **MGT-02**: Batch import multiple SVGs at once
- **MGT-03**: Asset search/filter in library

### SVG Editing

- **EDIT-01**: Basic color tweaks for imported SVGs
- **EDIT-02**: Layer visibility toggle

## Out of Scope

| Feature | Reason |
|---------|--------|
| In-app SVG creation/editing | Users have Figma/Illustrator for SVG creation |
| SVG animations (timeline) | Static/rotation animation sufficient for v1.1 |
| Cloud asset storage | Local-first design, no cloud infrastructure |
| SVG to PNG rasterization | Vector scaling is the point; rasterization defeats purpose |
| Nested transform support | Complex edge case, defer if encountered |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 14 | Complete |
| SEC-02 | Phase 14 | Complete |
| SEC-03 | Phase 14 | Complete |
| SEC-04 | Phase 14 | Complete |
| SEC-05 | Phase 14 | Complete |
| SEC-06 | Phase 14 | Complete |
| SEC-07 | Phase 14 | Complete |
| SEC-08 | Phase 14 | Complete |
| ASSET-01 | Phase 15 | Complete |
| ASSET-02 | Phase 15 | Complete |
| ASSET-03 | Phase 15 | Complete |
| ASSET-04 | Phase 15 | Complete |
| ASSET-05 | Phase 15 | Complete |
| ASSET-06 | Phase 15 | Complete |
| ASSET-07 | Phase 15 | Complete |
| ASSET-08 | Phase 15 | Complete |
| GFX-01 | Phase 16 | Complete |
| GFX-02 | Phase 16 | Complete |
| GFX-03 | Phase 16 | Complete |
| GFX-04 | Phase 16 | Complete |
| GFX-05 | Phase 16 | Complete |
| GFX-06 | Phase 16 | Complete |
| GFX-07 | Phase 16 | Complete |
| GFX-08 | Phase 16 | Complete |
| KNOB-01 | Phase 17 | Complete |
| KNOB-02 | Phase 17 | Complete |
| KNOB-03 | Phase 17 | Complete |
| KNOB-04 | Phase 17 | Complete |
| KNOB-05 | Phase 17 | Complete |
| KNOB-06 | Phase 17 | Complete |
| KNOB-07 | Phase 17 | Complete |
| KNOB-08 | Phase 17 | Complete |
| KNOB-09 | Phase 17 | Complete |
| EXP-01 | Phase 18 | Complete |
| EXP-02 | Phase 18 | Complete |
| EXP-03 | Phase 18 | Complete |
| EXP-04 | Phase 18 | Complete |
| EXP-05 | Phase 18 | Complete |

**Coverage:**
- v1.1 requirements: 38 total
- Mapped to phases: 38/38 ✓
- Complete: 38/38 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-25*
*Last updated: 2026-01-26 after Phase 18 completion — v1.1 SHIPPED*
