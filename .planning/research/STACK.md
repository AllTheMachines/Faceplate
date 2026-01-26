# Technology Stack for 78 New Elements

**Project:** VST3 WebView UI Designer v1.2
**Research Date:** 2026-01-26
**Focus:** Stack additions for Complete Element Taxonomy milestone

## Executive Summary

The existing stack (React 18, TypeScript, Vite, Zustand, @dnd-kit, Tailwind CSS, DOMPurify, SVGO, svgson, react-dropzone, Zod) remains sufficient for **most** of the 78 new elements. The project's DOM + SVG rendering approach proven in v1.0-v1.1 scales well for static and interactive controls.

**Key additions needed:**
1. **Piano keyboard**: React component library for MIDI note input
2. **Professional metering**: JavaScript/TypeScript libraries for VU/PPM/LUFS ballistics
3. **Real-time visualizations**: Canvas rendering for spectrum analyzers and goniometers
4. **Tree view**: Accessible React tree component

**Not needed:**
- Full canvas rendering migration (DOM approach works, true WYSIWYG export)
- Web Audio API integration (designer exports static UI, not audio processing)
- Heavy charting libraries (custom Canvas for audio-specific needs)

---

## Rendering Architecture Decision

### Continue DOM + SVG Rendering (No Canvas Migration)

**Rationale:**
- **WYSIWYG principle**: Exported HTML/CSS must match designer exactly. DOM rendering guarantees this.
- **Proven approach**: v1.0-v1.1 with 30 elements demonstrates performance is adequate
- **Export simplicity**: Elements are already in final format (HTML/CSS/SVG)
- **Accessibility**: DOM elements have native focus, keyboard nav, screen reader support
- **Konva already installed**: Available for specific Canvas needs without migration

**When to use Canvas:**
- **Real-time visualizations only**: Spectrum analyzer, spectrogram, goniometer, vectorscope
- **Performance justification**: These update 30-60 FPS and draw thousands of points
- **Hybrid approach**: Canvas for visualization, DOM for controls and UI chrome

