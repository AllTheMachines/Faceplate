---
phase: 27
plan: 03
name: "Window Chrome Element"
subsystem: "containers"
tags: ["containers", "window-chrome", "title-bar", "button-styles", "macos", "windows"]

dependencies:
  requires:
    - "Phase 1: Base infrastructure (types, renderer registry, property registry)"
    - "Phase 27-01: Tooltip element (shared container patterns)"
  provides:
    - "WindowChromeElementConfig type with button style variants"
    - "WindowChromeRenderer with macOS/Windows/neutral button styles"
    - "WindowChromeProperties property panel"
  affects:
    - "Phase 27-export: Window Chrome HTML/CSS export"
    - "Future plugin UIs needing OS-native title bar aesthetics"

tech:
  added:
    - "WindowChromeElementConfig interface (titleText, buttonStyle, button visibility)"
    - "WindowChromeRenderer with three button style variants"
    - "macOS traffic light buttons (red/yellow/green circles)"
    - "Windows icon buttons (minimize/maximize/close SVG icons)"
    - "Neutral circular button style"
  patterns:
    - "Button position by style (macOS left, Windows/neutral right)"
    - "Individual button visibility toggles"
    - "Title text with ellipsis overflow"
    - "Button style dropdown in property panel"

files:
  created:
    - "src/types/elements/containers.ts (WindowChromeElementConfig)"
    - "src/components/elements/renderers/containers/WindowChromeRenderer.tsx"
    - "src/components/Properties/WindowChromeProperties.tsx"
  modified:
    - "src/types/elements/containers.ts (ContainerElement union, type guard, factory)"
    - "src/components/elements/renderers/containers/index.ts (export)"
    - "src/components/elements/renderers/index.ts (registry, import, re-export)"
    - "src/components/Properties/index.ts (import, registry, re-export)"
    - "src/App.tsx (createWindowChrome import, drag handler)"

decisions:
  - id: "button-style-variants"
    choice: "Three button style variants: macOS, Windows, neutral"
    rationale: "Covers major OS aesthetics (macOS traffic lights, Windows icons) plus neutral option"
    impact: "Users can match native OS chrome or use neutral style"

  - id: "button-position-by-style"
    choice: "macOS buttons on left, Windows/neutral buttons on right"
    rationale: "Matches platform conventions (macOS buttons left, Windows buttons right)"
    impact: "Authentic OS-specific layouts"

  - id: "individual-button-toggles"
    choice: "Separate show/hide toggles for close, minimize, maximize"
    rationale: "Plugins may want only some buttons (e.g., close only)"
    impact: "Flexible button configurations"

  - id: "traffic-light-sizes"
    choice: "12px diameter circles for macOS traffic lights"
    rationale: "Standard macOS window button size"
    impact: "Authentic macOS appearance"

  - id: "windows-icons-svg"
    choice: "SVG icons for Windows minimize/maximize/close"
    rationale: "Scalable, crisp at any size, matches Windows 10/11 style"
    impact: "Professional Windows chrome appearance"

metrics:
  duration: "3.8 minutes"
  completed: "2026-01-26"

status: "complete"
---

# Phase 27 Plan 03: Window Chrome Element Summary

**One-liner:** Window Chrome with macOS traffic lights, Windows icons, and neutral button style variants

## Objective

Create Window Chrome element with configurable button styles (macOS/Windows/neutral) for title bar decorations matching different OS aesthetics.

## What Was Built

### 1. WindowChromeElementConfig Type (Task 1)
- **Interface:** WindowChromeElementConfig with type 'windowchrome'
- **Title bar properties:** titleText, showTitle, titleFontSize, titleColor
- **Button style:** buttonStyle enum ('macos' | 'windows' | 'neutral')
- **Button visibility:** showCloseButton, showMinimizeButton, showMaximizeButton
- **Appearance:** backgroundColor, height (fixed height element)
- **Factory function:** createWindowChrome with defaults (macOS style, 400×32px)
- **Type guard:** isWindowChrome for type narrowing
- **Updated:** ContainerElement union type to include WindowChromeElementConfig

