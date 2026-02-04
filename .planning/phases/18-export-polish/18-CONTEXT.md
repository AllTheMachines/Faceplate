# Phase 18: Export & Polish - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Finalize export quality for SVG assets and polish rough edges. SVG Graphics and SVG Knobs already export (phases 16-04, 17-06), but this phase adds SVGO optimization, responsive scaling CSS, export verification workflow, and general polish.

</domain>

<decisions>
## Implementation Decisions

### SVGO Optimization
- SVGO optimization enabled by default when exporting
- Use "safe only" optimization level — only optimizations guaranteed not to change appearance
- Display file size before/after optimization with savings percentage in export dialog
- Toggle appears in export dialog as checkbox (not global settings)

### Responsive Scaling
- Elements designed at fixed pixel sizes on canvas
- Entire layout scales proportionally when plugin window resizes
- Aspect ratio handling: Claude's discretion (maintain canvas ratio is typical for plugins)
- Enforce minimum and maximum scale limits to prevent UI becoming too tiny or oversized

### Export Verification
- Browser preview option — open exported HTML in browser to verify appearance
- Show validation warnings before export but allow user to proceed anyway
- On successful export: open the destination folder in file explorer
- Include README.md with JUCE integration instructions in exported bundle

### Polish Scope
- Comprehensive error message review across all error states
- Focus visual glitch fixes on canvas rendering specifically
- Claude identifies and addresses workflow friction points

### Claude's Discretion
- Specific SVGO plugins/options within "safe only" constraint
- Exact min/max scale percentages for responsive limits
- Aspect ratio handling approach (letterboxing vs alternative)
- Which workflow friction points to prioritize
- README content and formatting

</decisions>

<specifics>
## Specific Ideas

- Export process should feel professional — show size savings, open folder on complete
- README should help developers integrate the exported bundle into JUCE WebView2 quickly
- Browser preview catches issues before committing to export

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-export-polish*
*Context gathered: 2026-01-26*
