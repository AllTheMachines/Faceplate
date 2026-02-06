# Phase 65: Project Management & Docs Update - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Document project management features (save/load, unsaved changes protection, container editing, template import) in a new manual topic file, and update three existing documentation files (FACEPLATE_DOCUMENTATION.md, ELEMENT_REFERENCE.md, STYLE_CREATION_MANUAL.md) to reflect current state. This is a documentation-only phase -- no code changes.

</domain>

<decisions>
## Implementation Decisions

### Project management topic file format
- Reference-first format (feature descriptions organized by topic, not step-by-step tutorials)
- Save/load covered as a brief paragraph -- users will figure out File > Save
- Unsaved changes protection (browser warning, asterisk, last saved) mentioned inline within save/load section, not a dedicated subsection
- Template import gets its own subsection explaining what templates are, how to import, and what happens to the current project

### Container editing in project management docs
- Brief overview paragraph + link to canvas.md (or wherever the full walkthrough lives)
- Claude decides the most logical home for container editing docs (canvas.md vs project-management.md) based on whether canvas.md already covers it
- Mention container overflow/scrollbar behavior in one brief sentence

### Docs update strategy
- FACEPLATE_DOCUMENTATION.md: Claude assesses what's needed after reading the current file (could be incremental or more thorough)
- ELEMENT_REFERENCE.md: Patch known changes (count to 109, add styleId properties) AND verify every element entry against current codebase for accuracy
- STYLE_CREATION_MANUAL.md: Generalize language from knob-specific to generic terminology (e.g., "element" instead of "knob") with brief category notes -- not full parity sections for every category
- Edit style: Minimal diff -- only change what's necessary, preserve existing text where possible

### Cross-referencing strategy
- Existing docs (FACEPLATE_DOCUMENTATION.md etc.) are canonical source of truth
- Manual topic files are user-friendly summaries that link to existing docs for details
- When project-management.md overlaps with other topic files: brief description + link ("See [Canvas](canvas.md#section) for full details")
- Updated existing docs get "See Also" sections linking to relevant manual topic files
- Manual README.md (table of contents) updated to include project-management.md entry

### Claude's Discretion
- Exact depth of FACEPLATE_DOCUMENTATION.md updates (assess after reading current file)
- Where to place container editing documentation if canvas.md lacks it
- How to balance container editing coverage between project-management.md and canvas.md

</decisions>

<specifics>
## Specific Ideas

- Container editing has three parts: Edit Contents button, breadcrumb navigation, nesting -- keep overview brief regardless of where full docs live
- Scrollbar behavior gets one sentence only ("containers support overflow scrollbars when content exceeds bounds")
- Template import warrants its own subsection despite project management being reference-format

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 65-project-management-docs-update*
*Context gathered: 2026-02-06*
