# Roadmap: VST3 WebView UI Designer

## Overview

This roadmap delivers a browser-based visual design tool for audio plugin interfaces in 8 phases. The journey starts with foundational state management and coordinate systems, immediately builds the element library (knobs, sliders, buttons, etc.), then layers on editing capabilities (selection, drag-drop, properties, alignment), and completes with persistence and code export. This order enables testing with real elements from Phase 3 onward, eliminating placeholder-then-retest cycles. The architecture follows research-validated patterns: scene graph document model, command-pattern undo, declarative canvas rendering, and template-based code generation. Every v1 requirement maps to exactly one phase, delivering a working JUCE WebView2 code exporter without manual fixups.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - State management, coordinate systems, canvas basics
- [x] **Phase 2: Element Library** - Core element types (knobs, sliders, buttons, meters, labels, images)
- [x] **Phase 3: Selection & History** - Selection model, undo/redo architecture
- [x] **Phase 4: Palette & Element Creation** - Drag-drop, element instantiation, layout scaffolding
- [x] **Phase 5: Properties & Transform** - Property panel, move/resize elements
- [x] **Phase 6: Alignment & Polish** - Snap to grid, copy/paste, keyboard shortcuts
- [x] **Phase 7: Save/Load** - JSON persistence, project validation
- [x] **Phase 8: Code Export** - JUCE WebView2 template generation
- [x] **Phase 9: Enhancements & Bug Fixes** - Bug fixes, locking, fonts, SVG design mode, template import
- [x] **Phase 10: UAT Bug Fixes** - User acceptance testing feedback: marquee offset, lock UX, template import
- [x] **Phase 11: Element Consolidation & Property Fixes** - Merge slider/button variants, fix property panel issues, image picker
- [x] **Phase 12: Export & Round-Trip Testing** - Verify templates load, exports work, round-trip preserves state
- [ ] **Phase 13: Extended Elements** - Containers, form controls, audio displays, control labels/values

## Phase Details

### Phase 1: Foundation
**Goal**: Establish state management architecture, coordinate systems, and canvas rendering infrastructure that enables all spatial operations without coordinate confusion.

**Depends on**: Nothing (first phase)

**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04, TECH-05, TECH-06, UIUX-01, UIUX-02, CANV-01, CANV-02, CANV-03, CANV-08

**Success Criteria** (what must be TRUE):
  1. User can see an empty canvas with configurable dimensions displayed in a three-panel layout
  2. User can pan the canvas by holding spacebar and dragging
  3. User can zoom the canvas using scroll wheel or pinch gestures
  4. User can configure canvas background color, gradient, or image
  5. Canvas maintains correct coordinate transforms at all zoom levels (0.25x, 1x, 4x)

**Plans**: 3 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md — Project setup: Vite, React 18, TypeScript, Zustand store, coordinate utilities
- [x] 01-02-PLAN.md — Three-panel layout, canvas stage, background rendering
- [x] 01-03-PLAN.md — Pan (spacebar+drag) and zoom (scroll/pinch) interactions

### Phase 2: Element Library
**Goal**: Implement the six core element types with full property interfaces and rendering, enabling users to build 80% of audio plugin UIs with real components from Phase 3 onward.

**Depends on**: Phase 1

**Requirements**: ELEM-01, ELEM-02, ELEM-03, ELEM-04, ELEM-05, ELEM-06

**Success Criteria** (what must be TRUE):
  1. User can add Knob elements with configurable arc angles, colors, and indicator styles
  2. User can add Slider elements (vertical/horizontal) with track and thumb styling
  3. User can add Button elements (momentary/toggle) with custom labels and icons
  4. User can add Label elements for text display with font, size, color configuration
  5. User can add Level Meter elements (peak meter) with orientation and color stops
  6. User can add Image elements for backgrounds, logos, and decorative graphics
  7. Element type interfaces support all properties from docs/SPECIFICATION.md

**Plans**: 4 plans in 4 waves

