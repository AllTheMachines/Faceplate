# FACEPLATE: VST3 WebView UI Designer

**Complete Documentation - Description, Technical Specification, and User Manual**

Version 1.9 | January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Description](#description)
3. [Technical Specification](#technical-specification)
4. [User Manual](#user-manual)
5. [Integration Guide](#integration-guide)
6. [Troubleshooting](#troubleshooting)
7. [Appendices](#appendices)

---

# OVERVIEW

## What is FACEPLATE?

FACEPLATE is a browser-based visual design tool for creating professional audio plugin user interfaces. It enables audio developers to design, preview, and export production-ready UI code for JUCE WebView2-based VST3 plugins without writing HTML, CSS, or JavaScript manually.

### Key Features

- **100+ UI Elements**: Knobs, sliders, buttons, meters, visualizations, curves, and specialized audio controls
- **Visual Design**: Drag-and-drop interface with real-time preview
- **Layer System**: Organize elements into named, color-coded layers with visibility and lock controls
- **Contextual Help**: F1 shortcut and inline (?) buttons provide instant documentation
- **Multi-Window Support**: Create complex UIs with main, settings, and developer windows
- **Asset Management**: Import SVG graphics and custom fonts with security sanitization
- **Export System**: Generate complete JUCE WebView2 bundles with HTML/CSS/JS/C++ integration code
- **Browser Preview**: Test UI behavior before integration
- **Project Persistence**: Save/load projects as JSON files

### Target Users

- Audio plugin developers using JUCE framework
- UI/UX designers creating audio plugin interfaces
- Music software companies building VST3 plugins
- Independent developers prototyping plugin concepts

---

# DESCRIPTION

## Problem Statement

Traditional audio plugin UI development requires:

1. **Manual coding**: Writing verbose C++ code for every UI element
2. **Compile-test cycles**: Rebuilding plugin to see UI changes
3. **Design-implementation gap**: Designers create mockups that developers must manually translate to code
4. **Limited tooling**: Few visual design tools exist for audio plugin UIs
5. **Platform inconsistencies**: Different rendering across Windows/macOS/Linux

## Solution

FACEPLATE bridges the design-implementation gap by providing a visual design environment where:

- **Designers see what they get**: WYSIWYG canvas matches final rendered output
- **Fast iteration**: Change properties, see results instantly without recompiling
- **Code generation**: Exports production-ready HTML/CSS/JS that works with JUCE WebView2
- **Parameter binding**: Visual mapping between UI controls and audio parameters
- **Professional quality**: Built-in best practices for audio plugin UI design

## Design Philosophy

### 1. Visual-First Development

No need to write code to create UI. All element positioning, styling, and behavior is configured visually through property panels.

### 2. Separation of Concerns

- **UI Design** (FACEPLATE): Layout, appearance, interaction patterns
- **Audio Processing** (C++ JUCE): DSP algorithms, parameter management
- **Communication** (WebView Bridge): Bidirectional parameter sync

### 3. Export-Driven Workflow

Design → Export → Integrate → Test → Iterate

Each export is a complete, self-contained bundle ready for integration.

### 4. Web Technology Stack

Leverages modern web standards (HTML5, CSS3, ES6+) for:
- Rich graphics rendering (SVG, Canvas)
- Smooth animations (requestAnimationFrame)
- Responsive scaling (CSS transforms)
- Cross-platform consistency (WebView2/WKWebView)

## Use Cases

### 1. New Plugin Development

Start with a template, customize to match your plugin's functionality, export, and integrate with C++ JUCE audio processing.

### 2. UI Redesign

Existing plugins can replace their native UI with a modern web-based interface designed in FACEPLATE.

### 3. Rapid Prototyping

Test UI concepts quickly in browser preview mode before committing to implementation.

### 4. Multi-Window Interfaces

Complex plugins (DAWs, synths) can use multiple windows for main UI, settings panels, and developer tools.

### 5. Cross-Platform Consistency

Design once, export once, render consistently across Windows (WebView2) and macOS (WKWebView).

---

# TECHNICAL SPECIFICATION

## Architecture Overview

### System Components

```
┌────────────────────────────────────────────────────────────────┐
│                      FACEPLATE DESIGNER                        │
│                     (React + TypeScript)                       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Canvas     │  │  Properties  │  │    Layers    │       │
│  │  (Konva.js)  │  │    Panel     │  │    Panel     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Palette    │  │    Export    │  │  Save/Load   │       │
│  │  (Elements)  │  │   Service    │  │  (JSON I/O)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │            State Management (Zustand)                │    │
│  │  - Elements Store - Layers Store - Canvas Store     │    │
│  │  - Assets Store - Fonts Store - Windows Store       │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Export
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      EXPORTED BUNDLE                           │
│                    (HTML/CSS/JS Files)                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ index.html  - UI structure with positioned elements  │    │
│  │ style.css   - Styling, fonts, responsive scaling     │    │
│  │ components.js - Visual update functions              │    │
│  │ bindings.js - JUCE bridge + interaction handlers     │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Integrate
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                     JUCE VST3 PLUGIN                           │
│                       (C++ Backend)                            │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │            WebBrowserComponent                       │    │
│  │  - Renders HTML/CSS/JS in WebView2/WKWebView       │    │
│  │  - Provides native functions for parameter control  │    │
│  │  - Emits events for parameter sync                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         AudioProcessorValueTreeState (APVTS)         │    │
│  │  - Manages audio parameters                          │    │
│  │  - Handles automation, presets, DAW communication    │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend (Designer)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3+ | UI framework |
| **TypeScript** | 5.6+ | Type-safe development |
| **Vite** | 6.0+ | Build tool and dev server |
| **Zustand** | 5.0+ | State management |
| **Zundo** | 2.3+ | Undo/redo system |
| **Konva.js** | 9.3+ | Canvas rendering engine |
| **React Konva** | 18.2+ | React bindings for Konva |
| **Tailwind CSS** | 3.4+ | Utility-first styling |
| **@dnd-kit** | 6.3+ | Drag-and-drop system |
| **JSZip** | 3.10+ | Export ZIP generation |
| **Zod** | 4.3+ | Schema validation |
| **DOMPurify** | 2.35+ | SVG sanitization |
| **SVGO** | 4.0+ | SVG optimization |
| **OpenType.js** | 1.3+ | Font file parsing |

#### Export Output

| Technology | Purpose |
|------------|---------|
| **HTML5** | UI structure |
| **CSS3** | Styling, animations, responsive scaling |
| **ES6+ JavaScript** | Interaction logic, JUCE bridge |
| **SVG** | Graphics rendering (knobs, curves, icons) |

#### Backend Integration (JUCE)

| Technology | Version | Purpose |
|------------|---------|---------|
| **JUCE** | 7.0+ | Audio plugin framework |
| **WebView2** | Latest | Windows web rendering (Chromium) |
| **WKWebView** | Built-in | macOS web rendering (WebKit) |
| **C++17** | Standard | Plugin backend language |

## Data Model

### Project Structure

```typescript
interface Project {
  version: number;              // Schema version (current: 2)
  canvas: {
    width: number;              // Canvas width in pixels
    height: number;             // Canvas height in pixels
    backgroundColor: string;    // Canvas background color
  };
  elements: Element[];          // All UI elements
  layers: Layer[];              // Layer definitions
  windows: Window[];            // Multi-window configurations
  assets: Asset[];              // SVG/image assets
  knobStyles: KnobStyle[];      // Custom knob designs
  fonts: Font[];                // Custom font metadata
}
```

### Element Model

```typescript
interface BaseElement {
  // Identity
  id: string;                   // UUID
  name: string;                 // Display name (becomes HTML ID)
  type: string;                 // Element type identifier

  // Layout
  x: number;                    // X position on canvas
  y: number;                    // Y position on canvas
  width: number;                // Width in pixels
  height: number;               // Height in pixels
  rotation: number;             // Rotation in degrees

  // Organization
  layerId: string;              // Layer assignment
  zIndex: number;               // Stacking order
  parentId?: string;            // Container parent (optional)

  // State
  visible: boolean;             // Visibility toggle
  locked: boolean;              // Edit lock

  // Parameter Binding
  parameterId?: string;         // JUCE parameter ID (optional)
  defaultValue?: number;        // Default normalized value 0-1

  // Type-specific properties
  [key: string]: any;           // Extended by specific element types
}
```

### Layer Model

```typescript
interface Layer {
  id: string;                   // UUID
  name: string;                 // Display name
  color: string;                // Color code for visual identification
  visible: boolean;             // Layer visibility
  locked: boolean;              // Layer lock
  order: number;                // Stacking order (higher = front)
}
```

### Element Types (109 Total)

**Controls (27):**
- Knobs: `knob`, `steppedknob`, `centerdetentknob`, `dotindicatorknob`
- Sliders: `slider`, `arcslider`, `bipolarslider`, `crossfadeslider`, `notchedslider`, `multislider`
- Buttons: `button`, `iconbutton`, `toggleswitch`, `powerbutton`, `kickbutton`, `rockerswitch`, `rotaryswitch`, `segmentbutton`
- Selection: `dropdown`, `multiselectdropdown`, `combobox`, `checkbox`, `radiogroup`, `textfield`

**Displays (49):**
- Basic: `label`, `dbdisplay`, `frequencydisplay`, `numericdisplay`, `timedisplay`, `percentagedisplay`, etc.
- Meters: `meter`, `gainreductionmeter`, `rmsmetermo`, `rmsmeterstereo`, `vumetermono`, `vumeterstereo`, professional broadcast meters (PPM Type I/II, True Peak, LUFS, K-System)
- LEDs: `singleled`, `bicolorled`, `tricolorled`, `ledarray`, `ledring`, `ledmatrix`

**Visualizations (5):**
- `scrollingwaveform`, `spectrumanalyzer`, `spectrogram`, `goniometer`, `vectorscope`

**Curves (5):**
- `eqcurve`, `compressorcurve`, `envelopedisplay`, `lfodisplay`, `filterresponse`

**Containers (8):**
- `panel`, `frame`, `groupbox`, `collapsible`, `tabcontainer`, etc.

**Decorative (4):**
- `rectangle`, `line`, `image`, `svggraphic`

**Specialized Audio (11):**
- `pianokeyboard`, `drumpad`, `padgrid`, `stepsequencer`, `xypad`, `wavetabledisplay`, `harmoniceditor`, etc.

## Export System

### File Generation

FACEPLATE generates a complete web bundle for each export:

```
export-bundle.zip
├── index.html              # Main UI structure
├── style.css               # All styling
├── components.js           # Visual update functions
├── bindings.js             # JUCE bridge + interactions
├── README.md               # Integration instructions
└── assets/                 # Optional: custom assets
    ├── image1.png
    └── custom-font.woff2
```

### Export Modes

#### 1. JUCE Bundle Export

Production-ready bundle for VST3 integration:

- **Fonts**: Base64-embedded in CSS for offline use
- **File structure**: Separate files (HTML, CSS, JS)
- **JUCE bridge**: Real WebView2/WKWebView integration
- **Multi-window**: Separate folders per window + window-mapping.json

#### 2. Browser Preview Export

Standalone HTML for testing in browser:

- **Fonts**: Google Fonts CDN (requires internet)
- **File structure**: Single HTML file via blob URL
- **JUCE bridge**: Mock implementation with console logging
- **Use case**: Rapid UI testing without C++ compilation

### Code Generation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  1. Element Serialization                                   │
│     - Traverse element tree                                 │
│     - Sort by layer order (z-index)                         │
│     - Convert to HTML with data-* attributes                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Style Generation                                        │
│     - Generate CSS rules per element type                   │
│     - Embed fonts as base64 (JUCE) or CDN links (preview) │
│     - Apply color schemes, typography                       │
│     - Responsive scaling transforms                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Component Script Generation                             │
│     - SVG arc math functions                                │
│     - Element update functions (knobs, sliders, meters)     │
│     - Canvas rendering utilities                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Bindings Script Generation                              │
│     - JUCE bridge initialization (dynamic function wrappers)│
│     - Interaction handlers per element type                 │
│     - Parameter sync event listeners                        │
│     - Responsive scaling system                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Documentation Generation                                │
│     - README with integration steps                         │
│     - Parameter ID reference table                          │
│     - C++ code snippets for PluginEditor                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Asset Bundling                                          │
│     - Copy SVG/image assets                                 │
│     - Embed or reference fonts                              │
│     - Generate window-mapping.json (multi-window)           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  7. ZIP Packaging                                           │
│     - Create ZIP archive with all files                     │
│     - Trigger browser download                              │
└─────────────────────────────────────────────────────────────┘
```

## Communication Pattern

### JUCE ↔ JavaScript Bridge

FACEPLATE uses a **dynamic function wrapper pattern** for reliable bidirectional communication:

```javascript
// JavaScript creates wrappers for registered C++ functions
function createJUCEFunctionWrappers() {
  const functions = window.__JUCE__.initialisationData.__juce__functions || [];
  const wrappers = {};
  const pendingResults = new Map();
  let nextResultId = 1; // Sequential integer IDs

  // Listen for completion events from C++
  window.__JUCE__.backend.addEventListener('__juce__complete', (event) => {
    const resultId = event?.resultId;
    const result = event?.result;
    const callback = pendingResults.get(resultId);
    if (callback) {
      pendingResults.delete(resultId);
      callback(result);
    }
  });

  // Create wrapper for each registered function
  for (const funcName of functions) {
    wrappers[funcName] = function(...args) {
      return new Promise((resolve) => {
        const resultId = nextResultId++;
        pendingResults.set(resultId, resolve);

        window.__JUCE__.backend.emitEvent('__juce__invoke', {
          name: funcName,
          params: args,
          resultId: resultId
        });

        // Timeout after 1 second to prevent memory leaks
        setTimeout(() => {
          if (pendingResults.has(resultId)) {
            pendingResults.delete(resultId);
            resolve(undefined);
          }
        }, 1000);
      });
    };
  }

  return wrappers;
}
```

### Standard Native Functions

FACEPLATE exports require these 4 native functions registered in C++:

| Function | Purpose | JS → C++ | C++ → JS |
|----------|---------|----------|----------|
| `setParameter(id, value)` | Set parameter | Parameter ID, normalized value (0-1) | void |
| `getParameter(id)` | Get current value | Parameter ID | Normalized value (0-1) |
| `beginGesture(id)` | Start automation gesture | Parameter ID | void |
| `endGesture(id)` | End automation gesture | Parameter ID | void |

### Parameter Sync Pattern

For real-time UI updates (meters, visualizations, parameter sync), FACEPLATE expects C++ to emit `__juce__paramSync` events:

```cpp
// C++ PluginEditor.cpp - Timer-based parameter sync (30-60 Hz)
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

```javascript
// JavaScript bindings.js - Listen for parameter sync events
window.__JUCE__.backend.addEventListener('__juce__paramSync', (event) => {
  const params = event?.params || [];

  for (const param of params) {
    const { id, value } = param;

    // Update knob visuals
    updateKnobVisual(id + '-knob', value);

    // Update meter levels
    updateMeterLevel(id + '-meter', value);

    // Update any other UI reflecting this parameter
  }
});
```

## File Formats

### Project File (.json)

```json
{
  "version": 2,
  "canvas": {
    "width": 800,
    "height": 600,
    "backgroundColor": "#1a1a1a"
  },
  "elements": [
    {
      "id": "uuid-1234",
      "name": "Gain Knob",
      "type": "knob",
      "x": 100,
      "y": 50,
      "width": 80,
      "height": 80,
      "rotation": 0,
      "layerId": "layer-uuid",
      "zIndex": 1,
      "visible": true,
      "locked": false,
      "parameterId": "gain",
      "defaultValue": 0.5,
      "diameter": 80,
      "startAngle": -135,
      "endAngle": 135,
      "trackColor": "#333333",
      "fillColor": "#00ff88",
      "indicatorColor": "#ffffff"
    }
  ],
  "layers": [
    {
      "id": "layer-uuid",
      "name": "Controls",
      "color": "#4488ff",
      "visible": true,
      "locked": false,
      "order": 1
    }
  ],
  "windows": [],
  "assets": [],
  "knobStyles": [],
  "fonts": []
}
```

### Validation

Projects are validated against Zod schemas before save/load:

```typescript
import { z } from 'zod';

const BaseElementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  layerId: z.string().default('default'),
  zIndex: z.number().default(0),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  parameterId: z.string().optional(),
  defaultValue: z.number().min(0).max(1).optional(),
});

const ProjectSchemaV2 = z.object({
  version: z.literal(2),
  canvas: CanvasSchema,
  elements: z.array(BaseElementSchema),
  layers: z.array(LayerSchema),
  windows: z.array(WindowSchema),
  assets: z.array(AssetSchema),
  knobStyles: z.array(KnobStyleSchema),
  fonts: z.array(FontSchema),
});
```

## Performance Characteristics

### Designer Performance

| Operation | Target | Measured |
|-----------|--------|----------|
| Element rendering (100 elements) | < 60 FPS | 60 FPS |
| Property panel update | < 16ms | ~5ms |
| Canvas zoom/pan | < 16ms | ~8ms |
| Export generation (medium project) | < 5s | 2-3s |
| Project save/load | < 2s | < 1s |

### Export Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Initial load time | < 500ms | Depends on element count |
| Interaction latency | < 16ms | 60 FPS target |
| Parameter sync latency | < 50ms | From C++ → UI update |
| Memory usage | < 50MB | For typical plugin UI |

### Optimization Techniques

**Designer:**
- Virtual rendering with Konva.js (only visible elements drawn)
- Debounced property updates (300ms)
- Lazy loading of heavy assets
- React.memo for component memoization

**Export:**
- requestAnimationFrame for smooth animations
- CSS transforms for performant scaling
- Batch DOM updates
- Event delegation for interaction handlers

---

# USER MANUAL

## Getting Started

### Installation

#### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Text editor (optional, for viewing exported code)

#### Setup

```bash
# Clone repository
git clone https://github.com/allthecodeDev/vst3-webview-ui-designer
cd vst3-webview-ui-designer

# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

### Interface Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  FACEPLATE - VST3 WebView UI Designer          [Build: Jan 30] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────┐  ┌──────────────┐ │
│  │          │  │                          │  │              │ │
│  │  LEFT    │  │        CANVAS            │  │   RIGHT      │ │
│  │  PANEL   │  │     (Main Workspace)     │  │   PANEL      │ │
│  │          │  │                          │  │              │ │
│  │ Elements │  │   [Your UI Design Here]  │  │ Properties   │ │
│  │ Palette  │  │                          │  │              │ │
│  │          │  │   - Drag elements        │  │ - Edit       │ │
│  │ Layers   │  │   - Position/resize      │  │   selected   │ │
│  │          │  │   - Select/edit          │  │   element    │ │
│  │ History  │  │                          │  │              │ │
│  │          │  │                          │  │ - (?) Help   │ │
│  └──────────┘  └──────────────────────────┘  └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
│  [Save] [Load] [Export ▼] [New Project] [Settings]            │
└─────────────────────────────────────────────────────────────────┘
```

### Panel Descriptions

#### Left Panel (3 Tabs)

**Elements Tab:**
- Categorized palette of 109 element types
- Drag elements onto canvas to add them
- Collapsible categories: Controls, Displays, Visualizations, Curves, Containers, etc.

**Layers Tab (v1.9):**
- Create, rename, delete layers
- Toggle visibility (eye icon)
- Toggle lock (lock icon)
- Drag layers to reorder (changes z-order)
- Color-coded for visual identification
- Default layer always exists at bottom

**History Tab:**
- View action history (undo/redo)
- Click to jump to any past state
- Shows timestamps and action descriptions

#### Canvas (Center)

- Main design workspace
- Grid overlay (toggle with Ctrl+G)
- Zoom controls (mouse wheel, toolbar)
- Pan with middle-mouse drag or spacebar+drag
- Selection handles for resize/rotate

#### Right Panel

**Properties Panel:**
- Context-sensitive to selected element
- Organized into sections (Position, Appearance, Behavior, etc.)
- (?) buttons for inline help
- Color pickers, dropdowns, numeric inputs
- Real-time preview of changes

## Creating Your First UI

### Step 1: Start a New Project

1. Click **"New Project"** in toolbar
2. Choose:
   - **Blank Canvas**: Empty 800×600 canvas
   - **Effect Starter**: Pre-configured effect template
   - **Instrument Starter**: Pre-configured synth template
3. Set canvas dimensions (e.g., 800×600)
4. Click **"Create"**

### Step 2: Add Elements

#### From Palette

1. Open **Elements** tab (left panel)
2. Expand category (e.g., "Controls")
3. Drag element (e.g., "Knob") onto canvas
4. Position where desired

#### Using Keyboard

1. Select element type from palette
2. Click on canvas to place

### Step 3: Configure Properties

1. Select element on canvas (click it)
2. Right panel shows properties
3. Edit values:
   - **Name**: "Gain Knob" (becomes `gain-knob` HTML ID)
   - **Parameter ID**: "gain" (must match C++ APVTS)
   - **Default Value**: 0.5 (normalized 0-1)
   - **Colors**: Track, fill, indicator colors
   - **Angles**: Start/end angles for arc

4. See changes immediately on canvas

### Step 4: Organize with Layers (v1.9)

1. Click **Layers** tab
2. Click **"+ New Layer"**
3. Name it (e.g., "Input Controls")
4. Assign color (e.g., blue)
5. Right-click element → **"Move to Layer"** → Select layer
6. Toggle visibility to hide/show entire layer
7. Drag layers to control z-order (top = front)

### Step 5: Add More Elements

Repeat steps 2-4 to build complete UI:
- **Sliders** for linear parameters
- **Buttons** for toggles/triggers
- **Labels** for text
- **Meters** for level displays
- **Rectangles** for backgrounds
- **SVG Graphics** for logos/decorations

### Step 6: Preview

1. Click **"Preview in Browser"** button
2. New tab opens with interactive UI
3. Test interactions:
   - Drag knobs
   - Click buttons
   - Open browser console (F12) to see mock JUCE calls

### Step 7: Save Project

1. Click **"Save"** button
2. Choose filename (e.g., `my-plugin.json`)
3. Browser downloads JSON file
4. Store in your version control

### Step 8: Export for JUCE

1. Click **"Export"** dropdown
2. Select **"JUCE Bundle"**
3. Browser downloads `webview-ui-juce.zip`
4. Extract to your JUCE project's `ui/` or `WebUI/` folder

### Step 9: Integrate with JUCE

See [Integration Guide](#integration-guide) section below.

## Element Reference (Quick Guide)

### Knobs

**Types:**
- `knob`: Standard rotary knob with arc display
- `steppedknob`: Discrete step positions
- `centerdetentknob`: Snaps to center (pan-style)
- `dotindicatorknob`: Minimal dot indicator

**Key Properties:**
- `diameter`: Size in pixels (e.g., 60, 80, 100)
- `startAngle`/`endAngle`: Arc range (e.g., -135 to 135)
- `trackColor`: Background arc color
- `fillColor`: Value arc color
- `indicatorColor`: Pointer line/dot color

**Parameter Binding:**
- Set `parameterId` to match C++ APVTS parameter
- Set `defaultValue` (0-1 normalized)

**Interaction:**
- Drag vertically to adjust
- Double-click to reset to default
- Shift+drag for fine control

### Sliders

**Types:**
- `slider`: Basic vertical/horizontal slider
- `arcslider`: Circular slider along arc path
- `bipolarslider`: Center-zero (pan/balance)
- `crossfadeslider`: A/B crossfader with labels
- `notchedslider`: Detent positions
- `multislider`: Multi-band (EQ-style)

**Key Properties:**
- `orientation`: "vertical" or "horizontal"
- `trackColor`: Track background
- `trackFillColor`: Fill color
- `thumbColor`: Thumb/handle color

**ASCII Sliders:**
- Special category with text-based rendering
- Click-to-jump behavior (click anywhere to set value)
- Retro terminal aesthetic

### Buttons

**Types:**
- `button`: Basic momentary/toggle
- `iconbutton`: With icon (built-in or custom SVG)
- `toggleswitch`: On/off switch with labels
- `powerbutton`: Power button with LED
- `kickbutton`: Drum trigger style
- `rockerswitch`: 3-position rocker
- `rotaryswitch`: N-position rotary selector
- `segmentbutton`: Multi-segment (tab-style)

**Modes:**
- **Momentary**: Sends 1 on press, 0 on release
- **Toggle**: Alternates between 0 and 1 on each click

**Navigation:**
- Set `action` to "navigate-window"
- Set `targetWindowId` to switch windows

### Meters

**Professional Meters:**
- `rmsmetermo`/`rmsmeterstereo`: RMS level (-60 to 0 dB)
- `vumetermono`/`vumeterstereo`: VU standard (-20 to +3 dB)
- `ppmtype1mono`/`ppmtype1stereo`: PPM Type I (-50 to +5 dB)
- `truepeakmetermono`/`truepeakmeterstereo`: True peak detection
- `lufsmomono`/`lufsmomostereo`: LUFS Momentary (400ms)
- `lufsshortmono`/`lufsshortstereo`: LUFS Short-term (3s)
- `lufsintmono`/`lufsintstereo`: LUFS Integrated
- `k12/k14/k20metermono`/`stereo`: K-System metering
- `correlationmeter`: Phase correlation (-1 to +1)
- `stereowidthmeter`: Stereo width (0 to 200%)

**LED Indicators:**
- `singleled`: Single color LED (on/off)
- `bicolorled`: 2-state LED (e.g., green/red)
- `tricolorled`: 3-state LED
- `ledarray`: Horizontal/vertical LED strip
- `ledring`: Circular LED ring
- `ledmatrix`: 2D LED grid (8×8, etc.)

### Visualizations

**Real-Time Displays:**
- `scrollingwaveform`: Live waveform scrolling left
- `spectrumanalyzer`: FFT frequency spectrum bars
- `spectrogram`: Time-frequency waterfall
- `goniometer`: Stereo phase display (Lissajous)
- `vectorscope`: Stereo vectorscope

**Note:** Visualizations require real-time audio data from C++. Export includes placeholder animations for preview.

### Curves

**Interactive Curve Editors:**
- `eqcurve`: EQ curve with draggable band handles
- `compressorcurve`: Compressor transfer curve
- `envelopedisplay`: ADSR envelope visualizer
- `lfodisplay`: LFO waveform display
- `filterresponse`: Filter frequency response curve

### Containers

**Layout Containers:**
- `panel`: Simple panel with padding/border
- `frame`: Frame with border styling
- `groupbox`: Labeled group container
- `collapsible`: Collapsible/accordion section

**Child Positioning:**
Children use coordinates relative to container's content area (inside padding). A child at `x: 0, y: 0` appears at top-left of container content.

### Decorative

**Static Elements:**
- `rectangle`: Filled rectangle with border/corners
- `line`: Line stroke with dash patterns
- `image`: Raster image (PNG/JPG)
- `svggraphic`: SVG graphic from asset library

## Advanced Features

### Layers System (v1.9)

#### Creating Layers

1. Click **Layers** tab
2. Click **"+ New Layer"**
3. Enter name (e.g., "Background", "Controls", "Labels")
4. Choose color for visual identification
5. Layer appears in list

#### Assigning Elements to Layers

**Method 1: Right-click**
1. Right-click element on canvas
2. Select **"Move to Layer"**
3. Choose target layer

**Method 2: Properties Panel**
1. Select element
2. In properties, find **"Layer"** dropdown
3. Select layer

#### Reordering Layers (Z-Order)

1. Open **Layers** tab
2. Drag layer up/down in list
3. Top layer = front, bottom layer = back
4. Default layer always stays at bottom

#### Layer Visibility

- Click **eye icon** to hide/show layer
- Hidden layers don't export
- Use to focus on specific sections during design

#### Layer Locking

- Click **lock icon** to lock/unlock layer
- Locked layers can't be edited
- Prevents accidental changes to finalized sections

#### Layer Colors

- Assign colors for visual identification
- Selection handles show layer color
- Helps identify which elements belong to which layer

### Help System (v1.9)

#### F1 Shortcut

1. Select any element on canvas
2. Press **F1**
3. Help window opens with:
   - Element description
   - Property reference
   - Usage examples
   - Integration code snippets

#### Inline Help Buttons

1. Open **Properties** panel
2. Look for **(?)** buttons on each section
3. Click for contextual help about that property group

#### Help Window Features

- Dark theme (matches designer)
- Copy code snippets with one click
- Links to related elements
- Step-by-step tutorials

### Multi-Window System

#### Creating Windows

1. Click **Windows** tab (left panel, v1.6+)
2. Click **"+ New Window"**
3. Configure:
   - **Name**: "Settings Window"
   - **Type**: Release or Developer
   - **Size**: Width × Height
4. Switch between windows using dropdown in toolbar

#### Window Types

- **Release**: Exported in production builds
- **Developer**: Hidden in release builds (for debugging/testing)

#### Navigation Between Windows

1. Add a **button** element
2. Set `action` to "navigate-window"
3. Set `targetWindowId` to destination window UUID
4. Export generates `window-mapping.json` for routing

### Asset Management

#### SVG Import

1. Click **Assets** tab
2. Click **"Import SVG"**
3. Select SVG file from disk
4. FACEPLATE sanitizes SVG (removes scripts, dangerous content)
5. Asset appears in library

**Using SVG Assets:**
- Drag **SVG Graphic** element onto canvas
- In properties, select asset from dropdown
- Resize/position as needed

#### Font Management

1. Click **Fonts** tab
2. Click **"Select Font Folder"**
3. Choose folder containing .ttf/.otf/.woff/.woff2 files
4. FACEPLATE scans and lists available fonts
5. Fonts appear in font family dropdowns

**Export Behavior:**
- JUCE export embeds fonts as base64 in CSS
- Preview export uses Google Fonts CDN

#### Custom Knob Styles

1. Create SVG with specific layer structure:
   - `track`: Background arc
   - `fill`: Value arc
   - `indicator`: Pointer line/dot
2. Import SVG as asset
3. Click **Knob Styles** tab
4. Click **"+ New Knob Style"**
5. Map SVG layers to knob parts
6. Apply style to knob elements

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **F1** | Open help for selected element |
| **Ctrl+Z** | Undo |
| **Ctrl+Y** / **Ctrl+Shift+Z** | Redo |
| **Ctrl+C** | Copy selected element(s) |
| **Ctrl+V** | Paste copied element(s) |
| **Ctrl+X** | Cut selected element(s) |
| **Delete** / **Backspace** | Delete selected element(s) |
| **Ctrl+A** | Select all elements |
| **Ctrl+D** | Deselect all |
| **Ctrl+G** | Toggle snap grid |
| **Ctrl+S** | Save project (browser save dialog) |
| **Arrow Keys** | Nudge selected element 1px |
| **Shift+Arrow Keys** | Nudge selected element 10px |
| **H** | Toggle visibility of selected layer |
| **Shift+Drag** | Constrain movement (horizontal/vertical) |
| **Alt+Drag** | Duplicate element while dragging |

### Grid & Alignment

#### Snap Grid

1. Press **Ctrl+G** to toggle grid visibility
2. Set grid size in **Settings** (default 8px or 16px)
3. Elements snap to grid when moving/resizing

#### Alignment Tools

1. Select multiple elements (Shift+click or drag-select)
2. Click alignment buttons in toolbar:
   - Align Left
   - Align Center
   - Align Right
   - Align Top
   - Align Middle
   - Align Bottom
   - Distribute Horizontally
   - Distribute Vertically

### Copy/Paste & Duplication

**Copy Single Element:**
1. Select element
2. Ctrl+C to copy
3. Ctrl+V to paste (appears offset)

**Duplicate While Dragging:**
1. Select element
2. Hold **Alt** key
3. Drag to new position
4. Release to create duplicate

**Copy with Properties:**
Copied elements retain all properties including parameter bindings. Remember to rename and adjust parameter IDs for duplicates.

### Undo/Redo System

FACEPLATE tracks all actions:
- Add/delete elements
- Property changes
- Position/resize
- Layer changes

**History Panel:**
- View full action history
- Click any action to jump to that state
- Shows timestamps and descriptions

### Color Schemes

**Recommended for Audio Plugins:**

```
Background:     #1a1a1a to #2a2a2a (dark gray)
Surface:        #333333 to #444444 (medium gray)
Text Primary:   #ffffff (white)
Text Secondary: #888888 to #aaaaaa (light gray)
Accent:         Your brand color (e.g., #00ff88 mint green)
Warning:        #ff6600 to #ffaa00 (orange)
Error/Clip:     #ff4444 (red)
```

**Using Color Picker:**
1. Click color swatch in properties
2. Color picker popup appears
3. Select color visually or enter hex code
4. Click outside to close

---

# INTEGRATION GUIDE

## Prerequisites

- **JUCE 7.0+** installed
- **WebView2 Runtime** (Windows, usually pre-installed)
- **VST3 project** set up with JUCE
- **CMakeLists.txt** or Projucer project file

## Step-by-Step Integration

### 1. Design UI in FACEPLATE

1. Open FACEPLATE designer
2. Create/load your UI project
3. Add elements matching your plugin's parameters
4. Set **Parameter IDs** to match C++ APVTS parameter names
5. Save project JSON file
6. Export as **JUCE Bundle**

### 2. Extract Bundle to Project

```bash
cd /path/to/your-vst3-project
unzip ~/Downloads/webview-ui-juce.zip -d Source/ui/
```

Your project structure:
```
your-vst3-project/
├── Source/
│   ├── PluginProcessor.h
│   ├── PluginProcessor.cpp
│   ├── PluginEditor.h
│   ├── PluginEditor.cpp
│   └── ui/                     ← Extracted here
│       ├── index.html
│       ├── style.css
│       ├── components.js
│       ├── bindings.js
│       └── README.md
├── CMakeLists.txt
└── YourPlugin.jucer
```

### 3. Update CMakeLists.txt

Add binary data target:

```cmake
# Add UI resources as binary data
juce_add_binary_data(${PROJECT_NAME}_UIData
    NAMESPACE BinaryData
    SOURCES
        Source/ui/index.html
        Source/ui/style.css
        Source/ui/components.js
        Source/ui/bindings.js
)

# Link to your plugin target
target_link_libraries(${PROJECT_NAME}
    PRIVATE
        ${PROJECT_NAME}_UIData
        juce::juce_audio_utils
        juce::juce_gui_extra    # Required for WebBrowserComponent
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)
```

### 4. Update PluginEditor.h

```cpp
#pragma once
#include <JuceHeader.h>
#include "PluginProcessor.h"

class YourPluginEditor : public juce::AudioProcessorEditor,
                         private juce::Timer  // Add for parameter sync
{
public:
    YourPluginEditor(YourPluginProcessor&);
    ~YourPluginEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;  // For parameter sync

    YourPluginProcessor& processor;

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
            .withNativeFunction("requestParamSync", [this](auto& args, auto complete) {
                syncAllParametersToWebView();
                complete({});
            })
    };

    // Resource provider
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

    // Parameter sync system
    void syncAllParametersToWebView();
    std::map<juce::String, float> lastSentValues;  // Track last sent values

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(YourPluginEditor)
};
```

### 5. Update PluginEditor.cpp

```cpp
#include "PluginEditor.h"
#include "BinaryData.h"  // Generated by juce_add_binary_data

YourPluginEditor::YourPluginEditor(YourPluginProcessor& p)
    : AudioProcessorEditor(&p), processor(p)
{
    // Match canvas size from FACEPLATE (e.g., 800×600)
    setSize(800, 600);

    // Add browser to editor
    addAndMakeVisible(browser);

    // Initialize parameter tracking map
    for (auto* param : processor.apvts.getParameters())
    {
        if (auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param))
            lastSentValues[rangedParam->paramID] = rangedParam->getValue();
    }

    // Start timer for real-time parameter sync (30 Hz recommended)
    startTimerHz(30);

    // Navigate to index.html
    browser.goToURL("http://localhost/index.html");
}

YourPluginEditor::~YourPluginEditor()
{
    stopTimer();
}

void YourPluginEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
}

void YourPluginEditor::resized()
{
    browser.setBounds(getLocalBounds());
}

void YourPluginEditor::timerCallback()
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

std::optional<juce::WebBrowserComponent::Resource>
YourPluginEditor::getResource(const juce::String& url)
{
    auto filename = url.fromLastOccurrenceOf("/", false, false);

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

void YourPluginEditor::handleSetParameter(
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

void YourPluginEditor::handleGetParameter(
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

void YourPluginEditor::handleBeginGesture(
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

void YourPluginEditor::handleEndGesture(
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

void YourPluginEditor::syncAllParametersToWebView()
{
    juce::Array<juce::var> params;

    for (auto* param : processor.apvts.getParameters())
    {
        auto* rangedParam = dynamic_cast<juce::RangedAudioParameter*>(param);
        if (!rangedParam) continue;

        juce::DynamicObject::Ptr paramObj = new juce::DynamicObject();
        paramObj->setProperty("id", rangedParam->paramID);
        paramObj->setProperty("value", rangedParam->getValue());
        params.add(juce::var(paramObj.get()));
    }

    juce::DynamicObject::Ptr eventData = new juce::DynamicObject();
    eventData->setProperty("params", params);
    browser.emitEvent("__juce__paramSync", juce::var(eventData.get()));
}
```

### 6. Verify Parameter IDs Match

Ensure your APVTS parameter IDs match what you set in FACEPLATE:

```cpp
// PluginProcessor.cpp
juce::AudioProcessorValueTreeState::ParameterLayout
YourPluginProcessor::createParameterLayout()
{
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    // These IDs MUST match what you set in FACEPLATE's Parameter ID property
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "gain",           // ← Must match FACEPLATE
        "Gain",
        0.0f, 1.0f, 0.5f
    ));

    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "masterVolume",   // ← Must match FACEPLATE
        "Master Volume",
        0.0f, 1.0f, 0.75f
    ));

    // Add all other parameters...

    return { params.begin(), params.end() };
}
```

### 7. Build & Test

```bash
# Generate build files
cmake -B build -DCMAKE_BUILD_TYPE=Debug

# Build
cmake --build build --config Debug

# Plugin will be in: build/YourPlugin_artefacts/Debug/VST3/
```

**Test in DAW:**
1. Copy built .vst3 to plugin folder
2. Rescan plugins in your DAW
3. Load plugin
4. Verify UI appears correctly
5. Test controls respond to interaction
6. Test automation recording/playback

---

# TROUBLESHOOTING

## Designer Issues

### UI Element Won't Drag

**Cause:** Element might be locked or on locked layer

**Solution:**
1. Check if element is locked (lock icon in properties)
2. Check if layer is locked (lock icon in layers panel)
3. Unlock element or layer

### Property Changes Not Showing

**Cause:** Browser cache or rendering delay

**Solution:**
1. Refresh browser (Ctrl+R)
2. Clear browser cache
3. Check if element is visible (not hidden layer)

### Export Button Grayed Out

**Cause:** Validation errors

**Solution:**
1. Check console (F12) for errors
2. Ensure all elements have unique names
3. Ensure no duplicate parameter IDs
4. Fix any validation warnings in UI

### Fonts Not Appearing in Dropdown

**Cause:** Font folder not scanned or invalid fonts

**Solution:**
1. Click "Select Font Folder" again
2. Ensure folder contains .ttf, .otf, .woff, or .woff2 files
3. Check browser console for parsing errors
4. Try different font files

### Layer Reordering Not Working

**Cause:** Default layer can't be moved

**Solution:**
- Default layer always stays at bottom
- Only custom layers can be reordered
- Create new layers for elements you want to reorder

## Export Issues

### Exported ZIP is Empty

**Cause:** Browser blocked download or export failed

**Solution:**
1. Check browser console (F12) for errors
2. Try different export mode (JUCE Bundle vs Preview)
3. Ensure browser allows downloads from localhost

### Missing Elements in Export

**Cause:** Elements on hidden layers don't export

**Solution:**
1. Check Layers panel
2. Ensure all layers are visible (eye icon enabled)
3. Export only includes visible elements

### Fonts Not Embedded in Export

**Cause:** Fonts not selected or parsing error

**Solution:**
1. Open Fonts tab
2. Click "Select Font Folder"
3. Verify fonts appear in list
4. Only fonts actually used in design are embedded

### Incorrect Element Order (Z-Index)

**Cause:** Layer order not respected in old exports

**Solution:**
- This was fixed in v1.9
- Re-export project with latest version
- Elements now render in correct layer order

## Integration Issues

### Blank Plugin Window

**Symptoms:** Plugin loads but shows black/white window

**Solution:**

1. **Verify WebView2 Runtime (Windows):**
   - Download from [Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
   - Install runtime

2. **Check Binary Data Linking:**
   ```cmake
   # Ensure UIData target is linked
   target_link_libraries(${PROJECT_NAME}
       PRIVATE ${PROJECT_NAME}_UIData
   )
   ```

3. **Verify Resource Provider:**
   - Check `getResource()` returns valid data
   - Add debug logging to confirm files are found

4. **Check Browser Console:**
   - Add temporarily: `browser.emitEventIfBrowserIsVisible("openDevTools", {})`
   - Look for JavaScript errors

### Controls Don't Respond

**Symptoms:** Knobs/sliders don't affect audio

**Solution:**

1. **Verify Parameter IDs Match:**
   ```cpp
   // C++ APVTS
   params.push_back(std::make_unique<juce::AudioParameterFloat>(
       "gain",  // ← Must match FACEPLATE's Parameter ID
       ...
   ));
   ```

2. **Check Native Functions Registered:**
   - Ensure `.withNativeFunction()` called for all 4 functions
   - Check function signatures match exactly

3. **Test in Browser Preview First:**
   - Export as "HTML Preview"
   - Open in browser
   - Open console (F12)
   - Look for "MockJUCE" logs when interacting

4. **Verify JUCE Bridge Initialized:**
   - Check JavaScript console for "[JUCEBridge] Starting initialization..."
   - Should see "[JUCEBridge] JUCE available with functions: [...]"

### Parameter Changes Don't Update UI

**Symptoms:** Automation works but UI doesn't reflect changes

**Solution:**

1. **Implement Timer-Based Sync:**
   - See PluginEditor.cpp example above
   - Must call `startTimerHz(30)` in constructor
   - Must implement `timerCallback()` to emit `__juce__paramSync` events

2. **Verify Event Emission:**
   ```cpp
   browser.emitEvent("__juce__paramSync", juce::var(eventData.get()));
   ```

3. **Check JavaScript Listener:**
   - Exported bindings.js should have:
   ```javascript
   window.__JUCE__.backend.addEventListener('__juce__paramSync', ...);
   ```

### Canvas Size Mismatch

**Symptoms:** UI appears cropped or has extra space

**Solution:**

1. **Match setSize() to Canvas:**
   ```cpp
   // Must match FACEPLATE canvas dimensions
   setSize(800, 600);  // Example
   ```

2. **Check Responsive Scaling:**
   - Exported bindings.js includes automatic scaling
   - Ensure `plugin-container` div has correct size in style.css

3. **Verify No CSS Overrides:**
   - Don't modify exported style.css width/height

### Build Errors

**Symptoms:** CMake or compiler errors

**Solution:**

1. **Missing juce_gui_extra:**
   ```cmake
   target_link_libraries(${PROJECT_NAME}
       PRIVATE
           juce::juce_gui_extra  # Required for WebBrowserComponent
   )
   ```

2. **Binary Data Not Found:**
   - Ensure file paths in `juce_add_binary_data()` are correct
   - Paths are relative to CMakeLists.txt location

3. **C++17 Required:**
   ```cmake
   target_compile_features(${PROJECT_NAME} PRIVATE cxx_std_17)
   ```

## Platform-Specific Issues

### Windows: WebView2 Not Found

**Error:** "WebView2 Runtime not installed"

**Solution:**
- Install [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- Usually pre-installed on Windows 10 20H2+ and Windows 11
- For distribution, bundle runtime or prompt user to install

### macOS: Black Window

**Cause:** WKWebView security restrictions

**Solution:**
1. Ensure resource provider returns correct MIME types
2. Verify HTML/CSS/JS are valid
3. Check macOS Console.app for errors

### Linux: WebView Not Supported

**Issue:** Limited WebView support on Linux

**Solution:**
- Consider alternative UI approach for Linux (native JUCE components)
- Or use Chromium Embedded Framework (CEF) with more setup

---

# APPENDICES

## Appendix A: File Structure Reference

### Designer Source Structure

```
vst3-webview-ui-designer/
├── src/
│   ├── components/
│   │   ├── Canvas/              # Konva.js canvas rendering
│   │   ├── Properties/          # Property panels per element type
│   │   ├── Palette/             # Element palette
│   │   ├── Layers/              # Layer management (v1.9)
│   │   ├── History/             # Undo/redo UI
│   │   ├── Layout/              # App layout (panels, toolbar)
│   │   ├── export/              # Export service
│   │   ├── project/             # Save/load panels
│   │   └── dialogs/             # Modal dialogs
│   ├── store/
│   │   ├── index.ts             # Zustand store configuration
│   │   ├── elementsSlice.ts     # Element state management
│   │   ├── layersSlice.ts       # Layer state management
│   │   ├── canvasSlice.ts       # Canvas state
│   │   ├── assetsSlice.ts       # Asset library
│   │   ├── fontsSlice.ts        # Font management
│   │   └── windowsSlice.ts      # Multi-window state
│   ├── services/
│   │   ├── export/              # Export generators
│   │   │   ├── htmlGenerator.ts
│   │   │   ├── cssGenerator.ts
│   │   │   ├── jsGenerator.ts
│   │   │   ├── cppGenerator.ts
│   │   │   └── documentationGenerator.ts
│   │   ├── serialization.ts     # Save/load JSON
│   │   ├── fonts/               # Font parsing/storage
│   │   └── svg/                 # SVG sanitization/optimization
│   ├── types/
│   │   ├── elements.ts          # Element type definitions
│   │   ├── layer.ts             # Layer types
│   │   ├── asset.ts             # Asset types
│   │   └── knobStyle.ts         # Knob style types
│   ├── schemas/
│   │   └── project.ts           # Zod validation schemas
│   ├── utils/
│   │   ├── audioMath.ts         # Audio-specific math (dB, Hz)
│   │   ├── coordinates.ts       # Coordinate transforms
│   │   ├── curveRendering.ts    # Curve generation
│   │   └── valueFormatters.ts   # Display value formatting
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # React entry point
│   └── buildInfo.ts             # Build timestamp
├── docs/
│   ├── FACEPLATE_DOCUMENTATION.md    # This file
│   ├── ELEMENT_REFERENCE.md          # All element types
│   ├── INTEGRATION_GUIDE.md          # JUCE integration
│   ├── JUCE_PATTERN.md               # Communication pattern
│   ├── EXPORT_FORMAT.md              # Export file details
│   ├── BEST_PRACTICES.md             # Design guidelines
│   └── WORKFLOW.md                   # Development workflow
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Export Bundle Structure

**Single Window:**
```
webview-ui-juce.zip
├── index.html
├── style.css
├── components.js
├── bindings.js
└── README.md
```

**Multi-Window:**
```
webview-ui-juce.zip
├── main/
│   ├── index.html
│   ├── style.css
│   ├── components.js
│   └── bindings.js
├── settings/
│   ├── index.html
│   ├── style.css
│   ├── components.js
│   └── bindings.js
├── window-mapping.json
└── README.md
```

## Appendix B: Communication Event Reference

### JavaScript → C++

**Event:** `__juce__invoke`

**Format:**
```javascript
{
  name: "functionName",        // e.g., "setParameter"
  params: [arg1, arg2, ...],   // Function arguments
  resultId: 42                 // Sequential integer
}
```

**Functions:**
- `setParameter(paramId: string, value: number)`
- `getParameter(paramId: string) → number`
- `beginGesture(paramId: string)`
- `endGesture(paramId: string)`
- `requestParamSync()`

### C++ → JavaScript

**Event:** `__juce__complete`

**Format:**
```javascript
{
  resultId: 42,                // Matches request
  result: value                // Return value or undefined
}
```

**Event:** `__juce__paramSync`

**Format:**
```javascript
{
  params: [
    { id: "gain", value: 0.75 },
    { id: "volume", value: 0.5 }
  ]
}
```

**Purpose:** Real-time parameter updates (automation, MIDI, etc.)

## Appendix C: Color Palette Recommendations

### Professional Audio Plugin Colors

**Dark Theme (Recommended):**

```css
/* Backgrounds */
--bg-darkest:     #0a0a0a;  /* Canvas background */
--bg-darker:      #1a1a1a;  /* Primary background */
--bg-dark:        #2a2a2a;  /* Secondary background */
--bg-medium:      #333333;  /* Surface */
--bg-light:       #444444;  /* Elevated surface */

/* Text */
--text-primary:   #ffffff;  /* Primary text */
--text-secondary: #aaaaaa;  /* Secondary text */
--text-tertiary:  #888888;  /* Tertiary text */
--text-disabled:  #555555;  /* Disabled text */

/* Accent */
--accent:         #00ff88;  /* Primary accent (mint green) */
--accent-hover:   #00cc6a;  /* Hover state */
--accent-active:  #00aa55;  /* Active state */

/* Semantic Colors */
--success:        #00ff88;  /* Success state */
--warning:        #ff6600;  /* Warning state */
--error:          #ff4444;  /* Error state */
--info:           #4488ff;  /* Info state */

/* Meters */
--meter-green:    #00ff88;  /* Safe level */
--meter-yellow:   #ffaa00;  /* Warning level */
--meter-red:      #ff4444;  /* Clip level */
```

**Alternative Accent Colors:**

```css
--accent-blue:    #4488ff;  /* Modern, professional */
--accent-purple:  #aa44ff;  /* Creative, musical */
--accent-orange:  #ff6600;  /* Warm, energetic */
--accent-cyan:    #00ffff;  /* Retro, technical */
```

## Appendix D: Version History

| Version | Date | Features |
|---------|------|----------|
| **v1.9** | Jan 2026 | Layers system, help system (F1 + ? buttons), drag-drop layer reordering, bug fixes (layer persistence, export z-order, parameter sync) |
| **v1.8** | Dec 2025 | Bug fixes & UI improvements |
| **v1.7** | Nov 2025 | Parameter sync for C++ integration |
| **v1.6** | Oct 2025 | Multi-window system |
| **v1.5** | Sep 2025 | Font management, SVG export |
| **v1.4** | Aug 2025 | Container editing system |
| **v1.3** | Jul 2025 | Undo history, unsaved changes protection |
| **v1.2** | Jun 2025 | 78 new element types (100+ total) |
| **v1.1** | May 2025 | SVG import system |
| **v1.0** | Apr 2025 | Initial MVP release |

## Appendix E: Known Limitations

1. **Linux Support:** Limited WebView support; consider alternative UI for Linux targets
2. **Real-Time Visualizations:** Require C++ audio data streaming; export includes mock data for preview
3. **Touch/Pen Input:** Basic touch support; optimized for mouse interaction
4. **Large Projects:** 500+ elements may impact canvas performance
5. **Font Rendering:** Slight differences between browser preview (CDN) and JUCE export (embedded)

## Appendix F: Best Practices Summary

### Design

- **Canvas Size:** Start with 600×400 (simple) to 1200×800 (complex)
- **Grid:** Use 8px or 16px grid for consistent spacing
- **Touch Targets:** Minimum 44×44px for controls
- **Color Scheme:** Limit to 3-4 colors; use dark theme
- **Typography:** 2-3 font sizes max; 11-14px for labels
- **Layers:** Group related controls (Input, Processing, Output, Labels, Background)

### Organization

- **Layer Naming:** Descriptive names (e.g., "EQ Controls", "Output Meters")
- **Layer Colors:** Color-code by function (blue=controls, green=meters, gray=static)
- **Layer Visibility:** Hide completed sections to focus on current work
- **Layer Locking:** Lock finalized layers to prevent accidental changes

### Parameters

- **Naming:** Use camelCase, be consistent (e.g., `filterCutoff` not `filter_cutoff`)
- **IDs Match:** FACEPLATE Parameter IDs must exactly match C++ APVTS IDs
- **Defaults:** Set meaningful defaults (0.5 for center-zero, 0.75 for volume)
- **Ranges:** Always normalize to 0-1; scale in C++ as needed

### Performance

- **Element Count:** Aim for <200 elements per window
- **SVG Complexity:** Keep SVGs simple; avoid filters (blur, shadow)
- **Asset Sizes:** Optimize images; keep <100KB each
- **Update Frequency:** Use 30-60 Hz for parameter sync, not per-sample

### Integration

- **Version Control:** Commit both .json project and exported bundle
- **Iteration:** Design → Export → Test → Iterate; keep FACEPLATE project up to date
- **Testing:** Test in browser preview first, then standalone JUCE, then DAW
- **Documentation:** Document parameter IDs, color schemes, layout decisions

## Appendix G: Support & Resources

### Official Documentation

- GitHub: https://github.com/allthecodeDev/vst3-webview-ui-designer
- Issues: https://github.com/allthecodeDev/vst3-webview-ui-designer/issues
- Discussions: https://github.com/allthecodeDev/vst3-webview-ui-designer/discussions

### Related Projects

- **EFXvst:** Effect VST3 template with WebView2
- **INSTvst:** Instrument VST3 template with WebView2

### External Resources

- [JUCE Documentation](https://juce.com/learn/documentation)
- [WebView2 Documentation](https://learn.microsoft.com/en-us/microsoft-edge/webview2/)
- [VST3 SDK Documentation](https://steinbergmedia.github.io/vst3_doc/)

### Community

- JUCE Forum: https://forum.juce.com/
- Audio Developer Community: https://discord.gg/aud-dev (unofficial)

---

**Last Updated:** January 30, 2026
**Version:** 1.9
**Author:** allthecodeDev
**License:** [Check repository for license information]

---

*This documentation covers FACEPLATE v1.9. For the latest version, visit the GitHub repository.*
