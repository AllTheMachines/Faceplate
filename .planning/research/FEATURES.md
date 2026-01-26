# Feature Landscape: 78 Remaining Audio Plugin UI Elements

**Domain:** Audio plugin UI designer for JUCE WebView2
**Researched:** 2026-01-26
**Overall confidence:** HIGH

## Executive Summary

This research covers the 78 remaining UI elements needed to complete the VST3 WebView UI Designer taxonomy. These elements fall into 10 categories: rotary controls (5), linear controls (5), buttons/switches (7), value displays (8), LED indicators (6), meters (13), visualizations (10), selection/navigation (8), containers/decorative (3), and specialized audio controls (12).

**Key finding:** Professional audio plugins demand industry-standard meter ballistics and visualization behaviors. Users expect compliance with established standards (IEC 60268-10/18, EBU R128, ITU-R BS.1770, Bob Katz K-System). The designer must expose these as configurable properties while providing sensible defaults.

**Critical success factor:** Distinguish between "table stakes" (standards compliance) and "differentiators" (visual customization, interaction patterns). The designer's value is making standards-compliant elements visually customizable and exportable to JUCE code.

## Feature Categories

This document organizes features by element category, clearly marking:
- **Table Stakes:** Must-have for professional credibility
- **Differentiators:** Features that set this tool apart
- **Anti-Features:** Things to deliberately NOT build

---

## 1. Rotary Controls (5 remaining)

### Elements
- Endless Encoder
- Stepped Knob
- Center-Detented Knob
- Concentric Dual Knob
- Dot Indicator Knob

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| Discrete step positions (Stepped) | Standard for filter type, waveform selection | Medium | Store steps array, snap value to nearest |
| Center detent snap (Center-Detented) | Expected for pan, bipolar EQ gain | Low | Snap zone around 0.5 normalized value |
| Continuous 360° rotation (Endless) | Standard for encoders, scroll controls | Medium | No min/max, track delta only |
| Dual-layer control (Concentric) | Standard for nested parameters (attack/release) | High | Two parameter bindings, layered rendering |
| Minimal indicator style (Dot) | Modern flat UI aesthetic | Low | Single dot at value position vs full arc |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visual detent markers | Shows discrete positions graphically | Medium | Render tick marks at step positions |
| Configurable snap strength | Adjustable "magnetic" center | Low | Snap zone width property (0-20%) |
| Independent concentric colors | Visual hierarchy for dual knobs | Medium | Separate color sets per layer |
| Animation on snap | Satisfying feedback when hitting detent | Medium | CSS transition on value change |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-detection of parameter type | Too magical, error-prone | User explicitly selects knob type |
| Physics-based momentum | Overcomplicated for design tool | Simple value snapping |
| Custom detent positions | Scope creep | Use stepped knob with custom steps array |

### Dependencies on Existing Features

- All rotary variants extend existing Knob element type
- Reuse SVG rendering pipeline from v1.0
- Leverage existing parameter binding system
- Custom SVG import (v1.1) works for all rotary types

---

## 2. Linear Controls (5 remaining)

### Elements
- Bipolar Slider
- Crossfade Slider
- Notched Slider
- Arc Slider
- Multi-Slider

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| Center-zero visual (Bipolar) | Standard for pan, stereo width | Low | Fill from center, not from min |
| A/B crossfade behavior (Crossfade) | DJ mixer standard, dry/wet | Medium | Two-sided fill, center = 50/50 |
| Discrete positions (Notched) | Standard for stepped parameters | Low | Reuse step logic from stepped knob |
| Curved path (Arc) | Space-efficient circular layouts | High | SVG path calculations for arc |
| Parallel sliders (Multi-Slider) | Standard for EQ bands, multi-band | High | Array of values, synchronized rendering |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Customizable arc radius | Flexible layouts | Medium | Arc curvature property |
| Independent multi-slider colors | Visual band identification | Low | Color array property |
| Center notch indicator | Clear visual reference | Low | Render mark at center position |
| Ganged multi-slider mode | Unified control option | Medium | Single value controls all sliders |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-layout multi-sliders | Too opinionated | User positions/sizes manually |
| EQ frequency auto-spacing | Domain-specific logic | Provide template, not automation |
| Gesture-based curve drawing | Touch-only, not universal | Click-drag interaction |

### Dependencies on Existing Features

- Extends existing Slider element types (Vertical, Horizontal, Fill)
- Reuse fill rendering from Fill Slider (v1.0)
- Property panel framework handles new properties
- Export system generates appropriate HTML/CSS

---

## 3. Buttons & Switches (7 remaining)

