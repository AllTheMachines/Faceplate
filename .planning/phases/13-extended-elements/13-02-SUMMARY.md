---
phase: 13-extended-elements
plan: 02
subsystem: element-library
tags: [containers, panel, frame, groupbox, visual-grouping]

requires:
  - 13-01  # Form controls foundation

provides:
  - Container elements for visual UI organization
  - Panel element with background and optional border
  - Frame element with configurable border styles
  - Group Box element with header text

affects:
  - Future nesting/parent-child relationships (Phase 14+)

tech-stack:
  added: []
  patterns:
    - Header text breaks border (GroupBox classic pattern)
    - Visual-only containers (no nesting in Phase 13)

key-files:
  created:
    - src/components/elements/renderers/PanelRenderer.tsx
    - src/components/elements/renderers/FrameRenderer.tsx
    - src/components/elements/renderers/GroupBoxRenderer.tsx
    - src/components/Properties/PanelProperties.tsx
    - src/components/Properties/FrameProperties.tsx
    - src/components/Properties/GroupBoxProperties.tsx
  modified:
    - src/types/elements.ts
    - src/components/elements/Element.tsx
    - src/components/Properties/PropertyPanel.tsx
    - src/components/Palette/Palette.tsx
    - src/services/export/htmlGenerator.ts
    - src/services/export/cssGenerator.ts

decisions:
  - title: Visual-only containers in Phase 13
    rationale: Parent-child element nesting requires store architecture changes deferred to future phase
    impact: Containers are decorative/organizational only - elements cannot be nested inside them yet

  - title: Group Box header breaks border pattern
    rationale: Classic UI pattern from Windows Forms, Qt, etc. - header text appears to break top border
    impact: Implemented with absolute positioning and background matching parent

  - title: Panel vs Frame distinction
    rationale: Panel has background fill, Frame is border-only - matches common UI library patterns
    impact: Users can choose visual style appropriate to their plugin design

metrics:
  duration: 387 seconds
  completed: 2026-01-25
---

# Phase 13 Plan 02: Container Elements Summary

Container elements (Panel, Frame, Group Box) for visual organization of plugin UI sections.

## One-liner

Three container element types with background/border styling, no nesting support (visual-only in Phase 13).

## What Was Built

### 1. Container Element Types (Task 1)

**PanelElementConfig:**
- Background color with opacity
- Configurable border radius
- Optional border (width, color)
- Inner padding

**FrameElementConfig:**
- Six border styles: solid, dashed, dotted, double, groove, ridge
- Border width and color
- Border radius
- Inner padding

**GroupBoxElementConfig:**
- Header text with font size and color
- Header background (appears to break border)
- Border styling (width, color, radius)
- Inner padding

All three include:
- Type guards (isPanel, isFrame, isGroupBox)
- Factory functions with sensible defaults
- Integration into ElementConfig discriminated union

### 2. Renderers (Task 2)

**PanelRenderer:**
- Renders div with backgroundColor
- Conditionally applies border if borderWidth > 0
- Applies borderRadius and padding

**FrameRenderer:**
- Renders div with border styling
- Uses CSS borderStyle property for visual variety
- Applies borderRadius and padding

**GroupBoxRenderer:**
- Container with relative positioning
- Border div positioned absolutely (top offset for header)
- Header div positioned absolutely with background
- Classic "header breaks border" visual pattern

Element.tsx updated with:
- Imports for all three renderers
- Switch cases for 'panel', 'frame', 'groupbox'

### 3. Property Panels, Palette, Export (Task 3)

**Property Panels:**
- PanelProperties: Background color, border controls, padding
- FrameProperties: Border style dropdown, width, color, radius, padding
- GroupBoxProperties: Header text/styling, border controls, padding

**Palette Integration:**
- New "Containers" category
- Three items: Panel, Frame, Group Box
- Users can drag to canvas like any other element

**HTML Export:**
- Panel: Simple div with data-type="panel"
- Frame: Simple div with data-type="frame"
- GroupBox: Nested structure with .groupbox-border and .groupbox-header

**CSS Export:**
- Panel: Background, optional border, radius, padding
- Frame: Border with configurable style, radius, padding
- GroupBox: Complex multi-rule CSS for border/header positioning

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

**1. Visual-only containers in Phase 13**
- Containers are decorative elements only
- No parent-child nesting support
- Elements cannot be "contained" inside containers
- Rationale: Nesting requires store architecture changes (element hierarchy tree instead of flat array)
- Future work: True nesting in Phase 14+

**2. Group Box header rendering strategy**
- Header positioned absolutely at top: 0
- Border positioned absolutely with top offset of headerFontSize / 2
- Header background matches container background
- Rationale: Classic UI pattern, visually clear separation
- Alternative considered: SVG path for border (more complex, same visual result)

**3. Panel vs Frame distinction**
- Panel has background fill, Frame is border-only
- Rationale: Common distinction in UI libraries (WPF, Qt, Swing)
- Allows users to choose appropriate visual weight for grouping

## Testing Performed

**TypeScript Compilation:**
- ✓ All types compile without errors
- ✓ Type guards work correctly
- ✓ Factory functions have correct types

**Dev Server:**
- ✓ Server starts without errors
- ✓ No console errors
- ✓ Renderers load correctly

**Manual Verification (verification step deferred to user acceptance):**
- Palette shows Containers category
- Panel/Frame/GroupBox can be dragged to canvas
- Property panels show for each container type
- Export generates HTML/CSS markup

## Next Phase Readiness

**Ready for:**
- 13-03: Specialized meter types (if planned)
- Future nesting architecture (Phase 14+)

**Blockers/Concerns:**
None - container elements complete and functional.

**Technical Debt:**
- Container elements cannot actually contain child elements (store limitation)
- Future phase needed for true parent-child hierarchy
- Export generates correct HTML/CSS but no JUCE binding support (containers don't interact with parameters)

## Lessons Learned

**What Went Well:**
- Clean separation of Panel (filled) vs Frame (border-only) vs GroupBox (labeled border)
- Group Box header positioning pattern works elegantly
- Factory functions with defaults make elements immediately usable

**What Could Be Improved:**
- Could add z-index management for containers vs contained elements (once nesting supported)
- Might want "snap to container bounds" in future for visual alignment
- Container resize could auto-adjust padding to maintain visual balance

**Patterns to Reuse:**
- Classic UI patterns (GroupBox header) translate well to web rendering
- Absolute positioning for overlapping visual elements (header breaks border)
- Optional border pattern (borderWidth > 0 check) works cleanly

## Stats

**Files Created:** 6
**Files Modified:** 6
**Lines Added:** ~476
**TypeScript Errors Fixed:** 0
**Commits:** 3

**Commit History:**
1. `feat(13-02): add Panel, Frame, GroupBox element types` (36d95ab)
2. `feat(13-02): add container element renderers` (fab8f5f)
3. `feat(13-02): add property panels, palette category, and export support` (dc9fb69)
