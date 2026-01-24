# vst3-webview-ui-designer
A visual design tool for creating audio plugin user interfaces using SVG/HTML/CSS/JS, targeting JUCE WebView2 integration. Users drag-and-drop UI components onto a canvas, configure properties via a panel, preview in real-time, and export code for JUCE WebView2 plugins.

## Quick Start with VST3 Templates

The fastest way to create a JUCE WebView2 VST3 plugin:

1. **Clone a VST3 template:**
```bash
   git clone https://github.com/yourusername/EFXvst3  # For effects
   # OR
   git clone https://github.com/yourusername/INSTvst3 # For instruments
```

2. **Start the UI designer:**
```bash
   npm install
   npm run dev
```

3. **Create from template:**
   - Click "New Project" → "Effect Starter" or "Instrument Starter"
   - Customize your UI
   - Export to your VST3 project folder

4. **Build your plugin:**
   - Integrate exported code (see [WORKFLOW.md](./docs/WORKFLOW.md))
   - Build in JUCE
   - Load in your DAW

See the complete [VST3 Workflow Guide](./docs/WORKFLOW.md) for detailed instructions.

## Related Repositories

- **[EFXvst3](https://github.com/yourusername/EFXvst3)** - Effect VST3 template with WebView2
- **[INSTvst3](https://github.com/yourusername/INSTvst3)** - Instrument VST3 template with WebView2
