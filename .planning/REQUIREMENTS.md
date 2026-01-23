# Requirements: VST3 WebView UI Designer

**Defined:** 2025-01-23
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Canvas

- [ ] **CANV-01**: Canvas with configurable dimensions (e.g., 800x600)
- [ ] **CANV-02**: Pan with spacebar+drag
- [ ] **CANV-03**: Zoom with scroll/pinch
- [ ] **CANV-04**: Click to select single element
- [ ] **CANV-05**: Shift+click for multi-select
- [ ] **CANV-06**: Marquee (drag) selection
- [ ] **CANV-07**: Delete selected elements
- [ ] **CANV-08**: Background color/gradient or image
- [ ] **CANV-09**: Foreground/overlay images
- [ ] **CANV-10**: Element z-order (layering)

### Palette

- [ ] **PALT-01**: Component palette with categorized controls
- [ ] **PALT-02**: Drag from palette onto canvas
- [ ] **PALT-03**: Built-in SVG library (knobs, sliders, buttons, meters, labels)
- [ ] **PALT-04**: Custom SVG import with layer name detection (indicator, thumb, track, fill)

### Manipulation

- [ ] **MANP-01**: Move elements by dragging
- [ ] **MANP-02**: Resize elements with handles
- [ ] **MANP-03**: Arrow key nudge (1px, shift+10px)
- [ ] **MANP-04**: Snap to grid
- [ ] **MANP-05**: Copy/paste elements (Ctrl+C/V)

### Properties

- [ ] **PROP-01**: Property panel for selected element
- [ ] **PROP-02**: Direct numeric input for all values
- [ ] **PROP-03**: Color pickers for color properties
- [ ] **PROP-04**: Element name field (becomes ID in export)
- [ ] **PROP-05**: Parameter ID field for JUCE binding

### History

- [ ] **HIST-01**: Undo (Ctrl+Z)
- [ ] **HIST-02**: Redo (Ctrl+Y)

### Persistence

- [ ] **PERS-01**: Save project as JSON file
- [ ] **PERS-02**: Load project from JSON file

### Export

- [ ] **EXPO-01**: Export JUCE WebView2 bundle (index.html, styles.css, components.js, bindings.js, bindings.cpp)
- [ ] **EXPO-02**: Export HTML preview with mock values
- [ ] **EXPO-03**: Generated IDs use element names

### UI/UX

- [ ] **UIUX-01**: Three-panel layout (palette, canvas, properties)
- [ ] **UIUX-02**: Dark theme
- [ ] **UIUX-03**: Delete key shortcut

### Tech Stack

- [ ] **TECH-01**: React 18 + TypeScript
- [ ] **TECH-02**: Vite for build
- [ ] **TECH-03**: Zustand for state management
- [ ] **TECH-04**: @dnd-kit/core for drag-drop
- [ ] **TECH-05**: Tailwind CSS for styling
- [ ] **TECH-06**: Browser-based (no Electron)

### v1 Element Types

- [ ] **ELEM-01**: Knob (arc style, configurable angles/colors/indicator)
- [ ] **ELEM-02**: Slider (vertical/horizontal, track/thumb styling)
- [ ] **ELEM-03**: Button (momentary/toggle)
- [ ] **ELEM-04**: Label (text display)
- [ ] **ELEM-05**: Level meter (peak, vertical/horizontal)
- [ ] **ELEM-06**: Image (for backgrounds, logos, decorative)

### Reference

- [ ] **REF-01**: See docs/SPECIFICATION.md for complete property definitions per element type

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Manipulation

- **MANP-06**: Rotate elements
- **MANP-07**: Smart guides (dynamic alignment lines)
- **MANP-08**: Duplicate shortcut (Ctrl+D)

### Enhanced UX

- **UIUX-04**: Property presets ("Small knob", "Large slider")
- **UIUX-05**: Auto-save
- **UIUX-06**: Recent files list
- **UIUX-07**: Live preview mode (controls animate)

### Enhanced Export

- **EXPO-04**: Single element export
- **EXPO-05**: PNG/SVG image export

### Additional Element Types

- **ELEM-07**: Additional 100+ element types from SPECIFICATION.md taxonomy

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaboration | Single-user tool, adds massive complexity |
| Cloud storage | Local files + git is how developers work |
| AI generation | Audio UIs need precise control, not AI guessing |
| Animation timeline | Overkill for static plugin UIs |
| Component variants | Over-engineering for v1 |
| Auto layout / constraints | Plugin UIs are fixed resolution, not responsive |
| Design tokens / themes | Premature for v1 |
| Plugin marketplace | Feature creep |
| Version history | Git already does this |
| Cross-platform export | JUCE WebView2 is the target |
| Mobile support | Desktop browser workflow |
| User accounts | Personal tool, no cloud |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled during roadmap creation) | | |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 0
- Unmapped: 35

---
*Requirements defined: 2025-01-23*
*Last updated: 2025-01-23 after initial definition*