### 2. WindowChromeRenderer (Task 2)
- **macOS traffic light buttons:**
  - 12px diameter circles on left side
  - Colors: red (#ff5f57), yellow (#febc2e), green (#28c840)
  - 8px gap between buttons
  - Standard macOS window button appearance

- **Windows icon buttons:**
  - 46px × 100% height clickable areas on right side
  - SVG icons: minimize (horizontal line), maximize (square), close (X)
  - Icons scale to 10×10px
  - currentColor for theme integration
  - Standard Windows 10/11 appearance

- **Neutral circular buttons:**
  - 10px diameter circles on right side
  - Gray color scheme (#666 background, #999 border)
  - 8px gap between buttons
  - OS-agnostic appearance

- **Title text:**
  - Centered in title bar with flex: 1
  - Ellipsis overflow for long titles
  - Font size, color configurable
  - Optional show/hide toggle

- **Layout logic:**
  - macOS: buttons left, title center, spacer right
  - Windows/neutral: spacer left, title center, buttons right
  - Buttons render in standard order per platform

### 3. WindowChromeProperties Panel (Task 3)
- **Title Bar section:**
  - Show Title checkbox
  - Title Text input (when shown)
  - Title Font Size slider (10-20px)
  - Title Color picker
  - Background Color picker
  - Height slider (24-48px)

- **Button Style section:**
  - Style dropdown:
    - "macOS (Traffic Lights)"
    - "Windows (Icons)"
    - "Neutral (Circles)"

- **Button Visibility section:**
  - Show Close Button checkbox
  - Show Minimize Button checkbox
  - Show Maximize Button checkbox

- **Property panel registered:** propertyRegistry['windowchrome']

### 4. Palette Integration (Task 3)
- **Import:** createWindowChrome factory in App.tsx
- **Drag handler:** case 'windowchrome' in handleDragEnd
- **Factory call:** createWindowChrome({ x: canvasX, y: canvasY, ...variant })
- **Ready for:** Palette category addition in future plan

## Testing Evidence

### TypeScript Compilation
```bash
npx tsc --noEmit
# Passed with no errors
```

### Type System Verification
```bash
grep "interface WindowChromeElementConfig" src/types/elements/containers.ts
# export interface WindowChromeElementConfig extends BaseElementConfig {

grep "windowchrome.*WindowChromeRenderer" src/components/elements/renderers/index.ts
# ['windowchrome', WindowChromeRenderer as RendererComponent],

grep "windowchrome.*WindowChromeProperties" src/components/Properties/index.ts
# ['windowchrome', WindowChromeProperties],

grep "case 'windowchrome'" src/App.tsx
# case 'windowchrome':
```

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### Button Style Variants
**Decision:** Three button style variants (macOS, Windows, neutral)
**Rationale:** Covers major OS aesthetics plus neutral option
**Files:** WindowChromeElementConfig interface, WindowChromeRenderer

### Button Position by Style
**Decision:** macOS buttons on left, Windows/neutral buttons on right
**Rationale:** Matches platform conventions
**Files:** WindowChromeRenderer layout logic

### Individual Button Toggles
**Decision:** Separate toggles for close/minimize/maximize
**Rationale:** Plugins may want subset of buttons
**Files:** WindowChromeElementConfig, WindowChromeProperties

### Traffic Light Sizes
**Decision:** 12px diameter for macOS traffic lights
**Rationale:** Standard macOS window button size
**Files:** WindowChromeRenderer macOS button style

### Windows Icons as SVG
**Decision:** SVG icons for Windows buttons
**Rationale:** Scalable, crisp, matches Windows 10/11 style
**Files:** WindowChromeRenderer Windows button rendering

## Commits

1. **613c428** - `feat(27-03): add WindowChromeElementConfig type and factory`
   - WindowChromeElementConfig interface
   - createWindowChrome factory function
   - isWindowChrome type guard
   - ContainerElement union update

2. **e8a9546** - `feat(27-03): create WindowChromeRenderer with button style variants`
   - WindowChromeRenderer with three button styles
   - macOS traffic light buttons on left
   - Windows icon buttons on right
   - Neutral circular buttons on right
   - Renderer registry entry

3. **5327063** - `feat(27-03): create WindowChrome property panel and palette entry`
   - WindowChromeProperties component
   - Title bar configuration section
   - Button style dropdown
   - Button visibility toggles
   - Property registry entry
   - App.tsx drag handler

## Next Phase Readiness

### Ready for Phase 27-export
- Window Chrome type complete
- Renderer produces consistent visual output
- Property panel enables full configuration
- Ready for HTML/CSS export implementation

### Handoff Notes
- **Export requirements:** Title bar as flexbox, buttons as absolute positioned elements or flex items
- **Button styles:** CSS classes for each button style variant
- **JUCE integration:** data-button-style attribute for runtime styling
- **Interactivity:** Designer shows static chrome, JUCE handles window control events

### No Blockers
All container types now support full configuration and rendering.
