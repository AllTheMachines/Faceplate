# Features Research: SVG Styling Extension

**Domain:** SVG-styled visual controls for audio plugin UI designer
**Researched:** 2026-02-04
**Scope:** Layer structures and features for sliders, buttons, switches, and meters

## Executive Summary

This research defines the layer structures needed to extend Faceplate's existing KnobStyle system to support 19 additional visual control elements. The existing knob layer model (indicator, track, arc, glow, shadow) provides a solid foundation, but different control types require different layer semantics.

**Key finding:** Controls fall into distinct categories that share layer patterns:
1. **Continuous value controls** (sliders, arc sliders) - need thumb + track + fill
2. **Discrete state controls** (buttons, switches) - need multi-state layers
3. **Display controls** (meters) - need segments + peak + scale

## Layer Structures by Control Type

### Sliders (7 types: Slider, BipolarSlider, CrossfadeSlider, MultiSlider, NotchedSlider, ArcSlider, RangeSlider)

| Layer | Purpose | Behavior | Required |
|-------|---------|----------|----------|
| `thumb` | Draggable handle | Translates along track axis | YES |
| `track` | Background rail | Static, defines motion bounds | YES |
| `fill` | Value indication | Grows/shrinks with value (height or width) | Optional |
| `notch` | Position markers | Static tick marks at intervals | Optional |
| `glow` | Interactive highlight | Opacity varies with hover/drag | Optional |
| `shadow` | Depth effect | Static or follows thumb | Optional |
| `endcap` | Track terminators | Static decorative elements | Optional |

**Naming conventions for auto-detection:**
- `thumb|handle|grip|cap|fader`
- `track|rail|slot|groove|bg|base`
- `fill|value|progress|level`
- `notch|tick|mark|step`
- `glow|highlight|hover`
- `shadow|depth`
- `endcap|end|terminus`

**Special cases:**
- **RangeSlider**: Two thumbs (`thumb-min`, `thumb-max`) with fill between them
- **BipolarSlider**: Fill grows from center, may need `center-line` layer
- **MultiSlider**: Array of independent thumb/track pairs
- **ArcSlider**: Thumb moves along curved path, needs `arc-track` semantics

### Buttons (6 types: Button, IconButton, PowerButton, SegmentButton, AsciiButton, MenuButton)

| Layer | Purpose | Behavior | Required |
|-------|---------|----------|----------|
| `normal` | Default unpressed state | Visible when not pressed | YES |
| `pressed` | Active/pressed state | Visible when pressed | YES |
| `hover` | Mouse-over state | Visible on hover (optional) | Optional |
| `disabled` | Inactive state | Visible when disabled | Optional |
| `icon` | Button icon/symbol | May swap between states | Optional |
| `label` | Text label | May change color between states | Optional |
| `led` | Status indicator | For PowerButton on/off | PowerButton only |
| `glow` | Highlight effect | Active on press/hover | Optional |
| `shadow` | Depth effect | May change with press | Optional |

**Naming conventions for auto-detection:**
- `normal|default|up|released|off`
- `pressed|active|down|on|selected`
- `hover|over|highlight`
- `disabled|inactive|dimmed`
- `icon|symbol|glyph`
- `label|text|caption`
- `led|indicator|light|status`
- `glow|shine|highlight`
- `shadow|depth`

**Special cases:**
- **SegmentButton**: Multiple segments, each with own normal/selected state
- **PowerButton**: LED layer for on/off indication
- **IconButton**: Icon layer that may colorize differently per state
- **AsciiButton**: Text content swaps between states (handled by content, not layers)

### Switches (4 types: ToggleSwitch, RockerSwitch, RotarySwitch, Checkbox)

