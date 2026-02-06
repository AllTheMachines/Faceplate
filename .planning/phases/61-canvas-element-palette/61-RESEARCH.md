# Phase 61: Canvas & Element Palette - Research

**Researched:** 2026-02-06
**Domain:** Technical writing for UI design tool documentation
**Confidence:** HIGH

## Summary

Phase 61 is a documentation-only phase creating two user manual topic files: `canvas.md` and `palette.md`. The research focused on understanding the existing Canvas and Palette implementations to accurately document all workflows, keyboard shortcuts, and features for beginner-friendly user guidance.

The codebase uses @dnd-kit/core for drag-and-drop, React hooks for canvas interactions (pan, zoom, marquee selection, keyboard shortcuts), and Zustand for state management. The Canvas implements standard design tool interactions: selection, drag, resize, copy/paste, undo/redo, snap grid, and element locking. The Element Palette organizes 109+ element types into 14 categories with search, Pro element badges, and collapsible categories.

Key findings:
- All canvas workflows use well-established patterns (marquee selection, resize handles, keyboard nudging)
- Keyboard shortcuts follow cross-platform conventions (Ctrl/Cmd modifiers, arrow keys, standard hotkeys)
- Pro elements are clearly marked in code with 50 Pro types across visualizations, meters, curves, and specialized audio
- Snap grid toggles with Ctrl+G, has adjustable size, visual display
- Element locking exists at two levels: individual element.locked and global lockAllMode
- Background configuration supports color, gradient (linear with angle), and image types
- Pan/zoom uses space+drag and scroll wheel with smooth pointer-anchored zoom

**Primary recommendation:** Document workflows in task-oriented groups (Adding Elements, Selecting, Positioning, Editing, Canvas Navigation, Canvas Settings) with inline keyboard shortcuts and numbered step instructions. Use screenshot placeholders minimally (4-6 per file). Present element categories as tables with Pro badges inline.

## Standard Stack

This is a documentation phase — no new libraries or code. Documentation toolchain is markdown-based.

### Existing Implementation Stack (for reference)

| Library | Version | Purpose | Used For |
|---------|---------|---------|----------|
| @dnd-kit/core | (current) | Drag-and-drop | Palette-to-canvas, element dragging |
| react-hotkeys-hook | (current) | Keyboard shortcuts | All canvas keyboard interactions |
| zustand | (current) | State management | Canvas state, viewport, grid settings |
| temporal middleware | (zustand) | Undo/redo | History management |

### Documentation Format

| Format | Purpose | Location |
|--------|---------|----------|
| Markdown | User manual topics | `docs/manual/canvas.md`, `docs/manual/palette.md` |
| Screenshot placeholders | Visual references | `![description](../images/filename.png)` |
| Cross-references | Link to other docs | `[Element Reference](../ELEMENT_REFERENCE.md)` |

**No installation required** — existing markdown files in docs/manual/ directory.

## Architecture Patterns

### Recommended Topic File Structure

Based on CONTEXT.md decisions and existing `getting-started.md`:

```
docs/manual/
├── canvas.md
│   ├── Introduction (1-2 sentence overview)
│   ├── Adding Elements (drag-drop workflow with screenshot)
│   ├── Selecting (click, multi-select, marquee)
│   ├── Positioning (drag, resize, constrained drag, arrow nudge)
│   ├── Editing & History (copy/paste, duplicate, undo/redo, delete)
│   ├── Element Locking (individual lock, lock-all mode)
│   ├── Canvas Settings
│   │   ├── Snap Grid (toggle, size, visual display)
│   │   ├── Background Configuration (color, gradient, image)
│   │   └── Pan & Zoom (scroll, space+drag, zoom controls)
│   └── Screenshot placeholders (4-6 total)
└── palette.md
    ├── Introduction (1-2 sentence overview)
    ├── Palette Overview (categories listed with screenshot)
    ├── Element Categories (14 tables)
    │   ├── Rotary Controls
    │   ├── Linear Controls
    │   ├── Buttons
    │   ├── Value Displays
    │   ├── Meters
    │   ├── Audio Displays
    │   ├── Visualizations
    │   ├── Curves
    │   ├── Form Controls
    │   ├── Navigation & Selection
    │   ├── Images & Decorative
    │   ├── Containers
    │   ├── Complex Widgets
    │   └── Specialized Audio
    ├── Search & Filter (functionality description)
    ├── Pro Elements (badge behavior, gating)
    └── Screenshot placeholders (~12, one per category + overview)
```

### Pattern 1: Workflow Documentation

**What:** Task-oriented instructions with keyboard shortcuts inline
**When to use:** For all canvas interaction workflows

