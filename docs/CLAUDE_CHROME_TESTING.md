# Claude Chrome Extension Testing Guide

**Purpose:** Automated/assisted testing scenarios for the VST3 WebView UI Designer using Claude Chrome Extension.

**Last Updated:** 30 Jan 2026

---

## Important: Known Limitations

Before testing, understand what the Chrome extension **cannot do**:

| Limitation | Reason | Workaround |
|------------|--------|------------|
| **Drag-and-drop elements** | Browser extensions can't reliably simulate drag operations | Use Test Template (pre-loaded elements) |
| **File dialogs (Save/Load)** | Native OS dialogs blocked for security | Mark as "Not Testable" |
| **Font folder selection** | Native OS folder picker | Mark as "Not Testable" |
| **Leave browser tab** | Extension needs active tab to interact | Stay on browser during testing |

### What IS Testable
- Property panel changes (X, Y, Width, Height, colors, labels)
- Layer operations (visibility, lock, reorder)
- Window creation and switching
- Export preview (opens in new tab)
- Undo/Redo operations
- Copy/Paste operations
- Help system (F1)
- Template loading from dropdown

---

## Setup Instructions

1. Start the development server: `npm run dev`
2. Open Chrome and navigate to `http://localhost:5173`
3. Launch Claude Chrome Extension
4. **Load the Test Template** (recommended):
   - In right sidebar, find "Templates" dropdown
   - Select **"Test Template"** - contains 45+ pre-placed elements
   - OR load via File > Load Project: `UI_SPECS_PLUGINS/TEST_TEMPLATE.json`
5. Reference this document for test scenarios
6. **Stay on the browser tab** - don't minimize or switch away

---

## Test Template Contents

The **Test Template** is available in the Templates dropdown and contains:

| Section | Elements Included |
|---------|-------------------|
| **Controls** | Knob, Sliders (V/H), Buttons, Dropdown, Checkbox, RadioGroup |
| **Meters & Displays** | Meter, dB Display, Freq Display, LEDs (single, array), Waveform |
| **Decorative** | Label, Rectangle, Lines (H/V) |
| **Containers** | Panel, Frame, GroupBox |
| **Visualizations** | Spectrum Analyzer, Goniometer, Oscilloscope |
| **Z-Order Test** | 3 overlapping colored rectangles (red/blue/green) for [R2] |
| **Switches** | Toggle Switch, Power Button, Segment Button |
| **Advanced Controls** | Stepped Knob, Bipolar Slider, MultiSlider, Range Slider |
| **Navigation** | TabBar, Breadcrumb, ComboBox, Stepper |

**Full project file** with multiple windows: `UI_SPECS_PLUGINS/TEST_TEMPLATE.json`

---

## Reporting Results to Claude

After running tests, copy the template below, fill it out, and paste it back to Claude Code. Claude will automatically create GitHub issues for any failures.

### Results Template (Copy This)

```
TEST RUN: [Date - e.g., 30 Jan 2026]
BROWSER: [Chrome / Edge / Firefox]
TESTER: Claude Chrome Extension

=== TOKEN USAGE ===
Start tokens: [Check Claude extension before starting]
End tokens: [Check Claude extension after completing]
Total tokens used: [End - Start]
Estimated cost: $[Calculate based on model pricing]
Model used: [claude-3-sonnet / claude-3-opus / etc.]

=== PASSED ===
[List scenario IDs that passed]
- [S1] Basic Element Creation and Export
- [F1] Property Panel Updates

=== FAILED ===

[Scenario ID] - [Short description of failure]
Expected: [What should happen]
Actual: [What actually happened]
Steps to reproduce: [If different from test plan]
Console errors: [Any errors, or "None"]
Screenshot: [Describe or attach]
---

[Repeat for each failure]

=== NOTES ===
[Any additional observations, performance issues, browser-specific behaviors]
```

### Example Filled Out

