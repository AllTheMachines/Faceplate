# Phase 58: Export - Research

**Researched:** 2026-02-05
**Domain:** HTML/CSS/JS code generation, SVG layer export, element animation patterns, JUCE WebView2 bundle creation
**Confidence:** HIGH

## Summary

This phase extends HTML/CSS/JS export generators to correctly render all SVG-styled elements (sliders, buttons, switches, meters) implemented in Phases 53-57. The existing export system already handles SVG-styled knobs (Phase 53) with the correct pattern: inline SVG layers, layer extraction with color overrides, and CSS-based animation. Phase 58 extends this proven pattern to the remaining element categories: linear, arc, button, and meter.

The existing architecture provides strong foundations:
- htmlGenerator.ts already demonstrates styled knob export with layer extraction and inline SVG
- cssGenerator.ts contains styled-knob CSS rules for layer positioning and animations
- jsGenerator.ts uses proven JUCE event-based pattern for parameter bindings
- elementLayers.ts provides generalized layer extraction and color override services
- Canvas renderers (Phases 54-57) demonstrate exact animation patterns to replicate

User decisions from CONTEXT.md lock critical implementation choices:
- Inline SVG in each element div (self-contained, no external references)
- Fixed layer ordering by role (background → fills → foreground → indicators)
- Flat structure with absolute positioning (all layers as siblings)
- Multi-state elements use opacity toggle (0/1 instant transitions, no CSS animation)
- Slider thumbs use CSS transform translate (GPU-accelerated translateX/Y)
- Meter fills use CSS clip-path inset (matches Phase 57-02 canvas renderer)
- Shared helper functions in main.js (updateSlider, updateMeter, smaller file size)
- Peak hold indicators use JS timer-based decay (setTimeout after holdDuration)

**Primary recommendation:** Follow generateStyledKnobHTML pattern exactly for each category. Extract layers with color overrides, emit inline SVG with absolute-positioned divs, add data attributes for animation targets, generate category-specific CSS transforms (translate for sliders, clip-path for meters, opacity for buttons), add shared animation helpers to jsGenerator.ts alongside existing bindings.

## Standard Stack

The established tools are already in use:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.6.2 | Code generation | String template generation for HTML/CSS/JS |
| DOMParser | Browser API | SVG parsing | extractElementLayer service (Phase 53) |
| XMLSerializer | Browser API | SVG serialization | Layer extraction with viewBox preservation |
| sanitizeSVG | Internal (DOMPurify) | XSS prevention | Defense-in-depth at export (SEC-04) |

### Export Services
| Service | Location | Purpose | When to Use |
|---------|----------|---------|-------------|
| htmlGenerator.ts | src/services/export | HTML structure generation | All element export |
| cssGenerator.ts | src/services/export | Stylesheet generation | Layer positioning, animations |
| jsGenerator.ts | src/services/export | JavaScript bindings | Parameter sync, animation logic |
| extractElementLayer | elementLayers.ts | Layer extraction | All styled element export |
| applyAllColorOverrides | knobLayers.ts | Color override application | Before sanitization |
| sanitizeSVG | lib/svg-sanitizer.ts | SVG sanitization | After override, before export |

### Animation APIs
| API | Browser Support | Purpose | Performance |
|-----|-----------------|---------|-------------|
| CSS transform translate | 99%+ | Slider thumb positioning | GPU-accelerated |
| CSS clip-path inset | 97%+ | Meter fill animation | Composited layer |
| CSS opacity | 100% | Button state switching | GPU-accelerated |
| setTimeout/clearTimeout | 100% | Peak hold decay | JS timer (non-critical) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG per element | External SVG files + references | External files break self-contained bundle, require asset management |
| CSS clip-path | transform scaleY | scaleY requires transform-origin management, less performant |
| Opacity toggle (0/1) | CSS transition opacity | Transition adds visual delay, decision requires instant switch |
| Shared JS helpers | Per-element animation functions | Duplicates code, larger bundle size |
| translateX/Y for thumbs | left/top pixel values | Pixel values trigger layout, transform uses compositor |

**Installation:**
No new dependencies required. All infrastructure from Phase 53 export system.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   └── export/
│       ├── htmlGenerator.ts           # UPDATE: Add generateStyledSliderHTML, generateStyledButtonHTML, generateStyledMeterHTML
│       ├── cssGenerator.ts            # UPDATE: Add styled-slider, styled-button, styled-meter CSS rules
│       └── jsGenerator.ts             # UPDATE: Add updateSlider, updateButton, updateMeter helpers
├── services/
│   └── elementLayers.ts               # EXISTING: extractElementLayer, applyAllColorOverrides (already generalized)
```

### Pattern 1: Styled Element HTML Generation (Sliders)
**What:** Generate HTML with inline SVG layers, extract with color overrides, emit absolute-positioned divs
**When to use:** All slider variants (slider, rangeslider, bipolarslider, notchedslider, arcslider)
**Example:**
```typescript
// Source: htmlGenerator.ts generateStyledKnobHTML (lines 660-714) + Phase 55 slider patterns
// Apply to: Linear sliders, Arc slider

function generateStyledSliderHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: SliderElementConfig,
  style: ElementStyle
): string {
  // Validate category
  if (style.category !== 'linear' && style.category !== 'arc') {
    console.warn('Slider requires linear or arc category style')
    return generateDefaultSliderHTML(id, baseClass, positionStyle, config) // Fallback
  }

  // Apply color overrides to SVG
  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(
      style.svgContent,
      style.layers,
      config.colorOverrides
    )
  }

  // Re-sanitize before export (SEC-04: defense-in-depth)
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  // Extract layers based on category
  const trackSvg = style.layers.track ? extractElementLayer(sanitizedSvg, style.layers.track) : ''
  const fillSvg = style.layers.fill ? extractElementLayer(sanitizedSvg, style.layers.fill) : ''
  const thumbSvg = style.layers.thumb ? extractElementLayer(sanitizedSvg, style.layers.thumb) : ''

  // Calculate normalized value
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Data attributes for JS animation
  const paramAttr = ` data-parameter-id="${config.parameterId || toKebabCase(config.name)}"`
  const orientationAttr = ` data-orientation="${config.orientation}"`
  const valueAttr = ` data-value="${normalizedValue}"`

  // Label and value displays (same as knob pattern)
  const formattedValue = formatValue(normalizedValue, config.min, config.max, config.valueFormat, config.valueSuffix, config.valueDecimalPlaces)
  const labelHTML = config.showLabel
    ? `<span class="slider-label slider-label-${config.labelPosition}" style="font-size: ${config.labelFontSize ?? 12}px; color: ${config.labelColor};">${escapeHTML(config.labelText)}</span>`
    : ''
  const valueHTML = config.showValue
    ? `<span class="slider-value slider-value-${config.valuePosition}" style="font-size: ${config.valueFontSize ?? 12}px; color: ${config.valueColor};">${escapeHTML(formattedValue)}</span>`
    : ''

  return `<div id="${id}" class="${baseClass} slider slider-element styled-slider" data-type="slider"${paramAttr}${orientationAttr}${valueAttr} style="${positionStyle}">
      ${labelHTML}
      ${valueHTML}
      <div class="styled-slider-container">
        ${trackSvg ? `<div class="slider-layer slider-track">${trackSvg}</div>` : ''}
        ${fillSvg ? `<div class="slider-layer slider-fill">${fillSvg}</div>` : ''}
        ${thumbSvg ? `<div class="slider-layer slider-thumb">${thumbSvg}</div>` : ''}
      </div>
    </div>`
}
```

### Pattern 2: Styled Button HTML Generation (State Layers)
**What:** Generate HTML with all state layers present, opacity toggle for instant transitions
**When to use:** Button, IconButton, ToggleSwitch, PowerButton (state-based elements)
**Example:**
```typescript
// Source: User decision from CONTEXT.md + generateStyledKnobHTML pattern
// Button state layers: normal, pressed (for Button/IconButton)
// Toggle layers: on, off, indicator (for ToggleSwitch)
// Power layers: normal, pressed, icon, led (for PowerButton)

function generateStyledButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: ButtonElementConfig,
  style: ElementStyle
): string {
  if (style.category !== 'button') {
    console.warn('Button requires button category style')
    return generateDefaultButtonHTML(id, baseClass, positionStyle, config)
  }

  // Apply color overrides
  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  // Extract button state layers
  const buttonLayers = style.layers as ButtonLayers
  const normalSvg = buttonLayers.normal ? extractElementLayer(sanitizedSvg, buttonLayers.normal) : ''
  const pressedSvg = buttonLayers.pressed ? extractElementLayer(sanitizedSvg, buttonLayers.pressed) : ''
  const iconSvg = buttonLayers.icon ? extractElementLayer(sanitizedSvg, buttonLayers.icon) : ''
  const labelSvg = buttonLayers.label ? extractElementLayer(sanitizedSvg, buttonLayers.label) : ''

  // Initial state (from mode: momentary, toggle, radio)
  const initialPressed = config.mode === 'toggle' && config.pressed ? '1' : '0'
  const paramAttr = ` data-parameter-id="${config.parameterId || toKebabCase(config.name)}"`
  const modeAttr = ` data-mode="${config.mode}"`
  const stateAttr = ` data-state="${initialPressed}"`

  // Fixed layer ordering: background → foreground → indicators
  // All layers present in DOM, opacity toggles visibility (instant, no transition)
  return `<div id="${id}" class="${baseClass} button button-element styled-button" data-type="button"${paramAttr}${modeAttr}${stateAttr} style="${positionStyle}">
      <div class="styled-button-container">
        ${normalSvg ? `<div class="button-layer button-normal" style="opacity: ${initialPressed === '0' ? '1' : '0'};">${normalSvg}</div>` : ''}
        ${pressedSvg ? `<div class="button-layer button-pressed" style="opacity: ${initialPressed === '1' ? '1' : '0'};">${pressedSvg}</div>` : ''}
        ${iconSvg ? `<div class="button-layer button-icon">${iconSvg}</div>` : ''}
        ${labelSvg ? `<div class="button-layer button-label">${labelSvg}</div>` : ''}
      </div>
    </div>`
}
```

### Pattern 3: Styled Meter HTML Generation (Clip-Path Animation)
**What:** Generate HTML with zone fill layers, clip-path inset for bottom-up reveal
**When to use:** All professional meters with SVG styling
**Example:**
```typescript
// Source: StyledMeterRenderer.tsx (lines 80-272) + generateStyledKnobHTML pattern
// Meter layers: body, fill-green, fill-yellow, fill-red, scale, peak

function generateStyledMeterHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: MeterElementConfig,
  style: ElementStyle
): string {
  if (style.category !== 'meter') {
    console.warn('Meter requires meter category style')
    return generateDefaultMeterHTML(id, baseClass, positionStyle, config)
  }

  // Apply color overrides
  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  // Extract meter layers
  const meterLayers = style.layers as MeterLayers
  const bodySvg = meterLayers.body ? extractElementLayer(sanitizedSvg, meterLayers.body) : ''
  const fillGreenSvg = meterLayers['fill-green'] ? extractElementLayer(sanitizedSvg, meterLayers['fill-green']) : ''
  const fillYellowSvg = meterLayers['fill-yellow'] ? extractElementLayer(sanitizedSvg, meterLayers['fill-yellow']) : ''
  const fillRedSvg = meterLayers['fill-red'] ? extractElementLayer(sanitizedSvg, meterLayers['fill-red']) : ''
  const scaleSvg = meterLayers.scale ? extractElementLayer(sanitizedSvg, meterLayers.scale) : ''
  const peakSvg = meterLayers.peak ? extractElementLayer(sanitizedSvg, meterLayers.peak) : ''

  // Initial value (normalized 0-1)
  const normalizedValue = config.value ?? 0.5
  const paramAttr = ` data-parameter-id="${config.parameterId || toKebabCase(config.name)}"`
  const orientationAttr = ` data-orientation="${config.orientation}"`
  const valueAttr = ` data-value="${normalizedValue}"`
  const peakAttr = config.showPeakHold ? ` data-peak-hold="true" data-peak-duration="${config.peakHoldDuration ?? 2000}"` : ''

  // Horizontal orientation: container rotated -90deg
  const containerStyle = config.orientation === 'horizontal' ? ' transform: rotate(-90deg); transform-origin: center center;' : ''

  // Initial clip-path for fills (bottom-up reveal)
  const clipFromTop = (1 - normalizedValue) * 100
  const initialClipPath = `inset(${clipFromTop}% 0 0 0)`

  // Zone thresholds (matches Phase 57-02)
  const yellowThreshold = dbToNormalized(-18, config.minDb, config.maxDb)
  const redThreshold = dbToNormalized(-6, config.minDb, config.maxDb)

  // Fixed layer ordering: body → fills (green/yellow/red) → scale → peak
  return `<div id="${id}" class="${baseClass} meter meter-element styled-meter" data-type="meter"${paramAttr}${orientationAttr}${valueAttr}${peakAttr} style="${positionStyle}">
      <div class="styled-meter-container" style="${containerStyle}">
        ${bodySvg ? `<div class="meter-layer meter-body">${bodySvg}</div>` : ''}
        ${fillGreenSvg ? `<div class="meter-layer meter-fill-green" style="clip-path: ${initialClipPath};">${fillGreenSvg}</div>` : ''}
        ${fillYellowSvg ? `<div class="meter-layer meter-fill-yellow" style="clip-path: ${normalizedValue > yellowThreshold ? initialClipPath : 'inset(100% 0 0 0)'};">${fillYellowSvg}</div>` : ''}
        ${fillRedSvg ? `<div class="meter-layer meter-fill-red" style="clip-path: ${normalizedValue > redThreshold ? initialClipPath : 'inset(100% 0 0 0)'};">${fillRedSvg}</div>` : ''}
        ${scaleSvg ? `<div class="meter-layer meter-scale">${scaleSvg}</div>` : ''}
        ${peakSvg && config.showPeakHold ? `<div class="meter-layer meter-peak" style="bottom: ${normalizedValue * 100}%; transform: translateY(50%);">${peakSvg}</div>` : ''}
      </div>
    </div>`
}
```

### Pattern 4: Styled Slider CSS Rules (Transform Translate)
**What:** CSS for layer positioning, GPU-accelerated thumb translation
**When to use:** cssGenerator.ts styled slider section
**Example:**
```css
/* Source: cssGenerator.ts styled-knob section (lines 194-227) + Phase 55 slider animation patterns */

/* Styled Slider Layers */
.styled-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

.styled-slider-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slider-layer {
  position: absolute;
  inset: 0;
}

/* Track - static background */
.slider-track {
  z-index: 1;
}

/* Fill - animated via clip-path (JS updates) */
.slider-fill {
  z-index: 2;
  transition: clip-path 0.05s ease-out;
}

/* Thumb - animated via transform translate (JS updates) */
.slider-thumb {
  z-index: 3;
  transition: transform 0.05s ease-out;
}

/* Range Slider - dual thumbs */
.styled-rangeslider .slider-thumb-low {
  z-index: 3;
}

.styled-rangeslider .slider-thumb-high {
  z-index: 3;
}

.styled-rangeslider .slider-thumb-low.active {
  z-index: 4; /* Active thumb on top */
}

.styled-rangeslider .slider-thumb-high.active {
  z-index: 4;
}

/* Styled Button Layers */
.styled-button-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.button-layer {
  position: absolute;
  inset: 0;
  transition: none; /* Instant opacity toggle, no animation */
}

/* Styled Meter Layers */
.styled-meter-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.meter-layer {
  position: absolute;
  inset: 0;
}

.meter-fill-green,
.meter-fill-yellow,
.meter-fill-red {
  transition: clip-path 0.05s ease-out;
}

.meter-peak {
  position: absolute;
  left: 0;
  right: 0;
  height: auto;
  transition: bottom 0.05s ease-out;
}
```

### Pattern 5: Shared Animation Helpers in JS (Slider/Meter)
**What:** Shared helper functions for category-specific animations, called by parameter bindings
**When to use:** jsGenerator.ts alongside existing bindings
**Example:**
```typescript
// Source: jsGenerator.ts generateBindingsJS pattern + Phase 55/57 animation logic
// Add to jsGenerator.ts after bindings generation

