# Requirements: VST3 WebView UI Designer

**Defined:** 2026-01-28
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v1.7 Requirements

Requirements for Parameter Sync milestone. Maps to Phase 39.

### Parameter Sync

- [ ] **SYNC-01**: Export generates `setupParameterSyncListener()` function in bindings.js
- [ ] **SYNC-02**: Sync listener handles `__juce__paramSync` event from C++ backend
- [ ] **SYNC-03**: Sync updates visual state for all parameter-bound knobs via `updateKnobVisual()`
- [ ] **SYNC-04**: Sync updates visual state for all parameter-bound sliders via `updateSliderVisual()`
- [ ] **SYNC-05**: Sync updates visual state for all other bindable element types (buttons, meters, displays)
- [ ] **SYNC-06**: Sync updates internal state (`_knobValue`, `_sliderValue`, etc.) to prevent drag jumping
- [ ] **SYNC-07**: Listener gracefully handles missing JUCE backend (console warning, no errors)
- [ ] **SYNC-08**: Export maps element IDs to parameter IDs correctly (may differ)

### Documentation

- [ ] **DOC-01**: JUCE_INTEGRATION.md includes C++ `pageFinishedLoading()` implementation example
- [ ] **DOC-02**: JUCE_INTEGRATION.md includes `syncAllParametersToWebView()` example code
- [ ] **DOC-03**: JUCE_INTEGRATION.md explains parameter sync architecture (C++ as source of truth)
- [ ] **DOC-04**: Generated bindings.js includes inline comments explaining sync purpose

## Future Requirements

None planned yet.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time automation sync | Complex bidirectional sync; v1.7 focuses on editor open only |
| C++ code generation | Plugin developers implement C++ side; we provide documentation |
| WebSocket/continuous sync | Overkill for editor-open sync; event-based sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 39 | Pending |
| SYNC-02 | Phase 39 | Pending |
| SYNC-03 | Phase 39 | Pending |
| SYNC-04 | Phase 39 | Pending |
| SYNC-05 | Phase 39 | Pending |
| SYNC-06 | Phase 39 | Pending |
| SYNC-07 | Phase 39 | Pending |
| SYNC-08 | Phase 39 | Pending |
| DOC-01 | Phase 39 | Pending |
| DOC-02 | Phase 39 | Pending |
| DOC-03 | Phase 39 | Pending |
| DOC-04 | Phase 39 | Pending |

**Coverage:**
- v1.7 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after v1.7 milestone started*
