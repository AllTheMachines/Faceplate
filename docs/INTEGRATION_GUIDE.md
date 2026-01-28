# Faceplate Integration Guide

Complete guide for integrating Faceplate-generated UI bundles with JUCE WebView2 plugins.

## Overview

### What is Faceplate?

Faceplate is a browser-based visual design tool for creating audio plugin user interfaces. It provides:

- **Drag-and-drop UI design** with 100+ element types
- **Real-time preview** of interactive behaviors
- **Code export** for JUCE WebView2 plugins
- **SVG asset management** with security sanitization
- **Multi-window support** for complex plugin UIs

### What Does Faceplate Generate?

Faceplate exports a self-contained bundle of web files that JUCE's WebBrowserComponent renders as the plugin UI:

```
my-plugin-juce.zip
├── index.html          # Main UI structure
├── style.css           # Element styling and layout
├── components.js       # UI update functions
├── bindings.js         # JUCE parameter bindings
├── README.md           # Integration documentation
└── assets/             # Images and fonts (if used)
    ├── image1.png
    └── font.woff2
```

### Why Use Faceplate?

1. **Visual Design** - See exactly what your plugin will look like as you build it
2. **Rapid Prototyping** - Test UI concepts without writing code
3. **Consistent Output** - Generated code follows proven patterns
4. **WYSIWYG Export** - What you design is what gets rendered

---

## Export Format

### File Structure

| File | Purpose |
|------|---------|
| `index.html` | HTML structure with positioned elements |
| `style.css` | CSS styling, fonts, responsive scaling |
| `components.js` | Functions to update UI visuals (knobs, sliders, etc.) |
| `bindings.js` | JUCE bridge + interaction handlers + responsive scaling |
| `README.md` | Integration instructions specific to your project |

### How Files Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                            │
│  - Loads style.css for styling                             │
│  - Loads components.js for visual updates                  │
│  - Loads bindings.js for JUCE communication               │
│  - Contains all UI elements with absolute positioning      │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  style.css  │    │components.js│    │ bindings.js │
   │             │    │             │    │             │
   │ - Layout    │    │ - Visual    │    │ - JUCE      │
   │ - Colors    │    │   updates   │    │   bridge    │
   │ - Fonts     │    │ - Arc math  │    │ - Handlers  │
   │ - Scrollbar │    │ - SVG paths │    │ - Polling   │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## JUCE Integration

### Prerequisites

- JUCE 7.0+ with WebView2 support
- Windows: WebView2 Runtime (usually pre-installed on Windows 10/11)
- macOS: WKWebView (built-in)

### WebBrowserComponent Setup

The WebBrowserComponent hosts the web UI inside your plugin editor:

```cpp
// PluginEditor.h
#pragma once
#include <JuceHeader.h>
#include "PluginProcessor.h"

class PluginEditor : public juce::AudioProcessorEditor
{
public:
    PluginEditor(PluginProcessor&);
    ~PluginEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    PluginProcessor& processor;

    // WebView browser component
    juce::WebBrowserComponent browser {
        juce::WebBrowserComponent::Options()
            .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
            .withResourceProvider([this](const auto& url) {
                return getResource(url);
            })
            .withNativeFunction("setParameter", [this](auto& args, auto complete) {
                handleSetParameter(args, complete);
            })
            .withNativeFunction("getParameter", [this](auto& args, auto complete) {
                handleGetParameter(args, complete);
            })
            .withNativeFunction("beginGesture", [this](auto& args, auto complete) {
                handleBeginGesture(args, complete);
            })
            .withNativeFunction("endGesture", [this](auto& args, auto complete) {
                handleEndGesture(args, complete);
            })
    };

    // Resource provider for loading HTML/CSS/JS
    std::optional<juce::WebBrowserComponent::Resource> getResource(const juce::String& url);

    // Native function handlers
    void handleSetParameter(const juce::Array<juce::var>& args,
                           juce::WebBrowserComponent::NativeFunctionCompletion complete);
    void handleGetParameter(const juce::Array<juce::var>& args,
                           juce::WebBrowserComponent::NativeFunctionCompletion complete);
    void handleBeginGesture(const juce::Array<juce::var>& args,
                           juce::WebBrowserComponent::NativeFunctionCompletion complete);
    void handleEndGesture(const juce::Array<juce::var>& args,
                         juce::WebBrowserComponent::NativeFunctionCompletion complete);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PluginEditor)
};
```

