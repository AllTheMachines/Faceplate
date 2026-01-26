# Phase 21: Buttons & Switches - Research

**Researched:** 2026-01-26
**Domain:** Interactive button and switch controls for audio plugin UIs
**Confidence:** HIGH

## Summary

Phase 21 implements 7 button and switch variants for plugin UIs: Icon Button, Toggle Switch, Rocker Switch, Rotary Switch, Kick Button, Segment Button, and Power Button. These are interactive controls with distinct visual states (pressed/active, hover) and behaviors (momentary vs toggle, multi-position, multi-segment selection).

The codebase already has strong patterns established: Phase 19's registry pattern provides O(1) renderer lookup, existing ButtonRenderer shows the basic button implementation (CSS-based with pressed/active states), and Phase 17's SVG patterns handle custom graphics. The new controls extend these patterns with specialized behaviors: multi-position switches (Rocker: 3 positions, Rotary: 2-12 positions), multi-segment selection (Segment Button: 2-8 segments with single/multi-select modes), icon display from both built-in sets and asset library, and visual feedback (LED indicators, color changes, rotation).

User decisions from CONTEXT.md constrain implementation: instant state transitions (0ms), color-only state feedback (no depth/glow), solid LED indicators (no pulse), single-click toggle (no long-press), both built-in icons (~35 comprehensive set) and asset library SVG support, 2-12 configurable positions for Rotary Switch, and spring-to-center vs latch modes for Rocker Switch.

**Primary recommendation:** Extend existing ButtonRenderer pattern with specialized variants. Implement icon rendering via assetId reference (same pattern as SvgGraphicRenderer) plus built-in icon enum. Use shared state management patterns (pressed/active boolean, value for position/segment selection). Create element type configs with behavior properties (mode, position count, segment configuration). Follow Phase 20 slider patterns for multi-position controls. Leverage existing registry pattern, property panels, and palette structure.

## Standard Stack

The established libraries/tools for button/switch controls in React:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component framework | Already in project, stable API |
| TypeScript | 5.x | Type safety | Already in project, critical for element configs |
| CSS | HTML5 | Styling and state transitions | Browser-native, instant transitions via property changes |
| SVG | HTML5 | Icon rendering | Browser-native, scales perfectly, existing asset library uses SVG |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.10 | State management | Already stores elements, assets - use for built-in icon definitions |
| SafeSVG | Custom component | Sanitized SVG rendering | Already implemented (Phase 14), use for custom icons from asset library |
| CSS transitions | Built-in CSS | Instant state changes | Use transition: none (0ms per user decision) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS-only buttons | React component library (shadcn/ui, Material-UI) | CSS gives full control, matches existing patterns, no external dependencies |
| Enum for built-in icons | Icon font (FontAwesome, Material Icons) | SVG sprites more flexible, consistent with asset library pattern, better control |
| Multiple boolean states | Single enum state | Booleans work for 2-state, but multi-position switches need discrete values (0, 1, 2 for Rocker; 0-11 for Rotary) |
| Separate pressed property | Computed from value | Toggle Switch, Segment Button use value/selectedIndex - pressed state is derived, not separate storage |

**Installation:**
```bash
# No new dependencies required - all libraries already available
# Existing: React, TypeScript, CSS, SVG, Zustand, SafeSVG
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/elements/controls.ts       # Add 7 new element config interfaces
│   ├── IconButtonElementConfig
│   ├── ToggleSwitchElementConfig
│   ├── RockerSwitchElementConfig
│   ├── RotarySwitchElementConfig
│   ├── KickButtonElementConfig
│   ├── SegmentButtonElementConfig
│   └── PowerButtonElementConfig
├── components/elements/renderers/controls/
│   ├── IconButtonRenderer.tsx       # Icon-only button with built-in or asset icons
│   ├── ToggleSwitchRenderer.tsx     # iOS-style slide switch (instant snap)
│   ├── RockerSwitchRenderer.tsx     # 3-position up/center/down
│   ├── RotarySwitchRenderer.tsx     # Vintage rotating selector with labels
│   ├── KickButtonRenderer.tsx       # Momentary with press animation
│   ├── SegmentButtonRenderer.tsx    # Multi-segment mode selection
│   └── PowerButtonRenderer.tsx      # On/off with LED indicator
├── components/Properties/
│   ├── IconButtonProperties.tsx
│   ├── ToggleSwitchProperties.tsx
│   ├── RockerSwitchProperties.tsx
│   ├── RotarySwitchProperties.tsx
│   ├── KickButtonProperties.tsx
│   ├── SegmentButtonProperties.tsx
│   └── PowerButtonProperties.tsx
└── utils/
    └── builtInIcons.ts              # Icon name enum and SVG content map
```

