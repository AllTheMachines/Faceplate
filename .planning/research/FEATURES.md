# Feature Landscape

**Domain:** Visual Design Tools / Canvas-Based UI Editors (Audio Plugin Context)
**Researched:** 2026-01-23
**Overall confidence:** MEDIUM

## Executive Summary

Visual design tools in 2026 combine traditional canvas manipulation with AI-powered generation, real-time collaboration, and production-ready code export. However, for a specialized single-user tool targeting audio plugin developers, not all modern features are relevant. This research identifies table stakes (what users expect from any canvas editor), differentiators (what makes this better than hand-coding for plugin UIs), and anti-features (what NOT to build for v1).

The audio plugin domain has unique constraints: developers value precise control, minimal dependencies, and code that integrates cleanly with JUCE projects. While tools like Figma prioritize collaboration and Canva emphasizes AI generation, this tool should prioritize **instant visual feedback**, **clean code export**, and **audio-specific components**.

## Table Stakes

Features users expect from any canvas editor. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Canvas Pan & Zoom** | Every visual tool has this since the 1990s | Low | Hold spacebar+drag to pan. Scroll/pinch to zoom. Critical for working with different canvas sizes. |
| **Selection** | Can't edit what you can't select | Low | Click to select, Shift+click for multi-select, drag marquee for area selection. |
| **Drag & Drop from Palette** | Core interaction model for component-based design | Medium | Drag SVG components (knobs, sliders, buttons) onto canvas. Must feel instant, not laggy. |
| **Move / Resize / Rotate** | Basic transformations for any object | Medium | Drag to move, corner handles to resize, rotation handle. Arrow keys for pixel nudging. |
| **Delete** | Can't build without ability to remove | Low | Delete/Backspace key or context menu. |
| **Undo / Redo** | Users expect to experiment without fear | Medium | Ctrl+Z / Ctrl+Y. Command pattern recommended (see research). Not image-based (memory intensive). |
| **Properties Panel** | Need to configure component properties somewhere | Medium | Right panel showing selected element's properties. Audio plugins need precise numeric input, not just sliders. |
| **Save Project** | Can't lose work | Medium | JSON format for version control. Auto-save recommended but explicit save/load critical. |
| **Load Project** | Need to reopen saved work | Medium | Load JSON project file. Handle errors gracefully (corrupt files, version mismatches). |
| **Export** | The whole point - generate usable code | High | Export HTML/CSS/JS that works in JUCE WebView2. This is THE critical feature. |

### Why These Are Table Stakes