### Native Function Registration

Faceplate's generated JavaScript expects these 4 standard native functions:

| Function | Purpose | Arguments |
|----------|---------|-----------|
| `setParameter` | Set parameter value | `(paramId: string, value: number)` |
| `getParameter` | Get current value | `(paramId: string)` |
| `beginGesture` | Start automation gesture | `(paramId: string)` |
| `endGesture` | End automation gesture | `(paramId: string)` |

### Complete PluginEditor.cpp

```cpp
// PluginEditor.cpp
#include "PluginEditor.h"

// Binary data generated by juce_add_binary_data
#include "BinaryData.h"

PluginEditor::PluginEditor(PluginProcessor& p)
    : AudioProcessorEditor(&p), processor(p)
{
    // Match canvas size from Faceplate
    setSize(800, 600);

    // Add browser to editor
    addAndMakeVisible(browser);

    // Navigate to index.html via resource provider
    browser.goToURL("http://localhost/index.html");
}

PluginEditor::~PluginEditor() = default;

void PluginEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
}

void PluginEditor::resized()
{
    browser.setBounds(getLocalBounds());
}

std::optional<juce::WebBrowserComponent::Resource>
PluginEditor::getResource(const juce::String& url)
{
    // Extract filename from URL
    auto filename = url.fromLastOccurrenceOf("/", false, false);

    // Map to binary data
    int dataSize = 0;
    const char* data = nullptr;
    juce::String mimeType;

    if (filename == "index.html")
    {
        data = BinaryData::index_html;
        dataSize = BinaryData::index_htmlSize;
        mimeType = "text/html";
    }
    else if (filename == "style.css")
    {
        data = BinaryData::style_css;
        dataSize = BinaryData::style_cssSize;
        mimeType = "text/css";
    }
    else if (filename == "components.js")
    {
        data = BinaryData::components_js;
        dataSize = BinaryData::components_jsSize;
        mimeType = "application/javascript";
    }
    else if (filename == "bindings.js")
    {
        data = BinaryData::bindings_js;
        dataSize = BinaryData::bindings_jsSize;
        mimeType = "application/javascript";
    }

    if (data != nullptr)
    {
        return juce::WebBrowserComponent::Resource {
            juce::MemoryBlock(data, static_cast<size_t>(dataSize)),
            mimeType
        };
    }

    return std::nullopt;
}

void PluginEditor::handleSetParameter(
    const juce::Array<juce::var>& args,
    juce::WebBrowserComponent::NativeFunctionCompletion complete)
{
    if (args.size() >= 2)
    {
        auto paramId = args[0].toString();
        auto value = static_cast<float>(args[1]);

        if (auto* param = processor.apvts.getParameter(paramId))
        {
            param->setValueNotifyingHost(value);
        }
    }
    complete({});
}

void PluginEditor::handleGetParameter(
    const juce::Array<juce::var>& args,
    juce::WebBrowserComponent::NativeFunctionCompletion complete)
{
    if (args.size() >= 1)
    {
        auto paramId = args[0].toString();

        if (auto* param = processor.apvts.getParameter(paramId))
        {
            complete(param->getValue());
            return;
        }
    }
    complete(0.5f);
}

void PluginEditor::handleBeginGesture(
    const juce::Array<juce::var>& args,
    juce::WebBrowserComponent::NativeFunctionCompletion complete)
{
    if (args.size() >= 1)
    {
        auto paramId = args[0].toString();

        if (auto* param = processor.apvts.getParameter(paramId))
        {
            param->beginChangeGesture();
        }
    }
    complete({});
}

void PluginEditor::handleEndGesture(
    const juce::Array<juce::var>& args,
    juce::WebBrowserComponent::NativeFunctionCompletion complete)
{
    if (args.size() >= 1)
    {
        auto paramId = args[0].toString();

        if (auto* param = processor.apvts.getParameter(paramId))
        {
            param->endChangeGesture();
        }
    }
    complete({});
}
```

### CMakeLists.txt Configuration

