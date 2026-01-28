# Export Format Reference

Detailed breakdown of what Faceplate exports and how each file works.

## Export Types

Faceplate supports two export modes:

| Mode | Purpose | Files Generated |
|------|---------|-----------------|
| **JUCE Bundle** | Production use in JUCE plugins | index.html, style.css, components.js, bindings.js, README.md |
| **HTML Preview** | Standalone browser testing | Same files + mock JUCE backend |

---

## File: index.html

The main HTML document containing all UI elements.

### Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
  <title>JUCE WebView UI</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="plugin-wrapper">
    <div id="plugin-container">
      <!-- Generated elements positioned absolutely -->

      <div id="gain-knob" class="knob knob-element"
           data-type="knob"
           data-value="0.5"
           data-start-angle="-135"
           data-end-angle="135"
           style="position: absolute; left: 100px; top: 50px; width: 80px; height: 80px;">
        <svg width="100%" height="100%" viewBox="0 0 80 80">
          <path class="knob-arc-track" d="..." />
          <path class="knob-arc-fill" d="..." />
          <line class="knob-indicator" x1="40" y1="40" x2="40" y2="10" />
        </svg>
      </div>

      <div id="master-volume" class="slider slider-element vertical"
           data-type="slider"
           data-orientation="vertical"
           style="position: absolute; left: 200px; top: 50px; width: 40px; height: 150px;">
        <div class="slider-track"></div>
        <div class="slider-fill"></div>
        <div class="slider-thumb"></div>
      </div>

      <!-- More elements... -->

    </div>
  </div>

  <script src="components.js"></script>
  <script src="bindings.js"></script>
</body>
</html>
```

### Element ID Convention

Element names from Faceplate are converted to kebab-case for HTML IDs:

| Faceplate Name | HTML ID |
|------------|---------|
| "Gain Knob" | `gain-knob` |
| "Master Volume" | `master-volume` |
| "HPF Cutoff" | `hpf-cutoff` |

### Data Attributes

Elements include data attributes for JavaScript configuration:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-type` | Element type | `"knob"`, `"slider"`, `"button"` |
| `data-value` | Default normalized value | `"0.5"` |
| `data-start-angle` | Knob start angle (degrees) | `"-135"` |
| `data-end-angle` | Knob end angle (degrees) | `"135"` |
| `data-orientation` | Slider orientation | `"vertical"`, `"horizontal"` |
| `data-action` | Button action | `"navigate-window"` |
| `data-target-window` | Navigation target | `"settings-window-id"` |

---

## File: style.css

All styling for the plugin UI.

### Sections

```css
/* ==========================================================================
   1. FONT FACES
   ========================================================================== */

@font-face {
  font-family: 'Inter';
  src: url('data:font/woff2;base64,...') format('woff2');
  font-weight: 400;
  font-style: normal;
}

/* ==========================================================================
   2. CSS RESET
   ========================================================================== */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ==========================================================================
   3. CONTAINER STYLES
   ========================================================================== */

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

#plugin-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

#plugin-container {
  position: relative;
  width: 800px;
  height: 600px;
  background-color: #1a1a1a;
  overflow: hidden;
  transform-origin: center center;
}

/* ==========================================================================
   4. BASE ELEMENT STYLES
   ========================================================================== */

.knob-element,
.slider-element,
.button-element,
.label-element {
  position: absolute;
  user-select: none;
}

/* ==========================================================================
   5. KNOB STYLES
   ========================================================================== */

.knob-element {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.knob-element:active {
  cursor: grabbing;
}

.knob-arc-track {
  fill: none;
  stroke: #333;
  stroke-width: 4;
  stroke-linecap: round;
}

.knob-arc-fill {
  fill: none;
  stroke: #00ff88;
  stroke-width: 4;
  stroke-linecap: round;
}

.knob-indicator {
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
}

/* ==========================================================================
   6. SLIDER STYLES
   ========================================================================== */

.slider-element {
  cursor: pointer;
}

.slider-track {
  position: absolute;
  background: #333;
  border-radius: 4px;
}

.slider-element.vertical .slider-track {
  width: 8px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.slider-element.horizontal .slider-track {
  height: 8px;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.slider-fill {
  position: absolute;
  background: #00ff88;
  border-radius: 4px;
}

.slider-thumb {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  cursor: grab;
}

.slider-thumb:active {
  cursor: grabbing;
}

/* ==========================================================================
   7. BUTTON STYLES
   ========================================================================== */

.button-element {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #444;
  border-radius: 4px;
  background: #2a2a2a;
  color: #fff;
  transition: background 0.1s ease;
}

.button-element:hover {
  background: #3a3a3a;
}

.button-element:active,
.button-element.pressed {
  background: #00ff88;
  color: #000;
}

/* ==========================================================================
   8. LABEL STYLES
   ========================================================================== */

.label-element {
  color: #888;
  font-family: 'Inter', sans-serif;
  pointer-events: none;
}

/* ==========================================================================
   9. CUSTOM SCROLLBAR
   ========================================================================== */

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* ==========================================================================
   10. ELEMENT-SPECIFIC OVERRIDES
   ========================================================================== */

/* Generated per-element styles based on Faceplate configuration */
#gain-knob .knob-arc-fill {
  stroke: #00ff88;
}

#master-volume .slider-fill {
  background: #4488ff;
}
```

