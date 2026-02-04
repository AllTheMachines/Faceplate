# Phase 14: Security Foundation & Upload Pipeline - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

All SVG rendering is sanitized and protected against XSS attacks. This phase delivers secure SVG handling — sanitization at upload, re-sanitization on load, safe rendering component, and export protection. SVG files must pass through DOMPurify before storage, and all canvas rendering goes through a SafeSVG component. The asset library UI and SVG element types are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Sanitization behavior
- Strict allowlist approach — only allow basic shapes, paths, gradients, transforms
- Block filters, foreignObject, scripts, and other dangerous elements
- Preserve inline styles and `<style>` blocks (sanitized)
- Strip all SMIL animations (`<animate>`, `<animateTransform>`, etc.) — knob rotation will be JS-driven
- Block all external references — no URLs in href/xlink:href, self-contained SVGs only

### Error handling
- Specific details when SVG is rejected or modified: "Removed 3 elements: `<script>`, `<foreignObject>`, `<animate>`"
- Reject files exceeding size limits with clear message: "File too large (2.3MB). Maximum is 1MB."
- Use toast notifications for errors/warnings — non-blocking, temporary popups
- Visual distinction: warnings are yellow/amber, errors are red

### Upload flow UX
- Support both drag-drop and file picker for importing SVGs
- Preview dialog before import — show SVG preview + metadata before adding to library
- One file at a time — single file per import action
- Full metadata in preview: set asset name, category (logo/icon/decoration), notes before confirming

### Validation strictness
- Reject entirely if SVG has any strippable content (animations, scripts) — user must clean externally
- Hard reject DOCTYPE declarations with explanation: "DOCTYPE not allowed. Remove `<!DOCTYPE>` declaration and try again."
- No escape hatch — all files go through same validation, no exceptions
- Re-sanitization on project load: Claude's discretion on silent vs logged

### Claude's Discretion
- Re-sanitization logging behavior (silent vs toast when project SVGs are re-validated)
- Exact DOMPurify configuration details
- SafeSVG component implementation approach
- CSP header specifics for export

</decisions>

<specifics>
## Specific Ideas

- Security is the priority — this is a foundation phase, not a feature phase
- Zero tolerance for unsafe content — reject rather than silently fix
- Clear, actionable error messages help users fix their SVGs externally
- Preview dialog gives users confidence about what they're importing

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-security-foundation-upload-pipeline*
*Context gathered: 2026-01-25*