### Elements
- Icon Button
- Toggle Switch
- Rocker Switch
- Rotary Switch
- Kick Button
- Segment Button
- Power Button

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| iOS-style slide animation (Toggle) | Modern UI standard | Medium | CSS transition between states |
| 3-position states (Rocker) | Up/center/down control | Medium | Tri-state value (-1, 0, 1) |
| Rotary selection (Rotary Switch) | Vintage hardware style | Medium | Discrete angles, visual indicator |
| Momentary press animation (Kick) | Drum trigger feedback | Low | Scale animation on press |
| Segmented selection (Segment) | Mode switcher (FM, AM, PM) | Medium | Array of labels, exclusive selection |
| On/off indicator LED (Power) | Bypass state visibility | Low | Bi-state with LED element |
| SVG icon support (Icon) | Toolbar integration | Low | Reuse SVG import from v1.1 |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom icon upload | Branding flexibility | Low | Leverage existing asset library |
| Segment auto-sizing | Responsive layouts | Medium | Equal-width distribution |
| Rocker animation | Satisfying physicality | Medium | Rotation animation on click |
| Rotary switch notches | Clear position feedback | Low | Visual tick marks |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Icon library bundled | Bloats project | User imports needed icons only |
| Auto-icon selection | AI overreach | Manual icon assignment |
| Haptic feedback triggers | Platform-specific | Visual feedback only |

### Dependencies on Existing Features

- Extends Button element (Momentary, Toggle, Text)
- Asset library for icons (v1.1)
- Animation via CSS export
- Parameter binding for multi-state controls

---

## 4. Value Displays (8 remaining)

### Elements
- Numeric Display
- Time Display
- Percentage Display
- Ratio Display
- Note Display
- BPM Display
- Editable Display
- Multi-Value Display

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| Unit formatting (ms/s/bars) | Domain standard | Low | Format string property |
| Precision control | 0-3 decimal places | Low | Precision property |
| Note name conversion | MIDI note → "C4" | Low | Lookup table (0-127 → note names) |
| Ratio infinity symbol | ∞:1 for limiters | Low | Special case when ratio > 100 |
| Double-click to edit (Editable) | DAW standard interaction | High | Input element overlay on double-click |
| Stacked layout (Multi-Value) | Multiple readouts | Medium | Vertical stack of formatted values |
| Auto-unit scaling | 1000Hz → 1.0kHz | Medium | Threshold-based formatting |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom format strings | Flexible display | Medium | Support "%.2f dB", "%d:%d" patterns |
| Editable validation | Invalid input rejection | Medium | Min/max enforcement on edit |
| Scientific notation option | Wide value ranges | Low | Format property option |
| Monospace font option | Alignment consistency | Low | Font property |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Calculator mode | Feature creep | Simple value display only |
| Expression evaluation | Security risk in export | Fixed formatting only |
| Localized number formatting | Complexity (1,000 vs 1.000) | Always use . decimal separator |

### Dependencies on Existing Features

- Extends existing dB Display, Frequency Display (v1.0)
- Font selection system (Inter, Roboto Mono)
- Parameter binding for value updates
- Input validation in export JavaScript

---

## 5. LED Indicators (6 new)

### Elements
- Single LED
- Bi-Color LED
- Tri-Color LED
- LED Array
- LED Ring
- LED Matrix

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| On/off states (Single) | Basic indicator | Low | Boolean parameter binding |
| Green/red states (Bi-Color) | Standard status indication | Low | State-based color switching |
| Off/yellow/red (Tri-Color) | Three-level status | Low | Enum state (0, 1, 2) |
| Segmented array (8-24 LEDs) | Level indication | Medium | Array rendering, threshold-based |
| Circular ring (LED Ring) | Knob value indication | Medium | SVG circle segments |
| Grid pattern (Matrix) | Sequencer step display | High | 2D array rendering |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom colors | Branding flexibility | Low | RGB properties per state |
| Glow effects | Premium aesthetic | Low | CSS box-shadow, SVG filters |
| Peak hold (Arrays) | Better metering | Medium | Hold logic in JavaScript |
| Animation timing | Smooth transitions | Low | CSS transition duration property |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Blinking animations | Distracting, accessibility | Solid state changes |
| Auto-brightness | Environmental sensing N/A | Fixed brightness |
| Sound triggers | Out of scope | Visual indication only |

### Dependencies on Existing Features

- SVG rendering system
- Parameter binding (boolean, enum, float)
- Color property system
- Export CSS for glow effects

---

## 6. Meters (13 remaining)

### Elements
- RMS Meter
- VU Meter
- PPM Type I (IEC 60268-10)
- PPM Type II (BBC standard)
- True Peak Meter
- LUFS Momentary
- LUFS Short-term
- LUFS Integrated
- K-12 Meter
- K-14 Meter
- K-20 Meter
- Correlation Meter
- Stereo Width Meter

### Table Stakes - Industry Standards

**CRITICAL:** Meter ballistics are standardized. Non-compliance makes plugin appear unprofessional.

