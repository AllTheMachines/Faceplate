# VST3 WebView2 UI Vector Designer - Complete Specification

> Reference document for building a visual design tool for audio plugin interfaces.
> Target: JUCE WebView2 integration with SVG/HTML/CSS/JS output.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [UI Element Taxonomy](#ui-element-taxonomy)
3. [Element Properties Reference](#element-properties-reference)
4. [Real-Time Visualizations](#real-time-visualizations)
5. [JUCE WebView2 Integration](#juce-webview2-integration)
6. [Interaction Patterns](#interaction-patterns)
7. [Resources](#resources)

---

## Architecture Overview

### Target Workflow

1. User creates canvas with specific dimensions (e.g., 800x600)
2. User drags elements from palette onto canvas
3. User configures each element via property panel
4. User arranges elements with alignment tools, snap-to-grid
5. User previews interactive behavior
6. User exports code for JUCE WebView2 integration

### JUCE WebView2 Communication Pattern

```
┌─────────────────┐     window.__JUCE__.backend      ┌─────────────────┐
│                 │  ◄──────────────────────────────►│                 │
│   JavaScript    │     emitEvent / addEventListener │      C++        │
│   Frontend      │                                  │    Backend      │
│                 │  ◄──────────────────────────────►│                 │
│                 │     withNativeFunction calls     │                 │
└─────────────────┘                                  └─────────────────┘
         │                                                    │
         │  WebSliderRelay                                    │
         │  ◄────────────────────────────────────────────────►│
         │  Juce.getSliderState()                             │
         │                                                    │
```

### Key C++ Setup

```cpp
WebBrowserComponent browser {
    WebBrowserComponent::Options{}
        .withBackend(WebBrowserComponent::Options::Backend::webview2)
        .withNativeIntegrationEnabled()
        .withResourceProvider([this](const auto& url) { 
            return getResource(url); 
        })
        .withWinWebView2Options(
            WebBrowserComponent::Options::WinWebView2{}
                .withUserDataFolder(File::getSpecialLocation(
                    File::SpecialLocationType::tempDirectory)))
};
```

---

## UI Element Taxonomy

### Category 1: Rotary Controls (8 types)

| Element | Description | Key Differentiator |
|---------|-------------|-------------------|
| **Knob** | Standard rotary control | 270° default rotation |
| **Endless Encoder** | Continuous rotation | 360°, no end stops |
| **Stepped Knob** | Discrete positions | 12-64 detents |
| **Center-Detented Knob** | Snaps to center | For pan, EQ gain |
| **Concentric Dual Knob** | Two knobs, one axis | Nested controls |
| **Arc Knob** | Visible arc track | Modern flat style |
| **Filled Arc Knob** | Arc fills with value | Progress-style |
| **Dot Indicator Knob** | Minimal indicator | Clean aesthetic |

### Category 2: Linear Controls (10 types)

| Element | Description | Key Differentiator |
|---------|-------------|-------------------|
| **Vertical Slider** | Standard fader | Channel strip style |
| **Horizontal Slider** | Left-right control | Pan, time |
| **Vertical Fader** | Extended throw | Mixer fader (100mm style) |
| **Bipolar Slider** | Center-zero | Centered default |
| **Range Slider** | Two thumbs | Min/max selection |
| **Crossfade Slider** | A/B balance | DJ-style |
| **Fill Slider** | Visual fill | Progress bar style |
| **Notched Slider** | Detent positions | Stepped values |
| **Arc Slider** | Curved path | Circular layout |
| **Multi-Slider** | Multiple parallel | Multi-band, EQ |

### Category 3: Buttons & Switches (12 types)

| Element | Description | Key Differentiator |
|---------|-------------|-------------------|
| **Momentary Button** | Press and release | Trigger, tap tempo |
| **Toggle Button** | Click to toggle | On/off state |
| **Radio Button** | Exclusive selection | One of many |
| **Checkbox** | Independent toggle | Multiple selections |
| **Text Button** | Labeled button | Action buttons |
| **Icon Button** | Icon only | Toolbar style |
| **Toggle Switch** | Slide switch | iOS-style |
| **Rocker Switch** | 3-position | Up/center/down |
| **Rotary Switch** | Rotating selector | Vintage style |
| **Kick Button** | Momentary with animation | Drum trigger |
| **Segment Button** | Multi-segment | Mode selection |
| **Power Button** | On/off with indicator | Bypass |

### Category 4: Value Displays (10 types)

| Element | Description | Format Examples |
|---------|-------------|-----------------|
| **Numeric Display** | Raw number | 42, 3.14159 |
| **dB Display** | Decibel value | -12.5 dB, +3.0 dB |
| **Frequency Display** | Hz/kHz auto | 440 Hz, 2.5 kHz |
| **Time Display** | ms/s/bars | 125 ms, 1.5 s |
| **Percentage Display** | 0-100% | 75% |
| **Ratio Display** | Compression ratio | 4:1, ∞:1 |
| **Note Display** | Musical note | C4, A#3 |
| **BPM Display** | Tempo | 120.00 BPM |
| **Editable Display** | Double-click to edit | Direct value entry |
| **Multi-Value Display** | Multiple readouts | Stacked values |

### Category 5: LED Indicators (6 types)

| Element | Description | States |
|---------|-------------|--------|
| **Single LED** | On/off indicator | 2 states |
| **Bi-Color LED** | Two color states | Green/red |
| **Tri-Color LED** | Three states | Off/yellow/red |
| **LED Array** | Row of LEDs | 8-24 segments |
| **LED Ring** | Around knob | Value indication |
| **LED Matrix** | Grid pattern | Sequencer, status |

### Category 6: Meters (15 types)

| Element | Standard | Attack | Release |
|---------|----------|--------|---------|
| **Peak Meter** | Instantaneous | 0 ms | 300 ms |
| **RMS Meter** | Averaged | 300 ms | 300 ms |
| **VU Meter** | Analog standard | 300 ms | 300 ms |
| **PPM Type I** | IEC 60268-10 | 10 ms | 1.5 s |
| **PPM Type II** | BBC standard | 10 ms | 2.8 s |
| **True Peak** | Inter-sample | - | 1.7 s |
| **LUFS Momentary** | EBU R128 | 400 ms window |
| **LUFS Short-term** | EBU R128 | 3 s window |
| **LUFS Integrated** | EBU R128 | Full program |
| **K-12 Meter** | Bob Katz | 600 ms | 600 ms |
| **K-14 Meter** | Bob Katz | 600 ms | 600 ms |
| **K-20 Meter** | Bob Katz | 600 ms | 600 ms |
| **Gain Reduction** | Compressor | Inverted display |
| **Correlation Meter** | Phase | -1 to +1 |
| **Stereo Width** | M/S ratio | 0 to 200% |

### Category 7: Visualizations (12 types)

| Element | Domain | Key Parameters |
|---------|--------|----------------|
| **Waveform** | Time | Length, zoom, color |
| **Scrolling Waveform** | Time | Speed, window size |
| **Spectrum Analyzer** | Frequency | FFT size, scale, smoothing |
| **Spectrogram** | Time-Frequency | Color map, resolution |
| **Oscilloscope** | Time | Trigger, timebase |
| **Goniometer** | L/R Phase | Size, persistence |
| **Vectorscope** | L/R Phase | Lissajous mode |
| **EQ Curve** | Frequency Response | Bands, handles |
| **Compressor Curve** | Transfer Function | Knee, ratio |
| **Envelope Display** | ADSR | Interactive handles |
| **LFO Display** | Waveform | Rate, shape |
| **Filter Response** | Frequency | Cutoff, resonance |

### Category 8: Selection & Navigation (10 types)

| Element | Description | Use Case |
|---------|-------------|----------|
| **Dropdown** | Single selection | Presets, modes |
| **Multi-Select Dropdown** | Multiple selection | Bus routing |
| **Combo Box** | Dropdown + text entry | Custom values |
| **Tab Bar** | Section switching | Page navigation |
| **Menu Button** | Opens menu | Context actions |
| **Breadcrumb** | Hierarchy navigation | Folder/preset path |
| **Stepper** | +/- buttons | Increment/decrement |
| **Preset Browser** | List with search | Preset selection |
| **Tag Selector** | Tag-based filter | Category filter |
| **Tree View** | Hierarchical list | File browser |

### Category 9: Containers & Decorative (12 types)

| Element | Description | Use Case |
|---------|-------------|----------|
| **Panel** | Grouped container | Section grouping |
| **Frame** | Bordered container | Visual separation |
| **Group Box** | Labeled container | Parameter groups |
| **Separator** | Line divider | Visual break |
| **Background Image** | Backdrop | Texture, branding |
| **Foreground Image** | Overlay | Watermark, logo |
| **Logo** | Brand mark | Plugin identity |
| **Label** | Static text | Section titles |
| **Tooltip** | Hover info | Parameter help |
| **Divider** | Vertical/horizontal line | Column separation |
| **Spacer** | Invisible element | Layout spacing |
| **Window Chrome** | Title bar, resize | Standalone mode |

### Category 10: Specialized Audio (13 types)

| Element | Description | Key Parameters |
|---------|-------------|----------------|
| **Piano Keyboard** | Note input | Range, size, velocity |
| **Drum Pad** | Velocity-sensitive | Size, color, label |
| **Pad Grid** | 4x4 or 4x8 | Pad count, spacing |
| **Step Sequencer** | Pattern grid | Steps, rows, resolution |
| **XY Pad** | 2D control | Labels, crosshair |
| **Modulation Matrix** | Routing table | Sources, destinations |
| **Wavetable Display** | 3D waveform | Position, morph |
| **Harmonic Editor** | Additive bars | Harmonics count |
| **Envelope Editor** | ADSR + more | Points, curves |
| **Sample Display** | Audio file | Waveform, markers |
| **Loop Points** | Start/end markers | Draggable |
| **Patch Bay** | Cable routing | Inputs, outputs |
| **Signal Flow** | Block diagram | Nodes, connections |

---

## Element Properties Reference

### Base Properties (all elements)

```typescript
interface BaseElementConfig {
  // Identity
  id: string;                    // Unique identifier (UUID)
  type: ElementType;             // Element type enum
  name: string;                  // User-friendly name
  
  // Position & Size
  x: number;                     // X position (px)
  y: number;                     // Y position (px)
  width: number;                 // Width (px)
  height: number;                // Height (px)
  zIndex: number;                // Stack order
  rotation: number;              // Rotation (degrees)
  
  // State
  locked: boolean;               // Prevent editing
  visible: boolean;              // Show/hide
  
  // JUCE Binding
  parameterId?: string;          // JUCE parameter ID
  automationId?: string;         // DAW automation ID
  midiCC?: number;               // MIDI CC number
  midiChannel?: number;          // MIDI channel (1-16)
}
```

### Knob Properties

```typescript
interface KnobConfig extends BaseElementConfig {
  type: 'knob';
  
  // Dimensions
  diameter: number;              // Knob diameter (px)
  
  // Arc Geometry
  startAngle: number;            // Start angle (degrees, 0 = top)
  endAngle: number;              // End angle (degrees)
  arcDirection: 'cw' | 'ccw';    // Rotation direction
  
  // Value
  min: number;                   // Minimum value
  max: number;                   // Maximum value
  default: number;               // Default value
  value: number;                 // Current value
  step: number;                  // Step increment (0 = continuous)
  curve: 'linear' | 'log' | 'exp'; // Response curve
  bipolar: boolean;              // Center-zero mode
  
  // Visual Style
  style: 'arc' | 'filled' | 'dot' | 'line' | 'image';
  
  // Colors
  trackColor: string;            // Background track
  fillColor: string;             // Value fill
  indicatorColor: string;        // Pointer/indicator
  backgroundColor: string;       // Knob body
  borderColor: string;           // Outline
  borderWidth: number;           // Outline width
  
  // Track
  trackWidth: number;            // Arc track width (px)
  trackRadius: number;           // Arc radius (px)
  trackStartCap: 'butt' | 'round' | 'square';
  trackEndCap: 'butt' | 'round' | 'square';
  
  // Indicator
  indicatorType: 'line' | 'dot' | 'triangle' | 'none';
  indicatorLength: number;       // Length (px)
  indicatorWidth: number;        // Width (px)
  indicatorOffset: number;       // Distance from center
  
  // Ticks
  showTicks: boolean;
  majorTicks: number;            // Count of major ticks
  minorTicks: number;            // Minor ticks between major
  tickLength: number;            // Tick length (px)
  tickColor: string;
  
  // Labels
  showValue: boolean;
  valuePosition: 'center' | 'below' | 'above';
  valueFormat: string;           // printf-style format
  units: string;                 // Unit suffix
  decimalPlaces: number;
  
  // Behavior
  sensitivity: number;           // Pixels per full range
  fineMultiplier: number;        // Shift-drag multiplier
  mouseMode: 'circular' | 'vertical' | 'horizontal';
  doubleClickReset: boolean;
  
  // Shadow
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}
```

### Slider Properties

```typescript
interface SliderConfig extends BaseElementConfig {
  type: 'slider';
  
  // Orientation
  orientation: 'vertical' | 'horizontal';
  reversed: boolean;             // Flip min/max positions
  
  // Value
  min: number;
  max: number;
  default: number;
  value: number;
  step: number;
  curve: 'linear' | 'log' | 'exp';
  bipolar: boolean;
  
  // Track
  trackLength: number;           // Track length (px)
  trackWidth: number;            // Track thickness (px)
  trackColor: string;
  trackFillColor: string;        // Fill up to current value
  trackBorderColor: string;
  trackBorderWidth: number;
  trackBorderRadius: number;
  showCenterLine: boolean;       // For bipolar
  
  // Thumb
  thumbWidth: number;
  thumbHeight: number;
  thumbColor: string;
  thumbBorderColor: string;
  thumbBorderWidth: number;
  thumbBorderRadius: number;
  thumbShape: 'rect' | 'circle' | 'custom';
  thumbImage?: string;           // Custom thumb SVG/PNG
  
  // Labels
  showValue: boolean;
  valuePosition: 'thumb' | 'above' | 'below' | 'left' | 'right';
  valueFormat: string;
  units: string;
  
  // Ticks
  showTicks: boolean;
  tickPosition: 'left' | 'right' | 'both';
  majorTicks: number;
  minorTicks: number;
  tickLabels: string[];          // Custom tick labels
  
  // Behavior
  sensitivity: number;
  snapToTicks: boolean;
  doubleClickReset: boolean;
}
```

### Meter Properties

```typescript
interface MeterConfig extends BaseElementConfig {
  type: 'meter';
  
  // Meter Type
  meterType: 'peak' | 'rms' | 'vu' | 'ppm' | 'lufs' | 'correlation';
  
  // Orientation
  orientation: 'vertical' | 'horizontal';
  
  // Scale
  minDb: number;                 // Minimum dB (-60 typical)
  maxDb: number;                 // Maximum dB (+6 typical)
  referenceLevel: number;        // 0 dB reference
  scaleType: 'linear' | 'logarithmic';
  
  // Ballistics (ms)
  attackTime: number;
  releaseTime: number;
  
  // Appearance
  segmented: boolean;
  segmentCount: number;
  segmentGap: number;
  
  // Colors (can be gradient stops)
  colorStops: Array<{
    position: number;            // 0-1
    color: string;
  }>;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  
  // Peak Hold
  showPeakHold: boolean;
  peakHoldTime: number;          // ms
  peakHoldColor: string;
  
  // Clip Indicator
  showClipIndicator: boolean;
  clipThreshold: number;         // dB
  clipColor: string;
  clipHoldTime: number;          // ms
  
  // Scale Markings
  showScale: boolean;
  scalePosition: 'left' | 'right' | 'both';
  scaleMarks: number[];          // dB values to mark
  
  // Stereo
  stereo: boolean;
  channelGap: number;            // Gap between L/R
}
```

### Visualization Properties

```typescript
interface VisualizationConfig extends BaseElementConfig {
  type: 'visualization';
  
  // Visualization Type
  vizType: 'waveform' | 'spectrum' | 'spectrogram' | 
           'oscilloscope' | 'goniometer' | 'eq_curve';
  
  // FFT Settings (for frequency domain)
  fftSize: 256 | 512 | 1024 | 2048 | 4096 | 8192;
  smoothingTimeConstant: number; // 0-1
  
  // Frequency Scale
  frequencyScale: 'linear' | 'logarithmic';
  minFrequency: number;          // Hz
  maxFrequency: number;          // Hz
  
  // Amplitude Scale
  amplitudeScale: 'linear' | 'decibel';
  minDb: number;
  maxDb: number;
  
  // Colors
  lineColor: string;
  fillColor: string;
  backgroundColor: string;
  gridColor: string;
  
  // Line Style
  lineWidth: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
  
  // Fill
  fillMode: 'none' | 'solid' | 'gradient' | 'mirror';
  fillOpacity: number;
  
  // Grid
  showGrid: boolean;
  gridLineWidth: number;
  horizontalGridLines: number;
  verticalGridLines: number;
  
  // Goniometer specific
  persistence: number;           // Trail length (0-1)
  dotSize: number;
  
  // Spectrogram specific
  colorMap: 'grayscale' | 'heat' | 'rainbow' | 'custom';
  scrollDirection: 'up' | 'down' | 'left' | 'right';
  scrollSpeed: number;
}
```

---

## Real-Time Visualizations

### Waveform Rendering (Canvas 2D)

```javascript
function drawWaveform(ctx, samples, width, height, color) {
  const step = Math.ceil(samples.length / width);
  const amp = height / 2;
  
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  for (let i = 0; i < width; i++) {
    const idx = Math.floor(i * step);
    const y = amp + samples[idx] * amp;
    
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  
  ctx.stroke();
}
```

### Spectrum Analyzer (FFT)

```javascript
function drawSpectrum(ctx, analyser, width, height) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  
  const barWidth = width / bufferLength;
  
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);
  
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * height;
    const x = i * barWidth;
    
    // Gradient from green to red
    const hue = 120 - (dataArray[i] / 255) * 120;
    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
    ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
  }
}
```

### Logarithmic Frequency Scaling

```javascript
function freqToX(freq, minFreq, maxFreq, width) {
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logFreq = Math.log10(freq);
  
  return width * (logFreq - logMin) / (logMax - logMin);
}

function xToFreq(x, minFreq, maxFreq, width) {
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logFreq = logMin + (x / width) * (logMax - logMin);
  
  return Math.pow(10, logFreq);
}
```

### Goniometer

```javascript
function drawGoniometer(ctx, leftSamples, rightSamples, size) {
  const center = size / 2;
  const scale = center * 0.7;
  
  ctx.strokeStyle = 'rgba(0, 255, 128, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  for (let i = 0; i < leftSamples.length; i++) {
    // M/S encoding (45° rotation)
    const mid = (leftSamples[i] + rightSamples[i]) * 0.5;
    const side = (rightSamples[i] - leftSamples[i]) * 0.5;
    
    const x = center + side * scale;
    const y = center - mid * scale;
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  
  ctx.stroke();
}
```

### Level Meter with Ballistics

```javascript
class LevelMeter {
  constructor(attackMs = 10, releaseMs = 300, sampleRate = 44100) {
    this.currentLevel = 0;
    this.peakHold = 0;
    this.peakHoldCounter = 0;
    
    // Calculate coefficients
    this.attackCoef = Math.exp(-1 / (attackMs * sampleRate / 1000));
    this.releaseCoef = Math.exp(-1 / (releaseMs * sampleRate / 1000));
  }
  
  process(sample) {
    const input = Math.abs(sample);
    
    if (input > this.currentLevel) {
      // Attack
      this.currentLevel = this.attackCoef * this.currentLevel + 
                         (1 - this.attackCoef) * input;
    } else {
      // Release
      this.currentLevel = this.releaseCoef * this.currentLevel;
    }
    
    // Peak hold
    if (this.currentLevel > this.peakHold) {
      this.peakHold = this.currentLevel;
      this.peakHoldCounter = 0;
    } else {
      this.peakHoldCounter++;
    }
    
    return this.currentLevel;
  }
  
  getDb() {
    return 20 * Math.log10(Math.max(this.currentLevel, 0.00001));
  }
}
```

---

## JUCE WebView2 Integration

### Parameter Binding (C++ Side)

```cpp
// In PluginEditor.h
class PluginEditor : public AudioProcessorEditor {
    WebBrowserComponent browser;
    
    WebSliderRelay gainRelay { browser, "gain" };
    WebSliderRelay freqRelay { browser, "frequency" };
    WebSliderRelay resRelay { browser, "resonance" };
    
    WebSliderParameterAttachment gainAttachment;
    WebSliderParameterAttachment freqAttachment;
    WebSliderParameterAttachment resAttachment;
};

// In PluginEditor.cpp
PluginEditor::PluginEditor(PluginProcessor& p)
    : AudioProcessorEditor(p),
      gainAttachment(*p.parameters.getParameter("gain"), gainRelay, nullptr),
      freqAttachment(*p.parameters.getParameter("frequency"), freqRelay, nullptr),
      resAttachment(*p.parameters.getParameter("resonance"), resRelay, nullptr)
{
    browser.goToURL(WebBrowserComponent::getResourceProviderRoot());
}
```

### Parameter Binding (JavaScript Side)

```javascript
// Initialize slider states
const gainState = Juce.getSliderState("gain");
const freqState = Juce.getSliderState("frequency");
const resState = Juce.getSliderState("resonance");

// Listen for changes from DAW/automation
gainState.valueChangedEvent.addListener(() => {
    const value = gainState.getNormalisedValue();
    updateKnobVisual('gain-knob', value);
});

// Send changes to C++
function onKnobChange(parameterId, normalizedValue) {
    const state = Juce.getSliderState(parameterId);
    state.setNormalisedValue(normalizedValue);
}

// Handle automation recording
function onKnobDragStart(parameterId) {
    Juce.getSliderState(parameterId).sliderDragStarted();
}

function onKnobDragEnd(parameterId) {
    Juce.getSliderState(parameterId).sliderDragEnded();
}
```

### Visualization Data Transfer

```cpp
// Timer callback for visualization updates (30-60 FPS)
void timerCallback() override {
    // Get spectrum data from processor
    auto spectrum = processor.getSpectrumData();
    
    // Convert to JSON array
    var spectrumArray;
    for (auto& value : spectrum)
        spectrumArray.append(value);
    
    browser.emitEventIfBrowserIsVisible("spectrumData", spectrumArray);
}

// For high-frequency binary data, use resource provider
std::optional<Resource> getResource(const String& url) {
    if (url == "/spectrum.bin") {
        auto data = processor.getSpectrumData();
        return Resource {
            data.data(),
            data.size() * sizeof(float),
            "application/octet-stream"
        };
    }
    // ... serve other resources
}
```

```javascript
// JavaScript: Receive spectrum data
window.__JUCE__.backend.addEventListener("spectrumData", (data) => {
    drawSpectrum(ctx, data);
});

// Alternative: Fetch binary data for better performance
async function fetchSpectrumBinary() {
    const response = await fetch(
        Juce.getBackendResourceAddress() + "/spectrum.bin"
    );
    const buffer = await response.arrayBuffer();
    const spectrum = new Float32Array(buffer);
    drawSpectrum(ctx, spectrum);
}
```

---

## JavaScript Integration

### JUCE Bridge API

The exported `bindings.js` includes a JUCEBridge module for parameter communication:

```javascript
JUCEBridge.setParameter(paramId, value)     // Fire-and-forget update
JUCEBridge.getParameter(paramId)            // Async value query (returns Promise)
JUCEBridge.beginGesture(paramId)            // Start automation gesture
JUCEBridge.endGesture(paramId)              // End automation gesture
```

### Event-Based Pattern

JUCE uses events, not direct function calls:
- Functions invoked via `__juce__invoke` events
- Results via `__juce__complete` events
- Fire-and-forget for instant UI response (no blocking during knob drags)

```javascript
// How the bridge invokes native functions internally:
window.__JUCE__.backend.emitEvent('__juce__invoke', {
  name: 'setParameter',
  params: [paramId, value],
  resultId: Math.random()
});
```

### Automatic Setup Functions

Bindings.js automatically generates interaction handlers for each bound element:
- `setupKnobInteraction(knobId, paramId)` - Drag-to-rotate with gesture support
- `setupSliderInteraction(sliderId, paramId)` - Linear drag with orientation detection
- `setupButtonInteraction(buttonId, paramId)` - Momentary/toggle mode support

All are initialized in DOMContentLoaded with automatic JUCE bridge detection.

### Standalone Mode

When running outside JUCE (e.g., browser preview):
- JUCEBridge detects missing `window.__JUCE__` object
- Falls back to mock mode with console logging
- UI controls remain interactive for design testing
- Status indicator shows "Standalone Mode"

---

## Interaction Patterns

### Standard Behaviors to Implement

| Action | Behavior |
|--------|----------|
| **Double-click** | Reset to default value |
| **Shift + drag** | Fine adjustment (4-10x precision) |
| **Ctrl/Cmd + drag** | Snap to grid/steps |
| **Alt + drag** | Constrain to axis |
| **Mouse wheel** | Increment/decrement value |
| **Right-click** | Context menu (MIDI learn, reset, etc.) |
| **Ctrl/Cmd + C/V** | Copy/paste value |

### Touch Considerations

- Minimum touch target: 44x44 px
- Support two-finger gestures for fine control
- Long-press for context menu
- Prevent accidental scrolling during control manipulation

---

## Resources

### Libraries to Study

| Library | Purpose | URL |
|---------|---------|-----|
| **webaudio-controls** | WebComponents for audio UI | github.com/g200kg/webaudio-controls |
| **NexusUI** | Canvas-based audio widgets | nexus-js.github.io/ui |
| **audioMotion-analyzer** | Spectrum analyzer | github.com/hvianna/audioMotion-analyzer |
| **svg-knob** | Configurable SVG knobs | github.com/francoisgeorgy/svg-knob |
| **@dnd-kit** | Modern drag-and-drop | dndkit.com |
| **Zustand** | Lightweight state management | github.com/pmndrs/zustand |

### GitHub Repositories

| Repo | Description |
|------|-------------|
| **JanWilczek/juce-webview-tutorial** | JUCE 8 WebView tutorial |
| **mbarzach/Sound-Field** | React + Three.js + JUCE WebView |
| **tomduncalf/tomduncalf_juce_web_ui** | JUCE WebView with MobX |
| **COx2/audio-plugin-web-ui** | Svelte + JUCE example |

### Design References

- Plugin Boutique (browse modern plugin UIs)
- KVR Audio (plugin database with screenshots)
- Voger Design (UI kits and inspiration)

---

## Export Format Reference

### Generated HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plugin UI</title>
  <style>
    /* Generated CSS */
  </style>
</head>
<body>
  <div id="plugin-container" style="width: 800px; height: 600px;">
    <!-- Generated SVG elements -->
  </div>
  
  <script type="module">
    // Generated JavaScript
    import { Juce } from './juce-framework-frontend.js';
    
    // Parameter bindings
    // Event handlers
    // Visualization setup
  </script>
</body>
</html>
```

### Generated C++ Boilerplate

```cpp
// PluginEditor.h - Generated bindings
// Add these to your editor class:

WebSliderRelay knob_gain { browser, "knob_gain" };
WebSliderRelay slider_cutoff { browser, "slider_cutoff" };
// ... more relays

WebSliderParameterAttachment knob_gain_attachment;
WebSliderParameterAttachment slider_cutoff_attachment;
// ... more attachments
```

---

*Document Version: 1.0*
*Last Updated: January 2025*
*For use with Claude Code / GSD Framework*