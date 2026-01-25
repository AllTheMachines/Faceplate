# Project Research Summary

**Project:** VST3 WebView UI Designer - v1.1 SVG Import System
**Domain:** Design tool with SVG asset management and interactive controls
**Researched:** 2026-01-25
**Confidence:** HIGH

## Executive Summary

The v1.1 SVG Import System extends the existing VST3 WebView UI Designer with comprehensive SVG asset management. Research reveals this is fundamentally a **security-critical** feature requiring multi-layer XSS defense, not just a "file upload" feature. The recommended approach uses **DOMPurify for sanitization at every render point**, normalized asset storage in Zustand, and progressive enhancement of existing knob elements to support SVG rendering modes.

The architecture builds on v1.0's solid foundation (React 18, TypeScript, Zustand, existing SVG parsing with svgson) by adding minimal strategic dependencies: DOMPurify (security-critical) and optionally SVGO (optimization). The asset library follows established Zustand slice patterns, with normalized storage (assets referenced by ID, not duplicated) and lazy rendering for performance.

**Critical insight from 2026 Angular CVE:** Even major frameworks struggle with SVG sanitization. The recent CVE-2026-22610 demonstrates XSS via `href` and `xlink:href` attributes in SVG `<script>` elements, confirming that sanitization must be battle-tested (DOMPurify) and applied at every render point, not just upload. This project's exported code runs in JUCE WebView2 (Chromium), making XSS especially dangerous since it could compromise native plugin functionality.

## Key Findings

### Recommended Stack

**Minimal, security-focused additions to existing v1.0 stack.** The project already has React 18, TypeScript, Vite, Zustand, and svgson (SVG parsing). Only one critical addition is required:

**Core additions:**
- **DOMPurify 3.3.1** (REQUIRED) — Industry-standard XSS sanitizer with 18.8M weekly downloads, actively maintained by Cure53 security firm. Supports SVG-specific profiles and removes dangerous elements (`<script>`, `<foreignObject>`, event handlers, `javascript:` URLs). Non-negotiable for security.
- **@types/dompurify 3.2.0** (REQUIRED) — TypeScript definitions for type-safe sanitization API.
- **SVGO 4.0.0** (OPTIONAL, defer) — SVG optimization to reduce file size 30-70%. Add only if users complain about bundle size or performance issues with complex SVGs.

**No new libraries needed for:**
- SVG parsing (svgson already installed)
- SVG rendering (use existing DOM rendering patterns: inline SVG or data URLs)
- Asset library (reuse Zustand state management patterns)
- File upload (react-dropzone already integrated)

**Security architecture requires defense-in-depth:**
1. DOMPurify sanitization (primary defense)
2. Content Security Policy in exported HTML (prevents script execution if XSS slips through)
3. Render as `<img>` for untrusted content (safest approach for static graphics)

### Expected Features

Research identifies two distinct feature categories with different table stakes:

**Must have (table stakes for SVG import):**
- Drag-drop SVG file upload (v1.0 already has this with react-dropzone)
- Preview before import (v1.0 has this)
- Preserve aspect ratio on resize (v1.0 has basic support, needs viewBox validation)
- Import as static image element (v1.0 fully supports)
- Duplicate imported assets (v1.0 general copy/paste works)
- Export SVG in JUCE bundle (v1.0 embeds as data URL)
- Undo/redo import actions (v1.0 history system handles this)

**Should have (differentiators for v1.1):**
- **Asset library management** (NEW) — Central panel for browsing/reusing custom knobs and graphics across projects. Follows pattern from Figma/Sketch asset libraries.
- **Interactive knob rotation** (NEW) — Map SVG indicator layer to parameter value rotation. This is the killer feature: replaces memory-intensive filmstrips with scalable SVG knobs.
- **Layer detection from naming conventions** (ENHANCE v1.0) — v1.0 detects indicator, thumb, track, fill, glow. Expand with arc, normal, hover, active for button states.
- **SVGO optimization** (NEW, optional) — Run on import to reduce file size. Add only if performance issues arise.
- **Asset categories** (NEW) — Tag assets as Knobs/Sliders/Buttons/Decorative for organization.

