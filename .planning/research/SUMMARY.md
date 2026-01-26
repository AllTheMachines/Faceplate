# Project Research Summary

**Project:** VST3 WebView UI Designer v1.2 - Complete Element Taxonomy
**Domain:** Audio plugin UI designer with comprehensive element library (25→103 elements)
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

The VST3 WebView UI Designer is scaling from 25 to 103 element types — a 4x increase that will expose architectural weaknesses invisible at current scale. Research across stack, features, architecture, and pitfalls reveals this is **fundamentally a scaling challenge**, not a greenfield project.

**The good news:** The current architecture (React + TypeScript + Zustand + discriminated unions) is sound and proven through v1.0-1.1. The DOM + SVG rendering approach has successfully handled 30 element types with excellent performance and WYSIWYG export fidelity.

**The critical insight:** Adding 78 elements without structural changes creates technical debt that compounds exponentially. Five critical issues must be addressed **before** adding new elements:

1. **PropertyPanel.tsx will become unmaintainable** (25 type guards → 103 type guards, 200+ LOC)
2. **Bundle size explosion** (2.2MB → 8-10MB without code splitting)
3. **TypeScript compilation degradation** (large discriminated unions slow tsc)
4. **Canvas performance collapse** (20-30 real-time visualizations at 30-60 FPS)
5. **Palette organization breakdown** (100+ items in flat lists)

**The recommended approach:** Invest 2-3 weeks in architectural refactoring (Phase 0) before adding any elements. This up-front investment prevents months of retrofitting later. The refactoring establishes patterns that make adding 78 elements straightforward rather than painful.

**Key risks and mitigation:** The highest risk is skipping Phase 0 refactoring and adding elements directly to the current architecture. This creates a "technical debt spiral" where each new element makes refactoring harder. Mitigation: treat Phase 0 as non-negotiable prerequisite work.

## Key Findings

### Recommended Stack

The existing stack (React 18, TypeScript, Vite, Zustand, @dnd-kit, Tailwind CSS, DOMPurify, SVGO, svgson, react-dropzone, Zod, Konva, react-konva) remains sufficient for **most** of the 78 new elements. The DOM + SVG rendering approach proven in v1.0-v1.1 scales well for static and interactive controls.

**Core technologies to add (2 new dependencies):**
- **react-piano (^3.1.3):** Interactive piano keyboard — mature library with TypeScript support, 1.3k+ stars, MIT licensed, separates UI from audio implementation
- **react-arborist (^3.x):** Complete tree view component — best-in-class VSCode-like experience, virtualization for large trees, accessibility compliant, active maintenance

**Already installed (no additions needed):**
- **Konva (^9.3.22) + react-konva (^18.2.14):** Canvas rendering for real-time visualizations (spectrum analyzer, waveform, oscilloscope, goniometer, vectorscope)

**Not adding:**
- Web Audio API integration (designer exports static UI, not audio processing)
- FFT libraries (real FFT happens in JUCE C++, designer shows mock data)
- Heavy charting libraries (custom Canvas implementations more appropriate for audio-specific needs)
- Full canvas rendering migration (DOM approach works, maintains WYSIWYG export)

**Critical architectural decision:** Continue DOM + SVG rendering for 95% of elements. Use Canvas only for real-time visualizations requiring 30-60 FPS updates with thousands of drawing operations.

### Expected Features

Research identified 78 new elements across 10 categories, totaling 103 elements when combined with existing 25.

**Must have (table stakes for professional credibility):**
- **Meter ballistics compliance:** VU (300ms), PPM Type I/II (10ms attack, 1.5-2.8s fall), True Peak (ITU-R BS.1770 4x oversampling), LUFS (EBU R128 K-weighting), K-System (600ms integration)
- **Standard rotary variants:** Endless encoder, stepped knob, center-detented knob (expected for filter selection, pan controls, bipolar parameters)
- **Professional visualizations:** Spectrum analyzer (FFT with log scale), EQ curve (interactive handles), envelope display (ADSR)
- **Value displays with formatting:** Time display (ms/s/bars), note display (MIDI → C4), ratio display (∞:1 for limiters)

**Should have (competitive differentiators):**
- Visual customization of standards-compliant meters (color zones, peak hold, custom ballistics)
- Interactive curve editors (EQ, compressor, envelope) with drag handles
- XY pad for modern modulation control
- Step sequencer with modern features (probability, ratcheting, ghost notes)

