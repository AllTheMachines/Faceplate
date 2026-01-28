# JUCE Integration Guide

Complete guide to integrating Faceplate-exported WebView UIs with JUCE plugins.

## Quick Start

1. Copy exported files to your project's Resources folder
2. Add WebBrowserComponent with native function registration
3. Implement parameter sync in pageFinishedLoading()

## Parameter Sync Architecture

### Request-Based Sync (Recommended)

The recommended approach uses request-based synchronization: JavaScript signals when it's ready, then C++ pushes parameter values.

```
                JavaScript (UI)
                        |
                        | initializeJUCEBridge() completes
                        | all UI elements initialized
                        v
              bridge.requestParamSync()
                        |
                        v
                C++ (Source of Truth)
                        |
                        | Receives requestParamSync call
                        | Iterates all parameters
                        v
              evaluateJavascript("updateKnobVisual(...)")
                        |
                        v
                JavaScript (UI)
                        |
                        v
              Knobs update to correct positions
```

**Flow:**
1. DAW loads project with plugin
2. C++ creates editor, WebView starts loading
3. WebView loads HTML, CSS, JS
4. JS: `initializeJUCEBridge()` runs
5. JS: Polls until JUCE backend available
6. JS: Creates bridge wrappers
7. JS: Sets up all knob/slider interactions
8. JS: Calls `bridge.requestParamSync()` — signals readiness
9. C++: Receives `requestParamSync` call
10. C++: Calls `evaluateJavascript("updateKnobVisual('volume', 0.5)")` for each param
11. JS: Knobs update to correct positions

**Why This Matters:**
- **Reliable**: No guessing with timer delays
- **Works everywhere**: Different DAWs, different load times
- **Clean architecture**: JS signals readiness, C++ responds

### Legacy Timer-Based Sync (Fallback)

If C++ doesn't implement `requestParamSync`, the fallback uses a timer-based approach:

```
                C++ (Source of Truth)
                        |
                        | pageFinishedLoading()
                        | + 100ms delay
                        v
              emitEvent("__juce__paramSync")
                        |
                        v
                JavaScript (UI)
                        |
                        | setupParameterSyncListener()
                        v
              updateKnobVisual(), etc.
```

### Why Parameter Sync?

When a plugin editor opens, the WebView UI initializes with default values defined in the design. However, the actual parameter values in C++ may differ:
- User loaded a preset
- DAW restored session state
- Automation recorded different values

Without sync, the UI shows wrong values, and the first user interaction causes a "jump" to the displayed value.

## C++ Implementation

### PluginEditor.h

```cpp
#include <juce_gui_extra/juce_gui_extra.h>

class PluginEditor : public juce::AudioProcessorEditor
{
public:
    PluginEditor(PluginProcessor& p);
    ~PluginEditor() override;

    void resized() override;
    void pageFinishedLoading();  // Called when WebView is ready

private:
    PluginProcessor& processor;
    juce::WebBrowserComponent browser;

    void syncAllParametersToWebView();
};
```

### PluginEditor.cpp

```cpp
PluginEditor::PluginEditor(PluginProcessor& p)
    : AudioProcessorEditor(&p), processor(p),
      browser(juce::WebBrowserComponent::Options()
          .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
          .withResourceProvider([this](const auto& url) { return getResource(url); })
          // Register native functions for JS -> C++ communication
          .withNativeFunction("setParameter", [this](auto& args, auto complete) {
              // ... (see JUCE_PATTERN.md)
          })
          // ... other native functions
      )
{
    setSize(800, 600);  // Match your design canvas size
    addAndMakeVisible(browser);
    browser.goToURL("http://localhost/index.html");
}

void PluginEditor::pageFinishedLoading()
{
    // CRITICAL: Wait 100ms for JavaScript environment to initialize
    // Calling emitEvent immediately often fails silently
    juce::Timer::callAfterDelay(100, [this]() {
        syncAllParametersToWebView();
    });
}

void PluginEditor::syncAllParametersToWebView()
{
    juce::Array<juce::var> paramArray;

    // Iterate all parameters in APVTS
    for (auto* param : processor.apvts.getParameters())
    {
        auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param);
        if (!rangedParam) continue;

        // Get parameter ID and normalized value (0-1)
        auto paramId = rangedParam->paramID;
        auto normalizedValue = rangedParam->getValue();

        // Build parameter object
        juce::DynamicObject::Ptr paramObj = new juce::DynamicObject();
        paramObj->setProperty("id", paramId);
        paramObj->setProperty("value", normalizedValue);

        paramArray.add(juce::var(paramObj.get()));
    }

    // Build event payload
    juce::DynamicObject::Ptr eventData = new juce::DynamicObject();
    eventData->setProperty("params", paramArray);

    // Emit single batch event
    browser.emitEvent("__juce__paramSync", juce::var(eventData.get()));

    DBG("Synced " << paramArray.size() << " parameters to WebView");
}
```

### Request-Based Sync (Recommended C++ Implementation)

Register the `requestParamSync` native function to enable request-based sync:

```cpp
PluginEditor::PluginEditor(PluginProcessor& p)
    : AudioProcessorEditor(&p), processor(p),
      browser(juce::WebBrowserComponent::Options()
          .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
          .withResourceProvider([this](const auto& url) { return getResource(url); })
          // Register requestParamSync for request-based sync
          .withNativeFunction("requestParamSync", [this](auto& args, auto complete) {
              // JS is ready - sync all parameters now
              syncAllParametersToWebView();
              complete({});
          })
          // ... other native functions
      )
{
    // ...
}
```

With request-based sync, you no longer need the timer delay in `pageFinishedLoading()`:

```cpp
void PluginEditor::pageFinishedLoading()
{
    // No action needed - JS will call requestParamSync when ready
    DBG("WebView page loaded, waiting for JS to request param sync");
}
```

## Parameter ID Mapping

Faceplate maps element IDs to parameter IDs as follows:

| If | Then Parameter ID is |
|----|---------------------|
| `parameterId` property set | Use that value |
| `parameterId` not set | Use `toKebabCase(element.name)` |

Examples:
- Element "Gain Knob" with no parameterId → "gain-knob"
- Element "Mix" with parameterId="wetDryMix" → "wetDryMix"

Ensure your C++ APVTS parameter IDs match exactly (case-sensitive).

## Multi-Window Considerations

For projects with multiple windows:
- Each window has its own pageFinishedLoading callback
- Sync only parameters relevant to that window
- Or sync all parameters (simpler, slightly more overhead)

## Troubleshooting

### UI doesn't update after sync
1. Check browser console for "[ParamSync]" or "[JUCEBridge]" log messages
2. Verify data-parameter-id attributes in HTML match C++ parameter IDs
3. For request-based sync: ensure C++ has registered `requestParamSync` native function
4. For legacy sync: ensure 100ms delay is used (not immediate emit)

### Controls jump on first interaction
- This indicates internal state wasn't updated during sync
- Verify setupParameterSyncListener is called
- Check that element._knobValue (etc.) is being set

### Sync works in some hosts but not others
- Use request-based sync (recommended) - it handles varying load times automatically
- For legacy sync: use Timer::callAfterDelay to ensure consistent timing

### requestParamSync not being called
- Check browser console for "[JUCEBridge] requestParamSync not available" message
- Ensure C++ registers the `requestParamSync` native function
- The JS side gracefully falls back if the function isn't available

## Related Documentation

- [JUCE_PATTERN.md](./JUCE_PATTERN.md) - JS <-> C++ communication pattern
- [EXPORT_FORMAT.md](./EXPORT_FORMAT.md) - Generated file structure
