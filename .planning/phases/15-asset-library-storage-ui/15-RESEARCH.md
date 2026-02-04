# Phase 15: Asset Library Storage & UI - Research

**Researched:** 2026-01-25
**Domain:** React asset management with Zustand state, drag-and-drop, file upload
**Confidence:** HIGH

## Summary

This phase implements a complete asset library system for SVG files using established React patterns. The research covers normalized state management with Zustand slices, file upload with react-dropzone (already in dependencies), drag-from-library-to-canvas with dnd-kit (already in dependencies), and UI patterns for browsing, searching, and organizing assets.

The standard approach uses a normalized Zustand slice storing assets by ID with lookup maps for categories and usage tracking. File uploads use react-dropzone with URL.createObjectURL for previews (with proper cleanup via revokeObjectURL). Drag-to-canvas leverages existing dnd-kit infrastructure, extending the current DndContext to handle library-to-canvas drops. Search uses debounced input (300ms standard) and inline editing follows click-to-edit patterns with separate view/edit modes.

User decisions from CONTEXT.md constrain the research: grid layout with 96px thumbnails, single-file import with modal dialog, both fixed and custom categories with multi-tag support, and usage tracking for delete warnings. These decisions eliminate alternative approaches, focusing research on implementation details.

**Primary recommendation:** Use Zustand slice pattern matching existing elementsSlice structure, with normalized storage (assets by ID), computed usage counts via useMemo, and integration with existing dnd-kit DndContext for library-to-canvas dragging.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0.10 | Asset state management | Already used for all app state, slice pattern established |
| react-dropzone | 14.3.8 | File upload with drag-drop | Already in dependencies, standard for file uploads in React |
| @dnd-kit/core | 6.3.1 | Drag from library to canvas | Already in dependencies, used for element dragging |
| react-hot-toast | 2.6.0 | User notifications (errors, confirmations) | Already in dependencies from Phase 14 |
| DOMPurify (isomorphic-dompurify) | 2.35.0 | SVG sanitization | Already integrated in Phase 14, SafeSVG component ready |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | - (built-in via crypto.randomUUID) | Generate unique asset IDs | Use crypto.randomUUID() for asset ID generation (faster, built-in) |
| URL API | Built-in Web API | File preview before import | Use createObjectURL for SVG preview, revoke after use |
| useMemo | React built-in | Computed usage counts | Use for deriving usage counts from elements array |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Redux Toolkit with createEntityAdapter | Redux provides built-in normalization but adds complexity; Zustand matches existing architecture |
| react-dropzone | Native input[type=file] | Dropzone provides better UX with drag-drop, already in dependencies |
| @dnd-kit | react-dnd | dnd-kit already integrated, better performance, modern API |
| crypto.randomUUID() | nanoid | nanoid is 130 bytes smaller but crypto.randomUUID is 4x faster and built-in |

**Installation:**
```bash
# No new dependencies required - all libraries already installed
# Existing: zustand, react-dropzone, @dnd-kit/core, react-hot-toast, isomorphic-dompurify
```

## Architecture Patterns

### Recommended State Structure
```typescript
// AssetsSlice follows existing elementsSlice pattern
interface Asset {
  id: string                    // crypto.randomUUID()
  name: string                  // User-editable name
  svgContent: string            // Sanitized SVG markup
  categories: string[]          // Multi-category tags
  fileSize: number              // In bytes
  elementCount: number          // Number of SVG child elements
  createdAt: number             // Timestamp
  thumbnailDataUrl?: string     // Optional: pre-rendered thumbnail
}

interface AssetsSlice {
  // Normalized state
  assets: Asset[]

  // Actions
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void
  removeAsset: (id: string) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  getAsset: (id: string) => Asset | undefined
  getAssetsByCategory: (category: string) => Asset[]
  getAssetUsageCount: (assetId: string) => number
}
```

### Pattern 1: Normalized Asset Storage
**What:** Store assets as flat array, derive category groupings on-the-fly
**When to use:** Always for asset libraries (standard Redux/Zustand pattern)
**Why:** Avoids data duplication for multi-category assets, single source of truth
**Example:**
```typescript
// Source: Zustand docs + Redux normalization patterns
const createAssetsSlice: StateCreator<AssetsSlice, [], [], AssetsSlice> = (set, get) => ({
  assets: [],

  addAsset: (assetData) => set((state) => ({
    assets: [...state.assets, {
      ...assetData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }]
  })),

  getAssetsByCategory: (category) => {
    return get().assets.filter(asset => asset.categories.includes(category))
  },

  // Computed usage count - called from component with useMemo
  getAssetUsageCount: (assetId) => {
    const elements = get().elements // Cross-slice access
    return elements.filter(el =>
      el.type === 'image' && el.assetId === assetId
    ).length
  }
})
```