| Meter Type | Standard | Attack Time | Release Time | Range | Complexity |
|------------|----------|-------------|--------------|-------|------------|
| **VU Meter** | ANSI C16.5-1942 | 300ms | 300ms | -20 to +3 VU | LOW |
| **RMS Meter** | Industry practice | 300ms | 300ms | -60 to 0 dBFS | LOW |
| **PPM Type I** | IEC 60268-10 | 10ms | 1.5s (20dB fall) | -60 to 0 dBFS | MEDIUM |
| **PPM Type II** | IEC 60268-10 | 10ms | 2.8s (20dB fall) | -60 to 0 dBFS | MEDIUM |
| **True Peak** | ITU-R BS.1770-5 | - | 1.7s | -60 to +6 dBTP | HIGH |
| **LUFS Momentary** | EBU R128 | 400ms window | - | -60 to 0 LUFS | HIGH |
| **LUFS Short-term** | EBU R128 | 3s window | - | -60 to 0 LUFS | HIGH |
| **LUFS Integrated** | EBU R128 | Full program | - | -60 to 0 LUFS | HIGH |
| **K-12 Meter** | Bob Katz | 600ms | 600ms | -60 to 0 dBFS | MEDIUM |
| **K-14 Meter** | Bob Katz | 600ms | 600ms | -60 to 0 dBFS | MEDIUM |
| **K-20 Meter** | Bob Katz | 600ms | 600ms | -60 to 0 dBFS | MEDIUM |
| **Correlation** | Industry practice | Fast | Medium | -1 to +1 | MEDIUM |
| **Stereo Width** | Industry practice | Medium | Medium | 0 to 200% | MEDIUM |

**Implementation notes:**
- **VU Meter:** 300ms integration matches human perception, standard reference: -18 dBFS = 0 VU
- **PPM Type I (DIN):** 5ms integration time per IEC 60268-10
- **PPM Type II (BBC):** 10ms integration time per IEC 60268-10
- **True Peak:** Requires 4x oversampling (48kHz → 192kHz) per ITU-R BS.1770, measures inter-sample peaks
- **LUFS:** Implements K-weighting filter, gating at -10 LU per EBU R128, target -23 LUFS for broadcast
- **K-System:** Integrated peak + RMS, monitor calibration to 83 dBSPL, K-12 (broadcast), K-14 (pop/rock), K-20 (film/classical)

### Table Stakes - Visual Properties

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| dBFS scale markings | Industry standard | Low | -60, -50, -40, -30, -20, -10, -6, -3, 0 |
| Color zones | Green/yellow/red zones | Low | Thresholds: green < -18, yellow < -6, red ≥ -6 |
| Peak hold indicator | Standard for all meters | Medium | Hold peak for 1-3 seconds |
| Clip indicator | Essential for digital audio | Low | Latches at 0 dBFS, manual reset |
| Vertical/horizontal orientation | Layout flexibility | Low | Property: orientation |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Configurable ballistics | Advanced users can tweak | Medium | Expose attack/release as properties |
| Custom color zones | Branding | Low | RGB properties for zones |
| True Peak vs Sample Peak toggle | Educational value | Low | Property: truePeak (boolean) |
| LUFS target overlay | Mix reference | Medium | Render -23 LUFS line |
| K-System scale variants | Bob Katz compliance | Low | K-12/K-14/K-20 as separate types |
| Correlation stereo display | Phase visualization | High | Polar plot or linear -1 to +1 |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Non-standard ballistics | Breaks expectations | Offer standard + "custom" mode |
| Auto-scale adjustment | Confusing for mixing | Fixed scales per standard |
| Integrated analyzer features | Scope creep | Separate visualization elements |
| Meter "skins" library | Bloat | User imports custom SVGs |

### Critical Implementation Requirements

**True Peak Meter (HIGH complexity):**
- Must implement 4x oversampling per ITU-R BS.1770-5
- Oversampling filter: half-polyphase length 12, 80dB stopband
- Higher ratios preferred (8x) for accuracy
- Report in dBTP (decibels True Peak)
- 4x oversampling has potential 0.5dB under-read

**LUFS Meters (HIGH complexity):**
- K-weighting filter per ITU-R BS.1770-4
- Gating: relative gate at -10 LU
- Momentary: 400ms sliding window
- Short-term: 3s sliding window
- Integrated: full program with gating
- Target: -23 LUFS ±0.2 LU (±1 LU for live)

**K-System Meters (MEDIUM complexity):**
- Combined peak + RMS display
- Peak follows sample peaks
- RMS uses 600ms integration
- Scale offset: K-12 = -12 dBFS, K-14 = -14 dBFS, K-20 = -20 dBFS
- Monitor calibration assumption: 83 dBSPL

### Dependencies on Existing Features

- Peak Meter (v1.0) as reference implementation
- Gain Reduction Meter (v1.0) for inverted display pattern
- Color zone rendering from existing meters
- JavaScript export must include ballistics calculations
- JUCE C++ side provides actual audio analysis (designer shows mock values)

---

## 7. Visualizations (10 remaining)

### Elements
- Scrolling Waveform
- Spectrum Analyzer
- Spectrogram
- Goniometer
- Vectorscope
- EQ Curve
- Compressor Curve
- Envelope Display
- LFO Display
- Filter Response

### Table Stakes - Rendering & Performance

