# Phase 63: Windows, Assets & Fonts - Research

**Researched:** 2026-02-06
**Domain:** Technical documentation (multi-window systems, asset management, font loading)
**Confidence:** HIGH

## Summary

This phase documents three interconnected features in the Faceplate user interface designer: the multi-window system for creating separate plugin windows, the asset library for SVG import and organization, and the font management system that bridges browser APIs with JUCE WebView2 export.

The research reveals that all three features are fully implemented in the codebase with clear patterns:
- Multi-window system uses Zustand state management with window tabs UI
- Asset library uses File System Access API for directory selection and DOMPurify for SVG sanitization
- Font system uses File System Access API for folder selection, IndexedDB for storage, and generates base64 or file references for export

**Primary recommendation:** Follow the reference-style documentation format established in phases 60-62, focusing on feature explanation over step-by-step tutorials. Keep technical context light but mention JUCE WebView2 terms where relevant since the audience is VST3 developers.

## Standard Stack

The implemented features use modern browser APIs and established libraries.

### Core Technologies
| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| File System Access API | Native | Directory/file picker for fonts and assets | Modern browser API for folder access with permission persistence |
| IndexedDB | Native | Font file storage | Browser-native persistent storage, suitable for binary data |
| DOMPurify | isomorphic-dompurify | SVG sanitization | Industry-standard XSS protection library |
| React Dropzone | - | SVG file upload | Standard drag-drop file upload component |
| Zustand | - | Window state management | Already used throughout the application |

### Supporting
| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| FontFace API | Native | Loading fonts into document | For custom font preview in dropdowns |
| date-fns | - | Timestamp formatting | "Last scan" display in font settings |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| File System Access API | Input file upload | File System Access API provides persistent directory handles, better UX for folders |
| DOMPurify | Manual SVG parsing | DOMPurify is battle-tested, manual parsing would miss edge cases |
| IndexedDB | LocalStorage | IndexedDB handles binary data efficiently, LocalStorage has size limits |

**Implementation Context:**
All features are already implemented. This phase is DOCUMENTATION ONLY -- no code changes, just writing three topic files (windows.md, assets.md, fonts.md) following the patterns established in phases 60-62.

## Architecture Patterns

### Documentation Structure Pattern

Based on existing manual files (canvas.md, layers.md, properties.md), the established pattern is:

```markdown
# Feature Name

Brief introduction explaining what the feature is and why it's useful.

![Overview screenshot](../images/feature-overview.png)

## Section 1: Core Concept

Explanation with inline screenshot placeholders at key points.

## Section 2: Common Operations

Reference-style explanation (not step-by-step) with code examples where relevant.

## Section 3: Advanced Usage

Technical details, edge cases, tips.
```

### Multi-Window Documentation Pattern

**Structure from windowsSlice.ts:**
- Windows have `type: 'release' | 'developer'`
- Release windows export, developer windows don't
- Window properties: name, width, height, backgroundColor, backgroundType
- Elements belong to windows via `elementIds` array
- Window tabs UI component handles switching, rename, duplicate, delete

**Key user-facing concepts to document:**
1. Window types explained by use case (release = shipped UI, developer = testing)
2. Creating/duplicating/deleting windows via tabs UI
3. Window properties panel (appears when no element selected)
4. Button navigation action (targetWindowId property)
5. Cross-window copy/paste (brief mention)

### Asset Library Documentation Pattern

**Structure from asset types and ImportAssetDialog:**
- Assets stored with: id, name, svgContent, categories[], fileSize, elementCount
- Default categories: 'logo', 'icon', 'decoration', 'background'
- Import validation checks file size and SVG validity
- Sanitization happens automatically via DOMPurify
- Drag-to-canvas creates SVG Graphic element

**Key user-facing concepts to document:**
1. Asset library overview (left panel Assets tab)
2. SVG import workflow (upload dialog, validation, preview)
3. Categories (assigned during import, used for organization)
4. Drag-to-canvas workflow (brief paragraph)
5. SVG security (one-sentence mention of sanitization)

### Font Management Documentation Pattern

**Structure from fontManager.ts and FontSettings:**
- Built-in fonts from fontRegistry.ts (bundled with app)
- Custom fonts from user-selected directory via File System Access API
- Font storage in IndexedDB with metadata
- Fonts loaded into document.fonts for dropdown preview
- Export generates base64 @font-face for custom, file refs for built-in

**Key user-facing concepts to document:**
1. Built-in vs custom fonts distinction
2. Font folder selection workflow (Settings dialog)
3. Font preview in dropdowns
4. Export bundling implications (base64 for custom = larger bundles)

### Screenshot Placeholder Pattern

From existing manual files:

```markdown
![Clear description of what screenshot shows](../images/descriptive-filename.png)
```

