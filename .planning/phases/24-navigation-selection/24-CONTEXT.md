# Phase 24: Navigation & Selection - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Navigation and selection components for complex plugin UIs. 8 element types: Multi-Select Dropdown, Combo Box, Tab Bar, Menu Button, Breadcrumb, Stepper, Tag Selector, Tree View. These are interactive widgets users see and click to navigate, select items, and filter content.

</domain>

<decisions>
## Implementation Decisions

### Visual Style
- Flat/minimal appearance — no visible border until hover/focus, modern look relying on background contrast
- Tabs configurable per tab — user chooses icon, text, or both for each tab
- Focus ring matches existing form controls in the app

### Interaction Patterns
- Subtle fade animation (100-150ms) for dropdown/menu open/close
- Full keyboard support: arrow keys + Enter to navigate/select, Escape to close, plus type-ahead search
- Tree View: click arrow only to expand/collapse (single click on row selects, doesn't toggle)
- Stepper: click-and-hold with acceleration — hold to repeat, speed increases over time

### Selection Behavior
- Multi-Select Dropdown: configurable maximum selection limit (designer sets max)
- Multi-Select closed state: comma-separated text with ellipsis on overflow
- Tag Selector: chips with X button to remove
- Combo Box empty state: Claude's discretion

### Audio Plugin Context
- Configurable height in pixels for compact plugin UIs (not preset sizes)
- Stepper: full range config — min, max, step, default value for JUCE parameter binding
- Tab Bar: both data-attribute (data-active-tab) and JavaScript callback (onTabChange) for JUCE integration
- Tree View: hybrid approach — designer defines structure, JUCE can modify at runtime

### Claude's Discretion
- Selected/active item indication style (background, accent bar, or checkmark per component)
- Combo Box empty state handling
- Exact fade animation timing within 100-150ms range

</decisions>

<specifics>
## Specific Ideas

- Stepper should feel like a real parameter control — min/max/step ready for direct JUCE binding
- Tree View for preset browsers — structure defined in designer but JUCE populates actual content
- Tab Bar used for page switching in multi-page plugin UIs — both attribute and callback for flexibility

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-navigation-selection*
*Context gathered: 2026-01-26*