### Pattern 1: Built-In Icon System
**What:** Enum of icon names mapping to inline SVG strings, separate from asset library
**When to use:** Icon Button, Segment Button (icon-only or icon+text segments)
**Example:**
```typescript
// utils/builtInIcons.ts
// ~35 comprehensive icons for audio plugin UIs

export enum BuiltInIcon {
  // Transport controls
  Play = 'play',
  Pause = 'pause',
  Stop = 'stop',
  Record = 'record',
  Loop = 'loop',
  SkipForward = 'skip-forward',
  SkipBackward = 'skip-backward',

  // Common
  Mute = 'mute',
  Solo = 'solo',
  Bypass = 'bypass',
  Power = 'power',
  Settings = 'settings',
  Reset = 'reset',

  // Audio-specific
  Waveform = 'waveform',
  Spectrum = 'spectrum',
  Midi = 'midi',
  Sync = 'sync',
  Link = 'link',

  // Additional common icons...
}

// Simple 24x24 SVG paths - inline, no external files
export const builtInIconSVG: Record<BuiltInIcon, string> = {
  [BuiltInIcon.Play]: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  [BuiltInIcon.Pause]: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>`,
  [BuiltInIcon.Mute]: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  [BuiltInIcon.Power]: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>`,
  // ... 31 more icons
}

// Usage in IconButtonElementConfig
export interface IconButtonElementConfig extends BaseElementConfig {
  type: 'iconbutton'

  // Icon source - either built-in or asset library
  iconSource: 'builtin' | 'asset'
  builtInIcon?: BuiltInIcon       // When iconSource === 'builtin'
  assetId?: string                // When iconSource === 'asset'

  // State
  pressed: boolean
  mode: 'momentary' | 'toggle'

  // Style
  backgroundColor: string
  iconColor: string               // currentColor in SVG
  borderColor: string
  borderRadius: number
}
```

### Pattern 2: Multi-Position State Management
**What:** Use discrete integer value (not boolean) for switches with 3+ positions
**When to use:** Rocker Switch (3 positions), Rotary Switch (2-12 positions)
**Example:**
```typescript
// Rocker Switch: 3 positions
export interface RockerSwitchElementConfig extends BaseElementConfig {
  type: 'rockerswitch'

  // Position: 0 = down, 1 = center, 2 = up
  position: 0 | 1 | 2

  // Behavior mode
  mode: 'spring-to-center' | 'latch-all-positions'
  // spring-to-center: momentary up/down (pitch bend style)
  // latch-all-positions: latches at up/center/down (mode switch style)

  // Visual
  backgroundColor: string
  switchColor: string
  borderColor: string
}

// Rotary Switch: 2-12 positions
export interface RotarySwitchElementConfig extends BaseElementConfig {
  type: 'rotaryswitch'

  // Position count and current position
  positionCount: number  // 2-12 (number input in property panel)
  currentPosition: number // 0 to positionCount-1

  // Labels per position (optional)
  positionLabels: string[] | null // If null, show numbers 1-N

  // Visual rotation per position
  rotationAngle: number  // Total rotation range (default 270°)

  // Colors
  backgroundColor: string
  pointerColor: string
  labelColor: string
  labelFontSize: number
}

// Render rotation calculation
const anglePerPosition = config.rotationAngle / (config.positionCount - 1)
const currentAngle = -config.rotationAngle / 2 + config.currentPosition * anglePerPosition
// Example: 270° range, 6 positions -> 54° per step
// Position 0: -135°, Position 3: 0°, Position 5: +135°
```

### Pattern 3: Multi-Segment Selection
**What:** Array of segments with single or multi-select mode (iOS UISegmentedControl style)
**When to use:** Segment Button (2-8 segments, icon/text/both)
**Example:**
```typescript
export interface SegmentButtonElementConfig extends BaseElementConfig {
  type: 'segmentbutton'

  // Segments
  segmentCount: number // 2-8
  segments: SegmentConfig[] // Array of segment definitions

  // Selection
  selectionMode: 'single' | 'multi'
  selectedIndices: number[] // Single mode: max 1 item, Multi mode: 0-N items

  // Layout
  orientation: 'horizontal' | 'vertical'

  // Colors
  backgroundColor: string
  selectedColor: string
  textColor: string
  selectedTextColor: string
  borderColor: string
}

interface SegmentConfig {
  // Content: icon-only, text-only, or icon+text
  displayMode: 'icon' | 'text' | 'icon-text'

  // Icon source (when displayMode includes icon)
  iconSource?: 'builtin' | 'asset'
  builtInIcon?: BuiltInIcon
  assetId?: string

  // Text (when displayMode includes text)
  text?: string
}

// Active segment indication: color change (per user decision - no depth/glow)
// Render each segment with selectedIndices.includes(index) check
```