| Layer | Purpose | Behavior | Required |
|-------|---------|----------|----------|
| `thumb` | Moving indicator | Translates or rotates between positions | YES |
| `track` | Background/housing | Static container | YES |
| `position-N` | Position markers | For multi-position switches | RotarySwitch only |
| `on-state` | On position visual | Alternative to thumb animation | Optional |
| `off-state` | Off position visual | Alternative to thumb animation | Optional |
| `pointer` | Rotary indicator | Rotates to positions | RotarySwitch only |
| `glow` | Active highlight | Indicates current state | Optional |
| `shadow` | Depth effect | Static or follows thumb | Optional |

**Naming conventions for auto-detection:**
- `thumb|knob|toggle|handle|lever`
- `track|housing|body|frame|base`
- `position|pos|step|stop`
- `on|active|enabled`
- `off|inactive|disabled`
- `pointer|indicator|needle`
- `glow|highlight`
- `shadow|depth`

**Special cases:**
- **RotarySwitch**: Discrete positions (2-12), pointer rotates to each
- **RockerSwitch**: 3 positions (up/center/down), different animation than toggle
- **Checkbox**: Check mark layer that appears/disappears

### Meters (20+ types: VU, RMS, PPM, LUFS, K-System, etc.)

| Layer | Purpose | Behavior | Required |
|-------|---------|----------|----------|
| `segments` | LED bar segments | Individual segments light up | YES |
| `background` | Meter housing | Static container | YES |
| `peak` | Peak hold indicator | Shows highest value, decays | Optional |
| `scale` | dB markings | Static reference lines | Optional |
| `needle` | Analog-style pointer | For analog VU style | Analog meters only |
| `zones` | Color zone overlays | Green/yellow/red regions | Optional |
| `label` | Channel/type label | "L", "R", "dB", etc. | Optional |
| `glow` | Segment glow effect | Brightens active segments | Optional |
| `bezel` | Decorative frame | Static outer frame | Optional |

**Naming conventions for auto-detection:**
- `segment|led|bar|cell|block`
- `background|bg|housing|body`
- `peak|hold|max|clip`
- `scale|marks|ticks|grid`
- `needle|pointer|indicator`
- `zone|region|band`
- `label|text|caption`
- `glow|shine|lit`
- `bezel|frame|border`

**Special cases:**
- **Stereo meters**: Left/right segment arrays (`segments-l`, `segments-r`)
- **Correlation/Width**: Horizontal orientation, bipolar scale
- **GainReduction**: Inverted direction (grows from top)

## Table Stakes Features

Features users will expect. Missing these = product feels incomplete.

### 1. Layer Auto-Detection (Priority: CRITICAL)
**Why essential:** Designers won't manually map every layer. The existing `detectKnobLayers()` pattern must extend to new control types.

**Requirements:**
- Parse SVG group IDs and class names
- Match against naming conventions (see tables above)
- Suggest layer mappings in confirmation dialog
- Allow manual override of suggestions

### 2. Per-Instance Color Overrides (Priority: CRITICAL)
**Why essential:** Already exists for knobs, must work identically for other controls. "One style, many colors" is the core value proposition.

**Requirements:**
- ColorOverrides interface per control type
- Apply color to fill/stroke while preserving `none`
- Real-time preview in designer
- Export with overrides applied

### 3. Reusable Styles (Priority: CRITICAL)
**Why essential:** This is what makes SVG styling valuable - define once, use everywhere.

**Requirements:**
- SliderStyle, ButtonStyle, SwitchStyle, MeterStyle types (parallel to KnobStyle)
- Store with project file
- Reference by styleId from element config
- Update style updates all instances

### 4. Layer Extraction (Priority: HIGH)
**Why essential:** Rendering requires separating layers for independent animation.

**Requirements:**
- Extract layer by ID/class to standalone SVG
- Preserve viewBox and coordinate system
- Handle nested groups
- Support gradients and filters that reference other elements

### 5. Preview in Properties Panel (Priority: HIGH)
**Why essential:** Designers need to see what they're configuring.

**Requirements:**
- Thumbnail preview of style
- Live preview with current value
- Color override preview
- Layer visibility toggles