**Defer to v1.2+:**
- Slider fill animation (less common than knobs)
- Multi-state button graphics (buttons usually simple in audio UIs)
- In-app SVG editing (anti-feature — out of scope, users have Figma/Illustrator)
- Gradient editor (design-time concern, handle in source tool)
- SVG animation timeline (too complex, niche use case)

### Architecture Approach

**Normalized asset storage with ID-based references.** Assets stored once in Zustand, elements reference by ID. Follows Redux-style normalization patterns proven at scale.

**Major components:**

1. **AssetsSlice (Zustand)** — New slice for SVG asset management. Stores `svgAssets` (Record<string, SVGAsset>) and `knobStyles` (Record<string, KnobStyle>). Normalized storage prevents duplication, enables efficient updates. Follows v1.0's slice pattern (CanvasSlice, ElementsSlice, ViewportSlice).

2. **Asset Library Panel** — New UI component with tabbed interface (Knob Styles | Graphics | Import), grid view with thumbnails, search/filter, drag-to-canvas. Follows existing Palette component patterns.

3. **SVGKnobRenderer** — New renderer for knobs with SVG styles. Replaces built-in arc rendering with composed SVG layers. Uses CSS transforms for rotation (`transform: rotate(${angle}deg)`), inline SVG with `dangerouslySetInnerHTML` (sanitized). Progressive enhancement: existing knobs keep built-in rendering, new `renderMode` property adds SVG option.

4. **SafeSVG Component** — Reusable component encapsulating DOMPurify sanitization. All SVG rendering must use this component to enforce security. ESLint rule bans direct `dangerouslySetInnerHTML` except in SafeSVG.tsx.

5. **Import Pipeline** — Reuses v1.0 SVGDesignMode for layer assignment. Adds sanitization step, SVGO optimization (optional), asset metadata entry, thumbnail generation. Saves to AssetsSlice instead of directly creating element.

**Key patterns:**
- **Normalized references:** Elements store `svgKnobStyleId`, not full asset data. Prevents duplication, enables shared styles.
- **Progressive enhancement:** Existing knobs work unchanged. New `renderMode: 'svg'` option adds SVG rendering without breaking existing projects.
- **Selector encapsulation:** Complex queries (`getAssetsByType`, `getKnobStylesForAsset`) live in AssetsSlice, not components.
- **Lazy rendering:** Asset library uses virtual scrolling for performance with 50+ assets. Non-selected SVG elements render as `<img>` data URLs instead of inline DOM nodes.

### Critical Pitfalls

Research identified 12 pitfalls across security, performance, and UX categories. Top 5 critical:

1. **XSS via Embedded Scripts** (CRITICAL) — SVG files can contain `<script>` tags, event handlers (`onload`, `onclick`), `javascript:` URLs, and `<foreignObject>` with HTML. Recent Angular CVE-2026-22610 shows even frameworks miss edge cases like `href` and `xlink:href` in SVG `<script>` elements. **Prevention:** DOMPurify sanitization at EVERY render point (upload, load from JSON, render to canvas, export to JUCE). Defense-in-depth: CSP headers in exported HTML, render untrusted SVG as `<img>`.

2. **XML Bomb (Billion Laughs Attack)** (CRITICAL) — 1KB SVG with recursive entity definitions expands to gigabytes in memory, crashing browser tab. **Prevention:** Reject DOCTYPE declarations (DOMPurify strips these automatically), validate file size (<1MB), validate element count (<5000 nodes), add complexity checks post-parse.

3. **dangerouslySetInnerHTML Without Sanitization** (CRITICAL) — React's `dangerouslySetInnerHTML` bypasses XSS protection. Must sanitize before using. **Prevention:** Create SafeSVG component encapsulating sanitization, ESLint rule to ban direct `dangerouslySetInnerHTML`, always use SafeSVG for SVG rendering.