### Pattern 4: LED Indicator Rendering
**What:** Solid color circle/rectangle that changes color based on state
**When to use:** Power Button on/off indicator
**Example:**
```typescript
export interface PowerButtonElementConfig extends BaseElementConfig {
  type: 'powerbutton'

  // State
  isOn: boolean // Single click to toggle (no long-press)

  // LED Configuration
  ledPosition: 'top' | 'bottom' | 'left' | 'right' | 'center'
  ledSize: number // Radius in pixels
  ledOnColor: string // Solid color when on (no pulse/breathing)
  ledOffColor: string // Color when off (typically dim or gray)

  // Button Style
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
  label: string // e.g., "POWER", "ON/OFF"
}

// Render LED as simple div with border-radius: 50%
<div
  style={{
    width: config.ledSize,
    height: config.ledSize,
    borderRadius: '50%',
    backgroundColor: config.isOn ? config.ledOnColor : config.ledOffColor,
    transition: 'none', // Instant state change (0ms per user decision)
    boxShadow: config.isOn ? `0 0 4px ${config.ledOnColor}` : 'none',
  }}
/>
```

### Pattern 5: State Transition Timing
**What:** Instant state changes with transition: none (0ms), no animations
**When to use:** All button/switch state changes per user decision
**Example:**
```typescript
// User decision: "State transitions are instant (0ms) — no animation delays"

// Toggle Switch - instant snap to new position (no slide animation)
<div
  style={{
    transform: `translateX(${config.isOn ? '20px' : '0px'})`,
    transition: 'none', // Instant, no animation
  }}
/>

// Rocker Switch - instant position change
<div
  style={{
    transform: `translateY(${positionOffsets[config.position]})`,
    transition: 'none',
  }}
/>

// Segment Button - instant color change
<div
  style={{
    backgroundColor: isSelected ? config.selectedColor : config.backgroundColor,
    transition: 'none',
  }}
/>

// Color-only feedback (no depth effects, no glow) - from user decision
// Pressed state: color change via brightness filter or direct color
filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
// NO: box-shadow depth, transform translateY, 3D effects
```

### Pattern 6: Icon Button with Asset Library Integration
**What:** Icon source selection with dropdown (built-in enum or asset picker)
**When to use:** Icon Button, Segment Button segments with icons
**Example:**
```typescript
// Property panel UI pattern
export function IconButtonProperties({ element, onUpdate }: IconButtonPropertiesProps) {
  const assets = useStore((state) => state.assets)

  return (
    <PropertySection title="Icon">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Icon Source</label>
        <select
          value={element.iconSource}
          onChange={(e) => onUpdate({
            iconSource: e.target.value as 'builtin' | 'asset',
            // Clear opposite source when switching
            builtInIcon: e.target.value === 'builtin' ? BuiltInIcon.Play : undefined,
            assetId: e.target.value === 'asset' ? assets[0]?.id : undefined,
          })}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
        >
          <option value="builtin">Built-In Icon</option>
          <option value="asset">Asset Library</option>
        </select>
      </div>

      {/* Built-in icon dropdown */}
      {element.iconSource === 'builtin' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Built-In Icon</label>
          <select
            value={element.builtInIcon || BuiltInIcon.Play}
            onChange={(e) => onUpdate({ builtInIcon: e.target.value as BuiltInIcon })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <optgroup label="Transport">
              <option value={BuiltInIcon.Play}>Play</option>
              <option value={BuiltInIcon.Pause}>Pause</option>
              <option value={BuiltInIcon.Stop}>Stop</option>
              {/* ... */}
            </optgroup>
            <optgroup label="Common">
              <option value={BuiltInIcon.Mute}>Mute</option>
              <option value={BuiltInIcon.Solo}>Solo</option>
              {/* ... */}
            </optgroup>
            <optgroup label="Audio">
              <option value={BuiltInIcon.Waveform}>Waveform</option>
              {/* ... */}
            </optgroup>
          </select>
        </div>
      )}

      {/* Asset library dropdown */}
      {element.iconSource === 'asset' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Asset</label>
          <select
            value={element.assetId || ''}
            onChange={(e) => onUpdate({ assetId: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="">Select Asset...</option>
            {assets
              .filter(a => a.category === 'icon' || a.category === 'graphic')
              .map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))
            }
          </select>
        </div>
      )}
    </PropertySection>
  )
}

// Renderer - same pattern as SvgGraphicRenderer
export function IconButtonRenderer({ config }: IconButtonRendererProps) {
  const getAsset = useStore((state) => state.getAsset)

  let iconContent: string
  if (config.iconSource === 'builtin' && config.builtInIcon) {
    iconContent = builtInIconSVG[config.builtInIcon]
  } else if (config.iconSource === 'asset' && config.assetId) {
    const asset = getAsset(config.assetId)
    iconContent = asset?.svgContent || '' // Fallback if missing
  } else {
    iconContent = builtInIconSVG[BuiltInIcon.Play] // Default fallback
  }

  return (
    <button
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: `${config.borderRadius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
        transition: 'none', // Instant
        cursor: 'pointer',
        color: config.iconColor, // For SVG currentColor
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: iconContent }}
        style={{ width: '70%', height: '70%' }} // Icon fills 70% of button
      />
    </button>
  )
}
```

### Pattern 7: Kick Button Press Animation
**What:** Momentary button with brief color/filter change on press (Claude's discretion on timing)
**When to use:** Kick Button (momentary with animation feedback)
**Example:**
```typescript
export interface KickButtonElementConfig extends BaseElementConfig {
  type: 'kickbutton'

