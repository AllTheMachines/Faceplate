# Faceplate User Manual

Complete guide to designing audio plugin UIs with Faceplate. This manual covers everything from installation to exporting production-ready JUCE WebView2 bundles.

> **Note on Screenshots:** Throughout this manual, screenshot placeholders use the format `![description](../images/filename.png)` with descriptive filenames indicating what to capture. Screenshots will be added during the documentation finalization phase.

## Table of Contents

### Getting Started

- [Installation and Setup](getting-started.md#installation) -- Installing Node.js, running the dev server
- [Interface Overview](getting-started.md#interface-overview) -- Three-panel layout walkthrough
- [Quick Start Tutorial](getting-started.md#quick-start) -- Place a knob, configure it, preview

### Core Features

- [Canvas](canvas.md) -- Drag-drop, selection, resize, copy/paste, undo/redo, snap grid, pan/zoom
- [Element Palette](palette.md) -- Browse categories, search elements, Pro badges
- [Properties Panel](properties.md) -- Common properties, element-specific settings, parameter binding
- [Layers](layers.md) -- Create layers, visibility, locking, z-order, move elements between layers

### Advanced Features

- [Multi-Window Projects](windows.md) -- Create windows, release vs developer types, navigation
- [Asset Library](assets.md) -- Import SVG graphics, organize, drag to canvas
- [Font Management](fonts.md) -- Built-in and custom fonts, folder selection, export bundling
- [Element Styles](styles.md) -- Custom SVG designs, layer mapping, color overrides
- [Export](export.md) -- JUCE WebView2 bundle, browser preview, folder/ZIP options

### Workflows

- [Project Management](project-management.md) -- Save/load, unsaved changes, containers, templates

### Reference

- [Element Reference](../ELEMENT_REFERENCE.md) -- All 109 element types with properties
- [Style Creation Manual](../STYLE_CREATION_MANUAL.md) -- SVG layer naming and import workflow
- [JUCE Integration Guide](../JUCE_INTEGRATION.md) -- C++ WebView2 setup and parameter sync
- [Export Format Reference](../EXPORT_FORMAT.md) -- Bundle structure details

## Quick Help

- Press **F1** in Faceplate for contextual help
- Click **(?)** buttons on property panel sections for section-specific help
- See [Element Reference](../ELEMENT_REFERENCE.md) for complete element property listings
