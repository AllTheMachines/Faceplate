# Sample GitHub Issues from Test Failures

This document shows examples of GitHub issues that Claude will create from your test results.

---

## Example 1: UI Behavior Bug

### Issue Title
**Bug: Layer visibility toggle doesn't hide element from canvas**

### Issue Body
```markdown
## Description

Layer visibility toggle (eye icon) doesn't properly hide elements from canvas. Elements remain visible but appear grayed out instead of being completely hidden.

**Priority:** High
**Found in:** [F2] Layers System Operations
**Test Date:** 30 Jan 2026
**Browser:** Chrome 120

---

## Expected Behavior

When clicking the eye icon next to a layer in the Layers panel:
1. Element should completely disappear from canvas
2. Element should not be selectable
3. Eye icon should show "closed eye" state
4. Element should reappear when eye icon clicked again

---

## Actual Behavior

When clicking the eye icon:
1. Element remains visible on canvas
2. Element appears grayed out/semi-transparent (50% opacity)
3. Element is still selectable
4. Eye icon changes state correctly

---

## Steps to Reproduce

1. Start dev server (`npm run dev`)
2. Open app in Chrome
3. Add a knob element to canvas at position (100, 100)
4. Open Layers panel (should be visible by default)
5. Locate "Knob" layer in layers list
6. Click eye icon next to knob layer
7. **BUG:** Knob remains visible but grayed out

**Expected:** Knob should disappear completely

---

## Console Errors

None

---

## Screenshots

Element still visible after eye icon clicked (described by tester)

---

## Test Scenario Reference

See: [`docs/CLAUDE_CHROME_TESTING.md`](../docs/CLAUDE_CHROME_TESTING.md) - Scenario [F2]

---

## Environment

- **Browser:** Chrome 120
- **OS:** Windows 11
- **Test Method:** Claude Chrome Extension automated testing
- **Build:** 30 Jan 00:15 CET

---

## Suggested Fix Areas

Check the following files:
- `src/components/LayersPanel/` - Layer visibility toggle handler
- `src/store/` - Zustand store visibility state
- `src/components/Canvas/` - Element rendering with visibility check
- CSS: Verify `display: none` vs `opacity: 0` usage

---

## Labels

`bug`, `testing`, `layers-system`, `priority-high`
```

---

## Example 2: Export Code Issue

### Issue Title
**Bug: JavaScript bridge uses Math.random() instead of sequential integers**

### Issue Body
```markdown
## Description

The exported `juce-bridge.js` file uses `Math.random()` for result IDs instead of sequential integers, which violates the documented JUCE Event-Based Pattern architecture.

**Priority:** High
**Found in:** [X3] JavaScript Bridge Code
**Test Date:** 30 Jan 2026
**Browser:** Chrome 120

---

## Expected Behavior

According to `PROJECT.md` (Technical Architecture section):

> **Integer Result IDs** - Sequential integer (not Math.random) for reliable event matching

The exported JavaScript bridge should use:
```javascript
let currentResultId = 0;

function createJuceFunction(functionName) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      const resultId = ++currentResultId; // Sequential integer
      // ... rest of wrapper
    });
  };
}
```

---

## Actual Behavior

The exported `juce-bridge.js` contains:
```javascript
const resultId = Math.random() * 10000; // Line 47
```

This creates:
- Non-sequential IDs (random)
- Possible collisions
- Inconsistency with documented pattern
- Potential reliability issues in JUCE event matching

---

## Steps to Reproduce

1. Create any project (even single element)
2. Export as JUCE Bundle
3. Extract ZIP file
4. Open `juce-bridge.js`
5. Search for `resultId`
6. **BUG:** Line 47 shows `Math.random() * 10000`

**Expected:** Should be `++currentResultId`

---

## Console Errors

None (code generation issue, not runtime)

---

## Screenshots

```javascript
// Found in exported juce-bridge.js:47
function createJuceFunction(functionName) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      const resultId = Math.random() * 10000; // ❌ WRONG
      // ...
    });
  };
}
```

---

## Test Scenario Reference

See: [`docs/CLAUDE_CHROME_TESTING.md`](../docs/CLAUDE_CHROME_TESTING.md) - Scenario [X3]

---

## Environment

- **Browser:** Chrome 120
- **OS:** Windows 11
- **Test Method:** Manual export inspection
- **Build:** 30 Jan 00:15 CET

---

## Suggested Fix Areas

Check the following files:
- `src/services/export/jsGenerator.ts` - JavaScript export generator
- Verify the JUCE bridge template uses `++currentResultId` pattern
- Add unit test to verify exported code matches documented pattern

---

## Impact

**Medium:** Exported code may work in most cases, but violates architecture documentation and could cause event matching issues in complex UIs with many parameter changes.

---

## Labels

`bug`, `export`, `juce-bridge`, `priority-high`, `architecture`
```

---

## Example 3: Crash/Error Bug

### Issue Title
**Bug: Group Box container "Edit Contents" button crashes editor**