**Best practices identified:**
- Descriptive filenames that indicate content: `layers-create-layer.png`, `canvas-drag-drop.png`
- Alt text describes the screenshot content: "Creating a new layer with name and color selection"
- Screenshots placed after explanatory text, before detailed notes
- Key screens only (2-3 per topic file per CONTEXT.md decision)

## Don't Hand-Roll

Problems that have existing solutions in this documentation phase:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Screenshot capture workflow | Custom screenshot tooling | Placeholder format with phase 66 batch capture | Consistent across all manual files, deferred to dedicated phase |
| Cross-referencing between docs | Manual link maintenance | Minimal cross-references, self-contained files | CONTEXT.md specifies minimal cross-refs to avoid confusion |
| Technical terminology definitions | Inline definitions everywhere | Light technical context with JUCE terms | Target audience is VST3 developers, already familiar |

**Key insight:** This is a documentation-only phase. The code already exists and works correctly. Don't propose code changes or "improvements" -- only document what exists.

## Common Pitfalls

### Pitfall 1: Over-Explaining Existing Features
**What goes wrong:** Writer documents details already covered in other topic files (e.g., re-explaining element selection in windows.md)
**Why it happens:** Impulse to be comprehensive leads to duplication
**How to avoid:** Keep each file self-contained but assume reader has read Getting Started; link to other topics for deep dives
**Warning signs:** Repeating canvas manipulation steps, re-explaining Properties panel basics

### Pitfall 2: Tutorial Format for Reference Content
**What goes wrong:** Numbered steps for every operation, even intuitive ones
**Why it happens:** Misunderstanding CONTEXT.md's "step-by-step tutorial" specification (only for button navigation action)
**How to avoid:** CONTEXT.md specifies reference-style organization for the three sections. Only button navigation gets numbered steps
**Warning signs:** Numbered lists for drag-to-canvas (should be brief paragraph), numbered steps for font folder selection (should be minimal prose)

### Pitfall 3: Leading with Implementation Details
**What goes wrong:** Starting with "When you export, release windows are included and developer windows are skipped..."
**Why it happens:** Writer knows the technical implementation and leads with it
**How to avoid:** CONTEXT.md explicitly says "Do NOT lead with export implementation details -- keep it user-focused"
**Warning signs:** Mentioning export before explaining use cases, technical jargon before practical benefits

### Pitfall 4: Documenting Error Messages
**What goes wrong:** Creating separate sections for import validation errors, file size limits, etc.
**Why it happens:** Desire to be complete and help users troubleshoot
**How to avoid:** CONTEXT.md specifies "Import validation errors NOT documented separately -- error messages are self-explanatory"
**Warning signs:** Dedicated "Troubleshooting" sections, error code listings, validation rule tables

### Pitfall 5: Ignoring Established Patterns
**What goes wrong:** Creating new documentation structures instead of following existing manual files
**Why it happens:** Writer hasn't thoroughly reviewed phases 60-62 documentation
**How to avoid:** Read canvas.md, layers.md, properties.md first; match their voice, structure, and screenshot placement
**Warning signs:** Different heading hierarchy, inconsistent screenshot format, different tone/voice

## Code Examples

Since this is a documentation-only phase, "code examples" are actually documentation snippets showing the established patterns.

### Window Type Context Menu Pattern
```markdown
Right-click a window tab to access:
- **Rename** -- Change the window name
- **Duplicate** -- Create a copy of the window (elements not copied)
- **Delete** -- Remove the window and all its elements
- **Set as Release** -- Include this window in exports
- **Set as Developer** -- Exclude this window from exports (for testing)
```

### Button Navigation Example
```markdown
Configure a button to switch between windows:

1. Select the button element on the canvas
2. In the Properties panel, find the **Action** dropdown
3. Select **Navigate to Window**
4. A **Target Window** dropdown appears below
5. Select which window to navigate to when the button is clicked
```

### Font Folder Selection Pattern
```markdown
To add custom fonts:

1. Click the settings icon (⚙️) in the top toolbar
2. Select **Font Settings** from the menu
3. Click **Select Fonts Folder**
4. Choose a folder containing .ttf, .otf, .woff, or .woff2 files
5. Faceplate scans the folder and loads the fonts
6. Custom fonts appear at the bottom of all font dropdowns
```

### SVG Security Brief Mention
```markdown
Faceplate automatically sanitizes imported SVGs to remove potentially unsafe content like scripts and event handlers. This ensures your exported JUCE WebView2 bundle is secure.
```