```
TEST RUN: 30 Jan 2026
BROWSER: Chrome 120
TESTER: Claude Chrome Extension

=== TOKEN USAGE ===
Start tokens: 0
End tokens: 45,230
Total tokens used: 45,230
Estimated cost: $0.68
Model used: claude-3-sonnet

=== PASSED ===
- [S1] Basic Element Creation and Export
- [F1] Property Panel Updates
- [F3] Undo/Redo Chain
- [F4] Copy/Paste with Offset

=== FAILED ===

[F2] - Layer visibility toggle doesn't hide element
Expected: Clicking eye icon should hide element from canvas completely
Actual: Element remains visible but appears grayed out/semi-transparent
Steps to reproduce: Follow test plan steps exactly
Console errors: None
Screenshot: Element still visible after eye icon clicked
---

[X3] - JavaScript bridge uses Math.random instead of integers
Expected: Sequential integer IDs (++currentResultId)
Actual: Found Math.random() in juce-bridge.js line 47
Steps to reproduce: Export any project, check juce-bridge.js
Console errors: None
Screenshot: Code shows: const resultId = Math.random() * 10000
---

[E3] - Group Box container editor doesn't open
Expected: "Edit Contents" button opens container editor
Actual: Button click does nothing, no breadcrumb appears
Steps to reproduce: Create Group Box > Click "Edit Contents" button
Console errors: TypeError: Cannot read property 'id' of undefined at containerEditor.tsx:89
Screenshot: Button present but non-functional
---

=== NOTES ===
- Overall performance good, no lag with 50+ elements
- Help system (F1) works perfectly
- Font loading took ~3 seconds for 20 fonts but no issues
```

### What This Gets You

Claude will create **individual GitHub issues** for each failure with:
- ✅ Proper title and description
- ✅ Steps to reproduce
- ✅ Expected vs actual behavior
- ✅ Appropriate labels (bug, testing, priority)
- ✅ Reference to test scenario
- ✅ Console errors included
- ✅ Link back to test documentation

### Quick Pass/Fail Only (Minimal Format)

If you're doing a quick run and just want to flag failures:

```
QUICK TEST: 30 Jan 2026

PASS: S1, S2, S3, F1, F3, F4, F5, F7, F8, X1, X2, X4, X5, R1, R2, R3
FAIL: F2, F6, X3, E3

Notes: 4 failures, all reproducible
```

Claude will ask for details on the failures before creating issues.

---

## Test Scenario Index

### Priority 1: Smoke Tests (Critical Workflows)
- [S1] Basic Element Creation and Export
- [S2] Save and Load Project
- [S3] Multi-Window Creation and Export

### Priority 2: Element Coverage
- [E1] All Control Elements Render
- [E2] All Decorative Elements Render
- [E3] All Container Elements Function
- [E4] All Visualization Elements Display

### Priority 3: Feature Testing
- [F1] Property Panel Updates
- [F2] Layers System Operations
- [F3] Undo/Redo Chain
- [F4] Copy/Paste with Offset
- [F5] Help System (F1 Key)
- [F6] Container Editor
- [F7] SVG Asset Import
- [F8] Font Management

### Priority 4: Export Validation
- [X1] HTML Export Structure
- [X2] CSS Export Completeness
- [X3] JavaScript Bridge Code
- [X4] Multi-Window Export
- [X5] Asset Embedding

### Priority 5: Regression Tests
- [R1] Container Multi-Select Drag (v1.9 fix)
- [R2] Layer Reordering Updates Z-Index
- [R3] Window Type Toggle Persistence

---

## Priority 1: Smoke Tests

### [S1] Basic Element Creation and Export

**Objective:** Verify core workflow works end-to-end

**Note:** Element placement via drag-and-drop is OUT OF SCOPE for Chrome extension testing. Use template loading instead.

**Steps:**
1. Confirm app loads with three-panel layout (Palette left, Canvas center, Properties right)
2. **Load Test Template:** In right sidebar, select "Test Template" from Templates dropdown
3. Verify elements appear on canvas (knobs, sliders, meters, etc.)
4. Select the "Test Knob" element on canvas
5. In Properties panel (right), change:
   - X: 50 → verify knob moves horizontally
   - Y: 50 → verify knob moves vertically
   - Width: 100 → verify knob resizes
   - Label: "Cutoff" → verify label updates
6. Click "Preview" button in Export panel (right sidebar)
7. Verify preview opens in new tab showing all elements
8. Close preview tab
9. Verify Export panel shows:
   - "Export JUCE Bundle (as ZIP)" button
   - "Preview in Browser" button
   - "Export HTML Only" button

**Expected Results:**
- Template loads with all elements visible
- Property changes immediately reflect on canvas
- Preview opens in new tab
- Export options are accessible

**Pass/Fail:** ___________

**Note:** Actual file download cannot be tested (requires file dialog).

---

### [S2] Save and Load Project

**Objective:** Project persistence works correctly

**Steps:**
1. Create a simple project (add 2-3 elements: knob, slider, label)
2. Position elements at different locations
3. Set custom properties (labels, colors, sizes)
4. Click "Save" or File menu → Save
5. *Note: File picker will open - cannot automate. Save manually as "test-project.json"*
6. Refresh the page (Ctrl+R)
7. Verify canvas is empty (fresh start)
8. Click "Load" or File menu → Load
9. *Note: File picker will open - select "test-project.json" manually*
10. Verify all elements restore:
    - Same positions
    - Same sizes
    - Same property values
