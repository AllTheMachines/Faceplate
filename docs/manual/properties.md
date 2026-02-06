# Properties Panel

The Properties panel on the right side of the interface shows the settings for the currently selected element. Select any element on the canvas to view and edit its properties here.

![Properties panel showing settings for a selected knob element](http://all-the-machines.com/github/faceplate/manual/properties-panel-overview.png)

## Common Properties

All elements share these properties regardless of type.

### Position & Size

| Property | Type | Description |
|----------|------|-------------|
| X | number | Horizontal position on the canvas (pixels) |
| Y | number | Vertical position on the canvas (pixels) |
| Width | number | Element width (pixels, minimum 20) |
| Height | number | Element height (pixels, minimum 20) |

### Identity

| Property | Type | Description |
|----------|------|-------------|
| Name | text | Display name for the element (becomes the HTML ID in exported code) |
| Parameter ID | text | Optional binding to a JUCE audio parameter (see [Parameter Binding](#parameter-binding) below) |

### Lock

Check **Lock element** to prevent the element from being moved or resized on the canvas. Locked elements can still have their properties edited in this panel.

### SVG Export

For elements that support it, an **Export** button lets you download the element as an SVG file with named layers. This is useful for creating custom element styles (see [Element Styles](styles.md)).

## Parameter Binding

The **Parameter ID** field is the bridge between a UI element in Faceplate and an audio parameter in your JUCE plugin. When you export your design, each element's Parameter ID tells the generated JavaScript which JUCE parameter to control.

For example, if you have a knob that controls volume, you would set its Parameter ID to `gain`. In your JUCE plugin, you would define an audio parameter with the same name. When the user turns the knob in the exported UI, the value is sent to the `gain` parameter in your audio processor.

```
Faceplate Element  -->  parameterId  -->  Exported JavaScript  -->  JUCE WebView2  -->  AudioProcessor
     (UI knob)          ("gain")       (setParameter call)      (native function)    (DSP parameter)
```

Here's what the JUCE C++ code looks like for defining the matching audio parameter:

```cpp
// PluginProcessor.cpp - Define audio parameter
params.push_back(std::make_unique<juce::AudioParameterFloat>(
    "gain",           // Must match Faceplate's Parameter ID
    "Gain",
    0.0f, 1.0f, 0.5f
));
```

The Parameter ID is a freeform text field -- it must match the parameter name defined in your JUCE C++ code exactly. Any element that the user interacts with (knobs, sliders, buttons, switches) can have a Parameter ID. Display-only elements like meters and labels typically do not need one.

![Parameter ID field in the Identity section of the properties panel](http://all-the-machines.com/github/faceplate/manual/properties-parameter-id-field.png)

## Element-Specific Properties

Beyond the common properties, each element type has its own settings. This section covers the most common property patterns by category. For a complete listing of every element's properties, see the [Element Reference](../ELEMENT_REFERENCE.md).

### Rotary Controls (Knobs)

| Property | Type | Description |
|----------|------|-------------|
| min | number | Minimum value (default: 0) |
| max | number | Maximum value (default: 1) |
| value | number | Current value |
| startAngle | number | Arc start angle in degrees (default: -135) |
| endAngle | number | Arc end angle in degrees (default: 135) |
| style | select | Visual style: arc, filled, dot, or line |
| trackColor | color | Color of the knob track |
| fillColor | color | Color of the filled arc |
| showLabel | boolean | Show text label near the knob |
| showValue | boolean | Show current value readout |
| styleId | select | Custom SVG style from Element Styles |

### Linear Controls (Sliders)

| Property | Type | Description |
|----------|------|-------------|
| orientation | select | Vertical or horizontal |
| min | number | Minimum value |
| max | number | Maximum value |
| value | number | Current value |
| trackColor | color | Color of the slider track |
| trackFillColor | color | Color of the filled portion |
| thumbColor | color | Color of the draggable thumb |
| showLabel | boolean | Show text label |
| showValue | boolean | Show current value readout |
| styleId | select | Custom SVG style from Element Styles |

### Buttons & Switches

| Property | Type | Description |
|----------|------|-------------|
| label | text | Button text |
| action | select | Click behavior: toggle, momentary, or navigate |
| targetWindowId | select | Target window for navigate action |
| backgroundColor | color | Button background color |
| textColor | color | Button text color |
| borderWidth | number | Border thickness in pixels |
| borderRadius | number | Corner rounding in pixels |
| fontSize | number | Label font size |
| fontFamily | select | Label font family |
| styleId | select | Custom SVG style from Element Styles |

### Meters

| Property | Type | Description |
|----------|------|-------------|
| orientation | select | Vertical or horizontal |
| value | number | Current meter level (0-1) |
| meterColor | color | Main meter fill color |
| backgroundColor | color | Meter background color |
| peakHold | boolean | Show peak hold indicator |
| peakHoldTime | number | Peak hold duration in milliseconds |
| segments | number | Number of meter segments (0 for smooth) |
| styleId | select | Custom SVG style from Element Styles |

### Specialized Controls

Specialized control elements have properties specific to their unique function:

| Property | Type | Description |
|----------|------|-------------|
| steps | number | Number of discrete positions (for stepped knobs, rotary switches) |
| detentValue | number | Center detent value (for center-detent knobs) |
| detentRange | number | Snap-back range around detent value |
| bipolar | boolean | Whether the control has a center zero point |
| crossfadeValue | number | Crossfade position (-1 to 1, for crossfade sliders) |

### Value Displays

Display elements show values but are not interactive. Common properties include:

| Property | Type | Description |
|----------|------|-------------|
| value | number | Current display value |
| format | select | Display format (number, time, decibels, percentage) |
| decimals | number | Number of decimal places to show |
| prefix | text | Text before the value (e.g., "$", "Hz") |
| suffix | text | Text after the value (e.g., "dB", "ms") |
| fontSize | number | Text size in pixels |
| fontFamily | select | Font family for text |
| fontWeight | select | Font weight (normal, bold, etc.) |
| textColor | color | Color of the text |
| backgroundColor | color | Background color of the display area |

### Text & Labels

Text elements display static or dynamic text:

| Property | Type | Description |
|----------|------|-------------|
| text | text | The text content to display |
| fontSize | number | Text size in pixels |
| fontFamily | select | Font family |
| fontWeight | select | Font weight (normal, bold, etc.) |
| textColor | color | Color of the text |
| textAlign | select | Horizontal alignment (left, center, right) |
| verticalAlign | select | Vertical alignment (top, middle, bottom) |

### Curves & Visualizations

Audio curve displays (EQ curves, envelope displays, spectrum analyzers) have properties related to their visualization:

| Property | Type | Description |
|----------|------|-------------|
| lineColor | color | Color of the curve line |
| lineWidth | number | Thickness of the curve line |
| fillColor | color | Fill color under the curve |
| gridColor | color | Color of the background grid |
| showGrid | boolean | Show background grid lines |
| backgroundColor | color | Background color of the display area |
| fftSize | number | FFT size for frequency analysis (spectrum analyzer, spectrogram) |
| smoothing | number | Smoothing factor (0-1) for smoother visualizations |

### Containers

Container elements group other elements together. Common container properties:

| Property | Type | Description |
|----------|------|-------------|
| backgroundColor | color | Container background color |
| borderWidth | number | Border thickness in pixels |
| borderColor | color | Border color |
| borderRadius | number | Corner rounding in pixels |
| padding | number | Inner padding around child elements |
| overflow | select | How to handle content that exceeds bounds (visible, hidden, scroll) |

Elements inside containers can be edited by double-clicking the container or using the **Edit Contents** button. See the [Element Reference](../ELEMENT_REFERENCE.md) for details on specific container types.

## Help

Each section in the Properties panel has a **(?)** button in its header. Click this button to open a help panel with detailed documentation about that section's properties.

You can also press **F1** while an element is selected to open contextual help for that element type. The help panel includes **Related Topics** links at the bottom for navigating to related documentation.

![Help panel open showing property documentation and Related Topics links](http://all-the-machines.com/github/faceplate/manual/properties-help-panel-open.png)

---

[Back to User Manual](README.md) | [Canvas](canvas.md) | [Element Palette](palette.md) | [Layers](layers.md)
