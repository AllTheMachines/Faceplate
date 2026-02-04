---
status: diagnosed
trigger: "Folder Export Creates Unnecessary Subfolder - single-window project creates 'main-window' subfolder instead of writing files directly"
created: 2026-01-29T12:00:00Z
updated: 2026-01-29T12:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - exportMultiWindowToFolder always creates window subdirectory regardless of window count
test: Read codeGenerator.ts lines 857-864
expecting: Found unconditional subfolder creation
next_action: Document root cause and suggest fix

## Symptoms

expected: Single-window project exports files directly to selected folder
actual: Creates "main-window" subfolder even for single-window projects
errors: None (functional but UX issue)
reproduction: Use "Export to Folder" with a single-window project
started: Phase 40-04 implementation

## Eliminated

## Evidence

- timestamp: 2026-01-29T12:01:00Z
  checked: exportMultiWindowToFolder function in codeGenerator.ts (lines 785-970)
  found: |
    The loop at lines 857-864 ALWAYS creates a subdirectory for each window:
    ```javascript
    for (const window of windowsToExport) {
      const baseName = toFolderName(window.name)
      const folderName = window.type === 'developer' ? `dev-${baseName}` : baseName
      // Create window directory - ALWAYS creates subdirectory
      const windowDir = await dirHandle.getDirectoryHandle(folderName, { create: true })
      // ... writes files to windowDir
    }
    ```
    There is no check for `windowsToExport.length === 1` to skip subfolder creation.
  implication: Single-window projects get unnecessary subfolder because the code was designed for multi-window without a single-window special case

## Resolution

root_cause: |
  The `exportMultiWindowToFolder` function (lines 857-864) unconditionally creates a subdirectory
  for each window using `dirHandle.getDirectoryHandle(folderName, { create: true })`.
  There is no special case for single-window projects - the code always loops through windows
  and creates a subdirectory for each one, even when there's only one window.

fix: |
  Add a check at the start of the export loop: if `windowsToExport.length === 1`,
  write files directly to `dirHandle` instead of creating a subdirectory.

  Key changes needed around line 857:
  1. Check if single window: `const isSingleWindow = windowsToExport.length === 1`
  2. If single window, use `dirHandle` directly as the target directory
  3. If multiple windows, create subdirectories as currently done
  4. Also skip the README.md generation for single-window (or include it at root)
  5. Note: windowMapping for navigation should be empty for single window anyway

verification:
files_changed: []