11. Select each element and check Properties panel matches

**Expected Results:**
- Project saves without errors
- After reload, project restores identically
- No data loss in round-trip

**Pass/Fail:** ___________

**Manual Steps Required:** File system dialog interaction (save/load)

---

### [S3] Multi-Window Creation and Export

**Objective:** Multi-window system works end-to-end

**Steps:**
1. Start with default "Main" window
2. Add a knob to Main window
3. Find window tabs at top of canvas (look for "Main" tab)
4. Click "+ New Window" button (or similar control)
5. Name new window "Settings"
6. Switch to Settings window (click its tab)
7. Verify canvas is empty
8. Add a slider to Settings window
9. Switch back to Main window tab
10. Verify knob is still there (slider not visible)
11. Click Export
12. Check "Include developer windows" option if present
13. Export as JUCE Bundle
14. *Download and extract manually*
15. Verify folder structure:
    - `Main/` folder with HTML/CSS/JS
    - `Settings/` folder with HTML/CSS/JS
    - Both have correct elements

**Expected Results:**
- Windows maintain independent element lists
- Tab switching preserves viewport state
- Export creates separate folders per window

**Pass/Fail:** ___________

---

## Priority 2: Element Coverage

### [E1] All Control Elements Render

**Objective:** Verify all 102+ element types can be created

**Approach:** Systematic sweep through palette categories

**Steps for Each Element Type:**
1. Expand palette category
2. Click element type
3. Place on canvas
4. Verify it renders (no errors, visible graphics)
5. Select it - Properties panel should show element-specific options
6. Delete element (press Delete key)
7. Move to next element type

**Control Elements to Test:**
- Basic Controls:
  - [ ] Knob
  - [ ] Slider (Vertical)
  - [ ] Slider (Horizontal)
  - [ ] Button
  - [ ] Toggle Button
  - [ ] Icon Button
- Advanced Controls:
  - [ ] Stepped Knob
  - [ ] Center-Detented Knob
  - [ ] Dot Indicator Knob
  - [ ] Bipolar Slider
  - [ ] Crossfade Slider
  - [ ] Notched Slider
  - [ ] Arc Slider
  - [ ] Multi-Slider
  - [ ] Range Slider
- Switches:
  - [ ] Toggle Switch
  - [ ] Rocker Switch
  - [ ] Rotary Switch
  - [ ] Power Button
  - [ ] Kick Button
  - [ ] Segment Button
- Meters:
  - [ ] Level Meter
  - [ ] VU Meter
  - [ ] PPM Meter Type I
  - [ ] PPM Meter Type II
  - [ ] RMS Meter
  - [ ] True Peak Meter
  - [ ] LUFS Meter (Momentary)
  - [ ] LUFS Meter (Short-term)
  - [ ] LUFS Meter (Integrated)
  - [ ] K-12 Meter
  - [ ] K-14 Meter
  - [ ] K-20 Meter
  - [ ] Gain Reduction Meter
  - [ ] Correlation Meter
  - [ ] Stereo Width Meter

**Expected Results:**
- All elements create without errors
- Each has appropriate default appearance
- Properties panel shows type-specific options

**Pass/Fail:** ___________

**Note:** Full list has 102+ types. Test representative samples from each category, or create script to iterate all.

---

### [E2] All Decorative Elements Render

**Decorative Elements to Test:**
- [ ] Label (Text)
- [ ] Rectangle
- [ ] Line (Horizontal)
- [ ] Line (Vertical)
- [ ] SVG Graphic (requires asset import)
- [ ] Image (requires file upload)
- [ ] ASCII Art

**Steps:** Same as [E1] - create, verify render, check properties, delete

**Pass/Fail:** ___________

---

### [E3] All Container Elements Function

**Container Elements to Test:**
- [ ] Panel
- [ ] Frame
- [ ] Group Box
- [ ] Collapsible Panel
- [ ] Tooltip
- [ ] Window Chrome

**Steps for Each Container:**
1. Create container on canvas
2. Verify it renders with correct default size
3. Click "Edit Contents" button (should appear in toolbar or properties)
4. Verify container editor opens (breadcrumb shows container name)
5. Add a child element inside container (e.g., label)
6. Click breadcrumb to exit container editor
7. Verify container shows child element
8. Select container - Properties should show scroll style options
9. Delete container

**Expected Results:**
- Container editor opens without errors
- Child elements appear inside container boundary
- Breadcrumb navigation works
- Scrollbar styles appear in properties

