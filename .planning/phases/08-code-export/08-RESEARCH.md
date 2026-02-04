# Phase 8: Code Export - Research

**Researched:** 2026-01-24
**Domain:** JavaScript code generation, JUCE WebView2 integration, browser file handling
**Confidence:** HIGH

## Summary

Researched how to generate working JUCE WebView2 code bundles from canvas designs. The standard approach uses template literals for code generation, JSZip for browser-based ZIP creation, and follows JUCE 8's WebSliderRelay/WebToggleButtonRelay patterns. The JUCE WebView2 API provides a bridge between C++ audio parameters and JavaScript UI through `window.__JUCE__.backend` event system and relay classes with parameter attachments.

Key findings:
- JSZip v3.10.1 is the standard for browser ZIP generation
- JUCE 8 provides WebSliderRelay/WebToggleButtonRelay for parameter binding
- Template literal-based code generation is simpler and more maintainable than AST for this use case
- Case conversion utilities handle element name → id/variable transformations
- Validation before export prevents broken code generation

**Primary recommendation:** Use template literal functions for each file type (HTML/CSS/JS/C++), JSZip for bundling, and browser-fs-access for progressive download enhancement. Validate designs with Zod schemas before generation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jszip | 3.10.1+ | Browser ZIP creation | De facto standard for client-side ZIP, dual-licensed (MIT/GPLv3), excellent browser support |
| browser-fs-access | 0.38.0+ | File save API | Already in project, provides File System Access API with fallback |
| zod | 4.3.6+ | Validation before export | Already in project, validates element configs before code generation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| change-case | 5.0+ | Case conversion utilities | Optional - can hand-roll kebab/camelCase converters |
| sonner | 1.5+ | Toast notifications | For export success/error feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSZip | archiver.js | Archiver requires Node.js, not browser-compatible |
| Template literals | AST (ts-morph) | AST adds complexity for minimal benefit in this use case |
| Custom case converter | change-case library | Library handles edge cases (acronyms, numbers) better |

**Installation:**
```bash
npm install jszip
npm install sonner  # Optional: for toast notifications
npm install change-case  # Optional: for case conversion
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   ├── export/
│   │   ├── codeGenerator.ts      # Main orchestrator
│   │   ├── htmlGenerator.ts      # HTML template generation
│   │   ├── cssGenerator.ts       # CSS styles generation
│   │   ├── jsGenerator.ts        # JavaScript bindings
│   │   ├── cppGenerator.ts       # C++ snippets
│   │   └── validators.ts         # Pre-export validation
│   └── fileSystem.ts             # Already exists
└── components/
    └── export/
        └── ExportPanel.tsx       # UI for export options
```

### Pattern 1: Template Literal Code Generation
**What:** Use tagged template literals or template literal functions for each file type
**When to use:** When generating structured text formats (HTML, CSS, JS, C++)
**Example:**
```typescript
// Source: Medium - Writing a TypeScript Code Generator
function generateHTML(elements: ElementConfig[], canvasConfig: CanvasConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JUCE WebView UI</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="plugin-container" style="width: ${canvasConfig.canvasWidth}px; height: ${canvasConfig.canvasHeight}px;">
    ${elements.map(el => generateElementHTML(el)).join('\n    ')}
  </div>
  <script src="components.js"></script>
  <script src="bindings.js"></script>
</body>
</html>`
}
```

### Pattern 2: Element-Type Dispatch
**What:** Use discriminated union type guards to dispatch to type-specific generators
**When to use:** When each element type needs different HTML/CSS/JS output
**Example:**
```typescript
// Already established in project
function generateElementHTML(element: ElementConfig): string {
  switch (element.type) {
    case 'knob': return generateKnobHTML(element)
    case 'slider': return generateSliderHTML(element)
    case 'button': return generateButtonHTML(element)
    case 'meter': return generateMeterHTML(element)
    case 'label': return generateLabelHTML(element)
    case 'image': return generateImageHTML(element)
  }
}
```

### Pattern 3: Case Conversion
**What:** Convert element names to kebab-case for HTML/JS, camelCase for C++
**When to use:** Element name "Gain Knob" → `id="gain-knob"`, `gainKnobRelay`
**Example:**
```typescript
// Source: johnkavanagh.co.uk/converting-between-camel-snake-and-kebab-case
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}
```

### Pattern 4: JUCE WebView2 Binding Pattern
**What:** JavaScript listens on `window.__JUCE__.backend`, C++ creates relay + attachment
**When to use:** For bidirectional parameter binding (knobs, sliders, buttons)
**Example:**
```typescript
// JavaScript bindings.js
function generateBindings(elements: ElementConfig[]): string {
  const interactiveElements = elements.filter(el =>
    el.type === 'knob' || el.type === 'slider' || el.type === 'button'
  )

  return `// JUCE WebView2 Parameter Bindings
${interactiveElements.map(el => {
  const id = toKebabCase(el.name)
  if (el.type === 'button') {
    return `// ${el.name} (${el.type})
const ${toCamelCase(el.name)} = window.__JUCE__.backend.getToggleState('${id}')
${toCamelCase(el.name)}.addListener(() => {
  document.getElementById('${id}').pressed = ${toCamelCase(el.name)}.getToggleState()
})`
  } else {
    return `// ${el.name} (${el.type})
const ${toCamelCase(el.name)}State = window.__JUCE__.backend.getSliderState('${id}')
${toCamelCase(el.name)}State.valueChangedEvent.addListener(() => {
  // Update UI element with normalized value (0-1)
  const value = ${toCamelCase(el.name)}State.getNormalisedValue()
  // Your update logic here
})`
  }
}).join('\n\n')}`
}
```

### Pattern 5: C++ Snippet Organization
**What:** Group snippets by destination file (header vs implementation)
**When to use:** Help users copy-paste into correct locations
**Example:**
```cpp
// Generated bindings.cpp structure:
// ============================================================================
// Header Declarations (add to PluginEditor.h private section)
// ============================================================================
std::unique_ptr<juce::WebSliderRelay> gainKnobRelay;
std::unique_ptr<juce::WebSliderParameterAttachment> gainKnobAttachment;