4. **Performance Degradation with Complex SVGs** (HIGH) — SVGs with 1000+ elements cause slow renders (>50ms), canvas drag lag (<10 FPS), memory spikes. **Prevention:** File size limits (512KB max, 256KB warning), element count limits (5000 max, 1000 warning), render non-selected SVG as `<img>` data URL instead of inline DOM, virtual scrolling in asset library, SVGO optimization on import (optional).

5. **SVG Stored in JSON Without Re-Sanitization** (CRITICAL) — Sanitizing on upload isn't enough. Attacker can edit project JSON to inject malicious SVG, bypassing upload sanitization. **Prevention:** Sanitize at render time, not just upload time. Treat all loaded data as untrusted. Validate JSON on load with Zod, warn on suspicious patterns (`<script>`, event handlers), re-sanitize before export.

**Moderate pitfalls:**
- SSRF via external resources (LOW risk for client-side tool, but sanitize external `href`/`xlink:href`)
- Missing fonts in imported SVG (warn users, suggest converting text to paths)
- Exported code contains unsanitized SVG (re-sanitize during export, add CSP)
- Circular references in `<use>` elements (detect cycles, reject malformed SVG)
- Missing validation on JSON deserialization (validate with Zod, check XML structure)

**Minor pitfalls:**
- No user feedback during upload (show sanitization report, progress indicator)
- No undo/redo for import (integrate with existing undo system)

## Implications for Roadmap

Based on research, recommended phase structure focuses on **security first, asset library second, interactive knobs third**. Security cannot be retrofitted and must be correct from day one.

### Phase 1: Security Foundation & Upload Pipeline
**Rationale:** Security is non-negotiable and must be implemented before any SVG rendering. XSS vulnerabilities from unsanitized SVG stored in project JSON affect all users. Recent CVE-2026-22610 proves even major frameworks miss edge cases.

**Delivers:**
- DOMPurify integration and sanitization utilities
- SafeSVG component with ESLint enforcement
- File upload validation (size limits, DOCTYPE rejection, complexity checks)
- Sanitization report UI (show users what was removed)
- Security tests for all XSS vectors

**Addresses pitfalls:**
- XSS via embedded scripts (Pitfall 1)
- XML bomb attacks (Pitfall 2)
- dangerouslySetInnerHTML misuse (Pitfall 3)

**Tech stack:**
- DOMPurify 3.3.1 + @types/dompurify 3.2.0 (install)
- Zod validation (already installed)
- ESLint rules for SafeSVG enforcement

**Research needs:** None — DOMPurify is battle-tested with comprehensive documentation. Standard patterns apply.

---

### Phase 2: Asset Library Storage & UI
**Rationale:** Asset management must be in place before interactive features. Users need a way to save and organize imported SVGs. Normalized storage prevents data duplication and enables shared styles. This phase establishes the data model for all subsequent features.

**Delivers:**
- AssetsSlice (Zustand) with normalized storage (Record<string, SVGAsset>)
- Asset CRUD operations (add, remove, update, get)
- Asset Library Panel component (grid view, thumbnails, categories)
- Asset import wizard (reuses v1.0 SVGDesignMode for layer assignment)
- Thumbnail generation (render SVG to canvas, extract PNG data URL)
- Export/import library as JSON

**Addresses pitfalls:**
- Performance with large libraries (virtual scrolling, lazy loading)
- No user feedback (import wizard, progress indicator)

**Implements architecture:**
- AssetsSlice following v1.0 slice pattern
- Normalized storage with ID-based references
- Selector encapsulation for complex queries

**Tech stack:**
- Zustand (already installed, add new slice)
- react-window (virtual scrolling, install if needed)
- Canvas API for thumbnail generation

**Research needs:** None — Zustand slice patterns are established in v1.0 codebase. Virtual scrolling is well-documented.

---

