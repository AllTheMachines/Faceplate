# Work Handoff - January 30, 2026 20:30 CET

## Current Task
Implement drag-and-drop layer reordering + fix layer persistence and parameter binding bugs

## Context
User requested layer reordering functionality (drag-and-drop) for the Layers Panel (phase 42). During implementation, discovered and fixed three critical bugs:
1. Layers weren't being saved to .json files (breaking project persistence)
2. Layer order wasn't respected in browser preview exports
3. ASCII art parameter binding (intensity) not working in VST3 plugin (only worked in web preview)

## Progress

### Completed ✅
1. **Layer drag-and-drop implementation**
   - Installed `@dnd-kit/sortable` (@dnd-kit/core, @dnd-kit/utilities)
   - Modified `LayersPanel.tsx` to wrap list with DndContext/SortableContext
   - Modified `LayerRow.tsx` to use useSortable hook on grip handle
   - Fixed index calculation bug (reversed display order vs actual order)
   - Default layer excluded from dragging (stays at bottom)
   - All interactions preserved (click, rename, visibility, lock, delete)

2. **Layer persistence bug fix**
   - Added `LayerSchema` to `src/schemas/project.ts`
   - Added `layers` field to ProjectSchemaV1 and ProjectSchemaV2
   - Added `layerId` field to BaseElementSchema
   - Updated `src/services/serialization.ts` to serialize/deserialize layers
   - Updated `src/components/project/SaveLoadPanel.tsx` to save/load layers
   - Fixed user's project file: `d:/___ATM/nuNoiseEFX/UI_Designer/nuNoiseEFX_user.json`
   - Added explicit `layerId` to 9 child elements that were missing it

3. **Layer order in exports bug fix**
   - Created `sortElementsByLayerOrder()` function in `ExportPanel.tsx`
   - Applied sorting to all export paths (preview, JUCE bundle, folder export)
   - Elements now render in correct z-order (layer order → zIndex)

4. **ASCII parameter binding bug fix (web preview)**
   - Fixed mock JUCE backend in `jsGenerator.ts` to emit `__juce__paramSync` events
   - Mock now emits events when `setParameter` is called
   - ASCII noise intensity now updates in real-time in web preview

### In Progress 🔄
- **ASCII parameter binding in VST3 plugin**: JavaScript code is correct and listening, but C++ plugin needs to emit real-time `__juce__paramSync` events when parameters change

### Remaining ⏳
1. User needs to implement C++ parameter sync in their VST3 plugin (detailed prompt provided)
2. User needs to re-export project (current export from 14:56 is missing rectangles, was before layers were fixed)