**Pass/Fail:** ___________

---

### [E4] All Visualization Elements Display

**Visualization Elements to Test:**
- [ ] Waveform Display
- [ ] Oscilloscope
- [ ] Spectrum Analyzer
- [ ] Spectrogram
- [ ] Vectorscope
- [ ] Goniometer
- [ ] EQ Curve
- [ ] Compressor Curve
- [ ] Filter Response Curve
- [ ] Envelope Display
- [ ] LFO Display
- [ ] Piano Keyboard
- [ ] Drum Pad Grid
- [ ] Step Sequencer
- [ ] XY Pad
- [ ] Wavetable Display

**Steps:** Same as [E1] - create, verify placeholder/visual renders, check properties

**Note:** These may show placeholder graphics since they need live audio data

**Pass/Fail:** ___________

---

## Priority 3: Feature Testing

### [F1] Property Panel Updates

**Objective:** Property changes immediately reflect on canvas

**Steps:**
1. Add a knob to canvas
2. Select knob
3. In Properties panel, change each property and verify canvas updates:
   - **Position X:** Change to 100 → knob moves horizontally
   - **Position Y:** Change to 100 → knob moves vertically
   - **Width:** Change to 120 → knob widens
   - **Height:** Change to 120 → knob heightens
   - **Label:** Change to "Cutoff" → label text updates
   - **Font Size:** Change to 16 → label text resizes
   - **Color:** Change color → knob/label color updates
   - **Rotation:** Change to 45 → element rotates (if supported)
4. Test with different element types:
   - Slider (vertical/horizontal orientation)
   - Button (label, icon)
   - Label (font family, alignment)
   - Container (scroll style)

**Expected Results:**
- Every property change immediately updates canvas
- No need to refresh or re-select element
- Changes persist when deselecting/reselecting

**Pass/Fail:** ___________

---

### [F2] Layers System Operations

**Objective:** Layers panel controls visibility, locking, and z-order

**Setup:**
1. Add 4 elements to canvas: knob, slider, label, rectangle
2. Position them overlapping partially
3. Open Layers panel (should be visible by default, or in sidebar)

**Test Visibility:**
1. Find layers list showing all 4 elements
2. Click eye icon next to "knob" layer
3. Verify knob disappears from canvas
4. Click eye icon again
5. Verify knob reappears

**Test Locking:**
1. Click lock icon next to "slider" layer
2. Try to drag slider on canvas
3. Verify slider cannot move (locked)
4. Try to resize slider
5. Verify slider cannot resize
6. Click lock icon again to unlock
7. Verify slider can now move/resize

**Test Z-Order (Reordering):**
1. Note current stacking order (which elements are on top)
2. In layers list, drag "rectangle" layer to top
3. Verify rectangle now appears above other elements on canvas
4. Drag "label" layer to bottom
5. Verify label now appears below other elements

**Test Layer Assignment:**
1. Right-click "knob" on canvas
2. Select "Move to Layer" from context menu
3. Create new layer called "Controls"
4. Verify knob moves to "Controls" layer in Layers panel
5. Add color to "Controls" layer (if supported)
6. Verify visual indication in layers list

**Expected Results:**
- Eye icon toggles visibility (hidden elements not selectable)
- Lock icon prevents move/resize
- Drag-reorder changes z-index on canvas immediately
- Layer assignment works via context menu

**Pass/Fail:** ___________

---

### [F3] Undo/Redo Chain

**Objective:** Undo/Redo works for all operations

**Steps:**
1. Start with empty canvas
2. Perform actions and verify undo/redo after each:
   - **Action 1:** Add knob → **Undo** → knob disappears
   - **Redo** → knob reappears
   - **Action 2:** Move knob to (100, 100) → **Undo** → knob returns to previous position
   - **Redo** → knob moves to (100, 100) again
   - **Action 3:** Resize knob to 120x120 → **Undo** → knob returns to previous size
   - **Action 4:** Change knob label to "Gain" → **Undo** → label reverts
   - **Action 5:** Delete knob → **Undo** → knob restores
3. Open Undo/Redo History Panel (if available)
4. Verify history shows all 5 actions listed
5. Click on "Action 2" in history (time-travel)
6. Verify canvas state jumps to that point
7. Perform new action from middle of history
8. Verify history branches correctly (future actions pruned)

**Expected Results:**
- Undo/redo buttons work (Ctrl+Z / Ctrl+Shift+Z)
- History panel shows action descriptions
- Time-travel navigation works
- 50+ action history supported

**Pass/Fail:** ___________

---

### [F4] Copy/Paste with Offset

