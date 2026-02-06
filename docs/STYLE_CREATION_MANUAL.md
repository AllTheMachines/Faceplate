# Creating Custom Element Styles

This manual walks you through creating a custom SVG style for any element type in the VST3 UI Designer.

---

## Overview

The style system allows you to replace the default appearance of elements (knobs, sliders, buttons, meters) with custom SVG artwork. The workflow is:

1. **Export** an element as SVG template (with named layers)
2. **Design** your custom SVG in a vector editor
3. **Import** the SVG and map layers to roles
4. **Apply** the style to any element of that type

---

## Supported Categories

The style system supports five element categories, each with its own layer structure:

| Category | Elements | Key Layer |
|----------|----------|-----------|
| Rotary | Knob, Stepped Knob, Center Detent, Dot Indicator | `indicator` (rotating pointer) |
| Linear | Slider, Range Slider, Bipolar, Crossfade, Notched, Multi-Slider | `thumb` (draggable handle) |
| Arc | Arc Slider | `thumb` (handle on arc path) |
| Button | Button, Icon Button, Toggle, Power, Rocker, Rotary Switch, Segment | `normal` (default state) |
| Meter | Meter (and all professional meter variants) | `body` (meter housing) |

---

## Prerequisites

- Vector editor (Illustrator, Inkscape, Figma, Affinity Designer, etc.)
- Note: Meter styles are available to all users. Knob/Slider/Button styles require Pro license.

---

## Part 1: Export a Template

Start by exporting an element to get the correct layer structure.

### Steps