### Issue Body
```markdown
## Description

Clicking "Edit Contents" button on Group Box container type causes JavaScript error and prevents opening the container editor. Other container types (Panel, Frame) work correctly.

**Priority:** Critical
**Found in:** [E3] All Container Elements Function
**Test Date:** 30 Jan 2026
**Browser:** Chrome 120

---

## Expected Behavior

When clicking "Edit Contents" button on a Group Box container:
1. Container editor should open
2. Breadcrumb should update: "Main > Group Box"
3. Canvas should switch to container interior view
4. Palette should remain accessible to add child elements

---

## Actual Behavior

When clicking "Edit Contents" button:
1. Button click has no effect
2. No breadcrumb appears
3. Canvas view doesn't change
4. Console shows TypeError

---

## Steps to Reproduce

1. Start dev server (`npm run dev`)
2. Open app in Chrome
3. From palette, add "Group Box" container to canvas (200x200)
4. Select Group Box
5. Look for "Edit Contents" button in toolbar or Properties panel
6. Click "Edit Contents" button
7. **BUG:** Nothing happens, error appears in console

**Expected:** Container editor should open

---

## Console Errors

```
TypeError: Cannot read property 'id' of undefined
    at containerEditor.tsx:89
    at onClick (Button.tsx:45)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164)
```

Full stack trace:
```
TypeError: Cannot read property 'id' of undefined
    at enterContainerEditor (src/components/ContainerEditor/containerEditor.tsx:89:32)
    at onClick (src/components/ui/Button.tsx:45:12)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
```

---

## Screenshots

Button present but non-functional (described by tester)

---

## Test Scenario Reference

See: [`docs/CLAUDE_CHROME_TESTING.md`](../docs/CLAUDE_CHROME_TESTING.md) - Scenario [E3]

---

## Environment

- **Browser:** Chrome 120 (DevTools open)
- **OS:** Windows 11
- **Test Method:** Claude Chrome Extension automated testing
- **Build:** 30 Jan 00:15 CET

---

## Suggested Fix Areas

Check the following files:
- `src/components/ContainerEditor/containerEditor.tsx:89` - Null check for container ID
- `src/components/Properties/` - Verify "Edit Contents" button passes correct data
- `src/types/elements/containers.ts` - Check Group Box element type definition

Likely issue: Group Box element doesn't have `containerId` property or it's undefined when button is clicked.

---

## Impact

**Critical:** Group Box containers are completely unusable - cannot add child elements. Blocks testing of nested container functionality.

---

## Workaround

Use Panel or Frame container types instead (these work correctly).

---

## Labels

`bug`, `crash`, `container-editor`, `priority-critical`, `group-box`
```

---

## Example 4: Performance Issue

### Issue Title
**Performance: Font loading takes 30+ seconds with 100+ fonts**

### Issue Body
```markdown
## Description

Font management system becomes unresponsive when loading a folder with 100+ font files. UI freezes for 30+ seconds during font metadata extraction.

**Priority:** Medium
**Found in:** [F8] Font Management
**Test Date:** 30 Jan 2026
**Browser:** Chrome 120

---

## Expected Behavior

When selecting fonts folder:
1. Font loading should complete within 5 seconds for 100 fonts
2. UI should remain responsive during loading
3. Progress indicator should show loading state
4. User can cancel operation if needed

---

## Actual Behavior

When selecting folder with 120 fonts:
1. UI freezes for ~35 seconds
2. No progress indicator shown
3. Browser shows "Page Unresponsive" warning
4. Cannot interact with app during loading
5. Eventually completes and fonts appear

---

## Steps to Reproduce

1. Prepare folder with 100+ TTF/OTF font files
2. Start dev server and open app
3. Navigate to font management (Settings or Properties panel)
4. Click "Select Fonts Folder"
5. Choose folder with 100+ fonts
6. **BUG:** App freezes for 30+ seconds

**Expected:** Loading completes in <5 seconds with progress indicator

---

## Console Errors

```
[Violation] 'requestIdleCallback' handler took 34521ms
```

---

## Test Scenario Reference

See: [`docs/CLAUDE_CHROME_TESTING.md`](../docs/CLAUDE_CHROME_TESTING.md) - Scenario [F8]

---

## Environment

- **Browser:** Chrome 120
- **OS:** Windows 11
- **Test Folder:** 120 fonts, total 45MB
- **Build:** 30 Jan 00:15 CET

---

## Suggested Fix Areas

Check the following files:
- `src/services/fontManager.ts` - Font loading logic
- Consider using Web Workers for font metadata extraction (opentype.js)
- Add progress indicator during loading
- Implement lazy loading (load font metadata on-demand)
- Add abort/cancel button for long operations

---

## Impact

**Medium:** App works eventually, but poor UX with large font libraries. Not a blocker but frustrating for users with extensive font collections.

---

## Performance Metrics

| Fonts | Load Time | UI Responsive? |
|-------|-----------|----------------|
| 20    | 3s        | ✅ Yes         |
| 50    | 12s       | ⚠️ Laggy      |
| 100   | 35s       | ❌ Frozen      |

---

## Labels

`performance`, `font-management`, `priority-medium`, `ux`
```

---

## Issue Creation Process

When you submit test results, Claude will:

1. **Parse your results** - Extract failures from template
2. **Create individual issues** - One per failure
3. **Add proper formatting** - Markdown, code blocks, tables
4. **Include context** - Test scenario, environment, console errors
5. **Set labels** - Bug type, priority, affected area
6. **Link references** - Test documentation, architecture docs
7. **Suggest fix areas** - Point to likely files/components

You'll receive confirmation with links to all created issues.

---

## Quick Reference: Priority Levels

Claude assigns priority based on impact:

- **Critical:** Crashes, data loss, blocking features
- **High:** Core functionality broken, wrong behavior
- **Medium:** Performance issues, UX problems, non-critical bugs
- **Low:** Minor visual issues, edge cases, polish items

---

**Ready to test!** Run your scenarios, fill out the results template, and Claude will handle the rest.
