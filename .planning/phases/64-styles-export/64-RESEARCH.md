# Phase 64: Styles & Export - Research

**Researched:** 2026-02-06
**Domain:** Technical documentation for audio plugin UI designer
**Confidence:** HIGH

## Summary

This research covers best practices for documenting the element styles system and export workflows in user manual format. The phase involves creating two topic files (`styles.md` and `export.md`) following the established patterns in phases 60-63 (Canvas, Palette, Properties, Layers, Windows, Assets, Fonts).

The existing manual uses a consistent three-part structure: (1) overview with context, (2) detailed sections with numbered steps and screenshots, and (3) cross-references at the bottom. Documentation style is clear, direct, and task-oriented, using imperative instructions ("Click", "Select", "Enter") with visual support through screenshot placeholders. The STYLE_CREATION_MANUAL.md already exists as comprehensive reference documentation, so the styles topic file will take an overview-plus-reference approach to avoid duplication.

**Primary recommendation:** Follow the established manual patterns from phases 60-63 (getting-started.md through fonts.md) with clear task-based sections, numbered procedural steps, screenshot placeholders using descriptive filenames, and footer cross-references to related topics and reference documentation.

## Standard Stack

No external libraries or tools are needed for this documentation phase. The work involves writing Markdown files following established patterns.

### Writing Tools
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Markdown | Documentation format | All existing manual files use .md format |
| Screenshot placeholders | Visual references | Consistent pattern: `![description](../images/filename.png)` |
| Cross-references | Navigation | Footer links follow established pattern |

### File Locations
- Target directory: `docs/manual/`
- Screenshot references: `../images/` (relative path from manual directory)
- Reference docs: `../STYLE_CREATION_MANUAL.md`, `../JUCE_INTEGRATION.md`, `../EXPORT_FORMAT.md`

### Installation
No installation required. Documentation files are plain Markdown.

## Architecture Patterns

### Recommended Topic File Structure
Based on existing manual files (canvas.md, windows.md, assets.md, fonts.md):

```
# [Topic Title]

[2-3 sentence overview explaining what this feature does]

![Primary screenshot showing the feature](../images/topic-overview.png)

## [Main Section 1]

[Context paragraph explaining when/why to use this]

### [Subsection with Steps]

1. **[Action step with bold first phrase]**
   - [Supporting detail or explanation]
   - [Additional guidance]

2. **[Next action step]**
   - [Detail]

![Screenshot showing this workflow](../images/topic-section-workflow.png)

## [Main Section 2]

[Continue pattern]

---

[Back to User Manual](README.md) | [Related](related.md) | [Topics](topics.md)
```

### Pattern 1: Task-Based Sections
**What:** Each main section focuses on a specific user task or goal
**When to use:** For all procedural documentation (how to do X)
**Example:**
```markdown
## Importing SVGs

Import SVG graphics to use as logos, icons, decorations, or background elements in your plugin UI.

1. Click the **Assets** tab in the left panel
2. Click the **+ Import** button at the top
3. Drop an SVG file into the drop zone, or click to browse your files
```
Source: docs/manual/assets.md

### Pattern 2: Contextual Explanations
**What:** Brief explanatory paragraphs before procedural steps providing context for why/when
**When to use:** Before numbered step lists, after section headings
**Example:**
```markdown
## Window Types

Faceplate supports two window types: **release** and **developer**. The type determines whether the window is included in your exported plugin code.

### Release Windows

**Release windows** become part of your shipped plugin UI...
```
Source: docs/manual/windows.md

### Pattern 3: Screenshot Placeholders with Descriptive Names
**What:** Image references using descriptive filenames that indicate what should be captured
**When to use:** After instructional steps, to show UI state or workflow
**Example:**
```markdown
![Window properties in the Properties panel when no element is selected](../images/windows-properties-panel.png)
```
Source: docs/manual/windows.md

### Pattern 4: Footer Cross-References
**What:** Horizontal separator followed by "Back to" link and related topic links
**When to use:** At the end of every topic file
**Example:**
```markdown
---

[Back to User Manual](README.md) | [Canvas](canvas.md) | [Properties Panel](properties.md) | [Asset Library](assets.md)
```
Source: docs/manual/windows.md

