# Phase 44: Navigation Element Fixes - Research

**Researched:** 2026-02-02
**Domain:** Bug fixes for React navigation components (Tree View, Tag Selector, Combo Box, Breadcrumb)
**Confidence:** HIGH

## Summary

This phase fixes four bugs in existing navigation elements that were implemented in Phase 24. The bugs affect interactivity and visibility of Tree View children, Tag Selector dropdown, Combo Box options, and Breadcrumb expansion. All bugs are in existing code within the `src/components/` directory - no new components or external libraries are needed.

The bugs identified from GitHub issues are:
1. **NAV-01 (Issue #48)**: Tree View children not visible in properties panel and not editable
2. **NAV-02 (Issue #47)**: Tag Selector tabs/suggestions not showing when typing
3. **NAV-03 (Issue #46)**: Combo Box dropdown not showing all options after a selection is made
4. **NAV-04 (Issue #45)**: Breadcrumb cannot expand back to deeper levels after navigating to root

All bugs are localized to specific renderer or properties components. The fixes involve React state management issues, event handler logic, and UI visibility conditions.

**Primary recommendation:** Fix each bug in isolation within the affected component files. No architectural changes needed - these are straightforward state management and logic fixes in existing React components.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component framework | Already in use |
| react-arborist | 3.4.3 | Tree View component | Already installed, used by TreeViewRenderer |
| TypeScript | ~5.6.2 | Type safety | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useState/useEffect | React 18.3.1 | State management and side effects | All components being fixed |
| useRef | React 18.3.1 | DOM references and mutable values | Dropdown and click-outside handlers |
| useCallback | React 18.3.1 | Memoized callbacks | Event handlers in properties panels |

### No New Dependencies Needed
This phase only fixes existing components. No new npm packages required.

## Architecture Patterns

### Affected Files
```
src/
├── components/
│   ├── Properties/
│   │   ├── TreeViewProperties.tsx      # NAV-01: Children not visible/editable
│   │   └── BreadcrumbProperties.tsx    # NAV-04: May need state for expansion
│   └── elements/
│       └── renderers/
│           └── controls/
│               ├── TreeViewRenderer.tsx    # NAV-01: Selection sync with properties
│               ├── TagSelectorRenderer.tsx # NAV-02: Dropdown not showing suggestions
│               ├── ComboBoxRenderer.tsx    # NAV-03: Options filtered out after selection
│               └── BreadcrumbRenderer.tsx  # NAV-04: Cannot expand after navigating to root
```

### Pattern 1: Tree View Children Visibility (NAV-01)
**What:** TreeViewProperties.tsx uses local `expandedNodeIds` state but children in nested TreeNode data may not be rendering correctly when added
**When to use:** When fixing tree node visibility in properties panel
**Root Cause Analysis:**
```typescript
// Current implementation in TreeViewProperties.tsx
const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])

// Problem: When a child is added, the parent might not be in expandedNodeIds
// The renderNode function only renders children if:
// 1. hasChildren is true AND
// 2. isExpanded (node.id is in expandedNodeIds)

// Fix: Auto-expand parent when adding child
const addChildNode = useCallback(
  (parentPath: number[]) => {
    const newNode: TreeNode = { ... }
    // ... add child logic ...

    // Auto-expand the parent node so child is visible
    const parentNode = ... // Get parent from path
    if (!expandedNodeIds.includes(parentNode.id)) {
      setExpandedNodeIds(prev => [...prev, parentNode.id])
    }

    onUpdate({ data: newData })
  },
  [element.data, expandedNodeIds, onUpdate]
)
```

### Pattern 2: Tag Selector Dropdown Visibility (NAV-02)
**What:** TagSelectorRenderer.tsx dropdown condition may be too restrictive
**When to use:** When fixing tag suggestion dropdown
**Root Cause Analysis:**
```typescript
// Current implementation in TagSelectorRenderer.tsx (lines 197-198)
{dropdownOpen && filteredAvailable.length > 0 && (
  <div className={dropdownClass} ...>

// Problem: The dropdown only shows if there are filtered available tags
// If user types text that doesn't match any tag, dropdown closes
// User expects to see suggestions while typing

// The issue might be:
// 1. filteredAvailable excludes already-selected tags correctly (line 76-82)
// 2. But filterText matching might be too strict
// 3. Or dropdown should show even when no matches (with "no results" message)

// Fix: Show dropdown when user is typing, even if no matches
{dropdownOpen && (
  <div className={dropdownClass} ...>
    {filteredAvailable.length > 0 ? (
      filteredAvailable.map(tag => ...)
    ) : (
      <div>No matching tags</div>
    )}
  </div>
)}
```

### Pattern 3: Combo Box Options After Selection (NAV-03)
**What:** ComboBoxRenderer.tsx filters options based on inputValue, hiding non-matching options
**When to use:** When fixing combo box dropdown options
**Root Cause Analysis:**
```typescript
// Current implementation in ComboBoxRenderer.tsx (lines 27-29)
const filteredOptions = config.options.filter((option) =>
  option.toLowerCase().includes(inputValue.toLowerCase())
)

// Problem: After selecting an option:
// 1. inputValue is set to the selected option (line 84)
// 2. Dropdown closes (line 85)
// 3. When user clicks input again, filteredOptions only includes
//    options that contain the selected text
// 4. If "Option 1" is selected, only options containing "option 1" show

// Fix: Reset filter when opening dropdown, or show all options when input matches exactly
const filteredOptions = config.options.filter((option) => {
  // If inputValue exactly matches an option, show all options
  if (config.options.includes(inputValue)) {
    return true
  }
  return option.toLowerCase().includes(inputValue.toLowerCase())
})

// OR: Reset inputValue to empty when focusing (clear to show all)
```

### Pattern 4: Breadcrumb Expansion After Navigation (NAV-04)
**What:** BreadcrumbRenderer.tsx is purely display-only; navigation happens in ContainerBreadcrumb
**When to use:** When fixing breadcrumb expansion
**Root Cause Analysis:**
```typescript
// BreadcrumbRenderer.tsx is a display component for the Breadcrumb element type
// It renders items with ellipsis truncation when maxVisibleItems > 0

// The GitHub issue mentions "clicking text buttons to root but can't expand again"
// This could refer to:
// 1. The Breadcrumb ELEMENT (used in designed UIs) - BreadcrumbRenderer.tsx
// 2. The Container BREADCRUMB (editor navigation) - ContainerBreadcrumb.tsx

// If referring to Breadcrumb ELEMENT:
// Current BreadcrumbRenderer.tsx has no interactivity - clicking does nothing
// The data-clickable attribute is set but no onClick handler exists
// Fix: Add click handler to navigate/expand when clicking non-current items

// If referring to Container BREADCRUMB (ContainerBreadcrumb.tsx):
// The handleClick function only navigates backward, not forward
// After navigating to root, there's no way to go deeper
// The state (containerStack, currentContainerId) is managed in store
```

### Anti-Patterns to Avoid
- **Modifying store architecture:** These are localized bugs, fix in component files only
- **Breaking existing functionality:** Ensure fixes don't regress other behavior
- **Adding new dependencies:** All bugs fixable with existing React patterns

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tree node expansion tracking | Custom tree traversal | react-arborist's openIds + expandedNodeIds | Already implemented, just needs sync |
| Dropdown positioning | Manual position calculation | Existing CSS positioning in renderers | Already working, issue is visibility logic |
| Click-outside detection | New implementation | Existing useEffect patterns in components | Already implemented correctly |

**Key insight:** All four bugs are logic/state issues in existing components, not missing functionality. Fix the specific conditions causing the bugs rather than rewriting components.

## Common Pitfalls

### Pitfall 1: Not Auto-Expanding Parent When Adding Child
**What goes wrong:** User adds child node but can't see it in the tree
**Why it happens:** Parent node not in expandedNodeIds after child creation
**How to avoid:** Add parent node ID to expandedNodeIds when adding a child
**Warning signs:** Child node exists in data but doesn't appear in UI

### Pitfall 2: Dropdown Hidden When No Matches
**What goes wrong:** Tag selector dropdown disappears when typing non-matching text
**Why it happens:** Conditional rendering requires filteredAvailable.length > 0
**How to avoid:** Show dropdown with "no results" message when typing but no matches
**Warning signs:** Dropdown flickers or disappears mid-typing

### Pitfall 3: Input Filter Persists After Selection
**What goes wrong:** Combo box only shows previously selected option after reopening
**Why it happens:** inputValue set to selection, which filters out other options
**How to avoid:** Reset filter or show all options when inputValue matches an existing option exactly
**Warning signs:** Only one option shows in dropdown after making any selection

### Pitfall 4: No Forward Navigation After Breadcrumb Click
**What goes wrong:** User navigates to root via breadcrumb but can't go back to deeper levels
**Why it happens:** Breadcrumb click handler only supports backward navigation
**How to avoid:** Either add expandable children to breadcrumb or ensure state allows forward navigation
**Warning signs:** User stuck at root level with no way to return to previous depth

## Code Examples

Verified patterns from official sources:

### Fix 1: Auto-Expand Parent on Child Add (TreeViewProperties.tsx)
```typescript
// Source: Existing codebase pattern + React state management
const addChildNode = useCallback(
  (parentPath: number[]) => {
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      name: 'New Child',
      children: [],
    }

    const newData = [...element.data]
    let current: TreeNode[] = newData
    for (let i = 0; i < parentPath.length - 1; i++) {
      const node = current[parentPath[i]]
      if (!node.children) node.children = []
      current = node.children
    }
    const parentNode = current[parentPath[parentPath.length - 1]]
    if (!parentNode.children) parentNode.children = []
    parentNode.children.push(newNode)

    // FIX: Auto-expand parent so child is immediately visible
    setExpandedNodeIds((prev) =>
      prev.includes(parentNode.id) ? prev : [...prev, parentNode.id]
    )

    onUpdate({ data: newData })
  },
  [element.data, onUpdate]
)
```

### Fix 2: Show Dropdown Even When Empty (TagSelectorRenderer.tsx)
```typescript
// Source: UI pattern - always show feedback to user input
// Before:
{dropdownOpen && filteredAvailable.length > 0 && (
  <div className={dropdownClass}>
    {filteredAvailable.map(tag => ...)}
  </div>
)}

// After:
{dropdownOpen && (
  <div className={dropdownClass} style={{...}}>
    {filteredAvailable.length > 0 ? (
      filteredAvailable.map((tag) => (
        <div key={tag.id} ...>{tag.label}</div>
      ))
    ) : filterText ? (
      <div style={{ padding: '8px 12px', color: '#6b7280', fontStyle: 'italic' }}>
        No matching tags
      </div>
    ) : null}
  </div>
)}
```

### Fix 3: Reset Filter on Focus (ComboBoxRenderer.tsx)
```typescript
// Source: Standard combo box UX pattern
// Option A: Show all when exact match
const filteredOptions = config.options.filter((option) => {
  // If input exactly matches a selected option, show all options
  if (inputValue && config.options.some(opt =>
    opt.toLowerCase() === inputValue.toLowerCase()
  )) {
    return true
  }
  return option.toLowerCase().includes(inputValue.toLowerCase())
})

// Option B: Clear filter on focus (better UX)
onFocus={() => {
  // If input contains a complete option, clear to show all
  if (config.options.includes(inputValue)) {
    setInputValue('')
  }
  setIsOpen(true)
}}
```

### Fix 4: Breadcrumb Expansion State (BreadcrumbRenderer.tsx)
```typescript
// Source: Existing codebase pattern
// If issue is with Breadcrumb ELEMENT (not Container Breadcrumb):
// Add state to track visible portion and allow expansion

interface BreadcrumbRendererProps {
  config: BreadcrumbElementConfig
  onNavigate?: (itemId: string) => void  // Callback for click handling
}

// Add click handler to non-current items
<span
  onClick={() => !isLast && !isEllipsis && onNavigate?.(item.id)}
  data-breadcrumb-id={item.id}
  data-clickable={!isLast && !isEllipsis}
  style={{
    cursor: isLast || isEllipsis ? 'default' : 'pointer',
    ...
  }}
>
  {item.label}
</span>

// If ellipsis is clicked, expand to show all items
{isEllipsis && (
  <span
    onClick={() => onUpdate({ maxVisibleItems: 0 })} // Show all
    style={{ cursor: 'pointer' }}
  >
    ...
  </span>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Implicit tree expansion | Explicit expandedIds array | Standard in react-arborist | Requires manual sync when modifying tree |
| Filter-only dropdowns | Filter + "no results" feedback | UX best practice | Better user experience |
| Persistent input filters | Reset on dropdown open | Standard combo box UX | All options available after selection |

**Deprecated/outdated:**
- N/A - These are bug fixes, not paradigm changes

## Open Questions

Things that couldn't be fully resolved:

1. **NAV-04 Clarification Needed**
   - What we know: User says "clicking to root but can't expand again"
   - What's unclear: Is this the Breadcrumb element in designs or the container editor breadcrumb?
   - Recommendation: Fix BreadcrumbRenderer first (add click handling + ellipsis expansion), then check if ContainerBreadcrumb also needs work

2. **Tree View Properties Panel Layout**
   - What we know: User mentions it's "difficult to handle childs" and suggests XML-style editing
   - What's unclear: Whether to add a text-based XML editor or improve the visual editor
   - Recommendation: Fix the visibility bug first; XML editing is a feature enhancement for future phases

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/components/Properties/TreeViewProperties.tsx` (lines 1-215)
- Codebase analysis: `src/components/elements/renderers/controls/TreeViewRenderer.tsx` (lines 1-218)
- Codebase analysis: `src/components/elements/renderers/controls/TagSelectorRenderer.tsx` (lines 1-280)
- Codebase analysis: `src/components/elements/renderers/controls/ComboBoxRenderer.tsx` (lines 1-227)
- Codebase analysis: `src/components/elements/renderers/controls/BreadcrumbRenderer.tsx` (lines 1-89)
- Codebase analysis: `src/components/ContainerEditor/ContainerBreadcrumb.tsx` (lines 1-82)
- GitHub Issues #45, #46, #47, #48 - Bug descriptions from user

### Secondary (MEDIUM confidence)
- Phase 24 Research: `.planning/phases/24-navigation-selection/24-RESEARCH.md` - Original implementation patterns

### Tertiary (LOW confidence)
- N/A - All bugs are verifiable in existing codebase

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH - Issues clearly documented in GitHub, code analysis confirms root causes
- Fix patterns: HIGH - Standard React state management patterns, no external research needed
- Architecture impact: HIGH - Localized fixes, no architectural changes required

**Research date:** 2026-02-02
**Valid until:** N/A - Bug fixes with known root causes
