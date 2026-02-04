# Feature Landscape: Layers Panel and Help System

**Domain:** Visual Design Tool - Layers Panel & Contextual Help
**Researched:** 2026-01-29
**Focus:** v1.9 features (GitHub #4: Layers system, GitHub #6: Help buttons)

## Table Stakes

Features users expect. Missing = product feels incomplete or unprofessional.

### Layers Panel Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Layer list with element names** | Core function - users need to see all elements | Low | Already have elements array in store |
| **Selection sync** | Click layer = select on canvas, select on canvas = highlight layer | Low | Bi-directional sync is fundamental |
| **Visibility toggle (eye icon)** | Standard in ALL design tools (Photoshop, Figma, Illustrator) | Low | `visible` property already exists in BaseElementConfig |
| **Lock toggle (padlock icon)** | Standard in all design tools | Low | `locked` property already exists in BaseElementConfig |
| **Z-order visual representation** | Top of list = front, bottom = back | Low | Current element array order represents z-order |
| **Drag-to-reorder** | Users expect to drag layers to change z-order | Medium | Need @dnd-kit integration for list reordering |
| **Element type indicator** | Icon or text showing element type | Low | Already have element.type |
| **Scroll for long lists** | 100+ element types means many elements | Low | Standard overflow-y-auto |

### Help System Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Help icon (?) next to property sections** | Universal pattern for contextual help | Low | Add to PropertySection component |
| **Tooltip on hover/click** | Shows brief explanation | Low | Can use native title or custom tooltip |
| **Help content per section** | Position, Identity, Lock, SVG need explanations | Low | Static content lookup |
| **Concise content (under 130 chars)** | Best practice - tooltips should be brief | Low | Content writing task |

## Differentiators

Features that set product apart. Not expected, but valued when present.

### Layers Panel Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Parent-child hierarchy display** | Shows container relationships visually | Medium | Already have parentId on elements |
| **Collapse/expand for containers** | Reduces visual clutter for nested elements | Medium | Figma-style disclosure triangles |
| **Multi-select in layers** | Shift-click, Ctrl-click selection in layer list | Medium | Extend existing selection logic |
| **Drag into containers** | Drop layer onto container to reparent | High | Complex drop zone logic |
| **Search/filter layers** | Find elements by name in large projects | Medium | Filter input above list |
| **Layer thumbnails** | Mini preview of element appearance | High | Render element to small canvas |
| **Rename inline** | Double-click layer name to edit | Low | Already have InlineEditName component |
| **Keyboard shortcuts** | Delete, Ctrl+]/[ for z-order in layer list | Low | Extend existing keyboard handling |
| **Visual drag preview** | Ghost image when dragging layers | Medium | @dnd-kit DragOverlay |
| **Drop position indicator** | Line showing where layer will drop | Low | @dnd-kit standard pattern |

### Help System Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Rich HTML help content** | Formatted docs, not just plain text | Medium | Modal or panel with HTML |
| **Element-specific help** | Help varies by element type selected | Medium | Need content per element type |
| **Learn more links** | Link to full documentation | Low | Add URLs to help content |
| **Keyboard shortcut reference** | Show shortcuts in context | Low | Already have HelpPanel shortcuts |
| **"What's this?" mode** | Click-to-learn UI discovery mode | High | Requires overlay system |
| **Animated examples** | Show how properties affect rendering | High | Complex, defer |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

### Layers Panel Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Named layer groups (folders)** | Over-engineering for v1.9 - containers already provide grouping | Use container hierarchy as natural grouping |
| **Layer colors/tags** | Visual noise, unclear benefit for audio plugin UIs | Defer - let user feedback drive need |
| **Layer effects (blend modes, opacity)** | Not relevant to VST UI export | Element-level opacity if needed |
| **Photoshop-style layer linking** | Confusing when containers exist | Use multi-select for temporary grouping |
| **Layer panel tabs (like Procreate)** | Unnecessary complexity | Single unified list |
| **Automatic layer naming AI** | Over-engineering | Manual naming, user controls names |
| **Layer search with regex** | Over-engineering | Simple substring match only |
| **Layer templates/presets** | Out of scope | Focus on core functionality |

### Help System Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Guided tours** | Intrusive, interrupt workflow | Static help content, user-triggered |
| **Help chatbot/AI assistant** | Scope creep, maintenance burden | Static documentation |
| **Video tutorials embedded** | Performance impact, hosting complexity | Link to external videos if needed |
| **Help notification badges** | Annoying, patronizing for expert users | Clean UI, discoverable help icons |
| **"Did you know" tips** | Interrupt workflow, feel spammy | User-triggered help only |
| **Required tutorials on first use** | Hostile to experienced users | Let users explore freely |
| **Help analytics/tracking** | Privacy concern, unnecessary complexity | No tracking |
| **Multi-language help** | Maintenance burden | English only for v1 |

## Feature Dependencies

### Layers Panel Dependencies

```
Existing Features Required:
- elements array (store/elementsSlice.ts) - EXISTS
- selectedIds (store/elementsSlice.ts) - EXISTS
- visible property (types/elements/base.ts) - EXISTS
- locked property (types/elements/base.ts) - EXISTS
- parentId property (types/elements/base.ts) - EXISTS
- z-order actions (moveToFront, moveBackward, etc.) - EXISTS
- @dnd-kit library - EXISTS (used in Canvas)

New Dependencies:
- Drag-to-reorder needs @dnd-kit/sortable (may need to add)
```

### Help System Dependencies

```
Existing Features Required:
- PropertySection component - EXISTS
- PropertyPanel layout - EXISTS
- HelpPanel component (keyboard shortcuts) - EXISTS

New Dependencies:
- Help content data structure (static JSON/TS)
- Optional: Tooltip component if native title insufficient
```

## MVP Recommendation

For v1.9 MVP, prioritize:

### Layers Panel MVP

1. **Layer list with element names** (table stakes)
2. **Selection sync** (table stakes)
3. **Visibility toggle** (table stakes)
4. **Lock toggle** (table stakes)
5. **Z-order visual representation** (table stakes)
6. **Drag-to-reorder** (table stakes)
7. **Parent-child hierarchy display** (differentiator - natural extension)
8. **Collapse/expand for containers** (differentiator - UX polish)

### Help System MVP

1. **Help icon next to property sections** (table stakes)
2. **Tooltip on hover** (table stakes)
3. **Help content per section** (table stakes)
4. **Element-specific help** (differentiator - high value, low complexity)

### Defer to Post-MVP

**Layers Panel:**
- Layer thumbnails (High complexity, unclear benefit)
- Drag into containers to reparent (High complexity)
- Search/filter (Medium complexity, low priority for typical project size)

**Help System:**
- Rich HTML help panel (Medium complexity, start with tooltips)
- Animated examples (High complexity)
- "What's this?" mode (High complexity)

## Implementation Notes

### Layers Panel Location

**Recommended:** Integrate into existing LeftPanel as third tab

```
Current tabs: [Elements] [Assets]
New tabs:     [Elements] [Assets] [Layers]
```

Rationale:
- Consistent with existing tab pattern
- No new panel/layout changes needed
- Layers naturally fit with element management

Alternative: Bottom panel or floating panel (not recommended - adds complexity)

### Help Icon Pattern

**Recommended:** Question mark icon in PropertySection header

```tsx
// PropertySection with optional help
<PropertySection title="Position & Size" helpKey="position-size">
```

Rationale:
- Follows industry standard (Adobe, Microsoft patterns)
- Unobtrusive - doesn't clutter UI
- Click/hover reveals tooltip

### Help Content Structure

```typescript
// Suggested structure
interface HelpContent {
  title: string        // Section name
  brief: string        // Tooltip text (under 130 chars)
  detailed?: string    // Expanded HTML content
  learnMore?: string   // URL to documentation
}

const helpContent: Record<string, HelpContent> = {
  'position-size': {
    title: 'Position & Size',
    brief: 'Set element position (X, Y) in pixels from top-left corner. Width and height control element dimensions.',
  },
  'identity': {
    title: 'Identity',
    brief: 'Name becomes the element ID in exported code. Parameter ID binds to JUCE audio parameters.',
  },
  // ... per section and per element type
}
```

## Existing Code to Leverage

### For Layers Panel

| Existing Code | Location | How to Use |
|---------------|----------|------------|
| Element selection | `store/elementsSlice.ts` | Reuse selectElement, toggleSelection |
| Z-order actions | `store/elementsSlice.ts` | Reuse moveToFront, moveBackward, etc. |
| DnD context | `App.tsx`, `CanvasStage.tsx` | Already using @dnd-kit |
| Inline editing | `AssetLibrary/InlineEditName.tsx` | Reuse for layer rename |
| Tab UI pattern | `LeftPanel.tsx` | Copy existing tabs implementation |

### For Help System

| Existing Code | Location | How to Use |
|---------------|----------|------------|
| PropertySection | `Properties/PropertySection.tsx` | Extend with help prop |
| HelpPanel | `Layout/HelpPanel.tsx` | Reference for expandable pattern |
| Toast notifications | Throughout app | Similar pattern for help tooltips |

## Sources

### Layers Panel Research
- [Figma layers and selection](https://help.figma.com/hc/en-us/articles/360040449873-Select-layers-and-objects)
- [Figma layers sidebar](https://help.figma.com/hc/en-us/articles/360039831974-View-layers-and-pages-in-the-left-sidebar)
- [Photoshop layers panel](https://helpx.adobe.com/photoshop/desktop/create-manage-layers/get-started-layers/work-with-the-layers-panel.html)
- [Adobe Illustrator layers](https://helpx.adobe.com/illustrator/using/layers.html)
- [Adobe Illustrator lock/hide](https://helpx.adobe.com/my_ms/illustrator/using/locking-hiding-deleting-objects.html)
- [VectorStyler layers panel](https://www.vectorstyler.com/documentation/objects/layers/)
- [Drag-and-drop UX patterns](https://www.nngroup.com/articles/drag-drop/)
- [Adobe XD layers](https://helpx.adobe.com/xd/help/layers.html)
- [Wix layers panel](https://support.wix.com/en/article/wix-editor-using-the-layers-panel)
- [Photoshop group layers](https://helpx.adobe.com/photoshop/desktop/create-manage-layers/transform-manipulate-layers/group-and-ungroup-layers.html)

### Help System Research
- [Contextual help UX patterns](https://userpilot.com/blog/contextual-help/)
- [Tooltip best practices](https://userpilot.com/blog/tooltip-best-practices/)
- [Question mark icons meaning](https://smarticons.co/blog/understanding-the-meaning-of-question-mark-icons/)
- [LogRocket tooltip design](https://blog.logrocket.com/ux-design/designing-better-tooltips-improved-ux/)
- [GitLab contextual help pattern](https://design.gitlab.com/patterns/contextual-help/)
- [Intuit tooltip guidelines](https://contentdesign.intuit.com/product-and-ui/tooltips/)
- [Appcues tooltip patterns](https://www.appcues.com/blog/tooltips)
- [In-app help guide](https://www.docsie.io/blog/articles/10-key-factors-to-consider-when-building-context-sensitive-help-in-app-guidance/)
- [Inline help box pattern](https://ui-patterns.com/patterns/InlineHelpBox)
- [Chameleon contextual help](https://www.chameleon.io/blog/contextual-help-ux)

### Design Tools Research
- [Figma 2025 features](https://theinfluenceagency.com/blog/figma-new-features-2025)
- [Figma UI3 redesign](https://www.figma.com/blog/config-2025-recap/)
- [Adobe InDesign layers](https://helpx.adobe.com/indesign/using/layers.html)
- [Procreate layers organize](https://help.procreate.com/procreate/handbook/layers/layers-organize)