### 6. Import from Common Design Tools (Priority: HIGH)
**Why essential:** Designers create in Figma, Illustrator, Inkscape - must handle their exports.

**Requirements:**
- Handle Inkscape layer naming (`inkscape:label`)
- Handle Illustrator layer naming (preserve IDs)
- Handle Figma export conventions
- Sanitize malformed SVG

## Differentiator Features

Features that set the product apart. Not expected, but highly valued.

### 1. State-Aware Layer Switching (Priority: MEDIUM)
**Competitive advantage:** Most tools require separate images per state. Allowing one SVG with multiple state layers is more efficient.

**Description:**
For buttons/switches, detect layers named with state suffixes:
- `button-normal`, `button-pressed`, `button-hover`
- Automatically map to correct states
- Single import, multiple states

**Complexity:** MEDIUM - requires state machine for rendering

### 2. Animation Hint Layers (Priority: MEDIUM)
**Competitive advantage:** Auto-generate animations from layer structure.

**Description:**
Detect motion bounds from layers:
- `motion-path` layer defines thumb travel
- `rotation-center` marker for rotary controls
- `scale-origin` for fill animations

**Complexity:** MEDIUM - requires path parsing

### 3. Segment Grid Auto-Generation (Priority: MEDIUM)
**Competitive advantage:** Meters with many segments (60+) are tedious to design manually.

**Description:**
- Designer provides single segment template
- System replicates to create full meter
- Specify count, spacing, orientation
- Color zones applied automatically

**Complexity:** LOW - straightforward SVG generation

### 4. Export as Filmstrip (Priority: LOW)
**Competitive advantage:** JUCE and other frameworks use filmstrip images.

**Description:**
- Export SVG style as PNG filmstrip
- Configurable frame count (typically 127 for knobs)
- Maintains vector quality until final rasterization

**Complexity:** MEDIUM - requires headless rendering

### 5. Style Inheritance (Priority: LOW)
**Competitive advantage:** Create base style, derive variants.

**Description:**
- "Based on" relationship between styles
- Override specific layers or properties
- Changes to base propagate to derived styles

**Complexity:** HIGH - requires dependency tracking

### 6. Responsive Layer Sizing (Priority: LOW)
**Competitive advantage:** Styles that adapt to different element sizes.

**Description:**
- Layers marked as "scalable" vs "fixed"
- Track width stays constant, overall size varies
- Thumb size proportional to track width

**Complexity:** HIGH - requires constraint system

## Anti-Features (Do NOT Build)

Features to explicitly avoid. Common mistakes in this domain.

### 1. DO NOT: Raster-Based Styling
**Why avoid:** Defeats the purpose of SVG. Bitmaps don't scale, increase file size, can't recolor.

**Instead:** All styling is SVG-native. Raster images handled separately in Asset library.

### 2. DO NOT: Complex Animation Timelines
**Why avoid:** Scope creep. Animation is the runtime's job (JUCE), not the designer's.

**Instead:** Define states and value mappings. Let runtime interpolate.

### 3. DO NOT: Per-Segment Meter Styling
**Why avoid:** 60+ segments with individual colors is unmanageable UX.

**Instead:** Color zones (green/yellow/red ranges) that apply to segments automatically.

### 4. DO NOT: CSS-in-SVG Styling
**Why avoid:** Conflicts with inline styles, harder to override, browser inconsistencies.

**Instead:** Direct attribute manipulation (fill, stroke). Remove embedded stylesheets on import.

### 5. DO NOT: 3D/WebGL Effects
**Why avoid:** Compatibility nightmare, massive scope increase, not needed for 2D controls.

**Instead:** Use drop shadows and gradients for depth. Keep it 2D.

### 6. DO NOT: Live SVG Editing
**Why avoid:** Duplicates Figma/Illustrator functionality poorly.

**Instead:** Import from external tools. Provide layer mapping UI, not drawing tools.

### 7. DO NOT: Multi-Resolution SVG Variants
**Why avoid:** SVG is resolution-independent by design.

