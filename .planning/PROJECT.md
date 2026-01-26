# VST3 WebView UI Designer

## What This Is

A browser-based visual design tool for creating audio plugin user interfaces. Users drag-and-drop UI components (knobs, sliders, meters, buttons, containers, form controls) onto a canvas, configure their properties through a panel, and export working code for JUCE WebView2 plugins. Now supports custom SVG asset import for branded knob designs and decorative graphics with defense-in-depth security. Built for plugin developers who need to iterate visually instead of hand-coding SVG and CSS.

## Core Value

Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## Requirements

### Validated

- Knobs, Sliders, Buttons, Meters, Labels, Images (core 6 element types) - v1.0
- Containers: Panel, Frame, Group Box, Collapsible - v1.0
- Form controls: Dropdown, Checkbox, Radio Group, Text Field - v1.0
- Audio displays: dB Display, Frequency Display, GR Meter - v1.0
- Placeholders: Waveform, Oscilloscope, Modulation Matrix, Preset Browser - v1.0
- Decorative: Rectangle, Line - v1.0
- Range Slider (dual-thumb) - v1.0
- Three-panel layout: Element Palette (left), Canvas (center), Property Panel (right) - v1.0
- Canvas with configurable dimensions and background (color, gradient, or image) - v1.0
- Drag elements from palette onto canvas - v1.0
- Position elements: drag to move, handles to resize, shift-drag constrained, arrow keys nudge - v1.0
- Property panel shows all configurable options for selected element - v1.0
- Custom SVG import with naming conventions (indicator, thumb, track, fill, glow) - v1.0
- Preview mode: HTML export with mock JUCE for standalone testing - v1.0
- Export: JUCE WebView2 (HTML/CSS/JS + C++ snippets with dynamic bridge) - v1.0
- Save/load projects as JSON files with Zod validation - v1.0
- Dark theme UI - v1.0
- Undo/redo with 50+ action history - v1.0
- Copy/paste with 20px offset - v1.0
- Snap to grid - v1.0
- Element locking (individual and lock-all mode) - v1.0
- Font selection (Inter, Roboto, Roboto Mono embedded) - v1.0
- SVG Design Mode for layer assignment - v1.0
- Template import from existing JUCE projects - v1.0
- Defense-in-depth SVG security (sanitize at upload, load, render, export) - v1.1
- Central asset library with import, categories, and drag-to-canvas - v1.1
- SVG Graphic element type with aspect ratio locking - v1.1
- Interactive SVG knobs with layer mapping and reusable styles - v1.1
- Per-instance color overrides for knob styles - v1.1
- SVGO optimization toggle for export - v1.1
- Responsive scaling CSS/JS in exported bundles - v1.1
- Browser preview for export verification - v1.1
- JUCE integration README in exported bundle - v1.1

### Active

**v1.2 Focus: Complete Element Taxonomy**

All 78 remaining elements from docs/SPECIFICATION.md:

**Rotary Controls (5 remaining):**
- [ ] Endless Encoder (360° continuous rotation)
- [ ] Stepped Knob (discrete detent positions)
- [ ] Center-Detented Knob (snaps to center)
- [ ] Concentric Dual Knob (nested controls)
- [ ] Dot Indicator Knob (minimal indicator style)

**Linear Controls (5 remaining):**
- [ ] Bipolar Slider (center-zero)
- [ ] Crossfade Slider (A/B balance)
- [ ] Notched Slider (detent positions)
- [ ] Arc Slider (curved path)
- [ ] Multi-Slider (parallel sliders for EQ/multi-band)

**Buttons & Switches (7 remaining):**
- [ ] Icon Button (toolbar style)
- [ ] Toggle Switch (iOS-style slide)
- [ ] Rocker Switch (3-position up/center/down)
- [ ] Rotary Switch (vintage rotating selector)
- [ ] Kick Button (momentary with animation)
- [ ] Segment Button (multi-segment mode selection)
- [ ] Power Button (on/off with indicator)

