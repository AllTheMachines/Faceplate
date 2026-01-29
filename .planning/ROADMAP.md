# Roadmap: VST3 WebView UI Designer

## Milestones

- ✅ **v1.0 MVP** — Phases 1-13 (shipped 2026-01-25)
- ✅ **v1.1 SVG Import System** — Phases 14-18 (shipped 2026-01-26)
- ✅ **v1.2 Complete Element Taxonomy** — Phases 19-30, 27.1 (shipped 2026-01-27)
- ✅ **v1.3 Workflow & Protection** — Phases 31-33 (shipped 2026-01-27)
- ✅ **v1.4 Container Editing System** — Phases 34-35 (shipped 2026-01-27)
- ✅ **v1.5 Export & Asset Management** — Phases 36-37 (shipped 2026-01-27)
- ✅ **v1.6 Multi-Window System** — Phase 38 (shipped 2026-01-28)
- ✅ **v1.7 Parameter Sync** — Phase 39 (shipped 2026-01-28)
- 🚧 **v1.8 Bug Fixes & Improvements** — Phase 40 (in progress)

## Current Milestone: v1.8 Bug Fixes & Improvements

### Phase 40: Bug Fixes & UI Improvements
**Goal**: Fix reported bugs and add quality-of-life improvements
**Plans**: 8 plans in 2 waves

Plans:
- [ ] 40-01-PLAN.md — Fix critical state bugs (version, name validation, multi-window duplicate)
- [ ] 40-02-PLAN.md — Add Button borderWidth property
- [ ] 40-03-PLAN.md — Fix color picker and label/value distance
- [ ] 40-04-PLAN.md — Add folder export option
- [ ] 40-05-PLAN.md — Container editor snap-to-grid
- [ ] 40-06-PLAN.md — Container editor copy/paste/duplicate
- [ ] 40-07-PLAN.md — Alt/Ctrl+click to deselect from multi-select
- [ ] 40-08-PLAN.md — Fix font weight display and preview consistency

#### Wave Structure

| Wave | Plans | Description |
|------|-------|-------------|
| 1 | 40-01, 40-02, 40-03, 40-04, 40-08 | Critical bugs & folder export (parallel) |
| 2 | 40-05, 40-06, 40-07 | Container editor & selection (parallel) |

#### Bugs Addressed

| ID | Description | Plan | Priority |
|----|-------------|------|----------|
| BUG-40-01 | Font weight names incorrect in preview | 40-08 | High |
| BUG-40-02 | Button border thickness not editable | 40-02 | Medium |
| BUG-40-03 | Duplicate name error after delete/recreate | 40-01 | High |
| BUG-40-04 | Color picker shows wrong color | 40-03 | Medium |
| BUG-40-05 | Label/value distance not editable | 40-03 | Medium |
| BUG-40-06 | Multi-window duplicate affects other windows | 40-01 | High |
| BUG-40-07 | Missing version causes migration error | 40-01 | High |

#### Features Addressed

| ID | Description | Plan | Priority |
|----|-------------|------|----------|
| FEAT-40-01 | Direct folder export | 40-04 | High |
| FEAT-40-02 | Container editor snap-to-grid | 40-05 | Medium |
| FEAT-40-03 | Container editor copy/paste | 40-06 | Medium |
| FEAT-40-06 | Alt/Ctrl+click deselect | 40-07 | Medium |

#### Deferred (Low Priority)

| ID | Description | Reason |
|----|-------------|--------|
| FEAT-40-04 | VST sync bidirectional | Requires C++ changes in VST repos |
| FEAT-40-05 | Merge INSTvst/EFXvst | Architectural scope too large for bug fix phase |
| FEAT-40-07 | Auto-generate UI from specs | New skill, not a bug fix |
| FEAT-40-08 | Layers system | Major feature, defer to v1.9 |

**Success Criteria:**
1. Font weights render correctly in preview matching canvas
2. Border thickness editable on all elements that support borders
3. Element naming works correctly after delete/recreate cycle
4. Color picker displays correct color matching hex value
5. Label/value distance configurable in properties panel
6. Multi-select duplication only affects current window
7. Project version stored in JSON with proper migration on load
8. Export can output to folder without creating zip
9. Container editor has snap-to-grid and copy/paste support
10. Alt/Ctrl+click deselects individual elements from multi-selection

---

## Phases

<details>
<summary>v1.0 MVP (Phases 1-13) - SHIPPED 2026-01-25</summary>

