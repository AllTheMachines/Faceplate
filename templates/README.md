# VST3 Project Templates

This folder contains starter templates for integrating Faceplate UIs into VST3 projects.

## vst-base/

A complete JUCE-based VST3 project template with WebView UI support.

### Quick Start

1. Copy `vst-base/` to your project location
2. Rename the folder to your plugin name
3. Edit `plugin.config` with your plugin details
4. Run `build.bat` (Windows) or configure CMake manually

### Project Structure

```
vst-base/
├── CMakeLists.txt      # Build configuration
├── plugin.config       # Plugin name, vendor, IDs
├── src/
│   ├── PluginProcessor.cpp/h   # Audio processing
│   └── PluginEditor.cpp/h      # WebView UI host
├── ui/
│   ├── index.html      # Main UI entry point
│   ├── style.css       # Styles
│   ├── components.js   # UI components
│   └── bindings.js     # Parameter bindings
├── build.bat           # Windows build script
└── rebuild.bat         # Clean rebuild script
```

### Requirements

- JUCE 7.x or later
- CMake 3.22+
- C++17 compatible compiler
- WebView2 (Windows) / WKWebView (macOS)

### Parameter Binding

Export your Faceplate design and place generated files in `ui/`. Parameters are bound via `parameterId` attributes matching your processor's parameter IDs.

```javascript
// bindings.js example
bindParameter('volume', 'volumeKnob');
bindParameter('cutoff', 'filterKnob');
```

## UI Starter Templates

### effect-starter.json
Basic effect plugin layout (500x300px) with volume knob, output meter, and status indicator.

### instrument-starter.json
Synth/sampler layout (600x400px) with gain control, ADSR envelope knobs, and section labels.

Load these in Faceplate via File > Open, customize as needed, then export to your VST3 project's `ui/` folder.

## Integration Workflow

1. Design UI in Faceplate
2. Export to your VST3 project's `ui/` folder
3. Ensure parameter IDs match between UI and processor
4. Build and test