### Phase 3: Static SVG Graphics (Image Elements)
**Rationale:** Simplest use case to validate asset library integration. Static graphics use existing Image element renderer with minimal changes. Proves out asset resolution and sanitization pipeline before tackling complex interactive rendering.

**Delivers:**
- Extend ImageElementConfig with `svgAssetId` property
- Modify ImageRenderer to resolve assets by ID
- "Add to Canvas" from Asset Library (drag-drop or click)
- Render as data URL for performance (unless selected)
- Integration with existing undo/redo system

**Addresses features:**
- Import SVG as static image (table stakes)
- Asset library drag-to-canvas (differentiator)

**Addresses pitfalls:**
- No undo for import (integrate with history system)
- Exported code unsanitized (test sanitization on export)

**Tech stack:**
- Existing ImageRenderer (minor modifications)
- @dnd-kit (already installed, extend palette drop targets)

**Research needs:** None — Extends existing patterns. Standard image handling with asset resolution.

---

### Phase 4: Interactive SVG Knobs (Core Feature)
**Rationale:** This is the killer feature for v1.1 — replacing memory-intensive filmstrips with scalable SVG knobs. Depends on asset library (Phase 2) for storage and static graphics (Phase 3) for proven asset resolution. Most complex phase due to layer composition and rotation mapping.

**Delivers:**
- KnobStyle type and CRUD operations (extends AssetsSlice)
- SVGKnobRenderer component (layer composition, rotation transform)
- Extend KnobElementConfig with `svgKnobStyleId` and `renderMode` properties
- Modify KnobRenderer to delegate to SVGKnobRenderer when `renderMode === 'svg'`
- Knob rotation mapping (calculate angle from value, apply CSS transform)
- Color override system (CSS custom properties or SVG attribute replacement)
- Property panel integration (rendering mode toggle, style selector)

**Addresses features:**
- Interactive knob rotation (differentiator, core v1.1 feature)
- Layer-to-property mapping (indicator → rotation)

**Addresses pitfalls:**
- Performance with multiple animated knobs (render as static when not selected)
- Transform origin calculation (assume center, allow manual adjustment)

**Implements architecture:**
- SVGKnobRenderer with layer composition
- Progressive enhancement (existing knobs unchanged)
- SafeSVG for all rendering

**Tech stack:**
- CSS transforms for rotation
- Inline SVG with dangerouslySetInnerHTML (via SafeSVG)
- React.memo for render optimization

**Research needs:** LOW — SVG rotation via CSS transforms is standard. May need performance testing with 50+ knobs to validate optimization strategy.

---

### Phase 5: Export & Polish
**Rationale:** Final phase ensures exported code is secure and optimized. Re-sanitizes all content, adds CSP headers, generates clean JUCE bundles. Validates entire pipeline end-to-end.

**Delivers:**
- Re-sanitize all SVG content during export
- Add CSP meta tags to exported HTML template
- Export validation UI (warn if security issues detected)
- SVGO optimization (optional, user toggle)
- Documentation for exported code security
- Security testing suite (XSS vectors, performance tests)

**Addresses pitfalls:**
- Exported code unsanitized (Pitfall 8)
- SVG stored in JSON without re-sanitization (Pitfall 5)

**Tech stack:**
- DOMPurify (re-sanitize before export)
- SVGO (optional, install if user enables optimization)
- CSP headers in HTML template

**Research needs:** None — Standard export validation patterns. CSP is well-documented.

---

### Phase Ordering Rationale

**Security-first approach:** Phase 1 must complete before any other work. XSS vulnerabilities cannot be patched later — they affect all saved projects and exported code. DOMPurify integration and SafeSVG component establish security boundaries for all subsequent phases.

**Foundation before features:** Asset library (Phase 2) provides data model for both static graphics (Phase 3) and interactive knobs (Phase 4). Building features before storage would require refactoring. Normalized storage enables shared styles and efficient updates.