### Phase 1: Project Setup
**Goal**: Vite + React + TypeScript development environment running
**Plans**: 3 plans

Plans:
- [x] 01-01: Initialize Vite project with React + TypeScript
- [x] 01-02: Install core dependencies (@dnd-kit, Zustand, Tailwind)
- [x] 01-03: Set up development tooling (ESLint, Prettier, Vitest)

### Phase 2: State Management
**Goal**: Zustand store with element and canvas slices
**Plans**: 2 plans

Plans:
- [x] 02-01: Create store architecture with slices
- [x] 02-02: Implement undo/redo system

### Phase 3: Three-Panel Layout
**Goal**: Basic UI shell with palette, canvas, and property panel
**Plans**: 2 plans

Plans:
- [x] 03-01: Build responsive three-panel layout
- [x] 03-02: Implement dark theme with Tailwind

### Phase 4: Element Palette
**Goal**: Left sidebar with draggable element types
**Plans**: 2 plans

Plans:
- [x] 04-01: Build palette UI with categorized elements
- [x] 04-02: Implement drag-from-palette with @dnd-kit

### Phase 5: Canvas - Core Rendering
**Goal**: Elements render on canvas with position and size
**Plans**: 4 plans

Plans:
- [x] 05-01: Canvas component with configurable dimensions
- [x] 05-02: Render Knob, Slider, Button elements
- [x] 05-03: Render Label and Image elements
- [x] 05-04: Render Meter element

### Phase 6: Canvas - Manipulation
**Goal**: Drag to move, resize handles, selection
**Plans**: 5 plans

Plans:
- [x] 06-01: Selection system (click, multi-select)
- [x] 06-02: Drag elements on canvas
- [x] 06-03: Resize handles with constrained drag
- [x] 06-04: Arrow key nudging
- [x] 06-05: Copy/paste with offset

### Phase 7: Property Panel
**Goal**: Right sidebar shows editable properties for selected element
**Plans**: 3 plans

Plans:
- [x] 07-01: Property panel UI framework
- [x] 07-02: Common properties (position, size, colors)
- [x] 07-03: Element-specific properties

### Phase 8: Canvas Features
**Goal**: Background, pan/zoom, snap-to-grid, element locking
**Plans**: 4 plans

Plans:
- [x] 08-01: Canvas background (color, gradient, image)
- [x] 08-02: Pan and zoom viewport
- [x] 08-03: Snap-to-grid system
- [x] 08-04: Element locking (individual and lock-all)

### Phase 9: Container Elements
**Goal**: Panel, Frame, GroupBox, Collapsible containers
**Plans**: 2 plans

Plans:
- [x] 09-01: Container element types and rendering
- [x] 09-02: Visual hierarchy and z-index

### Phase 10: Form Controls
**Goal**: Dropdown, Checkbox, RadioGroup, TextField elements
**Plans**: 2 plans

Plans:
- [x] 10-01: Form control element types
- [x] 10-02: Form control property panels

### Phase 11: Audio Displays
**Goal**: dB Display, Frequency Display, GR Meter, placeholders
**Plans**: 3 plans

Plans:
- [x] 11-01: Audio display elements
- [x] 11-02: Waveform, Oscilloscope, Modulation Matrix, Preset Browser placeholders
- [x] 11-03: Decorative elements (Rectangle, Line)

### Phase 12: Export System
**Goal**: JUCE WebView2 bundle and HTML preview
**Plans**: 5 plans

Plans:
- [x] 12-01: Export architecture and file generation
- [x] 12-02: HTML/CSS export with embedded fonts
- [x] 12-03: JavaScript export with dynamic JUCE bridge
- [x] 12-04: C++ snippets for WebSliderRelay
- [x] 12-05: Preview mode with mock JUCE

### Phase 13: Project Persistence & Polish
**Goal**: Save/load JSON, template import, final refinements
**Plans**: 16 plans

Plans:
- [x] 13-01: JSON save/load with Zod validation
- [x] 13-02: Template import from existing projects
- [x] 13-03: Font selection (Inter, Roboto, Roboto Mono)
- [x] 13-04: RangeSlider (dual-thumb slider)
- [x] 13-05: SVG Design Mode for layer assignment
- [x] 13-06: Wire ModulationMatrix property panel
- [x] 13-07: Wire PresetBrowser property panel
- [x] 13-08: Wire Waveform property panel
- [x] 13-09: Wire Oscilloscope property panel
- [x] 13-10: Wire RangeSlider property panel
- [x] 13-11: Make slider/meter elements rectangular (remove rounded corners)
- [x] 13-12: Change default element color from blue to grey
- [x] 13-13: Wire ModulationMatrix element on canvas
- [x] 13-14: Fix RangeSlider rendering
- [x] 13-15: Update templates with new defaults
- [x] 13-16: Final verification and cleanup

