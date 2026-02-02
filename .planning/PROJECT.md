# VST3 WebView UI Designer

## What This Is

A browser-based visual design tool for creating audio plugin user interfaces. Users drag-and-drop UI components (100+ element types including knobs, sliders, meters, buttons, containers, visualizations, curves) onto a canvas, configure their properties through a panel, and export working code for JUCE WebView2 plugins. Supports custom SVG asset import for branded designs, custom font management with directory scanning, and defense-in-depth security. Built for plugin developers who need to iterate visually instead of hand-coding SVG and CSS.

## Core Value

Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## Requirements

### Validated

**v1.0 MVP:**
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

**v1.1 SVG Import System:**
- Defense-in-depth SVG security (sanitize at upload, load, render, export) - v1.1
- Central asset library with import, categories, and drag-to-canvas - v1.1
- SVG Graphic element type with aspect ratio locking - v1.1
- Interactive SVG knobs with layer mapping and reusable styles - v1.1
- Per-instance color overrides for knob styles - v1.1
- SVGO optimization toggle for export - v1.1
- Responsive scaling CSS/JS in exported bundles - v1.1
- Browser preview for export verification - v1.1
- JUCE integration README in exported bundle - v1.1

**v1.2 Complete Element Taxonomy:**
- Architecture refactoring with registry pattern for scalable element management - v1.2
- 78 new element types across 10 categories - v1.2
- Rotary controls: Stepped Knob, Center-Detented Knob, Dot Indicator Knob - v1.2
- Linear controls: Bipolar Slider, Crossfade Slider, Notched Slider, Arc Slider, Multi-Slider - v1.2
- Buttons & Switches: Icon Button, Toggle Switch, Rocker Switch, Rotary Switch, Kick Button, Segment Button, Power Button - v1.2
- Value Displays: Numeric, Time, Percentage, Ratio, Note, BPM, Editable, Multi-Value - v1.2
- LED Indicators: Single, Bi-Color, Tri-Color, Array, Ring, Matrix - v1.2
- Professional Meters: RMS, VU, PPM Type I/II, True Peak, LUFS (Momentary/Short-term/Integrated), K-12/14/20, Correlation, Stereo Width - v1.2
- Visualizations: Scrolling Waveform, Spectrum Analyzer, Spectrogram, Goniometer, Vectorscope - v1.2
- Interactive Curves: EQ Curve, Compressor Curve, Envelope Display, LFO Display, Filter Response - v1.2
- Navigation: Multi-Select Dropdown, Combo Box, Tab Bar, Menu Button, Breadcrumb, Stepper, Tag Selector, Tree View - v1.2
- Containers: Tooltip, Horizontal Spacer, Vertical Spacer, Window Chrome - v1.2
- Specialized Audio: Piano Keyboard, Drum Pad, Pad Grid, Step Sequencer, XY Pad, Wavetable Display, Harmonic Editor, Envelope Editor, Sample Display, Loop Points, Patch Bay, Signal Flow - v1.2
- Built-in icon system with 35 audio plugin icons - v1.2
- Visible undo/redo buttons in toolbar - v1.2
- QWERTZ keyboard layout support - v1.2

**v1.3 Workflow & Protection:**
- Undo/Redo History Panel with visual state distinction and time-travel navigation - v1.3
- Unsaved changes protection with browser beforeunload warning - v1.3
- Adjustable snap grid with keyboard toggle (Ctrl+G) - v1.3
- Document title asterisk and "Last saved: X ago" indicator - v1.3

**v1.4 Container Editing System:**
- Container Element Editor with dedicated interior editing interface - v1.4
- "Edit Contents" button for all editable container types - v1.4
- Container-in-container support with breadcrumb navigation - v1.4
- Custom scrollbar system with 6 configurable style options - v1.4
- Export generates correct CSS overflow properties - v1.4

**v1.5 Export & Asset Management:**
- SVG export with meaningful layer names for element re-import workflow - v1.5
- Consistent layer naming conventions (LAYER_CONVENTIONS) - v1.5
- Auto-match layers on import with validation and error/warning feedback - v1.5
- User-selected fonts folder via File System Access API - v1.5
- IndexedDB persistence for font directory and loaded fonts - v1.5
- Custom font dropdown with preview (fonts shown in their typeface) - v1.5
- Export bundles only used fonts with base64 embedding for custom fonts - v1.5

**v1.6 Multi-Window System:**
- Multiple windows per project with independent dimensions and backgrounds - v1.6
- Window types: 'release' (always exported) and 'developer' (optional export) - v1.6
- Window tabs UI with rename, delete, duplicate, type toggle - v1.6
- Window properties panel (name, type, width, height, background) - v1.6
- Copy/paste elements between windows - v1.6
- Button navigation action to switch between windows - v1.6
- Multi-window browser preview with tab navigation - v1.6
- Multi-window export bundle with separate folders per window - v1.6
- Project serialization v2.0.0 with windows array and migration from v1.x - v1.6
- Per-window viewport state preservation when switching - v1.6

