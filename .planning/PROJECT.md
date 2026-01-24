# VST3 WebView UI Designer

## What This Is

A browser-based visual design tool for creating audio plugin user interfaces. Users drag-and-drop SVG-based UI components (knobs, sliders, meters, buttons) onto a canvas, configure their properties through a panel, and export working code for JUCE WebView2 plugins. Built for a plugin developer who needs to iterate visually instead of hand-coding SVG and CSS.

## Core Value

Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Three-panel layout: Element Palette (left), Canvas (center), Property Panel (right)
- [ ] Canvas with configurable dimensions and background (color, gradient, or image)
- [ ] Drag elements from palette onto canvas
- [ ] Position elements: drag to move, handles to resize, shift-drag constrained, arrow keys nudge
- [ ] Property panel shows all configurable options for selected element
- [ ] Core element types: Knobs, Sliders, Buttons, Meters (per SPECIFICATION.md)
- [ ] Custom SVG import with naming conventions (indicator, thumb, track, fill, glow)
- [ ] Import preview: "Found: indicator (will rotate), track (static)"
- [ ] Preview mode: interact with controls to verify behavior
- [ ] Export: JUCE WebView2 (HTML/CSS/JS + C++ boilerplate with WebSliderRelay bindings)
- [ ] Export: HTML only (standalone preview)
- [ ] Export: Single element code
- [ ] Save/load projects as JSON files
- [ ] Dark theme UI

### Out of Scope

- User accounts / authentication — personal tool, no cloud
- Real-time collaboration — single user
- Electron packaging — browser-based for v1
- Monetization features — may open-source later
- Full 108-element taxonomy — v1 focuses on core controls, expand later
- Mobile support — desktop browser workflow

## Context

**Problem:** No visual design tool exists for JUCE WebView2 plugin UIs. Current workflow is hand-coding SVG/HTML/CSS, tweaking values, rebuilding, loading in DAW, checking, repeating. Iteration takes minutes instead of seconds. WebSliderRelay boilerplate is error-prone.

**Existing tools don't fit:**
- WebKnobMan outputs bitmap filmstrips (wrong format)
- Generic web builders don't have audio controls
- Figma can design but doesn't export working code with interaction logic

**Prior work:** Complete specification exists in `docs/SPECIFICATION.md` with:
- 108 element types across 10 categories
- Detailed property interfaces (TypeScript)
- JUCE WebView2 integration patterns
- Rendering code examples
- Interaction patterns

**SVG naming conventions:** Custom SVGs use layer names to identify moving parts:
- `indicator` or `pointer` — rotates (knobs)
- `thumb` — moves (sliders)
- `track` — static background
- `fill` — grows/shrinks with value
- `glow` or `highlight` — reactive elements

## Constraints

- **Tech stack**: React 18, TypeScript, Vite, Zustand, @dnd-kit, Tailwind CSS — chosen for fast iteration and ecosystem fit
- **Dark theme**: Required — standard for audio plugin development tools
- **Browser-based**: No Electron for v1 — keep deployment simple
- **JUCE WebView2 target**: Export must work with JUCE 8's WebView2 integration, WebSliderRelay API
- **Reference spec**: `docs/SPECIFICATION.md` is source of truth for element properties

## Cross-Project Integration

This designer exports code consumed by:
- **EFXvst3** - Audio effect VST3 template
- **INSTvst3** - Instrument VST3 template

See `.planning/INTEGRATION.md` for detailed integration documentation.

### Integration Points

- Template system (`templates/*.json`) must match VST3 UIs
- Export format must remain compatible with JUCE WebView2
- Element types affect C++ binding code generation
- Breaking changes require updates in both VST3 repos

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Core controls first for v1 | Knobs, sliders, buttons, meters cover 80% of plugin UIs | — Pending |
| SVG naming conventions over region drawing | Users already name layers in Figma/Illustrator; keeps workflow fast | — Pending |
| JSON project files | Simple, version-controllable, human-readable | — Pending |
| Zustand over Redux | Lightweight, less boilerplate, sufficient for single-user tool | — Pending |
| @dnd-kit over react-dnd | Modern API, better touch support, active maintenance | — Pending |

---
*Last updated: 2025-01-23 after initialization*
