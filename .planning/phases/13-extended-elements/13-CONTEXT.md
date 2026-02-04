# Phase 13: Extended Elements

## Goal
Expand the element library with container elements, form controls, specialized audio displays, and enhanced control elements to support complex professional plugin UIs.

## Depends on
Phase 12

## Categories

### 1. Control Enhancements
- **Knob with Label/Value** - All knobs get optional attached label and value display fields
- **Slider with Label/Value** - All sliders get optional attached label and value display fields
- **Range Slider** - Dual-thumb slider for min/max range selection (e.g., frequency range)

### 2. Container Elements
| Element | Description | Use Case |
|---------|-------------|----------|
| **Panel** | Grouped container with background | Section grouping |
| **Frame** | Bordered container | Visual separation |
| **Group Box** | Labeled container with header | Parameter groups |
| **Collapsible Container** | Container with label header, collapse toggle, scrollbars | Organizing complex sections |

### 3. Form Controls
- **Dropdown** - Select from list of options
- **Checkbox** - Boolean toggle with label
- **Radio Buttons** - Mutually exclusive option group
- **Text Field** - Text input for user entry (preset names, etc.)

### 4. Decorative Elements
- **Rectangle** - Background box with fill/border
- **Line** - Horizontal/vertical/diagonal separator
- **Label with Background** - Text with filled background box

### 5. Specialized Audio Displays
| Element | Description | Use Case |
|---------|-------------|----------|
| **dB Display** | Numeric dB readout with unit | Level readouts |
| **Frequency Display** | Hz/kHz readout with unit | Filter frequencies |
| **Gain Reduction Meter** | Inverted meter (grows downward) | Compressor GR |
| **Waveform Display** | Audio waveform visualization | Sample display |
| **Oscilloscope** | Real-time waveform scope | Signal monitoring |

### 6. Complex Widgets
- **Modulation Matrix** - Routing table with sources/destinations grid
- **Preset Browser** - List/tree view for preset selection

## Requirements

### ELEM-07: Control Label/Value Fields
- Knobs and Sliders have optional `showLabel` and `showValue` boolean properties
- Label position: top, bottom, left, right (relative to control)
- Value format: numeric, percentage, dB, Hz, custom suffix
- Label/value inherit or override control font settings

### ELEM-08: Container Elements
- Panel: background color/gradient, border radius, padding
- Frame: border style (solid, dashed, grooved), border width, border color
- Group Box: header text, header font, collapsible state
- Container: scroll overflow (auto, hidden, scroll), max-height/max-width

### ELEM-09: Form Controls
- Dropdown: options list, selected index, placeholder text
- Checkbox: checked state, label text, label position
- Radio Group: options list, selected index, orientation (horizontal/vertical)
- Text Field: placeholder, value, max length, font settings

### ELEM-10: Decorative Elements
- Rectangle: fill color, border color, border width, border radius
- Line: start point, end point, stroke width, stroke color, stroke style
- Label Background: text, background color, padding, border radius

### ELEM-11: Audio Displays
- dB Display: value, decimal places, unit visibility, range (min/max)
- Frequency Display: value, unit auto-switch (Hz/kHz), decimal places
- Gain Reduction Meter: same as Meter but inverted growth direction
- Waveform: data array, zoom level, color, background
- Oscilloscope: time division, amplitude scale, trigger mode, grid visibility

### ELEM-12: Complex Widgets
- Modulation Matrix: source labels, destination labels, cell values, editable
- Preset Browser: preset list, folder structure, search filter, selection callback

## Success Criteria
1. User can add knobs/sliders with integrated label and value display
2. User can create visual sections using Panel, Frame, or Group Box containers
3. User can add interactive form controls (dropdown, checkbox, radio, text field)
4. User can draw rectangles and lines for visual organization
5. User can add specialized audio readouts (dB, frequency, gain reduction)
6. User can add waveform and oscilloscope display placeholders
7. User can add modulation matrix and preset browser placeholders
8. All new elements export correctly to HTML/CSS/JS
9. All new elements support save/load round-trip