### Pattern 5: Inline Emphasis for UI Elements
**What:** Bold text for buttons, menu items, panel names, and other UI elements users interact with
**When to use:** Throughout instructions for clarity
**Example:**
```markdown
Click the **Assets** tab in the left panel
The **Properties** panel shows window settings
Press **Ctrl+G** (or **Cmd+G** on Mac) to toggle
```
Source: Multiple manual files

### Anti-Patterns to Avoid
- **Overly technical language:** The manual uses plain, direct language. Avoid jargon like "instantiate", "serialize", "emit event" when describing user actions.
- **Code examples in user manual:** Code belongs in reference docs (JUCE_INTEGRATION.md, EXPORT_FORMAT.md), not in user-facing task documentation.
- **Nested subsections beyond ### level:** Maximum three levels: `##`, `###`, no `####`. Keeps structure flat and scannable.
- **Procedural steps without context:** Always explain the why/when before the how. See Pattern 2.

## Don't Hand-Roll

Problems that already have established solutions in this codebase:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Screenshot organization | Random IMG_001.png names | Descriptive filenames like `export-modal-options.png` | Makes screenshots self-documenting and maintainable |
| Cross-reference format | Custom linking styles | Footer pattern with pipe separators | Established consistency across all manual files |
| Visual hierarchy | Varying heading levels | Two-level max (## and ###) | Existing files use flat structure for scannability |
| UI element notation | Varying styles (quotes, italics, etc.) | Bold for all UI elements | Consistent with getting-started.md through fonts.md |
| Technical explanations | Inline code/architecture | Reference to separate docs | User manual focuses on tasks, reference docs cover technical details |

**Key insight:** Documentation is most valuable when it follows established patterns. Users learn the structure once and apply it across all topics. Breaking patterns forces cognitive overhead and reduces usability.

## Common Pitfalls

### Pitfall 1: Over-Explaining Features Already Documented
**What goes wrong:** Duplicating content from STYLE_CREATION_MANUAL.md in styles.md, or from EXPORT_FORMAT.md in export.md
**Why it happens:** Desire to make each document "complete" and self-contained
**How to avoid:** Use overview-plus-reference approach. Explain what users need to know to use the feature in the UI, then provide prominent link to detailed reference documentation
**Warning signs:** Writing step-by-step SVG design workflow (that's in STYLE_CREATION_MANUAL), or explaining bundle file structure in detail (that's in EXPORT_FORMAT.md)

### Pitfall 2: Screenshot Overload
**What goes wrong:** Adding screenshots for every minor UI interaction, making the document visually cluttered
**Why it happens:** Assumption that more visuals = better documentation
**How to avoid:** Follow the decision in CONTEXT.md: styles.md gets 2 screenshots (style dropdown, Manage Styles dialog), export.md gets 1 (export modal). Screenshots should show state changes or complex UI, not simple button clicks
**Warning signs:** Multiple screenshots showing the same UI element with minor variations, screenshots of single buttons in isolation

### Pitfall 3: Technical Detail Creep
**What goes wrong:** Including HTML/CSS/JavaScript details, JUCE integration code, or bundle structure in user-facing manual
**Why it happens:** Subject matter expertise leads to assuming users need/want technical depth
**How to avoid:** User manual answers "how do I use this feature?" Technical reference docs answer "how does this work?" and "how do I integrate this?" Keep the audiences separate
**Warning signs:** Code snippets, file structure trees, technical terminology like "evaluateJavascript", "parameterSync", "normalized values"

### Pitfall 4: Inconsistent Terminology
**What goes wrong:** Calling the same feature by different names (e.g., "export dialog" vs "export modal" vs "export window")
**Why it happens:** Not reviewing existing documentation for terminology conventions
**How to avoid:** Audit existing manual files and code comments for established terms. Use ProElementsBlockingModal, ExportModal, ElementLayerMappingDialog - these component names indicate "modal" and "dialog" are used interchangeably, prefer "modal" for UI, "dialog" for technical components
**Warning signs:** Switching terms mid-document, inventing new terms when existing ones work

### Pitfall 5: Missing Context for "Why"
**What goes wrong:** Jumping straight to procedural steps without explaining when/why users would perform this task
**Why it happens:** Author knows the purpose, assumes readers do too
**How to avoid:** Every major section needs a context paragraph explaining the use case before procedural steps. See Pattern 2 in Architecture Patterns
**Warning signs:** Section starts with "1. Click..." without any preceding explanation, users asking "when would I use this?"

## Code Examples

Since this is documentation writing, not code implementation, the "examples" are documentation patterns extracted from existing manual files.

### Screenshot Placeholder Pattern
```markdown
![Descriptive text explaining what the screenshot shows](../images/topic-section-name.png)
```
Source: All manual files use this format

### Procedural Step Pattern
```markdown
1. **Bold first phrase describing the action**
   - Supporting detail or explanation
   - Additional context if needed

2. **Next action with bold opening**
   - Detail
```
Source: docs/manual/assets.md, docs/manual/windows.md

### Context Before Procedure Pattern
```markdown
## [Section Name]

[1-2 paragraphs explaining what this is and why you'd use it]

### [Subsection]

[Optional: one more sentence of context specific to this subsection]

1. **First step...**
```
Source: docs/manual/windows.md (see "Window Types" section)

### Cross-Reference Footer Pattern
```markdown
---

[Back to User Manual](README.md) | [Related Topic 1](topic1.md) | [Related Topic 2](topic2.md)
```
Source: docs/manual/canvas.md, docs/manual/windows.md, docs/manual/assets.md

### Inline UI Element Reference
```markdown
Click the **Button Name** in the left panel
Select **Menu Item** from the dropdown
The **Panel Name** shows on the right
```
Source: All manual files consistently bold UI elements

### Callout Pattern (Used Sparingly)
```markdown
> **Note**: This guide has been tested with JUCE WebView2 on **Windows** only. macOS (WKWebView) and Linux may work but are currently untested.
```
Source: docs/JUCE_INTEGRATION.md (note: used in reference docs, not frequently in user manual)

## State of the Art

Documentation best practices have evolved toward visual-first, task-oriented content with progressive disclosure.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Reference-style documentation | Task-based user guides | Mid-2010s | Users can accomplish goals without understanding entire system |
| Minimal screenshots | Visual-first with annotated screenshots | Late 2010s | Reduces cognitive load, faster task completion |
| Comprehensive single docs | Modular topic files with cross-links | Early 2020s | Users find relevant content faster, easier to maintain |
| Technical-first language | Plain language with progressive disclosure | Ongoing | Lower barrier to entry, technical details available when needed |

**Deprecated/outdated:**
- Long-form PDF manuals: Modern documentation is modular, web-based, searchable
- Reference-only documentation: Users need task guidance, not just API descriptions
- Text-heavy instructions: Screenshots with annotations reduce the need for lengthy explanations

**Current best practices (2026):**
- **Clear, simple language:** Prioritize straightforward communication over technical precision. Short sentences, simple words, unambiguous instructions.
- **Visual content:** Screenshots, diagrams, and annotations significantly aid comprehension for complex UI workflows. Most end-user documentation should have annotated screenshots.
- **Structured organization:** Start with the bigger picture (what is this? why use it?) before diving into procedural steps. Users need "why" before "how".
- **Task-based sections:** Organize around user goals ("Importing SVGs", "Creating a Window") not system architecture ("Asset Storage Schema", "Window State Management").
- **Progressive disclosure:** Surface essential information first, link to detailed reference docs for advanced users who need depth.

Sources:
- [10 Essential Technical Documentation Best Practices for 2026](https://www.documind.chat/blog/technical-documentation-best-practices)
- [15 Types of Technical Documentation +Examples (2026)](https://whatfix.com/blog/types-of-technical-documentation/)
- [The Ultimate Guide to Writing User Manuals | TechSmith](https://www.techsmith.com/blog/user-documentation/)
- [Screenshots in Documentation | Technical Writing is Easy | Medium](https://medium.com/technical-writing-is-easy/screenshots-in-documentation-27b45342aad8)
- [10 Examples of Great End-User Documentation](https://blog.screensteps.com/10-examples-of-great-end-user-documentation)

## Open Questions

### Question 1: Export Preview Window Behavior
- **What we know:** Browser preview exists and works (previewHTMLExport, previewMultiWindowExport functions in codeGenerator.ts)
- **What's unclear:** Does the preview open in a new browser tab or a modal overlay? Does it show live parameter updates or static UI only?
- **Recommendation:** Examine ExportModal.tsx and ExportPanel.tsx implementation during planning to determine exact preview behavior. Document what users actually see, not assumptions about implementation.

### Question 2: Pro Element Blocking Exact Wording
- **What we know:** ProElementsBlockingModal shows which Pro elements need removal or upgrade. Modal displays list of Pro elements by type with counts. Two buttons: "Cancel" and "Get Pro License".
- **What's unclear:** Exact UI copy for the blocking message and call-to-action. Does "Get Pro License" link to external site or open in-app upgrade flow?
- **Recommendation:** Review ProElementsBlockingModal.tsx during planning for exact copy. Document the user experience accurately (what they see, what actions are available).

### Question 3: Layer Mapping Dialog Auto-Detection Feedback
- **What we know:** Layer detection happens automatically on SVG import. System detects layers by ID attribute matching known role names (indicator, track, thumb, etc.). Toast notification shows detection results.
- **What's unclear:** What does the toast message say exactly? How many layers detected? What happens if zero required layers detected?
- **Recommendation:** The CONTEXT.md specifies layer mapping dialog gets only brief mention (one paragraph, "it appears after import, full details in STYLE_CREATION_MANUAL"). No need to resolve this for the high-level overview in styles.md.

### Question 4: Multi-Window Export Folder Structure
- **What we know:** Multi-window projects export each window as separate bundle in its own subfolder (from CONTEXT.md decision: "one sentence" mention)
- **What's unclear:** Exact folder naming convention (window-1/, main-window/, by window name?), whether there's a root README explaining the structure
- **Recommendation:** Check codeGenerator.ts exportMultiWindowBundle and exportMultiWindowToFolder functions during planning. Brief mention is sufficient per CONTEXT.md, so surface-level accuracy is enough.

## Sources

### Primary (HIGH confidence)
- `docs/manual/getting-started.md` - Manual structure, tone, procedural steps pattern
- `docs/manual/canvas.md` - Task-based sections, keyboard shortcut tables, cross-references
- `docs/manual/windows.md` - Multi-section documentation, context-before-procedure pattern
- `docs/manual/assets.md` - Import workflows, organizing content, use case sections
- `docs/manual/fonts.md` - Simple topic structure, progressive disclosure
- `docs/STYLE_CREATION_MANUAL.md` - Existing comprehensive style reference (avoid duplicating)
- `docs/EXPORT_FORMAT.md` - Technical export details (reference from export.md, don't duplicate)
- `docs/JUCE_INTEGRATION.md` - JUCE integration reference (link from export.md footer)
- `src/components/export/ExportModal.tsx` - Export UI implementation
- `src/components/export/ProElementsBlockingModal.tsx` - Pro blocking modal behavior
- `src/services/export/codeGenerator.ts` - Export mechanics and file generation
- `src/store/elementStylesSlice.ts` - Element styles state management
- `src/components/dialogs/ElementLayerMappingDialog.tsx` - Layer mapping dialog structure

### Secondary (MEDIUM confidence)
- [10 Essential Technical Documentation Best Practices for 2026](https://www.documind.chat/blog/technical-documentation-best-practices) - Current best practices for technical documentation
- [The Ultimate Guide to Writing User Manuals | TechSmith](https://www.techsmith.com/blog/user-documentation/) - User manual structure and organization
- [Screenshots in Documentation | Medium](https://medium.com/technical-writing-is-easy/screenshots-in-documentation-27b45342aad8) - Screenshot sizing and annotation best practices

### Tertiary (LOW confidence)
- [Web UI Project Export](https://documentation.progress.com/output/oe117sp1/exporting-a-web-ui-project.html) - Generic export dialog patterns (used for context, not specific guidance)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Documentation follows existing Markdown patterns with no external dependencies
- Architecture: HIGH - Seven existing manual files establish clear, consistent patterns to follow
- Pitfalls: HIGH - CONTEXT.md decisions explicitly address scope creep risks (don't duplicate STYLE_CREATION_MANUAL, keep export technical details minimal)
- Documentation patterns: HIGH - Verified by reading actual source files, not assumed

**Research date:** 2026-02-06
**Valid until:** 60 days (documentation best practices are stable; manual patterns are established in codebase and unlikely to change)

**Codebase patterns verified:** Yes - examined docs/manual/*.md files, component implementations, and existing reference documentation
**External research performed:** Yes - validated current documentation best practices for 2026
**User decisions incorporated:** Yes - CONTEXT.md decisions constrain scope appropriately (overview approach for styles.md, brief treatment of multi-window/Pro elements, specific screenshot counts)