| Element | Update Rate | Rendering Approach | Complexity | Notes |
|---------|-------------|-------------------|------------|-------|
| **Scrolling Waveform** | 30-60 FPS | Canvas 2D | HIGH | Circular buffer, scroll direction |
| **Spectrum Analyzer** | 20-60 FPS | Canvas 2D or SVG | HIGH | FFT size, window function, smoothing |
| **Spectrogram** | 20-30 FPS | Canvas 2D | HIGH | Waterfall display, color map |
| **Goniometer** | 30-60 FPS | Canvas 2D | MEDIUM | Lissajous L/R, persistence trails |
| **Vectorscope** | 30-60 FPS | Canvas 2D | MEDIUM | Polar stereo field, correlation |
| **EQ Curve** | On-change | SVG | MEDIUM | Interactive handles, frequency response |
| **Compressor Curve** | On-change | SVG | MEDIUM | Transfer function, knee visualization |
| **Envelope Display** | On-change | SVG | LOW | ADSR handles, curve editing |
| **LFO Display** | 30-60 FPS | Canvas 2D or SVG | LOW | Waveform shape, rate indicator |
| **Filter Response** | On-change | SVG | MEDIUM | Frequency response curve |

**Key findings:**
- Modern plugins use GPU acceleration (WebGL) for spectrum/spectrogram
- Canvas 2D acceptable for 30 FPS waveform/scope displays
- SVG preferred for static curves (EQ, compressor, envelope)
- Spectrogram "waterfall" style standard in 2026 plugins

### Table Stakes - Interaction Patterns

| Element | Interaction | Expected Behavior | Complexity |
|---------|-------------|------------------|------------|
| **EQ Curve** | Drag handles | Frequency, gain, Q adjustment | HIGH |
| **Compressor Curve** | Drag knee | Threshold, ratio, knee shape | MEDIUM |
| **Envelope Display** | Drag points | Time, level adjustment | MEDIUM |
| **Spectrum Analyzer** | Click | Frequency readout | LOW |
| **Waveform** | Drag | Zoom, pan | MEDIUM |

### Table Stakes - Visual Properties

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| FFT size options | 512, 1024, 2048, 4096, 8192 | Low | Dropdown property |
| Frequency scale | Linear, log, MEL | Medium | Scale transformation |
| dB range | -60 to 0, -96 to 0 | Low | Property: dbRange |
| Color gradients | Hot, cool, rainbow | Low | Color map property |
| Persistence/trails | Ghost image fade | Medium | Frame buffer blending |
| Grid overlay | Frequency/dB grid | Low | SVG overlay |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 3D spectrogram | Premium aesthetic | HIGH | WebGL required, or fake 3D with CSS |
| Custom color maps | Branding | LOW | Upload gradient image |
| Freeze display | Analysis hold | LOW | Boolean property |
| Peak frequency indicator | Mix reference | MEDIUM | Track & display peak bin |
| Interactive EQ handles | Modern UI | HIGH | Draggable SVG elements |
| Curve auto-smoothing | Professional look | MEDIUM | Bezier curve fitting |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time audio processing | Designer is visual only | Mock data for preview |
| Auto-EQ suggestions | AI overreach | Manual curve design |
| Preset curve library | Bloat | User saves/loads project |
| Multi-track visualization | Scope creep | Single channel focus |

### Critical Implementation Requirements

**Spectrum Analyzer:**
- Window functions: Hanning, Hamming, Blackman-Harris
- Smoothing: exponential or linear, configurable time constant
- Scale: logarithmic frequency axis standard
- Resolution vs speed tradeoff: FFT size property

**Spectrogram/Waterfall:**
- Color map: popular choices are "hot" (black→red→yellow→white), "cool" (blue→cyan→white)
- Scroll direction: typically top-to-bottom (oldest at bottom)
- Time resolution: balance between detail and performance
- Modern trend: 3D perspective depth (Oscarizor Pro style)

**Goniometer/Vectorscope:**
- Correlation meter integration: goniometer shows L/R phase relationship
- Vectorscope modes: Lissajous (L vs R), Polar (stereo field)
- Persistence: fade trails over 0.5-2 seconds
- Grid: concentric circles or box with correlation scale

**EQ Curve:**
- Interactive handles per band (frequency, gain, Q)
- Collision detection: handles don't overlap
- Real-time curve preview
- Filter types: bell, shelf, high-pass, low-pass, notch
- Visual curve: sum of all bands, displayed as smooth line

### Dependencies on Existing Features

- Waveform, Oscilloscope placeholders (v1.0) upgraded to functional
- Canvas rendering system (new)
- SVG path generation for curves
- Interactive drag system for handles
- Color property system
- Export: Canvas API calls or static SVG

---

## 8. Selection & Navigation (8 remaining)