</details>

<details>
<summary>v1.1 SVG Import System (Phases 14-18) - SHIPPED 2026-01-26</summary>

### Phase 14: Security Foundation & Upload Pipeline
**Goal**: All SVG rendering is sanitized and protected against XSS attacks
**Plans**: 4 plans

Plans:
- [x] 14-01: SVG Validator with TDD (size, element count, DOCTYPE, dangerous elements)
- [x] 14-02: SVG Sanitizer with DOMPurify and TDD
- [x] 14-03: SafeSVG component and toast infrastructure
- [x] 14-04: Integration (serialization re-sanitization, export CSP)

### Phase 15: Asset Library Storage & UI
**Goal**: Users can import, organize, and browse SVG assets in a central library
**Plans**: 5 plans

Plans:
- [x] 15-01: AssetsSlice foundation (types, state, store integration)
- [x] 15-02: Import dialog with preview and validation
- [x] 15-03: Asset Library panel with categories, search, and tab switching
- [x] 15-04: Asset interactions (rename, delete, drag-to-canvas)
- [x] 15-05: Gap closure: Wire ImageRenderer to render asset SVG content

### Phase 16: Static SVG Graphics
**Goal**: Users can place scalable SVG graphics on canvas as decorative elements
**Plans**: 5 plans

Plans:
- [x] 16-01: Element type & renderer (SvgGraphicElementConfig, SvgGraphicRenderer)
- [x] 16-02: Property panel (SvgGraphicProperties, getSVGNaturalSize utility)
- [x] 16-03: Integration (palette, Element.tsx, PropertyPanel, drag-drop)
- [x] 16-04: Export support (HTML/CSS generators)
- [x] 16-05: Aspect ratio locking (resize hook modification)

### Phase 17: Interactive SVG Knobs
**Goal**: Users can import custom knob designs with rotation animation mapped to parameter values
**Plans**: 6 plans

Plans:
- [x] 17-01: KnobStyle type and KnobStylesSlice store
- [x] 17-02: Layer detection utilities (detectKnobLayers, extractLayer, applyColorOverride)
- [x] 17-03: StyledKnobRenderer (layer-based SVG knob rendering)
- [x] 17-04: LayerMappingDialog and ManageKnobStylesDialog
- [x] 17-05: KnobProperties extensions (style dropdown, color overrides)
- [x] 17-06: Project serialization and HTML/CSS export

### Phase 18: Export & Polish
**Goal**: Exported JUCE bundles include sanitized, optimized SVG with responsive scaling
**Plans**: 6 plans

Plans:
- [x] 18-01: SVGO wrapper with safe optimization settings
- [x] 18-02: Responsive scaling CSS/JS for exported HTML
- [x] 18-03: Export integration (SVGO + responsive scaling)
- [x] 18-04: Browser preview for export verification
- [x] 18-05: JUCE integration README in exported bundle
- [x] 18-06: Export workflow polish and error messages

</details>

<details>
<summary>v1.2 Complete Element Taxonomy (Phases 19-30) - SHIPPED 2026-01-27</summary>

### Phase 19: Architecture Refactoring
**Goal**: Codebase scales gracefully from 25 to 103 element types without technical debt
**Dependencies**: None (prerequisite for all other v1.2 phases)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, UX-01, UX-02
**Plans**: 6 plans

Plans:
- [x] 19-01-PLAN.md — Split TypeScript unions by category
- [x] 19-02-PLAN.md — Element renderer registry pattern
- [x] 19-03-PLAN.md — Property panel registry pattern
- [x] 19-04-PLAN.md — Undo/redo buttons and QWERTZ support
- [x] 19-05-PLAN.md — File organization by category
- [x] 19-06-PLAN.md — Code splitting infrastructure

**Success Criteria:**
1. PropertyPanel.tsx uses Map-based component registry instead of switch statements (<100 LOC vs 200+)
2. Element renderers registered via Map lookup pattern
3. Code splitting infrastructure established with lazy loading for element categories
4. TypeScript unions split by category with compilation time <10 seconds
5. Palette supports 2-level category hierarchy with search/filter
6. Undo/redo buttons visible in toolbar near logo
7. Keyboard shortcuts detect QWERTZ and non-US layouts correctly

