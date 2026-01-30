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

## Real-Time Parameter Updates (C++ → JavaScript)

### The Problem

When users interact with host controls (DAW automation, MIDI learn, preset changes), the WebView UI needs to update in real-time to reflect these changes. Without this, the UI shows stale values and feels disconnected.

### Solution: Timer-Based Polling

Use a timer to continuously poll parameter values and emit `__juce__paramSync` events when they change. This works for all parameter change sources: user drag, host automation, MIDI, presets, etc.

**Why not use parameter listeners?**
- JUCE's `AudioProcessorValueTreeState::Listener::parameterChanged()` only fires on **committed** changes (mouse up, discrete jumps)
- It does NOT fire during continuous drag operations
- Result: UI only updates when you release the mouse, not while dragging

### Implementation

**PluginEditor.h:**
```cpp
#include <juce_gui_extra/juce_gui_extra.h>

class PluginEditor : public juce::AudioProcessorEditor,
                     private juce::Timer  // Add Timer inheritance
{
public:
    PluginEditor(PluginProcessor& p);
    ~PluginEditor() override;

    void resized() override;
    void pageFinishedLoading();

private:
    void timerCallback() override;  // Add timer callback
    void syncAllParametersToWebView();

    PluginProcessor& processor;
    juce::WebBrowserComponent browser;

    // Track last sent values to avoid redundant updates
    std::map<juce::String, float> lastSentValues;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PluginEditor)
};
```

**PluginEditor.cpp - Constructor:**
```cpp
PluginEditor::PluginEditor(PluginProcessor& p)
    : AudioProcessorEditor(&p), processor(p),
      browser(juce::WebBrowserComponent::Options()
          .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
          .withResourceProvider([this](const auto& url) { return getResource(url); })
          .withNativeFunction("setParameter", [this](auto& args, auto complete) {
              // ... (see JUCE_PATTERN.md)
          })
          .withNativeFunction("requestParamSync", [this](auto& args, auto complete) {
              syncAllParametersToWebView();
              complete({});
          })
          // ... other native functions
      )
{
    setSize(800, 600);
    addAndMakeVisible(browser);
    browser.goToURL("http://localhost/index.html");

    // Initialize tracking map with current parameter values
    for (auto* param : processor.apvts.getParameters())
    {
        if (auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param))
            lastSentValues[rangedParam->paramID] = rangedParam->getValue();
    }

    // Start timer for real-time parameter updates
    // 30 Hz = smooth updates with low CPU overhead
    // 60 Hz = even smoother, matches display refresh rate
    startTimerHz(30);
}
```

**PluginEditor.cpp - Destructor:**
```cpp
PluginEditor::~PluginEditor()
{
    stopTimer();
}
```

**PluginEditor.cpp - Timer Callback:**
```cpp
void PluginEditor::timerCallback()
{
    juce::Array<juce::var> changedParams;

    // Poll all parameters for changes
    for (auto* param : processor.apvts.getParameters())
    {
        auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param);
        if (!rangedParam) continue;

        float currentValue = rangedParam->getValue();
        float& lastValue = lastSentValues[rangedParam->paramID];

        // Only send if value actually changed (threshold avoids float precision spam)
        if (std::abs(currentValue - lastValue) > 0.0001f)
        {
            juce::DynamicObject::Ptr paramObj = new juce::DynamicObject();
            paramObj->setProperty("id", rangedParam->paramID);
            paramObj->setProperty("value", currentValue);
            changedParams.add(juce::var(paramObj.get()));

            lastValue = currentValue;
        }
    }

    // Emit event only if parameters changed
    if (!changedParams.isEmpty())
    {
        juce::DynamicObject::Ptr eventData = new juce::DynamicObject();
        eventData->setProperty("params", changedParams);
        browser.emitEvent("__juce__paramSync", juce::var(eventData.get()));
    }
}
```

**Keep the sync method for initial load:**
```cpp
void PluginEditor::syncAllParametersToWebView()
{
    juce::Array<juce::var> paramArray;

    for (auto* param : processor.apvts.getParameters())
    {
        auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param);
        if (!rangedParam) continue;

        juce::DynamicObject::Ptr paramObj = new juce::DynamicObject();
        paramObj->setProperty("id", rangedParam->paramID);
        paramObj->setProperty("value", rangedParam->getValue());
        paramArray.add(juce::var(paramObj.get()));
    }

    juce::DynamicObject::Ptr eventData = new juce::DynamicObject();
    eventData->setProperty("params", paramArray);
    browser.emitEvent("__juce__paramSync", juce::var(eventData.get()));

    DBG("Synced " << paramArray.size() << " parameters to WebView");
}
```

### Performance Considerations

| Update Rate | CPU Impact | User Experience | Best For |
|-------------|-----------|-----------------|----------|
| 15 Hz | Very low | Slight lag noticeable | Resource-constrained systems |
| 30 Hz | Low | Smooth, imperceptible lag | Recommended default |
| 60 Hz | Moderate | Perfectly smooth | High-end systems, critical UI |
| 120 Hz | High | Overkill, no benefit | Not recommended |

**Recommended:** Start with 30 Hz. Increase to 60 Hz only if users report lag.

The threshold `0.0001f` prevents redundant updates due to floating-point precision noise.

### What Gets Updated

This approach updates the WebView for parameter changes from ANY source:

- ✅ Host automation (DAW timeline)
- ✅ MIDI learn / MIDI CC
- ✅ Preset changes
- ✅ Other plugin windows (if multi-window)
- ✅ Manual parameter changes via code
- ✅ External control surfaces

### Common Use Cases

**ASCII Noise Intensity:**
If you have an ASCII noise element with `data-noise-param="movement"`, the timer ensures:
1. User drags the "movement" slider in the DAW
2. Timer detects change within 33ms (at 30 Hz)
3. Emits `__juce__paramSync` event with new value
4. JavaScript updates `element._noiseIntensity`
5. Noise visual responds in real-time

**Automation Playback:**
If the DAW plays back automation:
1. Parameters change at automation resolution (~48 updates/sec typical)
2. Timer polls at 30 Hz, catches changes
3. UI updates smoothly during playback

### Troubleshooting

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| UI updates only on mouse up | Not using timer polling | Add Timer inheritance and timerCallback |
| UI updates but feels laggy | Timer frequency too low | Increase from 30 Hz to 60 Hz |
| High CPU usage | Timer frequency too high | Reduce from 60 Hz to 30 Hz |
| UI not updating at all | Timer not started | Check startTimerHz() in constructor |
| Spam in console | Threshold too low | Keep threshold at 0.0001f or higher |

## Related Documentation

- [JUCE_PATTERN.md](./JUCE_PATTERN.md) - JS <-> C++ communication pattern
- [EXPORT_FORMAT.md](./EXPORT_FORMAT.md) - Generated file structure
