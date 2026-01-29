# VST3 WebView UI Designer

A browser-based visual design tool for creating audio plugin user interfaces. Drag-and-drop 100+ UI components onto a canvas, configure properties, organize with layers, and export working code for JUCE WebView2 plugins.

## Features

### Visual Design
- **100+ Element Types**: Knobs, sliders, buttons, meters, LEDs, visualizations, curves, and more
- **Drag-and-Drop Canvas**: Position, resize, and configure elements visually
- **Property Panel**: Configure all element properties with contextual help
- **Dark Theme**: Professional audio plugin aesthetic

### Organization (v1.9)
- **Layers System**: Organize elements into named layers with custom colors
- **Visibility Toggle**: Hide layers to work on specific parts of your UI
- **Lock Toggle**: Lock layers to prevent accidental changes
- **Z-Order Control**: Drag layers to control element stacking order

### Help System (v1.9)
- **Contextual Help**: (?) buttons on every property section
- **F1 Shortcut**: Press F1 for help on selected element
- **Dark Themed Docs**: Help windows match app styling
- **102 Element Types Documented**: Comprehensive reference

### Multi-Window Support (v1.6+)
- **Multiple Windows**: Create main, settings, and developer windows
- **Window Types**: Release vs developer windows for export filtering
- **Button Navigation**: Configure buttons to switch between windows

### Asset Management
- **SVG Import**: Import custom SVG assets with security sanitization
- **Custom Fonts**: Select fonts folder, preview in dropdown, export bundled
- **Knob Styles**: Create reusable SVG knob designs with layer mapping

### Export
- **JUCE WebView2 Bundle**: HTML/CSS/JS + C++ snippets
- **Browser Preview**: Test UI before JUCE integration
- **Multi-Window Export**: Separate folders per window
- **Parameter Sync**: Exported code syncs with C++ parameter values

## Quick Start

### 1. Start the Designer
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173`

### 2. Create Your UI
- Drag elements from the **Elements** palette (left panel)
- Configure properties in the **Properties** panel (right panel)
- Organize with the **Layers** tab
- Press **F1** for help on any selected element

### 3. Export to JUCE
- Click **Export** > **JUCE Bundle**
- Extract to your VST3 project's WebUI folder
- Integrate C++ bindings from `bindings.cpp`

## Quick Start with VST3 Templates

The fastest way to create a JUCE WebView2 VST3 plugin:

1. **Clone a VST3 template:**
```bash
git clone https://github.com/yourusername/EFXvst  # For effects
# OR
git clone https://github.com/yourusername/INSTvst # For instruments
```

2. **Start the UI designer:**
```bash
npm install
npm run dev
```

3. **Create from template:**
   - Click "New Project" > "Effect Starter" or "Instrument Starter"
   - Customize your UI
   - Export to your VST3 project folder

4. **Build your plugin:**
   - Integrate exported code (see [WORKFLOW.md](./docs/WORKFLOW.md))
   - Build in JUCE
   - Load in your DAW

See the complete [VST3 Workflow Guide](./docs/WORKFLOW.md) for detailed instructions.

## Documentation

- [WORKFLOW.md](./docs/WORKFLOW.md) - Complete VST3 development workflow
- [ELEMENT_REFERENCE.md](./docs/ELEMENT_REFERENCE.md) - All 100+ element types
- [BEST_PRACTICES.md](./docs/BEST_PRACTICES.md) - Design guidelines
- [INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md) - JUCE integration
- [EXPORT_FORMAT.md](./docs/EXPORT_FORMAT.md) - Export file format details

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| F1 | Open help for selected element |
| Ctrl+G | Toggle snap grid |
| Ctrl+Z / Ctrl+Y | Undo / Redo |
| Ctrl+C / Ctrl+V | Copy / Paste |
| Delete | Delete selected |
| Arrow keys | Nudge selected elements |
| Shift+Drag | Constrained movement |
| H | Toggle layer visibility (when layer selected) |

## Related Repositories

- **[EFXvst](https://github.com/yourusername/EFXvst)** - Effect VST3 template with WebView2
- **[INSTvst](https://github.com/yourusername/INSTvst)** - Instrument VST3 template with WebView2

## Version History

- **v1.9** - Layers system, help system, bug fixes
- **v1.8** - Bug fixes & UI improvements
- **v1.7** - Parameter sync for C++ integration
- **v1.6** - Multi-window system
- **v1.5** - Font management, SVG export
- **v1.4** - Container editing system
- **v1.3** - Undo history, unsaved changes protection
- **v1.2** - 78 new element types (100+ total)
- **v1.1** - SVG import system
- **v1.0** - Initial MVP

---

*Built with React, TypeScript, Vite, Zustand, @dnd-kit, and Tailwind CSS*
