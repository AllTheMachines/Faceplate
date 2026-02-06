# Project Management

Faceplate saves projects as JSON files that capture your complete design state (elements, windows, layers, assets, and styles). Projects support template imports for migrating existing JUCE WebView UIs, and the interface protects against unsaved work loss.

## Save and Load Projects

Projects are saved as `.json` files containing your entire design state -- all elements, windows, layer configurations, imported assets, and element styles. The JSON format is human-readable and can be version controlled alongside your JUCE C++ code.

**To save a project:**

File > Save Project (or **Ctrl+S**/**Cmd+S**) -- your browser downloads a JSON file with the current project name (e.g., `MyPlugin.json`).

**To load a project:**

File > Load Project -- select a `.json` file from your file system. The loaded project replaces your current design state, so save your work first if needed.

**Project naming:**

The project name appears in the left panel header and in the browser tab title. Change the project name in File > Project Settings.

### Unsaved Changes Protection

Faceplate protects against accidental work loss with three indicators:

- **Asterisk in title bar:** An asterisk (`*`) appears after the project name when unsaved changes exist
- **Last saved timestamp:** The left panel shows "Last saved: [time]" with a relative time indicator (e.g., "2 minutes ago")
- **Browser warning:** If you attempt to close the browser tab with unsaved changes, the browser displays a confirmation dialog

![Project save panel showing unsaved changes asterisk and last saved timestamp](../images/project-save-load.png)

## Template Import

Templates are starter projects created from existing JUCE designs. Importing a template is useful for migrating existing JUCE WebView UIs into Faceplate without manually recreating each element.

**To import:** File > Import Template -- select a JUCE project folder containing a WebView UI.

**What happens:** The template importer analyzes the JUCE project structure and loads template elements, windows, and settings into your current project. This replaces your current project state, so save your work before importing if needed.

Templates preserve element positions, parameter bindings, and layout structure from the original JUCE project. After importing, you can modify the template just like any other Faceplate project.

## Container Editing

Containers (Panel, Frame, Group Box, Collapsible) can hold child elements inside them. Use the **Edit Contents** button in the Properties panel to edit a container's children in an isolated canvas view.

**Features:**

- **Edit Contents button:** Opens isolated edit mode showing only the container's children
- **Breadcrumb navigation:** Shows the path from root canvas to current container; click any segment to jump back
- **Nested containers:** Containers can hold other containers; breadcrumb extends to show full nesting path

Containers support overflow scrollbars when content exceeds bounds. Child elements extending beyond the container's visible area will be accessible via scrolling in the exported UI.

**See [Canvas](canvas.md#container-editing) for the full editing workflow.**

---

**Back to [User Manual](README.md)**

**See also:** [Faceplate Documentation](../FACEPLATE_DOCUMENTATION.md) | [Canvas](canvas.md) | [Export](export.md)
