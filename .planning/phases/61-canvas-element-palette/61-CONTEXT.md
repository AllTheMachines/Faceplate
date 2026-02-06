# Phase 61: Canvas & Element Palette - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Document all canvas interaction workflows and element palette features with step-by-step instructions, keyboard shortcuts, and screenshot placeholders. Two topic files: `canvas.md` and `palette.md` in `docs/manual/`. No code changes — documentation only.

</domain>

<decisions>
## Implementation Decisions

### Content Depth & Structure
- Target audience: beginner-friendly — assume no prior knowledge of design tools, explain concepts explicitly
- Keyboard shortcuts presented inline with workflow steps (e.g., "Press Ctrl+C to copy the selection")
- Each section starts with 1-2 sentence overview of what the workflow does and when to use it, then numbered steps
- Edge cases and gotchas handled as inline notes within the steps, not callout boxes

### Canvas Workflow Grouping
- Organize by task type: "Adding Elements", "Selecting", "Positioning", "Editing", "Canvas Navigation", "Canvas Settings"
- Undo/redo grouped with copy/paste/delete under a single "Editing & History" section
- Snap grid and locking documented as separate sections (snap under Canvas Settings, locking gets its own section or subsection)
- Pan/zoom as a brief subsection (quick reference list of methods, not a full section with extended steps)

### Element Palette Organization
- Each element category gets a table with columns: Element Name, Description
- Pro elements indicated with inline "(Pro)" badge after element name — no extra column
- Category headings go straight into tables, no intro paragraphs describing what each category is for
- Search/filter feature described functionally (what it does, how it works) without example search queries
- Link to ELEMENT_REFERENCE.md for full property details

### Screenshot Strategy
- Minimal screenshots: 4-6 per topic file, placed only at key workflows
- Canvas doc: start with text (no hero screenshot), screenshots within individual sections
- Palette doc: one screenshot placeholder per category showing elements within (~12 screenshots, exception to the 4-6 guideline since each is for a distinct category)
- Placeholder format: subject only, no annotation descriptions (e.g., `![Canvas with elements selected](../images/canvas-selection.png)`)

### Claude's Discretion
- Exact section ordering within task-type groups
- Whether some brief subsections can be combined if content is thin
- Exact wording of step instructions
- Which 4-6 canvas screenshots add the most value

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following the template established in Phase 60 (getting-started.md).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 61-canvas-element-palette*
*Context gathered: 2026-02-06*
