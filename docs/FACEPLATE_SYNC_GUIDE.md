# Faceplate Documentation Sync Guide

This guide explains how to sync the latest Faceplate documentation from GitHub into this project.

---

## Quick Command

To sync documentation, tell Claude Code:

```
Read docs/FACEPLATE_SYNC_GUIDE.md and follow the sync instructions
```

---

## What This Does

Fetches the latest Faceplate (VST3 UI Designer) documentation from GitHub and creates a condensed reference for this project.

**Source:** https://github.com/allthecodeDev/vst3-webview-ui-designer  
**Creates:** `docs/FACEPLATE_REFERENCE.md`

---

## Sync Instructions

When asked to sync Faceplate documentation, follow these steps:

### Step 1: Fetch Documentation from GitHub

Use the `web_fetch` tool to get each documentation file:

```
https://raw.githubusercontent.com/allthecodeDev/vst3-webview-ui-designer/main/docs/INTEGRATION_GUIDE.md
https://raw.githubusercontent.com/allthecodeDev/vst3-webview-ui-designer/main/docs/JUCE_PATTERN.md
https://raw.githubusercontent.com/allthecodeDev/vst3-webview-ui-designer/main/docs/EXPORT_FORMAT.md
https://raw.githubusercontent.com/allthecodeDev/vst3-webview-ui-designer/main/docs/ELEMENT_REFERENCE.md
https://raw.githubusercontent.com/allthecodeDev/vst3-webview-ui-designer/main/docs/BEST_PRACTICES.md
```

### Step 2: Create Condensed Reference

Create `docs/FACEPLATE_REFERENCE.md` with the following structure:

```markdown
# Faceplate UI Designer Reference

**Synced:** [current date]  
**Source:** github.com/allthecodeDev/vst3-webview-ui-designer

## Quick Facts

**What Faceplate does:**
- Visual design tool for VST3 WebView2 UIs
- Generates production-ready HTML/CSS/JS
- Drag-and-drop interface builder

**Current capabilities:**
[Extract from ELEMENT_REFERENCE.md - count ✅ vs 🔜 vs ⬜ markers]

**Available elements:**
[List all elements marked with ✅ in ELEMENT_REFERENCE.md]

## Integration Pattern

[Extract key sections from JUCE_PATTERN.md - the working pattern with dynamic function wrappers]

## Quick Integration Steps

1. Design UI in Faceplate
2. Export project → Get ZIP
3. Extract to your project's UI folder:
   - JUCE projects: typically `ui/` folder
   - iPlug2 projects: typically `WebUI/` folder
4. Update CMakeLists.txt (JUCE) or resources (iPlug2)
5. Rebuild

## Export Format

[Extract key sections from EXPORT_FORMAT.md]

**Files you get:**
- index.html - UI structure
- style.css - Styling
- components.js - SVG rendering
- bindings.js - JUCE bridge

## This Project's UI

**Current state:**
[Auto-detect based on existing folders]

If `ui/` folder exists:
- UI files location: `ui/` folder
- Project pattern: JUCE-style

If `WebUI/` folder exists:
- UI files location: `WebUI/` folder  
- Project pattern: iPlug2-style

If no UI folder yet:
- Faceplate UI not yet integrated
- Recommended location based on project structure

## Element Reference (Condensed)

[From ELEMENT_REFERENCE.md - list available elements with:
- Element name
- Key properties
- Parameter binding method
- Example usage]

## Best Practices

[Extract key sections from BEST_PRACTICES.md:
- UI design guidelines
- Parameter binding conventions
- Performance tips
- Testing approaches]

## Full Documentation

For complete documentation, visit:
https://github.com/allthecodeDev/vst3-webview-ui-designer/tree/main/docs
```

### Step 3: Save Version Info

Create `docs/FACEPLATE_VERSION.txt`:

```
Version: [extract from docs if available]
Synced: [current date and time]
Source: https://github.com/allthecodeDev/vst3-webview-ui-designer
Branch: main
```

### Step 4: Report Results

After syncing, report:

```
✅ Synced Faceplate Documentation

Fetched from GitHub:
- INTEGRATION_GUIDE.md
- JUCE_PATTERN.md
- EXPORT_FORMAT.md
- ELEMENT_REFERENCE.md
- BEST_PRACTICES.md

Created/Updated:
- docs/FACEPLATE_REFERENCE.md (condensed reference)
- docs/FACEPLATE_VERSION.txt (version tracking)

Current Faceplate Status:
- Version: [from docs]
- Available elements: [count of ✅ markers]

[If new elements since last sync, list them]
```

---

## Project Detection Logic

Use this to detect project type and customize the reference:

```
Check for UI folder patterns:

- If `ui/` folder exists:
  → JUCE project pattern
  → UI location: ui/
  
- If `WebUI/` folder exists:
  → iPlug2 project pattern
  → UI location: WebUI/
  
- If `src/PluginProcessor.cpp` exists:
  → JUCE project (no UI yet)
  → Recommend: ui/ folder
  
- If `source/` folder exists:
  → iPlug2 project (no UI yet)
  → Recommend: WebUI/ folder
  
- Otherwise:
  → Generic VST3 project
  → Check project structure for guidance
```

---

## Error Handling

### If GitHub Fetch Fails

Report:
```
❌ Failed to fetch Faceplate documentation from GitHub

Error: [specific error message]

Possible solutions:
1. Check internet connection
2. Verify repository URL is correct
3. Check if repository is public
4. Try again in a moment
```

### If docs/ Folder Doesn't Exist

Create it first:
```bash
mkdir docs
```

Then proceed with sync.

---

## Manual Sync

If automatic sync fails, you can manually:

1. Visit: https://github.com/allthecodeDev/vst3-webview-ui-designer/tree/main/docs
2. Read the documentation files
3. Create a condensed reference in `docs/FACEPLATE_REFERENCE.md`
4. Include the key information needed for integration

---

## When to Sync

Sync documentation when:
- Starting a new VST project using Faceplate
- Faceplate releases a new version
- New elements or features are added to Faceplate
- You need the latest integration instructions
- Every few weeks to stay current

---

**Last Updated:** January 2026  
**For:** VST3 projects using Faceplate UI Designer  
**Source:** https://github.com/allthecodeDev/vst3-webview-ui-designer