### Asset Import Flow Pattern
```markdown
Import custom SVG graphics to use in your designs:

1. Click the **Assets** tab in the left panel
2. Click the **+ Import** button at the top
3. Drop an SVG file or click to browse
4. Preview the graphic and assign categories (logo, icon, decoration, background)
5. Click **Import** to add it to your library
6. Drag the asset from the library onto the canvas to place it as an SVG Graphic element
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Input file upload | File System Access API | ~2021-2022 | Persistent directory handles, better multi-file workflows |
| Manual SVG parsing | DOMPurify sanitization | Project inception | Security-first approach prevents XSS vulnerabilities |
| Font file references only | Base64 embedding for custom fonts | Phase 32 (font system implementation) | Self-contained exports, no external font file dependencies |

**Current state:**
- File System Access API supported in Chromium browsers (Chrome, Edge), not Firefox/Safari
- Target users run Faceplate locally in Chrome-based browsers, so API compatibility not a concern
- DOMPurify is actively maintained and follows OWASP XSS prevention guidelines
- IndexedDB for font storage is standard practice for binary data in web apps

**Deprecated/outdated:**
- N/A -- all implemented features use current best practices

## Open Questions

Things that couldn't be fully resolved:

1. **Screenshot content and framing decisions**
   - What we know: CONTEXT.md specifies 2-3 screenshots per topic file; existing manual shows clear screenshot placeholder pattern
   - What's unclear: Exact UI state to capture (which tabs open, which elements selected, etc.)
   - Recommendation: Write screenshot placeholders with descriptive filenames; phase 66 (Screenshot Capture) will finalize exact frames

2. **Built-in vs custom font explanation approach**
   - What we know: CONTEXT.md marks this as "Claude's discretion"
   - What's unclear: Side-by-side comparison table vs sequential explanation
   - Recommendation: Sequential explanation (built-in first, then custom) matches natural user progression and learning flow

3. **Tips/notes callouts vs flat prose**
   - What we know: CONTEXT.md marks this as "Claude's discretion"
   - What's unclear: Whether to use blockquotes or other Markdown formatting for tips
   - Recommendation: Flat prose with **bold** for emphasis matches existing manual style (canvas.md, layers.md use minimal formatting)

## Sources

### Primary (HIGH confidence)
- Codebase files (windowsSlice.ts, fontManager.ts, ImportAssetDialog.tsx, asset.ts)
  - Window system implementation: types, state management, tab UI
  - Font system implementation: File System Access API, IndexedDB storage, FontFace loading
  - Asset system implementation: SVG validation, DOMPurify sanitization, categories
- Existing manual files (getting-started.md, canvas.md, layers.md, properties.md)
  - Documentation structure pattern
  - Screenshot placeholder format
  - Reference vs tutorial style
  - Voice and tone consistency
- CONTEXT.md from phase 63 (user decisions from /gsd:discuss-phase)
  - Feature-oriented organization
  - Screenshot placement guidelines
  - What NOT to document (error messages, validation details)
  - User-focused explanations over implementation details

### Secondary (MEDIUM confidence)
- [MDN: File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) -- Official API documentation
- [MDN: showDirectoryPicker()](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker) -- Directory selection API
- [Chrome Developers: File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access) -- Implementation guide
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) -- Official library documentation
- [SVG Security Best Practices (SVG Genie)](https://www.svggenie.com/blog/svg-security-best-practices) -- Industry guidance on sanitization

### Tertiary (LOW confidence)
- [Technical Documentation Best Practices (Whatfix)](https://whatfix.com/blog/types-of-technical-documentation/) -- General documentation guidance
- [Screenshot Guidelines (Rackspace)](https://docs.rackspace.com/docs/style-guide/screenshots/screenshot-guidelines) -- Screenshot best practices
- [Screenshot Placement (LaunchBrightly)](https://launchbrightly.com/blog/screenshots-before-or-after-text-in-documentation/) -- Text-before-screenshot pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All technologies verified in codebase, all features fully implemented
- Architecture: HIGH - Clear patterns established in phases 60-62, CONTEXT.md provides explicit guidance
- Pitfalls: HIGH - Common documentation mistakes identified from CONTEXT.md constraints and existing manual style
- Code examples: HIGH - All examples drawn from actual implementation and existing documentation patterns

**Research date:** 2026-02-06
**Valid until:** ~2026-03-06 (30 days, stable domain)

**Key constraints from CONTEXT.md:**
- Feature-oriented organization (not task-oriented)
- User-focused explanations (not export-implementation-first)
- Minimal cross-references (keep each file self-contained)
- Brief SVG security mention (not technical deep dive)
- Screenshot placeholders for key screens only (2-3 per file)
- Reference-style format (not step-by-step) EXCEPT button navigation action

**Planner dependencies:**
This research enables planning for three topic file creation tasks:
1. docs/manual/windows.md -- Multi-window system
2. docs/manual/assets.md -- Asset library and SVG import
3. docs/manual/fonts.md -- Font management and bundling
