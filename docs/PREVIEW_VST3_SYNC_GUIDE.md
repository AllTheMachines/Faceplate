# Browser Preview vs VST3 View Sync Guide

This guide explains the differences between browser preview and VST3 view, why they occur, and how to troubleshoot mismatches.

## Overview

Faceplate generates UI code through two paths:
1. **Browser Preview** - Quick testing in a new browser tab (blob URL)
2. **VST3 Export** - Production files integrated with JUCE

Both use the same core generators, but the preview path applies transformations for standalone viewing.

## Expected Differences

These differences are **by design** and should not be considered bugs:

| Aspect | Browser Preview | VST3 Export |
|--------|----------------|-------------|
| **Fonts** | Google Fonts CDN | Base64 embedded |
| **JUCE Bridge** | Mock (fake data) | Real C++ communication |
| **File Structure** | Single blob URL | Separate HTML/CSS/JS files |
| **Offline Support** | No (requires internet) | Yes |
| **Parameter Values** | Static mock data | Live plugin parameters |

## Common Issues and Solutions

### 1. Font Rendering Differences

**Symptom:** Text appears differently in preview vs VST3

**Cause:** Preview loads fonts from Google Fonts CDN, while VST3 embeds them as base64.

**Solutions:**
- Use standard web fonts (Inter, Roboto, Roboto Mono) for consistent rendering
- Custom fonts may not render in preview but will work in VST3 export
- Test final appearance in actual VST3 build

**Technical Detail:** Preview strips `@font-face` rules because relative paths break in blob URLs. It substitutes Google Fonts links instead.

### 2. Parameter Updates Not Working

**Symptom:** Sliders/knobs don't respond in preview but do in VST3 (or vice versa)

**Cause:** Preview uses a mock JUCE backend that always succeeds.

**Solutions:**
- Preview is for visual testing only, not interaction testing
- Always test actual parameter communication in VST3 build
- Check browser console for JUCE bridge errors in VST3

### 3. Sizing/Scaling Differences

**Symptom:** UI appears different size in preview vs VST3

**Cause:** Responsive scaling settings may differ.

**Solutions:**
- Ensure "Enable responsive scaling" is checked during export
- Both preview and export should use the same scaling setting
- Test at multiple window sizes

### 4. Custom Scrollbars

**Symptom:** Scrollbars look different

**Cause:** Both use custom JS-based scrollbars, but native fallback may differ by browser/WebView2.

**Solution:** This is mostly consistent now. If issues persist, check that scrollable containers have proper overflow settings.

## Testing Checklist

Before releasing your VST3 UI, verify:

- [ ] **Fonts** - All text renders correctly (font face, weight, size)
- [ ] **Colors** - Background, element colors, gradients match
- [ ] **Positioning** - Elements at correct positions (especially in containers)
- [ ] **Sizing** - Elements have correct dimensions
- [ ] **Responsive** - UI scales properly when window resizes
- [ ] **Interactions** - Knobs, sliders, buttons respond to input
- [ ] **Parameters** - Values sync bidirectionally with plugin
- [ ] **Multi-window** - All windows export and display correctly

## Troubleshooting Workflow

1. **Preview looks wrong?**
   - Check if using custom fonts (preview has limited font support)
   - Ensure assets are loaded (images, SVGs)
   - Try refreshing - fonts may not have loaded yet

2. **VST3 looks wrong but preview looks correct?**
   - Check browser console for errors
   - Verify JUCE bridge is initializing (look for `__JUCE__` object)
   - Ensure fonts are properly embedded in CSS

3. **Both look wrong?**
   - Issue is in the core generators, not the export path
   - Check element properties in Faceplate designer
   - File a bug report with screenshots of both views

## Code Generation Architecture

```
                    ┌─────────────────┐
                    │  Core Generators │
                    │   (shared code)  │
                    └────────┬────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
    ┌──────▼──────┐                    ┌───────▼───────┐
    │   Preview    │                    │  VST3 Export  │
    │ Transforms   │                    │   (direct)    │
    │ - Font swap  │                    │               │
    │ - Inline all │                    │               │
    │ - Mock JUCE  │                    │               │
    └──────┬──────┘                    └───────┬───────┘
           │                                   │
    ┌──────▼──────┐                    ┌───────▼───────┐
    │  Blob URL   │                    │ Separate Files │
    │ (browser)   │                    │ (JUCE binary)  │
    └─────────────┘                    └───────────────┘
```

## Supported Fonts in Preview

Preview can render these fonts from Google Fonts CDN:
- Inter (all weights)
- Roboto (all weights)
- Roboto Mono (all weights)

Custom fonts added via "Manage Fonts" will:
- **Work in VST3 export** - embedded as base64
- **NOT work in preview** - preview cannot load custom font files

## Known Limitations

1. **Preview is not production-ready** - It's for visual testing only
2. **Custom fonts in preview** - Not supported due to blob URL limitations
3. **Mock JUCE backend** - Does not reflect real plugin behavior
4. **Network dependency** - Preview requires internet for Google Fonts

## When to Report a Bug

Report an issue if:
- Element positioning differs (not just fonts)
- Element dimensions differ
- Colors differ (not just anti-aliasing)
- CSS properties missing in export
- JavaScript functionality differs (beyond JUCE bridge)

**Don't report:**
- Font rendering differences (expected)
- JUCE parameter issues (preview uses mock)
- Network-related preview failures
