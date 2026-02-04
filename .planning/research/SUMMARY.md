# Research Summary: v1.9 Layers & Help System

**Project:** VST3 WebView UI Designer
**Features:** Layers panel, Help buttons
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

**No new dependencies required.** The existing stack already contains everything needed:

1. **Layers Panel:** `react-arborist` (already at v3.4.3) provides tree view with drag-to-reorder
2. **Help System:** Native `window.open()` with blob URLs (already in previewExport.ts)

This milestone is about **composing existing capabilities** rather than adding libraries.

## Key Findings

### Stack Additions: None Required

| Feature | Solution | Status |
|---------|----------|--------|
| Layers tree view | react-arborist | Already installed (v3.4.3) |
| Drag-to-reorder | react-arborist | Built-in |
| Help windows | window.open() | Browser native |
| Help content | Bundled HTML strings | TypeScript modules |

### Layers Panel Architecture

**Data already exists:**
- `visible: boolean` - Elements already have visibility field
- `locked: boolean` - Elements already have lock field
- `parentId?: string` - Elements already have hierarchy
- Z-order via array index in elementsSlice

**New components needed:**
- `LayersPanel` - Tree view using react-arborist
- `useLayersTree` hook - Transform flat elements to tree structure
- `LayersSlice` (optional) - If separate state needed

**Integration points:**
- Read elements from existing elementsSlice
- Call existing actions: `moveToFront`, `moveToBack`, `updateElement`
- Transform array to tree using parentId field

### Help System Architecture

**Pattern already established:**
```typescript
// From previewExport.ts
const blob = new Blob([htmlContent], { type: 'text/html' });
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
```

**New components needed:**
- `HelpButton` - Small (?) icon component
- `helpService.ts` - window.open wrapper with topic routing
- `help/*.ts` - Static HTML content modules

**Content organization:**
- Bundled as TypeScript modules (tree-shakeable)
- One file per Properties Panel section
- Simple HTML with dark theme styling

## Layers Panel Features

### Table Stakes (Must Have)

| Feature | Implementation |
|---------|---------------|
| Layer list showing all elements | react-arborist tree |
| Visibility toggle per element | Click eye icon, call updateElement |
| Lock toggle per element | Click lock icon, call updateElement |
| Drag to reorder | react-arborist built-in |
| Show element names | From element.name field |
| Show element type icons | Map type to icon |

### Nice to Have (v1.9+)

| Feature | Implementation |
|---------|---------------|
| Rename element inline | Double-click edit |
| Group layers | Virtual grouping (no element change) |
| Select element from layers | Sync with canvas selection |
| Multi-select in layers | Ctrl/Shift click |

## Help System Features

### Table Stakes (Must Have)

| Feature | Implementation |
|---------|---------------|
| Help button per section | (?) icon in section header |
| Opens new window | window.open with dimensions |
| Section-specific content | Route by section name |
| Dark theme styling | Match app theme |

### Nice to Have (v1.9+)

| Feature | Implementation |
|---------|---------------|
| Searchable help index | Additional index page |
| Link between topics | Cross-references |
| Keyboard shortcut (F1) | Global key handler |

## Pitfalls to Avoid

### Layers Panel

1. **Don't rebuild drag-drop from scratch** - react-arborist handles it
2. **Don't create new element storage** - Use existing elementsSlice
3. **Don't duplicate selection state** - Sync with existing selection
4. **Test with nested containers** - Elements inside containers need proper tree structure

### Help System

1. **Don't over-engineer** - Simple HTML strings are sufficient
2. **Don't add markdown parser** - Static HTML is simpler and safer
3. **Don't fetch external content** - Bundled content works offline
4. **Handle popup blockers** - Show fallback if window.open fails

## Implementation Order

### Phase 41: Bug Fixes (Quick Wins)
- #2: Folder export subfolder fix
- #3: Container multi-select drag fix

### Phase 42: Layers Panel
1. Create LayersPanel component with react-arborist
2. Add visibility/lock toggle UI
3. Wire to elementsSlice actions
4. Add to LeftPanel (new tab alongside Elements/Assets)
5. Sync selection between canvas and layers

### Phase 43: Help System
1. Create HelpButton component
2. Create helpService with window.open wrapper
3. Write help content for each Properties section
4. Add HelpButton to each PropertySection header
5. Style help window content

## Files to Create

### Layers Panel
- `src/components/Layers/LayersPanel.tsx`
- `src/components/Layers/LayerItem.tsx`
- `src/hooks/useLayersTree.ts`
- `src/components/Layers/index.ts`

### Help System
- `src/services/help/helpService.ts`
- `src/components/Properties/HelpButton.tsx`
- `src/content/help/position-size.html.ts`
- `src/content/help/appearance.html.ts`
- `src/content/help/[section].html.ts` (one per section)

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| react-arborist learning curve | Low | Already used in TreeViewRenderer |
| Popup blockers | Medium | Fallback UI with link |
| Performance with 100+ layers | Low | react-arborist has virtualization |
| Help content maintenance | Low | TypeScript modules are easy to update |

## Sources

- react-arborist npm: https://www.npmjs.com/package/react-arborist
- react-arborist GitHub: https://github.com/brimdata/react-arborist
- Local: src/components/elements/renderers/controls/TreeViewRenderer.tsx (existing usage)
- Local: src/services/export/previewExport.ts (window.open pattern)
- Local: src/store/elementsSlice.ts (existing actions)

---

**Research confidence:** HIGH
**Ready for requirements:** Yes