### Phase 20: Simple Controls
**Goal**: Users can design UIs with all rotary and linear control variants
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: ROT-01, ROT-02, ROT-03, LIN-01, LIN-02, LIN-03, LIN-04, LIN-05
**Plans**: 4 plans

Plans:
- [x] 20-01-PLAN.md — Rotary control variants (Stepped, Center-Detent, Dot Indicator)
- [x] 20-02-PLAN.md — Bipolar and Crossfade sliders
- [x] 20-03-PLAN.md — Notched and Arc sliders
- [x] 20-04-PLAN.md — Multi-Slider for EQ/multi-band

**Success Criteria:**
1. User can add Stepped Knob with configurable detent positions (12, 24, 36, 48, 64 steps)
2. User can add Center-Detented Knob that snaps to center position when dragging near 50%
3. User can add Dot Indicator Knob with minimal dot-style visual indicator
4. User can add Bipolar Slider with center-zero default and color zones
5. User can add Crossfade Slider for A/B balance (DJ-style)
6. User can add Notched Slider with visible detent indicators
7. User can add Arc Slider following curved path (90-270 degree range)
8. User can add Multi-Slider with parallel sliders for EQ/multi-band controls

### Phase 21: Buttons & Switches
**Goal**: Users can design UIs with all button and switch variants
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: BTN-01, BTN-02, BTN-03, BTN-04, BTN-05, BTN-06, BTN-07
**Plans**: 4 plans

Plans:
- [x] 21-01-PLAN.md — Built-in icon system + Icon Button, Kick Button, Toggle Switch, Power Button
- [x] 21-02-PLAN.md — Rocker Switch, Rotary Switch, Segment Button
- [x] 21-03-PLAN.md — Property panels for all 7 types + palette entries
- [x] 21-04-PLAN.md — Export support (HTML/CSS generators)

**Success Criteria:**
1. User can add Icon Button (toolbar style, icon-only, no text label)
2. User can add Toggle Switch (iOS-style slide with on/off states)
3. User can add Rocker Switch (3-position up/center/down with visual states)
4. User can add Rotary Switch (vintage rotating selector with position labels)
5. User can add Kick Button (momentary with press animation)
6. User can add Segment Button (multi-segment mode selection like iOS UISegmentedControl)
7. User can add Power Button (on/off with LED indicator)

### Phase 22: Value Displays & LEDs
**Goal**: Users can display formatted parameter values and status indicators
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04, DISP-05, DISP-06, DISP-07, DISP-08, LED-01, LED-02, LED-03, LED-04, LED-05, LED-06
**Plans**: 4 plans

Plans:
- [x] 22-01-PLAN.md — Value display types + renderers (Numeric, Time, %, Ratio, Note, BPM, Editable, Multi-Value)
- [x] 22-02-PLAN.md — LED types + renderers (Single, Bi-Color, Tri-Color, Array, Ring, Matrix)
- [x] 22-03-PLAN.md — Property panels for all 14 types + palette entries
- [x] 22-04-PLAN.md — Export support (HTML/CSS generators)

**Success Criteria:**
1. User can add Numeric Display with decimal precision control
2. User can add Time Display with format options (ms, seconds, bars:beats:ticks)
3. User can add Percentage Display (0-100% with % symbol)
4. User can add Ratio Display (compression ratio, e.g., 4:1, infinity:1)
5. User can add Note Display (MIDI note to musical note, e.g., 60 → C4)
6. User can add BPM Display (tempo value with BPM label)
7. User can add Editable Display (double-click to edit, validates input)
8. User can add Multi-Value Display (stacked values for multi-band displays)
9. User can add Single LED (on/off with color property)
10. User can add Bi-Color LED (green/red states for signal/clip)
11. User can add Tri-Color LED (off/yellow/red for status)
12. User can add LED Array (8-24 LEDs in row for level indication)
13. User can add LED Ring (circular around knob for value indication)
14. User can add LED Matrix (grid pattern for multi-dimensional display)

### Phase 23: Professional Meters
**Goal**: Users can add standards-compliant audio meters with correct ballistics
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: MTR-01, MTR-02, MTR-03, MTR-04, MTR-05, MTR-06, MTR-07, MTR-08, MTR-09, MTR-10, MTR-11, MTR-12, MTR-13
**Plans**: 6 plans

