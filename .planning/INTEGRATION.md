# Cross-Project Integration Overview

**For GSD Framework Context**

This document explains how `vst3-webview-ui-designer` integrates with related VST3 template repositories. GSD should be aware of these relationships when working on features or fixing issues.

---

## Related Projects

### 1. EFXvst3 - Audio Effect VST3 Template
**Repository:** https://github.com/yourusername/EFXvst3  
**Purpose:** Template for creating JUCE VST3 audio effect plugins  
**Relationship:** **Consumer** of this designer's exported code

**Integration Points:**
- Uses designer-exported UI files in `EFXvst3/WebUI/` folder
- Consumes: `index.html`, `style.css`, `components.js`, `bindings.js`
- Parameter IDs in designer must match APVTS parameter IDs in C++
- Canvas size in designer must match `setSize()` in PluginEditor.cpp

**Current State:**
- Effect Starter template (`templates/effect-starter.json`) matches EFXvst3's UI
- EFXvst3 uses SVG knobs and meters from designer's element system
- WebView2 folder structure: `WebUI/` (not `ui/`)

**Designer Features Used:**
- Knob elements (arc style, -135° to 135°)
- Meter elements (vertical gradient)
- Label elements (plugin title, status, control labels)

### 2. INSTvst3 - Instrument VST3 Template
**Repository:** https://github.com/yourusername/INSTvst3  
**Purpose:** Template for creating JUCE VST3 instrument/synthesizer plugins  
**Relationship:** **Consumer** of this designer's exported code

**Integration Points:**
- Uses designer-exported UI files in `INSTvst3/ui/` folder
- Consumes: `index.html`, `style.css`, `components.js`, `bindings.js`
- Parameter IDs: `gain`, `envAttack`, `envDecay`, `envSustain`, `envRelease`
- Canvas size: 600x400px

**Current State:**
- Instrument Starter template (`templates/instrument-starter.json`) matches INSTvst3's UI
- INSTvst3 uses SVG arc knobs from designer's element system
- WebView2 folder structure: `ui/` (not `WebUI/`)

**Designer Features Used:**
- Knob elements (5 knobs for gain + ADSR envelope)
- Label elements (section headers, knob labels, status)

---

## JUCE WebView2 Communication Pattern

**CRITICAL:** JUCE native functions use an event-based invocation system.

### Event-Based Invocation

Native functions registered with `.withNativeFunction()` in C++ are NOT directly callable from JavaScript. They must be invoked via the `__juce__invoke` event system:

**JavaScript (CORRECT):**
```javascript
window.__JUCE__.backend.emitEvent('__juce__invoke', {
  name: 'setParameter',
  params: ['volume', 0.5],
  resultId: Math.random()
});
```

