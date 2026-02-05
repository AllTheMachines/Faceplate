# Phase 60: Manual Structure & Getting Started - Research

**Researched:** 2026-02-06
**Domain:** Technical documentation / User manual authoring
**Confidence:** HIGH

## Summary

Phase 60 establishes the foundation for a comprehensive user manual by creating the index structure and complete getting started guide. Research reveals that Faceplate already has extensive technical documentation (FACEPLATE_DOCUMENTATION.md, ELEMENT_REFERENCE.md, STYLE_CREATION_MANUAL.md, JUCE_INTEGRATION.md) totaling ~178KB of content, plus an 11-screenshot tutorial workflow in docs/images/. The manual will consolidate and reorganize this for end-user consumption.

The application has a proven three-panel layout: LeftPanel (palette/assets/layers tabs with undo/redo), Canvas (central design area with WindowTabs below), and RightPanel (properties). Installation involves downloading a release ZIP, running `npm install && npm run dev`, then accessing http://localhost:5173. Public folder contains launcher scripts (start-windows.bat, start-mac.command) suggesting a future simplified launch workflow.

Industry-standard documentation structure follows the Diátaxis framework (tutorials, how-to, reference, explanation), with consistent formatting, logical progression from basic to advanced, visual aids, and screenshot placeholders for future capture.

**Primary recommendation:** Create docs/manual/ directory with README.md as master index linking all topic files across phases 60-65, using standardized markdown template with title, overview, step-by-step sections, and `![description](../images/filename.png)` screenshot placeholders. Getting started guide should follow tutorial structure: installation (Node.js prereq, npm commands), interface overview (three-panel layout with labeled screenshot), and quick start (palette → canvas → properties → preview workflow).

## Standard Stack

### Core Technologies (Existing Codebase)
| Technology | Version | Purpose | Documentation Context |
|------------|---------|---------|----------------------|
| Markdown | CommonMark | Documentation format | GitHub-flavored for compatibility |
| Screenshot placeholders | `![alt](path)` | Future image insertion | Descriptive filenames guide capture |
| docs/ folder | Existing | Documentation root | Already contains 15 technical docs |
| docs/images/ | Existing | Screenshot storage | Already has 11 style-creation screenshots |

### Documentation Framework
| Framework | Purpose | When to Use |
|-----------|---------|-------------|
| Diátaxis | Content organization | Classify topics: tutorial/how-to/reference/explanation |
| Linear progression | Tutorial structure | Getting started, quick start tutorials |
| Task-based sections | How-to guides | Feature-specific workflows |

**Installation:**
No installation required - this is a documentation-writing phase using standard markdown.

## Architecture Patterns

### Recommended Project Structure
```
docs/
├── manual/                         # NEW: User manual root
│   ├── README.md                   # Master index with TOC
│   ├── getting-started.md          # Phase 60: Installation, interface, tutorial
│   ├── canvas.md                   # Phase 61: Canvas interactions
│   ├── palette.md                  # Phase 61: Element palette
│   ├── properties.md               # Phase 62: Properties panel
│   ├── layers.md                   # Phase 62: Layers system
│   ├── windows.md                  # Phase 63: Multi-window
│   ├── assets.md                   # Phase 63: Asset library
│   ├── fonts.md                    # Phase 63: Font management
│   ├── styles.md                   # Phase 64: Element styles
│   ├── export.md                   # Phase 64: Export workflows
│   └── project-management.md       # Phase 65: Save/load, containers
├── images/                         # Screenshot storage
│   ├── (existing 11 style screenshots)
│   ├── interface-overview.png      # NEW: Three-panel layout labeled
│   ├── palette-drag-element.png    # NEW: Drag from palette
│   ├── canvas-selection.png        # NEW: Element selection
│   └── ...                         # More screenshots added in phases 61-65
├── FACEPLATE_DOCUMENTATION.md      # Existing: Comprehensive technical doc
├── ELEMENT_REFERENCE.md            # Existing: All 109 elements
├── STYLE_CREATION_MANUAL.md        # Existing: SVG workflow
├── JUCE_INTEGRATION.md             # Existing: C++ integration
└── ...                             # Other existing docs
```