Plans:
- [x] 23-01-PLAN.md — Shared meter infrastructure (utilities, SegmentedMeter, MeterScale, PeakHoldIndicator)
- [x] 23-02-PLAN.md — RMS, VU, PPM Type I/II meter types + renderers (8 element types)
- [x] 23-03-PLAN.md — True Peak, LUFS meter types + renderers (8 element types)
- [x] 23-04-PLAN.md — K-System, Correlation, Stereo Width meter types + renderers (8 element types)
- [x] 23-05-PLAN.md — Property panels + palette entries (24 meter types)
- [x] 23-06-PLAN.md — Export support (CSS/HTML generators)

**Success Criteria:**
1. User can add RMS Meter with 300ms averaging window
2. User can add VU Meter with ANSI C16.5-1942 ballistics (300ms integration)
3. User can add PPM Type I with IEC 60268-10 ballistics (10ms attack, 1.5s release)
4. User can add PPM Type II with BBC standard ballistics (10ms attack, 2.8s release)
5. User can add True Peak Meter with ITU-R BS.1770-5 4x oversampling
6. User can add LUFS Momentary with EBU R128 K-weighting (400ms window)
7. User can add LUFS Short-term with EBU R128 K-weighting (3s window)
8. User can add LUFS Integrated with EBU R128 K-weighting (full program)
9. User can add K-12, K-14, K-20 Meters with Bob Katz ballistics (600ms integration)
10. User can add Correlation Meter (phase, -1 to +1 range)
11. User can add Stereo Width Meter (M/S ratio, 0-200%)
12. All meters support configurable color zones (green <-18, yellow <-6, red >=0)
13. All meters support peak hold indicator with configurable hold time (1-3s)

### Phase 24: Navigation & Selection
**Goal**: Users can add navigation and selection components for complex UIs
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08
**Plans**: 6 plans

Plans:
- [x] 24-01-PLAN.md — Stepper and Breadcrumb types + renderers
- [x] 24-02-PLAN.md — Multi-Select Dropdown, Combo Box, Menu Button types + renderers
- [x] 24-03-PLAN.md — Tab Bar and Tag Selector types + renderers
- [x] 24-04-PLAN.md — Tree View with react-arborist
- [x] 24-05-PLAN.md — Property panels + palette entries (8 element types)
- [x] 24-06-PLAN.md — Export support (CSS/HTML generators)

**Success Criteria:**
1. User can add Multi-Select Dropdown with checkboxes for multiple selections
2. User can add Combo Box (dropdown + text entry for filtering)
3. User can add Tab Bar for section switching with configurable tab count
4. User can add Menu Button that opens context menu on click
5. User can add Breadcrumb for hierarchy navigation
6. User can add Stepper (+/- buttons for integer/discrete values)
7. User can add Tag Selector for tag-based filtering
8. User can add Tree View using react-arborist for hierarchical lists

### Phase 25: Real-Time Visualizations
**Goal**: Users can add real-time audio visualizations with Canvas rendering
**Dependencies**: Phase 19 (requires code splitting infrastructure)
**Requirements**: VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05
**Plans**: 5 plans

Plans:
- [x] 25-01-PLAN.md — Types, mock data utilities, Canvas setup hook
- [x] 25-02-PLAN.md — Scrolling Waveform and Spectrum Analyzer renderers
- [x] 25-03-PLAN.md — Spectrogram, Goniometer, Vectorscope renderers
- [x] 25-04-PLAN.md — Property panels and palette entries
- [x] 25-05-PLAN.md — Export support (CSS/HTML/JS generation)

**Success Criteria:**
1. User can add Scrolling Waveform (time-domain with moving display)
2. User can add Spectrum Analyzer with FFT size options (512-8192), frequency scale (linear/log/MEL), and color gradients
3. User can add Spectrogram (waterfall display with time-frequency color map)
4. User can add Goniometer (L/R phase display, circular)
5. User can add Vectorscope (Lissajous mode for stereo correlation)
6. All visualizations render at 30 FPS with mock data in designer
7. Canvas elements export correctly to JUCE WebView2 with JavaScript draw functions

### Phase 26: Interactive Curves
**Goal**: Users can add interactive curve editors for EQ, dynamics, and modulation
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: VIZ-06, VIZ-07, VIZ-08, VIZ-09, VIZ-10
**Plans**: 5 plans