### Pattern 2: File Upload with Preview
**What:** react-dropzone + URL.createObjectURL for preview, sanitize before storing
**When to use:** Single-file SVG import with preview dialog
**Example:**
```typescript
// Source: react-dropzone official docs + MDN Web APIs
import { useDropzone } from 'react-dropzone'
import { useEffect, useState } from 'react'
import { sanitizeSVG } from '../lib/svg-sanitizer'

function ImportDialog() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [svgContent, setSvgContent] = useState<string>('')

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false,
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Read file content
      const text = await file.text()
      const sanitized = sanitizeSVG(text) // Use existing Phase 14 sanitization
      setSvgContent(sanitized)
    }
  })

  // CRITICAL: Cleanup object URL to prevent memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {previewUrl && <SafeSVG content={svgContent} />}
    </div>
  )
}
```

### Pattern 3: Drag from Library to Canvas
**What:** Extend existing DndContext to handle library items as draggable sources
**When to use:** Dragging asset from library creates new element on canvas
**Example:**
```typescript
// Source: dnd-kit official docs + GitHub discussions
import { useDraggable } from '@dnd-kit/core'

function AssetThumbnail({ asset }: { asset: Asset }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `asset-${asset.id}`,
    data: { type: 'library-asset', assetId: asset.id }
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <SafeSVG content={asset.svgContent} />
    </div>
  )
}

// In parent DndContext onDragEnd handler
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event

  if (active.data.current?.type === 'library-asset' && over?.id === 'canvas') {
    const assetId = active.data.current.assetId
    // Create new image element referencing this asset
    addElement({
      type: 'image',
      assetId: assetId,
      // Position calculated from drop coordinates
    })
  }
}
```

### Pattern 4: Debounced Search
**What:** useCallback + setTimeout for search input with 300ms delay
**When to use:** Real-time search filtering (standard timing for desktop)
**Example:**
```typescript
// Source: React debouncing best practices 2026
import { useState, useCallback, useRef } from 'react'

function AssetSearch({ onSearch }: { onSearch: (term: string) => void }) {
  const [inputValue, setInputValue] = useState('')
  const timeoutRef = useRef<number>()

  const debouncedSearch = useCallback((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value)
    }, 300) // Standard 300ms for desktop
  }, [onSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    debouncedSearch(value)
  }

  return <input value={inputValue} onChange={handleChange} />
}
```

### Pattern 5: Inline Edit (Click-to-Rename)
**What:** Two-mode component (view/edit) with click trigger and Enter/Escape handling
**When to use:** Asset renaming without modal dialog
**Example:**
```typescript
// Source: React inline edit patterns 2026
function InlineEditName({ value, onSave }: { value: string, onSave: (newValue: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleSave = () => {
    onSave(editValue.trim() || value) // Prevent empty names
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
      />
    )
  }

  return (
    <span onClick={() => setIsEditing(true)} className="cursor-pointer hover:underline">
      {value}
    </span>
  )
}
```

### Pattern 6: Usage Tracking with Derived State
**What:** Compute usage counts from elements array using useMemo
**When to use:** Showing "used by X elements" and preventing deletion of in-use assets
**Example:**
```typescript
// Source: React computed state patterns 2026
function useAssetUsageCount(assetId: string) {
  const elements = useStore(state => state.elements)

  // Only recompute when elements array changes
  const usageCount = useMemo(() => {
    return elements.filter(el =>
      el.type === 'image' && el.assetId === assetId
    ).length
  }, [elements, assetId])

  const usedByElements = useMemo(() => {
    return elements
      .filter(el => el.type === 'image' && el.assetId === assetId)
      .map(el => el.name || el.id)
  }, [elements, assetId])

  return { usageCount, usedByElements }
}

function DeleteConfirmation({ asset }: { asset: Asset }) {
  const { usageCount, usedByElements } = useAssetUsageCount(asset.id)

  if (usageCount > 0) {
    return (
      <div>
        Warning: This asset is used by {usageCount} element(s):
        <ul>{usedByElements.map(name => <li key={name}>{name}</li>)}</ul>
        Delete anyway?
      </div>
    )
  }

  return <div>Delete "{asset.name}"?</div>
}
```

