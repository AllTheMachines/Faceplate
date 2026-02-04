# Research Summary: v0.10.0 SVG Styling for Visual Controls

**Project:** Faceplate
**Features:** SVG styling extension for 19 visual controls
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

The v0.10.0 SVG Styling milestone extends Faceplate's proven KnobStyle system to 19 additional visual controls (sliders, buttons, switches, meters). The critical finding is that **no new dependencies are required** — the existing stack (isomorphic-dompurify, svgo, svgson, zustand, zod) fully supports this extension. The work is purely TypeScript/React component development, building on established patterns in `knobLayers.ts`, `KnobRenderer.tsx`, and `knobStylesSlice.ts`.

The recommended approach is **category-based architecture** rather than per-element-type schemas. Controls fall into 5 categories that share layer patterns: rotary (knobs), linear (sliders), arc (arc slider), button (buttons/switches), and meter. This reduces the type system from 19 potential schemas to 5, making maintenance tractable. The unified `ElementStyle` type replaces `KnobStyle` with a `category` discriminator, and a single `elementStylesSlice` manages all styles.

The highest-risk area is **breaking existing knob functionality during migration**. The mitigation is additive changes: add `elementStyles` alongside `knobStyles`, implement migration functions, and maintain backward compatibility for at least one version cycle. Secondary risks include performance degradation with many styled elements (mitigate via memoization) and export code generation complexity (mitigate via strategy pattern per category).

## Key Findings

### Stack Additions: None Required

| Feature | Solution | Status |
|---------|----------|--------|
| SVG sanitization | isomorphic-dompurify via SafeSVG | Existing |
| SVG optimization | svgo v4.0.0 | Existing |
| Layer parsing | DOM APIs / svgson v5.3.1 | Existing |
| State management | Zustand slice pattern | Existing |
| Schema validation | Zod v4.3.6 | Existing |
| Layer detection | knobLayers.ts service | Extend |
| Color overrides | applyColorOverride() | Reuse directly |

All dependencies are current versions. The existing `knobLayers.ts` service is control-agnostic — functions like `extractLayer()` and `applyColorOverride()` work on any SVG content, not just knobs.

### Layer Structures by Category

| Category | Controls | Required Layers | Animation |
|----------|----------|-----------------|-----------|
| Rotary | Knob, SteppedKnob, CenterDetentKnob, DotIndicatorKnob | indicator, track | rotate() |
| Linear | Slider, RangeSlider, BipolarSlider, CrossfadeSlider, NotchedSlider, MultiSlider | thumb, track | translateX/Y() |
| Arc | ArcSlider | thumb, track, arc | rotate() on curved path |
| Button | Button, IconButton, PowerButton, ToggleSwitch, RockerSwitch, SegmentButton | normal, pressed | opacity/visibility swap |
| Meter | Meter variants | background, fill, peak | clip-path / scaleY() |

Common optional layers across all categories: glow, shadow.

### Architecture Evolution

**From:** `knobStyles` array with `KnobStyleLayers` (indicator, track, arc, glow, shadow)

**To:** `elementStyles` array with `StyleCategory` discriminator:

```typescript
interface ElementStyle {
  id: string
  name: string
  category: 'rotary' | 'linear' | 'arc' | 'button' | 'meter'
  svgContent: string
  layers: CategorySpecificLayers
  config: CategorySpecificConfig
}
```

Key changes:
- Single `elementStylesSlice` replaces `knobStylesSlice`
- `getStylesByCategory()` getter filters by type
- Detection service becomes `detectElementLayers(svg, category)`
- Each renderer conditionally delegates to styled variant

### High-Risk Pitfalls

| Pitfall | Likelihood | Prevention |
|---------|------------|------------|
| **Breaking existing knob projects** | HIGH if careless | Additive migration: keep `knobStyles`, add `elementStyles`, auto-migrate on load |
| **Type system explosion (19 schemas)** | HIGH if naive | Category-based architecture (5 schemas, not 19) |
| **Export code generation bugs** | MEDIUM | Strategy pattern per category with comprehensive preview testing |
| **Performance with 50+ styled elements** | MEDIUM | Aggressive memoization, layer caching, profiling |
| **Project migration data loss** | MEDIUM | Schema version 2.1.0 with explicit migration function |

## Implementation Order

Based on dependencies, risk minimization, and incremental value delivery:

### Phase 1: Type Foundation
**Rationale:** Types are the foundation; all other work depends on these.
**Delivers:** ElementStyle type system, elementStylesSlice, migration function
**Features:** None user-visible yet
**Avoids:** #2 Type explosion (design category system upfront)
**Research needed:** No (patterns clear from existing code)

### Phase 2: Layer Detection Generalization
**Rationale:** Services are used by both store and renderers.
**Delivers:** Unified `detectElementLayers()` with category-based patterns
**Features:** Auto-detection for all 5 categories
**Avoids:** #3 Detection fragmentation (single parameterized algorithm)
**Research needed:** No (keyword expansion is straightforward)

### Phase 3: Slider Styling (First Control Extension)
**Rationale:** Sliders are most similar to knobs (continuous value, track/thumb), validates the pattern.
**Delivers:** StyledSliderRenderer, slider style assignment UI
**Features:** SVG-styled sliders with color overrides
**Avoids:** #1 Breaking knobs (slider is parallel path, doesn't touch knob code)
**Research needed:** No (follows KnobRenderer pattern exactly)

### Phase 4: Button + Switch Styling
**Rationale:** Both are discrete state elements (pressed/not, on/off), share animation model.
**Delivers:** StyledButtonRenderer, StyledToggleSwitchRenderer
**Features:** SVG-styled buttons/switches with state layers
**Avoids:** #9 Animation mismatch (document opacity/visibility strategy upfront)
**Research needed:** Possibly minimal research on state transition animations

### Phase 5: Meter Styling
**Rationale:** Most complex requirements (segments, zones, peak hold), built last.
**Delivers:** StyledMeterRenderer with fill/peak animation
**Features:** SVG-styled meters with value-driven fill
**Avoids:** None critical (meter-specific patterns)
**Research needed:** Possibly research for segment grid generation

### Phase 6: Export + Schema Migration
**Rationale:** Once all renderers work, export and schema finalization.
**Delivers:** Updated htmlGenerator/codeGenerator, v2.1.0 schema migration
**Features:** Complete export of all styled elements
**Avoids:** #4 Migration data loss, #5 Export generation bugs
**Research needed:** No (patterns established)

### Phase 7: UI Polish + Help
**Rationale:** Polish after core functionality complete.
**Delivers:** Category filter in Style Library, documentation updates
**Features:** Improved discoverability, consistent UI
**Avoids:** #7 UI inconsistency, #12 Missing help
**Research needed:** No

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking knob projects | LOW (if careful) | HIGH | Additive migration, comprehensive tests before starting |
| Type complexity | LOW (if category-based) | MEDIUM | 5 categories, not 19 types |
| Performance degradation | MEDIUM | MEDIUM | Memoization, caching, profiling benchmark |
| Export bugs | MEDIUM | MEDIUM | Strategy pattern, preview testing checklist |
| Migration data loss | LOW | HIGH | Explicit migration function, keep old field |
| UI inconsistency | LOW | LOW | Shared ElementStyleSection component |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified via npm registry, all deps current, no additions needed |
| Features | HIGH | Layer patterns well-documented across industry, consistent with existing knob system |
| Architecture | HIGH | Direct extension of proven KnobStyle pattern, code review confirms reusability |
| Pitfalls | HIGH | Based on direct codebase analysis + established TypeScript/React refactoring patterns |

**Overall confidence:** HIGH

### Gaps to Address

- **Switch layer patterns less standardized:** May need user testing to validate naming conventions
- **Meter segment generation:** Feature marked as differentiator; consider deferring to v0.11.0 if complex
- **Multi-position switch rendering:** RotarySwitch (12 positions) may need additional animation research
- **Performance baseline:** Need to establish 100-element benchmark before starting

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/types/knobStyle.ts`, `src/services/knobLayers.ts`, `src/store/knobStylesSlice.ts`
- npm registry verification (2026-02-04)

### Secondary (MEDIUM confidence)
- [JUCE Look and Feel Tutorial](https://docs.juce.com/master/tutorial_look_and_feel_customisation.html)
- [Audio-UI Professional Audio GUI Elements](https://www.audio-ui.com/)
- [Open UI Switch Explainer](https://open-ui.org/components/switch.explainer/)
- [Khan Academy SVG Performance](https://www.crmarsh.com/svg-performance/)

### Tertiary (LOW confidence)
- [VST GUI Pro Figma Plugin](https://www.figma.com/community/plugin/1563956754324486889/vst-gui-pro)
- Community forum discussions on filmstrip export

---

**Research completed:** 2026-02-04
**Ready for requirements:** Yes