**Defer to v2+:**
- Real-time audio preview in designer (Web Audio API integration)
- Auto-EQ suggestions (AI overreach)
- Built-in preset libraries (bloat)
- Multi-track visualization (scope creep)

**Critical success factor:** The designer's value is making standards-compliant elements visually customizable and exportable to JUCE code. Must expose meter ballistics, FFT parameters, scale options as configurable properties while providing sensible defaults.

### Architecture Approach

The current architecture uses discriminated unions with type guards across three layers (types, renderers, property panels). This pattern **scales well to 100+ element types** with one critical change: migrate from massive switch statements to **registry-based lookups** using Map structures.

**Major components and patterns to preserve:**
1. **Type System (src/types/elements.ts):** Discriminated union with literal `type` discriminant, factory functions, type guards — **NO CHANGES NEEDED**, this scales perfectly to 103 types
2. **Zustand Store:** Slice-based organization with temporal middleware for undo/redo — **NO NEW SLICES NEEDED**, all element types in single elements array
3. **Renderer Pattern:** One renderer component per element type receiving config as prop — **KEEP 1:1 MAPPING**, improve lookup mechanism
4. **Property Panel Pattern:** One property component per element type with reusable inputs — **KEEP PATTERN**, migrate to registry-based lookup

**Major components requiring refactoring:**
1. **Component Registration:** Replace switch statements in PropertyPanel.tsx and Element.tsx with Map-based component registries
2. **Code Generation:** Migrate export generators from switch-based to template-driven architecture using Mustache templates
3. **Palette Organization:** Add 2-level category hierarchy with search/filter for 100+ items

**Rendering strategy decision framework:**
- **Use DOM when:** Static or infrequent updates, user interaction needed, <100 elements simultaneously
- **Use Canvas when:** Real-time animation (>30 FPS), hundreds of visual elements, custom drawing algorithms

**Elements requiring Canvas (5% of total):**
- Waveform Display, Oscilloscope, Spectrum Analyzer, Spectrogram, Vectorscope, Goniometer
- All others remain DOM-based (knobs, sliders, buttons, meters, LEDs, displays, containers)

### Critical Pitfalls

**1. PropertyPanel.tsx maintenance collapse**
- **Risk:** 25 type guards → 103 type guards creates 200+ line if-else chain, merge conflicts on every PR
- **Prevention:** Migrate to Map-based component registry pattern before adding elements
- **Phase impact:** MUST address in Phase 0 (refactoring before element addition)

**2. Bundle size explosion (2MB → 8-10MB)**
- **Risk:** Each element adds 15-40KB, all loaded upfront causes 3-5 second initial load time
- **Prevention:** Code splitting by element category, lazy load visualization renderers
- **Phase impact:** Set up infrastructure in Phase 0-1 before adding elements

**3. TypeScript compilation performance degradation**
- **Risk:** 103-type discriminated union causes tsc to slow from 2-3s → 15-30s, IDE lag
- **Prevention:** Split unions by category (5-6 sub-unions), enable incremental compilation
- **Phase impact:** Refactor type system in Phase 0 before union grows

**4. Canvas performance collapse with 50+ real-time visualizations**
- **Risk:** 20-30 visualizations updating at 30-60 FPS = 1,200 renders/second, frame rate drops <15 FPS
- **Prevention:** Hybrid SVG + Canvas architecture, requestAnimationFrame batching, visibility culling
- **Phase impact:** Implement in Phase 2 before adding visualization elements

**5. Palette organization breakdown**
- **Risk:** 100+ items in flat lists, users spend 30-60s finding elements, low feature discovery
- **Prevention:** 2-level category hierarchy, search/filter, favorites/recent tracking
- **Phase impact:** Redesign palette UX in Phase 1 before adding 78 elements

## Implications for Roadmap

Based on research, the 4x scaling challenge requires architectural refactoring before element addition. Suggested phase structure:

### Phase 0: Architectural Refactoring (2-3 weeks) — PREREQUISITE

**Rationale:** Adding 78 elements to current architecture creates compounding technical debt. Refactoring with 25 elements takes 2-3 weeks; retrofitting after 103 elements exist takes 2-3 months.

**Delivers:**
- PropertyPanel.tsx migrated to component registry pattern (<100 lines vs 200+)
- File organization refactored into category-based structure
- Code splitting infrastructure established
- TypeScript unions split by category for compilation performance
- 2-level palette hierarchy with search