### Font Embedding

Fonts are embedded as base64 data URLs for offline use:

```css
@font-face {
  font-family: 'Inter';
  src: url('data:font/woff2;base64,d09GMgABA...') format('woff2');
  font-weight: 400;
  font-style: normal;
}
```

Only fonts actually used in the design are embedded.

---

## File: components.js

Functions for updating UI visuals. Called when JUCE sends parameter changes.

### Functions

```javascript
/**
 * Store knob configuration for visual updates.
 * Called during initialization.
 */
function initializeKnob(id, config) {
  const element = document.getElementById(id);
  if (!element) return;

  element._knobConfig = {
    startAngle: config.startAngle || -135,
    endAngle: config.endAngle || 135,
    diameter: config.diameter || 80
  };
}

/**
 * Update knob visual based on normalized value (0-1).
 * Rotates indicator and updates arc fill.
 */
function updateKnobVisual(knobId, normalizedValue) {
  const knob = document.getElementById(knobId);
  if (!knob) return;

  const config = knob._knobConfig || {
    startAngle: parseFloat(knob.dataset.startAngle) || -135,
    endAngle: parseFloat(knob.dataset.endAngle) || 135
  };

  // Calculate rotation angle
  const range = config.endAngle - config.startAngle;
  const angle = config.startAngle + (normalizedValue * range);

  // Update indicator rotation
  const indicator = knob.querySelector('.knob-indicator');
  if (indicator) {
    indicator.style.transform = `rotate(${angle}deg)`;
    indicator.style.transformOrigin = 'center center';
  }

  // Update arc fill
  const fill = knob.querySelector('.knob-arc-fill');
  if (fill) {
    const arcPath = describeArc(
      config.diameter / 2,
      config.diameter / 2,
      config.diameter / 2 - 8,
      config.startAngle,
      angle
    );
    fill.setAttribute('d', arcPath);
  }
}

/**
 * Update slider visual based on normalized value (0-1).
 */
function updateSliderVisual(sliderId, normalizedValue) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const isVertical = slider.classList.contains('vertical');
  const thumb = slider.querySelector('.slider-thumb');
  const fill = slider.querySelector('.slider-fill');

  if (isVertical) {
    // Vertical: 0 = bottom, 1 = top
    const trackHeight = slider.offsetHeight;
    const thumbOffset = (1 - normalizedValue) * (trackHeight - 20);

    if (thumb) thumb.style.top = `${thumbOffset}px`;
    if (fill) {
      fill.style.bottom = '0';
      fill.style.height = `${normalizedValue * 100}%`;
    }
  } else {
    // Horizontal: 0 = left, 1 = right
    const trackWidth = slider.offsetWidth;
    const thumbOffset = normalizedValue * (trackWidth - 20);

    if (thumb) thumb.style.left = `${thumbOffset}px`;
    if (fill) {
      fill.style.left = '0';
      fill.style.width = `${normalizedValue * 100}%`;
    }
  }
}

/**
 * Update button pressed state.
 */
function updateButtonPressed(buttonId, isPressed) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.classList.toggle('pressed', isPressed);
}

/**
 * Update meter level (normalized 0-1).
 */
function updateMeterLevel(meterId, normalizedValue) {
  const meter = document.getElementById(meterId);
  if (!meter) return;

  const fill = meter.querySelector('.meter-fill');
  const isVertical = meter.classList.contains('vertical');

  if (fill) {
    if (isVertical) {
      fill.style.height = `${normalizedValue * 100}%`;
    } else {
      fill.style.width = `${normalizedValue * 100}%`;
    }
  }
}

// ==========================================================================
// SVG Arc Helpers
// ==========================================================================

function polarToCartesian(cx, cy, radius, angleDegrees) {
  const angleRadians = (angleDegrees - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians)
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}
```