**v1.9 Layers & Help System:**
- Folder export writes directly to selected folder for single-window projects - v1.9
- Container editor multi-select drag moves all selected elements together - v1.9
- Layers system with visibility/lock/z-order control (like Photoshop/Figma) - v1.9
- User-created layers with custom names and colors - v1.9
- Layer visibility toggle (eye icon) hides elements from canvas - v1.9
- Layer lock toggle prevents move/resize of elements - v1.9
- Drag-to-reorder layers controls z-order on canvas - v1.9
- Context menu "Move to Layer" for reassigning elements - v1.9
- Help buttons on Properties Panel sections with dark-themed popup windows - v1.9
- F1 keyboard shortcut opens contextual help for selected element - v1.9
- 102 element types documented with comprehensive help content - v1.9

### Active

**v1.10 Element Bug Fixes (20 requirements):**
- Navigation Elements: Tree View, Tag Selector, Combo Box, Breadcrumb fixes
- Sliders: ASCII, Arc, Notched, Bipolar Slider fixes
- Curves: EQ, Compressor, Envelope, LFO, Filter Response fixes
- Buttons/Knobs: Segment Button, Kick Button, Stepped Knob fixes
- Displays/LEDs: Note Display, Bicolor LED fixes
- Core UI: Color Picker, Related Topics links fixes

### Out of Scope

- User accounts / authentication - personal tool, no cloud
- Real-time collaboration - single user
- Electron packaging - browser-based for v1
- Monetization features - may open-source later
- Mobile support - desktop browser workflow
- Rotation property for Knobs/Meters - not needed for these element types

## Context

**Current State:**
- v1.9 Layers & Help System shipped (2026-01-29)
- v1.8 Bug Fixes & Improvements shipped (2026-01-29)
- v1.7 Parameter Sync shipped (2026-01-28)
- v1.6 Multi-Window System shipped (2026-01-28)
- v1.5 Export & Asset Management shipped (2026-01-27)
- v1.4 Container Editing System shipped (2026-01-27)
- v1.3 Workflow & Protection shipped (2026-01-27)
- v1.2 Complete Element Taxonomy shipped (2026-01-27)
- v1.1 SVG Import System shipped (2026-01-26)
- v1.0 MVP shipped (2026-01-25)
- ~62,000 lines TypeScript
- 102+ element types supported with comprehensive help documentation
- Tech stack: React 18, Vite, Zustand, @dnd-kit, Tailwind CSS, SVGO, DOMPurify, opentype.js, react-arborist
- GitHub Issues integration via `/github` skill

**Problem solved:** No visual design tool existed for JUCE WebView2 plugin UIs. Previous workflow was hand-coding SVG/HTML/CSS, tweaking values, rebuilding, loading in DAW, checking, repeating. Iteration took minutes instead of seconds.

**10 milestones shipped** across 43 phases, 177 plans in 7 days (2026-01-23 to 2026-01-29).

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

### Font Management System

**Added:** v1.5

- User-selected fonts folder via File System Access API
- IndexedDB persistence for directory handle and font data
- opentype.js for font metadata extraction
- Custom fonts embedded as base64 in export
- Built-in fonts use file references
- Size warnings: >500KB per font, >2MB total

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
| Defense-in-depth SVG sanitization | Security critical - sanitize at 4 points | Good - comprehensive XSS protection |
| Registry pattern for elements | Scales gracefully from 25 to 100+ element types | Good - eliminated switch statements |
| IndexedDB for font storage | Offline access, faster than re-scanning, persists across sessions | Good - seamless UX |
| Base64 for custom fonts in export | Self-contained bundles for offline JUCE WebView2 | Good - no external dependencies |
| Layer naming conventions for SVG | Re-import workflow simplified with automatic matching | Good - intuitive roundtrip |
| Multi-window architecture | Projects can have multiple windows (main, developer, settings) | Good - flexible plugin UIs |
| Window type separation | Release vs developer windows allows debug UIs without shipping them | Good - professional workflow |
| Button navigation actions | Buttons can navigate between windows in exported bundle | Good - enables multi-page UIs |

| Layers system with react-arborist | Tree-based reordering with drag-drop | Good - intuitive layer management |
| Blob URLs for help popups | Self-contained HTML windows without external files | Good - no file dependencies |
| 102 element types documented | Comprehensive help coverage for all UI elements | Good - complete documentation |
| F1 contextual help | Element-specific help when one selected, general otherwise | Good - context-aware UX |

---
*Last updated: 2026-02-02 after v1.10 milestone definition*
