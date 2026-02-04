---
phase: 15-asset-library-storage-ui
plan: 02
subsystem: asset-library
tags: [ui, react, svg, file-upload, validation, dropzone]
requires: [14-03, 14-04, 15-01]
provides: [ImportAssetDialog, getSVGMetadata]
affects: [15-03, 15-04]
tech-stack:
  added: []
  patterns: [react-dropzone, URL.createObjectURL, cleanup-pattern]
key-files:
  created:
    - src/components/AssetLibrary/ImportAssetDialog.tsx
    - src/components/AssetLibrary/index.ts
  modified:
    - src/lib/svg-validator.ts
decisions:
  - id: ASSET-02-01
    decision: "react-dropzone for file upload with single file mode"
    rationale: "Proven pattern from TemplateImporter, excellent UX"
  - id: ASSET-02-02
    decision: "URL.createObjectURL for preview with useEffect cleanup"
    rationale: "Prevents memory leaks, follows React best practices"
  - id: ASSET-02-03
    decision: "Name field empty by default (user must provide name)"
    rationale: "Per CONTEXT.md - forces intentional naming, avoids filename clutter"
  - id: ASSET-02-04
    decision: "Preview at 96px max size in import dialog"
    rationale: "Large enough to evaluate quality, small enough for dialog layout"
metrics:
  duration: 2 min
  completed: 2026-01-26
---

# Phase 15 Plan 02: SVG Import Dialog Summary

**One-liner:** Modal dialog for importing SVG files with drag-and-drop, live preview, validation display, and category selection.

## What Was Built

### ImportAssetDialog Component

Created a comprehensive SVG import dialog following the TemplateImporter pattern with enhancements for single-file SVG upload:

**Core Features:**
- react-dropzone integration (single file, .svg only)
- File size and content validation before acceptance
- SafeSVG preview component rendering (96px max)
- File metadata display (name, size in KB, element count)
- Validation status with green checkmarks for all passed checks
- Required name input field (empty by default)
- Category multi-select with DEFAULT_CATEGORIES checkboxes
- Import/Cancel actions with proper disabled states

**State Management:**
- `file`: Selected File object
- `svgContent`: Raw SVG text
- `sanitizedContent`: After sanitizeSVG processing
- `previewUrl`: URL.createObjectURL result (with cleanup)
- `name`: User-entered asset name
- `selectedCategories`: Multi-select category array
- `validationResult`: From validateSVGContent
- `importing`: Loading state

**Security Integration:**
- validateSVGFile for file size check (1MB limit)
- validateSVGContent for dangerous elements
- sanitizeSVG before preview and storage
- SafeSVG component for preview rendering (defense-in-depth)

**Memory Management:**
- useEffect cleanup hook for URL.revokeObjectURL
- Cleanup on dialog close, file change, and component unmount
- Prevents memory leaks from blob URLs

### getSVGMetadata Helper Function

Added to svg-validator.ts to centralize metadata extraction:

**Returns:**
- `elementCount`: Total SVG child elements
- `hasScripts`: Boolean for script tag detection
- `hasExternalRefs`: Boolean for external URL detection
- `viewBox`, `width`, `height`: SVG dimension attributes

**Benefits:**
- Single source of truth for element counting
- Reusable across import dialog and future features
- Consistent error handling for parse failures

### Barrel Export

Created `src/components/AssetLibrary/index.ts`:
- Exports ImportAssetDialog for clean imports
- Establishes pattern for future AssetLibrary components

## Technical Decisions

### react-dropzone Configuration

```typescript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: { 'image/svg+xml': ['.svg'] },
  multiple: false,
  maxFiles: 1,
  onDrop: handleFileDrop,
})
```

Single file mode with strict SVG MIME type. Prevents multi-file confusion and enforces one-at-a-time import workflow.

### Empty Name Field Default

Name field starts empty (not pre-filled with filename). Forces user to provide intentional, meaningful names rather than accepting default "icon-download.svg" type names.

### Preview URL Lifecycle

```typescript
useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }
}, [previewUrl])
```

Cleanup function runs when previewUrl changes or component unmounts. Prevents memory leaks from accumulating blob URLs during multiple file selections.

### Validation-First Flow

1. Validate file size (validateSVGFile)
2. Read file content
3. Validate content (validateSVGContent)
4. If valid, sanitize (sanitizeSVG)
5. Create preview and show UI

Fails fast on validation errors with toast notifications. Never sanitizes invalid content.

## Implementation Notes