Research shows users abandon tools that lack basic canvas manipulation. From [Figma's interface design](https://verticalinstitute.com/blog/understanding-figma-for-design/) and [canvas editor patterns](https://konvajs.org/docs/react/Undo-Redo.html), these are non-negotiable for a visual design tool. Users trained on Figma, Sketch, or even PowerPoint expect these interactions.

For audio plugin developers specifically, **precise numeric input** and **clean code export** are table stakes because plugins require exact positioning and integration with existing JUCE projects.

## Differentiators

Features that make this better than hand-coding. Not expected, but HIGH value for target users.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Live Preview** | See exactly what the UI looks like while designing | High | Real preview of audio controls (knobs spin, sliders slide). Differentiates from static mockups. Requires simulating control behavior. |
| **Snap to Grid** | Audio UIs often use grid layouts for control banks | Low | Shift+drag to snap to grid. [Common in design tools](https://www.drawio.com/blog/snap-to-grid). Critical for professional-looking aligned controls. |
| **Smart Guides / Alignment** | Professional alignment without math | Medium | Dynamic guides appear when elements align with others. [Standard in modern tools](https://www.kittl.com/blogs/layout-tools/). |
| **Component Library** | Predefined audio-specific controls | Medium | Palette with knobs, sliders, buttons, meters, labels. SVG-based for scalability. Pre-configured with sensible defaults. |
| **Property Presets** | Common control configurations | Low | "Small knob", "Large slider", "VU meter" presets. Reduces repetitive property setting. |
| **Copy/Paste** | Duplicate controls quickly | Low | Ctrl+C / Ctrl+V. Essential for creating control banks (8 identical knobs for EQ bands). |
| **Duplicate** | Faster than copy/paste | Low | Ctrl+D or Alt+drag. Audio UIs often have repeated elements. |
| **Direct Numeric Input** | Precise positioning required for audio UIs | Low | Click property value, type exact number. Essential for pixel-perfect alignment audio developers expect. |
| **Keyboard Shortcuts** | Efficiency for power users | Low | Arrow keys for 1px nudge, Shift+arrow for 10px. Ctrl+Z/Y, Del, etc. Expected by developers. |
| **Export with Sensible IDs** | Generated code needs readable identifiers | Medium | Export `<div id="gain-knob">` not `<div id="element-47">`. Use component name as ID basis. Critical for JUCE integration. |

### Why These Differentiate

These features address pain points of hand-coding audio plugin UIs:

1. **Visual feedback** - See the UI immediately instead of compile-test-adjust cycle
2. **Speed** - Drag controls into place in seconds vs minutes of CSS positioning
3. **Alignment** - Snap/guides produce professional results without manual math
4. **Reuse** - Copy/paste controls faster than coding each one

Research shows [modern UI builders](https://emergent.sh/learn/best-ai-tools-for-ui-design) prioritize **instant visual feedback** and **production-ready code export**. For audio developers, the killer feature is: **design a UI in 5 minutes that would take 30 minutes to hand-code**.

## Anti-Features

Features to explicitly NOT build. Common in general-purpose design tools but wrong for this context.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Real-time Collaboration** | Single-user tool, adds massive complexity | Save/load JSON files. Use git for version control. Plugin developers work solo. |
| **Cloud Storage** | Local files + git is how developers work | Local filesystem only. Developers already have version control workflows. |
| **AI Generation** | Audio UIs need precise control, not AI guessing | Manual design with presets. Audio controls have specific ergonomics AI doesn't understand. |
| **Animation Timeline** | Overkill for static plugin UIs | Focus on layout/styling. Animations are code concern, not design concern for v1. |
| **Comments/Annotations** | Solo developer tool, not design review | Skip for v1. If needed later, keep minimal (not full collaboration infrastructure). |
| **Component Variants** | Over-engineering for v1 scope | Single version of each control type. Don't build design system tooling yet. |
| **Auto Layout / Constraints** | Responsive design not relevant for fixed-size plugin UIs | Absolute positioning only. Plugin UIs are fixed resolution (e.g., 800x600px). |
| **Design Tokens / Themes** | Premature for v1 | Hard-coded styling per control. Don't build theming infrastructure until proven need. |
| **Plugin Marketplace** | Feature creep | Built-in component library only. Don't create ecosystem before core tool works. |
| **Version History** | Git already does this | Single-file JSON save/load. Let developers use their existing VCS tools. |
| **Cross-Platform Export** | JUCE WebView2 is the target | Export HTML/CSS/JS for WebView2 only. Don't try to support native JUCE components. |

### Why These Are Anti-Features

These are common in **enterprise design tools** (Figma, Adobe XD) but wrong for this context:

1. **Single-user context** - Plugin developers work solo. Collaboration features add complexity with no user value.
2. **Local-first workflow** - Developers use git, prefer local files. Cloud features add security concerns and failure modes.
3. **Fixed-size canvases** - Plugin UIs are fixed resolution (unlike responsive web). No need for auto-layout complexity.
4. **Narrow scope** - Audio plugin UIs, not general web design. Domain-specific simplicity beats general-purpose features.

From [JUCE WebView research](https://juce.com/blog/juce-8-feature-overview-webview-uis/), developers value **simplicity** and **integration with existing workflows** over feature lists. Keep it focused.

## Feature Dependencies

Dependencies between features, informing phase structure:

```
Core Canvas Manipulation
├── Selection (required for everything)
├── Pan/Zoom (independent)
└── Drag & Drop (requires Selection)
    ├── Move/Resize (requires Drag & Drop)
    ├── Delete (requires Selection)
    └── Properties Panel (requires Selection)
        ├── Direct Numeric Input (extends Properties)
        └── Property Presets (extends Properties)

History
├── Undo/Redo (independent, but required before Save)
└── Save/Load (requires Undo/Redo for UX sanity)

Alignment
├── Snap to Grid (independent)
├── Smart Guides (independent)
└── Keyboard Shortcuts (enhances Move)

Output
└── Export (requires complete property system)
```

**Critical path for MVP:**
1. Canvas + Selection + Pan/Zoom (can see and select things)
2. Drag & Drop from Palette (can add controls)
3. Move/Resize + Properties (can position and configure)
4. Save/Load (can preserve work)
5. Export (can generate code)

**Enhancement path:**
6. Undo/Redo (reduces frustration)
7. Snap/Guides (improves alignment quality)
8. Copy/Paste/Duplicate (speeds up workflow)
9. Keyboard shortcuts (power user efficiency)
10. Live Preview (nice-to-have visual feedback)

## MVP Recommendation

For v1, prioritize features that enable the core workflow: **design → export → paste into JUCE**.

### Must Have (MVP Blockers)

1. **Canvas with Pan/Zoom** - Can work with different UI sizes
2. **Component Palette** - Drag knobs, sliders, buttons, meters onto canvas
3. **Selection + Move/Resize** - Position controls precisely
4. **Properties Panel** - Configure appearance (size, color, labels)
5. **Direct Numeric Input** - Set exact pixel positions (developers expect this)
6. **Save/Load JSON** - Don't lose work
7. **Export HTML/CSS/JS** - Generate code that works in JUCE WebView2
8. **Delete** - Remove unwanted controls

**Success criteria:** User can design a simple 3-knob plugin UI in 5 minutes and export working code.

### Should Have (High-Value, Lower Risk)

9. **Undo/Redo** - Experimentation without fear (high value, medium complexity)
10. **Snap to Grid** - Professional alignment (high value, low complexity)
11. **Copy/Paste** - Speed up repetitive work (high value, low complexity)
12. **Keyboard Shortcuts** - Arrow keys, Ctrl+Z/Y, Delete (medium value, low complexity)

### Could Have (Nice-to-Have)

13. **Smart Guides** - Dynamic alignment helpers (medium value, medium complexity)
14. **Property Presets** - "Small knob", "Large slider" templates (medium value, low complexity)
15. **Duplicate (Ctrl+D)** - Convenience over copy/paste (low value, low complexity)
16. **Live Preview** - Animated control preview (high value, high complexity)

### Defer to Post-MVP

17. **Component variants** - Multiple knob styles (wait for user demand)
18. **Themes** - Color scheme templates (premature optimization)
19. **Animation support** - Not critical for static UI design
20. **Multi-page projects** - Most plugins have single UI (wait for user request)

## Feature Complexity Assessment

| Feature | Complexity | Reasoning |
|---------|-----------|-----------|
| Canvas Pan/Zoom | Low | Well-established patterns, libraries like Konva handle this |
| Selection | Low | Click/marquee selection is standard DOM manipulation |
| Drag from Palette | Medium | Need to handle component instantiation, cursor feedback |
| Move/Resize | Medium | Drag handles, bounds checking, aspect ratio locking |
| Properties Panel | Medium | Form generation based on component type, value binding |
| Undo/Redo | Medium | Command pattern recommended (not image-based for memory reasons) |
| Save/Load JSON | Medium | Serialization straightforward, error handling critical |
| Export Code | High | Template generation, mapping visual properties to HTML/CSS/JS |
| Snap to Grid | Low | Rounding position to grid interval |
| Smart Guides | Medium | Collision detection, dynamic guide rendering |
| Live Preview | High | Simulating control behavior, event handling, visual updates |

## Domain-Specific Considerations

### Audio Plugin UI Constraints

Research on [audio plugin design tools](https://www.mathworks.com/help/audio/ug/plugin-gui-design.html) and [JUCE WebView](https://juce.com/blog/juce-8-feature-overview-webview-uis/) reveals:

1. **Fixed canvas size** - Plugin UIs are typically fixed resolution (800x600, 1200x800, etc.). No responsive design needed.
2. **Precise positioning** - Audio developers expect pixel-perfect control. Direct numeric input is table stakes.
3. **Grid-based layouts** - Control banks (8 knobs for EQ, 4 sliders for envelope) are common. Snap to grid is essential.
4. **SVG over raster** - Scalability for high-DPI displays. All components should be SVG-based.
5. **Clean code export** - Code needs readable IDs for JUCE integration. `gain-knob` not `element-47`.
6. **Minimal dependencies** - Developers value lightweight output. Don't export bloated CSS frameworks.

### User Workflow Pattern

Based on [audio plugin UI examples](https://dribbble.com/tags/audio-plugin) and [VST design patterns](https://vogerdesign.com/):

1. **Start with blank canvas** - Set size (e.g., 800x600)
2. **Add background** - Solid color or image
3. **Drag controls onto canvas** - Knobs, sliders, buttons from palette
4. **Arrange in grid** - Use snap to grid for alignment
5. **Configure properties** - Labels, colors, ranges
6. **Duplicate for banks** - Copy/paste for repeated controls
7. **Export code** - Generate HTML/CSS/JS
8. **Paste into JUCE project** - Integrate with WebView2

**Critical path optimization:** Every step should feel instant. No compile-test cycles. That's the whole value proposition.

## Competitive Analysis (Confidence: LOW)

Research found limited direct competitors for audio plugin UI design:

| Tool | Approach | Strengths | Gaps |
|------|----------|-----------|------|
| **MATLAB audioPluginInterface** | Code-based with GUI builder | Official support, grid layout | Not visual WYSIWYG |
| **Figma** | General-purpose design tool | Powerful, familiar | No audio component library, no JUCE export |
| **SynthEdit / FL SynthMaker** | Visual circuit design | Drag-and-drop DSP components | Circuit design, not UI design |
| **Hand-coding HTML/CSS** | Full control | Precise, no tool dependency | Slow, no visual feedback |

**Opportunity:** No tool specifically targets "visual design for JUCE WebView2 UIs". This tool fills that gap.

## Sources

### Design Tool Feature Research
- [Canva Software Overview 2026](https://www.softwareadvice.com/graphic-design/canva-profile/)
- [Canva's Creative Operating System](https://www.canva.com/newsroom/news/creative-operating-system/)
- [Figma product news & release notes](https://www.figma.com/release-notes/)
- [Canvas, Meet Code: Building Figma's Code Layers](https://www.figma.com/blog/building-figmas-code-layers/)
- [What Is Figma? A 2026 Guide for UI/UX Designers](https://verticalinstitute.com/blog/understanding-figma-for-design/)

### UI Builder Research
- [The 11 Best UI Design Tools to Try in 2026](https://www.uxdesigninstitute.com/blog/user-interface-ui-design-tools/)
- [6 Best AI Tools for UI Design That Actually Work in 2026](https://emergent.sh/learn/best-ai-tools-for-ui-design)
- [The 12 best internal tool builders in 2026](https://www.agentui.ai/en/blog/best-internal-tool-builders-2026/)

### Code Export Research
- [Google Stitch: Complete Guide to AI UI Design Tool (2026)](https://almcorp.com/blog/google-stitch-complete-guide-ai-ui-design-tool-2026/)
- [Top 10 Vibe Coding Tools Designers Will Love in 2026](https://www.toools.design/blog-posts/top-10-vibe-coding-tools-designers-will-love-in-2026)

### Canvas Manipulation Research
- [How to implement undo/redo on canvas with React? | Konva](https://konvajs.org/docs/react/Undo-Redo.html)
- [Canvas undo and redo functionality](https://codepen.io/abidibo/pen/kdRZjV)
- [Snap to grid and other helpful alignment tools in draw.io](https://www.drawio.com/blog/snap-to-grid)
- [Layout tools: rulers and guides, grids, and margins for precise layouts - Kittl Blog](https://www.kittl.com/blogs/layout-tools/)

### Property Panel Research
- [Studio Editor: Using the Inspector Panel | Wix.com](https://support.wix.com/en/article/studio-editor-using-the-inspector-panel)
- [Inspector Panel Video Tutorial | Editor X](https://www.wix.com/studio-tech-design/academyx3/lessons/inspector-panel)

### Audio Plugin UI Research
- [Design User Interface for Audio Plugin - MATLAB & Simulink](https://www.mathworks.com/help/audio/ug/plugin-gui-design.html)
- [JUCE 8 Feature Overview: WebView UIs](https://juce.com/blog/juce-8-feature-overview-webview-uis/)
- [Home Page - Voger Design](https://vogerdesign.com/)
- [Audio Plugin designs on Dribbble](https://dribbble.com/tags/audio-plugin)

### Project File Format Research
- [Save Project | Next Design User's Manual](https://www.nextdesign.app/support/documents/2.0/manual/en/docs/modeling-guide/new-project/save-a-project/)
- [Export project as JSON | Frontitude Guides](https://www.frontitude.com/guides/export-project-content-as-json)

### Domain-Specific Research
- [What Are The Best Tools To Develop VST Plugins & How Are They Made?](https://integraudio.com/best-tools-to-develop-vst-plugins/)
- [3D UI for Audio or VST Plugins - Voger Design](https://vogerdesign.com/blog/3d-ui-for-audio-or-vst-plugins/)

## Confidence Assessment

| Category | Confidence | Notes |
|----------|-----------|-------|
| Table Stakes | HIGH | Multiple sources confirm canvas manipulation, selection, save/load, export are universal expectations |
| Differentiators | MEDIUM | Based on developer workflows and audio plugin patterns, but limited direct competitor analysis |
| Anti-Features | MEDIUM | Strong evidence for local-first workflow and single-user context, but some assumptions about developer preferences |
| Domain Constraints | MEDIUM | JUCE WebView documentation is authoritative, but audio plugin UI patterns based on limited examples |
| Feature Complexity | MEDIUM | Complexity estimates based on web development knowledge and library availability, not implementation experience |

## Research Gaps

- **Limited audio plugin UI builder analysis** - Few tools specifically target this domain. Extrapolated from general design tool patterns.
- **No user interviews** - Feature priorities based on workflow analysis, not actual developer feedback.
- **JUCE WebView2 integration details** - Assumed HTML/CSS/JS export works, but haven't verified JUCE API specifics.
- **Component library scope** - 108-element taxonomy exists, but research didn't determine which subset is "MVP-critical".

## Next Steps for Phase-Specific Research

Future research needed:

1. **Export format research** - Deep dive into JUCE WebView2 API, communication patterns, optimal HTML/CSS/JS structure
2. **Component library prioritization** - Which controls are most common in audio plugins? Survey existing plugin UIs.
3. **Property schema** - What properties does each control type need? Knobs need min/max/default, sliders need orientation, etc.
4. **Canvas rendering libraries** - Compare Konva, Fabric.js, plain HTML5 Canvas for performance/features