**Example structure:**
```markdown
## Selecting Elements

Select elements to edit their properties, move them, or apply actions like copy/paste.

**Click to select:**
1. Click any element on the canvas to select it
2. Blue resize handles appear at corners and edges
3. Properties panel updates to show element settings

**Multi-select with Ctrl+click:**
1. Select the first element by clicking it
2. Hold **Ctrl** (or **Cmd** on Mac) and click additional elements
3. All selected elements show resize handles
4. Drag any selected element to move all together

**Marquee selection (drag rectangle):**
1. Click on an empty area of the canvas
2. Drag to create a selection rectangle
3. Release to select all elements within the rectangle

**Keyboard shortcut:** Press **Escape** to clear selection.

![Canvas with multiple elements selected](../images/canvas-selection.png)
```

### Pattern 2: Element Category Tables

**What:** Concise tables with Element Name and Description columns
**When to use:** For listing element types in palette documentation

**Example:**
```markdown
## Rotary Controls

| Element Name | Description |
|--------------|-------------|
| Knob | Standard rotary knob with arc display |
| Stepped Knob | Knob with discrete step positions |
| Center Detent | Knob that snaps to center position (pan/EQ style) |
| Dot Indicator | Knob with minimal dot indicator aesthetic |

## Meters

| Element Name | Description |
|--------------|-------------|
| Meter | Legacy vertical/horizontal meter |
| RMS Meter (Pro) | Professional RMS level meter (mono variant) |
| RMS Meter (Stereo) (Pro) | Professional RMS level meter (stereo variant) |
| VU Meter (Pro) | Vintage VU meter with ballistics |
```

### Pattern 3: Screenshot Placeholders

**What:** Minimal placeholder format with subject only
**When to use:** At key workflow transitions (4-6 per topic file)

**Format:**
```markdown
![Canvas with elements selected](../images/canvas-selection.png)
```

**Canvas doc placements** (4-6 screenshots):
- Drag-drop from palette to canvas
- Selection modes (multi-select or marquee)
- Snap grid enabled showing grid lines
- Canvas background options (could be settings panel)
- Zoom controls or pan gesture visualization

**Palette doc placements** (~12 screenshots, exception for category coverage):
- Palette overview (search bar, first few categories)
- One screenshot per category showing elements (12 categories × 1 screenshot)

### Anti-Patterns to Avoid

- **Verbose introductions:** Don't write multi-paragraph explanations of what each section is for — get straight to the workflow steps
- **Callout boxes for edge cases:** Handle edge cases as inline notes within steps, not separate warning/tip callouts
- **Example search queries:** Don't write "try searching for 'knob'" — just describe what search/filter does functionally
- **Redundant screenshots:** Only place screenshots at major workflow transitions, not at every single step

## Don't Hand-Roll

This is a documentation phase — no code development. However, for accuracy:

| Problem | Don't Assume | Verify With |
|---------|--------------|-------------|
| Keyboard shortcut behavior | "Probably works like Figma" | `useKeyboardShortcuts.ts`, `useElementNudge.ts` source code |
| Pro element list | "Most advanced features are Pro" | `proElements.ts` PRO_ELEMENTS registry |
| Element types and names | "Knob, Slider, Button probably exist" | `Palette.tsx` paletteCategories array |
| Canvas background types | "Color and gradient are standard" | `canvasSlice.ts` BackgroundType type |
| Grid size defaults | "Probably 10px" | `canvasSlice.ts` default gridSize value |

**Key insight:** The codebase is the authoritative source for ALL documented behavior. Every workflow, shortcut, and feature claim must trace back to actual implementation code. Don't infer behavior from UI design tool conventions — read the source.

## Common Pitfalls

### Pitfall 1: Documenting Hypothetical Features

**What goes wrong:** Writing documentation for features that seem like they should exist but aren't implemented
**Why it happens:** Assuming standard design tool features (e.g., "Shift+click to deselect") without verifying implementation
**How to avoid:** Cross-reference every documented workflow with source code in Canvas.tsx, hooks/, and store/
**Warning signs:** If you can't find the keyboard shortcut handler or interaction logic in code, the feature doesn't exist

### Pitfall 2: Incorrect Keyboard Shortcut Platforms

**What goes wrong:** Documenting "Ctrl+C" without noting Mac uses "Cmd+C"
**Why it happens:** Forgetting cross-platform differences or using platform-specific terminology
**How to avoid:** Check `useKeyboardShortcuts.ts` for modifier key patterns — library uses 'mod' for Ctrl/Cmd, explicitly check for 'ctrl+' vs 'meta+' patterns
**Warning signs:** If documentation only mentions Ctrl without Mac alternative, Windows/Linux users may be confused