---

## File: bindings.js

JUCE communication bridge and interaction handlers.

### Sections

```javascript
// ==========================================================================
// 1. JUCE BRIDGE
// ==========================================================================

let bridge = null;
let nextResultId = 1;

function createJUCEFunctionWrappers() {
  const functions = window.__JUCE__.initialisationData.__juce__functions || [];
  const wrappers = {};
  const pendingResults = new Map();

  window.__JUCE__.backend.addEventListener('__juce__complete', (event) => {
    const resultId = event?.resultId ?? event?.detail?.resultId ?? event?.[0]?.resultId;
    const result = event?.result ?? event?.detail?.result ?? event?.[0]?.result;

    const callback = pendingResults.get(resultId);
    if (callback) {
      pendingResults.delete(resultId);
      callback(result);
    }
  });

  for (const funcName of functions) {
    wrappers[funcName] = function(...args) {
      return new Promise((resolve) => {
        const resultId = nextResultId++;
        pendingResults.set(resultId, resolve);

        window.__JUCE__.backend.emitEvent('__juce__invoke', {
          name: funcName,
          params: args,
          resultId: resultId
        });

        setTimeout(() => {
          if (pendingResults.has(resultId)) {
            pendingResults.delete(resultId);
            resolve(undefined);
          }
        }, 1000);
      });
    };
  }

  return wrappers;
}

async function initializeJUCEBridge() {
  console.log('[JUCEBridge] Starting initialization...');

  for (let i = 0; i < 100; i++) {
    const juce = window.__JUCE__;

    if (juce?.backend && juce?.initialisationData) {
      const functions = juce.initialisationData.__juce__functions || [];

      if (functions.length > 0) {
        console.log('[JUCEBridge] JUCE available with functions:', functions);
        bridge = createJUCEFunctionWrappers();
        initializeAllElements();
        return;
      }
    }

    await new Promise(r => setTimeout(r, 50));
  }

  console.warn('[JUCEBridge] Timeout - running standalone');
  bridge = {
    setParameter: () => Promise.resolve(),
    getParameter: () => Promise.resolve(0.5),
    beginGesture: () => Promise.resolve(),
    endGesture: () => Promise.resolve()
  };
  initializeAllElements();
}

// ==========================================================================
// 2. INTERACTION HANDLERS
// ==========================================================================

function setupKnobInteraction(knobId, paramId, defaultValue = 0.5) {
  const knob = document.getElementById(knobId);
  if (!knob) return;

  let isDragging = false;
  let startY = 0;
  let startValue = defaultValue;
  let currentValue = defaultValue;

  updateKnobVisual(knobId, defaultValue);

  knob.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startValue = currentValue;

    bridge.getParameter(paramId).then(v => {
      if (v !== undefined) startValue = v;
    }).catch(() => {});

    bridge.beginGesture(paramId).catch(() => {});
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const delta = startY - e.clientY;
    const sensitivity = 0.005;
    const newValue = Math.max(0, Math.min(1, startValue + delta * sensitivity));

    currentValue = newValue;
    bridge.setParameter(paramId, newValue).catch(() => {});
    updateKnobVisual(knobId, newValue);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      bridge.endGesture(paramId).catch(() => {});
    }
  });

  knob.addEventListener('dblclick', () => {
    currentValue = defaultValue;
    bridge.setParameter(paramId, defaultValue).catch(() => {});
    updateKnobVisual(knobId, defaultValue);
  });
}

function setupSliderInteraction(sliderId, paramId, defaultValue = 0.5) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  // Similar pattern to knob...
}

function setupButtonInteraction(buttonId, paramId) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  // Handle navigation buttons
  const action = button.dataset.action;
  const targetWindow = button.dataset.targetWindow;

  if (action === 'navigate-window' && targetWindow && window.__WINDOW_MAPPING__) {
    const targetPath = window.__WINDOW_MAPPING__[targetWindow];
    if (targetPath) {
      button.addEventListener('click', () => {
        window.location.href = targetPath;
      });
      return;
    }
  }

  // Handle parameter buttons
  const buttonType = button.dataset.type;

  if (buttonType === 'momentary') {
    button.addEventListener('mousedown', () => {
      bridge.setParameter(paramId, 1).catch(() => {});
      updateButtonPressed(buttonId, true);
    });
    button.addEventListener('mouseup', () => {
      bridge.setParameter(paramId, 0).catch(() => {});
      updateButtonPressed(buttonId, false);
    });
  } else if (buttonType === 'toggle') {
    let isOn = false;
    button.addEventListener('click', () => {
      isOn = !isOn;
      bridge.setParameter(paramId, isOn ? 1 : 0).catch(() => {});
      updateButtonPressed(buttonId, isOn);
    });
  }
}

// ==========================================================================
// 3. ELEMENT INITIALIZATION
// ==========================================================================

function initializeAllElements() {
  // Generated based on elements in the design:

  setupKnobInteraction('gain-knob', 'gain', 0.5);
  setupKnobInteraction('pan-knob', 'pan', 0.5);
  setupSliderInteraction('master-volume', 'masterVolume', 0.75);
  setupButtonInteraction('bypass-btn', 'bypass');

  // Initialize visuals
  initializeKnob('gain-knob', { startAngle: -135, endAngle: 135, diameter: 80 });
  initializeKnob('pan-knob', { startAngle: -135, endAngle: 135, diameter: 60 });
}

// ==========================================================================
// 4. RESPONSIVE SCALING
// ==========================================================================

(function() {
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 1.0;

  function updateScale() {
    const container = document.getElementById('plugin-container');
    const wrapper = document.getElementById('plugin-wrapper');
    if (!container || !wrapper) return;

    const scaleX = wrapper.clientWidth / CANVAS_WIDTH;
    const scaleY = wrapper.clientHeight / CANVAS_HEIGHT;

    let scale = Math.min(scaleX, scaleY);
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

    container.style.transform = `scale(${scale})`;
  }

  updateScale();
  window.addEventListener('resize', updateScale);
  document.addEventListener('fullscreenchange', updateScale);
})();

// ==========================================================================
// 5. STARTUP
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeJUCEBridge();
});
```