### Pattern 1: Master Index (README.md)
**What:** Central table of contents linking all manual topics
**When to use:** First file created in Phase 60
**Example:**
```markdown
# Faceplate User Manual

Complete guide to designing audio plugin UIs with Faceplate.

## Table of Contents

### Getting Started
- [Installation & Setup](getting-started.md#installation)
- [Interface Overview](getting-started.md#interface-overview)
- [Quick Start Tutorial](getting-started.md#quick-start)

### Core Features
- [Canvas Interactions](canvas.md) — Drag, select, resize, pan, zoom
- [Element Palette](palette.md) — Browse, search, drag elements
- [Properties Panel](properties.md) — Configure element settings
- [Layers System](layers.md) — Organize with layers

### Advanced Features
- [Multi-Window Projects](windows.md) — Multiple UI windows
- [Asset Library](assets.md) — Import SVG graphics
- [Font Management](fonts.md) — Custom fonts
- [Element Styles](styles.md) — Custom SVG designs
- [Export](export.md) — JUCE bundle and browser preview

### Workflows
- [Project Management](project-management.md) — Save, load, templates
- [Style Creation Manual](../STYLE_CREATION_MANUAL.md) — Detailed SVG guide
- [JUCE Integration](../JUCE_INTEGRATION.md) — C++ setup

## Need Help?
- Press **F1** in Faceplate for contextual help
- Click **(?)** buttons on property sections
- See [Element Reference](../ELEMENT_REFERENCE.md) for all 109 elements
```

### Pattern 2: Topic File Template
**What:** Standardized structure for every manual topic
**When to use:** All topic files (getting-started.md, canvas.md, etc.)
**Example:**
```markdown
# Topic Title

**Overview paragraph**: Brief description of what this section covers and why it matters.

![Screenshot placeholder](../images/descriptive-filename.png)

## Section 1: Task Name

Step-by-step instructions:

1. **Action**: Description with keyboard shortcut if applicable (Ctrl+G)
2. **Action**: Next step
3. **Result**: What should happen

![Screenshot showing result](../images/action-result.png)

**Tip**: Additional context or best practice.

## Section 2: Next Task

...
```

### Pattern 3: Screenshot Placeholder Convention
**What:** Consistent markdown syntax for future screenshot insertion
**When to use:** Every visual reference in manual
**Example:**
```markdown
![Three-panel layout with palette, canvas, and properties labeled](../images/interface-overview.png)
![Dragging a knob from palette onto canvas](../images/palette-drag-knob.png)
![Element selected showing resize handles](../images/canvas-resize-handles.png)
```

**Naming convention:**
- `{area}-{action}-{subject}.png` — e.g., `canvas-drag-element.png`
- `{feature}-{state}.png` — e.g., `layers-panel-overview.png`
- `{workflow}-step-{n}.png` — e.g., `quick-start-step-1.png`

### Anti-Patterns to Avoid
- **No master index**: Manual with disconnected topic files → Hard to navigate
- **Inconsistent structure**: Different topic files with different formats → Confusing UX
- **Generic filenames**: `screenshot1.png`, `image2.png` → Unclear what to capture later
- **Code-focused docs**: Referencing React components, TypeScript types → User manual should be UI-focused
- **Missing prerequisites**: Tutorial assumes knowledge → State Node.js requirement upfront

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Documentation framework | Custom TOC generator | Simple markdown with links | Manual is small (10-12 files), plain markdown sufficient |
| Screenshot management | Image database | Filesystem with descriptive names | 20-40 screenshots manageable as files |
| Cross-references | Custom link system | Standard markdown `[text](path.md)` | GitHub renders correctly |
| Code examples | Embedded HTML/JS | Screenshot placeholders only | User manual, not developer docs |

**Key insight:** This is a user-facing manual, not API documentation. Simplicity beats tooling complexity.

## Common Pitfalls

### Pitfall 1: Documenting Implementation Instead of User Actions
**What goes wrong:** Describing React components, Zustand stores, TypeScript types in user manual
**Why it happens:** Researcher confuses developer docs with user docs
**How to avoid:**
- Focus on UI elements: "Click the Palette tab" not "LeftPanel component renders Palette"
- Describe user workflows: "Drag a knob onto the canvas" not "DragEndEvent creates a Knob element"
- Screenshot placeholders show UI, not code
**Warning signs:** Mentions of "component", "store", "slice", "hook" in manual text