### Pitfall 3: Outdated Element Counts or Names

**What goes wrong:** Documenting "50 element types" when codebase has 109+, or using old element names
**Why it happens:** Not checking current `Palette.tsx` paletteCategories array
**How to avoid:** Count element types directly from paletteCategories array, use exact names from `{ id, type, name }` entries
**Warning signs:** If element count doesn't match paletteCategories.reduce((acc, c) => acc + c.items.length, 0), recount

### Pitfall 4: Missing Pro Element Badges

**What goes wrong:** Forgetting to mark Pro elements with "(Pro)" badge in documentation
**Why it happens:** Not checking every element type against PRO_ELEMENTS registry
**How to avoid:** For every element listed in palette.md, verify `isProElement(type)` status in proElements.ts
**Warning signs:** If visualizations, meters, or specialized audio elements lack "(Pro)" badges, check registry

### Pitfall 5: Unclear Constrained Drag Behavior

**What goes wrong:** Documenting "Shift+drag to constrain" without specifying horizontal/vertical locking
**Why it happens:** Assuming Figma/Sketch-style constrained drag without checking implementation
**How to avoid:** Check BaseElement.tsx drag handler for Shift key behavior — verify if it constrains to axis or has different behavior
**Warning signs:** If constrained drag behavior isn't clearly explained with axis locking rules, investigate actual implementation

## Code Examples

No code examples needed — this is a documentation-only phase. However, for reference when documenting workflows:

### Keyboard Shortcuts Reference

From `useKeyboardShortcuts.ts`:

```typescript
// Undo/Redo
useHotkeys('ctrl+z, meta+z', ...) // Undo
useHotkeys('ctrl+y, ctrl+shift+z, meta+shift+z', ...) // Redo

// Delete
useHotkeys('delete, backspace', ...) // Delete selected

// Clear selection
useHotkeys('escape', ...) // Clear selection

// Layer order
useHotkeys('mod+shift+]', ...) // Bring to Front
useHotkeys('mod+shift+[', ...) // Send to Back
useHotkeys('mod+]', ...) // Bring Forward
useHotkeys('mod+[', ...) // Send Backward

// Copy/Paste/Duplicate
useHotkeys('mod+c', ...) // Copy
useHotkeys('mod+v', ...) // Paste
useHotkeys('mod+d', ...) // Duplicate

// Grid
useHotkeys('mod+g', ...) // Toggle snap grid
```

### Element Nudging

From `useElementNudge.ts`:

```typescript
// 1px nudge
useHotkeys('ArrowUp', () => nudge(0, -1))
useHotkeys('ArrowDown', () => nudge(0, 1))
useHotkeys('ArrowLeft', () => nudge(-1, 0))
useHotkeys('ArrowRight', () => nudge(1, 0))

// 10px nudge with Shift
useHotkeys('shift+ArrowUp', () => nudge(0, -10))
useHotkeys('shift+ArrowDown', () => nudge(0, 10))
useHotkeys('shift+ArrowLeft', () => nudge(-10, 0))
useHotkeys('shift+ArrowRight', () => nudge(10, 0))
```

### Pro Element Check

From `proElements.ts`:

```typescript
export function isProElement(elementType: string): boolean {
  return elementType in PRO_ELEMENTS
}

// 50 Pro elements total:
// - ASCII (3): asciislider, asciibutton, asciiart
// - Advanced Meters (24): RMS, VU, PPM, True Peak, LUFS, K-System, Analysis (mono/stereo)
// - Visualizations (5): scrollingwaveform, spectrumanalyzer, spectrogram, goniometer, vectorscope
// - Curves (5): eqcurve, compressorcurve, envelopedisplay, lfodisplay, filterresponse
// - Navigation (1): breadcrumb
// - Specialized Audio (12): pianokeyboard, drumpad, padgrid, stepsequencer, xypad, wavetabledisplay, harmoniceditor, looppoints, envelopeeditor, sampledisplay, patchbay, signalflow
```

## State of the Art

### Canvas Interaction Patterns

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Click-based zoom controls | Scroll wheel zoom with pointer anchor | Modern design tools | Smoother, more intuitive zoom centered on cursor position |
| Global undo/redo only | Temporal undo with pause/resume during drag | Zustand temporal middleware | Single undo entry for complete drag operation, not every pixel moved |
| Fixed canvas size | Multi-window with per-window dimensions | Multi-window feature addition | Each window has independent canvas size and background |

