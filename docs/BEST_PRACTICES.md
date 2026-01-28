# Best Practices

Design and implementation guidelines for creating audio plugin UIs with Faceplate.

## UI Design

### Recommended Dimensions

Choose canvas size based on your plugin type:

| Plugin Type | Recommended Size | Use Case |
|-------------|------------------|----------|
| Simple Effect | 400x300 | Single-purpose utilities |
| Standard Effect | 600x400 | EQ, compressor, reverb |
| Full-Featured Effect | 800x600 | Channel strips, multi-effects |
| Instrument | 900x600 | Synthesizers |
| Large Instrument | 1200x800 | Complex synths, samplers |

**Tips:**
- Start with a smaller size and expand as needed
- Consider that users may have limited screen space in DAWs
- Some DAWs don't support resizable plugin windows well

### Grid and Alignment

Use Faceplate's snap-to-grid feature for consistent layouts:

1. **Enable grid:** Press `Ctrl+G` to toggle grid visibility
2. **Configure grid size:** 8px or 16px works well for most designs
3. **Align elements:** Use the alignment tools in the toolbar
4. **Group related controls:** Keep related parameters visually close

**Spacing recommendations:**
- Minimum 8px between clickable elements
- 16-24px between control groups
- 44x44px minimum touch target for controls

### Color Schemes

Audio plugin UIs typically use dark themes:

```
Background:     #1a1a1a to #2a2a2a
Surface:        #333333 to #444444
Text Primary:   #ffffff
Text Secondary: #888888 to #aaaaaa
Accent:         Your brand color (e.g., #00ff88)
Warning:        #ff6600 to #ffaa00
Error/Clip:     #ff4444
```

**Accent color usage:**
- Active controls (fill arcs, LED on states)
- Focused elements
- Primary buttons
- Don't overuse - accent should draw attention

### Typography

Faceplate includes these embedded fonts:

| Font | Best For |
|------|----------|
| Inter | UI labels, general text |
| Roboto | Alternative for labels |
| Roboto Mono | Numeric displays, values |

**Guidelines:**
- Use 11-14px for control labels
- Use 10-12px for value displays
- Use 16-24px for section headers
- Maintain consistent font sizes within groups
- Don't use more than 2-3 font sizes per UI

### Accessibility

Consider users with varying abilities:

1. **Color contrast:** Minimum 4.5:1 ratio for text
2. **Touch targets:** Minimum 44x44px for mobile/touch
3. **Clear labeling:** Every control should have a visible label
4. **Logical grouping:** Related controls should be visually grouped
5. **Keyboard navigation:** (future) Support tab navigation

---

## Parameter Binding

### Naming Conventions

Use consistent naming between Faceplate and C++:

| Faceplate Parameter ID | C++ APVTS ID | Description |
|--------------------|--------------|-------------|
| `gain` | `"gain"` | Main gain |
| `masterVolume` | `"masterVolume"` | Use camelCase |
| `hpfCutoff` | `"hpfCutoff"` | Abbreviations OK |
| `band1Freq` | `"band1Freq"` | Numbered parameters |

**Rules:**
- Use camelCase for multi-word IDs
- Keep IDs short but descriptive
- Be consistent across your plugin
- Avoid special characters

### Default Values

Set meaningful defaults:

| Control Type | Typical Default | Reason |
|--------------|-----------------|--------|
| Volume/Gain | 0.5-0.75 | Unity or slight boost |
| Pan | 0.5 | Center |
| EQ Gain | 0.5 | Flat (0 dB) |
| Filter Cutoff | 0.5-1.0 | Open |
| Attack | 0.1-0.2 | Fast but not instant |
| Release | 0.3-0.5 | Natural decay |
| Mix/Blend | 1.0 | Full effect |

### Value Ranges and Curves

Consider perceptual scaling:

```cpp
// Linear (good for pan, mix)
param->setValueNotifyingHost(rawValue);

// Logarithmic (good for frequency, time)
// Map 0-1 to 20Hz-20kHz
float freq = 20.0f * std::pow(1000.0f, normalizedValue);

// Exponential (good for gain)
// Map 0-1 to -60dB to +6dB
float db = -60.0f + normalizedValue * 66.0f;
```

### Automation Support

Always use gesture callbacks for proper automation:

```javascript
// Good - automation works correctly
knob.addEventListener('mousedown', () => {
  bridge.beginGesture(paramId).catch(() => {});
});
knob.addEventListener('mouseup', () => {
  bridge.endGesture(paramId).catch(() => {});
});

// Bad - automation recording may fail
knob.addEventListener('change', () => {
  bridge.setParameter(paramId, value).catch(() => {});
});
```

---

## Performance

### Minimize DOM Updates

Batch visual updates when possible:

```javascript
// Good - single update
function updateMultipleKnobs(values) {
  requestAnimationFrame(() => {
    for (const [id, value] of Object.entries(values)) {
      updateKnobVisual(id, value);
    }
  });
}

// Bad - multiple reflows
function updateMultipleKnobs(values) {
  for (const [id, value] of Object.entries(values)) {
    updateKnobVisual(id, value);  // Each call causes reflow
  }
}
```

### Use requestAnimationFrame

For animations and frequent updates:

```javascript
let animationId = null;

function startMeterAnimation() {
  function update() {
    updateMeterLevel('output-meter', getCurrentLevel());
    animationId = requestAnimationFrame(update);
  }
  animationId = requestAnimationFrame(update);
}

function stopMeterAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}
```