### Anti-Patterns to Avoid
- **Storing category groups separately:** Creates data duplication for multi-category assets, use filtered views instead
- **Forgetting URL.revokeObjectURL:** Memory leaks accumulate in long-running sessions, always cleanup in useEffect
- **Storing computed values in state:** Usage counts should be derived, not stored (source of truth is elements array)
- **Using nanoid() for React keys:** Only use stable IDs as keys, not randomly generated values on each render
- **Direct state mutation:** Zustand requires immutable updates, always return new arrays/objects

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload UI | Custom drag-drop zone | react-dropzone (already in deps) | Handles edge cases: multiple files, file type validation, drag events, mobile support |
| Drag-and-drop | Custom mouse event handlers | @dnd-kit/core (already in deps) | Handles touch/pointer/keyboard, collision detection, accessibility, transform calculations |
| Unique ID generation | `Date.now() + Math.random()` | crypto.randomUUID() | Collision-resistant, cryptographically secure, built-in, 4x faster than nanoid |
| SVG sanitization | Regex-based cleaning | DOMPurify (already integrated) | Handles XSS vectors, script injection, external resource loading (Phase 14 complete) |
| Debouncing | Custom setTimeout logic | useCallback + useRef pattern | Proper cleanup, avoids memory leaks, handles component unmount |
| Toast notifications | Custom notification system | react-hot-toast (already in deps) | Accessibility, stacking, dismissal, animations, mobile support (Phase 14 complete) |

**Key insight:** All required libraries are already in dependencies from previous phases. The temptation is to write custom solutions for "simple" tasks like debouncing or ID generation, but the proven patterns handle edge cases (component unmount, collision resistance, accessibility) that custom code often misses.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Object URLs
**What goes wrong:** Creating blob URLs with URL.createObjectURL but never calling revokeObjectURL causes memory to accumulate, eventually crashing the browser in long-running sessions.
**Why it happens:** Object URLs persist until document unload by default. Each createObjectURL call creates a new URL, even for the same blob.
**How to avoid:** Always pair createObjectURL with revokeObjectURL in useEffect cleanup. Revoke when preview is no longer needed (dialog closes, new file selected).
**Warning signs:** Browser memory usage steadily increasing, especially after repeated imports.

### Pitfall 2: Premature Object URL Revocation
**What goes wrong:** Calling revokeObjectURL immediately after setting preview makes image unloadable. Users can't right-click to save or inspect.
**Why it happens:** Documentation shows worker example where immediate revoke is safe, but images need the URL to remain valid while displayed.
**How to avoid:** Only revoke when preview is no longer accessible: dialog closes, component unmounts, or new file replaces current preview.
**Warning signs:** Preview shows broken image icon, console errors about invalid blob URLs.

### Pitfall 3: Category State Duplication
**What goes wrong:** Storing assets in separate arrays per category (logoAssets, iconAssets, etc.) creates data duplication nightmares when asset has multiple categories.
**Why it happens:** Seems simpler to render category sections if data is pre-grouped. Redux Toolkit's createEntityAdapter encourages normalization, but Zustand doesn't provide guidance.
**How to avoid:** Store single flat assets array, filter by category on-the-fly in render (cheap operation). Use useMemo if filtering becomes expensive.
**Warning signs:** Renaming an asset requires updating multiple arrays, categories array and grouped storage get out of sync.

### Pitfall 4: Storing Computed Usage Counts
**What goes wrong:** Adding usageCount field to Asset interface and updating it whenever elements change creates synchronization bugs (count out of sync with reality).
**Why it happens:** Trying to optimize renders by pre-computing values. Feels like "caching" the calculation.
**How to avoid:** Derive usage counts in components using useMemo from elements array. Single source of truth. Use getAssetUsageCount in slice for imperatives, useMemo in components for rendering.
**Warning signs:** Delete confirmation shows wrong count, usage badges don't update when elements change.

### Pitfall 5: dnd-kit Coordinate Confusion
**What goes wrong:** Assuming event.active.rect gives final drop position, but these values are null in onDragEnd (known dnd-kit limitation).
**Why it happens:** Documentation shows rect properties, but they're cleared before onDragEnd fires for draggable items.
**How to avoid:** Track coordinates in onDragMove, use last known position in onDragEnd. Or use event.over.rect (drop target) and calculate relative position.
**Warning signs:** TypeError accessing null rect properties, elements created at wrong positions on canvas.

