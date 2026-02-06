# Element Reference

Complete reference for all UI elements available in Faceplate.

## Element Categories

| Category | Count | Description |
|----------|-------|-------------|
| [Controls](#controls) | 26 | Interactive input elements (knobs, sliders, buttons) |
| [Displays](#displays) | 43 | Value displays, meters |
| [Visualizations](#visualizations) | 5 | Real-time audio analysis displays |
| [Curves](#curves) | 5 | Interactive DSP curve editors |
| [Containers](#containers) | 8 | Structural grouping elements |
| [Decorative](#decorative) | 4 | Static visual elements |
| [Specialized Audio](#specialized-audio) | 16 | Domain-specific audio tools |
| **Total** | **107** | |

---

## Universal Properties

All elements share these base properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Display name (becomes HTML ID in kebab-case) |
| `type` | string | Element type identifier |
| `x`, `y` | number | Position on canvas (pixels) |
| `width`, `height` | number | Dimensions (pixels) |
| `rotation` | number | Rotation angle (degrees) |
| `zIndex` | number | Layer order (higher = on top) |
| `locked` | boolean | Prevent editing |
| `visible` | boolean | Visibility toggle |
| `layerId` | string | Layer assignment (optional, defaults to "default") |
| `parameterId` | string | JUCE parameter binding (optional) |
| `parentId` | string | Container parent (optional) |

**Help:** Press **F1** while an element is selected to open contextual help for that element type. Each property section in the Properties panel also has a (?) button for detailed documentation.

---

## Controls

Interactive elements that users can manipulate.

### Knobs

#### knob
Standard rotary knob with arc display. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `diameter` | number | 80 | Knob size in pixels |
| `min` | number | 0 | Minimum value |
| `max` | number | 1 | Maximum value |
| `value` | number | 0.5 | Current normalized value (0-1) |
| `startAngle` | number | -135 | Arc start angle (degrees) |
| `endAngle` | number | 135 | Arc end angle (degrees) |
| `style` | string | "arc" | Visual style: arc, filled, dot, line |
| `trackColor` | string | "#333" | Background arc color |
| `fillColor` | string | "#00ff88" | Value fill color |
| `indicatorColor` | string | "#fff" | Indicator line/dot color |
| `trackWidth` | number | 4 | Arc stroke width |
| `showLabel` | boolean | false | Show label text |
| `labelPosition` | string | "below" | Label position: above, below, left, right |
| `labelDistance` | number | 8 | Distance from knob to label |
| `showValue` | boolean | false | Show value text |
| `valueFormat` | string | "numeric" | Format: numeric, percentage, db, hz, custom |

**JavaScript binding:**
```javascript
setupKnobInteraction('knob-id', 'parameterId', 0.5);
```

**Export HTML:**
```html
<div id="gain-knob" class="knob knob-element"
     data-type="knob" data-value="0.5"
     data-start-angle="-135" data-end-angle="135">
  <svg viewBox="0 0 80 80">
    <path class="knob-arc-track" d="..." />
    <path class="knob-arc-fill" d="..." />
    <line class="knob-indicator" ... />
  </svg>
</div>
```

---

#### steppedknob
Knob with discrete step positions. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `stepCount` | number | 12 | Number of steps (12/24/36/48/64) |
| `showStepIndicators` | boolean | true | Show tick marks at steps |
| *(plus all knob properties)* | | | |

---

#### centerdetentknob
Knob that snaps to center position (pan/EQ style). Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `snapThreshold` | number | 0.05 | Distance from center to snap (0-1) |
| `showCenterMark` | boolean | true | Show center indicator |
| *(plus all knob properties)* | | | |

---

#### dotindicatorknob
Knob with minimal dot indicator aesthetic. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `dotRadius` | number | 4 | Indicator dot radius |
| *(plus knob properties, no fillColor)* | | | |

---

### Sliders

#### slider
Linear vertical/horizontal slider. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `orientation` | string | "vertical" | Direction: vertical, horizontal |
| `min` | number | 0 | Minimum value |
| `max` | number | 1 | Maximum value |
| `value` | number | 0.5 | Current normalized value (0-1) |
| `trackColor` | string | "#333" | Track background color |
| `trackFillColor` | string | "#00ff88" | Fill color |
| `trackWidth` | number | 8 | Track thickness |
| `thumbColor` | string | "#fff" | Thumb color |
| `thumbWidth` | number | 20 | Thumb width |
| `thumbHeight` | number | 20 | Thumb height |
| `showLabel` | boolean | false | Show label text |
| `showValue` | boolean | false | Show value text |

**JavaScript binding:**
```javascript
setupSliderInteraction('slider-id', 'parameterId', 0.5);
```

---

#### rangeslider
Dual-thumb slider for selecting a range (min/max values). Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `orientation` | string | "vertical" | Direction: vertical, horizontal |
| `min` | number | 0 | Minimum range value |
| `max` | number | 1 | Maximum range value |
| `valueLow` | number | 0.3 | Lower thumb position (0-1) |
| `valueHigh` | number | 0.7 | Upper thumb position (0-1) |
| `trackColor` | string | "#333" | Track background color |
| `trackFillColor` | string | "#00ff88" | Fill color between thumbs |
| `trackWidth` | number | 8 | Track thickness |
| `thumbColor` | string | "#fff" | Thumb color |
| `thumbWidth` | number | 20 | Thumb width |
| `thumbHeight` | number | 20 | Thumb height |

**JavaScript binding:**
```javascript
setupRangeSliderInteraction('range-slider-id', 'paramIdLow', 'paramIdHigh', 0.3, 0.7);
```

---

#### arcslider
Circular slider moving along an arc path. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `diameter` | number | 100 | Arc diameter |
| `startAngle` | number | -135 | Start angle |
| `endAngle` | number | 135 | End angle |
| `trackWidth` | number | 8 | Arc track width |
| `thumbRadius` | number | 10 | Thumb circle radius |

---

#### bipolarslider
Slider with center position (pan/balance). Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `centerValue` | number | 0.5 | Center position value |
| `centerLineColor` | string | "#666" | Center mark color |
| *(plus slider properties)* | | | |

---

#### crossfadeslider
Slider with A/B labels for crossfading. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `labelA` | string | "A" | Left/bottom label |
| `labelB` | string | "B" | Right/top label |
| `labelColor` | string | "#888" | Label text color |
| `labelFontSize` | number | 12 | Label font size |

---

#### notchedslider
Slider with detent/notch positions. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `notchCount` | number | 5 | Number of notch positions |
| `notchPositions` | number[] | [] | Custom notch positions (0-1) |
| `showNotchLabels` | boolean | true | Show labels at notches |
| `notchColor` | string | "#666" | Notch mark color |

---

#### multislider
Multiple parallel sliders (equalizer-style). Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `bandCount` | number | 8 | Number of slider bands |
| `bandValues` | number[] | [0.5...] | Value per band (0-1) |
| `min` | number | -12 | Minimum value (dB) |
| `max` | number | 12 | Maximum value (dB) |
| `labelStyle` | string | "frequency" | Labels: frequency, index, hidden |
| `customLabels` | string[] | [] | Custom band labels |
| `linkMode` | string | "independent" | always-linked, modifier-linked, independent |
| `bandGap` | number | 4 | Gap between bands |

---

### Buttons

#### button
Simple momentary or toggle button. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `mode` | string | "momentary" | Button mode: momentary, toggle |
| `label` | string | "Button" | Button text |
| `pressed` | boolean | false | Current pressed state |
| `action` | string | "" | Special action: navigate-window |
| `targetWindowId` | string | "" | Navigation target window ID |
| `fontSize` | number | 14 | Label font size |
| `fontFamily` | string | "Inter" | Font family |
| `fontWeight` | string | "500" | Font weight |
| `backgroundColor` | string | "#2a2a2a" | Background color |
| `textColor` | string | "#fff" | Label text color |
| `borderColor` | string | "#444" | Border color |
| `borderRadius` | number | 4 | Corner radius |

**JavaScript binding:**
```javascript
setupButtonInteraction('button-id', 'parameterId');
```

---

#### iconbutton
Button with icon (built-in or custom asset). Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `iconSource` | string | "builtin" | Icon source: builtin, asset |
| `builtInIcon` | string | "play" | Built-in icon name |
| `assetId` | string | "" | Custom SVG asset ID |
| `mode` | string | "momentary" | Button mode |
| `pressed` | boolean | false | Pressed state |
| `backgroundColor` | string | "#2a2a2a" | Background |
| `iconColor` | string | "#fff" | Icon color |

**Built-in icons include:** play, pause, stop, record, loop, skip-forward, skip-back, volume, mute, solo, bypass, power, settings, preset, save, load, plus 20+ more audio-specific icons.

---

#### toggleswitch
On/off toggle switch. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `isOn` | boolean | false | Current state |
| `onColor` | string | "#00ff88" | On state color |
| `offColor` | string | "#333" | Off state color |
| `thumbColor` | string | "#fff" | Thumb color |
| `showLabels` | boolean | true | Show on/off labels |
| `onLabel` | string | "ON" | On state label |
| `offLabel` | string | "OFF" | Off state label |

---

#### powerbutton
Power button with LED indicator. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `isOn` | boolean | false | Power state |
| `ledPosition` | string | "top" | LED position: top, bottom, left, right |
| `ledSize` | number | 8 | LED diameter |
| `ledOnColor` | string | "#00ff88" | LED on color |
| `ledOffColor` | string | "#333" | LED off color |
| `label` | string | "POWER" | Button label |

---

#### rockerswitch
Three-position rocker switch. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `position` | number | 1 | Current position: 0=down, 1=center, 2=up |
| `mode` | string | "latch-all" | spring-to-center, latch-all-positions |
| `showLabels` | boolean | true | Show position labels |
| `upLabel` | string | "UP" | Up position label |
| `downLabel` | string | "DOWN" | Down position label |

---

#### rotaryswitch
Rotary selector with N positions. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `positionCount` | number | 4 | Number of positions (2-12) |
| `currentPosition` | number | 0 | Selected position index |
| `positionLabels` | string[] | [] | Label per position |
| `rotationAngle` | number | 270 | Total rotation range |
| `labelLayout` | string | "radial" | Label layout: radial, legend |

---

#### segmentbutton
Multi-segment button (like tabs). Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `segmentCount` | number | 3 | Number of segments (2-8) |
| `segments` | object[] | [] | Segment configs (displayMode, text/icon) |
| `selectionMode` | string | "single" | Selection: single, multi |
| `selectedIndices` | number[] | [0] | Selected segment indices |
| `orientation` | string | "horizontal" | Layout direction |

---

### Selection Controls

#### dropdown
Single-select dropdown.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | string[] | [] | Available options |
| `selectedIndex` | number | 0 | Currently selected index |
| `fontSize` | number | 14 | Font size |
| `backgroundColor` | string | "#2a2a2a" | Background |
| `textColor` | string | "#fff" | Text color |
| `borderColor` | string | "#444" | Border color |

---

#### multiselectdropdown
Multiple selection dropdown.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | string[] | [] | Available options |
| `selectedIndices` | number[] | [] | Selected option indices |
| `maxSelections` | number | 0 | Max selections (0=unlimited) |
| `dropdownMaxHeight` | number | 200 | Max dropdown height |

---

#### combobox
Text input with dropdown suggestions.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | string[] | [] | Suggestion options |
| `selectedValue` | string | "" | Current text value |
| `placeholder` | string | "" | Placeholder text |

---

#### checkbox
Checkbox with label.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `checked` | boolean | false | Checked state |
| `label` | string | "Option" | Label text |
| `labelPosition` | string | "right" | Label position: left, right |
| `checkColor` | string | "#00ff88" | Checkmark color |

---

#### radiogroup
Group of radio buttons.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | string[] | [] | Option labels |
| `selectedIndex` | number | 0 | Selected option index |
| `orientation` | string | "vertical" | Layout: vertical, horizontal |
| `spacing` | number | 8 | Space between options |

---

#### textfield
Single-line text input.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | "" | Current text value |
| `placeholder` | string | "" | Placeholder text |
| `maxLength` | number | 0 | Max characters (0=unlimited) |
| `textAlign` | string | "left" | Text alignment |

---

## Displays

Read-only value displays and indicators.

### Basic Displays

#### label
Static text label.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | string | "Label" | Display text |
| `fontSize` | number | 14 | Font size |
| `fontFamily` | string | "Inter" | Font family |
| `fontWeight` | string | "400" | Font weight |
| `color` | string | "#888" | Text color |
| `textAlign` | string | "left" | Alignment: left, center, right |

---

#### dbdisplay
Decibel value display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | number | -6 | Value in dB |
| `minDb` | number | -60 | Minimum displayed dB |
| `maxDb` | number | 6 | Maximum displayed dB |
| `decimalPlaces` | number | 1 | Decimal precision |
| `showUnit` | boolean | true | Show "dB" suffix |

---

#### frequencydisplay
Frequency value display (Hz/kHz).

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | number | 1000 | Value in Hz |
| `decimalPlaces` | number | 1 | Decimal precision |
| `autoSwitchKHz` | boolean | true | Auto switch to kHz above 1000 |
| `showUnit` | boolean | true | Show Hz/kHz suffix |

---

#### numericdisplay, timedisplay, percentagedisplay, ratiodisplay, notedisplay, bpmdisplay
Specialized value displays with configurable formats, 7-segment or modern font styles, and optional bezel styling.

---

### Meters

#### meter
Simple meter/gauge display. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `orientation` | string | "vertical" | Orientation |
| `value` | number | 0.5 | Normalized value (0-1) |
| `min` | number | 0 | Minimum value |
| `max` | number | 1 | Maximum value |
| `colorStops` | object[] | [] | Gradient color stops |
| `backgroundColor` | string | "#1a1a1a" | Background |
| `showPeakHold` | boolean | false | Show peak hold indicator |

---

#### gainreductionmeter
Gain reduction visualizer for compressors.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | number | 0 | Current GR (0-1 normalized) |
| `maxReduction` | number | 20 | Max dB range |
| `meterColor` | string | "#ff6600" | Meter fill color |
| `showValue` | boolean | true | Show numeric readout |

---

### Professional Meters

All professional meters share common properties:

| Property | Type | Description |
|----------|------|-------------|
| `value` / `valueL`, `valueR` | number | Normalized value (0-1) |
| `minDb` | number | Minimum dB |
| `maxDb` | number | Maximum dB |
| `orientation` | string | vertical/horizontal |
| `segmentCount` | number | Number of LED segments |
| `segmentGap` | number | Gap between segments |
| `scalePosition` | string | Scale label position |
| `showPeakHold` | boolean | Enable peak hold |
| `colorZones` | object[] | Color gradient zones |

**Available meter types:**

| Type | Range | Description |
|------|-------|-------------|
| `rmsmetermo`, `rmsmeterstereo` | -60 to 0 dB | RMS level metering |
| `vumetermono`, `vumeterstereo` | -20 to +3 dB | VU standard metering |
| `ppmtype1mono`, `ppmtype1stereo` | -50 to +5 dB | PPM Type I (10ms attack) |
| `ppmtype2mono`, `ppmtype2stereo` | -50 to +5 dB | PPM Type II |
| `truepeakmetermono`, `truepeakmeterstereo` | -60 to 0 dB | True peak detection |
| `lufsmomomo`, `lufsmomostereo` | -60 to 0 LUFS | LUFS Momentary (400ms) |
| `lufsshortmono`, `lufsshortstereo` | -60 to 0 LUFS | LUFS Short-term (3s) |
| `lufsintmono`, `lufsintstereo` | -60 to 0 LUFS | LUFS Integrated |
| `k12metermono`, `k12meterstereo` | -32 to +12 dB | K-12 system |
| `k14metermono`, `k14meterstereo` | -34 to +14 dB | K-14 system |
| `k20metermono`, `k20meterstereo` | -40 to +20 dB | K-20 system |
| `correlationmeter` | -1 to +1 | Phase correlation |
| `stereowidthmeter` | 0 to 200% | Stereo width |

---

## Visualizations

Real-time canvas-based audio displays.

#### scrollingwaveform
Scrolling waveform display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `displayMode` | string | "line" | Render mode: line, fill |
| `waveformColor` | string | "#00ff88" | Waveform color |
| `backgroundColor` | string | "#1a1a1a" | Background |
| `showGrid` | boolean | true | Show grid lines |
| `gridColor` | string | "#333" | Grid color |
| `canvasScale` | number | 1 | Canvas resolution scale |

---

#### spectrumanalyzer
Real-time FFT spectrum display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fftSize` | number | 2048 | FFT size (512-8192) |
| `frequencyScale` | string | "log" | Scale: linear, log, mel |
| `colorGradient` | string | "default" | Color scheme |
| `barGap` | number | 1 | Gap between bars |
| `showFrequencyLabels` | boolean | true | Show Hz labels |
| `showDbScale` | boolean | true | Show dB scale |

---

#### spectrogram
Time-frequency spectrogram display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fftSize` | number | 2048 | FFT size |
| `colorMap` | string | "default" | Color mapping |
| `showFrequencyLabels` | boolean | true | Show Hz labels |
| `showTimeLabels` | boolean | true | Show time labels |

---

#### goniometer
Stereo phase/correlation display (Lissajous).

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `traceColor` | string | "#00ff88" | Trace color |
| `showGrid` | boolean | true | Show grid |
| `showAxisLines` | boolean | true | Show L/R, M/S axes |

---

#### vectorscope
Stereo vectorscope display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `traceColor` | string | "#00ff88" | Trace color |
| `showGrid` | boolean | true | Show grid |
| `showAxisLines` | boolean | true | Show axes |

---

## Curves

Interactive DSP curve editors.

#### eqcurve
EQ curve editor with draggable band handles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `bands` | object[] | [] | Band configs {frequency, gain, Q} |
| `bandCount` | number | 4 | Number of bands |
| `minDb` | number | -12 | Minimum dB |
| `maxDb` | number | 12 | Maximum dB |
| `minFreq` | number | 20 | Minimum frequency |
| `maxFreq` | number | 20000 | Maximum frequency |
| `curveColor` | string | "#00ff88" | Curve line color |
| `showIndividualBands` | boolean | true | Show individual band curves |
| `handleColor` | string | "#fff" | Handle color |

---

#### compressorcurve
Compressor transfer curve display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `threshold` | number | -18 | Threshold dB |
| `ratio` | number | 4 | Compression ratio |
| `knee` | number | 0 | Knee width dB |
| `displayMode` | string | "transfer" | Mode: transfer, gainreduction |

---

#### envelopedisplay
ADSR envelope visualizer.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `attack` | number | 0.1 | Attack (0-1) |
| `decay` | number | 0.2 | Decay (0-1) |
| `sustain` | number | 0.7 | Sustain level (0-1) |
| `release` | number | 0.3 | Release (0-1) |
| `curveType` | string | "linear" | Curve: linear, exponential |
| `showStageColors` | boolean | true | Color-code stages |

---

#### lfodisplay
LFO waveform display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `shape` | string | "sine" | Waveform shape |
| `pulseWidth` | number | 0.5 | Pulse width (0-1) |

**Shapes:** sine, triangle, saw-up, saw-down, square, pulse, sample-hold, smooth-random

---

#### filterresponse
Filter frequency response curve.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `filterType` | string | "lowpass" | Filter type |
| `cutoffFrequency` | number | 1000 | Cutoff Hz |
| `resonance` | number | 1 | Q factor |
| `gain` | number | 0 | Gain dB (for shelf/peak) |

**Filter types:** lowpass, highpass, bandpass, notch, lowshelf, highshelf, peak

---

## Containers

Structural elements that can contain other elements.

**Child Positioning:** Children inside containers use coordinates relative to the container's content area (inside padding/border). A child at `x: 0, y: 0` appears at the top-left of the container's content area. The designer and export both use this same coordinate system.

#### panel
Simple panel container.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | string | "#2a2a2a" | Background |
| `borderRadius` | number | 4 | Corner radius |
| `borderWidth` | number | 0 | Border thickness |
| `borderColor` | string | "#444" | Border color |
| `padding` | number | 8 | Inner padding |
| `allowScroll` | boolean | false | Enable scrolling |
| `children` | string[] | [] | Child element IDs |

---

#### frame
Frame with border styling.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `borderStyle` | string | "solid" | Style: solid, dashed, dotted, double, groove, ridge |
| *(plus panel properties)* | | | |

---

#### groupbox
Labeled group container.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `headerText` | string | "Group" | Header label |
| `headerFontSize` | number | 12 | Header font size |
| `headerColor` | string | "#888" | Header text color |
| `headerBackground` | string | "transparent" | Header background |
| *(plus panel properties)* | | | |

---

#### collapsible
Collapsible/accordion container.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `headerText` | string | "Section" | Header label |
| `headerHeight` | number | 32 | Header height |
| `collapsed` | boolean | false | Collapsed state |
| `contentBackground` | string | "#1a1a1a" | Content background |
| `maxContentHeight` | number | 300 | Max expanded height |
| `scrollBehavior` | string | "auto" | Scroll: auto, hidden, scroll |

---

## Decorative

Static visual elements.

#### image
Raster image display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | string | "" | Image URL or base64 data |
| `assetId` | string | "" | Asset library reference |
| `fit` | string | "contain" | Fit mode: contain, cover, fill, none |

---

#### svggraphic
SVG graphic display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `assetId` | string | "" | SVG asset ID from library |
| `flipH` | boolean | false | Horizontal flip |
| `flipV` | boolean | false | Vertical flip |
| `opacity` | number | 1 | Opacity (0-1) |

---

#### rectangle
Filled rectangle shape.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fillColor` | string | "#2a2a2a" | Fill color |
| `fillOpacity` | number | 1 | Fill opacity (0-1) |
| `borderWidth` | number | 0 | Border thickness |
| `borderColor` | string | "#444" | Border color |
| `borderStyle` | string | "solid" | Border style |
| `borderRadius` | number | 0 | Corner radius |

---

#### line
Line/stroke shape.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `strokeWidth` | number | 2 | Line thickness |
| `strokeColor` | string | "#444" | Line color |
| `strokeStyle` | string | "solid" | Style: solid, dashed, dotted |

---

## Specialized Audio

Domain-specific elements for audio plugin design.

#### pianokeyboard
Interactive piano keyboard.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `startNote` | number | 36 | First MIDI note (C2) |
| `endNote` | number | 84 | Last MIDI note (C6) |
| `showNoteLabels` | boolean | true | Show note names |
| `labelOctavesOnly` | boolean | true | Only label C notes |
| `whiteKeyColor` | string | "#fff" | White key color |
| `blackKeyColor` | string | "#1a1a1a" | Black key color |
| `activeKeyColor` | string | "#00ff88" | Pressed key color |
| `activeNotes` | number[] | [] | Currently active MIDI notes |

---

#### drumpad
Individual drum pad trigger.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | "PAD" | Pad label |
| `midiNote` | number | 36 | MIDI note number |
| `isPressed` | boolean | false | Pressed state |
| `velocity` | number | 127 | Velocity (0-127) |
| `showVelocity` | boolean | false | Show velocity indicator |

---

#### padgrid
Grid of drum pads.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rows` | number | 4 | Grid rows |
| `columns` | number | 4 | Grid columns |
| `padLabels` | string[] | [] | Labels per pad |
| `startNote` | number | 36 | First MIDI note |
| `activePads` | number[] | [] | Active pad indices |
| `gridGap` | number | 4 | Gap between pads |

---

#### stepsequencer
Step sequencer for patterns.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `stepCount` | number | 16 | Steps per pattern |
| `rowCount` | number | 4 | Number of rows |
| `steps` | object[] | [] | Step data {active, velocity, note} |
| `currentStep` | number | 0 | Playhead position |
| `beatsPerMeasure` | number | 4 | Time signature |
| `highlightDownbeats` | boolean | true | Highlight beat 1 |

---

#### xypad
2D XY touch pad.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `xValue` | number | 0.5 | X position (0-1) |
| `yValue` | number | 0.5 | Y position (0-1) |
| `xLabel` | string | "X" | X axis label |
| `yLabel` | string | "Y" | Y axis label |
| `showGrid` | boolean | true | Show grid |
| `gridDivisions` | number | 4 | Grid divisions |
| `cursorSize` | number | 16 | Cursor diameter |
| `showCrosshair` | boolean | true | Show crosshair lines |

---

#### wavetabledisplay
Wavetable frame viewer.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `frameCount` | number | 32 | Number of frames |
| `currentFrame` | number | 0 | Selected frame |
| `perspectiveAngle` | number | 30 | 3D perspective angle |
| `frameSpacing` | number | 4 | Space between frames |
| `showFrameLabels` | boolean | true | Show frame numbers |
| `fillWaveform` | boolean | false | Fill waveforms |

---

#### harmoniceditor
Harmonic series editor (additive synthesis).

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `harmonicCount` | number | 16 | Number of harmonics |
| `harmonicValues` | number[] | [] | Harmonic amplitudes (0-1) |
| `showFundamental` | boolean | true | Highlight fundamental |
| `showHarmonicNumbers` | boolean | true | Show harmonic labels |
| `selectedHarmonic` | number | -1 | Currently selected |

---

#### envelopeeditor
Interactive ADSR envelope editor with draggable points.

#### sampledisplay
Sample waveform viewer with zoom and selection.

#### looppoints
Sample loop editor with crossfade controls.

#### patchbay
Virtual patch bay/routing matrix.

#### signalflow
Signal flow diagram for routing visualization.

---

## See Also

- [User Manual](manual/README.md) -- Complete user guide with tutorials
- [Properties Panel Guide](manual/properties.md) -- How to use the Properties panel
- [Element Styles Guide](manual/styles.md) -- Custom SVG styles for elements
- [Style Creation Manual](STYLE_CREATION_MANUAL.md) -- SVG layer naming and import workflow
- [Faceplate Documentation](FACEPLATE_DOCUMENTATION.md) -- Complete technical specification

## Related Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - JUCE integration walkthrough
- [JUCE_PATTERN.md](./JUCE_PATTERN.md) - Communication pattern
- [EXPORT_FORMAT.md](./EXPORT_FORMAT.md) - Export file details
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Design guidelines

---

*Last updated: 6 February 2026*
