---
status: diagnosed
phase: 40-bugs-and-improvements
source: 40-01-SUMMARY.md, 40-02-SUMMARY.md, 40-03-SUMMARY.md, 40-04-SUMMARY.md, 40-05-SUMMARY.md, 40-06-SUMMARY.md, 40-07-SUMMARY.md, 40-08-SUMMARY.md
started: 2026-01-29T19:00:00Z
updated: 2026-01-29T19:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Project Version Inference
expected: Create/load a project JSON without "version" field but with "windows" array. Should load successfully (v2.0.0 inferred), no error.
result: skipped
reason: Edge case - user declined to test JSON manipulation

### 2. Window-Scoped Name Uniqueness
expected: Create two windows (Release and Developer). Add "Button1" element in Release window, then add "Button1" in Developer window. Both should be allowed (no duplicate name error).
result: skipped
reason: Edge case - skipped with Test 1

### 3. Multi-Window Duplicate Operation
expected: Select multiple elements in Release window. Ctrl+D to duplicate. Only elements in Release window are duplicated (Developer window unaffected).
result: skipped
reason: Edge case - skipped with Test 1

### 4. Button Border Width
expected: Add a Button element. In properties panel, find "Border Width" control. Adjust it (0-10px). Button border thickness should change on canvas and in export.
result: pass

### 5. Color Picker State Sync
expected: Select an element, open color picker. Select a different element with different color. Color picker swatch should update to match the new element's color (not show old color).
result: pass

### 6. Label/Value Distance Controls
expected: Add a Knob element. In properties panel, find Label Distance and Value Distance controls. Verify they allow negative values (down to -20) and fine-grained adjustment (0.1 step).
result: pass

### 7. Folder Export Option
expected: Click Export. See radio buttons for "ZIP Archive" vs "Export to Folder". Select "Export to Folder", click export. Folder picker appears, files written directly to selected folder.
result: issue
reported: "it created a subfolder called 'main-window'. why? all files should just be copied there"
severity: minor

### 8. Container Editor Grid
expected: Add a Panel container. Double-click to enter container editor. Enable grid (Ctrl+G). Grid should appear in container editor matching main canvas grid settings.
result: pass
note: Grid renders correctly

### 9. Container Editor Snap-to-Grid
expected: In container editor with grid enabled, drag an element. Element should snap to grid lines when snapToGrid is enabled.
result: pass
note: Snaps on mouse release (same as main canvas). User perception - works correctly.

### 10. Container Editor Copy/Paste
expected: In container editor, select element(s). Ctrl+C to copy, Ctrl+V to paste. Pasted elements appear with 20px offset and "copy" suffix in name.
result: pass
note: Copy/paste works, but multi-select drag doesn't work (separate issue logged)

### 11. Container Editor Context Menu
expected: In container editor, right-click on canvas or element. Context menu appears with Copy/Paste/Duplicate options.
result: pass

### 12. Alt/Ctrl+Click Deselection (Main Canvas)
expected: Multi-select several elements (Shift+click). Alt+click or Ctrl+click on a selected element. That element is removed from selection (others remain selected).
result: pass

### 13. Alt/Ctrl+Click Deselection (Container Editor)
expected: In container editor, multi-select several elements. Alt+click or Ctrl+click on a selected element. Element is deselected without starting drag.
result: pass

### 14. Font Weight Display Names
expected: Load a custom font family with multiple weights (e.g., Inter Light, Inter Regular, Inter Bold). Select an element with that font. Font weight dropdown should show actual names like "Light (300)" instead of generic "300".
result: skipped
reason: No custom fonts available to test; user reports no visible "Fonts" section in UI

### 15. Font Weight in Preview
expected: Add a text element using a custom font with specific weight. Open browser preview. Font renders with correct weight (not falling back to Regular/400).
result: skipped
reason: No custom fonts available; font management UI not found in interface

## Summary

total: 15
passed: 9
issues: 1
pending: 0
skipped: 5

Note: Test 9 reclassified as pass after diagnosis (snap-on-release works correctly).
Additional gap found during Test 10: multi-select drag not working (separate from copy/paste).

## Gaps

- truth: "Single-window export should write files directly to selected folder"
  status: failed
  reason: "User reported: it created a subfolder called 'main-window'. why? all files should just be copied there"
  severity: minor
  test: 7
  root_cause: "exportMultiWindowToFolder always creates subdirectory via getDirectoryHandle, no check for single window"
  artifacts:
    - path: "src/services/export/codeGenerator.ts"
      issue: "Lines 857-864 unconditionally create subdirectory for each window"
  missing:
    - "Add check: if windowsToExport.length === 1, write directly to dirHandle instead of creating subdirectory"
  debug_session: ".planning/debug/folder-export-unnecessary-subfolder.md"

- truth: "Elements snap to grid when dragged in container editor"
  status: not_a_bug
  reason: "User reported: elements are not snapping to the grid"
  severity: none
  test: 9
  root_cause: "Snap-on-release behavior (not snap-during-drag) - same as main canvas. Works correctly."
  artifacts:
    - path: "src/components/ContainerEditor/ContainerEditorCanvas.tsx"
      issue: "snapPosition() called in handleMouseUp (line 121) - snaps on release, not during drag"
  missing: []
  debug_session: ".planning/debug/container-snap-to-grid.md"

- truth: "Multi-selected elements can be dragged together in container editor"
  status: failed
  reason: "User reported: i cant drag them together when i select multiple ones"
  severity: major
  test: 10
  root_cause: "DragState only tracks single element (childId). No support for multi-element drag."
  artifacts:
    - path: "src/components/ContainerEditor/ContainerEditorCanvas.tsx"
      issue: "DragState interface only has childId for one element, startDrag/handleMouseUp/getDragOffset all single-element"
  missing:
    - "Modify DragState to store map of selected elements' start positions"
    - "In startDrag, capture start positions for all elements in selectedIds"
    - "In handleMouseUp, iterate all selected elements and apply delta"
    - "In getDragOffset, return offset for any element in selection being dragged"
  debug_session: ".planning/debug/container-multiselect-drag.md"