Plans:
- [x] 26-01-PLAN.md — Types, audio math utilities, curve rendering utilities
- [x] 26-02-PLAN.md — EQ Curve and Filter Response renderers
- [x] 26-03-PLAN.md — Compressor Curve and Envelope Display renderers
- [x] 26-04-PLAN.md — LFO Display renderer, property panels, palette entries
- [x] 26-05-PLAN.md — Export support (CSS/HTML/JS generation)

**Success Criteria:**
1. User can add EQ Curve with draggable frequency/gain/Q handles
2. User can add Compressor Curve with draggable threshold, ratio, knee parameters
3. User can add Envelope Display with ADSR visualization and curve types
4. User can add LFO Display with waveform shape (sine, triangle, saw, square)
5. User can add Filter Response showing cutoff/resonance curve

### Phase 27: Containers & Polish
**Goal**: Users can add remaining container elements and UX refinements
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: CONT-01, CONT-02, CONT-03
**Plans**: 4 plans

Plans:
- [x] 27-01-PLAN.md — Tooltip element with DOM overlay and hover detection
- [x] 27-02-PLAN.md — Horizontal and Vertical Spacer elements with fixed/flexible modes
- [x] 27-03-PLAN.md — Window Chrome element with macOS/Windows/neutral button styles
- [x] 27-04-PLAN.md — Export support (HTML/CSS generators for all 4 new types)

**Success Criteria:**
1. User can add Tooltip (hover information with configurable position)
2. User can add Spacer (invisible layout element with fixed/flexible sizing)
3. User can add Window Chrome (title bar with close/minimize buttons, resize handles)

### Phase 27.1: Post-Phase Bug Fixes
**Goal**: Fix all rendering, drag-drop, and UI bugs discovered during v1.2 testing
**Dependencies**: Phase 27 (issues found during verification)
**Plans**: 5 plans

Plans:
- [x] 27.1-01-PLAN.md — Fix Canvas visualizations and curves not rendering (BUG-08, BUG-09)
- [x] 27.1-02-PLAN.md — Fix Navigation category blank page and logo timestamp (BUG-10, BUG-12)
- [x] 27.1-03-PLAN.md — Fix Crossfade Slider, LED Ring, and meters in preview (BUG-01, BUG-05, BUG-06)
- [x] 27.1-04-PLAN.md — Fix switch styling and button fonts in preview (BUG-02, BUG-03, BUG-04)
- [x] 27.1-05-PLAN.md — Verify spacer behavior and element interactivity (BUG-07, BUG-11)

**Bug List:**
- BUG-01: Crossfade Slider not showing track in preview
- BUG-02: Rocker Switch looks different in preview vs canvas
- BUG-03: Rotary Switch looks different in preview vs canvas
- BUG-04: Some buttons have different fonts in preview
- BUG-05: LED Ring not centered + messed up in HTML preview
- BUG-06: All new professional meters not rendered correctly in preview
- BUG-07: Spacers not shown in HTML preview (verify if intentional)
- BUG-08: All visualizations cannot be dragged to canvas
- BUG-09: All curves invisible on canvas (elements exist but lines not visible)
- BUG-10: Navigation & Selection category causes blank page
- BUG-11: Many/all elements have no interactivity (needs investigation)
- BUG-12: Logo shows current time on reload instead of last project update time

**Success Criteria:**
1. All 5 visualization types can be dragged to canvas and render visibly
2. All 5 curve types can be dragged to canvas with visible lines
3. Navigation & Selection category opens normally
4. All professional meters render correctly in HTML preview
5. Crossfade slider shows track gradient in preview
6. LED Ring is centered and renders correctly
7. Switch elements match between canvas and preview
8. Logo shows project last-modified time

### Phase 28: Specialized Audio (Part 1)
**Goal**: Users can add MIDI input and trigger controls
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: SPEC-01, SPEC-02, SPEC-03

**Success Criteria:**
1. User can add Piano Keyboard using react-piano with configurable range (C0-C8), velocity sensitivity, and note labels
2. User can add Drum Pad (velocity-sensitive trigger with visual feedback)
3. User can add Pad Grid (4x4 or 4x8 layout for drum machines)

### Phase 29: Specialized Audio (Part 2)
**Goal**: Users can add sequencing and modulation controls
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: SPEC-04, SPEC-05, SPEC-06

**Success Criteria:**
1. User can add Step Sequencer (pattern grid with 8-32 steps, note/velocity per step)
2. User can add XY Pad (2D control surface with crosshair, snap-to-grid, parameter labels)
3. User can add Wavetable Display (3D waveform visualization)