**Instead:** Single SVG per style. Rendering handles scaling.

## Feature Dependencies on Existing System

| New Feature | Depends On | Notes |
|-------------|------------|-------|
| SliderStyle | KnobStyle pattern | Same store structure, different layers |
| ButtonStyle | KnobStyle pattern | Needs state-aware rendering |
| SwitchStyle | KnobStyle pattern | Needs position-aware rendering |
| MeterStyle | KnobStyle pattern | Needs segment-aware rendering |
| Layer auto-detect | `detectKnobLayers()` | Extend naming conventions |
| Color overrides | `applyColorOverride()` | Reuse directly |
| Layer extraction | `extractLayer()` | Reuse directly |
| SVG sanitization | `svg-sanitizer.ts` | Reuse directly |

## Layer Structure Summary by Control Category

### Continuous Controls (Sliders)
```
thumb (REQUIRED) - translates with value
track (REQUIRED) - defines motion bounds
fill (optional) - grows with value
glow (optional) - hover/drag feedback
shadow (optional) - depth
```

### Discrete Controls (Buttons)
```
normal (REQUIRED) - default state
pressed (REQUIRED) - active state
hover (optional) - mouse-over state
disabled (optional) - inactive state
icon (optional) - embedded graphic
glow (optional) - feedback
shadow (optional) - depth
```

### Multi-State Controls (Switches)
```
thumb (REQUIRED) - moves between positions
track (REQUIRED) - contains positions
position-N (optional) - position markers
glow (optional) - state indication
shadow (optional) - depth
```

### Display Controls (Meters)
```
segments (REQUIRED) - value indication
background (REQUIRED) - housing
peak (optional) - peak hold
scale (optional) - reference marks
needle (optional) - analog pointer
glow (optional) - lit segment effect
bezel (optional) - decorative frame
```

## Recommended Implementation Order

1. **Phase 1: Slider Styling** - Most similar to knobs (continuous value, rotation -> translation)
2. **Phase 2: Button Styling** - Introduces state-based layer switching
3. **Phase 3: Switch Styling** - Combines translation and discrete states
4. **Phase 4: Meter Styling** - Most complex (segments, zones, peak hold)

## Sources

- [VST GUI Pro - Figma Plugin](https://www.figma.com/community/plugin/1563956754324486889/vst-gui-pro)
- [Audio-UI - Professional Audio GUI Elements](https://www.audio-ui.com/)
- [JUCE Look and Feel Customisation Tutorial](https://docs.juce.com/master/tutorial_look_and_feel_customisation.html)
- [Open UI Switch Explainer](https://open-ui.org/components/switch.explainer/)
- [Smashing Magazine - Arduino Pushbutton SVG](https://www.smashingmagazine.com/2020/01/recreating-arduino-pushbutton-svg/)
- [Cloud Four - Designing Button States](https://cloudfour.com/thinks/designing-button-states/)
- [NN/G - Button States Communicate Interaction](https://www.nngroup.com/articles/button-states-communicate-interaction/)
- [Medium - Inline SVG Hover States](https://medium.com/@nicknoordijk/inline-svg-hover-states-with-css-use-tag-4a336ed75062)
- [Voger Design - VST Plugin UI](https://vogerdesign.com/blog/elevating-vst-plugin-ui-with-custom-solutions/)
- [JUCE Forum - Filmstrip Functionality](https://forum.juce.com/t/juce-image-support-for-svg-files-for-sprite-filmstrip-functionality/56970)

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Slider layers | HIGH | Well-documented patterns, consistent with existing knob system |
| Button layers | HIGH | Standard web component patterns apply directly |
| Switch layers | MEDIUM | Less standardized, needs user testing |
| Meter layers | MEDIUM | Many meter types with varying requirements |
| Auto-detection | HIGH | Existing implementation proven, just needs extension |
| Color overrides | HIGH | Existing implementation reusable |