**Objective:** Copy/paste creates duplicate with 20px offset

**Steps:**
1. Add a knob at position (100, 100)
2. Select knob
3. Press Ctrl+C (copy)
4. Press Ctrl+V (paste)
5. Verify new knob appears at (120, 120) - 20px offset
6. Press Ctrl+V again
7. Verify third knob appears at (140, 140)
8. Select all three knobs (Shift+Click or drag box)
9. Press Ctrl+C
10. Press Ctrl+V
11. Verify all three knobs duplicate with 20px offset

**Expected Results:**
- Each paste adds 20px to X and Y
- Multi-selection copy/paste works
- Pasted elements are automatically selected

**Pass/Fail:** ___________

---

### [F5] Help System (F1 Key)

**Objective:** Contextual help works correctly

**Steps:**
1. Add a knob to canvas
2. Select knob
3. Press F1 key
4. Verify help popup window opens
5. Verify popup shows:
   - Element type name ("Knob")
   - Description of what it's used for
   - List of configurable properties
   - Usage tips
6. Close help popup
7. Deselect all elements (click empty canvas)
8. Press F1 key again
9. Verify general help opens (not element-specific)
10. Test with different element types:
    - Slider → F1 → slider help
    - Meter → F1 → meter help
    - Container → F1 → container help
11. Click help icon (?) next to Properties panel section
12. Verify section-specific help opens

**Expected Results:**
- F1 shows contextual help based on selection
- Help popup uses dark theme (matches UI)
- Help content is comprehensive (all 102 types documented)
- Help icon buttons work on Properties panel

**Pass/Fail:** ___________

---

### [F6] Container Editor

**Objective:** Container editing works correctly

**Steps:**
1. Add a Panel container to canvas (200x200)
2. Select panel
3. Click "Edit Contents" button (toolbar or properties)
4. Verify:
   - Breadcrumb shows "Main > Panel"
   - Canvas now shows panel interior (isolated view)
   - Palette still accessible
5. Add 3 elements inside panel: knob, slider, label
6. Position them within panel bounds
7. Multi-select all 3 elements (Shift+Click)
8. Drag selection - verify all 3 move together (v1.9 fix)
9. Click "Main" in breadcrumb
10. Verify:
    - Back to main canvas view
    - Panel container shows 3 child elements inside
11. Move panel container on main canvas
12. Re-enter container editor
13. Verify child elements maintain relative positions

**Test Nested Containers:**
1. While in panel editor, add a Group Box
2. Enter Group Box editor (breadcrumb: "Main > Panel > Group Box")
3. Add label inside Group Box
4. Navigate back via breadcrumb
5. Verify nesting works correctly

**Expected Results:**
- Container editor provides isolated editing space
- Multi-select drag works (regression test)
- Nested containers supported (container-in-container)
- Breadcrumb navigation works bidirectionally

**Pass/Fail:** ___________

---

### [F7] SVG Asset Import

**Objective:** SVG import and usage works

**Manual Preparation:**
Prepare test SVG file with named layers:
- `knob_indicator` (line/path pointing upward)
- `knob_body` (circle)

**Steps:**
1. Find "Assets" panel (likely in left sidebar)
2. Click "Import SVG" or "+ Add Asset"
3. *Manual: Select test SVG file*
4. Verify SVG appears in asset library
5. Verify thumbnail preview shows
6. Click SVG asset, then click canvas to place
7. Verify SVG Graphic element appears on canvas
8. Select SVG element
9. In Properties, verify "Layer Assignment" section shows:
   - `knob_indicator`
   - `knob_body`
10. Change color override for `knob_body` layer
11. Verify color changes on canvas
12. Test aspect ratio locking:
    - Resize width → height auto-adjusts
    - Resize height → width auto-adjusts

**Expected Results:**
- SVG imports without errors (sanitization passes)
- Layer names auto-detected
- Color overrides work per layer
- Aspect ratio locks by default

**Pass/Fail:** ___________

**Manual Steps Required:** File picker for SVG upload

---

### [F8] Font Management

**Objective:** Custom font loading and usage

**Manual Preparation:**
Have a folder with TTF/OTF font files ready

**Steps:**
1. Find font management UI (Settings menu or Properties panel)
2. Click "Select Fonts Folder"
3. *Manual: Choose folder with font files*
4. Verify fonts load and appear in font dropdown
5. Verify font names shown in their own typeface (preview)
6. Add a Label element to canvas
7. In Properties, open Font Family dropdown
8. Verify custom fonts listed alongside built-in (Inter, Roboto, Roboto Mono)
9. Select custom font
10. Verify label text updates to use custom font
11. Export project as JUCE Bundle
12. *Manual: Extract and check HTML/CSS*
13. Verify custom font embedded as base64 in CSS
14. Verify built-in fonts use file references (not embedded)