Plans:
- [x] 02-01-PLAN.md — Element type system, elements store slice, canvas refactor to HTML/CSS
- [x] 02-02-PLAN.md — BaseElement wrapper, KnobRenderer, SliderRenderer
- [x] 02-03-PLAN.md — ButtonRenderer, LabelRenderer, MeterRenderer
- [x] 02-04-PLAN.md — ImageRenderer, integration demo with all element types

### Phase 3: Selection & History
**Goal**: Implement selection model and undo/redo architecture that prevents naive snapshot pitfalls and enables all future editing operations with real element types.

**Depends on**: Phase 2

**Requirements**: CANV-04, CANV-05, CANV-06, CANV-07, HIST-01, HIST-02

**Success Criteria** (what must be TRUE):
  1. User can click to select a single element on the canvas
  2. User can Shift+click to add elements to multi-select
  3. User can drag a marquee box to select multiple elements
  4. User can delete selected elements with Delete/Backspace key
  5. User can undo actions with Ctrl+Z and redo with Ctrl+Y
  6. Undo/redo works correctly after 50+ consecutive operations without memory issues

**Plans**: 4 plans in 3 waves

Plans:
- [x] 03-01-PLAN.md — Selection state foundation, AABB intersection utility, react-hotkeys-hook install
- [x] 03-02-PLAN.md — SelectionOverlay component, keyboard shortcuts (undo/redo/delete/escape)
- [x] 03-03-PLAN.md — Click selection (single, shift+click, ctrl+click, background click)
- [x] 03-04-PLAN.md — Marquee drag selection with coordinate transforms

### Phase 4: Palette & Element Creation
**Goal**: Enable users to drag components from a palette onto the canvas, creating element instances with correct coordinate transforms and establishing the three-panel layout scaffolding.

**Depends on**: Phase 3

**Requirements**: PALT-01, PALT-02, PALT-03, PALT-04, CANV-09, CANV-10

**Success Criteria** (what must be TRUE):
  1. User can see a categorized component palette in the left panel
  2. User can drag an element from the palette and drop it onto the canvas
  3. Dropped elements appear at the correct canvas position (accounting for zoom/pan)
  4. User can import custom SVG files with layer name detection (indicator, thumb, track, fill)
  5. User can add foreground/overlay images to the canvas
  6. User can reorder elements (z-order/layering) to control visual stacking

**Plans**: 6 plans (4 core + 2 gap closure)

Plans:
- [x] 04-01-PLAN.md — Install @dnd-kit, create categorized palette with element previews
- [x] 04-02-PLAN.md — DndContext wrapper, droppable canvas, coordinate transform for drops
- [x] 04-03-PLAN.md — Z-order actions in store, keyboard shortcuts, ZOrderPanel in right panel
- [x] 04-04-PLAN.md — Custom SVG import with svgson, layer detection, react-dropzone upload
- [x] 04-05-PLAN.md — Gap closure: Fix element type mismatch (normalize palette to base types)
- [x] 04-06-PLAN.md — Gap closure: Fix SVG hardcoded position (center in viewport)

### Phase 5: Properties & Transform
**Goal**: Build dynamic property panel and transform controls that let users configure elements precisely and manipulate them spatially with immediate visual feedback.

**Depends on**: Phase 4

**Requirements**: PROP-01, PROP-02, PROP-03, PROP-04, PROP-05, MANP-01, MANP-02, MANP-03, MANP-04

**Success Criteria** (what must be TRUE):
  1. User can see property panel with type-specific inputs for selected element (right panel)
  2. User can directly type numeric values for all properties and see immediate canvas updates
  3. User can use color pickers to set color properties
  4. User can set element name (becomes ID in export) and parameter ID (for JUCE binding)
  5. User can drag elements to move them on the canvas
  6. User can use resize handles to change element dimensions
  7. User can nudge elements with arrow keys (1px) or Shift+arrow (10px)
  8. User can toggle snap-to-grid and see elements snap when dragging

