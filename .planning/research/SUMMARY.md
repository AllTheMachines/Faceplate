# Project Research Summary

**Project:** VST3 WebView UI Designer
**Domain:** Browser-based Visual Design Tool (Canvas Editor for Audio Plugin UIs)
**Researched:** 2026-01-23
**Confidence:** MEDIUM-HIGH

## Executive Summary

The VST3 WebView UI Designer is a specialized canvas-based design tool for creating audio plugin interfaces that export to JUCE WebView2 code. Research shows that modern visual design tools follow a layered architecture with scene graph document models, command-pattern undo/redo, and declarative canvas rendering. The recommended stack (React 19, TypeScript, Vite, Zustand, @dnd-kit, Tailwind) is validated as appropriate, with one critical gap identified: **react-konva must be added as the canvas rendering library**.

The domain has well-established patterns: Figma-like tools use scene graphs for element hierarchy, command patterns for history management, and separation between document state (what gets saved) and canvas state (ephemeral UI like zoom/pan). Audio plugin UIs have unique constraints—fixed canvas sizes, precise numeric positioning, and grid-based layouts—making this simpler than general-purpose design tools. No real-time collaboration or responsive design needed.

The critical architectural risk is undo/redo implementation. Research strongly warns against naive snapshot-based undo (storing entire canvas as image), which causes memory crashes. Instead, use command pattern or Immer patches with Zustand's temporal middleware (zundo). The second major risk is coordinate system confusion between screen, canvas, and element spaces—this must be addressed in Phase 1 with typed coordinate utilities. With these foundations right, the tool follows standard patterns: drag-drop palette, properties panel, snap-to-grid, and template-based code export.

## Key Findings

### Recommended Stack

The chosen stack (React 18, TypeScript, Vite, Zustand, @dnd-kit, Tailwind) is validated with one critical addition and one upgrade recommended.