**Size Warnings:**
1. Import folder with large font (>500KB)
2. Verify warning message appears
3. Import multiple fonts totaling >2MB
4. Verify total size warning appears

**Expected Results:**
- Fonts load from user-selected folder
- Font preview shows actual typeface
- Export embeds custom fonts, references built-in fonts
- Size warnings prevent bloated exports

**Pass/Fail:** ___________

**Manual Steps Required:** Folder selection, file extraction

---

## Priority 4: Export Validation

### [X1] HTML Export Structure

**Objective:** Verify exported HTML is well-formed and complete

**Setup:**
1. Create project with 5 different element types
2. Export as JUCE Bundle
3. *Manual: Extract ZIP and examine files*

**Validation Checklist:**
- [ ] `index.html` exists
- [ ] `<!DOCTYPE html>` declaration present
- [ ] `<html>`, `<head>`, `<body>` tags present
- [ ] `<link rel="stylesheet" href="styles.css">` present
- [ ] `<script src="juce-bridge.js"></script>` present
- [ ] All 5 elements have corresponding `<div>` elements with correct IDs
- [ ] Element attributes match properties (position, size, etc.)
- [ ] SVG elements properly embedded (if used)

**Open in Browser:**
1. Open `index.html` in Chrome
2. Verify all elements render visually
3. Open DevTools Console
4. Verify no errors (JUCE bridge errors expected, but no syntax errors)

**Expected Results:**
- Valid HTML5 structure
- All elements present with correct IDs/classes
- Renders identically to designer canvas

**Pass/Fail:** ___________

**Manual Steps Required:** File extraction, HTML inspection

---

### [X2] CSS Export Completeness

**Objective:** Verify CSS includes all styles and fonts

**Files to Check:**
- `styles.css`

**Validation Checklist:**
- [ ] Canvas background styles (color/gradient/image)
- [ ] Element positioning (absolute positioning with correct X/Y)
- [ ] Element sizing (width, height)
- [ ] Font-face declarations (custom fonts embedded as base64)
- [ ] Font-family references for built-in fonts
- [ ] Color values match designer
- [ ] Z-index values match layer order
- [ ] Container overflow/scrollbar styles
- [ ] Responsive scaling classes (if applicable)
- [ ] No broken references (all assets embedded or referenced correctly)

**Test Responsiveness:**
1. Open exported HTML in browser
2. Resize browser window
3. Verify elements scale proportionally (if responsive CSS enabled)

**Expected Results:**
- Complete CSS coverage for all elements
- Custom fonts embedded (base64)
- Built-in fonts referenced (file paths)
- No missing styles

**Pass/Fail:** ___________

---

### [X3] JavaScript Bridge Code

**Objective:** JUCE bridge code is correct

**Files to Check:**
- `juce-bridge.js`

**Validation Checklist:**
- [ ] Dynamic function wrapper system present
- [ ] Integer result IDs used (not Math.random)
- [ ] Polling initialization code (5-second timeout)
- [ ] Error suppression for smooth UI
- [ ] Event listeners for all interactive elements
- [ ] Parameter change handlers call JUCE functions
- [ ] `window.juce` availability check
- [ ] Promise-based wrapper pattern

**Code Snippet to Look For:**
```javascript
// Dynamic function wrapper
function createJuceFunction(functionName) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      const resultId = ++currentResultId; // Integer, not random
      // ... polling logic
    });
  };
}
```

**Expected Results:**
- Matches documented pattern in PROJECT.md (JUCE Event-Based Pattern)
- Integer result IDs (sequential)
- 5-second polling timeout
- Fire-and-forget with error handling

**Pass/Fail:** ___________

---

### [X4] Multi-Window Export

**Objective:** Multi-window projects export correctly

**Setup:**
1. Create project with 3 windows:
   - "Main" (release type) - add knob
   - "Settings" (release type) - add slider
   - "Debug" (developer type) - add label
2. Export with "Include developer windows" checked
3. *Manual: Extract ZIP*

**Validation Checklist:**
- [ ] Root folder contains 3 subfolders: `Main/`, `Settings/`, `Debug/`
- [ ] Each folder has `index.html`, `styles.css`, `juce-bridge.js`
- [ ] `Main/index.html` contains knob
- [ ] `Settings/index.html` contains slider
- [ ] `Debug/index.html` contains label
- [ ] Navigation buttons work (if present) - link to other windows
- [ ] Each window can open independently in browser