**Plans**: 5 plans in 2 waves

Plans:
- [x] 05-01-PLAN.md — Property panel foundation: react-colorful, NumberInput, TextInput, ColorInput components
- [x] 05-02-PLAN.md — Element dragging on canvas with coordinate transform
- [x] 05-03-PLAN.md — Interactive resize handles with useResize hook
- [x] 05-04-PLAN.md — Type-specific property panels (Knob, Slider, Button, Label, Meter, Image)
- [x] 05-05-PLAN.md — Keyboard nudge and snap-to-grid functionality

### Phase 6: Alignment & Polish
**Goal**: Add productivity features that make the tool efficient for creating complex UIs with many controls (copy/paste, duplicate, keyboard shortcuts).

**Depends on**: Phase 5

**Requirements**: MANP-05, UIUX-03

**Success Criteria** (what must be TRUE):
  1. User can copy selected elements with Ctrl+C and paste with Ctrl+V
  2. User can delete selected elements with Delete key shortcut
  3. Pasted elements appear offset from originals (not overlapping)
  4. All keyboard shortcuts display in tooltips or help panel

**Plans**: 2 plans in 1 wave

Plans:
- [x] 06-01-PLAN.md — Copy/paste functionality with Ctrl+C/Ctrl+V keyboard shortcuts
- [x] 06-02-PLAN.md — Help panel displaying all keyboard shortcuts

### Phase 7: Save/Load
**Goal**: Implement JSON serialization with validation and versioning that enables project persistence without breaking on future schema changes.

**Depends on**: Phase 6

**Requirements**: PERS-01, PERS-02

**Success Criteria** (what must be TRUE):
  1. User can save current project as JSON file to local filesystem
  2. User can load a saved project file and see the exact canvas state restored
  3. Saved JSON includes version field (1.0.0) for future migration support
  4. User sees clear error messages if loading a corrupt or invalid project file
  5. All element properties, canvas settings, and layer order persist correctly

**Plans**: 2 plans in 2 waves

Plans:
- [x] 07-01-PLAN.md — Install Zod/browser-fs-access, create project schemas and serialization service
- [x] 07-02-PLAN.md — File system service, SaveLoadPanel UI, store integration

### Phase 8: Code Export
**Goal**: Generate working JUCE WebView2 code (HTML/CSS/JS + C++ boilerplate) from the canvas design with sensible IDs and proper WebSliderRelay bindings.

**Depends on**: Phase 7

**Requirements**: EXPO-01, EXPO-02, EXPO-03, REF-01

**Success Criteria** (what must be TRUE):
  1. User can export a complete JUCE WebView2 bundle (index.html, styles.css, components.js, bindings.js, bindings.cpp)
  2. User can export HTML preview with mock values for standalone testing
  3. Generated code uses element names as IDs (e.g., "gain-knob" not "element-47")
  4. Generated C++ includes WebSliderRelay declarations and parameter attachments
  5. Exported code works in JUCE WebView2 without manual fixups
  6. Export validates design before generating (shows errors for missing required properties)

**Plans**: 5 plans in 4 waves

Plans:
- [x] 08-01-PLAN.md — Install JSZip, export validators and utilities (case conversion, HTML escaping)
- [x] 08-02-PLAN.md — HTML and CSS generators for export bundle
- [x] 08-03-PLAN.md — JavaScript and C++ generators for JUCE bindings
- [x] 08-04-PLAN.md — Code generator orchestrator and ZIP bundle creation
- [x] 08-05-PLAN.md — ExportPanel UI component integrated into RightPanel

### Phase 9: Enhancements & Bug Fixes
**Goal**: Fix selection bugs, add element locking, implement font selection, create SVG design mode for custom elements, and enable template import from existing JUCE WebView2 projects.

**Depends on**: Phase 8

**Requirements**: BUG-01, BUG-02, IMP-01, IMP-02, IMP-03, FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05

