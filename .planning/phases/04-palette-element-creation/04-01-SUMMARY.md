---
phase: 04
plan: 01
subsystem: ui-palette
status: complete
tags: [dnd-kit, drag-drop, palette, ui-components]

requires:
  - 02-02-element-renderers
  - 03-01-selection-foundation

provides:
  - categorized-component-palette
  - draggable-palette-items
  - visual-element-previews

affects:
  - 04-02-drag-to-canvas
  - 04-03-element-factory

tech-stack:
  added:
    - "@dnd-kit/core@6.3.1"
    - "@dnd-kit/utilities"
  patterns:
    - "useDraggable hook for palette items"
    - "collapsible category UI pattern"
    - "preview rendering with scaled elements"

key-files:
  created:
    - src/components/Palette/Palette.tsx
    - src/components/Palette/PaletteCategory.tsx
    - src/components/Palette/PaletteItem.tsx
    - src/components/Palette/index.ts
  modified:
    - src/components/Layout/LeftPanel.tsx
    - package.json

decisions:
  - id: palette-categories
    choice: "6 categories: Rotary, Linear, Buttons, Displays, Meters, Images"
    rationale: "Matches VST3 UI patterns and element type taxonomy"

  - id: preview-rendering
    choice: "Use actual element renderers at reduced scale"
    rationale: "True WYSIWYG - palette previews match canvas rendering exactly"

  - id: default-expanded
    choice: "First 3 categories expanded by default"
    rationale: "Most commonly used controls (Rotary, Linear, Buttons) immediately visible"

  - id: drag-data-structure
    choice: "useDraggable data: { elementType, variant }"
    rationale: "Enables factory pattern - palette item carries type info for element creation"

metrics:
  tasks-completed: 3
  duration: "4.03 min"
  completed: "2026-01-23"
---

# Phase 04 Plan 01: Palette Component Foundation Summary

**One-liner:** Installed @dnd-kit and created categorized component palette with visual previews using actual element renderers

## What Was Built

### 1. @dnd-kit Installation
- Installed `@dnd-kit/core@6.3.1` and `@dnd-kit/utilities`
- Provides drag-drop framework with sensors, collision detection, and coordinate utilities
- Foundation for palette-to-canvas drag interaction

### 2. Palette Component Hierarchy
**Palette.tsx** - Main container
- Defines 6 categorized sections:
  - **Rotary Controls**: knob (standard), knob-arc (arc style)
  - **Linear Controls**: slider-vertical, slider-horizontal
  - **Buttons & Switches**: button-momentary, button-toggle
  - **Value Displays**: label
  - **Meters**: meter-vertical
  - **Images & Decorative**: image
- Each item has: `id` (unique), `type` (element type), `name` (display name), `variant` (optional overrides)
- Tracks expanded categories in local state (first 3 expanded by default)

**PaletteCategory.tsx** - Collapsible category section
- Accepts `category` (name + items), `isExpanded`, `onToggle` props
- Chevron indicator shows expand/collapse state
- 2-column grid layout for items when expanded
- Tailwind styling: bg-gray-800, border-gray-700, text-gray-300

**PaletteItem.tsx** - Draggable item with preview
- Uses `useDraggable` hook from @dnd-kit/core
- Draggable ID format: `palette-${id}`
- Data payload: `{ elementType, variant }` for factory pattern
- Visual preview at reduced scale using actual element renderers:
  - Knob: renders KnobRenderer with 40px diameter preview
  - Slider: renders SliderRenderer (20x60 vertical, 60x20 horizontal)
  - Button: renders ButtonRenderer (60x30) with abbreviated labels
  - Label: renders LabelRenderer with "Aa" text
  - Meter: renders MeterRenderer (16x60)
  - Image: shows placeholder SVG icon
- Styling: cursor-grab, hover:bg-gray-700, isDragging opacity change