### Pitfall 6: SVG Element Count Performance
**What goes wrong:** Counting SVG child elements with getElementsByTagName('*') on every keystroke causes UI lag for complex SVGs.
**Why it happens:** Import dialog shows element count in real-time as validation feedback.
**How to avoid:** Count once when file is loaded, store in temporary state. Only recount if new file selected. Complex SVGs (charts, illustrations) can have 1000+ elements.
**Warning signs:** Dialog input lag, browser freezes briefly when previewing SVG.

### Pitfall 7: Search Debounce Cleanup
**What goes wrong:** Not clearing timeout on component unmount causes setState on unmounted component warnings, potential memory leaks.
**Why it happens:** setTimeout callback still fires even after component unmounts if timeout wasn't cleared.
**How to avoid:** Store timeout ID in useRef, clear in useEffect cleanup function. Always clear previous timeout before setting new one.
**Warning signs:** Console warnings about setState on unmounted component, search behaves erratically.

## Code Examples

Verified patterns from official sources:

### Zustand Slice Integration
```typescript
// Source: Zustand official docs - Slices Pattern
// https://zustand.docs.pmnd.rs/guides/slices-pattern
import { StateCreator } from 'zustand'

export interface AssetsSlice {
  assets: Asset[]
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void
  removeAsset: (id: string) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  getAsset: (id: string) => Asset | undefined
  getAssetsByCategory: (category: string) => Asset[]
}

export const createAssetsSlice: StateCreator<AssetsSlice, [], [], AssetsSlice> = (set, get) => ({
  assets: [],

  addAsset: (assetData) => set((state) => ({
    assets: [...state.assets, {
      ...assetData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }]
  })),

  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter(asset => asset.id !== id)
  })),

  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map(asset =>
      asset.id === id ? { ...asset, ...updates } : asset
    )
  })),

  getAsset: (id) => {
    return get().assets.find(asset => asset.id === id)
  },

  getAssetsByCategory: (category) => {
    return get().assets.filter(asset => asset.categories.includes(category))
  }
})

// Combine with existing slices in store/index.ts
export type Store = CanvasSlice & ViewportSlice & ElementsSlice & TemplateSlice & AssetsSlice

export const useStore = create<Store>()(
  temporal(
    (...a) => ({
      ...createCanvasSlice(...a),
      ...createViewportSlice(...a),
      ...createElementsSlice(...a),
      ...createTemplateSlice(...a),
      ...createAssetsSlice(...a), // Add new slice
    }),
    { /* temporal config */ }
  )
)
```

### SVG File Size and Element Count
```typescript
// Source: MDN Web APIs - File API, DOM childElementCount
// https://developer.mozilla.org/en-US/docs/Web/API/File
function analyzeSVG(svgContent: string, file: File) {
  const fileSize = file.size // In bytes

  // Parse SVG to count elements
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Count all descendant elements (not just direct children)
  const elementCount = doc.getElementsByTagName('*').length

  return { fileSize, elementCount }
}
```

### Cross-Slice Usage Tracking
```typescript
// Source: Zustand docs - accessing other slice's state
// Pattern from existing project: elementsSlice accesses other state
export const createAssetsSlice: StateCreator<Store, [], [], AssetsSlice> = (set, get) => ({
  // ... other methods

  getAssetUsageCount: (assetId: string) => {
    // Cross-slice access - get() returns full store
    const elements = get().elements
    return elements.filter(el =>
      el.type === 'image' && el.assetId === assetId
    ).length
  },

  canDeleteAsset: (assetId: string) => {
    const usageCount = get().getAssetUsageCount(assetId)
    return usageCount === 0
  }
})
```

