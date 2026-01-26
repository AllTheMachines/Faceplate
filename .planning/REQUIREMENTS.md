# Requirements: VST3 WebView UI Designer

**Defined:** 2026-01-26
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v1.2 Requirements

Requirements for Complete Element Taxonomy milestone. 76 new elements + 2 UX improvements.

### Architecture Refactoring (Phase 19) ✓

- [x] **ARCH-01**: PropertyPanel uses registry pattern instead of switch statements
- [x] **ARCH-02**: Element.tsx uses registry pattern for renderer lookup
- [x] **ARCH-03**: Code splitting infrastructure with lazy loading for element categories
- [x] **ARCH-04**: File organization restructured by element category
- [x] **ARCH-05**: TypeScript unions split by category to improve compilation

### Rotary Controls (3 elements) ✓

- [x] **ROT-01**: Stepped Knob with configurable detent positions (12-64)
- [x] **ROT-02**: Center-Detented Knob that snaps to center position
- [x] **ROT-03**: Dot Indicator Knob with minimal dot-style indicator

### Linear Controls (5 elements) ✓

- [x] **LIN-01**: Bipolar Slider with center-zero default
- [x] **LIN-02**: Crossfade Slider for A/B balance (DJ-style)
- [x] **LIN-03**: Notched Slider with detent positions
- [x] **LIN-04**: Arc Slider following curved path
- [x] **LIN-05**: Multi-Slider with parallel sliders for EQ/multi-band

### Buttons & Switches (7 elements) ✓

- [x] **BTN-01**: Icon Button (toolbar style, icon only)
- [x] **BTN-02**: Toggle Switch (iOS-style slide switch)
- [x] **BTN-03**: Rocker Switch (3-position up/center/down)
- [x] **BTN-04**: Rotary Switch (vintage rotating selector)
- [x] **BTN-05**: Kick Button (momentary with animation)
- [x] **BTN-06**: Segment Button (multi-segment mode selection)
- [x] **BTN-07**: Power Button (on/off with indicator)

### Value Displays (8 elements) ✓