**Addresses (from PITFALLS.md):**
- Pitfall 1: PropertyPanel.tsx monolith
- Pitfall 2: Bundle size explosion (infrastructure)
- Pitfall 3: TypeScript performance
- Pitfall 5: Palette organization
- Pitfall 6: File organization chaos

**Avoids:** Technical debt spiral where each new element makes refactoring exponentially harder

**Research flags:** No additional research needed (architecture patterns well-documented)

### Phase 1: Simple Controls (Low Risk, High Reuse) — 1-2 weeks

**Rationale:** Foundation controls with no dependencies. Establishes registry pattern for all subsequent phases.

**Delivers:**
- 5 rotary variants (endless encoder, stepped knob, center-detented, concentric dual, dot indicator)
- 5 linear variants (bipolar slider, crossfade slider, notched slider, arc slider, multi-slider)
- 7 buttons/switches (icon button, toggle switch, rocker switch, rotary switch, kick button, segment button, power button)

**Uses (from STACK.md):**
- Existing React + SVG rendering pipeline
- Existing parameter binding system
- Component registry pattern from Phase 0

**Implements (from ARCHITECTURE.md):**
- Registry-based renderer and property panel lookup
- Validation with Zod schemas
- Design token system for consistency

**Avoids (from PITFALLS.md):**
- Pitfall 7: Automated element validation catches missing implementations
- Pitfall 9: Zod schemas prevent invalid property values

**Research flags:** No additional research needed (extends existing control patterns)

### Phase 2: Value Displays & LEDs (Low Complexity) — 1 week

**Rationale:** Simple text/color rendering with no complex state or interactions.

**Delivers:**
- 8 value displays (numeric, time, percentage, ratio, note, BPM, editable, multi-value)
- 6 LED indicators (single, bi-color, tri-color, array, ring, matrix)

**Uses (from STACK.md):**
- Text formatting utilities
- Color property system
- CSS transitions for state changes

**Implements (from ARCHITECTURE.md):**
- formatValue utility extensions
- State-based color switching
- Array rendering for LED arrays

**Research flags:** No additional research needed (straightforward rendering)

### Phase 3: Navigation & Selection (Medium Complexity) — 1-2 weeks

**Rationale:** Establish complex interactive components before adding specialized audio elements.

**Delivers:**
- 8 selection/navigation elements (multi-select dropdown, combo box, tab bar, menu button, breadcrumb, stepper, tag selector, tree view)
- Install react-arborist for tree view

**Uses (from STACK.md):**
- react-arborist (^3.x) for professional tree view
- Keyboard event handling
- Virtualization for large lists

**Implements (from FEATURES.md):**
- Type-to-filter (combo box for preset search)
- Expand/collapse hierarchies (tree view for patch bay)
- Search highlights and keyboard navigation

**Avoids (from PITFALLS.md):**
- Pitfall 8: React Hook Form optimizes property panel performance for complex forms

**Research flags:** react-arborist integration needs testing with preset browser use case

### Phase 4: Professional Meters (Medium-High Complexity) — 2-3 weeks

**Rationale:** Standards-compliant meter ballistics are critical for professional credibility but require precise implementation.

**Delivers:**
- 5 level meters (RMS, VU, PPM Type I, PPM Type II, True Peak)
- 3 frequency/correlation meters (Correlation, Stereo Width, LUFS)
- Custom ballistics implementation (VU: 300ms, PPM: 10ms/1.5s, K-System: 600ms)

**Uses (from STACK.md):**
- Custom TypeScript implementation of meter ballistics
- Standards: IEC 60268-10 (PPM), EBU R128 (LUFS), ANSI C16.5-1942 (VU)

**Implements (from FEATURES.md):**
- Configurable ballistics (attack/release properties)
- Peak hold indicator (1-3s hold time)
- Clip indicator (latches at 0 dBFS)
- Color zones (green <-18, yellow <-6, red ≥-6)

**Avoids (from PITFALLS.md):**
- Non-standard ballistics (breaks professional expectations)

**Research flags:** NEEDS RESEARCH-PHASE — Precise ballistics algorithms require validation against standards (IEC, EBU, ITU-R docs). Test in JUCE WebView2 to verify C++ export accuracy.