Add the exported files as binary data:

```cmake
# Add UI resources as binary data
juce_add_binary_data(${PROJECT_NAME}_UIData
    NAMESPACE BinaryData
    SOURCES
        ui/index.html
        ui/style.css
        ui/components.js
        ui/bindings.js
)

# Link to your plugin target
target_link_libraries(${PROJECT_NAME}
    PRIVATE
        ${PROJECT_NAME}_UIData
        juce::juce_audio_utils
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)
```

---

## Step-by-Step Integration

### 1. Design UI in Faceplate

1. Open Faceplate in your browser
2. Set canvas dimensions (match your desired plugin size)
3. Drag elements from the palette onto the canvas
4. Configure properties for each element
5. Set **Parameter ID** for interactive elements (must match C++ APVTS)
6. Preview to test interactions

### 2. Export Project

1. Click **Export** > **JUCE Bundle**
2. Save the ZIP file
3. Extract contents to your JUCE project (e.g., `Source/ui/`)

### 3. Update CMakeLists.txt

Add the `juce_add_binary_data` call as shown above.

### 4. Set Up PluginEditor

1. Add WebBrowserComponent member
2. Register the 4 native functions
3. Implement resource provider
4. Set editor size to match canvas

### 5. Connect Parameters

Ensure parameter IDs in Faceplate match your APVTS:

```cpp
// PluginProcessor.cpp - APVTS parameter layout
juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout()
{
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    // Parameter ID must match what you set in Faceplate
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "gain",         // <-- This ID must match Faceplate's Parameter ID
        "Gain",
        0.0f, 1.0f, 0.5f
    ));

    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "masterVolume", // <-- Must match
        "Master Volume",
        0.0f, 1.0f, 0.75f
    ));

    return { params.begin(), params.end() };
}
```

### 6. Build and Test

1. Build your plugin
2. Load in a DAW
3. Verify controls respond to interaction
4. Test automation recording/playback

---

## Troubleshooting

### UI Doesn't Load

**Symptoms:** Blank or black plugin window

**Solutions:**
1. Verify binary data is linked correctly
2. Check resource provider returns valid data
3. Verify URL path matches (`http://localhost/index.html`)
4. On Windows, ensure WebView2 Runtime is installed

### Controls Don't Respond

**Symptoms:** Knobs/sliders don't affect audio

**Solutions:**
1. Verify Parameter IDs match exactly (case-sensitive)
2. Check native functions are registered
3. Open browser DevTools (F12 in standalone) for JavaScript errors
4. Verify APVTS has the parameter defined

### Canvas Size Mismatch

**Symptoms:** UI appears cropped or has extra space

**Solutions:**
1. Match `setSize()` to Faceplate canvas dimensions
2. Verify CSS doesn't override dimensions
3. Check responsive scaling in bindings.js

### WebView2 Issues (Windows)

**Symptoms:** Crash or blank window on Windows

**Solutions:**
1. Install [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
2. Use `.withBackend(Backend::webview2)` in options
3. Check for antivirus blocking WebView2

### JavaScript Errors

**Symptoms:** Partial functionality, console errors

**Solutions:**
1. Open DevTools: Add `browser.emitEventIfBrowserIsVisible("openDevTools", {})` temporarily
2. Check for missing elements (ID mismatches)
3. Verify script load order (components.js before bindings.js)

---

## Platform Notes

### Windows

- Requires WebView2 Runtime (Edge Chromium-based)
- Usually pre-installed on Windows 10 20H2+ and Windows 11
- For older systems, bundle or prompt for installation

### macOS

- Uses WKWebView (built-in)
- No additional runtime required
- Supported on macOS 10.11+

### Linux

- WebView support varies by distribution
- Consider alternative UI approaches for Linux targets

---

## Next Steps

- See [JUCE_PATTERN.md](./JUCE_PATTERN.md) for the complete communication pattern
- See [EXPORT_FORMAT.md](./EXPORT_FORMAT.md) for detailed file format reference
- See [ELEMENT_REFERENCE.md](./ELEMENT_REFERENCE.md) for all available elements
- See [BEST_PRACTICES.md](./BEST_PRACTICES.md) for design guidelines

---

*Last updated: 28 January 2026*