### Tab Switching UI (User's Discretion)
```typescript
// Source: React useState patterns for UI state
// Note: User specified tab switching but not exact mechanism
// Recommendation: Simple state-based tabs (no routing needed for left panel)
function LeftPanel() {
  const [activeTab, setActiveTab] = useState<'palette' | 'assets'>('palette')

  return (
    <div className="flex flex-col h-full">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('palette')}
          className={activeTab === 'palette' ? 'active' : ''}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={activeTab === 'assets' ? 'active' : ''}
        >
          Assets
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'palette' && <Palette />}
        {activeTab === 'assets' && <AssetLibrary />}
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux with manual normalization | Zustand with manual normalization | 2023-2024 | Zustand simpler but lacks Redux Toolkit's createEntityAdapter |
| react-dnd | @dnd-kit | 2021-2022 | Better performance, smaller bundle, modern API, better TypeScript |
| Math.random() IDs | crypto.randomUUID() | 2023 (widespread browser support) | Built-in, faster, collision-resistant, no dependencies |
| FileReader.readAsDataURL for previews | URL.createObjectURL | 2020+ | Faster (no base64 encoding), less memory, synchronous |
| Storing computed values | Deriving with useMemo | Always recommended | Avoids sync bugs, single source of truth, React 18 optimizations |

**Deprecated/outdated:**
- **nanoid for IDs:** Still popular but crypto.randomUUID() is 4x faster, built-in, and widely supported (2026)
- **FileReader for preview:** URL.createObjectURL is faster and more efficient for local file previews
- **Redux Toolkit's createEntityAdapter:** Still excellent for Redux, but project uses Zustand (manual normalization required)
- **react-dnd:** Replaced by @dnd-kit in modern projects (better performance, accessibility, smaller bundle)

## Open Questions

Things that couldn't be fully resolved:

1. **Thumbnail rendering strategy**
   - What we know: User specified ~96px thumbnails, aspect ratio handling is Claude's discretion
   - What's unclear: Whether to pre-render thumbnails as data URLs or render SVG on-the-fly
   - Recommendation: Render SafeSVG on-the-fly (simpler, always current, SVG already sanitized). Consider pre-rendering if performance becomes issue with many assets (100+).

2. **Category persistence**
   - What we know: User wants both fixed and custom categories
   - What's unclear: Where to store custom category definitions (separate slice field, or derive from all unique category tags?)
   - Recommendation: Store predefinedCategories array in AssetsSlice state, allow users to add. Uncategorized assets shown in dedicated section.

3. **Empty state messaging**
   - What we know: User specified this is Claude's discretion
   - What's unclear: Exact messaging and visual design
   - Recommendation: Simple, helpful message: "No assets yet. Click 'Import SVG' to add your first asset." Include visual icon (upload cloud).

4. **Search filter case sensitivity**
   - What we know: User wants search box filtering by name
   - What's unclear: Case-sensitive or case-insensitive matching?
   - Recommendation: Case-insensitive (standard UX expectation). Use `.toLowerCase()` comparison.

5. **Confirmation dialog component choice**
   - What we know: User specified dialog styling is Claude's discretion
   - What's unclear: Whether to use native window.confirm, custom modal, or existing dialog pattern
   - Recommendation: Custom modal matching project's visual style (consistent with NewProjectDialog, TemplateImporter patterns). More control over UX (showing usage details).

## Sources

### Primary (HIGH confidence)
- Zustand Official Docs - Slices Pattern: https://zustand.docs.pmnd.rs/guides/slices-pattern
- Zustand GitHub - Slices Pattern: https://github.com/pmndrs/zustand/blob/main/docs/guides/slices-pattern.md
- dnd-kit Official Docs: https://docs.dndkit.com
- react-dropzone Official Docs: https://react-dropzone.org/
- MDN Web APIs - URL.createObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- MDN Web APIs - URL.revokeObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static
- crypto.randomUUID() MDN: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID

### Secondary (MEDIUM confidence)
- React debouncing best practices (verified across multiple sources): 300ms standard timing
- dnd-kit GitHub Discussion #236 (coordinate handling): Workaround patterns for canvas positioning
- React inline edit patterns (verified across multiple tutorials): View/edit mode pattern
- React computed state patterns (official React docs): useMemo for derived values

### Tertiary (LOW confidence - marked for validation)
- Specific debounce timing (300ms): Multiple sources agree, but optimal timing depends on use case
- SVG thumbnail rendering performance threshold (100+ assets): No official benchmark, based on general DOM performance guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in dependencies, versions confirmed from package.json
- Architecture: HIGH - Patterns verified from official Zustand and dnd-kit docs, matches existing project structure
- Pitfalls: HIGH - Verified from official MDN docs (object URL lifecycle), dnd-kit GitHub issues (coordinate handling), React best practices

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable domain, established patterns)