// ============================================================================
// Constructor Initialization (add to PluginEditor constructor)
// ============================================================================
gainKnobRelay = std::make_unique<juce::WebSliderRelay>(*webView, "gain-knob");
// TODO: Connect to parameter "gain" (set parameterId in designer)
// gainKnobAttachment = std::make_unique<juce::WebSliderParameterAttachment>(
//     *processorRef.parameters.getParameter("gain"), *gainKnobRelay);
```

### Pattern 6: JSZip Bundle Creation
**What:** Create ZIP in memory, trigger browser download
**When to use:** Export bundle with 5 files (or 4 for HTML preview)
**Example:**
```typescript
// Source: JSZip documentation + browser-fs-access integration
async function exportBundle(
  htmlContent: string,
  cssContent: string,
  jsContent: string,
  bindingsContent: string,
  cppContent?: string  // Optional - only for JUCE export, not HTML preview
): Promise<void> {
  const zip = new JSZip()

  zip.file('index.html', htmlContent)
  zip.file('styles.css', cssContent)
  zip.file('components.js', jsContent)
  zip.file('bindings.js', bindingsContent)
  if (cppContent) {
    zip.file('bindings.cpp', cppContent)
  }

  const blob = await zip.generateAsync({ type: 'blob' })

  // Use browser-fs-access for progressive enhancement
  await fileSave(blob, {
    fileName: 'webview-ui-bundle.zip',
    extensions: ['.zip'],
    mimeTypes: ['application/zip'],
  })
}
```

### Anti-Patterns to Avoid
- **Generating code without validation:** Validate all elements have required properties (names, parameter IDs if interactive) before generation
- **Hardcoding JUCE version-specific code:** Comment where manual integration is needed (parameter connections)
- **Mixing designer state with export code:** Export values should come from element configs, not runtime state
- **Missing HTML escaping:** Escape user-provided text (element names, labels) in HTML generation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP file creation | Custom ZIP encoder | JSZip | Complex format with CRC32 checksums, compression algorithms, directory structures |
| Case conversion | Basic `.toLowerCase()` | Proper kebab/camel converters | Edge cases: numbers ("Osc2Gain"), acronyms ("LFORate"), special chars |
| HTML escaping | Manual replace | Template literals with escaping function | Security (XSS), edge cases (&, <, >, ", ') |
| Code formatting | String concatenation | Template literals with proper indentation | Maintainability, readability |
| Validation errors | Generic error messages | Zod with zod-error | User-friendly messages with field paths |

**Key insight:** Browser file handling, compression, and text case conventions have subtle edge cases that look simple but aren't. Mature libraries handle these better than custom code.

## Common Pitfalls

### Pitfall 1: Template Literal Injection in Generated Code
**What goes wrong:** User-provided element names containing `${}` or backticks break generated JavaScript
**Why it happens:** Template literals evaluate `${}` expressions during generation
**How to avoid:** Escape backticks and `${}` in user content, or use String.raw for literal strings
**Warning signs:** Element name "Test `value`" generates invalid JavaScript

### Pitfall 2: Missing Parameter ID Validation
**What goes wrong:** Generated C++ code has broken parameter bindings
**Why it happens:** Interactive elements (knobs, sliders, buttons) exported without parameter IDs
**How to avoid:** Validate before export that interactive elements have `parameterId` set, or generate TODO comments
**Warning signs:** C++ code compiles but parameter changes don't affect UI

### Pitfall 3: Z-Index vs DOM Order Mismatch
**What goes wrong:** Exported HTML element stacking differs from canvas preview
**Why it happens:** Canvas uses CSS z-index, but DOM order also affects stacking
**How to avoid:** Sort elements by z-index before HTML generation, ensuring DOM order matches visual order
**Warning signs:** Elements overlap differently in exported HTML vs canvas

### Pitfall 4: Inline SVG ID Collisions
**What goes wrong:** Multiple elements with gradients/masks have conflicting SVG IDs
**Why it happens:** Each element generates `<defs>` with IDs like "meter-gradient"
**How to avoid:** Include element ID in SVG def IDs: `meter-gradient-${element.id}`
**Warning signs:** Only first gradient renders correctly in exported HTML

### Pitfall 5: Absolute Positioning Without Container Dimensions
**What goes wrong:** Exported HTML elements positioned incorrectly
**Why it happens:** Canvas uses absolute positioning, but container has no defined size
**How to avoid:** Generate container div with exact canvas dimensions from `canvasConfig`
**Warning signs:** Elements cluster in top-left corner instead of spread across canvas

### Pitfall 6: Missing JUCE Frontend Library
**What goes wrong:** `window.__JUCE__.backend` is undefined in exported HTML preview
**Why it happens:** JUCE runtime provides this object, not present in standalone HTML
**How to avoid:** For HTML preview mode, generate mock `window.__JUCE__.backend` object with stub methods
**Warning signs:** Preview mode shows console errors about undefined `__JUCE__`

## Code Examples

Verified patterns from official sources:

### JSZip Basic Usage
```typescript
// Source: https://stuk.github.io/jszip/documentation/examples.html
import JSZip from 'jszip'
import { fileSave } from 'browser-fs-access'

