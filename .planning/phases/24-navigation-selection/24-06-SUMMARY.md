---
phase: 24
plan: 06
type: execute
subsystem: export
tags: [navigation, export, css, html, juce-binding]
wave: 2

requires:
  - "24-01: Stepper and Breadcrumb element implementations"
  - "24-02: Multi-Select, ComboBox, MenuButton implementations"
  - "24-03: Tab Bar and Tag Selector implementations"
  - "24-04: Tree View implementation"
  - "23-06: Professional meter export patterns"
  - "22-04: Value display export patterns"
  - "21-04: Button/switch export patterns"

provides:
  - "CSS generation for 8 navigation element types"
  - "HTML generation for 8 navigation element types"
  - "JUCE data attribute binding for navigation elements"
  - "Dropdown fade animations (100ms/150ms)"
  - "Tab Bar indicator styles (background/underline/accent-bar)"
  - "Instant transitions on all navigation elements"

affects:
  - "Export functionality (generates complete navigation element styles)"
  - "JUCE integration (data attributes for C++ parameter binding)"
  - "Future navigation elements (established export patterns)"

tech-stack:
  added: []
  patterns:
    - "Dropdown base CSS with 100ms open/150ms close fade timing"
    - "Data attributes for JUCE parameter binding (data-value, data-active-tab, data-selected-id)"
    - "ARIA attributes for accessibility (role, aria-selected, aria-multiselectable)"
    - "Instant transitions (transition: none) on all navigation elements"
    - "Recursive HTML generation for tree structures"

key-files:
  created: []
  modified:
    - path: "src/services/export/cssGenerator.ts"
      changes: "Added CSS generation for 8 navigation element types with helper functions"
    - path: "src/services/export/htmlGenerator.ts"
      changes: "Added HTML generation for 8 navigation element types with data attributes"

decisions:
  - id: "nav-export-instant-transitions"
    title: "Instant transitions on all navigation elements"
    rationale: "Navigation requires immediate visual feedback, consistent with Phase 21 button standard"
    outcome: "All navigation elements use transition: none"

  - id: "nav-export-dropdown-fade"
    title: "Dropdown fade timing: 100ms open, 150ms close"
    rationale: "CONTEXT.md specified 100-150ms range for dropdowns"
    outcome: "Consistent fade timing across Multi-Select, ComboBox, MenuButton, Tag Selector"

  - id: "nav-export-data-attributes"
    title: "JUCE data attributes for parameter binding"
    rationale: "C++ needs to query and update navigation state without JavaScript"
    outcome: "Stepper: data-value/min/max/step, Tab Bar: data-active-tab, Tree View: data-selected-id/node-id"

  - id: "nav-export-aria"
    title: "ARIA attributes for accessibility"
    rationale: "Exported HTML should be accessible"
    outcome: "All navigation elements include role, aria-selected, aria-haspopup as appropriate"

metrics:
  tasks: 2
  commits: 2
  files_modified: 2
  duration: "3 minutes"
  completed: "2026-01-26"
---

# Phase 24 Plan 06: Navigation & Selection Export Support Summary

**One-liner:** CSS and HTML generation for 8 navigation element types with JUCE data attributes, dropdown fade animations, and tab indicator styles

## What was built

Added complete export support (CSS and HTML generation) for all 8 navigation element types introduced in Phase 24 Plans 01-04.

### CSS Generation (Task 1)

**Stepper CSS:**
- Flexbox layout with orientation support (horizontal/vertical)
- Button styling with size, color, hover state
- Value display styling (centered, monospace-like)
- transition: none for instant feedback

**Breadcrumb CSS:**
- Flexbox list layout with gap
- Link styling with linkColor, hoverColor
- Current item styling with currentColor, font-weight
- Separator styling
- Ellipsis support for truncation

**Dropdown Base CSS (shared by Multi-Select, ComboBox, MenuButton):**
- position: relative on container
- Dropdown menu: absolute positioning, max-height, overflow-y
- Fade animations: 100ms ease-out for open, 150ms ease-in for close
- .open class toggles opacity and pointer-events
- Hover state: rgba(59, 130, 246, 0.1) background
- Disabled state: opacity 0.5, cursor not-allowed
- z-index: 1000 for overlay