---

## Multi-Window Export

For projects with multiple windows, each window gets its own folder:

```
my-plugin-juce.zip
├── main/
│   ├── index.html
│   ├── style.css
│   ├── components.js
│   └── bindings.js
├── settings/
│   ├── index.html
│   ├── style.css
│   ├── components.js
│   └── bindings.js
├── window-mapping.json
└── README.md
```

### Window Mapping

```json
{
  "main-window-uuid": "main/index.html",
  "settings-window-uuid": "settings/index.html"
}
```

Navigation buttons use this mapping to switch between windows:

```javascript
window.__WINDOW_MAPPING__ = {
  "main-window-uuid": "main/index.html",
  "settings-window-uuid": "settings/index.html"
};
```

---

## Binary Data Requirements

For JUCE integration, add all files as binary data in CMakeLists.txt:

```cmake
# Single window project
juce_add_binary_data(${PROJECT_NAME}_UIData
    NAMESPACE BinaryData
    SOURCES
        ui/index.html
        ui/style.css
        ui/components.js
        ui/bindings.js
)

# Multi-window project
juce_add_binary_data(${PROJECT_NAME}_UIData
    NAMESPACE BinaryData
    SOURCES
        ui/main/index.html
        ui/main/style.css
        ui/main/components.js
        ui/main/bindings.js
        ui/settings/index.html
        ui/settings/style.css
        ui/settings/components.js
        ui/settings/bindings.js
        ui/window-mapping.json
)

target_link_libraries(${PROJECT_NAME}
    PRIVATE
        ${PROJECT_NAME}_UIData
        # ... other dependencies
)
```

---

## Validation

Before export, Faceplate validates the design:

| Check | Type | Description |
|-------|------|-------------|
| Element names required | Error | All elements must have non-empty names |
| No duplicate names | Error | Names must be unique (become HTML IDs) |
| Parameter IDs | Warning | Interactive elements should have parameterId |
| SVG assets | Warning | SVG Graphics should have asset assigned |
| Large assets | Warning | Assets >100KB flagged for review |

---

## Related Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Complete integration walkthrough
- [JUCE_PATTERN.md](./JUCE_PATTERN.md) - Communication pattern details
- [ELEMENT_REFERENCE.md](./ELEMENT_REFERENCE.md) - All available elements
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Design guidelines

---

*Last updated: 28 January 2026*