### Pitfall 2: Missing the Existing Documentation Ecosystem
**What goes wrong:** Creating manual that duplicates or contradicts existing docs
**Why it happens:** Not auditing docs/ folder before writing
**How to avoid:**
- Audit: 15 existing docs totaling ~178KB, including comprehensive FACEPLATE_DOCUMENTATION.md
- Reference: Manual should LINK to technical docs (JUCE_INTEGRATION.md, STYLE_CREATION_MANUAL.md)
- Complement: Manual is user-facing tutorial/how-to, technical docs are reference/explanation
**Warning signs:** Rewriting JUCE integration steps instead of linking to JUCE_INTEGRATION.md

### Pitfall 3: Installation Instructions Assume Too Much
**What goes wrong:** "Run `npm run dev`" without explaining Node.js prerequisite
**Why it happens:** Developer knows environment, forgets user might not
**How to avoid:**
- Prerequisites section: List Node.js 18+, npm (comes with Node.js)
- Installation options: README.md shows two paths (download release, clone repo)
- Launcher scripts: Note public/start-windows.bat and start-mac.command for future simplified workflow
- Expected result: "Open http://localhost:5173 in your browser"
**Warning signs:** User feedback: "What's npm?" or "Command not found"

### Pitfall 4: Interface Overview Too Abstract
**What goes wrong:** Describing three-panel layout in text without labeled screenshot
**Why it happens:** Assuming visual layout is self-evident
**How to avoid:**
- Labeled screenshot placeholder: `![interface-overview.png](../images/interface-overview.png)` with annotations
- Panel names: LeftPanel (not "sidebar"), Canvas (not "main area"), RightPanel (not "properties sidebar")
- Panel contents: LeftPanel has tabs (Elements, Assets, Layers), RightPanel shows properties for selected element
- Navigation: WindowTabs appear below canvas for multi-window projects
**Warning signs:** User can't find where to start or which panel does what

### Pitfall 5: Quick Start Tutorial Skips Critical Steps
**What goes wrong:** "Place a knob and configure it" without explaining selection, properties panel, parameter binding
**Why it happens:** Tutorial writer assumes "obvious" steps
**How to avoid:**
- Complete workflow: Palette tab → Drag knob → Canvas shows element → Click to select → Properties panel appears → Set parameterId → Preview
- Visual confirmations: "You should see resize handles" after selection
- Parameter binding: Explain parameterId is how JUCE connects UI to audio processing
- Preview: Show browser preview OR mention JUCE integration is separate topic
**Warning signs:** User doesn't see properties panel or doesn't understand parameterId

## Code Examples

No code examples needed — this is a documentation-authoring phase. However, here are markdown formatting patterns:

### Screenshot Placeholder Pattern
```markdown
![Description of what screenshot should show](../images/descriptive-filename.png)
```

### Keyboard Shortcut Pattern
```markdown
Press **Ctrl+G** to toggle snap grid.
Use **Shift+Arrow** keys to nudge 10px.
```

### Step-by-Step Pattern
```markdown
1. **Open the Palette tab** in the left panel
2. **Drag a Knob** onto the canvas
3. **Click the knob** to select it (resize handles appear)
4. **Set the parameterId** in the Properties panel to `"gain"`
```