**Success Criteria** (what must be TRUE):
  1. Selection rectangle does not appear when dragging an existing element
  2. Marquee selection persists after mouse release (elements remain selected)
  3. Position/Size values in property panel update in real-time during drag/resize
  4. User can lock individual elements to prevent selection/movement
  5. User can enable "lock all" mode for UI testing without accidental edits
  6. User can select from multiple embedded fonts for Labels/Value Displays
  7. User can enter Design Mode to dissect custom SVGs and assign parts to layers
  8. User can import HTML/JS/CSS from existing JUCE WebView2 template projects
  9. Export includes documentation/comments for JUCE WebView2 integration workflow
  10. Export includes known bug workarounds and loading solutions for JUCE WebView2

**Plans**: 7 plans in 2 waves

Plans:
- [x] 09-01-PLAN.md — Fix marquee selection bugs (prevent during drag, persist after release)
- [x] 09-02-PLAN.md — Real-time property updates during drag/resize
- [x] 09-03-PLAN.md — Element locking (individual and lock-all mode)
- [x] 09-04-PLAN.md — Font selection with embedded WOFF2 fonts
- [x] 09-05-PLAN.md — Export documentation and known issues
- [x] 09-06-PLAN.md — SVG Design Mode for layer assignment
- [x] 09-07-PLAN.md — Template import from existing JUCE projects

### Phase 10: UAT Bug Fixes
**Goal**: Fix bugs discovered during user acceptance testing to ensure all Phase 9 features work correctly in real-world usage.

**Depends on**: Phase 9

**Requirements**: UAT-01, UAT-02, UAT-03

**Success Criteria** (what must be TRUE):
  1. Marquee selection starts at the actual mouse click position (not offset to upper-left corner)
  2. Locked elements remain selectable (can click to select, see properties, unlock via checkbox)
  3. Locked elements prevent only move and resize operations (not selection)
  4. Lock checkbox in PropertyPanel shows correct visual state when toggled
  5. Template import creates elements that appear on canvas at correct positions
  6. Imported elements are visible and selectable after import completes

**Plans**: 3 plans in 1 wave

Plans:
- [x] 10-01-PLAN.md — Fix marquee selection position offset
- [x] 10-02-PLAN.md — Fix element locking UX (selectable but not movable)
- [x] 10-03-PLAN.md — Fix template import element creation

### Phase 11: Element Consolidation & Property Fixes
**Goal**: Consolidate redundant element types, fix property panel issues, and improve image handling for a cleaner, more intuitive element palette.

**Depends on**: Phase 10

**Requirements**: BUG-01 through BUG-09 from UAT feedback (2026-01-24)

**Success Criteria** (what must be TRUE):
  1. Knob element has no rotation field in property panel
  2. Single "Slider" element with orientation property (vertical/horizontal) replaces V-Slider and H-Slider
  3. Momentary Button "Pressed" state can be toggled in property panel
  4. Toggle Button "Pressed" state can be toggled in property panel
  5. Single "Button" element with behavior property (momentary/toggle) replaces separate button types
  6. Meter orientation can switch between Vertical and Horizontal in both directions
  7. Meter element has no rotation field in property panel
  8. Font Weight property shows named options (Regular, Bold, etc.) instead of numeric values
  9. Image element has file picker to select from project assets or enter relative path

**Plans**: 4 plans in 2 waves

Plans:
- [x] 11-01-PLAN.md — Property panel fixes: hide rotation for Knob/Meter, fix checkbox clickability, fix Meter orientation
- [x] 11-02-PLAN.md — Font weight dropdown with named options
- [x] 11-03-PLAN.md — Image file picker with thumbnail preview
- [x] 11-04-PLAN.md — Palette consolidation: single Slider and Button entries

### Phase 12: Export & Round-Trip Testing
**Goal**: Verify that built-in templates load correctly and exports produce working JUCE WebView2 code with the dynamic bridge pattern.

**Depends on**: Phase 11

**Requirements**: TEST-01, TEST-02