const zip = new JSZip()

// Add files to zip
zip.file('index.html', htmlContent)
zip.file('styles.css', cssContent)

// Generate and download
const blob = await zip.generateAsync({ type: 'blob' })
await fileSave(blob, {
  fileName: 'bundle.zip',
  extensions: ['.zip'],
  mimeTypes: ['application/zip'],
})
```

### JUCE WebSliderRelay C++ Pattern
```cpp
// Source: https://docs.juce.com/develop/classWebSliderParameterAttachment.html
// Header (.h) - Private members
std::unique_ptr<juce::WebSliderRelay> gainKnobRelay;
std::unique_ptr<juce::WebSliderParameterAttachment> gainKnobAttachment;

// Implementation (.cpp) - Constructor
gainKnobRelay = std::make_unique<juce::WebSliderRelay>(*webView, "gain-knob");
gainKnobAttachment = std::make_unique<juce::WebSliderParameterAttachment>(
    *parameters.getParameter("gain"),
    *gainKnobRelay,
    nullptr  // undoManager
);
```

### JUCE JavaScript Binding Pattern
```javascript
// Source: https://juce.com/blog/juce-8-feature-overview-webview-uis/
// Access slider state from JUCE backend
const sliderState = window.__JUCE__.backend.getSliderState('gain-knob')

// Listen for parameter changes from C++
sliderState.valueChangedEvent.addListener(() => {
  const normalizedValue = sliderState.getNormalisedValue()  // 0-1 range
  updateKnobRotation(normalizedValue)
})

// Send value changes to C++
sliderState.setNormalisedValue(0.5)
```

### Case Conversion Utilities
```typescript
// Source: https://johnkavanagh.co.uk/articles/converting-between-camel-snake-and-kebab-case-in-javascript/
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // Handle camelCase
    .replace(/[\s_]+/g, '-')               // Replace spaces/underscores
    .toLowerCase()
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}

// Examples:
// "Gain Knob" → toKebabCase → "gain-knob"
// "Gain Knob" → toCamelCase → "gainKnob"
```

### Export Validation Schema
```typescript
// Use existing Zod schemas from project
import { ElementConfigSchema } from '../schemas/project'
import { z } from 'zod'

