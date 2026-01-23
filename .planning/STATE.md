# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-23)

**Core value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.
**Current focus:** Phase 4 in progress - Palette & Element Creation

## Current Position

Phase: 4 of 8 (Palette & Element Creation)
Plan: 6 of 6 in phase complete (including gap closure plans)
Status: Phase 4 complete with gap closures
Last activity: 2026-01-23 — Completed 04-06-PLAN.md (Viewport-centered SVG import)

Progress: [████░░░░░░] 50% (4/8 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 3.21 min
- Total execution time: 0.86 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3/3 | 9.5 min | 3.17 min |
| 02-element-library | 4/4 | 15.6 min | 3.9 min |
| 03-selection-history | 4/4 | 9.29 min | 2.32 min |
| 04-palette-element-creation | 6/6 | 17.26 min | 2.88 min |

**Recent Trend:**
- 01-01: 5.5 min (foundation infrastructure)
- 01-02: 3 min (layout and canvas)
- 01-03: 1 min (pan and zoom)
- 02-01: 3.77 min (element types + HTML canvas refactor)
- 02-02: 2.93 min (BaseElement wrapper & element renderers)
- 02-03: 2.73 min (Button, Label, Meter renderers)
- 02-04: 6.17 min (ImageRenderer, demo elements, passive listener fix)
- 03-01: 2 min (selection state foundation)
- 03-02: 2.82 min (selection overlay + keyboard shortcuts)
- 03-03: 1.45 min (click-to-select functionality)
- 03-04: 3.02 min (marquee selection)
- 04-01: 4.03 min (palette components with drag-drop)
- 04-02: 5 min (drag-drop to canvas with coordinate transform)
- 04-03: 3.7 min (z-order management)
- 04-04: 3.36 min (custom SVG import with layer detection)
- 04-05: ~3.5 min (palette element size alignment - gap closure)
- 04-06: 1.17 min (viewport-centered SVG import - gap closure)
- Trend: Phase 4 complete at 2.88 min average per plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Tech stack**: React 18, TypeScript, Vite, Zustand, @dnd-kit, Tailwind CSS chosen for fast iteration
- **Research addition**: react-konva must be added as canvas rendering library (critical gap identified)
- **Undo architecture**: Must use command pattern or Zustand temporal middleware (zundo), not naive snapshots
- **Coordinate systems**: Typed coordinate utilities required in Phase 1 to prevent mixing screen/canvas/element spaces
- **Phase ordering**: Element Library moved to Phase 2 (from Phase 8) to enable testing with real elements from Phase 3 onward
- **React-konva version** (01-01): Explicitly use react-konva@18.x for React 18 compatibility, not v19
- **Viewport undo exclusion** (01-01): Viewport state (scale, offset, panning) excluded from undo history - camera position should not be undoable
- **Dark mode strategy** (01-01): Use Tailwind manual dark mode (class strategy) for explicit control rather than system preference
- **Canvas default size** (01-02): 800x600 with range 100-4000 for UI design workspace
- **Layout structure** (01-02): Three-panel grid with 250px left sidebar, flexible center, 300px right sidebar
- **Background listening** (01-02): Canvas background Rect uses listening=false to prevent event interference
- **Pan interaction** (01-03): Spacebar+drag for panning (Figma pattern), not middle-click or click-drag
- **Zoom range** (01-03): 0.1 (10%) to 10 (1000%) for maximum design flexibility
- **Zoom transform** (01-03): Two-step coordinate calculation keeps cursor point stationary during zoom
- **HTML/CSS rendering** (02-01): Migrated from react-konva to HTML/CSS transforms for true WYSIWYG (elements render as HTML exactly as they export)
- **Transform order** (02-01): CSS transform must be `translate() scale()` order (translate before scale) for correct zoom/pan
- **Transform origin** (02-01): Set transformOrigin to '0 0' to simplify coordinate calculations
- **Compound component pattern** (02-02): BaseElement wrapper handles positioning/sizing, specialized renderers handle type-specific visuals
- **Element memoization** (02-02): React.memo on Element component prevents re-renders when other elements change
- **SVG arc rendering** (02-02): polarToCartesian and describeArc utilities for knob arc paths
- **Slider orientation** (02-02): Vertical (0=bottom, 1=top inverted), Horizontal (0=left, 1=right standard)
- **Button HTML rendering** (02-03): Use HTML div instead of SVG for better text rendering
- **Button pressed state** (02-03): CSS filter brightness(0.85) for pressed state (simpler than manual color darkening)
- **Meter gradient IDs** (02-03): Generate unique gradient ID from config.id to prevent conflicts with multiple meters
- **Label text alignment** (02-03): Use textAlign on inner span for proper alignment within flex container
- **Image fit modes** (02-04): HTML img with object-fit (contain, cover, fill, none) for native browser rendering
- **Image error handling** (02-04): Show placeholder div for broken/missing images with error state
- **Demo element pattern** (02-04): Auto-populate canvas on startup with empty check to prevent duplication
- **Passive wheel listener** (02-04): Use native addEventListener with { passive: false } to prevent console warnings during zoom
- **Selection state in undo** (03-01): Selection state included in undo history - selection changes are meaningful user actions
- **AABB algorithm** (03-01): Simple rectangle intersection detection for marquee selection
- **updateElement type fix** (03-01): Use type assertion `as ElementConfig` instead of explicit type spreading to avoid discriminated union conflicts
- **Selection overlay design** (03-02): Blue border (#3b82f6) with 8 resize handles (decorative in Phase 3, interactive in Phase 5)
- **Keyboard shortcut library** (03-02): react-hotkeys-hook for clean hook-based API
- **Redo key support** (03-02): Both Ctrl+Y (Windows) and Ctrl+Shift+Z (Mac) conventions supported
- **Event propagation pattern** (03-03): Elements stopPropagation to prevent canvas background click
- **BaseElement onClick** (03-03): BaseElement accepts onClick prop and forwards to wrapper div
- **Modifier key selection** (03-03): Shift+click adds, Ctrl/Cmd+click toggles element selection
- **Marquee conflict prevention** (03-04): Marquee disabled during pan mode (isPanning check) to prevent interaction conflicts
- **Screen-to-canvas transform** (03-04): (screen - offset) / scale reverses viewport transforms for correct coordinate space
- **Marquee threshold** (03-04): 5px minimum drag distance before showing marquee to avoid accidental activation on clicks
- **Array-based z-order** (04-03): Array position determines render order (last element on top), no explicit zIndex property
- **Single-selection z-order** (04-03): Z-order operations limited to single element (multi-select deferred for complexity)
- **Industry-standard z-order shortcuts** (04-03): mod+]/[ for forward/backward, mod+shift+]/[ for front/back
- **@dnd-kit for drag-drop** (04-01): @dnd-kit/core@6.3.1 installed for palette-to-canvas drag interaction
- **Palette categories** (04-01): 6 categories (Rotary, Linear, Buttons, Displays, Meters, Images) matching VST3 UI patterns
- **Preview rendering** (04-01): Actual element renderers at reduced scale for true WYSIWYG palette previews
- **Drag data structure** (04-01): useDraggable data payload includes elementType and variant for factory pattern
- **SVG parsing library** (04-04): svgson@5.3.1 for SVG-to-JSON conversion enabling layer detection
- **Layer naming conventions** (04-04): Detects indicator, thumb, track, fill, glow via id and inkscape:label attributes
- **SVG data URL storage** (04-04): SVG stored as data URL in image element src for inline rendering
- **Preview-before-add pattern** (04-04): Shows SVG preview, dimensions, and detected layers before adding to canvas
- **Drag activation threshold** (04-02): 8px drag threshold prevents accidental drags while remaining responsive
- **Droppable target boundary** (04-02): Droppable on canvas-background (not viewport) rejects drops outside canvas bounds
- **Coordinate transform for drag-drop** (04-02): (finalX - viewportRect.left - offsetX) / scale handles zoom and pan for correct element placement
- **Viewport-centered SVG placement** (04-06): Imported SVGs placed at viewport center using (screenCenter - offset) / scale coordinate transform

### Pending Todos

- **Future enhancement:** Add ability to type zoom percentage directly in zoom indicator (user feedback from 01-03)

### Blockers/Concerns

**Phase 1:** COMPLETE (3/3 plans complete)
- ✅ react-konva@18 added and verified
- ✅ Coordinate transform utilities implemented with branded types
- ✅ Three-panel layout with responsive sizing
- ✅ Canvas Stage with viewport transforms
- ✅ Spacebar+drag panning with grab cursor UX
- ✅ Scroll/pinch zoom centered on cursor
- ✅ All Phase 1 success criteria met
- SVG vs hybrid rendering decision deferred to Phase 3 (Canvas Basics)

**Phase 2 (Element Library):** COMPLETE (4/4 plans)
- ✅ Element type system created (6 types with discriminated unions)
- ✅ Elements store slice with CRUD operations
- ✅ Canvas refactored from react-konva to HTML/CSS transforms
- ✅ Pan and zoom preserved with HTML events (passive: false for wheel)
- ✅ BaseElement wrapper with positioning/sizing/rotation
- ✅ Element dispatcher with type-safe rendering
- ✅ KnobRenderer with SVG arc rendering
- ✅ SliderRenderer with vertical/horizontal support
- ✅ ButtonRenderer with HTML and pressed state visuals
- ✅ LabelRenderer with text styling and alignment
- ✅ MeterRenderer with SVG gradients and peak hold
- ✅ ImageRenderer with object-fit modes and error handling
- ✅ All 6 element renderers complete
- ✅ Demo elements showcase all types on startup
- react-konva kept in package.json as fallback (remove in Phase 8 if unused)

**Phase 3 (Selection & History):** COMPLETE (4/4 plans)
- ✅ Selection state foundation complete (Plan 01)
- ✅ Selection actions: selectElement, toggleSelection, addToSelection, clearSelection, selectMultiple
- ✅ AABB intersection utility for marquee selection
- ✅ react-hotkeys-hook installed for keyboard shortcuts
- ✅ Selection visuals & keyboard shortcuts complete (Plan 02)
- ✅ SelectionOverlay component with blue border and 8 resize handles
- ✅ Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo), Delete/Backspace (delete), Escape (clear selection)
- ✅ Click-to-select functionality complete (Plan 03)
- ✅ Click element to select, Shift+click to add, Ctrl/Cmd+click to toggle
- ✅ Background click clears selection
- ✅ Event propagation pattern established
- ✅ Marquee selection complete (Plan 04)
- ✅ useMarquee hook with screen-to-canvas coordinate transformation
- ✅ MarqueeSelection visual component with dashed blue rectangle
- ✅ Real-time selection updates during drag using AABB intersection
- ✅ Pan mode conflict prevention (marquee disabled when spacebar held)

**Phase 4 (Palette & Element Creation):** COMPLETE (6/6 plans including gap closures)
- ✅ Palette components with visual previews (Plan 01)
  - @dnd-kit/core@6.3.1 installed
  - Palette.tsx with 6 categorized sections
  - PaletteItem.tsx uses useDraggable hook
  - Visual previews use actual element renderers at reduced scale
  - LeftPanel integration complete
- ✅ Drag-drop to canvas (Plan 02)
  - DndContext wraps App with PointerSensor (8px activation threshold)
  - handleDragEnd with coordinate transform: (screen - viewportRect - offset) / scale
  - Canvas droppable area with blue ring visual feedback
  - Elements instantiated at correct position accounting for zoom/pan
  - Demo elements removed - users add via palette
- ✅ Z-order management with keyboard shortcuts and UI (Plan 03)
  - Array-based z-order (last element renders on top)
  - ZOrderPanel in right panel with 4 buttons
  - Keyboard shortcuts: mod+]/[ (forward/backward), mod+shift+]/[ (front/back)
- ✅ Custom SVG import with layer detection (Plan 04)
  - svgson@5.3.1 and react-dropzone@14.3.8 installed
  - SVG parsing utility with layer detection (indicator, thumb, track, fill, glow)
  - CustomSVGUpload component with drag-drop, preview, and layer listing
  - SVG files added to canvas as image elements with data URL
- ✅ Gap closure: Palette element size alignment (Plan 05)
  - DEFAULT_SIZES constant ensures palette elements match canvas rendering
  - Consistent visual feedback prevents size surprises on drop
- ✅ Gap closure: Viewport-centered SVG import (Plan 06)
  - Imported SVGs placed at viewport center using screen-to-canvas transform
  - Eliminates hardcoded (100, 100) position
  - Works correctly with all zoom/pan states
- Next: Proceed to Phase 5 (Property Panel)

**Phase 8 (Code Export):**
- JUCE WebView2 API integration needs deeper research during planning
- Code export templates require validation with real JUCE project

## Session Continuity

Last session: 2026-01-23 22:12 UTC (phase execution)
Stopped at: Completed 04-06-PLAN.md (Viewport-centered SVG import) - Phase 4 complete with gap closures
Resume file: None
Next: Proceed to Phase 5 (Property Panel)
