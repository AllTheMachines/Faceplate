# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-25)

**Core value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.
**Current focus:** Phase 17 - Interactive SVG Knobs (v1.1 Custom Knob Designs)

## Current Position

Phase: 17 of 18 (Interactive SVG Knobs) — IN PROGRESS
Plan: 5 of 6 in current phase
Status: In progress
Last activity: 2026-01-26 — Completed 17-05-PLAN.md (Knob Style Selection UI)

Progress: [█████████░] 92% (80/87 total plans estimated)

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 62
- Average duration: ~25 min
- Total execution time: ~25 hours
- Milestone duration: 3 days (2026-01-23 → 2026-01-25)

**By Phase (v1.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1-12 | 46 | ~19h | ~25min |
| 13 | 16 | ~6h | ~22min |

**Recent Trend:**
- Phase 13 (polish): High plan count but shorter tasks
- Phase 14 (security): 4 plans, security-critical, thorough
- Phase 15 (asset library): Foundation complete in ~1.5min
- Trend: Stable velocity with good momentum

**v1.1 Velocity:**
- Plans completed: 17 (14-01 through 17-05)
- Phase 14: 4 plans, ~100 minutes total (Security foundations)
- Phase 15: 5 plans, ~12 minutes total (Asset library complete)
- Phase 16: 5 plans, ~8 minutes total (SVG Graphics COMPLETE)
- Phase 17: 5 plans so far, ~12 minutes total (Type system, layer utilities, knob renderer, dialogs, properties)

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **v1.0**: HTML/CSS rendering over Canvas for true WYSIWYG
- **v1.0**: Zustand for state management (proven lightweight pattern)
- **v1.0**: JSON project files for version control
- **v1.1**: DOMPurify at every render point (security-critical) ✓
- **v1.1 (14-01)**: Vitest as test framework (Vite-native, fast, modern)
- **v1.1 (14-01)**: Validate before sanitize - reject dangerous content rather than strip
- **v1.1 (14-01)**: DOMParser native API for SVG element counting and detection
- **v1.1 (14-02)**: isomorphic-dompurify for Node/browser compatibility
- **v1.1 (14-02)**: Strict allowlist (ALLOWED_TAGS) over USE_PROFILES for security
- **v1.1 (14-02)**: Block ALL external URLs (only fragment refs #id allowed)
- **v1.1 (14-03)**: SafeSVG component as single SVG rendering point (SEC-08)
- **v1.1 (14-03)**: Defense-in-depth re-sanitization before every render
- **v1.1 (14-03)**: react-hot-toast with dark theme for validation messages
- **v1.1 (14-04)**: Re-sanitization is silent with console.warn for tampering (non-disruptive)
- **v1.1 (14-04)**: CSP allows inline scripts/styles (needed for JUCE bridge and element styling)
- **v1.1 (14-04)**: Assets array is optional with default empty array (backward compatibility)
- **v1.1 (15-01)**: Normalized asset storage (flat array, derive categories on-the-fly) ✓
- **v1.1 (15-01)**: crypto.randomUUID() for asset IDs (built-in, faster than nanoid)
- **v1.1 (15-01)**: Assets included in undo history (user may undo accidental deletion)
- **v1.1 (15-02)**: react-dropzone for file upload with single file mode
- **v1.1 (15-02)**: URL.createObjectURL for preview with useEffect cleanup
- **v1.1 (15-02)**: Name field empty by default (forces intentional naming)
- **v1.1 (15-02)**: Preview at 96px max size in import dialog
- **v1.1 (15-03)**: 300ms debounce for asset search (balances responsiveness with performance)
- **v1.1 (15-03)**: All asset categories expanded by default (smaller library than palette)
- **v1.1 (15-03)**: 96px square thumbnails (w-24 h-24) for grid display
- **v1.1 (15-03)**: Default to Elements tab (primary use case is building UI)
- **v1.1 (15-04)**: Click-to-edit with blur-to-save for inline rename (standard UX pattern)
- **v1.1 (15-04)**: useAssetUsage hook co-located in DeleteAssetDialog (keeps logic close)
- **v1.1 (15-04)**: 'library-asset' drag type distinct from palette (enables different drop handling)
- **v1.1 (15-04)**: ImageElement.assetId for asset references (backward compatible with src)
- **v1.1 (16-01)**: 100x100 default size for SVG Graphic elements (icon-sized graphics)
- **v1.1 (16-01)**: Rotation handled by BaseElement, only flipH/flipV in renderer (avoid double-rotation)
- **v1.1 (16-01)**: Three-state placeholder UI (unassigned, valid, missing) for SVG Graphics
- **v1.1 (16-02)**: DOMParser for SVG viewBox extraction (synchronous, robust parsing)
- **v1.1 (16-02)**: Auto-resize to natural size when asset selected (prevents distortion)
- **v1.1 (16-02)**: Opacity displayed as 0-100% in UI, stored as 0-1 internally
- **v1.1 (16-03)**: Library asset drags create SvgGraphic elements (not Image elements)
- **v1.1 (16-03)**: Natural size from SVG viewBox used for library drops (prevents distortion)
- **v1.1 (16-04)**: Re-sanitize SVG before export for SEC-04 compliance
- **v1.1 (16-04)**: Combine rotation and flip transforms via regex replacement in export
- **v1.1 (16-04)**: object-fit: contain for SVG scaling in exported CSS (maintains aspect ratio)
- **v1.1 (16-04)**: Export missing assets as empty div with comment (graceful degradation)
- **v1.1 (16-05)**: Aspect ratio LOCKED by default for SVG Graphics (Shift unlocks) - prevents accidental distortion
- **v1.1 (16-05)**: 8x8 minimum size for SVG Graphics (vs 20 for other elements) - allows small icons
- **v1.1 (17-01)**: KnobStyleLayers with optional layer mappings (flexible SVG structure support)
- **v1.1 (17-01)**: ColorOverrides as sparse object (only store explicit overrides)
- **v1.1 (17-01)**: Knob styles included in undo/redo history (user may undo style deletion)
- **v1.1 (17-01)**: Optional styleId in KnobElementConfig (undefined = default CSS knob)
- **v1.1 (17-02)**: DOMParser/XMLSerializer for SVG layer manipulation (built-in, robust)
- **v1.1 (17-02)**: CSS.escape polyfill for Node.js test environment compatibility
- **v1.1 (17-02)**: Preserve 'none' values during color override (don't override transparent layers)
- **v1.1 (17-02)**: Layer detection via naming conventions (indicator, track, arc, glow, shadow)
- **v1.1 (17-03)**: DefaultKnobRenderer extracted for backward compatibility (styleId optional)
- **v1.1 (17-03)**: useMemo for expensive layer extraction operations (performance critical)
- **v1.1 (17-03)**: CSS transforms for layer animation (hardware-accelerated)
- **v1.1 (17-03)**: Glow intensity 30-100% (maintains subtle effect at minimum value)
- **v1.1 (17-04)**: 3-step flow for layer mapping (upload -> mapping -> config) - separates concerns
- **v1.1 (17-04)**: Auto-detect layers first, then allow manual adjustment (guided workflow)
- **v1.1 (17-04)**: Nested dialogs pattern (ManageKnobStylesDialog opens LayerMappingDialog)
- **v1.1 (17-04)**: Usage count warnings before delete (prevents accidental style removal)
- **v1.1 (17-05)**: Style selector at top of property panel (most impactful setting first)
- **v1.1 (17-05)**: Reset color overrides when changing style (prevents stale override confusion)
- **v1.1 (17-05)**: Hide CSS properties when SVG style applied (context-aware clean UX)
- **v1.1 (17-05)**: Show color inputs only for existing layers (avoid UI clutter)

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 14 readiness:**
- ✓ DOMPurify integration complete (isomorphic-dompurify installed)
- ✓ Core sanitization logic implemented and tested
- ✓ SafeSVG React component wrapping sanitizeSVG (14-03)
- ✓ Toast notification infrastructure ready (14-03)
- ✓ Re-sanitization on load and CSP on export (14-04)
- ✓ Phase 14 complete - all security boundaries covered
- TODO: ESLint rules needed to enforce SafeSVG component usage

**Phase 15 COMPLETE:**
- ✓ All 5 plans executed successfully
- ✓ Asset library fully functional with import, browse, drag-to-canvas
- ✓ Asset persistence and undo/redo support

**Phase 16 COMPLETE (Static SVG Graphics):**
- ✓ 16-01: SvgGraphicElementConfig type and SvgGraphicRenderer component
- ✓ 16-02: SvgGraphicProperties component and getSVGNaturalSize utility
- ✓ 16-03: Property panel wiring and palette integration
- ✓ 16-04: HTML/CSS export for SVG Graphics
- ✓ 16-05: Aspect ratio locking during resize
- Phase 16 complete - SVG Graphics fully functional

**Phase 17 IN PROGRESS (Interactive SVG Knobs):**
- ✓ 17-01: KnobStyle type system and KnobStylesSlice state management
- ✓ 17-02: SVG layer detection and manipulation utilities (with CSS.escape polyfill)
- ✓ 17-03: SVG knob renderer with layer-based animation and color overrides
- ✓ 17-04: Knob style library UI (LayerMappingDialog and ManageKnobStylesDialog)
- ✓ 17-05: Knob style selection UI in property panel with color overrides
- TODO: 17-06: Final integration (export, interactive behavior)
- Note: Performance with 50+ animated knobs should be good (useMemo + hardware acceleration)
- Note: Transform origin for non-circular SVGs may need adjustment (future enhancement)

## Session Continuity

Last session: 2026-01-26
Stopped at: Completed 17-05-PLAN.md (Knob Style Selection UI)
Resume file: None

---
*State initialized: 2026-01-25*
*Last updated: 2026-01-26 after 17-05 completion*
