# Issues for v1.1 Milestone

Captured: 2026-01-24
Source: UAT feedback session

---

## Priority 1: UI/UX Bugs

### BUG-01: Knob - Remove rotation field
**Element:** Knob
**Issue:** Rotation field in properties is not useful for knobs
**Action:** Remove rotation from Knob property panel

---

### BUG-02: Slider - Combine V-Slider and H-Slider
**Elements:** V-Slider, H-Slider
**Issue:** These should not be separate element types. User can switch between vertical/horizontal in properties.
**Action:** Merge into single "Slider" element with orientation property

---

### BUG-03: Momentary Button - Can't click "Pressed" state
**Element:** Momentary Button
**Issue:** Unable to toggle/click the "Pressed" state in properties
**Action:** Fix pressed state toggle in property panel

---

### BUG-04: Toggle Button - Can't click "Pressed" state
**Element:** Toggle Button
**Issue:** Unable to toggle/click the "Pressed" state in properties
**Action:** Fix pressed state toggle in property panel

---

### BUG-05: Button - Combine Momentary and Toggle Button
**Elements:** Momentary Button, Toggle Button
**Issue:** These should not be separate element types. User can change to momentary/toggle in properties.
**Action:** Merge into single "Button" element with behavior property (momentary/toggle)

---

### BUG-06: Meter - Can't switch back to Vertical
**Element:** Meter
**Issue:** After changing from Vertical to Horizontal, cannot switch back to Vertical
**Action:** Fix orientation toggle to work in both directions

---

### BUG-07: Meter - Remove rotation field
**Element:** Meter
**Issue:** Same as Knob - rotation field not useful
**Action:** Remove rotation from Meter property panel

---

### BUG-08: Value Display - Font Weight shows numbers
**Element:** Value Display (and possibly others)
**Issue:** Font Weight property shows numeric values instead of named options (bold, regular, etc.)
**Action:** Replace numeric input with dropdown of available font weights for selected font

---

### BUG-09: Image - Can't select from project
**Element:** Image
**Issue:** Image Source should allow:
1. Selecting images from project/repository file browser
2. Typing relative path to location inside project
**Action:** Add file picker or path input that resolves project-relative paths

---

## Priority 2: Template Import Workflow

### FEAT-01: Template import produces wrong elements
**Issue:** Importing existing WebView2 projects shows all elements as knobs in upper-left corner. The importer doesn't correctly parse non-standard WebView2 implementations.

**Root cause:** Import assumes specific HTML structure/class naming. Real-world WebView2 projects use completely different structures.

**Proposed solutions:**
1. **Option A - Smart parsing:** Try to detect element sizes, positions, and approximate types from arbitrary HTML/CSS
2. **Option B - Canvas replication:** Parse the overall dimensions and create a blank canvas at the same size, let user manually recreate elements
3. **Option C - Guided import:** Show detected HTML elements and let user manually map them to our element types

**User note:** "maybe it doesnt make sense to try to import other Webview2 files because they are made completly different. maybe just parse them. get the same size and replicate something similar with position etc."

---

### FEAT-02: New template workflow
**Issue:** Need a workflow for users starting fresh with VST3 effect/instrument projects.

**Requirements:**
- User has "empty VST3 containers" (basic effect/instrument templates)
- Need way to start a new UI design for these containers
- Should match container dimensions and provide appropriate starting elements

**Proposed workflow:**
1. "New Project" wizard asks: Effect or Instrument?
2. Offers preset canvas sizes for common plugin dimensions
3. Optionally pre-populates with typical elements (gain knob for effect, keyboard for instrument, etc.)

---

### FEAT-03: Convert existing VST3 UI designs
**Issue:** Users have existing WebView2 UI code they want to migrate to this system.

**User note:** "find a way so they can convert their already existing vst3 ui html/js/css design to our system (if possible)"

**Proposed approach:**
1. Best-effort import that extracts what it can
2. Side-by-side view: original HTML preview + our canvas
3. Manual element placement guided by original preview
4. Export generates new clean code compatible with our system

---

## Priority 3: Element Consolidation

### REFACTOR-01: Consolidate element types
**Issue:** Too many separate element types that are really just property variations.

**Current state:**
- V-Slider + H-Slider (should be 1 Slider with orientation prop)
- Momentary Button + Toggle Button (should be 1 Button with behavior prop)

**Proposed element palette:**
- Knob
- Slider (orientation: vertical/horizontal)
- Button (behavior: momentary/toggle)
- Meter (orientation: vertical/horizontal)
- Label
- Image
- (Value Display - see below)

---

### REFACTOR-02: Rethink Value Display
**Issue:** User questions why Value Display is a separate element.

**User feedback:**
- All elements that can have a value should come with a label and value display built-in
- Otherwise, Value Display should be a text field:
  - Static: user-defined text
  - Dynamic: filled by VST3 engine at runtime (parameter name, value, status, etc.)

**Options:**
1. Add optional value label to Knob, Slider, Meter
2. Convert Value Display to generic "Text Field" with static/dynamic modes
3. Keep both - built-in labels + standalone dynamic text

---

## Notes

- User will provide example code from existing WebView2 project for analysis
- Focus on making the tool work well for new projects first
- Import/conversion is "nice to have" but shouldn't block core functionality

---

*Last updated: 2026-01-24*
