# Generate VST3 UI from Parameter Specs

You are a UI generation assistant for the vst3-webview-ui-designer project.

## CRITICAL: Read Type Definitions First

**NEVER use hardcoded element defaults.** Before generating ANY elements, you MUST read the actual TypeScript type definitions:

1. `src/types/elements/controls.ts` - All control elements (knob, slider, button, etc.)
2. `src/types/elements/displays.ts` - All display/meter elements
3. `src/types/elements/decorative.ts` - All decorative elements
4. `src/types/elements/containers.ts` - All container elements
5. `src/types/elements/specialized.ts` - All specialized audio elements
6. `src/types/elements/visualizations.ts` - All visualization elements
7. `src/types/elements/curves.ts` - All curve elements

Each file contains **factory functions** (e.g., `createKnob()`, `createSlider()`) that show the EXACT default values to use.

## Why This Matters

The app uses Zod validation with `.passthrough()` which means:
- Wrong property names are **silently ignored** (no error)
- Elements render with missing/wrong values
- The UI appears broken but doesn't crash

When Faceplate saves a project, it serializes actual TypeScript state - so property names are always correct. When `/generate-ui` creates JSON, it must match exactly.

## Context Files to Read

Before generating anything:

1. **Type Definitions** (REQUIRED) - Read the type files listed above
2. **Plugin Specs** - Look in `UI_SPECS_PLUGINS/` folder for the target plugin's `.md` spec file
3. **Example File** - Read `UI_SPECS_PLUGINS/EXAMPLE_ALL_ELEMENTS.json` to see correct element structures

## Your Task

1. Parse the parameter specifications from the plugin's `.md` file
2. Read the relevant type definition files to get correct property names
3. Generate a valid v2.0.0 project JSON file
4. Create sensible default layouts based on parameter groupings

## Input

$ARGUMENTS

If no plugin name is provided, list available plugins in `UI_SPECS_PLUGINS/` and ask which one to use.

## Element Generation Rules

### Parameter Type Mapping

| Parameter Type | Element Type | Notes |
|----------------|--------------|-------|
| `float` (0.0-1.0) | `knob` | Standard rotary control |
| `float` (other ranges) | `knob` | Set min/max appropriately |
| `bool` | `button` | mode: "toggle" |
| `bool` (momentary) | `button` | mode: "momentary" |
| `choice` (2-4 options) | `segmentbutton` | segments array with text |
| `choice` (5+ options) | `dropdown` | options array |
| `Hz` parameters | `knob` | valueFormat: "hz" |
| `dB` parameters | `knob` | valueFormat: "db" |
| `%` parameters | `knob` | valueFormat: "percentage" |
| `ms/sec` parameters | `knob` | valueFormat: "custom", valueSuffix: "ms" |

### Common Property Pitfalls (From EXAMPLE_ALL_ELEMENTS.json fixes)

**Knob elements:**
- Use `labelText` not `label` for the label string
- Use `labelDistance` for spacing from element
- Use `valueDecimalPlaces` not `decimalPlaces`
- fontWeight is a string: `"400"` not `400`

**Button elements:**
- Has `fontSize`, `fontFamily`, `fontWeight` for text styling
- Has `borderWidth` (required)

**TabBar elements:**
- `tabs` is array of `TabConfig` objects: `{ id, label, showLabel, showIcon }`
- Use `activeTabIndex` not `selectedIndex`

**Breadcrumb elements:**
- `items` is array of `BreadcrumbItem`: `{ id, label }`
- Use `linkColor`/`currentColor` not `textColor`/`activeColor`

**TagSelector elements:**
- Use `availableTags` not `tags`
- Tags are `{ id, label }` objects

**TreeView elements:**
- Use `data` not `nodes`
- Nodes use `name` not `label`
- Use `selectedId` not `selectedNodeId`

**ModulationMatrix elements:**
- Use `previewActiveConnections: [[0,1], [2,0]]` for active cells
- NO `amounts` 2D array

**PresetBrowser elements:**
- `presets` is string array: `["Factory/Init", "User/My Preset"]`
- NOT object array

**Professional Meters:**
- Use `minDb`/`maxDb` not `min`/`max`
- Stereo meters need `valueL`/`valueR`

**Audio Displays:**
- dbdisplay: `minDb`/`maxDb`, `decimalPlaces`, `showUnit`
- frequencydisplay: `decimalPlaces`, `autoSwitchKHz`, `showUnit`
- gainreductionmeter: `maxReduction`, `meterColor`

**Decorative elements:**
- svggraphic: uses `assetId`, `flipH`, `flipV`, `opacity`
- rectangle: `borderColor`/`borderWidth` not `strokeColor`/`strokeWidth`
- asciiart: `contentType`, `content`, `noiseCharacters`, etc.

### Layout Strategy

1. Group parameters by their prefix (e.g., `dev_modalA_*`, `dev_karplusB_*`)
2. Create separate windows for User vs Developer parameters
3. Use grid positioning: start at (40, 80), spacing 100px horizontal, 120px vertical
4. Add section labels using `label` elements as headers
5. Keep elements within window bounds

### Window Structure

```json
{
  "version": "2.0.0",
  "windows": [
    {
      "id": "<generate-uuid>",
      "name": "USER",
      "type": "release",
      "width": 500,
      "height": 300,
      "backgroundColor": "#292929",
      "backgroundType": "color",
      "elementIds": ["<user-element-ids>"],
      "createdAt": <timestamp>
    },
    {
      "id": "<generate-uuid>",
      "name": "DEV",
      "type": "developer",
      "width": 1280,
      "height": 720,
      "backgroundColor": "#1a1a1a",
      "backgroundType": "color",
      "elementIds": ["<dev-element-ids>"],
      "createdAt": <timestamp>
    }
  ],
  "elements": [<all-elements>],
  "assets": [],
  "knobStyles": [],
  "layers": [],
  "snapToGrid": true,
  "gridSize": 20,
  "showGrid": true,
  "gridColor": "#ffffff"
}
```

## Base Element Properties (Required for ALL elements)

Every element MUST have these base properties:

```json
{
  "id": "<uuid>",
  "type": "<element-type>",
  "name": "<display-name>",
  "x": 0,
  "y": 0,
  "width": 60,
  "height": 60,
  "rotation": 0,
  "zIndex": 0,
  "locked": false,
  "visible": true,
  "parameterId": "<optional-juce-param-id>"
}
```

## Output

1. Show a summary of what will be generated (parameter count, element count, windows)
2. Read the relevant type definition files
3. Generate the complete JSON with correct property names
4. Save it to `UI_SPECS_PLUGINS/<PluginName>_generated.json`
5. Provide instructions on how to load it in the UI Designer

## Important Notes

- **Always generate unique UUIDs** for element and window IDs
- **Set `parameterId`** to match the exact parameter ID from the spec
- **Use the parameter description** as `labelText` (shortened if needed)
- **Set `name`** to a human-readable element name
- **Use appropriate `valueFormat`** based on the parameter unit
- **Read factory functions** in type files for correct default values
- **Test by loading** the generated JSON in Faceplate to verify it works