### 3. LeftPanel Integration
- Imported and rendered Palette component
- Added "Components" header above palette
- Maintained container styling (bg-gray-800, border-r, overflow-y-auto)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed undefined handling in keyboard shortcuts**
- **Found during:** Task 2 (npm run build verification)
- **Issue:** TypeScript error - `selectedIds[0]` could be `undefined` with `noUncheckedIndexedAccess: true`
- **Location:** src/components/Canvas/hooks/useKeyboardShortcuts.ts lines 55, 68, 81, 94
- **Fix:** Changed from storing `const id = selectedIds[0]` to checking `selectedIds[0]` directly in condition
- **Pattern:** `if (selectedIds.length === 1 && selectedIds[0]) { action(selectedIds[0]) }`
- **Files modified:** src/components/Canvas/hooks/useKeyboardShortcuts.ts
- **Commit:** 415327f
- **Note:** Bug from Phase 3 (z-order keyboard shortcuts) - array access without undefined check

**2. [Rule 1 - Bug] Removed unused import in RightPanel**
- **Found during:** Task 2 (npm run build verification)
- **Issue:** TypeScript error - `ZOrderPanel` imported but never used
- **Location:** src/components/Layout/RightPanel.tsx line 2
- **Fix:** Removed unused import statement
- **Files modified:** src/components/Layout/RightPanel.tsx
- **Commit:** 415327f
- **Note:** Leftover import from Phase 3 refactoring

## Technical Decisions

### Why Actual Renderers for Previews?
Used real element renderers (KnobRenderer, SliderRenderer, etc.) at reduced scale instead of static icons or images. This ensures:
- **True WYSIWYG**: Palette preview exactly matches canvas appearance
- **Style consistency**: Color schemes, proportions, and visual style match 1:1
- **Automatic updates**: Changes to renderer components automatically update palette previews
- **Zero duplication**: No need to maintain separate preview assets

### Why elementType in Drag Data?
Palette items use `useDraggable` with `data: { elementType, variant }` payload. This enables:
- **Factory pattern**: Canvas drop handler can call `createKnob()`, `createSlider()`, etc. based on type
- **Variant support**: Future customization (e.g., "knob-arc" creates knob with `style: 'arc'`)
- **Type safety**: ElementType string maps to discriminated union types

### Why First 3 Categories Expanded?
Default expanded categories: Rotary Controls, Linear Controls, Buttons & Switches. Rationale:
- These are the most commonly used VST3 UI controls
- Reduces initial scroll distance
- User can collapse/expand as needed for workflow preference

## Integration Points

### With Phase 2 (Element Library)
- **Depends on:** Element factory functions (createKnob, createSlider, etc.)
- **Depends on:** Element renderers (KnobRenderer, SliderRenderer, etc.)
- **Pattern:** PaletteItem creates preview elements using factory functions with reduced dimensions

### With Phase 4 Plan 02 (Drag to Canvas)
- **Provides:** Draggable palette items with `useDraggable` hook
- **Provides:** Element type data in drag payload
- **Next step:** App.tsx will wrap in DndContext with DragOver handler to create elements on canvas

## Next Phase Readiness

### Ready for Phase 4 Plan 02
- ✅ Palette items are draggable via @dnd-kit
- ✅ Element type information available in drag data
- ✅ Visual feedback (isDragging opacity) works
- ✅ @dnd-kit framework installed and working

### Blockers
None

### Concerns
None - palette components render correctly, build passes, @dnd-kit integration ready for next plan

## Verification Completed

- [x] Run `npm run build` - passes without errors
- [x] @dnd-kit/core and @dnd-kit/utilities in package.json dependencies
- [x] Palette.tsx renders 6 categories with element items
- [x] PaletteItem uses useDraggable with elementType and variant in data
- [x] Visual previews show actual element renderers at reduced scale
- [x] LeftPanel renders Palette component
- [x] Categories have collapse/expand functionality
- [x] Items have grab cursor styling

## Commits

| Hash    | Message                                              |
|---------|------------------------------------------------------|
| 876f949 | chore(04-01): install @dnd-kit packages              |
| 415327f | feat(04-01): create Palette components with visual previews |
| bfb4ac3 | feat(04-01): integrate Palette into LeftPanel        |

**Total commits:** 3 (1 chore, 2 feat)

## Performance

**Execution time:** 4.03 minutes
**Tasks:** 3/3 completed
**Blockers hit:** 0
**Deviations:** 2 auto-fixed Phase 3 bugs (TypeScript errors)
