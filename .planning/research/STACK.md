# Technology Stack for Layers Panel and Help System

**Project:** VST3 WebView UI Designer - Milestone v1.9
**Researched:** 2026-01-29
**Overall Confidence:** HIGH

## Executive Summary

The good news: **No new dependencies required**. The existing stack already contains everything needed:

1. **Layers Panel:** `react-arborist` (already installed at v3.4.3) provides tree view with drag-to-reorder, which is exactly what a Photoshop/Figma-style layers panel needs.

2. **Help System:** Native `window.open()` with blob URLs (already used in `previewExport.ts`) is sufficient for opening HTML documentation in new windows.

This milestone should focus on **composing existing capabilities** rather than adding new libraries.

---

## Layers Panel: Use react-arborist

### Why react-arborist (Already Installed)

| Criterion | react-arborist | @dnd-kit/sortable | Custom Implementation |
|-----------|----------------|-------------------|----------------------|
| Already in project | Yes (v3.4.3) | Partial (core only) | N/A |
| Drag-to-reorder | Built-in | Need @dnd-kit/sortable + tree wrapper | Manual |
| Parent/child hierarchy | Native | Complex setup | Manual |
| Virtualization | Built-in (react-window) | Manual | Manual |
| Learning curve | Low (already used) | Medium | High |

**Recommendation:** Use `react-arborist` for the layers panel.

### Current Usage

The project already uses `react-arborist` for the `TreeViewRenderer` component in `src/components/elements/renderers/controls/TreeViewRenderer.tsx`. The same patterns apply directly to a layers panel.

### Integration Points

```
Elements stored in: store/elementsSlice.ts
  - elements: ElementConfig[]
  - Z-order: Array index determines render order
  - Hierarchy: parentId field + children array

Layers Panel will:
  - Read elements from store
  - Transform flat array to tree structure (using parentId)
  - Use react-arborist for tree rendering + drag reorder
  - Call store actions on reorder: moveToFront, moveToBack, moveForward, moveBackward
  - Call updateElement for visibility/lock toggle
```

### Data Transformation

Elements already have the necessary fields for a layers panel:

```typescript
// From types/elements/base.ts
interface BaseElementConfig {
  id: string
  name: string       // Display name in layers
  locked: boolean    // Lock toggle
  visible: boolean   // Visibility toggle (already exists!)
  parentId?: string  // For hierarchy
  // ...
}
```

The `visible` field already exists but may not be connected to rendering. Verify and connect.

### What NOT to Add

| Library | Why NOT |
|---------|---------|
| `@dnd-kit/sortable` | react-arborist already handles tree drag-and-drop |
| `dnd-kit-sortable-tree` | Wrapper around @dnd-kit, redundant with react-arborist |
| `react-beautiful-dnd` | Deprecated, maintainer recommends @dnd-kit |
| `react-dnd` | Heavier, older API, react-arborist is simpler |

---

## Help System: Use Native window.open()

### Why Native Browser API

The project already uses `window.open()` with blob URLs in `previewExport.ts`:

```typescript
// Existing pattern in previewExport.ts
const blob = new Blob([standaloneHTML], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const previewWindow = window.open(url, '_blank');
```

This exact pattern works for help documentation windows.

### What NOT to Add

| Library | Why NOT |
|---------|---------|
| `react-new-window` | Only 3.68KB, but unnecessary - native API works fine |
| `react-popout` | Same reason - adds abstraction for no benefit |
| Markdown parser | Help content is static HTML, not dynamic markdown |

### Implementation Pattern

```typescript
// Simple help window service
export function openHelpWindow(topic: string): void {
  const helpContent = getHelpContent(topic); // Returns HTML string
  const blob = new Blob([helpContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const helpWindow = window.open(
    url,
    `help-${topic}`,  // Named window prevents duplicates
    'width=600,height=400,scrollbars=yes'
  );

  // Cleanup after load
  if (helpWindow) {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
```

### Help Content Storage

Help content can be:

1. **Static HTML files** in `public/help/` - simplest approach
2. **Bundled strings** in TypeScript - works with Vite
3. **External URL** - if help is hosted separately

**Recommendation:** Bundled strings in TypeScript for:
- Type safety
- Tree shaking (only include used help)
- No separate file management
- Works in all environments

---

## Summary: No Dependencies to Add

### Existing Stack (Relevant Subset)

| Package | Version | Use Case |
|---------|---------|----------|
| `react-arborist` | 3.4.3 | Layers panel tree view |
| `zustand` | 5.0.10 | State management for visibility/lock |
| `@dnd-kit/core` | 6.3.1 | Already provides drag infrastructure |
| Native `window.open` | Browser API | Help windows |

### New Code to Write (Not Libraries)

| Component | Location | Approach |
|-----------|----------|----------|
| `LayersPanel` | `src/components/Layers/` | react-arborist tree |
| `useLayersTree` | `src/hooks/` | Transform elements to tree |
| `helpService` | `src/services/help/` | window.open wrapper |
| `HelpButton` | `src/components/Properties/` | Small icon button |
| Help content | `src/content/help/` | Static HTML strings |

---

## Verification Notes

### react-arborist v3.4.3

- **Source:** [npm package page](https://www.npmjs.com/package/react-arborist)
- **Confidence:** HIGH (already in package.json)
- **Last published:** ~1 year ago
- **React 19 compatible:** Yes (version 3.4.3 bumped react-window for React 19)

### @dnd-kit/sortable NOT Needed

- **Current installed:** @dnd-kit/core 6.3.1, @dnd-kit/utilities 3.2.2
- **@dnd-kit/sortable latest:** 10.0.0
- **Why skip:** react-arborist handles sorting internally; adding sortable would be redundant

### window.open Browser API

- **Confidence:** HIGH (already used in codebase)
- **Cross-browser:** Universal support
- **Popup blockers:** User may need to allow popups (handled in previewExport.ts already)

---

## Roadmap Implications

### Phase Order Recommendation

1. **Layers Panel first** - Standalone panel, no dependencies on help system
2. **Help System second** - Can reference layers panel in help content

### Integration Points to Verify

Before implementing, confirm these work as expected:

1. **visible field rendering:** Elements have `visible: boolean` but verify canvas respects it
2. **Z-order via array index:** elementsSlice uses array position for z-order - layers panel reverse this for display (top layer = last element)
3. **Container hierarchy:** Elements have `parentId` and `children` fields - layers panel should show nested structure

### Low-Risk Assessment

- No new dependencies = no version conflicts
- Patterns already established in codebase
- react-arborist already proven in TreeViewRenderer

---

## Sources

- [react-arborist npm](https://www.npmjs.com/package/react-arborist) - Version verification
- [react-arborist GitHub](https://github.com/brimdata/react-arborist) - Documentation and features
- [@dnd-kit/sortable npm](https://www.npmjs.com/package/@dnd-kit/sortable) - Considered but not needed
- [react-new-window GitHub](https://github.com/rmariuzzo/react-new-window) - Considered but not needed
- Local file: `src/components/elements/renderers/controls/TreeViewRenderer.tsx` - Existing react-arborist usage
- Local file: `src/services/export/previewExport.ts` - Existing window.open pattern
- Local file: `src/types/elements/base.ts` - Element fields (locked, visible, parentId)
- Local file: `src/store/elementsSlice.ts` - Z-order actions already exist