### Optimize SVG Complexity

Keep SVG elements simple:

- **Fewer paths:** Combine paths where possible
- **Simple gradients:** Avoid complex gradient meshes
- **No filters:** Blur/shadow filters are expensive
- **Minimize nodes:** Simplify complex shapes in your design tool

### Lazy Loading

For large UIs with many elements:

```javascript
// Initialize visible elements immediately
initializeVisibleElements();

// Defer off-screen elements
setTimeout(() => {
  initializeHiddenPanels();
}, 100);
```

---

## Testing

### Browser Preview

Always test in browser before JUCE integration:

1. Export as **HTML Preview**
2. Open `index.html` in a browser
3. Test all interactions
4. Check console for errors (F12)
5. Verify visual appearance

### JUCE Testing

After integration:

1. **Standalone:** Test in standalone plugin host
2. **DAW:** Test in your target DAWs
3. **Automation:** Record and playback automation
4. **Preset save/load:** Verify state persistence
5. **Resizing:** If supported, test window resizing

### Multi-Platform

Test on all target platforms:

| Platform | Considerations |
|----------|----------------|
| Windows | WebView2 runtime required |
| macOS | WKWebView built-in |
| Linux | Limited WebView support |

### Performance Testing

Monitor for issues:

- CPU usage during animation
- Memory usage over time
- Responsiveness during heavy DSP load
- Multiple instances

---

## Project Organization

### File Structure

Recommended project layout:

```
my-plugin/
├── Source/
│   ├── PluginProcessor.cpp
│   ├── PluginProcessor.h
│   ├── PluginEditor.cpp
│   ├── PluginEditor.h
│   └── ui/                    ← Faceplate export goes here
│       ├── index.html
│       ├── style.css
│       ├── components.js
│       └── bindings.js
├── Faceplate/                     ← Faceplate project files
│   ├── my-plugin.faceplate
│   └── assets/
│       ├── knob-style.svg
│       └── background.png
├── CMakeLists.txt
└── README.md
```

### Version Control

Commit both Faceplate project and exports:

```gitignore
# Don't ignore these - they're source files
# Source/ui/
# Faceplate/

# Do ignore
*.zip              # Export ZIPs (regeneratable)
node_modules/      # If using any build tools
```

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Faceplate project | kebab-case | `my-plugin.faceplate` |
| Element names | Title Case | "Gain Knob", "Master Volume" |
| Parameter IDs | camelCase | `gainKnob`, `masterVolume` |
| CSS classes | kebab-case | `.knob-element`, `.slider-track` |
| C++ variables | camelCase | `gainKnobRelay`, `masterVolumeAttachment` |

### Documentation

Document your UI decisions:

```markdown
## UI Design Decisions

### Color Scheme
- Background: #1a1a1a (dark gray)
- Accent: #00ff88 (mint green)
- Rationale: Matches brand colors, good contrast

### Layout
- 800x600 canvas
- 3 sections: Input (left), Processing (center), Output (right)
- 16px grid alignment

### Controls
- All knobs: 60px diameter, arc style
- All sliders: vertical, 120px height
- Labels below controls, 11px Inter
```

---

## Common Mistakes

### UI Design

| Mistake | Solution |
|---------|----------|
| Too many colors | Limit to 3-4 colors max |
| Inconsistent sizes | Use grid, standardize control sizes |
| Cramped layout | Add padding, group controls |
| Missing labels | Label every control |
| Over-decoration | Keep it simple, functional |

### Parameter Binding

| Mistake | Solution |
|---------|----------|
| ID mismatch | Copy-paste IDs between Faceplate and C++ |
| Missing gestures | Always call beginGesture/endGesture |
| Ignored errors | Use .catch() on all bridge calls |
| Wrong value range | Normalize to 0-1, scale in C++ |

### Performance

| Mistake | Solution |
|---------|----------|
| Frequent DOM updates | Batch updates, use requestAnimationFrame |
| Complex SVG filters | Remove blur/shadow filters |
| Memory leaks | Clean up event listeners |
| Blocking main thread | Use async operations |

### Integration

| Mistake | Solution |
|---------|----------|
| Missing binary data | Check CMakeLists.txt includes all files |
| Wrong MIME types | Match file extensions to types |
| Hardcoded paths | Use resource provider pattern |
| Missing WebView2 | Bundle or check for runtime |

---

## Checklist

Before shipping your plugin:

### Design
- [ ] All controls have visible labels
- [ ] Consistent color scheme
- [ ] Aligned to grid
- [ ] Touch targets >= 44x44px
- [ ] Dark theme looks good

### Functionality
- [ ] All controls respond to interaction
- [ ] Double-click resets to default
- [ ] Shift+drag for fine control
- [ ] Automation records/plays back
- [ ] Presets save/load correctly

### Performance
- [ ] CPU usage acceptable
- [ ] No memory leaks
- [ ] Smooth animation
- [ ] Responsive under load

### Compatibility
- [ ] Works in target DAWs
- [ ] Works on Windows
- [ ] Works on macOS
- [ ] Multiple instances work

---

## Related Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - JUCE integration
- [JUCE_PATTERN.md](./JUCE_PATTERN.md) - Communication pattern
- [EXPORT_FORMAT.md](./EXPORT_FORMAT.md) - Export details
- [ELEMENT_REFERENCE.md](./ELEMENT_REFERENCE.md) - All elements

---

*Last updated: 28 January 2026*
