# Requirements: VST3 WebView UI Designer

**Defined:** 2026-01-29
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v1.9 Requirements

Requirements for Layers & Help System milestone. Maps to Phases 41-43.

### Bug Fixes

- [x] **BUG-01**: Single-window folder export writes directly to selected folder (no subfolder)
- [x] **BUG-02**: Container editor multi-select drag moves all selected elements together

### Layers Panel

- [ ] **LAYER-01**: User can see all elements in current window as a layer list
- [ ] **LAYER-02**: Layer list shows element name and type icon for each element
- [ ] **LAYER-03**: User can toggle element visibility via eye icon (hidden elements don't render)
- [ ] **LAYER-04**: User can toggle element lock via lock icon (locked elements can't be moved/resized)
- [ ] **LAYER-05**: User can drag layers to reorder (changes z-order on canvas)
- [ ] **LAYER-06**: Clicking a layer selects the element on canvas
- [ ] **LAYER-07**: Selecting element on canvas highlights it in layers panel
- [ ] **LAYER-08**: User can double-click layer name to rename element inline
- [ ] **LAYER-09**: Layers panel appears as tab in LeftPanel (alongside Elements, Assets)

### Help System

- [ ] **HELP-01**: Each Properties Panel section has help (?) button in header
- [ ] **HELP-02**: Clicking help button opens new browser window with documentation
- [ ] **HELP-03**: Help content explains the section's properties with examples
- [ ] **HELP-04**: Help window has dark theme matching app style
- [ ] **HELP-05**: Help content exists for each element type (Knob, Slider, Button, etc.)
- [ ] **HELP-06**: User can press F1 to open help for currently selected element
- [ ] **HELP-07**: Help window shows step-by-step instructions where applicable

## Future Requirements

Deferred to v2.0+:

### Layers Enhancements
- **LAYER-10**: Group layers without changing element hierarchy
- **LAYER-11**: Multi-select in layers with Ctrl/Shift click
- **LAYER-12**: Show nested hierarchy for containers with children

### Help Enhancements
- **HELP-08**: Searchable help index page
- **HELP-09**: Cross-linked help topics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Layer groups (folders) | Complexity - elements already have containers |
| Context menu in layers | v2.0 enhancement |
| External help website | Offline use required, bundled content better |
| Video tutorials in help | Scope creep, text+images sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 41 | Complete |
| BUG-02 | Phase 41 | Complete |
| LAYER-01 | Phase 42 | Pending |
| LAYER-02 | Phase 42 | Pending |
| LAYER-03 | Phase 42 | Pending |
| LAYER-04 | Phase 42 | Pending |
| LAYER-05 | Phase 42 | Pending |
| LAYER-06 | Phase 42 | Pending |
| LAYER-07 | Phase 42 | Pending |
| LAYER-08 | Phase 42 | Pending |
| LAYER-09 | Phase 42 | Pending |
| HELP-01 | Phase 43 | Pending |
| HELP-02 | Phase 43 | Pending |
| HELP-03 | Phase 43 | Pending |
| HELP-04 | Phase 43 | Pending |
| HELP-05 | Phase 43 | Pending |
| HELP-06 | Phase 43 | Pending |
| HELP-07 | Phase 43 | Pending |

**Coverage:**
- v1.9 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after v1.9 milestone started*