export function generateAnimationHelpers(): string {
  return `
// Shared animation helpers for styled elements

/**
 * Update styled slider position
 * @param elementId - Slider element ID
 * @param normalizedValue - Value 0-1
 */
function updateSlider(elementId, normalizedValue) {
  const element = document.getElementById(elementId);
  if (!element || !element.classList.contains('styled-slider')) return;

  const orientation = element.dataset.orientation || 'horizontal';
  const thumbLayer = element.querySelector('.slider-thumb');
  const fillLayer = element.querySelector('.slider-fill');

  if (thumbLayer) {
    // GPU-accelerated transform translate
    if (orientation === 'vertical') {
      const thumbY = (1 - normalizedValue) * 100; // Inverted for vertical
      thumbLayer.style.transform = \`translate(0, \${thumbY}%)\`;
    } else {
      const thumbX = normalizedValue * 100;
      thumbLayer.style.transform = \`translate(\${thumbX}%, 0)\`;
    }
  }

  if (fillLayer) {
    // Clip-path inset for fill reveal
    if (orientation === 'vertical') {
      const clipFromTop = (1 - normalizedValue) * 100;
      fillLayer.style.clipPath = \`inset(\${clipFromTop}% 0 0 0)\`;
    } else {
      const clipFromRight = (1 - normalizedValue) * 100;
      fillLayer.style.clipPath = \`inset(0 \${clipFromRight}% 0 0)\`;
    }
  }
}

/**
 * Update styled meter level
 * @param elementId - Meter element ID
 * @param normalizedValue - Value 0-1
 */
function updateMeter(elementId, normalizedValue) {
  const element = document.getElementById(elementId);
  if (!element || !element.classList.contains('styled-meter')) return;

  // Zone thresholds (matches Phase 57-02)
  const yellowThreshold = 0.6; // -18dB normalized
  const redThreshold = 0.85;   // -6dB normalized

  // Clip-path for zone fills (bottom-up reveal)
  const clipFromTop = (1 - normalizedValue) * 100;
  const clipPath = \`inset(\${clipFromTop}% 0 0 0)\`;

  const fillGreen = element.querySelector('.meter-fill-green');
  const fillYellow = element.querySelector('.meter-fill-yellow');
  const fillRed = element.querySelector('.meter-fill-red');

  // Green zone: always visible up to value
  if (fillGreen) {
    fillGreen.style.clipPath = clipPath;
  }

  // Yellow zone: reveals above yellowThreshold
  if (fillYellow) {
    fillYellow.style.clipPath = normalizedValue > yellowThreshold
      ? clipPath
      : 'inset(100% 0 0 0)';
  }

  // Red zone: reveals above redThreshold
  if (fillRed) {
    fillRed.style.clipPath = normalizedValue > redThreshold
      ? clipPath
      : 'inset(100% 0 0 0)';
  }

  // Peak hold indicator (if enabled)
  const peakLayer = element.querySelector('.meter-peak');
  if (peakLayer && element.dataset.peakHold === 'true') {
    updateMeterPeak(elementId, normalizedValue);
  }
}

/**
 * Update meter peak hold indicator with decay
 * @param elementId - Meter element ID
 * @param normalizedValue - Current value 0-1
 */
let peakValues = {}; // Track peak per meter
let peakTimers = {}; // Decay timers per meter

function updateMeterPeak(elementId, normalizedValue) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const peakLayer = element.querySelector('.meter-peak');
  if (!peakLayer) return;

  const currentPeak = peakValues[elementId] || 0;

  // Update peak if value exceeds current peak
  if (normalizedValue > currentPeak) {
    peakValues[elementId] = normalizedValue;
    peakLayer.style.bottom = \`\${normalizedValue * 100}%\`;

    // Clear existing decay timer
    if (peakTimers[elementId]) {
      clearTimeout(peakTimers[elementId]);
    }

    // Start decay timer (holdDuration from data attribute)
    const holdDuration = parseInt(element.dataset.peakDuration) || 2000;
    peakTimers[elementId] = setTimeout(() => {
      peakValues[elementId] = normalizedValue;
    }, holdDuration);
  }
}

/**
 * Update styled button state
 * @param elementId - Button element ID
 * @param pressed - Boolean pressed state
 */
function updateButton(elementId, pressed) {
  const element = document.getElementById(elementId);
  if (!element || !element.classList.contains('styled-button')) return;

  const normalLayer = element.querySelector('.button-normal');
  const pressedLayer = element.querySelector('.button-pressed');

  // Instant opacity toggle (no transition)
  if (normalLayer) {
    normalLayer.style.opacity = pressed ? '0' : '1';
  }
  if (pressedLayer) {
    pressedLayer.style.opacity = pressed ? '1' : '0';
  }
}
`
}
```

### Anti-Patterns to Avoid
- **External SVG files with references:** Breaks self-contained bundle, use inline SVG per element
- **CSS transitions for button states:** Decision requires instant opacity toggle (0/1), not gradual fade
- **left/top for slider thumb positioning:** Triggers layout reflow, use transform translate (compositor)
- **Separate animation function per element:** Duplicates code, use shared helpers (updateSlider, updateMeter)
- **Missing color override application:** Must apply before export, honors per-instance customization
- **Skipping sanitization after overrides:** SEC-04 defense-in-depth requires sanitization at export

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG layer extraction | Custom string parsing | `extractElementLayer()` service | Handles viewBox preservation, element cloning, namespaces |
| Color override application | Regex find/replace | `applyAllColorOverrides()` service | Handles fill, stroke, preserves 'none', escapes selectors |
| SVG sanitization | Custom XSS filter | `sanitizeSVG()` (DOMPurify) | Defense-in-depth, handles all attack vectors |
| Knob HTML generation | Write from scratch | Copy `generateStyledKnobHTML` pattern | Proven pattern, use for all categories |
| Animation CSS rules | Custom properties | Copy styled-knob CSS section | Fixed layer ordering, z-index, transitions already correct |
| Parameter bindings | New event system | Existing JUCE event-based pattern | Tested in EFXvst/INSTvst, reliable |
| Zone threshold calculation | Hardcode values | Use `dbToNormalized(-18, minDb, maxDb)` | Matches Phase 57-02, consistent behavior |
| Thumb overflow prevention | Manual bounds checking | `normalizedValue * (trackSize - thumbSize)` | Prevents thumb clipping at max value |

**Key insight:** Phase 53 established the styled element export pattern for knobs. Don't invent new patterns - extend the existing generateStyledKnobHTML approach to sliders/buttons/meters with category-specific layer extraction and animations.

## Common Pitfalls

### Pitfall 1: Missing styleId Check Leading to Fallback
**What goes wrong:** Styled export function called for element without styleId
**Why it happens:** generateElementHTML doesn't check styleId before calling styled generator
**How to avoid:**
```typescript
// In generateElementHTML switch statement
case 'slider': {
  const sliderEl = element as SliderElementConfig
  if (sliderEl.styleId) {
    const style = getElementStyle(sliderEl.styleId)
    if (style) {
      return generateStyledSliderHTML(id, baseClass, positionStyle, sliderEl, style)
    }
  }
  // Fallback to default
  return generateDefaultSliderHTML(id, baseClass, positionStyle, sliderEl)
}
```
**Warning signs:** Export fails with "style not found", default HTML generated despite styleId present

### Pitfall 2: Wrong Category Validation in Generator
**What goes wrong:** Slider generator accepts 'rotary' category style
**Why it happens:** Copying knob pattern without updating category check
**How to avoid:** Each generator must validate correct category:
- Slider: `style.category !== 'linear' && style.category !== 'arc'`
- Button: `style.category !== 'button'`
- Meter: `style.category !== 'meter'`
**Warning signs:** TypeScript errors accessing wrong layer type, runtime errors extracting missing layers

### Pitfall 3: Layer Ordering Breaking Visual Hierarchy
**What goes wrong:** Indicator layer rendered before background, appears behind fills
**Why it happens:** Random layer order in HTML output
**How to avoid:** Fixed ordering per decision:
- Background layers first (body, track)
- Fill layers middle (fill, fill-green/yellow/red)
- Foreground last (scale, indicators, peak)
**Warning signs:** Peak indicator hidden under fill, scale markings covered by body

### Pitfall 4: Using CSS Transitions for Button States
**What goes wrong:** Button state change has visible fade animation
**Why it happens:** Default CSS transition or copying knob arc fade pattern
**How to avoid:** Button layers must have `transition: none` in CSS, opacity changes are instant (0/1 toggle)
**Warning signs:** Button press feels sluggish, visible fade between states

### Pitfall 5: Forgetting to Apply Color Overrides Before Export
**What goes wrong:** Exported element ignores per-instance color customization
**Why it happens:** Exporting style.svgContent directly without override application
**How to avoid:**
```typescript
let svgWithOverrides = style.svgContent
if (config.colorOverrides) {
  svgWithOverrides = applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
}
const sanitizedSvg = sanitizeSVG(svgWithOverrides)
```
**Warning signs:** All instances of same style look identical, custom colors missing in export

### Pitfall 6: Skipping Sanitization After Color Overrides
**What goes wrong:** XSS vulnerability in exported bundle
**Why it happens:** Assuming override application is safe, skipping SEC-04 defense-in-depth
**How to avoid:** Always sanitize after override application: `sanitizeSVG(svgWithOverrides)`
**Warning signs:** Security audit fails, malicious SVG could execute in exported bundle

### Pitfall 7: Thumb Translation Causing Overflow at 100%
**What goes wrong:** Slider thumb extends beyond track edge at maximum value
**Why it happens:** Using simple percentage without accounting for thumb dimensions
**How to avoid:**
- Horizontal: `thumbX = normalizedValue * (trackWidth - thumbWidth)`
- Or CSS: `transform: translate(calc(${normalizedValue * 100}% - ${normalizedValue * thumbWidth}px), 0)`
**Warning signs:** Thumb half-visible at max value, clipped by container bounds

### Pitfall 8: Meter Clip-Path Direction Mismatch
**What goes wrong:** Meter fills from top instead of bottom
**Why it happens:** Incorrect inset values for bottom-up reveal
**How to avoid:** Vertical bottom-up: `inset(${(1 - value) * 100}% 0 0 0)` clips from top, revealing from bottom
**Warning signs:** Meter behaves inverted, fills downward instead of upward

### Pitfall 9: Peak Hold Not Decaying After Duration
**What goes wrong:** Peak indicator stays at max position indefinitely
**Why it happens:** Missing decay timer implementation in updateMeterPeak
**How to avoid:** Implement setTimeout decay after holdDuration, clear on new peak
**Warning signs:** Peak never resets, stays at maximum even after level drops

### Pitfall 10: Segment Button Highlight Not Clipping Correctly
**What goes wrong:** Segment Button highlight layer not restricted to selected segment
**Why it happens:** Missing clip-path calculation for segment boundaries
**How to avoid:**
```typescript
// Segment Button highlight uses clip-path to show only selected segment(s)
const segmentWidth = 100 / config.segmentCount
const selectedIndex = config.selectedIndex || 0
const clipLeft = selectedIndex * segmentWidth
const clipRight = 100 - (selectedIndex + 1) * segmentWidth
const clipPath = `inset(0 ${clipRight}% 0 ${clipLeft}%)`
```
**Warning signs:** Highlight spans multiple segments, incorrect visual feedback

### Pitfall 11: Rotary Switch Selector Not Rotating to Position
**What goes wrong:** Rotary Switch selector stays at initial angle
**Why it happens:** Missing transform rotation in selector layer export
**How to avoid:**
```typescript
// Rotary Switch selector rotates to match selected position
const positionCount = config.positionCount
const selectedPosition = config.selectedPosition || 0
const anglePerPosition = (style.maxAngle - style.minAngle) / (positionCount - 1)
const selectorAngle = style.minAngle + selectedPosition * anglePerPosition
selectorLayer.style.transform = `rotate(${selectorAngle}deg)`
```
**Warning signs:** Selector points to wrong position, doesn't match selection

## Code Examples

Verified patterns from codebase:

### Styled Slider HTML Generation
```typescript
// Source: generateStyledKnobHTML pattern + Phase 55 slider requirements
function generateStyledSliderHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: SliderElementConfig,
  style: ElementStyle
): string {
  // Category validation
  if (style.category !== 'linear' && style.category !== 'arc') {
    console.warn('Slider requires linear or arc category style')
    return generateDefaultSliderHTML(id, baseClass, positionStyle, config)
  }

  // Apply color overrides
  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  // Extract layers
  const trackSvg = style.layers.track ? extractElementLayer(sanitizedSvg, style.layers.track) : ''
  const fillSvg = style.layers.fill ? extractElementLayer(sanitizedSvg, style.layers.fill) : ''
  const thumbSvg = style.layers.thumb ? extractElementLayer(sanitizedSvg, style.layers.thumb) : ''

  // Normalized value
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Data attributes for animation
  const paramAttr = ` data-parameter-id="${config.parameterId || toKebabCase(config.name)}"`
  const orientationAttr = ` data-orientation="${config.orientation}"`
  const valueAttr = ` data-value="${normalizedValue}"`

  // Initial positions
  const clipFromTop = (1 - normalizedValue) * 100
  const fillClipPath = config.orientation === 'vertical'
    ? `inset(${clipFromTop}% 0 0 0)`
    : `inset(0 ${(1 - normalizedValue) * 100}% 0 0)`

  const thumbTransform = config.orientation === 'vertical'
    ? `translate(0, ${(1 - normalizedValue) * 100}%)`
    : `translate(${normalizedValue * 100}%, 0)`

  return `<div id="${id}" class="${baseClass} slider styled-slider" data-type="slider"${paramAttr}${orientationAttr}${valueAttr} style="${positionStyle}">
      <div class="styled-slider-container">
        ${trackSvg ? `<div class="slider-layer slider-track">${trackSvg}</div>` : ''}
        ${fillSvg ? `<div class="slider-layer slider-fill" style="clip-path: ${fillClipPath};">${fillSvg}</div>` : ''}
        ${thumbSvg ? `<div class="slider-layer slider-thumb" style="transform: ${thumbTransform};">${thumbSvg}</div>` : ''}
      </div>
    </div>`
}
```

### Styled Button HTML Generation (Opacity Toggle)
```typescript
// Source: generateStyledKnobHTML pattern + CONTEXT.md button state decisions
function generateStyledButtonHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: ButtonElementConfig,
  style: ElementStyle
): string {
  if (style.category !== 'button') {
    console.warn('Button requires button category style')
    return generateDefaultButtonHTML(id, baseClass, positionStyle, config)
  }

  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  const buttonLayers = style.layers as ButtonLayers
  const normalSvg = buttonLayers.normal ? extractElementLayer(sanitizedSvg, buttonLayers.normal) : ''
  const pressedSvg = buttonLayers.pressed ? extractElementLayer(sanitizedSvg, buttonLayers.pressed) : ''
  const iconSvg = buttonLayers.icon ? extractElementLayer(sanitizedSvg, buttonLayers.icon) : ''

  const initialPressed = config.mode === 'toggle' && config.pressed ? '1' : '0'
  const paramAttr = ` data-parameter-id="${config.parameterId || toKebabCase(config.name)}"`
  const modeAttr = ` data-mode="${config.mode}"`
  const stateAttr = ` data-state="${initialPressed}"`

  // All layers present, opacity toggle for instant state change
  return `<div id="${id}" class="${baseClass} button styled-button" data-type="button"${paramAttr}${modeAttr}${stateAttr} style="${positionStyle}">
      <div class="styled-button-container">
        ${normalSvg ? `<div class="button-layer button-normal" style="opacity: ${initialPressed === '0' ? '1' : '0'};">${normalSvg}</div>` : ''}
        ${pressedSvg ? `<div class="button-layer button-pressed" style="opacity: ${initialPressed === '1' ? '1' : '0'};">${pressedSvg}</div>` : ''}
        ${iconSvg ? `<div class="button-layer button-icon">${iconSvg}</div>` : ''}
      </div>
    </div>`
}
```

### Styled Meter HTML Generation (Zone Fills with Clip-Path)
```typescript
// Source: StyledMeterRenderer.tsx pattern + generateStyledKnobHTML structure
function generateStyledMeterHTML(
  id: string,
  baseClass: string,
  positionStyle: string,
  config: MeterElementConfig,
  style: ElementStyle
): string {
  if (style.category !== 'meter') {
    console.warn('Meter requires meter category style')
    return generateDefaultMeterHTML(id, baseClass, positionStyle, config)
  }

  let svgWithOverrides = style.svgContent
  if (config.colorOverrides) {
    svgWithOverrides = applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }
  const sanitizedSvg = sanitizeSVG(svgWithOverrides)

  const meterLayers = style.layers as MeterLayers
  const bodySvg = meterLayers.body ? extractElementLayer(sanitizedSvg, meterLayers.body) : ''
  const fillGreenSvg = meterLayers['fill-green'] ? extractElementLayer(sanitizedSvg, meterLayers['fill-green']) : ''
  const fillYellowSvg = meterLayers['fill-yellow'] ? extractElementLayer(sanitizedSvg, meterLayers['fill-yellow']) : ''
  const fillRedSvg = meterLayers['fill-red'] ? extractElementLayer(sanitizedSvg, meterLayers['fill-red']) : ''
  const scaleSvg = meterLayers.scale ? extractElementLayer(sanitizedSvg, meterLayers.scale) : ''
  const peakSvg = meterLayers.peak ? extractElementLayer(sanitizedSvg, meterLayers.peak) : ''

  const normalizedValue = config.value ?? 0.5
  const paramAttr = ` data-parameter-id="${config.parameterId || toKebabCase(config.name)}"`
  const orientationAttr = ` data-orientation="${config.orientation}"`
  const valueAttr = ` data-value="${normalizedValue}"`
  const peakAttr = config.showPeakHold ? ` data-peak-hold="true" data-peak-duration="${config.peakHoldDuration ?? 2000}"` : ''

  // Zone thresholds (normalized)
  const yellowThreshold = 0.6  // -18dB
  const redThreshold = 0.85    // -6dB

  // Initial clip-paths
  const clipFromTop = (1 - normalizedValue) * 100
  const greenClipPath = `inset(${clipFromTop}% 0 0 0)`
  const yellowClipPath = normalizedValue > yellowThreshold ? greenClipPath : 'inset(100% 0 0 0)'
  const redClipPath = normalizedValue > redThreshold ? greenClipPath : 'inset(100% 0 0 0)'

  // Horizontal: rotate container -90deg
  const containerStyle = config.orientation === 'horizontal'
    ? ' style="transform: rotate(-90deg); transform-origin: center center;"'
    : ''

  // Fixed layer ordering: body → fills → scale → peak
  return `<div id="${id}" class="${baseClass} meter styled-meter" data-type="meter"${paramAttr}${orientationAttr}${valueAttr}${peakAttr} style="${positionStyle}">
      <div class="styled-meter-container"${containerStyle}>
        ${bodySvg ? `<div class="meter-layer meter-body">${bodySvg}</div>` : ''}
        ${fillGreenSvg ? `<div class="meter-layer meter-fill-green" style="clip-path: ${greenClipPath};">${fillGreenSvg}</div>` : ''}
        ${fillYellowSvg ? `<div class="meter-layer meter-fill-yellow" style="clip-path: ${yellowClipPath};">${fillYellowSvg}</div>` : ''}
        ${fillRedSvg ? `<div class="meter-layer meter-fill-red" style="clip-path: ${redClipPath};">${fillRedSvg}</div>` : ''}
        ${scaleSvg ? `<div class="meter-layer meter-scale">${scaleSvg}</div>` : ''}
        ${peakSvg && config.showPeakHold ? `<div class="meter-layer meter-peak" style="bottom: ${normalizedValue * 100}%; transform: translateY(50%);">${peakSvg}</div>` : ''}
      </div>
    </div>`
}
```

### Animation Helper: updateSlider
```typescript
// Source: Phase 55 slider animation patterns + jsGenerator.ts integration
function updateSlider(elementId: string, normalizedValue: number): string {
  return `
function updateSlider(elementId, normalizedValue) {
  const element = document.getElementById(elementId);
  if (!element || !element.classList.contains('styled-slider')) return;

  const orientation = element.dataset.orientation || 'horizontal';
  const thumbLayer = element.querySelector('.slider-thumb');
  const fillLayer = element.querySelector('.slider-fill');

  if (thumbLayer) {
    // GPU-accelerated transform translate
    if (orientation === 'vertical') {
      thumbLayer.style.transform = \`translate(0, \${(1 - normalizedValue) * 100}%)\`;
    } else {
      thumbLayer.style.transform = \`translate(\${normalizedValue * 100}%, 0)\`;
    }
  }

  if (fillLayer) {
    // Clip-path inset for fill reveal
    if (orientation === 'vertical') {
      fillLayer.style.clipPath = \`inset(\${(1 - normalizedValue) * 100}% 0 0 0)\`;
    } else {
      fillLayer.style.clipPath = \`inset(0 \${(1 - normalizedValue) * 100}% 0 0)\`;
    }
  }
}`
}
```

### Animation Helper: updateMeter with Peak Hold
```typescript
// Source: Phase 57-02 meter animation + peak hold decay pattern
function updateMeter(elementId: string, normalizedValue: number): string {
  return `
let peakValues = {};
let peakTimers = {};

function updateMeter(elementId, normalizedValue) {
  const element = document.getElementById(elementId);
  if (!element || !element.classList.contains('styled-meter')) return;

  // Zone thresholds (matches Phase 57-02)
  const yellowThreshold = 0.6;  // -18dB
  const redThreshold = 0.85;    // -6dB

  // Clip-path for zone fills (bottom-up reveal)
  const clipFromTop = (1 - normalizedValue) * 100;
  const clipPath = \`inset(\${clipFromTop}% 0 0 0)\`;

  const fillGreen = element.querySelector('.meter-fill-green');
  const fillYellow = element.querySelector('.meter-fill-yellow');
  const fillRed = element.querySelector('.meter-fill-red');

  if (fillGreen) fillGreen.style.clipPath = clipPath;
  if (fillYellow) fillYellow.style.clipPath = normalizedValue > yellowThreshold ? clipPath : 'inset(100% 0 0 0)';
  if (fillRed) fillRed.style.clipPath = normalizedValue > redThreshold ? clipPath : 'inset(100% 0 0 0)';

  // Peak hold with decay
  const peakLayer = element.querySelector('.meter-peak');
  if (peakLayer && element.dataset.peakHold === 'true') {
    const currentPeak = peakValues[elementId] || 0;

    if (normalizedValue > currentPeak) {
      peakValues[elementId] = normalizedValue;
      peakLayer.style.bottom = \`\${normalizedValue * 100}%\`;

      if (peakTimers[elementId]) clearTimeout(peakTimers[elementId]);

      const holdDuration = parseInt(element.dataset.peakDuration) || 2000;
      peakTimers[elementId] = setTimeout(() => {
        peakValues[elementId] = normalizedValue;
      }, holdDuration);
    }
  }
}`
}
```

### Animation Helper: updateButton
```typescript
// Source: CONTEXT.md instant opacity toggle decision
function updateButton(elementId: string, pressed: boolean): string {
  return `
function updateButton(elementId, pressed) {
  const element = document.getElementById(elementId);
  if (!element || !element.classList.contains('styled-button')) return;

  const normalLayer = element.querySelector('.button-normal');
  const pressedLayer = element.querySelector('.button-pressed');

  // Instant opacity toggle (no transition)
  if (normalLayer) normalLayer.style.opacity = pressed ? '0' : '1';
  if (pressedLayer) pressedLayer.style.opacity = pressed ? '1' : '0';

  // Update state data attribute
  element.dataset.state = pressed ? '1' : '0';
}`
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No SVG export for styled elements | Inline SVG with layer extraction | Phase 53 (knobs) | Styled knobs work in exported bundles |
| External SVG files + references | Inline SVG per element div | Phase 53 decision | Self-contained bundles, no asset management |
| Per-element animation functions | Shared category helpers | Phase 58 (current) | Smaller JS bundle, consistent behavior |
| CSS-only sliders in export | CSS + SVG styled sliders | Phase 58 (current) | In-app SVG styling works in exports |
| Fixed meter colors in export | Per-instance color overrides | Phase 58 (current) | Honors customization in exported bundles |
| Button state CSS transitions | Instant opacity toggle (0/1) | Phase 58 decision | Instant state changes, matches in-app behavior |

**Deprecated/outdated:**
- External SVG asset references in export: Use inline SVG per element
- Separate animation functions per element: Use shared helpers (updateSlider, updateMeter, updateButton)
- CSS transitions for button states: Use instant opacity toggle without transition

## Open Questions

Things that couldn't be fully resolved:

1. **Range Slider Active Thumb Z-Index Export**
   - What we know: Range Slider needs dynamic z-index based on which thumb is active (dragged)
   - What's unclear: How to track active thumb in exported bundle without full interaction state management
   - Recommendation: Export with static z-index (thumbHigh z-index 4, thumbLow z-index 3). Active thumb tracking requires more complex interaction logic than needed for basic parameter sync. User can manually adjust z-index in exported code if needed.

2. **Arc Slider Path Export Complexity**
   - What we know: Arc slider thumb follows SVG path using getPointAtLength in canvas renderer
   - What's unclear: Should export include full path-following logic, or simplified arc rotation?
   - Recommendation: Export arc slider with simplified arc rotation (treat as rotary control). Full path-following requires parsing path element in exported JS, adding complexity. Most arc sliders use circular arcs that work with angle-based rotation. Flag in export comments if path-following needed.

3. **Crossfade Slider Fill Layer Behavior**
   - What we know: Crossfade balances between A and B (0 = full A, 1 = full B)
   - What's unclear: How to represent A/B balance in export with single fill layer
   - Recommendation: Crossfade Slider uses two fill layers (fill-a and fill-b) with inverted clip-paths. Fill-a clips from 0 to value, fill-b clips from value to 1. Requires extending LinearLayers detection to support fill-a/fill-b suffixes.

4. **Multi-Slider Band Separation in Export**
   - What we know: All bands share one SVG style
   - What's unclear: Whether bands need visual separation (borders/gaps) in export
   - Recommendation: No visual separation by default (continuous appearance). If needed, add CSS borders between band containers in exported CSS (not part of SVG style).

5. **Segment Button Multi-Select Highlight Export**
   - What we know: Multi-select mode renders multiple clipped highlight instances
   - What's unclear: How to export multiple highlight layers for selected segments
   - Recommendation: Export single highlight layer, use JS to dynamically update clip-path based on selectedIndices array. Clip-path polygon with multiple rectangles for non-contiguous selections.

## Sources

### Primary (HIGH confidence)
- src/services/export/htmlGenerator.ts - generateStyledKnobHTML pattern (lines 660-714), generateElementHTML structure
- src/services/export/cssGenerator.ts - Styled knob CSS rules (lines 194-227), layer positioning patterns
- src/services/export/jsGenerator.ts - JUCE event-based bindings pattern, existing parameter sync
- src/services/elementLayers.ts - extractElementLayer, applyAllColorOverrides (generalized for all categories)
- src/lib/svg-sanitizer.ts - sanitizeSVG function (DOMPurify wrapper)
- src/components/elements/renderers/controls/KnobRenderer.tsx - StyledKnobRenderer pattern for layer rendering
- src/components/elements/renderers/controls/SliderRenderer.tsx - Slider animation patterns (thumb translate, fill clip-path)
- src/components/elements/renderers/displays/meters/StyledMeterRenderer.tsx - Meter zone fills with clip-path animation (lines 149-247)
- src/components/elements/renderers/controls/ButtonRenderer.tsx - Button state layer opacity toggle pattern
- .planning/phases/58-export/CONTEXT.md - User decisions for export implementation
- .planning/phases/53-foundation/53-RESEARCH.md - ElementStyle architecture, layer extraction patterns
- .planning/phases/54-knob-variants/54-RESEARCH.md - Styled renderer patterns
- .planning/phases/55-slider-styling/55-RESEARCH.md - Slider animation patterns (translate, clip-path)
- .planning/phases/57-meter-styling/57-RESEARCH.md - Meter clip-path animation, zone thresholds

### Secondary (MEDIUM confidence)
- [CSS Transform Performance](https://www.crmarsh.com/svg-performance/) - GPU acceleration for translate vs left/top
- [CSS Clip-Path Animation Guide](https://blog.logrocket.com/guide-to-css-animations-using-clip-path/) - Clip-path inset for meter fills
- [SVG Opacity Transitions](https://blog.logrocket.com/how-to-animate-svg-css-tutorial-examples/) - Instant opacity toggle for button states
- [MDN: CSS clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path) - Inset syntax for rectangular clipping
- [MDN: CSS transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) - translateX/Y syntax and performance
- [Animating with Clip-Path | CSS-Tricks](https://css-tricks.com/animating-with-clip-path/) - Hardware acceleration for clip-path

### Tertiary (LOW confidence)
None - all patterns verified from existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All export services already in use, proven in Phase 53
- Architecture: HIGH - generateStyledKnobHTML provides exact pattern for all categories
- Pitfalls: HIGH - Common mistakes identified from export validation and Phase 53 experience
- Animation patterns: HIGH - Verified from Phase 54-57 canvas renderers, direct translation to CSS/JS
- Performance: MEDIUM - Web search confirms GPU acceleration for translate/clip-path, needs production validation

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable export infrastructure)
