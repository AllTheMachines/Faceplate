/**
 * Known issues and workarounds for JUCE WebView2 integration
 * Based on common problems reported by plugin developers
 */

export interface KnownIssue {
  title: string
  symptom: string
  cause: string
  solution: string
  codeExample?: string
}

export const KNOWN_ISSUES: KnownIssue[] = [
  {
    title: 'White Flash on Load',
    symptom: 'Brief white flash when plugin window opens',
    cause: 'WebView2 renders before CSS loads',
    solution: 'Set initial background color in WebView options and use body background in CSS',
    codeExample: `// In your JUCE editor constructor:
juce::WebBrowserComponent::Options options;
options = options.withBackgroundColour(juce::Colour(0x1a, 0x1a, 0x1a));
webView.reset(new juce::WebBrowserComponent(options));`,
  },
  {
    title: 'Controls Not Responding',
    symptom: 'Knobs/sliders don\'t respond to mouse input',
    cause: 'JavaScript event handlers not connected to JUCE backend',
    solution: 'Ensure WebSliderRelay bindings are registered and parameter IDs match',
    codeExample: `// Verify parameter ID in your processor:
parameters.createAndAddParameter(..., "gain", ...);
// Must match data-parameter-id in HTML:
// <div class="knob" data-parameter-id="gain">`,
  },
  {
    title: 'Slow Initial Load',
    symptom: 'Plugin takes 1-2 seconds to show UI on first open',
    cause: 'WebView2 runtime initialization',
    solution: 'Pre-warm WebView2 in background, use loading indicator',
    codeExample: `// Show loading state in JUCE while WebView initializes:
void EditorComponent::paint(juce::Graphics& g) {
    if (!webViewReady) {
        g.fillAll(juce::Colour(0x1a, 0x1a, 0x1a));
        g.setColour(juce::Colours::white);
        g.drawText("Loading...", getLocalBounds(), juce::Justification::centred);
    }
}`,
  },
  {
    title: 'Parameter Values Not Syncing',
    symptom: 'Moving knob in UI doesn\'t change DSP parameter',
    cause: 'Missing or incorrect WebSliderRelay setup',
    solution: 'Register each control with WebSliderRelay using matching parameter ID',
    codeExample: `// In bindings.cpp, ensure relay is registered:
webSliderRelay->registerSlider("gain", [this](float value) {
    processor.getParameters().getParameter("gain")->setValueNotifyingHost(value);
});`,
  },
  {
    title: 'UI Freezes During Automation',
    symptom: 'UI becomes unresponsive when DAW sends automation',
    cause: 'Too many parameter update messages flooding WebView',
    solution: 'Throttle parameter updates to 30-60fps',
    codeExample: `// Throttle updates in your relay:
void sendParameterUpdate(const String& id, float value) {
    auto now = Time::getMillisecondCounter();
    if (now - lastUpdateTime[id] > 16) { // ~60fps
        webView->runJavaScript("updateParameter('" + id + "'," + String(value) + ")");
        lastUpdateTime[id] = now;
    }
}`,
  },
]

export function formatKnownIssuesMarkdown(): string {
  let md = '## Known Issues and Workarounds\n\n'

  KNOWN_ISSUES.forEach((issue, index) => {
    md += `### ${index + 1}. ${issue.title}\n\n`
    md += `**Symptom:** ${issue.symptom}\n\n`
    md += `**Cause:** ${issue.cause}\n\n`
    md += `**Solution:** ${issue.solution}\n\n`
    if (issue.codeExample) {
      md += '```cpp\n' + issue.codeExample + '\n```\n\n'
    }
  })

  return md
}