**Export without Developer Windows:**
1. Export again with "Include developer windows" unchecked
2. Verify only `Main/` and `Settings/` folders present (no `Debug/`)

**Expected Results:**
- Separate folders per window
- Independent HTML/CSS/JS per window
- Developer windows excluded when unchecked

**Pass/Fail:** ___________

---

### [X5] Asset Embedding

**Objective:** SVG/Image assets embedded correctly

**Setup:**
1. Import custom SVG asset
2. Import image asset (PNG/JPG)
3. Use both in design
4. Export as JUCE Bundle

**Validation Checklist:**
- [ ] SVG code embedded inline in HTML (within `<svg>` tags)
- [ ] SVG sanitized (no `<script>`, no event handlers)
- [ ] SVGO optimization applied (if enabled)
- [ ] Image embedded as base64 data URI in HTML/CSS
- [ ] Image `src="data:image/png;base64,..."` format
- [ ] Layer naming preserved (if SVG has named layers)
- [ ] No external file references (fully self-contained bundle)

**Expected Results:**
- Assets embedded, not linked externally
- SVG sanitization applied (XSS protection)
- Optimization reduces file size (if SVGO enabled)

**Pass/Fail:** ___________

---

## Priority 5: Regression Tests

### [R1] Container Multi-Select Drag (v1.9 Fix)

**Objective:** Verify multi-select drag fix in container editor

**Bug History:** Before v1.9, dragging multiple selected elements inside a container would only move one element.

**Steps:**
1. Create Panel container
2. Enter container editor
3. Add 4 elements inside: knob, slider, button, label
4. Select all 4 elements (Shift+Click or drag-select box)
5. Drag selection 50px to the right
6. Verify ALL 4 elements move together (not just one)
7. Check each element's new position in Properties panel
8. Verify relative positions maintained (spacing preserved)

**Expected Results:**
- Multi-select drag moves all selected elements
- Relative positions preserved
- No elements left behind

**Pass/Fail:** ___________

**Regression of:** Container editor multi-select drag (fixed in v1.9)

---

### [R2] Layer Reordering Updates Z-Index

**Objective:** Layer drag-reorder immediately updates canvas z-order

**Steps:**
1. Add 3 overlapping rectangles:
   - Red rectangle at (50, 50, 100x100)
   - Blue rectangle at (75, 75, 100x100)
   - Green rectangle at (100, 100, 100x100)
2. Initial order: Red on bottom, Blue middle, Green on top
3. Open Layers panel
4. Drag "Red" layer to top of list
5. Verify red rectangle now renders on top of blue and green on canvas
6. Drag "Green" layer to bottom of list
7. Verify green rectangle now renders below blue and red
8. Export and check CSS
9. Verify z-index values in CSS match layer order

**Expected Results:**
- Drag-reorder in layers panel immediately updates canvas rendering
- Z-index export reflects layer order

**Pass/Fail:** ___________

---

### [R3] Window Type Toggle Persistence

**Objective:** Window type (release/developer) persists correctly

**Steps:**
1. Create new window "Debug"
2. Set type to "Developer"
3. Add elements to Debug window
4. Save project
5. Reload page and load project
6. Verify "Debug" window still has type "Developer"
7. Toggle "Debug" window type to "Release"
8. Save project again
9. Reload and load
10. Verify "Debug" window now has type "Release"

**Expected Results:**
- Window type persists in project JSON
- Type toggle survives save/load cycle

**Pass/Fail:** ___________

---

## Automation Tips for Claude Chrome Extension

### General Approach
1. **Be Explicit:** Provide exact button text, positions, selectors
2. **Wait for Renders:** Allow time for animations/state updates
3. **Verify Visually:** Take screenshots before/after actions
4. **Check Console:** Monitor DevTools console for errors
5. **Iterate Categories:** Test element types in batches (controls, then decorative, etc.)

### Handling File Dialogs
- **Cannot automate:** File pickers require manual interaction
- **Workaround:** Pre-load test projects via localStorage/IndexedDB injection (advanced)
- **Best practice:** Note when manual intervention needed, pause testing

### Using Test Template (Recommended)

Drag-and-drop automation is unreliable in browser extensions. Use the pre-built test template instead:

**Option 1: Templates Dropdown (Easiest)**
1. In right sidebar, find "Templates" dropdown
2. Select **"Test Template"**
3. Canvas loads with 45+ pre-placed elements

**Option 2: Load Project File**
1. Location: `UI_SPECS_PLUGINS/TEST_TEMPLATE.json`
2. File > Load Project (requires manual file picker)

