# Requirements: Faceplate v0.10.0

**Defined:** 2026-02-04
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v0.10.0 Requirements

Requirements for SVG Styling for Visual Controls milestone.

### Foundation

- [x] **FND-01**: ElementStyle type with category discriminant (rotary, linear, arc, button, meter)
- [x] **FND-02**: Layer schemas per category (SliderLayers, ButtonLayers, MeterLayers)
- [x] **FND-03**: elementStylesSlice in Zustand store with CRUD operations
- [x] **FND-04**: getStylesByCategory() selector for filtering
- [x] **FND-05**: Generalized layer detection service for all categories
- [x] **FND-06**: Project schema v3.0.0 with elementStyles array
- [x] **FND-07**: Additive migration from knobStyles (backward compatible)

### Knob Variants

- [x] **KNB-01**: steppedknob supports styleId and SVG rendering
- [x] **KNB-02**: centerdetentknob supports styleId and SVG rendering
- [x] **KNB-03**: dotindicatorknob supports styleId and SVG rendering

### Slider Styling

- [ ] **SLD-01**: slider supports styleId with thumb/track/fill layers
- [ ] **SLD-02**: rangeslider supports styleId (dual thumbs)
- [ ] **SLD-03**: multislider supports styleId (multiple parallel sliders)
- [ ] **SLD-04**: bipolarslider supports styleId with center-zero styling
- [ ] **SLD-05**: crossfadeslider supports styleId with A/B balance
- [ ] **SLD-06**: notchedslider supports styleId with tick marks
- [ ] **SLD-07**: arcslider supports styleId with curved path

### Button & Switch Styling

- [ ] **BTN-01**: button supports styleId with normal/pressed layers
- [ ] **BTN-02**: iconbutton supports styleId with icon layer
- [ ] **BTN-03**: toggleswitch supports styleId with on/off states
- [ ] **BTN-04**: powerbutton supports styleId with LED indicator layer
- [ ] **BTN-05**: rockerswitch supports styleId with 3-position states
- [ ] **BTN-06**: rotaryswitch supports styleId with position labels
- [ ] **BTN-07**: segmentbutton supports styleId with segment layers

### Meter Styling

- [ ] **MTR-01**: meter supports styleId with segments/background/peak layers

### Export

- [ ] **EXP-01**: HTML export generates correct structure for styled sliders
- [ ] **EXP-02**: HTML export generates correct structure for styled buttons/switches
- [ ] **EXP-03**: HTML export generates correct structure for styled meters
- [ ] **EXP-04**: CSS export includes layer positioning and animations
- [ ] **EXP-05**: JS export includes category-specific animation logic

### UI

- [ ] **UI-01**: ManageElementStylesDialog with category tabs/filter
- [ ] **UI-02**: ElementLayerMappingDialog for layer assignment
- [ ] **UI-03**: Style dropdown in PropertyPanel for all supported elements
- [ ] **UI-04**: Color override controls in PropertyPanel

## Out of Scope

| Feature | Reason |
|---------|--------|
| Raster-based styling | SVG-only for scalability and export quality |
| Complex animation timelines | Beyond JUCE WebView2 capabilities |
| Per-segment meter styling | Over-engineering, single style per meter sufficient |
| CSS-in-SVG styling | Security risk with user-supplied SVG |
| 3D/WebGL effects | Not needed for audio plugin UIs |
| Live SVG editing | Design in Figma/Illustrator, import to Faceplate |
| Multi-resolution variants | SVG scales natively |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 53 | Complete |
| FND-02 | Phase 53 | Complete |
| FND-03 | Phase 53 | Complete |
| FND-04 | Phase 53 | Complete |
| FND-05 | Phase 53 | Complete |
| FND-06 | Phase 53 | Complete |
| FND-07 | Phase 53 | Complete |
| KNB-01 | Phase 54 | Complete |
| KNB-02 | Phase 54 | Complete |
| KNB-03 | Phase 54 | Complete |
| SLD-01 | Phase 55 | Pending |
| SLD-02 | Phase 55 | Pending |
| SLD-03 | Phase 55 | Pending |
| SLD-04 | Phase 55 | Pending |
| SLD-05 | Phase 55 | Pending |
| SLD-06 | Phase 55 | Pending |
| SLD-07 | Phase 55 | Pending |
| BTN-01 | Phase 56 | Pending |
| BTN-02 | Phase 56 | Pending |
| BTN-03 | Phase 56 | Pending |
| BTN-04 | Phase 56 | Pending |
| BTN-05 | Phase 56 | Pending |
| BTN-06 | Phase 56 | Pending |
| BTN-07 | Phase 56 | Pending |
| MTR-01 | Phase 57 | Pending |
| EXP-01 | Phase 58 | Pending |
| EXP-02 | Phase 58 | Pending |
| EXP-03 | Phase 58 | Pending |
| EXP-04 | Phase 58 | Pending |
| EXP-05 | Phase 58 | Pending |
| UI-01 | Phase 59 | Pending |
| UI-02 | Phase 59 | Pending |
| UI-03 | Phase 59 | Pending |
| UI-04 | Phase 59 | Pending |

**Coverage:**
- v0.10.0 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 - Phase 54 requirements completed*