### Phase 30: Specialized Audio (Part 3)
**Goal**: Users can add synthesis editors and routing visualizations
**Dependencies**: Phase 19 (requires registry pattern)
**Requirements**: SPEC-07, SPEC-08, SPEC-09, SPEC-10, SPEC-11, SPEC-12

**Success Criteria:**
1. User can add Harmonic Editor (additive synthesis bar chart for partials)
2. User can add Envelope Editor (draggable ADSR points with curve types)
3. User can add Sample Display (audio file waveform with zoom/pan)
4. User can add Loop Points (start/end markers with draggable handles)
5. User can add Patch Bay (cable routing visualization for modular synthesis)
6. User can add Signal Flow (block diagram for audio routing)

</details>

<details>
<summary>v1.3 Workflow & Protection (Phases 31-33) - SHIPPED 2026-01-27</summary>

### Phase 31: Undo/Redo History Panel
**Goal**: Visible debug panel showing every state change for debugging and transparency
**Plans**: 2 plans - completed 2026-01-27

### Phase 32: Unsaved Changes Protection
**Goal**: Users never accidentally lose work due to navigation or browser close
**Plans**: 2 plans - completed 2026-01-27

### Phase 33: Adjustable Snap Grid
**Goal**: Visible background grid for precise element alignment
**Plans**: 1 plan - completed 2026-01-27

</details>

<details>
<summary>v1.4 Container Editing System (Phases 34-35) - SHIPPED 2026-01-27</summary>

### Phase 34: Container Element Editor
**Goal**: Users can add child elements to containers via dedicated editing interface
**Plans**: 1 plan - completed 2026-01-27

### Phase 35: Container Overflow & Scrollbars
**Goal**: Containers handle child elements that exceed their bounds gracefully
**Plans**: 1 plan - completed 2026-01-27

</details>

<details>
<summary>v1.5 Export & Asset Management (Phases 36-37) - SHIPPED 2026-01-27</summary>

### Phase 36: SVG Export with Named Layers
**Goal**: Export individual elements as SVG with meaningful layer names for re-import workflow
**Plans**: 1 plan - completed 2026-01-27

### Phase 37: Font Management System
**Goal**: Centralized font management with user directory selection and export bundling
**Plans**: 5 plans - completed 2026-01-27

</details>

<details>
<summary>v1.6 Multi-Window System (Phase 38) - SHIPPED 2026-01-28</summary>

### Phase 38: Multi-Window System
**Goal**: Projects support multiple windows with independent settings and navigation
**Plans**: 1 plan (direct implementation) - completed 2026-01-28

**Requirements delivered:**
- WIN-01: Multiple windows per project with independent dimensions and backgrounds
- WIN-02: Window types: 'release' and 'developer' with export filtering
- WIN-03: Window tabs UI with rename, delete, duplicate, type toggle
- WIN-04: Window properties panel (name, type, width, height, background)
- WIN-05: Copy/paste elements between windows
- WIN-06: Button navigation action to switch windows
- WIN-07: Multi-window browser preview with tab navigation
- WIN-08: Multi-window export bundle with folder per window
- WIN-09: Project serialization v2.0.0 with automatic migration
- WIN-10: Per-window viewport state preservation

**Success Criteria:**
1. User can create multiple windows in a project
2. Each window has independent dimensions and background
3. User can mark windows as 'developer' to exclude from default export
4. User can switch between windows via tabs
5. User can copy elements from one window and paste in another
6. User can configure button to navigate to another window
7. Browser preview shows all windows with tab navigation
8. Export creates separate folders for each window
9. Old v1.x projects migrate automatically to v2.0.0 format

</details>

<details>
<summary>v1.7 Parameter Sync (Phase 39) - SHIPPED 2026-01-28</summary>

### Phase 39: Parameter Sync
**Goal**: Exported bundles sync UI state with C++ parameter values when editor opens
**Plans**: 1 plan - completed 2026-01-28

**Requirements delivered:**
- SYNC-01 through SYNC-08: Parameter synchronization infrastructure
- DOC-01 through DOC-04: JUCE integration documentation

