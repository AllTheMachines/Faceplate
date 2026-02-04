---
phase: 21-buttons-switches
plan: 01
status: complete
started: 2026-01-26T15:49:18Z
completed: 2026-01-26T15:54:51Z
duration: 5m33s

subsystem: element-types
tags: [buttons, icons, controls, svg]

dependency_graph:
  requires: [phase-20]
  provides: [BuiltInIcon, IconButtonRenderer, KickButtonRenderer, ToggleSwitchRenderer, PowerButtonRenderer]
  affects: [phase-21-02, phase-21-03]

tech_stack:
  added: []
  patterns: [icon-enum-with-svg-map, instant-state-transitions]

key_files:
  created:
    - src/utils/builtInIcons.ts
    - src/components/elements/renderers/controls/IconButtonRenderer.tsx
    - src/components/elements/renderers/controls/KickButtonRenderer.tsx
    - src/components/elements/renderers/controls/ToggleSwitchRenderer.tsx
    - src/components/elements/renderers/controls/PowerButtonRenderer.tsx
  modified:
    - src/types/elements/controls.ts
    - src/components/elements/renderers/controls/index.ts
    - src/components/elements/renderers/index.ts
    - src/services/export/cssGenerator.ts
    - src/services/export/htmlGenerator.ts

decisions:
  - key: icon-svg-inline-strings
    rationale: Compact storage with currentColor for themability
    outcome: 35 icons stored as inline SVG strings in enum map

metrics:
  tasks_completed: 2
  tasks_total: 2
  duration: 5m33s
---

# Phase 21 Plan 01: Icon System and Basic Buttons Summary

Built-in icon system with 35 audio plugin icons and four new button element types.

## One-Liner

BuiltInIcon enum with 35 SVG icons plus IconButton, KickButton, ToggleSwitch, and PowerButton renderers with instant state transitions.

## What Was Built

### Built-in Icon System

Created `src/utils/builtInIcons.ts` with:

- **BuiltInIcon enum** with 35 icons organized by category:
  - Transport (7): Play, Pause, Stop, Record, Loop, SkipForward, SkipBackward
  - Common (8): Mute, Solo, Bypass, Power, Settings, Reset, Save, Load
  - Audio-specific (10): Waveform, Spectrum, Midi, Sync, Link, EQ, Compressor, Reverb, Delay, Filter
  - Additional (10): Add, Remove, Edit, Copy, Paste, Undo, Redo, Help, Info, Warning

- **builtInIconSVG** map: Record<BuiltInIcon, string> with 24x24 viewBox and `fill="currentColor"` for themability

### Button Element Types

Four new element configurations in `controls.ts`:

| Type | Description | Key Properties |
|------|-------------|----------------|
| `IconButtonElementConfig` | Icon-only button | iconSource, builtInIcon/assetId, mode, pressed |
| `KickButtonElementConfig` | Momentary trigger | pressed, label |
| `ToggleSwitchElementConfig` | iOS-style toggle | isOn, onColor, offColor, thumbColor, showLabels |
| `PowerButtonElementConfig` | Power with LED | isOn, ledPosition, ledSize, ledOnColor/ledOffColor |

### Renderers

| Renderer | Visual Behavior |
|----------|-----------------|
| IconButtonRenderer | 70% icon fill, brightness(0.85) on press |
| KickButtonRenderer | brightness(1.2) flash on press |
| ToggleSwitchRenderer | Pill shape, instant thumb snap, no animation |
| PowerButtonRenderer | LED with glow boxShadow, brightness(1.1) when on |

All renderers use `transition: none` for instant state changes.

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Icons as inline SVG strings | Compact, no external dependencies, works with currentColor |
| BuiltInIcon enum + map pattern | Type-safe icon references with O(1) lookup |
| transition: none on all buttons | Audio plugin UIs need instant visual feedback |
| LED uses boxShadow for glow | Performant CSS-only effect, no SVG needed |

## Commits

| Hash | Message |
|------|---------|
| ce566d2 | feat(21-01): create built-in icon system |
| dd61184 | feat(21-01): add four button element types with renderers |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Asset type property access**
- **Found during:** Task 2 - IconButtonRenderer
- **Issue:** Asset interface has `svgContent` not `content`
- **Fix:** Changed `asset.content` to `asset.svgContent`
- **Files modified:** src/components/elements/renderers/controls/IconButtonRenderer.tsx
- **Commit:** dd61184

**2. [Rule 2 - Missing Critical] Added export generator cases**
- **Found during:** Task 2 - build verification
- **Issue:** cssGenerator and htmlGenerator exhaustiveness check failed for new types
- **Fix:** Added switch cases for iconbutton, kickbutton, toggleswitch, powerbutton
- **Files modified:** cssGenerator.ts, htmlGenerator.ts
- **Commit:** dd61184

## Verification Results

| Check | Result |
|-------|--------|
| BuiltInIcon count | 35 icons |
| TypeScript compilation | Pre-existing errors only, no new errors |
| iconbutton in registry | 1 entry |
| kickbutton in registry | 1 entry |
| toggleswitch in registry | 1 entry |
| powerbutton in registry | 1 entry |

## Next Phase Readiness

**Ready for 21-02 (Button Palette and Properties)**:
- All 4 element configs defined with complete properties
- Type guards and factory functions available
- Renderers registered and rendering correctly
- Built-in icon system ready for property panel icon picker