### Phase 5: Specialized Audio Controls (High Complexity) — 2-3 weeks

**Rationale:** MIDI and synthesis controls require specialized interactions and component integrations.

**Delivers:**
- Piano keyboard (install react-piano ^3.1.3)
- XY Pad (2D control with crosshair)
- Harmonic Editor (bar chart for partials)
- Envelope Display (ADSR with draggable points)
- 4 additional specialized controls

**Uses (from STACK.md):**
- react-piano for MIDI keyboard UI
- Multi-parameter binding (XY pad controls 2 parameters simultaneously)
- Interactive drag system for envelope points

**Implements (from FEATURES.md):**
- Piano keyboard: MIDI note on/off, configurable range, velocity sensitivity
- XY Pad: crosshair, snap-to-grid, parameter labels
- Envelope: ADSR with curve types (linear, exponential, logarithmic)

**Avoids (from PITFALLS.md):**
- Built-in piano sounds (out of scope, visual element only)
- Real-time XY recording (complex state management)

**Research flags:** react-piano integration straightforward (well-documented library)

### Phase 6: Real-Time Visualizations (Canvas) — 3-4 weeks

**Rationale:** Requires Canvas rendering infrastructure and mock data handling. Most complex phase.

**Delivers:**
- Spectrum Analyzer (FFT visualization with smoothing)
- Spectrogram (waterfall display)
- Waveform Display (upgrade placeholder)
- Oscilloscope (upgrade placeholder)
- Goniometer, Vectorscope
- Hybrid SVG + Canvas architecture implementation

**Uses (from STACK.md):**
- Konva + react-konva (already installed)
- requestAnimationFrame for 30-60 FPS updates
- OffscreenCanvas for background rendering

