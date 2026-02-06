# Multi-Window Projects

Most plugin UIs consist of a single main window, but complex instruments or effects may need separate windows for different sections of the interface. For example, you might have a main performance view with knobs and sliders, a secondary settings or preferences panel, a mixer section, or developer-specific debugging windows.

Faceplate lets you design multiple windows in a single project. Each window has its own canvas with its own elements, dimensions, and background settings. You can configure button elements to navigate between windows, creating a multi-page plugin UI experience for your users.

![Window tabs showing multiple windows at the bottom of the interface](http://all-the-machines.com/github/faceplate/manual/windows-tabs-bar.png)

The window tabs appear at the bottom of the interface. Click any tab to switch to that window and view its canvas. Each window is independent -- selecting, copying, or modifying elements on one window does not affect elements on other windows.

## Window Types

Faceplate supports two window types: **release** and **developer**. The type determines whether the window is included in your exported plugin code.

### Release Windows

**Release windows** become part of your shipped plugin UI. When you export your project, release windows are included in the generated JUCE WebView2 bundle. These are the windows your end users will see and interact with when using your plugin in a DAW.

Release windows are the primary window type for production UIs. Most projects contain only release windows. Use release windows for any interface that your plugin users will interact with, such as:

- The main control interface with knobs, sliders, and buttons
- A secondary settings or preferences panel
- An effects chain or mixer view
- A preset browser or library interface
- An advanced or expert mode view

### Developer Windows

**Developer windows** are for testing and debugging during design. They are excluded from exports, making them ideal for experimenting with alternative layouts, testing different element configurations, or creating reference windows that help you during development. Developer windows show a **DEV** badge on their tab to distinguish them from release windows.

Use developer windows when you need to:

- Test alternative UI layouts without affecting your main design
- Create reference windows showing design specs, color palettes, or spacing guides
- Build experimental views for internal testing
- Prototype new features before committing them to release windows

Developer windows can be freely created, modified, and deleted without worrying about export output. They are completely invisible to the export process.

### Changing Window Type

New windows default to release type. You can change the type at any time using the context menu (see [Managing Windows](#managing-windows) below). When you change a window from release to developer, it is immediately excluded from exports. When you change a window from developer to release, it is included in the next export.

## Managing Windows

Create, rename, duplicate, and delete windows to organize your project. All window management operations happen through the window tabs bar at the bottom of the interface.

### Creating a Window

Click the **+** button at the end of the window tabs bar to create a new window. The new window is created with a default name like "Window 2" and release type. It inherits default dimensions (800x600) and a solid gray background, which you can customize in the **Properties** panel.

The new window appears as a tab at the end of the tabs bar. Faceplate automatically switches to the new window after creation, showing its empty canvas. The window is immediately ready for use -- start dragging elements from the **Element Palette** to build the UI for this window.

### Switching Windows

Click any window tab to switch to that window. Each window has its own canvas with its own elements. The active window tab is highlighted with a lighter background color. When you switch windows, any element selection is cleared automatically.

### Window Properties

When no element is selected on the canvas, the **Properties** panel shows the current window's settings. You can configure:

- **Name** -- The window's display name (shown on the tab)
- **Width** and **Height** -- The window dimensions in pixels; these define the exported window size in your JUCE plugin
- **Background** -- Choose between a solid color, gradient (with angle control), or image background

These properties apply to the current window only. In multi-window projects, each window can have its own dimensions and background configuration.

![Window properties in the Properties panel when no element is selected](http://all-the-machines.com/github/faceplate/manual/windows-properties-panel.png)

**Window dimensions:** The width and height values set here determine the size of the exported JUCE WebView2 window in your plugin. These dimensions are independent of the canvas zoom level in Faceplate. When your plugin loads in a DAW, each window will open at the size you specified. Common plugin window sizes range from 400x300 (small utility plugin) to 1200x800 (complex synthesizer), though you can use any dimensions your plugin requires.

**Background types:**

- **Color** -- Solid color fill. Click the color swatch to open the color picker.
- **Gradient** -- Linear gradient with start color, end color, and angle. Adjust the angle to control gradient direction (0° = horizontal left-to-right, 90° = vertical top-to-bottom).
- **Image** -- Upload an image file to use as the background. The image is stretched to fill the window dimensions. Use this for custom backgrounds, textures, or branded designs.

To edit window properties, click on an empty area of the canvas to deselect all elements, then adjust the properties in the **Properties** panel.

### Renaming a Window

Double-click the window tab name to edit it inline. An input field appears where you can type the new name. Press **Enter** to save the new name, or **Escape** to cancel and keep the original name. The input field also saves automatically when you click away from it.

You can also rename a window through the context menu: right-click the window tab and select **Rename**. This activates the same inline editing mode.

### Duplicating a Window

Right-click the window tab and select **Duplicate** from the context menu. This creates a copy of the window with the same dimensions and background settings. The duplicate is given a default name like "Window 2 Copy" and is set to release type.

**Important:** Duplicating a window does not copy the elements on that window's canvas. The duplicate starts with an empty canvas. If you want to copy elements, use the copy-paste workflow (see [Cross-Window Copy/Paste](#cross-window-copypaste) below).

### Changing Window Type

Right-click the window tab to open the context menu. Under the **Window Type** section, select either **Release** or **Developer**. The selected type is highlighted in blue. Developer windows display a **DEV** badge on their tab.

Release windows are included in export output. Developer windows are excluded from export output. You can change the type at any time without affecting the window's elements or settings.

### Deleting a Window

Right-click the window tab and select **Delete** from the context menu. The window and all elements on its canvas are permanently deleted. This action cannot be undone.

You cannot delete the last remaining window in a project. The **Delete** option is disabled in the context menu when only one window exists.

### Cross-Window Copy/Paste

You can copy elements from one window and paste them into another using the standard **Ctrl+C** / **Ctrl+V** shortcuts (or **Cmd+C** / **Cmd+V** on Mac). Select the elements you want to copy on the source window, copy them, switch to the target window tab, and paste. The pasted elements appear at the same positions they had on the source window (offset if those positions are already occupied).

## Button Navigation

Configure a button element to navigate the user to a different window when clicked. This is how you create navigation between windows in your exported plugin UI.

1. Select a button element on the canvas
2. In the **Properties** panel, find the **Action** dropdown
3. Select **Navigate to Window** from the dropdown
4. A **Target Window** dropdown appears below the action dropdown
5. Select which window to navigate to when the button is clicked

In the exported JUCE WebView2 bundle, clicking this button will switch the visible window to the target window. This is the primary way users navigate between sections of your plugin UI.

### Navigation Examples

**Two-page settings flow:**

If you have a main window with a settings button and a settings window with a back button, you can configure the settings button to navigate to the settings window and the back button to navigate back to the main window. This creates a two-page navigation flow where users can access settings and return to the main view.

**Multi-section synthesizer:**

A complex synthesizer might have separate windows for oscillators, filters, effects, and modulation. Place navigation buttons on each window to let users jump between sections. This keeps each window focused on a specific synthesis module while still giving users access to all sections.

**Advanced/expert mode:**

Create a simple window for basic controls and an advanced window with detailed parameters. Add a button labeled "Advanced" on the simple window that navigates to the advanced window, and a "Basic" button on the advanced window to return. This gives new users a simplified interface while still providing full control for experienced users.

### Target Window Selection

The **Target Window** dropdown lists all release windows in your project. Developer windows are not included in the list because they are excluded from export output. If you need to test navigation to a developer window during design, temporarily change that window to release type, test the navigation, then change it back to developer type.

When you delete a window that is referenced by a button's navigation action, the button's action is automatically reset to **None**. This prevents broken references in your exported plugin.

---

[Back to User Manual](README.md) | [Canvas](canvas.md) | [Properties Panel](properties.md) | [Asset Library](assets.md) | [Font Management](fonts.md)