- [x] **DISP-01**: Numeric Display (raw number value)
- [x] **DISP-02**: Time Display (ms/s/bars format)
- [x] **DISP-03**: Percentage Display (0-100%)
- [x] **DISP-04**: Ratio Display (compression ratio, e.g., 4:1)
- [x] **DISP-05**: Note Display (musical note, e.g., C4, A#3)
- [x] **DISP-06**: BPM Display (tempo value)
- [x] **DISP-07**: Editable Display (double-click to edit value)
- [x] **DISP-08**: Multi-Value Display (stacked values)

### LED Indicators (6 elements) ✓

- [x] **LED-01**: Single LED (on/off indicator)
- [x] **LED-02**: Bi-Color LED (green/red states)
- [x] **LED-03**: Tri-Color LED (off/yellow/red states)
- [x] **LED-04**: LED Array (row of 8-24 LEDs)
- [x] **LED-05**: LED Ring (circular around knob)
- [x] **LED-06**: LED Matrix (grid pattern)

### Professional Meters (13 elements) ✓

- [x] **MTR-01**: RMS Meter (300ms averaged)
- [x] **MTR-02**: VU Meter (ANSI C16.5-1942 standard)
- [x] **MTR-03**: PPM Type I (IEC 60268-10, 10ms attack, 1.5s release)
- [x] **MTR-04**: PPM Type II (BBC standard, 10ms attack, 2.8s release)
- [x] **MTR-05**: True Peak Meter (ITU-R BS.1770-5 with oversampling)
- [x] **MTR-06**: LUFS Momentary (EBU R128, 400ms window)
- [x] **MTR-07**: LUFS Short-term (EBU R128, 3s window)
- [x] **MTR-08**: LUFS Integrated (EBU R128, full program)
- [x] **MTR-09**: K-12 Meter (Bob Katz standard)
- [x] **MTR-10**: K-14 Meter (Bob Katz standard)
- [x] **MTR-11**: K-20 Meter (Bob Katz standard)
- [x] **MTR-12**: Correlation Meter (phase, -1 to +1)
- [x] **MTR-13**: Stereo Width Meter (M/S ratio, 0-200%)

### Visualizations (10 elements) ✓

- [x] **VIZ-01**: Scrolling Waveform (time-domain, moving display)
- [x] **VIZ-02**: Spectrum Analyzer (FFT frequency display)
- [x] **VIZ-03**: Spectrogram (time-frequency color map)
- [x] **VIZ-04**: Goniometer (L/R phase display)
- [x] **VIZ-05**: Vectorscope (Lissajous mode)
- [x] **VIZ-06**: EQ Curve (frequency response with handles)
- [x] **VIZ-07**: Compressor Curve (transfer function display)
- [x] **VIZ-08**: Envelope Display (ADSR visualization)
- [x] **VIZ-09**: LFO Display (waveform shape)
- [x] **VIZ-10**: Filter Response (cutoff/resonance curve)

### Selection & Navigation (8 elements) ✓

- [x] **NAV-01**: Multi-Select Dropdown (multiple selections)
- [x] **NAV-02**: Combo Box (dropdown + text entry)
- [x] **NAV-03**: Tab Bar (section switching)
- [x] **NAV-04**: Menu Button (opens context menu)
- [x] **NAV-05**: Breadcrumb (hierarchy navigation)
- [x] **NAV-06**: Stepper (+/- buttons)
- [x] **NAV-07**: Tag Selector (tag-based filtering)
- [x] **NAV-08**: Tree View (hierarchical list)

### Containers & Decorative (3 elements)

- [ ] **CONT-01**: Tooltip (hover information)
- [ ] **CONT-02**: Spacer (invisible layout element)
- [ ] **CONT-03**: Window Chrome (title bar, resize handles)

### Specialized Audio (12 elements)

- [ ] **SPEC-01**: Piano Keyboard (note input with velocity)
- [ ] **SPEC-02**: Drum Pad (velocity-sensitive trigger)
- [ ] **SPEC-03**: Pad Grid (4x4 or 4x8 layout)
- [ ] **SPEC-04**: Step Sequencer (pattern grid)
- [ ] **SPEC-05**: XY Pad (2D control surface)
- [ ] **SPEC-06**: Wavetable Display (3D waveform visualization)
- [ ] **SPEC-07**: Harmonic Editor (additive synthesis bars)
- [ ] **SPEC-08**: Envelope Editor (draggable ADSR points)
- [ ] **SPEC-09**: Sample Display (audio file waveform)
- [ ] **SPEC-10**: Loop Points (start/end markers)
- [ ] **SPEC-11**: Patch Bay (cable routing visualization)
- [ ] **SPEC-12**: Signal Flow (block diagram)

### UX Improvements (2 items) ✓

- [x] **UX-01**: Visible undo/redo buttons in toolbar near logo
- [x] **UX-02**: Keyboard shortcut detection for QWERTZ layout support

## Future Requirements (v1.3+)

Deferred to future milestone:

### Rotary Controls
- Endless Encoder (360° continuous rotation)
- Concentric Dual Knob (nested controls)

### SVG Enhancements (from original v1.2 plan)
- Interactive SVG Sliders with track and thumb mapping
- Interactive SVG Buttons with pressed state mapping
- SVG Meters with fill animation
- Batch import multiple SVGs at once
- Asset search/filter in library

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full audio processing | Designer creates UI mockups, not functional DSP |
| Real-time audio I/O | JUCE handles audio, designer only creates visuals |
| MIDI playback | Designer exports static UI, JUCE handles MIDI |
| Cloud sync | Personal tool, local files only |
| Mobile support | Desktop browser workflow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 19 | Complete |
| ARCH-02 | Phase 19 | Complete |
| ARCH-03 | Phase 19 | Complete |
| ARCH-04 | Phase 19 | Complete |
| ARCH-05 | Phase 19 | Complete |
| ROT-01 | Phase 20 | Complete |
| ROT-02 | Phase 20 | Complete |
| ROT-03 | Phase 20 | Complete |
| LIN-01 | Phase 20 | Complete |
| LIN-02 | Phase 20 | Complete |
| LIN-03 | Phase 20 | Complete |
| LIN-04 | Phase 20 | Complete |
| LIN-05 | Phase 20 | Complete |
| BTN-01 | Phase 21 | Complete |
| BTN-02 | Phase 21 | Complete |
| BTN-03 | Phase 21 | Complete |
| BTN-04 | Phase 21 | Complete |
| BTN-05 | Phase 21 | Complete |
| BTN-06 | Phase 21 | Complete |
| BTN-07 | Phase 21 | Complete |
| DISP-01 | Phase 22 | Complete |
| DISP-02 | Phase 22 | Complete |
| DISP-03 | Phase 22 | Complete |
| DISP-04 | Phase 22 | Complete |
| DISP-05 | Phase 22 | Complete |
| DISP-06 | Phase 22 | Complete |
| DISP-07 | Phase 22 | Complete |
| DISP-08 | Phase 22 | Complete |
| LED-01 | Phase 22 | Complete |
| LED-02 | Phase 22 | Complete |
| LED-03 | Phase 22 | Complete |
| LED-04 | Phase 22 | Complete |
| LED-05 | Phase 22 | Complete |
| LED-06 | Phase 22 | Complete |
| MTR-01 | Phase 23 | Complete |
| MTR-02 | Phase 23 | Complete |
| MTR-03 | Phase 23 | Complete |
| MTR-04 | Phase 23 | Complete |
| MTR-05 | Phase 23 | Complete |
| MTR-06 | Phase 23 | Complete |
| MTR-07 | Phase 23 | Complete |
| MTR-08 | Phase 23 | Complete |
| MTR-09 | Phase 23 | Complete |
| MTR-10 | Phase 23 | Complete |
| MTR-11 | Phase 23 | Complete |
| MTR-12 | Phase 23 | Complete |
| MTR-13 | Phase 23 | Complete |
| NAV-01 | Phase 24 | Complete |
| NAV-02 | Phase 24 | Complete |
| NAV-03 | Phase 24 | Complete |
| NAV-04 | Phase 24 | Complete |
| NAV-05 | Phase 24 | Complete |
| NAV-06 | Phase 24 | Complete |
| NAV-07 | Phase 24 | Complete |
| NAV-08 | Phase 24 | Complete |
| VIZ-01 | Phase 25 | Complete |
| VIZ-02 | Phase 25 | Complete |
| VIZ-03 | Phase 25 | Complete |
| VIZ-04 | Phase 25 | Complete |
| VIZ-05 | Phase 25 | Complete |
| VIZ-06 | Phase 26 | Complete |
| VIZ-07 | Phase 26 | Complete |
| VIZ-08 | Phase 26 | Complete |
| VIZ-09 | Phase 26 | Complete |
| VIZ-10 | Phase 26 | Complete |
| CONT-01 | Phase 27 | Pending |
| CONT-02 | Phase 27 | Pending |
| CONT-03 | Phase 27 | Pending |
| SPEC-01 | Phase 28 | Pending |
| SPEC-02 | Phase 28 | Pending |
| SPEC-03 | Phase 28 | Pending |
| SPEC-04 | Phase 29 | Pending |
| SPEC-05 | Phase 29 | Pending |
| SPEC-06 | Phase 29 | Pending |
| SPEC-07 | Phase 30 | Pending |
| SPEC-08 | Phase 30 | Pending |
| SPEC-09 | Phase 30 | Pending |
| SPEC-10 | Phase 30 | Pending |
| SPEC-11 | Phase 30 | Pending |
| SPEC-12 | Phase 30 | Pending |
| UX-01 | Phase 19 | Complete |
| UX-02 | Phase 19 | Complete |

**Coverage:**
- v1.2 requirements: 78 total
- Mapped to phases: 78
- Unmapped: 0

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 after Phase 26 complete*