### Elements
- Multi-Select Dropdown
- Combo Box
- Tab Bar
- Menu Button
- Breadcrumb
- Stepper
- Tag Selector
- Tree View

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| Checkbox list (Multi-Select) | Standard for routing, sends | MEDIUM | Array of selected indices |
| Type-to-filter (Combo Box) | DAW standard (preset search) | MEDIUM | Text input + dropdown hybrid |
| Active tab highlight (Tab Bar) | Visual state clarity | LOW | Selected index, active styles |
| Dropdown menu (Menu Button) | Context actions standard | MEDIUM | Click reveals menu list |
| Path separator (Breadcrumb) | Folder navigation clarity | LOW | " / " or " > " separators |
| +/- buttons (Stepper) | Increment/decrement standard | LOW | Integer value control |
| Multi-tag selection (Tag Selector) | Filter by category standard | MEDIUM | Checkboxes or pills |
| Expand/collapse (Tree View) | File browser standard | HIGH | Nested data structure |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Keyboard navigation | Power user efficiency | MEDIUM | Arrow keys, Enter to select |
| Search highlights | Find-as-you-type feedback | MEDIUM | Match highlighting |
| Lazy loading (Tree View) | Performance for large trees | HIGH | Load children on expand |
| Drag reorder (Tab Bar) | Customization | MEDIUM | Drag-drop tab order |
| Recent items (Dropdown) | Quick access | LOW | Store last N selections |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-complete predictions | Complex, locale-dependent | Simple filter matching |
| Infinite scroll | UX complexity | Pagination or fixed list |
| AI-powered search | Overkill | String matching sufficient |
| Custom tree icons | Bloat | Standard folder/file icons |

### Implementation Notes

**Tab Bar:**
- Common patterns: top tabs (page switcher), bottom tabs (mobile-style)
- Active state: underline, background color, or bold text
- Overflow: scroll or dropdown for many tabs

**Tree View:**
- Keyboard navigation: arrow keys expand/collapse, up/down navigate
- State: expanded/collapsed per node
- Lazy loading: fetch children on first expand
- Common in preset browsers for folder hierarchies

**Breadcrumb:**
- Pattern: Home > Category > Subcategory > Current
- Each segment clickable (navigates to that level)
- Current item non-clickable or highlighted

### Dependencies on Existing Features

- Dropdown, Checkbox, Radio Group (v1.0) as foundation
- Text input rendering
- Click/keyboard event handling
- Export JavaScript for interaction logic

---

## 9. Containers & Decorative (3 remaining)

### Elements
- Tooltip
- Spacer
- Window Chrome

### Table Stakes

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| Hover trigger (Tooltip) | Standard help pattern | MEDIUM | CSS :hover or JS mouseover |
| Delay before show | Prevent accidental tooltips | LOW | 500ms delay property |
| Auto-positioning | Avoid viewport overflow | MEDIUM | Calculate position based on target |
| Invisible layout (Spacer) | CSS standard | LOW | Transparent div with width/height |
| Title bar (Window Chrome) | Standalone mode | MEDIUM | Drag to move, close button |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Rich content tooltips | Parameter details | MEDIUM | HTML content, not just text |
| Smart positioning | Better UX | MEDIUM | Flip sides to stay in viewport |
| Dark/light theme (Tooltip) | Consistency | LOW | Match plugin theme |
| Custom chrome graphics | Branding | LOW | SVG import for title bar |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-tooltips on all elements | Annoying | User explicitly adds tooltips |
| Tooltip animations | Distracting | Simple fade-in |
| Window minimize/maximize | Scope creep (DAW handles) | Close button only |

### Implementation Notes

**Tooltip:**
- Positioning: top, bottom, left, right, auto
- Arrow/pointer to target element
- Max width to prevent long single line
- Accessibility: screen reader support

**Spacer:**
- Invisible but occupies layout space
- Use for alignment, spacing in groups
- Width/height properties only

**Window Chrome:**
- Only relevant for standalone preview mode
- DAW plugins don't need custom chrome (DAW provides window)
- Designer exports with optional chrome for HTML preview

### Dependencies on Existing Features

- Panel, Frame, Group Box (v1.0) containers as reference
- SVG import for chrome graphics
- CSS positioning
- Export HTML includes tooltip positioning logic

---

## 10. Specialized Audio Controls (12 remaining)

### Elements
- Piano Keyboard
- Drum Pad
- Pad Grid
- Step Sequencer
- XY Pad
- Wavetable Display
- Harmonic Editor
- Envelope Editor
- Sample Display
- Loop Points
- Patch Bay
- Signal Flow

### Table Stakes - Interaction Patterns

| Element | Primary Interaction | Expected Behavior | Complexity |
|---------|-------------------|------------------|------------|
| **Piano Keyboard** | Click key | Send MIDI note on/off | HIGH |
| **Drum Pad** | Click/press | Trigger sample, velocity-sensitive | MEDIUM |
| **Pad Grid** | Click pad | Trigger clip/sample | MEDIUM |
| **Step Sequencer** | Click cell | Toggle step on/off | HIGH |
| **XY Pad** | Drag | Control 2 parameters simultaneously | MEDIUM |
| **Wavetable Display** | Drag position | Morph between wavetables | HIGH |
| **Harmonic Editor** | Drag bars | Adjust harmonic levels | MEDIUM |
| **Envelope Editor** | Drag points | Shape ADSR envelope | HIGH |
| **Sample Display** | Drag markers | Set loop/slice points | HIGH |
| **Loop Points** | Drag handles | Define loop region | MEDIUM |
| **Patch Bay** | Drag cable | Route signal sources | HIGH |
| **Signal Flow** | Drag nodes | Connect processing blocks | HIGH |