**Success Criteria:**
1. Export generates `setupParameterSyncListener()` in bindings.js
2. Listener handles `__juce__paramSync` event from C++ backend
3. All parameter-bound elements update visual state (knobs, sliders, buttons, meters, displays)
4. Internal state updated to prevent drag jumping
5. Graceful fallback when JUCE backend unavailable
6. Element ID to parameter ID mapping works correctly
7. JUCE_INTEGRATION.md includes C++ implementation examples
8. Generated code includes inline comments explaining sync purpose

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Setup | v1.0 | 3/3 | Complete | 2026-01-23 |
| 2. State Management | v1.0 | 2/2 | Complete | 2026-01-23 |
| 3. Three-Panel Layout | v1.0 | 2/2 | Complete | 2026-01-23 |
| 4. Element Palette | v1.0 | 2/2 | Complete | 2026-01-23 |
| 5. Canvas - Core Rendering | v1.0 | 4/4 | Complete | 2026-01-23 |
| 6. Canvas - Manipulation | v1.0 | 5/5 | Complete | 2026-01-23 |
| 7. Property Panel | v1.0 | 3/3 | Complete | 2026-01-23 |
| 8. Canvas Features | v1.0 | 4/4 | Complete | 2026-01-24 |
| 9. Container Elements | v1.0 | 2/2 | Complete | 2026-01-24 |
| 10. Form Controls | v1.0 | 2/2 | Complete | 2026-01-24 |
| 11. Audio Displays | v1.0 | 3/3 | Complete | 2026-01-24 |
| 12. Export System | v1.0 | 5/5 | Complete | 2026-01-25 |
| 13. Project Persistence & Polish | v1.0 | 16/16 | Complete | 2026-01-25 |
| 14. Security Foundation | v1.1 | 4/4 | Complete | 2026-01-25 |
| 15. Asset Library | v1.1 | 5/5 | Complete | 2026-01-26 |
| 16. Static SVG Graphics | v1.1 | 5/5 | Complete | 2026-01-26 |
| 17. Interactive SVG Knobs | v1.1 | 6/6 | Complete | 2026-01-26 |
| 18. Export & Polish | v1.1 | 6/6 | Complete | 2026-01-26 |
| 19. Architecture Refactoring | v1.2 | 6/6 | Complete | 2026-01-26 |
| 20. Simple Controls | v1.2 | 4/4 | Complete | 2026-01-26 |
| 21. Buttons & Switches | v1.2 | 4/4 | Complete | 2026-01-26 |
| 22. Value Displays & LEDs | v1.2 | 4/4 | Complete | 2026-01-26 |
| 23. Professional Meters | v1.2 | 6/6 | Complete | 2026-01-26 |
| 24. Navigation & Selection | v1.2 | 6/6 | Complete | 2026-01-26 |
| 25. Real-Time Visualizations | v1.2 | 5/5 | Complete | 2026-01-26 |
| 26. Interactive Curves | v1.2 | 5/5 | Complete | 2026-01-26 |
| 27. Containers & Polish | v1.2 | 4/4 | Complete | 2026-01-26 |
| 27.1. Post-Phase Bug Fixes | v1.2 | 5/5 | Complete | 2026-01-27 |
| 28. Specialized Audio (Part 1) | v1.2 | 3/3 | Complete | 2026-01-27 |
| 29. Specialized Audio (Part 2) | v1.2 | 3/3 | Complete | 2026-01-27 |
| 30. Specialized Audio (Part 3) | v1.2 | 6/6 | Complete | 2026-01-27 |
| 31. Undo/Redo History Panel | v1.3 | 2/2 | Complete | 2026-01-27 |
| 32. Unsaved Changes Protection | v1.3 | 2/2 | Complete | 2026-01-27 |
| 33. Adjustable Snap Grid | v1.3 | 1/1 | Complete | 2026-01-27 |
| 34. Container Element Editor | v1.4 | 1/1 | Complete | 2026-01-27 |
| 35. Container Overflow & Scrollbars | v1.4 | 1/1 | Complete | 2026-01-27 |
| 36. SVG Export with Named Layers | v1.5 | 1/1 | Complete | 2026-01-27 |
| 37. Font Management System | v1.5 | 5/5 | Complete | 2026-01-27 |
| 38. Multi-Window System | v1.6 | 1/1 | Complete | 2026-01-28 |
| 39. Parameter Sync | v1.7 | 1/1 | Complete | 2026-01-28 |
| 40. Bug Fixes & UI Improvements | v1.8 | 0/8 | Not Started | - |

---
*Roadmap created: 2026-01-25*
*Last updated: 2026-01-29 - Phase 40 planned with 8 plans in 2 waves*