### Element Palette Organization

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat element list | Collapsible categories | Initial palette design | Better organization, reduced scrolling |
| No Pro distinction | Pro badges and toggle | License feature addition | Clear visual indicator of paid features |
| Manual search | Debounced search (200ms) | Search optimization | Responsive search without lag |

**Not deprecated, but evolved:**
- Legacy `meter` element type still exists for backward compatibility alongside new professional meters (RMS, VU, PPM, etc.)
- Snap grid originally toggle-only, now includes adjustable grid size and color
- Background originally solid color only, now supports gradient and image types

## Open Questions

None — all required implementation details are present in source code.

## Sources

### Primary (HIGH confidence)

**Source code (definitive):**
- `src/components/Canvas/Canvas.tsx` - Canvas rendering, drag-drop, context menu, zoom indicator
- `src/components/Canvas/hooks/useKeyboardShortcuts.ts` - All keyboard shortcuts
- `src/components/Canvas/hooks/useElementNudge.ts` - Arrow key nudging (1px, 10px with Shift)
- `src/components/Canvas/hooks/usePan.ts` - Space+drag pan behavior
- `src/components/Canvas/hooks/useZoom.ts` - Scroll wheel zoom with pointer anchor
- `src/components/Canvas/hooks/useMarquee.ts` - Marquee selection (drag rectangle)
- `src/components/Canvas/hooks/useCopyPaste.ts` - Copy/paste/duplicate with 20px offset
- `src/components/Canvas/hooks/useResize.ts` - Resize handles, aspect ratio, snap-to-grid
- `src/components/Palette/Palette.tsx` - Element categories, search, Pro element toggle
- `src/components/Palette/PaletteItem.tsx` - Draggable palette items
- `src/services/proElements.ts` - PRO_ELEMENTS registry (50 Pro types)
- `src/store/canvasSlice.ts` - Grid settings, snap-to-grid, background configuration, lockAllMode
- `src/App.tsx` - Drag-end handler (palette-to-canvas element creation)

**Existing documentation (reference):**
- `docs/manual/getting-started.md` - Writing style, screenshot placeholder format, tutorial structure
- `docs/manual/README.md` - TOC organization, brief descriptions after links
- `docs/ELEMENT_REFERENCE.md` - Element listing format, property tables

### Secondary (MEDIUM confidence)

- User decisions from `61-CONTEXT.md` - Content depth, workflow grouping, screenshot strategy (confirmed by user discussion)

### Tertiary (LOW confidence)

- None — all findings verified against source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new stack, existing markdown documentation
- Architecture: HIGH - Workflow grouping verified with source code, pattern examples from getting-started.md
- Pitfalls: HIGH - All pitfalls based on potential documentation/implementation mismatches

**Research date:** 2026-02-06
**Valid until:** 90 days (documentation-only phase, implementation unlikely to change rapidly)

**Element counts verified:**
- Total palette items: 109+ (counted from Palette.tsx paletteCategories array)
- Pro elements: 50 (counted from proElements.ts PRO_ELEMENTS registry)
- Element categories: 14 (Rotary Controls, Linear Controls, Buttons, Value Displays, Meters, Audio Displays, Visualizations, Curves, Form Controls, Navigation & Selection, Images & Decorative, Containers, Complex Widgets, Specialized Audio)

**Keyboard shortcuts verified:**
- Undo: Ctrl+Z (Windows/Linux), Cmd+Z (Mac)
- Redo: Ctrl+Y, Ctrl+Shift+Z (Windows/Linux), Cmd+Shift+Z (Mac)
- Copy: Ctrl+C / Cmd+C
- Paste: Ctrl+V / Cmd+V
- Duplicate: Ctrl+D / Cmd+D
- Delete: Delete or Backspace
- Clear selection: Escape
- Toggle snap grid: Ctrl+G / Cmd+G
- Arrow nudge: Arrow keys (1px), Shift+Arrow (10px)
- Layer order: Ctrl/Cmd+Shift+[ / ], Ctrl/Cmd+[ / ]

**Canvas features verified:**
- Pan: Space+drag, cursor changes to grab/grabbing
- Zoom: Scroll wheel (5% per step), Ctrl+scroll on trackpad
- Zoom limits: 0.1x (10%) to 10x (1000%)
- Zoom indicator: Bottom-right corner, click to edit, double-click to reset to 100%
- Snap grid: Toggle with Ctrl+G, adjustable size (default 10px), adjustable color (default #ffffff)
- Background types: color, gradient (linear with angle), image (future/not yet implemented)
- Locking: Individual element.locked property, global lockAllMode toggle
- Copy/paste offset: 20px diagonal offset for pasted/duplicated elements
- Marquee selection: 5px threshold before activating
