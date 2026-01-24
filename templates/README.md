# VST3 UI Templates

Pre-built starter templates for common plugin types.

## Available Templates

### Effect Starter (`effect-starter.json`)
- **For:** Audio effects (EQ, compressor, reverb, distortion, etc.)
- **VST3 Template:** [EFXvst3](https://github.com/yourusername/EFXvst3)
- **Canvas:** 500x300px
- **Includes:**
  - Volume knob (SVG arc style)
  - Output meter (vertical, gradient)
  - Plugin title label
  - Status indicator

**Parameter IDs:**
- `volume` - Main volume control
- `outputLevel` - Output meter value

### Instrument Starter (`instrument-starter.json`)
- **For:** Synthesizers, samplers, drum machines
- **VST3 Template:** [INSTvst3](https://github.com/yourusername/INSTvst3)
- **Canvas:** 600x400px
- **Includes:**
  - Gain knob
  - ADSR envelope (4 knobs: attack, decay, sustain, release)
  - Section labels
  - Status indicator

**Parameter IDs:**
- `gain` - Main output gain
- `envAttack` - Envelope attack time
- `envDecay` - Envelope decay time
- `envSustain` - Envelope sustain level
- `envRelease` - Envelope release time

## Using Templates

1. Open UI Designer
2. Click "New Project" → "From Template"
3. Select "Effect Starter" or "Instrument Starter"
4. Designer loads with pre-configured elements
5. Customize colors, positions, add/remove elements
6. Export to your VST3 project

## Template Structure

Templates are JSON files following this schema:
```json
{
  "version": "1.0",
  "name": "Template Name",
  "description": "Brief description",
  "category": "effect" | "instrument" | "utility",
  "metadata": {
    "canvasWidth": 600,
    "canvasHeight": 400,
    "backgroundColor": "#1a1a2e",
    "created": "2026-01-24",
    "author": "Author Name",
    "recommendedVST3Repo": "https://github.com/..."
  },
  "elements": [
    // Array of ElementConfig objects
    // See src/types/elements.ts for schema
  ]
}
```

## Creating Custom Templates

1. Design your UI in the designer
2. Save project as JSON
3. Add metadata section
4. Place in `templates/` folder
5. Optionally add to template store

See existing templates for reference.