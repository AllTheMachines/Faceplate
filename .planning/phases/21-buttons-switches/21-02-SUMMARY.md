---
phase: 21-buttons-switches
plan: 02
subsystem: controls
tags: [rocker-switch, rotary-switch, segment-button, multi-position, switch-controls]

dependency-graph:
  requires:
    - "Phase 20 (Simple Controls) for base patterns"
  provides:
    - "RockerSwitchElementConfig: 3-position switch type"
    - "RotarySwitchElementConfig: 2-12 position rotary selector"
    - "SegmentButtonElementConfig: iOS-style segmented control"
    - "Three switch renderers registered in rendererRegistry"
  affects:
    - "Plan 21-03: Property panels for switch configuration"
    - "Plan 21-04: Palette items for switch elements"

tech-stack:
  added: []
  patterns:
    - "Multi-position switch rendering with instant state transitions"
    - "Radial vs legend label layout based on position count"
    - "Segment content modes (icon/text/icon-text)"

key-files:
  created:
    - src/components/elements/renderers/controls/RockerSwitchRenderer.tsx
    - src/components/elements/renderers/controls/RotarySwitchRenderer.tsx
    - src/components/elements/renderers/controls/SegmentButtonRenderer.tsx
  modified:
    - src/types/elements/controls.ts
    - src/components/elements/renderers/controls/index.ts
    - src/components/elements/renderers/index.ts
    - src/services/export/cssGenerator.ts
    - src/services/export/htmlGenerator.ts

decisions:
  - id: rocker-position-mapping
    decision: "Position 0=down, 1=center, 2=up with paddle offset calculation"
    rationale: "Intuitive mapping matching physical rocker switch behavior"
  - id: rotary-label-layout-threshold
    decision: "Radial layout for 2-6 positions, legend for 7-12"
    rationale: "Radial labels become crowded with many positions"
  - id: segment-icon-fallback
    decision: "Unicode symbols as fallback for built-in icons"
    rationale: "Enables rendering before builtInIconSVG utility available"

metrics:
  duration: "4m 11s"
  completed: "2026-01-26"
---

# Phase 21 Plan 02: Multi-Position Switches Summary

Three multi-position switch element types for mode selection, vintage rotary selectors, and iOS-style segmented controls.

## What Was Built

### Rocker Switch
- 3-position vertical switch (up/center/down)
- Paddle moves to current position with indicator symbol
- Supports `spring-to-center` and `latch-all-positions` modes
- Optional UP/DN labels with active position highlighting

### Rotary Switch
- Configurable 2-12 positions
- Circular body with rotating pointer indicator
- Position marks on switch body edge
- Dual label layout:
  - Radial: Labels around switch (2-6 positions)
  - Legend: Vertical list beside switch (7-12 positions)
- Custom labels or automatic 1-N numbering

### Segment Button
- 2-8 segments in single or multi-select mode
- Horizontal or vertical orientation
- Per-segment content modes:
  - `icon`: Unicode symbol fallback
  - `text`: Label with ellipsis overflow
  - `icon-text`: Combined icon and label
- Selected segment highlighting with color inversion

## Implementation Details

### Type Definitions Added
```typescript
// Rocker Switch
interface RockerSwitchElementConfig {
  type: 'rockerswitch'
  position: 0 | 1 | 2
  mode: 'spring-to-center' | 'latch-all-positions'
  showLabels: boolean
  upLabel, downLabel: string
  backgroundColor, switchColor, borderColor, labelColor: string
}

// Rotary Switch
interface RotarySwitchElementConfig {
  type: 'rotaryswitch'
  positionCount: number // 2-12
  currentPosition: number
  positionLabels: string[] | null
  rotationAngle: number // Default 270
  labelLayout: 'radial' | 'legend'
  // ... colors
}

// Segment Button
interface SegmentButtonElementConfig {
  type: 'segmentbutton'
  segmentCount: number // 2-8
  segments: SegmentConfig[]
  selectionMode: 'single' | 'multi'
  selectedIndices: number[]
  orientation: 'horizontal' | 'vertical'
  // ... colors
}

interface SegmentConfig {
  displayMode: 'icon' | 'text' | 'icon-text'
  iconSource?: 'builtin' | 'asset'
  builtInIcon?: string
  assetId?: string
  text?: string
}
```

### Factory Defaults
- `createRockerSwitch`: position 1 (center), latch-all-positions
- `createRotarySwitch`: 4 positions, position 0, null labels (1-4)
- `createSegmentButton`: 3 text segments ['A','B','C'], single select

### Registry Entries
All three types registered in `rendererRegistry`:
- `'rockerswitch'` -> `RockerSwitchRenderer`
- `'rotaryswitch'` -> `RotarySwitchRenderer`
- `'segmentbutton'` -> `SegmentButtonRenderer`

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 4d8537f | feat | Add switch element types with configs, guards, factories |
| 1183340 | feat | Create switch renderers and registry entries |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Export support for new types**
- **Found during:** Task 1
- **Issue:** New switch types caused TypeScript exhaustiveness errors in cssGenerator.ts and htmlGenerator.ts
- **Fix:** Added CSS and HTML generation cases for rockerswitch, rotaryswitch, segmentbutton
- **Files modified:** src/services/export/cssGenerator.ts, src/services/export/htmlGenerator.ts
- **Commit:** 4d8537f

## Verification Results

All verification checks passed:
- TypeScript build succeeds (excluding pre-existing errors)
- Type interfaces defined for all three switch types
- SegmentConfig interface defined
- Type guards created: isRockerSwitch, isRotarySwitch, isSegmentButton
- Factory functions created: createRockerSwitch, createRotarySwitch, createSegmentButton
- All three types in rendererRegistry
- Export support in cssGenerator and htmlGenerator

## Next Steps

Plan 21-03 will add property panels for configuring these switch types.
Plan 21-04 will add palette items to the element toolbox.