**JavaScript (WRONG - doesn't work):**
```javascript
window.setParameter('volume', 0.5);  // Will not work!
```

### Fire-and-Forget Pattern

For responsive UI (60fps knob dragging), use fire-and-forget:
- Don't await parameter updates
- Send value and immediately update visual
- C++ processes updates via MessageManager queue

This pattern is now standard in our bindings.js export.

### Standard Native Functions

All exports include these four functions:
1. **setParameter(paramId, value)** - Set parameter value (fire-and-forget)
2. **getParameter(paramId)** - Get parameter value (async with promise)
3. **beginGesture(paramId)** - Start automation gesture (for DAW recording)
4. **endGesture(paramId)** - End automation gesture

### C++ Registration Pattern

```cpp
webView = std::make_unique<juce::WebBrowserComponent>(
    juce::WebBrowserComponent::Options{}
        .withNativeIntegrationEnabled()
        .withNativeFunction("setParameter",
            [this](const juce::Array<juce::var>& args, auto complete) {
                auto paramId = args[0].toString();
                auto value = static_cast<float>(args[1]);
                if (auto* param = processorRef.apvts.getParameter(paramId)) {
                    param->setValueNotifyingHost(value);
                }
                complete(juce::var());
            })
        // ... other native functions ...
);
```

See exported bindings.cpp for complete implementation.

---

## Data Flow

### Design → Export → Integration

```
vst3-webview-ui-designer
    |
    | 1. User designs UI
    v
Template System (templates/*.json)
    |
    | 2. User exports
    v
Code Generator (src/services/export/)
    |
    | 3. Generates 5-file bundle
    v
Downloaded ZIP:
  - index.html      (element positioning, structure)
  - style.css       (SVG knob styles, colors, layout)
  - components.js   (SVG rendering logic)
  - bindings.js     (JUCE WebView2 parameter bindings)
  - bindings.cpp    (C++ code snippets for integration)
    |
    | 4. User extracts to VST3 project
    v
EFXvst3/WebUI/  OR  INSTvst3/ui/
    |
    | 5. User integrates bindings.cpp code
    v
PluginEditor.h/cpp (WebSliderRelay + Attachment)
    |
    | 6. User builds VST3
    v
Working VST3 plugin with custom UI
```

---

## Shared Element System

All three projects standardize on the same SVG-based UI element system:

### Element Types

| Type | Rendering | Export Format | VST3 Usage |
|------|-----------|---------------|------------|
| **Knob** | SVG arc + indicator line | `<div class="knob-element">` + SVG | WebSliderRelay |
| **Slider** | SVG track + thumb | `<div class="slider-element">` + SVG | WebSliderRelay |
| **Button** | HTML button + CSS | `<button class="button-element">` | WebToggleButtonRelay |
| **Label** | HTML span + CSS | `<span class="label-element">` | Static (no binding) |
| **Meter** | SVG gradient fill | `<div class="meter-element">` + SVG | Output binding |
| **Image** | HTML img | `<img class="image-element">` | Static (no binding) |

### Naming Conventions

**Designer → HTML → C++:**
- Designer element name: `"Gain Knob"`
- HTML ID: `gain-knob` (kebab-case, generated by `toKebabCase()`)
- C++ relay variable: `gainKnobRelay` (camelCase, generated by `toCamelCase()`)

**Parameter ID Matching:**
- Designer property: `parameterId: "gain"`
- C++ APVTS: `parameters.getParameter("gain")`
- JavaScript: `window.__JUCE__.backend.getSliderState("gain")`

---

## Template System

**Location:** `templates/` folder in designer repo

### Template Structure

```typescript
interface Template {
  version: string
  name: string
  description: string
  category: 'effect' | 'instrument' | 'utility'
  metadata: {
    canvasWidth: number
    canvasHeight: number
    backgroundColor: string
    created: string
    author: string
    recommendedVST3Repo?: string  // Links to EFXvst3 or INSTvst3
  }
  elements: ElementConfig[]  // Pre-configured UI elements
}
```

### Available Templates

1. **effect-starter.json**
   - Targets: EFXvst3
   - Canvas: 500x300px
   - Elements: Volume knob, output meter, labels
   - Parameter IDs: `volume`, `outputLevel`

2. **instrument-starter.json**
   - Targets: INSTvst3
   - Canvas: 600x400px
   - Elements: Gain knob, 4 ADSR knobs, labels
   - Parameter IDs: `gain`, `envAttack`, `envDecay`, `envSustain`, `envRelease`

### Template Loading Flow

```
User clicks "New Project" → "From Template"
    |
    v
NewProjectDialog.tsx shows available templates
    |
    v
User selects template and clicks "Create"
    |
    v
templateStore → useStore.loadFromTemplate(template)
    |
    v
Store updates:
  - elements = template.elements
  - canvasWidth = template.metadata.canvasWidth
  - canvasHeight = template.metadata.canvasHeight
  - backgroundColor = template.metadata.backgroundColor
    |
    v
Canvas populated with pre-configured elements
```

---

## Export System

**Location:** `src/services/export/` in designer repo

### Code Generators

| Generator | Output | Consumed By |
|-----------|--------|-------------|
| `htmlGenerator.ts` | `index.html` | VST3 WebView |
| `cssGenerator.ts` | `style.css` | VST3 WebView |
| `jsGenerator.ts` | `components.js`, `bindings.js` | VST3 WebView |
| `cppGenerator.ts` | `bindings.cpp` | VST3 PluginEditor |
| `documentationGenerator.ts` | `README.md` | User reference |

### JUCE WebView2 Communication

**JavaScript Side (bindings.js):**
```javascript
// Designer generates:
const gainState = window.__JUCE__.backend.getSliderState('gain');
gainState.valueChangedEvent.addListener(() => {
  const value = gainState.getNormalisedValue();
  updateKnobVisual('gain', value);
});
```

**C++ Side (bindings.cpp):**
```cpp
// Designer generates snippets for:
std::unique_ptr<juce::WebSliderRelay> gainRelay;
WebSliderParameterAttachment gainAttachment;

// Constructor:
gainRelay = std::make_unique<juce::WebSliderRelay>(*webView, "gain");
gainAttachment = std::make_unique<juce::WebSliderParameterAttachment>(
    *processorRef.parameters.getParameter("gain"),
    *gainRelay,
    nullptr
);
```

---

## Common Issues Across Projects

### Issue: Parameter IDs Don't Match
**Symptom:** Controls don't respond in VST3
**Cause:** Designer uses different parameter ID than C++ APVTS
**Solution:** 
- Check designer element's `parameterId` property
- Check C++ `parameters.createAndAddParameter()` ID
- Ensure exact string match (case-sensitive)

### Issue: UI Doesn't Load in VST3
**Symptom:** Blank WebView window
**Cause:** WebView2 file path incorrect
**Solution:**
- Check `PluginEditor.cpp` file path to `index.html`
- Verify WebUI/ui folder exists relative to plugin
- Check WebView2 runtime is installed

### Issue: Canvas Size Mismatch
**Symptom:** UI appears clipped or misaligned
**Cause:** CSS canvas size doesn't match `setSize()` in C++
**Solution:**
- Designer canvas size must match `#plugin-container` in CSS
- `PluginEditor.cpp` `setSize()` must match both

### Issue: SVG Knobs Not Rendering
**Symptom:** Knobs show as empty divs
**Cause:** `components.js` not loaded or script error
**Solution:**
- Check browser console for JavaScript errors
- Verify `components.js` is in WebUI/ui folder
- Ensure script tags in `index.html` load in correct order

---

## GSD Workflow Recommendations

### When Working on Designer Features

**Before implementing:**
1. Consider impact on VST3 template exports
2. Check if change affects `bindings.cpp` code generation
3. Verify backward compatibility with existing templates

**After implementing:**
1. Test export with both templates (effect-starter, instrument-starter)
2. Verify exported code integrates with EFXvst3 and INSTvst3
3. Update template JSON files if element properties changed

### When Fixing Bugs

**Designer bugs:**
- Check if issue affects export quality
- Test fix with both EFXvst3 and INSTvst3
- Verify templates still load correctly

**Cross-project bugs:**
- Reproduce in all three repos
- Fix in designer if export-related
- Document fix in all affected READMEs

### When Adding Element Types

**New element checklist:**
1. Add to `src/types/elements.ts`
2. Create renderer in `src/components/elements/renderers/`
3. Update `htmlGenerator.ts` export
4. Update `cssGenerator.ts` styles
5. Update `jsGenerator.ts` if interactive
6. Update `cppGenerator.ts` if needs relay
7. Test in both VST3 templates
8. Update SPECIFICATION.md

---

## Version Compatibility

### Designer → VST3 Templates

- **Element system:** Must remain compatible
- **Export format:** Breaking changes require VST3 template updates
- **Template JSON schema:** Version field tracks compatibility

### JUCE Version Requirements

- **EFXvst3:** JUCE 8.0.4+ (WebView2 patch required)
- **INSTvst3:** JUCE 8.0.12+
- **Designer:** No JUCE dependency (browser-based)

### WebView2 API

- Designer generates code for JUCE's `window.__JUCE__.backend` API
- API is stable across JUCE 8.x versions
- Breaking changes in JUCE would require export code updates

---

## Testing Strategy

### Unit Testing (Designer)
- Element type validation
- Export code generation
- Template JSON parsing

### Integration Testing (Cross-Project)
1. Load template in designer
2. Modify elements
3. Export to ZIP
4. Extract to VST3 template
5. Build VST3
6. Test in DAW
7. Verify all controls work

### Regression Testing
- Keep reference exports from both templates
- Compare new exports against references
- Verify no breaking changes in generated code

---

## Documentation Sync

When updating documentation, sync across:

1. **Designer:** 
   - `docs/WORKFLOW.md` - Integration workflow
   - `templates/README.md` - Template usage
   
2. **EFXvst3:**
   - `README.md` - Designer integration section
   - `docs/WEBVIEW_INTEGRATION_GUIDE.md` - Technical details
   
3. **INSTvst3:**
   - `README.md` - Designer integration section
   - `docs/WEBVIEW_INTEGRATION_GUIDE.md` - Technical details

---

## Future Integration Points

### Planned Features

- **Live Preview Mode:** Designer communicates with running VST3 for real-time updates
- **Preset Import:** Import VST3 preset files to populate UI values
- **Theme System:** Shared color palettes across all templates
- **Component Library:** Reusable UI components shareable between projects

### Potential Issues

- JUCE API changes requiring export updates
- WebView2 API evolution
- New element types requiring VST3 template boilerplate
- Cross-platform support (macOS, Linux)

---

**GSD Usage:** Reference this document when working on features that affect export, templates, or cross-project compatibility. Always test changes in both VST3 templates before considering feature complete.