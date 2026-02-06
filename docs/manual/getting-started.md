# Getting Started

Faceplate is a visual designer for creating audio plugin user interfaces. You design your UI by dragging elements onto a canvas, configuring their properties, and exporting production-ready code for JUCE WebView2. This guide walks you through installation, introduces the interface, and takes you through creating your first element.

## Installation

Before you can run Faceplate, you need to install Node.js.

**Prerequisites:**
- Node.js 18 or later (download from https://nodejs.org)
- npm (included with Node.js)

**Option A: Download Release** (recommended for users)

1. Download the latest ZIP from GitHub Releases
2. Extract the ZIP to a folder on your computer
3. Open a terminal in the extracted folder
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start the development server
6. Open http://localhost:5173 in your browser

**Option B: Clone Repository** (for developers)

1. `git clone https://github.com/AllTheMachines/Faceplate.git`
2. `cd Faceplate`
3. `npm install`
4. `npm run dev`
5. Open http://localhost:5173 in your browser

After running `npm run dev`, your browser should automatically open to http://localhost:5173 showing Faceplate with a blank canvas ready for your first design.

![Faceplate running in the browser with a blank canvas](http://all-the-machines.com/github/faceplate/manual/getting-started-fresh-launch.png)

## Interface Overview

Faceplate uses a three-panel layout designed for efficient UI design workflows. The panels are always visible and arranged to keep your tools, canvas, and properties accessible at all times.

### Left Panel

The left panel (250px, left side) contains your primary tools and navigation:

**Header Area:**
- **Faceplate** logo with last-saved timestamp
- **Undo/Redo** buttons (keyboard shortcuts: **Ctrl+Z** / **Ctrl+Y**)

**Three Tabs:**

- **Elements** tab -- The element palette with draggable UI components organized by category (Controls, Buttons & Switches, Value Displays, Meters, Curves, Visualizations, Containers, Specialized). Drag any element from here onto the canvas to add it to your design.

- **Assets** tab -- The asset library for imported SVG graphics. Import your custom graphics here and drag them onto the canvas as SVG Graphic elements. Supports organizing assets into folders.

- **Layers** tab -- Layer management for organizing elements by depth. Create multiple layers to group related elements, control visibility, lock layers to prevent accidental edits, and reorder elements within layers to control z-order (which elements appear on top).

### Canvas

The canvas (center, flexible width) is the main design surface where you build your UI:

- Drag elements here from the **Elements** palette to add them to your design
- Click elements to select them (blue resize handles appear)
- Drag selected elements to move them
- Drag resize handles to change element size
- When working with multiple windows, tabs appear below the canvas showing window names -- click a tab to switch to that window

The canvas background shows the current window's configured background color. The canvas supports pan (hold **Space** + drag) and zoom (**Ctrl+scroll** or **Ctrl+Plus/Minus**).

### Properties Panel

The properties panel (300px, right side) shows properties for the currently selected element:

**Common Properties** (appear for all element types):
- **Position** (x, y) -- Element location on canvas
- **Size** (width, height) -- Element dimensions
- **Name** -- Optional label for organizing elements in code
- **parameterId** -- The parameter identifier that connects this UI element to your JUCE audio processing code

**Element-Specific Properties:**
Each element type has additional properties relevant to its behavior. For example:
- Knobs have min/max range, step size, default value, colors
- Sliders have orientation, track color, thumb style
- Buttons have text, icons, toggle mode

When no element is selected, the properties panel shows **window properties** (window width, height, background color).

## Quick Start

This tutorial walks you through creating your first UI element -- a knob configured to control a gain parameter. By the end, you'll understand the complete workflow from palette to preview.

### Step 1: Open the Element Palette

Click the **Elements** tab in the left panel. It should be selected by default when you first launch Faceplate.

You will see element categories organized by function:
- **Controls** -- Knobs, sliders, and other value input controls
- **Buttons & Switches** -- Toggle buttons, power buttons, switches
- **Value Displays** -- Labels, value displays, LED indicators
- And more...

![Element palette showing categories of available elements](http://all-the-machines.com/github/faceplate/manual/getting-started-palette.png)

### Step 2: Add a Knob to the Canvas

Find **Knob** under the **Controls** category (it should be near the top of the list).

1. Click and hold on the **Knob** item
2. Drag your mouse over to the canvas area
3. Release the mouse button to place the knob

A knob element appears on the canvas at the position where you released the mouse. The knob uses default styling (dark background, light pointer, value label below).

![Knob element placed on the canvas](http://all-the-machines.com/github/faceplate/manual/getting-started-knob-placed.png)

### Step 3: Select and Inspect the Element

Click the knob on the canvas to select it.

When selected:
- Blue resize handles appear at the corners and edges
- The properties panel on the right updates to show the knob's settings
- You can drag the knob to move it, or drag the resize handles to change its size

### Step 4: Configure the Element

In the properties panel, you'll see all configurable properties for the knob. The most important property for connecting your UI to JUCE is **parameterId**.

**Set the parameterId:**

1. Find the **parameterId** field in the properties panel
2. Click in the field and type `gain`
3. Press **Enter** to confirm

The `parameterId` is how JUCE will connect this knob to your audio processing code. In your JUCE C++ code, you'll reference this same `gain` identifier to read the knob's value and apply it to your audio processing.

**Customize other properties:**

- Change **min** and **max** to set the value range (e.g., min: 0, max: 1 for a gain control)
- Modify **defaultValue** to set the initial knob position
- Update **label** to change the text displayed below the knob (e.g., "Gain")
- Adjust colors in the **Style** section (pointer color, background color, border)

![Properties panel with parameterId set to gain](http://all-the-machines.com/github/faceplate/manual/getting-started-parameter-binding.png)

### Step 5: Preview Your Design

Now that you've configured your knob, preview how it will look and behave in a plugin:

1. Click the **Export** button at the top of the properties panel area (or use the **Export** tab in the left panel)
2. Select **Browser Preview** from the export options
3. A new browser tab opens showing your UI rendered as it would appear in a JUCE WebView2 plugin

In the preview, the knob is fully interactive -- you can click and drag to rotate it, and the value updates in real-time. This is exactly how it will behave when integrated into your JUCE plugin.

### Tips for Efficient Design

- **Snap Grid:** Press **Ctrl+G** to toggle snap grid. When enabled, elements snap to a grid as you drag them, making it easy to align elements precisely.
- **Nudge Elements:** Use **arrow keys** to move selected elements by 1px. Hold **Shift+Arrow** to move by 10px.
- **Duplicate Elements:** Select an element and press **Ctrl+D** to duplicate it, or use **Ctrl+C** and **Ctrl+V** to copy and paste.
- **Keyboard Shortcuts:** Press **F1** to see all available keyboard shortcuts.

## Next Steps

Now that you've created your first element, explore these topics to build more complex UIs:

**Core Features:**
- [Canvas](canvas.md) -- Learn about selection modes, copy/paste, zoom, pan, and snap grid
- [Element Palette](palette.md) -- Explore all available element categories and types
- [Properties Panel](properties.md) -- Deep dive into element configuration and parameter binding
- [Layers](layers.md) -- Organize complex layouts with multiple layers

**Advanced Features:**
- [Multi-Window Projects](windows.md) -- Create multi-window UIs (e.g., main plugin window + separate editor windows)
- [Asset Library](assets.md) -- Import custom SVG graphics for unique visual designs
- [Element Styles](styles.md) -- Create custom element styles using SVG layer mapping
- [Export](export.md) -- Export a production JUCE WebView2 bundle ready to integrate into your plugin

**Back to [User Manual](README.md)**
