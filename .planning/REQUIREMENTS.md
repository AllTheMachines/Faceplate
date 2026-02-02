# Requirements: VST3 WebView UI Designer

**Defined:** 2026-02-02
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v1.10 Requirements

Requirements for bug fix milestone. Each maps to roadmap phases.

### Navigation Elements

- [ ] **NAV-01**: Tree View children visible and editable in properties panel (GitHub #48)
- [ ] **NAV-02**: Tag Selector tabs appear when typing (GitHub #47)
- [ ] **NAV-03**: Combo Box shows all options after selection (GitHub #46)
- [ ] **NAV-04**: Breadcrumb can expand after navigating to root (GitHub #45)

### Sliders

- [ ] **SLD-01**: ASCII Slider dragging feels natural (GitHub #37)
- [ ] **SLD-02**: Arc Slider has distance options for labels/values (GitHub #36)
- [ ] **SLD-03**: Notched Slider shows labels and lines (GitHub #35)
- [ ] **SLD-04**: Bipolar Slider horizontal orientation works (GitHub #33)

### Curves

- [ ] **CRV-01**: EQ Curve renders and is functional (GitHub #44)
- [ ] **CRV-02**: Compressor Curve renders and is functional (GitHub #44)
- [ ] **CRV-03**: Envelope Display renders and is functional (GitHub #44)
- [ ] **CRV-04**: LFO Display renders and is functional (GitHub #44)
- [ ] **CRV-05**: Filter Response renders and is functional (GitHub #44)

### Buttons & Knobs

- [ ] **BTN-01**: Segment Button shows icons when selected (GitHub #39)
- [ ] **BTN-02**: Kick Button has clear purpose/behavior (GitHub #38)
- [ ] **KNB-01**: Stepped Knob snaps to stepped positions (GitHub #30)

### Displays & LEDs

- [ ] **DSP-01**: Note Display font sizes consistent/adjustable (GitHub #40)
- [ ] **LED-01**: Bicolor LED shows distinct bi-color behavior (GitHub #41)

### Core UI

- [ ] **UI-01**: Color Picker doesn't close when dragging (GitHub #28)
- [ ] **UI-02**: Related Topics links work in help system (GitHub #24)

## Future Requirements

Deferred to later milestones (from backlog):

### Features
- Preview keyboard shortcut (GitHub #31)
- Crossfade Slider A/B label font selection (GitHub #34)
- UI Redesign of panels/sidebar (GitHub #15)
- Sidebar hiding and fullscreen (GitHub #9)

### Testing Infrastructure
- Specialized Audio testing VST instrument (GitHub #49)
- Meters/Audio testing with VST3 (GitHub #43)
- Testing VST3 for all elements (GitHub #27)

### Documentation
- Multi Slider help docs - what is "link mode" (GitHub #32)

## Out of Scope

| Feature | Reason |
|---------|--------|
| LED category removal (#42) | Defer - need to evaluate if entire category should be removed |
| Font weights in all elements (#29) | Separate enhancement, not a bug fix |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 44 | Pending |
| NAV-02 | Phase 44 | Pending |
| NAV-03 | Phase 44 | Pending |
| NAV-04 | Phase 44 | Pending |
| SLD-01 | Phase 45 | Pending |
| SLD-02 | Phase 45 | Pending |
| SLD-03 | Phase 45 | Pending |
| SLD-04 | Phase 45 | Pending |
| CRV-01 | Phase 46 | Pending |
| CRV-02 | Phase 46 | Pending |
| CRV-03 | Phase 46 | Pending |
| CRV-04 | Phase 46 | Pending |
| CRV-05 | Phase 46 | Pending |
| BTN-01 | Phase 47 | Pending |
| BTN-02 | Phase 47 | Pending |
| KNB-01 | Phase 47 | Pending |
| DSP-01 | Phase 48 | Pending |
| LED-01 | Phase 48 | Pending |
| UI-01 | Phase 49 | Pending |
| UI-02 | Phase 49 | Pending |

**Coverage:**
- v1.10 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-02 after milestone v1.10 definition*