  // Momentary only (no toggle mode)
  pressed: boolean

  // Animation timing (Claude's discretion - user decision)
  // Recommendation: 100-150ms visual feedback duration
  pressDuration: number // Milliseconds for visual feedback

  // Style
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
  label: string
}

// Render with instant filter change, brief hold
// Implementation approach: CSS-only (filter change on pressed state)
// OR: useEffect with setTimeout to auto-reset pressed state after duration
// Recommendation: CSS-only for simplicity - caller handles state timing

<button
  style={{
    width: '100%',
    height: '100%',
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    border: `2px solid ${config.borderColor}`,
    borderRadius: `${config.borderRadius}px`,
    filter: config.pressed ? 'brightness(1.2)' : 'brightness(1)', // Flash brighter
    transition: 'none', // Instant
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  }}
>
  {config.label}
</button>

// Note: Press duration is for runtime behavior (plugin host triggers press, holds briefly, releases)
// Designer just shows pressed vs unpressed states - runtime handles timing
```

### Anti-Patterns to Avoid
- **Using text label for Icon Button:** Icon Button is icon-only (BTN-01). Use Segment Button for icon+text.
- **Animating state transitions:** User decision: "instant (0ms)" - no slide, fade, or spring animations.
- **Depth effects on pressed state:** User decision: "color change only" - no box-shadow inset, no translateY transform.
- **Pulsing/breathing LED:** User decision: "solid when on" - LED indicator is static color, not animated.
- **Long-press for Power Button:** User decision: "single click to toggle" - no press-and-hold detection needed.
- **Fixed position count for Rotary Switch:** User decision: "2-12 configurable" - use number input, not preset dropdown.
- **Separate renderer per segment:** Segment Button renders all segments in one component - loop over segments array.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon library | Custom icon font or sprite sheet system | Built-in enum + inline SVG strings | Simple, no external files, consistent with asset library SVG pattern, ~35 icons fit in single file |
| SVG icon rendering | Custom SVG parser or embed logic | SafeSVG component + dangerouslySetInnerHTML for built-in | SafeSVG already sanitizes, built-in icons are trusted inline strings |
| Multi-segment layout | Manual position calculations | CSS flexbox with flex: 1 per segment | Browser handles spacing, resizing, orientation changes |
| Rotary switch rotation | Custom transform calculations | Existing polarToCartesian from KnobRenderer | Already handles angle math, tested, reusable |
| Element registry | if/else or switch statement | Existing rendererRegistry Map | O(1) lookup, already integrated, just add entries |
| Property panels | Inline forms | Existing PropertySection + input components | Consistent styling, reusable NumberInput/TextInput/ColorInput |
| State management | Component local state | Element config properties | Persists in project JSON, undo/redo support via zundo |

**Key insight:** The infrastructure exists - renderer registry, property panels, asset library, SafeSVG, state management. This phase is about creating 7 specialized button/switch renderers with distinct visual styles and behaviors, following established patterns. The temptation is to build custom systems (icon fonts, animation libraries, state machines), but existing patterns handle all requirements.

## Common Pitfalls

### Pitfall 1: Toggle Switch Slide Animation
**What goes wrong:** Toggle Switch has smooth slide animation (iOS style), violating user decision for instant transitions.
**Why it happens:** CSS transition defaults or developer habit from iOS design patterns.
**How to avoid:** Explicitly set `transition: 'none'` on thumb position. User decision: "snaps instantly to new position (no slide animation)".
**Warning signs:** Toggle thumb animates smoothly instead of jumping instantly.

### Pitfall 2: Segment Button Selection State Confusion
**What goes wrong:** Multi-select mode allows no selection (all deselected), breaking single-select invariant.
**Why it happens:** Not enforcing "at least one selected" for single mode.
**How to avoid:** Single mode: prevent deselecting last item. Multi mode: allow empty selection (valid state for multi-mode controls).
**Warning signs:** User can deselect all segments in single-select mode, leaving no active segment.
**Solution:**
```typescript
// Single mode: clicking selected segment does nothing
if (selectionMode === 'single' && selectedIndices.includes(clickedIndex)) {
  return // Don't allow deselecting in single mode
}