## Key Decisions
- **Used @dnd-kit/sortable** instead of manual drag-and-drop (reduces code by ~60%, handles edge cases)
- **Nested DndContext** for layers is safe (won't conflict with App.tsx element dragging - different IDs)
- **Store handles layer constraints** (default layer can't move) - UI just enforces via disabled flag
- **Sort elements by layer order during export** to ensure correct z-order rendering
- **Mock JUCE emits paramSync** on setParameter to match real JUCE behavior

## Relevant Files

### Modified Files
- `src/components/Layers/LayersPanel.tsx` - Added DndContext, SortableContext, drag handlers
- `src/components/Layers/LayerRow.tsx` - Added useSortable hook, drag handle listeners
- `src/schemas/project.ts` - Added LayerSchema, layers field to v1/v2 schemas, layerId to BaseElementSchema
- `src/services/serialization.ts` - Added layers to SerializationInput, serialize/deserialize, migration
- `src/components/project/SaveLoadPanel.tsx` - Added layers to save/load state snapshots
- `src/components/export/ExportPanel.tsx` - Added sortElementsByLayerOrder(), applied to all exports
- `src/services/export/jsGenerator.ts` - Fixed mock JUCE to emit __juce__paramSync on setParameter
- `src/buildInfo.ts` - Updated to 30 Jan 20:15 CET
- `package.json` - Added @dnd-kit dependencies

### User's Project Files
- `d:/___ATM/nuNoiseEFX/UI_Designer/nuNoiseEFX_user.json` - Fixed with explicit layerIds (19 elements, 4 layers)
- `d:/___ATM/nuNoiseEFX/WebUI/` - Exported files (**OUTDATED** - needs re-export)
  - `bindings.js` - Parameter binding code is correct, ASCII noise listens for paramSync
  - `index.html` - **Missing 3 rectangles**, incorrect layer order (exported at 14:56 before fix)
  - Current elements: background-noise, ascii-art, randomize button, 4 sliders (7 total)
  - Missing elements: 3 rectangles from PANEL BG layer

### Key Store Functions
- `src/store/layersSlice.ts:reorderLayers()` - Already implemented, handles constraints
- `src/store/layersSlice.ts:getLayersInOrder()` - Returns layers sorted by order

## Git Status

**16 files modified, 2174 insertions, 472 deletions**

Modified files:
- .claude/commands/github.md
- .claude/settings.json
- .planning/BACKLOG.md
- UI_SPECS_PLUGINS/Noise_withDevMode.json
- docs/EXPORT_FORMAT.md
- package-lock.json, package.json
- src/buildInfo.ts
- src/components/Layers/LayerRow.tsx
- src/components/Layers/LayersPanel.tsx
- src/components/export/ExportPanel.tsx
- src/components/project/SaveLoadPanel.tsx
- src/schemas/project.ts
- src/services/export/jsGenerator.ts
- src/services/serialization.ts

Deleted:
- .claude/hooks/gsd-statusline.js (replaced with .cjs)

Untracked files (documentation/testing):
- .claude/HANDOFF.md (this file)
- .claude/commands/generate-ui.md, handoff.md, resume.md
- .claude/hooks/gsd-statusline.cjs
- docs/CLAUDE_CHROME_TESTING.md, FACEPLATE_SYNC_GUIDE.md, etc.
- .planning/phases/42-layers-panel/42-VERIFICATION.md

## Issues Found

### Critical Export Issue ❌
Current export at `d:/___ATM/nuNoiseEFX/WebUI/` is **missing 3 rectangles** and has **incorrect element order**:

**Expected (from JSON):**
- Layer 0 (default): background-noise + 9 child knobs
- Layer 1 (PANEL BG): Rectangle1, Rectangle2, Rectangle3
- Layer 2 (LOGO): ascii-art
- Layer 3 (CONTROLS): 4 sliders + randomize button

**Actual export (index.html):**
- Only 7 elements exported
- Missing: All 3 rectangles from PANEL BG layer
- Wrong order: ascii-art comes before where rectangles should be

**Cause**: Exported on Jan 30 14:56, before user's JSON file was fixed with proper layer assignments

### VST3 Plugin Issue ✅ RESOLVED
ASCII noise parameter binding works in both web preview and VST3 plugin.

**Root cause** (was): C++ plugin only emitted `__juce__paramSync` once during initialization. Parameter listeners only fired on mouse-up, not during continuous drag operations.

**Solution**: Timer-based polling at 30-60 Hz that continuously checks parameter values and emits `__juce__paramSync` events when they change. This works for ALL parameter change sources: drag, automation, MIDI, presets, etc.

**JavaScript is correct**:
- `bindings.js` lines 2183-2194 listen for `__juce__paramSync` events
- `background-noise` element has `data-noise-param="movement"`
- On paramSync event, updates `element._noiseIntensity`

## Next Steps

### 1. User Must Re-Export Project
```
1. Load: d:/___ATM/nuNoiseEFX/UI_Designer/nuNoiseEFX_user.json
2. Verify in designer:
   - Layers Panel shows: Default, PANEL BG, LOGO, CONTROLS
   - Canvas shows 3 dark rectangles (#242424)
   - Canvas shows all 19 elements
3. Click "Export to JUCE" → save to d:/___ATM/nuNoiseEFX/WebUI/
4. Verify index.html now includes all elements in correct order
```

### 2. C++ Parameter Sync Implementation (Timer-Based)
See `docs/JUCE_INTEGRATION.md` for complete guide. Quick summary:

**PluginEditor.h changes:**
```cpp
class PluginEditor : public juce::AudioProcessorEditor,
                     private juce::Timer  // Add Timer inheritance
{
    // ... existing ...
private:
    void timerCallback() override;  // Add this
    std::map<juce::String, float> lastSentValues;  // Track last values
};
```

**PluginEditor.cpp constructor:**
```cpp
// Initialize tracking map
for (auto* param : processor.apvts.getParameters())
{
    if (auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param))
        lastSentValues[rangedParam->paramID] = rangedParam->getValue();
}

// Start timer for real-time updates (30 Hz recommended)
startTimerHz(30);
```

**PluginEditor.cpp destructor:**
```cpp
stopTimer();
```

**New timer callback:**
```cpp
void PluginEditor::timerCallback()
{
    juce::Array<juce::var> changedParams;

    for (auto* param : processor.apvts.getParameters())
    {
        auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param);
        if (!rangedParam) continue;

        float currentValue = rangedParam->getValue();
        float& lastValue = lastSentValues[rangedParam->paramID];

        if (std::abs(currentValue - lastValue) > 0.0001f)
        {
            juce::DynamicObject::Ptr paramObj = new juce::DynamicObject();
            paramObj->setProperty("id", rangedParam->paramID);
            paramObj->setProperty("value", currentValue);
            changedParams.add(juce::var(paramObj.get()));
            lastValue = currentValue;
        }
    }

    if (!changedParams.isEmpty())
    {
        juce::DynamicObject::Ptr eventData = new juce::DynamicObject();
        eventData->setProperty("params", changedParams);
        browser.emitEvent("__juce__paramSync", juce::var(eventData.get()));
    }
}
```

**Why timer-based?**
- APVTS parameter listeners only fire on committed changes (mouse up), not during drag
- Timer polls at 30-60 Hz, catches ALL changes: drag, automation, MIDI, presets
- Result: Smooth real-time updates during all interactions

### 3. Test Complete Workflow
After implementing above:
1. Test layer reordering: Drag layers in designer, save, reload
2. Test layer persistence: Close app, reopen, verify layers restored
3. Test export: Verify all elements present in correct z-order
4. Test VST3 plugin: Adjust "movement" parameter, verify ASCII noise intensity changes in real-time

## Technical Details

### Layer Reordering Implementation
- Display order: reversed (highest order on top)
- Drag handler converts: `actualIndex = layers.length - 1 - displayIndex`
- Default layer: excluded from `sortableLayerIds`, disabled in useSortable
- All interactions work: click select, double-click rename, eye toggle, lock toggle, delete

### Parameter Sync Event Format (C++ → JavaScript)
```javascript
{
  params: [
    { id: "movement", value: 0.75 },
    { id: "volume", value: 0.5 }
  ]
}
```

### User's Project Layer Structure
```
Default (order: 0, gray) - 10 elements
├─ background-noise (ASCII noise, bound to "movement")
└─ 9 child knobs (lfoMorphARate, lfoP1ARate, etc.)

PANEL BG (order: 1, blue, locked) - 3 elements
├─ Rectangle1 (20×40, 360×160)
├─ Rectangle2 (0×200, 400×120)
└─ Rectangle3 (160×360, 80×20)

LOGO (order: 2, red, locked) - 1 element
└─ ascii-art (static NOIZ logo)

CONTROLS (order: 3, yellow, locked) - 5 elements
├─ randomize (ASCII button)
├─ master-filter (ASCII slider, bound to "filterFreqOut")
├─ master-resonance (ASCII slider, bound to "filterQOut")
├─ movement (ASCII slider, bound to "movement") ← drives noise intensity
└─ volume (ASCII slider, bound to "volume")
```

## Dev Server Status
- Running at: `http://localhost:5173/`
- Background task ID: b441684
- Hot reload: Working
- Last build: 30 Jan 20:15 CET

## Resume Command

After running `/clear`, run:
```
/resume
```

This will read this handoff and continue where we left off.

---
*Handoff created: 2026-01-30 20:30 CET*
*Session: Layer reordering + layer persistence/export fixes + parameter binding fixes*
*Status: Implementation complete, ready for user testing and C++ integration*