### Cross-Reference Pattern
```markdown
See [Element Styles](styles.md) for custom SVG designs.
For C++ integration, consult [JUCE Integration Guide](../JUCE_INTEGRATION.md).
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single comprehensive doc | Modular topic-based manual | Phase 60 (now) | Easier navigation, focused topics |
| Code-heavy documentation | User-facing screenshots + text | Phase 60 (now) | Accessible to non-developers |
| Technical reference only | Tutorial + How-to + Reference | Phase 60 (now) | Supports learning progression |

**Deprecated/outdated:**
- WORKFLOW.md: Workflow-focused, but predates layers/help system — Phase 65 should update or deprecate
- README.md "How to Use": Brief summary — Manual will be comprehensive version

## Existing Documentation Audit

**Technical Documentation (Keep, Link From Manual):**
- FACEPLATE_DOCUMENTATION.md (72KB) — Comprehensive technical spec, architecture, feature list
- ELEMENT_REFERENCE.md (32KB) — All 109 elements with properties and export format
- STYLE_CREATION_MANUAL.md (9KB) — SVG layer naming and import workflow
- JUCE_INTEGRATION.md (16KB) — C++ WebView2 setup and parameter sync
- EXPORT_FORMAT.md (25KB) — Export bundle structure
- INTEGRATION_GUIDE.md (13KB) — JUCE integration quick start

**User-Facing (Audit for Manual Content):**
- README.md — Installation, quick start (5 steps), keyboard shortcuts, features list
- WORKFLOW.md — VST3 development workflow (template-based)
- BEST_PRACTICES.md (12KB) — Design guidelines

**Developer/Internal:**
- JUCE_PATTERN.md, GENERATE_UI_SKILL.md, CLAUDE_CHROME_TESTING.md — Internal dev docs

**Screenshot Assets:**
- docs/images/ contains 11 screenshots for style creation workflow (01-element-selected.png through 11-remap-button.png)

**Manual Topics Needed (From Phases 60-65):**
1. **Getting Started** (Phase 60) — Installation, interface overview, quick tutorial
2. **Canvas** (Phase 61) — Drag-drop, selection, manipulation, snap, zoom
3. **Element Palette** (Phase 61) — Categories, search, Pro badges
4. **Properties Panel** (Phase 62) — Common props, element-specific, parameter binding, help buttons
5. **Layers System** (Phase 62) — Create, visibility, lock, z-order, move between layers
6. **Multi-Window** (Phase 63) — Create windows, types (release/developer), navigation
7. **Asset Library** (Phase 63) — Import SVG, categories, drag to canvas
8. **Font Management** (Phase 63) — Built-in vs custom, folder selection, export bundling
9. **Element Styles** (Phase 64) — Create from SVG, layer mapping, apply, color overrides
10. **Export System** (Phase 64) — JUCE bundle, browser preview, folder/ZIP, Pro blocking
11. **Project Management** (Phase 65) — Save/load, unsaved changes protection, container editing, template import

**Cross-Reference Strategy:**
- Manual focuses on UI workflows and tutorials
- Manual links to technical docs for implementation details:
  - "For C++ integration, see [JUCE Integration Guide](../JUCE_INTEGRATION.md)"
  - "For detailed SVG layer naming conventions, see [Style Creation Manual](../STYLE_CREATION_MANUAL.md)"
  - "For complete element properties, see [Element Reference](../ELEMENT_REFERENCE.md)"

## Application Structure Analysis

### Three-Panel Layout
**Source:** `src/components/Layout/ThreePanelLayout.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │  LeftPanel  │  │       Canvas        │  │   RightPanel    │ │
│  │   (250px)   │  │   (flex-grow: 1)    │  │     (300px)     │ │
│  │             │  │                     │  │                 │ │
│  │  [Tabs:]    │  │  <CanvasStage />    │  │  Properties for │ │
│  │  • Elements │  │                     │  │  selected elem  │ │
│  │  • Assets   │  │                     │  │                 │ │
│  │  • Layers   │  │  ┌───────────────┐  │  │  Window props   │ │
│  │             │  │  │ WindowTabs    │  │  │                 │ │
│  │  Undo/Redo  │  │  └───────────────┘  │  │  Export/Save    │ │
│  └─────────────┘  └─────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**LeftPanel contents:**
- Header: "Faceplate / VST3 UI Designer / Last saved: X ago"
- Undo/Redo buttons (Ctrl+Z, Ctrl+Y)
- Tab bar: Elements | Assets | Layers
  - Elements tab: `<Palette />` component with element categories
  - Assets tab: `<AssetLibraryPanel />` for SVG asset management
  - Layers tab: `<LayersPanel />` for layer organization

**Canvas area:**
- Main design surface (`<CanvasStage />` using Konva.js)
- Window tabs bar below canvas (`<WindowTabs />` for multi-window projects)
- Optional bottom panel for undo/redo history (Ctrl+Shift+H)

**RightPanel contents:**
- Properties panel for selected element
- Window properties when no element selected
- Export/Save controls

### Installation Workflow
**From README.md and package.json:**

**Option 1: Release Download (User-facing)**
1. Download ZIP from GitHub Releases
2. Extract ZIP
3. Open terminal in extracted folder
4. Run: `npm install`
5. Run: `npm run dev`
6. Open http://localhost:5173

**Option 2: Git Clone (Developer-facing)**
1. `git clone https://github.com/AllTheMachines/Faceplate.git`
2. `cd Faceplate`
3. `npm install`
4. `npm run dev`
5. Open http://localhost:5173