**Multi-Select Dropdown CSS:**
- Checkbox display in dropdown items
- Selected text with ellipsis overflow
- Inherits dropdown base CSS

**Combo Box CSS:**
- Input field styling (transparent background, inherits colors)
- Placeholder opacity: 0.5
- Empty state: italic gray "No matching options"
- Inherits dropdown base CSS

**Menu Button CSS:**
- Inline-flex button with centered content
- Menu divider: 1px line with borderColor
- Inherits dropdown base CSS

**Tab Bar CSS:**
- Flexbox layout (row or column based on orientation)
- Active/inactive tab styling
- Three indicator styles:
  - background: solid indicatorColor background
  - underline: 3px border-bottom (horizontal) or border-right (vertical)
  - accent-bar: positioned divs for underline + accent
- Icon sizing: 16×16px
- transition: none for instant tab switching

**Tag Selector CSS:**
- Flex column with gap
- Tags container with wrap
- Chip styling: inline-flex, gap, padding, border-radius
- Remove button: 14px circle, hover brightness(1.2)
- Optional input wrapper with dropdown
- Dropdown fade: same 100ms/150ms timing

**Tree View CSS:**
- Background color on container
- Tree node: flex layout, hover and selected states
- Arrow styling: 16×16px, ▶ character, rotate(90deg) when expanded
- Empty arrow: visibility hidden (for leaf nodes)
- Node name: ellipsis overflow, padding
- transition: none for instant selection

### HTML Generation (Task 2)

**Stepper HTML:**
- data-value, data-min, data-max, data-step attributes
- Decrement button with class="stepper-button decrement"
- Value display span (if showValue)
- Increment button with class="stepper-button increment"
- aria-label on buttons

**Breadcrumb HTML:**
- nav with aria-label="breadcrumb"
- ol with li items
- Links for non-last items with data-item-id
- span.breadcrumb-current for last item
- Ellipsis support (first item + ellipsis + last N items)

**Multi-Select Dropdown HTML:**
- data-max-selections attribute
- Button with selected text (comma-separated, ellipsis overflow)
- Dropdown menu with checkbox items
- role="listbox" aria-multiselectable="true"

**Combo Box HTML:**
- role="combobox" aria-expanded="false" aria-autocomplete="list"
- Text input with value and placeholder
- Dropdown list with data-value on options
- Empty state div (hidden by default)

**Menu Button HTML:**
- Button with aria-haspopup="menu"
- Dropdown menu with role="menu"
- Menu items with role="menuitem", data-item-id, data-index
- Divider support (menu-divider class)
- Disabled items marked with class

**Tab Bar HTML:**
- data-active-tab attribute on container
- role="tablist"
- Tabs with role="tab", aria-selected, data-tab-index, data-tab-id
- Icon SVG inline (uses getBuiltInIconSVG helper)
- Label span (if showLabel)
- Indicator divs for underline/accent-bar styles

**Tag Selector HTML:**
- role="list" on container
- Tags container with chips
- Each chip: data-tag-id, label span, remove button with aria-label
- Optional input wrapper with dropdown
- Dropdown items: data-tag-id

**Tree View HTML:**
- data-selected-id attribute on container
- Recursive node generation via generateTreeNodeHTML helper
- Each node: data-node-id, data-level, data-selected, padding-left for indentation
- Arrow span with .empty class for leaf nodes
- Node name span with ellipsis

## Deviations from Plan

None - plan executed exactly as written.

## Technical Implementation

**CSS Structure:**
- Helper function for dropdown base CSS (DRY for 3 dropdown types)
- Orientation-based flexbox layouts (horizontal/vertical)
- Conditional CSS for showInput, indicatorStyle variations
- Consistent transition: none across all elements

**HTML Structure:**
- Helper function getBuiltInIconSVG for Tab Bar icons
- Recursive helper generateTreeNodeHTML for Tree View
- Truncation logic in Breadcrumb generation
- Conditional rendering based on showValue, showInput, showLabel properties