### Table Stakes - Visual Properties

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| Key highlighting (Piano) | Show played notes | MEDIUM | Active state per key |
| Velocity sensitivity (Pads) | Performance expression | MEDIUM | Click position or pressure |
| Grid snapping (Sequencer) | Quantization standard | MEDIUM | Steps align to subdivision |
| Crosshair (XY Pad) | Position indicator | LOW | SVG lines at X/Y |
| Waveform rendering (Wavetable) | Visual feedback | HIGH | Canvas rendering |
| Harmonic bars (Harmonic Editor) | Frequency domain view | MEDIUM | Bar chart of partials |
| Curve types (Envelope) | Attack/decay shapes | MEDIUM | Linear, exponential, logarithmic |
| Waveform zoom (Sample Display) | Detail visibility | HIGH | Pinch/scroll to zoom |
| Cable animation (Patch Bay) | Connection clarity | HIGH | Bezier curves, plug simulation |
| Block icons (Signal Flow) | Module identification | MEDIUM | Icon per block type |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Octave range selector (Piano) | Compact layouts | LOW | Property: startOctave, octaveCount |
| Color-coded pads (Pad Grid) | Visual organization | LOW | Color array property |
| Euclidean rhythm generator (Sequencer) | Creative tool | MEDIUM | Algorithm for pattern distribution |
| XY parameter mapping | Advanced modulation | HIGH | Map X/Y to any parameters |
| Multi-layer wavetable | Professional synthesis | HIGH | 3D visualization |
| Odd harmonic filter (Harmonic) | Sound design tool | LOW | Checkboxes for odd/even |
| Envelope snapshots (Envelope) | A/B comparison | MEDIUM | Save/load states |
| Slice detection (Sample Display) | Transient markers | HIGH | Audio analysis algorithm |
| Snap-to-grid cables (Patch Bay) | Organized routing | MEDIUM | Align cable endpoints |
| Auto-layout (Signal Flow) | Clean diagrams | HIGH | Graph layout algorithm |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Built-in piano sounds | Out of scope | Visual element only, no audio |
| Sample library browser | Bloat | External file selection |
| Auto-rhythm generation | AI overreach | Manual step entry |
| Real-time XY recording | Complex state management | Static design tool |
| Wavetable synthesis engine | Out of scope | Visual display only |
| Auto-harmonic tuning | Too musical | Manual adjustment |
| Envelope presets library | Bloat | User saves templates |
| Audio playback in designer | Scope creep | Mock display only |

### Critical Implementation Requirements

**Piano Keyboard:**
- Range: configurable start note + octave count (1-8 octaves common)
- Key sizes: white keys wider than black keys
- MIDI note mapping: C4 = 60 (middle C)
- Visual feedback: highlight on press, sustain indication
- Velocity: optional velocity sensitivity via click position (vertical)

**Step Sequencer:**
- Grid: rows (tracks/notes) × columns (time steps)
- Step state: off, on, accent, ghost note
- Grid resolution: 16th, 8th, quarter notes
- Modern features: step length, probability, ratcheting (multiple triggers per step)
- UI pattern: click to toggle, drag to paint

**XY Pad:**
- Crosshair follows finger/mouse
- Snap-to-grid option
- Parameter labels: X axis (bottom), Y axis (left)
- Center origin option (bipolar -1 to +1)
- Boundary constraints: clamp to pad area
- Touch support: single or multi-touch

**Envelope Editor:**
- ADSR standard: Attack, Decay, Sustain, Release
- Extended: AHDSR (adds Hold), multi-segment
- Interaction: drag time (horizontal), level (vertical)
- Curve per segment: linear, exponential, logarithmic
- Visual: connected line segments, handles at points
- Grid: time divisions, level markings

**Modulation Matrix (already placeholder in v1.0):**
- Modern pattern: visual routing grid (sources × destinations)
- Alternative: list of routes with dropdowns
- Depth control per route (-100% to +100%)
- Visual feedback: active routes highlighted

### Dependencies on Existing Features

- Modulation Matrix placeholder (v1.0) upgraded to functional
- SVG rendering for complex graphics
- Canvas rendering for waveforms
- Interactive drag system
- Parameter binding for multi-parameter controls
- Export JavaScript for interaction logic
- Asset library for icons (signal flow, patch bay)

---

## UX Improvements (2 items)

### Visible Undo/Redo Buttons

**Table Stakes:**
- Undo/redo icons in toolbar (near logo)
- Disabled state when at history limit
- Keyboard shortcuts display on hover (Ctrl+Z, Ctrl+Y)

**Differentiators:**
- History preview dropdown (show list of actions)
- Undo/redo animation feedback

**Complexity:** LOW (UI placement and state binding)