**Simple before complex:** Static graphics (Phase 3) prove asset resolution and sanitization pipeline with minimal rendering complexity. Interactive knobs (Phase 4) build on this proven foundation, adding layer composition and rotation. Incremental complexity reduces risk.

**Export validates pipeline:** Phase 5 is last because it tests the entire system end-to-end. Export must re-sanitize to catch any vulnerabilities that slipped through earlier stages. Defense-in-depth principle.

**Dependencies by phase:**
- Phase 2 depends on Phase 1 (sanitization utilities used by import wizard)
- Phase 3 depends on Phase 2 (asset library storage for graphics)
- Phase 4 depends on Phase 2 (asset library storage for knob styles)
- Phase 5 depends on all phases (validates complete pipeline)

### Research Flags

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Security Foundation):** DOMPurify is industry-standard with comprehensive docs. XSS patterns are well-documented. No deeper research needed.
- **Phase 2 (Asset Library):** Zustand slice pattern established in v1.0. Normalized storage follows Redux patterns. Virtual scrolling is mature technology.
- **Phase 3 (Static Graphics):** Extends existing Image element. Standard asset resolution. No novel patterns.
- **Phase 5 (Export & Polish):** CSP headers are standard. Export validation follows established patterns.

**Phase likely needing validation during implementation:**

- **Phase 4 (Interactive Knobs):** LOW research need, but may require performance testing. Questions to validate:
  - Performance with 50+ animated knobs on canvas (CSS transform vs Canvas2D rendering)
  - Transform origin calculation for arbitrary SVG layers (assume center may not work for all designs)
  - Color override approach (CSS custom properties vs SVG attribute replacement)
  - Export bundle size with 20+ embedded SVGs (may need SVGO if too large)

**Recommended validation approach for Phase 4:** Create prototype with 3-5 test knob designs during requirements phase. Benchmark rendering performance, test transform origin assumptions, validate color override strategy. Adjust implementation plan based on findings. Estimated validation time: 4-8 hours.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | DOMPurify is industry-standard (18.8M downloads, Cure53-maintained). svgson already proven in v1.0. SVGO is optional and well-documented. Minimal additions reduce risk. |
| Features | **HIGH** | Asset library patterns validated against Figma/Sketch. Audio plugin UI research confirms knob rotation is desired over filmstrips. v1.0 codebase analysis shows existing features cover most table stakes. |
| Architecture | **HIGH** | Zustand slice pattern established in v1.0. Normalized storage follows Redux best practices (proven at scale). Progressive enhancement preserves backward compatibility. SafeSVG component encapsulates security. |
| Pitfalls | **HIGH** | 2026 Angular CVE confirms SVG sanitization is critical. Multiple recent CVEs (CairoSVG, Plane, ThingsBoard) validate security concerns. Performance benchmarks from real-world projects (Felt, CodePen articles). |

**Overall confidence:** **HIGH**

Research based on:
- Official documentation (DOMPurify, React, MDN)
- Recent CVEs (2025-2026) demonstrating active threat landscape
- v1.0 codebase analysis (architecture patterns proven in production)
- Design tool research (Figma, Sketch patterns for asset libraries)
- Audio plugin community research (forum discussions, example projects)

### Gaps to Address

**Minimal gaps — all critical decisions validated:**

1. **Performance with many animated knobs** (LOW priority) — Research provides benchmarks (150ms for 300KB SVG, manageable with 2500 elements), but actual performance depends on specific SVG designs. Mitigation: Implement lazy rendering (static snapshot when not interacting), test with realistic assets during Phase 4. Fallback: Switch to Canvas2D if CSS transforms insufficient.

2. **Color override complexity** (LOW priority) — CSS custom properties approach requires SVG to use `var(--color)`. Real-world Figma/Illustrator exports use hex colors. Mitigation: Document requirement in import wizard, provide fallback SVG attribute replacement if needed. Test with designer exports during Phase 4.