**Implements (from ARCHITECTURE.md):**
- VisualizationLayer component (single canvas for all visualizations)
- Throttled animation updates (30 FPS for analyzers)
- Visibility culling (don't render off-screen)
- Offscreen canvas for static grid/labels

**Addresses (from FEATURES.md):**
- FFT size options (512, 1024, 2048, 4096, 8192)
- Frequency scale (linear, log, MEL)
- Color gradients (hot, cool, rainbow)
- Persistence/trails (ghost image fade)

**Avoids (from PITFALLS.md):**
- Pitfall 4: Canvas performance collapse (batched rendering, culling, throttling)

**Research flags:** NEEDS RESEARCH-PHASE — Canvas export to JUCE WebView2 needs integration testing. Mock data generation for realistic previews. Performance profiling with 10-20 simultaneous visualizations.

### Phase 7: Interactive Curves (SVG) — 2 weeks

**Rationale:** Interactive curve editors build on SVG rendering experience from previous phases.

**Delivers:**
- EQ Curve (interactive frequency response handles)
- Compressor Curve (threshold, ratio, knee dragging)
- Filter Response (frequency response visualization)
- Envelope Editor (multi-segment ADSR)

**Uses (from STACK.md):**
- SVG path generation for curves
- Interactive drag system for handles
- Bezier curve fitting for smoothing

**Implements (from FEATURES.md):**
- Drag handles for frequency, gain, Q adjustment
- Collision detection (handles don't overlap)
- Real-time curve preview
- Filter types: bell, shelf, high-pass, low-pass, notch

**Research flags:** Standard curve editing patterns (no additional research needed)

### Phase 8: Containers & Polish — 1 week

**Rationale:** Low-complexity finishing elements.

**Delivers:**
- 3 containers/decorative (tooltip, spacer, window chrome)
- Remaining edge case elements
- UX improvements (visible undo/redo buttons, QWERTZ keyboard support)

**Research flags:** No additional research needed

### Phase Ordering Rationale

**Dependencies discovered:**
1. **Phase 0 is non-negotiable prerequisite** — Refactoring with 25 elements vs 103 elements differs by 10x effort
2. **Simple → Complex progression** — Each phase builds patterns for next phase
3. **Component libraries early** — Install react-piano and react-arborist when needed, not all at once
4. **Canvas architecture before visualizations** — Phase 6 requires infrastructure from Phase 0-5
5. **Standards-compliant meters before visualizations** — Phase 4 establishes data flow patterns for Phase 6

**How this avoids pitfalls:**
- Phase 0 prevents all 5 critical pitfalls before they occur
- Incremental validation catches issues early (add 10-15 elements, test, repeat)
- Performance measurement after each phase prevents degradation
- Code splitting infrastructure established before bundle grows

### Research Flags

**Phases likely needing `/gsd:research-phase` during planning:**

**Phase 4 (Professional Meters): NEEDS RESEARCH**
- **Why:** Ballistics algorithms need precise implementation per standards (IEC 60268-10, EBU R128, ITU-R BS.1770-5)
- **What to research:** Reference implementations for VU/PPM/LUFS calculations, True Peak oversampling filter coefficients
- **When:** Before starting Phase 4 implementation
- **Confidence gap:** Current research identified standards but not exact implementation details

**Phase 6 (Real-Time Visualizations): NEEDS RESEARCH**
- **Why:** Canvas export to JUCE WebView2 integration unclear
- **What to research:** JUCE C++ ↔ JavaScript data transfer patterns, Canvas API compatibility in JUCE WebView2
- **When:** Before starting Phase 6 implementation
- **Confidence gap:** MDN best practices cover general Canvas, but JUCE-specific needs validation

**Phases with standard patterns (skip research-phase):**

**Phase 1 (Simple Controls):** React component patterns well-documented, extends existing controls
**Phase 2 (Displays & LEDs):** Text formatting and color switching are straightforward
**Phase 3 (Navigation):** react-arborist well-documented, standard React patterns
**Phase 5 (Specialized Audio):** react-piano well-documented, XY pad is standard pattern
**Phase 7 (Interactive Curves):** SVG drag patterns established in existing codebase
**Phase 8 (Containers & Polish):** Low-complexity finishing work

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | **HIGH** | react-piano and react-arborist are mature, well-maintained libraries. Konva already installed and proven. Custom meter ballistics are well-specified by standards. Only 2 new dependencies needed. |
| **Features** | **HIGH** | 40+ web searches, official specifications (ITU-R, EBU, IEC), plugin market analysis. Standards for meters are prescriptive (VU: 300ms, PPM: 10ms/1.5s, LUFS: EBU R128). Feature categorization based on professional plugin expectations. |
| **Architecture** | **HIGH** | Registry pattern proven for 100+ component systems. Template-driven code generation is industry standard. Canvas vs DOM decision backed by real-world case studies (Felt, MDN). Current architecture analysis shows discriminated unions scale well. |
| **Pitfalls** | **HIGH** | Cross-referenced with 2026 performance research, official TypeScript/React docs, and existing codebase analysis. All 5 critical pitfalls validated against community articles and technical deep dives. Phase 0 refactoring patterns are established best practices. |

**Overall confidence:** **HIGH**

The convergence of findings across all four research dimensions (stack, features, architecture, pitfalls) reinforces confidence. The recommended approach — Phase 0 refactoring before element addition — appears consistently across architecture and pitfalls research.

### Gaps to Address

**During Phase 0 (Refactoring):**
- **Validation:** Measure bundle size after code splitting implementation (target: initial load <800KB)
- **Validation:** Benchmark TypeScript compilation time after union split (target: <10 seconds)
- **Validation:** Test PropertyPanel.tsx with 103-entry registry (ensure type safety maintained)

**During Phase 4 (Professional Meters):**
- **Research:** Reference implementations for meter ballistics algorithms
- **Validation:** Test ballistics accuracy against known-good implementations (compare with iZotope Insight, Waves WLM)
- **Validation:** Verify JUCE C++ export generates correct ballistics code

**During Phase 6 (Real-Time Visualizations):**
- **Research:** JUCE WebView2 Canvas performance characteristics
- **Validation:** Profile with 10-20 simultaneous visualizations (target: maintain >30 FPS)
- **Validation:** Test Canvas export to JUCE, ensure JavaScript draw functions work in WebView2

**Not addressed in research (needs empirical testing):**
- Exact bundle size per element type (depends on implementation complexity)
- Memory profiling with 100+ element instances on canvas
- User testing of 2-level palette hierarchy (UX validation)
- JUCE WebView2 performance limits on lower-end hardware

## Sources

### Primary Sources (HIGH confidence)

**Stack Research:**
- [react-piano on npm](https://www.npmjs.com/package/react-piano) — MIDI keyboard UI library
- [react-arborist GitHub](https://github.com/brimdata/react-arborist) — Tree view component
- [Konva documentation](https://konvajs.org/docs/react/index.html) — Canvas rendering
- [Visualizations with Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) — Best practices
- [Building a High-Performance UI Framework with HTML5 Canvas and WebGL](https://medium.com/@beyons/building-a-high-performance-ui-framework-with-html5-canvas-and-webgl-f7628af8a3c2) — Rendering strategy

**Features Research:**
- [ITU-R BS.1770-5 (2023)](https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1770-5-202311-I!!PDF-E.pdf) — True Peak metering standard
- [EBU R 128](https://en.wikipedia.org/wiki/EBU_R_128) — LUFS loudness normalization
- [IEC 60268-10/18](https://en.wikipedia.org/wiki/Peak_programme_meter) — PPM Type I/II standards
- [VU And PPM Audio Metering](https://www.sound-au.com/project55.htm) — Ballistics technical details
- [Everything You Need to Know About Audio Metering](https://sonicscoop.com/everything-need-know-audio-meteringand/) — Industry overview

**Architecture Research:**
- [Factory Pattern Type Script Implementation with Type Map](https://medium.com/codex/factory-pattern-type-script-implementation-with-type-map-ea422f38862) — Registry pattern
- [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale) — State management
- [A Guide to Code Generation](https://tomassetti.me/code-generation/) — Template-driven generation
- [DOM vs. Canvas](https://www.kirupa.com/html5/dom_vs_canvas.htm) — Rendering comparison

**Pitfalls Research:**
- [From SVG to Canvas – part 1: making Felt faster](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster) — Real-world performance case study
- [Code-split JavaScript | web.dev](https://web.dev/learn/performance/code-split-javascript) — Bundle optimization
- [TypeScript Best Practices for Large-Scale Web Applications in 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/) — Compilation performance
- [React project structure for scale: decomposition, layers and hierarchy](https://www.developerway.com/posts/react-project-structure) — File organization

### Secondary Sources (MEDIUM confidence)

**Stack Research:**
- [@domchristie/needles npm](https://www.npmjs.com/package/@domchristie/needles) — EBU R128 LUFS (future consideration)
- [7 Best React Tree View Components](https://reactscript.com/best-tree-view/) — Library comparison
- Web Audio API best practices — General canvas performance

**Features Research:**
- [Bob Katz K-System](https://www.meterplugs.com/blog/2016/10/14/k-system-metering-101.html) — Integrated metering
- [iZotope Insight 2](https://www.izotope.com/en/products/insight/features/spectrogram.html) — Professional visualization reference
- [Best Spectrum Analyzer Plugins](https://emastered.com/blog/best-spectrum-analyzer-plugins) — 2026 market survey

**Architecture Research:**
- [Scaling React Component Architecture](https://dev.to/nithinbharathwaj/scaling-react-component-architecture-expert-patterns-for-large-javascript-applications-5fh3) — Large app patterns
- [Understanding the Differences: DOM vs SVG vs Canvas vs WebGL](https://sourcefound.dev/dom-vs-svg-vs-canvas-vs-webgl) — Rendering strategy

**Pitfalls Research:**
- [SVG vs Canvas Animation: Best Choice for Modern Frontends](https://www.augustinfotech.com/blogs/svg-vs-canvas-animation-what-modern-frontends-should-use-in-2026/) — Performance comparison
- [Reducing JavaScript Bundle Size with Code Splitting in 2025](https://dev.to/hamzakhan/reducing-javascript-bundle-size-with-code-splitting-in-2025-3927) — Optimization strategies
- [Solving React Form Performance](https://dev.to/opensite/solving-react-form-performance-why-your-forms-are-slow-and-how-to-fix-them-1g9i) — Property panel optimization

### Tertiary Sources (Community consensus)

- [Keep it together: 5 essential design patterns for dev tool UIs](https://evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis) — Palette UX patterns
- [React Folder Structure in 5 Steps [2025]](https://www.robinwieruch.de/react-folder-structure/) — File organization
- KVR Audio forum discussions — Plugin user expectations
- JUCE forum discussions — WebView UI patterns

---

**Research completed:** 2026-01-26
**Ready for roadmap:** Yes

**Next steps:**
1. Review SUMMARY.md with stakeholders
2. Confirm Phase 0 refactoring is acceptable 2-3 week investment
3. Prioritize 78 element types if timeline constraints exist
4. Create detailed roadmap from phase structure above
5. Execute Phase 0 refactoring before adding any new elements