// Multi mode: clicking selected segment toggles it off
if (selectionMode === 'multi' && selectedIndices.includes(clickedIndex)) {
  setSelectedIndices(selectedIndices.filter(i => i !== clickedIndex))
}
```

### Pitfall 3: Rocker Switch Center Position in Spring Mode
**What goes wrong:** Spring-to-center mode doesn't auto-return to center when released.
**Why it happens:** Missing runtime behavior explanation - "spring" implies auto-return.
**How to avoid:** Document clearly: spring-to-center is runtime behavior (plugin host auto-returns). Designer just shows current position. User manually sets position to 1 (center) in preview.
**Warning signs:** User expects automatic return to center in designer preview.
**Solution:** Property panel help text: "Spring-to-center: Runtime behavior - designer shows current position only."

### Pitfall 4: Rotary Switch Label Positioning
**What goes wrong:** Labels overlap or misalign at different position counts.
**Why it happens:** Fixed label positions don't adapt to positionCount changes.
**How to avoid:** Claude's discretion (user decision) - recommend radial layout with calculated angles. Alternative: legend list beside switch.
**Warning signs:** 12-position switch has cramped/overlapping labels; 2-position has huge gaps.
**Solution:**
```typescript
// Radial positioning around switch
const labelAngle = -rotationAngle / 2 + (i / (positionCount - 1)) * rotationAngle
const labelRadius = diameter / 2 + 20 // 20px outside switch edge
const labelX = centerX + Math.cos(toRadians(labelAngle)) * labelRadius
const labelY = centerY + Math.sin(toRadians(labelAngle)) * labelRadius

// OR: Linear legend list (simpler for many positions)
<div style={{ display: 'flex', flexDirection: 'column', marginLeft: 8 }}>
  {positionLabels.map((label, i) => (
    <div key={i} style={{
      fontWeight: i === currentPosition ? 'bold' : 'normal',
      color: i === currentPosition ? activeColor : labelColor,
    }}>
      {label}
    </div>
  ))}
</div>
```

### Pitfall 5: Icon Button Asset Missing Fallback
**What goes wrong:** Icon Button shows nothing when assetId references deleted asset.
**Why it happens:** Not handling missing asset case (same as SvgGraphicRenderer pitfall).
**How to avoid:** Check if asset exists, show fallback icon (e.g., default Play icon from built-in set).
**Warning signs:** Blank button when asset deleted, no visual indication of error.
**Solution:**
```typescript
let iconContent: string
if (config.iconSource === 'builtin' && config.builtInIcon) {
  iconContent = builtInIconSVG[config.builtInIcon]
} else if (config.iconSource === 'asset' && config.assetId) {
  const asset = getAsset(config.assetId)
  if (!asset) {
    // Fallback to built-in icon when asset missing
    iconContent = builtInIconSVG[BuiltInIcon.Settings] // Generic fallback
  } else {
    iconContent = asset.svgContent
  }
} else {
  // No icon configured - show default
  iconContent = builtInIconSVG[BuiltInIcon.Play]
}
```

### Pitfall 6: Power Button LED Visibility at Small Sizes
**What goes wrong:** LED indicator too small to see when button shrunk to 32x32px.
**Why it happens:** Fixed ledSize doesn't scale with button dimensions.
**How to avoid:** Set ledSize as percentage of button size OR enforce minimum button size for Power Button.
**Warning signs:** LED invisible at small sizes, users can't see on/off state.
**Solution:**
```typescript
// Scale LED with button size (10% of smaller dimension)
const ledSize = Math.max(
  Math.min(config.width, config.height) * 0.1,
  4 // Minimum 4px
)

// OR: Enforce minimum button size in factory function
export function createPowerButton(overrides): PowerButtonElementConfig {
  return {
    // ...
    width: Math.max(overrides?.width ?? 60, 40), // Minimum 40px
    height: Math.max(overrides?.height ?? 40, 40),
    ledSize: overrides?.ledSize ?? 8,
    // ...
  }
}
```

### Pitfall 7: Segment Button Content Overflow
**What goes wrong:** Long text labels in segments get cut off or overflow.
**Why it happens:** Fixed segment width doesn't adapt to content length.
**How to avoid:** Use CSS text overflow handling (ellipsis) or scale font size down for long text.
**Warning signs:** "Oscillator" text cut to "Osc..." in narrow segments.
**Solution:**
```typescript
<div
  style={{
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    flex: 1, // Equal width segments
  }}
>
  {segment.text}
</div>

// OR: Dynamic font size based on segment count
const fontSize = segmentCount <= 3 ? 14 : segmentCount <= 5 ? 12 : 10
```

## Code Examples

Verified patterns from existing codebase and research:

### Built-In Icon Enum and SVG Map
```typescript
// utils/builtInIcons.ts
// Based on comprehensive audio plugin icon requirements from context