**Scope clarification**: No external WebView2 import. Only testing:
- Built-in templates (Effect/Instrument starters)
- Export to JUCE bundle
- Round-trip (save → load → same result)

**Success Criteria** (what must be TRUE):
  1. Effect Starter template loads with all elements correctly positioned
  2. Instrument Starter template loads with all elements correctly positioned
  3. Exported bindings.js contains dynamic bridge pattern (createJUCEFunctionWrappers, polling init)
  4. Exported bindings.js uses integer resultId (not Math.random)
  5. Exported bindings.cpp contains four native functions
  6. Standalone preview works in browser (mock mode)
  7. Round-trip: export → reimport project JSON → identical canvas state

**Plans**: 1 plan in 1 wave

Plans:
- [x] 12-01-PLAN.md — Template loading, JUCE export verification, HTML preview, round-trip integrity

### Phase 13: Extended Elements
**Goal**: Expand the element library with container elements, form controls, specialized audio displays, and enhanced control labels/values to support complex professional plugin UIs.

**Depends on**: Phase 12

**Requirements**: ELEM-07, ELEM-08, ELEM-09, ELEM-10, ELEM-11, ELEM-12

**Success Criteria** (what must be TRUE):
  1. User can add knobs/sliders with integrated label and value display
  2. User can create visual sections using Panel, Frame, or Group Box containers
  3. User can add interactive form controls (dropdown, checkbox, radio, text field)
  4. User can draw rectangles and lines for visual organization
  5. User can add specialized audio readouts (dB, frequency, gain reduction)
  6. User can add waveform and oscilloscope display placeholders
  7. User can add modulation matrix and preset browser placeholders
  8. All new elements export correctly to HTML/CSS/JS

**Plans**: 14 plans (11 core + 3 gap closure)

Plans:
- [x] 13-01-PLAN.md — Knob/Slider label and value display fields
- [x] 13-02-PLAN.md — Container elements (Panel, Frame, Group Box)
- [x] 13-03-PLAN.md — Collapsible Container with scrollbars
- [x] 13-04-PLAN.md — Form controls (Dropdown, Checkbox, Radio Group)
- [x] 13-05-PLAN.md — Text Field element
- [x] 13-06-PLAN.md — Decorative elements (Rectangle, Line)
- [x] 13-07-PLAN.md — Range Slider element
- [x] 13-08-PLAN.md — Audio displays (dB Display, Frequency Display, GR Meter)
- [x] 13-09-PLAN.md — Waveform and Oscilloscope display placeholders
- [x] 13-10-PLAN.md — Modulation Matrix placeholder widget
- [x] 13-11-PLAN.md — Preset Browser placeholder widget
- [ ] 13-12-PLAN.md — Gap closure: Fix textarea editing in Dropdown/RadioGroup properties
- [ ] 13-13-PLAN.md — Gap closure: Add missing App.tsx switch cases for element creation
- [ ] 13-14-PLAN.md — Gap closure: Add missing PaletteItem.tsx preview cases

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12 -> 13

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-01-23 |
| 2. Element Library | 4/4 | Complete | 2026-01-23 |
| 3. Selection & History | 4/4 | Complete | 2026-01-23 |
| 4. Palette & Element Creation | 6/6 | Complete | 2026-01-23 |
| 5. Properties & Transform | 5/5 | Complete | 2026-01-23 |
| 6. Alignment & Polish | 2/2 | Complete | 2026-01-23 |
| 7. Save/Load | 2/2 | Complete | 2026-01-24 |
| 8. Code Export | 5/5 | Complete | 2026-01-24 |
| 9. Enhancements & Bug Fixes | 7/7 | Complete | 2026-01-24 |
| 10. UAT Bug Fixes | 3/3 | Complete | 2026-01-24 |
| 11. Element Consolidation & Property Fixes | 4/4 | Complete | 2026-01-24 |
| 12. Export & Round-Trip Testing | 1/1 | Complete | 2026-01-25 |
| 13. Extended Elements | 11/14 | In Progress | - |