1. **Add an element to the canvas**
   - Drag a Knob (or Slider, Button, Meter) from the palette

   ![Element selected on canvas](http://all-the-machines.com/github/faceplate/manual/01-element-selected.png)

2. **Open the Property Panel**
   - The panel shows on the right when an element is selected
   - Scroll down to the "SVG" section

   ![Property Panel SVG section](http://all-the-machines.com/github/faceplate/manual/02-svg-export-button.png)

3. **Click Export**
   - A file download starts (e.g., `knob-Faceplate-7475b627.svg`)
   - This SVG contains all the layers with proper naming

   ![Downloaded SVG file](http://all-the-machines.com/github/faceplate/manual/03-downloaded-file.png)

---

## Part 2: Understand Layer Structure

Open the exported SVG in your vector editor. You'll see groups with specific IDs.

### Layer Roles by Element Type

#### Rotary (Knobs)
| Role | Required | In Template | Description |
|------|----------|-------------|-------------|
| `indicator` | **Yes** | Yes | The rotating pointer/line |
| `track` | No | Yes | Background arc/circle |
| `arc` | No | Yes | Value fill arc |
| `glow` | No | No* | Glow effect |
| `shadow` | No | No* | Shadow effect |

*These roles are supported for import but not included in the exported template. Add them in your vector editor if needed.

#### Linear (Sliders)
| Role | Required | In Template | Description |
|------|----------|-------------|-------------|
| `thumb` | **Yes** | Yes | The draggable handle |
| `track` | No | Yes | Slider track background |
| `fill` | No | Yes | Value fill behind thumb |

#### Arc (Arc Sliders)
| Role | Required | In Template | Description |
|------|----------|-------------|-------------|
| `thumb` | **Yes** | Yes | The draggable handle on the arc |
| `track` | No | Yes | Arc track background |
| `fill` | No | Yes | Value fill on arc |
| `arc` | No | No* | The arc path itself |

*Arc role is supported for import but uses track/fill in template.

#### Button (Buttons, Switches)
| Role | Required | In Template | Description |
|------|----------|-------------|-------------|
| `normal` | **Yes** | Yes (as body) | Default/unpressed state |
| `pressed` | No | No* | Pressed state |
| `icon` | No | No* | Icon overlay |
| `label` | No | Yes | Text label |
| `on` / `off` | No | No* | Toggle states |
| `indicator` / `led` | No | No* | Status indicator |
| `position-0/1/2` | No | No* | Multi-position states |
| `base` | No | No* | Base/background |
| `selector` | No | No* | Selection indicator |
| `highlight` | No | No* | Highlight effect |

*These roles are supported for import but not in the basic template. Add them for interactive button states.

#### Meter (Level Meters)
| Role | Required | In Template | Description |
|------|----------|-------------|-------------|
| `body` | **Yes** | Yes | Meter housing/frame |
| `fill` | No | Yes | Single-color fill |
| `fill-green` | No | No* | Green zone fill |
| `fill-yellow` | No | No* | Yellow zone fill |
| `fill-red` | No | No* | Red/clip zone fill |
| `scale` | No | No* | Scale markings |
| `peak` | No | Yes | Peak indicator |

*Multi-color fills and scale are supported for import. Use them for professional meter designs with colored zones.

![SVG in vector editor](http://all-the-machines.com/github/faceplate/manual/04-vector-editor-layers.png)

---

## Part 3: Design Your Custom Style

Now create your own design while keeping the layer structure.

### Guidelines

1. **Keep the same layer IDs**
   - The system detects layers by `id` attribute or CSS class
   - Use names like `indicator`, `track`, `thumb`, etc.
   - Or use the prefixed format: `knob-indicator`, `slider-thumb`, etc.

2. **Maintain viewBox proportions**
   - Square for rotary elements (knobs): `viewBox="0 0 100 100"`
   - Rectangular for linear elements (sliders): match element's aspect ratio
   - The element will scale to fit any size

3. **Center rotating elements**
   - For rotary elements (knobs), the `indicator` group rotates around the center
   - Design it pointing straight up (12 o'clock position)

4. **Use groups for multi-part layers**
   - Wrap related shapes in a `<g id="layername">` group

### Example SVG Structure (Rotary/Knob)

This example shows a rotary (knob) style. For other categories, adapt the layer IDs to match the roles listed in Part 2.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Background circle -->
  <g id="track">
    <circle cx="50" cy="50" r="45" fill="#2a2a2a"/>
  </g>

  <!-- Value arc (optional) -->
  <g id="arc">
    <path d="..." fill="none" stroke="#00ff00" stroke-width="4"/>
  </g>

  <!-- Rotating indicator - REQUIRED for knobs -->
  <g id="indicator">
    <line x1="50" y1="50" x2="50" y2="15" stroke="white" stroke-width="3"/>
  </g>
</svg>
```

---

## Part 4: Import Your Style

### Steps

1. **Select an element of the target type**
   - Click on an element of the matching category (e.g., a Knob for rotary styles, a Slider for linear styles)

2. **Click "Manage styles..."**
   - In the Property Panel, find the Style dropdown
   - Below it, click "Manage styles..."

   ![Manage styles link](http://all-the-machines.com/github/faceplate/manual/05-manage-styles-link.png)

3. **The Manage Styles dialog opens**
   - Shows existing styles for this category
   - Click **"+ Import New [Type] Style"**

   ![Manage Styles dialog](http://all-the-machines.com/github/faceplate/manual/06-manage-styles-dialog.png)

4. **Drop or select your SVG file**
   - Drag your custom SVG onto the dropzone
   - Or click to browse

   ![Import dropzone](http://all-the-machines.com/github/faceplate/manual/07-import-dropzone.png)

5. **Review auto-detected layers**
   - The system auto-detects layers by name
   - A toast shows how many layers were detected

   ![Layer mapping](http://all-the-machines.com/github/faceplate/manual/08-layer-mapping.png)

---

## Part 5: Map Layers

The layer mapping screen shows:
- **Left**: SVG preview (hover roles to highlight)
- **Right**: Role assignments table

### Steps

1. **Check required roles**
   - Roles marked with * are required
   - You cannot save until these are mapped

2. **Adjust mappings if needed**
   - Use the dropdown next to each role
   - Select which SVG layer (by id) maps to that role

3. **Hover to preview**
   - Hover over a row to highlight that layer in the preview
   - Helps verify correct mapping

   ![Hover highlighting](http://all-the-machines.com/github/faceplate/manual/09-hover-highlight.png)

4. **Click Next (for rotary/arc) or Save (for others)**

---

## Part 6: Apply the Style

1. **Select an element** on the canvas
2. **Open the Style dropdown** in Property Panel
3. **Select your new style**
4. **Preview updates instantly**

   ![Style dropdown](http://all-the-machines.com/github/faceplate/manual/10-style-dropdown.png)

---

## Part 7: Re-mapping an Existing Style

If layer detection was wrong, or you updated your SVG:

1. **Click "Manage styles..."**
2. **Find your style in the list**
3. **Click "Re-map"** (green button)
4. **Adjust layer assignments**
5. **Save**

![Re-map button](http://all-the-machines.com/github/faceplate/manual/11-remap-button.png)

---

## Tips & Troubleshooting

### Layer Not Detected?
- Check the `id` attribute in your SVG source
- IDs are case-sensitive: `indicator` not `Indicator`
- Avoid spaces in IDs: use `knob-indicator` not `knob indicator`

### Style Looks Wrong?
- Verify viewBox dimensions match your design
- Check that rotating elements are centered
- For knobs, ensure indicator points up at rest position

### Colors Not Showing?
- The preview shows the SVG as-is
- Some elements override colors at runtime based on properties
- Test by applying to an actual element

### Multiple Elements Same Layer?
- Use groups: `<g id="indicator">` containing multiple shapes
- All shapes in the group will be treated as one layer

---

## Screenshot Checklist

| # | Description | Location |
|---|-------------|----------|
| 1 | Element selected on canvas | Canvas |
| 2 | Property Panel with SVG Export button | Right panel |
| 3 | Downloaded SVG file | File browser |
| 4 | Exported SVG in vector editor with layers | Vector editor |
| 5 | "Manage styles..." link in Property Panel | Right panel |
| 6 | Manage Styles dialog with Import button | Dialog |
| 7 | Import dialog with dropzone | Dialog |
| 8 | Layer mapping with auto-detection | Dialog |
| 9 | Hover highlighting a layer | Dialog |
| 10 | Style dropdown with new style | Right panel |
| 11 | Re-map button in Manage Styles | Dialog |

---

## Quick Reference: Layer IDs

### Naming Conventions

The system accepts both formats:
- **Short**: `indicator`, `track`, `thumb`
- **Prefixed**: `knob-indicator`, `slider-track`, `button-normal`

### Minimum Required Layers

| Element Type | Required Layer |
|--------------|----------------|
| Knob | `indicator` |
| Slider | `thumb` |
| Arc Slider | `thumb` |
| Button | `normal` |
| Meter | `body` |

Everything else is optional but enhances the visual.

---

## See Also

- [User Manual](manual/README.md) -- Complete user guide
- [Element Styles Guide](manual/styles.md) -- Overview of the style system
- [Element Reference](ELEMENT_REFERENCE.md) -- All element types with styleId property
- [Faceplate Documentation](FACEPLATE_DOCUMENTATION.md) -- Complete technical specification
