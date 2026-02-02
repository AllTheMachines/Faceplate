# Phase 49: Core UI Fixes - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix two specific interaction bugs in the designer's UI:
1. Color picker popup closes prematurely when dragging to select colors
2. Related Topics links in help system don't navigate to the correct section

</domain>

<decisions>
## Implementation Decisions

### Color Picker Behavior
- Close trigger: Click outside only (not on blur or mouse-leave)
- Drag outside: Popup stays open until mouse-up, even if drag extends outside popup bounds
- Toggle close: Clicking the trigger swatch toggles popup closed
- Apply timing: Immediate live preview as user drags (standard behavior)

### Help Navigation
- Scroll style: Smooth scroll animation to target section
- Highlight: Brief highlight on target section (~1 second fade out) to show what was navigated to
- History: Build navigation history stack with back button
- Back button: Top of help panel, visible when history exists

### Error Handling
- Invalid topic: Console warning only (don't disrupt user)
- Invalid links: Show all links (easier debugging), invalid ones just don't navigate
- Context help: Opening help for specific element scrolls directly to that element's section
- Fallback: Elements without dedicated help sections fall back to parent category section

### Claude's Discretion
- Highlight animation timing and color
- Back button icon and positioning details
- Smooth scroll duration

</decisions>

<specifics>
## Specific Ideas

- Color picker should feel like standard OS color pickers - drag anywhere without fear of losing your selection
- Help navigation should feel like clicking links in documentation - smooth, predictable, with ability to go back

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 49-core-ui-fixes*
*Context gathered: 2026-02-02*
