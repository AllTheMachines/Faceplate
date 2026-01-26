# Roadmap: VST3 WebView UI Designer

## Milestones

- **v1.0 MVP** - Phases 1-13 (shipped 2026-01-25)
- **v1.1 SVG Import System** - Phases 14-18 (shipped 2026-01-26)

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

---
*Roadmap created: 2026-01-25*
*Last updated: 2026-01-26 after v1.1 milestone complete*