3. **Export bundle size** (LOW priority) — Unknown impact of embedding 20+ SVG assets in JUCE bundle. Mitigation: Test export size with realistic asset library (10-30 items) during Phase 5. Add SVGO optimization if bundle >10MB. JUCE supports resource compression.

4. **JUCE WebView2 CSP enforcement** (LOW priority) — Assumes JUCE WebView2 enforces CSP identically to Chrome. Mitigation: Test CSP headers in JUCE environment during Phase 5. If enforcement differs, adjust CSP configuration.

**None of these gaps block implementation.** All have clear mitigation strategies and can be validated during respective phases. No additional research needed before starting.

## Sources

### Primary (HIGH confidence)

**Security (XSS and Sanitization):**
- [Angular CVE-2026-22610: XSS via SVG script attributes](https://github.com/advisories/GHSA-jrmj-c5cx-3cw6) — Recent CVE demonstrating `href`/`xlink:href` attack vector
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) — Industry-standard sanitizer, 18.8M downloads
- [SVG Security Best Practices](https://www.svggenie.com/blog/svg-security-best-practices) — Comprehensive XSS vector analysis
- [Exploiting SVG Upload Vulnerabilities: Stored XSS](https://medium.com/@xgckym/exploiting-svg-upload-vulnerabilities-a-deep-dive-into-stored-xss-430e9bb1cee1) — Real-world attack scenarios
- [Plane CVE: XSS via SVG Upload](https://github.com/makeplane/plane/security/advisories/GHSA-rcg8-g69v-x23j) — 2025 vulnerability

**Security (XML Bombs):**
- [Billion Laughs Attack - Wikipedia](https://en.wikipedia.org/wiki/Billion_laughs_attack) — Authoritative explanation
- [A Billion Points: SVG Bomb](https://brhfl.com/2017/11/svg-bomb/) — SVG-specific attack examples
- [Recent CVE-2025-3225](https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4) — Confirms attacks still relevant in 2025

**Stack & Libraries:**
- [DOMPurify npm](https://www.npmjs.com/package/dompurify) — Download stats, API documentation
- [svgson npm](https://www.npmjs.com/package/svgson) — Already used in v1.0
- [SVGO GitHub](https://github.com/svg/svgo) — Optimization library

### Secondary (MEDIUM confidence)

**Architecture Patterns:**
- [Zustand Documentation - Slice Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern) — Official pattern guide
- [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale) — Production validation
- [Normalizing State Shape (Redux Docs)](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape) — Normalized storage rationale

**Features & UX:**
- [A Guide to Using SVGs in React](https://blog.logrocket.com/how-to-use-svgs-react/) — Updated April 2025
- [AudioKnobs GitHub](https://github.com/Megaemce/AudioKnobs) — SVG knob library for audio
- [JUCE Forum: Vector graphics GUIs](https://forum.juce.com/t/vector-graphics-guis-and-knob-slider-design/13524) — Community patterns
- [Design System Asset Management](https://www.figma.com/best-practices/components-styles-and-shared-libraries/) — Figma patterns

**Performance:**
- [Improving SVG Runtime Performance - CodePen](https://codepen.io/tigt/post/improving-svg-rendering-performance) — Real-world benchmarks
- [High Performance SVGs - CSS-Tricks](https://css-tricks.com/high-performance-svgs/) — Optimization techniques
- [Planning for Performance — Using SVG](https://oreillymedia.github.io/Using_SVG/extras/ch19-performance.html) — Comprehensive guide

### Tertiary (LOW confidence, validation recommended)

**JUCE WebView2 Security:**
- [JUCE 8 WebView UIs Overview](https://juce.com/blog/juce-8-feature-overview-webview-uis/) — Official overview
- [JUCE Forum: WebView2 Security](https://forum.juce.com/t/how-does-webview2-work-on-juce-7-0-5/57155) — Community discussion (needs validation in actual environment)

---

*Research completed: 2026-01-25*
*Ready for roadmap: yes*
*Next step: Requirements definition (REQUIREMENTS.md) based on phase structure*
