---
status: diagnosed
trigger: "Dropdown and Radio Group property panel textareas cannot be edited"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:00:00Z
---

## Current Focus

hypothesis: The textarea onChange handler filters out empty lines, causing issue when user presses Enter to add new line
test: Trace through what happens when user presses Enter at end of last option
expecting: If hypothesis correct, trailing newline gets removed causing cursor jump
next_action: Test manually or add preserveEmptyLines logic to onChange handler

## Symptoms

expected: User should be able to click textarea, type, and edit options
actual: User reports textarea "doesn't let me edit it"
errors: None reported
reproduction: Select a Dropdown or RadioGroup element, try to edit the textarea in property panel
started: After Phase 13 added form control elements

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-01-25
  checked: DropdownProperties.tsx and RadioGroupProperties.tsx textarea implementation
  found: Both have identical textarea pattern with onChange that filters empty lines
  implication: The filter pattern could cause issues but same pattern works in ModulationMatrix

- timestamp: 2026-01-25
  checked: PropertyPanel.tsx for proper component rendering
  found: Correct conditional rendering with isDropdown() and isRadioGroup() type guards
  implication: Components should be rendering correctly

- timestamp: 2026-01-25
  checked: Keyboard shortcuts with react-hotkeys-hook
  found: All hotkeys use enableOnFormTags: false which disables them in form elements
  implication: Keyboard shortcuts should not interfere with textarea input

- timestamp: 2026-01-25
  checked: usePan.ts spacebar handler
  found: Has isTypingInInput() guard that checks for textarea
  implication: Spacebar panning should not trigger while typing in textarea

- timestamp: 2026-01-25
  checked: CSS and disabled/readOnly attributes
  found: No CSS blocking pointer events, no disabled/readOnly attributes on textarea
  implication: Not a CSS or HTML attribute issue

- timestamp: 2026-01-25
  checked: ColorInput.tsx mousedown listener
  found: Only active when color picker is open (showPicker state)
  implication: Should not interfere unless user has color picker open

## Resolution

root_cause: The textarea onChange handler in DropdownProperties.tsx and RadioGroupProperties.tsx immediately filters out empty lines with `.filter((line) => line.trim() !== '')`. This causes the following problem:

1. User presses Enter to start typing a new option
2. Textarea value becomes "Option 1\nOption 2\n" (trailing newline)
3. onChange fires, splits by '\n', filters empty strings
4. Result: ["Option 1", "Option 2"] (newline removed!)
5. State updates, textarea re-renders with "Option 1\nOption 2" (no trailing newline)
6. Cursor position is lost, user cannot start new line

The same pattern exists in ModulationMatrixProperties.tsx but that component may work differently due to how users interact with it (users may type the full text before pressing Enter, rather than pressing Enter first).

fix: Modify the onChange handler to preserve empty lines during editing, and only clean up empty lines when leaving the field (onBlur) or on a debounced basis. Alternative: allow trailing newlines but only filter truly empty/whitespace-only lines in the middle.

verification: TBD
files_changed:
- /workspaces/vst3-webview-ui-designer/src/components/Properties/DropdownProperties.tsx
- /workspaces/vst3-webview-ui-designer/src/components/Properties/RadioGroupProperties.tsx
