# Issues for v1.1 Milestone

Captured: 2026-01-24
Source: UAT feedback session

---

## Priority 1: UI/UX Bugs — ALL FIXED (Phase 11)

| Bug | Issue | Fixed In |
|-----|-------|----------|
| BUG-01 | Knob rotation field removed | 11-01 |
| BUG-02 | Slider consolidated (V/H → orientation prop) | 11-04 |
| BUG-03 | Momentary Button pressed state clickable | 11-01 |
| BUG-04 | Toggle Button pressed state clickable | 11-01 |
| BUG-05 | Button consolidated (momentary/toggle → behavior prop) | 11-04 |
| BUG-06 | Meter orientation toggles both directions | 11-01 |
| BUG-07 | Meter rotation field removed | 11-01 |
| BUG-08 | Font weight shows named options (Regular, Bold, etc.) | 11-02 |
| BUG-09 | Image file picker with base64 embedding | 11-03 |

---

## Priority 2: Template Import Workflow

### ~~FEAT-01: Template import produces wrong elements~~ — OUT OF SCOPE
**Resolution:** Designer only imports its own exported projects, not arbitrary WebView2 code.
External WebView2 projects use completely different structures — parsing them is unreliable.
Users should create new projects from built-in templates instead.

---

### ~~FEAT-02: New template workflow~~ — ALREADY EXISTS
**Resolution:** Built-in templates already exist (Effect Starter, Instrument Starter).
Load via File menu or template panel. No wizard needed for v1.

---

### ~~FEAT-03: Convert existing VST3 UI designs~~ — OUT OF SCOPE
**Resolution:** Not supporting import of external WebView2 projects.
Users start fresh with this designer's templates and export clean code.

---

## Priority 3: Element Consolidation

### ~~REFACTOR-01: Consolidate element types~~ — FIXED (Phase 11)
**Resolution:** Palette now shows consolidated element types:
- Knob
- Slider (orientation: vertical/horizontal)
- Button (behavior: momentary/toggle)
- Meter (orientation: vertical/horizontal)
- Label
- Image

---

### REFACTOR-02: Rethink Value Display — OPEN (v1.1+)
**Issue:** Value Display as separate element vs built-in to controls.

**Options for future:**
1. Add optional value label to Knob, Slider, Meter
2. Convert Value Display to generic "Text Field" with static/dynamic modes
3. Keep both - built-in labels + standalone dynamic text

**Status:** Deferred. Current Label element handles static text. Dynamic value display can be added later.

---

### BUG-10: Slider line glitches in VST3/WebView2 — OPEN (v1.1+)
**Issue:** Sliders show small visual line glitches when moving knobs in VST3 WebView2 environment.
**Severity:** Minor (cosmetic)
**Environment:** VST3/WebView2 only (not visible in HTML preview)
**Status:** Pre-existing issue, needs investigation. Likely a WebView2 rendering artifact or CSS repaint issue.

---

## Summary

**v1.0 Status:** All Priority 1 bugs fixed. Core functionality complete.

**Scope clarification:**
- Designer creates new projects from scratch or built-in templates
- Designer exports to JUCE WebView2 bundle
- No import of external/arbitrary WebView2 projects (out of scope)

---

*Last updated: 2026-01-25*