**Value Displays (8 remaining):**
- [ ] Numeric Display (raw number)
- [ ] Time Display (ms/s/bars)
- [ ] Percentage Display (0-100%)
- [ ] Ratio Display (compression ratio)
- [ ] Note Display (musical note)
- [ ] BPM Display (tempo)
- [ ] Editable Display (double-click to edit)
- [ ] Multi-Value Display (stacked values)

**LED Indicators (6 new):**
- [ ] Single LED (on/off)
- [ ] Bi-Color LED (green/red)
- [ ] Tri-Color LED (off/yellow/red)
- [ ] LED Array (row of LEDs)
- [ ] LED Ring (around knob)
- [ ] LED Matrix (grid pattern)

**Meters (13 remaining):**
- [ ] RMS Meter
- [ ] VU Meter
- [ ] PPM Type I (IEC 60268-10)
- [ ] PPM Type II (BBC standard)
- [ ] True Peak Meter
- [ ] LUFS Momentary
- [ ] LUFS Short-term
- [ ] LUFS Integrated
- [ ] K-12 Meter
- [ ] K-14 Meter
- [ ] K-20 Meter
- [ ] Correlation Meter
- [ ] Stereo Width Meter

**Visualizations (10 remaining):**
- [ ] Scrolling Waveform
- [ ] Spectrum Analyzer
- [ ] Spectrogram
- [ ] Goniometer
- [ ] Vectorscope
- [ ] EQ Curve
- [ ] Compressor Curve
- [ ] Envelope Display
- [ ] LFO Display
- [ ] Filter Response

**Selection & Navigation (8 remaining):**
- [ ] Multi-Select Dropdown
- [ ] Combo Box
- [ ] Tab Bar
- [ ] Menu Button
- [ ] Breadcrumb
- [ ] Stepper
- [ ] Tag Selector
- [ ] Tree View

**Containers & Decorative (3 remaining):**
- [ ] Tooltip
- [ ] Spacer
- [ ] Window Chrome

**Specialized Audio (12 remaining):**
- [ ] Piano Keyboard
- [ ] Drum Pad
- [ ] Pad Grid
- [ ] Step Sequencer
- [ ] XY Pad
- [ ] Wavetable Display
- [ ] Harmonic Editor
- [ ] Envelope Editor
- [ ] Sample Display
- [ ] Loop Points
- [ ] Patch Bay
- [ ] Signal Flow

**UX Improvements:**
- [ ] Visible undo/redo buttons in toolbar (near logo)
- [ ] Keyboard shortcut detection for non-US layouts (QWERTZ support)

### Out of Scope

- User accounts / authentication - personal tool, no cloud
- Real-time collaboration - single user
- Electron packaging - browser-based for v1
- Monetization features - may open-source later
- Full 108-element taxonomy - v1 focuses on core controls, expand later
- Mobile support - desktop browser workflow
- Parent-child element hierarchy - containers are visual-only in v1
- Rotation property for Knobs/Meters - not needed for these element types

## Context

**Current State:**
- v1.1 SVG Import System shipped (2026-01-26)
- v1.0 MVP shipped (2026-01-25)
- ~540 files, ~120,000 lines TypeScript
- 23 element types supported (added SVG Graphic in v1.1)
- Tech stack: React 18, Vite, Zustand, @dnd-kit, Tailwind CSS, SVGO, DOMPurify

**Problem solved:** No visual design tool existed for JUCE WebView2 plugin UIs. Previous workflow was hand-coding SVG/HTML/CSS, tweaking values, rebuilding, loading in DAW, checking, repeating. Iteration took minutes instead of seconds. WebSliderRelay boilerplate was error-prone. v1.1 adds custom branding support via SVG import.

**Prior work:** Complete specification exists in `docs/SPECIFICATION.md` with 108 element types across 10 categories.

## Constraints

- **Tech stack**: React 18, TypeScript, Vite, Zustand, @dnd-kit, Tailwind CSS
- **Dark theme**: Required for audio plugin development tools
- **Browser-based**: No Electron for v1
- **JUCE WebView2 target**: Export must work with JUCE 8's WebView2 integration
- **Reference spec**: `docs/SPECIFICATION.md` is source of truth for element properties

## Cross-Project Integration

