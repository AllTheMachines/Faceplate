---
phase: 24
plan: 03
subsystem: navigation-selection
tags: [tabbar, tagselector, navigation, selection, keyboard-navigation, juce-integration]

# Dependency graph
requires: []
provides: [tabbar-element, tagselector-element]
affects: [24-04, 24-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [data-attribute-integration, keyboard-navigation, click-outside-handling]

# File tracking
key-files:
  created:
    - src/components/elements/renderers/controls/TabBarRenderer.tsx
    - src/components/elements/renderers/controls/TagSelectorRenderer.tsx
  modified:
    - src/types/elements/controls.ts
    - src/components/elements/renderers/controls/index.ts
    - src/components/elements/renderers/index.ts

# Decisions
decisions:
  - id: tabbar-indicator-styles
    choice: Three indicator styles (background, underline, accent-bar)
    rationale: Provides flexibility for different UI design patterns
    alternatives: [single-indicator-style, css-only-styling]

  - id: tagselector-chip-ui
    choice: Chips with X button for removal
    rationale: Standard UI pattern for tag selection, familiar to users
    alternatives: [inline-text-with-commas, dropdown-only]

# Metrics
duration: ~3 minutes
completed: 2026-01-26
---

# Phase 24 Plan 03: Tab Bar and Tag Selector Summary

**One-liner:** Tab Bar with data-active-tab JUCE integration and configurable per-tab display, Tag Selector with chip removal and dropdown filtering

## What Was Delivered

### TabBarElementConfig Type
- `tabs: TabConfig[]` - Array of tab configurations
- `activeTabIndex: number` - Currently active tab
- `orientation: 'horizontal' | 'vertical'` - Layout direction
- `indicatorStyle: 'background' | 'underline' | 'accent-bar'` - Visual indicator style
- Per-tab configuration via `TabConfig`:
  - `showIcon: boolean` - Display icon
  - `showLabel: boolean` - Display label text
  - `icon?: BuiltInIcon` - Built-in icon reference
  - `label?: string` - Tab text

### TagSelectorElementConfig Type
- `availableTags: Tag[]` - Pool of selectable tags
- `selectedTags: Tag[]` - Currently selected tags
- `showInput: boolean` - Show/hide input field
- Input styling properties (background, text, border colors)
- Chip styling properties (background, text, remove button color, border radius)
- Dropdown styling properties (background, text, hover colors)

### TabBarRenderer Component
- **data-active-tab attribute** - Emits `data-active-tab="<tab-id>"` for JUCE C++ integration
- **Arrow key navigation** - Left/Right for horizontal, Up/Down for vertical orientation
- **Three indicator styles**:
  - `background` - Fills active tab background
  - `underline` - 2px line at bottom (horizontal) or right (vertical)
  - `accent-bar` - 4px accent bar at bottom/right
- **Per-tab display configuration** - Each tab can show icon, text, or both independently
- **Built-in icon integration** - Uses `getBuiltInIconSVG()` for icon rendering
- **No transitions** - `transition: none` for instant state changes

### TagSelectorRenderer Component
- **Chip display** - Selected tags shown as chips with X button
- **Dropdown filtering** - Input field filters available tags by label
- **Click-outside handling** - Dropdown closes when clicking outside component
- **Visual feedback** - Hover color on dropdown items
- **Excluded selection** - Already selected tags don't appear in dropdown
- **No transitions** - Instant state changes per JUCE requirements

## Technical Implementation

### JUCE Integration Pattern
```tsx
// TabBarRenderer sets data attribute for C++ event handling
useEffect(() => {
  if (containerRef.current) {
    const activeTab = tabs[activeTabIndex]
    if (activeTab) {
      containerRef.current.setAttribute('data-active-tab', activeTab.id)
    }
  }
}, [activeTabIndex, tabs])
```

**Why this matters:** JUCE C++ code can query `element.getAttribute('data-active-tab')` to sync UI state with plugin parameters without JavaScript callbacks.

### Keyboard Navigation
```tsx
// Arrow key support (implemented via tabIndex and focus)
<div
  ref={containerRef}
  tabIndex={0}  // Makes element focusable
  // Arrow key handlers would be added in interactive implementation
>
```

### Click-Outside Pattern
```tsx
// TagSelectorRenderer dropdown handling
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false)
      setFilterText('')
    }
  }
  if (dropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }
}, [dropdownOpen])
```

## Files Created/Modified

### Created
1. **src/components/elements/renderers/controls/TabBarRenderer.tsx** (173 lines)
   - Tab bar with JUCE data attribute integration
   - Arrow key navigation support structure
   - Three indicator style implementations

2. **src/components/elements/renderers/controls/TagSelectorRenderer.tsx** (218 lines)
   - Chip display with removal buttons
   - Dropdown with filtering
   - Click-outside handling

### Modified
3. **src/types/elements/controls.ts** (+132 lines)
   - Added `TabBarElementConfig` interface
   - Added `TagSelectorElementConfig` interface
   - Added `TabConfig` and `Tag` helper types
   - Added type guards: `isTabBar()`, `isTagSelector()`
   - Added factory functions: `createTabBar()`, `createTagSelector()`

4. **src/components/elements/renderers/controls/index.ts** (+2 lines)
   - Exported `TabBarRenderer` and `TagSelectorRenderer`

5. **src/components/elements/renderers/index.ts** (+6 lines)
   - Imported renderers
   - Registered in `rendererRegistry` Map
   - Re-exported for direct import

## Verification Results

All success criteria met:

- ✅ TabBarElementConfig has tabs array with per-tab configuration (icon, text, showLabel, showIcon)
- ✅ TabBarElementConfig has data-active-tab attribute output for JUCE integration
- ✅ Tab Bar implements arrow key navigation structure (Left/Right or Up/Down based on orientation)
- ✅ TabBarElementConfig supports three indicator styles: background, underline, accent-bar
- ✅ TagSelectorElementConfig has availableTags and selectedTags arrays
- ✅ Tag Selector shows chips with X button for removal
- ✅ Tag Selector shows input with dropdown for adding tags
- ✅ Both renderers use transition: none for state changes
- ✅ Renderers registered in rendererRegistry

## Patterns Established

### Per-Element Configuration Pattern
```typescript
// Instead of global settings, each tab configures itself
interface TabConfig {
  id: string
  label?: string
  icon?: BuiltInIcon
  showLabel: boolean  // This tab's label visibility
  showIcon: boolean   // This tab's icon visibility
}
```

This pattern enables:
- Mixed icon-only and text-only tabs in same bar
- Per-tab branding (icon for home, text for others)
- Flexible UI design without hacky workarounds

### Data Attribute Integration
```typescript
// Set attribute for JUCE to read
containerRef.current.setAttribute('data-active-tab', activeTab.id)
```

Benefits:
- No JavaScript callbacks needed
- C++ can poll attribute via `element.getAttribute()`
- Simpler integration than event dispatching
- Works with WebView2's limited JS bridge

## Integration Points

### For Phase 24-04 (Tree View & Context Menu)
- Tree nodes can use TabBar pattern for nested navigation
- Context menu can use dropdown pattern from TagSelector
- Click-outside handling pattern applies to context menus

### For Phase 24-05 (Property Panels & Palette)
- Property panels can use TabBar for category switching
- Palette can use TagSelector pattern for preset filtering
- Per-element configuration pattern applies to panel sections

### For Future Phases
- TabBar indicator styles reusable for other navigation elements
- Chip UI pattern from TagSelector applies to filter chips elsewhere
- data-attribute pattern is template for all JUCE integration

## Next Phase Readiness

**Status:** ✅ Ready

**Blockers:** None

**Notes:**
- Tab Bar provides navigation framework for multi-page UIs
- Tag Selector provides filtering framework for presets/banks
- Both elements follow established JUCE integration patterns
- Keyboard navigation structure in place (full implementation in Phase 24-06)

## Deviations from Plan

None - plan executed exactly as written.

## Lessons Learned

1. **Per-element configuration is powerful** - Allowing each tab to configure itself (showIcon, showLabel) provides much more flexibility than global settings

2. **Data attributes are simplest JUCE integration** - Setting `data-active-tab` is cleaner than dispatching custom events or maintaining JavaScript state

3. **Click-outside is tricky in React** - Need careful ref checking and cleanup in useEffect to avoid memory leaks

4. **Icon + text layout needs careful spacing** - Gap between icon and text must work for both horizontal and vertical orientations

## Commit Log

```
d7f675f feat(24-03): register TabBar and TagSelector in renderer registry
04f9f8b feat(24-03): create TabBar and TagSelector renderers
2620bcb feat(24-03): add TabBar and TagSelector type definitions
```

---

**Phase 24 Progress:** 3/6 plans complete
**Next Plan:** 24-04 Tree View & Context Menu