**Evidence:**
- Web research confirms "Canvas and WebGL are more performant than the DOM" but notes "for UI elements, performance may actually improve using DOM when static" ([Building a High-Performance UI Framework with HTML5 Canvas and WebGL](https://medium.com/@beyons/building-a-high-performance-ui-framework-with-html5-canvas-and-webgl-f7628af8a3c2))
- MDN Web Audio best practices recommend `requestAnimationFrame` for visualizations, acknowledging Canvas is appropriate for frequency/time domain displays ([Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API))

---

## Required Additions

### 1. Piano Keyboard Component

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **react-piano** | ^3.1.3 | Interactive piano keyboard | Most mature, MIT licensed, 1.3k+ stars |

**Installation:**
```bash
npm install react-piano
```

**Why react-piano:**
- **Separation of concerns**: Library provides UI/interaction, doesn't force audio implementation
- **Customizable**: MIDI range, key styling, keyboard shortcuts all configurable
- **Touch/mouse/keyboard**: All input methods supported
- **TypeScript support**: Ships with type definitions
- **Proven**: Used in production applications, active maintenance

**Alternatives considered:**

| Library | Pros | Cons | Why Not |
|---------|------|------|---------|
| klavier | Lightweight (ships minimal styling) | Less mature (newer project) | react-piano more battle-tested |
| react-piano-component | Includes MP3 audio | Forces audio implementation | Violates separation of concerns |

**Integration notes:**
- Designer renders static piano (no audio playback)
- Export generates HTML/CSS + C++ JUCE MIDI event bindings
- User configures: start note, end note, key colors, labels

**Sources:**
- [react-piano on npm](https://www.npmjs.com/package/react-piano)
- [react-piano GitHub](https://github.com/kevinsqi/react-piano)
- [Klavier GitHub](https://github.com/tigranpetrossian/klavier)

---

### 2. Professional Audio Metering (VU/PPM/LUFS)

**Recommendation:** **Custom TypeScript implementation** using meter ballistics algorithms from standards.

**Why custom vs library:**
- **Static display**: Designer shows meter UI, not real-time audio processing
- **Standards compliance**: VU (300ms attack/release), PPM (10ms attack, 1.7s fall), LUFS (EBU R128 weighting)
- **Lightweight**: Ballistics algorithms are ~50 lines of TypeScript each
- **JUCE integration**: Export generates C++ snippets that implement real ballistics

**Reference implementations for algorithms:**

| Meter Type | Standard | Attack | Release | Implementation Reference |
|------------|----------|--------|---------|-------------------------|
| VU Meter | Volume Units | 300ms | 300ms | [VU And PPM Audio Metering](https://www.sound-au.com/project55.htm) |
| PPM Type I | IEC 60268-10 | 10ms | 1.5s | [Peak programme meter - Wikipedia](https://en.wikipedia.org/wiki/Peak_programme_meter) |
| PPM Type II | BBC standard | 10ms | 2.8s | [Q. What's the difference between PPM and VU meters?](https://www.soundonsound.com/sound-advice/q-whats-difference-between-ppm-and-vu-meters) |
| LUFS | EBU R128 | 400ms window | - | [@domchristie/needles](https://github.com/domchristie/needles) |
| K-meters | Bob Katz | 600ms | 600ms | [Meters: Essential Tools for Professional Audio](https://tapeop.com/interviews/54/meters) |

**Optional library (if real-time preview added later):**

| Library | Version | Purpose | When to Add |
|---------|---------|---------|-------------|
| @domchristie/needles | ^0.x | EBU R128 LUFS measurement | Only if adding real-time audio preview |

**Why needles (for future):**
- Browser-based LUFS/LKFS measurement
- Supports momentary, short-term, integrated modes
- EBU R 128 / ITU-R BS.1770-4 compliant
- Demo: https://domchristie.github.io/needles/

**NOT recommended:**

| Library | Why Not |
|---------|---------|
| ebur128-wasm | WASM overhead unnecessary for static designer |
| lufs.js (dodds-cc) | Archived project, unmaintained |
| SciChart.js | Commercial license, heavy for design tool |

**Designer implementation:**
1. Render meter UI (DOM + SVG gradient fills)
2. Mock needle/bar position at design time
3. Export generates C++ ballistics code + HTML/CSS meter visual

**Sources:**
- [@domchristie/needles npm](https://www.npmjs.com/package/@domchristie/needles)
- [Everything You Need to Know About Audio Metering](https://sonicscoop.com/everything-need-know-audio-meteringand/)
- [VU Meter ballistics - diyAudio](https://www.diyaudio.com/community/threads/vu-meter-ballistics.239534/)

---

### 3. Real-Time Visualizations (Canvas Rendering)

**Use existing:** **Konva + react-konva** (already installed in package.json v9.3.22 / v18.2.14)

**Why Konva:**
- **Already in project**: Listed in package.json dependencies
- **React integration**: react-konva provides declarative API
- **Performance**: Efficient for canvas rendering with redraw optimization
- **Design-time flexibility**: Can switch between static preview and animated mock

**Visualization components requiring Canvas:**

| Element | Why Canvas | Update Rate | Drawing Complexity |
|---------|------------|-------------|-------------------|
| Spectrum Analyzer | FFT data (512-8192 bins) | 30-60 FPS | High (thousands of bars/line segments) |
| Spectrogram | Time-frequency heatmap | 30-60 FPS | Very High (2D pixel array) |
| Goniometer | L/R phase Lissajous | 60 FPS | High (XY scatter plot) |
| Vectorscope | Stereo correlation | 60 FPS | High (XY plot with persistence) |
| Scrolling Waveform | Time domain sample data | 30 FPS | High (continuous scroll buffer) |

**NOT recommended:**

| Library | Why Not |
|---------|---------|
| react-canvas (Flipboard) | Unmaintained, last commit 2016 |
| audiomotion-analyzer | Complete analyzer (3.3k+ lines), overkill for design tool |
| react-audio-visualizer-pro | Forces real-time audio input, not design-time mockable |
| Chart.js / Recharts | General charting, not audio-specific (no log scales, FFT binning) |

**Designer implementation:**
1. Canvas element with mock data at design time
2. User configures: FFT size, color map, scale (linear/log), smoothing
3. Export generates HTML5 Canvas + JavaScript draw functions + C++ data transfer

**Reference implementations:**
- [Visualizations with Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [jsGoniometer GitHub](https://github.com/DrSnuggles/jsGoniometer) (reference for goniometer algorithm)
- [web-audio-goniometer-react](https://github.com/esonderegger/web-audio-goniometer-react) (React component pattern)

**Performance best practices:**
- Use `requestAnimationFrame` for animation loop
- Limit visual complexity (subsample frequency bins if >256 bars)
- Use `OffscreenCanvas` for background rendering (modern browsers)
- Monitor render capacity (Web Audio API provides metrics)

**Sources:**
- [Web Audio API best practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Canvas vs DOM rendering](https://blog.logrocket.com/when-to-use-html5s-canvas-ce992b100ee8/)
- [Konva documentation](https://konvajs.org/docs/react/index.html)

---

### 4. Tree View Component

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **react-arborist** | ^3.x | Complete tree view component | Best-in-class, VSCode-like experience |

**Installation:**
```bash
npm install react-arborist
```

**Why react-arborist:**
- **Complete solution**: Drag-drop, selection, keyboard nav, virtualization built-in
- **TypeScript**: Full type definitions included
- **Performance**: Virtualization for large trees (1000+ nodes)
- **Accessibility**: ARIA compliant
- **Professional UX**: Matches VSCode sidebar, Finder, Explorer patterns
- **Active maintenance**: Regular updates, responsive maintainers

**Alternatives considered:**

| Library | Pros | Cons | Why Not |
|---------|------|------|---------|
| MUI X Tree View | Part of Material-UI ecosystem | Requires @mui/x-tree-view (adds MUI dependency) | Project uses Tailwind, not MUI |
| react-complex-tree | Strong accessibility | More complex API | react-arborist simpler for our needs |
| @naisutech/react-tree | Good TypeScript support | Less feature-complete | Missing drag-drop, virtualization |

**Use cases in designer:**
- Preset browser hierarchical navigation
- Patch bay signal routing tree
- Element layer hierarchy (future: parent-child relationships)

**Sources:**
- [react-arborist GitHub](https://github.com/brimdata/react-arborist)
- [7 Best React Tree View Components](https://reactscript.com/best-tree-view/)
- [MUI X Tree View](https://mui.com/x/react-tree-view/)

---

## Existing Stack (No Changes)

These libraries remain sufficient for the new elements:

| Library | Current Version | Use Cases |
|---------|----------------|-----------|
| React | 18.3.1 | UI framework |
| TypeScript | ~5.6.2 | Type safety |
| Vite | ^6.0.5 | Build tool |
| Zustand | ^5.0.10 | State management |
| @dnd-kit/core | ^6.3.1 | Drag-drop (palette, canvas) |
| Tailwind CSS | ^3.4.19 | Styling |
| DOMPurify | 2.35.0 | SVG sanitization |
| SVGO | ^4.0.0 | SVG optimization |
| svgson | ^5.3.1 | SVG parsing |
| react-dropzone | ^14.3.8 | File upload |
| Zod | ^4.3.6 | Validation |
| Konva | ^9.3.22 | Canvas rendering (already installed) |
| react-konva | ^18.2.14 | React Canvas bindings (already installed) |

**Why no additions:**
- **Rotary controls (5 new)**: SVG rendering, same as existing Knob
- **Linear controls (5 new)**: SVG rendering, same as existing Slider
- **Buttons/switches (7 new)**: DOM elements with CSS, existing patterns
- **Value displays (8 new)**: Text formatting, no new dependencies
- **LED indicators (6 new)**: SVG circles with CSS transitions
- **Containers/decorative (3 new)**: DOM layout, existing approach
- **Specialized audio (most)**: Custom implementations using existing stack

---

## NOT Adding

### Web Audio API

**NOT NEEDED** for designer.

**Why:**
- Designer creates **static UI mockups**, not functional audio processing
- JUCE WebView2 plugin handles real audio in C++, not JavaScript
- Visualizations show **design-time mock data**, not real-time audio

**When it WOULD be needed:**
- If adding "Preview with Audio" feature (out of scope for v1.2)
- If building standalone audio plugin (different project)

### FFT Libraries

**NOT NEEDED** for designer.

**Why:**
- Spectrum analyzer shows **static frequency bars** at design time
- Real FFT happens in JUCE C++ at runtime
- JavaScript export includes FFT drawing code, not FFT computation

**When it WOULD be needed:**
- If adding audio file import for waveform display (future feature)

### Heavy Charting Libraries

**NOT NEEDED**: No Chart.js, Recharts, D3, Victory, etc.

**Why:**
- Audio visualizations have specific needs (log scales, FFT binning, ballistics)
- General charting libraries add 100-500KB for features we don't need
- Custom Canvas implementations are 50-200 lines and exactly fit requirements
- Better performance with targeted code

---

## Installation Summary

```bash
# New dependencies for v1.2
npm install react-piano@^3.1.3
npm install react-arborist@^3

# Development dependencies (no changes)
# Konva and react-konva already installed (v9.3.22, v18.2.14)
```

**Total added:** 2 dependencies (react-piano, react-arborist)

**Bundle size impact:**
- react-piano: ~50KB minified
- react-arborist: ~80KB minified
- **Total increase:** ~130KB (acceptable for 78 new elements)

---

## Integration Points with Existing Stack

### Element Rendering Pattern

All elements follow existing pattern:

```typescript
// src/types/elements.ts
interface NewElementConfig extends BaseElementConfig {
  type: 'piano-keyboard' | 'vu-meter' | 'spectrum-analyzer' | ...
  // Element-specific properties
}

// src/components/elements/renderers/PianoKeyboardRenderer.tsx
import { Piano } from 'react-piano'

function PianoKeyboardRenderer({ config }: Props) {
  // Render using react-piano
  return <Piano noteRange={[config.startNote, config.endNote]} ... />
}
```

### Zustand Store Extension

```typescript
// src/store/index.ts
interface DesignerState {
  elements: ElementConfig[] // Already handles all element types
  // No store changes needed for new element types
}
```

### Export System Extension

```typescript
// src/services/export/html.ts
function generateElementHTML(config: ElementConfig): string {
  switch (config.type) {
    case 'piano-keyboard':
      return generatePianoHTML(config as PianoKeyboardConfig)
    case 'vu-meter':
      return generateVUMeterHTML(config as VUMeterConfig)
    // ... existing cases
  }
}
```

**No breaking changes to existing architecture.**

---

## Performance Considerations

### Design-Time Rendering

**Target:** 60 FPS with 100+ elements on canvas

**Strategies:**
- **Selective rendering**: Only redraw elements that changed (Zustand selector optimization)
- **Virtualization**: Tree view and preset browser use react-arborist virtualization
- **Debouncing**: Property panel updates debounced to reduce re-renders
- **Canvas optimization**: Konva layer caching for static elements

**Evidence from existing implementation:**
- v1.1 handles 30+ element types smoothly
- DOM rendering performs well for static/semi-static UI
- Canvas used only where justified (visualizations)

### Export Bundle Size

**Exported JUCE bundle includes:**
- HTML (elements structure): ~10-50KB depending on element count
- CSS (styling): ~20-100KB depending on customization
- JavaScript (interactivity + JUCE bridge): ~30-80KB
- Assets (SVG knobs, backgrounds): Variable (user-provided)

**New elements add:**
- Piano keyboard: ~5KB HTML/CSS per instance
- Meters: ~3KB HTML/CSS per instance (SVG gradients)
- Visualizations: ~10-15KB JavaScript per type (Canvas drawing code)

**Total impact:** Minimal (complexity scales with element count, not type count)

---

## Version Pinning Strategy

| Dependency | Version Strategy | Rationale |
|------------|------------------|-----------|
| react-piano | ^3.1.3 | Caret (minor updates safe, stable API) |
| react-arborist | ^3.x | Caret (v3 stable, no breaking changes expected) |
| Konva | ^9.3.22 | Caret (already in project, proven stable) |
| react-konva | ^18.2.14 | Caret (matches React 18, stable) |

**Update cadence:**
- Review quarterly for security patches
- Major version upgrades only when justified by features
- Lock file (package-lock.json) ensures reproducible builds

---

## Risk Assessment

### Low Risk

- **Piano keyboard (react-piano)**: Mature library, TypeScript support, active maintenance
- **Tree view (react-arborist)**: Well-architected, used in production apps
- **Konva for Canvas**: Widely adopted, 10+ years of development

### Medium Risk

- **Custom meter ballistics**: Requires careful implementation of standards (VU/PPM/LUFS)
  - **Mitigation:** Reference implementations exist, well-documented standards
- **Canvas visualization export**: Ensuring exported JavaScript works in JUCE WebView2
  - **Mitigation:** Test in EFXvst/INSTvst templates, follow existing export patterns

### No Risk

- **Existing stack**: Proven in v1.0-v1.1, no changes needed

---

## Future Considerations

### If Adding Real-Time Audio Preview (Out of Scope for v1.2)

**Then add:**
- `@domchristie/needles` for LUFS measurement
- Web Audio API (built-in, no install) for AnalyserNode
- `audiomotion-analyzer` or custom FFT visualization

**Complexity increase:** Significant (audio routing, latency management, browser compatibility)

### If Migrating to Full Canvas Rendering (Not Recommended)

**Would need:**
- Full UI framework on Canvas (e.g., custom framework)
- Accessibility layer (ARIA, screen readers won't work with Canvas)
- Hit testing rewrite (no DOM events)
- Export rewrite (Canvas → DOM conversion)

**Complexity increase:** Massive (months of work, marginal benefit)

**Verdict:** Stick with DOM + SVG for UI, Canvas for visualizations only.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Piano keyboard | **HIGH** | react-piano well-established, TypeScript support, MIT license |
| Meter ballistics | **MEDIUM** | Algorithms documented, but custom implementation required |
| Canvas visualizations | **HIGH** | Konva proven, MDN best practices documented, reference implementations exist |
| Tree view | **HIGH** | react-arborist best-in-class, active maintenance, TypeScript support |
| Rendering architecture | **HIGH** | DOM + SVG approach validated by v1.0-v1.1, research confirms suitability |
| Export compatibility | **MEDIUM** | New element types need testing in JUCE WebView2, but follow existing patterns |

**Overall stack confidence:** **HIGH** (2 new libraries, both mature; custom code well-specified)

---

## Recommendations for Roadmap

### Phase Structure

Based on stack requirements, suggest phases:

1. **Simple Elements First** (use existing stack)
   - Rotary variants, linear variants, buttons, LEDs
   - Value displays, containers
   - **Complexity:** Low (existing rendering patterns)

2. **Piano Keyboard** (add react-piano)
   - Install dependency
   - Build renderer component
   - Test MIDI export
   - **Complexity:** Low-Medium (library integration)

3. **Tree View** (add react-arborist)
   - Install dependency
   - Build preset browser
   - Test navigation
   - **Complexity:** Low-Medium (library integration)

4. **Professional Meters** (custom ballistics)
   - Implement VU/PPM/LUFS algorithms
   - Build meter renderers
   - Test C++ export accuracy
   - **Complexity:** Medium (algorithm implementation)

5. **Real-Time Visualizations** (Konva Canvas)
   - Build spectrum analyzer
   - Build spectrogram, goniometer, vectorscope
   - Test Canvas export to JUCE
   - **Complexity:** Medium-High (Canvas rendering + mock data)

### Research Flags

**Likely needs deeper research:**
- **Phase 4 (Meters)**: Ballistics algorithms need precise implementation, testing against standards
- **Phase 5 (Visualizations)**: Canvas export to JUCE WebView2 needs integration testing

**Unlikely to need research:**
- **Phase 1**: Existing patterns proven
- **Phase 2**: react-piano well-documented
- **Phase 3**: react-arborist well-documented

---

## Sources

### React Component Libraries
- [react-piano on npm](https://www.npmjs.com/package/react-piano)
- [react-piano GitHub](https://github.com/kevinsqi/react-piano)
- [Klavier GitHub](https://github.com/tigranpetrossian/klavier)
- [react-arborist GitHub](https://github.com/brimdata/react-arborist)
- [7 Best React Tree View Components](https://reactscript.com/best-tree-view/)
- [MUI X Tree View](https://mui.com/x/react-tree-view/)

### Audio Metering
- [@domchristie/needles npm](https://www.npmjs.com/package/@domchristie/needles)
- [@domchristie/needles GitHub](https://github.com/domchristie/needles)
- [VU And PPM Audio Metering](https://www.sound-au.com/project55.htm)
- [Peak programme meter - Wikipedia](https://en.wikipedia.org/wiki/Peak_programme_meter)
- [Q. What's the difference between PPM and VU meters?](https://www.soundonsound.com/sound-advice/q-whats-difference-between-ppm-and-vu-meters)
- [Everything You Need to Know About Audio Metering](https://sonicscoop.com/everything-need-know-audio-meteringand/)
- [VU Meter ballistics - diyAudio](https://www.diyaudio.com/community/threads/vu-meter-ballistics.239534/)
- [Meters: Essential Tools for Professional Audio](https://tapeop.com/interviews/54/meters)
- [EBU R 128 - Wikipedia](https://en.wikipedia.org/wiki/EBU_R_128)

### Canvas and Visualization
- [Konva documentation](https://konvajs.org/docs/react/index.html)
- [Visualizations with Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [Web Audio API best practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [Building a High-Performance UI Framework with HTML5 Canvas and WebGL](https://medium.com/@beyons/building-a-high-performance-ui-framework-with-html5-canvas-and-webgl-f7628af8a3c2)
- [Canvas vs DOM rendering](https://blog.logrocket.com/when-to-use-html5s-canvas-ce992b100ee8/)
- [jsGoniometer GitHub](https://github.com/DrSnuggles/jsGoniometer)
- [web-audio-goniometer-react GitHub](https://github.com/esonderegger/web-audio-goniometer-react)
- [Metering with the Web Audio API](https://www.rpy.xyz/posts/20190119/web-audio-meters.html)

### Performance and Best Practices
- [Web Audio API performance and debugging notes](https://padenot.github.io/web-audio-perf/)
- [Profiling Web Audio apps in Chrome](https://web.dev/articles/profiling-web-audio-apps-in-chrome)
- [DOM vs. Canvas comparison](https://www.kirupa.com/html5/dom_vs_canvas.htm)

---

**Research completed:** 2026-01-26
**Stack additions:** 2 new dependencies (react-piano, react-arborist)
**Overall assessment:** Existing stack scales well, minimal additions needed