This designer exports code consumed by:
- **EFXvst** - Audio effect VST3 template
- **INSTvst** - Instrument VST3 template

See `.planning/INTEGRATION.md` for detailed integration documentation.

### Integration Points

- Template system (`templates/*.json`) must match VST3 UIs
- Export format must remain compatible with JUCE WebView2
- Element types affect C++ binding code generation
- Breaking changes require updates in both VST3 repos

## Technical Architecture

### JavaScript Export - JUCE Event-Based Pattern

**Last Updated:** January 25, 2026
**Status:** Production-ready (tested in EFXvst and INSTvst)

The designer exports a **dynamic function wrapper system** for JUCE WebView2 communication:

1. **Dynamic Function Wrappers** - Creates Promise-based wrappers for all JUCE native functions
2. **Integer Result IDs** - Sequential integer (not Math.random) for reliable event matching
3. **Polling Initialization** - Up to 5 seconds for JUCE bridge to become available
4. **Fire-and-Forget with Error Handling** - Error suppression for smooth UI

Pattern discovered and refined January 24-25, 2026 through extensive debugging.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Core controls first for v1 | Knobs, sliders, buttons, meters cover 80% of plugin UIs | Good - achieved coverage goal |
| SVG naming conventions over region drawing | Users already name layers in Figma/Illustrator; keeps workflow fast | Good - intuitive UX |
| JSON project files | Simple, version-controllable, human-readable | Good - works well |
| Zustand over Redux | Lightweight, less boilerplate, sufficient for single-user tool | Good - clean architecture |
| @dnd-kit over react-dnd | Modern API, better touch support, active maintenance | Good - reliable drag-drop |
| HTML/CSS rendering over Canvas | True WYSIWYG - export matches design exactly | Good - key differentiator |
| Dual export modes | JUCE bundle vs HTML preview serves different use cases | Good - flexible workflow |
| WOFF2 font embedding | Offline VST3 plugins need self-contained fonts | Good - professional output |
| Visual-only containers | Avoids store architecture complexity for v1 | Acceptable - noted as tech debt |
| Defense-in-depth SVG sanitization | Security critical - sanitize at 4 points | Good - comprehensive XSS protection |
| DOMPurify with strict allowlist | Allowlist safer than USE_PROFILES | Good - precise control |
| Normalized asset storage | Flat array with derived categories | Good - efficient lookups |
| 3-step knob import flow | Separates upload, mapping, config | Good - guided workflow |
| Aspect ratio locked by default | Prevents accidental distortion | Good - user expectation |
| SVGO with safe defaults | Preserve viewBox, cleanupIds: false | Good - no visual regressions |
| Optimization enabled by default | Better default experience | Good - smaller bundles |

## Current Milestone: v1.2 Complete Element Taxonomy

**Goal:** Implement all 78 remaining UI elements from the specification plus UX improvements for undo/redo visibility and keyboard layout support.

**Target features:**
- All rotary control variants (endless encoder, stepped, center-detented, concentric, dot indicator)
- All linear control variants (bipolar, crossfade, notched, arc, multi-slider)
- All button/switch types (icon, toggle switch, rocker, rotary switch, kick, segment, power)
- All value displays (numeric, time, percentage, ratio, note, BPM, editable, multi-value)
- LED indicators (single, bi-color, tri-color, array, ring, matrix)
- Professional meters (RMS, VU, PPM, True Peak, LUFS, K-meters, correlation, stereo width)
- Audio visualizations (spectrum, spectrogram, goniometer, vectorscope, EQ/compressor curves, envelope/LFO displays)
- Navigation components (multi-select dropdown, combo box, tab bar, menu, breadcrumb, stepper, tag selector, tree view)
- Remaining containers (tooltip, spacer, window chrome)
- Specialized audio elements (piano keyboard, drum pad, pad grid, step sequencer, XY pad, wavetable, harmonic editor, envelope editor, sample display, loop points, patch bay, signal flow)
- Visible undo/redo buttons in toolbar
- QWERTZ keyboard layout support

---
*Last updated: 2026-01-26 after v1.2 milestone started*
