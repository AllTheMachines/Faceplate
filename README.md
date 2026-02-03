# Faceplate

A visual design tool for creating audio plugin user interfaces. Drag-and-drop UI components onto a canvas, configure properties, and export working code for JUCE WebView2 plugins.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/AllTheMachines/Faceplate.git
cd Faceplate

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Use

### Step 1: Start a Project

In the **Project** section (right panel, top):
- Click **Load Project** to open an existing `.json` project
- Or select a template from the **Load Template...** dropdown to start with a preset layout

### Step 2: Add Elements

1. Open the **Elements** tab in the left panel
2. Browse categories: Controls, Displays, Decorative, etc.
3. **Drag** any element onto the canvas
4. Elements snap to grid by default (toggle with **Ctrl+G**)

### Step 3: Configure Properties

1. **Click** an element on the canvas to select it
2. Use the **Properties** panel (right side) to configure:
   - Position & Size
   - Colors and styling
   - Parameter ID (for JUCE binding)
   - Element-specific options
3. Press **F1** for help on the selected element

### Step 4: Organize with Layers

1. Open the **Layers** tab in the left panel
2. Create layers to group related elements
3. Toggle visibility (eye icon) to focus on specific parts
4. Lock layers to prevent accidental changes
5. Drag layers to change z-order (stacking)

### Step 5: Export to JUCE

1. Click **Export** in the right panel
2. Choose **JUCE Bundle**
3. Select an output folder
4. The export includes:
   - `index.html` - Main UI file
   - `style.css` - Styles
   - `components.js` - UI component code
   - `bindings.js` - Parameter binding helpers

### Step 6: Integrate with Your Plugin

1. Copy the exported files to your JUCE project's WebView folder
2. Use the parameter IDs you set in Faceplate to bind UI elements to your C++ parameters
3. See [JUCE_INTEGRATION.md](./docs/JUCE_INTEGRATION.md) for WebView2 loading timing and parameter sync

## Features

### Visual Design
- **60+ Element Types**: Knobs, sliders, buttons, labels, panels, and more
- **Drag-and-Drop Canvas**: Position, resize, rotate elements visually
- **Property Panel**: Configure all properties with contextual help
- **Snap Grid**: Align elements precisely

### Organization
- **Layers System**: Group elements, control visibility and locking
- **Multi-Window Support**: Create main, settings, and developer windows
- **Undo/Redo**: Full history with Ctrl+Z / Ctrl+Y

### Export
- **JUCE WebView2 Bundle**: Ready-to-use HTML/CSS/JS
- **Browser Preview**: Test your UI before integration
- **Parameter Binding**: Exported code syncs with C++ parameters

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **F1** | Help for selected element |
| **Ctrl+S** | Save project |
| **Ctrl+Z** | Undo |
| **Ctrl+Y** | Redo |
| **Ctrl+G** | Toggle snap grid |
| **Ctrl+C / Ctrl+V** | Copy / Paste |
| **Delete** | Delete selected |
| **Arrow keys** | Nudge selected (1px) |
| **Shift+Arrow** | Nudge selected (10px) |

## Documentation

- [JUCE_INTEGRATION.md](./docs/JUCE_INTEGRATION.md) - WebView2 setup and parameter sync
- [ELEMENT_REFERENCE.md](./docs/ELEMENT_REFERENCE.md) - All element types
- [BEST_PRACTICES.md](./docs/BEST_PRACTICES.md) - Design guidelines
- [EXPORT_FORMAT.md](./docs/EXPORT_FORMAT.md) - Export file format

## Pro Features (Coming Soon)

Additional elements and features will be available with a Pro license:

- **Professional Meters**: VU, PPM, RMS, LUFS, True Peak, K-System meters
- **Visualizations**: Spectrum analyzer, spectrogram, goniometer, vectorscope
- **Curves**: EQ curve, compressor curve, envelope displays
- **Specialized Audio**: Piano keyboard, drum pads, step sequencer, XY pad
- **Asset Library**: Manage and reuse custom SVG assets
- **Knob Styles**: Create reusable custom knob designs

## License

This project uses an **Open Core** licensing model:

- **MIT License** - The core application and basic elements are free and open source
- **Commercial License** - Pro features (marked with PRO badge) require a [paid license](https://polar.sh/AllTheMachines)

See [LICENSE](./LICENSE) for full details.

---

*Built with React, TypeScript, Vite, and Tailwind CSS*
