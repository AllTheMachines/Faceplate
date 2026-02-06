# Font Management

Faceplate supports both built-in fonts and custom fonts from your system. Fonts are used for labels, value displays, and any text element in your designs.

## Built-in Fonts

Faceplate includes a set of built-in fonts that are always available without any setup. These fonts cover common use cases for plugin UIs across sans-serif, serif, monospace, and display categories.

**Built-in font families include:**

- **Inter** -- Modern sans-serif, excellent for UI text and labels
- **Roboto** -- Clean sans-serif, widely used for readability
- **Roboto Mono** -- Monospaced font for numeric displays and code
- **Arial** -- Classic sans-serif, universally available
- **Helvetica** -- Professional sans-serif for clean designs
- **Georgia** -- Serif font for traditional or elegant UIs
- **Courier New** -- Monospaced serif for technical displays
- **Verdana** -- Sans-serif optimized for screen readability
- **Times New Roman** -- Classic serif for formal text
- **Trebuchet MS** -- Humanist sans-serif with personality

Built-in fonts appear in the font dropdown of any element that supports text styling. To use a built-in font, select the element on the canvas, open the Properties panel, and choose a font from the **Font Family** dropdown.

When you export your project, built-in fonts are referenced by file path in the generated CSS. The font files are included in the export bundle alongside your HTML and JavaScript, keeping the bundle size minimal while ensuring your exported plugin UI displays correctly.

### Font Weights and Styles

Built-in fonts support multiple weights where available:

- **Thin** (100) -- Ultra-light text
- **Extra Light** (200) -- Very light text
- **Light** (300) -- Light text
- **Regular** (400) -- Normal weight, default for body text
- **Medium** (500) -- Slightly heavier than regular
- **Semi Bold** (600) -- Moderately bold
- **Bold** (700) -- Strong emphasis
- **Extra Bold** (800) -- Very strong emphasis
- **Black** (900) -- Heaviest weight

Not all fonts include all weights. The font dropdown shows the actual font family rendered in its own typeface so you can preview how it looks before applying it.

## Custom Fonts

To use your own fonts in Faceplate, point the application to a folder containing font files on your system.

### Adding Custom Fonts

1. Open Settings (gear icon in the toolbar)
2. Under **Font Settings**, click **Select Fonts Folder**
3. Choose a folder containing `.ttf`, `.otf`, `.woff`, or `.woff2` font files
4. Faceplate scans the folder and loads the fonts
5. A status message confirms how many fonts were loaded

![Font settings showing the Select Fonts Folder button and scan status](http://all-the-machines.com/github/faceplate/manual/fonts-folder-selection.png)

After scanning, custom fonts appear in font dropdowns throughout the application alongside the built-in fonts. The dropdown shows each font rendered in its own typeface so you can preview how it looks.

### Directory Handle Persistence

Faceplate remembers your fonts folder and reloads fonts automatically when you reopen the application. The browser may ask for permission to access the folder again when you restart the app -- this is a security feature of the File System Access API. Simply grant permission and your custom fonts will be available.

If you move or rename your fonts folder, Faceplate will not be able to reload the fonts. In this case, return to Settings and select the new folder location.

### Supported Font Formats

Custom fonts can be in any of these formats:

- **TrueType (.ttf)** -- Standard font format, widely supported
- **OpenType (.otf)** -- Advanced font format with more typographic features
- **Web Open Font Format (.woff, .woff2)** -- Optimized for web use, smaller file sizes

Place all your font files in a single folder and point Faceplate to that folder. Subfolders are not scanned -- all font files must be in the top-level folder you select.

### Font File Naming

Font file names should match the font family name for best results. For example, if you have a custom font called "MyCustomFont", the file should be named `MyCustomFont.ttf` or similar. Faceplate reads font metadata from the file itself, so even if the filename doesn't match perfectly, the font will still load under its actual family name.

If you have multiple weights of the same font family (e.g., `MyCustomFont-Light.ttf`, `MyCustomFont-Regular.ttf`, `MyCustomFont-Bold.ttf`), place them all in the fonts folder. Faceplate groups them by family name and makes each weight available in the font weight dropdown.

## Fonts in Export

When you export your project to a JUCE WebView2 bundle, fonts are bundled differently depending on their type:

- **Built-in fonts** are included as separate font files in the export. The generated CSS references them by relative path. This keeps the bundle size minimal.
- **Custom fonts** are embedded directly into the CSS as base64-encoded data. This makes the export fully self-contained (no external font file dependencies) but increases the bundle size.

### Bundle Size Tradeoff

Base64 encoding increases file size by approximately 33% compared to the original font file. If you use multiple custom fonts or heavy font files with many weights, the exported CSS can become quite large.

If bundle size is a concern, prefer built-in fonts where possible. Built-in fonts are optimized for plugin UIs and cover most common use cases. Use custom fonts when your design requires a specific typeface that is not in the built-in collection -- for example, a brand-specific font that matches your company's visual identity.

### Font Subsetting

Faceplate does not perform font subsetting -- the entire font file is embedded when you use a custom font. If you need to minimize bundle size while using a custom font, consider using a font subsetting tool to create a version of the font that includes only the characters you need (e.g., Latin alphabet and numerals for a parameter display).

## Font Selection in the Properties Panel

Any element that displays text (labels, value displays, buttons, etc.) has font properties in the Properties panel:

- **Font Family** -- Choose from built-in or custom fonts
- **Font Weight** -- Select the weight (if multiple weights are available)
- **Font Size** -- Enter the size in pixels
- **Text Color** -- Set the color using the color picker

When you select a font family, the dropdown shows a preview of each font rendered in its own typeface. This helps you see how the font looks before applying it to your element.

Changes to font properties apply immediately to the selected element on the canvas. If you select multiple elements, font changes apply to all selected elements at once.

---

[Back to User Manual](README.md) | [Properties Panel](properties.md) | [Multi-Window Projects](windows.md) | [Asset Library](assets.md)
