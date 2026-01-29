# VST3 Development Workflow

Complete guide for creating VST3 plugins with visual UI design.

## Prerequisites

1. **VST3 Template Repository**
   - Clone [EFXvst](https://github.com/yourusername/EFXvst) for effects
   - OR [INSTvst](https://github.com/yourusername/INSTvst) for instruments

2. **JUCE Framework**
   - Install JUCE 7.x or later
   - Ensure WebView2 is enabled

3. **UI Designer**
   - Clone this repo: `git clone https://github.com/yourusername/vst3-webview-ui-designer`
   - Run: `npm install && npm run dev`

## Step-by-Step Workflow

### 1. Clone VST3 Template
```bash
# For an effect plugin:
git clone https://github.com/yourusername/EFXvst MyAwesomeEffect
cd MyAwesomeEffect

# For an instrument:
git clone https://github.com/yourusername/INSTvst MyAwesomeSynth
cd MyAwesomeSynth
```

### 2. Open UI Designer
```bash
cd /path/to/vst3-webview-ui-designer
npm run dev
```

Navigate to `http://localhost:5173`

### 3. Create New Project from Template

1. Click **"New Project"**
2. Select **"Effect Starter"** or **"Instrument Starter"**
3. Click **"Create from Template"**

You'll see pre-configured controls matching the VST3 template.

### 4. Design Your Interface

**Customize Elements:**
- Drag to move
- Resize with handles
- Edit properties in right panel
- Change colors, fonts, labels

**Add/Remove Elements:**
- Drag from palette to add
- Select + Delete to remove
- Copy/paste to duplicate (Ctrl+C/V)

**Organize with Layers:**
- Click the **Layers** tab in left panel
- Create layers for logical groupings (e.g., "Controls", "Meters", "Labels")
- Drag layers to control z-order (top layer = front)
- Toggle visibility (eye icon) to focus on specific sections
- Lock layers to prevent accidental changes
- Right-click elements to "Move to Layer"

**Get Help:**
- Click (?) buttons on any property section for documentation
- Press **F1** for help on the currently selected element
- Help windows show examples and step-by-step instructions

**Name Your Parameters:**
- Each interactive element needs a `parameterId`
- Must match parameter IDs in VST3 C++
- Example: `"gain"` → `createParameter("gain", ...)` in VST3

### 5. Export UI Code

1. Click **"Export"**
2. Choose **"JUCE Bundle"**
3. Download the ZIP file

### 6. Extract to VST3 Project
```bash
cd /path/to/MyAwesomeEffect
# Extract to WebUI/ for EFXvst, or ui/ for INSTvst
unzip ~/Downloads/webview-ui-juce.zip -d WebUI/
```

This replaces:
- `index.html`
- `style.css`
- `components.js`
- `bindings.js`

Plus adds:
- `bindings.cpp` (code snippets)

### 7. Integrate C++ Bindings

The exported `bindings.cpp` contains code snippets.

**Copy to your .h file:**
```cpp
// From bindings.cpp "Header Declarations" section:
std::unique_ptr<WebSliderRelay> gainRelay;
WebSliderParameterAttachment gainAttachment;
// etc.
```

**Copy to your constructor:**
```cpp
// From bindings.cpp "Constructor Initialization" section:
MyAudioProcessorEditor::MyAudioProcessorEditor(MyAudioProcessor& p)
    : AudioProcessorEditor(&p), audioProcessor(p)
{
    // ... existing WebView setup
    
    // Add these:
    gainRelay = std::make_unique<WebSliderRelay>(*webView, "gain");
    gainAttachment = std::make_unique<WebSliderParameterAttachment>(
        *processorRef.parameters.getParameter("gain"),
        *gainRelay,
        nullptr
    );
}
```

### 8. Build in JUCE

1. Open `.jucer` file in Projucer (if using Projucer)
2. Click **"Save Project"**
3. Open in your IDE (Xcode/Visual Studio/CLion)
4. Build the VST3

### 9. Test Your Plugin

1. Load VST3 in your DAW
2. UI should appear with your custom design
3. Controls should respond
4. Parameter changes should affect audio

## Iterating on Design

1. Open designer
2. Click **"Load Project"**
3. Load your saved `.json` file
4. Make changes
5. Export again
6. Replace files in VST3 project
7. Rebuild

## Tips

- **Save often:** Click "Save" to download `.json` file
- **Use templates:** Start from template, customize incrementally
- **Match parameter IDs:** Keep a list of your VST3 parameter IDs
- **Test in browser first:** Open `index.html` locally to debug UI issues
- **Organize with layers:** Group related controls (EQ, Dynamics, Output) into layers
- **Use layer visibility:** Hide completed sections to focus on current work
- **Lock finished layers:** Prevent accidental changes to finalized sections
- **Press F1 for help:** Quick access to documentation for any element type

## Troubleshooting

### UI doesn't load
- Check path to `index.html` is correct
- Verify WebUI/ui folder exists
- Check browser console for JavaScript errors

### Controls don't work
- Ensure parameter IDs match in HTML and C++
- Check relay initialization in constructor
- Verify WebSliderRelay is created for each control

### UI looks different
- Designer uses SVG rendering
- Your old custom knobs may look different
- This is expected - standardize on designer's SVG system