# Phase 65: Project Management & Docs Update - Research

**Researched:** 2026-02-06
**Domain:** Technical documentation (markdown), documentation maintenance, reference vs tutorial formats
**Confidence:** HIGH

## Summary

This phase documents project management features (save/load, unsaved changes, container editing, template import) and updates existing documentation files to current version (v0.11.0). The domain is documentation best practices for technical software manuals, specifically the distinction between reference documentation and user-friendly tutorial/guide documentation.

Research reveals that modern documentation (2026) follows the Diátaxis framework: four distinct types (tutorials, how-to guides, technical reference, explanation) each serving different needs. The manual topic files are "how-to guides" (task-oriented, reference-first descriptions) while existing docs like ELEMENT_REFERENCE.md are "technical reference" (comprehensive lookup tables).

Key findings:
- Reference vs tutorial documentation have fundamentally different purposes and structures
- Minimal diff editing preserves existing text quality and reduces review burden
- Cross-referencing strategy prevents duplication: manual files summarize + link to detailed docs
- Documentation maintenance best practice: update docs alongside code changes, quarterly deep reviews
- Markdown best practices: consistent heading hierarchy (max 3 levels preferred), structured tables, clear image alt text

**Primary recommendation:** Write project-management.md as a reference-first "how-to guide" with brief feature descriptions and links to detailed docs. Update existing docs with minimal diff approach (change only what's necessary). Use consistent cross-referencing to tie manual and reference docs together without duplication.

## Standard Stack

Documentation for this project uses standard markdown with specific conventions already established in the codebase.

### Core Tools
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | CommonMark | All documentation files | Universal, version-controllable, readable as plain text |
| Git | Any | Version control for docs | Tracks changes, enables collaborative editing, integrates with development workflow |
| Screenshot placeholders | N/A | Image references | Established pattern: `![description](../images/filename.png)` |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Tables | Markdown | Structured data | Property references, feature comparisons, keyboard shortcuts |
| Code blocks | Markdown with language tags | Examples | TypeScript interfaces, bash commands, HTML exports |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown | AsciiDoc or reStructuredText | More features but less universal, steeper learning curve |
| Manual file structure | Single comprehensive manual | Smaller files are more maintainable but require cross-linking strategy |

**No installation required** - Markdown files are plain text, viewable in any editor or on GitHub.

## Architecture Patterns

### Documentation Structure (Existing)

The project already has an established documentation architecture:

```
docs/
├── FACEPLATE_DOCUMENTATION.md       # Comprehensive reference (description, spec, manual)
├── ELEMENT_REFERENCE.md             # Technical reference for all 109 elements
├── STYLE_CREATION_MANUAL.md         # How-to guide for SVG style creation
├── JUCE_INTEGRATION.md              # Developer integration guide
├── EXPORT_FORMAT.md                 # Technical specification
└── manual/
    ├── README.md                    # Master index / table of contents
    ├── getting-started.md           # Tutorial for new users
    ├── canvas.md                    # Canvas interaction how-to
    ├── palette.md                   # Element palette how-to
    ├── properties.md                # Properties panel how-to
    ├── layers.md                    # Layer system how-to
    ├── windows.md                   # Multi-window how-to
    ├── assets.md                    # Asset library how-to
    ├── fonts.md                     # Font management how-to
    ├── styles.md                    # Element styles how-to
    ├── export.md                    # Export system how-to
    └── project-management.md        # (NEW) Project management how-to
```

**Purpose separation:**
- **manual/*.md** = User-friendly how-to guides (task-oriented, reference-first)
- **docs/*.md** (root level) = Technical reference or comprehensive documentation

### Pattern 1: Reference-First How-To Guide

**What:** Feature documentation organized by topic, not step-by-step tutorial. Brief descriptions that answer "what is this?" and "how do I use it?" with links to detailed references.

**When to use:** Manual topic files (project-management.md follows this pattern)

**Example:**
```markdown
## Save and Load Projects

Projects are saved as JSON files that capture your entire design state including elements, windows, layers, assets, and styles.

**To save:** File > Save Project (or Ctrl+S)

**To load:** File > Load Project - select a `.json` file exported from Faceplate

**Unsaved changes protection:** Faceplate displays an asterisk (*) in the title when you have unsaved changes and shows "Last saved: [time]" in the left panel. The browser warns you before closing if changes are unsaved.

See [FACEPLATE_DOCUMENTATION.md](../FACEPLATE_DOCUMENTATION.md#project-persistence) for the JSON schema and technical details.
```

**Source:** Based on existing manual files (canvas.md, palette.md) which follow this reference-first pattern.

### Pattern 2: Technical Reference Table

**What:** Comprehensive property listings in table format with columns for property name, type, default value, and description.

**When to use:** ELEMENT_REFERENCE.md, technical specifications

**Example from ELEMENT_REFERENCE.md:**
```markdown
#### knob

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `diameter` | number | 80 | Knob size in pixels |
| `min` | number | 0 | Minimum value |
| `max` | number | 1 | Maximum value |
```

**Source:** D:\___ATM\vst3-webview-ui-designer\docs\ELEMENT_REFERENCE.md lines 52-60

### Pattern 3: Cross-Referencing Strategy

**What:** Manual files provide summaries with links to canonical documentation. Avoids duplication while maintaining user-friendly flow.

**When to use:** Any time manual content overlaps with existing detailed docs

**Example:**
```markdown
## Container Editing

Containers (Panel, Frame, Group Box, Collapsible, Window Chrome) can hold child elements. Use the **Edit Contents** button in the Properties panel to edit a container's children in an isolated view.

**Features:**
- Breadcrumb navigation for nested containers
- Isolated canvas showing only container children
- Containers support overflow scrollbars when content exceeds bounds

See [Canvas](canvas.md#container-editing) for the full editing workflow and keyboard shortcuts.
```

**Source:** User decision from CONTEXT.md - "brief overview paragraph + link to canvas.md (or wherever the full walkthrough lives)"

### Pattern 4: Minimal Diff Editing

**What:** When updating existing documentation, change only what's necessary. Preserve existing prose, structure, and formatting unless it's incorrect or outdated.

**When to use:** Updating FACEPLATE_DOCUMENTATION.md, ELEMENT_REFERENCE.md, STYLE_CREATION_MANUAL.md

**Example - Before:**
```markdown
| Category | Count | Description |
|----------|-------|-------------|
| [Controls](#controls) | 27 | Interactive input elements (knobs, sliders, buttons) |
```

**Example - After (adding styleId):**
```markdown
| Category | Count | Description |
|----------|-------|-------------|
| [Controls](#controls) | 27 | Interactive input elements (knobs, sliders, buttons) |

... [later in file]

#### knob
Standard rotary knob with arc display. Supports custom SVG styles via Element Styles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |  <-- ADD THIS LINE
| `diameter` | number | 80 | Knob size in pixels |
```

**Rationale:** Preserves existing quality writing, minimizes review time, reduces merge conflict risk.

**Source:** User decision from CONTEXT.md - "Edit style: Minimal diff -- only change what's necessary, preserve existing text where possible"

### Anti-Patterns to Avoid

- **Duplication without cross-linking:** Writing full feature descriptions in both manual and reference docs without links creates maintenance burden and version drift
- **Step-by-step tutorials in reference docs:** Mixing tutorial-style walkthrough into technical reference tables confuses readers seeking quick lookups
- **Vague language in generalization:** When updating STYLE_CREATION_MANUAL.md from knob-specific to generic, saying "elements" without clarification is ambiguous - use "supported element categories (knobs, sliders, buttons, meters)"

## Don't Hand-Roll

Problems that look simple but have existing solutions in the markdown/documentation domain:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown table alignment | Manual spacing with ASCII | Standard markdown pipes `\| col \|` | Editors auto-format, readable in plain text, GitHub renders correctly |
| Cross-document linking | Relative URLs like `../file.md` | Markdown links `[text](../file.md#section)` | Works in GitHub, many editors, supports anchor links |
| Screenshot management | Inline base64 images | Placeholder format `![desc](../images/file.png)` | Smaller file sizes, easier to update images, already established pattern |
| Version tracking | Manual "Last updated" fields | Git commit history | Automatic, accurate, no manual maintenance |

**Key insight:** Markdown has established conventions that work across many tools (GitHub, VS Code, markdown renderers). Don't invent custom formats - use standard markdown features.

## Common Pitfalls

### Pitfall 1: Reference Documentation Bloat

**What goes wrong:** Adding tutorial content to technical reference makes it harder to use as a quick lookup

**Why it happens:** Trying to make reference docs "beginner-friendly" by explaining everything in detail

**How to avoid:**
- Keep ELEMENT_REFERENCE.md as pure lookup tables (property name, type, default, description)
- Put tutorials and how-to guides in manual/*.md files
- Use cross-references: "See [Getting Started](manual/getting-started.md) for a tutorial"

**Warning signs:** Reference sections longer than 20 lines per entry, narrative prose in property tables

**Source:** [Diátaxis framework](https://diataxis.fr/) - tutorials and technical reference are distinct documentation types

### Pitfall 2: Outdated Element Counts

**What goes wrong:** Documentation claims 109 elements but code has more (or fewer)

**Why it happens:** Elements added/removed during development, docs not updated

**How to avoid:**
- Verify element count by searching codebase: `grep -r "type:" src/types/elements/*.ts | wc -l`
- Check against palette categories in PaletteItem.tsx
- User decision requires verifying EVERY element entry against current codebase

**Warning signs:** Element count in docs doesn't match palette category totals

**Source:** CONTEXT.md requirement UPD-02 - "verify every element entry against current codebase for accuracy"

### Pitfall 3: Knob-Specific Language in Generalized Docs

**What goes wrong:** STYLE_CREATION_MANUAL.md says "knob styles" when the system now supports sliders, buttons, meters

**Why it happens:** System started as knob-only, expanded to other categories, docs not updated

**How to avoid:**
- Replace "knob" with "element" in generic sections
- Add category notes: "The style system supports knobs, sliders, buttons, and meters"
- Keep category-specific sections for layer role details (rotary vs linear vs button vs meter layers differ)

**Warning signs:** File title mentions only knobs, instructions assume only rotary elements

**Source:** CONTEXT.md requirement UPD-03 - "Generalize language from knob-specific to generic terminology"

### Pitfall 4: Cross-Reference Dead Links

**What goes wrong:** Manual files link to `canvas.md#container-editing` but that anchor doesn't exist

**Why it happens:** Section renamed or moved, links not updated

**How to avoid:**
- Verify all cross-reference anchors exist in target files
- Use lowercase kebab-case for anchors (markdown standard: "## Container Editing" → `#container-editing`)
- Test links in markdown preview or GitHub

**Warning signs:** Links with uppercase, spaces, or special characters

**Source:** Markdown best practices - [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html)

### Pitfall 5: Incomplete Feature Documentation

**What goes wrong:** FACEPLATE_DOCUMENTATION.md lists v0.9.4 but missing element styles, layers, multi-window features added since

**Why it happens:** Version number updated but feature list not comprehensively reviewed

**How to avoid:**
- Review git log for feature commits since last doc version: `git log --since="v0.9.4" --grep="feat"`
- Check CONTEXT.md for feature list through v0.11.0
- Scan codebase for major features (store slices, new UI panels, export capabilities)

**Warning signs:** Version number updated but "Key Features" section unchanged

**Source:** CONTEXT.md requirement UPD-01 - "all features through v0.11.0 including element styles, layers, multi-window"

## Code Examples

Verified patterns from the codebase and existing documentation:

### Markdown Cross-Reference Format

```markdown
See [Section Name](filename.md#anchor) for details.
```

**Example from existing manual files:**
```markdown
See [Element Reference](../ELEMENT_REFERENCE.md) for complete element property listings
```

**Source:** D:\___ATM\vst3-webview-ui-designer\docs\manual\README.md line 45

### Screenshot Placeholder Format

```markdown
![Description of what the screenshot shows](../images/descriptive-filename.png)
```

**Example from STYLE_CREATION_MANUAL.md:**
```markdown
![Element selected on canvas](images/01-element-selected.png)
```

**Source:** D:\___ATM\vst3-webview-ui-designer\docs\STYLE_CREATION_MANUAL.md line 33

### Property Table Format

```markdown
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `propertyName` | type | value | What it does |
```

**Example from ELEMENT_REFERENCE.md:**
```markdown
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `styleId` | string | - | Element Style ID for custom SVG appearance |
| `diameter` | number | 80 | Knob size in pixels |
```

**Source:** D:\___ATM\vst3-webview-ui-designer\docs\ELEMENT_REFERENCE.md lines 52-55

### Container Editing Features (from codebase)

The container editing system has three main components:

**1. Edit Contents Button:**
```typescript
// Shows in PropertyPanel for all editable containers
// Source: src/components/Properties/EditContentsButton.tsx
<button onClick={() => startEditingContainer(element.id)}>
  Edit Contents
  <span>{childCount}</span>
</button>
```

**2. Breadcrumb Navigation:**
```typescript
// Tracks path from root to current container
// Source: src/store/containerEditorSlice.ts lines 9-10
interface ContainerEditorSlice {
  editingContainerId: string | null
  containerEditStack: string[]  // Parent containers
}
```

**3. Nested Container Support:**
```typescript
// Containers can contain other containers
// Source: src/store/containerEditorSlice.ts lines 52-67
startEditingContainer: (containerId: string) => {
  // Pushes current container to stack when entering nested container
  const newStack = state.editingContainerId
    ? [...state.containerEditStack, state.editingContainerId]
    : []
}
```

**Source:** D:\___ATM\vst3-webview-ui-designer\src\components\Properties\EditContentsButton.tsx and containerEditorSlice.ts

### Unsaved Changes Protection (from codebase)

Three mechanisms protect against data loss:

**1. Browser Warning:**
```typescript
// Warns before closing browser tab with unsaved changes
// Source: src/App.tsx line 191
useBeforeUnload(isDirty)
```

**2. Asterisk Indicator:**
```typescript
// Shows * in title when changes exist
// Tracked via dirty state in store
// Source: src/hooks/useDirtyState.ts (isDirty boolean)
```

**3. Last Saved Display:**
```typescript
// Shows relative time in left panel
// Source: src/components/Layout/LeftPanel.tsx lines 40-42
const lastSavedText = lastSavedTimestamp
  ? `Last saved: ${formatDistanceToNow(lastSavedTimestamp, { addSuffix: true })}`
  : 'Never saved'
```

**Source:** D:\___ATM\vst3-webview-ui-designer\src\App.tsx line 18, LeftPanel.tsx lines 40-42

## State of the Art

Documentation best practices in 2026:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single comprehensive manual | Modular topic files with master index | 2020s (docs-as-code movement) | Easier maintenance, parallel editing, better navigation |
| Manual version tracking | Git commit history + automated changelog | 2015+ | Accurate history, no manual updates needed |
| Generic tutorials | Diátaxis framework (4 doc types) | 2017 (framework published) | Clear purpose per document, better user experience |
| Static docs | AI-compatible patterns (consistent headers, predictable structure) | 2025-2026 | Documentation works well for AI assistants and human readers |

**Deprecated/outdated:**
- Inline version history tables (replaced by git log)
- Combined tutorial + reference in single files (split into manual/ and root-level docs)
- ASCII-art diagrams (replaced by SVG or mermaid in modern tooling, but this project uses screenshot placeholders)

**Source:**
- [Markdown Documentation Best Practices 2026](https://community.ibm.com/community/user/blogs/hiren-dave/2025/05/27/markdown-documentation-best-practices-for-document)
- [Diátaxis Framework](https://diataxis.fr/)
- [Code Documentation Best Practices 2026](https://www.qodo.ai/blog/code-documentation-best-practices-2026/)

## Open Questions

Things that couldn't be fully resolved:

1. **Container editing full walkthrough location**
   - What we know: Canvas.md doesn't currently have container editing section
   - What's unclear: Should full walkthrough go in canvas.md or project-management.md?
   - Recommendation: Check canvas.md for container-related content. If canvas.md has general element interaction patterns, add container editing there. If not, put it in project-management.md with cross-reference from canvas.md. User decision gives discretion: "Claude decides the most logical home."

2. **FACEPLATE_DOCUMENTATION.md update depth**
   - What we know: File claims v0.9.4, needs update to v0.11.0+
   - What's unclear: Full rewrite vs incremental updates vs section-specific patches
   - Recommendation: Read full file during planning, assess what's missing (element styles, layers, multi-window, Pro licensing, unified ElementStyle system). User decision: "Claude assesses what's needed after reading the current file."

3. **Exact features added between v0.9.4 and v0.11.0**
   - What we know: Git log shows element styles (phase 53-59), meter/slider/button/knob styled renderers, Pro licensing (phase 51-52), template importer
   - What's unclear: Comprehensive feature list for FACEPLATE_DOCUMENTATION.md update
   - Recommendation: During planning, review git log and compare FACEPLATE_DOCUMENTATION.md "Key Features" section (lines 27-38) against current codebase. Add: element styles, ElementStyle system (replaces knob-only), Pro licensing with free tier, template import from JUCE projects.

## Sources

### Primary (HIGH confidence)
- Existing codebase files examined:
  - `docs/FACEPLATE_DOCUMENTATION.md` (lines 1-300)
  - `docs/ELEMENT_REFERENCE.md` (lines 1-100)
  - `docs/STYLE_CREATION_MANUAL.md` (lines 1-100)
  - `docs/manual/README.md`, `canvas.md`, `palette.md`
  - `src/components/Layout/LeftPanel.tsx` (unsaved changes display)
  - `src/components/Properties/EditContentsButton.tsx` (container editing)
  - `src/store/containerEditorSlice.ts` (breadcrumb navigation)
  - `src/App.tsx` (beforeunload warning)
  - `src/components/project/SaveLoadPanel.tsx` (save/load functionality)
- Git commit history (feature commits since v0.9.4)
- CONTEXT.md user decisions

### Secondary (MEDIUM confidence)
- [Diátaxis Documentation Framework](https://diataxis.fr/) - Referenced by multiple 2026 sources as standard
- [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html) - Industry standard
- [Code Documentation Best Practices 2026](https://www.qodo.ai/blog/code-documentation-best-practices-2026/) - Current year practices

### Tertiary (LOW confidence - context only)
- [Markdown Documentation Best Practices](https://community.ibm.com/community/user/blogs/hiren-dave/2025/05/27/markdown-documentation-best-practices-for-document) - General markdown tips
- WebSearch results on documentation maintenance - General principles verified against codebase practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Markdown and git are already in use, patterns verified in existing files
- Architecture: HIGH - Existing doc structure examined, patterns extracted from current files
- Pitfalls: HIGH - Based on user requirements and common documentation maintenance issues
- Project management features: HIGH - Verified in codebase (SaveLoadPanel, containerEditorSlice, LeftPanel, App.tsx)

**Research date:** 2026-02-06
**Valid until:** 90 days (documentation best practices are stable, codebase features verified)

## Notes for Planner

**What's already done (no code changes needed):**
- Save/load functionality exists (SaveLoadPanel.tsx)
- Unsaved changes protection implemented (asterisk, last saved, browser warning)
- Container editing fully implemented (EditContentsButton, breadcrumb, nesting)
- Template import exists (TemplateImporter.tsx)
- All features just need documentation

**Manual topic file scope (project-management.md):**
- Save/load: brief paragraph (users understand File > Save)
- Unsaved changes: inline mention within save/load section
- Template import: its own subsection (explains templates, how to import, what happens to current project)
- Container editing: brief overview + link to full walkthrough (location TBD during planning)
- Container scrollbars: one sentence ("containers support overflow scrollbars when content exceeds bounds")

**Existing docs update approach:**
- FACEPLATE_DOCUMENTATION.md: Assess during planning, likely need to add element styles, layers, multi-window, Pro licensing
- ELEMENT_REFERENCE.md: Patch count to 109, add styleId properties, verify ALL element entries
- STYLE_CREATION_MANUAL.md: Generalize knob → element terminology, add category notes (not full parity sections)
- Minimal diff editing throughout

**Cross-referencing:**
- Manual README.md gets project-management.md entry
- Updated existing docs get "See Also" sections linking to manual topic files
- project-management.md links to detailed docs for specifics
