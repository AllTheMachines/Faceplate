# Phase 63: Windows, Assets & Fonts - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Document multi-window system, asset library, and font management features in the user manual. Three topic files covering window management workflows, SVG asset import/organization, and font selection/bundling. No code changes — documentation only.

</domain>

<decisions>
## Implementation Decisions

### Window Types Explanation
- Explain release vs developer windows by practical use case: "release windows become your shipped UI, developer windows are for testing/debugging"
- Do NOT lead with export implementation details — keep it user-focused
- Button navigation actions documented as step-by-step tutorial with screenshot placeholders
- Window properties (dimensions, background, title) covered naturally within the "create a window" workflow, not as a separate properties table
- Cross-window copy/paste gets an inline mention, not a dedicated section — brief note within window overview

### Asset Library Workflow
- SVG security sanitization gets a brief one-sentence mention ("Faceplate automatically sanitizes imported SVGs") — builds trust without technical detail
- Asset categories covered naturally within the import workflow, not as a standalone list
- Import validation errors NOT documented separately — error messages are self-explanatory
- Drag-to-canvas workflow documented as a brief paragraph, not numbered steps — it's intuitive enough

### Font System
- Built-in vs custom font distinction: Claude's discretion on explanation approach (side-by-side vs sequential)
- Export bundling details (base64 for custom, file refs for built-in) explained IN the font docs — users should understand the tradeoff when choosing custom fonts
- Font folder selection: minimal steps — "Go to Settings, select your fonts folder, custom fonts appear in the dropdown"
- Font preview dropdown: one-sentence mention only, no screenshot placeholder

### Documentation Format
- Feature-oriented organization: "Multi-Window System" section, "Asset Library" section, "Font Management" section — reference-style, not task-oriented
- Screenshot placeholders: key screens only (2-3 per topic file) — window tabs, asset import dialog, font folder selection
- Cross-references: minimal — only when absolutely needed to avoid confusion, keep each file self-contained
- Technical depth: light technical context — mention JUCE WebView2 export terms where relevant since target audience is VST3 developers

### Claude's Discretion
- Built-in vs custom font explanation approach (side-by-side comparison or sequential)
- Exact section ordering within each topic file
- Whether to include tips/notes callouts or keep prose flat

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following patterns established in phases 60-62.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 63-windows-assets-fonts*
*Context gathered: 2026-02-06*