**Test Template Contents:**
- One of each major element type (45+ elements)
- Organized by category headers (Controls, Meters, Decorative, etc.)
- Overlapping rectangles for z-order tests [R2]
- Ready for property editing, layer operations, export validation

**Benefits:**
- Faster test execution (no element placement)
- No drag-and-drop failures
- Consistent starting state for all test runs
- Covers all element categories in one load

### Screenshot Comparison
- Take baseline screenshots of:
  - Empty canvas
  - Canvas with each element type
  - Export preview
- Compare during regression tests to catch visual changes

### Reporting Results
- Create a checklist document
- Mark each scenario Pass/Fail
- Note any errors/warnings in console
- Capture screenshots of failures
- **Include token usage** for cost tracking

---

## First Test Run Learnings (30 Jan 2026)

### What Worked
- Template loading via "Effect Starter" worked perfectly
- Property panel updates reflected immediately on canvas
- Multi-window creation and switching worked
- Export preview opened in new tab
- No console errors during normal operation

### What Didn't Work
- **Element placement via double-click + click**: This workflow doesn't exist in the app - it's drag-and-drop only
- **File dialog automation**: As expected, blocked by browser security

### Key Insight
The Chrome extension saw "Draggable item palette-knob-standard was dropped" messages, which were incomplete/malformed drag events. This is NOT a bug - the app requires actual mouse drag operations which extensions cannot simulate.

### Recommendations
1. Always start by loading Test Template
2. Skip tests that require element creation from empty canvas
3. Focus testing on: property changes, layer ops, export, multi-window
4. Mark file dialog tests as "Not Testable - requires manual"

---

## Test Execution Log

### Test Run Template

**Date:** ___________
**Tester:** Claude Chrome Extension
**Version:** ___________
**Tokens Used:** ___________

| Scenario | Result | Notes |
|----------|--------|-------|
| [S1] Basic Element + Export | ⬜ Pass ⬜ Fail ⬜ N/A | Template loading |
| [S2] Save and Load | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file dialog |
| [S3] Multi-Window | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [E1] Control Elements | ⬜ Pass ⬜ Fail ⬜ N/A | Via Test Template |
| [E2] Decorative Elements | ⬜ Pass ⬜ Fail ⬜ N/A | Via Test Template |
| [E3] Container Elements | ⬜ Pass ⬜ Fail ⬜ N/A | Via Test Template |
| [E4] Visualization Elements | ⬜ Pass ⬜ Fail ⬜ N/A | Via Test Template |
| [F1] Property Updates | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [F2] Layers System | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [F3] Undo/Redo | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [F4] Copy/Paste | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [F5] Help System | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [F6] Container Editor | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [F7] SVG Import | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file dialog |
| [F8] Font Management | ⬜ Pass ⬜ Fail ⬜ N/A | Requires folder dialog |
| [X1] HTML Structure | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file extraction |
| [X2] CSS Completeness | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file extraction |
| [X3] JS Bridge Code | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file extraction |
| [X4] Multi-Window Export | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file extraction |
| [X5] Asset Embedding | ⬜ Pass ⬜ Fail ⬜ N/A | Requires file extraction |
| [R1] Container Multi-Select | ⬜ Pass ⬜ Fail ⬜ N/A | |
| [R2] Layer Reordering | ⬜ Pass ⬜ Fail ⬜ N/A | Use Z-Order Test elements |
| [R3] Window Type Persistence | ⬜ Pass ⬜ Fail ⬜ N/A | Requires save/load |

---

## Test History

### Run #1 - 30 Jan 2026
**Tester:** Claude Chrome Extension
**Focus:** Priority 1 Smoke Tests

| Scenario | Result | Notes |
|----------|--------|-------|
| [S1] Basic Element + Export | Partial | Template loading works, element placement doesn't (expected) |
| [S2] Save and Load | N/A | File dialog required |
| [S3] Multi-Window | Pass | Full pass - window creation, switching, naming all work |

**Key Findings:**
- Element drag-and-drop is NOT automatable (expected)
- Template loading is the correct workaround
- Property changes work perfectly
- Multi-window system works perfectly
- Export preview works

---

## Next Steps After Testing

1. **Document Failures:** Create GitHub issues for any failed scenarios
2. **Expand Coverage:** Add new scenarios as features are added
3. **Automate Further:** Consider Playwright for CI/CD integration
4. **Performance Testing:** Add scenarios for large projects (100+ elements)
5. **Cross-Browser:** Test in Firefox, Edge, Safari (WebKit differences)

---

**Maintained by:** VST3 WebView UI Designer Team
**Last Test Run:** ___________
**Overall Pass Rate:** _____ / 23 scenarios