export enum BuiltInIcon {
  // Transport controls (7)
  Play = 'play',
  Pause = 'pause',
  Stop = 'stop',
  Record = 'record',
  Loop = 'loop',
  SkipForward = 'skip-forward',
  SkipBackward = 'skip-backward',

  // Common (8)
  Mute = 'mute',
  Solo = 'solo',
  Bypass = 'bypass',
  Power = 'power',
  Settings = 'settings',
  Reset = 'reset',
  Save = 'save',
  Load = 'load',

  // Audio-specific (10)
  Waveform = 'waveform',
  Spectrum = 'spectrum',
  Midi = 'midi',
  Sync = 'sync',
  Link = 'link',
  EQ = 'eq',
  Compressor = 'compressor',
  Reverb = 'reverb',
  Delay = 'delay',
  Filter = 'filter',

  // Additional (10)
  Add = 'add',
  Remove = 'remove',
  Edit = 'edit',
  Copy = 'copy',
  Paste = 'paste',
  Undo = 'undo',
  Redo = 'redo',
  Help = 'help',
  Info = 'info',
  Warning = 'warning',
}

// SVG content - 24x24 viewBox, currentColor for themability
export const builtInIconSVG: Record<BuiltInIcon, string> = {
  [BuiltInIcon.Play]: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`,
  [BuiltInIcon.Pause]: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`,
  [BuiltInIcon.Stop]: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M6 6h12v12H6z"/></svg>`,
  [BuiltInIcon.Mute]: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  [BuiltInIcon.Power]: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42A6.92 6.92 0 0 1 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.81.7-3.45 1.84-4.68L5.17 5.17A8.932 8.932 0 0 0 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.94 8.94 0 0 0-3.17-6.83z"/></svg>`,
  // ... 30 more icons (total ~35)
}
```

### Toggle Switch Renderer (Instant Snap)
```typescript
// Based on existing ButtonRenderer pattern, adapted for switch visual
import { ToggleSwitchElementConfig } from '../../../../types/elements'

interface ToggleSwitchRendererProps {
  config: ToggleSwitchElementConfig
}

export function ToggleSwitchRenderer({ config }: ToggleSwitchRendererProps) {
  // User decision: "snaps instantly to new position (no slide animation)"
  const thumbOffset = config.isOn ? config.width - config.height : 0

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.isOn ? config.onColor : config.offColor,
        borderRadius: `${config.height / 2}px`, // Pill shape
        border: `2px solid ${config.borderColor}`,
        position: 'relative',
        transition: 'none', // Instant state change (0ms)
        cursor: 'pointer',
      }}
    >
      {/* Thumb */}
      <div
        style={{
          position: 'absolute',
          left: thumbOffset,
          top: 0,
          width: config.height - 4, // Slightly smaller than track height
          height: config.height - 4,
          backgroundColor: config.thumbColor,
          borderRadius: '50%',
          transition: 'none', // Instant position change
          margin: 2,
        }}
      />

      {/* Optional labels */}
      {config.showLabels && (
        <>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: config.labelColor, opacity: config.isOn ? 0.5 : 1 }}>
            {config.offLabel}
          </span>
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: config.labelColor, opacity: config.isOn ? 1 : 0.5 }}>
            {config.onLabel}
          </span>
        </>
      )}
    </div>
  )
}
```

### Rocker Switch Renderer (3-Position)
```typescript
import { RockerSwitchElementConfig } from '../../../../types/elements'

interface RockerSwitchRendererProps {
  config: RockerSwitchElementConfig
}

export function RockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
  // Position: 0 = down, 1 = center, 2 = up
  // Visual offset: map position to vertical translation
  const switchHeight = 30 // Height of switch paddle
  const totalTravel = config.height - switchHeight - 8 // 4px margin top/bottom

  const positionOffsets = {
    0: totalTravel,      // Down position (bottom)
    1: totalTravel / 2,  // Center position (middle)
    2: 0,                // Up position (top)
  }

  const currentOffset = positionOffsets[config.position]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Track guides */}
      <div style={{ position: 'absolute', top: 4, left: '50%', width: 2, height: `calc(100% - 8px)`, backgroundColor: 'rgba(255,255,255,0.2)', transform: 'translateX(-50%)' }} />

      {/* Switch paddle */}
      <div
        style={{
          position: 'absolute',
          top: 4 + currentOffset,
          left: 4,
          width: config.width - 8,
          height: switchHeight,
          backgroundColor: config.switchColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: 3,
          transition: 'none', // Instant position change
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 'bold',
          color: 'rgba(0,0,0,0.5)',
        }}
      >
        {config.position === 2 ? '↑' : config.position === 0 ? '↓' : '─'}
      </div>

      {/* Position labels (optional) */}
      {config.showLabels && (
        <>
          <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 9, color: config.labelColor }}>
            {config.upLabel || 'UP'}
          </span>
          <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 9, color: config.labelColor }}>
            {config.downLabel || 'DN'}
          </span>
        </>
      )}
    </div>
  )
}
```

### Segment Button Renderer (Multi-Segment)
```typescript
import { SegmentButtonElementConfig, SegmentConfig } from '../../../../types/elements'
import { builtInIconSVG } from '../../../../utils/builtInIcons'
import { useStore } from '../../../../store'

