# VST3 Plugin

A VST3 plugin with WebView2-based UI.

## Quick Start

1. Edit `plugin.config` with your plugin details
2. Edit `ui/index.html` to customize the UI
3. Build:
   ```bash
   cmake -B build -G "Visual Studio 17 2022"
   cmake --build build --config Release
   ```

## Configuration

All plugin metadata is in `plugin.config`. Edit this file anytime and rebuild to apply changes:

- **PLUGIN_NAME** - Internal name (PascalCase, no spaces)
- **PLUGIN_DISPLAY_NAME** - Name shown in DAW
- **PLUGIN_CODE** - 4-character unique plugin ID
- **MANUFACTURER_CODE** - 4-character company ID
- **WINDOW_WIDTH/HEIGHT** - Plugin window size
- **VST3_INSTALL_DIR** - Where to install the built plugin

## Project Structure

```
project/
├── plugin.config           # <-- Edit this for metadata
├── CMakeLists.txt          # Build configuration (reads plugin.config)
├── JUCE/                   # JUCE framework (submodule)
├── src/
│   ├── PluginProcessor.h   # Audio processing
│   ├── PluginProcessor.cpp
│   ├── PluginEditor.h      # WebView2 UI host
│   └── PluginEditor.cpp
└── ui/
    ├── index.html          # <-- Edit this for UI layout
    ├── style.css           # <-- Edit this for styling
    ├── components.js       # SVG knob/meter rendering
    └── bindings.js         # JUCE parameter bridge
```

## UI Development

The UI files in `ui/` are embedded into the plugin binary at build time.

**To preview the UI standalone:**
1. Open `ui/index.html` in a browser
2. Knobs work in "standalone mode" for testing

**To add a parameter:**
1. Add in `src/PluginProcessor.cpp` `createParameterLayout()`
2. Add knob in `ui/index.html` with `data-param` attribute
3. Rebuild

See `CLAUDE.md` for detailed instructions.

## Building

```bash
# Configure (first time, or after changing plugin.config)
cmake -B build -G "Visual Studio 17 2022"

# Build Release
cmake --build build --config Release

# Build Debug
cmake --build build --config Debug
```

The plugin is automatically installed to the directory specified in `plugin.config`.
