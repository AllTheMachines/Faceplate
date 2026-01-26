# Roadmap: VST3 WebView UI Designer

## Milestones

- **v1.0 MVP** - Phases 1-13 (shipped 2026-01-25)
- **v1.1 SVG Import System** - Phases 14-18 (shipped 2026-01-26)
- **v1.2 Complete Element Taxonomy** - Phases 19-30 (in progress)

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

<details open>
<summary>v1.2 Complete Element Taxonomy (Phases 19-30) - IN PROGRESS</summary>

### Phase 19: Architecture Refactoring
**Goal**: Codebase scales gracefully from 25 to 103 element types without technical debt
**Dependencies**: None (prerequisite for all other v1.2 phases)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, UX-01, UX-02

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

**Success Criteria:**
1. User can add Tooltip (hover information with configurable position)
2. User can add Spacer (invisible layout element with fixed/flexible sizing)
3. User can add Window Chrome (title bar with close/minimize buttons, resize handles)

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
| 19. Architecture Refactoring | v1.2 | 0/? | Pending | — |
| 20. Simple Controls | v1.2 | 0/? | Pending | — |
| 21. Buttons & Switches | v1.2 | 0/? | Pending | — |
| 22. Value Displays & LEDs | v1.2 | 0/? | Pending | — |
| 23. Professional Meters | v1.2 | 0/? | Pending | — |
| 24. Navigation & Selection | v1.2 | 0/? | Pending | — |
| 25. Real-Time Visualizations | v1.2 | 0/? | Pending | — |
| 26. Interactive Curves | v1.2 | 0/? | Pending | — |
| 27. Containers & Polish | v1.2 | 0/? | Pending | — |
| 28. Specialized Audio (Part 1) | v1.2 | 0/? | Pending | — |
| 29. Specialized Audio (Part 2) | v1.2 | 0/? | Pending | — |
| 30. Specialized Audio (Part 3) | v1.2 | 0/? | Pending | — |

---
*Roadmap created: 2026-01-25*
*Last updated: 2026-01-26 after v1.2 roadmap created*
