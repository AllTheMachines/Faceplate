# Export

Faceplate generates a complete code bundle from your design that runs inside a JUCE WebView2 component. The export produces all the HTML, CSS, and JavaScript needed for your plugin UI. You can also preview your design in a browser for quick testing.

## Exporting a JUCE WebView2 Bundle

This is the primary export workflow for using your Faceplate design in a JUCE plugin.

1. Click the **Export** button in the toolbar (or use the Export panel in the left sidebar)
2. The Export modal opens showing your project summary and options

![Export modal showing export mode, options, and action buttons](http://all-the-machines.com/github/faceplate/manual/export-modal.png)

### Export Mode

Choose how you want to receive the exported files:

- **ZIP Archive** -- Downloads a .zip file containing all generated files. Choose folder export for direct use, or ZIP for sharing/archiving.
- **Export to Folder** -- Writes files directly to a folder you choose on your system (requires Chrome, Edge, or Opera)

### Export Options

Configure the exported bundle:

- **Optimize SVG assets** -- Reduces SVG file size in the exported bundle by removing unnecessary metadata and comments
- **Enable responsive scaling** -- Makes the UI scale to fit different window sizes, useful for resizable plugin interfaces
- **Include developer windows** -- Includes developer-type windows in the export (only appears if your project has developer windows marked as non-release)

### Generate the Export

Click **Export ZIP** or **Export Folder** to generate the bundle. The export process takes a few seconds depending on the complexity of your design and the number of assets used.

### What Gets Generated

The exported bundle contains:

- **index.html** -- The UI layout with all your elements and structure
- **style.css** -- Styling for colors, fonts, sizes, and positions of all elements
- **components.js** -- Interactive component logic (knobs, sliders, buttons, meters)
- **bindings.js** -- Parameter binding between UI controls and the JUCE backend
- **assets/** -- SVG graphics and font files used in your design
- **README.md** -- Integration instructions for adding the bundle to your JUCE project

Multi-window projects export each window as a separate bundle in its own subfolder. Each window bundle contains the same file structure above, with the window name used as the subfolder name.

### Pro Element Export Restrictions

If your project contains Pro elements and you are on a Free license, Faceplate shows which Pro elements need to be removed or upgraded before you can export the JUCE bundle. The export modal lists each Pro element type and the count of instances in your project. You can either upgrade to a Pro license to unlock the export, or delete the Pro elements from your design and use Free elements instead. Browser preview works without a Pro license, so you can still test your design before deciding whether to upgrade.

## Browser Preview

The browser preview opens your design in a new browser tab with mock interactivity. Controls respond to mouse interaction (drag knobs, click buttons, move sliders) so you can test the look and feel without setting up JUCE.

To preview:

1. Open the Export modal
2. Click **Preview**

The preview generates the same HTML/CSS/JavaScript as a full export but runs it directly in the browser with a simulated JUCE backend. This is useful for checking layout, styling, and basic interaction before integrating with your JUCE project. The simulated backend responds to UI changes but does not connect to actual audio processing -- it's purely for visual and interaction testing.

For multi-window projects, the preview shows all windows with tab navigation at the top, letting you switch between windows. This helps you verify that window navigation and cross-window interactions work correctly before exporting the final bundle.

Note: the preview may require allowing popups in your browser settings. If the preview does not open, check your browser's popup blocker and allow popups from Faceplate. The preview opens in a new tab so it can simulate the full window environment your plugin UI will run in.

## Export Workflow Tips

### Testing Before Export

Use the browser preview frequently during design to catch layout and styling issues early. The preview updates instantly and lets you test interactions without the overhead of exporting and integrating with JUCE. Once you are satisfied with the design in the preview, proceed to a full JUCE bundle export.

### Iterative Design

Export early and often when working on a JUCE integration. Even if your design is not complete, exporting a partial bundle and integrating it with JUCE helps you verify that the parameter bindings, scaling, and window sizing work correctly in the actual plugin environment. You can always re-export as your design evolves.

### Folder vs ZIP

Use **Export to Folder** during active development so you can quickly replace the bundle files in your JUCE project without extracting archives. Use **ZIP Archive** when sharing your design with others, archiving project snapshots, or delivering final bundles for production builds.

### SVG Optimization

Enable **Optimize SVG assets** for production exports to reduce bundle size. The optimization removes SVG metadata, comments, and unused elements without affecting visual appearance. For development exports, you may want to keep optimization disabled to preserve SVG structure if you plan to hand-edit the exported files.

## See Also

- [JUCE Integration Guide](../JUCE_INTEGRATION.md) -- How to load the exported bundle in your JUCE plugin with WebView2
- [Export Format Reference](../EXPORT_FORMAT.md) -- Detailed breakdown of each exported file and its structure

---

[Back to User Manual](README.md) | [Element Styles](styles.md) | [Font Management](fonts.md) | [Multi-Window Projects](windows.md)