const ExportValidationSchema = z.object({
  elements: z.array(ElementConfigSchema).refine(
    elements => elements.every(el => {
      // Interactive elements must have names
      if (el.type === 'knob' || el.type === 'slider' || el.type === 'button') {
        return el.name && el.name.trim().length > 0
      }
      return true
    }),
    { message: 'All interactive elements must have names' }
  )
})
```

### HTML Template Generation
```typescript
function generateElementHTML(element: ElementConfig): string {
  const id = toKebabCase(element.name)
  const style = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation}deg);`

  switch (element.type) {
    case 'knob':
      return `<div id="${id}" class="knob-element" style="${style}" data-type="knob"></div>`
    case 'slider':
      return `<div id="${id}" class="slider-element" style="${style}" data-type="slider"></div>`
    case 'button':
      return `<button id="${id}" class="button-element" style="${style}">${escapeHTML(element.label)}</button>`
    case 'label':
      return `<span id="${id}" class="label-element" style="${style}">${escapeHTML(element.text)}</span>`
    default:
      return ''
  }
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FileSaver.js polyfill | Native File System Access API | 2020 (Chrome 86) | Better UX with suggested filenames, directory picker |
| String concatenation | Template literals | ES6 (2015) | More readable, maintainable code generation |
| Global `window.JUCE` | `window.__JUCE__.backend` | JUCE 8 (2024) | Namespaced to avoid conflicts |
| WebView component only | WebSliderRelay + Attachments | JUCE 8 (2024) | Parameter binding without custom glue code |

**Deprecated/outdated:**
- FileSaver.js as primary approach: Use File System Access API with browser-fs-access polyfill
- Manual string escaping: Use template literals and dedicated escape functions
- Custom WebView bridges: Use JUCE 8's built-in relay classes

## Open Questions

1. **SVG Asset Handling**
   - What we know: Elements can have custom SVG layers (indicator, track, thumb, fill)
   - What's unclear: Should SVG assets be embedded as data URIs or external files in ZIP?
   - Recommendation: Start with inline SVG in HTML (simpler), add external file option if bundle size is issue

2. **Mock JUCE Backend for Preview**
   - What we know: Preview mode needs mock `window.__JUCE__.backend` object
   - What's unclear: How much JUCE API should mock implement? (just getSliderState/getToggleState or full API?)
   - Recommendation: Minimal mock - stub getSliderState/getToggleState with local state, enough to test UI updates

3. **Parameter ID Format**
   - What we know: JUCE parameters have string IDs, elements have optional `parameterId` field
   - What's unclear: Should we validate parameter ID format? (alphanumeric, camelCase, etc.)
   - Recommendation: Accept any non-empty string, add comment in generated C++ that user must match APVTS parameter IDs

4. **CSS Reset/Normalization**
   - What we know: Exported HTML should render identically to canvas preview
   - What's unclear: Should we include CSS reset in generated styles.css?
   - Recommendation: Include minimal reset for `box-sizing: border-box` and `margin: 0`, document that JUCE WebView may have default styles

## Sources

### Primary (HIGH confidence)
- [JSZip Documentation](https://stuk.github.io/jszip/) - Official docs for ZIP generation
- [JUCE WebSliderParameterAttachment](https://docs.juce.com/develop/classWebSliderParameterAttachment.html) - Official API reference
- [JUCE WebToggleButtonRelay](https://docs.juce.com/master/classjuce_1_1WebToggleButtonRelay.html) - Official API reference
- [JUCE 8 WebView UI Feature Overview](https://juce.com/blog/juce-8-feature-overview-webview-uis/) - Official blog post
- [JUCE WebBrowserComponent Options](https://docs.juce.com/master/classWebBrowserComponent_1_1Options.html) - Official API reference
- [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html) - C++ best practices
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines) - Modern C++ patterns

### Secondary (MEDIUM confidence)
- [Medium: Writing a TypeScript Code Generator](https://medium.com/singapore-gds/writing-a-typescript-code-generator-templates-vs-ast-ab391e5d1f5e) - Template vs AST approaches
- [Case Conversion in JavaScript](https://johnkavanagh.co.uk/articles/converting-between-camel-snake-and-kebab-case-in-javascript/) - Verified conversion patterns
- [Zod Error Customization](https://zod.dev/error-customization) - Official Zod docs for validation
- [Knock: React Toast Libraries 2026](https://knock.app/blog/the-top-notification-libraries-for-react) - Sonner recommendation
- [LogRocket: React Toast Libraries 2025](https://blog.logrocket.com/react-toast-libraries-compared-2025/) - Library comparisons

### Tertiary (LOW confidence)
- [GitHub: JUCE WebView Tutorial](https://github.com/JanWilczek/juce-webview-tutorial) - Tutorial repo (not examined in detail)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - JSZip is industry standard, JUCE API is official documentation
- Architecture: HIGH - Patterns verified from official docs and existing project structure
- Pitfalls: MEDIUM - Based on general web development experience and JUCE patterns, not JUCE WebView2-specific battle testing

**Research date:** 2026-01-24
**Valid until:** 2026-03-24 (60 days - stable domain, JUCE 8 API unlikely to change)