### handleFileDrop Flow

```typescript
1. Check file size → toast.error if too large
2. Read file.text()
3. validateSVGContent → toast.error if invalid
4. sanitizeSVG → store sanitized version
5. URL.createObjectURL → create preview
6. Update all state
7. toast.success
```

Single async flow with early returns on validation failures.

### handleImport Flow

```typescript
1. Verify: file, sanitizedContent, name, validationResult.valid
2. Get metadata using getSVGMetadata
3. Call addAsset with all 7 Asset fields
4. toast.success
5. handleReset (including URL cleanup)
6. onClose
```

### Import Button Disabled Logic

```typescript
const isImportDisabled = !file || !name.trim() || !validationResult?.valid || importing
```

Four conditions must all be false:
- File must be selected
- Name must be non-empty (trimmed)
- Validation must have passed
- Not currently importing

## Integration Points

**From Phase 14 (Security):**
- validateSVGFile/validateSVGContent from svg-validator.ts
- sanitizeSVG from svg-sanitizer.ts
- SafeSVG component for preview rendering
- react-hot-toast for validation error messages

**From Phase 15-01 (Storage):**
- useStore addAsset action
- Asset type with 7 required fields
- DEFAULT_CATEGORIES constant

**To Phase 15-03 (Asset Browser):**
- Provides ImportAssetDialog for integration into main UI
- Asset created in store, ready for browser display

**To Phase 15-04 (Drag to Canvas):**
- Assets stored with sanitizedContent ready for canvas rendering

## Files Modified

### Created Files

1. **src/components/AssetLibrary/ImportAssetDialog.tsx** (291 lines)
   - Modal dialog component
   - react-dropzone integration
   - Preview and validation display
   - Name and category inputs
   - Import action handler

2. **src/components/AssetLibrary/index.ts** (1 line)
   - Barrel export for AssetLibrary components

### Modified Files

1. **src/lib/svg-validator.ts** (+59 lines)
   - Added getSVGMetadata function
   - Extracts element count and dimension attributes
   - Returns metadata object for display purposes

## Testing Results

**TypeScript Compilation:**
```
npx tsc --noEmit
✓ No type errors
```

**Existing Tests:**
```
npm test -- --run
✓ svg-validator.test.ts (14 tests) - 508ms
✓ svg-sanitizer.test.ts (20 tests) - 94ms
✓ All 34 tests passed
```

No regressions. New getSVGMetadata function doesn't affect existing test coverage (metadata extraction is presentation logic, not security-critical).

## Deviations from Plan

None - plan executed exactly as written.

## Known Limitations

1. **No custom category creation in dialog** - Only DEFAULT_CATEGORIES available
   - Will be addressed in future plan if needed
   - Custom categories can be added via separate UI

2. **No bulk import** - One file at a time
   - Intentional for v1.1 (simplicity)
   - Could add multi-file support in future iteration

3. **No visual category icons** - Text-only category labels
   - Could enhance with icons in future polish phase

4. **No file name suggestion** - Name field completely empty
   - Per CONTEXT.md design decision
   - Could add "suggest from filename" button in future

## Next Phase Readiness

**For 15-03 (Asset Browser UI):**
- ✓ ImportAssetDialog component complete and exported
- ✓ Assets being added to store with all required fields
- ✓ Category selection working (multi-select)
- NEXT: Wire up button to open ImportAssetDialog
- NEXT: Build asset browser grid with category filtering

**For 15-04 (Drag to Canvas):**
- ✓ Assets stored with sanitized SVG content
- ✓ Asset IDs available for reference tracking
- NEXT: Implement drag-from-library-to-canvas logic

**For future polish:**
- TODO: Add unit tests for ImportAssetDialog (not in v1.1 scope)
- TODO: Add keyboard shortcuts (Escape to close)
- TODO: Add progress indicator for large file reads
- TODO: Consider file name suggestion option

## Performance Notes

- URL.createObjectURL is instant (no encoding overhead)
- File reading is async with proper error handling
- Preview rendering uses SafeSVG (useMemo for efficiency)
- No performance concerns for typical SVG sizes (<100KB)

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1+2 | ImportAssetDialog + getSVGMetadata | 0cf5995 | ImportAssetDialog.tsx, index.ts, svg-validator.ts |

**Note:** Tasks 1 and 2 committed together as they form a cohesive unit (dialog depends on metadata function).

---

**Status:** Complete
**Duration:** ~2 minutes
**Wave:** 2 of 4 (Phase 15)