### Keyboard Layout Support (QWERTZ)

**Table Stakes:**
- Detect keyboard layout
- Map shortcuts correctly (Z/Y swap for QWERTZ)
- Display correct shortcuts in tooltips

**Differentiators:**
- User-configurable shortcuts
- Shortcut cheat sheet (Help menu)

**Complexity:** LOW (keyboard event detection, mapping layer)

---

## Cross-Cutting Concerns

### Export Considerations

All 78 elements must support:
1. **HTML/CSS export** - Render to static HTML for JUCE WebView2
2. **JavaScript interaction** - Export event handlers, value formatting
3. **JUCE parameter binding** - Map to C++ backend parameters
4. **Mock preview mode** - Show realistic behavior in designer preview

**Complexity varies by element:**
- Simple displays (LEDs, labels): LOW (static HTML/CSS)
- Interactive controls (sliders, XY pad): MEDIUM (JavaScript event handling)
- Real-time visualizations (spectrum, meters): HIGH (Canvas API, frame loops)
- Standards-compliant meters: HIGH (ballistics calculations in JavaScript)

### Property Panel Complexity

All elements need property panels with:
- Common properties: position, size, colors, parameter binding
- Element-specific properties: meter ballistics, FFT size, step count, etc.
- Validation: min/max ranges, enum constraints
- Preview updates: live preview on canvas as properties change

**Recommended grouping:**
- Position & Size (shared)
- Visual Style (shared + element-specific)
- Behavior (element-specific)
- Data Binding (shared)

### Rendering Pipeline

**Three rendering modes needed:**
1. **Canvas rendering** - Real-time visualizations (waveform, spectrum, scopes)
2. **SVG rendering** - Interactive curves (EQ, compressor, envelope)
3. **HTML/CSS rendering** - Controls, displays, containers

**Decision tree:**
- Needs real-time updates (>20 FPS)? → Canvas
- Interactive curve editing? → SVG
- Static or low-frequency updates? → HTML/CSS

---

## MVP Recommendations by Category

### High Priority (Essential for professional credibility)

**Meters (industry standards):**
1. VU Meter - most common analog-style meter
2. True Peak Meter - essential for mastering plugins
3. LUFS Integrated - broadcast standard
4. K-14 Meter - pop/rock standard

**Visualizations (common in modern plugins):**
1. Spectrum Analyzer - universal analysis tool
2. EQ Curve - interactive EQ is table stakes
3. Envelope Display - synthesizer essential

**Controls (common interaction patterns):**
1. Stepped Knob - filter types, waveform selection
2. Center-Detented Knob - pan controls
3. Bipolar Slider - stereo width, detune
4. XY Pad - modern modulation standard

**Displays (parameter feedback):**
1. Numeric Display - raw values
2. Time Display - delay/reverb times
3. Note Display - tuning, MIDI

**Navigation (complex plugins need this):**
1. Tab Bar - multi-page UIs
2. Preset Browser upgrade - from placeholder to functional

### Medium Priority (Common but not universal)

**Meters:**
- RMS Meter, Correlation Meter

**Visualizations:**
- Goniometer, Compressor Curve, Filter Response

**Controls:**
- Toggle Switch, Segment Button, Concentric Dual Knob
- Multi-Slider (EQ bands)

**Specialized:**
- Piano Keyboard (instruments)
- Step Sequencer (rhythm plugins)
- Harmonic Editor (additive synthesis)

### Lower Priority (Nice-to-have)

**Meters:**
- PPM Type I/II (broadcast-specific)
- K-12, K-20 (niche use cases)
- Stereo Width Meter

**Visualizations:**
- Spectrogram, Vectorscope, Wavetable Display, LFO Display

**Specialized:**
- Drum Pad, Pad Grid, Patch Bay, Signal Flow

**Navigation:**
- Multi-Select Dropdown, Combo Box, Breadcrumb, Tree View, Tag Selector

**Containers:**
- Tooltip, Spacer, Window Chrome

**Controls:**
- Endless Encoder, Dot Indicator Knob, Arc Slider, Rotary Switch

---

## Dependencies & Phase Ordering Recommendations

### Foundation First
1. **Canvas rendering system** (NEW) - Required for all real-time visualizations
2. **Interactive SVG curves** (NEW) - Required for EQ/compressor/envelope editors
3. **Multi-parameter binding** (EXTEND) - Required for XY pad, concentric knobs

### Standards Implementation Second
4. **Meter ballistics engine** - Implement VU, RMS, PPM, LUFS, K-System standards
5. **True Peak oversampling** - ITU-R BS.1770 implementation

### Complex Interactions Third
6. **Drag-based editors** - Envelope, EQ curve, harmonic editor
7. **Grid-based input** - Step sequencer, piano keyboard, pad grid

### Polish Last
8. **Navigation components** - Tabs, breadcrumbs, tree view
9. **Tooltips and chrome** - UX enhancements

---

## Research Confidence Assessment