**JUCE Data Attributes:**
- Stepper: data-value, data-min, data-max, data-step (for parameter binding)
- Tab Bar: data-active-tab (C++ queries to get active tab index)
- Tree View: data-selected-id (C++ queries for selected node), data-node-id (per node)
- Breadcrumb: data-item-id (for click handling)
- Multi-Select: data-max-selections (limit enforcement)
- All: data-type for element type identification

**Accessibility:**
- ARIA roles: listbox, combobox, menu, menuitem, tablist, tab, list
- ARIA attributes: aria-multiselectable, aria-autocomplete, aria-haspopup, aria-selected, aria-label
- Semantic HTML: nav, ol, button, input elements

## Verification

```bash
# Verify CSS generation for navigation elements
grep -c "stepper\|tabbar\|treeview\|breadcrumb" src/services/export/cssGenerator.ts
# Output: 12 (4 element types × 3 mentions each)

# Verify HTML generation with JUCE data attributes
grep -c "data-active-tab\|data-value.*data-min\|data-selected-id" src/services/export/htmlGenerator.ts
# Output: 5+ (key data attributes present)
```

## Next Phase Readiness

**Ready for:**
- Phase 25: Visualization elements export (can reuse dropdown base patterns)
- JUCE integration testing (all data attributes in place)
- Accessibility testing (ARIA attributes complete)

**Provides to future phases:**
- Dropdown base CSS pattern (reusable for other dropdown-like elements)
- Recursive HTML generation pattern (for tree-like structures)
- Data attribute pattern for JUCE binding (established convention)

## Commits

1. `a9e5774`: feat(24-06): add CSS generation for navigation elements
   - Added generateStepperCSS, generateBreadcrumbCSS, generateMultiSelectDropdownCSS, generateComboBoxCSS, generateMenuButtonCSS, generateTabBarCSS, generateTagSelectorCSS, generateTreeViewCSS
   - Added generateDropdownBaseCSS helper for shared dropdown styles
   - All elements use transition: none
   - Dropdown fade timing: 100ms open, 150ms close

2. `1bf08ea`: feat(24-06): add HTML generation for navigation elements
   - Added generateStepperHTML, generateBreadcrumbHTML, generateMultiSelectDropdownHTML, generateComboBoxHTML, generateMenuButtonHTML, generateTabBarHTML, generateTagSelectorHTML, generateTreeViewHTML
   - Added getBuiltInIconSVG helper for Tab Bar icons
   - Added generateTreeNodeHTML recursive helper for Tree View
   - All elements include JUCE data attributes and ARIA attributes

## File Changes

**src/services/export/cssGenerator.ts** (+563 lines):
- Added imports: StepperElementConfig, BreadcrumbElementConfig, MultiSelectDropdownElementConfig, ComboBoxElementConfig, MenuButtonElementConfig, TabBarElementConfig, TagSelectorElementConfig, TreeViewElementConfig
- Added 8 CSS generation cases in generateElementCSS switch
- Added 9 helper functions (8 element types + 1 shared dropdown base)

**src/services/export/htmlGenerator.ts** (+303 lines):
- Added imports: StepperElementConfig, BreadcrumbElementConfig, BreadcrumbItem, MultiSelectDropdownElementConfig, ComboBoxElementConfig, MenuButtonElementConfig, MenuItem, TabBarElementConfig, TabConfig, TagSelectorElementConfig, Tag, TreeViewElementConfig, TreeNode
- Added 8 HTML generation cases in generateElementHTML switch
- Added 9 helper functions (8 element types + 1 recursive tree node generator)

## Success Criteria Met

- [x] CSS generators output styles for all 8 navigation element types
- [x] Dropdown elements have 100ms fade-in, 150ms fade-out CSS transitions
- [x] Tab Bar CSS includes indicator styles (background, underline, accent-bar)
- [x] Tree View CSS handles node selection and hover states
- [x] HTML generators output proper structure with data attributes for JUCE
- [x] Stepper outputs data-value, data-min, data-max, data-step
- [x] Tab Bar outputs data-active-tab
- [x] Tree View outputs data-selected-id and data-node-id
- [x] All elements include ARIA attributes for accessibility

---

**Phase 24 Plan 06 complete.** All 8 navigation element types have full export support with CSS generation, HTML generation, JUCE data attributes, and accessibility features.
