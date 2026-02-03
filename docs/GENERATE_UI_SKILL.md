# /generate-ui Skill Documentation

A Claude Code skill that automatically generates VST3 plugin UI layouts from parameter specifications.

## Quick Start

```bash
/generate-ui <PluginName>
```

**Example:**
```bash
/generate-ui NOISE_VST
```

## Overview

The `/generate-ui` skill reads your VST3 parameter specifications and generates a complete UI Designer project file with:

- Properly typed UI elements (knobs, buttons, sliders)
- Correct parameter bindings (`parameterId`)
- Organized layout with section headers
- Separate USER and DEV windows
- Appropriate value formats (Hz, %, seconds, etc.)

## File Structure

```
UI_SPECS_PLUGINS/
├── <PluginName>_SPECS.md      # Parameter specifications (input)
├── <PluginName>_template.json  # Optional layout reference
└── <PluginName>_generated.json # Generated UI project (output)
```

## Input: Parameter Specification Format

Create a markdown file with your parameters in table format:

### Basic Float Parameter
```markdown
| ID          | Type  | Range     | Default | Description           |
|-------------|-------|-----------|---------|----------------------|
| myParam     | float | 0.0 - 1.0 | 0.5     | Controls the amount  |
```

### Boolean Parameter
```markdown
| ID        | Type | Range      | Default | Description      |
|-----------|------|------------|---------|------------------|
| bypass    | bool | false/true | false   | Bypass toggle    |
| trigger   | bool | false/true | false   | Momentary trigger|
```

### Choice Parameter
```markdown
| ID       | Type   | Options                    | Default    |
|----------|--------|----------------------------|------------|
| mode     | choice | Sine, Square, Saw, Noise   | Sine (0)   |
```

### Parameters with Units
```markdown
| ID        | Range         | Default | Description          |
|-----------|---------------|---------|----------------------|
| freq      | 20 - 20000 Hz | 440     | Oscillator frequency |
| attack    | 0.01 - 2.0 s  | 0.1     | Attack time          |
| threshold | -60 - 0 dB    | -12     | Threshold level      |
| detune    | -100 - 100 ct | 0       | Detune in cents      |
```

## Output: Generated Project

The skill generates a v2.0.0 project JSON with:

### Windows
- **USER** - Release window with user-facing controls
- **DEV** - Developer window with all parameters

### Element Mapping

| Parameter Type | UI Element | Value Format |
|---------------|------------|--------------|
| `float` 0-1 | Knob | percent |
| `float` Hz | Knob | hz |
| `float` seconds | Knob | seconds |
| `float` dB | Knob | db |
| `float` other | Knob | numeric |
| `bool` toggle | Button (toggle) | - |
| `bool` momentary | Button (momentary) | - |
| `choice` | Knob (stepped) | numeric |

### Layout Rules

1. **Grouping**: Parameters grouped by prefix (e.g., `osc_`, `filter_`, `env_`)
2. **Positioning**: Grid layout starting at (40, 80), spacing 80px
3. **Colors**: Different colors for different parameter groups
4. **Headers**: Section labels for each group

## Example Workflow

### 1. Create Specification File

```markdown
# MyPlugin - Parameter Reference

## User Parameters

| ID     | Type  | Range     | Default | Description    |
|--------|-------|-----------|---------|----------------|
| volume | float | 0.0 - 1.0 | 0.8     | Output volume  |
| bypass | bool  | false/true| false   | Bypass effect  |

## Developer Parameters

### Oscillator

| ID        | Range          | Default | Description      |
|-----------|----------------|---------|------------------|
| osc_freq  | 20 - 20000 Hz  | 440     | Base frequency   |
| osc_fine  | -100 - 100 ct  | 0       | Fine tune        |

### Filter

| ID           | Range         | Default | Description    |
|--------------|---------------|---------|----------------|
| filter_cutoff| 20 - 20000 Hz | 1000    | Cutoff freq    |
| filter_res   | 0.0 - 1.0     | 0.5     | Resonance      |
```

### 2. Run the Skill

```bash
/generate-ui MyPlugin
```

### 3. Load in UI Designer

1. Open the UI Designer application
2. File > Open (Ctrl+O)
3. Select `UI_SPECS_PLUGINS/MyPlugin_generated.json`
4. Customize the layout as needed
5. Export for your VST3 project

## Customization

### Using a Template

Create `<PluginName>_template.json` with pre-positioned elements. The skill will use this as a reference for:

- Window dimensions
- Color schemes
- Font settings
- Layout preferences

### Post-Generation Editing

After generation, open the project in the UI Designer to:

- Fine-tune element positions
- Apply custom knob styles
- Add decorative elements (images, lines, panels)
- Adjust colors and fonts

## Tips

1. **Consistent Naming**: Use prefixes to group related parameters (`osc_`, `env_`, `filter_`)
2. **Document Units**: Include units in the Range column (Hz, dB, s, ms, ct)
3. **Mark Momentary**: Add "Momentary" or "trigger" in description for momentary buttons
4. **Separate User/Dev**: Use clear headings to distinguish user vs developer parameters

## Troubleshooting

### Skill Not Found
Ensure `.claude/commands/generate-ui.md` exists in your project.

### Wrong Element Type
Check your parameter specification format. The skill uses the `Type` column and range units to determine element types.

### Missing Parameters
Verify your markdown tables use the correct column headers and pipe separators.

## Related Files

- `.claude/commands/generate-ui.md` - Skill definition
- `src/schemas/project.ts` - Project JSON schema
- `src/types/elements.ts` - Element type definitions
