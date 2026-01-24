# Phase 8: Code Export - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate working JUCE WebView2 code bundle from canvas design. User exports a zip with 5 files (index.html, styles.css, components.js, bindings.js, bindings.cpp), drops into JUCE project, and it works without manual fixups. Also supports HTML preview mode with mock values for standalone testing.

</domain>

<decisions>
## Implementation Decisions

### Export Bundle Structure
- Export as single zip containing 5 files:
  - `index.html` — UI markup
  - `styles.css` — Element styling
  - `components.js` — UI component logic
  - `bindings.js` — window.JUCE.backend listeners per element
  - `bindings.cpp` — C++ snippets (not full classes)
- HTML preview mode: same structure but mock parameter values, no C++ file

### Naming Convention
- Element name "Gain Knob" becomes:
  - HTML/JS: `id="gain-knob"` (kebab-case)
  - C++: `gainKnobRelay` (camelCase)
- Consistent derivation from user-provided element names

### C++ Code Format
- Snippets organized by destination, not full classes
- Copy-paste ready blocks:
  1. **Header declarations** — `std::unique_ptr<juce::WebSliderRelay> gainKnobRelay;` for .h private section
  2. **Constructor initialization** — `gainKnobRelay = std::make_unique<juce::WebSliderRelay>(*webView, "gain-knob");`
  3. **Parameter ID comments** — `// gainKnobRelay → parameter "gain"` (uses paramId from property panel)
- If no parameter ID set on element, show TODO marker instead

### Relay Types by Element
- **Knobs, Sliders** → `WebSliderRelay` (bidirectional value binding)
- **Buttons** → `WebToggleButtonRelay` (different class for toggle state)
- **Meters** → Output binding pattern (processor sends values to webview)
- **Labels, Images** → Static HTML only, no binding needed

### bindings.js Structure
- `window.JUCE.backend` listeners per interactive element
- Organized by element type for clarity

</decisions>

<specifics>
## Specific Ideas

- Snippets should be immediately usable — user copies declaration block to .h, initialization block to constructor
- Parameter ID mapping appears as comment next to relay declaration
- Mock values in preview mode allow testing layout without JUCE

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-code-export*
*Context gathered: 2026-01-24*