**Prerequisites:**
- Node.js 18 or later
- npm (comes with Node.js)

**Future: Simplified Launcher (exists but not documented yet)**
- `public/start-windows.bat` — Double-click launcher for Windows (tries Python, then Node.js)
- `public/start-mac.command` — Double-click launcher for macOS (chmod +x required)
- These are fallback methods if user doesn't have Node.js (uses Python http.server or npx serve)

### Quick Start Tutorial Structure (Recommended)

**From README.md "How to Use" section:**
1. Start a Project: Load existing JSON or select template
2. Add Elements: Drag from palette → canvas (Ctrl+G for snap grid)
3. Configure Properties: Click element → use Properties panel → set parameterId → F1 for help
4. Organize with Layers: Create layers, toggle visibility (eye), lock, drag to reorder
5. Export to JUCE: Click Export → JUCE Bundle → select folder
6. Integrate: Copy files to JUCE project WebView folder, bind parameters

**Tutorial should walk through:**
- Starting with blank canvas or template
- Adding first element (knob recommended — most common control)
- Selecting element (click → resize handles appear)
- Configuring in Properties panel (name, parameterId, colors)
- Previewing (browser preview mode)

## Open Questions

1. **Screenshot Capture Workflow**
   - What we know: docs/images/ exists with 11 style-creation screenshots
   - What's unclear: Who captures remaining ~30 screenshots? Phase 60 creates placeholders only
   - Recommendation: Placeholders in Phase 60, actual screenshots in separate "Screenshot Capture" task or milestone

2. **README.md TOC Completeness**
   - What we know: Phases 60-65 create 11 topic files
   - What's unclear: Should README.md TOC list all sections within topics, or just topic files?
   - Recommendation: List topic files only, each topic has its own internal TOC with markdown headers

3. **Existing Doc Update Scope**
   - What we know: Phase 65 updates FACEPLATE_DOCUMENTATION.md, ELEMENT_REFERENCE.md, STYLE_CREATION_MANUAL.md
   - What's unclear: Deprecate WORKFLOW.md or update it?
   - Recommendation: Phase 65 can decide based on content overlap

4. **Template Import Documentation**
   - What we know: templates/ folder has effect-starter.json, instrument-starter.json
   - What's unclear: How template import works in UI (couldn't find TemplateImporter usage in quick audit)
   - Recommendation: Research in Phase 65 when documenting project management

## Sources

### Primary (HIGH confidence)
- Codebase analysis: src/App.tsx, src/components/Layout/*.tsx (application structure, three-panel layout)
- Existing documentation: docs/FACEPLATE_DOCUMENTATION.md, docs/ELEMENT_REFERENCE.md, docs/STYLE_CREATION_MANUAL.md, docs/README.md (feature inventory, installation steps)
- Package.json: Scripts (`npm run dev`), dependencies, version (0.9.5)
- docs/images/: 11 existing screenshots confirm screenshot placeholder strategy

### Secondary (MEDIUM confidence)
- [Atlassian: Software Documentation Best Practices](https://www.atlassian.com/blog/loom/software-documentation-best-practices) — Logical organization, visual aids, regular updates
- [GitBook: Documentation Structure Tips](https://gitbook.com/docs/guides/docs-best-practices/documentation-structure-tips) — Diátaxis framework, consistent formatting
- [DigitalOcean: Technical Writing Guidelines](https://www.digitalocean.com/community/tutorials/digitalocean-s-technical-writing-guidelines) — Tutorial structure (intro, prerequisites, steps, conclusion)
- [Write the Docs: Software Documentation Guide](https://www.writethedocs.org/guide/index.html) — Audience awareness, tutorial vs reference vs how-to

### Tertiary (LOW confidence)
- None — all findings verified against codebase or authoritative documentation sources

## Metadata

**Confidence breakdown:**
- Manual structure: HIGH — Industry-standard practices confirmed across multiple sources, existing docs folder proves feasibility
- Application features: HIGH — Directly analyzed codebase components and existing documentation
- Installation workflow: HIGH — Verified in README.md and package.json
- Screenshot strategy: HIGH — docs/images/ with 11 existing screenshots proves pattern works

**Research date:** 2026-02-06
**Valid until:** 60 days (documentation best practices stable, codebase structure stable for v0.11.0 milestone)