**Core technologies:**
- **React 19** (upgrade from 18): UI framework — industry standard, stable as of Dec 2024, better DX with ref-as-prop
- **TypeScript 5.7+**: Type safety — essential for complex state in design tools, catches coordinate system bugs at compile time
- **Vite 7.3+**: Build tool — fastest dev server, excellent HMR for iterative canvas work
- **Zustand 5.0+**: State management — lightweight (1KB), simple API, perfect for medium-complexity apps, temporal middleware for undo
- **react-konva 18.2+ (CRITICAL ADDITION)**: Canvas rendering — declarative React API, built-in transforms/selection, scene graph architecture
- **@dnd-kit 0.2+**: Drag & drop — modern, accessible, handles palette-to-canvas drops (separate from Konva's on-canvas dragging)
- **Tailwind CSS 4.1+**: Styling — rapid prototyping, dark theme support, excellent for design tool UIs

**Essential supporting libraries:**
- **react-colorful 5.6+**: Color picker — 2.8KB, TypeScript support, industry standard for 2025
- **react-hotkeys-hook 4.5+**: Keyboard shortcuts — Ctrl+Z/Y, Delete, arrow keys for nudging
- **zundo (via Zustand temporal)**: Undo/redo — lightweight command-pattern implementation, 700B core
- **Zod 3.24+**: JSON validation — TypeScript-first, validates project files and export schemas
- **Handlebars 4.7+**: Code generation — template engine for JUCE WebView2 export
- **@radix-ui primitives**: Property panel inputs — unstyled, accessible, works with Tailwind

**Critical gap addressed:** No canvas library was chosen. react-konva is the recommended solution—better React integration than Fabric.js, more declarative API, lighter bundle (80KB vs 120KB), and active maintenance.

### Expected Features

Research identified 8 table stakes features (users expect from any canvas editor), 10 differentiators (make this better than hand-coding), and 10 anti-features (explicitly avoid for v1).

**Must have (table stakes):**
- Canvas pan & zoom — hold spacebar+drag, scroll/pinch (every visual tool since 1990s)
- Selection — click, Shift+click multi-select, drag marquee
- Drag & drop from palette — core interaction model for component-based design
- Move/resize/rotate — basic transformations with handles and arrow key nudging
- Delete — Delete/Backspace key
- Undo/redo — Ctrl+Z/Y, command pattern (not image-based)
- Properties panel — configure selected element, precise numeric input critical for audio UIs
- Save/load JSON — version control friendly, auto-save recommended
- Export code — generate HTML/CSS/JS for JUCE WebView2 (THE killer feature)

**Should have (competitive differentiators):**
- Snap to grid — audio UIs use grid layouts for control banks, Shift+drag to snap
- Smart guides — dynamic alignment when elements align with others
- Direct numeric input — click value, type exact pixels (developers expect this)
- Copy/paste/duplicate — essential for control banks (8 identical knobs)
- Keyboard shortcuts — arrow keys for nudge, Ctrl shortcuts for power users
- Export with sensible IDs — `gain-knob` not `element-47` for JUCE integration
- Component library — predefined knobs, sliders, buttons, meters with sensible defaults
- Property presets — "Small knob", "Large slider" templates reduce repetitive config
- Live preview — see controls animate (knobs spin, sliders slide)

**Defer (v2+, avoid scope creep):**
- Real-time collaboration — single-user tool, massive complexity, developers work solo
- Cloud storage — local files + git is developer workflow, skip cloud infrastructure
- AI generation — audio UIs need precise control, AI doesn't understand ergonomics
- Animation timeline — static UI design, animations are code concern not design concern
- Auto layout/constraints — plugin UIs are fixed resolution (800x600), absolute positioning only
- Design tokens/themes — premature for v1, hard-code styling per control
- Component variants — wait for proven need, don't build design system tooling yet

### Architecture Approach

Canvas-based design tools follow a layered architecture with scene graph document model, command-pattern undo, and atomic state management. The pattern is scene graph → Zustand store → React-Konva rendering.

**Major components:**

1. **Document Store (Zustand)** — single source of truth for design elements as scene graph tree, manages element CRUD operations via Immer middleware, wrapped with temporal middleware (zundo) for undo/redo

2. **Selection Store (Zustand)** — tracks selected element IDs (Set for O(1) lookup), hover state, multi-select logic, independent of document changes to prevent unnecessary re-renders

3. **Canvas Store (Zustand)** — ephemeral UI state (zoom, pan, grid settings), NOT saved to project JSON, separate concern from document state

4. **Canvas Editor (React-Konva)** — declarative rendering via `<Stage>`, `<Layer>`, shape components, props-driven (no imperative Konva API calls), three-layer structure: background (grid), content (elements), interaction (selection/handles)

5. **Element Palette (@dnd-kit)** — drag source with custom collision detection to transform screen coordinates to canvas space accounting for zoom/pan

6. **Properties Panel (React Hook Form)** — dynamic property forms based on selected element type, debounced updates (16-100ms) to prevent rendering lag, integrates with Radix UI and react-colorful

7. **Export Engine (Handlebars)** — template-based code generation to HTML/CSS/JS and VST3 C++ code, sanitizes inputs (element names, colors, coordinates) before template insertion

**Key architectural patterns:**

- **Scene graph**: Hierarchical tree structure with parent-child relationships for grouping, transforms cascade down tree (move group → children move)
- **Command pattern**: Encapsulate operations as command objects with execute/undo methods, or use Zustand temporal middleware with Immer patches
- **Separation of concerns**: View (React components), Domain (business logic like coordinate transforms), Data (Zustand stores)
- **Atomic state**: Fine-grained state slices prevent unnecessary re-renders, components subscribe only to needed state
- **Declarative canvas**: React-Konva treats canvas as React components, props in → pixels out, no imperative API calls

### Critical Pitfalls

Research identified 5 critical pitfalls that cause rewrites or major issues:

1. **Naive undo/redo with canvas snapshots** — storing full canvas as base64 image causes memory crashes with 50+ states. Prevention: store command objects or Immer patches, never full snapshots. Phase impact: Phase 2 (undo architecture), must be correct from start.

2. **DOM mutation in drag-drop** — imperative DOM manipulation breaks React rendering, causes ghost elements and state desync. Prevention: use @dnd-kit (already in stack), all updates via Zustand, never touch DOM directly. Phase impact: Phase 3 (drag-drop), architectural decision.

3. **Coordinate system confusion** — mixing screen/canvas/element coordinate spaces causes elements placed at wrong positions when zoomed. Prevention: create typed coordinate utilities (`screenToCanvas`, `canvasToElement`), test at multiple zoom levels. Phase impact: Phase 2 (zoom/pan), foundational for all features.

4. **SVG DOM overhead** — 100+ SVG elements cause frame drops during drag. Prevention: React.memo on components, virtualization if needed, consider hybrid rendering (selected as SVG, rest as cached canvas). Phase impact: Phase 1 (architecture choice), but audio plugin UIs typically < 100 elements so start simple.

5. **Property panel lag** — updating canvas on every keystroke (60 events/sec) drops frame rate. Prevention: debounce updates (16-100ms), optimistic local UI state. Phase impact: Phase 4 (properties panel), easy fix if remembered during implementation.

**Moderate pitfalls (technical debt):**
- Missing keyboard accessibility (no Tab navigation, Escape to deselect)
- Uncontrolled form performance with 20+ inputs (use React Hook Form)
- Code export template brittleness (sanitize inputs, validate edge cases)
- Save/load breaking on version changes (include version field, write migrations)

## Implications for Roadmap

Based on dependencies discovered in architecture and feature research, the suggested phase structure follows a build-order that avoids pitfalls and enables incremental delivery.

### Phase 1: Foundation (State & Canvas Basics)
**Rationale:** Everything depends on state management and document model. Must establish scene graph structure, Zustand stores, coordinate system utilities, and basic React-Konva rendering before building features.

**Delivers:** Empty canvas with pan/zoom, Zustand stores (document, selection, canvas), scene graph data model with TypeScript types, coordinate transform utilities (screenToCanvas, canvasToElement) with typed coordinates to prevent mixing, basic React-Konva Stage/Layer rendering

**Addresses from FEATURES.md:** Canvas pan & zoom (table stakes)

**Avoids from PITFALLS.md:** Coordinate system confusion (Pitfall 4), SVG architecture choice (Pitfall 3—decide pure SVG vs hybrid)

**Research flag:** LOW — scene graph and Zustand patterns are well-documented. Coordinate utilities require careful testing but pattern is standard.

### Phase 2: Selection & History
**Rationale:** Selection is foundational for all interactions (can't edit what you can't select). Undo/redo architecture must be correct from start—refactoring later touches every state mutation.

**Delivers:** Click to select element, Shift+click multi-select, visual selection indicators (highlight), properties panel scaffolding (show selected element properties), undo/redo via Zustand temporal middleware (zundo), keyboard shortcuts (Ctrl+Z/Y)

**Addresses from FEATURES.md:** Selection (table stakes), undo/redo (table stakes), keyboard shortcuts (differentiator)

**Avoids from PITFALLS.md:** Naive snapshot-based undo (Pitfall 1—CRITICAL, use command pattern or Immer patches)

**Uses from STACK.md:** Zustand temporal middleware, react-hotkeys-hook

**Research flag:** LOW — command pattern and Zustand temporal middleware are proven. Testing required but patterns are documented.

### Phase 3: Palette & Element Creation
**Rationale:** Need working selection before auto-selecting newly added elements. Drag-drop builds on canvas rendering established in Phase 1.

**Delivers:** Component palette UI (categorized list of knobs, sliders, buttons, meters), @dnd-kit drag-drop integration, custom collision detection (screen to canvas coordinate transform), drop to instantiate element, auto-select newly added element, delete element (Delete/Backspace key)

**Addresses from FEATURES.md:** Drag & drop from palette (table stakes), delete (table stakes), component library (differentiator)

**Avoids from PITFALLS.md:** DOM mutation in drag-drop (Pitfall 2—use @dnd-kit declaratively, all state via Zustand)

**Uses from STACK.md:** @dnd-kit with custom collision detection

**Research flag:** LOW — @dnd-kit patterns documented, custom collision detection is straightforward coordinate transform

### Phase 4: Properties & Transform Controls
**Rationale:** Requires working document model and selection. Property panel complexity high because forms must adapt to selected element type. Transform controls (move/resize) build on selection.

**Delivers:** Dynamic property forms (type-aware inputs: color picker, number inputs, sliders), direct numeric input (click value, type exact pixels), property update commands with undo support, real-time canvas updates (property → render immediate), debounced updates (16-100ms) to prevent lag, drag to move elements on canvas, resize handles (corner/edge), rotation handle

**Addresses from FEATURES.md:** Properties panel (table stakes), direct numeric input (differentiator), move/resize/rotate (table stakes)

**Avoids from PITFALLS.md:** Property panel lag (Pitfall 5—debounce updates), form performance with 20+ inputs (use React Hook Form)

**Uses from STACK.md:** react-colorful, react-number-format, @radix-ui components, React Hook Form (consider adding to stack)

**Research flag:** LOW for property panel patterns. MEDIUM for JUCE WebView2 property schema—which properties does each control type need? This may need phase-specific research for property definitions.

### Phase 5: Alignment & Polish
**Rationale:** Nice-to-have features that improve UX but aren't blockers. Core tool works without these. Canvas controls are independent of other features.

**Delivers:** Snap to grid (toggle, Shift+drag to snap), grid rendering, smart guides (dynamic alignment indicators when elements align), copy/paste (Ctrl+C/V), duplicate (Ctrl+D or Alt+drag), keyboard shortcuts for nudging (arrow keys 1px, Shift+arrow 10px), zoom limits (0.1x to 10x to prevent precision loss)

**Addresses from FEATURES.md:** Snap to grid (differentiator), smart guides (differentiator), copy/paste/duplicate (differentiator), keyboard shortcuts (differentiator)

**Avoids from PITFALLS.md:** Zoom precision loss (Pitfall 11—clamp zoom range), missing keyboard accessibility (Pitfall 10—add shortcuts)

**Research flag:** LOW — standard design tool patterns, well-documented

### Phase 6: Save/Load & Persistence
**Rationale:** Need stable document format before implementing save. All features should be complete so schema doesn't change.

**Delivers:** JSON serialization of document model, save project to local file, load project with validation (Zod schema), version field in JSON (start at 1.0.0), migration path for future versions, error handling for corrupt files, auto-save (local storage or file system)

**Addresses from FEATURES.md:** Save/load (table stakes)

**Avoids from PITFALLS.md:** Save/load breaking on version changes (Pitfall 12—version field and migrations from start)

**Uses from STACK.md:** Zod for validation

**Research flag:** LOW — JSON serialization is straightforward, Zod patterns documented

### Phase 7: Code Export
**Rationale:** Export is read-only operation that depends on stable document format. Complex because requires JUCE WebView2 API knowledge and template edge case handling. Build last so document schema is stable.

**Delivers:** HTML/CSS/JS export templates (Handlebars), JUCE WebView2 C++ code generation, input sanitization (element names to valid identifiers, color hex validation, coordinate rounding), export preview UI, validation before export (show errors instead of bad code)

**Addresses from FEATURES.md:** Export code (table stakes—THE killer feature), export with sensible IDs (differentiator)

**Avoids from PITFALLS.md:** Code export template brittleness (Pitfall 9—sanitize inputs, test edge cases)

**Uses from STACK.md:** Handlebars, Zod (for pre-export validation)

**Research flag:** MEDIUM-HIGH — JUCE WebView2 API specifics need research. What does JUCE WebView2 code look like? What's the communication pattern between WebView and C++ plugin? This phase likely needs `/gsd:research-phase` before detailed planning.

### Phase 8: Live Preview (Optional Polish)
**Rationale:** High-value feature but high complexity. Not required for MVP. Defer to v2 unless time allows.

**Delivers:** Animated control preview (knobs spin, sliders slide), simulated control behavior without audio engine, visual feedback for parameter ranges

**Addresses from FEATURES.md:** Live preview (differentiator, nice-to-have)

**Research flag:** HIGH — simulating control behavior requires understanding audio plugin parameter mappings. Complex feature, defer unless critical.

### Phase Ordering Rationale

**Why this order:**
1. Foundation first—state management and coordinate systems are architectural decisions that touch everything
2. Undo/redo architecture must be correct from Phase 2—command pattern prevents Pitfall 1 (naive snapshots)
3. Selection before element creation—newly added elements auto-select
4. Properties and transforms together—both require working selection, similar complexity
5. Polish features (snap, guides, shortcuts) after core workflow works
6. Save/load after features complete—stable document schema
7. Export last—depends on stable schema, read-only operation, needs external API research

**Dependency chains identified:**
- Coordinate utilities (Phase 1) → all spatial operations (drag, move, resize, snap)
- Selection (Phase 2) → properties panel (Phase 4), transform controls (Phase 4)
- Document model (Phase 1) → undo/redo (Phase 2), save/load (Phase 6), export (Phase 7)
- Canvas rendering (Phase 1) → all visual features

**Pitfall mitigation:**
- Phase 1 addresses coordinate confusion (Pitfall 4) with typed utilities
- Phase 2 addresses undo architecture (Pitfall 1) with command pattern
- Phase 3 addresses drag-drop (Pitfall 2) with @dnd-kit declarative approach
- Phase 4 addresses property lag (Pitfall 5) with debouncing
- Phase 6 addresses version breaking (Pitfall 12) with version field
- Phase 7 addresses export brittleness (Pitfall 9) with sanitization

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 7 (Code Export):** JUCE WebView2 API research required. Need to understand HTML/JS ↔ C++ communication patterns, parameter binding, control event handling. Search required topics: JUCE WebView2 examples, WebView integration patterns, parameter communication.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Scene graph and Zustand patterns well-documented
- **Phase 2 (Selection & History):** Command pattern and temporal middleware proven
- **Phase 3 (Palette & Drag-Drop):** @dnd-kit patterns documented
- **Phase 4 (Properties & Transform):** Standard React form patterns
- **Phase 5 (Alignment & Polish):** Well-documented design tool patterns
- **Phase 6 (Save/Load):** JSON serialization straightforward

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies verified with official sources, versions confirmed. react-konva validated as best choice for React canvas apps. Only gap: JUCE WebView2 export specifics (addressed in Phase 7 research flag). |
| Features | MEDIUM | Table stakes identified from multiple design tool sources. Differentiators based on audio plugin workflow analysis. Anti-features justified by single-user/local-first context. Limited direct competitor analysis (no audio-specific design tools found). |
| Architecture | MEDIUM-HIGH | Scene graph, command pattern, separation of concerns are HIGH confidence (established patterns, multiple authoritative sources). State management specifics MEDIUM (Zustand patterns from community, not Zustand-specific canvas documentation). |
| Pitfalls | HIGH | Critical pitfalls (undo snapshots, drag-drop DOM mutation, coordinate confusion) verified across multiple technical sources with consistent recommendations. Moderate/minor pitfalls based on React performance patterns (debouncing, form optimization). |

**Overall confidence:** MEDIUM-HIGH

**Why not HIGH:**
- Limited audio plugin UI design tool precedent (extrapolated from general design tools)
- No user interviews to validate feature priorities
- JUCE WebView2 integration details assumed from documentation, not verified with working example
- Component library scope (which controls are MVP-critical) not determined

**Why not MEDIUM:**
- Core architecture patterns (scene graph, command pattern, separation of concerns) are established best practices
- Stack choices validated with ecosystem health checks and authoritative sources
- Critical pitfalls cross-referenced across multiple technical sources with consistent recommendations

### Gaps to Address

**During planning:**
- **JUCE WebView2 export format** — Phase 7 needs research into JUCE WebView2 API, HTML/JS ↔ C++ communication, optimal code structure. Search topics: JUCE WebView2 examples, parameter binding patterns, event handling.
- **Component library prioritization** — Which controls are most common in audio plugins? Survey existing plugin UIs to determine MVP subset of 108-element taxonomy. Consider during Phase 3 planning.
- **Property schema definition** — What properties does each control type need? Knobs need min/max/default, sliders need orientation, etc. Define during Phase 4 planning.

**During implementation:**
- **Performance profiling** — Test with 50-100 elements in Phase 1 to validate SVG vs hybrid rendering decision. Only add canvas layer optimization if profiling shows bottleneck (don't pre-optimize).
- **Coordinate transform testing** — Test utilities at 0.25x, 1x, 4x zoom in Phase 1. Test with pan offset, not just (0,0) origin.
- **Undo history limits** — Test with 100+ history entries in Phase 2 to determine optimal limit (50 states recommended by research).
- **Export edge cases** — Test Phase 7 export with invalid data: spaces in names, missing properties, negative coordinates, malformed colors.

**Accept as constraints:**
- No direct competitor for "JUCE WebView2 UI design tool" — this is an opportunity (first-to-market) not a risk
- Audio plugin UI patterns based on limited visual examples — validate with target users during MVP phase
- Figma-like features extrapolated to audio domain — audio UIs are simpler (fixed size, no responsive design), so simplification is appropriate

## Sources

### Primary (HIGH confidence)

**Stack Research:**
- Official documentation (React 19, Vite 7.3, Zustand 5.0, @dnd-kit 0.2, Tailwind 4.1) — version verification
- [Konva.js official documentation](https://konvajs.org/) — canvas rendering architecture
- [React-Konva official documentation](https://konvajs.org/docs/react/index.html) — declarative canvas patterns
- [Zod official documentation](https://zod.dev/) — TypeScript validation
- Open-Source Design Editor SDKs 2025 Comparison — canvas library evaluation
- React: Comparison of JS Canvas Libraries (Konva vs Fabric) — architecture comparison

**Architecture Research:**
- [Martin Fowler: Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html) — separation of concerns
- [React-Konva official docs](https://konvajs.org/docs/react/index.html) — declarative canvas patterns
- [@dnd-kit official docs](https://docs.dndkit.com) — collision detection, modular architecture
- [Zustand third-party integrations](https://zustand.docs.pmnd.rs/integrations/third-party-libraries) — temporal middleware
- [Konva vs Fabric technical comparison](https://medium.com/@www.blog4j.com/konva-js-vs-fabric-js-in-depth-technical-comparison-and-use-case-analysis-9c247968dd0f) — scene graph architecture
- [Command pattern for undo/redo](https://www.esveo.com/en/blog/undo-redo-and-the-command-pattern/) — history management
- [Zundo GitHub](https://github.com/charkour/zundo) — Zustand temporal middleware

**Pitfalls Research:**
- [Development of undo and redo functionality with canvas](https://www.abidibo.net/blog/2011/10/12/development-undo-and-redo-functionality-canvas/) — snapshot pitfall
- [The Future of Drag and Drop APIs by Dan Abramov](https://medium.com/@dan_abramov/the-future-of-drag-and-drop-apis-249dfea7a15f) — declarative patterns
- [From SVG to Canvas – Felt case study](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster) — SVG performance
- [High Performance SVGs](https://css-tricks.com/high-performance-svgs/) — optimization
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/) — accessibility standards
- [Deep Cloning with structuredClone](https://matiashernandez.dev/blog/post/deep-cloning-in-javascript-the-modern-way.-use-%60structuredclone%60) — state management

### Secondary (MEDIUM confidence)

**Features Research:**
- Canva Software Overview 2026 — design tool feature landscape
- Figma product release notes — modern design tool features
- What Is Figma? A 2026 Guide for UI/UX Designers — canvas editor patterns
- The 11 Best UI Design Tools to Try in 2026 — competitive analysis
- Konva undo/redo tutorial — implementation patterns
- Snap to grid in draw.io — alignment tool patterns
- MATLAB audioPluginInterface documentation — audio UI constraints
- JUCE 8 Feature Overview: WebView UIs — target platform capabilities
- Audio plugin designs on Dribbble — visual examples

**Architecture Research:**
- State Management in 2026: Redux, Context API, Modern Patterns — Zustand adoption trends
- Design Tool Canvas Architecture Guide — Figma-like patterns
- React Design Patterns 2026 — modern React patterns

**Pitfalls Research:**
- Solving React Form Performance — form optimization
- Best Practices for Handling Forms in React (2025 Edition) — controlled component patterns
- JavaScript Performance Optimization: Debounce vs Throttle — input debouncing
- Canvas vs SVG: Choosing the Right Tool — rendering strategy
- Panning and Zooming in HTML Canvas — coordinate transforms
- Code Generation and T4 Text Templates — template patterns
- Keyboard accessibility - TetraLogical (2025) — modern accessibility

### Tertiary (LOW confidence)

**Features Research:**
- Limited audio plugin UI builder analysis — extrapolated from general design tools, no direct competitors found
- No user interviews — feature priorities based on workflow analysis, not developer feedback
- Component library scope — 108-element taxonomy exists but MVP subset not determined

**Architecture Research:**
- React 18 concurrent rendering impact on canvas editors — sources pre-date React 18 concurrent features, needs validation

**Pitfalls Research:**
- Specific element count thresholds for SVG performance — sources say "100s" but no exact numbers, needs profiling
- Zustand-specific canvas patterns — general Zustand patterns, not canvas-specific documentation

---

**Research completed:** 2026-01-23
**Ready for roadmap:** Yes

**Next step:** Roadmap creation with 8 suggested phases. Phase 7 (Code Export) flagged for additional JUCE WebView2 research during planning.