interface SegmentButtonRendererProps {
  config: SegmentButtonElementConfig
}

export function SegmentButtonRenderer({ config }: SegmentButtonRendererProps) {
  const getAsset = useStore((state) => state.getAsset)

  const renderSegmentContent = (segment: SegmentConfig) => {
    // Get icon content if needed
    let iconContent: string | null = null
    if (segment.displayMode === 'icon' || segment.displayMode === 'icon-text') {
      if (segment.iconSource === 'builtin' && segment.builtInIcon) {
        iconContent = builtInIconSVG[segment.builtInIcon]
      } else if (segment.iconSource === 'asset' && segment.assetId) {
        const asset = getAsset(segment.assetId)
        iconContent = asset?.svgContent || null
      }
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {iconContent && (
          <div
            dangerouslySetInnerHTML={{ __html: iconContent }}
            style={{ width: 16, height: 16, flexShrink: 0 }}
          />
        )}
        {(segment.displayMode === 'text' || segment.displayMode === 'icon-text') && (
          <span style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {segment.text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: config.orientation === 'horizontal' ? 'row' : 'column',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {config.segments.map((segment, index) => {
        const isSelected = config.selectedIndices.includes(index)

        return (
          <div
            key={index}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 8px',
              backgroundColor: isSelected ? config.selectedColor : 'transparent',
              color: isSelected ? config.selectedTextColor : config.textColor,
              borderRight: config.orientation === 'horizontal' && index < config.segments.length - 1 ? `1px solid ${config.borderColor}` : 'none',
              borderBottom: config.orientation === 'vertical' && index < config.segments.length - 1 ? `1px solid ${config.borderColor}` : 'none',
              cursor: 'pointer',
              transition: 'none', // Instant selection change
            }}
          >
            {renderSegmentContent(segment)}
          </div>
        )
      })}
    </div>
  )
}
```

### Power Button with LED Indicator
```typescript
import { PowerButtonElementConfig } from '../../../../types/elements'

interface PowerButtonRendererProps {
  config: PowerButtonElementConfig
}

export function PowerButtonRenderer({ config }: PowerButtonRendererProps) {
  // LED position mapping
  const ledPositions = {
    top: { top: 4, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: 4, left: '50%', transform: 'translateX(-50%)' },
    left: { left: 4, top: '50%', transform: 'translateY(-50%)' },
    right: { right: 4, top: '50%', transform: 'translateY(-50%)' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  }

  return (
    <button
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: `${config.borderRadius}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        filter: config.isOn ? 'brightness(1.1)' : 'brightness(1)',
        transition: 'none', // Instant state change
      }}
    >
      {config.label}

      {/* LED Indicator */}
      <div
        style={{
          position: 'absolute',
          ...ledPositions[config.ledPosition],
          width: config.ledSize,
          height: config.ledSize,
          borderRadius: '50%',
          backgroundColor: config.isOn ? config.ledOnColor : config.ledOffColor,
          // Solid glow when on (no pulse/breathing animation per user decision)
          boxShadow: config.isOn ? `0 0 4px ${config.ledOnColor}` : 'none',
          transition: 'none', // Instant LED state change
        }}
      />
    </button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Bitmap button sprites | CSS-styled buttons with SVG icons | ~2015-2020 | Scalable, theme-able, smaller file size |
| Flash/animated transitions | Instant state changes (0ms) | Audio plugin UX convention | Immediate feedback, professional feel |
| Single Button element | Specialized button variants | This phase (2026) | Purpose-built controls for audio workflows |
| Icon fonts (Font Awesome) | Inline SVG with enum | Modern web (2020+) | No font loading, better control, consistent with asset library |
| Toggle state with boolean | Multi-position with integer | Audio plugin controls | Supports 3+ position switches (Rocker, Rotary) |
| iOS-style animated switches | Instant-snap switches | Audio plugin UX | Matches professional audio software conventions |

**Deprecated/outdated:**
- **Animated toggles:** Audio plugin UIs prefer instant state changes for precise parameter control.
- **Icon fonts:** Replaced by inline SVG for better control and consistency.
- **Single button type:** Modern audio UIs need specialized buttons (Icon, Toggle, Rocker, Rotary, Segment, Power, Kick).
- **Always-on LED animations:** Breathing/pulsing LEDs are distracting in professional UIs - solid indicators preferred.

## Open Questions

Things that couldn't be fully resolved:

1. **Hover state styling per button type**
   - What we know: User decision marked as "Claude's discretion per button type"
   - What's unclear: Specific hover effect style (brightness change? border color? scale?)
   - Recommendation: Consistent brightness(1.05) filter on hover for all types. Simple, subtle, matches existing ButtonRenderer pattern.

2. **Kick Button momentary feedback timing**
   - What we know: User decision marked as "Claude's discretion"
   - What's unclear: Optimal pressDuration value (50ms? 100ms? 150ms?)
   - Recommendation: 100ms default in factory function. Fast enough to feel responsive, long enough to see visually. User can override in property panel if needed.

3. **Rotary Switch label positioning (radial vs legend)**
   - What we know: User decision marked as "Claude's discretion on positioning"
   - What's unclear: Which layout style to implement
   - Recommendation: Radial positioning for 2-6 positions (labels around switch), legend list for 7-12 positions (vertical list beside switch). Property panel option to override.

4. **Active segment visual indicator style**
   - What we know: User decision marked as "Claude's discretion"
   - What's unclear: Color-only (background change) or additional indicator (border, underline, dot)?
   - Recommendation: Background color change only (matches "color change only" constraint for pressed states). Simple, clear, consistent.

5. **Built-in icon SVG content**
   - What we know: Need ~35 comprehensive icons covering transport, common, audio-specific categories
   - What's unclear: Exact SVG paths for each icon (not in codebase yet)
   - Recommendation: Use Material Icons or Heroicons as reference for SVG paths. Simple 24x24 viewBox, single-path designs, currentColor for themability. Implementation task during execution.

6. **Segment Button minimum/maximum segment count**
   - What we know: User decision: "2-8 segments allowed"
   - What's unclear: Enforce in UI (validation) or just document as guideline?
   - Recommendation: Enforce in property panel NumberInput (min: 2, max: 8) to prevent unusable configurations. 1 segment is not a "segment button", 9+ becomes cramped/unusable.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/components/elements/renderers/controls/ButtonRenderer.tsx` - Verified button pattern, CSS styling, pressed state
- Existing codebase: `src/components/elements/renderers/decorative/SvgGraphicRenderer.tsx` - Verified assetId pattern for SVG assets
- Existing codebase: `src/components/elements/renderers/index.ts` - Verified registry pattern, O(1) lookup
- Existing codebase: `src/components/Palette/Palette.tsx` - Verified palette category structure
- Existing codebase: `src/types/elements/controls.ts` - Verified element config patterns, factory functions
- Phase 17 RESEARCH.md - SVG handling, SafeSVG component, rotation patterns
- Phase 20 RESEARCH.md - Control element patterns, multi-slider (similar to segment button), detent logic
- MDN: CSS transitions - https://developer.mozilla.org/en-US/docs/Web/CSS/transition
- MDN: CSS filter property - https://developer.mozilla.org/en-US/docs/Web/CSS/filter

### Secondary (MEDIUM confidence)
- [iOS UISegmentedControl](https://developer.apple.com/design/human-interface-guidelines/components/selection-and-input/segmented-controls/) - Segment button design reference
- [Material Icons](https://fonts.google.com/icons) - Icon SVG reference for built-in icon set
- [Heroicons](https://heroicons.com/) - Alternative icon SVG reference (MIT license, simple paths)
- [Audio Plugin UX Patterns](https://www.audio-ui.com/) - Professional audio plugin UI conventions (marketing site, not technical)
- [Toggle Switch UX](https://uxdesign.cc/toggle-switch-guidelines-e69c04a34c77) - iOS-style toggle design patterns

### Tertiary (LOW confidence)
- Web search: "rotary switch UI" - Multiple examples show radial vs legend positioning, no consensus
- Web search: "audio plugin button design" - Various styles, no authoritative standard
- 0ms transition timing from user decision - not a standard, but explicit requirement for this project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing project already uses React + TypeScript + CSS + SVG, no new dependencies
- Architecture: HIGH - Existing ButtonRenderer, SvgGraphicRenderer, registry patterns provide proven foundation
- Built-in icons: MEDIUM - Concept clear (enum + SVG map), exact SVG paths not researched yet (implementation detail)
- Multi-position patterns: HIGH - Similar to Phase 20 multi-slider, discrete value states well-understood
- Visual feedback: HIGH - User decisions very specific (instant, color-only, solid LED) - no ambiguity
- Hover states: LOW - User decision deferred to Claude's discretion, no research on optimal approach

**Research date:** 2026-01-26
**Valid until:** 60 days (stable domain - button/switch patterns don't change rapidly)
