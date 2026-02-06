# Element Palette

The Element Palette contains all the UI components you can add to your design. Browse elements by category, use the search bar to find specific elements, and drag them onto the canvas to start building your interface.

## Using the Palette

The palette is in the **Elements** tab of the left panel, which is selected by default when you launch Faceplate. Elements are organized into collapsible categories -- click a category header to expand or collapse it. The first three categories are expanded by default so you can start browsing immediately.

To add an element to your design, drag it from the palette onto the canvas. The element appears at the position where you release the mouse. See [Canvas](canvas.md) for details on working with elements once they are on the canvas.

![Element palette showing categories and search bar](http://all-the-machines.com/github/faceplate/manual/getting-started-palette.png)

## Search & Filter

Use the search bar at the top of the palette to quickly find elements by name.

- Type in the search bar to filter elements -- the results update as you type with a brief delay for responsiveness
- A count of matching elements appears below the search bar so you know how many results were found
- All categories containing matching elements expand automatically during a search
- Clear the search by clicking the **X** button or deleting the text

Search works well for finding elements when you know part of the name. For example, typing "meter" shows all meter variants, and typing "knob" narrows down to just the rotary controls.

## Element Categories

The palette organizes elements into 14 categories. For complete property documentation on any element, see the [Element Reference](../ELEMENT_REFERENCE.md).

### Rotary Controls

| Element Name | Description |
|---|---|
| Knob | Standard rotary knob with arc display |
| Stepped Knob | Knob with discrete step positions and optional tick marks |
| Center Detent | Knob that snaps to center position, ideal for pan or EQ |
| Dot Indicator | Minimalist knob with dot position indicator |

![Rotary Controls category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-rotary-controls.png)

### Linear Controls

| Element Name | Description |
|---|---|
| Slider | Vertical or horizontal fader control |
| Range Slider | Dual-handle slider for selecting a range |
| Multi-Slider | Multiple parallel sliders sharing a single control |
| Bipolar Slider | Slider with center-origin fill for bipolar parameters |
| Crossfade | A/B crossfade balance slider |
| Notched Slider | Slider with snap points at defined positions |
| ASCII Slider (Pro) | Text-based slider with ASCII art rendering |

![Linear Controls category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-linear-controls.png)

### Buttons

| Element Name | Description |
|---|---|
| Button | Momentary or toggle button with customizable label |
| Icon Button | Button displaying an SVG icon |
| Toggle Switch | On/off switch with sliding toggle animation |
| Power Button | Circular power button with LED indicator |
| Rocker Switch | Three-position rocker switch (up/center/down) |
| Rotary Switch | Multi-position rotating selector with labels |
| Segment Button | Multi-segment button for option selection |
| ASCII Button (Pro) | Text-based button with ASCII art rendering |

![Buttons category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-buttons.png)

### Value Displays

| Element Name | Description |
|---|---|
| Label | Static or dynamic text label |
| Numeric Display | Formatted number readout with units |
| Time Display | Time value display (seconds, milliseconds) |
| Percentage Display | Value shown as percentage |
| Ratio Display | Ratio readout (e.g., compression ratio) |
| Note Display | Musical note name display (e.g., C4, A#3) |
| BPM Display | Tempo display in beats per minute |
| Editable Display | Click-to-edit numeric value field |
| Multi-Value Display | Multiple values shown in a single display |

![Value Displays category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-value-displays.png)

### Meters

| Element Name | Description |
|---|---|
| Meter | Basic vertical or horizontal level meter |

![Meters category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-meters.png)

### Audio Displays

| Element Name | Description |
|---|---|
| dB Display | Decibel value readout |
| Frequency Display | Frequency value display with Hz/kHz formatting |
| GR Meter | Gain reduction meter for compressors/limiters |
| Waveform | Static audio waveform display |
| Oscilloscope | Real-time oscilloscope waveform view |

![Audio Displays category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-audio-displays.png)

### Form Controls

| Element Name | Description |
|---|---|
| Dropdown | Selection dropdown menu |
| Checkbox | On/off checkbox control |
| Radio Group | Mutually exclusive option selector |
| Text Field | Text input field |

![Form Controls category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-form-controls.png)

### Navigation & Selection

| Element Name | Description |
|---|---|
| Stepper | Increment/decrement numeric control |
| Breadcrumb (Pro) | Hierarchical navigation path display |
| Multi-Select Dropdown | Dropdown allowing multiple selections |
| Combo Box | Editable dropdown with type-to-filter |
| Menu Button | Button that opens a dropdown menu |
| Tab Bar | Horizontal tab navigation control |
| Tag Selector | Tag-based selection control |
| Tree View | Hierarchical tree structure navigation |

![Navigation & Selection category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-navigation.png)

### Images & Decorative

| Element Name | Description |
|---|---|
| Image | Raster image display (PNG, JPG) |
| SVG Graphic | Vector SVG graphic from the asset library |
| Rectangle | Decorative rectangle shape |
| Line | Decorative line element |
| ASCII Art (Pro) | Text-based ASCII art display panel |

![Images & Decorative category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-images.png)

### Containers

| Element Name | Description |
|---|---|
| Panel | Basic container for grouping elements |
| Frame | Container with visible border |
| Group Box | Container with header label |
| Collapsible | Expandable/collapsible container section |
| Tooltip | Hover-triggered tooltip container |
| Horizontal Spacer | Invisible horizontal spacing element |
| Vertical Spacer | Invisible vertical spacing element |
| Window Chrome | Window decoration/title bar container |

![Containers category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-containers.png)

### Complex Widgets

| Element Name | Description |
|---|---|
| Mod Matrix | Modulation routing matrix grid |
| Preset Browser | Preset selection and management browser |

![Complex Widgets category in the palette](http://all-the-machines.com/github/faceplate/manual/palette-complex-widgets.png)

## Pro Elements

Some elements require a Faceplate Pro license. These are marked with a **(Pro)** badge in the palette and in the tables above. There are 50 Pro elements spread across the Meters, Visualizations, Curves, Navigation & Selection, Images & Decorative, Linear Controls, Buttons, and Specialized Audio categories.

**How Pro gating works:**

- Without a Pro license, Pro elements are hidden from the palette by default
- Pro users can toggle the **Hide Pro elements** switch at the top of the palette to show or hide Pro elements as needed
- If you load a project that contains Pro elements without a Pro license, those elements display a Pro badge overlay on the canvas
- Pro elements in an unlicensed project have read-only properties -- you can view their settings but not change them
- Export to JUCE is blocked when the project contains Pro elements and no valid Pro license is active
- For licensing details, see the **License** settings in the application

---

**Back to [User Manual](README.md)**

[Canvas](canvas.md) | [Properties Panel](properties.md)
