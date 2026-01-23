# Roadmap: VST3 WebView UI Designer

## Overview

This roadmap delivers a browser-based visual design tool for audio plugin interfaces in 8 phases. The journey starts with foundational state management and coordinate systems, immediately builds the element library (knobs, sliders, buttons, etc.), then layers on editing capabilities (selection, drag-drop, properties, alignment), and completes with persistence and code export. This order enables testing with real elements from Phase 3 onward, eliminating placeholder-then-retest cycles. The architecture follows research-validated patterns: scene graph document model, command-pattern undo, declarative canvas rendering, and template-based code generation. Every v1 requirement maps to exactly one phase, delivering a working JUCE WebView2 code exporter without manual fixups.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - State management, coordinate systems, canvas basics
- [ ] **Phase 2: Element Library** - Core element types (knobs, sliders, buttons, meters, labels, images)
- [ ] **Phase 3: Selection & History** - Selection model, undo/redo architecture
- [ ] **Phase 4: Palette & Element Creation** - Drag-drop, element instantiation, layout scaffolding
- [ ] **Phase 5: Properties & Transform** - Property panel, move/resize elements
- [ ] **Phase 6: Alignment & Polish** - Snap to grid, copy/paste, keyboard shortcuts
- [ ] **Phase 7: Save/Load** - JSON persistence, project validation
- [ ] **Phase 8: Code Export** - JUCE WebView2 template generation

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

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

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
  7. All element properties from docs/SPECIFICATION.md are available in property panel

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

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

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

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

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

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

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

### Phase 6: Alignment & Polish
**Goal**: Add productivity features that make the tool efficient for creating complex UIs with many controls (copy/paste, duplicate, keyboard shortcuts).

**Depends on**: Phase 5

**Requirements**: MANP-05, UIUX-03

**Success Criteria** (what must be TRUE):
  1. User can copy selected elements with Ctrl+C and paste with Ctrl+V
  2. User can delete selected elements with Delete key shortcut
  3. Pasted elements appear offset from originals (not overlapping)
  4. All keyboard shortcuts display in tooltips or help panel

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

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

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

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

**Plans**: TBD

Plans:
- [ ] TBD during phase planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Element Library | 0/TBD | Not started | - |
| 3. Selection & History | 0/TBD | Not started | - |
| 4. Palette & Element Creation | 0/TBD | Not started | - |
| 5. Properties & Transform | 0/TBD | Not started | - |
| 6. Alignment & Polish | 0/TBD | Not started | - |
| 7. Save/Load | 0/TBD | Not started | - |
| 8. Code Export | 0/TBD | Not started | - |