| Area | Confidence | Source Quality | Notes |
|------|------------|----------------|-------|
| Meter Standards | HIGH | Official ITU-R, IEC, EBU docs, industry articles | Standards are well-documented |
| K-System | HIGH | Bob Katz AES paper, multiple implementations | Creator's documentation available |
| Visualization Patterns | MEDIUM | Plugin reviews, developer forums | Current practices clear, specifics vary |
| Interaction Patterns | MEDIUM | WebSearch + existing plugins analysis | Common patterns identified |
| LUFS Implementation | HIGH | EBU R128 spec, plugin implementations | Standard is prescriptive |
| True Peak | HIGH | ITU-R BS.1770-5 specification | Algorithm clearly defined |
| XY Pad Patterns | MEDIUM | Modern plugin examples | Common but no formal standard |
| Step Sequencer UI | MEDIUM | DAW and plugin examples | Patterns well-established |
| Navigation Components | MEDIUM | General UI/UX patterns | Not audio-specific but applicable |

---

## Sources

### Standards & Specifications
- [ITU-R BS.1770-5 (2023)](https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1770-5-202311-I!!PDF-E.pdf) - Loudness and True Peak metering
- [EBU R 128](https://en.wikipedia.org/wiki/EBU_R_128) - Loudness normalization
- [IEC 60268-10/18](https://en.wikipedia.org/wiki/Peak_programme_meter) - PPM standards
- [Bob Katz K-System](https://www.meterplugs.com/blog/2016/10/14/k-system-metering-101.html) - Integrated metering

### Meter Ballistics
- [VU Meter Ballistics](https://en.wikipedia.org/wiki/VU_meter) - 300ms integration standard
- [VU And PPM Audio Metering](https://www.sound-au.com/project55.htm) - Technical details
- [Audio Metering Guide - SonicScoop](https://sonicscoop.com/everything-need-know-audio-meteringand/) - Industry overview
- [PPM Standards Comparison](https://www.soundonsound.com/sound-advice/q-whats-difference-between-ppm-and-vu-meters) - Type I vs Type II

### LUFS & Loudness
- [HoRNet ELM128 MK2](https://www.hornetplugins.com/plugins/hornet-elm128-mk2/) - EBU R128 implementation reference
- [Youlean Loudness Meter](https://youlean.co/youlean-loudness-meter/) - Free standards-compliant implementation
- [Loudness Metering Explained - Waves](https://www.waves.com/loudness-metering-explained) - Educational resource

### Visualizations
- [iZotope Insight 2](https://www.izotope.com/en/products/insight/features/spectrogram.html) - Professional spectrogram/vectorscope
- [Voxengo SPAN](https://www.voxengo.com/product/span/) - Spectrum analyzer reference
- [Blue Cat's Oscilloscope Multi](https://www.bluecataudio.com/Products/Product_OscilloscopeMulti/) - Multi-track waveform display
- [Best Spectrum Analyzer Plugins](https://emastered.com/blog/best-spectrum-analyzer-plugins) - 2026 market survey

### Interaction Patterns
- [MeldaProduction XY Pads](https://www.meldaproduction.com/tutorials/xy_pads_morphing_gf) - XY pad modulation tutorial
- [KAOSS PAD Plugin](https://kosssound.com/kaoss-pad/) - XY + modulation integration
- [Best Sequencer Plugins 2026](https://pluginoise.com/11-best-sequencer-vst-plugins/) - Step sequencer patterns
- [HISE Piano Roll UI Discussion](https://forum.hise.audio/topic/12030/piano-roll-ui-component) - Piano keyboard implementation

### Correlation & Stereo Imaging
- [HoRNet StereoView](https://www.hornetplugins.com/plugins/hornet-stereoview/) - Free correlation meter
- [Voxengo Correlometer](https://www.voxengo.com/product/correlometer/) - Multiband correlation
- [Best Stereo Imaging Plugins 2026](https://pluginoise.com/9-best-stereo-imaging-plugins/) - Market overview

### Navigation & Preset Management
- [GForce OB-E v2.5 Preset Browser](https://oberheim.com/news/gforce-releases-oberheim-ob-e-v2-5-sem-v1-5-free-update-with-new-preset-browser/) - Modern preset browser with tagging
- [Best Preset Browser Discussions](https://www.kvraudio.com/forum/viewtopic.php?p=6053200) - User expectations
- [Breadcrumbs UX Best Practices 2026](https://www.pencilandpaper.io/articles/breadcrumbs-ux) - Navigation patterns

### General UI/UX
- [Mobile Navigation UX 2026](https://www.designstudiouiux.com/blog/mobile-navigation-ux/) - Tab bar patterns
- [Tree View Libraries 2026](https://www.cssscript.com/best-tree-view/) - Implementation references
- [JUCE Audio Parameter Docs](https://docs.juce.com/master/classAudioProcessorParameter.html) - Parameter binding reference

---

**Research completed:** 2026-01-26
**Total sources consulted:** 40+ web searches, official specifications, plugin documentation
**Next step:** Synthesize into phase-by-phase roadmap for v1.2 milestone
