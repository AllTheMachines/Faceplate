# Element Styles

Element styles let you replace the default appearance of elements with custom SVG artwork. Supported for knobs, sliders, buttons, and meters, each style is an SVG graphic with named layers that map to parts of the control (e.g., a knob's body, indicator, and cap). Once created, styles are reusable across your entire design and across multiple projects.

For a complete guide to designing custom SVG styles -- from exporting templates to naming layers and importing finished artwork -- see the [Style Creation Manual](../STYLE_CREATION_MANUAL.md).

## Creating a Style

To create a custom style, import an SVG file through the Manage Styles dialog. Faceplate automatically detects layers in the SVG based on their names (for example, `body`, `indicator`, `track`, or `thumb` for a slider). The layer mapping dialog appears after import, showing which SVG layers were matched to which roles. After confirming the mapping, the style is saved and becomes available to apply to any element of that category.

The full step-by-step workflow for designing SVGs with correct layer names and exporting them from vector graphics tools is covered in the [Style Creation Manual](../STYLE_CREATION_MANUAL.md).

### Supported Element Categories

Custom styles can be created for the following element categories:

- **Knobs** -- Rotary controls with body, indicator, and optional cap layers
- **Sliders** -- Linear controls with track, thumb, and optional fill layers
- **Buttons** -- Push buttons and toggle switches with default, hover, and pressed states
- **Meters** -- Audio level meters with background, scale, and indicator layers

Each category has its own set of layer roles that map to specific parts of the control. For example, a knob style requires a `body` layer (the main circular shape) and an `indicator` layer (the pointer or line showing the knob position), while a slider style requires a `track` layer (the background rail) and a `thumb` layer (the draggable handle).

## Applying Styles

To apply a style to an element, select the element on the canvas (e.g., a knob, slider, button, or meter) and use the **Style** dropdown in the Properties panel.

![Style dropdown in the Properties panel showing available styles for a knob](http://all-the-machines.com/github/faceplate/manual/10-style-dropdown.png)

The dropdown shows all available styles for that element's category. Select a style to apply it -- the element updates immediately on the canvas. Select **No style** to revert to the default appearance.

A thumbnail preview of the selected style appears below the dropdown, showing the SVG artwork at a small size. This makes it easy to confirm which style is currently applied.

### Customizing Individual Elements

Once a style is applied, you can override individual layer colors in the Properties panel to customize the appearance per element instance without modifying the original style. This is useful when you want variations of the same style -- for example, red and green knobs that share the same basic shape but use different colors.

Color overrides are per-element, not per-style. If you apply the same style to multiple elements and customize the colors on one element, the other elements keep the original style colors unless you also customize them individually.

## Managing Styles

Access the Manage Styles dialog by clicking **Manage styles...** below the style dropdown in the Properties panel. The dialog shows all styles for the current element category (e.g., all rotary styles when editing a knob).

![Manage Styles dialog showing imported styles with rename and delete options](http://all-the-machines.com/github/faceplate/manual/06-manage-styles-dialog.png)

From here you can:

- **Rename** a style by clicking its name and entering a new name
- **Delete** a style (a warning appears if elements are currently using it)
- **Import** new SVG files to create additional styles

Elements using a deleted style revert to the default appearance.

## Style Storage and Reuse

Styles are stored in your browser's local storage and persist across sessions. Once imported, a style is available to all projects, not just the one where you first created it. This makes it easy to maintain consistent branding and visual language across multiple plugin UIs.

When you export a project that uses styles, the SVG artwork is embedded directly into the exported bundle, ensuring the exported JUCE WebView2 code is fully self-contained.

### Style Sharing

To share a style with other team members or across multiple machines, export a project that uses the style (the SVG is embedded in the export), then have others import that project. Alternatively, share the original SVG file and each person can import it through the Manage Styles dialog to recreate the style.

## Best Practices

### Naming Conventions

Use descriptive names for your styles that indicate the visual theme or purpose. For example, "Vintage Knob", "Modern Slider", "Glow Button". This makes it easier to identify styles when you have many in your library.

### Organizing by Theme

If you maintain multiple visual themes for different products, consider using a naming prefix like "Product-A-Knob", "Product-A-Slider" to group related styles together in the dropdown.

### Testing Styles

After importing a new style, test it on an element immediately to verify the layer mapping worked correctly. If layers appear in unexpected positions or colors, check the [Style Creation Manual](../STYLE_CREATION_MANUAL.md) for layer naming requirements.

### Updating Existing Styles

To update a style that's already in use, delete the old style through the Manage Styles dialog, then import the new version with the same name. All elements using that style will automatically update to the new artwork.

---

[Back to User Manual](README.md) | [Style Creation Manual](../STYLE_CREATION_MANUAL.md) | [Properties Panel](properties.md) | [Asset Library](assets.md)
