# Phase 32: Unsaved Changes Protection - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Prevent accidental work loss through visual indicators and confirmation dialogs. Users should never lose work due to navigation, browser close, or crashes. This phase covers dirty state tracking, save timing display, warning dialogs, and localStorage backup.

</domain>

<decisions>
## Implementation Decisions

### Dirty State Indicator
- Show unsaved indicator in BOTH browser tab title AND save button
- Browser tab: asterisk prefix (e.g., "* VST UI Designer")
- Save button: color change to orange/amber when dirty
- Clear dirty state only after successful save (not on save initiation)

### Save Timing Display
- Location: logo/header area (replaces existing timestamp display)
- Format: relative time ("Last saved: 2 minutes ago")
- Unsaved projects show "Never saved"
- Replace existing "last modified" timestamp with "last saved" timestamp

### Warning Dialogs
- Button pattern: Save / Don't Save / Cancel (3-option standard)
- Primary (highlighted) button: Save
- Browser close/refresh: native beforeunload dialog (can't customize, most reliable)
- In-app warnings (load template, new project): custom dialog with neutral/informative tone
- Example wording: "You have unsaved changes. Save before loading template?"

### Auto-save / Crash Recovery
- No automatic file saves - only manual save
- localStorage backup on every change (immediate, most protective)
- On app load: check for backup, prompt "Recovered unsaved work found. Restore?"
- Recovery dialog: Restore / Discard (simple 2-option)

### Claude's Discretion
- Exact orange/amber color value for dirty save button
- localStorage key naming and structure
- Debouncing strategy for "on every change" backup (if needed for performance)
- Exact relative time thresholds ("just now", "1 minute ago", "2 minutes ago", etc.)

</decisions>

<specifics>
## Specific Ideas

- Standard desktop app pattern: asterisk in title + colored button mirrors familiar UX
- Recovery prompt only on startup - no persistent "recover" button cluttering UI
- Neutral dialog tone - informative, not alarming

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 32-unsaved-changes-protection*
*Context gathered: 2026-01-27*
