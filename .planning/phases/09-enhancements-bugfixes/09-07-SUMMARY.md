---
phase: 09-enhancements-bugfixes
plan: 07
subsystem: import
tags: [template-import, html-parser, reverse-engineering, juce-webview2]
requires: [02-element-library, 04-palette-element-creation]
provides: [template-import-feature, html-css-parser]
affects: [future-import-enhancements]
tech-stack:
  added: []
  patterns: [html-parsing, dom-parser, css-extraction]
key-files:
  created:
    - src/services/import/templateParser.ts
    - src/components/Import/TemplateImporter.tsx
  modified:
    - src/components/Layout/LeftPanel.tsx
decisions: []
metrics:
  duration: 3.28
  completed: 2026-01-24
---

# Phase 09 Plan 07: Template Import Summary

**One-liner:** Import existing JUCE WebView2 HTML/CSS/JS templates into the designer for reverse-engineering and iteration.

## What Was Built

### Template Parser Service
Created `templateParser.ts` with HTML/CSS parsing capabilities:

- **parseJUCETemplate()** - Main parser function that extracts ElementConfig[] from HTML/CSS
- **Element detection** - Supports both `data-element-type` attributes and class-based detection (`.knob`, `.slider`, etc.)
- **Position extraction** - Reads element positions from CSS rules or inline styles
- **Canvas dimensions** - Extracts canvas size from `#plugin-container` CSS
- **Error handling** - Returns errors array for unparseable elements
- **Smart defaults** - Infers element orientation from dimensions, uses element names from IDs

### Template Importer UI
Created `TemplateImporter.tsx` dialog component:

- **File drop zone** - Drag & drop interface using react-dropzone for HTML/CSS/JS files
- **File indicators** - Visual badges showing which files are loaded (HTML ✓, CSS ✓, JS ✓)
- **Parse preview** - Shows element count, canvas dimensions, and parsing warnings before import
- **Element list** - Displays all detected elements with name and type
- **Import action** - Adds all parsed elements to canvas and updates canvas dimensions
- **Reset functionality** - Clear parsed data to start over

### Left Panel Integration
Updated `LeftPanel.tsx`:

- **Import Template button** - Fixed position at bottom of left panel
- **Flexbox layout** - Palette scrolls independently, button stays visible
- **Dialog trigger** - Opens TemplateImporter on click

## Implementation Notes

### HTML Parsing Strategy
The parser uses browser's native DOMParser for HTML parsing:

1. Parse HTML into Document
2. Find `#plugin-container` or fallback to body
3. Query all elements with `[data-element-type]` or class selectors
4. Extract position/size from CSS or inline styles
5. Create ElementConfig using factory functions

### CSS Extraction
The `extractStyle()` helper function:
- Uses regex to find CSS rules for a selector
- Converts kebab-case to camelCase (font-size → fontSize)
- Supports both ID selectors (`#knob1`) and class selectors (`.knob`)

### Round-Trip Compatible
Designed to work seamlessly with exported HTML from this tool:
- Exported HTML uses `data-element-type` attributes
- Parser reads both data attributes and class names
- Can import templates from other JUCE WebView2 projects using standard class names

## Verification Results

All verification steps passed:

1. ✓ `npm run build` completed successfully
2. ✓ Dev server starts without errors
3. ✓ Import Template button visible in left panel
4. ✓ Click opens TemplateImporter dialog
5. ✓ File drop zone accepts HTML/CSS/JS files
6. ✓ Parse Template button shows preview with element count
7. ✓ Import adds elements to canvas with correct positions
8. ✓ Canvas dimensions updated on import

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash    | Message                                      |
|---------|----------------------------------------------|
| 9a18c3b | feat(09-07): create template parser service  |
| daedf67 | feat(09-07): create template importer UI     |
| 206eb3a | feat(09-07): add import template button      |

## Next Phase Readiness

**Status:** ✓ FEAT-03 Complete

**What's unlocked:**
- Users can now import existing JUCE WebView2 templates for editing
- Reverse-engineering workflow: import → modify → re-export
- Template library sharing between projects

**Potential enhancements:**
- Support for importing images (currently only detects img src)
- More sophisticated CSS parsing (gradients, transforms, filters)
- Batch import multiple templates
- Template preview before import (visual canvas preview)
- Import from URL (fetch remote templates)

**No blockers** - Feature is fully functional and ready for use.
