# Asset Library

The Asset Library stores your imported SVG graphics for reuse across your designs. Access it from the **Assets** tab in the left panel.

![Asset library tab in the left panel showing imported SVG graphics](../images/assets-library-sidebar.png)

## Importing SVGs

Import SVG graphics to use as logos, icons, decorations, or background elements in your plugin UI.

1. Click the **Assets** tab in the left panel
2. Click the **+ Import** button at the top
3. Drop an SVG file into the drop zone, or click to browse your files
4. A preview of the SVG appears along with file metadata (dimensions, file size)
5. Enter a name for the asset (defaults to the filename without extension)
6. Select one or more categories to organize the asset: **logo**, **icon**, **decoration**, or **background**
7. Click **Import** to add it to your library

Categories are optional tags that help you organize your assets as your library grows. You can assign multiple categories to a single asset. For example, a company logo SVG might be tagged as both **logo** and **decoration** if you use it in multiple contexts.

![SVG import dialog showing preview, name field, and category selection](../images/assets-import-dialog.png)

Faceplate automatically sanitizes imported SVGs to remove potentially unsafe content like embedded scripts, ensuring your exported JUCE WebView2 bundle is secure.

### File Requirements

Imported files must be valid SVG format with `.svg` extension. The import dialog validates the file structure and displays any errors if the SVG cannot be processed. Most SVG files exported from vector graphics tools like Adobe Illustrator, Figma, Inkscape, or Affinity Designer work without modification.

### Asset Naming

Asset names must be unique within your library. If you import a file with a name that already exists, the import dialog prompts you to choose a different name or replace the existing asset. Use descriptive names like "CompanyLogo", "PowerButtonIcon", or "WaveformBackground" to make assets easy to find later.

## Organizing Assets

Keep your asset library organized as it grows by using categories and filters.

Assets appear in the library panel with their preview thumbnail and name. Each asset displays a small preview showing the SVG rendered at thumbnail size, making it easy to identify graphics visually.

Filter assets by category using the category buttons at the top of the Assets panel. Click a category button to show only assets with that category tag. Click the **All** button to show all assets regardless of category. The active filter button is highlighted.

Right-click an asset in the library to:

- **Rename** -- Change the asset's display name (opens an inline text field)
- **Delete** -- Remove the asset from your library permanently

Categories assigned during import help you find assets quickly as your library grows. For example, filter by **icon** when you need a small graphic for a button, or filter by **background** when looking for decorative elements to fill empty space.

### Asset Storage

Assets are stored in your browser's local storage and persist across sessions. When you save a project, asset references are included in the saved file, but the actual SVG data is stored separately in the asset library. This means assets are available to all projects, not just the one where you first imported them.

If you export a project that uses assets, the SVG graphics are embedded directly into the exported HTML bundle as inline SVG elements, ensuring your exported plugin UI is fully self-contained.

## Using Assets on the Canvas

Drag any asset from the library directly onto the canvas to place it as an **SVG Graphic** element. The graphic appears at its natural SVG dimensions (the `width` and `height` attributes from the SVG file, or a default size if those attributes are missing) and can be resized, repositioned, and styled using the Properties panel like any other element.

Once placed on the canvas, the SVG Graphic element is independent of the original asset in the library. Changes to the asset (like renaming or deleting it) do not affect elements already on the canvas. If you want to update an existing SVG Graphic to use a different asset, delete the element and drag the new asset from the library.

### Asset Reusability

The same asset can be used multiple times across your design. For example, you might use a logo asset in the header of every window in a multi-window project, or place the same icon asset on multiple buttons. Each instance on the canvas is a separate element with its own position, size, and style properties, but they all reference the same underlying SVG graphic from your library.

### Styling SVG Graphics

Once an SVG Graphic element is on the canvas, you can customize its appearance through the Properties panel:

- **Size** -- Resize the graphic by dragging its corner handles on the canvas, or enter exact width and height values in the Properties panel
- **Position** -- Move the graphic by dragging it on the canvas, or enter exact X and Y coordinates
- **Opacity** -- Adjust transparency to blend the graphic with underlying elements
- **Fill color** -- Override the SVG's original colors (if the SVG uses fillable paths)

The SVG Graphic element respects the layer system -- place graphics on background layers for decorative elements, or on foreground layers for icons and controls.

## Common Use Cases

### Logo Placement

Import your company or product logo as an SVG asset and place it in a consistent location across all windows in your plugin. Using the asset library ensures the logo is identical everywhere, and updating it requires only re-importing the asset.

### Custom Button Icons

Create custom button graphics in your vector editor, export as SVG, and import them as **icon** category assets. Drag them onto the canvas and position them over standard button elements to create visually distinctive controls.

### Background Textures

Import decorative SVG patterns or textures as **background** category assets. Place them on a dedicated background layer, then lock the layer to prevent accidental moves while you work on foreground controls.

### Meter Overlays

For analog-style meters, import SVG graphics showing scale markings, bezels, or needle backgrounds. Place these on the canvas and layer them with meter elements to create realistic hardware-inspired UIs.

---

[Back to User Manual](README.md) | [Canvas](canvas.md) | [Multi-Window Projects](windows.md) | [Font Management](fonts.md)
