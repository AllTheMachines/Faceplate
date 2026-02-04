---
status: diagnosed
phase: 49-core-ui-fixes
source: 49-01-SUMMARY.md
started: 2026-02-02T15:00:00Z
updated: 2026-02-02T15:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Color Picker Drag Stays Open
expected: Click and drag within color picker to select colors - picker remains open throughout drag operation
result: issue
reported: "it still doesnt work. when i try to drag with the color picker it closes immediately. maybe its because the textfield that are behind it?"
severity: major

### 2. Help Related Topics Navigation
expected: Open help (click ? button or use help panel). Click a "Related Topics" link. The content navigates WITHIN the same window (no new popup opens). The linked section appears with a brief blue highlight.
result: issue
reported: "i have just clicked on 'knob element' and non of the related topics led somewhere. i just see a back button show up. thats all. what i really need is all the related topics to be written"
severity: major

### 3. Help Back Button
expected: After navigating to a related topic (Test 2), a Back button appears at the top. Clicking it returns to the previous section and restores scroll position.
result: pass

## Summary

total: 3
passed: 1
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Color picker stays open during drag interactions"
  status: failed
  reason: "User reported: it still doesnt work. when i try to drag with the color picker it closes immediately. maybe its because the textfield that are behind it?"
  severity: major
  test: 1
  root_cause: "useEffect on [value] dependency (lines 15-19 in ColorInput.tsx) closes picker whenever color value changes, including during active color picking/dragging. The stopPropagation fix only prevents mousedown bubbling but doesn't prevent the useEffect from firing when onChange updates the value prop."
  artifacts:
    - path: "src/components/Properties/ColorInput.tsx"
      issue: "Lines 15-19 useEffect calls setShowPicker(false) whenever value changes - this fires during dragging because each drag movement triggers onChange"
  missing:
    - "Track whether picker is source of change (e.g., isPickingRef) to distinguish element selection change vs active color picking"
    - "Or remove useEffect and handle element-switching via key prop or elementId dependency"

- truth: "Related Topics links navigate to the linked section content"
  status: failed
  reason: "User reported: i have just clicked on 'knob element' and non of the related topics led somewhere. i just see a back button show up. thats all. what i really need is all the related topics to be written"
  severity: major
  test: 2
  root_cause: "findElementKeyInTopic() uses first-match substring matching. Since 'knob' appears before 'steppedknob' in keys and is a substring, topics like 'Use SteppedKnob...' match 'knob' instead of 'steppedknob'. This causes links to point to wrong sections and collectRelatedTopics to skip adding variant sections (already has base type)."
  artifacts:
    - path: "src/services/helpService.ts"
      issue: "findElementKeyInTopic (lines 33-57) matches base types before variant types"
    - path: "src/services/helpService.ts"
      issue: "collectRelatedTopics skips adding related sections when key incorrectly matches main topic"
    - path: "src/services/helpService.ts"
      issue: "renderRelatedTopic generates links to wrong section IDs"
  missing:
    - "Match LONGEST key first (sort knownElementTypes by length descending)"
    - "Or use word boundary matching instead of substring matching"
